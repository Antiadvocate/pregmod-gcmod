/**
 * HER FEET, STANDING — on the full-body figure, bare.
 *
 * The pack draws bare feet pointed, as if she were in heels; Warp's replacement drew two flat
 * cones with lines for toes. Neither is a foot. This draws each one the way a standing foot looks
 * from the front and a little above: the ankle with its two bones (the outer one lower), the top
 * of the foot sloping away and widening to the ball, a bunion if she has one, and five separate
 * toes, the big one long and wide on the inside and the rest stepping down, each with a rounded
 * pad at the tip, a nail (in her polish), a knuckle crease, and shadow between them. A soft
 * highlight runs down the top of the foot with the tendons to the toes under it, and she casts a
 * shadow on the floor.
 *
 * Her toe lengths and widths, foot type (Egyptian, Greek...), width, bunion, tucked little toe,
 * nail shape and polish come from the same record the close-up views read (FeetArt.footGenes), so
 * the feet on her figure are the feet on her page.
 *
 * Drawn in the pack's coordinates over the bottom of each leg: the legs end at about y 845 with
 * ankles 12–16 wide, and these take over from y 812, matching the leg's width there.
 */
import type { Person } from "../engine/types";
import { feetOf } from "../engine/genitals";
import { footGenes, nailColour, smooth } from "../views/FeetArt";
import { shade } from "./vectorart";

type Pt = [number, number];

const EGYPTIAN = [1.0, 0.974, 0.944, 0.906, 0.862];

function mixHex(a: string, b: string, k: number): string {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - k) + ((B >> s) & 255) * k);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
}

/** One foot in local coordinates: origin at the top of the ankle, y down, +x toward her other foot. */
function footShape(p: Person) {
  const g = footGenes(p);
  const f = feetOf(p);
  const wide = g.widthRatio / 0.375;
  const B = g.bunion;
  const outer: Pt[] = [
    [-8.5, 0], [-8.7, 13], [-11.2, 23.5], [-10.4, 29], [-9.6, 33], [-11.6 * wide, 46], [-14.6 * wide, 62], [-17.4 * wide, 78], [-18.6 * wide, 90],
  ];
  const inner: Pt[] = [
    [(17.4 + B * 2.6) * wide, 91], [(17.2 + B * 1.4) * wide, 80], [14.6 * wide, 64], [12.2, 50], [11.6, 37], [12.8, 27], [10.6, 17.5], [8.5, 6], [8.5, 0],
  ];

  // Toes across the front, big toe on the inside.
  const sumW = g.toeW.reduce((a, b) => a + b, 0);
  const span = 34.5 * wide;
  const len0 = [13.8, 10.6, 9.4, 8.3, 7.0].map((l, i) => l * (g.tips[i] / EGYPTIAN[i]) * (0.94 + g.vis[i] / ([0.24, 0.158, 0.142, 0.125, 0.102][i] * 16)));
  let cursor = (16.8 + B * 1.2) * wide;
  const toes = g.toeW.map((w0, i) => {
    const w = (w0 / sumW) * span * 0.94;
    const cx = cursor - w / 2;
    cursor -= w + (g.gaps[i] ?? 0) * 40;
    // How far back each toe starts: the big toe and the second set furthest forward.
    const base = [95, 97.5, 98.5, 97.5, 95][i] + (i === 4 ? g.pinkyTuck * 2 : 0);
    // Splay: the big toe leans in toward the others (more with a bunion), the small ones out.
    const lean = [-(g.angles[0] - 2) * 0.22, -0.4, -0.9, -1.6, -2.4 - g.pinkyTuck * 2][i];
    return { i, cx, w, base, len: len0[i], lean };
  });
  const web: Pt[] = [];
  for (const t of toes) web.push([t.cx, t.base + 1.5]);
  web.reverse();
  const outline = [...outer, ...web.map(([x, y]) => [x, y + 0.5] as Pt), ...inner];
  return { g, f, outline, toes, wide };
}

/** A toe seen from the front and above: narrow where it leaves the foot, the pad at the tip a
 *  little wider and round. Closed for the fill; `sides` is the same edge without the base, for the
 *  outline, so the toe grows out of the foot instead of sitting on it. */
function toePath(w: number, L: number, bulb: number): { fill: string; sides: string } {
  const pts: Pt[] = [
    [-0.42 * w, -5], [-0.44 * w, 0.2 * L], [-0.5 * w * bulb, 0.55 * L], [-0.5 * w * bulb, 0.78 * L], [-0.32 * w, 0.97 * L], [0, L + 0.3],
    [0.32 * w, 0.97 * L], [0.5 * w * bulb, 0.78 * L], [0.5 * w * bulb, 0.55 * L], [0.44 * w, 0.2 * L], [0.42 * w, -5],
  ];
  return { fill: smooth(pts, true, 0.85), sides: smooth(pts.slice(1, -1), false, 0.85) };
}

function nailPath(w: number, L: number, shape: string, nw: number): string {
  // Seen from the front and above, the nail sits on the top of the toe toward the tip.
  const x = (w * nw) / 2, top = 0.5 * L, bot = 0.86 * L;
  const r = shape === "square" ? 0.25 : shape === "oval" ? 0.7 : 0.5;
  const pts: Pt[] = [
    [-x, top + (bot - top) * 0.1], [-x * 0.98, bot - (bot - top) * r * 0.5], [-x * (1 - r * 0.5), bot], [0, bot + 0.6],
    [x * (1 - r * 0.5), bot], [x * 0.98, bot - (bot - top) * r * 0.5], [x, top + (bot - top) * 0.1], [0, top - 0.6],
  ];
  return smooth(pts, true, 0.8);
}

function OneFoot({ p, side, at, scope, k }: { p: Person; side: 1 | -1; at: Pt; scope: string; k: number }) {
  const { g, outline, toes } = footShape(p);
  const skin = g.skin;
  const dark = shade(skin, 0.55), deep = shade(skin, 0.38);
  const nail = nailColour(g, feetOf(p).toenails ?? "bare");
  // Her right foot turns out to the viewer's left, her left to the right.
  const turn = side === 1 ? 5 : -5;
  const t = `translate(${at[0]} ${at[1]}) rotate(${turn}) scale(${side * k} ${k})`;
  const body = smooth(outline, true, 0.95);
  const id = `${scope}-foot${side}`;
  return (
    <g transform={t}>
      <defs><clipPath id={id}><path d={body} /></clipPath></defs>
      {/* The foot. */}
      <path d={body} fill={skin} />
      {/* Shading on the top of the foot: light down the middle, the sides rolling away. */}
      <g clipPath={`url(#${id})`}>
        <g filter={`url(#${scope}-sfb2)`}>
          <ellipse cx={-13} cy={70} rx={6} ry={30} fill={dark} opacity={0.35} />
          <ellipse cx={14} cy={66} rx={4} ry={24} fill={dark} opacity={0.22} />
          <ellipse cx={1.5} cy={66} rx={6} ry={26} fill="#fff" opacity={0.2} />
          <ellipse cx={-10.4} cy={25} rx={2.6} ry={3.2} fill="#fff" opacity={0.28} />
          <ellipse cx={11.8} cy={28} rx={2.4} ry={3} fill="#fff" opacity={0.26} />
          <ellipse cx={-9} cy={31} rx={2.2} ry={2} fill={dark} opacity={0.3} />
          <ellipse cx={11} cy={35} rx={2.2} ry={2} fill={dark} opacity={0.3} />
        </g>
        {/* Tendons fanning from the front of the ankle to the toes. */}
        <g fill="none" strokeLinecap="round" opacity={0.12 + g.tendons * 0.28} filter={`url(#${scope}-sfb05)`}>
          {toes.map((to) => (
            <path key={to.i} d={`M${(to.cx * 0.25).toFixed(2)} 44 Q${(to.cx * 0.6).toFixed(2)} 72 ${to.cx.toFixed(2)} ${to.base - 2}`} stroke={to.i === 0 ? "#fff" : dark} strokeWidth={to.i === 0 ? 1.4 : 0.8} opacity={to.i === 0 ? 0.6 : 0.18} />
          ))}
        </g>
        {g.veins > 0.12 ? <path d="M-6 50 q6 8 4 18 q-2 8 5 14" stroke="#6f8fb8" strokeWidth={0.6} fill="none" opacity={g.veins * 0.8} /> : null}
        {/* The dark of the gaps where the toes start. */}
        <ellipse cx={0} cy={99} rx={20} ry={3} fill={deep} opacity={0.35} filter={`url(#${scope}-sfb05)`} />
      </g>
      {/* Toes, small to big so the big toe sits in front. */}
      {[...toes].reverse().map((to) => (
        <g key={to.i} transform={`translate(${to.cx} ${to.base}) rotate(${to.lean})`}>
          <path d={toePath(to.w, to.len, g.bulb).fill} fill={skin} />
          <path d={toePath(to.w, to.len, g.bulb).sides} fill="none" stroke={deep} strokeWidth={0.45} strokeOpacity={0.55} />
          {/* The pad under the tip, a little pinker, and the shadow down each side. */}
          <ellipse cx={0} cy={to.len * 0.9} rx={to.w * 0.36} ry={to.len * 0.1} fill={shade(skin, 0.9)} opacity={0.5} />
          <path d={`M${-to.w * 0.46} ${to.len * 0.1} q${-to.w * 0.05} ${to.len * 0.4} ${to.w * 0.05} ${to.len * 0.75}`} stroke={dark} strokeWidth={0.6} fill="none" opacity={0.3} />
          {/* The knuckle crease. */}
          <path d={`M${-to.w * 0.28} ${to.len * 0.3} q${to.w * 0.28} ${to.len * 0.06} ${to.w * 0.56} 0`} stroke={dark} strokeWidth={0.4} fill="none" opacity={0.45} />
          <path d={nailPath(to.w, to.len, g.nailShape, g.nailW)} fill={nail.painted ? nail.fill : mixHex(nail.fill, "#f2b8b4", 0.25)} opacity={nail.painted ? 0.96 : 0.9} stroke={shade(skin, 0.62)} strokeWidth={0.3} strokeOpacity={0.6} />
          {!nail.painted ? <path d={`M${-to.w * 0.22} ${to.len * 0.86} q${to.w * 0.22} ${to.len * 0.05} ${to.w * 0.44} 0`} stroke="#fff" strokeWidth={0.6} fill="none" opacity={0.55} /> : null}
          <ellipse cx={-to.w * 0.1} cy={to.len * 0.62} rx={to.w * 0.1} ry={to.len * 0.07} fill="#fff" opacity={nail.painted ? 0.55 : 0.4} />
        </g>
      ))}
    </g>
  );
}

/** Both feet, where the legs end. Her right foot (viewer's left) and her left. */
export function StandingFeet({ p, scope }: { p: Person; scope: string }) {
  const f = feetOf(p);
  // Bigger feet are bigger; within reason, since the figure's legs are a fixed width.
  const k = Math.max(0.9, Math.min(1.12, (f.size ?? 38) / 38.5));
  return (
    <g pointerEvents="none">
      <defs>
        <filter id={`${scope}-sfb2`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" /></filter>
        <filter id={`${scope}-sfb05`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.5" /></filter>
      </defs>
      {/* Her shadow on the floor, under both feet. */}
      <ellipse cx={295} cy={812 + 112 * k} rx={58} ry={5.5} fill="#000" opacity={0.35} filter={`url(#${scope}-sfb2)`} />
      <OneFoot p={p} side={1} at={[262.2, 812]} scope={scope} k={k} />
      <OneFoot p={p} side={-1} at={[328, 812]} scope={scope} k={k} />
    </g>
  );
}
