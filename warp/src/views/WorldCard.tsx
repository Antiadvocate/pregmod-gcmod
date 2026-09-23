/** THE WORLD, on the Penthouse: this week's weather and what's forecast, the economy, the climate,
 *  the regions your docks trade with, the news, and everything coming up in the weeks ahead. */
import { useGame } from "../lib/game";
import { Card, cx } from "../lib/ui";
import { worldOf, comingUp, seasonOf } from "../engine/world";
import { WEATHER, REGION_STATE_WORD } from "../data/world";
import { REGION_BY_ID } from "../data/districts";

const toneColor = (t: string) => (t === "bad" ? "var(--danger)" : t === "warning" ? "var(--warn)" : t === "good" ? "var(--good)" : undefined);

function Meter({ label, value, bad }: { label: string; value: number; bad?: boolean }) {
  return (
    <div className="flex-1 min-w-[110px]">
      <div className="text-[10.5px] uppercase tracking-wider dim mb-1">{label} <span className="font-mono">{Math.round(value)}</span></div>
      <div className="h-1.5 rounded-full" style={{ background: "var(--line, rgba(255,255,255,0.08))" }}>
        <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(2, value))}%`, background: bad && value > 50 ? "var(--danger)" : value > 35 ? "var(--warn)" : "var(--accent)" }} />
      </div>
    </div>
  );
}

export default function WorldCard() {
  const { save } = useGame();
  const w = worldOf(save);
  const week = save.arcology.week;
  const upcoming = comingUp(save).slice(0, 8);
  const news = w.headlines.slice(-5).reverse();
  const econ = w.economy;

  return (
    <Card className="mb-6">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider dim">The world · {seasonOf(week)}</div>
        <div className="text-[11px] dim">economy: <span style={{ color: econ.phase === "boom" ? "var(--good)" : econ.phase === "crash" ? "var(--danger)" : econ.phase === "slump" ? "var(--warn)" : undefined }}>{econ.phase}</span> <span className="font-mono">{Math.round(econ.index)}</span></div>
      </div>
      <p className="font-prose text-[14.5px] leading-snug mb-3">{WEATHER[w.weather.kind].line}</p>

      <div className="flex flex-wrap gap-3 mb-3">
        <Meter label="climate strain" value={w.strain} bad />
        <Meter label="your pollution" value={w.pollution} bad />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {Object.entries(w.regions).map(([id, r]) => (
          <span key={id} className={cx("chip", ["war", "collapse", "plague"].includes(r.state) ? "bad" : r.state === "boom" ? "good" : "")}>
            {REGION_BY_ID[id]?.name ?? id}: {REGION_STATE_WORD[r.state]}
          </span>
        ))}
      </div>

      {upcoming.length ? (
        <>
          <div className="text-[10.5px] uppercase tracking-wider dim mb-1">Coming up</div>
          <ul className="space-y-1 mb-3">
            {upcoming.map((u, i) => (
              <li key={i} className="text-[12.5px] flex gap-2">
                <span className="font-mono dim shrink-0 w-14">{u.weeks === 0 ? "now" : u.weeks === 1 ? "next wk" : `in ${u.weeks} wk`}</span>
                <span style={{ color: toneColor(u.tone) }}>{u.text}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {news.length ? (
        <>
          <div className="text-[10.5px] uppercase tracking-wider dim mb-1">News</div>
          <ul className="space-y-1">
            {news.map((h, i) => (
              <li key={i} className="text-[12.5px] flex gap-2">
                <span className="font-mono dim shrink-0 w-14">wk {h.week}</span>
                <span style={{ color: toneColor(h.tone) }}>{h.text}</span>
              </li>
            ))}
          </ul>
        </>
      ) : <div className="text-[12px] dim">News will come in as the weeks go by.</div>}
    </Card>
  );
}
