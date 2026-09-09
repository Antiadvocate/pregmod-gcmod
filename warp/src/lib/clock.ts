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
type Ticker = (ms: number) => void;

const tickers = new Set<Ticker>();
let running = false;

function pump(ms: number): void {
  for (const t of tickers) t(ms);
  if (tickers.size) requestAnimationFrame(pump);
  else running = false;
}

export function subscribeClock(t: Ticker): () => void {
  if (stillWanted()) { t(0); return () => {}; }
  tickers.add(t);
  if (!running) { running = true; requestAnimationFrame(pump); }
  return () => { tickers.delete(t); };
}

/** Anyone who would rather the page held still gets a page that holds still — and gets one frame
 *  at t=0 so what they see is the composed still, not an unpainted default. */
export function stillWanted(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}
