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

import { startGrowing, geneLab } from "../src/engine/fleshcraft.ts";
import { personCard } from "../src/engine/prompts.ts";
{
  const s = newGame({ seed: "flesh", starting_slaves: 3, plot: false } as never);
  s.arcology.cash = 200000;
  const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;
  check("no gene lab, no fleshcraft", !startGrowing(s, her, "cat_ears").ok && !geneLab(s));
  s.arcology.facilities["clinic"] = { ...(s.arcology.facilities["clinic"] ?? { kind: "clinic", workers: [] } as never), kind: "clinic", level: 2, upgrades: { gene_lab: 1 } } as never;
  const r = startGrowing(s, her, "cat_ears");
  check("a treatment starts", r.ok, r.line);
  check("two ear treatments can't run at once", !startGrowing(s, her, "fox_ears").ok);
  for (let w = 0; w < 4; w++) { endWeek(s); s.events = []; }
  check("it finishes and leaves a trait", (her.body.traits ?? []).includes("real cat ears") && her.look?.ears === "cat");
  check("the narrator knows", personCard(s, her).includes("real cat ears"));
}
