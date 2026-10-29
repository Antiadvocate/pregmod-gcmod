/**
 * FACILITY UPGRADES DO WHAT THEY SAY. Most of them used to cost money and change nothing: the spa's
 * pool, the cellblock's isolation, the schoolroom's curriculum, the club's lights.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { FACILITIES, FACILITY_BY_ID, upgradeAdds } from "../src/data/facilities.ts";
import { newGame } from "../src/engine/state.ts";
import { weeklyMoney } from "../src/engine/economy.ts";

{
  const dead = FACILITIES.flatMap((f) => f.upgrades.filter((u) => !u.adds && f.income !== "customers").map((u) => `${f.id}.${u.id}`));
  // These are handled in code by id: the theatre and the gene lab unlock screens, hydroponics feeds,
  // the organ farm prices surgery, the armoury fights; the incubator has no engine yet.
  const special = ["farmyard.hydroponics", "clinic.surgery", "clinic.organ_farm", "clinic.gene_lab", "barracks.armory", "incubator.speed", "incubator.conditioning"];
  check("every upgrade does something", dead.every((x) => special.includes(x)), dead.filter((x) => !special.includes(x)));
  const spa = FACILITY_BY_ID.spa;
  check("the spa's pool heals", upgradeAdds({ pool: 1 }, spa).health > 0);
  check("an earning facility's upgrade still earns", upgradeAdds({ sanitation: 1 }, FACILITY_BY_ID.arcade).income > 0);
}

{
  const s = newGame({ seed: "upgrades", starting_slaves: 2 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  const dairy = s.arcology.facilities.dairy;
  dairy.level = 1; dairy.capacity = 6; dairy.workers = [her.id];
  her.facility = "dairy"; her.body.lactation = 1 as never; her.body.boobs = 900;
  const before = weeklyMoney(s, her).income;
  dairy.upgrades.pumps = 1;
  check("the dairy's pumps raise the yield", weeklyMoney(s, her).income > before, [before, weeklyMoney(s, her).income]);
}
