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
import type { PendingEvent, Person, SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable, isLocalModel } from "../config";
import { clamp, shove, addState } from "./psyche";
import { applyTreatment, read } from "./obedience";
import { remember } from "./memory";
import { startRumor } from "./social";
import { shiftDominion, romanceOf } from "./romance";
import { resolveAct } from "./intimacy";
import { FETISH_BY_ID, ACT_BY_ID } from "../data/intimacy";
import { band, wear } from "./psyche";

/** THE CLOSED TABLE. A generated option may name one of these and nothing else. */
export const DYNAMIC_EFFECTS: Record<string, { note: string; run: (s: SaveState, p: Person, value?: string | number) => string }> = {
  kindness: { note: "you are good to her about it", run: (s, p, v) => { applyTreatment(p, { kind: "kindness", size: Number(v) || 4, why: "the way you handled it" }, s.arcology.week); shove(p.psyche, 0.8); return "she was not expecting that"; } },
  cruelty: { note: "you make it worse for her, deliberately", run: (s, p, v) => { applyTreatment(p, { kind: "cruelty", size: Number(v) || 5, why: "the way you handled it" }, s.arcology.week); shove(p.psyche, -1.5, { hard: true }); return "she took it and filed it"; } },
  coercion: { note: "you make the rule clear at her expense", run: (s, p, v) => { applyTreatment(p, { kind: "coercion", size: Number(v) || 4, why: "the position was made clear" }, s.arcology.week); return "she understood the position"; } },
  recognition: { note: "you treat her as somebody", run: (s, p, v) => { applyTreatment(p, { kind: "recognition", size: Number(v) || 5, why: "you treated her as somebody" }, s.arcology.week); return "she has not been looked at like that in a while"; } },
  promise_kept: { note: "you do the thing you said you would", run: (s, p, v) => { applyTreatment(p, { kind: "promise_kept", size: Number(v) || 6, why: "you kept your word" }, s.arcology.week); return "you kept your word, and she noticed the fact of it more than the thing"; } },
  promise_broken: { note: "you go back on it", run: (s, p, v) => { applyTreatment(p, { kind: "promise_broken", size: Number(v) || 6, why: "you went back on it" }, s.arcology.week); return "she has stopped expecting things"; } },
  act: { note: "it becomes a scene — name an act id", run: (s, p, v) => { const out = resolveAct(s, p, String(v)); return "error" in out ? "nothing came of it" : `${ACT_BY_ID[String(v)]?.what ?? "it happened"} — she ${out.landing} it`; } },
  arouse: { note: "she is wound up by it", run: (_s, p, v) => { p.psyche.arousal = clamp(p.psyche.arousal + (Number(v) || 20), 0, 100); return "she is wound up and doing a bad job of hiding it"; } },
  dominion_up: { note: "she gets her way", run: (s, p, v) => { shiftDominion(s, p, Number(v) || 6, "she got her way"); return "she got her way, and she has noticed that she can"; } },
  dominion_down: { note: "she is put back in her place", run: (s, p, v) => { shiftDominion(s, p, -(Number(v) || 6), "she was put back in her place"); return "she has been reminded where she stands"; } },
  cash: { note: "it costs or makes money — value is the amount, negative to spend", run: (s, _p, v) => { const n = Number(v) || -2000; s.arcology.cash += n; return `¤${Math.abs(n).toLocaleString()} ${n < 0 ? "spent" : "made"}`; } },
  rep: { note: "the arcology's opinion moves", run: (s, _p, v) => { const n = Number(v) || -200; s.arcology.rep = Math.max(0, s.arcology.rep + n); return `standing ${n >= 0 ? "+" : ""}${n}`; } },
  rumor: { note: "it gets around — value is what people say", run: (s, p, v) => { startRumor(s, String(v ?? `something about ${p.name}`), { about: p.id, salience: 7 }); return "it is around the building by the morning"; } },
  scar: { note: "she carries it permanently — value is the memory in her terms", run: (s, p, v) => { const mem = s.memory[p.id]; if (mem) remember(mem, { content: String(v ?? "the thing that happened"), week: s.arcology.week, importance: 9, charge: "sharp", core: true }); addState(p.psyche, "what happened", s.arcology.week); return "she will be carrying that one"; } },
  nothing: { note: "you do not engage", run: () => "nothing was done about it" },
};

interface GeneratedEvent {
  situation?: string;
  options?: { label?: string; note?: string; effect?: string; value?: string | number }[];
}

/** Who is worth building a situation around this week — the one with the most live material on
 *  her record, rather than a random pick. */
export function pickSubject(s: SaveState): Person | null {
  const pool = Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);
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
function dossier(s: SaveState, p: Person): string {
  const r = read(p, s.memory[p.id]);
  const rom = romanceOf(p);
  const mem = s.memory[p.id];
  const fetish = p.persona.fetishes.filter((f) => f.name !== "none").map((f) => `${f.name} (${f.strength}${f.known ? ", you know" : ", you do not know yet"})`).join(", ");
  const lines = [
    `HER: ${p.name}, ${p.age}, ${p.origin.nationality}. Was a ${p.origin.career}. ${p.origin.background}`,
    `BODY: ${p.body.appearance_facts} Currently: ${p.body.appearance_now}. Wearing ${p.clothes}.`,
    p.womb.fetuses.length ? `${p.womb.weeks} weeks pregnant.` : "",
    p.body.lactation ? "Lactating." : "",
    `DOING: ${p.assignment}${p.facility ? ` in the ${s.arcology.facilities[p.facility]?.name}` : ""}.`,
    `WIRED: ${fetish || "no particular fetish"}${p.persona.quirk ? ` · quirk: ${p.persona.quirk.id}` : ""}${p.persona.flaw ? ` · flaw: ${p.persona.flaw.id}` : ""}${p.persona.paraphilia ? ` · PARAPHILIA: ${p.persona.paraphilia}` : ""}.`,
    `HER BODY RIGHT NOW: ${band(p.psyche)}, arousal ${Math.round(p.psyche.arousal)}, mood ${p.psyche.mood}.${p.psyche.active_states.length ? ` Holding: ${p.psyche.active_states.join(", ")}.` : ""}${wear(p.psyche) > 0.5 ? " Worn down — ordinary friction has stopped landing on her." : ""}`,
    `TOWARD YOU: ${r.label} (${r.devotion}), ${r.trust_label} (${r.trust}). ${Math.round(r.fragility * 100)}% of her obedience is fear rather than bond. Resentment ${Math.round(p.bond.resentment)}, hope ${Math.round(p.bond.hope)}.`,
    `STANDING: ${rom.standing}${rom.dominion > -80 ? `, and she decides ${Math.round(rom.dominion)} out of 100 around here` : ""}.`,
    `SPEAKS: ${p.persona.speech_pattern}`,
    `TRAITS: ${p.persona.core_traits.join("; ")}`,
    p.persona.texture.length ? `SMALL TRUE THINGS: ${p.persona.texture.join("; ")}` : "",
    mem?.episodic.length ? `SHE REMEMBERS: ${mem.episodic.slice(-5).map((m) => `${m.content} (wk ${m.week})`).join(" | ")}` : "",
    p.acts && Object.keys(p.acts).length ? `WHAT HAS BEEN DONE TO HER: ${Object.entries(p.acts).map(([a, n]) => `${a} ×${n}`).join(", ")}` : "",
    `THE PLACE: ${s.arcology.name}, week ${s.arcology.week}. ${Object.keys(s.arcology.doctrines).length ? `Its doctrine: ${Object.keys(s.arcology.doctrines).join(", ")}.` : "No doctrine of its own yet."}`,
  ];
  return lines.filter(Boolean).join("\n");
}

const SYSTEM = `You invent ONE situation for an adult game set in an arcology — a private city-state with a legal, ordinary, administered slave economy. You are given one woman's complete record. Invent the thing that HER particular week would actually throw up: not a generic slave event, hers, built out of what is on the record — her fetish, her flaw, what has been done to her, what she remembers, where she stands with the owner.

THE REGISTER. This is an explicit game for an audience that came for exactly that. Write plainly and crudely where the situation is crude: cunt, cock, ass, tits, cum, fuck. No euphemism, no clinical language, no fade to black, no moralising about the arrangement — nobody in this world is arguing about whether slavery is acceptable, any more than anybody in ours argues about whether rent is. Sex, degradation, discipline, breeding and public use are ordinary business here and the writing treats them as ordinary business.

WHAT YOU MAY NOT DO. Do not invent a person who is not on the record. Do not state her interior — write her body, her hands, what she says, how she says it. Do not resolve the situation: it ends on the moment the owner has to decide something. Everyone involved is an adult.

Output ONE strict JSON object and nothing else:
{"situation":"2-4 sentences, present tense, ending on the decision","options":[{"label":"what the owner does, 2-6 words","note":"what it costs or means, one short clause","effect":"one id from the list","value":"optional"}]}

Three or four options. Every one must be a genuinely different thing to do, and at least one must be a way of NOT engaging.`;

function effectList(): string {
  return Object.entries(DYNAMIC_EFFECTS).map(([id, e]) => `${id} — ${e.note}`).join("\n");
}

export async function generateDynamicEvent(s: SaveState, subject?: Person): Promise<PendingEvent | null> {
  if (!modelsAvailable()) return null;
  const p = subject ?? pickSubject(s);
  if (!p) return null;

  const res = await call({
    system: SYSTEM,
    user: `${dossier(s, p)}\n\nEFFECT IDS YOU MAY USE:\n${effectList()}\n\nACT IDS (for the "act" effect): ${Object.keys(ACT_BY_ID).join(", ")}`,
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 700,
    temperature: 1,
  });
  if (!res.ok) return null;
  const out = parseJson<GeneratedEvent>(res.text);
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
    seed: String(out.situation).slice(0, 900),
    options,
    week: s.arcology.week,
    severity: "notable",
  };
}

/** Resolve a generated option. The id carries the effect and its value, so nothing has to be
 *  stored alongside the event and a save that reloads mid-event still resolves correctly. */
export function resolveDynamic(s: SaveState, e: PendingEvent, optionId: string): string {
  const p = e.person ? s.people[e.person] : undefined;
  const [, effect, value] = optionId.split(":");
  const def = DYNAMIC_EFFECTS[effect];
  if (!p || !def) return "";
  const line = def.run(s, p, value || undefined);
  s.events = s.events.filter((x) => x.id !== e.id);
  s.notifications.push({ id: `n-${e.id}`, week: s.arcology.week, text: `${p.name}: ${line}`, kind: "info", person: p.id, seen: false });
  return line;
}

/** Whether the dynamic generator is pointed at a model that will actually write this material.
 *  Surfaced in the UI rather than left as a surprise: a cloud model in the narrator slot produces
 *  refusals and half-written scenes, and the player should be told that before they wonder why. */
export function dynamicReadiness(s: SaveState): { ready: boolean; local: boolean; note: string } {
  if (!modelsAvailable()) return { ready: false, local: false, note: "No model configured. The hand-written events still fire; the generated ones need a model." };
  const local = isLocalModel(s.models.narrator_model);
  return {
    ready: true,
    local,
    note: local
      ? "Pointed at your own machine. Nothing about what it writes goes anywhere."
      : "Pointed at a hosted model. It will decline or soften a good share of what this game asks for — put a local model in the narrator slot for this part.",
  };
}
