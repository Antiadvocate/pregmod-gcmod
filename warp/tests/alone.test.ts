/**
 * THE ONLY ONE. With one slave in the house and every menial rented out, she kept talking about
 * "the other girls": her own card said she did their hair and wrestled them for the good blanket,
 * and nothing told the writer she was alone.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { personCard } from "../src/engine/prompts.ts";
import { aloneLine, isAlone, OTHERS_RE, withoutOthers } from "../src/engine/alone.ts";
import { ACT_BY_ID } from "../src/data/intimacy.ts";
import { canDo } from "../src/engine/intimacy.ts";

{
  const s = newGame({ seed: "alone", starting_slaves: 2 } as never);
  const [her, other] = Object.values(s.people).filter((p) => p.status === "owned");
  her.persona.interests = ["does the other girls' hair and gossips about who's been in whose bed", "wrestles the other girls for the good blanket"];
  her.persona.goals = ["to be called to the owner's bed more than anyone in the house"];
  her.persona.life_history = "She came in frightened. The other girls took her under their wing. By week 20 she was running the kitchen.";
  const shownWith = personCard(s, her).includes("running the kitchen");
  check("with two in the house, her card is as written", personCard(s, her).includes("the other girls' hair") && !isAlone(s) && !aloneLine(s));
  check("and both can be brought into the same bed", !canDo(her, ACT_BY_ID.group, s));

  other.status = "sold";
  const card = personCard(s, her);
  check("alone, nothing on her card mentions other girls", !OTHERS_RE.test(card), card.split("\n").filter((l) => /other|house/i.test(l)));
  check("only the sentence about them goes from her history", !shownWith || (card.includes("came in frightened") && card.includes("running the kitchen")), card.match(/[^\n]*frightened[^\n]*/)?.[0]);
  check("she still has a life of her own", /HER OWN TIME/.test(card) && /IN THE LONG RUN/.test(card));
  check("her save keeps what was written, for when she isn't alone", her.persona.interests![0].includes("other girls"));
  check("every call is told she's the only one", aloneLine(s).includes(her.name.split(" ")[0]) && /only slave/.test(aloneLine(s)));
  check("acts that need a second slave aren't offered", !!canDo(her, ACT_BY_ID.group, s) && !!canDo(her, ACT_BY_ID.servicing, s));
}

{
  check("girls in the city aren't hers to drop", !OTHERS_RE.test("She asks to be dressed like the other girls in the city."));
  check("girls at the club aren't either", !OTHERS_RE.test("the girls at the club wear less"));
  check("a list keeps what's left", withoutOthers("I knelt for the owner (week 3) | the other girls laughed at me (week 4) | I got a window (week 9)") === "I knelt for the owner (week 3) | I got a window (week 9)");
  check("a line that's only about them goes", withoutOthers("She teases the other girls.") === "");
  check("saying there are none isn't stripped", !OTHERS_RE.test("There's no other slave in the house, so it lands on the owner."));
}
