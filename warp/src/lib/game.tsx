/**
 * ONE STATE, ONE WRITER.
 *
 * Every view reads the save through this hook and every mutation goes through `mutate`. That is
 * the whole state management story, and it is deliberate: the save is one plain object, the engine
 * functions take it and change it, and React's job is to redraw afterwards. No store library, no
 * slices, no reducers, no selectors — the model of the world lives in engine/, not in the UI, and
 * the UI is not allowed to hold a second copy of anything.
 *
 * Persistence is debounced rather than per-mutation: a scene turn touches the save many times, and
 * an IndexedDB write per touch is how a long campaign starts stuttering.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { SaveState } from "../engine/types";
import { putSave } from "../store";

interface Ctx {
  save: SaveState;
  mutate: (fn: (s: SaveState) => void) => void;
  replace: (s: SaveState) => void;
  /** Bumped on every mutation; useful as a dependency for expensive derived work. */
  rev: number;
}

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ initial, children }: { initial: SaveState; children: ReactNode }) {
  const ref = useRef<SaveState>(initial);
  const [rev, setRev] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const persist = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { void putSave(ref.current); }, 900);
  }, []);

  const mutate = useCallback((fn: (s: SaveState) => void) => {
    fn(ref.current);
    setRev((n) => n + 1);
    persist();
  }, [persist]);

  const replace = useCallback((s: SaveState) => {
    ref.current = s;
    setRev((n) => n + 1);
    void putSave(s);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  // Save on the way out — a tab closed mid-week should not lose the week.
  useEffect(() => {
    const flush = () => { void putSave(ref.current); };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", flush);
    return () => { window.removeEventListener("beforeunload", flush); document.removeEventListener("visibilitychange", flush); };
  }, []);

  const value = useMemo<Ctx>(() => ({ save: ref.current, mutate, replace, rev }), [mutate, replace, rev]);
  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame(): Ctx {
  const c = useContext(GameCtx);
  if (!c) throw new Error("useGame outside a GameProvider");
  return c;
}
