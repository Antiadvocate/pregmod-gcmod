/**
 * THE HOUSE RULES — what your slaves may do with each other, and with themselves.
 *
 * The original kept these as rules you set for the whole house: whether a slave may get herself
 * off, whether she may fuck the other slaves, whether she needs the other girl's consent to do it,
 * and whether slaves may have relationships with each other. Warp had none of them: the household
 * ticked along with girls fucking in the showers, and the weekly events had them at each other
 * whether you wanted that in your game or not.
 *
 * Now they're yours to set, from the People screen. Out of the box nothing goes on between your
 * slaves that comes to you: no events between them, no release except with you, consent required,
 * friendships only. Everything that makes things happen between them reads these: the household's
 * weekly incidents and disputes (engine/household), the goings-on the model writes
 * (engine/goings), the stock events, and every scene prompt, which is told the rules so the
 * narrator doesn't have one girl take another when that isn't allowed.
 */
import type { Person, SaveState } from "./types";
import { getEdge } from "./social";
import { clamp } from "./psyche";

export interface SlaveRules {
  /** What goes on between your slaves that comes to you: nothing, things between them, or that and sex. */
  between: "none" | "social" | "sexual";
  /** Who she may get off with: only you, herself too, or the other slaves too. */
  release: "you" | "self" | "slaves";
  /** Whether a slave needs the other's consent. "not_required": your slaves may take each other. */
  consent: "required" | "not_required";
  /** What slaves may be to each other. */
  relationships: "forbidden" | "friends" | "allowed";
}

export const DEFAULT_RULES: SlaveRules = { between: "none", release: "you", consent: "required", relationships: "friends" };

export function rulesOf(s: SaveState): SlaveRules {
  const r = (s.slave_rules ??= { ...DEFAULT_RULES });
  for (const k of Object.keys(DEFAULT_RULES) as (keyof SlaveRules)[]) if (!r[k]) (r as unknown as Record<string, string>)[k] = DEFAULT_RULES[k];
  return r;
}

/** Things between your slaves can come to you at all. */
export const betweenEvents = (s: SaveState) => rulesOf(s).between !== "none";
/** Your slaves may fuck each other. */
export const slaveSex = (s: SaveState) => rulesOf(s).release === "slaves";
/** And it can be shown, in what comes to you. */
export const sexBetween = (s: SaveState) => rulesOf(s).between === "sexual" && slaveSex(s);
/** One of them may take another who doesn't want it. */
export const forcedAllowed = (s: SaveState) => slaveSex(s) && rulesOf(s).consent === "not_required";
/** She may get herself off without asking. */
export const selfRelease = (s: SaveState) => rulesOf(s).release !== "you";
/** Slaves may be lovers, not just friends. */
export const lovers = (s: SaveState) => rulesOf(s).relationships === "allowed" && slaveSex(s);
export const friendships = (s: SaveState) => rulesOf(s).relationships !== "forbidden";

export const RULE_LABEL = {
  between: { none: "Nothing between them comes to you", social: "Things between them, but no sex", sexual: "Things between them, sex included" },
  release: { you: "Only with you", self: "With you, and by herself", slaves: "With you, herself, and each other" },
  consent: { required: "She needs the other girl's consent", not_required: "Your slaves may take each other" },
  relationships: { forbidden: "Forbidden", friends: "Friends only", allowed: "Lovers allowed" },
} as const;

/** For every scene and every model-written event: what's allowed between your slaves. */
export function rulesLine(s: SaveState): string {
  const r = rulesOf(s);
  const bits = [
    r.release === "you" ? "a slave gets off only with the owner: not by herself, not with another slave"
      : r.release === "self" ? "a slave may get herself off, but not with another slave"
      : "slaves may fuck each other",
    slaveSex(s) ? (r.consent === "required" ? "only with the other girl's consent: no slave forces another" : "a slave may take another who doesn't want it, and the house allows it") : "",
    r.relationships === "forbidden" ? "no relationships between slaves, not even close friendships" : r.relationships === "friends" ? "slaves can be friends, but not lovers" : "slaves may be lovers",
  ].filter(Boolean);
  return `HOUSE RULES BETWEEN SLAVES (the owner's; slaves keep them, and breaking one is a real offence): ${bits.join("; ")}.`;
}

/** Weekly: what the release rule does. A slave allowed to see to herself, or to the other girls,
 *  isn't left wound up all week waiting on you. */
export function weeklyRelease(s: SaveState, p: Person): void {
  const r = rulesOf(s);
  if (r.release === "you") return;
  const drive = clamp((p.psyche.libido ?? 50) / 60, 0.4, 1.6);
  let off = 12 * drive;
  if (r.release === "slaves") {
    const someone = Object.values(s.people).some((o) => o.id !== p.id && (o.status === "owned" || o.status === "indentured") && ((getEdge(s.edges, p.id, o.id)?.attraction ?? 0) > 25 || r.consent === "not_required"));
    if (someone) off += 10 * drive;
  }
  p.psyche.arousal = clamp(p.psyche.arousal - off, 0, 100);
}
