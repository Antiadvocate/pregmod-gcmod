/**
 * The globe itself: an orthographic projection on a canvas, dragged to turn, wheeled to zoom, and
 * clicked to pick a place. The countries load once, lazily, from world-atlas's 1:110m map.
 *
 * Drawn back to front: the sea, a graticule, the land, the Old World regions as washes coloured by
 * their state (red at war, amber in unrest, violet under plague, gold in a boom), everyone's area as
 * a circle on the sphere, your trade routes as great-circle arcs (dashed when disrupted), and the
 * markers with their names. Anything on the far side of the planet is not drawn.
 */
import { useEffect, useRef, useState } from "react";
import { geoCircle, geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Place } from "../engine/globe";

let countries: Promise<GeoPermissibleObjects> | null = null;
function loadCountries(): Promise<GeoPermissibleObjects> {
  countries ??= import("world-atlas/countries-110m.json").then((m) => {
    const topo = (m as { default?: unknown }).default ?? m;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return feature(topo as any, (topo as any).objects.countries) as unknown as GeoPermissibleObjects;
  });
  return countries;
}

const STATE_COLOR: Record<string, string> = { war: "#cf5a4e", collapse: "#8e3b33", unrest: "#d59a4e", plague: "#9a7fc4", boom: "#c9a227", calm: "#7fa87f" };
const css = (name: string, dflt: string) => (typeof document !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || dflt : dflt);

export default function GlobeCanvas({ places, selected, onSelect, focus }: { places: Place[]; selected?: string; onSelect: (id: string) => void; focus?: [number, number] }) {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [land, setLand] = useState<GeoPermissibleObjects | null>(null);
  const [size, setSize] = useState(520);
  const view = useRef({ rot: [-(focus?.[1] ?? 50), -(focus?.[0] ?? 20)] as [number, number], zoom: 1, spinning: true, drag: null as null | { x: number; y: number; rot: [number, number] } });
  const placesRef = useRef(places);
  placesRef.current = places;
  const selRef = useRef(selected);
  selRef.current = selected;

  useEffect(() => { void loadCountries().then(setLand).catch(() => setLand(null)); }, []);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize(Math.max(260, Math.min(720, el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Turn to face whatever was picked.
  useEffect(() => { if (focus) { view.current.rot = [-focus[1], -focus[0]]; view.current.spinning = false; } }, [focus?.[0], focus?.[1]]);

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr; canvas.height = size * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const accent = css("--accent", "#c9a227"), textHi = css("--text-hi", "#eae3d2"), textLo = css("--text-lo", "#857c6c");
    const proj = geoOrthographic().clipAngle(90).translate([size / 2, size / 2]);
    const path = geoPath(proj, ctx);
    const grat = geoGraticule10();
    let raf = 0, t0 = performance.now();

    const draw = (now: number) => {
      const v = view.current;
      if (v.spinning && !v.drag) v.rot = [v.rot[0] + (now - t0) * 0.006, v.rot[1]];
      t0 = now;
      const r = (size / 2 - 8) * v.zoom;
      proj.scale(r).rotate([v.rot[0], v.rot[1]]);
      const center: [number, number] = [-v.rot[0], -v.rot[1]];
      const front = (p: [number, number]) => geoDistance([p[1], p[0]], center) < Math.PI / 2 - 0.02;
      ctx.clearRect(0, 0, size, size);

      // the sea, lit from the upper left, and the atmosphere
      const glow = ctx.createRadialGradient(size / 2, size / 2, r * 0.96, size / 2, size / 2, r * 1.08);
      glow.addColorStop(0, "rgba(120,170,200,0.28)"); glow.addColorStop(1, "rgba(120,170,200,0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(size / 2, size / 2, r * 1.08, 0, Math.PI * 2); ctx.fill();
      const sea = ctx.createRadialGradient(size / 2 - r * 0.35, size / 2 - r * 0.35, r * 0.1, size / 2, size / 2, r);
      sea.addColorStop(0, "#1d3a4f"); sea.addColorStop(1, "#0a1520");
      ctx.fillStyle = sea; ctx.beginPath(); path({ type: "Sphere" }); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 0.6; ctx.beginPath(); path(grat); ctx.stroke();

      if (land) {
        ctx.fillStyle = "#3b3a30"; ctx.beginPath(); path(land); ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 0.5; ctx.beginPath(); path(land); ctx.stroke();
      }

      const ps = placesRef.current;
      const circle = (p: Place, fill: string, stroke: string, dash?: number[]) => {
        const c = geoCircle().center([p.at[1], p.at[0]]).radius(p.radiusKm / 111.2)();
        ctx.beginPath(); path(c); ctx.fillStyle = fill; ctx.fill();
        ctx.setLineDash(dash ?? []); ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);
      };
      // regions: a wash in the colour of their state; wars pulse
      const pulse = 0.5 + 0.5 * Math.sin(now / 350);
      for (const p of ps.filter((x) => x.kind === "region")) {
        const col = STATE_COLOR[p.state ?? "calm"];
        const hot = p.state === "war" || p.state === "collapse";
        circle(p, hexA(col, hot ? 0.16 + pulse * 0.14 : 0.14), hexA(col, 0.6), hot ? undefined : [4, 3]);
      }
      // routes
      const home = ps.find((x) => x.kind === "yours");
      if (home) for (const p of ps.filter((x) => x.kind === "region" && x.route)) {
        const interp = geoInterpolate([home.at[1], home.at[0]], [p.at[1], p.at[0]]);
        const line = { type: "LineString" as const, coordinates: Array.from({ length: 48 }, (_, i) => interp(i / 47)) };
        ctx.beginPath(); path(line); ctx.setLineDash(p.disrupted ? [5, 5] : []); ctx.strokeStyle = hexA(p.disrupted ? "#cf5a4e" : accent, 0.85); ctx.lineWidth = 1.6; ctx.stroke(); ctx.setLineDash([]);
      }
      // arcologies' areas
      for (const p of ps.filter((x) => x.kind === "freecity")) circle(p, "rgba(180,190,200,0.12)", "rgba(180,190,200,0.5)");
      for (const p of ps.filter((x) => x.kind === "neighbour")) {
        const own = (p.owned ?? 0) / 100;
        circle(p, own > 0 ? hexA(accent, 0.1 + own * 0.35) : "rgba(120,160,210,0.16)", own > 0 ? hexA(accent, 0.8) : "rgba(120,160,210,0.7)");
      }
      if (home) circle(home, hexA(accent, 0.22), accent);

      // markers and names
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.textBaseline = "middle";
      const order = [...ps].sort((a, b) => (a.kind === "yours" ? 1 : 0) - (b.kind === "yours" ? 1 : 0));
      for (const p of order) {
        if (!front(p.at)) continue;
        const xy = proj([p.at[1], p.at[0]]);
        if (!xy) continue;
        const sel = selRef.current === p.id;
        const col = p.kind === "yours" ? accent : p.kind === "region" ? STATE_COLOR[p.state ?? "calm"] : p.kind === "neighbour" ? "#8fb2de" : "#b8bec6";
        const rad = p.kind === "yours" ? 5 : p.kind === "region" ? 4 : 3.5;
        if (p.kind === "region" && (p.state === "war" || p.state === "collapse")) { ctx.beginPath(); ctx.arc(xy[0], xy[1], rad + 3 + pulse * 5, 0, Math.PI * 2); ctx.strokeStyle = hexA(col, 0.6 - pulse * 0.4); ctx.lineWidth = 1.5; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(xy[0], xy[1], rad + (sel ? 2 : 0), 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
        ctx.lineWidth = sel ? 2 : 1; ctx.strokeStyle = sel ? textHi : "rgba(0,0,0,0.6)"; ctx.stroke();
        // Neighbours sit a few hundred km from home: their names wait for a closer look, or a pick.
        const crowded = p.kind === "neighbour" ? v.zoom < 2.2 : p.kind === "freecity" ? v.zoom < 0.9 : false;
        if (!crowded || sel) {
          const label = p.kind === "region" && p.state && p.state !== "calm" ? `${p.name} · ${p.state}` : p.name;
          ctx.fillStyle = "rgba(0,0,0,0.55)"; const w = ctx.measureText(label).width;
          ctx.fillRect(xy[0] + rad + 4, xy[1] - 7, w + 6, 14);
          ctx.fillStyle = sel ? textHi : p.kind === "yours" ? accent : textLo;
          ctx.fillText(label, xy[0] + rad + 7, xy[1]);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const pick = (x: number, y: number): string | undefined => {
      let best: string | undefined, bd = 16;
      const v = view.current;
      for (const p of placesRef.current) {
        if (geoDistance([p.at[1], p.at[0]], [-v.rot[0], -v.rot[1]]) > Math.PI / 2) continue;
        const xy = proj([p.at[1], p.at[0]]);
        if (!xy) continue;
        const d = Math.hypot(xy[0] - x, xy[1] - y);
        if (d < bd) { bd = d; best = p.id; }
      }
      return best;
    };
    const pos = (e: PointerEvent | WheelEvent) => { const b = canvas.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top] as const; };
    let moved = 0;
    const down = (e: PointerEvent) => { const [x, y] = pos(e); view.current.drag = { x, y, rot: [...view.current.rot] as [number, number] }; view.current.spinning = false; moved = 0; canvas.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      const d = view.current.drag; if (!d) return;
      const [x, y] = pos(e); moved += Math.abs(x - d.x) + Math.abs(y - d.y);
      const k = 90 / ((size / 2) * view.current.zoom);
      view.current.rot = [d.rot[0] + (x - d.x) * k, Math.max(-85, Math.min(85, d.rot[1] - (y - d.y) * k))];
    };
    const up = (e: PointerEvent) => { const [x, y] = pos(e); if (moved < 6) { const id = pick(x, y); if (id) onSelect(id); } view.current.drag = null; };
    const wheel = (e: WheelEvent) => { e.preventDefault(); view.current.zoom = Math.max(0.8, Math.min(6, view.current.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12))); };
    canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up);
    canvas.addEventListener("wheel", wheel, { passive: false });
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); canvas.removeEventListener("wheel", wheel); };
  }, [size, land, onSelect]);

  const zoom = (k: number) => { view.current.zoom = Math.max(0.8, Math.min(6, view.current.zoom * k)); };
  return (
    <div ref={box} className="relative w-full" style={{ maxWidth: 720 }}>
      <canvas ref={cv} style={{ width: size, height: size, touchAction: "none", cursor: "grab", display: "block", margin: "0 auto" }} aria-label="the globe: drag to turn, scroll to zoom, click a place" />
      <div className="absolute right-1 top-1 flex flex-col gap-1">
        <button className="chip !text-[13px] !px-2" onClick={() => zoom(1.3)} aria-label="zoom in">+</button>
        <button className="chip !text-[13px] !px-2" onClick={() => zoom(1 / 1.3)} aria-label="zoom out">−</button>
        <button className="chip !text-[11px] !px-2" onClick={() => { view.current.spinning = !view.current.spinning; }} title="spin">⟳</button>
      </div>
    </div>
  );
}

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a.toFixed(3)})`;
}
