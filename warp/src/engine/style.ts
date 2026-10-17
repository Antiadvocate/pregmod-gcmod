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
- Dashes of any kind (— or –) to join or interrupt sentences. Use a full stop or a comma.
- These words and phrases: testament, tapestry, palpable, visceral, electric, delve, intricate, nestled, unspoken, unreadable, a beat, beat of silence, the weight of, the air thick with, something shifted, something like, a flicker of, a mix of, hint of, ministrations, for the first time in a long time, despite herself, in that moment, it wasn't X it was Y, and for now that was enough, she didn't know whether to, her voice barely above a whisper, eyes that held, searching your face, you can't help but, a smile tugging at, a breath she didn't know she was holding, let out a breath, the ghost of a smile, padded, sauntered.
- Lists of three adjectives or three short clauses in a row for effect.
- Ending on a line that sums up, foreshadows, or reflects on what it all means.
- Explaining the emotion after showing it. Say it once.
Write the way a person tells a story to a friend: what happened, who said what, what it cost.

NO REPORT VOICE. Nobody in this game talks like a status report, a press release or an accounting ledger.
- Never: "I have implemented", "as you commanded", "the streets are clean/quiet/safe", "order is maintained", "the city is thriving/prospering", "productivity", "compliance", "efficiency", "morale is high", "everything is under control", "the people are grateful", "your laws are being enforced", "the patrols make sure of it", "rest assured", "I am pleased to report".
- Never recite numbers or stats at the reader. If a number matters, it comes up the way a person would mention it ("we're down to two weeks of grain").
- Say something specific instead: a named person, a place, a thing somebody did or said, what it led to, what it looks like now. One real incident beats a summary of ten.
THE TEST: would someone who loves building this world want to read it? If a line only confirms that things are fine, or could be said about any city and any week, cut it and write the incident instead.`;

/** Fix what can be fixed mechanically. Dashes between words become commas; a dash before a
 *  closing quote or at a break becomes a full stop. Markdown emphasis is dropped. */
export function plain(text: string): string {
  if (!text) return text;
  return text
    .replace(/(\d)\s*[—–]\s*(\d)/g, "$1 to $2")
    .replace(/\s*[—–]\s*(?=["”'’])/g, ".")
    .replace(/([a-z,])\s*[—–]\s*([A-Z])/g, (_m, a: string, b: string) => (a === "," ? `, ${b}` : `${a}. ${b}`))
    .replace(/(\w)\s*[—–]+\s*(\w)/g, "$1, $2")
    .replace(/\s*[—–]+\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,!?)]|$)/g, "$1$2");
}
