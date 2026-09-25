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
  /** For threads defined with their answers alongside: what choosing this does. */
  run?: (a: AnswerCtx) => { line: string; closes?: boolean; cool?: number };
}

/** What an answer can reach. */
export interface AnswerCtx {
  s: SaveState;
  P: (role: string) => import("../engine/types").Person | undefined;
  nm: (role: string) => string;
  week: number;
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
  /* ── bonds between them ───────────────────────────────────────────────────────────────────── */
  {
    kind: "rivals",
    name: "Two slaves who hate each other",
    blurb: "Two of your slaves can't stand each other, and they're both after the same thing: you.",
    build: 11, cool: 12, roles: ["a", "b"],
    beats: [
      { at: 20, line: (c) => `${c.who.a} and ${c.who.b} have started sabotaging each other's work in small ways: a ruined dress, a message that never got passed on.` },
      { at: 45, line: (c) => `${c.who.a} and ${c.who.b} had a screaming fight in the kitchen this week. ${c.who.b} has a scratch down her cheek.` },
      {
        at: 70,
        line: (c) => `${c.who.a} and ${c.who.b} can't be in the same room any more.`,
        title: "Two women who hate each other",
        text: (c) => `You come into the lounge and find ${c.who.a} and ${c.who.b} on the floor, ${c.who.a} on top with a fistful of ${c.who.b}'s hair. Two house slaves are trying to pull them apart. There's a broken glass on the rug.

They both stop the moment they see you. They both start talking at once, and each of them is telling you it was the other one, and each of them is looking at you to see whose side you'll take.`,
        options: [
          { id: "pit", label: "Let them settle it properly, in front of everyone", note: "one of them wins, and everyone sees it",
            run: ({ s, P, nm, week }) => { const a = P("a"), b = P("b"); if (!a || !b) return { line: "" };
              const aw = a.skills.combat + a.health.health / 4 + (idOf(a.id) % 20) >= b.skills.combat + b.health.health / 4 + (idOf(b.id) % 20);
              const [w, l] = aw ? [a, b] : [b, a];
              applyTreatmentLite(s, w, "recognition", 5, "won the fight in front of the household", week); applyTreatmentLite(s, l, "cruelty", 6, "beaten in front of the household", week);
              w.skills.combat = Math.min(100, w.skills.combat + 4); l.health.health = Math.max(-100, l.health.health - 12);
              roles(s, w.id, l.id, "rival she beat", "rival who beat her");
              return { line: `You have the lounge cleared and tell them to finish it. They do. It lasts four minutes and it's ugly. ${w.name} ends up kneeling on ${l.name}'s back with her arm twisted up behind her, and ${l.name} says "enough" into the carpet.\n\n${w.name} walks around like she owns the penthouse for a week. ${l.name} doesn't look at either of you.`, closes: true, cool: 70 }; } },
          { id: "bed", label: "Make them share your bed tonight", note: "either they make peace or it gets worse",
            run: ({ s, P, week }) => { const a = P("a"), b = P("b"); if (!a || !b) return { line: "" };
              const soft = (a.bond.bond + b.bond.bond) / 2 > 20;
              for (const p of [a, b]) applyTreatmentLite(s, p, soft ? "recognition" : "coercion", soft ? 4 : 5, "made to share the owner's bed with her rival", week);
              warm(s, a.id, b.id, soft ? 30 : -10);
              if (soft) roles(s, a.id, b.id, "rival, and more", "rival, and more");
              return { line: soft ? `It starts with the two of them on opposite edges of the mattress, rigid, not touching. By the end of the night ${a.name} has her face buried in ${b.name}'s neck and neither of them is thinking about the fight.\n\nThey still snipe at each other at breakfast. It sounds different now.` : `They lie on either side of you all night, awake, and each of them makes sure you notice she's better at it than the other. In the morning they're worse than before.`, closes: soft, cool: soft ? 80 : 10 }; } },
          { id: "pick", label: "Take one side, publicly", note: "the other one will remember",
            run: ({ s, P, week }) => { const a = P("a"), b = P("b"); if (!a || !b) return { line: "" };
              const [w, l] = a.bond.bond >= b.bond.bond ? [a, b] : [b, a];
              applyTreatmentLite(s, w, "recognition", 7, "you took her side against her rival", week); applyTreatmentLite(s, l, "cruelty", 7, "you took her rival's side against her", week);
              roles(s, w.id, l.id, "rival", "rival");
              return { line: `You tell ${l.name} to clean up the glass, and take ${w.name} back to your room with you. Everyone in the lounge sees it.\n\n${l.name} cleans it up on her knees. She takes a very long time about it.`, closes: true, cool: 60 }; } },
          { id: "both", label: "Punish them both, the same", note: "fair, and neither of them will thank you",
            run: ({ s, P, week }) => { for (const r of ["a", "b"]) { const p = P(r); if (p) applyTreatmentLite(s, p, "coercion", 5, "punished for fighting", week); }
              return { line: `You have them both put in the stocks in the service corridor overnight, side by side, close enough to hear each other breathe. It stops the fighting. It doesn't stop anything else.`, cool: 45 }; } },
        ],
      },
      { at: 92, line: (c) => `The rest of the household has taken sides between ${c.who.a} and ${c.who.b}.` },
    ],
    fallout: (c) => `${c.who.a} and ${c.who.b} hate each other, and the household is split over it.`,
  },
  {
    kind: "protector",
    name: "A slave looking out for another",
    blurb: "One of your settled slaves has taken a frightened new one under her wing.",
    build: 10, cool: 10, roles: ["guard", "ward"],
    beats: [
      { at: 22, line: (c) => `${c.who.guard} has been covering for ${c.who.ward}'s mistakes, quietly redoing her work before anyone checks it.` },
      { at: 50, line: (c) => `${c.who.ward} sleeps in ${c.who.guard}'s bunk now. She has nightmares, and ${c.who.guard} is the one who wakes up.` },
      {
        at: 74,
        line: (c) => `${c.who.guard} asked to take ${c.who.ward}'s punishment.`,
        title: "She'll take it instead",
        text: (c) => `${c.who.ward} broke a decanter this morning, an expensive one, and she's standing in your office shaking so hard her teeth are clicking.

${c.who.guard} came in with her without being called. "I'll take it," she says, before you've said anything. "Whatever it is. She can't. You can see she can't." She steps half in front of ${c.who.ward}, and ${c.who.ward} grabs a fistful of the back of her dress.`,
        options: [
          { id: "allow", label: "Let her take it", note: "she earns something from both of you",
            run: ({ s, P, nm, week }) => { const g = P("guard"), w = P("ward"); if (!g || !w) return { line: "" };
              applyTreatmentLite(s, g, "coercion", 3, `took ${w.name}'s punishment`, week); applyTreatmentLite(s, g, "recognition", 5, "you let her protect the new girl", week);
              applyTreatmentLite(s, w, "kindness", 5, `${g.name} took her punishment for her`, week); w.bond.fear = Math.max(0, w.bond.fear - 10);
              roles(s, g.id, w.id, "protects her", "protected by her"); warm(s, w.id, g.id, 25);
              return { line: `You let ${nm("guard")} take it: ten strokes, bent over your desk, with ${nm("ward")} made to watch. ${nm("guard")} doesn't make a sound until the last one.\n\n${nm("ward")} helps her walk back downstairs. From then on, she'd walk into fire for her.`, closes: true, cool: 80 }; } },
          { id: "refuse", label: "Punish the one who broke it", note: "and make the other one watch",
            run: ({ s, P, week }) => { const g = P("guard"), w = P("ward"); if (!g || !w) return { line: "" };
              applyTreatmentLite(s, w, "cruelty", 6, "punished while her protector was made to watch", week); applyTreatmentLite(s, g, "cruelty", 4, "made to watch the girl she protects punished", week);
              return { line: `You tell ${g.name} to stand by the wall, and you punish ${w.name} yourself. ${g.name} watches all of it with her jaw set.\n\nThat night ${w.name} is back in ${g.name}'s bunk. ${g.name} lies awake long after she's asleep.`, cool: 30 }; } },
          { id: "train", label: "Make it official: the new girl is hers to train", note: "the new girl learns faster",
            run: ({ s, P, week }) => { const g = P("guard"), w = P("ward"); if (!g || !w) return { line: "" };
              applyTreatmentLite(s, g, "recognition", 7, "given the new girl to train", week); applyTreatmentLite(s, w, "kindness", 3, "given to the one who looks after her", week);
              for (const k of ["oral", "entertainment"] as const) w.skills[k] = Math.min(100, w.skills[k] + 5);
              roles(s, g.id, w.id, "her trainer", "her student");
              return { line: `You tell ${g.name} the decanter comes out of her allowance, and ${w.name} is hers now: hers to train, hers to answer for. ${g.name} looks at you for a long moment, and then nods.\n\n${w.name} starts learning faster almost at once.`, closes: true, cool: 75 }; } },
          { id: "split", label: "Split them up; she's getting soft", note: "both of them will hate it",
            run: ({ s, P, week }) => { const g = P("guard"), w = P("ward"); if (!g || !w) return { line: "" };
              w.facility = undefined; applyTreatmentLite(s, w, "cruelty", 5, `taken away from ${g.name}`, week); applyTreatmentLite(s, g, "cruelty", 5, `the girl she looked after was taken away`, week);
              return { line: `You move ${w.name} to the other side of the arcology. ${g.name} doesn't say anything when she hears. She just stops talking to anyone for three days.`, closes: true, cool: 90 }; } },
        ],
      },
      { at: 92, line: (c) => `${c.who.ward} goes to ${c.who.guard} with everything now, not to you.` },
    ],
    fallout: (c) => `${c.who.guard} looks after ${c.who.ward}, and the household knows not to touch her.`,
  },
  {
    kind: "tormentor",
    name: "A slave is being bullied",
    blurb: "One of your slaves has power over another and is using it.",
    build: 12, cool: 11, roles: ["bully", "target"],
    beats: [
      { at: 22, line: (c) => `${c.who.target} flinches whenever ${c.who.bully} walks into the room.` },
      { at: 48, line: (c) => `${c.who.target} has bruises on her upper arms that she won't explain. ${c.who.bully} was seen coming out of the showers after her.` },
      {
        at: 72,
        line: (c) => `${c.who.target} came to you about ${c.who.bully}.`,
        title: "What she's doing to her",
        text: (c) => `${c.who.target} catches you in the corridor, which she's never done before. She talks fast, keeping her eyes on the floor.

${c.who.bully} makes her kneel and hold a tray of full glasses above her head for an hour at a time. She takes her food. She makes her sleep on the floor at the foot of her bed and calls it "keeping her in her place." Last night she held her head in the laundry sink until she stopped struggling.

"Please," ${c.who.target} says. "I know she's above me. I'll do anything else."`,
        options: [
          { id: "stop", label: "Put a stop to it, and punish her", note: "the household sees who you protect",
            run: ({ s, P, week }) => { const b = P("bully"), t = P("target"); if (!b || !t) return { line: "" };
              applyTreatmentLite(s, b, "coercion", 7, `punished for what she did to ${t.name}`, week); applyTreatmentLite(s, t, "recognition", 8, "you believed her and stopped it", week);
              t.bond.fear = Math.max(0, t.bond.fear - 12); roles(s, b.id, t.id, "used to torment her", "used to be tormented by her");
              return { line: `You have ${b.name} brought up, and you tell her in front of ${t.name} exactly what happens if it happens again. Then you make her spend the night on the floor at the foot of ${t.name}'s bed.\n\nIt stops. ${t.name} starts eating properly again.`, closes: true, cool: 85 }; } },
          { id: "let", label: "Tell her to learn to deal with it", note: "it carries on",
            run: ({ s, P, week }) => { const t = P("target"), b = P("bully"); if (t) { applyTreatmentLite(s, t, "cruelty", 6, "you told her to deal with it herself", week); t.bond.hope = Math.max(0, t.bond.hope - 15); } if (b) roles(s, b.id, t?.id ?? "", "torments her", "tormented by her");
              return { line: `You tell ${t?.name ?? "her"} that's how a household works and walk on. She stands in the corridor for a long time after you've gone.`, cool: -10 }; } },
          { id: "give", label: "Give her to the bully, properly", note: "make it official",
            run: ({ s, P, week }) => { const b = P("bully"), t = P("target"); if (!b || !t) return { line: "" };
              applyTreatmentLite(s, t, "cruelty", 8, `given to ${b.name} as her personal slave`, week); applyTreatmentLite(s, b, "recognition", 5, "given a slave of her own", week);
              t.bond.fear = Math.min(100, t.bond.fear + 15); roles(s, b.id, t.id, "owns her", "belongs to her");
              return { line: `You call ${b.name} up and tell her ${t.name} is hers now: her maid, her footstool, whatever she wants. ${b.name} smiles. ${t.name} doesn't make a sound.`, closes: true, cool: 70 }; } },
          { id: "turn", label: "Let the target have one night with the bully tied up", note: "turn it around",
            run: ({ s, P, week }) => { const b = P("bully"), t = P("target"); if (!b || !t) return { line: "" };
              applyTreatmentLite(s, t, "recognition", 6, `given a night with ${b.name} tied up`, week); applyTreatmentLite(s, b, "cruelty", 6, `given to ${t.name} for a night, tied up`, week);
              warm(s, b.id, t.id, -15); roles(s, t.id, b.id, "got even with her", "was paid back by her");
              return { line: `You have ${b.name} tied to the frame in the cellblock and give ${t.name} the key and the whole night. What ${t.name} does with it is her business. In the morning ${b.name} can't meet anyone's eye, and ${t.name} walks differently.`, closes: true, cool: 75 }; } },
        ],
      },
      { at: 92, line: (c) => `${c.who.target} has stopped fighting back against ${c.who.bully} at all.` },
    ],
    fallout: (c) => `${c.who.bully} torments ${c.who.target}, and nobody stopped it.`,
  },

];

export const THREAD_BY_KIND: Record<string, ThreadDef> =
  Object.fromEntries(THREADS.map((t) => [t.kind, t]));

/* helpers for the answers above; kept tiny so data stays data */
import { applyTreatment } from "../engine/obedience";
import { addRole, moveEdge } from "../engine/social";
function applyTreatmentLite(_s: SaveState, p: import("../engine/types").Person, kind: import("../engine/obedience").Treatment["kind"], size: number, why: string, week: number) { applyTreatment(p, { kind, size, why }, week); }
function roles(s: SaveState, a: string, b: string, ab: string, ba: string) { if (!a || !b) return; addRole(s.edges, a, b, ab); addRole(s.edges, b, a, ba); }
function warm(s: SaveState, a: string, b: string, n: number) { moveEdge(s.edges, a, b, { warmth: n }); moveEdge(s.edges, b, a, { warmth: n }); }
function idOf(id: string): number { let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
