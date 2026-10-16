/** ON THE LINE — the conversation panel, for a rival ruler or one of your governors. Your words,
 *  their answer, and anything agreed shown under it as what it actually did. */
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useGame } from "../lib/game";
import { cx } from "../lib/ui";
import { modelsAvailable } from "../config";
import type { TalkResult } from "../engine/talk";

export interface TalkLog { role: string; text: string; week: number }

export default function Talk({ log, who, send, left, ideas, className }: {
  log: TalkLog[];
  who: string;
  send: (text: string) => Promise<TalkResult>;
  left?: number;
  ideas?: string[];
  className?: string;
}) {
  const { mutate } = useGame();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [deals, setDeals] = useState<string[]>([]);

  if (!modelsAvailable()) return <div className={cx("text-[12.5px] dim", className)}>Talking to {who} needs a model. Set one in Settings.</div>;

  const go = async (said: string) => {
    const t = said.trim();
    if (!t || busy) return;
    setBusy(true); setErr(""); setText("");
    const res = await send(t);
    mutate(() => {});
    if (!res.ok) { setErr(res.error ?? "No answer."); setText(t); }
    setDeals(res.deals);
    setBusy(false);
  };

  return (
    <div className={cx("fade-in", className)}>
      <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
        {log.slice(-16).map((l, i) => l.role === "you"
          ? <div key={i} className="player-line !my-1">{l.text}</div>
          : <div key={i}>{l.text.split(/\n\n+/).map((para, j) => <p key={j} className="font-prose text-[14.5px] leading-relaxed" style={{ color: "#e6dfd1" }}>{para}</p>)}</div>)}
        {busy ? <div className="flex items-center gap-2 dim text-[12px]"><Loader2 size={13} className="animate-spin" /> {who} is answering</div> : null}
      </div>
      {deals.length ? <ul className="mt-2 space-y-1">{deals.map((d, i) => <li key={i} className="text-[12.5px] good">· {d}</li>)}</ul> : null}
      {err ? <div className="text-[12px] bad mt-2">{err}</div> : null}
      {ideas?.length && !log.length ? (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {ideas.map((x) => <button key={x} className="chip" onClick={() => setText(x)}>{x}</button>)}
        </div>
      ) : null}
      <form className="flex gap-2 mt-2.5" onSubmit={(e) => { e.preventDefault(); void go(text); }}>
        <input className="flex-1 min-w-0" value={text} onChange={(e) => setText(e.target.value)} placeholder={`Say something to ${who}`} disabled={busy} />
        <button className="btn btn-sm btn-primary" disabled={busy || !text.trim()} aria-label="send"><Send size={13} /></button>
      </form>
      {left !== undefined ? <div className="text-[11px] dim mt-1">{left} more this week</div> : null}
    </div>
  );
}
