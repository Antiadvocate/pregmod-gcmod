import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { worldOf } from "../src/engine/world.ts";
import { cultureBrief, cultureOf } from "../src/engine/culture.ts";
import { apply, clampSpec, design, genomeBrief, genomeOf, quote, readWords, resistance, topUp, PER_CITIZEN, PER_SLAVE, prevailingLook } from "../src/engine/genome.ts";
import { styleFor } from "../src/lib/vectorart.ts";

const slavesOf = (s: ReturnType<typeof newGame>) => Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);

{
  const w = readWords("Blue skin for every citizen, and lungs that shrug off the smog.");
  check("the game reads a colour and a resistance from the words", w.skin === "blue" && (w.resist.pollution ?? 0) > 0 && !w.hair, w);
  const two = readWords("Blue skin and silver hair, resistant to heat.");
  check("each colour goes to the part it names, and 'hair' isn't 'air'", two.skin === "blue" && two.hair === "silver" && !two.resist.pollution, two);
  check("'skin dyed gold' reads too", readWords("their skin dyed gold").skin === "gold");
  check("'climate resilient' means heat and cold", (readWords("make them climate resilient").resist.heat ?? 0) > 0 && (readWords("make them climate resilient").resist.cold ?? 0) > 0);
  const c = clampSpec({ skin: "plaid", hair: "Silver", complexity: 99, resist: { heat: 5, charisma: 1 } as never, height: 80, reaction: -9, breasts: 5 } as never);
  check("a narrator's answer is held to the menu", !c.skin && c.hair === "silver" && c.complexity === 5 && c.resist.heat === 0.9 && c.height === 12 && c.reaction === -2 && !("breasts" in c), c);
}

{
  const s = newGame({ seed: "genome-cost" });
  const spec = readWords("blue skin");
  const q = quote(s, "both", spec);
  check("priced by the head and by how hard it is", q.cost === (Math.round(s.arcology.population) * PER_CITIZEN + slavesOf(s).length * PER_SLAVE) * spec.complexity, q);
  check("slaves alone cost only the slaves", quote(s, "slaves", spec).cost === slavesOf(s).length * PER_SLAVE * spec.complexity);
}

{
  const s = newGame({ seed: "genome-apply" });
  s.arcology.cash = 5_000_000;
  await design(s, { name: "Azure", text: "Blue skin and silver hair, resistant to heat.", target: "both" });
  const before = { mod: cultureOf(s).norms.modification, cash: s.arcology.cash, cost: quote(s, "both", genomeOf(s).draft!.spec).cost };
  const line = apply(s);
  const her = slavesOf(s)[0];
  check("it costs what it was quoted", s.arcology.cash === before.cash - before.cost, line);
  check("every slave's body is rewritten", slavesOf(s).every((p) => /blue \(engineered\)/.test(p.body.skin) && p.body.hair_color === "silver"));
  check("the art draws her blue", /#5b8eb7/i.test(styleFor(her, "x")), styleFor(her, "x").slice(0, 200));
  check("the narrator reads it on her", /Azure program/.test(her.body.appearance_facts));
  check("the city is pushed toward remade bodies", cultureOf(s).norms.modification > before.mod);
  check("and every narrator reads what was done", /Azure program/.test(cultureBrief(s)) && /citizens/.test(genomeBrief(s)));
  check("most citizens now look like it", prevailingLook(s, "citizens").skin === "blue");
  check("heat resistance covers slaves and citizens", resistance(s, "heat", "slaves") > 0.5 && resistance(s, "heat", "citizens") > 0.5);
  s.arcology.population += 600;
  const more = topUp(s, "gene_1_0", true);
  check("newcomers dilute it, and can be reached for their share", resistance(s, "heat", "citizens") < 0.5 && more.citizens === 600, { r: resistance(s, "heat", "citizens"), more: more.citizens });
}

{
  // A heatwave costs less and hurts less once the edit is in.
  const a = newGame({ seed: "genome-heat" }), b = newGame({ seed: "genome-heat" });
  b.arcology.cash = 5_000_000;
  await design(b, { name: "Salamander", text: "resistant to heat", target: "both" });
  apply(b);
  b.arcology.cash = a.arcology.cash;
  for (const s of [a, b]) { const w = worldOf(s); w.forecast = [{ kind: "heatwave", week: s.arcology.week + 1 }, ...w.forecast.slice(1)]; }
  const cool = (r: ReturnType<typeof endWeek>) => -r.ledger.filter((l) => /cooling during the heatwave/.test(l.label)).reduce((n, l) => n + l.cash, 0);
  const ra = endWeek(a), rb = endWeek(b);
  check("a heat-resistant city pays less to cool itself", cool(rb) > 0 && cool(rb) < cool(ra) * 0.8, { without: cool(ra), with: cool(rb) });
}
