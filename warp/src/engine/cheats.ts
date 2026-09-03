/**
 * CHEATS.
 *
 * Every operation the game normally makes you earn, available directly. This is a single-player
 * game about running your own arcology; there is nobody to be fair to.
 *
 * It also does a job the honest systems cannot: a save made before a feature existed has none of
 * that feature's data, so `backfill` re-rolls what nobody ever rolled — which is why an older save
 * looks like it has no fetishes, no quirks and no flaws. That is not the generator being shy, it is
 * a save from before the generator knew about them.
 */
import type { Person, SaveState } from "./types";
import { generatePerson } from "./generate";
import { newMemory } from "./memory";
import { refresh } from "./obedience";
import { clamp } from "./psyche";
import { FACILITIES } from "../data/facilities";
import { DOCTRINES } from "../data/doctrines";
import { POLICIES } from "../data/policies";
import { QUIRKS, FLAWS } from "../data/intimacy";
import { romanceOf, LADDER, type Standing } from "./romance";
import { rng } from "./rng";

/* ── money and the clock ─────────────────────────────────────────────────────────────────── */

export function setCash(s: SaveState, n: number): void { s.arcology.cash = Math.round(n); }
export function addCash(s: SaveState, n: number): void { s.arcology.cash += Math.round(n); }
export function setRep(s: SaveState, n: number): void { s.arcology.rep = Math.max(0, Math.round(n)); }

/* ── the building ────────────────────────────────────────────────────────────────────────── */

export function buildAll(s: SaveState, level = 3): void {
  for (const def of FACILITIES) {
    const f = s.arcology.facilities[def.id];
    if (!f) continue;
    f.level = Math.max(f.level, level);
    f.capacity = Math.max(f.capacity, def.capacity_per_level * level);
    for (const u of def.upgrades) f.upgrades[u.id] = 1;
  }
}

export function setFacility(s: SaveState, id: string, level: number): void {
  const def = FACILITIES.find((f) => f.id === id);
  const f = s.arcology.facilities[id];
  if (!def || !f) return;
  f.level = Math.max(0, Math.round(level));
  f.capacity = def.capacity_per_level * f.level;
  if (f.level === 0) {
    for (const wid of f.workers) { const w = s.people[wid]; if (w) w.facility = undefined; }
    f.workers = [];
    delete f.manager;
  }
}

export function ownAllSectors(s: SaveState): void {
  for (const sec of s.arcology.sectors) { sec.owner = "you"; sec.condition = 100; }
  s.arcology.ownership = 100;
}

/* ── culture and law ─────────────────────────────────────────────────────────────────────── */

/** Adopt a doctrine outright, ignoring the four-at-once cap and every conflict. */
export function forceDoctrine(s: SaveState, id: string, adoption = 100): void {
  s.arcology.doctrines[id] = {
    adoption: clamp(adoption, 0, 100),
    decoration: 5,
    research: true,
    policies: {},
    adopted_week: s.arcology.week,
  };
}

export function enactAllPolicies(s: SaveState): void {
  for (const p of POLICIES) s.arcology.policies[p.id] = 1;
}

/* ── people ──────────────────────────────────────────────────────────────────────────────── */

export interface SpawnSpec {
  count?: number;
  nation?: string;
  age?: number;
  quality?: number;
  fetish?: string;
  devoted?: boolean;
}

export function spawn(s: SaveState, spec: SpawnSpec = {}): Person[] {
  const out: Person[] = [];
  const n = Math.max(1, Math.min(50, spec.count ?? 1));
  for (let i = 0; i < n; i++) {
    const p = generatePerson({
      seed: `cheat:${s.arcology.week}:${Date.now()}:${i}`,
      nation: spec.nation,
      age: spec.age,
      quality: spec.quality ?? 0.5,
      week: s.arcology.week,
      central: true,
    });
    if (spec.fetish) p.persona.fetishes = [{ name: spec.fetish, strength: 90, known: true }];
    if (spec.devoted) {
      p.bond = { ...p.bond, bond: 85, fear: 0, resentment: 0, hope: 85, weeks_since_kindness: 0, weeks_since_cruelty: 99 };
      p.psyche.relaxation = 5;
    }
    p.origin.acquired_how = "conjured";
    s.people[p.id] = p;
    s.memory[p.id] = newMemory();
    refresh(p, s.memory[p.id]);
    out.push(p);
  }
  return out;
}

/** Everything about one person that is worth being able to set by hand. */
export function setBond(s: SaveState, p: Person, patch: Partial<Person["bond"]>): void {
  Object.assign(p.bond, patch);
  p.bond.bond = clamp(p.bond.bond, -100, 100);
  p.bond.fear = clamp(p.bond.fear, 0, 100);
  p.bond.resentment = clamp(p.bond.resentment, 0, 100);
  p.bond.hope = clamp(p.bond.hope, 0, 100);
  refresh(p, s.memory[p.id]);
}

export function perfect(s: SaveState, p: Person): void {
  p.health.health = 100;
  p.health.energy = 100;
  p.health.attrition = 0;
  p.health.illness = 0;
  p.health.injuries = [];
  p.health.recovery_weeks = 0;
  p.health.addiction = 0;
  p.psyche.relaxation = 6;
  p.psyche.capacity = Math.max(p.psyche.capacity, 3);
  p.psyche.capacity_born = Math.max(p.psyche.capacity_born, 3);
  p.psyche.state = "intact";
  delete p.psyche.break_mode;
  p.psyche.active_states = [];
  setBond(s, p, { bond: 100, fear: 0, resentment: 0, hope: 100, weeks_since_kindness: 0, weeks_since_cruelty: 999 });
  for (const k of ["oral", "vaginal", "anal", "penetrative", "whoring", "entertainment", "combat"] as const) p.skills[k] = 100;
  p.persona.education = 100;
}

export function maxSkills(p: Person): void {
  for (const k of ["oral", "vaginal", "anal", "penetrative", "whoring", "entertainment", "combat"] as const) p.skills[k] = 100;
  for (const key of Object.keys(p.skills.management)) p.skills.management[key] = 100;
  p.skills.management.headgirl = 100;
}

/** Put her anywhere on the ladder at once, dominion included. */
export function setStanding(s: SaveState, p: Person, standing: Standing, dominion?: number): void {
  const rom = romanceOf(p);
  rom.standing = standing;
  rom.since_week = Math.max(0, s.arcology.week - 20);
  if (dominion !== undefined) rom.dominion = clamp(dominion, -100, 100);
  if (LADDER.indexOf(standing) >= 5 && p.status === "owned") p.status = "indentured";
  if (standing === "keeper") s.player.owned_by = p.id;
  else if (s.player.owned_by === p.id) delete s.player.owned_by;
}

/* ── repairing an old save ───────────────────────────────────────────────────────────────── */

/**
 * BACKFILL. A save written before a feature existed has none of that feature's data, and the
 * symptom is a household that appears to have no inner life at all: no fetishes, no quirks, no
 * flaws, no romance record. This re-rolls only what is genuinely absent and never overwrites
 * anything the save already had.
 */
export function backfill(s: SaveState): { people: number; fetishes: number; quirks: number; flaws: number } {
  let people = 0, fetishes = 0, quirks = 0, flaws = 0;
  const FETISH_POOL = ["submissive", "cumslut", "buttslut", "boobs", "humiliation", "masochist", "pregnancy", "dom", "sadist"];
  for (const p of Object.values(s.people)) {
    const r = rng(`backfill:${p.id}`);
    let touched = false;
    if (!p.persona.fetishes?.length) {
      p.persona.fetishes = r.chance(0.68)
        ? [{ name: r.pick(FETISH_POOL), strength: Math.round(clamp(r.normal(60, 22), 15, 100)), known: false }]
        : [{ name: "none", strength: 0, known: false }];
      fetishes++; touched = true;
    }
    if (!p.persona.quirk && r.chance(0.45)) { p.persona.quirk = { id: r.pick(QUIRKS).id, known: false }; quirks++; touched = true; }
    if (!p.persona.flaw && r.chance(0.4)) { p.persona.flaw = { id: r.pick(FLAWS).id, known: false, worn: 0 }; flaws++; touched = true; }
    if (!p.persona.preferred_hole) { p.persona.preferred_hole = { hole: r.pick(["mouth", "vagina", "anus", "boobs"]), known: false }; touched = true; }
    if (!p.acts) p.acts = {};
    if (!p.firsts) p.firsts = {};
    if (!p.romance) romanceOf(p);
    if (touched) people++;
  }
  return { people, fetishes, quirks, flaws };
}

/** Make every fetish, quirk and flaw in the household visible without having to find it out. */
export function revealAll(s: SaveState): number {
  let n = 0;
  for (const p of Object.values(s.people)) {
    for (const f of p.persona.fetishes ?? []) if (!f.known) { f.known = true; n++; }
    if (p.persona.quirk && !p.persona.quirk.known) { p.persona.quirk.known = true; n++; }
    if (p.persona.flaw && !p.persona.flaw.known) { p.persona.flaw.known = true; n++; }
    if (p.persona.preferred_hole) p.persona.preferred_hole.known = true;
  }
  return n;
}

export const ALL_DOCTRINE_IDS = DOCTRINES.map((d) => d.id);
