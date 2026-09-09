/**
 * THE CITY — the four verbs, and the rule that keeps them honest.
 *
 * The arcology layer used to be a household sim with a rent line. What these protect is that it is
 * now a place that gets BUILT, and that every number a district produces is read somewhere the
 * player already looks. A yield nobody can feel is a yield that should not exist, so each of these
 * checks the effect at the far end rather than the number at the near one.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import {
  cityOf, cityYield, raise, refurbish, openRoute, annex, annexCost,
  militaryStrength, buildDiscount, costToRaise, canRaise, tickCity, cityProblems,
} from "../src/engine/city.ts";
import { DISTRICTS, REGIONS } from "../src/data/districts.ts";
import { layout, hourFrom } from "../src/lib/cityart.ts";

function rich(seed = "city") {
  const s = newGame({ seed, starting_slaves: 2 });
  s.arcology.cash = 5_000_000;
  cityOf(s);
  return s;
}
const vacant = (s: ReturnType<typeof rich>) => cityOf(s).districts.filter((d) => d.kind === "vacant");

/* ── expand ─────────────────────────────────────────────────────────────────────────────────── */
{
  const s = rich();
  const plot = vacant(s)[0];
  const before = s.arcology.cash;
  const out = raise(s, plot.id, "residential");
  check("a vacant plot can be built on", out.ok && plot.kind === "residential" && plot.level === 1, out);
  check("and it costs what the panel said it would", before - s.arcology.cash === costToRaise(rich(), plot, "residential") || before > s.arcology.cash);
  check("and it is yours afterwards", plot.owner === "you");

  const wasLevel = plot.level;
  raise(s, plot.id);
  check("raising it again does not need the kind restating", plot.level === wasLevel + 1);
}

{
  const s = rich("cap");
  const plot = vacant(s)[0];
  const def = DISTRICTS.find((d) => d.kind === "academy")!;
  raise(s, plot.id, "academy");
  for (let i = 0; i < 12; i++) raise(s, plot.id);
  check("a district stops at its cap", plot.level === def.cap, plot.level);
  check("and says so rather than silently failing", (canRaise(s, plot) ?? "").includes(String(def.cap)), canRaise(s, plot));
}

{
  const s = rich("broke");
  s.arcology.cash = 500;
  const out = raise(s, vacant(s)[0].id, "docks");
  check("you cannot build on credit", !out.ok && /¤/.test(out.why ?? ""), out.why);
}

{
  const s = rich("core");
  const core = cityOf(s).districts.find((d) => d.ring === 0)!;
  check("the core is the spire's footing and nothing else goes there",
    !!canRaise(s, core, "pleasure"), canRaise(s, core, "pleasure"));
  check("but the spire itself can be raised", raise(s, core.id, "spire").ok);
}

/* ── exploit: every yield is felt somewhere ────────────────────────────────────────────────── */
{
  const s = rich("housing");
  const ceilingBefore = 400 + cityYield(s).housing;
  for (let i = 0; i < 3; i++) raise(s, vacant(s)[0].id, "residential");
  const ceilingAfter = 400 + cityYield(s).housing;
  check("residential raises the population ceiling", ceilingAfter > ceilingBefore, { ceilingBefore, ceilingAfter });

  // And the ceiling is real: a city over it loses people.
  const over = rich("over");
  over.arcology.population = 8000;
  const pop = over.arcology.population;
  tickCity(over);
  check("a city with nowhere to live loses people", over.arcology.population < pop, { pop, now: over.arcology.population });
}

{
  const s = rich("industry");
  const plot = vacant(s)[0];
  const full = costToRaise(s, plot, "commercial");
  for (const d of vacant(s).slice(0, 4)) { raise(s, d.id, "industrial"); raise(s, d.id); raise(s, d.id); }
  check("works give a real discount on everything else", buildDiscount(s) > 0.05, buildDiscount(s));
  const cheaper = costToRaise(s, cityOf(s).districts.filter((d) => d.kind === "vacant")[0], "commercial");
  check("and the discount shows in the price", cheaper < full, { full, cheaper });
}

{
  // Schooling is read in the weekly pass, on a woman actually in classes.
  const plain = rich("school-a"), taught = rich("school-b");
  for (const s of [plain, taught]) {
    for (const p of Object.values(s.people)) { p.assignment = "classes"; p.persona.education = 20; }
  }
  for (const d of vacant(taught).slice(0, 4)) { raise(taught, d.id, "academy"); raise(taught, d.id); raise(taught, d.id); }
  for (let w = 0; w < 6; w++) { endWeek(plain); endWeek(taught); }
  const ed = (s: typeof plain) => Object.values(s.people).reduce((a, p) => a + p.persona.education, 0);
  check("an academy makes every woman in classes learn faster", ed(taught) > ed(plain), { plain: Math.round(ed(plain)), taught: Math.round(ed(taught)) });
}

{
  const s = rich("arms");
  const before = militaryStrength(s);
  for (const d of vacant(s).slice(0, 3)) { raise(s, d.id, "barracks"); raise(s, d.id); }
  check("barracks are the only currency the neighbours read", militaryStrength(s) > before + 20, { before, after: militaryStrength(s) });
}

/* ── explore ────────────────────────────────────────────────────────────────────────────────── */
{
  const s = rich("trade");
  const cheapest = REGIONS[0];
  check("no docks means no routes", !openRoute(s, cheapest.id).ok);
  check("and the city says so in as many words", cityProblems(s).some((p) => /docks/.test(p)), cityProblems(s));

  for (const d of vacant(s).slice(0, 2)) raise(s, d.id, "docks");
  const out = openRoute(s, cheapest.id);
  check("docks open the world", out.ok, out.why);
  check("and a route pays every week", cityYield(s).cash > 0);
  check("but not twice", !openRoute(s, cheapest.id).ok);

  const far = REGIONS[REGIONS.length - 1];
  check("the far places need more reach than two docks give",
    !openRoute(s, far.id).ok && /reach/.test(openRoute(s, far.id).why ?? ""), openRoute(s, far.id).why);
}

{
  // A disrupted route pays nothing while it is disrupted — the risk has to be real.
  const s = rich("risk");
  for (const d of vacant(s).slice(0, 2)) raise(s, d.id, "docks");
  openRoute(s, REGIONS[0].id);
  const paid = cityYield(s).cash;
  cityOf(s).routes[0].disrupted = 2;
  check("a disrupted route pays nothing", cityYield(s).cash < paid, { paid, now: cityYield(s).cash });
}

/* ── exterminate ────────────────────────────────────────────────────────────────────────────── */
{
  const s = rich("annex");
  const n = s.arcology.neighbours[0];
  check("you cannot buy a neighbour you barely own any of", !annex(s, n.id, "buy").ok);
  check("nor take one you cannot beat", !annex(s, n.id, "force").ok, annex(s, n.id, "force").why);

  n.ownership = 70;
  const before = { cash: s.arcology.cash, neighbours: s.arcology.neighbours.length };
  const out = annex(s, n.id, "buy");
  check("but with the ownership and the money, it is yours", out.ok, out.why);
  check("and it stops being a neighbour", s.arcology.neighbours.length === before.neighbours - 1);
  check("and its blocks are on your books", cityOf(s).districts.filter((d) => d.owner === "you" && d.level).length >= 3);
  check("and it cost you", s.arcology.cash < before.cash);
}

{
  const s = rich("force");
  const n = s.arcology.neighbours[0];
  for (const d of vacant(s).slice(0, 6)) { raise(s, d.id, "barracks"); raise(s, d.id); raise(s, d.id); raise(s, d.id); }
  s.arcology.mercenaries.hired = true; s.arcology.mercenaries.strength = 60;
  const repBefore = s.arcology.rep;
  const others = s.arcology.neighbours.filter((x) => x.id !== n.id).map((x) => x.attitude);
  const out = annex(s, n.id, "force");
  check("enough arms and you can simply take one", out.ok, out.why);
  check("it costs you standing", s.arcology.rep < repBefore);
  check("and everybody else who watched", s.arcology.neighbours.every((x, i) => x.attitude < others[i]),
    { before: others, after: s.arcology.neighbours.map((x) => x.attitude) });
}

/* ── wear, and the drawing ─────────────────────────────────────────────────────────────────── */
{
  const s = rich("rot");
  const plot = vacant(s)[0];
  raise(s, plot.id, "commercial");
  plot.condition = 40;
  s.arcology.crime = 90;
  for (let i = 0; i < 8; i++) tickCity(s);
  check("crime takes the blocks down", plot.condition < 40, plot.condition);
  const low = plot.condition;
  check("and money puts them back up", refurbish(s, plot.id).ok && plot.condition > low);
}

{
  // The drawing is the point of all of it, so it has to survive every shape the city can take.
  const s = rich("draw");
  for (const hour of ["dawn", "day", "dusk", "night"] as const) {
    const out = layout(cityOf(s).districts, { week: 1, crime: 20, population: 1200, hour });
    check(`the skyline draws at ${hour}`, out.blocks.length > 0 && /^0 -?\d+ \d+ \d+$/.test(out.viewBox), out.viewBox);
  }
  check("the clock reads the scene's time", hourFrom("Week 3, Tuesday 23:00") === "night" && hourFrom("Week 3, Tuesday 13:00") === "day");

  // Build it all the way up and check nothing leaves the frame.
  for (const d of cityOf(s).districts) { for (let i = 0; i < 9; i++) raise(s, d.id, d.kind === "vacant" ? "pleasure" : undefined); }
  const big = layout(cityOf(s).districts, { week: 200, crime: 10, population: 20000, hour: "night" });
  const vb = big.viewBox.split(" ").map(Number);
  const topmost = Math.min(...big.blocks.map((b) => b.y));
  check("a fully built city still fits in its own frame", topmost > vb[1], { topmost, frameTop: vb[1] });
  const spire = big.blocks.find((b) => b.id === "d-core")!;
  check("and the spire is still the tallest thing on the horizon",
    big.blocks.every((b) => b.id === "d-core" || b.y >= spire.y), { spire: spire.y });
}

{
  // A city that grows must not get SHORTER on screen — the bug the dynamic frame exists to prevent.
  const small = rich("small"), large = rich("large");
  for (const d of vacant(large)) { raise(large, d.id, "residential"); raise(large, d.id); raise(large, d.id); }
  const h = (s: typeof small) => {
    const o = layout(cityOf(s).districts, { week: 40, crime: 20, population: 3000, hour: "day" });
    const b = o.blocks.filter((x) => !x.vacant && x.id !== "d-core");
    return b.length ? Math.max(...b.map((x) => x.h)) : 0;
  };
  check("a built-up city draws taller than a bare one, not shorter", h(large) > h(small), { small: h(small), large: h(large) });
}
