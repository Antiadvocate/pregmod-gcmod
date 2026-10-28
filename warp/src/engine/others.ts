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
import { adultText, findFace, giveId, keyOf, oneOfOurs } from "./faceid";

/** Put someone on file who the game made rather than a scene (a governor's dock boss), or find
 *  them if they're there. Kept: they belong to something that's still running. One of the player's
 *  own is never filed as an outsider: a slave a model cast into another woman's event under her own
 *  name came back as a stranger with that name, then a stranger running the kitchens, and the real
 *  woman was a different person from then on. So that's undefined. Another spelling of someone on
 *  file (a new surname on the same first name) is the same person. */
export function file(s: SaveState, name: string, what: string, pronoun: "he" | "she" = "she"): Face | undefined {
  if (oneOfOurs(s, name)) return undefined;
  const all = (s.faces ??= {});
  const week = s.arcology.week;
  const had = findFace(s, name);
  if (had && keyOf(had.name) !== keyOf(name) && !(had.aliases ?? []).some((a) => keyOf(a) === keyOf(name))) had.aliases = [...(had.aliases ?? []), name].slice(-6);
  const f = had ?? (all[keyOf(name)] = { name, pronoun, age: 30 + (name.length * 7) % 30, first: week, last: week, seen: 0 });
  giveId(s, f);
  f.what ??= adultText(what);
  f.kept = true;
  return f;
}

/** Someone who has turned up enough, or matters enough, to keep a record of. */
export function known(f: Face): boolean {
  return !!(f.kept || f.fate || f.role || (f.ties ?? []).length || (f.notes ?? []).length >= 2 || f.seen >= 3);
}

/** Whole sentences, never a fragment: cut at the last sentence end that fits, or at a word with an
 *  ellipsis. A record that stops at "his mates at the next" is a riddle the narrator fills in. */
export function whole(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  let end = -1;
  for (const m of t.matchAll(/[.!?]["'”’]?(?=\s|$)/g)) { const e = m.index! + m[0].length; if (e <= max) end = e; else break; }
  return end > max / 3 ? t.slice(0, end) : `${t.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/** Their part in something written about someone else: the sentences that name them and the one
 *  after each (what they said usually runs on), else how it started. */
export function partIn(text: string, name: string, max = 240): string {
  const first = name.trim().split(/\s+/)[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sentences = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+["'”’]?/g) ?? [text];
  const named = new RegExp(`\\b${first}\\b`);
  const keep = new Set<number>();
  sentences.forEach((x, i) => { if (named.test(x)) { keep.add(i); if (i + 1 < sentences.length) keep.add(i + 1); } });
  const picked = keep.size ? [...keep].sort((a, b) => a - b).map((i) => sentences[i]) : sentences.slice(0, 2);
  return whole(picked.join(" "), max);
}

/** What happened, from their side, kept on their record. */
export function note(s: SaveState, f: Face, text: string): void {
  const t = whole(text.replace(/^week \d+:\s*/i, ""), 240);
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
    ties.length ? `${ties.join(", ")}` : "",
    toward,
    f.likes ? `likes ${f.likes}` : "",
    f.dislikes ? `can't stand ${f.dislikes}` : "",
  ].filter(Boolean);
  const mem = (f.notes ?? []).slice(-3).map((n) => `week ${n.week}: ${n.text.replace(/^week \d+:\s*/i, "")}`);
  return `${bits.length ? `. ${bits.join(", ")}` : ""}${mem.length ? `. Remembers: ${mem.join(" | ")}` : ""}`;
}
