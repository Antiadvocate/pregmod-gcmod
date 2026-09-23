/** What this run is after, and how far along it is. */
import { Check } from "lucide-react";
import { useGame } from "../lib/game";
import { AMBITION_BY_ID, TWIST_BY_ID } from "../engine/run";
import { cx } from "../lib/ui";

export default function Ambitions({ twists = true }: { twists?: boolean }) {
  const { save } = useGame();
  const run = save.run;
  if (!run) return null;
  return (
    <div className="space-y-1.5">
      {run.ambitions.map((a) => {
        const def = AMBITION_BY_ID[a.id];
        if (!def) return null;
        return (
          <div key={a.id} className={cx("card-2 px-3 py-2 flex items-center gap-3", !!a.met && "opacity-80")}>
            <span className={cx("grid place-items-center shrink-0 rounded-full", a.met ? "good" : "dim")} style={{ width: 20, height: 20, border: "1px solid var(--line-strong)" }}>
              {a.met ? <Check size={12} /> : null}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px]">{def.title}</span>
              <span className="block text-[11px] dim">{a.met ? `done in week ${a.met}` : def.progress(save)}</span>
            </span>
          </div>
        );
      })}
      {twists && run.twists.length ? (
        <div className="text-[11.5px] dim pt-1">This run: {run.twists.map((t) => TWIST_BY_ID[t]?.name).join(", ")}. {Math.max(0, run.length - save.arcology.week)} weeks left of {run.length}.</div>
      ) : <div className="text-[11.5px] dim pt-1">{Math.max(0, run.length - save.arcology.week)} weeks left of {run.length}.</div>}
    </div>
  );
}
