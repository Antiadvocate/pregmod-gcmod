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

/* ── THE DIFFUSION MODEL ON YOUR OWN MACHINE ──────────────────────────────────────────────────
 *
 *  Same convention as the text endpoint, one slot down: ComfyUI on 8188 or an A1111-style WebUI on
 *  7860, and an `image_model` id prefixed `local/` routes there.
 *
 *  This is the configuration this game actually wants. The pictures it needs are explicit, so a
 *  hosted image API is not merely expensive here — it will refuse most of them. On your own GPU
 *  it is free and unrefusable, which is what makes a picture per turn a reasonable default rather
 *  than a button you remember to press.
 *
 *  The CORS flag is not optional. A browser calling a local server that has not been told to allow
 *  this page gets a failure indistinguishable from the server being down:
 *    ComfyUI:  python main.py --enable-cors-header '*'
 *    A1111:    --api --cors-allow-origins=<this page's origin>
 */
const LOCAL_IMAGE = "warp-local-image";

export interface LocalImageEndpoint {
  /** No trailing slash. ComfyUI http://127.0.0.1:8188 — A1111 http://127.0.0.1:7860 */
  url: string;
  backend: "comfy" | "a1111";
  key?: string;
  /** ComfyUI only: the workflow in API format (Workflow → Export (API)) with %tokens% where the
   *  per-run values go. Blank uses a plain txt2img graph, which needs only a checkpoint. */
  workflow?: string;
  checkpoint?: string;
  steps?: number;
  cfg?: number;
  sampler?: string;
  scheduler?: string;
  width?: number;
  height?: number;
  negative?: string;
  timeout_s?: number;
  /** Longest edge kept when the picture is stored in the save. */
  store_max_px?: number;
  /** SD1.5, SDXL and Pony parse comma-separated tags and stop attending past about seventy tokens;
   *  Flux, SD3 and anything with a T5 encoder read sentences. This picks which is built. */
  prompt_style?: "natural" | "tags";
  /** Hold a scene's seed steady so one room keeps its framing across a dozen turns. */
  lock_seed?: boolean;
  /** Paint the moment after every scene turn, automatically. Free on your own GPU. */
  auto_scene?: boolean;
}

export const LOCAL_IMAGE_DEFAULTS = {
  steps: 25, cfg: 5, sampler: "euler", scheduler: "normal", timeout_s: 240, store_max_px: 1280,
} as const;

export function getLocalImage(): LocalImageEndpoint | null {
  try {
    const raw = localStorage.getItem(LOCAL_IMAGE);
    if (!raw) return null;
    const c = JSON.parse(raw) as LocalImageEndpoint;
    if (!c?.url) return null;
    return { ...c, backend: c.backend === "a1111" ? "a1111" : "comfy", url: c.url.replace(/\/+$/, "") };
  } catch { return null; }
}

export function setLocalImage(c: LocalImageEndpoint | null): void {
  try {
    if (c?.url) localStorage.setItem(LOCAL_IMAGE, JSON.stringify({ ...c, url: c.url.trim().replace(/\/+$/, "") }));
    else localStorage.removeItem(LOCAL_IMAGE);
  } catch { /* quota */ }
}

export function hasLocalImage(): boolean { return !!getLocalImage(); }

/** Whether the engine may call a model at all. Everything in Warp works with this false; the
 *  prose is what you lose, not the game. */
export function modelsAvailable(): boolean { return hasApiKey() || !!getLocalEndpoint(); }
