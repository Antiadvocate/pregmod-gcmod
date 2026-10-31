/**
 * THE MODEL CALL — the thinking switch, the retry without it, and stopping.
 */
import { check } from "./harness.ts";

const store: Record<string, string> = {};
const g = globalThis as unknown as Record<string, unknown>;
const hadLS = "localStorage" in g, oldLS = g.localStorage, oldFetch = g.fetch, hadLoc = "location" in g, oldLoc = g.location;
g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
if (!hadLoc) g.location = { origin: "http://test" };
const { call } = await import("../src/llm.ts");
const { setApiKey, setThinking } = await import("../src/config.ts");
setApiKey("sk-test");

const bodies: Record<string, unknown>[] = [];
let reject400 = false;
g.fetch = async (_url: string, init: { body: string; signal?: AbortSignal }) => {
  const body = JSON.parse(init.body);
  bodies.push(body);
  if (init.signal?.aborted) throw Object.assign(new Error("aborted"), { name: "AbortError" });
  if (reject400 && body.reasoning) return new Response("reasoning not supported", { status: 400 });
  return new Response(JSON.stringify({ choices: [{ message: { content: "She looks up." } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200 });
};

setThinking("off");
await call({ system: "s", user: "u", model: "some/flash" });
check("thinking off asks OpenRouter not to reason", JSON.stringify(bodies.at(-1)?.reasoning) === JSON.stringify({ enabled: false }), bodies.at(-1)?.reasoning);
setThinking("low");
await call({ system: "s", user: "u", model: "some/flash" });
check("a little thinking asks for low effort", JSON.stringify(bodies.at(-1)?.reasoning) === JSON.stringify({ effort: "low" }));
setThinking("model");
await call({ system: "s", user: "u", model: "some/flash" });
check("the model's default sends nothing", bodies.at(-1)?.reasoning === undefined);
setThinking("off");
reject400 = true;
const n = bodies.length;
const res = await call({ system: "s", user: "u", model: "some/old" });
check("a model that rejects the switch is asked again without it", res.ok && bodies.length === n + 2 && bodies.at(-1)?.reasoning === undefined, bodies.slice(n));
reject400 = false;
const ctl = new AbortController(); ctl.abort();
const m = bodies.length;
const stopped = await call({ system: "s", user: "u", model: "some/flash", fallback: "other/model", signal: ctl.signal });
check("stopping doesn't fall through to the fallback model", !stopped.ok && stopped.error === "stopped" && bodies.length <= m + 1, bodies.length - m);

// Rate limits: wait and retry, then say what happened.
{
  let hits = 0;
  g.fetch = async () => { hits++; return hits < 3 ? new Response("slow down", { status: 429, headers: { "retry-after": "0.01" } }) : new Response(JSON.stringify({ choices: [{ message: { content: "Fine." } }] }), { status: 200 }); };
  const r1 = await call({ system: "s", user: "u", model: "mistral/small:free" });
  check("a rate limit is waited out and retried", r1.ok && hits === 3, { hits, r1 });
  hits = -10;
  const r2 = await call({ system: "s", user: "u", model: "mistral/small:free" });
  check("and when it keeps failing, it says why", !r2.ok && /rate limited on mistral\/small:free[\s\S]*Free \(:free\) models/.test(r2.error ?? ""), r2.error);
}

// Calls wait their turn: two at once reach the server one after the other.
{
  const starts: number[] = [];
  let open = 0, most = 0;
  g.fetch = async () => { starts.push(Date.now()); open++; most = Math.max(most, open); await new Promise((r) => setTimeout(r, 30)); open--; return new Response(JSON.stringify({ choices: [{ message: { content: "Fine." } }] }), { status: 200 }); };
  await Promise.all([call({ system: "s", user: "a", model: "m/x" }), call({ system: "s", user: "b", model: "m/x" })]);
  check("calls are sent one at a time, a moment apart", most === 1 && starts[1] - starts[0] >= 350, { most, gap: starts[1] - starts[0] });
  g.fetch = async () => new Response(JSON.stringify({ error: { message: "Provider returned error", metadata: { provider_name: "Mistral", raw: "Rate limit exceeded" } } }), { status: 429, headers: { "retry-after": "0.01" } });
  const r = await call({ system: "s", user: "u", model: "mistralai/mistral-small" });
  check("a paid model's rate limit names the provider refusing", /by Mistral: Rate limit exceeded[\s\S]*not your account/.test(r.error ?? ""), r.error);
}

// Stop works while a call is still waiting behind others, an urgent call goes first, and a dead
// request doesn't hold up everything behind it.
{
  let release: () => void = () => {};
  const order: string[] = [];
  g.fetch = async (_u: string, init: { body: string; signal?: AbortSignal }) => {
    const who = JSON.parse(init.body).messages[1].content as string;
    order.push(who);
    if (who === "slow") await new Promise<void>((r) => { release = r; init.signal?.addEventListener("abort", () => r()); });
    return new Response(JSON.stringify({ choices: [{ message: { content: who } }] }), { status: 200 });
  };
  const slow = call({ system: "s", user: "slow", model: "m/x" });
  await new Promise((r) => setTimeout(r, 20));
  const bg = call({ system: "s", user: "background", model: "m/x" });
  const ctl = new AbortController();
  const stuck = call({ system: "s", user: "waiting", model: "m/x", signal: ctl.signal, urgent: true });
  const first = call({ system: "s", user: "urgent", model: "m/x", urgent: true });
  const t0 = Date.now();
  ctl.abort();
  const r = await stuck;
  check("Stop ends a call still waiting its turn, at once", !r.ok && r.error === "stopped" && Date.now() - t0 < 200, [r, Date.now() - t0]);
  release();
  await Promise.all([slow, bg, first]);
  check("an urgent call goes ahead of the background, and a stopped one never goes", order.join() === "slow,urgent,background", order);
}

g.fetch = oldFetch;
if (hadLS) g.localStorage = oldLS; else delete g.localStorage;
if (!hadLoc) delete g.location; else g.location = oldLoc;

{
  // End week sat on "Running the week" with nothing to say what it was waiting on, and no way out.
  const g = globalThis as unknown as Record<string, unknown>;
  const store: Record<string, string> = {};
  const hadLS = "localStorage" in g, oldLS = g.localStorage, oldFetch = g.fetch, hadLoc = "location" in g, oldLoc = g.location;
  g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
  if (!hadLoc) g.location = { origin: "http://test" };
  const { setApiKey } = await import("../src/config.ts");
  const { call, nowCalling, stopAllCalls } = await import("../src/llm.ts");
  setApiKey("sk-test");
  // A provider that never answers.
  g.fetch = (_u: string, init: { signal: AbortSignal }) => new Promise((_ok, no) => init.signal.addEventListener("abort", () => no(Object.assign(new Error("aborted"), { name: "AbortError" }))));
  const hung = call({ system: "x", user: "y", model: "slow/model", tag: "the week" });
  const queued = call({ system: "x", user: "z", model: "slow/model", tag: "letters" });
  await new Promise((r) => setTimeout(r, 30));
  const c = nowCalling();
  check("while it waits, it says on what, and how many are behind it", c?.model === "slow/model" && c.tag === "the week" && c.queued === 1, c);
  stopAllCalls();
  const [a, b] = await Promise.all([hung, queued]);
  check("stopping ends the one in flight and the ones queued", !a.ok && a.error === "stopped" && !b.ok && b.error === "stopped", [a.error, b.error]);
  check("and nothing is left running", nowCalling() === null);
  g.fetch = oldFetch;
  if (hadLS) g.localStorage = oldLS; else delete g.localStorage;
  if (!hadLoc) delete g.location; else g.location = oldLoc;
}
