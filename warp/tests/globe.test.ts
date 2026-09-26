import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { worldOf } from "../src/engine/world.ts";
import { places, homeOf, distanceKm, reachKm, conflicts, canInvolve, involve, startResearch, canResearch, globeOf, energyMix, canVisit, startVisit, resolveVisit, VISIT_EFFECTS } from "../src/engine/globe.ts";

const game = (seed: string) => newGame({ seed });

{
  const s = game("globe-places");
  const ps = places(s);
  const home = ps.find((p) => p.kind === "yours")!;
  check("your arcology sits in its own sea", home.at[0] === homeOf(s)[0] && distanceKm(home.at, homeOf(s)) < 1);
  check("neighbours are a few hundred km off, and cover an area", ps.filter((p) => p.kind === "neighbour").every((p) => p.km > 150 && p.km < 800 && p.radiusKm > 30), ps.filter((p) => p.kind === "neighbour").map((p) => p.km));
  check("the six Old World regions are on the map", ps.filter((p) => p.kind === "region").length === 6);
  check("Free Cities further off", ps.filter((p) => p.kind === "freecity").length >= 8);
  const before = reachKm(s);
  s.arcology.neighbours[0].ownership = 60;
  check("owning a neighbour widens your reach", reachKm(s) > before);
}

{
  const s = game("globe-wars");
  const w = worldOf(s);
  w.regions.delta.stability = 18; w.regions.delta.state = "war";
  check("a region at war is a conflict", conflicts(s).some((c) => c.id === "delta" && c.state === "war"));
  s.arcology.cash = 50000;
  const st0 = w.regions.delta.stability;
  const line = involve(s, "delta", "fund_peace");
  check("funding a peace costs, and steadies it", /ceasefire/.test(line) && s.arcology.cash === 35000 && w.regions.delta.stability === st0 + 15, line);
  check("one move per region every four weeks", canInvolve(s, "delta", "refugees") !== null);
  s.arcology.week += 4;
  const owned = Object.values(s.people).filter((p) => p.status === "owned").length;
  involve(s, "delta", "captives");
  check("war captives come home as slaves", Object.values(s.people).filter((p) => p.status === "owned").length === owned + 1);
  check("mercenaries need hiring first", canInvolve(s, "cape", "send_mercs") !== null);
}

{
  const s = game("globe-research");
  s.arcology.cash = 500000;
  check("fusion needs solar first", /needs Solar skin/.test(canResearch(s, "fusion") ?? ""));
  startResearch(s, "solar_skin");
  startResearch(s, "carbon_capture");
  check("research is paid up front", s.arcology.cash === 500000 - 30000 - 60000);
  for (let i = 0; i < 7; i++) endWeek(s);
  check("research finishes", !!globeOf(s).tech.solar_skin.done && !!globeOf(s).tech.carbon_capture.done, globeOf(s).tech);
  check("and the energy mix changes", energyMix(s).solar === 30 && energyMix(s).fossil === 70);
  const strain = worldOf(s).strain;
  for (let i = 0; i < 4; i++) endWeek(s);
  check("carbon capture turns the climate around", worldOf(s).strain < strain, { before: strain, after: worldOf(s).strain });
}

{
  const s = game("globe-visit");
  s.arcology.cash = 50000;
  const p = places(s).find((x) => x.kind === "freecity")!;
  check("you can't visit home", canVisit(s, places(s)[0]) !== null);
  await startVisit(s, p);
  const v = globeOf(s).visit!;
  check("a visit without a narrator is the game's own", v.by === "game" && v.options.length >= 2 && v.options.every((o) => o.effects.every((e) => VISIT_EFFECTS[e.effect])), v);
  check("one trip a week", canVisit(s, places(s).find((x) => x.kind === "region")!) !== null);
  const cash = s.arcology.cash;
  const out = resolveVisit(s, v.options[0].id);
  check("choosing resolves it once", !!out && resolveVisit(s, v.options[0].id) === "" && (s.arcology.cash !== cash || v.options[0].effects.every((e) => e.effect !== "cash" && e.effect !== "slave" && e.effect !== "ownership")), out);
}
