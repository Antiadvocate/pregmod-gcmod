/** HER ROOM — what she sleeps in, what it does to her, and what you can buy or take away. */
import { useState } from "react";
import { BedDouble } from "lucide-react";
import { useGame } from "../lib/game";
import { useHand } from "../lib/hand";
import { Button, Card, Meter } from "../lib/ui";
import { AXES, TOUCH_COST, type RoomAxis } from "../data/rooms";
import { EXTRA_BY_ID } from "../data/rooms";
import { addTouch, changeRoom, comfort, levelDef, roomOf, roomOptions, roomUpkeep } from "../engine/rooms";
import { Reaction } from "./MomentCard";

const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;

export default function RoomCard({ id }: { id: string }) {
  const { save } = useGame();
  const mutate = useHand("people");
  const [open, setOpen] = useState(false);
  const [touch, setTouch] = useState("");
  const [said, setSaid] = useState<{ line: string; what: string } | null>(null);
  const p = save.people[id];
  if (!p || (p.status !== "owned" && p.status !== "indentured")) return null;
  const r = p.room ? roomOf(p) : undefined;
  const c = comfort(p);
  const opts = roomOptions(save, p);
  const axes = Object.keys(AXES) as RoomAxis[];

  const doIt = (what: string, fn: () => string) => { let line = ""; mutate(() => { line = fn(); }); if (line) setSaid({ line, what }); };

  return (
    <Card>
      <button className="w-full text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2 mb-1.5">
          <BedDouble size={14} className="acc" />
          <span className="text-[14px] flex-1">Her room</span>
          <span className="text-[11px] dim">{roomUpkeep(p) ? `${money(roomUpkeep(p))}/wk` : "no upkeep"}</span>
        </div>
        <div className="text-[12.5px] mid font-prose">
          {axes.map((a) => levelDef(a, r?.levels[a] ?? 0).name).join(", ")}
          {r?.extras.length ? `. ${r.extras.map((x) => EXTRA_BY_ID[x]?.name).filter(Boolean).join(", ")}` : ""}
          {r?.touches.length ? `. ${r.touches.map((t) => t.text).join(", ")}` : ""}.
        </div>
        <div className="mt-2"><Meter value={c} range={[-8, 18]} label="how it is for her" /></div>
      </button>
      {said ? (
        <div className="mt-2">
          <p className="text-[13px] acc">{said.line}</p>
          <Reaction seed={{ person: id, title: "Her room", source: "room", you: said.what, happened: said.line }} />
        </div>
      ) : null}
      {open ? (
        <div className="mt-3 space-y-3 fade-in">
          {axes.map((a) => {
            const here = opts.filter((o) => o.kind === "axis" && o.axis === a);
            return (
              <div key={a}>
                <div className="text-[11px] uppercase tracking-wider dim mb-1">{AXES[a].name}</div>
                <div className="flex flex-wrap gap-1.5">
                  {here.map((o) => {
                    const up = (o.level ?? 0) > (r?.levels[a] ?? 0);
                    return (
                      <Button key={`${a}${o.level}`} size="sm" kind={up ? undefined : "ghost"} disabled={!!o.blocked} title={o.blocked}
                        onClick={() => doIt(up ? `You give her ${o.name}.` : `You take her down to ${o.name}.`, () => changeRoom(save, p, { axis: a, level: o.level }))}>
                        {up ? "↑" : "↓"} {o.name}{up && o.cost ? ` · ${money(o.cost)}` : ""}{o.blocked ? ` · ${o.blocked}` : ""}
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div>
            <div className="text-[11px] uppercase tracking-wider dim mb-1">Things of her own</div>
            <div className="space-y-1">
              {opts.filter((o) => o.kind === "extra" || o.kind === "remove").map((o) => (
                <button key={o.id} className="choice !py-2" disabled={!!o.blocked}
                  onClick={() => doIt(o.kind === "remove" ? `You have ${o.name} taken out of her room.` : `You have ${o.name} put in her room.`, () => changeRoom(save, p, o.kind === "remove" ? { remove: o.id } : { extra: o.id }))}>
                  <span className="block text-[13px]">{o.kind === "remove" ? "Take away: " : ""}{o.name}{o.kind === "extra" ? ` · ${money(o.cost)}${o.upkeep ? ` + ${money(o.upkeep)}/wk` : ""}` : ""}</span>
                  <span className="block text-[11.5px] dim">{o.blocked ?? o.note}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider dim mb-1">Something personal · {money(TOUCH_COST)}</div>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const t = touch; doIt(`You have ${t} put in her room.`, () => addTouch(save, p, t)); setTouch(""); }}>
              <input className="flex-1 min-w-0" value={touch} onChange={(e) => setTouch(e.target.value)} placeholder="a framed photo of her sister, a rug from home…" />
              <button className="btn btn-sm btn-primary" disabled={!touch.trim()}>add</button>
            </form>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
