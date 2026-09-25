/**
 * A REACTION, PLAYED OUT.
 *
 * Put under anything a slave just did in answer to you. With a model, the moment is written out in
 * full as soon as it appears, with four things you could say next and a box for your own words.
 * Walk away and it stays open on her page; pick it up there later. Without a model it waits for you
 * to answer her, and the written game answers back.
 */
import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, X } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, cx } from "../lib/ui";
import { closeMoment, momentsOf, openMoment, playMoment } from "../engine/moments";
import { modelsAvailable } from "../config";
import { SlaveHead } from "./SlaveArt";

export interface Seed { person?: string; title: string; source: string; you?: string; happened: string }

/** A moment that starts from something that just happened. */
export function Reaction({ seed, className, auto = true, label = "Answer her" }: { seed: Seed; className?: string; auto?: boolean; label?: string }) {
  const { mutate } = useGame();
  const [id, setId] = useState<string | null>(null);
  const started = useRef(false);
  const start = () => {
    if (started.current) return;
    started.current = true;
    let made = "";
    mutate((s) => { made = openMoment(s, seed); });
    setId(made);
  };
  // With a model, every reaction is written out without asking.
  useEffect(() => { if (auto && modelsAvailable() && seed.person) start(); }, []);
  if (id) return <MomentCard id={id} className={className} bare />;
  if (!seed.person && !modelsAvailable()) return null;
  return (
    <button className={cx("btn btn-sm mt-3", className)} onClick={start}><MessageCircle size={13} /> {label}</button>
  );
}

export default function MomentCard({ id, className, bare, onClose }: { id: string; className?: string; bare?: boolean; onClose?: () => void }) {
  const { save, mutate } = useGame();
  const m = momentsOf(save).find((x) => x.id === id);
  const [busy, setBusy] = useState(false);
  const [stream, setStream] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [folded, setFolded] = useState(false);
  const ran = useRef(false);

  const go = async (reply: string | null) => {
    if (busy) return;
    setBusy(true); setStream(""); setErr("");
    const res = await playMoment(save, id, reply, { onDelta: (c) => setStream((x) => x + c), onReset: () => setStream("") });
    mutate(() => {});
    setStream(""); setBusy(false); setText("");
    if (!res.ok && res.error) setErr(res.error);
  };

  useEffect(() => {
    if (m?.unexpanded && !ran.current) { ran.current = true; void go(null); }
  }, [id]);

  if (!m) return null;
  const p = m.person ? save.people[m.person] : undefined;
  // In place under an event, the opening line is already on screen above.
  const lines = bare ? m.log.slice(m.log.findIndex((l) => l.role === "scene") + 1) : m.log;

  if (folded) {
    return (
      <div className={cx("text-[12px] dim mt-3 flex items-center gap-2", className)}>
        Left for later; it's on {p ? `${p.name}'s page` : "the Penthouse"}.
        <button className="underline" onClick={() => setFolded(false)}>back to it</button>
      </div>
    );
  }

  return (
    <div className={cx(bare ? "mt-3 pt-3 hairline-top" : "card p-4", "fade-in", className)}>
      {!bare ? (
        <div className="flex items-center gap-2.5 mb-3">
          {p ? <SlaveHead person={p} size={32} /> : null}
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px]">{m.title}</div>
            <div className="text-[10.5px] uppercase tracking-wider dim">week {m.week}{m.updated !== m.week ? ` · last week ${m.updated}` : ""}</div>
          </div>
          {onClose ? <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="close"><X size={15} /></button> : null}
        </div>
      ) : null}
      <div className="space-y-3">
        {lines.map((l, i) => l.role === "you"
          ? <div key={i} className="player-line !my-1">{l.text}</div>
          : l.text.split(/\n\n+/).map((para, j) => <p key={`${i}-${j}`} className="font-prose text-[15px] leading-relaxed" style={{ color: "#e6dfd1" }}>{para}</p>))}
        {stream ? <p className="font-prose text-[15px] leading-relaxed mid whitespace-pre-line">{stream}</p> : null}
        {busy && !stream ? <div className="flex items-center gap-2 dim text-[12px]"><Loader2 size={13} className="animate-spin" /> …</div> : null}
        {err ? <div className="text-[12px] bad">{err}</div> : null}
      </div>
      {m.open && !busy ? (
        <>
          <div className="mt-3 space-y-1.5">
            {m.options.map((o) => (
              <button key={o} className="choice" onClick={() => void go(o)}><span className="block text-[14px] leading-snug">{o}</span></button>
            ))}
          </div>
          <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) void go(text.trim()); }}>
            <input className="flex-1 min-w-0" value={text} onChange={(e) => setText(e.target.value)} placeholder="Say or do something else" />
            <Button size="sm" kind="primary" disabled={!text.trim()}>Go</Button>
          </form>
          <div className="flex gap-2 mt-2">
            <Button size="sm" kind="ghost" onClick={() => { setFolded(true); onClose?.(); }}>Continue later</Button>
            <Button size="sm" kind="ghost" onClick={() => { mutate((s) => closeMoment(s, id)); onClose?.(); }}>End it here</Button>
          </div>
        </>
      ) : null}
      {!m.open ? <div className="text-[12px] dim mt-3">That's where it ended.</div> : null}
    </div>
  );
}

/** Her open scenes, or everyone's. */
export function OpenMoments({ person, title }: { person?: string; title?: string }) {
  const { save } = useGame();
  const [on, setOn] = useState<string | null>(null);
  const list = momentsOf(save).filter((m) => m.open && m.log.length > 1 && (!person || m.person === person)).slice(-8).reverse();
  if (!list.length) return null;
  return (
    <div className="space-y-2">
      {title ? <div className="text-[11px] uppercase tracking-wider dim">{title}</div> : null}
      {list.map((m) => on === m.id
        ? <MomentCard key={m.id} id={m.id} onClose={() => setOn(null)} />
        : (
          <button key={m.id} className="actbtn w-full text-left" onClick={() => setOn(m.id)}>
            <span className="block text-[13px]">{m.title}{!person && m.person && save.people[m.person] ? ` · ${save.people[m.person].name}` : ""}</span>
            <span className="block text-[11px] dim truncate">{m.log[m.log.length - 1]?.text.slice(0, 120)}</span>
          </button>
        ))}
    </div>
  );
}
