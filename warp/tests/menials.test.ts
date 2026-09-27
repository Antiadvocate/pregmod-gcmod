import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { worldOf } from "../src/engine/world.ts";
import { cultureBrief } from "../src/engine/culture.ts";
import { buyMenials, sellMenials, setJob, menialsOf, menialPrice, cityDemand, slavePopulation, idle, constructionDiscount } from "../src/engine/menials.ts";
import { nextCost } from "../src/engine/works.ts";

{
  const s = newGame({ seed: "menials-buy" });
  s.arcology.cash = 2_000_000;
  const m = menialsOf(s);
  check("the city starts with slaves of its own", m.city > 0 && slavePopulation(s) > m.city, { city: m.city, all: slavePopulation(s) });
  const p = menialPrice(s);
  buyMenials(s, 500);
  check("menials are bought in bulk at the market price", m.owned === 500 && s.arcology.cash === 2_000_000 - 500 * p);
  worldOf(s).regions.delta.state = "war"; worldOf(s).regions.cape.state = "collapse";
  check("wars abroad make them cheaper", menialPrice(s) < p);
  setJob(s, "farms", 200); setJob(s, "labour", 200); setJob(s, "construction", 100);
  setJob(s, "sanitation", 999);
  check("you can't assign more than you own", menialsOf(s).jobs.sanitation === 0 && idle(menialsOf(s)) === 0);
  check("construction crews make public works cheaper", constructionDiscount(s) === 0.05 && nextCost(s, "hydroponics") === Math.round(18000 * 0.95 / 100) * 100);
}

{
  // Side by side: menials on the farms feed the city; on labour they pay; they cost upkeep and wear out.
  const a = newGame({ seed: "menials-week" }), b = newGame({ seed: "menials-week" });
  b.arcology.cash = a.arcology.cash + 1_000_000; buyMenials(b, 1000);
  setJob(b, "farms", 400); setJob(b, "labour", 400); setJob(b, "lease", 200);
  b.arcology.cash = a.arcology.cash;
  const rb = endWeek(b); endWeek(a);
  const cat = (r: typeof rb, c: string) => r.ledger.filter((l) => l.category === c).reduce((n, l) => n + l.cash, 0);
  check("labour and leases pay, upkeep costs", rb.ledger.some((l) => /menials on labour/.test(l.label) && l.cash > 0) && rb.ledger.some((l) => /leased to citizens/.test(l.label)) && rb.ledger.some((l) => /upkeep for .* menials/.test(l.label) && l.cash < 0), cat(rb, "menials"));
  check("some wear out", menialsOf(b).owned < 1000 && menialsOf(b).owned > 980, menialsOf(b).owned);
  check("and the narrator knows slaves are everywhere", /Slaves everywhere: .* the owner keeps .* numbered menials/.test(cultureBrief(b)), cultureBrief(b));
}

{
  const s = newGame({ seed: "menials-sell" });
  s.arcology.cash = 1_000_000;
  const m = menialsOf(s);
  m.city = 0;
  buyMenials(s, 50);
  const want = cityDemand(s);
  const cash = s.arcology.cash;
  sellMenials(s, 50);
  check("idle menials sell to citizens who want them, at full price", m.owned === 0 && m.city === Math.min(50, want) && s.arcology.cash > cash, { city: m.city, want });
  const before = m.city;
  endWeek(s);
  check("the citizens' slaves drift toward what households want", Math.abs(menialsOf(s).city - cityDemand(s)) < Math.abs(before - cityDemand(s)) || menialsOf(s).city === cityDemand(s));
}

{
  // Compare counts the real slaves per household in your city.
  const { societies, household } = await import("../src/engine/compare.ts");
  const s = newGame({ seed: "menials-compare" });
  s.arcology.cash = 5_000_000;
  const m = menialsOf(s);
  m.city = 0;
  check("no slaves in the city: households have none", household(societies(s)[0]).slaves === 0 && !household(societies(s)[0]).slave);
  buyMenials(s, Math.round(s.arcology.population / 3) * 3); setJob(s, "lease", m.owned);
  check("lease three a household and they have three", household(societies(s)[0]).slaves === 3, household(societies(s)[0]).slaves);
}
