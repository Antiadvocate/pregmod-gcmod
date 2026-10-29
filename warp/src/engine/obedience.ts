/**
 * DEVOTION AND TRUST, DERIVED.
 *
 * These two numbers are the interface every player of the old game already knows, and they are the
 * two numbers this rebuild refuses to store. They are readings — computed here, every week and
 * every scene turn, off four accumulators (bond, fear, resentment, hope), the nervous system, and
 * what the person can remember about how they have been handled.
 *
 * WHY THIS IS THE WHOLE POINT. In the old model `devotion += 5` was a complete description of an
 * event. Two women at devotion 60 were interchangeable: the same threshold checks fired for both,
 * they took the same jobs equally well, and if you stopped punishing either of them nothing
 * happened, because there was nothing in the number that remembered why it was 60.
 *
 * Here, obedience held by fear and obedience held by bond are different values that add up to the
 * same displayed number, and they behave differently. Neither is the right one. They're two ways of
 * running a house, with different costs:
 *
 *   · FEAR is quick to build and holds as long as you hold it. Keep the house under control
 *     (security, a bodyguard, cameras: engine/security) and it stays where you put it. Let control
 *     slip and it drains away within weeks. Its cost is company. A frightened slave does exactly
 *     what she's told and nothing else, keeps her own nature hidden from you, and never surprises
 *     you, seeks you out or tells you what she thinks. A house run on fear is obedient and lonely.
 *   · BOND is slow to build and lasts without upkeep. Its cost is indulgence. A slave who's only
 *     ever been given things starts pushing (engine/compliance), and she has opinions.
 *   · RESENTMENT is what someone hasn't forgiven, and it eats into devotion whichever of the two
 *     is holding her. What counts as something to forgive is hers. A masochist doesn't resent the
 *     whip she wanted.
 *   · HOPE is what makes a promise worth anything, and what's lost when one is broken.
 *
 * `fragility` is fear as a share of everything holding somebody in place. It tells the player which
 * kind of house they have.
 */
import type { Person, PersonMemory } from "./types";
import { clamp, wear } from "./psyche";
import { BEHAVIOR_FLAW_BY_ID } from "../data/behavior";

export interface Reading {
  devotion: number;   // −100 … +100
  trust: number;      // −100 … +100
  label: string;      // the band the player reads
  trust_label: string;
  /** 0–1: how much of the compliance is bought with fear rather than earned. */
  fragility: number;
  /** 0–1: chance per week of an escape attempt or a refusal that costs something. */
  flight_risk: number;
  /** 0–1: chance the nervous system gives out under this week's load. */
  break_risk: number;
}

const DEVOTION_BANDS: [number, string][] = [
  [95, "worshipful"], [70, "devoted"], [45, "accepting"], [20, "obedient"],
  [-10, "careless"], [-50, "resistant"], [-101, "hateful"],
];
const TRUST_BANDS: [number, string][] = [
  [95, "trusts you completely"], [70, "trusting"], [45, "trusting enough"], [20, "careful"],
  [-10, "wary"], [-50, "frightened"], [-101, "terrified"],
];

function bandOf(n: number, bands: [number, string][]): string {
  for (const [floor, label] of bands) if (n >= floor) return label;
  return bands[bands.length - 1][1];
}

/** Attachment shapes what fear and comfort can buy, and it is a stable trait, not a mood.
 *  Anxious bodies convert both into more than they should; avoidant ones convert closeness into
 *  pressure and take almost nothing from comfort under threat. */
function attachmentMods(style: string): { fear_buys: number; bond_buys: number; flight: number } {
  switch (style) {
    case "anxious": return { fear_buys: 1.15, bond_buys: 1.2, flight: 0.8 };
    case "avoidant": return { fear_buys: 0.8, bond_buys: 0.7, flight: 1.35 };
    case "disorganized": return { fear_buys: 0.95, bond_buys: 0.85, flight: 1.2 };
    default: return { fear_buys: 1, bond_buys: 1, flight: 1 };
  }
}

/** THE READ. Pure; call it as often as you like. */
export function read(p: Person, mem?: PersonMemory): Reading {
  const b = p.bond;
  const m = attachmentMods(p.persona.attachment.style);
  const r = p.psyche.relaxation;

  // Fear buys compliance, and it saturates: terror past a point stops producing more obedience and
  // starts producing paralysis, which is not the same thing and never was.
  const fearComply = 60 * (1 - Math.exp(-b.fear / 45)) * m.fear_buys;
  const bonded = b.bond * 0.62 * m.bond_buys;

  // Memory does its own work: what somebody carries about how they have been handled outweighs
  // this week's arithmetic, which is the difference between a person and a gauge.
  const carried = memoryTilt(mem);

  let devotion = bonded + fearComply - b.resentment * 0.45 + b.hope * 0.12 + r * 1.6 + carried * 6;
  // A broken body complies with anything and means none of it. The reading should say so rather
  // than pretending the obedience is real.
  if (p.psyche.state === "broken") devotion = Math.max(devotion, 45) - b.resentment * 0.2;
  if (p.psyche.state === "fracturing") devotion -= 8;

  let trust = b.bond * 0.55 - b.fear * 0.75 + b.hope * 0.25 - b.resentment * 0.25 + r * 2.2 + carried * 8;
  // Time under the same owner: she knows what to expect from you, whatever it is. (This used to be
  // weeks since the last cruelty, which made every punishment cost trust twice.)
  trust += clamp((p.economics?.weeks_owned ?? 0) * 1.6, 0, 22);

  devotion = clamp(Math.round(devotion), -100, 100);
  trust = clamp(Math.round(trust), -100, 100);

  const holding = Math.max(1, Math.abs(bonded) + fearComply);
  const fragility = clamp(fearComply / holding, 0, 1);

  const flight_risk = clamp(
    ((b.resentment / 100) * 0.5 + (devotion < 0 ? 0.25 : 0) + (1 - fragility < 0.4 ? 0.1 : 0)) *
    m.flight * (1 - clamp(b.hope / 200, 0, 0.4)) * (p.psyche.state === "broken" ? 0.2 : 1),
    0, 1);

  const break_risk = clamp(
    (p.psyche.relaxation <= -7 ? 0.35 : p.psyche.relaxation <= -4 ? 0.15 : 0.02) +
    wear(p.psyche) * 0.25 + (p.health.health < -40 ? 0.15 : 0),
    0, 1);

  return {
    devotion, trust,
    label: bandOf(devotion, DEVOTION_BANDS),
    trust_label: bandOf(trust, TRUST_BANDS),
    fragility, flight_risk, break_risk,
  };
}

/** What the person's own memories add up to, −1 … +1. Recent and important memories weigh most;
 *  a decayed one still tilts, because a thing you can no longer describe still shaped you. */
export function memoryTilt(mem?: PersonMemory): number {
  if (!mem?.episodic?.length) return 0;
  let sum = 0, weight = 0;
  for (const e of mem.episodic) {
    const w = (e.importance / 10) * Math.max(0.2, e.decay) * (e.core ? 2 : 1) * (e.weight ?? 1);
    const sign = e.charge === "warm" || e.charge === "bright" ? 1 : e.charge === "sharp" || e.charge === "cold" ? -1 : 0;
    sum += sign * w;
    weight += w;
  }
  return weight ? clamp(sum / weight, -1, 1) : 0;
}

/* ── WHAT MOVES THE ACCUMULATORS ─────────────────────────────────────────────────────────────
 * Everything in the game that used to write `devotion +=` writes one of these instead. The verbs
 * are deliberately few: the engine should be able to say, in the report, which of these happened. */

export type Treatment =
  | { kind: "kindness"; size: number; why: string }
  | { kind: "cruelty"; size: number; why: string }
  | { kind: "coercion"; size: number; why: string }      // punishment aimed at obedience specifically
  | { kind: "promise_kept"; size: number; why: string }
  | { kind: "promise_broken"; size: number; why: string }
  | { kind: "neglect"; size: number; why: string }
  | { kind: "recognition"; size: number; why: string };  // being seen, chosen, named, given a post

/** How much she wants to be hurt and used, 0 to 1: her masochism, submission or appetite for
 *  humiliation, the quirks that crave it, or hating herself enough to ask for it. Cruelty to a woman
 *  who wants it lands as giving her what she wants, by how much she wants it. */
export function wantsHurt(p: Person): number {
  const per = p.persona;
  const f = Math.max(0, ...per.fetishes.filter((x) => ["masochist", "submissive", "humiliation"].includes(x.name)).map((x) => x.strength));
  const q = ["painal queen", "gagfuck queen", "strugglefuck queen"].includes(per.quirk?.id ?? "") ? 65 : 0;
  const need = per.paraphilia === "self hating" ? 100 : 0;
  return clamp(Math.max(f, q, need) / 100, 0, 1);
}

export function applyTreatment(p: Person, t: Treatment, week: number): string {
  const b = p.bond;
  const s = clamp(t.size, 0, 10);
  const w = t.kind === "cruelty" || t.kind === "coercion" ? wantsHurt(p) : 0;
  switch (t.kind) {
    case "kindness":
      b.bond = clamp(b.bond + s * 1.1, -100, 100);
      b.resentment = clamp(b.resentment - s * 0.6, 0, 100);
      b.hope = clamp(b.hope + s * 0.8, 0, 100);
      b.weeks_since_kindness = 0;
      break;
    case "recognition":
      b.bond = clamp(b.bond + s * 1.5, -100, 100);
      b.hope = clamp(b.hope + s * 1.2, 0, 100);
      b.weeks_since_kindness = 0;
      break;
    case "cruelty":
      // To a woman who wants it, it's closer to a gift: less fear, little resentment, and it binds her.
      b.fear = clamp(b.fear + s * 1.6 * (1 - 0.5 * w), 0, 100);
      b.resentment = clamp(b.resentment + s * 1.4 * (1 - 0.9 * w), 0, 100);
      b.bond = clamp(b.bond + s * (-0.9 + 1.7 * w), -100, 100);
      b.hope = clamp(b.hope - s * 1.0 * (1 - w), 0, 100);
      b.weeks_since_cruelty = 0;
      break;
    case "coercion":
      // Aimed compliance: buys more fear per unit and less resentment than cruelty for its own
      // sake, because the person can see the rule they broke.
      b.fear = clamp(b.fear + s * 2.0 * (1 - 0.4 * w), 0, 100);
      b.resentment = clamp(b.resentment + s * 0.8 * (1 - 0.9 * w), 0, 100);
      if (w) b.bond = clamp(b.bond + s * w, -100, 100);
      b.weeks_since_cruelty = 0;
      break;
    case "promise_kept":
      b.bond = clamp(b.bond + s * 1.3, -100, 100);
      b.hope = clamp(b.hope + s * 2.0, 0, 100);
      b.weeks_since_kindness = 0;
      break;
    case "promise_broken":
      // The expensive one. Hope is cheap to give and very costly to spend.
      b.hope = clamp(b.hope - s * 3.0, 0, 100);
      b.resentment = clamp(b.resentment + s * 1.8, 0, 100);
      b.bond = clamp(b.bond - s * 1.4, -100, 100);
      break;
    case "neglect":
      b.bond = clamp(b.bond - s * 0.3, -100, 100);
      b.hope = clamp(b.hope - s * 0.4, 0, 100);
      break;
  }
  // SPOILING. Indulgence with nothing asked back builds up; discipline takes it down, and aimed
  // punishment is what wears a behavioural flaw into its quirk (engine/compliance, data/behavior).
  if (t.kind === "kindness" || t.kind === "recognition" || t.kind === "promise_kept") b.indulged = clamp((b.indulged ?? 0) + s * 0.9, 0, 100);
  if (t.kind === "coercion" || t.kind === "cruelty") {
    b.indulged = clamp((b.indulged ?? 0) - s * 5, 0, 100);
    const bh = p.persona.behavior;
    if (bh?.flaw) {
      bh.worn = (bh.worn ?? 0) + s * (t.kind === "coercion" ? 3 : 1.5);
      const def = BEHAVIOR_FLAW_BY_ID[bh.flaw];
      if (def && bh.worn >= 60) p.persona.behavior = { quirk: def.softens_to };
    }
  }
  p.bond.read = readCached(p);
  return `${t.kind.replace("_", " ")}: ${t.why}`;
}

/** THE WEEKLY DRIFT. `held` is how hard the house is held down (engine/security heldDown, 0 to 1).
 *  Under a full lid, fear stays where you put it. With no control at all, it drains 15% a week. */
export function tickBond(p: Person, held = 0): void {
  const b = p.bond;
  b.weeks_since_kindness++;
  b.weeks_since_cruelty++;

  if (b.weeks_since_cruelty > 0) b.fear = +(b.fear * (0.85 + 0.15 * clamp(held, 0, 1))).toFixed(2);
  // Bond decays very slowly, and only through neglect.
  if (b.weeks_since_kindness > 3) b.bond = +(b.bond * 0.985).toFixed(2);
  // Resentment cools, but never all the way on its own — some of it has to be answered.
  b.resentment = +(b.resentment * 0.96).toFixed(2);
  // Hope drains in the absence of anything to hope about.
  if (b.weeks_since_kindness > 2) b.hope = +(b.hope * 0.94).toFixed(2);

  p.bond.read = readCached(p);
}

function readCached(p: Person): { devotion: number; trust: number; label: string } {
  const r = read(p);
  return { devotion: r.devotion, trust: r.trust, label: r.label };
}

/** Refresh the cached reading on a person (called after anything that could move it). */
export function refresh(p: Person, mem?: PersonMemory): Reading {
  const r = read(p, mem);
  p.bond.read = { devotion: r.devotion, trust: r.trust, label: r.label };
  return r;
}

/** WHY IS SHE LIKE THIS — the explanation the old game could not generate, because the answer was
 *  distributed across eleven hundred `devotion +=` call sites. Returned as ordered sentences, most
 *  load-bearing first, for the person panel. */
export function explain(p: Person, mem?: PersonMemory): string[] {
  const r = read(p, mem);
  const b = p.bond;
  const out: string[] = [];

  if (r.fragility > 0.65) out.push(`${Math.round(r.fragility * 100)}% of her obedience is fear. If you stop keeping it up, it'll be gone in a month.`);
  else if (r.fragility < 0.25 && b.bond > 20) out.push(`She obeys because she's attached to you, not out of fear. It would last if you were away.`);

  if (b.resentment > 55) out.push(`She resents how she's been treated, and it's dragging everything else down.`);
  if (b.hope < 12) out.push(`She's lost hope. Promises mean nothing to her until you keep one.`);
  else if (b.hope > 60) out.push(`She's hopeful about her future, and she works hard because of it.`);

  const tilt = memoryTilt(mem);
  if (tilt < -0.35) out.push(`Her memories of this place are mostly bad.`);
  if (tilt > 0.35) out.push(`Her memories of this place are mostly good, which helps her through bad weeks.`);

  if (p.psyche.state === "broken") out.push(`She's mindbroken. She'll do anything you say.`);
  else if (p.psyche.state === "fracturing") out.push(`She's close to breaking after four weeks of constant stress.`);

  const w = wear(p.psyche);
  if (w > 0.55) out.push(`Months of stress have hardened her for good. Small things don't bother her any more, but big ones still do.`);

  if (b.weeks_since_kindness > 8) out.push(`You haven't done anything nice for her in ${b.weeks_since_kindness} weeks.`);
  if (r.flight_risk > 0.35) out.push(`She's thinking about running.`);

  if (!out.length) out.push(`She's neither attached to you nor afraid of you. She just does her work.`);
  return out;
}
