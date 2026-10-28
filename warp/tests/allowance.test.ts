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
import { refresh } from "../src/engine/obedience.ts";
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
  check("but she never says that's why", /HER MONEY[^\n]*She never says that's why/.test(card) && !/brings it up in ordinary conversation/.test(card));
  check("and her nature is for showing, not saying", /HER NATURE, below, is for you to show[^\n]*never names it/.test(card));
}

// Her kinks as who she is, and how far they reach you: strength against ease, fear and room.
{
  const { natureLines, reachOf } = await import("../src/engine/nature.ts");
  const { setLatitude } = await import("../src/engine/self.ts");
  const s = newGame({ seed: "nature", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  her.persona.fetishes = [{ name: "dom", strength: 70, known: true }];
  her.persona.paraphilia = "abusive" as never;
  her.persona.quirk = undefined; her.persona.flaw = undefined;
  const tight = () => { her.bond.fear = 80; her.psyche.relaxation = -6; };
  const easy = () => { her.bond.fear = 10; her.psyche.relaxation = 6; her.bond.bond = 95; her.bond.hope = 90; };
  tight();
  const lines = natureLines(s, her);
  check("a kink is written as who she is, all day", lines.some((l) => /HER NATURE \(dom\)\. It shows all day, not just in bed\. She's bossy by nature/.test(l)), lines);
  check("a paraphilia is who she is", lines.some((l) => /HER NATURE \(abusive, a need\)\. It's who she is, all day/.test(l)));
  check("afraid of you, she buries it around you", reachOf(s, her, 100) === "held" && lines.some((l) => /Around you she buries it/.test(l)));
  her.bond.fear = 30; her.psyche.relaxation = 3; her.bond.bond = 80; her.bond.hope = 80;
  refresh(her, s.memory[her.id]);
  check("comfortable, a strong one slips out on you, and she backs off", reachOf(s, her, 70) === "slips" && natureLines(s, her).some((l) => /HER NATURE \(dom\)[^\n]*slips out on you before she thinks[^\n]*backs off at once/.test(l)), natureLines(s, her));
  check("a weak one stays in its place", reachOf(s, her, 40) === "kept");
  easy(); refresh(her, s.memory[her.id]);
  const r = reachOf(s, her, 100);
  check("very strong, relaxed, trusting and unafraid, she just does it", r === "takes" && natureLines(s, her).some((l) => /abusive, a need[^\n]*With you, she does it without asking, like shoving you down/.test(l)), [r, her.bond]);
  her.bond.fear = 30; her.psyche.relaxation = 3;
  setLatitude(s, her, "free");
  check("with room given, a slip isn't something she backs off from", natureLines(s, her).some((l) => /HER NATURE \(dom\)[^\n]*she doesn't back off/.test(l)));
  check("and her card carries it", /HER NATURE \(dom\)/.test(personCard(s, her, "")));
}

// What a scene leaves behind: analysis never makes it onto her card, and old saves lose theirs.
{
  const { addWays, waysBrief } = await import("../src/engine/ways.ts");
  const s = newGame({ seed: "records", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  const kept = addWays(s, her, ["When she names a price he pays it or he says no plainly, and neither of them pretends the money was a favour", "he kneels and kisses each of her toes before she'll talk to him"]);
  check("a way written as analysis isn't kept", kept.length === 1 && /kisses each of her toes/.test(kept[0]), kept);
  her.ways = [...(her.ways ?? []), { text: "being paid is not the same as being kept, and neither of them pretends otherwise", week: 1 }];
  check("nor shown, if an old save has one", !/not the same as/.test(waysBrief(her)));
  sanitize(s);
  check("and loading clears it out", !(her.ways ?? []).some((w) => /not the same as/.test(w.text)));
}

