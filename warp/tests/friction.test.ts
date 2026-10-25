/**
 * FRICTION — a slave doesn't do what she's told just because you said it: devotion or fear buys
 * obedience, the ones in between resist, and a resisting slave doesn't come round on her own. Her
 * behavioural flaw adds its own; being spoiled makes her push her luck; she misbehaves, it costs
 * you, and it comes to you to punish.
 */
import { check } from "./harness.ts";
import { newGame, sanitize } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { generatePerson } from "../src/engine/generate.ts";
import { obeys, misbehave } from "../src/engine/compliance.ts";
import { applyTreatment, refresh } from "../src/engine/obedience.ts";
import { resolveAct, actDirective } from "../src/engine/intimacy.ts";
import { personCard } from "../src/engine/prompts.ts";
import { MOMENT_SYSTEM } from "../src/engine/moments.ts";
import { selectClassics } from "../src/engine/classics.ts";
import { resolveEvent } from "../src/engine/events.ts";
import { seedCharacter, talentFits } from "../src/engine/character.ts";
import { CAREERS, ORIGINS } from "../src/data/people.ts";
import { rng } from "../src/engine/rng.ts";
import type { Person, SaveState } from "../src/engine/types.ts";

function slave(s: SaveState, b: Partial<Person["bond"]>, extra: (p: Person) => void = () => {}): Person {
  const p = Object.values(s.people).find((x) => x.status === "owned" && x.age >= 18 && !x.romance?.standing)!
    ?? Object.values(s.people).find((x) => x.status === "owned" && x.age >= 18)!;
  p.romance = undefined; p.latitude = undefined; p.psyche.state = "intact";
  Object.assign(p.bond, { bond: 0, fear: 0, resentment: 0, hope: 30, weeks_since_cruelty: 0, weeks_since_kindness: 0, indulged: 0 }, b);
  p.persona.behavior = {};
  extra(p);
  refresh(p, s.memory[p.id]);
  return p;
}

{
  const s = newGame({ seed: "friction", starting_slaves: 3, plot: false } as never) as SaveState;
  check("a woman who loves you obeys gladly", obeys(s, slave(s, { bond: 100, hope: 100 }, (p) => { p.psyche.relaxation = 3; })).stance === "eager", obeys(s, slave(s, { bond: 100, hope: 100 }, (p) => { p.psyche.relaxation = 3; })).stance);
  check("one terrified of you obeys too, out of fear", obeys(s, slave(s, { fear: 90, resentment: 40 })).stance === "terrified");
  check("one who hates you and isn't afraid fights you", obeys(s, slave(s, { bond: -70, resentment: 90, hope: 0 })).stance === "fights");
  check("one in between drags her feet", ["reluctant", "resists"].includes(obeys(s, slave(s, { bond: 5, resentment: 20 })).stance), obeys(s, slave(s, { bond: 5, resentment: 20 })).stance);
  check("a mindbroken one does anything", obeys(s, slave(s, {}, (p) => { p.psyche.state = "broken"; })).stance === "hollow");

  const rebel = slave(s, { bond: -70, resentment: 90, hope: 0 });
  check("her card tells the narrator how she takes orders", /HOW SHE TAKES ORDERS[^\n]*refuses/.test(personCard(s, rebel)));
  check("but how it sounds is hers, not a stock slave's", /how it sounds is hers[^\n]*never a stock slave's lines/.test(personCard(s, rebel)));
  check("and the scene writer doesn't just do what the player says", MOMENT_SYSTEM.includes("happens only as far as HOW SHE TAKES ORDERS") && !MOMENT_SYSTEM.includes("Follow the player's reply exactly"));
  rebel.persona.fetishes = [{ name: "buttslut", strength: 90, known: true }];
  rebel.persona.flaw = undefined; rebel.persona.quirk = undefined;
  const out = resolveAct(s, rebel, "anal");
  check("an act forced on her lands as forced, even one she'd like", !("error" in out) && out.stance === "fights" && (out.landing === "endured" || out.landing === "hated"), out);
  if (!("error" in out)) check("and the narrator writes the struggle", /fights it[\s\S]*force it/.test(actDirective(s, rebel, out)));

  const brat = slave(s, { bond: 60, hope: 60 }, (p) => { p.persona.behavior = { flaw: "arrogant", worn: 0 }; });
  for (let i = 0; i < 8; i++) applyTreatment(brat, { kind: "kindness", size: 8, why: "a gift" }, s.arcology.week);
  brat.bond.weeks_since_cruelty = 10;
  check("indulged for weeks and never disciplined, she pushes her luck", obeys(s, brat).pushes, [brat.bond.indulged, obeys(s, brat).label]);
  check("and her flaw is on her card", /HER FLAW \(arrogant\)/.test(personCard(s, brat)));
  for (let i = 0; i < 4; i++) applyTreatment(brat, { kind: "coercion", size: 6, why: "punished" }, s.arcology.week);
  check("discipline takes the spoiling down", (brat.bond.indulged ?? 0) < 30 && !obeys(s, brat).pushes, brat.bond.indulged);
  check("and wears her flaw into its quirk", brat.persona.behavior?.quirk === "confident", brat.persona.behavior);
}

{
  const s = newGame({ seed: "friction-week", starting_slaves: 3, plot: false } as never) as SaveState;
  const p = slave(s, { bond: -70, resentment: 90, hope: 0 });
  let did = null;
  for (let w = 0; w < 20 && !did; w++) { s.arcology.week++; did = misbehave(s, p); }
  check("a slave who fights you misbehaves", !!did && !!p.misbehaved, did);
  s.events = []; s.event_log = {};
  const picked = selectClassics(s);
  const disc = picked.find((e) => e.kind === "cl_discipline");
  check("and it comes to you to deal with", !!disc && disc.person === p.id, picked.map((e) => e.kind));
  if (disc) {
    s.events.push(disc);
    const others = Object.values(s.people).filter((o) => o.status === "owned" && o.id !== p.id);
    const fear = others.map((o) => o.bond.fear);
    const line = resolveEvent(s, disc, "public");
    check("punishing her in front of the house teaches the house", line.length > 40 && others.every((o, i) => o.bond.fear >= fear[i]), line);
  }
  for (let w = 0; w < 4; w++) endWeek(s);
  check("weeks run with it", s.reports.length >= 4);
}

{
  check("more lives before this one", CAREERS.length >= 45 && ORIGINS.length >= 18 && CAREERS.some((c) => c.name === "dominatrix"));
  const p = generatePerson({ seed: "who-1", sex: "female" });
  check("every new woman's behaviour is rolled", p.persona.behavior !== undefined);
  const n = generatePerson({ seed: "who-2", sex: "female", career: "nurse" } as never);
  n.persona.talents = undefined;
  seedCharacter(n, rng("n"));
  check("and what she's good at, from the life she had", String(n.persona.talents ?? "").includes("nursing and first aid"), n.persona.talents);
  n.facility = "clinic";
  check("which pays when her work uses it", talentFits(n) === "nursing and first aid");
  const s = newGame({ seed: "who-old", starting_slaves: 2, plot: false } as never) as SaveState;
  const her = Object.values(s.people).find((x) => x.status === "owned")!;
  her.persona.behavior = undefined; her.persona.talents = undefined; her.persona.grain = undefined;
  her.persona.core_traits = ["written by the model", "also written", "and this one"];
  const back = sanitize(JSON.parse(JSON.stringify(s))).people[her.id];
  check("an old save's women get behaviour and talents on load", back.persona.behavior !== undefined && Array.isArray(back.persona.talents));
  check("without anyone's traits being rewritten", back.persona.core_traits.join("|") === "written by the model|also written|and this one");
}

// Her card is about her, in the save she's in: no invented people, her own flaw, the whole household.
{
  const { personCard, digest, householdLine } = await import("../src/engine/prompts.ts");
  const { herFitLine } = await import("../src/engine/fit.ts");
  const { dueToGrow } = await import("../src/engine/growth.ts");
  const s = newGame({ seed: "card-real", starting_slaves: 1, plot: false } as never) as SaveState;
  const p = Object.values(s.people).find((x) => x.status === "owned")!;
  p.manner = [{ toward: "Halyna", how: "easy and teasing with her" } as never];
  check("someone a scene made up isn't kept on her card", !/Halyna/.test(personCard(s, p)));
  p.persona.behavior = { flaw: "Thinks her feet are God", worn: 0 };
  check("a flaw written in by hand reaches the narrator", /HER FLAW: Thinks her feet are God/.test(personCard(s, p)));
  check("the narrator knows the whole household, and that there's nobody else", /THE HOUSEHOLD[^\n]*is the only slave/.test(householdLine(s)) && /THE HOUSEHOLD/.test(digest(s, "x", p.id)));
  p.body.dick = 20;
  check("an impossible past is called impossible", /was impossible/.test(herFitLine(s, p)));
  p.persona.voice = { diction: "plain" }; p.persona.exchanges = undefined; p.economics.weeks_owned = 3; p.age = 20;
  check("a woman with no ordinary exchanges is read early", dueToGrow(s).includes(p));
}
