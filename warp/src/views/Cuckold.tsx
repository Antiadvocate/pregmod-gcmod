/**
 * THE OTHER MAN, on screen.
 *
 * Its own room, off to the side of the arcology: her at the top, how much of her is still yours
 * under her, the chapter in the middle and what you do about it at the bottom, where a thumb is.
 * The chapters before this one fold up underneath, so you can read back how she got here.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, HeartCrack, Loader2, RotateCcw, Square } from "lucide-react";
import { canWrite, writeChapter, writeOutcome } from "../engine/cuckwriter";
import { useGame } from "../lib/game";
import { cx } from "../lib/ui";
import { active, begin, eligible, ready } from "../engine/cuckold";
import { answerBeat, beatNow, cx as contextOf, ENDING_NAME, yoursShare, type Answered } from "../data/cuckold";
import { POSE_BY_ID, type Pose } from "../lib/rig";
import SlaveArt from "./SlaveArt";
import type { SaveState } from "../engine/types";

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

/** A small card for the Penthouse when a chapter is waiting. */
export function CuckoldNotice({ onOpen }: { onOpen: () => void }) {
  const { save } = useGame();
  if (!ready(save)) return null;
  const b = beatNow(save);
  const her = save.people[save.cuckold!.her];
  if (!b || !her) return null;
  return (
    <button className="card p-3 mb-4 w-full text-left press flex items-center gap-2.5" onClick={onOpen}>
      <HeartCrack size={15} className="acc shrink-0" />
      <span className="min-w-0 flex-1 text-[13.5px]">{her.name}{save.cuckold!.bull ? ` and ${save.cuckold!.bull.short}` : ""}: {b.title}</span>
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
  const [last, setLast] = useState<Answered | null>(null);
  const [back, setBack] = useState(false);
  const [writing, setWriting] = useState<"chapter" | "outcome" | null>(null);
  const [err, setErr] = useState("");
  // The game's own words for this chapter, because you asked for them or the model wouldn't.
  const [plain, setPlain] = useState<string | null>(null);
  const stopper = useRef<AbortController | null>(null);
  // Built fresh every render: the save is mutated in place, so a memo would keep last chapter's man.
  const x = c ? contextOf(save) : null;
  const week = save.arcology.week;
  const beat = c && !c.ended ? beatNow(save) : undefined;
  const canRead = !!beat && c!.due <= week;
  const model = canWrite(save);
  const written = !!beat && c?.written?.beat === beat.id ? c.written : undefined;
  const wantWrite = model && canRead && !!beat && !written && plain !== beat.id && !last && !writing && !err;

  async function write() {
    const ctl = new AbortController();
    stopper.current = ctl;
    setWriting("chapter"); setErr("");
    const r = await writeChapter(save, ctl.signal);
    stopper.current = null;
    setWriting(null);
    if (ctl.signal.aborted) { if (beat) setPlain(beat.id); return; }
    if (!r.ok) setErr(r.error ?? "the model couldn't write this chapter");
    mutate(() => {});
  }
  useEffect(() => { if (wantWrite) void write(); }, [wantWrite]);

  if (!p) return null;
  const why = eligible(save, p);

  const choose = async (opt: string) => {
    let got: Answered | null = null;
    mutate((s) => { got = answerBeat(s, opt); });
    setLast(got); setErr(""); setPlain(null);
    if (!got || !model) return;
    const ctl = new AbortController();
    stopper.current = ctl;
    setWriting("outcome");
    const text = await writeOutcome(save, ctl.signal);
    stopper.current = null;
    setWriting(null);
    mutate(() => {});
    if (text) setLast({ ...(got as Answered), text });
  };
  const rewrite = () => { mutate((s) => { if (s.cuckold) delete s.cuckold.written; }); setErr(""); setPlain(null); };

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

      <div className="stage-room shrink-0 relative flex justify-center" style={{ height: "30dvh" }}>
        <div className="h-full relative"><SlaveArt person={p} height="100%" pose={poseFor(save)} /></div>
      </div>

      {c ? (
        <div className="grid grid-cols-3 gap-3 px-4 py-2 hairline-top shrink-0" style={{ background: "var(--ink-1)" }}>
          <Bar label="still yours" value={yoursShare(c)} tone="var(--accent)" />
          <Bar label="gone to him" value={c.fall} tone="var(--danger)" />
          <Bar label="how far you've gone" value={c.yielded} tone="var(--warn)" />
        </div>
      ) : null}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4">
        {!c ? (
          <>
            <Prose text={`You could give ${p.name} to someone else.\n\nNot sell her. Give her: to one man, chosen by you, a little more every week, while you watch, and listen, and find out what she becomes when she's with somebody who isn't you. She'll go to him on her own nights between the chapters. She'll come back. For a while.\n\nShe'll agree. Why she agrees is something you'll find out when you ask her.`} />
            {why ? <div className="text-[12.5px] bad">{why}.</div> : null}
          </>
        ) : null}

        {c && c.log.length ? (
          <div>
            <button className="foldhead" aria-expanded={back} onClick={() => setBack((v) => !v)}>
              {back ? <ChevronDown size={13} /> : <ChevronRight size={13} />} So far <span className="fold-count">{c.log.length}</span>
            </button>
            {back ? (
              <div className="space-y-4 mt-2">
                {c.log.map((l, i) => (
                  <div key={i} className="card-2 p-3">
                    <div className="text-[11px] uppercase tracking-wider dim">week {l.week} · {l.title}</div>
                    {l.setup ? <Prose text={l.setup} /> : null}
                    <div className="player-line !my-2">{l.chose}</div>
                    <Prose text={l.text} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {last ? (
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider dim">{last.title}</div>
            <div className="player-line !my-1">{last.chose}</div>
            {writing === "outcome" ? <Writing /> : <Prose text={last.text} />}
          </div>
        ) : null}

        {c?.ended && !last ? (
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider dim">{ENDING_NAME[c.ended.ending]} · week {c.ended.week}</div>
            <Prose text={c.ended.text} />
          </div>
        ) : null}
        {c?.ended && (c.ended.ending === "shared" || c.ended.ending === "his") ? (
          <div className="text-[12px] dim">She still goes to {c.bull?.short ?? "him"}. The week report tells you how many nights.</div>
        ) : null}
        {c?.ended && !(c.ended.ending === "shared" || c.ended.ending === "his") ? (
          <div className="text-[12px] dim">It's over. You could start this again with another woman from her page; not with {p.name}.</div>
        ) : null}

        {c && !c.ended && beat && canRead && x && !last ? (
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-wider dim flex items-center gap-2">
              <span className="flex-1">week {week} · {beat.title}</span>
              {model && !writing ? <button className="dim flex items-center gap-1 normal-case tracking-normal" onClick={rewrite} title="Have the model write this chapter again"><RotateCcw size={11} /> rewrite</button> : null}
            </div>
            {writing === "chapter" ? <Writing /> : <Prose text={written?.scene ?? beat.text(x)} />}
            {err && !writing ? (
              <div className="text-[12px]">
                <span className="bad">{err}. This is the game's own version.</span>{" "}
                <button className="acc underline" onClick={() => setErr("")}>try the model again</button>
              </div>
            ) : null}
          </div>
        ) : null}

        {c && !c.ended && beat && !canRead ? (
          <div className="card-2 p-3 text-[13px]">
            <div><span className="dim">Next:</span> {beat.title}, in {c.due - week} week{c.due - week === 1 ? "" : "s"}.</div>
            {c.seeing ? <div className="dim text-[12px] mt-1">Until then she goes to {c.bull?.short} on her own nights.</div> : null}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 hairline-top px-3 py-3 space-y-1.5" style={{ background: "var(--ink-1)", paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        {!c ? (
          <button className="btn btn-primary w-full" disabled={!!why} onClick={() => mutate((s) => { const her = s.people[id]; if (her) begin(s, her); })}>Ask her</button>
        ) : writing ? (
          <button className="btn w-full" onClick={() => stopper.current?.abort()}><Square size={12} /> {writing === "chapter" ? "stop, and read the game's own version" : "stop, and keep the game's own version"}</button>
        ) : last && !c.ended && canRead ? (
          <button className="btn btn-primary w-full" onClick={() => setLast(null)}>Go on</button>
        ) : c && !c.ended && beat && canRead && x ? (
          beat.options(x).map((o) => {
            const lock = o.locked?.(x) ?? null;
            return (
              <button key={o.id} className={cx("choice !py-2 w-full text-left", lock && "locked")} disabled={!!lock} onClick={() => void choose(o.id)}>
                <span className="block text-[13.5px] leading-snug">{written?.labels[o.id] ?? o.label}</span>
                {lock ? <span className="block text-[11px] bad mt-0.5">{lock}</span> : o.hint ? <span className="block text-[11px] dim mt-0.5">{o.hint}</span> : null}
              </button>
            );
          })
        ) : (
          <button className="btn w-full" onClick={onClose}>Leave it for now</button>
        )}
      </div>
    </div>
  );
}
