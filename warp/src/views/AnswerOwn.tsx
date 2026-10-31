/**
 * YOUR OWN WORDS. Under any set of choices: type what you say or do instead, and the model reads it
 * as the nearest choice the game can carry out. `onSay` returns an error, or "" when it went.
 */
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useGame } from "../lib/game";
import { keepLine } from "../engine/yourvoice";

export function AnswerOwn({ onSay, placeholder = "or answer in your own words" }: { onSay: (typed: string, signal: AbortSignal) => Promise<string>; placeholder?: string }) {
  const { mutate } = useGame();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const stop = useRef<AbortController | null>(null);
  const go = async () => {
    const t = text.trim();
    if (!t || busy) return;
    const ctl = new AbortController();
    stop.current = ctl;
    setBusy(true); setErr("");
    const e = await onSay(t, ctl.signal).catch((x: unknown) => String((x as Error)?.message ?? x));
    stop.current = null;
    setBusy(false);
    if (ctl.signal.aborted) return;
    // What you typed went through: it's kept as how you write (engine/yourvoice).
    if (e) setErr(e); else { mutate((s) => { keepLine(s, t); }); setText(""); }
  };
  return (
    <div className="mt-2">
      <form className="flex gap-2" onSubmit={(ev) => { ev.preventDefault(); void go(); }}>
        <input className="flex-1 min-w-0" value={text} disabled={busy} onChange={(ev) => setText(ev.target.value)} placeholder={placeholder} />
        {busy
          ? <button type="button" className="btn btn-sm" onClick={() => stop.current?.abort()}><Loader2 size={12} className="animate-spin" /> stop</button>
          : <button className="btn btn-sm btn-primary" disabled={!text.trim()}>Go</button>}
      </form>
      {err ? <div className="text-[12px] bad mt-1">{err}</div> : null}
    </div>
  );
}

