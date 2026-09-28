/**
 * SAGAS — long stories that grow out of this arcology and nowhere else.
 *
 * The hand-written arcs in data/story are the same in every run: the creditor, the preacher, the
 * plague ship. A saga starts from something only this game has: a law you wrote that the lower
 * levels won't keep, a slave who has hated you for thirty weeks, a stranger the narrator invented
 * who keeps turning up, the war two regions over, the citizens your gene program changed. The
 * narrator writes it a bible (premise, stakes, the people in it and what each wants, fears and
 * hides, three to five acts, and the ways it could end) and then one chapter at a time, each with
 * choices.
 *
 * What a choice does is not left to prose. Every option carries its effects from a closed table
 * (money, reputation, standing, security, how a person in it feels about you, a rumour), its
 * requirements from another (cash, reputation, a fact you've learned, someone's regard), the facts
 * it establishes, the endings it opens or closes, and a line of development for each person it
 * changes. Those are kept, and the next chapter is written from them, so what you did in act one
 * is what act three is about. People change on the page as well as in the numbers: every turn in a
 * character is recorded with its week, and the Story screen shows each of them becoming someone.
 *
 * Nothing is written until you open it. A chapter becoming due costs nothing; the model is called
 * when you ask to read it, once for a saga's bible and once per chapter (and once more if you write
 * your own answer instead of choosing one). Without a model, sagas don't start, and the written
 * arcs carry the story alone.
 */
import type { Person, SaveState } from "./types";
import type { Treatment } from "./obedience";
import { rng } from "./rng";
import { clamp } from "./psyche";
import { applyTreatment, read } from "./obedience";
import { startRumor } from "./social";
import { lawsOf } from "./court";
import { compliance, lawsLine } from "./lawlife";
import { LAW_BY_ID } from "../data/laws";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { REGION_STATE_WORD } from "../data/world";
import { worldOf, worldBrief } from "./world";
import { cultureBrief } from "./culture";
import { genomeOf, genomeBrief } from "./genome";
import { menialsOf } from "./menials";
import { facesOf, keyOf, meet, nationFrom, type Face } from "./faces";
import { deedsOf } from "./deeds";
import { HOUSE_STYLE } from "./prompts";
import { coarsen, REGISTER_TAIL } from "./register";
import { cultureOf, NORMS, NORM_IDS, normLine, pushNorm, type Norm } from "./culture";
import { resolveAct } from "./intimacy";
import { ACTS, ACT_BY_ID, FETISHES, FLAW_BY_ID, fetishBand } from "../data/intimacy";
import { household, societies } from "./compare";

/* ── what a saga is ─────────────────────────────────────────────────────────────────────────── */

export interface SagaSeed {
  /** Stable, so the same thing never seeds two sagas. */
  id: string;
  kind: "law" | "slave" | "face" | "cast" | "neighbour" | "world" | "gene" | "menials" | "doctrine" | "deed" | "city" | "desire" | "custom" | "dress" | "own";
  /** What it grew from, in a sentence, for the narrator. */
  text: string;
  /** Your people it's about. */
  people?: string[];
  /** Faces on file it's about. */
  faces?: string[];
}

export interface SagaChar {
  name: string;
  /** Yours (a person id), or a face on file (its key). */
  person?: string;
  face?: string;
  role: string;
  want: string;
  fear: string;
  secret?: string;
  /** Whether you know the secret yet. */
  known?: boolean;
  /** Toward you, −100 … 100. */
  toward: number;
  /** Where they are now, in a few words: "loyal, but lying about the ledger". */
  now: string;
  /** What they want in bed, and what they won't do (yet). */
  desire?: string;
  limit?: string;
  /** Every turn they've taken, in order. */
  turns: { week: number; text: string }[];
}

export interface SagaPath { id: string; label: string; state: "open" | "closed" | "taken" }

export type Need =
  | { cash: number } | { rep: number } | { standing: number } | { security: number }
  | { toward: { name: string; at: number } } | { fact: string }
  | { fetish: { name: string; fetish: string; at: number } } | { norm: { norm: Norm; at: number } };

export type Effect =
  | { cash: number } | { rep: number } | { standing: number } | { prosperity: number } | { security: number } | { crime: number }
  | { toward: { name: string; by: number } }
  | { treat: { name: string; kind: Treatment["kind"]; size: number } }
  | { rumor: string }
  /** Sex, for real: an act the intimacy engine runs on one of your slaves in the cast (her memory, fetishes and bond all move). */
  | { act: { name: string; act: string; public?: boolean } }
  | { arousal: { name: string; by: number } }
  | { libido: { name: string; by: number } }
  /** A taste grows, fades, or wakes: one of the game's fetishes, on one of your slaves. */
  | { fetish: { name: string; fetish: string; by: number } }
  /** What the city thinks is normal moves: public sex, cruelty, feet, owners serving… */
  | { norm: { norm: Norm; by: number } };

export interface SagaOption {
  label: string;
  /** Shown under the label: what it costs or risks, in a few words. */
  note?: string;
  needs?: Need[];
  /** What happens, written ahead: two to five sentences. */
  outcome: string;
  effects?: Effect[];
  develops?: { name: string; now?: string; turn?: string; desire?: string; limit?: string; secret_revealed?: boolean }[];
  facts?: string[];
  opens?: { id: string; label: string }[];
  closes?: string[];
  /** Moves the saga on to its next act. */
  advance?: boolean;
  /** Ends the saga, by this path. */
  ends?: string;
}

export interface Chapter { title: string; text: string; options: SagaOption[]; week: number }

export interface Saga {
  id: string;
  seed: SagaSeed;
  status: "unwritten" | "running" | "ended";
  title: string;
  premise: string;
  stakes: string;
  tone?: string;
  acts: string[];
  act: number;
  cast: SagaChar[];
  facts: string[];
  paths: SagaPath[];
  history: { week: number; title: string; text: string; chose: string; outcome: string; act: number }[];
  chapter?: Chapter;
  due: number;
  started: number;
  /** A report line was already given for the chapter now due. */
  told?: number;
  /** How many times it has been started over, for the record. */
  restarts?: number;
  ended?: { week: number; path?: string; text: string };
}

export interface SagaState { list: Saga[]; used: string[]; next_start: number }

export const sagasOf = (s: SaveState): SagaState => (s.sagas ??= { list: [], used: [], next_start: s.arcology.week + 2 });
export const running = (s: SaveState) => sagasOf(s).list.filter((x) => x.status !== "ended");
/** Chapters (or openings) waiting to be read. */
export const waiting = (s: SaveState) => running(s).filter((x) => x.due <= s.arcology.week);

/* ── where they come from ───────────────────────────────────────────────────────────────────── */

const owned = (s: SaveState) => Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);

/** Everything in this arcology a long story could grow from, with how strongly it pulls. */
export function seedsFor(s: SaveState): { seed: SagaSeed; weight: number }[] {
  const out: { seed: SagaSeed; weight: number }[] = [];
  const add = (seed: SagaSeed, weight: number) => { if (weight > 0) out.push({ seed, weight }); };

  for (const l of lawsOf(s)) {
    const def = LAW_BY_ID[l.id];
    if (!def) continue;
    const c = compliance(s, def).total;
    const custom = l.id.startsWith("custom_");
    add({ id: `law:${l.id}`, kind: "law", text: `The ${def.name} ("${def.text}") is ${c < 45 ? "widely broken, and someone is organising against it" : c < 70 ? "kept grudgingly; not everyone is keeping it" : "kept, and some people have made a living or a cause out of enforcing it"}. Follow it into bedrooms and onto the concourse: what it makes people do to each other, what it makes them want, and who gets off on enforcing it.` }, (custom ? 4 : 1.5) * (c < 45 ? 3 : c < 70 ? 2 : 1));
  }

  for (const p of owned(s)) {
    const r = read(p);
    if (p.bond.resentment >= 55) add({ id: `slave:${p.id}:hate`, kind: "slave", people: [p.id], text: `${p.name} has resented the player for a long time (resentment ${Math.round(p.bond.resentment)}), and has started doing something about it.` }, 3 + p.bond.resentment / 25);
    if (r.devotion >= 65) add({ id: `slave:${p.id}:love`, kind: "slave", people: [p.id], text: `${p.name} is devoted to the player (devotion ${Math.round(r.devotion)}), and that devotion is about to cost someone something.` }, 2 + r.devotion / 40);
    if (p.bond.fear >= 70) add({ id: `slave:${p.id}:fear`, kind: "slave", people: [p.id], text: `${p.name} is terrified of the player (fear ${Math.round(p.bond.fear)}); fear like that goes somewhere.` }, 2);
    // What she wants, grown past a preference: the richest seam there is.
    for (const f of p.persona.fetishes.filter((x) => x.strength >= 60 && x.name !== "none")) {
      const def = FETISHES.find((d) => d.id === f.name || d.name === f.name);
      add({ id: `slave:${p.id}:fetish:${f.name}`, kind: "desire", people: [p.id], text: `${p.name} ${fetishBand(f.strength)} ${def?.name ?? f.name} (${def?.note ?? ""}). It is getting stronger${p.persona.paraphilia ? `; it has already become ${p.persona.paraphilia}` : ""}, and this arcology's laws and customs decide what she's allowed to do about it, and who else gets pulled in.` }, 3 + f.strength / 35);
    }
    if (p.persona.flaw && p.psyche.libido >= 50) add({ id: `slave:${p.id}:flaw`, kind: "desire", people: [p.id], text: `${p.name} is ${p.persona.flaw.id} (${FLAW_BY_ID[p.persona.flaw.id]?.note ?? ""}), and her body wants more than her principles allow (libido ${Math.round(p.psyche.libido)}). Something is going to give.` }, 2.5);
    if (p.psyche.state === "broken") add({ id: `slave:${p.id}:broken`, kind: "slave", people: [p.id], text: `${p.name} is broken, and someone from her old life has come looking for the woman she was.` }, 1.5);
  }

  // The city's own appetites, where they have gone furthest.
  const norms = cultureOf(s).norms;
  const era = Math.floor(s.arcology.week / 20);
  const HOT: Partial<Record<Norm, [string, string]>> = {
    exposure: ["Public sex has become ordinary here; somebody is building a business, a religion or a scandal out of how far it can go.", "Sex is kept behind closed doors here, which means there is a very private club, and the player has been invited."],
    cruelty: ["Cruelty to slaves is entertainment here; a new spectacle is drawing crowds and the player is expected to attend, or to host.", "Cruelty is frowned on here, and someone respectable has been caught enjoying it."],
    feet: ["Slaves' feet are worshipped here; a devotion, a fashion and a black market have grown up around it.", "Feet are ignored here, which makes one owner's obsession the talk of the upper floors."],
    reversal: ["Owners kneeling to their slaves is fashionable; one household has taken it all the way, and the player is asked to judge it.", "No owner here would ever serve a slave, which is exactly what one of them has started doing in secret."],
    modification: ["Bodies are remade freely here; a surgeon's latest fashion is spreading through the upper floors.", "Changing bodies is distrusted here; an underground surgeon has a waiting list."],
  };
  for (const [n, [hi, lo]] of Object.entries(HOT) as [Norm, [string, string]][]) {
    const v = norms[n];
    if (Math.abs(v) >= 30) add({ id: `custom:${n}:${v > 0 ? "hi" : "lo"}:${era}`, kind: "custom", text: `${NORMS[n].name}: ${normLine(n, v)} ${v > 0 ? hi : lo}` }, 2 + Math.abs(v) / 30);
  }
  const mine = societies(s).find((x) => x.kind === "yours");
  const dress = mine ? household(mine).dress?.code : undefined;
  if (dress && dress.id !== "street") add({ id: `dress:${dress.id}:${era}`, kind: "dress", text: `The arcology's dress code is ${dress.name}: ${dress.look} Citizens wear ${dress.citizen}; slaves wear ${dress.slave}. Someone is going to break it, flaunt it, or push it further.` }, 2.5);

  for (const f of Object.values(s.faces ?? {})) {
    if (f.role || f.seen < 2) continue;
    add({ id: `face:${keyOf(f.name)}`, kind: "face", faces: [keyOf(f.name)], text: `${f.name}, ${f.pronoun === "he" ? "a man" : "a woman"} of about ${f.age}${f.detail ? ` (${f.detail})` : ""}, keeps turning up in the player's life (${f.seen} times now). There's a reason.` }, 1 + f.seen);
  }

  for (const [role, npc] of Object.entries(s.story?.cast ?? {})) {
    if (!npc || npc.status !== "around" || npc.person) continue;
    add({ id: `cast:${role}`, kind: "cast", faces: [keyOf(npc.name)], text: `${npc.name}, who ${npc.what}, and whose regard for the player is ${npc.disposition >= 30 ? "warm" : npc.disposition <= -30 ? "hostile" : "undecided"}, wants something bigger than before.` }, 1.5 + Math.abs(npc.disposition) / 40);
  }

  for (const n of s.arcology.neighbours) {
    const docs = n.doctrines.map((d) => DOCTRINE_BY_ID[d]?.noun).filter(Boolean).join(", ");
    if (n.attitude <= -35 || n.scheme) add({ id: `neighbour:${n.id}`, kind: "neighbour", text: `${n.name}, the arcology to the ${n.direction}${docs ? ` (${docs})` : ""}, is hostile (${Math.round(n.attitude)})${n.scheme ? ` and running a ${n.scheme.kind} against the player` : ""}.` }, 2 + (n.scheme ? 2 : 0));
    else if (n.attitude >= 45) add({ id: `neighbour:${n.id}`, kind: "neighbour", text: `${n.name}, the arcology to the ${n.direction}${docs ? ` (${docs})` : ""}, is friendly, and its owner wants a closer arrangement than trade.` }, 1.2);
  }

  const w = s.world ? worldOf(s) : undefined;
  if (w) {
    for (const [id, r] of Object.entries(w.regions)) {
      if (r.state === "war" || r.state === "collapse" || r.state === "plague") add({ id: `world:${id}:${r.state}`, kind: "world", text: `${id.replace(/_/g, " ")} is ${REGION_STATE_WORD[r.state]}, and its people and its trouble are arriving at the player's docks.` }, 2);
    }
    if (w.pollution >= 55) add({ id: "world:pollution", kind: "world", text: `The arcology's air is foul (pollution ${Math.round(w.pollution)}), and the lower levels are getting sick.` }, 1.5);
  }
  if (s.arcology.food && s.arcology.food.stores < 1000) add({ id: `city:hunger:${Math.floor(s.arcology.week / 20)}`, kind: "city", text: "Food is short, and the lower levels have noticed who still eats well." }, 2);
  if (s.arcology.crime >= 45) add({ id: `city:crime:${Math.floor(s.arcology.week / 20)}`, kind: "city", text: `Crime is high (${Math.round(s.arcology.crime)}); one gang has started acting like a government.` }, 2);

  for (const e of s.genome ? genomeOf(s).edits : []) {
    if (e.citizens > 200) add({ id: `gene:${e.id}`, kind: "gene", text: `The ${e.name} program ("${e.text}") has changed ${e.citizens.toLocaleString()} citizens. They are becoming a people of their own, with opinions about the unedited.` }, 2);
    if (e.slaves.length) add({ id: `gene:${e.id}:slaves`, kind: "gene", people: e.slaves.slice(0, 2), text: `The ${e.name} program ("${e.text}") was run on the player's slaves. It did something nobody planned.` }, 1.2);
  }

  const m = s.menials ? menialsOf(s) : undefined;
  if (m && m.owned >= 200) add({ id: `menials:${Math.floor(s.arcology.week / 26)}`, kind: "menials", text: `The player owns ${m.owned.toLocaleString()} menial slaves. Among that many, someone has become a leader.` }, 1 + m.owned / 1000);

  for (const [id, d] of Object.entries(s.arcology.doctrines ?? {})) {
    const def = DOCTRINE_BY_ID[id];
    if (def && d && d.adoption >= 40) add({ id: `doctrine:${id}`, kind: "doctrine", text: `${def.noun} has taken hold of the arcology ("${def.creed}"). Its most zealous believers want to take it further than the player meant, in public and in bed.` }, 2.5);
  }

  for (const d of deedsOf(s).filter((x) => x.public && s.arcology.week - x.week <= 12).slice(-3)) {
    add({ id: `deed:${d.id}`, kind: "deed", people: d.person ? [d.person] : undefined, text: `Everyone knows what the player did: ${d.summary} It has consequences.` }, 1.5);
  }
  return out;
}

/** Pick what the next saga grows from: weighted, never the same thing twice, and not about someone already in a running saga. */
export function pickSeed(s: SaveState): SagaSeed | undefined {
  const st = sagasOf(s);
  const busy = new Set(running(s).flatMap((x) => x.seed.people ?? []));
  const pool = seedsFor(s).filter(({ seed }) => !st.used.includes(seed.id) && !(seed.people ?? []).some((p) => busy.has(p)));
  if (!pool.length) return undefined;
  const r = rng(`saga:${s.id ?? ""}:${s.arcology.week}:${st.used.length}`);
  return r.weighted(pool, (x) => x.weight).seed;
}

/* ── changing what a story is about ─────────────────────────────────────────────────────────── */

/** Back to the start: nothing written, due now. What the chapters already did to people stays done. */
function unwrite(s: SaveState, x: Saga): void {
  Object.assign(x, { status: "unwritten" as const, title: "", premise: "", stakes: "", tone: undefined, acts: [], act: 0, cast: [], facts: [], paths: [], history: [], chapter: undefined, due: s.arcology.week, told: undefined });
  x.restarts = (x.restarts ?? 0) + 1;
}

/** Another thing from this arcology to grow the story from, instead of the one it drew. False when
 *  there is nothing else unused to draw from. */
export function rerollSaga(s: SaveState, id: string): boolean {
  const st = sagasOf(s);
  const x = st.list.find((q) => q.id === id);
  if (!x || x.status !== "unwritten") return false;
  const busy = new Set(running(s).filter((q) => q.id !== id).flatMap((q) => q.seed.people ?? []));
  const pool = seedsFor(s).filter(({ seed }) => seed.id !== x.seed.id && !st.used.includes(seed.id) && !(seed.people ?? []).some((p) => busy.has(p)));
  if (!pool.length) return false;
  const seed = rng(`saga-reroll:${id}:${st.used.length}`).weighted(pool, (q) => q.weight).seed;
  st.used.push(seed.id);
  x.seed = seed;
  return true;
}

/**
 * THE OWNER'S OWN IDEA. What they write becomes the thing the story grows from, in place of what
 * the arcology suggested; anyone of theirs, or anyone already met, named in it is written in by
 * name. A story already running is started over on it.
 */
export function steerSaga(s: SaveState, id: string, idea: string): boolean {
  const x = sagasOf(s).list.find((q) => q.id === id);
  const text = idea.trim().slice(0, 1200);
  if (!x || x.status === "ended" || !text) return false;
  const named = (name: string) => name.length > 1 && new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);
  const people = owned(s).filter((p) => named(p.name) || named(p.name.split(" ")[0])).map((p) => p.id);
  const faces = Object.entries(facesOf(s)).filter(([, f]) => named(f.name)).map(([k]) => k);
  if (x.status !== "unwritten") unwrite(s, x);
  x.seed = { id: `own:${x.id}:${x.restarts ?? 0}`, kind: "own", text, people, faces };
  return true;
}

/** Start a running story over from the same seed: a new outline, new people, a new first chapter. */
export function restartSaga(s: SaveState, id: string): boolean {
  const x = sagasOf(s).list.find((q) => q.id === id);
  if (!x || x.status !== "running") return false;
  unwrite(s, x);
  return true;
}

/* ── the week ───────────────────────────────────────────────────────────────────────────────── */

export const MAX_RUNNING = 2;

/** Weekly: open a new saga when one is due (nothing written yet), and say when a chapter is waiting. */
export function tickSagas(s: SaveState, can = true): string[] {
  const st = sagasOf(s);
  const week = s.arcology.week;
  const lines: string[] = [];
  if (can && week >= st.next_start && running(s).length < MAX_RUNNING) {
    const seed = pickSeed(s);
    if (seed) {
      st.used.push(seed.id);
      st.list.push({ id: `saga_${week}_${st.list.length}`, seed, status: "unwritten", title: "", premise: "", stakes: "", acts: [], act: 0, cast: [], facts: [], paths: [], history: [], due: week, started: week });
      st.next_start = week + 6 + rng(`saga-gap:${week}`).int(0, 4);
      lines.push(`Something is beginning: ${seed.text.split(/(?<=[.!?])\s/)[0]} (a new story on the Story screen)`);
    } else st.next_start = week + 2;
  }
  for (const x of running(s)) {
    if (x.status === "running" && x.due <= week && x.told !== x.due) {
      x.told = x.due;
      lines.push(`${x.title}: the next chapter is waiting.`);
    }
  }
  // Old endings go; a hundred sagas is a long game, and the list is for reading.
  if (st.list.length > 40) st.list = st.list.filter((x, i) => x.status !== "ended" || i >= st.list.length - 30);
  return lines;
}

/* ── the rules of a choice ─────────────────────────────────────────────────────────────────── */

const charOf = (x: Saga, name: string) => x.cast.find((c) => keyOf(c.name) === keyOf(name) || keyOf(c.name.split(" ")[0]) === keyOf(name));

/** Why an option can't be taken right now, or null. */
export function locked(s: SaveState, x: Saga, o: SagaOption): string | null {
  for (const n of o.needs ?? []) {
    if ("cash" in n && s.arcology.cash < n.cash) return `needs ¤${n.cash.toLocaleString()}`;
    if ("rep" in n && s.arcology.rep < n.rep) return `needs reputation ${n.rep.toLocaleString()}`;
    if ("standing" in n && s.arcology.public_standing < n.standing) return `needs the city's standing at ${n.standing}`;
    if ("security" in n && s.arcology.security < n.security) return `needs security ${n.security}`;
    if ("toward" in n) { const c = charOf(x, n.toward.name); if (c && c.toward < n.toward.at) return `${c.name} would need to think better of you`; }
    if ("fact" in n && !x.facts.some((f) => f.toLowerCase().includes(n.fact.toLowerCase().slice(0, 40)))) return `you'd need to know: ${n.fact}`;
    if ("fetish" in n) {
      const c = charOf(x, n.fetish.name);
      const p = c?.person ? s.people[c.person] : undefined;
      const have = p?.persona.fetishes.find((f) => f.name === n.fetish.fetish)?.strength ?? 0;
      if (p && have < n.fetish.at) return `${p.name.split(" ")[0]} would have to want it more (${FETISH_NAME(n.fetish.fetish)} ${Math.round(have)}/${n.fetish.at})`;
    }
    if ("norm" in n) {
      const v = cultureOf(s).norms[n.norm.norm];
      if (n.norm.at >= 0 ? v < n.norm.at : v > n.norm.at) return `the city isn't there yet (${NORMS[n.norm.norm].name.toLowerCase()} ${Math.round(v)}, needs ${n.norm.at})`;
    }
  }
  return null;
}

const num = (v: unknown, lo: number, hi: number) => (typeof v === "number" && Number.isFinite(v) ? clamp(Math.round(v), lo, hi) : undefined);
// Everything the narrator writes is kept coarse, so the next chapter reads plain words, not soft ones.
const str = (v: unknown, max = 400) => (typeof v === "string" && v.trim() ? coarsen(v.trim().slice(0, max)) : undefined);
const TREAT = ["kindness", "cruelty", "coercion", "promise_kept", "promise_broken"] as const;
const FETISH_NAME = (id: string) => FETISHES.find((f) => f.id === id)?.name ?? id;
const fetishId = (v: unknown) => { const t = String(v ?? "").toLowerCase().trim(); return FETISHES.find((f) => f.id !== "none" && (f.id === t || f.name === t))?.id; };

/** Whatever the model wrote, made into something the rules can run. Unknown keys drop; sizes are held to the scale of the game. */
export function cleanOption(s: SaveState, raw: Record<string, unknown>): SagaOption | null {
  const label = str(raw.label, 160);
  const outcome = str(raw.outcome, 1600);
  if (!label || !outcome) return null;
  const big = Math.max(20000, Math.abs(s.arcology.cash) * 0.6);
  const needs: Need[] = [];
  for (const n of Array.isArray(raw.needs) ? raw.needs : []) {
    if (!n || typeof n !== "object") continue;
    const o = n as Record<string, unknown>;
    const cash = num(o.cash, 0, 1e9), rep = num(o.rep, 0, 1e6), standing = num(o.standing, -10, 10), security = num(o.security, 0, 100), fact = str(o.fact, 160);
    if (cash !== undefined) needs.push({ cash });
    else if (rep !== undefined) needs.push({ rep });
    else if (standing !== undefined) needs.push({ standing });
    else if (security !== undefined) needs.push({ security });
    else if (fact) needs.push({ fact });
    else if (o.toward && typeof o.toward === "object") {
      const t = o.toward as Record<string, unknown>;
      const name = str(t.name, 60), at = num(t.at, -100, 100);
      if (name && at !== undefined) needs.push({ toward: { name, at } });
    } else if (o.fetish && typeof o.fetish === "object") {
      const t = o.fetish as Record<string, unknown>;
      const name = str(t.name, 60), fetish = fetishId(t.fetish), at = num(t.at, 0, 150);
      if (name && fetish && at !== undefined) needs.push({ fetish: { name, fetish, at } });
    } else if (o.norm && typeof o.norm === "object") {
      const t = o.norm as Record<string, unknown>;
      const norm = NORM_IDS.find((k) => k === t.norm), at = num(t.at, -100, 100);
      if (norm && at !== undefined) needs.push({ norm: { norm, at } });
    }
  }
  const effects: Effect[] = [];
  for (const e of Array.isArray(raw.effects) ? raw.effects : []) {
    if (!e || typeof e !== "object") continue;
    const o = e as Record<string, unknown>;
    const cash = num(o.cash, -big, big), rep = num(o.rep, -2000, 2000), standing = num(o.standing, -3, 3), prosperity = num(o.prosperity, -10, 10),
      security = num(o.security, -15, 15), crime = num(o.crime, -15, 15), rumor = str(o.rumor, 200);
    if (cash !== undefined) effects.push({ cash });
    else if (rep !== undefined) effects.push({ rep });
    else if (standing !== undefined) effects.push({ standing });
    else if (prosperity !== undefined) effects.push({ prosperity });
    else if (security !== undefined) effects.push({ security });
    else if (crime !== undefined) effects.push({ crime });
    else if (rumor) effects.push({ rumor });
    else if (o.toward && typeof o.toward === "object") {
      const t = o.toward as Record<string, unknown>;
      const name = str(t.name, 60), by = num(t.by, -40, 40);
      if (name && by !== undefined) effects.push({ toward: { name, by } });
    } else if (o.treat && typeof o.treat === "object") {
      const t = o.treat as Record<string, unknown>;
      const name = str(t.name, 60), size = num(t.size, 1, 10), kind = TREAT.find((k) => k === t.kind);
      if (name && size !== undefined && kind) effects.push({ treat: { name, kind, size } });
    } else if (o.act && typeof o.act === "object") {
      const t = o.act as Record<string, unknown>;
      const name = str(t.name, 60), act = typeof t.act === "string" && ACT_BY_ID[t.act] ? t.act : undefined;
      if (name && act) effects.push({ act: { name, act, public: t.public === true } });
    } else if (o.arousal && typeof o.arousal === "object") {
      const t = o.arousal as Record<string, unknown>;
      const name = str(t.name, 60), by = num(t.by, -50, 50);
      if (name && by !== undefined) effects.push({ arousal: { name, by } });
    } else if (o.libido && typeof o.libido === "object") {
      const t = o.libido as Record<string, unknown>;
      const name = str(t.name, 60), by = num(t.by, -20, 20);
      if (name && by !== undefined) effects.push({ libido: { name, by } });
    } else if (o.fetish && typeof o.fetish === "object") {
      const t = o.fetish as Record<string, unknown>;
      const name = str(t.name, 60), fetish = fetishId(t.fetish), by = num(t.by, -30, 40);
      if (name && fetish && by !== undefined) effects.push({ fetish: { name, fetish, by } });
    } else if (o.norm && typeof o.norm === "object") {
      const t = o.norm as Record<string, unknown>;
      const norm = NORM_IDS.find((k) => k === t.norm), by = num(t.by, -6, 6);
      if (norm && by) effects.push({ norm: { norm, by } });
    }
  }
  const develops = (Array.isArray(raw.develops) ? raw.develops : []).flatMap((d) => {
    if (!d || typeof d !== "object") return [];
    const o = d as Record<string, unknown>;
    const name = str(o.name, 60);
    return name ? [{ name, now: str(o.now, 120), turn: str(o.turn, 300), desire: str(o.desire, 160), limit: str(o.limit, 160), secret_revealed: o.secret_revealed === true }] : [];
  });
  const opens = (Array.isArray(raw.opens) ? raw.opens : []).flatMap((p) => {
    const o = p as Record<string, unknown>;
    const id = str(o?.id, 40), l = str(o?.label, 140);
    return id && l ? [{ id, label: l }] : [];
  });
  return {
    label, outcome, note: str(raw.note, 120),
    needs: needs.length ? needs : undefined,
    effects: effects.length ? effects : undefined,
    develops: develops.length ? develops : undefined,
    facts: (Array.isArray(raw.facts) ? raw.facts : []).map((f) => str(f, 200)).filter((f): f is string => !!f).slice(0, 4),
    opens: opens.length ? opens : undefined,
    closes: (Array.isArray(raw.closes) ? raw.closes : []).map((c) => str(c, 40)).filter((c): c is string => !!c),
    advance: raw.advance === true,
    ends: str(raw.ends, 60),
  };
}

const money = (n: number) => `¤${Math.abs(Math.round(n)).toLocaleString()}`;

/** Take an option: run its effects, change the people in it, keep what it established. */
export function choose(s: SaveState, sagaId: string, index: number): { outcome: string; consequences: string[]; ended?: string; people: string[] } | null {
  const x = sagasOf(s).list.find((q) => q.id === sagaId);
  const ch = x?.chapter;
  const o = ch?.options[index];
  if (!x || !ch || !o || locked(s, x, o)) return null;
  return apply(s, x, ch, o);
}

export function apply(s: SaveState, x: Saga, ch: Chapter, o: SagaOption): { outcome: string; consequences: string[]; ended?: string; people: string[] } {
  const week = s.arcology.week;
  const out: string[] = [];
  const a = s.arcology;
  for (const e of o.effects ?? []) {
    if ("cash" in e) { a.cash += e.cash; out.push(`${e.cash >= 0 ? "+" : "−"}${money(e.cash)}`); }
    else if ("rep" in e) { a.rep = Math.max(0, a.rep + e.rep); out.push(`${e.rep >= 0 ? "+" : "−"}${Math.abs(e.rep)} reputation`); }
    else if ("standing" in e) { a.public_standing = clamp(a.public_standing + e.standing, -10, 10); out.push(`standing ${e.standing >= 0 ? "rises" : "falls"} ${Math.abs(e.standing)}`); }
    else if ("prosperity" in e) { a.prosperity = clamp(a.prosperity + e.prosperity, 5, 200); out.push(`prosperity ${e.prosperity >= 0 ? "+" : "−"}${Math.abs(e.prosperity)}`); }
    else if ("security" in e) { a.security = clamp(a.security + e.security, 0, 100); out.push(`security ${e.security >= 0 ? "+" : "−"}${Math.abs(e.security)}`); }
    else if ("crime" in e) { a.crime = clamp(a.crime + e.crime, 0, 100); out.push(`crime ${e.crime >= 0 ? "rises" : "falls"} ${Math.abs(e.crime)}`); }
    else if ("rumor" in e) { startRumor(s, e.rumor, { salience: 6 }); out.push("people talk"); }
    else if ("toward" in e) {
      const c = charOf(x, e.toward.name);
      if (c) { c.toward = clamp(c.toward + e.toward.by, -100, 100); out.push(`${c.name.split(" ")[0]} ${e.toward.by >= 0 ? "warms to you" : "cools"}`); }
      const f = c?.face ? facesOf(s)[c.face] : undefined;
      if (f) meet(s, f);
    } else if ("treat" in e) {
      const c = charOf(x, e.treat.name);
      const p = c?.person ? s.people[c.person] : undefined;
      if (p) { applyTreatment(p, { kind: e.treat.kind, size: e.treat.size, why: `${x.title}: ${o.label}`.slice(0, 80) }, week); out.push(`${p.name.split(" ")[0]} ${/kind|kept/.test(e.treat.kind) ? "won't forget it" : "will remember that"}`); }
    } else if ("norm" in e) {
      pushNorm(s, e.norm.norm, e.norm.by, `${x.title}: ${o.label}`.slice(0, 80));
      out.push(`${NORMS[e.norm.norm].name.toLowerCase()}: the city moves ${e.norm.by > 0 ? "toward" : "away from"} it`);
    } else {
      const who = "act" in e ? e.act.name : "arousal" in e ? e.arousal.name : "libido" in e ? e.libido.name : e.fetish.name;
      const c = charOf(x, who);
      const p = c?.person ? s.people[c.person] : undefined;
      if (!p) continue;
      const first = p.name.split(" ")[0];
      if ("act" in e) {
        const r = resolveAct(s, p, e.act.act, { public: e.act.public });
        if (!("error" in r)) out.push(`${first}: ${ACT_BY_ID[e.act.act]?.name ?? e.act.act}${e.act.public ? ", in public" : ""}`);
      } else if ("arousal" in e) p.psyche.arousal = clamp(p.psyche.arousal + e.arousal.by, 0, 100);
      else if ("libido" in e) { p.psyche.libido = clamp(p.psyche.libido + e.libido.by, 0, 100); out.push(`${first}'s appetite ${e.libido.by > 0 ? "grows" : "fades"}`); }
      else {
        let f = p.persona.fetishes.find((q) => q.name === e.fetish.fetish);
        if (!f && e.fetish.by > 0) { f = { name: e.fetish.fetish, strength: 0, known: true }; p.persona.fetishes.push(f); }
        if (f) {
          const was = f.strength;
          f.strength = clamp(f.strength + e.fetish.by, 0, 120);
          f.known = true;
          out.push(was < 10 && f.strength >= 10 ? `${first} discovers she likes ${FETISH_NAME(f.name)}` : `${first}'s taste for ${FETISH_NAME(f.name)} ${e.fetish.by > 0 ? "deepens" : "fades"}`);
        }
      }
    }
  }
  for (const d of o.develops ?? []) {
    const c = charOf(x, d.name);
    if (!c) continue;
    if (d.now) c.now = d.now;
    if (d.turn) c.turns.push({ week, text: d.turn });
    if (d.desire) c.desire = d.desire;
    if (d.limit) c.limit = d.limit;
    if (d.secret_revealed && c.secret) { c.known = true; out.push(`you learn ${c.name.split(" ")[0]}'s secret`); }
  }
  for (const f of o.facts ?? []) if (!x.facts.includes(f)) x.facts.push(f);
  if (x.facts.length > 30) x.facts = x.facts.slice(-30);
  for (const p of o.opens ?? []) if (!x.paths.some((q) => q.id === p.id)) { x.paths.push({ ...p, state: "open" }); out.push(`a new way this could end: ${p.label}`); }
  for (const id of o.closes ?? []) { const p = x.paths.find((q) => q.id === id && q.state === "open"); if (p) { p.state = "closed"; out.push(`closed: ${p.label}`); } }

  x.history.push({ week, title: ch.title, text: ch.text, chose: o.label, outcome: o.outcome, act: x.act });
  x.chapter = undefined;
  let ended: string | undefined;
  if (o.ends) {
    const p = x.paths.find((q) => q.id === o.ends) ?? x.paths.find((q) => q.label.toLowerCase().includes(o.ends!.toLowerCase()));
    if (p) p.state = "taken";
    for (const q of x.paths) if (q.state === "open") q.state = "closed";
    x.status = "ended";
    x.ended = { week, path: p?.label ?? o.ends, text: o.outcome };
    ended = p?.label ?? o.ends;
  } else {
    if (o.advance) x.act = Math.min(x.act + 1, Math.max(0, x.acts.length - 1) + 1);
    x.due = week + (o.advance ? 2 : 1);
  }
  const people = x.cast.map((c) => c.person).filter((p): p is string => !!p && !!s.people[p]);
  return { outcome: o.outcome, consequences: out, ended, people };
}

/* ── the narrator's side ────────────────────────────────────────────────────────────────────── */

/** The arcology as a saga needs it: what makes this place this place. */
export function arcologyBrief(s: SaveState): string {
  const a = s.arcology;
  const laws = lawsLine(s);
  const household = owned(s).slice(0, 12).map((p) => { const r = read(p); return `${p.name} (${p.age}, ${p.origin.nationality ?? p.origin.race}, ${r.label}; devotion ${Math.round(r.devotion)}, fear ${Math.round(p.bond.fear)}, resentment ${Math.round(p.bond.resentment)}${p.assignment ? `, ${p.assignment}` : ""})`; });
  const neighbours = a.neighbours.map((n) => `${n.name} to the ${n.direction} (${n.attitude >= 30 ? "friendly" : n.attitude <= -30 ? "hostile" : "wary"})`);
  return [
    `THE ARCOLOGY: ${a.name}, week ${a.week}. Owner: ${s.player.name && s.player.name !== "you" ? s.player.name : "the player"} (called ${s.player.address || "Master"}). Cash ¤${Math.round(a.cash).toLocaleString()}, reputation ${Math.round(a.rep).toLocaleString()}, the city's opinion ${a.public_standing >= 3 ? "good" : a.public_standing <= -3 ? "poor" : "mixed"}, prosperity ${Math.round(a.prosperity)}, crime ${Math.round(a.crime)}, security ${Math.round(a.security)}, ${a.population.toLocaleString()} citizens.${s.player.owned_by ? ` The player wears the collar of ${s.people[s.player.owned_by]?.name ?? "a slave"}.` : ""}`,
    cultureBrief(s) ? `HOW PEOPLE HERE BEHAVE:\n${cultureBrief(s)}` : "",
    laws,
    s.genome ? genomeBrief(s) : "",
    s.world ? worldBrief(s) : "",
    neighbours.length ? `NEIGHBOURS: ${neighbours.join("; ")}` : "",
    household.length ? `THE PLAYER'S HOUSEHOLD: ${household.join("; ")}` : "",
  ].filter(Boolean).join("\n");
}

/** Her tastes as the rules hold them, for a slave of yours in the cast. */
function tastes(p: Person): string {
  const fs = p.persona.fetishes.filter((f) => f.strength >= 10 && f.name !== "none").map((f) => `${fetishBand(f.strength)} ${FETISH_NAME(f.name)} (${Math.round(f.strength)})`);
  return [
    fs.length ? fs.join(", ") : "no particular fetish yet",
    p.persona.paraphilia ? `paraphilia: ${p.persona.paraphilia}` : "",
    p.persona.quirk ? `quirk: ${p.persona.quirk.id}` : "",
    p.persona.flaw ? `flaw: ${p.persona.flaw.id}` : "",
    `attracted to ${p.persona.attracted_to}`,
    `libido ${Math.round(p.psyche.libido)}, arousal ${Math.round(p.psyche.arousal)}`,
    p.acts && Object.keys(p.acts).length ? `has done: ${Object.entries(p.acts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ×${v}`).join(", ")}` : "",
  ].filter(Boolean).join("; ");
}

const castLine = (s: SaveState) => (c: SagaChar) => {
  const p = c.person ? s.people[c.person] : undefined;
  return `· ${c.name}${p ? " (the player's slave)" : ""} — ${c.role}. Wants: ${c.want}. Fears: ${c.fear}.${c.desire ? ` In bed, wants: ${c.desire}.` : ""}${c.limit ? ` Won't (yet): ${c.limit}.` : ""}${p ? ` Her tastes, as they stand: ${tastes(p)}.` : ""}${c.secret ? ` Secret${c.known ? " (the player knows)" : " (the player doesn't know)"}: ${c.secret}.` : ""} Toward the player: ${c.toward}. Now: ${c.now}.${c.turns.length ? ` How they've changed: ${c.turns.slice(-5).map((t) => `week ${t.week}, ${t.text}`).join("; ")}.` : ""}`;
};

/** What sex is here: the law, the custom, what people wear, what the doctrines preach, and what the household wants. */
export function desireBrief(s: SaveState): string {
  const n = cultureOf(s).norms;
  const mine = societies(s).find((x) => x.kind === "yours");
  const h = mine ? household(mine) : undefined;
  const code = h?.dress?.code;
  const doctrines = Object.entries(s.arcology.doctrines ?? {}).filter(([, d]) => d && d.adoption >= 25).map(([id, d]) => { const def = DOCTRINE_BY_ID[id]; return def ? `${def.noun} (${Math.round(d.adoption)}% adopted): "${def.creed}"` : ""; }).filter(Boolean);
  const wants = owned(s).slice(0, 10).map((p) => `${p.name}: ${tastes(p)}`);
  const done = deedsOf(s).slice(-5).map((d) => `· ${d.summary}`);
  return [
    `## SEX IN THIS ARCOLOGY (the saga lives here)`,
    `What the city thinks is normal: ${NORM_IDS.map((k) => `${NORMS[k].name.toLowerCase()} ${Math.round(n[k])} (${normLine(k, n[k])})`).join("; ")}.`,
    code ? `The dress code, ${code.name}: ${code.look} Citizens wear ${code.citizen}; slaves wear ${code.slave}${code.collar ? ` and ${code.collar}` : ""}.` : "",
    doctrines.length ? `What the doctrines preach: ${doctrines.join("; ")}.` : "",
    wants.length ? `What the household wants:\n${wants.join("\n")}` : "",
    done.length ? `What the player has done lately:\n${done.join("\n")}` : "",
  ].filter(Boolean).join("\n");
}

export const SAGA_SYSTEM = `You write the long stories of one arcology in an explicit porn game about owning people. A saga is a dirty story in chapters, with a plot and choices. It comes out of this arcology: its laws, its customs, its dress code, its doctrines, and what the people in it like to fuck and how.

Sex is what the story is about. Every chapter has sex in it, written out, crude and explicit, in what these people are into: their fetishes, what they want done to them, what they won't do yet. Show how this city's rules shape it: who's allowed to watch, what's normal in public here, who gets punished, what's in fashion, what would be a scandal.

People change. Someone finds out they like getting pissed on. Someone who wouldn't take it up the ass begs for it by act three. Someone stops being ashamed, or starts. Write it down when it happens. Everyone wants something, is scared of something, and most are hiding something; sex is part of all three.

Concrete bodies, rooms and things. Everyone talks like themselves, dirty if they're dirty. What happens comes back weeks later. Nobody is only there for the plot.

${HOUSE_STYLE}

The same goes for every field you write: chapter text, outcomes, what people want in bed and what they won't do. Plain crude words, never a euphemism or a poetic turn.

Choices matter, and most of them are about sex: what the player does to who, what they allow, who they hand to who, what they do in public. Each option goes somewhere different: different people get off or get hurt, a taste gets fed or starved, the city's customs get pushed or broken, endings open or close. Never three versions of the same thing. At least one option costs the player something they care about. An option can need something (money, reputation, a fact learned earlier, someone's regard, how far someone's taste has gone, how far the city has gone); show it even when the player can't take it yet.

Everyone is an adult, eighteen or older. Reply with JSON only.`;

const VOCAB = () => `FETISH is one of: ${FETISHES.filter((f) => f.id !== "none").map((f) => f.id).join(", ")}. ACT is one of: ${ACTS.map((a) => a.id).join(", ")}. NORM is one of: ${NORM_IDS.join(", ")}. Use "act" whenever a slave of the player's has sex in the outcome, so it counts.`;

const OPTION_SCHEMA = `{"label":"what the player does, 4-14 words","note":"cost or risk, a few words","needs":[{"cash":N}|{"rep":N}|{"standing":N}|{"security":N}|{"fact":"a fact from FACTS"}|{"toward":{"name":"cast name","at":N}}|{"fetish":{"name":"player's slave","fetish":"FETISH","at":N}}|{"norm":{"norm":"NORM","at":±N}}],"outcome":"what happens, 2-5 sentences of prose","effects":[{"cash":±N}|{"rep":±N}|{"standing":±1..3}|{"prosperity":±N}|{"security":±N}|{"crime":±N}|{"toward":{"name":"cast name","by":±N}}|{"treat":{"name":"one of the player's slaves in the cast","kind":"kindness|cruelty|coercion|promise_kept|promise_broken","size":1-10}}|{"rumor":"what people say"}|{"act":{"name":"player's slave","act":"ACT","public":true|false}}|{"arousal":{"name":"player's slave","by":±N}}|{"libido":{"name":"player's slave","by":±N}}|{"fetish":{"name":"player's slave","fetish":"FETISH","by":±N}}|{"norm":{"norm":"NORM","by":±1..6}}],"develops":[{"name":"cast name","now":"where they are now, a few words","turn":"how this changed them, one sentence","desire":"what they want in bed now, if it changed","limit":"what they still won't do, if it changed","secret_revealed":true|false}],"facts":["something now true that later chapters should remember"],"opens":[{"id":"short_id","label":"a new way this could end"}],"closes":["path id this rules out"],"advance":true|false,"ends":"path id, only in the last act"}`;

/** Write the bible: who, what's at stake, the acts, the ways it can end. */
export function biblePrompt(s: SaveState, x: Saga): string {
  const people = (x.seed.people ?? []).map((id) => s.people[id]).filter((p): p is Person => !!p);
  const faces = (x.seed.faces ?? []).map((k) => facesOf(s)[k]).filter((f): f is Face => !!f);
  return [
    arcologyBrief(s),
    desireBrief(s),
    x.seed.kind === "own"
      ? `## WHAT THE OWNER WANTS THIS STORY TO BE ABOUT\n${x.seed.text}\n\nThis is the premise, written by the player. Build the saga on it exactly as they put it: keep every person, place and situation they name. The arcology above is the world it happens in, not a reason to change what they asked for.`
      : `## WHAT IT GROWS FROM\n${x.seed.text}`,
    people.length ? `## THE PLAYER'S PEOPLE AT ITS CENTRE\n${people.map((p) => `${p.name}: ${p.persona?.background ?? ""} ${p.persona?.speech_pattern ? `Speaks: ${p.persona.speech_pattern}.` : ""}`.trim()).join("\n")}` : "",
    faces.length ? `## PEOPLE ALREADY MET\n${faces.map((f) => `${f.name} — ${f.pronoun}, about ${f.age}${f.nation ? `, ${f.nation}` : ""}${f.detail ? `; ${f.detail}` : ""}`).join("\n")}` : "",
    `## WRITE THE SAGA'S BIBLE
It is an erotic story: its premise is a desire, a taboo, an appetite or a sexual power struggle that could only happen under these laws and customs. Three to five acts, each with a sexual turn. Three to six people in it, all adults: use the player's people and the people already met above by their exact names; invent the rest with full names. At least one character must be someone who is not the player's slave. Give three or four ways it could end, each genuinely different (who wins, who's lost, who becomes what in bed, what the arcology's customs become).

JSON: {"title":"2-5 words","premise":"2-3 sentences","stakes":"one sentence: what the player could win or lose","tone":"a few words","acts":["act 1 aim","act 2 aim","..."],"paths":[{"id":"short_id","label":"one way it ends"}],"cast":[{"name":"full name","role":"their part in this","want":"...","fear":"...","secret":"...","toward":-100..100,"now":"where they stand, a few words","desire":"what they want in bed","limit":"what they won't do, yet","pronoun":"she|he","age":N,"nationality":"...","skin":"...","hair":"colour, style","eyes":"...","detail":"one visible detail"}]}`,
    REGISTER_TAIL,
  ].filter(Boolean).join("\n\n");
}

export function chapterPrompt(s: SaveState, x: Saga, own?: string): string {
  const last = x.act >= x.acts.length - 1;
  const past = x.history.slice(0, -5).map((h) => `week ${h.week}, ${h.title}: ${h.chose}`).join("; ");
  const recent = x.history.slice(-5).map((h) => `### ${h.title} (week ${h.week}, act ${h.act + 1})\n${h.text.slice(0, 1200)}\nTHE PLAYER CHOSE: ${h.chose}\n${h.outcome}`).join("\n\n");
  return [
    arcologyBrief(s),
    desireBrief(s),
    `## THE SAGA: ${x.title}\n${x.premise}\nStakes: ${x.stakes}${x.tone ? `\nTone: ${x.tone}` : ""}\nActs: ${x.acts.map((a, i) => `${i + 1}. ${a}${i === x.act ? " ← NOW" : ""}`).join(" ")}`,
    `## THE PEOPLE IN IT\n${x.cast.map(castLine(s)).join("\n")}`,
    x.facts.length ? `## FACTS (established; keep them)\n${x.facts.map((f) => `· ${f}`).join("\n")}` : "",
    `## WAYS IT COULD END\n${x.paths.map((p) => `· ${p.id}: ${p.label} [${p.state}]`).join("\n")}`,
    past ? `## EARLIER\n${past}` : "",
    recent ? `## THE LAST CHAPTERS\n${recent}` : "## THIS IS THE FIRST CHAPTER",
    own
      ? `## THE PLAYER'S OWN ANSWER to "${x.chapter?.title}"\n${own}\n\n${VOCAB()}
Resolve it as ONE option in the same JSON shape (the label is what they did, in a few words; the outcome is what happens). Be fair: what they tried may work, half-work, or cost them. JSON: {"option": ${OPTION_SCHEMA}}`
      : `## WRITE THE NEXT CHAPTER${last ? "\nThis is the last act. Every option ends the saga by one of the open paths (set \"ends\"), and the outcome is its epilogue: what became of each person." : `\nAct ${x.act + 1} of ${x.acts.length}. Set "advance": true on an option only when it completes this act's aim.`}
Four to eight paragraphs, in the present tense, second person for the player. Something happens, sex is on the page, and somebody changes. Then three or four options, most of them sexual choices with sexual consequences.
${VOCAB()}

JSON: {"title":"chapter title","text":"the chapter; paragraphs separated by blank lines","options":[${OPTION_SCHEMA}]}`,
    REGISTER_TAIL,
  ].filter(Boolean).join("\n\n");
}

export type Writer = (system: string, user: string) => Promise<{ ok: boolean; text: string; error?: string }>;

const parse = <T,>(text: string): T | null => {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const body = fenced ? fenced[1] : text;
  const a = body.indexOf("{"), b = body.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(body.slice(a, b + 1)) as T; } catch { /* repair once */ }
  try { return JSON.parse(body.slice(a, b + 1).replace(/,\s*([}\]])/g, "$1")) as T; } catch { return null; }
};

/** Match a name the model gave to one of yours, a face on file, or nobody. */
function whoIs(s: SaveState, name: string): { person?: string; face?: string } {
  const k = keyOf(name);
  const p = owned(s).find((x) => keyOf(x.name) === k || keyOf(x.name.split(" ")[0]) === k);
  if (p) return { person: p.id };
  if (facesOf(s)[k]) return { face: k };
  return {};
}

export function takeBible(s: SaveState, x: Saga, raw: Record<string, unknown>): boolean {
  const title = str(raw.title, 60), premise = str(raw.premise, 800);
  const acts = (Array.isArray(raw.acts) ? raw.acts : []).map((a) => str(a, 200)).filter((a): a is string => !!a).slice(0, 5);
  const paths = (Array.isArray(raw.paths) ? raw.paths : []).flatMap((p) => { const o = p as Record<string, unknown>; const id = str(o?.id, 40), label = str(o?.label, 160); return id && label ? [{ id, label, state: "open" as const }] : []; }).slice(0, 5);
  const cast = (Array.isArray(raw.cast) ? raw.cast : []).flatMap((c): SagaChar[] => {
    const o = c as Record<string, unknown>;
    const name = str(o?.name, 48);
    if (!name) return [];
    let at = whoIs(s, name);
    if (!at.person && !at.face) {
      const f = meet(s, { name, pronoun: /^he$/i.test(String(o.pronoun ?? "")) ? "he" : "she", age: num(o.age, 18, 85), nation: nationFrom(str(o.nationality, 40)), skin: str(o.skin, 40), hair: str(o.hair, 60)?.split(",")[0].trim(), hair_style: str(o.hair, 60)?.split(",").slice(1).join(",").trim() || undefined, eyes: str(o.eyes, 30), detail: str(o.detail, 120) });
      if (f) at = { face: keyOf(f.name) };
    }
    return [{ name, ...at, role: str(o.role, 160) ?? "", want: str(o.want, 200) ?? "", fear: str(o.fear, 200) ?? "", secret: str(o.secret, 300), toward: num(o.toward, -100, 100) ?? 0, now: str(o.now, 120) ?? "", desire: str(o.desire, 200), limit: str(o.limit, 200), turns: [] }];
  }).slice(0, 7);
  if (!title || !premise || acts.length < 2 || paths.length < 2 || !cast.length) return false;
  Object.assign(x, { title, premise, stakes: str(raw.stakes, 300) ?? "", tone: str(raw.tone, 80), acts, paths, cast, status: "running" as const });
  return true;
}

export function takeChapter(s: SaveState, x: Saga, raw: Record<string, unknown>): boolean {
  const title = str(raw.title, 90), text = str(raw.text, 9000);
  const options = (Array.isArray(raw.options) ? raw.options : []).map((o) => (o && typeof o === "object" ? cleanOption(s, o as Record<string, unknown>) : null)).filter((o): o is SagaOption => !!o).slice(0, 4);
  if (!title || !text || options.length < 2) return false;
  // The last act ends. If the model forgot, the first open path is where each option lands.
  if (x.act >= x.acts.length - 1) {
    const open = x.paths.filter((p) => p.state === "open");
    options.forEach((o, i) => { if (!o.ends && open.length) o.ends = open[i % open.length].id; });
  }
  x.chapter = { title, text, options, week: s.arcology.week };
  return true;
}

/** Open a saga (bible, then first chapter) or write its next chapter. */
export async function writeNext(s: SaveState, sagaId: string, write: Writer): Promise<{ ok: boolean; error?: string }> {
  const x = sagasOf(s).list.find((q) => q.id === sagaId);
  if (!x || x.status === "ended") return { ok: false, error: "no such story" };
  if (x.chapter) return { ok: true };
  if (x.status === "unwritten") {
    const res = await write(SAGA_SYSTEM, biblePrompt(s, x));
    const raw = res.ok ? parse<Record<string, unknown>>(res.text) : null;
    if (!raw || !takeBible(s, x, raw)) return { ok: false, error: res.error ?? "the narrator's outline didn't come back usable; try again" };
  }
  const res = await write(SAGA_SYSTEM, chapterPrompt(s, x));
  const raw = res.ok ? parse<Record<string, unknown>>(res.text) : null;
  if (!raw || !takeChapter(s, x, raw)) return { ok: false, error: res.error ?? "the chapter didn't come back usable; try again" };
  return { ok: true };
}

/** Your own answer instead of the options: the narrator resolves it into one, and it's taken. */
export async function answerOwn(s: SaveState, sagaId: string, text: string, write: Writer): Promise<{ ok: boolean; error?: string; result?: ReturnType<typeof apply> }> {
  const x = sagasOf(s).list.find((q) => q.id === sagaId);
  if (!x?.chapter || !text.trim()) return { ok: false, error: "nothing to answer" };
  const res = await write(SAGA_SYSTEM, chapterPrompt(s, x, text.trim().slice(0, 800)));
  const raw = res.ok ? parse<{ option?: Record<string, unknown> }>(res.text) : null;
  const o = raw?.option ? cleanOption(s, raw.option) : null;
  if (!o) return { ok: false, error: res.error ?? "the narrator couldn't make that into a turn; try again" };
  if (x.act >= x.acts.length - 1 && !o.ends) o.ends = x.paths.find((p) => p.state === "open")?.id;
  // Your own answer can't spend what you don't have.
  o.effects = o.effects?.filter((e) => !("cash" in e) || e.cash >= 0 || s.arcology.cash + e.cash >= 0);
  return { ok: true, result: apply(s, x, x.chapter, o) };
}

/** Faces in running sagas are not forgotten. */
export const sagaFaces = (s: SaveState) => new Set(running(s).flatMap((x) => x.cast.map((c) => c.face).filter((f): f is string => !!f)));
