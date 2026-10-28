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

// Svetlana: a narrator's misfire became "she keeps her feet on the stone" in her ways, the owner
// punished her for it, and the next scene kept it anyway. Terror didn't beat the leave he'd given
// her, fear told her to bury the very thing she was ordered to do, and her order was cut off.
{
  const { obeys } = await import("../src/engine/compliance.ts");
  const { powerBetween } = await import("../src/engine/self.ts");
  const { addWays, dropWays } = await import("../src/engine/ways.ts");
  const { clipRule } = await import("../src/engine/agreements.ts");
  const { natureLines } = await import("../src/engine/nature.ts");
  const s = newGame({ seed: "svetlana", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  her.romance = { ...((her.romance ?? {}) as object), standing: "wife", dominion: 40 } as never;
  Object.assign(her.bond, { bond: -100, fear: 100, resentment: 100, hope: 20 });
  refresh(her, s.memory[her.id]);
  check("with a gun to her head, the say he gave her is gone and she obeys out of terror", obeys(s, her).stance === "terrified", obeys(s, her).stance);
  check("and when he speaks as her owner the lead is his, with no lecturing", /the lead is yours again[^"]*doesn't argue, correct or lecture you/.test(powerBetween(s, her)));
  her.romance = { ...((her.romance ?? {}) as object), standing: "property", dominion: -50 } as never;
  her.persona.fetishes = [{ name: "keyholder", strength: 80, known: true }];
  check("a nature fear buries still does what she's ordered", /if you order it, or it's one of her standing orders, she does exactly that/.test(natureLines(s, her).join(" ")), natureLines(s, her).join(" ").slice(0, 400));
  addWays(s, her, ["when men rape her in public, she keeps her feet flat on the stone and shows him her slate", "he kneels when she taps her sole twice"]);
  check("a way he rejected is taken out", dropWays(her, ["when men rape her in public, she keeps her feet flat on the stone and shows him her slate to prove she held them"]) === 1 && her.ways!.length === 1 && /taps her sole/.test(her.ways![0].text));
  check("and an order isn't left hanging on 'while'", clipRule("always kicks his dick with her feet, and only cuckolds him, while") === "always kicks his dick with her feet, and only cuckolds him" && clipRule("x ".repeat(300)).length <= 320);
}

// Laws are law in a scene, every part of them, and a habit gives way to a law or a standing order.
{
  const { lawsLine } = await import("../src/engine/lawlife.ts");
  const { enact } = await import("../src/engine/court.ts").catch(() => ({ enact: undefined }));
  const { waysBrief, addWays } = await import("../src/engine/ways.ts");
  const { agreementsBrief } = await import("../src/engine/agreements.ts");
  const s = newGame({ seed: "laws are law", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  (s.laws ??= []).push({ id: "public_discipline", week: s.arcology.week } as never);
  void enact;
  const laws = lawsLine(s);
  check("a scene is told laws are kept, every part, never 'keep or break where it fits'", !!laws && (/everyone keeps them[^]*every part of it/.test(laws) && !/keep or break/.test(laws)), laws.slice(0, 200));
  addWays(s, her, ["she keeps her feet flat on the stone when men use her"]);
  her.agreements = [{ rule: "always kicks his dick with her feet while she's fucked", week: 1, by: "you" }] as never;
  check("habits give way to laws and standing orders", /the law or the order wins/.test(waysBrief(her)) && /They come before any habit/.test(agreementsBrief(s, her)));
}
