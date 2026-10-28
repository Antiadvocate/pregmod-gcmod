/**
 * WHO SHE IS STAYS WHO SHE IS. A slave cast into another woman's event under her own name was filed
 * as an outsider, got a kitchen job and a fate of her own, and from then on there were two of her;
 * a cook came back with a new surname; a guard and the rival owner were folded into one man. An
 * abusive dom with no conscience was re-read as "stops when a body says stop". And a stolen cake
 * wrote a follow-up that wrote a follow-up, for a month.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { personCard } from "../src/engine/prompts.ts";
import { settleFaces } from "../src/engine/faces.ts";
import { adultText } from "../src/engine/faceid.ts";
import { file } from "../src/engine/others.ts";
import { unsoften } from "../src/engine/soft.ts";
import { hasHeat, hotHooks } from "../src/engine/chronicle.ts";

{
  const s = newGame({ seed: "drift", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  her.name = "Élise"; her.surname = "Girard";
  check("a model casting one of yours by full name doesn't file a stranger", file(s, "Élise Girard", "runs the kitchens") === undefined && !s.faces?.["élise girard"]);
  const cook = file(s, "Mireille Faucher", "scullery slave, seventeen, sleeves pushed up")!;
  check("filed outsiders get an id, and never a child's age", /^f-/.test(cook.id ?? "") && /nineteen/.test(cook.what ?? "") && !/seventeen/.test(cook.what ?? ""), cook.what);
  check("the same cook under a new surname is the same cook", file(s, "Mireille Fontaine", "the kitchen cook") === cook && (cook.aliases ?? []).includes("Mireille Fontaine"));
  check("ages are made adult however they're written", adultText("French girl, 16, quiet") === "French girl, 19, quiet" && adultText("a 15-year-old runner") === "a 19-year-old runner");

  // An old save with the damage already in it.
  s.faces!["élise girard"] = { name: "Élise Girard", pronoun: "she", age: 19, first: 2, last: 13, seen: 5, what: "owns the kitchens", fate: { fate: "exiled", week: 13, how: "fired" } } as never;
  s.faces!["tomas řehák"] = { name: "Tomas Řehák", pronoun: "he", age: 24, first: 11, last: 11, seen: 1, what: "young cellblock guard" } as never;
  s.faces!["tomas castellan"] = { name: "Tomas Castellan", pronoun: "he", age: 50, first: 1, last: 1, seen: 0, role: "rival_owner" } as never;
  settleFaces(s);
  check("a copy of one of yours on file is dropped, with its fate", !s.faces!["élise girard"]);
  check("a guard and the rival owner with one first name stay two men", !!s.faces!["tomas řehák"] && !!s.faces!["tomas castellan"]);

  // The softness the re-reading wrote into a cold, abusive woman comes out.
  her.persona.paraphilia = "abusive"; her.persona.conscience = 0.2;
  her.persona.core_traits = ["Mean in bed and unapologetic about it", "Careful underneath it: stops when a body says stop"];
  her.persona.signature = "She will stop dead in the middle of it and ask, plainly, whether you can take it.";
  her.persona.life_history = "She found she wanted control. Week six she went pink and said no when you begged.";
  check("her softness is taken out", unsoften(s, her) && her.persona.core_traits.length === 1 && !her.persona.signature && her.persona.life_history === "She found she wanted control.", her.persona);
  const c = personCard(s, her, "");
  check("and low conscience reads as a prick, near the top of her card", /CONSCIENCE, which is low, and it makes her a prick/.test(c) && c.indexOf("CONSCIENCE") < c.indexOf("BODY:"));
  const kind = newGame({ seed: "drift kind", starting_slaves: 1 } as never);
  const nice = Object.values(kind.people).find((p) => p.status === "owned")!;
  nice.persona.paraphilia = undefined; nice.persona.fetishes = []; nice.persona.conscience = 0.8;
  nice.persona.core_traits = ["gentle with the new girls"];
  check("a gentle woman keeps her gentleness", !unsoften(kind, nice) && nice.persona.core_traits[0] === "gentle with the new girls");

  // Threads without heat aren't carried on.
  check("a cake isn't a thread, a cage is", !hasHeat("Ashley keeps a list of what she owes for the cake") && hasHeat("she keeps the key to his cage"));
  s.chronicle = [
    { keys: [her.id], title: "Cake", text: "She stole a cake.", hook: "She says she'll steal again and has a list.", week: s.arcology.week, life: 6 },
    { keys: [her.id], title: "Key", text: "She took his key.", hook: "She wants him locked and kneeling tomorrow.", week: s.arcology.week, life: 6 },
  ] as never;
  check("only the thread with heat in it is offered to the event writer", hotHooks(s, [her.id]).map((h) => h.title).join() === "Key");
}
