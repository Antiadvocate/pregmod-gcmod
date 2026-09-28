/** THE PENTHOUSE — what needs you this week, and the button that ends it.
 *
 *  Three bands. The week's numbers as one strip, with the problems under it. Then "Needs you":
 *  every card on it wants an answer, and nothing that doesn't is allowed in. Then the rest, folded.
 *  Setup forms, the world and FCTV live on their own screens now; on a phone they buried the two
 *  decisions of the week a screen and a half down. The end-of-week button floats over all of it
 *  and says how many things are still open. */
import { momentsOf } from "../engine/moments";
import { concludeMoment } from "../engine/deeds";
import AssistantCard from "./Assistant";
import { Reaction as MomentReaction, OpenMoments } from "./MomentCard";
import { useState, type ReactNode } from "react";
import { AlertTriangle, ChevronRight, Loader2, Sparkles } from "lucide-react";
import type { Route } from "../App";
import { useGame } from "../lib/game";
import { Button, Card, Fold, Meter, Money, cx } from "../lib/ui";
import { endWeek } from "../engine/week";
import { writeWeekProse } from "../engine/forge";
import { resolveEvent, EVENT_BY_ID } from "../engine/events";
import { generateDynamicEvent, resolveDynamic, dynamicReadiness } from "../engine/dynamic";
import { voiceAsk } from "../engine/asks";
import { AskList } from "./AskCard";
import StoryCard from "./StoryCard";
import { pendingBeat } from "../engine/story";
import { SagaNotice } from "./Sagas";
import Ambitions from "./Ambitions";
import { theKeeper, inHousehold } from "../engine/romance";
import { nextEvent as chainEvent, resolveChain, reversalOf, subjectOf, GESTURES, gestureAvailable, doGesture, type Reaction } from "../engine/reversal";
import { liveThreads, answerThread, describeThread } from "../engine/threads";
import { THREAD_BY_KIND } from "../data/threads";
import { SlaveHead } from "./SlaveArt";
import { read } from "../engine/obedience";
import { band, wear } from "../engine/psyche";
import { modelsAvailable } from "../config";

export default function Penthouse({ go }: { go: (r: Route) => void }) {
  const [outcomes, setOutcomes] = useState<{ id: string; chose: string; text: string; person?: string; others?: string[]; moment?: string }[]>([]);
  /** Done: the card goes, and a scene played out under it ends where it is. */
  const finish = async (o: { id: string; moment?: string }) => {
    const m = o.moment ? momentsOf(save).find((x) => x.id === o.moment) : undefined;
    setOutcomes((xs) => xs.filter((x) => x.id !== o.id));
    if (m?.open) { await concludeMoment(save, m); mutate(() => {}); }
  };
  const { save, mutate } = useGame();
  const [running_, setRunning] = useState(false);
  const [inventing, setInventing] = useState(false);
  const [aftermath, setAftermath] = useState<{ line: string; reactions: Reaction[]; person?: string; others?: string[]; title?: string; chose?: string; key?: number } | null>(null);
  const dyn = dynamicReadiness(save);
  const keeper = theKeeper(save);
  const arc = save.arcology;
  const people = Object.values(save.people).filter((p) => inHousehold(save, p));
  const lastReport = save.reports.at(-1);
  const rev = reversalOf(save);
  const chain = chainEvent(save);
  const her = subjectOf(save);
  const canGesture = gestureAvailable(save);
  const threads = liveThreads(save);
  const waiting = threads.filter((t) => t.pending !== undefined);

  const flags = people
    .map((p) => ({ p, r: read(p, save.memory[p.id]) }))
    .filter((x) => x.r.flight_risk > 0.3 || x.p.psyche.state !== "intact" || x.p.health.health < -30 || x.r.fragility > 0.75)
    .sort((a, b) => b.r.flight_risk - a.r.flight_risk);

  async function runWeek() {
    setRunning(true);
    let report = null as ReturnType<typeof endWeek> | null;
    mutate((s) => { report = endWeek(s); });
    // In lean mode the week report stays as the game wrote it: no model call for the summary.
    if (report && modelsAvailable() && !save.models.lean_mode) {
      const text = await writeWeekProse(save, report);
      if (text) mutate(() => { /* report is already in the save; the prose was written onto it */ });
    }
    // Put the week's requests into their own mouths, when there is a model to do it. The payload
    // was fixed before this ran and is not passed to the model; only the wording changes.
    // One at a time: a burst of parallel calls is what trips a provider's per-minute limit.
    if (modelsAvailable() && !save.models.lean_mode && save.asks?.length) {
      const voiced: { id: string; says: string }[] = [];
      for (const a of save.asks) voiced.push({ id: a.id, says: await voiceAsk(save, a) });
      mutate((s) => { for (const v of voiced) { const a = s.asks?.find((x) => x.id === v.id); if (a) a.text = v.says; } });
    }
    setRunning(false);
    go("report");
  }

  const asks = save.asks ?? [];
  const storyDue = !!pendingBeat(save);
  const waitingCount = (storyDue ? 1 : 0) + waiting.length + (chain ? 1 : 0) + asks.length + save.events.length;
  const unread = save.notifications.filter((n) => !n.seen);
  const running = threads.filter((t) => t.pending === undefined && t.heat > 18);
  const delta = lastReport ? lastReport.cash_end - lastReport.cash_start : 0;
  const repDelta = lastReport ? Math.round(lastReport.rep_end - lastReport.rep_start) : 0;
  const makeSomething = async () => {
    setInventing(true);
    const e = await generateDynamicEvent(save);
    if (e) mutate((s) => { s.events.push(e); });
    setInventing(false);
  };

  return (
    <div className="pb-24">
      {/* THE NUMBERS, ONCE. Cash and rep are already in the header; here they carry the week's change,
          which is the thing the header cannot show. Tap for the week report. */}
      <button className="strip mb-4" onClick={() => go("report")}>
        <Fig label="this week" value={lastReport ? <Money n={delta} sign /> : "—"} />
        <Fig label="rep" value={lastReport ? <span className={repDelta >= 0 ? "good" : "bad"}>{repDelta >= 0 ? "+" : "−"}{Math.abs(repDelta)}</span> : "—"} />
        <Fig label="prosperity" value={Math.round(arc.prosperity)} bad={arc.prosperity < 40} />
        <Fig label="idle" value={`${people.filter((p) => p.assignment === "rest").length}/${people.length}`} />
      </button>

      {lastReport?.problems.length ? (
        <div className="mb-4 space-y-1">
          {lastReport.problems.slice(0, 3).map((p, i) => (
            <div key={i} className="flex gap-2 items-start text-[12.5px]"><AlertTriangle size={13} className="bad shrink-0 mt-0.5" /><span className="mid">{p}</span></div>
          ))}
          {lastReport.problems.length > 3 ? <button className="text-[11.5px] dim underline pl-5" onClick={() => go("report")}>{lastReport.problems.length - 3} more in the week report</button> : null}
        </div>
      ) : null}

      {keeper ? (
        <div className="row-note mb-4">{keeper.name} runs {arc.name} now. What you get is a say, when she asks for one.</div>
      ) : null}

      <AssistantCard />

      {/* EVERYTHING THAT WANTS AN ANSWER, and nothing else, in the order it goes stale. */}
      <div className="flex items-baseline gap-2 mb-2.5 mt-2">
        <h2 className="text-[17px] font-semibold tracking-tight">{waitingCount ? "Needs you" : "Nothing waiting"}</h2>
        {waitingCount ? <span className="count">{waitingCount}</span> : null}
        {dyn.ready ? (
          <button className="ml-auto text-[12px] dim flex items-center gap-1" disabled={inventing} title={dyn.note} onClick={() => void makeSomething()}>
            {inventing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {save.events.length ? "something else" : "make something happen"}
          </button>
        ) : null}
      </div>

      <StoryCard />
      <SagaNotice onOpen={() => go("story")} />

      {waiting.map((t) => {
        const def = THREAD_BY_KIND[t.kind]!;
        const beat = def.beats[t.pending!];
        const c = {
          s: save,
          who: Object.fromEntries(Object.entries(t.cast).map(([r, id]) => [r, save.people[id]?.name ?? "she"])),
          weeks: save.arcology.week - t.opened, heat: t.heat, facts: t.facts,
        };
        return (
          <Card key={t.id} className="mb-3">
            <Kicker tone="warn">{def.name} · {c.weeks} weeks</Kicker>
            <div className="text-[14px] font-medium mb-1.5">{beat.title}</div>
            <p className="font-prose text-[15px] leading-relaxed whitespace-pre-line mb-3">{beat.text?.(c)}</p>
            <Options options={beat.options ?? []} onPick={(o) => mutate((st) => {
              setAftermath({ line: answerThread(st, t.id, o.id).line, reactions: [], person: Object.values(t.cast)[0], others: Object.values(t.cast).slice(1), title: def.name, chose: o.label, key: Date.now() });
            })} />
          </Card>
        );
      })}

      {chain ? (
        <Card className="mb-3">
          <Kicker>Supplicationism · deference {Math.round(rev.deference)}</Kicker>
          <div className="text-[14px] font-medium mb-1.5">{chain.title}</div>
          <p className="font-prose text-[15px] leading-relaxed whitespace-pre-line mb-3">{chain.text(save, her?.name)}</p>
          <Options options={chain.options} onPick={(o) => {
            let out: { line: string; reactions: Reaction[] } = { line: "", reactions: [] };
            mutate((s) => { out = resolveChain(s, o.id); });
            setAftermath(out);
          }} />
        </Card>
      ) : null}

      {aftermath ? (
        <Card className="mb-3 fade-in">
          <Kicker>{aftermath.title ?? "What came of it"}</Kicker>
          {aftermath.chose ? <div className="player-line !mt-0 !mb-2">{aftermath.chose}</div> : null}
          <p className="font-prose text-[15px] leading-relaxed">{aftermath.line}</p>
          {aftermath.person || modelsAvailable() ? <MomentReaction key={aftermath.key} seed={{ person: aftermath.person, others: aftermath.others, title: aftermath.title ?? "Afterwards", source: "thread", you: aftermath.chose, happened: aftermath.line }} /> : null}
          {aftermath.reactions.length ? (
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {aftermath.reactions.map((rx) => (
                <li key={rx.id} className="flex gap-2">
                  <span style={{ color: rx.tone === "bad" ? "var(--danger)" : rx.tone === "good" ? "var(--good)" : rx.tone === "warning" ? "var(--warn)" : "var(--text-lo)" }}>·</span>
                  <span>{rx.line}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <Button size="sm" kind="primary" className="mt-3" onClick={() => setAftermath(null)}>Done</Button>
        </Card>
      ) : null}

      <div className="mb-3"><AskList asks={asks} /></div>

      {outcomes.map((o) => (
        <Card key={o.id} className="mb-3 fade-in">
          <div className="player-line !mt-0 !mb-3">{o.chose}</div>
          <div className="space-y-3">
            {o.text.split(/\n\n+/).map((para, i) => <p key={i} className="font-prose text-[15px] leading-relaxed">{para}</p>)}
          </div>
          <div className="flex items-center gap-2">
            {o.person || modelsAvailable() ? <MomentReaction seed={{ person: o.person, others: o.others, title: o.chose, source: "event", you: o.chose, happened: o.text }} onOpen={(mid) => setOutcomes((xs) => xs.map((x) => (x.id === o.id ? { ...x, moment: mid } : x)))} /> : null}
            <Button size="sm" kind="primary" className="mt-3" onClick={() => void finish(o)}>Done</Button>
          </div>
        </Card>
      ))}

      {save.events.map((e) => {
        const person = e.person ? save.people[e.person] : undefined;
        return (
          <Card key={e.id} className="mb-3">
            {person || e.severity === "major" ? (
              <div className="flex items-center gap-2 mb-2">
                {person ? <><SlaveHead person={person} size={26} /><span className="text-[13px] font-medium">{person.name}</span></> : null}
                {e.severity === "major" ? <span className="chip bad ml-auto"><AlertTriangle size={11} /> urgent</span> : null}
              </div>
            ) : null}
            <p className="font-prose text-[15px] leading-relaxed mb-3">{e.seed}</p>
            <Options options={e.kind === "dynamic" ? e.options : EVENT_BY_ID[e.kind]?.options ?? e.options} onPick={(o) => {
              let text = "";
              mutate((s) => { text = e.kind === "dynamic" ? resolveDynamic(s, e, o.id) : resolveEvent(s, e, o.id); });
              setOutcomes((xs) => [...xs, { id: e.id, chose: o.label, text, person: e.person, others: e.other ? [e.other] : undefined }]);
            }} />
          </Card>
        );
      })}

      <div className="mb-2"><OpenMoments title="Left unfinished" /></div>

      {!waitingCount && !outcomes.length && !aftermath ? (
        <div className="text-[13px] dim mb-6">{dyn.ready ? "A quiet week so far." : dyn.note || "A quiet week so far."}</div>
      ) : null}

      {/* THE REST: worth a look, never urgent. Each one closes and stays closed. */}
      <div className="hairline-top pt-3 mt-4">
        <Fold id="flags" count={flags.length} title="Who needs looking at" right={<Button size="sm" kind="ghost" onClick={() => go("people")}>all {people.length} <ChevronRight size={13} /></Button>}>
          {flags.length ? (
            <div className="list mb-2">
              {flags.slice(0, 6).map(({ p, r }) => (
                <button key={p.id} className="list-row" onClick={() => go("people")}>
                  <SlaveHead person={p} size={36} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[13.5px]">{p.name} <span className="dim">· {band(p.psyche)}</span></div>
                    <div className="text-[11.5px] dim truncate">
                      {[
                        p.psyche.state !== "intact" ? p.psyche.state : "",
                        r.flight_risk > 0.3 ? `flight risk ${Math.round(r.flight_risk * 100)}%` : "",
                        r.fragility > 0.75 ? `${Math.round(r.fragility * 100)}% fear` : "",
                        p.health.health < -30 ? `health ${p.health.health}` : "",
                        wear(p.psyche) > 0.6 ? "worn down" : "",
                      ].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div className="w-20 shrink-0"><Meter value={r.devotion} range={[-100, 100]} label="devotion" /></div>
                </button>
              ))}
            </div>
          ) : <div className="text-[12.5px] dim mb-2">Nobody needs you this week.</div>}
        </Fold>

        {running.length ? (
          <Fold id="threads" title="Going on in the background" count={running.length} defaultOpen={false}>
            <div className="list mb-2">
              {running.map((t) => {
                const d = describeThread(save, t);
                return (
                  <div key={t.id} className="list-row">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px]">{d.name}{d.who.length ? <span className="dim"> · {d.who.join(" and ")}</span> : null}</div>
                      <div className="text-[11.5px] dim">{d.blurb}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Fold>
        ) : null}

        {!chain && canGesture && her && rev.done.length > 0 ? (
          <Fold id="gestures" title="In public" defaultOpen={false} right={<span className="text-[11px] dim">deference {Math.round(rev.deference)}</span>}>
            <p className="text-[12.5px] mid mb-2">The arcology takes its cue from the last thing it watched you do. That was {Math.max(0, arc.week - (rev.last_public ?? 0))} weeks ago.</p>
            <div className="mb-2"><Options options={GESTURES.map((g) => ({ ...g, note: `${g.note}${g.rep ? ` · ${g.rep} rep` : ""}` }))} onPick={(g) => {
              let out: { line: string; reactions: Reaction[] } = { line: "", reactions: [] };
              mutate((s) => { out = doGesture(s, g.id); });
              setAftermath(out);
            }} /></div>
          </Fold>
        ) : null}

        {unread.length ? (
          <Fold id="notices" count={unread.length} title="Since you last looked" defaultOpen={false} right={
            <Button size="sm" kind="ghost" onClick={() => mutate((s) => { for (const n of s.notifications) n.seen = true; })}>mark read</Button>
          }>
            <div className="list mb-2">
              {unread.slice(-10).reverse().map((n) => (
                <div key={n.id} className="list-row !items-baseline">
                  <span className="text-[12.5px] flex-1" style={{ color: n.kind === "danger" ? "var(--danger)" : n.kind === "warning" ? "var(--warn)" : n.kind === "good" ? "var(--good)" : undefined }}>{n.text}</span>
                  {n.person && save.people[n.person] ? <span className="text-[11px] dim shrink-0">{save.people[n.person].name}</span> : null}
                </div>
              ))}
            </div>
          </Fold>
        ) : null}

        <Fold id="ambitions" title="What you're after" defaultOpen={false}>
          <Ambitions />
        </Fold>
      </div>

      {/* The one irreversible control, always in reach, saying what is still open. */}
      <div className="endweek">
        <button className="endweek-btn" onClick={runWeek} disabled={running_}>
          {running_ ? <><Loader2 size={15} className="animate-spin" /> Running the week</> : (
            <>
              {waitingCount ? <span className="endweek-count">{waitingCount} open</span> : null}
              <span>End week {arc.week}</span>
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/** One figure in the status strip. */
function Fig({ label, value, bad }: { label: string; value: ReactNode; bad?: boolean }) {
  return (
    <div className="strip-cell">
      <div className="font-mono text-[15px] leading-tight" style={bad ? { color: "var(--danger)" } : undefined}>{value}</div>
      <div className="text-[10.5px] dim mt-0.5">{label}</div>
    </div>
  );
}

function Kicker({ children, tone }: { children: ReactNode; tone?: "warn" }) {
  return <div className={cx("text-[11px] font-medium mb-1", tone === "warn" ? "warn" : "acc")}>{children}</div>;
}

/**
 * THE CHOICES, WITH THEIR PRICE ON THEM.
 *
 * The note used to be a grey line under the whole row of buttons ("Take them on: ¤22,000 up front —
 * under the usual rate"), so you read the buttons, then read a sentence, then matched them up. When
 * any choice has a note, every choice becomes a full-width row with its note on it. When none do,
 * they stay as a row of buttons.
 */
function Options<O extends { id: string; label: string; note?: string }>({ options, onPick }: { options: O[]; onPick: (o: O) => void }) {
  if (!options.some((o) => o.note)) {
    return <div className="flex flex-wrap gap-2">{options.map((o) => <Button key={o.id} size="sm" onClick={() => onPick(o)}>{o.label}</Button>)}</div>;
  }
  return (
    <div className="space-y-1.5">
      {options.map((o) => (
        <button key={o.id} className="choice !py-2.5" onClick={() => onPick(o)}>
          <span className="block text-[13.5px] leading-snug">{o.label}</span>
          {o.note ? <span className="block text-[11.5px] dim mt-0.5">{o.note}</span> : null}
        </button>
      ))}
    </div>
  );
}
