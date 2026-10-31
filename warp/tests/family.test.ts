/**
 * HER BABY. The narrator wrote a slave pregnant with the owner's child when the game had no such
 * pregnancy, and then wrote the baby, and kept talking about a child nobody could find anywhere.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { personCard } from "../src/engine/prompts.ts";
import { continuitySlips } from "../src/engine/continuity.ts";
import { childrenOf, conceive, familyLine, giveBirth, hasWomb } from "../src/engine/pregnancy.ts";

{
  const s = newGame({ seed: "family", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned" && hasWomb(p))!;
  check("her card says she isn't pregnant, as a fact", /NOT PREGNANT, which is a fact/.test(personCard(s, her)) && /She has no children/.test(familyLine(s, her)));
  check("prose that makes her pregnant is a slip", continuitySlips(s, `${her.name.split(" ")[0]} is pregnant with your child, and she knows it.`, [her]).some((x) => /not pregnant/.test(x)));
  check("so is her saying it", continuitySlips(s, `"I'm pregnant, Master," she says.`, [her]).some((x) => /not pregnant/.test(x)));
  check("and a baby she doesn't have", continuitySlips(s, `She asks if you want to see our baby.`, [her]).some((x) => /no child/.test(x)));
  check("but a child from her old life isn't", !continuitySlips(s, `She says she misses her daughter back in Kyiv.`, [her]).length);

  const f = conceive(s, her, { byOwner: true })!;
  check("she can be made pregnant with the owner's child", !!f && f.by_owner === true && her.womb.fetuses.length === 1);
  check("and her card says it's the owner's", /PREGNANT: 0 weeks[^\n]*the owner's/.test(personCard(s, her)));
  for (const x of her.womb.fetuses) { x.week = 40; x.sex = "XY"; }
  const born = giveBirth(s, her, { safe: true }).born;
  const baby = born[0];
  check("the baby is a real person of yours", !!baby && s.people[baby.id]?.status === "owned" && baby.age === 0);
  check("recorded as hers and the owner's", baby.parents?.mother === her.id && baby.parents?.owner === true);
  check("a son is her son, not her daughter", s.edges.some((e) => e.from === her.id && e.to === baby.id && e.roles.includes("son")));
  check("and her card names him", childrenOf(s, her).includes(baby) && familyLine(s, her).includes(baby.name) && /the owner's/.test(familyLine(s, her)));
  check("and now 'our baby' isn't a slip", !continuitySlips(s, `She asks if you want to see our baby.`, [her]).some((x) => /no child/.test(x)));
}
