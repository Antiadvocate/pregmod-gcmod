/**
 * WHAT MAKES HER LOOK LIKE NOBODY ELSE — rolled once from her id, rare when they should be, drawn,
 * written into what the narrator knows, and priced.
 */
import { check } from "./harness.ts";
import { generatePerson } from "../src/engine/generate.ts";
import { featuresOf, rollFeatures, rarityValue, rarityOf, featuresLine } from "../src/engine/features.ts";
import { newGame } from "../src/engine/state.ts";
import { valuePerson } from "../src/engine/economy.ts";
import { personCard } from "../src/engine/prompts.ts";

{
  const N = 6000;
  const count: Record<string, number> = {};
  let anything = 0;
  for (let i = 0; i < N; i++) {
    const p = generatePerson({ seed: 9000 + i, age: 24, sex: "female" });
    const fs = p.body.features ?? [];
    if (fs.length) anything++;
    for (const f of fs) count[f.id] = (count[f.id] ?? 0) + 1;
  }
  const rate = (id: string) => (count[id] ?? 0) / N;
  check("most women have something of their own", anything / N > 0.3 && anything / N < 0.8, anything / N);
  check("eyes of two colours are about one in a hundred", rate("heterochromia") > 0.004 && rate("heterochromia") < 0.02, rate("heterochromia"));
  check("albinism is very rare", rate("albino") < 0.008, rate("albino"));
  check("freckles are common", rate("freckles") + rate("heavy_freckles") > 0.05, rate("freckles"));
}

{
  const p = generatePerson({ seed: 4242, age: 25, sex: "female" });
  const again = generatePerson({ seed: 4242, age: 25, sex: "female" });
  check("the same woman always has the same marks", JSON.stringify(p.body.features) === JSON.stringify(again.body.features));
  // A woman from an old save, before features existed, gets hers the first time anyone looks.
  delete p.body.features;
  const late = featuresOf(p);
  check("an old save's woman gets hers, and keeps them", JSON.stringify(late) === JSON.stringify(featuresOf(p)) && !late.some((f) => f.id === "albino"));
}

{
  // Find an albino and a woman with heterochromia, and see them priced and described.
  let albino, odd;
  for (let i = 0; i < 20000 && (!albino || !odd); i++) {
    const p = generatePerson({ seed: 50000 + i, age: 23, sex: "female" });
    if (!albino && p.body.features?.some((f) => f.id === "albino")) albino = p;
    if (!odd && p.body.features?.some((f) => f.id === "heterochromia")) odd = p;
  }
  check("an albino is white-haired and pale", !!albino && albino.body.hair_color === "white" && /milk-white/.test(albino.body.skin), albino?.body);
  check("and very rare, and worth a great deal more", !!albino && rarityOf(albino) === 4 && rarityValue(albino) >= 1.6);
  check("two eye colours are on her card", !!odd && /two different colours/.test(featuresLine(odd)));
  const s = newGame({ seed: "rare", starting_slaves: 2 } as never);
  if (odd) {
    s.people[odd.id] = odd;
    const plain = { ...odd, body: { ...odd.body, features: [] } };
    check("and she sells for more than the same woman without them", valuePerson(s, odd) > valuePerson(s, plain as never), [valuePerson(s, odd), valuePerson(s, plain as never)]);
    check("the narrator is told", personCard(s, odd, "").includes("DISTINCTIVE"));
  }
  check("an albino is only ever born one", !rollFeatures({ ...generatePerson({ seed: 1, age: 22, sex: "female" }), id: "x-albino-test" }).some((f) => f.id === "albino"));
}
