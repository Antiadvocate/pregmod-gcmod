/**
 * THE GLOBE — where everything is, how far your reach goes, and what you can do out there.
 *
 * Everything the world screen shows is placed on real coordinates. Your arcology sits in the sea it
 * was founded in (arcology.region). The neighbours sit a few hundred kilometres off in the direction
 * the game already gives them. The six trade regions sit where their names say, and each has the
 * stability and state engine/world.ts already rolls for it; the ones at war, in collapse, in unrest
 * or under plague are the conflicts you can get involved in. A handful of distant Free Cities fill
 * out the map. Areas are circles on the sphere, sized from what the save knows: your districts and
 * routes, a neighbour's prosperity, a free city's size.
 *
 * Three things to do from here:
 *   involve   fund a peace, sell arms, send your mercenaries, take in refugees, or buy captives,
 *             in a region at war or falling apart. One move per region every four weeks.
 *   research  technology that pays and that fixes the world: clean energy, carbon capture,
 *             desalination, vaccines. Paid up front, finished after some weeks, run every week.
 *   visit     go somewhere you don't own. Something happens there. A narrator model writes it when
 *             one is set, choosing its consequences from a closed table; without one, the game does.
 */
import type { SaveState } from "./types";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { worldOf } from "./world";
import { REGIONS, REGION_BY_ID } from "../data/districts";
import { REGION_STATE_WORD, type RegionState } from "../data/world";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { DOCTRINE_PULL } from "./culture";
import { cityOf, militaryStrength } from "./city";
import { generatePerson } from "./generate";
import { newMemory } from "./memory";
import { refresh } from "./obedience";
import { startRumor } from "./social";
import { call, parseJson } from "../llm";

/* ── where things are ────────────────────────────────────────────────────────────────────────── */

/** [lat, lon] of each sea a Free City can be founded in, keyed by the words in arcology.region. */
const SEAS: [RegExp, [number, number]][] = [
  [/gulf/i, [26.2, 52.3]],
  [/south china/i, [12.5, 114.5]],
  [/baltic/i, [56.2, 11.8]],
  [/sahel/i, [14.8, -17.9]],
  [/australian|bight/i, [-34.5, 132.5]],
];
export function homeOf(s: SaveState): [number, number] {
  return SEAS.find(([re]) => re.test(s.arcology.region))?.[1] ?? [26.2, 52.3];
}

/** Where the trade regions are. The game's names are loose; these are the places they read as. */
export const REGION_AT: Record<string, [number, number]> = {
  cape: [-33.9, 18.4], delta: [5.0, 6.2], steppe: [47.5, 67.0], archipelago: [-2.5, 118.0], interior: [2.0, 22.0], north: [52.4, 4.9],
};

const BEARING: Record<string, number> = { north: 0, "north-east": 45, northeast: 45, east: 90, "south-east": 135, southeast: 135, south: 180, "south-west": 225, southwest: 225, west: 270, "north-west": 315, northwest: 315 };

/** The point `km` along a bearing from a point, on a sphere. */
export function offset([lat, lon]: [number, number], bearingDeg: number, km: number): [number, number] {
  const R = 6371, d = km / R, b = (bearingDeg * Math.PI) / 180, p1 = (lat * Math.PI) / 180, l1 = (lon * Math.PI) / 180;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return [(p2 * 180) / Math.PI, ((((l2 * 180) / Math.PI) + 540) % 360) - 180];
}

/** Great-circle distance in km. */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Free Cities further off, for the map to be a world and for somewhere to visit. */
const FAR: { id: string; name: string; at: [number, number]; size: number }[] = [
  { id: "fc-tyre", name: "New Tyre", at: [33.6, 34.2], size: 1.1 },
  { id: "fc-hanse", name: "Hanseport", at: [54.8, 5.5], size: 1.3 },
  { id: "fc-macau", name: "Second Macau", at: [21.6, 114.0], size: 1.6 },
  { id: "fc-caribe", name: "Isla Libre", at: [17.5, -75.5], size: 0.9 },
  { id: "fc-java", name: "Sundagate", at: [-6.8, 106.0], size: 1.0 },
  { id: "fc-horn", name: "Bab Station", at: [12.4, 44.2], size: 0.8 },
  { id: "fc-pacific", name: "Meridian", at: [20.8, -157.5], size: 1.2 },
  { id: "fc-cape", name: "Agulhas", at: [-36.0, 21.0], size: 0.7 },
  { id: "fc-arabian", name: "Ras Kanz", at: [22.0, 60.0], size: 1.0 },
  { id: "fc-rio", name: "Guanabara Deep", at: [-24.5, -42.5], size: 1.1 },
];
const PULLING = Object.keys(DOCTRINE_PULL);

export type PlaceKind = "yours" | "neighbour" | "freecity" | "region";
export interface Place {
  id: string;
  kind: PlaceKind;
  name: string;
  at: [number, number];
  /** The area it covers or controls, as a circle radius in km. */
  radiusKm: number;
  /** Lines for the panel. */
  lines: string[];
  /** For regions: its state this week. */
  state?: RegionState;
  /** How much of it you own, 0–100, for neighbours. */
  owned?: number;
  doctrines?: string[];
  /** Whether you have a trade route there. */
  route?: boolean;
  disrupted?: boolean;
  /** Distance from your arcology. */
  km: number;
}

const area = (r: number) => Math.round(Math.PI * r * r);
export const areaLabel = (r: number) => `${area(r).toLocaleString()} km²`;

/** How far your reach runs: your districts and their levels, your trade routes, your hold on the neighbours. */
export function reachKm(s: SaveState): number {
  const c = cityOf(s);
  const built = c.districts.filter((d) => d.level > 0).reduce((n, d) => n + d.level, 0);
  const owned = s.arcology.neighbours.reduce((n, x) => n + x.ownership, 0) / 100;
  return Math.round(40 + built * 9 + c.routes.length * 60 + owned * 180);
}

export function places(s: SaveState): Place[] {
  const home = homeOf(s);
  const w = worldOf(s);
  const c = cityOf(s);
  const out: Place[] = [];
  const reach = reachKm(s);
  out.push({
    id: "yours", kind: "yours", name: s.arcology.name, at: home, radiusKm: reach, km: 0,
    lines: [`Your arcology, in ${s.arcology.region}.`, `Reach: ${areaLabel(reach)} (${c.districts.filter((d) => d.level > 0).length} districts built, ${c.routes.length} trade route${c.routes.length === 1 ? "" : "s"}).`, `${s.arcology.population.toLocaleString()} citizens; prosperity ${Math.round(s.arcology.prosperity)}.`],
  });
  s.arcology.neighbours.forEach((n, i) => {
    const at = offset(home, BEARING[n.direction] ?? i * 120, 260 + i * 70);
    const r = Math.round(30 + n.prosperity * 0.9);
    const docs = n.doctrines.length ? n.doctrines : (() => { const g = rng(`${s.id}:character:${n.id}`); const a = g.pick(PULLING); return [a, g.pick(PULLING.filter((d) => d !== a))]; })();
    out.push({
      id: n.id, kind: "neighbour", name: n.name, at, radiusKm: r, owned: n.ownership, doctrines: docs, km: Math.round(distanceKm(home, at)),
      lines: [`The arcology to the ${n.direction}. Covers ${areaLabel(r)}.`, `You own ${Math.round(n.ownership)}% of it. Its attitude to you: ${n.attitude <= -30 ? "hostile" : n.attitude >= 30 ? "friendly" : "wary"} (${Math.round(n.attitude)}).`, `Believes in ${docs.map((d) => DOCTRINE_BY_ID[d]?.noun ?? d).join(" and ")}.`],
    });
  });
  for (const f of FAR) {
    if (distanceKm(home, f.at) < 700) continue;
    const g = rng(`${s.id}:far:${f.id}`);
    const docs = [g.pick(PULLING)];
    const r = Math.round(70 * f.size + g.int(0, 40));
    out.push({ id: f.id, kind: "freecity", name: f.name, at: f.at, radiusKm: r, doctrines: docs, km: Math.round(distanceKm(home, f.at)),
      lines: [`A Free City. Covers ${areaLabel(r)}.`, `Believes in ${DOCTRINE_BY_ID[docs[0]]?.noun ?? docs[0]}.`] });
  }
  for (const reg of REGIONS) {
    const run = w.regions[reg.id];
    const at = REGION_AT[reg.id] ?? [0, 0];
    const route = c.routes.find((x) => x.region === reg.id);
    out.push({
      id: `region:${reg.id}`, kind: "region", name: reg.name, at, radiusKm: 650, state: run?.state, route: !!route, disrupted: !!route && route.disrupted > 0, km: Math.round(distanceKm(home, at)),
      lines: [`Old World region: ${reg.note}`, `${run ? `${REGION_STATE_WORD[run.state][0].toUpperCase()}${REGION_STATE_WORD[run.state].slice(1)} (stability ${Math.round(run.stability)}) since week ${run.since}.` : ""}`, route ? `Your trade route runs here${route.disrupted ? ", disrupted" : ""}.` : `No route yet: needs dock reach ${reg.reach} and ¤${reg.open.toLocaleString()} (City screen).`],
    });
  }
  return out;
}

/* ── the old world, the climate, the energy ──────────────────────────────────────────────────── */

export interface Globe {
  /** Region id → week you last got involved there. */
  involved: Record<string, number>;
  /** Research: id → week finished, or weeks left while it runs. */
  tech: Record<string, { done?: number; left?: number }>;
  /** A visit in progress: the scene, and what you can do. */
  visit?: Visit;
  last_visit?: number;
  log: { week: number; text: string }[];
}
export function globeOf(s: SaveState): Globe {
  return (s.globe ??= { involved: {}, tech: {}, log: [] });
}
const note = (s: SaveState, text: string) => { const g = globeOf(s); g.log.push({ week: s.arcology.week, text }); if (g.log.length > 40) g.log.shift(); };

/** Where your power comes from: the share each source supplies, 0–100. */
export function energyMix(s: SaveState): { fossil: number; solar: number; fusion: number } {
  const t = globeOf(s).tech;
  const solar = t.solar_skin?.done ? 30 : 0;
  const fusion = t.fusion?.done ? 60 : 0;
  return { fossil: Math.max(0, 100 - solar - fusion), solar, fusion: Math.min(fusion, 100 - solar) };
}

/* ── research ────────────────────────────────────────────────────────────────────────────────── */

export interface Research { id: string; name: string; note: string; cost: number; weeks: number; needs?: string[]; kind: "energy" | "climate" | "world" | "arcology";
  /** Once, when it finishes. */ done?: (s: SaveState) => string;
  /** Every week after. */ weekly?: (s: SaveState) => void }

export const RESEARCH: Research[] = [
  { id: "solar_skin", kind: "energy", name: "Solar skin", note: "Photovoltaic cladding over the whole spire. A third of your power, clean; ¤400 a week in sales; pollution falls.", cost: 30000, weeks: 4,
    weekly: (s) => { const w = worldOf(s); w.pollution = clamp(w.pollution - 1.2, 0, 100); s.arcology.cash += 400; } },
  { id: "fusion", kind: "energy", name: "Compact fusion", note: "A reactor under the foundations. Most of your power, and power to sell to the neighbours: ¤1,500 a week. The climate stops getting worse because of you.", cost: 140000, weeks: 10, needs: ["solar_skin"],
    weekly: (s) => { const w = worldOf(s); w.pollution = clamp(w.pollution - 2.5, 0, 100); w.strain = clamp(w.strain - 0.3, 0, 100); s.arcology.cash += 1500; } },
  { id: "carbon_capture", kind: "climate", name: "Carbon capture", note: "Towers that pull carbon out of the sea air. The world's climate strain starts falling instead of rising.", cost: 60000, weeks: 6,
    weekly: (s) => { const w = worldOf(s); w.strain = clamp(w.strain - 0.6, 0, 100); } },
  { id: "reforestation", kind: "climate", name: "Reforestation compacts", note: "Pay Old World governments to replant. Strain falls fast; ¤800 a week for as long as it runs; the regions you plant in steady.", cost: 90000, weeks: 8, needs: ["carbon_capture"],
    weekly: (s) => { const w = worldOf(s); w.strain = clamp(w.strain - 1.2, 0, 100); s.arcology.cash -= 800; for (const r of Object.values(w.regions)) r.stability = clamp(r.stability + 0.3, 0, 100); } },
  { id: "desalination", kind: "world", name: "Desalination fleet", note: "Floating plants that sell fresh water to the Old World at cost. Every region's stability rises a little each week; the world thanks you.", cost: 75000, weeks: 7,
    weekly: (s) => { for (const r of Object.values(worldOf(s).regions)) r.stability = clamp(r.stability + 0.8, 0, 100); s.arcology.rep += 25; } },
  { id: "vaccines", kind: "world", name: "Fever vaccines", note: "A vaccine line for the fevers that come in on the ships. Plagues end within a week, anywhere your routes reach.", cost: 45000, weeks: 5,
    weekly: (s) => { const w = worldOf(s); for (const [id, r] of Object.entries(w.regions)) if (r.plague_until && r.plague_until > s.arcology.week + 1 && s.city?.routes.some((x) => x.region === id)) r.plague_until = s.arcology.week + 1; } },
  { id: "vertical_farms", kind: "arcology", name: "Vertical farms", note: "Twelve floors of hydroponics. Food production rises for good.", cost: 35000, weeks: 4,
    done: (s) => { s.arcology.food.production += 60; return "food production +60"; } },
  { id: "drone_net", kind: "arcology", name: "Drone net", note: "A surveillance and response swarm. Security +12.", cost: 40000, weeks: 4,
    done: (s) => { s.arcology.security = clamp(s.arcology.security + 12, 0, 100); return "security +12"; } },
  { id: "neural_clinic", kind: "arcology", name: "Neural medicine", note: "A clinic the Old World's rich fly in for. Prosperity +10 and reputation +600.", cost: 80000, weeks: 8,
    done: (s) => { s.arcology.prosperity = clamp(s.arcology.prosperity + 10, 0, 200); s.arcology.rep += 600; return "prosperity +10, reputation +600"; } },
];
export const RESEARCH_BY_ID: Record<string, Research> = Object.fromEntries(RESEARCH.map((r) => [r.id, r]));

export function canResearch(s: SaveState, id: string): string | null {
  const r = RESEARCH_BY_ID[id];
  const t = globeOf(s).tech;
  if (!r) return "unknown";
  if (t[id]?.done) return "done";
  if (t[id]?.left) return "underway";
  const missing = (r.needs ?? []).filter((n) => !t[n]?.done);
  if (missing.length) return `needs ${missing.map((n) => RESEARCH_BY_ID[n].name).join(", ")}`;
  if (s.arcology.cash < r.cost) return `needs ¤${r.cost.toLocaleString()}`;
  return null;
}

export function startResearch(s: SaveState, id: string): string {
  const why = canResearch(s, id);
  if (why) return "";
  const r = RESEARCH_BY_ID[id];
  s.arcology.cash -= r.cost;
  globeOf(s).tech[id] = { left: r.weeks };
  note(s, `Research began: ${r.name}.`);
  return `Work begins on ${r.name.toLowerCase()}. It will take ${r.weeks} weeks.`;
}

/** Weekly: research advances, finished research runs. */
export function tickGlobe(s: SaveState): string[] {
  const out: string[] = [];
  const g = globeOf(s);
  for (const [id, st] of Object.entries(g.tech)) {
    const r = RESEARCH_BY_ID[id];
    if (!r) continue;
    if (st.left) {
      st.left--;
      if (st.left <= 0) { st.left = undefined; st.done = s.arcology.week; const said = r.done?.(s); out.push(`Research finished: ${r.name}.${said ? ` ${said[0].toUpperCase()}${said.slice(1)}.` : ""}`); note(s, `Research finished: ${r.name}.`); startRumor(s, `${s.arcology.name} has finished its ${r.name.toLowerCase()}`, { salience: 5, charge: 1 }); }
    } else if (st.done) r.weekly?.(s);
  }
  return out;
}

/* ── wars and crises ─────────────────────────────────────────────────────────────────────────── */

export type Involvement = "fund_peace" | "sell_arms" | "send_mercs" | "refugees" | "captives";
export const INVOLVE: Record<Involvement, { label: string; note: string; when: RegionState[] }> = {
  fund_peace: { label: "Fund a peace", note: "¤15,000. Stability +15; reputation and standing rise.", when: ["war", "collapse", "unrest"] },
  sell_arms: { label: "Sell arms to both sides", note: "¤6,000–14,000 in; stability −12; your reputation abroad suffers.", when: ["war", "unrest"] },
  send_mercs: { label: "Send your mercenaries", note: "Needs hired mercenaries. A fight: win and the region steadies and pays you; lose and they come home fewer.", when: ["war", "collapse"] },
  refugees: { label: "Take in refugees", note: "+180 citizens; crime rises a little; reputation rises.", when: ["war", "collapse", "plague"] },
  captives: { label: "Buy war captives", note: "¤5,000 for a captive, who becomes your slave.", when: ["war", "collapse"] },
};

export function conflicts(s: SaveState): { id: string; name: string; state: RegionState; stability: number; since: number }[] {
  const w = worldOf(s);
  return REGIONS.map((r) => ({ id: r.id, name: r.name, ...w.regions[r.id] })).filter((r) => r.state && ["war", "collapse", "unrest", "plague"].includes(r.state))
    .map((r) => ({ id: r.id, name: r.name, state: r.state, stability: r.stability, since: r.since }));
}

export function canInvolve(s: SaveState, regionId: string, how: Involvement): string | null {
  const run = worldOf(s).regions[regionId];
  if (!run || !INVOLVE[how].when.includes(run.state)) return "not now";
  const last = globeOf(s).involved[regionId];
  if (last !== undefined && s.arcology.week - last < 4) return `again in week ${last + 4}`;
  if (how === "fund_peace" && s.arcology.cash < 15000) return "needs ¤15,000";
  if (how === "captives" && s.arcology.cash < 5000) return "needs ¤5,000";
  if (how === "send_mercs" && !s.arcology.mercenaries.hired) return "hire mercenaries first";
  return null;
}

export function involve(s: SaveState, regionId: string, how: Involvement): string {
  if (canInvolve(s, regionId, how)) return "";
  const run = worldOf(s).regions[regionId];
  const reg = REGION_BY_ID[regionId];
  const a = s.arcology;
  const r = rng(`${s.id}:involve:${regionId}:${a.week}:${how}`);
  globeOf(s).involved[regionId] = a.week;
  const std = (by: number) => { a.public_standing = clamp(a.public_standing + by, -10, 10); };
  let line = "";
  if (how === "fund_peace") {
    a.cash -= 15000; run.stability = clamp(run.stability + 15, 0, 100); a.rep += 400; std(0.5);
    line = `Your money buys a ceasefire in ${reg.name}: the fighters are paid to go home, and a road reopens. Old World papers print your name next to the word "peace" for once.`;
  } else if (how === "sell_arms") {
    const take = r.int(6, 14) * 1000; a.cash += take; run.stability = clamp(run.stability - 12, 0, 100); a.rep = Math.max(0, a.rep - 250);
    line = `Two ships of rifles leave your docks for ${reg.name}, one for each side. ¤${take.toLocaleString()} comes back. So, within a month, do the photographs.`;
  } else if (how === "send_mercs") {
    const m = a.mercenaries;
    const roll = militaryStrength(s) * (0.6 + r() * 0.8) - (100 - run.stability) * 0.6;
    if (roll >= 0) {
      const loot = r.int(8, 20) * 1000; a.cash += loot; run.stability = clamp(run.stability + 12, 0, 100); a.rep += 300; m.loyalty = clamp(m.loyalty + 5, 0, 100);
      const n = r.int(0, 2); const names = prisoners(s, n, `taken in ${reg.name} by your mercenaries`);
      line = `Your mercenaries take the port in ${reg.name} and hold it until the fighting burns out. They bring home ¤${loot.toLocaleString()}${names.length ? ` and ${names.join(" and ")}, taken prisoner` : ""}.`;
    } else {
      m.strength = clamp(m.strength - r.int(10, 25), 0, 100); m.loyalty = clamp(m.loyalty - 8, 0, 100);
      line = `The fighting in ${reg.name} is worse than the briefing said. Your mercenaries come home late, fewer, and angry about it.`;
    }
  } else if (how === "refugees") {
    a.population += 180; a.crime = clamp(a.crime + 2, 0, 100); a.rep += 200; std(0.3);
    line = `Three boats from ${reg.name} dock at dawn. You let them all in. The residential floors are crowded for a month, and a lot of people in the Old World remember who opened the door.`;
  } else {
    a.cash -= 5000; const names = prisoners(s, 1, `bought as a war captive in ${reg.name}`);
    line = `A broker in ${reg.name} sells you ${names[0]}, taken in the fighting. She arrives in the hold of a cargo ship with a number on her wrist.`;
  }
  note(s, line);
  return line;
}

/** A captive, as a new slave in the household. */
function prisoners(s: SaveState, n: number, how: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const p = generatePerson({ seed: `globe:${s.id}:${s.arcology.week}:${how}:${i}`, week: s.arcology.week });
    p.status = "owned"; p.assignment = "rest";
    p.origin.acquired_how = how; p.origin.acquired_week = s.arcology.week; p.economics.price_paid = 0;
    p.bond = { ...p.bond, fear: Math.max(p.bond.fear, 35), resentment: Math.max(p.bond.resentment, 40) };
    s.people[p.id] = p; s.memory[p.id] = newMemory(); refresh(p, s.memory[p.id]);
    out.push(p.name);
  }
  return out;
}

/* ── visits ──────────────────────────────────────────────────────────────────────────────────── */

/** THE CLOSED TABLE. A visit's options can do these and nothing else, whoever wrote them. */
export const VISIT_EFFECTS: Record<string, { note: string; run: (s: SaveState, place: Place, v: number) => string }> = {
  cash: { note: "money changes hands: value is ¤, −20000…20000", run: (s, _p, v) => { const n = Math.round(clamp(v, -20000, 20000)); s.arcology.cash += n; return n ? `${n > 0 ? "+" : "−"}¤${Math.abs(n).toLocaleString()}` : ""; } },
  rep: { note: "your name abroad: value −600…600", run: (s, _p, v) => { const n = Math.round(clamp(v, -600, 600)); s.arcology.rep = Math.max(0, s.arcology.rep + n); return n ? `${n > 0 ? "+" : "−"}${Math.abs(n)} reputation` : ""; } },
  standing: { note: "what your own citizens hear of it: value −2…2", run: (s, _p, v) => { const n = clamp(v, -2, 2); s.arcology.public_standing = clamp(s.arcology.public_standing + n, -10, 10); return n ? `standing ${n > 0 ? "+" : ""}${n}` : ""; } },
  attitude: { note: "a neighbour's feeling toward you: value −25…25 (neighbours only)", run: (s, p, v) => { const n = s.arcology.neighbours.find((x) => x.id === p.id); if (!n) return ""; const d = Math.round(clamp(v, -25, 25)); n.attitude = clamp(n.attitude + d, -100, 100); return `${n.name} ${d >= 0 ? "warms to you" : "cools on you"} (${d > 0 ? "+" : ""}${d})`; } },
  ownership: { note: "you buy into a neighbour: value is % 1…10, costs ¤4,000 a point (neighbours only)", run: (s, p, v) => { const n = s.arcology.neighbours.find((x) => x.id === p.id); if (!n) return ""; const pts = Math.round(clamp(v, 1, 10)); s.arcology.cash -= pts * 4000; n.ownership = clamp(n.ownership + pts, 0, 100); return `you own ${Math.round(n.ownership)}% of ${n.name} (−¤${(pts * 4000).toLocaleString()})`; } },
  stability: { note: "the region steadies or slips: value −15…15 (regions only)", run: (s, p, v) => { const run = worldOf(s).regions[p.id.replace("region:", "")]; if (!run) return ""; const d = Math.round(clamp(v, -15, 15)); run.stability = clamp(run.stability + d, 0, 100); return `${p.name} ${d >= 0 ? "steadies" : "slips"} (${d > 0 ? "+" : ""}${d})`; } },
  slave: { note: "someone comes home with you as your slave: value is ¤ paid, 0…12000", run: (s, p, v) => { const paid = Math.round(clamp(v, 0, 12000)); s.arcology.cash -= paid; const [name] = prisoners(s, 1, `brought back from ${p.name}`); return `${name} comes home with you${paid ? ` (−¤${paid.toLocaleString()})` : ""}`; } },
  nothing: { note: "nothing changes", run: () => "" },
};

export interface VisitOption { id: string; label: string; outcome: string; effects: { effect: string; value: number }[] }
export interface Visit { place: string; week: number; scene: string; options: VisitOption[]; by: "narrator" | "game"; result?: string }

export function visitCost(s: SaveState, p: Place): number {
  return Math.round(1000 + p.km * 0.8);
}

export function canVisit(s: SaveState, p: Place): string | null {
  if (p.kind === "yours") return "you live here";
  if (p.kind === "neighbour" && (p.owned ?? 0) >= 100) return "you own it";
  const g = globeOf(s);
  if (g.visit && !g.visit.result) return "finish the visit you're on";
  if (g.last_visit === s.arcology.week) return "one trip a week";
  if (s.arcology.cash < visitCost(s, p)) return `needs ¤${visitCost(s, p).toLocaleString()}`;
  return null;
}

/** What the place is, for the narrator. */
function placeBrief(s: SaveState, p: Place): string {
  const docs = (p.doctrines ?? []).map((d) => DOCTRINE_BY_ID[d]).filter(Boolean).map((d) => `${d.noun}: "${d.creed}" It looks like: ${d.look}.`).join(" ");
  return [`${p.name}: ${p.lines.join(" ")}`, docs, p.kind === "region" ? "This is the Old World, where slavery is illegal and the law is weak." : "This is a Free City, where slavery is legal."].filter(Boolean).join("\n");
}

/** The game's own visits, for when there is no narrator. */
function gameVisit(s: SaveState, p: Place): Omit<Visit, "place" | "week" | "by"> {
  const r = rng(`${s.id}:visit:${p.id}:${s.arcology.week}`);
  if (p.kind === "region") {
    const bad = p.state === "war" || p.state === "collapse";
    return r.pick([
      { scene: bad ? `The port in ${p.name} is half burned. A militia captain meets your boat and says he can guarantee your safety for a fee, and that he has a girl for sale who used to be a schoolteacher.` : `The market in ${p.name} is loud and cheap. A local official invites you to dinner and asks, carefully, whether a Free City would be interested in the water contract.`,
        options: bad ? [
          { id: "pay", label: "Pay the captain, and buy the girl", outcome: "You pay him twice. She sits in the boat home without saying anything.", effects: [{ effect: "cash", value: -2000 }, { effect: "slave", value: 4000 }] },
          { id: "relief", label: "Hand out food from your boat instead", outcome: "You empty the hold on the quay. A photographer is there.", effects: [{ effect: "cash", value: -3000 }, { effect: "rep", value: 300 }, { effect: "stability", value: 4 }] },
          { id: "leave", label: "Leave before dark", outcome: "You're back on the water before the shooting starts again.", effects: [{ effect: "nothing", value: 0 }] },
        ] : [
          { id: "contract", label: "Take the contract", outcome: "You shake on it over the fish course. The money arrives, and so does gratitude.", effects: [{ effect: "cash", value: 6000 }, { effect: "stability", value: 5 }] },
          { id: "bribe", label: "Offer him a bribe for a better one", outcome: "He takes it, and the contract, and tells a journalist.", effects: [{ effect: "cash", value: 9000 }, { effect: "rep", value: -200 }] },
          { id: "decline", label: "Decline politely", outcome: "He's disappointed, and courteous about it.", effects: [{ effect: "nothing", value: 0 }] },
        ] },
    ]);
  }
  return r.pick([
    { scene: `${p.name}'s owner meets you on the landing pad and shows you round. At the end of the tour, over drinks, they mention that a block of shares in the arcology has come up for sale, and that they'd rather it went to a friend.`,
      options: [
        ...(p.kind === "neighbour" ? [{ id: "buy", label: "Buy in", outcome: "You sign before the ice melts.", effects: [{ effect: "ownership", value: 5 }, { effect: "attitude", value: 8 }] }] : [{ id: "invest", label: "Invest", outcome: "You put money in. It pays, a little, and they remember.", effects: [{ effect: "cash", value: -8000 }, { effect: "rep", value: 250 }] }]),
        { id: "flatter", label: "Flatter them and buy nothing", outcome: "They enjoy it. So do you.", effects: [{ effect: "attitude", value: 5 }] },
        { id: "insult", label: "Tell them their arcology is a slum", outcome: "It is, a little. They don't forget it.", effects: [{ effect: "attitude", value: -15 }, { effect: "standing", value: 0.5 }] },
      ] },
    { scene: `An auction house in ${p.name} is selling off an estate: the owner died in debt, and his household goes under the hammer this afternoon. The star lot is a woman who was his personal secretary for eleven years.`,
      options: [
        { id: "bid", label: "Bid on her", outcome: "You win at eight thousand. She's efficient about the paperwork of her own sale.", effects: [{ effect: "slave", value: 8000 }, { effect: "rep", value: 100 }] },
        { id: "watch", label: "Watch, and learn how they do it here", outcome: "Their auctions are better run than yours. You take notes.", effects: [{ effect: "nothing", value: 0 }] },
      ] },
  ]);
}

export async function startVisit(s: SaveState, p: Place, model?: string, fallback?: string): Promise<string> {
  const why = canVisit(s, p);
  if (why) return why;
  const g = globeOf(s);
  s.arcology.cash -= visitCost(s, p);
  g.last_visit = s.arcology.week;
  let v: Visit | null = null;
  if (model) {
    const res = await call({
      system: "You write events for a dark management game about a slave-owning arcology city-state. Answer only with JSON. Every person is an adult. Do not write consequences as numbers in the prose; the game applies them.",
      user: [
        `THE PLAYER, owner of ${s.arcology.name} (reputation ${Math.round(s.arcology.rep)}, cash ¤${Math.round(s.arcology.cash).toLocaleString()}), is visiting:`,
        placeBrief(s, p),
        ``,
        `Write one situation that happens on this visit (80–140 words), specific to this place, and 2 to 4 things the player can do about it.`,
        `Each option has a short label, one or two sentences of what happens ("outcome"), and one to three effects from this table and no other:`,
        ...Object.entries(VISIT_EFFECTS).map(([k, e]) => `- ${k}: ${e.note}`),
        `Answer: {"scene": "...", "options": [{"label": "...", "outcome": "...", "effects": [{"effect": "cash", "value": -3000}]}]}`,
      ].join("\n"),
      model, fallback, json: true, maxTokens: 1200, temperature: 0.95,
    });
    const j = res.ok ? parseJson<{ scene?: string; options?: { label?: string; outcome?: string; effects?: { effect?: string; value?: number }[] }[] }>(res.text) : null;
    const opts = (j?.options ?? []).filter((o) => o.label && o.outcome).slice(0, 4).map((o, i): VisitOption => ({
      id: `o${i}`, label: String(o.label).slice(0, 90), outcome: String(o.outcome).slice(0, 500),
      effects: (o.effects ?? []).filter((e) => e.effect && VISIT_EFFECTS[e.effect] && Number.isFinite(Number(e.value))).slice(0, 3).map((e) => ({ effect: e.effect!, value: Number(e.value) })),
    }));
    if (j?.scene && opts.length >= 2) v = { place: p.id, week: s.arcology.week, scene: String(j.scene).slice(0, 1400), options: opts, by: "narrator" };
  }
  v ??= { place: p.id, week: s.arcology.week, by: "game", ...gameVisit(s, p) };
  g.visit = v;
  return "";
}

export function resolveVisit(s: SaveState, optionId: string): string {
  const g = globeOf(s);
  const v = g.visit;
  if (!v || v.result) return "";
  const p = places(s).find((x) => x.id === v.place);
  const o = v.options.find((x) => x.id === optionId);
  if (!p || !o) return "";
  const done = o.effects.map((e) => VISIT_EFFECTS[e.effect]?.run(s, p, e.value) ?? "").filter(Boolean);
  v.result = `${o.outcome}${done.length ? `\n\n${done.join(" · ")}` : ""}`;
  note(s, `Visited ${p.name}: ${o.label}.`);
  return v.result;
}
