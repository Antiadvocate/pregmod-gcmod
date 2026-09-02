/**
 * THE MARKETS — where people come from, and where they go.
 *
 * Each market is a different population, a different price curve and a different lie. The pitch is
 * what the seller says; `hidden` is what inspection or ownership eventually reveals. That gap is
 * the whole game of buying: the old game rolled a slave and showed you her true stats, which made
 * purchase a shopping trip rather than a judgement.
 */
import type { MarketOffer, MarketState, Person, SaveState } from "./types";
import { generatePerson } from "./generate";
import { valuePerson } from "./economy";
import { rng } from "./rng";
import { newMemory } from "./memory";
import { refresh } from "./obedience";
import { clamp } from "./psyche";
import { practise, skill } from "./player";
import { marketDiscount } from "./policies";

export interface MarketDef {
  id: string;
  name: string;
  blurb: string;
  /** Quality bias fed to the generator. */
  quality: number;
  /** Price multiplier against the honest valuation. */
  markup: number;
  /** How many are on offer in a week. */
  count: number;
  /** Reputation needed before this market will deal with you. */
  needs_rep: number;
  /** How likely a hidden problem is. */
  opacity: number;
}

export const MARKETS: MarketDef[] = [
  { id: "local", name: "The local pens", blurb: "Whatever came through the port this week.", quality: -0.2, markup: 0.9, count: 5, needs_rep: 0, opacity: 0.5 },
  { id: "corporate", name: "Corporate stock", blurb: "Processed, documented, and entirely uninteresting.", quality: 0.1, markup: 1.15, count: 4, needs_rep: 500, opacity: 0.15 },
  { id: "refugee", name: "The refugee intake", blurb: "People who signed because the alternative was worse.", quality: -0.35, markup: 0.55, count: 6, needs_rep: 0, opacity: 0.6 },
  { id: "elite", name: "The elite auction", blurb: "Four lots, catalogued, with provenance.", quality: 0.75, markup: 1.9, count: 3, needs_rep: 4000, opacity: 0.1 },
  { id: "shark", name: "The shark's back room", blurb: "No paperwork, and no returns.", quality: 0.15, markup: 0.65, count: 3, needs_rep: 0, opacity: 0.85 },
];

export const MARKET_BY_ID: Record<string, MarketDef> = Object.fromEntries(MARKETS.map((m) => [m.id, m]));

const PITCHES = [
  "trained, obedient, and eager to please",
  "a genuine bargain, and no I cannot say why",
  "fresh in, unspoiled, papers in order",
  "she has a temper. You look like a man who enjoys that",
  "quiet, clean, no trouble at all",
  "previous owner's estate. Nothing wrong with her",
];

const HIDDEN = [
  "she has been through three owners in eight months",
  "the health certificate is forged",
  "she was sold specifically for what she did to the last household",
  "she is quietly addicted and it will show in a fortnight",
  "she has family looking for her, with money",
  "the papers say twenty-two and she is not",
];

export function rollMarkets(state: SaveState): MarketState {
  const week = state.arcology.week;
  const offers: Record<string, MarketOffer[]> = {};
  for (const m of MARKETS) {
    if (state.arcology.rep < m.needs_rep) continue;
    const r = rng(`market:${m.id}:${week}`);
    const list: MarketOffer[] = [];
    for (let i = 0; i < m.count; i++) {
      const person = generatePerson({ seed: `${m.id}:${week}:${i}`, quality: m.quality + r.normal(0, 0.25), week });
      refresh(person);
      const honest = valuePerson(state, person);
      const price = Math.round((honest * m.markup * (1 + r.normal(0, 0.12))) / 50) * 50;
      const hidden: string[] = [];
      if (r.chance(m.opacity)) hidden.push(r.pick(HIDDEN));
      if (r.chance(m.opacity * 0.4)) hidden.push(r.pick(HIDDEN));
      list.push({ id: `${m.id}-${week}-${i}`, market: m.id, person, price, pitch: r.pick(PITCHES), hidden: [...new Set(hidden)] });
    }
    offers[m.id] = list;
  }
  return { week, offers, recruiting: state.market?.recruiting, orders: state.market?.orders ?? [] };
}

/** INSPECTION — what an hour with her tells you, if you pay for it. Reveals hidden facts against
 *  your own read of people; a clever owner finds more. */
export function inspect(state: SaveState, offer: MarketOffer): { found: string[]; cost: number } {
  const cost = Math.round(offer.price * 0.03);
  const eye = clamp((state.player.skills["trading"] ?? 20) / 100, 0.1, 0.9);
  const r = rng(`inspect:${offer.id}`);
  const found = offer.hidden.filter(() => r.chance(0.35 + eye));
  return { found, cost };
}

/** What you would actually pay: the asking price, less what your own trading and your own market
 *  licence take off it. Shown in the market so the discount is visible rather than a surprise. */
export function askingPrice(state: SaveState, offer: MarketOffer): number {
  return Math.max(200, Math.round(offer.price * skill.trading(state) * (1 - marketDiscount(state))));
}

export function buy(state: SaveState, offer: MarketOffer): { ok: boolean; why?: string; person?: Person } {
  const price = askingPrice(state, offer);
  if (state.arcology.cash < price) return { ok: false, why: "you cannot cover it" };
  const p = offer.person;
  state.arcology.cash -= price;
  p.economics.price_paid = price;
  practise(state, "trading", 2);
  practise(state, "slaving", 1);
  p.origin.acquired_week = state.arcology.week;
  p.status = "owned";
  state.people[p.id] = p;
  state.memory[p.id] = state.memory[p.id] ?? newMemory();
  refresh(p, state.memory[p.id]);
  const list = state.market.offers[offer.market];
  if (list) state.market.offers[offer.market] = list.filter((o) => o.id !== offer.id);
  return { ok: true, person: p };
}

export function sell(state: SaveState, p: Person): { price: number } {
  const price = Math.round(valuePerson(state, p) * 0.8);
  state.arcology.cash += price;
  p.status = "sold";
  p.exit_week = state.arcology.week;
  p.exit_note = `sold for ${price}`;
  // Everyone who knew her hears about it, and the household reads it as what it is.
  for (const other of Object.values(state.people)) {
    if (other.id === p.id || other.status !== "owned") continue;
    other.psyche.relaxation = clamp(other.psyche.relaxation - 0.4, -10, 10);
    other.bond.fear = clamp(other.bond.fear + 4, 0, 100);
  }
  return { price };
}

/** THE RECRUITER — a slave sent out to find the next one. Slow, cheap, and the results look like
 *  whoever you sent: a recruiter with high entertainment brings back people who were charmed, and
 *  one with high combat brings back people who were not. */
export function recruitResult(state: SaveState, recruiter: Person): MarketOffer | null {
  const r = rng(`recruit:${recruiter.id}:${state.arcology.week}`);
  const rate = clamp(0.14 + recruiter.skills.entertainment / 400 + recruiter.bond.read.devotion / 500, 0.05, 0.55);
  if (!r.chance(rate)) return null;
  const charm = recruiter.skills.entertainment > recruiter.skills.combat;
  const person = generatePerson({
    seed: `recruit:${recruiter.id}:${state.arcology.week}`,
    quality: (recruiter.skills.entertainment - 30) / 120,
    origin: charm ? "volunteered" : "debt",
    week: state.arcology.week,
  });
  refresh(person);
  return {
    id: `recruit-${state.arcology.week}`, market: "recruit", person,
    price: Math.round(valuePerson(state, person) * 0.7),
    pitch: charm ? `${recruiter.name} talked her into the lift herself.` : `${recruiter.name} did not say how, and she is not talking either.`,
    hidden: [],
  };
}
