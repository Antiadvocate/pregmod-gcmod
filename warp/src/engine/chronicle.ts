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
import { isBanned } from "./bans";

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
  /** How many weeks the hook stays open, by how much the event that left it mattered. A thread is
   *  meant to drive the next thing or be over, not hang about forever (default 4). */
  life?: number;
}

/**
 * WHEN A THREAD IS OVER. A storylet is defined by what it changes, and a thread that has stopped
 * changing anything is finished, so it shouldn't keep being offered, or paid for in tokens, as
 * something to continue. A hook stays open for its life in weeks (longer the more its event
 * mattered), and closes early when:
 *   · a later event picked it up (closeHooks);
 *   · everyone it's about is gone: sold, freed, dead, or a face that has been dealt with;
 *   · the owner chose to leave it alone (the event's "leave them to it" answer leaves no hook).
 */
export const HOOK_LIFE = 4;
function stillMatters(s: SaveState, e: ChronicleEntry): boolean {
  if (s.arcology.week - e.week > (e.life ?? HOOK_LIFE)) return false;
  const about = e.keys.filter((k) => k !== "city" && !k.startsWith("law:") && !k.startsWith("place:") && !k.startsWith("gov:"));
  if (!about.length) return true;
  return about.some((k) => {
    if (k.startsWith("face:")) { const f = s.faces?.[k.slice(5)]; return !!f && !f.fate; }
    const p = s.people[k];
    return !!p && (p.status === "owned" || p.status === "indentured" || p.status === "free");
  });
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
/** Whether a thread has anything of sex, bodies or kink in it. This is a porn game: a thread about
 *  a stolen cake, an onion count or a list of grievances is over once it's been played, however
 *  much it mattered at the time, or it comes back week after week as the one story in the house. */
const HEAT = /\b(cock|dick|pussy|cunt|clit|ass|asshole|tits|breasts?|nipples?|cum\w*|fuck\w*|suck\w*|lick\w*|throat|blowjob|feet|foot|toes|soles|armpits?|kneel\w*|naked|nude|strip\w*|spank\w*|whip\w*|collar\w*|cage[ds]?|chastity|orgasm\w*|milk\w*|piss\w*|rape\w*|sex\w*|kiss\w*|worship\w*|grop\w*|horny|aroused|edg(e|ed|ing)|rid(e|es|ing)|thighs?|hips|panties|lingerie|moan\w*|erection|hard-on|bondage|cuff\w*|gag\w*|leash\w*|plug|dildo|toys?|bed|lap|mouth|seduc\w*|flirt\w*|jealous\w*|lust\w*|touch\w*|wet)\b/i;
export const hasHeat = (text: string): boolean => HEAT.test(text);

/** Open threads with something worth playing in them. */
export function hotHooks(s: SaveState, keys: string[]): ChronicleEntry[] {
  const gone = Object.values(s.faces ?? {}).filter((f) => f.fate || f.banned).map((f) => f.name.split(" ")[0]).filter((n) => n.length >= 3);
  return openHooks(s, keys).filter((e) => {
    const text = `${e.hook ?? ""} ${e.text}`;
    // A thread about someone already killed, ruined, thrown out or dropped is over.
    if (gone.some((n) => new RegExp(`\\b${n}\\b`, "i").test(e.hook ?? ""))) return false;
    return hasHeat(text) && !isBanned(s, text);
  });
}

export function openHooks(s: SaveState, keys: string[]): ChronicleEntry[] {
  const want = new Set(keys);
  return chronicleOf(s).filter((e) => e.hook && !e.closed && e.keys.some((k) => want.has(k)) && stillMatters(s, e)).reverse();
}

export function closeHooks(s: SaveState, keys: string[]): void {
  for (const e of openHooks(s, keys)) e.closed = true;
}

/** For a prompt: what has happened, and what is still hanging. Empty when there is nothing. */
export function chronicleBrief(s: SaveState, keys: string[], n = 8): string {
  const done = entriesFor(s, keys, n);
  if (!done.length) return "";
  const lines = done.map((e) => `· week ${e.week}: ${e.text}${e.hook && !e.closed && stillMatters(s, e) ? ` (Left open: ${e.hook})` : ""}`);
  return `WHAT HAS ALREADY HAPPENED, in order. This is history, so build on it rather than repeating it:\n${lines.join("\n")}`;
}
