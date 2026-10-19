/**
 * THE SHARED CHAIR — what's left of your say once she holds your collar.
 *
 * Giving yourself to her doesn't have to mean giving her everything. You can ask to keep a hand
 * in running things, and whether she lets you is her call, out of who she is and what you are to
 * her. With a hand in, you do what you always did, and she watches: when she doesn't like what
 * you're doing, or wants it done her way, she stops it. Push her far enough and she takes the keys
 * back. Without a hand in, the screens are still there and you can see everything she's doing
 * with your arcology, but nothing you press does anything. You can ask again. She might say yes.
 */
import type { SaveState, Person } from "./types";
import type { Reign, ReignStyle } from "./reign";
import { read } from "./obedience";
import { rng } from "./rng";
import { clamp } from "./psyche";
import { remember } from "./memory";

/** Who runs which part of things, for her decisions about what you're doing. */
export type Domain = "people" | "laws" | "money" | "war";

export const DOMAIN_WORDS: Record<Domain, string> = { people: "the household", laws: "the laws", money: "the money", war: "the army" };

export type Hand = "owner" | "shared" | "locked";

/** How much say you have now. "owner" when nobody holds your collar. */
export function handOf(s: SaveState): Hand {
  const r = s.reign;
  if (!s.player.owned_by || !r || r.ended || r.keeper !== s.player.owned_by) return "owner";
  return r.hand ?? "locked";
}

const keeperOf = (s: SaveState): Person | undefined => (s.player.owned_by ? s.people[s.player.owned_by] : undefined);

/** Whether she'd let you keep a hand in, and why, from who she is and what you are to her. */
export function wouldShare(s: SaveState, h: Person, style: ReignStyle, favour: number): boolean {
  const base: Record<ReignStyle, number> = { reluctant: 0.95, doting: 0.8, playful: 0.6, stern: 0.4, cruel: 0.15, vengeful: 0.05 };
  const r = read(h, s.memory[h.id]);
  return base[style] + favour / 200 + (r.trust - 40) / 250 >= 0.5;
}

const SHARE_YES: Record<ReignStyle, (n: string) => string> = {
  reluctant: (n) => `${n} says yes before you've finished asking. She looks relieved.`,
  doting: (n) => `${n} says yes. "Of course you can. I'll be watching, that's all."`,
  playful: (n) => `${n} thinks about it and grins. "Fine. But when I say no, it's no."`,
  stern: (n) => `${n} agrees, on terms: you run things, she checks them, and her word is final.`,
  cruel: (n) => `${n} says yes, and you can tell she's looking forward to overruling you.`,
  vengeful: (n) => `${n} says yes. She doesn't say why, and that worries you more than a no would have.`,
};
const SHARE_NO: Record<ReignStyle, (n: string) => string> = {
  reluctant: (n) => `${n} says no, and looks miserable about it. She thinks you'd only take it all back.`,
  doting: (n) => `${n} says not yet. She wants you to rest and let her look after it.`,
  playful: (n) => `${n} laughs. "You gave it to me. Ask me again when you've earned it."`,
  stern: (n) => `${n} says no. You haven't shown her you can be trusted with it.`,
  cruel: (n) => `${n} says no, and enjoys saying it.`,
  vengeful: (n) => `${n} says no. "You had your turn."`,
};

/** Called once when her reign starts: did you ask to keep a hand in, and does she let you. */
export function settleHand(s: SaveState, h: Person, r: Reign): string {
  const asked = s.player.ask_hand !== false;
  delete s.player.ask_hand;
  if (!asked) { r.hand = "locked"; return ""; }
  r.asked = s.arcology.week;
  const yes = wouldShare(s, h, r.style, r.favour);
  r.hand = yes ? "shared" : "locked";
  if (!yes) r.locked_since = s.arcology.week;
  return (yes ? SHARE_YES : SHARE_NO)[r.style](h.name);
}

/** How long before you can ask again. 0 when you can. */
export function askWait(s: SaveState): number {
  const r = s.reign;
  if (!r) return 0;
  return Math.max(0, (r.asked ?? -99) + 3 - s.arcology.week);
}

/** Ask her for a hand back in running things. */
export function askForHand(s: SaveState): string {
  const r = s.reign, h = keeperOf(s);
  if (!r || !h || r.hand === "shared") return "";
  if (askWait(s)) return `${h.name} told you not to ask again so soon.`;
  r.asked = s.arcology.week;
  // Being overruled and then taking the keys back is fresh: she remembers why she took them.
  const recent = (r.overruled ?? []).filter((x) => s.arcology.week - x.week <= 6).length;
  const yes = wouldShare(s, h, r.style, r.favour - recent * 6);
  const mem = s.memory[h.id];
  if (mem) remember(mem, { content: `the owner asked for a say in running things again, and I said ${yes ? "yes" : "no"}`, week: s.arcology.week, importance: 5, charge: yes ? "warm" : "cold" });
  if (yes) { r.hand = "shared"; delete r.locked_since; }
  return (yes ? SHARE_YES : SHARE_NO)[r.style](h.name);
}

/** Give it all to her, keeping nothing back. */
export function giveHandUp(s: SaveState): string {
  const r = s.reign, h = keeperOf(s);
  if (!r || !h) return "";
  r.hand = "locked";
  r.locked_since = s.arcology.week;
  r.favour = clamp(r.favour + 10, -100, 100);
  return `You tell ${h.name} you don't want any of it. She takes the keys, and she's pleased with you for it.`;
}

/* ── her say over what you do ───────────────────────────────────────────────────────────────── */

const HARSH = /\b(sell|sold|whip|cane|punish|cell|arcade|brand|beat|kill|execut|break|confine|torture|starve|auction|dairy|milk)/i;
const SOFT = /\b(free|freedom|spa|rest|gift|release|pardon|kind|reward|praise|holiday|day off)/i;
const BIG = /\b(war|attack|invade|declare|ultimatum|coup|enact|repeal|sign|abolish|law|doctrine|adopt|abandon|build|buy|purchase|sell)/i;

const STYLE_BASE: Record<ReignStyle, number> = { reluctant: 0.03, doting: 0.07, playful: 0.12, stern: 0.2, cruel: 0.22, vengeful: 0.28 };

const OVERRULED: Record<ReignStyle, (n: string, what: string) => string> = {
  reluctant: (n, w) => `${n} stopped "${w}". She apologised for it, but she stopped it.`,
  doting: (n, w) => `${n} stopped "${w}". "Not that, love. Let me think about it."`,
  playful: (n, w) => `${n} caught "${w}" before it went through and cancelled it, laughing. She did something else instead and didn't tell you what.`,
  stern: (n, w) => `${n} overruled "${w}". She didn't explain, and you know better than to ask twice.`,
  cruel: (n, w) => `${n} let you get as far as "${w}" and then stopped it in front of the staff, so they'd all see who decides.`,
  vengeful: (n, w) => `${n} overruled "${w}". "No," she said. "We do it my way now."`,
};

/**
 * Whether she lets this through. `what` is what you pressed, in the button's own words. The same
 * thing asked the same week gets the same answer: asking again isn't a reroll.
 */
export function herSay(s: SaveState, domain: Domain, what: string): { ok: true } | { ok: false; line: string } {
  const hand = handOf(s);
  if (hand === "owner") return { ok: true };
  const r = s.reign!, h = keeperOf(s);
  if (!h) return { ok: true };
  const label = what.replace(/\s+/g, " ").trim().slice(0, 60) || DOMAIN_WORDS[domain];
  if (hand === "locked") return { ok: false, line: `${h.name} has the keys to ${DOMAIN_WORDS[domain]}. You can look, but you can't touch anything.` };

  let p = STYLE_BASE[r.style] - r.favour / 400 + (r.defied > r.obeyed ? 0.1 : 0);
  if (domain === "laws" || domain === "war") p += 0.08;
  if (BIG.test(label)) p += 0.05;
  const warm = r.style === "doting" || r.style === "reluctant" || r.style === "playful" || h.persona.conscience > 0.65;
  const cold = r.style === "cruel" || r.style === "vengeful" || h.persona.conscience < 0.35;
  if (HARSH.test(label)) p += warm ? 0.3 : cold ? -0.1 : 0.05;
  if (SOFT.test(label)) p += cold ? 0.3 : warm ? -0.05 : 0.05;
  // Her friends are hers to look after.
  for (const o of Object.values(s.people)) {
    if (o.id === h.id || o.status !== "owned" || !label.includes(o.name.split(" ")[0])) continue;
    const w = s.edges.find((e) => e.from === h.id && e.to === o.id)?.warmth ?? 0;
    if (w > 40 && HARSH.test(label)) p += 0.35;
    if (w < -30 && SOFT.test(label)) p += 0.3;
  }
  const roll = rng(`hand:${s.arcology.week}:${h.id}:${domain}:${label.toLowerCase()}`)();
  if (roll >= clamp(p, 0.01, 0.9)) return { ok: true };

  const line = OVERRULED[r.style](h.name, label);
  const week = s.arcology.week;
  // Already overruled this week: say it again, don't count it twice.
  if (!(r.overruled ??= []).some((x) => x.week === week && x.what === label)) {
    r.overruled.push({ week, what: label, line });
    if (r.overruled.length > 30) r.overruled.splice(0, r.overruled.length - 30);
    s.notifications.push({ id: `hand-${week}-${r.overruled.length}`, week, text: line, kind: "warning", person: h.id, seen: false });
  }
  return { ok: false, line };
}

/** Weekly. Overrule her often enough, or fall far enough out of favour, and she takes the keys;
 *  the soft ones sometimes hand them back on their own. */
export function tickHand(s: SaveState, h: Person, r: Reign): string | null {
  const week = s.arcology.week;
  if (r.hand === "shared") {
    const recent = (r.overruled ?? []).filter((x) => week - x.week <= 6).length;
    if (r.favour < -40 || (recent >= 4 && r.favour < 10) || (r.defied >= 3 && r.defied > r.obeyed * 2)) {
      r.hand = "locked";
      r.locked_since = week;
      return `${h.name} has taken the keys back. You can still see everything; you just can't change any of it.`;
    }
  } else if (r.hand === "locked" && r.locked_since !== undefined && week - r.locked_since >= 6) {
    if ((r.style === "reluctant" || r.style === "doting") && r.favour >= 30 && wouldShare(s, h, r.style, r.favour)) {
      r.hand = "shared";
      delete r.locked_since;
      return r.style === "reluctant" ? `${h.name} gave you the keys back. She's been asking you what to do anyway.` : `${h.name} gave you back a say in running things. "You've been good," she said.`;
    }
  }
  return null;
}

/* ── what reaches you, once she runs things ─────────────────────────────────────────────────── */

/** Which of these she'd pick herself, by who she is. */
export function herPick(s: SaveState, options: { id: string; label: string }[]): { id: string; label: string } | undefined {
  const r = s.reign, h = keeperOf(s);
  if (!r || !h || !options.length) return options[0];
  const warm = r.style === "doting" || r.style === "reluctant" || h.persona.conscience > 0.65;
  const cold = r.style === "cruel" || r.style === "vengeful" || h.persona.conscience < 0.35;
  const score = (l: string) => (HARSH.test(l) ? (cold ? 2 : warm ? -2 : 0) : 0) + (SOFT.test(l) ? (warm ? 2 : cold ? -2 : 0) : 0) + (/\b(refuse|ignore|nothing|wait|leave it)\b/i.test(l) && r.style === "stern" ? 1 : 0);
  return [...options].sort((a, b) => score(b.label) - score(a.label))[0];
}

/**
 * A decision that comes to you, once she holds your collar. With a hand in, she may overrule
 * what you picked. Locked out, what you pick is only advice: she takes it if she trusts you and
 * it suits her, and otherwise does what she'd have done. Returns the choice that actually
 * happens, and a line saying how it went, or none when it simply went your way.
 */
export function throughHer(s: SaveState, domain: Domain, chosen: { id: string; label: string }, options: { id: string; label: string }[]): { id: string; line: string } {
  const hand = handOf(s);
  const h = keeperOf(s), r = s.reign;
  if (hand === "owner" || !h || !r) return { id: chosen.id, line: "" };
  if (hand === "shared") {
    const v = herSay(s, domain, chosen.label);
    if (v.ok) return { id: chosen.id, line: "" };
    const hers = herPick(s, options.filter((o) => o.id !== chosen.id)) ?? chosen;
    return { id: hers.id, line: `${v.line} What she did instead: ${hers.label.replace(/^./, (c) => c.toLowerCase())}.` };
  }
  const t = read(h, s.memory[h.id]).trust;
  const listens = { reluctant: 0.9, doting: 0.6, playful: 0.4, stern: 0.35, cruel: 0.15, vengeful: 0.1 }[r.style] + (t - 40) / 200 + r.favour / 300;
  const yes = rng(`advice:${s.arcology.week}:${h.id}:${chosen.label.toLowerCase()}`)() < listens;
  const hers = yes ? chosen : herPick(s, options) ?? chosen;
  const line = hers.id === chosen.id
    ? `You told ${h.name} what you'd do. She did it.`
    : `You told ${h.name} what you'd do. She listened, and then did it her way: ${hers.label.replace(/^./, (c) => c.toLowerCase())}.`;
  r.favour = clamp(r.favour + (hers.id === chosen.id ? 1 : 0), -100, 100);
  return { id: hers.id, line };
}

/** For the people writing what reaches you: who decides, and how things get to you now. */
export function ownedBrief(s: SaveState): string {
  const hand = handOf(s);
  const h = keeperOf(s);
  if (hand === "owner" || !h) return "";
  return hand === "shared"
    ? `THE PLAYER IS ${h.name.toUpperCase()}'S SLAVE, AND STILL HAS A HAND IN RUNNING THINGS: things come to the player as they always did, but everyone knows ${h.name} can overrule them, and some people go to her instead. Between the two of them she decides; she tells the player, she doesn't ask them.`
    : `THE PLAYER IS ${h.name.toUpperCase()}'S SLAVE AND RUNS NOTHING: ${h.name} owns the arcology and decides. Things reach the player because people hope the player can reach her (they ask the player to put in a word), or because ${h.name} asks the player what they think, or because the player hears about it after. Write it that way: the player's choices are what they tell her, ask her, or do with what little they have. When ${h.name} has decided something, she tells the player; she doesn't ask their opinion or their permission for what's hers to decide, and she doesn't need them to agree. The player's choice is how they take it.`;
}
