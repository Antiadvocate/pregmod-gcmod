/**
 * THE CITY SCREEN.
 *
 * Two jobs, in this order: show the player the place, then let them change it.
 *
 * The skyline is not decoration and is not a header image — it is the primary control. Tapping a
 * block selects it, and everything you can do to that block appears in a sheet that slides up from
 * the bottom of the phone. That is the whole reason this screen exists in this shape: the rest of
 * the app is a stack of cards you scroll past, and the complaint was that the stack never ends. A
 * map you touch has no stack.
 *
 * The four verbs live in one segmented control rather than four screens, because on a 390pt phone
 * a fifth destination in the tab bar costs more than it buys.
 */
import { useMemo, useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Money, Sheet } from "../lib/ui";
import {
  cityOf, cityYield, cityProblems, costToRaise, canRaise, raise, refurbish,
  openRoute, militaryStrength, annexCost, annex, buildDiscount, type District,
} from "../engine/city";
import { DISTRICTS, DISTRICT_BY_KIND, REGIONS, RINGS, type DistrictKind } from "../data/districts";
import { Skyline } from "./Skyline";

type Tab = "build" | "trade" | "neighbours";

export default function City() {
  const { save, mutate } = useGame();
  const [tab, setTab] = useState<Tab>("build");
  const [picked, setPicked] = useState<string | null>(null);
  const [note, setNote] = useState<{ text: string; bad?: boolean } | null>(null);

  const city = cityOf(save);
  const y = useMemo(() => cityYield(save), [save, save.arcology.week, city.districts.length]);
  const problems = cityProblems(save);
  const plot = picked ? city.districts.find((d) => d.id === picked) : undefined;

  const say = (r: { ok: boolean; why?: string; line?: string }) =>
    setNote(r.ok ? { text: r.line ?? "Done." } : { text: r.why ?? "No.", bad: true });

  return (
    <>
      {/* THE PLACE. Sticky on a phone so it stays as an anchor while the list below scrolls. */}
      <div className="sticky top-0 z-10 -mx-4 sm:mx-0 mb-3 sm:mb-4 sm:rounded-xl overflow-hidden"
        style={{ background: "var(--bg)" }}>
        <Skyline onPick={(id) => { setPicked(id); setNote(null); }} selected={picked} />
      </div>

      {/* The city in one line each. Six numbers, and every one of them is a lever. */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-4">
        <Fig label="income" value={`¤${Math.round(y.cash).toLocaleString()}`} sub="per week" />
        <Fig label="housing" value={Math.round(400 + y.housing).toLocaleString()}
          sub={`${Math.round(save.arcology.population).toLocaleString()} living here`}
          bad={save.arcology.population > 400 + y.housing} />
        <Fig label="reach" value={Math.floor(y.reach)} sub={`${city.routes.length} routes`} />
        <Fig label="arms" value={Math.round(militaryStrength(save))} sub="military strength" />
        <Fig label="build cost" value={`−${Math.round(buildDiscount(save) * 100)}%`} sub="from your works" />
        <Fig label="schooling" value={`+${Math.round(y.schooling * 100)}%`} sub="classes" />
      </div>

      {problems.length ? (
        <Card className="mb-4">
          <ul className="space-y-1.5 text-[13px]">
            {problems.map((p, i) => <li key={i} className="flex gap-2"><span className="warn">·</span>{p}</li>)}
          </ul>
        </Card>
      ) : null}

      <div className="flex gap-1 mb-3">
        {(["build", "trade", "neighbours"] as Tab[]).map((t) => (
          <Button key={t} size="sm" kind={tab === t ? "primary" : "ghost"} onClick={() => setTab(t)}>
            {t === "build" ? "The city" : t === "trade" ? "Out there" : "The others"}
          </Button>
        ))}
      </div>

      {tab === "build" && <BuildList city={city} onPick={(id) => { setPicked(id); setNote(null); }} />}
      {tab === "trade" && <Trade reach={y.reach} say={say} />}
      {tab === "neighbours" && <Neighbours say={say} />}

      {/* Everything you can do to one block, in a sheet — so the screen never grows a third column
          and a phone never has to scroll to reach a control it just tapped. */}
      <Sheet open={!!plot} onClose={() => { setPicked(null); setNote(null); }}
        title={plot ? (plot.kind === "vacant" ? `Empty ground · ${RINGS[plot.ring].name}` : `${DISTRICT_BY_KIND[plot.kind as DistrictKind].name} · ${RINGS[plot.ring].name}`) : ""}>
        {plot ? (
          <PlotSheet plot={plot} note={note} onDone={(r) => { say(r); }} />
        ) : null}
      </Sheet>
    </>
  );
}

function Fig({ label, value, sub, bad }: { label: string; value: React.ReactNode; sub?: string; bad?: boolean }) {
  return (
    <div className="card-2 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wider dim">{label}</div>
      <div className="font-mono text-[15px] leading-tight" style={{ color: bad ? "var(--danger)" : undefined }}>{value}</div>
      {sub ? <div className="text-[10.5px] dim truncate">{sub}</div> : null}
    </div>
  );
}

/* ── the list under the skyline ─────────────────────────────────────────────────────────────── */

function BuildList({ city, onPick }: { city: ReturnType<typeof cityOf>; onPick: (id: string) => void }) {
  const held = city.districts.filter((d) => d.level && d.kind !== "vacant");
  const open = city.districts.filter((d) => d.kind === "vacant");
  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] uppercase tracking-wider dim mb-2">Standing — {held.length}</div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {held.map((d) => {
            const def = DISTRICT_BY_KIND[d.kind as DistrictKind];
            return (
              <button key={d.id} className="card-2 px-3 py-2.5 text-left flex items-center gap-3" onClick={() => onPick(d.id)}>
                <span className="w-1.5 self-stretch rounded-full shrink-0" style={{ background: def.hue }} />
                <span className="flex-1 min-w-0">
                  <span className="text-[13px] block truncate">{def.name} <span className="dim font-mono">L{d.level}</span></span>
                  <span className="text-[11px] dim">{RINGS[d.ring].name}{d.owner === "citizen" ? " · tenanted" : ""}</span>
                </span>
                <span className="font-mono text-[11px] shrink-0"
                  style={{ color: d.condition < 30 ? "var(--danger)" : d.condition < 55 ? "var(--warn)" : "var(--dim)" }}>
                  {Math.round(d.condition)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {open.length ? (
        <div>
          <div className="text-[11px] uppercase tracking-wider dim mb-2">Empty ground — {open.length}</div>
          <div className="flex flex-wrap gap-1.5">
            {open.map((d) => (
              <Chip key={d.id} onClick={() => onPick(d.id)}>{RINGS[d.ring].name} · plot {d.slot + 1}</Chip>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ── one block ─────────────────────────────────────────────────────────────────────────────── */

function PlotSheet({ plot, note, onDone }: {
  plot: District; note: { text: string; bad?: boolean } | null;
  onDone: (r: { ok: boolean; why?: string; line?: string }) => void;
}) {
  const { save, mutate } = useGame();
  const def = plot.kind === "vacant" ? undefined : DISTRICT_BY_KIND[plot.kind as DistrictKind];
  const buildable = DISTRICTS.filter((d) => d.kind !== "spire");

  return (
    <div className="space-y-3">
      {note ? (
        <div className="card-2 px-3 py-2 text-[12.5px]" style={{ color: note.bad ? "var(--danger)" : "var(--good)" }}>{note.text}</div>
      ) : null}

      {def ? (
        <>
          <p className="font-prose text-[14.5px] leading-relaxed">{def.blurb}</p>
          <div className="flex flex-wrap gap-1.5">
            <Chip on>level {plot.level} of {def.cap}</Chip>
            <Chip>condition {Math.round(plot.condition)}%</Chip>
            {plot.owner === "citizen" ? <Chip tone="bad">tenanted — you take a third</Chip> : null}
          </div>
          <div className="text-[12px] dim">
            Each level: {Object.entries(def.yields).map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${k}`).join(" · ")}
          </div>
          {def.household ? <p className="text-[12.5px]" style={{ color: "var(--acc)" }}>{def.household}</p> : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" kind="primary"
              title={canRaise(save, plot) ?? undefined}
              disabled={!!canRaise(save, plot)}
              onClick={() => mutate((s) => onDone(raise(s, plot.id)))}>
              {plot.owner === "citizen" ? "Buy it out and raise it" : `Raise to level ${plot.level + 1}`}
              {" · "}<Money n={costToRaise(save, plot)} />
            </Button>
            <Button size="sm" disabled={plot.condition >= 96}
              onClick={() => mutate((s) => onDone(refurbish(s, plot.id)))}>
              Refurbish
            </Button>
          </div>
          {canRaise(save, plot) ? <div className="text-[11.5px] dim">{canRaise(save, plot)}</div> : null}
        </>
      ) : (
        <>
          <p className="font-prose text-[14.5px] leading-relaxed">
            Empty ground on {RINGS[plot.ring].name}. Cheaper to build on the further out it is, and worth less when it is done.
          </p>
          <div className="grid gap-1.5">
            {buildable.map((d) => {
              const why = canRaise(save, plot, d.kind);
              return (
                <button key={d.kind} className="card-2 px-3 py-2.5 text-left flex items-start gap-3 disabled:opacity-45"
                  disabled={!!why && !why.startsWith("¤")}
                  onClick={() => mutate((s) => onDone(raise(s, plot.id, d.kind)))}>
                  <span className="w-1.5 self-stretch rounded-full shrink-0" style={{ background: d.hue }} />
                  <span className="flex-1 min-w-0">
                    <span className="text-[13px] block">{d.name}</span>
                    <span className="text-[11.5px] dim block">{d.blurb}</span>
                  </span>
                  <span className="font-mono text-[11.5px] shrink-0"
                    style={{ color: why ? "var(--danger)" : "var(--good)" }}>
                    ¤{costToRaise(save, plot, d.kind).toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ── explore ───────────────────────────────────────────────────────────────────────────────── */

function Trade({ reach, say }: { reach: number; say: (r: { ok: boolean; why?: string; line?: string }) => void }) {
  const { save, mutate } = useGame();
  const city = cityOf(save);
  return (
    <div className="space-y-1.5">
      {!reach ? (
        <Card className="text-[13px] dim mb-2">
          You need docks to trade. Build them on the outer ring to open the map.
        </Card>
      ) : null}
      {REGIONS.map((r) => {
        const route = city.routes.find((x) => x.region === r.id);
        const locked = reach < r.reach;
        return (
          <div key={r.id} className="card-2 px-3 py-2.5 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[13px]">
                {r.name}
                {route ? <span className="ml-2 chip on">{route.disrupted ? "disrupted" : "open"}</span> : null}
              </div>
              <div className="text-[11.5px] dim">{r.note}</div>
              <div className="text-[11px] dim font-mono mt-1">
                ¤{r.cash.toLocaleString()}/wk · risk {Math.round(r.risk * 100)}%
                {r.supply ? ` · bodies` : ""} · needs reach {r.reach}
              </div>
            </div>
            {route ? null : (
              <Button size="sm" disabled={locked || save.arcology.cash < r.open}
                onClick={() => mutate((s) => say(openRoute(s, r.id)))}>
                {locked ? `reach ${r.reach}` : `open · ¤${(r.open / 1000).toFixed(0)}k`}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── exterminate ───────────────────────────────────────────────────────────────────────────── */

function Neighbours({ say }: { say: (r: { ok: boolean; why?: string; line?: string }) => void }) {
  const { save, mutate } = useGame();
  const mine = militaryStrength(save);
  if (!save.arcology.neighbours.length) {
    return <Card className="text-[13px]">You've taken every neighboring arcology.</Card>;
  }
  return (
    <div className="space-y-2">
      {save.arcology.neighbours.map((n) => {
        const theirs = Math.round(n.prosperity * 0.5 + 20);
        const price = annexCost(save, n.id);
        return (
          <Card key={n.id}>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-[14px]">{n.name}</span>
              <span className="text-[11px] dim">{n.direction}</span>
              <span className="ml-auto font-mono text-[11.5px]"
                style={{ color: n.attitude < -40 ? "var(--danger)" : n.attitude > 20 ? "var(--good)" : "var(--dim)" }}>
                {n.attitude > 0 ? "+" : ""}{Math.round(n.attitude)}
              </span>
            </div>
            <div className="text-[12px] dim font-mono mb-2">
              prosperity {Math.round(n.prosperity)} · you hold {Math.round(n.ownership)}% · they can field ~{theirs} against your {Math.round(mine)}
            </div>
            {n.scheme ? (
              <div className="text-[12.5px] warn mb-2">
                They are running {n.scheme.kind === "raid" ? "people, not paperwork" : `a ${n.scheme.kind}`} — {Math.round(n.scheme.progress)}% along.
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={n.ownership < 55 || save.arcology.cash < price}
                title={n.ownership < 55 ? "a purchase needs 55% ownership" : undefined}
                onClick={() => mutate((s) => say(annex(s, n.id, "buy")))}>
                Buy it · <Money n={price} />
              </Button>
              <Button size="sm" kind="danger" disabled={mine < theirs * 1.3}
                title={mine < theirs * 1.3 ? `you need half again their strength` : "costs you standing with everyone who watches"}
                onClick={() => mutate((s) => say(annex(s, n.id, "force")))}>
                Take it
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
