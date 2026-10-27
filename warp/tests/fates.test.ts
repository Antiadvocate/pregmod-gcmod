/**
 * FATES — someone you had dealt with stays dealt with, and what came after grows out of it.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { powers, empireOf } from "../src/engine/power.ts";
import { governorCandidates, governorshipOf, installGovernor, tickGovernors, governorBrief, GOV_ORDERS } from "../src/engine/governor.ts";
import { settle, settledBrief, weightBrief, sameName, asFate } from "../src/engine/fates.ts";
import { HOUSE_STYLE } from "../src/engine/prompts.ts";
import { openHooks, chronicle } from "../src/engine/chronicle.ts";

check("names match the way people use them", sameName("Tomas Reyes", "Reyes") && sameName("Tomas Reyes", "tomas reyes") && !sameName("Tomas Reyes", "Tom"));
check("an order's wording is read as a fate", asFate("kill") === "dead" && asFate("throw him out") === "exiled" && asFate("pay him off") === "bought" && asFate("tickle") === undefined);

// The governor who keeps saying she'll deal with the dock boss.
{
  const s = newGame({ seed: "fates-gov", starting_slaves: 4 } as never);
  const place = powers(s).find((p) => p.kind === "neighbour")!;
  empireOf(s).powers[place.id].status = "vassal";
  const her = governorCandidates(s)[0];
  installGovernor(s, place.id, her.id);
  const g = governorshipOf(s, place.id)!;
  const boss = g.faces![0];
  boss.leaning = -0.8;
  g.problems = [{ id: "rival-1", kind: "rival", text: `${boss.name}, ${boss.role}, is holding meetings about ${her.name}.`, need: "troops", severity: 5, since: s.arcology.week, face: boss.name }];
  chronicle(s, { keys: [`gov:${place.id}`], text: "trouble", hook: `what to do about ${boss.name}` });
  const line = GOV_ORDERS.deal_with.run(s, g, her, `${boss.name}: kill`);
  check("telling her to deal with him gets it done", !!boss.gone && boss.gone.fate === "dead", line);
  check("the trouble he was making ends with him", !(g.problems ?? []).some((x) => x.face === boss.name));
  check("what was waiting on him closes", openHooks(s, [`gov:${place.id}`]).every((e) => !e.hook!.includes(boss.name)));
  check("she isn't told he's still around", !governorBrief(s, g).includes(`PEOPLE SHE DEALS WITH THERE: ${boss.name}`) && /GONE, AND STAYING GONE/.test(governorBrief(s, g)));
  check("and every writer is told he's dead", settledBrief(s).includes(boss.name));
  for (let i = 0; i < 6; i++) { s.arcology.week++; tickGovernors(s); }
  const next = g.faces!.find((f) => f.after === boss.name);
  check("somebody takes his job", !!next && next.role === boss.role, g.faces);
  check("he never comes back", g.faces!.filter((f) => f.name === boss.name).length === 1 && !!g.faces!.find((f) => f.name === boss.name)!.gone);
  check("an unknown name does nothing", GOV_ORDERS.deal_with.run(s, g, her, "Nobody Atall: kill") === "");
}

// A story whose antagonist you had killed is over; a job somebody else can hold passes on.
{
  const s = newGame({ seed: "fates-heir", origin: "heir", starting_slaves: 4 } as never);
  const creditor = s.story!.cast.creditor!;
  settle(s, creditor.name, "dead", "Your guards put two bullets in him on his yacht.");
  check("the creditor is dead in the story", creditor.status === "dead" && !!creditor.outside);
  check("and his story is over", !!s.story!.arcs["heir"]?.done, s.story!.arcs["heir"]);
  let back = false;
  for (let w = 0; w < 10; w++) { endWeek(s); if (s.story!.pending?.arc === "heir") back = true; s.story!.pending = undefined; }
  check("it never comes back", !back);
  check("a second settle does nothing", settle(s, creditor.name, "dead", "again").length <= 1);
}

check("the house style says people outside know who they're dealing with", /OUTSIDERS AND RIVALS/.test(HOUSE_STYLE));
{
  const s = newGame({ seed: "fates-weight", starting_slaves: 2 } as never);
  check("the owner's weight is written out", /THE OWNER'S WEIGHT/.test(weightBrief(s)));
  s.arcology.security = 10; s.arcology.cash = -5000;
  check("and a weak owner is told so", /weaker than they should be/.test(weightBrief(s)));
}
