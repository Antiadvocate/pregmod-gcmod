/**
 * WHAT EACH DISTRICT LOOKS LIKE FROM ABOVE.
 *
 * Every district used to be the same box with window stripes, in its own colour, and a small thing
 * on the roof. A player looked at their city and saw a car park of identical cubes. Here each kind
 * is built from what it is for: the works is a sawtooth shed with stacks, the docks are sheds and
 * containers under a crane, the civic hall is a colonnade under a pediment and a dome, the dairy is
 * a red barn with silos, the power plant is cooling towers, the university is a quad round a domed
 * library with a bell tower, the border wall is a gatehouse. Level makes it taller or adds to it;
 * the colour still comes from IsoCity: the district's own hue, the culture's stone, and the era
 * (salvage scrap, Free City, ascendant glass).
 *
 * Everything is drawn back to front by hand inside a plot: what's further from the viewer (smaller
 * x + y) goes in first.
 */
import type { ReactNode } from "react";
import { mix, noise, prism, pts, shade, type Proj } from "../lib/iso";

type V = [number, number];

export interface Kit {
  p: Proj;
  light: number;
  /** 0–1: how many windows are lit. */
  lamps: number;
  win: string;
  base: string;
  seed: number;
  level: number;
  ascendant: boolean;
  out: ReactNode[];
}

let n = 0;
const k = () => `ib${n++}`;
const add = (kit: Kit, node: ReactNode) => { kit.out.push(node); };

/* ── the shapes ─────────────────────────────────────────────────────────────────────────────── */

/** A box with its three visible faces. */
export function block(kit: Kit, x: number, y: number, hw: number, hd: number, z: number, h: number, c: string, opts?: { windows?: number; glass?: boolean }) {
  const f = prism(kit.p, x, y, hw, hd, z, h);
  add(kit, <g key={k()}><polygon points={f.left} fill={shade(c, kit.light * 0.8)} /><polygon points={f.right} fill={shade(c, kit.light * 0.6)} /><polygon points={f.top} fill={shade(c, kit.light)} /></g>);
  if (opts?.glass) add(kit, <polygon key={k()} points={f.left} fill="url(#iso-glass)" />);
  if (opts?.windows) windows(kit, x, y, hw, hd, z, h, opts.windows);
}

/** Rows of windows on the two faces you can see. `gap` is pixels between rows. */
function windows(kit: Kit, x: number, y: number, hw: number, hd: number, z: number, h: number, gap: number) {
  const { p } = kit;
  for (let i = 0, zz = z + gap * 0.8; zz < z + h - 3; zz += gap, i++) {
    const on = noise(kit.seed + Math.round(x * 10 + y * 7), i) < kit.lamps + 0.12;
    const c = on ? kit.win : "#1c2027";
    const a1 = p.at(x - hw * 0.85, y + hd, zz), a2 = p.at(x + hw * 0.85, y + hd, zz);
    const b1 = p.at(x + hw, y - hd * 0.85, zz), b2 = p.at(x + hw, y + hd * 0.85, zz);
    add(kit, <g key={k()} opacity={on ? 0.9 : 0.55}><line x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]} stroke={c} strokeWidth={2} strokeDasharray="3 3" /><line x1={b1[0]} y1={b1[1]} x2={b2[0]} y2={b2[1]} stroke={c} strokeWidth={2} strokeDasharray="3 4" opacity={0.85} /></g>);
  }
}

/** A pitched roof. The ridge runs along x ("x") or along y ("y"). */
export function gable(kit: Kit, x: number, y: number, hw: number, hd: number, z: number, rh: number, c: string, ridge: "x" | "y" = "x") {
  const a = (dx: number, dy: number, dz: number) => kit.p.at(x + dx, y + dy, z + dz);
  if (ridge === "x") {
    add(kit, <g key={k()}>
      <polygon points={pts([a(-hw, -hd, 0), a(hw, -hd, 0), a(hw, 0, rh), a(-hw, 0, rh)])} fill={shade(c, kit.light * 0.95)} />
      <polygon points={pts([a(-hw, hd, 0), a(hw, hd, 0), a(hw, 0, rh), a(-hw, 0, rh)])} fill={shade(c, kit.light * 0.78)} />
      <polygon points={pts([a(hw, -hd, 0), a(hw, hd, 0), a(hw, 0, rh)])} fill={shade(c, kit.light * 0.55)} />
    </g>);
  } else {
    add(kit, <g key={k()}>
      <polygon points={pts([a(-hw, -hd, 0), a(-hw, hd, 0), a(0, hd, rh), a(0, -hd, rh)])} fill={shade(c, kit.light * 0.95)} />
      <polygon points={pts([a(hw, -hd, 0), a(hw, hd, 0), a(0, hd, rh), a(0, -hd, rh)])} fill={shade(c, kit.light * 0.6)} />
      <polygon points={pts([a(-hw, hd, 0), a(hw, hd, 0), a(0, hd, rh)])} fill={shade(c, kit.light * 0.8)} />
    </g>);
  }
}

export function pyramid(kit: Kit, x: number, y: number, hw: number, hd: number, z: number, h: number, c: string) {
  const a = (dx: number, dy: number, dz = 0) => kit.p.at(x + dx, y + dy, z + dz);
  const top = a(0, 0, h);
  add(kit, <g key={k()}>
    <polygon points={pts([a(-hw, hd), a(hw, hd), top])} fill={shade(c, kit.light * 0.82)} />
    <polygon points={pts([a(hw, -hd), a(hw, hd), top])} fill={shade(c, kit.light * 0.6)} />
  </g>);
}

/** The screen radii of a circle of radius r on the ground. */
const radii = (p: Proj, r: number) => [r * p.s * 1.2247, r * p.s * 0.7071] as const;

export function cylinder(kit: Kit, x: number, y: number, r: number, z: number, h: number, c: string, top?: string) {
  const [rx, ry] = radii(kit.p, r);
  const [cx, c0] = kit.p.at(x, y, z), c1 = kit.p.at(x, y, z + h)[1];
  add(kit, <g key={k()}>
    <path d={`M${cx - rx} ${c1} L${cx - rx} ${c0} A${rx} ${ry} 0 0 0 ${cx + rx} ${c0} L${cx + rx} ${c1} Z`} fill={shade(c, kit.light * 0.72)} />
    <path d={`M${cx} ${c1 + ry} L${cx} ${c0 + ry} A${rx} ${ry} 0 0 0 ${cx + rx} ${c0} L${cx + rx} ${c1} A${rx} ${ry} 0 0 1 ${cx} ${c1 + ry} Z`} fill={shade(c, kit.light * 0.58)} />
    <ellipse cx={cx} cy={c1} rx={rx} ry={ry} fill={shade(top ?? c, kit.light)} />
  </g>);
}

export function dome(kit: Kit, x: number, y: number, r: number, z: number, c: string, tall = 1) {
  const [rx, ry] = radii(kit.p, r);
  const [cx, cy] = kit.p.at(x, y, z);
  const rh = r * kit.p.s * tall;
  add(kit, <g key={k()}>
    <path d={`M${cx - rx} ${cy} A${rx} ${rh} 0 0 1 ${cx + rx} ${cy} A${rx} ${ry} 0 0 1 ${cx - rx} ${cy} Z`} fill={shade(c, kit.light * 0.85)} />
    <path d={`M${cx} ${cy - rh} A${rx} ${rh} 0 0 1 ${cx + rx} ${cy} A${rx} ${ry} 0 0 1 ${cx} ${cy + ry} Z`} fill={shade(c, kit.light * 0.62)} />
  </g>);
}

/** A cooling tower: wide foot, a waist, a lip, and the dark mouth. */
function coolingTower(kit: Kit, x: number, y: number, r: number, z: number, h: number, c: string) {
  const [rx, ry] = radii(kit.p, r);
  const [cx, c0] = kit.p.at(x, y, z), c1 = kit.p.at(x, y, z + h)[1], cm = kit.p.at(x, y, z + h * 0.7)[1];
  const w = 0.5, t = 0.66;
  add(kit, <g key={k()}>
    <path d={`M${cx - rx} ${c0} Q${cx - rx * w} ${cm} ${cx - rx * t} ${c1} L${cx + rx * t} ${c1} Q${cx + rx * w} ${cm} ${cx + rx} ${c0} A${rx} ${ry} 0 0 1 ${cx - rx} ${c0} Z`} fill={shade(c, kit.light * 0.8)} />
    <path d={`M${cx + rx * 0.15} ${c0 + ry} Q${cx + rx * 0.1} ${cm} ${cx + rx * 0.12} ${c1 + ry * t} L${cx + rx * t} ${c1} Q${cx + rx * w} ${cm} ${cx + rx} ${c0} A${rx} ${ry} 0 0 1 ${cx + rx * 0.15} ${c0 + ry} Z`} fill={shade(c, kit.light * 0.6)} />
    <ellipse cx={cx} cy={c1} rx={rx * t} ry={ry * t} fill="#1f2125" />
  </g>);
  smoke(kit, cx, c1, 18, 70);
}

function smoke(kit: Kit, sx: number, sy: number, size: number, rise: number) {
  add(kit, <g key={k()}>{[0, 1, 2].map((i) => (
    <circle key={i} cx={sx} cy={sy} r={size * 0.4} fill="#dcdcdc" opacity={0}>
      <animate attributeName="cy" values={`${sy};${sy - rise}`} dur="5s" begin={`${i * 1.6}s`} repeatCount="indefinite" />
      <animate attributeName="r" values={`${size * 0.35};${size}`} dur="5s" begin={`${i * 1.6}s`} repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0" dur="5s" begin={`${i * 1.6}s`} repeatCount="indefinite" />
    </circle>
  ))}</g>);
}

/** A flat surface on the ground or a roof: a lawn, a plaza, a pool. */
function plate(kit: Kit, x: number, y: number, hw: number, hd: number, z: number, c: string, h = 1.5) {
  const f = prism(kit.p, x, y, hw, hd, z, h);
  add(kit, <g key={k()}><polygon points={f.left} fill={shade(c, kit.light * 0.7)} /><polygon points={f.right} fill={shade(c, kit.light * 0.55)} /><polygon points={f.top} fill={shade(c, kit.light)} /></g>);
}

function pond(kit: Kit, x: number, y: number, r: number, z: number) {
  const [rx, ry] = radii(kit.p, r);
  const [cx, cy] = kit.p.at(x, y, z + 1.6);
  add(kit, <g key={k()}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={shade("#3f7f9f", kit.light)} /><ellipse cx={cx - rx * 0.2} cy={cy - ry * 0.2} rx={rx * 0.4} ry={ry * 0.25} fill="#cfe7f0" opacity={0.35}><animate attributeName="opacity" values="0.15;0.45;0.15" dur="4s" repeatCount="indefinite" /></ellipse></g>);
}

export function tree(kit: Kit, x: number, y: number, z: number, size = 1) {
  const [tx, ty] = kit.p.at(x, y, z);
  const s = size * kit.p.s * 0.22;
  const g = mix("#3f6d3a", "#7aa05a", noise(kit.seed, Math.round((x + y) * 31)));
  add(kit, <g key={k()}><rect x={tx - s * 0.12} y={ty - s * 1.1} width={s * 0.24} height={s * 1.1} fill="#5a4632" /><circle cx={tx} cy={ty - s * 1.5} r={s * 0.75} fill={shade(g, kit.light)} /><circle cx={tx + s * 0.25} cy={ty - s * 1.35} r={s * 0.45} fill={shade(g, kit.light * 0.75)} /></g>);
}

/** Columns along the visible long face (+y). */
function colonnade(kit: Kit, x: number, y: number, hw: number, hd: number, z: number, h: number, c: string) {
  const cols = 6;
  for (let i = 0; i <= cols; i++) {
    const a = kit.p.at(x - hw + (2 * hw * i) / cols, y + hd, z), b = kit.p.at(x - hw + (2 * hw * i) / cols, y + hd, z + h);
    add(kit, <line key={k()} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={shade(c, kit.light * 1.15)} strokeWidth={3} />);
  }
}

/** Crenellations along the top of a wall's two visible faces. */
function merlons(kit: Kit, x: number, y: number, hw: number, hd: number, z: number, c: string) {
  const m = 5;
  for (let i = 0; i < m; i++) {
    block(kit, x + hw - 0.04, y - hd + (2 * hd * (i + 0.5)) / m, 0.04, hd / m * 0.45, z, 4, c);
    block(kit, x - hw + (2 * hw * (i + 0.5)) / m, y + hd - 0.04, hw / m * 0.45, 0.04, z, 4, c);
  }
}

function flag(kit: Kit, x: number, y: number, z: number, h: number, c: string) {
  const [px, py] = kit.p.at(x, y, z), top = kit.p.at(x, y, z + h);
  add(kit, <g key={k()}><line x1={px} y1={py} x2={top[0]} y2={top[1]} stroke="#cfd3d8" strokeWidth={1.4} /><path d={`M${top[0]} ${top[1]} l14 3 l-14 5 Z`} fill={c}><animate attributeName="d" values={`M${top[0]} ${top[1]} l14 3 l-14 5 Z;M${top[0]} ${top[1]} l12 5 l-12 3 Z;M${top[0]} ${top[1]} l14 3 l-14 5 Z`} dur="2.4s" repeatCount="indefinite" /></path></g>);
}

/** A lit sign on the street face. */
function sign(kit: Kit, x: number, y: number, z: number, w: number, c: string, flicker = false) {
  const [sx, sy] = kit.p.at(x, y, z);
  add(kit, <rect key={k()} x={sx - w / 2} y={sy - 5} width={w} height={8} rx={2.5} fill={c} opacity={0.4 + kit.lamps * 0.6}>{flicker ? <animate attributeName="opacity" values="1;0.35;1;1;0.5;1" dur="2.2s" repeatCount="indefinite" /> : null}</rect>);
}

/** Awnings in a row along the street face. */
function awnings(kit: Kit, x: number, y: number, hw: number, hd: number, z: number, colours: string[]) {
  const nA = 4;
  for (let i = 0; i < nA; i++) {
    const x0 = x - hw + (2 * hw * i) / nA + 0.03, x1 = x - hw + (2 * hw * (i + 1)) / nA - 0.03;
    const a = kit.p.at(x0, y + hd, z), b = kit.p.at(x1, y + hd, z), c = kit.p.at(x1, y + hd + 0.12, z - 5), d = kit.p.at(x0, y + hd + 0.12, z - 5);
    add(kit, <polygon key={k()} points={pts([a, b, c, d])} fill={shade(colours[(kit.seed + i) % colours.length], kit.light)} />);
  }
}

/** String lights between two points, twinkling at night. */
function stringLights(kit: Kit, a: V, b: V) {
  const out: ReactNode[] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, x = a[0] + (b[0] - a[0]) * t, yy = a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 6;
    out.push(<circle key={i} cx={x} cy={yy} r={1.6} fill="#ffd98a" opacity={0.3 + kit.lamps * 0.7}><animate attributeName="opacity" values="1;0.4;1" dur={`${1.5 + (i % 3) * 0.4}s`} repeatCount="indefinite" /></circle>);
  }
  add(kit, <g key={k()}><path d={`M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + 12} ${b[0]} ${b[1]}`} fill="none" stroke="#2a2a2a" strokeWidth={0.8} />{out}</g>);
}

/* ── the districts ──────────────────────────────────────────────────────────────────────────── */

type Draw = (kit: Kit, x: number, y: number, hw: number, z: number, h: number) => void;

const TILE = "#8a5a44", SLATE = "#4f5560", WHITE = "#d9dcd6", RED_BARN = "#8e3b2e", GLASS = "#5d7a96", CONCRETE = "#8a8780";

export const DESIGNS: Partial<Record<string, Draw>> = {
  /** Two slab towers on a podium, balconies on every floor; a third once it's big. */
  residential(kit, x, y, hw, z, h) {
    block(kit, x, y, hw, hw, z, 10, mix(kit.base, CONCRETE, 0.4));
    const t = kit.level >= 4;
    block(kit, x - hw * 0.45, y - hw * 0.4, hw * 0.42, hw * 0.28, z + 10, h * 0.95, kit.base, { windows: 8 });
    if (t) block(kit, x + hw * 0.5, y - hw * 0.45, hw * 0.3, hw * 0.3, z + 10, h * 0.7, mix(kit.base, "#ffffff", 0.08), { windows: 8 });
    block(kit, x + hw * 0.15, y + hw * 0.45, hw * 0.55, hw * 0.25, z + 10, h * 0.6, mix(kit.base, "#000000", 0.08), { windows: 8 });
    tree(kit, x + hw * 0.8, y + hw * 0.85, z + 10, 0.8);
  },
  /** A low glass mall, a mid-rise over it, awnings on the street and a billboard. */
  commercial(kit, x, y, hw, z, h) {
    block(kit, x, y, hw, hw * 0.95, z, Math.min(30, h * 0.35), kit.base, { glass: true });
    awnings(kit, x, y, hw, hw * 0.95, z + 12, ["#b8433a", "#d8b04a", "#3f7f8f", "#e0e0d0"]);
    block(kit, x + hw * 0.2, y - hw * 0.3, hw * 0.45, hw * 0.45, z + Math.min(30, h * 0.35), h * 0.65, mix(kit.base, GLASS, 0.35), { windows: 9, glass: true });
    const [bx, by] = kit.p.at(x - hw * 0.6, y - hw * 0.5, z + Math.min(30, h * 0.35) + 18);
    add(kit, <g key={k()}><rect x={bx - 16} y={by - 10} width={32} height={14} fill="#1b1d22" /><rect x={bx - 14} y={by - 8} width={28} height={10} fill="#e8b23a" opacity={0.5 + kit.lamps * 0.5}><animate attributeName="fill" values="#e8b23a;#d0508a;#4ab0d8;#e8b23a" dur="9s" repeatCount="indefinite" /></rect></g>);
  },
  /** A long sawtooth shed, chimneys smoking, tanks out the back. */
  industrial(kit, x, y, hw, z, h) {
    cylinder(kit, x - hw * 0.55, y - hw * 0.55, hw * 0.25, z, h * 0.4, "#7d8288");
    const shed = Math.max(18, h * 0.45);
    block(kit, x, y + hw * 0.1, hw, hw * 0.75, z, shed, kit.base);
    for (let i = 0; i < 4; i++) {
      const sx = x - hw + hw * 0.25 + i * hw * 0.5;
      gable(kit, sx, y + hw * 0.1, hw * 0.25, hw * 0.75, z + shed, 9, mix(kit.base, "#9aa3ad", 0.4), "y");
    }
    for (const dx of [hw * 0.3, hw * 0.7]) {
      const c0 = kit.p.at(x + dx, y - hw * 0.3, z + shed), c1 = kit.p.at(x + dx, y - hw * 0.3, z + shed + h * 0.6 + 20);
      add(kit, <g key={k()}><rect x={c0[0] - 3.5} y={c1[1]} width={7} height={c0[1] - c1[1]} fill={shade("#6d6560", kit.light)} /><rect x={c0[0] - 3.5} y={c1[1] + 4} width={7} height={3} fill="#b0483a" /></g>);
      smoke(kit, c1[0], c1[1], 12, 55);
    }
  },
  /** Steps, a colonnade, a pediment and a dome. */
  civic(kit, x, y, hw, z, h) {
    block(kit, x, y, hw, hw, z, 4, mix(kit.base, WHITE, 0.6));
    block(kit, x, y, hw * 0.88, hw * 0.88, z + 4, 4, mix(kit.base, WHITE, 0.5));
    const body = h * 0.55;
    block(kit, x, y, hw * 0.75, hw * 0.75, z + 8, body, mix(kit.base, WHITE, 0.45));
    colonnade(kit, x, y + 0.02, hw * 0.75, hw * 0.75, z + 8, body, WHITE);
    gable(kit, x, y, hw * 0.78, hw * 0.78, z + 8 + body, 12, mix(kit.base, WHITE, 0.3), "x");
    dome(kit, x, y - hw * 0.1, hw * 0.4, z + 8 + body + 8, mix(kit.base, "#b8a26a", 0.5), 1.1);
    flag(kit, x, y - hw * 0.1, z + 8 + body + 8 + hw * 0.4 * kit.p.s, 18, "#8a1f2a");
  },
  /** Gabled sheds, stacked containers, the slip of water and a crane. */
  docks(kit, x, y, hw, z, h) {
    plate(kit, x, y, hw, hw, z, "#3d4a52", 1);
    pond(kit, x - hw * 0.45, y + hw * 0.5, hw * 0.38, z);
    block(kit, x + hw * 0.35, y - hw * 0.45, hw * 0.55, hw * 0.4, z, 16, kit.base);
    gable(kit, x + hw * 0.35, y - hw * 0.45, hw * 0.55, hw * 0.4, z + 16, 8, mix(kit.base, "#7d8590", 0.5), "x");
    const colours = ["#8a4a3a", "#3f5f7f", "#7f7a3a", "#4a7a4a", "#9a6a2a"];
    for (let i = 0; i < 6; i++) {
      const cx = x + hw * 0.1 + (i % 3) * hw * 0.28, cy = y + hw * 0.2 + Math.floor(i / 3) * hw * 0.3;
      block(kit, cx, cy, hw * 0.12, hw * 0.08, z + 1 + (i === 1 ? 7 : 0), 7, colours[(kit.seed + i) % colours.length]);
    }
    const a = kit.p.at(x - hw * 0.65, y - hw * 0.2, z), b = kit.p.at(x - hw * 0.65, y - hw * 0.2, z + h * 0.6 + 40), c = kit.p.at(x - hw * 0.65 + 1.1, y - hw * 0.2 + 0.4, z + h * 0.6 + 40);
    add(kit, <g key={k()}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#d0a443" strokeWidth={4} /><g><line x1={b[0]} y1={b[1]} x2={c[0]} y2={c[1]} stroke="#d0a443" strokeWidth={3} /><line x1={c[0]} y1={c[1]} x2={c[0]} y2={c[1] + 20} stroke="#888" strokeWidth={1}><animate attributeName="y2" values={`${c[1] + 12};${c[1] + 34};${c[1] + 12}`} dur="6s" repeatCount="indefinite" /></line><animateTransform attributeName="transform" type="rotate" values={`-8 ${b[0]} ${b[1]};10 ${b[0]} ${b[1]};-8 ${b[0]} ${b[1]}`} dur="12s" repeatCount="indefinite" /></g></g>);
  },
  /** Training halls round a yard, a clock tower over the gate. */
  academy(kit, x, y, hw, z, h) {
    const wing = Math.max(14, h * 0.4);
    block(kit, x, y - hw * 0.72, hw, hw * 0.28, z, wing, kit.base, { windows: 9 });
    block(kit, x - hw * 0.72, y + hw * 0.1, hw * 0.28, hw * 0.6, z, wing, kit.base, { windows: 9 });
    plate(kit, x + hw * 0.15, y + hw * 0.15, hw * 0.55, hw * 0.55, z, "#6f8a5a");
    block(kit, x + hw * 0.72, y + hw * 0.1, hw * 0.28, hw * 0.6, z, wing, kit.base, { windows: 9 });
    block(kit, x + hw * 0.6, y + hw * 0.7, hw * 0.22, hw * 0.22, z, h * 0.95, mix(kit.base, "#a89a7a", 0.4), { windows: 10 });
    pyramid(kit, x + hw * 0.6, y + hw * 0.7, hw * 0.24, hw * 0.24, z + h * 0.95, 16, SLATE);
    const [cx, cy] = kit.p.at(x + hw * 0.6, y + hw * 0.92, z + h * 0.82);
    add(kit, <circle key={k()} cx={cx} cy={cy} r={4} fill="#f4ecd0" />);
  },
  /** A walled compound with corner towers, long huts inside, a flag and a searchlight. */
  barracks(kit, x, y, hw, z, h) {
    block(kit, x - hw * 0.8, y - hw * 0.8, hw * 0.2, hw * 0.2, z, h * 0.75, mix(kit.base, CONCRETE, 0.4));
    block(kit, x, y - hw * 0.94, hw, hw * 0.06, z, 12, mix(kit.base, CONCRETE, 0.5));
    block(kit, x - hw * 0.94, y, hw * 0.06, hw, z, 12, mix(kit.base, CONCRETE, 0.5));
    for (let i = 0; i < 3; i++) {
      block(kit, x + hw * 0.05, y - hw * 0.5 + i * hw * 0.42, hw * 0.6, hw * 0.13, z, 9, kit.base);
      gable(kit, x + hw * 0.05, y - hw * 0.5 + i * hw * 0.42, hw * 0.6, hw * 0.13, z + 9, 5, "#5a5f4a", "x");
    }
    block(kit, x, y + hw * 0.94, hw, hw * 0.06, z, 12, mix(kit.base, CONCRETE, 0.5));
    block(kit, x + hw * 0.94, y, hw * 0.06, hw, z, 12, mix(kit.base, CONCRETE, 0.5));
    block(kit, x + hw * 0.8, y + hw * 0.8, hw * 0.2, hw * 0.2, z, h * 0.75, mix(kit.base, CONCRETE, 0.4));
    flag(kit, x - hw * 0.8, y - hw * 0.8, z + h * 0.75, 22, "#2f3f5f");
    const c = kit.p.at(x + hw * 0.8, y + hw * 0.8, z + h * 0.75 + 2);
    add(kit, <polygon key={k()} points={`${c[0]},${c[1]} ${c[0] + 120},${c[1] - 90} ${c[0] + 140},${c[1] - 70}`} fill="#fff7c2" opacity={0.08 + kit.lamps * 0.12}><animateTransform attributeName="transform" type="rotate" values={`-30 ${c[0]} ${c[1]};40 ${c[0]} ${c[1]};-30 ${c[0]} ${c[1]}`} dur="9s" repeatCount="indefinite" /></polygon>);
  },
  /** A round club with a dome, a stepped block in neon bands, a heart on the street. */
  pleasure(kit, x, y, hw, z, h) {
    block(kit, x - hw * 0.35, y - hw * 0.35, hw * 0.55, hw * 0.55, z, h, mix(kit.base, "#2a1a24", 0.4), { windows: 7 });
    for (let i = 1; i <= 3; i++) {
      const f = prism(kit.p, x - hw * 0.35, y - hw * 0.35, hw * 0.551, hw * 0.551, z + (h * i) / 4, 2.5);
      add(kit, <g key={k()}><polygon points={f.left} fill="#ff4fb3" opacity={0.5 + kit.lamps * 0.5}><animate attributeName="opacity" values="1;0.4;1" dur={`${1.6 + i * 0.3}s`} repeatCount="indefinite" /></polygon><polygon points={f.right} fill="#c03a8a" opacity={0.5 + kit.lamps * 0.5} /></g>);
    }
    cylinder(kit, x + hw * 0.45, y + hw * 0.45, hw * 0.45, z, h * 0.45, mix(kit.base, "#6a2a4a", 0.3));
    dome(kit, x + hw * 0.45, y + hw * 0.45, hw * 0.45, z + h * 0.45, "#c9a0b8", 0.6);
    const [hx, hy] = kit.p.at(x + hw * 0.45, y + hw * 0.95, z + h * 0.3);
    add(kit, <path key={k()} d={`M${hx} ${hy + 6} l-8 -8 a4.5 4.5 0 0 1 8 -4 a4.5 4.5 0 0 1 8 4 Z`} fill="#ff6fb0"><animate attributeName="opacity" values="1;0.35;1;1;0.5;1" dur="2.2s" repeatCount="indefinite" /></path>);
  },
  /** An oval bowl: the outer wall, the stands, the sand, floodlights at the ends. */
  arena(kit, x, y, hw, z, h) {
    const wall = Math.max(16, h);
    cylinder(kit, x, y, hw * 0.95, z, wall, mix(kit.base, CONCRETE, 0.3), mix(kit.base, "#5a5048", 0.4));
    const [rx, ry] = radii(kit.p, hw * 0.95);
    const [cx, cy] = kit.p.at(x, y, z + wall);
    // Tiers of arches round the outside, lit when the floodlights are.
    for (let tier = 0; tier < 2; tier++) {
      const ay = kit.p.at(x, y, z + wall * (0.3 + tier * 0.35))[1];
      add(kit, <path key={k()} d={`M${cx - rx * 0.98} ${ay} A${rx} ${ry} 0 0 0 ${cx + rx * 0.98} ${ay}`} fill="none" stroke={kit.lamps > 0.3 ? "#ffd9a0" : "#2a2420"} strokeOpacity={0.8} strokeWidth={5} strokeDasharray="4 5" />);
    }
    add(kit, <g key={k()}><ellipse cx={cx} cy={cy + 2} rx={rx * 0.62} ry={ry * 0.62} fill={shade("#c9b48a", kit.light)} /><ellipse cx={cx} cy={cy + 2} rx={rx * 0.62} ry={ry * 0.62} fill="none" stroke="#7a5a3a" strokeWidth={1} /></g>);
    for (const [dx, dy] of [[-0.9, 0], [0.9, 0]] as const) {
      const a = kit.p.at(x + dx * hw, y + dy * hw, z + wall), b = kit.p.at(x + dx * hw, y + dy * hw, z + wall + 30);
      add(kit, <g key={k()}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#9aa0a6" strokeWidth={2} /><rect x={b[0] - 6} y={b[1] - 4} width={12} height={5} fill="#fff4d6" opacity={0.3 + kit.lamps * 0.7} /></g>);
    }
  },
  /** A white tower with the cross on it, a low wing, a helipad on the roof. */
  clinic(kit, x, y, hw, z, h) {
    block(kit, x + hw * 0.3, y + hw * 0.45, hw * 0.65, hw * 0.4, z, 16, mix(kit.base, WHITE, 0.6), { windows: 7 });
    block(kit, x - hw * 0.25, y - hw * 0.25, hw * 0.5, hw * 0.5, z, h, mix(kit.base, WHITE, 0.55), { windows: 9 });
    const [hx, hy] = kit.p.at(x - hw * 0.25, y - hw * 0.25, z + h + 1);
    const [rx, ry] = radii(kit.p, hw * 0.4);
    add(kit, <g key={k()}><ellipse cx={hx} cy={hy} rx={rx} ry={ry} fill="#3a3f46" stroke="#e8e8e8" strokeWidth={1} /><text x={hx} y={hy + 3.5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#e8e8e8">H</text></g>);
    const [cx, cy] = kit.p.at(x + hw * 0.25, y - hw * 0.1, z + h * 0.7);
    add(kit, <g key={k()} fill="#e04848"><rect x={cx - 3} y={cy - 9} width={6} height={18} /><rect x={cx - 9} y={cy - 3} width={18} height={6} /></g>);
  },
  /** Terraces stepping up, trees on every one, water falling down the front. */
  garden(kit, x, y, hw, z, h) {
    const tiers = 3, th = Math.max(8, h / tiers);
    for (let i = 0; i < tiers; i++) {
      const r = hw * (1 - i * 0.27);
      block(kit, x, y, r, r, z + i * th, th, mix(kit.base, "#8a7d6a", 0.5));
      plate(kit, x, y, r * 0.96, r * 0.96, z + (i + 1) * th, "#5f8a4f", 1);
      for (let j = 0; j < 3; j++) tree(kit, x - r * 0.7 + j * r * 0.7, y + r * 0.75, z + (i + 1) * th, 0.75);
    }
    const a = kit.p.at(x + hw * 0.2, y + hw, z + th), b = kit.p.at(x + hw * 0.2, y + hw, z);
    add(kit, <line key={k()} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#9fd0e8" strokeWidth={3} strokeDasharray="4 3"><animate attributeName="stroke-dashoffset" values="0;-14" dur="0.8s" repeatCount="indefinite" /></line>);
  },
  /** A stepped platform, the hall, and a dome or spire over it. */
  temple(kit, x, y, hw, z, h) {
    for (let i = 0; i < 3; i++) block(kit, x, y, hw * (1 - i * 0.12), hw * (1 - i * 0.12), z + i * 4, 4, mix(kit.base, WHITE, 0.3));
    const body = h * 0.45;
    block(kit, x, y, hw * 0.6, hw * 0.6, z + 12, body, mix(kit.base, "#d8c8a8", 0.3));
    colonnade(kit, x, y + 0.02, hw * 0.6, hw * 0.6, z + 12, body, "#efe4c8");
    dome(kit, x, y, hw * 0.5, z + 12 + body, mix(kit.base, "#c9a24a", 0.55), 1.2);
    const [tx, ty] = kit.p.at(x, y, z + 12 + body + hw * 0.5 * kit.p.s * 1.2);
    add(kit, <line key={k()} x1={tx} y1={ty} x2={tx} y2={ty - 16} stroke="#e7c96a" strokeWidth={2} />);
  },
  /** A glass blade, cut at the top, with the ticker round its waist. */
  exchange(kit, x, y, hw, z, h) {
    block(kit, x, y, hw * 0.8, hw * 0.8, z, 12, mix(kit.base, CONCRETE, 0.3));
    block(kit, x, y, hw * 0.5, hw * 0.5, z + 12, h * 0.85, mix(kit.base, GLASS, 0.5), { windows: 6, glass: true });
    const a = (dx: number, dy: number, dz: number) => kit.p.at(x + dx, y + dy, z + 12 + h * 0.85 + dz);
    const r = hw * 0.5;
    add(kit, <g key={k()}><polygon points={pts([a(-r, r, 0), a(r, r, 0), a(r, r, 26), a(-r, r, 6)])} fill={shade(mix(kit.base, GLASS, 0.5), kit.light * 0.8)} /><polygon points={pts([a(r, -r, 26), a(r, r, 26), a(r, r, 0), a(r, -r, 0)])} fill={shade(mix(kit.base, GLASS, 0.5), kit.light * 0.6)} /><polygon points={pts([a(-r, -r, 6), a(r, -r, 26), a(r, r, 26), a(-r, r, 6)])} fill={shade(mix(kit.base, GLASS, 0.6), kit.light)} /></g>);
    const t1 = kit.p.at(x - r, y + r, z + 12 + h * 0.3), t2 = kit.p.at(x + r, y + r, z + 12 + h * 0.3), t3 = kit.p.at(x + r, y - r, z + 12 + h * 0.3);
    add(kit, <polyline key={k()} points={pts([t1, t2, t3])} fill="none" stroke="#3ad07a" strokeWidth={3} strokeDasharray="5 3"><animate attributeName="stroke-dashoffset" values="0;-40" dur="3s" repeatCount="indefinite" /><animate attributeName="stroke" values="#3ad07a;#e05050;#3ad07a" dur="7s" repeatCount="indefinite" /></polyline>);
  },
  /** A red barn with a gable, silos, and a fenced pen. */
  dairy(kit, x, y, hw, z, h) {
    cylinder(kit, x - hw * 0.6, y - hw * 0.6, hw * 0.22, z, h * 0.9, "#c9c3b4", "#a8a294");
    dome(kit, x - hw * 0.6, y - hw * 0.6, hw * 0.22, z + h * 0.9, "#a8a294", 0.8);
    cylinder(kit, x - hw * 0.15, y - hw * 0.75, hw * 0.18, z, h * 0.75, "#d6d0c2", "#b0aa9c");
    dome(kit, x - hw * 0.15, y - hw * 0.75, hw * 0.18, z + h * 0.75, "#b0aa9c", 0.8);
    const wall = Math.max(12, h * 0.3);
    block(kit, x + hw * 0.15, y + hw * 0.1, hw * 0.75, hw * 0.45, z, wall, RED_BARN);
    gable(kit, x + hw * 0.15, y + hw * 0.1, hw * 0.78, hw * 0.48, z + wall, 12, "#5a4a40", "x");
    const d = kit.p.at(x + hw * 0.9, y + hw * 0.1, z + 4);
    add(kit, <rect key={k()} x={d[0] - 4} y={d[1] - 10} width={8} height={10} fill="#f0e8d8" opacity={0.85} />);
    for (let i = 0; i <= 5; i++) {
      const a = kit.p.at(x - hw + (i * hw * 2) / 5, y + hw * 0.95, z), b = kit.p.at(x - hw + (i * hw * 2) / 5, y + hw * 0.95, z + 5);
      add(kit, <line key={k()} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#c9b48a" strokeWidth={1.4} />);
    }
  },
  /** Cooling towers steaming, a reactor dome, the turbine hall. */
  power(kit, x, y, hw, z, h) {
    // A cooling tower is about as tall as it is wide; anything thinner reads as a chimney.
    coolingTower(kit, x - hw * 0.42, y - hw * 0.42, hw * 0.55, z, Math.min(h, 48), mix(kit.base, "#b8bcc2", 0.6));
    if (kit.level >= 3) coolingTower(kit, x + hw * 0.5, y - hw * 0.55, hw * 0.42, z, Math.min(h * 0.8, 38), mix(kit.base, "#b8bcc2", 0.6));
    block(kit, x + hw * 0.25, y + hw * 0.5, hw * 0.6, hw * 0.35, z, 14, kit.base);
    cylinder(kit, x - hw * 0.5, y + hw * 0.45, hw * 0.32, z, 14, "#9aa0a8");
    dome(kit, x - hw * 0.5, y + hw * 0.45, hw * 0.32, z + 14, "#c0c4ca", 0.9);
  },
  /** Two calm storeys with a roof garden, a round quiet room, and a lit sign that doesn't flash. */
  therapy(kit, x, y, hw, z, h) {
    const body = Math.max(16, h * 0.7);
    block(kit, x - hw * 0.2, y - hw * 0.2, hw * 0.7, hw * 0.6, z, body, mix(kit.base, "#d8d4c8", 0.35), { windows: 11 });
    plate(kit, x - hw * 0.2, y - hw * 0.2, hw * 0.66, hw * 0.56, z + body, "#6f8f5f", 1);
    tree(kit, x - hw * 0.5, y - hw * 0.4, z + body, 0.6);
    tree(kit, x + hw * 0.1, y - hw * 0.5, z + body, 0.6);
    cylinder(kit, x + hw * 0.5, y + hw * 0.5, hw * 0.35, z, body * 0.55, mix(kit.base, "#c8d8d0", 0.45), "#7f9f8f");
    tree(kit, x - hw * 0.7, y + hw * 0.75, z, 0.8);
    sign(kit, x - hw * 0.2, y + hw * 0.4, z + body * 0.45, 22, "#a8e0c8");
  },
  /** A row of little places with striped awnings, tables out front, lights strung over them, a kitchen steaming. */
  restaurant(kit, x, y, hw, z, h) {
    const body = Math.max(14, h * 0.6);
    for (let i = 0; i < 3; i++) {
      const bx = x - hw * 0.66 + i * hw * 0.66;
      const tall = body * (0.8 + noise(kit.seed, i) * 0.5);
      block(kit, bx, y - hw * 0.35, hw * 0.31, hw * 0.55, z, tall, mix(kit.base, ["#a8644a", "#8a7a5a", "#7a5a6a"][i], 0.4), { windows: 9 });
      if (i === 2) smoke(kit, ...kit.p.at(bx, y - hw * 0.5, z + tall), 8, 35);
    }
    awnings(kit, x, y - hw * 0.35, hw, hw * 0.55, z + 10, ["#b8433a", "#e0e0d0", "#3f7f5f", "#d8b04a"]);
    plate(kit, x, y + hw * 0.6, hw, hw * 0.38, z, "#6a5a4a", 1);
    for (let i = 0; i < 4; i++) {
      const [tx, ty] = kit.p.at(x - hw * 0.7 + i * hw * 0.47, y + hw * 0.6 + (i % 2 ? 0.1 : -0.1), z + 1);
      add(kit, <g key={k()}><line x1={tx} y1={ty} x2={tx} y2={ty - 9} stroke="#cfcfcf" strokeWidth={1} /><path d={`M${tx - 7} ${ty - 9} Q${tx} ${ty - 15} ${tx + 7} ${ty - 9} Z`} fill={["#b8433a", "#e0e0d0", "#3f7f5f", "#d8b04a"][(kit.seed + i) % 4]} /><ellipse cx={tx} cy={ty - 3} rx={4} ry={2} fill="#e8e0d0" /></g>);
    }
    stringLights(kit, kit.p.at(x - hw, y + hw * 0.2, z + 14), kit.p.at(x + hw, y + hw * 0.2, z + 14));
  },
  /** A quad: lawns crossed by paths, a domed library, a bell tower, and lecture halls along two sides. */
  university(kit, x, y, hw, z, h) {
    const hall = Math.max(16, h * 0.4);
    block(kit, x, y - hw * 0.75, hw, hw * 0.25, z, hall, kit.base, { windows: 10 });
    gable(kit, x, y - hw * 0.75, hw, hw * 0.25, z + hall, 7, TILE, "x");
    block(kit, x - hw * 0.75, y + hw * 0.15, hw * 0.25, hw * 0.6, z, hall, kit.base, { windows: 10 });
    gable(kit, x - hw * 0.75, y + hw * 0.15, hw * 0.25, hw * 0.6, z + hall, 7, TILE, "y");
    block(kit, x - hw * 0.62, y - hw * 0.62, hw * 0.14, hw * 0.14, z, h * 1.15, mix(kit.base, "#a89a7a", 0.4), { windows: 12 });
    pyramid(kit, x - hw * 0.62, y - hw * 0.62, hw * 0.16, hw * 0.16, z + h * 1.15, 18, SLATE);
    plate(kit, x + hw * 0.25, y + hw * 0.25, hw * 0.75, hw * 0.75, z, "#6f9a5a");
    const p1 = kit.p.at(x - hw * 0.5, y + hw * 0.25, z + 2), p2 = kit.p.at(x + hw, y + hw * 0.25, z + 2), p3 = kit.p.at(x + hw * 0.25, y - hw * 0.5, z + 2), p4 = kit.p.at(x + hw * 0.25, y + hw, z + 2);
    add(kit, <g key={k()} stroke={shade("#c9bfa4", kit.light)} strokeWidth={2.5}><line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} /><line x1={p3[0]} y1={p3[1]} x2={p4[0]} y2={p4[1]} /></g>);
    block(kit, x + hw * 0.25, y + hw * 0.25, hw * 0.32, hw * 0.32, z, hall * 0.8, mix(kit.base, WHITE, 0.4));
    colonnade(kit, x + hw * 0.25, y + hw * 0.27, hw * 0.32, hw * 0.32, z, hall * 0.8, WHITE);
    dome(kit, x + hw * 0.25, y + hw * 0.25, hw * 0.3, z + hall * 0.8, "#6f8f8a", 1);
    tree(kit, x + hw * 0.85, y - hw * 0.2, z, 0.8);
    tree(kit, x - hw * 0.1, y + hw * 0.85, z, 0.8);
  },
  /** Lawn, a pond, paths, trees, and a fountain that runs. */
  park(kit, x, y, hw, z) {
    plate(kit, x, y, hw, hw, z, "#5f8f4f", 2);
    const p1 = kit.p.at(x - hw, y, z + 2.2), p2 = kit.p.at(x + hw, y, z + 2.2), p3 = kit.p.at(x, y - hw, z + 2.2), p4 = kit.p.at(x, y + hw, z + 2.2);
    add(kit, <g key={k()} stroke={shade("#cbbf9a", kit.light)} strokeWidth={3}><line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} /><line x1={p3[0]} y1={p3[1]} x2={p4[0]} y2={p4[1]} /></g>);
    pond(kit, x + hw * 0.5, y - hw * 0.5, hw * 0.32, z + 0.6);
    const trees = 3 + kit.level * 2;
    for (let i = 0; i < trees; i++) {
      const tx = x - hw * 0.85 + noise(kit.seed, i) * hw * 1.7, ty = y - hw * 0.85 + noise(kit.seed, i + 20) * hw * 1.7;
      if (Math.abs(tx - x) < hw * 0.12 || Math.abs(ty - y) < hw * 0.12 || (tx > x + hw * 0.15 && ty < y - hw * 0.15)) continue;
      tree(kit, tx, ty, z + 2, 0.9);
    }
    const [fx, fy] = kit.p.at(x, y, z + 2.5);
    add(kit, <g key={k()}><ellipse cx={fx} cy={fy} rx={9} ry={5} fill={shade("#8a8f96", kit.light)} /><ellipse cx={fx} cy={fy - 1} rx={6} ry={3} fill="#6fb0d0" />{[0, 1, 2].map((i) => <circle key={i} cx={fx} cy={fy - 2} r={1.6} fill="#cfeaf5"><animate attributeName="cy" values={`${fy - 2};${fy - 16};${fy - 2}`} dur="1.4s" begin={`${i * 0.45}s`} repeatCount="indefinite" /><animate attributeName="cx" values={`${fx};${fx + (i - 1) * 6}`} dur="1.4s" begin={`${i * 0.45}s`} repeatCount="indefinite" /></circle>)}</g>);
  },
  /** The gatehouse: two crenellated towers over an arch, the wall running off both ways. */
  wall(kit, x, y, hw, z, h) {
    const wh = Math.max(16, h * 0.55);
    block(kit, x, y, hw, hw * 0.18, z, wh, mix(kit.base, CONCRETE, 0.3));
    merlons(kit, x, y, hw, hw * 0.18, z + wh, mix(kit.base, CONCRETE, 0.3));
    for (const dx of [-0.6, 0.6]) {
      block(kit, x + dx * hw, y, hw * 0.24, hw * 0.3, z, h, mix(kit.base, CONCRETE, 0.15), { windows: 14 });
      merlons(kit, x + dx * hw, y, hw * 0.24, hw * 0.3, z + h, mix(kit.base, CONCRETE, 0.15));
    }
    const [gx, gy] = kit.p.at(x, y + hw * 0.18, z);
    add(kit, <path key={k()} d={`M${gx - 10} ${gy} v-12 a10 10 0 0 1 20 0 v12 Z`} fill="#15171b" />);
    const wire = kit.p.at(x - hw, y + hw * 0.18, z + wh + 6), wire2 = kit.p.at(x + hw, y + hw * 0.18, z + wh + 6);
    add(kit, <line key={k()} x1={wire[0]} y1={wire[1]} x2={wire2[0]} y2={wire2[1]} stroke="#9aa0a6" strokeWidth={1} strokeDasharray="2 2" />);
    const lamp = kit.p.at(x + 0.6 * hw, y, z + h + 6);
    add(kit, <circle key={k()} cx={lamp[0]} cy={lamp[1]} r={3} fill="#ff5a3a"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite" /></circle>);
  },
};

/**
 * How tall a district draws, in pixels. Every kind used to be its bulk times its level, so a works
 * or a power plant at level four was a skyscraper; the low kinds sprawl instead, and stop at a
 * height that reads as what they are.
 */
const CAP: Partial<Record<string, number>> = {
  industrial: 40, civic: 55, docks: 40, academy: 60, barracks: 40, temple: 60, dairy: 40, therapy: 45,
  restaurant: 40, university: 60, wall: 45, power: 60, garden: 70,
};
export function designHeight(kind: string, level: number, bulk: number): number {
  if (kind === "spire") return 230 + level * 20;
  if (kind === "arena") return 18 + level * 4;
  if (kind === "park") return 4;
  return Math.min(CAP[kind] ?? Infinity, Math.max(16, 20 + bulk * level * 120));
}

/** Draw a district in its own design. Returns false when this kind has none. */
export function drawDesign(kit: Kit, kind: string, x: number, y: number, hw: number, z: number, h: number): boolean {
  const d = DESIGNS[kind];
  if (!d) return false;
  d(kit, x, y, hw, z, h);
  return true;
}

/**
 * The border wall itself, round the edge of the platform: towers at intervals, taller with level.
 * Drawn as items so IsoCity can sort them in with everything else.
 */
export function perimeterWall(p: Proj, R: number, level: number, light: number, base: string): { depth: number; node: ReactNode }[] {
  const out: { depth: number; node: ReactNode }[] = [];
  const segs = 36, h = 10 + level * 4;
  const c = mix(base, CONCRETE, 0.35);
  for (let i = 0; i < segs; i++) {
    const t0 = (i / segs) * Math.PI * 2, t1 = ((i + 1) / segs) * Math.PI * 2;
    const a = [Math.cos(t0) * R, Math.sin(t0) * R] as const, b = [Math.cos(t1) * R, Math.sin(t1) * R] as const;
    const pa0 = p.at(a[0], a[1], 9), pb0 = p.at(b[0], b[1], 9), pa1 = p.at(a[0], a[1], 9 + h), pb1 = p.at(b[0], b[1], 9 + h);
    // Faces turned towards the viewer are lit; the far side of the ring is mostly hidden anyway.
    const facing = Math.cos((t0 + t1) / 2 - Math.PI / 4);
    const tower = i % 6 === 0;
    out.push({
      depth: (a[0] + b[0]) / 2 + (a[1] + b[1]) / 2 + 0.01,
      node: (
        <g key={`pw${i}`}>
          <polygon points={pts([pa0, pb0, pb1, pa1])} fill={shade(c, light * (0.55 + Math.max(0, facing) * 0.3))} />
          <line x1={pa1[0]} y1={pa1[1]} x2={pb1[0]} y2={pb1[1]} stroke={shade(c, light * 1.1)} strokeWidth={2} strokeDasharray="3 2" />
          {tower ? (() => { const t0p = p.at(a[0], a[1], 9 + h), t1p = p.at(a[0], a[1], 9 + h + 16); return <g><rect x={t0p[0] - 5} y={t1p[1]} width={10} height={pa0[1] - t1p[1]} fill={shade(c, light * 0.75)} /><rect x={t0p[0] - 7} y={t1p[1] - 4} width={14} height={5} fill={shade(c, light * 0.9)} /><circle cx={t0p[0]} cy={t1p[1] - 7} r={2} fill="#ff5a3a"><animate attributeName="opacity" values="1;0.2;1" dur="2s" begin={`${i * 0.1}s`} repeatCount="indefinite" /></circle></g>; })() : null}
        </g>
      ),
    });
  }
  return out;
}
