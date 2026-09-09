/** A long campaign, run headless, watching for the things a test with a fixed scenario cannot see:
 *  NaNs, values off their declared range, people in impossible states, and anything that throws. */
declare const process: { exit(code: number): never; argv: string[] };
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { resolveAct } from "../src/engine/intimacy.ts";
import { ACTS } from "../src/data/intimacy.ts";
import { operate } from "../src/engine/surgery.ts";
import { PROCEDURES } from "../src/data/surgery.ts";
import { reversalOf, resolveChain, nextEvent, doGesture, GESTURES } from "../src/engine/reversal.ts";
import { resolveEvent } from "../src/engine/events.ts";
import { grantAsk, refuseAsk } from "../src/engine/asks.ts";
import { buy, sell } from "../src/engine/market.ts";
import { rng } from "../src/engine/rng.ts";
import { layersFor } from "../src/lib/vectorart.ts";
import { restingPose, frameAt } from "../src/lib/rig.ts";
import { read } from "../src/engine/obedience.ts";

const problems: string[] = [];
const seen = new Set<string>();
function flag(what: string) { if (!seen.has(what)) { seen.add(what); problems.push(what); } }

const WEEKS = Number(process.argv[2] ?? 150);
const s = newGame({ seed: "soak", starting_slaves: 4 });
s.arcology.cash = 400000;
s.arcology.facilities["surgery"] = { id: "surgery", kind: "surgery", name: "Surgical theatre", level: 2, upgrades: {}, capacity: 4, workers: [], decoration: 0, settings: {} };
s.content = { extreme: true };
const r = rng("soak");

const range = (label: string, v: unknown, lo: number, hi: number) => {
  if (typeof v !== "number" || !Number.isFinite(v)) flag(`${label} is not a finite number (${String(v)})`);
  else if (v < lo - 0.001 || v > hi + 0.001) flag(`${label} out of range: ${v} (expected ${lo}..${hi})`);
};

for (let week = 1; week <= WEEKS; week++) {
  const alive = Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");

  // Do things to people, the way a player would.
  for (const p of alive) {
    if (r.chance(0.5)) {
      const act = r.pick(ACTS);
      try { resolveAct(s, p, act.id); } catch (e) { flag(`resolveAct(${act.id}) threw: ${(e as Error).message}`); }
    }
    if (r.chance(0.04)) {
      const proc = r.pick(PROCEDURES);
      try { operate(s, p, proc.id); } catch (e) { flag(`operate(${proc.id}) threw: ${(e as Error).message}`); }
    }
    // The art has to survive whatever the body has become.
    try {
      const pose = restingPose(p);
      const ls = layersFor(p, pose);
      if (!ls.length) flag("layersFor produced nothing");
      const f = frameAt(p, pose, week * 1000);
      range("frame.chest.scale", f.chest.scale, 0.9, 1.1);
      range("frame.hips.rot", f.hips.rot, -30, 30);
    } catch (e) { flag(`art threw: ${(e as Error).message}`); }
  }

  // The chain.
  try {
    if (nextEvent(s) && reversalOf(s).pending) resolveChain(s, "hold");
    else if (r.chance(0.3)) doGesture(s, r.pick(GESTURES).id);
  } catch (e) { flag(`reversal threw: ${(e as Error).message}`); }

  // Pending events and asks.
  for (const e of [...s.events]) {
    try { resolveEvent(s, e, (e.options[0] ?? { id: "" }).id); } catch (err) { flag(`resolveEvent(${e.kind}) threw: ${(err as Error).message}`); }
  }
  for (const a of [...(s.asks ?? [])]) {
    try { r.chance(0.5) ? grantAsk(s, a) : refuseAsk(s, a, false); } catch (err) { flag(`ask threw: ${(err as Error).message}`); }
  }

  // Trade.
  // offers are keyed by market id, not a flat list — getting this wrong the first time meant the
  // soak never bought anybody and quietly proved nothing about the market at all.
  const stock = Object.values(s.market?.offers ?? {}).flat();
  if (r.chance(0.5) && stock.length) {
    try { buy(s, r.pick(stock)); } catch (e) { flag(`buy threw: ${(e as Error).message}`); }
  } else if (r.chance(0.1) && !stock.length) {
    flag(`the market had nothing on offer at week ${week}`);
  }
  if (r.chance(0.1) && alive.length > 2) {
    try { sell(s, r.pick(alive)); } catch (e) { flag(`sell threw: ${(e as Error).message}`); }
  }

  try { endWeek(s); } catch (e) { flag(`endWeek threw at week ${week}: ${(e as Error).message}`); break; }

  // Invariants, every week.
  range("arcology.cash", s.arcology.cash, -1e9, 1e12);
  range("arcology.prosperity", s.arcology.prosperity, 0, 200);
  range("arcology.crime", s.arcology.crime, 0, 100);
  range("arcology.rep", s.arcology.rep, 0, 1e9);
  range("deference", reversalOf(s).deference, 0, 100);

  for (const p of Object.values(s.people)) {
    if (p.status !== "owned" && p.status !== "indentured") continue;
    range(`${"psyche.relaxation"}`, p.psyche.relaxation, -10, 10);
    range("psyche.arousal", p.psyche.arousal, 0, 100);
    range("health.health", p.health.health, -100, 100);
    range("health.energy", p.health.energy, 0, 100);
    range("bond.bond", p.bond.bond, -100, 100);
    range("bond.fear", p.bond.fear, 0, 100);
    range("bond.resentment", p.bond.resentment, 0, 100);
    range("bond.hope", p.bond.hope, 0, 100);
    range("body.boobs", p.body.boobs, 0, 40000);
    range("body.weight", p.body.weight, -100, 200);
    if (p.body.dick !== null) range("body.dick", p.body.dick, 0, 20);
    if (p.body.vagina !== null) range("body.vagina", p.body.vagina, 0, 10);
    const rd = read(p, s.memory[p.id]);
    range("read.devotion", rd.devotion, -100, 100);
    range("read.trust", rd.trust, -100, 100);
    range("read.fragility", rd.fragility, 0, 1);
    if (p.age < 18) flag(`a person under 18 is owned: ${p.name} is ${p.age}`);
    if (p.facility && !s.arcology.facilities[p.facility]) flag(`${p.name} is in a facility that does not exist: ${p.facility}`);
  }

  // Facility rosters must agree with the people in them.
  for (const fac of Object.values(s.arcology.facilities)) {
    for (const id of fac.workers) {
      const p = s.people[id];
      if (!p) flag(`facility ${fac.id} lists a person who does not exist`);
      else if (p.facility !== fac.id) flag(`facility ${fac.id} lists ${p.name}, who thinks she is in ${p.facility ?? "no facility"}`);
      else if (p.status !== "owned" && p.status !== "indentured") flag(`facility ${fac.id} still lists ${p.name}, who is ${p.status}`);
    }
  }
}

const byExit: Record<string, number> = {};
for (const p of Object.values(s.people)) {
  const k = p.status === "owned" || p.status === "indentured" ? "still here" : `${p.status}${p.exit_note ? ` (${p.exit_note.split(" for ")[0]})` : ""}`;
  byExit[k] = (byExit[k] ?? 0) + 1;
}
console.log("where they went:", JSON.stringify(byExit));
const owned = Object.values(s.people).filter((p) => p.status === "owned").length;
console.log(`ran ${WEEKS} weeks · ${Object.keys(s.people).length} people ever · ${owned} still owned · cash ${Math.round(s.arcology.cash).toLocaleString()} · reports ${s.reports.length}`);
if (problems.length) {
  console.log(`\n${problems.length} PROBLEMS:`);
  for (const p of problems) console.log("  ·", p);
} else console.log("\nno invariant broken.");
process.exit(problems.length ? 1 : 0);
