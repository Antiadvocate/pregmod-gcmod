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
}

/** Everything an ask can actually DO. Closed on purpose: a generated ask is only ever a rewording
 *  of one of these, so nothing a model writes can reach past this list. */
const PAYLOADS: Record<string, (s: SaveState, p: Person, value?: string | number, target?: string) => string> = {
  act: (s, p, value) => {
    const act = ACT_BY_ID[String(value)];
    p.psyche.arousal = clamp(p.psyche.arousal + 15, 0, 100);
    applyTreatment(p, { kind: "recognition", size: 4, why: `she asked for ${act?.name.toLowerCase() ?? "it"} and got it` }, s.arcology.week);
    return `you gave her ${act?.name.toLowerCase() ?? "what she asked for"}`;
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

const NAMED_CLOTHES = ["silks", "an evening gown", "work clothes", "a plain shift", "a kimono"];

/** Build one ask out of who she actually is. Deterministic; the model only ever rewords it. */
export function generateAsk(s: SaveState, p: Person): Ask | null {
  const rom = romanceOf(p);
  const r = read(p, s.memory[p.id]);
  const rng_ = rng(`ask:${p.id}:${s.arcology.week}`);
  const reach = herReach(p);

  // She has to have enough standing to open her mouth at all. A woman at low trust does not ask
  // for things; she waits to be told, and that silence is itself information.
  if (r.trust < 10 && r.devotion < 30) return null;
  if (p.psyche.state === "broken") return null;

  const candidates: Omit<Ask, "id" | "person" | "week">[] = [];
  const instruction = rom.dominion >= 60;

  // ── what her body wants ──────────────────────────────────────────────────────────────────
  const topFetish = [...p.persona.fetishes].sort((a, b) => b.strength - a.strength)[0];
  if (topFetish && topFetish.name !== "none" && topFetish.strength >= 40 && r.trust > 30) {
    const def = FETISH_BY_ID[topFetish.name];
    const actId = def?.acts.find((a) => ACT_BY_ID[a]) ?? "slow";
    candidates.push({
      kind: "intimate",
      text: instruction
        ? `She tells you what she wants tonight, and it is ${ACT_BY_ID[actId]?.name.toLowerCase() ?? "what she is into"}. It is not phrased as a question.`
        : `She has worked up to asking for something specific: ${ACT_BY_ID[actId]?.name.toLowerCase() ?? "what she is into"}.`,
      payload: { kind: "act", value: actId },
      gain: 6, loss: 5,
    });
  }
  if (p.psyche.arousal > 70 && r.trust > 25) {
    candidates.push({
      kind: "intimate",
      text: instruction ? `She has been wound up for days and she is done waiting for you to notice.` : `She asks, badly and indirectly, to be got off.`,
      payload: { kind: "act", value: "getoff" },
      gain: 5, loss: 6,
    });
  }
  if (p.persona.quirk?.id === "romantic" && r.devotion > 40) {
    candidates.push({
      kind: "intimate",
      text: `She asks to stay the night. Not for anything — to stay.`,
      payload: { kind: "act", value: "sleeping together" },
      gain: 8, loss: 8,
    });
  }

  // ── what her week wants ──────────────────────────────────────────────────────────────────
  if (p.health.energy < 30 || p.health.health < -20) {
    candidates.push({
      kind: "comfort",
      text: instruction ? `She is taking the week off and is informing you rather than asking.` : `She asks for a week off. She is careful about how she puts it.`,
      payload: { kind: p.health.health < -30 ? "spa" : "rest" },
      gain: 5, loss: 7,
    });
  }
  if (p.health.aphrodisiacs > 0 && p.health.addiction > 25) {
    candidates.push({
      kind: "comfort",
      text: `She wants off the aphrodisiacs. She says she cannot tell any more which parts of it are her.`,
      payload: { kind: "off_drugs" },
      gain: 7, loss: 9,
    });
  }
  if (p.chastity.vagina || p.chastity.anus) {
    candidates.push({ kind: "comfort", text: `She asks to be unlocked.`, payload: { kind: "unlock" }, gain: 5, loss: 5 });
  }
  if (p.clothes === "no clothing" && r.trust > 20) {
    const want = rng_.pick(NAMED_CLOTHES);
    candidates.push({ kind: "comfort", text: `She asks for something to wear. She has been specific about it: ${want}.`, payload: { kind: "clothes", value: want }, cash: 1200, gain: 4, loss: 4 });
  }
  if (p.womb.fertility > 40 && !p.womb.sterile) {
    const wantsIt = p.persona.fetishes.some((f) => f.name === "pregnancy" && f.strength > 50);
    candidates.push({
      kind: "personal",
      text: wantsIt ? `She wants you to stop her contraceptives. She has thought about it and she is not being coy.` : `She asks to be put on contraceptives, and watches your face while she does it.`,
      payload: { kind: "contraceptives", value: wantsIt ? "off" : "on" },
      gain: 9, loss: 9,
    });
  }

  // ── what she wants for somebody else ─────────────────────────────────────────────────────
  const friend = s.edges
    .filter((e) => e.from === p.id && e.warmth > 45 && s.people[e.to]?.status === "owned")
    .map((e) => s.people[e.to])
    .find((o) => o && (o.health.health < -20 || o.psyche.state !== "intact" || o.assignment === "be confined in the arcade"));
  if (friend && r.trust > 35) {
    candidates.push({
      kind: "household",
      text: instruction
        ? `She is taking ${friend.name} off the arcade rota. She mentions it on the way past.`
        : `She asks — for ${friend.name}, not for herself — that she be taken off what she is on.`,
      payload: { kind: "spare", target: friend.id },
      gain: 10, loss: 8,
    });
  }

  // ── what she wants from you ──────────────────────────────────────────────────────────────
  if (p.slave_name && p.slave_name !== p.name) {
    candidates.push({ kind: "personal", text: `She asks to be called ${p.name} again. It is the first thing she has asked you for.`, payload: { kind: "name", value: p.name }, gain: 9, loss: 10 });
  }
  if (r.devotion > 55 && rom.standing !== "property" && !rom.exclusive) {
    candidates.push({
      kind: "personal",
      text: instruction ? `She has decided she is the only one you touch, and she says so flatly.` : `She asks whether she is the only one. She already knows the answer; she is asking whether it could be true.`,
      payload: { kind: "exclusive" },
      gain: 12, loss: 12,
    });
  }
  if (p.bond.hope < 25 && r.trust > 20) {
    candidates.push({ kind: "personal", text: `She asks what happens to her. Not rhetorically — she wants the actual answer.`, payload: { kind: "answer" }, gain: 8, loss: 10 });
  }
  if (reach.purchases && rng_.chance(0.4)) {
    candidates.push({ kind: "instruction", text: `She wants money spent on something that is not an investment, and she is not justifying it.`, payload: { kind: "money", value: 3000 }, cash: 3000, gain: 5, loss: 8 });
  }

  if (!candidates.length) return null;
  const pick = rng_.pick(candidates);
  return {
    ...pick,
    kind: instruction && pick.kind !== "household" ? "instruction" : pick.kind,
    id: `ask-${p.id}-${s.arcology.week}-${pick.payload.kind}`,
    person: p.id,
    week: s.arcology.week,
    // An instruction refused costs far more than a request refused. That asymmetry IS the top of
    // the ladder: past a point, saying no to her is a thing you do at a price.
    loss: instruction ? pick.loss * 2 : pick.loss,
  };
}

export function grantAsk(s: SaveState, ask: Ask): string {
  const p = s.people[ask.person];
  if (!p) return "";
  if (ask.cash) s.arcology.cash -= ask.cash;
  if (ask.rep) s.arcology.rep -= ask.rep;
  const fn = PAYLOADS[ask.payload.kind];
  const what = fn ? fn(s, p, ask.payload.value, ask.payload.target) : "it was done";
  romanceOf(p).granted++;
  shiftDominion(s, p, ask.gain, ask.text.slice(0, 90));
  p.bond.hope = clamp(p.bond.hope + ask.gain * 0.6, 0, 100);
  ask.answered = "granted";
  s.asks = (s.asks ?? []).filter((a) => a.id !== ask.id);
  return what;
}

export function refuseAsk(s: SaveState, ask: Ask, harshly = false): string {
  const p = s.people[ask.person];
  if (!p) return "";
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
    remember(mem, { content: `she asked for something that mattered and he said no`, week: s.arcology.week, importance: 7, charge: "cold" });
  }
  ask.answered = "refused";
  s.asks = (s.asks ?? []).filter((a) => a.id !== ask.id);
  return harshly ? "she has been put in her place, and she will not ask again for a long time" : "you said no";
}

/** Weekly: the people with standing to ask, ask. Capped so the screen is a decision rather than a
 *  queue — two a week, and the ones with the most standing go first. */
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
