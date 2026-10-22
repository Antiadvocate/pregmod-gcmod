/**
 * WHAT SHE WANTS FROM YOU — her appetites, once she owns you.
 *
 * Her reign was written as a list of chores: pour at her dinner, present the accounts, scrub a
 * floor. She has a body and tastes and a history with you, and owning you is the point at which
 * she gets to have all of it whenever she likes. This reads what she'd want (her cock or her
 * pussy, what she's into, what you two always do, what you've said you are) and turns it into
 * nights: the "she wants you" event, a line on your weekly list, and the model's own choices.
 */
import type { Person, SaveState } from "./types";
import { rng } from "./rng";
import { canSire, hasCock } from "./you";
import { hasWomb } from "./pregnancy";

export interface Want { text: string; public?: boolean; tags: string[] }

const fet = (p: Person, n: string) => p.persona.fetishes.find((f) => f.name === n)?.strength ?? 0;

/** Everything she might want from you, by who she is and what's between you. */
export function wantsOf(s: SaveState, h: Person): Want[] {
  const n = h.name.split(" ")[0];
  const cock = (h.body.dick ?? 0) > 0;
  const pussy = h.body.vagina !== null && h.body.vagina !== undefined;
  const between = `${(h.ways ?? []).map((w) => w.text).join(" ")} ${s.player.self ?? ""} ${(h.persona.quirk?.id ?? "")}`.toLowerCase();
  const feet = /feet|foot|sole|toe|arch/.test(between) || fet(h, "feet") >= 30;
  const humil = fet(h, "humiliation") >= 30 || /humiliat|tiny|small cock|small dick/.test(between);
  const hard = fet(h, "dom") + fet(h, "sadist") >= 40 || /gag|throat/.test(between);
  const cum = fet(h, "cumslut") >= 30 || /\bcum\b/.test(between);
  const shown = s.reign?.shown !== "private";
  const out: Want[] = [];
  const add = (text: string, tags: string[], pub = false) => out.push({ text, tags, public: pub });

  if (cock) {
    add(`${n} wants your mouth on her cock before she's out of bed, and she doesn't want to hear a word out of you until she's finished.`, ["cock", "oral"]);
    add(`${n} bends you over the end of her bed tonight and fucks your ass, slow, and makes you thank her for every inch of it.`, ["cock", "anal"]);
    if (hard) add(`${n} wants to fuck your throat tonight until you're drooling on her sheets, and she wants you to ask her for it first.`, ["cock", "rough"]);
    if (cum) add(`${n} wants to cum on your face this morning and have you wear it, dried, to whatever she has you doing today.`, ["cock", "cum"]);
    if (shown) add(`${n} wants you under the table at her meeting with her cock in your mouth, while she keeps talking.`, ["cock", "public"], true);
  }
  if (pussy) {
    add(`${n} sits on your face while she reads the morning reports, and she doesn't stop reading when she cums.`, ["pussy", "oral"]);
    add(`${n} wants your tongue in her pussy for as long as she feels like it tonight, and you don't get to touch yourself.`, ["pussy", "denial"]);
    if (fet(h, "pregnancy") >= 40 && hasWomb(h) && !h.womb.fetuses.length && canSire(s)) add(`${n} wants you in her bed every night this week, and she wants you to cum inside her every time. She's decided she's getting pregnant.`, ["breeding"]);
    if (fet(h, "buttslut") >= 40 && hasCock(s)) add(`${n} wants your cock in her ass tonight, and she isn't going to be quiet about it.`, ["anal"]);
  }
  if (feet) {
    add(`${n} puts her bare feet in your lap tonight and tells you to worship them until she says stop, and she's in no hurry.`, ["feet"]);
    add(`${n} wants you to jerk off onto her soles and then lick every drop off them while she watches.`, ["feet", "cum"]);
    add(`${n} makes you tell her feet, out loud, what you are, before she lets you touch them.`, ["feet", "humiliation"]);
    if (shown) add(`${n} wants her feet worshipped in front of the household tonight, properly, with your face on her soles where everyone can see.`, ["feet", "public"], true);
  }
  if (hard) add(`${n} ties you to the foot of her bed tonight and does whatever she likes to you, for as long as she likes.`, ["bondage"]);
  if (fet(h, "sadist") >= 40) add(`${n} wants to cane you tonight, and then fuck you while it still stings.`, ["pain"]);
  if (fet(h, "masochist") >= 40) add(`${n} wants you to hurt her tonight, exactly the way she tells you, and not one bit more.`, ["pain"]);
  if (humil) add(`${n} makes you strip and kneel in the corner of her room while her maid cleans around you, and then uses you right there.`, ["humiliation"]);
  if (fet(h, "boobs") >= 30) add(`${n} wants you sucking her tits in her lap while she does the accounts.`, ["boobs"]);
  if (h.body.lactation) add(`${n} wants you to nurse from her before she sleeps.`, ["milk"]);
  if (!out.length) add(`${n} wants you in her bed tonight, and she'll tell you what for when you get there.`, ["bed"]);
  return out;
}

/** This week's: picked by the week, skipping the last couple she had. */
export function pickWant(s: SaveState, h: Person, salt = ""): Want {
  const all = wantsOf(s, h);
  const used = new Set((s.reign?.wanted ?? []).slice(-2));
  const fresh = all.filter((w) => !used.has(w.text));
  return rng(`want:${s.arcology.week}:${h.id}${salt}`).pick(fresh.length ? fresh : all);
}
