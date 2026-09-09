/**
 * POLICY EFFECTS — the switch the policy table declares against.
 *
 * Everything here is one line per policy, on purpose. The moment a policy needs a paragraph it
 * stops being a policy and becomes a system, and it gets its own module and a `custom` effect —
 * which is the rule that keeps this file from turning into the thousand-line conditional that the
 * old game's `saPolicies` became.
 */
import type { SaveState, ReportLine } from "./types";
import { POLICY_BY_ID, POLICIES } from "../data/policies";
import { clamp } from "./psyche";
import { Ledger } from "./economy";
import { conflictsWith } from "../data/doctrines";

export function enact(s: SaveState, id: string): { ok: boolean; why?: string } {
  const p = POLICY_BY_ID[id];
  if (!p) return { ok: false, why: "no such policy" };
  if (s.arcology.policies[id]) return { ok: false, why: "already in force" };
  if (s.arcology.cash < p.cost) return { ok: false, why: "you cannot cover the cost" };
  const refuser = (p.refused_by ?? []).find((d) => (s.arcology.doctrines[d]?.adoption ?? 0) > 40);
  if (refuser) return { ok: false, why: `your citizens will not have it while ${refuser} is what they believe` };
  s.arcology.cash -= p.cost;
  s.arcology.policies[id] = 1;
  return { ok: true };
}

export function repeal(s: SaveState, id: string): void {
  delete s.arcology.policies[id];
}

/** Applied once a week, before the arcology's own money. Returns lines for the report. */
export function tickPolicies(s: SaveState, led: Ledger): ReportLine[] {
  const lines: ReportLine[] = [];
  const arc = s.arcology;
  const household = Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");

  for (const id of Object.keys(arc.policies)) {
    const p = POLICY_BY_ID[id];
    if (!p) continue;
    if (p.weekly) led.entry("policy", p.name, p.weekly);

    const a = p.effect.amount ?? 0;
    switch (p.effect.kind) {
      case "rep": led.entry("policy", p.name, 0, a * clamp(arc.population / 1000, 0.5, 3)); break;
      case "crime": arc.crime = clamp(arc.crime + a, 0, 100); break;
      case "prosperity": arc.prosperity = clamp(arc.prosperity + a, 0, 200); break;
      case "trade": led.earn("trade", `${p.name} — the volume it brings`, arc.prosperity * arc.population * 0.06 * a); break;
      case "household_hope":
        for (const person of household) person.bond.hope = clamp(person.bond.hope + a, 0, 100);
        break;
      case "household_fear":
        for (const person of household) person.bond.fear = clamp(person.bond.fear + a, 0, 100);
        break;
      case "household_health":
        for (const person of household) person.health.health = clamp(person.health.health + a, -100, 100);
        break;
      case "household_rest":
        for (const person of household) person.health.energy = clamp(person.health.energy + 12 * a, 0, 100);
        break;
      case "household_push":
        // Quotas: more work out of everyone, and everyone knows what happens if they miss.
        for (const person of household) {
          person.health.energy = clamp(person.health.energy - 8 * a, 0, 100);
          person.bond.fear = clamp(person.bond.fear + 2 * a, 0, 100);
          person.economics.income_last_week = Math.round(person.economics.income_last_week * (1 + 0.12 * a));
        }
        break;
    }
  }

  // A policy your citizens have come to hate is a policy that costs you standing every week.
  for (const p of POLICIES) {
    if (!arc.policies[p.id]) continue;
    const refuser = (p.refused_by ?? []).find((d) => (arc.doctrines[d]?.adoption ?? 0) > 60);
    if (refuser) {
      led.entry("policy", `${p.name} — against what your citizens now believe`, 0, -12);
      lines.push({ tone: "warning", weight: 6, text: `${p.name} is now at odds with your own doctrine. It is costing you standing every week it stays on the books.` });
    }
  }
  return lines;
}

/** Discount on market prices from the licensed-market policy. */
export function marketDiscount(s: SaveState): number {
  return s.arcology.policies["slave_market_licence"] ? 0.08 : 0;
}

export { POLICIES, POLICY_BY_ID, conflictsWith };
