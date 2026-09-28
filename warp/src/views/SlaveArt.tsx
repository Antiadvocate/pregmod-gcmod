/**
 * THE COMPONENT THAT DRAWS HER, AND KEEPS HER BREATHING.
 *
 * Fetches the layers the compositor asked for, caches them for the life of the tab, drops any that
 * do not exist, and inlines the survivors into one SVG with a scoped stylesheet. A missing layer is
 * a missing detail, never a missing person.
 *
 * ── WHY THE ANIMATION IS BUILT THE WAY IT IS ────────────────────────────────────────────────
 *
 * One requestAnimationFrame for the whole app, not one per figure. A roster of forty was the case
 * that decided it: forty rAF loops each doing its own trigonometry is forty times the work for a
 * screen that is mostly scrolled past. Instead there is a single clock, every mounted figure
 * subscribes to it, and each writes its own transform attributes directly on its joint groups —
 * no React state per frame, so none of this re-renders anything.
 *
 * Layer order is preserved exactly. It would be tidier to nest the layers into a real joint
 * hierarchy, but SVG paints in document order, so reparenting would put her arms behind her back
 * and her hair through her face. Each layer stays where it is and wears its joint's composed
 * transform instead — the same matrix a hierarchy would have produced, arrived at without moving
 * anything.
 */
import { useEffect, useState, useMemo, useRef, type RefObject } from "react";
import type { Person } from "../engine/types";
import { ART_BASE, manly, cropFor, layersFor, styleFor, heightTransform, type Crop, type Layer } from "../lib/vectorart";
import { frameAt, jointFor, restingPose, transformFor, STILL, type Joint, type Pose } from "../lib/rig";
import { subscribeClock, stillWanted } from "../lib/clock";
import { expressionOf, ExpressionLayer, type Moment } from "../lib/expression";
import { blend, blinkAt, cloneFace, mouthPaths, talkAt, MOUTH_BOX, type Box, type FaceParams } from "../lib/face";

/** file stem → inner SVG markup, or null when the file is not in the pack. */
const cache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

/** Every layer the pack has, read once. A proposed layer that is not in it is skipped without a
 *  request — an outfit proposes a sleeve for every arm position and most outfits do not have one. */
let manifest: Promise<Set<string> | null> | null = null;
function known(): Promise<Set<string> | null> {
  manifest ??= fetch(`${ART_BASE}/index.json`).then((r) => (r.ok ? r.json() : null)).then((xs: string[] | null) => (xs ? new Set(xs) : null)).catch(() => null);
  return manifest;
}

async function loadLayer(id: string): Promise<string | null> {
  if (cache.has(id)) return cache.get(id)!;
  const have = await known();
  if (have && !have.has(id)) { cache.set(id, null); return null; }
  const existing = inflight.get(id);
  if (existing) return existing;
  const job = (async () => {
    try {
      const res = await fetch(`${ART_BASE}/Art_Vector_${id}.svg`);
      if (!res.ok) { cache.set(id, null); return null; }
      const text = await res.text();
      // Keep only what is inside the <svg> wrapper; every layer shares the same viewBox, so the
      // wrappers would just nest a coordinate system inside an identical one.
      const inner = /<svg[^>]*>([\s\S]*)<\/svg>/i.exec(text)?.[1] ?? null;
      cache.set(id, inner);
      return inner;
    } catch {
      cache.set(id, null);
      return null;
    }
  })();
  inflight.set(id, job);
  const out = await job;
  inflight.delete(id);
  return out;
}

/* The animation clock lives in lib/clock.ts now, shared with the skyline — see the note there
 * about why there is exactly one of them. */

let scopeSeq = 0;

export default function SlaveArt({ person, height = 260, crop = "full", className, pose, animate = true, svgRef, moment, face = true, mood, speaking = false }:
  { person: Person; height?: number | string; crop?: Crop; className?: string; pose?: Pose; animate?: boolean;
    /** A face that moves: brows, eyes and a drawn mouth set to this, easing there from wherever they were. */
    mood?: FaceParams;
    /** Her mouth moves, as if the words arriving are hers. */
    speaking?: boolean;
    /** What just happened, so her face can show it. */
    moment?: Moment;
    /** Draw the expression layer at all. Off for the ControlNet render, where it would only confuse. */
    face?: boolean;
    /** Handed out so a caller can rasterise exactly what is on screen — see lib/dollrender.ts. */
    svgRef?: RefObject<SVGSVGElement | null> }) {
  const held = pose ?? restingPose(person);
  // The save is mutated in place, so the person object is the same one after her clothes change.
  // Key on what would actually be drawn instead of on the object.
  const fresh = layersFor(person, held);
  const layerKey = fresh.map((l) => `${l.id}:${l.transform ?? ""}:${l.tint ?? ""}`).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const layers = useMemo(() => fresh, [layerKey]);
  const scope = useMemo(() => `sa${(scopeSeq++).toString(36)}`, []);
  const [markup, setMarkup] = useState<{ layer: Layer; inner: string }[]>([]);
  const own = useRef<SVGSVGElement>(null);
  const svg = svgRef ?? own;

  useEffect(() => {
    let live = true;
    (async () => {
      const loaded = await Promise.all(layers.map(async (layer) => ({ layer, inner: await loadLayer(layer.id) })));
      if (!live) return;
      setMarkup(loaded.filter((x): x is { layer: Layer; inner: string } => !!x.inner));
    })();
    return () => { live = false; };
  }, [layers]);

  // The face goes on after the features and before the fringe, so hair falls over a blush the way
  // it would.
  const base = face ? expressionOf(person, moment) : null;
  const man = manly(person);
  // The pack has no men's haircuts. A man with hair_length 1 gets a close crop cut from his own skull.
  const cropped = man && person.body.hair_length === 1;
  const expr = base && mood ? { ...base, blush: man ? mood.blush * 0.25 : Math.max(base.blush, mood.blush), tears: Math.max(base.tears, mood.tears), gasp: false } : base;
  const foreAt = markup.findIndex((m) => m.layer.id.startsWith("Hair_Fore") || /_Ear_Fore$/.test(m.layer.id));

  // The moving part. Writes attributes rather than state: a breathing roster must not re-render.
  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    const groups = Array.from(root.querySelectorAll<SVGGElement>("g[data-joint]"));
    if (!groups.length) return;

    const paint = (f: ReturnType<typeof frameAt>) => {
      const byJoint = new Map<Joint, string>();
      for (const g of groups) {
        const j = g.dataset.joint as Joint;
        let x = byJoint.get(j);
        if (x === undefined) { x = transformFor(j, f); byJoint.set(j, x); }
        const authored = g.dataset.own ?? "";
        const all = `${x} ${authored}`.trim();
        if (all) g.setAttribute("transform", all);
        else g.removeAttribute("transform");
      }
    };

    if (!animate || stillWanted()) { paint(STILL); return; }
    return subscribeClock((ms) => paint(frameAt(person, held, ms)));
  }, [markup, person, held, animate, !!expr]);

  // The face. Same clock, same rule: attributes, not state. It eases from wherever it is to the mood
  // asked for, blinks on its own schedule, and moves its mouth while she is speaking.
  const target = useRef(mood);
  target.current = mood;
  const talking = useRef(speaking);
  talking.current = speaking;
  const hasFace = !!mood && markup.length > 0;
  useEffect(() => {
    const root = svg.current;
    if (!root || !hasFace) return;
    const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);
    const eyes = q<SVGGElement>("[data-feature=eyes]");
    const irises = eyes ? Array.from(eyes.querySelectorAll<SVGElement>(".eye")) : [];
    const brows = { l: q<SVGGElement>("[data-feature=brow-l]"), r: q<SVGGElement>("[data-feature=brow-r]") };
    const pack = q<SVGGElement>("[data-feature=mouth-pack]");
    const lips = { upper: q<SVGPathElement>("[data-mouth=upper]"), lower: q<SVGPathElement>("[data-mouth=lower]"), gap: q<SVGPathElement>("[data-mouth=gap]"), teeth: q<SVGPathElement>("[data-mouth=teeth]"), line: q<SVGPathElement>("[data-mouth=line]"), shade: q<SVGPathElement>("[data-mouth=shade]"), gapFill: q<SVGPathElement>("[data-mouth=gap-fill]") };
    const box = (g: SVGGraphicsElement | null, fallback: Box): Box => {
      try { const b = g?.getBBox(); return b && b.width > 1 ? { x: b.x, y: b.y, w: b.width, h: b.height } : fallback; } catch { return fallback; }
    };
    const eb = box(eyes, { x: 263, y: 122, w: 53, h: 18 });
    const mb = box(pack, MOUTH_BOX);
    const mid = eb.x + eb.w / 2;
    // Both copies hold both brows (the clip hides one), so each pivots on the middle of its own half.
    const bb = box(brows.l, { x: 263, y: 114, w: 53, h: 8 });
    const bl = { x: bb.x, y: bb.y, w: mid - bb.x, h: bb.h };
    const br = { x: mid, y: bb.y, w: bb.x + bb.w - mid, h: bb.h };
    for (const [side, x0, x1] of [["l", -1000, mid], ["r", mid, 2000]] as const) {
      const rect = q<SVGRectElement>(`#${scope}-clip-${side} rect`);
      rect?.setAttribute("x", String(x0)); rect?.setAttribute("width", String(x1 - x0));
    }
    if (pack) pack.style.opacity = "0";
    const seed = [...person.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const cur = cloneFace(target.current!);
    let last = 0;
    const paint = (ms: number) => {
      const goal = target.current;
      if (!goal) return;
      const dt = last ? Math.min(100, ms - last) : 1000;
      last = ms;
      Object.assign(cur, blend(cur, goal, 1 - Math.exp(-dt / 140)));
      const open = cur.eyes.open * (animate ? blinkAt(ms, seed) : 1);
      const ey = eb.y + eb.h * 0.62;
      eyes?.setAttribute("transform", `translate(0 ${n2(ey)}) scale(1 ${n2(Math.max(0.06, Math.min(1.18, open)))}) translate(0 ${n2(-ey)})`);
      const drift = animate ? Math.sin(ms / 1700 + seed) * 0.25 : 0;
      for (const iris of irises) iris.setAttribute("transform", `translate(${n2(cur.eyes.gazeX + drift)} ${n2(cur.eyes.gazeY)})`);
      const brow = (g: SVGGElement | null, b: Box, s: { dy: number; tilt: number }, sign: number) =>
        g?.setAttribute("transform", `translate(0 ${n2(s.dy * 1.5)}) rotate(${n2(sign * s.tilt * 1.4)} ${n2(b.x + b.w / 2)} ${n2(b.y + b.h / 2)})`);
      brow(brows.l, bl, cur.brows.left, -1);
      brow(brows.r, br, cur.brows.right, 1);
      const talk = talking.current && animate ? talkAt(ms) * 0.75 : 0;
      const d = mouthPaths(mb, { ...cur.mouth, open: Math.min(1, cur.mouth.open + talk) });
      lips.upper?.setAttribute("d", d.upper);
      lips.shade?.setAttribute("d", d.upper);
      lips.lower?.setAttribute("d", d.lower);
      lips.gap?.setAttribute("d", d.gap);
      lips.gapFill?.setAttribute("d", d.gap);
      lips.teeth?.setAttribute("d", d.teeth || "M0 0");
      lips.line?.setAttribute("d", d.line);
    };
    paint(performance.now());
    if (!animate || stillWanted()) { Object.assign(cur, cloneFace(target.current!)); last = 0; paint(0); return; }
    return subscribeClock(paint);
  }, [markup, hasFace, animate, person.id]);

  const css = styleFor(person, scope);
  const tints = useMemo(() => [...new Set(markup.map((m) => m.layer.tint).filter((t): t is number => !!t))], [markup]);

  return (
    <div className={className} style={{ height, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
      <svg ref={svg} viewBox={cropFor(crop, held, person)} className={scope} preserveAspectRatio="xMidYMax meet"
        style={{ height: "100%" }}
        role="img" aria-label={`${person.name} — ${held.reads}`}>
        <style>{css}</style>
        {tints.length ? (
          <defs>
            {tints.map((t) => <filter key={t} id={`${scope}-hue${t}`}><feColorMatrix type="hueRotate" values={String(t)} /></filter>)}
          </defs>
        ) : null}
        {mood ? (
          <defs>
            <clipPath id={`${scope}-clip-l`}><rect x={-1000} y={-1000} width={1289.5} height={3000} /></clipPath>
            <clipPath id={`${scope}-clip-r`}><rect x={289.5} y={-1000} width={2000} height={3000} /></clipPath>
            <clipPath id={`${scope}-clip-m`}><path data-mouth="gap" /></clipPath>
          </defs>
        ) : null}
        <g transform={crop === "full" ? heightTransform(person) : undefined}>
        {markup.map(({ layer, inner }, i) => layer.id === "Head" && cropped ? (
          <g key={`${layer.id}-${i}`} data-joint={jointFor(layer.id)} data-own={layer.transform ?? ""} transform={layer.transform}>
            <g dangerouslySetInnerHTML={{ __html: inner }} />
            <CroppedHair scope={scope} />
          </g>
        ) : mood && FEATURE.test(layer.id) ? (
          <g key={`${layer.id}-${i}`} data-joint={jointFor(layer.id)} data-own={layer.transform ?? ""} transform={layer.transform}>
            <Feature id={layer.id} inner={inner} scope={scope} />
          </g>
        ) : (
          <g key={`${layer.id}-${i}`}
            data-joint={jointFor(layer.id)}
            data-own={layer.transform ?? ""}
            transform={layer.transform}
            filter={layer.tint ? `url(#${scope}-hue${layer.tint})` : undefined}
            dangerouslySetInnerHTML={{ __html: inner }} />
        )).flatMap((el, i) => (i === foreAt && expr ? [<ExpressionLayer key="expr" e={expr} scope={scope} />, el] : [el]))}
        {expr && foreAt < 0 && markup.length ? <ExpressionLayer e={expr} scope={scope} /> : null}
        </g>
      </svg>
    </div>
  );
}

const FEATURE = /^(Eyes_|Eyebrow_|Mouth_)/;

/** The pack's head outline, filled in his hair colour above a hairline: a close crop that fits any skull. */
const SKULL = "m323.4 161.2c6-14.4 8.4-24.7 10.6-40.1 4.5-31.3-16.1-52.4-42.5-43.9-34.2 11-29.4 33.1-26.2 53.7-1.16906 3.21971-1.63659 6.99403-1.5314 11.02311.14072 5.39012 1.30645 11.23617 3.18876 16.82016 1.79046 5.31154 4.78114 10.47993 7.73853 14.60539C281.69792 183.11628 283.49849 183.95695 286 184c10.1-1.7 28.3-4.2 37.4-22.8z";
function CroppedHair({ scope }: { scope: string }) {
  return (
    <g pointerEvents="none">
      <clipPath id={`${scope}-crop`}><path d="M240 50 L350 50 L350 134 Q342 113 328 107 Q307 100 288 102 Q272 105 267 114 Q264 121 264 130 L240 130 Z" /></clipPath>
      <g clipPath={`url(#${scope}-crop)`}>
        <path d={SKULL} className="hair" transform="translate(290 120) scale(1.03) translate(-290 -120)" />
        <path d={SKULL} fill="#000" opacity={0.12} transform="translate(290 120) scale(1.03) translate(-290 -120)" />
      </g>
    </g>
  );
}
const n2 = (v: number) => (Math.round(v * 100) / 100).toString();

/** One face layer, split so its parts can move: eyes in a group that opens and shuts, each brow in
 *  its own clipped copy, and the pack's mouth kept (hidden) to measure a drawn one against. */
function Feature({ id, inner, scope }: { id: string; inner: string; scope: string }) {
  if (id.startsWith("Eyes_")) return <g data-feature="eyes" dangerouslySetInnerHTML={{ __html: inner }} />;
  if (id.startsWith("Eyebrow_")) return (
    <>
      <g clipPath={`url(#${scope}-clip-l)`}><g data-feature="brow-l" dangerouslySetInnerHTML={{ __html: inner }} /></g>
      <g clipPath={`url(#${scope}-clip-r)`}><g data-feature="brow-r" dangerouslySetInnerHTML={{ __html: inner }} /></g>
    </>
  );
  return (
    <>
      <g data-feature="mouth-pack" dangerouslySetInnerHTML={{ __html: inner }} />
      <path data-mouth="gap-fill" fill="#3a1618" />
      <g clipPath={`url(#${scope}-clip-m)`}><path data-mouth="teeth" fill="#f4efe6" /></g>
      <path data-mouth="lower" className="lip" stroke="#000" strokeOpacity={0.35} strokeWidth={0.35} />
      <path data-mouth="upper" className="lip" stroke="#000" strokeOpacity={0.35} strokeWidth={0.35} />
      <path data-mouth="shade" fill="#000" opacity={0.14} />
      <path data-mouth="line" fill="none" stroke="#2a1214" strokeWidth={0.7} strokeLinecap="round" />
    </>
  );
}

/** The small version, for lists and cast strips. Same art, a different window onto it — the first
 *  attempt did this by offsetting a full-body render inside a small box, which put the window on
 *  empty canvas above her head. */
export function SlaveHead({ person, size = 48 }: { person: Person; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 8, overflow: "hidden", background: "var(--ink-2)", flexShrink: 0 }}>
      <SlaveArt person={person} height={size} crop="head" />
    </div>
  );
}

/** Head and chest, for the market and the cast strip. */
export function SlaveBust({ person, height = 150 }: { person: Person; height?: number }) {
  return <SlaveArt person={person} height={height} crop="bust" />;
}
