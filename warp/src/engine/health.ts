/**
 * THE BODY OVER TIME — health, energy, wear, medicine, and the things that do not heal.
 *
 * Three separate quantities, where the old game had one. `health` is the acute state and it comes
 * back; `energy` is the week's tank and it refills; `attrition` is the decade, and it does not.
 * That third one is why a woman who spent two years in the arcade is not restored by a month in
 * the spa, and why the arcade is a decision rather than a rotation.
 */
import type { Person, SaveState } from "./types";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { kgFor } from "./build";
import { DRUG_BY_ID } from "../data/drugs";
import { mobility } from "./genitals";

/** A recovery count that is missing, negative or not a number (old saves) reads as none. */
export function sane(n: unknown): number {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? Math.min(52, Math.round(v)) : 0;
}

const inClinic = (p: Person) => p.facility === "clinic" || p.assignment === "get treatment in the clinic";

/** How long she has left, and what would shorten it, for the UI and the blocked-act messages. */
export function recoveryNote(state: SaveState, p: Person): string {
  const w = sane(p.health.recovery_weeks);
  if (!w) return "";
  const speed = 1 + (inClinic(p) ? 1 : 0) + (state.arcology.facilities["clinic"]?.manager && inClinic(p) ? 1 : 0) + (p.health.curatives >= 2 ? 1 : 0);
  const left = Math.ceil(w / speed);
  return `recovering from surgery: ${left} more week${left === 1 ? "" : "s"} at this pace`;
}

/** Intensive care: pay to have her back on her feet now. Cheaper in your own clinic. */
export function rushCost(state: SaveState, p: Person): number {
  const w = sane(p.health.recovery_weeks);
  return w * (state.arcology.facilities["clinic"]?.level ? 2500 : 4500);
}
export function rushRecovery(state: SaveState, p: Person): string | null {
  const w = sane(p.health.recovery_weeks);
  if (!w) return "she isn't recovering from anything";
  const cost = rushCost(state, p);
  if (state.arcology.cash < cost) return `costs ¤${cost.toLocaleString()}, which you don't have`;
  state.arcology.cash -= cost;
  p.health.recovery_weeks = 0;
  p.health.health = clamp(p.health.health + 5, -100, 100);
  return null;
}

export interface HealthWeek { delta: number; notes: string[]; died: boolean }

export function tickHealth(state: SaveState, p: Person, load: { health: number; energy: number }): HealthWeek {
  const die = rng(`health:${state.arcology.week}:${p.id}`);
  const h = p.health;
  const notes: string[] = [];
  const before = h.health;

  // The week's work. A body also HEALS: health drifts toward a liveable baseline whenever there
  // is anything left in the tank, so a job that costs two points a week settles at an equilibrium
  // instead of walking every worker to death in fifty weeks. What breaks that is a job whose cost
  // outruns the drift — which is exactly what the arcade is for.
  h.health = clamp(h.health + load.health, -100, 100);
  if (h.energy > 25) h.health = clamp(h.health + clamp((40 - h.health) * 0.08, 0, 5), -100, 100);
  // Recovery is a week of nights, not an afternoon. At 45 a facility drawing 45 is sustainable and
  // one drawing 60 is not, which is the line the whole assignment table is balanced against.
  h.energy = clamp(h.energy - load.energy + 45, 0, 100);

  // Exhaustion is where health goes when energy runs out — a body with nothing left starts
  // spending the principal.
  if (h.energy <= 0) { h.health = clamp(h.health - 6, -100, 100); notes.push("worked past empty; it came out of her health"); }

  // Attrition: a slow tax paid by hard weeks, never repaid.
  if (load.health < -3) h.attrition = clamp(h.attrition + Math.abs(load.health) * 0.12, 0, 100);
  const ceiling = 100 - h.attrition;
  if (h.health > ceiling) h.health = ceiling;

  // Medicine.
  if (h.curatives) { h.health = clamp(h.health + 6 * h.curatives, -100, ceiling); }
  h.recovery_weeks = sane(h.recovery_weeks);
  if (h.recovery_weeks > 0) {
    // One week a week on her own; the clinic, a nurse running it, and curatives each take off more.
    let off = 1;
    if (inClinic(p)) off++;
    if (state.arcology.facilities["clinic"]?.manager && inClinic(p)) off++;
    if (h.curatives >= 2) off++;
    h.recovery_weeks = Math.max(0, h.recovery_weeks - off);
    if (h.recovery_weeks === 0) notes.push("out of recovery and back on her feet");
  }

  // Illness runs its course or gets worse, depending on whether anyone is looking after her.
  if (h.illness) {
    const care = h.curatives > 0 || p.assignment === "get treatment in the clinic" || p.assignment === "rest in the spa";
    if (care || h.health > 40) { h.illness = Math.max(0, h.illness - 1) as 0 | 1 | 2 | 3 | 4 | 5; if (!h.illness) notes.push("over whatever it was"); }
    else if (die() < 0.25) { h.illness = Math.min(5, h.illness + 1) as 1 | 2 | 3 | 4 | 5; notes.push("getting sicker, and nobody is treating it"); }
    h.health = clamp(h.health - h.illness * 2, -100, ceiling);
  } else if (h.health < -20 && die() < 0.12) {
    h.illness = 1; notes.push("come down with something");
  }

  // Aphrodisiacs and dependence.
  if (h.aphrodisiacs) {
    p.psyche.arousal = clamp(p.psyche.arousal + h.aphrodisiacs * 12, 0, 100);
    h.addiction = clamp(h.addiction + h.aphrodisiacs * 2.5, 0, 100);
  } else if (h.addiction > 0) {
    h.addiction = clamp(h.addiction - 3, 0, 100);
    if (h.addiction > 30) { p.psyche.relaxation = clamp(p.psyche.relaxation - 0.8, -10, 10); notes.push("in withdrawal"); }
  }

  // Growth drugs and the rest of the regimen, one step a week at most.
  for (const id of h.drugs ?? []) {
    const d = DRUG_BY_ID[id];
    if (!d) continue;
    const line = d.tick(p, die);
    if (line) notes.push(line);
    // A regimen that has done all it can stops, the way the original takes her off it.
    if (d.can(p) && !["female hormones", "male hormones", "hormone blockers"].includes(id)) {
      h.drugs = h.drugs.filter((x) => x !== id);
      notes.push(`taken off ${d.name.toLowerCase()}: ${d.can(p)}`);
    }
  }

  // The scrotum stretches to fit what is growing in it; until it does, it hurts.
  const b = p.body;
  if (b.balls && b.balls > 0 && (b.scrotum ?? 0) > 0) {
    const sc = b.scrotum ?? b.balls;
    if (sc < b.balls && die() < 0.35) b.scrotum = sc + 1;
    if ((b.scrotum ?? 0) < b.balls - 1) {
      h.health = clamp(h.health - 2, -100, 100);
      p.psyche.relaxation = clamp(p.psyche.relaxation - 0.3, -10, 10);
      notes.push("her overfilled scrotum is painfully tight");
    }
  }

  // Past a point the size itself is the problem: dragging it around wears her out.
  const mob = mobility(p);
  if (mob.level >= 2 && !b.feet?.heels_clipped) {
    h.energy = clamp(h.energy - mob.level * 6, 0, 100);
    if (mob.level === 3) notes.push("too big to walk; she has to be carried everywhere");
  }

  // Injuries heal, or they do not.
  for (const inj of h.injuries) {
    if (inj.healed_week) continue;
    const weeks = state.arcology.week - inj.week;
    const need = inj.severity === "minor" ? 2 : inj.severity === "notable" ? 6 : 16;
    if (weeks >= need && h.health > 0) { inj.healed_week = state.arcology.week; notes.push(`healed: ${inj.what}`); }
    else h.health = clamp(h.health - (inj.severity === "grave" ? 3 : 1), -100, ceiling);
  }

  // Diet.
  switch (h.diet) {
    case "fattening": p.body.weight = clamp(p.body.weight + 4, -100, 100); break;
    case "slimming": case "restricted": p.body.weight = clamp(p.body.weight - 4, -100, 100); h.energy = clamp(h.energy - 8, 0, 100); break;
    case "muscle building": p.body.muscle = clamp(p.body.muscle + 3, -100, 100); break;
    case "cleansing": h.health = clamp(h.health + 3, -100, ceiling); break;
  }
  // Weight follows the body's own arithmetic, not a separate ledger.
  p.body.weight_kg = kgFor(p.body.weight, p.body.height_cm);

  const died = h.health <= -100 || (h.health < -80 && h.illness >= 4);
  if (died) notes.push("did not survive the week");

  return { delta: Math.round(h.health - before), notes, died };
}

/** SURGERY AND THE OTHER PROCEDURES. One entry point, so cost, risk and recovery cannot drift
 *  apart the way they did when every operation was its own passage. */
export interface Procedure {
  id: string;
  name: string;
  cost: number;
  /** Weeks of recovery. */
  recovery: number;
  /** Health cost, immediately. */
  toll: number;
  apply: (p: Person) => void;
  /** Why somebody might refuse, and what it does to them if you do it anyway. */
  resented: number;
}

export const PROCEDURES: Procedure[] = [
  { id: "boobs_up", name: "Breast implants", cost: 8000, recovery: 2, toll: 12, resented: 3,
    apply: (p) => { p.body.boob_implant += 400; p.body.boobs += 400; p.body.marks.push({ kind: "implant", where: "chest", what: "implants", week: 0 }); } },
  { id: "boobs_down", name: "Breast reduction", cost: 7000, recovery: 2, toll: 12, resented: 3,
    apply: (p) => { p.body.boobs = Math.max(100, p.body.boobs - 400); p.body.boob_implant = Math.max(0, p.body.boob_implant - 400); } },
  { id: "butt_up", name: "Buttock implants", cost: 6000, recovery: 2, toll: 10, resented: 3,
    apply: (p) => { p.body.butt = Math.min(10, p.body.butt + 2); p.body.butt_implant += 1; } },
  { id: "face", name: "Facial surgery", cost: 12000, recovery: 3, toll: 14, resented: 4,
    apply: (p) => { p.body.face = Math.min(99, p.body.face + 12); p.body.marks.push({ kind: "implant", where: "face", what: "surgical work", week: 0 }); } },
  { id: "lactation", name: "Lactation induction", cost: 5000, recovery: 1, toll: 6, resented: 3,
    apply: (p) => { p.body.lactation = 1; } },
  { id: "sterilise", name: "Sterilisation", cost: 4000, recovery: 1, toll: 8, resented: 8,
    apply: (p) => { p.womb.sterile = true; } },
  { id: "restore_fertility", name: "Fertility restoration", cost: 9000, recovery: 2, toll: 8, resented: 0,
    apply: (p) => { if (p.womb.uterus === "none" || (p.body.vagina === null && p.womb.uterus !== "anal")) return; p.womb.sterile = false; p.womb.fertility = Math.max(p.womb.fertility, 60); } },
  { id: "eyes", name: "Prosthetic eyes", cost: 14000, recovery: 3, toll: 16, resented: 5,
    apply: (p) => { p.body.eyes = "prosthetic"; p.body.marks.push({ kind: "prosthetic", where: "eyes", what: "prosthetic eyes", week: 0 }); } },
  { id: "voice", name: "Voice surgery", cost: 6000, recovery: 2, toll: 10, resented: 5,
    apply: (p) => { p.body.voice = 3; } },
  { id: "hormones_f", name: "Feminising course", cost: 3000, recovery: 0, toll: 4, resented: 4,
    apply: (p) => { p.body.boobs += 120; p.body.waist = clamp(p.body.waist - 12, -100, 100); p.body.muscle = clamp(p.body.muscle - 8, -100, 100); } },
  { id: "hormones_m", name: "Masculinising course", cost: 3000, recovery: 0, toll: 4, resented: 4,
    apply: (p) => { p.body.muscle = clamp(p.body.muscle + 10, -100, 100); p.body.waist = clamp(p.body.waist + 10, -100, 100); } },
];

export const PROCEDURE_BY_ID: Record<string, Procedure> = Object.fromEntries(PROCEDURES.map((x) => [x.id, x]));
