/**
 * THE SHARED CHAIR, and the people who aren't yours.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { romanceOf } from "../src/engine/romance.ts";
import { tickReign } from "../src/engine/reign.ts";
import { handOf, herSay, askForHand, giveHandUp } from "../src/engine/share.ts";
import { meet } from "../src/engine/faces.ts";
import { note, tie, tiedTo } from "../src/engine/others.ts";
import { orderDealt, settledBrief } from "../src/engine/fates.ts";
import { personCard } from "../src/engine/prompts.ts";

function owned(seed: string, asked: boolean, style?: string) {
  const s = newGame({ seed, starting_slaves: 4, plot: false } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;
  const rom = romanceOf(her); rom.standing = "keeper"; rom.dominion = 100; her.status = "free";
  s.player.owned_by = her.id;
  s.player.ask_hand = asked;
  tickReign(s);
  if (style) s.reign!.style = style as never;
  return { s, her };
}

{
  const { s } = owned("hand-none", false);
  check("kneeling without asking leaves you no say", handOf(s) === "locked");
  check("and nothing you press goes through", !herSay(s, "laws", "Enact the law").ok);
}
{
  const { s, her } = owned("hand-ask", true);
  s.reign!.style = "reluctant"; s.reign!.hand = undefined; s.reign!.favour = 20;
  s.player.ask_hand = true;
  tickReign(s);
  check("a woman who never wanted it lets you keep a hand in", handOf(s) === "shared", s.reign!.hand);
  let stopped = 0;
  for (let i = 0; i < 40; i++) if (!herSay(s, "people", `Sell ${Object.values(s.people).find((p) => p.status === "owned" && p.id !== her.id)!.name.split(" ")[0]} ${i}`).ok) stopped++;
  check("with a hand in, most things go through", stopped < 40);
  s.reign!.style = "vengeful"; s.reign!.favour = -60;
  let stopped2 = 0;
  for (let i = 0; i < 40; i++) if (!herSay(s, "laws", `Free everyone ${i}`).ok) stopped2++;
  check("and a woman who wants it her way overrules you", stopped2 > 5, stopped2);
  const a = herSay(s, "laws", "Free everyone 3"), b = herSay(s, "laws", "Free everyone 3");
  check("asking again the same week isn't a reroll", a.ok === b.ok);
  check("what she stopped is on her record", (s.reign!.overruled ?? []).length > 0 && s.notifications.some((n) => n.id.startsWith("hand-")));
  s.arcology.week++; tickReign(s);
  check("overrule her enough and she takes the keys", handOf(s) === "locked");
  check("asking straight back is refused", /so soon|no/i.test(askForHand(s)) && handOf(s) === "locked");
  giveHandUp(s);
  check("you can give her all of it", handOf(s) === "locked");
}
{
  const s = newGame({ seed: "others", starting_slaves: 3, plot: false } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;
  const f = meet(s, { name: "Marco Ruiz", pronoun: "he", age: 34 })!;
  f.what = "runs the fish market on the lower docks";
  tie(f, "her husband", her.id);
  note(s, f, "the owner gave him Ana's hand at the market altar");
  check("someone tied to one of yours is kept", !!f.kept && tiedTo(s, her.id).length === 1);
  check("her card knows who's in her life", /CONNECTIONS OUTSIDE THE HOUSEHOLD: Marco Ruiz, her husband/.test(personCard(s, her)) && /fish market/.test(personCard(s, her)));
  const lines = orderDealt(s, "Marco Ruiz", "dead");
  check("you can have them dealt with yourself", f.fate?.fate === "dead" && lines.length > 0);
  check("and every writer knows he's dead", settledBrief(s).includes("Marco Ruiz"));
  check("and she knows her husband is dead", /Marco Ruiz, her husband \(DEAD since week/.test(personCard(s, her)), personCard(s, her).split("\n").find((l) => /PEOPLE IN HER LIFE/.test(l)));
}
