/**
 * THE BEAT WAITING ON YOU.
 *
 * The scene, then the choices, then what came of the one you took — all in the same card, so the
 * answer is where you tapped. A choice that needs one of your people opens a picker in place.
 */
import { useState } from "react";
import { BookOpen, Lock } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Card, cx } from "../lib/ui";
import { answer, arcDef, optionsFor, pendingBeat, pickable, type Answer, type OptionView } from "../engine/story";
import { valuePerson } from "../engine/economy";
import { SlaveHead } from "./SlaveArt";
import { Reaction } from "./MomentCard";

export default function StoryCard() {
  const { save, mutate } = useGame();
  const [done, setDone] = useState<Answer | null>(null);
  const [picking, setPicking] = useState<OptionView | null>(null);
  const p = pendingBeat(save);

  if (done) {
    return (
      <Card className="mb-6 border-l-2 fade-in" >
        <div className="text-[11px] uppercase tracking-wider acc mb-1.5 flex items-center gap-1.5"><BookOpen size={12} /> {done.title}</div>
        <div className="player-line !mt-1 !mb-3">{done.chose}</div>
        <Prose text={done.text} />
        {done.consequences.length ? (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {done.consequences.map((c, i) => <span key={i} className={cx("chip", /^−|less|cools|falls|dead|sold|gone/.test(c) ? "bad" : /^\+|warms|rises|better|heart|joins/.test(c) ? "good" : "")}>{c}</span>)}
          </div>
        ) : null}
        <Reaction key={`${done.title}:${done.chose}`} auto={!!done.person} label={done.person ? "Answer her" : "Play it out"} seed={{ person: done.person, title: done.title, source: "story", you: done.chose, happened: done.text }} />
        {done.ended ? <div className="text-[12px] dim mt-3">That's the end of that story: {done.ended}.</div> : null}
        <Button kind="primary" size="sm" className="mt-4" onClick={() => setDone(null)}>{pendingBeat(save) ? "Go on" : "Done"}</Button>
      </Card>
    );
  }
  if (!p) return null;

  const title = typeof p.beat.title === "function" ? p.beat.title(p.c) : p.beat.title;
  const opts = optionsFor(save);
  const choose = (o: OptionView, who?: string) => {
    let a: Answer | null = null;
    mutate((s) => { a = answer(s, o.id, who); });
    setPicking(null);
    if (a) setDone(a);
  };

  return (
    <Card className="mb-6 border-l-2 fade-in">
      <div className="text-[11px] uppercase tracking-wider acc mb-1 flex items-center gap-1.5"><BookOpen size={12} /> {arcDef(p.def.id)?.title}</div>
      <h2 className="font-display text-[19px] leading-tight mb-3">{title}</h2>
      <Prose text={p.beat.text(p.c)} />
      <div className="mt-4 space-y-2">
        {opts.map((o) => (
          <div key={o.id}>
            <button disabled={!!o.locked} onClick={() => (o.pick ? setPicking(picking?.id === o.id ? null : o) : choose(o))}
              className={cx("choice", o.locked && "locked", picking?.id === o.id && "on")}>
              <span className="block text-[14px] leading-snug">{o.label}</span>
              {o.locked ? <span className="flex items-center gap-1 text-[11px] bad mt-0.5"><Lock size={10} /> {o.locked}</span>
                : o.note ? <span className="block text-[11.5px] dim mt-0.5">{o.note}</span> : null}
            </button>
            {picking?.id === o.id ? <Picker o={o} onPick={(id) => choose(o, id)} /> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}

function Picker({ o, onPick }: { o: OptionView; onPick: (id: string) => void }) {
  const { save } = useGame();
  const who = pickable(save, o.id);
  if (!who.length) return <div className="text-[12px] dim px-3 py-2">Nobody fits.</div>;
  return (
    <div className="card-2 p-2 mt-1.5 fade-in">
      <div className="text-[10.5px] uppercase tracking-wider dim px-1 mb-1.5">{o.pick?.label}</div>
      <div className="grid grid-cols-1 gap-1.5">
        {who.map((p) => (
          <button key={p.id} onClick={() => onPick(p.id)} className="actbtn flex items-center gap-2.5">
            <SlaveHead person={p} size={34} />
            <span className="flex-1 min-w-0">
              <span className="block text-[13px]">{p.name}</span>
              <span className="block text-[10.5px] dim truncate">{p.age} · {p.bond.read.label} · worth ¤{Math.round(valuePerson(save, p)).toLocaleString()}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text.split(/\n\n+/).map((para, i) => <p key={i} className="font-prose text-[15.5px] leading-relaxed" style={{ color: "#e6dfd1" }}>{para}</p>)}
    </div>
  );
}
