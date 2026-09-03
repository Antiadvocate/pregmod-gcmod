/**
 * THE LADDER, AND THE THING AT THE TOP OF IT.
 *
 * The genre has always let you marry a slave. It has never let the marriage mean anything, because
 * the marriage was a flag on a record: `relationship = 5`, a nicer title, a small weekly bonus, and
 * the same woman doing the same job under the same person.
 *
 * Here it is a road with seven rungs, each one gated on something you cannot buy, each one bought
 * with a RITE you actually play, and the road does not stop at the wedding. It goes one rung past
 * it, to the place where she is the one deciding — and the engine means that literally. Past the
 * top of this file the weekly report is addressed to her, the household is run off her personality,
 * her conscience decides how the others are treated, and the game asks you what you would like to
 * do about the things SHE has decided.
 *
 * ── WHY THE GATES ARE WHAT THEY ARE ─────────────────────────────────────────────────────────
 *
 * The gate that matters is `fragility` (engine/obedience.ts): what share of her compliance is bought
 * with fear rather than earned. You cannot court a woman who is obeying because the cellblock is
 * downstairs — not because the engine disapproves, but because there is nothing there to court. She
 * will say yes to everything and mean none of it, and the ladder checks. A household run on terror
 * can reach `kept` and stops dead, and the panel says exactly why.
 *
 * The second gate is TIME. Every rung has a minimum number of weeks at the rung below it. A road
 * that can be run in a fortnight is a road nobody remembers walking.
 *
 * The third is her own record: what she remembers about being here has to be net positive
 * (`memoryTilt`), which no amount of this week's kindness can fake, because the bank is the bank.
 */
import type { Person, ReportLine, SaveState } from "./types";
import { clamp, shove, addState } from "./psyche";
import { read, applyTreatment, memoryTilt } from "./obedience";
import { remember } from "./memory";
import { startRumor, moveEdge } from "./social";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { rng } from "./rng";

export type Standing = NonNullable<Person["romance"]>["standing"];

export const LADDER: Standing[] = ["property", "favourite", "kept", "courted", "betrothed", "wife", "keeper"];

export interface Rung {
  id: Standing;
  name: string;
  /** What it means, in the arcology's own terms. */
  what: string;
  /** The rite that has to be performed to get here, if any. */
  rite?: string;
  gate: {
    devotion?: number;
    trust?: number;
    /** Maximum share of her obedience that may be fear. The gate that actually bites. */
    fragility?: number;
    bond?: number;
    hope?: number;
    /** Weeks at the previous rung. */
    weeks?: number;
    /** What she remembers about being here, −1 … +1. */
    tilt?: number;
    /** Dominion, for the last rung only. */
    dominion?: number;
  };
  /** What it does once you are there. */
  effect: string;
}

export const RUNGS: Rung[] = [
  {
    id: "property", name: "Property", what: "She is yours. That is the whole of it.",
    gate: {}, effect: "Nothing. This is where everybody starts.",
  },
  {
    id: "favourite", name: "Favourite", what: "You keep coming back to her, and the household has noticed.",
    rite: "notice",
    gate: { devotion: 25, weeks: 3 },
    effect: "She stops being interchangeable. Small bond gain every week you actually see her; the others notice, and some of them mind.",
  },
  {
    id: "kept", name: "Kept", what: "She has a room in the suite and she does not work the floors any more.",
    rite: "move_her_up",
    gate: { devotion: 45, trust: 20, fragility: 0.55, weeks: 6 },
    effect: "She is off the roster. Her upkeep goes up and she settles considerably.",
  },
  {
    id: "courted", name: "Courted", what: "You are courting her, in front of everybody, like she is somebody who could say no.",
    rite: "court",
    gate: { devotion: 60, trust: 45, fragility: 0.35, bond: 40, hope: 35, weeks: 8, tilt: 0.1 },
    effect: "The household reads it. Her hope climbs weekly. Doctrines that think she is livestock start costing you standing.",
  },
  {
    id: "betrothed", name: "Betrothed", what: "You have said it out loud, in public, and it is on the registry.",
    rite: "promise",
    gate: { devotion: 75, trust: 65, fragility: 0.22, bond: 60, hope: 55, weeks: 8, tilt: 0.25 },
    effect: "A promise on the ledger. Breaking it now is the most expensive thing you can do to a person in this game.",
  },
  {
    id: "wife", name: "Wife", what: "Married. Witnessed. The arcology has an opinion and so does every doctrine you hold.",
    rite: "wedding",
    gate: { devotion: 85, trust: 80, fragility: 0.15, bond: 75, hope: 65, weeks: 10, tilt: 0.35 },
    effect: "She stops being a slave on the registry and becomes your wife on it. She gains a say — dominion starts moving.",
  },
  {
    id: "keeper", name: "She has the collar", what: "You did what she asked, and then you kept doing it, and at some point it stopped being a game.",
    rite: "reversal",
    gate: { devotion: 90, trust: 85, fragility: 0.1, bond: 85, dominion: 85, weeks: 12, tilt: 0.4 },
    effect: "The arcology is hers. The week is reported to her. She decides, and you are asked.",
  },
];

export const RUNG_BY_ID: Record<string, Rung> = Object.fromEntries(RUNGS.map((r) => [r.id, r]));

export function romanceOf(p: Person): NonNullable<Person["romance"]> {
  if (!p.romance) {
    p.romance = { standing: "property", since_week: 0, dominion: -100, rites: [], granted: 0, refused: 0 };
  }
  return p.romance;
}

export function rungIndex(s: Standing): number { return LADDER.indexOf(s); }

/** Can she go up? Returns the next rung and every reason she cannot, so the panel can show the
 *  wall rather than a greyed-out button. */
export function nextRung(s: SaveState, p: Person): { rung: Rung; ready: boolean; blocked: string[] } | null {
  const rom = romanceOf(p);
  const idx = rungIndex(rom.standing);
  if (idx >= LADDER.length - 1) return null;
  const rung = RUNGS[idx + 1];
  const r = read(p, s.memory[p.id]);
  const weeks = s.arcology.week - rom.since_week;
  const tilt = memoryTilt(s.memory[p.id]);
  const blocked: string[] = [];

  const g = rung.gate;
  if (g.devotion !== undefined && r.devotion < g.devotion) blocked.push(`devotion ${r.devotion} of ${g.devotion}`);
  if (g.trust !== undefined && r.trust < g.trust) blocked.push(`trust ${r.trust} of ${g.trust}`);
  if (g.bond !== undefined && p.bond.bond < g.bond) blocked.push(`bond ${Math.round(p.bond.bond)} of ${g.bond}`);
  if (g.hope !== undefined && p.bond.hope < g.hope) blocked.push(`hope ${Math.round(p.bond.hope)} of ${g.hope}`);
  if (g.weeks !== undefined && weeks < g.weeks) blocked.push(`${weeks} of ${g.weeks} weeks at ${RUNG_BY_ID[rom.standing].name.toLowerCase()}`);
  if (g.dominion !== undefined && rom.dominion < g.dominion) blocked.push(`she decides ${Math.round(rom.dominion)} of ${g.dominion}`);
  if (g.tilt !== undefined && tilt < g.tilt) {
    blocked.push(tilt < 0
      ? `what she remembers about being here is net bad (${tilt.toFixed(2)}). No week you can have from here fixes that; only a long run of different ones does.`
      : `what she remembers is only ${tilt.toFixed(2)} good, and this needs ${g.tilt}`);
  }
  if (g.fragility !== undefined && r.fragility > g.fragility) {
    blocked.push(`${Math.round(r.fragility * 100)}% of her obedience is fear, and this rung allows ${Math.round(g.fragility * 100)}%. She would say yes to anything you asked. That is the problem.`);
  }
  if (p.age < 18) blocked.push("she is a child");
  if (p.status !== "owned" && p.status !== "indentured" && rom.standing === "property") blocked.push("she is not yours");

  return { rung, ready: blocked.length === 0, blocked };
}

/* ── THE RITES ────────────────────────────────────────────────────────────────────────────────
 * The theatrics. Each one is an event you actually play, it costs something real, and the whole
 * household and every doctrine you hold has an opinion about it. That is where the fun of getting
 * her here lives — not in the flag flipping, in the fortnight of everybody watching.
 */

export interface Rite {
  id: string;
  name: string;
  /** The seed handed to the narrator; the scene is played, not printed. */
  seed: (s: SaveState, p: Person) => string;
  cash: number;
  /** Reputation, before doctrine reactions. */
  rep: number;
  /** Applied when it goes through. */
  apply: (s: SaveState, p: Person) => ReportLine[];
}

const line = (text: string, tone: ReportLine["tone"], weight: number, person?: string): ReportLine => ({ text, tone, weight, person });

export const RITES: Record<string, Rite> = {
  notice: {
    id: "notice", name: "Single her out", cash: 0, rep: 0,
    seed: (_s, p) => `You send for ${p.name} again, for the third time this week, and the girl who fetches her does not bother to hide what she thinks of it.`,
    apply: (s, p) => {
      applyTreatment(p, { kind: "recognition", size: 4, why: "singled out in front of the household" }, s.arcology.week);
      startRumor(s, `${p.name} is the one he keeps sending for`, { about: p.id, salience: 5 });
      return [line(`${p.name} is your favourite, and the household knows before she does.`, "good", 6, p.id)];
    },
  },
  move_her_up: {
    id: "move_her_up", name: "Move her into the suite", cash: 4000, rep: 60,
    seed: (_s, p) => `${p.name}'s things — there are not many — are being carried up to the suite by somebody who is not being told why.`,
    apply: (s, p) => {
      applyTreatment(p, { kind: "recognition", size: 7, why: "taken off the floors and moved upstairs" }, s.arcology.week);
      p.assignment = "please you";
      p.facility = "master_suite";
      shove(p.psyche, 1.5, { hard: true });
      const mem = s.memory[p.id];
      if (mem) remember(mem, { content: "the day she stopped working the floors and was given a room upstairs", week: s.arcology.week, importance: 9, charge: "bright", core: true });
      startRumor(s, `${p.name} lives upstairs now`, { about: p.id, salience: 6 });
      return [line(`${p.name} sleeps in the suite. Every other woman in this arcology has done that arithmetic by lunchtime.`, "good", 8, p.id)];
    },
  },
  court: {
    id: "court", name: "Court her, publicly", cash: 9000, rep: 200,
    seed: (_s, p) => `You have started courting ${p.name} where people can see it — which in an arcology means you have made a statement about what she is, and the statement contradicts the paperwork.`,
    apply: (s, p) => {
      applyTreatment(p, { kind: "promise_kept", size: 6, why: "courted in public, like somebody who could say no" }, s.arcology.week);
      p.bond.hope = clamp(p.bond.hope + 25, 0, 100);
      shove(p.psyche, 2, { hard: true });
      const mem = s.memory[p.id];
      if (mem) remember(mem, { content: "he courted her in front of the whole arcology, as if she could have refused", week: s.arcology.week, importance: 10, charge: "bright", core: true });
      startRumor(s, `he is courting ${p.name} in public`, { about: p.id, salience: 8 });
      return [line(`You are courting ${p.name} in public. Every doctrine you hold has now been asked a question.`, "good", 9, p.id)];
    },
  },
  promise: {
    id: "promise", name: "Promise yourself to her", cash: 6000, rep: 300,
    seed: (_s, p) => `It goes on the registry: an intent to marry, filed by an arcology owner, naming a slave. The clerk reads it twice.`,
    apply: (s, p) => {
      applyTreatment(p, { kind: "promise_kept", size: 9, why: "betrothed, on the registry, in writing" }, s.arcology.week);
      p.bond.hope = clamp(p.bond.hope + 30, 0, 100);
      addState(p.psyche, "waiting for it to be taken back", s.arcology.week);
      const mem = s.memory[p.id];
      if (mem) remember(mem, { content: "he put it in writing, on the registry, where other people could read it", week: s.arcology.week, importance: 10, charge: "bright", core: true });
      return [line(`${p.name} is betrothed to you and it is on the registry. She is waiting for you to take it back — that is what she has learned people do.`, "good", 9, p.id)];
    },
  },
  wedding: {
    id: "wedding", name: "Marry her", cash: 25000, rep: 900,
    seed: (s, p) => `The concourse is full. ${p.name} is at the front of it in something that cost more than she did, and half of ${s.arcology.name} has come to watch an owner do this.`,
    apply: (s, p) => {
      const rom = romanceOf(p);
      applyTreatment(p, { kind: "promise_kept", size: 10, why: "married, witnessed, on the registry" }, s.arcology.week);
      p.bond.hope = clamp(p.bond.hope + 40, 0, 100);
      p.bond.fear = clamp(p.bond.fear * 0.4, 0, 100);
      p.status = "indentured";       // on the registry she stops being chattel
      p.indenture_weeks = undefined;
      rom.dominion = clamp(rom.dominion + 25, -100, 100);
      shove(p.psyche, 3, { hard: true });
      p.psyche.capacity_born = +clamp(p.psyche.capacity_born + 0.4, -6, 6).toFixed(2);
      const mem = s.memory[p.id];
      if (mem) remember(mem, { content: "the wedding — the concourse full, and the registry changed afterwards", week: s.arcology.week, importance: 10, charge: "bright", core: true });
      startRumor(s, `he married ${p.name}`, { about: p.id, salience: 10 });
      s.canon.push(`${p.name} is married to the owner of ${s.arcology.name}, witnessed, on the registry.`);
      // The rest of the household is not neutral about this.
      const out = [line(`You married ${p.name}.`, "good", 10, p.id)];
      for (const other of Object.values(s.people)) {
        if (other.id === p.id || other.status !== "owned") continue;
        other.bond.hope = clamp(other.bond.hope + 12, 0, 100);
        const jealous = (s.edges.find((e) => e.from === other.id && e.to === "owner")?.attraction ?? 0) > 50;
        if (jealous) {
          addState(other.psyche, `watching him marry ${p.name}`, s.arcology.week);
          shove(other.psyche, -1.2);
          moveEdge(s.edges, other.id, p.id, { warmth: -20 });
        }
      }
      out.push(line(`Every woman in the household watched an owner marry a slave. Their hope is up, and two of them cannot look at her.`, "neutral", 8));
      return out;
    },
  },
  reversal: {
    id: "reversal", name: "Give her the collar", cash: 0, rep: -1200,
    seed: (_s, p) => `${p.name} is holding the collar. Not wearing it — holding it, and looking at you, and waiting to see whether you are going to do the thing you both know is about to happen.`,
    apply: (s, p) => {
      const rom = romanceOf(p);
      rom.dominion = 100;
      rom.standing = "keeper";
      p.status = "free";
      s.player.owned_by = p.id;
      s.canon.push(`${p.name} runs ${s.arcology.name}. The registry says the arcology's former owner belongs to her, and the registry is not a joke here.`);
      startRumor(s, `he gave ${p.name} the collar and meant it`, { about: p.id, salience: 10 });
      const mem = s.memory[p.id];
      if (mem) remember(mem, { content: "the night he handed her the collar and put his own neck in it", week: s.arcology.week, importance: 10, charge: "bright", core: true });
      shove(p.psyche, 3, { hard: true });
      return [
        line(`${p.name} has the arcology. The registry has been changed and the change is real.`, "good", 10, p.id),
        line(`The week will be reported to her from now on. She will tell you what she wants, and you will be the one deciding whether to do it.`, "warning", 10, p.id),
      ];
    },
  },
};

/** Perform the next rite. Everything is checked here rather than in the view. */
export function ascend(s: SaveState, p: Person): { ok: boolean; why?: string; lines: ReportLine[]; seed?: string } {
  const next = nextRung(s, p);
  if (!next) return { ok: false, why: "there is nowhere further to go", lines: [] };
  if (!next.ready) return { ok: false, why: next.blocked[0], lines: [] };
  const rite = next.rung.rite ? RITES[next.rung.rite] : undefined;
  if (rite && s.arcology.cash < rite.cash) return { ok: false, why: `it costs ¤${rite.cash.toLocaleString()} and you do not have it`, lines: [] };

  const rom = romanceOf(p);
  const lines: ReportLine[] = [];
  let seed: string | undefined;

  if (rite) {
    s.arcology.cash -= rite.cash;
    s.arcology.rep += rite.rep;
    seed = rite.seed(s, p);
    lines.push(...rite.apply(s, p));
    rom.rites.push(rite.id);
  }

  rom.standing = next.rung.id;
  rom.since_week = s.arcology.week;

  // The doctrines have opinions, and the loud ones cost real standing.
  for (const [id, st] of Object.entries(s.arcology.doctrines)) {
    if (st.adoption < 35) continue;
    const d = DOCTRINE_BY_ID[id];
    if (!d) continue;
    const hostile = ["degradationist", "eugenics", "dependency", "subjugationist"].includes(id);
    const pleased = ["paternalist", "chattel_religion", "repopulation", "arabian", "antebellum"].includes(id);
    if (hostile && rungIndex(rom.standing) >= 3) {
      const cost = Math.round(st.adoption * 6);
      s.arcology.rep -= cost;
      lines.push(line(`${d.noun} does not recognise what you just did. −${cost} standing.`, "bad", 7));
    } else if (pleased && rungIndex(rom.standing) >= 4) {
      const gain = Math.round(st.adoption * 4);
      s.arcology.rep += gain;
      lines.push(line(`${d.noun} approves. +${gain} standing.`, "good", 5));
    }
  }

  return { ok: true, lines, seed };
}

/** Down the ladder, which is the other thing that can happen. Breaking a promise at betrothed or
 *  wife is the most expensive act in the game and it is supposed to be. */
export function renounce(s: SaveState, p: Person, why: string): ReportLine[] {
  const rom = romanceOf(p);
  const was = rom.standing;
  const idx = rungIndex(was);
  if (idx <= 0) return [];
  const size = idx >= 4 ? 10 : idx >= 3 ? 7 : 4;
  applyTreatment(p, { kind: "promise_broken", size, why }, s.arcology.week);
  const mem = s.memory[p.id];
  if (mem) remember(mem, { content: `he took it back — ${why}`, week: s.arcology.week, importance: 10, charge: "sharp", core: true });
  addState(p.psyche, "what he took back", s.arcology.week);
  shove(p.psyche, -3, { hard: true });
  rom.standing = "property";
  rom.since_week = s.arcology.week;
  rom.dominion = clamp(rom.dominion - 40, -100, 100);
  if (idx >= 4) {
    startRumor(s, `he took it back from ${p.name} after promising in public`, { salience: 10, about: p.id });
    s.arcology.rep -= 1500;
    for (const other of Object.values(s.people)) {
      if (other.status !== "owned" || other.id === p.id) continue;
      other.bond.hope = clamp(other.bond.hope - 20, 0, 100);
      other.bond.fear = clamp(other.bond.fear + 8, 0, 100);
    }
    return [
      line(`You broke a public promise to ${p.name}.`, "bad", 10, p.id),
      line(`Every woman in this household watched a promise get taken back, and they have all filed it.`, "bad", 9),
    ];
  }
  return [line(`${p.name} is back to being property. She has understood the lesson.`, "bad", 8, p.id)];
}

/* ── DOMINION ─────────────────────────────────────────────────────────────────────────────────
 * Who is deciding. This is the axis that makes the top of the ladder mean something, and it moves
 * only by what you actually DO when she asks for something — not by affection, not by numbers, and
 * not by anything you can buy.
 */

export function shiftDominion(s: SaveState, p: Person, amount: number, why: string): void {
  const rom = romanceOf(p);
  const before = rom.dominion;
  // She cannot take ground she has not been given the standing to hold. Below `wife` the ceiling
  // is low, because a favourite with opinions is still a favourite.
  const ceiling = { property: -40, favourite: -20, kept: 0, courted: 25, betrothed: 50, wife: 100, keeper: 100 }[rom.standing];
  rom.dominion = clamp(rom.dominion + amount, -100, ceiling);
  if (amount > 0 && rom.dominion > before) {
    p.bond.hope = clamp(p.bond.hope + amount * 0.3, 0, 100);
    shove(p.psyche, amount * 0.05);
  }
  if (amount < 0) {
    p.bond.resentment = clamp(p.bond.resentment + Math.abs(amount) * 0.2, 0, 100);
  }
  const mem = s.memory[p.id];
  if (mem && Math.abs(amount) >= 8) {
    remember(mem, { content: amount > 0 ? `he did what she asked — ${why}` : `he said no — ${why}`, week: s.arcology.week, importance: 6, charge: amount > 0 ? "warm" : "cold" });
  }
}

/** Who, if anyone, is currently running this arcology instead of you. */
export function theKeeper(s: SaveState): Person | null {
  if (!s.player.owned_by) return null;
  const p = s.people[s.player.owned_by];
  return p && p.romance?.standing === "keeper" ? p : null;
}

/** How much of the household she is already deciding, at the current dominion. Drives what the UI
 *  hands over and what the week does on her say-so rather than yours. */
export function herReach(p: Person): { assignments: boolean; purchases: boolean; policy: boolean; everything: boolean } {
  const d = p.romance?.dominion ?? -100;
  return {
    assignments: d >= 40,
    purchases: d >= 55,
    policy: d >= 70,
    everything: d >= 85,
  };
}

/* ── WHAT SHE DOES WITH IT ────────────────────────────────────────────────────────────────────
 * Once she is running things, the arcology is run off HER — her conscience, her doctrine
 * preferences, her fetishes, her attachment style. Two different women take the same household in
 * opposite directions, and that is the entire point of handing it over.
 */

export interface KeeperWeek { lines: ReportLine[] }

export function keeperRunsTheWeek(s: SaveState): KeeperWeek {
  const her = theKeeper(s);
  const lines: ReportLine[] = [];
  if (!her) return { lines };
  const r = rng(`keeper:${s.arcology.week}`);
  const reach = herReach(her);
  const household = Object.values(s.people).filter((p) => p.status === "owned" && p.id !== her.id);

  // HER CONSCIENCE DECIDES HOW THE HOUSEHOLD IS TREATED. This is the one number that changes what
  // kind of arcology she runs, and it was set at her forge, long before any of this.
  const cold = her.persona.conscience < 0.35;
  const warm = her.persona.conscience > 0.65;

  if (reach.assignments && household.length) {
    const target = r.pick(household);
    if (warm) {
      if (target.health.health < 0 || target.psyche.state !== "intact") {
        target.assignment = "rest in the spa";
        target.facility = "spa";
        applyTreatment(target, { kind: "kindness", size: 3, why: `${her.name} pulled her out` }, s.arcology.week);
        lines.push(line(`${her.name} took ${target.name} off the floors without asking you. She was right to.`, "good", 6, target.id));
      }
    } else if (cold) {
      const worst = household.sort((a, b) => a.bond.read.devotion - b.bond.read.devotion)[0];
      if (worst && s.arcology.facilities["cellblock"]?.level) {
        worst.assignment = "be confined in the cellblock";
        worst.facility = "cellblock";
        applyTreatment(worst, { kind: "coercion", size: 5, why: `${her.name} put her there` }, s.arcology.week);
        lines.push(line(`${her.name} put ${worst.name} in the cellblock. She did not consult you and she did not enjoy having to explain it either.`, "warning", 7, worst.id));
      }
    }
  }

  if (reach.policy && r.chance(0.25)) {
    // She pushes the doctrine she actually believes in, which comes off her own record.
    const wants = cold ? "degradationist" : warm ? "paternalist" : her.persona.fetishes.some((f) => f.name === "pregnancy") ? "repopulation" : "professionalism";
    const st = s.arcology.doctrines[wants];
    if (st) {
      st.adoption = clamp(st.adoption + 4, 0, 100);
      lines.push(line(`${her.name} has been pushing ${DOCTRINE_BY_ID[wants]?.noun ?? wants} all week, and it has moved.`, "neutral", 5, her.id));
    }
  }

  if (reach.everything) {
    // The report is hers now, and so is the money.
    lines.push(line(`${her.name} closed the week's books herself. You saw the numbers when she was finished with them.`, "neutral", 4, her.id));
  }

  return { lines };
}

/** The weekly romance pass: standing decays if you ignore her, and rises quietly if you do not. */
export function tickRomance(s: SaveState, p: Person): ReportLine[] {
  const rom = p.romance;
  if (!rom || rom.standing === "property") return [];
  const lines: ReportLine[] = [];
  const idx = rungIndex(rom.standing);

  // Being kept and then ignored is its own injury, and the higher the rung the worse it reads.
  if (p.bond.weeks_since_kindness > 4) {
    const bite = idx * 0.6;
    p.bond.hope = clamp(p.bond.hope - bite, 0, 100);
    shiftDominion(s, p, -1, "he has not come near her in a month");
    if (p.bond.weeks_since_kindness === 8) {
      lines.push(line(`${p.name} is your ${RUNG_BY_ID[rom.standing].name.toLowerCase()} and you have not been near her in two months. She has started drawing conclusions.`, "warning", 7, p.id));
    }
  } else if (idx >= 3) {
    p.bond.hope = clamp(p.bond.hope + 1.5, 0, 100);
    shove(p.psyche, 0.15);
  }

  // A wife earns dominion simply by being one — the standing is real and it accumulates.
  if (idx >= 5) shiftDominion(s, p, 0.8, "time, and the registry");

  return lines;
}
