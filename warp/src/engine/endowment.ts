/**
 * WHAT THEY SAY ABOUT IT.
 *
 * Every slave you've had has seen it, and slaves talk: to each other, to the staff, and through the
 * staff to the city. A big one gets talked about too, but a small one, left the way it was born, is
 * the one fact about the owner of an arcology that everyone below him enjoys knowing. How they say
 * it depends on what you are. An owner nobody fears hears the joke in the bars and reads it on the
 * boards. An owner who has people beaten for less hears nothing at all, and that silence, the look
 * held a beat too long and the girl biting the inside of her cheek, is how he knows.
 *
 * Surgery changes the joke rather than ending it: the city knows a bought size from a born one.
 *
 * `talk` (0 … 100) is how far it has got around. It grows with every slave who's seen it and every
 * time it's been on show, and it fades slowly when there's nothing new.
 */
import type { Person, SaveState } from "./types";
import { playerBody, hasCock } from "./you";
import { dickCM, dickWord, inches } from "./genitals";
import { selfTally } from "./self";
import { startRumor } from "./social";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { skill, practise } from "./player";

export interface Endowment {
  /** The size scale the body uses (1 tiny … 8 absurd); null without a cock. */
  dick: number | null;
  small: boolean;
  big: boolean;
  /** Enlarged by surgery, and from what. */
  bought: boolean;
  born?: number;
}

export function endowment(s: SaveState): Endowment {
  const d = hasCock(s) ? playerBody(s).dick ?? null : null;
  const from = s.player.surgery?.dick_from;
  const bought = d !== null && from !== undefined && d > from;
  return { dick: d, small: d !== null && d <= 2 && !bought, big: d !== null && d >= 5, bought, born: bought ? from : undefined };
}

/** How frightening the owner is, 0 … 1: what the household feels, and what the record says you do. */
export function menace(s: SaveState): number {
  const feared = (s.player.household_read?.feared ?? 0) / 100;
  const t = selfTally(s);
  const harsh = t.harsh + t.gentle > 0 ? t.harsh / (t.harsh + t.gentle) : 0.5;
  const intim = skill.intimidation(s);
  return clamp(feared * 0.5 + harsh * 0.3 + intim * 0.2, 0, 1);
}

/** Who has seen it: every slave of yours you've had sex with. */
export function whoHasSeen(s: SaveState): Person[] {
  return Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured" || p.status === "free") && p.age >= 18
    && Object.entries(p.acts ?? {}).some(([id, n]) => n > 0 && !["talk", "kissing", "sleeping together", "pedicure", "tickle feet", "tickle her"].includes(id)));
}

export function talkOfIt(s: SaveState): number {
  return clamp(Number(s.story?.flags["size_talk"] ?? 0), 0, 100);
}

function setTalk(s: SaveState, v: number): void {
  if (s.story) s.story.flags["size_talk"] = Math.round(clamp(v, 0, 100) * 10) / 10;
}

/** For every prompt: how people react to the owner's cock, which depends on its size, whether it
 *  was bought, how far it's got around, and how afraid of the owner they are. */
export function sizeLine(s: SaveState): string {
  const e = endowment(s);
  if (e.dick === null) return "";
  const cm = inches(dickCM(e.dick));
  if (e.bought) return ` The owner's cock was surgically enlarged, from ${dickWord(e.born ?? 1)} to ${dickWord(e.dick)} (about ${cm} now), and the people who knew it before know. Nobody laughs at its size any more. When it comes up, the joke is about the surgery, the money, and what he must have been like before.`;
  if (e.big) return ` The owner's cock is ${dickWord(e.dick)} (about ${cm}), and people who see it notice, the way people do, with a look, a comment or a comparison. It's never written as average.`;
  if (!e.small) return "";
  const m = menace(s);
  const talk = talkOfIt(s);
  const known = talk >= 30 ? "It's common knowledge in the arcology by now." : talk >= 10 ? "Word has started to get around." : "Only the women who've been with the owner know, so far.";
  const how = m >= 0.55
    ? "The owner is feared, so nobody ever says it to the owner's face. It shows in a glance held a little too long, a careful blank face, a look exchanged behind the owner's back, a slave biting the inside of her cheek, or a joke three floors down that stops when the owner walks in. Use it only where it fits, and rarely. Being careful means fewer words, not code. When someone is caught at it, what they said was plain and crude, like 'his cock is the size of my thumb', and the scene is about how frightened they are now. Never invent a coded joke, a riddle or a metaphor for it (pipes, ladles, small change) that the player would have to decode."
    : m >= 0.3
      ? "People are mostly careful about it. It shows in a smirk caught and wiped off, a comparison made quietly, or a slave who has to look away to keep a straight face. Someone bolder or drunker might say it."
      : "People don't hide that they've noticed. There's a smirk, a comparison, a slave who giggles and has to apologise, a joke at the owner's expense when they think it's safe, and now and then somebody who says it outright.";
  return ` The owner's cock is ${dickWord(e.dick)} (about ${cm}), it was born that way and never fixed, and people who see it notice, and talk. ${known} ${how} Slaves who like laughing at a cock (size humiliation) find it delightful, and a size queen is quietly disappointed. Never pretend it's bigger than it is.`;
}

/** For the city's boards. */
export function sizeSource(s: SaveState): { id: string; label: string; text: string } | null {
  const e = endowment(s);
  if (!e.small && !e.bought) return null;
  const talk = talkOfIt(s);
  if (talk < 10 && !e.bought) return null;
  const m = menace(s);
  if (e.bought) return { id: "owner:size", label: "the owner's surgery", text: `People know the owner had their cock surgically enlarged (from ${dickWord(e.born ?? 1)} to ${dickWord(e.dick!)}). The jokes are about the surgery, what it cost, who did it, and what it was like before.` };
  return {
    id: "owner:size", label: "the owner's cock",
    text: m >= 0.55
      ? `Everyone has heard the owner's cock is small (${dickWord(e.dick!)}, about ${inches(dickCM(e.dick!))}), from the slaves. The owner is feared, so nobody posts it plainly. It comes out as simple in-jokes anyone gets, a little finger emoji, "you know who", a post deleted an hour later, or somebody asking if anyone else heard the thing about the top floor.`
      : `Everyone has heard the owner's cock is small (${dickWord(e.dick!)}, about ${inches(dickCM(e.dick!))}), from the slaves who've had it. People joke about it openly, with nicknames, measurements, a slave's supposed review, and comparisons to the owner across the strait.`,
  };
}

const QUIET = [
  "One of the kitchen staff was caught holding up her little finger to the others. She dropped it the moment she saw you, and nobody in the room breathed.",
  "Your security chief hands you a list of graffiti cleaned off the lower levels this week, with one item quietly left off it. You ask. He goes pale.",
  "The laughter in the slave quarters stops when you walk in. It starts again, softly, after you've gone.",
  "A citizen at dinner said something about 'the smallest things in the arcology' and spent the rest of the evening looking terrified.",
];
const LOUD = [
  "Somebody has written a measurement next to your name on the wall of the lower concourse toilets. It's accurate.",
  "A comedian in the club on the promenade does ten minutes about the top floor. The room loves it.",
  "One of the girls you've had is telling the dormitory a story about you that has them all in stitches.",
  "A drunk on the concourse shouted something about you as your car went by, and the crowd laughed.",
];

/** Weekly. Returns what got back to you, if anything. */
export function tickEndowment(s: SaveState): { text: string; tone: "warning" | "neutral" | "bad"; weight: number }[] {
  const e = endowment(s);
  if (!e.small) return [];
  const seen = whoHasSeen(s);
  const before = talkOfIt(s);
  // Slaves talk; the more of them have seen it, the faster it goes. It fades when nothing feeds it.
  const grow = seen.length ? 1.2 + seen.length * 1.6 + (s.deeds ?? []).filter((d) => d.public && d.week === s.arcology.week - 1).length * 4 : 0;
  const m = menace(s);
  let talk = before + grow * (1 - m * 0.4) - (grow ? 0 : 0.5);
  setTalk(s, talk);
  talk = talkOfIt(s);
  const out: { text: string; tone: "warning" | "neutral" | "bad"; weight: number }[] = [];
  if (seen.length && before < 10 && talk >= 10) {
    startRumor(s, "the owner's cock is small", { from: seen[0].id, salience: m >= 0.55 ? 5 : 7, charge: -1 });
    out.push({ text: "The women you've had have started talking about your cock to the others.", tone: "warning", weight: 6 });
  }
  const r = rng(`size:${s.id}:${s.arcology.week}`);
  if (talk >= 20 && r.chance(0.18 + talk / 400)) out.push({ text: r.pick(m >= 0.55 ? QUIET : LOUD), tone: m >= 0.55 ? "neutral" : "bad", weight: 5 });
  return out;
}

/** What surgery would cost you, and what it does. Medicine makes it cheaper and gentler. */
export const ENLARGE_BASE = 45000;
export function enlargeCost(s: SaveState): number {
  return Math.round(ENLARGE_BASE * skill.medicine(s));
}

/** Have it done. Two steps up the scale, to at least "big"; a week off; the city finds out. */
export function enlarge(s: SaveState): { ok: boolean; line: string } {
  const b = playerBody(s);
  if (!hasCock(s) || b.dick === null) return { ok: false, line: "You don't have a cock to enlarge." };
  if (b.dick >= 7) return { ok: false, line: "There's nowhere further to go." };
  const cost = enlargeCost(s);
  if (s.arcology.cash < cost) return { ok: false, line: `It costs ¤${cost.toLocaleString()}.` };
  s.arcology.cash -= cost;
  const from = s.player.surgery?.dick_from ?? b.dick;
  const to = Math.min(7, Math.max(5, b.dick + 2));
  s.player.body = { ...s.player.body, dick: to };
  s.player.surgery = { dick_from: from, dick_week: s.arcology.week };
  practise(s, "medicine", 1);
  if (talkOfIt(s) >= 10) startRumor(s, "the owner had their cock made bigger", { salience: 8, charge: -1 });
  return { ok: true, line: `The surgeons take a day and keep you under for most of it. It's ${dickWord(to)} now. Everyone who knew it before will know it was bought.` };
}

/** Back the way it was born. */
export function undoEnlarge(s: SaveState): void {
  const from = s.player.surgery?.dick_from;
  if (from === undefined) return;
  s.player.body = { ...s.player.body, dick: from };
  delete s.player.surgery;
}
