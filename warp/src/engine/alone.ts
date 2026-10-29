/**
 * THE ONLY ONE.
 *
 * A player with one slave and every menial rented out heard her talk about "the other girls" all
 * the time. There weren't any. The scene digest said so, once, in a dry line; her own card said, in
 * vivid ones, that she "does the other girls' hair and gossips about who's been in whose bed", that
 * she "wrestles the other girls for the good blanket", that she wants "to be called to the owner's
 * bed more than anyone in the house". The tables that seed her life were written for a full house,
 * and so was every model asked to write her, which was never told she was alone. The card won.
 *
 * So while she is the only one: every model call is told so as a fact (through the owner context,
 * which rides on every call), her card loses the lines that only make sense with other slaves in the
 * house, and the acts that need a second slave aren't offered. None of it changes her save: buy a
 * second girl and her card reads as it was written.
 */
import type { Person, SaveState } from "./types";

/** The slaves in the house. Menials aren't people here; a rented-out menial is nobody's girl. */
export function houseSlaves(s: SaveState): Person[] {
  return Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");
}

/** Whether there is nobody else in the house for her to mean. */
export function isAlone(s: SaveState): boolean {
  return houseSlaves(s).length <= 1;
}

/** Fellow slaves, as a full house talks about them. Girls in the city, on the market or on the
 *  concourse are somebody else's and stay. */
const ELSEWHERE = String.raw`(?!\s+(?:in|on|at|from|of)\s+(?:the\s+)?(?:city|concourse|market|street|promenade|block|club|brothel|arcade|auction|other|another|next|rival|neighbou?ring))`;
export const OTHERS_RE = new RegExp([
  // "There's no other slave in the house" is the truth, and stays.
  String.raw`(?<!\bno\s+)\b(?:the\s+|her\s+)?other\s+(?:girls?|slaves?|women\s+(?:here|in\s+the\s+house))\b${ELSEWHERE}`,
  String.raw`\bthe\s+(?:girls|rest\s+of\s+(?:the\s+)?(?:girls|house|household|slaves))\b${ELSEWHERE}`,
  String.raw`\b(?:any|every|no)\s?one\s+(?:else\s+)?in\s+the\s+house\b`,
  String.raw`\banother\s+(?:girl|slave)?\s*of\s+(?:yours|his|hers|the\s+owner's)\b`,
  String.raw`\bthe\s+(?:owner's|house's|household's)\s+(?:girls|slaves|bedrooms)\b`,
  String.raw`\bwho\s+sleeps\s+where\b`,
  String.raw`\bwho(?:'s|\s+has)\s+been\s+(?:called|in\s+whose)\b`,
  String.raw`\b(?:the\s+)?(?:new|newer|older|younger)\s+girls?\b${ELSEWHERE}`,
  String.raw`\bin\s+whose\s+bed\b`,
].join("|"), "i");

/** A line with the parts that assume other slaves taken out, sentence by sentence (and item by item
 *  in a " | " list). A line that's nothing but such parts comes back empty. */
export function withoutOthers(text: string): string {
  if (!OTHERS_RE.test(text)) return text;
  const parts = text.split(/((?<=[.!?]["”]?)\s+|\s\|\s)/);
  let out = "";
  for (let i = 0; i < parts.length; i += 2) {
    const seg = parts[i] ?? "";
    if (!seg.trim() || OTHERS_RE.test(seg)) continue;
    out += (out ? (parts[i - 1] ?? " ") : "") + seg;
  }
  return out.trim();
}

/** For every model call, while she's the only one. */
export function aloneLine(s: SaveState): string {
  const all = houseSlaves(s);
  if (all.length > 1) return "";
  if (!all.length) return "THE HOUSEHOLD. The owner owns no slaves at all right now. Nobody in a scene talks about \"the other girls\" or the owner's slaves, because there aren't any.";
  const name = all[0].name.split(" ")[0];
  return `THE HOUSEHOLD, which is a fact. ${name} is the owner's only slave. There are no other girls in the house, no other slaves in the owner's bed, nobody to share a room, a meal, a bed or gossip with, and nobody to compare herself to or compete with. The owner's menials, if any, are bulk labour rented out or kept elsewhere, and she never deals with them. Never write ${name} mentioning, remembering, wanting, envying or doing anything with "the other girls" or anyone else "in the house"; the people around her are the owner, staff, guards and citizens. Nothing written about her (traits, habits, history, interests, what she wants) involves other slaves.`;
}
