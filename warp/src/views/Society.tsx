/**
 * SOCIETY — what your arcology has become, why, and what the court is making of it.
 *
 * Eight habits of the city, each with what moved it and how far; the doctrines; what people think
 * of you; the laws in force and the cases before the court; and a way down to the street to see it.
 */
import { useState } from "react";
import { Footprints } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Card, Meter, Section, Stat, cx } from "../lib/ui";
import { cultureOf, drivers, normLine, NORMS, NORM_IDS, type Norm } from "../engine/culture";
import { courtOf, lawsOf } from "../engine/court";
import { LAWS, LAW_BY_ID } from "../data/laws";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { EVENT_BY_ID, resolveEvent } from "../engine/events";
import { momentsOf } from "../engine/moments";
import { places, startWalk } from "../engine/walk";
import MomentCard from "./MomentCard";

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 120, h = 28;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h / 2 - (v / 100) * (h / 2 - 2)}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0" aria-hidden>
      <line x1="0" x2={w} y1={h / 2} y2={h / 2} stroke="currentColor" opacity=".15" />
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
    </svg>
  );
}

function Bar({ v }: { v: number }) {
  const left = v < 0 ? 50 + v / 2 : 50;
  return (
    <div className="relative h-1.5 rounded-full" style={{ background: "var(--line-strong)" }}>
      <div className="absolute top-0 bottom-0 w-px" style={{ left: "50%", background: "var(--text-lo)" }} />
      <div className="absolute top-0 bottom-0 rounded-full" style={{ left: `${left}%`, width: `${Math.abs(v) / 2}%`, background: "var(--accent)" }} />
    </div>
  );
}

function NormCard({ n }: { n: Norm }) {
  const { save } = useGame();
  const c = cultureOf(save);
  const v = c.norms[n];
  const hist = c.history.slice(-16).map((h) => h.norms[n]);
  const ago = c.history.length > 8 ? c.history[c.history.length - 9].norms[n] : hist[0] ?? v;
  const d = NORMS[n];
  const why = drivers(save, n, 12);
  const trend = v - (ago ?? v);
  return (
    <Card>
      <div className="flex items-baseline gap-2">
        <span className="text-[13.5px] flex-1">{d.name}</span>
        <span className="font-mono text-[12px]">{Math.round(v)}</span>
        {Math.abs(trend) >= 2 ? <span className={cx("font-mono text-[11px]", trend > 0 ? "acc" : "dim")}>{trend > 0 ? "▲" : "▼"}{Math.abs(Math.round(trend))}</span> : null}
      </div>
      <div className="flex justify-between text-[10.5px] uppercase tracking-wider dim mt-1.5 mb-1"><span>{d.low}</span><span>{d.high}</span></div>
      <Bar v={v} />
      <div className="flex gap-3 items-center mt-2">
        <p className="font-prose text-[13.5px] leading-snug flex-1">{normLine(n, v)}</p>
        <Spark values={hist} />
      </div>
      {why.length ? (
        <ul className="mt-2 space-y-0.5">
          {why.map((w) => (
            <li key={w.why} className="text-[11.5px] flex gap-2">
              <span className={cx("font-mono w-10 shrink-0 text-right", w.by > 0 ? "acc" : "dim")}>{w.by > 0 ? "+" : ""}{w.by}</span>
              <span className={w.why.startsWith("you: ") ? "" : "dim"}>{w.why.startsWith("you: ") ? `You: ${w.why.slice(5)}` : w.why}</span>
            </li>
          ))}
        </ul>
      ) : <div className="text-[11.5px] dim mt-2">Nothing has moved it in the last twelve weeks.</div>}
    </Card>
  );
}

function Court() {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState<string[]>([]);
  const laws = lawsOf(save);
  const court = courtOf(save);
  const cases = save.events.filter((e) => e.kind.startsWith("court_"));
  const norms = cultureOf(save).norms;
  const talk = LAWS.filter((l) => !laws.some((x) => x.id === l.id))
    .map((l) => ({ l, gap: (l.at - norms[l.norm]) * l.dir }))
    .filter((x) => x.gap > 0 && x.gap <= 20).sort((a, b) => a.gap - b.gap).slice(0, 4);

  return (
    <Section title="The court">
      {said.map((t, i) => <Card key={i} className="mb-2"><p className="font-prose text-[14.5px] leading-relaxed whitespace-pre-line">{t}</p></Card>)}
      {cases.map((e) => (
        <Card key={e.id} className="mb-3 border-l-2">
          <div className="text-[11px] uppercase tracking-wider dim mb-1.5">Before the court · week {e.week}</div>
          <p className="font-prose text-[15px] leading-relaxed mb-3 whitespace-pre-line">{e.seed}</p>
          <div className="flex flex-wrap gap-2">
            {(EVENT_BY_ID[e.kind]?.options ?? []).map((o) => (
              <Button key={o.id} size="sm" title={o.note} onClick={() => { let t = ""; mutate((s) => { t = resolveEvent(s, e, o.id); }); setSaid((xs) => [...xs, t]); }}>{o.label}</Button>
            ))}
          </div>
        </Card>
      ))}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Card>
          <div className="text-[11px] uppercase tracking-wider dim mb-2">Laws in force</div>
          {laws.length ? laws.map((x) => {
            const l = LAW_BY_ID[x.id];
            if (!l) return null;
            return (
              <div key={x.id} className="mb-2.5">
                <div className="text-[13px]">{l.name} <span className="text-[11px] dim">since week {x.week} · {x.by === "you" ? "you signed it" : "passed by the court"}{x.exempt ? " · your household exempt" : ""}</span></div>
                <div className="font-prose text-[13px] mid">{l.text}</div>
              </div>
            );
          }) : <div className="text-[12.5px] dim">None yet. The court writes laws when the city's habits go far enough one way.</div>}
        </Card>
        <Card>
          <div className="text-[11px] uppercase tracking-wider dim mb-2">Being talked about</div>
          {talk.length ? talk.map(({ l, gap }) => (
            <div key={l.id} className="mb-2">
              <div className="text-[13px]">{l.name}</div>
              <div className="text-[11.5px] dim">{NORMS[l.norm].name} is {Math.round(gap)} short of it · {l.petitioners}</div>
            </div>
          )) : <div className="text-[12.5px] dim">Nobody is drafting anything yet.</div>}
          {court.record.length ? (
            <>
              <div className="text-[11px] uppercase tracking-wider dim mt-3 mb-1.5">Rulings</div>
              {court.record.slice(-6).reverse().map((r, i) => (
                <div key={i} className="text-[12px] flex gap-2"><span className="font-mono dim w-12 shrink-0">wk {r.week}</span><span>{LAW_BY_ID[r.law]?.name}{r.kind === "repeal" ? " (repeal)" : ""}: {r.outcome}</span></div>
              ))}
            </>
          ) : null}
          <div className="text-[11px] dim mt-3">The court sits every four weeks{court.last ? `; last sat week ${court.last}` : ""}.</div>
        </Card>
      </div>
    </Section>
  );
}

function Walk() {
  const { save, mutate } = useGame();
  const [escort, setEscort] = useState("");
  const [on, setOn] = useState<string | null>(null);
  const house = Object.values(save.people).filter((p) => p.status === "owned" && p.age >= 18 && p.health.recovery_weeks === 0);
  const open = momentsOf(save).filter((m) => m.source === "walk" && m.open && m.id !== on);
  return (
    <Section title="Walk the city">
      <div className="flex flex-wrap items-center gap-2 mb-2.5">
        <span className="text-[12px] dim">Take with you:</span>
        <select value={escort} onChange={(e) => setEscort(e.target.value)} className="!w-auto">
          <option value="">nobody</option>
          {house.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 mb-3">
        {places(save).map((pl) => (
          <button key={pl.id} className="actbtn text-left" onClick={() => { let id = ""; mutate((s) => { id = startWalk(s, pl.id, escort || undefined); }); setOn(id); }}>
            <span className="flex items-center gap-1.5 text-[13px]"><Footprints size={13} /> {pl.name}</span>
            <span className="block text-[11px] dim">{pl.blurb}</span>
          </button>
        ))}
      </div>
      {on ? <MomentCard id={on} onClose={() => setOn(null)} /> : null}
      {open.length ? (
        <div className="mt-3 space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider dim">Walks you left halfway</div>
          {open.slice(-4).reverse().map((m) => (
            <button key={m.id} className="actbtn w-full text-left" onClick={() => setOn(m.id)}>
              <span className="block text-[13px]">{m.title} · week {m.week}</span>
              <span className="block text-[11px] dim truncate">{m.log[m.log.length - 1]?.text.slice(0, 120)}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="text-[11.5px] dim mt-2">Whatever you do down there, people see. When you end the walk, it counts as something you did in public.</div>
    </Section>
  );
}

export default function Society() {
  const { save } = useGame();
  const arc = save.arcology;
  const c = cultureOf(save);
  const strongest = [...NORM_IDS].sort((a, b) => Math.abs(c.norms[b]) - Math.abs(c.norms[a])).filter((n) => Math.abs(c.norms[n]) >= 25).slice(0, 3);
  const publicDeeds = (save.deeds ?? []).filter((d) => d.public).slice(-6).reverse();
  const rumors = [...save.rumors].sort((a, b) => b.salience - a.salience).slice(0, 4);

  return (
    <>
      <Section title="What your city has become">
        <Card className="mb-3">
          {strongest.length
            ? strongest.map((n) => <p key={n} className="font-prose text-[15px] leading-relaxed">{normLine(n, c.norms[n])}</p>)
            : <p className="font-prose text-[15px] leading-relaxed">The city hasn't settled into anything yet. Citizens are watching what you do to decide what's normal.</p>}
        </Card>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <Stat label="citizens" value={arc.population.toLocaleString()} />
          <Stat label="prosperity" value={Math.round(arc.prosperity)} />
          <Stat label="crime" value={Math.round(arc.crime)} tone={arc.crime > 40 ? "bad" : undefined} />
          <Stat label="security" value={Math.round(arc.security)} />
          <Stat label="opinion of you" value={arc.public_standing > 0 ? `+${Math.round(arc.public_standing)}` : Math.round(arc.public_standing)} tone={arc.public_standing >= 3 ? "good" : arc.public_standing <= -3 ? "bad" : undefined} />
          <Stat label="reputation" value={Math.round(arc.rep).toLocaleString()} />
        </div>
      </Section>

      <Section title="How citizens behave, and why">
        <div className="grid gap-2.5 sm:grid-cols-2">{NORM_IDS.map((n) => <NormCard key={n} n={n} />)}</div>
      </Section>

      <Court />

      <Walk />

      <Section title="What people think of you">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Card>
            <div className="text-[11px] uppercase tracking-wider dim mb-2">What everyone knows you did</div>
            {publicDeeds.length ? publicDeeds.map((d) => <p key={d.id} className="font-prose text-[13.5px] leading-snug mb-1.5"><span className="font-mono text-[11px] dim">wk {d.week} </span>{d.summary}</p>)
              : <div className="text-[12.5px] dim">Nothing you've done has happened in front of the city yet.</div>}
          </Card>
          <Card>
            <div className="text-[11px] uppercase tracking-wider dim mb-2">What they're saying</div>
            {rumors.length ? rumors.map((r) => <p key={r.id} className="font-prose text-[13.5px] leading-snug mb-1.5">"{r.content.replace(/^"|"$/g, "")}"</p>)
              : <div className="text-[12.5px] dim">No rumours worth repeating.</div>}
            {Object.keys(arc.doctrines).length ? (
              <>
                <div className="text-[11px] uppercase tracking-wider dim mt-3 mb-1.5">Doctrines</div>
                {Object.entries(arc.doctrines).map(([id, st]) => <div key={id} className="mb-1.5"><Meter value={st.adoption} label={DOCTRINE_BY_ID[id]?.noun ?? id} /></div>)}
              </>
            ) : null}
          </Card>
        </div>
      </Section>
    </>
  );
}
