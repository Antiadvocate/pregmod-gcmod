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
import { getApiKey, getLocalEndpoint, isLocalModel, localModelId } from "./config";

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
}

export async function call(opts: CallOptions): Promise<LLMResult> {
  const chain = [opts.model, opts.fallback].filter(Boolean) as string[];
  let lastErr = "";
  for (const model of chain) {
    try {
      return await once({ ...opts, model });
    } catch (e) {
      lastErr = String((e as Error)?.message ?? e);
      logErr(model, e);
    }
  }
  return { ok: false, text: "", usage: { prompt_tokens: 0, completion_tokens: 0 }, model: chain[0] ?? "", error: lastErr };
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

  const res = await fetch(t.url, { method: "POST", headers: t.headers, body: JSON.stringify(body), signal: opts.signal });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);

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
