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

**Rooms.** A scene happens somewhere, and where decides three things: who is standing in it (the
women assigned to that facility are *there*), whether what you do is private, household or **in
front of paying citizens** — the same act on the concourse is public use, costs her more and hits a
different set of fetishes — and what the room does to her walking in. What a place holds for
somebody is what happened to her in it, computed from her own bank, bounded at a fifth of a bad
conversation, and **habituated**: the room she works in every day has stopped announcing itself, and
the one she has been kept out of for a month has not. The same corridor is charged for one of two
women and inert for the other.

**Asking her things.** A quiet aside that leaves no trace — no memory forms, no bond moves, no clock
advances. She answers as herself, out of her own memories and beliefs and the facts she has actually
been told, at whatever openness she currently has: a frightened woman says the safe thing, a broken
one agrees with whatever she thinks you want, and one who trusts you will tell you something that
does not flatter her. A channel for asking a woman what she thinks without it becoming an event is
a different thing from another scene, and the genre has never had one.

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

## The story: Supplicationism

The original had a seventy-two week plot chain — a name at week 4, an invasion at 43, a bombing at
58, a coup at 71 — and it was scored on one hidden sum: whether you had bought enough mercenaries,
guns and drones by the time somebody came for the building. It worked, and the reason it worked is
that the test was never announced.

This one keeps the shape and changes the sum. **Fifteen fixed beats between week 3 and week 69**,
each firing once, each gated on a number the game never asks you to raise on purpose:
**deference** — how far the arcology has actually watched you go in public.

The thesis is one line and the game does not editorialise about it: *you bought her, she owns you,
both are on the register, and neither cancels the other.* You can still sell her. That is the part
the trade cannot get past, and it is why the road costs you everything it costs.

It runs: the first night on the floor. The household finding out. Your name coming second on the
instruments. Carrying her bag through the concourse at shift change. A broker who has sourced you
eleven women writing four lines that do not use the word. Serving her plate at Eiger's table. The
first man rich enough to say out loud that what he wants is to be *under* her — which opens the
service fees, and from then on the arcology runs on citizens paying for the privilege. The
registrar filing an instrument in both directions for the first time in twelve thousand transfers.
Censure. A waiting list. A woman you gave power to using it badly, and what you do about that. An
embargo. An offer to buy you out. And then the Association coming for the building.

Two things make it a game rather than a slideshow:

**The household answers per person, out of what each woman already is.** Handing power to a
submissive is a cruelty and the engine records it as one — she stops eating and her hope drops.
Handing it to a sadist with no conscience is a mistake you will meet again around week 52. A woman
carrying more than fifty-five resentment takes what she is given without a word, because she has a
great deal of unfinished business and now she has somewhere to put it. A broken woman agrees, and
the report says plainly that she would have agreed with the opposite.

**The ending is scored on the household, not on your guns.** At week 69 the lifts stop answering
and the question is who inside the building agrees with the people outside it. Each woman is
counted by what is actually holding her — bond and hope stand, fear and resentment do not — and a
building full of frightened women loses it with every gun you own, while a household that wants you
there holds it with none. If it goes the other way the line is the only one it can be: the doors
opened from the inside.

The doctrine is not something you tick on the Doctrine screen. It is adopted at the rate the
arcology has watched you live, it displaces Degradationism and both Racial doctrines on arrival
because they cannot be true at the same time, and between the fixed beats there are three small
things you can do any week — wait on her at the table, carry for her on the commercial level, kneel
to her at the club — so a cautious answer early never leaves the chain dead with no way back in.

## Pictures, and why they have to be local

The figure is the base game's own vector pack — 575 layers on one shared canvas, recoloured per
person by an injected stylesheet. No GPU, no key, no network after the first draw.

**It is rigged now.** The pack was drawn with the parts already separated, which is a skeleton
nobody had declared: five joints with pivots measured off the real path data — neck, chest, both
shoulders, hips. Twelve named poses on top of it, using arm positions the pack had shipped all
along and the compositor had never asked for. Underneath that, an involuntary layer — breath, sway,
weight shift, head drift, blink — computed as a pure function of (person, milliseconds), so one
requestAnimationFrame serves the whole roster and each woman is phase-offset by her own id.

All of it reads her state. A braced woman has her shoulders up and her chin down. A frightened one
breathes about twice as fast as a comfortable one, and holds it shallower. A woman running on
nothing sags. You are supposed to be able to tell how she is across the room before you read a
number.

**And then the realistic pass, which is the part worth explaining.** A diffusion model has no idea
who anybody is, and words cannot fix that — "olive skin, auburn hair, heavy breasts" describes
several thousand people, and asking twice gets two of them. Every game of this kind hits that wall.

But her body is already drawn, at her real proportions, in her real pose, by a compositor that is
deterministic and reads the same state the prose reads. So the figure on screen is rasterised and
handed to ControlNet as the control image, and the sampler is left with the one job it is good at:
skin, light, material. The realistic image inherits everything — put on weight and it is heavier,
get put in chastity and it is there, kneel for a scene and she is kneeling, because the rig knelt
her rather than because somebody typed the word and hoped.

Local only, and not out of principle: a hosted image API refuses most of what this game needs to
draw, and charges for the rest. On your own sampler it is free and unrefusable, which is what lets
it be automatic rather than a button you remember to press.

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

The whole thing is a static bundle, so your own repo serves it and there is nothing to host.

**Set this once:** Settings → Pages → Build and deployment → Source: **Deploy from a branch**,
Branch: **gh-pages** / **(root)**.

Then every push under `warp/` builds it and republishes. The page is at
`https://<you>.github.io/<repo>/`, and the workflow's run summary prints your exact URL.

> **Why a branch and not the "GitHub Actions" source.** That path deploys through the `github-pages`
> *environment*, which ships with a protection rule allowing only the repository's default branch —
> so from any feature branch every run dies on *"Branch … is not allowed to deploy to github-pages
> due to environment protection rules."* You can allow the branch under Settings → Environments →
> github-pages → Deployment branches and tags, but it is a per-repo setting three levels deep that
> breaks again the next time the branch is named something else. Pushing the built site to
> `gh-pages` has no environment in the loop and works from any branch forever.

The workflow typechecks and runs the test suite before it publishes, so a broken push does not
become a broken page.

**What still needs your own machine.** Saves live in that browser's IndexedDB — the page has no
server and nothing you do in it leaves the device. The model and the sampler are yours too. One real
friction: a page served over `https` may refuse a plain `http://localhost` call, so for the local
narrator and local pictures either run `npm run dev` on the machine you are playing on, or give
KoboldCpp and ComfyUI an https tunnel (KoboldCpp's `--remotetunnel` prints one).

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static bundle in dist/ — no server, no backend
npm test          # 152 behavioural tests over the deterministic core
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
  places.ts       the rooms, and what a room holds for one particular person
  consult.ts      asking her something, out of scene, in her own voice
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
