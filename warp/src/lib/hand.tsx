/**
 * HER HAND ON YOURS.
 *
 * Once she holds your collar, the screens where you run things answer to her first. A screen
 * takes its `mutate` from `useHand` instead of `useGame`, and every change you make there by
 * pressing something is put to her (engine/share): with a hand in, she lets it through or stops
 * it; locked out, nothing goes through, and the screen says so. Changes nobody pressed for (a
 * screen tidying its own state) aren't hers to rule on, and neither is closing or opening things.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { SaveState } from "../engine/types";
import { useGame } from "./game";
import { handOf, herSay, type Domain, DOMAIN_WORDS } from "../engine/share";

/** What was last pressed, and when: the words on it are what she's ruling on. */
let pressed = { text: "", at: 0 };
if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", (e) => {
    const el = (e.target as HTMLElement | null)?.closest?.("button, [role=button], input[type=checkbox], input[type=range]");
    if (!el) return;
    pressed = { text: (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim(), at: Date.now() };
  }, true);
  // A dropdown is decided by what was picked, not by everything in it.
  document.addEventListener("change", (e) => {
    const el = e.target as HTMLSelectElement | null;
    if (el?.tagName !== "SELECT") return;
    pressed = { text: el.selectedOptions[0]?.text ?? "", at: Date.now() };
  }, true);
}

/** Pressing these never decides anything. */
const FREE = /^(close|back|done|cancel|more|less|show|hide|open|view|details|×|x|ok|next|prev|previous|see|read|expand|collapse|all|none|filter|sort|forget|edit|paint|portrait|be with|go to|talk|ask)\b/i;

const listeners = new Set<(t: string) => void>();
function toast(text: string) { for (const l of listeners) l(text); }

export function useHand(domain: Domain): (fn: (s: SaveState) => void) => void {
  const { mutate } = useGame();
  return useCallback((fn: (s: SaveState) => void) => {
    const recent = Date.now() - pressed.at < 1500 && pressed.text && !FREE.test(pressed.text);
    if (!recent) { mutate(fn); return; }
    const said = { line: "" };
    mutate((s) => { const v = herSay(s, domain, pressed.text); if (v.ok) fn(s); else said.line = v.line; });
    if (said.line) toast(said.line);
  }, [mutate, domain]);
}

/** The line at the bottom of the screen when she stops you. */
export function HandToast() {
  const [text, setText] = useState("");
  useEffect(() => {
    let timer: number | undefined;
    const on = (t: string) => { setText(t); window.clearTimeout(timer); timer = window.setTimeout(() => setText(""), 5000); };
    listeners.add(on);
    return () => { listeners.delete(on); window.clearTimeout(timer); };
  }, []);
  if (!text) return null;
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-20 md:bottom-6 z-50 max-w-[92vw] w-[520px] card p-3 text-[13px] fade-in" style={{ borderColor: "var(--warn)" }} onClick={() => setText("")}>
      {text}
    </div>
  );
}

/** A screen you run things from. Locked out, you see it all and can't touch it. */
export function Held({ domain, children }: { domain: Domain; children: ReactNode }) {
  const { save } = useGame();
  const hand = handOf(save);
  if (hand === "owner") return <>{children}</>;
  const her = save.player.owned_by ? save.people[save.player.owned_by] : undefined;
  return (
    <>
      <div className="card-2 p-3 mb-4 text-[12.5px]" style={{ borderColor: hand === "locked" ? "var(--warn)" : undefined }}>
        {hand === "locked"
          ? <>{her?.name ?? "She"} runs {DOMAIN_WORDS[domain]} now. You can see what she's doing with it; you can't change any of it.</>
          : <>You still run {DOMAIN_WORDS[domain]}, with {her?.name ?? "her"} watching. She can stop anything you do here.</>}
      </div>
      {hand === "locked"
        ? <div aria-disabled style={{ pointerEvents: "none", opacity: 0.72, userSelect: "none" }}>{children}</div>
        : children}
    </>
  );
}
