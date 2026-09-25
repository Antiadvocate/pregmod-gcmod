/** THE CORPORATION — found it, grow it, take what it pays. */
import { useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Section, Stat } from "../lib/ui";
import { buyShares, canExpand, corpValue, DIVISIONS, drawSlave, expand, foundCorp, FOUNDING, invest, sellShares, type Division } from "../engine/corp";

const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;

function Spark({ pts }: { pts: number[] }) {
  if (pts.length < 2) return null;
  const lo = Math.min(...pts), hi = Math.max(...pts), span = hi - lo || 1;
  const d = pts.map((v, i) => `${(i / (pts.length - 1)) * 200},${38 - ((v - lo) / span) * 34}`).join(" ");
  return <svg viewBox="0 0 200 40" className="w-full h-10" aria-label="company value over time"><polyline points={d} fill="none" stroke="var(--accent)" strokeWidth="1.5" /></svg>;
}

export default function Corporation() {
  const { save, mutate } = useGame();
  const c = save.corp;
  const [name, setName] = useState(`${save.arcology.name} Holdings`);
  const [put, setPut] = useState(10000);
  const [note, setNote] = useState("");

  if (!c) {
    return (
      <Section title="Corporation">
        <Card>
          <p className="font-prose text-[14.5px] leading-relaxed mb-3">Found a company that trades in slaves at scale: acquisition, training, surgery, arcades, dairies and export. You hold the shares and take a dividend; sell shares when you need cash, and the other shareholders get a say.</p>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mb-2" />
          <Button kind="primary" disabled={save.arcology.cash < FOUNDING} onClick={() => mutate((s) => { foundCorp(s, name); })}>Found it · {money(FOUNDING)}</Button>
        </Card>
      </Section>
    );
  }
  const v = corpValue(save);
  return (
    <Section title={c.name} right={<span className="text-[11px] dim">founded week {c.founded}</span>}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Stat label="treasury" value={money(c.cash)} />
        <Stat label="value" value={money(v)} />
        <Stat label="your stake" value={`${Math.round(c.yours)}%`} />
        <Stat label="last week's profit" value={c.last ? money(c.last.profit) : "—"} />
      </div>
      {c.last ? <div className="text-[12px] mid mb-2">Revenue {money(c.last.revenue)}, costs {money(c.last.costs)}, paid out {money(c.last.paid)}. {c.last.mood[0].toUpperCase() + c.last.mood.slice(1)}.</div> : null}
      <Spark pts={c.history.map((h) => h.value)} />
      <Card className="mt-3">
        <div className="text-[12.5px] mb-1">Dividend: {Math.round(c.dividend * 100)}% of profit</div>
        <input type="range" min={0} max={80} step={5} value={Math.round(c.dividend * 100)} onChange={(e) => mutate((s) => { s.corp!.dividend = Number(e.target.value) / 100; })} className="w-full" />
        <div className="text-[11px] dim">Paid out is yours in proportion to your stake. What isn't paid out stays in the treasury to build with.</div>
      </Card>
      <div className="grid gap-2 sm:grid-cols-2 mt-3">
        {(Object.keys(DIVISIONS) as Division[]).map((d) => {
          const def = DIVISIONS[d];
          const L = c.divisions[d] ?? 0;
          const why = canExpand(save, d);
          return (
            <Card key={d} className="py-3">
              <div className="flex items-baseline gap-2"><span className="text-[13.5px]">{def.name}</span><span className="text-[11px] dim">level {L}/5</span></div>
              <div className="font-prose text-[12.5px] dim">{def.note}</div>
              <div className="text-[11px] dim mt-1">about {money(def.revenue)} a week per level, {money(def.cost)} to run</div>
              {why ? <div className="text-[11px] dim mt-2">{why}</div> : <Button size="sm" className="mt-2" onClick={() => mutate((s) => { expand(s, d); })}>{L ? "expand" : "build"} · {money(def.build * (L + 1))}</Button>}
            </Card>
          );
        })}
      </div>
      <Card className="mt-3">
        <div className="text-[12.5px] mb-2">Your shares</div>
        <div className="flex flex-wrap gap-2 items-center">
          <input type="number" className="w-28" value={put} onChange={(e) => setPut(Math.max(0, Number(e.target.value)))} />
          <Button size="sm" disabled={save.arcology.cash < put || put <= 0} onClick={() => mutate((s) => { invest(s, put); })}>Put it into the treasury</Button>
          <Button size="sm" disabled={c.yours < 10} onClick={() => { let got = 0; mutate((s) => { got = sellShares(s); }); setNote(got ? `You sold ten points for ${money(got)}.` : ""); }}>Sell 10% · ~{money(v * 0.095)}</Button>
          <Button size="sm" disabled={c.yours > 90 || save.arcology.cash < v * 0.11} onClick={() => { let cost = 0; mutate((s) => { cost = buyShares(s); }); setNote(cost ? `You bought ten points back for ${money(cost)}.` : ""); }}>Buy 10% · ~{money(v * 0.11)}</Button>
          <Button size="sm" disabled={!c.divisions.capture || c.cash < 4000} onClick={() => { let id: string | null = null; mutate((s) => { id = drawSlave(s); }); const who = id ? save.people[id as string] : undefined; setNote(who ? `${who.name} is brought up from the ${c.divisions.training ? "training pens" : "acquisition stock"}. She's yours now.` : ""); }}>Take a slave from the pipeline · ¤4,000</Button>
        </div>
        {c.yours < 50 ? <div className="text-[11.5px] mt-2" style={{ color: "var(--warn)" }}>You hold less than half. The other shareholders can outvote you.</div> : null}
        {note ? <div className="text-[12px] mid mt-2">{note}</div> : null}
      </Card>
    </Section>
  );
}
