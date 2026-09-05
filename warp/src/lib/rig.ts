/**
 * THE RIG — turning a stack of flat SVG cut-outs into a body that is doing something.
 *
 * The old compositor painted a dozen layers at their authored coordinates and stopped. Every woman
 * in the arcology stood in the identical dead-centre T-ish pose forever, which is what made the
 * roster look like a clip-art catalogue rather than a room with people in it.
 *
 * There is no new art here and there does not need to be. The pack was drawn on one 560×1000
 * canvas with the parts already separated, which is a skeleton that nobody had bothered to declare.
 * This file declares it: five joints with real pivots, measured off the actual paths with a
 * headless browser rather than guessed, and every layer assigned to one of them.
 *
 *   neck    (299, 188)   head, face, features, fore hair
 *   chest   (297, 300)   torso, breasts, belly — also where breathing scales from
 *   shoulderL (340, 220) / shoulderR (255, 220)
 *   hips    (297, 440)   everything above it sways about this; legs and feet do not
 *
 * TWO THINGS DRIVE IT.
 *
 * POSE is discrete and deliberate: which arm variant, how the head is held, how the weight sits.
 * The pack already ships five arm positions — High, Mid, Low, Rebel, Thumb_Down — and the old
 * compositor used three of them. Poses are named so a scene or a chain beat can ask for one.
 *
 * IDLE is continuous and involuntary: breath, sway, blink, weight shift. It is a pure function of
 * (person, milliseconds), so there is no per-frame state to keep, forty of them cost one rAF loop
 * between them, and each woman is phase-offset by her own id so a roster does not pulse in unison.
 *
 * The point of all of it: BOTH READ HER STATE. A braced woman has her shoulders up, her arms in and
 * her chin down; a comfortable one stands level and breathes slowly; a woman running on nothing
 * sags. You are supposed to be able to tell how she is across the room, before you read a number.
 */
import type { Person } from "../engine/types";

/* ── the skeleton ──────────────────────────────────────────────────────────────────────────── */

export type Joint = "root" | "hips" | "chest" | "neck" | "armL" | "armR" | "eyes" | "legs";

/** Pivots in the pack's own coordinate space. Measured, not estimated. */
export const PIVOT: Record<Joint, [number, number]> = {
  root: [297, 940],
  hips: [297, 440],
  chest: [297, 300],
  neck: [299, 188],
  armL: [340, 220],
  armR: [255, 220],
  eyes: [289, 133],
  legs: [297, 430],
};

/** Which joint each layer hangs off. The chain is root → hips → chest → neck → features. */
export function jointFor(layerId: string): Joint {
  if (/^Arm(Fat)?_Left/.test(layerId)) return "armL";
  if (/^Arm(Fat)?_Right/.test(layerId)) return "armR";
  if (/^Eyes_/.test(layerId)) return "eyes";
  if (/^(Head|Face|Nose|Mouth|Lip_|Eyebrow_|Hair_Fore|Hair_Back)/.test(layerId)) return "neck";
  if (/^(Torso|Boob|Belly)/.test(layerId)) return "chest";
  if (/^(Leg|Feet|Butt|Pussy|Penis|Flaccid|Balls|Pubic|Chastity)/.test(layerId)) return "legs";
  return "hips";
}

/* ── poses ─────────────────────────────────────────────────────────────────────────────────── */

export type ArmPos = "High" | "Mid" | "Low" | "Rebel" | "Thumb_Down" | "None";

export interface Pose {
  id: string;
  /** What the menu and the scene directive call it. */
  name: string;
  armL: ArmPos;
  armR: ArmPos;
  /** Degrees. Positive is her left, i.e. clockwise on screen. */
  neck: number;
  /** Chin up (−) or down (+), faked as a small vertical shift since the pack has one head. */
  chin: number;
  chest: number;
  hips: number;
  /** Weight onto one leg: −1 … +1. Shifts the hips laterally and counter-tilts the shoulders. */
  weight: number;
  /** How much of the idle loop still plays. A woman braced against a wall does not sway. */
  liveliness: number;
  /** One line for the narrator, so the prose and the picture agree about what she is doing. */
  reads: string;
}

/**
 * The vocabulary. Ordered roughly from most closed to most open, because that is also the order
 * a woman moves through them over a campaign, and having the table in that order makes the
 * progression visible when you read it.
 */
export const POSES: Pose[] = [
  { id: "braced", name: "Braced", armL: "Mid", armR: "Mid", neck: 4, chin: 3, chest: -2, hips: -1, weight: -0.35, liveliness: 0.35,
    reads: "shoulders up, arms held in across herself, chin down and turned slightly away" },
  { id: "waiting", name: "Waiting", armL: "Low", armR: "Low", neck: 1, chin: 1, chest: 0, hips: 0, weight: -0.15, liveliness: 0.6,
    reads: "hands down in front of her, weight on one hip, looking at a point on the floor" },
  { id: "attention", name: "At attention", armL: "Low", armR: "Low", neck: 0, chin: -1, chest: 1, hips: 0, weight: 0, liveliness: 0.45,
    reads: "squared up, hands at her sides, eyes front, holding it" },
  { id: "easy", name: "Easy", armL: "Low", armR: "Mid", neck: -2, chin: 0, chest: 0, hips: 1, weight: 0.3, liveliness: 1,
    reads: "weight on one leg, one hand resting, entirely unbothered about being looked at" },
  { id: "presenting", name: "Presenting", armL: "High", armR: "High", neck: -3, chin: -2, chest: 3, hips: 2, weight: 0.2, liveliness: 0.8,
    reads: "hands behind her head, back arched, chest out, holding the position because she was told to" },
  { id: "offered", name: "Offered", armL: "Mid", armR: "High", neck: 6, chin: 2, chest: -1, hips: -3, weight: -0.45, liveliness: 0.7,
    reads: "turned half away, one arm up across her, hip pushed out, watching you over her shoulder" },
  { id: "kneeling", name: "Kneeling", armL: "Low", armR: "Low", neck: 2, chin: 4, chest: -3, hips: 0, weight: 0, liveliness: 0.5,
    reads: "down on both knees with her hands on her thighs, looking up" },
  { id: "reaching", name: "Reaching", armL: "High", armR: "Mid", neck: -4, chin: -3, chest: 2, hips: 1, weight: 0.25, liveliness: 1,
    reads: "one arm out towards you, the other half-raised, already moving" },
  { id: "defiant", name: "Defiant", armL: "Rebel", armR: "Rebel", neck: -1, chin: -4, chest: 4, hips: 0, weight: 0.1, liveliness: 0.9,
    reads: "arms crossed, chin up, feet planted, entirely aware of what it costs her" },
  { id: "dismissive", name: "Dismissive", armL: "Thumb_Down", armR: "Mid", neck: -5, chin: -2, chest: 2, hips: -1, weight: 0.35, liveliness: 0.85,
    reads: "one hand out in a gesture she knows you can read, not looking directly at you" },
  { id: "spent", name: "Spent", armL: "Low", armR: "Low", neck: 7, chin: 6, chest: -5, hips: -2, weight: -0.5, liveliness: 0.25,
    reads: "sagging, head hanging, arms loose, running on nothing" },
  { id: "curled", name: "Curled up", armL: "Mid", armR: "Mid", neck: 9, chin: 7, chest: -6, hips: -1, weight: -0.2, liveliness: 0.2,
    reads: "folded in on herself, arms wrapped round, as small as she can make herself" },
];

export const POSE_BY_ID: Record<string, Pose> = Object.fromEntries(POSES.map((p) => [p.id, p]));

/**
 * WHAT SHE IS DOING WHEN NOBODY HAS ASKED FOR ANYTHING.
 *
 * Read off the same numbers the panel reads. This is the whole reason the rig is worth having:
 * the roster stops being portraits and starts being a status display you can take in at a glance.
 */
export function restingPose(p: Person): Pose {
  const rel = p.psyche.relaxation;
  const dominion = p.romance?.dominion ?? -100;
  const devotion = p.bond.read?.devotion ?? 0;
  const fear = p.bond.fear;
  const spent = p.health.energy < 18 || p.health.health < -45;

  if (p.psyche.state === "broken") return POSE_BY_ID.waiting;
  if (spent) return POSE_BY_ID.spent;
  if (rel <= -7) return POSE_BY_ID.curled;
  if (rel <= -4) return POSE_BY_ID.braced;
  if (devotion < -35 && fear < 45) return POSE_BY_ID.defiant;
  if (dominion > 40) return POSE_BY_ID.dismissive;
  if (devotion > 60 && rel >= 2) return POSE_BY_ID.easy;
  if (fear > 55) return POSE_BY_ID.attention;
  return POSE_BY_ID.waiting;
}

/** What a scene should put her in, given what is being done. Falls back to her resting pose. */
export function poseForAct(p: Person, actTags: string[]): Pose {
  if (actTags.includes("worship") || actTags.includes("hers")) return POSE_BY_ID.easy;
  if (actTags.includes("submission") || actTags.includes("orders")) return POSE_BY_ID.kneeling;
  if (actTags.includes("exposure") || actTags.includes("public use")) return POSE_BY_ID.presenting;
  if (actTags.includes("domination")) return POSE_BY_ID.dismissive;
  if (actTags.includes("pain") || actTags.includes("punishment")) return POSE_BY_ID.braced;
  if (actTags.includes("tenderness")) return POSE_BY_ID.reaching;
  if (actTags.includes("anal") || actTags.includes("vaginal")) return POSE_BY_ID.offered;
  return restingPose(p);
}

/* ── the involuntary part ──────────────────────────────────────────────────────────────────── */

export interface RigFrame {
  hips: { rot: number; dx: number };
  chest: { rot: number; scale: number };
  neck: { rot: number; dy: number };
  armL: number;
  armR: number;
  /** 1 = open, 0 = shut. Scaled about the eye line. */
  eyelid: number;
}

/** Deterministic per-person phase, so forty women in a list are not one animation forty times. */
function phase(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * One frame, from (person, pose, time). Pure — nothing is stored between calls, which is why the
 * whole roster can share a single requestAnimationFrame and why a paused tab costs nothing.
 */
export function frameAt(p: Person, pose: Pose, ms: number): RigFrame {
  const ph = phase(p.id);
  const t = ms / 1000 + ph * 40;
  const live = pose.liveliness;

  // BREATH. Rate is the honest one: fear and arousal both raise it, comfort lowers it. A frightened
  // woman breathes about twice as fast as a comfortable one, which is true and is visible.
  const arousal = p.psyche.arousal / 100;
  const braced = Math.max(0, -p.psyche.relaxation / 10);
  const bpm = 11 + arousal * 9 + braced * 7 - Math.max(0, p.psyche.relaxation) * 0.25;
  const breath = Math.sin((t * bpm * Math.PI) / 30);
  // Shallow when braced: a body holding itself still does not fill its lungs.
  const depth = (0.0075 + arousal * 0.006) * (1 - braced * 0.45);

  // SWAY. Slow, small, and the first thing to go when she is not comfortable.
  const sway = Math.sin(t * 0.31) * 0.9 * live;
  const shift = Math.sin(t * 0.19 + 1.3) * 1.6 * live;

  // WEIGHT SHIFT. A long-period lean that occasionally crosses over, so she is not statuary.
  const lean = Math.sin(t * 0.077 + ph * 6.28);

  // HEAD. Drifts on its own slower rhythm, plus a small counter-rotation against the sway so the
  // head does not travel with the shoulders like a mounted ornament.
  const headDrift = Math.sin(t * 0.23 + 2.1) * 1.4 * live - sway * 0.35;

  // BLINK. Not a sine — a blink is a fast event on a slow irregular clock. Two overlapping periods
  // keep it from looking metronomic without needing a random number kept between frames.
  const bt = t * 0.42 + ph * 17;
  const gate = Math.sin(bt) * Math.sin(bt * 0.37 + 1.1);
  const blinking = gate > 0.985;
  const eyelid = blinking ? 0.05 : 1;

  return {
    hips: { rot: (sway + lean * 0.6) * 0.7 + pose.hips, dx: shift + lean * 2.2 * (0.4 + pose.weight) },
    chest: { rot: pose.chest - sway * 0.3, scale: 1 + breath * depth },
    neck: { rot: pose.neck + headDrift, dy: pose.chin + breath * 0.5 },
    armL: pose.chest * 0.4 + breath * 0.35,
    armR: -pose.chest * 0.4 + breath * 0.35,
    eyelid,
  };
}

/** The composed SVG transform for one joint, outermost first. Layers keep their own transform
 *  (the breast and belly scaling) nested inside whatever this returns, so the two never fight. */
export function transformFor(joint: Joint, f: RigFrame): string {
  const hips = `translate(${f.hips.dx.toFixed(2)} 0) rotate(${f.hips.rot.toFixed(2)} ${PIVOT.hips[0]} ${PIVOT.hips[1]})`;
  switch (joint) {
    case "root":
    case "legs":
      return "";
    case "hips":
      return hips;
    case "chest":
      return `${hips} rotate(${f.chest.rot.toFixed(2)} ${PIVOT.chest[0]} ${PIVOT.chest[1]}) translate(${PIVOT.chest[0]} ${PIVOT.chest[1]}) scale(1 ${f.chest.scale.toFixed(4)}) translate(${-PIVOT.chest[0]} ${-PIVOT.chest[1]})`;
    case "armL":
      return `${hips} rotate(${f.armL.toFixed(2)} ${PIVOT.armL[0]} ${PIVOT.armL[1]})`;
    case "armR":
      return `${hips} rotate(${f.armR.toFixed(2)} ${PIVOT.armR[0]} ${PIVOT.armR[1]})`;
    case "neck":
      return `${hips} rotate(${f.neck.rot.toFixed(2)} ${PIVOT.neck[0]} ${PIVOT.neck[1]}) translate(0 ${f.neck.dy.toFixed(2)})`;
    case "eyes":
      return `${hips} rotate(${f.neck.rot.toFixed(2)} ${PIVOT.neck[0]} ${PIVOT.neck[1]}) translate(0 ${f.neck.dy.toFixed(2)}) translate(${PIVOT.eyes[0]} ${PIVOT.eyes[1]}) scale(1 ${f.eyelid.toFixed(3)}) translate(${-PIVOT.eyes[0]} ${-PIVOT.eyes[1]})`;
  }
}

/** The still frame, for anything that must not move: thumbnails, the ControlNet render, print. */
export const STILL: RigFrame = {
  hips: { rot: 0, dx: 0 }, chest: { rot: 0, scale: 1 }, neck: { rot: 0, dy: 0 },
  armL: 0, armR: 0, eyelid: 1,
};
