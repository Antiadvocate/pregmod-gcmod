/**
 * WHAT CHANGED — the numbers a choice moved, as chips.
 *
 * Answering an event without having it written out still needs to tell you what it did. Take the
 * numbers before, take them after, and show what moved: her devotion and trust, her fear and
 * resentment, how turned on she is, your cash and your reputation.
 */
import type { SaveState } from "../engine/types";
import { read } from "../engine/obedience";

export interface Stats { cash: number; rep: number; people: Record<string, { name: string; devotion: number; trust: number; fear: number; resentment: number; arousal: number }> }

export function takeStats(s: SaveState, ids: (string | undefined)[]): Stats {
  const people: Stats["people"] = {};
  for (const id of ids) {
    const p = id ? s.people[id] : undefined;
    if (!p) continue;
    const r = read(p, s.memory[p.id]);
    people[p.id] = { name: p.name.split(" ")[0], devotion: r.devotion, trust: r.trust, fear: p.bond.fear, resentment: p.bond.resentment, arousal: p.psyche.arousal };
  }
  return { cash: s.arcology.cash, rep: s.arcology.rep, people };
}

export interface Chip { text: string; good: boolean }

/** What moved, biggest first. Fear and resentment going up is bad news; the rest is the other way. */
export function chipsBetween(a: Stats, b: Stats): Chip[] {
  const out: (Chip & { size: number })[] = [];
  const add = (label: string, d: number, upIsGood: boolean, min = 1) => {
    if (Math.abs(d) < min) return;
    out.push({ text: `${d > 0 ? "+" : "−"}${Math.abs(Math.round(d))} ${label}`, good: (d > 0) === upIsGood, size: Math.abs(d) });
  };
  for (const [id, x] of Object.entries(a.people)) {
    const y = b.people[id];
    if (!y) continue;
    const many = Object.keys(a.people).length > 1;
    const who = many ? `${x.name}'s ` : "";
    add(`${who}devotion`, y.devotion - x.devotion, true);
    add(`${who}trust`, y.trust - x.trust, true);
    add(`${who}fear`, y.fear - x.fear, false);
    add(`${who}resentment`, y.resentment - x.resentment, false);
    add(`${who}arousal`, y.arousal - x.arousal, true, 3);
  }
  const cash = b.cash - a.cash;
  if (Math.abs(cash) >= 1) out.push({ text: `${cash > 0 ? "+" : "−"}¤${Math.abs(Math.round(cash)).toLocaleString()}`, good: cash > 0, size: Math.abs(cash) / 200 });
  add("reputation", b.rep - a.rep, true);
  return out.sort((p, q) => q.size - p.size).slice(0, 6).map(({ text, good }) => ({ text, good }));
}
