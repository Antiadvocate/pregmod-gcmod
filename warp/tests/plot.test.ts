/**
 * THE MAIN PLOT — chapters open on their weeks, the coup reads what you built, and it can be off.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { answer, pendingBeat, optionsFor, pickable } from "../src/engine/story.ts";

function play(seed: string, weeks: number, prefer: Record<string, string>, plot = true) {
  const s = newGame({ seed, starting_slaves: 6, plot } as never);
  s.arcology.cash = 500000;
  const opened: Record<string, number> = {};
  for (let w = 0; w < weeks; w++) {
    endWeek(s);
    for (const [id, run] of Object.entries(s.story!.arcs)) if (id.startsWith("p_") && opened[id] === undefined) opened[id] = run.started;
    for (let i = 0; i < 8; i++) {
      const p = pendingBeat(s);
      if (!p) break;
      const opts = optionsFor(s).filter((o) => !o.locked);
      const o = opts.find((x) => x.id === prefer[`${p.def.id}.${s.story!.pending!.beat}`]) ?? opts.find((x) => !x.pick) ?? opts[0];
      if (!o) break;
      const who = o.pick ? pickable(s, o.id)[0]?.id : undefined;
      if (o.pick && !who) break;
      answer(s, o.id, who);
    }
  }
  return { s, opened };
}

{
  const strong = { "p_militia.arms": "both", "p_mercs.offer": "hire", "p_hacker.offer": "hire", "p_collab.codes": "double", "p_coup.night": "fight", "p_knights.choose": "eagles" };
  const { s, opened } = play("plot-a", 74, strong);
  check("the strip club closes in week 6", opened["p_club"] === 6, opened);
  check("the mercenaries arrive in week 31", opened["p_mercs"] !== undefined && opened["p_mercs"] >= 31 && opened["p_mercs"] <= 33, opened);
  check("every chapter up to the coup opens", ["p_club", "p_shoot", "p_food", "p_militia", "p_mercs", "p_snatch", "p_invasion", "p_railroad", "p_bombing", "p_fears", "p_knights", "p_collab", "p_hacker", "p_coup"].every((id) => opened[id] !== undefined), Object.keys(opened));
  check("a prepared arcology beats the coup", s.story!.flags["plot_coup"] === "won", s.story!.flags["plot_coup"]);
  check("the Daughters' own arc stays out of the way", !s.story!.arcs["w_liberty"]);
}

{
  const weak = { "p_militia.arms": "neither", "p_mercs.offer": "decline", "p_hacker.offer": "ignore", "p_collab.codes": "refuse", "p_coup.night": "fight" };
  const { s } = play("plot-b", 74, weak);
  check("an unprepared arcology loses the coup", s.story!.flags["plot_coup"] === "lost", s.story!.flags["plot_coup"]);
  check("the knights never come without mercenaries", !s.story!.arcs["p_knights"]);
}

{
  const { opened } = play("plot-c", 20, {}, false);
  check("the plot can be turned off", Object.keys(opened).length === 0, opened);
}
