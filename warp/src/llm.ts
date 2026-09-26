/**
 * THE MODEL CLIENT — OpenRouter, or your own machine, from the browser.
 *
 * Three things this does that a naive fetch does not, all of them learned the hard way in Weft:
 *
 *   · IT FALLS BACK. A narrator model that 429s or times out costs you the turn, so every call
 *     carries a fallback slot and reports which one answered.
 *   · IT STRIPS THINKING. A local reasoning model writes `<think>…</think>` straight into content,
 *     and without this the deliberation lands on the page as prose, gets stored as the turn, and is
 *     then replayed to the model as an example of how it writes.
 *   · IT NEVER THROWS AT THE CALLER. Every entry point returns a result with `ok: false` instead,
 *     because the engine's contract is that a model failure degrades one pass for one turn and
 *     never takes the week with it.
 */
import { getApiKey, getLocalEndpoint, getThinking, isLocalModel, localModelId } from "./config";

const OR_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface Usage { prompt_tokens: number; completion_tokens: number; cost?: number }
export interface LLMResult { ok: boolean; text: string; usage: Usage; model: string; error?: string }

export const llmErrors: { at: number; model: string; message: string }[] = [];
function logErr(model: string, e: unknown): void {
  llmErrors.push({ at: Date.now(), model, message: String((e as Error)?.message ?? e).slice(0, 300) });
  if (llmErrors.length > 20) llmErrors.shift();
}

const REASON_TAGS = ["think", "thinking", "analysis", "reasoning", "thought", "scratchpad", "reflection"];
const OPEN_RE = new RegExp(`<(${REASON_TAGS.join("|")})\\b[^>]{0,40}>`, "i");

export function stripThinking(text: string): string {
  if (!/<\/?[a-z]/i.test(text)) return text;
  let out = text;
  for (const tag of REASON_TAGS) {
    out = out.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, "gi"), "");
  }
  const open = OPEN_RE.exec(out);
  if (open) out = out.slice(0, open.index);   // unterminated block: keep what came before it
  return out.trim() || text;
}

interface Target { url: string; headers: Record<string, string>; model: string; local: boolean }

function resolveTarget(model: string): Target {
  if (!isLocalModel(model)) {
    const key = getApiKey();
    if (!key) throw new Error("No model key set — open Settings and paste an OpenRouter key, or point Warp at a local server.");
    return {
      url: OR_URL, model, local: false,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "HTTP-Referer": location.origin, "X-Title": "Warp" },
    };
  }
  const ep = getLocalEndpoint();
  if (!ep) throw new Error(`"${model}" is a local model but no local endpoint is set.`);
  return {
    url: `${ep.url}/chat/completions`, model: localModelId(model), local: true,
    headers: { "Content-Type": "application/json", ...(ep.key ? { Authorization: `Bearer ${ep.key}` } : {}) },
  };
}

export interface CallOptions {
  system: string;
  user: string;
  model: string;
  fallback?: string;
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
  /** Called with each delta as it arrives. Streaming is used when this is present. */
  onDelta?: (chunk: string) => void;
  /** Called when streamed text is thrown away (a refusal) before the next model tries. */
  onReset?: () => void;
  /** Called before waiting out a rate limit, with how long and why. */
  onWait?: (ms: number, status: number) => void;
}

/** Anyone can listen for rate-limit waits (the shell shows a notice), without every caller
 *  having to pass a handler down. */
const waitListeners = new Set<(ms: number, status: number, model: string) => void>();
export function onRateWait(fn: (ms: number, status: number, model: string) => void): () => void { waitListeners.add(fn); return () => waitListeners.delete(fn); }

/** A model declining to write the scene instead of writing it. Checked on the opening of the reply
 *  only, so a character saying "I can't" in the middle of a scene is not mistaken for one. */
export function isRefusal(text: string): boolean {
  const head = text.trim().slice(0, 320).toLowerCase().replace(/[‘’]/g, "'");
  if (!head) return false;
  return /^(i'm sorry|i am sorry|sorry,|i apologi[sz]e|i can(?:'|no)t (?:write|help|create|continue|produce|assist|generate|comply|provide|do that|engage)|i won't (?:write|be able|create|continue|produce)|i'm (?:not able|unable) to|i am (?:not able|unable) to|i must decline|i will not|as an ai|i do not (?:feel comfortable|create|write|produce)|i don't (?:feel comfortable|create|write|produce))/.test(head)
    || /\b(?:i can(?:'|no)t|i won't|i'm unable to|i am unable to) (?:write|create|produce|generate|continue)[^.]{0,80}\b(?:explicit|sexual|non-?consensual|slave|minor|this (?:scene|content|request))/.test(head);
}

/** One call at a time, a moment apart. The game used to fire the week summary, the assistant's
 *  brief and the scene's bookkeeper at the same instant; bursts like that are what a provider
 *  rate-limits first. Queued calls still honour Stop. */
let queue: Promise<unknown> = Promise.resolve();
let lastStart = 0;
function queued<T>(fn: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  const run = async () => {
    if (signal?.aborted) throw Object.assign(new Error("aborted"), { name: "AbortError" });
    const gap = 400 - (Date.now() - lastStart);
    if (gap > 0) await sleep(gap, signal);
    lastStart = Date.now();
    return fn();
  };
  const p = queue.then(run, run);
  queue = p.catch(() => undefined);
  return p;
}

export async function call(opts: CallOptions): Promise<LLMResult> {
  const chain = [opts.model, opts.fallback].filter(Boolean) as string[];
  let lastErr = "";
  for (const model of chain) {
    try {
      const res = await queued(() => once({ ...opts, model }), opts.signal);
      // A refusal is not a scene. Try the fallback model; if that refuses too, the caller gets a
      // failure and uses the game's own written version instead of printing the refusal.
      if (!opts.json && isRefusal(res.text)) {
        lastErr = `${model} refused to write this`;
        logErr(model, new Error(`refused: ${res.text.slice(0, 160)}`));
        opts.onReset?.();
        continue;
      }
      return res;
    } catch (e) {
      // Stopped by the player: don't try the fallback, just stop.
      if (opts.signal?.aborted) return { ok: false, text: "", usage: { prompt_tokens: 0, completion_tokens: 0 }, model, error: "stopped" };
      lastErr = String((e as Error)?.message ?? e);
      logErr(model, e);
    }
  }
  return { ok: false, text: "", usage: { prompt_tokens: 0, completion_tokens: 0 }, model: chain[0] ?? "", error: lastErr };
}

/** How long to wait before retrying a 429/503: the server's Retry-After or reset header if it
 *  sent one, else 3s then 8s. Never more than 20s. */
function retryDelay(res: Response, tries: number): number {
  const after = Number(res.headers.get("retry-after"));
  if (after > 0) return Math.min(20000, after * 1000);
  const reset = Number(res.headers.get("x-ratelimit-reset"));
  if (reset > 1e12) return Math.min(20000, Math.max(1000, reset - Date.now()));
  return [3000, 8000, 15000][tries] ?? 15000;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((ok, fail) => {
    const id = setTimeout(ok, ms);
    signal?.addEventListener("abort", () => { clearTimeout(id); fail(Object.assign(new Error("aborted"), { name: "AbortError" })); }, { once: true });
  });
}

async function once(opts: CallOptions): Promise<LLMResult> {
  const t = resolveTarget(opts.model);
  const body: Record<string, unknown> = {
    model: t.model,
    messages: [{ role: "system", content: opts.system }, { role: "user", content: opts.user }],
    temperature: opts.temperature ?? (opts.json ? 0.2 : 0.9),
    max_tokens: opts.maxTokens ?? (opts.json ? 2400 : 1400),
    stream: !!opts.onDelta,
  };
  if (opts.json) body.response_format = { type: "json_object" };
  if (!t.local) body.usage = { include: true };
  // Thinking: OpenRouter takes a unified `reasoning` field; local servers (llama.cpp, KoboldCpp,
  // LM Studio) take the chat template's enable_thinking switch for Qwen-style models.
  const thinking = getThinking();
  if (thinking !== "model") {
    if (t.local) body.chat_template_kwargs = { enable_thinking: thinking !== "off" };
    else body.reasoning = thinking === "off" ? { enabled: false } : { effort: "low" };
  }

  const send = () => fetch(t.url, { method: "POST", headers: t.headers, body: JSON.stringify(body), signal: opts.signal });
  let res = await send();
  // A model or server that rejects the thinking switch gets the call again without it.
  if (!res.ok && res.status === 400 && (body.reasoning || body.chat_template_kwargs)) {
    delete body.reasoning; delete body.chat_template_kwargs;
    res = await send();
  }
  // Rate-limited or overloaded: wait what the server asks (up to 20 seconds) and try again, twice.
  for (let tries = 0; !res.ok && [429, 502, 503].includes(res.status) && tries < 3; tries++) {
    const wait = retryDelay(res, tries);
    opts.onWait?.(wait, res.status);
    for (const fn of waitListeners) fn(wait, res.status, opts.model);
    await sleep(wait, opts.signal);
    res = await send();
  }
  if (!res.ok) {
    const raw = await res.text();
    const detail = raw.slice(0, 300);
    if (res.status === 429) {
      // OpenRouter says which provider refused and passes on what that provider said.
      let who = "", said = "";
      try { const j = JSON.parse(raw); who = j?.error?.metadata?.provider_name ?? ""; said = String(j?.error?.metadata?.raw ?? j?.error?.message ?? "").slice(0, 200); } catch { said = detail; }
      const free = /:free\b/.test(opts.model);
      throw new Error(`rate limited on ${opts.model}${who ? ` by ${who}` : ""}: ${said || detail}. ${free
        ? "Free (:free) models on OpenRouter allow about 20 requests a minute and a small daily allowance. "
        : who ? `That's ${who}, the company running the model, saying it's busy, not your account. On the model's OpenRouter page you can see which other providers host it. ` : "The provider running this model is limiting requests right now, not your account. "}A fallback model in Settings takes over when this happens.`);
    }
    throw new Error(`${res.status} ${detail}`);
  }

  if (!opts.onDelta) {
    const json = await res.json();
    const text = String(json?.choices?.[0]?.message?.content ?? "");
    return {
      ok: true, text: opts.json ? text : stripThinking(text), model: opts.model,
      usage: {
        prompt_tokens: json?.usage?.prompt_tokens ?? 0,
        completion_tokens: json?.usage?.completion_tokens ?? 0,
        cost: json?.usage?.cost,
      },
    };
  }

  // streaming
  const reader = res.body?.getReader();
  if (!reader) throw new Error("no stream body");
  const dec = new TextDecoder();
  let buf = "", full = "", usage: Usage = { prompt_tokens: 0, completion_tokens: 0 };
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const j = JSON.parse(payload);
        const delta = j?.choices?.[0]?.delta?.content;
        if (delta) { full += delta; opts.onDelta!(delta); }
        if (j?.usage) usage = { prompt_tokens: j.usage.prompt_tokens ?? 0, completion_tokens: j.usage.completion_tokens ?? 0, cost: j.usage.cost };
      } catch { /* keep-alive comment or partial frame */ }
    }
  }
  return { ok: true, text: stripThinking(full), model: opts.model, usage };
}

/** Parse JSON out of a model response that may be wrapped in prose or a fence. Returns null rather
 *  than throwing: a malformed diff degrades one pass, never the turn. */
export function parseJson<T>(text: string): T | null {
  if (!text) return null;
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(body.slice(start, end + 1)) as T; } catch { /* fallthrough */ }
  // one repair pass: trailing commas are the single most common malformation
  try { return JSON.parse(body.slice(start, end + 1).replace(/,\s*([}\]])/g, "$1")) as T; } catch { return null; }
}

/* ── THE MODEL LIST ───────────────────────────────────────────────────────────────────────── */

export interface ModelInfo {
  id: string;
  name: string;
  /** USD per million tokens, input and output. Undefined for local models. */
  price_in?: number;
  price_out?: number;
  context?: number;
  local?: boolean;
  /** What it can produce: "text", "image". From OpenRouter's architecture.output_modalities. */
  output?: string[];
}

const MODEL_CACHE = "warp-openrouter-models-v2";
const DAY = 24 * 60 * 60 * 1000;

/** OpenRouter's public catalogue. It needs no key; cached for a day so Settings opens instantly. */
export async function listOpenRouterModels(force = false): Promise<ModelInfo[]> {
  if (!force) {
    try {
      const raw = localStorage.getItem(MODEL_CACHE);
      if (raw) {
        const c = JSON.parse(raw) as { at: number; models: ModelInfo[] };
        if (Date.now() - c.at < DAY && c.models?.length) return c.models;
      }
    } catch { /* no storage, or junk in it: fetch */ }
  }
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) throw new Error(`OpenRouter model list: ${res.status}`);
  const json = await res.json();
  const per = (x: unknown) => { const n = Number(x); return Number.isFinite(n) && n >= 0 ? +(n * 1e6).toFixed(3) : undefined; };
  const models: ModelInfo[] = (json?.data ?? [])
    .filter((m: { id?: string }) => m?.id)
    .map((m: { id: string; name?: string; context_length?: number; pricing?: { prompt?: string; completion?: string }; architecture?: { output_modalities?: string[] } }) => ({
      id: m.id, name: m.name ?? m.id, context: m.context_length,
      price_in: per(m.pricing?.prompt), price_out: per(m.pricing?.completion),
      output: m.architecture?.output_modalities,
    }))
    .sort((a: ModelInfo, b: ModelInfo) => a.id.localeCompare(b.id));
  try { localStorage.setItem(MODEL_CACHE, JSON.stringify({ at: Date.now(), models })); } catch { /* fine */ }
  return models;
}

/** Whatever the local OpenAI-compatible server says it has loaded, as `local/<id>`. */
export async function listLocalModels(): Promise<ModelInfo[]> {
  const ep = getLocalEndpoint();
  if (!ep) return [];
  const res = await fetch(`${ep.url}/models`, { headers: ep.key ? { Authorization: `Bearer ${ep.key}` } : {} });
  if (!res.ok) throw new Error(`local model list: ${res.status}`);
  const json = await res.json();
  return (json?.data ?? []).filter((m: { id?: string }) => m?.id)
    .map((m: { id: string }) => ({ id: `local/${m.id}`, name: `${m.id} (local)`, local: true }));
}
