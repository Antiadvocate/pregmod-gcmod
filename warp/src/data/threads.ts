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
      { at: 45, line: (c) => `${c.who.a} and ${c.who.b} have started eating at the far end of the room, not hiding exactly, but far enough that you would have to get up and walk over.` },
      {
        at: 68,
        line: (c) => `${c.who.b} said something to ${c.who.a} in the corridor and both of them looked at you.`,
        title: "Two of them, at the far end of the room",
        text: (c) => `It has been about six weeks and you can date it from the rota if you go back and look.

They are not plotting. That would be easier and you would have caught it. What they are doing is agreeing with each other, quietly, every day, about what this place is — and two people who agree about that are a different thing from two people who each think it privately.

${c.who.a} does the thinking. ${c.who.b} does the deciding, which she would not have done six weeks ago on her own.`,
        options: [
          { id: "split", label: "Put them on different rotas", note: "the obvious move, and they will both know why" },
          { id: "sit", label: "Sit down with both of them", note: "asks what it is; you may not like the answer" },
          { id: "buy", label: "Give one of them something", note: "cheap, effective, and the other one watches you do it" },
          { id: "leave", label: "Leave it", note: "it does not stop on its own" },
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
      { at: 48, line: (c) => `Something of ${c.who.risen}'s went missing this week and then turned up again, which is worse than if it had stayed missing.` },
      {
        at: 70,
        line: (c) => `${c.who.passed} is not managing it any more.`,
        title: "The one you passed over",
        text: (c) => `${c.who.risen} has what she has because of things you did, most of which you can remember doing.

${c.who.passed} has been here longer. She was better at it. She did the arithmetic weeks ago and got an answer she has not said out loud, and this week she stopped bothering to hide the working.

She is not going to do anything to ${c.who.risen}. She is going to stop being useful to you, slowly, in ways that are individually deniable, and you will notice in about two months.`,
        options: [
          { id: "raise", label: "Raise her too", note: "costs, and it works" },
          { id: "explain", label: "Tell her why it went the other way", note: "she may take it; she may not" },
          { id: "break", label: "Make an example of her", note: "the household is watching this one" },
          { id: "nothing", label: "Nothing", note: "she was right about you" },
        ],
      },
      { at: 92, line: (c) => `${c.who.passed} has stopped competing, which everybody has mistaken for settling down.` },
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
      { at: 52, line: (c) => `The household knows about ${c.who.a} and ${c.who.b}, though nobody has said so out loud yet.` },
      {
        at: 74,
        line: (c) => `${c.who.a} asked you for something, and it was not for herself.`,
        title: "The two of them",
        text: (c) => `${c.who.a} asks to be put on the same rota as ${c.who.b}. She has a reason ready and the reason is about the work.

It is not about the work. You knew before she opened her mouth and she knows you knew, and the whole exchange is both of you agreeing to talk about the rota.

This is the one thing in the building that happened without you. What you do about that is the decision.`,
        options: [
          { id: "allow", label: "Put them together", note: "they will both be better at everything" },
          { id: "separate", label: "Separate them", note: "and they will both know exactly why" },
          { id: "use", label: "Make it conditional", note: "you now own the thing they have" },
          { id: "ignore", label: "Say nothing either way" },
        ],
      },
      { at: 90, line: (c) => `Whatever ${c.who.a} and ${c.who.b} have, it is load-bearing for both of them now.` },
    ],
    fallout: (c) => `${c.who.a} and ${c.who.b} have each other, which is a thing you do not control.`,
  },

  /* ── the household ────────────────────────────────────────────────────────────────────────── */
  {
    kind: "belief",
    name: "It stopped being gossip",
    blurb: "Something the household says about you has hardened into something it knows.",
    build: 13, cool: 16, roles: [],
    beats: [
      { at: 24, line: () => `The thing they have been saying is being repeated now without the part where somebody heard it somewhere.` },
      { at: 50, line: () => `A woman who arrived three weeks ago repeated it back to you as though it were the weather.` },
      {
        at: 72,
        line: () => `It has stopped being gossip and become the thing this household simply knows about you.`,
        title: "What they know about you",
        text: (c) => `${c.facts[0] ?? "Something got out."}

It has been going round for long enough that the version being told now has been smoothed by the telling — the details are gone and what is left is the shape, which is harder to argue with than the details ever were.

Everybody in the building believes it. Two of them believe it about things you did not do. New arrivals are being told it in the first week, by women who were told it themselves, and none of them have any reason to doubt the source.`,
        options: [
          { id: "deny", label: "Say it plainly, to all of them", note: "denial spreads it further and they know that too" },
          { id: "prove", label: "Do something that contradicts it", note: "slow, expensive, and the only thing that works" },
          { id: "own", label: "Confirm it", note: "it stops being a rumour and starts being policy" },
          { id: "hunt", label: "Find out who started it", note: "and everybody watches you look" },
        ],
      },
      { at: 90, line: () => `It is settled now, and nobody in the building is going to be talked out of it.` },
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
        text: (c) => `You can draw the line on the rota. ${c.who.one} on one side, ${c.who.other} on the other, and every woman in the building has picked without being asked to.

It is not about either of them. They are only where it settled. What it is about is that two ways of surviving here both work, and each one makes the other look like a mistake, and nobody can hold both.

The work is getting done. That is the part that will keep you from acting until it is much worse.`,
        options: [
          { id: "pick", label: "Back one side openly", note: "ends it fast, at the cost of the other half" },
          { id: "mix", label: "Break up every rota", note: "expensive, slow, and nobody forgives it quickly" },
          { id: "third", label: "Give them something that is neither", note: "a common problem is the oldest trick there is" },
          { id: "watch", label: "Let it run" },
        ],
      },
      { at: 92, line: () => `There are two households in this building now, and nobody is pretending otherwise.` },
    ],
    fallout: () => `The household split in two and stayed that way.`,
  },

  /* ── one person, and the kernel ───────────────────────────────────────────────────────────── */
  {
    kind: "gone_quiet",
    name: "She has gone quiet",
    blurb: "Somebody has stopped being in the room she is standing in.",
    build: 15, cool: 26, roles: ["her"],
    beats: [
      { at: 22, line: (c) => `${c.who.her} has stopped asking you for things altogether, which is not the same as having been refused.` },
      { at: 48, line: (c) => `${c.who.her} has stopped flinching, which everybody keeps reading as progress.` },
      {
        at: 70,
        line: (c) => `${c.who.her} is not in the room she is standing in.`,
        title: "She has gone somewhere",
        text: (c) => `${c.who.her} does what she is told, on time, correctly. Her health is fine. She has not cried in a month and she has not complained about anything since before that.

It reads as settling in. Everybody who works with her thinks she has settled in.

What is actually happening is that she has stopped being present for it. She is somewhere else, all day, and coming back costs her more each week she does not — and the body left behind is very easy to run a household with, which is the trap.

This does not get better on its own, and the point where it stops being reversible does not announce itself.`,
        options: [
          { id: "pull", label: "Take her off everything", note: "weeks of nothing asked of her; it costs you and it works" },
          { id: "reach", label: "Get in the way of it", note: "make her be here for something, which she will hate" },
          { id: "use", label: "Leave her as she is", note: "she is the most useful woman in the building like this" },
        ],
      },
      { at: 93, line: (c) => `${c.who.her} is not coming back from this without something being done about it.` },
    ],
    fallout: (c) => `${c.who.her} went somewhere and nobody went after her.`,
  },

  {
    kind: "remodelled",
    name: "She is not who arrived",
    blurb: "Her resting point has moved, and that is not something that comes back on its own.",
    build: 9, cool: 6, roles: ["her"],
    beats: [
      { at: 30, line: (c) => `${c.who.her} was startled by something this week and got over it in about a second, which she could not do in her first month.` },
      {
        at: 62,
        line: (c) => `${c.who.her} does not brace when the door goes any more.`,
        title: "Whoever this is now",
        text: (c) => `Go back and read what you wrote about ${c.who.her} when she arrived.

It is not the same person. Not worn down and not fixed — moved. Her body has picked a new place to sit when nothing is happening, and it is somewhere she has been often enough that it stopped being the exception.

She has not noticed. People do not notice this about themselves. Somebody who knew her before would notice inside a minute.`,
        options: [
          { id: "tell", label: "Tell her", note: "she has a right to know and it will land badly" },
          { id: "write", label: "Write it down and say nothing", note: "for you, not for her" },
        ],
      },
    ],
    fallout: (c) => `${c.who.her}'s resting point moved and stayed moved.`,
  },

  {
    kind: "watcher",
    name: "Her model of you is wrong",
    blurb: "Somebody frightened has built a theory of you and started acting on it.",
    build: 12, cool: 15, roles: ["her"],
    beats: [
      { at: 24, line: (c) => `${c.who.her} apologised twice this week for things nobody had raised.` },
      { at: 50, line: (c) => `${c.who.her} braced for something that was not coming, and you watched her do it.` },
      {
        at: 74,
        line: (c) => `${c.who.her} is running on a version of you that does not exist.`,
        title: "The version of you she is living with",
        text: (c) => `Fear is a terrible teacher and this is what it taught ${c.who.her}.

She has been watching you for months, from far too close, in a state where a neutral face reads as a threat and a pause reads as a decision already made. She has built a complete theory of you out of that, and it is wrong — not wrong about everything, which would be easier, but wrong in a way that has the shape of being right.

She is acting on it daily. She placates things you were not going to do. She flinches at the wrong second and takes the wrong lesson from the correction. And every time you fail to be the man in her head, she files it as an exception rather than as evidence, because the theory is the only thing keeping her safe.

You cannot argue her out of it. She is not reasoning.`,
        options: [
          { id: "calm", label: "Take the pressure off long enough for her to look", note: "months; it is the only thing that reaches this" },
          { id: "predictable", label: "Become boringly consistent", note: "slower, cheaper, and it works on the mechanism" },
          { id: "confirm", label: "Be the man in her head", note: "she is right, the theory holds, and she stops flinching wrong" },
        ],
      },
      { at: 92, line: (c) => `${c.who.her} has a complete and inaccurate model of you, and she is not revising it.` },
    ],
    fallout: (c) => `${c.who.her} decided what you were and stopped checking.`,
  },

  {
    kind: "debt",
    name: "She is owed and she knows it",
    blurb: "Kindness landed, and it created an expectation nobody named.",
    build: 11, cool: 13, roles: ["her"],
    beats: [
      { at: 26, line: (c) => `${c.who.her} asked for something small this week and was surprised to get it.` },
      { at: 52, line: (c) => `${c.who.her} has started asking for things on other people's behalf, which is a promotion she gave herself.` },
      {
        at: 72,
        line: (c) => `${c.who.her} wants something real, and has decided she has earned it.`,
        title: "The account she has been keeping",
        text: (c) => `You were good to ${c.who.her}. Repeatedly, over months, in ways you mostly did not think about.

She thought about all of them. She has been keeping an account you did not know was open, and this week the balance got high enough for her to ask.

She is not wrong. That is the difficulty. By any reading of what has passed between you she is owed something, and both of you can feel that, and neither of you agreed to it.`,
        options: [
          { id: "pay", label: "Give her what she is asking for", note: "the bond converts to something that holds" },
          { id: "part", label: "Give her part of it", note: "honest, and she will count it" },
          { id: "refuse", label: "Refuse, and say why", note: "the account closes; so does something else" },
          { id: "punish", label: "Remind her what she is", note: "settles it permanently, one way" },
        ],
      },
    ],
    fallout: (c) => `${c.who.her} kept an account, presented it, and got nothing.`,
  },
];

export const THREAD_BY_KIND: Record<string, ThreadDef> =
  Object.fromEntries(THREADS.map((t) => [t.kind, t]));
