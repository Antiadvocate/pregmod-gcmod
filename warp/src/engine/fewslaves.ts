/**
 * THE ONLY ONES.
 *
 * An arcology owner keeps dozens. One who keeps one, or two, for months, is a story: the boards
 * decide he's broke, or a monk, or in love, the owner across the strait makes jokes about it, and
 * the Association wonders aloud what he's hiding. And the women themselves know. A slave who is
 * one of two is not one of forty: she's in every meal, every bed, every decision, and some of the
 * owner's weight settles on her. She starts to feel it. It leaks out in small ways (a citizen
 * corrected in the owner's name, a trader turned away at the door, a chair she sits in that
 * nobody else would), and she falls harder for the person who chose to keep only her.
 *
 * `power` per woman (0 … 100) is that feeling: it builds every week she's one of the few and drains
 * when the house fills up. `heard` (0 … 100) is how far the world has noticed. Neither gives her
 * rank over the owner; `dominion` moves only a little, and only once she's felt it a while.
 */
import type { Person, SaveState } from "./types";
import { read, applyTreatment } from "./obedience";
import { clamp, addState } from "./psyche";
import { remember } from "./memory";
import { startRumor } from "./social";
import { shiftDominion } from "./romance";
import { rng } from "./rng";
import { worldOf } from "./world";

export interface FewState {
  /** Weeks in a row the household has been one or two women. */
  weeks: number;
  since?: number;
  /** How much of the owner's weight each of them has started to feel, 0 … 100. */
  power: Record<string, number>;
  /** How far the world has noticed, 0 … 100. */
  heard: number;
  /** The thresholds of `heard` already announced. */
  told?: number[];
  /** What her power last did, by person: the week, so it doesn't happen every week. */
  leaked?: Record<string, number>;
}

export const fewOf = (s: SaveState): FewState => (s.player.few ??= { weeks: 0, power: {}, heard: 0 });

/** Your women, grown, who are yours: the household the world counts. */
export function theFew(s: SaveState): Person[] {
  return Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);
}

/** Whether you're keeping a small house right now, the way the world means it. */
export function keepingFew(s: SaveState): boolean {
  const n = theFew(s).length;
  return n >= 1 && n <= 2 && !s.player.owned_by;
}

const heardWord = (h: number) => h >= 75 ? "it's a running joke across the Free Cities and a scandal in the Association" : h >= 50 ? "the other arcologies talk about it" : h >= 25 ? "the city talks about it" : "people have started to notice";

/** What her power does when it gets out: one of these a week at most, once she's felt it a while. */
const LEAKS: ((p: Person, s: SaveState) => string)[] = [
  (p) => `${p.name} corrected a citizen's manners on the concourse, in your name, and he apologised to her.`,
  (p) => `A slave trader came to the door with a catalogue. ${p.name} told him you weren't buying, and he left.`,
  (p) => `${p.name} has started sitting in your chair when you're out. The staff don't tell her not to.`,
  (p) => `${p.name} sent back a dinner the kitchen made for you, because it wasn't how you like it. They made it again.`,
  (p) => `The guards on the penthouse floor have started calling ${p.name} "ma'am". Nobody told them to.`,
  (p) => `${p.name} answered your phone and told a caller you'd ring back when it suited you.`,
  (p, s) => `A woman on the boards says she saw ${p.name} on the promenade in ${s.arcology.name}'s colours, and that the crowd made way for her.`,
];

/** Weekly. Mutates the save; returns what got back to you. */
export function tickFew(s: SaveState): { text: string; tone: "good" | "neutral" | "warning"; weight: number; person?: string }[] {
  const f = fewOf(s);
  const week = s.arcology.week;
  const out: { text: string; tone: "good" | "neutral" | "warning"; weight: number; person?: string }[] = [];
  const few = theFew(s);
  if (!keepingFew(s) || week < 3) {
    // The house filled up, or emptied: what they had drains away, and they feel it go.
    if (f.weeks >= 4 && few.length > 2) {
      for (const p of few.filter((x) => (f.power[x.id] ?? 0) >= 30)) {
        p.bond.hope = clamp(p.bond.hope - 4, 0, 100);
        addState(p.psyche, "not the only one any more", week);
        out.push({ text: `${p.name} isn't one of the only ones any more, and she's taking it hard.`, tone: "warning", weight: 6, person: p.id });
      }
    }
    f.weeks = Math.max(0, f.weeks - 2);
    if (!f.weeks) f.since = undefined;
    for (const k of Object.keys(f.power)) f.power[k] = Math.round(f.power[k] * 0.6);
    f.heard = Math.max(0, f.heard - 3);
    return out;
  }
  f.weeks++;
  f.since ??= week;
  const r = rng(`few:${s.id}:${week}`);
  for (const p of few) {
    const rd = read(p, s.memory[p.id]);
    const was = f.power[p.id] ?? 0;
    const now = clamp(was + 2.5 + Math.max(0, rd.devotion) / 40 + (few.length === 1 ? 1.5 : 0), 0, 100);
    f.power[p.id] = Math.round(now * 10) / 10;
    // The person who chose to keep only her: she falls for that, faster if you're actually there.
    p.bond.bond = clamp(p.bond.bond + 0.8 + (p.bond.weeks_since_kindness <= 1 ? 1.2 : 0), -100, 100);
    p.bond.hope = clamp(p.bond.hope + 0.6, 0, 100);
    p.bond.indulged = (p.bond.indulged ?? 0) + 1.2;
    if (now >= 30) shiftDominion(s, p, 0.4, "she's one of the only ones");
    if (was < 40 && now >= 40) {
      addState(p.psyche, few.length === 1 ? "knows she's the only one" : "knows she's one of only two", week);
      const mem = s.memory[p.id];
      if (mem) remember(mem, { content: few.length === 1 ? "she realised she was the only woman the owner keeps, and what that makes her" : "she realised there were only two of them, and what that makes her", week, importance: 8, charge: "bright", core: true });
      applyTreatment(p, { kind: "recognition", size: 3, why: "kept as one of the only ones" }, week);
      out.push({ text: `${p.name} has worked out what it means to be ${few.length === 1 ? "the only woman you keep" : "one of only two"}. She carries herself differently.`, tone: "good", weight: 7, person: p.id });
    }
    const last = f.leaked?.[p.id] ?? -99;
    if (now >= 45 && week - last >= 3 && r.chance(0.3 + (now - 45) / 200)) {
      (f.leaked ??= {})[p.id] = week;
      out.push({ text: r.pick(LEAKS)(p, s), tone: "neutral", weight: 6, person: p.id });
    }
  }
  // The world notices, faster the more famous you are.
  f.heard = clamp(f.heard + 1.5 + f.weeks * 0.25 + s.arcology.rep / 4000, 0, 100);
  for (const at of [25, 50, 75]) {
    if (f.heard < at || f.told?.includes(at)) continue;
    (f.told ??= []).push(at);
    const names = few.map((p) => p.name).join(" and ");
    const headline = at === 25
      ? `Gossip pages ask why the owner of ${s.arcology.name} keeps only ${few.length === 1 ? "one slave" : "two slaves"}.`
      : at === 50
        ? `"Monk or lover?" The owner of ${s.arcology.name} and ${names} are the talk of the neighbouring arcologies.`
        : `Owners' Association members are said to be asking what the owner of ${s.arcology.name} is hiding behind ${names}.`;
    worldOf(s).headlines.push({ week, text: headline, tone: "warning" });
    startRumor(s, `the owner keeps only ${names}`, { salience: 6 + at / 25 });
    // The other powers take a view: the ones who keep thousands think it's soft, or strange.
    for (const n of s.arcology.neighbours) n.attitude = clamp(n.attitude + (n.doctrines.includes("paternalist") ? 3 : -2), -100, 100);
    out.push({ text: `News: ${headline}`, tone: "warning", weight: 7 });
  }
  return out;
}

/** For every prompt. */
export function fewBrief(s: SaveState): string {
  const f = s.player.few;
  if (!f || f.weeks < 3 || !keepingFew(s)) return "";
  const few = theFew(s);
  const names = few.map((p) => p.name).join(" and ");
  const felt = few.filter((p) => (f.power[p.id] ?? 0) >= 40).map((p) => p.name);
  return `THE OWNER KEEPS ONLY ${few.length === 1 ? "ONE SLAVE" : "TWO SLAVES"}: ${names}, for ${f.weeks} weeks now. Owners here keep dozens, and ${heardWord(f.heard)}: some say the owner is broke, some a monk, some in love. ${few.length === 1 ? `${names} knows she's the only one` : `${names} know they're the only two`}: closer to the owner than slaves usually get, in every meal and every bed, and falling harder for the person who chose to keep only them.${felt.length ? ` ${felt.join(" and ")} ${felt.length === 1 ? "has" : "have"} started to feel some of the owner's weight on ${felt.length === 1 ? "her" : "them"}: a little bolder, proud, possessive, sometimes speaking or deciding small things in the owner's name, and the staff and citizens let ${felt.length === 1 ? "her" : "them"}.` : ""} It gives them no rank over the owner and doesn't free them; it shows in small liberties, pride, and how they look at the owner.`;
}

/** For the city's boards. */
export function fewSource(s: SaveState): { id: string; label: string; text: string } | null {
  const f = s.player.few;
  if (!f || f.heard < 15 || !keepingFew(s)) return null;
  const names = theFew(s).map((p) => p.name).join(" and ");
  return { id: "owner:few", label: "the owner's household", text: `The owner keeps only ${names}, and has for ${f.weeks} weeks, when every other owner keeps dozens. ${cap(heardWord(f.heard))}. Theories: broke, impotent, a monk, a romantic, hiding something. People who've seen ${names} on the concourse say they walk like they own the place.` };
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
