/**
 * THE STORY — who you are, who is after you, and what you did about it.
 *
 * Every run starts from an ORIGIN you pick: how you came to own the building, and the people that
 * history comes with. From there the game draws ARCS from a shuffled deck — a journalist, a rival
 * who wants one of your women, a sister at the gate, a blackout — and each arc is a handful of
 * BEATS with choices in your voice. Choices set FLAGS that later beats, and other arcs, read, so
 * the man you humiliated in week 9 remembers it in week 30.
 *
 * Nothing here is fixed to a week number. The deck order, the cast's names and which arcs turn up
 * at all come from the run's seed and from what your arcology looks like when a draw comes due,
 * so two runs from the same origin do not tell the same story.
 */
import type { Person, SaveState } from "./types";
import { rng, hash } from "./rng";
import { clamp } from "./psyche";
import { applyTreatment, refresh, read, type Treatment } from "./obedience";
import { remember, newMemory } from "./memory";
import { generatePerson } from "./generate";
import { startRumor } from "./social";
import { valuePerson } from "./economy";

/* ── the cast ───────────────────────────────────────────────────────────────────────────────── */

export type Role =
  | "creditor" | "deposed" | "captain" | "old_owner" | "rival_broker" | "sold_one" | "chair"
  | "sibling" | "journalist" | "zealot" | "collector" | "fixer" | "flame" | "auctioneer"
  | "sister" | "doctor" | "rival_owner" | "insurgent" | "general" | "refugee" | "engineer";

export interface NPC {
  role: Role;
  name: string;
  /** How they are addressed in prose: "Vance", "Mother Ines". */
  short: string;
  pronoun: "he" | "she";
  /** Toward you, −100 … +100. */
  disposition: number;
  status: "around" | "gone" | "dead" | "ally" | "owned";
  /** Set when they end up in your household. */
  person?: string;
  /** What they do, in a few words, for the journal. */
  what: string;
}

const FIRST_M = ["Aurelio", "Tomas", "Dmitri", "Kwame", "Henrik", "Rafael", "Idris", "Callum", "Yusuf", "Matthias", "Lionel", "Oren", "Silas", "Bastien"];
const FIRST_F = ["Ilse", "Marguerite", "Adaeze", "Sabine", "Yara", "Renata", "Ines", "Petra", "Oona", "Leonie", "Soraya", "Valentina", "Harriet", "Mireille"];
const SURNAMES = ["Vance", "Okafor", "Marr", "Delacroix", "Haldane", "Ruiz", "Castellan", "Ishikawa", "Brandt", "Novak", "Achterberg", "Sarr", "Lindqvist", "Moreau", "Kade", "Ferreira", "Oyelaran", "Szabo", "Whitlock", "Bellamy"];

const ROLE_WHAT: Record<Role, string> = {
  creditor: "holds your father's debts", deposed: "owned the building before you took it", captain: "commands your mercenaries",
  old_owner: "owned you, once", rival_broker: "trades in the same waters you did", sold_one: "a woman you sold, years ago",
  chair: "chairs the fund that owns you", sibling: "your sibling, and the family's favourite", journalist: "writes about arcologies",
  zealot: "preaches on the lower levels", collector: "collects beautiful things", fixer: "moves cargo nobody asks about",
  flame: "someone from before all this", auctioneer: "runs the Grand Exchange", sister: "is looking for her sister",
  doctor: "a ship's doctor", rival_owner: "owns the arcology next door",
  insurgent: "leads the local Daughters of Liberty cell", general: "commands an Old World army", refugee: "speaks for the refugees", engineer: "an engineer who builds things that keep the sea out",
};

/** Roles that are always a particular sex in the fiction, because the story needs it. */
const ROLE_SEX: Partial<Record<Role, "he" | "she">> = { sold_one: "she", sister: "she", zealot: "he", insurgent: "she", refugee: "she" };

export function makeNpc(st: StoryState, role: Role): NPC {
  const r = rng(`npc:${st.seed}:${role}`);
  const pronoun = ROLE_SEX[role] ?? (r.chance(0.5) ? "he" : "she");
  const first = r.pick(pronoun === "he" ? FIRST_M : FIRST_F);
  const taken = new Set(Object.values(st.cast).map((n) => n.name.split(" ")[1]));
  const surname = r.pick(SURNAMES.filter((x) => !taken.has(x)));
  const name = `${first} ${surname}`;
  const short = role === "zealot" ? `Brother ${first}` : role === "sibling" || role === "flame" || role === "sold_one" || role === "sister" ? first : surname;
  return { role, name, short, pronoun, disposition: 0, status: "around", what: ROLE_WHAT[role] };
}

/* ── state ──────────────────────────────────────────────────────────────────────────────────── */

export interface ArcRun {
  id: string;
  beat?: string;
  /** Week the current beat becomes due. */
  due: number;
  started: number;
  subject?: string;
  done?: boolean;
  ending?: string;
}

export interface StoryState {
  seed: string;
  origin: string;
  cast: Partial<Record<Role, NPC>>;
  flags: Record<string, number | string | boolean>;
  arcs: Record<string, ArcRun>;
  /** Arc ids not yet started, in the order this run will try them. */
  deck: string[];
  /** The beat waiting on an answer. One at a time, so the story is a thing you read, not a queue. */
  pending?: { arc: string; beat: string };
  /** The story so far. */
  log: { week: number; arc: string; title: string; chose: string; text: string }[];
  /** When the next arc may be drawn. */
  next_draw: number;
  /** Whether the Supplicationism chain runs this game. Off unless chosen at the start. */
  supplication: boolean;
  ended?: { week: number; title: string; text: string };
}

/* ── definitions ────────────────────────────────────────────────────────────────────────────── */

export interface Pick {
  label: string;
  filter: (p: Person, c: Ctx) => boolean;
}

export interface Result {
  text: string;
  /** The next beat of this arc, if any. */
  next?: string;
  /** Weeks until it is due. 0 means straight away. */
  after?: number;
  /** Ends the arc, with a line for the journal. */
  end?: string;
}

export interface OptDef {
  id: string;
  label: string | ((c: Ctx) => string);
  note?: string | ((c: Ctx) => string);
  /** Hidden entirely unless this holds. */
  show?: (c: Ctx) => boolean;
  /** Visible but locked, with the reason, unless this returns null. */
  need?: (c: Ctx) => string | null;
  /** The option needs one of your people chosen. */
  pick?: Pick;
  run: (c: Ctx, picked?: Person) => Result;
}

export interface BeatDef {
  title: string | ((c: Ctx) => string);
  text: (c: Ctx) => string;
  options: OptDef[];
  /** When set, the beat waits past its due week until this holds. */
  wait?: (c: Ctx) => boolean;
}

export interface ArcDef {
  id: string;
  title: string;
  kind: "origin" | "deck" | "world";
  /** For world arcs: weeks after it last started before it may start again. Unset: once a run. */
  repeat?: number;
  /** For origin arcs: which origin. */
  origin?: string;
  /** For deck arcs: whether it can start right now. */
  when?: (s: SaveState, st: StoryState) => boolean;
  /** Cast it brings in on start. */
  cast?: Role[];
  /** The household member it is about, chosen when it starts. */
  subject?: (s: SaveState, st: StoryState) => Person | undefined;
  start: string;
  /** Weeks from start to the first beat. */
  delay?: number;
  beats: Record<string, BeatDef>;
}

/* ── the context a beat is written and resolved in ──────────────────────────────────────────── */

export interface Ctx {
  s: SaveState;
  st: StoryState;
  arc: ArcRun;
  week: number;
  /** The player's name, or "you". */
  you: string;
  /** What the household calls you. */
  title: string;
  arcology: string;
  npc: (role: Role) => NPC;
  n: (role: Role) => string;
  full: (role: Role) => string;
  he: (role: Role) => string;
  He: (role: Role) => string;
  him: (role: Role) => string;
  his: (role: Role) => string;
  His: (role: Role) => string;
  subj?: Person;
  sn: string;
  flag: (k: string) => number | string | boolean | undefined;
  set: (k: string, v: number | string | boolean) => void;
  /** Consequences recorded as they happen, shown under the result. */
  out: string[];
  cash: (n: number) => void;
  rep: (n: number) => void;
  standing: (n: number) => void;
  prosperity: (n: number) => void;
  security: (n: number) => void;
  crime: (n: number) => void;
  like: (role: Role, n: number) => void;
  treat: (p: Person | undefined, kind: Treatment["kind"], size: number, why: string) => void;
  household: (kind: Treatment["kind"], size: number, why: string) => void;
  hope: (n: number) => void;
  addSlave: (opts: { seed: string; name?: string; age?: number; quality?: number; nation?: string; how: string; note?: string; hostile?: boolean; devoted?: boolean }) => Person;
  remove: (p: Person, how: "sold" | "free" | "dead" | "gone", note: string, price?: number) => void;
  loan: (principal: number, weeks: number, apr: number, lender: "bank" | "shark") => void;
  owned: () => Person[];
  skill: (id: string) => number;
  rumor: (text: string, charge?: -1 | 0 | 1) => void;
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const money = (n: number) => `¤${Math.abs(Math.round(n)).toLocaleString()}`;

export function ownedAdults(s: SaveState): Person[] {
  return Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);
}

export function ctxFor(s: SaveState, st: StoryState, arc: ArcRun): Ctx {
  const npc = (role: Role): NPC => (st.cast[role] ??= makeNpc(st, role));
  const subj = arc.subject ? s.people[arc.subject] : undefined;
  const out: string[] = [];
  const c: Ctx = {
    s, st, arc, week: s.arcology.week,
    you: s.player.name && s.player.name !== "you" ? s.player.name : "you",
    title: s.player.address || "Master",
    arcology: s.arcology.name,
    npc,
    n: (r) => npc(r).short,
    full: (r) => npc(r).name,
    he: (r) => npc(r).pronoun,
    He: (r) => cap(npc(r).pronoun),
    him: (r) => (npc(r).pronoun === "he" ? "him" : "her"),
    his: (r) => (npc(r).pronoun === "he" ? "his" : "her"),
    His: (r) => (npc(r).pronoun === "he" ? "His" : "Her"),
    subj,
    sn: subj?.name ?? "she",
    flag: (k) => st.flags[k],
    set: (k, v) => { st.flags[k] = v; },
    out,
    cash: (n) => { s.arcology.cash += n; out.push(`${n >= 0 ? "+" : "−"}${money(n)}`); },
    rep: (n) => { s.arcology.rep = Math.max(0, s.arcology.rep + n); out.push(`${n >= 0 ? "+" : "−"}${Math.abs(n)} reputation`); },
    standing: (n) => { s.arcology.public_standing = clamp(s.arcology.public_standing + n, -10, 10); out.push(`the city thinks ${n > 0 ? "better" : "less"} of you`); },
    prosperity: (n) => { s.arcology.prosperity = clamp(s.arcology.prosperity + n, 0, 200); out.push(`${n >= 0 ? "+" : "−"}${Math.abs(n)} prosperity`); },
    security: (n) => { s.arcology.security = clamp(s.arcology.security + n, 0, 100); out.push(`${n >= 0 ? "+" : "−"}${Math.abs(n)} security`); },
    crime: (n) => { s.arcology.crime = clamp(s.arcology.crime + n, 0, 100); out.push(`crime ${n >= 0 ? "up" : "down"}`); },
    like: (role, n) => {
      const x = npc(role);
      x.disposition = clamp(x.disposition + n, -100, 100);
      out.push(`${x.short} ${n >= 0 ? "warms to you" : "cools on you"}`);
    },
    treat: (p, kind, size, why) => {
      if (!p) return;
      applyTreatment(p, { kind, size, why } as Treatment, s.arcology.week);
      if (s.memory[p.id] && size >= 4) remember(s.memory[p.id], { content: why, week: s.arcology.week, importance: Math.min(9, 3 + size), charge: kind === "cruelty" || kind === "coercion" || kind === "promise_broken" ? "sharp" : "warm" });
      refresh(p, s.memory[p.id]);
    },
    household: (kind, size, why) => {
      for (const p of ownedAdults(s)) applyTreatment(p, { kind, size, why } as Treatment, s.arcology.week);
      out.push(kind === "kindness" || kind === "recognition" || kind === "promise_kept" ? "the household takes heart" : "the household takes note");
    },
    hope: (n) => {
      for (const p of ownedAdults(s)) p.bond.hope = clamp(p.bond.hope + n, 0, 100);
      out.push(`the household's hope ${n >= 0 ? "rises" : "falls"}`);
    },
    addSlave: (o) => {
      const p = generatePerson({ seed: `story:${st.seed}:${o.seed}`, week: s.arcology.week, age: o.age, quality: o.quality ?? 0.3, nation: o.nation, central: true });
      if (o.name) { p.name = o.name.split(" ")[0]; p.surname = o.name.split(" ").slice(1).join(" ") || p.surname; }
      p.origin.acquired_how = o.how;
      p.origin.acquired_week = s.arcology.week;
      p.origin.background = o.note ?? p.origin.background;
      p.economics.price_paid = 0;
      if (o.hostile) { p.bond = { ...p.bond, bond: -40, fear: 30, resentment: 60, hope: 20 }; p.psyche.relaxation = -4; }
      if (o.devoted) { p.bond = { ...p.bond, bond: 55, fear: 5, resentment: 0, hope: 60 }; p.psyche.relaxation = 3; }
      s.people[p.id] = p;
      s.memory[p.id] = newMemory();
      refresh(p, s.memory[p.id]);
      out.push(`${p.name} joins the household`);
      return p;
    },
    remove: (p, how, note, price) => {
      p.status = how === "gone" ? "free" : how;
      p.exit_week = s.arcology.week;
      p.exit_note = note;
      for (const f of Object.values(s.arcology.facilities)) {
        f.workers = f.workers.filter((w) => w !== p.id);
        if (f.manager === p.id) f.manager = undefined;
      }
      p.facility = undefined;
      if (price) s.arcology.cash += price;
      out.push(`${p.name} is ${how === "sold" ? `sold${price ? ` for ${money(price)}` : ""}` : how === "free" ? "freed" : how === "dead" ? "dead" : "gone"}`);
    },
    loan: (principal, weeks, apr, lender) => {
      s.arcology.loans.push({ lender, principal, apr, due_week: s.arcology.week + weeks, installments: weeks });
      out.push(`a ${money(principal)} debt, due in ${weeks} weeks`);
    },
    owned: () => ownedAdults(s),
    skill: (id) => s.player.skills[id] ?? 0,
    rumor: (text, charge = 0) => { startRumor(s, text, { salience: 6, charge }); },
  };
  return c;
}

/* ── the registry of arcs ───────────────────────────────────────────────────────────────────── */

const REGISTRY: Record<string, ArcDef> = {};

export function registerArcs(arcs: ArcDef[]): void {
  for (const a of arcs) REGISTRY[a.id] = a;
}

export function arcDef(id: string): ArcDef | undefined {
  return REGISTRY[id];
}

export function allArcs(): ArcDef[] {
  return Object.values(REGISTRY);
}

/* ── running it ─────────────────────────────────────────────────────────────────────────────── */

export function storyOf(s: SaveState): StoryState | undefined {
  return s.story;
}

/** A fresh story for a new game. The origin arc starts at once; the deck is shuffled by seed. */
export function newStory(s: SaveState, origin: string, seed: string, supplication = false): StoryState {
  const r = rng(`deck:${seed}`);
  const deck = r.shuffle(allArcs().filter((a) => a.kind === "deck").map((a) => a.id));
  const st: StoryState = {
    seed, origin, cast: {}, flags: {}, arcs: {}, deck, log: [],
    next_draw: 3 + r.int(0, 3), supplication,
  };
  s.story = st;
  const o = allArcs().find((a) => a.kind === "origin" && a.origin === origin);
  if (o) startArc(s, st, o);
  promote(s);
  return st;
}

export function startArc(s: SaveState, st: StoryState, def: ArcDef): ArcRun {
  for (const role of def.cast ?? []) st.cast[role] ??= makeNpc(st, role);
  const subject = def.subject?.(s, st);
  const run: ArcRun = { id: def.id, beat: def.start, due: s.arcology.week + (def.delay ?? 0), started: s.arcology.week, subject: subject?.id };
  st.arcs[def.id] = run;
  st.deck = st.deck.filter((x) => x !== def.id);
  return run;
}

/** The beat waiting on you, with its context. */
export function pendingBeat(s: SaveState): { def: ArcDef; beat: BeatDef; run: ArcRun; c: Ctx } | undefined {
  const st = s.story;
  if (!st?.pending) return undefined;
  const def = arcDef(st.pending.arc);
  const run = st.arcs[st.pending.arc];
  const beat = def?.beats[st.pending.beat];
  if (!def || !run || !beat) { st.pending = undefined; return undefined; }
  return { def, beat, run, c: ctxFor(s, st, run) };
}

/** Pick the next due beat and stamp it pending. Origin arcs go first. */
export function promote(s: SaveState): void {
  const st = s.story;
  if (!st || st.pending) return;
  const due = Object.values(st.arcs)
    .filter((a) => !a.done && a.beat && a.due <= s.arcology.week)
    .sort((a, b) => (arcDef(a.id)?.kind === "origin" ? -1 : 0) - (arcDef(b.id)?.kind === "origin" ? -1 : 0) || a.due - b.due);
  for (const a of due) {
    const def = arcDef(a.id);
    const beat = def?.beats[a.beat!];
    if (!def || !beat) { a.done = true; continue; }
    // An arc whose subject is gone cannot go on; it closes quietly.
    if (a.subject && !isHere(s, a.subject)) { a.done = true; a.ending = "she was no longer here"; continue; }
    if (beat.wait && !beat.wait(ctxFor(s, st, a))) continue;
    st.pending = { arc: a.id, beat: a.beat! };
    return;
  }
}

function isHere(s: SaveState, id: string): boolean {
  const p = s.people[id];
  return !!p && (p.status === "owned" || p.status === "indentured");
}

/** Weekly: draw a new arc when one is due, then promote whatever beat is waiting. */
export function tickStory(s: SaveState): { text: string; tone: "good" | "bad" | "neutral" | "warning"; weight: number }[] {
  const st = s.story;
  const lines: { text: string; tone: "good" | "bad" | "neutral" | "warning"; weight: number }[] = [];
  if (!st || st.ended) return lines;
  const week = s.arcology.week;
  const running = Object.values(st.arcs).filter((a) => !a.done && arcDef(a.id)?.kind === "deck").length;
  if (week >= st.next_draw && running < 3) {
    const def = st.deck.map((id) => arcDef(id)).find((d) => d && (!d.when || d.when(s, st)));
    const r = rng(`draw:${st.seed}:${week}`);
    if (def) {
      startArc(s, st, def);
      st.next_draw = week + 3 + r.int(0, 3);
    } else st.next_draw = week + 2;
  }
  const before = st.pending;
  promote(s);
  if (st.pending && st.pending !== before) {
    const p = pendingBeat(s);
    if (p) lines.push({ text: `${typeof p.beat.title === "function" ? p.beat.title(p.c) : p.beat.title}.`, tone: "warning", weight: 12 });
  }
  return lines;
}

export interface OptionView { id: string; label: string; note?: string; locked?: string; pick?: Pick }

export function optionsFor(s: SaveState): OptionView[] {
  const p = pendingBeat(s);
  if (!p) return [];
  return p.beat.options
    .filter((o) => !o.show || o.show(p.c))
    .map((o) => ({
      id: o.id,
      label: typeof o.label === "function" ? o.label(p.c) : o.label,
      note: typeof o.note === "function" ? o.note(p.c) : o.note,
      locked: o.need?.(p.c) ?? undefined,
      pick: o.pick,
    }));
}

/** Who can be chosen for an option that needs someone. */
export function pickable(s: SaveState, optionId: string): Person[] {
  const p = pendingBeat(s);
  const o = p?.beat.options.find((x) => x.id === optionId);
  if (!p || !o?.pick) return [];
  return ownedAdults(s).filter((x) => o.pick!.filter(x, p.c));
}

export interface Answer { title: string; chose: string; text: string; consequences: string[]; ended?: string }

/** Answer the pending beat. */
export function answer(s: SaveState, optionId: string, pickedId?: string): Answer | null {
  const st = s.story;
  const p = pendingBeat(s);
  if (!st || !p) return null;
  const o = p.beat.options.find((x) => x.id === optionId);
  if (!o) return null;
  if (o.need?.(p.c)) return null;
  const picked = pickedId ? s.people[pickedId] : undefined;
  if (o.pick && !picked) return null;
  const res = o.run(p.c, picked);
  const title = typeof p.beat.title === "function" ? p.beat.title(p.c) : p.beat.title;
  const chose = typeof o.label === "function" ? o.label(p.c) : o.label;
  st.log.push({ week: s.arcology.week, arc: p.def.id, title, chose, text: res.text });
  if (st.log.length > 200) st.log.shift();
  st.pending = undefined;
  if (res.end !== undefined || !res.next) {
    p.run.done = true;
    p.run.beat = undefined;
    p.run.ending = res.end ?? "";
  } else {
    p.run.beat = res.next;
    p.run.due = s.arcology.week + (res.after ?? 1);
  }
  // A beat due now follows straight on, so a scene with more than one turn in it plays through.
  promote(s);
  return { title, chose, text: res.text, consequences: p.c.out, ended: res.end };
}

/* ── helpers the arcs share ─────────────────────────────────────────────────────────────────── */

/** The one she would most hate to lose, by the numbers the market uses. */
export function mostValuable(s: SaveState): Person | undefined {
  return ownedAdults(s).sort((a, b) => valuePerson(s, b) - valuePerson(s, a))[0];
}

export function mostResentful(s: SaveState): Person | undefined {
  return ownedAdults(s).sort((a, b) => b.bond.resentment - a.bond.resentment)[0];
}

export function closest(s: SaveState): Person | undefined {
  return ownedAdults(s).sort((a, b) => read(b).devotion - read(a).devotion)[0];
}

export function seeded(s: SaveState, st: StoryState, key: string) {
  return rng(`${st.seed}:${key}:${s.arcology.week}`);
}

export function stableHash(x: string): number { return hash(x); }
