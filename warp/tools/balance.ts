/**
 * THE BALANCE PROBE — a year of an arcology, printed as a ledger.
 *
 *   npm run balance
 *
 * Both of the economy's real bugs were found here rather than in play: the food model billing the
 * owner for the entire citizen population (insolvent by week five, dead by week twelve), and the
 * energy model draining every facility worker to zero and then spending their health. A sim you
 * cannot read a year of is a sim whose long game nobody has ever seen.
 */
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { assignToFacility } from "../src/engine/rules.ts";

const s = newGame({ seed: "balance", starting_slaves: 3 });
s.arcology.facilities["brothel"].level = 1; s.arcology.facilities["brothel"].capacity = 6;
const ids = Object.keys(s.people);
assignToFacility(s, s.people[ids[0]], "brothel");
assignToFacility(s, s.people[ids[1]], "brothel");
s.people[ids[2]].assignment = "whore";
for (let i = 0; i < 52; i++) {
  const r = endWeek(s);
  const cats = r.ledger.reduce((m, l) => { m[l.category] = (m[l.category] ?? 0) + l.cash; return m; }, {} as Record<string, number>);
  if (r.week % 13 === 0 || r.week === 1) console.log(`wk ${r.week}: cash ${Math.round(r.cash_end)} (${r.cash_end - r.cash_start >= 0 ? "+" : ""}${Math.round(r.cash_end - r.cash_start)}) food ${Math.round(s.arcology.food.stores)} | ` +
    Object.entries(cats).map(([k, v]) => `${k} ${Math.round(v)}`).join(" "));
}

console.log("\nafter a year:");
for (const p of Object.values(s.people)) {
  console.log(`  ${p.name.padEnd(10)} ${p.status.padEnd(9)} health ${String(Math.round(p.health.health)).padStart(4)} energy ${String(Math.round(p.health.energy)).padStart(3)} r ${p.psyche.relaxation.toFixed(1).padStart(5)} cap ${p.psyche.capacity.toFixed(1)} (born ${p.psyche.capacity_born.toFixed(1)}) dev ${String(p.bond.read.devotion).padStart(4)} fear ${Math.round(p.bond.fear)} bond ${Math.round(p.bond.bond)} · ${p.assignment}`);
}
console.log(`arcology: prosperity ${Math.round(s.arcology.prosperity)} rep ${Math.round(s.arcology.rep)} pop ${s.arcology.population} crime ${Math.round(s.arcology.crime)}`);
