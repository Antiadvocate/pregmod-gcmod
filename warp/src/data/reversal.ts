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
    text: (_s, her = "she") => `It is late and the floor is cold and you are the only two people awake on this level. You have been turning it over for a week — not the idea, you have had the idea for longer than that, but the mechanics of it. How you would start. Whether you would have to explain.

You do not explain. You go down onto one knee in front of ${her} and you wait.

${her} does not move for a long moment. Then ${her} hand comes out, uncertain, and stops halfway, because there is no version of this ${her} has been trained for and nothing about the last few years has prepared ${her} for a man on the floor in front of ${her} who is not doing it to make a point.`,
    options: [
      { id: "hold", label: "Stay down until she says something", note: "however long that takes" },
      { id: "explain", label: "Tell her what you want", note: "safer, and it makes it your idea rather than hers" },
      { id: "up", label: "Get up and never mention it", note: "she will remember anyway" },
    ],
  },
  {
    id: "household_sees",
    week: 7,
    needs_deference: 5,
    title: "In front of the others",
    text: (s, her = "she") => `The suite has four people in it and three of them are pretending to be busy.

You have done this twice more since the first night, both times with the door shut. Tonight the door is open, and ${her} knows it is open, and ${her} has not said anything about it, which is its own kind of decision.

When you kneel, one of the others drops something in the next room. Nobody comes to see what the noise was. In ${s.arcology.name} the walls are thin in the way that expensive walls are thin — they carry sound perfectly and everybody has agreed to pretend otherwise.`,
    options: [
      { id: "louder", label: "Do it where they can all see", note: "the household will have opinions and you will hear them" },
      { id: "quiet", label: "Close the door", note: "keeps it yours; costs you the ground" },
      { id: "ask", label: "Ask her whether she wants them watching", note: "hands her the decision" },
    ],
  },
  {
    id: "the_name",
    week: 11,
    needs_deference: 15,
    title: "What she is called",
    text: (_s, her = "she") => `Your steward has been writing "the girl in the east suite" on the household schedule for two months because nobody has told her what else to write.

You tell her. It takes four words and the steward writes them down without any change in her face at all, and then goes back to the rota, and that is the whole of it — except that the schedule is printed every morning and put up in the servants' hall, where forty people read it over breakfast.

By ten o'clock two of them have asked ${her} whether it is a joke.`,
    options: [
      { id: "formal", label: "Put it on every document in the house", note: "the register, the rota, the accounts" },
      { id: "verbal", label: "Leave it spoken, not written" },
      { id: "revert", label: "Tell the steward she made a mistake" },
    ],
  },
  {
    id: "first_outing",
    week: 15,
    needs_deference: 22,
    title: "The concourse",
    text: (s, her = "she") => `The commercial level at shift change is four hundred people who all know your face.

${her} walks. You walk half a pace behind ${her} carrying the bag, which is not heavy and is not the point. A man outside the exchange stops mid-sentence. A woman at the fruit stall looks at ${her} collar, then at your hands, then away, fast, the way people look away from something they intend to describe accurately later.

Nobody says anything. In ${s.arcology.name} nobody ever says anything the first time.`,
    options: [
      { id: "slow", label: "Take the long way round", note: "let everyone get a look" },
      { id: "brisk", label: "Get it over with" },
      { id: "abort", label: "Turn back at the lifts" },
    ],
  },
  {
    id: "broker_refuses",
    week: 19,
    needs_deference: 28,
    title: "A broker declines your business",
    text: () => `The message is four lines long and does not use the word.

Halvorsen has handled your acquisitions for two years. He has sourced you eleven women, three of them from places he should not have been able to reach, and he has never once asked what any of them were for. This morning he writes that his firm is reviewing its client list and that he does not expect to be able to continue, and that he wishes you every success.

The last line is what tells you it got out: *Please do not use my name at the Cape.*`,
    options: [
      { id: "pay", label: "Buy him back", note: "expensive, and it works for about a year" },
      { id: "replace", label: "Find somebody who does not care", note: "the shark's people never care" },
      { id: "public", label: "Publish the letter", note: "makes an enemy and a point at the same time" },
    ],
  },
  {
    id: "the_dinner",
    week: 23,
    needs_deference: 34,
    title: "Dinner at Kestrel",
    text: (_s, her = "she") => `The invitation is for one. You bring two.

Eiger runs Kestrel the way his father ran a shipping line, which is to say with enormous courtesy and no give at all. He seats ${her} because not seating ${her} would be a scene, and then he spends the soup course asking ${her} careful questions about the arcology's water table, and ${her} answers them, and the table listens, and somewhere between the fish and the meat you can watch four separate people decide what they are going to say about this at their own tables next week.

Eiger's wife does not look at you once. Eiger's wife looks at ${her} the entire evening.`,
    options: [
      { id: "serve", label: "Serve her plate yourself, at the table", note: "in front of all of them" },
      { id: "normal", label: "Behave like a guest" },
      { id: "leave", label: "Take her home early" },
    ],
  },
  {
    id: "first_fee",
    week: 27,
    needs_deference: 42,
    title: "Somebody offers to pay",
    text: (_s, her = "she") => `He is forty-something, he owns two floors of the manufacturing ring, and he has been standing in your reception for eleven minutes working up to it.

What he wants is an evening. Not with ${her} — under ${her}. He wants to fetch and carry and be told he has done it badly, and he wants to do it somewhere that people will know he did it, and he is offering a figure that made your steward read it twice before bringing it up.

He is not the first person to think of this. He is the first one rich enough to say it out loud.`,
    options: [
      { id: "take", label: "Take the money", note: "opens the ledger line; the whole economy tilts" },
      { id: "free", label: "Let him, and refuse the fee", note: "costs money, buys something else" },
      { id: "refuse", label: "Put him out" },
    ],
  },
  {
    id: "the_register",
    week: 32,
    needs_deference: 50,
    title: "The instrument",
    text: (s, her = "she") => `The registrar's office in ${s.arcology.name} has processed twelve thousand transfers of title and has never processed one in both directions at once.

The clerk reads it twice. Then she calls her supervisor, who reads it twice, and the two of them stand at the counter having a very quiet argument about whether an instrument that says you own ${her} and ${her} owns you is void for contradiction or simply unusual.

It is unusual. They file it at 3:40 in the afternoon and give you a copy on the heavy paper they use for property, and the copy has both names on it, in the same size type.`,
    options: [
      { id: "file", label: "File it", note: "you can still sell her; that is also on the paper" },
      { id: "onesided", label: "File only her title over you", note: "gives up the thing you could still do to her" },
      { id: "withdraw", label: "Withdraw it" },
    ],
  },
  {
    id: "household_splits",
    week: 37,
    needs_deference: 58,
    title: "The household divides",
    text: (s, her = "she") => {
      // Both women are real people out of the household rather than two slots: the one who wants
      // it is whoever is furthest up already, and the one who does not is the most submissive
      // woman in the building. The chain has spent forty weeks establishing that handing power to
      // the second kind is a cruelty, and this is where it stops being an abstraction.
      const cast = Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);
      const asks = cast.filter((p) => p.name !== her).sort((a, b) => (b.romance?.dominion ?? -100) - (a.romance?.dominion ?? -100))[0];
      const dreads = cast.filter((p) => p.name !== her && p.id !== asks?.id)
        .sort((a, b) => (b.persona.fetishes?.find((f) => f.name === "submissive")?.strength ?? 0)
          - (a.persona.fetishes?.find((f) => f.name === "submissive")?.strength ?? 0))[0];
      const A = asks?.name ?? "the one doing the speaking";
      const B = dreads?.name ?? "the one standing behind her";
      const years = asks ? Math.max(1, Math.round(asks.economics.weeks_owned / 52)) : 4;

      return `${A} and ${B} come to you together, which is how you know they have been talking.

${A} does the speaking. She wants what ${her} has. She has thought about it, she has a specific arrangement in mind, and she has clearly rehearsed the sentence about how she would be very good at it — you can hear the rehearsal in it, which is not the same as it being untrue.

${B} stands behind her and says nothing, because ${B} wants the opposite, badly, and cannot say so with ${A} in the room. She has spent ${years === 1 ? "the better part of a year" : `${years} years`} learning exactly how to be what she is, and you are proposing to take the floor out from under that. No part of her wants to be handed anything. She came along because not coming along would have been a statement.`;
    },
    options: [
      { id: "both", label: "Give them each what they actually asked for", note: "one gets standing, the other gets left exactly as she is" },
      { id: "level", label: "Raise them both the same", note: "fair, and one of them will not survive it well" },
      { id: "hold", label: "Neither, for now", note: "they will both read that as an answer" },
    ],
  },
  {
    id: "censure",
    week: 42,
    needs_deference: 64,
    title: "The Owners' Association writes to you",
    text: (s) => `It is one page, on their letterhead, and it is signed by nine people who have all eaten at your table.

They are not accusing you of anything. They note with concern the reports concerning arrangements within your household. They observe that the confidence of the Free Cities rests on the clarity of certain relations. They invite you to attend the spring session and offer any clarification you feel would assist.

The word "degeneracy" does not appear anywhere in it. It does not need to. Your standing in ${s.arcology.name} was built by these nine people and it can be unbuilt by the same nine over about eighteen months.`,
    options: [
      { id: "attend", label: "Attend and defend it", note: "costs standing now, buys legitimacy later" },
      { id: "ignore", label: "Do not reply" },
      { id: "recant", label: "Give them what they want", note: "rolls the whole thing back" },
    ],
  },
  {
    id: "waiting_list",
    week: 47,
    needs_deference: 70,
    title: "There is a waiting list",
    text: (s) => `Your steward brings it up the way she brings up anything she has already solved: as a problem you should know about rather than one you should fix.

There are thirty-one names. Eleven of them are from outside ${s.arcology.name}. Two are from the Association's own membership, which she mentions last and without comment.

The going rate has tripled since the manufacturing man and it is still oversubscribed, because the thing being sold is not an evening. It is the only place within four hundred miles where a certain kind of very rich person can be nobody for a night, in front of witnesses, and have it be respectable in the morning.`,
    options: [
      { id: "raise", label: "Raise the price until it stops selling", note: "it will not stop selling" },
      { id: "vet", label: "Vet the list yourself", note: "slower, safer, and they notice the care" },
      { id: "open", label: "Open it to anyone who can pay" },
    ],
  },
  {
    id: "abuse",
    week: 52,
    needs_deference: 74,
    title: "Somebody uses it",
    text: (_s, her = "one of them") => `The complaint reaches you through the clinic rather than through anybody's mouth.

A guest was hurt on Tuesday. Not badly, not permanently, and not accidentally. He paid for an evening and got considerably more of one than the schedule described, and he has not made a formal complaint, because making a formal complaint would mean writing down what he was doing there.

The clinic's note names ${her}. You already knew which name it would be, if you had ever once looked at the panel.`,
    options: [
      { id: "cover", label: "Make it go away", note: "money, and it stays quiet" },
      { id: "confront", label: "Take it up with her", note: "she has power now; that is the whole problem" },
      { id: "strip", label: "Take her standing away", note: "in front of the household" },
    ],
  },
  {
    id: "embargo",
    week: 58,
    needs_deference: 78,
    title: "The port slows down",
    text: (s) => `Nothing is announced. Things simply take longer.

Two shipments of medical stock sit at the Cape for eleven days on a documentation query that nobody can explain. The bank that has carried your construction paper since the beginning requires additional assurances. A supplier who has delivered every Thursday for three years now delivers on Fridays, and apologises, and does not say why.

None of it is illegal and none of it is deniable. ${s.arcology.name} is being shown what it would cost to go on like this.`,
    options: [
      { id: "absorb", label: "Pay the difference and keep going", note: "expensive every week" },
      { id: "allies", label: "Go and find people who want in", note: "there are more than you think" },
      { id: "fold", label: "Send word that you will moderate" },
    ],
  },
  {
    id: "the_offer",
    week: 64,
    needs_deference: 82,
    title: "They offer to buy you out",
    text: (s, her = "she") => `Eiger comes himself, which is the courtesy and also the threat.

The number is real. It is more than ${s.arcology.name} is worth on any honest valuation and they both know it, and the difference is what they are willing to pay to have the arrangement undone rather than merely stopped. The condition is one line: the instruments are void and the household is dispersed.

He asks after ${her} by name, politely, and waits for you to correct the register.`,
    options: [
      { id: "refuse", label: "Refuse", note: "and know what comes next" },
      { id: "sell", label: "Take it", note: "ends the story; everyone is dispersed" },
      { id: "counter", label: "Offer him a place on the list", note: "he came a long way to ask about her" },
    ],
  },
  {
    id: "the_move",
    week: 69,
    needs_deference: 85,
    title: "They come for it",
    text: (s) => `Last month it was paperwork. Last week the Association voted, and nobody told you the result. Yesterday your security chief found two men on the freight level with no reason to be there and no papers worth reading. This morning the lifts to the residential ring stop answering, and the feeds from the concourse go dark one floor at a time.

It is not an army. ${s.arcology.name} is not going to be stormed. It is going to be taken back the way arcologies are actually taken — by enough of the right people deciding at the same time that the current arrangement is over.

The question is who, inside this building, agrees with them.`,
    options: [
      { id: "stand", label: "Hold the building", note: "scored on your household, not your guns" },
      { id: "her", label: "Put her in front of it", note: "let the arcology see whose it is" },
      { id: "run", label: "Get out with what you can" },
    ],
  },
];

/** The doctrine record, in the same shape as every other one, so the society pass reads it.
 *  doctrines.ts pulls this into DOCTRINES; the import there is one-way, and the type import
 *  back the other way is erased, so there is no cycle at runtime. */
export const SUPPLICATIONISM: Doctrine = {
  id: "supplication",
  noun: "Supplicationism",
  adj: "Supplicationist",
  creed: "You bought her. She owns you. Both are on the register and neither cancels the other.",
  // It wants women who can carry the thing: grown, educated, and not wrecked. It is indifferent to
  // bodies, which is the part that offends the trade more than any of the rest of it.
  wants: { quality: 0.8, intelligence: 0.7, age: 0.3 },
  excludes: ["degradationist", "supremacist", "subjugationist"],
  rep: 30, cash: -1400, research: 16000,
  earned: "Not something you announce. It is adopted at the rate the arcology has actually watched you live.",
  look: "no dais anywhere, seating at one height, and the good rooms given over to people who used to clean them",
  policies: [
    { id: "service_fees", name: "Service arrangements", note: "citizens pay for the privilege of serving; the list is longer than the places", cost: 10000 },
    { id: "dual_title", name: "Dual instruments", note: "both names on the register, in the same size type", cost: 6000 },
  ],
};

export const SUPPLICATION_ID = SUPPLICATIONISM.id;
