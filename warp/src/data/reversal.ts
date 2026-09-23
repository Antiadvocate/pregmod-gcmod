/**
 * SUPPLICATIONISM — the plot chain.
 *
 * A seventy-two week spine, shaped like the original game's: fixed weeks, one shot each, and an
 * ending scored against what you accumulated without being told it was the test. What is being
 * accumulated here is not mercenaries. It is how much of your own standing you were willing to
 * spend in public, and what your household is actually carrying by the time somebody comes for it.
 *
 * The doctrine, stated plainly: you buy her, she owns you, both are on the register, and neither
 * cancels the other. You can still sell her. That is the part the trade cannot get past.
 *
 * WRITING RULES FOR EVERYTHING IN THIS FILE. Concrete nouns. Present tense. Second person. Say what
 * is in the room. No general statements about people, power, or society — nobody in this world
 * talks like an essay, and the moment one of them does the scene stops being a place. If a line
 * could be printed on a poster, cut it.
 */
import type { SaveState } from "../engine/types";
import type { Doctrine } from "./doctrines";

export interface ChainOption {
  id: string;
  label: string;
  note?: string;
}

export interface ChainEvent {
  id: string;
  /** Earliest week it can fire. It waits if the other gates are unmet, and fires once. */
  week: number;
  /** Minimum public deference before this is even offered. */
  needs_deference?: number;
  /** Needs somebody at this rung or past it. */
  needs_standing?: number;
  title: string;
  /** The prose. State-aware, because a scene that ignores who is in the room is a pamphlet. */
  text: (s: SaveState, her?: string) => string;
  options: ChainOption[];
}

/** The woman the chain is about: the one furthest up the ladder, or the one with the most standing
 *  to hold it. Chosen once per event so the chain follows a person rather than a slot. */
export const CHAIN: ChainEvent[] = [
  {
    id: "first_time",
    week: 3,
    title: "The first time",
    text: (_s, her = "she") => `It's late, and you and ${her} are the only ones still awake on this floor. You've wanted to try this for a while.

You don't explain. You get down on one knee in front of ${her} and wait.

${her} doesn't know what to do. Nobody has ever knelt to ${her} before, least of all the person who owns ${her}. ${her} reaches out a hand and stops halfway, unsure whether this is some kind of test.`,
    options: [
      { id: "hold", label: "Stay down until she says something", note: "however long it takes" },
      { id: "explain", label: "Tell her what you want", note: "easier for her, but it's your idea, not hers" },
      { id: "up", label: "Get up and never mention it", note: "she'll remember anyway" },
    ],
  },
  {
    id: "household_sees",
    week: 7,
    needs_deference: 5,
    title: "In front of the others",
    text: (s, her = "she") => `There are four people in the suite tonight, and three of them are pretending to be busy.

You've knelt to ${her} twice more since the first night, both times behind a closed door. Tonight the door is open. ${her} has noticed, and hasn't asked you to close it.

When you kneel, one of the other slaves drops something in the next room. Nobody comes to look. The walls in ${s.arcology.name}'s penthouse are thin, and everyone is going to know about this by morning.`,
    options: [
      { id: "louder", label: "Do it where they can all see", note: "your slaves will have opinions" },
      { id: "quiet", label: "Close the door", note: "keeps it private, but slows things down" },
      { id: "ask", label: "Ask her whether she wants them watching", note: "let her decide" },
    ],
  },
  {
    id: "the_name",
    week: 11,
    needs_deference: 15,
    title: "What she is called",
    text: (_s, her = "she") => `Your steward has been listing ${her} as "the girl in the east suite" on the household schedule for two months, because nobody told her what else to write.

You tell her. She writes it down without comment. The schedule gets printed every morning and posted in the servants' hall, where forty slaves read it over breakfast.

By ten o'clock two of them have asked ${her} whether it's a joke.`,
    options: [
      { id: "formal", label: "Put it on every document in the house", note: "the register, the schedule, the accounts" },
      { id: "verbal", label: "Keep it spoken, not written" },
      { id: "revert", label: "Tell the steward she made a mistake" },
    ],
  },
  {
    id: "first_outing",
    week: 15,
    needs_deference: 22,
    title: "The concourse",
    text: (s, her = "she") => `At shift change the concourse is packed with citizens who all know your face.

${her} walks in front. You walk half a step behind, carrying ${her} bag. A man outside the exchange stops talking mid-sentence. A woman at a fruit stall looks at ${her} collar, then at you carrying the bag, then quickly looks away.

Nobody says anything. They'll be talking about it all week.`,
    options: [
      { id: "slow", label: "Take the long way round", note: "let everyone get a good look" },
      { id: "brisk", label: "Get it over with" },
      { id: "abort", label: "Turn back at the elevators" },
    ],
  },
  {
    id: "broker_refuses",
    week: 19,
    needs_deference: 28,
    title: "A broker drops you",
    text: () => `Halvorsen has been your slave broker for two years. He's found you eleven slaves, some from places nobody else could reach, and he's never asked what you wanted any of them for.

This morning he sends a short message. His firm is "reviewing its client list," he won't be able to work with you any more, and he wishes you well. At the bottom: *Please don't use my name at the Cape.*

Word about your household has clearly got out, and he doesn't want to be associated with it.`,
    options: [
      { id: "pay", label: "Pay him to stay", note: "expensive, and it'll only last about a year" },
      { id: "replace", label: "Find a broker who doesn't care", note: "the shark's people never care" },
      { id: "public", label: "Publish his letter", note: "makes an enemy, and makes a point" },
    ],
  },
  {
    id: "the_dinner",
    week: 23,
    needs_deference: 34,
    title: "Dinner at Kestrel",
    text: (_s, her = "she") => `The invitation is for one. You bring ${her}.

Eiger, who owns Kestrel, is far too polite to make a scene, so he has ${her} seated. Over the soup he asks ${her} questions about your arcology's water supply, and ${her} answers them well. The whole table listens, and you can tell every guest there will be gossiping about it next week.

Eiger's wife never looks at you once. She stares at ${her} all evening.`,
    options: [
      { id: "serve", label: "Serve her plate yourself, at the table", note: "in front of everyone" },
      { id: "normal", label: "Behave like a normal guest" },
      { id: "leave", label: "Take her home early" },
    ],
  },
  {
    id: "first_fee",
    week: 27,
    needs_deference: 42,
    title: "Somebody offers to pay",
    text: (_s, her = "she") => `A man in his forties who owns two floors of the manufacturing ring has been waiting in your reception for eleven minutes, working up the nerve to ask.

He wants to spend an evening serving ${her}: fetching and carrying for ${her}, being told off by ${her}, and having people know he did it. The amount he's offering made your steward check it twice.

He's not the first person to want this. He's the first one rich enough to ask.`,
    options: [
      { id: "take", label: "Take the money", note: "a new source of income, and it'll change the arcology's economy" },
      { id: "free", label: "Let him, but refuse payment", note: "costs you money, earns something else" },
      { id: "refuse", label: "Throw him out" },
    ],
  },
  {
    id: "the_register",
    week: 32,
    needs_deference: 50,
    title: "The paperwork",
    text: (s, her = "she") => `The slave registry in ${s.arcology.name} has processed twelve thousand transfers of ownership, and never one that goes both ways at once.

The clerk reads your filing twice, then calls her supervisor. The two of them argue quietly at the counter about whether a document saying you own ${her} and ${her} owns you is invalid or just unusual.

They decide it's just unusual. They file it at 3:40 that afternoon and hand you a copy with both your names on it, printed the same size.`,
    options: [
      { id: "file", label: "File it", note: "you can still sell her; that's on the paper too" },
      { id: "onesided", label: "File only her ownership of you", note: "gives up your right to sell her" },
      { id: "withdraw", label: "Withdraw it" },
    ],
  },
  {
    id: "household_splits",
    week: 37,
    needs_deference: 58,
    title: "The household divides",
    text: (s, her = "she") => {
      const cast = Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);
      const asks = cast.filter((p) => p.name !== her).sort((a, b) => (b.romance?.dominion ?? -100) - (a.romance?.dominion ?? -100))[0];
      const dreads = cast.filter((p) => p.name !== her && p.id !== asks?.id)
        .sort((a, b) => (b.persona.fetishes?.find((f) => f.name === "submissive")?.strength ?? 0)
          - (a.persona.fetishes?.find((f) => f.name === "submissive")?.strength ?? 0))[0];
      const A = asks?.name ?? "one of your slaves";
      const B = dreads?.name ?? "another slave";
      const years = asks ? Math.max(1, Math.round(asks.economics.weeks_owned / 52)) : 4;

      return `${A} and ${B} come to see you together.

${A} does the talking. She wants what ${her} has, and she's clearly practiced her speech about how good she'd be at it.

${B} stands behind her and says nothing. She wants the opposite: she's spent ${years === 1 ? "most of a year" : `${years} years`} learning to be a good slave, she likes it, and the idea of being put in charge frightens her. She only came along because refusing would have looked bad.`;
    },
    options: [
      { id: "both", label: "Give each of them what she asked for", note: "one gets power, the other stays a slave" },
      { id: "level", label: "Raise them both the same", note: "fair, but one of them won't cope with it" },
      { id: "hold", label: "Neither, for now", note: "they'll both take that as an answer" },
    ],
  },
  {
    id: "censure",
    week: 42,
    needs_deference: 64,
    title: "The Owners' Association writes to you",
    text: (s) => `It's a one-page letter on the Association's letterhead, signed by nine arcology owners who have all eaten at your table.

It doesn't accuse you of anything. It expresses "concern" about "reports of arrangements within your household," reminds you that the Free Cities depend on "the clarity of certain relations," and invites you to explain yourself at the spring session.

It never actually says "degenerate," but that's what it means. These nine people built your standing in ${s.arcology.name}, and they can tear it down within a year or two.`,
    options: [
      { id: "attend", label: "Attend and defend yourself", note: "costs standing now, earns legitimacy later" },
      { id: "ignore", label: "Don't reply" },
      { id: "recant", label: "Give them what they want", note: "undoes everything" },
    ],
  },
  {
    id: "waiting_list",
    week: 47,
    needs_deference: 70,
    title: "There's a waiting list",
    text: (s) => `Your steward tells you there's now a waiting list of people who want to pay to serve in your household.

There are thirty-one names on it. Eleven are from outside ${s.arcology.name}, and two are members of the Owners' Association.

The price has tripled since that first manufacturer and it's still oversubscribed. Rich people are paying for the chance to be humiliated in front of witnesses and still be respectable in the morning, and yours is the only place for hundreds of miles that offers it.`,
    options: [
      { id: "raise", label: "Raise the price until demand drops", note: "it won't" },
      { id: "vet", label: "Check everyone on the list yourself", note: "slower and safer, and the clients appreciate it" },
      { id: "open", label: "Open it to anyone who can pay" },
    ],
  },
  {
    id: "abuse",
    week: 52,
    needs_deference: 74,
    title: "Someone goes too far",
    text: (_s, her = "one of them") => `You find out from the clinic, not from anyone who was there.

A paying guest was hurt on Tuesday: not badly, not permanently, and not by accident. He's not going to complain, because a complaint would mean admitting what he was doing there.

The clinic's report names ${her}. You could have guessed who it would be.`,
    options: [
      { id: "cover", label: "Make it go away", note: "costs money, stays quiet" },
      { id: "confront", label: "Take it up with her", note: "she has real power now, and that's the problem" },
      { id: "strip", label: "Take her power away", note: "in front of the whole household" },
    ],
  },
  {
    id: "embargo",
    week: 58,
    needs_deference: 78,
    title: "The port slows down",
    text: (s) => `Nobody announces anything. Everything just takes longer.

Two shipments of medical supplies sit at the Cape for eleven days over a paperwork problem nobody can explain. Your bank asks for "additional assurances" on your construction loans. A supplier who has delivered every Thursday for three years starts delivering on Fridays, apologizes, and won't say why.

None of it is illegal. The other arcologies are showing ${s.arcology.name} what it'll cost to keep going like this.`,
    options: [
      { id: "absorb", label: "Pay the extra costs and carry on", note: "expensive every week" },
      { id: "allies", label: "Find arcologies that want in", note: "there are more than you'd think" },
      { id: "fold", label: "Promise to tone it down" },
    ],
  },
  {
    id: "the_offer",
    week: 64,
    needs_deference: 82,
    title: "They offer to buy you out",
    text: (s, her = "she") => `Eiger comes in person, which is both a courtesy and a threat.

He offers more than ${s.arcology.name} is worth, and you both know it. The extra is what the Association will pay to have your arrangement undone. The condition is simple: the ownership papers are voided and your household is broken up.

He asks after ${her} by name, politely, and waits for your answer.`,
    options: [
      { id: "refuse", label: "Refuse", note: "and expect what comes next" },
      { id: "sell", label: "Take it", note: "ends the story; your household is broken up" },
      { id: "counter", label: "Offer him a place on the waiting list", note: "he came a long way to ask about her" },
    ],
  },
  {
    id: "the_move",
    week: 69,
    needs_deference: 85,
    title: "They come for it",
    text: (s) => `Last month it was paperwork. Last week the Association held a vote and nobody told you the result. Yesterday your security chief caught two men on the freight level with no business there and fake papers. This morning the elevators to the residential ring stopped working, and the concourse cameras are going dark one floor at a time.

Nobody is going to storm ${s.arcology.name}. They're going to take it over the usual way: by getting enough of the right people inside it to switch sides at once.

What matters now is who in your arcology is loyal to you.`,
    options: [
      { id: "stand", label: "Hold the arcology", note: "depends on your slaves' loyalty, not your guns" },
      { id: "her", label: "Put her out in front", note: "show the arcology who runs it" },
      { id: "run", label: "Escape with what you can carry" },
    ],
  },
];

export const SUPPLICATIONISM: Doctrine = {
  id: "supplication",
  noun: "Supplicationism",
  adj: "Supplicationist",
  creed: "Owners should serve their slaves, and slaves can own their owners.",
  wants: { quality: 0.8, intelligence: 0.7, age: 0.3 },
  excludes: ["degradationist", "supremacist", "subjugationist"],
  rep: 30, cash: -1400, research: 16000,
  earned: "Can't be adopted by decree. It spreads as the arcology sees you living it.",
  look: "no raised seating anywhere, and the best rooms given to former servants",
  policies: [
    { id: "service_fees", name: "Service arrangements", note: "citizens pay to serve your slaves; there's a waiting list", cost: 10000 },
    { id: "dual_title", name: "Dual ownership", note: "you and your slave legally own each other", cost: 6000 },
  ],
};

export const SUPPLICATION_ID = SUPPLICATIONISM.id;
