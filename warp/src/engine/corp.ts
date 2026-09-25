/**
 * THE SLAVE CORPORATION — what to do with money once you have it.
 *
 * As in the original, you found a company that trades in slaves at scale, hold its shares, grow its
 * divisions and take a dividend. The divisions feed each other: capture supplies training, training
 * supplies export and the arcade and the dairy, surgery raises what everything sells for. The world
 * moves its numbers: a war or a collapse floods capture with cheap bodies, a boom raises prices, a
 * crash takes a third off the value. Sell shares for cash now and you own less of what it earns;
 * fall under half and the other shareholders start voting.
 */
import type { SaveState } from "./types";
import type { Ledger } from "./economy";
import { clamp } from "./psyche";
import { generatePerson } from "./generate";
import { newMemory } from "./memory";
import { refresh } from "./obedience";
import { rng } from "./rng";
import { registerEvents, type EventDef } from "./events";

export type Division = "capture" | "training" | "surgery" | "arcade" | "dairy" | "export";

export const DIVISIONS: Record<Division, { name: string; note: string; build: number; revenue: number; cost: number; needs?: Division }> = {
  capture: { name: "Acquisition", note: "buys up debtors and war refugees, and takes the ones nobody will miss", build: 20000, revenue: 2600, cost: 1500 },
  training: { name: "Training", note: "breaks and trains what acquisition brings in", build: 25000, revenue: 3200, cost: 1700, needs: "capture" },
  surgery: { name: "Surgery", note: "implants and alterations; everything else sells for more", build: 30000, revenue: 1800, cost: 1400 },
  arcade: { name: "Arcade", note: "slaves nobody wanted, locked in walls; cheap and steady", build: 18000, revenue: 2400, cost: 1100, needs: "capture" },
  dairy: { name: "Dairy", note: "milk in bulk, sold across the Free Cities", build: 22000, revenue: 2500, cost: 1300, needs: "capture" },
  export: { name: "Export", note: "sells trained slaves to other Free Cities at the best prices", build: 28000, revenue: 3800, cost: 1600, needs: "training" },
};

export interface Corp {
  name: string;
  founded: number;
  cash: number;
  /** Your share, 0–100. The rest is held by citizens and funds. */
  yours: number;
  divisions: Partial<Record<Division, number>>;
  /** Share of profit paid out each week. */
  dividend: number;
  last?: { week: number; revenue: number; costs: number; profit: number; paid: number; mood: string };
  history: { week: number; value: number }[];
}

export const FOUNDING = 50000;

export function corpOf(s: SaveState): Corp | undefined {
  return s.corp;
}

export function foundCorp(s: SaveState, name: string): { ok: boolean; why?: string } {
  if (s.corp) return { ok: false, why: "you already have one" };
  if (s.arcology.cash < FOUNDING) return { ok: false, why: `founding it costs ¤${FOUNDING.toLocaleString()}` };
  s.arcology.cash -= FOUNDING;
  s.corp = { name: name.trim() || `${s.arcology.name} Holdings`, founded: s.arcology.week, cash: FOUNDING, yours: 100, divisions: {}, dividend: 0.25, history: [] };
  return { ok: true };
}

/** What the world is doing to the trade, as multipliers. */
function market(s: SaveState): { supply: number; price: number; mood: string } {
  const w = s.world;
  let supply = 1, price = 1;
  const moods: string[] = [];
  if (w) {
    const bad = Object.values(w.regions).filter((r) => r.state === "war" || r.state === "collapse").length;
    if (bad) { supply += bad * 0.2; moods.push(`${bad} region${bad === 1 ? "" : "s"} at war or collapsing: cheap bodies`); }
    const ph = w.economy.phase;
    price = ph === "boom" ? 1.3 : ph === "slump" ? 0.85 : ph === "crash" ? 0.65 : 1;
    if (ph !== "steady") moods.push(`the Free Cities economy is in a ${ph}`);
  }
  return { supply, price, mood: moods.join("; ") || "a steady market" };
}

export function corpValue(s: SaveState, c = s.corp): number {
  if (!c) return 0;
  const built = (Object.keys(c.divisions) as Division[]).reduce((n, d) => n + DIVISIONS[d].build * (c.divisions[d] ?? 0), 0);
  const earning = c.last ? Math.max(0, c.last.profit) * 15 : 0;
  return Math.round(c.cash + built * 0.8 + earning);
}

export function canExpand(s: SaveState, d: Division): string | null {
  const c = s.corp;
  if (!c) return "no corporation";
  const need = DIVISIONS[d].needs;
  if (need && !c.divisions[need]) return `needs ${DIVISIONS[need].name} first`;
  const level = c.divisions[d] ?? 0;
  if (level >= 5) return "at its largest";
  const cost = DIVISIONS[d].build * (level + 1);
  if (c.cash < cost) return `the corporation needs ¤${cost.toLocaleString()} in its treasury`;
  return null;
}

export function expand(s: SaveState, d: Division): boolean {
  const c = s.corp;
  if (!c || canExpand(s, d)) return false;
  const level = c.divisions[d] ?? 0;
  c.cash -= DIVISIONS[d].build * (level + 1);
  c.divisions[d] = level + 1;
  return true;
}

/** Put your own money into the treasury. It buys you shares at the current value. */
export function invest(s: SaveState, amount: number): void {
  const c = s.corp;
  if (!c || amount <= 0 || s.arcology.cash < amount) return;
  const v = Math.max(1, corpValue(s));
  const theirs = 100 - c.yours;
  s.arcology.cash -= amount;
  c.cash += amount;
  // New shares at the current price: your stake rises toward what you put in.
  const newTotal = v + amount;
  c.yours = clamp(((c.yours / 100) * v + amount) / newTotal * 100, 0, 100);
  void theirs;
}

/** Sell ten points of your stake to outside investors for cash. */
export function sellShares(s: SaveState, points = 10): number {
  const c = s.corp;
  if (!c || c.yours < points) return 0;
  const got = Math.round(corpValue(s) * (points / 100) * 0.95);
  c.yours -= points;
  s.arcology.cash += got;
  return got;
}

/** Buy ten points back, at a premium. */
export function buyShares(s: SaveState, points = 10): number {
  const c = s.corp;
  if (!c || c.yours + points > 100) return 0;
  const cost = Math.round(corpValue(s) * (points / 100) * 1.1);
  if (s.arcology.cash < cost) return 0;
  s.arcology.cash -= cost;
  c.yours += points;
  return cost;
}

/** Take a slave from the pipeline for yourself. */
export function drawSlave(s: SaveState): string | null {
  const c = s.corp;
  if (!c || !c.divisions.capture || c.cash < 4000) return null;
  c.cash -= 4000;
  const trained = !!c.divisions.training;
  const p = generatePerson({ seed: `corp:${s.id}:${s.arcology.week}:${c.cash}`, week: s.arcology.week, quality: trained ? 0.45 : 0.15 });
  p.origin.acquired_how = `taken from ${c.name}'s ${trained ? "training pens" : "acquisition stock"}`;
  p.origin.acquired_week = s.arcology.week;
  p.economics.price_paid = 4000;
  if (trained) { p.bond.fear = Math.max(p.bond.fear, 40); p.skills.oral = Math.max(p.skills.oral, 35); }
  s.people[p.id] = p;
  s.memory[p.id] = newMemory();
  refresh(p, s.memory[p.id]);
  return p.id;
}

/** Weekly. */
export function tickCorp(s: SaveState, led: Ledger): string[] {
  const c = s.corp;
  if (!c) return [];
  const out: string[] = [];
  const m = market(s);
  const has = (d: Division) => c.divisions[d] ?? 0;
  let revenue = 0, costs = 0;
  for (const d of Object.keys(c.divisions) as Division[]) {
    const L = has(d);
    const def = DIVISIONS[d];
    let r = def.revenue * L;
    if (d === "capture") r *= m.supply;
    else r *= m.price;
    if (d === "export" && has("training") >= L) r *= 1.2;
    if (has("surgery") && d !== "surgery" && d !== "capture") r *= 1 + has("surgery") * 0.05;
    if (d === "training" && has("capture") < L) r *= 0.6;
    revenue += r;
    costs += def.cost * L;
  }
  revenue = Math.round(revenue * (0.9 + rng(`corp:${s.arcology.week}`)() * 0.2));
  costs = Math.round(costs);
  const profit = revenue - costs;
  const paid = profit > 0 ? Math.round(profit * c.dividend) : 0;
  c.cash += profit - paid;
  const mine = Math.round(paid * (c.yours / 100));
  if (mine) led.earn("corporation", `${c.name} dividend (${Math.round(c.yours)}% of ¤${paid.toLocaleString()})`, mine);
  c.last = { week: s.arcology.week, revenue, costs, profit, paid, mood: m.mood };
  c.history.push({ week: s.arcology.week, value: corpValue(s) });
  if (c.history.length > 52) c.history.shift();
  if (c.cash < 0) {
    out.push(`${c.name} is out of money. Its creditors are asking you to cover ¤${Math.round(-c.cash).toLocaleString()}.`);
  }
  return out;
}

/* ── things that happen to a corporation ───────────────────────────────────────────────────── */

const CORP_EVENTS: EventDef[] = [
  {
    id: "corp_vote", severity: "notable", endogenous: false,
    candidates: (s) => (s.corp && s.corp.yours < 50 ? [{}] : []),
    weight: (s) => (50 - (s.corp?.yours ?? 50)) / 5 + 1,
    seed: (s) => `The other shareholders of ${s.corp!.name} have called a vote. Between them they hold ${Math.round(100 - s.corp!.yours)}% of the company, and they want the dividend raised to half of every week's profit, and a seat on the board for their man.`,
    options: [
      { id: "give", label: "Give them what they want", note: "dividend to 50%",
        resolve: (s) => { s.corp!.dividend = 0.5; return `You concede. The dividend goes to half of every week's profit, and their man, a soft-spoken banker from the Gulf, takes the seat next to yours at every meeting. The company grows slower. You get paid more.`; } },
      { id: "buy", label: "Buy back enough to outvote them", note: "expensive",
        resolve: (s) => { let spent = 0; while (s.corp!.yours < 51) { const c = buyShares(s); if (!c) break; spent += c; } return s.corp!.yours >= 51 ? `You spend ¤${spent.toLocaleString()} buying shares back until you hold ${Math.round(s.corp!.yours)}%. The vote is cancelled before it happens.` : `You try to buy enough back and run out of money at ${Math.round(s.corp!.yours)}%. The vote goes ahead, and the dividend goes up anyway.`; } },
      { id: "fight", label: "Fight it", note: "you might lose control",
        resolve: (s) => { if (s.arcology.rep > 8000) return `You make some calls. By the day of the vote, enough of them have remembered who owns the arcology they live in, and it fails.`; s.corp!.dividend = 0.5; s.corp!.yours = Math.max(0, s.corp!.yours - 5); return `You fight it and lose. They raise the dividend and dilute your stake by issuing new shares to themselves. You hold ${Math.round(s.corp!.yours)}% now.`; } },
    ],
  },
  {
    id: "corp_raid", severity: "notable", endogenous: false,
    candidates: (s) => (s.corp && (s.corp.divisions.capture ?? 0) >= 2 ? [{}] : []),
    weight: () => 1.2,
    seed: (s) => `A rival company from the arcology across the strait has been raiding ${s.corp!.name}'s acquisition teams on the coast road: two convoys lost this month, drivers and cargo. Your acquisition director wants to know what you want done.`,
    options: [
      { id: "arm", label: "Arm the convoys", note: "¤8,000 from the treasury",
        resolve: (s) => { s.corp!.cash -= 8000; return `The next convoy goes out with twelve armed guards and a machine gun on the lead truck. The raiders take one look and let it pass. Nobody touches ${s.corp!.name}'s convoys again.`; } },
      { id: "hit", label: "Raid them back", note: "risky, profitable",
        resolve: (s) => { const win = s.arcology.security > 50; if (win) { s.corp!.cash += 12000; return `Your people hit their holding pens on a moonless night and come back with forty of their stock and their ledgers. The rival company is out of business within the month.`; } s.corp!.cash -= 6000; return `It goes wrong. Your people walk into an ambush on the docks. You lose six men and a truck, and the rival company posts the footage.`; } },
      { id: "pay", label: "Pay them to stop", note: "¤5,000",
        resolve: (s) => { s.corp!.cash -= 5000; return `You pay. The raids stop. Everyone on the coast now knows ${s.corp!.name} pays.`; } },
    ],
  },
];

// A company that no longer exists has nothing to decide.
for (const e of CORP_EVENTS) for (const o of e.options) { const run = o.resolve; o.resolve = (s, ev, p) => (s.corp ? run(s, ev, p) : "The corporation was wound up before this could be dealt with, so there is nothing left to decide about it."); }
registerEvents(CORP_EVENTS);
