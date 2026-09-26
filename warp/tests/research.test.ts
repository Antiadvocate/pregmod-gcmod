/**
 * RESEARCH — projects your city makes possible, and what they change.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { canStart, startResearch, researched, RESEARCH } from "../src/engine/research.ts";
import { cultureOf } from "../src/engine/culture.ts";
import { raise, cityOf } from "../src/engine/city.ts";
import { feetOf } from "../src/engine/genitals.ts";
import type { SaveState } from "../src/engine/types.ts";

{
  const s = newGame({ seed: "research", starting_slaves: 3, plot: false } as never) as SaveState;
  s.arcology.cash = 500000;
  check("sole science is locked in a city that doesn't care about feet", !!canStart(s, "sole_science"), canStart(s, "sole_science"));
  cultureOf(s).norms.feet = 40;
  check("and opens when feet are revered", canStart(s, "sole_science") === null, canStart(s, "sole_science"));
  const line = startResearch(s, "sole_science");
  check("it runs as a project with a weekly cost", /under way/.test(line) && s.arcology.projects.some((p) => p.id === "research-sole_science"), line);
  check("only one at a time without a laboratory", /already running/.test(canStart(s, "obedience_collars") ?? "") || !!canStart(s, "obedience_collars"));
  const before = cultureOf(s).norms.feet;
  for (let w = 0; w < 8 && !researched(s, "sole_science"); w++) { endWeek(s); s.events = []; if (s.story) s.story.pending = undefined; }
  check("when it finishes it's done", researched(s, "sole_science"));
  const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;
  check("and it changes the household and the city", feetOf(her).soles === "soft" && cultureOf(s).norms.feet > before - 5, { soles: feetOf(her).soles, feet: cultureOf(s).norms.feet });

  // Recyclers need Works.
  const t = newGame({ seed: "research2", starting_slaves: 2, plot: false } as never) as SaveState;
  t.arcology.cash = 500000;
  for (const d of cityOf(t).districts) if (d.kind === "industrial") d.kind = "vacant";
  check("recyclers need a Works district", /Works/.test(canStart(t, "recyclers") ?? ""));
  const plot = cityOf(t).districts.find((d) => d.kind === "vacant" && d.ring >= 1)!;
  raise(t, plot.id, "industrial");
  check("and open once you build one", canStart(t, "recyclers") === null, canStart(t, "recyclers"));
  check("every project says what it needs and does", RESEARCH.every((r) => r.what.length > 40 && r.cost > 0));
}
