/**
 * THREADS — the situations the simulation notices about itself.
 *
 * Every event in this game so far has been a die roll against a weight. That produces incidents,
 * and incidents do not accumulate into anything: the arcade event fires, you pick an option, and by
 * Thursday the game has forgotten. Nothing was ever *about* the last six weeks.
 *
 * A thread is the other thing. It is not rolled — it is DETECTED, off signals the kernel was
 * already producing and nobody was reading: two women whose resentment has been climbing together,
 * a rumour that stopped being gossip four weeks ago, a body whose resting point has permanently
 * moved, somebody who has stopped flinching. The detector finds a configuration that means
 * something. Then the thread has beats of its own, and it ends.
 *
 * THE RULE THAT MAKES THIS EMERGENT RATHER THAN SCRIPTED: a thread whose conditions stop holding
 * LAPSES. It does not run to completion because it started. Fix the thing and the story goes away,
 * usually without telling you it was ever there — which is exactly what it is like to run a
 * household well.
 *
 * WRITING RULES, same as everywhere. Concrete nouns, present tense, what is in the room. A beat
 * that could be printed on a poster gets cut. Nobody in this world talks like an essay.
 */
import type { SaveState } from "../engine/types";

/** Who the thread is about, by role. Roles are named so beats can address them. */
export type Cast = Record<string, string>;

export interface BeatCtx {
  s: SaveState;
  /** Names, resolved. `who.a`, `who.b` — never ids in prose. */
  who: Record<string, string>;
  /** How long the thread has been open. */
  weeks: number;
  heat: number;
  /** Specifics the thread accumulated, newest last. */
  facts: string[];
}

export interface BeatOption {
  id: string;
  label: string;
  note?: string;
}

export interface Beat {
  /** Fires when heat is at least this. Beats are ordered; the thread walks them. */
  at: number;
  /** One line for the week report. Always present. */
  line: (c: BeatCtx) => string;
  /** When set, the beat becomes a thing on the Penthouse asking for an answer. */
  title?: string;
  text?: (c: BeatCtx) => string;
  options?: BeatOption[];
}

export interface ThreadDef {
  kind: string;
  name: string;
  /** What the player is told this is, in the list. */
  blurb: string;
  /** How fast heat builds while the conditions hold, per week. */
  build: number;
  /** How fast it falls when they do not. A thread that cools all the way out lapses. */
  cool: number;
  /** Roles this thread casts. The detector fills them. */
  roles: string[];
  beats: Beat[];
  /** What goes in canon if it runs all the way out without being resolved. */
  fallout?: (c: BeatCtx) => string;
}

export const THREADS: ThreadDef[] = [
  /* ── two people ───────────────────────────────────────────────────────────────────────────── */
  {
    kind: "talkers",
    name: "They have been talking",
    blurb: "Two of them are carrying the same thing and have found each other.",
    build: 14, cool: 22, roles: ["a", "b"],
    beats: [
      { at: 20, line: (c) => `${c.who.a} and ${c.who.b} stop talking when you come in, and start again about a foot after you have gone past.` },
      { at: 45, line: (c) => `${c.who.a} and ${c.who.b} have started eating at the far end. Not hiding. Just far enough that you would have to walk over.` },
      {
        at: 68,
        line: (c) => `${c.who.b} said something to ${c.who.a} in the corridor and both of them looked at you.`,
        title: "Two of them, at the far end of the room",
        text: (c) => `You come down to the kitchens for coffee at six and ${c.who.a} and ${c.who.b} are already there, heads together over one cup. ${c.who.b} is talking. ${c.who.a} is nodding.

They stop when they see you. ${c.who.a} gets up to make your coffee. ${c.who.b} stays sitting down, which six weeks ago she would never have done.

The rota says they've been on the same shift since week ${Math.max(1, c.s.arcology.week - c.weeks)}. You signed it.`,
        options: [
          { id: "split", label: "Put them on different rotas", note: "they'll both know why" },
          { id: "sit", label: "Pull out a chair and sit down with them", note: "ask what's going on" },
          { id: "buy", label: "Give one of them something", note: "cheap; the other one watches" },
          { id: "leave", label: "Take your coffee and go", note: "it won't stop on its own" },
        ],
      },
      {
        at: 92,
        line: (c) => `It came to something with ${c.who.a} and ${c.who.b}, and it was not a surprise to anybody who had been paying attention.`,
      },
    ],
    fallout: (c) => `${c.who.a} and ${c.who.b} decided together what this place was, and nobody stopped them.`,
  },

  {
    kind: "favourite",
    name: "The favourite problem",
    blurb: "One of them is rising and another is watching her do it.",
    build: 12, cool: 18, roles: ["risen", "passed"],
    beats: [
      { at: 22, line: (c) => `${c.who.passed} has started doing the thing where she agrees with ${c.who.risen} a half-second too fast.` },
      { at: 48, line: (c) => `Something of ${c.who.risen}'s went missing this week. It turned up. That is worse.` },
      {
        at: 70,
        line: (c) => `${c.who.passed} is not managing it any more.`,
        title: "The one you passed over",
        text: (c) => `${c.who.passed} brings the weekly figures up to your office and puts them on the desk upside down.

"${c.who.risen} usually does this now," she says. "I thought I'd see what it's like."

She's been here longer than ${c.who.risen}. She was better at the work, and she knows you know it. The figures are right, to the last digit. She waits to be dismissed and doesn't look at you while she waits.`,
        options: [
          { id: "raise", label: "Give her a step up too", note: "it costs, and it works" },
          { id: "explain", label: "Tell her why it went the other way", note: "she might take it" },
          { id: "break", label: "Make an example of her", note: "the house is watching" },
          { id: "nothing", label: "Turn the figures the right way up and say nothing" },
        ],
      },
      { at: 92, line: (c) => `${c.who.passed} has stopped competing. Everyone thinks she's settled down.` },
    ],
    fallout: (c) => `${c.who.passed} stopped trying, and it took two months to show.`,
  },

  {
    kind: "pair",
    name: "Something you did not arrange",
    blurb: "Two of them have found each other, and it is not about you.",
    build: 11, cool: 9, roles: ["a", "b"],
    beats: [
      { at: 25, line: (c) => `${c.who.a} and ${c.who.b} have worked out how to be in the same room without it looking like anything.` },
      { at: 52, line: (c) => `The household knows about ${c.who.a} and ${c.who.b}. Nobody has said so.` },
      {
        at: 74,
        line: (c) => `${c.who.a} asked you for something, and it was not for herself.`,
        title: "The two of them",
        text: (c) => `${c.who.a} asks to be put on the same rota as ${c.who.b}. She's rehearsed it: the laundry runs faster with two who know the machines, and ${c.who.b} knows the machines.

Her hands are shaking a little. Yesterday you saw them on the service stairs, ${c.who.b}'s forehead against ${c.who.a}'s shoulder, not doing anything, just standing there.

"It's just for the work," ${c.who.a} says.`,
        options: [
          { id: "allow", label: "\"Fine. Same rota.\"", note: "both of them will be better at everything" },
          { id: "separate", label: "Put them on opposite ends of the building", note: "they'll know exactly why" },
          { id: "use", label: "\"If you both earn it.\"", note: "now it's yours to take away" },
          { id: "ignore", label: "Change the subject" },
        ],
      },
      { at: 90, line: (c) => `${c.who.a} and ${c.who.b} hold each other up now, and everyone can see it.` },
    ],
    fallout: (c) => `${c.who.a} and ${c.who.b} have each other, and you had nothing to do with it.`,
  },

  /* ── the household ────────────────────────────────────────────────────────────────────────── */
  {
    kind: "belief",
    name: "It stopped being gossip",
    blurb: "A rumour about you has become something they all know.",
    build: 13, cool: 16, roles: [],
    beats: [
      { at: 24, line: () => `The thing they have been saying is being repeated now without the part where somebody heard it somewhere.` },
      { at: 50, line: () => `A woman who arrived three weeks ago repeated it back to you as though it were the weather.` },
      {
        at: 72,
        line: () => `It is not gossip any more. It is what this household knows about you.`,
        title: "What they know about you",
        text: (c) => `${c.facts[0] ?? "Something got out."}

You hear it from the newest girl, on her fourth day. She says it to another new girl on the stairs, the way you'd tell someone where the toilets are. She doesn't know you're on the landing above.

When you come down, she goes white. The other one doesn't — she hasn't been told yet what you look like.`,
        options: [
          { id: "deny", label: "Call them all in and say it isn't true", note: "a denial spreads it too" },
          { id: "prove", label: "Spend a month doing the opposite where they can see", note: "slow and expensive" },
          { id: "own", label: "\"It's true. Remember it.\"", note: "it stops being a rumour and becomes a rule" },
          { id: "hunt", label: "Find out who started it", note: "everyone watches you look" },
        ],
      },
      { at: 90, line: () => `It is settled. Nobody in the building will be talked out of it now.` },
    ],
    fallout: () => `The household settled on a version of you and stopped revising it.`,
  },

  {
    kind: "fracture",
    name: "The house has split",
    blurb: "The household has stopped being one household.",
    build: 10, cool: 14, roles: ["one", "other"],
    beats: [
      { at: 26, line: (c) => `The room reorganises itself when ${c.who.one} walks in, and again when ${c.who.other} does.` },
      { at: 55, line: () => `Two conversations, never one, and they stop when the wrong person is near.` },
      {
        at: 76,
        line: () => `The household is running as two households that share a kitchen.`,
        title: "Two of everything",
        text: (c) => `Dinner in the servants' hall: two long tables, and nobody has told them to sit that way. ${c.who.one} at the head of one. ${c.who.other} at the head of the other. The girl who came in last week stands with her tray between them for a long second before she picks.

Somebody's bunk got flooded on Tuesday. Somebody else's uniform got bleached on Wednesday. Nobody saw anything.

The work is all getting done. That's the worst part: nothing on paper tells you anything's wrong.`,
        options: [
          { id: "pick", label: "Sit down at one of the tables", note: "ends it fast; the other table loses" },
          { id: "mix", label: "Break up every rota and every room", note: "slow and resented" },
          { id: "third", label: "Give them all something bigger to worry about", note: "a common enemy" },
          { id: "watch", label: "Eat upstairs" },
        ],
      },
      { at: 92, line: () => `Two households. The pretence has been dropped.` },
    ],
    fallout: () => `The household split in two and stayed that way.`,
  },

  /* ── one person, and the kernel ───────────────────────────────────────────────────────────── */
  {
    kind: "gone_quiet",
    name: "She has gone quiet",
    blurb: "She does everything she is told and isn't really there.",
    build: 15, cool: 26, roles: ["her"],
    beats: [
      { at: 22, line: (c) => `${c.who.her} has stopped asking for things. Not refused — stopped.` },
      { at: 48, line: (c) => `${c.who.her} has stopped flinching. The Madam calls it progress.` },
      {
        at: 70,
        line: (c) => `${c.who.her} is not in the room she is standing in.`,
        title: "She has gone somewhere",
        text: (c) => `You say ${c.who.her}'s name twice before she turns round. She's folding towels. She finishes the one in her hands first.

"Yes?"

She does everything she's told, on time, correctly. She hasn't cried in a month or complained since before that. The Madam says she's settled in. You ask her what she had for lunch and she thinks about it for a long time and says she doesn't know.`,
        options: [
          { id: "pull", label: "Take her off everything for a while", note: "weeks with nothing asked of her" },
          { id: "reach", label: "Drag her back into the room", note: "make her feel something; she'll hate it" },
          { id: "use", label: "Leave her folding towels", note: "she's never been easier to manage" },
        ],
      },
      { at: 93, line: (c) => `${c.who.her} is not coming back from this without something being done about it.` },
    ],
    fallout: (c) => `${c.who.her} went somewhere and nobody went after her.`,
  },

  {
    kind: "remodelled",
    name: "She is not who arrived",
    blurb: "She has changed, and she hasn't noticed.",
    build: 9, cool: 6, roles: ["her"],
    beats: [
      { at: 30, line: (c) => `A door slammed near ${c.who.her} this week and she barely looked up. In her first month she'd have hidden.` },
      {
        at: 62,
        line: (c) => `${c.who.her} does not brace when the door goes any more.`,
        title: "Whoever this is now",
        text: (c) => `A tray goes over in the corridor, loud, right behind ${c.who.her}. In her first month she'd have been flat against the wall. Today she looks round, sees what it is, and goes back to what she was doing.

You pull her intake sheet. The woman described on it flinched at doors, slept with the light on, and wouldn't eat in front of anyone. You look up at the woman in the corridor, eating an apple while she works.`,
        options: [
          { id: "tell", label: "Show her the intake sheet", note: "it'll land hard" },
          { id: "write", label: "Put the sheet back and say nothing" },
        ],
      },
    ],
    fallout: (c) => `${c.who.her}'s resting point moved and stayed moved.`,
  },

  {
    kind: "watcher",
    name: "Her model of you is wrong",
    blurb: "She is frightened of a version of you that doesn't exist.",
    build: 12, cool: 15, roles: ["her"],
    beats: [
      { at: 24, line: (c) => `${c.who.her} apologised twice this week for things nobody had raised.` },
      { at: 50, line: (c) => `${c.who.her} braced for something that was not coming, and you watched her do it.` },
      {
        at: 74,
        line: (c) => `${c.who.her} is running on a version of you that does not exist.`,
        title: "The version of you she is living with",
        text: (c) => `You reach past ${c.who.her} for a pen and she's on her knees before your hand gets there.

"I'm sorry. I'm sorry, I'll fix it."

There's nothing to fix. You ask her what she thinks she did. She tells you, in a rush — three things, none of which happened, and one that happened to someone else a month ago. She has a whole list. She's been keeping track of what makes you angry, and almost none of it is true.

She's still on her knees, waiting to find out which one this is.`,
        options: [
          { id: "calm", label: "Pick her up and take the pressure off her for a while", note: "it takes months" },
          { id: "predictable", label: "Be exactly the same with her, every day", note: "slow, and it works" },
          { id: "confirm", label: "Become what she thinks you are", note: "she'll stop getting it wrong" },
        ],
      },
      { at: 92, line: (c) => `${c.who.her} has a complete and inaccurate model of you, and she is not revising it.` },
    ],
    fallout: (c) => `${c.who.her} decided what you were and stopped checking.`,
  },

  {
    kind: "debt",
    name: "She is owed and she knows it",
    blurb: "You were kind to her, and she has been keeping count.",
    build: 11, cool: 13, roles: ["her"],
    beats: [
      { at: 26, line: (c) => `${c.who.her} asked for something small this week and was surprised to get it.` },
      { at: 52, line: (c) => `${c.who.her} has started asking for things on other people's behalf.` },
      {
        at: 72,
        line: (c) => `${c.who.her} wants something real, and has decided she has earned it.`,
        title: "The account she has been keeping",
        text: (c) => `${c.who.her} closes your office door behind her, which nobody does without being told to.

"You let me sleep in when I was ill. You brought me the good soap. You asked about my mother." She says it like a list she's practised. "I've never asked you for anything big."

She wants a room with a window and one day a week that's hers. She's standing very straight. She's sure she's earned it, and she's not wrong.`,
        options: [
          { id: "pay", label: "Give her the room and the day", note: "and she stays for good" },
          { id: "part", label: "The room, not the day", note: "she'll take it and remember the rest" },
          { id: "refuse", label: "Say no, and tell her why" },
          { id: "punish", label: "Remind her what she is", note: "she won't ask again" },
        ],
      },
    ],
    fallout: (c) => `${c.who.her} kept an account, presented it, and got nothing.`,
  },
];

export const THREAD_BY_KIND: Record<string, ThreadDef> =
  Object.fromEntries(THREADS.map((t) => [t.kind, t]));
