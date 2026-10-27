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

export const PLAIN_RULES = `WORDS AND HABITS THAT GIVE AWAY A MACHINE WRITER. Never use these:
- Dashes (— or –) bolting clauses together in the narration. In dialogue they're fine, for someone breaking off or getting cut off.
- These words and phrases: testament, tapestry, palpable, visceral, electric, delve, intricate, nestled, unspoken, unreadable, a beat, beat of silence, the weight of, the air thick with, something shifted, something like, a flicker of, a mix of, hint of, ministrations, for the first time in a long time, despite herself, in that moment, it wasn't X it was Y, and for now that was enough, she didn't know whether to, her voice barely above a whisper, eyes that held, searching your face, you can't help but, a smile tugging at, a breath she didn't know she was holding, let out a breath, the ghost of a smile, padded, sauntered.
- Lists of three adjectives or three short clauses in a row for effect.
- Ending on a line that sums up, foreshadows, or reflects on what it all means.
- Explaining the emotion after showing it. Say it once.
Write the way a person tells a story to a friend: what happened, who said what and how they said it, what it cost, and what it was like to be there.

NO REPORT VOICE. Nobody in this game talks like a status report, a press release or an accounting ledger.
- Never: "I have implemented", "as you commanded", "the streets are clean/quiet/safe", "order is maintained", "the city is thriving/prospering", "productivity", "compliance", "efficiency", "morale is high", "everything is under control", "the people are grateful", "your laws are being enforced", "the patrols make sure of it", "rest assured", "I am pleased to report".
- Never recite numbers or stats at the reader. If a number matters, it comes up the way a person would mention it ("we're down to two weeks of grain").

THE PLAYER HAS TO BE ABLE TO FOLLOW IT. Whoever brings something up says plainly what it is: who (by name), what happened, and what they want, in words the player can follow having read nothing but this scene. No "them", "their wives" or "the thing" for people and things nobody in the scene has named. Only bring up what's on the cards or has already happened in the scene: never invent a worry, a rumour, a deal, a threat or a history and talk about it as if the player already knows it. Feelings can come out sideways; facts don't.`;

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

export function didntFollow(said: string | null | undefined): string {
  if (!said || !LOST.test(said)) return "";
  return "THE PLAYER DIDN'T FOLLOW THAT. Before anything else, whoever said it explains it plainly, in a sentence or two: who they meant, by name, what happened, and what they want, using only what's on the cards and in the scene so far. If it had no basis there, they say they got muddled and drop it. Add nothing new (no new people, worries, rumours or stakes), and don't settle it for the player.";
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
