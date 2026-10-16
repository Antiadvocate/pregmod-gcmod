/**
 * THE CHRONICLE — what has already happened, kept so the next thing can grow out of it.
 *
 * An event that forgets the last one is the same event twice. Every answered event, request,
 * negotiation and governor's letter leaves one entry here: who it was about, what happened, what
 * you did, and what was left open. Every prompt that writes something new reads the entries for
 * the people and places in it, so a woman caught at the door in March is still the woman who was
 * caught at the door in May, and a rival you humiliated at a summit remembers it at the next one.
 *
 * Keys: a person id, `place:<power id>`, `law:<law id>`, `gov:<power id>`, or `city`.
 */
import type { SaveState } from "./types";

export interface ChronicleEntry {
  week: number;
  /** Who or what it's about. One entry can be about several keys. */
  keys: string[];
  /** A short title for lists. */
  title?: string;
  /** What happened and what you did, one or two plain sentences. */
  text: string;
  /** Something left open that a later event can pick up. */
  hook?: string;
  /** Set once a later event has picked the hook up. */
  closed?: boolean;
}

const MAX = 240;

export function chronicleOf(s: SaveState): ChronicleEntry[] {
  return (s.chronicle ??= []);
}

export function chronicle(s: SaveState, e: Omit<ChronicleEntry, "week"> & { week?: number }): void {
  const list = chronicleOf(s);
  const text = e.text.replace(/\s+/g, " ").trim().slice(0, 420);
  if (!text) return;
  list.push({ ...e, text, week: e.week ?? s.arcology.week, keys: [...new Set(e.keys.filter(Boolean))] });
  if (list.length > MAX) list.splice(0, list.length - MAX);
}

/** The entries about any of these keys, oldest first. */
export function entriesFor(s: SaveState, keys: string[], n = 8): ChronicleEntry[] {
  const want = new Set(keys);
  return chronicleOf(s).filter((e) => e.keys.some((k) => want.has(k))).slice(-n);
}

/** Open threads: hooks nobody has picked up yet, newest first. */
export function openHooks(s: SaveState, keys: string[]): ChronicleEntry[] {
  const want = new Set(keys);
  return chronicleOf(s).filter((e) => e.hook && !e.closed && e.keys.some((k) => want.has(k)) && s.arcology.week - e.week <= 20).reverse();
}

export function closeHooks(s: SaveState, keys: string[]): void {
  for (const e of openHooks(s, keys)) e.closed = true;
}

/** For a prompt: what has happened, and what is still hanging. Empty when there is nothing. */
export function chronicleBrief(s: SaveState, keys: string[], n = 8): string {
  const done = entriesFor(s, keys, n);
  if (!done.length) return "";
  const lines = done.map((e) => `· week ${e.week}: ${e.text}${e.hook && !e.closed ? ` (Left open: ${e.hook})` : ""}`);
  return `WHAT HAS ALREADY HAPPENED (in order; this is history, so build on it, don't repeat it):\n${lines.join("\n")}`;
}
