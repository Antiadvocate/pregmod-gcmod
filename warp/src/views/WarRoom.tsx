/**
 * THE WAR ROOM — your arsenal, the other powers and what passes between you, and your wars, with
 * the front drawn and moving: aircraft and drones crossing, missiles arcing in, ships offshore, the
 * line where the armies meet.
 */
import { useMemo, useState } from "react";
import { Rocket, Swords, Handshake, Crown } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Card, Meter, Section, cx } from "../lib/ui";
import SubTabs from "./SubTabs";
import { BRANCHES, PROGRAMS, PROGRAM_BY_ID, type Branch } from "../data/arsenal";
import { attitudeWord, build, canBuild, canMove, dominion, empireOf, forces, makeMove, moveCost, MOVES, powers, units, type Move, type PowerView } from "../engine/power";
import { activeWars, declareWar, setStrategy, STRATEGY, strike, suePeace, type Strategy, type War } from "../engine/war";
import { rulerOf, talkLeft, talkOf } from "../engine/diplomacy";
import { speakToGovernor, speakToPower } from "../engine/talk";
import { canGovern, governedPlaces, governorCandidates, installGovernor, competence, styleOf, supportBlocked, supportGovernor, sendDeputy, NEED_WORDS, GOV_ORDERS, recallGovernor, type Governorship } from "../engine/governor";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import Talk from "./Talk";
import { SlaveHead } from "./SlaveArt";

const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;
const KIND: Record<string, string> = { neighbour: "Neighbouring arcology", freecity: "Free City", region: "Old World state" };
const tone = (a: number) => (a <= -25 ? "var(--danger)" : a >= 25 ? "var(--good)" : "var(--text-lo)");

export default function WarRoom() {
  const { save } = useGame();
  const d = dominion(save);
  const f = forces(save);
  const e = empireOf(save);
  const wars = activeWars(save);
  return (
    <div className="pb-20">
      <Card className="mb-4">
        <div className="flex items-center gap-2">
          <Crown size={15} className="acc" />
          <span className="text-[15px] font-semibold">{d.title}</span>
        </div>
        <div className="text-[12px] dim mb-2">{Math.round(d.share * 100)}% of the world answers to you</div>
        <Meter value={d.share * 100} label="" showValue={false} />
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div><div className="text-[18px] font-semibold">{f.total}</div><div className="text-[10.5px] uppercase tracking-wider dim">your strength</div></div>
          <div><div className="text-[18px] font-semibold">{Math.round(e.readiness)}%</div><div className="text-[10.5px] uppercase tracking-wider dim">readiness</div></div>
          <div><div className="text-[18px] font-semibold">{money(f.upkeep)}</div><div className="text-[10.5px] uppercase tracking-wider dim">upkeep a week</div></div>
        </div>
      </Card>
      <SubTabs id="warroom" tabs={[
        { id: "war", label: "War", badge: wars.length || undefined, render: () => <Wars /> },
        { id: "powers", label: "Powers", render: () => <Powers /> },
        { id: "governors", label: "Governors", badge: governedPlaces(save).filter((x) => x.g.letters.some((l) => !l.read)).length || undefined, render: () => <Governors /> },
        { id: "arsenal", label: "Arsenal", badge: e.building.length || undefined, render: () => <Arsenal /> },
      ]} />
    </div>
  );
}

/* ── the arsenal ─────────────────────────────────────────────────────────────────────────────── */

function Arsenal() {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState("");
  const f = forces(save);
  const e = empireOf(save);
  const max = Math.max(1, ...Object.values(f.by));
  return (
    <>
      {said ? <Card className="mb-3 text-[13px] acc">{said}</Card> : null}
      <Card className="mb-4">
        <div className="text-[11px] uppercase tracking-wider dim mb-2">Your forces, by branch</div>
        <div className="space-y-1.5">
          {(Object.keys(BRANCHES) as Branch[]).filter((b) => b !== "grand").map((b) => (
            <div key={b} className="flex items-center gap-2 text-[12.5px]">
              <span className="w-16 dim">{BRANCHES[b].name}</span>
              <div className="flex-1 h-2 rounded-full" style={{ background: "var(--line)" }}><div className="h-2 rounded-full" style={{ width: `${(f.by[b] / max) * 100}%`, background: "var(--accent)" }} /></div>
              <span className="w-10 text-right font-mono">{Math.round(f.by[b])}</span>
            </div>
          ))}
        </div>
        {e.building.length ? <div className="text-[12px] mid mt-3">Being built: {e.building.map((b) => `${PROGRAM_BY_ID[b.id]?.name} (${b.left}w)`).join(", ")}.</div> : null}
        <div className="text-[11px] dim mt-2">Garrison and security count too: {f.total} in all. Against raids on the arcology, the arsenal adds {f.defence} to its defence.</div>
      </Card>
      {(Object.keys(BRANCHES) as Branch[]).map((b) => (
        <Section key={b} title={BRANCHES[b].name}>
          <div className="text-[12px] dim -mt-1 mb-2">{BRANCHES[b].note}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {PROGRAMS.filter((p) => p.branch === b).map((p) => {
              const why = canBuild(save, p.id);
              const n = units(save, p.id);
              const going = e.building.filter((x) => x.id === p.id).length;
              return (
                <Card key={p.id} className={cx("py-3", n > 0 && "border-l-2")}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13.5px] font-medium flex-1">{p.name}</span>
                    <span className="text-[11px] dim font-mono">{n}{p.max > 1 ? `/${p.max}` : ""}{going ? ` +${going}` : ""}</span>
                  </div>
                  <div className="text-[12px] mid mt-0.5">{p.note}</div>
                  {p.does ? <div className="text-[11.5px] acc mt-1">{p.does}</div> : null}
                  <div className="text-[11px] dim mt-1">{p.power ? `+${p.power} strength · ` : ""}{p.defence ? `+${p.defence} home defence · ` : ""}{money(p.upkeep)}/wk · {p.weeks} weeks</div>
                  <Button size="sm" kind={why ? "ghost" : "primary"} className="mt-2" disabled={!!why} onClick={() => { let r = { ok: false, line: "" }; mutate((s) => { r = build(s, p.id); }); setSaid(r.line); }}>
                    {why ?? `Build · ${money(p.cost)}`}
                  </Button>
                </Card>
              );
            })}
          </div>
        </Section>
      ))}
    </>
  );
}

/* ── the powers ──────────────────────────────────────────────────────────────────────────────── */

function Powers() {
  const { save } = useGame();
  const [open, setOpen] = useState<string | null>(null);
  const mine = forces(save).total;
  const list = useMemo(() => powers(save).sort((a, b) => (a.rec.status === "conquered" ? 1 : 0) - (b.rec.status === "conquered" ? 1 : 0) || a.km - b.km), [save]);
  return (
    <div className="space-y-2">
      <div className="text-[12px] dim">Every power on the map, nearest first. Their strength against your {mine}, and what they think of you. Tap one to deal with it.</div>
      {list.map((p) => (
        <Card key={p.id} className="py-3">
          <button className="w-full text-left" onClick={() => setOpen(open === p.id ? null : p.id)}>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium flex-1 truncate">{p.name}</span>
              {p.atWar ? <span className="chip bad"><Swords size={11} /> at war</span>
                : p.rec.status !== "free" ? <span className={cx("chip", p.rec.status === "allied" ? "good" : "")}>{p.rec.status === "allied" ? "ally" : p.rec.status === "vassal" ? "your vassal" : "yours"}</span>
                : p.rec.pact ? <span className="chip">pact</span> : null}
            </div>
            <div className="text-[11.5px] dim">{KIND[p.kind]} · {p.km.toLocaleString()} km · strength {p.strength}{p.rec.pays ? ` · pays you ${money(p.rec.pays)}/wk` : ""}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 rounded-full relative" style={{ background: "var(--line)" }}>
                <div className="absolute top-0 h-1.5 rounded-full" style={{ left: "50%", width: `${Math.abs(p.attitude) / 2}%`, transform: p.attitude < 0 ? "translateX(-100%)" : undefined, background: tone(p.attitude) }} />
              </div>
              <span className="text-[11.5px] w-24 text-right" style={{ color: tone(p.attitude) }}>{attitudeWord(p.attitude)} ({p.attitude})</span>
            </div>
          </button>
          {open === p.id ? <Dealings p={p} /> : null}
        </Card>
      ))}
    </div>
  );
}

function Dealings({ p }: { p: PowerView }) {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState("");
  const [sure, setSure] = useState(false);
  if (p.rec.status === "conquered") return <div className="mt-2"><div className="text-[12.5px] mid">It's yours. It pays you {money(p.rec.pays ?? 0)} a week.</div><Install p={p} /></div>;
  const ruler = rulerOf(save, p);
  return (
    <div className="mt-3 fade-in">
      <div className="text-[12.5px] mb-2"><span className="font-medium">{ruler.name}</span><span className="dim">, {ruler.title}. {ruler.manner}. Wants {ruler.wants}.</span></div>
      {p.rec.governor ? null : (
        <div className="card-2 p-3 mb-3">
          <div className="text-[11px] uppercase tracking-wider dim mb-1.5">Talk to {ruler.name}</div>
          <Talk who={ruler.name} log={talkOf(save, p.id).log} left={talkLeft(save, p.id)} send={(t) => speakToPower(save, p.id, t)}
            ideas={["What would it take for you to adopt my laws?", "Send me your best girls and I'll forget the insult.", "Pay me, or I come for you.", "Let's talk about a pact."]} />
        </div>
      )}
      <Install p={p} />
      <div className="text-[12px] mid mb-2">{p.lines.filter(Boolean).slice(0, 2).join(" ")}</div>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(MOVES) as Move[]).map((m) => {
          const why = canMove(save, p, m);
          if (why && /only Old World|it's yours/.test(why)) return null;
          const cost = moveCost(save, p, m);
          return (
            <Button key={m} size="sm" kind="ghost" disabled={!!why} title={`${MOVES[m].note}${why ? ` (${why})` : ""}`}
              onClick={() => { let r = { ok: false, line: "" }; mutate((s) => { r = makeMove(s, p.id, m); }); setSaid(r.line); }}>
              {m === "envoy" || m === "gift" || m === "pact" || m === "alliance" ? <Handshake size={12} /> : null}{MOVES[m].label}{why ? <span className="dim"> · {why}</span> : cost ? ` · ${money(cost)}` : ""}
            </Button>
          );
        })}
      </div>
      {!p.atWar ? (
        <div className="mt-2">
          {sure ? (
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] bad flex-1">War with {p.name}? Everyone watching will think less of you.</span>
              <Button size="sm" kind="danger" onClick={() => { let t = ""; mutate((s) => { t = declareWar(s, p.id); }); setSaid(t); setSure(false); }}>Declare war</Button>
              <Button size="sm" kind="ghost" onClick={() => setSure(false)}>No</Button>
            </div>
          ) : <Button size="sm" kind="danger" onClick={() => setSure(true)}><Swords size={12} /> Declare war</Button>}
        </div>
      ) : null}
      {said ? <p className="font-prose text-[13.5px] mt-2">{said}</p> : null}
    </div>
  );
}

/** Put one of your women in charge of a place you hold. */
function Install({ p }: { p: PowerView }) {
  const { save, mutate } = useGame();
  const [pick, setPick] = useState(false);
  const [said, setSaid] = useState("");
  const why = canGovern(save, p.id);
  if (p.rec.governor) return <div className="text-[12.5px] acc mt-2">Governed for you by {save.people[p.rec.governor]?.name}. Talk to her under Governors.</div>;
  if (why) return null;
  const who = governorCandidates(save).sort((a, b) => competence(save, b) - competence(save, a));
  return (
    <div className="mt-2">
      {said ? <p className="font-prose text-[13.5px] mb-2">{said}</p> : null}
      {!pick ? <Button size="sm" kind="primary" onClick={() => setPick(true)}><Crown size={12} /> Put one of your women in charge</Button> : (
        <div className="list">
          {who.length ? who.slice(0, 10).map((w) => (
            <button key={w.id} className="list-row" onClick={() => { let r = { ok: false, line: "" }; mutate((s) => { r = installGovernor(s, p.id, w.id); }); setSaid(r.line); setPick(false); }}>
              <SlaveHead person={w} size={32} />
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[13px]">{w.name} <span className="dim">· {w.persona.intelligence}</span></div>
                <div className="text-[11px] dim truncate">{w.persona.core_traits.slice(0, 2).join("; ")}</div>
              </div>
              <span className="text-[11px] dim">fit {Math.round(competence(save, w) * 100)}</span>
            </button>
          )) : <div className="text-[12.5px] dim">Nobody of yours can go: she needs to be an adult who can speak and think, and not broken.</div>}
        </div>
      )}
    </div>
  );
}

/** What's going wrong in her city, and what you can send. */
function Help({ g }: { g: Governorship }) {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState("");
  const [picking, setPicking] = useState(false);
  const send = (kind: "cash" | "troops" | "labour") => { let t = ""; mutate((s) => { t = supportGovernor(s, g.place, kind, 10000); }); setSaid(t); };
  const why = (k: "cash" | "troops" | "labour") => supportBlocked(save, g.place, k, 10000);
  return (
    <div className="mt-3">
      {(g.problems ?? []).length ? (
        <ul className="space-y-1.5 mb-2">
          {g.problems!.map((x) => (
            <li key={x.id} className="text-[12.5px] flex gap-2">
              <span className={x.severity >= 7 ? "bad" : "warn"}>·</span>
              <span className="flex-1"><span className="font-prose">{x.text}</span> <span className="dim">She needs {NEED_WORDS[x.need]}.{x.severity >= 7 ? " It's bad." : ""}</span></span>
            </li>
          ))}
        </ul>
      ) : <div className="text-[12px] dim mb-2">Nothing badly wrong there right now.</div>}
      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" kind="ghost" disabled={!!why("cash")} title={why("cash") ?? ""} onClick={() => send("cash")}>Send ¤10,000</Button>
        <Button size="sm" kind="ghost" disabled={!!why("troops")} title={why("troops") ?? "¤3,500 a week while they're there"} onClick={() => send("troops")}>Send soldiers{why("troops") ? ` · ${why("troops")}` : ` (${["none", "a company", "a battalion", "a garrison"][g.garrison ?? 0]} now)`}</Button>
        <Button size="sm" kind="ghost" disabled={!!why("labour")} title={why("labour") ?? ""} onClick={() => send("labour")}>Send workers</Button>
        <Button size="sm" kind="ghost" onClick={() => setPicking(!picking)}>{g.deputy && save.people[g.deputy] ? `Deputy: ${save.people[g.deputy].name}` : "Send her a deputy"}</Button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        <Button size="sm" kind="ghost" onClick={() => { let t = ""; mutate((s) => { t = recallGovernor(s, g.place); }); setSaid(t); }}>Bring her home</Button>
        <Button size="sm" kind="danger" onClick={() => { let t = ""; mutate((s) => { const p = s.people[g.person]; const live = governedPlaces(s).find((x) => x.g.place === g.place)?.g; if (p && live) t = GOV_ORDERS.imprison.run(s, live, p); }); setSaid(t); }}>Drag her home in chains</Button>
      </div>
      {picking ? (
        <div className="list mt-2">
          {governorCandidates(save).sort((a, b) => competence(save, b) - competence(save, a)).slice(0, 8).map((w) => (
            <button key={w.id} className="list-row" onClick={() => { let t = ""; mutate((s) => { t = sendDeputy(s, g.place, w.id); }); setSaid(t); setPicking(false); }}>
              <SlaveHead person={w} size={28} /><span className="text-[13px] flex-1 text-left">{w.name} <span className="dim">· {w.persona.intelligence}</span></span>
            </button>
          ))}
        </div>
      ) : null}
      {said ? <p className="text-[12.5px] acc mt-2">{said}</p> : null}
    </div>
  );
}

function Governors() {
  const { save, mutate } = useGame();
  const [open, setOpen] = useState<string | null>(null);
  const list = governedPlaces(save);
  if (!list.length) return <Card className="text-[13px] mid">None of your women run a city yet. Win a war (and keep the city), make a power your vassal, or buy 55% of a neighbour, then put her in charge from the Powers tab. She runs it as herself, and stays yours.</Card>;
  return (
    <div className="space-y-3">
      {list.map(({ g, p, place }) => {
        const unread = g.letters.filter((l) => !l.read);
        return (
          <Card key={g.place}>
            <div className="flex items-center gap-2.5">
              {p ? <SlaveHead person={p} size={40} /> : null}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium">{p?.name} <span className="dim font-normal">governs</span> {g.name}</div>
                <div className="text-[11.5px] dim">since week {g.since} · {g.doctrines.map((d) => DOCTRINE_BY_ID[d]?.noun ?? d).join(", ")} · sends {money(place?.rec.pays ?? 0)}/wk</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2.5">
              <Meter value={g.prosperity} label="how it's doing" showValue={false} />
              <Meter value={g.order} label="how calm it is" showValue={false} />
            </div>
            {p ? <p className="text-[12.5px] mid mt-2.5">{styleOf(p).map((x) => x.line).join(" ")}</p> : null}
            <div className="mt-2 space-y-1">
              {g.decrees.slice(-3).map((d, i) => <div key={i} className="text-[12.5px] mid font-prose">“{d.text}”</div>)}
            </div>
            {g.faces?.length ? <div className="text-[11.5px] dim mt-2">{g.faces.map((f) => `${f.name}, ${f.role}${f.leaning < -0.3 ? " (against her)" : f.leaning > 0.3 ? " (with her)" : ""}`).join(" · ")}</div> : null}
            <Help g={g} />
            {g.letters.length ? (
              <div className="mt-3 card-2 p-3">
                <div className="text-[11px] uppercase tracking-wider dim mb-1">{unread.length ? "new letter" : "her last letter"} · week {g.letters.at(-1)!.week}</div>
                {g.letters.at(-1)!.text.split(/\n\n+/).map((para, i) => <p key={i} className="font-prose text-[14px] leading-relaxed">{para}</p>)}
                {unread.length ? <button className="text-[11.5px] underline dim mt-1" onClick={() => mutate(() => { for (const l of g.letters) l.read = true; })}>mark read</button> : null}
              </div>
            ) : null}
            <div className="mt-3">
              {open === g.place
                ? <Talk who={p?.name ?? "her"} log={g.talk} send={(t) => speakToGovernor(save, g.place, t)} ideas={["How's my city?", "Make my laws your laws.", "Send me two of your best girls.", "Come home. I miss you."]} />
                : <Button size="sm" kind="primary" onClick={() => { setOpen(g.place); mutate(() => { for (const l of g.letters) l.read = true; }); }}>Call her</Button>}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ── the wars ────────────────────────────────────────────────────────────────────────────────── */

function Wars() {
  const { save } = useGame();
  const e = empireOf(save);
  const wars = activeWars(save);
  const past = e.wars.filter((w) => w.ended).slice(-6).reverse();
  return (
    <>
      {wars.length ? wars.map((w) => <WarCard key={w.id} w={w} />) : (
        <Card className="mb-4 text-[13px] mid">No wars. Declare one from the Powers tab; build what you'll need under Arsenal first. Who you can beat depends on what you field against them: Free Cities over the water need ships and aircraft, Old World states need ground forces to hold what the air takes.</Card>
      )}
      {past.length ? (
        <Section title="Wars you've fought">
          <div className="space-y-1">
            {past.map((w) => <div key={w.id} className="text-[12.5px] flex gap-2"><span className="font-mono dim w-16">wk {w.started}–{w.ended!.week}</span><span className="flex-1">{w.name}</span><span className={w.ended!.result === "won" ? "good" : w.ended!.result === "lost" ? "bad" : "dim"}>{w.ended!.result}</span></div>)}
          </div>
        </Section>
      ) : null}
      {e.log.length ? (
        <Section title="Dispatches">
          <ul className="space-y-1">
            {e.log.slice(-12).reverse().map((l, i) => <li key={i} className="text-[12.5px] flex gap-2"><span className="font-mono dim w-12 shrink-0">wk {l.week}</span><span>{l.text}</span></li>)}
          </ul>
        </Section>
      ) : null}
    </>
  );
}

function WarCard({ w }: { w: War }) {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState("");
  const p = powers(save).find((x) => x.id === w.target);
  return (
    <Card className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Swords size={14} className="bad" />
        <span className="text-[15px] font-semibold flex-1">War with {w.name}</span>
        <span className="text-[11.5px] dim">week {w.weeks} · {w.by === "you" ? "you declared it" : "they declared it"}</span>
      </div>
      <Theatre w={w} enemy={p} />
      <div className="flex items-center gap-2 text-[11.5px] mt-1">
        <span className="dim">they're at your gates</span>
        <div className="flex-1 h-2 rounded-full relative" style={{ background: "var(--line)" }}>
          <div className="absolute -top-0.5 w-1 h-3 rounded" style={{ left: `${(w.front + 100) / 2}%`, background: w.front >= 0 ? "var(--good)" : "var(--danger)" }} />
        </div>
        <span className="dim">you hold their capital</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {(Object.keys(STRATEGY) as Strategy[]).map((st) => (
          <button key={st} className={cx("chip !text-[12px] !py-1 !px-2.5", w.strategy === st && "on")} title={STRATEGY[st].note} onClick={() => mutate((s) => setStrategy(s, w.id, st))}>{STRATEGY[st].name}</button>
        ))}
      </div>
      <div className="text-[11.5px] dim mt-1">{STRATEGY[w.strategy].note}.</div>
      <div className="flex flex-wrap gap-2 mt-3">
        <Button size="sm" kind="primary" onClick={() => { let t = ""; mutate((s) => { t = strike(s, w.id); }); setSaid(t); }}><Rocket size={12} /> Strike now</Button>
        <Button size="sm" kind="ghost" onClick={() => { let t = ""; mutate((s) => { t = suePeace(s, w.id); }); setSaid(t); }}>Sue for peace</Button>
      </div>
      {said ? <p className="font-prose text-[13.5px] mt-2">{said}</p> : null}
      {w.log.length ? (
        <ul className="mt-3 space-y-0.5">
          {w.log.slice(-6).reverse().map((l, i) => <li key={i} className="text-[12px] flex gap-2"><span className="font-mono dim w-12 shrink-0">wk {l.week}</span><span className={l.delta >= 8 ? "good" : l.delta <= -8 ? "bad" : "mid"}>{l.text}</span></li>)}
        </ul>
      ) : null}
    </Card>
  );
}

/**
 * The front, drawn. Your city on the left, theirs on the right, the armies where the front says,
 * and everything you field crossing between: as many aircraft, missiles and ships as you have.
 */
function Theatre({ w, enemy }: { w: War; enemy?: PowerView }) {
  const { save } = useGame();
  const f = forces(save);
  const W = 460, H = 270, GROUND = 206;
  const fx = W / 2 + (w.front / 100) * (W / 2 - 90);
  const n = (id: string) => units(save, id);
  const air = Math.min(8, n("drones") + n("fighters") * 2 + n("bombers") * 2 + n("stealth") * 2);
  const jets = Math.min(6, n("fighters") + n("bombers") + n("stealth"));
  const missiles = Math.min(6, n("batteries") + n("hypersonic") * 2);
  const ships = Math.min(5, n("patrol") + n("frigates") + n("subs") + n("carrier") * 2);
  const tanks = Math.min(8, Math.max(2, n("armour") * 2 + n("androids") * 2));
  const theirs = Math.min(8, Math.max(2, Math.round((enemy?.strength ?? 60) / 30)));
  const orbit = n("orbital") > 0;
  const sea = enemy?.kind === "freecity" || ships > 0;
  const k = `${w.id}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg" style={{ background: "linear-gradient(#1a2030, #2a2a33 70%, #1d1d22)" }} role="img" aria-label={`The front with ${w.name}`}>
      <defs>
        <radialGradient id={`boom-${k}`}><stop offset="0%" stopColor="#ffe9a8" /><stop offset="50%" stopColor="#ff8a3c" /><stop offset="100%" stopColor="#ff3c1e" stopOpacity="0" /></radialGradient>
        <linearGradient id={`trail-${k}`} x1="0" x2="1"><stop offset="0%" stopColor="#fff" stopOpacity="0" /><stop offset="100%" stopColor="#ffd9a0" /></linearGradient>
      </defs>
      {/* stars */}
      {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={(i * 97) % W} cy={(i * 37) % 90} r={0.8} fill="#fff" opacity={0.3 + (i % 3) * 0.2} />)}
      {/* ground, and sea under it when it's a war over water */}
      <rect x={0} y={GROUND} width={W} height={H - GROUND} fill="#23211f" />
      {sea ? <rect x={0} y={GROUND + 26} width={W} height={H - GROUND - 26} fill="#16263a" /> : null}
      {/* your spire */}
      <g transform={`translate(28 ${GROUND})`}>
        <rect x={0} y={-120} width={26} height={120} fill="#3b4256" /><rect x={6} y={-150} width={14} height={30} fill="#4b5470" /><line x1={13} y1={-150} x2={13} y2={-172} stroke="#9aa6c4" />
        <circle cx={13} cy={-172} r={2.5} fill="var(--accent)"><animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite" /></circle>
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={4 + (i % 3) * 7} y={-112 + Math.floor(i / 3) * 26} width={4} height={6} fill="#f4d58a" opacity={0.7} />)}
        <text x={13} y={18} textAnchor="middle" fontSize={12} fill="#cfd6e6">{save.arcology.name}</text>
      </g>
      {/* their city */}
      <g transform={`translate(${W - 70} ${GROUND})`}>
        {[0, 16, 30].map((x, i) => <rect key={i} x={x} y={-60 - i * 18} width={14} height={60 + i * 18} fill="#4a3434" />)}
        {w.front > 40 ? <g><circle cx={22} cy={-50} r={10} fill={`url(#boom-${k})`}><animate attributeName="r" values="4;14;4" dur="1.7s" repeatCount="indefinite" /></circle><path d="M18 -96 q4 -18 10 -30" stroke="#555" strokeWidth={6} opacity={0.5} fill="none" /></g> : null}
        <text x={22} y={18} textAnchor="middle" fontSize={12} fill="#e6cfcf">{w.name}</text>
      </g>
      {/* the front */}
      <line x1={fx} y1={GROUND - 70} x2={fx} y2={GROUND} stroke="#ffcf6e" strokeDasharray="3 4" opacity={0.6} />
      {/* armies */}
      {Array.from({ length: tanks }, (_, i) => (
        <g key={`t${i}`} transform={`translate(${fx - 24 - (i % 4) * 26} ${GROUND - 10 - Math.floor(i / 4) * 12}) scale(1.5)`}>
          <rect x={0} y={0} width={14} height={6} rx={1.5} fill="#7f9a6b" /><rect x={4} y={-3} width={6} height={3} fill="#6f8a5b" /><line x1={10} y1={-2} x2={18} y2={-3} stroke="#6f8a5b" strokeWidth={1.4} />
          <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;2 0;0 0" dur={`${1.2 + (i % 3) * 0.3}s`} repeatCount="indefinite" />
        </g>
      ))}
      {Array.from({ length: theirs }, (_, i) => (
        <g key={`e${i}`} transform={`translate(${fx + 6 + (i % 4) * 26} ${GROUND - 10 - Math.floor(i / 4) * 12}) scale(1.5)`}>
          <rect x={0} y={0} width={14} height={6} rx={1.5} fill="#9a6b6b" /><line x1={4} y1={-1} x2={-4} y2={-2} stroke="#8a5b5b" strokeWidth={1.4} />
        </g>
      ))}
      {/* fire along the front */}
      {Array.from({ length: 4 }, (_, i) => (
        <circle key={`f${i}`} cx={fx + (i - 1.5) * 14} cy={GROUND - 6} r={4} fill={`url(#boom-${k})`}>
          <animate attributeName="r" values="1;9;1" dur={`${0.9 + i * 0.35}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0;1" dur={`${0.9 + i * 0.35}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* aircraft and drones, crossing to the front and beyond */}
      {Array.from({ length: air }, (_, i) => {
        const jet = i < jets;
        const y = 40 + (i % 4) * 16;
        const dur = jet ? 3.2 + (i % 3) * 0.5 : 5 + (i % 3);
        return (
          <g key={`a${i}`}>
            {jet ? <path d="M0 0 l-12 -3 l3 3 l-3 3 z" fill="#cdd6ea" /> : <g><rect x={-4} y={-1.5} width={8} height={3} fill="#aab4c8" /><line x1={-7} y1={-3} x2={7} y2={-3} stroke="#aab4c8" /></g>}
            <animateMotion dur={`${dur}s`} begin={`${(i * 0.7) % dur}s`} repeatCount="indefinite" path={`M60 ${y + 30} Q ${fx} ${y - 20} ${W - 50} ${y + 10}`} rotate="auto" />
          </g>
        );
      })}
      {/* missiles, arcing in, and what they hit */}
      {Array.from({ length: missiles }, (_, i) => {
        const dur = 2.4 + (i % 3) * 0.4;
        const tx = Math.min(W - 60, fx + 60 + (i % 3) * 40);
        return (
          <g key={`m${i}`}>
            <g><rect x={-6} y={-1} width={10} height={2} fill="#ffd9a0" /><rect x={-16} y={-0.5} width={10} height={1} fill={`url(#trail-${k})`} />
              <animateMotion dur={`${dur}s`} begin={`${i * 0.55}s`} repeatCount="indefinite" path={`M70 ${GROUND - 60} Q ${(70 + tx) / 2} ${10} ${tx} ${GROUND - 4}`} rotate="auto" /></g>
            <circle cx={tx} cy={GROUND - 6} r={2} fill={`url(#boom-${k})`}>
              <animate attributeName="r" values="0;0;16;0" keyTimes="0;0.85;0.93;1" dur={`${dur}s`} begin={`${i * 0.55}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
      {/* rods from orbit */}
      {orbit ? (
        <g><line x1={W - 120} y1={0} x2={W - 120} y2={GROUND} stroke="#bfe3ff" strokeWidth={2} opacity={0}>
          <animate attributeName="opacity" values="0;0;1;0" keyTimes="0;0.8;0.85;1" dur="6s" repeatCount="indefinite" /></line></g>
      ) : null}
      {/* ships */}
      {sea ? Array.from({ length: ships }, (_, i) => (
        <g key={`s${i}`} transform={`translate(${120 + i * 46} ${GROUND + 38})`}>
          <path d="M-14 0 h28 l-5 6 h-18 z" fill="#6c7a8f" /><rect x={-4} y={-6} width={8} height={6} fill="#7d8ba0" />
          <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;0 1.5;0 0" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
        </g>
      )) : null}
      {/* the counts */}
      <g fontSize={12} fill="#cfd6e6">
        <text x={8} y={16}><tspan fontWeight={600}>You</tspan> · air {Math.round(f.by.air)} · sea {Math.round(f.by.sea)} · ground {Math.round(f.by.ground)} · missiles {Math.round(f.by.missile)}{f.by.space ? ` · space ${Math.round(f.by.space)}` : ""}</text>
        <text x={W - 8} y={32} textAnchor="end"><tspan fontWeight={600}>{w.name}</tspan> · strength {enemy?.strength ?? "?"}</text>
      </g>
    </svg>
  );
}

