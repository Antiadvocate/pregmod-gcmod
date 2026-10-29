import { check } from "./harness.ts";
import { coarsen, REGISTER_TAIL } from "../src/engine/register.ts";

const pairs: [string, string][] = [
  ["He slid his throbbing length into her core.", "He slid his cock into her pussy."],
  ["She found her release, and he spilled his seed.", "She came, and he spilled his cum."],
  ["He made love to her until her folds were slick.", "He fucked her until her pussy lips were slick."],
  ["You kiss her breasts and tease her sensitive nub.", "You kiss her tits and tease her clit."],
  ["She presses your manhood against her tight entrance.", "She presses your cock against her tight entrance.".replace("her tight entrance", "her hole")],
  ["She shook and came undone.", "She shook and came."],
];
for (const [a, b] of pairs) check(`coarsen: ${a}`, coarsen(a) === b, coarsen(a));
const innocent = [
  "She bites her bottom lip.", "She makes her entrance in a red dress.", "Her sex life is none of your business.",
  "It shifts her centre of gravity.", "He measures his length of rope.", "She wears a pearl necklace and does up her button.",
  "He hides behind her.", "The core of the arcology hums.", "Her heat-resistant skin shines.",
];
for (const t of innocent) check(`left alone: ${t}`, coarsen(t) === t, coarsen(t));
check("the tail tells the model the context isn't its style", /is not your style/.test(REGISTER_TAIL) && /cock/.test(REGISTER_TAIL));

{
  // Every story bible and scene is shown what this game sounds like, and told what it isn't: a player
  // read a pitch about "watching for the catch" and "kneeling because she wants to, not because she
  // has to" and called it HBO.
  const { FC_VOICE, REGISTER_TAIL } = await import("../src/engine/register.ts");
  const { SAGA_SYSTEM } = await import("../src/engine/saga.ts");
  check("the voice block shows crude, human talk", /'Fuck, you taste like/.test(FC_VOICE) && /armpit/.test(FC_VOICE));
  check("and names the prestige-TV lines as what not to write", /watching for the catch/.test(FC_VOICE) && /not because she has to/.test(FC_VOICE));
  check("every scene request ends with it", REGISTER_TAIL.includes(FC_VOICE));
  check("story bibles get it too", SAGA_SYSTEM.includes(FC_VOICE));
  check("and nothing tells anyone to speak plain", !/plain talk/.test(REGISTER_TAIL));
}
