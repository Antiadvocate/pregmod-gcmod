/**
 * THE OTHER MAN — one of your women, given to someone who isn't you, a little more every week.
 *
 * This runs beside the arcology rather than through it. It is one woman, one man and you, and
 * nothing in it touches the city: no doctrine, no rumour, no rep. What it moves is her, and what
 * she thinks you are.
 *
 * NOTHING HERE IS WRITTEN. Every chapter, every man, every choice and every outcome comes from
 * the model (engine/cuckwriter.ts), out of her card, who you are, and the story so far, so it reads
 * like her and like you, and not like a script. You can answer a chapter in your own words instead
 * of picking. What the engine keeps is everything that has to be true:
 *
 *   · the PHASE the story is in (choosing him, before he's had her, the affair, his offer), and
 *     which kinds of choice each phase allows or demands;
 *   · the MOVES, a closed table of what a choice can do. The model writes a choice (or reads
 *     yours) and tags it with a move, and the move is what happens to her, to you, to her body and
 *     to the numbers;
 *   · three numbers: `fall` (0–100, how far she's gone to him), `pull` (−100 … +100, whose she is
 *     when she closes her eyes, starting at her devotion to you) and `yielded` (0–100, how far
 *     YOU have gone);
 *   · why she agreed, fixed at the start from how she already feels about you: for you, for
 *     herself, or to hurt you;
 *   · her nights with him between chapters, which the week report counts.
 */
import type { Person, SaveState } from "./types";
import { rng, hash } from "./rng";
import { clamp, shove } from "./psyche";
import { applyTreatment, read, type Treatment } from "./obedience";
import { remember } from "./memory";
import { tryConception, hasWomb } from "./pregnancy";
import { playerBody, hasCock } from "./you";
import { dickWord, dickCM, inches } from "./genitals";
import { sell } from "./market";
import { valuePerson } from "./economy";

export type Motive = "for_you" | "for_her" | "spite";
export type Phase = "choose" | "tease" | "affair" | "offer";
export type Ending = "called_off" | "reclaimed" | "lost" | "shared" | "his" | "sold" | "gone";

export interface Bull {
  name: string;
  /** How she says it. */
  short: string;
  age: number;
  /** Who he is, as the model first wrote him. */
  who: string;
  /** How he looks, moves and talks, so he's the same man every chapter. */
  manner: string;
  /** The old game's 0–10 scale, like everyone's. Always more than yours. */
  dick: number;
}

/** A man the model offered, before you picked one. */
export interface Candidate { name: string; age: number; who: string; manner: string }

/** One choice in a chapter: written by the model, or typed by you. */
export interface Choice {
  label: string;
  move: string;
  /** For a "pick": the man. */
  man?: Candidate;
  /** You typed it. */
  own?: boolean;
}

/** The chapter waiting, as the model wrote it. */
export interface Chapter { title: string; scene: string; choices: Choice[]; model: string; week: number }

export interface CuckLog {
  week: number;
  title: string;
  scene: string;
  chose: string;
  own?: boolean;
  move: string;
  /** What the engine decided came of it, as plain facts. */
  facts: string[];
  /** What the model wrote happening. Empty until it's written. */
  text: string;
}

export interface CuckState {
  her: string;
  motive: Motive;
  bull?: Bull;
  phase: Phase;
  /** Chapters read in the current phase. */
  in_phase: number;
  /** The week the next chapter can be written. */
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
  /** You, in a cage, and he has the key. */
  caged?: boolean;
  /** Her nights with him have started. */
  seeing: boolean;
  started: number;
  chapter?: Chapter;
  log: CuckLog[];
  ended?: { week: number; ending: Ending };
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
  if (c && !c.ended && c.her !== p.id) return `you're already giving ${s.people[c.her]?.name ?? "someone"} to another man`;
  return null;
}

/** Story still running, or still going on in the background after an ending that keeps her with him. */
export function active(s: SaveState): boolean {
  const c = s.cuckold;
  return !!c && (!c.ended || c.ended.ending === "shared" || c.ended.ending === "his");
}

/** A chapter is due: written and waiting, or ready to be written. */
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

export function yourDick(s: SaveState): number {
  const d = playerBody(s).dick;
  return d && d > 0 ? d : 0;
}

export function bullFrom(s: SaveState, m: Candidate): Bull {
  // Always bigger than you, and by more than you'd like.
  const r = rng(`bull:${s.id}:${m.name}`);
  const dick = clamp(Math.max(4, yourDick(s) + r.int(1, 3)), 4, 10);
  const name = String(m.name ?? "").trim().slice(0, 40) || "a man";
  return { name, short: name.split(/\s+/)[0], age: clamp(Math.round(Number(m.age)) || 30, 18, 80), who: String(m.who ?? "").slice(0, 300), manner: String(m.manner ?? "").slice(0, 400), dick };
}

export function bullDickWords(b: Bull): string {
  const w = dickWord(b.dick);
  return `${/^[aeiou]/.test(w) ? "an" : "a"} ${w} cock, ${inches(dickCM(b.dick))}`;
}

/* ── starting it ─────────────────────────────────────────────────────────────────────────────── */

export function begin(s: SaveState, p: Person): CuckState | null {
  if (eligible(s, p)) return null;
  const r = read(p, s.memory[p.id]);
  s.cuckold = {
    her: p.id,
    motive: motiveFor(s, p),
    phase: "choose",
    in_phase: 0,
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

/** What he does to her body when he has her. It stays on her. Returns the facts. */
export function takenBy(s: SaveState, p: Person): string[] {
  const c = s.cuckold!;
  const b = c.bull!;
  const out: string[] = [];
  if (p.body.vagina !== null) {
    if (p.body.hymen) { p.body.hymen = false; c.firsts.push("her virginity"); out.push(`${b.short} took her virginity.`); }
    if (p.body.vagina < Math.min(6, b.dick - 1)) { p.body.vagina = Math.min(10, p.body.vagina + 1); out.push(`His cock stretched her pussy; she's looser for the owner now.`); }
  } else {
    if (p.body.anus === 0) { c.firsts.push("her ass"); out.push(`${b.short} took her anal virginity.`); }
    if (p.body.anus < Math.min(3, b.dick - 3)) { p.body.anus = Math.min(4, p.body.anus + 1); out.push(`His cock stretched her ass.`); }
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

export function offerPrice(s: SaveState, p: Person): number {
  const c = s.cuckold!;
  return Math.round(valuePerson(s, p) * (1.3 + Math.max(0, -c.pull) / 200) / 100) * 100;
}

/* ── the moves ───────────────────────────────────────────────────────────────────────────────
 * The only things a choice can do. The model writes the choice; the move is what happens. */

interface Ctx { s: SaveState; c: CuckState; p: Person; first: string }
export interface MoveResult { facts: string[]; shift?: Shift; end?: Ending; phase?: Phase }
export interface Move {
  id: string;
  /** For the model: what choosing it does, in a line. */
  does: string;
  phases: Phase[];
  /** Whether it can be offered now. */
  when?: (x: Ctx) => boolean;
  /** Whether a chapter now has to offer it. */
  must?: (x: Ctx) => boolean;
  run: (x: Ctx, choice: Choice) => MoveResult;
}

const M = (x: Ctx, a: number, b: number, c: number) => (x.c.motive === "for_you" ? a : x.c.motive === "for_her" ? b : c);
const firstTime = (x: Ctx) => x.c.phase === "tease" && (x.c.in_phase >= 1 || x.c.fall >= 20);
const canBreed = (x: Ctx) => hasWomb(x.p) && !x.c.breeding && !x.p.womb.fetuses.length && x.c.fall >= 45;

export const MOVES: Move[] = [
  { id: "pick", phases: ["choose"], does: "the owner picks this man; he's the one from now on",
    run: (x, ch) => {
      x.c.bull = bullFrom(x.s, ch.man!);
      return { phase: "tease", facts: [`The owner chose ${x.c.bull.name}.`], shift: { fall: 4, yielded: 5, arousal: x.c.motive === "for_her" ? 15 : 5 } };
    } },
  { id: "never", phases: ["choose"], does: "the owner takes it back; it never happens", must: () => true,
    run: () => ({ end: "called_off", facts: ["The owner called it off before it began."] }) },
  { id: "push", phases: ["tease", "affair"], does: "the owner pushes her further toward him than she's gone so far",
    run: (x) => ({ facts: x.c.phase === "affair" ? ["She spent the night with him."] : [], shift: { fall: 11, yielded: 8, pull: -5, arousal: 25, night: x.c.phase === "affair" } }) },
  { id: "watch", phases: ["tease", "affair"], does: "the owner lets it happen and watches, or listens, saying nothing",
    run: (x) => ({ facts: x.c.phase === "affair" ? ["She spent the night with him."] : [], shift: { fall: 7, yielded: 7, arousal: 15, night: x.c.phase === "affair" } }) },
  { id: "hold", phases: ["tease", "affair"], does: "the owner pulls her back toward them a little: claims her, refuses him something, or is tender with her",
    run: (x) => ({ facts: [], shift: { pull: M(x, 6, 2, 1), fall: -2, her: x.c.motive === "for_you" ? "kindness" : x.c.motive === "for_her" ? "neglect" : undefined, size: 2 } }) },
  { id: "stop", phases: ["tease"], does: "the owner ends it before he's had her; she stays only the owner's", must: () => true,
    run: (x) => ({ end: "called_off", facts: ["The owner ended it before the other man had her."], shift: { pull: 6, her: x.c.motive === "for_her" ? "neglect" : "kindness", size: 2 } }) },
  { id: "first", phases: ["tease"], does: "he fucks her for the first time, with the owner watching or knowing", when: firstTime, must: (x) => x.c.in_phase >= 3,
    run: (x) => {
      const facts = [`${x.c.bull!.short} fucked her for the first time.`, ...takenBy(x.s, x.p)];
      x.c.seeing = true;
      if (hasWomb(x.p)) facts.push(seed(x.s, x.p, 2) ? "He came inside her without protection, and she conceived (nobody knows yet)." : "He came inside her without protection.");
      return { phase: "affair", facts, shift: { fall: 16, yielded: 12, night: true, pull: -7, relax: x.c.motive === "for_you" ? -1.5 : 1,
        memory: { text: `${x.c.bull!.short} took ${x.first} for the first time, with the owner's leave`, importance: 9, charge: x.c.motive === "for_you" ? "sharp" : "bright", core: true } } };
    } },
  { id: "clean", phases: ["affair"], does: "the owner licks his cum out of her afterwards", when: (x) => x.c.yielded >= 20,
    run: (x) => ({ facts: ["The owner cleaned the other man's cum out of her with their mouth."], shift: { fall: 8, yielded: 18, arousal: 25, pull: x.c.motive === "for_you" ? 2 : -6,
      memory: { text: `The owner licked ${x.c.bull!.short}'s cum out of ${x.first}`, importance: 8, charge: x.c.motive === "spite" ? "bright" : "sharp", core: true } } }) },
  { id: "cage", phases: ["affair"], does: "the owner locks their own cock in a chastity cage and gives the other man the key", when: (x) => hasCock(x.s) && !x.c.caged && x.c.yielded >= 30,
    run: (x) => { x.c.caged = true; return { facts: [`The owner is locked in a cage; ${x.c.bull!.short} has the key.`], shift: { fall: 10, yielded: 22, pull: -10, arousal: 20, night: true,
      memory: { text: `The owner gave ${x.c.bull!.short} the key to the owner's cage`, importance: 9, charge: x.c.motive === "for_you" ? "sharp" : "bright", core: true } } }; } },
  { id: "punish", phases: ["affair"], does: "the owner punishes her for what she's becoming",
    run: (x) => ({ facts: ["The owner punished her. She went to the other man afterwards."], shift: { pull: M(x, -5, -10, -15), fall: M(x, 5, 5, 10), her: "cruelty", size: 4, night: true } }) },
  { id: "breed_yes", phases: ["affair"], does: "the owner lets him try to get her pregnant", when: canBreed,
    run: (x) => { x.c.breeding = "yes"; x.p.womb.contraceptives = false; const took = seed(x.s, x.p, 6);
      return { facts: [took ? "He bred her, and she is pregnant with his child." : "He's trying to breed her; it hasn't taken yet."], shift: { fall: 12, yielded: 14, pull: -10, night: true, her: x.c.motive === "for_her" ? "recognition" : undefined, size: 4 } }; } },
  { id: "breed_hers", phases: ["affair"], does: "the owner leaves it to her whether he gets her pregnant", when: canBreed,
    run: (x) => { x.c.breeding = "hers"; return { facts: ["Whether he breeds her is up to her now."], shift: { fall: 6, yielded: 8 } }; } },
  { id: "breed_no", phases: ["affair"], does: "the owner forbids it and puts her on contraceptives", when: canBreed,
    run: (x) => { x.c.breeding = "no"; x.p.womb.contraceptives = true; return { facts: ["She's on contraceptives, by the owner's order."], shift: { pull: M(x, 5, -8, -4), her: x.c.motive === "for_you" ? undefined : "promise_broken", size: 2 } }; } },
  { id: "sell", phases: ["offer"], does: "the owner sells her papers to him; she leaves with him", must: () => true,
    run: (x) => {
      const price = offerPrice(x.s, x.p);
      const before = x.s.arcology.cash;
      sell(x.s, x.p);
      x.s.arcology.cash = before + price;
      x.p.exit_note = `sold to ${x.c.bull!.name} for ¤${price.toLocaleString()}`;
      return { end: "sold", facts: [`The owner sold her to ${x.c.bull!.name} for ¤${price.toLocaleString()}. She leaves with him.`] };
    } },
  { id: "share", phases: ["offer"], does: "the owner keeps her and she keeps seeing him; nothing changes", must: () => true,
    run: () => ({ end: "shared", facts: ["She stays the owner's on paper and keeps spending her nights with him."], shift: { yielded: 8 } }) },
  { id: "his", phases: ["offer"], does: "the owner gives her to him in everything but the papers, and serves the two of them", when: (x) => x.c.yielded >= 50, must: (x) => x.c.yielded >= 50,
    run: (x) => ({ end: "his", facts: [`She's ${x.c.bull!.short}'s now in all but the papers. He moves in next to the owner's rooms; the owner serves them.`],
      shift: { yielded: 20, fall: 15, pull: -15, her: x.c.motive === "spite" ? "recognition" : undefined, size: 5,
        memory: { text: `The owner gave ${x.first} to ${x.c.bull!.short} in all but name, and serves the two of them`, importance: 10, charge: "bright", core: true } } }) },
  { id: "reclaim", phases: ["offer"], does: "the owner takes her back and ends it (whether she's still the owner's to take back is up to her)", must: () => true,
    run: (x) => x.c.pull >= 0
      ? { end: "reclaimed", facts: ["The owner took her back, and she came: she chose the owner over him."], shift: { pull: 15, her: x.c.motive === "for_you" ? "promise_kept" : "kindness", size: 5,
        memory: { text: `The owner took ${x.first} back from ${x.c.bull!.short}`, importance: 9, charge: "warm", core: true } } }
      : { end: "lost", facts: ["The owner took her back, but too late: she obeys and goes back to the owner's bed, and her heart stays with the other man for good."], shift: { her: "promise_broken", size: 4, pull: -10,
        memory: { text: `The owner took ${x.first} away from ${x.c.bull!.short} after she'd already given herself to him`, importance: 9, charge: "cold", core: true } } } },
];
export const MOVE_BY_ID: Record<string, Move> = Object.fromEntries(MOVES.map((m) => [m.id, m]));

function ctxOf(s: SaveState): Ctx | null {
  const c = s.cuckold;
  const p = c ? s.people[c.her] : undefined;
  return c && p ? { s, c, p, first: p.name.split(" ")[0] } : null;
}

/** The moves a chapter may offer now, and the ones it must. */
export function movesNow(s: SaveState): { may: Move[]; must: Move[] } {
  const x = ctxOf(s);
  if (!x) return { may: [], must: [] };
  const may = MOVES.filter((m) => m.phases.includes(x.c.phase) && (!m.when || m.when(x)));
  return { may, must: may.filter((m) => m.must?.(x)) };
}

/** Whether a choice can be made now. */
export function allowed(s: SaveState, ch: Choice): boolean {
  const x = ctxOf(s);
  const m = MOVE_BY_ID[ch.move];
  return !!x && !!m && m.phases.includes(x.c.phase) && (!m.when || m.when(x)) && (m.id !== "pick" || !!ch.man?.name);
}

/** Answer the chapter waiting: one of its choices, or something you typed that the model has
 *  read as a move. Returns the log entry, still to be written. */
export function answer(s: SaveState, choice: Choice): CuckLog | null {
  const x = ctxOf(s);
  const ch = x?.c.chapter;
  if (!x || !ch || x.c.ended || x.c.due > s.arcology.week || !allowed(s, choice)) return null;
  const move = MOVE_BY_ID[choice.move];
  const r = move.run(x, choice);
  if (r.shift) apply(s, r.shift, `${ch.title}: ${choice.label}`);
  const week = s.arcology.week;
  const entry: CuckLog = { week, title: ch.title, scene: ch.scene, chose: choice.label, own: choice.own, move: move.id, facts: r.facts, text: "" };
  x.c.log.push(entry);
  delete x.c.chapter;
  if (r.end) { x.c.ended = { week, ending: r.end }; return entry; }
  if (r.phase) { x.c.phase = r.phase; x.c.in_phase = 0; } else x.c.in_phase++;
  // The affair runs until she's far enough gone, or long enough, and then he makes his offer.
  if (x.c.phase === "affair" && (x.c.in_phase >= 7 || (x.c.fall >= 85 && x.c.in_phase >= 3))) { x.c.phase = "offer"; x.c.in_phase = 0; }
  x.c.due = week + (x.c.phase === "affair" ? 1 + (hash(`${s.id}:${week}`) % 2) : 1);
  return entry;
}

/* ── the week ────────────────────────────────────────────────────────────────────────────────── */

/** Her nights out, counted for the report. Runs every week the affair is going, and after an
 *  ending that leaves her with him. Plain facts; the story is told in the chapters. */
export function tickCuckold(s: SaveState): { text: string; person: string }[] {
  const c = s.cuckold;
  if (!c) return [];
  const p = s.people[c.her];
  if (!p || (p.status !== "owned" && p.status !== "indentured")) {
    if (!c.ended) c.ended = { week: s.arcology.week, ending: "gone" };
    return [];
  }
  if (!active(s) || !c.seeing || !c.bull) return [];
  const b = c.bull;
  const r = rng(`cuck-week:${s.id}:${s.arcology.week}`);
  const nights = clamp(Math.round(c.fall / 22) + (c.ended?.ending === "his" ? 2 : 0) + (r.chance(0.3) ? 1 : 0), 1, 7);
  c.nights += nights;
  c.fall = clamp(c.fall + nights * 0.7, 0, 100);
  c.pull = clamp(c.pull - nights * 0.5 * (0.4 + c.fall / 100), -100, 100);
  p.psyche.arousal = clamp(p.psyche.arousal - 10, 0, 100);
  if (c.motive === "for_her") shove(p.psyche, 0.2 * nights);
  if (c.motive === "for_you" && c.pull > 30) shove(p.psyche, -0.15 * nights);
  const lines = [`${p.name}: ${nights} night${nights === 1 ? "" : "s"} with ${b.short} this week.`];
  if ((c.breeding === "yes" || (c.breeding === "hers" && c.fall >= 55)) && seed(s, p, Math.min(6, nights * 1.2))) lines.push(`${p.name} is pregnant by ${b.short}.`);
  return lines.map((text) => ({ text, person: p.id }));
}
