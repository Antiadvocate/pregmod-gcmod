/**
 * HER FEET, DRAWN — from above and from the side.
 *
 * Everything that is recorded about her feet shows: size (they are drawn to scale against each
 * other), which toe is longest, width, arch, soles, nails, jewelry, clipped tendons, caning. What
 * is not recorded comes from her id, the way a real foot's particulars come from nobody deciding
 * them: each toe's length and lean, the gaps between them, a bunion or none, a tucked little toe,
 * how bony the ankle is, how high the instep, the heel's shape, nail shape, veins, moles. Two women
 * with the same numbers still do not have the same feet.
 */
import { useMemo } from "react";
import type { Person } from "../engine/types";
import { feetOf, idHash } from "../engine/genitals";
import { rng } from "../engine/rng";
import { SKIN, match, shade } from "../lib/vectorart";

type Pt = [number, number];

/** A smooth path through points (Catmull-Rom, converted to cubic Béziers). */
function smooth(pts: Pt[], closed: boolean, k = 1): string {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * k, p1[1] + ((p2[1] - p0[1]) / 6) * k];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * k, p2[1] - ((p3[1] - p1[1]) / 6) * k];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? `${d} Z` : d;
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

const NAIL: [RegExp, string][] = [
  [/french/i, "#f6d9d4"], [/pale pink/i, "#f3b8c4"], [/pink/i, "#ec6f9c"], [/red/i, "#b3182c"], [/black/i, "#1d1a1c"],
  [/white/i, "#f4f1ec"], [/gold/i, "#d4a93c"], [/purple/i, "#5b2169"], [/navy|blue/i, "#1f2e63"], [/silver/i, "#c5c9cf"],
  [/green/i, "#2f6b45"], [/orange|coral/i, "#e8663d"],
];
const METAL = (s: string) => (/silver|platinum|steel/i.test(s) ? "#d4d8de" : /rose/i.test(s) ? "#d9a08a" : "#d8b04a");

/** Tip positions (fraction of foot length) of the five toes, big toe first, per foot type. */
const TIPS: Record<string, number[]> = {
  egyptian: [1.0, 0.972, 0.942, 0.905, 0.86],
  greek: [0.972, 1.0, 0.958, 0.912, 0.862],
  roman: [1.0, 0.994, 0.986, 0.93, 0.872],
  germanic: [1.0, 0.944, 0.94, 0.934, 0.872],
  celtic: [0.978, 1.0, 0.93, 0.922, 0.864],
};

export interface FootGenes {
  tips: number[]; bases: number[]; toeW: number[]; angles: number[]; gaps: number[];
  widthRatio: number; heelRatio: number; bunion: number; pinkyTuck: number; bulb: number;
  nailShape: "round" | "square" | "oval"; nailW: number;
  archH: number; instep: number; ankle: number; achilles: number; heelRound: number; toeLift: number;
  skin: string; sole: string; veins: number; tendons: number; moles: { t: number; x: number; r: number }[];
  prosthetic: boolean;
}

export function footGenes(p: Person): FootGenes {
  const f = feetOf(p);
  const r = rng(idHash(p.id, "feet-art"));
  const j = (s: number) => (r() - 0.5) * 2 * s;
  const tips = (TIPS[f.shape ?? "egyptian"] ?? TIPS.egyptian).map((t, i) => t + (i ? j(0.009) : 0));
  const pinkyTuck = r() < 0.35 ? 0.4 + r() * 0.6 : r() * 0.25;
  tips[4] -= pinkyTuck * 0.025;
  // How much of each toe shows past the web. Big toe long and broad; the rest short and round.
  const stubby = 0.88 + r() * 0.24;
  const bases = [0.2, 0.155, 0.14, 0.125, 0.11].map((len, i) => tips[i] - len * stubby * (1 + j(0.07)));
  const widthRatio = ({ narrow: 0.355, average: 0.385, wide: 0.425 } as const)[f.width ?? "average"] + j(0.012);
  const toeW = [0.31, 0.178, 0.168, 0.158, 0.145].map((w, i) => w * (1 + j(0.06)) * (i === 0 ? 1 + j(0.05) : 1));
  const valgus = r() < 0.2 ? 8 + r() * 8 : 1 + r() * 6;
  const angles = [valgus, 2 + j(2.5), j(2), -2 + j(2.5), -5 - pinkyTuck * 7 + j(2.5)];
  const sandal = r() < 0.3 ? 0.03 + r() * 0.03 : 0.008 + r() * 0.01;
  const gaps = [sandal, 0.006 + r() * 0.008, 0.005 + r() * 0.008, 0.004 + r() * 0.01];
  const archBase = { flat: 0.012, normal: 0.034, high: 0.058 }[f.arch];
  const prosthetic = p.body.marks.some((m) => m.kind === "prosthetic" && /feet|foot|leg/i.test(m.where));
  // Skin: the table gives the family, her id nudges it so two "olive" women are not the same olive.
  const base = match(SKIN, p.body.skin, "#d9b48f");
  const nudged = shade(mix(base, r() < 0.5 ? "#e8b39b" : "#caa27c", 0.12 * r()), 0.96 + r() * 0.08);
  const skin = prosthetic ? "#9aa3ad" : nudged;
  const lum = (parseInt(skin.slice(1, 3), 16) + parseInt(skin.slice(3, 5), 16) + parseInt(skin.slice(5, 7), 16)) / 3;
  const sole = prosthetic ? "#7c848e" : mix(skin, lum > 170 ? "#f0b6a8" : "#e0b294", lum > 170 ? 0.35 : 0.55);
  const moles = Array.from({ length: r() < 0.55 ? r.int(1, 3) : 0 }, () => ({ t: 0.3 + r() * 0.4, x: j(0.3), r: 0.8 + r() * 1.2 }));
  return {
    tips, bases, toeW, angles, gaps, widthRatio, heelRatio: 0.6 + r() * 0.1, bunion: valgus > 8 ? (valgus - 8) / 8 : 0,
    pinkyTuck, bulb: 0.95 + r() * 0.12, nailShape: r.pick(["round", "square", "oval"] as const), nailW: 0.55 + r() * 0.15,
    archH: archBase * (0.85 + r() * 0.3), instep: j(0.025), ankle: 0.8 + r() * 0.5, achilles: 0.8 + r() * 0.4,
    heelRound: 0.8 + r() * 0.4, toeLift: j(0.012), skin, sole,
    veins: lum > 175 ? 0.18 + r() * 0.2 : r() * 0.08, tendons: 0.15 + (p.body.weight < 0 ? 0.2 : 0) + r() * 0.15, moles, prosthetic,
  };
}

/* ── from above ─────────────────────────────────────────────────────────────────────────────── */

function TopView({ p, g, uid }: { p: Person; g: FootGenes; uid: string }) {
  const f = feetOf(p);
  const L = 205 * (f.size / 42);
  const W = L * g.widthRatio;
  const cx = 100, pad = 12;
  const Y = (t: number) => pad + (1 - t) * L + (270 - L) / 2;
  const X = (x: number) => cx + x * W;
  const nail = /french/i.test(f.toenails) ? "#f6d9d4" : f.toenails && f.toenails !== "bare" ? match(NAIL, f.toenails, "#b3182c") : mix(g.skin, "#f4d3cc", 0.45);
  const painted = f.toenails && f.toenails !== "bare" && !g.prosthetic;
  const ring = f.jewelry.find((x) => /toe ring/i.test(x));
  const anklet = f.jewelry.find((x) => /anklet|chain/i.test(x));
  const tattoo = p.body.marks.find((m) => m.kind === "tattoo" && /foot|feet|ankle|toe/i.test(m.where));

  // The toes: centres across the front of the foot, big toe on the inside.
  let x = -0.5 + 0.02;
  const toes = g.toeW.map((w, i) => {
    const cxT = x + w / 2;
    x += w + (g.gaps[i] ?? 0);
    return { i, cx: cxT, w };
  });
  const spread = x - 0.5;
  for (const t of toes) t.cx -= spread / 2;
  // The little toe tucks in under the fourth rather than sticking out past the side of the foot.
  toes[4].cx -= toes[4].w * (0.15 + g.pinkyTuck * 0.25);

  const hw = (g.heelRatio / 2);
  const mal = 0.035 * g.ankle; // the ankle bones, showing either side of the leg
  const med: Pt[] = [
    [X(-hw * 0.55), Y(0.012)], [X(-hw * 0.92), Y(0.07)], [X(-hw * 1.0 - mal), Y(0.19)],
    [X(-hw * 1.0), Y(0.27)], [X(-hw * 1.03 - 0.02), Y(0.36)], [X(-0.45 + g.archH * 0.8), Y(0.47)], [X(-0.5), Y(0.6)],
    [X(-0.52 - g.bunion * 0.06), Y(g.bases[0] - 0.02)], [X(toes[0].cx - toes[0].w * 0.5), Y(g.bases[0] + 0.03)],
  ];
  const lat: Pt[] = [
    [X(toes[4].cx + toes[4].w * 0.5), Y(g.bases[4] + 0.02)], [X(0.505), Y(g.bases[4] - 0.05)], [X(0.49), Y(0.52)],
    [X(0.44), Y(0.4)], [X(hw * 1.0 + 0.02), Y(0.29)], [X(hw * 1.0 + mal * 0.8), Y(0.2)], [X(hw * 0.95), Y(0.1)], [X(hw * 0.6), Y(0.02)],
  ];
  // The web between the toes: dips between each pair, hidden behind the toes themselves.
  const web: Pt[] = [];
  toes.forEach((t, i) => {
    web.push([X(t.cx), Y(g.bases[i] + 0.035)]);
    if (i < 4) { const nx = (t.cx + t.w / 2 + toes[i + 1].cx - toes[i + 1].w / 2) / 2; web.push([X(nx), Y((g.bases[i] + g.bases[i + 1]) / 2 - 0.004)]); }
  });
  const heel: Pt[] = [[X(0), Y(0) + 1]];
  const outline: Pt[] = [...med, ...web, ...lat, ...heel];

  // A toe, pointing up, its base sunk into the foot so there is no seam. Open at the base for the
  // outline, closed for the fill.
  const toeSides = (w: number, len: number, b: number, sink: number) => `M${-w * 0.5},${sink} C${-w * 0.52},${-len * 0.35} ${-w * 0.46},${-len * 0.55} ${-w * 0.48 * b},${-len * 0.74} C${-w * 0.52 * b},${-len * 0.93} ${-w * 0.3},${-len} 0,${-len} C${w * 0.3},${-len} ${w * 0.52 * b},${-len * 0.93} ${w * 0.48 * b},${-len * 0.74} C${w * 0.46},${-len * 0.55} ${w * 0.52},${-len * 0.35} ${w * 0.5},${sink}`;

  return (
    <svg viewBox="0 0 200 290" className="w-full h-auto" role="img" aria-label="her foot from above">
      <defs>
        <linearGradient id={`${uid}-top`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(g.skin, 0.84)} />
          <stop offset="0.42" stopColor={g.skin} />
          <stop offset="1" stopColor={shade(g.skin, 0.82)} />
        </linearGradient>
        <linearGradient id={`${uid}-toe`} x1="0" x2="0" y1="1" y2="0">
          <stop offset="0" stopColor={g.skin} stopOpacity="0" />
          <stop offset="0.3" stopColor={g.skin} />
          <stop offset="0.7" stopColor={g.skin} />
          <stop offset="1" stopColor={g.prosthetic ? g.skin : mix(g.skin, "#e59a92", 0.16)} />
        </linearGradient>
        <radialGradient id={`${uid}-leg`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={shade(g.skin, 1.05)} stopOpacity="0.9" />
          <stop offset="0.75" stopColor={shade(g.skin, 1.0)} stopOpacity="0.5" />
          <stop offset="1" stopColor={shade(g.skin, 0.9)} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* the foot */}
      <path d={smooth(outline, true, 0.9)} fill={`url(#${uid}-top)`} />
      <path d={smooth(med, false, 0.9)} fill="none" stroke={shade(g.skin, 0.68)} strokeWidth={0.9} />
      <path d={smooth([...lat, ...heel, med[0]], false, 0.9)} fill="none" stroke={shade(g.skin, 0.68)} strokeWidth={0.9} />
      <path d={smooth(web.filter((_, k) => k % 2 === 1), false)} fill="none" stroke={shade(g.skin, 0.8)} strokeWidth={0.5} opacity={0.35} />
      {/* extensor tendons, and veins where the skin is pale enough to show them */}
      {toes.slice(0, 4).map((t, i) => (
        <path key={i} d={`M${X(t.cx)},${Y(g.bases[i] - 0.01)} Q${X(t.cx * 0.75)},${Y(0.5)} ${X(t.cx * 0.35)},${Y(0.32)}`} fill="none" stroke={shade(g.skin, 1.07)} strokeWidth={1.6} opacity={g.tendons * 0.35} strokeLinecap="round" />
      ))}
      {g.veins > 0.05 ? <path d={`M${X(-0.4)},${Y(0.34)} C${X(-0.2)},${Y(0.54)} ${X(0.15)},${Y(0.57)} ${X(0.4)},${Y(0.44)}`} fill="none" stroke="#7d8fb5" strokeWidth={1.1} opacity={g.veins} /> : null}
      {g.moles.map((m, i) => <circle key={i} cx={X(m.x)} cy={Y(m.t)} r={m.r} fill={shade(g.skin, 0.45)} opacity={0.75} />)}
      {tattoo ? <path d={`M${X(0.28)},${Y(0.24)} c6,-10 -4,-18 3,-28 c5,-7 -2,-14 4,-22`} fill="none" stroke="#2a3140" strokeWidth={1.2} opacity={0.7} /> : null}
      {/* toes over the foot, little toe first so each one overlaps the next */}
      {[...toes].reverse().map((t) => {
        const i = t.i;
        const w = t.w * W;
        const len = (g.tips[i] - g.bases[i]) * L;
        const sink = L * 0.03;
        const nw = w * g.nailW * (i === 0 ? 1 : i === 4 ? 0.62 : 0.78);
        const nh = len * (i === 0 ? 0.4 : i === 4 ? 0.3 : 0.36);
        const d = toeSides(w, len, g.bulb, sink);
        return (
          <g key={i} transform={`translate(${X(t.cx)},${Y(g.bases[i])}) rotate(${g.angles[i]})`}>
            <path d={`${d} Z`} fill={`url(#${uid}-toe)`} />
            <path d={toeSides(w, len, g.bulb, -len * 0.12)} fill="none" stroke={shade(g.skin, 0.68)} strokeWidth={0.8} />
            <path d={`M${-w * 0.28},${-len * 0.38} q${w * 0.28},${len * 0.05} ${w * 0.56},0`} fill="none" stroke={shade(g.skin, 0.8)} strokeWidth={0.5} opacity={0.55} />
            {g.prosthetic ? null : g.nailShape === "square"
              ? <rect x={-nw / 2} y={-len * 0.95} width={nw} height={nh} rx={nw * 0.2} fill={nail} stroke={shade(nail, 0.75)} strokeWidth={0.4} opacity={painted ? 1 : 0.8} />
              : <ellipse cx={0} cy={-len * 0.95 + nh / 2} rx={nw / 2} ry={nh / 2 * (g.nailShape === "oval" ? 1.1 : 0.95)} fill={nail} stroke={shade(nail, 0.75)} strokeWidth={0.4} opacity={painted ? 1 : 0.8} />}
            {/french/i.test(f.toenails) ? <path d={`M${-nw / 2 + 0.5},${-len * 0.92} q${nw / 2 - 0.5},${-nh * 0.3} ${nw - 1},0`} fill="none" stroke="#fbfbf8" strokeWidth={Math.max(1, nh * 0.22)} strokeLinecap="round" /> : null}
            {ring && i === 1 ? <rect x={-w * 0.53} y={-len * 0.3} width={w * 1.06} height={2.2} rx={1} fill={METAL(ring)} stroke={shade(METAL(ring), 0.7)} strokeWidth={0.3} /> : null}
          </g>
        );
      })}
      {/* where the leg comes down onto it */}
      <ellipse cx={X(0.02)} cy={Y(0.19)} rx={W * 0.3} ry={L * 0.07} fill={`url(#${uid}-leg)`} />
      {anklet ? <ellipse cx={X(0.02)} cy={Y(0.19)} rx={W * 0.36} ry={L * 0.075} fill="none" stroke={METAL(anklet)} strokeWidth={1.6} strokeDasharray="2 1.4" /> : null}
    </svg>
  );
}

/* ── from the side ──────────────────────────────────────────────────────────────────────────── */

function SideView({ p, g, uid }: { p: Person; g: FootGenes; uid: string }) {
  const f = feetOf(p);
  const L = 250 * (f.size / 46);
  const x0 = (320 - L) / 2, ground = 150;
  const P = (x: number, y: number): Pt => [x0 + x * L, ground - y * L];
  const a = g.archH, ins = g.instep, lift = g.toeLift;
  const clipped = f.heels_clipped && !g.prosthetic;
  const caned = Math.min(6, p.acts?.["bastinado"] ?? 0);
  const nail = f.toenails && f.toenails !== "bare" ? match(NAIL, f.toenails, "#b3182c") : mix(g.skin, "#f4d3cc", 0.45);
  const anklet = f.jewelry.find((x) => /anklet|chain/i.test(x));
  const second = g.tips[1] - g.tips[0];

  const bottom: Pt[] = [P(0.0, 0.075 * g.heelRound), P(0.045, 0.006), P(0.14, 0), P(0.26, a * 0.45), P(0.42, a), P(0.6, a * 0.25), P(0.72, 0), P(0.81, 0.008), P(0.93, 0.004 + lift * 0.3), P(1.0, 0.03 + lift)];
  const top: Pt[] = [P(0.99, 0.064 + lift), P(0.91, 0.082 + lift), P(0.79, 0.1), P(0.62, 0.13 + ins * 0.5 + a * 0.4), P(0.46, 0.19 + ins * 0.8 + a * 0.5), P(0.33, 0.27 + ins * 0.5), P(0.305, 0.42), P(0.3, 0.5)];
  const back: Pt[] = [P(0.1, 0.5), P(0.095, 0.4), P(0.085 * g.achilles + 0.01, 0.27), P(0.03, 0.17 * g.heelRound)];
  const outline = [...bottom, ...top, ...back];
  // A clipped foot can't come down flat: she stands on the ball of it with the heel held up.
  const pivot = P(0.8, 0.004);

  return (
    <svg viewBox="0 0 320 170" className="w-full h-auto" role="img" aria-label="her foot from the side">
      <defs>
        <linearGradient id={`${uid}-side`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={g.skin} stopOpacity="0" />
          <stop offset="0.3" stopColor={g.skin} />
          <stop offset="0.8" stopColor={shade(g.skin, 0.9)} />
          <stop offset="1" stopColor={shade(g.skin, 0.8)} />
        </linearGradient>
        <clipPath id={`${uid}-clip`}><path d={smooth(outline, true, 0.95)} /></clipPath>
        <clipPath id={`${uid}-floor`}><rect x="0" y="0" width="320" height={ground + 1} /></clipPath>
      </defs>
      <line x1={10} x2={310} y1={ground + 0.5} y2={ground + 0.5} stroke="currentColor" strokeOpacity={0.18} />
      <g clipPath={`url(#${uid}-floor)`}><g transform={clipped ? `rotate(22 ${pivot[0]} ${pivot[1]})` : undefined}>
        {/* the lesser toes, behind the big one; a Greek foot's second toe shows past it */}
        <path d={smooth([P(0.76, 0.012), P(0.9 + second, 0.01), P(0.985 + second, 0.03), P(0.95 + second, 0.055), P(0.8, 0.07)], true)} fill={shade(g.skin, 0.84)} stroke={shade(g.skin, 0.66)} strokeWidth={0.6} />
        <path d={smooth(outline, true, 0.95)} fill={`url(#${uid}-side)`} />
        <g clipPath={`url(#${uid}-clip)`}>
          {/* the sole: its colour, and callus or softness where the weight goes */}
          <path d={smooth(bottom, false)} fill="none" stroke={g.sole} strokeWidth={L * 0.05} />
          {f.soles === "calloused" ? <>
            <ellipse cx={P(0.08, 0)[0]} cy={ground} rx={L * 0.07} ry={L * 0.03} fill="#d8c58f" opacity={0.75} />
            <ellipse cx={P(0.74, 0)[0]} cy={ground} rx={L * 0.07} ry={L * 0.025} fill="#d8c58f" opacity={0.7} />
          </> : f.soles === "soft" ? <path d={smooth(bottom, false)} fill="none" stroke="#f6c6c0" strokeWidth={L * 0.02} opacity={0.5} /> : null}
          {Array.from({ length: caned }, (_, i) => { const [cx, cy] = P(0.2 + i * 0.07, a * 0.5 + 0.004); return <line key={i} x1={cx - 2} x2={cx + 2} y1={cy - 3} y2={cy + 4} stroke="#b0303a" strokeWidth={1.4} opacity={0.65} />; })}
        </g>
        <path d={smooth([...back, ...bottom, ...top], false, 0.95)} fill="none" stroke={shade(g.skin, 0.66)} strokeWidth={0.9} />
        {/* ankle bone and the Achilles tendon */}
        <ellipse cx={P(0.2, 0.265)[0]} cy={P(0.2, 0.265)[1]} rx={L * 0.03 * g.ankle} ry={L * 0.026 * g.ankle} fill={shade(g.skin, 1.05)} stroke={shade(g.skin, 0.8)} strokeWidth={0.5} opacity={0.8} />
        <path d={smooth([P(0.1, 0.46), P(0.085 * g.achilles + 0.02, 0.3), P(0.05, 0.19)], false)} fill="none" stroke={shade(g.skin, 0.82)} strokeWidth={1} opacity={0.55} />
        {clipped ? <path d={`M${P(0.075, 0.255)[0]},${P(0.075, 0.255)[1]} l${L * 0.035},${-2}`} stroke="#c86c6c" strokeWidth={1.6} strokeLinecap="round" /> : null}
        {/* the big toenail */}
        {g.prosthetic ? null : <path d={smooth([P(0.94, 0.066 + lift), P(0.975, 0.062 + lift), P(0.992, 0.05 + lift)], false)} fill="none" stroke={nail} strokeWidth={3.2} strokeLinecap="round" />}
        {anklet ? <path d={smooth([P(0.3, 0.36), P(0.2, 0.345), P(0.1, 0.37)], false)} fill="none" stroke={METAL(anklet)} strokeWidth={1.8} strokeDasharray="2.2 1.4" /> : null}
        {g.veins > 0.05 ? <path d={smooth([P(0.55, 0.12), P(0.4, 0.16), P(0.27, 0.2)], false)} fill="none" stroke="#7d8fb5" strokeWidth={1} opacity={g.veins} /> : null}
      </g></g>
    </svg>
  );
}

export default function FeetArt({ person }: { person: Person }) {
  const f = feetOf(person);
  const g = useMemo(() => footGenes(person), [person.id, person.body.skin, person.body.weight, person.body.marks.length]);
  const uid = `ft${idHash(person.id, "uid").toString(36)}`;
  const cm = (f.size / 1.5 - 1.5).toFixed(1);
  const label = { egyptian: "Egyptian", greek: "Greek", roman: "Roman", germanic: "Germanic", celtic: "Celtic" }[f.shape ?? "egyptian"];
  return (
    <div className="card-2 p-3">
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 items-end">
        <div><TopView p={person} g={g} uid={uid} /><div className="text-[10.5px] dim text-center">from above</div></div>
        <div><SideView p={person} g={g} uid={uid} /><div className="text-[10.5px] dim text-center">from the side{f.heels_clipped ? " · tendons clipped" : ""}</div></div>
      </div>
      <div className="text-[11.5px] mid mt-2 text-center">
        EU {f.size} · {cm} cm · {label} toes · {f.width ?? "average"} · {f.arch} arch · {f.soles} soles{f.toenails !== "bare" ? ` · ${f.toenails} nails` : ""}
      </div>
    </div>
  );
}
