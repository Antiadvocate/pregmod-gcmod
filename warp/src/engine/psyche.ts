/**
 * THE KERNEL — one scalar, and everything that leans on it.
 *
 * Ported from Weft (see KERNEL.md in the Weft repo, §2–§5) and re-clocked. Weft ticks per
 * conversational turn; Warp has two clocks, because an arcology has two: the scene, which is
 * minutes, and the week, which is the thing the whole economy is denominated in. Both call the
 * same functions — a week is simply more drift steps and a bigger shove — because the alternative
 * is two kernels that disagree about what a person is, and then a slave who is a different woman
 * depending on which screen you looked at her from.
 *
 * The one number is `relaxation`, −10 (clenched) … +10 (open). Everything else in this file is a
 * threshold on it or a coupling to it.
 *
 * WHAT THIS REPLACES. The old game moved `devotion` and `trust` directly, from about eleven
 * hundred call sites. Nothing moves a reading here. Events shove relaxation, weeks of work wear
 * the resting point, memories accrue, and devotion is computed from the wreckage (obedience.ts).
 * The practical consequence is that you cannot buy obedience by adding to it — you buy it by
 * making a week that a nervous system responds to, and a nervous system has a memory.
 */
import type { Psyche, Person } from "./types";

export const clamp = (n: number, lo: number, hi: number): number => (n < lo ? lo : n > hi ? hi : n);

/** ── the thresholds that mean something ──────────────────────────────────────────────────────
 *  Gathered here so the whole skeleton is visible at once. Changing one changes behaviour. */
export const T = {
  /** relaxation at or below this and the body is visibly braced — the narrator gets a tension cue. */
  BRACED: -2,
  /** the fracturing line. Four consecutive deep-clenched ticks flips state. */
  FRACTURE: -4,
  /** deep clench; the counter runs here. */
  DEEP: -7,
  /** fracturing → broken. */
  BREAK: -9,
  /** emotions self-liberate at or above this. */
  LIBERATE: 3,
  /** the aperture opens: speech comes out of the person rather than through a filter. */
  OPEN: 2,
  /** the aperture narrows to the one thing. */
  NARROW: -4,
  /** a held emotion starts feeding on itself below this. */
  THREATENED: -3,
  /** rise required, from a held deep clench, to count as a discharge. */
  DISCHARGE_RISE: 2.5,
  /** consecutive braced ticks that buy one step of wear on the resting point. */
  WEAR_RUN: 8,
  /** consecutive settled ticks that buy one step of recovery. Cheaper than wear, deliberately. */
  SETTLE_RUN: 6,
  /** how far the resting point may move from what a person was born with. */
  WEAR_FLOOR: -2.5,
  SETTLE_CEIL: 2.0,
} as const;

export function newPsyche(capacity: number, recovery = 0.18): Psyche {
  return {
    relaxation: capacity,
    capacity,
    capacity_born: capacity,
    recovery,
    braced_run: 0,
    settled_run: 0,
    consecutive_clenched: 0,
    open_run: 0,
    prev_relaxation: capacity,
    discharge_lift: 0,
    state: "intact",
    mood: "flat",
    active_states: [],
    state_ages: {},
    arousal: 20,
    libido: 40,
  };
}

/** THE DRIFT. One step = one scene turn. A week calls this several times (see weekSteps).
 *
 *  Asymmetric on purpose: above the resting point, relaxation collapses fast (a person does not
 *  float above their own nature because the week was pleasant); below it, they recover at their
 *  own rate, which is a per-person trait and the reason two slaves given identical treatment are
 *  in different places by month three. */
export function tickPsyche(p: Psyche): void {
  const effCapacity = p.capacity + (p.discharge_lift ?? 0);
  const gap = effCapacity - p.relaxation;
  const rate = p.relaxation > effCapacity ? Math.max(p.recovery, 0.5) : p.recovery;
  p.relaxation = clamp(p.relaxation + gap * rate, -10, 10);

  if (p.relaxation <= T.DEEP) p.consecutive_clenched++;
  else p.consecutive_clenched = 0;

  const openFloor = Math.min(3, Math.max(0, effCapacity - 1));
  p.open_run = p.relaxation >= openFloor ? p.open_run + 1 : 0;

  tickRuns(p);

  if (p.discharge_lift) {
    p.discharge_lift = +(p.discharge_lift * 0.7).toFixed(3);
    if (p.discharge_lift < 0.2) p.discharge_lift = 0;
  }

  if (p.state === "intact" && p.consecutive_clenched >= 4) p.state = "fracturing";
  if (p.state === "fracturing" && p.relaxation > T.FRACTURE) { p.state = "intact"; delete p.break_mode; }
  if (p.state === "fracturing" && p.relaxation <= T.BREAK) { p.state = "broken"; p.break_mode = p.break_mode ?? "fractured"; }
  if (p.state === "broken" && p.relaxation > -2) { p.state = "intact"; delete p.break_mode; }
}

/** SOMATIC REMODELLING — the resting point is lived, not constant.
 *
 *  A run of bracing lowers where a body comes to rest; a run spent above it raises it. Four things
 *  stop this becoming a one-way trip into numbness: the band around what they were born with, a
 *  standing pull home worth 2% of the gap every tick, settling being cheaper to earn than wear
 *  (6 ticks against 8), and the damping in `shove` below. */
function tickRuns(p: Psyche): void {
  // THE BRACED LINE IS PERSONAL. It was the absolute −2, which quietly asserted that anybody whose
  // nature rests below −2 is being worn down by existing: a naturally guarded woman left alone in
  // an empty room for a year came out of it 1.8 below the resting point she was born with, having
  // had nothing whatever happen to her. Wear is for being held BELOW where you rest, not for being
  // who you are, so the line is whichever is lower — the braced threshold, or half a point under
  // this particular body's own resting point.
  const braced = p.relaxation <= Math.min(T.BRACED, p.capacity - 0.5);
  const settled = p.relaxation > p.capacity + 0.5;
  p.braced_run = braced ? p.braced_run + 1 : 0;
  p.settled_run = settled ? p.settled_run + 1 : 0;

  const floor = p.capacity_born + T.WEAR_FLOOR;
  const ceil = p.capacity_born + T.SETTLE_CEIL;

  if (p.braced_run >= T.WEAR_RUN) { p.capacity = clamp(p.capacity - 0.3, floor, ceil); p.braced_run = 0; }
  if (p.settled_run >= T.SETTLE_RUN) { p.capacity = clamp(p.capacity + 0.3, floor, ceil); p.settled_run = 0; }

  // the pull home, always running, in the direction of who they were
  p.capacity = +(p.capacity + (p.capacity_born - p.capacity) * 0.02).toFixed(3);
}

/** HOW WORN IS THIS BODY — 0 (as born) … 1 (at the floor). Reads as numbness. */
export function wear(p: Psyche): number {
  const drop = p.capacity_born - p.capacity;
  return clamp(drop / Math.abs(T.WEAR_FLOOR), 0, 1);
}

/** THE ONLY WAY ANYTHING MOVES THE SCALAR.
 *
 *  A worn body damps ordinary friction — deltas of 1.5 or less land at as little as 45% — so the
 *  daily grind stops registering on somebody who has been ground for a year. A real blow lands in
 *  full on the most hardened person in any save; nobody in this engine becomes unreachable. */
export function shove(p: Psyche, delta: number, opts?: { hard?: boolean }): number {
  let d = delta;
  if (!opts?.hard && Math.abs(delta) <= 1.5) d = delta * (1 - 0.55 * wear(p));
  const before = p.relaxation;
  p.relaxation = clamp(p.relaxation + d, -10, 10);
  return +(p.relaxation - before).toFixed(3);
}

/** How many drift steps a week is worth. Not seven: a week is not seven conversations, and drift
 *  is per-event rather than per-day. Five is where the numbers behave — a person left alone for a
 *  week comes most of the way home, and one left alone for a month is home. */
export const WEEK_STEPS = 5;

export function tickWeek(p: Psyche): void {
  p.prev_relaxation = p.relaxation;
  for (let i = 0; i < WEEK_STEPS; i++) tickPsyche(p);
}

/* ── EMOTIONS ────────────────────────────────────────────────────────────────────────────────
 * An emotion is an event, not a possession. What happens next depends on the body holding it:
 * a settled body feels it through and keeps the information; a clenched one re-tells it until the
 * story about the pain becomes its own pain. */

export function addState(p: Psyche, label: string, week: number): void {
  if (p.active_states.includes(label)) return;
  p.active_states.push(label);
  p.state_ages[label] = week;
  if (p.active_states.length > 6) {
    const gone = p.active_states.shift()!;
    delete p.state_ages[gone];
  }
}

/** The residue an emotion leaves when it is felt through rather than fed. Anger leaves a clear
 *  view of what was wrong; fear leaves alertness; grief leaves plain love. The charge goes, the
 *  knowledge stays. */
const RESIDUE: [RegExp, string][] = [
  [/anger|rage|fury|resent/i, "a clear view of exactly what was wrong"],
  [/fear|dread|terror|afraid/i, "alertness to what actually matters here"],
  [/grief|loss|mourn/i, "plain love for what is gone"],
  [/shame|humiliat/i, "a colder read on who was actually watching"],
  [/envy|jealous/i, "the plain energy to go and get it"],
  [/contempt|disgust/i, "seeing the other person standing on the same floor"],
];

export function residueFor(label: string): string {
  for (const [re, out] of RESIDUE) if (re.test(label)) return out;
  return "a settled sense of what happened";
}

export interface EmotionOutcome { liberated: string[]; residue: string[]; fed: string | null; drain: number }

export function tickEmotions(p: Psyche, week: number): EmotionOutcome {
  const out: EmotionOutcome = { liberated: [], residue: [], fed: null, drain: 0 };
  if (!p.active_states.length) return out;

  if (p.relaxation >= T.LIBERATE) {
    for (const label of [...p.active_states]) {
      const age = week - (p.state_ages[label] ?? week);
      if (age >= 2) {
        out.liberated.push(label);
        out.residue.push(residueFor(label));
        p.active_states = p.active_states.filter((s) => s !== label);
        delete p.state_ages[label];
      }
    }
    if (out.liberated.length && p.mood !== "flat") p.mood = "settled";
    return out;
  }

  if (p.relaxation <= T.THREATENED) {
    // the oldest held emotion starts feeding on itself, and colonizes the mood
    const oldest = [...p.active_states].sort((a, b) => (p.state_ages[a] ?? 0) - (p.state_ages[b] ?? 0))[0];
    const age = week - (p.state_ages[oldest] ?? week);
    if (age >= 3) {
      out.fed = oldest;
      out.drain = -0.2;
      p.relaxation = clamp(p.relaxation - 0.2, -10, 10);
      p.mood = oldest;
    }
  }
  return out;
}

/** RELEASE. Contraction held past capacity does not taper off — it lets go. Detected when a body
 *  that was deep-clenched at the start of the tick returns above the fracturing line within it,
 *  with a real rise. The oldest gripped emotion completes on the spot, keeping its information
 *  and dropping its story, and the body earns a temporary opening above its own nature. */
export function tickDischarge(p: Psyche): { fired: boolean; released?: string; residue?: string } {
  const held = p.consecutive_clenched >= 3 || p.state !== "intact";
  const wasDeep = p.prev_relaxation <= T.DEEP;
  const rise = p.relaxation - p.prev_relaxation;
  if (!(wasDeep && held && p.relaxation > T.FRACTURE && rise >= T.DISCHARGE_RISE)) return { fired: false };

  const oldest = [...p.active_states].sort((a, b) => (p.state_ages[a] ?? 0) - (p.state_ages[b] ?? 0))[0];
  if (oldest) {
    p.active_states = p.active_states.filter((s) => s !== oldest);
    delete p.state_ages[oldest];
  }
  p.mood = "wrung out";
  p.discharge_lift = 1.5;
  p.consecutive_clenched = 0;
  return { fired: true, released: oldest, residue: oldest ? residueFor(oldest) : undefined };
}

/* ── READS ───────────────────────────────────────────────────────────────────────────────────
 * Everything the UI and the prompts ask the kernel. None of these store anything. */

/** How accurately this person reads other people right now. Clenched bodies see poorly and are
 *  certain anyway; open bodies see people as they are. Conscience is orthogonal: seeing clearly
 *  and caring are different faculties, and the cold ones see best of all. */
export function perception(p: Psyche, conscience: number): { accuracy: number; note: string } {
  const accuracy = clamp((p.relaxation + 10) / 20, 0, 1);
  if (accuracy < 0.3)
    return { accuracy, note: conscience <= 0.35
      ? "reads the room fast and meanly — every neutral face is an opponent, and she is not frightened of any of them"
      : "misreads people badly and is certain: a neutral face looks like a threat" };
  if (accuracy < 0.5) return { accuracy, note: "watching for the catch in everything said to her" };
  if (accuracy > 0.75) return { accuracy, note: "sees people roughly as they actually are" };
  return { accuracy, note: "reads people at about the accuracy anyone manages" };
}

/** THE APERTURE — how much of the world reaches what a person SAYS. A braced body narrows onto
 *  the one thing; an open one is catchable by whatever is around it. The voice card describes the
 *  shape a person takes under load; run at a hundred percent it stops being a voice and becomes a
 *  filter. This decides how much of it is load-bearing this turn. */
export function aperture(p: Psyche): { width: number; note: string } {
  if (p.relaxation <= T.NARROW)
    return { width: 0.15, note: "narrowed to the one thing that matters; short, concentrated, very little else gets in" };
  if (p.relaxation >= T.OPEN)
    return { width: 0.9, note: "open — says things for no reason, notices what is actually in the room, does not end every sentence on what happens next" };
  return { width: 0.5, note: "ordinary width: mostly on her own business, occasionally caught by something else" };
}

/** The one-word band a player sees. */
export function band(p: Psyche): string {
  const r = p.relaxation;
  if (p.state === "broken") return "broken";
  if (p.state === "fracturing") return "fracturing";
  if (r <= T.DEEP) return "clenched";
  if (r <= T.BRACED) return "braced";
  if (r < T.OPEN) return "guarded";
  if (r < 5) return "settled";
  return "open";
}

/** The visible cue the narrator is allowed to describe — body only, never interior. */
export function tensionCue(p: Psyche): string {
  const r = p.relaxation;
  if (r <= T.DEEP) return "shoulders up, jaw locked, breathing high in the chest";
  if (r <= T.BRACED) return "holding herself still in a way that costs something";
  if (r >= 5) return "loose through the shoulders; breathing all the way down";
  return "";
}

/** Convenience for the many places that have a Person rather than a Psyche. */
export function personBand(p: Person): string { return band(p.psyche); }
