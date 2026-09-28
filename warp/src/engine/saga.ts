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

/* ── what a saga is ─────────────────────────────────────────────────────────────────────────── */

export interface SagaSeed {
  /** Stable, so the same thing never seeds two sagas. */
  id: string;
  kind: "law" | "slave" | "face" | "cast" | "neighbour" | "world" | "gene" | "menials" | "doctrine" | "deed" | "city";
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
  /** Every turn they've taken, in order. */
  turns: { week: number; text: string }[];
}

export interface SagaPath { id: string; label: string; state: "open" | "closed" | "taken" }

export type Need =
  | { cash: number } | { rep: number } | { standing: number } | { security: number }
  | { toward: { name: string; at: number } } | { fact: string };

export type Effect =
  | { cash: number } | { rep: number } | { standing: number } | { prosperity: number } | { security: number } | { crime: number }
  | { toward: { name: string; by: number } }
  | { treat: { name: string; kind: Treatment["kind"]; size: number } }
  | { rumor: string };

export interface SagaOption {
  label: string;
  /** Shown under the label: what it costs or risks, in a few words. */
  note?: string;
  needs?: Need[];
  /** What happens, written ahead: two to five sentences. */
  outcome: string;
  effects?: Effect[];
  develops?: { name: string; now?: string; turn?: string; secret_revealed?: boolean }[];
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
    add({ id: `law:${l.id}`, kind: "law", text: `The ${def.name} ("${def.text}") is ${c < 45 ? "widely broken, and someone is organising against it" : c < 70 ? "kept grudgingly; not everyone is keeping it" : "kept, and some people have made a living or a cause out of enforcing it"}.` }, (custom ? 3 : 1) * (c < 45 ? 3 : c < 70 ? 2 : 1));
  }

  for (const p of owned(s)) {
    const r = read(p);
    if (p.bond.resentment >= 55) add({ id: `slave:${p.id}:hate`, kind: "slave", people: [p.id], text: `${p.name} has resented the player for a long time (resentment ${Math.round(p.bond.resentment)}), and has started doing something about it.` }, 3 + p.bond.resentment / 25);
    if (r.devotion >= 65) add({ id: `slave:${p.id}:love`, kind: "slave", people: [p.id], text: `${p.name} is devoted to the player (devotion ${Math.round(r.devotion)}), and that devotion is about to cost someone something.` }, 2 + r.devotion / 40);
    if (p.bond.fear >= 70) add({ id: `slave:${p.id}:fear`, kind: "slave", people: [p.id], text: `${p.name} is terrified of the player (fear ${Math.round(p.bond.fear)}); fear like that goes somewhere.` }, 2);
    if (p.psyche.state === "broken") add({ id: `slave:${p.id}:broken`, kind: "slave", people: [p.id], text: `${p.name} is broken, and someone from her old life has come looking for the woman she was.` }, 1.5);
  }

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
    if (def && d && d.adoption >= 40) add({ id: `doctrine:${id}`, kind: "doctrine", text: `${def.noun} has taken hold of the arcology ("${def.creed}"). Its most zealous believers want to take it further than the player meant.` }, 1.5);
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
  }
  return null;
}

const num = (v: unknown, lo: number, hi: number) => (typeof v === "number" && Number.isFinite(v) ? clamp(Math.round(v), lo, hi) : undefined);
const str = (v: unknown, max = 400) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
const TREAT = ["kindness", "cruelty", "coercion", "promise_kept", "promise_broken"] as const;

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
    }
  }
  const develops = (Array.isArray(raw.develops) ? raw.develops : []).flatMap((d) => {
    if (!d || typeof d !== "object") return [];
    const o = d as Record<string, unknown>;
    const name = str(o.name, 60);
    return name ? [{ name, now: str(o.now, 120), turn: str(o.turn, 300), secret_revealed: o.secret_revealed === true }] : [];
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
    }
  }
  for (const d of o.develops ?? []) {
    const c = charOf(x, d.name);
    if (!c) continue;
    if (d.now) c.now = d.now;
    if (d.turn) c.turns.push({ week, text: d.turn });
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

const castLine = (c: SagaChar) => `· ${c.name} — ${c.role}. Wants: ${c.want}. Fears: ${c.fear}.${c.secret ? ` Secret${c.known ? " (the player knows)" : " (the player doesn't know)"}: ${c.secret}.` : ""} Toward the player: ${c.toward}. Now: ${c.now}.${c.turns.length ? ` How they've changed: ${c.turns.slice(-4).map((t) => `week ${t.week}, ${t.text}`).join("; ")}.` : ""}`;

export const SAGA_SYSTEM = `You write the long stories of a single arcology in a dark, adult management game about owning people. A saga is a novel told in chapters, with branching choices; it grows out of what this arcology actually is, and it is about people who change.

Write like a good novelist: specific people, places and objects; dialogue in each person's own voice; consequences that land weeks later. Every character wants something, fears something, and most hide something. Nobody exists only to serve the plot. They change because of what the player does, and you show it.

Choices are real. Each option leads somewhere different: different people helped or hurt, different facts established, different endings opened or closed. Never offer three versions of the same thing. At least one option in every chapter costs something the player cares about. Options may need things (money, reputation, a fact the player learned earlier, someone's regard); an option the player can't take yet is still worth showing.

Reply with JSON only.`;

const OPTION_SCHEMA = `{"label":"what the player does, 4-14 words","note":"cost or risk, a few words","needs":[{"cash":N}|{"rep":N}|{"standing":N}|{"security":N}|{"fact":"a fact from FACTS"}|{"toward":{"name":"cast name","at":N}}],"outcome":"what happens, 2-5 sentences of prose","effects":[{"cash":±N}|{"rep":±N}|{"standing":±1..3}|{"prosperity":±N}|{"security":±N}|{"crime":±N}|{"toward":{"name":"cast name","by":±N}}|{"treat":{"name":"one of the player's slaves in the cast","kind":"kindness|cruelty|coercion|promise_kept|promise_broken","size":1-10}}|{"rumor":"what people say"}],"develops":[{"name":"cast name","now":"where they are now, a few words","turn":"how this changed them, one sentence","secret_revealed":true|false}],"facts":["something now true that later chapters should remember"],"opens":[{"id":"short_id","label":"a new way this could end"}],"closes":["path id this rules out"],"advance":true|false,"ends":"path id, only in the last act"}`;

/** Write the bible: who, what's at stake, the acts, the ways it can end. */
export function biblePrompt(s: SaveState, x: Saga): string {
  const people = (x.seed.people ?? []).map((id) => s.people[id]).filter((p): p is Person => !!p);
  const faces = (x.seed.faces ?? []).map((k) => facesOf(s)[k]).filter((f): f is Face => !!f);
  return [
    arcologyBrief(s),
    `## WHAT IT GROWS FROM\n${x.seed.text}`,
    people.length ? `## THE PLAYER'S PEOPLE AT ITS CENTRE\n${people.map((p) => `${p.name}: ${p.persona?.background ?? ""} ${p.persona?.speech_pattern ? `Speaks: ${p.persona.speech_pattern}.` : ""}`.trim()).join("\n")}` : "",
    faces.length ? `## PEOPLE ALREADY MET\n${faces.map((f) => `${f.name} — ${f.pronoun}, about ${f.age}${f.nation ? `, ${f.nation}` : ""}${f.detail ? `; ${f.detail}` : ""}`).join("\n")}` : "",
    `## WRITE THE SAGA'S BIBLE
Three to five acts. Three to six people in it: use the player's people and the people already met above by their exact names; invent the rest with full names. At least one character must be someone who is not the player's slave. Give three or four ways it could end, each genuinely different (who wins, who's lost, what the arcology becomes).

JSON: {"title":"2-5 words","premise":"2-3 sentences","stakes":"one sentence: what the player could win or lose","tone":"a few words","acts":["act 1 aim","act 2 aim","..."],"paths":[{"id":"short_id","label":"one way it ends"}],"cast":[{"name":"full name","role":"their part in this","want":"...","fear":"...","secret":"...","toward":-100..100,"now":"where they stand, a few words","pronoun":"she|he","age":N,"nationality":"...","skin":"...","hair":"colour, style","eyes":"...","detail":"one visible detail"}]}`,
  ].filter(Boolean).join("\n\n");
}

export function chapterPrompt(s: SaveState, x: Saga, own?: string): string {
  const last = x.act >= x.acts.length - 1;
  const past = x.history.slice(0, -5).map((h) => `week ${h.week}, ${h.title}: ${h.chose}`).join("; ");
  const recent = x.history.slice(-5).map((h) => `### ${h.title} (week ${h.week}, act ${h.act + 1})\n${h.text.slice(0, 1200)}\nTHE PLAYER CHOSE: ${h.chose}\n${h.outcome}`).join("\n\n");
  return [
    arcologyBrief(s),
    `## THE SAGA: ${x.title}\n${x.premise}\nStakes: ${x.stakes}${x.tone ? `\nTone: ${x.tone}` : ""}\nActs: ${x.acts.map((a, i) => `${i + 1}. ${a}${i === x.act ? " ← NOW" : ""}`).join(" ")}`,
    `## THE PEOPLE IN IT\n${x.cast.map(castLine).join("\n")}`,
    x.facts.length ? `## FACTS (established; keep them)\n${x.facts.map((f) => `· ${f}`).join("\n")}` : "",
    `## WAYS IT COULD END\n${x.paths.map((p) => `· ${p.id}: ${p.label} [${p.state}]`).join("\n")}`,
    past ? `## EARLIER\n${past}` : "",
    recent ? `## THE LAST CHAPTERS\n${recent}` : "## THIS IS THE FIRST CHAPTER",
    own
      ? `## THE PLAYER'S OWN ANSWER to "${x.chapter?.title}"\n${own}\n\nResolve it as ONE option in the same JSON shape (the label is what they did, in a few words; the outcome is what happens). Be fair: what they tried may work, half-work, or cost them. JSON: {"option": ${OPTION_SCHEMA}}`
      : `## WRITE THE NEXT CHAPTER${last ? "\nThis is the last act. Every option ends the saga by one of the open paths (set \"ends\"), and the outcome is its epilogue: what became of each person." : `\nAct ${x.act + 1} of ${x.acts.length}. Set "advance": true on an option only when it completes this act's aim.`}
Four to seven paragraphs, in the present tense, second person for the player. Something happens; somebody changes. Then three or four options.

JSON: {"title":"chapter title","text":"the chapter; paragraphs separated by blank lines","options":[${OPTION_SCHEMA}]}`,
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
    return [{ name, ...at, role: str(o.role, 160) ?? "", want: str(o.want, 200) ?? "", fear: str(o.fear, 200) ?? "", secret: str(o.secret, 300), toward: num(o.toward, -100, 100) ?? 0, now: str(o.now, 120) ?? "", turns: [] }];
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
