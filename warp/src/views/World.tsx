/**
 * THE WORLD — a globe with your reach on it, the other arcologies and how much they cover, the Old
 * World's regions and their wars, somewhere to go, and research that pays and fixes the planet.
 */
import { useCallback, useMemo, useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Meter, Section, cx } from "../lib/ui";
import { modelsAvailable } from "../config";
import { worldOf, seasonOf } from "../engine/world";
import { WEATHER, REGION_STATE_WORD } from "../data/world";
import {
  areaLabel, canInvolve, canResearch, canVisit, conflicts, energyMix, globeOf, INVOLVE, involve, places, RESEARCH, resolveVisit, startResearch, startVisit, visitCost,
  type Involvement, type Place,
} from "../engine/globe";
import GlobeCanvas from "./GlobeCanvas";

const KIND_WORD: Record<Place["kind"], string> = { yours: "yours", neighbour: "neighbour", freecity: "Free City", region: "Old World" };

function Legend() {
  const dot = (c: string) => <span className="inline-block w-2.5 h-2.5 rounded-full mr-1 align-middle" style={{ background: c }} />;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] dim mt-2 justify-center">
      <span>{dot("var(--accent)")}your reach</span><span>{dot("#8fb2de")}neighbours</span><span>{dot("#b8bec6")}Free Cities</span>
      <span>{dot("#cf5a4e")}war</span><span>{dot("#d59a4e")}unrest</span><span>{dot("#9a7fc4")}plague</span><span>{dot("#7fa87f")}calm</span><span>{dot("#c9a227")}boom</span>
      <span>— trade route · - - disrupted</span>
    </div>
  );
}

function Involve({ regionId }: { regionId: string }) {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(INVOLVE) as Involvement[]).filter((k) => INVOLVE[k].when.includes(worldOf(save).regions[regionId]?.state)).map((k) => {
          const why = canInvolve(save, regionId, k);
          return <Button key={k} size="sm" kind="ghost" disabled={!!why} title={`${INVOLVE[k].note}${why ? ` (${why})` : ""}`} onClick={() => { let t = ""; mutate((s) => { t = involve(s, regionId, k); }); setSaid(t); }}>{INVOLVE[k].label}{why ? <span className="dim"> · {why}</span> : null}</Button>;
        })}
      </div>
      {said ? <p className="font-prose text-[13.5px] mt-2">{said}</p> : null}
    </div>
  );
}

function Selected({ p }: { p: Place }) {
  const { save, mutate } = useGame();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const why = canVisit(save, p);
  const hot = p.kind === "region" && p.state && p.state !== "calm" && p.state !== "boom";
  const go = async () => {
    setBusy(true); setErr("");
    // The visit is written against a copy, then committed, so a slow narrator can't race a week ending.
    const copy = structuredClone(save);
    const res = await startVisit(copy, places(copy).find((x) => x.id === p.id)!, modelsAvailable() ? save.models.narrator_model : undefined, save.models.fallback_model);
    if (res) setErr(res);
    else mutate((s) => { s.arcology.cash = copy.arcology.cash; s.globe = copy.globe; });
    setBusy(false);
  };
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <div className={cx("text-[15px]", p.kind === "yours" && "acc")}>{p.name}</div>
        <div className="text-[11px] dim">{KIND_WORD[p.kind]}{p.km ? ` · ${p.km.toLocaleString()} km away` : ""}</div>
      </div>
      <div className="text-[11.5px] dim mb-1.5">Covers {areaLabel(p.radiusKm)}</div>
      {p.lines.filter(Boolean).map((l, i) => <p key={i} className="text-[12.5px] leading-snug mb-1">{l}</p>)}
      {p.kind === "neighbour" ? <div className="mt-1.5 mb-2"><Meter value={p.owned ?? 0} label="your share of it" /></div> : null}
      {hot ? <div className="mt-2"><div className="text-[10.5px] uppercase tracking-wider dim mb-1">Get involved</div><Involve regionId={p.id.replace("region:", "")} /></div> : null}
      {p.kind !== "yours" ? (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Button size="sm" kind="primary" disabled={!!why || busy} onClick={() => void go()} title={modelsAvailable() ? "The narrator writes what happens there" : "Something happens there"}>{busy ? "travelling…" : `Visit · ¤${visitCost(save, p).toLocaleString()}`}</Button>
          {why && !busy ? <span className="text-[11px] dim">{why}</span> : null}
          {err ? <span className="text-[11px] warn">{err}</span> : null}
        </div>
      ) : null}
    </Card>
  );
}

function VisitCard() {
  const { save, mutate } = useGame();
  const v = globeOf(save).visit;
  if (!v || v.week < save.arcology.week - 1) return null;
  const p = places(save).find((x) => x.id === v.place);
  return (
    <Card className="ring-1 ring-[var(--accent)]">
      <div className="text-[10.5px] uppercase tracking-wider acc mb-1">In {p?.name ?? "transit"} · week {v.week}{v.by === "narrator" ? " · written by the narrator" : ""}</div>
      <p className="font-prose text-[14.5px] leading-relaxed mb-2.5">{v.scene}</p>
      {v.result ? <p className="font-prose text-[14px] leading-relaxed whitespace-pre-line">{v.result}</p> : (
        <div className="flex flex-col gap-1.5">
          {v.options.map((o) => <button key={o.id} className="actbtn text-left" onClick={() => mutate((s) => { resolveVisit(s, o.id); })}><span className="text-[13px]">{o.label}</span></button>)}
        </div>
      )}
    </Card>
  );
}

function OldWorld() {
  const { save } = useGame();
  const w = worldOf(save);
  const mix = energyMix(save);
  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="text-[10.5px] uppercase tracking-wider dim mb-1">The economy</div>
          <div className="text-[14px]">{w.economy.phase} <span className="dim text-[12px]">· index {Math.round(w.economy.index)}</span></div>
          <div className="text-[11.5px] dim mt-1">{WEATHER[w.weather.kind]?.line} It's {seasonOf(save.arcology.week)}.</div>
        </div>
        <div className="space-y-2">
          <Meter value={w.strain} invert label="climate strain" />
          <Meter value={w.pollution} invert label="your pollution" />
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-wider dim mb-1">Your energy</div>
          <div className="flex h-2.5 rounded-full overflow-hidden" style={{ background: "var(--line-strong)" }}>
            <div style={{ width: `${mix.fossil}%`, background: "#6b5a48" }} title={`fossil ${mix.fossil}%`} />
            <div style={{ width: `${mix.solar}%`, background: "var(--accent)" }} title={`solar ${mix.solar}%`} />
            <div style={{ width: `${mix.fusion}%`, background: "#6aa8a0" }} title={`fusion ${mix.fusion}%`} />
          </div>
          <div className="text-[11px] dim mt-1">fossil {mix.fossil}% · solar {mix.solar}% · fusion {mix.fusion}%</div>
        </div>
      </div>
      {w.headlines.length ? <div className="text-[10.5px] uppercase tracking-wider dim mt-3 mb-1">On the wire</div> : null}
      <ul className="text-[12px] leading-snug list-disc pl-4">{w.headlines.slice(-6).reverse().map((h, i) => <li key={i} className={h.tone === "bad" ? "warn" : undefined}>{h.text} <span className="dim">· week {h.week}</span></li>)}</ul>
    </Card>
  );
}

function ResearchGrid() {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState("");
  const t = globeOf(save).tech;
  const KINDS: [string, string][] = [["energy", "Energy"], ["climate", "The climate"], ["world", "The world"], ["arcology", "The arcology"]];
  return (
    <>
      {said ? <Card className="mb-2.5"><p className="font-prose text-[14px]">{said}</p></Card> : null}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {KINDS.map(([k, label]) => (
          <div key={k}>
            <div className="text-[10.5px] uppercase tracking-wider dim mb-1">{label}</div>
            <div className="space-y-2">
              {RESEARCH.filter((r) => r.kind === k).map((r) => {
                const st = t[r.id];
                const why = canResearch(save, r.id);
                return (
                  <Card key={r.id} className={cx(!!st?.done && "ring-1 ring-[var(--good)]")}>
                    <div className="flex items-baseline justify-between gap-2"><span className="text-[13px]">{r.name}</span><span className="text-[11px] dim shrink-0">{st?.done ? `done wk ${st.done}` : st?.left ? `${st.left} wk left` : `${r.weeks} wk`}</span></div>
                    <p className="text-[11.5px] dim leading-snug my-1">{r.note}</p>
                    {st?.left ? <Meter value={r.weeks - st.left} range={[0, r.weeks]} showValue={false} /> : !st?.done ? (
                      <Button size="sm" kind="ghost" disabled={!!why} onClick={() => { let x = ""; mutate((s) => { x = startResearch(s, r.id); }); setSaid(x); }}>¤{r.cost.toLocaleString()}{why && why !== `needs ¤${r.cost.toLocaleString()}` ? <span className="dim"> · {why}</span> : null}</Button>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function World() {
  const { save } = useGame();
  const ps = useMemo(() => places(save), [save]);
  const [sel, setSel] = useState("yours");
  const p = ps.find((x) => x.id === sel) ?? ps[0];
  const onSelect = useCallback((id: string) => setSel(id), []);
  const wars = conflicts(save);
  const home = ps.find((x) => x.kind === "yours")!;
  return (
    <>
      <Section title="The world">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
          <div>
            <GlobeCanvas places={ps} selected={sel} onSelect={onSelect} focus={p.at} />
            <Legend />
          </div>
          <div className="space-y-2.5">
            <VisitCard />
            <Selected key={p.id} p={p} />
            <Card>
              <div className="text-[10.5px] uppercase tracking-wider dim mb-1">Places</div>
              <div className="flex flex-wrap gap-1.5">
                {ps.map((x) => <button key={x.id} className={cx("chip !text-[11px]", x.id === sel && "on")} onClick={() => setSel(x.id)}>{x.name}{x.kind === "region" && x.state && x.state !== "calm" ? ` · ${x.state}` : ""}</button>)}
              </div>
            </Card>
          </div>
        </div>
      </Section>

      <Section title="Wars and crises">
        {wars.length ? (
          <div className="grid gap-2.5 md:grid-cols-2">
            {wars.map((c) => (
              <Card key={c.id}>
                <div className="flex items-baseline justify-between mb-1">
                  <button className="text-[14px] underline decoration-dotted" onClick={() => setSel(`region:${c.id}`)}>{c.name}</button>
                  <span className={cx("text-[11.5px]", c.state === "war" || c.state === "collapse" ? "warn" : "dim")}>{REGION_STATE_WORD[c.state]} since week {c.since} · stability {Math.round(c.stability)}</span>
                </div>
                <Involve regionId={c.id} />
              </Card>
            ))}
          </div>
        ) : <Card><p className="text-[12.5px] dim">Nowhere is at war this week. The regions are calm, for now.</p></Card>}
      </Section>

      <Section title="The Old World, and the climate">
        <OldWorld />
      </Section>

      <Section title="Research">
        <p className="text-[12.5px] dim mb-2.5">Paid up front; each runs for some weeks and then works every week after. Some fix what the world is doing to itself. {home.name} reaches {areaLabel(home.radiusKm)}.</p>
        <ResearchGrid />
      </Section>
    </>
  );
}
