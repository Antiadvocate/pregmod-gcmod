/**
 * THE SLAVE, DRAWN.
 *
 * This is the base game's own vector art system, ported. Not a diffusion model, not an API, not a
 * GPU — 575 little SVG layers on a shared `viewBox="0 0 560 1000"`, stacked in z-order and coloured
 * by an injected stylesheet. It is instant, it is offline, it costs nothing, and it is what this
 * game has always looked like.
 *
 * I shipped a version of this game with no pictures in it and called the text "the record". That
 * was wrong about what the game IS. You are supposed to look at her.
 *
 * ── HOW IT WORKS ─────────────────────────────────────────────────────────────────────────────
 *
 * Every layer file carries semantic classes rather than colours — `.skin`, `.hair`, `.areola`,
 * `.eye`, `.sclera`, `.lip`, `.shadow` — so one stylesheet per person recolours the whole stack.
 * That is why a cast of forty costs forty stylesheets and not forty sets of art.
 *
 * Layers are proposed, not asserted: `layersFor` names files by convention and the renderer skips
 * any that 404. A wrong guess loses a detail instead of breaking the figure, which matters because
 * the naming conventions in a 2,500-file art pack are not perfectly regular.
 *
 * The boob transform is the original's, verbatim — including the log curve, which is the reason a
 * 300cc and a 3000cc chest are visibly different rather than one being a scaled copy of the other:
 *
 *     s  = 0.383433 · ln(0.0452403 · cc) · heightScale
 *     tx = −282.841 · s + 292.349
 *     ty = −225.438 · s + 216.274
 */
import type { Person } from "../engine/types";

export const ART_BASE = "art/vector";

/** THE ART'S OWN COORDINATE SPACE. Every layer declares this, and they overlay exactly because of
 *  it — which is the entire reason the pack composites at all. */
export const VIEWBOX = "0 0 560 1000";

/** WHERE THE BODY ACTUALLY IS INSIDE THAT SPACE.
 *
 *  Measured off the path data rather than guessed: the head runs y 60–170 around x 255–345, the
 *  torso sits y 380–470, and the legs reach y 870. So the figure occupies roughly a 200-wide column
 *  in a 560-wide box, and rendering the raw viewBox puts a small woman in a large empty rectangle —
 *  which is exactly what the first attempt did. */
export const CROPS = {
  full: "185 40 195 890",
  bust: "215 55 130 380",
  head: "248 58 105 122",
} as const;

export type Crop = keyof typeof CROPS;

export interface Layer {
  /** File stem, without the `Art_Vector_` prefix or the `.svg`. */
  id: string;
  /** SVG transform applied to this layer alone. */
  transform?: string;
}

/* ── palettes ────────────────────────────────────────────────────────────────────────────────
 * The person model stores colouring as English ("olive", "dark brown", "auburn") because that is
 * what the narrator needs. The art needs hex. These are the bridges, and an unrecognised value
 * falls through to a sane middle rather than to black. */

const SKIN: [RegExp, string][] = [
  [/pale|porcelain/i, "#f5ded3"],
  [/fair|light(?! brown)/i, "#f0d5c0"],
  [/olive/i, "#d9b48f"],
  [/tan/i, "#c9a074"],
  [/light brown/i, "#b07c52"],
  [/deep brown|dark/i, "#69432b"],
  [/brown/i, "#8a5a3b"],
];

const HAIR: [RegExp, string][] = [
  [/blonde|blond/i, "#e6c66a"],
  [/auburn/i, "#8c3b1e"],
  [/red|ginger/i, "#b33a1a"],
  [/dark brown/i, "#3b2418"],
  [/light brown/i, "#8a6038"],
  [/brown/i, "#5a3a22"],
  [/grey|gray|white|silver/i, "#c9c4bb"],
  [/black/i, "#191512"],
];

const EYE: [RegExp, string][] = [
  [/blue/i, "#5b8fbe"],
  [/green/i, "#5f8c5a"],
  [/hazel/i, "#8a6b3b"],
  [/grey|gray/i, "#8d9395"],
  [/dark brown/i, "#3a2618"],
  [/brown/i, "#6b4423"],
];

function match(table: [RegExp, string][], value: string, fallback: string): string {
  for (const [re, hex] of table) if (re.test(value)) return hex;
  return fallback;
}

/** Darken a hex by a factor, for shadows and the areola. */
function shade(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * factor)));
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * factor)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function paletteFor(p: Person): Record<string, string> {
  const skin = match(SKIN, p.body.skin, "#d9b48f");
  const hair = match(HAIR, p.body.hair_color, "#5a3a22");
  const eye = match(EYE, p.body.eye_color, "#6b4423");
  return {
    skin,
    shadow: shade(skin, 0.86),
    head: skin,
    torso: skin,
    penis: shade(skin, 0.97),
    scrotum: shade(skin, 0.95),
    bellybutton: shade(skin, 0.8),
    areola: shade(skin, 0.78),
    lip: shade(skin, 0.82),
    hair,
    eyebrow_hair: hair,
    pubic_hair: hair,
    underarm_hair: hair,
    eye,
    sclera: "#ffffff",
    white: "#ffffff",
    shoe: "#3a332c",
    shoe_shadow: "#241d18",
    steel_piercing: "#c8ccd0",
    steel_chastity: "#b9bec4",
    smart_piercing: "#9fd3c7",
    glasses: "#8fb3c9",
    eart: hair,
    tail: hair,
  };
}

/** The stylesheet for one person, scoped to a class so many can be on screen at once. */
export function styleFor(p: Person, scope: string): string {
  const pal = paletteFor(p);
  const rules = Object.entries(pal).map(([cls, hex]) => `.${scope} .${cls}{fill:${hex};}`);
  // Stroked art (the outlines) must not be repainted by the fill rules above.
  rules.push(`.${scope} svg{overflow:visible;}`);
  return rules.join("");
}

/* ── layer selection ─────────────────────────────────────────────────────────────────────────
 * Ordered back to front. Each entry is proposed; the renderer drops what does not exist. */

function torsoLayer(p: Person): string {
  const w = p.body.weight;
  if (w > 55) return "Torso_Obese";
  if (w > 30) return "Torso_Fat";
  if (w > 10) return "Torso_Chubby";
  if (p.body.waist < -40) return "Torso_Hourglass";
  return "Torso_Normal";
}

function legLayer(p: Person): string {
  const w = p.body.weight;
  if (w > 40) return "Leg_Wide";
  if (w > 12) return "Leg_Thick";
  if (w < -25) return "Leg_Narrow";
  return "Leg_Normal";
}

function buttLayer(p: Person): string {
  return `Butt_${Math.max(0, Math.min(6, Math.round(p.body.butt)))}`;
}

/** Hair: the art pack's styles, chosen from the free-text style the forge wrote. */
function hairStyle(p: Person): string {
  const s = (p.body.hair_style || "").toLowerCase();
  if (/braid/.test(s)) return "Braided";
  if (/bun|pinned/.test(s)) return "Bun";
  if (/tail|pony/.test(s)) return "Ponytail";
  if (/curl|perm/.test(s)) return "Curled";
  if (/dread/.test(s)) return "Dreadlocks";
  if (/afro/.test(s)) return "Afro";
  if (/corn/.test(s)) return "Cornrows";
  if (/untidy|messy|loose/.test(s)) return "Messy";
  if (/up|tied back/.test(s)) return "Up";
  return "Neat";
}

function hairLength(p: Person): string {
  const cm = p.body.hair_length;
  if (cm <= 1) return "";
  if (cm > 70) return "Long";
  if (cm > 25) return "Medium";
  return "Short";
}

function nippleLayer(p: Person): string {
  switch (p.body.nipples) {
    case "tiny": return "Boob_NippleTiny";
    case "puffy": return "Boob_NipplePuffy";
    case "inverted": return "Boob_NippleInverted";
    case "partially inverted": return "Boob_NipplePartiallyInverted";
    case "huge": return "Boob_NippleHuge";
    case "flat": return "Boob_NippleTiny";
    default: return "Boob_NippleCute";
  }
}

function pubicLayer(p: Person): string {
  const fat = p.body.weight > 30 ? "Fat" : "";
  switch (p.body.pubic_hair) {
    case "hairless": case "waxed": return "Pubic_Hair_None";
    case "in a strip": return `Pubic_Hair_Strip${fat}`;
    case "bushy": return `Pubic_Hair_Bushy${fat}`;
    case "very bushy": return `Pubic_Hair_Very_Bushy${fat}`;
    default: return `Pubic_Hair_Neat${fat}`;
  }
}

/** Which of the six face variants she has. Stable per person — derived from the id, so she has the
 *  same face every time she is drawn, forever, without storing anything. */
function faceVariant(p: Person, n: number): number {
  let h = 0;
  for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) >>> 0;
  return h % n;
}

const TYPES = ["TypeA", "TypeB", "TypeC", "TypeD", "TypeE", "TypeF"];
const BROWS = ["Natural", "Bushy", "Pencilthin", "Tapered"];

/** The boob transform, straight out of the original. */
export function boobTransform(p: Person, heightScale: number): string | undefined {
  const cc = p.body.boobs;
  if (cc < 100) return undefined;
  const s = 0.383433 * Math.log(0.0452403 * Math.max(50, cc)) * heightScale;
  if (!isFinite(s) || s <= 0) return undefined;
  const tx = -282.841 * s + 292.349;
  const ty = -225.438 * s + 216.274;
  return `matrix(${s.toFixed(4)},0,0,${s.toFixed(4)},${tx.toFixed(2)},${ty.toFixed(2)})`;
}

/** Belly grows with pregnancy the same way — a scale on the belly layer. */
function bellyTransform(p: Person): string | undefined {
  const cc = p.body.belly;
  if (cc < 1500) return undefined;
  const s = Math.min(2.4, 0.6 + Math.log10(cc) * 0.28);
  const tx = -160 * (s - 1);
  const ty = -120 * (s - 1);
  return `matrix(${s.toFixed(3)},0,0,${s.toFixed(3)},${tx.toFixed(1)},${ty.toFixed(1)})`;
}

/**
 * THE STACK. Back to front, and every entry optional at render time.
 */
export function layersFor(p: Person): Layer[] {
  const out: Layer[] = [];
  const len = hairLength(p);
  const style = hairStyle(p);
  const heightScale = Math.max(0.7, Math.min(1.25, p.body.height_cm / 170));

  // behind the body
  if (len) out.push({ id: `Hair_Back_${style}_${len}` }, { id: `Hair_Back_${style}` });

  out.push({ id: buttLayer(p) });
  out.push({ id: legLayer(p) });
  out.push({ id: torsoLayer(p) });
  out.push({ id: "Feet" });

  // the front of the body
  if (p.body.vagina !== null) out.push({ id: "Pussy" });
  out.push({ id: pubicLayer(p) });
  if (p.body.dick !== null && p.body.dick > 0) out.push({ id: "Flaccid" }, { id: "Penis" });

  const belly = bellyTransform(p);
  if (belly) out.push({ id: "Belly", transform: belly });

  const boob = boobTransform(p, heightScale);
  if (boob) {
    out.push({ id: "Boob_Alt", transform: boob });
    out.push({ id: "Boob_Areola", transform: boob });
    out.push({ id: nippleLayer(p), transform: boob });
  }

  // arms: where her hands are is a read on her body, not decoration
  const armPos = p.psyche.relaxation <= -5 ? "High" : p.psyche.relaxation >= 4 ? "Low" : "Mid";
  const fat = p.body.weight > 30 ? "ArmFat" : "Arm";
  out.push({ id: `${fat}_Left_${armPos}` }, { id: `${fat}_Right_${armPos}` });

  // the face
  out.push({ id: "Head" });
  out.push({ id: "Face" });
  out.push({ id: `Eyes_${TYPES[faceVariant(p, 6)]}` });
  out.push({ id: `Mouth_${TYPES[faceVariant(p, 4)]}` });
  out.push({ id: `Nose_${TYPES[faceVariant(p, 3)]}` });
  out.push({ id: p.body.face > 70 ? "Lip_Heavy" : "Lip_Light" });
  out.push({ id: `Eyebrow_${TYPES[faceVariant(p, 4)]}_${BROWS[faceVariant(p, 4)]}` });

  // in front
  if (len) out.push({ id: `Hair_Fore_${style}_${len}` }, { id: `Hair_Fore_${style}` });
  if (p.collar && p.collar !== "none") out.push({ id: "Collar" });

  return out;
}

/** Height is rendered as scale, exactly as the original does it. */
export function heightScaleFor(p: Person): number {
  return Math.max(0.72, Math.min(1.22, p.body.height_cm / 172));
}
