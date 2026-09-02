# Warp — an arcology that remembers

Free Cities / pregmod, rebuilt from the ground up on Weft's engine.

The warp is the set of threads held under tension on a loom; the weft is what gets woven through
them. That is the relationship: the arcology, its economy, its doctrine and its facilities are the
frame, and the people are what happens on it. Weft is the narrative engine this borrows from —
its kernel, its memory model, its two-model turn, its guards. Warp is the city-state that runs on it.

This is not pregmod with a new skin, and it is not Weft with slaves in it. It is the whole thing
rebuilt: same features, different physics under them, and no passage tree anywhere.

---

## The one change everything else follows from

The old game stored `devotion` and `trust` as the primitives of a person — two integers in
[−100, +100] that every scene, job and event read and wrote directly. It is a cheap, legible model
with one fatal property: it cannot tell the difference between a woman who complies because she has
decided her life is here and a woman who complies because the cellblock is downstairs. Both read
`devotion: 60`. Feed them the same week and they behave identically, forever.

**Here, devotion and trust are not stored. They are read.** Off a nervous system (Weft's relaxation
kernel), plus four accumulators the engine keeps separately:

| | what it is | how it moves |
|---|---|---|
| **bond** | earned attachment — kindness, safety, being chosen, being kept | slow up, slow down; survives your absence |
| **fear** | what fear of consequence buys | fast up, **and it decays 15% a week the moment you stop paying for it** |
| **resentment** | everything done to her she has not forgiven | eats the top off devotion whichever of the other two is paying |
| **hope** | belief the situation can improve | what makes a promise worth making, and a broken one worth something |

Two slaves showing the same devotion have different physics under it, and the difference shows up
in play within a fortnight. The person panel says which: *"Most of what holds her here is fear —
78% of her compliance. Stop maintaining it and it is gone in a month."*

The old game could not have told you that at any price, because the answer was distributed across
eleven hundred `devotion +=` call sites. Here it is one function, and the report can name the week
that did it.

## What else survives, and how it changed

**Everything.** The body in detail, the week cycle, facilities and their managers, thirty-three
doctrines, the rules assistant, markets and recruiters, gestation and genetics, the arcology's
economy, its neighbours. What does not survive is the passage tree they were written in, and the
two dials at the bottom.

- **The week** is the macro tick and the only place the clock advances. Its order is stated once,
  in `engine/week.ts`, so "why did that happen before that" is a line in a file rather than an
  emergent property of forty passages.
- **A facility is a place, not a multiplier.** A week in the arcade and a week in the spa move the
  resting point in opposite directions and leave different memories. Two years in the arcade is not
  reversible by a month in the spa, because `attrition` is a third quantity that does not come back.
- **Doctrine is one scoring function.** Every doctrine declares what it wants along nine shared
  axes; every person has a position on them. The dot product is how well she serves it. So the
  arcology can *explain* itself: "Slimness Enthusiasm: wants slim; she is not (−0.71)."
- **Standing orders** (the Rules Assistant) render as English sentences and have a **dry run** — the
  same code path the week uses with writes turned off, showing exactly who it would touch and what
  would change, before you arm it.
- **Events are situations, not passages.** Chosen deterministically from pressure, then played as a
  scene. At tension 0 the engine originates nothing: every event that fires comes out of your own
  household.
- **Memory is real.** Episodic → gist → belief. What a slave remembers about being here outweighs
  this week's arithmetic, which is why a good month cannot undo a bad year.
- **The household is coupled.** Nervous systems lean on each other pairwise and as a room, and news
  moves through facilities as a field: dread travels fast through a clenched room, warm news through
  a settled one, and a rumour nobody is charged enough to repeat dies of boredom.

## It runs with no model at all

This matters more than it sounds. An engine that cannot make a person without an API key is an
engine whose whole cast is hostage to somebody's billing.

With nothing configured you get: every body, history, temperament and nervous system (generated
deterministically from a seed), the full week, the economy, doctrine, markets, events, the rules
engine, and scenes rendered as honest stage directions. What you add a model *for* is prose, and
the interior of a person the forge writes over the top of the sketch.

When a model is configured, the scene runs Weft's two-model turn: a **narrator** that writes and a
**bookkeeper** that records, with guards that assume both of them lie —

- a character who was in the room cannot be moved out of it unless the prose actually shows her
  leaving (a proximity window is not enough: it passes "Mara was still sitting there when the
  others left");
- nobody arrives without a door;
- only witnesses learn — a memory cannot be filed for somebody who was in another building;
- **strike** is your veto: it rolls the turn back and records a standing correction injected into
  every later prompt.

The prompt is a compiled state document, not a transcript, so a turn at week 400 costs what a turn
at week 4 costs.

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static bundle in dist/ — no server, no backend
npm test          # 63 behavioural tests over the deterministic core
npm run lint      # tsc --noEmit
npm run balance   # a year of an arcology, printed as a ledger — how both economy bugs were found
```

The whole thing is a static site. Saves live in your browser's IndexedDB; the model key, if you set
one, lives in localStorage on that device and is sent to OpenRouter (or to your own machine) and
nowhere else. Point a model slot at `local/…` and it routes to KoboldCpp, llama-server, LM Studio or
Ollama instead — the useful split is a local narrator with a cloud bookkeeper, since strict JSON is
the thing small models are worst at.

## Where things are

```
src/engine/     the world. Nothing in here imports React.
  types.ts        the model: people, arcology, save
  psyche.ts       the kernel — one scalar and every threshold on it
  obedience.ts    devotion and trust, derived. Start here.
  memory.ts       episodic → gist → belief
  social.ts       edges, co-regulation, the rumour field
  week.ts         the macro tick, in stated order
  society.ts      doctrine as one scoring function
  economy.ts      every number, with a ledger line for each
  rules.ts        standing orders: conditions, effects, dry run
  turn.ts         the scene turn and its guards
  prompts.ts      the compiled state document
  generate.ts     a whole person, offline
  forge.ts        the interior, when a model is available
src/data/       doctrines, facilities, assignments, nations and careers
src/views/      the interface. Nothing in here knows a rule.
tests/          behavioural tests; each one names the failure it prevents
```

## Reading order, if you want the argument

`PHILOSOPHY` for how people work is in the Weft repository and still applies. The two files worth
reading here are `src/engine/obedience.ts` (why the two numbers are derived) and
`src/engine/week.ts` (what a week actually does, in order). `KERNEL.md` in this directory is the
systems doc: the scalar, the thresholds, the pipeline, and every place energy enters or leaves.
