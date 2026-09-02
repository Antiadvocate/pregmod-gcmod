/**
 * GESTATION AND LINEAGE.
 *
 * Two things the old game got right and this keeps: a real cycle (ovulation is a fact, not a coin
 * flip on the week) and a real gene pool (a child is a function of two people). Two things it did
 * not have: the pregnancy reaching the nervous system rather than only the belly, and a lineage
 * that anybody can read.
 */
import type { Fetus, GeneRecord, Person, SaveState } from "./types";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { remember } from "./memory";
import { generatePerson } from "./generate";

export const TERM_WEEKS = 40;

export function genesOf(p: Person): GeneRecord {
  return {
    height_cm: p.body.height_cm,
    face: p.body.face,
    boobs: p.body.boobs - p.body.boob_implant,
    butt: p.body.butt - p.body.butt_implant,
    hips: p.body.hips,
    waist: p.body.waist,
    skin: p.body.skin,
    hair_color: p.body.hair_color,
    eye_color: p.body.eye_color,
    intelligence: { impaired: -3, slow: -1.5, average: 0, sharp: 1.5, brilliant: 3 }[p.persona.intelligence],
    fertility: p.womb.fertility,
    conditions: [],
  };
}

/** Mix two parents. Each trait is one parent's value plus a small deviation — children resemble
 *  their parents in the ways the fiction notices, and the deviation is what stops a bloodline
 *  becoming a photocopier. */
export function mixGenes(a: GeneRecord, b: GeneRecord, seed: string): GeneRecord {
  const r = rng(seed);
  const take = <K extends keyof GeneRecord>(k: K): GeneRecord[K] => (r.chance(0.5) ? a[k] : b[k]);
  const blend = (x: number, y: number, sd: number) => +((x + y) / 2 + r.normal(0, sd)).toFixed(1);
  return {
    height_cm: Math.round(blend(a.height_cm, b.height_cm, 4)),
    face: Math.round(clamp(blend(a.face, b.face, 8), 5, 99)),
    boobs: Math.round(clamp(blend(a.boobs, b.boobs, 150), 0, 2000)),
    butt: Math.round(clamp(blend(a.butt, b.butt, 1), 0, 10)),
    hips: take("hips"),
    waist: Math.round(clamp(blend(a.waist, b.waist, 12), -100, 100)),
    skin: take("skin"),
    hair_color: take("hair_color"),
    eye_color: take("eye_color"),
    intelligence: +clamp(blend(a.intelligence, b.intelligence, 0.8), -3, 3).toFixed(2),
    fertility: Math.round(clamp(blend(a.fertility, b.fertility, 10), 0, 100)),
    conditions: [...new Set([...a.conditions, ...b.conditions])].filter(() => r.chance(0.5)),
  };
}

/** Can this week produce a pregnancy, and does it. `intensity` is roughly how many exposures. */
export function tryConception(state: SaveState, mother: Person, fatherId: string | null, intensity: number): Fetus | null {
  const w = mother.womb;
  if (w.sterile || w.contraceptives || w.fetuses.length) return null;
  if (mother.chastity.vagina) return null;
  const fertileWindow = w.cycle_day >= 11 && w.cycle_day <= 17;
  const base = (w.fertility / 100) * (fertileWindow ? 0.35 : 0.04) * clamp(intensity, 0, 6);
  const health = clamp(1 + mother.health.health / 200, 0.5, 1.4);
  if (Math.random() > base * health) return null;

  const father = fatherId ? state.people[fatherId] : null;
  const seed = `${mother.id}:${fatherId}:${state.arcology.week}`;
  const genes = father ? mixGenes(genesOf(mother), genesOf(father), seed) : { ...genesOf(mother), conditions: [] };
  const r = rng(seed);
  const fetus: Fetus = {
    id: `f${state.arcology.week}-${mother.id}-${w.births}`,
    week: 0,
    father_id: fatherId,
    mother_id: mother.id,
    genes,
    sex: r.chance(0.51) ? "XX" : "XY",
    viable: true,
  };
  w.fetuses.push(fetus);
  if (fatherId) w.sired_by[fatherId] = (w.sired_by[fatherId] ?? 0) + 1;
  return fetus;
}

export interface PregnancyWeek { notes: string[]; born: Person[] }

export function tickPregnancy(state: SaveState, p: Person): PregnancyWeek {
  const w = p.womb;
  const out: PregnancyWeek = { notes: [], born: [] };
  w.cycle_day = (w.cycle_day + 7) % 28;

  if (!w.fetuses.length) return out;

  for (const f of w.fetuses) f.week++;
  w.weeks = Math.max(...w.fetuses.map((f) => f.week));

  // The belly, and what carrying it costs.
  const litres = w.fetuses.reduce((n, f) => n + Math.pow(f.week / 40, 2.2) * 4000, 0);
  p.body.belly = Math.round(litres);
  if (w.weeks > 20) {
    p.health.energy = clamp(p.health.energy - 8, 0, 100);
    p.health.health = clamp(p.health.health - 1, -100, 100);
  }

  // And what it does to a nervous system, which the old game did not model at all. A wanted
  // pregnancy settles a body; an unwanted one in a body with no say in it does the opposite.
  const wanted = p.persona.fetishes.some((f) => f.name === "pregnancy") || p.bond.read.devotion > 50;
  p.psyche.relaxation = clamp(p.psyche.relaxation + (wanted ? 0.25 : -0.35), -10, 10);

  if (w.weeks === 12) out.notes.push("far enough along that it is obvious");
  if (w.weeks === 30) out.notes.push("heavily pregnant and slowing down");

  if (w.weeks >= TERM_WEEKS) {
    const risk = clamp(0.06 + (p.health.health < 0 ? 0.15 : 0) + (w.fetuses.length - 1) * 0.06 - (state.arcology.facilities["clinic"]?.level ? 0.06 : 0), 0.01, 0.5);
    for (const f of w.fetuses) {
      if (Math.random() < risk) { w.miscarriages++; out.notes.push("the birth went badly"); continue; }
      w.births++;
      const child = birth(state, p, f);
      out.born.push(child);
    }
    w.fetuses = [];
    w.weeks = 0;
    p.body.belly = 0;
    p.body.belly_sag = clamp(p.body.belly_sag + 1, 0, 10);
    p.body.lactation = 2;
    p.health.health = clamp(p.health.health - 12, -100, 100);
    p.health.recovery_weeks = Math.max(p.health.recovery_weeks, 2);
    const mem = state.memory[p.id];
    if (mem) remember(mem, {
      content: `gave birth in the arcology, week ${state.arcology.week}`,
      week: state.arcology.week, importance: 9,
      charge: out.born.length ? "bright" : "sharp", core: true,
    });
  }
  return out;
}

/** A child, as a person record. They exist from day one; the nursery decides who they become. */
function birth(state: SaveState, mother: Person, f: Fetus): Person {
  const child = generatePerson({ seed: `${f.id}:child`, age: 0, week: state.arcology.week, sex: f.sex === "XX" ? "female" : "male" });
  child.name = childName(state, mother, f);
  child.surname = mother.surname;
  child.age = 0;
  child.physical_age = 0;
  child.birth_week = state.arcology.week;
  child.origin = {
    nationality: mother.origin.nationality, race: mother.origin.race, career: "born here",
    background: `born in the arcology to ${mother.name}`, acquired_week: state.arcology.week, acquired_how: "born to it",
  };
  // Inherit the genes we actually mixed, over the generator's roll.
  child.body.height_cm = Math.round(f.genes.height_cm * 0.28);
  child.body.face = f.genes.face;
  child.body.skin = f.genes.skin;
  child.body.hair_color = f.genes.hair_color;
  child.body.eye_color = f.genes.eye_color;
  child.womb.fertility = f.genes.fertility;
  child.status = "owned";
  child.assignment = "rest";
  child.central = false;
  state.people[child.id] = child;
  state.memory[child.id] = { episodic: [], beliefs: [], facts: [], gist: [] };
  state.edges.push({ from: child.id, to: mother.id, warmth: 40, trust: 40, attraction: 0, power: -20, roles: ["mother"], weeks_known: 0 });
  state.edges.push({ from: mother.id, to: child.id, warmth: 50, trust: 30, attraction: 0, power: 20, roles: ["daughter"], weeks_known: 0 });
  if (f.father_id && state.people[f.father_id]) {
    state.edges.push({ from: child.id, to: f.father_id, warmth: 20, trust: 20, attraction: 0, power: -20, roles: ["father"], weeks_known: 0 });
  }
  return child;
}

function childName(state: SaveState, mother: Person, f: Fetus): string {
  const r = rng(`${f.id}:name`);
  const taken = new Set(Object.values(state.people).map((p) => p.name));
  const pool = ["Ada", "Wren", "Iris", "Nell", "Juno", "Vera", "Tess", "Rae", "Sable", "Lark", "Odile", "Mira", "Bee", "Halle", "Rosa"];
  const free = pool.filter((n) => !taken.has(n));
  return (free.length ? r.pick(free) : r.pick(pool)) + "";
}

/** TIME PASSES FOR EVERYONE.
 *
 *  Only children aged, which is the bug you do not notice for a hundred weeks and then cannot
 *  unsee: a two-hundred-week campaign in which a woman bought at nineteen is still nineteen, while
 *  the doctrine that prefers youth goes on approving of her forever. Adults age on the same
 *  fifty-two week clock, and it costs them fertility and a little of the face.
 */
export function tickAge(state: SaveState, p: Person): string[] {
  if ((state.arcology.week - p.birth_week) % 52 !== 0 || state.arcology.week === p.birth_week) return [];
  if (p.age >= 18) {
    p.age++;
    // Physical age is what treatment and hard living have actually done, and it is what the
    // doctrines and the market read. It usually tracks; it does not have to.
    p.physical_age = Math.max(18, p.physical_age + 1);
    p.womb.fertility = clamp(p.womb.fertility - (p.physical_age > 30 ? 3 : 1), 0, 100);
    if (p.physical_age > 28) p.body.face = clamp(p.body.face - 0.6, 5, 99);
    if (p.age % 10 === 0) return [`${p.name} is ${p.age}.`];
    return [];
  }
  return [];
}

/** Children grow. A nursery raises them into somebody; no nursery and they grow up anyway, worse. */
export function tickChild(state: SaveState, p: Person): string[] {
  if (p.age >= 18) return [];
  const notes: string[] = [];
  const nursery = state.arcology.facilities["nursery"];
  const raised = nursery?.level && nursery.workers.includes(p.id);
  // A year per 52 weeks, and the nursery's early schooling is the difference between arriving at
  // eighteen as a person and arriving as stock.
  if ((state.arcology.week - p.birth_week) % 52 === 0) {
    p.age++;
    p.physical_age++;
    p.body.height_cm = Math.round(clamp(p.body.height_cm + 6.5, 40, 190));
    if (raised) {
      p.persona.education = clamp(p.persona.education + 6, 0, 100);
      p.psyche.capacity_born = +clamp(p.psyche.capacity_born + 0.1, -6, 6).toFixed(2);
      p.psyche.capacity = clamp(p.psyche.capacity + 0.1, -6, 6);
    } else {
      p.persona.education = clamp(p.persona.education - 2, 0, 100);
      p.psyche.capacity_born = +clamp(p.psyche.capacity_born - 0.08, -6, 6).toFixed(2);
    }
    if (p.age === 18) notes.push(`${p.name} is eighteen. ${raised ? "Raised in your nursery, and it shows." : "Raised in the corridors, and that shows too."}`);
  }
  return notes;
}
