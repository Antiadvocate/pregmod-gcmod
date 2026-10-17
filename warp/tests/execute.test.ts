/**
 * EXECUTE — she's yours, and so is ending her.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { killHer } from "../src/engine/execute.ts";
import { inHousehold } from "../src/engine/romance.ts";

{
  const s = newGame({ seed: "execute", starting_slaves: 3 } as never);
  const [a, b, c] = Object.values(s.people).filter((p) => p.status === "owned");
  const fear = c.bond.fear;
  const r = killHer(s, a.id, "private");
  check("she can be killed", r.ok && a.status === "dead" && a.exit_week === s.arcology.week, r);
  check("she's off the roster", !inHousehold(s, a));
  check("and in no facility", Object.values(s.arcology.facilities).every((f) => !f.workers.includes(a.id)));
  check("the household is more afraid", c.bond.fear > fear, { before: fear, after: c.bond.fear });
  check("the dead can't be killed twice", !killHer(s, a.id, "private").ok);

  const before = c.bond.fear;
  check("in front of the household works too", killHer(s, b.id, "public").ok && b.status === "dead");
  check("and frightens them more", c.bond.fear - before > 8, { before, after: c.bond.fear });

  for (let w = 0; w < 2; w++) endWeek(s);
  check("the week runs on afterwards", a.status === "dead" && b.status === "dead" && c.status === "owned");
}
