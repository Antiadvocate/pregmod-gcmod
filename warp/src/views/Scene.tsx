/**
 * THE SCENE — four channels, and a world that is allowed to say no.
 *
 * The composer's four modes are the one genuinely unguessable thing in the app, so they are
 * labelled rather than hidden behind a syntax:
 *
 *   DO      — you act. The world resolves it.
 *   SAY     — the quoted text is spoken aloud, verbatim, and the room answers.
 *   THINK   — interior and silent. Nobody can hear it; it steers the camera and nothing else.
 *   DIRECT  — a note to the narrator about the writing, never dramatised on the page.
 *
 * STRIKE is the veto. When the narrator invents something that breaks the world, striking the turn
 * rolls it back and records a standing correction injected into every later prompt: this did not
 * happen, and never refer to it. A weak model with authority to invent needs a player who can say
 * no and have it stick.
 */
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Undo2, X } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Chip, cx } from "../lib/ui";
import type { ActionMode } from "../engine/types";
import { runTurn } from "../engine/turn";
import { rollback } from "../engine/state";
import { modelsAvailable } from "../config";
import { band } from "../engine/psyche";

const MODES: { id: ActionMode; label: string; hint: string }[] = [
  { id: "do", label: "do", hint: "you act; the world resolves it" },
  { id: "say", label: "say", hint: "spoken aloud, exactly as typed" },
  { id: "think", label: "think", hint: "silent; nobody in the room hears it" },
  { id: "story", label: "direct", hint: "a note to the narrator, never on the page" },
];

export default function Scene() {
  const { save, mutate, replace } = useGame();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<ActionMode>("do");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [castOpen, setCastOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const turns = save.history.slice(-24);
  const present = save.scene.present.map((id) => save.people[id]).filter(Boolean);
  const household = Object.values(save.people).filter((p) => p.status === "owned" || p.status === "indentured");

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [save.history.length, streaming]);

  async function send() {
    const action = text.trim();
    if (!action || busy) return;
    setBusy(true);
    setText("");
    setStreaming("");
    setNotes([]);
    const res = await runTurn(save, action, mode, { onDelta: (c) => setStreaming((p) => p + c) });
    setStreaming("");
    setNotes(res.notes);
    mutate(() => {});
    setBusy(false);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 hairline flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[11px] dim shrink-0 font-mono">{save.scene.location}</span>
        {present.map((p) => (
          <Chip key={p.id} on title={`${band(p.psyche)} · ${p.bond.read.label}`}>{p.name}</Chip>
        ))}
        <Button size="sm" kind="ghost" onClick={() => setCastOpen((v) => !v)}>{castOpen ? "done" : "who is here"}</Button>
      </div>

      {castOpen ? (
        <div className="px-4 py-3 hairline flex flex-wrap gap-1.5 shrink-0">
          {household.map((p) => (
            <Chip key={p.id} on={save.scene.present.includes(p.id)}
              onClick={() => mutate((s) => {
                if (s.scene.present.includes(p.id)) s.scene.present = s.scene.present.filter((x) => x !== p.id);
                else { s.scene.present.push(p.id); s.scene.arrivals_pending.push(p.id); }
              })}>
              {p.name}
            </Chip>
          ))}
          <span className="w-full text-[11px] dim mt-1">
            Adding somebody marks them as arriving, so the narrator writes them coming in rather than having them
            already there.
          </span>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        {!turns.length ? (
          <p className="dim text-[13px] font-prose">
            Nothing has happened yet. Type what you do. {modelsAvailable() ? "" : "No model is configured, so you will get a stage direction instead of prose — everything else still runs."}
          </p>
        ) : null}
        {turns.map((t) => (
          <div key={t.turn} className="mb-6">
            {t.action ? (
              <div className="player-line">
                {t.mode === "say" ? <>&ldquo;{t.action}&rdquo;</> : t.mode === "think" ? <em>{t.action}</em> : t.mode === "story" ? <span className="dim">[{t.action}]</span> : t.action}
              </div>
            ) : null}
            <div className={t.bookkeeping === "offline" ? "stage" : "prose-stream"}>
              {t.prose.split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
            <div className="flex items-center gap-2 mt-1.5 opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-[10.5px] dim font-mono">
                turn {t.turn} · {t.bookkeeping}{t.cost ? ` · ¤${t.cost.toFixed(3)}` : ""}
              </span>
              <button className="text-[10.5px] dim hover:bad flex items-center gap-1"
                onClick={() => {
                  const why = prompt("Strike this turn. What was never true?", t.summary);
                  if (!why) return;
                  const restored = rollback(save);
                  if (restored) {
                    restored.retcons.push({ text: why, week: restored.arcology.week, kind: "veto" });
                    replace(restored);
                  }
                }}>
                <X size={10} /> strike
              </button>
            </div>
          </div>
        ))}
        {streaming ? (
          <div className="prose-stream opacity-80">{streaming.split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)}</div>
        ) : null}
        {notes.length ? (
          <div className="card-2 p-3 text-[11.5px] mid space-y-1">
            {notes.map((n, i) => <div key={i}>· {n}</div>)}
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="px-4 py-3 hairline shrink-0" style={{ borderTop: "1px solid var(--line)", borderBottom: "none" }}>
        <div className="flex gap-1.5 mb-2">
          {MODES.map((m) => (
            <Chip key={m.id} on={mode === m.id} onClick={() => setMode(m.id)} title={m.hint}>{m.label}</Chip>
          ))}
          {save.history.length ? (
            <button className="chip ml-auto" title="undo the last turn"
              onClick={() => { const r = rollback(save); if (r) replace(r); }}>
              <Undo2 size={11} /> undo
            </button>
          ) : null}
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send(); }}
            rows={2}
            placeholder={MODES.find((m) => m.id === mode)!.hint}
            className="resize-none font-prose text-[15px]"
          />
          <Button kind="primary" onClick={send} disabled={busy || !text.trim()}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
