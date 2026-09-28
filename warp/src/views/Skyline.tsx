/**
 * THE SKYLINE, ON SCREEN.
 *
 * Draws whatever the city currently is, and moves the parts of it that would actually move: lit
 * windows flickering as people cross rooms, smoke off the works and steam off the reactors, aircraft
 * on the approach, cabs between the rings as many as the city is busy, cranes on the docks, neon on
 * the clubs, searchlights over the barracks, trees on the garden terraces, the beacon on your mast. Nothing here is idle decoration — every moving thing is a thing the
 * state says is happening, so a dead city looks dead and a busy one looks busy.
 *
 * It shares SlaveArt's single requestAnimationFrame rather than starting a second one, because two
 * animation loops in one app is how a phone's battery goes.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../lib/game";
import { cityOf } from "../engine/city";
import { hourFrom, layout, neighbourSilhouettes, styleOf, SKY_W, SKY_H, type Detail } from "../lib/cityart";
import { subscribeClock } from "../lib/clock";

/**
 * The frame's height comes from the city's own proportions, so the whole of it is always in view:
 * cropping to a fixed height cut the top off the spire on a phone, and the spire is the one thing
 * this drawing must never lose. A tall late city is capped at `maxHeight` and letterboxed in sky.
 */
export function Skyline({ onPick, selected, maxHeight = 280 }:
  { onPick?: (id: string) => void; selected?: string | null; maxHeight?: number }) {
  const { save } = useGame();
  const city = cityOf(save);
  const arc = save.arcology;
  const hour = hourFrom(save.scene.time);
  const { style, strength } = styleOf(arc.doctrines);

  const { blocks, sky, horizon, terraces, viewBox } = useMemo(
    () => layout(city.districts, { week: arc.week, crime: arc.crime, population: arc.population, hour, style, strength }),
    // Rebuilt when anything the drawing reads has actually changed. Levels and conditions are
    // folded into one signature so a week of wear redraws without a deep compare every frame.
    [city.districts.map((d) => `${d.kind}${d.level}${Math.round(d.condition / 6)}${d.built ?? ""}`).join(), arc.week, arc.crime, Math.round(arc.population / 120), hour, style, Math.round(strength * 10)],
  );

  const towers = useMemo(() => neighbourSilhouettes(arc.neighbours, sky), [arc.neighbours, sky]);
  const svg = useRef<SVGSVGElement>(null);
  const [tip, setTip] = useState<string | null>(null);

  // The moving parts, written as attributes so none of this re-renders React.
  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    const flick = Array.from(root.querySelectorAll<SVGRectElement>("[data-flick]"));
    const smokes = Array.from(root.querySelectorAll<SVGPathElement>("[data-smoke]"));
    const beacon = root.querySelector<SVGCircleElement>("[data-beacon]");
    const craft = Array.from(root.querySelectorAll<SVGGElement>("[data-craft]"));
    const moving = Array.from(root.querySelectorAll<SVGElement>("[data-anim]")).map((el) => ({
      el, kind: el.dataset.anim as Detail["anim"], p: Number(el.dataset.p ?? 0), ox: Number(el.dataset.ox ?? 0), oy: Number(el.dataset.oy ?? 0),
    }));
    const clouds = Array.from(root.querySelectorAll<SVGGElement>("[data-cloud]"));
    const drones = Array.from(root.querySelectorAll<SVGGElement>("[data-drone]"));

    return subscribeClock((ms) => {
      const t = ms / 1000;
      // Windows: a slow scatter of them changing state, not a disco.
      for (let i = 0; i < flick.length; i++) {
        const el = flick[i];
        const p = Number(el.dataset.flick);
        const on = Math.sin(t * 0.22 + p * 40) > 0.55;
        el.setAttribute("opacity", on ? "0.95" : "0.25");
      }
      for (const s of smokes) {
        const p = Number(s.dataset.smoke);
        const rise = (t * 9 + p * 30) % 46;
        s.setAttribute("transform", `translate(${Math.sin(t * 0.5 + p * 6) * 4} ${-rise})`);
        s.setAttribute("opacity", String(0.3 * (1 - rise / 46)));
      }
      if (beacon) beacon.setAttribute("opacity", Math.sin(t * 2.2) > 0 ? "0.95" : "0.1");
      for (const c of craft) {
        const p = Number(c.dataset.craft);
        const x = ((t * (12 + p * 8) + p * 900) % (SKY_W + 220)) - 110;
        c.setAttribute("transform", `translate(${x} 0)`);
      }
      for (const m of moving) {
        switch (m.kind) {
          // A sign that hums, and every few seconds catches and stutters.
          case "neon": m.el.setAttribute("opacity", Math.sin(t * 17 + m.p * 60) > 0.97 || Math.sin(t * 0.7 + m.p * 9) > 0.992 ? "0.25" : String(0.82 + Math.sin(t * 2 + m.p * 5) * 0.12)); break;
          case "sweep": m.el.setAttribute("transform", `rotate(${Math.sin(t * 0.35 + m.p * 6) * 38} ${m.ox} ${m.oy})`); break;
          case "swing": m.el.setAttribute("transform", `rotate(${Math.sin(t * 0.18 + m.p * 4) * 9} ${m.ox} ${m.oy})`); break;
          case "sway": m.el.setAttribute("transform", `rotate(${Math.sin(t * 1.3 + m.p * 9) * 4} ${m.ox} ${m.oy})`); break;
          case "blink": m.el.setAttribute("opacity", ((t + m.p * 3) % 1.6) < 0.5 ? "1" : "0.15"); break;
          case "ticker": m.el.setAttribute("stroke-dashoffset", String(-((t * 14 + m.p * 40) % 400))); break;
        }
      }
      for (const c of clouds) {
        const p = Number(c.dataset.cloud);
        c.setAttribute("transform", `translate(${((t * (3 + p * 2) + p * 700) % (SKY_W + 500)) - 250} 0)`);
      }
      for (const d of drones) {
        const p = Number(d.dataset.drone);
        const dir = p > 0.5 ? 1 : -1;
        const x = ((t * (22 + p * 30) + p * 1300) % (SKY_W + 80)) - 40;
        d.setAttribute("transform", `translate(${dir > 0 ? x : SKY_W - x} ${Math.sin(t * 1.4 + p * 20) * 2})`);
      }
    });
  }, [blocks]);

  const lit = sky.lamps > 0.2;

  return (
    <div className="relative select-none" style={{ background: `linear-gradient(${sky.top}, ${sky.bottom} 70%, ${sky.ground} 70%)` }}>
      <svg ref={svg} viewBox={viewBox} preserveAspectRatio="xMidYMax meet"
        style={{ width: "100%", height: "auto", maxHeight, display: "block", margin: "0 auto", touchAction: "manipulation" }}
        role="img" aria-label={`${arc.name} — ${city.districts.filter((d) => d.level).length} blocks standing`}>
        <defs>
          <linearGradient id="sky-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky.top} />
            <stop offset="100%" stopColor={sky.bottom} />
          </linearGradient>
          <linearGradient id="haze-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky.haze} stopOpacity="0" />
            <stop offset="100%" stopColor={sky.haze} stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* The frame can open above the canvas on a tall spire, so the sky is drawn well past it. */}
        <rect x="0" y={-600} width={SKY_W} height={SKY_H + 600} fill="url(#sky-g)" />

        {/* Stars, only when it is dark enough to have any. */}
        {sky.star > 0.2 ? Array.from({ length: 42 }, (_, i) => {
          const x = ((i * 137.5) % SKY_W), yv = ((i * 137.5 * 0.37) % (SKY_H - 160)) - 240;
          return <circle key={i} cx={x} cy={yv} r={i % 7 === 0 ? 1.3 : 0.8} fill="#e8eef6" opacity={0.18 + (i % 5) * 0.12 * sky.star} />;
        }) : null}

        {/* Aircraft on the approach — one per dock level, so trade is visible in the air. */}
        {Array.from({ length: Math.min(3, city.routes.filter((r) => !r.disrupted).length) }, (_, i) => (
          <g key={i} data-craft={i / 3}>
            <g opacity="0.5">
              <rect x={-60} y={60 + i * 26} width={16} height={2.5} rx={1.2} fill={sky.haze} />
              <circle cx={-44} cy={61 + i * 26} r={1.6} fill="#d98a5a" opacity="0.9" />
            </g>
          </g>
        ))}

        {/* The other arcologies, on the far horizon. */}
        {towers.map((t) => (
          <g key={t.name}>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} fill={t.fill} rx={2} />
            {t.hostile ? <circle cx={t.x + t.w / 2} cy={t.y - 5} r={2.4} fill="var(--danger)" opacity="0.75" /> : null}
          </g>
        ))}

        <rect x="0" y={horizon - 110} width={SKY_W} height={110} fill="url(#haze-g)" />

        {/* The terraces each ring stands on. Back to front, so the near ground overlaps the far. */}
        {terraces.map((t, i) => (
          <rect key={i} x="0" y={t.y} width={SKY_W} height={SKY_H - t.y} fill={t.fill} />
        ))}

        {/* Clouds, drifting, when there is light to see them by. */}
        {sky.star < 0.5 ? [0, 1, 2].map((i) => (
          <g key={i} data-cloud={i / 3} opacity={0.18 - i * 0.03}>
            <ellipse cx={0} cy={horizon - 330 + i * 70} rx={90 - i * 15} ry={9} fill="#e8edf2" />
            <ellipse cx={30} cy={horizon - 338 + i * 70} rx={50 - i * 8} ry={8} fill="#e8edf2" />
          </g>
        )) : null}

        {/* THE CITY. Back to front, exactly as laid out. */}
        {blocks.map((b) => {
          const on = selected === b.id;
          const clip = b.body ? `clip-${b.id}` : undefined;
          return (
            <g key={b.id}
              onClick={() => onPick?.(b.id)}
              onMouseEnter={() => setTip(`${b.label}${b.level ? ` · level ${b.level}` : ""}`)}
              onMouseLeave={() => setTip(null)}
              style={{ cursor: onPick ? "pointer" : "default" }}>
              {b.vacant ? (
                <>
                  <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} opacity={0.75} />
                  <path d={`M${b.x} ${b.y} l${b.w} 0`} stroke={on ? "var(--acc)" : "#ffffff22"} strokeWidth={on ? 2.5 : 1.2} strokeDasharray="5 4" fill="none" />
                </>
              ) : (
                <>
                  {b.side ? <path d={b.side} fill={b.sideFill} /> : null}
                  {b.top ? <path d={b.top} fill={b.topFill} /> : null}
                  {b.body ? (
                    <>
                      <clipPath id={clip}><path d={b.body} /></clipPath>
                      <path d={b.body} fill={b.fill} />
                    </>
                  ) : <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} />}
                  <g clipPath={clip ? `url(#${clip})` : undefined}>
                    {b.windows.map((w, i) => (
                      <rect key={i} x={w.x} y={w.y} width={w.w} height={w.h}
                        fill={w.lit ? "#ffd9a0" : "#0b0d11"}
                        opacity={w.lit ? 0.9 : 0.4}
                        {...(w.lit && lit && i % 11 === 0 ? { "data-flick": (i % 17) / 17 } : {})} />
                    ))}
                  </g>
                  {b.details.filter((d) => !d.night || lit).map((d, i) => (
                    <path key={i} d={d.d} fill={d.fill ?? "none"} stroke={d.stroke} strokeWidth={d.sw} opacity={d.op}
                      strokeDasharray={d.dash} strokeLinecap={d.stroke ? "round" : undefined}
                      {...(d.anim ? { "data-anim": d.anim, "data-p": d.p ?? 0, "data-ox": d.ox ?? 0, "data-oy": d.oy ?? 0 } : {})} />
                  ))}
                  {b.roof ? <path d={b.roof} stroke={b.fill} strokeWidth={2.2} fill="none" opacity={0.95} /> : null}
                  {b.scaffold ? (
                    <path d={`M${b.x} ${b.y + b.h} l0 ${-b.h} M${b.x + b.w} ${b.y + b.h} l0 ${-b.h} M${b.x} ${b.y + b.h * 0.4} l${b.w} 0 M${b.x} ${b.y + b.h * 0.7} l${b.w} 0 M${b.x} ${b.y + b.h * 0.4} l${b.w} ${b.h * 0.3}`}
                      stroke="#c9a15c" strokeWidth={1.4} opacity={0.6} fill="none" />
                  ) : null}
                  {b.smoke > 0 ? Array.from({ length: 4 }, (_, i) => {
                    const sx = b.smokeAt?.x ?? b.x + b.w * 0.35, sy = b.smokeAt?.y ?? b.y - 6;
                    return <path key={i} data-smoke={i / 4} d={`M${sx} ${sy} q6 -10 0 -20`}
                      stroke="#cfd4da" strokeWidth={3 + b.smoke * 4} strokeLinecap="round" fill="none" opacity="0.2" />;
                  }) : null}
                  {b.id === "d-core" ? <circle data-beacon cx={b.x + b.w / 2} cy={b.y - 47} r={3} fill="#e0574a" /> : null}
                  {on ? <rect x={b.x - 3} y={b.y - 3} width={b.w + 6} height={b.h + 6} fill="none" stroke="var(--acc)" strokeWidth={2} rx={2} /> : null}
                </>
              )}
            </g>
          );
        })}

        {/* Traffic between the rings: drones and cabs, as many as the city is busy. */}
        {Array.from({ length: Math.min(9, Math.round(arc.prosperity / 11)) }, (_, i) => (
          <g key={i} data-drone={(i * 0.37) % 1}>
            <circle cx={0} cy={horizon - 70 - (i % 4) * 46} r={1.6} fill={lit ? "#ffe2a8" : "#2b2e36"} opacity={lit ? 0.95 : 0.7} />
            {lit ? <circle cx={0} cy={horizon - 70 - (i % 4) * 46} r={4} fill="#ffe2a8" opacity={0.15} /> : null}
          </g>
        ))}

        <rect x="0" y={horizon} width={SKY_W} height={SKY_H - horizon} fill={sky.ground} />
      </svg>

      {tip ? (
        <div className="absolute left-2 bottom-2 px-2 py-1 rounded text-[11px] pointer-events-none"
          style={{ background: "var(--card)", border: "1px solid var(--rule)" }}>{tip}</div>
      ) : null}
      <div className="absolute right-2 top-2 text-[10px] uppercase tracking-wider dim pointer-events-none">
        {hour}
      </div>
    </div>
  );
}
