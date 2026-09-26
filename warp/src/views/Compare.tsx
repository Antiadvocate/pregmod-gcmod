/**
 * COMPARE — your arcology beside its neighbours and the Old World.
 *
 * A scorecard for the citizen and the slave in each place; the city's habits side by side; a typical
 * household in yours and in the one you pick, drawn with the game's own figures in what each would
 * wear; where each is ahead; and a photograph of either household, redrawn from the drawn figures.
 */
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Section, cx } from "../lib/ui";
import { hasApiKey, modelsAvailable } from "../config";
import { frameFigures, redraw, svgToPng, toJpeg } from "../lib/imagegen";
import { NORMS, NORM_IDS } from "../engine/culture";
import { citizenLife, contrast, figureFor, fingerprint, household, METRICS, settingFor, slaveLife, societies, type Society } from "../engine/compare";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { castOf, dayInTheLife, moving, writeDay } from "../engine/comparestory";

/** Days being written right now, so a re-render or a second mount doesn't pay for the same one twice. */
const inflight = new Set<string>();
import SlaveArt from "./SlaveArt";

const listed = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

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
  const c = castOf(x);
  const setting = settingFor(x);
  if (!h.slave) {
    return `This image is a stylised 3D-style character from a video game, drawn full-length. Redraw it as a single photorealistic full-length photograph of the same adult woman as a real person, standing in ${setting}. She is an ordinary citizen of the Old World, about 34, wearing ${h.citizen.clothes}. Keep her body shape, skin tone, hair and pose as in the drawing.
Show her whole body, from the top of her head to her feet, with the ground visible under her feet. Do not crop at the waist or knees. A step behind her stands her husband, ${c.husband}, an adult man of about 37 in ${h.husband}. Nobody else in the frame. Natural light. No text.`;
  }
  const slave = h.slave.clothes === "no clothing" ? "naked" : h.slave.clothes === "body oil" ? "naked, her skin oiled" : `wearing ${h.slave.clothes}`;
  return `This image shows two stylised 3D-style characters from an adult video game, drawn full-length side by side. Redraw it as a single photorealistic full-length photograph of the same two adult women as real people, standing side by side in ${setting}.
On the left: ${c.wife}, a free citizen of ${x.name}, about 34, wearing ${h.citizen.clothes}${h.citizen.shoes === "heels" ? " and heels" : ""}, standing easily.
On the right: ${c.slave}, her household slave, an adult woman of about 22, ${slave}, wearing ${h.slave.collar}${h.slave.shoes === "barefoot" ? ", barefoot" : ""}. Her posture shows how slaves are kept there: ${x.norms.personhood >= 30 ? "upright and at ease, a half step behind her owner" : x.norms.personhood <= -30 ? "eyes lowered, hands clasped, a step behind" : "attentive, a step behind her owner"}.
Keep each woman's body shape, skin tone, hair and pose, and exactly what each is wearing or not wearing, as in the drawing. Both are adults. Show both of them entirely, from the top of the head to the feet, with the floor visible under their feet. Do not crop at the waist or knees. Just behind them, and not blocking either woman, stands the citizen's husband, an adult man of about 37 in ${h.husband}. Nobody else in the frame. Natural light. No text.`;
}

function HouseholdCard({ x, other, yours, compact }: { x: Society; other: Society; yours: Society; compact?: boolean }) {
  const { save, mutate } = useGame();
  const h = household(x);
  const citizen = useMemo(() => figureFor(x, "citizen"), [x.id, h.citizen.clothes, h.citizen.shoes]);
  const slave = useMemo(() => figureFor(x, "slave"), [x.id, h.slave?.clothes, h.slave?.collar, h.slave?.shoes]);
  const refC = useRef<SVGSVGElement>(null);
  const refS = useRef<SVGSVGElement>(null);
  const [busy, setBusy] = useState(false);
  const model = save.models.photo_model ?? "";
  const phAll = save.compare_photos?.[x.id];
  const dressed = JSON.stringify(household(x));
  const ph = phAll && (!phAll.fp || phAll.fp === dressed) ? phAll : phAll?.error ? { ...phAll, url: undefined } : undefined;
  const cast = castOf(x);
  const key = `${x.id}:${other.id}`;
  const fp = fingerprint(x) + fingerprint(other);
  const told = save.compare_stories?.[key];
  const fresh = !!told && told.fp === fp;
  const [writing, setWriting] = useState(false);
  const [tellErr, setTellErr] = useState("");
  const [plain, setPlain] = useState(false);
  const story = dayInTheLife(save, x, other, yours);
  const write = async () => {
    if (inflight.has(key)) return;
    inflight.add(key); setWriting(true); setTellErr("");
    try {
      const res = await writeDay(save, x, other, save.models.narrator_model, save.models.fallback_model);
      if (res.ok && res.written) {
        const w = res.written;
        mutate((s) => {
          (s.compare_stories ??= {})[key] = { model: res.model ?? "", week: s.arcology.week, text: w.story.join("\n\n"), fp };
          // The first telling settles what they wear; later tellings for other comparisons keep it.
          const was = s.compare_written?.[x.id];
          if (!was || was.fp !== fingerprint(x)) (s.compare_written ??= {})[x.id] = { model: res.model ?? "", week: s.arcology.week, fp: fingerprint(x), outfits: w.outfits };
        });
        setPlain(false);
      } else setTellErr(res.error ?? "The narrator returned nothing.");
    } finally { inflight.delete(key); setWriting(false); }
  };
  // The narrator writes each day once, and again only when the laws or the habits change.
  useEffect(() => { if (modelsAvailable() && !fresh && !tellErr) void write(); }, [fp]);
  const paras = fresh && !plain ? told!.text.split(/\n\s*\n/) : story;

  const photograph = async () => {
    const svgs = [refC.current, slave ? refS.current : null].filter(Boolean) as SVGSVGElement[];
    if (busy || !model || !svgs.length) return;
    setBusy(true);
    try {
      const framed = await frameFigures(await Promise.all(svgs.map((s) => svgToPng(s, 2.5))));
      const url = await toJpeg(await redraw(model, framed, photoPrompt(x)), 1100, 0.86);
      mutate((s) => { (s.compare_photos ??= {})[x.id] = { model, week: s.arcology.week, url, fp: dressed }; });
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
      {x.doctrines.length ? <div className="text-[11px] dim mb-0.5">{x.doctrines.map((d) => DOCTRINE_BY_ID[d]?.noun ?? d).join(" · ")}</div> : null}
      {x.kind !== "oldworld" ? <div className="text-[11px] dim mb-0.5">Laws: {x.laws.length ? x.laws.map((l) => l.name).join(" · ") : "none"}</div> : null}
      {h.dress ? (
        <div className="text-[11.5px] mb-2">
          <span className="acc">{h.dress.code.name}</span>
          <span className="dim">{h.dress.because.length ? `, from ${listed(h.dress.because)}` : ", because nothing has shaped it yet"}{h.dress.runnerUp ? `. ${h.dress.runnerUp.code.name} pulls too (${listed(h.dress.runnerUp.because)}).` : "."}{x.written ? " The narrator has dressed them by the laws." : ""}</span>
        </div>
      ) : null}
      {ph?.url ? <img src={ph.url} alt={`a household in ${x.name}`} className="w-full max-h-[26rem] object-contain rounded-lg mb-2" /> : (
        <div className="flex justify-center gap-3 card-2 py-2 mb-2">
          {figure(citizen, refC, cast.wife)}
          {figure(slave, refS, `${cast.slave}, her slave`)}
        </div>
      )}
      {/* The drawn figures stay mounted behind a photo, so a retake has something to redraw. */}
      {ph?.url ? (
        <div aria-hidden style={{ position: "absolute", left: -9999, top: 0 }}>
          {citizen ? <SlaveArt person={citizen} height={280} animate={false} svgRef={refC} /> : null}
          {slave ? <SlaveArt person={slave} height={280} animate={false} svgRef={refS} /> : null}
        </div>
      ) : null}
      <div className="text-[10.5px] uppercase tracking-wider dim mb-1">{x.kind === "oldworld" ? `A day with the ${cast.surname} family` : `A day in the ${cast.surname} household`}</div>
      <div className="font-prose text-[14px] leading-relaxed space-y-2 mb-2">{paras.map((para, i) => <p key={i}>{para}</p>)}</div>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {writing ? <span className="text-[11.5px] dim">The narrator is writing this day from the laws…</span> : null}
        {modelsAvailable() && !writing ? <Button size="sm" kind="ghost" onClick={() => void write()} title="The narrator reads every law word for word and writes the day, and dresses the household by them">{fresh ? "write it again" : "write it from the laws"}</Button> : null}
        {fresh && !writing ? <button className="text-[11px] dim underline" onClick={() => setPlain(!plain)}>{plain ? "the narrator's version" : "the game's rough version"}</button> : null}
        {!modelsAvailable() ? <span className="text-[11px] dim">Set a narrator model in Settings to have this day written from your laws.</span> : null}
        {tellErr ? <span className="text-[11.5px] warn">{tellErr.slice(0, 160)}</span> : null}
      </div>
      <details className="text-[12px] mb-2">
        <summary className="dim cursor-pointer">The facts behind it</summary>
        <p className="mt-1.5 mb-0.5">{h.citizen.line} Her husband wears {h.husband}.</p>
        {h.slave ? <p className="mb-1.5">{h.slave.line}</p> : null}
        <p className="mb-2">{h.family}</p>
        <div className="text-[10.5px] uppercase tracking-wider dim mb-0.5">A citizen's life</div>
        <ul className="leading-snug mb-2 list-disc pl-4">{citizenLife(x).map((l, i) => <li key={i}>{l}</li>)}</ul>
        <div className="text-[10.5px] uppercase tracking-wider dim mb-0.5">{h.slave ? "A slave's life" : "Slaves"}</div>
        <ul className="leading-snug list-disc pl-4">{slaveLife(x).map((l, i) => <li key={i}>{l}</li>)}</ul>
      </details>
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
  if (!other) return null;
  const c = contrast(yours, other);

  return (
    <>
      <Section title={`${yours.name} and ${other.name}`} right={
        <div className="flex flex-wrap gap-1.5">
          {others.map((x) => <button key={x.id} className={cx("chip !text-[11.5px]", x.id === other.id && "on")} onClick={() => setPick(x.id)}>{x.name}</button>)}
        </div>
      }>
        <p className="text-[12.5px] dim mb-2.5">One ordinary household in each, on the same day this week, told from what the game knows: the city's habits, the laws in force, prosperity, crime and the patrols. {other.kind === "oldworld" ? "The Old World is judged by how stable its regions are." : `${other.name} is judged by its doctrines and the laws its court has passed from them.`}</p>
        <div className="grid gap-2.5 md:grid-cols-2">
          <HouseholdCard x={yours} other={other} yours={yours} />
          <HouseholdCard key={other.id} x={other} other={yours} yours={yours} />
        </div>
      </Section>

      <Section title="If they moved">
        <Card>
          <p className="font-prose text-[14px] leading-relaxed mb-2">{moving(other, yours)}</p>
          <p className="font-prose text-[14px] leading-relaxed">{moving(yours, other)}</p>
          {c.ours.length || c.theirs.length ? (
            <details className="text-[12px] mt-2">
              <summary className="dim cursor-pointer">By the numbers</summary>
              <ul className="leading-snug list-disc pl-4 mt-1">{[...c.ours, ...c.theirs].map((l, i) => <li key={i}>{l}</li>)}</ul>
            </details>
          ) : null}
        </Card>
      </Section>

      <Section title={`How ${yours.name} and ${other.name} live`}>
        <Habits yours={yours} other={other} />
      </Section>

      <Section title="Everywhere, side by side">
        <Scorecard all={all} />
      </Section>
    </>
  );
}
