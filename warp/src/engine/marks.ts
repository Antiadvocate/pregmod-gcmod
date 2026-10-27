/**
 * MARKS — what was done to a body, left on it.
 *
 * The art could breathe and blush but it couldn't show anything that happened: the scene says
 * her cum is drying on your forehead and the picture of you is clean. Here a body keeps what was
 * left on it (cum, spit, a print of her sole, welts, lipstick, a word written in marker) and where,
 * and the figure draws it until it's washed off or wears away. Read out of the scene by the
 * bookkeeper that already reads every turn, so it costs nothing.
 *
 * And BEATS: once in a while somebody's body does something the prose just described, played as a
 * short animation on the figure. Deliberately not a list of normal reactions.
 */
import type { Person, SaveState } from "./types";

export type MarkKind = "cum" | "spit" | "tears" | "mascara" | "welts" | "bruise" | "lipstick" | "words" | "soleprint" | "piss" | "sweat" | "handprint" | "bite";
export type Spot = "face" | "mouth" | "forehead" | "neck" | "collar" | "chest" | "belly" | "crotch" | "thighs" | "ass" | "feet" | "hands";

export const MARK_KINDS: MarkKind[] = ["cum", "spit", "tears", "mascara", "welts", "bruise", "lipstick", "words", "soleprint", "piss", "sweat", "handprint", "bite"];
export const SPOTS: Spot[] = ["face", "mouth", "forehead", "neck", "collar", "chest", "belly", "crotch", "thighs", "ass", "feet", "hands"];

export interface Mark {
  kind: MarkKind;
  spot: Spot;
  /** What's written, for "words". */
  text?: string;
  week: number;
  /** The turn it was left, so fresh can turn to dried. */
  turn: number;
  /** When, by the clock: the figure draws it wet for a while after. */
  at?: number;
}

/** Weeks before it's gone on its own, if nobody washes it. */
const LASTS: Record<MarkKind, number> = { cum: 1, spit: 0, tears: 0, mascara: 1, welts: 3, bruise: 2, lipstick: 1, words: 2, soleprint: 1, piss: 0, sweat: 0, handprint: 1, bite: 2 };
/** These wash off; the rest have to heal. */
const WASHES: MarkKind[] = ["cum", "spit", "tears", "mascara", "lipstick", "words", "soleprint", "piss", "sweat"];

export const fresh = (s: SaveState, m: Mark) => s.turn - m.turn <= 3 && m.week === s.arcology.week;

/** Where a body's marks are kept: hers on her, yours on the save. */
export function marksOf(s: SaveState, who: string): Mark[] | undefined {
  if (who === "owner" || who === "player") return (s.player.stains ??= []);
  const p = s.people[who];
  return p ? (p.stains ??= []) : undefined;
}

export function mark(s: SaveState, who: string, kind: string, spot: string, text?: string): boolean {
  const list = marksOf(s, who);
  const k = MARK_KINDS.includes(kind as MarkKind) ? (kind as MarkKind) : undefined;
  const sp = SPOTS.includes(spot as Spot) ? (spot as Spot) : undefined;
  if (!list || !k || !sp) return false;
  // More of the same on the same spot is the same mark, fresher.
  const had = list.find((m) => m.kind === k && m.spot === sp && (k !== "words" || m.text === text));
  if (had) { had.week = s.arcology.week; had.turn = s.turn; had.at = Date.now(); return true; }
  list.push({ kind: k, spot: sp, text: k === "words" ? String(text ?? "").slice(0, 24) : undefined, week: s.arcology.week, turn: s.turn, at: Date.now() });
  if (list.length > 14) list.splice(0, list.length - 14);
  return true;
}

/** A bath, a shower, a cloth: what washes off goes. */
export function wash(s: SaveState, who: string): void {
  const list = marksOf(s, who);
  if (list) list.splice(0, list.length, ...list.filter((m) => !WASHES.includes(m.kind)));
}

/** Weekly: what's had its time wears off. */
export function tickMarks(s: SaveState): void {
  const week = s.arcology.week;
  const keep = (m: Mark) => week - m.week <= LASTS[m.kind];
  for (const p of Object.values(s.people)) if (p.stains?.length) p.stains = p.stains.filter(keep);
  if (s.player.stains?.length) s.player.stains = s.player.stains.filter(keep);
}

/** For a prompt: what's on a body right now. */
export function marksLine(s: SaveState, list?: Mark[]): string {
  if (!list?.length) return "";
  return list.map((m) => `${m.kind === "words" ? `"${m.text}" written` : `${fresh(s, m) ? "fresh " : m.kind === "cum" ? "dried " : ""}${m.kind}`} on ${m.spot === "collar" ? "the collar" : m.spot}`).join(", ");
}

/* ── beats ──────────────────────────────────────────────────────────────────────────────────── */

export type BeatKind = "shudder" | "jelly" | "float" | "loom" | "shrink" | "spiral" | "steam" | "throb" | "faint" | "hearts" | "stretch" | "puddle" | "glitch" | "freeze";

export const BEATS: Record<BeatKind, string> = {
  shudder: "a full-body shudder, like a dog shaking off water",
  jelly: "goes to jelly, wobbles and half-melts, then pulls herself back together",
  float: "floats up off the floor for a moment, blissed out, and drifts back down",
  loom: "looms. She gets bigger and closer and fills the frame, the way she feels to the person under her",
  shrink: "shrinks, gets small, smaller than she should be, then grows back",
  spiral: "gets spiral eyes, dazed, fucked stupid, not home",
  steam: "steams at the head, flustered, overheated and embarrassed",
  throb: "throbs, and her hips pulse, slow and obvious",
  faint: "tips over sideways in a slow swoon and pops back up",
  hearts: "hearts float up off her",
  stretch: "her neck stretches tall in shock, cartoonishly, and snaps back",
  puddle: "sinks halfway into the floor like she's melting into it, then rises",
  glitch: "glitches: jitters and flickers, like reality can't decide",
  freeze: "freezes stiff as a board and tips slightly, caught out",
};

export function beat(s: SaveState, who: string, kind: string): boolean {
  if (!(kind in BEATS)) return false;
  const b = { kind: kind as BeatKind, n: Date.now() };
  if (who === "owner" || who === "player") { s.player.beat = b; return true; }
  const p = s.people[who];
  if (!p) return false;
  p.beat = b;
  return true;
}

/** For the bookkeeper: the shape of the two new fields. */
export const MARKS_SCHEMA = `"marks": [{"on":"person id, or owner","what":"${MARK_KINDS.join("|")}","where":"${SPOTS.join("|")}","text":"only for words: what was written, a few words"}],
 "washed": ["person id, or owner: whoever washed or was washed this turn"],
 "beat": [{"on":"person id, or owner","what":"${Object.keys(BEATS).join("|")}"}]`;

export const MARKS_RULES = `marks: record what this turn left on someone's body that would still be there afterwards, like cum, spit, a sole print, welts from a cane, lipstick or something written on them, and where it is. Only record what the prose actually put on the page. Record whose body it's on, not who did it.
beat: record at most one, and only when the prose has a body doing something big and physical worth seeing, like a full shudder, going limp, being overwhelmed, being shocked stiff, being blissed out, shrinking from humiliation, or looming over someone. Pick the closest from the list even if it's strange, because the strange ones are wanted. It's usually empty.`;

/** Apply the bookkeeper's fields. Returns notes. */
export function applyMarks(s: SaveState, d: { marks?: { on?: string; what?: string; where?: string; text?: string }[]; washed?: string[]; beat?: { on?: string; what?: string }[] }): void {
  for (const w of d.washed ?? []) wash(s, String(w));
  for (const m of (d.marks ?? []).slice(0, 6)) if (m?.on && m.what && m.where) mark(s, String(m.on), String(m.what), String(m.where), m.text);
  const b = (d.beat ?? [])[0];
  if (b?.on && b.what) beat(s, String(b.on), String(b.what));
}

/** Marks an act leaves, without asking anyone: who served whom, and whether anyone came. */
export function marksForAct(s: SaveState, p: Person, act: { id: string; group: string; needs?: string[]; you?: string } | undefined, finished: boolean): void {
  if (!act) return;
  const id = act.id.toLowerCase();
  // You serving her: her feet, her cock, her pussy.
  if (act.group === "feet" || act.group === "hers" || act.group === "service") {
    mark(s, "owner", "spit", "mouth");
    if (act.group === "feet") mark(s, p.id, "spit", "feet");
    if (finished && (act.needs ?? []).includes("dick")) mark(s, "owner", "cum", /anal|ass|fuck/.test(id) ? "ass" : "face");
    return;
  }
  if (act.group === "discipline") { mark(s, p.id, /whip|flog/.test(id) ? "welts" : /slap|face/.test(id) ? "handprint" : "welts", /whip|flog|spank/.test(id) ? "ass" : /slap|face/.test(id) ? "face" : "thighs"); return; }
  if (finished && act.you === "cock") mark(s, p.id, "cum", /oral|blow|throat|suck|mouth/.test(id) ? "mouth" : /facial|face/.test(id) ? "face" : /tit|breast/.test(id) ? "chest" : /anal|ass/.test(id) ? "ass" : "crotch");
  if (/choke|throat/.test(id)) mark(s, p.id, "handprint", "neck");
}
