# Warp — an arcology that remembers

Free Cities / pregmod, rebuilt from the ground up on Weft's engine.

The warp is the set of threads held under tension on a loom; the weft is what gets woven through
them. That is the relationship: the arcology, its economy, its doctrine and its facilities are the
frame, and the people are what happens on it. Weft is the narrative engine this borrows from —
its kernel, its memory model, its two-model turn, its guards. Warp is the city-state that runs on it.

This is not pregmod with a new skin, and it is not Weft with slaves in it. It is the whole thing
rebuilt: same features, different physics under them, and no passage tree anywhere.

**It is a brothel simulator with the economy underneath it, not an economy game with women in it.**
The loop is: pick somebody, do something to her, find out who she is by watching what it does, and
decide what she becomes to you. Everything else — the arcology, the doctrines, the ledger — is the
frame that loop hangs on.

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

## The loop

**Acts.** Twenty-eight of them, in the base game's own vocabulary — its fetishes (`buttslut`,
`cumslut`, `humiliation`, `submissive`, `dom`, `masochist`, `sadist`, `pregnancy`, `boobs`), its
paraphilias, its quirks (`painal queen`, `gagfuck queen`, `strugglefuck queen`, `tease`, `romantic`)
and its flaws (`hates anal`, `repressed`, `shamefast`, `idealistic`). Renaming all of that into
softer words would produce a rebuild its audience opens once.

**An act is not an increment.** The same hour lands three ways depending on who it is being done to:

| | what happens |
|---|---|
| **it hits her fetish** | arousal, relaxation and bond all move up together, resentment goes negative, and the fetish gets *stronger* — feed one long enough and it stops being a preference and becomes a paraphilia |
| **it hits her flaw** | she does it, she hates it, resentment lands at three times base, and the nervous system takes a real hit. Keep going and the flaw **wears**; a hundred and twenty repetitions past that is a woman with the matching quirk who asks for it. That road is the most expensive thing in the game and it is meant to be |
| **it hits neither** | it is a Tuesday. She is somewhere else while it happens and the record says so |

**You find out who she is by doing things and watching.** Fetishes, quirks and flaws all start
unknown. They are discovered by hitting them, not by reading a stat block, and the panel only shows
you the read on what you have actually found out.

**Firsts are remembered.** The first time anything is done to her goes into the bank as a core
memory that never decays. The four hundredth does not. Both are counted.

## The road to marrying one, and past it

The genre has always let you marry a slave, as a flag on a record. Here it is seven rungs —
**property → favourite → kept → courted → betrothed → wife → she has the collar** — each gated on
something you cannot buy, each bought with a **rite you actually play**, and each one the whole
household and every doctrine you hold has an opinion about.

The gate that bites is **fragility**: what share of her obedience is bought with fear rather than
earned. Courting allows 35%, betrothal 22%, marriage 15%. You cannot marry a woman who is only
saying yes because of what happens if she says no — not because the engine disapproves, but because
there is nothing there to marry. **An arcology run on terror reaches `kept` and stops dead, and the
panel tells you exactly which number is the wall.** Time is a second gate, and what she actually
remembers about being here is a third, which no amount of this week's kindness can fake.

Then it goes one rung past the wedding. **Dominion** runs −100 (you decide everything) to +100 (she
does), and it moves only by what you do when she asks for something. She generates real requests out
of her own fetish, flaw, drive and week — carrying a mechanical payload, voiced by a model in her own
words — and you grant them, refuse them, or put her in her place for asking. Past 40 she moves people
around the household and tells you afterwards; past 70 she pushes doctrine; past 85 she closes the
books.

At the top, **you hand her the collar and the registry change is real**. The weekly report is
addressed to her. The arcology is then run off *her* personality — a cold-conscience woman handed it
puts the worst-behaved girl in the cellblock, a warm one pulls the sick one off the floors — and the
Penthouse becomes what she wants from you this week.

Breaking a public promise at betrothed or wife is the single most expensive act in the game. Every
other woman in the household files it, and their hope drops.

## Pictures, and why they have to be local

A game like this without images has a hole in it, and a hosted image API cannot fill it: it refuses
most of what this needs to draw and bills for the rest. On your own GPU it is free and unrefusable,
so it is automatic — Settings → Pictures points at **ComfyUI or an A1111-style WebUI**, and you get a
portrait per person and a picture of the moment after every scene.

Three things hold a cast still across a campaign: the exact clause that drew a portrait is **locked**
onto the person and reused verbatim forever (clothes, belly and mood are added as separate clauses,
so changing a shirt never changes a face); the portraits themselves go in as **reference images**
through a `%ref1%` token, so Flux Kontext, IP-Adapter, PuLID and InstantID all work; and **seeds are
held** per person and per room-and-cast. Prompts are built in both dialects — sentences for Flux and
SD3, comma-separated tags for SD1.5, SDXL and Pony.

## Events that were not written by anybody

The hand-written events are the spine. The other half is a model pointed at **one specific woman's
complete record** — her fetish, her flaw, what has been done to her, what she remembers, where she
stands with you — inventing the situation that her particular week would throw up.

The guardrail is shaped so an uncensored local model can be as inventive as it likes: **it writes
the situation and the wording of the options, and never the consequences.** Every option names an
effect from a closed table, the engine resolves it, and anything unrecognised is dropped on the
floor. So it cannot invent a state change, reach a person it was not given, or touch anybody the age
gate excludes.

Settings says plainly whether your narrator slot will actually write this material: a hosted model
declines a fair share of it and softens the rest, which is the half-written-scene failure the
genre's players recognise immediately. Put a local model behind the narrator (`local/…` routes to
KoboldCpp, llama-server, LM Studio or Ollama) and leave the bookkeeper hosted — it only emits JSON,
which is what small models are worst at.

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
- **Managers run things, including badly.** Each post has one effect that materially changes the
  week, computed from that person's skill, devotion and nature — and a floor. A manager under the
  post's minimum does the job badly on purpose and skims the takings, which is the one place in the
  engine where disloyalty has a lever. A household where loyalty has no consequence is decoration.
- **Policies** are arcology-wide law with a price and a weekly cost, and your own doctrine can
  refuse one: a Paternalist citizenry will not have public punishment on the books, and a policy
  that drifts out of line with what your people have come to believe bleeds standing every week it
  stays.
- **Crime and unrest are different problems.** Watch, drones and mercenaries move the first and do
  nothing whatever to the second. Unrest is what your own household is carrying — resentment, no
  hope, nothing left to lose — and the only things that move it are the things that change what
  they carry. The week an owner discovers this is the week the drones are pointing outward.
- **Nobody is exempt from the clock, and children are.** Everyone ages on the same fifty-two week
  tick — only children aged in the first pass, which is the bug you do not notice for a hundred
  weeks and then cannot unsee. And the age gate lives in the engine on the single writer for what
  somebody is doing, not in the dropdown: under eighteen it is rest, the nursery, the schoolroom and
  medical care, and a standing order cannot route around it either.
- **You are a character.** Your five skills each have exactly one reader in the engine and each
  grows from the thing it affects. And the household keeps a private model of you, which the You
  screen aggregates into the sentence they would say about you if you were not in the room.
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

## Playing it off GitHub Pages

The whole thing is a static bundle, so your own repo can serve it and there is nothing to host.

1. Repo **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Push this branch (or run **Deploy Warp to Pages** from the Actions tab).
3. Open the URL Pages gives you. That is the game.

Every push that touches `warp/` rebuilds and republishes it, and the workflow runs the typecheck
and the test suite first, so a broken push does not become a broken page.

**What still needs your own machine.** Saves live in that browser's IndexedDB — the page has no
server and nothing you do in it leaves the device. If you want prose and pictures, the model and
the sampler are yours too: put a local model in the narrator slot and point Settings → Pictures at
ComfyUI or an A1111-style WebUI. A page served over `https` may refuse a plain `http://localhost`
call, which is the one real friction of playing this from Pages — run `npm run dev` locally when
you want the local model, or give KoboldCpp/ComfyUI an https tunnel (KoboldCpp's `--remotetunnel`
prints one).

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static bundle in dist/ — no server, no backend
npm test          # 143 behavioural tests over the deterministic core
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
  intimacy.ts     the core loop: what an act does, and to whom
  romance.ts      the seven rungs, the rites, dominion, and the inversion
  asks.ts         what she wants, and what your answer costs
  dynamic.ts      model-invented situations, on a closed effect table
  portrait.ts     what to say to the sampler so the cast holds still
  memory.ts       episodic → gist → belief
  social.ts       edges, co-regulation, the rumour field
  week.ts         the macro tick, in stated order
  society.ts      doctrine as one scoring function
  economy.ts      every number, with a ledger line for each
  rules.ts        standing orders: conditions, effects, dry run
  managers.ts     what a Head Girl, a Madam or a Wardeness actually does to a week
  policies.ts     arcology law, and the doctrine that refuses it
  security.ts     crime outside, unrest inside, and the neighbours' schemes
  player.ts       you, as your household reads you
  turn.ts         the scene turn and its guards
  prompts.ts      the compiled state document
  generate.ts     a whole person, offline
  forge.ts        the interior, when a model is available
src/data/       intimacy (acts, fetishes, quirks, flaws), doctrines, facilities,
                assignments, policies, wardrobe, nations and careers
src/lib/        diffusion.ts — ComfyUI and A1111 clients, reference sheets, seeds
src/views/      the interface. Nothing in here knows a rule.
tests/          behavioural tests; each one names the failure it prevents
```

## Reading order, if you want the argument

`PHILOSOPHY` for how people work is in the Weft repository and still applies. The two files worth
reading here are `src/engine/obedience.ts` (why the two numbers are derived) and
`src/engine/week.ts` (what a week actually does, in order). `KERNEL.md` in this directory is the
systems doc: the scalar, the thresholds, the pipeline, and every place energy enters or leaves.
