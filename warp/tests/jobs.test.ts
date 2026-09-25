/**
 * JOBS THAT AREN'T SEX — idols gather fans and trouble; office work pays by brains; a secretary saves.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { idolOf } from "../src/engine/idols.ts";
import { EVENT_BY_ID, fireEvent, resolveEvent } from "../src/engine/events.ts";
import { weeklyMoney } from "../src/engine/economy.ts";

{
  const s = newGame({ seed: "idol", starting_slaves: 4, plot: false } as never);
  const [star, clerk, sec] = Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);
  star.assignment = "be an idol"; star.skills.entertainment = 60; star.bond.bond = 40;
  clerk.assignment = "work in an office"; clerk.persona.education = 80;
  sec.assignment = "be your secretary";
  for (let w = 0; w < 10; w++) { endWeek(s); s.events = []; }
  check("an idol gathers fans", idolOf(star).fans > 1000, idolOf(star).fans);
  check("fans pay", weeklyMoney(s, star).income > 400, weeklyMoney(s, star));
  check("office work pays by what's in her head", weeklyMoney(s, clerk).income > 300, weeklyMoney(s, clerk));
  check("a secretary catches overcharges", s.reports.at(-1)!.ledger.some((l) => l.category === "savings" && l.cash > 0));
  check("the idol's trouble is registered", ["idol_fan", "idol_scandal", "idol_rival", "idol_sponsor", "office_manager"].every((k) => EVENT_BY_ID[k]));
  const e = fireEvent(s, "idol_sponsor", { person: star });
  const before = s.arcology.cash;
  const line = e ? resolveEvent(s, e, "take") : "";
  check("a sponsor deal pays and changes her image", s.arcology.cash === before + 8000 && idolOf(star).image === "sexy" && line.length > 60);
}
