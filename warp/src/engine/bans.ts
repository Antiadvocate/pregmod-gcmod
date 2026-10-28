/**
 * DROPPED FOR GOOD.
 *
 * A storyline the player is sick of (laundry, for a woman whose job is whoring, with somebody he'd
 * already had killed) kept coming back, because every thread in this game is built to come back.
 * The player can now end one: the words it's about, and the people in it. From then on:
 *
 *   · the event goes, and so does anything else waiting that's about it
 *   · its open threads close, and a follow-up waiting on it is cancelled
 *   · the people in it are off file for stories: not tied to anyone, not cast, not named to a writer
 *   · every model call is told never to mention, continue or hint at it
 *   · anything written later that touches it anyway is thrown away before the player sees it
 *
 * No imports beyond types and faceid, so the prompt context and the save loader can use it.
 */
import type { PendingEvent, SaveState } from "./types";
import type { Face } from "./faces";
import { facesOf, keyOf } from "./faceid";

export interface Ban { id: string; week: number; words: string[]; faces: string[]; what: string }

export const bansOf = (s: SaveState): Ban[] => (s.bans ??= []);

const STOP = new Set(["about", "after", "again", "being", "could", "every", "from", "have", "here", "into", "just", "like", "more", "much", "only", "over", "some", "than", "that", "their", "them", "then", "there", "these", "they", "this", "what", "when", "where", "which", "while", "with", "would", "your", "yours", "she's", "her's", "owner", "master", "slave", "slaves", "week", "night", "today", "something", "someone", "nothing", "around", "before", "still", "looks", "says", "tells", "wants"]);

const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** A word and the words built on it: "laundr" catches laundry and laundress. */
const wordRe = (w: string) => new RegExp(`\\b${esc(w.toLowerCase().replace(/(ies|es|s|ing|ed|y)$/, "").slice(0, Math.max(4, w.length - 2)))}`, "i");

const bannedFaces = (s: SaveState): Face[] => {
  const ids = new Set(bansOf(s).flatMap((b) => b.faces));
  return Object.values(facesOf(s)).filter((f) => f.banned || (f.id && ids.has(f.id)));
};

/** What to offer when the player drops an event: the words it's about, and who's in it. */
export function suggestBan(s: SaveState, e: PendingEvent): { words: string[]; faces: Face[] } {
  const ours = new Set(Object.values(s.people).flatMap((p) => [p.name, p.surname ?? ""].map((x) => x.toLowerCase())));
  const all = Object.values(facesOf(s));
  const text = `${e.written?.title ?? ""} ${e.hook ?? ""} ${e.seed}`;
  const faces = all.filter((f) => new RegExp(`\\b${esc(f.name.split(" ")[0])}\\b`, "i").test(text));
  const named = new Set(faces.flatMap((f) => f.name.toLowerCase().split(" ")));
  const pool = `${e.written?.title ?? ""} ${e.hook ?? ""}`.toLowerCase().match(/[a-z][a-z'-]{3,}/g) ?? [];
  const words = [...new Set(pool.filter((w) => !STOP.has(w) && !ours.has(w) && !named.has(w)))].slice(0, 4);
  return { words, faces };
}

/** Whether a piece of writing is about something the player ended. */
export function isBanned(s: SaveState, text: string): boolean {
  if (!text || !bansOf(s).length) return false;
  if (bansOf(s).some((b) => b.words.some((w) => w.trim().length >= 3 && wordRe(w.trim()).test(text)))) return true;
  // A first name alone counts, unless one of the player's own women answers to it.
  const ours = new Set(Object.values(s.people).map((p) => p.name.split(" ")[0].toLowerCase()));
  return bannedFaces(s).some((f) => {
    const first = f.name.split(" ")[0];
    return new RegExp(`\\b${esc(f.name)}\\b`, "i").test(text) || (!ours.has(first.toLowerCase()) && new RegExp(`\\b${esc(first)}\\b`, "i").test(text));
  });
}

const eventText = (e: PendingEvent) => `${e.written?.title ?? ""} ${e.hook ?? ""} ${e.seed}`;

/** Take anything waiting that's about something dropped off the table. Returns how many went. */
export function purgeBanned(s: SaveState): number {
  const before = s.events.length;
  s.events = s.events.filter((e) => !isBanned(s, eventText(e)));
  return before - s.events.length;
}

/** End it. `words` are what it's about, `faces` the keys or ids of the people in it. */
export function dropStoryline(s: SaveState, e: PendingEvent | null, words: string[], faces: string[], what = ""): Ban {
  const all = facesOf(s);
  const ids = faces.map((k) => all[k]?.id ?? all[keyOf(k)]?.id ?? k).filter(Boolean);
  for (const f of Object.values(all)) if (f.id && ids.includes(f.id)) { f.banned = true; f.ties = []; f.kept = false; }
  const ban: Ban = { id: `ban-${s.arcology.week}-${bansOf(s).length}`, week: s.arcology.week, words: words.map((w) => w.trim()).filter((w) => w.length >= 3), faces: ids, what: what || e?.written?.title || words.join(", ") };
  bansOf(s).push(ban);
  if (e) s.events = s.events.filter((x) => x.id !== e.id);
  purgeBanned(s);
  for (const c of s.chronicle ?? []) if (c.hook && !c.closed && isBanned(s, `${c.title ?? ""} ${c.hook} ${c.text}`)) c.closed = true;
  for (const d of s.deeds ?? []) if (d.follow && !d.follow.fired && isBanned(s, d.follow.situation)) d.follow.fired = true;
  return ban;
}

/** For every prompt: what never comes up again. */
export function bansBrief(s: SaveState): string {
  const list = bansOf(s);
  if (!list.length) return "";
  const lines = list.map((b) => {
    const who = b.faces.map((id) => Object.values(facesOf(s)).find((f) => f.id === id)?.name).filter(Boolean);
    return `· ${[b.words.length ? `anything about ${b.words.join(", ")}` : "", who.length ? `${who.join(", ")}` : ""].filter(Boolean).join(", and ")}${b.what && !b.words.includes(b.what) ? ` (the "${b.what}" storyline)` : ""}`;
  });
  return `ENDED FOR GOOD BY THE PLAYER. Never mention, continue, hint at or build on these, in any scene, event, memory or follow-up, and never bring these people into anything again. They're gone from the story:\n${lines.join("\n")}`;
}

/** Bring it back: the ban goes, and the people in it are allowed back into stories. */
export function liftBan(s: SaveState, id: string): void {
  const b = bansOf(s).find((x) => x.id === id);
  if (!b) return;
  s.bans = bansOf(s).filter((x) => x.id !== id);
  const still = new Set(bansOf(s).flatMap((x) => x.faces));
  for (const f of Object.values(facesOf(s))) if (f.id && b.faces.includes(f.id) && !still.has(f.id)) delete f.banned;
}
