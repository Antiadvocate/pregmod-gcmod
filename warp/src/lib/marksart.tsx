/**
 * MARKS, DRAWN — what was left on a body, on the figure.
 *
 * The pack has no fluids, welts or writing, so these are drawn here, on the pack's own 560×1000
 * canvas, at points measured off the figure, each hung from the joint its part of the body hangs
 * from so it moves with her. Fresh cum is wet and still sliding; dried cum is a dull crust.
 *
 * And the overlays some beats need (spiral eyes, steam, hearts), drawn the same way.
 */
import type { Person } from "../engine/types";
import type { Mark, Spot, BeatKind } from "../engine/marks";
import type { Joint } from "./rig";

/** Where on the figure, and which joint it rides. Two points for the parts that come in pairs. */
const AT: Record<Spot, { pts: [number, number][]; joint: Joint }> = {
  forehead: { pts: [[289, 108]], joint: "neck" },
  face: { pts: [[275, 150], [303, 152]], joint: "neck" },
  mouth: { pts: [[282, 172]], joint: "neck" },
  neck: { pts: [[296, 198]], joint: "neck" },
  collar: { pts: [[297, 207]], joint: "neck" },
  chest: { pts: [[276, 284], [318, 284]], joint: "chest" },
  belly: { pts: [[297, 382]], joint: "chest" },
  crotch: { pts: [[297, 462]], joint: "legs" },
  thighs: { pts: [[274, 560], [322, 560]], joint: "legs" },
  ass: { pts: [[256, 478], [338, 478]], joint: "legs" },
  feet: { pts: [[258, 912], [330, 912]], joint: "legs" },
  hands: { pts: [[238, 430], [356, 430]], joint: "hips" },
};

/** Wet for twenty minutes after it happened; a crust after that. */
const fresh = (m: Mark) => !!m.at && Date.now() - m.at < 20 * 60 * 1000;

function Cum({ x, y, wet, i }: { x: number; y: number; wet: boolean; i: number }) {
  const fill = wet ? "#f7f4ec" : "#e6dab0";
  const op = wet ? 0.92 : 0.58;
  const r = 4 + (i % 3);
  return (
    <g opacity={op}>
      <ellipse cx={x} cy={y} rx={r + 2} ry={r} fill={fill} stroke={wet ? "#d8d0bc" : "#c9b98a"} strokeWidth={0.6} strokeDasharray={wet ? undefined : "1.5 1"} />
      <ellipse cx={x + 5} cy={y - 3} rx={r * 0.6} ry={r * 0.45} fill={fill} />
      <path d={`M${x - 2} ${y + r - 1} q 1 6 0 ${wet ? 9 : 5}`} stroke={fill} strokeWidth={wet ? 2.4 : 1.8} strokeLinecap="round" fill="none">
        {wet ? <animate attributeName="d" dur="5s" repeatCount="indefinite" values={`M${x - 2} ${y + r - 1} q 1 6 0 9;M${x - 2} ${y + r - 1} q 1 9 0 14;M${x - 2} ${y + r - 1} q 1 6 0 9`} /> : null}
      </path>
      {wet ? <ellipse cx={x - 2} cy={y - 2} rx={1.6} ry={1} fill="#fff" opacity={0.9} /> : null}
    </g>
  );
}

function One({ m, x, y, wet, i }: { m: Mark; x: number; y: number; wet: boolean; i: number }) {
  switch (m.kind) {
    case "cum": return <Cum x={x} y={y} wet={wet} i={i} />;
    case "spit": return <g opacity={0.7}><path d={`M${x - 6} ${y} q 3 8 1 14 M${x + 4} ${y + 1} q -1 5 1 9`} stroke="#dcecf6" strokeWidth={1.3} fill="none" strokeLinecap="round" /><circle cx={x + 1} cy={y + 15} r={1.6} fill="#dcecf6" /></g>;
    case "tears": return <path d={`M${x - 3} ${y - 10} q -1 10 1 20`} stroke="#bfe0f4" strokeWidth={1.4} opacity={0.75} fill="none" />;
    case "mascara": return <path d={`M${x - 3} ${y - 10} q -2 10 0 22 M${x + 1} ${y - 10} q 1 7 0 13`} stroke="#1b1416" strokeWidth={1.3} opacity={0.6} fill="none" strokeLinecap="round" />;
    case "welts": return <g stroke="#c2353b" strokeWidth={2.2} opacity={0.75} strokeLinecap="round">{[0, 1, 2].map((k) => <path key={k} d={`M${x - 14} ${y - 8 + k * 7} l 28 -6`} />)}<path d={`M${x - 13} ${y - 9} l 26 -5`} stroke="#f08a8d" strokeWidth={0.7} /></g>;
    case "bruise": return <ellipse cx={x} cy={y} rx={9} ry={7} fill="#5a3570" opacity={0.35} />;
    case "lipstick": return <g fill="#c0142f" opacity={0.75} transform={`rotate(-12 ${x} ${y})`}><path d={`M${x - 6} ${y} q 3 -4 6 -1 q 3 -3 6 1 q -6 2 -12 0z`} /><path d={`M${x - 6} ${y + 1} q 6 5 12 0 q -6 2 -12 0z`} /></g>;
    case "words": return <text x={x} y={y} textAnchor="middle" fontSize={m.spot === "forehead" ? 9 : 12} fontFamily="'Marker Felt','Comic Sans MS','Segoe Print',cursive" fill="#1d1d1d" opacity={0.85} transform={`rotate(-6 ${x} ${y})`}>{m.text}</text>;
    case "soleprint": return (
      <g fill="#2b241e" opacity={m.spot === "face" ? (wet ? 0.3 : 0.2) : wet ? 0.5 : 0.36} transform={`rotate(${i % 2 ? 14 : -10} ${x} ${y}) translate(${x} ${y}) scale(${m.spot === "face" ? 1.9 : 1.3}) translate(${-x} ${-y})`}>
        <ellipse cx={x} cy={y + 9} rx={5} ry={6} /><ellipse cx={x + 1} cy={y - 4} rx={7} ry={8} />
        {[[-5, -15, 2.4], [-1, -17, 2.2], [3, -16.5, 2], [6.5, -15, 1.8], [9, -12.5, 1.6]].map(([dx, dy, r], k) => <circle key={k} cx={x + dx} cy={y + dy} r={r} />)}
      </g>
    );
    case "piss": return <ellipse cx={x} cy={y} rx={14} ry={10} fill="#f3d34a" opacity={0.22} />;
    case "sweat": return <g fill="#e6f4ff" opacity={0.7}>{[[0, 0], [6, 5], [-5, 8]].map(([dx, dy], k) => <circle key={k} cx={x + dx} cy={y + dy} r={1.4} />)}</g>;
    case "handprint": return <g fill="#b8353a" opacity={0.5}><ellipse cx={x} cy={y + 2} rx={8} ry={6} />{[-6, -2, 2, 6].map((dx, k) => <rect key={k} x={x + dx - 1.4} y={y - 9} width={2.8} height={8} rx={1.4} />)}</g>;
    case "bite": return <g fill="#b3333a" opacity={0.55}>{Array.from({ length: 7 }, (_, k) => { const a = Math.PI * (k / 6); return <circle key={k} cx={x + Math.cos(a) * 7} cy={y + Math.sin(a) * 4} r={1.1} />; })}</g>;
  }
}

export function MarksLayer({ person }: { person: Person }) {
  const list = person.stains ?? [];
  if (!list.length) return null;
  return (
    <>
      {list.map((m, i) => {
        const at = AT[m.spot];
        const wet = fresh(m);
        // One of a pair for most things; cum and prints go on both when it's the face or chest.
        // A sole print is one print, across the face if that's where she put her foot.
        const pts = m.kind === "soleprint" && m.spot === "face" ? [[290, 146] as [number, number]]
          : m.kind === "words" || m.kind === "lipstick" || m.kind === "handprint" || m.kind === "bite" || m.kind === "soleprint" ? at.pts.slice(0, 1) : at.pts;
        return (
          <g key={`${m.kind}-${m.spot}-${i}`} data-joint={at.joint} data-own="" pointerEvents="none">
            {pts.map(([x, y], k) => <One key={k} m={m} x={x} y={y} wet={wet} i={i + k} />)}
          </g>
        );
      })}
    </>
  );
}

/** The bits some beats draw on top: spiral eyes, steam, hearts. */
export function BeatOverlay({ kind }: { kind: BeatKind }) {
  if (kind === "spiral") return (
    <g data-joint="neck" data-own="" pointerEvents="none">
      {[[276, 131], [302, 131]].map(([x, y], k) => (
        <path key={k} d={`M${x} ${y} m -1 0 a 1 1 0 1 1 2 0 a 3 3 0 1 1 -5 0 a 5 5 0 1 1 9 0 a 7 7 0 1 1 -13 0`} fill="none" stroke="#7a3cc2" strokeWidth={1.4}>
          <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur="0.8s" repeatCount="indefinite" />
        </path>
      ))}
    </g>
  );
  if (kind === "steam") return (
    <g data-joint="neck" data-own="" pointerEvents="none" fill="#ffffff">
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={270 + k * 18} cy={80} r={6} opacity={0}>
          <animate attributeName="cy" values="85;40" dur="1.2s" begin={`${k * 0.3}s`} repeatCount="2" />
          <animate attributeName="r" values="4;11" dur="1.2s" begin={`${k * 0.3}s`} repeatCount="2" />
          <animate attributeName="opacity" values="0.8;0" dur="1.2s" begin={`${k * 0.3}s`} repeatCount="2" />
        </circle>
      ))}
    </g>
  );
  if (kind === "hearts") return (
    <g pointerEvents="none" fill="#e2366b">
      {[0, 1, 2, 3].map((k) => (
        <path key={k} d="M0 3 C0 -1 -6 -1 -6 3 C-6 6 0 9 0 11 C0 9 6 6 6 3 C6 -1 0 -1 0 3z" opacity={0} transform={`translate(${250 + k * 25} 260)`}>
          <animateTransform attributeName="transform" type="translate" values={`${250 + k * 25} 300;${255 + k * 22} 60`} dur="1.8s" begin={`${k * 0.25}s`} />
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin={`${k * 0.25}s`} />
        </path>
      ))}
    </g>
  );
  return null;
}
