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
import { ART_BASE, cropFor, layersFor, styleFor, heightScaleFor, type Crop, type Layer } from "../lib/vectorart";
import { frameAt, jointFor, restingPose, transformFor, STILL, type Joint, type Pose } from "../lib/rig";

/** file stem → inner SVG markup, or null when the file is not in the pack. */
const cache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

async function loadLayer(id: string): Promise<string | null> {
  if (cache.has(id)) return cache.get(id)!;
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

/* ── one clock for everybody ───────────────────────────────────────────────────────────────── */

type Ticker = (ms: number) => void;
const tickers = new Set<Ticker>();
let running = false;

function pump(ms: number): void {
  for (const t of tickers) t(ms);
  if (tickers.size) requestAnimationFrame(pump);
  else running = false;
}

function subscribe(t: Ticker): () => void {
  tickers.add(t);
  if (!running) { running = true; requestAnimationFrame(pump); }
  return () => { tickers.delete(t); };
}

/** Anyone who would rather the page held still gets a page that holds still. */
const stillWanted = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

let scopeSeq = 0;

export default function SlaveArt({ person, height = 260, crop = "full", className, pose, animate = true, svgRef }:
  { person: Person; height?: number | string; crop?: Crop; className?: string; pose?: Pose; animate?: boolean;
    /** Handed out so a caller can rasterise exactly what is on screen — see lib/dollrender.ts. */
    svgRef?: RefObject<SVGSVGElement | null> }) {
  const held = pose ?? restingPose(person);
  const layers = useMemo(() => layersFor(person, held), [person, held]);
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
    return subscribe((ms) => paint(frameAt(person, held, ms)));
  }, [markup, person, held, animate]);

  const css = useMemo(() => styleFor(person, scope), [person, scope]);
  const scale = heightScaleFor(person);

  return (
    <div className={className} style={{ height, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
      <svg ref={svg} viewBox={cropFor(crop, held)} className={scope} preserveAspectRatio="xMidYMax meet"
        style={{ height: "100%", transform: crop === "full" ? `scale(${scale})` : undefined, transformOrigin: "bottom center" }}
        role="img" aria-label={`${person.name} — ${held.reads}`}>
        <style>{css}</style>
        {markup.map(({ layer, inner }, i) => (
          <g key={`${layer.id}-${i}`}
            data-joint={jointFor(layer.id)}
            data-own={layer.transform ?? ""}
            transform={layer.transform}
            dangerouslySetInnerHTML={{ __html: inner }} />
        ))}
      </svg>
    </div>
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
