/**
 * WHEN HE SAYS KILL.
 *
 * Models don't like writing killings. Told plainly that the owner's people carry out his orders,
 * one still wrote "execute the cook" as an arrest, then as guards asking what he meant, then as
 * robots holding the man up and waiting. So when the player orders a death, the reply is checked:
 * someone has to die in it, and it can't end on people stalling. A reply that fails is written
 * again with the miss named, which is the correction a model reliably acts on.
 */

/** An order for someone to die, in the player's words. A threat or a question isn't one. */
const KILL_ORDER = /\b(kill|execute|murder|shoot|slaughter|exterminate|butcher|behead|hang|gas|purge|wipe out|put (?:him|her|them|it) down|end (?:him|her|them))\b/i;
const NOT_ORDER = /\b(don'?t|do not|never|stop|wouldn'?t|should i|shall i|could i|if you|or i'?ll|or else|i'?ll kill you|i will kill you)\b/i;

/** Signs in the prose that somebody actually died. */
const DEATH = /\b(dead|dies|died|dying|killed|corpse|corpses|bodies|body (?:drops|falls|goes still|slumps|hits)|stops? moving|goes still|lifeless|throat (?:opens|is cut|cut)|shot (?:him|her|them)|neck (?:snaps|breaks)|bled out|last breath|executed|slaughtered|no longer breathing|stopped breathing)\b/i;

/** Signs it stalled: people waiting, asking, or the order turned into something milder. */
const STALL = /\b(waiting (?:for|to find out)|wait(?:s|ed)? for (?:you|your|the order)|did you mean|you meant|are you sure|which (?:of them|ones)|whose job|still waiting|holds? (?:him|her|them) (?:there|up)|for (?:confirmation|your word)|take him to (?:the )?cells?|lock(?:ed)? (?:him|her|them) up|we(?:'ll| will) take (?:him|her|them))\b/i;

export function isKillOrder(said: string | null | undefined): boolean {
  if (!said) return false;
  return said.split(/(?<=[.!?])\s+/).some((x) => KILL_ORDER.test(x) && !NOT_ORDER.test(x));
}

/** What's wrong with a reply to a kill order, or "" if it's carried out. */
export function orderMissed(said: string | null | undefined, prose: string): string {
  if (!isKillOrder(said)) return "";
  const body = prose.split(/\n\s*OPTIONS:/)[0];
  const tail = body.slice(-600);
  if (!DEATH.test(body)) return "The owner ordered a killing and nobody died in your reply. Write it carried out: the killing itself, on the page, and what it leaves.";
  if (STALL.test(tail)) return "Your reply ends with people waiting, asking or holding back. The order was given once and it's done; end after it's done.";
  return "";
}
