/**
 * THE PART OF THE SCREEN YOU CAN ACTUALLY SEE.
 *
 * On a phone the keyboard slides up over a fixed, full-height screen and covers its bottom half;
 * the page behind it doesn't shrink, so whatever sat in the middle is left a sliver tall. The
 * visual viewport is what's left above the keyboard: size a full-screen view to it and the
 * keyboard pushes the view up instead of sitting on it.
 */
import { useEffect, useState } from "react";

export interface Visible { height: number; top: number }

function read(): Visible {
  const vv = typeof window !== "undefined" ? window.visualViewport : null;
  return { height: vv?.height ?? (typeof window !== "undefined" ? window.innerHeight : 800), top: vv?.offsetTop ?? 0 };
}

export function useVisibleViewport(): Visible {
  const [v, setV] = useState(read);
  useEffect(() => {
    const vv = window.visualViewport;
    const on = () => setV(read());
    vv?.addEventListener("resize", on);
    vv?.addEventListener("scroll", on);
    window.addEventListener("resize", on);
    return () => { vv?.removeEventListener("resize", on); vv?.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return v;
}
