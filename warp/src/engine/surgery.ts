/**
 * SURGERY — what it does to her.
 *
 * The table in data/surgery.ts says what changes. This says what it costs, which is the part the
 * original actually cared about: a slave who is gelded remembers it for the rest of her life, and
 * one who has spent a year asking for a cock takes the same operation as the best day she has had
 * here. The engine already knows which is which — it is in her fetishes, her flaw, her conscience
 * and what your arcology has decided people are for — so the reaction comes out of that rather
 * than out of a flat number.
 *
 * Nothing here is reversible by the same button that did it. Adding a cunt costs fifteen thousand;
 * taking one costs ten and she does not come back from it the same.
 */
import type { Person, ReportLine, SaveState } from "./types";
import { PROCEDURE_BY_ID, type Procedure } from "../data/surgery";
import { clamp, shove, addState } from "./psyche";
import { applyTreatment } from "./obedience";
import { remember } from "./memory";
import { startRumor } from "./social";

export interface SurgeryResult {
  ok: boolean;
  why?: string;
  line?: string;
  /** How she took it, in her own terms. */
  reaction?: string;
  cost?: number;
}

/** Whether the theatre can do it at all, before we ask whether her body can take it. */
export function available(s: SaveState, proc: Procedure): string | null {
  const theatre = s.arcology.facilities["surgery"];
  if (!theatre?.level) return "you have no surgical theatre";
  if (proc.needs_upgrade && theatre.level < 2) return "the theatre is not equipped for that";
  if (proc.extreme && s.content?.extreme === false) return "the arcology does not permit it";
  if (proc.id === "circumcise" && s.content?.circumcision === false) return "not something this arcology does";
  return null;
}

/** How she takes it, before it happens — shown on the button, because she is not a surprise. */
export function howSheTakesIt(s: SaveState, p: Person, proc: Procedure): { score: number; why: string } {
  let score = proc.takes;
  let why = "";
  const fetish = (n: string) => p.persona.fetishes?.find((f) => f.name === n);

  // What she is into, against what is being done.
  const gendered = proc.group === "genitals";
  if (gendered) {
    const dom = fetish("dom"), sub = fetish("submissive"), maso = fetish("masochist");
    const adding = /male_to_female|none_to_female|herm|restore/.test(proc.id);
    const taking = /chop|geld|vagina_removal|sterilise/.test(proc.id);

    if (maso && maso.strength > 50 && taking) { score += 22; why = "she wants it to be something that was done to her"; }
    else if (sub && sub.strength > 50 && taking) { score += 12; why = "having it decided for her is most of the appeal"; }
    else if (dom && dom.strength > 55 && taking) { score -= 18; why = "she has spent a year being the one who decides and this is not that"; }
    else if (adding && p.persona.paraphilia) { score += 8; why = "she has stopped having opinions about what gets added"; }
  }

  // The arcology's own position. A body purist household treats a herm as a mutilation; a gender
  // radical one treats the same operation as a promotion, and she has been living in it either way.
  const doc = s.arcology.doctrines;
  const radical = doc["gender_radical"]?.adoption ?? 0;
  const purist = (doc["body_purist"]?.adoption ?? 0) + (doc["gender_fundamentalist"]?.adoption ?? 0);
  if (proc.group === "genitals" || proc.group === "body") {
    if (radical > 40) { score += radical / 8; why = why || "half the arcology has had something similar done"; }
    if (purist > 40) { score -= purist / 10; why = why || "she knows what her neighbours will call her"; }
  }

  // Fear does most of the work here. A woman held by terror expects the worst of every operation.
  score -= p.bond.fear / 12;
  score += p.bond.bond / 20;
  if (p.psyche.state === "broken") { score = Math.max(score, -4); why = "she is past minding"; }
  if (!why) why = score < -20 ? "she has understood exactly what is being taken" : score > 8 ? "she has wanted this" : "she will be quiet about it";
  return { score: Math.round(score), why };
}

export function operate(s: SaveState, p: Person, procId: string): SurgeryResult {
  const proc = PROCEDURE_BY_ID[procId];
  if (!proc) return { ok: false, why: "no such procedure" };
  const gate = available(s, proc);
  if (gate) return { ok: false, why: gate };
  const bodily = proc.can(p);
  if (bodily) return { ok: false, why: bodily };
  if (s.arcology.cash < proc.cost) return { ok: false, why: `¤${proc.cost.toLocaleString()} and you do not have it` };
  if (p.health.recovery_weeks > 0) return { ok: false, why: "she is still recovering from the last one" };
  if (p.womb.fetuses.length && proc.group !== "body") return { ok: false, why: "not while she is carrying" };

  const week = s.arcology.week;
  const felt = howSheTakesIt(s, p, proc);

  s.arcology.cash -= proc.cost;
  proc.apply(p);
  p.health.health = clamp(p.health.health + proc.damage, -100, 100);
  p.health.recovery_weeks = Math.max(p.health.recovery_weeks, proc.recovery);
  p.body.marks.push({ kind: "implant", where: proc.group, what: proc.name.toLowerCase(), week });

  // The nervous system, then the ledger, then what she keeps.
  shove(p.psyche, felt.score / 12, { hard: true });
  if (felt.score < -10) {
    applyTreatment(p, { kind: "cruelty", size: Math.min(12, Math.abs(felt.score) / 3), why: proc.name.toLowerCase() }, week);
    addState(p.psyche, `what they did in the theatre`, week);
    p.bond.hope = clamp(p.bond.hope - Math.abs(felt.score) / 4, 0, 100);
  } else if (felt.score > 6) {
    applyTreatment(p, { kind: "recognition", size: Math.min(10, felt.score / 2), why: `she asked for this and got it` }, week);
  }

  const mem = s.memory[p.id];
  if (mem) {
    remember(mem, {
      content: `the ${proc.name.toLowerCase()} — ${proc.what}`,
      week, importance: Math.min(10, 4 + Math.abs(felt.score) / 6),
      charge: felt.score < -10 ? "sharp" : felt.score > 6 ? "bright" : "dull",
      core: Math.abs(felt.score) > 30,
    });
  }

  // The household finds out. Genital work is the kind of thing everybody in the building knows by
  // Thursday, and what they take from it is what could be done to them.
  if (proc.group === "genitals") {
    startRumor(s, `${p.name} came back from the theatre changed`, { about: p.id, salience: felt.score < -20 ? 9 : 5 });
    if (felt.score < -25) {
      for (const other of Object.values(s.people)) {
        if (other.id === p.id || (other.status !== "owned" && other.status !== "indentured")) continue;
        other.bond.fear = clamp(other.bond.fear + 5, 0, 100);
        shove(other.psyche, -0.4);
      }
    }
  }

  return {
    ok: true, cost: proc.cost,
    line: `${proc.name}. ¤${proc.cost.toLocaleString()}, ${proc.recovery} week${proc.recovery > 1 ? "s" : ""} flat on her back.`,
    reaction: reactionLine(p, felt.score, felt.why),
  };
}

function reactionLine(p: Person, score: number, why: string): string {
  if (p.psyche.state === "broken") return `${p.name} is wheeled back in and does not ask what was done.`;
  if (score < -35) return `${p.name} works out what is gone before anybody tells her, and the sound she makes is not one you will forget. ${cap(why)}.`;
  if (score < -15) return `${p.name} is quiet about it for a fortnight and then quiet about it in a different way. ${cap(why)}.`;
  if (score < -4) return `${p.name} takes it the way she takes most things here. ${cap(why)}.`;
  if (score > 14) return `${p.name} spends the first day out of the tank looking at herself, and is better company that week than she has been all year.`;
  if (score > 4) return `${p.name} is pleased, and slightly embarrassed about being pleased. ${cap(why)}.`;
  return `${p.name} is back on her feet by Thursday. ${cap(why)}.`;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Everything the theatre could do to this body right now, with the reasons it cannot. */
export function optionsFor(s: SaveState, p: Person): { proc: Procedure; blocked: string | null; felt: ReturnType<typeof howSheTakesIt> }[] {
  return Object.values(PROCEDURE_BY_ID).map((proc) => ({
    proc,
    blocked: available(s, proc) ?? proc.can(p) ?? (s.arcology.cash < proc.cost ? "you cannot afford it" : null),
    felt: howSheTakesIt(s, p, proc),
  }));
}

/* Recovery itself is ticked in health.ts, where every other clock on her body lives. Adding a
 * second decrement here is how she would come off the ward twice as fast as the panel said. */
