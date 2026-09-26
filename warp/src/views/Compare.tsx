/**
 * COMPARE — your arcology beside its neighbours and the Old World.
 *
 * A scorecard for the citizen and the slave in each place; the city's habits side by side; a typical
 * household in yours and in the one you pick, drawn with the game's own figures in what each would
 * wear; where each is ahead; and a photograph of either household, redrawn from the drawn figures.
 */
import { useMemo, useRef, useState, type RefObject } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Section, cx } from "../lib/ui";
import { hasApiKey } from "../config";
import { frameFigures, redraw, svgToPng, toJpeg } from "../lib/imagegen";
import { NORMS, NORM_IDS } from "../engine/culture";
import { citizenLife, contrast, figureFor, household, METRICS, settingFor, slaveLife, societies, type Society } from "../engine/compare";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import SlaveArt from "./SlaveArt";

function Score({ v, mine }: { v: number; mine?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-1.5 flex-1 rounded-full" style={{ background: "var(--line-strong)" }}>
        <div className="absolute left-0 top-0 bottom-0 rounded-full" style={{ width: `${Math.max(2, v)}%`, background: mine ? "var(--accent)" : "var(--text-lo)" }} />
      </div>
      <span className={cx("text-[11px] w-6 text-right tabular-nums", mine ? "acc" : "dim")}>{Math.round(v)}</span>
    </div>
  );
}

function Scorecard({ all }: { all: Society[] }) {
  return (
    <div className="card p-3 overflow-x-auto">
      <table className="w-full text-[12px]" style={{ minWidth: 120 + all.length * 110 }}>
        <thead>
          <tr className="dim text-left">
            <th className="font-normal pb-1.5 pr-2">0–100, higher is better for them</th>
            {all.map((x) => <th key={x.id} className={cx("font-normal pb-1.5 px-1.5", x.kind === "yours" && "acc")}>{x.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {(["citizen", "slave"] as const).map((who) => [
            <tr key={who}><td colSpan={all.length + 1} className="pt-2 pb-1 text-[10.5px] uppercase tracking-wider dim">{who === "citizen" ? "The citizen" : "The slave"}</td></tr>,
            ...METRICS.filter((m) => m.who === who).map((m) => (
              <tr key={m.id}>
                <td className="pr-2 py-1">{m.label}</td>
                {all.map((x) => <td key={x.id} className="px-1.5 py-1">{x.kind === "oldworld" && who === "slave" ? <span className="dim text-[11px]">no slaves</span> : <Score v={m.score(x)} mine={x.kind === "yours"} />}</td>)}
              </tr>
            )),
          ])}
        </tbody>
      </table>
    </div>
  );
}

/** Your habits and theirs on one bar each: your mark in the accent colour, theirs grey. */
function Habits({ yours, other }: { yours: Society; other: Society }) {
  const at = (v: number) => `${50 + v / 2}%`;
  return (
    <div className="card p-3 grid gap-2 sm:grid-cols-2">
      {NORM_IDS.map((n) => (
        <div key={n}>
          <div className="flex justify-between text-[11.5px] mb-1"><span>{NORMS[n].name}</span><span className="dim">{NORMS[n].low} · {NORMS[n].high}</span></div>
          <div className="relative h-2 rounded-full" style={{ background: "var(--line-strong)" }}>
            <div className="absolute top-0 bottom-0 w-px" style={{ left: "50%", background: "var(--text-lo)" }} />
            <div title={`${other.name}: ${Math.round(other.norms[n])}`} className="absolute -top-0.5 w-2.5 h-3 rounded-sm" style={{ left: `calc(${at(other.norms[n])} - 5px)`, background: "var(--text-lo)" }} />
            <div title={`${yours.name}: ${Math.round(yours.norms[n])}`} className="absolute -top-0.5 w-2.5 h-3 rounded-sm" style={{ left: `calc(${at(yours.norms[n])} - 5px)`, background: "var(--accent)" }} />
          </div>
        </div>
      ))}
      <div className="text-[11px] dim sm:col-span-2"><span className="acc">■</span> {yours.name} · <span style={{ color: "var(--text-lo)" }}>■</span> {other.name}</div>
    </div>
  );
}

function photoPrompt(x: Society): string {
  const h = household(x);
  const setting = settingFor(x);
  if (!h.slave) {
    return `This image is a stylised 3D-style character from a video game, drawn full-length. Redraw it as a single photorealistic full-length photograph of the same adult woman as a real person, standing in ${setting}. She is an ordinary citizen of the Old World, about 34, wearing ${h.citizen.clothes}. Keep her body shape, skin tone, hair and pose as in the drawing.
Show her whole body, from the top of her head to her feet, with the ground visible under her feet. Do not crop at the waist or knees. Nobody else in the frame. Natural light. No text.`;
  }
  const slave = h.slave.clothes === "no clothing" ? "naked" : h.slave.clothes === "body oil" ? "naked, her skin oiled" : `wearing ${h.slave.clothes}`;
  return `This image shows two stylised 3D-style characters from an adult video game, drawn full-length side by side. Redraw it as a single photorealistic full-length photograph of the same two adult women as real people, standing side by side in ${setting}.
On the left: a free citizen of ${x.name}, about 34, wearing ${h.citizen.clothes}${h.citizen.shoes === "heels" ? " and heels" : ""}, standing easily.
On the right: her household slave, an adult woman of about 22, ${slave}, wearing ${h.slave.collar}${h.slave.shoes === "barefoot" ? ", barefoot" : ""}. Her posture shows how slaves are kept there: ${x.norms.personhood >= 30 ? "upright and at ease, a half step behind her owner" : x.norms.personhood <= -30 ? "eyes lowered, hands clasped, a step behind" : "attentive, a step behind her owner"}.
Keep each woman's body shape, skin tone, hair and pose, and exactly what each is wearing or not wearing, as in the drawing. Both are adults. Show both of them entirely, from the top of the head to the feet, with the floor visible under their feet. Do not crop at the waist or knees. Nobody else in the frame. Natural light. No text.`;
}

function HouseholdCard({ x, compact }: { x: Society; compact?: boolean }) {
  const { save, mutate } = useGame();
  const h = household(x);
  const citizen = useMemo(() => figureFor(x, "citizen"), [x.id, h.citizen.clothes, h.citizen.shoes]);
  const slave = useMemo(() => figureFor(x, "slave"), [x.id, h.slave?.clothes, h.slave?.collar, h.slave?.shoes]);
  const refC = useRef<SVGSVGElement>(null);
  const refS = useRef<SVGSVGElement>(null);
  const [busy, setBusy] = useState(false);
  const model = save.models.photo_model ?? "";
  const ph = save.compare_photos?.[x.id];

  const photograph = async () => {
    const svgs = [refC.current, slave ? refS.current : null].filter(Boolean) as SVGSVGElement[];
    if (busy || !model || !svgs.length) return;
    setBusy(true);
    try {
      const framed = await frameFigures(await Promise.all(svgs.map((s) => svgToPng(s, 2.5))));
      const url = await toJpeg(await redraw(model, framed, photoPrompt(x)), 1100, 0.86);
      mutate((s) => { (s.compare_photos ??= {})[x.id] = { model, week: s.arcology.week, url }; });
    } catch (e) {
      const msg = (e as Error).message;
      mutate((s) => { (s.compare_photos ??= {})[x.id] = { ...(s.compare_photos?.[x.id] ?? { model, week: s.arcology.week }), error: msg.slice(0, 220) }; });
    }
    setBusy(false);
  };

  const figure = (p: typeof citizen, ref: RefObject<SVGSVGElement | null>, label: string) => p ? (
    <div className="flex flex-col items-center min-w-0">
      <SlaveArt person={p} height={compact ? 230 : 280} animate={false} svgRef={ref} />
      <div className="text-[10.5px] uppercase tracking-wider dim mt-1">{label}</div>
    </div>
  ) : null;

  return (
    <Card className={cx(x.kind === "yours" && "ring-1 ring-[var(--accent)]")}>
      <div className="flex items-baseline justify-between mb-1">
        <div className={cx("text-[15px]", x.kind === "yours" && "acc")}>{x.name}</div>
        <div className="text-[11px] dim">{x.kind === "yours" ? "yours" : x.where}</div>
      </div>
      {x.doctrines.length ? <div className="text-[11px] dim mb-2">{x.doctrines.map((d) => DOCTRINE_BY_ID[d]?.noun ?? d).join(" · ")}</div> : null}
      {ph?.url ? <img src={ph.url} alt={`a household in ${x.name}`} className="w-full max-h-[26rem] object-contain rounded-lg mb-2" /> : (
        <div className="flex justify-center gap-3 card-2 py-2 mb-2">
          {figure(citizen, refC, "citizen")}
          {figure(slave, refS, "her slave")}
        </div>
      )}
      {/* The drawn figures stay mounted behind a photo, so a retake has something to redraw. */}
      {ph?.url ? (
        <div aria-hidden style={{ position: "absolute", left: -9999, top: 0 }}>
          {citizen ? <SlaveArt person={citizen} height={280} animate={false} svgRef={refC} /> : null}
          {slave ? <SlaveArt person={slave} height={280} animate={false} svgRef={refS} /> : null}
        </div>
      ) : null}
      <p className="text-[12px] mb-0.5">{h.citizen.line}</p>
      {h.slave ? <p className="text-[12px] mb-1.5">{h.slave.line}</p> : null}
      <p className="font-prose text-[13.5px] leading-snug mb-2">{h.family}</p>
      <div className="text-[10.5px] uppercase tracking-wider dim mb-0.5">A citizen's life</div>
      <ul className="text-[12px] leading-snug mb-2 list-disc pl-4">{citizenLife(x).map((l, i) => <li key={i}>{l}</li>)}</ul>
      <div className="text-[10.5px] uppercase tracking-wider dim mb-0.5">{h.slave ? "A slave's life" : "Slaves"}</div>
      <ul className="text-[12px] leading-snug mb-2 list-disc pl-4">{slaveLife(x).map((l, i) => <li key={i}>{l}</li>)}</ul>
      {model && hasApiKey() ? (
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" kind="ghost" disabled={busy} onClick={() => void photograph()} title="Redraws the drawn figures as one full-length photograph, in the city's own setting. One image, billed by the photo model in Settings">{busy ? "photographing…" : ph?.url ? "retake the photograph" : "photograph this household"}</Button>
          {ph?.url ? <button className="text-[11px] dim underline" onClick={() => mutate((s) => { if (s.compare_photos) delete s.compare_photos[x.id]; })}>show the drawing</button> : null}
        </div>
      ) : <div className="text-[11px] dim">Set a photo model in Settings to photograph a household.</div>}
      {ph?.error ? <div className="text-[11.5px] warn mt-1">The model wouldn't do it: {ph.error}</div> : null}
    </Card>
  );
}

export default function Compare() {
  const { save } = useGame();
  const all = societies(save);
  const yours = all[0];
  const others = all.slice(1);
  const [pick, setPick] = useState(others[0]?.id ?? "");
  const other = others.find((x) => x.id === pick) ?? others[0];
  const c = other ? contrast(yours, other) : { theirs: [], ours: [] };

  return (
    <>
      <Section title="Your arcology, beside the others">
        <p className="text-[12.5px] dim mb-2.5">Read from the city as it is this week: its habits, its laws and policies, prosperity, crime and security. Neighbours are judged by their doctrines; the Old World by how stable its regions are.</p>
        <Scorecard all={all} />
      </Section>

      {other ? (
        <>
          <Section title="A typical household" right={
            <div className="flex flex-wrap gap-1.5">
              {others.map((x) => <button key={x.id} className={cx("chip !text-[11.5px]", x.id === other.id && "on")} onClick={() => setPick(x.id)}>{x.name}</button>)}
            </div>
          }>
            <div className="grid gap-2.5 md:grid-cols-2">
              <HouseholdCard x={yours} />
              <HouseholdCard key={other.id} x={other} />
            </div>
          </Section>

          <Section title={`How ${yours.name} and ${other.name} live`}>
            <Habits yours={yours} other={other} />
          </Section>

          <Section title="Who's ahead">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Card>
                <div className="text-[11px] uppercase tracking-wider acc mb-1">Where {yours.name} is ahead</div>
                {c.ours.length ? <ul className="text-[12.5px] leading-snug list-disc pl-4">{c.ours.map((l, i) => <li key={i}>{l}</li>)}</ul> : <div className="text-[12px] dim">Nowhere by much.</div>}
              </Card>
              <Card>
                <div className="text-[11px] uppercase tracking-wider dim mb-1">Where {other.name} is ahead</div>
                {c.theirs.length ? <ul className="text-[12.5px] leading-snug list-disc pl-4">{c.theirs.map((l, i) => <li key={i}>{l}</li>)}</ul> : <div className="text-[12px] dim">Nowhere by much.</div>}
              </Card>
            </div>
          </Section>
        </>
      ) : null}
    </>
  );
}
