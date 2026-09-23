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
import { restingPose, type ArmPos, type Pose } from "./rig";
import { garment } from "../data/wardrobe";

const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

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

/**
 * The full-body window has to follow the arms. `Arm_Left_High` reaches x 482 and the fixed crop
 * stopped at 380, so every raised-arm pose was drawn with her hands cut off at the wrist — invisible
 * while the compositor only ever asked for three positions, and immediately obvious once poses
 * arrived. Widening the crop for everyone instead would shrink her in the common poses, so the
 * window tracks what is actually in the frame.
 */
export function cropFor(crop: Crop, pose?: { armL: string; armR: string }): string {
  if (crop !== "full" || !pose) return CROPS[crop];
  const raised = pose.armL === "High" || pose.armL === "Rebel" || pose.armR === "High";
  return raised ? "175 40 320 890" : CROPS.full;
}

export interface Layer {
  /** File stem, without the `Art_Vector_` prefix or the `.svg`. */
  id: string;
  /** SVG transform applied to this layer alone. */
  transform?: string;
  /** Hue rotation in degrees, for clothing she has had recoloured. */
  tint?: number;
}

/* ── palettes ────────────────────────────────────────────────────────────────────────────────
 * The person model stores colouring as English ("olive", "dark brown", "auburn") because that is
 * what the narrator needs. The art needs hex. These are the bridges, and an unrecognised value
 * falls through to a sane middle rather than to black. */

const SKIN: [RegExp, string][] = [
  [/dyed pink/i, "#fe62b0"], [/dyed blue/i, "#5b8eb7"], [/dyed green/i, "#a6c373"], [/dyed purple/i, "#7a2391"],
  [/dyed red/i, "#bc4949"], [/dyed gray|dyed grey/i, "#bdbdbd"], [/dyed white/i, "#ffffff"], [/dyed black/i, "#1c1c1c"],
  [/tiger/i, "#e2d75d"],
  [/pale|porcelain/i, "#f5ded3"],
  [/fair|light(?! brown)/i, "#f0d5c0"],
  [/olive/i, "#d9b48f"],
  [/tan/i, "#c9a074"],
  [/light brown/i, "#b07c52"],
  [/deep brown|dark/i, "#69432b"],
  [/brown/i, "#8a5a3b"],
];

const HAIR: [RegExp, string][] = [
  [/platinum/i, "#eee7d2"], [/pink/i, "#f08bbd"], [/blue/i, "#3f6fd1"], [/green/i, "#3f9e5a"],
  [/purple|violet/i, "#7b3fb8"], [/silver/i, "#c7ccd3"], [/white/i, "#f2f0ea"], [/strawberry/i, "#d9885a"],
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
  // A full-body suit is her skin, as far as the art is concerned — that is how the original draws
  // latex, and it is why the suit covers her arms and legs without separate layers for them.
  const suit = garment(p.clothes)?.skin;
  const skin = suit ?? match(SKIN, p.body.skin, "#d9b48f");
  const hair = match(HAIR, p.body.hair_color, "#5a3a22");
  const eye = match(EYE, p.body.eye_color, "#6b4423");
  return {
    skin,
    shadow: "#010101",
    // A suit stops at the neck: her face stays her own.
    head: suit ? match(SKIN, p.body.skin, "#d9b48f") : skin,
    torso: skin,
    penis: shade(skin, 0.97),
    scrotum: shade(skin, 0.95),
    bellybutton: shade(skin, 0.8),
    areola: shade(skin, 0.78),
    lip: p.look?.lips ?? (suit ? shade(skin, 0.82) : shade(match(SKIN, p.body.skin, "#d9b48f"), 0.82)),
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
    outfit_base: suit ?? "#4a4a4a",
  };
}

/** The stylesheet for one person, scoped to a class so many can be on screen at once. */
export function styleFor(p: Person, scope: string): string {
  const pal = paletteFor(p);
  const rules = Object.entries(pal).map(([cls, hex]) => `.${scope} .${cls}{fill:${hex};}`);
  // NO STROKE. The pack is fills only and the original's own stylesheet never sets a stroke on
  // anything — the internal definition comes entirely from `.shadow` paths filled near-black, and
  // the shapes are cut to butt against each other exactly. Adding an outline to every path draws a
  // line around every one of those internal cuts as well as the silhouette, so a thigh gets a seam
  // down it and a face gets a wire frame. That was mine, and it was wrong.
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
  if (/pigtail|twin tail/.test(s)) return "Tails";
  if (/luxur|wave/.test(s)) return "Luxurious";
  if (/perm/.test(s)) return "Permed";
  if (/ninja|topknot/.test(s)) return "Ninja";
  if (/behind her ears|bob/.test(s)) return "Eary";
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

/** True if she is heavy enough that the pack's Fat variants are the right ones. */
function heavyset(p: Person): boolean { return p.body.weight > 30; }
function heavy(p: Person, kind: string): boolean {
  return p.body.marks.filter((m) => m.kind === kind).length >= 3;
}

/**
 * THE COCK, at its actual size.
 *
 * This used to ask for `Art_Vector_Penis` and `Art_Vector_Flaccid`, neither of which is a file in
 * the pack — it ships eleven of each, indexed by size, plus a full circumcised set. The loader
 * drops layers that 404 without complaining, so every futa in the arcology was drawn with nothing
 * between her legs and nobody found out. Same indexing as the original: clamp 1..11, minus one.
 */
function cockLayers(p: Person): Layer[] {
  const d = p.body.dick;
  if (d === null || d <= 0) return [];
  const size = Math.min(10, Math.max(0, Math.round(d) - 1));
  const circ = p.body.foreskin === 0 ? "Circ" : "";
  const out: Layer[] = [];
  // Balls sit behind the shaft, and only when there is something there to draw.
  if (p.body.balls !== null && p.body.balls > 0) out.push({ id: "Balls" });
  // Hard when she is somewhere near comfortable and not locked up; soft otherwise. The old game
  // keyed this off drugs and chastity; relaxation is the equivalent here and reads on the figure.
  const hard = !p.chastity.penis && p.psyche.relaxation > -2;
  out.push({ id: `${hard ? "Penis" : "Flaccid"}${circ}_${size}` });
  return out;
}

function areolaLayer(p: Person): string {
  const shape = p.body.marks.find((m) => m.kind === "tattoo" && /areola/i.test(m.where))?.what ?? "";
  if (/heart/i.test(shape)) return "Boob_Areola_Heart";
  if (/star/i.test(shape)) return "Boob_Areola_Star";
  if (p.body.marks.some((m) => m.kind === "piercing" && /nipple/i.test(m.where)))
    return heavy(p, "piercing") ? "Boob_Areola_Piercingheavy" : "Boob_Areola_Piercing";
  // `areolae` is generated 0-4 and was being ignored in favour of guessing from breast size, which
  // is a different fact: a small-breasted woman with wide areolae is a thing the pack can draw and
  // the game could not. The original's own ladder, restored.
  switch (Math.max(0, Math.min(4, Math.round(p.body.areolae ?? 0)))) {
    case 4: return "Boob_Areola_Massive";
    case 3: return "Boob_Areola_Huge";
    case 2: return "Boob_Areola_Wide";
    case 1: return "Boob_Areola_Large";
    default: return "Boob_Areola";
  }
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
/**
 * WHICH FACE SHE HAS.
 *
 * The pack ships six sets of eyes, mouths and noses, and this hashed her id to pick one — which
 * kept a face stable across a campaign (the thing it was written for) but meant `face_shape` was
 * generated, described in the prose, and then drawn at random. A woman the panel called "exotic"
 * had a one-in-six chance of looking it.
 *
 * The shape now picks the set and the hash only breaks ties inside it, so a face is still stable
 * and still varied, and now also agrees with the sentence next to it.
 */
const FACE_SETS: Record<string, number[]> = {
  cute: [0, 3],
  sensual: [1, 4],
  exotic: [2, 5],
  androgynous: [3, 5],
  masculine: [4, 5],
  normal: [0, 1, 2],
};

function faceHash(p: Person): number {
  let h = 0;
  for (let i = 0; i < p.id.length; i++) h = (h * 31 + p.id.charCodeAt(i)) >>> 0;
  return h;
}

/** `salt` keeps eyes, mouth and nose from all landing on the same index for the same person. */
function faceVariant(p: Person, n: number, salt = 0): number {
  const h = faceHash(p) + salt * 2654435761;
  if (n === 6) {
    const set = FACE_SETS[p.body.face_shape] ?? FACE_SETS.normal;
    return set[h % set.length];
  }
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
 * WHICH ARMS SHE HAS.
 *
 * The pack ships five prosthetic families beside the flesh ones — Basic, Beauty, Combat, Sexy and
 * Swiss — and a None for a side that is simply gone. The rebuild had no prosthetics at all, so all
 * of that art sat unreferenced; a `prosthetic` mark on her body now picks the family, and a woman
 * missing an arm is drawn missing an arm instead of drawn whole.
 */
function armFamily(p: Person): { prefix: string; kit: string } {
  const fitted = p.body.marks.find((m) => m.kind === "prosthetic" && /arm|hand|limb/i.test(m.where));
  if (fitted) {
    const w = fitted.what.toLowerCase();
    const kit = /combat/.test(w) ? "ProstheticCombat" : /beaut/.test(w) ? "ProstheticBeauty"
      : /sex/.test(w) ? "ProstheticSexy" : /swiss|multi/.test(w) ? "ProstheticSwiss" : "ProstheticBasic";
    return { prefix: "Arm", kit };
  }
  return { prefix: p.body.weight > 30 ? "ArmFat" : "Arm", kit: "" };
}

/**
 * `Arm_<Side>_<Position>` for flesh, `Arm_<Side>_<Kit>_<Position>` for a fitted limb — the kit sits
 * between the side and the position, which is not where you would guess. The sets are also not
 * complete: Rebel and Thumb_Down exist on the left only, so an unheld position falls back to Mid.
 * The renderer skips layers it cannot find, and a silently missing arm is exactly the class of bug
 * that put every futa's cock in the bin.
 */
const RIGHT_HAS: ArmPos[] = ["High", "Mid", "Low", "None"];

function armLayer(fam: { prefix: string; kit: string }, side: "Left" | "Right", pos: ArmPos): string {
  if (pos === "None") return `${fam.prefix}_${side}_None`;
  const use: ArmPos = side === "Right" && !RIGHT_HAS.includes(pos) ? "Mid" : pos;
  return fam.kit ? `${fam.prefix}_${side}_${fam.kit}_${use}` : `${fam.prefix}_${side}_${use}`;
}

/**
 * THE FACE — the part the original does properly and this did not.
 *
 * The pack ships six sets each of eyes, mouths, noses and eyebrows, and the obvious thing to do
 * with six of anything is pick one at random. That is what this used to do, and it is wrong twice
 * over: the sets were drawn to go together in specific combinations, and picking each feature from
 * its own hash produces a face nobody drew — eyes from one design sitting above a mouth from
 * another, at coordinates that were never meant to meet.
 *
 * The original's answer is a hand-built table keyed on race and face shape, seventy-odd rows of it,
 * every row a matched set. That is why its faces look drawn and the shuffled version looks like a
 * ransom note. It is ported here verbatim.
 *
 * Two other things were wrong in the same place and were most of the visible mess:
 *
 *   · `Art_Vector_Face` was being drawn under the features. It is not a base layer — it is a
 *     COMPLETE face, eyes brows nose and lips already on it, an alternative to this whole system.
 *     Stacking the feature layers on top of it drew a second face over the first, slightly out of
 *     register, which is where the lines across the cheeks and through the mouth came from.
 *   · `Lip_Light` and `Lip_Heavy` are LIP PIERCINGS, and `Nose_Light`/`Nose_Heavy` are nose rings.
 *     They were being drawn on everybody unconditionally, which is why every woman in the arcology
 *     had two small steel studs beside her mouth that nobody had bought her.
 */
type FaceSet = readonly [eyes: string, mouth: string, nose: string, brow: string];

const FACES: Record<string, Record<string, FaceSet>> = {
  white: {
    normal: ["TypeB", "TypeA", "TypeA", "TypeA"], masculine: ["TypeD", "TypeF", "TypeF", "TypeE"],
    androgynous: ["TypeE", "TypeE", "TypeE", "TypeF"], cute: ["TypeB", "TypeB", "TypeD", "TypeA"],
    sensual: ["TypeC", "TypeC", "TypeC", "TypeC"], exotic: ["TypeA", "TypeC", "TypeC", "TypeC"],
  },
  asian: {
    normal: ["TypeA", "TypeC", "TypeC", "TypeD"], masculine: ["TypeD", "TypeD", "TypeB", "TypeC"],
    androgynous: ["TypeE", "TypeE", "TypeA", "TypeC"], cute: ["TypeC", "TypeC", "TypeC", "TypeF"],
    sensual: ["TypeA", "TypeA", "TypeE", "TypeC"], exotic: ["TypeB", "TypeC", "TypeF", "TypeA"],
  },
  latina: {
    normal: ["TypeB", "TypeE", "TypeD", "TypeB"], masculine: ["TypeE", "TypeD", "TypeF", "TypeC"],
    androgynous: ["TypeA", "TypeD", "TypeB", "TypeD"], cute: ["TypeF", "TypeB", "TypeB", "TypeF"],
    sensual: ["TypeB", "TypeE", "TypeC", "TypeF"], exotic: ["TypeC", "TypeA", "TypeC", "TypeE"],
  },
  black: {
    normal: ["TypeD", "TypeB", "TypeF", "TypeF"], masculine: ["TypeA", "TypeD", "TypeF", "TypeE"],
    androgynous: ["TypeF", "TypeE", "TypeB", "TypeE"], cute: ["TypeC", "TypeE", "TypeD", "TypeB"],
    sensual: ["TypeC", "TypeF", "TypeA", "TypeC"], exotic: ["TypeE", "TypeE", "TypeC", "TypeA"],
  },
  "middle eastern": {
    normal: ["TypeB", "TypeA", "TypeA", "TypeA"], masculine: ["TypeD", "TypeF", "TypeA", "TypeB"],
    androgynous: ["TypeF", "TypeB", "TypeF", "TypeF"], cute: ["TypeB", "TypeB", "TypeC", "TypeA"],
    sensual: ["TypeA", "TypeD", "TypeA", "TypeC"], exotic: ["TypeE", "TypeE", "TypeE", "TypeE"],
  },
  mixed: {
    normal: ["TypeE", "TypeA", "TypeD", "TypeA"], masculine: ["TypeF", "TypeD", "TypeE", "TypeC"],
    androgynous: ["TypeC", "TypeB", "TypeD", "TypeF"], cute: ["TypeC", "TypeD", "TypeA", "TypeD"],
    sensual: ["TypeA", "TypeE", "TypeC", "TypeD"], exotic: ["TypeA", "TypeC", "TypeC", "TypeC"],
  },
};

/** This game's nationalities carry races the original did not name; map to the nearest row it has
 *  rather than falling through to one default and making half the cast look related. */
const RACE_ALIAS: Record<string, string> = {
  "indo-aryan": "middle eastern",
  "southern european": "white",
  semitic: "middle eastern",
  amerindian: "latina",
  malay: "asian",
  "pacific islander": "asian",
  "mixed race": "mixed",
};

const BROW_FULLNESS = ["Natural", "Thin", "Thick", "Bushy", "Tapered", "Threaded", "Pencilthin"];

function faceLayers(p: Person): Layer[] {
  const race = RACE_ALIAS[p.origin.race] ?? p.origin.race;
  const rows = FACES[race] ?? FACES.white;
  const shape = rows[p.body.face_shape] ? p.body.face_shape : "normal";
  const [eyes, mouth, nose, brow] = rows[shape];
  // Only the brow's fullness is hers to vary — the four features are a set and stay one.
  const fullness = BROW_FULLNESS[faceHash(p) % BROW_FULLNESS.length];
  return [
    { id: `Eyes_${eyes}` },
    { id: `Mouth_${mouth}` },
    { id: `Nose_${nose}` },
    { id: `Eyebrow_${brow}_${fullness}` },
  ];
}

/* ── what she is wearing ─────────────────────────────────────────────────────────────────────
 * The pack's clothing is cut per body part — arms per position, torso per build, butt per size,
 * legs per width, breasts and belly on their own transforms — and each piece goes in at the same
 * point in the stack the original puts it, so a sleeve sits over an arm and under the hair. */

function torsoSize(p: Person): string { return torsoLayer(p).replace("Torso_", ""); }
function legSize(p: Person): string { return legLayer(p).replace("Leg_", ""); }
function buttIndex(p: Person): number { return Math.max(0, Math.min(6, Math.round(p.body.butt))); }
const ARM_OUTFIT_POS: Record<string, string> = { High: "High", Mid: "Mid", Low: "Low", Rebel: "Rebel", Thumb_Down: "Thumb", None: "None" };

/** The hue shift for her clothes, carried on each clothing layer so the skin under it is untouched. */
function worn(id: string, p: Person, transform?: string): Layer {
  const hue = p.look?.clothes_hue ?? 0;
  return { id, transform, tint: hue ? hue : undefined };
}

/**
 * THE STACK. Back to front, and every entry optional at render time.
 */
export function layersFor(p: Person, pose: Pose = restingPose(p)): Layer[] {
  const out: Layer[] = [];
  const len = hairLength(p);
  const style = hairStyle(p);
  const heightScale = Math.max(0.7, Math.min(1.25, p.body.height_cm / 170));

  // BEHIND THE BODY, and the arms belong here with it.
  //
  // The original's order is stated once in VectorArtJS and is not obvious: hair back, then ARMS,
  // then butt, legs, feet, torso, and only then the front of the body. Drawing the arms late — as
  // this did — looks fine while every pose has them hanging at her sides, and falls apart the
  // moment one goes up: the raised arm paints over the hair it should be behind, and a woman with
  // her hands behind her head ends up wearing her hair as a cap. The art is cut for this order.
  if (len) out.push({ id: `Hair_Back_${style}_${len}` }, { id: `Hair_Back_${style}` });

  const limb = armFamily(p);
  out.push({ id: armLayer(limb, "Left", pose.armL) }, { id: armLayer(limb, "Right", pose.armR) });
  const g = garment(p.clothes);
  const fit = g?.art;
  if (fit) {
    out.push(worn(`Arm_Outfit_${fit}_Right_${ARM_OUTFIT_POS[pose.armR] ?? "Mid"}`, p));
    out.push(worn(`Arm_Outfit_${fit}_Left_${ARM_OUTFIT_POS[pose.armL] ?? "Mid"}`, p));
  }
  if (g?.shine && ["High", "Mid", "Low"].includes(pose.armL)) out.push({ id: `Arm_Outfit_Shine_Left_${pose.armL}` });
  if (p.look?.tail) out.push({ id: `${cap(p.look.tail)}_Tail` });

  out.push({ id: buttLayer(p) });
  out.push({ id: legLayer(p) });

  // FEET, OR WHAT IS ON THEM, then stockings, then the lower half of the outfit.
  const shoe = garment(p.shoes)?.art;
  if (shoe === "Shoes_Boot" || shoe === "Shoes_Extreme_Heel") out.push({ id: `${shoe}_${legSize(p)}` });
  else if (shoe) out.push({ id: shoe });
  else out.push({ id: "Feet" });
  const hose = garment(p.legwear)?.art;
  if (hose) {
    const base = shoe === "Shoes_Heel" ? "Shoes_Heel" : shoe === "Shoes_Pump" ? "Shoes_Pump" : shoe === "Shoes_Flat" ? "Shoes_Flat" : !shoe ? "Shoes_Stockings" : "";
    if (base) out.push({ id: `${base}_${hose}_${legSize(p)}` });
  }
  if (fit) {
    out.push(worn(`Butt_Outfit_${fit}_${buttIndex(p)}`, p));
    out.push(worn(`Leg_Outfit_${fit}_${legSize(p)}`, p));
  } else if (g?.shine) out.push({ id: `Leg_Outfit_Shine_${legSize(p)}` });

  out.push({ id: torsoLayer(p) });

  // the front of the body
  if (p.body.vagina !== null) {
    out.push({ id: "Pussy" });
    if (p.body.marks.some((m) => m.kind === "piercing" && /pussy|clit|labia|genital/i.test(m.where)))
      out.push({ id: heavy(p, "piercing") ? "Pussy_Piercing_Heavy" : "Pussy_Piercing" });
    if (p.body.marks.some((m) => m.kind === "tattoo" && /pussy|groin|genital/i.test(m.where)))
      out.push({ id: heavyset(p) ? "Pussy_TattooFat" : "Pussy_Tattoo" });
  }
  out.push({ id: pubicLayer(p) });
  if (p.chastity.vagina && p.body.vagina !== null) out.push({ id: heavyset(p) ? "Chastity_Vagina_Fat" : "Chastity_Vagina" });
  if (fit) out.push(worn(`Torso_Outfit_${fit}_${torsoSize(p)}`, p));
  if (g?.shine) out.push({ id: `Torso_Outfit_Shine_${torsoSize(p)}` }, { id: "Torso_Outfit_Shine_Shoulder" });
  // Under clothes a cock is a shape in the fabric, which the pack draws as its own layer.
  if (g?.covers && p.body.dick) {
    const size = Math.min(10, Math.max(0, Math.round(p.body.dick) - 1));
    out.push({ id: !p.chastity.penis && p.psyche.relaxation > -2 && p.psyche.arousal > 50 ? `Bulge_Outfit_Hard_${size}` : `Bulge_Outfit_${size}` });
  } else out.push(...cockLayers(p));

  const belly = bellyTransform(p);
  if (belly) {
    out.push({ id: "Belly", transform: belly });
    if (fit) out.push(worn(`Belly_Outfit_${fit}`, p, belly));
    if (g?.shine) out.push({ id: "Belly_Outfit_Shine", transform: belly });
  }

  const boob = boobTransform(p, heightScale);
  if (boob) {
    out.push({ id: "Boob_Alt", transform: boob });
    out.push({ id: areolaLayer(p), transform: boob });
    out.push({ id: nippleLayer(p), transform: boob });
    if (fit && p.body.boobs >= 300) out.push(worn(`Boob_Outfit_${fit}`, p, boob));
    if (g?.shine) out.push({ id: "Boob_Outfit_Shine", transform: boob });
  }

  // the face
  out.push({ id: "Head" });
  out.push(...faceLayers(p));
  // Facial piercings, which is what Lip_* and Nose_Light/Heavy actually are.
  const pierced = (where: RegExp) => p.body.marks.filter((m) => m.kind === "piercing" && where.test(m.where)).length;
  const lips = pierced(/lip|mouth/i);
  if (lips) out.push({ id: lips > 1 ? "Lip_Heavy" : "Lip_Light" });
  const nose = pierced(/nose|septum/i);
  if (nose) out.push({ id: nose > 1 ? "Nose_Heavy" : "Nose_Light" });
  if (p.look?.glasses) out.push({ id: "Glasses" });
  if (fit) out.push(worn(`Head_Outfit_${fit}`, p));
  if (g?.shine) out.push({ id: "Head_Outfit_Shine" });

  // The collar goes under the fore hair, the way the original draws it.
  const collar = garment(p.collar)?.art;
  if (collar) out.push({ id: collar });

  // in front
  const ears = p.look?.ears ?? (g?.id === "kitty" ? "cat" : undefined);
  if (ears) out.push({ id: `${cap(ears)}_Ear_Back` });
  if (len) out.push({ id: `Hair_Fore_${style}_${len}` }, { id: `Hair_Fore_${style}` });
  if (ears) out.push({ id: `${cap(ears)}_Ear_Fore` });

  return out;
}

/** Height is rendered as scale, exactly as the original does it. */
export function heightScaleFor(p: Person): number {
  return Math.max(0.72, Math.min(1.22, p.body.height_cm / 172));
}
