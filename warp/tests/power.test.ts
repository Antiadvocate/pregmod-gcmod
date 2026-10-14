/**
 * POWER — your own skills, your arsenal, war, and the other powers.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { buyTraining, skill, tickTraining, trainingCost } from "../src/engine/player.ts";
import { militaryStrength } from "../src/engine/city.ts";

{
  const s = newGame({ seed: "skills", starting_slaves: 2 } as never);
  s.arcology.cash = 10_000_000;
  const before = s.player.skills.command ?? 0;
  const str0 = militaryStrength(s);
  const r = buyTraining(s, "command", "implant");
  check("an implant raises a skill today", r.ok && (s.player.skills.command ?? 0) > before + 10, r);
  check("and command makes your forces stronger", militaryStrength(s) > str0, [str0, militaryStrength(s)]);
  check("the dearer the better you are", trainingCost(s, "command", "tutor") > trainingCost(s, "medicine", "tutor") || (s.player.skills.medicine ?? 0) > (s.player.skills.command ?? 0));

  const d0 = s.player.skills.diplomacy ?? 0;
  check("a course takes weeks", buyTraining(s, "diplomacy", "course").ok && !!s.player.training);
  check("and only one at a time", !buyTraining(s, "hacking", "tutor").ok);
  for (let i = 0; i < 4; i++) tickTraining(s);
  check("then it's done, and you're better", !s.player.training && (s.player.skills.diplomacy ?? 0) > d0 + 10, s.player.skills.diplomacy);
  check("diplomacy warms the neighbours", skill.diplomacy(s) > 0);
  endWeek(s);
}

import { build, canBuild, empireOf, forces, makeMove, powers, dominion, tickPowers } from "../src/engine/power.ts";
import { declareWar, tickWars, activeWars, suePeace, strike } from "../src/engine/war.ts";
import { EVENT_BY_ID, resolveEvent } from "../src/engine/events.ts";
{
  const s = newGame({ seed: "arsenal", starting_slaves: 2 } as never);
  s.arcology.cash = 50_000_000;
  check("fighters need an airport", !!canBuild(s, "fighters"));
  check("drones don't", build(s, "drones").ok);
  build(s, "airport");
  for (let i = 0; i < 6; i++) tickPowers(s);
  check("a program is ready after its weeks", (empireOf(s).arsenal.airport ?? 0) === 1 && (empireOf(s).arsenal.drones ?? 0) === 1, empireOf(s).arsenal);
  const f0 = forces(s).total;
  check("then fighters can be bought", build(s, "fighters").ok);
  for (let i = 0; i < 6; i++) tickPowers(s);
  check("and they add to your strength", forces(s).total > f0 + 20, [f0, forces(s).total]);

  const ps = powers(s);
  check("the world is full of powers", ps.some((p) => p.kind === "neighbour") && ps.some((p) => p.kind === "freecity") && ps.some((p) => p.kind === "region"), ps.map((p) => p.kind));
  const n = ps.find((p) => p.kind === "neighbour")!;
  const a0 = n.attitude;
  check("an envoy warms them", makeMove(s, n.id, "envoy").ok && powers(s).find((p) => p.id === n.id)!.attitude > a0);

  // War with the weakest, and enough to win it.
  const target = [...ps].sort((a, b) => a.strength - b.strength)[0];
  for (const id of ["armour", "armour", "armour", "batteries", "batteries", "patrol", "patrol"]) if (!canBuild(s, id)) build(s, id);
  for (let i = 0; i < 4; i++) tickPowers(s);
  declareWar(s, target.id);
  check("war is declared", activeWars(s).length === 1);
  check("a strike moves the front", /front moves/.test(strike(s, activeWars(s)[0].id)));
  let weeks = 0;
  while (activeWars(s).length && weeks < 30) { tickWars(s); weeks++; }
  check("a much stronger power wins its war", empireOf(s).wars[0].ended?.result === "won", [weeks, empireOf(s).wars[0]]);
  const v = s.events.find((e) => e.kind === "victory");
  check("and is asked what to do with it", !!v);
  if (v) resolveEvent(s, v, "annex");
  check("annexed, it's yours, and pays", powers(s).find((p) => p.id === target.id)?.rec.status === "conquered" || !s.arcology.neighbours.some((x) => x.id === target.id));
  check("and the world is a little more yours", dominion(s).share > 0, dominion(s));

  // Peace when it's even.
  const other = powers(s).find((p) => p.rec.status === "free")!;
  declareWar(s, other.id);
  check("you can sue for peace", /peace|Peace|reparations/.test(suePeace(s, activeWars(s)[0].id)) && activeWars(s).length === 0);
  check("the events of war are all there", ["victory", "defeat", "war_bombing", "war_hostage", "insurgency", "world_dictator", "assassins", "terror", "sabotage", "alliance_offer"].every((k) => !!EVENT_BY_ID[k]));
  for (let i = 0; i < 4; i++) endWeek(s);
}

import { eraOf } from "../src/lib/iso.ts";
{
  const d = (kind: string, level: number, condition: number) => ({ id: "x", kind, ring: 2, slot: 0, level, condition, owner: "you" }) as never;
  check("empty ground is a ruin", eraOf(d("vacant", 0, 0), "rebuilt", 0) === "ruin");
  check("a run-down block is salvage", eraOf(d("residential", 2, 20), "rebuilt", 0) === "salvage");
  check("a kept one is Free City", eraOf(d("residential", 2, 70), "rebuilt", 0) === "freecity");
  check("a tall one is ascendant", eraOf(d("residential", 4, 70), "rebuilt", 0) === "ascendant");
  check("grit keeps the salvage longer", eraOf(d("residential", 2, 45), "grit", 0) === "salvage" && eraOf(d("residential", 2, 45), "rebuilt", 0) === "freecity");
  check("gleaming builds glass sooner", eraOf(d("commercial", 2, 70), "gleaming", 0) === "ascendant");
}

{
  // A rich, armed owner, sixty weeks, wars and all: nothing throws, and the new events can come up.
  const s = newGame({ seed: "empire-run", starting_slaves: 4 } as never);
  s.arcology.cash = 30_000_000;
  s.models.tension = 8;
  for (const id of ["airport", "drones", "drones", "batteries", "intel", "launch", "media"]) build(s, id);
  let threw: unknown = null, wars = 0;
  try {
    for (let w = 0; w < 60; w++) {
      if (w === 10) { const t = powers(s).sort((a, b) => a.strength - b.strength)[0]; declareWar(s, t.id); wars++; }
      if (w === 30) { const t = powers(s).find((p) => p.kind === "freecity"); if (t) { declareWar(s, t.id); wars++; } }
      endWeek(s);
      // Answer whatever is waiting, the first option each time.
      for (const e of [...s.events]) { const o = EVENT_BY_ID[e.kind]?.options[0]; if (o) resolveEvent(s, e, o.id); }
    }
  } catch (e) { threw = e; }
  check("sixty weeks of empire run without throwing", !threw, threw);
  check("and the wars were fought", empireOf(s).wars.length >= wars && wars > 0);
  check("billionaire events exist for a billionaire", EVENT_BY_ID.gx_crash.candidates(s).length > 0 && EVENT_BY_ID.gx_space.candidates(s).length >= 0);
}
