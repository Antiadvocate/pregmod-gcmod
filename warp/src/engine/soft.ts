/**
 * SOFTNESS THAT ISN'T HERS.
 *
 * A narrator model goes soft on its own: a sadist stops to ask whether you can take it, an abuser
 * pulls out when you beg her to tear you, a cold girl goes pink and apologises. That's one bad scene.
 * The damage is what comes after. Every few weeks a woman is re-read from her memories (engine/
 * growth), and the re-reading took those scenes as who she is, so Élise, an abusive dom with almost
 * no conscience, got "careful underneath it: stops when a body says stop" as a trait, and "she will
 * stop dead and ask whether you can take it" as the one thing about her, at the top of her card.
 * The next scene read that and went softer, and the next re-reading wrote it in deeper.
 *
 * Her nature is the game's, not the model's. For a woman whose dominant streak reaches the owner, or
 * whose conscience is low, gentleness in her traits, her history or her one-line identity is taken
 * out, on load and after every re-reading.
 */
import type { Person, SaveState } from "./types";
import { bossyReach } from "./nature";

/** Checking in, stopping because he said so, going pink, apologising, aftercare: the writer's
 *  manners, not a sadist's. */
export const SOFT = /\b(stops? (dead|when|if|the moment)|stopped when|says? stop|said no|can say stop|safe ?word|asks?,? (plainly,? )?(whether|if) (you|he) can take|checks? (on|in) (him|you)|careful underneath|gentle|gently|goes? soft|went soft|softens?|tender(ly)?|go(es)? slow|went slow|goes? pink|went pink|blush\w*|apologi[sz]\w*|says? sorry|reassur\w*|aftercare|asks? (first|permission|before)|out loud before|kissed the back of)\b/i;

/** Whether her card should be hard: her dominant streak reaches the owner, or she barely has a conscience. */
export function hardNature(s: SaveState, p: Person): boolean {
  const reach = bossyReach(s, p);
  return reach === "takes" || reach === "slips" || (p.persona.conscience ?? 0.5) <= 0.3;
}

const sentencesOf = (text: string) => text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [text];

/** Take the softness out of who she is. Returns whether anything changed. */
export function unsoften(s: SaveState, p: Person): boolean {
  if (!hardNature(s, p)) return false;
  const per = p.persona;
  let changed = false;
  const traits = per.core_traits.filter((t) => !SOFT.test(t));
  if (traits.length && traits.length !== per.core_traits.length) { per.core_traits = traits; changed = true; }
  if (per.signature && SOFT.test(per.signature)) { delete per.signature; changed = true; }
  if (per.life_history && SOFT.test(per.life_history)) {
    per.life_history = sentencesOf(per.life_history).filter((x) => !SOFT.test(x)).join("").trim();
    changed = true;
  }
  return changed;
}
