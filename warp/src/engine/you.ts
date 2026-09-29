/**
 * YOUR BODY.
 *
 * The original game lets you shape the player character as far as any slave, and the scenes read
 * it: a scene can't have you finish inside her if you have nothing to finish with. Everything
 * here is stored on `player.body` in the same shape as a slave's, so the same art draws you and
 * the same words describe you.
 */
import type { Body, Person, Pronouns, SaveState } from "./types";
import { generatePerson } from "./generate";
import { buildOf, kgFor } from "./build";

export type Kit = "cock" | "pussy" | "both";

const COMMON: Partial<Body> = {
  height_cm: 175, weight: 0, muscle: 20, face: 60, face_shape: "normal",
  nipples: "cute", areolae: 1, butt: 2, butt_implant: 0, boob_implant: 0, hips: 0, waist: 0, shoulders: 0,
  vagina_lube: 1, clit: 1, labia: 1, hymen: false, prostate: 1, anus: 1, lactation: 0, lactation_weeks: 0,
  belly: 0, belly_implant: 0, belly_sag: 0,
  skin: "light", hair_color: "brown", hair_length: 20, hair_style: "neat", pubic_hair: "neat",
  eye_color: "brown", eyes: "normal", ears: "normal", voice: 2, teeth: "normal", marks: [],
};

/** Where each choice on the start screen begins. Every number is editable afterwards. */
export const KITS: Record<Kit, { label: string; body: Partial<Body> }> = {
  cock: { label: "a cock", body: { dick: 4, balls: 3, foreskin: 2, vagina: null, boobs: 0, hips: 0, waist: 30, shoulders: 1, muscle: 30, face_shape: "masculine", hair_length: 6, height_cm: 180 } },
  pussy: { label: "a pussy", body: { dick: null, balls: null, foreskin: null, vagina: 2, boobs: 500, hips: 1, waist: -20, shoulders: 0, muscle: 15, face_shape: "normal", hair_length: 45, height_cm: 168 } },
  both: { label: "both", body: { dick: 4, balls: 2, foreskin: 2, vagina: 2, boobs: 400, hips: 0, waist: -10, shoulders: 0, muscle: 20, face_shape: "androgynous", hair_length: 30, height_cm: 172 } },
};

/** Your body with every field filled. Saves from before this existed had only a sentence, and the
 *  scenes they played were written for a cock, so that is what they get until you change it. */
export function playerBody(s: SaveState): Body {
  const b = s.player.body as Partial<Body>;
  const kit = b.dick === undefined && b.vagina === undefined ? KITS.cock.body : {};
  const out = { ...COMMON, ...kit, ...b } as Body;
  out.weight_kg = kgFor(out.weight, out.height_cm);
  out.appearance_now = out.appearance_now ?? "";
  return out;
}

/** Fill in everything missing, once, so editors have something to edit. */
export function settleBody(s: SaveState, kit?: Kit): void {
  const base = kit ? { ...COMMON, ...KITS[kit].body } : playerBody(s);
  s.player.body = { ...base, ...(kit ? {} : s.player.body), appearance_facts: s.player.body.appearance_facts } as Body & { appearance_facts: string };
}

export function hasCock(s: SaveState): boolean { const d = playerBody(s).dick; return d !== null && d > 0; }
export function hasPussy(s: SaveState): boolean { return playerBody(s).vagina !== null; }
/** Whether what you leave in her can take. */
export function canSire(s: SaveState): boolean { const b = playerBody(s); return hasCock(s) && b.balls !== null && b.balls > 0; }

export function kitOf(s: SaveState): Kit {
  return hasCock(s) && hasPussy(s) ? "both" : hasCock(s) ? "cock" : "pussy";
}

/** You, as something the figure renderer can draw. Built from a fixed template so the parts of a
 *  Person the art never reads are stable. */
export function playerAsPerson(s: SaveState): Person {
  const p = generatePerson({ seed: "player-figure", age: s.player.age });
  p.id = "player";
  p.name = s.player.name;
  p.body = { ...playerBody(s), marks: playerBody(s).marks ?? [] };
  p.clothes = s.player.clothes ?? "no clothing";
  p.shoes = s.player.shoes ?? "none";
  p.collar = "none";
  p.legwear = s.player.legwear;
  p.look = s.player.look;
  p.womb = { ...p.womb, fetuses: [], weeks: 0 };
  p.chastity = { vagina: false, anus: false, penis: false };
  return p;
}

/** One sentence for the narrator, built from the numbers. */
export function describeYou(s: SaveState): string {
  const b = playerBody(s);
  const parts: string[] = [];
  parts.push(`${b.height_cm}cm`);
  const build = buildOf(b.weight);
  parts.push(build === "slim" ? (b.muscle > 40 ? "muscular" : "average build") : build);
  if (b.boobs >= 300) parts.push(b.boobs > 1200 ? "enormous breasts" : b.boobs > 700 ? "big breasts" : "breasts");
  else parts.push("flat chest");
  const g: string[] = [];
  if (b.dick !== null && b.dick > 0) g.push(b.dick >= 6 ? "a huge cock" : b.dick >= 4 ? "a cock" : "a small cock");
  if (b.vagina !== null) g.push("a pussy");
  parts.push(g.join(" and ") || "nothing between the legs");
  parts.push(`${b.hair_color} hair`, `${b.skin} skin`);
  return parts.join(", ");
}

/**
 * WHO YOU ARE, SAID PLAINLY.
 *
 * The owner used to be "they/them" for everyone, with a body described only in one line of one
 * prompt, and every other call to the model was left to guess. It guessed differently each time:
 * a cock in one scene, a pussy in the next. Your pronouns are now chosen, a sensible default is
 * inferred for saves made before there was a choice, and this statement goes to every model call.
 */
const FEMININE = /^(mistress|ma'?am|madam|lady|queen|goddess|mommy|mother)$/i;
const MASCULINE = /^(master|sir|lord|king|daddy|father)$/i;

/** A default from what the household calls you, then from your body. */
export function inferPronouns(kit: Kit, address?: string): Pronouns {
  const a = (address ?? "").trim();
  if (FEMININE.test(a)) return "she/her";
  if (MASCULINE.test(a)) return "he/him";
  return kit === "cock" ? "he/him" : "she/her";
}

/** Saves from before the choice existed get the inferred pronouns, once. */
export function settlePronouns(s: SaveState): void {
  if (s.player.pronouns_set) return;
  if (s.player.pronouns === "they/them" || !s.player.pronouns) s.player.pronouns = inferPronouns(kitOf(s), s.player.address);
  s.player.pronouns_set = true;
}

/** "a man", "a woman", "a futanari woman" — what the narrator should picture, from both halves. */
export function genderWord(s: SaveState): string {
  const pr = s.player.pronouns;
  const cock = hasCock(s), pussy = hasPussy(s);
  if (pr === "they/them") return cock && pussy ? "a person with both a cock and a pussy" : cock ? "a person with a cock" : "a person with a pussy";
  if (pr === "he/him") return cock && pussy ? "a man who has a pussy as well as a cock" : cock ? "a man" : "a man with a pussy and no cock";
  return cock && pussy ? "a futanari woman: a woman with a cock and balls as well as a pussy" : pussy ? "a woman" : "a woman with a cock and no pussy";
}

/**
 * Whether a name a model wrote is the owner. The player is one person under several labels —
 * "you", "the player", "the owner", their name, their title — and a model that sees the name in
 * one place and "you" in another will happily make two people of them.
 */
export function isOwnerName(s: SaveState, name: string | undefined): boolean {
  const n = (name ?? "").toLowerCase().replace(/[^\p{L}' ]/gu, " ").replace(/\s+/g, " ").trim();
  if (!n) return false;
  if (/^(you|yourself|the player|player|the owner|owner|the arcology owner|the arcologist)$/.test(n)) return true;
  const full = (s.player.name ?? "").toLowerCase().trim();
  if (full && full !== "you" && (n === full || n === full.split(" ")[0] || n.startsWith(`${full} `))) return true;
  const title = (s.player.address ?? "").toLowerCase().trim();
  return !!title && (n === title || n === `the ${title}`);
}

export function ownerLine(s: SaveState): string {
  const b = playerBody(s);
  const pr = s.player.pronouns ?? "he/him";
  const [subj, obj, pos] = pr === "she/her" ? ["she", "her", "her"] : pr === "they/them" ? ["they", "them", "their"] : ["he", "him", "his"];
  const has: string[] = [], hasnt: string[] = [];
  (hasCock(s) ? has : hasnt).push("a cock");
  (canSire(s) ? has : hasnt).push("balls");
  (hasPussy(s) ? has : hasnt).push("a pussy");
  (b.boobs >= 300 ? has : hasnt).push("breasts");
  const named = s.player.name && s.player.name !== "you" ? s.player.name : "";
  const name = named ? `${named}, ` : "";
  const title = s.player.address || (pr === "she/her" ? "Mistress" : "Master");
  const one = `"You", the player, the owner${named ? `, ${named}` : ""} and "${title}" are ONE person, the person reading. Write that person only as "you", in the second person. Never write the owner as a separate character in the third person${named ? ` ("${named} walks in", "${named}'s orders")` : ""}, never put the owner in a cast list, and never ask what the owner${named ? ` or ${named}` : ""} should do: every choice offered is something YOU do. Other characters may say ${named ? `"${named}" or ` : ""}"${title}" aloud when they speak to or about you.`;
  return `THE OWNER (the player, written as "you"): ${name}${genderWord(s)}. ${one} Pronouns ${pr}: anyone speaking about the owner says ${subj}/${obj}/${pos}. Slaves call the owner "${s.player.address || (pr === "she/her" ? "Mistress" : "Master")}". The owner's body: ${describeYou(s)}. The owner HAS ${has.join(", ")}; the owner DOES NOT HAVE ${hasnt.join(", ") || "anything missing"}. Never give the owner a body part they do not have or take away one they do; every scene, memory and line of dialogue keeps to this.${s.player.body.appearance_facts ? ` ${s.player.body.appearance_facts}` : ""}`;
}
