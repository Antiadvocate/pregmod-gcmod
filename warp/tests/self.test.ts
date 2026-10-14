/**
 * SELF — the narrator writes the owner as the player has played them, and the power as it stands.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { applyDeed } from "../src/engine/deeds.ts";
import { selfBrief, selfProfile, powerBetween } from "../src/engine/self.ts";
import { personCard, digest } from "../src/engine/prompts.ts";
import { romanceOf } from "../src/engine/romance.ts";

{
  const s = newGame({ seed: "self", starting_slaves: 3 } as never);
  const [a, b] = Object.values(s.people).filter((p) => p.status === "owned");
  check("with no record, no stock personality", selfProfile(s).some((l) => /don't supply a stock personality/.test(l)));
  for (let i = 0; i < 3; i++) applyDeed(s, { id: `d${i}`, week: 1, person: a.id, summary: "You were gentle with her.", tags: ["tenderness"], public: false, witnesses: [], effects: [], source: "test" });
  applyDeed(s, { id: "k", week: 1, person: a.id, summary: "You knelt to her.", tags: ["owner_submitted"], public: false, witnesses: [], effects: [], source: "test" });
  const prof = selfProfile(s).join("\n");
  check("a gentle record makes a gentle owner", /mostly with care/.test(prof), prof);
  check("and kneeling is part of who you are", /submit by choice/.test(prof));
  s.player.self = "Soft-spoken. I ask, I don't order.";
  check("your own words come first", selfProfile(s)[0].includes("Soft-spoken"));
  check("and reach every scene", digest(s, "kiss her").includes("WHO THE OWNER IS") && selfBrief(s).includes("never fall back on a stock".replace("never", "Never")));

  check("an owned slave doesn't tell her owner off", /doesn't tell you to fuck off/.test(powerBetween(s, b)));
  romanceOf(a).dominion = 60;
  check("one who holds the power leads", /she holds it/.test(powerBetween(s, a)));
  check("you defer to her, by the record", selfProfile(s).some((l) => l.includes("defer to") && l.includes(a.name)));
  check("and her card says so", personCard(s, a, "").includes("THE POWER BETWEEN YOU: she holds it"));
}
