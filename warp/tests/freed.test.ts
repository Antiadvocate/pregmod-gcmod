/**
 * FREED — let her go, and she's still out there in your city.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { freeHer, freedInCity, freedWalkLine, freeLine, FREE_HOW } from "../src/engine/freed.ts";
import { inHousehold } from "../src/engine/romance.ts";
import { EVENT_BY_ID } from "../src/engine/events.ts";

{
  const s = newGame({ seed: "freed", starting_slaves: 3 } as never);
  const [a, b] = Object.values(s.people).filter((p) => p.status === "owned");
  const r = freeHer(s, a.id, "papers");
  check("she can be freed", r.ok && a.status === "free" && !!a.free_life, r);
  check("she's off the roster", !inHousehold(s, a));
  check("and lives somewhere in the city", freedInCity(s).includes(a) && !!a.free_life!.job, a.free_life);
  check("her line says where and how", freeLine(s, a).includes(a.free_life!.job), freeLine(s, a));
  check("a walk through her district can meet her", freedWalkLine(s, a.free_life!.district).includes(a.name));

  s.arcology.cash = 0;
  const no = freeHer(s, b.id, "stake");
  check("a stake costs money you have to have", !no.ok && b.status === "owned" && FREE_HOW.stake.cost(s) > 0);
  const out = freeHer(s, b.id, "cast_out");
  check("turning her out puts her on the verge", out.ok && b.free_life!.district === "verge" && b.free_life!.fortune < 0, b.free_life);

  for (let w = 0; w < 4; w++) endWeek(s);
  check("her life goes on, week by week", typeof a.free_life!.fortune === "number" && a.status === "free");
  check("and she can come back into yours", ["freed_thanks", "freed_trouble", "freed_agitator", "freed_informant"].every((id) => !!EVENT_BY_ID[id]));
}
