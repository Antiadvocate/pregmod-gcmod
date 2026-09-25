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
import { reconcileAnatomy } from "./genitals";
import { footSurgery } from "./podolatry";
import { sane, recoveryNote } from "./health";
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

/** The surgical theatre is an upgrade bought on the Clinic. 0: none. 1: the theatre. 2: the
 *  theatre in a clinic expanded to level 2, which the advanced procedures need. */
export function theatreLevel(s: SaveState): number {
  const clinic = s.arcology.facilities["clinic"];
  if (!clinic?.level || !clinic.upgrades?.["surgery"]) return 0;
  return clinic.level >= 2 ? 2 : 1;
}

/** Whether the theatre can do it at all, before we ask whether her body can take it. */
export function available(s: SaveState, proc: Procedure): string | null {
  const level = theatreLevel(s);
  if (!level) return "you have no surgical theatre";
  if (proc.needs_upgrade && level < 2) return "needs the Clinic expanded to level 2";
  if (proc.extreme && s.content?.extreme === false) return "disabled in content settings";
  if (proc.id === "circumcise" && s.content?.circumcision === false) return "disabled in content settings";
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
    const adding = /none_to_female|herm|restore|add_|enlarge|expand/.test(proc.id);
    const taking = /male_to_female|chop|geld|vagina_removal|sterilise|reduce|tuck|clip_tendons/.test(proc.id);

    if (maso && maso.strength > 50 && taking) { score += 22; why = "she's a masochist and wants it done to her"; }
    else if (sub && sub.strength > 50 && taking) { score += 12; why = "she's submissive and likes having it decided for her"; }
    else if (dom && dom.strength > 55 && taking) { score -= 18; why = "she's dominant and hates having this forced on her"; }
    else if (adding && p.persona.paraphilia) { score += 8; why = "she doesn't care what's done to her body any more"; }
  }

  // The arcology's own position. A body purist household treats a herm as a mutilation; a gender
  // radical one treats the same operation as a promotion, and she has been living in it either way.
  const doc = s.arcology.doctrines;
  const radical = doc["gender_radical"]?.adoption ?? 0;
  const purist = (doc["body_purist"]?.adoption ?? 0) + (doc["gender_fundamentalist"]?.adoption ?? 0);
  if (proc.group === "genitals" || proc.group === "body" || proc.group === "feet") {
    if (radical > 40) { score += radical / 8; why = why || "lots of people in the arcology have had similar surgery"; }
    if (purist > 40) { score -= purist / 10; why = why || "she knows the body purists will look down on her"; }
  }

  // Fear does most of the work here. A woman held by terror expects the worst of every operation.
  score -= p.bond.fear / 12;
  score += p.bond.bond / 20;
  if (p.psyche.state === "broken") { score = Math.max(score, -4); why = "she is past minding"; }
  if (!why) why = score < -20 ? "she knows exactly what she's losing" : score > 8 ? "she wanted this" : "she doesn't have strong feelings about it";
  return { score: Math.round(score), why };
}

export function operate(s: SaveState, p: Person, procId: string): SurgeryResult {
  const proc = PROCEDURE_BY_ID[procId];
  if (!proc) return { ok: false, why: "no such procedure" };
  const gate = available(s, proc);
  if (gate) return { ok: false, why: gate };
  const bodily = proc.can(p, s);
  if (bodily) return { ok: false, why: bodily };
  if (s.arcology.cash < proc.cost) return { ok: false, why: `costs ¤${proc.cost.toLocaleString()}, which you don't have` };
  p.health.recovery_weeks = sane(p.health.recovery_weeks);
  if (p.health.recovery_weeks > 0) return { ok: false, why: `she is still recovering from the last one (${recoveryNote(s, p).replace(/^recovering from surgery: /, "")})` };
  if (p.womb.fetuses.length && proc.group !== "body") return { ok: false, why: "not while she is carrying" };

  const week = s.arcology.week;
  const felt = howSheTakesIt(s, p, proc);

  s.arcology.cash -= proc.cost;
  proc.apply(p);
  reconcileAnatomy(p);
  if (proc.group === "feet") footSurgery(s, p, proc.id);
  p.health.health = clamp(p.health.health + proc.damage, -100, 100);
  p.health.recovery_weeks = Math.max(p.health.recovery_weeks, proc.recovery);
  p.body.marks.push({ kind: "implant", where: proc.group, what: proc.name.toLowerCase(), week });

  // The nervous system, then the ledger, then what she keeps.
  shove(p.psyche, felt.score / 12, { hard: true });
  if (felt.score < -10) {
    applyTreatment(p, { kind: "cruelty", size: Math.min(12, Math.abs(felt.score) / 3), why: proc.name.toLowerCase() }, week);
    addState(p.psyche, `upset about her surgery`, week);
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
    startRumor(s, `${p.name} had surgery`, { about: p.id, salience: felt.score < -20 ? 9 : 5 });
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
    line: `${proc.name}. ¤${proc.cost.toLocaleString()}, ${proc.recovery} week${proc.recovery > 1 ? "s" : ""} of recovery.`,
    reaction: reactionLine(p, felt.score, felt.why),
  };
}

function reactionLine(p: Person, score: number, why: string): string {
  if (p.psyche.state === "broken") return `${p.name} is wheeled back in. She's mindbroken, and doesn't notice what was done.`;
  if (score < -35) return `${p.name} realizes what's been done before anyone tells her, and screams. ${cap(why)}.`;
  if (score < -15) return `${p.name} is upset, and quiet and withdrawn for two weeks. ${cap(why)}.`;
  if (score < -4) return `${p.name} accepts it. ${cap(why)}.`;
  if (score > 14) return `${p.name} spends her first day out of surgery admiring herself in the mirror. She's delighted.`;
  if (score > 4) return `${p.name} is pleased with the result. ${cap(why)}.`;
  return `${p.name} is back on her feet by Thursday. ${cap(why)}.`;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Everything the theatre could do to this body right now, with the reasons it cannot. */
export function optionsFor(s: SaveState, p: Person): { proc: Procedure; blocked: string | null; felt: ReturnType<typeof howSheTakesIt> }[] {
  return Object.values(PROCEDURE_BY_ID).map((proc) => ({
    proc,
    blocked: available(s, proc) ?? proc.can(p, s) ?? (s.arcology.cash < proc.cost ? "you cannot afford it" : null),
    felt: howSheTakesIt(s, p, proc),
  }));
}

/* Recovery itself is ticked in health.ts, where every other clock on her body lives. Adding a
 * second decrement here is how she would come off the ward twice as fast as the panel said. */
