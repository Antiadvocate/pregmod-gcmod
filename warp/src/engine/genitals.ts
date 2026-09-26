/**
 * GENITALS AND FEET — the words, the measurements, and what the sizes do to her.
 *
 * The scales are the original game's, so a slave described here reads the way she would there:
 * a size 3 cock is average, a 10 is awe-inspiring, and past that the hyper drugs have been at her.
 * Centimetres use the original's conversion (dickToCM, ballsToCM in utilsUnits.js).
 */
import type { Feet, Person } from "./types";
import type { Rng } from "./rng";

const has = (n: number | null | undefined): n is number => typeof n === "number" && n > 0;

/* ── cock ─────────────────────────────────────────────────────────────────────────────────── */

export function dickCM(d: number): number {
  if (d < 9) return d * 5;
  if (d === 9) return 50;
  return d * 6;
}

export function inches(cm: number): string {
  const i = Math.round(cm / 2.54);
  return i <= 0 ? "less than an inch" : i === 1 ? "one inch" : `${i} inches`;
}

export function dickWord(d: number): string {
  if (d <= 1) return "tiny";
  if (d === 2) return "small";
  if (d === 3) return "average-sized";
  if (d === 4) return "large";
  if (d === 5) return "huge";
  if (d === 6) return "enormous";
  if (d === 7) return "massive";
  if (d === 8) return "imposing";
  if (d === 9) return "monstrous";
  if (d === 10) return "awe-inspiring";
  if (d < 15) return "mind-shattering";
  if (d < 20) return "absurdly hypertrophied";
  if (d < 30) return "grotesquely hypertrophied";
  return "impossibly hypertrophied";
}

/** The biggest cock her body has the blood pressure to get fully hard: the original's height rule. */
export function maxErection(p: Person): number {
  return Math.max(1, Math.floor(2 * (p.body.height_cm / 165) * 3));
}

export type Erection = "none" | "soft" | "partial" | "full";

/** Whether she can get hard, and how hard. Balls and hormones decide it, chastity stops it, and a
 *  cock past what her body can pump stays half-soft however turned on she is. */
export function erection(p: Person): Erection {
  return erectionWhy(p).state;
}

/** The state and the reason, so the card can say why and what would fix it. */
export function erectionWhy(p: Person): { state: Erection; why: string; fix?: string } {
  const d = p.body.dick;
  if (!has(d)) return { state: "none", why: "she has no cock" };
  if (p.chastity.penis) return { state: "none", why: "it's locked in a cage" };
  const drugs = p.health.drugs ?? [];
  const pills = drugs.includes("erection pills");
  const implant = !!p.body.penile_implant;
  if (drugs.includes("hormone blockers") && !implant) return { state: "soft", why: "the hormone blockers keep her soft", fix: "stop the blockers, or fit a penile implant" };
  const fem = drugs.includes("female hormones");
  const male = drugs.includes("male hormones");
  if (!has(p.body.balls) && !male && !pills && !implant) return { state: "soft", why: "with no balls she has no testosterone to get hard with", fix: "male hormones, erection pills, or a penile implant" };
  if (fem && !male && (p.body.balls ?? 0) <= 2 && !pills && !implant) return { state: "soft", why: "female hormones and small balls have left her soft", fix: "erection pills, or stop the female hormones" };
  // The original's rule: a cock past what her body can pump blood into won't fill. Pills buy two
  // sizes; an implant makes her hard at any size, on command.
  if (implant) return { state: "full", why: "her penile implant makes her hard on command" };
  const max = maxErection(p) + (pills ? 2 : 0);
  if (d > max + 3) return { state: "soft", why: "it's too big for her body to pump full of blood", fix: "a penile implant" + (pills ? "" : ", or erection pills for a little more") };
  if (d > max) return { state: "partial", why: "it's bigger than her body can fill all the way", fix: pills ? "a penile implant" : "erection pills, or a penile implant" };
  return { state: "full", why: pills ? "the pills help" : "" };
}

/* ── balls ────────────────────────────────────────────────────────────────────────────────── */

export function ballsCM(b: number): number {
  if (b < 2) return 0;
  return b < 10 ? (b - 1) * 2 : b * 2;
}

export function ballsWord(b: number): string {
  if (b <= 1) return "vestigial";
  if (b === 2) return "small";
  if (b === 3) return "average";
  if (b === 4) return "large";
  if (b === 5) return "massive";
  if (b === 6) return "huge";
  if (b === 7) return "giant";
  if (b === 8) return "enormous";
  if (b === 9) return "monstrous";
  if (b < 20) return "hypertrophied";
  if (b < 37) return "grotesquely hypertrophied";
  if (b < 50) return "immobilizingly huge";
  return "impossibly enormous";
}

/** How much comes out of her, on the balls and the prostate. */
export function cumWord(p: Person): string {
  const b = p.body.balls ?? 0;
  if (!b) return p.body.prostate ? "a thin dribble of prostate fluid" : "nothing";
  const load = b + p.body.prostate * 2;
  const sterile = p.body.vasectomy ? " (sterile)" : "";
  if (load <= 2) return `a small dribble${sterile}`;
  if (load <= 5) return `an ordinary load${sterile}`;
  if (load <= 8) return `a big, messy load${sterile}`;
  if (load <= 12) return `a huge load that leaves a puddle${sterile}`;
  if (load <= 25) return `a flood, far more than anyone could swallow${sterile}`;
  return `gallons at a time, drenching everything${sterile}`;
}

function scrotumLine(p: Person): string {
  const b = p.body.balls ?? 0;
  const sc = p.body.scrotum ?? b;
  if (!b) return "";
  if (sc === 0) return "Her testicles are internal; there is no scrotum.";
  const fit = sc - b;
  if (b >= 20) {
    if (fit < -1) return "Her scrotum is agonizingly overfilled and stretched taut; she must be in constant pain.";
    if (fit < 0) return "Her scrotum is so overfilled that every vein shows.";
    return "Her scrotum has stretched to hold them, and they hang heavily, brushing her knees.";
  }
  if (fit < -1) return "They are too big for her tight little scrotum, which is stretched over each ball.";
  if (fit < 0) return "Her tight scrotum holds them snug against the base of her cock.";
  if (fit === 0) return "Her scrotum lets them rest comfortably.";
  if (fit === 1) return "She has a loose scrotum that lets them swing when she moves.";
  return "Her loose, dangling scrotum lets them sway heavily with every step.";
}

/* ── clit, labia, pussy, ass ──────────────────────────────────────────────────────────────── */

export function clitWord(c: number): string {
  return ["small", "big", "huge", "enormous, like a little cock", "enormous, like a little cock", "enormous, like a little cock"][Math.max(0, Math.min(5, c))];
}
export function labiaWord(l: number): string {
  return ["neat, minimal", "big", "huge", "huge, dangling"][Math.max(0, Math.min(3, l))];
}
export function vaginaWord(v: number, hymen: boolean): string {
  if (v <= 0) return hymen ? "virgin" : "very tight";
  if (v === 1) return "tight";
  if (v === 2) return "reasonably tight";
  if (v === 3) return "loose";
  if (v <= 5) return "very loose";
  return "gaping";
}
export function anusWord(a: number): string {
  return ["virgin", "tight", "loose", "very loose", "gaping"][Math.max(0, Math.min(4, a))];
}

/** How much the size of what is between her legs gets in her way. */
export function mobility(p: Person): { level: 0 | 1 | 2 | 3; note: string } {
  const b = p.body.balls ?? 0;
  const d = p.body.dick ?? 0;
  const worst = Math.max(b >= 50 ? 3 : b >= 37 ? 2 : b >= 20 ? 1 : 0, d >= 30 ? 3 : d >= 20 ? 2 : d >= 15 ? 1 : 0);
  const clipped = p.body.feet?.heels_clipped ? 1 : 0;
  const level = Math.min(3, Math.max(worst, clipped)) as 0 | 1 | 2 | 3;
  const note = level === 3 ? "she can't walk at all; she has to be carried or wheeled around"
    : level === 2 ? "she can barely walk and waddles slowly"
    : worst === 1 ? "her size makes walking awkward"
    : clipped ? "her tendons are clipped; she walks only in heels, or crawls"
    : "";
  return { level, note };
}

/** One paragraph, in the original's order: cock, balls, what comes out; then the pussy, then the ass. */
export function describeGenitals(p: Person): string {
  const b = p.body;
  const out: string[] = [];
  if (has(b.dick)) {
    const cm = dickCM(b.dick);
    const cut = b.foreskin === 0 ? "circumcised" : "uncut";
    const e = erection(p);
    const ew = erectionWhy(p);
    const hard = e === "full" ? `She can get fully hard${ew.why ? ` (${ew.why})` : ""}.` : e === "partial" ? `She only gets half-hard: ${ew.why}.` : e === "soft" ? `She can't get it up: ${ew.why}.` : "It's locked in chastity.";
    out.push(`She has a ${dickWord(b.dick)} ${cut} cock, about ${cm}cm (${inches(cm)}) long. ${hard}`);
    if (b.foreskin && b.foreskin - b.dick > 1) out.push("Her foreskin is loose and overhangs the head.");
    else if (b.foreskin && b.foreskin - b.dick < -1) out.push("Her foreskin is too tight to pull back over the head.");
  }
  if (has(b.balls)) {
    out.push(`${has(b.dick) ? "Under it hang" : "She has"} ${ballsWord(b.balls)} balls, each about ${ballsCM(b.balls)}cm across. ${scrotumLine(p)}`.trim());
    out.push(`When she cums it's ${cumWord(p)}.`);
  } else if (has(b.dick)) {
    out.push(b.prostate ? "She has no balls; when she cums she dribbles prostate fluid." : "She has no balls, and cums nothing.");
  }
  if (b.vagina !== null) {
    out.push(`${has(b.dick) ? "Below that she has" : "She has"} a ${vaginaWord(b.vagina, b.hymen)} pussy with ${labiaWord(b.labia)} labia and a ${clitWord(b.clit)} clit${b.vagina_lube >= 2 ? "; she gets very wet" : b.vagina_lube === 0 ? "; she gets dry" : ""}.`);
  }
  if (!has(b.dick) && b.vagina === null) out.push("She is a null: smooth and featureless between the legs, with only a urethra.");
  out.push(`Her asshole is ${anusWord(b.anus)}.`);
  // Where she can carry, so nobody writes a pregnancy she can't have.
  const u = p.womb.uterus ?? (b.vagina !== null ? "natal" : "none");
  if (u === "anal") out.push("She has an implanted womb that opens into her rectum: she can be bred through her ass.");
  else if (u === "none" && b.vagina !== null) out.push("Her pussy was built by a surgeon; there is no womb behind it and she cannot get pregnant.");
  else if (u === "none") out.push("She has no womb and cannot get pregnant.");
  const locked = [p.chastity.penis ? "cock" : "", p.chastity.vagina ? "pussy" : "", p.chastity.anus ? "ass" : ""].filter(Boolean);
  if (locked.length) out.push(`Her ${locked.join(" and ")} ${locked.length > 1 ? "are" : "is"} locked in chastity.`);
  const m = mobility(p);
  if (m.level && m.note && !p.body.feet?.heels_clipped) out.push(`Because of her size, ${m.note}.`);
  return out.join(" ");
}

/* ── feet ─────────────────────────────────────────────────────────────────────────────────── */

export function newFeet(r: Rng, heightCm: number, male: boolean): Feet {
  const base = 38 + (heightCm - 165) / 6 + (male ? 3 : 0);
  return {
    size: Math.round(Math.max(33, Math.min(47, base + r.int(-2, 2)))),
    arch: r.weighted(["flat", "normal", "high"] as const, (a) => (a === "normal" ? 6 : a === "high" ? 2 : 1.5)),
    soles: r.weighted(["soft", "normal", "calloused"] as const, (s) => (s === "normal" ? 5 : s === "soft" ? 2 : 2)),
    ticklish: r.int(0, 3) as 0 | 1 | 2 | 3,
    toenails: "bare",
    heels_clipped: false,
    jewelry: [],
  };
}

/** Old saves have no feet record; give them one from the body they already have. */
export const FOOT_SHAPES = ["egyptian", "greek", "roman", "germanic", "celtic"] as const;

/** A stable number from her id, for the parts of her that are hers and nobody else's. */
export function idHash(id: string, salt = ""): number {
  let h = 2166136261;
  for (const ch of salt + id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

export function feetOf(p: Person): Feet {
  if (p.body.feet && (!p.body.feet.shape || !p.body.feet.width)) {
    const h = idHash(p.id, "foot-shape");
    // Egyptian is the most common, then Roman and Greek; the other two are rare.
    const roll = h % 100;
    p.body.feet.shape ??= roll < 45 ? "egyptian" : roll < 70 ? "roman" : roll < 90 ? "greek" : roll < 96 ? "germanic" : "celtic";
    p.body.feet.width ??= (["narrow", "average", "average", "wide"] as const)[(h >>> 9) % 4];
  }
  if (!p.body.feet) {
    let h = 0;
    for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const pick = <T,>(xs: readonly T[], k: number) => xs[(h >>> k) % xs.length];
    const male = has(p.body.dick) && p.body.vagina === null;
    p.body.feet = {
      size: Math.round(Math.max(33, Math.min(47, 38 + (p.body.height_cm - 165) / 6 + (male ? 3 : 0) + ((h % 5) - 2)))),
      arch: pick(["normal", "normal", "high", "flat"] as const, 3),
      soles: pick(["normal", "soft", "calloused", "normal"] as const, 7),
      ticklish: pick([0, 1, 2, 3] as const, 11),
      toenails: "bare", heels_clipped: false, jewelry: [],
    };
    return feetOf(p);
  }
  return p.body.feet;
}

export function footSizeWord(size: number): string {
  if (size <= 35) return "dainty";
  if (size <= 37) return "small";
  if (size <= 40) return "average-sized";
  if (size <= 43) return "big";
  return "very big";
}

export function describeFeet(p: Person): string {
  const f = feetOf(p);
  if (p.body.marks.some((m) => m.kind === "prosthetic" && /feet|foot|leg/i.test(m.where))) return "She has prosthetic feet.";
  const out: string[] = [];
  out.push(`She has ${footSizeWord(f.size)} feet (EU ${f.size}) with ${f.arch === "high" ? "high, elegant arches" : f.arch === "flat" ? "flat arches" : "ordinary arches"} and ${f.soles === "soft" ? "soft, pampered soles" : f.soles === "calloused" ? "rough, calloused soles" : "ordinary soles"}.`);
  const shape = {
    egyptian: "Her big toe is the longest and each toe after it is a little shorter, in a clean slope.",
    greek: "Her second toe is longer than her big toe.",
    roman: "Her first three toes are almost the same length, which makes her feet look square across the front.",
    germanic: "Her big toe is long and the other four are nearly even with each other.",
    celtic: "Her second toe is the longest and her third drops away sharply after it.",
  }[f.shape ?? "egyptian"];
  out.push(`${shape} Her feet are ${f.width === "narrow" ? "narrow" : f.width === "wide" ? "wide across the toes" : "of average width"}.`);
  out.push(f.toenails === "bare" ? "Her toenails are unpainted." : `Her toenails are painted ${f.toenails}.`);
  if (f.jewelry.length) out.push(`She wears ${f.jewelry.join(" and ")}.`);
  out.push(["She isn't ticklish.", "She's a little ticklish.", "She's very ticklish.", "She's hopelessly ticklish; touching her soles reduces her to squealing."][f.ticklish]);
  if (f.heels_clipped) out.push("Her Achilles tendons have been clipped: she can't stand flat, and walks only in heels or crawls on all fours.");
  out.push(dirtWords(soleDirt(p)));
  return out.join(" ");
}

/** How dirty her soles are right now, 0 (clean) … 1 (black), what kind of dirt, and why. Barefoot
 *  and on her feet all day in a dairy or a field they're filthy; kept in the spa or in your bed
 *  they're clean. Shoes keep most of it off; a pedicure or a foot-worshipper takes it off. */
export function soleDirt(p: Person, s?: { world?: { pollution: number }; laws?: { id: string }[] }): { level: number; kind: "earth" | "grime" | "dust"; why: string } {
  const f = feetOf(p);
  const shoes = (p.shoes ?? "").toLowerCase();
  const bare = !shoes || shoes === "none" || /bare/.test(shoes);
  const job: Record<string, [number, "earth" | "grime" | "dust", string]> = {
    "work as a farmhand": [0.5, "earth", "working the fields"], "be the Farmer": [0.4, "earth", "working the fields"],
    "work in the dairy": [0.35, "earth", "on the dairy floor all day"], "be the Milkmaid": [0.3, "earth", "on the dairy floor"],
    "house servant": [0.32, "grime", "scrubbing floors"], "work as a servant": [0.32, "grime", "scrubbing floors"], "be the Stewardess": [0.25, "grime", "on her feet running the house"],
    "public servant": [0.38, "grime", "walking the concourse all day"], "whore": [0.3, "grime", "working the street"],
    "fight in the pit": [0.45, "dust", "the sand of the pit"], "be confined in the cellblock": [0.38, "grime", "the cellblock floor"],
    "guard you": [0.2, "dust", "following you everywhere"], "recruit girls": [0.2, "dust", "out in the city"], "be your agent": [0.2, "dust", "out in the city"],
    "work in the brothel": [0.1, "grime", "the brothel floors"], "serve in the club": [0.18, "grime", "the club floor"],
    "rest": [-0.15, "dust", ""], "rest in the spa": [-0.4, "dust", ""], "get treatment in the clinic": [-0.35, "dust", ""], "get treatment": [-0.3, "dust", ""],
    "please you": [-0.2, "dust", ""], "fucktoy": [-0.15, "dust", ""], "be your Concubine": [-0.3, "dust", ""], "work in an office": [-0.1, "dust", ""],
    "be your secretary": [-0.15, "dust", ""], "be an idol": [-0.25, "dust", ""], "be confined in the arcade": [-0.1, "dust", ""],
  };
  const [w, kind, where] = job[p.assignment] ?? [0.1, "dust" as const, ""];
  let level = (bare ? 0.35 : 0.04) + (w > 0 ? w * (bare ? 1 : 0.25) : w);
  const why: string[] = [];
  if (bare && w > 0.15) why.push(`barefoot and ${where}`);
  else if (bare) why.push("barefoot");
  if (f.heels_clipped) { level += 0.2; why.push("crawling"); }
  if (bare && s?.world && s.world.pollution > 50) { level += 0.1; why.push("the grime in the air settles on everything"); }
  if (bare && s?.laws?.some((l) => l.id === "barefoot_statute") && w > 0) level += 0.08;
  const pampered = (p.acts?.["pedicure"] ?? 0) + (p.acts?.["worship feet"] ?? 0);
  if (pampered) level -= Math.min(0.3, pampered * 0.05);
  if (f.soles === "soft") level -= 0.1;
  level = Math.max(0, Math.min(1, level));
  return { level, kind, why: why.join(", ") };
}

export function dirtWords(d: { level: number; kind: string; why: string }): string {
  if (d.level < 0.15) return "Her soles are clean.";
  const stuff = d.kind === "earth" ? "earth and straw" : d.kind === "grime" ? "floor grime" : "dust";
  const how = d.level > 0.7 ? `black with ${stuff}` : d.level > 0.4 ? `dirty, grey-brown with ${stuff} on the heels and balls` : `a little dusty`;
  return `Her soles are ${how}${d.why ? ` (${d.why})` : ""}.`;
}

/** A hard list of what she has and hasn't got, for every prompt. Models drift toward the default
 *  body; this is the line that stops them writing a pussy onto a woman who has a cock and nothing
 *  else, or getting her "wet". */
export function anatomyLock(p: Person): string {
  const b = p.body;
  const hasCock = has(b.dick), hasPussy = b.vagina !== null;
  const out: string[] = [];
  out.push(`She has: ${[hasCock ? "a cock" : "", has(b.balls) ? "balls" : "", hasPussy ? "a pussy" : "", "an ass", b.boobs > 150 ? "breasts" : "a flat chest"].filter(Boolean).join(", ")}.`);
  const not: string[] = [];
  if (!hasPussy) not.push("a pussy, cunt, clit, labia or vagina (never write one; she doesn't get wet, she " + (hasCock ? "gets hard and leaks precum" : "flushes and trembles") + ")");
  if (!hasCock) not.push("a cock");
  if (!has(b.balls) && hasCock) not.push("balls");
  if (not.length) out.push(`She does NOT have ${not.join("; ")}.`);
  if (hasCock) { const e = erectionWhy(p); if (e.state !== "full") out.push(`Her cock ${e.state === "partial" ? "only gets half-hard" : "stays soft"}: ${e.why}.`); }
  return out.join(" ");
}

/** Put right anything on her record that contradicts her body (after surgery, editing, old saves). */
export function reconcileAnatomy(p: Person): void {
  const b = p.body;
  const hole = p.persona.preferred_hole;
  if (hole && hole.hole === "vagina" && b.vagina === null) hole.hole = has(b.dick) ? "dick" : "anus";
  if (hole && hole.hole === "dick" && !has(b.dick)) hole.hole = b.vagina !== null ? "vagina" : "anus";
  if (b.vagina === null) { p.chastity.vagina = false; b.labia = 0; b.clit = 0; }
  if (!has(b.dick)) p.chastity.penis = false;
  if (!(b.butt > 0)) b.butt = 1;
}
