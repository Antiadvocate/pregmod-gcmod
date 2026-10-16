/**
 * THE END OF THE RUN, read back.
 *
 * With a model, the ending is written from the whole run: the chronicle, the people, the cities your
 * women run. The game's own record sits under it. Without one, the record is the ending. Then the
 * choice to keep going in the same building or start somewhere else.
 */
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useGame } from "../lib/game";
import { Button } from "../lib/ui";
import { RoomBackdrop } from "../lib/rooms";
import { writeEnding } from "../engine/living";
import { modelsAvailable } from "../config";

export default function Ending({ onNewRun }: { onNewRun: () => void }) {
  const { save, mutate } = useGame();
  const end = save.run?.ended;
  const [writing, setWriting] = useState(false);
  const [record, setRecord] = useState(false);
  const tried = useRef(false);
  useEffect(() => {
    if (!end || end.prose || save.run?.continued || tried.current || !modelsAvailable()) return;
    tried.current = true;
    setWriting(true);
    void writeEnding(save).then(() => { mutate(() => {}); setWriting(false); });
  }, [end, save, mutate]);
  if (!end || save.run?.continued) return null;
  const prose = end.prose?.text.split(/\n\n+/) ?? [];
  return (
    <div className="fixed inset-0 z-[70] flex flex-col overflow-y-auto" style={{ background: "var(--ink-0)" }}>
      <div className="relative shrink-0" style={{ height: "26dvh" }}>
        <RoomBackdrop place="penthouse" />
        <div className="absolute inset-x-0 bottom-0 p-5" style={{ background: "linear-gradient(to top, var(--ink-0), transparent)" }}>
          <div className="text-[11px] uppercase tracking-wider acc">week {end.week} · {end.kind === "lost" ? "it's over" : "the end of the run"}</div>
          <h1 className="font-display text-[26px] leading-tight mt-1">{end.prose?.title ?? end.title}</h1>
        </div>
      </div>
      <div className="max-w-2xl w-full mx-auto px-5 py-4 space-y-3">
        {writing ? <div className="flex items-center gap-2 dim text-[13px]"><Loader2 size={14} className="animate-spin" /> Writing how it ended</div> : null}
        {prose.map((l, i) => (
          <p key={i} className="font-prose text-[16px] leading-relaxed fade-in" style={{ animationDelay: `${Math.min(i, 12) * 0.12}s`, color: "#e6dfd1" }}>{l}</p>
        ))}
        {prose.length && !record ? <button className="text-[12px] dim underline" onClick={() => setRecord(true)}>the record</button> : null}
        {!prose.length || record ? end.lines.map((l, i) => (
          <p key={`r${i}`} className={prose.length ? "text-[13.5px] mid" : "font-prose text-[16px] leading-relaxed fade-in"} style={prose.length ? undefined : { animationDelay: `${Math.min(i, 12) * 0.12}s`, color: "#e6dfd1" }}>{l}</p>
        )) : null}
        <div className="flex flex-wrap gap-2 pt-4 pb-10">
          <Button kind="primary" onClick={() => mutate((s) => { if (s.run) s.run.continued = true; })}>{end.kind === "lost" ? "Try to hold on anyway" : "Keep playing"}</Button>
          <Button onClick={onNewRun}>Start a new run</Button>
        </div>
      </div>
    </div>
  );
}
