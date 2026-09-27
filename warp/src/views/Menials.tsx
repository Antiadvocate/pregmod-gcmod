/**
 * Menial slaves, on the People screen above your named household: how many you own, what they're
 * doing, how they're kept, and the slaves your citizens own. Bought and sold in bulk.
 */
import { useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Section, Stat, cx } from "../lib/ui";
import {
  assigned, buyMenials, cityDemand, households, idle, JOB_IDS, JOBS, menialPrice, menialsOf, perHousehold, sellMenials, servingCitizens, setJob, slavePopulation, TREATMENT, wantPerHousehold,
  type MenialJob, type Treatment,
} from "../engine/menials";

export default function MenialsPanel() {
  const { save, mutate } = useGame();
  const [n, setN] = useState(100);
  const [said, setSaid] = useState("");
  const m = menialsOf(save);
  const price = menialPrice(save);
  const say = (fn: (s: typeof save) => string) => { let t = ""; mutate((s) => { t = fn(s); }); if (t) setSaid(t); };
  const job = (j: MenialJob, v: number) => mutate((s) => setJob(s, j, v));
  const free = idle(m);
  const named = Object.values(save.people).filter((p) => p.status === "owned" || p.status === "indentured").length;

  return (
    <Section title="Menial slaves" right={<span className="text-[11px] dim">{slavePopulation(save).toLocaleString()} slaves in the arcology</span>}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
        <Stat label="your menials" value={m.owned.toLocaleString()} sub={`${free.toLocaleString()} idle`} />
        <Stat label="your household" value={named} sub="named, below" />
        <Stat label="citizens' slaves" value={m.city.toLocaleString()} sub={`they want ${cityDemand(save).toLocaleString()}`} />
        <Stat label="per household" value={perHousehold(save).toFixed(1)} sub={`${households(save).toLocaleString()} households want ${wantPerHousehold(save).toFixed(1)}`} />
      </div>
      {said ? <Card className="mb-2.5"><p className="font-prose text-[14px]">{said}</p></Card> : null}
      <div className="grid gap-2.5 md:grid-cols-2">
        <Card>
          <div className="text-[11px] uppercase tracking-wider dim mb-1">Buy and sell</div>
          <div className="text-[11.5px] dim mb-2">¤{price.toLocaleString()} each this week; wars abroad make them cheaper. Idle menials sell to citizen households at full price while they want more, and back to the trade at 70% after that.</div>
          <div className="flex items-center gap-1.5 mb-2">
            <input type="number" min={1} step={10} value={n} onChange={(e) => setN(Math.max(0, Math.floor(Number(e.target.value) || 0)))} className="w-28" />
            {[10, 100, 1000].map((k) => <button key={k} className="chip !text-[11px]" onClick={() => setN(k)}>{k.toLocaleString()}</button>)}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" kind="primary" disabled={!n || save.arcology.cash < n * price} onClick={() => say((s) => buyMenials(s, n))}>Buy {n.toLocaleString()} · ¤{(n * price).toLocaleString()}</Button>
            <Button size="sm" kind="ghost" disabled={!free} onClick={() => say((s) => sellMenials(s, n))}>Sell {Math.min(n, free).toLocaleString()} idle</Button>
          </div>
          <div className="text-[11px] uppercase tracking-wider dim mt-3 mb-1">How they're kept</div>
          <div className="flex flex-wrap gap-1.5 mb-1">
            {(Object.keys(TREATMENT) as Treatment[]).map((t) => <button key={t} className={cx("chip !text-[11.5px]", m.treatment === t && "on")} onClick={() => mutate((s) => { menialsOf(s).treatment = t; })}>{TREATMENT[t].name} · ¤{TREATMENT[t].upkeep}/wk</button>)}
          </div>
          <div className="text-[11.5px] dim">{TREATMENT[m.treatment].note}. They eat 2 food a week each.</div>
          {m.last && m.last.week >= save.arcology.week - 1 ? <div className="text-[11.5px] mt-2">Last week: {m.last.cash >= 0 ? "+" : "−"}¤{Math.abs(m.last.cash).toLocaleString()} net{m.last.food ? `, ${m.last.food.toLocaleString()} food grown` : ""}{m.last.lost ? `, ${m.last.lost} lost` : ""}.</div> : null}
        </Card>
        <Card>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider dim">Their work</span>
            <span className="text-[11px] dim">{assigned(m).toLocaleString()} of {m.owned.toLocaleString()} assigned</span>
          </div>
          <div className="space-y-1.5">
            {JOB_IDS.map((j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px]">{JOBS[j].name}</div>
                  <div className="text-[10.5px] dim truncate" title={JOBS[j].each}>{JOBS[j].each}</div>
                </div>
                <input type="number" min={0} value={m.jobs[j]} onChange={(e) => job(j, Number(e.target.value) || 0)} className="!w-20" aria-label={JOBS[j].name} />
                <button className="chip !text-[10.5px]" disabled={!free} onClick={() => job(j, m.jobs[j] + free)} title="put every idle menial here">+all</button>
              </div>
            ))}
          </div>
          <div className="text-[11px] dim mt-2">{servingCitizens(save).toLocaleString()} slaves serve citizen households: theirs and yours on lease.</div>
        </Card>
      </div>
    </Section>
  );
}
