/**
 * CONDENSING — one quick pass that boils a long memory bank down to what mattered.
 *
 * The weekly decay already turns faded detail into gist, but the gist it leaves is a shape with no
 * content ("something bad, around week 12"), and a woman who has been in the house a year carries
 * sixty lines of which a third say nearly the same thing in different words. Every reading of her
 * (the scene's recall, her re-reading, consulting her) pulls from that pile.
 *
 * So when a bank gets big, the older lines that aren't core go to the model once, with the facts
 * she holds, and come back as fewer memories that each say which of the old ones they stand for,
 * plus a few sentences on the shape of her time here. Core memories and the last few weeks are
 * never touched. The merged memory keeps the earliest week, the latest week, the count and the
 * freshest decay of what it replaced, and weighs as much as all of them did together, so the tilt
 * of the bank (which is read straight into devotion) barely moves; a pass that would move it much,
 * by dropping too much or changing a memory's charge, is thrown away.
 *
 * Nothing changes if the model fails, answers badly, or makes the bank bigger.
 */
import type { EpisodicMemory, Person, PersonMemory, SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { coarsen, FC_VOICE } from "./register";
import { memId } from "./memory";
import { memoryTilt } from "./obedience";
import { clamp } from "./psyche";

/** Weeks back that are never condensed: what just happened keeps its detail. */
const RECENT = 4;
/** Weeks between passes on the same woman. */
const GAP = 4;
/** About this many tokens of memory before a pass is worth a call. */
export const CONDENSE_AT = 1100;
/** And at least this many lines that could go into it. */
const MIN_LINES = 10;
/** How far the bank's tilt may move before a pass is thrown away. */
const TILT_LIMIT = 0.15;

const CHARGES = ["warm", "cold", "sharp", "dull", "bright"] as const;

/** Rough tokens: four characters each, which is close enough to decide whether to bother. */
export function memoryTokens(mem?: PersonMemory): number {
  if (!mem) return 0;
  const chars = mem.episodic.reduce((n, e) => n + e.content.length + 24, 0)
    + mem.facts.reduce((n, f) => n + f.text.length + 12, 0)
    + mem.gist.reduce((n, g) => n + g.length + 2, 0)
    + (mem.digest?.length ?? 0);
  return Math.round(chars / 4);
}

/** The lines a pass may fold together: not core, and not from the last few weeks. */
function foldable(mem: PersonMemory, week: number): EpisodicMemory[] {
  return mem.episodic.filter((e) => !e.core && week - (e.last_week ?? e.week) >= RECENT);
}

export function needsCondensing(mem: PersonMemory | undefined, week: number): boolean {
  if (!mem) return false;
  if (mem.condensed_week !== undefined && week - mem.condensed_week < GAP) return false;
  return memoryTokens(mem) >= CONDENSE_AT && foldable(mem, week).length >= MIN_LINES;
}

/** Who's due, biggest bank first. */
export function dueToCondense(s: SaveState): Person[] {
  const week = s.arcology.week;
  return Object.values(s.people)
    .filter((p) => p.status !== "dead" && needsCondensing(s.memory[p.id], week))
    .sort((a, b) => memoryTokens(s.memory[b.id]) - memoryTokens(s.memory[a.id]));
}

export const CONDENSE_SYSTEM = `You condense one woman's memories in Free Cities, an adult text game about owning an arcology, as one strict JSON object. She is a slave in the owner's house. Her memories are read back into later scenes, so what you write is what she will carry from now on.

Each memory comes numbered, with its week (or weeks and how many times it happened), its importance out of 10, and its charge (warm, bright, cold, sharp or dull).

- Merge memories that are the same thing, or the same kind of thing, into one. A run of the same work week after week is one memory with the week range.
- Keep every memory that changed her or that a later scene would need: a first time, a promise, a rule or order, an injury or operation, a punishment, a kindness that mattered, a betrayal, something she was given or had taken away, someone she met. Keep the concrete detail (who, what, where) in plain words.
- Drop routine that changed nothing and that nothing later depends on.
- Write each in the first person, as hers ("I", "me", "my"), with the player as "the owner", never "you". Keep who did what to whom exactly as the originals say it.
- Invent nothing. Every memory you write must say only what the ones it covers say.
- "covers" lists the numbers of every original it stands for. Each original goes in at most one. An original in none of them is dropped.
- "importance" is 0 to 10 and "charge" is one of warm, bright, cold, sharp, dull, the same as the strongest of what it covers.
- Write about half as many memories as you were given, or fewer.
- "facts" are the things she knows, merged where they say the same thing, and only from the facts given.
- "story" is two to four blunt sentences, in the first person, in her own crude words: what's been done to her and by her here, who's had her and how, what she does all week, what she's into now and where she stands with the owner. What happened, never an arc about growing or feeling. Only from what's given.

{"memories":[{"text":"...","covers":[1,2],"importance":6,"charge":"warm"}],"facts":["..."],"story":"..."}`;

interface Out {
  memories?: { text?: string; covers?: unknown[]; importance?: number; charge?: string }[];
  facts?: unknown[];
  story?: string;
}

function brief(p: Person, mem: PersonMemory, lines: EpisodicMemory[]): string {
  const when = (e: EpisodicMemory) => (e.times ?? 1) > 1 ? `weeks ${e.week}–${e.last_week ?? e.week}, ${e.times} times` : `week ${e.week}`;
  return [
    `## HER\n${p.name}, ${p.age}, was a ${p.origin.career} before she came here in week ${p.origin.acquired_week}.`,
    mem.digest ? `## THE SHAPE OF HER TIME HERE, AS LAST WRITTEN\n${mem.digest}` : "",
    mem.gist.length ? `## WHAT FADED MEMORIES LEFT\n${mem.gist.join("; ")}` : "",
    `## HER MEMORIES\n${lines.map((e, i) => `${i + 1}. (${when(e)}; importance ${e.importance}; ${e.charge}) ${e.content}`).join("\n")}`,
    mem.facts.length ? `## WHAT SHE KNOWS\n${mem.facts.map((f) => `· ${f.text}`).join("\n")}` : "",
  ].filter(Boolean).join("\n\n");
}

/** Fold the model's answer into the bank. Returns false, and leaves the bank as it was, when the
 *  answer doesn't hold up. Exported for the tests. */
export function applyCondensed(mem: PersonMemory, lines: EpisodicMemory[], out: Out | null, week: number): boolean {
  if (!out || !Array.isArray(out.memories) || !out.memories.length) return false;
  const used = new Set<number>();
  const made: EpisodicMemory[] = [];
  for (const m of out.memories) {
    const text = coarsen(String(m?.text ?? "").replace(/\s+/g, " ").trim()).slice(0, 260);
    const covers = (Array.isArray(m?.covers) ? m.covers : []).map((x) => Number(x) - 1)
      .filter((i) => Number.isInteger(i) && i >= 0 && i < lines.length && !used.has(i));
    if (!text || !covers.length) continue;
    for (const i of covers) used.add(i);
    const from = covers.map((i) => lines[i]);
    const charge = (CHARGES as readonly string[]).includes(String(m.charge)) ? m.charge as EpisodicMemory["charge"] : majority(from.map((e) => e.charge));
    const times = from.reduce((n, e) => n + (e.times ?? 1), 0);
    const first = Math.min(...from.map((e) => e.week));
    const last = Math.max(...from.map((e) => e.last_week ?? e.week));
    made.push({
      id: memId(),
      content: text,
      week: first,
      ...(times > 1 || last !== first ? { times, last_week: last } : {}),
      importance: clamp(Math.round(Number(m.importance) || Math.max(...from.map((e) => e.importance))), 0, 10),
      charge,
      decay: Math.max(...from.map((e) => e.decay)),
      source: from[0].source,
      where: majority(from.map((e) => e.where).filter((x): x is string => !!x)),
    });
    const who = [...new Set(from.flatMap((e) => e.who ?? []))].slice(0, 6);
    if (who.length) made[made.length - 1].who = who;
    // As heavy in the tilt as everything it stands for.
    const own = (made[made.length - 1].importance / 10) * Math.max(0.2, made[made.length - 1].decay);
    const was = from.reduce((n, e) => n + (e.importance / 10) * Math.max(0.2, e.decay) * (e.weight ?? 1), 0);
    if (own > 0 && was / own > 1.05) made[made.length - 1].weight = +Math.min(40, was / own).toFixed(2);
  }
  // Nothing smaller is no pass at all.
  if (!made.length || made.length >= lines.length) return false;
  const gone = new Set(lines.map((e) => e.id));
  const next: PersonMemory = { ...mem, episodic: [...mem.episodic.filter((e) => !gone.has(e.id)), ...made].sort((a, b) => a.week - b.week) };
  // The bank is read into devotion. A pass that changes how she feels about the owner is wrong.
  if (Math.abs(memoryTilt(next) - memoryTilt(mem)) > TILT_LIMIT) return false;
  mem.episodic = next.episodic;
  const facts = (Array.isArray(out.facts) ? out.facts : []).map((f) => String(f ?? "").replace(/\s+/g, " ").trim().slice(0, 240)).filter(Boolean);
  if (facts.length && facts.length <= mem.facts.length) mem.facts = facts.map((text) => ({ text, week }));
  const story = String(out.story ?? "").replace(/\s+/g, " ").trim();
  if (story.length >= 30) {
    mem.digest = coarsen(story).slice(0, 800);
    // The story says what the vague faded lines only gestured at.
    mem.gist = [];
  }
  mem.condensed_week = week;
  return true;
}

function majority<T>(xs: T[]): T {
  const n = new Map<T, number>();
  for (const x of xs) n.set(x, (n.get(x) ?? 0) + 1);
  return [...n].sort((a, b) => b[1] - a[1])[0]?.[0] as T;
}

/** One pass over her bank, one model call. `force` runs it whatever the size (the button on her
 *  page). Returns what it did. */
export async function condenseMemory(s: SaveState, p: Person, opts?: { force?: boolean; signal?: AbortSignal }): Promise<{ ok: boolean; before: number; after: number; note: string }> {
  const mem = s.memory[p.id];
  const week = s.arcology.week;
  const before = memoryTokens(mem);
  if (!mem || !modelsAvailable()) return { ok: false, before, after: before, note: "No model is set up." };
  const lines = foldable(mem, week);
  if (lines.length < (opts?.force ? 4 : MIN_LINES) || (!opts?.force && !needsCondensing(mem, week))) return { ok: false, before, after: before, note: "There isn't enough to condense yet." };
  const res = await call({
    system: `${CONDENSE_SYSTEM}\n\n${FC_VOICE}`,
    user: brief(p, mem, lines),
    model: s.models.bookkeeper_model || s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 2200,
    temperature: 0.3,
    signal: opts?.signal,
  });
  // Whatever came of it, she isn't tried again for a few weeks: a model that can't do it this week
  // shouldn't cost a call every week.
  mem.condensed_week = week;
  if (!res.ok) return { ok: false, before, after: before, note: res.error ? `The model didn't answer: ${res.error}` : "The model didn't answer." };
  const live = s.memory[p.id];
  if (!live) return { ok: false, before, after: before, note: "" };
  // Numbered as the model saw them; any that went from the bank while it was writing are left out.
  const still = new Set(live.episodic.map((e) => e.id));
  const took = lines.every((e) => still.has(e.id)) && applyCondensed(live, lines, parseJson<Out>(res.text), week);
  const after = memoryTokens(live);
  return took
    ? { ok: true, before, after, note: `Condensed: about ${before} tokens down to ${after}.` }
    : { ok: false, before, after: before, note: "The model's version didn't hold up, so nothing was changed." };
}
