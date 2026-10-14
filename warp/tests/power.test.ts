/**
 * POWER — your own skills, your arsenal, war, and the other powers.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { buyTraining, skill, tickTraining, trainingCost } from "../src/engine/player.ts";
import { militaryStrength } from "../src/engine/city.ts";

{
  const s = newGame({ seed: "skills", starting_slaves: 2 } as never);
  s.arcology.cash = 10_000_000;
  const before = s.player.skills.command ?? 0;
  const str0 = militaryStrength(s);
  const r = buyTraining(s, "command", "implant");
  check("an implant raises a skill today", r.ok && (s.player.skills.command ?? 0) > before + 10, r);
  check("and command makes your forces stronger", militaryStrength(s) > str0, [str0, militaryStrength(s)]);
  check("the dearer the better you are", trainingCost(s, "command", "tutor") > trainingCost(s, "medicine", "tutor") || (s.player.skills.medicine ?? 0) > (s.player.skills.command ?? 0));

  const d0 = s.player.skills.diplomacy ?? 0;
  check("a course takes weeks", buyTraining(s, "diplomacy", "course").ok && !!s.player.training);
  check("and only one at a time", !buyTraining(s, "hacking", "tutor").ok);
  for (let i = 0; i < 4; i++) tickTraining(s);
  check("then it's done, and you're better", !s.player.training && (s.player.skills.diplomacy ?? 0) > d0 + 10, s.player.skills.diplomacy);
  check("diplomacy warms the neighbours", skill.diplomacy(s) > 0);
  endWeek(s);
}
