/**
 * THE SHELL — nine destinations, one of which is a story.
 *
 * The old game was a hypertext: every screen was a passage, every action was a link that replaced
 * the page, and finding out what a slave was actually like meant walking a tree of them. Warp is a
 * console with a scene attached. You are always one tap from the roster, the arcology, the week and
 * the story, and nothing ever navigates away from what you were reading.
 */
import { useEffect, useState } from "react";
import {
  Building2, Users, Play, Landmark, ScrollText, ShoppingBag, ClipboardList, Settings as Cog, FileText, UserRound, Wand2,
} from "lucide-react";
import type { SaveState } from "./engine/types";
import { GameProvider, useGame } from "./lib/game";
import { listSaves, getSave } from "./store";
import { cx } from "./lib/ui";
import Start from "./views/Start";
import Penthouse from "./views/Penthouse";
import Roster from "./views/Roster";
import Scene from "./views/Scene";
import ArcologyView from "./views/Arcology";
import Doctrine from "./views/Doctrine";
import Market from "./views/Market";
import Orders from "./views/Orders";
import Report from "./views/Report";
import SettingsView from "./views/Settings";
import You from "./views/You";
import Cheats from "./views/Cheats";

export type Route = "penthouse" | "people" | "scene" | "arcology" | "doctrine" | "market" | "orders" | "report" | "you" | "cheats" | "settings";

const NAV: { id: Route; label: string; icon: typeof Building2 }[] = [
  { id: "penthouse", label: "Penthouse", icon: Building2 },
  { id: "people", label: "People", icon: Users },
  { id: "scene", label: "Scene", icon: Play },
  { id: "arcology", label: "Arcology", icon: Landmark },
  { id: "doctrine", label: "Doctrine", icon: ScrollText },
  { id: "market", label: "Market", icon: ShoppingBag },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "report", label: "Week", icon: FileText },
  { id: "you", label: "You", icon: UserRound },
  { id: "cheats", label: "Cheats", icon: Wand2 },
  { id: "settings", label: "Settings", icon: Cog },
];

export default function App() {
  const [save, setSave] = useState<SaveState | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      const saves = await listSaves();
      const last = localStorage.getItem("warp-last");
      const pick = (last && saves.find((s) => s.id === last)) || saves[0];
      if (pick) {
        const loaded = await getSave(pick.id);
        if (loaded) setSave(loaded);
      }
      setBooting(false);
    })();
  }, []);

  if (booting) return <div className="h-dvh grid place-items-center dim">…</div>;
  if (!save) return <Start onStart={(s) => { localStorage.setItem("warp-last", s.id); setSave(s); }} />;

  return (
    <GameProvider initial={save}>
      <Shell onSwitch={() => setSave(null)} />
    </GameProvider>
  );
}

function Shell({ onSwitch }: { onSwitch: () => void }) {
  const { save, rev } = useGame();
  const [route, setRoute] = useState<Route>("penthouse");
  const unseen = save.notifications.filter((n) => !n.seen).length + save.events.length;

  return (
    <div className="shell" key={rev === -1 ? 1 : undefined}>
      <header className="topbar px-4 py-2.5 flex items-center gap-4 shrink-0">
        <div className="min-w-0">
          <div className="font-display text-[15px] leading-tight truncate">{save.arcology.name}</div>
          <div className="text-[11px] dim font-mono">week {save.arcology.week} · {save.scene.time.replace(/^Week \d+, /, "")}</div>
        </div>
        <div className="ml-auto flex items-center gap-3 font-mono text-[13px]">
          <span style={{ color: save.arcology.cash < 0 ? "var(--danger)" : "var(--text-hi)" }}>
            ¤{Math.round(save.arcology.cash).toLocaleString()}
          </span>
          <span className="dim">rep {Math.round(save.arcology.rep).toLocaleString()}</span>
          <span className="dim hidden sm:inline">{Object.values(save.people).filter((p) => p.status === "owned" || p.status === "indentured").length} owned</span>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <nav className="rail hidden md:flex flex-col gap-1 p-2 w-[172px] shrink-0 overflow-y-auto">
          {NAV.map((n) => (
            <button key={n.id} className={cx("railbtn", route === n.id && "on")} onClick={() => setRoute(n.id)}>
              <n.icon size={15} strokeWidth={1.8} />
              {n.label}
              {n.id === "penthouse" && unseen ? <span className="ml-auto chip on">{unseen}</span> : null}
            </button>
          ))}
          <button className="railbtn mt-auto" onClick={onSwitch} title="new game, or load another save">new game / saves</button>
        </nav>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className={cx("mx-auto w-full", route === "scene" ? "max-w-3xl h-full" : "max-w-5xl p-4 sm:p-6")}>
            {route === "penthouse" && <Penthouse go={setRoute} />}
            {route === "people" && <Roster />}
            {route === "scene" && <Scene />}
            {route === "arcology" && <ArcologyView />}
            {route === "doctrine" && <Doctrine />}
            {route === "market" && <Market />}
            {route === "orders" && <Orders />}
            {route === "report" && <Report />}
            {route === "you" && <You />}
            {route === "cheats" && <Cheats />}
            {route === "settings" && <SettingsView onSwitch={onSwitch} />}
          </div>
        </main>
      </div>

      <nav className="tabbar md:hidden flex shrink-0 overflow-x-auto">
        {NAV.map((n) => (
          <button key={n.id} className={cx("flex-1 min-w-[56px] py-2.5 grid place-items-center", route === n.id ? "acc" : "dim")} onClick={() => setRoute(n.id)}>
            <n.icon size={18} strokeWidth={1.8} />
          </button>
        ))}
      </nav>
    </div>
  );
}
