/**
 * HOW YOU TWO DO THINGS — the habits a relationship is made of, kept.
 *
 * Forty scenes in, the two of you have ways: he talks to her soles and not her face, and she
 * answers through them; he thanks her feet in front of people; she calls him Rabi and never
 * Master. None of that was written anywhere a later scene could read. It lived in a memory of hers
 * from week 76 that a scene about a dinner never recalled, so the dinner was written for two
 * strangers. Here it is kept, a short list per woman, read out of scenes as they're settled and
 * rebuilt whole when she's read properly, and it sits near the top of her card in every scene.
 */
import type { Person, SaveState } from "./types";
import { soundsLikeAnalysis } from "./style";

const MAX = 10;
const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

/** Add ways a scene settled or repeated. A near-repeat refreshes the old line instead. */
export function addWays(s: SaveState, p: Person, lines: string[]): string[] {
  const list = (p.ways ??= []);
  const added: string[] = [];
  for (const raw of lines.slice(0, 3)) {
    const text = String(raw ?? "").replace(/\s+/g, " ").trim().replace(/[.]+$/, "").slice(0, 200);
    if (text.length < 8 || soundsLikeAnalysis(text)) continue;
    const n = norm(text);
    const same = list.find((w) => norm(w.text) === n || (n.length > 20 && (norm(w.text).includes(n.slice(0, 24)) || n.includes(norm(w.text).slice(0, 24)))));
    if (same) { same.week = s.arcology.week; continue; }
    list.push({ text, week: s.arcology.week });
    added.push(text);
  }
  // The ones that keep coming up stay; the oldest unrepeated one goes.
  if (list.length > MAX) list.sort((a, b) => b.week - a.week).splice(MAX);
  return added;
}

/** Take out ways the player rejected. Matched loosely, since the writer copies them from her card. */
export function dropWays(p: Person, lines: string[]): number {
  const gone = lines.map((l) => norm(String(l ?? ""))).filter((n) => n.length >= 12);
  if (!gone.length || !p.ways?.length) return 0;
  const before = p.ways.length;
  p.ways = p.ways.filter((w) => { const n = norm(w.text); return !gone.some((g) => n === g || n.includes(g.slice(0, 30)) || g.includes(n.slice(0, 30))); });
  return before - p.ways.length;
}

/** Replace the whole list, from a reading of everything between you. */
export function setWays(s: SaveState, p: Person, lines: string[]): void {
  p.ways = [];
  for (const l of lines.slice(0, MAX)) addWays(s, p, [l]);
}

/** For her card. */
export function waysBrief(p: Person): string {
  const list = (p.ways ?? []).filter((w) => !soundsLikeAnalysis(w.text));
  if (!list.length) return "";
  return `HOW YOU TWO DO THINGS. These were settled between you over many scenes. Every scene keeps to them unless the player changes them in this one, and nobody acts like they're new. They're how things go between you, so show them happening. Nobody recites them or says "you always…". They're habits, so they give way: if one disagrees with a law of the arcology or one of her standing orders, the law or the order wins, and the player's words in the scene win over all of them:\n${list.map((w) => `· ${w.text}`).join("\n")}`;
}
