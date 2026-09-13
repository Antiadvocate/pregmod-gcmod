/**
 * THE CITY — expand, exploit, and eventually take somebody else's.
 *
 * The arcology layer was a household sim with a rent line attached. This is the other half of the
 * game the original was always reaching for: a place that is BUILT rather than merely owned, with
 * the four verbs actually present.
 *
 *   EXPLORE   Trade routes out to regions the docks can reach. Each is worth something specific
 *             and carries a risk that is the honest reason nobody has taken it already.
 *   EXPAND    Claim a vacant plot, then raise it. Rings outward are cheap and shallow; levels
 *             upward are expensive and pay. And at the end of it, annex a neighbour outright.
 *   EXPLOIT   Every district yields something every week — money, housing, security, industry,
 *             schooling, reach, arms. Those feed back into what you can build next.
 *   EXTERMINATE  Arms are the only currency the neighbours read. Enough of them and a hostile
 *             arcology becomes a district of yours.
 *
 * THE RULE THAT KEEPS IT HONEST: nothing here is abstract. Every number a district produces is
 * read somewhere the player already looks — housing is the population ceiling, industry is a
 * discount on the next thing you build, schooling is how fast a woman in classes learns, arms is
 * whether the raid reaches the residential ring. A yield nobody can feel is a yield that should
 * not exist.
 */
import type { ReportLine, SaveState } from "./types";
import { DISTRICT_BY_KIND, DISTRICTS, REGIONS, REGION_BY_ID, RINGS, type DistrictDef, type DistrictKind } from "../data/districts";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { startRumor } from "./social";

export interface District {
  id: string;
  kind: DistrictKind | "vacant";
  /** 0 = the core, 3 = the verge. */
  ring: number;
  /** Position within the ring, for the skyline's left-to-right order. */
  slot: number;
  level: number;
  /** 0–100. Falls with crime and neglect; raises with civic levels and money spent. */
  condition: number;
  /** Whose it is. A citizen-owned plot pays you rent and cannot be upgraded until you buy it. */
  owner: "you" | "citizen" | "vacant";
  /** Week it was last built or raised — the skyline draws scaffolding on anything recent. */
  built?: number;
}

export interface TradeRoute {
  region: string;
  opened: number;
  /** Weeks the route has been interrupted. */
  disrupted: number;
}

export interface CityState {
  districts: District[];
  routes: TradeRoute[];
  /** Cumulative, for the skyline's haze and the "this place has been here a while" feel. */
  founded_week: number;
}

/* ── setting it up ─────────────────────────────────────────────────────────────────────────── */

/** The city you inherit: your spire, a few citizen-held plots paying rent, and a lot of empty
 *  ground. The emptiness is the point — the first thing a new player should see is room. */
export function newCity(week = 1): CityState {
  const districts: District[] = [{ id: "d-core", kind: "spire", ring: 0, slot: 0, level: 1, condition: 78, owner: "you" }];
  const seed = rng("city");
  for (const ring of RINGS) {
    if (ring.id === 0) continue;
    for (let slot = 0; slot < ring.slots; slot++) {
      // The inner ring came with the purchase, half of it already tenanted. Everything further out
      // is ground nobody has bothered with.
      const tenanted = ring.id === 1 && seed.chance(0.5);
      districts.push({
        id: `d-${ring.id}-${slot}`,
        kind: tenanted ? seed.pick(["residential", "commercial", "industrial"] as const) : "vacant",
        ring: ring.id, slot,
        level: tenanted ? 1 : 0,
        condition: tenanted ? Math.round(clamp(seed.normal(52, 14), 20, 90)) : 0,
        owner: tenanted ? "citizen" : "vacant",
      });
    }
  }
  return { districts, routes: [], founded_week: week };
}

export function cityOf(s: SaveState): CityState {
  if (!s.city) s.city = newCity(s.arcology.week);
  return s.city;
}

/* ── what the city is worth this week ──────────────────────────────────────────────────────── */

export interface CityYield {
  cash: number; housing: number; prosperity: number; security: number;
  industry: number; reach: number; schooling: number; arms: number; rep: number;
}

const ZERO: CityYield = { cash: 0, housing: 0, prosperity: 0, security: 0, industry: 0, reach: 0, schooling: 0, arms: 0, rep: 0 };

/**
 * Summed over every district you hold, scaled by ring and by condition.
 *
 * Condition is deliberately a multiplier rather than a subtraction: a works at level four in a
 * district that has been left to rot is worth less than the same works kept up, but it is never
 * worth a negative amount, and the player can see exactly which lever they are neglecting.
 */
export function cityYield(s: SaveState): CityYield {
  const out: CityYield = { ...ZERO };
  const city = cityOf(s);
  for (const d of city.districts) {
    if (d.kind === "vacant" || !d.level) continue;
    const def = DISTRICT_BY_KIND[d.kind];
    if (!def) continue;
    const ring = RINGS[d.ring]?.mult ?? 1;
    const keep = clamp(0.35 + d.condition / 130, 0.35, 1.15);
    // Citizen-held plots pay you a third — the rent, not the business.
    const share = d.owner === "you" ? 1 : 0.33;
    const scale = d.level * ring * keep * share;
    for (const [k, v] of Object.entries(def.yields) as [keyof CityYield, number][]) {
      out[k] += v * scale;
    }
  }
  // Trade routes on top, and a disrupted route pays nothing while it is disrupted.
  for (const r of city.routes) {
    const reg = REGION_BY_ID[r.region];
    if (reg && !r.disrupted) out.cash += reg.cash;
  }
  for (const k of Object.keys(out) as (keyof CityYield)[]) out[k] = Math.round(out[k] * 100) / 100;
  return out;
}

/** How much of a discount your works give on anything you build. Capped, because a city that
 *  builds for free is a city with nothing to decide. */
export function buildDiscount(s: SaveState): number {
  return clamp(cityYield(s).industry / 100, 0, 0.45);
}

/** What it costs to put the next level on this plot, after industry. */
export function costToRaise(s: SaveState, d: District, kind?: DistrictKind): number {
  const def = DISTRICT_BY_KIND[kind ?? (d.kind === "vacant" ? "residential" : d.kind)];
  if (!def) return 0;
  const ring = RINGS[d.ring]?.mult ?? 1;
  const base = d.kind === "vacant" || !d.level ? def.found : def.step * (d.level + 1);
  const buy = d.owner === "citizen" ? Math.round(base * 1.4) : 0;   // buying out the tenant
  return Math.round((base * ring + buy) * (1 - buildDiscount(s)));
}

export function canRaise(s: SaveState, d: District, kind?: DistrictKind): string | null {
  const k = kind ?? (d.kind === "vacant" ? undefined : d.kind);
  if (!k) return "pick what to put here";
  const def = DISTRICT_BY_KIND[k];
  if (!def) return "no such district";
  if (d.kind === "spire" && kind && kind !== "spire") return "that is your own building";
  if (d.level >= def.cap) return `${def.name} does not go past level ${def.cap}`;
  if (d.ring === 0 && k !== "spire") return "the core is the spire's footing";
  const price = costToRaise(s, d, k);
  if (s.arcology.cash < price) return `¤${price.toLocaleString()} and you do not have it`;
  return null;
}

/** Build it, or raise it. One writer for the whole expand verb. */
export function raise(s: SaveState, id: string, kind?: DistrictKind): { ok: boolean; why?: string; line?: string } {
  const city = cityOf(s);
  const d = city.districts.find((x) => x.id === id);
  if (!d) return { ok: false, why: "no such plot" };
  const k = kind ?? (d.kind === "vacant" ? undefined : (d.kind as DistrictKind));
  const blocked = canRaise(s, d, k);
  if (blocked) return { ok: false, why: blocked };

  const def = DISTRICT_BY_KIND[k!];
  const price = costToRaise(s, d, k);
  s.arcology.cash -= price;

  const founding = d.kind === "vacant" || !d.level;
  if (founding) {
    d.kind = k!;
    d.condition = Math.max(d.condition, 70);
  }
  d.owner = "you";
  d.level++;
  d.built = s.arcology.week;
  d.condition = clamp(d.condition + 12, 0, 100);

  if (founding && d.ring >= 2) {
    startRumor(s, `there is building work out on ${RINGS[d.ring].name}`, { salience: 4 });
  }
  return {
    ok: true,
    line: founding
      ? `${def.name} founded out on ${RINGS[d.ring].name} for ¤${price.toLocaleString()}, and there was scaffolding up by Thursday.`
      : `${def.name} raised to level ${d.level}. ¤${price.toLocaleString()}.`,
  };
}

/** Money into a district's upkeep rather than its height. Cheap, immediate, and the thing players
 *  forget until the skyline starts looking like somebody else's problem. */
export function refurbish(s: SaveState, id: string): { ok: boolean; why?: string; line?: string } {
  const d = cityOf(s).districts.find((x) => x.id === id);
  if (!d || !d.level) return { ok: false, why: "there is nothing there" };
  if (d.condition >= 96) return { ok: false, why: "it is in good order" };
  const price = Math.round((100 - d.condition) * 90 * (RINGS[d.ring]?.mult ?? 1));
  if (s.arcology.cash < price) return { ok: false, why: `¤${price.toLocaleString()} and you do not have it` };
  s.arcology.cash -= price;
  d.condition = clamp(d.condition + 34, 0, 100);
  return { ok: true, line: `Work done on ${DISTRICT_BY_KIND[d.kind as DistrictKind]?.name ?? "the block"}. ¤${price.toLocaleString()}.` };
}

/* ── explore ───────────────────────────────────────────────────────────────────────────────── */

export function openRoute(s: SaveState, regionId: string): { ok: boolean; why?: string; line?: string } {
  const city = cityOf(s);
  const reg = REGION_BY_ID[regionId];
  if (!reg) return { ok: false, why: "no such place" };
  if (city.routes.some((r) => r.region === regionId)) return { ok: false, why: "you already trade there" };
  const reach = cityYield(s).reach;
  if (reach < reg.reach) return { ok: false, why: `needs ${reg.reach} dock reach and you have ${Math.floor(reach)}` };
  if (s.arcology.cash < reg.open) return { ok: false, why: `¤${reg.open.toLocaleString()} and you do not have it` };
  s.arcology.cash -= reg.open;
  city.routes.push({ region: regionId, opened: s.arcology.week, disrupted: 0 });
  return { ok: true, line: `A route to ${reg.name} is open. ${reg.note}` };
}

/* ── exterminate ───────────────────────────────────────────────────────────────────────────── */

/** What the neighbours actually read when they decide whether to move on you. Arms from barracks,
 *  plus mercenaries, plus the security you have bought. */
export function militaryStrength(s: SaveState): number {
  const y = cityYield(s);
  return y.arms + (s.arcology.mercenaries.hired ? 30 + s.arcology.mercenaries.strength * 0.4 : 0) + s.arcology.security * 0.25;
}

export function annexCost(s: SaveState, neighbourId: string): number {
  const n = s.arcology.neighbours.find((x) => x.id === neighbourId);
  if (!n) return 0;
  return Math.round(n.prosperity * 900 + (100 - n.ownership) * 700);
}

/**
 * TAKE A NEIGHBOUR.
 *
 * Two roads in, and the game does not moralise about either. Buy it, which needs money and enough
 * ownership that the vote is a formality. Or take it, which needs arms against theirs and costs
 * you standing with everybody who watches. Either way the neighbour becomes districts of yours.
 */
export function annex(s: SaveState, neighbourId: string, how: "buy" | "force"): { ok: boolean; why?: string; line?: string } {
  const n = s.arcology.neighbours.find((x) => x.id === neighbourId);
  if (!n) return { ok: false, why: "no such neighbour" };
  const city = cityOf(s);

  if (how === "buy") {
    if (n.ownership < 55) return { ok: false, why: `you hold ${Math.round(n.ownership)}% of it; a purchase needs 55%` };
    const price = annexCost(s, neighbourId);
    if (s.arcology.cash < price) return { ok: false, why: `¤${price.toLocaleString()} and you do not have it` };
    s.arcology.cash -= price;
  } else {
    const mine = militaryStrength(s);
    const theirs = n.prosperity * 0.5 + 20;
    if (mine < theirs * 1.3) {
      return { ok: false, why: `${n.name} can field about ${Math.round(theirs)} against your ${Math.round(mine)} — you need half again as much` };
    }
    s.arcology.rep = Math.max(0, s.arcology.rep - 2500);
    s.arcology.security = clamp(s.arcology.security - 15, 0, 100);
    for (const other of s.arcology.neighbours) {
      if (other.id !== neighbourId) other.attitude = clamp(other.attitude - 30, -100, 100);
    }
  }

  // The neighbour becomes three districts on the verge, at the level its prosperity earned.
  const level = Math.max(1, Math.round(n.prosperity / 35));
  const kinds: DistrictKind[] = ["residential", "commercial", "industrial"];
  const free = city.districts.filter((d) => d.kind === "vacant").slice(0, 3);
  free.forEach((d, i) => {
    d.kind = kinds[i % kinds.length];
    d.level = level;
    d.owner = "you";
    d.condition = how === "force" ? 40 : 66;
    d.built = s.arcology.week;
  });

  s.arcology.neighbours = s.arcology.neighbours.filter((x) => x.id !== neighbourId);
  s.arcology.population += Math.round(n.prosperity * 22);
  s.canon.push(how === "buy"
    ? `${n.name} was bought outright and folded into ${s.arcology.name}.`
    : `${n.name} was taken by force, and the other arcologies have not forgotten that you did it that way.`);
  startRumor(s, how === "buy" ? `${n.name} belongs to us now` : `he took ${n.name} and did not pretend otherwise`, { salience: 10 });

  return {
    ok: true,
    line: how === "buy"
      ? `${n.name} is yours, and three of its blocks were on your books by Friday without anybody having to be told anything.`
      : `${n.name} is yours. It took a night, it cost you your standing with everyone who watched, and the blocks you took are in a state.`,
  };
}

/* ── the week ──────────────────────────────────────────────────────────────────────────────── */

/**
 * The city's own weekly pass. Runs before the arcology's, because what the city produces is what
 * the arcology then spends.
 */
export function tickCity(s: SaveState): { lines: ReportLine[]; cash: number } {
  const city = cityOf(s);
  const lines: ReportLine[] = [];
  const r = rng(`city:${s.arcology.week}`);
  const y = cityYield(s);
  let cash = 0;

  // WEAR. Crime and neglect take a district down; civic levels hold it up. A block on the verge
  // rots faster than one in the core, which is why the verge looks like the verge.
  const civic = y.security;
  for (const d of city.districts) {
    if (!d.level || d.kind === "vacant") continue;
    const rot = (s.arcology.crime / 45) + (d.ring * 0.22) - (civic / 90) - (d.owner === "you" ? 0 : 0.15);
    d.condition = clamp(d.condition - Math.max(-0.6, rot), 0, 100);
  }

  const failing = city.districts.filter((d) => d.level && d.condition < 25);
  if (failing.length >= 3) {
    lines.push({ tone: "bad", weight: 8, text: `${failing.length} blocks are visibly going. You can see it from the residential ring.` });
  }

  // THE YIELDS, into the places they are actually read.
  cash += y.cash;
  s.arcology.prosperity = clamp(s.arcology.prosperity + y.prosperity * 0.08, 5, 200);
  s.arcology.security = clamp(s.arcology.security + y.security * 0.06, 0, 100);
  s.arcology.rep += y.rep * 0.4;

  // Housing is the population ceiling. A city with nowhere to live stops growing, and a city with
  // empty blocks fills them — which is the loop that makes a housing level feel like something.
  const ceiling = 400 + y.housing;
  if (s.arcology.population > ceiling) {
    s.arcology.population = Math.round(s.arcology.population - (s.arcology.population - ceiling) * 0.12);
    lines.push({ tone: "warning", weight: 7, text: `There is nowhere for people to live. ${Math.round(s.arcology.population).toLocaleString()} against room for ${Math.round(ceiling).toLocaleString()}, and they are leaving.` });
  }

  // TRADE. Routes pay, and occasionally do not.
  for (const route of city.routes) {
    const reg = REGION_BY_ID[route.region];
    if (!reg) continue;
    if (route.disrupted > 0) {
      route.disrupted--;
      if (!route.disrupted) lines.push({ tone: "good", weight: 5, text: `${reg.name} is moving again.` });
      continue;
    }
    if (r.chance(reg.risk)) {
      route.disrupted = 1 + Math.floor(r() * 3);
      lines.push({ tone: "bad", weight: 7, text: `Nothing is coming out of ${reg.name}. Nobody will say why, and it will be ${route.disrupted} week${route.disrupted === 1 ? "" : "s"} before it is.` });
    }
  }

  if (cash) {
    lines.push({ tone: "good", weight: 6, text: `The city: ¤${Math.round(cash).toLocaleString()} from ${city.districts.filter((d) => d.level && d.owner === "you").length} blocks and ${city.routes.filter((x) => !x.disrupted).length} routes.` });
  }
  return { lines, cash: Math.round(cash) };
}

/* ── reading it ────────────────────────────────────────────────────────────────────────────── */

/** Districts in skyline order: the spire in the middle, everything else fanned out by ring. */
export function skylineOrder(city: CityState): District[] {
  const out = [...city.districts];
  out.sort((a, b) => (b.ring - a.ring) || (a.slot - b.slot));
  return out;
}

export function districtDef(d: District): DistrictDef | undefined {
  return d.kind === "vacant" ? undefined : DISTRICT_BY_KIND[d.kind];
}

/** What the player should be told the city needs, in one line each, ordered by how much it costs
 *  them to keep ignoring it. */
export function cityProblems(s: SaveState): string[] {
  const y = cityYield(s);
  const city = cityOf(s);
  const out: string[] = [];
  const ceiling = 400 + y.housing;
  if (s.arcology.population > ceiling * 0.92) out.push(`Housing is nearly full — ${Math.round(s.arcology.population).toLocaleString()} of ${Math.round(ceiling).toLocaleString()}. Build residential or the city stops growing.`);
  if (y.security < 6 && s.arcology.crime > 40) out.push("Crime is eating the outer blocks and there is no civic presence to speak of.");
  if (!y.reach) out.push("No docks, so no trade routes, so the whole world outside the city is closed to you.");
  if (y.arms < 15 && s.arcology.neighbours.some((n) => n.attitude < -40)) out.push("Somebody out there dislikes you and you have nothing they respect.");
  const rotting = city.districts.filter((d) => d.level && d.condition < 35).length;
  if (rotting) out.push(`${rotting} block${rotting === 1 ? " is" : "s are"} falling apart. Refurbishment is cheap next to rebuilding.`);
  return out;
}
