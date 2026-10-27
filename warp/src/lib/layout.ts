/**
 * HOW THE CONSOLE IS LAID OUT, ON THIS DEVICE.
 *
 * Every screen was one column of cards, stacked, on a phone and on a 27-inch monitor alike: the
 * monitor showed a strip down the middle and two black margins. Three ways to lay a screen out:
 *
 *   columns  the cards flow side by side, as many columns as the window has room for (default)
 *   strip    the same flow turned on its side: columns down the height of the window, scrolled
 *            sideways like a broadsheet; the mouse wheel and the edge arrows move it
 *   stack    the old single column
 *
 * And two ways to get around on a desk: the families across the top (default), or the old rail
 * down the side. On a phone the tab bar stays where the thumb is either way.
 */
import { useSyncExternalStore } from "react";

export type Layout = "columns" | "strip" | "stack";
export type Nav = "top" | "rail";

const LAYOUT = "warp-layout";
const NAV = "warp-nav";
const subs = new Set<() => void>();

const read = (k: string): string | null => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string): void => { try { localStorage.setItem(k, v); } catch { /* storage blocked: it lasts the session */ } };

let mem: { layout?: Layout; nav?: Nav } = {};

export function getLayout(): Layout {
  const v = mem.layout ?? read(LAYOUT);
  return v === "strip" || v === "stack" ? v : "columns";
}
export function getNav(): Nav {
  return (mem.nav ?? read(NAV)) === "rail" ? "rail" : "top";
}
export function setLayout(v: Layout): void { mem = { ...mem, layout: v }; write(LAYOUT, v); subs.forEach((f) => f()); }
export function setNav(v: Nav): void { mem = { ...mem, nav: v }; write(NAV, v); subs.forEach((f) => f()); }

function subscribe(f: () => void): () => void { subs.add(f); return () => subs.delete(f); }

/** The layout and the nav, kept in step with Settings. */
export function useLayout(): { layout: Layout; nav: Nav } {
  const key = useSyncExternalStore(subscribe, () => `${getLayout()}|${getNav()}`);
  const [layout, nav] = key.split("|") as [Layout, Nav];
  return { layout, nav };
}
