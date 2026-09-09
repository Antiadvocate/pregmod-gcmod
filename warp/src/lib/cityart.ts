/**
 * THE SKYLINE — the city, drawn from the city.
 *
 * Not an illustration of a city. A rendering of THIS one: every block on the horizon is a district
 * in the save, at the height its level bought, in the state its condition left it. Raise a works
 * to level four and the works gets taller on the next frame. Let the verge rot and the verge goes
 * dark and grows scaffolding. Take a neighbour and their tower stops being on the horizon.
 *
 * That is the whole design goal — an upgrade you paid for has to be visible from across the room,
 * or it is a number in a list and the player is back to reading a spreadsheet.
 *
 * ── HOW IT IS DRAWN ─────────────────────────────────────────────────────────────────────────
 *
 * Front elevation, not isometric. Isometric looks better in a screenshot and is much worse to read
 * at a glance on a phone: overlapping roofs hide exactly the thing the player is trying to check.
 * A flat horizon of blocks, sorted back-to-front by ring, keeps every district legible at 390pt.
 *
 * Everything is deterministic. Window patterns, aerial masts, rooftop clutter and the position of
 * the birds all come from a hash of the district id, so a block looks the same every frame and the
 * same across sessions, without any of it being stored.
 *
 * Depth comes from three things and no gradients on the buildings themselves: rings further back
 * are smaller, desaturated toward the sky colour, and drawn first. That is enough, and it survives
 * both themes.
 */
import type { District } from "../engine/city";
import { DISTRICT_BY_KIND } from "../data/districts";

export const SKY_W = 1000;
export const SKY_H = 620;
const GROUND = 560;

/* ── the hour, which is most of the mood ───────────────────────────────────────────────────── */

export type Hour = "dawn" | "day" | "dusk" | "night";

export interface SkyPalette {
  top: string; bottom: string; haze: string;
  /** Multiplied into every building's face. */
  shade: number;
  /** How lit the windows are, 0–1. */
  lamps: number;
  ground: string;
  star: number;
}

const SKIES: Record<Hour, SkyPalette> = {
  dawn:  { top: "#2b3550", bottom: "#8a6f63", haze: "#6d6270", shade: 0.72, lamps: 0.45, ground: "#1b1c22", star: 0.15 },
  day:   { top: "#4a6484", bottom: "#9fb0bd", haze: "#8fa0ae", shade: 1.0,  lamps: 0.05, ground: "#2a2c32", star: 0 },
  dusk:  { top: "#22283f", bottom: "#7d5450", haze: "#4f4553", shade: 0.62, lamps: 0.7,  ground: "#17181d", star: 0.3 },
  night: { top: "#0d1018", bottom: "#1c2130", haze: "#232838", shade: 0.4,  lamps: 1,    ground: "#0e0f13", star: 1 },
};

/** The scene clock says "Week 4, Tuesday 21:00" or similar; pull the hour out of whatever it says. */
export function hourFrom(time: string): Hour {
  const h = Number(/(\d{1,2}):\d{2}/.exec(time)?.[1] ?? 14);
  if (h < 6) return "night";
  if (h < 9) return "dawn";
  if (h < 17) return "day";
  if (h < 21) return "dusk";
  return "night";
}

/* ── deterministic per-district noise ──────────────────────────────────────────────────────── */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** A stable 0–1 stream per district, so a block's windows never reshuffle between frames. */
function noise(seed: number, n: number): number {
  const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round((((pa >> 16) & 255) * (1 - t)) + (((pb >> 16) & 255) * t));
  const g = Math.round((((pa >> 8) & 255) * (1 - t)) + (((pb >> 8) & 255) * t));
  const bl = Math.round(((pa & 255) * (1 - t)) + ((pb & 255) * t));
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}
function darken(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `#${((c((n >> 16) & 255) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, "0")}`;
}

/* ── one block ─────────────────────────────────────────────────────────────────────────────── */

export interface BlockShape {
  id: string;
  /** Screen rect. */
  x: number; y: number; w: number; h: number;
  fill: string;
  /** Lit windows as flat rects. Kept as data so the view can animate a few of them. */
  windows: { x: number; y: number; w: number; h: number; lit: boolean }[];
  /** Rooftop clutter — masts, tanks, the aerial farm. */
  roof: string;
  /** Scaffolding, drawn on anything built in the last few weeks or anything falling apart. */
  scaffold: boolean;
  /** Smoke, for works and for anything genuinely on fire. */
  smoke: number;
  vacant: boolean;
  ring: number;
  label: string;
  level: number;
  condition: number;
}

/**
 * Lay the whole city out.
 *
 * Rings are drawn back to front, each ring narrower and higher on the canvas than the one in front,
 * which is the only perspective cue the drawing needs. The spire is placed last and centred, so it
 * sits in front of everything and reads as the thing the city is arranged around.
 */
export function layout(districts: District[], opts: { week: number; crime: number; population: number; hour: Hour }): {
  blocks: BlockShape[]; sky: SkyPalette; horizon: number; terraces: { y: number; fill: string }[];
  /** Tight around the content, with headroom. Grows as the city does. */
  viewBox: string;
} {
  const sky = SKIES[opts.hour];
  const blocks: BlockShape[] = [];
  const spire = districts.find((d) => d.kind === "spire");

  /**
   * ONE SCALE FOR THE WHOLE SCENE, computed before anything is placed.
   *
   * A spire at level eight is over five hundred units tall on a canvas with three hundred and
   * seventy of headroom, and the first version simply drew it off the top of the frame — the
   * player's own building, the one thing the drawing exists to show growing, was the first thing
   * to leave the picture. Everything is measured first and the whole city is scaled to fit, so
   * proportions hold and the tallest thing is always the spire and always visible.
   */
  const spireRaw = spire ? 190 + spire.level * 52 : 0;
  // Districts are never scaled down — a city that grows has to LOOK like it grew, and the first
  // version scaled the whole scene to keep the spire in frame, which made a fully built city
  // shorter on screen than a half-built one. Only the spire is clamped, to the headroom its mast
  // needs, so it stays both in frame and the tallest thing on the horizon.
  const tallestDistrict = Math.max(1, ...districts.map((d) => {
    if (d.kind === "vacant" || !d.level) return 0;
    const def = DISTRICT_BY_KIND[d.kind];
    return def ? (56 + def.bulk * d.level * 118) * (1 - ((d.ring - 1) / 2) * 0.36) : 0;
  }));
  const fit = 1;
  const spireH = Math.max(spireRaw, tallestDistrict + 52);

  // Back to front: the verge (ring 3) is furthest away and smallest.
  for (const ring of [3, 2, 1]) {
    const inRing = districts.filter((d) => d.ring === ring).sort((a, b) => a.slot - b.slot);
    if (!inRing.length) continue;
    const depth = (ring - 1) / 2;                    // 0 = near, 1 = far
    const baseline = GROUND - depth * 34;            // further back sits higher
    const scale = 1 - depth * 0.36;
    const margin = 30 + depth * 70;
    const span = SKY_W - margin * 2;
    const slotW = span / inRing.length;

    inRing.forEach((d, i) => {
      const def = d.kind === "vacant" ? undefined : DISTRICT_BY_KIND[d.kind];
      const seed = hash(d.id);
      const w = slotW * (0.66 + noise(seed, 1) * 0.2);
      const x = margin + i * slotW + (slotW - w) / 2;

      if (!def || !d.level) {
        // A vacant plot is a hoarding and a patch of ground, not nothing — the player has to be
        // able to see where there is room.
        // A hoarding on the ground, not a line in the air. Empty ground has to read as ground the
        // player could build on, which means it needs a surface under it — see the ring terraces
        // the view draws from `groundLines` below.
        blocks.push({
          id: d.id, x, y: baseline - 16 * scale, w, h: 16 * scale,
          fill: mix(sky.haze, "#2a2b30", 0.5 - depth * 0.25),
          windows: [], roof: "", scaffold: false, smoke: 0, vacant: true, ring,
          label: "vacant", level: 0, condition: 0,
        });
        return;
      }

      // Level one has to be a BUILDING, not a kerb — the base is most of what stops an early
      // city reading as an empty lot with a tower in it.
      const h = (56 + def.bulk * d.level * 118) * scale * fit;
      const y = baseline - h;
      const keep = d.condition / 100;
      // Colour: the district's own hue, darkened by the hour, hazed toward the sky by distance,
      // and drained toward grey as it falls apart.
      let fill = darken(def.hue, sky.shade * (0.62 + keep * 0.38));
      fill = mix(fill, sky.haze, depth * 0.5);

      // WINDOWS. Rows and columns scaled to the block, lit in proportion to the hour and to how
      // full the city is — a half-empty arcology has half-dark towers, which is the population
      // number made visible without printing it anywhere.
      const cols = Math.max(2, Math.round(w / (9 + depth * 4)));
      const rows = Math.max(1, Math.round(h / (11 + depth * 4)));
      const occupancy = Math.min(1, opts.population / 3000);
      const windows: BlockShape["windows"] = [];
      const ww = w / cols * 0.42, wh = h / rows * 0.34;
      for (let c = 0; c < cols; c++) {
        for (let rr = 0; rr < rows; rr++) {
          const n = noise(seed, c * 31 + rr * 7 + 3);
          if (n > 0.86) continue;                                    // blank panel
          const lit = n < sky.lamps * (0.35 + occupancy * 0.5) * keep;
          windows.push({
            x: x + (c + 0.5) * (w / cols) - ww / 2,
            y: y + (rr + 0.5) * (h / rows) - wh / 2,
            w: ww, h: wh, lit,
          });
        }
      }

      blocks.push({
        id: d.id, x, y, w, h, fill, windows,
        roof: roofFor(d.kind, seed, x, y, w, scale),
        scaffold: (d.built !== undefined && opts.week - d.built < 3) || d.condition < 30,
        smoke: d.kind === "industrial" ? 0.5 + d.level * 0.1 : (opts.crime > 65 && noise(seed, 9) > 0.8 ? 0.4 : 0),
        vacant: false, ring,
        label: def.name, level: d.level, condition: d.condition,
      });
    });
  }

  // THE SPIRE, front and centre, and taller than anything by construction.
  if (spire) {
    const def = DISTRICT_BY_KIND.spire;
    // The spire has to stay the tallest thing on the horizon at every stage, or the city grows up
    // around it and your own building stops reading as the thing the place is arranged around.
    const h = spireH;
    const w = 88 + spire.level * 5;
    const x = SKY_W / 2 - w / 2;
    const y = GROUND - h;
    const seed = hash(spire.id);
    const windows: BlockShape["windows"] = [];
    const cols = Math.max(6, Math.round(w / 13)), rows = Math.round(h / 13);
    const ww = w / cols * 0.44, wh = h / rows * 0.36;
    for (let c = 0; c < cols; c++) {
      for (let rr = 0; rr < rows; rr++) {
        const n = noise(seed, c * 17 + rr * 5);
        // The top three floors are yours and they are always lit, which is the one bit of
        // characterisation the drawing gets to do on its own.
        const yours = rr < 3;
        windows.push({
          x: x + (c + 0.5) * (w / cols) - ww / 2,
          y: y + (rr + 0.5) * (h / rows) - wh / 2,
          w: ww, h: wh,
          lit: yours || n < sky.lamps * 0.55,
        });
      }
    }
    blocks.push({
      id: spire.id, x, y, w, h,
      fill: darken(def.hue, sky.shade * 0.9),
      windows, roof: mastFor(x + w / 2, y, 1.4 + spire.level * 0.12),
      scaffold: spire.built !== undefined && opts.week - spire.built < 3,
      smoke: 0, vacant: false, ring: 0,
      label: def.name, level: spire.level, condition: spire.condition,
    });
  }

  // The ground each ring stands on, drawn back to front under the blocks. Without these the far
  // rings float, which is exactly what an empty city looked like on the first pass.
  const terraces = [3, 2, 1].map((ring) => {
    const depth = (ring - 1) / 2;
    return { y: GROUND - depth * 34, fill: mix(sky.ground, sky.haze, 0.45 - depth * 0.12) };
  });

  // THE CAMERA. Frame what is actually there rather than a fixed rectangle: at week one the city
  // is a spire and some hoardings and wants a close crop; two years later it is a wall of towers
  // and wants the whole canvas. A fixed frame forces one of those two to look wrong, and the
  // version before this one solved it by scaling the city down, which made a fully built city
  // read as SHORTER than a half-built one.
  // Headroom is measured from the mast, not the roof: the spire's aerial is 34 units per unit of
  // mast scale above its own top, and clamping the frame at zero sheared it off on a tall spire.
  // The frame is allowed above the canvas; the view paints sky over whatever it opens up.
  const mastRoom = spire ? 40 + spire.level * 14 : 40;
  const top = Math.min(...blocks.map((b) => b.y), GROUND - 120) - mastRoom;
  const viewBox = `0 ${Math.round(top)} ${SKY_W} ${Math.round(SKY_H - top)}`;

  return { blocks, sky, horizon: GROUND, terraces, viewBox };
}

/** Rooftop clutter, as one path string per block. Cheap, and it is most of what stops a skyline
 *  reading as a bar chart. */
function roofFor(kind: string, seed: number, x: number, y: number, w: number, scale: number): string {
  const n = (i: number) => noise(seed, 40 + i);
  const s = scale;
  switch (kind) {
    case "industrial": {
      const cx = x + w * (0.25 + n(1) * 0.5);
      return `M${cx - 4 * s} ${y} l0 ${-16 * s} l${8 * s} 0 l0 ${16 * s} Z`;
    }
    case "docks":
      return `M${x + w * 0.2} ${y} l0 ${-22 * s} l${w * 0.5} 0`;
    case "barracks":
      return `M${x + w * 0.5} ${y} l0 ${-18 * s} M${x + w * 0.5 - 6 * s} ${y - 18 * s} l${12 * s} 0`;
    case "academy":
    case "civic":
      return `M${x + w * 0.5 - 7 * s} ${y} l${7 * s} ${-13 * s} l${7 * s} ${13 * s} Z`;
    case "commercial":
    case "pleasure":
      return `M${x + w * (0.15 + n(2) * 0.2)} ${y} l0 ${-9 * s} l${w * 0.24} 0 l0 ${9 * s}`;
    default: {
      const cx = x + w * (0.2 + n(3) * 0.6);
      return `M${cx} ${y} l0 ${-7 * s}`;
    }
  }
}

function mastFor(cx: number, y: number, s: number): string {
  return `M${cx} ${y} l0 ${-34 * s} M${cx - 7 * s} ${y - 20 * s} l${14 * s} 0 M${cx - 4 * s} ${y - 28 * s} l${8 * s} 0`;
}

/** Distant towers for the arcologies you have not taken, on the far horizon behind everything. */
export function neighbourSilhouettes(
  neighbours: { id: string; name: string; direction: string; prosperity: number; attitude: number }[],
  sky: SkyPalette,
): { x: number; y: number; w: number; h: number; fill: string; name: string; hostile: boolean }[] {
  const slots = [0.1, 0.28, 0.72, 0.9];
  return neighbours.slice(0, 4).map((n, i) => {
    const h = 40 + n.prosperity * 0.55;
    const w = 26 + n.prosperity * 0.11;
    return {
      x: SKY_W * slots[i % slots.length] - w / 2,
      y: GROUND - 60 - h,
      w, h,
      fill: mix(sky.haze, sky.top, 0.45),
      name: n.name,
      hostile: n.attitude < -40,
    };
  });
}
