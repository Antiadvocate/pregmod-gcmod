/**
 * HOW MUCH THE SCREEN DRAWS, ON THIS DEVICE.
 *
 * A phone ran hot on this: every portrait breathing and blinking at the screen's full refresh rate
 * (120 a second on a newer iPhone), the top and bottom bars re-blurring whatever scrolled under
 * them, a dozen CSS loops that never stop, and the globe redrawing every frame while it sat still.
 *
 *   full   everything moves, at up to 30 frames a second, which is plenty for breathing (default)
 *   still  the portraits are drawn but hold still; no CSS loops, no glass blur, the globe only
 *          redraws when you touch it
 *   off    no portraits or drawn art at all, just the words
 */
import { useSyncExternalStore } from "react";

export type Graphics = "full" | "still" | "off";

const KEY = "warp-graphics";
const subs = new Set<() => void>();
let mem: Graphics | undefined;

const read = (): string | null => { try { return localStorage.getItem(KEY); } catch { return null; } };

export function getGraphics(): Graphics {
  const v = mem ?? read();
  return v === "still" || v === "off" ? v : "full";
}

function apply(v: Graphics): void {
  if (typeof document !== "undefined") document.documentElement.dataset.gfx = v;
}

export function setGraphics(v: Graphics): void {
  mem = v;
  try { localStorage.setItem(KEY, v); } catch { /* storage blocked: it lasts the session */ }
  apply(v);
  subs.forEach((f) => f());
}

/** Once, at start: put the saved setting on the page so the stylesheet can see it. */
export function initGraphics(): void { apply(getGraphics()); }

export function subscribeGraphics(f: () => void): () => void { subs.add(f); return () => subs.delete(f); }

/** The setting, kept in step with Settings. */
export function useGraphics(): Graphics {
  return useSyncExternalStore(subscribeGraphics, getGraphics, () => "full" as Graphics);
}
