/**
 * THREADS — the machinery.
 *
 * data/threads.ts holds the stories. This finds them.
 *
 * ── THE ARGUMENT ────────────────────────────────────────────────────────────────────────────
 *
 * Every event in this game is a weighted die roll. That produces incidents, and incidents do not
 * accumulate: the arcade event fires, you pick an option, and the game forgets. Nothing was ever
 * ABOUT the last six weeks.
 *
 * A thread is detected, not rolled. Each detector is a predicate over signals the kernel has been
 * producing since the beginning and nothing was reading — two women whose resentment slopes are
 * both positive and who share a room, a body whose `capacity` has drifted from `capacity_born`, a
 * rumour held by two thirds of the household for a month, somebody whose relaxation has been flat
 * for six weeks with no discharge.
 *
 * THE THREE RULES THAT KEEP IT EMERGENT:
 *
 *   1. NOTHING IS ROLLED. If the configuration is there the thread opens; if it is not, it does
 *      not. Two identical saves produce identical threads. The variety comes from the sim, which
 *      is where variety in a simulation is supposed to come from.
 *
 *   2. A THREAD THAT STOPS BEING TRUE LAPSES. Heat falls when the conditions fail, and at zero it
 *      is gone — usually without ever having said anything. Fix the thing and the story goes away.
 *      This is the difference between a simulation noticing something and a quest log.
 *
 *   3. BEATS ARE GATED ON HEAT, NOT ON WEEKS. A situation that intensifies fast arrives fast. One
 *      that smoulders takes months to say anything, and may never get past its first line.
 *
 * ── WHAT A THREAD DOES TO THE GAME ──────────────────────────────────────────────────────────
 *
 * It writes report lines; it puts a decision on the Penthouse when a beat has options; it feeds
 * the narrator a compiled situation so a scene played during a thread is a scene INSIDE it; and
 * when it ends it writes to canon, which is the only permanent record the game keeps.
 */
import type { Person, ReportLine, SaveState } from "./types";
import { THREAD_BY_KIND, THREADS, type BeatCtx, type ThreadDef } from "../data/threads";
import { signalsFor, recordTrace, traceOf, traceWeeks, was, type Signals } from "./trace";
import { clamp, shove, addState, aperture, perception } from "./psyche";
import { applyTreatment, read } from "./obedience";
import { remember } from "./memory";
import { getEdge, startRumor, roomOf } from "./social";
import { romanceOf } from "./romance";

export interface Thread {
  id: string;
  kind: string;
  /** role → person id. */
  cast: Record<string, string>;
  heat: number;
  /** Index of the next beat to fire. */
  stage: number;
  opened: number;
  /** Specifics gathered as it ran, so beats can name real things. */
  facts: string[];
  /** Consecutive weeks the conditions have failed. One bad week is not the end of a situation,
   *  so cooling only starts after this passes the tolerance below. */
  misses?: number;
  /** Set while a beat with options is waiting on the player. */
  pending?: number;
  ended?: { week: number; how: string };
}

export function threadsOf(s: SaveState): Thread[] {
  return (s.threads ??= []);
}

export function liveThreads(s: SaveState): Thread[] {
  return threadsOf(s).filter((t) => !t.ended);
}

/* ── the detectors ─────────────────────────────────────────────────────────────────────────── */

/** A detector returns the cast for a thread it can see, or null. Never rolls. */
interface Detector {
  kind: string;
  /** Minimum weeks of trace on the people involved. Stops a woman bought on Tuesday having a
   *  five-week trend. */
  needs: number;
  /**
   * `only` restricts the candidate pool to a specific cast.
   *
   * This exists because of a bug that made the whole system stutter. `stillTrue` re-ran the
   * detector and compared the cast it got back — but a detector returns its FIRST match, so as
   * soon as any other woman in the household also qualified, the running thread's cast stopped
   * being the one returned and the thread looked false. It cooled, lapsed, and reopened on
   * whoever sorted first, over and over. Passing the cast back in asks the right question: is
   * this still true of THESE people.
   */
  find: (s: SaveState, sig: Map<string, Signals>, people: Person[], only?: Set<string>) => { cast: Record<string, string>; fact?: string } | null;
}

const held = (p: Person) => p.status === "owned" || p.status === "indentured";

/** Pairs who are actually near each other. Two women who never share a room are not talking. */
function together(s: SaveState, a: Person, b: Person): boolean {
  if (a.facility && a.facility === b.facility) return true;
  return roomOf(a) === roomOf(b);
}

const DETECTORS: Detector[] = [
  {
    // THE TALKERS. Both resentments climbing, both already high, and they share a room. The
    // conjunction is the whole point: either one alone is a bad week, both together is a position.
    kind: "talkers", needs: 4,
    find: (s, sig, all, only) => {
      const people = only ? all.filter((p) => only.has(p.id)) : all;
      // Level OR slope, not slope alone. The first version wanted resentment to be climbing, and
      // a household run badly reaches a plateau at about eighty and stays there — which is more
      // of a situation than a rising trend, not less. Sitting at the top counts.
      const hot = people.filter((p) => {
        const g = sig.get(p.id)!;
        return g.dev < 20 && (g.res > 62 || (g.res > 42 && g.d_res > 0.8));
      });
      for (const a of hot) {
        for (const b of hot) {
          if (a.id >= b.id || !together(s, a, b)) continue;
          const e = getEdge(s.edges, a.id, b.id);
          if (!e || e.warmth < 22) continue;
          return { cast: { a: a.id, b: b.id }, fact: `${a.name} and ${b.name} have both been getting angrier since week ${s.arcology.week - 5}.` };
        }
      }
      return null;
    },
  },
  {
    // THE FAVOURITE PROBLEM. One rising, one whose hope is falling, and bad blood between them.
    kind: "favourite", needs: 4,
    find: (s, sig, all, only) => {
      const people = only ? all.filter((p) => only.has(p.id)) : all;
      const risen = people.filter((p) => (romanceOf(p).dominion > -40 || sig.get(p.id)!.dev > 55) && sig.get(p.id)!.d_dev >= 0);
      // Same correction as the talkers: hope that has already hit the floor has nowhere left to
      // fall, and a woman at hope 2 is further into this than one still on the way down.
      const passed = people.filter((p) => {
        const g = sig.get(p.id)!;
        return p.economics.weeks_owned > 8 && (g.hope < 18 || (g.hope < 55 && g.d_hope < -0.6));
      });
      for (const r of risen) {
        for (const q of passed) {
          if (r.id === q.id) continue;
          // "She was here first" was a strict inequality on weeks owned, which is false for every
          // woman in a starting household — they all arrived on the same Monday, so this never
          // fired at all. What matters is that the passed-over one is not the newcomer.
          if (q.economics.weeks_owned + 2 < r.economics.weeks_owned) continue;
          const e = getEdge(s.edges, q.id, r.id);
          if (e && e.warmth > 20) continue;                                   // she likes her; not this
          return { cast: { risen: r.id, passed: q.id }, fact: `${q.name} has been here ${q.economics.weeks_owned - r.economics.weeks_owned} weeks longer than ${r.name}.` };
        }
      }
      return null;
    },
  },
  {
    // SOMETHING YOU DID NOT ARRANGE. Mutual warmth and attraction, both directions, neither of
    // them the player. The one thread in the game that is good news and still a decision.
    kind: "pair", needs: 3,
    find: (s, _sig, all, only) => {
      const people = only ? all.filter((p) => only.has(p.id)) : all;
      for (const a of people) {
        for (const b of people) {
          if (a.id >= b.id) continue;
          const ab = getEdge(s.edges, a.id, b.id), ba = getEdge(s.edges, b.id, a.id);
          if (!ab || !ba) continue;
          if (ab.warmth < 48 || ba.warmth < 48) continue;
          if (ab.attraction < 30 && ba.attraction < 30) continue;
          if (ab.weeks_known < 6) continue;
          return { cast: { a: a.id, b: b.id }, fact: `${a.name} and ${b.name} have been in each other's company for ${ab.weeks_known} weeks.` };
        }
      }
      return null;
    },
  },
  {
    // IT STOPPED BEING GOSSIP. A negative rumour held by most of the household for weeks. The
    // rumour system was a nice cellular automaton that never did anything; this is what it is for.
    kind: "belief", needs: 0,
    find: (s, _sig, people) => {
      if (people.length < 3) return null;
      for (const r of s.rumors) {
        if (r.charge >= 0) continue;
        if (s.arcology.week - r.week < 3) continue;
        if (r.knowers.length < 3 || r.knowers.length / people.length < 0.55) continue;
        return { cast: {}, fact: `They are saying that ${r.content}.` };
      }
      return null;
    },
  },
  {
    // THE HOUSE HAS SPLIT. Two clusters by warmth, each internally warm and mutually cold. Read
    // off the edges rather than assigned, so who ends up on which side is the sim's doing.
    kind: "fracture", needs: 3,
    find: (s, _sig, all, only) => {
      const people = only ? all.filter((p) => only.has(p.id)) : all;
      if (only && people.length < 2) return null;
      if (all.length < 5) return null;
      // Seed on the coldest mutual pair, then see whether the household has taken sides.
      // A split is RELATIVE. Mutual hatred at −35 essentially never forms — people who share a
      // room warm to each other even when everything else is going wrong — so the test is whether
      // two people are markedly colder to each other than the household's own baseline.
      const all_edges = s.edges.filter((e) => people.some((p) => p.id === e.from) && people.some((p) => p.id === e.to));
      if (all_edges.length < 6) return null;
      const median = all_edges.map((e) => e.warmth).sort((x, y) => x - y)[Math.floor(all_edges.length / 2)];
      let worst: { a: Person; b: Person; w: number } | null = null;
      for (const a of people) for (const b of people) {
        if (a.id >= b.id) continue;
        const e = getEdge(s.edges, a.id, b.id);
        if (e && (!worst || e.warmth < worst.w)) worst = { a, b, w: e.warmth };
      }
      if (!worst || worst.w > median - 30) return null;
      const side = (anchor: Person) => all.filter((p) => p.id !== anchor.id && (getEdge(s.edges, p.id, anchor.id)?.warmth ?? 0) > median + 8);
      const one = side(worst.a), other = side(worst.b);
      if (one.length < 2 || other.length < 2) return null;
      if (one.some((p) => other.includes(p))) return null;   // not actually two camps
      return {
        cast: { one: worst.a.id, other: worst.b.id },
        fact: `${one.length + 1} on one side, ${other.length + 1} on the other.`,
      };
    },
  },
  {
    // SHE HAS GONE QUIET. The kernel already knows this: braced for a long run, nothing moving in
    // either direction, and no discharge. It was never surfaced because it does not look like a
    // problem — the panel says "obedient" and the work gets done.
    kind: "gone_quiet", needs: 6,
    find: (_s, sig, all, only) => {
      const people = only ? all.filter((p) => only.has(p.id)) : all;
      for (const p of people) {
        const g = sig.get(p.id)!;
        if (!g.flatline) continue;
        if (g.rel > -2) continue;
        if (p.psyche.braced_run < 8) continue;
        if (p.psyche.discharge_lift > 0.2) continue;
        if (p.psyche.state === "broken") continue;   // past this; a different problem
        return { cast: { her: p.id }, fact: `${p.name} has been tense and withdrawn for six weeks straight.` };
      }
      return null;
    },
  },
  {
    // SHE IS NOT WHO ARRIVED. Somatic remodelling — the one number in the game that does not come
    // back. Fires in either direction: a woman who has been made calmer is as changed as one who
    // has been made watchful, and the game should say so either way.
    kind: "remodelled", needs: 8,
    find: (_s, sig, all, only) => {
      const people = only ? all.filter((p) => only.has(p.id)) : all;
      for (const p of people) {
        const g = sig.get(p.id)!;
        if (Math.abs(g.remodel) < 1.5) continue;
        if (p.economics.weeks_owned < 14) continue;
        return {
          cast: { her: p.id },
          fact: g.remodel < 0
            ? `${p.name} is far more nervous than when she arrived.`
            : `${p.name} is far calmer than when she arrived.`,
        };
      }
      return null;
    },
  },
  {
    // SHE IS BUILDING A MODEL OF YOU. Perception is already computed by the kernel and used for
    // nothing but a note. High accuracy, high fear, low bond: she is good at you because she has to
    // be, and that is a resource sitting in the building that nobody has thought about.
    kind: "watcher", needs: 5,
    find: (s, sig, all, only) => {
      const people = only ? all.filter((p) => only.has(p.id)) : all;
      for (const p of people) {
        const g = sig.get(p.id)!;
        // The kernel is explicit that fear makes people read a room WORSE — accuracy is
        // (relaxation + 10) / 20, so a frightened woman is at 0.2 and certain. The first version
        // of this thread wanted an accurate frightened watcher, which the model cannot produce and
        // should not: the interesting case is the one it does produce, which is somebody
        // hypervigilant and wrong.
        const acc = perception(p.psyche, p.persona.conscience).accuracy;
        if (acc > 0.35) continue;
        if (p.bond.bond > 30) continue;
        if (g.frag < 0.35 && (was(traceOf(s, p.id), "fear", 5) ?? 0) < 20) continue;
        if (p.economics.weeks_owned < 10) continue;
        const mem = s.memory[p.id];
        const aboutYou = mem?.episodic.filter((e) => e.core).length ?? 0;
        if (aboutYou < 2) continue;
        return { cast: { her: p.id }, fact: `${p.name} believes ${aboutYou} things about you that aren't true.` };
      }
      return null;
    },
  },
  {
    kind: "debt", needs: 5,
    find: (_s, sig, all, only) => {
      const people = only ? all.filter((p) => only.has(p.id)) : all;
      for (const p of people) {
        const g = sig.get(p.id)!;
        if (p.bond.bond < 42) continue;
        if (p.bond.bond - g.dev < 20) continue;
        if (p.bond.weeks_since_kindness > 4) continue;
        if (p.economics.weeks_owned < 10) continue;
        return { cast: { her: p.id }, fact: `${p.name} is attached to you (${Math.round(p.bond.bond)}), but only devoted at ${Math.round(g.dev)}.` };
      }
      return null;
    },
  },
];

/** Whether a thread's conditions still hold. Re-runs the detector and asks whether it still finds
 *  the same cast — which is what makes a thread lapse when you fix the thing. */
function stillTrue(s: SaveState, t: Thread, sig: Map<string, Signals>, people: Person[]): boolean {
  const det = DETECTORS.find((d) => d.kind === t.kind);
  if (!det) return false;
  for (const id of Object.values(t.cast)) {
    const p = s.people[id];
    if (!p || !held(p)) return false;
  }
  // Ask about THESE people, not about the household. See the note on `find`.
  const only = Object.keys(t.cast).length ? new Set(Object.values(t.cast)) : undefined;
  const found = det.find(s, sig, people, only);
  if (!found) return false;
  return Object.keys(t.cast).length === 0 || Object.entries(t.cast).every(([role, id]) => found.cast[role] === id);
}

/* ── the week ──────────────────────────────────────────────────────────────────────────────── */

export interface ThreadWeek { lines: ReportLine[]; opened: Thread[]; asked: Thread[] }

const MAX_LIVE = 4;

/**
 * One pass. Records traces, cools or heats every live thread, fires whatever beats are due, and
 * opens at most one new thread — because a household that grows three situations in a week reads
 * as noise rather than as a place where things are happening.
 */
export function tickThreads(s: SaveState): ThreadWeek {
  const people = Object.values(s.people).filter(held).filter((p) => p.age >= 18);
  const lines: ReportLine[] = [];
  const opened: Thread[] = [];
  const asked: Thread[] = [];

  for (const p of people) recordTrace(s, p);
  const sig = new Map(people.map((p) => [p.id, signalsFor(s, p)]));
  const live = liveThreads(s);

  // 1. HEAT. Everything that is still true gets hotter; everything else cools out.
  for (const t of live) {
    const def = THREAD_BY_KIND[t.kind];
    if (!def) { t.ended = { week: s.arcology.week, how: "lapsed" }; continue; }
    if (stillTrue(s, t, sig, people)) {
      t.misses = 0;
      t.heat = clamp(t.heat + def.build, 0, 100);
    } else {
      // HYSTERESIS. A detector is a snapshot and snapshots flicker — a woman one good afternoon
      // above her threshold is not a resolved situation. Without this the same thread opened,
      // lapsed and reopened on the same person five times in ninety weeks, which reads as the
      // game having a stutter rather than as anything happening.
      t.misses = (t.misses ?? 0) + 1;
      if (t.misses < 4) continue;
      // Cooling is PROPORTIONAL. A flat subtraction killed every slow-burn thread the week after
      // it opened: a thread at heat 20 losing a flat 20 is gone before it has said anything, so
      // the log filled with situations that opened and vanished without ever reaching their first
      // line. Exponential decay lets a barely-open thread linger while a hot one still cools fast
      // in absolute terms.
      t.heat = clamp(t.heat - Math.max(2, t.heat * def.cool / 100), 0, 100);
      if (t.heat <= 0) {
        t.ended = { week: s.arcology.week, how: "lapsed" };
        // Deliberately silent. A situation you resolved without knowing it was there should not
        // be announced — being told "the thing you never heard about is over" is worse than not
        // being told at all, and it turns the system into a quest log.
        continue;
      }
    }
  }

  // 2. BEATS. A thread waiting on the player does not advance; it sits until answered.
  for (const t of liveThreads(s)) {
    if (t.pending !== undefined) continue;
    const def = THREAD_BY_KIND[t.kind]!;
    const beat = def.beats[t.stage];
    if (!beat || t.heat < beat.at) continue;
    const c = ctx(s, t);
    lines.push({ tone: toneFor(t.kind), weight: 9 + Math.round(t.heat / 25), text: beat.line(c) });
    if (beat.options?.length) { t.pending = t.stage; asked.push(t); }
    t.stage++;
    // Ran out of beats without being resolved: it settles, and the fallout is permanent.
    if (t.stage >= def.beats.length && t.pending === undefined) {
      settle(s, t, def);
    }
  }

  // 3. OPEN ONE, at most.
  if (liveThreads(s).length < MAX_LIVE) {
    const past = threadsOf(s).filter((t) => t.ended);
    for (const det of DETECTORS) {
      if (live.some((t) => t.kind === det.kind)) continue;
      // Everybody the detector might cast has to have enough history for a trend to mean anything.
      if (det.needs && people.every((p) => traceWeeks(traceOf(s, p.id)) < det.needs)) continue;
      const found = det.find(s, sig, people);
      if (!found) continue;
      if (Object.values(found.cast).some((id) => traceWeeks(traceOf(s, id)) < det.needs)) continue;

      // ONCE PER CAST, mostly. A situation that was answered does not come back on the same
      // people — you dealt with it, and re-raising it makes the answer worthless. Two exceptions,
      // both deliberate: a thread that LAPSED without ever being put to the player may return
      // after a season, because the conditions genuinely recurred; and a permanent condition like
      // a moved resting point is only ever worth telling somebody about once.
      const key = Object.values(found.cast).sort().join("+");
      const before = past.filter((t) => t.kind === det.kind && Object.values(t.cast).sort().join("+") === key);
      const answered = before.some((t) => t.ended!.how !== "lapsed" && t.ended!.how !== "settled");
      const permanent = det.kind === "remodelled";
      if (answered || (permanent && before.length)) continue;
      if (before.some((t) => s.arcology.week - t.ended!.week < 20)) continue;

      const t: Thread = {
        id: `th-${s.arcology.week}-${det.kind}`,
        kind: det.kind, cast: found.cast, heat: 8, stage: 0,
        opened: s.arcology.week, facts: found.fact ? [found.fact] : [],
      };
      threadsOf(s).push(t);
      opened.push(t);
      break;
    }
  }

  return { lines, opened, asked };
}

function toneFor(kind: string): ReportLine["tone"] {
  if (kind === "pair" || kind === "debt") return "neutral";
  if (kind === "remodelled") return "warning";
  return "bad";
}

function ctx(s: SaveState, t: Thread): BeatCtx {
  const who: Record<string, string> = {};
  for (const [role, id] of Object.entries(t.cast)) who[role] = s.people[id]?.name ?? "she";
  return { s, who, weeks: s.arcology.week - t.opened, heat: t.heat, facts: t.facts };
}

function settle(s: SaveState, t: Thread, def: ThreadDef): void {
  t.ended = { week: s.arcology.week, how: "settled" };
  const fall = def.fallout?.(ctx(s, t));
  if (fall) s.canon.push(fall);
}

/* ── answering a beat ──────────────────────────────────────────────────────────────────────── */

/**
 * What the player chose, and what it costs.
 *
 * Every branch does something to real state — an option that only prints a line is an option that
 * is not in the game. Where an answer resolves the situation it ends the thread; where it only
 * changes its shape, the thread stays open and the detector decides next week whether it was
 * enough. That second case is the one worth having: you can make a thing better without making it
 * go away, and you find out which by watching.
 */
export function answerThread(s: SaveState, threadId: string, optionId: string): { line: string } {
  const t = threadsOf(s).find((x) => x.id === threadId);
  if (!t || t.pending === undefined) return { line: "" };
  const def = THREAD_BY_KIND[t.kind];
  const beat = def?.beats[t.pending];
  if (!def || !beat) return { line: "" };
  const week = s.arcology.week;
  const P = (role: string): Person | undefined => s.people[t.cast[role]];
  let line = "";
  let closes = false;

  const cool = (n: number) => { t.heat = clamp(t.heat - n, 0, 100); };
  const nm = (role: string): string => P(role)?.name ?? "she";

  switch (`${t.kind}:${optionId}`) {
    /* the talkers */
    case "talkers:split": {
      const b = P("b");
      if (b) { b.facility = undefined; applyTreatment(b, { kind: "cruelty", size: 3, why: "moved off the rota away from her friend" }, week); }
      cool(45);
      line = `You put ${nm("a")} and ${nm("b")} on different shifts from Monday, and move ${nm("b")}'s bunk to the other dormitory. They both know exactly why.\n\nThey stop whispering in the kitchen. Whatever they were planning, they can't plan it together any more, and they resent you for it.`;
      break;
    }
    case "talkers:sit": {
      for (const r of ["a", "b"]) {
        const p = P(r);
        if (!p) continue;
        applyTreatment(p, { kind: "recognition", size: 6, why: "the owner asked what was wrong and listened" }, week);
        p.bond.resentment = clamp(p.bond.resentment - 14, 0, 100);
      }
      cool(60); closes = true;
      line = `You pull out a chair and sit down with ${nm("a")} and ${nm("b")}. It takes them a while to believe you actually want to hear it, and then it all comes out: the long shifts, the cold dormitory, the way one of the guards treats the new girls.\n\nSome of it is fair. They go back to work feeling like someone listened.`;
      break;
    }
    case "talkers:buy": {
      const a = P("a"), b = P("b");
      if (a) applyTreatment(a, { kind: "kindness", size: 8, why: "given something, in front of the other one" }, week);
      if (b) { b.bond.resentment = clamp(b.bond.resentment + 12, 0, 100); shove(b.psyche, -0.7, { hard: true }); }
      cool(30);
      line = `You give ${nm("a")} a room of her own with a real bed. ${nm("b")} gets nothing.\n\nIt works: ${nm("a")} is suddenly much less interested in plotting, and ${nm("b")} is jealous of her friend instead of angry at you.`;
      break;
    }
    case "talkers:leave":
      t.heat = clamp(t.heat + 12, 0, 100);
      line = `You take your coffee and go. Behind you, ${nm("a")} and ${nm("b")} start whispering again before the door has closed.`;
      break;

    /* the favourite */
    case "favourite:raise": {
      const q = P("passed");
      if (q) { applyTreatment(q, { kind: "recognition", size: 12, why: "raised as well, and not quietly" }, week); q.bond.hope = clamp(q.bond.hope + 22, 0, 100); }
      s.arcology.cash -= 6000;
      cool(70); closes = true;
      line = `You give ${nm("passed")} a promotion too: a better room, a new title, and ¤6,000 of new clothes. She stops leaving the figures upside down.\n\nShe and ${nm("risen")} are polite to each other now, and the house runs better for it.`;
      break;
    }
    case "favourite:explain": {
      const q = P("passed");
      if (q) {
        const r = read(q, s.memory[q.id]);
        // Whether an explanation lands is not the player's call. A woman who trusts you can hear
        // it; one who does not hears a better-dressed version of the same answer.
        if (r.trust > 20) { applyTreatment(q, { kind: "recognition", size: 7, why: "told the truth about why" }, week); cool(45); closes = true; line = `You tell ${nm("passed")} honestly why you chose ${nm("risen")}. She listens, and after a while she nods. She doesn\'t like it, but she accepts it, and she stops sulking.`; }
        else { q.bond.resentment = clamp(q.bond.resentment + 10, 0, 100); cool(8); line = `You explain why you chose ${nm("risen")}. ${nm("passed")} listens to all of it and says, "Yes, of course." She clearly doesn\'t believe a word, and the resentment goes underground.`; }
      }
      break;
    }
    case "favourite:break": {
      const q = P("passed");
      if (q) { applyTreatment(q, { kind: "cruelty", size: 10, why: "made an example of in front of the household" }, week); shove(q.psyche, -2, { hard: true }); }
      for (const other of Object.values(s.people)) if (held(other) && other.id !== q?.id) other.bond.fear = clamp(other.bond.fear + 6, 0, 100);
      startRumor(s, `the owner punishes slaves for complaining`, { salience: 8 });
      cool(80); closes = true;
      line = `You make an example of ${nm("passed")} in front of the whole household, for insolence. The complaining stops.\n\nEvery slave in the house learns that working hard gets them nothing here, and works accordingly.`;
      break;
    }
    case "favourite:nothing":
      t.heat = clamp(t.heat + 10, 0, 100);
      line = `You turn the figures the right way up and say nothing. ${nm("passed")} goes back downstairs and complains to anyone who\'ll listen.`;
      break;

    /* the pair */
    case "pair:allow": {
      for (const r of ["a", "b"]) {
        const p = P(r);
        if (!p) continue;
        applyTreatment(p, { kind: "recognition", size: 9, why: "allowed to work with her lover" }, week);
        shove(p.psyche, 1.2);
        p.bond.hope = clamp(p.bond.hope + 15, 0, 100);
      }
      cool(70); closes = true;
      line = `You tell ${nm("a")} she can have what she asked for. From Monday, she and ${nm("b")} work the same shift in the laundry.\n\nNeither of them says thank you out loud. But the laundry has never run faster, and they\'re both happier than they\'ve been since they got here.`;
      break;
    }
    case "pair:separate": {
      for (const r of ["a", "b"]) {
        const p = P(r);
        if (!p) continue;
        applyTreatment(p, { kind: "cruelty", size: 9, why: "separated from her lover" }, week);
        p.bond.hope = clamp(p.bond.hope - 20, 0, 100);
        const m = s.memory[p.id];
        if (m) remember(m, { content: "the week the owner separated her from her lover", week, importance: 9, charge: "sharp", core: true });
      }
      cool(90); closes = true;
      line = `You send ${nm("a")} to the far end of the arcology and keep ${nm("b")} in the penthouse. They pass each other on the stairs twice a day and aren\'t allowed to stop.\n\nThey\'re both miserable, and everyone in the household knows why.`;
      break;
    }
    case "pair:use": {
      for (const r of ["a", "b"]) {
        const p = P(r);
        if (!p) continue;
        p.bond.fear = clamp(p.bond.fear + 14, 0, 100);
        p.bond.hope = clamp(p.bond.hope - 8, 0, 100);
        addState(p.psyche, "afraid the owner will separate them", week);
      }
      cool(40);
      line = `You tell ${nm("a")} and ${nm("b")} they can be together as long as they both earn it. They work harder than anyone in the house after that.\n\nThey also know, every day, that you can take it away.`;
      break;
    }
    case "pair:ignore": cool(15); line = `You change the subject. ${nm("a")} takes that as a yes, and so does ${nm("b")}.`; break;

    /* the belief */
    case "belief:deny":
      s.arcology.rep = Math.max(0, s.arcology.rep - 200);
      t.heat = clamp(t.heat + 14, 0, 100);
      line = `You call the whole household together and tell them the rumor isn\'t true. They all nod.\n\nBy Friday, two more people have heard it, because of the meeting.`;
      break;
    case "belief:prove":
      s.arcology.cash -= 14000;
      for (const p of Object.values(s.people)) if (held(p)) applyTreatment(p, { kind: "kindness", size: 4, why: "saw the owner acting against the rumor" }, week);
      cool(48);
      line = `You spend a month and fourteen thousand doing the opposite of the rumor, very publicly, where your slaves can see it.\n\nIt works. The new girls stop repeating it, and the old ones start doubting it.`;
      break;
    case "belief:own": {
      for (const p of Object.values(s.people)) if (held(p)) { p.bond.fear = clamp(p.bond.fear + 10, 0, 100); p.bond.hope = clamp(p.bond.hope - 10, 0, 100); }
      s.canon.push(`The owner confirmed the rumor was true.`);
      cool(100); closes = true;
      line = `You tell them it\'s true, and that they should remember it.\n\nIt stops being a rumor. Now it\'s just how things are in this house, and everyone behaves accordingly.`;
      break;
    }
    case "belief:hunt": {
      const pick = Object.values(s.people).filter(held).sort((a, b) => b.bond.resentment - a.bond.resentment)[0];
      if (pick) { applyTreatment(pick, { kind: "cruelty", size: 8, why: "blamed for the rumor without evidence" }, week); }
      for (const p of Object.values(s.people)) if (held(p)) p.bond.fear = clamp(p.bond.fear + 5, 0, 100);
      cool(35);
      line = pick ? `You went looking and blamed ${pick.name}, who may or may not have started it. Everyone saw you punish her.` : "You went looking and found nothing.";
      break;
    }

    /* the fracture */
    case "fracture:pick": {
      const one = P("one"), other = P("other");
      if (one) applyTreatment(one, { kind: "recognition", size: 8, why: "backed openly" }, week);
      if (other) { applyTreatment(other, { kind: "cruelty", size: 8, why: "lost the owner's support in front of everyone" }, week); }
      cool(65); closes = true;
      line = `You carry your plate down to the servants\' hall and sit at ${nm("one")}\'s table. The room goes silent.\n\n${nm("other")}\'s table finishes eating without a word. The factions are over: one side won, and the other knows it was you who decided.`;
      break;
    }
    case "fracture:mix": {
      for (const p of Object.values(s.people)) if (held(p)) { p.facility = undefined; shove(p.psyche, -0.5); }
      for (const f of Object.values(s.arcology.facilities)) f.workers = [];
      cool(75);
      line = `You reshuffle every shift and every bunk in the household, splitting up every group of friends. Everyone is unhappy.\n\nBut ${nm("one")} and ${nm("other")} don\'t have their people around them any more, and the two tables slowly become one again.`;
      break;
    }
    case "fracture:third":
      for (const p of Object.values(s.people)) if (held(p)) p.bond.resentment = clamp(p.bond.resentment - 6, 0, 100);
      startRumor(s, `something bad is coming for the arcology`, { salience: 7 });
      cool(50);
      line = `You let a rumor loose that something bad is coming for the arcology. ${nm("one")} and ${nm("other")} stop fighting each other and start worrying together.\n\nIt works, for as long as the worry lasts.`;
      break;
    case "fracture:watch": t.heat = clamp(t.heat + 10, 0, 100); line = `You eat upstairs and let ${nm("one")} and ${nm("other")} fight it out.`; break;

    /* gone quiet */
    case "gone_quiet:pull": {
      const her = P("her");
      if (her) {
        her.facility = undefined; her.assignment = "rest";
        her.health.recovery_weeks = Math.max(her.health.recovery_weeks, 3);
        applyTreatment(her, { kind: "kindness", size: 10, why: "given weeks off to recover" }, week);
        her.psyche.braced_run = 0;
        shove(her.psyche, 1.5);
      }
      cool(70); closes = true;
      line = `You take ${nm("her")} off everything for a month: no work, no duties, nothing asked of her. For two weeks she mostly sleeps.\n\nIn the third week she asks for a book. It\'s the first thing she\'s wanted in months.`;
      break;
    }
    case "gone_quiet:reach": {
      const her = P("her");
      if (her) {
        shove(her.psyche, -1.4, { hard: true });
        addState(her.psyche, "being forced out of her shell", week);
        her.bond.bond = clamp(her.bond.bond + 8, -100, 100);
        her.psyche.braced_run = Math.max(0, her.psyche.braced_run - 4);
      }
      cool(30);
      line = `You don\'t let ${nm("her")} drift. You make her talk to you every day, make her choose things, make her react. She hates every minute of it.\n\nBut she\'s there for every minute, and slowly she starts coming back.`;
      break;
    }
    case "gone_quiet:use": {
      const her = P("her");
      if (her) { her.psyche.capacity = clamp(her.psyche.capacity - 0.5, -6, 6); }
      t.heat = clamp(t.heat + 15, 0, 100);
      line = `You leave ${nm("her")} to her towels. She\'s the most reliable worker in the building, never late, never wrong.\n\nThere\'s a little less of her every week.`;
      break;
    }

    /* remodelled */
    case "remodelled:tell": {
      const her = P("her");
      if (her) {
        const m = s.memory[her.id];
        if (m) remember(m, { content: "the day the owner showed her how much she'd changed", week, importance: 9, charge: "sharp", core: true });
        shove(her.psyche, -1, { hard: true });
        her.bond.bond = clamp(her.bond.bond + 6, -100, 100);
      }
      closes = true;
      line = `You show ${nm("her")} her intake sheet. She reads it twice, then looks up at you, surprised. "I don\'t remember being like that," she says.\n\nShe keeps the sheet.`;
      break;
    }
    case "remodelled:write":
      closes = true;
      line = `You put ${nm("her")}\'s intake sheet back in the file and say nothing.`;
      break;

    /* the watcher */
    case "watcher:calm": {
      const her = P("her");
      if (her) {
        her.facility = undefined; her.assignment = "rest";
        applyTreatment(her, { kind: "kindness", size: 11, why: "months of gentle treatment" }, week);
        shove(her.psyche, 2.2);
        her.bond.fear = clamp(her.bond.fear - 20, 0, 100);
      }
      cool(75); closes = true;
      line = `You take the pressure off ${nm("her")}: no punishments, no surprises, and a quiet word when she gets something right. It takes months.\n\nIn the sixth week you reach past her for a pen, and she just hands it to you instead of flinching.`;
      break;
    }
    case "watcher:predictable": {
      const her = P("her");
      if (her) {
        applyTreatment(her, { kind: "kindness", size: 5, why: "consistent treatment" }, week);
        shove(her.psyche, 0.9);
        her.bond.fear = clamp(her.bond.fear - 9, 0, 100);
      }
      cool(35);
      line = `You treat ${nm("her")} exactly the same every day: same orders, same tone, same time. At first she keeps testing it, waiting for it to break.\n\nIt doesn\'t. She\'s slowly starting to trust it.`;
      break;
    }
    case "watcher:confirm": {
      const her = P("her");
      if (her) {
        applyTreatment(her, { kind: "cruelty", size: 7, why: "the owner turned out to be as cruel as she thought" }, week);
        her.psyche.capacity = clamp(her.psyche.capacity - 0.6, -6, 6);
        const m = s.memory[her.id];
        if (m) remember(m, { content: "the week the owner proved her fears right", week, importance: 9, charge: "sharp", core: true });
      }
      cool(100); closes = true;
      line = `You become exactly what ${nm("her")} thought you were. She stops flinching at the wrong moments, because now there are no wrong moments.\n\nShe\'s terrified of you, and now she\'s right to be.`;
      break;
    }

    /* the debt */
    case "debt:pay": {
      const her = P("her");
      if (her) {
        applyTreatment(her, { kind: "recognition", size: 13, why: "asked for something real and got it" }, week);
        her.bond.hope = clamp(her.bond.hope + 18, 0, 100);
        her.bond.bond = clamp(her.bond.bond + 6, -100, 100);
      }
      s.arcology.cash -= 4000;
      cool(85); closes = true;
      line = `You give ${nm("her")} the room with the window and one day a week that\'s hers. She\'s speechless for a moment, then thanks you properly.\n\nShe spends her first free day sitting at the window, watching the sea.`;
      break;
    }
    case "debt:part": {
      const her = P("her");
      if (her) { applyTreatment(her, { kind: "kindness", size: 6, why: "given part of what she asked for, and told why" }, week); }
      cool(40);
      line = `You give ${nm("her")} the room, but not the day off. She thanks you, and means it.\n\nShe hasn\'t given up on the day, though. She\'ll ask again.`;
      break;
    }
    case "debt:refuse": {
      const her = P("her");
      if (her) {
        her.bond.hope = clamp(her.bond.hope - 20, 0, 100);
        her.bond.bond = clamp(her.bond.bond - 14, -100, 100);
        const m = s.memory[her.id];
        if (m) remember(m, { content: "the day she asked for what she'd earned and was refused", week, importance: 8, charge: "sharp", core: true });
      }
      cool(70); closes = true;
      line = `You tell ${nm("her")} no, and you tell her why. She nods and leaves.\n\nShe's been coldly polite to you ever since, and nothing more.`;
      break;
    }
    case "debt:punish": {
      const her = P("her");
      if (her) {
        applyTreatment(her, { kind: "cruelty", size: 11, why: "reminded what she was, for asking" }, week);
        her.bond.hope = clamp(her.bond.hope - 30, 0, 100);
        shove(her.psyche, -2.2, { hard: true });
      }
      cool(100); closes = true;
      line = `You remind ${nm("her")} what she is, in a way she won't forget. She'll never ask you for anything again.\n\nNeither will any slave who hears about it.`;
      break;
    }

    default: line = "";
  }

  delete t.pending;
  if (closes) {
    t.ended = { week, how: optionId };
    const def2 = THREAD_BY_KIND[t.kind];
    if (def2) s.canon.push(`${def2.name}: ${line}`);
  }
  if (line) {
    s.notifications.push({ id: `th-${week}-${t.id}-${optionId}`, week, text: line, kind: closes ? "good" : "warning", seen: false });
  }
  return { line };
}

/* ── what the narrator is told ─────────────────────────────────────────────────────────────── */

/**
 * The live situations, compiled for the prompt.
 *
 * This is the point of the whole system as far as the prose is concerned: a scene played while two
 * women have been talking for six weeks should be a scene that knows that. The narrator gets the
 * situation and the cast, not the mechanism — it is never told about heat or stages, because a
 * narrator that knows the numbers writes about the numbers.
 */
export function threadBrief(s: SaveState): string {
  const live = liveThreads(s).filter((t) => t.heat > 25);
  if (!live.length) return "";
  const out: string[] = ["ONGOING SITUATIONS IN THE HOUSEHOLD (background; bring them in only if the action touches them):"];
  for (const t of live) {
    const def = THREAD_BY_KIND[t.kind];
    if (!def) continue;
    const names = Object.values(t.cast).map((id) => s.people[id]?.name).filter(Boolean);
    out.push(`· ${def.blurb}${names.length ? ` — ${names.join(" and ")}` : ""}. ${t.facts[0] ?? ""}`);
  }
  return out.join("\n");
}

/** For the UI. */
export function describeThread(s: SaveState, t: Thread): { name: string; blurb: string; who: string[]; beat?: string } {
  const def = THREAD_BY_KIND[t.kind];
  return {
    name: def?.name ?? t.kind,
    blurb: def?.blurb ?? "",
    who: Object.values(t.cast).map((id) => s.people[id]?.name ?? "—"),
    beat: t.pending !== undefined ? def?.beats[t.pending]?.title : undefined,
  };
}

export { THREADS };
