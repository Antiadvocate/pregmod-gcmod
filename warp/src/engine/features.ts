/**
 * WHAT MAKES HER LOOK LIKE NOBODY ELSE.
 *
 * The body record already varies a great deal (height, weight, muscle, shoulders, waist, hips,
 * breasts, butt, face, colouring), but most of those are smooth scales, and two women at the same
 * point on all of them were the same drawing. These are the marks and rarities that make one woman
 * recognisable at a glance and some of them genuinely rare: freckles, a beauty mark, eyes of two
 * colours, vitiligo, a birthmark, albinism.
 *
 * Each is rolled once from her own id, so a woman from an old save gets hers the first time anyone
 * looks, and keeps them. How likely each is follows her colouring (freckles are a fair-skinned
 * thing; vitiligo shows most on dark skin), and the rare ones are rare: one woman in a hundred has
 * eyes of two colours, one in four hundred is albino. They're drawn (lib/finish.tsx), written into
 * what the narrator knows about her, and priced (economy.valuePerson): a rare woman is worth having.
 */
import type { Person } from "./types";
import { rng } from "./rng";

export type FeatureId =
  | "freckles" | "heavy_freckles" | "beauty_mark" | "dimples" | "long_lashes" | "full_lips"
  | "heterochromia" | "striking_eyes" | "vitiligo" | "birthmark" | "albino" | "stretch_marks" | "natural_redhead";

export interface Feature {
  id: FeatureId;
  /** Where on her it is, for the ones that sit somewhere: "left cheek", "right shoulder". */
  where?: string;
  /** The second eye colour, a birthmark's kind, and so on. */
  detail?: string;
  /** Places it on her drawing; fixed for life. */
  seed: number;
}

export interface FeatureDef {
  id: FeatureId;
  /** What a buyer's catalogue calls it. */
  label: string;
  /** 1 common … 4 very rare. */
  rarity: 1 | 2 | 3 | 4;
  /** What it does to her price, as a multiplier. */
  value: number;
  /** For the narrator: a plain fact about her body. */
  words: (f: Feature) => string;
}

export const FEATURES: Record<FeatureId, FeatureDef> = {
  freckles: { id: "freckles", label: "freckles", rarity: 1, value: 1.03, words: () => "a dusting of freckles across her nose and cheeks" },
  heavy_freckles: { id: "heavy_freckles", label: "heavy freckles", rarity: 2, value: 1.08, words: () => "freckles everywhere, thick across her face, shoulders, chest and arms" },
  beauty_mark: { id: "beauty_mark", label: "beauty mark", rarity: 1, value: 1.03, words: (f) => `a small dark beauty mark on her ${f.where}` },
  dimples: { id: "dimples", label: "dimples", rarity: 1, value: 1.03, words: () => "deep dimples when she smiles" },
  long_lashes: { id: "long_lashes", label: "long lashes", rarity: 1, value: 1.02, words: () => "unusually long, dark lashes" },
  full_lips: { id: "full_lips", label: "naturally full lips", rarity: 2, value: 1.05, words: () => "naturally full, soft lips" },
  stretch_marks: { id: "stretch_marks", label: "stretch marks", rarity: 1, value: 0.98, words: (f) => `faint silvery stretch marks on her ${f.where}` },
  natural_redhead: { id: "natural_redhead", label: "natural redhead", rarity: 3, value: 1.15, words: () => "true natural red hair, red all over" },
  striking_eyes: { id: "striking_eyes", label: "striking eyes", rarity: 3, value: 1.15, words: (f) => `strikingly pale, bright ${f.detail} eyes that people stop to look at` },
  birthmark: { id: "birthmark", label: "birthmark", rarity: 2, value: 1.0, words: (f) => `a ${f.detail} birthmark on her ${f.where}` },
  vitiligo: { id: "vitiligo", label: "vitiligo", rarity: 3, value: 1.12, words: (f) => `vitiligo, with pale, sharply edged patches of unpigmented skin on her ${f.where}` },
  heterochromia: { id: "heterochromia", label: "heterochromia", rarity: 4, value: 1.3, words: (f) => `eyes of two different colours, with her left one ${f.detail}` },
  albino: { id: "albino", label: "albino", rarity: 4, value: 1.6, words: () => "albinism, with milk-white skin, white hair and white lashes, pale pinkish-violet eyes, and she squints in bright light" },
};

const FACE_SPOTS = ["left cheek", "right cheek", "upper lip", "chin", "left temple"];
const BODY_SPOTS = ["collarbone", "left breast", "right shoulder", "left hip", "lower back", "inner thigh"];
const PATCH_SPOTS = ["hands and wrists", "face and neck", "knees and shins", "belly and hips"];
const MARK_SPOTS = ["right shoulder", "left thigh", "neck", "lower back", "left hip"];
const OTHER_EYES = ["blue", "green", "brown", "hazel", "grey", "amber"];

const fair = (p: Person) => /pale|porcelain|fair|light(?! brown)|white/i.test(p.body.skin) && !/engineered|dyed/i.test(p.body.skin);
const dark = (p: Person) => /dark|deep brown|brown|black/i.test(p.body.skin) && !/light brown|engineered|dyed/i.test(p.body.skin);

/** Roll her features. Deterministic from her id: the same woman always comes out the same. */
export function rollFeatures(p: Person, opts: { generated?: boolean } = {}): Feature[] {
  const r = rng(`features:${p.id}`);
  const out: Feature[] = [];
  const add = (id: FeatureId, extra: Partial<Feature> = {}) => out.push({ id, seed: r.int(1, 1e9), ...extra });
  const redHair = /red|ginger|auburn|strawberry/i.test(p.body.hair_color) && !/dyed/i.test(p.body.hair_color);
  // Albinism rewrites her colouring, so only a woman being made for the first time can be born with it.
  if (opts.generated && r.chance(0.0025)) add("albino");
  const albino = out.some((f) => f.id === "albino");
  const freckleOdds = albino ? 0 : redHair ? 0.55 : fair(p) ? 0.22 : dark(p) ? 0.03 : 0.09;
  if (r.chance(freckleOdds)) add(r.chance(redHair ? 0.4 : 0.18) ? "heavy_freckles" : "freckles");
  if (redHair && r.chance(0.35)) add("natural_redhead");
  if (r.chance(0.16)) add("beauty_mark", { where: r.chance(0.6) ? r.pick(FACE_SPOTS) : r.pick(BODY_SPOTS) });
  if (r.chance(0.12)) add("dimples");
  if (r.chance(0.1)) add("long_lashes");
  if (r.chance(0.06)) add("full_lips");
  if ((p.body.boobs > 900 || p.body.weight > 25 || p.body.butt >= 6) && r.chance(0.3)) add("stretch_marks", { where: p.body.boobs > 900 && r.chance(0.5) ? "breasts" : "hips and thighs" });
  if (r.chance(0.025)) add("birthmark", { where: r.pick(MARK_SPOTS), detail: r.chance(0.5) ? "port-wine" : "café-au-lait" });
  if (!albino && r.chance(dark(p) ? 0.02 : 0.008)) add("vitiligo", { where: r.pick(PATCH_SPOTS) });
  if (!albino && r.chance(0.01)) add("heterochromia", { detail: r.pick(OTHER_EYES.filter((c) => !new RegExp(c, "i").test(p.body.eye_color))) });
  if (!albino && /blue|grey|gray|green/i.test(p.body.eye_color) && r.chance(0.025)) add("striking_eyes", { detail: (/blue/i.exec(p.body.eye_color) ?? /green/i.exec(p.body.eye_color) ?? ["grey"])[0].toLowerCase() });
  return out;
}

/** Her features, rolled the first time they're asked for. */
export function featuresOf(p: Person): Feature[] {
  return (p.body.features ??= rollFeatures(p));
}

export function hasFeature(p: Person, id: FeatureId): Feature | undefined {
  return featuresOf(p).find((f) => f.id === id);
}

/** Make an albino of her: called once, by the generator, when she rolls it. */
export function applyAlbinism(p: Person): void {
  p.body.skin = "milk-white, almost translucent";
  p.body.hair_color = "white";
  p.body.eye_color = "pale violet";
}

/** What she's worth for what she looks like that nobody else does. */
export function rarityValue(p: Person): number {
  return featuresOf(p).reduce((k, f) => k * FEATURES[f.id].value, 1);
}

/** The rarest thing about her, for a catalogue line or a chip: 0 when there's nothing unusual. */
export function rarityOf(p: Person): 0 | 1 | 2 | 3 | 4 {
  return featuresOf(p).reduce<number>((m, f) => Math.max(m, FEATURES[f.id].rarity), 0) as 0 | 1 | 2 | 3 | 4;
}

export const RARITY_WORD = ["", "", "uncommon", "rare", "very rare"] as const;

/** For her card: the facts, in words. */
export function featuresLine(p: Person): string {
  const fs = featuresOf(p);
  return fs.length ? `WHAT'S DISTINCTIVE ABOUT HER. These are real and permanent, so bring one up only when it matters to the moment, not in every scene. She has ${fs.map((f) => FEATURES[f.id].words(f)).join(", and ")}.` : "";
}

const SHORT: Partial<Record<FeatureId, (f: Feature) => string>> = {
  freckles: () => "Freckled.",
  heavy_freckles: () => "Freckled all over.",
  beauty_mark: (f) => `A beauty mark on her ${f.where}.`,
  natural_redhead: () => "A natural redhead.",
  striking_eyes: (f) => `Striking pale ${f.detail} eyes.`,
  birthmark: (f) => `A ${f.detail} birthmark on her ${f.where}.`,
  vitiligo: (f) => `Vitiligo on her ${f.where}.`,
  heterochromia: (f) => `Eyes of two colours (her left is ${f.detail}).`,
  albino: () => "Albino.",
};

/** A sentence or two for the line under her name. */
export function featureFacts(p: Person): string {
  return featuresOf(p).map((f) => SHORT[f.id]?.(f)).filter(Boolean).join(" ");
}
