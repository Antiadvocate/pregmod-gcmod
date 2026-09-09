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

/** The bedrock clause. Written once, stored on the person, never regenerated. */
export function visualSignature(p: Person, style: "natural" | "tags"): string {
  if (p.body.visual_signature) return p.body.visual_signature;
  const b = p.body;
  const build = b.weight > 30 ? "heavy, soft" : b.weight > 10 ? "curvy" : b.weight < -25 ? "very thin" : b.muscle > 30 ? "athletic, toned" : "average build";
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
    if (p.clothes === "no clothing") bits.push(dialect === "tags" ? "nude" : "naked");
    else bits.push(`wearing ${p.clothes}`);
    if (p.womb.weeks > 16) bits.push(dialect === "tags" ? "pregnant, big belly" : "visibly pregnant");
    if (p.body.lactation) bits.push("lactating");
    if (p.collar && p.collar !== "none") bits.push(`wearing ${p.collar}`);
    if (p.psyche.relaxation <= -6) bits.push(dialect === "tags" ? "tense, distressed" : "visibly braced, holding herself still");
    return bits.join(dialect === "tags" ? ", " : " ");
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
