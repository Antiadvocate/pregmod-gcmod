/**
 * Public works, on the Arcology screen: every problem with a way to spend on it. Infrastructure is
 * built a level at a time and works every week; emergency spending takes any amount and fixes as
 * much of the problem as that buys, now.
 */
import { useEffect, useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Section, cx } from "../lib/ui";
import { worldOf } from "../engine/world";
import { cityYield } from "../engine/city";
import { foodEats } from "../engine/menials";
import { build, emergency, emergencyPreview, EMERGENCIES, foodCap, levelOf, nextCost, WORKS } from "../engine/works";

/** Where each problem stands right now, so the cards say what they are fixing. */
function readings(save: ReturnType<typeof useGame>["save"]): Record<string, string> {
  const a = save.arcology;
  const w = worldOf(save);
  return {
    food: `stores ${Math.round(a.food.stores).toLocaleString()} of ${foodCap(save).toLocaleString()}; the city eats ${foodEats(save).toLocaleString()}/wk`,
    "food stores": `the stores hold ${foodCap(save).toLocaleString()}`,
    "food, at scale": `the city eats ${foodEats(save).toLocaleString()}/wk`,
    pollution: `pollution ${Math.round(w.pollution)}`,
    "pollution at the source": `pollution ${Math.round(w.pollution)}`,
    crime: `crime ${Math.round(a.crime)}, security ${Math.round(a.security)}`,
    housing: `${a.population.toLocaleString()} people, room for ${Math.round(400 + cityYield(save).housing).toLocaleString()}`,
    prosperity: `prosperity ${Math.round(a.prosperity)}`,
    "what citizens think of you": `standing ${a.public_standing >= 0 ? "+" : ""}${a.public_standing.toFixed(1)}`,
    "your slaves' health": "",
    "exhaustion and household unrest": "",
    "the world's climate": `climate strain ${Math.round(w.strain)}`,
  };
}

const GROUPS: [string, string][] = [["all", "Everything"], ["food", "Food"], ["air", "Pollution & climate"], ["order", "Crime & housing"], ["city", "Prosperity & standing"], ["household", "Your household"]];
const GROUP_OF: Record<string, string> = {
  hydroponics: "food", autofarm: "food", granary: "food", "e:food": "food",
  scrubbers: "air", clean_industry: "air", climate_fund: "air", "e:cleanup": "air", "e:offsets": "air",
  police: "order", housing: "order", "e:surge": "order",
  amenities: "city", civic_media: "city", "e:handouts": "city", "e:stimulus": "city",
  hospital: "household", comforts: "household",
};

export default function PublicWorks() {
  const { save, mutate } = useGame();
  const [group, setGroup] = useState(() => { try { return localStorage.getItem("warp:works-group") ?? "all"; } catch { return "all"; } });
  useEffect(() => { try { localStorage.setItem("warp:works-group", group); } catch { /* fine */ } }, [group]);
  const [said, setSaid] = useState("");
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const r = readings(save);
  const cash = Math.max(0, Math.floor(save.arcology.cash));
  const say = (fn: (s: typeof save) => string) => { let t = ""; mutate((s) => { t = fn(s); }); if (t) setSaid(t); };

  return (
    <Section title="Public works" right={<span className="text-[11px] dim">every problem has a price</span>}>
      {said ? <Card className="mb-2.5"><p className="font-prose text-[14px]">{said}</p></Card> : null}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-2.5">
        {GROUPS.map(([id, label]) => <button key={id} className={cx("chip shrink-0 !text-[11.5px]", group === id && "on")} onClick={() => setGroup(id)}>{label}</button>)}
      </div>
      <div className="text-[10.5px] uppercase tracking-wider dim mb-1.5">Build: works every week, a level at a time</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-4">
        {WORKS.filter((w) => group === "all" || GROUP_OF[w.id] === group).map((w) => {
          const l = levelOf(save, w.id);
          const cost = nextCost(save, w.id);
          return (
            <Card key={w.id} className={cx(l > 0 && "ring-1 ring-[var(--accent-soft)]")}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13.5px]">{w.name}</span>
                <span className={cx("text-[11px] shrink-0", l ? "acc" : "dim")}>{l ? `level ${l}` : "not built"}</span>
              </div>
              <div className="text-[11.5px] dim mt-0.5">Fixes {w.fixes}{r[w.fixes] ? ` · ${r[w.fixes]}` : ""}</div>
              <div className="text-[12px] mt-1 mb-2">Each level: {w.each}. Upkeep ¤{w.upkeep}/wk a level{l ? ` (¤${(w.upkeep * l).toLocaleString()}/wk now)` : ""}.</div>
              <Button size="sm" kind={l ? "ghost" : "primary"} disabled={save.arcology.cash < cost} onClick={() => say((s) => build(s, w.id))}>Build level {l + 1} · ¤{cost.toLocaleString()}</Button>
            </Card>
          );
        })}
      </div>

      <div className="text-[10.5px] uppercase tracking-wider dim mb-1.5">Emergency: spend any amount on it now</div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {EMERGENCIES.filter((e) => group === "all" || GROUP_OF[`e:${e.id}`] === group).map((e) => {
          const room = e.room(save);
          const amount = amounts[e.id] ?? Math.min(cash, room * e.per, Math.max(e.per * 2, 10000));
          const pv = emergencyPreview(save, e.id, amount);
          const set = (n: number) => setAmounts((m) => ({ ...m, [e.id]: Math.max(0, Math.floor(n)) }));
          return (
            <Card key={e.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13.5px]">{e.name}</span>
                <span className="text-[11px] dim shrink-0">¤{e.per.toLocaleString()} per {e.unit === "food" ? "unit" : "point"}</span>
              </div>
              <div className="text-[11.5px] dim mt-0.5 mb-1.5">Fixes {e.fixes}{r[e.fixes] ? ` · ${r[e.fixes]}` : ""}{room ? ` · room for ${room.toLocaleString()}` : " · nothing to fix"}</div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[12px]">¤</span>
                <input type="number" min={0} step={e.per} value={amount} onChange={(ev) => set(Number(ev.target.value) || 0)} className="flex-1 min-w-0" />
                <button className="chip !text-[11px]" onClick={() => set(Math.min(cash, room * e.per))}>fix it all</button>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" kind="ghost" disabled={!pv.units || pv.cost > cash} onClick={() => say((s) => emergency(s, e.id, amount))}>{pv.units ? `${e.unit === "food" ? "+" : e.id === "handouts" || e.id === "stimulus" ? "+" : "−"}${pv.units.toLocaleString()} ${e.unit} · ¤${pv.cost.toLocaleString()}` : "nothing to buy"}</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
