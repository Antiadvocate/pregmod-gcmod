/**
 * OTHERS — the people in the story who aren't yours.
 *
 * A dock boss, a citizen one of your women married, the journalist who keeps coming back. Less on
 * file than a slave (no psyche, no body sheet) but enough to be somebody: what they do, who they
 * are to your people, what they think of you, what they like, and what they remember. Every scene
 * they turn up in is told all of it, and they can be met, edited, or dealt with from the Others tab.
 *
 * Kept apart from ./faces so the prompt builders can read it without pulling in the sagas.
 */
import type { SaveState } from "./types";
import type { Face } from "./faces";

const keyOf = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

/** Put someone on file who the game made rather than a scene (a governor's dock boss), or find
 *  them if they're there. Kept: they belong to something that's still running. */
export function file(s: SaveState, name: string, what: string, pronoun: "he" | "she" = "she"): Face {
  const all = (s.faces ??= {});
  const k = keyOf(name);
  const week = s.arcology.week;
  const f = (all[k] ??= { name, pronoun, age: 30 + (name.length * 7) % 30, first: week, last: week, seen: 0 });
  f.what ??= what;
  f.kept = true;
  return f;
}

/** Someone who has turned up enough, or matters enough, to keep a record of. */
export function known(f: Face): boolean {
  return !!(f.kept || f.fate || f.role || (f.ties ?? []).length || (f.notes ?? []).length >= 2 || f.seen >= 3);
}

/** What happened, from their side, kept on their record. */
export function note(s: SaveState, f: Face, text: string): void {
  const t = text.replace(/\s+/g, " ").trim().slice(0, 240);
  if (!t) return;
  f.notes ??= [];
  if (f.notes.some((n) => n.text === t)) return;
  f.notes.push({ week: s.arcology.week, text: t });
  if (f.notes.length > 20) f.notes.splice(0, f.notes.length - 20);
}

/** Tie them to someone: one of yours, by id, or the player. Replaces what was there for that person. */
export function tie(f: Face, what: string, person?: string): void {
  const w = what.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!w) return;
  f.ties = (f.ties ?? []).filter((x) => (person ? x.person !== person : x.what !== w));
  f.ties.push({ what: w, person });
  if (person) f.kept = true;
}

/** Everyone on file tied to one of yours. */
export function tiedTo(s: SaveState, personId: string): { face: Face; what: string }[] {
  return Object.values(s.faces ?? {}).flatMap((f) => (f.ties ?? []).filter((x) => x.person === personId).map((x) => ({ face: f, what: x.what })));
}

/** Everything on file about someone, for a prompt: what they do, who they are to people, what
 *  they think of the player, what they like, and what they remember. */
export function record(s: SaveState, f: Face): string {
  const ties = (f.ties ?? []).map((x) => (x.person && s.people[x.person] ? `${x.what} (${s.people[x.person].name}, the player's)` : x.what));
  const toward = f.toward === undefined ? "" : f.toward >= 50 ? "fond of the player" : f.toward >= 15 ? "well disposed to the player" : f.toward > -15 ? "careful with the player" : f.toward > -50 ? "dislikes the player" : "hates the player";
  const bits = [
    f.what ? `${f.what}` : f.role ? `${f.role.replace(/_/g, " ")}` : "",
    ties.length ? `${ties.join("; ")}` : "",
    toward,
    f.likes ? `likes ${f.likes}` : "",
    f.dislikes ? `can't stand ${f.dislikes}` : "",
  ].filter(Boolean);
  const mem = (f.notes ?? []).slice(-3).map((n) => `week ${n.week}: ${n.text}`);
  return `${bits.length ? `. ${bits.join("; ")}` : ""}${mem.length ? `. Remembers: ${mem.join(" | ")}` : ""}`;
}
