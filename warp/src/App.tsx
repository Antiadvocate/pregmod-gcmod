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
  Building2, Users, Play, Landmark, ScrollText, ShoppingBag, ClipboardList, Settings as Cog, FileText, UserRound, Wand2, Globe2, BookOpen, Scale, GitCompareArrows, Earth, Dna, Newspaper } from "lucide-react";
import type { SaveState } from "./engine/types";
import { GameProvider, useGame } from "./lib/game";
import { listSaves, getSave } from "./store";
import { onRateWait } from "./llm";
import { cx } from "./lib/ui";
import Start from "./views/Start";
import Penthouse from "./views/Penthouse";
import Roster from "./views/Roster";
import Scene from "./views/Scene";
import ArcologyView from "./views/Arcology";
import City from "./views/City";
import Doctrine from "./views/Doctrine";
import Market from "./views/Market";
import Orders from "./views/Orders";
import Report from "./views/Report";
import SettingsView from "./views/Settings";
import You from "./views/You";
import Journal from "./views/Journal";
import Ending from "./views/Ending";
import Cheats from "./views/Cheats";
import Society from "./views/Society";
import Compare from "./views/Compare";
import World from "./views/World";
import Genome from "./views/Genome";
import Feed, { FeedTicker } from "./views/Feed";
import { unread as feedUnread } from "./engine/feed";

export type Route = "penthouse" | "feed" | "people" | "story" | "scene" | "city" | "society" | "compare" | "world" | "genome" | "arcology" | "doctrine" | "market" | "orders" | "report" | "you" | "cheats" | "settings";

const NAV: { id: Route; label: string; icon: typeof Building2 }[] = [
  { id: "penthouse", label: "Penthouse", icon: Building2 },
  { id: "feed", label: "Feed", icon: Newspaper },
  { id: "people", label: "People", icon: Users },
  { id: "story", label: "Story", icon: BookOpen },
  { id: "scene", label: "Scene", icon: Play },
  { id: "city", label: "City", icon: Globe2 },
  { id: "society", label: "Society", icon: Scale },
  { id: "compare", label: "Compare", icon: GitCompareArrows },
  { id: "world", label: "World", icon: Earth },
  { id: "genome", label: "Genome", icon: Dna },
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

/**
 * Five tabs, every screen inside one of them.
 *
 * Seventeen screens and all of them in use: a bar of five with a "More" drawer hid twelve of them
 * behind a tap and a hunt. Each tab is now a family, and the family's screens sit as tabs across
 * the top, so any screen is two taps away and the one you were on in each family is remembered.
 * Settings and Cheats are a gear in the header, since they are not places in the arcology.
 */
type Group = { id: string; label: string; icon: typeof Building2; routes: Route[] };
const GROUPS: Group[] = [
  { id: "home", label: "Home", icon: Building2, routes: ["penthouse", "feed", "report"] },
  { id: "people", label: "People", icon: Users, routes: ["people", "orders", "you", "genome"] },
  { id: "story", label: "Story", icon: BookOpen, routes: ["story", "scene"] },
  { id: "city", label: "City", icon: Globe2, routes: ["city", "arcology", "society", "doctrine", "world", "compare"] },
  { id: "market", label: "Market", icon: ShoppingBag, routes: ["market"] },
];
const SYSTEM: Group = { id: "system", label: "Settings", icon: Cog, routes: ["settings", "cheats"] };
const groupOf = (r: Route) => GROUPS.find((g) => g.routes.includes(r)) ?? SYSTEM;
/** The name a screen goes by in its family's tab row, where it differs from the rail. */
const SHORT: Partial<Record<Route, string>> = { penthouse: "Today", report: "Week" };
const labelOf = (r: Route) => SHORT[r] ?? NAV.find((n) => n.id === r)!.label;

/** A line at the top while a rate-limited call waits to try again, so the screen isn't just stuck. */
function RateNotice() {
  const [wait, setWait] = useState<{ until: number; status: number; model: string } | null>(null);
  const [, tick] = useState(0);
  useEffect(() => onRateWait((ms, status, model) => setWait({ until: Date.now() + ms, status, model })), []);
  useEffect(() => { if (!wait) return; const id = setInterval(() => { if (Date.now() > wait.until) setWait(null); tick((n) => n + 1); }, 500); return () => clearInterval(id); }, [wait]);
  if (!wait) return null;
  return (
    <div className="px-4 py-1.5 text-[12px]" style={{ background: "var(--accent-soft)", color: "var(--warn)" }}>
      {wait.status === 429 ? `${wait.model} is rate-limiting requests` : `${wait.model} is overloaded`}; trying again in {Math.max(0, Math.ceil((wait.until - Date.now()) / 1000))}s.
    </div>
  );
}

function Shell({ onSwitch }: { onSwitch: () => void }) {
  const { save, rev } = useGame();
  const [route, setRouteState] = useState<Route>("penthouse");
  const [last, setLast] = useState<Record<string, Route>>({});
  const group = groupOf(route);
  const setRoute = (r: Route) => {
    setRouteState(r);
    setLast((l) => ({ ...l, [groupOf(r).id]: r }));
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "instant" });
  };
  /** A tab goes back to the screen you left in it; tapping the tab you are on goes to its first. */
  const openGroup = (g: Group) => setRoute(g.id === group.id ? g.routes[0] : last[g.id] ?? g.routes[0]);
  const unseen = save.notifications.filter((n) => !n.seen).length + save.events.length + (save.asks?.length ?? 0);

  return (
    <div className="shell" key={rev === -1 ? 1 : undefined}>
      <header className="topbar shrink-0">
        <div className="px-4 pt-2.5 pb-2 flex items-center gap-3">
          <div className="min-w-0">
            <div className="font-display text-[15px] leading-tight truncate">{save.arcology.name}</div>
            <div className="text-[11px] dim font-mono">week {save.arcology.week} · {save.scene.time.replace(/^Week \d+, /, "")}</div>
          </div>
          <div className="ml-auto flex items-center gap-3 font-mono text-[13px]">
            <span style={{ color: save.arcology.cash < 0 ? "var(--danger)" : "var(--text-hi)" }}>
              ¤{Math.round(save.arcology.cash).toLocaleString()}
            </span>
            <span className="dim">rep {Math.round(save.arcology.rep).toLocaleString()}</span>
            <button className={cx("iconbtn md:hidden", group.id === "system" && "acc")} aria-label="Settings" onClick={() => setRoute(group.id === "system" ? "penthouse" : last.system ?? "settings")}>
              <Cog size={17} strokeWidth={1.8} />
            </button>
          </div>
        </div>
        {group.routes.length > 1 ? (
          <div className="segtabs px-4 flex gap-5 overflow-x-auto no-scrollbar" role="tablist">
            {group.routes.map((r) => (
              <button key={r} role="tab" aria-selected={route === r} className={cx("segtab", route === r && "on")} onClick={() => setRoute(r)}>
                {labelOf(r)}
                {(r === "penthouse" && unseen) || (r === "feed" && route !== "feed" && feedUnread(save)) ? <span className="dot" /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <RateNotice />
      <div className="flex-1 flex min-h-0">
        <nav className="rail hidden md:flex flex-col gap-0.5 p-2 w-[172px] shrink-0 overflow-y-auto">
          {[...GROUPS, SYSTEM].map((g) => (
            <div key={g.id} className="mb-2">
              <div className="text-[10px] uppercase tracking-[.12em] dim px-3 pt-1 pb-1">{g.label}</div>
              {g.routes.map((r) => {
                const n = NAV.find((x) => x.id === r)!;
                return (
                  <button key={r} className={cx("railbtn", route === r && "on")} onClick={() => setRoute(r)}>
                    <n.icon size={15} strokeWidth={1.8} />
                    {labelOf(r)}
                    {r === "penthouse" && unseen ? <span className="ml-auto chip on">{unseen}</span> : null}
                  </button>
                );
              })}
            </div>
          ))}
          <button className="railbtn mt-auto" onClick={onSwitch} title="new game, or load another save">new game / saves</button>
        </nav>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className={cx("mx-auto w-full", route === "scene" ? "max-w-3xl h-full" : "max-w-5xl p-4 sm:p-6")}>
            {route === "penthouse" && <Penthouse go={setRoute} />}
            {route === "feed" && <Feed />}
            {route === "people" && <Roster />}
            {route === "story" && <Journal />}
            {route === "scene" && <Scene />}
            {route === "city" && <City />}
            {route === "society" && <Society />}
            {route === "compare" && <Compare />}
            {route === "world" && <World />}
            {route === "genome" && <Genome />}
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

      <nav className="tabbar md:hidden flex shrink-0">
        {GROUPS.map((g) => (
          <button key={g.id} className={cx("tab flex-1 pt-2 pb-1.5 grid place-items-center gap-0.5", group.id === g.id ? "acc" : "dim")} onClick={() => openGroup(g)}>
            <span className="relative">
              <g.icon size={20} strokeWidth={group.id === g.id ? 2.1 : 1.7} />
              {g.id === "home" && unseen ? <span className="badge">{unseen > 9 ? "9+" : unseen}</span> : null}
            </span>
            <span className="text-[10px] font-medium">{g.label}</span>
          </button>
        ))}
      </nav>

      <Ending onNewRun={onSwitch} />
      <FeedTicker />
    </div>
  );
}
