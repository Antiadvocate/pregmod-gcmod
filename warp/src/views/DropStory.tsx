/**
 * "Fuck anything related to this." A storyline the player is done with, ended from the event card:
 * the words it's about and the people in it, gone for good (engine/bans). Settings lists what's been
 * dropped, to bring something back.
 */
import { useMemo, useState } from "react";
import type { PendingEvent } from "../engine/types";
import { useGame } from "../lib/game";
import { Button } from "../lib/ui";
import { dropStoryline, suggestBan } from "../engine/bans";

export function DropStory({ e }: { e: PendingEvent }) {
  const { save, mutate } = useGame();
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sug = useMemo(() => suggestBan(save, e), [e.id]);
  const [words, setWords] = useState(sug.words.join(", "));
  const [who, setWho] = useState<Record<string, boolean>>(() => Object.fromEntries(sug.faces.filter((f) => f.id).map((f) => [f.id!, true])));
  if (!open) return <button className="text-[11.5px] dim underline mt-3 block" onClick={() => setOpen(true)}>Drop this storyline for good</button>;
  const go = () => mutate((s) => {
    dropStoryline(s, s.events.find((x) => x.id === e.id) ?? null, words.split(",").map((w) => w.trim()).filter(Boolean), Object.keys(who).filter((k) => who[k]));
  });
  return (
    <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--ink-2)" }}>
      <div className="text-[12.5px] mb-1.5">Drop it for good. This event goes, and nothing about it, or the people you tick, comes up again in any event or scene.</div>
      <label className="text-[11.5px] dim">What it's about. Anything that mentions these words is gone. Separate them with commas.</label>
      <input className="mt-1 mb-2" value={words} onChange={(ev) => setWords(ev.target.value)} placeholder="laundry, linen" />
      {sug.faces.length ? (
        <div className="mb-2">
          <div className="text-[11.5px] dim mb-1">And these people, never brought into anything again:</div>
          {sug.faces.filter((f) => f.id).map((f) => (
            <label key={f.id} className="flex items-center gap-2 text-[13px] py-0.5 cursor-pointer">
              <input type="checkbox" className="!w-auto" checked={!!who[f.id!]} onChange={(ev) => setWho((w) => ({ ...w, [f.id!]: ev.target.checked }))} />
              {f.name}{f.fate ? <span className="dim text-[11.5px]">({f.fate.fate})</span> : null}
            </label>
          ))}
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button size="sm" kind="danger" disabled={!words.trim() && !Object.values(who).some(Boolean)} onClick={go}>Drop it</Button>
        <Button size="sm" kind="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}
