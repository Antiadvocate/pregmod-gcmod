/**
 * HER OWN MONEY: an allowance the owner names in a scene is paid every week out of the arcology's
 * cash into her purse, she spends some of it, the scenes know what she has, and a kink about being
 * paid reads as how she is all day, not only in bed.
 */
import { check } from "./harness.ts";
import { newGame, sanitize } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { personCard } from "../src/engine/prompts.ts";
import { applyDiff } from "../src/engine/turn.ts";
import { allowanceOf, captureAllowance, moneyIn, purseOf, readAllowance, setAllowance } from "../src/engine/allowance.ts";

check("money is read the way people say it", moneyIn("100k") === 100000 && moneyIn("¤1.5m") === 1500000 && moneyIn("100,000") === 100000 && moneyIn("fifty thousand") === 50000);
check("a weekly stipend is heard", readAllowance("Now I also want to give you a stipend. Maybe 100k a week?")?.amount === 100000);
check("and so is stopping it", readAllowance("I'm going to stop your allowance.")?.amount === 0);
check("but a price isn't an allowance", readAllowance("That dress cost 100k.") === null);

{
  const s = newGame({ seed: "purse", starting_slaves: 2 } as never);
  const [her, other] = Object.values(s.people).filter((p) => p.status === "owned");
  check("saying it to one woman sets hers", !!captureAllowance(s, "I'll give you an allowance of 100k a week.", [her]) && allowanceOf(her) === 100000);
  check("said to two, it lands on nobody", !captureAllowance(s, "I'll pay you 5k a week.", [her, other]) && !allowanceOf(other));
  s.arcology.cash = 1_000_000;
  const before = s.arcology.cash;
  endWeek(s);
  check("it's paid out of the arcology's cash", s.arcology.cash <= before - 100000 + 1_000_000 && (s.reports.at(-1)?.ledger ?? []).some((l: { category: string; cash: number }) => l.category === "allowance" && l.cash === -100000), s.reports.at(-1)?.ledger);
  check("into her own purse, some of it maybe spent", purseOf(her) > 0 && purseOf(her) <= 100000, purseOf(her));
  check("and her card says what she has and that it's hers", /HER MONEY\. The owner pays her an allowance of ¤100,000 a week, hers to spend/.test(personCard(s, her, "")));
  const had = purseOf(her);
  applyDiff(s, { spent: [{ id: her.id, amount: 2500, what: "a dress" }] } as never, "", "");
  check("what she buys in a scene comes out of it", purseOf(her) === Math.max(0, had - 2500), [had, purseOf(her)]);
  setAllowance(her, 0);
  check("stopping it keeps a 0, so old promises don't restart it", her.allowance === 0 && !allowanceOf(her));

  // A save from before: the promise is only in her memory.
  delete other.allowance;
  s.memory[other.id].facts.push({ text: "The owner is paying her 100k a week and wants her to stay around.", week: s.arcology.week - 3 });
  const cash = s.arcology.cash;
  sanitize(s);
  check("an old save's promise becomes a real allowance", allowanceOf(other) === 100000, other.allowance);
  check("with the weeks she was owed paid in", purseOf(other) === 300000 && s.arcology.cash === cash - 300000, [purseOf(other), cash - s.arcology.cash]);

  // Findom: how she is all day, written as such, and the money is part of it.
  other.persona.fetishes = [{ name: "findom", strength: 93, known: true }];
  other.persona.behavior = { quirk: "Findom" } as never;
  const card = personCard(s, other, "");
  check("a strong kink is loved, not just liked", /HER FETISH: findom, and she loves it/.test(card));
  check("findom reads as day to day, not only bed", /HER FETISH: findom[^\n]*Day to day as much as in bed/.test(card));
  check("a quirk written in by hand says what it means", /HER WAY: Findom\. This is how she is day to day[^\n]*wetter than anything/.test(card));
  check("and being paid is her kink on the money line too", /HER MONEY[^\n]*Being paid is her kink/.test(card));
}
