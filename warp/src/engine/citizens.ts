/**
 * THE PEOPLE WHO LIVE HERE.
 *
 * The population was one number that drifted up with prosperity and never fell below two hundred.
 * Nobody arrived, nobody left for a reason, and there was nothing to tax. Now the city has three
 * kinds of people, each earning what that kind earns, each taxed at a rate you set:
 *
 *   · the poor come for the work at the works, the docks, the dairy and the plant, and for
 *     anywhere to sleep. Tax them and more of them fall into poverty, and poverty is crime.
 *   · the middle come for flats, shops, schools, restaurants and the clinic, and they mind the
 *     tax more than the poor can afford to.
 *   · the rich come for the exchange, the shops, the university, the gardens and safe streets,
 *     and they leave over taxes and crime faster than anybody.
 *
 * Businesses earn from what everyone spends, and pay the business tax on it. Too high and they
 * close and the city gets poorer; low and it booms. Every week people arrive at the border and
 * people leave, by class, and the city screen says who and why. The border itself is yours to
 * set: open, checked or closed, with as many patrols as you pay for.
 */
import type { SaveState } from "./types";
import type { Ledger } from "./economy";
import { clamp } from "./psyche";
import { cityOf, cityYield } from "./city";

export type Klass = "poor" | "middle" | "rich";
export const KLASSES: Klass[] = ["poor", "middle", "rich"];
export type Border = "open" | "checked" | "closed";

export interface CitizensWeek {
  week: number;
  arrived: Record<Klass, number>;
  left: Record<Klass, number>;
  turnedAway: number;
  revenue: Record<Klass | "business", number>;
  poverty: number;
  /** Business profit before tax, and what's left after it. */
  business: { profit: number; after: number };
  reasons: string[];
}

export interface Citizens {
  poor: number; middle: number; rich: number;
  /** Rates, 0 to 0.6. */
  tax: Record<Klass | "business", number>;
  border: Border;
  /** 0 to 3: how many patrols you pay for along the border. */
  patrols: number;
  last?: CitizensWeek;
}

/** What one person of each kind earns in a week, in a city at prosperity 100. */
export const WAGE: Record<Klass, number> = { poor: 3, middle: 10, rich: 45 };
export const MAX_TAX = 0.6;
export const PATROL_COST = 600;
const DEFAULT_TAX: Citizens["tax"] = { poor: 0.05, middle: 0.1, rich: 0.15, business: 0.1 };

export function citizensOf(s: SaveState): Citizens {
  const pop = Math.max(0, Math.round(s.arcology.population));
  const c = (s.citizens ??= { poor: Math.round(pop * 0.55), middle: Math.round(pop * 0.37), rich: pop - Math.round(pop * 0.55) - Math.round(pop * 0.37), tax: { ...DEFAULT_TAX }, border: "checked", patrols: 0 });
  c.tax = { ...DEFAULT_TAX, ...(c.tax ?? {}) };
  c.border ??= "checked";
  c.patrols ??= 0;
  // Something else moved the population (housing ran out, a battle, an event): the classes follow.
  const sum = c.poor + c.middle + c.rich;
  if (sum !== pop) {
    if (sum <= 0) { c.poor = Math.round(pop * 0.55); c.middle = Math.round(pop * 0.37); c.rich = pop - c.poor - c.middle; }
    else { const k = pop / sum; c.poor = Math.round(c.poor * k); c.middle = Math.round(c.middle * k); c.rich = Math.max(0, pop - c.poor - c.middle); }
  }
  return c;
}

const levels = (s: SaveState, kinds: string[]) => cityOf(s).districts.filter((d) => kinds.includes(d.kind) && d.level > 0).reduce((n, d) => n + d.level, 0);
const prosp = (s: SaveState) => clamp(s.arcology.prosperity / 100, 0.2, 2);

/** What one of each kind takes home a week, after your tax. */
export function takeHome(s: SaveState, k: Klass): number {
  return WAGE[k] * prosp(s) * (1 - citizensOf(s).tax[k]);
}

/** How many live in poverty: most of the poor when they're taxed, some of the middle when they are. */
export function poverty(s: SaveState): number {
  const c = citizensOf(s);
  const pol = s.arcology.policies ?? {};
  const welfare = ["clinics", "schools", "festivals"].filter((id) => pol[id]).length * 0.05 + (s.arcology.food.stores > 0 ? 0 : -0.1);
  const poorShare = clamp(0.22 + c.tax.poor * 1.6 - welfare - (s.arcology.prosperity - 60) / 400, 0.02, 0.95);
  const middleShare = clamp((c.tax.middle - 0.2) * 1.2, 0, 0.5);
  return Math.round(c.poor * poorShare + c.middle * middleShare);
}

/** What businesses make from what everyone spends, before and after the business tax. */
export function business(s: SaveState): { profit: number; after: number; mood: string } {
  const c = citizensOf(s);
  const spend = KLASSES.reduce((n, k) => n + c[k] * takeHome(s, k), 0);
  const shops = 0.5 + Math.min(2.5, levels(s, ["commercial", "exchange", "restaurant", "pleasure", "industrial", "docks", "dairy"]) * 0.1);
  const profit = Math.round(spend * 0.35 * shops);
  const after = Math.round(profit * (1 - c.tax.business));
  const health = (1 - c.tax.business) * shops * prosp(s);
  const mood = profit === 0 ? "nobody to sell to" : health > 1.6 ? "booming" : health > 1.0 ? "doing well" : health > 0.6 ? "getting by" : "struggling, and some are closing";
  return { profit, after, mood };
}

/** What the city's industry looks like: the works and everything that makes things. */
export function industry(s: SaveState): { level: number; output: number; line: string } {
  const level = levels(s, ["industrial", "power", "docks", "dairy"]);
  const output = Math.round(cityYield(s).industry);
  const tax = citizensOf(s).tax.business;
  const line = !level ? "There's no industry yet." : `${level} levels of works, plant, docks and dairy. They knock ${Math.min(45, output)}% off everything you build${tax > 0.25 ? ", but the business tax is squeezing them" : ""}.`;
  return { level, output, line };
}

/** How strongly each kind is drawn here this week, before taxes and the border: what's built for them. */
function draw(s: SaveState): Record<Klass, number> {
  const p = prosp(s);
  const safe = s.arcology.crime < 40 ? 1 : s.arcology.crime < 65 ? 0.6 : 0.3;
  return {
    poor: 30 + levels(s, ["industrial", "docks", "dairy", "power", "residential"]) * 45,
    middle: 8 + levels(s, ["residential", "commercial", "academy", "restaurant", "clinic", "university", "therapy"]) * 22 * p,
    rich: 1 + levels(s, ["exchange", "commercial", "university", "park", "garden", "pleasure", "clinic"]) * 4 * p * safe,
  };
}

/** How much each kind minds being taxed: past this rate they stop coming and start leaving. */
const TOLERANCE: Record<Klass, number> = { poor: 0.12, middle: 0.2, rich: 0.25 };

/** Weekly. Taxes are collected, poverty is counted, people arrive and leave. Returns report lines. */
export function tickCitizens(s: SaveState, led: Ledger): { text: string; tone: "good" | "bad" | "neutral" | "warning"; weight: number }[] {
  const c = citizensOf(s);
  const arc = s.arcology;
  const week = arc.week;
  const out: { text: string; tone: "good" | "bad" | "neutral" | "warning"; weight: number }[] = [];
  const reasons: string[] = [];

  // TAXES.
  const revenue = { poor: 0, middle: 0, rich: 0, business: 0 } as CitizensWeek["revenue"];
  for (const k of KLASSES) revenue[k] = Math.round(c[k] * WAGE[k] * prosp(s) * c.tax[k]);
  const biz = business(s);
  revenue.business = biz.profit - biz.after;
  for (const k of KLASSES) if (revenue[k]) led.earn("taxes", `income tax on the ${k} (${Math.round(c.tax[k] * 100)}%)`, revenue[k]);
  if (revenue.business) led.earn("taxes", `business tax (${Math.round(c.tax.business * 100)}%)`, revenue.business);
  if (c.patrols) led.spend("security", `${c.patrols} border patrol${c.patrols === 1 ? "" : "s"}`, c.patrols * PATROL_COST);

  // What the business tax does to the city: high and shops close, low and they open.
  if (c.tax.business > 0.15) arc.prosperity = clamp(arc.prosperity - (c.tax.business - 0.15) * 8, 5, 200);
  else if (c.tax.business < 0.05 && biz.profit > 0) arc.prosperity = clamp(arc.prosperity + 0.4, 5, 200);

  // POVERTY, and the crime that comes of it.
  const poor = poverty(s);
  const pop = c.poor + c.middle + c.rich;
  if (pop > 0) arc.crime = clamp(arc.crime + (poor / pop - 0.2) * 4, 0, 100);

  // WHO COMES. What's built draws them, the tax on their kind puts them off, and the border decides
  // how many get through it. Nobody comes to a city with nowhere to live.
  const room = Math.max(0, 400 + cityYield(s).housing - pop);
  const pull = draw(s);
  const gate = c.border === "open" ? 1.3 : c.border === "closed" ? 0.15 : 1;
  const want: Record<Klass, number> = { poor: 0, middle: 0, rich: 0 };
  for (const k of KLASSES) want[k] = Math.max(0, pull[k] * clamp(1 - Math.max(0, c.tax[k] - TOLERANCE[k] * 0.5) * 2, 0, 1.3) * (1 + (TOLERANCE[k] - c.tax[k]) * 0.8));
  const wanting = KLASSES.reduce((n, k) => n + want[k], 0);
  const through = Math.min(room, Math.round(wanting * gate));
  const turnedAway = c.border === "closed" ? Math.round(wanting * (1 - gate)) : 0;
  const arrived: Record<Klass, number> = { poor: 0, middle: 0, rich: 0 };
  if (wanting > 0 && through > 0) {
    // A closed border lets the rich buy their way through first.
    const share = c.border === "closed" ? { poor: want.poor * 0.3, middle: want.middle * 0.7, rich: want.rich * 3 } : want;
    const tot = KLASSES.reduce((n, k) => n + share[k], 0) || 1;
    for (const k of KLASSES) arrived[k] = Math.round((through * share[k]) / tot);
  }
  if (!room && wanting > 0) reasons.push("there's nowhere left to live, so nobody new could move in");

  // WHO GOES. Over their tolerance, people leave; the rich leave over crime too.
  const left: Record<Klass, number> = { poor: 0, middle: 0, rich: 0 };
  for (const k of KLASSES) {
    let rate = Math.max(0, c.tax[k] - TOLERANCE[k]) * 0.35 + 0.004;
    if (k === "rich" && arc.crime > 50) rate += (arc.crime - 50) / 500;
    if (k === "middle" && poor / Math.max(1, pop) > 0.4) rate += 0.01;
    left[k] = Math.min(c[k], Math.round(c[k] * rate));
    if (c.tax[k] > TOLERANCE[k] && left[k] > 2) reasons.push(`${left[k]} of the ${k} left over the ${Math.round(c.tax[k] * 100)}% tax`);
  }
  if (arc.crime > 50 && left.rich > 0) reasons.push("the rich don't feel safe here");

  for (const k of KLASSES) c[k] = Math.max(0, c[k] + arrived[k] - left[k]);
  arc.population = c.poor + c.middle + c.rich;

  // The border's own price: an open one lets trouble in with everybody else, patrols keep it out.
  const smuggling = (c.border === "open" ? 1.2 : c.border === "checked" ? 0.4 : 0) * (1 - c.patrols * 0.3);
  arc.crime = clamp(arc.crime + smuggling - 0.4 - c.patrols * 0.2, 0, 100);
  if (c.border === "closed") arc.prosperity = clamp(arc.prosperity - 0.3, 5, 200);

  const came = KLASSES.reduce((n, k) => n + arrived[k], 0), went = KLASSES.reduce((n, k) => n + left[k], 0);
  if (came) {
    const why = arrived.poor >= arrived.middle && levels(s, ["industrial", "docks", "dairy", "power"]) ? " for the work" : arrived.rich > came * 0.2 ? " for the money" : "";
    reasons.unshift(`${came.toLocaleString()} people moved in${why}: ${arrived.poor} poor, ${arrived.middle} middle, ${arrived.rich} rich`);
  }
  if (turnedAway > 20) reasons.push(`${turnedAway.toLocaleString()} were turned away at the closed border`);
  c.last = { week, arrived, left, turnedAway, revenue, poverty: poor, business: { profit: biz.profit, after: biz.after }, reasons };

  if (came || went) out.push({ text: `${came.toLocaleString()} people arrived and ${went.toLocaleString()} left. ${reasons.slice(0, 2).join("; ")}.`, tone: came >= went ? "good" : "warning", weight: 6 });
  if (pop > 50 && poor / pop > 0.35) out.push({ text: `${poor.toLocaleString()} people (${Math.round((poor / pop) * 100)}%) are living in poverty, and crime follows it.`, tone: "bad", weight: 6 });
  return out;
}
