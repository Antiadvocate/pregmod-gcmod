/**
 * ENVOYS — a power's hand only comes out when it measures up, and not again soon after a no.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { empireOf, powers, tickPowers, forces } from "../src/engine/power.ts";
import { tickRegion, regionOf, knownWord } from "../src/engine/region.ts";
import { PROGRAMS } from "../src/data/arsenal.ts";
import { fireEvent } from "../src/engine/events.ts";
import { resolveAny } from "../src/engine/living.ts";

const s = newGame({ seed: "envoys", starting_slaves: 2, plot: false } as never);
s.business_events = "on";
const e = empireOf(s);
// A very big army: everyone is small next to you.
const gun = PROGRAMS.filter((p) => p.power > 0).sort((a, b) => b.power - a.power)[0];
e.arsenal[gun.id] = 400;
for (const p of powers(s)) e.powers[p.id].attitude = 0;
const big = forces(s).total;
check("you're far bigger than anyone on the map", powers(s).every((p) => p.strength * 1.3 < big), big);
let fees = 0, asks = 0;
for (let w = 0; w < 60; w++) {
  s.arcology.week++;
  for (const p of powers(s)) e.powers[p.id].attitude = 0;
  tickPowers(s);
  tickRegion(s, true);
  fees += s.events.filter((x) => x.kind === "envoy_demand").length;
  asks += s.events.filter((x) => x.kind === "protection_ask").length;
  s.events = [];
}
check("nobody small holds their hand out to you", fees === 0, fees);
check("they come asking for your protection instead", asks > 0, asks);

// A new owner is nobody: no one far away comes knocking in the first weeks.
{
  const n = newGame({ seed: "envoys-new", starting_slaves: 2, plot: false } as never);
  n.business_events = "on";
  let came = 0;
  for (let w = 0; w < 6; w++) { n.arcology.week++; tickPowers(n); tickRegion(n, true); came += n.events.filter((x) => empireOf(n).about[x.kind] && powers(n).find((p) => p.id === empireOf(n).about[x.kind])?.kind !== "neighbour").length; n.events = []; }
  check("far-off powers haven't heard of a new owner", came === 0, came);
  check("and say so", powers(n).filter((p) => p.kind === "region").every((p) => knownWord(p.rec.known) === "never heard of you"));
  check("what comes has a reason", regionOf(n).openings.every((o) => o.why.length > 10));
}

// An equal who's thrown out doesn't come back for a long time.
const t = newGame({ seed: "envoys-2", starting_slaves: 2, plot: false } as never);
t.business_events = "on";
const te = empireOf(t);
const them = powers(t)[0];
te.about["envoy_demand"] = them.id;
const ev = fireEvent(t, "envoy_demand");
if (ev) resolveAny(t, ev, "refuse");
check("throwing her out keeps them away for months", (te.powers[them.id].no_fee_until ?? 0) >= t.arcology.week + 30, te.powers[them.id].no_fee_until);
