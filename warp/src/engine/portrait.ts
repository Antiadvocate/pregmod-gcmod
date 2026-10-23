/**
 * WHAT TO SAY TO THE SAMPLER.
 *
 * The prompt is built in two halves, and keeping them apart is the whole trick of a cast that
 * holds still: BEDROCK (the face, the body, the colouring — written once at the first portrait and
 * then reused verbatim forever) and THIS MOMENT (clothes, belly, mood, what is being done, where).
 * Bedrock never gets re-derived from live state, because a clause re-derived every turn drifts a
 * few words at a time and hands you a stranger by the tenth picture.
 *
 * Dialect matters as much as content. Flux, SD3 and anything with a T5 encoder read sentences;
 * SD1.5, SDXL, Pony and their descendants parse comma-separated tags and stop attending past about
 * seventy tokens. Both are built here and the endpoint's `prompt_style` picks.
 */
import type { Person, SaveState } from "./types";
import { getLocalImage } from "../config";
import { ACT_BY_ID } from "../data/intimacy";
import { hash } from "./rng";
import { buildOf } from "./build";
import { ballsCM, ballsWord, clitWord, dickCM, dickWord, feetOf, footSizeWord, labiaWord } from "./genitals";
import { FEATURES, featuresOf } from "./features";

/** The bedrock clause. Written once, stored on the person, never regenerated. */
export function visualSignature(p: Person, style: "natural" | "tags"): string {
  if (p.body.visual_signature) return p.body.visual_signature;
  const b = p.body;
  const w = buildOf(b.weight);
  const build = w === "slim" ? (b.muscle > 30 ? "athletic, toned" : "average build")
    : { skinny: "very thin, bony", thin: "thin", plump: "curvy, soft", chubby: "chubby", fat: "fat, heavy", obese: "obese" }[w];
  const chest = b.boobs > 1400 ? "enormous breasts" : b.boobs > 800 ? "huge breasts" : b.boobs > 450 ? "large breasts" : b.boobs > 200 ? "medium breasts" : "small breasts";
  const hair = `${b.hair_length > 60 ? "long" : b.hair_length > 20 ? "shoulder-length" : "short"} ${b.hair_color} hair`;
  const age = `${p.physical_age} years old`;

  if (style === "tags") {
    return [
      "1girl", `${p.origin.race}`, age, `${b.skin} skin`, hair, `${b.eye_color} eyes`,
      build, chest, b.butt >= 6 ? "wide hips, big ass" : "", b.face > 75 ? "beautiful face" : "",
    ].filter(Boolean).join(", ");
  }
  return `a ${age.replace(" years old", "-year-old")} ${p.origin.nationality} woman with ${b.skin} skin, ${hair} and ${b.eye_color} eyes, ${build}, ${chest}`;
}

/**
 * What shows between her legs when she is naked. Kept out of bedrock on purpose: cocks get cut
 * off, grown and caged, and a locked clause would go on drawing the old one. Without it the word
 * "woman" wins and the sampler paints over a cock the doll plainly has.
 */
export function genitalClause(p: Person, style: "natural" | "tags"): string {
  const b = p.body;
  const dick = b.dick ?? 0, balls = b.balls ?? 0;
  if (dick > 0) {
    const caged = !!p.chastity.penis;
    if (style === "tags") return ["futanari", "penis", caged ? "chastity cage" : "", balls > 0 ? "testicles" : ""].filter(Boolean).join(", ");
    const size = dickWord(dick);
    const cock = `${/^[aeiou]/.test(size) ? "an" : "a"} ${size} penis${caged ? " locked in a chastity cage" : ""}`;
    return `with ${cock}${balls > 0 ? ` and ${ballsWord(balls)} testicles` : " and no testicles"}`;
  }
  if (b.vagina === null) return style === "tags" ? "featureless crotch" : "smooth and featureless between the legs";
  return "";
}

/**
 * EVERYTHING ON HER CARD THAT A CAMERA COULD SEE, for the realistic pass. That pass already has her
 * shape from the doll, so the words are free to carry detail the line art cannot: the measurements,
 * the marks, the state of her cock and labia, the paint on her toenails. What is felt rather than
 * seen (wetness, ticklishness, what comes out of her) stays out — a sampler cannot draw it.
 */
export function physicalDescription(p: Person): string {
  const b = p.body;
  const out: string[] = [b.appearance_facts.trim().replace(/\.?$/, ".")];
  if (b.appearance_now && !/^wearing whatever/.test(b.appearance_now)) out.push(`${b.appearance_now.trim().replace(/\.?$/, ".")}`);
  // Numbers a sampler can use stay numbers; the 0–100 and 0–10 scales become words, which it can.
  const face = b.face > 85 ? "stunningly beautiful" : b.face > 65 ? "beautiful" : b.face > 45 ? "pretty" : b.face > 25 ? "ordinary-looking" : "plain";
  const butt = b.butt >= 8 ? "an enormous butt" : b.butt >= 6 ? "a big round butt" : b.butt >= 4 ? "a full butt" : b.butt >= 2 ? "a modest butt" : "a flat butt";
  out.push(`${/^[aeiou]/.test(face) ? "An" : "A"} ${face} face; ${b.weight_kg}kg; ${b.hair_length}cm of ${b.hair_color} hair.`);
  out.push(`Breasts about ${b.boobs}cc${b.boob_implant ? ", visibly implanted" : ""}${b.lactation ? ", swollen with milk" : ""}; ${butt}.`);
  if (p.womb.weeks > 16) out.push(`Visibly pregnant, ${p.womb.weeks} weeks along.`);

  const naked = p.clothes === "no clothing";
  const dick = b.dick ?? 0, balls = b.balls ?? 0;
  const groin: string[] = [];
  if (dick > 0) {
    const cut = b.foreskin === 0 ? "circumcised" : "uncut";
    groin.push(p.chastity.penis
      ? `a ${dickWord(dick)} ${cut} penis, about ${dickCM(dick)}cm, locked in a chastity cage`
      : `a ${dickWord(dick)} ${cut} penis, about ${dickCM(dick)}cm long, hanging soft`);
    groin.push(balls > 0 ? `${ballsWord(balls)} testicles, about ${ballsCM(balls)}cm each, ${(b.scrotum ?? balls) > balls ? "in a loose, hanging scrotum" : (b.scrotum ?? balls) < balls ? "in a tight, stretched scrotum" : "in a normal scrotum"}` : "no testicles");
  }
  if (b.vagina !== null) groin.push(`${dick > 0 ? "below that " : ""}a vulva with ${labiaWord(b.labia)} labia and a ${clitWord(b.clit)} clit`);
  if (dick <= 0 && b.vagina === null) groin.push("nothing at all: smooth and featureless");
  if (naked && groin.length) out.push(`Between her legs, clearly visible: ${groin.join("; ")}.`);
  else if (groin.length) out.push(`Under her clothes she has ${groin.join("; ")}.`);

  const marks = [
    ...featuresOf(p).map((f) => FEATURES[f.id].words(f)),
    ...b.marks.map((m) => `${m.what} on ${m.where}`),
  ];
  if (marks.length) out.push(`Distinctive, and must be visible: ${marks.join("; ")}.`);

  const worn = [
    naked ? "nothing" : p.clothes,
    p.collar && !/^(none|no collar)$/.test(p.collar) ? p.collar : "",
    p.legwear && p.legwear !== "bare legs" ? p.legwear : "",
    p.shoes && !/^(none|barefoot)$/.test(p.shoes) ? p.shoes : "barefoot",
  ].filter(Boolean);
  out.push(`Wearing ${worn.join(", ")}.`);

  const f = feetOf(p);
  const feet = [
    `${footSizeWord(f.size)} feet`,
    f.toenails !== "bare" ? `toenails painted ${f.toenails}` : "",
    ...f.jewelry,
    f.heels_clipped ? "standing on her toes, heels never touching the floor" : "",
  ].filter(Boolean);
  out.push(`Feet: ${feet.join(", ")}.`);
  return out.join(" ");
}

/** Lock it in. Called the first time a portrait is actually produced. */
export function lockSignature(p: Person, style: "natural" | "tags"): string {
  if (!p.body.visual_signature) p.body.visual_signature = visualSignature(p, style);
  return p.body.visual_signature;
}

function style(): "natural" | "tags" {
  return getLocalImage()?.prompt_style === "tags" ? "tags" : "natural";
}

/** Her portrait: bedrock plus the smallest possible amount of the present. */
export function portraitPrompt(p: Person): { prompt: string; negative: string; seed: number } {
  const s = style();
  const sig = visualSignature(p, s);
  const worn = p.clothes === "no clothing" ? (s === "tags" ? "nude" : "wearing nothing") : `wearing ${p.clothes}`;
  const prompt = s === "tags"
    ? `${sig}, ${worn}, portrait, upper body, looking at viewer, plain background, soft light, photorealistic, detailed skin`
    : `Portrait of ${sig}, ${worn}. Head and shoulders, looking at the camera, plain background, soft even light, photographic.`;
  return {
    prompt,
    negative: "",
    seed: p.body.portrait_seed ?? (hash(p.id) % 2147483647),
  };
}

/** The moment. Bedrock for everybody in it, plus what is actually happening. */
export function scenePrompt(s: SaveState, opts?: { act?: string; people?: string[]; summary?: string }): { prompt: string; negative: string; seed: number; refs: string[] } {
  const dialect = style();
  const ids = opts?.people ?? s.scene.present;
  const cast = ids.map((id) => s.people[id]).filter(Boolean).slice(0, 3) as Person[];
  const act = opts?.act ? ACT_BY_ID[opts.act] : undefined;

  const bodies = cast.map((p) => {
    const sig = visualSignature(p, dialect);
    const bits: string[] = [sig];
    if (p.clothes === "no clothing") bits.push(dialect === "tags" ? "nude" : "naked", genitalClause(p, dialect));
    else bits.push(`wearing ${p.clothes}`);
    if (p.womb.weeks > 16) bits.push(dialect === "tags" ? "pregnant, big belly" : "visibly pregnant");
    if (p.body.lactation) bits.push("lactating");
    if (p.collar && p.collar !== "none") bits.push(`wearing ${p.collar}`);
    if (p.psyche.relaxation <= -6) bits.push(dialect === "tags" ? "tense, distressed" : "visibly braced, holding herself still");
    return bits.filter(Boolean).join(dialect === "tags" ? ", " : " ");
  });

  const doing = act ? act.what : opts?.summary ?? "";
  const place = s.scene.location;

  const prompt = dialect === "tags"
    ? [cast.length > 1 ? `${cast.length}girls` : "1girl", ...bodies, doing, place, "detailed, photorealistic, cinematic light"].filter(Boolean).join(", ")
    : `${bodies.join("; and ")}. ${doing ? `${doing.charAt(0).toUpperCase()}${doing.slice(1)}.` : ""} In ${place}. Photographic, cinematic light, shallow depth of field.`;

  // A sampler has no "not", so the things this frame must not contain go in the negative and are
  // built per picture: a scene with two people in it bars a crowd.
  const negParts = ["text, watermark, logo, extra limbs, deformed hands, blurry, lowres, child, underage"];
  if (cast.length <= 2) negParts.push("crowd, group of people, extra people");

  // The seed is held per place-and-cast, so one room keeps its framing across a dozen turns while
  // the action changes. Asking again for a turn that already has a picture breaks the lock on
  // purpose — "another take" means another take.
  const lock = getLocalImage()?.lock_seed !== false;
  const seed = lock ? hash(`${place}:${ids.slice().sort().join(",")}`) % 2147483647 : Math.floor(Math.random() * 2147483647);

  return {
    prompt,
    negative: negParts.join(", "),
    seed,
    refs: cast.map((p) => p.body.portrait_url ?? "").filter(Boolean),
  };
}
