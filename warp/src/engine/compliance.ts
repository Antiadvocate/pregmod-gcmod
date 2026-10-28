/**
 * WHETHER SHE DOES WHAT SHE'S TOLD.
 *
 * In the original a slave's devotion and trust decided how she took an order, every time: a devoted
 * one did it gladly, an accepting one did it, an ambivalent one did it grudgingly, a resistant one
 * did it only if she was afraid enough and otherwise fought, and a terrified one did anything at
 * all, crying. In Warp, with a model writing the scene, every slave did what she was told and liked
 * it: a resentful woman thanked you, a frightened one smiled. Nothing ever needed punishing.
 *
 * Now the game decides her stance, the narrator is told it as fact, and she doesn't come round on
 * her own: what she won't do happens only if you make it happen, with your hands, the guards or a
 * punishment. Trust and fear both buy obedience: a woman who trusts you does what you ask, and so
 * does one who's terrified of you; the ones in between are where the friction is. Her behavioural
 * flaw (data/behavior) adds its own, and so does being spoiled: a slave indulged for weeks and never
 * disciplined starts pushing her luck.
 *
 * Each week a slave whose stance is friction may misbehave: shirk her work, talk back, steal, preach.
 * It costs you something, it goes in the report, and it can come to you as something to punish.
 */
import type { Person, SaveState } from "./types";
import { read } from "./obedience";
import { latitudeOf } from "./voice";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { BEHAVIOR_FLAW_BY_ID } from "../data/behavior";

export type Stance = "hollow" | "eager" | "obedient" | "reluctant" | "terrified" | "resists" | "fights" | "free";

export interface Obeys {
  stance: Stance;
  /** Spoiled: indulged for weeks with no discipline, and testing how far that goes. */
  pushes: boolean;
  /** The words for the narrator. */
  line: string;
  /** A few words for the screen. */
  label: string;
}

const LINE: Record<Stance, string> = {
  hollow: "She's mindbroken. She does whatever she's told, and there's nobody behind it.",
  eager: "She wants to please. She does what she's told quickly, and she likes being told.",
  obedient: "She obeys. She does what she's told properly, without needing to be told twice, but what she doesn't like still shows on her face.",
  reluctant: "She obeys slowly and grudgingly. She stalls, needs to be told twice, does it badly or with a sullen face, and tries to get out of what she hates.",
  terrified: "She obeys because she's terrified of the owner. She does it at once, shaking, sometimes crying, apologising and begging not to be hurt. It's fear rather than willingness.",
  resists: "She doesn't want to obey, and it shows. She stalls, makes excuses, begs to be let off and pulls away, and she does what she hates only when she's made to, by being held, threatened or punished into it.",
  fights: "She refuses. She says no, argues, pulls away, and may try to run or hit out. It only happens if the owner forces it, with his own hands, restraints or the guards, or punishes her into it, and she hates him for it.",
  free: "She isn't bound to obey. She does what the owner asks if she wants to, and says no if she doesn't.",
};

const LABEL: Record<Stance, string> = {
  hollow: "does anything", eager: "eager to obey", obedient: "obeys", reluctant: "obeys grudgingly",
  terrified: "obeys out of terror", resists: "resists you", fights: "will fight you", free: "free to say no",
};

/** How she takes an order right now. */
export function obeys(s: SaveState, p: Person): Obeys {
  const r = read(p, s.memory[p.id]);
  const lat = latitudeOf(p);
  let stance: Stance;
  // Leave to say no is something he gave her. With a gun to her head it's gone: a woman held by
  // terror obeys like it, whatever latitude or say she had before.
  // Hatred isn't something holding her in place, so a woman who hates him and is terrified of him
  // is held by the terror alone.
  const terror = p.bond.fear >= 60 && (r.fragility >= 0.5 || p.bond.bond <= 0);
  if (p.psyche.state === "broken") stance = "hollow";
  else if (lat === "free" && !terror) stance = "free";
  else {
    const fear = p.bond.fear;
    // Fear raises the devotion reading (it buys compliance), so terror is read first: a woman whose
    // obedience is mostly fear obeys like it, however devoted the number looks. (Warp's trust falls
    // with resentment, not only with fear, so it's fear itself that's read here.)
    const terrified = terror || (fear >= 60 && r.fragility >= 0.5);
    const dev = r.devotion;
    if (terrified) stance = "terrified";
    else if (dev >= 50) stance = "eager";
    else if (dev >= 20) stance = "obedient";
    else if (dev > -20) stance = "reluctant";
    else if (dev <= -50 && fear < 35) stance = "fights";
    else stance = "resists";
  }
  const flaw = p.persona.behavior?.flaw ? BEHAVIOR_FLAW_BY_ID[p.persona.behavior.flaw] : undefined;
  const assertive = !!flaw && ["arrogant", "bitchy", "liberated", "bossy", "spiteful"].includes(flaw.id);
  const pushes = ["eager", "obedient", "reluctant", "free"].includes(stance) && (p.bond.indulged ?? 0) >= 45 && p.bond.weeks_since_cruelty >= 6
    && (assertive || p.persona.conscience < 0.45 || lat !== "slave" || p.bond.resentment > 25);
  const parts = [LINE[stance]];
  if (flaw && stance !== "hollow") parts.push(`Because of her flaw, ${flaw.friction}.`);
  else if (p.persona.behavior?.flaw && stance !== "hollow") parts.push(`Her flaw (${p.persona.behavior.flaw}) gets in the way of doing what she's told.`);
  if (pushes) parts.push("She's been indulged for weeks and never disciplined, and she's started pushing her luck. She bargains, sulks, drags her feet and ignores small orders to see what she can get away with.");
  if (!["hollow", "eager", "free"].includes(stance)) parts.push("Kindness, gifts or a nice word in the scene don't change this. She doesn't come round on her own, and she doesn't enjoy what she didn't want or thank the owner for it. The owner decides whether to force it, call the guards or punish her.");
  return { stance, pushes, line: parts.join(" "), label: pushes ? `${LABEL[stance]}, pushing her luck` : LABEL[stance] };
}

/** For her card. */
export function obeysLine(s: SaveState, p: Person): string {
  if (s.player.owned_by === p.id) return "";
  return `HOW SHE TAKES ORDERS. The game decides this, so write her this way. ${obeys(s, p).line} Whether she obeys is decided here, but how it sounds is up to her, in her own words, voice and habits from the rest of her card, and never in a stock slave's lines. Two slaves who both resist don't sound alike.`;
}

/** Whether an act she's made to do is forced on her. */
export function forced(stance: Stance): boolean {
  return stance === "resists" || stance === "fights";
}

/* ── the week ─────────────────────────────────────────────────────────────────────────────── */

const BASE: Record<Stance, number> = { hollow: 0, eager: 0, obedient: 0.03, reluctant: 0.15, terrified: 0.03, resists: 0.32, fights: 0.5, free: 0 };

export interface Misdeed { what: string; kind: "shirked" | "refused" | "flaw" | "mouthed"; cut: number }

/** Did she misbehave this week, and what did it cost. Mutates her record when she did. */
export function misbehave(s: SaveState, p: Person): Misdeed | null {
  if (p.age < 18 || s.player.owned_by === p.id) return null;
  const o = obeys(s, p);
  const flaw = p.persona.behavior?.flaw ? BEHAVIOR_FLAW_BY_ID[p.persona.behavior.flaw] : undefined;
  const chance = BASE[o.stance] + (o.pushes ? 0.2 : 0) + (flaw && o.stance !== "hollow" && o.stance !== "free" ? 0.08 : 0);
  const r = rng(`misbehave:${p.id}:${s.arcology.week}`);
  // Spoiling drifts down on its own, slowly.
  p.bond.indulged = Math.max(0, (p.bond.indulged ?? 0) * 0.96);
  if (!r.chance(chance)) return null;
  const sells = /whore|public servant/.test(p.assignment) || ["brothel", "arcade", "club"].includes(p.facility ?? "");
  let d: Misdeed;
  if (flaw && r.chance(0.45)) d = { what: flaw.misdeed, kind: "flaw", cut: 0.85 };
  else if (sells && r.chance(0.6)) d = { what: "turned clients away and wouldn't do what they paid for", kind: "refused", cut: 0.6 };
  else if (o.pushes || r.chance(0.4)) d = { what: "talked back to the staff in front of the others, and made a point of it", kind: "mouthed", cut: 0.9 };
  else d = { what: "did half her work and hid the rest", kind: "shirked", cut: 0.55 };
  p.misbehaved = { week: s.arcology.week, what: d.what, kind: d.kind };
  return d;
}
