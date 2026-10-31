/**
 * THE PEOPLE, ON THE CITY SCREEN.
 *
 * Who lives here, by class: how many, what one of them earns and keeps, what you take, and how
 * many of them are poor. What businesses make and what you take from them. Who moved in last week
 * and who left, and why. The border, and the patrols on it. Every number here is a lever, and the
 * engine behind it is engine/citizens.
 */
import { useGame } from "../lib/game";
import { Card, Chip } from "../lib/ui";
import { KLASSES, MAX_TAX, PATROL_COST, WAGE, business, citizensOf, industry, poverty, takeHome, type Border, type Klass } from "../engine/citizens";
import { cityYield } from "../engine/city";

const NAME: Record<Klass, string> = { poor: "The poor", middle: "The middle", rich: "The rich" };
const COMES: Record<Klass, string> = {
  poor: "come for work at the works, docks, dairy and plant, and anywhere to sleep",
  middle: "come for flats, shops, schools, restaurants and the clinic",
  rich: "come for the exchange, shops, university and gardens, and leave over crime",
};

export default function People() {
  const { save, mutate } = useGame();
  const c = citizensOf(save);
  const pop = c.poor + c.middle + c.rich;
  const poor = poverty(save);
  const biz = business(save);
  const ind = industry(save);
  const room = Math.max(0, Math.round(400 + cityYield(save).housing - pop));
  const set = (k: Klass | "business", v: number) => mutate((s) => { citizensOf(s).tax[k] = Math.round(v) / 100; });
  const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;
  const last = c.last;
  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <div className="text-[15px]">{pop.toLocaleString()} people</div>
          <div className="text-[12px] dim">{room.toLocaleString()} homes free</div>
          <div className={pop && poor / pop > 0.35 ? "text-[12px] bad" : "text-[12px] dim"}>{poor.toLocaleString()} in poverty{pop ? ` (${Math.round((poor / pop) * 100)}%)` : ""}</div>
        </div>
        <div className="space-y-3">
          {KLASSES.map((k) => (
            <div key={k}>
              <div className="flex items-baseline gap-2 flex-wrap text-[13px]">
                <span className="font-medium">{NAME[k]}</span>
                <span className="dim">{c[k].toLocaleString()}</span>
                <span className="dim text-[11.5px]">each earns {money(WAGE[k] * Math.max(0.2, save.arcology.prosperity / 100))} a week, keeps {money(takeHome(save, k))}</span>
                <span className="ml-auto text-[12px]">you take {money(c[k] * WAGE[k] * Math.max(0.2, save.arcology.prosperity / 100) * c.tax[k])}/wk</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input type="range" className="flex-1" min={0} max={MAX_TAX * 100} value={Math.round(c.tax[k] * 100)} onChange={(e) => set(k, Number(e.target.value))} aria-label={`tax on ${k}`} />
                <span className="w-10 text-right text-[12px] font-mono">{Math.round(c.tax[k] * 100)}%</span>
              </div>
              <div className="text-[11px] dim">They {COMES[k]}.</div>
            </div>
          ))}
          <div>
            <div className="flex items-baseline gap-2 flex-wrap text-[13px]">
              <span className="font-medium">Businesses</span>
              <span className="dim text-[11.5px]">make {money(biz.profit)} a week from what people spend, keep {money(biz.after)}: {biz.mood}</span>
              <span className="ml-auto text-[12px]">you take {money(biz.profit - biz.after)}/wk</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input type="range" className="flex-1" min={0} max={MAX_TAX * 100} value={Math.round(c.tax.business * 100)} onChange={(e) => set("business", Number(e.target.value))} aria-label="business tax" />
              <span className="w-10 text-right text-[12px] font-mono">{Math.round(c.tax.business * 100)}%</span>
            </div>
            <div className="text-[11px] dim">Over 15% and shops start closing and the city gets poorer; under 5% and it booms.</div>
          </div>
          <div className="text-[12px] mid">Industry: {ind.line}</div>
        </div>
      </Card>

      <Card>
        <div className="text-[13px] font-medium mb-1">The border</div>
        <div className="flex gap-1.5 flex-wrap">
          {(["open", "checked", "closed"] as Border[]).map((b) => (
            <Chip key={b} on={c.border === b} onClick={() => mutate((s) => { citizensOf(s).border = b; })}>{b}</Chip>
          ))}
        </div>
        <div className="text-[11.5px] dim mt-1.5">
          {c.border === "open" ? "Anyone can walk in. More people come, and trouble comes with them." : c.border === "checked" ? "Papers checked at the gate. People come at the usual rate, and some trouble still slips through." : "Shut. Almost nobody gets in, and those who do are mostly rich enough to buy their way. The city stops growing and gets a little poorer."}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[12.5px]">
          <span>Patrols</span>
          {[0, 1, 2, 3].map((n) => <Chip key={n} on={c.patrols === n} onClick={() => mutate((s) => { citizensOf(s).patrols = n; })}>{n}</Chip>)}
          <span className="dim text-[11.5px]">¤{(c.patrols * PATROL_COST).toLocaleString()} a week. Each one cuts what slips through by a third.</span>
        </div>
      </Card>

      <Card>
        <div className="text-[13px] font-medium mb-1">Last week</div>
        {last ? (
          <>
            <div className="text-[12.5px]">
              Moved in: {last.arrived.poor} poor, {last.arrived.middle} middle, {last.arrived.rich} rich. Left: {last.left.poor} poor, {last.left.middle} middle, {last.left.rich} rich.{last.turnedAway ? ` Turned away at the border: ${last.turnedAway.toLocaleString()}.` : ""}
            </div>
            <div className="text-[12.5px] mt-1">Taxes brought in {money(last.revenue.poor + last.revenue.middle + last.revenue.rich + last.revenue.business)}: {money(last.revenue.poor)} from the poor, {money(last.revenue.middle)} from the middle, {money(last.revenue.rich)} from the rich, {money(last.revenue.business)} from businesses.</div>
            {last.reasons.length ? <ul className="text-[12px] mid mt-1 space-y-0.5">{last.reasons.map((r, i) => <li key={i}>· {r}</li>)}</ul> : null}
          </>
        ) : <div className="text-[12px] dim">Nothing yet. After the first week this says who moved in, who left, and why.</div>}
      </Card>
    </div>
  );
}
