/**
 * THE KERNEL, AND THE TWO WAYS IT COULD BE WRONG.
 *
 * A wear mechanic that only goes one way turns every long campaign into a household of numb
 * people, which is both a bad game and a false claim about bodies. A wear mechanic with no teeth
 * makes the arcade a rotation rather than a decision. Both are tested here.
 */
import { check } from "./harness.ts";
import { newPsyche, tickPsyche, shove, tickEmotions, tickDischarge, addState, wear, band, T } from "../src/engine/psyche.ts";

// A body left alone comes home to its resting point.
{
  const p = newPsyche(2, 0.2);
  p.relaxation = -8;
  for (let i = 0; i < 40; i++) tickPsyche(p);
  check("a body left alone returns to its resting point", Math.abs(p.relaxation - p.capacity) < 0.5, p.relaxation);
}

// Overshoot above capacity collapses fast: a guarded person does not become serene because the
// week was pleasant.
{
  const p = newPsyche(-2, 0.15);
  p.relaxation = 6;
  tickPsyche(p);
  check("openness above someone's nature collapses fast", p.relaxation <= 2.01, p.relaxation);
}

// Sixty weeks of hell, then a hundred weeks of nothing at all.
{
  const p = newPsyche(1, 0.18);
  for (let i = 0; i < 60 * 5; i++) { shove(p, -3, { hard: true }); tickPsyche(p); }
  const worn = p.capacity;
  check("a long stretch braced moves the resting point down", worn < p.capacity_born - 0.9, { born: p.capacity_born, worn });
  check("and it never goes past the floor", worn >= p.capacity_born + T.WEAR_FLOOR - 0.01, worn);

  for (let i = 0; i < 100 * 5; i++) tickPsyche(p);
  check("and a long stretch of nothing brings them most of the way home", p.capacity > worn + 0.5 && p.capacity > p.capacity_born - 0.9, { worn, now: p.capacity });
}

// Numbness is real and bounded: ordinary friction stops landing, a real blow always lands.
{
  const fresh = newPsyche(0, 0.2);
  const hard = newPsyche(0, 0.2);
  hard.capacity = hard.capacity_born - 2.4;
  const smallFresh = shove(fresh, -1.2);
  const smallWorn = shove(hard, -1.2);
  check("ordinary friction stops landing on a worn body", Math.abs(smallWorn) < Math.abs(smallFresh) * 0.7, { fresh: smallFresh, worn: smallWorn });
  const bigWorn = shove(hard, -4, { hard: true });
  check("a real blow lands in full on the most hardened person", Math.abs(bigWorn) > 3.5, bigWorn);
  check("nobody becomes unreachable", wear(hard) <= 1);
}

// The emotion lifecycle: felt through in a settled body, fed in a clenched one.
{
  const settled = newPsyche(4, 0.2);
  settled.relaxation = 5;
  addState(settled, "anger at the verdict", 1);
  const out = tickEmotions(settled, 4);
  check("a settled body feels an emotion through and keeps the information", out.liberated.length === 1 && !!out.residue[0], out);

  const clenched = newPsyche(-3, 0.1);
  clenched.relaxation = -6;
  addState(clenched, "anger at the verdict", 1);
  const fed = tickEmotions(clenched, 6);
  check("a clenched body re-tells it instead, and pays for it", fed.fed === "anger at the verdict" && fed.drain < 0, fed);
  check("and the story colonizes the mood", clenched.mood === "anger at the verdict");
}

// Release: contraction held past capacity lets go rather than tapering.
{
  const p = newPsyche(0, 0.2);
  p.relaxation = -8.5;
  p.consecutive_clenched = 5;
  addState(p, "dread of the booth", 1);
  p.prev_relaxation = p.relaxation;
  shove(p, 5, { hard: true });
  const d = tickDischarge(p);
  check("a held clench that comes all the way back is a discharge", d.fired && d.released === "dread of the booth", d);
  check("and it opens the body past its own nature for a while", p.discharge_lift > 1);

  const drifting = newPsyche(0, 0.45);
  drifting.relaxation = -8;
  drifting.prev_relaxation = -8;
  tickPsyche(drifting);
  check("drift alone cannot fake a discharge", !tickDischarge(drifting).fired);
}

// WEAR IS FOR BEING HELD BELOW WHERE YOU REST, NOT FOR BEING WHO YOU ARE.
// The braced line was an absolute −2, so a naturally guarded woman left alone in an empty room for
// a year came out of it 1.8 below the resting point she was born with, having had nothing whatever
// happen to her. Found in a 52-week simulation where every character was on `rest`.
{
  const guarded = newPsyche(-2.5, 0.18);
  for (let i = 0; i < 52 * 5; i++) tickPsyche(guarded);
  check("a year of nothing at all does not wear a naturally guarded body",
    Math.abs(guarded.capacity - guarded.capacity_born) < 0.3, { born: guarded.capacity_born, now: guarded.capacity });

  const held = newPsyche(-2.5, 0.18);
  for (let i = 0; i < 52 * 5; i++) { shove(held, -4, { hard: true }); tickPsyche(held); }
  check("but being held below where she rests still wears her", held.capacity < held.capacity_born - 0.8,
    { born: held.capacity_born, now: held.capacity });
}

check("the bands read the way a player expects", band(newPsyche(-8)) === "clenched" && band(newPsyche(6)) === "open");
