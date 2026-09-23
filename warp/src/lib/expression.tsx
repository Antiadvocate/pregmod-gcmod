/**
 * HER FACE, DOING SOMETHING.
 *
 * The pack draws one neutral face per type. This paints what the moment adds on top: a flush
 * across the cheeks, tears, sweat at the hairline, lips parted, and whatever you left on her face.
 * All of it is drawn in the pack's own 560×1000 space, measured off the features — eyes sit at
 * y 122–140 between x 263 and 316, the mouth at y 161–172 — and it rides the neck joint, so it
 * moves when her head does.
 */
import type { Person } from "../engine/types";

export interface Expression {
  /** 0–1 */
  blush: number;
  tears: number;
  sweat: number;
  /** Lips parted — breathing through her mouth. */
  gasp: boolean;
  /** Something on her face that you put there. */
  messy: boolean;
}

export interface Moment {
  landing?: "wanted" | "willing" | "endured" | "hated" | "nothing";
  finished?: boolean;
  act?: string;
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** What her face is doing, from her state and, when there is one, the moment that just happened. */
export function expressionOf(p: Person, m?: Moment): Expression {
  const a = p.psyche.arousal / 100;
  const scared = p.psyche.relaxation <= -3.5;
  const shy = p.persona.flaw?.id === "shamefast" || p.persona.fetishes.some((f) => f.name === "humiliation" && f.strength > 40);
  return {
    blush: clamp(a * 0.85 + (scared ? 0.15 : 0) + (shy ? 0.2 : 0) + (m?.landing === "wanted" ? 0.25 : 0) + (m?.finished ? 0.3 : 0) - (p.psyche.state === "broken" ? 0.4 : 0)),
    tears: clamp((m?.landing === "hated" ? 0.85 : 0) + (p.psyche.relaxation <= -6 ? 0.5 : 0) + (m?.act === "throat" ? 0.4 : 0)),
    sweat: clamp((a > 0.75 ? 0.6 : 0) + (m?.finished ? 0.5 : 0) + (p.health.energy < 20 ? 0.4 : 0)),
    gasp: !!m?.finished || a > 0.85 || m?.act === "throat",
    messy: m?.act === "facial" || m?.act === "throat",
  };
}

/** The overlay itself. `scope` keeps its filter ids apart from every other figure on screen. */
export function ExpressionLayer({ e, scope }: { e: Expression; scope: string }) {
  if (!e.blush && !e.tears && !e.sweat && !e.gasp && !e.messy) return null;
  const blur = `${scope}-soft`;
  return (
    <g data-joint="neck" data-own="" className="expr" pointerEvents="none">
      <defs>
        <filter id={blur} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" /></filter>
      </defs>
      {e.blush > 0.05 ? (
        <g className="expr-blush" style={{ opacity: 0.12 + e.blush * 0.42 }} filter={`url(#${blur})`}>
          <ellipse cx={271} cy={150} rx={9.5} ry={4.6} fill="#e2476a" />
          <ellipse cx={308.5} cy={149} rx={8.5} ry={4.2} fill="#e2476a" />
          {e.blush > 0.6 ? <ellipse cx={289} cy={146} rx={7} ry={2.4} fill="#e2476a" opacity={0.5} /> : null}
        </g>
      ) : null}
      {e.gasp ? <ellipse cx={285.6} cy={166.8} rx={4.2} ry={2.3} fill="#3b1a1c" opacity={0.85} /> : null}
      {e.tears > 0.05 ? (
        <g style={{ opacity: 0.35 + e.tears * 0.6 }}>
          <path d="M272 139.5 q-1.2 7 -0.4 15" stroke="#cfe9ff" strokeWidth={1.7} strokeLinecap="round" fill="none" />
          <path d="M306 139 q1 6.5 0.3 13" stroke="#cfe9ff" strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <circle className="expr-tear" cx={271.6} cy={155} r={1.5} fill="#e6f4ff" />
          <circle className="expr-tear expr-late" cx={306.3} cy={152.5} r={1.3} fill="#e6f4ff" />
        </g>
      ) : null}
      {e.sweat > 0.05 ? (
        <g style={{ opacity: 0.3 + e.sweat * 0.6 }}>
          <path className="expr-drip" d="M320 104 q-2.2 4 0 5.4 q2.2 -1.4 0 -5.4z" fill="#eaf6ff" />
          <path className="expr-drip expr-late" d="M268 110 q-1.8 3.4 0 4.6 q1.8 -1.2 0 -4.6z" fill="#eaf6ff" />
          <path d="M296 99 q-1.5 2.8 0 3.8 q1.5 -1 0 -3.8z" fill="#eaf6ff" opacity={0.7} />
        </g>
      ) : null}
      {e.messy ? (
        <g fill="#f5f2ea" opacity={0.92}>
          <path d="M279 170 q3 6 1 13 q3 -1 4 -8 q2 -6 -5 -5z" />
          <path d="M300 147 q6 1 8 6 q-4 1 -9 -2z" />
          <path d="M290 158 q2 3 1 6 q2 -1 1 -5z" />
        </g>
      ) : null}
    </g>
  );
}
