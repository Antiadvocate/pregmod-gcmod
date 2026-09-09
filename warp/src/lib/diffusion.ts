/**
 * PICTURES, ON YOUR OWN GPU.
 *
 * A game like this without images is a game with a hole in it, and the cloud path cannot fill that
 * hole — a hosted image API refuses most of what this game needs to draw, and charges for the rest
 * at a few cents a frame, which is why illustration in every game of this kind is a button you
 * remember to press rather than something the story simply does.
 *
 * On a local sampler it is free and unrefusable, so it can be automatic: a portrait per person that
 * holds still across a campaign, and a picture of the moment after every scene turn.
 *
 * ── HOW THE SAME WOMAN KEEPS COMING BACK ─────────────────────────────────────────────────────
 *
 * A diffusion model has no idea who anybody is. It has the words you give it, and it is far more
 * literal than the multimodal models a cloud path would use. Three things hold a cast still:
 *
 *   1. LOCKED WORDS. When a portrait is generated, the exact clause that drew it is written onto
 *      the person as `visual_signature` and reused verbatim forever after. Clothes, mood, belly and
 *      injuries are added per scene as separate clauses, so changing a shirt never changes a face.
 *      A description re-derived from live state each turn drifts a few words at a time and returns
 *      a stranger by the tenth picture. This is the single biggest lever.
 *   2. THE PORTRAITS THEMSELVES, as reference images. Put `%ref1%` in a ComfyUI workflow and the
 *      portraits of everyone in the scene are stitched into one sheet and wired in — Flux Kontext,
 *      IP-Adapter, PuLID and InstantID all take the same single image.
 *   3. HELD SEEDS. A person's portrait seed follows them; a scene's seed is derived from the place
 *      and who is in it, so one room keeps its framing and palette while the action changes.
 */
import { getLocalImage, LOCAL_IMAGE_DEFAULTS, type LocalImageEndpoint } from "../config";

export interface DiffusionRequest {
  prompt: string;
  /**
   * THE PAPER DOLL, AS THE CONTROL IMAGE. A PNG data URL of the vector figure in the exact pose
   * she is in, wired to `%pose%`.
   *
   * This is the answer to the problem every game of this kind has with generated art: the sampler
   * has no idea who anybody is, so asking twice gets two different women. Words alone do not fix
   * it — "olive skin, auburn hair, heavy breasts" describes a thousand people. But her body is
   * already drawn, at her real proportions, in her real pose, by a compositor that is deterministic
   * and reads the same state the prose does. Handing that render to ControlNet as line art pins the
   * silhouette, the proportions, the pose and the framing, and leaves the sampler with only the job
   * it is good at: skin, light and material.
   *
   * The consequence worth having is that the realistic pass INHERITS the rig. She is drawn kneeling
   * because the scene put her kneeling, not because somebody wrote "kneeling" in a prompt and hoped.
   */
  pose?: string;
  /** How far the sampler is allowed from the control render. Low keeps the doll's exact shape. */
  denoise?: number;
  negative?: string;
  seed?: number;
  aspect?: "portrait" | "landscape" | "square";
  refs?: string[];
  checkpoint?: string;
  onProgress?: (note: string) => void;
  signal?: AbortSignal;
}

export interface DiffusionResult { url: string; seed: number; took_ms: number }

/** SDXL and Flux are trained around a megapixel; asking a 512 square out of an SDXL checkpoint is
 *  what produces the melted faces people blame on their prompt. */
const SIZES = { portrait: { w: 832, h: 1216 }, landscape: { w: 1216, h: 832 }, square: { w: 1024, h: 1024 } } as const;

/** Text and watermarks are the two things every prompt would otherwise have to ask against in the
 *  positive, where naming a thing is half a vote for it. A sampler has no "not". */
export const DEFAULT_NEGATIVE =
  "text, watermark, signature, caption, letters, logo, ui, frame, border, split panel, collage, " +
  "extra limbs, extra fingers, deformed hands, mutated, disfigured, blurry, lowres, jpeg artifacts, child, underage";

function authHeaders(ep: LocalImageEndpoint): Record<string, string> {
  return ep.key ? { Authorization: `Bearer ${ep.key}` } : {};
}

function pickCheckpoint(ep: LocalImageEndpoint, req: DiffusionRequest): string {
  const fromId = (req.checkpoint ?? "").trim();
  return fromId && fromId !== "default" ? fromId : (ep.checkpoint ?? "").trim();
}

function sizeFor(ep: LocalImageEndpoint, aspect: DiffusionRequest["aspect"]): { w: number; h: number } {
  const base = SIZES[aspect ?? "landscape"];
  if (!ep.width || !ep.height) return base;
  const long = Math.max(ep.width, ep.height), short = Math.min(ep.width, ep.height);
  if (aspect === "square") return { w: long, h: long };
  return aspect === "portrait" ? { w: short, h: long } : { w: long, h: short };
}

/* ── image plumbing ─────────────────────────────────────────────────────────────────────────── */

async function blobToDataUrl(b: Blob): Promise<string> {
  const bytes = new Uint8Array(await b.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return `data:${b.type || "image/png"};base64,${btoa(bin)}`;
}

function dataUrlToBlob(url: string): Blob {
  const [head, b64] = url.split(",");
  const mime = /data:([^;]+)/.exec(head)?.[1] ?? "image/png";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("could not decode image"));
    img.src = src;
  });
}

/** RE-ENCODE SO A CAMPAIGN STILL FITS IN INDEXEDDB. A sampler hands back a 2–4 MB PNG; the save
 *  holds these inline, one per turn. A 1280px JPEG of the same frame is ~200 KB and identical at
 *  the size it is displayed. */
export async function shrinkDataUrl(url: string, maxDim = 1280, quality = 0.85): Promise<string> {
  if (!url.startsWith("data:")) return url;
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch { return url; }
}

/** Several portraits stitched into one sheet, so any single-image reference mechanism carries the
 *  whole cast of a scene. */
export async function buildReferenceSheet(refs: string[], tile = 512): Promise<string | null> {
  const usable = refs.filter((r) => r?.startsWith("data:")).slice(0, 4);
  if (!usable.length) return null;
  if (usable.length === 1) return usable[0];
  try {
    const imgs = await Promise.all(usable.map(loadImage));
    const cols = Math.min(2, imgs.length);
    const rows = Math.ceil(imgs.length / cols);
    const canvas = document.createElement("canvas");
    canvas.width = cols * tile; canvas.height = rows * tile;
    const ctx = canvas.getContext("2d");
    if (!ctx) return usable[0];
    ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    imgs.forEach((img, i) => {
      const x = (i % cols) * tile, y = Math.floor(i / cols) * tile;
      const scale = Math.max(tile / img.width, tile / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, x + (tile - w) / 2, y + (tile - h) / 2, w, h);
    });
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch { return usable[0]; }
}

/* ── ComfyUI ────────────────────────────────────────────────────────────────────────────────── */

export const WORKFLOW_TOKENS = [
  "%prompt%", "%negative%", "%seed%", "%width%", "%height%", "%steps%", "%cfg%",
  "%sampler%", "%scheduler%", "%checkpoint%", "%ref1%", "%ref2%", "%ref3%", "%ref4%",
  "%pose%", "%denoise%",
];

/** A plain txt2img graph, for anybody who has not exported their own. Needs only a checkpoint. */
function defaultWorkflow(): string {
  return JSON.stringify({
    "1": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: "%checkpoint%" } },
    "2": { class_type: "CLIPTextEncode", inputs: { text: "%prompt%", clip: ["1", 1] } },
    "3": { class_type: "CLIPTextEncode", inputs: { text: "%negative%", clip: ["1", 1] } },
    "4": { class_type: "EmptyLatentImage", inputs: { width: "%width%", height: "%height%", batch_size: 1 } },
    "5": { class_type: "KSampler", inputs: { seed: "%seed%", steps: "%steps%", cfg: "%cfg%", sampler_name: "%sampler%", scheduler: "%scheduler%", denoise: 1, model: ["1", 0], positive: ["2", 0], negative: ["3", 0], latent_image: ["4", 0] } },
    "6": { class_type: "VAEDecode", inputs: { samples: ["5", 0], vae: ["1", 2] } },
    "7": { class_type: "SaveImage", inputs: { filename_prefix: "warp", images: ["6", 0] } },
  }, null, 2);
}

/** A Flux Kontext graph — the easiest way to get face consistency out of one reference image. */
export const KONTEXT_WORKFLOW = JSON.stringify({
  "1": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: "flux1-dev-kontext_fp8_scaled.safetensors" } },
  "2": { class_type: "LoadImage", inputs: { image: "%ref1%", upload: "image" } },
  "3": { class_type: "FluxKontextImageScale", inputs: { image: ["2", 0] } },
  "4": { class_type: "VAEEncode", inputs: { pixels: ["3", 0], vae: ["1", 2] } },
  "5": { class_type: "CLIPTextEncode", inputs: { text: "%prompt%", clip: ["1", 1] } },
  "6": { class_type: "ReferenceLatent", inputs: { conditioning: ["5", 0], latent: ["4", 0] } },
  "7": { class_type: "FluxGuidance", inputs: { conditioning: ["6", 0], guidance: 2.5 } },
  "8": { class_type: "ConditioningZeroOut", inputs: { conditioning: ["5", 0] } },
  "9": { class_type: "EmptyLatentImage", inputs: { width: "%width%", height: "%height%", batch_size: 1 } },
  "10": { class_type: "KSampler", inputs: { seed: "%seed%", steps: "%steps%", cfg: 1, sampler_name: "euler", scheduler: "simple", denoise: 1, model: ["1", 0], positive: ["7", 0], negative: ["8", 0], latent_image: ["9", 0] } },
  "11": { class_type: "VAEDecode", inputs: { samples: ["10", 0], vae: ["1", 2] } },
  "12": { class_type: "SaveImage", inputs: { filename_prefix: "warp", images: ["11", 0] } },
}, null, 2);

/**
 * THE ONE THAT MAKES HER REAL AND STILL HER.
 *
 * The figure the game already draws goes in as ControlNet line art, so the sampler is handed her
 * silhouette, her proportions and her pose and only has to invent surface. Change her weight, put
 * her in chastity, break her arm, kneel her down for a scene — the control render changes with the
 * state, so the realistic image changes with it too, and none of that had to be described in words.
 *
 * Needs a ControlNet lineart model in `models/controlnet` and the checkpoint of your choice.
 * Denoise around 0.7 keeps the pose and repaints everything else; drop it towards 0.5 if the
 * sampler is wandering off her body, raise it towards 0.85 for more licence.
 */
export const CONTROL_WORKFLOW = JSON.stringify({
  "1": { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: "%checkpoint%" } },
  "2": { class_type: "LoadImage", inputs: { image: "%pose%", upload: "image" } },
  "3": { class_type: "CLIPTextEncode", inputs: { text: "%prompt%", clip: ["1", 1] } },
  "4": { class_type: "CLIPTextEncode", inputs: { text: "%negative%", clip: ["1", 1] } },
  "5": { class_type: "ControlNetLoader", inputs: { control_net_name: "control_v11p_sd15_lineart.pth" } },
  "6": { class_type: "ControlNetApplyAdvanced", inputs: { positive: ["3", 0], negative: ["4", 0], control_net: ["5", 0], image: ["2", 0], strength: 0.85, start_percent: 0, end_percent: 0.85 } },
  "7": { class_type: "VAEEncode", inputs: { pixels: ["2", 0], vae: ["1", 2] } },
  "8": { class_type: "KSampler", inputs: { seed: "%seed%", steps: "%steps%", cfg: "%cfg%", sampler_name: "%sampler%", scheduler: "%scheduler%", denoise: "%denoise%", model: ["1", 0], positive: ["6", 0], negative: ["6", 1], latent_image: ["7", 0] } },
  "9": { class_type: "VAEDecode", inputs: { samples: ["8", 0], vae: ["1", 2] } },
  "10": { class_type: "SaveImage", inputs: { filename_prefix: "warp", images: ["9", 0] } },
}, null, 2);

/** Numbers are matched WITH their quotes first, so `"seed": "%seed%"` arrives as a real number.
 *  ComfyUI validates input types and rejects the string, and that is the most common way a
 *  hand-edited workflow fails. */
function fillWorkflow(json: string, vals: Record<string, string | number>): string {
  let out = json;
  for (const [k, v] of Object.entries(vals)) {
    const tok = `%${k}%`;
    if (typeof v === "number") out = out.split(`"${tok}"`).join(String(v));
    out = out.split(tok).join(typeof v === "number" ? String(v) : jsonEscape(String(v)));
  }
  return out;
}

/** A value spliced into JSON source has to survive as JSON: one unescaped quote in a prompt turns
 *  the whole graph into a parse error. */
function jsonEscape(s: string): string {
  const q = JSON.stringify(s);
  return q.slice(1, q.length - 1);
}

async function comfyUpload(ep: LocalImageEndpoint, dataUrl: string, name: string): Promise<string> {
  const fd = new FormData();
  fd.append("image", dataUrlToBlob(dataUrl), name);
  fd.append("overwrite", "true");
  const res = await fetch(`${ep.url}/upload/image`, { method: "POST", body: fd, headers: authHeaders(ep) });
  if (!res.ok) throw new Error(`ComfyUI refused the reference upload (HTTP ${res.status})`);
  const j = await res.json() as { name: string; subfolder?: string };
  return j.subfolder ? `${j.subfolder}/${j.name}` : j.name;
}

async function comfyGenerate(ep: LocalImageEndpoint, req: DiffusionRequest): Promise<DiffusionResult> {
  const t0 = Date.now();
  const { w, h } = sizeFor(ep, req.aspect);
  const seed = req.seed ?? Math.floor(Math.random() * 2147483647);
  const wf = ep.workflow?.trim() || defaultWorkflow();

  const refVals: Record<string, string> = {};
  const wantsRefs = /%ref[1-4]%/.test(wf);
  if (wantsRefs && !req.refs?.length) {
    throw new Error("this workflow needs a reference image (%ref1%) and nobody in the scene has a portrait yet — generate portraits first, or use a workflow without a %ref% token");
  }
  if (wantsRefs && req.refs?.length) {
    req.onProgress?.("sending the reference");
    const sheet = await buildReferenceSheet(req.refs);
    if (sheet) refVals.ref1 = await comfyUpload(ep, sheet, "warp-cast.jpg");
    for (let i = 1; i < Math.min(4, req.refs.length); i++) {
      if (wf.includes(`%ref${i + 1}%`)) refVals[`ref${i + 1}`] = await comfyUpload(ep, req.refs[i], `warp-ref${i + 1}.jpg`);
    }
  }

  // The control render goes up the same way a reference does, but it means something different:
  // a reference says "her face looked like this", a control says "her body is exactly here".
  const wantsPose = wf.includes("%pose%");
  if (wantsPose && !req.pose) {
    throw new Error("this workflow expects the figure as a control image (%pose%) and none was rendered — use a workflow without %pose%, or generate from a screen that has her drawn");
  }
  if (wantsPose && req.pose) {
    req.onProgress?.("sending the pose");
    refVals.pose = await comfyUpload(ep, req.pose, "warp-pose.png");
  }

  const filled = fillWorkflow(wf, {
    prompt: req.prompt,
    denoise: req.denoise ?? 0.72,
    negative: req.negative ?? ep.negative ?? DEFAULT_NEGATIVE,
    seed, width: w, height: h,
    steps: ep.steps || LOCAL_IMAGE_DEFAULTS.steps,
    cfg: ep.cfg ?? LOCAL_IMAGE_DEFAULTS.cfg,
    sampler: ep.sampler || LOCAL_IMAGE_DEFAULTS.sampler,
    scheduler: ep.scheduler || LOCAL_IMAGE_DEFAULTS.scheduler,
    checkpoint: pickCheckpoint(ep, req) || "",
    ...refVals,
  });

  let graph: unknown;
  try { graph = JSON.parse(filled); }
  catch (e) { throw new Error(`the workflow is not valid JSON after substitution — ${(e as Error).message}`); }

  req.onProgress?.("queued");
  const res = await fetch(`${ep.url}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(ep) },
    body: JSON.stringify({ prompt: graph, client_id: "warp" }),
    signal: req.signal,
  });
  if (!res.ok) throw new Error(`ComfyUI rejected the workflow (HTTP ${res.status}): ${comfyError(await res.text())}`);
  const { prompt_id } = await res.json() as { prompt_id: string };

  const deadline = Date.now() + (ep.timeout_s ?? LOCAL_IMAGE_DEFAULTS.timeout_s) * 1000;
  for (;;) {
    if (req.signal?.aborted) throw new DOMException("aborted", "AbortError");
    if (Date.now() > deadline) throw new Error(`ComfyUI did not finish in time — raise the timeout, or lower steps and resolution`);
    await new Promise((r) => setTimeout(r, 900));
    const hr = await fetch(`${ep.url}/history/${prompt_id}`, { headers: authHeaders(ep), signal: req.signal });
    if (!hr.ok) continue;
    const hist = await hr.json() as Record<string, { status?: { status_str?: string; completed?: boolean; messages?: [string, Record<string, string>][] }; outputs?: Record<string, { images?: { filename: string; subfolder?: string; type?: string }[] }> }>;
    const entry = hist?.[prompt_id];
    if (!entry) { req.onProgress?.("painting"); continue; }
    if (entry.status?.status_str === "error") throw new Error(`ComfyUI errored running the graph: ${comfyExecError(entry)}`);
    for (const nodeId of Object.keys(entry.outputs ?? {})) {
      const img = entry.outputs?.[nodeId]?.images?.[0];
      if (!img) continue;
      req.onProgress?.("fetching");
      const q = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder ?? "", type: img.type ?? "output" });
      const ir = await fetch(`${ep.url}/view?${q}`, { headers: authHeaders(ep), signal: req.signal });
      if (!ir.ok) throw new Error(`could not fetch the finished image (HTTP ${ir.status})`);
      const url = await shrinkDataUrl(await blobToDataUrl(await ir.blob()), ep.store_max_px ?? LOCAL_IMAGE_DEFAULTS.store_max_px);
      return { url, seed, took_ms: Date.now() - t0 };
    }
    if (entry.status?.completed) throw new Error("the workflow finished and produced no image — is there a SaveImage node at the end?");
  }
}

function comfyError(body: string): string {
  try {
    const j = JSON.parse(body) as { error?: { message?: string; details?: string }; node_errors?: Record<string, { errors?: { message: string; details?: string }[] }> };
    const parts: string[] = [];
    if (j.error?.message) parts.push(j.error.message);
    if (j.error?.details) parts.push(String(j.error.details));
    for (const [node, e] of Object.entries(j.node_errors ?? {})) {
      for (const err of e?.errors ?? []) parts.push(`node ${node}: ${err.message}${err.details ? ` (${err.details})` : ""}`);
    }
    return parts.join(" · ").slice(0, 400) || body.slice(0, 200);
  } catch { return body.slice(0, 200); }
}

function comfyExecError(entry: { status?: { messages?: [string, Record<string, string>][] } }): string {
  for (const m of entry?.status?.messages ?? []) {
    if (m?.[0] === "execution_error") {
      const d = m[1] ?? {};
      return `${d.node_type ?? "node"} — ${d.exception_message ?? "unknown error"}`.slice(0, 400);
    }
  }
  return "unknown error";
}

/* ── A1111 / Forge / SD.Next ────────────────────────────────────────────────────────────────── */

async function a1111Generate(ep: LocalImageEndpoint, req: DiffusionRequest): Promise<DiffusionResult> {
  const t0 = Date.now();
  const { w, h } = sizeFor(ep, req.aspect);
  const seed = req.seed ?? Math.floor(Math.random() * 2147483647);
  req.onProgress?.("painting");
  const res = await fetch(`${ep.url}/sdapi/v1/txt2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(ep) },
    body: JSON.stringify({
      prompt: req.prompt,
      negative_prompt: req.negative ?? ep.negative ?? DEFAULT_NEGATIVE,
      seed, width: w, height: h,
      steps: ep.steps || LOCAL_IMAGE_DEFAULTS.steps,
      cfg_scale: ep.cfg ?? LOCAL_IMAGE_DEFAULTS.cfg,
      sampler_name: ep.sampler || "Euler",
      batch_size: 1, n_iter: 1,
      ...(pickCheckpoint(ep, req) ? { override_settings: { sd_model_checkpoint: pickCheckpoint(ep, req) }, override_settings_restore_afterwards: false } : {}),
    }),
    signal: req.signal,
  });
  if (!res.ok) throw new Error(`the image server returned HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json() as { images?: string[] };
  const b64 = j.images?.[0];
  if (!b64) throw new Error("the image server returned no image");
  const url = await shrinkDataUrl(`data:image/png;base64,${b64}`, ep.store_max_px ?? LOCAL_IMAGE_DEFAULTS.store_max_px);
  return { url, seed, took_ms: Date.now() - t0 };
}

/* ── the door ───────────────────────────────────────────────────────────────────────────────── */

export async function generateLocalImage(req: DiffusionRequest): Promise<DiffusionResult> {
  const ep = getLocalImage();
  if (!ep) throw new Error("no local image server is configured — Settings → Pictures");
  try {
    return ep.backend === "a1111" ? await a1111Generate(ep, req) : await comfyGenerate(ep, req);
  } catch (e) {
    const err = e as Error;
    if (err?.name === "AbortError") throw err;
    // A server that is down and one that has not been told to allow this origin fail identically,
    // and CORS is much the likelier of the two, so name it.
    if (/failed to fetch|networkerror|load failed/i.test(String(err?.message))) {
      throw new Error(ep.backend === "a1111"
        ? `could not reach ${ep.url}. Start the WebUI with --api --cors-allow-origins=${origin()}`
        : `could not reach ${ep.url}. Start ComfyUI with --enable-cors-header '${origin()}'`);
    }
    throw err;
  }
}

function origin(): string {
  try { return window.location.origin; } catch { return "*"; }
}

export async function listLocalCheckpoints(): Promise<string[]> {
  const ep = getLocalImage();
  if (!ep) return [];
  try {
    if (ep.backend === "a1111") {
      const r = await fetch(`${ep.url}/sdapi/v1/sd-models`, { headers: authHeaders(ep) });
      if (!r.ok) return [];
      return (await r.json() as { title?: string; model_name?: string }[]).map((m) => m.model_name ?? m.title ?? "").filter(Boolean);
    }
    const r = await fetch(`${ep.url}/object_info/CheckpointLoaderSimple`, { headers: authHeaders(ep) });
    if (!r.ok) return [];
    const j = await r.json() as Record<string, { input?: { required?: { ckpt_name?: [string[]] } } }>;
    return j?.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] ?? [];
  } catch { return []; }
}
