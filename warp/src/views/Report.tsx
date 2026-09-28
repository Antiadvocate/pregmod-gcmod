/** THE WEEK REPORT — what happened, and the ledger it happened in.
 *
 *  The lines and the money come from the same pass, so they cannot disagree: every cash movement
 *  on this screen is a line the week actually wrote, and the totals are the sum of the lines rather
 *  than a separately maintained counter.
 *
 *  The week's result sits on top as one number and one bar. Under it, three tabs: the recap (what
 *  happened to your people, then to the arcology), the city's scenes, and the ledger. */
import { useState } from "react";
import { AlertCircle, AlertTriangle, Circle, TrendingUp } from "lucide-react";
import SubTabs from "./SubTabs";
import { SlaveHead } from "./SlaveArt";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Empty, Money, Section } from "../lib/ui";
import { modelsAvailable } from "../config";
import { call } from "../llm";
import { chooseInScene, cityProseBrief } from "../engine/citylife";
import type { WeekReport } from "../engine/types";

/** The city this week: the game's scenes, their choices, and the narrator's column when asked for. */
function CityThisWeek({ report }: { report: WeekReport }) {
  const { save, mutate } = useGame();
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [plain, setPlain] = useState(false);
  const scenes = report.city ?? [];
  if (!scenes.length) return null;
  const write = async () => {
    const b = cityProseBrief(save, report.week);
    if (!b || busy) return;
    setBusy(" "); setErr("");
    let acc = "";
    const res = await call({ ...b, model: save.models.narrator_model, fallback: save.models.fallback_model, maxTokens: 1400, temperature: 0.9, onDelta: (d) => { acc += d; setBusy(acc); }, onReset: () => { acc = ""; setBusy(" "); } });
    if (res.ok && res.text.trim()) mutate((s) => { const r = s.reports.find((x) => x.week === report.week); if (r) r.city_prose = { model: res.model, text: res.text.trim() }; });
    else setErr(res.error ?? "The narrator returned nothing.");
    setBusy(""); setPlain(false);
  };
  const prose = busy.trim() ? busy : !plain ? report.city_prose?.text : undefined;
  return (
    <Section title="The city this week" right={
      <div className="flex items-center gap-2">
        {report.city_prose && !busy ? <button className="text-[11px] dim underline" onClick={() => setPlain(!plain)}>{plain ? "the narrator's column" : "the scenes"}</button> : null}
        {modelsAvailable() ? <Button size="sm" kind="ghost" disabled={!!busy} onClick={() => void write()} title="One model call: the narrator writes this week in full, from the scenes, your laws and everything behind them">{busy ? "writing…" : report.city_prose ? "write it again" : "have the narrator write the week"}</Button> : null}
      </div>
    }>
      {err ? <div className="text-[11.5px] warn mb-2">{err}</div> : null}
      {prose ? (
        <Card><div className="font-prose text-[14.5px] leading-relaxed whitespace-pre-line">{prose}</div></Card>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {scenes.map((c) => (
            <Card key={c.key}>
              <div className="text-[10.5px] uppercase tracking-wider acc mb-1">{c.where}</div>
              <p className="font-prose text-[14px] leading-relaxed">{c.text}</p>
              {c.result ? <p className="font-prose text-[13.5px] leading-relaxed mt-2 dim">{c.result}</p> : c.options?.length ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.options.map((o) => <Button key={o.id} size="sm" kind="ghost" onClick={() => mutate((s) => { chooseInScene(s, report.week, c.key, o.id); })}>{o.label}</Button>)}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}

/**
 * Lines that say again what another part of the screen already says: the city's cash is a ledger
 * row, the weather and the news are on the World screen, and "X wants something" points at an ask
 * card that is already on the Penthouse. They stay in the report (the narrator reads them) and
 * are left out of the recap.
 */
const ECHO = [/^The city: ¤/, /^Weather: /, /^News: /, / wants something\.$/];
const isEcho = (text: string) => ECHO.some((r) => r.test(text));

/** A standing order's line reads "Flag slaves likely to run: Amara — flagged: flight risk". Under her
 *  name, the useful part is what happened; the order that did it goes on after, quieter. */
function tidy(text: string, name: string): { text: string; tag?: string } {
  const at = text.indexOf(`: ${name} — `);
  if (at < 0) return { text };
  const rest = text.slice(at + name.length + 5);
  return { text: rest.charAt(0).toUpperCase() + rest.slice(1), tag: text.slice(0, at) };
}

const toneColor = (t: string) => (t === "bad" ? "var(--danger)" : t === "good" ? "var(--good)" : t === "warning" ? "var(--warn)" : undefined);

function ToneIcon({ tone }: { tone: string }) {
  const Icon = tone === "bad" ? AlertTriangle : tone === "good" ? TrendingUp : tone === "warning" ? AlertCircle : Circle;
  return <Icon size={tone === "neutral" ? 6 : 14} className="shrink-0" style={{ color: toneColor(tone) ?? "var(--text-lo)", fill: tone === "neutral" ? "var(--text-lo)" : undefined }} />;
}

/** Money in against money out, as one bar you can read from across the room. */
function InOut({ report }: { report: WeekReport }) {
  const inn = report.ledger.reduce((n, l) => n + Math.max(0, l.cash), 0);
  const out = report.ledger.reduce((n, l) => n + Math.max(0, -l.cash), 0);
  const total = inn + out || 1;
  return (
    <div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5" style={{ background: "var(--ink-3)" }}>
        <div style={{ width: `${(inn / total) * 100}%`, background: "var(--good)" }} />
        <div style={{ width: `${(out / total) * 100}%`, background: "var(--danger)" }} />
      </div>
      <div className="flex justify-between text-[11.5px] mt-1.5">
        <span className="dim">in <Money n={inn} /></span>
        <span className="dim">out <Money n={-out} /></span>
      </div>
    </div>
  );
}

export default function Report() {
  const { save } = useGame();
  const [idx, setIdx] = useState(0);
  const reports = [...save.reports].reverse();
  const report = reports[idx];

  if (!report) return <Empty>No week has ended yet. The report is written when it does.</Empty>;

  const byCategory = new Map<string, { cash: number; rep: number; lines: typeof report.ledger }>();
  for (const l of report.ledger) {
    const row = byCategory.get(l.category) ?? { cash: 0, rep: 0, lines: [] };
    row.cash += l.cash; row.rep += l.rep; row.lines.push(l);
    byCategory.set(l.category, row);
  }
  const cats = [...byCategory.entries()].sort((a, b) => b[1].cash - a[1].cash);
  const net = report.cash_end - report.cash_start;
  const rep = Math.round(report.rep_end - report.rep_start);
  // An event still waiting on you is a card on the Penthouse; its text here would be the same words twice.
  const pending = new Set(save.events.map((e) => e.seed));
  const lines = report.lines.filter((l) => !isEcho(l.text) && !pending.has(l.text));
  const aboutPeople = lines.filter((l) => l.person && save.people[l.person]);
  const elsewhere = lines.filter((l) => !(l.person && save.people[l.person]));

  return (
    <>
      {reports.length > 1 ? (
        <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
          {reports.slice(0, 12).map((r, i) => (
            <Chip key={r.week} on={i === idx} onClick={() => setIdx(i)}>week {r.week}</Chip>
          ))}
        </div>
      ) : null}

      <div className="card p-4 mb-4">
        <div className="text-[12px] dim mb-1">Week {report.week}</div>
        <div className="flex items-baseline gap-4">
          <div className="font-mono text-[28px] leading-none"><Money n={net} sign /></div>
          <div className="font-mono text-[15px]" style={{ color: rep >= 0 ? "var(--good)" : "var(--danger)" }}>{rep >= 0 ? "+" : "−"}{Math.abs(rep)} rep</div>
        </div>
        <div className="text-[11.5px] dim mt-1 mb-3">¤{Math.round(report.cash_end).toLocaleString()} in the bank</div>
        <InOut report={report} />
      </div>

      <SubTabs id="report" tabs={[
        { id: "recap", label: "Recap", render: () => (<>
          {report.prose ? <p className="font-prose text-[15.5px] leading-relaxed mb-5">{report.prose}</p> : null}

          {report.problems.length ? (
            <Section title="Problems">
              <div className="list">
                {report.problems.map((p, i) => <div key={i} className="list-row !items-start text-[13px]"><AlertTriangle size={14} className="bad shrink-0 mt-0.5" /><span>{p}</span></div>)}
              </div>
            </Section>
          ) : null}

          {aboutPeople.length ? (
            <Section title="Your people">
              <div className="list">
                {aboutPeople.map((l, i) => {
                  const p = save.people[l.person!];
                  const t = tidy(l.text, p.name);
                  return (
                    <div key={i} className="list-row !items-start">
                      <SlaveHead person={p} size={30} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] dim">{p.name}</div>
                        <div className="text-[13.5px] leading-snug" style={{ color: toneColor(l.tone) }}>{t.text}</div>
                        {t.tag ? <div className="text-[11px] dim mt-0.5">{t.tag}</div> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          ) : null}

          {elsewhere.length ? (
            <Section title="Around the arcology">
              <div className="list">
                {elsewhere.map((l, i) => (
                  <div key={i} className="list-row !items-start">
                    <span className="w-[14px] grid place-items-center mt-1"><ToneIcon tone={l.tone} /></span>
                    <span className="text-[13.5px] leading-snug flex-1" style={{ color: toneColor(l.tone) }}>{l.text}</span>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {!lines.length && !report.problems.length ? <Empty>A quiet week.</Empty> : null}
        </>) },
        { id: "city", label: "The city", badge: report.city?.length || undefined, render: () => (report.city?.length ? <CityThisWeek report={report} /> : <Empty>No scenes from the city this week.</Empty>) },
        { id: "ledger", label: "Ledger", render: () => (
          <div className="list">
            {cats.map(([cat, row]) => (
              <details key={cat} className="ledger-row">
                <summary className="flex items-baseline gap-3 cursor-pointer list-none py-3 px-0.5">
                  <span className="text-[13.5px] flex-1 capitalize">{cat}</span>
                  {row.rep ? <span className="text-[11px] dim">{row.rep >= 0 ? "+" : ""}{row.rep} rep</span> : null}
                  {row.cash ? <Money n={row.cash} sign={row.cash > 0} /> : null}
                </summary>
                <div className="pb-3 space-y-1">
                  {row.lines.sort((a, b) => Math.abs(b.cash) - Math.abs(a.cash)).map((l, i) => (
                    <div key={i} className="flex gap-3 text-[12px] pl-2">
                      <span className="flex-1 mid">{l.label}</span>
                      {l.cash ? <Money n={l.cash} /> : null}
                      {l.rep ? <span className="dim font-mono">{l.rep >= 0 ? "+" : ""}{l.rep}</span> : null}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        ) },
      ]} />
    </>
  );
}
