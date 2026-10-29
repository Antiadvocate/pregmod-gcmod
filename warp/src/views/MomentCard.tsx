/**
 * A REACTION, PLAYED OUT.
 *
 * Put under anything a slave just did in answer to you. With a model, the moment is written out in
 * full as soon as it appears, with four things you could say next and a box for your own words.
 * Walk away and it stays open on her page; pick it up there later. Without a model it waits for you
 * to answer her, and the written game answers back.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageCircle, RotateCcw, Square, X } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, cx } from "../lib/ui";
import { closeAllMoments, endedMoments, momentsOf, openMoment, playMoment, resumeMoment } from "../engine/moments";
import { rollback, snapshot } from "../engine/state";
import { acceptCollar, concludeMoment, deedsOf, refuseCollar, DEED_TAGS } from "../engine/deeds";
import { modelsAvailable } from "../config";
import Portrait, { castOf } from "./Portrait";

export interface Seed { person?: string; others?: string[]; title: string; source: string; setup?: string; you?: string; happened: string }

/** A moment that starts from something that just happened. */
export function Reaction({ seed, className, auto = false, label = "Play it out", onOpen }: { seed: Seed; className?: string; auto?: boolean; label?: string; onOpen?: (id: string) => void }) {
  const { mutate } = useGame();
  const [id, setId] = useState<string | null>(null);
  const started = useRef(false);
  const start = () => {
    if (started.current) return;
    started.current = true;
    let made = "";
    mutate((s) => { made = openMoment(s, seed); });
    setId(made);
    onOpen?.(made);
  };
  // With a model, every reaction is written out without asking.
  useEffect(() => { if (auto && modelsAvailable() && seed.person) start(); }, []);
  if (id) return <MomentCard id={id} className={cx("basis-full", className)} bare />;
  if (!seed.person && !modelsAvailable()) return null;
  return (
    <button className={cx("btn btn-sm mt-3", className)} onClick={start} title={modelsAvailable() ? "Write it out with the model and answer it. What you do there has consequences" : "Answer it in the written game"}><MessageCircle size={13} /> {label}</button>
  );
}

export default function MomentCard({ id, className, bare, onClose }: { id: string; className?: string; bare?: boolean; onClose?: () => void }) {
  const { save, mutate, replace } = useGame();
  const m = momentsOf(save).find((x) => x.id === id);
  const [busy, setBusy] = useState(false);
  const [stream, setStream] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [folded, setFolded] = useState(false);
  const [ending, setEnding] = useState(false);
  const end = async () => {
    const mo = momentsOf(save).find((x) => x.id === id);
    if (!mo || ending) return;
    setEnding(true);
    await concludeMoment(save, mo);
    mutate(() => {});
    setEnding(false);
  };
  const ran = useRef(false);

  const stopper = useRef<AbortController | null>(null);
  /** What the last model call was answering, so it can be asked again. undefined = nothing to retry. */
  const last = useRef<string | null | undefined>(undefined);
  const [again, setAgain] = useState<{ reply: string | null } | null>(null);
  useEffect(() => { if (again) { const a = again; setAgain(null); void go(a.reply); } }, [again]);

  const go = async (reply: string | null) => {
    if (busy) return;
    setBusy(true); setStream(""); setErr("");
    // Keep the state from before this reply, so a stop or a retry can put it all back.
    mutate((s) => { snapshot(s); });
    const ctl = new AbortController();
    stopper.current = ctl;
    const res = await playMoment(save, id, reply, { onDelta: (c) => setStream((x) => x + c), onReset: () => setStream(""), signal: ctl.signal });
    stopper.current = null;
    if (ctl.signal.aborted) {
      const back = rollback(save);
      if (back) replace(back);
      setStream(""); setBusy(false); setText(reply ?? "");
      last.current = undefined;
      setErr("Stopped. Nothing from that reply was kept.");
      return;
    }
    last.current = modelsAvailable() ? reply : undefined;
    mutate(() => {});
    setStream(""); setBusy(false); setText("");
    if (!res.ok && res.error) setErr(res.error);
  };
  const retry = () => {
    if (busy || last.current === undefined) return;
    const reply = last.current;
    const back = rollback(save);
    if (!back) return;
    replace(back);
    setAgain({ reply });
  };

  useEffect(() => {
    if (m?.unexpanded && !ran.current) { ran.current = true; void go(null); }
  }, [id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cast = useMemo(() => (m ? castOf(save, m) : []), [id, m?.person, (m?.others ?? []).join(), m?.log.length ?? 0]);
  if (!m) return null;
  const p = m.person ? save.people[m.person] : undefined;
  // Their face follows the last thing written on their side, and the reply as it arrives.
  const said = stream || [...m.log].reverse().find((l) => l.role !== "you")?.text || "";
  // In place under an event, what the game handed over is already on screen above.
  const lines = bare ? m.log.slice(m.seeded ?? m.log.findIndex((l) => l.role === "scene") + 1) : m.log;

  if (folded) {
    return (
      <div className={cx("text-[12px] dim mt-3 flex items-center gap-2", className)}>
        Left for later. It's on {p ? `${p.name}'s page` : "the Penthouse"}.
        <button className="underline" onClick={() => setFolded(false)}>back to it</button>
      </div>
    );
  }

  return (
    <div className={cx(bare ? "mt-3 pt-3 hairline-top" : "card p-4", "fade-in", className)}>
      {!bare ? (
        <div className="flex items-center gap-3 mb-3">
          <Portrait people={cast} text={said.slice(-600)} speaking={busy && !!stream} size={72} />
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px]">{m.title}</div>
            <div className="text-[10.5px] uppercase tracking-wider dim">week {m.week}{m.updated !== m.week ? ` · last week ${m.updated}` : ""}</div>
          </div>
          {onClose ? <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="close"><X size={15} /></button> : null}
        </div>
      ) : null}
      {bare && cast.length ? <div className="float-left mr-3 mb-1"><Portrait people={cast} text={said.slice(-600)} speaking={busy && !!stream} size={52} /></div> : null}
      <div className="space-y-3">
        {lines.map((l, i) => l.role === "you"
          ? <div key={i} className="player-line !my-1">{l.text}</div>
          : [...l.text.split(/\n\n+/).map((para, j) => <p key={`${i}-${j}`} className="font-prose text-[15px] leading-relaxed" style={{ color: "#e6dfd1" }}>{para}</p>),
            // What the narrator still got wrong after being told once (engine/continuity).
            ...(l.slips?.length ? [<div key={`${i}-slips`} className="text-[11.5px] warn leading-snug">Continuity slip: {l.slips.join(" ")}</div>] : [])])}
        {stream ? <p className="font-prose text-[15px] leading-relaxed mid whitespace-pre-line">{stream}</p> : null}
        {busy && !stream ? <div className="flex items-center gap-2 dim text-[12px]"><Loader2 size={13} className="animate-spin" /> …</div> : null}
        {busy && stopper.current ? <button className="btn btn-sm btn-danger" onClick={() => stopper.current?.abort()} title="Stop the model and throw this reply away"><Square size={12} /> stop</button> : null}
        {err ? <div className="text-[12px] bad">{err}</div> : null}
      </div>
      {bare && cast.length ? <div className="clear-both" /> : null}
      {m.open && !busy ? (
        <>
          <div className="mt-3 space-y-1.5">
            {m.options.map((o) => (
              <button key={o} className="choice" onClick={() => void go(o)}><span className="block text-[14px] leading-snug">{o}</span></button>
            ))}
          </div>
          <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) void go(text.trim()); }}>
            <input className="flex-1 min-w-0" value={text} onChange={(e) => setText(e.target.value)} placeholder="Say or do something else" />
            <Button size="sm" kind="primary" disabled={!text.trim()} onClick={() => { if (text.trim()) void go(text.trim()); }}>Go</Button>
          </form>
          {m.winding ? <div className="text-[12px] dim mt-2">This might have wound down ({m.winding}). It stays open until you say you're done.</div> : null}
          <div className="flex gap-2 mt-2">
            {bare ? null : <Button size="sm" kind="ghost" onClick={() => { setFolded(true); onClose?.(); }}>Continue later</Button>}
            {last.current !== undefined ? <Button size="sm" kind="ghost" onClick={retry} title="Throw away that response and ask the model again"><RotateCcw size={12} /> Retry</Button> : null}
            <Button size="sm" kind="ghost" disabled={ending} onClick={() => void end()} title="End it where it is. What you did still counts">{ending ? "…" : "Done"}</Button>
          </div>
        </>
      ) : null}
      {!m.open && m.ended ? <div className="text-[12px] dim mt-3">This one ended because {m.ended}. What happened in it counts.</div> : null}
      {!m.open ? <DeedCard id={m.concluded} onClose={onClose} /> : null}
      {!m.open && !busy && m.log.length > 1 ? (
        <Button size="sm" className="mt-2" onClick={() => mutate((s) => { resumeMoment(s, m.id); })} title="Carry on from exactly where it stopped. What it already changed stands">Pick it back up</Button>
      ) : null}
    </div>
  );
}

/** Her open scenes, or everyone's, and the ones that ended lately, which can be picked back up. */
export function OpenMoments({ person, title, hide = [] }: { person?: string; title?: string; hide?: string[] }) {
  const { save, mutate } = useGame();
  const [on, setOn] = useState<string | null>(null);
  const [past, setPast] = useState(false);
  const list = momentsOf(save).filter((m) => m.open && m.log.length > 1 && !hide.includes(m.id) && (!person || m.person === person)).slice(-8).reverse();
  const ended = endedMoments(save, person).filter((m) => !hide.includes(m.id)).slice(0, 6);
  if (!list.length && !ended.length) return null;
  const row = (m: typeof list[number]) => on === m.id
    ? <MomentCard key={m.id} id={m.id} onClose={() => setOn(null)} />
    : (
      <button key={m.id} className="actbtn w-full text-left" onClick={() => setOn(m.id)}>
        <span className="block text-[13px]">{m.title}{!person && m.person && save.people[m.person] ? ` · ${save.people[m.person].name}` : ""}</span>
        <span className="block text-[11px] dim truncate">{m.log[m.log.length - 1]?.text.slice(0, 120)}</span>
      </button>
    );
  if (!list.length) {
    return (
      <div className="space-y-2">
        <button className="text-[11px] dim underline" onClick={() => setPast((x) => !x)}>{past ? "hide" : "show"} scenes that ended lately ({ended.length})</button>
        {past ? ended.map(row) : null}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        {title ? <div className="text-[11px] uppercase tracking-wider dim">{title}</div> : null}
        {!person ? <button className="ml-auto text-[11px] dim underline" title="End every one of these where it stands. What you said in them still counts" onClick={() => { mutate((s) => { closeAllMoments(s); }); setOn(null); }}>clear all</button> : null}
      </div>
      {list.map(row)}
      {ended.length ? <button className="text-[11px] dim underline" onClick={() => setPast((x) => !x)}>{past ? "hide" : "show"} scenes that ended lately ({ended.length})</button> : null}
      {past ? ended.map(row) : null}
    </div>
  );
}

/** What an ended scene left behind: the line, the tags, and what they did. */
export function DeedCard({ id, onClose }: { id?: string; onClose?: () => void }) {
  const { save } = useGame();
  const d = id ? deedsOf(save).find((x) => x.id === id) : undefined;
  if (!d) return <div className="text-[12px] dim mt-3">That's where it ended. Nothing you said will change anything.</div>;
  return (
    <div className="card-2 p-3 mt-3 fade-in">
      <div className="text-[10.5px] uppercase tracking-wider dim mb-1">What came of it</div>
      <p className="font-prose text-[14.5px] leading-relaxed">{d.summary}</p>
      {d.tags.length ? <div className="flex flex-wrap gap-1.5 mt-2">{d.tags.map((t) => <span key={t} className="chip">{DEED_TAGS[t]?.label ?? t}</span>)}</div> : null}
      {d.effects.length ? <ul className="mt-2 space-y-0.5 text-[12.5px] mid">{d.effects.map((e, i) => <li key={i}>· {e}</li>)}</ul> : null}
      {d.fact ? <div className="text-[12px] acc mt-2">{d.fact}</div> : null}
      {d.collar === "offered" ? <CollarOffer id={d.id} /> : null}
      {onClose ? <Button size="sm" kind="ghost" className="mt-2" onClick={onClose}>done</Button> : null}
    </div>
  );
}

/** She heard you give yourself to her. Nothing has happened yet: kneel, or tell her she heard wrong. */
export function CollarOffer({ id }: { id: string }) {
  const { save, mutate } = useGame();
  const d = deedsOf(save).find((x) => x.id === id);
  const p = d?.person ? save.people[d.person] : undefined;
  if (!d || !p || d.collar !== "offered") return null;
  const first = p.name.split(" ")[0];
  return (
    <div className="card p-3 mt-3 fade-in">
      <p className="font-prose text-[14px] leading-relaxed">{first} took that as you giving yourself to her. She has a collar in her hands and she's waiting to see if you kneel.</p>
      <p className="text-[12px] dim mt-1">If you kneel, she owns you and the arcology answers to her. Ask to keep a hand in and you can still run things, if she agrees, but she can overrule you.</p>
      <div className="flex flex-wrap gap-2 mt-2">
        <Button size="sm" kind="primary" onClick={() => mutate((s) => { acceptCollar(s, id); })}>Kneel and give her everything</Button>
        <Button size="sm" onClick={() => mutate((s) => { acceptCollar(s, id, true); })}>Kneel, and ask to keep a hand in</Button>
        <Button size="sm" kind="ghost" onClick={() => mutate((s) => { refuseCollar(s, id); })}>That's not what I meant</Button>
      </div>
    </div>
  );
}
