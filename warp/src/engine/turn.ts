/**
 * THE SCENE TURN — two models, one world, and a set of guards that assume both of them lie.
 *
 * The narrator writes prose. The bookkeeper turns that prose into world change. Neither is
 * trusted: the narrator invents people and teleports them, and the bookkeeper files departures
 * that never happened and memories for people who were in another building. Every guard in this
 * file exists because of a specific failure of that kind, and each one degrades to "nothing
 * happened" rather than to a corrupted world.
 *
 * The turn also works with NO MODEL AT ALL. `offlineBeat` renders a plain, honest stage direction
 * from state — who is there, what their bodies are doing, what the action was — and the rest of the
 * pipeline runs identically. You lose the paragraph. You do not lose the game.
 */
import { inventsLaw } from "./lawguard";
import { captureInstructions, keep, houseRules, agreementsOf } from "./agreements";
import type { ActionMode, Person, SaveState, TurnEntry } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { BOOKKEEPER_SYSTEM, NARRATOR_SYSTEM, bookkeeperContext, digest } from "./prompts";
import { applyTreatment, refresh, type Treatment } from "./obedience";
import { clamp, shove, tickPsyche, addState, band, tensionCue } from "./psyche";
import { remember, learn } from "./memory";
import { moveEdge, addRole, startRumor } from "./social";
import { snapshot } from "./state";
import { hash } from "./rng";
import { resolveAct, actDirective, type ActOutcome } from "./intimacy";
import { writeAct, summarise, type Written } from "./writer";
import { ACT_BY_ID } from "../data/intimacy";
import { getLocalImage } from "../config";
import { generateLocalImage, DEFAULT_NEGATIVE } from "../lib/diffusion";
import { controlPrompt, CONTROL_NEGATIVE } from "../lib/dollrender";
import { scenePrompt, lockSignature, portraitPrompt, visualSignature } from "./portrait";

export interface Diff {
  summary?: string;
  minutes?: number;
  location?: string;
  present_add?: string[];
  present_remove?: string[];
  psyche?: { id: string; relaxation_delta?: number; mood?: string; states_add?: string[]; states_remove?: string[] }[];
  treatment?: { id: string; kind: Treatment["kind"]; size: number; why: string }[];
  memories?: { id: string; content: string; importance?: number; charge?: string; core?: boolean }[];
  edges?: { from: string; to: string; warmth_delta?: number; trust_delta?: number; attraction_delta?: number; note?: string; roles_add?: string[] }[];
  facts_learned?: { id: string; fact: string }[];
  body?: { id: string; field: string; value: string }[];
  rumors?: { content: string; truth?: "true" | "distorted" | "false"; from?: string }[];
  canon_add?: string[];
  /** Standing instructions she accepted about how she treats the owner. */
  agreements?: { id: string; rule: string; calls?: string }[];
  agreements_drop?: { id: string; rule: string }[];
}

export interface TurnResult {
  prose: string;
  entry: TurnEntry;
  notes: string[];
}

const MODE_FRAME: Record<ActionMode, (a: string) => string> = {
  do: (a) => `## THE PLAYER'S ACTION\n${a}\nWrite this happening, all the way through, and how the people it involves react.`,
  say: (a) => `## THE PLAYER SAYS\n"${a}"\nWrite how the people it's said to answer and what they do about it. Don't repeat the line back.`,
  think: (a) => `## THE PLAYER IS THINKING (silent; nobody hears it)\n${a}\nUse it to decide what the scene pays attention to. Nobody reacts to it.`,
  story: (a) => `## DIRECTION FOR THE WRITER (not something that happens in the scene; never quote it)\n${a}`,
};

export async function runTurn(
  s: SaveState,
  action: string,
  mode: ActionMode = "do",
  opts?: { onDelta?: (c: string) => void; onReset?: () => void; signal?: AbortSignal },
): Promise<TurnResult> {
  snapshot(s);
  const started = Date.now();
  const notes: string[] = [];
  s.turn++;

  // The scene's own clock ticks before anything is written: bodies drift toward their resting
  // point between beats, the same as they do between weeks.
  for (const p of present(s)) { p.psyche.prev_relaxation = p.psyche.relaxation; tickPsyche(p.psyche); }

  // Anything you just told them about how to treat you is kept, whatever the narrator does with it.
  if (mode === "say" || mode === "do") notes.push(...captureInstructions(s, action, present(s).filter((p) => p.status !== "free" || s.player.owned_by !== p.id)));

  let prose = "";
  let tokensIn = 0, tokensOut = 0, cost = 0;
  let bookkeeping: TurnEntry["bookkeeping"] = "offline";

  if (modelsAvailable()) {
    const res = await call({
      system: NARRATOR_SYSTEM,
      user: `${digest(s, action)}\n\n## THIS TURN\n${MODE_FRAME[mode](action)}`,
      model: s.models.narrator_model,
      fallback: s.models.fallback_model,
      onDelta: opts?.onDelta,
      onReset: opts?.onReset,
      signal: opts?.signal,
      maxTokens: 1200,
    });
    if (res.ok) {
      prose = salvage(res.text);
      tokensIn += res.usage.prompt_tokens; tokensOut += res.usage.completion_tokens; cost += res.usage.cost ?? 0;
    } else {
      notes.push(`the narrator did not answer (${res.error ?? "unknown"}) — the turn stands as a stage direction`);
    }
  }
  if (!prose) prose = offlineBeat(s, action, mode);

  // ── the bookkeeper ────────────────────────────────────────────────────────────────────────
  let diff: Diff | null = null;
  if (modelsAvailable()) {
    const res = await call({
      system: BOOKKEEPER_SYSTEM,
      user: `${bookkeeperContext(s)}\n\n## THE TURN\nOwner (${mode}): ${action}\n\n${prose}`,
      model: s.models.bookkeeper_model,
      fallback: s.models.fallback_model,
      json: true,
      signal: opts?.signal,
    });
    if (res.ok) {
      diff = parseJson<Diff>(res.text);
      tokensIn += res.usage.prompt_tokens; tokensOut += res.usage.completion_tokens; cost += res.usage.cost ?? 0;
      bookkeeping = diff ? (isThin(diff, prose) ? "thin" : "ok") : "failed";
      if (!diff) notes.push("the bookkeeper returned nothing usable — nobody remembers this turn until it is re-run");
      if (bookkeeping === "thin") notes.push("the bookkeeper recorded almost nothing despite a substantial turn");
    } else {
      bookkeeping = "failed";
      notes.push(`bookkeeping failed (${res.error ?? "unknown"})`);
    }
  }

  if (diff) notes.push(...applyDiff(s, diff, prose));
  else if (!modelsAvailable()) applyOfflineDiff(s, action, mode);

  // ── detectors: what the narrator did wrong, quoted back at it next turn ────────────────────
  s.corrections = {};
  const filler = findFiller(prose);
  if (filler) { s.corrections.filler = filler; s.integrity.fires.push({ week: s.arcology.week, kind: "filler", detail: filler }); }
  const maxim = findMaxim(prose);
  if (maxim) { s.corrections.maxim = maxim; s.integrity.fires.push({ week: s.arcology.week, kind: "maxim", detail: maxim }); }
  const echo = findEcho(prose, action);
  if (echo) { s.corrections.echo = echo; s.integrity.fires.push({ week: s.arcology.week, kind: "echo", detail: echo }); }
  const reprint = findReprint(prose, s);
  if (reprint) { s.corrections.reprint = reprint; s.integrity.fires.push({ week: s.arcology.week, kind: "reprint", detail: reprint }); }
  if (s.integrity.fires.length > 200) s.integrity.fires = s.integrity.fires.slice(-200);

  const entry: TurnEntry = {
    turn: s.turn,
    week: s.arcology.week,
    action, mode, prose,
    summary: diff?.summary ?? offlineSummary(s, action, mode),
    present: [...s.scene.present],
    location: s.scene.location,
    time: s.scene.time,
    bookkeeping,
    tokens_in: tokensIn, tokens_out: tokensOut, cost,
  };
  s.history.push(entry);
  if (s.history.length > 200) s.history.shift();
  s.telemetry.push({ turn: s.turn, ms: Date.now() - started, tokens_in: tokensIn, tokens_out: tokensOut, cost, ts: Date.now() });
  if (s.telemetry.length > 300) s.telemetry.shift();

  advanceClock(s, diff?.minutes ?? 10);
  for (const p of present(s)) refresh(p, s.memory[p.id]);
  return { prose, entry, notes };
}

/**
 * AN ACT, PLAYED AS A SCENE.
 *
 * The interaction loop, end to end: the engine resolves what actually happened to her (arousal,
 * the nervous system, bond, resentment, skills, whatever she has just found out about herself),
 * hands the narrator that as law, and — where a local sampler is configured — paints the moment.
 * The prose and the picture are downstream of the resolution, never the other way round, so a
 * model that refuses, times out or writes something else does not change a single number.
 */
export async function runActTurn(
  s: SaveState,
  personId: string,
  actId: string,
  opts?: { onDelta?: (c: string) => void; onReset?: () => void; onImage?: (url: string) => void; onProgress?: (n: string) => void; public?: boolean; signal?: AbortSignal; lead?: boolean },
): Promise<{ outcome: ActOutcome | { error: string }; prose: string; notes: string[]; written?: Written }> {
  const p = s.people[personId];
  if (!p) return { outcome: { error: "she is not here" }, prose: "", notes: [] };

  snapshot(s);
  const outcome = resolveAct(s, p, actId, { public: opts?.public });
  if ("error" in outcome) return { outcome, prose: "", notes: [] };
  // Written before the model is asked, so there is always a scene on the page even while the
  // narrator is thinking, and a scene left behind if it never answers.
  const written = writeAct(s, p, outcome, { lead: opts?.lead });

  s.turn++;
  if (!s.scene.present.includes(personId)) s.scene.present.push(personId);
  const act = ACT_BY_ID[actId];
  const notes: string[] = [];
  let prose = "";
  let tokensIn = 0, tokensOut = 0, cost = 0;

  if (modelsAvailable()) {
    const res = await call({
      system: NARRATOR_SYSTEM,
      user: `${digest(s, act.name, p.id)}\n\n${actDirective(s, p, outcome)}`,
      model: s.models.narrator_model,
      fallback: s.models.fallback_model,
      onDelta: opts?.onDelta,
      onReset: opts?.onReset,
      signal: opts?.signal,
      maxTokens: 1100,
      temperature: 0.95,
    });
    if (res.ok) {
      prose = salvage(res.text);
      tokensIn = res.usage.prompt_tokens; tokensOut = res.usage.completion_tokens; cost = res.usage.cost ?? 0;
    } else notes.push(`the narrator did not answer (${res.error ?? "unknown"})`);
  }
  if (!prose) prose = [...written.paragraphs, written.said ? `"${written.said}"` : ""].filter(Boolean).join("\n\n");

  const entry: TurnEntry = {
    turn: s.turn, week: s.arcology.week,
    action: act.name, mode: "do", prose,
    summary: summarise(p, outcome),
    present: [...s.scene.present], location: s.scene.location, time: s.scene.time,
    bookkeeping: modelsAvailable() ? "ok" : "offline",
    tokens_in: tokensIn, tokens_out: tokensOut, cost,
  };
  s.history.push(entry);
  if (s.history.length > 200) s.history.shift();
  advanceClock(s, 45);

  // The picture, after the turn has committed — so the prose never waits on the GPU and a frame
  // that fails to paint is silent.
  if (getLocalImage()) {
    try {
      lockSignature(p, getLocalImage()?.prompt_style === "tags" ? "tags" : "natural");
      const sp = scenePrompt(s, { act: actId, people: [personId] });
      const img = await generateLocalImage({ ...sp, aspect: "landscape", onProgress: opts?.onProgress, signal: opts?.signal });
      entry.image = img.url;
      opts?.onImage?.(img.url);
    } catch (e) { notes.push(`no picture: ${(e as Error).message}`); }
  }

  refresh(p, s.memory[p.id]);
  return { outcome, prose, notes, written };
}

/** Her portrait, on demand. The clause that draws her is locked the first time and reused after. */
export async function paintPortrait(s: SaveState, personId: string, onProgress?: (n: string) => void): Promise<string | null> {
  const p = s.people[personId];
  if (!p || !getLocalImage()) return null;
  lockSignature(p, getLocalImage()?.prompt_style === "tags" ? "tags" : "natural");
  const { prompt, seed } = portraitPrompt(p);
  const img = await generateLocalImage({ prompt, seed, aspect: "portrait", onProgress });
  p.body.portrait_url = img.url;
  p.body.portrait_seed = img.seed;
  return img.url;
}

/**
 * THE REALISTIC PASS, OVER THE FIGURE THE GAME ALREADY DREW.
 *
 * The caller hands in a PNG of the vector doll — see lib/dollrender.ts for why that is the whole
 * trick — and it goes to the sampler as a ControlNet image. What comes back is the same body, at
 * the same proportions, in the same pose, made of skin instead of flat colour.
 *
 * The prompt is deliberately thin. The control image is already carrying her shape, and a prompt
 * that describes it again only gives the sampler a second opinion to argue with; the words are
 * left to do material and light, which is what the line art cannot say.
 */
export async function paintRealistic(
  s: SaveState, personId: string, poseDataUrl: string,
  opts?: { denoise?: number; onProgress?: (n: string) => void },
): Promise<string | null> {
  const p = s.people[personId];
  if (!p || !getLocalImage()) return null;
  const dialect = getLocalImage()?.prompt_style === "tags" ? "tags" : "natural";
  lockSignature(p, dialect);
  const worn = p.clothes === "no clothing" ? (dialect === "tags" ? "nude" : "wearing nothing") : `wearing ${p.clothes}`;
  const img = await generateLocalImage({
    prompt: controlPrompt(`${p.body.visual_signature ?? visualSignature(p, dialect)}, ${worn}`),
    negative: `${CONTROL_NEGATIVE}, ${DEFAULT_NEGATIVE}`,
    pose: poseDataUrl,
    denoise: opts?.denoise ?? 0.72,
    seed: p.body.portrait_seed ?? (hash(p.id) % 2147483647),
    aspect: "portrait",
    onProgress: opts?.onProgress,
  });
  p.body.portrait_url = img.url;
  p.body.portrait_seed = img.seed;
  return img.url;
}

function present(s: SaveState): Person[] {
  return s.scene.present.map((id) => s.people[id]).filter(Boolean) as Person[];
}

/* ── APPLYING THE DIFF, WITH THE GUARDS ON ─────────────────────────────────────────────────── */

export function applyDiff(s: SaveState, d: Diff, prose: string): string[] {
  const notes: string[] = [];
  // Nothing that adds clauses, exemptions or amendments to a law gets recorded as true.
  d = {
    ...d,
    canon_add: d.canon_add?.filter((c) => !inventsLaw(s, c)),
    rumors: d.rumors?.filter((r) => !inventsLaw(s, r.content)),
    memories: d.memories?.filter((m) => !inventsLaw(s, m.content)),
    facts_learned: d.facts_learned?.filter((f) => !inventsLaw(s, f.fact)),
  };
  const wasPresent = new Set(s.scene.present);

  // LOCATION
  if (d.location && d.location !== s.scene.location) {
    s.scene.location = d.location;
    s.scene.arrivals_pending = [];
  }

  // PRESENCE — with the departure evidence guard. A character who was in the room when the turn
  // began cannot be moved out of it unless the PROSE shows them leaving. The failure this stops is
  // specific and silent: the bookkeeper empties a room the narrator wrote as full, and the next
  // turn opens on nobody.
  for (const id of d.present_remove ?? []) {
    if (!wasPresent.has(id)) continue;
    const p = s.people[id];
    if (!p) continue;
    if (!showsDeparture(prose, p.name)) {
      notes.push(`bookkeeping correction: ${p.name} stays — the prose never showed her leave`);
      continue;
    }
    s.scene.present = s.scene.present.filter((x) => x !== id);
  }
  for (const id of d.present_add ?? []) {
    if (!s.people[id] || s.scene.present.includes(id)) continue;
    // Nobody arrives without a door: the name has to be on the page.
    if (!prose.toLowerCase().includes((s.people[id].name || "").toLowerCase())) {
      notes.push(`bookkeeping correction: ${s.people[id].name} was not written into the room`);
      continue;
    }
    s.scene.present.push(id);
  }
  s.scene.present_prev = [...wasPresent];

  // Only witnesses learn. Everything below this line is restricted to people who were in the room.
  const witness = (id: string): boolean => wasPresent.has(id) || s.scene.present.includes(id);

  for (const row of d.psyche ?? []) {
    const p = s.people[row.id];
    if (!p || !witness(row.id)) continue;
    if (typeof row.relaxation_delta === "number") shove(p.psyche, clamp(row.relaxation_delta, -4, 4));
    if (row.mood) p.psyche.mood = row.mood.slice(0, 40);
    for (const st of row.states_add ?? []) addState(p.psyche, st.slice(0, 60), s.arcology.week);
    for (const st of row.states_remove ?? []) {
      p.psyche.active_states = p.psyche.active_states.filter((x) => x !== st);
      delete p.psyche.state_ages[st];
    }
  }

  for (const t of d.treatment ?? []) {
    const p = s.people[t.id];
    if (!p || !witness(t.id)) continue;
    applyTreatment(p, { kind: t.kind, size: clamp(t.size ?? 3, 0, 10), why: (t.why ?? "").slice(0, 120) } as Treatment, s.arcology.week);
  }

  for (const m of d.memories ?? []) {
    const p = s.people[m.id];
    const mem = s.memory[m.id];
    if (!p || !mem || !witness(m.id)) continue;
    remember(mem, {
      content: m.content.slice(0, 200),
      week: s.arcology.week,
      importance: clamp(m.importance ?? 5, 0, 10),
      charge: (["warm", "cold", "sharp", "dull", "bright"].includes(String(m.charge)) ? m.charge : "dull") as "warm",
      where: s.scene.location,
      core: !!m.core,
    });
  }

  for (const e of d.edges ?? []) {
    if (!s.people[e.from] && e.from !== "owner") continue;
    if (!s.people[e.to] && e.to !== "owner") continue;
    moveEdge(s.edges, e.from, e.to, {
      warmth: clamp(e.warmth_delta ?? 0, -25, 25),
      trust: clamp(e.trust_delta ?? 0, -25, 25),
      attraction: clamp(e.attraction_delta ?? 0, -15, 15),
    });
    for (const role of e.roles_add ?? []) addRole(s.edges, e.from, e.to, role.slice(0, 30));
  }

  for (const f of d.facts_learned ?? []) {
    const mem = s.memory[f.id];
    if (mem && witness(f.id)) learn(mem, f.fact.slice(0, 160), s.arcology.week);
  }

  for (const b of d.body ?? []) {
    const p = s.people[b.id];
    if (!p) continue;
    if (b.field === "appearance_now") p.body.appearance_now = b.value.slice(0, 200);
    else if (b.field === "clothes") p.clothes = b.value.slice(0, 60);
    else if (b.field === "collar") p.collar = b.value.slice(0, 60);
  }

  for (const r of d.rumors ?? []) {
    startRumor(s, r.content.slice(0, 160), { truth: r.truth ?? "true", from: r.from && s.people[r.from] ? r.from : undefined });
  }

  // Standing orders she agreed to, kept for every scene after this one.
  for (const a of (d.agreements ?? []).slice(0, 3)) {
    if (!a?.rule) continue;
    const rule = String(a.rule).slice(0, 140);
    const calls = a.calls ? String(a.calls).slice(0, 32) : undefined;
    if (a.id === "household") { keep(houseRules(s), { rule, week: s.arcology.week, by: "you", calls }); if (calls) s.player.address = calls; }
    else if (s.people[a.id]) keep(agreementsOf(s.people[a.id]), { rule, week: s.arcology.week, by: "you", calls });
  }
  for (const a of d.agreements_drop ?? []) {
    const list = a.id === "household" ? houseRules(s) : s.people[a.id] ? agreementsOf(s.people[a.id]) : null;
    if (list) { const i = list.findIndex((x) => x.rule.toLowerCase().includes(String(a.rule).toLowerCase().slice(0, 20))); if (i >= 0) list.splice(i, 1); }
  }

  // Canon is a constraint on what may exist, so it is the one field a single turn cannot spray.
  for (const c of (d.canon_add ?? []).slice(0, 2)) {
    const text = c.slice(0, 200);
    if (!s.canon.includes(text)) s.canon.push(text);
  }
  if (s.canon.length > 30) s.canon = s.canon.slice(-30);

  return notes;
}

const DEPART = /\b(left|leaves|leaving|exits?|exited|went out|walked out|headed off|withdrew|dismissed|gone|stepped out|sent (her|him|them) (away|back|out))\b/i;
/** Somebody else doing the leaving, in the same sentence as the person who is not. */
const OTHER_SUBJECT = /\b(the others|everyone else|everybody else|the rest of them|they|we|the guards?|the crowd)\b/i;

/**
 * DID THE PROSE ACTUALLY SHOW THIS PERSON GOING?
 *
 * The first version of this asked whether a departure verb appeared within 160 characters of the
 * name, which is the shape Weft's guard has, and it passes this sentence:
 *
 *     Mara was still sitting there when the others left the floor above.
 *
 * — a sentence that says the exact opposite. A proximity window cannot tell whose verb it is. So:
 * work sentence by sentence, require the verb to come AFTER the name, and reject when somebody
 * else is standing between the two doing the leaving. Name probes use each word of the name,
 * because prose says "Mara left" and never "Mara Volkova left".
 */
export function showsDeparture(prose: string, name: string): boolean {
  const probes = [name, ...name.split(/\s+/)].filter((w) => w.length > 2);
  for (const sentence of prose.split(/(?<=[.!?])\s+/)) {
    for (const probe of probes) {
      const at = sentence.toLowerCase().indexOf(probe.toLowerCase());
      if (at < 0) continue;
      const after = sentence.slice(at + probe.length);
      const verb = DEPART.exec(after);
      if (!verb) continue;
      const between = after.slice(0, verb.index);
      if (OTHER_SUBJECT.test(between)) continue;   // it is somebody else who left
      return true;
    }
  }
  return false;
}

/* ── DETECTORS ─────────────────────────────────────────────────────────────────────────────── */

/** Gestures a model reaches for when it has nothing to say about what is actually happening. */
const FILLER = /\b(breath (catches|caught|hitches|hitched)|throat (moves|moved|works|worked)|(fingers?|hands?) (tap|taps|tapped|twitch|twitches|twitched|curl|curls|curled|flex|flexes|flexed)|shifts? (her|his|their) weight|shoulders? (settle|settled|drop|dropped|loosen|loosened)|jaw (tightens|tightened|sets|set|works|worked)|something (tightened|shifted|flickered|passed|moved|hardened|softened)|the rhythm falters|exhales? through (her|his|their) nose|doesn't look at you|does not look at you)\b/i;

/** A sentence of filler body language standing in for the action. Quoted back next turn. */
export function findFiller(prose: string): string | undefined {
  for (const sentence of prose.split(/(?<=[.!?])\s+/)) {
    if (sentence.includes('"')) continue;
    if (FILLER.test(sentence)) return sentence.trim().slice(0, 180);
  }
  return undefined;
}

const QUOTED = /"([^"]{3,160})"/g;
/** Fragments and closed sayings: "Not like this." "Almost." "Some things don't need saying." */
const APHORISM = /\b(always|never|everyone|everybody|nobody|no one|people|the world|life|men|women|some things|that's how it|that is how it)\b/i;

/** A portable line of wisdom or a dramatic fragment where a person should have said something. */
export function findMaxim(prose: string): string | undefined {
  for (const m of prose.matchAll(QUOTED)) {
    const said = m[1].trim();
    const words = said.split(/\s+/);
    if (APHORISM.test(said) && !/\b(I|you|we|me|my|your)\b/.test(said) && words.length <= 18) return said;
  }
  // Narration that ends a paragraph on a fragment: "Almost." "Not quite." "Not yet."
  for (const para of prose.split(/\n+/)) {
    const last = para.trim().split(/(?<=[.!?])\s+/).at(-1) ?? "";
    if (!last.includes('"') && /^(almost|not quite|not yet|not like this|not really|just barely|nothing more|and then nothing)[.!]?$/i.test(last)) return last;
  }
  return undefined;
}

/** The narrator handing the owner's own line back — quoted at them or demanded again. */
export function findEcho(prose: string, action: string): string | undefined {
  const a = action.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "");
  if (a.split(/\s+/).length < 5) return undefined;
  const p = prose.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  return p.includes(a) ? action.trim().slice(0, 140) : undefined;
}

/** The narrator reprinting its own previous turn. */
export function findReprint(prose: string, s: SaveState): string | undefined {
  const prev = s.history.at(-1)?.prose;
  if (!prev) return undefined;
  const sentences = prose.split(/(?<=[.!?])\s+/).filter((x) => x.length > 40);
  for (const sen of sentences) if (prev.includes(sen.trim())) return sen.trim().slice(0, 160);
  return undefined;
}

function isThin(d: Diff, prose: string): boolean {
  const filed = (d.psyche?.length ?? 0) + (d.memories?.length ?? 0) + (d.edges?.length ?? 0) + (d.treatment?.length ?? 0);
  return filed === 0 && prose.split(/\s+/).length > 120;
}

/** Prose salvage: models wrap the turn in headers, labels, or an unclosed preamble. Take the story. */
export function salvage(raw: string): string {
  let t = raw.trim();
  t = t.replace(/^\s*(?:#+\s*)?(?:turn\s*\d+|scene|narration|response)\s*[:\-—]?\s*/i, "");
  t = t.replace(/^\s*```[a-z]*\s*/i, "").replace(/```\s*$/i, "");
  // A model that "redrafts" hands you two versions; the last one is the one it meant.
  const redraft = /(?:^|\n)\s*(?:final|revised|draft\s*2)\s*[:\-—]\s*\n?/i.exec(t);
  if (redraft) t = t.slice(redraft.index + redraft[0].length);
  return t.trim();
}

/* ── THE OFFLINE PATH ──────────────────────────────────────────────────────────────────────── */

/** No key, no local server: the turn still happens, rendered as a stage direction from state. It
 *  is deliberately plain rather than pretending to be prose — a flat true sentence is better
 *  company than a generated one that is wrong. */
export function offlineBeat(s: SaveState, action: string, mode: ActionMode): string {
  const people = present(s);
  const lines: string[] = [];
  lines.push(`${s.scene.time} — ${s.scene.location}.`);
  if (mode === "say") lines.push(`You say: "${action}"`);
  else if (mode === "think") lines.push(`(You think: ${action})`);
  else if (mode === "story") lines.push(`[direction: ${action}]`);
  else lines.push(`You ${action.replace(/^i\s+/i, "")}.`);
  if (!people.length) lines.push(`Nobody is here.`);
  for (const p of people) {
    const cue = tensionCue(p.psyche);
    const mood = p.psyche.mood && p.psyche.mood !== band(p.psyche) && p.psyche.mood !== "flat" ? `, ${p.psyche.mood}` : "";
    lines.push(`${p.name} — ${band(p.psyche)}${cue ? `, ${cue}` : ""}. ${p.bond.read.label}${mood}.`);
  }
  return lines.join("\n");
}

function offlineSummary(s: SaveState, action: string, mode: ActionMode): string {
  return `${mode === "say" ? "Said" : mode === "think" ? "Thought" : "Did"}: ${action.slice(0, 120)} (${s.scene.present.length} present)`;
}

/** With no bookkeeper, the engine still records the one thing it can be sure of: the people in the
 *  room registered that the owner was there and did something. */
function applyOfflineDiff(s: SaveState, action: string, mode: ActionMode): void {
  if (mode === "think" || mode === "story") return;
  for (const p of present(s)) {
    const mem = s.memory[p.id];
    if (mem) remember(mem, { content: `the owner: ${action.slice(0, 120)}`, week: s.arcology.week, importance: 3, charge: "dull", where: s.scene.location });
  }
}

/** Time. The scene clock and the week clock are the same clock, read at different resolutions. */
export function advanceClock(s: SaveState, minutes: number): void {
  const m = /Week (\d+), (\w+) (\d{2}):(\d{2})/.exec(s.scene.time);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  let week = s.arcology.week, dayIdx = 0, hh = 9, mm = 0;
  if (m) { week = Number(m[1]); dayIdx = Math.max(0, days.indexOf(m[2])); hh = Number(m[3]); mm = Number(m[4]); }
  mm += clamp(minutes, 0, 720);
  hh += Math.floor(mm / 60); mm %= 60;
  dayIdx += Math.floor(hh / 24); hh %= 24;
  if (dayIdx > 6) dayIdx = 6;    // the week ends when you end it, not when the clock says so
  s.scene.time = `Week ${week}, ${days[dayIdx]} ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
