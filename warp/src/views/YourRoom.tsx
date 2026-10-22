/**
 * YOUR ROOM — where she keeps you, drawn.
 *
 * Once she holds your collar this is the screen that matters: the room she gave you, what's in it,
 * what she's taken, the job she's put you to and this week's list. The drawing is built from the
 * record (a mat or a four-poster, a window or a wall, the chain, the camera in the corner) so it
 * changes the week she changes it.
 */
import { useState, type ReactNode } from "react";
import { useGame } from "../lib/game";
import { Button, cx } from "../lib/ui";
import type { SaveState } from "../engine/types";
import { AXES, type RoomAxis } from "../data/rooms";
import { roomLevelName, roomComfort, jobOf, answerTask, YOUR_ITEM, YOUR_ITEMS, type YourRoom as Room } from "../engine/kept";
import { herDecides } from "../engine/herwill";
import { modelsAvailable } from "../config";
import { Reaction } from "./MomentCard";
import SlaveArt from "./SlaveArt";
import { playerAsPerson } from "../engine/you";
import { marksLine } from "../engine/marks";

/* ── the drawing ────────────────────────────────────────────────────────────────────────────── */

const S = 26, OX = 250, OY = 70;
const at = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * S * 0.866, OY + (x + y) * S * 0.5 - z * S];
const pts = (ps: [number, number][]) => ps.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");

/** A box in the room: x, y on the floor, w along x, d along y, h up. Three faces, lit from the left. */
function Box({ x, y, w, d, h, z = 0, c, title }: { x: number; y: number; w: number; d: number; h: number; z?: number; c: [string, string, string]; title?: string }) {
  const top = [at(x, y, z + h), at(x + w, y, z + h), at(x + w, y + d, z + h), at(x, y + d, z + h)];
  const left = [at(x, y + d, z), at(x + w, y + d, z), at(x + w, y + d, z + h), at(x, y + d, z + h)];
  const right = [at(x + w, y, z), at(x + w, y + d, z), at(x + w, y + d, z + h), at(x + w, y, z + h)];
  return (
    <g>
      {title ? <title>{title}</title> : null}
      <polygon points={pts(left)} fill={c[1]} />
      <polygon points={pts(right)} fill={c[2]} />
      <polygon points={pts(top)} fill={c[0]} />
    </g>
  );
}

const WOOD: [string, string, string] = ["#a4774f", "#7c5636", "#5f4129"];
const LINEN: [string, string, string] = ["#e7e1d6", "#bdb5a7", "#9d9586"];
const SILK: [string, string, string] = ["#b3364b", "#8a2537", "#6c1c2b"];
const STEEL: [string, string, string] = ["#8b9096", "#696e74", "#51555a"];
const DARK: [string, string, string] = ["#3a3633", "#2c2927", "#221f1d"];
const GREEN: [string, string, string] = ["#4f8a4b", "#3d6c3a", "#2f532d"];

function RoomDrawing({ room, her }: { room: Room; her: string }) {
  const L = room.levels;
  const size = L.space <= -1 ? 3 : L.space === 0 ? 7 : L.space === 1 ? 4 : L.space === 2 ? 5 : L.space === 3 ? 7 : 8;
  const has = (id: string) => room.items.includes(id);
  const cold = L.climate < 0;
  const floor = L.space <= -1 ? "#4a4744" : L.space >= 3 ? "#6b4f3a" : "#5a5550";
  const wallL = L.space <= -1 ? "#3d3a37" : L.space >= 3 ? "#8a7a68" : "#706a63";
  const wallR = L.space <= -1 ? "#34312f" : L.space >= 3 ? "#776858" : "#615c56";
  const H = 4.2;
  const things: ReactNode[] = [];

  // Your bed: in her room it sits at the foot of hers, which is against the back wall.
  const inHers = L.space === 3 || L.space === 4;
  if (inHers) {
    things.push(<Box key="herbed" x={0.4} y={1.6} w={2.6} d={3} h={0.7} c={SILK} title={`${her}'s bed`} />);
    things.push(<Box key="herpillow" x={0.5} y={2} w={0.6} d={2.2} h={0.25} z={0.7} c={LINEN} />);
  }
  const bx = inHers ? 3.3 : 0.4, by = inHers ? 2.1 : 0.6;
  const bedTitle = roomLevelName("bed", L.bed);
  if (L.bed <= -1) things.push(<Box key="bed" x={bx} y={by} w={1.1} d={1.9} h={0.08} c={["#6d6355", "#574e43", "#463f36"]} title={bedTitle} />);
  else if (L.bed === 0) things.push(<Box key="bed" x={bx} y={by} w={1.2} d={2.1} h={0.25} c={LINEN} title={bedTitle} />);
  else {
    const w = L.bed >= 2 ? 2 : 1.4;
    things.push(<Box key="bedframe" x={bx} y={by} w={w} d={2.4} h={0.45} c={WOOD} title={bedTitle} />);
    things.push(<Box key="sheets" x={bx + 0.05} y={by + 0.05} w={w - 0.1} d={2.3} h={0.2} z={0.45} c={L.bed >= 3 ? SILK : LINEN} title={bedTitle} />);
    if (L.bed >= 3) for (const [px, py] of [[bx, by], [bx + w - 0.15, by], [bx, by + 2.25], [bx + w - 0.15, by + 2.25]]) things.push(<Box key={`post${px}${py}`} x={px} y={py} w={0.15} d={0.15} h={2.2} c={WOOD} />);
  }
  // A cage is a cage.
  if (L.space <= -1) for (let i = 0; i <= 6; i++) { const a = at(0.2 + i * 0.43, 2.8, 0), b = at(0.2 + i * 0.43, 2.8, 2.2); things.push(<line key={`bar${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#9aa0a6" strokeWidth={2} />); }
  // The dormitory is other people's bunks.
  if (L.space === 0) for (let i = 1; i < 3; i++) things.push(<Box key={`bunk${i}`} x={0.4 + i * 2.2} y={0.6} w={1.2} d={2.1} h={0.25} c={LINEN} title="someone else's bunk" />);
  if (L.space === 1) { const a = at(4, 0, H - 0.3), b = at(4, 4, H - 0.3); things.push(<line key="rail" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#999" strokeWidth={2} />); }
  // Washing.
  if (L.bath === 1) things.push(<Box key="shower" x={size - 1.2} y={size - 1.2} w={1} d={1} h={2.6} c={["#bcd3dc", "#93abb4", "#7a929b"]} title={roomLevelName("bath", 1)} />);
  if (L.bath >= 2) things.push(<Box key="tub" x={size - 2.2} y={size - 1.3} w={2} d={1.1} h={0.6} c={["#f2f2f0", "#d0d0cc", "#b8b8b3"]} title={roomLevelName("bath", 2)} />);
  // The things you have.
  if (has("clothes")) things.push(<Box key="wardrobe" x={size - 1} y={0.2} w={0.8} d={1.4} h={2.6} c={WOOD} title={YOUR_ITEM.clothes.name} />);
  if (has("books")) things.push(<Box key="books" x={0.05} y={size - 2.2} w={0.35} d={1.6} h={1.8} c={["#6a4a8a", "#553a70", "#432e59"]} title={YOUR_ITEM.books.name} />);
  if (has("keepsakes")) things.push(<Box key="keepsakes" x={size - 1.6} y={size - 0.9} w={0.7} d={0.6} h={0.5} c={["#c9a961", "#a5884a", "#87703c"]} title={YOUR_ITEM.keepsakes.name} />);
  if (has("plant")) { things.push(<Box key="pot" x={0.4} y={size - 0.8} w={0.4} d={0.4} h={0.4} c={["#a9573a", "#87452e", "#6b3725"]} />); const p = at(0.6, size - 0.6, 0.9); things.push(<circle key="leaves" cx={p[0]} cy={p[1]} r={9} fill="#4f8a4b"><title>{YOUR_ITEM.plant.name}</title></circle>); }
  if (has("phone")) things.push(<Box key="phone" x={bx + 0.2} y={by - 0.5} w={0.35} d={0.2} h={0.05} z={0.05} c={DARK} title={YOUR_ITEM.phone.name} />);
  if (has("cane")) { const a = at(0, 0.6, 2.2), b = at(0, 0.9, 0.6); things.push(<line key="cane" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#c8a46b" strokeWidth={3}><title>{YOUR_ITEM.cane.name}</title></line>); }
  if (has("chain")) {
    const from = at(bx + 0.5, by + 0.3, 0.3), to = inHers ? at(2.9, 3, 0.6) : at(0, by + 1, 0.8);
    things.push(<path key="chain" d={`M${from[0]},${from[1]} Q${(from[0] + to[0]) / 2},${Math.max(from[1], to[1]) + 14} ${to[0]},${to[1]}`} stroke="#b9bec3" strokeWidth={2.5} strokeDasharray="3 2" fill="none"><title>{YOUR_ITEM.chain.name}</title></path>);
  }
  if (has("bell")) { const p = at(bx + 0.5, by + 1, 0.6); things.push(<circle key="bell" cx={p[0]} cy={p[1] - 8} r={3.5} fill="#e0b84a"><title>{YOUR_ITEM.bell.name}</title></circle>); }

  // On the walls.
  const wall: ReactNode[] = [];
  const onLeft = (y0: number, y1: number, z0: number, z1: number) => pts([at(0, y0, z0), at(0, y1, z0), at(0, y1, z1), at(0, y0, z1)]);
  const onRight = (x0: number, x1: number, z0: number, z1: number) => pts([at(x0, 0, z0), at(x1, 0, z0), at(x1, 0, z1), at(x0, 0, z1)]);
  if (L.view > 0) {
    const [x0, x1, z0, z1] = L.view === 1 ? [size / 2 - 0.4, size / 2 + 0.4, 2, 2.8] : L.view === 2 ? [size / 2 - 1.2, size / 2 + 1.2, 1.4, 3.2] : [0.6, size - 0.6, 0.2, H - 0.2];
    wall.push(<polygon key="win" points={onRight(x0, x1, z0, z1)} fill={L.view >= 2 ? "#2b4a6b" : "#3b5670"} stroke="#c9c2b8" strokeWidth={1.5}><title>{roomLevelName("view", L.view)}</title></polygon>);
    if (L.view >= 2) for (let i = 0; i < 5; i++) { const b = at(x0 + 0.3 + i * (x1 - x0 - 0.6) / 4, 0, z0 + 0.2); const t = at(x0 + 0.3 + i * (x1 - x0 - 0.6) / 4, 0, z0 + 0.5 + (i % 3) * 0.35); wall.push(<line key={`tw${i}`} x1={b[0]} y1={b[1]} x2={t[0]} y2={t[1]} stroke="#e8c76a" strokeWidth={3} opacity={0.7} />); }
  }
  if (has("screen")) wall.push(<polygon key="screen" points={onLeft(2.2, 3.6, 1.6, 2.5)} fill="#1c2733" stroke="#555" strokeWidth={1}><title>{YOUR_ITEM.screen.name}</title></polygon>);
  // The door: open if you may leave, shut and barred if not.
  const out = has("others") || has("lift");
  wall.push(<polygon key="door" points={onLeft(size - 1.6, size - 0.4, 0, 2.6)} fill={out ? "#2a2522" : "#5e4a39"} stroke="#3a2f27" strokeWidth={1.5}><title>{out ? "the door, which you may use" : "the door, locked from outside"}</title></polygon>);
  if (has("lift")) { const k = at(0, size - 2, 1.8); wall.push(<text key="key" x={k[0]} y={k[1]} fontSize={12} fill="#e0b84a">⚿<title>{YOUR_ITEM.lift.name}</title></text>); }
  if (has("camera")) { const c = at(size - 0.1, 0.1, H - 0.3); wall.push(<g key="cam"><circle cx={c[0]} cy={c[1]} r={4} fill="#222" /><circle cx={c[0]} cy={c[1]} r={1.6} fill="#e33" /><title>{YOUR_ITEM.camera.name}</title></g>); }
  if (L.climate >= 2) wall.push(<polygon key="thermo" points={onRight(0.3, 0.6, 1.5, 1.9)} fill="#ddd"><title>{roomLevelName("climate", L.climate)}</title></polygon>);

  return (
    <svg viewBox="0 0 500 300" className="w-full block rounded-[10px]" style={{ background: "#141210" }} role="img" aria-label={`Your room: ${(Object.keys(AXES) as RoomAxis[]).map((a) => roomLevelName(a, L[a])).join(", ")}`}>
      <polygon points={pts([at(0, 0, 0), at(0, size, 0), at(0, size, H), at(0, 0, H)])} fill={wallL} />
      <polygon points={pts([at(0, 0, 0), at(size, 0, 0), at(size, 0, H), at(0, 0, H)])} fill={wallR} />
      <polygon points={pts([at(0, 0), at(size, 0), at(size, size), at(0, size)])} fill={floor} />
      {wall}
      {things}
      {cold ? <polygon points={pts([at(0, 0), at(size, 0), at(size, size), at(0, size)])} fill="#9fc7e8" opacity={0.12} /> : null}
    </svg>
  );
}

/* ── the screen ─────────────────────────────────────────────────────────────────────────────── */

export default function YourRoomView() {
  const { save } = useGame();
  const her = save.player.owned_by ? save.people[save.player.owned_by] : undefined;
  const room = save.reign && !save.reign.ended ? (save.reign.room ?? undefined) : undefined;
  if (!her || !save.reign || save.reign.ended) return <div className="text-[13px] dim">You own this place. Nobody keeps you anywhere.</div>;
  return (
    <div className="pb-24">
      {room ? <RoomCard room={room} her={her.name} /> : <p className="text-[13px] dim mb-4">{her.name} hasn't decided where you sleep yet. She will at the end of the week.</p>}
      <div className="card p-3 mb-4 flex gap-3 items-end">
        <SlaveArt person={playerAsPerson(save)} height={240} face={false} />
        <div className="text-[12.5px] mid pb-2">{save.player.stains?.length ? <>On you right now: {marksLine(save, save.player.stains)}.</> : "Nothing on you right now."}</div>
      </div>
      <YourWeek />
      <TalkToHer />
    </div>
  );
}

function RoomCard({ room, her }: { room: Room; her: string }) {
  const axes = Object.keys(AXES) as RoomAxis[];
  const c = roomComfort(room);
  const missing = YOUR_ITEMS.filter((x) => x.lets && !room.items.includes(x.id));
  return (
    <div className="card p-3 mb-4">
      <RoomDrawing room={room} her={her} />
      <div className="mt-3 text-[13px] font-prose leading-relaxed">{axes.map((a) => roomLevelName(a, room.levels[a])).join(", ")}.</div>
      <div className="text-[12px] dim mt-1">{c >= 8 ? "It's more than most free people have." : c >= 3 ? "It's comfortable." : c >= 0 ? "It's bare." : c >= -4 ? "It's hard." : "It's meant to hurt."}</div>
      {room.items.length ? (
        <div className="flex flex-wrap gap-1.5 mt-2">{room.items.map((id) => <span key={id} className={cx("chip", (YOUR_ITEM[id]?.comfort ?? 0) < 0 ? "bad" : "good")} title={YOUR_ITEM[id]?.note}>{YOUR_ITEM[id]?.name}</span>)}</div>
      ) : null}
      {missing.length ? <div className="text-[12px] dim mt-2">You don't have {missing.map((x) => x.name).join(" or ")}: {missing.map((x) => x.note.replace(/^you can /, "you can't ")).join("; ")}.</div> : null}
      {room.log.length ? (
        <ul className="mt-3 space-y-0.5 text-[12px] mid">{[...room.log].reverse().slice(0, 6).map((l, i) => <li key={i}>· week {l.week}: she {l.gave ? "gave you" : "took"} {l.text}</li>)}</ul>
      ) : null}
    </div>
  );
}

/** This week's list, from the job she gave you and her rules. */
export function YourWeek() {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState<{ text: string; what: string; auto?: boolean } | null>(null);
  const r = save.reign;
  const her = save.player.owned_by ? save.people[save.player.owned_by] : undefined;
  if (!r || r.ended || !her) return null;
  const job = jobOf(save);
  const tasks = r.tasks ?? [];
  const act = (id: string, done: boolean, text: string, hers: boolean) => {
    let line = "";
    mutate((s: SaveState) => { line = answerTask(s, id, done); });
    if (line) setSaid({ text: hers ? `${text}\n\n${line}` : line, what: hers ? (done ? "You go to her." : "You refuse her.") : done ? `You ${text}.` : `You refuse to ${text}.`, auto: hers && done });
  };
  return (
    <div className="card p-3 mb-4">
      <div className="text-[10.5px] uppercase tracking-wider dim mb-1">Your week</div>
      {job ? <p className="text-[13px] mb-2">{her.name} has you {job.name}.</p> : null}
      {!tasks.length ? <p className="text-[12.5px] dim">Nothing on her list yet. It starts at the end of the week.</p> : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-2">
              <span className={cx("flex-1 min-w-[180px] text-[13px]", t.state !== "open" && "dim")}>{t.text}</span>
              {t.state === "open" ? (
                <>
                  <Button size="sm" kind="primary" onClick={() => act(t.id, true, t.text, t.from === "her")}>{t.from === "her" ? "Go to her" : "Do it"}</Button>
                  <Button size="sm" kind="ghost" onClick={() => act(t.id, false, t.text, t.from === "her")}>Refuse</Button>
                </>
              ) : <span className={cx("chip", t.state === "done" ? "good" : "bad")}>{t.state}</span>}
            </li>
          ))}
        </ul>
      )}
      {said ? (
        <div className="mt-2">
          <p className="text-[13px] acc">{said.text}</p>
          <Reaction key={said.text} auto={said.auto} seed={{ person: her.id, title: said.auto ? "What she wanted" : "What she wanted done", source: "kept", you: said.what, happened: said.text }} />
        </div>
      ) : null}
    </div>
  );
}

/** Go to her: ask for something, or tell her what you think she should do. */
export function TalkToHer() {
  const { save, mutate } = useGame();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [got, setGot] = useState<{ said: string; did: string[] } | null>(null);
  const her = save.player.owned_by ? save.people[save.player.owned_by] : undefined;
  if (!her || !save.reign || save.reign.ended) return null;
  const recent = (save.reign.advice ?? []).slice(-3).reverse();
  const send = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    const res = await herDecides(save, text);
    mutate(() => {});
    setGot(res); setText(""); setBusy(false);
  };
  return (
    <div className="card p-3 mb-4">
      <div className="text-[10.5px] uppercase tracking-wider dim mb-1">Go to {her.name}</div>
      <p className="text-[12px] dim mb-2">Ask her for something, or tell her what you think she should do with the arcology. {modelsAvailable() ? "She decides, and might act on it." : "She'll say yes or no."}</p>
      <textarea className="w-full" rows={2} placeholder={`"Let me see the others again." "Sign the paternalist laws." "Have the dock boss dealt with."`} value={text} onChange={(e) => setText(e.target.value)} />
      <Button size="sm" kind="primary" className="mt-2" disabled={busy || !text.trim()} onClick={() => void send()}>{busy ? "She's thinking…" : "Say it"}</Button>
      {got ? (
        <div className="mt-2 text-[13px]">
          {got.said ? <p className="font-prose">{got.said}</p> : null}
          {got.did.length ? <ul className="mt-1 space-y-0.5 text-[12.5px] acc">{got.did.map((d, i) => <li key={i}>· {d}</li>)}</ul> : null}
        </div>
      ) : null}
      {!got && recent.length ? (
        <ul className="mt-2 space-y-1 text-[12px] mid">{recent.map((a, i) => <li key={i}>· week {a.week}: "{a.text}"{a.answer ? ` (${a.took ? "she listened" : "she did it her way"})` : " (she hasn't answered)"}</li>)}</ul>
      ) : null}
    </div>
  );
}

