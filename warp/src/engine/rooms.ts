/**
 * HER ROOM, OVER TIME — what it does to her week after week, and what changing it does.
 *
 * Comfort is felt against what she's used to. A new bed is a big thing the first week and the
 * ordinary state of things by the second month; taking it away again hurts more than giving it
 * helped. So every room carries the comfort she has got used to (`used_to`), which closes on the
 * real comfort a fifth of the way each week, and the shove each week is the steady part (a good
 * room is always a little better than a bad one) plus the gap. She also measures her room against
 * the others': a woman sleeping on a mat while three of the household have their own rooms knows
 * exactly what that says.
 */
import type { Person, SaveState } from "./types";
import { AXES, EXTRA_BY_ID, NEEDS, TOUCH_COST, type RoomAxis } from "../data/rooms";
import { clamp, shove } from "./psyche";
import { applyTreatment } from "./obedience";
import { remember } from "./memory";
import { chronicle } from "./chronicle";

export interface Room {
  levels: Record<RoomAxis, number>;
  extras: string[];
  /** Personal touches, in your words: "a framed photo of her sister". */
  touches: { text: string; week: number }[];
  /** The comfort she has got used to. */
  used_to: number;
  changed?: number;
}

const AXIS_IDS = Object.keys(AXES) as RoomAxis[];

export function roomOf(p: Person): Room {
  const r = (p.room ??= { levels: { space: 0, bed: 0, bath: 0, view: 0, climate: 0 }, extras: [], touches: [], used_to: 0 });
  for (const a of AXIS_IDS) r.levels[a] ??= 0;
  r.extras ??= []; r.touches ??= [];
  return r;
}

export function levelDef(axis: RoomAxis, level: number) {
  return AXES[axis].levels.find((l) => l.level === level) ?? AXES[axis].levels.find((l) => l.level === 0)!;
}

/** How comfortable her room is for HER: the same shelf of books is worth more to a reader. */
export function comfort(p: Person): number {
  const r = roomOf(p);
  let n = 0;
  for (const a of AXIS_IDS) n += levelDef(a, r.levels[a]).comfort;
  for (const id of r.extras) {
    const x = EXTRA_BY_ID[id];
    if (x) n += x.comfort * x.fits(p);
  }
  n += Math.min(3, r.touches.length) * 0.5;
  return Math.round(n * 10) / 10;
}

export function roomUpkeep(p: Person): number {
  const r = roomOf(p);
  let n = 0;
  for (const a of AXIS_IDS) n += levelDef(a, r.levels[a]).upkeep;
  for (const id of r.extras) n += EXTRA_BY_ID[id]?.upkeep ?? 0;
  return n;
}

/** Her room in one line, for every prompt she appears in. Empty while it's the default bunk. */
export function roomLine(p: Person): string {
  if (!p.room) return "";
  const r = roomOf(p);
  const bits = AXIS_IDS.filter((a) => r.levels[a] !== 0).map((a) => levelDef(a, r.levels[a]).name);
  const things = r.extras.map((id) => EXTRA_BY_ID[id]?.name).filter(Boolean);
  const touches = r.touches.map((t) => t.text);
  if (!bits.length && !things.length && !touches.length) return "";
  return `HER ROOM, where she really lives. It has ${[...bits, ...things, ...touches].join(", ")}.`;
}

export interface RoomOption { kind: "axis" | "extra" | "remove"; axis?: RoomAxis; id?: string; level?: number; name: string; cost: number; upkeep: number; note: string; blocked?: string }

/** What can be done to her room now: the next level up and down on each axis, and every extra. */
export function roomOptions(s: SaveState, p: Person): RoomOption[] {
  const r = roomOf(p);
  const out: RoomOption[] = [];
  for (const a of AXIS_IDS) {
    const now = r.levels[a];
    for (const step of [1, -1]) {
      const to = AXES[a].levels.find((l) => l.level === now + step);
      if (!to) continue;
      const need = NEEDS[a];
      const blocked = step > 0 && need && r.levels[need.axis] < need.level ? `needs ${levelDef(need.axis, need.level).name}` : s.arcology.cash < to.cost ? `costs ¤${to.cost.toLocaleString()}` : undefined;
      out.push({ kind: "axis", axis: a, level: to.level, name: to.name, cost: step > 0 ? to.cost : to.cost && to.level < 0 ? to.cost : 0, upkeep: to.upkeep, note: step > 0 ? AXES[a].name : `take ${AXES[a].name.toLowerCase()} down`, blocked });
    }
  }
  for (const [id, x] of Object.entries(EXTRA_BY_ID)) {
    if (r.extras.includes(id)) out.push({ kind: "remove", id, name: x.name, cost: 0, upkeep: 0, note: "take it away" });
    else out.push({ kind: "extra", id, name: x.name, cost: x.cost, upkeep: x.upkeep, note: x.fits(p) >= 1.5 ? `${x.note}, and she would love this` : x.fits(p) < 0 ? `${x.note}, and she would like it more than you'd think` : x.note, blocked: s.arcology.cash < x.cost ? `costs ¤${x.cost.toLocaleString()}` : undefined });
  }
  return out;
}

/** Change one thing about her room. Returns the line for the screen. */
export function changeRoom(s: SaveState, p: Person, o: { axis?: RoomAxis; level?: number; extra?: string; remove?: string }): string {
  const r = roomOf(p);
  const week = s.arcology.week;
  const before = comfort(p);
  let what = "";
  if (o.axis !== undefined && o.level !== undefined) {
    const to = levelDef(o.axis, o.level);
    const up = o.level > r.levels[o.axis];
    if (up && s.arcology.cash < to.cost) return `That costs ¤${to.cost.toLocaleString()}.`;
    if (up || to.level < 0) s.arcology.cash -= to.cost;
    r.levels[o.axis] = o.level;
    // A room of her own taken back takes the window and the tub with it.
    for (const [a, need] of Object.entries(NEEDS) as [RoomAxis, { axis: RoomAxis; level: number }][]) if (need.axis === o.axis && r.levels[o.axis] < need.level) r.levels[a] = Math.min(r.levels[a], 0);
    what = to.name;
  } else if (o.extra) {
    const x = EXTRA_BY_ID[o.extra];
    if (!x || r.extras.includes(x.id)) return "";
    if (s.arcology.cash < x.cost) return `That costs ¤${x.cost.toLocaleString()}.`;
    s.arcology.cash -= x.cost;
    r.extras.push(x.id);
    if (x.fear) p.bond.fear = clamp(p.bond.fear + x.fear, 0, 100);
    if (x.arousal) p.psyche.arousal = clamp(p.psyche.arousal + x.arousal, 0, 100);
    what = x.name;
  } else if (o.remove) {
    r.extras = r.extras.filter((id) => id !== o.remove);
    what = `no more ${EXTRA_BY_ID[o.remove]?.name ?? o.remove}`;
  }
  r.changed = week;
  const gain = comfort(p) - before;
  const mem = s.memory[p.id];
  if (gain > 0.2) {
    applyTreatment(p, { kind: "kindness", size: clamp(Math.round(gain * 2), 1, 8), why: `the owner gave her ${what}` }, week);
    if (mem) remember(mem, { content: `the owner gave me ${what} for my room`, week, importance: clamp(Math.round(3 + gain), 3, 8), charge: "warm" });
  } else if (gain < -0.2) {
    applyTreatment(p, { kind: "cruelty", size: clamp(Math.round(-gain * 2), 1, 8), why: `the owner took her room down to ${what}` }, week);
    if (mem) remember(mem, { content: `the owner made my room worse: ${what}`, week, importance: clamp(Math.round(3 - gain), 3, 8), charge: "cold" });
  }
  chronicle(s, { keys: [p.id], title: "her room", text: gain >= 0 ? `You gave ${p.name} ${what} for her room.` : `You took ${p.name}'s room down: ${what}.` });
  return gain > 0.2 ? `${p.name} has ${what} now.` : gain < -0.2 ? `${p.name} has ${what} now. She noticed.` : `Done: ${what}.`;
}

/** Something personal, in your own words. The narrator reads it; she keeps it. */
export function addTouch(s: SaveState, p: Person, text: string): string {
  const t = text.trim().replace(/\s+/g, " ").slice(0, 120);
  if (!t) return "";
  if (s.arcology.cash < TOUCH_COST) return `That costs ¤${TOUCH_COST}.`;
  s.arcology.cash -= TOUCH_COST;
  const r = roomOf(p);
  r.touches.push({ text: t, week: s.arcology.week });
  if (r.touches.length > 6) r.touches.shift();
  applyTreatment(p, { kind: "recognition", size: 4, why: `the owner put ${t} in her room` }, s.arcology.week);
  const mem = s.memory[p.id];
  if (mem) remember(mem, { content: `the owner put ${t} in my room, just for me`, week: s.arcology.week, importance: 6, charge: "warm" });
  chronicle(s, { keys: [p.id], title: "her room", text: `You put ${t} in ${p.name}'s room.` });
  return `${t}: in her room now.`;
}

/** Weekly, inside her week. Returns the upkeep and a line when it's worth saying. */
export function tickRoom(s: SaveState, p: Person, householdMean: number): { upkeep: number; line?: string } {
  if (!p.room) return { upkeep: 0 };
  const r = roomOf(p);
  const c = comfort(p);
  const gap = c - r.used_to;
  // A loss is felt harder than a gain.
  const felt = 0.06 * c + 0.18 * (gap < 0 ? gap * 1.6 : gap);
  shove(p.psyche, clamp(felt, -1.6, 1.4));
  p.health.energy = clamp(p.health.energy + clamp(c * 1.5, -8, 10), 0, 100);
  p.bond.hope = clamp(p.bond.hope + clamp(c * 0.12, -0.8, 0.9), 0, 100);
  for (const id of r.extras) {
    const x = EXTRA_BY_ID[id];
    if (x?.trust && s.arcology.week % 4 === 0) applyTreatment(p, { kind: x.trust > 0 ? "recognition" : "coercion", size: Math.abs(x.trust) / 2, why: x.name }, s.arcology.week);
    if (x?.arousal) p.psyche.arousal = clamp(p.psyche.arousal + x.arousal / 3, 0, 100);
  }
  // Measured against the others.
  if (c < householdMean - 3) p.bond.resentment = clamp(p.bond.resentment + 0.6, 0, 100);
  r.used_to += (c - r.used_to) * 0.2;
  const upkeep = roomUpkeep(p);
  const line = gap > 1.5 && r.changed === s.arcology.week - 1 ? `${p.name} spent the week getting used to her new room.` : gap < -1.5 && r.changed === s.arcology.week - 1 ? `${p.name} hasn't got over what you took out of her room.` : undefined;
  return { upkeep, line };
}

/** The cheapest thing her room still lacks that would mean the most to her. For her asks. */
export function roomWish(s: SaveState, p: Person): { extra?: string; axis?: RoomAxis; level?: number; name: string; cost: number } | null {
  const r = roomOf(p);
  const extras = Object.values(EXTRA_BY_ID).filter((x) => !r.extras.includes(x.id) && x.comfort > 0 && x.fits(p) >= 1.4)
    .sort((a, b) => b.fits(p) * b.comfort / (b.cost + 500) - a.fits(p) * a.comfort / (a.cost + 500));
  if (extras[0]) return { extra: extras[0].id, name: extras[0].name, cost: extras[0].cost };
  for (const a of ["bed", "climate", "space", "bath", "view"] as RoomAxis[]) {
    const next = AXES[a].levels.find((l) => l.level === r.levels[a] + 1);
    const need = NEEDS[a];
    if (next && next.cost <= 9000 && (!need || r.levels[need.axis] >= need.level)) return { axis: a, level: next.level, name: next.name, cost: next.cost };
  }
  return null;
}
