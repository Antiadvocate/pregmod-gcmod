# Warp

Free Cities / pregmod, rebuilt as a phone-friendly web game. You own an arcology and the women in
it. Every run starts from a different past, draws different stories, and ends with the whole run
read back to you.

Everything works with no AI model configured. A model, if you add one in Settings, writes
free-form scenes and rewords dialogue on top.

## A run

**Pick who you were.** Six origins, each with its own money, skills, household and personal story:

| origin | you start with | your story |
|---|---|---|
| The Heir | average money, your father's head girl | his creditor wants ¤90,000 or the building |
| The Raider | mercenaries, strong security, a hostile household | the owner you threw out wants it back |
| The Climber | a household that trusts you faster | the person who owned you still has your papers |
| The Broker | trading skill, more women than money | a rival wants your contacts; a woman you sold turns up on a block |
| The Investor | lots of money that isn't yours | a board reviews you every quarter |
| The Prodigal | money and name, little skill | your sibling wants the family's coast |

**Pick up to two twists** if you want them: Boom Town, Buyer's Market, Old Money, Bad Neighbours,
Fever Season, Lean Year.

**Three ambitions** are drawn for the run (a household of twelve, marrying one of them, half a
million in cash, taking a neighbouring arcology, and so on).

**Stories arrive every few weeks** from a shuffled deck of fourteen: a journalist, a street
preacher, a collector who wants your most valuable woman, a sister at the gate, a plague ship, a
smuggler, a blackout, a legendary auction, an old flame, a gift from the Association, a pit
challenge, someone from one of your women's old lives, an heiress in debt, twins. Each is a few
scenes with choices in your voice. Some choices need skills, money or security; some ask you to
pick one of your women. What you chose is remembered by later scenes.

**After two years the run ends** — sooner if you go broke, empty the house, sign it away, or the
household turns on you. You get an epilogue: what happened in every story, what became of each
woman, which ambitions you met, and a title. You can keep playing past it.

The old Supplicationism storyline is still there as an option on the start screen.

## With her

Tap **be with her** on anyone in People. Her figure is at the top, posed and reacting; what happens
appears directly underneath, newest at the bottom; the acts and follow-ups sit at the bottom edge.

- Every act is written out as a scene from her body, her state and how it landed, and she answers
  in one of nine ways of talking (frightened, sullen, polite, warm, eager, mouthy, foul-mouthed,
  empty, or in charge) depending on where she is with you.
- After an act: hold her, praise her, ask what she liked (which can reveal what she's into), make
  her thank you, laugh at her, or send her off.
- **Talk** asks her about home, her old job, how she got here, what she wants, whether she's afraid
  of you, what the others say, and for a secret. How much truth you get depends on trust.
- Her face shows it: blush, tears, sweat, parted lips.

Her requests show on the Penthouse and her panel. They follow what she actually needs, don't
repeat once answered, and change once she has the standing to tell you instead of asking.

## Dressing her

**Dress her** opens a dressing room: about seventy outfits in ten groups drawn from the base game's
vector art, fourteen collars, six kinds of shoes, stockings, a colour slider for her clothes, and a
salon for hair colour, style and length, lipstick, glasses, ears, tails and skin dye.

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static bundle in dist/
npm test          # behavioural tests
npm run lint      # tsc --noEmit
npm run art:manifest   # rebuild public/art/vector/index.json after adding art
```

Saves live in your browser's IndexedDB. An API key, if you set one, is stored in that browser and
sent only to the model provider you configure. `local/…` model ids route to KoboldCpp,
llama-server, LM Studio or Ollama.

## Playing it off GitHub Pages

Settings → Pages → Build and deployment → Source: **Deploy from a branch**, Branch: **gh-pages** /
**(root)**. Every push under `warp/` builds, tests and republishes. The workflow's run summary
prints the URL.

A page served over `https` may refuse a plain `http://localhost` model server; run `npm run dev`
locally or give the model server an https tunnel.

## Where things are

```
src/engine/       the simulation. Nothing in here imports React.
  intimacy.ts       what an act does to her
  writer.ts         the act written as a scene
  voice.ts          how she talks
  encounter.ts      follow-ups and talking
  asks.ts           what she asks you for
  story.ts          origins, arcs, beats, choices
  run.ts            twists, ambitions, endings
  week.ts           the weekly tick, in order
  obedience.ts      devotion and trust, derived from bond, fear, resentment and hope
src/data/story/   the origins and the deck
src/data/         acts, wardrobe, doctrines, facilities, people
src/lib/          art: vectorart (layers), rig (poses), expression, rooms
src/views/        the screens
tests/            behavioural tests
```

`KERNEL.md` documents the psychological model underneath.
