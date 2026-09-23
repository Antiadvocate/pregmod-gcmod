/**
 * WHERE SHE IS STANDING.
 *
 * A backdrop per room, drawn in flat shapes in the same spirit as the figure pack and kept dark
 * and low-contrast so she stays the brightest thing on screen. Each has one or two things moving —
 * lights in the skyline, a bulb on a flex, steam, a crowd going past — because a room with nothing
 * moving in it reads as a picture of a room.
 */
import type { ReactNode } from "react";

type Theme = "penthouse" | "room" | "concourse" | "brothel" | "club" | "arcade" | "cells" | "spa" | "clinic" | "works" | "pit" | "dressing";

const THEME: Record<string, Theme> = {
  penthouse: "penthouse", suite: "penthouse", her_room: "room", servants_hall: "room",
  concourse: "concourse", promenade: "concourse", brothel_floor: "brothel", club_floor: "club",
  arcade_hall: "arcade", cellblock_floor: "cells", spa_floor: "spa", clinic_floor: "clinic",
  dairy_floor: "works", farmyard_floor: "works", pit_floor: "pit", nursery_floor: "room", dressing: "dressing",
};

function Frame({ children, sky }: { children: ReactNode; sky: [string, string] }) {
  const id = `bg${sky[0].slice(1)}${sky[1].slice(1)}`;
  return (
    <svg className="room" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
        <radialGradient id="room-glow" cx="0.5" cy="0.55" r="0.5"><stop offset="0" stopColor="#fff" stopOpacity="0.07" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <linearGradient id="room-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id})`} />
      {children}
      <rect width="400" height="300" fill="url(#room-glow)" />
      <rect y="230" width="400" height="70" fill="url(#room-floor)" />
    </svg>
  );
}

/** Deterministic scatter, so the skyline is the same skyline every time. */
function scatter(n: number, seed: number): number[] {
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; out.push(x / 233280); }
  return out;
}

function Penthouse() {
  const r = scatter(160, 7);
  const towers = [[12, 120, 34], [50, 90, 26], [80, 140, 40], [124, 70, 22], [150, 110, 30], [184, 150, 44], [232, 95, 28], [264, 125, 36], [304, 80, 24], [332, 135, 38], [374, 100, 30]];
  return (
    <Frame sky={["#0b1022", "#1a1426"]}>
      {scatter(40, 3).map((v, i) => <circle key={i} cx={v * 400} cy={(scatter(40, 11)[i]) * 90} r={0.6} fill="#cfd8ff" opacity={0.5} />)}
      <g fill="#0c0c14">
        {towers.map(([x, h, w], i) => <rect key={i} x={x} y={230 - h} width={w} height={h} />)}
      </g>
      <g>
        {towers.flatMap(([x, h, w], t) => {
          const lit: ReactNode[] = [];
          for (let yy = 230 - h + 6; yy < 226; yy += 7) for (let xx = x + 3; xx < x + w - 3; xx += 6) {
            const k = (t * 131 + yy * 7 + xx) % r.length;
            if (r[k] > 0.62) lit.push(<rect key={`${t}-${xx}-${yy}`} className={r[k] > 0.93 ? "room-twinkle" : undefined} style={{ animationDelay: `${(r[k] * 6).toFixed(2)}s` }} x={xx} y={yy} width={2.4} height={3} fill={r[k] > 0.85 ? "#f3c77a" : "#c79a52"} opacity={0.7} />);
          }
          return lit;
        })}
      </g>
      {/* the glass, and the room's reflection in it */}
      <g stroke="#2a2330" strokeWidth={5}>
        <line x1="0" y1="4" x2="400" y2="4" /><line x1="100" y1="0" x2="100" y2="240" /><line x1="300" y1="0" x2="300" y2="240" />
      </g>
      <rect y="232" width="400" height="68" fill="#15111a" />
      <rect y="232" width="400" height="2" fill="#3a2f28" />
    </Frame>
  );
}

function Room() {
  return (
    <Frame sky={["#1b1714", "#120f0d"]}>
      <rect x="40" y="40" width="70" height="90" fill="#231d19" stroke="#2f2721" strokeWidth={3} />
      <rect x="44" y="44" width="62" height="82" fill="#2c3244" opacity={0.6} />
      <line x1="75" y1="44" x2="75" y2="126" stroke="#2f2721" strokeWidth={2} />
      <g className="room-sway" style={{ transformOrigin: "300px 0px" }}>
        <line x1="300" y1="0" x2="300" y2="70" stroke="#3a3129" strokeWidth={1} />
        <circle cx="300" cy="74" r="5" fill="#f2c889" />
        <circle cx="300" cy="74" r="40" fill="#f2c889" opacity={0.06} />
      </g>
      <rect x="250" y="190" width="140" height="44" rx="4" fill="#211b17" />
      <rect x="252" y="182" width="40" height="14" rx="4" fill="#2c2520" />
      <rect y="232" width="400" height="68" fill="#17120f" />
    </Frame>
  );
}

function Concourse() {
  const walkers = scatter(10, 21);
  return (
    <Frame sky={["#1a1310", "#0f0b09"]}>
      {[[20, "#c96b3a"], [140, "#3a8fa0"], [270, "#b03a6a"]].map(([x, c], i) => (
        <g key={i}>
          <rect x={x as number} y="60" width="100" height="120" fill="#1f1814" />
          <rect x={(x as number) + 6} y="70" width="88" height="70" fill={c as string} opacity={0.18} />
          <rect className="room-neon" style={{ animationDelay: `${i * 1.7}s` }} x={(x as number) + 16} y="46" width="68" height="10" rx="3" fill={c as string} opacity={0.75} />
        </g>
      ))}
      <g className="room-walk" fill="#070605" opacity={0.85}>
        {walkers.map((v, i) => (
          <g key={i} transform={`translate(${(v * 520 - 60).toFixed(0)} ${200 + (i % 3) * 6})`}>
            <circle cx="0" cy="0" r="5" /><rect x="-6" y="5" width="12" height="26" rx="5" />
          </g>
        ))}
      </g>
      <rect y="236" width="400" height="64" fill="#140f0c" />
    </Frame>
  );
}

function Brothel() {
  return (
    <Frame sky={["#2a0f12", "#150809"]}>
      {Array.from({ length: 20 }, (_, i) => <rect key={i} x={i * 20} y="0" width="10" height="232" fill="#3a1418" opacity={0.35} />)}
      <path d="M0 0 Q30 120 10 232 L0 232z" fill="#4a1117" /><path d="M400 0 Q370 120 390 232 L400 232z" fill="#4a1117" />
      {[90, 200, 310].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="0" x2={x} y2="40" stroke="#1a0a0b" />
          <path d={`M${x - 12} 40 h24 l-6 14 h-12z`} fill="#8a1d25" />
          <circle className="room-pulse" style={{ animationDelay: `${i * 0.9}s` }} cx={x} cy="58" r="34" fill="#ff3b3b" opacity={0.08} />
        </g>
      ))}
      <rect x="20" y="170" width="120" height="64" fill="#241012" />
      <rect x="20" y="166" width="120" height="6" fill="#4d2a1e" />
      <rect y="234" width="400" height="66" fill="#190b0c" />
    </Frame>
  );
}

function Club() {
  return (
    <Frame sky={["#140c24", "#08060f"]}>
      {["#8a4dff", "#ff4dc4", "#4dd8ff"].map((c, i) => (
        <g key={c} className="room-spot" style={{ transformOrigin: `${80 + i * 120}px 0px`, animationDelay: `${i * 1.3}s` }}>
          <path d={`M${80 + i * 120} 0 L${40 + i * 120} 240 L${120 + i * 120} 240z`} fill={c} opacity={0.09} />
        </g>
      ))}
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 40} y="236" width="38" height="64" fill={i % 2 ? "#1d1233" : "#150d25"} />)}
      <rect className="room-pulse" x="0" y="234" width="400" height="3" fill="#8a4dff" opacity={0.5} />
    </Frame>
  );
}

function Arcade() {
  return (
    <Frame sky={["#0c0c0e", "#050506"]}>
      <path d="M0 0 L160 110 L160 190 L0 300z" fill="#141416" /><path d="M400 0 L240 110 L240 190 L400 300z" fill="#141416" />
      <rect x="160" y="110" width="80" height="80" fill="#08080a" />
      {[0, 1, 2, 3].map((i) => {
        const x = 20 + i * 36, y = 60 + i * 14, h = 150 - i * 26;
        return (
          <g key={i}>
            <rect x={x} y={y} width="22" height={h} fill="#1c1c20" />
            <rect className="room-pulse" style={{ animationDelay: `${i * 0.6}s` }} x={x + 8} y={y + h / 2} width="6" height="3" fill="#f1b24a" />
            <rect x={380 - x - 22} y={y} width="22" height={h} fill="#1c1c20" />
            <rect className="room-pulse" style={{ animationDelay: `${i * 0.6 + 0.3}s` }} x={380 - x - 14} y={y + h / 2} width="6" height="3" fill="#f1b24a" />
          </g>
        );
      })}
    </Frame>
  );
}

function Cells() {
  return (
    <Frame sky={["#161614", "#0c0c0b"]}>
      {Array.from({ length: 8 }, (_, row) => Array.from({ length: 9 }, (_, col) => (
        <rect key={`${row}-${col}`} x={col * 46 - (row % 2) * 23} y={row * 30} width="44" height="28" fill="#1b1b19" stroke="#121211" strokeWidth={1.5} />
      )))}
      <g className="room-sway" style={{ transformOrigin: "200px 0px" }}>
        <line x1="200" y1="0" x2="200" y2="60" stroke="#2a2a26" />
        <circle cx="200" cy="64" r="4" fill="#e9dcae" />
        <circle cx="200" cy="64" r="60" fill="#e9dcae" opacity={0.05} />
      </g>
      <ellipse cx="200" cy="262" rx="18" ry="4" fill="#060606" />
      <g fill="#0b0b0a">{[18, 58, 342, 382].map((x) => <rect key={x} x={x - 3} y="0" width="6" height="300" />)}</g>
      <rect x="0" y="36" width="80" height="5" fill="#0b0b0a" /><rect x="320" y="36" width="80" height="5" fill="#0b0b0a" />
    </Frame>
  );
}

function Spa() {
  return (
    <Frame sky={["#12211f", "#0b1514"]}>
      {Array.from({ length: 10 }, (_, row) => Array.from({ length: 14 }, (_, col) => (
        <rect key={`${row}-${col}`} x={col * 30} y={row * 24} width="28" height="22" fill="#162a27" opacity={0.7} />
      )))}
      <rect x="0" y="224" width="400" height="76" fill="#0f3a3a" opacity={0.6} />
      {[70, 160, 250, 330].map((x, i) => (
        <path key={x} className="room-steam" style={{ animationDelay: `${i * 1.4}s` }} d={`M${x} 230 q-14 -30 0 -60 q14 -30 0 -60`} stroke="#d8f0ea" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.06} />
      ))}
    </Frame>
  );
}

function Clinic() {
  return (
    <Frame sky={["#18201f", "#0f1413"]}>
      <rect x="0" y="0" width="400" height="232" fill="#1a2322" />
      <rect x="300" y="60" width="70" height="46" rx="3" fill="#0a100f" stroke="#2c3a38" />
      <path className="room-trace" d="M304 86 h18 l4 -12 l5 22 l4 -10 h31" stroke="#5fe0b0" strokeWidth={1.6} fill="none" />
      <rect x="30" y="170" width="160" height="12" rx="3" fill="#243130" />
      <rect x="40" y="182" width="6" height="50" fill="#1b2524" /><rect x="174" y="182" width="6" height="50" fill="#1b2524" />
      <rect y="232" width="400" height="68" fill="#131a19" />
    </Frame>
  );
}

function Works() {
  return (
    <Frame sky={["#131a14", "#0a0e0b"]}>
      {[40, 110, 180, 250, 320].map((x, i) => (
        <g key={x}>
          <rect x={x} y="20" width="40" height="5" fill="#2a3a2c" />
          <rect className="room-pulse" style={{ animationDelay: `${i * 0.5}s` }} x={x} y="25" width="40" height="80" fill="#a0f07a" opacity={0.05} />
        </g>
      ))}
      <path d="M0 150 H400" stroke="#233026" strokeWidth={6} /><path d="M0 170 H400" stroke="#1c261e" strokeWidth={4} />
      <rect y="232" width="400" height="68" fill="#101611" />
    </Frame>
  );
}

function Pit() {
  const crowd = scatter(40, 5);
  return (
    <Frame sky={["#1d1610", "#0d0a07"]}>
      <g fill="#0a0806">{crowd.map((v, i) => <circle key={i} cx={i * 10 + v * 6} cy={140 + (i % 3) * 8 + v * 6} r={6} />)}</g>
      <rect x="0" y="168" width="400" height="6" fill="#3a2c1f" />
      <rect y="174" width="400" height="126" fill="#3b2f22" />
      <ellipse cx="200" cy="250" rx="160" ry="40" fill="#f3d9a0" opacity={0.08} className="room-pulse" />
    </Frame>
  );
}

function DressingRoom() {
  return (
    <Frame sky={["#221a14", "#130e0b"]}>
      <rect x="120" y="20" width="160" height="210" rx="6" fill="#0f0c0a" stroke="#3a2e22" strokeWidth={6} />
      <rect x="128" y="28" width="144" height="194" rx="3" fill="#1f2226" opacity={0.7} />
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={`l${i}`} className="room-bulb" style={{ animationDelay: `${i * 0.35}s` }} cx="110" cy={32 + i * 30} r="4.5" fill="#ffd89a" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={`r${i}`} className="room-bulb" style={{ animationDelay: `${i * 0.35 + 0.2}s` }} cx="290" cy={32 + i * 30} r="4.5" fill="#ffd89a" />
      ))}
      <rect x="10" y="60" width="60" height="170" fill="#2a1f19" /><rect x="330" y="60" width="60" height="170" fill="#2a1f19" />
      <path d="M14 66 h52 M334 66 h52" stroke="#6a5234" strokeWidth={2} />
      <rect y="232" width="400" height="68" fill="#16110d" />
    </Frame>
  );
}

const DRAW: Record<Theme, () => ReactNode> = {
  penthouse: Penthouse, room: Room, concourse: Concourse, brothel: Brothel, club: Club, arcade: Arcade,
  cells: Cells, spa: Spa, clinic: Clinic, works: Works, pit: Pit, dressing: DressingRoom,
};

export function RoomBackdrop({ place }: { place: string }) {
  const Draw = DRAW[THEME[place] ?? "room"];
  return <Draw />;
}
