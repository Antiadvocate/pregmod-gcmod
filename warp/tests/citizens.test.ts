/**
 * WHO LIVES HERE. An empty start that fills with whoever comes for what you build; three classes
 * with their own taxes; poverty, business and the border you can see and move; and what the owner
 * does with the week.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { cityOf } from "../src/engine/city.ts";
import { citizensOf, poverty, business } from "../src/engine/citizens.ts";
import { resolveEvent } from "../src/engine/events.ts";
import { offlinePlans, planOf, setPlan, skillOf } from "../src/engine/yourweek.ts";

{
  const s = newGame({ seed: "empty", no_slaves: true, empty_city: true } as never);
  check("an empty start has no slaves", !Object.values(s.people).some((p) => p.status === "owned" || p.status === "indentured"));
  check("and nobody living in the city", s.arcology.population === 0 && cityOf(s).districts.every((d) => d.kind === "spire" || d.kind === "vacant"));
  s.arcology.cash = 1e6;
  const plots = cityOf(s).districts.filter((d) => d.ring === 1);
  Object.assign(plots[0], { kind: "residential", level: 3, owner: "you", condition: 80 });
  Object.assign(plots[1], { kind: "industrial", level: 2, owner: "you", condition: 80 });
  Object.assign(plots[2], { kind: "commercial", level: 2, owner: "you", condition: 80 });
  let threw = "";
  for (let w = 0; w < 40; w++) {
    try { for (const e of [...s.events]) resolveEvent(s, e, e.options[0].id); endWeek(s); } catch (err) { threw = String((err as Error).stack).slice(0, 300); break; }
  }
  check("forty weeks with nobody to start with run clean", !threw, threw);
  check("people move in for what you built", s.arcology.population > 300, s.arcology.population);
  const c = citizensOf(s);
  check("most of them poor, come for the work", c.poor > c.middle && c.middle > c.rich, [c.poor, c.middle, c.rich]);
  check("and an empty house doesn't lose the run", !s.run?.ended || s.run.ended.kind !== "lost", s.run?.ended);
  check("the week's report says who came", !!c.last && (c.last.reasons.length > 0 || c.last.arrived.poor >= 0));
}

{
  const s = newGame({ seed: "taxes", starting_slaves: 1 } as never);
  for (let w = 0; w < 4; w++) endWeek(s);
  const c = citizensOf(s);
  const cash0 = s.arcology.cash;
  const before = poverty(s);
  c.tax.poor = 0.5;
  check("taxing the poor puts more of them in poverty", poverty(s) > before, [before, poverty(s)]);
  c.tax.poor = 0;
  check("and not taxing them takes them out", poverty(s) < before);
  c.tax.business = 0.5;
  const squeezed = business(s);
  c.tax.business = 0;
  check("a high business tax leaves businesses less", squeezed.after < business(s).after);
  c.tax.business = 0.1; c.tax.poor = 0.05;
  c.tax.rich = 0.6;
  const rich = c.rich;
  endWeek(s);
  check("the rich leave over a 60% tax", citizensOf(s).rich < rich && citizensOf(s).last!.left.rich > 0, [rich, citizensOf(s).rich]);
  check("and the taxes show up in the week's money", (citizensOf(s).last!.revenue.middle > 0) && s.arcology.cash !== cash0);
  citizensOf(s).tax.rich = 0.15;
  citizensOf(s).border = "closed";
  s.arcology.population = Math.round(s.arcology.population * 0.5);
  endWeek(s);
  const shut = citizensOf(s).last!;
  check("a closed border turns people away", shut.turnedAway > 0 || shut.arrived.poor + shut.arrived.middle + shut.arrived.rich < 40, shut);
}

{
  const s = newGame({ seed: "plan", starting_slaves: 1 } as never);
  check("three things to do without a model", offlinePlans(s).length === 3);
  check("a week you typed is read for the skill it uses", skillOf(s, "I'm going to drill with the guards every morning") === "command");
  const before = s.player.skills.command ?? 0;
  setPlan(s, "Drill with the guards every morning", "own");
  check("it's this week's plan", planOf(s)?.skill === "command");
  endWeek(s);
  check("and the week trains it", (s.player.skills.command ?? 0) > before, [before, s.player.skills.command]);
  check("and goes in the record", (s.chronicle ?? []).some((c) => /Drill with the guards/.test(c.text)) && s.player.last_plan?.week === s.arcology.week - 1);
  check("next week starts without a plan", !planOf(s));
}

import { BORDER_EVENTS } from "../src/engine/border.ts";
{
  const s = newGame({ seed: "border", starting_slaves: 1 } as never);
  s.arcology.week = 5;
  const bad: string[] = [];
  for (const e of BORDER_EVENTS) for (const o of e.options) {
    try { const line = o.resolve(s, { id: "x", kind: e.id, seed: "", options: [], week: 5, severity: "notable" } as never, undefined); if (!line || line.length < 60) bad.push(`${e.id}.${o.id}: ${line}`); }
    catch (err) { bad.push(`${e.id}.${o.id}: ${(err as Error).message}`); }
  }
  check("every choice at the border resolves and says what happened", !bad.length, bad);
  const pop = s.arcology.population;
  BORDER_EVENTS.find((e) => e.id === "border_refugees")!.options[0].resolve(s, {} as never, undefined);
  check("letting refugees in puts them in the city", s.arcology.population === pop + 300 && citizensOf(s).poor >= 300);
}
