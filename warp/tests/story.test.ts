/**
 * THE STORY. Every origin, played for a year with choices picked at random, has to render every
 * beat without a hole, never throw, and get somewhere. Two runs from the same origin have to be
 * able to tell different stories.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { answer, optionsFor, pendingBeat, pickable } from "../src/engine/story.ts";
import { ORIGINS } from "../src/data/story/index.ts";
import { rng } from "../src/engine/rng.ts";

const HOLE = /undefined|NaN|\{\w+\}|\[object/;

function play(origin: string, seed: string, weeks = 60) {
  const s = newGame({ seed, origin, starting_slaves: 4 });
  const r = rng(`play:${seed}`);
  const holes: string[] = [];
  const seen = new Set<string>();
  let answered = 0;
  let threw: string | undefined;
  try {
    for (let w = 0; w < weeks; w++) {
      // Keep the lights on: the soak is about the story, not about whether a random player goes broke.
      if (s.arcology.cash < 20000) s.arcology.cash += 40000;
      endWeek(s);
      for (let guard = 0; guard < 6; guard++) {
        const p = pendingBeat(s);
        if (!p) break;
        const title = typeof p.beat.title === "function" ? p.beat.title(p.c) : p.beat.title;
        const text = p.beat.text(p.c);
        seen.add(`${p.def.id}:${p.run.beat}`);
        const opts = optionsFor(s);
        for (const o of opts) if (HOLE.test(o.label + (o.note ?? ""))) holes.push(`${p.def.id}/${o.id}: ${o.label}`);
        if (HOLE.test(title + text)) holes.push(`${p.def.id}:${p.run.beat}: ${(title + text).slice(0, 120)}`);
        const open = opts.filter((o) => !o.locked && (!o.pick || pickable(s, o.id).length));
        if (!open.length) { holes.push(`${p.def.id}:${p.run.beat} has no option you can take`); break; }
        const o = r.pick(open);
        const who = o.pick ? r.pick(pickable(s, o.id)).id : undefined;
        const a = answer(s, o.id, who);
        if (!a) { holes.push(`${p.def.id}/${o.id} refused an answer`); break; }
        if (HOLE.test(a.text + a.consequences.join(" "))) holes.push(`${p.def.id}/${o.id} result: ${a.text.slice(0, 120)}`);
        answered++;
      }
    }
  } catch (e) { threw = (e as Error).stack?.split("\n").slice(0, 4).join(" | "); }
  return { s, holes, seen, answered, threw };
}

for (const o of ORIGINS) {
  const a = play(o.id, `soak-${o.id}-1`);
  check(`${o.name}: a year of random choices never throws`, !a.threw, a.threw);
  check(`${o.name}: every beat and option renders without a hole`, a.holes.length === 0, a.holes.slice(0, 4));
  check(`${o.name}: the origin arc gets to an ending`, !!a.s.story?.arcs[o.id]?.done, a.s.story?.arcs[o.id]);
  check(`${o.name}: other arcs turn up over a year`, Object.keys(a.s.story?.arcs ?? {}).length >= 3, Object.keys(a.s.story?.arcs ?? {}));
  check(`${o.name}: the journal records what you chose`, (a.s.story?.log.length ?? 0) === a.answered && a.answered >= 5, { log: a.s.story?.log.length, answered: a.answered });
}

{
  // The same origin twice is not the same story: different cast, different deck.
  const a = newGame({ seed: "twice-a", origin: "heir" });
  const b = newGame({ seed: "twice-b", origin: "heir" });
  check("two runs from one origin meet different people", a.story?.cast.creditor?.name !== b.story?.cast.creditor?.name, [a.story?.cast.creditor?.name, b.story?.cast.creditor?.name]);
  check("and draw their arcs in a different order", a.story?.deck.join() !== b.story?.deck.join());
}

{
  // Supplicationism is a choice now, not the spine.
  const off = newGame({ seed: "sup-off", origin: "heir" });
  const on = newGame({ seed: "sup-on", origin: "heir", supplication: true });
  check("the old plot chain is off unless you choose it", off.story?.supplication === false && on.story?.supplication === true);
}

{
  // An old save with no story gets one, keeps its chain, and does not crash on load.
  const s = newGame({ seed: "legacy" });
  delete s.story;
  const { sanitize } = await import("../src/engine/state.ts");
  const after = sanitize(s);
  check("a save from before the story gets the deck and keeps its chain", !!after.story && after.story.supplication === true);
}
