/**
 * HOW YOU WRITE.
 *
 * A model writes like whatever it's been given to read, and in this game that was almost all the
 * game's own cards and the model's own earlier prose. The player's lines were a sliver at the bottom
 * marked PLAYER, read as something to answer and never as a way of writing. So two things are kept:
 *
 *   · what you type yourself (not the options you click, not "kiss her"), the last eighty lines;
 *     a handful of them go with every call that writes narration, chosen fresh each week so the
 *     same prefix is sent all week and the provider's cache keeps it;
 *   · narration you rewrote. The rewrite replaces the paragraph in the scene, it goes into the
 *     calls the same way, and the original is never sent to a model again. Both are kept as a pair
 *     for you to export.
 *
 * This is for the narration only. The women keep their own voices; nothing here goes near them.
 */
import type { SaveState } from "./types";
import { rng } from "./rng";

export interface Rewrite {
  id: string;
  week: number;
  /** When it was saved, ms. */
  at: number;
  /** What kind of scene: moment, encounter, scene, story. */
  where: string;
  person?: string;
  model?: string;
  original: string;
  rewrite: string;
}

export interface YourVoice {
  lines: { text: string; week: number }[];
  rewrites: Rewrite[];
}

export const voiceOf = (s: SaveState): YourVoice => {
  const v = (s.yourvoice ??= { lines: [], rewrites: [] });
  v.lines ??= []; v.rewrites ??= [];
  return v;
};

const KEEP = 80;

/** Keep a line the player typed, if there's enough of it to show how they write. Clicked options
 *  and short commands aren't. Returns whether it was kept. */
export function keepLine(s: SaveState, text: string, offered: string[] = []): boolean {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length < 50 || t.split(" ").length < 9) return false;
  if (offered.some((o) => o.trim().toLowerCase() === t.toLowerCase())) return false;
  const v = voiceOf(s);
  if (v.lines.some((l) => l.text === t)) return false;
  v.lines.push({ text: t.slice(0, 900), week: s.arcology.week });
  if (v.lines.length > KEEP) v.lines.splice(0, v.lines.length - KEEP);
  return true;
}

/** Keep a rewrite. The caller puts the rewrite in the scene in place of the original. */
export function saveRewrite(s: SaveState, r: Omit<Rewrite, "id" | "week" | "at">): Rewrite | null {
  const original = r.original.trim(), rewrite = r.rewrite.trim();
  if (!rewrite || rewrite === original) return null;
  const v = voiceOf(s);
  const out: Rewrite = { ...r, original, rewrite: rewrite.slice(0, 4000), id: `rw-${Date.now().toString(36)}-${v.rewrites.length}`, week: s.arcology.week, at: Date.now() };
  v.rewrites.push(out);
  return out;
}

/**
 * What goes with every narration call: a few of your lines and a few of your rewrites, picked once
 * a week. Empty until there's something to show.
 */
export function voiceBrief(s: SaveState): string {
  const v = s.yourvoice;
  if (!v || (!v.lines?.length && !v.rewrites?.length)) return "";
  const r = rng(`yourvoice:${s.id ?? ""}:${s.arcology.week}`);
  const lines = r.shuffle([...(v.lines ?? []).slice(-40)]).slice(0, 5);
  // The newest rewrite always, since it's the latest thing you corrected, and up to three others.
  const rw = v.rewrites ?? [];
  const picked = rw.length ? [rw[rw.length - 1], ...r.shuffle(rw.slice(0, -1)).slice(0, 3)] : [];
  const parts = [
    "HOW THE PLAYER WRITES. Write the narration in the player's register: the words they use, how crude they are, how long their sentences run, what they find funny. This is for the narration only. Every woman keeps her own voice and never starts talking like the player, and none of these lines are ever reused or put in the owner's mouth.",
    lines.length ? `Lines the player typed in earlier scenes:\n${lines.map((l) => `· ${l.text}`).join("\n")}` : "",
    picked.length ? `Narration the player rewrote the way it should read:\n${picked.map((x) => `· ${x.rewrite.replace(/\s*\n+\s*/g, " ")}`).join("\n")}` : "",
  ];
  return parts.filter(Boolean).join("\n\n");
}

/** Put a rewrite into the scene it came from, in place of the original, so the next turn is written
 *  on from your version and the original isn't sent to a model again. Returns whether it was found. */
export function rewriteInMoment(s: SaveState, momentId: string, original: string, rewrite: string): boolean {
  const m = (s.moments ?? []).find((x) => x.id === momentId);
  const line = m ? [...m.log].reverse().find((l) => l.role === "scene" && l.text.includes(original.trim())) : undefined;
  if (!line) return false;
  line.text = line.text.replace(original.trim(), rewrite.trim());
  return true;
}

/** Every pair, one JSON object a line, for keeping or for training on. */
export function rewritesJsonl(s: SaveState): string {
  return (s.yourvoice?.rewrites ?? []).map((x) => JSON.stringify({
    original: x.original, rewrite: x.rewrite, where: x.where, person: x.person ? s.people[x.person]?.name ?? x.person : undefined,
    model: x.model, week: x.week, saved: new Date(x.at).toISOString(),
  })).join("\n") + ((s.yourvoice?.rewrites ?? []).length ? "\n" : "");
}
