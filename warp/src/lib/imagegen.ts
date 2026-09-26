/**
 * PHOTOGRAPHIC REDRAWS — the drawn feet, sent once through an image model.
 *
 * Each view is rasterised from its SVG and sent to an OpenRouter model that outputs images, with a
 * prompt that pins what must not change (shape, toe lengths, nails, skin, marks, jewelry). One
 * click, one request per view, run together. The results are re-encoded as JPEG and kept on her
 * record so they don't have to be paid for twice.
 */
import { getApiKey } from "../config";
import type { ModelInfo } from "../llm";

const OR_URL = "https://openrouter.ai/api/v1/chat/completions";

export function imageModels(models: ModelInfo[]): ModelInfo[] {
  return models.filter((m) => !m.local && (m.output ?? []).includes("image"));
}

/** Draw an on-screen SVG into a PNG, at `scale`× its viewBox, on a dark background. */
export async function svgToPng(svg: SVGSVGElement, scale = 3, bg = "#111111"): Promise<string> {
  const vb = svg.viewBox.baseVal;
  const w = Math.round((vb?.width || svg.clientWidth) * scale), h = Math.round((vb?.height || svg.clientHeight) * scale);
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(w));
  clone.setAttribute("height", String(h));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const text = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([text], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise<void>((ok, bad) => { img.onload = () => ok(); img.onerror = () => bad(new Error("couldn't rasterise the drawing")); img.src = url; });
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return c.toDataURL("image/png");
  } finally { URL.revokeObjectURL(url); }
}

/**
 * Put one or more full-length figures on a canvas shaped like a photograph, each scaled to the same
 * height with room above the head and below the feet. A bare doll is a strip about four times taller
 * than it is wide; image models reframe a strip like that to their own shape, and what they keep is
 * the top half. Framed like this, the whole figure is already the picture.
 */
export async function frameFigures(pngs: string[], aspect = pngs.length > 1 ? 4 / 3 : 2 / 3, height = 1500, bg = "#111111"): Promise<string> {
  const imgs = await Promise.all(pngs.map((src) => new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => bad(new Error("couldn't read a figure")); i.src = src; })));
  const figH = height * 0.86;
  const widths = imgs.map((i) => (i.width / i.height) * figH);
  const gap = height * 0.08;
  const need = widths.reduce((a, b) => a + b, 0) + gap * (imgs.length + 1);
  const w = Math.max(Math.round(height * aspect), Math.round(need));
  const c = document.createElement("canvas");
  c.width = w; c.height = height;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, height);
  let x = (w - (need - gap * 2)) / 2;
  imgs.forEach((i, k) => { ctx.drawImage(i, x, height * 0.07, widths[k], figH); x += widths[k] + gap; });
  return c.toDataURL("image/png");
}

/** Shrink a returned image to a JPEG small enough to keep in the save. */
export async function toJpeg(dataUrl: string, maxSide = 900, q = 0.86): Promise<string> {
  const img = new Image();
  await new Promise<void>((ok, bad) => { img.onload = () => ok(); img.onerror = () => bad(new Error("the model's image wouldn't load")); img.src = dataUrl; });
  const k = Math.min(1, maxSide / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", q);
}

/** Send one picture and an instruction; get one picture back. */
export async function redraw(model: string, image: string, prompt: string, signal?: AbortSignal): Promise<string> {
  const key = getApiKey();
  if (!key) throw new Error("No OpenRouter key set in Settings.");
  const res = await fetch(OR_URL, {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "HTTP-Referer": location.origin, "X-Title": "Warp" },
    body: JSON.stringify({
      model,
      modalities: ["image", "text"],
      messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: image } }] }],
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const msg = json?.choices?.[0]?.message;
  const out: string | undefined = msg?.images?.[0]?.image_url?.url
    ?? (Array.isArray(msg?.content) ? msg.content.find((c: { type?: string }) => c?.type === "image_url")?.image_url?.url : undefined);
  if (!out) {
    const said = typeof msg?.content === "string" ? msg.content.slice(0, 200) : "";
    throw new Error(said ? `the model answered in words instead of a picture: "${said}"` : "the model returned no image");
  }
  return out;
}

export const VIEW_WORDS = {
  top: "seen from directly above, toes pointing up the frame, heel at the bottom, the top of the foot and the toenails facing the camera",
  sole: "seen from directly below, the whole sole facing the camera, toes pointing up the frame, heel at the bottom",
  side: "seen from the inner side, standing on a floor, toes pointing right, heel on the left, the ankle rising out of frame",
} as const;

export function redrawPrompt(view: keyof typeof VIEW_WORDS, description: string): string {
  return `Redraw this illustration as a single photorealistic photograph of one bare adult woman's foot, ${VIEW_WORDS[view]}.
Keep everything the drawing shows exactly as it is: the outline, the length of each toe relative to the others, how wide the foot is, the arch, the heel, the skin tone, nail shape and nail colour, any jewelry, calluses, marks or welts. The foot has exactly five toes: never four, never six. In a view from the side, only the big toe is fully visible and the others are hidden behind it. Keep the soles exactly as clean or as dirty as the drawing shows them. Do not add or remove toes, jewelry or polish.
What is known about this foot: ${description}
Real skin texture with pores, fine creases and natural colour variation; soft studio light; a plain dark background; nothing else in the frame. No text.`;
}
