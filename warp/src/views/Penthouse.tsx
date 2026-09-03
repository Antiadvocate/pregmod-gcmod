/** THE PENTHOUSE — what needs you this week, and the button that ends it.
 *
 *  Ordered by what is actually urgent rather than by category: events first because they expire,
 *  then problems, then the household's own state. The end-of-week button is the only irreversible
 *  control in the app and it says what it will cost before you press it. */
import { useState } from "react";
import { AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import type { Route } from "../App";
import { useGame } from "../lib/game";
import { Button, Card, Empty, Meter, Money, Section, Stat } from "../lib/ui";
import { endWeek } from "../engine/week";
import { writeWeekProse } from "../engine/forge";
import { resolveEvent, EVENT_BY_ID } from "../engine/events";
import { generateDynamicEvent, resolveDynamic, dynamicReadiness } from "../engine/dynamic";
import { grantAsk, refuseAsk, voiceAsk } from "../engine/asks";
import { theKeeper } from "../engine/romance";
import { read } from "../engine/obedience";
import { band, wear } from "../engine/psyche";
import { modelsAvailable } from "../config";

export default function Penthouse({ go }: { go: (r: Route) => void }) {
  const { save, mutate } = useGame();
  const [running, setRunning] = useState(false);
  const [inventing, setInventing] = useState(false);
  const dyn = dynamicReadiness(save);
  const keeper = theKeeper(save);
  const arc = save.arcology;
  const people = Object.values(save.people).filter((p) => p.status === "owned" || p.status === "indentured");
  const lastReport = save.reports.at(-1);

  const flags = people
    .map((p) => ({ p, r: read(p, save.memory[p.id]) }))
    .filter((x) => x.r.flight_risk > 0.3 || x.p.psyche.state !== "intact" || x.p.health.health < -30 || x.r.fragility > 0.75)
    .sort((a, b) => b.r.flight_risk - a.r.flight_risk);

  async function runWeek() {
    setRunning(true);
    let report = null as ReturnType<typeof endWeek> | null;
    mutate((s) => { report = endWeek(s); });
    if (report && modelsAvailable()) {
      const text = await writeWeekProse(save, report);
      if (text) mutate(() => { /* report is already in the save; the prose was written onto it */ });
    }
    // Put the week's requests into their own mouths, when there is a model to do it. The payload
    // was fixed before this ran and is not passed to the model; only the wording changes.
    if (modelsAvailable() && save.asks?.length) {
      const voiced = await Promise.all(save.asks.map(async (a) => ({ id: a.id, says: await voiceAsk(save, a) })));
      mutate((s) => { for (const v of voiced) { const a = s.asks?.find((x) => x.id === v.id); if (a) a.text = v.says; } });
    }
    setRunning(false);
    go("report");
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Stat label="cash" value={<Money n={arc.cash} />} sub={lastReport ? <>last week <Money n={lastReport.cash_end - lastReport.cash_start} sign /></> : "—"} />
        <Stat label="reputation" value={Math.round(arc.rep).toLocaleString()} sub={`standing ${arc.public_standing > 0 ? "+" : ""}${arc.public_standing}`} />
        <Stat label="prosperity" value={Math.round(arc.prosperity)} sub={`crime ${Math.round(arc.crime)}`} tone={arc.prosperity < 40 ? "bad" : undefined} />
        <Stat label="owned" value={people.length} sub={`${people.filter((p) => p.assignment === "rest").length} idle`} />
      </div>

      {keeper ? (
        <Card className="mb-6" >
          <div className="text-[11px] uppercase tracking-wider dim mb-1">this is her arcology now</div>
          <p className="font-prose text-[15px]">
            {keeper.name} runs {arc.name}. The week below is her report. What you get is a say, when she asks for one.
          </p>
        </Card>
      ) : null}

      {save.asks?.length ? (
        <Section title={keeper ? "What she wants from you" : "They are asking"}>
          <div className="space-y-3">
            {save.asks.map((ask) => {
              const who = save.people[ask.person];
              if (!who) return null;
              return (
                <Card key={ask.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="chip on">{who.name}</span>
                    <span className="text-[11px] uppercase tracking-wider dim">{ask.kind === "instruction" ? "not asking" : ask.kind}</span>
                  </div>
                  <p className="font-prose text-[15px] leading-relaxed mb-3">{ask.text}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" kind="primary" onClick={() => mutate((s) => { grantAsk(s, ask); })}>
                      do it{ask.cash ? ` · ¤${ask.cash.toLocaleString()}` : ""}
                    </Button>
                    <Button size="sm" onClick={() => mutate((s) => { refuseAsk(s, ask, false); })}>no</Button>
                    <Button size="sm" kind="danger" onClick={() => mutate((s) => { refuseAsk(s, ask, true); })}>put her in her place</Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      ) : null}

      {save.events.length ? (
        <Section title="Waiting on you" right={
          <Button size="sm" kind="ghost" disabled={inventing || !dyn.ready} title={dyn.note} onClick={async () => {
            setInventing(true);
            const e = await generateDynamicEvent(save);
            if (e) mutate((s) => { s.events.push(e); });
            setInventing(false);
          }}>{inventing ? "…" : "something else happens"}</Button>
        }>
          <div className="space-y-3">
            {save.events.map((e) => {
              const person = e.person ? save.people[e.person] : undefined;
              return (
                <Card key={e.id} className={e.severity === "major" ? "border-l-2" : ""}>
                  <div className="flex items-center gap-2 mb-2">
                    {e.severity === "major" ? <AlertTriangle size={14} className="bad" /> : null}
                    <span className="text-[11px] uppercase tracking-wider dim">{e.severity}</span>
                    {person ? <span className="chip">{person.name}</span> : null}
                  </div>
                  <p className="font-prose text-[15px] leading-relaxed mb-3">{e.seed}</p>
                  <div className="flex flex-wrap gap-2">
                    {(e.kind === "dynamic" ? e.options : EVENT_BY_ID[e.kind]?.options ?? e.options).map((o) => (
                      <Button key={o.id} size="sm" title={o.note} onClick={() => mutate((s) => {
                        if (e.kind === "dynamic") resolveDynamic(s, e, o.id); else resolveEvent(s, e, o.id);
                      })}>
                        {o.label}
                      </Button>
                    ))}
                  </div>
                  {e.options.some((o) => o.note) ? (
                    <div className="text-[11px] dim mt-2">{e.options.filter((o) => o.note).map((o) => `${o.label}: ${o.note}`).join(" · ")}</div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </Section>
      ) : null}

      {save.notifications.filter((n) => !n.seen).length ? (
        <Section title="Since you last looked" right={
          <Button size="sm" kind="ghost" onClick={() => mutate((s) => { for (const n of s.notifications) n.seen = true; })}>mark read</Button>
        }>
          <div className="space-y-1.5">
            {save.notifications.filter((n) => !n.seen).slice(-10).reverse().map((n) => (
              <div key={n.id} className="card-2 px-3 py-2 flex gap-3 items-baseline">
                <span className="font-mono text-[11px] dim shrink-0">wk {n.week}</span>
                <span className="text-[12.5px] flex-1" style={{ color: n.kind === "danger" ? "var(--danger)" : n.kind === "warning" ? "var(--warn)" : n.kind === "good" ? "var(--good)" : undefined }}>
                  {n.text}
                </span>
                {n.person && save.people[n.person] ? <span className="text-[11px] dim shrink-0">{save.people[n.person].name}</span> : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {!save.events.length ? (
        <Section title="Nothing is happening" right={
          <Button size="sm" disabled={inventing || !dyn.ready} title={dyn.note} onClick={async () => {
            setInventing(true);
            const e = await generateDynamicEvent(save);
            if (e) mutate((s) => { s.events.push(e); });
            setInventing(false);
          }}>{inventing ? <><Loader2 size={13} className="animate-spin" /> inventing</> : "make something happen"}</Button>
        }>
          <Card className="text-[12px] dim">
            {dyn.ready
              ? `${dyn.note} A generated situation is built out of one specific woman's record — her fetish, her flaw, what has been done to her, what she remembers — so it is hers rather than a slave event.`
              : dyn.note}
          </Card>
        </Section>
      ) : null}

      {lastReport?.problems.length ? (
        <Section title="Problems">
          <Card>
            <ul className="space-y-1.5 text-[13px]">
              {lastReport.problems.map((p, i) => <li key={i} className="flex gap-2"><span className="bad">·</span>{p}</li>)}
            </ul>
          </Card>
        </Section>
      ) : null}

      <Section title="Who needs looking at" right={<Button size="sm" kind="ghost" onClick={() => go("people")}>all {people.length} <ChevronRight size={13} /></Button>}>
        {flags.length ? (
          <div className="space-y-2">
            {flags.slice(0, 6).map(({ p, r }) => (
              <Card key={p.id} className="flex items-center gap-3 py-3" onClick={() => go("people")}>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px]">{p.name} <span className="dim">· {band(p.psyche)}</span></div>
                  <div className="text-[11.5px] dim truncate">
                    {p.psyche.state !== "intact" ? `${p.psyche.state}. ` : ""}
                    {r.flight_risk > 0.3 ? `flight risk ${Math.round(r.flight_risk * 100)}%. ` : ""}
                    {r.fragility > 0.75 ? `${Math.round(r.fragility * 100)}% of her obedience is fear. ` : ""}
                    {p.health.health < -30 ? `health ${p.health.health}. ` : ""}
                    {wear(p.psyche) > 0.6 ? "worn down." : ""}
                  </div>
                </div>
                <div className="w-24 shrink-0"><Meter value={r.devotion} range={[-100, 100]} label="devotion" /></div>
              </Card>
            ))}
          </div>
        ) : <Empty>Nobody is in trouble. That is not the same as nobody having a problem.</Empty>}
      </Section>

      <Section title="The week">
        <Card>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <div className="text-[13px] mb-1">End week {arc.week}</div>
              <div className="text-[11.5px] dim">
                Standing orders run first, then everyone works their assignment, then the arcology and the world answer.
                {save.orders.filter((o) => o.enabled).length ? ` ${save.orders.filter((o) => o.enabled).length} orders are armed.` : " No standing orders are armed."}
              </div>
            </div>
            <Button kind="primary" onClick={runWeek} disabled={running}>
              {running ? <><Loader2 size={14} className="animate-spin" /> running</> : "End the week"}
            </Button>
          </div>
        </Card>
      </Section>
    </>
  );
}
