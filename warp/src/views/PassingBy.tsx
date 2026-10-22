/**
 * Someone walks past while you're home. One line from the game about what she's doing, her face
 * and body on screen, and a tap to use her right there: the act happens, the numbers move, and
 * the game's own words say how it went. No model unless you ask it to play the thing out.
 */
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useGame } from "../lib/game";
import { Button } from "../lib/ui";
import { passingBy } from "../engine/passing";
import { resolveAct } from "../engine/intimacy";
import { writeAct } from "../engine/writer";
import { marksForAct } from "../engine/marks";
import { ACT_BY_ID } from "../data/intimacy";
import { allowed, NOT_ALLOWED } from "../engine/kept";
import { applyTreatment } from "../engine/obedience";
import { takeStats, chipsBetween, type Chip } from "../lib/delta";
import SlaveArt from "./SlaveArt";
import MomentCard, { Reaction } from "./MomentCard";
import { AnswerOwn } from "./AnswerOwn";
import { openMoment } from "../engine/moments";
import { modelsAvailable } from "../config";

export default function PassingBy() {
  const { save, mutate } = useGame();
  const [turn, setTurn] = useState(0);
  const [done, setDone] = useState<{ text: string; chips: Chip[]; act: string } | null>(null);
  const [mid, setMid] = useState<string | null>(null);
  const x = passingBy(save, turn);
  if (!x) return null;
  const p = x.person;
  const keeper = save.player.owned_by;
  const mayTouch = p.id === keeper || allowed(save, "others");

  const act = (id: string) => {
    let out: typeof done = null;
    mutate((s) => {
      const her = s.people[p.id];
      const before = takeStats(s, [her.id]);
      const o = resolveAct(s, her, id);
      if ("error" in o) { out = { text: o.error, chips: [], act: id }; return; }
      marksForAct(s, her, ACT_BY_ID[id], !!o.finished);
      // No lead-in: she was walking past, you stopped her, and this is what you did.
      const w = writeAct(s, her, o, { lead: false });
      const body = w.paragraphs.join(" ");
      out = { text: [body.length > 240 ? `${body.slice(0, 220).replace(/\s+\S*$/, "")}…` : body, w.said ? `"${w.said}"` : ""].filter(Boolean).join(" "), chips: chipsBetween(before, takeStats(s, [her.id])), act: ACT_BY_ID[id]?.name ?? id };
    });
    setDone(out);
  };
  const praise = () => {
    let out: typeof done = null;
    mutate((s) => {
      const her = s.people[p.id];
      const before = takeStats(s, [her.id]);
      applyTreatment(her, { kind: "recognition", size: 3, why: "the owner stopped her in the hall to tell her she was doing well" }, s.arcology.week);
      out = { text: `You stop ${p.name.split(" ")[0]} in the hall and tell her she's doing well.`, chips: chipsBetween(before, takeStats(s, [her.id])), act: "praise" };
    });
    setDone(out);
  };
  const next = () => { setDone(null); setMid(null); setTurn((n) => n + 1); };
  // Your own words instead of a tap: the scene is played out from what you said.
  const sayOwn = async (typed: string) => {
    let id = "";
    mutate((s) => { id = openMoment(s, { person: p.id, title: `${p.name.split(" ")[0]}, in the hall`, source: "passing", setup: [x.doing, x.says].filter(Boolean).join(" "), you: typed, happened: "" }); });
    setMid(id);
    setDone({ text: typed, chips: [], act: "own" });
    return "";
  };

  return (
    <div className="card p-3 mb-4 overflow-hidden">
      <div className="flex gap-3 items-end">
        <div key={`${p.id}-${turn}`} className="walk-in shrink-0" style={{ width: 118 }}>
          <SlaveArt person={p} height={150} crop="bust" />
        </div>
        <div className="flex-1 min-w-0 pb-1">
          <div className="text-[10.5px] uppercase tracking-wider dim mb-1">Passing by</div>
          {!done ? (
            <>
              <p className="text-[13.5px] font-prose leading-snug">{x.doing}</p>
              {x.says ? <p className="text-[13px] font-prose mid mt-1">{x.says}</p> : null}
            </>
          ) : (
            <>
              <p className={done.act === "own" ? "player-line !my-0 text-[13.5px]" : "text-[13.5px] font-prose leading-snug"}>{done.text}</p>
              {done.chips.length ? <div className="flex flex-wrap gap-1 mt-1.5">{done.chips.map((c, i) => <span key={i} className={`chip ${c.good ? "good" : "bad"}`}>{c.text}</span>)}</div> : null}
            </>
          )}
        </div>
        <button className="iconbtn self-start" aria-label="next" onClick={next} title="someone else"><ChevronRight size={16} /></button>
      </div>
      {!done ? (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {mayTouch ? x.acts.map((a) => <button key={a.id} className="chip" onClick={() => act(a.id)}>{a.name}</button>) : <span className="text-[11.5px] dim">{NOT_ALLOWED.others(save.people[keeper!]?.name ?? "She")}</span>}
          {mayTouch && p.id !== keeper ? <button className="chip" onClick={praise}>tell her she's doing well</button> : null}
          <button className="chip" onClick={next}>let her go</button>
          {mayTouch && modelsAvailable() ? <div className="basis-full"><AnswerOwn placeholder="or say or do something yourself" onSay={sayOwn} /></div> : null}
        </div>
      ) : mid ? (
        <div>
          <MomentCard id={mid} bare />
          <Button size="sm" kind="ghost" className="mt-2" onClick={next}>next</Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Reaction key={`${p.id}-${turn}-${done.act}`} seed={{ person: p.id, title: done.act, source: "passing", you: `You stop ${p.name.split(" ")[0]} in the hall: ${done.act}.`, happened: done.text }} />
          <Button size="sm" kind="ghost" className="mt-3" onClick={next}>next</Button>
        </div>
      )}
    </div>
  );
}
