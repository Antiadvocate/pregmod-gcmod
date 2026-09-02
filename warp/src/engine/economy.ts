/**
 * MONEY — every number the week produces, and where it came from.
 *
 * One rule governs this file: NOTHING IS ADDED TO CASH WITHOUT A LEDGER LINE. The old game's
 * budget screen was reconstructed after the fact from a dozen counters that were incremented in
 * the same passes that moved the money, and they drifted apart constantly. Here the ledger IS the
 * transaction: `earn` and `spend` write a line, and the week's cash delta is the sum of the lines.
 * If the number on screen is wrong, the line that is wrong is on screen next to it.
 */
import type { LedgerEntry, Person, SaveState } from "./types";
import { FACILITY_BY_ID } from "../data/facilities";
import { ASSIGNMENT_BY_ID } from "../data/assignments";
import { clamp } from "./psyche";
import { societyScore } from "./society";

export class Ledger {
  lines: LedgerEntry[] = [];
  cash = 0;
  rep = 0;

  entry(category: string, label: string, cash: number, rep = 0, person?: string): void {
    if (!cash && !rep) return;
    this.lines.push({ category, label, cash: Math.round(cash), rep: Math.round(rep), person });
    this.cash += Math.round(cash);
    this.rep += Math.round(rep);
  }
  earn(category: string, label: string, cash: number, person?: string): void { this.entry(category, label, cash, 0, person); }
  spend(category: string, label: string, cash: number, person?: string): void { this.entry(category, label, -Math.abs(cash), 0, person); }
  byCategory(): { category: string; cash: number; rep: number }[] {
    const m = new Map<string, { category: string; cash: number; rep: number }>();
    for (const l of this.lines) {
      const row = m.get(l.category) ?? { category: l.category, cash: 0, rep: 0 };
      row.cash += l.cash; row.rep += l.rep;
      m.set(l.category, row);
    }
    return [...m.values()].sort((a, b) => b.cash - a.cash);
  }
}

/** How good this person is at being looked at. 0.2 … 2.0, and it is the biggest multiplier in the
 *  income model, as it should be. */
export function appeal(p: Person): number {
  const b = p.body;
  let n = b.face / 55;
  n *= clamp(1 + (b.boobs - 400) / 3500, 0.8, 1.3);
  n *= clamp(1 - Math.abs(b.weight) / 220, 0.7, 1.05);
  n *= clamp(1 + p.health.health / 350, 0.75, 1.2);
  if (p.psyche.state === "broken") n *= 0.75;
  if (p.health.injuries.some((i) => !i.healed_week && i.severity !== "minor")) n *= 0.8;
  if (p.fame.prestige) n *= 1 + p.fame.prestige * 0.28;
  return clamp(n, 0.2, 2.4);
}

/** How well she does the work she is doing, 0.2 … 1.8. Skill, and then whether she is trying. */
export function competence(p: Person, kind: "sex" | "entertain" | "labour" | "fight"): number {
  const s = p.skills;
  const skill = kind === "sex" ? (s.oral + s.vaginal + s.anal) / 3 + s.whoring * 0.5
    : kind === "entertain" ? s.entertainment
    : kind === "fight" ? s.combat
    : 40;
  const dev = p.bond.read.devotion;
  // Willingness is a real multiplier, not a rounding: a hateful whore is bad at it, on purpose,
  // and a devoted one is better than her skill line says.
  const willing = clamp(1 + dev / 220, 0.55, 1.45);
  const bodyOk = clamp(1 + p.health.energy / 400 + p.health.health / 500, 0.6, 1.2);
  return clamp((0.35 + skill / 90) * willing * bodyOk, 0.2, 1.8);
}

/** WHAT ONE PERSON EARNS THIS WEEK, and what she costs. Returns the numbers; the caller writes the
 *  ledger lines, so this stays pure and testable. */
export function weeklyMoney(state: SaveState, p: Person): { income: number; upkeep: number; rep: number; customers: number; note: string } {
  const arc = state.arcology;
  const def = ASSIGNMENT_BY_ID[p.assignment];
  const fac = p.facility ? arc.facilities[p.facility] : undefined;
  const facDef = fac ? FACILITY_BY_ID[fac.kind] : undefined;

  const prosperity = clamp(arc.prosperity / 100, 0.3, 2.0);
  const society = 1 + clamp(societyScore(state, p).total, -0.8, 0.8) * 0.35;

  let income = 0, customers = 0, rep = 0;
  let note = "";

  if (facDef && facDef.income === "customers") {
    const base = facDef.id === "arcade" ? 520 : facDef.id === "brothel" ? 1400 : facDef.id === "club" ? 1100 : facDef.id === "pit" ? 700 : 800;
    const upg = 1 + Object.keys(fac!.upgrades ?? {}).length * 0.12 + (fac!.level - 1) * 0.05;
    const kind = facDef.id === "club" ? "entertain" : facDef.id === "pit" ? "fight" : "sex";
    const mult = appeal(p) * competence(p, kind) * prosperity * society * upg;
    customers = Math.round(clamp(14 * mult, 0, 220));
    income = Math.round(base * mult);
    note = `${customers} customers in ${facDef.name.toLowerCase()}`;
  } else if (facDef && facDef.income === "production") {
    if (facDef.id === "dairy") {
      const litres = clamp((p.body.boobs / 220) * (p.body.lactation ? 1 : 0.15) * (1 + p.health.health / 300), 0, 40);
      income = Math.round(litres * 90 * prosperity * society);
      note = `${litres.toFixed(1)} litres`;
    } else {
      // The farmyard does not earn: it FEEDS. Paying a worker's wage AND crediting the food they
      // grew is the double count that made the old budget screen disagree with the bank, so the
      // whole value of a farmhand shows up on the food line instead.
      const food = clamp(34 * (1 + p.health.energy / 200) * competence(p, "labour"), 0, 140);
      arc.food.production += food;
      note = `${Math.round(food)} units of food`;
    }
  } else if (def) {
    income = Math.round(def.base_income * appeal(p) * competence(p, "sex") * prosperity * society);
    rep = def.rep;
    if (def.base_income > 0) {
      customers = Math.round(clamp(9 * appeal(p) * competence(p, "sex"), 0, 60));
      note = `${customers} on the promenade`;
    }
  }

  // Reputation from the work, scaled by how famous she is and how the doctrines read her.
  rep += Math.round((facDef ? 2 : 0) * (1 + p.fame.prestige) + clamp(societyScore(state, p).total, -1, 1) * 4);

  // UPKEEP. Feeding, clothing, housing and medicating one person for a week.
  let upkeep = 220;
  upkeep += p.health.drugs.length * 90;
  upkeep += p.health.curatives * 60 + p.health.aphrodisiacs * 40;
  if (p.health.recovery_weeks > 0) upkeep += 180;
  if (fac && facDef) upkeep += facDef.upkeep_per_slot;
  if (p.womb.fetuses.length) upkeep += 60 * p.womb.fetuses.length;
  if (p.health.diet !== "healthy") upkeep += 45;
  // Doctrine costs money on the ones it likes. Paternalism is expensive; that is the trade.
  const paternal = arc.doctrines["paternalist"]?.adoption ?? 0;
  upkeep += Math.round(paternal * 0.9);

  return { income, upkeep, rep, customers, note };
}

/** WHAT THE ARCOLOGY ITSELF DOES — rents, tariffs, security, the buildings, the loans. */
export function arcologyMoney(state: SaveState, led: Ledger): void {
  const arc = state.arcology;

  const owned = arc.sectors.filter((s) => s.owner === "you");
  const rent = owned.reduce((n, s) => n + (120 + (s.condition / 100) * arc.prosperity * 8) * (s.kind === "commercial" ? 1.4 : s.kind === "industrial" ? 1.2 : 1), 0);
  led.earn("rents", `${owned.length} sectors held`, rent);

  // Tariffs are on everything moving through the arcology, not only through what you own — a
  // landlord with 18% of the floors still takes a cut of the whole building.
  const trade = arc.prosperity * arc.population * 0.06 * (0.25 + arc.ownership / 100);
  led.earn("trade", "tariffs on everything that moves through", trade);

  for (const f of Object.values(arc.facilities)) {
    if (!f.level) continue;
    const def = FACILITY_BY_ID[f.kind];
    if (!def) continue;
    const idle = Math.max(0, f.capacity - f.workers.length);
    led.spend("facilities", `${def.name}: ${f.workers.length} working, ${idle} beds empty`, def.upkeep_per_slot * f.capacity * 0.35 + f.level * 400);
  }

  const sec = Math.round(arc.security * 12 + arc.population * 0.35);
  led.spend("security", "watch, drones and the doors", sec);
  if (arc.mercenaries.hired) led.spend("security", "mercenary retainer", arc.mercenaries.upkeep);

  for (const p of arc.projects) if (p.weekly_cost) led.spend("projects", p.title, p.weekly_cost);

  for (const l of arc.loans) {
    const interest = Math.round((l.principal * l.apr) / 52);
    led.spend("debt", `${l.lender === "shark" ? "the shark" : "the bank"} — interest`, interest);
  }

  // FOOD. Your household eats on your account and the citizens eat on their own — the arcology's
  // whole population was being billed to the owner at import prices, which came to twelve thousand
  // a week against a rent roll of four hundred and bankrupted every save by week five. What you
  // actually cover is your people, plus the public provision that keeps a city-state from rioting.
  arc.food.consumption = Math.round(arc.population * 0.12 + Object.keys(state.people).length * 4);
  const shortfall = arc.food.consumption - (arc.food.production + arc.food.stores);
  if (shortfall > 0) {
    led.spend("food", "bought in, because you are not growing it", shortfall * 8);
    arc.food.stores = 0;
  } else {
    arc.food.stores = clamp(arc.food.stores + arc.food.production - arc.food.consumption, 0, 8000);
  }
  arc.food.production = 0;
}

/** WHAT SOMEBODY IS WORTH. Used by the markets in both directions, so buying and selling agree. */
export function valuePerson(state: SaveState, p: Person): number {
  let v = 1200;
  v += p.body.face * 55;
  v += clamp(p.skills.oral + p.skills.vaginal + p.skills.anal + p.skills.entertainment + p.skills.whoring, 0, 500) * 14;
  v += clamp(p.health.health, -100, 100) * 22;
  v += p.persona.education * 12;
  v *= clamp(1 + p.bond.read.devotion / 300, 0.7, 1.4);
  v *= clamp(1 - Math.abs(p.physical_age - 22) * 0.018, 0.5, 1.05);
  if (p.womb.fetuses.length) v *= 1.15;
  if (p.psyche.state === "broken") v *= 0.55;
  if (p.body.eyes === "blind" || p.body.ears === "deaf") v *= 0.8;
  if (p.fame.prestige) v *= 1 + p.fame.prestige * 0.5;
  // Doctrine premium: your own market pays for what your own culture wants.
  v *= 1 + clamp(societyScore(state, p).total, -0.6, 0.6) * 0.3;
  return Math.max(400, Math.round(v / 50) * 50);
}
