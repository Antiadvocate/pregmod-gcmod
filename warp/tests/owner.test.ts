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
import type { Saga } from "../src/engine/saga.ts";

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

/* ── the owner is "you", and only "you" ────────────────────────────────────────────────────── */
{
  const { takeBible, cleanOption, chapterPrompt, biblePrompt, forgetOwnerAsStranger, sagasOf } = await import("../src/engine/saga.ts");
  const { isOwnerName } = await import("../src/engine/you.ts");
  const { facesOf, meet } = await import("../src/engine/faces.ts");
  const s = newGame({ seed: "own-one", kit: "pussy", player_name: "Aurelia Vance", address: "Mistress" });

  check("the owner's names are all the owner", ["Aurelia Vance", "Aurelia", "you", "the Owner", "Mistress", "the player"].every((n) => isOwnerName(s, n)));
  check("and nobody else is", !isOwnerName(s, "Mira Kovač") && !isOwnerName(s, "Aurelian"));
  check("the owner line says they are one person", /ONE person/.test(ownerLine(s)) && /Aurelia Vance/.test(ownerLine(s)));
  check("a stranger can't be filed under the owner's name", meet(s, { name: "Aurelia Vance" }) === undefined && !facesOf(s)["aurelia vance"]);

  const x: Saga = { id: "sg", seed: { id: "t", kind: "own", text: "A rival wants the ninth floor." }, status: "unwritten", title: "", premise: "", stakes: "", acts: [], act: 0, cast: [], facts: [], paths: [], history: [], due: 1, started: 1 };
  sagasOf(s).list.push(x);
  check("the outline prompt tells the narrator not to cast the owner", /Do NOT put the player in the cast, under their name \(Aurelia Vance\)/.test(biblePrompt(s, x)));
  const ok = takeBible(s, x, {
    title: "The Ninth Floor", premise: "A rival moves in.", stakes: "The floor.",
    acts: ["arrival", "war"], paths: [{ id: "a", label: "You win" }, { id: "b", label: "She wins" }],
    cast: [{ name: "Aurelia Vance", role: "the owner" }, { name: "Mira Kovač", role: "the rival", pronoun: "she", age: 30 }],
  });
  check("an outline that casts the owner keeps everyone but the owner", ok && x.cast.length === 1 && x.cast[0].name === "Mira Kovač", x.cast.map((c) => c.name));
  check("and the owner gets no face on file", !facesOf(s)["aurelia vance"]);
  check("the chapter prompt says every option is something you do", /Every option is something YOU do/.test(chapterPrompt(s, x)));
  const o = cleanOption(s, { label: "Let Aurelia decide Mira's fate", outcome: "It is decided." });
  check("an option naming the owner is put in the second person", o?.label === "Let you decide Mira's fate", o?.label);

  // A save where the model already did it.
  x.cast.push({ name: "Aurelia", role: "the owner", want: "", fear: "", toward: 0, now: "", turns: [] });
  s.faces!["aurelia"] = { name: "Aurelia", pronoun: "she", age: 30, seen: 1, first: 1, last: 1 } as never;
  forgetOwnerAsStranger(s);
  check("an old save loses the owner from the cast and the faces", x.cast.every((c) => c.name !== "Aurelia") && !s.faces!["aurelia"]);
}
