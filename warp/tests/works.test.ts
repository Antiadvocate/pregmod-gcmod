import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { worldOf } from "../src/engine/world.ts";
import { cityYield } from "../src/engine/city.ts";
import { build, emergency, emergencyPreview, foodCap, levelOf, nextCost, industryPollutionFactor } from "../src/engine/works.ts";

{
  // Food: towers grow it the same week, and the stores can be made bigger.
  const a = newGame({ seed: "works-food" }), b = newGame({ seed: "works-food" });
  a.arcology.cash = b.arcology.cash = 500000;
  build(b, "hydroponics"); build(b, "hydroponics");
  a.arcology.cash = b.arcology.cash;
  const ra = endWeek(a), rb = endWeek(b);
  check("hydroponic towers fill the stores", b.arcology.food.stores >= a.arcology.food.stores + 250, { without: a.arcology.food.stores, with: b.arcology.food.stores });
  check("and their upkeep is on the ledger", rb.ledger.some((l) => l.category === "public works" && /Hydroponic towers \(level 2\)/.test(l.label) && l.cash === -500) && !ra.ledger.some((l) => l.category === "public works"));
  const cap = foodCap(b);
  build(b, "granary");
  check("cold stores hold more", foodCap(b) === cap + 4000);
  check("each level costs more than the last", nextCost(b, "hydroponics") > 18000 * 1.45 && levelOf(b, "hydroponics") === 2);
}

{
  // Pollution: scrubbers take it down every week; retrofits cut what industry makes.
  const s = newGame({ seed: "works-air" });
  s.arcology.cash = 500000;
  worldOf(s).pollution = 60;
  for (let i = 0; i < 3; i++) build(s, "scrubbers");
  endWeek(s);
  check("scrubber towers clean the air", worldOf(s).pollution < 60 * 0.9 - 5, worldOf(s).pollution);
  for (let i = 0; i < 10; i++) build(s, "clean_industry");
  check("retrofits cut industry's pollution, down to a quarter", industryPollutionFactor(s) === 0.25);
}

{
  // Crime, housing, and the emergency spends.
  const s = newGame({ seed: "works-misc" });
  s.arcology.cash = 500000;
  const room = 400 + cityYield(s).housing;
  build(s, "housing");
  check("prefab housing raises the ceiling", 400 + cityYield(s).housing === room + 150);
  s.arcology.crime = 50;
  const cash = s.arcology.cash;
  const line = emergency(s, "surge", 8000);
  check("a police surge buys crime down by the ¤800 point", s.arcology.crime === 40 && s.arcology.cash === cash - 8000, line);
  s.arcology.food.stores = foodCap(s) - 100;
  check("a stockpile stops at what the stores can hold", emergencyPreview(s, "food", 1_000_000).units === 100);
  worldOf(s).pollution = 30;
  emergency(s, "cleanup", 1_000_000);
  check("a big enough cleanup clears the air completely, and charges only for what it did", worldOf(s).pollution === 0);
  s.arcology.cash = 100;
  check("no money, no spend", emergency(s, "handouts", 50000).startsWith("You have"));
}

{
  // The research farms feed every week, not once: set beside the same game without them.
  const { globeOf } = await import("../src/engine/globe.ts");
  const a = newGame({ seed: "works-vfarms" }), b = newGame({ seed: "works-vfarms" });
  globeOf(b).tech.vertical_farms = { done: 1 };
  const bought = (r: ReturnType<typeof endWeek>) => -r.ledger.filter((l) => l.category === "food").reduce((n, l) => n + l.cash, 0) / 8;
  for (let i = 0; i < 3; i++) {
    const ra = endWeek(a), rb = endWeek(b);
    const fed = (b.arcology.food.stores - a.arcology.food.stores) + (bought(ra) - bought(rb));
    check(`vertical farms feed in week ${i + 1} too`, fed >= 60 * (i + 1) - 1, fed);
  }
}
