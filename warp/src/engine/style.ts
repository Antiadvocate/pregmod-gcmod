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
- Never recite numbers or stats at the reader. If a number matters, it comes up the way a person would mention it ("we're down to two weeks of grain").`;

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
