/**
 * A FACE THAT MOVES — moods for the portrait of whoever you're talking to.
 *
 * The art pack draws each face from layers: eyes, brows, nose, mouth, in her own colours (which is
 * why gene programs that change colouring show up without anything here knowing about them). A
 * mood is a setting for those layers: each brow raised, lowered or tilted; the eyes opened, narrowed
 * or looking away; a mouth drawn fresh in her lip colour, smiling, frowning, smirking, open; a flush
 * and tears from the expression layer. The portrait blinks on its own, and its mouth moves while a
 * new line of hers is arriving.
 *
 * Which mood: what she just said or did, read from the words (the last feeling named wins, because
 * that's how the paragraph ends), or, when the words say nothing, how she is: her fear, her
 * resentment, her devotion, whether she's broken.
 */
import type { Person } from "../engine/types";

export type Mood =
  | "neutral" | "warm" | "happy" | "laugh" | "smug" | "shy" | "aroused" | "surprised"
  | "sad" | "crying" | "pleading" | "afraid" | "angry" | "contempt" | "defiant" | "bored" | "blank";

export interface FaceParams {
  /** Brows: dy is up (−) or down (+) in pack units; tilt is degrees, + lifts the inner ends. One per side, left as you look at her. */
  brows: { left: { dy: number; tilt: number }; right: { dy: number; tilt: number } };
  /** Eyes: how open (0 shut … 1 normal … 1.25 wide), and where they look. */
  eyes: { open: number; gazeX: number; gazeY: number };
  /** Mouth: curve −1 frown … +1 smile; open 0 … 1; width 0.8 … 1.2; skew −1 … 1 for a one-sided smirk. */
  mouth: { curve: number; open: number; width: number; skew: number };
  blush: number;
  tears: number;
}

const B = (dy: number, tilt: number) => ({ left: { dy, tilt }, right: { dy, tilt } });

export const MOODS: Record<Mood, FaceParams> = {
  neutral: { brows: B(0, 0), eyes: { open: 1, gazeX: 0, gazeY: 0 }, mouth: { curve: 0, open: 0, width: 1, skew: 0 }, blush: 0, tears: 0 },
  warm: { brows: B(-0.6, 1), eyes: { open: 0.92, gazeX: 0, gazeY: 0 }, mouth: { curve: 0.45, open: 0, width: 1.02, skew: 0 }, blush: 0.12, tears: 0 },
  happy: { brows: B(-1.2, 1.5), eyes: { open: 0.85, gazeX: 0, gazeY: 0 }, mouth: { curve: 0.85, open: 0.2, width: 1.08, skew: 0 }, blush: 0.18, tears: 0 },
  laugh: { brows: B(-1.6, 2), eyes: { open: 0.45, gazeX: 0, gazeY: 0 }, mouth: { curve: 1, open: 0.85, width: 1.12, skew: 0 }, blush: 0.25, tears: 0 },
  smug: { brows: { left: { dy: -1.4, tilt: -2 }, right: { dy: 0.4, tilt: 0 } }, eyes: { open: 0.78, gazeX: 0.6, gazeY: 0 }, mouth: { curve: 0.45, open: 0, width: 1, skew: 0.8 }, blush: 0, tears: 0 },
  shy: { brows: B(-0.6, 3), eyes: { open: 0.72, gazeX: -1.1, gazeY: 1.4 }, mouth: { curve: 0.25, open: 0, width: 0.92, skew: 0 }, blush: 0.65, tears: 0 },
  aroused: { brows: B(-0.4, 3.5), eyes: { open: 0.55, gazeX: 0, gazeY: 0.3 }, mouth: { curve: 0.1, open: 0.4, width: 0.98, skew: 0 }, blush: 0.75, tears: 0 },
  surprised: { brows: B(-3.2, 0.5), eyes: { open: 1.25, gazeX: 0, gazeY: 0 }, mouth: { curve: 0, open: 0.7, width: 0.8, skew: 0 }, blush: 0, tears: 0 },
  sad: { brows: B(0, 7), eyes: { open: 0.78, gazeX: 0, gazeY: 1.3 }, mouth: { curve: -0.6, open: 0, width: 0.95, skew: 0 }, blush: 0, tears: 0 },
  crying: { brows: B(-0.4, 8), eyes: { open: 0.55, gazeX: 0, gazeY: 1 }, mouth: { curve: -0.85, open: 0.35, width: 1, skew: 0 }, blush: 0.35, tears: 0.9 },
  pleading: { brows: B(-1.2, 8), eyes: { open: 1.1, gazeX: 0, gazeY: -0.4 }, mouth: { curve: -0.25, open: 0.25, width: 0.95, skew: 0 }, blush: 0.15, tears: 0.2 },
  afraid: { brows: B(-2.4, 6), eyes: { open: 1.2, gazeX: 0.4, gazeY: 0 }, mouth: { curve: -0.35, open: 0.45, width: 1.04, skew: 0 }, blush: 0, tears: 0 },
  angry: { brows: B(1.5, -9), eyes: { open: 0.74, gazeX: 0, gazeY: 0 }, mouth: { curve: -0.45, open: 0.05, width: 0.9, skew: 0 }, blush: 0.2, tears: 0 },
  contempt: { brows: { left: { dy: -1.2, tilt: -3 }, right: { dy: 0.8, tilt: -4 } }, eyes: { open: 0.72, gazeX: 1, gazeY: 0 }, mouth: { curve: 0.15, open: 0, width: 0.96, skew: -0.9 }, blush: 0, tears: 0 },
  defiant: { brows: B(1, -5), eyes: { open: 0.92, gazeX: 0, gazeY: -0.3 }, mouth: { curve: -0.15, open: 0, width: 0.92, skew: 0 }, blush: 0, tears: 0 },
  bored: { brows: B(0.6, 0), eyes: { open: 0.58, gazeX: 1.3, gazeY: 0 }, mouth: { curve: -0.1, open: 0, width: 0.98, skew: 0.2 }, blush: 0, tears: 0 },
  blank: { brows: B(0.3, 0), eyes: { open: 0.68, gazeX: 0, gazeY: 0.5 }, mouth: { curve: 0, open: 0.05, width: 0.96, skew: 0 }, blush: 0, tears: 0 },
};

/** Words that name a mood. The last one in the text wins: it's how the paragraph ends. */
const WORDS: [Mood, RegExp][] = [
  ["laugh", /\b(laugh\w*|giggl\w*|cackl\w*|chuckl\w*)/gi],
  ["happy", /\b(smil\w*|grin\w*|beam\w*|delight\w*|glad|happy|brightens?)/gi],
  ["warm", /\b(softens?|tender\w*|fond\w*|gentl\w*|warmly|kindly)/gi],
  ["smug", /\b(smug\w*|pleased with herself|self-satisfied|preen\w*)/gi],
  ["crying", /\b(cry|cries|crying|cried|sob\w*|weep\w*|tears? (roll|run|spill|stream)\w*)/gi],
  ["sad", /\b(sad\w*|sigh\w*|miserabl\w*|downcast|hurt|mournful\w*|wistful\w*|her face falls)/gi],
  ["pleading", /\b(beg\w*|plead\w*|please,)/gi],
  ["afraid", /\b(flinch\w*|trembl\w*|shak(es|ing)|afraid|fear\w*|terrif\w*|panic\w*|cower\w*|frightened|scared)/gi],
  ["angry", /\b(glar\w*|scowl\w*|snarl\w*|furious|anger|angry|seeth\w*|spits?)\b/gi],
  ["contempt", /\b(sneer\w*|smirk\w*|scoff\w*|rolls? her eyes|disdain\w*|contempt\w*)/gi],
  ["defiant", /\b(defian\w*|chin (up|lifts?|raised)|refuses?|won't|jaw (sets?|set)|stares? you down)/gi],
  ["surprised", /\b(gasp\w*|startl\w*|surpris\w*|wide-eyed|eyes widen)/gi],
  ["shy", /\b(blush\w*|looks? away|looks? down|eyes (drop|fall|lower)\w*|shy\w*|bashful\w*|fidget\w*|flustered)/gi],
  ["aroused", /\b(moan\w*|pant\w*|breathless\w*|aroused|flushed|whimper\w*|bites? her lip)/gi],
  ["bored", /\b(bored|yawn\w*|shrugs?)\b/gi],
  ["blank", /\b(blank\w*|empty|vacant\w*|hollow\w*|numb\w*|doesn't react)/gi],
];

/** The mood a passage ends on, or undefined when it names none. */
export function moodFromText(text: string): Mood | undefined {
  let best: { mood: Mood; at: number } | undefined;
  for (const [mood, re] of WORDS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) if (!best || m.index > best.at) best = { mood, at: m.index };
  }
  return best?.mood;
}

/** How she looks when nothing in particular is happening: from how she is. */
export function moodOf(p: Person): Mood {
  const b = p.bond;
  if (p.psyche.state === "broken") return "blank";
  if (p.psyche.arousal > 75) return "aroused";
  if (b.fear > 60) return "afraid";
  if (b.resentment > 60) return "defiant";
  if (b.resentment > 45) return "contempt";
  if ((b.read?.devotion ?? 0) > 60) return "warm";
  if (p.psyche.relaxation <= -5) return "sad";
  return "neutral";
}

/** The mood for a line she just said, falling back on how she is. */
export const moodFor = (p: Person, text?: string): Mood => (text ? moodFromText(text) : undefined) ?? moodOf(p);

/** The mood of one person in a scene with several: the sentences that name her, else the whole passage. */
export function moodIn(p: Person, text: string): Mood {
  const first = p.name.split(/\s+/)[0];
  if (first && first.length > 1) {
    const hers = text.split(/(?<=[.!?…])\s+/).filter((s) => new RegExp(`\\b${first.replace(/[^\w-]/g, "")}\\b`, "i").test(s)).join(" ");
    const m = hers ? moodFromText(hers) : undefined;
    if (m) return m;
  }
  return moodFor(p, text);
}

/* ── moving between moods ───────────────────────────────────────────────────────────────────── */

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** `k` of the way from a to b. */
export function blend(a: FaceParams, b: FaceParams, k: number): FaceParams {
  const side = (x: { dy: number; tilt: number }, y: { dy: number; tilt: number }) => ({ dy: mix(x.dy, y.dy, k), tilt: mix(x.tilt, y.tilt, k) });
  return {
    brows: { left: side(a.brows.left, b.brows.left), right: side(a.brows.right, b.brows.right) },
    eyes: { open: mix(a.eyes.open, b.eyes.open, k), gazeX: mix(a.eyes.gazeX, b.eyes.gazeX, k), gazeY: mix(a.eyes.gazeY, b.eyes.gazeY, k) },
    mouth: { curve: mix(a.mouth.curve, b.mouth.curve, k), open: mix(a.mouth.open, b.mouth.open, k), width: mix(a.mouth.width, b.mouth.width, k), skew: mix(a.mouth.skew, b.mouth.skew, k) },
    blush: mix(a.blush, b.blush, k),
    tears: mix(a.tears, b.tears, k),
  };
}

export const cloneFace = (f: FaceParams): FaceParams => blend(f, f, 0);

/** Blinks: shut for ~150ms every 2.5–6s, on a schedule of her own so a row of faces doesn't blink together. */
export function blinkAt(ms: number, seed: number): number {
  const period = 2500 + (seed % 3500);
  const t = (ms + seed * 97) % period;
  return t < 150 ? 1 - Math.sin((Math.PI * t) / 150) : 1;
}

/** A mouth moving through words: 0 … 1, never quite still, never a clean sine. */
export function talkAt(ms: number): number {
  const v = Math.abs(Math.sin(ms / 83)) * 0.6 + Math.abs(Math.sin(ms / 131 + 1.3)) * 0.4;
  const pause = Math.sin(ms / 900) > 0.75 ? 0.15 : 1;
  return v * pause;
}

/* ── the drawn mouth ────────────────────────────────────────────────────────────────────────── */

export interface Box { x: number; y: number; w: number; h: number }
/** Where the pack puts a mouth when there is nothing to measure. */
export const MOUTH_BOX: Box = { x: 269, y: 161, w: 26, h: 12 };

const n = (v: number) => Math.round(v * 100) / 100;
const P = (x: number, y: number) => `${n(x)} ${n(y)}`;

/** Paths for a mouth in `box` doing `m`: the lips (filled in her lip colour), the dark of the open
 *  mouth, a line of teeth, and the line where the lips meet. Quadratic control points are placed so
 *  each curve passes through the midpoint asked for. */
export function mouthPaths(box: Box, m: FaceParams["mouth"]): { upper: string; lower: string; gap: string; teeth: string; line: string } {
  const w = Math.max(18, Math.min(30, box.w));
  const cx = box.x + box.w / 2;
  const cy = box.y + Math.min(box.h, 20) * 0.42;
  const hw = (w / 2) * m.width;
  const o = Math.max(0, Math.min(1, m.open)) * w * 0.42;
  const lift = m.curve * w * 0.14;
  const L = { x: cx - hw, y: cy - lift + m.skew * w * 0.1 };
  const R = { x: cx + hw, y: cy - lift - m.skew * w * 0.1 };
  const mx = cx + m.skew * hw * 0.12;
  const my = cy + m.curve * w * 0.03;
  const through = (yMid: number) => ({ x: 2 * mx - (L.x + R.x) / 2, y: 2 * yMid - (L.y + R.y) / 2 });
  const upY = my - o * 0.3, loY = my + o * 0.7;
  const upIn = through(upY);
  const loIn = through(loY);
  const pk = upY - w * 0.19;
  const yb = loY + w * 0.24 * 1.33;
  const upper = `M${P(L.x, L.y)} C${P(cx - hw * 0.7, L.y - w * 0.08)} ${P(cx - hw * 0.45, pk)} ${P(cx - hw * 0.2, pk)} Q${P(cx, pk + w * 0.05)} ${P(cx + hw * 0.2, pk)} C${P(cx + hw * 0.45, pk)} ${P(cx + hw * 0.7, R.y - w * 0.08)} ${P(R.x, R.y)} Q${P(upIn.x, upIn.y)} ${P(L.x, L.y)}Z`;
  const lower = `M${P(L.x, L.y)} Q${P(loIn.x, loIn.y)} ${P(R.x, R.y)} C${P(cx + hw * 0.6, yb)} ${P(cx - hw * 0.6, yb)} ${P(L.x, L.y)}Z`;
  const gap = `M${P(L.x, L.y)} Q${P(upIn.x, upIn.y)} ${P(R.x, R.y)} Q${P(loIn.x, loIn.y)} ${P(L.x, L.y)}Z`;
  const t = Math.min(o * 0.35, w * 0.12);
  const teeth = o > w * 0.08 ? `M${P(L.x, L.y)} Q${P(upIn.x, upIn.y)} ${P(R.x, R.y)} L${P(R.x, R.y + t)} Q${P(upIn.x, upIn.y + t)} ${P(L.x, L.y + t)}Z` : "";
  const line = `M${P(L.x, L.y)} Q${P(upIn.x, upIn.y)} ${P(R.x, R.y)}`;
  return { upper, lower, gap, teeth, line };
}

/** Who in a group is talking: the one named last in the passage, else the first. */
export function speakerOf(people: Person[], text: string): number {
  let best = 0, at = -1;
  people.forEach((p, i) => {
    const first = p.name.split(/\s+/)[0]?.replace(/[^\w-]/g, "");
    if (!first) return;
    const re = new RegExp(`\\b${first}\\b`, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) if (m.index > at) { at = m.index; best = i; }
  });
  return best;
}

/** Words that mean the other side of the conversation is more than one person. */
export const PLURAL = /\b(crowd|group|delegation|council|families|couple|women|men|girls|citizens|people|residents|workers|protesters|mob|board|committee|the three|the two|both of them)\b/i;
