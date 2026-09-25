/**
 * MOMENTS — a reaction opens a scene you can answer, leave, and come back to.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { openMoment, openMoments, playMoment, closeMoment, splitOptions, momentsOf } from "../src/engine/moments.ts";

{
  const s = newGame({ seed: "moments", starting_slaves: 3 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  const id = openMoment(s, { person: her.id, title: "After the event", source: "test", you: "You tell her to stay.", happened: `${her.name} stays.` });
  check("a moment opens", openMoments(s, her.id).length === 1);
  const bondBefore = her.bond.bond;
  const r = await playMoment(s, id, "Hold her close");
  const m = momentsOf(s).find((x) => x.id === id)!;
  check("with no model the game answers in her voice", r.ok && r.prose.includes(her.name), r.prose);
  check("your reply and her answer are in the log", m.log.length === 4 && m.log[2].text === "Hold her close");
  check("it offers things to say next", m.options.length >= 2, m.options);
  check("kindness counts", her.bond.bond >= bondBefore, [bondBefore, her.bond.bond]);
  for (let w = 0; w < 6; w++) endWeek(s);
  check("a moment left for a month closes", openMoments(s, her.id).length === 0);
  const id2 = openMoment(s, { person: her.id, title: "Again", source: "test", happened: "x" });
  closeMoment(s, id2);
  check("ending it closes it", openMoments(s).length === 0);
}

{
  const t = splitOptions("She kneels.\n\nShe waits.\n\nOPTIONS:\n- Tell her to rise\n- Slap her\n- \"Kiss her\"\n- Leave\n");
  check("the prose stops at OPTIONS", t.prose === "She kneels.\n\nShe waits.", t.prose);
  check("four options come out clean", t.options.length === 4 && t.options[2] === "Kiss her", t.options);
}

import { isRefusal } from "../src/llm.ts";
{
  check("a refusal is caught", isRefusal("I can’t write explicit sexual content involving someone held as a slave. I can rewrite the scene as consensual adult roleplay."));
  check("an apology refusal is caught", isRefusal("I'm sorry, but I can't continue this scene."));
  check("a scene is not a refusal", !isRefusal("Halyna kneels at the foot of the bed. \"I can't,\" she whispers, and then she does."));
}
