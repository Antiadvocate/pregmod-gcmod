/**
 * WHAT SHE WANTS, AND WHETHER YOU DO IT.
 *
 * This is the loop that moves dominion, and dominion is the road to the top of the ladder. It is
 * also, on its own, the thing the genre has never had: a woman in your household who wants
 * specific things, asks for them in her own voice, and remembers the answer.
 *
 * An ask is generated from what she actually is — her fetish, her quirk, her flaw, her drive, what
 * her body is doing, what she has not had in a while, and how much standing she has to ask with.
 * It carries a MECHANICAL PAYLOAD, so granting one does something real rather than printing a nice
 * line, and the payload is the same closed vocabulary the events use. A model, when one is
 * configured, rewrites the wording in her voice; it never invents the payload. That split is why a
 * local model can be pointed at this without it being able to break anything.
 *
 * At high dominion the grammar changes. She stops asking.
 */
import type { Person, SaveState } from "./types";
import { ACT_BY_ID, FETISH_BY_ID } from "../data/intimacy";
import { clamp, shove, addState } from "./psyche";
import { read, applyTreatment } from "./obedience";
import { remember } from "./memory";
import { romanceOf, shiftDominion, herReach } from "./romance";
import { rng } from "./rng";
import { registerOf, say } from "./voice";
import { canDo, resolveAct } from "./intimacy";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";

export type AskKind = "intimate" | "comfort" | "household" | "personal" | "instruction";

export interface Ask {
  id: string;
  person: string;
  kind: AskKind;
  /** How she puts it. Rewritten in her voice by a model when one is configured. */
  text: string;
  /** What it costs you to say yes — money, standing, or nothing. */
  cash?: number;
  rep?: number;
  /** The closed-vocabulary payload. A model may rewrite `text`; it may never touch this. */
  payload: { kind: string; value?: string | number; target?: string };
  /** Dominion movement. Refusing an instruction costs far more than refusing a request. */
  gain: number;
  loss: number;
  week: number;
  /** Set once answered, for the record. */
  answered?: "granted" | "refused";
  /** Which request this is, for the cooldown. Separate from the payload because "take me off the
   *  pill" and "put me on it" are the same payload and different requests. */
  key?: string;
}

/** Everything an ask can actually DO. Closed on purpose: a generated ask is only ever a rewording
 *  of one of these, so nothing a model writes can reach past this list. */
const PAYLOADS: Record<string, (s: SaveState, p: Person, value?: string | number, target?: string) => string> = {
  act: (s, p, value) => {
    const act = ACT_BY_ID[String(value)];
    // Granting it means doing it: the act resolves for real, so it lands on her the way any other
    // time would, and she gets the extra for having asked and been heard.
    if (act && !canDo(p, act)) resolveAct(s, p, act.id);
    else p.psyche.arousal = clamp(p.psyche.arousal + 15, 0, 100);
    applyTreatment(p, { kind: "recognition", size: 4, why: `she asked for ${act?.name.toLowerCase() ?? "it"} and got it` }, s.arcology.week);
    return act ? `You did what she asked: ${act.what}.` : "You gave her what she asked for.";
  },
  rest: (s, p) => { p.assignment = "rest"; p.facility = undefined; applyTreatment(p, { kind: "kindness", size: 4, why: "a week off, because she asked" }, s.arcology.week); return "she has the week off"; },
  spa: (s, p) => { p.assignment = "rest in the spa"; p.facility = "spa"; applyTreatment(p, { kind: "kindness", size: 4, why: "sent to the spa on request" }, s.arcology.week); return "she is in the spa"; },
  clothes: (s, p, value) => { p.clothes = String(value); applyTreatment(p, { kind: "kindness", size: 2, why: "given something to wear that she picked" }, s.arcology.week); return `she is wearing ${value}`; },
  off_drugs: (s, p) => { p.health.aphrodisiacs = 0; applyTreatment(p, { kind: "kindness", size: 3, why: "taken off the aphrodisiacs" }, s.arcology.week); return "she is off the aphrodisiacs"; },
  contraceptives: (s, p, value) => { p.womb.contraceptives = value === "on"; applyTreatment(p, { kind: "recognition", size: 5, why: "given a say in whether she gets pregnant" }, s.arcology.week); return value === "on" ? "she is on contraceptives" : "she is off contraceptives, on purpose"; },
  unlock: (s, p) => { p.chastity = { vagina: false, anus: false, penis: false }; applyTreatment(p, { kind: "kindness", size: 3, why: "unlocked" }, s.arcology.week); return "she is unlocked"; },
  spare: (s, p, _v, target) => {
    const other = target ? s.people[target] : undefined;
    if (!other) return "nothing came of it";
    other.assignment = "rest";
    other.facility = undefined;
    applyTreatment(other, { kind: "kindness", size: 4, why: `${p.name} spoke for her` }, s.arcology.week);
    applyTreatment(p, { kind: "recognition", size: 5, why: "she asked for somebody else and was listened to" }, s.arcology.week);
    return `${other.name} is off the floors because ${p.name} asked`;
  },
  promote: (s, p, _v, target) => {
    const other = target ? s.people[target] : undefined;
    if (!other) return "nothing came of it";
    applyTreatment(other, { kind: "recognition", size: 4, why: `${p.name} put her name forward` }, s.arcology.week);
    return `${other.name} was moved up on ${p.name}'s say-so`;
  },
  exclusive: (s, p) => { romanceOf(p).exclusive = true; applyTreatment(p, { kind: "promise_kept", size: 8, why: "she asked to be the only one and you agreed" }, s.arcology.week); return "she is the only one you touch"; },
  name: (s, p, value) => { p.slave_name = String(value); applyTreatment(p, { kind: "recognition", size: 6, why: "she asked to be called by her own name again" }, s.arcology.week); return `she is ${value} again`; },
  answer: (s, p) => { applyTreatment(p, { kind: "recognition", size: 5, why: "she asked you something and you answered honestly" }, s.arcology.week); p.bond.hope = clamp(p.bond.hope + 8, 0, 100); return "you told her the truth"; },
  money: (s, p, value) => { const n = Number(value) || 2000; s.arcology.cash -= n; applyTreatment(p, { kind: "recognition", size: 4, why: "money spent on something that was only for her" }, s.arcology.week); return `¤${n} on something that was only ever for her`; },
};

/** What she calls an act when she is the one asking for it. */
const IN_HER_WORDS: Record<string, string> = {
  oral: "me on my knees for you", throat: "you using my throat", vaginal: "you fucking me properly",
  anal: "you in my ass", painal: "you taking my ass rough", mammary: "you fucking my tits",
  facial: "you finishing on my face", swallow: "you finishing in my mouth", penetrative: "me fucking you",
  group: "you and me and one of the others", breeding: "you breeding me", teasing: "you teasing me for hours",
  getoff: "you getting me off", toys: "the drawer, and all of it", "public use": "you taking me out on the concourse",
  exposure: "you showing me off", degradation: "you putting me in my place in front of people",
  restraint: "you tying me down", discipline: "you punishing me", orders: "you giving me orders",
  "suck her": "you sucking my cock", "stroke her": "your hand on my cock", "ride her": "you riding me",
  "eat her": "you going down on me", "worship her": "you worshipping me", "worship feet": "you worshipping my feet",
  "breed her back": "me breeding you", kissing: "you kissing me", slow: "a whole night, slow",
  "sleeping together": "staying the night", milking: "you milking me", suckle: "you nursing from me",
  "belly worship": "you worshipping my belly", "nipple fuck": "you fucking my nipples", rimming: "my tongue on you",
};

const NAMED_CLOTHES = ["silks", "an evening gown", "work clothes", "a plain shift", "a kimono"];

/** How long a request stays off the table once you have answered it. A yes settles it for longer
 *  than a no: a woman who was told no will try again, and one who got it has no reason to. */
const COOLDOWN = { granted: 8, refused: 4 };

function recentlyAnswered(p: Person, kind: string, week: number): boolean {
  const g = p.counters[`ask_granted:${kind}`];
  const r = p.counters[`ask_refused:${kind}`];
  return (g !== undefined && week - g < COOLDOWN.granted) || (r !== undefined && week - r < COOLDOWN.refused);
}

/** The wording, by how she talks. `ask` is a request, `tell` is what she says once she has the
 *  standing not to ask. */
const WORDING: Record<string, { ask: string[]; tell: string[]; timid?: string[]; sullen?: string[] }> = {
  act: {
    ask: ["She catches your sleeve on the way past. \"Tonight— I want {act}. I've been thinking about it all day.\"", "\"Can I ask for something? {Act}. That's what I want.\"", "She tells you what she wants, a little red in the face. \"{Act}. Please.\""],
    tell: ["\"Tonight it's {act}. I've decided.\"", "She tells you what's happening tonight. \"{Act}.\" It isn't a question.", "\"{Act}. Tonight. Don't be late.\""],
    timid: ["She starts to ask for something twice and stops. The third time she gets it out. \"{Act}— if that's all right.\" Then she apologises for asking."],
  },
  getoff: {
    ask: ["She's been restless for days. \"Please. I need you to get me off. Just that.\"", "\"I'm going out of my mind. Will you— please?\""],
    tell: ["\"I've been wound up for three days. Fix it.\"", "She pulls your hand between her legs and holds it there. \"Now.\""],
  },
  serve: {
    ask: [],
    tell: ["She sits back, spreads her knees, and looks at the floor in front of her. \"{Act}. On your knees.\"", "\"You're going to {act}, and you're going to take your time.\"", "She points at the floor. \"{Act}. Now.\""],
  },
  stay: {
    ask: ["\"Can I stay tonight? Not for anything. Just to stay.\"", "She asks if she can sleep in your bed. She says she won't take up much room."],
    tell: ["\"I'm sleeping in your bed tonight.\""],
  },
  rest: {
    ask: ["She asks for a week off. She's careful about how she puts it.", "\"I'm running on nothing. Could I have a few days?\""],
    tell: ["\"I'm taking the week off. I'm telling you so you don't have to hear it from someone else.\""],
    sullen: ["\"I'm dead on my feet. Give me a week or I'll be no use to you anyway.\""],
  },
  spa: {
    ask: ["\"I'm not well. Could I go to the spa? Just until I'm better.\""],
    tell: ["\"I'm going to the spa. I'll be back when I'm back.\""],
  },
  off_drugs: {
    ask: ["\"Take me off the aphrodisiacs. Please. I can't tell which parts are me any more.\"", "She asks to come off the drugs. Her hands are shaking while she asks."],
    tell: ["\"I'm stopping the aphrodisiacs. Don't argue.\""],
  },
  contraceptives_on: {
    ask: ["She asks to be put on contraceptives, and watches your face while she does.", "\"Could I— I'd like to be on the pill. If that's allowed.\""],
    tell: ["\"I'm going on contraceptives. I'm not having your child. Not yet.\""],
    sullen: ["\"Put me on the pill. I'm not carrying anything of yours.\""],
  },
  contraceptives_off: {
    ask: ["\"Take me off the contraceptives.\" She isn't being coy about why.", "\"I want to be bred. Take me off the pills.\""],
    tell: ["\"I've stopped the pills. You know what that means. Act like it.\""],
  },
  unlock: {
    ask: ["\"Could you unlock me? Please? Just for a while.\"", "She asks to be let out of the chastity, very politely."],
    tell: ["She holds out her hand for the key."],
    sullen: ["\"Get this thing off me.\""],
  },
  clothes: {
    ask: ["She asks for something to wear. She has something in mind: {value}.", "\"Could I have {value}? I'm tired of being cold.\""],
    tell: ["\"Order me {value}. My size. This week.\""],
  },
  spare: {
    ask: ["She asks you about {target}. Not for herself — for {target}. She wants her taken off what she's on.", "\"{Target} isn't going to last where she is. Please move her.\""],
    tell: ["\"I'm taking {target} off that rota. I'm telling you as a courtesy.\""],
  },
  name: {
    ask: ["\"Could you call me {value} again? It's my name.\" It's the first thing she's ever asked you for."],
    tell: ["\"My name is {value}. Use it.\""],
  },
  exclusive: {
    ask: ["She asks if she's the only one. She knows the answer. She's asking whether it could be true.", "\"Could it just be me? Only me?\""],
    tell: ["\"I'm the only one you touch now. I'm not asking.\""],
  },
  answer: {
    ask: ["She asks what happens to her. Not rhetorically. She wants the actual answer.", "\"What are you going to do with me? Long term. I need to know.\""],
    tell: ["\"Tell me the plan. All of it.\""],
  },
  money: {
    ask: ["She wants ¤{value} spent on something that's only for her, and she isn't going to justify it."],
    tell: ["\"I spent ¤{value}. It's on the account. It was for me.\"", "She hands you a receipt for ¤{value}. \"That's what that is.\""],
  },
};

function word(kind: string, instruction: boolean, reg: string, r: ReturnType<typeof rng>, vars: Record<string, string>): string {
  const w = WORDING[kind];
  if (!w) return "She asks you for something.";
  const pool = instruction && w.tell.length ? w.tell : (reg === "timid" && w.timid) || (reg === "sullen" && w.sullen) || w.ask;
  const t = r.pick(pool.length ? pool : w.tell);
  return t.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k.toLowerCase()] ?? "";
    return k[0] === k[0].toUpperCase() ? v.charAt(0).toUpperCase() + v.slice(1) : v;
  });
}

/** Build one ask out of who she actually is. The model may reword it; it never changes what it is. */
export function generateAsk(s: SaveState, p: Person): Ask | null {
  const rom = romanceOf(p);
  const r = read(p, s.memory[p.id]);
  const week = s.arcology.week;
  // The count moves the stream on, so asking her twice in one week can turn up something else
  // rather than the same request forever.
  const nth = p.counters.asks_generated ?? 0;
  const rng_ = rng(`ask:${p.id}:${week}:${nth}`);
  const reach = herReach(p);
  const reg = registerOf(p);

  // She has to have enough standing to open her mouth at all.
  if (r.trust < 10 && r.devotion < 30) return null;
  if (p.psyche.state === "broken") return null;
  if (p.age < 18) return null;

  type Cand = { kind: AskKind; key: string; payload: Ask["payload"]; vars?: Record<string, string>; cash?: number; gain: number; loss: number; weight: number };
  const c: Cand[] = [];
  const instruction = rom.dominion >= 60;
  const push = (x: Cand) => { if (!recentlyAnswered(p, x.key, week)) c.push(x); };

  // ── what her body wants ──────────────────────────────────────────────────────────────────
  const topFetish = [...p.persona.fetishes].sort((a, b) => b.strength - a.strength)[0];
  if (topFetish && topFetish.name !== "none" && topFetish.strength >= 40 && r.trust > 30) {
    const def = FETISH_BY_ID[topFetish.name];
    const acts = (def?.acts ?? []).filter((a) => ACT_BY_ID[a] && !canDo(p, ACT_BY_ID[a]));
    const actId = acts.length ? rng_.pick(acts) : "slow";
    push({ kind: "intimate", key: "act", payload: { kind: "act", value: actId }, vars: { act: IN_HER_WORDS[actId] ?? "that" }, gain: 6, loss: 5, weight: 3 });
  }
  if (p.psyche.arousal > 70 && r.trust > 25) {
    push({ kind: "intimate", key: "getoff", payload: { kind: "act", value: "getoff" }, gain: 5, loss: 6, weight: 3 });
  }
  if (p.persona.quirk?.id === "romantic" && r.devotion > 40) {
    push({ kind: "intimate", key: "stay", payload: { kind: "act", value: "sleeping together" }, gain: 8, loss: 8, weight: 2 });
  }
  // Past forty she stops asking to be used and starts telling you to serve her.
  if (rom.dominion >= 40) {
    const serve = ["worship her", "eat her", "suck her", "worship feet"].filter((a) => ACT_BY_ID[a] && !canDo(p, ACT_BY_ID[a]));
    if (serve.length) {
      const actId = rng_.pick(serve);
      push({ kind: "instruction", key: "serve", payload: { kind: "act", value: actId }, vars: { act: { "worship her": "worship me", "eat her": "go down on me", "suck her": "suck my cock", "worship feet": "worship my feet" }[actId] ?? "serve me" }, gain: 7, loss: 7, weight: 4 });
    }
  }

  // ── what her week wants ──────────────────────────────────────────────────────────────────
  const resting = p.assignment === "rest" || p.assignment === "rest in the spa";
  if ((p.health.energy < 30 || p.health.health < -20) && !resting) {
    push({ kind: "comfort", key: p.health.health < -30 ? "spa" : "rest", payload: { kind: p.health.health < -30 ? "spa" : "rest" }, gain: 5, loss: 7, weight: 4 });
  }
  if (p.health.aphrodisiacs > 0 && p.health.addiction > 25) {
    push({ kind: "comfort", key: "off_drugs", payload: { kind: "off_drugs" }, gain: 7, loss: 9, weight: 3 });
  }
  if (p.chastity.vagina || p.chastity.anus || p.chastity.penis) {
    push({ kind: "comfort", key: "unlock", payload: { kind: "unlock" }, gain: 5, loss: 5, weight: 2 });
  }
  if (p.clothes === "no clothing" && r.trust > 20) {
    const want = rng_.pick(NAMED_CLOTHES);
    push({ kind: "comfort", key: "clothes", payload: { kind: "clothes", value: want }, vars: { value: want }, cash: 1200, gain: 4, loss: 4, weight: 2 });
  }
  // Contraception: only when what she wants is not already what she has. The old version asked
  // for the pill every week whether or not she was on it.
  if (p.womb.fertility > 40 && !p.womb.sterile && !p.womb.fetuses.length && p.body.vagina !== null) {
    const wantsIt = p.persona.fetishes.some((f) => f.name === "pregnancy" && f.strength > 50) || p.persona.paraphilia === "breeder";
    if (wantsIt && p.womb.contraceptives) {
      push({ kind: "personal", key: "contraceptives_off", payload: { kind: "contraceptives", value: "off" }, gain: 9, loss: 9, weight: 3 });
    } else if (!wantsIt && !p.womb.contraceptives && r.trust > 15) {
      push({ kind: "personal", key: "contraceptives_on", payload: { kind: "contraceptives", value: "on" }, gain: 8, loss: 9, weight: 2 });
    }
  }

  // ── what she wants for somebody else ─────────────────────────────────────────────────────
  const friend = s.edges
    .filter((e) => e.from === p.id && e.warmth > 45 && s.people[e.to]?.status === "owned")
    .map((e) => s.people[e.to])
    .find((o) => o && o.assignment !== "rest" && (o.health.health < -20 || o.psyche.state !== "intact" || o.assignment === "be confined in the arcade"));
  if (friend && r.trust > 35) {
    push({ kind: "household", key: "spare", payload: { kind: "spare", target: friend.id }, vars: { target: friend.name }, gain: 10, loss: 8, weight: 4 });
  }

  // ── what she wants from you ──────────────────────────────────────────────────────────────
  if (p.slave_name && p.slave_name !== p.name) {
    push({ kind: "personal", key: "name", payload: { kind: "name", value: p.name }, vars: { value: p.name }, gain: 9, loss: 10, weight: 3 });
  }
  if (r.devotion > 55 && rom.standing !== "property" && !rom.exclusive) {
    push({ kind: "personal", key: "exclusive", payload: { kind: "exclusive" }, gain: 12, loss: 12, weight: 1.5 });
  }
  if (p.bond.hope < 25 && r.trust > 20) {
    push({ kind: "personal", key: "answer", payload: { kind: "answer" }, gain: 8, loss: 10, weight: 2 });
  }
  if (reach.purchases) {
    push({ kind: "instruction", key: "money", payload: { kind: "money", value: 3000 }, vars: { value: "3,000" }, cash: 3000, gain: 5, loss: 8, weight: 1 });
  }

  if (!c.length) return null;
  p.counters.asks_generated = nth + 1;
  const pick = rng_.weighted(c, (x) => x.weight);
  const tells = instruction || pick.key === "serve";
  return {
    id: `ask-${p.id}-${week}-${pick.key}-${nth}`,
    person: p.id,
    kind: tells && pick.kind !== "household" ? "instruction" : pick.kind,
    text: word(pick.key, tells, reg, rng_, pick.vars ?? {}),
    payload: pick.payload,
    cash: pick.cash,
    gain: pick.gain,
    // An instruction refused costs far more than a request refused. That asymmetry IS the top of
    // the ladder: past a point, saying no to her is a thing you do at a price.
    loss: tells ? pick.loss * 2 : pick.loss,
    week,
    key: pick.key,
  };
}

export interface AskReply { what: string; said: string }

export function grantAsk(s: SaveState, ask: Ask): AskReply {
  const p = s.people[ask.person];
  if (!p) return { what: "", said: "" };
  if (ask.cash) s.arcology.cash -= ask.cash;
  if (ask.rep) s.arcology.rep -= ask.rep;
  const fn = PAYLOADS[ask.payload.kind];
  const what = fn ? fn(s, p, ask.payload.value, ask.payload.target) : "it was done";
  romanceOf(p).granted++;
  shiftDominion(s, p, ask.gain, ask.text.slice(0, 90));
  p.bond.hope = clamp(p.bond.hope + ask.gain * 0.6, 0, 100);
  p.counters[`ask_granted:${ask.key ?? ask.payload.kind}`] = s.arcology.week;
  ask.answered = "granted";
  s.asks = (s.asks ?? []).filter((a) => a.id !== ask.id);
  const r = rng(`reply:${ask.id}`);
  return { what, said: say(s, p, ask.kind === "instruction" ? "praise" : "thank", r) };
}

export function refuseAsk(s: SaveState, ask: Ask, harshly = false): AskReply {
  const p = s.people[ask.person];
  if (!p) return { what: "", said: "" };
  romanceOf(p).refused++;
  shiftDominion(s, p, -ask.loss, ask.text.slice(0, 90));
  p.bond.hope = clamp(p.bond.hope - ask.loss * 0.8, 0, 100);
  if (harshly) {
    applyTreatment(p, { kind: "cruelty", size: 4, why: "she asked for something and was put in her place for asking" }, s.arcology.week);
    addState(p.psyche, "what happened the last time she asked for something", s.arcology.week);
    shove(p.psyche, -1.2);
  } else {
    applyTreatment(p, { kind: "neglect", size: 2, why: "she asked and was told no" }, s.arcology.week);
  }
  const mem = s.memory[p.id];
  if (mem && ask.gain >= 8) {
    remember(mem, { content: `she asked for something that mattered and was told no`, week: s.arcology.week, importance: 7, charge: "cold" });
  }
  p.counters[`ask_refused:${ask.key ?? ask.payload.kind}`] = s.arcology.week;
  ask.answered = "refused";
  s.asks = (s.asks ?? []).filter((a) => a.id !== ask.id);
  const r = rng(`reply:${ask.id}`);
  return {
    what: harshly ? "She's been put in her place. She won't ask again for a long time." : "You said no.",
    said: say(s, p, harshly ? "mock" : ask.kind === "instruction" ? "mock" : "dismiss", r),
  };
}

/** Weekly: the people with standing to ask, ask. Two a week, most standing first. */
export function collectAsks(s: SaveState): Ask[] {
  const out: Ask[] = [];
  const people = Object.values(s.people)
    .filter((p) => (p.status === "owned" || p.status === "indentured" || p.status === "free") && p.age >= 18)
    .sort((a, b) => (b.romance?.dominion ?? -100) - (a.romance?.dominion ?? -100));
  for (const p of people) {
    if (out.length >= 2) break;
    const ask = generateAsk(s, p);
    if (ask) out.push(ask);
  }
  return out;
}

/** IN HER VOICE. The payload is fixed before this runs and is not passed to the model — it gets the
 *  gist and her card, and hands back one or two sentences. A failure leaves the deterministic
 *  wording, which is always already a complete ask. */
export async function voiceAsk(s: SaveState, ask: Ask): Promise<string> {
  if (!modelsAvailable()) return ask.text;
  const p = s.people[ask.person];
  if (!p) return ask.text;
  const rom = romanceOf(p);
  const res = await call({
    system: `You put ONE request into one specific woman's mouth, in an adult game about an arcology with a legal slave economy. You are given who she is and what she is asking for. Give it back as one or two sentences of what she actually says and does when she asks — her words, her register, her nerve or lack of it. She is asking a person who owns her, or used to, and how much standing she has to ask with is stated. Blunt is fine. Crude is fine if she is crude. Do NOT change what is being asked for. Do NOT narrate her interior — what she says, how she says it, what her hands do. Output JSON only: {"says":"..."}`,
    user: [
      `HER: ${p.name}, ${p.age}. ${p.persona.speech_pattern}`,
      p.persona.voice?.example_lines?.length ? `SOUNDS LIKE: "${p.persona.voice.example_lines[0]}"` : "",
      `TRAITS: ${p.persona.core_traits.join("; ")}`,
      `WHERE SHE STANDS: ${rom.standing}, and she decides ${Math.round(rom.dominion)} out of 100 around here.`,
      `HOW SHE IS: ${p.bond.read.label}, hope ${Math.round(p.bond.hope)}, and ${p.psyche.mood}.`,
      `WHAT SHE IS ASKING FOR: ${ask.text}`,
      ask.kind === "instruction" ? `SHE IS NOT ASKING. She has the standing to tell you, and she uses it.` : "",
    ].filter(Boolean).join("\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 220,
  });
  if (!res.ok) return ask.text;
  const out = parseJson<{ says?: string }>(res.text);
  return out?.says ? String(out.says).slice(0, 400) : ask.text;
}
