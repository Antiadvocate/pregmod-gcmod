/**
 * MENIAL SLAVES — the bulk of the arcology's slaves, who have numbers instead of names.
 *
 * Two populations:
 *
 *   yours      menials you own, bought and sold by the hundred at a market price that moves with
 *              the economy and with the wars (a war in a trade region floods the market). You put
 *              them to work in bulk: labour for cash, the farms for food, sanitation against the
 *              pollution, leased out to citizen households, public use, and construction crews
 *              that make public works cheaper. They eat, they cost upkeep, and they wear out:
 *              how fast depends on how you treat them, and so does how much they produce.
 *
 *   the city's the slaves your citizens own. A household wants as many as it can afford and the
 *              city's habits allow (prosperity up, personhood down), and the city's slave
 *              population drifts toward that every week through the trade. Selling or leasing
 *              menials to citizens fills it faster, and pays.
 *
 * Nobody here is drawn or named; the household (engine/people) is where named slaves live.
 */
import type { SaveState } from "./types";
import type { Ledger } from "./economy";
import { clamp } from "./psyche";
import { priceFactor } from "./run";
import { pushNorm, cultureOf } from "./culture";

export type MenialJob = "labour" | "farms" | "sanitation" | "lease" | "public" | "construction";
export type Treatment = "harsh" | "standard" | "decent";

export interface Menials {
  owned: number;
  /** Move menials onto the farms each week when the city would otherwise go hungry. On unless turned off. */
  autofeed?: boolean;
  jobs: Record<MenialJob, number>;
  treatment: Treatment;
  /** Slaves your citizens own. */
  city: number;
  last?: { week: number; lost: number; cash: number; food: number; lines: string[] };
}

export const JOBS: Record<MenialJob, { name: string; each: string }> = {
  labour: { name: "Labour", each: "about ¤40 a week each, more in a richer city" },
  farms: { name: "The farms", each: "14 food a week each" },
  sanitation: { name: "Sanitation", each: "pollution down 0.03 a week each (up to 6), the city a little richer" },
  lease: { name: "Leased to citizens", each: "¤22 a week each; they serve citizen households" },
  public: { name: "Public use", each: "reputation, and the city a little more open" },
  construction: { name: "Construction crews", each: "public works 1% cheaper per 20 (up to 30%)" },
};
export const JOB_IDS = Object.keys(JOBS) as MenialJob[];

export const TREATMENT: Record<Treatment, { name: string; upkeep: number; output: number; attrition: number; note: string }> = {
  harsh: { name: "Harsh", upkeep: 6, output: 1.2, attrition: 0.012, note: "cheap and productive; about 1 in 80 lost a week; the city gets crueller" },
  standard: { name: "Standard", upkeep: 12, output: 1, attrition: 0.005, note: "about 1 in 200 lost a week" },
  decent: { name: "Decent", upkeep: 22, output: 0.9, attrition: 0.002, note: "costly; about 1 in 500 lost a week; the city sees slaves as people a little more" },
};

const EMPTY_JOBS = (): Record<MenialJob, number> => ({ labour: 0, farms: 0, sanitation: 0, lease: 0, public: 0, construction: 0 });

export function menialsOf(s: SaveState): Menials {
  const m = (s.menials ??= { owned: 0, jobs: EMPTY_JOBS(), treatment: "standard", city: Math.round(cityDemand(s) * 0.8) });
  for (const j of JOB_IDS) m.jobs[j] ??= 0;
  return m;
}
export const assigned = (m: Menials) => JOB_IDS.reduce((n, j) => n + m.jobs[j], 0);
export const idle = (m: Menials) => Math.max(0, m.owned - assigned(m));

/* ── the market ──────────────────────────────────────────────────────────────────────────────── */

/** What one menial costs this week. Wars and collapses abroad flood the market. */
export function menialPrice(s: SaveState): number {
  const troubled = Object.values(s.world?.regions ?? {}).filter((r) => r.state === "war" || r.state === "collapse").length;
  return Math.round((900 * priceFactor(s) * Math.max(0.55, 1 - troubled * 0.12)) / 10) * 10;
}

export function buyMenials(s: SaveState, n: number): string {
  const m = menialsOf(s);
  const k = Math.max(0, Math.floor(n));
  const cost = k * menialPrice(s);
  if (!k || s.arcology.cash < cost) return "";
  s.arcology.cash -= cost;
  m.owned += k;
  return `${k.toLocaleString()} menial slave${k === 1 ? "" : "s"} arrive at the docks in a container, numbered on the wrist (−¤${cost.toLocaleString()}).`;
}

/** Sell idle menials: to citizens while they want more (at full price), then back to the trade at 70%. */
export function sellMenials(s: SaveState, n: number): string {
  const m = menialsOf(s);
  const k = Math.min(idle(m), Math.max(0, Math.floor(n)));
  if (!k) return "";
  const p = menialPrice(s);
  const toCitizens = Math.min(k, Math.max(0, cityDemand(s) - m.city - m.jobs.lease));
  const rest = k - toCitizens;
  const cash = toCitizens * p + Math.round(rest * p * 0.7);
  m.owned -= k; m.city += toCitizens; s.arcology.cash += cash;
  return `${k.toLocaleString()} sold: ${toCitizens ? `${toCitizens.toLocaleString()} to citizen households at ¤${p}` : ""}${toCitizens && rest ? ", " : ""}${rest ? `${rest.toLocaleString()} back to the trade at ¤${Math.round(p * 0.7)}` : ""} (+¤${cash.toLocaleString()}).`;
}

export function setJob(s: SaveState, job: MenialJob, n: number): void {
  const m = menialsOf(s);
  const others = assigned(m) - m.jobs[job];
  m.jobs[job] = clamp(Math.floor(n), 0, Math.max(0, m.owned - others));
}

/* ── the city's slaves ───────────────────────────────────────────────────────────────────────── */

/** Citizen households: about three citizens to one. */
export const households = (s: SaveState) => Math.max(1, Math.round(s.arcology.population / 3));

/** How many slaves a citizen household wants, from what it can afford and what the city thinks of slaves. */
export function wantPerHousehold(s: SaveState): number {
  const n = cultureOf(s).norms;
  return clamp(s.arcology.prosperity / 45 - n.personhood / 50 + (n.cruelty > 30 ? 0.5 : 0), 0, 5);
}
export const cityDemand = (s: SaveState) => Math.round(households(s) * wantPerHousehold(s));

/** Slaves serving citizen households: their own, and yours on lease. */
export const servingCitizens = (s: SaveState) => { const m = menialsOf(s); return m.city + m.jobs.lease; };
export const perHousehold = (s: SaveState) => servingCitizens(s) / households(s);
/** Every slave in the arcology: your household, your menials, and the citizens'. */
export function slavePopulation(s: SaveState): number {
  const m = menialsOf(s);
  const named = Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured").length;
  return named + m.owned + m.city;
}

/* ── the week ────────────────────────────────────────────────────────────────────────────────── */

/** Public works are cheaper with crews on them. Read by engine/works. */
export const constructionDiscount = (s: SaveState) => clamp((s.menials?.jobs.construction ?? 0) / 20 / 100, 0, 0.3);
/** What the whole city eats in a week: citizens, your household, your menials. */
export const foodEats = (s: SaveState) => Math.round(s.arcology.population * 0.12 + Object.keys(s.people).length * 4 + (s.menials?.owned ?? 0) * 2);
/** Menials eat. Read by engine/economy. */
export const menialFood = (s: SaveState) => (s.menials?.owned ?? 0) * 2;

export function tickMenials(s: SaveState, led: Ledger, resist = 0): string[] {
  const m = menialsOf(s);
  const a = s.arcology;
  const t = TREATMENT[m.treatment];
  const lines: string[] = [];
  let cash = 0;
  if (m.owned > 0 && m.autofeed !== false) {
    // Keep the city fed: if what's grown this week won't cover what's eaten, put menials on the
    // farms: idle ones first, then from labour, public use and sanitation. They eat 2 and grow 14.
    const eats = foodEats(s);
    const per = 14 * t.output;
    let short = eats - (a.food.production + m.jobs.farms * per) - Math.max(0, a.food.stores - eats) ;
    if (short > 0) {
      let need = Math.ceil(short / per);
      const moved: string[] = [];
      const take = (from: "idle" | MenialJob) => {
        const have = from === "idle" ? idle(m) : m.jobs[from];
        const k = Math.min(have, need);
        if (!k) return;
        if (from !== "idle") m.jobs[from] -= k;
        m.jobs.farms += k; need -= k;
        moved.push(`${k.toLocaleString()} from ${from === "idle" ? "the idle" : JOBS[from].name.toLowerCase()}`);
      };
      for (const f of ["idle", "labour", "public", "sanitation"] as const) if (need > 0) take(f);
      if (moved.length) lines.push(`To keep the city fed, ${moved.join(", ")} went to the farms.`);
    }
  }
  if (m.owned > 0) {
    const out = t.output;
    const labour = Math.round(m.jobs.labour * 40 * clamp(a.prosperity / 60, 0.5, 2) * out);
    const lease = Math.round(m.jobs.lease * 22 * out);
    if (labour) led.earn("menials", `${m.jobs.labour.toLocaleString()} menials on labour`, labour);
    if (lease) led.earn("menials", `${m.jobs.lease.toLocaleString()} menials leased to citizens`, lease);
    const food = Math.round(m.jobs.farms * 14 * out);
    a.food.production += food;
    if (m.jobs.sanitation && s.world) s.world.pollution = clamp(s.world.pollution - Math.min(6, m.jobs.sanitation * 0.03 * out), 0, 100);
    a.prosperity = clamp(a.prosperity + Math.min(1.5, m.jobs.sanitation * 0.002 + m.jobs.public * 0.001), 5, 200);
    if (m.jobs.public) { led.entry("menials", `${m.jobs.public.toLocaleString()} menials in public use`, 0, Math.round(m.jobs.public * 0.25 * out)); pushNorm(s, "exposure", Math.min(1, m.jobs.public * 0.01), "your menials in public use"); }
    const upkeep = m.owned * t.upkeep;
    led.spend("menials", `upkeep for ${m.owned.toLocaleString()} menials (${t.name.toLowerCase()})`, upkeep);
    cash = labour + lease - upkeep;
    // They wear out. Engineered resistance keeps more of them alive.
    const lost = Math.min(m.owned, Math.round(m.owned * t.attrition * (1 - resist * 0.6) + (m.treatment === "harsh" && m.owned > 0 ? 0.5 : 0)));
    if (lost) {
      m.owned -= lost;
      let take = Math.max(0, lost - idle({ ...m, owned: m.owned + lost }));
      for (const j of JOB_IDS) { if (!take) break; const k = Math.min(m.jobs[j], Math.ceil((take * m.jobs[j]) / Math.max(1, assigned(m)))); m.jobs[j] -= k; take -= k; }
      lines.push(`${lost.toLocaleString()} of your menial slaves ${m.treatment === "harsh" ? "were worked to death or broke down" : "died, ran or were too sick to work"} this week.`);
    }
    if (m.owned > 100 && m.treatment === "harsh") pushNorm(s, "cruelty", 0.3, "how your menials are worked");
    if (m.owned > 100 && m.treatment === "decent") pushNorm(s, "personhood", 0.2, "how decently your menials are kept");
    m.last = { week: a.week, lost, cash, food, lines };
  }
  // The citizens' own slaves follow what households want, less what you lease them.
  const gap = cityDemand(s) - m.jobs.lease - m.city;
  m.city = Math.max(0, Math.round(m.city + gap * 0.08));
  return lines;
}

/** For every narrator: slaves are everywhere, not only in the owner's household. */
export function slavesBrief(s: SaveState): string {
  const m = s.menials;
  if (!m) return "";
  const per = perHousehold(s);
  const busiest = JOB_IDS.filter((j) => m.jobs[j] > 0).sort((a, b) => m.jobs[b] - m.jobs[a]).slice(0, 2).map((j) => JOBS[j].name.toLowerCase());
  return `· Slaves everywhere: ${servingCitizens(s).toLocaleString()} slaves serve citizen households (${per.toFixed(1)} a household)${m.owned ? `; the owner keeps ${m.owned.toLocaleString()} numbered menials${busiest.length ? `, mostly on ${busiest.join(" and ")}` : ""}, kept ${m.treatment === "harsh" ? "harshly" : m.treatment === "decent" ? "decently" : "in the ordinary way"}` : ""}.`;
}
