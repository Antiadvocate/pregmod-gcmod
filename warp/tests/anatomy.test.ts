/**
 * ANATOMY — nobody carries without a womb; the prose never gives her parts she hasn't got.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { generatePerson } from "../src/engine/generate.ts";
import { tryConception, hasWomb } from "../src/engine/pregnancy.ts";
import { PROCEDURE_BY_ID } from "../src/data/surgery.ts";
import { describeGenitals } from "../src/engine/genitals.ts";

{
  const s = newGame({ seed: "anat", starting_slaves: 1, plot: false } as never);
  const male = generatePerson({ seed: "cock-only", sex: "male", week: 1 });
  male.womb.sterile = false; male.womb.fertility = 100; male.womb.cycle_day = 14;
  let got = 0;
  for (let i = 0; i < 400; i++) if (tryConception(s, male, null, 6)) { got++; male.womb.fetuses = []; }
  check("a slave with only a cock never gets pregnant", got === 0 && !hasWomb(male));
  check("the narrator is told she has no womb", /no womb/.test(describeGenitals(male)));
  PROCEDURE_BY_ID["anal_womb"].apply(male);
  male.womb.cycle_day = 14;
  for (let i = 0; i < 400 && !got; i++) if (tryConception(s, male, null, 6)) got++;
  check("with an anal womb she can be bred through her ass", got > 0 && /through her ass/.test(describeGenitals(male)));
  const f = generatePerson({ seed: "futa", sex: "male", week: 1 });
  PROCEDURE_BY_ID["male_to_female"].apply(f);
  check("a surgically built pussy has no womb behind it", !hasWomb(f) && /no womb behind it/.test(describeGenitals(f)));
}

import { anatomyLock, erectionWhy, reconcileAnatomy } from "../src/engine/genitals.ts";
import { bodyWords } from "../src/engine/writer.ts";
import { personCard } from "../src/engine/prompts.ts";
{
  const s = newGame({ seed: "anat2", starting_slaves: 1, plot: false } as never);
  const m = generatePerson({ seed: "cock-only-2", sex: "male", week: 1 });
  s.people[m.id] = m; s.memory[m.id] = { episodic: [], beliefs: [], facts: [], gist: [] } as never;
  check("the model is told there's no pussy", /does NOT have a pussy/.test(anatomyLock(m)) && personCard(s, m).includes("does NOT have a pussy"));
  check("a cock-only slave is never 'wet' in the written scenes", bodyWords(m).wet !== "wet");
  m.persona.preferred_hole = { hole: "vagina", known: false }; reconcileAnatomy(m);
  check("she never prefers a hole she doesn't have", m.persona.preferred_hole.hole !== "vagina");
  m.body.dick = 12; m.body.balls = 5; m.body.height_cm = 165; m.health.drugs = [];
  const big = erectionWhy(m);
  check("a huge cock says why it won't get hard", big.state !== "full" && !!big.fix, big);
  PROCEDURE_BY_ID["penile_implant"].apply(m);
  check("a penile implant makes her hard at any size", erectionWhy(m).state === "full");
  let flat = 0;
  for (let i = 0; i < 300; i++) if (generatePerson({ seed: `ass${i}`, week: 1 }).body.butt < 1) flat++;
  check("nobody is generated without an ass", flat === 0);
  check("her ass is in the model's card", /ASS: /.test(personCard(s, m)));
}
