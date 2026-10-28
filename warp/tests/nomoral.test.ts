/**
 * NO MORAL THUMB ON THE SCALE. Fear and bond are two ways to run a house, and neither is secretly
 * the right one. Fear holds as long as the house is held down, and costs company. A masochist doesn't
 * resent the whip she wanted. Punishment doesn't cost trust twice. And what the city thinks of
 * cruelty or kindness is the city's culture.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { applyTreatment, read, refresh, tickBond, wantsHurt } from "../src/engine/obedience.ts";
import { personCard } from "../src/engine/prompts.ts";
import { selfProfile } from "../src/engine/self.ts";
import { resolveDynamic } from "../src/engine/dynamic.ts";

{
  const s = newGame({ seed: "nomoral", starting_slaves: 2 } as never);
  const [a, b] = Object.values(s.people).filter((p) => p.status === "owned");

  // Fear holds under a full lid, and drains without one.
  a.bond.fear = 80; a.bond.weeks_since_cruelty = 3;
  tickBond(a, 1);
  check("under a full lid, fear stays where you put it", a.bond.fear === 80, a.bond.fear);
  tickBond(a, 0);
  check("with no control, it drains", a.bond.fear < 70, a.bond.fear);

  // Punishment doesn't cost trust a second time through "weeks since the last cruelty".
  Object.assign(a.bond, { bond: 20, fear: 20, resentment: 10, hope: 30, weeks_since_cruelty: 0 });
  const just = read(a).trust;
  a.bond.weeks_since_cruelty = 30;
  check("trust doesn't depend on how long since you last hurt her", read(a).trust === just, [just, read(a).trust]);

  // A masochist doesn't resent the whip she wanted.
  a.persona.fetishes = [{ name: "masochist", strength: 95, known: true }]; a.persona.quirk = undefined; a.persona.paraphilia = undefined;
  b.persona.fetishes = [{ name: "none", strength: 0, known: false }]; b.persona.quirk = undefined; b.persona.paraphilia = undefined;
  for (const p of [a, b]) Object.assign(p.bond, { bond: 20, fear: 10, resentment: 10, hope: 40 });
  check("her wanting it is read off her kinks", wantsHurt(a) > 0.9 && wantsHurt(b) === 0);
  applyTreatment(a, { kind: "cruelty", size: 8, why: "test" }, s.arcology.week);
  applyTreatment(b, { kind: "cruelty", size: 8, why: "test" }, s.arcology.week);
  check("a masochist whipped hardly resents it and is bound closer", a.bond.resentment < 12 && a.bond.bond > 20, a.bond);
  check("a woman who didn't want it resents it and pulls away", b.bond.resentment > 15 && b.bond.bond < 20, b.bond);

  // A house run on fear works, and it's lonely.
  for (const p of [a, b]) { Object.assign(p.bond, { bond: 0, fear: 85, resentment: 20, hope: 10 }); p.persona.fetishes = [{ name: "none", strength: 0, known: false }]; refresh(p, s.memory[p.id]); }
  check("a frightened slave's card says she offers nothing of herself", /it shows as nothing: she does exactly what she's told and no more/.test(personCard(s, a, "")));
  check("and the owner is told his house is obedient, quiet and all the same woman", selfProfile(s).some((l) => /runs on fear: 2 of 2[^]*every woman in it is the same woman around them/.test(l)));

  // What the city thinks is its culture.
  const rep = (kind: string, cruelty: number) => {
    s.culture = { ...(s.culture ?? { pushes: [], history: [] }), norms: { ...(s.culture?.norms ?? {}), cruelty } } as never;
    const before = s.arcology.rep = 5000;
    s.events.push({ id: `t-${kind}-${cruelty}`, kind: "dynamic", seed: "A trader cheated you.", options: [{ id: `d0:${kind}:`, label: "x" }], week: s.arcology.week, severity: "minor" } as never);
    resolveDynamic(s, s.events.at(-1)!, `d0:${kind}:`);
    return s.arcology.rep - before;
  };
  check("in a cruel city, cruelty earns standing and kindness costs it", rep("cruelty", 80) > 0 && rep("kindness", 80) < 0, [rep("cruelty", 80), rep("kindness", 80)]);
  check("in a gentle city, the other way round", rep("cruelty", -80) < 0 && rep("kindness", -80) > 0, [rep("cruelty", -80), rep("kindness", -80)]);
}
