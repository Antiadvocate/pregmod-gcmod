/**
 * THE RUN. Twists bend the world, ambitions get checked, and every run ends — two years in, or
 * sooner if it goes wrong — with an epilogue that reads without a hole in it.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { answer, optionsFor, pendingBeat, pickable } from "../src/engine/story.ts";
import { TWISTS, AMBITION_BY_ID, priceFactor } from "../src/engine/run.ts";
import { rng } from "../src/engine/rng.ts";

const HOLE = /undefined|NaN|\{\w+\}|\[object/;

{
  const s = newGame({ seed: "run-full", origin: "broker", twists: ["fever", "boom"], starting_slaves: 5 });
  check("a run draws three ambitions", s.run?.ambitions.length === 3 && s.run.ambitions.every((a) => AMBITION_BY_ID[a.id]));
  check("and takes the twists it was given", s.run?.twists.join() === "fever,boom");
  const r = rng("run-full");
  let threw: string | undefined;
  try {
    for (let w = 0; w < 110; w++) {
      if (s.arcology.cash < 20000) s.arcology.cash += 50000;
      endWeek(s);
      for (let g = 0; g < 6; g++) {
        if (!pendingBeat(s)) break;
        const open = optionsFor(s).filter((o) => !o.locked && (!o.pick || pickable(s, o.id).length));
        if (!open.length) break;
        const o = r.pick(open);
        answer(s, o.id, o.pick ? r.pick(pickable(s, o.id)).id : undefined);
      }
    }
  } catch (e) { threw = (e as Error).stack?.split("\n").slice(0, 3).join(" | "); }
  check("two years with twists never throws", !threw, threw);
  check("and it ends at two years", s.run?.ended?.kind === "done" && (s.run?.ended?.week ?? 0) <= 105, s.run?.ended);
  const text = [s.run?.ended?.title, ...(s.run?.ended?.lines ?? [])].join(" ");
  check("the epilogue reads without a hole in it", !HOLE.test(text), text.slice(0, 300));
  check("and it talks about the stories you played", (s.run?.ended?.lines.length ?? 0) >= 6, s.run?.ended?.lines);
}

{
  // Broke for six weeks and it's over.
  const s = newGame({ seed: "run-broke", origin: "heir" });
  s.arcology.cash = -200000;
  for (let w = 0; w < 8 && !s.run?.ended; w++) { s.arcology.cash = Math.min(s.arcology.cash, -200000); endWeek(s); }
  check("a run that stays broke ends", s.run?.ended?.kind === "lost" && /receivers/.test(s.run.ended.title), s.run?.ended?.title);
}

{
  const a = newGame({ seed: "p1", twists: ["flood"] });
  const b = newGame({ seed: "p2", twists: [] });
  check("a buyer's market is cheaper", priceFactor(a) < priceFactor(b));
  check("every twist has a name and a description", TWISTS.every((t) => t.name && t.what.length > 20));
}
