/**
 * EVENTS THE ENGINE DID NOT AUTHOR.
 *
 * The hand-written events in engine/events.ts are the spine — they fire without a model, they are
 * deterministic, and they cover the situations an arcology reliably produces. This file is the
 * other half: a model, pointed at ONE specific woman's actual record, inventing the situation that
 * her particular combination of fetish, flaw, history, standing and week would actually throw up.
 *
 * It is built for a LOCAL model and says so. The situations this game wants are explicit, and a
 * hosted model will decline them, water them down, or write around the edges — which produces the
 * exact failure the genre's audience notices immediately. Point the narrator slot at KoboldCpp or
 * llama-server, put an uncensored model behind it, and this becomes the part of the game that
 * cannot be exhausted.
 *
 * ── THE GUARDRAIL, AND WHY IT IS SHAPED LIKE THIS ────────────────────────────────────────────
 *
 * The model writes the SITUATION and the WORDING of the options. It does not write the
 * consequences. Every option carries an `effect` drawn from the closed table below, the engine
 * resolves it, and anything unrecognised is dropped. So an uncensored model can be as inventive as
 * it likes about what is happening in the room and it still cannot invent a state change, break an
 * invariant, reach a person it was not given, or touch anybody the age gate excludes.
 */
import { powerBetween } from "./self";
import { coarsen, REGISTER_TAIL } from "./register";
import { memoryLine } from "./memory";
import { agreementsBrief, calledBy } from "./agreements";
import { deedsBrief } from "./deeds";
import { mannerBrief } from "./manner";
import type { PendingEvent, Person, SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable, isLocalModel } from "../config";
import { clamp, shove, addState } from "./psyche";
import { applyTreatment, read } from "./obedience";
import { remember } from "./memory";
import { moveEdge, startRumor } from "./social";
import { shiftDominion, romanceOf } from "./romance";
import { resolveAct } from "./intimacy";
import { FETISH_BY_ID, ACT_BY_ID } from "../data/intimacy";
import { condition } from "./prompts";
import { describeGenitals, describeFeet, anatomyLock } from "./genitals";
import { worldBrief } from "./world";
import { HOUSE_STYLE } from "./prompts";
import { PLAIN_RULES } from "./style";
import { chronicle, chronicleBrief, closeHooks, openHooks } from "./chronicle";
import { changeRoom, roomLine, roomWish } from "./rooms";
import { EXTRA_BY_ID } from "../data/rooms";
import { lockUp } from "./governor";

/** THE CLOSED TABLE. A generated option may name one of these and nothing else. */
/** How an act landed, as words: the landing ids are not verbs ("she nothing it"). */
const LANDED: Record<string, string> = { wanted: "she loved it", willing: "she was into it", endured: "she put up with it", hated: "she hated it", nothing: "it did nothing for her" };

/** What the player reads is `note`: plain words. What the model needs to fill in is `value`, kept
 *  apart so its wording never ends up on a button. */
export const DYNAMIC_EFFECTS: Record<string, { note: string; value?: string; run: (s: SaveState, p: Person, value?: string | number) => string }> = {
  kindness: { note: "you're kind to her", run: (s, p, v) => { applyTreatment(p, { kind: "kindness", size: Number(v) || 4, why: "how you handled it" }, s.arcology.week); shove(p.psyche, 0.8); return "she's surprised and grateful"; } },
  cruelty: { note: "you're cruel to her", run: (s, p, v) => { applyTreatment(p, { kind: "cruelty", size: Number(v) || 5, why: "how you handled it" }, s.arcology.week); shove(p.psyche, -1.5, { hard: true }); return "she takes it, and resents you for it"; } },
  coercion: { note: "you punish her to keep her in line", run: (s, p, v) => { applyTreatment(p, { kind: "coercion", size: Number(v) || 4, why: "punished to enforce the rules" }, s.arcology.week); return "she gets the message"; } },
  recognition: { note: "you treat her like a person", run: (s, p, v) => { applyTreatment(p, { kind: "recognition", size: Number(v) || 5, why: "you treated her like a person" }, s.arcology.week); return "she appreciates being treated like a person"; } },
  promise_kept: { note: "you keep your word", run: (s, p, v) => { applyTreatment(p, { kind: "promise_kept", size: Number(v) || 6, why: "you kept your word" }, s.arcology.week); return "you kept your word, and she appreciates it"; } },
  promise_broken: { note: "you go back on your word", run: (s, p, v) => { applyTreatment(p, { kind: "promise_broken", size: Number(v) || 6, why: "you went back on it" }, s.arcology.week); return "she's lost faith in your promises"; } },
  act: { note: "it turns into sex", value: "which act, by its id", run: (s, p, v) => { const out = resolveAct(s, p, String(v)); return "error" in out ? "nothing came of it" : `${ACT_BY_ID[String(v)]?.what ?? "it happened"} — ${LANDED[out.landing]}`; } },
  arouse: { note: "it gets her worked up", run: (_s, p, v) => { p.psyche.arousal = clamp(p.psyche.arousal + (Number(v) || 20), 0, 100); return "she's very turned on"; } },
  dominion_up: { note: "she gets her way", run: (s, p, v) => { shiftDominion(s, p, Number(v) || 6, "she got her way"); return "she got her way"; } },
  dominion_down: { note: "you put her back in her place", run: (s, p, v) => { shiftDominion(s, p, -(Number(v) || 6), "she was put back in her place"); return "she's been put back in her place"; } },
  cash: { note: "money changes hands", value: "how much, and negative when you pay", run: (s, _p, v) => { const n = Number(v) || -2000; s.arcology.cash += n; return `¤${Math.abs(n).toLocaleString()} ${n < 0 ? "spent" : "made"}`; } },
  rep: { note: "it changes what the arcology thinks of you", value: "how much, and negative when it costs you", run: (s, _p, v) => { const n = Number(v) || -200; s.arcology.rep = Math.max(0, s.arcology.rep + n); return `standing ${n >= 0 ? "+" : ""}${n}`; } },
  rumor: { note: "people talk about it", value: "what they say", run: (s, p, v) => { startRumor(s, String(v ?? `something about ${p.name}`), { about: p.id, salience: 7 }); return "everyone's heard about it by morning"; } },
  scar: { note: "she never forgets it", value: "the memory, as she'd put it", run: (s, p, v) => { const mem = s.memory[p.id]; if (mem) remember(mem, { content: String(v ?? "the thing that happened"), week: s.arcology.week, importance: 9, charge: "sharp", core: true }); addState(p.psyche, "what happened", s.arcology.week); return "she'll never forget it"; } },
  room_gift: { note: "you give her something for her room", value: "which room item, by its id", run: (s, p, v) => { const id = String(v ?? ""); const wish = roomWish(s, p); const line = EXTRA_BY_ID[id] ? changeRoom(s, p, { extra: id }) : wish?.extra ? changeRoom(s, p, { extra: wish.extra }) : wish?.axis ? changeRoom(s, p, { axis: wish.axis, level: wish.level }) : ""; return line || "her room stays as it is"; } },
  room_take: { note: "you take something out of her room as a punishment", value: "which room item she has, by its id", run: (s, p, v) => { const have = p.room?.extras ?? []; const id = have.includes(String(v)) ? String(v) : have.find((x) => (EXTRA_BY_ID[x]?.comfort ?? 0) > 0); if (id) return changeRoom(s, p, { remove: id }); if ((p.room?.levels.bed ?? 0) > -1) return changeRoom(s, p, { axis: "bed", level: -1 }); return "there's nothing left in her room to take"; } },
  imprison: { note: "you have her locked in a cell", run: (s, p) => lockUp(s, p, "locked in a cell") },
  nothing: { note: "you leave it alone", run: () => "you did nothing" },
};

/** What a choice does to two of your women at once, for an event between them (engine/goings). */
export const PAIR_EFFECTS: Record<string, { note: string; run: (s: SaveState, a: Person, b: Person) => string }> = {
  closer: { note: "it brings the two of them closer", run: (s, a, b) => {
    for (const [x, y] of [[a, b], [b, a]]) { moveEdge(s.edges, x.id, y.id, { warmth: 7, trust: 5 }); const m = s.memory[x.id]; if (m) remember(m, { content: `${y.name} and I got closer, over what happened in week ${s.arcology.week}`, week: s.arcology.week, importance: 5, charge: "warm" }); }
    return `${a.name} and ${b.name} are closer for it`;
  } },
  rift: { note: "it drives the two of them apart", run: (s, a, b) => {
    for (const [x, y] of [[a, b], [b, a]]) { moveEdge(s.edges, x.id, y.id, { warmth: -9, trust: -7 }); const m = s.memory[x.id]; if (m) remember(m, { content: `what happened with ${y.name} in week ${s.arcology.week}`, week: s.arcology.week, importance: 5, charge: "cold" }); }
    return `${a.name} and ${b.name} have barely spoken since`;
  } },
  side_with: { note: "you take her side against the other one", run: (s, a, b) => {
    applyTreatment(a, { kind: "recognition", size: 4, why: "you took her side" }, s.arcology.week);
    applyTreatment(b, { kind: "neglect", size: 3, why: `you took ${a.name}'s side` }, s.arcology.week);
    moveEdge(s.edges, b.id, a.id, { warmth: -6, power: -4 });
    moveEdge(s.edges, a.id, b.id, { power: 5 });
    return `${a.name} has the upper hand over ${b.name} now, and ${b.name} knows who gave it to her`;
  } },
};

interface GeneratedEvent {
  title?: string;
  hook?: string;
  situation?: string;
  options?: { label?: string; note?: string; effect?: string; value?: string | number }[];
}

/** Who is worth building a situation around this week — the one with the most live material on
 *  her record, rather than a random pick. */
export function pickSubject(s: SaveState): Person | null {
  const pool = Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 5);
  if (!pool.length) return null;
  const score = (p: Person): number => {
    const r = read(p, s.memory[p.id]);
    let n = 0;
    n += Math.abs(p.psyche.relaxation) * 0.6;
    n += p.bond.resentment / 12;
    n += p.psyche.arousal / 25;
    n += (p.romance && p.romance.standing !== "property") ? 6 : 0;
    n += p.persona.fetishes.some((f) => f.strength > 60) ? 4 : 0;
    n += p.persona.flaw && !p.persona.flaw.known ? 3 : 0;
    n += r.flight_risk * 8;
    n += (s.memory[p.id]?.episodic.length ?? 0) / 8;
    n += p.psyche.active_states.length * 2;
    return n;
  };
  return pool.sort((a, b) => score(b) - score(a))[0];
}

/** The dossier the model gets. Everything specific, nothing generic — a model handed "a slave"
 *  writes the average of every slave it has ever read, and a model handed THIS record writes her. */
export function dossier(s: SaveState, p: Person): string {
  const r = read(p, s.memory[p.id]);
  const rom = romanceOf(p);
  const mem = s.memory[p.id];
  const fetish = p.persona.fetishes.filter((f) => f.name !== "none").map((f) => `${f.name} (${f.strength}${f.known ? ", you know" : ", you do not know yet"})`).join(", ");
  const lines = [
    `HER: ${p.name}, ${p.age}, ${p.origin.nationality}. Was a ${p.origin.career}. ${p.origin.background}`,
    `BODY: ${p.body.appearance_facts} Currently: ${p.body.appearance_now}. Wearing ${p.clothes}.`,
    `GENITALS: ${describeGenitals(p)}`,
    `ANATOMY, which is a hard rule: ${anatomyLock(p)}`,
    agreementsBrief(s, p),
    mannerBrief(s, p),
    powerBetween(s, p),
    `SHE CALLS YOU: ${calledBy(s, p)}.`,
    `FEET: ${describeFeet(p)}`,
    p.womb.fetuses.length ? `${p.womb.weeks} weeks pregnant.` : "",
    p.body.lactation ? "Lactating." : "",
    roomLine(p),
    `WHAT SHE'S DOING: ${p.assignment}${p.facility ? ` in the ${s.arcology.facilities[p.facility]?.name}` : ""}.`,
    `WHAT SHE'S INTO: ${fetish || "no particular fetish"}${p.persona.quirk ? `. Her quirk is ${p.persona.quirk.id}` : ""}${p.persona.flaw ? `. Her flaw is that she ${p.persona.flaw.id}` : ""}${p.persona.paraphilia ? `. She has a PARAPHILIA, ${p.persona.paraphilia}` : ""}.`,
    `HOW SHE IS: she's ${condition(p)}, her arousal is ${Math.round(p.psyche.arousal)}, and her mood is ${p.psyche.mood}.${p.psyche.active_states.length ? ` What's on her mind is ${p.psyche.active_states.join(", ")}.` : ""}`,
    `TOWARD YOU she's ${r.label} (${r.devotion}) and ${r.trust_label} (${r.trust}). ${Math.round(r.fragility * 100)}% of her obedience is fear. Her resentment is ${Math.round(p.bond.resentment)} and her hope is ${Math.round(p.bond.hope)}.`,
    `HER STANDING: ${rom.standing}${rom.dominion > -80 ? `, with ${Math.round(rom.dominion)} out of 100 say in the household` : ""}.`,
    `TALKS LIKE: ${p.persona.speech_pattern}`,
    `HER TRAITS: ${p.persona.core_traits.map((t) => t.replace(/[.;]\s*$/, "")).join(", ")}.`,
    p.persona.texture.length ? `LIKES AND DISLIKES: she ${p.persona.texture.join(", and she ")}.` : "",
    mem?.episodic.length ? `WHAT SHE REMEMBERS FROM PAST WEEKS: ${mem.episodic.slice(-5).map(memoryLine).join(" | ")}` : "",
    p.acts && Object.keys(p.acts).length ? `WHAT HAS BEEN DONE TO HER: ${Object.entries(p.acts).map(([a, n]) => `${a} ×${n}`).join(", ")}` : "",
    deedsBrief(s, p.id) ? `WHAT HAS HAPPENED BETWEEN YOU. This is history rather than the present, so let it colour how she is now, but never pick it back up:\n${deedsBrief(s, p.id)}` : "",
    s.world ? `THE WORLD: ${worldBrief(s).replace(/\n/g, " ")}` : "",
    chronicleBrief(s, [p.id], 8),
    `THE PLACE AND TIME: ${s.arcology.name}, and it's now week ${s.arcology.week}. ${Object.keys(s.arcology.doctrines).length ? `Its doctrine is ${Object.keys(s.arcology.doctrines).join(", ")}.` : "No doctrine adopted yet."}`,
  ];
  return lines.filter(Boolean).join("\n");
}

const SYSTEM = `You write one event for Free Cities, an adult text game about owning an arcology where slavery is legal and ordinary. An event is a short situation with one of the player's slaves that ends with the player having to decide what to do.

Build it from her record, meaning her fetish, her flaw, her job, her body, her room, what has been done to her, what she remembers, how she feels about you, and above all WHAT HAS ALREADY HAPPENED between you. Emergent story is the point. The best event is the next step of something already on her record, like a promise you made, a punishment she hasn't got over, or something left open, with consequences that follow from it. If OPEN THREADS are listed, continue one of them. It should be something that could only happen with her, this week.

${HOUSE_STYLE}

Do not invent people who are not on the record, except strangers with no name. Everyone is an adult.

Output ONE strict JSON object and nothing else:
{"title":"2-5 words","situation":"one or two short paragraphs, present tense, ending where you have to decide","options":[{"label":"what you do, 2-8 words","note":"a few plain words for the player, like \"she won't forget it\" or \"costs you ¤2,000\", and never the effect's description","effect":"one id from the list","value":"optional"}],"hook":"one line saying what this leaves open for later, or empty"}

Give three or four options, each a genuinely different response, and make at least one of them leaving it alone.

It is now the week named under THE PLACE AND TIME, and each turn of the game is a week. Everything on her record happened in earlier weeks and is over, so don't restage it. This is the next thing, and it's happening now.`;

/** The effects as the model reads them: id, what it does, and what to put in "value". */
export function effectList(): string {
  return Object.entries(DYNAMIC_EFFECTS).map(([id, e]) => `${id}: ${e.note}${e.value ? ` (value: ${e.value})` : ""}`).join("\n");
}

export async function generateDynamicEvent(s: SaveState, subject?: Person, hint = ""): Promise<PendingEvent | null> {
  if (!modelsAvailable()) return null;
  const p = subject ?? pickSubject(s);
  if (!p) return null;

  const hooks = openHooks(s, [p.id]).slice(0, 3);
  const res = await call({
    system: SYSTEM,
    user: `${dossier(s, p)}${hooks.length ? `\n\nOPEN THREADS. Continue one of these if you can.\n${hooks.map((h) => `· from week ${h.week}: ${h.hook}`).join("\n")}` : ""}${hint ? `\n\nWHAT THE GAME HAS NOTICED THIS WEEK. Use it. ${hint}` : ""}\n\nEFFECT IDS YOU MAY USE:\n${effectList()}\n\nACT IDS (for the "act" effect): ${Object.keys(ACT_BY_ID).join(", ")}\n\nROOM ITEM IDS: ${Object.keys(EXTRA_BY_ID).join(", ")}${p.room?.extras.length ? ` (she has: ${p.room.extras.join(", ")})` : ""}\n\n${PLAIN_RULES}\n\n${REGISTER_TAIL}`,
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 700,
    temperature: 1,
  });
  if (!res.ok) return null;
  const out = parseJson<GeneratedEvent>(coarsen(res.text));
  if (!out?.situation || !Array.isArray(out.options) || out.options.length < 2) return null;

  // Everything unrecognised is dropped here rather than trusted anywhere downstream.
  const options = out.options
    .filter((o) => o?.label && o.effect && DYNAMIC_EFFECTS[String(o.effect)])
    .slice(0, 4)
    .map((o, i) => ({
      id: `d${i}:${o.effect}:${o.value ?? ""}`,
      label: String(o.label).slice(0, 60),
      note: o.note ? String(o.note).slice(0, 90) : undefined,
    }));
  if (options.length < 2) return null;

  return {
    id: `dyn-${s.arcology.week}-${p.id}`,
    kind: "dynamic",
    person: p.id,
    seed: String(out.situation).slice(0, 1600),
    options,
    week: s.arcology.week,
    severity: "notable",
    written: { model: res.model, title: out.title ? String(out.title).slice(0, 60) : undefined },
    hook: out.hook ? String(out.hook).slice(0, 200) : undefined,
  };
}

/** Resolve a generated option. The id carries the effect and its value, so nothing has to be
 *  stored alongside the event and a save that reloads mid-event still resolves correctly. */
/** A follow-up with nobody of yours in it: what the effect means for the city and your name. */
export function npcEffect(s: SaveState, effect: string, value: string | undefined, seed: string): string {
  const std = (n: number) => { s.arcology.public_standing = clamp(s.arcology.public_standing + n, -10, 10); };
  const who = seed.match(/\b([A-Z][a-z]+(?: [A-Z][a-z]+)?)\b/)?.[1] ?? "them";
  switch (effect) {
    case "cash": { const n = Number(value) || -2000; s.arcology.cash += n; return `¤${Math.abs(n).toLocaleString()} ${n < 0 ? "spent" : "made"}.`; }
    case "rep": { const n = Number(value) || -200; s.arcology.rep = Math.max(0, s.arcology.rep + n); return `Your standing ${n >= 0 ? "rises" : "falls"} (${n >= 0 ? "+" : ""}${n}).`; }
    case "rumor": startRumor(s, String(value ?? seed.slice(0, 120))); return "Everyone's heard about it by morning.";
    case "promise_kept": s.arcology.rep += 250; std(1); startRumor(s, `the owner kept their word to ${who}`, { salience: 6, charge: 1 }); return `You kept your word to ${who}, and people hear about it. (+250 reputation)`;
    case "promise_broken": s.arcology.rep = Math.max(0, s.arcology.rep - 300); std(-1); startRumor(s, `the owner went back on their word to ${who}`, { salience: 7, charge: -1 }); return `You went back on your word to ${who}. It gets around. (−300 reputation)`;
    case "kindness": case "recognition": s.arcology.rep += 120; std(0.5); return `${who} won't forget how you treated them. (+120 reputation)`;
    case "cruelty": case "coercion": s.arcology.rep = Math.max(0, s.arcology.rep - 100); s.arcology.crime = clamp(s.arcology.crime - 1, 0, 100); return `${who} learns what crossing you costs. People are a little more careful around you.`;
    case "nothing": return "You let it go.";
    default: return `You deal with ${who} and it's done.`;
  }
}

export function resolveDynamic(s: SaveState, e: PendingEvent, optionId: string): string {
  const p = e.person ? s.people[e.person] : undefined;
  const o = e.other ? s.people[e.other] : undefined;
  const [, aimed, value] = optionId.split(":");
  // "kindness@other": which of the two women in an event between them it lands on (engine/goings).
  const [effect, on = "main"] = (aimed ?? "").split("@");
  const def = DYNAMIC_EFFECTS[effect];
  const pairDef = PAIR_EFFECTS[effect];
  if (!def && !pairDef) return "";
  // Not every follow-up is about a slave: a promise to a citizen, a trader, a stranger comes back
  // too. Then the effect lands on your name in the city instead of on her.
  let line: string;
  if (pairDef) line = p && o ? (on === "other" ? pairDef.run(s, o, p) : pairDef.run(s, p, o)) : "";
  else if (p && o && on === "both") line = [def.run(s, p, value || undefined), def.run(s, o, value || undefined)].join("; ");
  else if (o && on === "other") line = def.run(s, o, value || undefined);
  else line = p ? def.run(s, p, value || undefined) : npcEffect(s, effect, value, e.seed);
  s.events = s.events.filter((x) => x.id !== e.id);
  const label = e.options.find((x) => x.id === optionId)?.label ?? "";
  const keys = [p?.id, o?.id].filter((x): x is string => !!x);
  if (keys.length) closeHooks(s, keys);
  chronicle(s, { keys: keys.length ? keys : ["city"], title: e.written?.title, text: `${e.seed.split(/\n/)[0].slice(0, 200)} You chose: ${label}. ${line}.`, hook: e.hook });
  s.notifications.push({ id: `n-${e.id}`, week: s.arcology.week, text: p ? `${p.name}: ${line}` : line, kind: "info", person: p?.id, seen: false });
  return line;
}

/** Whether the dynamic generator is pointed at a model that will actually write this material.
 *  Surfaced in the UI rather than left as a surprise: a cloud model in the narrator slot produces
 *  refusals and half-written scenes, and the player should be told that before they wonder why. */
export function dynamicReadiness(s: SaveState): { ready: boolean; local: boolean; note: string } {
  if (!modelsAvailable()) return { ready: false, local: false, note: "No model is configured. Written events still happen, but generated events need a model." };
  const local = isLocalModel(s.models.narrator_model);
  return {
    ready: true,
    local,
    note: local
      ? "Using a local model. Nothing it writes leaves your machine."
      : "Using a hosted model. Hosted models often refuse or tone down this game's content, so a local model in the narrator slot works better here.",
  };
}
