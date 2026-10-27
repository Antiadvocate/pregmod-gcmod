/**
 * THE CITY FROM ABOVE — isometric geometry, eras and finishes.
 *
 * The skyline (lib/cityart) is the city from the water: a front you read at a glance. This is the
 * other view, from a helicopter: the platform the arcology stands on, out in what is left of the
 * world, with every district on it as a building you can tap, the sprawl around it as large as its
 * population, the ruins of the Old World past the sprawl, and people on the roads.
 *
 * Every building has an ERA, which is how far the world has come back on that plot:
 *   ruin        the Old World's, broken and empty: vacant ground, and the wastes outside
 *   salvage     built from what the Collapse left: containers, sheet metal, tarps, patches
 *   freecity    concrete and glass, dressed in whatever the culture believes
 *   ascendant   what nobody else on earth can build any more: glass, light, holograms
 * The era comes from the plot's level and condition, your tech, and the finish you've chosen.
 */
import type { District, CityState } from "../engine/city";
import type { Style } from "./cityart";

export type Era = "ruin" | "salvage" | "freecity" | "ascendant";
export type Finish = "grit" | "rebuilt" | "gleaming";

export const FINISHES: Record<Finish, { name: string; note: string }> = {
  grit: { name: "Wasteland grit", note: "Leave the scars showing, so salvage, patches and rust stay longer." },
  rebuilt: { name: "Rebuilt", note: "Each block looks as well as it's kept." },
  gleaming: { name: "Gleaming", note: "Tear the salvage down and build in glass as soon as you can." },
};

export interface Look { style?: Style | "auto"; finish?: Finish }
export const lookOf = (c: CityState): Look => c.look ?? {};

export function eraOf(d: District, finish: Finish, tech: number): Era {
  if (d.kind === "vacant") return "ruin";
  if (d.kind === "spire") return tech > 0.45 || finish === "gleaming" ? "ascendant" : "freecity";
  const worn = d.condition < (finish === "grit" ? 50 : finish === "gleaming" ? 22 : 35);
  if (worn || (d.level <= 1 && finish === "grit")) return "salvage";
  if (d.level >= 4 || (d.level >= 3 && tech > 0.4) || (finish === "gleaming" && d.level >= 2)) return "ascendant";
  return "freecity";
}

/* ── the projection ──────────────────────────────────────────────────────────────────────────── */

export const VIEW_W = 1000;
export const VIEW_H = 760;
const CX = VIEW_W / 2;
const CY = 450;

export interface Proj { s: number; at: (x: number, y: number, z?: number) => [number, number] }

/** World tiles to screen. +x runs down-right, +y down-left, z is up in screen pixels. */
export function projection(scale: number): Proj {
  return { s: scale, at: (x, y, z = 0) => [CX + (x - y) * scale * 0.866, CY + (x + y) * scale * 0.5 - z] };
}

export const pts = (ps: [number, number][]) => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** The three visible faces of a box. */
export function prism(p: Proj, x: number, y: number, hw: number, hd: number, z0: number, h: number) {
  const a = (dx: number, dy: number, z: number) => p.at(x + dx, y + dy, z);
  return {
    top: pts([a(-hw, -hd, z0 + h), a(hw, -hd, z0 + h), a(hw, hd, z0 + h), a(-hw, hd, z0 + h)]),
    left: pts([a(-hw, hd, z0), a(hw, hd, z0), a(hw, hd, z0 + h), a(-hw, hd, z0 + h)]),
    right: pts([a(hw, -hd, z0), a(hw, hd, z0), a(hw, hd, z0 + h), a(hw, -hd, z0 + h)]),
  };
}

/** A circle on the ground, as a path. */
export function ring(p: Proj, r: number, z = 0, n = 40, cx = 0, cy = 0): string {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const t = (i / n) * Math.PI * 2; out.push(p.at(cx + Math.cos(t) * r, cy + Math.sin(t) * r, z)); }
  return `M${out.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")}Z`;
}

/* ── where each district stands ──────────────────────────────────────────────────────────────── */

export const RING_R = [0, 2.6, 4.7, 6.8];
const RING_HW = [1.2, 0.85, 0.8, 0.72];

export function plotOf(d: District, slots: number): { x: number; y: number; hw: number } {
  if (d.ring === 0) return { x: 0, y: 0, hw: RING_HW[0] };
  const t = (d.slot / slots) * Math.PI * 2 + d.ring * 0.37;
  return { x: Math.cos(t) * RING_R[d.ring], y: Math.sin(t) * RING_R[d.ring], hw: RING_HW[d.ring] };
}

/* ── colour ──────────────────────────────────────────────────────────────────────────────────── */

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** 0–1, the same every time for the same seed and n. */
export const noise = (seed: number, n: number) => { const v = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };

export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (p: number, sh: number) => (p >> sh) & 255;
  const c = (sh: number) => Math.round(ch(pa, sh) + (ch(pb, sh) - ch(pa, sh)) * t);
  return `#${((c(16) << 16) | (c(8) << 8) | c(0)).toString(16).padStart(6, "0")}`;
}
export const shade = (hex: string, f: number) => mix("#000000", hex, Math.max(0, Math.min(1, f)));

/** What the land outside looks like, by the sea the arcology was founded in. */
export function biomeOf(region: string): { ground: string; dust: string; water: string; name: string } {
  if (/baltic/i.test(region)) return { ground: "#5d6366", dust: "#7a8084", water: "#2a3a48", name: "grey tundra" };
  if (/south china/i.test(region)) return { ground: "#4d5c45", dust: "#66745a", water: "#1f3f4a", name: "drowned coast" };
  if (/sahel/i.test(region)) return { ground: "#9a6c43", dust: "#b48354", water: "#2b4652", name: "red sahel" };
  if (/australian|bight/i.test(region)) return { ground: "#8a4b31", dust: "#a5603f", water: "#23465a", name: "red dust" };
  return { ground: "#9b8358", dust: "#b49a6c", water: "#21455a", name: "desert" };
}

export type Hour = "dawn" | "day" | "dusk" | "night";
export const SKY: Record<Hour, { top: string; bottom: string; light: number; lamps: number }> = {
  dawn: { top: "#2e3956", bottom: "#a4785f", light: 0.78, lamps: 0.45 },
  day: { top: "#56739a", bottom: "#b9c3c4", light: 1, lamps: 0.06 },
  dusk: { top: "#242a44", bottom: "#8c5a4d", light: 0.66, lamps: 0.75 },
  night: { top: "#0b0e17", bottom: "#1f2536", light: 0.42, lamps: 1 },
};
