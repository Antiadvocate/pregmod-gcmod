/**
 * SAVE STATE — creation, repair, and the guarantees the rest of the engine relies on.
 *
 * `sanitize` is the load path for every save, including ones written by this build five minutes
 * ago. It exists because a save is a document that outlives the code that wrote it: a field added
 * this week is missing from every save made last week, and the alternative to filling it in here
 * is a crash somewhere far away with no clue in it. Everything it fills is a default that a
 * running game would have produced anyway.
 */
import type { Arcology, Facility, Person, SaveState, Sector, StandingOrder } from "./types";
import { SCHEMA_VERSION, DEFAULT_MODELS } from "./types";
import { FACILITIES } from "../data/facilities";
import { generatePerson } from "./generate";
import { newMemory } from "./memory";
import { refresh } from "./obedience";
import { newPsyche } from "./psyche";
import { defaultOrders } from "./rules";
import { rollMarkets } from "./market";
import { rng } from "./rng";

export interface NewGameOptions {
  arcology_name?: string;
  player_name?: string;
  player_career?: string;
  starting_slaves?: number;
  starting_cash?: number;
  difficulty?: "generous" | "standard" | "hard";
  seed?: string;
}

const ARC_NAMES = ["Aurelia", "Vireo", "Marrow", "Halcyon", "Sable Rock", "Ninth Terrace", "Corvid", "The Spindle", "Tessellate", "Antioch"];

export function newGame(opts: NewGameOptions = {}): SaveState {
  const seed = opts.seed ?? String(Math.floor(Math.random() * 1e9));
  const r = rng(`newgame:${seed}`);
  const difficulty = opts.difficulty ?? "standard";
  const cash = opts.starting_cash ?? (difficulty === "generous" ? 120000 : difficulty === "hard" ? 30000 : 65000);

  const sectors: Sector[] = [];
  for (let i = 0; i < 24; i++) {
    sectors.push({
      id: `s${i}`,
      kind: i < 12 ? "residential" : i < 18 ? "commercial" : i < 22 ? "industrial" : "civic",
      owner: i < 4 ? "you" : r.chance(0.5) ? "citizen" : "vacant",
      condition: Math.round(r.normal(60, 15)),
    });
  }

  // Facilities all exist as records at level 0 — "not built" is a state a building can be in, and
  // making it one saves every consumer from asking whether the key is there.
  const facilities: Record<string, Facility> = {};
  for (const def of FACILITIES) {
    facilities[def.id] = {
      id: def.id, kind: def.id, name: def.name, level: 0, upgrades: {},
      capacity: 0, workers: [], decoration: 0, settings: {},
    };
  }
  // You start with somewhere to put people and somewhere to sleep.
  facilities["servants"].level = 1;
  facilities["servants"].capacity = 8;
  facilities["master_suite"].level = 1;
  facilities["master_suite"].capacity = 4;

  const arcology: Arcology = {
    name: opts.arcology_name ?? r.pick(ARC_NAMES),
    region: r.pick(["the Gulf", "the South China Sea", "the Baltic approaches", "the Sahel coast", "the Australian bight"]),
    week: 1,
    cash,
    rep: 200,
    prosperity: 55,
    security: 45,
    crime: 25,
    population: 1200,
    ownership: 18,
    sectors,
    facilities,
    doctrines: {},
    policies: {},
    neighbours: [
      { id: "n-e", name: "Kestrel", direction: "east", prosperity: 62, ownership: 0, attitude: 5, doctrines: [] },
      { id: "n-n", name: "Ardent", direction: "north", prosperity: 48, ownership: 0, attitude: -12, doctrines: [] },
      { id: "n-w", name: "Cinder", direction: "west", prosperity: 80, ownership: 0, attitude: -35, doctrines: [] },
    ],
    loans: [],
    projects: [],
    mercenaries: { hired: false, strength: 0, loyalty: 0, upkeep: 0 },
    food: { stores: 900, production: 0, consumption: 0 },
    public_standing: 0,
  };

  const people: Record<string, Person> = {};
  const memory: Record<string, ReturnType<typeof newMemory>> = {};
  const count = opts.starting_slaves ?? 3;
  for (let i = 0; i < count; i++) {
    const p = generatePerson({ seed: `${seed}:start:${i}`, week: 1, central: true });
    p.economics.price_paid = 0;
    p.origin.acquired_how = "came with the arcology";
    people[p.id] = p;
    memory[p.id] = newMemory();
    refresh(p, memory[p.id]);
  }

  const state: SaveState = {
    id: `warp-${Date.now().toString(36)}`,
    name: `${arcology.name}, week 1`,
    schema: SCHEMA_VERSION,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    models: { ...DEFAULT_MODELS },
    arcology,
    people,
    memory,
    edges: [],
    rumors: [],
    player: {
      name: opts.player_name ?? "you",
      pronouns: "they/them",
      age: 34,
      title: "owner",
      body: { appearance_facts: "unremarkable, and dressed like somebody who does not need to be remarkable" },
      career: opts.player_career ?? "trader",
      skills: { trading: 35, hacking: 15, slaving: 25, engineering: 15, medicine: 10 },
      household_read: { feared: 0, trusted: 0, label: "unknown quantity" },
    },
    scene: {
      location: "the penthouse",
      time: "Week 1, Monday 09:00",
      present: Object.keys(people).slice(0, 2),
      present_prev: [],
      weather: "hot, and the filters are struggling",
      arrivals_pending: [],
      departures_pending: [],
    },
    turn: 0,
    history: [],
    reports: [],
    orders: defaultOrders(),
    events: [],
    notifications: [],
    market: { week: 1, offers: {}, orders: [] },
    retcons: [],
    canon: [
      `${arcology.name} is a free-city arcology in ${arcology.region}. Slavery is legal here and nowhere is far enough away for that to matter.`,
      "You own it, or enough of it that the difference is administrative.",
    ],
    integrity: { fires: [] },
    snapshots: [],
    telemetry: [],
    corrections: {},
  };

  state.market = rollMarkets(state);
  return state;
}

/** Load-path repair. Idempotent, cheap, and the only place defaults are invented. */
export function sanitize(raw: SaveState): SaveState {
  const s = raw;
  s.schema = s.schema ?? SCHEMA_VERSION;
  s.models = { ...DEFAULT_MODELS, ...(s.models ?? {}) };
  s.people = s.people ?? {};
  s.memory = s.memory ?? {};
  s.edges = s.edges ?? [];
  s.rumors = s.rumors ?? [];
  s.history = s.history ?? [];
  s.reports = s.reports ?? [];
  s.orders = (s.orders ?? []) as StandingOrder[];
  s.events = s.events ?? [];
  s.notifications = s.notifications ?? [];
  s.retcons = s.retcons ?? [];
  s.canon = s.canon ?? [];
  s.integrity = s.integrity ?? { fires: [] };
  s.snapshots = s.snapshots ?? [];
  s.telemetry = s.telemetry ?? [];
  s.corrections = s.corrections ?? {};
  s.market = s.market ?? { week: s.arcology?.week ?? 1, offers: {}, orders: [] };

  if (s.arcology) {
    s.arcology.projects = s.arcology.projects ?? [];
    s.arcology.loans = s.arcology.loans ?? [];
    s.arcology.doctrines = s.arcology.doctrines ?? {};
    s.arcology.policies = s.arcology.policies ?? {};
    s.arcology.food = s.arcology.food ?? { stores: 500, production: 0, consumption: 0 };
    s.arcology.mercenaries = s.arcology.mercenaries ?? { hired: false, strength: 0, loyalty: 0, upkeep: 0 };
    for (const def of FACILITIES) {
      if (!s.arcology.facilities[def.id]) {
        s.arcology.facilities[def.id] = { id: def.id, kind: def.id, name: def.name, level: 0, upgrades: {}, capacity: 0, workers: [], decoration: 0, settings: {} };
      }
    }
  }

  for (const p of Object.values(s.people)) {
    p.psyche = p.psyche ?? newPsyche(0);
    p.psyche.active_states = p.psyche.active_states ?? [];
    p.psyche.state_ages = p.psyche.state_ages ?? {};
    p.counters = p.counters ?? {};
    p.rules_applied = p.rules_applied ?? [];
    p.body.marks = p.body.marks ?? [];
    p.health.injuries = p.health.injuries ?? [];
    p.health.drugs = p.health.drugs ?? [];
    p.womb.fetuses = p.womb.fetuses ?? [];
    p.womb.sired_by = p.womb.sired_by ?? {};
    p.skills.management = p.skills.management ?? {};
    p.persona.fetishes = p.persona.fetishes ?? [];
    p.persona.texture = p.persona.texture ?? [];
    if (!s.memory[p.id]) s.memory[p.id] = newMemory();
    // Facility membership: the facility is authoritative, so a person pointing at a facility that
    // does not hold them is corrected rather than trusted.
    if (p.facility && !s.arcology?.facilities[p.facility]?.workers.includes(p.id)) {
      const f = s.arcology?.facilities[p.facility];
      if (f && f.level > 0 && f.workers.length < f.capacity) f.workers.push(p.id);
      else p.facility = undefined;
    }
    refresh(p, s.memory[p.id]);
  }
  return s;
}

/** ROLLBACK RING. One week or one scene turn back, cheaply, without an export. */
export function snapshot(s: SaveState): void {
  const blob = JSON.stringify({ ...s, snapshots: [] });
  s.snapshots.push({ turn: s.turn, week: s.arcology.week, blob });
  while (s.snapshots.length > 8) s.snapshots.shift();
}

export function rollback(s: SaveState): SaveState | null {
  const snap = s.snapshots.pop();
  if (!snap) return null;
  const restored = sanitize(JSON.parse(snap.blob) as SaveState);
  restored.snapshots = s.snapshots;
  return restored;
}
