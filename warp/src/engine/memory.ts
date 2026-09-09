/**
 * MEMORY — what a person carries, and what it costs them to carry it.
 *
 * Three layers, the same as Weft's: episodic (what happened, with detail), gist (what is left when
 * the detail goes), and durable facts/beliefs (what it settled into). Decay is not forgetting —
 * it is the transition from an event you could describe to a shape you cannot argue with.
 *
 * The arcology-specific part is that memories here are mostly ABOUT the owner, and the tilt of
 * that bank is read straight into devotion (obedience.ts). That is the mechanism by which a good
 * month cannot undo a bad year: the bad year is still in the bank, at full weight, and it is what
 * she is comparing this month to.
 */
import type { EpisodicMemory, PersonMemory, MemorySource } from "./types";
import { clamp } from "./psyche";

export function newMemory(): PersonMemory {
  return { episodic: [], beliefs: [], facts: [], gist: [] };
}

let counter = 0;
export function memId(): string { return `m${Date.now().toString(36)}${(counter++).toString(36)}`; }

export interface RecordMemory {
  content: string;
  week: number;
  importance?: number;
  charge?: EpisodicMemory["charge"];
  source?: MemorySource;
  where?: string;
  who?: string[];
  core?: boolean;
}

export function remember(mem: PersonMemory, m: RecordMemory): EpisodicMemory {
  const e: EpisodicMemory = {
    id: memId(),
    content: m.content,
    week: m.week,
    importance: clamp(m.importance ?? 5, 0, 10),
    charge: m.charge ?? "dull",
    decay: 1,
    source: m.source ?? "lived",
    where: m.where,
    who: m.who,
    core: m.core,
  };
  // A memory that duplicates one from the same week is the bookkeeper filing the same beat twice.
  const dup = mem.episodic.find((x) => x.week === e.week && similar(x.content, e.content));
  if (dup) { dup.importance = Math.max(dup.importance, e.importance); return dup; }
  mem.episodic.push(e);
  return e;
}

function similar(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter((w) => w.length > 3);
  const A = new Set(norm(a)), B = norm(b);
  if (!A.size || !B.length) return false;
  const hits = B.filter((w) => A.has(w)).length;
  return hits / Math.max(A.size, B.length) > 0.6;
}

/** WEEKLY DECAY. Important things fade slower; core memories never fade. What falls below the
 *  detail floor is compacted to gist and the episode is dropped, so the bank does not grow without
 *  bound over a two-hundred-week campaign. */
export function decayMemory(mem: PersonMemory, week: number, cap = 60): string[] {
  const dropped: string[] = [];
  for (const e of mem.episodic) {
    if (e.core) continue;
    const age = week - e.week;
    if (age <= 0) continue;
    const rate = 0.035 * (1 - e.importance / 14);
    e.decay = +Math.max(0, e.decay - rate).toFixed(3);
  }
  const keep: EpisodicMemory[] = [];
  for (const e of mem.episodic) {
    if (e.core || e.decay > 0.2) keep.push(e);
    else { dropped.push(e.content); pushGist(mem, e); }
  }
  mem.episodic = keep;
  // Hard cap: when a bank is over, the least important, most decayed go first.
  if (mem.episodic.length > cap) {
    mem.episodic.sort((a, b) => (b.core ? 1 : 0) - (a.core ? 1 : 0) || b.importance * b.decay - a.importance * a.decay);
    for (const e of mem.episodic.slice(cap)) pushGist(mem, e);
    mem.episodic = mem.episodic.slice(0, cap);
  }
  return dropped;
}

function pushGist(mem: PersonMemory, e: EpisodicMemory): void {
  const line = gistOf(e);
  if (!mem.gist.includes(line)) mem.gist.push(line);
  if (mem.gist.length > 24) mem.gist.shift();
}

/** What a faded memory leaves: the shape and the charge, not the detail. */
function gistOf(e: EpisodicMemory): string {
  const when = `week ${e.week}`;
  const tone = e.charge === "warm" || e.charge === "bright" ? "something good" :
    e.charge === "sharp" ? "something that still stings" :
    e.charge === "cold" ? "something bad" : "something";
  const where = e.where ? ` in the ${e.where}` : "";
  return `${tone}${where}, around ${when}`;
}

/** RETRIEVAL — top-k by relevance to a query, with importance and freshness folded in. Feeds the
 *  scene prompt: a character in a scene brings what that scene reminds them of, not their diary. */
export function recall(mem: PersonMemory, query: string, k = 4, week = 0): EpisodicMemory[] {
  const q = new Set(query.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter((w) => w.length > 3));
  const scored = mem.episodic.map((e) => {
    const words = e.content.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/);
    const hits = q.size ? words.filter((w) => q.has(w)).length / Math.max(4, words.length) : 0;
    const fresh = week ? Math.max(0, 1 - (week - e.week) / 80) : 0.5;
    return { e, s: hits * 2.2 + (e.importance / 10) * 1.2 + fresh * 0.6 + (e.core ? 0.8 : 0) };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, k).map((x) => x.e);
}

/** BECOMING — repeated episodes with the same charge settle into a belief. Run on the reflection
 *  cadence, never per-week per-person, because a single bad Tuesday should not become a conviction.
 *  The state the body was in when the events happened shapes the belief that forms from them: the
 *  same month reads as "he protects what is his" to a settled body and "he is deciding who to
 *  discard next" to a braced one. */
export function reflect(mem: PersonMemory, week: number, braced: boolean): string | null {
  const recent = mem.episodic.filter((e) => week - e.week <= 12 && e.importance >= 5);
  if (recent.length < 4) return null;
  const warm = recent.filter((e) => e.charge === "warm" || e.charge === "bright").length;
  const cold = recent.filter((e) => e.charge === "cold" || e.charge === "sharp").length;
  if (Math.abs(warm - cold) < 3) return null;

  const text = warm > cold
    ? braced ? "It has been good, and that is exactly when it turns." : "This is survivable, and some of it is more than that."
    : braced ? "Nothing here will ever be safe, and pretending otherwise is how people get hurt." : "This is worse than I let myself say out loud.";

  const existing = mem.beliefs.find((b) => b.text === text);
  if (existing) { existing.strength = clamp(existing.strength + 1, 0, 10); existing.week = week; return null; }
  mem.beliefs.push({ text, strength: 3, week });
  if (mem.beliefs.length > 8) mem.beliefs.sort((a, b) => b.strength - a.strength), mem.beliefs.pop();
  return text;
}

export function learn(mem: PersonMemory, text: string, week: number, from?: string): void {
  if (mem.facts.some((f) => f.text === text)) return;
  mem.facts.push({ text, week, from });
  if (mem.facts.length > 40) mem.facts.shift();
}
