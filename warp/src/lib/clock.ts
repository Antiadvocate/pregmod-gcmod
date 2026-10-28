/**
 * ONE ANIMATION CLOCK FOR THE WHOLE APP.
 *
 * Every moving thing on screen — forty breathing figures on the roster, the lit windows of a city,
 * smoke off the works — subscribes here rather than starting its own requestAnimationFrame. Two
 * loops in one app is how a phone's battery goes, and forty is worse.
 *
 * Subscribers write attributes directly on DOM nodes. Nothing here touches React state, so a
 * breathing roster over a lit skyline re-renders exactly nothing per frame.
 *
 * The loop stops itself when the last subscriber leaves and restarts when one arrives, so a screen
 * with nothing animated on it costs nothing at all.
 */
import { getGraphics, subscribeGraphics } from "./graphics";

type Ticker = (ms: number) => void;

const tickers = new Set<Ticker>();
let running = false;
let lastTick = 0;
/** Breathing and blinking don't need the 120 frames a second a newer iPhone screen offers. */
const FRAME_MS = 1000 / 30;

function pump(ms: number): void {
  // Graphics turned down while things were moving: stop here, and start again if it's turned up.
  if (!tickers.size || stillWanted()) { running = false; return; }
  if (ms - lastTick >= FRAME_MS) { lastTick = ms; for (const t of tickers) t(ms); }
  requestAnimationFrame(pump);
}

function start(): void {
  if (!running && tickers.size && !stillWanted()) { running = true; requestAnimationFrame(pump); }
}
subscribeGraphics(start);

export function subscribeClock(t: Ticker): () => void {
  if (stillWanted()) { t(0); return () => {}; }
  tickers.add(t);
  start();
  return () => { tickers.delete(t); };
}

/** Anyone who would rather the page held still gets a page that holds still — and gets one frame
 *  at t=0 so what they see is the composed still, not an unpainted default. That's the system's
 *  reduce-motion setting, or graphics turned down in Settings. */
export function stillWanted(): boolean {
  return getGraphics() !== "full" || (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
}
