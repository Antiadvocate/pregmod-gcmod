/**
 * HOW SHE IS WITH PARTICULAR PEOPLE — kept.
 *
 * A scene has her kneeling to a guest and speaking softly to him and nobody else; the next scene
 * she's cold to him again, because the scene that showed it is gone and nothing wrote down that
 * this is who she is with him now. Here it is written down, one line per person: another of your
 * slaves, or anybody outside the household. The bookkeeper adds a line when a scene (or your own
 * direction) settles how she is with someone; you can write or strike one on her page. Every prompt
 * with her in it carries the list, and a slave who is on the other end of a line sees it on her card.
 *
 * One line per person, replaced whole: "Darius: subservient to him alone; talks to him gently".
 * How she is with you is the standing orders' job (engine/agreements), not this.
 */
import type { Person, SaveState } from "./types";

export interface Manner {
  /** Who it's toward, by the name the scene used. */
  toward: string;
  /** Their id, when they're one of yours. */
  id?: string;
  /** How she is with them, in plain words. */
  how: string;
  week: number;
  /** "you": you wrote it on her page. "scene": the bookkeeper read it out of a scene. */
  by: "you" | "scene";
}

export function mannerOf(p: Person): Manner[] { return (p.manner ??= []); }

const key = (x: string) => x.trim().toLowerCase().replace(/^the\s+/, "");

/** One of yours, by the name a scene called them. First names count. */
function resolve(s: SaveState, name: string, self: string): Person | undefined {
  const k = key(name);
  if (!k) return undefined;
  const all = Object.values(s.people).filter((x) => x.id !== self);
  return all.find((x) => key(x.name) === k || key(`${x.name} ${x.surname ?? ""}`) === k)
    ?? all.find((x) => key(x.name).split(/\s+/)[0] === k.split(/\s+/)[0]);
}

/** Set how she is with someone, replacing what was there. An empty `how` strikes it. */
export function setManner(s: SaveState, p: Person, toward: string, how: string, by: Manner["by"]): void {
  const name = toward.trim().replace(/^["']|["']$/g, "").slice(0, 60);
  if (!name || /^(the owner|you|owner|master|mistress)$/i.test(name)) return;
  const who = resolve(s, name, p.id);
  const list = mannerOf(p);
  const i = list.findIndex((m) => (who && m.id === who.id) || key(m.toward) === key(who?.name ?? name));
  if (i >= 0) list.splice(i, 1);
  const line = how.trim().replace(/\s+/g, " ").replace(/[.]+$/, "").slice(0, 200);
  if (!line) return;
  list.push({ toward: who?.name ?? name, id: who?.id, how: line, week: s.arcology.week, by });
  if (list.length > 12) list.splice(0, list.length - 12);
}

export function dropManner(p: Person, toward: string): void {
  const list = mannerOf(p);
  const i = list.findIndex((m) => key(m.toward) === key(toward));
  if (i >= 0) list.splice(i, 1);
}

/** The bare lines, for prompts that word their own heading. */
export function mannerLines(p: Person): string[] {
  return mannerOf(p).map((m) => `${m.toward}: ${m.how}`);
}

/** For her card: how she is with particular people, and how others of yours are with her. */
export function mannerBrief(s: SaveState, p: Person): string {
  const out: string[] = [];
  // Only people who exist: a scene can invent a name ("Halyna calls me the morning appointment")
  // that nobody in the save has, and kept on her card it turns into a slave who was never bought.
  const first = (n: string) => n.trim().split(/\s+/)[0].toLowerCase();
  const known = new Set([...Object.values(s.people).map((x) => first(x.name)), ...Object.values(s.faces ?? {}).map((f) => first(f.name))]);
  const hers = mannerOf(p).filter((m) => (m.id && s.people[m.id]) || known.has(first(m.toward))).map((m) => `${m.toward}: ${m.how}`);
  if (hers.length) out.push(`HOW SHE IS WITH PARTICULAR PEOPLE (settled; whenever one of them is in the scene or comes up, she is like this with them, until a scene changes it): ${hers.join("; ")}.`);
  const theirs = Object.values(s.people)
    .filter((x) => x.id !== p.id && (x.status === "owned" || x.status === "indentured"))
    .flatMap((x) => mannerOf(x).filter((m) => m.id === p.id).map((m) => `${x.name} with her: ${m.how}`));
  if (theirs.length) out.push(`HOW OTHERS ARE WITH HER: ${theirs.join("; ")}.`);
  return out.join("\n");
}
