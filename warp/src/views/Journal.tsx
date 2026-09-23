/**
 * THE STORY SO FAR.
 *
 * Who you were, who has turned up, what they think of you now, and every choice you made, in
 * order. The thing to open when you come back to a save after a week away.
 */
import { useGame } from "../lib/game";
import { Card, Empty, Fold, Meter, cx } from "../lib/ui";
import { arcDef, type NPC } from "../engine/story";
import { ORIGIN_BY_ID } from "../data/story";
import { SlaveHead } from "./SlaveArt";
import Ambitions from "./Ambitions";

export default function Journal() {
  const { save } = useGame();
  const st = save.story;
  if (!st) return <Empty>No story in this save.</Empty>;
  const origin = ORIGIN_BY_ID[st.origin];
  const cast = Object.values(st.cast).filter(Boolean) as NPC[];
  const arcs = Object.values(st.arcs);

  return (
    <>
      <Card className="mb-5">
        <div className="text-[11px] uppercase tracking-wider dim mb-1">who you were</div>
        <div className="font-display text-[20px] leading-tight">{origin?.name ?? "An owner with a past"}</div>
        {origin ? <p className="font-prose text-[15px] mid mt-1.5">{origin.pitch}</p> : null}
        <p className="text-[12px] dim mt-2">{save.player.name !== "you" ? `${save.player.name}. ` : ""}The household calls you {save.player.address || "Master"}.</p>
      </Card>

      <Fold id="journal-ambitions" title="What you're after">
        <Ambitions />
      </Fold>

      <Fold id="journal-cast" title="The people in it" count={cast.length}>
        {cast.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {cast.map((n) => {
              const p = n.person ? save.people[n.person] : undefined;
              return (
                <div key={n.role} className="card-2 p-3 flex gap-3 items-center">
                  {p ? <SlaveHead person={p} size={42} /> : <Initials name={n.name} status={n.status} />}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] truncate">{n.name} <span className={cx("text-[11px]", n.status === "dead" ? "bad" : "dim")}>{n.status === "around" ? "" : `· ${n.status === "owned" ? "yours now" : n.status}`}</span></div>
                    <div className="text-[11.5px] dim truncate">{n.what}</div>
                    <div className="mt-1.5"><Meter value={n.disposition} range={[-100, 100]} showValue={false} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <Empty>Nobody yet.</Empty>}
      </Fold>

      <Fold id="journal-arcs" title="Stories" count={arcs.length}>
        <div className="space-y-1.5">
          {arcs.map((a) => (
            <div key={a.id} className="card-2 px-3 py-2 flex items-baseline gap-3">
              <span className="text-[13px] flex-1">{arcDef(a.id)?.title ?? a.id}</span>
              <span className={cx("text-[11.5px]", a.done ? "dim" : "acc")}>{a.done ? a.ending || "over" : "going on"}</span>
            </div>
          ))}
        </div>
      </Fold>

      <Fold id="journal-log" title="What you did" count={st.log.length}>
        {st.log.length ? (
          <div className="space-y-2.5">
            {[...st.log].reverse().map((l, i) => (
              <div key={i} className="card-2 p-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] dim">wk {l.week}</span>
                  <span className="text-[13px]">{l.title}</span>
                </div>
                <div className="player-line !my-1.5 !text-[12.5px]">{l.chose}</div>
                <p className="font-prose text-[14px] mid leading-relaxed">{l.text}</p>
              </div>
            ))}
          </div>
        ) : <Empty>Nothing yet. It starts on the Penthouse.</Empty>}
      </Fold>
    </>
  );
}

function Initials({ name, status }: { name: string; status: NPC["status"] }) {
  const letters = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <div className="shrink-0 grid place-items-center font-display text-[15px]"
      style={{ width: 42, height: 42, borderRadius: 999, background: "var(--ink-3)", color: status === "dead" ? "var(--danger)" : "var(--accent)", border: "1px solid var(--line-strong)", opacity: status === "gone" || status === "dead" ? 0.55 : 1 }}>
      {letters}
    </div>
  );
}
