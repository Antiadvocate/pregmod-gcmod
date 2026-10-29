/**
 * THE CITY FROM ABOVE.
 *
 * Your arcology on its platform out in what's left of the world. Every district is a building you
 * can tap, drawn in its era (ruin, salvage, Free City, ascendant), in your culture's style, at the
 * height its level bought. The platform, the sprawl round it and the crowds on its roads grow and
 * shrink with the population; past the sprawl, the Old World's ruins, fewer the bigger you get.
 * Whatever you've built for war is here too: the runway, the rocket on its pad, ships offshore,
 * drones over the spire, the shield, satellites crossing.
 *
 * Moving parts are SMIL animations on the SVG itself, so nothing here re-renders to animate.
 */
import { useMemo, type ReactNode } from "react";
import { useGame } from "../lib/game";
import { cityOf, cityYield, type District } from "../engine/city";
import { DISTRICT_BY_KIND, RINGS, type DistrictKind } from "../data/districts";
import { hourFrom, styleOf, STYLES, type Style } from "../lib/cityart";
import {
  biomeOf, eraOf, hash, lookOf, mix, noise, plotOf, prism, projection, pts, ring, shade, SKY, VIEW_H, VIEW_W,
  type Era, type Finish, type Proj,
} from "../lib/iso";
import { empireOf, has, units } from "../engine/power";
import { globeOf } from "../engine/globe";
import { freedInCity } from "../engine/freed";
import { designHeight, drawDesign, perimeterWall, type Kit } from "./isoBuildings";

const SALVAGE = ["#7a5236", "#5f6a47", "#6b4a3f", "#4f5f6a", "#8a6a3a"];
const TARP = ["#3f6d8f", "#b0642c", "#8a8f3a"];

interface Thing { depth: number; node: ReactNode }

export default function IsoCity({ onPick, selected }: { onPick?: (id: string) => void; selected?: string | null }) {
  const { save } = useGame();
  const city = cityOf(save);
  const arc = save.arcology;
  const look = lookOf(city);
  const finish: Finish = look.finish ?? "rebuilt";
  const doctrine = styleOf(arc.doctrines);
  const style: Style = look.style && look.style !== "auto" ? look.style : doctrine.style;
  const strength = look.style && look.style !== "auto" ? 1 : doctrine.strength;
  const hour = hourFrom(save.scene.time);
  const sky = SKY[hour];
  const biome = biomeOf(arc.region);
  const e = empireOf(save);
  const tech = Math.min(1, Object.values(globeOf(save).tech).filter((t) => t.done).length * 0.12 + (has(save, "ai_net") ? 0.3 : 0) + (has(save, "launch") ? 0.2 : 0));
  const pop = arc.population;

  // How big the city is. The platform widens, the sprawl thickens and the ruins recede as people come.
  const growth = Math.max(0, Math.min(6, Math.sqrt(pop / 1100) * 1.6 - 1.6));
  const R = 7.7 + growth;
  const reach = R + 6.5;
  const p = projection(Math.min(34, 395 / reach));
  const y = cityYield(save);
  const housed = 400 + y.housing;

  const key = [
    city.districts.map((d) => `${d.kind}${d.level}${Math.round(d.condition / 10)}`).join(), Math.round(pop / 80), hour, style, Math.round(strength * 10), finish,
    Object.entries(e.arsenal).map(([k, v]) => `${k}${v}`).join(), Math.round(tech * 10), Math.round(arc.prosperity / 10), Math.round(arc.security / 10), selected,
  ].join("|");

  const scene = useMemo(() => {
    const things: Thing[] = [];
    const ground: ReactNode[] = [];
    const air: ReactNode[] = [];

    /* the land, and the sea along its back edge */
    const L = reach + 3;
    const BIG = L * 3, COAST = -(R + 4.5);
    ground.push(<polygon key="land" points={pts([p.at(-BIG, -BIG), p.at(BIG, -BIG), p.at(BIG, BIG), p.at(-BIG, BIG)])} fill={shade(biome.ground, sky.light)} />);
    ground.push(<polygon key="sea" points={pts([p.at(-BIG, -BIG), p.at(BIG, -BIG), p.at(BIG, COAST), p.at(-BIG, COAST)])} fill={shade(biome.water, sky.light)} />);
    ground.push(<line key="surf" x1={p.at(-BIG, COAST)[0]} y1={p.at(-BIG, COAST)[1]} x2={p.at(BIG, COAST)[0]} y2={p.at(BIG, COAST)[1]} stroke="#cfe3ea" strokeOpacity={0.4} strokeWidth={2}><animate attributeName="stroke-opacity" values="0.15;0.5;0.15" dur="4s" repeatCount="indefinite" /></line>);
    for (let i = 0; i < 9; i++) {
      const [x1, y1] = p.at(-L + 1 + i * 3, COAST - 1.4 - (i % 3)), [x2, y2] = p.at(-L + 2.2 + i * 3, COAST - 1.4 - (i % 3));
      ground.push(<line key={`w${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9fc3d8" strokeOpacity={0.35} strokeWidth={1.5}><animate attributeName="stroke-opacity" values="0.1;0.45;0.1" dur={`${3 + (i % 3)}s`} repeatCount="indefinite" /></line>);
    }
    // Dunes and cracks, and the Old World highway running out to nowhere.
    for (let i = 0; i < 26; i++) {
      const t = noise(11, i) * Math.PI * 2, r = R + 1 + noise(13, i) * (L - R - 1);
      if (Math.sin(t) * r < COAST + 0.6) continue;
      const [x, yy] = p.at(Math.cos(t) * r, Math.sin(t) * r);
      ground.push(<ellipse key={`d${i}`} cx={x} cy={yy} rx={14 + noise(17, i) * 26} ry={5 + noise(19, i) * 8} fill={shade(biome.dust, sky.light * 0.95)} opacity={0.55} />);
    }
    const hw0 = p.at(R, 0.4), hw1 = p.at(L, 0.4), hw2 = p.at(L, 1.4), hw3 = p.at(R, 1.4);
    ground.push(<polygon key="hwy" points={pts([hw0, hw1, hw2, hw3])} fill={shade("#3b3a38", sky.light)} />);
    for (let i = 0; i < 6; i++) { const a = p.at(R + 0.6 + i * 1.1, 0.9), b = p.at(R + 1.1 + i * 1.1, 0.9); ground.push(<line key={`hl${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#c9b26a" strokeOpacity={0.5} strokeWidth={1.4} />); }

    /* the platform */
    ground.push(<path key="rim" d={ring(p, R, 0)} fill={shade("#3c3f45", sky.light)} />);
    ground.push(<path key="deck" d={ring(p, R, 9)} fill={shade(mix("#5d6068", STYLES[style].stone, strength * 0.35), sky.light)} stroke={shade("#2a2c31", sky.light)} strokeWidth={1.5} />);
    for (const rr of [1.7, 3.75, 5.85]) ground.push(<path key={`road${rr}`} d={ring(p, rr, 9)} fill="none" stroke={shade("#33353b", sky.light)} strokeWidth={p.s * 0.28} />);
    for (let i = 0; i < 6; i++) {
      const t = (i / 6) * Math.PI * 2 + 0.2;
      const a = p.at(Math.cos(t) * 1.7, Math.sin(t) * 1.7, 9), b = p.at(Math.cos(t) * R * 0.97, Math.sin(t) * R * 0.97, 9);
      ground.push(<line key={`av${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={shade("#33353b", sky.light)} strokeWidth={p.s * 0.22} />);
    }

    /* the districts */
    const weight = (d: District) => (d.kind === "vacant" ? 0 : d.level * (d.kind === "residential" ? 4 : d.kind === "spire" ? 2 : 1));
    const total = city.districts.reduce((n, d) => n + weight(d), 0) || 1;
    // Headcounts on the spire, the few fullest districts and whatever you've picked; all of them is a rash.
    const labelled = new Set([...city.districts].filter((d) => d.kind !== "vacant").sort((a, b) => weight(b) - weight(a)).slice(0, 4).map((d) => d.id).concat(["d-core", selected ?? ""]));
    // The spire stands over everything, whatever else you raise.
    const tallest = Math.max(0, ...city.districts.filter((d) => d.kind !== "spire" && d.kind !== "vacant").map(heightOf));
    for (const d of city.districts) {
      const slots = RINGS.find((r) => r.id === d.ring)?.slots ?? 6;
      const at = plotOf(d, slots);
      const era = eraOf(d, finish, tech);
      const people = labelled.has(d.id) ? Math.round((pop * weight(d)) / total) : 0;
      const h = d.kind === "spire" ? Math.max(heightOf(d), tallest * 1.3) : heightOf(d);
      things.push({ depth: at.x + at.y, node: <Building key={d.id} p={p} d={d} x={at.x} y={at.y} hw={at.hw} h={h} era={era} finish={finish} style={style} strength={strength} hour={hour} people={people} picked={selected === d.id} onPick={onPick} /> });
    }

    /* the border wall, if there is one: round the whole platform, taller with its level */
    const wall = Math.max(0, ...city.districts.filter((d) => d.kind === "wall").map((d) => d.level));
    if (wall) things.push(...perimeterWall(p, R - 0.15, wall, sky.light, DISTRICT_BY_KIND.wall.hue));

    /* the sprawl: as many shacks and blocks as there are people the districts don't house */
    const over = Math.max(0, pop - housed * 0.6);
    const shacks = Math.round(Math.max(8, Math.min(120, 8 + over / 70 + pop / 260)));
    for (let i = 0; i < shacks; i++) {
      const t = noise(3, i) * Math.PI * 2, r = 7.5 + noise(5, i) * (R + 1.4 - 7.5);
      const x = Math.cos(t) * r, yy = Math.sin(t) * r;
      const rich = arc.prosperity > 90 && noise(7, i) < 0.5;
      const h = 8 + noise(9, i) * (rich ? 34 : 18);
      const hw = 0.26 + noise(15, i) * 0.22;
      const c = rich ? mix(STYLES[style].stone, "#7d8590", 0.5) : SALVAGE[Math.floor(noise(21, i) * SALVAGE.length)];
      const onDeck = r < R ? 9 : 0;
      things.push({ depth: x + yy, node: <Shack key={`s${i}`} p={p} x={x} y={yy} hw={hw} h={h} z={onDeck} color={c} light={sky.light} lamps={sky.lamps} seed={i} rich={rich} /> });
    }

    /* the Old World, out past the sprawl: fewer the more you have grown */
    const ruins = Math.round(Math.max(3, 16 - growth * 2.4));
    for (let i = 0; i < ruins; i++) {
      const t = noise(31, i) * Math.PI * 2, r = R + 2 + noise(33, i) * (L - R - 3);
      const x = Math.cos(t) * r, yy = Math.sin(t) * r;
      if (yy < -(R + 3.5)) continue;
      things.push({ depth: x + yy, node: <Ruin key={`r${i}`} p={p} x={x} y={yy} seed={i} light={sky.light} /> });
    }

    /* what you've built for war, and for reach */
    if (has(save, "airport")) {
      const a = [p.at(R + 1.6, 2.6), p.at(L - 0.5, 2.6), p.at(L - 0.5, 3.6), p.at(R + 1.6, 3.6)];
      ground.push(<polygon key="runway" points={pts(a)} fill={shade("#2d2f33", sky.light)} />);
      for (let i = 0; i < 8; i++) { const s0 = p.at(R + 2 + i * 0.9, 3.1), s1 = p.at(R + 2.4 + i * 0.9, 3.1); ground.push(<line key={`rw${i}`} x1={s0[0]} y1={s0[1]} x2={s1[0]} y2={s1[1]} stroke="#e8e2d0" strokeWidth={1.6} />); }
      things.push({ depth: R + 1.5 + 4.6, node: <Box key="terminal" p={p} x={R + 1.9} y={4.6} hw={0.7} hd={0.45} h={16} color="#8a95a5" light={sky.light} /> });
      const s0 = p.at(R + 2, 3.1, 0), s1 = p.at(L - 1, 3.1, 0);
      air.push(<g key="takeoff"><Plane /><animateMotion dur="16s" repeatCount="indefinite" path={`M${s0[0]} ${s0[1]} L${(s0[0] + s1[0]) / 2} ${(s0[1] + s1[1]) / 2} Q ${s1[0]} ${s1[1] - 40} ${s1[0] + 120} ${s1[1] - 260}`} rotate="auto" keyTimes="0;0.4;1" keyPoints="0;0.4;1" calcMode="linear" /></g>);
    }
    if (has(save, "airline") || units(save, "fighters")) {
      for (let i = 0; i < 2 + units(save, "fighters"); i++) air.push(<g key={`jet${i}`}><Plane small={i > 1} /><animateMotion dur={`${18 + i * 5}s`} begin={`-${i * 6}s`} repeatCount="indefinite" path={`M-60 ${120 + i * 40} Q ${VIEW_W / 2} ${40 + i * 20} ${VIEW_W + 60} ${160 + i * 30}`} rotate="auto" /></g>);
    }
    if (has(save, "launch")) things.push({ depth: -2 + R + 2.4, node: <Rocket key="rocket" p={p} x={-2.2} y={R + 2.4} light={sky.light} /> });
    const fleet = units(save, "patrol") + units(save, "frigates") * 2 + units(save, "subs") + units(save, "carrier") * 3;
    for (let i = 0; i < Math.min(8, fleet); i++) {
      const [x, yy] = p.at(-4 + i * 2.6, -(R + 6.2));
      ground.push(<g key={`ship${i}`} transform={`translate(${x} ${yy})`}><path d={i < units(save, "carrier") ? "M-26 0 h52 l-6 7 h-40 z" : "M-14 0 h28 l-5 6 h-18 z"} fill="#7a8696" /><rect x={-4} y={-6} width={8} height={6} fill="#929eae" /><animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;0 2;0 0" dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" /></g>);
    }
    for (let i = 0; i < Math.min(6, units(save, "batteries") * 2); i++) {
      const t = 2.2 + i * 0.25, x = Math.cos(t) * (R - 0.6), yy = Math.sin(t) * (R - 0.6);
      things.push({ depth: x + yy, node: <Launcher key={`ml${i}`} p={p} x={x} y={yy} /> });
    }
    const top = p.at(0, 0, 9 + 300);
    for (let i = 0; i < Math.min(10, units(save, "drones") * 2); i++) air.push(<circle key={`dr${i}`} r={2.6} fill="#20242c"><animateMotion dur={`${9 + (i % 4)}s`} begin={`-${i * 1.3}s`} repeatCount="indefinite" path={`M${top[0] - 90} ${top[1] + 40} a90 30 0 1 0 180 0 a90 30 0 1 0 -180 0`} /></circle>);
    if (has(save, "shield")) { const c = p.at(0, 0, 9); air.push(<ellipse key="shield" cx={c[0]} cy={c[1] - 120} rx={p.s * 6} ry={p.s * 5} fill="#8fd0ff" stroke="#bfe6ff" strokeWidth={1.5}><animate attributeName="opacity" values="0.05;0.14;0.05" dur="5s" repeatCount="indefinite" /></ellipse>); }
    if (has(save, "satellites")) for (let i = 0; i < 4; i++) air.push(<circle key={`sat${i}`} r={2} fill="#fff"><animateMotion dur={`${30 + i * 7}s`} begin={`-${i * 9}s`} repeatCount="indefinite" path={`M-20 ${20 + i * 18} L${VIEW_W + 20} ${60 + i * 10}`} /></circle>);

    things.sort((a, b) => a.depth - b.depth);
    return { ground, things, air };
  }, [key]);

  /* people on the roads: as many as the city has, within reason, by who they are */
  const walkers = useMemo(() => {
    const n = Math.round(Math.max(10, Math.min(80, pop / 70)));
    const slaves = Object.values(save.people).filter((x) => x.status === "owned").length + (save.menials?.owned ?? 0);
    const slaveShare = Math.min(0.6, slaves / Math.max(1, pop) * 4 + 0.08);
    const guardShare = 0.04 + arc.security / 600 + (units(save, "androids") ? 0.08 : 0);
    const freed = freedInCity(save).length;
    const out: ReactNode[] = [];
    const roads = [1.7, 3.75, 5.85].map((rr) => ring(p, rr, 9, 32));
    for (let i = 0; i < n; i++) {
      const roll = noise(41, i);
      const kind = roll < guardShare ? "guard" : roll < guardShare + slaveShare ? "slave" : i < freed ? "freed" : "citizen";
      const col = kind === "guard" ? (units(save, "androids") ? "#c9d4e4" : "#6fa0e8") : kind === "slave" ? "#e58fb0" : kind === "freed" ? "#9fe0a8" : "#e8e2d0";
      const road = roads[i % 3];
      const dur = 40 + (i % 7) * 9;
      out.push(
        <g key={`p${i}`}>
          <rect x={-2.2} y={-10} width={4.4} height={8} rx={1.6} fill={col} /><circle cx={0} cy={-13} r={2.8} fill={col} />
          <animateMotion dur={`${dur}s`} begin={`-${(i * 13) % dur}s`} repeatCount="indefinite" path={road} keyPoints={i % 2 ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear" />
        </g>,
      );
    }
    return { out, n };
  }, [Math.round(pop / 70), arc.security, p.s, save.menials?.owned]);

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full block" role="img" aria-label={`${arc.name} from above: ${pop.toLocaleString()} people`}>
      <defs>
        <linearGradient id="iso-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={sky.top} /><stop offset="100%" stopColor={sky.bottom} /></linearGradient>
        <linearGradient id="iso-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#bfe3ff" stopOpacity="0.55" /><stop offset="100%" stopColor="#3b5a7a" stopOpacity="0.2" /></linearGradient>
      </defs>
      <rect width={VIEW_W} height={VIEW_H} fill="url(#iso-sky)" />
      {hour === "night" || hour === "dusk" ? Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 113) % VIEW_W} cy={(i * 47) % 200} r={1} fill="#fff" opacity={0.25 + (i % 4) * 0.15} />) : null}
      {scene.ground}
      {walkers.out}
      {scene.things.map((t) => t.node)}
      {scene.air}
      <g fontSize={22} fill="#eef0f4" style={{ paintOrder: "stroke" }} stroke="#000" strokeOpacity={0.45} strokeWidth={3}>
        <text x={18} y={36} fontWeight={600}>{arc.name}</text>
        <text x={18} y={64} fontSize={18}>{pop.toLocaleString()} people · {walkers.n} on the roads · {biome.name}</text>
        <text x={18} y={88} fontSize={16} opacity={0.85}>{STYLES[style].name} · {finish === "grit" ? "wasteland grit" : finish === "gleaming" ? "gleaming" : "rebuilt"}{e.dictator ? " · capital of the world" : ""}</text>
      </g>
    </svg>
  );
}

/* ── the pieces ──────────────────────────────────────────────────────────────────────────────── */

function Box({ p, x, y, hw, hd, h, z = 9, color, light }: { p: Proj; x: number; y: number; hw: number; hd: number; h: number; z?: number; color: string; light: number }) {
  const f = prism(p, x, y, hw, hd, z, h);
  return <g><polygon points={f.left} fill={shade(color, light * 0.78)} /><polygon points={f.right} fill={shade(color, light * 0.6)} /><polygon points={f.top} fill={shade(color, light)} /></g>;
}

function Windows({ p, x, y, hw, h, z, lit, seed, color }: { p: Proj; x: number; y: number; hw: number; h: number; z: number; lit: number; seed: number; color: string }) {
  const out: ReactNode[] = [];
  for (let k = 0, zz = z + 9; zz < z + h - 5; zz += 10, k++) {
    const on = noise(seed, k) < lit + 0.15;
    const c = on ? color : "#1c2027";
    const a1 = p.at(x - hw * 0.85, y + hw, zz), a2 = p.at(x + hw * 0.85, y + hw, zz);
    const b1 = p.at(x + hw, y - hw * 0.85, zz), b2 = p.at(x + hw, y + hw * 0.85, zz);
    out.push(<line key={`l${k}`} x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]} stroke={c} strokeWidth={2.4} strokeDasharray="3 3" opacity={on ? 0.9 : 0.6} />);
    out.push(<line key={`r${k}`} x1={b1[0]} y1={b1[1]} x2={b2[0]} y2={b2[1]} stroke={c} strokeWidth={2.4} strokeDasharray="3 4" opacity={on ? 0.75 : 0.5} />);
  }
  return <g>{out}</g>;
}

function heightOf(d: District): number {
  return designHeight(d.kind, d.level, DISTRICT_BY_KIND[d.kind as DistrictKind]?.bulk ?? 0.3);
}

function kitFor(out: ReactNode[], p: Proj, light: number, lamps: number, win: string, base: string, seed: number, level: number, ascendant: boolean): Kit {
  return { out, p, light, lamps, win, base, seed, level, ascendant };
}

function Building({ p, d, x, y, hw, h, era, finish, style, strength, hour, people, picked, onPick }:
  { p: Proj; d: District; x: number; y: number; hw: number; h: number; era: Era; finish: Finish; style: Style; strength: number; hour: keyof typeof SKY; people: number; picked: boolean; onPick?: (id: string) => void }) {
  const sky = SKY[hour];
  const seed = hash(d.id);
  const z = 9;
  if (d.kind === "vacant") {
    // The Old World's, or nobody's: rubble, a broken frame, a fence.
    const f = prism(p, x, y, hw, hw, z, 0.5);
    return (
      <g onClick={() => onPick?.(d.id)} style={{ cursor: "pointer" }}>
        <polygon points={f.top} fill={shade("#4a4740", sky.light)} stroke={picked ? "var(--accent)" : "#00000033"} strokeWidth={picked ? 3 : 1} />
        {d.ring >= 2 ? <Ruin p={p} x={x + 0.1} y={y} seed={seed % 50} light={sky.light} small z={z} /> : null}
      </g>
    );
  }
  const def = DISTRICT_BY_KIND[d.kind as DistrictKind];
  const dressed = style !== "modern" && noise(seed, 1) < strength;
  const sty = STYLES[style];
  const base = d.kind === "spire" ? (dressed ? mix("#58637a", sty.stone, 0.75) : "#58637a")
    : era === "salvage" ? SALVAGE[seed % SALVAGE.length]
    : era === "ascendant" ? mix(def?.hue ?? "#6b7280", "#9fc8e8", 0.45)
    : dressed ? mix(def?.hue ?? "#6b7280", sty.stone, 0.6) : (def?.hue ?? "#6b7280");
  const lit = sky.lamps * (era === "salvage" ? 0.6 : 1);
  const win = era === "ascendant" ? "#bfe9ff" : "#f4d58a";
  const parts: ReactNode[] = [];
  const box = (bx: number, by: number, bhw: number, bh: number, bz: number, c: string, k: string) => {
    const f = prism(p, bx, by, bhw, bhw, bz, bh);
    parts.push(<g key={k}><polygon points={f.left} fill={shade(c, sky.light * 0.8)} /><polygon points={f.right} fill={shade(c, sky.light * 0.6)} /><polygon points={f.top} fill={shade(c, sky.light)} /></g>);
    return f;
  };

  if (d.kind === "spire") {
    // Setbacks, a mast, and the beacon.
    box(x, y, hw, h * 0.45, z, base, "s1");
    parts.push(<Windows key="w1" p={p} x={x} y={y} hw={hw} h={h * 0.45} z={z} lit={lit} seed={seed} color={win} />);
    box(x, y, hw * 0.72, h * 0.35, z + h * 0.45, mix(base, "#8090a8", 0.2), "s2");
    parts.push(<Windows key="w2" p={p} x={x} y={y} hw={hw * 0.72} h={h * 0.35} z={z + h * 0.45} lit={lit} seed={seed + 1} color={win} />);
    box(x, y, hw * 0.45, h * 0.2, z + h * 0.8, mix(base, "#a0b0c8", 0.3), "s3");
    if (dressed) parts.push(<Roof key="roof1" p={p} x={x} y={y} hw={hw} z={z + h * 0.45} style={style} light={sky.light} />);
    const m0 = p.at(x, y, z + h), m1 = p.at(x, y, z + h + 60);
    parts.push(<line key="mast" x1={m0[0]} y1={m0[1]} x2={m1[0]} y2={m1[1]} stroke="#b9c4d8" strokeWidth={2} />);
    parts.push(<circle key="beacon" cx={m1[0]} cy={m1[1]} r={4} fill="#ff4d3a"><animate attributeName="opacity" values="1;0.15;1" dur="1.6s" repeatCount="indefinite" /></circle>);
    if (era === "ascendant") { const c = p.at(x, y, z + h * 0.82); parts.push(<ellipse key="holo" cx={c[0]} cy={c[1]} rx={p.s * 1.6} ry={p.s * 0.6} fill="none" stroke="#7fe0ff" strokeWidth={2}><animate attributeName="opacity" values="0.2;0.9;0.2" dur="3s" repeatCount="indefinite" /></ellipse>); }
    if (dressed) parts.push(<Roof key="roof" p={p} x={x} y={y} hw={hw * 0.45} z={z + h} style={style} light={sky.light} />);
  } else if (drawDesign(kitFor(parts, p, sky.light, lit, win, base, seed, d.level, era === "ascendant"), d.kind, x, y, hw, z, h)) {
    // Its own design (views/isoBuildings). Scrap patches on the salvage era, as on the old boxes.
    if (era === "salvage") {
      const t = prism(p, x - hw * 0.2, y - hw * 0.2, hw * 0.4, hw * 0.35, z + h * 0.5, 2);
      parts.push(<polygon key="tarp" points={t.top} fill={shade(TARP[seed % TARP.length], sky.light)} />);
    }
  } else {
    box(x, y, hw, h, z, base, "b");
    parts.push(<Windows key="w" p={p} x={x} y={y} hw={hw} h={h} z={z} lit={lit} seed={seed} color={win} />);
    // Grit leaves the Collapse showing on half the city that's otherwise been rebuilt.
    if (era === "salvage" || (finish === "grit" && era === "freecity" && noise(seed, 6) < 0.55)) {
      // Corrugation, patches, a tarp.
      for (let i = 1; i < 6; i++) { const a = p.at(x - hw + (i * hw) / 3, y + hw, z), b = p.at(x - hw + (i * hw) / 3, y + hw, z + h); parts.push(<line key={`c${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#00000040" strokeWidth={1} />); }
      const pa = prism(p, x + hw * 0.3, y + hw, hw * 0.35, 0.01, z + h * 0.3, h * 0.25);
      parts.push(<polygon key="patch" points={pa.left} fill={shade(SALVAGE[(seed + 2) % SALVAGE.length], sky.light * 0.85)} />);
      const t = prism(p, x - hw * 0.2, y - hw * 0.2, hw * 0.55, hw * 0.5, z + h, 2);
      parts.push(<polygon key="tarp" points={t.top} fill={shade(TARP[seed % TARP.length], sky.light)} />);
      const a0 = p.at(x + hw * 0.5, y - hw * 0.5, z + h), a1 = p.at(x + hw * 0.5, y - hw * 0.5, z + h + 22);
      parts.push(<line key="ant" x1={a0[0]} y1={a0[1]} x2={a1[0]} y2={a1[1]} stroke="#9aa0a6" strokeWidth={1.4} />);
    }
    if (era === "ascendant") {
      const f = prism(p, x, y, hw, hw, z, h);
      parts.push(<polygon key="glassL" points={f.left} fill="url(#iso-glass)" />);
      const a = p.at(x - hw, y + hw, z + h - 2), b = p.at(x + hw, y + hw, z + h - 2), c2 = p.at(x + hw, y - hw, z + h - 2);
      parts.push(<polyline key="strip" points={pts([a, b, c2])} fill="none" stroke="#7fe0ff" strokeWidth={2}><animate attributeName="stroke-opacity" values="0.3;1;0.3" dur={`${2.5 + (seed % 3)}s`} repeatCount="indefinite" /></polyline>);
    }
    parts.push(<Feature key="feat" p={p} kind={d.kind} x={x} y={y} hw={hw} z={z + h} seed={seed} light={sky.light} />);
    if (dressed && era !== "salvage") parts.push(<Roof key="roof" p={p} x={x} y={y} hw={hw} z={z + h} style={style} light={sky.light} />);
  }

  const lab = p.at(x, y, z + h + (d.kind === "spire" ? 80 : 26));
  return (
    <g onClick={() => onPick?.(d.id)} style={{ cursor: "pointer" }}>
      {parts}
      {picked ? <polygon points={prism(p, x, y, hw + 0.08, hw + 0.08, z, 0.5).top} fill="none" stroke="var(--accent)" strokeWidth={3}><animate attributeName="stroke-opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" /></polygon> : null}
      {people > 0 ? (
        <g transform={`translate(${lab[0]} ${lab[1]})`} opacity={picked ? 1 : 0.9}>
          <rect x={-30} y={-15} width={60} height={22} rx={11} fill="#0d0f14" fillOpacity={0.72} />
          <circle cx={-18} cy={-8} r={3} fill="#e8e2d0" /><rect x={-21} y={-5} width={6} height={7} rx={2} fill="#e8e2d0" />
          <text x={6} y={1} textAnchor="middle" fontSize={15} fill="#eef0f4">{people >= 1000 ? `${(people / 1000).toFixed(1)}k` : people}</text>
        </g>
      ) : null}
    </g>
  );
}

/** What a kind of district has on its roof. */
function Feature({ p, kind, x, y, hw, z, seed, light }: { p: Proj; kind: string; x: number; y: number; hw: number; z: number; seed: number; light: number }) {
  const at = (dx: number, dy: number, dz = 0) => p.at(x + dx, y + dy, z + dz);
  switch (kind) {
    case "industrial": case "power": {
      const c = at(hw * 0.4, -hw * 0.4), top = at(hw * 0.4, -hw * 0.4, kind === "power" ? 40 : 30);
      return (
        <g>
          {kind === "power"
            ? <path d={`M${c[0] - 14} ${c[1]} Q ${c[0] - 6} ${(c[1] + top[1]) / 2} ${top[0] - 9} ${top[1]} L${top[0] + 9} ${top[1]} Q ${c[0] + 6} ${(c[1] + top[1]) / 2} ${c[0] + 14} ${c[1]} Z`} fill={shade("#a9adb3", light)} />
            : <rect x={c[0] - 4} y={top[1]} width={8} height={c[1] - top[1]} fill={shade("#6d6560", light)} />}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={top[0]} cy={top[1]} r={6} fill="#d8d8d8" opacity={0}>
              <animate attributeName="cy" values={`${top[1]};${top[1] - 60}`} dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
              <animate attributeName="r" values="5;16" dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.55;0" dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      );
    }
    case "docks": {
      const a = at(0, 0), b = at(0, 0, 50), c = at(-hw, hw * 0.4, 50);
      return <g><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#d0a443" strokeWidth={3} /><line x1={b[0]} y1={b[1]} x2={c[0]} y2={c[1]} stroke="#d0a443" strokeWidth={3} /><line x1={c[0]} y1={c[1]} x2={c[0]} y2={c[1] + 18} stroke="#888" strokeWidth={1}><animate attributeName="y2" values={`${c[1] + 10};${c[1] + 28};${c[1] + 10}`} dur="6s" repeatCount="indefinite" /></line></g>;
    }
    case "garden": return <g>{[0, 1, 2, 3].map((i) => { const t = at((noise(seed, i) - 0.5) * hw * 1.4, (noise(seed, i + 5) - 0.5) * hw * 1.4); return <circle key={i} cx={t[0]} cy={t[1] - 6} r={7} fill={shade("#4f8a4a", light)} />; })}</g>;
    case "barracks": {
      const c = at(0, 0, 4);
      return <g><polygon points={`${c[0]},${c[1]} ${c[0] + 120},${c[1] - 90} ${c[0] + 140},${c[1] - 70}`} fill="#fff7c2" opacity={0.12}><animateTransform attributeName="transform" type="rotate" values={`-30 ${c[0]} ${c[1]};40 ${c[0]} ${c[1]};-30 ${c[0]} ${c[1]}`} dur="9s" repeatCount="indefinite" /></polygon></g>;
    }
    case "pleasure": { const c = at(0, hw, -12); return <rect x={c[0] - 14} y={c[1] - 6} width={28} height={9} rx={3} fill="#ff4fb3"><animate attributeName="opacity" values="1;0.35;1;1;0.5;1" dur="2.2s" repeatCount="indefinite" /></rect>; }
    case "clinic": { const c = at(hw, 0, -14); return <g fill="#e04848"><rect x={c[0] - 2.5} y={c[1] - 8} width={5} height={16} /><rect x={c[0] - 8} y={c[1] - 2.5} width={16} height={5} /></g>; }
    case "exchange": { const c = at(0, hw, -10); return <rect x={c[0] - 20} y={c[1] - 4} width={40} height={6} fill="#3ad07a"><animate attributeName="fill" values="#3ad07a;#e05050;#3ad07a" dur="5s" repeatCount="indefinite" /></rect>; }
    case "dairy": return <g>{[0, 1].map((i) => { const b = at(-hw * 0.5 + i * hw, -hw * 0.3), t = at(-hw * 0.5 + i * hw, -hw * 0.3, 26); return <g key={i}><rect x={b[0] - 6} y={t[1]} width={12} height={b[1] - t[1]} fill={shade("#d8d4c8", light)} /><ellipse cx={t[0]} cy={t[1]} rx={6} ry={3} fill={shade("#eeeae0", light)} /></g>; })}</g>;
    case "academy": { const b = at(0, 0), t = at(0, 0, 34); return <g><rect x={b[0] - 6} y={t[1]} width={12} height={b[1] - t[1]} fill={shade("#a89a7a", light)} /><circle cx={t[0]} cy={t[1] + 8} r={4} fill="#f4ecd0" /></g>; }
    default: return null;
  }
}

/** What the culture puts on top of a building. */
function Roof({ p, x, y, hw, z, style, light }: { p: Proj; x: number; y: number; hw: number; z: number; style: Style; light: number }) {
  const s = STYLES[style];
  const c = p.at(x, y, z);
  const w = p.s * hw * 0.9;
  const trim = shade(s.trim, light), stone = shade(s.stone, light);
  switch (style) {
    case "roman": case "antebellum": return <path d={`M${c[0] - w} ${c[1]} A ${w} ${w * 0.8} 0 0 1 ${c[0] + w} ${c[1]} Z`} fill={trim} />;
    case "arabian": return <g><path d={`M${c[0] - w * 0.8} ${c[1]} C ${c[0] - w} ${c[1] - w}, ${c[0]} ${c[1] - w * 1.2}, ${c[0]} ${c[1] - w * 1.5} C ${c[0]} ${c[1] - w * 1.2}, ${c[0] + w} ${c[1] - w}, ${c[0] + w * 0.8} ${c[1]} Z`} fill={trim} /><rect x={c[0] + w * 1.1} y={c[1] - w * 2.2} width={5} height={w * 2.2} fill={stone} /></g>;
    case "egyptian": return <g><polygon points={`${c[0] - w},${c[1]} ${c[0] + w},${c[1]} ${c[0]},${c[1] - w * 1.1}`} fill={stone} /><polygon points={`${c[0] - w * 0.2},${c[1] - w * 0.88} ${c[0] + w * 0.2},${c[1] - w * 0.88} ${c[0]},${c[1] - w * 1.1}`} fill="#f2d36b" /></g>;
    case "edo": case "chinese": return <g>{[0, 1].map((i) => { const yy = c[1] - i * w * 0.55, ww = w * (1.25 - i * 0.35); return <path key={i} d={`M${c[0] - ww} ${yy - 4} Q ${c[0]} ${yy - w * 0.5} ${c[0] + ww} ${yy - 4} L ${c[0] + ww * 0.7} ${yy + 2} L ${c[0] - ww * 0.7} ${yy + 2} Z`} fill={i ? trim : stone} />; })}</g>;
    case "aztec": return <g>{[0, 1, 2].map((i) => <rect key={i} x={c[0] - w * (1 - i * 0.28)} y={c[1] - (i + 1) * 9} width={w * 2 * (1 - i * 0.28)} height={9} fill={i === 2 ? trim : stone} />)}</g>;
    case "neo_imperial": return <g><polygon points={`${c[0] - w * 0.35},${c[1]} ${c[0] + w * 0.35},${c[1]} ${c[0]},${c[1] - w * 2.4}`} fill={stone} /><rect x={c[0] + 2} y={c[1] - w * 2.4} width={14} height={8} fill="#8a1f2a"><animate attributeName="width" values="14;11;14" dur="2s" repeatCount="indefinite" /></rect></g>;
    default: return null;
  }
}

function Shack({ p, x, y, hw, h, z, color, light, lamps, seed, rich }: { p: Proj; x: number; y: number; hw: number; h: number; z: number; color: string; light: number; lamps: number; seed: number; rich: boolean }) {
  const f = prism(p, x, y, hw, hw * (0.7 + noise(seed, 3) * 0.6), z, h);
  const w = p.at(x + hw, y, z + h * 0.5);
  return (
    <g>
      <polygon points={f.left} fill={shade(color, light * 0.8)} /><polygon points={f.right} fill={shade(color, light * 0.6)} /><polygon points={f.top} fill={shade(rich ? color : TARP[seed % TARP.length], light * (rich ? 1 : 0.85))} />
      {noise(seed, 4) < lamps ? <rect x={w[0] - 1.5} y={w[1] - 2} width={3} height={3} fill="#f4c76a" /> : null}
    </g>
  );
}

function Ruin({ p, x, y, seed, light, small, z = 0 }: { p: Proj; x: number; y: number; seed: number; light: number; small?: boolean; z?: number }) {
  const h = (small ? 14 : 40) + noise(seed, 1) * (small ? 20 : 90);
  const hw = small ? 0.3 : 0.45 + noise(seed, 2) * 0.35;
  const c = "#5a5650";
  const f = prism(p, x, y, hw, hw, z, h);
  const a = p.at(x - hw, y + hw, z + h), b = p.at(x + hw, y + hw, z + h), r = p.at(x + hw, y - hw, z + h);
  const jag = p.at(x, y + hw, z + h - 14 - noise(seed, 3) * 20);
  return (
    <g opacity={0.92}>
      <polygon points={f.left} fill={shade(c, light * 0.7)} /><polygon points={f.right} fill={shade(c, light * 0.52)} />
      <polygon points={pts([a, jag, b, r])} fill={shade("#3a3733", light)} />
      {[0, 1, 2].map((i) => { const s0 = p.at(x - hw + i * hw, y + hw, z + h - 4), s1 = p.at(x - hw + i * hw + 0.1, y + hw, z + h + 10 + noise(seed, i) * 10); return <line key={i} x1={s0[0]} y1={s0[1]} x2={s1[0]} y2={s1[1]} stroke="#7a4a32" strokeWidth={1.2} />; })}
      {Array.from({ length: Math.floor(h / 14) }, (_, i) => { const w0 = p.at(x - hw * 0.6, y + hw, z + 8 + i * 14), w1 = p.at(x + hw * 0.6, y + hw, z + 8 + i * 14); return <line key={`h${i}`} x1={w0[0]} y1={w0[1]} x2={w1[0]} y2={w1[1]} stroke="#16171a" strokeWidth={2.4} strokeDasharray="3 4" />; })}
    </g>
  );
}

function Rocket({ p, x, y, light }: { p: Proj; x: number; y: number; light: number }) {
  const b = p.at(x, y, 0);
  return (
    <g>
      <polygon points={prism(p, x, y, 0.8, 0.8, 0, 3).top} fill={shade("#4a4d52", light)} />
      <g>
        <rect x={b[0] - 5} y={b[1] - 70} width={10} height={64} fill="#e8eaee" /><polygon points={`${b[0] - 5},${b[1] - 70} ${b[0] + 5},${b[1] - 70} ${b[0]},${b[1] - 86}`} fill="#e8eaee" />
        <polygon points={`${b[0] - 6},${b[1] - 6} ${b[0] + 6},${b[1] - 6} ${b[0]},${b[1] + 14}`} fill="#ffb347" opacity={0}><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.7;0.72;0.95;1" dur="24s" repeatCount="indefinite" /></polygon>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -700" keyTimes="0;0.72;1" dur="24s" repeatCount="indefinite" />
      </g>
      <line x1={b[0] + 12} y1={b[1]} x2={b[0] + 12} y2={b[1] - 80} stroke="#c45a3a" strokeWidth={3} />
    </g>
  );
}

function Launcher({ p, x, y }: { p: Proj; x: number; y: number }) {
  const c = p.at(x, y, 9);
  return <g><rect x={c[0] - 9} y={c[1] - 6} width={18} height={6} rx={1.5} fill="#5e6b4f" /><rect x={c[0] - 6} y={c[1] - 14} width={14} height={4} fill="#7b8a68" transform={`rotate(-28 ${c[0]} ${c[1] - 12})`} /></g>;
}

function Plane({ small }: { small?: boolean }) {
  const k = small ? 0.6 : 1;
  return <path d={`M${10 * k} 0 L${-8 * k} ${-3 * k} L${-6 * k} 0 L${-8 * k} ${3 * k} Z M${2 * k} 0 L${-3 * k} ${-9 * k} L${-5 * k} ${-9 * k} L${-3 * k} 0 L${-5 * k} ${9 * k} L${-3 * k} ${9 * k} Z`} fill="#e6eaf2" />;
}
