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
check("stopping doesn't fall through to the fallback model", !stopped.ok && stopped.error === "stopped" && bodies.length === m + 1, bodies.length - m);

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

g.fetch = oldFetch;
if (hadLS) g.localStorage = oldLS; else delete g.localStorage;
if (!hadLoc) delete g.location; else g.location = oldLoc;
