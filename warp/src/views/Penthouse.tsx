/** THE PENTHOUSE — what needs you this week, and the button that ends it.
 *
 *  Three bands. The week's numbers as one strip, with the problems under it. Then "Needs you":
 *  every card on it wants an answer, and nothing that doesn't is allowed in. Then the rest, folded.
 *  Setup forms, the world and FCTV live on their own screens now; on a phone they buried the two
 *  decisions of the week a screen and a half down. The end-of-week button floats over all of it
 *  and says how many things are still open. */
import { applyOrders, type Order } from "../engine/ownwords";
import { momentsOf } from "../engine/moments";
import { collarOffered, concludeMoment } from "../engine/deeds";
import AssistantCard from "./Assistant";
import { CollarOffer, Reaction as MomentReaction, OpenMoments } from "./MomentCard";
import { askForHand, askWait, giveHandUp, handOf, throughHer } from "../engine/share";
import { YourWeek, TalkToHer } from "./YourRoom";
import { readHer } from "../engine/herwill";
import { takeStats, chipsBetween, type Chip } from "../lib/delta";
import PassingBy from "./PassingBy";
import { STYLE_NOTE } from "../engine/reign";
import { useRef, useState, type ReactNode } from "react";
import { AlertTriangle, ChevronRight, Loader2, Sparkles } from "lucide-react";
import type { Route } from "../App";
import { useGame } from "../lib/game";
import { Button, Card, Fold, Meter, Money, cx } from "../lib/ui";
import { endWeek } from "../engine/week";
import { generateDynamicEvent, dynamicReadiness } from "../engine/dynamic";
import { choicesOf, liveWeek, narrateOutcome, playOwnAnswer, readOwnAnswer, resolveAny } from "../engine/living";
import { governedPlaces } from "../engine/governor";
import { AskList } from "./AskCard";
import StoryCard from "./StoryCard";
import { pendingBeat } from "../engine/story";
import { SagaCard, SagaNotice } from "./Sagas";
import { waiting as sagasWaiting } from "../engine/saga";
import { AnswerOwn } from "./AnswerOwn";
import Cuckold, { CuckoldNotice } from "./Cuckold";
import { ready as cuckReady } from "../engine/cuckold";
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
  const [outcomes, setOutcomes] = useState<{ id: string; setup?: string; chose: string; text: string; person?: string; others?: string[]; moment?: string; writing?: boolean; facts?: string; auto?: boolean; chips?: Chip[] }[]>([]);
  // Whether each event's answer gets written out by the model; off just applies it.
  const [writeOff, setWriteOff] = useState<Record<string, boolean>>({});
  /** Done: the card goes, and a scene played out under it ends where it is. */
  const finish = async (o: { id: string; moment?: string }) => {
    const m = o.moment ? momentsOf(save).find((x) => x.id === o.moment) : undefined;
    setOutcomes((xs) => xs.filter((x) => x.id !== o.id));
    if (m?.open) { await concludeMoment(save, m); mutate(() => {}); }
  };
  const { save, mutate } = useGame();
  const [running_, setRunning] = useState(false);
  const [inventing, setInventing] = useState(false);
  const [cuckOpen, setCuckOpen] = useState(false);
  const [writing, setWriting] = useState("");
  const [aftermath, setAftermath] = useState<{ line: string; reactions: Reaction[]; setup?: string; person?: string; others?: string[]; title?: string; chose?: string; key?: number } | null>(null);
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
    // With a model, nothing the week puts in front of you is the canned text: the events, the
    // requests, the law lines, the letters and the week's paragraph are all written from what is
    // true now and what has already happened. The engine fixed what each of them does first.
    if (modelsAvailable() && !save.models.lean_mode) {
      await liveWeek(save, report, (what) => setWriting(what));
      mutate(() => {});
    }
    setWriting("");
    setRunning(false);
    go("report");
  }

  const asks = save.asks ?? [];
  const storyDue = !!pendingBeat(save);
  const sagasReady = sagasWaiting(save).filter((x) => !!x.chapter && x.status === "running");
  const waitingCount = sagasReady.length + (cuckReady(save) ? 1 : 0) + (storyDue ? 1 : 0) + waiting.length + (chain ? 1 : 0) + asks.length + save.events.length;
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

  /** Answer an event: one of its choices, or your own words read as one of them. */
  const pick = (e: (typeof save.events)[number], o: { id: string; label: string; note?: string }, orders: Order[] = [], own?: string) => {
    let text = "";
    let chips: Chip[] = [];
    // Only what happens to your own people gets written out; business stays the game's line and what changed.
    const write = !!e.person && modelsAvailable() && !save.models.lean_mode && save.models.write_outcomes !== false && !writeOff[e.id];
    // Your own words, about your own people: what you typed is what happened, and what it changed is
    // read from it (engine/living playOwnAnswer). Not the nearest choice's canned line and numbers.
    if (own && write && !e.kind.startsWith("reign_")) {
      let before: ReturnType<typeof takeStats> | null = null;
      mutate((s) => { before = takeStats(s, [e.person, e.other]); applyOrders(s, orders); });
      const card = { id: e.id, setup: e.seed, chose: own, text: "", person: e.person, others: e.other ? [e.other] : undefined, chips: [] as Chip[] };
      setOutcomes((xs) => [...xs, { ...card, writing: true }]);
      void playOwnAnswer(save, e, own).then((prose) => {
        // No model wrote it: fall back to reading your words as the nearest choice.
        if (!prose) { setOutcomes((xs) => xs.filter((x) => x.id !== e.id)); pick(e, o, []); return; }
        mutate(() => {});
        const after = takeStats(save, [e.person, e.other]);
        setOutcomes((xs) => xs.map((x) => (x.id === e.id ? { ...x, text: prose, chips: before ? chipsBetween(before, after) : [], writing: false } : x)));
      });
      return;
    }
    // Once she holds your collar, what you pick goes through her.
    mutate((s) => {
      const before = takeStats(s, [e.person, e.other]);
      const via = e.kind.startsWith("reign_") ? { id: o.id, line: "" } : throughHer(s, "people", o, choicesOf(e));
      // What you ordered done in your own words is done first, and is part of what happened.
      const done = applyOrders(s, orders);
      text = [via.line, resolveAny(s, e, via.id), ...done].filter(Boolean).join("\n\n");
      chips = chipsBetween(before, takeStats(s, [e.person, e.other]));
    });
    const out = { id: e.id, setup: e.seed, chose: o.label, text, person: e.person, others: e.other ? [e.other] : undefined, chips };
    // Going to her when she wants you is the scene itself: it opens and is played, not summed up.
    if (e.kind === "reign_want" && o.id === "obey") { setOutcomes((xs) => [...xs, { ...out, auto: write }]); return; }
    setOutcomes((xs) => [...xs, { ...out, writing: write }]);
    // The choice played out, with what the engine decided as the facts.
    if (write) void narrateOutcome(save, { ...out, happened: text, title: e.written?.title }).then((t) => {
      setOutcomes((xs) => xs.map((x) => (x.id === e.id ? { ...x, text: t ? `${t}` : x.text, facts: t ? text : undefined, writing: false } : x)));
    });
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

      {collarOffered(save) ? <div className="mb-4"><CollarOffer id={collarOffered(save)!.id} /></div> : null}

      <PassingBy />

      {lastReport?.problems.length ? (
        <div className="mb-4 space-y-1">
          {lastReport.problems.slice(0, 3).map((p, i) => (
            <div key={i} className="flex gap-2 items-start text-[12.5px]"><AlertTriangle size={13} className="bad shrink-0 mt-0.5" /><span className="mid">{p}</span></div>
          ))}
          {lastReport.problems.length > 3 ? <button className="text-[11.5px] dim underline pl-5" onClick={() => go("report")}>{lastReport.problems.length - 3} more in the week report</button> : null}
        </div>
      ) : null}

      {keeper ? (
        <><HandCard /><YourWeek /><TalkToHer /></>
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
      {/* A story chapter that's been written waits here like any event; one still being written is a line. */}
      {sagasReady.map((x) => <div key={x.id} className="mb-4"><SagaCard id={x.id} /></div>)}
      {sagasReady.length ? null : <SagaNotice onOpen={() => go("story")} />}
      <CuckoldNotice onOpen={() => setCuckOpen(true)} />
      {cuckOpen && save.cuckold && save.people[save.cuckold.her] ? <Cuckold id={save.cuckold.her} onClose={() => setCuckOpen(false)} /> : null}

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
              setAftermath({ line: answerThread(st, t.id, o.id).line, reactions: [], setup: beat.text?.(c), person: Object.values(t.cast)[0], others: Object.values(t.cast).slice(1), title: def.name, chose: o.label, key: Date.now() });
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
            const setup = chain.text(save, her?.name);
            mutate((s) => { out = resolveChain(s, o.id); });
            setAftermath({ ...out, setup, title: chain.title, chose: o.label, key: Date.now() });
          }} />
        </Card>
      ) : null}

      {aftermath ? (
        <Card className="mb-3 fade-in">
          <Kicker>{aftermath.title ?? "What came of it"}</Kicker>
          {aftermath.setup ? <Setup text={aftermath.setup} /> : null}
          {aftermath.chose ? <div className="player-line !mt-0 !mb-2">{aftermath.chose}</div> : null}
          <p className="font-prose text-[15px] leading-relaxed">{aftermath.line}</p>
          {aftermath.person || modelsAvailable() ? <MomentReaction key={aftermath.key} seed={{ person: aftermath.person, others: aftermath.others, title: aftermath.title ?? "Afterwards", source: "thread", setup: aftermath.setup, you: aftermath.chose, happened: aftermath.line }} /> : null}
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

      {governedPlaces(save).filter(({ g }) => g.letters.some((l) => !l.read)).map(({ g, p }) => (
        <Card key={`letter-${g.place}`} className="mb-3">
          <div className="flex items-center gap-2 mb-2">{p ? <SlaveHead person={p} size={26} /> : null}<span className="text-[13px] font-medium">{p?.name}, from {g.name}</span><span className="text-[11px] dim ml-auto">week {g.letters.at(-1)!.week}</span></div>
          {g.letters.at(-1)!.text.split(/\n\n+/).map((para, i) => <p key={i} className="font-prose text-[15px] leading-relaxed mb-2">{para}</p>)}
          <div className="flex gap-2">
            <Button size="sm" kind="primary" onClick={() => { mutate(() => { for (const l of g.letters) l.read = true; }); go("war"); }}>Call her</Button>
            <Button size="sm" kind="ghost" onClick={() => mutate(() => { for (const l of g.letters) l.read = true; })}>Read</Button>
          </div>
        </Card>
      ))}

      {outcomes.map((o) => (
        <Card key={o.id} className="mb-3 fade-in">
          {o.setup ? <Setup text={o.setup} /> : null}
          <div className="player-line !mt-0 !mb-3">{o.chose}</div>
          <div className="space-y-3">
            {o.writing ? <div className="flex items-center gap-2 dim text-[12px]"><Loader2 size={13} className="animate-spin" /> writing what happens</div> : null}
            {o.text.split(/\n\n+/).map((para, i) => <p key={i} className="font-prose text-[15px] leading-relaxed">{para}</p>)}
            {o.facts ? <p className="text-[12px] dim">{o.facts.split(/\n\n+/)[0]}</p> : null}
            {o.chips?.length ? <div className="flex flex-wrap gap-1">{o.chips.map((c, i) => <span key={i} className={`chip ${c.good ? "good" : "bad"}`}>{c.text}</span>)}</div> : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-2">
            {o.person || modelsAvailable() ? <MomentReaction auto={!!o.auto} seed={{ person: o.person, others: o.others, title: o.chose, source: "event", setup: o.setup, you: o.chose, happened: o.text }} onOpen={(mid) => setOutcomes((xs) => xs.map((x) => (x.id === o.id ? { ...x, moment: mid } : x)))} /> : null}
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
            {e.written?.title ? <div className="text-[14px] font-medium mb-1.5">{e.written.title}</div> : null}
            <div className="space-y-2.5 mb-3">{e.seed.split(/\n\n+/).map((para, i) => <p key={i} className="font-prose text-[15px] leading-relaxed">{para}</p>)}</div>
            {save.empire?.about[e.kind] && modelsAvailable() ? (
              <button className="text-[12px] acc underline mb-2" onClick={() => go("war")}>or talk to them yourself, in the War Room</button>
            ) : null}
            {e.person && modelsAvailable() && !save.models.lean_mode && save.models.write_outcomes !== false ? (
              <label className="flex items-center gap-1.5 text-[11.5px] dim mb-2 cursor-pointer">
                <input type="checkbox" checked={!writeOff[e.id]} onChange={(ev) => setWriteOff((w) => ({ ...w, [e.id]: !ev.target.checked }))} />
                write out what happens
              </label>
            ) : null}
            <Options options={choicesOf(e)} onPick={(o) => pick(e, o)} />
            {modelsAvailable() ? <AnswerOwn onSay={async (typed, signal) => {
              const r = await readOwnAnswer(save, e, typed, signal);
              if (!r.id) return r.error ?? "couldn't do that";
              const live = save.events.find((x) => x.id === e.id);
              if (!live) return "";
              pick(live, { id: r.id, label: typed }, r.orders ?? [], typed);
              return "";
            }} /> : null}
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
          {running_ ? <><Loader2 size={15} className="animate-spin" /> {writing ? `Writing ${writing}` : "Running the week"}</> : (
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

/** The situation you answered, kept above what came of it so the card still says what it was about.
 *  Folded to its first lines: you've read it already. */
function Setup({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const short = text.length > 220 && !open;
  return (
    <div className="mb-3">
      {short
        ? <p className="font-prose text-[14px] leading-relaxed dim">{text.slice(0, 200).replace(/\s+\S*$/, "")}… <button className="underline text-[12px]" onClick={() => setOpen(true)}>more</button></p>
        : <div className="space-y-2">{text.split(/\n\n+/).map((para, i) => <p key={i} className="font-prose text-[14px] leading-relaxed dim">{para}</p>)}</div>}
    </div>
  );
}

/** Where you stand with her: a hand in running things, or none, and what she's stopped. */
function HandCard() {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState("");
  const keeper = theKeeper(save);
  const hand = handOf(save);
  if (!keeper || hand === "owner") return null;
  const r = save.reign!;
  const wait = askWait(save);
  const recent = (r.overruled ?? []).slice(-3).reverse();
  return (
    <div className="card p-3 mb-4">
      <p className="text-[13px]">{hand === "shared"
        ? <>{keeper.name} owns you, and lets you keep running things. She can stop anything you do.</>
        : <>{keeper.name} runs {save.arcology.name} now. You can see everything she does with it, but you can't change any of it.</>}</p>
      <HowSheKeepsYou />
      {recent.length ? <ul className="mt-2 space-y-0.5 text-[12px] mid">{recent.map((x, i) => <li key={i}>· week {x.week}: {x.line}</li>)}</ul> : null}
      <div className="flex flex-wrap gap-2 mt-2">
        {hand === "locked"
          ? <Button size="sm" disabled={wait > 0} onClick={() => { let l = ""; mutate((s) => { l = askForHand(s); }); setSaid(l); }}>{wait > 0 ? `Ask her again in ${wait} week${wait === 1 ? "" : "s"}` : "Ask for a say in running things"}</Button>
          : <Button size="sm" kind="ghost" onClick={() => { let l = ""; mutate((s) => { l = giveHandUp(s); }); setSaid(l); }}>Give her all of it</Button>}
      </div>
      {said ? <p className="text-[12.5px] mt-2 acc">{said}</p> : null}
    </div>
  );
}

/** How the game reads her with you, and a way to say it's wrong. Every scene with her gets this. */
function HowSheKeepsYou() {
  const { save, mutate } = useGame();
  const [fixing, setFixing] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const r = save.reign;
  if (!r || r.ended) return null;
  const go = async () => {
    setBusy(true); setErr("");
    const ok = await readHer(save, note);
    mutate(() => {});
    setBusy(false);
    if (ok) { setFixing(false); setNote(""); } else setErr("That didn't work. Try again.");
  };
  return (
    <div className="mt-2">
      <p className="text-[12.5px] font-prose mid">{r.portrait ?? STYLE_NOTE[r.style]}</p>
      {modelsAvailable() ? (!fixing
        ? <button className="text-[11.5px] dim underline mt-1" onClick={() => setFixing(true)}>that isn't her</button>
        : (
          <div className="mt-2">
            <textarea className="w-full" rows={3} placeholder="Say what's wrong with it, like how she's actually treated you, what you've told her, what you are to her." value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex gap-2 mt-1">
              <Button size="sm" kind="primary" disabled={busy} onClick={() => void go()}>{busy ? "Reading her again…" : "Read her again"}</Button>
              <Button size="sm" kind="ghost" onClick={() => setFixing(false)}>never mind</Button>
            </div>
            {err ? <p className="text-[12px] bad mt-1">{err}</p> : null}
          </div>
        )) : null}
    </div>
  );
}
