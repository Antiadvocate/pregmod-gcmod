/** THE WEEK REPORT — what happened, and the ledger it happened in.
 *
 *  The lines and the money come from the same pass, so they cannot disagree: every cash movement
 *  on this screen is a line the week actually wrote, and the totals are the sum of the lines rather
 *  than a separately maintained counter. */
import { useState } from "react";
import { useGame } from "../lib/game";
import { Card, Chip, Empty, Money, Section } from "../lib/ui";

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

  return (
    <>
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {reports.slice(0, 12).map((r, i) => (
          <Chip key={r.week} on={i === idx} onClick={() => setIdx(i)}>week {r.week}</Chip>
        ))}
      </div>

      <Card className="mb-5">
        <div className="flex items-baseline gap-4 flex-wrap">
          <div>
            <div className="text-[11px] dim uppercase tracking-wider">cash</div>
            <div className="font-mono text-[19px]"><Money n={report.cash_end} /></div>
            <div className="text-[11.5px] dim">was <Money n={report.cash_start} />, <Money n={report.cash_end - report.cash_start} sign /></div>
          </div>
          <div>
            <div className="text-[11px] dim uppercase tracking-wider">reputation</div>
            <div className="font-mono text-[19px]">{report.rep_end.toLocaleString()}</div>
            <div className="text-[11.5px] dim">{report.rep_end - report.rep_start >= 0 ? "+" : ""}{report.rep_end - report.rep_start}</div>
          </div>
        </div>
        {report.prose ? <p className="font-prose text-[15px] leading-relaxed mt-4">{report.prose}</p> : null}
      </Card>

      {report.problems.length ? (
        <Section title="Problems">
          <Card><ul className="space-y-1 text-[13px]">{report.problems.map((p, i) => <li key={i} className="flex gap-2"><span className="bad">·</span>{p}</li>)}</ul></Card>
        </Section>
      ) : null}

      <Section title="What happened">
        <div className="space-y-1.5">
          {report.lines.map((l, i) => (
            <div key={i} className="card-2 px-3 py-2 flex gap-3 items-baseline">
              <span className="text-[13px] flex-1" style={{ color: l.tone === "bad" ? "var(--danger)" : l.tone === "good" ? "var(--good)" : l.tone === "warning" ? "var(--warn)" : undefined }}>
                {l.text}
              </span>
              {l.person && save.people[l.person] ? <span className="text-[11px] dim shrink-0">{save.people[l.person].name}</span> : null}
            </div>
          ))}
          {!report.lines.length ? <Empty>A quiet week.</Empty> : null}
        </div>
      </Section>

      <Section title="The ledger">
        <div className="space-y-2">
          {cats.map(([cat, row]) => (
            <details key={cat} className="card px-4 py-3">
              <summary className="flex items-baseline gap-3 cursor-pointer list-none">
                <span className="text-[13px] flex-1">{cat}</span>
                {row.rep ? <span className="text-[11px] dim">{row.rep >= 0 ? "+" : ""}{row.rep} rep</span> : null}
                <Money n={row.cash} />
              </summary>
              <div className="mt-2.5 space-y-1">
                {row.lines.sort((a, b) => Math.abs(b.cash) - Math.abs(a.cash)).map((l, i) => (
                  <div key={i} className="flex gap-3 text-[12px]">
                    <span className="flex-1 mid">{l.label}</span>
                    {l.cash ? <Money n={l.cash} /> : null}
                    {l.rep ? <span className="dim font-mono">{l.rep >= 0 ? "+" : ""}{l.rep}</span> : null}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
