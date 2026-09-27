/**
 * PUBLIC WORKS — every problem the arcology has can be bought down.
 *
 * Two ways to spend on a problem:
 *
 *   works       infrastructure, built a level at a time. Each level costs more than the last and
 *               adds a little weekly upkeep, and does its job every week for as long as it stands.
 *               No ceiling on levels, so a rich owner can keep building; each level does the same
 *               amount, so the returns are steady and the prices climb.
 *   emergency   a one-off spend on the problem as it is now, scaled by how much you put in:
 *               a food stockpile, cleanup crews, a police surge, handouts, carbon offsets. Any
 *               amount; the effect stops at the end of the scale.
 *
 * Works run in the week before the money is settled, so the food a hydroponic tower grows is in
 * the stores the same week, and the upkeep is on the same ledger as everything else.
 */
import type { SaveState } from "./types";
import type { Ledger } from "./economy";
import { clamp } from "./psyche";
import { worldOf } from "./world";

export interface Work {
  id: string;
  name: string;
  /** The problem it answers, in a few words. */
  fixes: string;
  /** What one level does, for the card. */
  each: string;
  base: number;
  /** Each level costs this much more than the one before. */
  growth: number;
  upkeep: number;
  /** Every week, at `level`. */
  weekly?: (s: SaveState, level: number) => void;
}

const owned = (s: SaveState) => Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");

export const WORKS: Work[] = [
  { id: "hydroponics", name: "Hydroponic towers", fixes: "food", each: "+150 food a week", base: 18000, growth: 1.45, upkeep: 250,
    weekly: (s, l) => { s.arcology.food.production += 150 * l; } },
  { id: "granary", name: "Cold stores", fixes: "food stores", each: "+4,000 food the stores can hold", base: 12000, growth: 1.4, upkeep: 100 },
  { id: "scrubbers", name: "Scrubber towers", fixes: "pollution", each: "−3 pollution a week", base: 16000, growth: 1.45, upkeep: 300,
    weekly: (s, l) => { const w = worldOf(s); w.pollution = clamp(w.pollution - 3 * l, 0, 100); } },
  { id: "clean_industry", name: "Clean industry retrofits", fixes: "pollution at the source", each: "your industry pollutes 15% less (down to a quarter)", base: 25000, growth: 1.5, upkeep: 200 },
  { id: "police", name: "Police stations", fixes: "crime", each: "−1.5 crime and +0.5 security a week", base: 15000, growth: 1.45, upkeep: 400,
    weekly: (s, l) => { s.arcology.crime = clamp(s.arcology.crime - 1.5 * l, 0, 100); s.arcology.security = clamp(s.arcology.security + 0.5 * l, 0, 100); } },
  { id: "housing", name: "Prefab housing blocks", fixes: "housing", each: "+150 people the city can house", base: 14000, growth: 1.35, upkeep: 150 },
  { id: "amenities", name: "Parks, markets and transit", fixes: "prosperity", each: "+0.6 prosperity a week", base: 20000, growth: 1.45, upkeep: 450,
    weekly: (s, l) => { s.arcology.prosperity = clamp(s.arcology.prosperity + 0.6 * l, 5, 200); } },
  { id: "civic_media", name: "Civic media office", fixes: "what citizens think of you", each: "+0.15 standing a week", base: 18000, growth: 1.5, upkeep: 350,
    weekly: (s, l) => { s.arcology.public_standing = clamp(s.arcology.public_standing + 0.15 * l, -10, 10); } },
  { id: "hospital", name: "Household hospital wing", fixes: "your slaves' health", each: "+0.8 health a week for every slave", base: 16000, growth: 1.45, upkeep: 300,
    weekly: (s, l) => { for (const p of owned(s)) p.health.health = clamp(p.health.health + 0.8 * l, -100, 100); } },
  { id: "comforts", name: "Servants' quarters", fixes: "exhaustion and household unrest", each: "+3 energy, +0.4 hope and −0.3 resentment a week for every slave", base: 14000, growth: 1.45, upkeep: 250,
    weekly: (s, l) => { for (const p of owned(s)) { p.health.energy = clamp(p.health.energy + 3 * l, 0, 100); p.bond.hope = clamp(p.bond.hope + 0.4 * l, 0, 100); p.bond.resentment = clamp(p.bond.resentment - 0.3 * l, 0, 100); } } },
  { id: "climate_fund", name: "Climate fund", fixes: "the world's climate", each: "−0.3 climate strain a week", base: 30000, growth: 1.5, upkeep: 800,
    weekly: (s, l) => { const w = worldOf(s); w.strain = clamp(w.strain - 0.3 * l, 0, 100); } },
];
export const WORK_BY_ID: Record<string, Work> = Object.fromEntries(WORKS.map((w) => [w.id, w]));

export const levelOf = (s: SaveState, id: string) => s.works?.levels[id] ?? 0;
export const nextCost = (s: SaveState, id: string) => { const w = WORK_BY_ID[id]; return Math.round((w.base * w.growth ** levelOf(s, id)) / 100) * 100; };

export function build(s: SaveState, id: string): string {
  const w = WORK_BY_ID[id];
  if (!w) return "";
  const cost = nextCost(s, id);
  if (s.arcology.cash < cost) return "";
  s.arcology.cash -= cost;
  const levels = (s.works ??= { levels: {} }).levels;
  levels[id] = (levels[id] ?? 0) + 1;
  return `${w.name}: level ${levels[id]} is built (−¤${cost.toLocaleString()}). ${w.each[0].toUpperCase()}${w.each.slice(1)} more, and ¤${w.upkeep} a week more to run.`;
}

/** Weekly, before the money settles: every work does its job and charges its upkeep. */
export function tickWorks(s: SaveState, led: Ledger): void {
  for (const w of WORKS) {
    const l = levelOf(s, w.id);
    if (!l) continue;
    w.weekly?.(s, l);
    led.spend("public works", `${w.name} (level ${l})`, w.upkeep * l);
  }
}

/** For the other engines: what the works change about how they count. */
export const foodCap = (s: SaveState) => 8000 + levelOf(s, "granary") * 4000;
export const housingFromWorks = (s: SaveState) => levelOf(s, "housing") * 150;
export const industryPollutionFactor = (s: SaveState) => Math.max(0.25, 1 - 0.15 * levelOf(s, "clean_industry"));

/* ── emergency spending ──────────────────────────────────────────────────────────────────────── */

export interface Emergency {
  id: string;
  name: string;
  fixes: string;
  /** ¤ for one unit of effect. */
  per: number;
  unit: string;
  /** How many units there is room for right now. */
  room: (s: SaveState) => number;
  apply: (s: SaveState, units: number) => void;
  line: (units: number, s: SaveState) => string;
}

export const EMERGENCIES: Emergency[] = [
  { id: "food", name: "Buy a food stockpile", fixes: "food", per: 6, unit: "food",
    room: (s) => Math.max(0, foodCap(s) - s.arcology.food.stores),
    apply: (s, u) => { s.arcology.food.stores += u; },
    line: (u) => `Freighters unload ${u.toLocaleString()} units of grain and protein at the docks, at bulk prices.` },
  { id: "cleanup", name: "Cleanup crews", fixes: "pollution", per: 1000, unit: "pollution",
    room: (s) => Math.floor(worldOf(s).pollution),
    apply: (s, u) => { const w = worldOf(s); w.pollution = clamp(w.pollution - u, 0, 100); },
    line: (u) => `Crews in masks work through the lower levels and the ducts for a week. Pollution falls by ${u}.` },
  { id: "surge", name: "Police surge", fixes: "crime", per: 800, unit: "crime",
    room: (s) => Math.floor(s.arcology.crime),
    apply: (s, u) => { s.arcology.crime = clamp(s.arcology.crime - u, 0, 100); },
    line: (u) => `Overtime, extra patrols and a few doors kicked in. Crime falls by ${u}.` },
  { id: "handouts", name: "Handouts and a festival", fixes: "what citizens think of you", per: 5000, unit: "standing",
    room: (s) => Math.floor(10 - s.arcology.public_standing),
    apply: (s, u) => { s.arcology.public_standing = clamp(s.arcology.public_standing + u, -10, 10); },
    line: (u) => `Free food on the concourse, music on every floor, your name on the banners. Standing rises by ${u}.` },
  { id: "offsets", name: "Carbon offsets", fixes: "the world's climate", per: 3000, unit: "climate strain",
    room: (s) => Math.floor(worldOf(s).strain),
    apply: (s, u) => { const w = worldOf(s); w.strain = clamp(w.strain - u, 0, 100); },
    line: (u) => `You buy and retire carbon credits across three continents. Climate strain falls by ${u}.` },
  { id: "stimulus", name: "Business grants", fixes: "prosperity", per: 2500, unit: "prosperity",
    room: (s) => Math.floor(200 - s.arcology.prosperity),
    apply: (s, u) => { s.arcology.prosperity = clamp(s.arcology.prosperity + u, 5, 200); },
    line: (u) => `Grants to every shop that asks. Prosperity rises by ${u}.` },
];
export const EMERGENCY_BY_ID: Record<string, Emergency> = Object.fromEntries(EMERGENCIES.map((e) => [e.id, e]));

/** What `amount` would buy: whole units, never more than there is room for. */
export function emergencyPreview(s: SaveState, id: string, amount: number): { units: number; cost: number } {
  const e = EMERGENCY_BY_ID[id];
  if (!e) return { units: 0, cost: 0 };
  const units = Math.max(0, Math.min(e.room(s), Math.floor(Math.max(0, amount) / e.per)));
  return { units, cost: units * e.per };
}

export function emergency(s: SaveState, id: string, amount: number): string {
  const e = EMERGENCY_BY_ID[id];
  const { units, cost } = emergencyPreview(s, id, amount);
  if (!e || !units) return "";
  if (s.arcology.cash < cost) return `You have ¤${Math.round(s.arcology.cash).toLocaleString()}; that would cost ¤${cost.toLocaleString()}.`;
  s.arcology.cash -= cost;
  e.apply(s, units);
  return `${e.line(units, s)} (−¤${cost.toLocaleString()})`;
}
