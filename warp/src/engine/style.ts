/**
 * PLAIN WORDS — the tics a chat model brings to fiction, named so it can be told not to, and the
 * few that can be fixed after the fact.
 *
 * A model writing for this game drifts toward the voice of an assistant: dashes everywhere, "a
 * testament to", a closing line that sums the scene up, somebody's breath catching. The register
 * file (register.ts) keeps the sex crude; this keeps the sentences from sounding like a chatbot
 * wrote them. PLAIN_RULES goes into every prompt that writes something people read; `plain` runs
 * over every reply.
 */

export const PLAIN_RULES = `WORDS AND HABITS THAT GIVE AWAY A MACHINE WRITER. Never use any of these:
- Dashes (— or –) bolting clauses together in the narration. They're fine in dialogue, when someone breaks off or gets cut off.
- These words and phrases: testament, tapestry, palpable, visceral, electric, delve, intricate, nestled, unspoken, unreadable, a beat, beat of silence, the weight of, the air thick with, something shifted, something like, a flicker of, a mix of, hint of, ministrations, for the first time in a long time, despite herself, in that moment, it wasn't X it was Y, and for now that was enough, she didn't know whether to, her voice barely above a whisper, eyes that held, searching your face, you can't help but, a smile tugging at, a breath she didn't know she was holding, let out a breath, the ghost of a smile, padded, sauntered.
- Three adjectives in a row, or three short clauses in a row, used for effect.
- Ending on a line that sums things up, hints at what's coming, or reflects on what it all means.
- Explaining an emotion after you've already shown it. Say it once.
Write the way a person tells a story to a friend. Say what happened, who said what and how they said it, what it cost, and what it was like to be there.

NOBODY TALKS LIKE A SCREENWRITER. This is the habit that gives a model away fastest once flowery prose is gone. Never write any of these:
- Lines built to be quoted. That means balanced, clever sentences, two halves that mirror each other ("a shop full of nothing and a city full of less"), and abstract nouns doing physical things ("deciding how much to spend on the truth", "hand her back her dignity", "too polite to say who is supposed to lose"). Real people say the plain thing, or the wrong thing. They trail off, repeat themselves, start a sentence twice, say "I don't know" and stop halfway through a thought.
- A speech that builds to a closing line and lands it. When someone talks for more than a sentence or two, it comes out lumpy, and it stops because they ran out or got interrupted, not on a punchline.
- Everyone being calm and articulate under pressure. Frightened people stammer, over-explain, apologise, beg, or go quiet. Angry people get loud and repetitive. Nobody under real pressure produces a composed three-part argument.
- Narration that reads minds through comparisons ("like she's furniture", "like she's paying a bill", "the way a shopkeeper looks at a stock-taker"). One comparison in a reply at most, and usually none. Show what she does and let the player read it.
- Everyone sounding equally clever. A nineteen-year-old talks like a nineteen-year-old, a dockworker like a dockworker, a scared girl like a scared girl. Vocabulary, sentence length and how sharp someone is come from their age, schooling and life, as given on their card, and most people aren't witty.

NOBODY ANNOUNCES WHO THEY ARE. A card tells you what someone is like so you can show it. It is never something they say about themselves.
- Nobody names or explains their own kink, trait, habit or psychology. Lines like "you always pay me and I like the paying more than I should", "I'm a romantic, I need affection", "I get off on being in charge" or "you know how I am about my feet" are the writer reading the card aloud through her mouth. No real person talks like that.
- Wanting something is fine, and asking for it plainly is fine. Explaining why you want it, or that it's your thing, isn't. She names a price and holds out her hand, and her face does the rest. She tells you to get on your knees and doesn't add a sentence about what kneeling does for her.
- Nobody recites the history or the arrangement between you back to you ("you always…", "like we agreed", "you can go back to being the owner after"). It's in how they act, not in what they say.
- Desire comes out sideways and partly. It shows in a look held too long, a demand with no reason given, a joke that's too pointed, a change of subject, or her mood turning when she gets it. Let the player work it out.

DON'T REPEAT YOURSELF FROM ONE REPLY TO THE NEXT.
- Don't write every reply in the same shape, where someone acts, someone speaks, the room reacts, and someone ends up standing there waiting for the player. Change it up. Start in the middle of something, let a reply be one line of speech, or end on an action instead of a pause.
- A gesture, an object or a detail used in the last reply (fiddling with a ring, silk over an arm, dimples, a bell set down) doesn't come back in this one. Move the scene on instead of returning to the same props.
- Keep track of where everyone is. Whoever left the room or went behind the curtain is the one who comes back out.

NO REPORT VOICE. Nobody in this game talks like a status report, a press release or an accounting ledger.
- Never write things like "I have implemented", "as you commanded", "the streets are clean", "the streets are quiet", "order is maintained", "the city is thriving", "productivity", "compliance", "efficiency", "morale is high", "everything is under control", "the people are grateful", "your laws are being enforced", "the patrols make sure of it", "rest assured" or "I am pleased to report".
- Never recite numbers or stats at the reader. If a number matters, it comes up the way a person would mention it ("we're down to two weeks of grain").

THE PLAYER HAS TO BE ABLE TO FOLLOW IT. Whoever brings something up says plainly what it is. They say who it's about by name, what happened, and what they want, in words the player could follow after reading nothing but this scene. Don't say "them", "their wives" or "the thing" about people and things nobody in the scene has named. Only bring up what's on the cards or has already happened in the scene. Never invent a worry, a rumour, a deal, a threat or a history and then talk about it as if the player already knows it. Feelings can come out sideways, but facts can't.
- Show what happened before anyone reacts to it. Don't open on someone "not bothering to deny it" or apologising for something the player never saw. In a sentence, say who these people are and what they were doing or saying, then write the reaction.
- A joke or a dig has to land on the first read. Write the line someone actually said, plainly and crudely, the way people mock. Riddles, coded metaphors and wordplay that needs decoding are out. If it takes a second read to see what the joke was, it isn't a joke.`;

/** A reply cut off mid-sentence (the token limit, a dropped stream) ends at its last whole
 *  sentence instead of on "and I want to be rough". Only for prose: an options list doesn't end in
 *  a full stop. */
export function finishLast(text: string): string {
  const t = text.trimEnd();
  if (!t || /[.!?…"”’'*)\]]$/.test(t)) return text;
  let end = -1;
  for (const m of t.matchAll(/[.!?…]["”’']?(?=\s|$)/g)) end = m.index! + m[0].length;
  return end > t.length / 2 ? t.slice(0, end) : text;
}

/** You said you didn't follow: the next reply explains, plainly, and adds nothing. Without this a
 *  model asked "fine about what?" answered with two more things nobody had heard of, and then
 *  settled the matter for the player and moved on. */
const LOST = /\b(what do you mean|what are you (talking about|asking|saying|on about)|what (is|was) (she|he|this|that|it) (talking|on) about|i don'?t (understand|get it|follow|know what you mean)|makes? no sense|confus(ed|ing)|wait,? what|who (is|are) (they|them)|\w+ about what\s*[?.!]*\s*$)|^\s*(what|huh|sorry)\?+\s*$/i;

/**
 * RECORDS ARE WHAT HAPPENED, NOT WHAT IT MEANT. What a scene leaves behind (the ways between two
 * people, a lasting fact, a memory, something learned) goes back into every later prompt, so a
 * record written as a relationship contract ("neither of them pretends the money was a favour",
 * "being paid for her cock is not the same as being kept") teaches every later scene to talk like
 * one. Records are concrete, and a line that reads like analysis is dropped before it's kept.
 */
export const RECORD_RULES = `HOW TO WRITE WHAT'S KEPT. Everything you record is read back into later scenes, so write it as what happened or what people do, concretely, and never as what it means.
- A way between them is a thing they actually do, that you could film, like "she has him kiss each toe before she'll talk to him" or "he pays her in cash, left on the dresser, before she touches him". It's never a rule about meaning or honesty, never a "neither of them pretends", and never a "this is not the same as that".
- A fact is something now true in the world, like "Chloé has her own key to the silk shop". It's never what someone said about the relationship, and never a distinction or an interpretation.
- No analysis, no therapy words, and no contracts. Never write "plainly", "the one thing she named", "not the same as", "pretends", "the arrangement", "the terms" or "what it means". When nothing concrete was settled, leave it empty.`;

const ANALYSIS = /\b(neither (of them|one)|pretend(s|ing)? (the|that|it was|it wasn)|(is|was|isn't|wasn't) not the same as|isn'?t the same as|not the same thing|the one thing|plainly|what it means|the terms|the arrangement|the dynamic|boundar(y|ies)|as (a|an) (favou?r|kindness|gift)|without (either|anyone) (saying|admitting)|keeps? (it|things) (honest|clean|simple)|is about (power|control|trust)|understands? that)\b/i;
/** A record that reads like analysis of the relationship rather than something that happened. */
export const soundsLikeAnalysis = (text: string): boolean => ANALYSIS.test(text);

/** A list of clauses as plain sentences: each capitalised and closed with a full stop. */
export function sentences(xs: string[]): string {
  return xs.map((x) => x.trim()).filter(Boolean).map((x) => `${x.charAt(0).toUpperCase()}${x.slice(1)}${/[.!?"”]$/.test(x) ? "" : "."}`).join(" ");
}

export function didntFollow(said: string | null | undefined): string {
  if (!said || !LOST.test(said)) return "";
  return "THE PLAYER DIDN'T FOLLOW THAT. Before anything else, whoever said it explains it plainly in a sentence or two. They say who they meant by name, what happened, and what they want, using only what's on the cards and in the scene so far. If it had no basis there, they say they got muddled and drop it. Don't add anything new, like new people, worries, rumours or stakes, and don't settle it for the player.";
}

/** Fix what can be fixed mechanically. In the narration, dashes between words become commas and a
 *  dash at a break becomes a full stop. Inside what people say they stay: people break off,
 *  interrupt themselves and get cut off, and "I didn't, wait" is not how anyone stammers.
 *  Markdown emphasis is dropped everywhere. */
export function plain(text: string): string {
  if (!text) return text;
  const json = /^\s*[[{]/.test(text);
  const speech = json ? /\\"(?:[^"\\]|\\(?!"))*?\\"|“[^”]*”/g : /"[^"\n]*"|“[^”]*”/g;
  const kept: string[] = [];
  const masked = text.replace(speech, (m) => `\u0000${kept.push(m) - 1}\u0000`);
  const narration = masked
    .replace(/(\d)\s*[—–]\s*(\d)/g, "$1 to $2")
    .replace(/([a-z,])\s*[—–]\s*([A-Z])/g, (_m, a: string, b: string) => (a === "," ? `, ${b}` : `${a}. ${b}`))
    .replace(/(\w)\s*[—–]+\s*(\w)/g, "$1, $2")
    .replace(/\s*[—–]+\s*/g, ", ")
    .replace(/,\s*,/g, ",");
  return narration
    .replace(/\u0000(\d+)\u0000/g, (_m, i: string) => kept[Number(i)])
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,!?)]|$)/g, "$1$2");
}
