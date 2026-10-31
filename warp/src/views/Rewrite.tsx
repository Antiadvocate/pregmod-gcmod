/**
 * A PARAGRAPH YOU CAN REWRITE.
 *
 * Narration with a pencil after it. Write it the way it should have read and it takes the place of
 * what the model wrote, in the scene and in what the next turn is written from (engine/yourvoice).
 */
import { useState } from "react";
import { PenLine } from "lucide-react";
import { Button, cx } from "../lib/ui";
import { getYourVoice, setYourVoice } from "../config";

export function ProsePara({ text, onRewrite, className, style }: { text: string; onRewrite?: (rewrite: string) => void; className?: string; style?: React.CSSProperties }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  if (editing && onRewrite) {
    return (
      <div className="fade-in">
        <textarea className="w-full font-prose text-[15px] leading-relaxed min-h-[110px]" value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
        <div className="flex gap-2 mt-1.5 items-center">
          <Button size="sm" kind="primary" disabled={!draft.trim() || draft.trim() === text.trim()} onClick={() => { onRewrite(draft.trim()); setEditing(false); }}>Keep my version</Button>
          <Button size="sm" kind="ghost" onClick={() => { setEditing(false); setDraft(text); }}>Cancel</Button>
          <span className="text-[11px] dim ml-auto">Yours replaces it, and the narration learns from it.</span>
        </div>
      </div>
    );
  }
  return (
    <p className={cx("font-prose leading-relaxed", className)} style={style}>
      {text}
      {onRewrite ? (
        <button className="ml-1.5 align-baseline dim opacity-50 hover:opacity-100" title="Rewrite this the way it should read" aria-label="rewrite this paragraph" onClick={() => { setDraft(text); setEditing(true); }}>
          <PenLine size={11} className="inline" />
        </button>
      ) : null}
    </p>
  );
}

/** Your writing on or off, by Retry, so the same turn can be had both ways. */
export function VoiceSwitch({ className }: { className?: string }) {
  const [on, setOn] = useState(getYourVoice());
  return (
    <button type="button" className={cx("chip !text-[11px]", on && "on", className)} title="Whether the narration is shown how you write. Flip it and press Retry to have the same turn the other way."
      onClick={() => { setYourVoice(!on); setOn(!on); }}>
      your writing: {on ? "on" : "off"}
    </button>
  );
}
