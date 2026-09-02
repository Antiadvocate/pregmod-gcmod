# The Kernel — what Warp's engine is actually doing

The systems doc. Weft's `KERNEL.md` documents the nervous system this borrows; this file documents
what happens when you attach an economy to it and run it for two hundred weeks.

## 1. The mental model in one paragraph

Every person is a **dissipative homeostat** with one scalar, **relaxation** (−10 clenched … +10
open), which events shove and which drifts back toward that person's own resting point. Everything
else — emotion, memory tint, misreading, co-regulation, breaking, release, and both of the numbers
the player actually reads — is a threshold rule or a coupling on that one scalar. The arcology sits
on top as a second clock: the week moves money, bodies and doctrine, and it moves them by shoving
the same scalar rather than by writing to a separate obedience track. There is exactly one model of
a person in this engine, and both clocks read it.

## 2. Two clocks, one kernel

| | the scene | the week |
|---|---|---|
| unit | minutes | seven days |
| driver | `engine/turn.ts` | `engine/week.ts` |
| drift | one `tickPsyche` per turn | `WEEK_STEPS` (5) per week |
| who moves the scalar | the bookkeeper's `relaxation_delta`, clamped ±4 | the assignment's `psyche.relaxation`, damped by wear |
| what it writes | memories, edges, treatment, presence | money, skills, health, gestation, doctrine, rumour |

They are the same functions. A week is not seven conversations, and five steps is where the numbers
behave: a person left alone for a week comes most of the way home, and one left alone for a month is
home.

## 3. The thresholds that mean something

Every number here is load-bearing. `engine/psyche.ts` exports them as `T` so there is one place to
change any of them.

| threshold | what it triggers |
|---|---|
| r ≤ −2 | **braced**: the narrator gets a visible tension cue (shoulders, jaw, breath — never interior) |
| r ≤ −3 | a held emotion older than 3 ticks starts **feeding on itself**: −0.2/tick, and it colonizes the mood |
| r ≤ −4 | the **fracturing line**; also where the aperture narrows to the one thing |
| r ≤ −7 | **deep clench** — the counter runs; four consecutive ticks flips state to fracturing |
| r ≤ −9 | fracturing → **broken**, with a break mode |
| r ≥ +2 | the **aperture opens**: speech comes out of the person rather than through the voice card as a filter |
| r ≥ +3 | gripped emotions **self-liberate** after 2 ticks, leaving their residue |
| rise ≥ 2.5 from ≤ −7 | **discharge**, if the clench was held (counter ≥ 3 or a fracture state) |
| 8 braced ticks | one step of **wear**: resting point −0.3 |
| 6 settled ticks | one step of **recovery**: resting point +0.3 |
| born −2.5 … +2.0 | the band the resting point may ever occupy |
| 2% of the gap, every tick | the standing **pull home** toward what they were born with |

Drift is asymmetric: above the resting point, relaxation collapses at ≥ 0.5/tick; below it, it
recovers at that person's own `recovery` (0.01 … 0.45). Nobody floats above their own nature because
the week was pleasant.

## 4. The week pipeline, in order

`engine/week.ts`, and the order is the file:

1. **Standing orders**, on last week's state. They are instructions about the week that is starting;
   running them after the work would be running them on the results.
2. **Everyone works.** Money (with a ledger line for every movement), the scalar shove from the
   assignment, emotion lifecycle, discharge, training, management skill, health/energy/attrition,
   conception and gestation, the memory of the week, and the bond ledger's decay.
3. **The household reacts to itself**: proximity (who gets to know whom), co-regulation (pairwise
   plus the room's mean field), and rumour diffusion.
4. **The arcology reacts to the household**: doctrine adoption chases what your people actually
   embody, then rents, tariffs, facility upkeep, security, projects, loans and food.
5. **The world reacts to the arcology**: neighbours, recruiters, the markets, and the events the
   pressure controller selects.
6. **The report** is assembled from what the passes recorded. Nothing is recomputed afterwards,
   which is how the old end-of-week text and the old budget screen ended up describing two
   different weeks.

## 5. Where energy enters and leaves

**In:** assignment shoves (facility `psyche.relaxation`), the bookkeeper's per-turn deltas, event
resolutions, co-regulation pull, place arrival, pregnancy, withdrawal, and the death of somebody in
the household (−0.6 hard to everyone, +6 fear).

**Out:** drift toward the resting point, emotion self-liberation, discharge, the pull home on
`capacity`, fear decay at 15%/week, resentment cooling at 4%/week, memory decay, and rumour salience
losing 0.3 a week.

Both directions always run. That is what makes the system cycle rather than only complexify.

## 6. Wear, and why it is bounded

A run of bracing lowers the resting point; the failure mode is a ratchet, because a lower resting
point means more braced ticks, which earns more wear. Four things stop it:

- the band (never past born − 2.5);
- the pull home, 2% of the gap every tick, which scales with the gap while wear is flat;
- settling being cheaper to earn than wear (6 ticks against 8);
- the **numbness ceiling**: a worn body damps incoming deltas of |1.5| or less by up to 55%, so
  ordinary friction stops landing — and a blow of any real size lands in full on the most hardened
  person in any save. Nobody in this engine becomes unreachable.

Simulated in `tests/kernel.test.ts`: sixty weeks of continuous cruelty converges near born − 1.6 and
never reaches the floor; a hundred weeks in which *nothing happens at all* brings them most of the
way home.

## 7. The readings

`engine/obedience.ts`. Devotion and trust are computed, never stored:

```
fearComply = 60 · (1 − e^(−fear/45)) · attachment.fear_buys
devotion   = 0.62·bond·attachment.bond_buys + fearComply − 0.45·resentment
           + 0.12·hope + 1.6·relaxation + 6·memoryTilt
trust      = 0.55·bond − 0.75·fear + 0.25·hope − 0.25·resentment + 2.2·relaxation
           + 8·memoryTilt + min(22, 1.6·weeks_since_cruelty) − …
fragility  = fearComply / (|bonded| + fearComply)
```

Three properties worth stating plainly:

- **Fear saturates.** Terror past a point stops producing more obedience and starts producing
  paralysis. Doubling fear from 50 to 100 buys under 14 points of devotion.
- **A broken body reads as compliant and the engine says so.** `devotion` floors at 45 in the broken
  state, minus resentment — and the panel says the compliance does not mean what it looks like.
- **Memory outweighs the week.** `memoryTilt` is the whole episodic bank, weighted by importance and
  decay, with core memories at double. It is why a good month cannot undo a bad year.

## 8. Doctrine as arithmetic

Nine axes (`age, height, weight, modification, assets, intelligence, gender, breeding, quality`),
each −1 … +1. Every doctrine declares the poles it wants; every person has a position. The score is
the weighted dot product over the axes the doctrine actually cares about, so a doctrine with one
opinion judges on that one thing and is not diluted by indifference. Adoption then chases the mean
score of your household at 12% a week: you demonstrate a culture, you do not legislate one.

The whole point of doing it this way is that `explainFor()` can produce a sentence per doctrine. The
old implementation was a spray of conditionals across forty files, which is why nobody could ever
answer "why did my Supremacist arcology dislike her".

## 9. The guards

Because the narrator is a model with authority to invent and the bookkeeper is told the prose is
truth, one bad sentence otherwise becomes permanent world-fact within a turn.

- **Departure evidence.** A character present at the start of a turn cannot be moved out unless the
  prose shows *her* leaving: sentence-scoped, verb after the name, rejected when another subject is
  doing the leaving. A proximity window is not enough — it passes "Mara was still sitting there when
  the others left the floor above", which says the opposite.
- **Arrival.** A name not on the page cannot be added to the room.
- **Witnesses only.** Memories, learned facts, psyche deltas and treatment are dropped for anybody
  who was not in the room.
- **Canon and strike.** Canon is a constraint on what may exist; strike rolls the turn back and
  records a standing correction injected into every later prompt.
- **Detectors.** Interior leaks, maxims, echoes of the player's own line, and self-reprints are
  caught in the *output* and quoted back at the narrator on the next turn — which is the one
  correction channel that reliably changes a model's behaviour mid-story. Everything caught is
  counted in `integrity.fires`, because a story can come apart while the engine notices every
  individual crack.

## 10. What is deliberately not modelled

- **The player's interior.** Never authored, never derived. Their own report of how tightly they are
  holding themselves can cap what they feel and never lift it.
- **A separate obedience track.** There is one model of a person and both clocks read it.
- **Per-passage prose.** Events are situations with options; the paragraph is generated at play time
  or not at all.
