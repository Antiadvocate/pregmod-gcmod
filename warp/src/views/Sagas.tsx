/**
 * YOUR ARCOLOGY'S STORIES — the sagas, as a reader sees them.
 *
 * Each saga is a card: its title and act, the people in it (their faces follow the chapter), and
 * the chapter waiting, with its choices. A choice you can't make yet is shown with what it needs.
 * Under it, the threads: the ways it could still end, what you've established, and each person's
 * turns, in order, so you can watch someone become who they are by the end.
 */
import { useMemo, useRef, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Loader2, Lock, Square } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, cx } from "../lib/ui";
import { call } from "../llm";
import { modelsAvailable } from "../config";
import type { Person, SaveState } from "../engine/types";
import { answerOwn, choose, locked, running, sagasOf, waiting, writeNext, type Saga, type SagaChar, type Writer } from "../engine/saga";
import { facesOf, personOf } from "../engine/faces";
import Portrait from "./Portrait";
import { Reaction } from "./MomentCard";

const writerFor = (s: SaveState, signal: AbortSignal): Writer => async (system, user) => {
  const r = await call({ system, user, model: s.models.narrator_model, fallback: s.models.fallback_model, json: true, maxTokens: 4000, temperature: 0.9, signal });
  return { ok: r.ok, text: r.text, error: r.error };
};

function faceOf(s: SaveState, c: SagaChar): Person | undefined {
  if (c.person) return s.people[c.person];
  const f = c.face ? facesOf(s)[c.face] : undefined;
  return f ? personOf(f) : undefined;
}

export default function Sagas() {
  const { save } = useGame();
  const st = sagasOf(save);
  const live = running(save);
  const ended = st.list.filter((x) => x.status === "ended").reverse();
  if (!live.length && !ended.length) {
    return (
      <div className="card p-4 mb-5">
        <div className="text-[11px] uppercase tracking-wider dim mb-1 flex items-center gap-1.5"><BookOpen size={12} /> This arcology's stories</div>
        <p className="text-[13px] mid">{modelsAvailable()
          ? `Long stories grow out of what this arcology becomes: the laws you write, the people who hate or love you, the strangers who keep turning up. The first begins around week ${st.next_start}.`
          : "Long stories written for this arcology need a narrator model (Settings). The written story below runs without one."}</p>
      </div>
    );
  }
  return (
    <div className="space-y-4 mb-6">
      {live.map((x) => <SagaCard key={x.id} id={x.id} />)}
      {ended.length ? (
        <details className="card p-4">
          <summary className="text-[11px] uppercase tracking-wider dim cursor-pointer">Finished stories ({ended.length})</summary>
          <div className="space-y-2 mt-3">{ended.map((x) => <SagaCard key={x.id} id={x.id} />)}</div>
        </details>
      ) : null}
    </div>
  );
}

/** For the Penthouse: a line when a chapter is waiting. */
export function SagaNotice({ onOpen }: { onOpen: () => void }) {
  const { save } = useGame();
  const w = waiting(save);
  if (!w.length || !modelsAvailable()) return null;
  return (
    <button className="card p-3 mb-4 w-full text-left press flex items-center gap-2.5" onClick={onOpen}>
      <BookOpen size={15} className="acc shrink-0" />
      <span className="min-w-0 flex-1 text-[13.5px]">
        {w.map((x) => (x.status === "unwritten" ? "A new story is beginning" : `${x.title}: the next chapter`)).join(" · ")}
      </span>
      <ChevronRight size={15} className="dim shrink-0" />
    </button>
  );
}

function SagaCard({ id }: { id: string }) {
  const { save, mutate } = useGame();
  const x = sagasOf(save).list.find((q) => q.id === id)!;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [own, setOwn] = useState("");
  const [open, setOpen] = useState(x.status !== "ended");
  const [threads, setThreads] = useState(false);
  const [after, setAfter] = useState<{ chose: string; outcome: string; consequences: string[]; ended?: string; people: string[]; title: string } | null>(null);
  const stop = useRef<AbortController | null>(null);
  const due = x.due <= save.arcology.week;

  const cast = useMemo(() => x.cast.map((c) => faceOf(save, c)).filter((p): p is Person => !!p), [x.cast.length, x.title]);
  const run = async (job: (w: Writer) => Promise<{ ok: boolean; error?: string }>) => {
    if (busy) return;
    setBusy(true); setErr("");
    const ctl = new AbortController();
    stop.current = ctl;
    const res = await job(writerFor(save, ctl.signal));
    stop.current = null;
    mutate(() => {});
    setBusy(false);
    if (!res.ok && !ctl.signal.aborted) setErr(res.error ?? "that didn't work; try again");
  };
  const take = (i: number) => {
    const ch = x.chapter!;
    let r: ReturnType<typeof choose> = null;
    mutate((s) => { r = choose(s, x.id, i); });
    if (r) setAfter({ ...(r as NonNullable<ReturnType<typeof choose>>), chose: ch.options[i].label, title: ch.title });
  };
  const answer = () => run(async (w) => {
    const ch = x.chapter!;
    const res = await answerOwn(save, x.id, own, w);
    if (res.ok && res.result) { setAfter({ ...res.result, chose: own.trim(), title: ch.title }); setOwn(""); }
    return res;
  });

  if (x.status === "unwritten") {
    return (
      <div className="card p-4 fade-in">
        <div className="text-[11px] uppercase tracking-wider acc mb-1 flex items-center gap-1.5"><BookOpen size={12} /> Something is beginning</div>
        <p className="font-prose text-[15px] leading-relaxed">{x.seed.text}</p>
        <div className="flex gap-2 mt-3 items-center">
          <Button kind="primary" size="sm" disabled={busy || !modelsAvailable()} onClick={() => run((w) => writeNext(save, x.id, w))}>
            {busy ? <><Loader2 size={13} className="animate-spin" /> writing the first chapter…</> : "Begin"}
          </Button>
          {busy ? <button className="btn btn-sm btn-danger" onClick={() => stop.current?.abort()}><Square size={12} /> stop</button> : null}
        </div>
        {err ? <div className="text-[12px] bad mt-2">{err}</div> : null}
      </div>
    );
  }

  const ch = x.chapter;
  const said = after?.outcome ?? ch?.text ?? x.history.at(-1)?.outcome ?? "";
  return (
    <div className={cx("card p-4 fade-in", x.status === "ended" && "card-2")}>
      <button className="w-full text-left flex items-start gap-3" onClick={() => setOpen((v) => !v)}>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wider acc flex items-center gap-1.5"><BookOpen size={12} /> {x.status === "ended" ? `ended week ${x.ended?.week}` : `act ${Math.min(x.act + 1, x.acts.length)} of ${x.acts.length}`}</div>
          <div className="font-display text-[20px] leading-tight mt-0.5">{x.title}</div>
          <div className="text-[12.5px] mid mt-1">{x.status === "ended" ? x.ended?.path : x.acts[Math.min(x.act, x.acts.length - 1)]}</div>
        </div>
        {open ? <ChevronDown size={16} className="dim mt-1" /> : <ChevronRight size={16} className="dim mt-1" />}
      </button>

      {open ? (
        <div className="mt-3">
          {cast.length ? <div className="flex flex-wrap gap-3 mb-3"><Portrait people={cast.slice(0, 3)} text={said.slice(-900)} size={60} />{cast.length > 3 ? <Portrait people={cast.slice(3, 6)} text={said.slice(-900)} size={48} label={false} /> : null}</div> : null}

          {x.status === "ended" ? (
            <p className="font-prose text-[15px] leading-relaxed" style={{ color: "#e6dfd1" }}>{x.ended?.text}</p>
          ) : after ? (
            <div className="fade-in">
              <div className="text-[11px] uppercase tracking-wider dim mb-1">{after.title}</div>
              <div className="player-line !mt-1 !mb-2">{after.chose}</div>
              <Paras text={after.outcome} />
              {after.consequences.length ? <div className="flex flex-wrap gap-1.5 mt-2">{after.consequences.map((c, i) => <span key={i} className="chip">{c}</span>)}</div> : null}
              {after.ended ? <div className="text-[12.5px] acc mt-2">The story ends: {after.ended}.</div> : null}
              <Reaction key={after.outcome.slice(0, 40)} label="Play it out" seed={{ person: after.people[0], others: after.people.slice(1, 3), title: `${x.title}: ${after.title}`, source: "saga", you: after.chose, happened: after.outcome }} />
              <Button size="sm" kind="ghost" className="mt-3" onClick={() => setAfter(null)}>{after.ended ? "close" : `next chapter in ${Math.max(0, x.due - save.arcology.week)} week${x.due - save.arcology.week === 1 ? "" : "s"}`}</Button>
            </div>
          ) : ch ? (
            <div>
              <h3 className="font-display text-[17px] leading-tight mb-2">{ch.title}</h3>
              <Paras text={ch.text} />
              <div className="mt-4 space-y-2">
                {ch.options.map((o, i) => {
                  const why = locked(save, x, o);
                  return (
                    <button key={i} disabled={!!why || busy} className={cx("choice", why && "locked")} onClick={() => take(i)}>
                      <span className="block text-[14px] leading-snug">{o.label}</span>
                      {why ? <span className="flex items-center gap-1 text-[11px] bad mt-0.5"><Lock size={10} /> {why}</span>
                        : o.note ? <span className="block text-[11.5px] dim mt-0.5">{o.note}</span> : null}
                    </button>
                  );
                })}
              </div>
              <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (own.trim()) void answer(); }}>
                <input className="flex-1 min-w-0" value={own} onChange={(e) => setOwn(e.target.value)} placeholder="Do something else" disabled={busy} />
                <Button size="sm" kind="primary" disabled={!own.trim() || busy} onClick={() => { if (own.trim()) void answer(); }}>{busy ? <Loader2 size={13} className="animate-spin" /> : "Go"}</Button>
              </form>
            </div>
          ) : due ? (
            <div className="flex gap-2 items-center">
              <Button kind="primary" size="sm" disabled={busy || !modelsAvailable()} onClick={() => run((w) => writeNext(save, x.id, w))}>
                {busy ? <><Loader2 size={13} className="animate-spin" /> writing…</> : "Read the next chapter"}
              </Button>
              {busy ? <button className="btn btn-sm btn-danger" onClick={() => stop.current?.abort()}><Square size={12} /> stop</button> : null}
            </div>
          ) : (
            <div className="text-[12.5px] dim">The next chapter comes in week {x.due}.</div>
          )}
          {err ? <div className="text-[12px] bad mt-2">{err}</div> : null}

          <button className="text-[11.5px] dim underline mt-4" onClick={() => setThreads((v) => !v)}>{threads ? "hide" : "show"} the threads</button>
          {threads ? <Threads x={x} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function Threads({ x }: { x: Saga }) {
  return (
    <div className="mt-3 space-y-4 fade-in">
      <div>
        <div className="text-[10.5px] uppercase tracking-wider dim mb-1">What's at stake</div>
        <p className="text-[13px] mid">{x.premise} {x.stakes}</p>
      </div>
      <div>
        <div className="text-[10.5px] uppercase tracking-wider dim mb-1">How it could end</div>
        <div className="flex flex-wrap gap-1.5">
          {x.paths.map((p) => <span key={p.id} className={cx("chip", p.state === "taken" ? "on" : p.state === "closed" ? "line-through dim" : "")}>{p.label}</span>)}
        </div>
      </div>
      <div>
        <div className="text-[10.5px] uppercase tracking-wider dim mb-1">The people</div>
        <div className="space-y-2.5">
          {x.cast.map((c) => (
            <div key={c.name} className="card-2 px-3 py-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[13.5px]">{c.name}</span>
                <span className={cx("text-[11px] ml-auto", c.toward >= 30 ? "good" : c.toward <= -30 ? "bad" : "dim")}>{c.toward >= 60 ? "devoted to you" : c.toward >= 30 ? "with you" : c.toward <= -60 ? "your enemy" : c.toward <= -30 ? "against you" : "undecided"}</span>
              </div>
              <div className="text-[12px] dim">{c.role}</div>
              <div className="text-[12.5px] mid mt-1">Now: {c.now}</div>
              {c.desire || c.limit ? <div className="text-[12.5px] mt-0.5"><span className="acc">{c.desire ? `Wants: ${c.desire}.` : ""}</span>{c.limit ? <span className="dim"> Won't, yet: {c.limit}.</span> : null}</div> : null}
              <div className="text-[12px] dim mt-0.5">Wants {c.want.replace(/^to /i, "to ")}. Fears {c.fear}.{c.known && c.secret ? <span className="acc"> Secret: {c.secret}</span> : c.secret ? " Hiding something." : ""}</div>
              {c.turns.length ? (
                <ol className="mt-1.5 space-y-0.5 border-l pl-2.5" style={{ borderColor: "var(--line)" }}>
                  {c.turns.map((t, i) => <li key={i} className="text-[12px] mid"><span className="dim font-mono">wk {t.week}</span> {t.text}</li>)}
                </ol>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      {x.facts.length ? (
        <div>
          <div className="text-[10.5px] uppercase tracking-wider dim mb-1">What's established</div>
          <ul className="text-[12.5px] mid space-y-0.5">{x.facts.map((f, i) => <li key={i}>· {f}</li>)}</ul>
        </div>
      ) : null}
      {x.history.length ? (
        <details>
          <summary className="text-[10.5px] uppercase tracking-wider dim cursor-pointer">The chapters so far ({x.history.length})</summary>
          <div className="space-y-3 mt-2">
            {x.history.map((h, i) => (
              <div key={i}>
                <div className="text-[11px] dim">week {h.week} · act {h.act + 1} · {h.title}</div>
                <Paras text={h.text} small />
                <div className="player-line !my-1">{h.chose}</div>
                <Paras text={h.outcome} small />
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function Paras({ text, small }: { text: string; small?: boolean }) {
  return (
    <div className="space-y-2.5">
      {text.split(/\n\n+/).map((p, i) => <p key={i} className={cx("font-prose leading-relaxed", small ? "text-[13.5px] mid" : "text-[15px]")} style={small ? undefined : { color: "#e6dfd1" }}>{p}</p>)}
    </div>
  );
}
