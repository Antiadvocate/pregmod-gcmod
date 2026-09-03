/**
 * THE COMPONENT THAT DRAWS HER.
 *
 * Fetches the layers the compositor asked for, caches them for the life of the tab, drops any that
 * do not exist, and inlines the survivors into one SVG with a scoped stylesheet. A missing layer is
 * a missing detail, never a missing person.
 *
 * Layers are ~350 bytes each and there are a dozen or so per body, so a roster of forty is a few
 * hundred kilobytes fetched once and then served from a Map. No GPU, no key, no network after the
 * first draw.
 */
import { useEffect, useState, useMemo } from "react";
import type { Person } from "../engine/types";
import { ART_BASE, CROPS, layersFor, styleFor, heightScaleFor, type Crop, type Layer } from "../lib/vectorart";

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

let scopeSeq = 0;

export default function SlaveArt({ person, height = 260, crop = "full", className }:
  { person: Person; height?: number | string; crop?: Crop; className?: string }) {
  const layers = useMemo(() => layersFor(person), [person]);
  const scope = useMemo(() => `sa${(scopeSeq++).toString(36)}`, []);
  const [markup, setMarkup] = useState<{ layer: Layer; inner: string }[]>([]);

  useEffect(() => {
    let live = true;
    (async () => {
      const loaded = await Promise.all(layers.map(async (layer) => ({ layer, inner: await loadLayer(layer.id) })));
      if (!live) return;
      setMarkup(loaded.filter((x): x is { layer: Layer; inner: string } => !!x.inner));
    })();
    return () => { live = false; };
  }, [layers]);

  const css = useMemo(() => styleFor(person, scope), [person, scope]);
  const scale = heightScaleFor(person);

  return (
    <div className={className} style={{ height, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
      <svg viewBox={CROPS[crop]} className={scope} preserveAspectRatio="xMidYMax meet"
        style={{ height: "100%", transform: crop === "full" ? `scale(${scale})` : undefined, transformOrigin: "bottom center" }}
        role="img" aria-label={person.name}>
        <style>{css}</style>
        {markup.map(({ layer, inner }, i) => (
          <g key={`${layer.id}-${i}`} transform={layer.transform} dangerouslySetInnerHTML={{ __html: inner }} />
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
