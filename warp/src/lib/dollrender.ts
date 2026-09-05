/**
 * THE FIGURE, AS A PNG.
 *
 * Rasterises the vector doll so it can be handed to a sampler as a ControlNet image. This is the
 * hinge of the whole realistic-art path, so it is worth being explicit about why.
 *
 * A diffusion model does not know who anybody is. Words cannot fix that — "olive skin, auburn hair,
 * heavy breasts, twenty-four" describes several thousand people, and asking twice gets two of them.
 * Every game of this kind runs into it and most give up and let the pictures drift.
 *
 * But her body is already drawn. The compositor is deterministic, reads the same state the prose
 * reads, and puts her at her real proportions in her real pose. Rasterise that and give it to
 * ControlNet and the sampler is left with the one job it is actually good at — skin, light,
 * material — while the silhouette, the framing and the pose are already decided. The realistic
 * image then inherits everything: put on weight and the render is heavier; get put in chastity and
 * it is there; kneel for a scene and she is kneeling, because the rig posed her, not because
 * somebody typed the word and hoped.
 *
 * Two details that are easy to get wrong and expensive to debug:
 *
 *   · The SVG must be fully inlined before it goes into an Image. A blob URL of markup that still
 *     references external files draws a blank canvas, silently, because the browser will not fetch
 *     subresources for an image-context SVG. Every layer is already inlined by the component, so
 *     what is serialised here is self-contained by construction.
 *   · ControlNet lineart wants dark lines on white, not a coloured figure on transparency. The
 *     canvas is filled white first and the figure drawn over it; the palette CSS stays, because the
 *     preprocessor reads edges and a flat silhouette gives it nothing to find.
 */

/** Where the doll is drawn from, in the pack's coordinate space, with room for the whole body. */
const FRAME = { x: 150, y: 20, w: 300, h: 960 };

export interface DollRender {
  /** `data:image/png;base64,…`, ready for the ComfyUI upload. */
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Serialise a live `<svg>` element and rasterise it at diffusion resolution.
 *
 * Takes the element the component already rendered rather than re-composing the figure, so what
 * the sampler is given is exactly what is on screen — same layers, same palette, same pose. Pass
 * the still frame before calling if you do not want a half-blink in the control image.
 */
export async function renderDoll(svg: SVGSVGElement, opts?: { width?: number; height?: number }): Promise<DollRender> {
  const width = opts?.width ?? 832;
  const height = opts?.height ?? 1216;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("viewBox", `${FRAME.x} ${FRAME.y} ${FRAME.w} ${FRAME.h}`);
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("preserveAspectRatio", "xMidYMid meet");
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  // The scoped stylesheet is written against a class on the live element; the clone keeps the class
  // but leaves the document, so the rule has to travel with it. It already does — the component
  // inlines a <style> child — but the class on the root has to survive, and cloneNode keeps it.
  const markup = new XMLSerializer().serializeToString(clone);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

  const img = new Image();
  img.decoding = "sync";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("the figure could not be rasterised — a layer is probably still loading"));
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d canvas available in this browser");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return { dataUrl: canvas.toDataURL("image/png"), width, height };
}

/**
 * The clause that goes with the render.
 *
 * Deliberately short. The control image is already carrying her body, so repeating it in words
 * only gives the sampler a second opinion to argue with — the classic failure is a prompt saying
 * "large breasts" over a control image of a flat chest, and getting a body that is neither. What
 * the words are for is everything the line art cannot encode: material, light, and the register of
 * the picture.
 */
export function controlPrompt(base: string, opts?: { room?: string; light?: string }): string {
  const bits = [
    "photorealistic",
    base,
    opts?.room ? `in ${opts.room}` : "",
    opts?.light ?? "soft directional light, shallow depth of field",
    "natural skin texture, visible pores, subsurface scattering, no plastic sheen",
    "85mm, shot on film",
  ];
  return bits.filter(Boolean).join(", ");
}

/** What the sampler must be argued away from, on top of the global negative. A control image tends
 *  to leak its own flatness into the result, and this is what that leak looks like. */
export const CONTROL_NEGATIVE =
  "flat colour, vector art, cel shaded, cartoon, anime, illustration, line art, clip art, " +
  "white background, plain background, doll, mannequin, plastic skin, airbrushed";
