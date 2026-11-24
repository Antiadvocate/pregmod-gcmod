/**
 * INSIDE THE ARCOLOGY — the floors, the rooms on them, who's in each at this part of the day.
 *
 * Tap a room: who's there morning to night, what's in it and whose, how clean it is, who's allowed
 * in, what's happened there. Put things in it, take them out, have it scrubbed, close it off, or go
 * and find somebody in it. See engine/spaces for what all of it does.
 */
import { useMemo, useState } from "react";
import { useGame } from "../lib/game";
import { useHand } from "../lib/hand";
import { Button, Card, Sheet } from "../lib/ui";
import { cx } from "../lib/ui";
import {
  ACCESS_LABEL, AWAY, CLEAN_COST, FLOOR_LABEL, FLOORS, ITEM_COST, PART_LABEL, PARTS,
  addItem, cleanSpace, liveSpaces, occupants, partAt, removeItem, scheduleOf, setAccess,
  type Access, type Part, type Space,
} from "../engine/spaces";
import type { Person } from "../engine/types";
import { SlaveHead } from "./SlaveArt";
import Interact from "./Interact";

const condWord = (c: number) => (c < 20 ? "filthy" : c < 45 ? "grubby" : c < 75 ? "lived-in" : c < 90 ? "clean" : "spotless");
const condTone = (c: number) => (c < 30 ? "var(--bad, #c0504d)" : c < 60 ? "var(--warn, #c9a227)" : "var(--good, #6aa86a)");

export default function Inside() {
  const { save } = useGame();
  const [part, setPart] = useState<Part>(() => partAt(save.scene?.time));
  const [open, setOpen] = useState<string | null>(null);
  const [withId, setWithId] = useState<string | null>(null);
  const spaces = useMemo(() => liveSpaces(save), [save, save.arcology.week]);
  const sch = scheduleOf(save);
  const away = Object.values(save.people).filter((p) => sch.at[p.id]?.[part] === AWAY);
  const x = open ? save.spaces?.[open] : undefined;

  return (
    <>
      <div className="flex flex-wrap gap-1 mb-3">
        {PARTS.map((p) => (
          <Button key={p} size="sm" kind={part === p ? "primary" : "ghost"} onClick={() => setPart(p)}>{PART_LABEL[p]}</Button>
        ))}
      </div>
      {FLOORS.map((f) => {
        const here = spaces.filter((s) => s.floor === f);
        if (!here.length) return null;
        return (
          <div key={f} className="mb-4">
            <div className="text-[11px] uppercase tracking-wider dim mb-1.5">{FLOOR_LABEL[f]}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {here.map((s) => <Tile key={s.id} x={s} people={occupants(save, s.id, part)} onOpen={() => setOpen(s.id)} />)}
            </div>
          </div>
        );
      })}
      {away.length ? <div className="text-[12px] dim mb-4">Out of the building this {part}: {away.map((p) => p.name.split(" ")[0]).join(", ")}.</div> : null}
      <Sheet open={!!x} onClose={() => setOpen(null)} title={x ? cap(x.name) : ""}>
        {x ? <SpaceSheet x={x} part={part} onBeWith={(id) => { setOpen(null); setWithId(id); }} /> : null}
      </Sheet>
      {withId && save.people[withId] ? <Interact id={withId} onClose={() => setWithId(null)} /> : null}
    </>
  );
}

function Tile({ x, people, onOpen }: { x: Space; people: Person[]; onOpen: () => void }) {
  const full = people.length > x.capacity;
  return (
    <Card className="min-w-0 cursor-pointer !p-2.5" onClick={onOpen}>
      <div className="flex items-baseline justify-between gap-1">
        <div className="text-[13px] font-medium truncate">{cap(x.name)}</div>
        <div className={cx("text-[11px] shrink-0", full ? "warn" : "dim")}>{people.length}/{x.capacity}</div>
      </div>
      <div className="h-1 rounded mt-1 mb-1.5" style={{ background: "var(--line)" }}>
        <div className="h-1 rounded" style={{ width: `${x.condition}%`, background: condTone(x.condition) }} />
      </div>
      <div className="flex -space-x-2 min-h-[28px] items-center">
        {people.slice(0, 6).map((p) => <SlaveHead key={p.id} person={p} size={28} />)}
        {people.length > 6 ? <span className="text-[11px] dim pl-3">+{people.length - 6}</span> : null}
        {!people.length ? <span className="text-[11px] dim">empty</span> : null}
      </div>
      {x.items.length ? <div className="text-[10.5px] dim mt-1 truncate">{x.items.map((i) => i.name).join(", ")}</div> : null}
    </Card>
  );
}

function SpaceSheet({ x, part, onBeWith }: { x: Space; part: Part; onBeWith: (id: string) => void }) {
  const { save } = useGame();
  const mutate = useHand("people");
  const [said, setSaid] = useState("");
  const [thing, setThing] = useState("");
  const say = (fn: (s: typeof save) => string) => { let t = ""; mutate((s) => { t = fn(s); }); if (t) setSaid(t); };
  const owner = x.owner ? save.people[x.owner] : undefined;

  return (
    <div className="space-y-3">
      <p className="font-prose text-[14px]">{cap(x.look)}. It's {condWord(x.condition)}.{owner ? ` It's ${owner.name.split(" ")[0]}'s.` : ""}</p>
      {said ? <Card><p className="text-[13px]">{said}</p></Card> : null}

      <div>
        <div className="text-[11px] uppercase tracking-wider dim mb-1">Who's here</div>
        {PARTS.map((p) => {
          const ppl = occupants(save, x.id, p);
          return (
            <div key={p} className={cx("flex items-center gap-2 py-1", p === part && "font-medium")}>
              <span className="text-[12px] w-[72px] shrink-0 dim">{PART_LABEL[p]}</span>
              <div className="flex flex-wrap gap-1.5">
                {ppl.length ? ppl.map((q) => (
                  <button key={q.id} className="chip !text-[11.5px] flex items-center gap-1" onClick={() => onBeWith(q.id)} title="Go to her here">
                    <SlaveHead person={q} size={18} />{q.name.split(" ")[0]}
                  </button>
                )) : <span className="text-[12px] dim">nobody</span>}
              </div>
            </div>
          );
        })}
        <div className="text-[11px] dim mt-1">Tap someone to go to her there.</div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider dim mb-1">What's in it</div>
        {x.items.length ? (
          <ul className="space-y-1 mb-2">
            {x.items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 text-[13px]">
                <span>{i.name}{i.owner && save.people[i.owner] ? <span className="dim"> · {save.people[i.owner].name.split(" ")[0]}'s</span> : null}</span>
                <button className="text-[11.5px] underline dim" onClick={() => say((s) => removeItem(s, x.id, i.id))}>take out</button>
              </li>
            ))}
          </ul>
        ) : <div className="text-[12px] dim mb-2">Nothing but what it was built with.</div>}
        <div className="flex gap-1.5">
          <input value={thing} onChange={(e) => setThing(e.target.value)} placeholder="e.g. a pool table, a cage in the corner" className="min-w-0 flex-1" />
          <Button size="sm" disabled={!thing.trim() || save.arcology.cash < ITEM_COST} onClick={() => { say((s) => addItem(s, x.id, thing)); setThing(""); }}>Put it in · ¤{ITEM_COST}</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px]">It's {condWord(x.condition)} ({x.condition}).</span>
        <Button size="sm" kind="ghost" disabled={x.condition >= 100 || save.arcology.cash < CLEAN_COST} onClick={() => say((s) => cleanSpace(s, x.id))}>Have it scrubbed · ¤{CLEAN_COST}</Button>
      </div>

      {!x.owner && x.floor !== "public" ? (
        <div>
          <div className="text-[11px] uppercase tracking-wider dim mb-1">Who's allowed in</div>
          <div className="flex flex-wrap gap-1.5">
            {(["household", "invited", "owner"] as Access[]).map((a) => (
              <button key={a} className={cx("chip !text-[11.5px]", x.access === a && "on")} onClick={() => mutate((s) => setAccess(s, x.id, a))}>{ACCESS_LABEL[a]}</button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <div className="text-[11px] uppercase tracking-wider dim mb-1">What's happened here</div>
        {x.history.length ? (
          <ul className="space-y-1">
            {[...x.history].reverse().slice(0, 10).map((h, i) => <li key={i} className="text-[12.5px]"><span className="dim">week {h.week}, {h.part}:</span> {h.text}</li>)}
          </ul>
        ) : <div className="text-[12px] dim">Nothing yet.</div>}
      </div>
    </div>
  );
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
