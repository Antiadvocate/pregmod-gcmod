/**
 * BODIES AS DRAWN, AND YOURS.
 *
 * A heavy woman is drawn heavy, bare feet stand flat, and the scenes follow what the player has:
 * no cock means the strap-on, and nothing that needs you to come in her.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { layersFor, torsoSize, legSize } from "../src/lib/vectorart.ts";
import { POSE_BY_ID } from "../src/lib/rig.ts";
import { buildOf, kgFor } from "../src/engine/build.ts";
import { canDo, resolveAct } from "../src/engine/intimacy.ts";
import { ACT_BY_ID } from "../src/data/intimacy.ts";
import { writeAct } from "../src/engine/writer.ts";
import { hasCock, canSire, playerAsPerson, playerBody } from "../src/engine/you.ts";
import { cityOf, cityYield, newCity } from "../src/engine/city.ts";
import { selectEvents } from "../src/engine/events.ts";
import { collectAsks } from "../src/engine/asks.ts";

{
  const s = newGame({ seed: "bodies", starting_slaves: 1 });
  const p = Object.values(s.people)[0];
  Object.assign(p.body, { waist: 0, hips: 0 });
  p.body.weight = 85;
  check("a very heavy woman gets the obese torso", torsoSize(p) === "Obese", torsoSize(p));
  check("and the thickest legs", legSize(p) === "Thick", legSize(p));
  p.body.weight = -75;
  check("a very thin woman gets narrow legs", legSize(p) === "Narrow", legSize(p));
  p.body.weight = 0;
  check("an average woman is drawn average", ["Normal", "Hourglass"].includes(torsoSize(p)), torsoSize(p));

  p.shoes = "none"; p.legwear = undefined; p.clothes = "no clothing";
  const ids = layersFor(p, POSE_BY_ID.waiting).map((l) => l.id);
  const feet = ids.indexOf("Feet_Flat"), leg = ids.findIndex((x) => /^Leg_(Narrow|Normal|Wide|Thick)$/.test(x));
  check("bare feet stand flat, drawn under the leg", feet >= 0 && leg > feet && !ids.includes("Feet"), ids);
  p.body.boobs = 200;
  check("a flat chest draws no breast", !layersFor(p, POSE_BY_ID.waiting).some((l) => l.id === "Boob_Alt"));
  p.body.boobs = 900;
  check("a full one does", layersFor(p, POSE_BY_ID.waiting).some((l) => l.id === "Boob_Alt"));
}

check("build words run in order", ["skinny", "thin", "slim", "plump", "chubby", "fat", "obese"].join() ===
  [-80, -30, 0, 15, 30, 50, 80].map(buildOf).join());
check("weight in kg rises with weight", kgFor(-60, 170) < kgFor(0, 170) && kgFor(0, 170) < kgFor(80, 170));

{
  const s = newGame({ seed: "no cock", starting_slaves: 1, kit: "pussy" });
  const p = Object.values(s.people)[0];
  p.age = 25; p.body.vagina = 2; p.health.recovery_weeks = 0; p.chastity.vagina = false;
  check("the pussy kit has no cock", !hasCock(s) && !canSire(s));
  check("so no facial", canDo(p, ACT_BY_ID["facial"], s) === "you have no cock");
  check("and no breeding", canDo(p, ACT_BY_ID["breeding"], s) === "you have no cock");
  check("but she can still be fucked", canDo(p, ACT_BY_ID["vaginal"], s) === null);
  const o = resolveAct(s, p, "vaginal");
  if ("error" in o) check("vaginal resolves", false, o.error);
  else {
    const text = writeAct(s, p, o).paragraphs.join(" ");
    check("with the strap-on, or grinding", /strap-on|grind/.test(text), text);
  }
  check("your figure is drawn from your body", playerAsPerson(s).body.vagina === 2 && playerAsPerson(s).body.dick === null);
}
{
  const s = newGame({ seed: "old save", starting_slaves: 1 });
  check("a save from before bodies keeps the cock its scenes were written for", hasCock(s) && playerBody(s).boobs === 0);
  s.player.body = { ...playerBody(s), balls: null, appearance_facts: "" };
  const p = Object.values(s.people)[0];
  p.body.vagina = 2; p.chastity.vagina = false; p.health.recovery_weeks = 0;
  check("no balls, no breeding", canDo(p, ACT_BY_ID["breeding"], s) === "you can't get anyone pregnant");
}

{
  const a = newCity(1, "one"), b = newCity(1, "two");
  const sig = (c: typeof a) => c.districts.map((d) => d.kind).join();
  check("the city differs between runs", sig(a) !== sig(b) || sig(newCity(1, "three")) !== sig(a));
  check("somebody always has somewhere to live", [a, b].every((c) => c.districts.some((d) => d.kind === "residential")));
  for (const o of ["heir", "raider", "investor"]) {
    const s = newGame({ seed: `housed ${o}`, origin: o, kit: "both" });
    cityOf(s);
    check(`a new city starts housed (${o})`, s.arcology.population <= 400 + cityYield(s).housing, [s.arcology.population, cityYield(s).housing]);
  }
}

{
  const s = newGame({ seed: "repeats", origin: "heir", kit: "cock" });
  s.models.tension = 3;
  const kinds: string[] = [];
  for (let w = 0; w < 12; w++) {
    s.arcology.week++;
    const fresh = selectEvents(s);
    for (const e of fresh) kinds.push(`${s.arcology.week}:${e.kind}:${e.person ?? ""}`);
    s.events = [];
  }
  const repeats = kinds.filter((k, i) => {
    const [w, kind, who] = k.split(":");
    return kinds.some((x, j) => j < i && x.split(":")[1] === kind && x.split(":")[2] === who && Number(w) - Number(x.split(":")[0]) < 6);
  });
  check("the same event does not come back within six weeks", repeats.length === 0, repeats);
}

{
  const s = newGame({ seed: "gone home", origin: "heir", kit: "cock" });
  for (const p of Object.values(s.people)) { p.status = "free"; p.exit_week = 1; p.exit_note = "went home"; }
  check("women who left ask for nothing", collectAsks(s).length === 0);
}
