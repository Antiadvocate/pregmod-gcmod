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
 * Front elevation with a shallow oblique side, not isometric. Isometric looks better in a
 * screenshot and is much worse to read at a glance on a phone: overlapping roofs hide exactly the
 * thing the player is trying to check. A horizon of blocks sorted back-to-front by ring keeps every
 * district legible at 390pt; the side and top faces give each block a volume without letting it
 * cover its neighbour.
 *
 * EVERY KIND HAS ITS OWN SILHOUETTE. A works has a sawtooth roof and a chimney, the docks a crane,
 * the arena is a bowl, the power plant a cooling tower, the barracks a wall with a searchlight. You
 * can tell what a block is from its outline before you read a label.
 *
 * THE ARCHITECTURE IS THE CITY'S CULTURE. Whichever revivalist doctrine your citizens have taken
 * furthest decides how the city is dressed: Roman pediments and domes, Egyptian battered walls and
 * obelisks, Edo eaves, Aztec steps, and so on. The more of the city believes it, the more of the
 * skyline wears it.
 *
 * Everything is deterministic. Window patterns, aerial masts, rooftop clutter and the position of
 * the birds all come from a hash of the district id, so a block looks the same every frame and the
 * same across sessions, without any of it being stored.
 *
 * Depth comes from three things and no gradients on the buildings themselves: rings further back
 * are smaller, desaturated toward the sky colour, and drawn first.
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

/* ── architecture ──────────────────────────────────────────────────────────────────────────── */

export type Style = "modern" | "roman" | "neo_imperial" | "egyptian" | "edo" | "arabian" | "chinese" | "aztec" | "antebellum";

/** What each revival looks like on the horizon. `stone` is mixed into every facade, `trim` draws
 *  the ornament, and `note` is the one line the City screen shows under the skyline. */
export const STYLES: Record<Style, { name: string; note: string; stone: string; trim: string }> = {
  modern:       { name: "Arcology modern", note: "Glass, steel and aerials. No doctrine has claimed the skyline yet.", stone: "#6b7280", trim: "#9aa3ad" },
  roman:        { name: "Roman", note: "Marble fronts, pediments, columns and domes.", stone: "#cbbd9f", trim: "#efe4cc" },
  neo_imperial: { name: "Neo-Imperial", note: "Dark stone, pointed spires and banners on every roof.", stone: "#4f5461", trim: "#b8a36a" },
  egyptian:     { name: "Egyptian", note: "Sandstone walls that lean inward, gilded capstones and obelisks.", stone: "#c4a56b", trim: "#e7c96a" },
  edo:          { name: "Edo", note: "Dark timber and stacked, curving eaves.", stone: "#6d5a48", trim: "#8a6a4c" },
  arabian:      { name: "Arabian", note: "White plaster, onion domes and minarets.", stone: "#d6c7a6", trim: "#5aa39b" },
  chinese:      { name: "Chinese", note: "Red columns and roofs that turn up at the corners.", stone: "#8f4a3c", trim: "#d9a441" },
  aztec:        { name: "Aztec", note: "Stepped stone crowns and temple boxes on every roof.", stone: "#9a7c58", trim: "#4f8a6e" },
  antebellum:   { name: "Antebellum", note: "White porticoes and columns across every front.", stone: "#dcd6c8", trim: "#f5f1e6" },
};

/**
 * The style whose doctrine the city has taken furthest, and how far. Below a quarter of the city
 * nothing shows; past that the dressing strengthens with adoption, so the skyline changes as the
 * culture does rather than on the day a doctrine is declared.
 */
export function styleOf(doctrines: Record<string, { adoption: number }> | undefined): { style: Style; strength: number } {
  let best: Style = "modern", top = 0;
  for (const [id, st] of Object.entries(doctrines ?? {})) {
    if (id in STYLES && id !== "modern" && st.adoption > top) { best = id as Style; top = st.adoption; }
  }
  if (top < 25) return { style: "modern", strength: 0 };
  return { style: best, strength: Math.min(1, (top - 25) / 50 + 0.35) };
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

/** How a detail moves, if it does. The view reads this and nothing else. */
export type Anim = "neon" | "sweep" | "swing" | "sway" | "blink" | "ticker" | "steam";

/** One extra shape on a block: an ornament, a sign, a crane arm. `ox`/`oy` is the pivot for
 *  anything that rotates; `p` is a phase so two neighbours never move in step. */
export interface Detail {
  d: string;
  fill?: string; stroke?: string; sw?: number; op?: number;
  anim?: Anim; ox?: number; oy?: number; p?: number;
  /** Drawn only when it is dark enough to need lights. */
  night?: boolean;
  dash?: string;
}

export interface BlockShape {
  id: string;
  /** Screen rect: the footprint the label, tap target and selection box use. */
  x: number; y: number; w: number; h: number;
  fill: string;
  /** The outline, when it is not a plain box. Windows are clipped to it. */
  body?: string;
  /** The oblique side and top faces, for boxy blocks. */
  side?: string; top?: string; sideFill?: string; topFill?: string;
  /** Lit windows as flat rects. Kept as data so the view can animate a few of them. */
  windows: { x: number; y: number; w: number; h: number; lit: boolean }[];
  /** Rooftop clutter — masts, tanks, the aerial farm. */
  roof: string;
  /** Kind silhouette parts and architectural dressing, in drawing order. */
  details: Detail[];
  /** Scaffolding, drawn on anything built in the last few weeks or anything falling apart. */
  scaffold: boolean;
  /** Smoke, for works and for anything genuinely on fire. */
  smoke: number;
  /** Where the smoke leaves the building. */
  smokeAt?: { x: number; y: number };
  vacant: boolean;
  ring: number;
  label: string;
  level: number;
  condition: number;
}

const f = (n: number) => Math.round(n * 10) / 10;

/**
 * The kind's own outline and parts. Returns a body path for anything that is not a box, the
 * details that make it read as what it is, how dense its windows are, and whether it is boxy
 * enough to take a side face.
 */
function silhouette(kind: string, x: number, y: number, w: number, h: number, s: number, seed: number, fill: string, lamps: number): {
  body?: string; details: Detail[]; windows: "grid" | "sparse" | "dense" | "none"; boxy: boolean; smokeAt?: { x: number; y: number };
} {
  const n = (i: number) => noise(seed, 60 + i);
  const dk = darken(fill, 0.7), lt = mix(fill, "#ffffff", 0.18);
  const details: Detail[] = [];
  switch (kind) {
    case "residential": {
      // Balconies: a thin ledge every other floor.
      const rows = Math.max(2, Math.round(h / (22 * s)));
      for (let i = 1; i < rows; i++) details.push({ d: `M${f(x)} ${f(y + (h / rows) * i)} h${f(w)}`, stroke: dk, sw: 1.4 * s });
      return { details, windows: "grid", boxy: true };
    }
    case "commercial": {
      // A striped awning along the street and a lit sign on the roof.
      details.push({ d: `M${f(x - 2 * s)} ${f(y + h - 14 * s)} h${f(w + 4 * s)} l${f(-3 * s)} ${f(6 * s)} h${f(-(w - 2 * s))} Z`, fill: mix(fill, "#c9a227", 0.45) });
      const sw = w * 0.5;
      details.push({ d: `M${f(x + (w - sw) / 2)} ${f(y - 11 * s)} h${f(sw)} v${f(8 * s)} h${f(-sw)} Z`, fill: "#ffcf7a", op: 0.9, anim: "neon", p: n(1) });
      return { details, windows: "grid", boxy: true };
    }
    case "industrial": {
      // Sawtooth roof, and a stack the smoke comes out of.
      const teeth = Math.max(2, Math.round(w / (16 * s)));
      const tw = w / teeth, th = 8 * s;
      let d = `M${f(x)} ${f(y + h)} V${f(y + th)}`;
      for (let i = 0; i < teeth; i++) d += ` L${f(x + tw * i + tw * 0.8)} ${f(y)} V${f(y + th)} L${f(x + tw * (i + 1))} ${f(y + th)}`;
      d += ` V${f(y + h)} Z`;
      const cx = x + w * (0.62 + n(2) * 0.2), ch = 30 * s + h * 0.2;
      details.push({ d: `M${f(cx)} ${f(y + th)} v${f(-ch)} h${f(6 * s)} v${f(ch)} Z`, fill: dk });
      details.push({ d: `M${f(cx)} ${f(y + th - ch + 4 * s)} h${f(6 * s)}`, stroke: "#c9533f", sw: 2 * s, op: 0.8 });
      return { body: d, details, windows: "sparse", boxy: false, smokeAt: { x: cx + 3 * s, y: y + th - ch } };
    }
    case "civic": {
      // A colonnade across the ground floor, steps under it.
      const cols = Math.max(3, Math.round(w / (10 * s)));
      for (let i = 0; i <= cols; i++) details.push({ d: `M${f(x + (w / cols) * i)} ${f(y + h)} v${f(-h * 0.38)}`, stroke: lt, sw: 2.2 * s, op: 0.8 });
      details.push({ d: `M${f(x - 3 * s)} ${f(y + h - h * 0.38)} h${f(w + 6 * s)}`, stroke: lt, sw: 2 * s });
      return { details, windows: "sparse", boxy: true };
    }
    case "docks": {
      // Low sheds, a stack of containers, and a crane that swings.
      const mx = x + w * 0.78, top = y - 44 * s;
      details.push({ d: `M${f(mx)} ${f(y)} V${f(top)}`, stroke: "#c9a15c", sw: 2.4 * s });
      details.push({ d: `M${f(mx + 10 * s)} ${f(top)} H${f(mx - 58 * s)} M${f(mx - 44 * s)} ${f(top)} v${f(18 * s)} M${f(mx)} ${f(top)} L${f(mx - 20 * s)} ${f(top + 12 * s)}`, stroke: "#c9a15c", sw: 1.8 * s, anim: "swing", ox: mx, oy: top, p: n(3) });
      const colours = ["#7a4a3a", "#3f5f6f", "#6f6a3a", "#4a6a4a"];
      for (let i = 0; i < 4; i++) details.push({ d: `M${f(x + 4 * s + i * 11 * s)} ${f(y - (i % 2 ? 14 : 7) * s)} h${f(10 * s)} v${f((i % 2 ? 14 : 7) * s)} h${f(-10 * s)} Z`, fill: colours[(seed + i) % 4] });
      return { details, windows: "sparse", boxy: true };
    }
    case "academy": {
      // A clock tower in the middle.
      const tw = w * 0.22, tx = x + (w - tw) / 2, th = 30 * s;
      details.push({ d: `M${f(tx)} ${f(y)} v${f(-th)} h${f(tw)} v${f(th)} Z`, fill });
      details.push({ d: `M${f(tx - 2 * s)} ${f(y - th)} L${f(tx + tw / 2)} ${f(y - th - 14 * s)} L${f(tx + tw + 2 * s)} ${f(y - th)} Z`, fill: dk });
      details.push({ d: `M${f(tx + tw / 2 + 4 * s)} ${f(y - th / 2)} a${f(4 * s)} ${f(4 * s)} 0 1 0 ${f(-8 * s)} 0 a${f(4 * s)} ${f(4 * s)} 0 1 0 ${f(8 * s)} 0`, fill: "#efe0b8", op: 0.85 });
      return { details, windows: "grid", boxy: true };
    }
    case "barracks": {
      // A curtain wall with merlons, and a searchlight that sweeps at night.
      const m = Math.max(3, Math.round(w / (9 * s))), mw = w / m;
      let d = `M${f(x)} ${f(y + h)} V${f(y)}`;
      for (let i = 0; i < m; i++) d += ` h${f(mw / 2)} v${f(5 * s)} h${f(mw / 2)} v${f(-5 * s)}`;
      d += ` V${f(y + h)} Z`;
      const lx = x + w * 0.8, ly = y - 6 * s;
      details.push({ d: `M${f(lx - 3 * s)} ${f(y)} v${f(-6 * s)} h${f(6 * s)} v${f(6 * s)} Z`, fill: dk });
      details.push({ d: `M${f(lx)} ${f(ly)} L${f(lx - 26 * s)} ${f(ly - 150 * s)} L${f(lx + 26 * s)} ${f(ly - 150 * s)} Z`, fill: "#f4ecd0", op: 0.1, anim: "sweep", ox: lx, oy: ly, p: n(4), night: true });
      return { body: d, details, windows: "sparse", boxy: false };
    }
    case "pleasure": {
      // A vertical neon blade down one corner, and a heart on the roof.
      const bx = x + w - 7 * s;
      details.push({ d: `M${f(bx)} ${f(y + 6 * s)} h${f(5 * s)} v${f(h * 0.6)} h${f(-5 * s)} Z`, fill: "#ff5fa2", anim: "neon", p: n(5) });
      const hx = x + w * 0.35, hy = y - 8 * s, r = 4 * s;
      details.push({ d: `M${f(hx)} ${f(hy + r * 1.4)} l${f(-r * 1.5)} ${f(-r * 1.5)} a${f(r * 0.8)} ${f(r * 0.8)} 0 0 1 ${f(r * 1.5)} ${f(-r * 0.6)} a${f(r * 0.8)} ${f(r * 0.8)} 0 0 1 ${f(r * 1.5)} ${f(r * 0.6)} Z`, fill: "#ff7ab8", anim: "neon", p: n(6) });
      return { details, windows: "grid", boxy: true };
    }
    case "arena": {
      // A bowl, arched openings in tiers, floodlight masts at either end.
      const body = `M${f(x)} ${f(y + h)} L${f(x + w * 0.05)} ${f(y + h * 0.18)} Q${f(x + w / 2)} ${f(y - h * 0.1)} ${f(x + w * 0.95)} ${f(y + h * 0.18)} L${f(x + w)} ${f(y + h)} Z`;
      const tiers = Math.max(2, Math.round(h / (16 * s)));
      for (let t = 0; t < tiers; t++) {
        const ty = y + h * 0.3 + (h * 0.62 / tiers) * t, arches = Math.max(4, Math.round(w / (9 * s)));
        for (let a = 0; a < arches; a++) {
          const ax = x + w * 0.08 + (w * 0.84 / arches) * (a + 0.2), aw = (w * 0.84 / arches) * 0.6, ah = h * 0.4 / tiers;
          details.push({ d: `M${f(ax)} ${f(ty + ah)} v${f(-ah * 0.6)} a${f(aw / 2)} ${f(aw / 2)} 0 0 1 ${f(aw)} 0 v${f(ah * 0.6)} Z`, fill: lamps > 0.3 ? "#ffd9a0" : dk, op: lamps > 0.3 ? 0.55 : 0.8 });
        }
      }
      for (const px of [x + w * 0.06, x + w * 0.94]) {
        details.push({ d: `M${f(px)} ${f(y + h * 0.2)} v${f(-34 * s)}`, stroke: dk, sw: 1.6 * s });
        details.push({ d: `M${f(px - 4 * s)} ${f(y + h * 0.2 - 36 * s)} h${f(8 * s)} v${f(3 * s)} h${f(-8 * s)} Z`, fill: "#fff4d6", anim: "blink", p: px / 100, night: true });
      }
      return { body, details, windows: "none", boxy: false };
    }
    case "clinic": {
      // A tall tower with a lit cross, and a helipad with its beacon.
      const cx = x + w / 2, cy = y + h * 0.18, c = 5 * s;
      details.push({ d: `M${f(cx - c / 3)} ${f(cy - c)} h${f(c * 2 / 3)} v${f(c * 2 / 3)} h${f(c * 2 / 3)} v${f(c * 2 / 3)} h${f(-c * 2 / 3)} v${f(c * 2 / 3)} h${f(-c * 2 / 3)} v${f(-c * 2 / 3)} h${f(-c * 2 / 3)} v${f(-c * 2 / 3)} h${f(c * 2 / 3)} Z`, fill: "#7fd3a8", op: 0.95 });
      details.push({ d: `M${f(x + w * 0.1)} ${f(y - 3 * s)} h${f(w * 0.8)}`, stroke: lt, sw: 2 * s });
      details.push({ d: `M${f(x + w * 0.85)} ${f(y - 6 * s)} a${f(2 * s)} ${f(2 * s)} 0 1 0 0.1 0`, stroke: "#e0574a", sw: 3 * s, anim: "blink", p: n(7) });
      return { details, windows: "dense", boxy: true };
    }
    case "garden": {
      // Three terraces, each narrower, with trees along every edge that move in the wind.
      const th = h / 3;
      const d = `M${f(x)} ${f(y + h)} V${f(y + h - th)} H${f(x + w * 0.12)} V${f(y + h - th * 2)} H${f(x + w * 0.24)} V${f(y)} H${f(x + w * 0.76)} V${f(y + h - th * 2)} H${f(x + w * 0.88)} V${f(y + h - th)} H${f(x + w)} V${f(y + h)} Z`;
      const edges = [[x, x + w * 0.12, y + h - th], [x + w * 0.12, x + w * 0.24, y + h - th * 2], [x + w * 0.24, x + w * 0.76, y], [x + w * 0.76, x + w * 0.88, y + h - th * 2], [x + w * 0.88, x + w, y + h - th]];
      edges.forEach(([a, b, ey], i) => {
        const count = Math.max(1, Math.round((b - a) / (9 * s)));
        for (let k = 0; k < count; k++) {
          const tx = a + ((b - a) / count) * (k + 0.5), r = (3.2 + noise(seed, i * 9 + k) * 2) * s;
          details.push({ d: `M${f(tx)} ${f(ey)} v${f(-r)} m${f(-r)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(r * 2)} 0 a${f(r)} ${f(r)} 0 1 0 ${f(-r * 2)} 0`, fill: mix("#4f7a45", "#7aa05a", noise(seed, i * 5 + k)), anim: "sway", ox: tx, oy: ey, p: noise(seed, i + k * 3) });
        }
      });
      return { body: d, details, windows: "sparse", boxy: false };
    }
    case "temple": {
      // A hall with a dome and a finial; the style layer swaps the dome for its own crown.
      const bh = h * 0.62, r = Math.min(w * 0.36, h * 0.38);
      const body = `M${f(x)} ${f(y + h)} V${f(y + h - bh)} H${f(x + w / 2 - r)} A${f(r)} ${f(r)} 0 0 1 ${f(x + w / 2 + r)} ${f(y + h - bh)} H${f(x + w)} V${f(y + h)} Z`;
      details.push({ d: `M${f(x + w / 2)} ${f(y + h - bh - r)} v${f(-12 * s)}`, stroke: "#e7c96a", sw: 1.8 * s });
      const dw = w * 0.16;
      details.push({ d: `M${f(x + w / 2 - dw / 2)} ${f(y + h)} v${f(-bh * 0.45)} a${f(dw / 2)} ${f(dw / 2)} 0 0 1 ${f(dw)} 0 v${f(bh * 0.45)} Z`, fill: lamps > 0.3 ? "#ffcf80" : dk, op: 0.85 });
      return { body, details, windows: "none", boxy: false };
    }
    case "exchange": {
      // A glass blade with a raked top and a ticker running round it.
      const body = `M${f(x)} ${f(y + h)} V${f(y + 16 * s)} L${f(x + w)} ${f(y)} V${f(y + h)} Z`;
      const ty = y + h * 0.28;
      details.push({ d: `M${f(x)} ${f(ty)} h${f(w)}`, stroke: "#0b0d11", sw: 5 * s });
      details.push({ d: `M${f(x)} ${f(ty)} h${f(w)}`, stroke: "#7fd39a", sw: 2.4 * s, dash: `${f(5 * s)} ${f(3 * s)}`, anim: "ticker", p: n(8) });
      details.push({ d: `M${f(x + w)} ${f(y)} v${f(-26 * s)}`, stroke: lt, sw: 1.4 * s });
      details.push({ d: `M${f(x + w)} ${f(y - 27 * s)} a${f(1.6 * s)} ${f(1.6 * s)} 0 1 0 0.1 0`, stroke: "#e0574a", sw: 3 * s, anim: "blink", p: n(9) });
      return { body, details, windows: "dense", boxy: false };
    }
    case "dairy": {
      // A long barn with a gable, and silos beside it.
      const bw = w * 0.66, gh = 12 * s;
      const body = `M${f(x)} ${f(y + h)} V${f(y + gh)} L${f(x + bw / 2)} ${f(y)} L${f(x + bw)} ${f(y + gh)} V${f(y + h)} Z`;
      const sr = (w - bw) / 2 - 1.5 * s;
      for (let i = 0; i < 2; i++) {
        const sx = x + bw + 2 * s + i * (sr + 1.5 * s), sh = h * (0.95 + i * 0.25);
        details.push({ d: `M${f(sx)} ${f(y + h)} v${f(-sh)} a${f(sr / 2)} ${f(sr / 2)} 0 0 1 ${f(sr)} 0 v${f(sh)} Z`, fill: i ? lt : mix(fill, "#d8d0bc", 0.35) });
        details.push({ d: `M${f(sx)} ${f(y + h - sh * 0.5)} h${f(sr)} M${f(sx)} ${f(y + h - sh * 0.75)} h${f(sr)}`, stroke: dk, sw: 1 * s });
      }
      return { body, details, windows: "sparse", boxy: false };
    }
    case "power": {
      // A cooling tower's waist, steam off the top, and aircraft lights.
      const body = `M${f(x + w * 0.08)} ${f(y + h)} C${f(x + w * 0.28)} ${f(y + h * 0.55)} ${f(x + w * 0.3)} ${f(y + h * 0.3)} ${f(x + w * 0.18)} ${f(y)} L${f(x + w * 0.82)} ${f(y)} C${f(x + w * 0.7)} ${f(y + h * 0.3)} ${f(x + w * 0.72)} ${f(y + h * 0.55)} ${f(x + w * 0.92)} ${f(y + h)} Z`;
      details.push({ d: `M${f(x + w * 0.2)} ${f(y + h * 0.35)} Q${f(x + w / 2)} ${f(y + h * 0.4)} ${f(x + w * 0.8)} ${f(y + h * 0.35)}`, stroke: dk, sw: 1.2 * s, fill: "none" });
      details.push({ d: `M${f(x + w * 0.26)} ${f(y + 3 * s)} a${f(1.5 * s)} ${f(1.5 * s)} 0 1 0 0.1 0 M${f(x + w * 0.74)} ${f(y + 3 * s)} a${f(1.5 * s)} ${f(1.5 * s)} 0 1 0 0.1 0`, stroke: "#e0574a", sw: 2.6 * s, anim: "blink", p: n(10) });
      return { body, details, windows: "none", boxy: false, smokeAt: { x: x + w / 2, y } };
    }
    default:
      return { details, windows: "grid", boxy: true };
  }
}

/** Kinds whose own outline IS the architecture; the style layer leaves their silhouette alone. */
const OWN_SHAPE = new Set(["industrial", "barracks", "arena", "garden", "exchange", "dairy", "power"]);

/**
 * The revival's dressing on a boxy block: a crown on the roof and, on the lower floors, the
 * columns or battered walls the style is known for. Strength decides how many blocks wear it.
 */
function dressing(style: Style, kind: string, x: number, y: number, w: number, h: number, s: number, seed: number, fill: string, crownOnly = false): { details: Detail[]; body?: string } {
  const t = STYLES[style].trim, dk = darken(fill, 0.62);
  const out: Detail[] = [];
  const cx = x + w / 2;
  const colonnade = (count: number, height: number, colour = t) => {
    if (crownOnly) return;
    for (let i = 0; i <= count; i++) out.push({ d: `M${f(x + (w / count) * i)} ${f(y + h)} v${f(-height)}`, stroke: colour, sw: 2 * s, op: 0.85 });
    out.push({ d: `M${f(x - 2 * s)} ${f(y + h - height)} h${f(w + 4 * s)}`, stroke: colour, sw: 2.4 * s });
  };
  switch (style) {
    case "roman": {
      out.push({ d: `M${f(x - 3 * s)} ${f(y)} L${f(cx)} ${f(y - 13 * s)} L${f(x + w + 3 * s)} ${f(y)} Z`, fill: t, op: 0.92 });
      if (kind === "civic" || kind === "academy" || kind === "temple" || noise(seed, 91) > 0.7) {
        const r = w * 0.22;
        out.push({ d: `M${f(cx - r)} ${f(y - 8 * s)} a${f(r)} ${f(r)} 0 0 1 ${f(r * 2)} 0 Z`, fill: mix(t, "#8fa7a0", 0.35) });
      }
      if (kind !== "temple") colonnade(Math.max(3, Math.round(w / (9 * s))), h * 0.3);
      return { details: out };
    }
    case "neo_imperial": {
      for (const px of [x + 2 * s, x + w - 2 * s]) out.push({ d: `M${f(px - 3 * s)} ${f(y)} L${f(px)} ${f(y - 22 * s)} L${f(px + 3 * s)} ${f(y)} Z`, fill: dk });
      out.push({ d: `M${f(cx)} ${f(y)} v${f(-26 * s)}`, stroke: t, sw: 1.2 * s });
      out.push({ d: `M${f(cx)} ${f(y - 26 * s)} h${f(10 * s)} l${f(-3 * s)} ${f(3.5 * s)} l${f(3 * s)} ${f(3.5 * s)} h${f(-10 * s)} Z`, fill: "#8a2f2f", anim: "sway", ox: cx, oy: y - 26 * s, p: noise(seed, 92) });
      if (!crownOnly) out.push({ d: `M${f(x)} ${f(y + 4 * s)} h${f(w)}`, stroke: t, sw: 1.4 * s, op: 0.7 });
      return { details: out };
    }
    case "egyptian": {
      // Battered walls: the whole block leans in toward the top, with a gilded cornice.
      const inset = w * 0.08;
      const body = `M${f(x)} ${f(y + h)} L${f(x + inset)} ${f(y)} H${f(x + w - inset)} L${f(x + w)} ${f(y + h)} Z`;
      out.push({ d: `M${f(x + inset - 2 * s)} ${f(y)} h${f(w - inset * 2 + 4 * s)}`, stroke: t, sw: 3 * s });
      if (noise(seed, 93) > 0.55) out.push({ d: `M${f(cx - 3 * s)} ${f(y)} L${f(cx - 2 * s)} ${f(y - 30 * s)} L${f(cx)} ${f(y - 34 * s)} L${f(cx + 2 * s)} ${f(y - 30 * s)} L${f(cx + 3 * s)} ${f(y)} Z`, fill: mix(fill, t, 0.4) });
      return crownOnly ? { details: out } : { details: out, body };
    }
    case "edo": {
      // Stacked eaves that dip in the middle and lift at the ends.
      const eaves = crownOnly ? 0 : Math.max(2, Math.min(4, Math.round(h / (28 * s))));
      for (let i = 0; i < eaves; i++) {
        const ey = y + (h / eaves) * i, over = 5 * s;
        out.push({ d: `M${f(x - over)} ${f(ey - 2 * s)} Q${f(cx)} ${f(ey + 4 * s)} ${f(x + w + over)} ${f(ey - 2 * s)} L${f(x + w)} ${f(ey + 2 * s)} Q${f(cx)} ${f(ey + 7 * s)} ${f(x)} ${f(ey + 2 * s)} Z`, fill: t });
      }
      out.push({ d: `M${f(x - 6 * s)} ${f(y - 1 * s)} Q${f(cx)} ${f(y - 14 * s)} ${f(x + w + 6 * s)} ${f(y - 1 * s)} Z`, fill: t });
      return { details: out };
    }
    case "arabian": {
      const r = Math.min(w * 0.24, 12 * s);
      out.push({ d: `M${f(cx - r)} ${f(y)} C${f(cx - r * 1.3)} ${f(y - r * 1.2)} ${f(cx - r * 0.2)} ${f(y - r * 1.6)} ${f(cx)} ${f(y - r * 2.3)} C${f(cx + r * 0.2)} ${f(y - r * 1.6)} ${f(cx + r * 1.3)} ${f(y - r * 1.2)} ${f(cx + r)} ${f(y)} Z`, fill: t });
      if (noise(seed, 94) > 0.5) {
        const mx = x + w - 3 * s;
        out.push({ d: `M${f(mx - 2 * s)} ${f(y)} v${f(-28 * s)} h${f(4 * s)} v${f(28 * s)} Z`, fill: mix(fill, "#ffffff", 0.2) });
        out.push({ d: `M${f(mx - 3 * s)} ${f(y - 28 * s)} a${f(3 * s)} ${f(3 * s)} 0 0 1 ${f(6 * s)} 0 Z`, fill: t });
      }
      const arches = crownOnly ? 0 : Math.max(3, Math.round(w / (12 * s)));
      for (let i = 0; i < arches; i++) {
        const aw = (w / arches) * 0.6, ax = x + (w / arches) * (i + 0.2);
        out.push({ d: `M${f(ax)} ${f(y + h)} v${f(-10 * s)} a${f(aw / 2)} ${f(aw / 2)} 0 0 1 ${f(aw)} 0 v${f(10 * s)} Z`, fill: dk, op: 0.8 });
      }
      return { details: out };
    }
    case "chinese": {
      const over = 7 * s;
      out.push({ d: `M${f(x - over)} ${f(y - 8 * s)} Q${f(x + w * 0.2)} ${f(y - 2 * s)} ${f(cx)} ${f(y - 4 * s)} Q${f(x + w * 0.8)} ${f(y - 2 * s)} ${f(x + w + over)} ${f(y - 8 * s)} L${f(x + w)} ${f(y)} H${f(x)} Z`, fill: t });
      out.push({ d: `M${f(x + w * 0.2)} ${f(y - 4 * s)} Q${f(cx)} ${f(y - 14 * s)} ${f(x + w * 0.8)} ${f(y - 4 * s)} Z`, fill: t });
      colonnade(Math.max(3, Math.round(w / (11 * s))), h * 0.22, "#b0392c");
      return { details: out };
    }
    case "aztec": {
      // Three steps and a temple box on top.
      const st = 5 * s;
      let top = y;
      for (let i = 0; i < 3; i++) {
        const inset = w * 0.1 * (i + 1);
        out.push({ d: `M${f(x + inset)} ${f(top)} v${f(-st)} h${f(w - inset * 2)} v${f(st)} Z`, fill: mix(fill, "#ffffff", 0.06 * (i + 1)) });
        top -= st;
      }
      out.push({ d: `M${f(cx - w * 0.12)} ${f(top)} v${f(-9 * s)} h${f(w * 0.24)} v${f(9 * s)} Z`, fill: t });
      if (!crownOnly) out.push({ d: `M${f(x)} ${f(y + h * 0.5)} h${f(w)}`, stroke: t, sw: 2 * s, op: 0.6, dash: `${f(4 * s)} ${f(3 * s)}` });
      return { details: out };
    }
    case "antebellum": {
      out.push({ d: `M${f(x - 2 * s)} ${f(y)} L${f(cx)} ${f(y - 9 * s)} L${f(x + w + 2 * s)} ${f(y)} Z`, fill: t });
      colonnade(Math.max(3, Math.round(w / (10 * s))), h * 0.5);
      if (!crownOnly) out.push({ d: `M${f(x - 2 * s)} ${f(y + h * 0.5 - 6 * s)} h${f(w + 4 * s)}`, stroke: t, sw: 1.4 * s, op: 0.8 });
      return { details: out };
    }
    default:
      return { details: out };
  }
}

/**
 * Lay the whole city out.
 *
 * Rings are drawn back to front, each ring narrower and higher on the canvas than the one in front,
 * which is the only perspective cue the drawing needs. The spire is placed last and centred, so it
 * sits in front of everything and reads as the thing the city is arranged around.
 */
export function layout(districts: District[], opts: { week: number; crime: number; population: number; hour: Hour; style?: Style; strength?: number }): {
  blocks: BlockShape[]; sky: SkyPalette; horizon: number; terraces: { y: number; fill: string }[];
  /** Tight around the content, with headroom. Grows as the city does. */
  viewBox: string;
} {
  const sky = SKIES[opts.hour];
  const style = opts.style ?? "modern";
  const strength = style === "modern" ? 0 : opts.strength ?? 0.6;
  const blocks: BlockShape[] = [];
  const spire = districts.find((d) => d.kind === "spire");

  /**
   * ONE SCALE FOR THE WHOLE SCENE, computed before anything is placed.
   *
   * Districts are never scaled down — a city that grows has to LOOK like it grew. Only the spire is
   * clamped, to the headroom its mast needs, so it stays both in frame and the tallest thing on the
   * horizon.
   */
  const spireRaw = spire ? 190 + spire.level * 52 : 0;
  const tallestDistrict = Math.max(1, ...districts.map((d) => {
    if (d.kind === "vacant" || !d.level) return 0;
    const def = DISTRICT_BY_KIND[d.kind];
    return def ? (56 + def.bulk * d.level * 118) * (1 - ((d.ring - 1) / 2) * 0.36) : 0;
  }));
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
      const w = slotW * (0.62 + noise(seed, 1) * 0.18);
      const x = margin + i * slotW + (slotW - w) / 2;

      if (!def || !d.level) {
        // A hoarding on the ground: the player has to be able to see where there is room.
        blocks.push({
          id: d.id, x, y: baseline - 16 * scale, w, h: 16 * scale,
          fill: mix(sky.haze, "#2a2b30", 0.5 - depth * 0.25),
          windows: [], roof: "", details: [], scaffold: false, smoke: 0, vacant: true, ring,
          label: "vacant", level: 0, condition: 0,
        });
        return;
      }

      const h = (56 + def.bulk * d.level * 118) * scale;
      const y = baseline - h;
      const keep = d.condition / 100;
      // Colour: the kind's own hue, pulled toward the revival's stone, darkened by the hour, hazed
      // toward the sky by distance, and drained toward grey as it falls apart.
      const dressed = strength > 0 && !OWN_SHAPE.has(d.kind) && noise(seed, 90) < strength + 0.15;
      let fill = strength > 0 ? mix(def.hue, STYLES[style].stone, strength * (dressed ? 0.6 : 0.3)) : def.hue;
      fill = darken(fill, sky.shade * (0.62 + keep * 0.38));
      fill = mix(fill, sky.haze, depth * 0.5);

      const sil = silhouette(d.kind, x, y, w, h, scale, seed, fill, sky.lamps);
      const dress = dressed ? dressing(style, d.kind, x, y, w, h, scale, seed, fill) : { details: [] as Detail[] };
      const body = sil.body ?? dress.body;
      const boxy = sil.boxy && !dress.body;

      // WINDOWS. Rows and columns scaled to the block, lit in proportion to the hour and to how
      // full the city is — a half-empty arcology has half-dark towers, which is the population
      // number made visible without printing it anywhere.
      const windows: BlockShape["windows"] = [];
      if (sil.windows !== "none") {
        const density = sil.windows === "dense" ? 1.35 : sil.windows === "sparse" ? 0.6 : 1;
        const cols = Math.max(2, Math.round((w / (9 + depth * 4)) * density));
        const rows = Math.max(1, Math.round((h / (11 + depth * 4)) * density));
        const occupancy = Math.min(1, opts.population / 3000);
        const ww = w / cols * 0.42, wh = h / rows * 0.34;
        const skip = sil.windows === "sparse" ? 0.55 : 0.86;
        for (let c = 0; c < cols; c++) {
          for (let rr = 0; rr < rows; rr++) {
            const n = noise(seed, c * 31 + rr * 7 + 3);
            if (n > skip) continue;                                  // blank panel
            const lit = n < sky.lamps * (0.35 + occupancy * 0.5) * keep * (sil.windows === "dense" ? 1.2 : 1);
            windows.push({ x: x + (c + 0.5) * (w / cols) - ww / 2, y: y + (rr + 0.5) * (h / rows) - wh / 2, w: ww, h: wh, lit });
          }
        }
      }

      // The oblique faces. A shallow offset up and to the right; it never reaches the next slot.
      const dx = 7 * scale, dy = 4 * scale;
      const side = boxy ? `M${f(x + w)} ${f(y)} l${f(dx)} ${f(-dy)} v${f(h)} l${f(-dx)} ${f(dy)} Z` : undefined;
      const top = boxy ? `M${f(x)} ${f(y)} l${f(dx)} ${f(-dy)} h${f(w)} l${f(-dx)} ${f(dy)} Z` : undefined;

      blocks.push({
        id: d.id, x, y, w, h, fill, body, windows, side, top,
        sideFill: darken(fill, 0.62), topFill: mix(fill, "#ffffff", 0.12),
        roof: dressed ? "" : roofFor(d.kind, seed, x, y, w, scale),
        details: [...sil.details, ...dress.details],
        scaffold: (d.built !== undefined && opts.week - d.built < 3) || d.condition < 30,
        smoke: d.kind === "industrial" ? 0.5 + d.level * 0.1 : d.kind === "power" ? 0.9 + d.level * 0.1 : (opts.crime > 65 && noise(seed, 9) > 0.8 ? 0.4 : 0),
        smokeAt: sil.smokeAt,
        vacant: false, ring,
        label: def.name, level: d.level, condition: d.condition,
      });
    });
  }

  // THE SPIRE, front and centre, and taller than anything by construction.
  if (spire) {
    const def = DISTRICT_BY_KIND.spire;
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
        // The top three floors are yours and they are always lit.
        const yours = rr < 3;
        windows.push({ x: x + (c + 0.5) * (w / cols) - ww / 2, y: y + (rr + 0.5) * (h / rows) - wh / 2, w: ww, h: wh, lit: yours || n < sky.lamps * 0.55 });
      }
    }
    let fill = strength > 0 ? mix(def.hue, STYLES[style].stone, strength * 0.5) : def.hue;
    fill = darken(fill, sky.shade * 0.9);
    // Setbacks: the spire steps in twice on its way up, so it reads as a tower rather than a slab.
    const setbacks: Detail[] = [0.35, 0.62].map((t) => ({ d: `M${f(x)} ${f(y + h * t)} h${f(w)}`, stroke: darken(fill, 0.55), sw: 3 }));
    const crown = strength > 0 ? dressing(style, "spire", x, y, w, h, 1.4, seed, fill, true) : { details: [] as Detail[] };
    const dx = 10, dy = 6;
    blocks.push({
      id: spire.id, x, y, w, h, fill, windows,
      side: `M${f(x + w)} ${f(y)} l${dx} ${-dy} v${f(h)} l${-dx} ${dy} Z`,
      top: `M${f(x)} ${f(y)} l${dx} ${-dy} h${f(w)} l${-dx} ${dy} Z`,
      sideFill: darken(fill, 0.6), topFill: mix(fill, "#ffffff", 0.14),
      roof: mastFor(x + w / 2, y, 1.4 + spire.level * 0.12),
      details: [...setbacks, ...crown.details],
      scaffold: spire.built !== undefined && opts.week - spire.built < 3,
      smoke: 0, vacant: false, ring: 0,
      label: def.name, level: spire.level, condition: spire.condition,
    });
  }

  // The ground each ring stands on, drawn back to front under the blocks.
  const terraces = [3, 2, 1].map((ring) => {
    const depth = (ring - 1) / 2;
    return { y: GROUND - depth * 34, fill: mix(sky.ground, sky.haze, 0.45 - depth * 0.12) };
  });

  // THE CAMERA. Frame what is actually there rather than a fixed rectangle. Headroom is measured
  // from the mast, not the roof, and the frame is allowed above the canvas.
  const mastRoom = spire ? 40 + spire.level * 14 : 40;
  const top = Math.min(...blocks.map((b) => b.y), GROUND - 120) - mastRoom;
  const viewBox = `0 ${Math.round(top)} ${SKY_W} ${Math.round(SKY_H - top)}`;

  return { blocks, sky, horizon: GROUND, terraces, viewBox };
}

/** Rooftop clutter, as one path string per block, for blocks the revival has not dressed. */
function roofFor(kind: string, seed: number, x: number, y: number, w: number, scale: number): string {
  const n = (i: number) => noise(seed, 40 + i);
  const s = scale;
  switch (kind) {
    case "industrial": case "docks": case "barracks": case "arena": case "garden":
    case "exchange": case "dairy": case "power": case "temple": case "clinic": case "academy": case "pleasure": case "commercial":
      return "";
    case "civic":
      return `M${x + w * 0.5 - 7 * s} ${y} l${7 * s} ${-13 * s} l${7 * s} ${13 * s} Z`;
    default: {
      const cx = x + w * (0.2 + n(3) * 0.6);
      return `M${cx} ${y} l0 ${-7 * s} M${cx + w * 0.3} ${y} l0 ${-4 * s} l${6 * s} 0 l0 ${4 * s}`;
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
