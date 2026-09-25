/**
 * FEET ART — every woman's feet come out different, and stay the same for her.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { footGenes } from "../src/views/FeetArt.tsx";
import { feetOf } from "../src/engine/genitals.ts";

{
  const s = newGame({ seed: "feetart", starting_slaves: 8, plot: false } as never);
  const ps = Object.values(s.people).filter((p) => p.status === "owned");
  const sig = (p: (typeof ps)[number]) => { const g = footGenes(p); return JSON.stringify([g.tips, g.bases, g.angles, g.gaps, g.widthRatio, g.nailShape, g.skin].map((x) => JSON.stringify(x))); };
  check("no two women have the same feet", new Set(ps.map(sig)).size === ps.length);
  check("her feet are the same every time", sig(ps[0]) === sig(ps[0]));
  check("every foot has a shape and a width", ps.every((p) => !!feetOf(p).shape && !!feetOf(p).width));
  const shapes = new Set(Object.values(newGame({ seed: "feetart2", starting_slaves: 12, plot: false } as never).people).map((p) => feetOf(p).shape));
  check("more than one foot type turns up", shapes.size >= 2, [...shapes]);
}
