/**
 * LAWS ARE WHAT YOU WROTE — invented clauses aren't recorded, and can be stripped.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { writeLaw, lawsBrief } from "../src/engine/court.ts";
import { applyDiff } from "../src/engine/turn.ts";
import { inventsLaw, stripLawInventions } from "../src/engine/lawguard.ts";
import { digest } from "../src/engine/prompts.ts";
import type { SaveState } from "../src/engine/types.ts";

{
  const s = newGame({ seed: "guard", starting_slaves: 3, plot: false } as never) as SaveState;
  s.arcology.rep = 9000;
  writeLaw(s, { name: "Kneeling Act", text: "Every citizen kneels when a slave of the owner's household passes.", push: [{ norm: "reversal", dir: 1 }], effects: [] });
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  check("spots an invented subsection", inventsLaw(s, "Under subsection 3 of the Kneeling Act, pregnant citizens are exempt."));
  check("leaves ordinary mentions alone", !inventsLaw(s, "A man kneels in front of Mira because of the Kneeling Act."));
  applyDiff(s, {
    canon_add: ["Section 2 of the Kneeling Act exempts citizens over sixty.", "The fountain was repaired."],
    rumors: [{ content: "people say the Kneeling Act has a loophole for merchants" }],
    memories: [{ id: her.id, content: "the owner amended the Kneeling Act to add an exemption for guards" }],
  }, "prose");
  check("the bookkeeper can't record invented clauses", !s.canon.some((c) => /Section 2/.test(c)) && s.canon.includes("The fountain was repaired.") && !s.rumors.some((r) => /loophole/.test(r.content)) && !s.memory[her.id].episodic.some((e) => /amended/.test(e.content)));
  // Ones that got in before the guard existed.
  s.canon.push("Article 4 of the Kneeling Act requires kneeling on both knees.");
  s.rumors.push({ id: "r1", content: "the Kneeling Act has a clause about Sundays", truth: "false", salience: 5, charge: 0, knowers: [], week: 1 } as never);
  s.history.push({ week: 1, turn: 1, action: "x", mode: "do", prose: "", summary: "The owner added an exemption to the Kneeling Act for pregnant slaves." } as never);
  const n = stripLawInventions(s);
  check("stripping removes what already got in", n >= 3 && !s.canon.some((c) => /Article 4/.test(c)) && !s.rumors.some((r) => /clause/.test(r.content)), n);
  check("and tells the narrator the law is only its text", /Kneeling Act is exactly what its text says/.test(digest(s)));
  check("the law itself is untouched", /Kneeling Act: Every citizen kneels when a slave of the owner's household passes\./.test(lawsBrief(s)));
  const { HOUSE_STYLE, BOOKKEEPER_SYSTEM } = await import("../src/engine/prompts.ts");
  const { WALK_SYSTEM } = await import("../src/engine/walk.ts");
  check("the scene, walk and bookkeeper prompts all carry the rule", [HOUSE_STYLE, WALK_SYSTEM].every((x) => /Never invent clauses, subsections/.test(x)) && /Never record a new clause/.test(BOOKKEEPER_SYSTEM));
}
