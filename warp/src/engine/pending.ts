/**
 * ONE THING AT A TIME, PER PERSON.
 *
 * Several events about the same woman waited at once, written from the same week. By the time the
 * player had answered one, the next was about a situation that no longer existed, and it still
 * played out and went into her memories. Now a person has at most one event waiting. A more urgent
 * one takes the place of a lesser one; otherwise whatever's already waiting stays, and nothing new
 * is written about her until it's dealt with.
 */
import type { PendingEvent, SaveState } from "./types";

const RANK: Record<string, number> = { major: 0, notable: 1, minor: 2 };

/** The consequence of something the player did (a deed's follow-up, or a choice coming back) beats a
 *  random event of the week, whatever its severity: the player set it in motion and is owed it. */
const isEcho = (e: PendingEvent): boolean => e.id.startsWith("echo-") || !!e.cause;
const weight = (e: PendingEvent): number => (isEcho(e) ? -1 : 0) * 10 + (RANK[e.severity] ?? 1);

/** Whether this person already has something waiting. */
export const hasPending = (s: SaveState, id: string): boolean => s.events.some((e) => e.person === id || e.other === id);

/** Keep one waiting event per person: a consequence of the player's own doing first, then the most
 *  urgent, then the oldest. Returns how many went. */
export function oneEach(s: SaveState): number {
  const before = s.events.length;
  const order = [...s.events].sort((a, b) => weight(a) - weight(b) || a.week - b.week);
  const taken = new Set<string>();
  const keep = new Set<PendingEvent>();
  for (const e of order) {
    const who = [e.person, e.other].filter((x): x is string => !!x);
    if (who.some((id) => taken.has(id))) continue;
    for (const id of who) taken.add(id);
    keep.add(e);
  }
  s.events = s.events.filter((e) => keep.has(e));
  return before - s.events.length;
}
