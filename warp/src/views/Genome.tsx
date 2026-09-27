/**
 * THE GENOME PROGRAM — write a gene edit in your own words, have it designed, see what it costs and
 * what it would do to one of your slaves, and run it on your slaves, your citizens, or both.
 */
import { useMemo, useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Meter, Section, cx } from "../lib/ui";
import { modelsAvailable } from "../config";
import { apply, citizenShare, design, genomeOf, PER_CITIZEN, PER_SLAVE, quote, resistance, RESISTS, rewrite, slaveShare, topUp, type GeneSpec, type Target } from "../engine/genome";
import SlaveArt from "./SlaveArt";

const TARGETS: [Target, string][] = [["slaves", "my slaves"], ["citizens", "my citizens"], ["both", "both"]];

function Changes({ spec }: { spec: GeneSpec }) {
  const chip = (label: string, key: string) => <span key={key} className="chip !text-[11px] pointer-events-none">{label}</span>;
  const out = [
    spec.skin && chip(`${spec.skin} skin`, "skin"), spec.hair && chip(`${spec.hair} hair`, "hair"), spec.eyes && chip(`${spec.eyes} eyes`, "eyes"),
    spec.height && chip(`${spec.height > 0 ? "+" : ""}${spec.height} cm`, "h"),
    ...RESISTS.filter((r) => spec.resist[r]).map((r) => chip(`${r} resistance ${Math.round((spec.resist[r] ?? 0) * 100)}%`, r)),
    spec.health && chip(`+${Math.round(spec.health)} health`, "hp"),
  ].filter(Boolean);
  return <div className="flex flex-wrap gap-1.5">{out.length ? out : <span className="text-[12px] dim">Nothing the clinics can do. Try naming a colour, a height, or what it should resist.</span>}</div>;
}

function Draft() {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState("");
  const d = genomeOf(save).draft;
  const slaves = Object.values(save.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);
  const sample = useMemo(() => {
    if (!d || d.target === "citizens" || !slaves[0]) return null;
    const p = structuredClone(slaves[0]);
    rewrite(p, d.spec, d.name);
    return { before: slaves[0], after: p };
  }, [d, slaves[0]?.id]);
  if (!d) return said ? <Card><p className="font-prose text-[14px]">{said}</p></Card> : null;
  const q = quote(save, d.target, d.spec);
  return (
    <Card className="ring-1 ring-[var(--accent)]">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[15px] acc">The {d.name} program</span>
        <span className="text-[11px] dim">{d.by === "narrator" ? "designed by the narrator" : "read by the game"} · complexity {d.spec.complexity}</span>
      </div>
      <p className="text-[12px] dim mb-2">"{d.text}"</p>
      <Changes spec={d.spec} />
      {sample ? (
        <div className="flex justify-center gap-4 card-2 py-2 my-2.5">
          <div className="text-center"><SlaveArt person={sample.before} height={220} animate={false} /><div className="text-[10.5px] uppercase tracking-wider dim">{sample.before.name}, now</div></div>
          <div className="text-center"><SlaveArt person={sample.after} height={220} animate={false} /><div className="text-[10.5px] uppercase tracking-wider acc">after</div></div>
        </div>
      ) : null}
      {d.spec.society ? <p className="font-prose text-[14px] leading-relaxed my-2">{d.spec.society}</p> : null}
      {d.spec.side_effects ? <p className="text-[12px] mb-1"><span className="dim">Side effects:</span> {d.spec.side_effects}</p> : null}
      <p className="text-[12px] mb-2"><span className="dim">How citizens take it:</span> {d.spec.reaction > 0.4 ? "they like it" : d.spec.reaction < -0.4 ? "they resent it" : "divided"} (standing {d.spec.reaction >= 0 ? "+" : ""}{d.spec.reaction})</p>
      <div className="text-[12px] dim mb-2">
        {[q.citizens && `${q.citizens.toLocaleString()} citizens × ¤${PER_CITIZEN}`, q.slaves && `${q.slaves} slave${q.slaves === 1 ? "" : "s"} × ¤${PER_SLAVE}`].filter(Boolean).join(" + ")} × complexity {d.spec.complexity} = <span className="acc">¤{q.cost.toLocaleString()}</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" kind="primary" disabled={save.arcology.cash < q.cost} onClick={() => { let t = ""; mutate((s) => { t = apply(s); }); setSaid(t); }}>Run it · ¤{q.cost.toLocaleString()}</Button>
        <Button size="sm" kind="ghost" onClick={() => mutate((s) => { genomeOf(s).draft = undefined; })}>Discard</Button>
        {save.arcology.cash < q.cost ? <span className="text-[11.5px] warn self-center">You have ¤{Math.round(save.arcology.cash).toLocaleString()}.</span> : null}
      </div>
    </Card>
  );
}

function Writer() {
  const { save, mutate } = useGame();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [target, setTarget] = useState<Target>("citizens");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const go = async () => {
    setBusy(true); setErr("");
    const copy = structuredClone(save);
    const res = await design(copy, { name, text, target }, modelsAvailable() ? save.models.narrator_model : undefined, save.models.fallback_model);
    if (!res.ok) setErr(res.error ?? "");
    else { mutate((s) => { genomeOf(s).draft = copy.genome?.draft; }); setName(""); setText(""); }
    setBusy(false);
  };
  return (
    <Card>
      <div className="text-[11px] uppercase tracking-wider dim mb-1">Write a gene edit</div>
      <div className="text-[11.5px] dim mb-2">In your words. It's designed from a menu the clinics can deliver: skin, hair and eye colour, height, resistance to heat, cold, disease and pollution, and health. {modelsAvailable() ? "The narrator designs it and writes what it does to the city." : "Without a narrator model the game reads your words for those things."}</div>
      <input className="mb-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Its name, e.g. Azure" maxLength={60} />
      <textarea className="mb-2" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="What it does, e.g. Blue skin for every citizen, and lungs that shrug off the smog." maxLength={600} />
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className="text-[12px] dim">For</span>
        {TARGETS.map(([t, label]) => <button key={t} className={cx("chip !text-[11.5px]", target === t && "on")} onClick={() => setTarget(t)}>{label}</button>)}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" kind="primary" disabled={busy || !text.trim()} onClick={() => void go()}>{busy ? "designing…" : "Design it"}</Button>
        {err ? <span className="text-[11.5px] warn">{err}</span> : null}
      </div>
    </Card>
  );
}

function Programs() {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState("");
  const edits = genomeOf(save).edits;
  if (!edits.length) return <Card><p className="text-[12.5px] dim">No programs have run yet.</p></Card>;
  return (
    <div className="space-y-2.5">
      {said ? <Card><p className="font-prose text-[14px]">{said}</p></Card> : null}
      {edits.map((e) => {
        const c = citizenShare(save, e), sl = slaveShare(save, e);
        const more = topUp(save, e.id, true);
        return (
          <Card key={e.id}>
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="text-[14px]">The {e.name} program</span>
              <span className="text-[11px] dim">week {e.week} · ¤{e.cost.toLocaleString()} so far</span>
            </div>
            <Changes spec={e.spec} />
            <div className="grid grid-cols-2 gap-3 my-2">
              {e.target !== "slaves" ? <Meter value={c * 100} label="citizens it reaches, %" /> : <div />}
              {e.target !== "citizens" ? <Meter value={sl * 100} label="your slaves it reaches, %" /> : <div />}
            </div>
            {e.spec.society ? <p className="font-prose text-[13.5px] leading-relaxed mb-2">{e.spec.society}</p> : null}
            {more.citizens || more.slaves.length ? (
              <Button size="sm" kind="ghost" disabled={save.arcology.cash < more.cost} onClick={() => { let t = ""; mutate((s) => { t = topUp(s, e.id).line ?? ""; }); setSaid(t); }}>
                Reach the rest: {[more.citizens && `${more.citizens.toLocaleString()} new citizens`, more.slaves.length && `${more.slaves.length} new slave${more.slaves.length === 1 ? "" : "s"}`].filter(Boolean).join(", ")} · ¤{more.cost.toLocaleString()}
              </Button>
            ) : <span className="text-[11.5px] dim">Everyone it was for has it.</span>}
          </Card>
        );
      })}
    </div>
  );
}

export default function Genome() {
  const { save } = useGame();
  return (
    <>
      <Section title="The genome program">
        <p className="text-[12.5px] dim mb-2.5">Rewrite the DNA of your slaves, your citizens, or both. Priced by the head (¤{PER_CITIZEN} a citizen, ¤{PER_SLAVE} a slave) times how hard the edit is. What it does to the city is written into the description every narrator reads.</p>
        <div className="grid gap-2.5 lg:grid-cols-2 items-start">
          <Writer />
          <Draft />
        </div>
      </Section>
      <Section title="What the edits spare them">
        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["citizens", "slaves"] as const).map((who) => (
              <div key={who} className="space-y-2">
                <div className="text-[10.5px] uppercase tracking-wider dim">{who === "citizens" ? "Your citizens" : "Your slaves"}</div>
                {RESISTS.map((r) => <Meter key={r} value={resistance(save, r, who) * 100} label={`${r}: harm spared, %`} />)}
              </div>
            ))}
          </div>
          <p className="text-[11.5px] dim mt-2">Heat and cold cut what heatwaves and freezes cost and do to the slaves working outside; pollution cuts what smog and dust do; disease cuts the fevers that come in on the ships.</p>
        </Card>
      </Section>
      <Section title="Programs run">
        <Programs />
      </Section>
    </>
  );
}
