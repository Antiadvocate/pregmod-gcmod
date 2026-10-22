/**
 * THE OTHER MAN, on screen.
 *
 * Its own room, off to the side of the arcology: her at the top, how much of her is still yours
 * under her, the chapter in the middle, and at the bottom what you do about it, either one of the
 * things you might say or your own words. Every word above the buttons is the model's; this file
 * only lays it out. The chapters before fold up underneath so you can read back how she got here.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, HeartCrack, Loader2, Square } from "lucide-react";
import { useGame } from "../lib/game";
import { active, answer, begin, eligible, ready, type CuckLog, type Ending } from "../engine/cuckold";
import { answerOwn, canWrite, writeChapter, writeOutcome } from "../engine/cuckwriter";
import { POSE_BY_ID, type Pose } from "../lib/rig";
import SlaveArt from "./SlaveArt";
import type { SaveState } from "../engine/types";

const ENDING_NAME: Record<Ending, string> = {
  called_off: "called off",
  reclaimed: "you took her back",
  lost: "you took her back, too late",
  shared: "shared",
  his: "his, and you serve them",
  sold: "sold to him",
  gone: "she's gone",
};

function poseFor(s: SaveState): Pose | undefined {
  const c = s.cuckold;
  if (!c) return undefined;
  if (c.ended?.ending === "his" || c.ended?.ending === "sold") return POSE_BY_ID.dismissive;
  if (c.ended?.ending === "lost") return POSE_BY_ID.curled;
  if (c.fall >= 70) return c.motive === "spite" ? POSE_BY_ID.defiant : POSE_BY_ID.easy;
  if (c.fall >= 35) return c.motive === "for_you" ? POSE_BY_ID.braced : POSE_BY_ID.presenting;
  return c.motive === "for_you" ? POSE_BY_ID.waiting : POSE_BY_ID.offered;
}

function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text.split(/\n\n+/).map((para, i) => (
        <p key={i} className="font-prose text-[15.5px] leading-relaxed fade-in" style={{ color: "#e6dfd1" }}>{para}</p>
      ))}
    </div>
  );
}

function Writing() {
  return <div className="flex items-center gap-2 dim text-[12.5px] py-2"><Loader2 size={13} className="animate-spin" /> writing it…</div>;
}

function Bar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] dim mb-0.5 truncate">{label}</div>
      <div className="meter"><div style={{ width: `${Math.round(value)}%`, background: tone }} /></div>
    </div>
  );
}

function Past({ l }: { l: CuckLog }) {
  return (
    <div className="card-2 p-3 space-y-2">
      <div className="text-[11px] uppercase tracking-wider dim">week {l.week} · {l.title}</div>
      <Prose text={l.scene} />
      <div className="player-line !my-2">{l.chose}</div>
      {l.text ? <Prose text={l.text} /> : null}
    </div>
  );
}

/** A small card for the Penthouse when a chapter is waiting. */
export function CuckoldNotice({ onOpen }: { onOpen: () => void }) {
  const { save } = useGame();
  if (!ready(save) || !canWrite(save)) return null;
  const c = save.cuckold!;
  const her = save.people[c.her];
  if (!her) return null;
  return (
    <button className="card p-3 mb-4 w-full text-left press flex items-center gap-2.5" onClick={onOpen}>
      <HeartCrack size={15} className="acc shrink-0" />
      <span className="min-w-0 flex-1 text-[13.5px]">{her.name}{c.bull ? ` and ${c.bull.short}` : ""}: {c.chapter?.title ?? "the next chapter"}</span>
      <ChevronRight size={15} className="dim shrink-0" />
    </button>
  );
}

/** The button on her page, and what it says. Null when it shouldn't show. */
export function cuckoldButton(s: SaveState, id: string): string | null {
  const c = s.cuckold;
  if (c && c.her === id && (active(s) || c.ended)) return c.bull ? `Her and ${c.bull.short}` : "The other man";
  const p = s.people[id];
  if (!p || eligible(s, p)) return null;
  return "Give her to another man";
}

export default function Cuckold({ id, onClose }: { id: string; onClose: () => void }) {
  const { save, mutate } = useGame();
  const p = save.people[id];
  const c = save.cuckold && save.cuckold.her === id ? save.cuckold : undefined;
  const [back, setBack] = useState(false);
  const [writing, setWriting] = useState<"chapter" | "outcome" | "reading" | null>(null);
  const [err, setErr] = useState("");
  const [own, setOwn] = useState("");
  const stopper = useRef<AbortController | null>(null);
  const model = canWrite(save);
  const week = save.arcology.week;
  const last = c?.log.at(-1);
  const due = !!c && ready(save);
  // What needs writing next, if anything: the outcome you're waiting on, then the next chapter.
  const need: "outcome" | "chapter" | null = !c || !model ? null
    : last && !last.text ? "outcome"
    : due && !c.chapter ? "chapter" : null;

  async function run(kind: "chapter" | "outcome" | "reading", job: (signal: AbortSignal) => Promise<{ ok: boolean; error?: string }>) {
    const ctl = new AbortController();
    stopper.current = ctl;
    setWriting(kind); setErr("");
    // Whatever goes wrong, the screen hears that it's over. A write that throws used to leave it
    // on "writing it…" for good.
    const r = await job(ctl.signal).catch((e: unknown) => ({ ok: false, error: e instanceof Error ? e.message : String(e) }));
    stopper.current = null;
    setWriting(null);
    if (ctl.signal.aborted) setErr("stopped");
    else if (!r.ok) setErr(r.error ?? "the model couldn't write this");
    mutate(() => {});
  }
  useEffect(() => {
    if (!need || writing || err) return;
    void run(need, (sig) => (need === "outcome" ? writeOutcome(save, sig) : writeChapter(save, sig)));
  }, [need, writing, err]);

  if (!p) return null;
  const why = eligible(save, p);

  const pick = (i: number) => {
    const ch = c?.chapter?.choices[i];
    if (ch) mutate((s) => { answer(s, ch); });
  };
  const sayOwn = () => {
    const t = own.trim();
    if (!t) return;
    void run("reading", async (sig) => { const r = await answerOwn(save, t, sig); if (r.ok) setOwn(""); return r; });
  };

  const past = c ? c.log.slice(0, c.chapter ? undefined : -1) : [];
  const showLast = !!c && !c.chapter && !!last;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: "var(--ink-0)" }}>
      <header className="topbar flex items-center gap-2 px-2 py-2 shrink-0" style={{ paddingTop: "max(8px, env(safe-area-inset-top))" }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="back"><ChevronLeft size={18} /></button>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] leading-tight truncate">{p.name}{c?.bull ? ` and ${c.bull.name}` : ""}</div>
          <div className="text-[11px] dim truncate">
            {c?.ended ? ENDING_NAME[c.ended.ending] : c ? `${c.nights} night${c.nights === 1 ? "" : "s"} with him · since week ${c.started}` : "the other man"}
          </div>
        </div>
      </header>

      <div className="stage-room shrink-0 relative flex justify-center" style={{ height: "26dvh" }}>
        <div className="h-full relative"><SlaveArt person={p} height="100%" pose={poseFor(save)} /></div>
      </div>

      {c ? (
        <div className="grid grid-cols-3 gap-3 px-4 py-2 hairline-top shrink-0" style={{ background: "var(--ink-1)" }}>
          <Bar label="still yours" value={(c.pull + 100) / 2} tone="var(--accent)" />
          <Bar label="gone to him" value={c.fall} tone="var(--danger)" />
          <Bar label="how far you've gone" value={c.yielded} tone="var(--warn)" />
        </div>
      ) : null}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4">
        {!c ? (
          <div className="text-[13.5px] space-y-2">
            <p>Give {p.name} to another man, one you choose, a little more every week, and watch what she becomes.</p>
            <p className="dim text-[12.5px]">The model writes all of it, from her and from you. You can answer each chapter in your own words.</p>
            {why ? <p className="bad text-[12.5px]">{why}.</p> : null}
            {!model ? <p className="bad text-[12.5px]">Needs a model set up in Settings.</p> : null}
          </div>
        ) : null}

        {past.length ? (
          <div>
            <button className="foldhead" aria-expanded={back} onClick={() => setBack((v) => !v)}>
              {back ? <ChevronDown size={13} /> : <ChevronRight size={13} />} So far <span className="fold-count">{past.length}</span>
            </button>
            {back ? <div className="space-y-3 mt-2">{past.map((l, i) => <Past key={i} l={l} />)}</div> : null}
          </div>
        ) : null}

        {showLast && last ? (
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider dim">week {last.week} · {last.title}</div>
            <div className="player-line !my-1">{last.chose}</div>
            {last.text ? <Prose text={last.text} /> : writing === "outcome" ? <Writing /> : null}
          </div>
        ) : null}

        {c?.chapter ? (
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider dim">week {c.chapter.week} · {c.chapter.title}</div>
            <Prose text={c.chapter.scene} />
          </div>
        ) : null}

        {writing === "chapter" || writing === "reading" ? <Writing /> : null}
        {err && !writing ? (
          <div className="text-[12.5px]"><span className="bad">{err}.</span> <button className="acc underline" onClick={() => setErr("")}>try again</button></div>
        ) : null}

        {c && !c.ended && !c.chapter && !due && last?.text ? (
          <div className="card-2 p-3 text-[13px] dim">
            The next chapter comes in {c.due - week} week{c.due - week === 1 ? "" : "s"}.{c.seeing ? ` Until then she goes to ${c.bull?.short} on her own nights.` : ""}
          </div>
        ) : null}
        {c?.ended && last?.text ? (
          <div className="text-[12px] dim">
            {c.ended.ending === "shared" || c.ended.ending === "his" ? `She still goes to ${c.bull?.short ?? "him"}; the week report counts the nights.` : "It's over. You could start this again with another woman, from her page."}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 hairline-top px-3 py-3 space-y-1.5 overflow-y-auto" style={{ background: "var(--ink-1)", paddingBottom: "max(12px, env(safe-area-inset-bottom))", maxHeight: "46dvh" }}>
        {!c ? (
          <button className="btn btn-primary w-full" disabled={!!why || !model} onClick={() => mutate((s) => { const her = s.people[id]; if (her) begin(s, her); })}>Ask her</button>
        ) : writing ? (
          <button className="btn w-full" onClick={() => stopper.current?.abort()}><Square size={12} /> stop</button>
        ) : c.chapter && !c.ended ? (
          <>
            {c.chapter.choices.map((o, i) => (
              <button key={i} className="choice !py-2 w-full text-left" onClick={() => pick(i)}>
                <span className="block text-[13.5px] leading-snug">{o.label}</span>
                {o.man ? <span className="block text-[11px] dim mt-0.5">{o.man.name}, {o.man.age}. {o.man.who}</span> : null}
              </button>
            ))}
            <form className="flex gap-2 pt-1.5" onSubmit={(e) => { e.preventDefault(); sayOwn(); }}>
              <input className="flex-1 min-w-0" value={own} onChange={(e) => setOwn(e.target.value)} placeholder="or say or do something yourself" />
              <button className="btn btn-sm btn-primary" disabled={!own.trim()}>Go</button>
            </form>
          </>
        ) : (
          <button className="btn w-full" onClick={onClose}>Leave it for now</button>
        )}
      </div>
    </div>
  );
}
