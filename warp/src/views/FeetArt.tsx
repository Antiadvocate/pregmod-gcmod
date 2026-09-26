/**
 * HER FEET, DRAWN — from above and from the side.
 *
 * Built on the proportions figure-drawing teaches rather than on guesses:
 *   · a woman's foot is about 0.37 as wide as it is long; the heel about two thirds of the ball;
 *   · the ball sits at 69% of the length on the inside (first metatarsal head) and 63% on the
 *     outside (fifth), so the front of the foot is cut on a slant;
 *   · the big toe is a third of the foot's width; the other four share the rest, pressed together,
 *     each shorter than the last in a staircase, bending down at the knuckle so from above you see
 *     a knuckle, a short nail and the pad of the tip bulging past it;
 *   · the inside ankle bone is higher than the outside one and level with the top of the foot;
 *   · from the inside, the arch lifts off the ground between heel and ball, highest at about 40%.
 * Shading is layered the way vector illustrators do skin: a base, soft shadows and highlights
 * blurred and clipped to the outline, occlusion where toes press together, and the paler, pinker
 * skin of the sole showing along the bottom.
 *
 * Everything recorded about her feet shows (size to scale, toe type, width, arch, soles, nails,
 * jewelry, clipped tendons, caning). What isn't recorded comes from her id: each toe's length and
 * lean, gaps, a bunion or none, a tucked little toe, instep, ankle bones, heel, nail shape, skin
 * tone within its family, veins and moles.
 */
import { useMemo, useRef, useState } from "react";
import { useGame } from "../lib/game";
import { hasApiKey } from "../config";
import { redraw, redrawPrompt, svgToPng, toJpeg } from "../lib/imagegen";
import type { Person } from "../engine/types";
import { describeFeet, feetOf, idHash, soleDirt } from "../engine/genitals";
import { rng } from "../engine/rng";
import { SKIN, match, shade } from "../lib/vectorart";

type Pt = [number, number];

/** A smooth path through points (Catmull-Rom, converted to cubic Béziers). */
function smooth(pts: Pt[], closed: boolean, k = 1): string {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += ` C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return closed ? `${d} Z` : d;
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}
const lighten = (c: string, t: number) => mix(c, "#ffffff", t);

const NAIL: [RegExp, string][] = [
  [/french/i, "#f3d8d2"], [/pale pink/i, "#f0b3c0"], [/pink/i, "#e8649a"], [/red/i, "#a8121f"], [/black/i, "#17141a"],
  [/white/i, "#f4f1ec"], [/gold/i, "#caa13a"], [/purple/i, "#55205f"], [/navy|blue/i, "#1c2b60"], [/silver/i, "#c2c6cc"],
  [/green/i, "#2b6341"], [/orange|coral/i, "#e25d37"],
];
const METAL = (s: string) => (/silver|platinum|steel/i.test(s) ? "#d9dde3" : /rose/i.test(s) ? "#dca28c" : "#d8b14c");

/** Tip positions (fraction of foot length) of the five toes, big toe first, per foot type. */
const TIPS: Record<string, number[]> = {
  egyptian: [1.0, 0.974, 0.944, 0.906, 0.862],
  greek: [0.976, 1.0, 0.962, 0.915, 0.866],
  roman: [1.0, 0.995, 0.987, 0.93, 0.874],
  germanic: [1.0, 0.95, 0.945, 0.937, 0.874],
  celtic: [0.98, 1.0, 0.935, 0.925, 0.866],
};

export interface FootGenes {
  tips: number[]; bases: number[]; vis: number[]; toeW: number[]; angles: number[]; gaps: number[];
  widthRatio: number; heelRatio: number; bunion: number; pinkyTuck: number; bulb: number;
  nailShape: "round" | "square" | "oval"; nailW: number;
  archH: number; instep: number; ankle: number; achilles: number; heelRound: number; toeLift: number;
  skin: string; sole: string; veins: number; tendons: number; moles: { t: number; x: number; r: number }[];
  prosthetic: boolean;
  /** How dirty the soles are, from her job and her shoes; see soleDirt. */
  dirt: number; dirtColour: string; seed: number;
}

const DIRT = { earth: "#4a3826", grime: "#34302c", dust: "#7a6b5a" } as const;

/** Blotchy dirt: noise, coloured, kept only where the shapes it's applied to are. */
function DirtFilter({ uid, colour, seed }: { uid: string; colour: string; seed: number }) {
  const c = [1, 3, 5].map((i) => parseInt(colour.slice(i, i + 2), 16) / 255);
  return (
    <filter id={`${uid}-dirt`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="330">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="area" />
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.08" numOctaves="4" seed={seed} result="n" />
      <feColorMatrix in="n" type="matrix" values={`0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  0 0 0 2.2 -0.55`} result="c" />
      <feComposite in="c" in2="area" operator="in" />
    </filter>
  );
}

export function footGenes(p: Person): FootGenes {
  const f = feetOf(p);
  const r = rng(idHash(p.id, "feet-art"));
  const j = (s: number) => (r() - 0.5) * 2 * s;
  const tips = (TIPS[f.shape ?? "egyptian"] ?? TIPS.egyptian).map((t, i) => t + (i ? j(0.008) : 0));
  // A tucked little toe, but never so far that it disappears behind the fourth.
  const pinkyTuck = r() < 0.3 ? 0.3 + r() * 0.35 : r() * 0.2;
  tips[4] -= pinkyTuck * 0.02;
  // How much of each toe shows past the web: big toe long, the rest short and stubby.
  const stubby = 0.9 + r() * 0.2;
  const vis = [0.24, 0.158, 0.142, 0.125, 0.102].map((v, i) => v * stubby * (1 + j(0.06)) * (i === 4 ? 1 - pinkyTuck * 0.15 : 1));
  const bases = tips.map((t, i) => t - vis[i]);
  const widthRatio = ({ narrow: 0.35, average: 0.375, wide: 0.415 } as const)[f.width ?? "average"] + j(0.01);
  // Big toe a third of the width; the other four share the rest.
  const toeW = [0.335, 0.19, 0.178, 0.165, 0.142].map((w, i) => w * (1 + j(0.05)) * (i === 0 ? 1 + j(0.04) : 1));
  const valgus = r() < 0.2 ? 7 + r() * 7 : 1 + r() * 4;
  const angles = [valgus, 3 + j(2), 1 + j(2), -1 + j(2), -4 - pinkyTuck * 8 + j(2)];
  const sandal = r() < 0.3 ? 0.02 + r() * 0.025 : 0.006 + r() * 0.006;
  const gaps = [sandal, 0.003 + r() * 0.004, 0.003 + r() * 0.004, 0.002 + r() * 0.005];
  const archBase = { flat: 0.014, normal: 0.04, high: 0.066 }[f.arch];
  const prosthetic = p.body.marks.some((m) => m.kind === "prosthetic" && /feet|foot|leg/i.test(m.where));
  const base = match(SKIN, p.body.skin, "#d9b48f");
  const nudged = shade(mix(base, r() < 0.5 ? "#e8b39b" : "#caa27c", 0.1 * r()), 0.97 + r() * 0.06);
  const skin = prosthetic ? "#9aa3ad" : nudged;
  const lum = (parseInt(skin.slice(1, 3), 16) + parseInt(skin.slice(3, 5), 16) + parseInt(skin.slice(5, 7), 16)) / 3;
  const sole = prosthetic ? "#7c848e" : mix(skin, lum > 170 ? "#f2bdb0" : "#e7c0a6", lum > 170 ? 0.4 : 0.6);
  const dirt = soleDirt(p);
  const moles = Array.from({ length: r() < 0.5 ? r.int(1, 3) : 0 }, () => ({ t: 0.3 + r() * 0.35, x: j(0.28), r: 0.6 + r() * 0.9 }));
  return {
    tips, bases, vis, toeW, angles, gaps, widthRatio, heelRatio: 0.62 + r() * 0.08, bunion: valgus > 7 ? (valgus - 7) / 7 : 0,
    pinkyTuck, bulb: 1.06 + r() * 0.12, nailShape: r.pick(["round", "square", "oval"] as const), nailW: 0.56 + r() * 0.1,
    archH: archBase * (0.85 + r() * 0.3), instep: j(0.02), ankle: 0.85 + r() * 0.4, achilles: 0.85 + r() * 0.3,
    heelRound: 0.85 + r() * 0.3, toeLift: j(0.01), skin, sole,
    veins: lum > 175 ? 0.22 + r() * 0.2 : r() * 0.08, tendons: 0.25 + (p.body.weight < 0 ? 0.2 : 0) + r() * 0.2, moles, prosthetic,
    dirt: prosthetic ? 0 : dirt.level, dirtColour: DIRT[dirt.kind], seed: Math.floor(r() * 1000),
  };
}

function nailColour(g: FootGenes, toenails: string): { fill: string; painted: boolean; french: boolean } {
  const french = /french/i.test(toenails);
  const painted = !!toenails && toenails !== "bare" && !g.prosthetic;
  const fill = french ? "#f3d8d2" : painted ? match(NAIL, toenails, "#a8121f") : mix(g.skin, "#f6d2cb", 0.5);
  return { fill, painted, french };
}

/* ── from above ─────────────────────────────────────────────────────────────────────────────── */

/** The outline of the foot seen straight on from above (or, mirrored, from below): the same
 *  bones either way, so both views share it. */
function plan(p: Person, g: FootGenes) {
  const f = feetOf(p);
  const L = 222 * (f.size / 41);
  const W = L * g.widthRatio;
  const cx = 100;
  const top = 14 + (262 - L) / 2;
  const Y = (v: number) => top + (1 - v) * L;
  const X = (u: number) => cx + u * W;

  // Toes across the front, big toe on the inside, fitted to the width of the ball.
  const span = g.toeW.reduce((a, b) => a + b, 0) + g.gaps.reduce((a, b) => a + b, 0);
  // The toes together are a little narrower than the ball: the front of the foot tapers into them.
  const fit = 0.93 / span;
  let x = -0.5 + 0.015 + g.bunion * 0.02;
  const toes = g.toeW.map((w0, i) => {
    const w = w0 * fit;
    const c = x + w / 2;
    x += w + (g.gaps[i] ?? 0) * fit;
    return { i, cx: c, w };
  });
  toes[4].cx -= toes[4].w * (0.1 + g.pinkyTuck * 0.2);

  // The body of the foot. Medial side (big toe side) runs heel → arch → ball at 69%; lateral runs
  // ball at 63% → the bump at the base of the fifth metatarsal → heel.
  const hw = g.heelRatio / 2;
  const emerge = (i: number) => g.bases[i];
  const med: Pt[] = [
    [X(-hw * 0.5), Y(0.004)], [X(-hw * 0.9), Y(0.045)], [X(-hw * 1.02), Y(0.12)],
    [X(-hw * 1.02 - 0.025 * g.ankle), Y(0.2)], [X(-hw * 1.0 - 0.01), Y(0.27)], [X(-0.42 + g.archH * 0.9), Y(0.4)], [X(-0.47), Y(0.54)],
    [X(-0.505 - g.bunion * 0.055), Y(0.66)], [X(-0.5 - g.bunion * 0.04), Y(0.705)],
    [X(toes[0].cx - toes[0].w * 0.49), Y(emerge(0) + g.vis[0] * 0.28)],
  ];
  const web: Pt[] = [];
  toes.forEach((t, i) => {
    web.push([X(t.cx), Y(emerge(i) + g.vis[i] * 0.32)]);
    if (i < 4) { const nx = (t.cx + t.w / 2 + toes[i + 1].cx - toes[i + 1].w / 2) / 2; web.push([X(nx), Y((emerge(i) + emerge(i + 1)) / 2 + (g.vis[i] + g.vis[i + 1]) * 0.1)]); }
  });
  const lat: Pt[] = [
    [X(toes[4].cx + toes[4].w * 0.46), Y(emerge(4) + g.vis[4] * 0.28)], [X(0.485), Y(emerge(4) - 0.045)], [X(0.5), Y(0.62)], [X(0.475), Y(0.54)],
    [X(0.45), Y(0.44)], [X(0.43), Y(0.4)], [X(hw * 1.02 + 0.03), Y(0.27)], [X(hw * 1.03 + 0.025 * g.ankle), Y(0.17)], [X(hw * 1.0), Y(0.11)], [X(hw * 0.88), Y(0.05)], [X(hw * 0.45), Y(0.006)],
  ];
  const heelPt: Pt[] = [[X(0.015), Y(0) + 0.5]];
  const outline: Pt[] = [...med, ...web, ...lat, ...heelPt];
  const body = smooth(outline, true, 0.95);

  // One toe in local space: base at 0, pointing up (−y), full length F of which V shows.
  const toePts = (i: number, w: number, F: number, V: number): Pt[] => {
    const s = F - V; // hidden inside the foot
    const b = g.bulb;
    if (i === 0) return [
      [-0.5 * w, 6], [-0.5 * w, -s - 0.25 * V], [-0.53 * w, -s - 0.55 * V], [-0.52 * w * b, -s - 0.8 * V],
      [-0.36 * w, -F + 0.02 * V], [0, -F], [0.36 * w, -F + 0.02 * V], [0.5 * w * b, -s - 0.8 * V], [0.5 * w, -s - 0.55 * V], [0.48 * w, -s - 0.25 * V], [0.48 * w, 6],
    ];
    return [
      [-0.5 * w, 6], [-0.43 * w, -s - 0.2 * V], [-0.47 * w, -s - 0.45 * V], [-0.42 * w, -s - 0.62 * V], [-0.52 * w * b, -s - 0.83 * V],
      [-0.34 * w, -F + 0.015 * V], [0, -F], [0.34 * w, -F + 0.015 * V], [0.52 * w * b, -s - 0.83 * V], [0.42 * w, -s - 0.62 * V], [0.47 * w, -s - 0.45 * V], [0.43 * w, -s - 0.2 * V], [0.5 * w, 6],
    ];
  };

  return { f, L, W, X, Y, toes, med, lat, web, heelPt, body, toePts, emerge };
}

function TopView({ p, g, uid }: { p: Person; g: FootGenes; uid: string }) {
  const { f, L, W, X, Y, toes, med, lat, web, heelPt, body, toePts, emerge } = plan(p, g);
  const nail = nailColour(g, f.toenails);
  const ring = f.jewelry.find((x) => /toe ring/i.test(x));
  const anklet = f.jewelry.find((x) => /anklet|chain/i.test(x));
  const tattoo = p.body.marks.find((m) => m.kind === "tattoo" && /foot|feet|ankle|toe/i.test(m.where));

  const shadow = shade(g.skin, 0.62);
  const line = shade(g.skin, 0.6);
  return (
    <svg viewBox="0 0 200 290" className="w-full h-auto" role="img" aria-label="her foot from above">
      <defs>
        <filter id={`${uid}-b1`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="330"><feGaussianBlur stdDeviation="1.1" /></filter>
        <filter id={`${uid}-b3`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="330"><feGaussianBlur stdDeviation="3.5" /></filter>
        <filter id={`${uid}-b6`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="330"><feGaussianBlur stdDeviation="7" /></filter>
        <clipPath id={`${uid}-body`}><path d={body} /></clipPath>
        <linearGradient id={`${uid}-toe`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(g.skin, 0.84)} />
          <stop offset="0.35" stopColor={lighten(g.skin, 0.06)} />
          <stop offset="0.7" stopColor={g.skin} />
          <stop offset="1" stopColor={shade(g.skin, 0.8)} />
        </linearGradient>
        <linearGradient id={`${uid}-dorsum`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(g.skin, 0.88)} />
          <stop offset="0.35" stopColor={lighten(g.skin, 0.06)} />
          <stop offset="0.72" stopColor={g.skin} />
          <stop offset="1" stopColor={shade(g.skin, 0.82)} />
        </linearGradient>
        <radialGradient id={`${uid}-leg`} cx="0.45" cy="0.45" r="0.6">
          <stop offset="0" stopColor={lighten(g.skin, 0.1)} />
          <stop offset="0.7" stopColor={g.skin} />
          <stop offset="1" stopColor={shade(g.skin, 0.78)} />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx={X(0.04)} cy={Y(0.45)} rx={W * 0.62} ry={L * 0.52} fill="#000" opacity={0.28} filter={`url(#${uid}-b6)`} />

      {/* the foot */}
      <path d={body} fill={`url(#${uid}-dorsum)`} />
      <g clipPath={`url(#${uid}-body)`}>
        {/* lateral and medial sides fall away from the light */}
        <path d={smooth(lat, false)} fill="none" stroke={shade(g.skin, 0.7)} strokeWidth={W * 0.22} opacity={0.55} filter={`url(#${uid}-b6)`} />
        <path d={smooth(med.slice(0, -1), false)} fill="none" stroke={shade(g.skin, 0.78)} strokeWidth={W * 0.12} opacity={0.45} filter={`url(#${uid}-b3)`} />
        {/* the top plane of the foot, catching the light */}
        <path d={smooth([[X(-0.1), Y(0.3)], [X(-0.12), Y(0.5)], [X(-0.2), Y(0.66)]], false)} fill="none" stroke={lighten(g.skin, 0.2)} strokeWidth={W * 0.26} opacity={0.5} filter={`url(#${uid}-b6)`} />
        {/* the balls of the toes shade the knuckles just behind them */}
        <path d={smooth(web.filter((_, k) => k % 2 === 0), false)} fill="none" stroke={shade(g.skin, 0.8)} strokeWidth={L * 0.05} opacity={0.4} filter={`url(#${uid}-b3)`} />
        {/* tendons to the toes, and veins where the skin is pale enough */}
        {toes.slice(0, 4).map((t, i) => (
          <path key={i} d={`M${X(t.cx * 0.95)},${Y(emerge(i) - 0.01)} Q${X(t.cx * 0.6)},${Y(0.5)} ${X(-0.04 + i * 0.02)},${Y(0.27)}`} fill="none" stroke={lighten(g.skin, 0.2)} strokeWidth={i === 0 ? 2.6 : 1.6} opacity={g.tendons * (i === 0 ? 0.55 : 0.22)} filter={`url(#${uid}-b3)`} />
        ))}
        {g.veins > 0.05 ? <path d={`M${X(-0.42)},${Y(0.36)} C${X(-0.22)},${Y(0.55)} ${X(0.15)},${Y(0.58)} ${X(0.42)},${Y(0.45)}`} fill="none" stroke="#6f86b8" strokeWidth={1.4} opacity={g.veins} filter={`url(#${uid}-b1)`} /> : null}
        {g.moles.map((m, i) => <circle key={i} cx={X(m.x)} cy={Y(m.t)} r={m.r} fill={shade(g.skin, 0.42)} opacity={0.8} />)}
        {tattoo ? <path d={`M${X(0.26)},${Y(0.26)} c5,-9 -3,-16 2,-25 c4,-6 -1,-12 3,-19`} fill="none" stroke="#28303f" strokeWidth={1.2} opacity={0.75} /> : null}
      </g>
      <path d={smooth(med, false, 0.95)} fill="none" stroke={line} strokeWidth={0.9} />
      <path d={smooth([...lat, ...heelPt, med[0]], false, 0.95)} fill="none" stroke={line} strokeWidth={0.9} />

      {/* toes: little toe first, each one's shadow falling on the one outside it */}
      {[...toes].reverse().map((t) => {
        const i = t.i;
        const w = t.w * W;
        const V = g.vis[i] * L;
        const F = V + L * 0.05;
        const s = F - V;
        const pts = toePts(i, w, F, V);
        const d = smooth(pts, false, 0.9);
        const tr = `translate(${X(t.cx)},${Y(g.bases[i]) + s}) rotate(${g.angles[i]})`;
        const nw = w * g.nailW * (i === 0 ? 1 : i === 4 ? 0.62 : 0.74);
        const nlen = V * (i === 0 ? 0.42 : i === 4 ? 0.26 : 0.3);
        const ny = -F + V * (i === 0 ? 0.07 : 0.1);
        const nailPath = g.nailShape === "square" && i === 0
          ? `M${-nw / 2},${ny + nlen} L${-nw / 2},${ny + nlen * 0.15} Q${-nw / 2},${ny} ${-nw * 0.3},${ny} L${nw * 0.3},${ny} Q${nw / 2},${ny} ${nw / 2},${ny + nlen * 0.15} L${nw / 2},${ny + nlen} Q0,${ny + nlen * 1.18} ${-nw / 2},${ny + nlen} Z`
          : `M${-nw / 2},${ny + nlen} C${-nw * 0.55},${ny + nlen * 0.4} ${-nw * (g.nailShape === "oval" ? 0.4 : 0.5)},${ny} 0,${ny} C${nw * (g.nailShape === "oval" ? 0.4 : 0.5)},${ny} ${nw * 0.55},${ny + nlen * 0.4} ${nw / 2},${ny + nlen} Q0,${ny + nlen * 1.2} ${-nw / 2},${ny + nlen} Z`;
        return (
          <g key={i}>
            <g transform={tr}>
              <defs>
                <linearGradient id={`${uid}-tf${i}`} gradientUnits="userSpaceOnUse" x1="0" y1={-s} x2="0" y2={-s - 0.34 * V}>
                  <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity="1" />
                </linearGradient>
                <mask id={`${uid}-tm${i}`} maskUnits="userSpaceOnUse" x={-w * 2} y={-F * 1.5} width={w * 4} height={F * 3}><rect x={-w * 2} y={-F * 1.5} width={w * 4} height={F * 3} fill={`url(#${uid}-tf${i})`} /></mask>
              </defs>
              {i > 0 ? <g mask={`url(#${uid}-tm${i})`}><path d={`${d} Z`} transform={`translate(${-w * 0.16},1.2)`} fill="#000" opacity={0.3} filter={`url(#${uid}-b1)`} /></g> : null}
              <path d={`${d} Z`} fill={`url(#${uid}-toe)`} mask={`url(#${uid}-tm${i})`} />
              <path d={smooth(pts.slice(1, -1), false, 0.9)} fill="none" stroke={line} strokeWidth={0.8} />
              {i > 0 ? <ellipse cx={0} cy={-s - 0.5 * V} rx={w * 0.34} ry={V * 0.13} fill={lighten(g.skin, 0.22)} opacity={0.55} filter={`url(#${uid}-b1)`} /> : null}
              {i === 0 ? <>
                <path d={`M${-w * 0.3},${-s - 0.44 * V} q${w * 0.3},${V * 0.05} ${w * 0.6},0`} fill="none" stroke={shade(g.skin, 0.75)} strokeWidth={0.6} opacity={0.7} />
                <path d={`M${-w * 0.22},${-s - 0.5 * V} q${w * 0.22},${V * 0.035} ${w * 0.44},0`} fill="none" stroke={shade(g.skin, 0.75)} strokeWidth={0.5} opacity={0.5} />
              </> : <path d={`M${-w * 0.3},${-s - 0.6 * V} q${w * 0.3},${-V * 0.05} ${w * 0.6},0`} fill="none" stroke={shade(g.skin, 0.74)} strokeWidth={0.5} opacity={0.6} />}
              {/* the pad of the tip, rounder and pinker than the rest */}
              <ellipse cx={0} cy={-F + V * 0.12} rx={w * 0.42} ry={V * 0.14} fill={mix(g.skin, "#e79a90", 0.14)} opacity={0.6} filter={`url(#${uid}-b1)`} />
              {g.prosthetic ? null : <>
                <path d={`M${-nw * 0.62},${ny + nlen * 1.08} Q0,${ny + nlen * 1.35} ${nw * 0.62},${ny + nlen * 1.08}`} fill="none" stroke={shade(g.skin, 0.72)} strokeWidth={0.6} opacity={0.8} />
                <path d={nailPath} fill={nail.fill} stroke={shade(nail.fill, 0.7)} strokeWidth={0.45} />
                {g.dirt > 0.45 ? <path d={`M${-nw * 0.42},${ny + nlen * 0.12} Q0,${ny - nlen * 0.1} ${nw * 0.42},${ny + nlen * 0.12}`} fill="none" stroke={g.dirtColour} strokeWidth={Math.max(0.6, nlen * 0.1)} strokeLinecap="round" opacity={Math.min(0.85, g.dirt)} /> : null}
                {!nail.painted && i === 0 ? <path d={`M${-nw * 0.3},${ny + nlen * 0.98} Q0,${ny + nlen * 0.7} ${nw * 0.3},${ny + nlen * 0.98}`} fill={lighten(nail.fill, 0.45)} opacity={0.8} /> : null}
                {!nail.painted || nail.french ? <path d={`M${-nw * 0.46},${ny + nlen * 0.2} Q0,${ny - nlen * 0.05} ${nw * 0.46},${ny + nlen * 0.2}`} fill="none" stroke="#fbfaf6" strokeWidth={Math.max(0.7, nlen * (nail.french ? 0.26 : 0.1))} strokeLinecap="round" opacity={nail.french ? 1 : 0.55} /> : null}
                <ellipse cx={-nw * 0.22} cy={ny + nlen * 0.42} rx={nw * 0.07} ry={nlen * 0.2} fill="#fff" opacity={nail.painted ? 0.28 : 0.18} filter={`url(#${uid}-b1)`} />
              </>}
              {ring && i === 1 ? <rect x={-w * 0.53} y={-s - V * 0.2} width={w * 1.06} height={2.3} rx={1.1} fill={METAL(ring)} stroke={shade(METAL(ring), 0.65)} strokeWidth={0.3} /> : null}
            </g>
          </g>
        );
      })}
      {/* between the toes: the webs, darkened */}
      {web.filter((_, k) => k % 2 === 1).map(([wx, wy], k) => <ellipse key={k} cx={wx} cy={wy - 1} rx={1.4} ry={2.2} fill={shadow} opacity={0.55} filter={`url(#${uid}-b1)`} />)}

      {/* the leg rises toward you out of the back of the foot: a soft round light, a crease where it meets the instep */}
      <g clipPath={`url(#${uid}-body)`}>
        <ellipse cx={X(0.0)} cy={Y(0.155)} rx={W * 0.3} ry={L * 0.1} fill={lighten(g.skin, 0.12)} opacity={0.45} filter={`url(#${uid}-b6)`} />
        <path d={smooth([[X(-0.36), Y(0.2)], [X(-0.15), Y(0.27)], [X(0.12), Y(0.27)], [X(0.36), Y(0.19)]], false)} fill="none" stroke={shade(g.skin, 0.75)} strokeWidth={3} opacity={0.3} filter={`url(#${uid}-b3)`} />
        <ellipse cx={X(-0.4)} cy={Y(0.2)} rx={W * 0.07 * g.ankle} ry={L * 0.03 * g.ankle} fill={lighten(g.skin, 0.2)} opacity={0.6} filter={`url(#${uid}-b1)`} />
        <ellipse cx={X(0.41)} cy={Y(0.165)} rx={W * 0.06 * g.ankle} ry={L * 0.028 * g.ankle} fill={lighten(g.skin, 0.12)} opacity={0.5} filter={`url(#${uid}-b1)`} />
      </g>
      {anklet ? <path d={smooth([[X(-0.44), Y(0.2)], [X(-0.2), Y(0.245)], [X(0.1), Y(0.245)], [X(0.44), Y(0.17)]], false)} fill="none" stroke={METAL(anklet)} strokeWidth={1.8} strokeDasharray="2.2 1.2" /> : null}
    </svg>
  );
}

/* ── from below ─────────────────────────────────────────────────────────────────────────────── */

/** The sole, seen from underneath: the same outline mirrored (from below the big toe is on the
 *  right), with the pads that carry her weight, the arch that doesn't touch the ground, the creases,
 *  and whatever has been done to it. */
function SoleView({ p, g, uid }: { p: Person; g: FootGenes; uid: string }) {
  const { f, L, W, X, Y, toes, med, lat, web, heelPt, body, toePts } = plan(p, g);
  const caned = Math.min(8, p.acts?.["bastinado"] ?? 0);
  const nail = nailColour(g, f.toenails);
  const rosy = mix(g.sole, "#e2877f", 0.2);
  const pale = lighten(g.sole, 0.12);
  const callus = "#d9c48e";
  const hollow = Math.min(1, g.archH / 0.05);
  const line = shade(g.sole, 0.72);
  const E = (u: number, v: number, rx: number, ry: number, fill: string, op: number, blur = "b3", rot = 0) =>
    <ellipse cx={X(u)} cy={Y(v)} rx={rx} ry={ry} fill={fill} opacity={op} filter={`url(#${uid}-${blur})`} transform={rot ? `rotate(${rot} ${X(u)} ${Y(v)})` : undefined} />;
  return (
    <svg viewBox="0 0 200 290" className="w-full h-auto" role="img" aria-label="the sole of her foot">
      <defs>
        <filter id={`${uid}-b1`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="330"><feGaussianBlur stdDeviation="1.1" /></filter>
        <filter id={`${uid}-b3`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="330"><feGaussianBlur stdDeviation="3.5" /></filter>
        <filter id={`${uid}-b6`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="330"><feGaussianBlur stdDeviation="7" /></filter>
        <clipPath id={`${uid}-sole`}><path d={body} /></clipPath>
        {g.dirt > 0.12 ? <DirtFilter uid={uid} colour={g.dirtColour} seed={g.seed} /> : null}
        <linearGradient id={`${uid}-stoe`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(g.sole, 0.86)} />
          <stop offset="0.4" stopColor={pale} />
          <stop offset="1" stopColor={shade(g.sole, 0.84)} />
        </linearGradient>
      </defs>
      <g transform="translate(200 0) scale(-1 1)">
        <ellipse cx={X(0.02)} cy={Y(0.45)} rx={W * 0.62} ry={L * 0.52} fill="#000" opacity={0.28} filter={`url(#${uid}-b6)`} />
        <path d={body} fill={g.sole} />
        <g clipPath={`url(#${uid}-sole)`}>
          {/* the sole curls up at the edges into the side of the foot */}
          <path d={body} fill="none" stroke={shade(g.skin, 0.9)} strokeWidth={W * 0.16} opacity={0.55} filter={`url(#${uid}-b3)`} />
          {/* the arch: lifted off the ground, paler and smoother, with a soft edge where it rises */}
          {E(-0.26, 0.42, W * 0.26, L * 0.16 * (0.6 + hollow * 0.4), pale, 0.5 + hollow * 0.4, "b6")}
          {hollow > 0.3 ? <path d={smooth([[X(-0.05), Y(0.26)], [X(-0.02), Y(0.42)], [X(-0.1), Y(0.58)]], false)} fill="none" stroke={shade(g.sole, 0.82)} strokeWidth={4} opacity={0.35 * hollow} filter={`url(#${uid}-b3)`} /> : null}
          {/* the pads that carry her: heel, the band down the outside, the ball */}
          {E(0.01, 0.1, W * 0.3, L * 0.1, rosy, 0.75)}
          <path d={smooth([[X(0.18), Y(0.16)], [X(0.3), Y(0.36)], [X(0.36), Y(0.56)]], false)} fill="none" stroke={rosy} strokeWidth={W * 0.2 * (1.3 - hollow * 0.4)} opacity={0.6} filter={`url(#${uid}-b3)`} />
          {E(0.02, 0.665, W * 0.46, L * 0.065, rosy, 0.8)}
          {E(-0.3, 0.68, W * 0.17, L * 0.06, rosy, 0.7)}
          {E(0.3, 0.63, W * 0.13, L * 0.05, rosy, 0.55)}
          {/* the crease between the ball and the toes */}
          <path d={smooth([[X(-0.44), Y(0.735)], [X(-0.1), Y(0.72)], [X(0.2), Y(0.7)], [X(0.44), Y(0.675)]], false)} fill="none" stroke={line} strokeWidth={0.9} opacity={0.7} />
          {/* fine creases in the arch */}
          {[0.34, 0.4, 0.47].map((v, k) => <path key={k} d={`M${X(-0.38 + k * 0.03)},${Y(v)} q${W * 0.1},${-2} ${W * 0.2},${1}`} fill="none" stroke={line} strokeWidth={0.5} opacity={0.35} />)}
          {f.soles === "calloused" && g.dirt < 0.5 ? <>
            {E(0.01, 0.08, W * 0.22, L * 0.06, callus, 0.75, "b1")}
            {E(-0.3, 0.68, W * 0.12, L * 0.04, callus, 0.7, "b1")}
            {E(0.32, 0.63, W * 0.08, L * 0.03, callus, 0.6, "b1")}
            {E(-0.47, 0.8, W * 0.05, L * 0.05, callus, 0.55, "b1")}
          </> : f.soles === "soft" ? <>
            {E(-0.05, 0.12, W * 0.12, L * 0.03, "#fff", 0.35, "b3")}
            {E(-0.1, 0.67, W * 0.18, L * 0.025, "#fff", 0.3, "b3")}
          </> : null}
          {/* dirt where she stands: heel and ball first, the outside edge, then everything but the arch */}
          {g.dirt > 0.12 ? (() => {
            // Where she stands: heel and ball, the outside edge, and, once it's bad, everything but the arch.
            const areas = <>
              <ellipse cx={X(0.01)} cy={Y(0.1)} rx={W * (0.24 + g.dirt * 0.12)} ry={L * (0.08 + g.dirt * 0.04)} fill={g.dirtColour} />
              <ellipse cx={X(0.02)} cy={Y(0.67)} rx={W * (0.34 + g.dirt * 0.14)} ry={L * (0.05 + g.dirt * 0.03)} fill={g.dirtColour} />
              {g.dirt > 0.3 ? <path d={smooth([[X(0.2), Y(0.14)], [X(0.32), Y(0.36)], [X(0.37), Y(0.58)]], false)} fill="none" stroke={g.dirtColour} strokeWidth={W * 0.18 * (1.4 - hollow * 0.5)} /> : null}
              {g.dirt > 0.6 ? <ellipse cx={X(0.08)} cy={Y(0.4)} rx={W * 0.36 * (1 - hollow * 0.4)} ry={L * 0.28} fill={g.dirtColour} opacity={0.55} /> : null}
            </>;
            return <>
              <g filter={`url(#${uid}-b6)`} opacity={Math.min(0.9, 0.15 + g.dirt * 0.8)}>{areas}</g>
              <g filter={`url(#${uid}-dirt)`} opacity={Math.min(0.55, g.dirt * 0.6)}>{areas}</g>
            </>;
          })() : null}
          {/* welts from the cane, across the tender parts */}
          {Array.from({ length: caned }, (_, i) => { const v = [0.15, 0.5, 0.35, 0.62, 0.25, 0.42, 0.56, 0.08][i]; return <path key={i} d={smooth([[X(-0.42), Y(v + 0.01)], [X(0), Y(v)], [X(0.42), Y(v - 0.012)]], false)} fill="none" stroke="#b1323d" strokeWidth={2.2} opacity={0.6} filter={`url(#${uid}-b1)`} />; })}
        </g>
        <path d={smooth(med, false, 0.95)} fill="none" stroke={shade(g.skin, 0.62)} strokeWidth={0.9} />
        <path d={smooth([...lat, ...heelPt, med[0]], false, 0.95)} fill="none" stroke={shade(g.skin, 0.62)} strokeWidth={0.9} />
        {/* toes from underneath: pads, and a crease where each meets the foot */}
        {[...toes].reverse().map((t) => {
          const i = t.i;
          const w = t.w * W;
          const V = g.vis[i] * L;
          const F = V + L * 0.05;
          const s = F - V;
          const pts = toePts(i, w, F, V);
          const d = smooth(pts, false, 0.9);
          return (
            <g key={i} transform={`translate(${X(t.cx)},${Y(g.bases[i]) + s}) rotate(${g.angles[i]})`}>
              <defs>
                <linearGradient id={`${uid}-sf${i}`} gradientUnits="userSpaceOnUse" x1="0" y1={-s} x2="0" y2={-s - 0.34 * V}>
                  <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity="1" />
                </linearGradient>
                <mask id={`${uid}-sm${i}`} maskUnits="userSpaceOnUse" x={-w * 2} y={-F * 1.5} width={w * 4} height={F * 3}><rect x={-w * 2} y={-F * 1.5} width={w * 4} height={F * 3} fill={`url(#${uid}-sf${i})`} /></mask>
              </defs>
              {nail.painted && i < 3 ? <path d={`M${-w * 0.3},${-F + 1.2} Q0,${-F - 1.4} ${w * 0.3},${-F + 1.2}`} fill="none" stroke={nail.fill} strokeWidth={1.6} strokeLinecap="round" /> : null}
              <path d={`${d} Z`} fill={`url(#${uid}-stoe)`} mask={`url(#${uid}-sm${i})`} />
              <path d={smooth(pts.slice(1, -1), false, 0.9)} fill="none" stroke={shade(g.skin, 0.62)} strokeWidth={0.8} />
              <ellipse cx={0} cy={-F + V * (i === 0 ? 0.32 : 0.28)} rx={w * 0.4} ry={V * (i === 0 ? 0.26 : 0.22)} fill={rosy} opacity={0.75} filter={`url(#${uid}-b1)`} />
              <path d={`M${-w * 0.38},${-s - 0.26 * V} q${w * 0.38},${V * 0.06} ${w * 0.76},0`} fill="none" stroke={line} strokeWidth={0.7} opacity={0.75} />
              {i === 0 ? <path d={`M${-w * 0.34},${-s - 0.55 * V} q${w * 0.34},${V * 0.05} ${w * 0.68},0`} fill="none" stroke={line} strokeWidth={0.6} opacity={0.6} /> : null}
              {g.dirt > 0.25 ? <ellipse cx={0} cy={-F + V * 0.3} rx={w * 0.36} ry={V * 0.22} fill={g.dirtColour} opacity={Math.min(0.75, g.dirt * 0.8)} filter={`url(#${uid}-b1)`} /> : null}
              {f.soles === "calloused" && i === 0 ? <ellipse cx={w * 0.3} cy={-s - 0.45 * V} rx={w * 0.15} ry={V * 0.2} fill={callus} opacity={0.5} filter={`url(#${uid}-b1)`} /> : null}
            </g>
          );
        })}
        {web.filter((_, k) => k % 2 === 1).map(([wx, wy], k) => <ellipse key={k} cx={wx} cy={wy - 1} rx={1.3} ry={2} fill={shade(g.skin, 0.55)} opacity={0.5} filter={`url(#${uid}-b1)`} />)}
      </g>
    </svg>
  );
}

/* ── from the inside ─────────────────────────────────────────────────────────────────────────── */

function SideView({ p, g, uid }: { p: Person; g: FootGenes; uid: string }) {
  const f = feetOf(p);
  const L = 262 * (f.size / 44) * (f.heels_clipped ? 0.72 : 1);
  const x0 = (320 - L) / 2, ground = 152;
  const a = g.archH, ins = g.instep, lift = g.toeLift;
  const clipped = f.heels_clipped && !g.prosthetic;
  // A clipped foot can't be brought up flat: it hangs pointed from the ankle and she stands on the
  // tips. Everything below the ankle turns about it; the leg stays upright; the bend is smooth.
  const A: Pt = [0.21, 0.27];
  const theta = clipped ? (30 * Math.PI) / 180 : 0;
  const bend = (x: number, y: number): Pt => {
    if (!theta) return [x, y];
    const t = theta * Math.max(0, Math.min(1, (0.36 - y) / 0.14));
    const dx = x - A[0], dy = y - A[1];
    return [A[0] + dx * Math.cos(t) + dy * Math.sin(t), A[1] - dx * Math.sin(t) + dy * Math.cos(t)];
  };
  const drop = theta ? -Math.min(...[[1.0, 0.034], [0.985, 0.016], [0.93, 0.004], [0.74, 0]].map(([x, y]) => bend(x, y)[1])) : 0;
  const P = (x: number, y: number): Pt => { const [bx, by] = bend(x, y); return [x0 + bx * L, ground - (by + drop) * L]; };
  const caned = Math.min(6, p.acts?.["bastinado"] ?? 0);
  const nail = nailColour(g, f.toenails);
  const anklet = f.jewelry.find((x) => /anklet|chain/i.test(x));
  const second = g.tips[1] - g.tips[0];
  const line = shade(g.skin, 0.6);

  // Heel → sole (heel pad, arch, ball at 69%, big toe) → tip → top of the toe → knuckle →
  // instep → front of the ankle → shin.  Then down the back: calf → Achilles → heel.
  const heelBack = 0.06 * g.heelRound;
  const sole: Pt[] = [
    P(0.0, heelBack), P(0.018, 0.018), P(0.06, 0.003), P(0.16, 0), P(0.26, a * 0.45), P(0.42, a), P(0.56, a * 0.5),
    P(0.66, 0.004), P(0.74, 0), P(0.8, 0.008), P(0.86, 0.005), P(0.93, 0.003 + lift * 0.3), P(0.975, 0.01 + lift),
  ];
  const tip: Pt[] = [P(0.997, 0.028 + lift), P(1.0, 0.045 + lift)];
  // The instep is a dome, not a ramp: it climbs fast off the big toe's knuckle and flattens toward
  // the ankle.
  const topLine: Pt[] = [
    P(0.99, 0.066 + lift), P(0.955, 0.083 + lift), P(0.89, 0.089 + lift * 0.5), P(0.835, 0.087), P(0.77, 0.112),
    P(0.66, 0.145 + ins * 0.4 + a * 0.3), P(0.55, 0.185 + ins * 0.7 + a * 0.5), P(0.44, 0.222 + ins + a * 0.5),
    P(0.35, 0.258 + ins * 0.6), P(0.315, 0.29), P(0.3, 0.34), P(0.295, 0.45), P(0.305, 0.58),
  ];
  const back: Pt[] = [P(0.065, 0.58), P(0.08, 0.45), P(0.085 + 0.015 * g.achilles, 0.32), P(0.06, 0.2), P(0.02, 0.12)];
  const outline = [...sole, ...tip, ...topLine, ...back];
  const shape = smooth(outline, true, 0.95);
  const mal = P(0.2, 0.25);

  return (
    <svg viewBox="0 0 320 172" className="w-full h-auto" role="img" aria-label="her foot from the inside">
      <defs>
        <filter id={`${uid}-s1`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="360" height="212"><feGaussianBlur stdDeviation="1.1" /></filter>
        <filter id={`${uid}-s3`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="360" height="212"><feGaussianBlur stdDeviation="3.2" /></filter>
        <clipPath id={`${uid}-side`}><path d={shape} /></clipPath>
        <clipPath id={`${uid}-floor`}><rect x="0" y="0" width="320" height={ground + 0.5} /></clipPath>
        <linearGradient id={`${uid}-fade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`${uid}-leg`}><rect x="0" y={P(0.2, 0.58)[1]} width="320" height={L * 0.7} fill={`url(#${uid}-fade)`} /></mask>
        <linearGradient id={`${uid}-lit`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={lighten(g.skin, 0.05)} />
          <stop offset="0.55" stopColor={g.skin} />
          <stop offset="1" stopColor={shade(g.skin, 0.86)} />
        </linearGradient>
      </defs>
      <ellipse cx={P(0.45, 0)[0]} cy={ground + 1.5} rx={L * 0.5} ry={3.5} fill="#000" opacity={clipped ? 0.2 : 0.4} filter={`url(#${uid}-s3)`} />
      <line x1={8} x2={312} y1={ground + 0.5} y2={ground + 0.5} stroke="currentColor" strokeOpacity={0.14} />
      <g clipPath={`url(#${uid}-floor)`}>
        <g mask={`url(#${uid}-leg)`}>
          {/* the lesser toes behind the big one; a Greek second toe shows past it */}
          <path d={smooth([P(0.78, 0.01), P(0.9 + second * 0.9, 0.006), P(0.975 + second, 0.02), P(0.97 + second, 0.045), P(0.9 + second * 0.5, 0.058), P(0.8, 0.07)], true)} fill={shade(g.skin, 0.74)} />
          <path d={shape} fill={`url(#${uid}-lit)`} />
          <g clipPath={`url(#${uid}-side)`}>
            {/* the sole: paler, pinker skin that shows along the bottom and fills the arch */}
            <path d={smooth([P(0.0, 0.02), P(0.14, 0.024), P(0.28, a * 0.55 + 0.03), P(0.42, a + 0.035), P(0.58, a * 0.5 + 0.028), P(0.72, 0.024), P(0.86, 0.02), P(1.0, 0.024), P(1.0, -0.05), P(0, -0.05)], true)} fill={g.sole} filter={`url(#${uid}-s1)`} />
            {f.soles === "calloused" ? <>
              <ellipse cx={P(0.08, 0)[0]} cy={P(0.08, 0)[1]} rx={L * 0.075} ry={L * 0.028} fill="#d5c08a" opacity={0.75} filter={`url(#${uid}-s1)`} />
              <ellipse cx={P(0.71, 0)[0]} cy={P(0.71, 0)[1]} rx={L * 0.07} ry={L * 0.024} fill="#d5c08a" opacity={0.7} filter={`url(#${uid}-s1)`} />
            </> : f.soles === "soft" ? <path d={smooth(sole, false)} fill="none" stroke="#f7c4bd" strokeWidth={L * 0.03} opacity={0.5} filter={`url(#${uid}-s1)`} /> : null}
            {g.dirt > 0.12 ? <path d={smooth([P(0.0, 0.03 + g.dirt * 0.012), P(0.14, 0.034 + g.dirt * 0.01), P(0.28, a * 0.45 + 0.03), P(0.42, a * 0.75 + 0.026), P(0.58, a * 0.4 + 0.028), P(0.72, 0.03 + g.dirt * 0.01), P(0.86, 0.026), P(1.0, 0.024), P(1.0, -0.05), P(0, -0.05)], true)} fill={g.dirtColour} opacity={Math.min(0.95, 0.3 + g.dirt * 0.75)} filter={`url(#${uid}-s1)`} /> : null}
            {/* the arch, in shadow */}
            <ellipse cx={P(0.44, a + 0.04)[0]} cy={P(0.44, a + 0.04)[1]} rx={L * 0.16} ry={L * 0.035} fill={shade(g.skin, 0.7)} opacity={0.45} filter={`url(#${uid}-s3)`} />
            {/* light along the top of the foot and the heel; shade under the ankle */}
            <path d={smooth(topLine.slice(3, 9), false)} fill="none" stroke={lighten(g.skin, 0.22)} strokeWidth={L * 0.035} opacity={0.6} filter={`url(#${uid}-s3)`} />
            <ellipse cx={P(0.05, 0.1)[0]} cy={P(0.05, 0.1)[1]} rx={L * 0.04} ry={L * 0.05} fill={lighten(g.skin, 0.18)} opacity={0.5} filter={`url(#${uid}-s3)`} />
            <ellipse cx={P(0.13, 0.27)[0]} cy={P(0.13, 0.27)[1]} rx={L * 0.022} ry={L * 0.06} fill={shade(g.skin, 0.78)} opacity={0.35} filter={`url(#${uid}-s3)`} />
            {/* the inside ankle bone, level with the top of the foot */}
            <ellipse cx={mal[0] + 1} cy={mal[1] + 2} rx={L * 0.038 * g.ankle} ry={L * 0.034 * g.ankle} fill={shade(g.skin, 0.72)} opacity={0.6} filter={`url(#${uid}-s1)`} />
            <ellipse cx={mal[0] - 0.5} cy={mal[1] - 0.5} rx={L * 0.034 * g.ankle} ry={L * 0.03 * g.ankle} fill={lighten(g.skin, 0.14)} opacity={0.9} filter={`url(#${uid}-s1)`} />
            {/* the big toe: knuckle, crease, and the pad */}
            <ellipse cx={P(0.77, 0.085)[0]} cy={P(0.77, 0.085)[1]} rx={L * 0.035} ry={L * 0.022} fill={lighten(g.skin, 0.15)} opacity={0.6} filter={`url(#${uid}-s1)`} />
            <path d={smooth([P(0.838, 0.082), P(0.84, 0.062), P(0.846, 0.045)], false)} fill="none" stroke={shade(g.skin, 0.72)} strokeWidth={0.6} opacity={0.7} />
            <path d={smooth([P(0.79, 0.004), P(0.8, 0.018), P(0.805, 0.03)], false)} fill="none" stroke={shade(g.skin, 0.7)} strokeWidth={0.7} opacity={0.7} />
            {g.veins > 0.05 ? <path d={smooth([P(0.58, 0.11), P(0.44, 0.15), P(0.3, 0.19), P(0.24, 0.22)], false)} fill="none" stroke="#6f86b8" strokeWidth={1.2} opacity={g.veins} filter={`url(#${uid}-s1)`} /> : null}
            {Array.from({ length: caned }, (_, i) => { const [cx, cy] = P(0.12 + i * 0.09, (i > 1 && i < 5 ? a * 0.7 : 0) + 0.006); return <path key={i} d={`M${cx - 2.5},${cy - 4} l4,7`} stroke="#a92a36" strokeWidth={1.6} opacity={0.7} filter={`url(#${uid}-s1)`} />; })}
          </g>
          <path d={smooth([...back, ...sole, ...tip, ...topLine], false, 0.95)} fill="none" stroke={line} strokeWidth={0.9} />
          {/* the Achilles tendon */}
          <path d={smooth([P(0.12, 0.5), P(0.1, 0.36), P(0.075, 0.22)], false)} fill="none" stroke={lighten(g.skin, 0.12)} strokeWidth={1.6} opacity={0.6} filter={`url(#${uid}-s1)`} />
          {clipped ? <path d={`M${P(0.07, 0.29)[0]},${P(0.07, 0.29)[1]} l${L * 0.04},${-1.5}`} stroke="#c56a6a" strokeWidth={1.8} strokeLinecap="round" /> : null}
          {/* the big toenail, seen edge-on */}
          {g.prosthetic ? null : <path d={smooth([P(0.925, 0.081 + lift), P(0.962, 0.079 + lift), P(0.99, 0.064 + lift)], false)} fill="none" stroke={nail.fill} strokeWidth={3.4} strokeLinecap="round" />}
          {g.prosthetic ? null : <path d={smooth([P(0.93, 0.087 + lift), P(0.962, 0.085 + lift)], false)} fill="none" stroke="#fff" strokeWidth={0.8} opacity={0.45} />}
          {anklet ? <path d={smooth([P(0.3, 0.37), P(0.2, 0.345), P(0.1, 0.37)], false)} fill="none" stroke={METAL(anklet)} strokeWidth={2} strokeDasharray="2.4 1.3" /> : null}
        </g>
      </g>
    </svg>
  );
}

export default function FeetArt({ person }: { person: Person }) {
  const { save, mutate } = useGame();
  const f = feetOf(person);
  const box = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [showPhoto, setShowPhoto] = useState(true);
  const photos = person.feet_photos;
  const model = save.models.photo_model ?? "";
  const photograph = async () => {
    if (!box.current || busy || !model) return;
    setBusy(true);
    const views = ["top", "sole", "side"] as const;
    const desc = describeFeet(person);
    const results = await Promise.allSettled(views.map(async (v) => {
      const svg = box.current!.querySelector<SVGSVGElement>(`[data-view="${v}"] svg`);
      if (!svg) throw new Error("view not found");
      const png = await svgToPng(svg, v === "side" ? 2.5 : 3);
      return toJpeg(await redraw(model, png, redrawPrompt(v, desc)));
    }));
    mutate((s) => {
      const p = s.people[person.id];
      const got: Record<string, string> = {};
      results.forEach((r, i) => { if (r.status === "fulfilled") got[views[i]] = r.value; });
      const err = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
      p.feet_photos = { ...(p.feet_photos ?? {}), ...got, model, week: s.arcology.week, error: err ? String(err.reason?.message ?? err.reason) : undefined };
    });
    setShowPhoto(true);
    setBusy(false);
  };
  const Photo = ({ v }: { v: "top" | "sole" | "side" }) => (showPhoto && photos?.[v] ? <img src={photos[v]} alt={`her foot, ${v}`} className="w-full h-auto rounded" /> : null);
  const genes = useMemo(() => footGenes(person), [person.id, person.body.skin, person.body.weight, person.body.marks.length, f.shape, f.width, f.arch]);
  // Dirt changes week to week with her job, her shoes and the city, so it isn't memoised with the bones.
  const d = soleDirt(person, save);
  const g = { ...genes, dirt: genes.prosthetic ? 0 : d.level, dirtColour: ({ earth: "#4a3826", grime: "#34302c", dust: "#7a6b5a" } as const)[d.kind] };
  const uid = `ft${idHash(person.id, "uid").toString(36)}`;
  const cm = (f.size / 1.5 - 1.5).toFixed(1);
  const label = { egyptian: "Egyptian", greek: "Greek", roman: "Roman", germanic: "Germanic", celtic: "Celtic" }[f.shape ?? "egyptian"];
  return (
    <div className="card-2 p-3">
      <div ref={box}>
        <div className="grid grid-cols-2 gap-3 items-end">
          <div data-view="top"><Photo v="top" /><div className={showPhoto && photos?.top ? "hidden" : ""}><TopView p={person} g={g} uid={uid} /></div><div className="text-[10.5px] dim text-center">from above</div></div>
          <div data-view="sole"><Photo v="sole" /><div className={showPhoto && photos?.sole ? "hidden" : ""}><SoleView p={person} g={g} uid={`${uid}s`} /></div><div className="text-[10.5px] dim text-center">the sole</div></div>
        </div>
        <div className="mt-2" data-view="side"><Photo v="side" /><div className={showPhoto && photos?.side ? "hidden" : ""}><SideView p={person} g={g} uid={uid} /></div><div className="text-[10.5px] dim text-center">from the inside{f.heels_clipped ? " · tendons clipped" : ""}</div></div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <button className="btn btn-sm" disabled={busy || !model || !hasApiKey()} title={!model ? "Choose a photo model in Settings" : undefined} onClick={() => void photograph()}>
          {busy ? "redrawing…" : photos ? "Redraw as photos again" : "Redraw as photos"}
        </button>
        {photos ? <button className="btn btn-sm btn-ghost" onClick={() => setShowPhoto((x) => !x)}>{showPhoto ? "show the drawing" : "show the photos"}</button> : null}
        {!model ? <span className="text-[11px] dim">Pick a photo model in Settings to redraw these as photographs.</span> : photos ? <span className="text-[11px] dim">{photos.model} · week {photos.week}</span> : null}
        {photos?.error ? <span className="text-[11px] bad w-full">{photos.error}</span> : null}
      </div>
      <div className="text-[11.5px] mid mt-2 text-center">
        EU {f.size} · {cm} cm · {label} toes · {f.width ?? "average"} · {f.arch} arch · {f.soles} soles{f.toenails !== "bare" ? ` · ${f.toenails} nails` : ""}
      </div>
    </div>
  );
}

/** The three drawings on their own, without the photo controls (for tests and previews). */
export { TopView, SoleView, SideView };
