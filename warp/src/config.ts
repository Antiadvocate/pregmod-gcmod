/** Browser-side config. The key lives in localStorage on THIS device and is sent to OpenRouter
 *  (or to your own machine) and nowhere else. There is no server in this build to hold a secret. */
const KEY = "warp-openrouter-key";
const LOCAL = "warp-local-endpoint";

export function getApiKey(): string { return localStorage.getItem(KEY) ?? ""; }
export function setApiKey(k: string): void { k ? localStorage.setItem(KEY, k.trim()) : localStorage.removeItem(KEY); }
export function hasApiKey(): boolean { return !!getApiKey(); }

/** A model id prefixed `local/` routes to an OpenAI-compatible server on your own machine —
 *  KoboldCpp, llama-server, LM Studio, Ollama. That prefix is the whole routing mechanism, so any
 *  one slot can be local while the rest stay in the cloud. The useful split is a local narrator
 *  (the long creative call) with a cloud bookkeeper (the strict-JSON one small models are worst at). */
export const LOCAL_PREFIX = "local/";

export interface LocalEndpoint { url: string; key?: string; max_output?: number; top_p?: number; loop_guard?: number }

export function getLocalEndpoint(): LocalEndpoint | null {
  try {
    const raw = localStorage.getItem(LOCAL);
    if (!raw) return null;
    const c = JSON.parse(raw) as LocalEndpoint;
    return c?.url ? { ...c, url: c.url.replace(/\/+$/, "") } : null;
  } catch { return null; }
}
export function setLocalEndpoint(c: LocalEndpoint | null): void {
  try { c?.url ? localStorage.setItem(LOCAL, JSON.stringify({ ...c, url: c.url.trim().replace(/\/+$/, "") })) : localStorage.removeItem(LOCAL); }
  catch { /* quota */ }
}
export function isLocalModel(id: string): boolean { return !!id && id.startsWith(LOCAL_PREFIX); }
export function localModelId(id: string): string { return isLocalModel(id) ? id.slice(LOCAL_PREFIX.length) || "default" : id; }

/** Whether the engine may call a model at all. Everything in Warp works with this false; the
 *  prose is what you lose, not the game. */
export function modelsAvailable(): boolean { return hasApiKey() || !!getLocalEndpoint(); }
