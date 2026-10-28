/**
 * DEEDS — what a scene leaves behind once you end it.
 *
 * A conversation you play out and then end is read back as a DEED: one line of what you did, a set
 * of tags from a closed list, whether anyone else saw, what she will remember, a fact that is now
 * true of the world, and something that happens later because of it. The tags are what the engine
 * acts on. Each one changes her, the household, the city and the story in its own way, and each
 * one can come back as an event weeks later. The model reads the scene and picks the tags; it
 * cannot invent an effect, because only the tags below do anything.
 *
 * Deeds feed forward everywhere: the narrator's state document lists them, her card lists the ones
 * about her, story flags count them (`deed_<tag>`), the household hears about public ones, and the
 * world arcs and follow-up events read them.
 */
import { inventsLaw } from "./lawguard";
import { dedupeLines } from "./memory";
import type { Person, SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { applyTreatment, refresh, type Treatment } from "./obedience";
import { ownerSide, remember } from "./memory";
import { startRumor, moveEdge } from "./social";
import { clamp, shove } from "./psyche";
import { romanceOf, rungIndex, shiftDominion, LADDER } from "./romance";
import { reversalOf } from "./reversal";
import { DYNAMIC_EFFECTS, effectList } from "./dynamic";
import { personCard } from "./prompts";
import type { Moment } from "./moments";
import { hasWomb } from "./pregnancy";
import { sell } from "./market";
import { asFate, sameName, settle, settledBrief, weightBrief } from "./fates";
import { isOwnerName } from "./you";
import { findFace, meet } from "./faces";
import { note, tie } from "./others";
import { addWays } from "./ways";
import { RECORD_RULES, soundsLikeAnalysis } from "./style";

export interface Deed {
  id: string;
  week: number;
  person?: string;
  /** One line, past tense, second person: what you did. */
  summary: string;
  tags: string[];
  public: boolean;
  witnesses: string[];
  /** What came of it, as shown to you when it ended. */
  effects: string[];
  /** A fact now true of the world, added to canon. */
  fact?: string;
  /** Something that happens later because of this. */
  follow?: { due: number; situation: string; options: { label: string; effect: string; value?: string | number }[]; fired?: boolean };
  source: string;
  /** For a walk: which place it happened in. What happened there stays there. */
  where?: string;
  /** She took something you said as you giving yourself to her. Nothing happens until you say
   *  whether you meant it: "offered" waits on you, "taken" is done, "refused" it was a misreading. */
  collar?: "offered" | "taken" | "refused";
}

type Ctx = { s: SaveState; d: Deed; p?: Person; out: string[] };

interface TagDef {
  label: string;
  /** For the model: when to use it. */
  when: string;
  /** How much the rest of the household cares when they hear. */
  household?: { kind: Treatment["kind"]; size: number };
  apply: (c: Ctx) => void;
  /** The event it comes back as, weeks later, when the model didn't write one. */
  echo?: { after: [number, number]; situation: (s: SaveState, d: Deed, p?: Person) => string; options: { label: string; effect: string; value?: string | number }[] };
}

const nm = (p?: Person) => p?.name ?? "she";
const rep = (c: Ctx, n: number) => { c.s.arcology.rep = Math.max(0, c.s.arcology.rep + n); c.out.push(`${n >= 0 ? "+" : "−"}${Math.abs(n)} reputation`); };
const doctrine = (c: Ctx, id: string, n: number) => {
  const st = c.s.arcology.doctrines[id];
  if (!st) return;
  st.adoption = clamp(st.adoption + n, 0, 100);
  c.out.push(`${id.replace(/_/g, " ")} ${n >= 0 ? "gains" : "loses"} ground`);
};
const treat = (c: Ctx, kind: Treatment["kind"], size: number, why: string) => { if (c.p) applyTreatment(c.p, { kind, size, why }, c.s.arcology.week); };
const raise = (c: Ctx, to: (typeof LADDER)[number]) => {
  if (!c.p) return;
  const rom = romanceOf(c.p);
  if (rungIndex(rom.standing) < rungIndex(to)) { rom.standing = to; rom.since_week = c.s.arcology.week; c.out.push(`${c.p.name} is now ${to === "keeper" ? "the one who holds your collar" : to}`); }
};

/** THE CLOSED LIST. */
export const DEED_TAGS: Record<string, TagDef> = {
  owner_enslaved: {
    label: "you gave yourself to her as her slave",
    when: "the player offered or gave themself to her as her slave, knelt and took her collar, or swore to belong to her",
    household: { kind: "recognition", size: 2 },
    apply: (c) => {
      if (!c.p) return;
      raise(c, "keeper");
      const rom = romanceOf(c.p);
      rom.dominion = Math.max(rom.dominion, 70);
      c.s.player.owned_by = c.p.id;
      c.p.bond.hope = clamp(c.p.bond.hope + 25, 0, 100);
      c.p.bond.fear = clamp(c.p.bond.fear - 30, 0, 100);
      shove(c.p.psyche, 2);
      const rev = reversalOf(c.s);
      rev.deference = clamp(rev.deference + (c.d.public ? 25 : 12), 0, 100);
      rev.subject = c.p.id;
      if (c.s.story) c.s.story.supplication = true;
      doctrine(c, "supplication", 10);
      if (c.d.public) { rep(c, -600); rev.association = clamp(rev.association - 15, -100, 100); c.out.push("the Owners' Association hears about it"); }
      c.out.push(`${c.p.name} runs part of the household now`);
    },
    echo: { after: [1, 3], situation: (s, d, p) => `${nm(p)} has been wearing the key to your collar on a chain around her neck since the day you gave yourself to her. This morning she moved her things into the master suite without asking, and the other slaves have started bringing their questions to her instead of you. She's waiting in your study to find out whether you meant it.`,
      options: [{ label: "Kneel and tell her you meant every word", effect: "dominion_up", value: 15 }, { label: "Ask her to keep it private", effect: "recognition", value: 4 }, { label: "Take the key back", effect: "promise_broken", value: 9 }, { label: "Let her decide what happens next", effect: "dominion_up", value: 8 }] },
  },
  owner_submitted: {
    label: "you deferred to her",
    when: "the player handed her AUTHORITY, by obeying a decision of hers outside sex, asking her permission for something that's the owner's to decide, letting her decide something about the household, the city or other people, or backing down to her in an argument. It's never sex or worship. Kneeling to her feet, being fucked or used by her, begging in bed, or giving her free use of the owner's body counts as bottomed, not this",
    apply: (c) => {
      if (!c.p) return;
      shiftDominion(c.s, c.p, 12, c.d.summary);
      reversalOf(c.s).deference = clamp(reversalOf(c.s).deference + (c.d.public ? 8 : 3), 0, 100);
      doctrine(c, "supplication", 4);
      if (c.d.public) rep(c, -150);
      c.out.push(`${c.p.name} has more say over you`);
    },
    echo: { after: [2, 4], situation: (s, d, p) => `${nm(p)} has been testing how far the last time went. Tonight she's sitting in your chair when you come in, with her feet up on your desk, and she doesn't move.`,
      options: [{ label: "Kneel at her feet", effect: "dominion_up", value: 10 }, { label: "Tell her to get out of your chair", effect: "dominion_down", value: 10 }, { label: "Laugh and sit on the floor", effect: "recognition", value: 3 }] },
  },
  bottomed: {
    label: "you submitted to her in bed",
    when: "the player was sexually submissive with her, by kneeling to worship her feet or body, letting her top, fuck or use them, begging in bed, or giving her free use of their body. It's the owner's taste, started and stopped by the owner, and it gives her no say over anything else",
    // Submissive is not subservient: she's wanted, and that's all it is. No dominion moves.
    apply: (c) => { treat(c, "recognition", 2, c.d.summary); },
  },
  freed_her: {
    label: "you freed her", when: "the player freed her or signed her papers",
    household: { kind: "promise_kept", size: 4 },
    apply: (c) => { if (!c.p) return; c.p.status = "free"; c.p.exit_week = c.s.arcology.week; c.p.exit_note = c.d.summary; rep(c, c.d.public ? 200 : 50); doctrine(c, "paternalist", 5); c.out.push(`${c.p.name} is free`); },
  },
  promised_freedom: {
    label: "you promised her freedom", when: "the player promised to free her, someday or on a condition",
    household: { kind: "recognition", size: 1 },
    apply: (c) => { if (!c.p) return; c.p.bond.hope = clamp(c.p.bond.hope + 20, 0, 100); c.out.push(`${nm(c.p)} is counting on it`); },
    echo: { after: [4, 8], situation: (s, d, p) => `${nm(p)} brings it up again, quietly, while she's dressing you. "${d.summary.replace(/^You /, "you ")}," she says, and she remembers exactly what you said. She wants to know when.`,
      options: [{ label: "Keep your word", effect: "promise_kept", value: 9 }, { label: "Tell her not yet", effect: "recognition", value: 2 }, { label: "Tell her you never meant it", effect: "promise_broken", value: 10 }] },
  },
  promise_made: {
    label: "you promised her something", when: "the player promised her anything short of freedom, like a gift, a day off, protection, or to come back",
    apply: (c) => { if (!c.p) return; c.p.bond.hope = clamp(c.p.bond.hope + 8, 0, 100); },
    echo: { after: [2, 4], situation: (s, d, p) => `${nm(p)} hasn't forgotten what you promised her. She mentions it in passing, trying not to make it sound like she's keeping score.`,
      options: [{ label: "Do it now", effect: "promise_kept", value: 6 }, { label: "Put it off", effect: "promise_broken", value: 3 }, { label: "Deny you ever said it", effect: "promise_broken", value: 7 }] },
  },
  promise_broken: {
    label: "you broke your word to her", when: "the player went back on something they had promised",
    household: { kind: "promise_broken", size: 2 },
    apply: (c) => { treat(c, "promise_broken", 7, c.d.summary); c.out.push("every slave who hears will trust your promises less"); },
  },
  married_her: {
    label: "you married her or promised to", when: "the player married her, proposed, or swore to make her their wife",
    household: { kind: "recognition", size: 2 },
    apply: (c) => { raise(c, c.d.tags.includes("owner_enslaved") ? "keeper" : "betrothed"); if (c.d.public) doctrine(c, "paternalist", 4); },
    echo: { after: [2, 5], situation: (s, d, p) => `The registry office sends up the forms. ${nm(p)} has already filled in her half, in careful block capitals, and left yours blank on the desk.`,
      options: [{ label: "Sign them", effect: "promise_kept", value: 10 }, { label: "Leave them unsigned for now", effect: "recognition", value: 1 }, { label: "Tear them up", effect: "promise_broken", value: 12 }] },
  },
  gift: {
    label: "you gave her something", when: "the player gave her a gift, money, clothes, a room, a day off",
    apply: (c) => { treat(c, "kindness", 4, c.d.summary); },
  },
  gratitude: {
    label: "you thanked her", when: "the player thanked her or praised her for something she did",
    apply: (c) => { treat(c, "recognition", 4, c.d.summary); },
  },
  tenderness: {
    label: "you were tender with her", when: "the player held her, comforted her, slept beside her, looked after her",
    apply: (c) => { treat(c, "kindness", 3, c.d.summary); if (c.p) moveEdge(c.s.edges, c.p.id, "owner", { warmth: 3 }); },
  },
  confided: {
    label: "you told her something private", when: "the player confided in her, admitted weakness, or told her a secret about themself",
    apply: (c) => { treat(c, "recognition", 5, c.d.summary); if (c.p) moveEdge(c.s.edges, c.p.id, "owner", { trust: 4 }); c.out.push(`${nm(c.p)} knows something about you now`); },
    echo: { after: [3, 7], situation: (s, d, p) => `One of the other slaves repeats something to you that only ${nm(p)} could have known, the thing you told her. It's going around the slave quarters.`,
      options: [{ label: "Confront her", effect: "coercion", value: 5 }, { label: "Let it go", effect: "recognition", value: 2 }, { label: "Punish her for it publicly", effect: "cruelty", value: 7 }] },
  },
  she_confided: {
    label: "she told you a secret", when: "she told the player something she had been hiding, like her past, a plan, a feeling, or who she really is",
    apply: (c) => { if (c.p) moveEdge(c.s.edges, c.p.id, "owner", { trust: 5 }); treat(c, "recognition", 2, "you listened when she told you"); },
  },
  elevated: {
    label: "you gave her authority", when: "the player put her in charge of something or other slaves, or gave her a title",
    household: { kind: "coercion", size: 1 },
    apply: (c) => { if (!c.p) return; raise(c, "favourite"); shiftDominion(c.s, c.p, 6, c.d.summary); c.out.push("the other slaves notice who's in favour"); },
  },
  punished: {
    label: "you punished her", when: "the player punished her, beat her, confined her, or took something away",
    household: { kind: "coercion", size: 1 },
    apply: (c) => { treat(c, "coercion", 5, c.d.summary); if (c.p) c.p.bond.fear = clamp(c.p.bond.fear + 6, 0, 100); },
  },
  humiliated_her: {
    label: "you humiliated her", when: "the player mocked her, degraded her, or shamed her",
    household: { kind: "cruelty", size: 1 },
    apply: (c) => { treat(c, "cruelty", 5, c.d.summary); doctrine(c, "degradationist", c.d.public ? 4 : 1); if (c.d.public) rep(c, 100); },
    echo: { after: [3, 6], situation: (s, d, p) => `${nm(p)} has been different since. Quieter. This morning another slave found her crying in the laundry and came to you instead of her.`,
      options: [{ label: "Go to her", effect: "kindness", value: 5 }, { label: "Leave her there", effect: "cruelty", value: 3 }, { label: "Tell the other girl to mind her own business", effect: "coercion", value: 3 }] },
  },
  cruelty: {
    label: "you were cruel to her", when: "the player hurt her badly, tortured her, or did something she will not get over",
    household: { kind: "cruelty", size: 3 },
    apply: (c) => { treat(c, "cruelty", 9, c.d.summary); if (c.p) { c.p.bond.fear = clamp(c.p.bond.fear + 12, 0, 100); const m = c.s.memory[c.p.id]; if (m) remember(m, { content: ownerSide(c.d.summary, c.s.player.pronouns), week: c.s.arcology.week, importance: 9, charge: "sharp", core: true }); } },
    echo: { after: [4, 8], situation: (s, d, p) => `Your security chief brings you a note found under ${nm(p)}'s mattress. It's a list of your movements for the last two weeks, in her handwriting.`,
      options: [{ label: "Confront her with it", effect: "coercion", value: 6 }, { label: "Break her for it", effect: "cruelty", value: 9 }, { label: "Ask her what she wants", effect: "recognition", value: 5 }, { label: "Put it back and watch", effect: "nothing" }] },
  },
  mercy: {
    label: "you showed her mercy", when: "the player forgave her, let her off a punishment, or spared her",
    household: { kind: "kindness", size: 1 },
    apply: (c) => { treat(c, "kindness", 5, c.d.summary); if (c.p) c.p.bond.fear = clamp(c.p.bond.fear - 6, 0, 100); },
  },
  she_defied: {
    label: "she defied you and got away with it", when: "she refused an order or talked back and the player let it stand",
    household: { kind: "recognition", size: 1 },
    // Only if it really stood: a defiance that ended in a cell or a whipping didn't.
    apply: (c) => { if (!c.p || c.d.tags.some((t) => ["punished", "cruelty", "threatened_sale", "humiliated_her"].includes(t))) return; shiftDominion(c.s, c.p, 8, "she defied you and it stood"); c.out.push("the other slaves wonder what else they could get away with"); },
    echo: { after: [2, 4], situation: (s, d, p) => `Two of your other slaves refuse the same order ${nm(p)} refused, in the same words she used.`,
      options: [{ label: "Punish all three", effect: "coercion", value: 6 }, { label: "Let it go again", effect: "dominion_up", value: 5 }, { label: "Talk to her about it", effect: "recognition", value: 3 }] },
  },
  shared_her: {
    label: "you gave her to someone else", when: "the player gave or lent her to another person, a citizen, a guest, or other slaves",
    household: { kind: "coercion", size: 1 },
    apply: (c) => { treat(c, "coercion", 4, c.d.summary); if (c.d.public) rep(c, 150); },
  },
  public_spectacle: {
    label: "you made a show of it in public", when: "what happened was done where citizens or guests could see it",
    apply: (c) => { rep(c, 120); if (c.p) { c.p.fame.prestige = Math.max(c.p.fame.prestige, 1) as 1; c.p.fame.why ||= c.d.summary; } const rr = startRumor(c.s, c.d.summary, { about: c.p?.id, salience: 8 }); if (c.d.where) rr.where = c.d.where; c.out.push("the whole arcology is talking about it"); },
  },
  threatened_sale: {
    label: "you threatened to sell her", when: "the player threatened to sell her, or to send her to the arcade or the cellblock",
    household: { kind: "coercion", size: 1 },
    apply: (c) => { if (c.p) { c.p.bond.fear = clamp(c.p.bond.fear + 10, 0, 100); c.p.bond.hope = clamp(c.p.bond.hope - 8, 0, 100); } },
  },
  feet_worship: {
    label: "you worshipped her feet", when: "the player kissed, washed, massaged or worshipped her feet",
    apply: (c) => { treat(c, "recognition", 3, c.d.summary); doctrine(c, "podolatry", c.d.public ? 4 : 1); if (c.s.story && c.s.story.flags["feet_movement"] !== undefined) c.s.story.flags["feet_movement"] = clamp(Number(c.s.story.flags["feet_movement"]) + (c.d.public ? 5 : 1), 0, 100); },
  },
  breeding: {
    label: "you decided she'll carry your child", when: "the player decided to get HER pregnant or keep her pregnancy, but never when she's the one breeding the player",
    // She can only be taken off contraceptives if there's a womb for them to protect.
    apply: (c) => { if (!c.p || !hasWomb(c.p)) return; c.p.womb.contraceptives = false; doctrine(c, "repopulation", 2); c.out.push(`${nm(c.p)} is off contraceptives`); },
  },
  outside_deal: {
    label: "you made a deal with an outsider", when: "the player struck a bargain with a citizen, a rival, a trader or a faction during the scene",
    apply: (c) => { c.out.push("someone outside the household is owed something"); },
    echo: { after: [2, 5], situation: (s, d, p) => `The other side of the bargain you made comes to collect. ${d.summary}`,
      options: [{ label: "Pay what you owe", effect: "cash", value: -3000 }, { label: "Refuse", effect: "rep", value: -300 }, { label: "Send her to settle it", effect: "coercion", value: 4 }] },
  },
};

export const DEED_TAG_IDS = Object.keys(DEED_TAGS);

export function deedsOf(s: SaveState): Deed[] {
  return (s.deeds ??= []);
}

/* ── reading the scene ──────────────────────────────────────────────────────────────────────── */

export const CONSEQUENCE_SYSTEM = `You read a finished scene from Free Cities, an adult text game about owning an arcology, and record what it changed. Reply with JSON only.

{"summary":"one sentence, in the past tense and the second person, saying what the player did and what she did, and naming her, for example You knelt and gave yourself to Halyna as her slave, and she locked your collar.",
 "tags":["1 to 4 ids from the TAGS list that happened, most important first"],
 "public":false,
 "witnesses":["names of other people who were there, if any"],
 "her_memory":"one sentence in her own first person (I, me, my), with the player as 'the owner', saying what she'll remember, with who did what to whom exactly as the scene had it, so if the owner served her, the owner is the one serving",
 "lasting_fact":"one sentence that is now true of the world because of this, or empty",
 "sold":["names of the player's slaves that the player actually had sold or taken away to be sold in this scene, as an order carried out rather than a threat, or empty if none"],
 "threatened":["names of OTHER people in the scene (not her) whom the player threatened to sell, exile or punish, or empty if none"],
 "ways":["0 to 2 lines about a way the player and SHE do things together that this scene set up, confirmed or repeated, like a ritual, how they talk to each other, what she calls him or what always happens, written so a later scene can keep it, for example 'he talks to her soles, never her face, and she answers through them'. Leave it empty if the scene didn't settle anything"],
 "outsiders":[{"name":"full name of someone in the scene who is neither the player nor one of the player's slaves, and who mattered in it","what":"what they do, in a few words","remembers":"one sentence from their side of what happened, with the player as 'the owner'","toward":"warmer|colder|same, toward the owner after this","likes":"something the scene showed they like, or empty","dislikes":"something the scene showed they can't stand, or empty","tie":{"with":"name of one of the player's slaves, or 'the owner'","what":"what they are to them now, if that formed or changed in the scene, like her husband, her regular, or someone who owes the owner ¤20,000, or empty"}}],
 "dealt_with":[{"name":"full name of someone who is NOT the player's slave","fate":"dead|ruined|exiled|jailed|bought","how":"one plain sentence saying who did it and how"}],
 "follow_up":{"weeks":2,"situation":"3-6 sentences in the present tense about a moment that many weeks later which happens BECAUSE of this scene. It isn't a summary of how people feel. It's somebody named, in the room with the player, doing and saying something in their own voice. End where the player has to decide","options":[{"label":"what the player does, 2-8 words","effect":"one EFFECT id","value":"optional"}]}}

In the scene and the player's lines, "you" and "PLAYER" are the owner. Owners here sometimes kneel to their slaves and serve them, so never swap who served whom. Submissive is not subservient. An owner who kneels to her feet, lets her fuck or use him, or gives her his body is bottomed, and he still owns her. owner_submitted is only for handing her authority outside sex. Only tag what actually happened in the scene. The TAGS are about HER, the woman the scene is with, and what the player did to anyone else in the room goes in sold or threatened, never in her tags. owner_enslaved means the player really gave themself to her. A player saying she does NOT own them is the opposite, and is never owner_enslaved. Tag the player's actions, not what they considered. dealt_with is for people outside the household whom the player had killed, ruined, thrown out, locked up or paid off, whether it was done in the scene or ordered and agreed to by someone in it who can do it, like a guard, a governor, the security chief or a slave sent to do it. The owner's orders get carried out, so an order agreed to counts as done. A threat, a wish or a "maybe" is not dealt_with. Empty if none. public is true only if citizens, guests or other slaves saw it or will obviously hear. Write the summary, memory and follow-up in plain crude words (cock, pussy, ass, cum, fuck, piss and so on), and never in euphemisms or flowery phrasing. The follow-up must follow from this scene specifically, and give 3 or 4 different options, with one of them a way to back out.

${RECORD_RULES}

Each turn of the game is a week. The follow-up happens "weeks" weeks after the scene (1 to 8), not straight after it. The scene is over, the people in it have gone back to their lives, and what happened has had that long to sink in. Write where things stand THEN, meaning what it changed, what she has done about it since, and what people have said. Set it somewhere and at a time that fits that later day, and don't put it back in the scene's room, in the middle of the act, or on the same night. Only if the scene itself sets up something for the very next day, like a promise for tomorrow morning, an appointment or a hangover, should you use "weeks":0 and write it as the next day.`;

/** For reading the consequences: everything the player said (that's what the deed is made of),
 *  and the prose only from the last few beats. */
function transcript(m: Moment): string {
  const lastScenes = new Set(m.log.map((l, i) => (l.role === "scene" ? i : -1)).filter((i) => i >= 0).slice(-3));
  return m.log.map((l, i) => (l.role === "you" ? `PLAYER: ${l.text}` : lastScenes.has(i) || i === 1 ? l.text : "")).filter(Boolean).join("\n\n").slice(-6000);
}

interface Read {
  summary?: string; tags?: string[]; public?: boolean; witnesses?: string[]; her_memory?: string; lasting_fact?: string;
  sold?: string[]; threatened?: string[];
  dealt_with?: { name?: string; fate?: string; how?: string }[];
  ways?: string[];
  outsiders?: { name?: string; what?: string; remembers?: string; toward?: string; likes?: string; dislikes?: string; tie?: { with?: string; what?: string } }[];
  follow_up?: { weeks?: number; situation?: string; options?: { label?: string; effect?: string; value?: string | number }[] };
}

/** With no model: the player's own lines, matched against the tags. */
const KEYWORDS: [RegExp, string][] = [
  [/\b(enslave myself|i(?:'ll| will)? be your slave|i'm yours|take my collar|collar me|i belong to you|own me|make me yours|i submit to you|you own me)\b/i, "owner_enslaved"],
  [/\b(obey you|yes mistress|yes ma'am|as you say|you decide|whatever you decide|your call)\b/i, "owner_submitted"],
  [/\b(kneel|beg you|worship you|fuck me|use me|cum in me)\b/i, "bottomed"],
  [/\b(free you|you're free|sign your papers|your freedom)\b/i, "promised_freedom"],
  [/\b(i promise|i swear|you have my word)\b/i, "promise_made"],
  [/\b(marry|wife|propose)\b/i, "married_her"],
  [/\b(thank|well done|good job|proud of you)\b/i, "gratitude"],
  [/\b(hold|hug|comfort|stay with|sleep with me|kiss her)\b/i, "tenderness"],
  [/\b(gift|present|buy you|day off)\b/i, "gift"],
  [/\b(forgive|let you off|spare)\b/i, "mercy"],
  [/\b(punish|whip|cane|spank|cellblock)\b/i, "punished"],
  [/\b(worthless|slut|mock|laugh at|humiliat)\b/i, "humiliated_her"],
  [/\b(sell you|arcade)\b/i, "threatened_sale"],
  [/\b(feet|toes|soles)\b/i, "feet_worship"],
  [/\b(in charge|head girl|you'll run)\b/i, "elevated"],
  [/\b(my secret|never told anyone|confess)\b/i, "confided"],
];

const NEGATION = /\b(not|never|no|nor|doesn't|don't|didn't|isn't|won't|wouldn't|can't|ain't)\b|n't\b/i;

/** Whether the player's words say this, as opposed to saying it isn't so. A match counts only when
 *  nothing in the same sentence before it negates it: "it doesn't make you own me" is a denial,
 *  and it once handed a slave the owner's collar. */
export function affirms(text: string, re: RegExp): boolean {
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  for (const m of text.matchAll(g)) {
    const before = text.slice(0, m.index);
    const sentence = before.slice(Math.max(before.lastIndexOf("."), before.lastIndexOf("!"), before.lastIndexOf("?"), before.lastIndexOf("\n")) + 1);
    if (!NEGATION.test(sentence)) return true;
  }
  return false;
}

function offlineRead(m: Moment): Read {
  const mine = m.log.filter((l) => l.role === "you").map((l) => l.text).join(" \n ");
  const tags: string[] = [];
  for (const [re, t] of KEYWORDS) if (affirms(mine, re) && !tags.includes(t)) tags.push(t);
  if (tags.includes("owner_enslaved")) { const i = tags.indexOf("owner_submitted"); if (i >= 0) tags.splice(i, 1); }
  const last = m.log.filter((l) => l.role === "you").slice(-1)[0]?.text ?? m.title;
  const who = m.person ? m.title.replace(/^With (\S+).*/, "$1") : "";
  if (m.source === "walk") return { summary: `You went ${m.title.replace(/^Walking /, "down to ")}, and in front of everyone: "${last.replace(/"/g, "'").slice(0, 200)}"`, tags: tags.slice(0, 4), public: true };
  return { summary: `You said to ${who && who !== m.title ? who : "her"}: "${last.replace(/"/g, "'").slice(0, 200)}"`, tags: tags.slice(0, 4), public: false };
}

/** End a moment and make it count. Returns the deed, with what came of it. */
export async function concludeMoment(s: SaveState, m: Moment, opts?: { offline?: boolean; signal?: AbortSignal }): Promise<Deed | null> {
  if (m.concluded) return deedsOf(s).find((d) => d.id === m.concluded) ?? null;
  m.open = false;
  // A scene where you never said anything leaves nothing behind.
  if (!m.log.some((l) => l.role === "you")) return null;
  const p = m.person ? s.people[m.person] : undefined;

  let r: Read | null = null;
  if (modelsAvailable() && !opts?.offline) {
    const effects = effectList();
    const tags = Object.entries(DEED_TAGS).map(([id, t]) => `${id} — ${t.when}`).join("\n");
    const res = await call({
      system: CONSEQUENCE_SYSTEM,
      user: `${p ? `## HER\n${personCard(s, p, m.title)}\n\n` : ""}${[weightBrief(s), settledBrief(s, 6)].filter(Boolean).join("\n\n")}\n\n## THE SCENE (${m.title})\n${transcript(m)}\n\n## TAGS\n${tags}\n\n## EFFECT IDS (for follow_up options)\n${effects}`,
      model: s.models.bookkeeper_model || s.models.narrator_model, fallback: s.models.fallback_model, json: true, maxTokens: 900, signal: opts?.signal,
    });
    if (res.ok) r = parseJson<Read>(res.text);
  }
  const offline = offlineRead(m);
  if (!r || !r.summary) r = offline;
  // Keep the model honest: only known tags. Giving yourself away changes the whole game, and a
  // sentence said badly can read like it, so it is never applied from a reading: it waits on the
  // card until you say whether you meant it.
  const read_ = [...new Set((r.tags ?? []).filter((t) => DEED_TAGS[t]))].slice(0, 5);
  const offered = read_.includes("owner_enslaved") && !!p && s.player.owned_by !== p.id;
  const tags = read_.filter((t) => t !== "owner_enslaved");

  const deed: Deed = {
    id: `deed-${s.arcology.week}-${deedsOf(s).length}`,
    week: s.arcology.week, person: p?.id, summary: String(r.summary).slice(0, 300), tags,
    // A walk through the city happens in front of everybody.
    public: !!r.public || tags.includes("public_spectacle") || m.source === "walk",
    witnesses: (r.witnesses ?? []).map(String).slice(0, 6),
    effects: [], source: m.source, where: m.walk,
    fact: r.lasting_fact && !inventsLaw(s, String(r.lasting_fact)) && !soundsLikeAnalysis(String(r.lasting_fact)) ? String(r.lasting_fact).slice(0, 240) : undefined,
  };
  const fu = r.follow_up;
  const options = (fu?.options ?? []).filter((o) => o?.label && o.effect && DYNAMIC_EFFECTS[String(o.effect)]).slice(0, 4)
    .map((o) => ({ label: String(o.label).slice(0, 70), effect: String(o.effect), value: o.value }));
  // 0 is the next day and comes up now; otherwise a week is a turn, and it waits that long.
  const wait = Number(fu?.weeks);
  if (fu?.situation && options.length >= 2) deed.follow = { due: s.arcology.week + clamp(Number.isFinite(wait) ? Math.round(wait) : 2, 0, 8), situation: String(fu.situation).slice(0, 900), options };

  if (offered) deed.collar = "offered";
  applyDeed(s, deed, r.her_memory);
  deed.effects.push(...othersInScene(s, deed, r));
  deed.effects.push(...dealtWith(s, deed, r));
  deed.effects.push(...outsiders(s, deed, r));
  if (p && Array.isArray(r.ways)) for (const w of addWays(s, p, r.ways.map(String))) deed.effects.push(`between you now: ${w}`);
  if (offered) deed.effects.push(`${p!.name} is holding out a collar for you`);
  m.concluded = deed.id;
  if (deed.follow && deed.follow.due <= s.arcology.week) fireFollow(s, deed);
  return deed;
}

/** Your slaves, found by the name the scene used for them. */
function byName(s: SaveState, name: string): Person | undefined {
  const n = name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!n) return undefined;
  return Object.values(s.people).find((x) => (x.status === "owned" || x.status === "indentured") &&
    x.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/).some((part) => part === n || x.name.toLowerCase() === n));
}

/** What the player did in the scene to people other than her: a sale ordered in a scene is a sale,
 *  and a threat lands on the woman it was made to. */
export function othersInScene(s: SaveState, deed: Deed, r: { sold?: string[]; threatened?: string[] }): string[] {
  const out: string[] = [];
  const week = s.arcology.week;
  for (const name of (r.sold ?? []).map(String).slice(0, 4)) {
    const x = byName(s, name);
    if (!x || s.player.owned_by === x.id) continue;
    for (const f of Object.values(s.arcology.facilities)) { f.workers = f.workers.filter((w) => w !== x.id); if (f.manager === x.id) f.manager = undefined; }
    delete x.facility;
    x.assignment = "rest";
    s.asks = (s.asks ?? []).filter((a) => a.person !== x.id);
    s.events = s.events.filter((e) => e.person !== x.id);
    const { price } = sell(s, x);
    x.exit_note = `sold from the scene: ${deed.summary}`.slice(0, 240);
    startRumor(s, `the owner had ${x.name} taken to the dock and sold`, { about: x.id, salience: 8 });
    out.push(`${x.name} is sold, ¤${price.toLocaleString()}`);
  }
  for (const name of (r.threatened ?? []).map(String).slice(0, 4)) {
    const x = byName(s, name);
    if (!x || x.id === deed.person) continue;
    x.bond.fear = clamp(x.bond.fear + 10, 0, 100);
    x.bond.hope = clamp(x.bond.hope - 8, 0, 100);
    applyTreatment(x, { kind: "coercion", size: 4, why: deed.summary }, week);
    const xm = s.memory[x.id];
    if (xm) remember(xm, { content: `the owner threatened me: ${deed.summary.replace(/^You /, "the owner ")}`, week, importance: 8, charge: "sharp" });
    refresh(x, xm);
    out.push(`${x.name} is afraid of you`);
  }
  return out;
}

/** People outside the household the scene had dealt with. Never one of yours, never her. */
function dealtWith(s: SaveState, deed: Deed, r: Read): string[] {
  const out: string[] = [];
  for (const x of (r.dealt_with ?? []).slice(0, 3)) {
    const name = String(x?.name ?? "").trim();
    const fate = asFate(x?.fate);
    if (!name || !fate || byName(s, name) || isOwnerName(s, name)) continue;
    if (deed.person && s.people[deed.person]?.name.toLowerCase().includes(name.toLowerCase())) continue;
    out.push(...settle(s, name, fate, String(x?.how ?? deed.summary).slice(0, 200)));
  }
  return out;
}

/** People who aren't yours, kept on file with what they took away from it. */
function outsiders(s: SaveState, deed: Deed, r: Read): string[] {
  const out: string[] = [];
  for (const x of (r.outsiders ?? []).slice(0, 4)) {
    const name = String(x?.name ?? "").trim();
    if (!name || byName(s, name) || isOwnerName(s, name)) continue;
    const f = findFace(s, name) ?? Object.values(s.faces ?? {}).find((y) => sameName(y.name, name, y.short)) ?? meet(s, { name });
    if (!f || f.fate?.fate === "dead") continue;
    if (x.what && !f.what) f.what = String(x.what).slice(0, 80);
    if (x.remembers) note(s, f, String(x.remembers));
    if (x.likes) f.likes = String(x.likes).slice(0, 120);
    if (x.dislikes) f.dislikes = String(x.dislikes).slice(0, 120);
    const dir = String(x.toward ?? "").toLowerCase();
    if (dir.startsWith("warm")) f.toward = Math.min(100, (f.toward ?? 0) + 15);
    else if (dir.startsWith("cold")) f.toward = Math.max(-100, (f.toward ?? 0) - 15);
    const t = x.tie;
    if (t?.what && t.with) {
      const yours = byName(s, String(t.with));
      if (yours) { tie(f, String(t.what), yours.id); out.push(`${f.name} is ${String(t.what).replace(/^(her|his) /, `${yours.name.split(" ")[0]}'s `)} now`); }
      else if (/owner|you|player/i.test(String(t.with)) || isOwnerName(s, String(t.with))) { tie(f, String(t.what)); f.kept = true; }
    }
  }
  return out;
}

/** You meant it: she locks the collar. Everything giving yourself away does, done now. */
export function acceptCollar(s: SaveState, deedId: string, keepHand = false): string[] {
  const d = deedsOf(s).find((x) => x.id === deedId);
  const p = d?.person ? s.people[d.person] : undefined;
  if (!d || !p || d.collar !== "offered") return [];
  const out: string[] = [];
  d.collar = "taken";
  s.player.ask_hand = keepHand;
  d.tags = ["owner_enslaved", ...d.tags.filter((t) => t !== "owner_enslaved")];
  DEED_TAGS.owner_enslaved.apply({ s, d, p, out });
  const mem = s.memory[p.id];
  if (mem) remember(mem, { content: "the owner knelt and let me lock the collar on them", week: s.arcology.week, importance: 10, charge: "bright", core: true });
  const house = Object.values(s.people).filter((x) => (x.status === "owned" || x.status === "indentured") && x.id !== p.id && x.age >= 5);
  for (const h of d.public ? house : house.filter((x) => d.witnesses.some((w) => w.toLowerCase().includes(x.name.toLowerCase())))) {
    applyTreatment(h, { kind: "recognition", size: 2, why: `the owner gave themself to ${p.name}` }, s.arcology.week);
    moveEdge(s.edges, h.id, p.id, { warmth: -2, power: 3 });
  }
  const st = s.story;
  if (st) { st.flags.deed_owner_enslaved = Number(st.flags.deed_owner_enslaved ?? 0) + 1; st.flags.deed_owner_enslaved_who = p.id; }
  const e = DEED_TAGS.owner_enslaved.echo!;
  if (!d.follow || d.follow.fired) d.follow = { due: s.arcology.week + e.after[0], situation: e.situation(s, d, p), options: e.options };
  refresh(p, s.memory[p.id]);
  d.effects = d.effects.filter((x) => !/holding out a collar/.test(x)).concat(out);
  return out;
}

/** That isn't what you meant. She heard it wrong, and it's let go: nothing changes. */
export function refuseCollar(s: SaveState, deedId: string): void {
  const d = deedsOf(s).find((x) => x.id === deedId);
  if (!d || d.collar !== "offered") return;
  d.collar = "refused";
  d.effects = d.effects.filter((x) => !/holding out a collar/.test(x));
}

/** The collar she's holding out for you, if there is one. */
export function collarOffered(s: SaveState): Deed | undefined {
  return [...deedsOf(s)].reverse().find((d) => d.collar === "offered" && !!d.person && s.people[d.person]?.status !== "dead");
}

/** What a deed does, now. */
export function applyDeed(s: SaveState, deed: Deed, herMemory?: string): void {
  const p = deed.person ? s.people[deed.person] : undefined;
  const out: string[] = [];
  const c: Ctx = { s, d: deed, p, out };
  for (const t of deed.tags) DEED_TAGS[t]?.apply(c);

  // She remembers it, in her terms.
  const mem = p ? s.memory[p.id] : undefined;
  if (mem) remember(mem, { content: herMemory || ownerSide(deed.summary, s.player.pronouns), week: s.arcology.week, importance: deed.tags.length >= 2 ? 8 : 6, charge: deed.tags.some((t) => ["cruelty", "humiliated_her", "punished", "promise_broken", "threatened_sale"].includes(t)) ? "sharp" : "warm", core: deed.tags.includes("owner_enslaved") || deed.tags.includes("cruelty") });

  // The household: witnesses always know; everyone knows if it was public.
  const house = Object.values(s.people).filter((x) => (x.status === "owned" || x.status === "indentured") && x.id !== p?.id && x.age >= 5);
  const witnesses = house.filter((x) => deed.witnesses.some((w) => w.toLowerCase().includes(x.name.toLowerCase())));
  const hearers = deed.public ? house : witnesses;
  for (const h of hearers) {
    const hm = s.memory[h.id];
    if (hm) remember(hm, { content: `${witnesses.includes(h) ? "saw" : "heard"}: ${deed.summary.replace(/^You /, "the owner ")}`, week: s.arcology.week, importance: witnesses.includes(h) ? 6 : 4, charge: "cold" });
    for (const t of deed.tags) { const hh = DEED_TAGS[t]?.household; if (hh) applyTreatment(h, { kind: hh.kind, size: hh.size, why: `what the owner did with ${p?.name ?? "someone"}` }, s.arcology.week); }
    // Favour shown to one woman is watched by the rest.
    if (p && deed.tags.some((t) => ["owner_enslaved", "married_her", "elevated", "gift"].includes(t))) moveEdge(s.edges, h.id, p.id, { warmth: -2, power: 3 });
    refresh(h, s.memory[h.id]);
  }
  // The people who love her, or hate her, take what you did to her personally.
  if (p) {
    const hurt = deed.tags.some((t) => ["cruelty", "humiliated_her", "punished", "threatened_sale", "promise_broken", "shared_her"].includes(t));
    const kind = deed.tags.some((t) => ["freed_her", "married_her", "gift", "tenderness", "mercy", "gratitude", "elevated", "owner_enslaved", "feet_worship"].includes(t));
    const close: string[] = [], glad: string[] = [];
    for (const h of house) {
      const e = s.edges.find((x) => x.from === h.id && x.to === p.id);
      if (!e) continue;
      const knows = hearers.includes(h) || e.warmth > 45 || e.roles.length > 0;
      if (!knows) continue;
      if (e.warmth > 40 || e.roles.some((r) => /lover|protect|student|trainer|more/.test(r))) {
        if (hurt) { applyTreatment(h, { kind: "cruelty", size: 3, why: `what the owner did to ${p.name}` }, s.arcology.week); close.push(h.name); }
        else if (kind) { applyTreatment(h, { kind: "recognition", size: 2, why: `what the owner did for ${p.name}` }, s.arcology.week); close.push(h.name); }
      } else if (e.warmth < -35 || e.roles.some((r) => /rival|torment|owns her/.test(r))) {
        if (hurt) { applyTreatment(h, { kind: "recognition", size: 1, why: `the owner put ${p.name} in her place` }, s.arcology.week); glad.push(h.name); }
        else if (kind) { moveEdge(s.edges, h.id, p.id, { warmth: -4 }); glad.push(h.name); }
      }
    }
    if (close.length) out.push(`${close.join(" and ")} ${hurt ? "won't forgive you for it" : "is glad for her"}`.replace(" is glad", close.length > 1 ? " are glad" : " is glad"));
    if (glad.length) out.push(`${glad.join(" and ")} ${hurt ? "enjoyed hearing about it" : "hates her a little more for it"}`);
  }
  if (hearers.length) out.push(`${hearers.length === house.length && house.length > 1 ? "the whole household" : hearers.map((h) => h.name).join(", ")} ${hearers.length === 1 ? "knows" : "know"}`);
  if (deed.public && !deed.tags.includes("public_spectacle")) { const r = startRumor(s, deed.summary.replace(/^You /, "the owner "), { about: p?.id, salience: 7 }); if (deed.where) r.where = deed.where; }

  // A walk's lasting fact belongs to that place (it's kept on the deed and shown when you go back
  // there), not to the whole world: one restaurant shouldn't follow you into every district.
  if (deed.fact && deed.source !== "walk") { s.canon.push(deed.fact); if (s.canon.length > 60) s.canon.splice(0, s.canon.length - 60); out.push("it's part of the arcology's story now"); }

  // Story flags, so arcs and events can read what you did.
  const st = s.story;
  if (st) for (const t of deed.tags) { st.flags[`deed_${t}`] = Number(st.flags[`deed_${t}`] ?? 0) + 1; if (p) st.flags[`deed_${t}_who`] = p.id; }
  if (st) { st.log.push({ week: s.arcology.week, arc: "deed", title: p ? `With ${p.name}` : "A scene", chose: deed.tags.map((t) => DEED_TAGS[t]?.label).filter(Boolean).join("; ") || "it ended", text: deed.summary }); if (st.log.length > 200) st.log.shift(); }

  // Something comes of it later, if the model didn't already say what.
  if (!deed.follow) {
    const t = deed.tags.find((x) => DEED_TAGS[x]?.echo);
    const e = t ? DEED_TAGS[t].echo! : undefined;
    if (e) {
      const span = e.after[1] - e.after[0];
      deed.follow = { due: s.arcology.week + e.after[0] + (deedsOf(s).length % (span + 1)), situation: e.situation(s, deed, p), options: e.options };
    }
  }
  if (deed.follow) { const n = deed.follow.due - s.arcology.week; out.push(n <= 0 ? "something comes of this the next day" : `something will come of this in ${n} week${n === 1 ? "" : "s"}`); }
  if (p) refresh(p, s.memory[p.id]);
  deed.effects = out;
  deedsOf(s).push(deed);
  if (deedsOf(s).length > 150) s.deeds = deedsOf(s).slice(-150);
}

/** Weekly: what you did comes back. */
export function tickDeeds(s: SaveState): { text: string; person?: string }[] {
  const out: { text: string; person?: string }[] = [];
  // A collar nobody answered for a fortnight is put away again.
  for (const d of deedsOf(s)) if (d.collar === "offered" && s.arcology.week - d.week >= 2) refuseCollar(s, d.id);
  for (const d of deedsOf(s)) {
    const f = d.follow;
    if (!f || f.fired || f.due > s.arcology.week) continue;
    if (fireFollow(s, d)) out.push({ text: `What you did in week ${d.week} comes back: ${d.summary}`, person: d.person });
  }
  return out;
}

/** Put a deed's follow-up on the table as an event. False if she's gone and it no longer can be. */
function fireFollow(s: SaveState, d: Deed): boolean {
  const f = d.follow;
  if (!f || f.fired) return false;
  f.fired = true;
  const p = d.person ? s.people[d.person] : undefined;
  // She has to still be here for it to be about her.
  if (d.person && (!p || (p.status !== "owned" && p.status !== "indentured" && p.status !== "free"))) return false;
  s.events.push({
    id: `echo-${d.id}`, kind: "dynamic", person: d.person,
    seed: f.situation,
    // The effect notes are instructions for the model ("value is the amount, negative to spend"),
    // not words for the player; the label says what you do.
    options: f.options.map((o, i) => ({ id: `d${i}:${o.effect}:${o.value ?? ""}`, label: o.label })),
    week: s.arcology.week, severity: d.tags.includes("owner_enslaved") || d.tags.includes("cruelty") ? "major" : "notable",
  });
  return true;
}

/** How long ago, in the game's weeks: each turn is one. */
export function weeksAgo(week: number, now: number): string {
  const n = now - week;
  return n <= 0 ? "this week" : n === 1 ? "last week" : `${n} weeks ago`;
}

/** For the narrator: the things people in the arcology remember you doing. */
export function deedsBrief(s: SaveState, personId?: string): string {
  const list = deedsOf(s).filter((d) => !personId || d.person === personId);
  if (!list.length) return "";
  const weighty = list.filter((d) => d.public || d.tags.length >= 2 || d.tags.some((t) => ["owner_enslaved", "freed_her", "married_her", "cruelty", "promise_broken"].includes(t)));
  const pick = [...new Set([...weighty.slice(-6), ...list.slice(-4)])].slice(-8);
  return dedupeLines(pick.filter((d) => !inventsLaw(s, d.summary)).map((d) => `week ${d.week} (${weeksAgo(d.week, s.arcology.week)}): ${d.summary}${d.where ? ` (this was on a walk through ${d.where === "concourse" ? "the concourse" : `the ${d.where} district`}, and the people and places in it belong there)` : ""}${d.public ? " (everyone knows)" : ""}`)).map((l) => `· ${l}`).join("\n");
}
