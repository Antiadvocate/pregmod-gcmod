/**
 * Sub-tabs for the long screens: a bar that stays at the top while you scroll, scrolls sideways on a
 * phone, and shows one part of the screen at a time. Which part you had open is remembered per
 * screen (in this browser only; a private window just starts at the first).
 */
import { useEffect, useState, type ReactNode } from "react";
import { cx } from "../lib/ui";

export interface SubTab { id: string; label: string; badge?: ReactNode; render: () => ReactNode }

const load = (key: string) => { try { return localStorage.getItem(key) ?? ""; } catch { return ""; } };
const save = (key: string, v: string) => { try { localStorage.setItem(key, v); } catch { /* private window: fine */ } };

export default function SubTabs({ id, tabs }: { id: string; tabs: SubTab[] }) {
  const key = `warp:subtab:${id}`;
  const [on, setOn] = useState(() => load(key));
  const current = tabs.find((t) => t.id === on) ?? tabs[0];
  useEffect(() => { if (current) save(key, current.id); }, [key, current?.id]);
  if (!current) return null;
  const pick = (t: string) => {
    setOn(t);
    document.querySelector("main")?.scrollTo({ top: 0 });
  };
  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-3" style={{ background: "var(--ink-0)", borderBottom: "1px solid var(--line)" }}>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar" role="tablist" style={{ WebkitOverflowScrolling: "touch" }}>
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={t.id === current.id} onClick={() => pick(t.id)}
              className={cx("chip shrink-0 !text-[12.5px] !py-1.5 !px-3", t.id === current.id && "on")}>
              {t.label}{t.badge ? <span className="ml-1.5 opacity-80">{t.badge}</span> : null}
            </button>
          ))}
        </div>
      </div>
      {current.render()}
    </>
  );
}
