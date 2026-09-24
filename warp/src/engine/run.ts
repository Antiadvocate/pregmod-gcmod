/**
 * THE RUN — what makes this game different from the last one, what you are after, and how it ends.
 *
 * Three things sit on top of the week:
 *
 *   · TWISTS. Up to two, picked or rolled at the start: a boom, a war that floods the markets, a
 *     fever season, neighbours who want what's yours. Each bends a number the week already has.
 *   · AMBITIONS. Three per run, drawn from a list by seed, shown where you can see them, and
 *     rewarded when you get there.
 *   · THE END. A run is two years long. It can end sooner — bankrupt, empty, signed away, or with
 *     the household turned against you — and when it ends you get the whole run read back to you,
 *     with a title it earned. You can keep playing past it.
 */
import type { Person, ReportLine, SaveState } from "./types";
import { rng } from "./rng";
import { clamp } from "./psyche";
import { read } from "./obedience";
import { unrest } from "./security";
import { romanceOf } from "./romance";
import { arcDef } from "./story";
import { householdRead } from "./player";

/* ── twists ─────────────────────────────────────────────────────────────────────────────────── */

export interface Twist {
  id: string;
  name: string;
  what: string;
  /** Applied once, at the start. */
  setup?: (s: SaveState) => void;
  /** Applied every week. */
  tick?: (s: SaveState) => ReportLine | null;
}

export const TWISTS: Twist[] = [
  { id: "boom", name: "Boom Town", what: "Money is pouring into the region. Prosperity climbs on its own, and the markets charge for it.",
    setup: (s) => { s.arcology.prosperity += 15; },
    tick: (s) => { if (s.arcology.prosperity < 170) s.arcology.prosperity = clamp(s.arcology.prosperity + 0.5, 0, 200); return null; } },
  { id: "flood", name: "Buyer's Market", what: "A war up north has flooded the region with captives. Slaves are cheap." },
  { id: "old_money", name: "Old Money", what: "The Association is watching you closely. You start known, with less cash to show for it.",
    setup: (s) => { s.arcology.rep += 1200; s.arcology.public_standing = clamp(s.arcology.public_standing + 2, -10, 10); s.arcology.cash = Math.round(s.arcology.cash * 0.8); } },
  { id: "neighbours", name: "Bad Neighbours", what: "Every neighboring arcology wants what's yours. They start out hostile.",
    setup: (s) => { for (const n of s.arcology.neighbours) n.attitude = clamp(n.attitude - 35, -100, 100); s.arcology.security = clamp(s.arcology.security + 10, 0, 100); } },
  { id: "fever", name: "Fever Season", what: "Something is going round the lower levels. Every few weeks, somebody in your house comes down with it.",
    tick: (s) => {
      if (s.arcology.week % 6 !== 0) return null;
      const house = Object.values(s.people).filter((p) => p.status === "owned");
      if (!house.length) return null;
      const p = rng(`fever:${s.id}:${s.arcology.week}`).pick(house);
      p.health.illness = Math.max(p.health.illness, 2) as 2;
      return { text: `${p.name} has the fever that's going round.`, tone: "bad", weight: 7, person: p.id };
    } },
  { id: "lean", name: "Lean Year", what: "Power and imported food cost more this year. The building eats money before you've done anything.",
    tick: (s) => { const n = Math.round(800 + s.arcology.population * 0.4); s.arcology.cash -= n; return { text: `Lean-year surcharges on power and food: ¤${n.toLocaleString()}.`, tone: "bad", weight: 3 }; } },
];

export const TWIST_BY_ID: Record<string, Twist> = Object.fromEntries(TWISTS.map((t) => [t.id, t]));

/** What the markets charge relative to normal, after the twists. */
export function priceFactor(s: SaveState): number {
  const t = s.run?.twists ?? [];
  const econ = s.world ? s.world.economy.index / 100 : 1;
  return (t.includes("boom") ? 1.15 : 1) * (t.includes("flood") ? 0.65 : 1) * econ;
}

/* ── ambitions ──────────────────────────────────────────────────────────────────────────────── */

export interface Ambition {
  id: string;
  title: string;
  /** How far along you are, for the screen. */
  progress: (s: SaveState) => string;
  met: (s: SaveState) => boolean;
}

const owned = (s: SaveState): Person[] => Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);
const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;

export const AMBITIONS: Ambition[] = [
  { id: "rich", title: "Have half a million on hand", progress: (s) => `${money(s.arcology.cash)} of ¤500,000`, met: (s) => s.arcology.cash >= 500000 },
  { id: "house", title: "Keep a household of twelve", progress: (s) => `${owned(s).length} of 12`, met: (s) => owned(s).length >= 12 },
  { id: "wed", title: "Marry one of them", progress: (s) => { const best = owned(s).map((p) => romanceOf(p).standing).sort().at(-1); return best ? `furthest: ${best}` : "nobody yet"; },
    met: (s) => Object.values(s.people).some((p) => ["wife", "keeper"].includes(p.romance?.standing ?? "")) },
  { id: "name", title: "Make your name worth 8,000", progress: (s) => `${Math.round(s.arcology.rep).toLocaleString()} of 8,000`, met: (s) => s.arcology.rep >= 8000 },
  { id: "landlord", title: "Own sixty percent of the building", progress: (s) => `${Math.round(s.arcology.ownership)}% of 60%`, met: (s) => s.arcology.ownership >= 60 },
  { id: "empire", title: "Take a neighbouring arcology", progress: (s) => `${3 - s.arcology.neighbours.length} of 1`, met: (s) => s.arcology.neighbours.length < 3 },
  { id: "doctrine", title: "Make one doctrine the law of the building", progress: (s) => `${Math.round(Math.max(0, ...Object.values(s.arcology.doctrines).map((d) => d.adoption)))}% adopted, of 90%`,
    met: (s) => Object.values(s.arcology.doctrines).some((d) => d.adoption >= 90) },
  { id: "beloved", title: "A house where every one of them is devoted (at least five)", progress: (s) => { const h = owned(s); return `${h.filter((p) => read(p).devotion >= 50).length} of ${Math.max(5, h.length)}`; },
    met: (s) => { const h = owned(s); return h.length >= 5 && h.every((p) => read(p).devotion >= 50); } },
  { id: "feared", title: "A house where every one of them is afraid of you (at least five)", progress: (s) => { const h = owned(s); return `${h.filter((p) => p.bond.fear >= 50).length} of ${Math.max(5, h.length)}`; },
    met: (s) => { const h = owned(s); return h.length >= 5 && h.every((p) => p.bond.fear >= 50); } },
  { id: "stories", title: "See six stories through to the end", progress: (s) => `${Object.values(s.story?.arcs ?? {}).filter((a) => a.done).length} of 6`,
    met: (s) => Object.values(s.story?.arcs ?? {}).filter((a) => a.done).length >= 6 },
  { id: "builder", title: "Build five facilities", progress: (s) => `${Object.values(s.arcology.facilities).filter((f) => f.level > 0).length - 2} of 5`,
    met: (s) => Object.values(s.arcology.facilities).filter((f) => f.level > 0).length - 2 >= 5 },
  { id: "lineage", title: "Have three children born under your roof", progress: (s) => `${Object.values(s.people).filter((p) => p.origin.acquired_how === "born to it" && p.origin.acquired_week > 1).length} of 3`,
    met: (s) => Object.values(s.people).filter((p) => p.origin.acquired_how === "born to it" && p.origin.acquired_week > 1).length >= 3 },
];

export const AMBITION_BY_ID: Record<string, Ambition> = Object.fromEntries(AMBITIONS.map((a) => [a.id, a]));

/* ── state ──────────────────────────────────────────────────────────────────────────────────── */

export interface RunState {
  twists: string[];
  ambitions: { id: string; met?: number }[];
  /** Weeks the run is meant to last. You can keep playing past it. */
  length: number;
  /** Consecutive weeks under each failure line. */
  strain: { broke: number; empty: number; revolt: number };
  ended?: Ending;
  /** You read the ending and chose to keep going. */
  continued?: boolean;
}

export interface Ending {
  week: number;
  kind: "done" | "lost";
  title: string;
  lines: string[];
}

export function newRun(s: SaveState, seed: string, twists: string[] = []): RunState {
  const r = rng(`ambitions:${seed}`);
  // One of the three is always about the house itself, so the run is never only about money.
  const people = ["house", "wed", "beloved", "feared", "lineage"];
  const other = AMBITIONS.map((a) => a.id).filter((id) => !people.includes(id));
  const picks = [r.pick(people), ...r.shuffle([...other]).slice(0, 2)];
  const run: RunState = {
    twists: twists.filter((t) => TWIST_BY_ID[t]).slice(0, 2),
    ambitions: picks.map((id) => ({ id })),
    length: 104,
    strain: { broke: 0, empty: 0, revolt: 0 },
  };
  s.run = run;
  for (const t of run.twists) TWIST_BY_ID[t].setup?.(s);
  return run;
}

export function runOf(s: SaveState): RunState {
  if (!s.run) newRun(s, s.id, []);
  return s.run!;
}

/** Weekly: twists, ambitions, and whether it is over. */
export function tickRun(s: SaveState): ReportLine[] {
  const run = runOf(s);
  const lines: ReportLine[] = [];
  for (const t of run.twists) { const l = TWIST_BY_ID[t]?.tick?.(s); if (l) lines.push(l); }

  for (const a of run.ambitions) {
    const def = AMBITION_BY_ID[a.id];
    if (!def || a.met) continue;
    if (def.met(s)) {
      a.met = s.arcology.week;
      s.arcology.rep += 600;
      lines.push({ text: `You did it: ${def.title.toLowerCase()}.`, tone: "good", weight: 12 });
    }
  }

  if (run.ended && run.continued) return lines;
  const week = s.arcology.week;
  run.strain.broke = s.arcology.cash < -50000 ? run.strain.broke + 1 : 0;
  run.strain.empty = week > 10 && owned(s).length === 0 ? run.strain.empty + 1 : 0;
  run.strain.revolt = owned(s).length >= 3 && unrest(s) > 85 ? run.strain.revolt + 1 : 0;

  if (!run.ended) {
    const lost = run.strain.broke >= 6 ? "broke" : run.strain.empty >= 8 ? "empty" : run.strain.revolt >= 4 ? "revolt" : s.arcology.ownership <= 2 ? "signed" : null;
    if (lost) run.ended = epilogue(s, lost);
    else if (week >= run.length) run.ended = epilogue(s, null);
    if (run.ended) lines.push({ text: run.ended.title, tone: run.ended.kind === "lost" ? "bad" : "good", weight: 20 });
  }
  return lines;
}

/* ── the ending ─────────────────────────────────────────────────────────────────────────────── */

/** What became of one of them, in a line built from what actually happened to her. */
function fate(s: SaveState, p: Person): string {
  const r = read(p, s.memory[p.id]);
  const rom = romanceOf(p);
  const pick = rng(`fate:${p.id}`);
  const weeks = p.economics.weeks_owned;
  const time = weeks >= 90 ? "the whole two years" : weeks >= 52 ? "more than a year" : weeks >= 20 ? `${Math.round(weeks / 4.3)} months` : weeks === 1 ? "a week" : `${weeks} weeks`;
  const known = p.persona.fetishes.filter((f) => f.known && f.name !== "none").map((f) => f.name);
  const where = p.facility ? s.arcology.facilities[p.facility]?.name : undefined;
  const skills: [string, number][] = [["mouth", p.skills.oral], ["cunt", p.skills.vaginal], ["ass", p.skills.anal], ["hands with a customer", p.skills.whoring], ["voice and her dancing", p.skills.entertainment], ["fists", p.skills.combat]];
  const best = skills.sort((a, b) => b[1] - a[1])[0];
  const facts: string[] = [];
  if (where) facts.push(`She spent most of it in the ${where.toLowerCase()}.`);
  if (best[1] >= 60) facts.push(`Nobody in the house is better with her ${best[0]}.`);
  if (p.womb.births > 0) facts.push(`She's had ${p.womb.births === 1 ? "a child" : `${p.womb.births} children`}.`);
  if (p.womb.fetuses.length) facts.push("She's carrying now.");
  if (known.length) facts.push(`You found out she's ${known.join(" and ")}.`);
  if (p.persona.paraphilia) facts.push(`She has a paraphilia; she needs it now.`);
  if (p.fame.why) facts.push(`People know her as the one who ${p.fame.why.replace(/^(the one who )/, "")}.`);
  const fact = facts.length ? ` ${pick.pick(facts)}` : "";

  if (rom.standing === "keeper") return `${p.name} owns you now, and runs the arcology.${fact}`;
  if (rom.standing === "wife") return `${p.name} is your wife. ${r.devotion > 60 ? "She loves you." : "Nobody is sure whether she really loves you, including her."}${fact}`;
  if (p.psyche.state === "broken") return `${p.name} is still here, mindbroken, doing whatever she's told.`;
  if (r.devotion > 70) return `${p.name}, ${time} in, would follow you anywhere.${fact}`;
  if (r.devotion > 35) return `${p.name} has made her peace with the place, ${time} in.${fact}`;
  if (p.bond.fear > 55) return `${p.name} only stays because she's afraid of you. If she weren't, she'd be gone by morning.${fact}`;
  if (p.bond.resentment > 50) return `${p.name} is still here after ${time}, and she still hates you.${fact}`;
  return `${pick.pick([`${p.name} does her work and keeps to herself.`, `${p.name} has been here ${time} and is still distant with you.`, `${p.name} gets by, and not much more.`])}${fact}`;
}

function titleFor(s: SaveState, lost: string | null): string {
  const name = s.arcology.name;
  if (lost === "broke") return `${name} went to the receivers`;
  if (lost === "empty") return `An empty house in ${name}`;
  if (lost === "revolt") return `The slaves of ${name} revolted`;
  if (lost === "signed") return `${name} belongs to someone else now`;
  const run = runOf(s);
  const met = run.ambitions.filter((a) => a.met).length;
  if (Object.values(s.people).some((p) => p.romance?.standing === "keeper")) return `${name} is hers`;
  const house = owned(s);
  const fear = house.length ? house.reduce((n, p) => n + p.bond.fear, 0) / house.length : 0;
  const dev = house.length ? house.reduce((n, p) => n + read(p).devotion, 0) / house.length : 0;
  if (met === run.ambitions.length) return `${name}, and everything in it`;
  if (Object.values(s.people).some((p) => p.romance?.standing === "wife")) return `Married in ${name}`;
  if (fear > 55) return `The iron house of ${name}`;
  if (dev > 55) return `The kind house of ${name}`;
  if (s.arcology.cash > 300000) return `${name}'s merchant prince`;
  return s.arcology.week >= 100 ? `Two years in ${name}` : `${s.arcology.week} weeks in ${name}`;
}

export function epilogue(s: SaveState, lost: string | null): Ending {
  const st = s.story;
  const run = runOf(s);
  const lines: string[] = [];
  const opening: Record<string, string> = {
    broke: `Your debts caught up with you. The receivers came up in the elevator with a court order and a locksmith, and changed the codes on you.`,
    empty: `By the end you had no slaves left. The dormitories were empty, and you slept in the penthouse alone.`,
    revolt: `Your slaves revolted. It started in the laundry and reached your floor by midnight. They didn't need guns; they had the door codes, and there were more of them than you.`,
    signed: `You signed away the last of your ownership. You still live in the penthouse, but someone else owns it.`,
  };
  if (lost) lines.push(opening[lost]);
  else lines.push(`${s.arcology.week >= 100 ? "Two years" : `${s.arcology.week} weeks`}. ${s.arcology.name} has ${Math.round(s.arcology.population).toLocaleString()} people living in it, ${money(s.arcology.cash)} in the accounts, and your name on ${Math.round(s.arcology.ownership)}% of it.`);

  if (st) {
    const origin = st.arcs[st.origin];
    if (origin?.done && origin.ending) lines.push(`${arcDef(origin.id)?.title}: ${origin.ending}.`);
    for (const a of Object.values(st.arcs)) {
      if (a.id === st.origin || !a.done || !a.ending) continue;
      lines.push(`${arcDef(a.id)?.title}: ${a.ending}.`);
    }
  }

  const house = owned(s).sort((a, b) => b.economics.weeks_owned - a.economics.weeks_owned).slice(0, 6);
  for (const p of house) lines.push(fate(s, p));
  const gone = Object.values(s.people).filter((p) => ["sold", "free", "dead"].includes(p.status));
  if (gone.length) {
    const sold = gone.filter((p) => p.status === "sold").length, freed = gone.filter((p) => p.status === "free").length, dead = gone.filter((p) => p.status === "dead").length;
    lines.push(`Gone: ${[sold ? `${sold} sold` : "", freed ? `${freed} freed or fled` : "", dead ? `${dead} dead` : ""].filter(Boolean).join(", ")}.`);
  }

  for (const a of run.ambitions) {
    const def = AMBITION_BY_ID[a.id];
    if (def) lines.push(a.met ? `You set out to ${def.title.charAt(0).toLowerCase()}${def.title.slice(1)}, and did it in week ${a.met}.` : `You meant to ${def.title.charAt(0).toLowerCase()}${def.title.slice(1)}. You got to ${def.progress(s)}.`);
  }

  if (owned(s).length) lines.push(`Your slaves would describe you as ${householdRead(s).label}.`);
  return { week: s.arcology.week, kind: lost ? "lost" : "done", title: titleFor(s, lost), lines };
}
