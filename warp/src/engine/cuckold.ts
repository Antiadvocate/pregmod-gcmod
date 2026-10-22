/**
 * THE OTHER MAN — one of your women, given to someone who isn't you, a little more every week.
 *
 * This runs beside the arcology rather than through it. It is one woman, one man and you, and
 * nothing in it touches the city: no doctrine, no rumour, no rep. What it moves is her, and what
 * she thinks you are.
 *
 * Three numbers carry it:
 *
 *   · `fall` (0–100) is how far she has gone to him. Every night she spends with him moves it, and
 *     every chapter you push moves it more.
 *   · `pull` (−100 … +100) is whose she is when she closes her eyes. It starts at her devotion to
 *     you and he wears it down the longer he has her. It decides whether you can take her back at
 *     the end, and what she says when you try.
 *   · `yielded` (0–100) is how far YOU have gone: from the man who arranged it to the one who sits
 *     in the chair. It opens the last doors, and the endings read it.
 *
 * Why she does it is fixed at the start and colours every line she says: for you (she loves you
 * and you asked), for herself (she wanted a man like him and you gave her leave), or to hurt you
 * (she has hated you for a while and you just handed her the knife).
 *
 * The chapters are in data/cuckold.ts. They come due a week or two apart, and between them she is
 * out with him on her own nights, which the week report tells you about whether you want it to or
 * not.
 */
import type { Person, SaveState } from "./types";
import { rng } from "./rng";
import { clamp, shove } from "./psyche";
import { applyTreatment, read, type Treatment } from "./obedience";
import { remember } from "./memory";
import { tryConception, hasWomb } from "./pregnancy";
import { playerBody, hasCock } from "./you";
import { dickWord, dickCM, inches } from "./genitals";

export type Motive = "for_you" | "for_her" | "spite";
export type BullKind = "broker" | "brute" | "boy";
export type Ending = "called_off" | "reclaimed" | "lost" | "shared" | "his" | "sold" | "gone";

export interface Bull {
  kind: BullKind;
  name: string;
  /** How she says it. */
  short: string;
  age: number;
  /** The old game's 0–10 scale, like everyone's. Always more than yours. */
  dick: number;
}

export interface CuckLog { week: number; beat: string; title: string; chose: string; text: string }

export interface CuckState {
  her: string;
  motive: Motive;
  bull?: Bull;
  /** The chapter waiting, and the week it can be read. */
  beat: string;
  due: number;
  fall: number;
  pull: number;
  yielded: number;
  /** Nights she has spent with him, all told. */
  nights: number;
  /** Whether he may get her pregnant: you said yes, you said no, or you left it to her. */
  breeding?: "yes" | "no" | "hers";
  /** He took something from her you can't give back. */
  firsts: string[];
  /** You, in a cage, at her request or his. */
  caged?: boolean;
  /** Her nights with him have started. Set once he has had her. */
  seeing: boolean;
  started: number;
  log: CuckLog[];
  ended?: { week: number; ending: Ending; text: string };
}

export function cuckOf(s: SaveState): CuckState | undefined {
  return s.cuckold;
}

export function herOf(s: SaveState): Person | undefined {
  const c = s.cuckold;
  return c ? s.people[c.her] : undefined;
}

/** Whether she can be the one. Yours, grown, here, and you aren't somebody's property yourself. */
export function eligible(s: SaveState, p: Person): string | null {
  if (s.player.owned_by) return "you belong to someone yourself";
  if (p.status !== "owned" && p.status !== "indentured") return "she isn't yours to give";
  if (p.age < 18) return "she's too young";
  if (p.health.recovery_weeks > 0) return "she's recovering";
  const c = s.cuckold;
  if (c && !c.ended && c.her !== p.id) return `you're already giving ${s.people[c.her]?.name ?? "someone"} to him`;
  return null;
}

/** Story still running, or still going on in the background after an ending that keeps her with him. */
export function active(s: SaveState): boolean {
  const c = s.cuckold;
  return !!c && (!c.ended || c.ended.ending === "shared" || c.ended.ending === "his");
}

/** A chapter you can read now. */
export function ready(s: SaveState): boolean {
  const c = s.cuckold;
  return !!c && !c.ended && c.due <= s.arcology.week && !!herOf(s);
}

/* ── why she does it ─────────────────────────────────────────────────────────────────────────── */

export function motiveFor(s: SaveState, p: Person): Motive {
  const r = read(p, s.memory[p.id]);
  if (r.devotion < -10 || p.bond.resentment > 55) return "spite";
  const likesMen = p.persona.attracted_to === "men" || p.persona.attracted_to === "anyone";
  const into = p.persona.fetishes.some((f) => ["humiliation", "submissive", "masochist", "cumslut", "pregnancy"].includes(f.name) && f.strength >= 40);
  if (likesMen && (r.devotion < 45 || into || p.psyche.libido >= 65)) return "for_her";
  return "for_you";
}

/* ── the man ─────────────────────────────────────────────────────────────────────────────────── */

const FIRST: Record<BullKind, string[]> = {
  broker: ["Dorian", "Julian", "Maximilian", "Laurent", "Sebastian", "Adrian"],
  brute: ["Kade", "Bram", "Dusan", "Rourke", "Viktor", "Garrett"],
  boy: ["Theo", "Nico", "Jace", "Mateo", "Rory", "Eli"],
};
const LAST = ["Vance", "Castellan", "Marr", "Delacroix", "Brandt", "Szabo", "Whitlock", "Haldane", "Ferreira", "Novak"];

export function yourDick(s: SaveState): number {
  const d = playerBody(s).dick;
  return d && d > 0 ? d : 0;
}

export function makeBull(s: SaveState, kind: BullKind): Bull {
  const c = s.cuckold!;
  const r = rng(`bull:${s.id}:${c.her}:${kind}:${c.started}`);
  const first = r.pick(FIRST[kind]);
  const last = r.pick(LAST);
  const age = kind === "broker" ? r.int(38, 52) : kind === "brute" ? r.int(29, 41) : r.int(21, 25);
  // Always bigger than you, and bigger by more than you'd like; the brute most of all.
  const floor = kind === "brute" ? 5 : 4;
  const dick = clamp(Math.max(floor, yourDick(s) + (kind === "brute" ? 2 : 1)), 4, 10);
  return { kind, name: `${first} ${last}`, short: kind === "broker" ? last : first, age, dick };
}

export function bullDickWords(b: Bull): string {
  const w = dickWord(b.dick);
  return `${/^[aeiou]/.test(w) ? "an" : "a"} ${w} cock, ${inches(dickCM(b.dick))} of it`;
}

/** Yours, said the way she will say it when she compares. */
export function yourDickWords(s: SaveState): string {
  if (!hasCock(s)) return "your strap-on";
  return `your ${dickWord(yourDick(s))} cock`;
}

/* ── starting it ─────────────────────────────────────────────────────────────────────────────── */

export function begin(s: SaveState, p: Person): CuckState | null {
  if (eligible(s, p)) return null;
  const r = read(p, s.memory[p.id]);
  s.cuckold = {
    her: p.id,
    motive: motiveFor(s, p),
    beat: "ask",
    due: s.arcology.week,
    fall: 0,
    pull: clamp(Math.round(r.devotion), -60, 80),
    yielded: 0,
    nights: 0,
    firsts: [],
    seeing: false,
    started: s.arcology.week,
    log: [],
  };
  return s.cuckold;
}

/* ── what a choice does ──────────────────────────────────────────────────────────────────────── */

export interface Shift {
  fall?: number;
  pull?: number;
  yielded?: number;
  /** What it was to her. */
  her?: Treatment["kind"];
  size?: number;
  /** Her nervous system, directly. */
  relax?: number;
  arousal?: number;
  /** A night with him, counted. */
  night?: boolean;
  /** Something she'll keep. */
  memory?: { text: string; importance?: number; charge?: "warm" | "cold" | "sharp" | "dull" | "bright"; core?: boolean };
}

export function apply(s: SaveState, x: Shift, why: string): void {
  const c = s.cuckold!;
  const p = s.people[c.her];
  if (!p) return;
  const week = s.arcology.week;
  // She falls faster the further she has already gone, and slower if she never wanted men at all.
  const slow = p.persona.attracted_to === "women" || p.persona.attracted_to === "no one" ? 0.7 : 1;
  if (x.fall) c.fall = clamp(c.fall + (x.fall > 0 ? x.fall * slow * (1 + c.fall / 200) : x.fall), 0, 100);
  if (x.pull) c.pull = clamp(c.pull + x.pull, -100, 100);
  if (x.yielded) c.yielded = clamp(c.yielded + x.yielded, 0, 100);
  if (x.night) c.nights++;
  if (x.her) applyTreatment(p, { kind: x.her, size: x.size ?? 3, why }, week);
  if (x.relax) shove(p.psyche, x.relax);
  if (x.arousal) p.psyche.arousal = clamp(p.psyche.arousal + x.arousal, 0, 100);
  const mem = s.memory[p.id];
  if (x.memory && mem) remember(mem, { content: x.memory.text, week, importance: x.memory.importance ?? 6, charge: x.memory.charge ?? "sharp", who: [p.id], core: x.memory.core });
}

/** What he does to her body the first time, and keeps doing. It stays on her. */
export function takenBy(s: SaveState, p: Person): string[] {
  const c = s.cuckold!;
  const b = c.bull!;
  const out: string[] = [];
  if (p.body.vagina !== null) {
    if (p.body.hymen) { p.body.hymen = false; c.firsts.push("her virginity"); out.push("virginity"); }
    if (p.body.vagina < Math.min(6, b.dick - 1)) { p.body.vagina = Math.min(10, p.body.vagina + 1); out.push("stretched"); }
  } else {
    if (p.body.anus === 0) c.firsts.push("her ass");
    if (p.body.anus < Math.min(3, b.dick - 3)) { p.body.anus = Math.min(4, p.body.anus + 1); out.push("stretched"); }
  }
  return out;
}

/** He tries to breed her. Returns true if it took. */
export function seed(s: SaveState, p: Person, intensity: number): boolean {
  const c = s.cuckold!;
  if (!c.bull || !hasWomb(p)) return false;
  return !!tryConception(s, p, `bull:${c.bull.name}`, intensity);
}

export function pregnantByHim(s: SaveState, p: Person): boolean {
  const c = s.cuckold;
  return !!c?.bull && p.womb.fetuses.some((f) => f.father_id === `bull:${c.bull!.name}`);
}

/* ── the week ────────────────────────────────────────────────────────────────────────────────── */

/** Her nights out. Runs every week the story is going, and after an ending that leaves her with him. */
export function tickCuckold(s: SaveState): { text: string; person: string }[] {
  const c = s.cuckold;
  if (!c) return [];
  const p = s.people[c.her];
  if (!p || (p.status !== "owned" && p.status !== "indentured")) {
    if (!c.ended) c.ended = { week: s.arcology.week, ending: "gone", text: `${p?.name ?? "She"} is gone from the household, and so is ${c.bull?.short ?? "he"}.` };
    return [];
  }
  if (!active(s) || !c.seeing || !c.bull) return [];
  const b = c.bull;
  const week = s.arcology.week;
  const r = rng(`cuck-week:${s.id}:${week}`);
  const his = c.ended?.ending === "his";
  const nights = clamp(Math.round(c.fall / 22) + (his ? 2 : 0) + (r.chance(0.3) ? 1 : 0), 1, 7);
  c.nights += nights;
  c.fall = clamp(c.fall + nights * 0.7, 0, 100);
  c.pull = clamp(c.pull - nights * 0.5 * (0.4 + c.fall / 100), -100, 100);
  p.psyche.arousal = clamp(p.psyche.arousal - 10, 0, 100);
  if (c.motive === "for_her") shove(p.psyche, 0.2 * nights);
  if (c.motive === "for_you" && c.pull > 30) shove(p.psyche, -0.15 * nights);
  let bred = false;
  if (c.breeding === "yes" || (c.breeding === "hers" && c.fall >= 55)) bred = seed(s, p, Math.min(6, nights * 1.2));
  const n = p.name;
  const where = his ? `${b.short}'s` : "his";
  const pick = (xs: string[]) => r.pick(xs);
  const lines: string[] = [];
  lines.push(nights >= 6
    ? pick([`${n} slept at ${where} every night but one this week. She came back for clean clothes.`, `You saw ${n} twice this week, both times on her way out to ${b.short}.`])
    : nights >= 4
      ? pick([`${n} spent ${nights} nights with ${b.short} this week. She comes home walking carefully and goes straight to the shower.`, `${n} was at ${b.short}'s ${nights} nights out of seven. She doesn't say much about them unless you ask.`])
      : pick([`${n} spent ${nights === 1 ? "a night" : `${nights} nights`} with ${b.short} this week.`, `${b.short} sent for ${n} ${nights === 1 ? "once" : `${nights} times`} this week. She went.`]));
  if (c.pull < -40 && r.chance(0.5)) lines.push(pick([`When she's home she checks her tablet for his messages more than she looks at you.`, `She's started wearing a perfume he bought her. You didn't buy it, and she didn't ask.`]));
  if (bred) lines.push(`${n} has missed her cycle. The dates line up with ${b.short}, not you.`);
  return lines.map((text) => ({ text, person: p.id }));
}
