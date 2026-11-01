/**
 * HER AGE AND HER PAST. Asked in a scene how old she was and where she came from, she gave two
 * things her page didn't say. Her card had her age at the top and the age she arrived at in the body
 * line, which no birthday ever moved; and the life story on her page was never on her card at all.
 */
import { check } from "./harness.ts";
import { newGame, sanitize } from "../src/engine/state.ts";
import { personCard } from "../src/engine/prompts.ts";
import { tickAge } from "../src/engine/pregnancy.ts";

{
  const s = newGame({ seed: "age-and-past", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;
  her.persona.background = "She grew up over her uncle's bakery in Lviv and ran the till from the age of twelve.";
  const was = her.age;
  check("the body line opens with her age", her.body.appearance_facts.startsWith(`${was},`), her.body.appearance_facts);

  s.arcology.week = her.birth_week + 52 * Math.ceil((s.arcology.week - her.birth_week + 1) / 52);
  tickAge(s, her);
  const card = personCard(s, her);
  check("a birthday moves her age", her.age === was + 1);
  check("and the body line moves with it", her.body.appearance_facts.startsWith(`${was + 1},`), her.body.appearance_facts);
  check("so her card has one age", !new RegExp(`\\b${was}\\b`).test(card.split("\n").filter((l) => /^(###|BODY|AGE)/.test(l)).join("\n")), card);
  check("said plainly, as canon", card.includes(`She is ${was + 1}.`));
  check("and the life story her page shows is on her card", card.includes("her uncle's bakery in Lviv"));

  // A save from before this: the body line still says the age she arrived at.
  her.body.appearance_facts = her.body.appearance_facts.replace(/^\d+,/, `${was},`);
  const again = sanitize(JSON.parse(JSON.stringify(s))).people[her.id];
  check("an old save's body line is put right on load", again.body.appearance_facts.startsWith(`${again.age},`), again.body.appearance_facts);
}
