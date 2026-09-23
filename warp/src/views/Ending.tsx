/**
 * THE END OF THE RUN, read back.
 *
 * Everything you did, the people it happened to, what you were after and whether you got it — then
 * the choice to keep going in the same building or start somewhere else.
 */
import { useGame } from "../lib/game";
import { Button } from "../lib/ui";
import { RoomBackdrop } from "../lib/rooms";

export default function Ending({ onNewRun }: { onNewRun: () => void }) {
  const { save, mutate } = useGame();
  const end = save.run?.ended;
  if (!end || save.run?.continued) return null;
  return (
    <div className="fixed inset-0 z-[70] flex flex-col overflow-y-auto" style={{ background: "var(--ink-0)" }}>
      <div className="relative shrink-0" style={{ height: "26dvh" }}>
        <RoomBackdrop place="penthouse" />
        <div className="absolute inset-x-0 bottom-0 p-5" style={{ background: "linear-gradient(to top, var(--ink-0), transparent)" }}>
          <div className="text-[11px] uppercase tracking-wider acc">week {end.week} · {end.kind === "lost" ? "it's over" : "the end of the run"}</div>
          <h1 className="font-display text-[26px] leading-tight mt-1">{end.title}</h1>
        </div>
      </div>
      <div className="max-w-2xl w-full mx-auto px-5 py-4 space-y-3">
        {end.lines.map((l, i) => (
          <p key={i} className="font-prose text-[16px] leading-relaxed fade-in" style={{ animationDelay: `${Math.min(i, 12) * 0.12}s`, color: "#e6dfd1" }}>{l}</p>
        ))}
        <div className="flex flex-wrap gap-2 pt-4 pb-10">
          <Button kind="primary" onClick={() => mutate((s) => { if (s.run) s.run.continued = true; })}>{end.kind === "lost" ? "Try to hold on anyway" : "Keep playing"}</Button>
          <Button onClick={onNewRun}>Start a new run</Button>
        </div>
      </div>
    </div>
  );
}
