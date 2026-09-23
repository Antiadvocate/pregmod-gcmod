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
    name: "Two slaves are plotting",
    blurb: "Two unhappy slaves have started spending a lot of time together.",
    build: 14, cool: 22, roles: ["a", "b"],
    beats: [
      { at: 20, line: (c) => `${c.who.a} and ${c.who.b} stop talking whenever you walk in, and start again once you leave.` },
      { at: 45, line: (c) => `${c.who.a} and ${c.who.b} have started eating together at the far end of the table, away from everyone else.` },
      {
        at: 68,
        line: (c) => `You caught ${c.who.a} and ${c.who.b} whispering in the corridor. They both stared at you.`,
        title: "Whispering in the kitchen",
        text: (c) => `You come down to the kitchens for coffee at six and ${c.who.a} and ${c.who.b} are already there, heads together over one cup. ${c.who.b} is talking. ${c.who.a} is nodding.

They stop when they see you. ${c.who.a} gets up to make your coffee. ${c.who.b} stays in her seat. Six weeks ago she'd have jumped up.

They've been on the same shift since week ${Math.max(1, c.s.arcology.week - c.weeks)}, and they're clearly up to something.`,
        options: [
          { id: "split", label: "Put them on different rotas", note: "they'll both know why" },
          { id: "sit", label: "Pull out a chair and sit down with them", note: "ask what's going on" },
          { id: "buy", label: "Give one of them something", note: "cheap; the other one watches" },
          { id: "leave", label: "Take your coffee and go", note: "they'll keep plotting" },
        ],
      },
      {
        at: 92,
        line: (c) => `${c.who.a} and ${c.who.b} finally acted on whatever they were planning.`,
      },
    ],
    fallout: (c) => `${c.who.a} and ${c.who.b} turned against you together, and you never stopped them.`,
  },

  {
    kind: "favourite",
    name: "A jealous slave",
    blurb: "You've favored one slave over another, and the one you passed over is jealous.",
    build: 12, cool: 18, roles: ["risen", "passed"],
    beats: [
      { at: 22, line: (c) => `${c.who.passed} is sucking up to ${c.who.risen}, and it's obviously fake.` },
      { at: 48, line: (c) => `Some of ${c.who.risen}'s things went missing this week and turned up later, damaged. ${c.who.passed} is the obvious suspect.` },
      {
        at: 70,
        line: (c) => `${c.who.passed} can't hide her jealousy any more.`,
        title: "The one you passed over",
        text: (c) => `${c.who.passed} brings the weekly figures up to your office and puts them on the desk upside down.

"${c.who.risen} usually does this now," she says. "I thought I'd see what it's like."

She's been here longer than ${c.who.risen}. She was better at the work, and she knows you know it. The figures are right, to the last digit. She's angry about being passed over and she wants you to know it.`,
        options: [
          { id: "raise", label: "Give her a step up too", note: "expensive, but it'll satisfy her" },
          { id: "explain", label: "Tell her why it went the other way", note: "she might take it" },
          { id: "break", label: "Make an example of her", note: "the other slaves will see" },
          { id: "nothing", label: "Turn the figures the right way up and say nothing" },
        ],
      },
      { at: 92, line: (c) => `${c.who.passed} has given up competing with ${c.who.risen}, and she's miserable about it.` },
    ],
    fallout: (c) => `${c.who.passed} gave up trying to earn your favor.`,
  },

  {
    kind: "pair",
    name: "A slave romance",
    blurb: "Two of your slaves have fallen for each other.",
    build: 11, cool: 9, roles: ["a", "b"],
    beats: [
      { at: 25, line: (c) => `${c.who.a} and ${c.who.b} are trying to hide that they have feelings for each other. They aren't very good at it.` },
      { at: 52, line: (c) => `All your slaves know that ${c.who.a} and ${c.who.b} are sleeping together.` },
      {
        at: 74,
        line: (c) => `${c.who.a} asked you for a favor for ${c.who.b}'s sake.`,
        title: "Lovers",
        text: (c) => `${c.who.a} asks to be put on the same rota as ${c.who.b}. She's clearly practiced her excuse: the laundry runs faster with two girls who know the machines, and ${c.who.b} knows the machines.

She's nervous. Yesterday you caught the two of them holding each other on the service stairs.

"It's just for the work," ${c.who.a} says.`,
        options: [
          { id: "allow", label: "\"Fine. Same rota.\"", note: "they'll both be happier and work harder" },
          { id: "separate", label: "Put them on opposite ends of the building", note: "they'll know why" },
          { id: "use", label: "\"If you both earn it.\"", note: "you can take it away if they slack off" },
          { id: "ignore", label: "Change the subject" },
        ],
      },
      { at: 90, line: (c) => `${c.who.a} and ${c.who.b} are openly a couple now.` },
    ],
    fallout: (c) => `${c.who.a} and ${c.who.b} are a couple, without your say-so.`,
  },

  /* ── the household ────────────────────────────────────────────────────────────────────────── */
  {
    kind: "belief",
    name: "A rumor about you",
    blurb: "A rumor about you is spreading through your slaves, and they believe it.",
    build: 13, cool: 16, roles: [],
    beats: [
      { at: 24, line: () => `Your slaves are repeating the rumor about you as if it's fact.` },
      { at: 50, line: () => `A slave who arrived three weeks ago mentioned the rumor to you as if everyone knew it.` },
      {
        at: 72,
        line: () => `Every slave in the penthouse believes the rumor about you now.`,
        title: "The rumor",
        text: (c) => `${c.facts[0] ?? "A rumor about you is going around."}

You overhear the newest girl, on her fourth day, telling another new girl about it on the stairs as if it's common knowledge. She doesn't know you're on the landing above.

When you come down, she goes white with fear.`,
        options: [
          { id: "deny", label: "Call them all in and say it isn't true", note: "denying it will spread it further" },
          { id: "prove", label: "Spend a month doing the opposite where they can see", note: "slow and expensive" },
          { id: "own", label: "\"It's true. Remember it.\"", note: "they'll believe it for good" },
          { id: "hunt", label: "Find out who started it", note: "your slaves will see you hunting" },
        ],
      },
      { at: 90, line: () => `Nobody in the penthouse will ever be convinced the rumor isn't true.` },
    ],
    fallout: () => `Your slaves believe the rumor about you, and always will.`,
  },

  {
    kind: "fracture",
    name: "Rival factions",
    blurb: "Your slaves have split into two factions that hate each other.",
    build: 10, cool: 14, roles: ["one", "other"],
    beats: [
      { at: 26, line: (c) => `Your slaves are picking sides between ${c.who.one} and ${c.who.other}.` },
      { at: 55, line: () => `The two factions won't talk to each other.` },
      {
        at: 76,
        line: () => `Your slaves have split into two factions.`,
        title: "Two factions",
        text: (c) => `At dinner in the servants' hall, your slaves sit at two separate tables: ${c.who.one}'s girls at one and ${c.who.other}'s at the other. The newest girl stands between them with her tray, not sure where she's allowed to sit.

Someone's bunk got flooded on Tuesday and someone else's uniform got bleached on Wednesday. Nobody will say who did it. The work is still getting done, so none of it shows up in the reports.`,
        options: [
          { id: "pick", label: "Sit down at one of the tables", note: "ends it fast, but the other side will resent it" },
          { id: "mix", label: "Break up every rota and every room", note: "slow, and they'll hate it" },
          { id: "third", label: "Give them all something bigger to worry about", note: "unite them against a common enemy" },
          { id: "watch", label: "Eat upstairs" },
        ],
      },
      { at: 92, line: () => `The two factions openly hate each other now.` },
    ],
    fallout: () => `Your slaves split into two factions, and stayed that way.`,
  },

  /* ── one person, and the kernel ───────────────────────────────────────────────────────────── */
  {
    kind: "gone_quiet",
    name: "A slave is shutting down",
    blurb: "She obeys every order, but she's mentally checked out.",
    build: 15, cool: 26, roles: ["her"],
    beats: [
      { at: 22, line: (c) => `${c.who.her} has stopped asking for anything.` },
      { at: 48, line: (c) => `${c.who.her} doesn't react to anything any more. She seems numb.` },
      {
        at: 70,
        line: (c) => `${c.who.her} is completely withdrawn.`,
        title: "Withdrawn",
        text: (c) => `You have to say ${c.who.her}'s name twice before she answers. She's folding towels, and she finishes the one she's holding before she looks up.

"Yes?"

She does everything she's told, on time and correctly, but she's numb. She hasn't cried or complained in a month. When you ask what she had for lunch, she can't remember.`,
        options: [
          { id: "pull", label: "Take her off everything for a while", note: "a few weeks of rest" },
          { id: "reach", label: "Shock her out of it", note: "she'll hate it, but it might work" },
          { id: "use", label: "Leave her folding towels", note: "she's never been easier to manage" },
        ],
      },
      { at: 93, line: (c) => `${c.who.her} won't recover without help.` },
    ],
    fallout: (c) => `${c.who.her} shut down completely, and nobody helped her.`,
  },

  {
    kind: "remodelled",
    name: "A changed slave",
    blurb: "She has changed a lot since she arrived, and she hasn't noticed.",
    build: 9, cool: 6, roles: ["her"],
    beats: [
      { at: 30, line: (c) => `A door slammed near ${c.who.her} this week and she barely looked up. When she first arrived she'd have hidden.` },
      {
        at: 62,
        line: (c) => `${c.who.her} isn't jumpy any more.`,
        title: "How far she's come",
        text: (c) => `A tray goes over in the corridor, loud, right behind ${c.who.her}. In her first month she'd have been flat against the wall. Today she looks round, sees what it is, and goes back to what she was doing.

You look up her intake sheet. When she arrived she jumped at every noise, slept with the light on, and wouldn't eat in front of anyone. Now she's eating an apple while she works.`,
        options: [
          { id: "tell", label: "Show her the intake sheet", note: "she'll be shocked" },
          { id: "write", label: "Put the sheet back and say nothing" },
        ],
      },
    ],
    fallout: (c) => `${c.who.her} changed for good.`,
  },

  {
    kind: "watcher",
    name: "She's afraid of you for no reason",
    blurb: "She's convinced you're crueler than you are.",
    build: 12, cool: 15, roles: ["her"],
    beats: [
      { at: 24, line: (c) => `${c.who.her} apologized twice this week for things she hadn't done.` },
      { at: 50, line: (c) => `${c.who.her} flinched this week when you moved, expecting to be hit.` },
      {
        at: 74,
        line: (c) => `${c.who.her} is terrified of you for things you haven't done.`,
        title: "Terrified",
        text: (c) => `You reach past ${c.who.her} for a pen and she's on her knees before your hand gets there.

"I'm sorry. I'm sorry, I'll fix it."

She hasn't done anything wrong. When you ask what she thinks she did, she lists three things that never happened and one that happened to someone else a month ago. She's convinced herself you'll punish her for all sorts of things you've never cared about, and she's still on her knees waiting for it.`,
        options: [
          { id: "calm", label: "Pick her up and take the pressure off her for a while", note: "it'll take months" },
          { id: "predictable", label: "Be exactly the same with her, every day", note: "slow, but it works" },
          { id: "confirm", label: "Become what she thinks you are", note: "she'll be right to be afraid" },
        ],
      },
      { at: 92, line: (c) => `${c.who.her} is permanently terrified of you, for no good reason.` },
    ],
    fallout: (c) => `${c.who.her} decided you were a monster and never changed her mind.`,
  },

  {
    kind: "debt",
    name: "She thinks you owe her",
    blurb: "You've been kind to her, and she's starting to expect things.",
    build: 11, cool: 13, roles: ["her"],
    beats: [
      { at: 26, line: (c) => `${c.who.her} asked for a small favor this week and was surprised when you said yes.` },
      { at: 52, line: (c) => `${c.who.her} has started asking you for favors for the other slaves.` },
      {
        at: 72,
        line: (c) => `${c.who.her} thinks she's earned something big, and she's going to ask for it.`,
        title: "Asking for more",
        text: (c) => `${c.who.her} closes your office door behind her, which nobody does without being told to.

"You let me sleep in when I was ill. You brought me the good soap. You asked about my mother." She says it like a list she's practised. "I've never asked you for anything big."

She wants a room with a window and one day off a week. She's sure she's earned it, and she has a point.`,
        options: [
          { id: "pay", label: "Give her the room and the day", note: "she'll be devoted to you" },
          { id: "part", label: "The room, not the day", note: "she'll take it, but she'll be disappointed" },
          { id: "refuse", label: "Say no, and tell her why" },
          { id: "punish", label: "Remind her what she is", note: "she won't ask again" },
        ],
      },
    ],
    fallout: (c) => `${c.who.her} asked you for something she thought she'd earned, and got nothing.`,
  },
];

export const THREAD_BY_KIND: Record<string, ThreadDef> =
  Object.fromEntries(THREADS.map((t) => [t.kind, t]));
