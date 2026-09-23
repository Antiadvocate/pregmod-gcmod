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
  const d = p.body.dick;
  if (!has(d)) return "none";
  if (p.chastity.penis) return "none";
  const drugs = p.health.drugs ?? [];
  if (drugs.includes("hormone blockers")) return "soft";
  const fem = drugs.includes("female hormones");
  const male = drugs.includes("male hormones");
  if (!has(p.body.balls) && !male) return "soft";
  if (fem && !male && (p.body.balls ?? 0) <= 2) return "soft";
  const max = maxErection(p);
  if (d > max + 2) return "soft";
  if (d > max) return "partial";
  return "full";
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
    const hard = e === "full" ? "She can get fully hard." : e === "partial" ? "It's too big for her to get more than half-hard." : e === "soft" ? "She can't get it up." : "It's locked in chastity.";
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
export function feetOf(p: Person): Feet {
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
  out.push(f.toenails === "bare" ? "Her toenails are unpainted." : `Her toenails are painted ${f.toenails}.`);
  if (f.jewelry.length) out.push(`She wears ${f.jewelry.join(" and ")}.`);
  out.push(["She isn't ticklish.", "She's a little ticklish.", "She's very ticklish.", "She's hopelessly ticklish; touching her soles reduces her to squealing."][f.ticklish]);
  if (f.heels_clipped) out.push("Her Achilles tendons have been clipped: she can't stand flat, and walks only in heels or crawls on all fours.");
  return out.join(" ");
}
