/**
 * THE TRACE — a short memory of the numbers, so the game can notice a TREND.
 *
 * Everything in this engine has been instantaneous. `read()` tells you what she is now; the kernel
 * tells you where her relaxation sits this tick. Nothing anywhere could answer "has this been
 * getting worse for a month", which is the question every actual story starts from. A woman whose
 * resentment is at 60 is a number on a panel. Two women whose resentment has been climbing together
 * for five weeks are a situation.
 *
 * So: twelve weeks of six scalars per person, in a fixed ring. That is 72 numbers a head — a
 * hundred-woman household costs about 30KB, which is nothing next to what memory already stores,
 * and it is what makes engine/threads.ts possible at all.
 *
 * WHY A RING AND NOT A LOG. A log grows forever and gets serialised into every save. Trends worth
 * acting on are visible inside three months; anything older belongs in her actual memory, which is
 * a different structure with different rules. The ring caps the cost and forces the question to be
 * about the recent past, which is the only past a situation is ever about.
 */
import type { Person, SaveState } from "./types";
import { read } from "./obedience";
import { wear } from "./psyche";

export const TRACE_WEEKS = 12;

/** One week's reading of a person, compressed. Kept as a flat tuple rather than an object because
 *  there is one per person per week and the save is JSON. */
export interface TraceRow {
  /** The week this was taken. */
  w: number;
  /** Derived devotion, −100…100. */
  dev: number;
  /** Bond ledger, raw. */
  fear: number;
  res: number;
  hope: number;
  /** Nervous system. */
  rel: number;
  /** How much of her compliance is fear, 0–1. */
  frag: number;
}

export interface Trace {
  rows: TraceRow[];
}

export function traceOf(s: SaveState, id: string): Trace {
  s.traces = s.traces ?? {};
  return (s.traces[id] ??= { rows: [] });
}

/** Called once per person per week, at the end, after everything else has moved. */
export function recordTrace(s: SaveState, p: Person): void {
  const t = traceOf(s, p.id);
  const r = read(p, s.memory[p.id]);
  t.rows.push({
    w: s.arcology.week,
    dev: Math.round(r.devotion),
    fear: Math.round(p.bond.fear),
    res: Math.round(p.bond.resentment),
    hope: Math.round(p.bond.hope),
    rel: Math.round(p.psyche.relaxation * 10) / 10,
    frag: Math.round(r.fragility * 100) / 100,
  });
  if (t.rows.length > TRACE_WEEKS) t.rows.splice(0, t.rows.length - TRACE_WEEKS);
}

/* ── reading a trend out of it ─────────────────────────────────────────────────────────────── */

/**
 * Slope per week over the last `n` weeks, by least squares.
 *
 * Least squares rather than (last − first) on purpose: a single bad Tuesday should not read as a
 * trend, and the difference between "climbing steadily" and "spiked once and came back" is the
 * whole difference between a situation and an incident.
 */
export function slope(t: Trace, key: keyof Omit<TraceRow, "w">, n = 6): number {
  const rows = t.rows.slice(-n);
  if (rows.length < 3) return 0;
  const N = rows.length;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  rows.forEach((row, i) => {
    const y = row[key];
    sx += i; sy += y; sxy += i * y; sxx += i * i;
  });
  const denom = N * sxx - sx * sx;
  if (!denom) return 0;
  return (N * sxy - sx * sy) / denom;
}

/** The value `n` weeks ago, or the oldest we have. */
export function was(t: Trace, key: keyof Omit<TraceRow, "w">, n = 6): number | undefined {
  const rows = t.rows;
  if (!rows.length) return undefined;
  const row = rows[Math.max(0, rows.length - 1 - n)];
  return row[key];
}

export function latest(t: Trace, key: keyof Omit<TraceRow, "w">): number | undefined {
  return t.rows.at(-1)?.[key];
}

/** How long the trace has been running for this person. Detectors that need history use this so a
 *  woman bought on Tuesday does not immediately have a five-week trend. */
export function traceWeeks(t: Trace): number {
  return t.rows.length;
}

/** True when a value has stayed inside a band for the whole window — the signal for "nothing is
 *  happening to her", which is its own kind of alarming. */
export function flat(t: Trace, key: keyof Omit<TraceRow, "w">, tolerance: number, n = 6): boolean {
  const rows = t.rows.slice(-n);
  if (rows.length < n) return false;
  const vals = rows.map((r) => r[key]);
  return Math.max(...vals) - Math.min(...vals) <= tolerance;
}

/** Somatic remodelling: how far her resting point has moved from the one she arrived with. The
 *  kernel's own permanent-change signal, and the only number in the game that does not come back. */
export function remodelling(p: Person): number {
  return p.psyche.capacity - p.psyche.capacity_born;
}

/** Everything a detector wants about one person, computed once. */
export interface Signals {
  id: string;
  weeks: number;
  dev: number; fear: number; res: number; hope: number; rel: number; frag: number;
  d_dev: number; d_fear: number; d_res: number; d_hope: number; d_rel: number;
  wear: number;
  remodel: number;
  braced_run: number;
  flatline: boolean;
}

export function signalsFor(s: SaveState, p: Person): Signals {
  const t = traceOf(s, p.id);
  const r = read(p, s.memory[p.id]);
  return {
    id: p.id,
    weeks: traceWeeks(t),
    dev: r.devotion, fear: p.bond.fear, res: p.bond.resentment, hope: p.bond.hope,
    rel: p.psyche.relaxation, frag: r.fragility,
    d_dev: slope(t, "dev"), d_fear: slope(t, "fear"), d_res: slope(t, "res"),
    d_hope: slope(t, "hope"), d_rel: slope(t, "rel"),
    wear: wear(p.psyche),
    remodel: remodelling(p),
    braced_run: p.psyche.braced_run,
    // Nothing has moved on her in six weeks, in either direction. A person the week is not
    // touching is either safe or gone, and the two look identical from here.
    flatline: flat(t, "rel", 1.2) && flat(t, "dev", 6),
  };
}
