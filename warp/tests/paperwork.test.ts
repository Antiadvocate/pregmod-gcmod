/**
 * NO PAPERWORK — business, money and politics stay off your desk unless you ask for them, threats
 * still come, and nothing written about your women is about ledgers.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { fireEvent, isBusiness, businessAllowed } from "../src/engine/events.ts";
import { NOT_PAPERWORK } from "../src/engine/prompts.ts";
import { whereabouts } from "../src/engine/whereabouts.ts";

check("loans, envoys, share raids and festivals are business", ["gx_loan", "trade_offer", "corp_raid", "civic_festival", "law_praise", "shark"].every(isBusiness));
check("threats and her own trouble aren't", !["attack", "assassins", "office_manager", "gx_turned", "civic_washing", "hh_fight"].some(isBusiness));

{
  const s = newGame({ seed: "paper", starting_slaves: 4, plot: false } as never);
  s.models.tension = 10;
  let business = 0;
  for (let w = 0; w < 30; w++) { endWeek(s); business += s.events.filter((e) => isBusiness(e.kind)).length; s.events = []; if (s.story) s.story.pending = undefined; }
  check("out of the box, a year of weeks brings none of it", business === 0, business);
  check("and nothing can force one through", fireEvent(s, "shark") === null);
  s.business_events = "some";
  const first = fireEvent(s, "shark");
  check("one a month lets one through", !!first);
  s.events = [];
  check("and then waits", !businessAllowed(s, "summit") && fireEvent(s, "neighbour_scheme") === null);
  s.arcology.week += 4;
  check("for a month", businessAllowed(s, "summit"));
  s.business_events = "on";
  check("all of it, all the time", businessAllowed(s, "gx_crash"));
}

check("nothing written about her is paperwork", /ledgers/.test(NOT_PAPERWORK) && /works at a desk/.test(NOT_PAPERWORK));
{
  const s = newGame({ seed: "paper-office", starting_slaves: 2, plot: false } as never);
  const p = Object.values(s.people).find((x) => x.status === "owned")!;
  p.assignment = "work in an office"; p.facility = undefined; p.persona.interests = [];
  const doings = new Set<string>();
  for (let t = 0; t < 30; t++) doings.add(whereabouts(s, p, t).doing);
  check("at the office she isn't doing the books", ![...doings].some((d) => /invoice|contract|notes/.test(d)), [...doings]);
}
