/**
 * WHO THE OWNER IS. The owner was "they" for everyone and the body was one line in one prompt, so
 * the model gave the player a cock in one scene and a pussy in the next. These hold the choice,
 * the default for old saves, and the statement every model call carries.
 */
import { check } from "./harness.ts";
import { newGame, sanitize } from "../src/engine/state.ts";
import { inferPronouns, ownerLine, genderWord, settleBody } from "../src/engine/you.ts";
import { digest } from "../src/engine/prompts.ts";
import { setOwnerContext, withOwner } from "../src/llm.ts";

check("Mistress means she", inferPronouns("cock", "Mistress") === "she/her");
check("Sir means he", inferPronouns("pussy", "Sir") === "he/him");
check("with no telling title, a cock means he", inferPronouns("cock", "Owner") === "he/him");
check("and a pussy or both means she", inferPronouns("pussy", "Owner") === "she/her" && inferPronouns("both") === "she/her");

{
  const s = newGame({ seed: "own-pussy", kit: "pussy", address: "Mistress" });
  check("a new game with a pussy and Mistress is a woman", s.player.pronouns === "she/her" && genderWord(s) === "a woman");
  const line = ownerLine(s);
  check("the owner line says what she has", /HAS a pussy/.test(line) && /DOES NOT HAVE a cock, balls/.test(line), line);
  check("and how to refer to her", /she\/her/.test(line) && /"Mistress"/.test(line));
  check("the scene prompt carries it", digest(s).includes(line));
}

{
  const s = newGame({ seed: "own-chosen", kit: "both", pronouns: "he/him", address: "Master" });
  check("a chosen pronoun is kept", s.player.pronouns === "he/him" && s.player.pronouns_set === true);
  check("and both halves are said", /a man who has a pussy as well as a cock/.test(ownerLine(s)));
}

{
  // A save from before the choice: "they", a pussy, called Mistress.
  const s = newGame({ seed: "own-old", kit: "pussy" });
  s.player.pronouns = "they/them"; s.player.pronouns_set = undefined; s.player.address = "Mistress";
  const loaded = sanitize(JSON.parse(JSON.stringify(s)));
  check("an old save is settled from body and title", loaded.player.pronouns === "she/her" && loaded.player.pronouns_set === true);
  loaded.player.pronouns = "they/them";
  check("and a 'they' chosen after that stays", sanitize(loaded).player.pronouns === "they/them");
  settleBody(loaded, "cock");
  check("a changed body changes what the line says", /HAS a cock, balls/.test(ownerLine(loaded)) && /DOES NOT HAVE a pussy/.test(ownerLine(loaded)));
}

{
  const s = newGame({ seed: "own-call", kit: "pussy", address: "Mistress" });
  setOwnerContext(ownerLine(s));
  const out = withOwner({ system: "You write a scene.", user: "She kneels." });
  check("every model call is told who the owner is", out.system.includes("THE OWNER (the player") && out.system.includes("HAS a pussy"));
  const already = withOwner({ system: "x", user: digest(s) });
  check("but not twice when the prompt already says it", already.system === "x");
  setOwnerContext("");
}
