/** THE THEATRE — what can be done to this body, what it costs, and how she will take it.
 *
 *  Every row shows the reaction before you commit, because she is not a surprise: the engine
 *  already knows whether she has been asking for this or whether it is the worst thing that will
 *  ever happen to her, and hiding that behind the button would make the choice meaningless. */
import { useState } from "react";
import { useGame } from "../lib/game";
import { Reaction } from "./MomentCard";
import { FLESH, FLESH_BY_ID, canGrow, fleshFelt, geneLab, startGrowing } from "../engine/fleshcraft";
import { Button, Card, Empty, Section } from "../lib/ui";
import { optionsFor, operate, theatreLevel } from "../engine/surgery";
import type { Procedure } from "../data/surgery";

const GROUPS: { id: Procedure["group"]; label: string; note: string }[] = [
  { id: "genitals", label: "Genitals", note: "Add or remove a cock or pussy. Nothing removed grows back." },
  { id: "fertility", label: "Fertility", note: "Fertility and sterilization." },
  { id: "body", label: "The body", note: "Other procedures." },
  { id: "feet", label: "Feet", note: "Size, arches, soles, and her tendons." },
];

export default function Surgery({ id }: { id: string }) {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState<{ line: string; reaction: string; ok?: boolean; proc?: string; key?: number } | null>(null);
  const p = save.people[id];
  if (!p) return null;
  const rows = optionsFor(save, p);
  const clinic = save.arcology.facilities["clinic"];

  if (!theatreLevel(save)) {
    return <>{geneLab(save) ? <Fleshcraft id={id} /> : null}<Empty>{clinic?.level
      ? "The Clinic has no surgical theatre yet. Buy the Surgical theatre upgrade on the Clinic, on the Arcology screen."
      : "No surgical theatre yet. Build the Clinic on the Arcology screen, then buy its Surgical theatre upgrade."}</Empty></>;
  }

  return (
    <>
      {said ? (
        <Card className="mb-4">
          <div className="text-[13px] mb-1.5">{said.line}</div>
          <p className="font-prose text-[15px] leading-relaxed">{said.reaction}</p>
          {said.ok ? <Reaction key={said.key} seed={{ person: id, title: `After the ${said.proc?.toLowerCase()}`, source: "surgery", you: `You have her put under for: ${said.proc}.`, happened: `${said.line} ${said.reaction}` }} /> : null}
          <Button size="sm" kind="ghost" className="mt-2" onClick={() => setSaid(null)}>done</Button>
        </Card>
      ) : null}

      {theatreLevel(save) < 2 ? (
        <div className="text-[11.5px] dim mb-3">Some procedures need the Clinic expanded to level 2.</div>
      ) : null}
      {GROUPS.map((g) => {
        const mine = rows.filter((r) => r.proc.group === g.id);
        if (!mine.length) return null;
        return (
          <Section key={g.id} title={g.label}>
            <div className="text-[11.5px] dim mb-2">{g.note}</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {mine.map(({ proc, blocked, felt }) => (
                <Card key={proc.id} className="py-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px]">{proc.name}</div>
                      <div className="font-prose text-[12.5px] dim">{proc.what}</div>
                    </div>
                    <div className="text-right shrink-0 text-[11px] dim">
                      <div>¤{proc.cost.toLocaleString()}</div>
                      <div>{proc.recovery ? `${proc.recovery}w down` : "no recovery"}</div>
                    </div>
                  </div>
                  <div className="text-[11.5px] mt-2" style={{
                    color: felt.score < -20 ? "var(--danger)" : felt.score < -6 ? "var(--warn)" : felt.score > 6 ? "var(--good)" : undefined,
                  }}>
                    {felt.score < -20 ? "She will not get over this. " : felt.score < -6 ? "She will mind. " : felt.score > 6 ? "She wants this. " : "She will be quiet about it. "}
                    <span className="dim">{felt.why}.</span>
                  </div>
                  {blocked ? (
                    <div className="text-[11px] dim mt-2">{blocked}</div>
                  ) : (
                    <Button size="sm" className="mt-2.5" kind={felt.score < -20 ? "danger" : undefined} onClick={() => {
                      let out: ReturnType<typeof operate> = { ok: false };
                      mutate((s) => { out = operate(s, s.people[id], proc.id); });
                      if (out.ok) setSaid({ line: out.line ?? "", reaction: out.reaction ?? "", ok: true, proc: proc.name, key: Date.now() });
                      else setSaid({ line: "Not done.", reaction: out.why ?? "" });
                    }}>do it</Button>
                  )}
                </Card>
              ))}
            </div>
          </Section>
        );
      })}
      <Fleshcraft id={id} />
    </>
  );
}

/** Grown changes: start a treatment, watch the ones under way. */
function Fleshcraft({ id }: { id: string }) {
  const { save, mutate } = useGame();
  const [line, setLine] = useState("");
  const p = save.people[id];
  if (!p) return null;
  if (!geneLab(save)) return <Section title="Fleshcraft"><div className="text-[11.5px] dim">Buy the Gene lab upgrade on the Clinic (level 2) for real ears and tails, scales, glowing eyes, milk and fertility genes, and slowed ageing.</div></Section>;
  return (
    <Section title="Fleshcraft">
      <div className="text-[11.5px] dim mb-2">Gene treatments. Each takes weeks, costs her some health every week, and leaves a permanent change.</div>
      {p.body.traits?.length ? <div className="flex flex-wrap gap-1.5 mb-2">{p.body.traits.map((t) => <span key={t} className="chip good">{t}</span>)}</div> : null}
      {p.growing?.length ? (
        <div className="space-y-1.5 mb-3">
          {p.growing.map((g) => { const f = FLESH_BY_ID[g.id]; const done = save.arcology.week - g.started; return (
            <div key={g.id} className="card-2 px-3 py-2">
              <div className="text-[12.5px]">{f?.name} · week {done} of {g.weeks}</div>
              <div className="meter mt-1"><div style={{ width: `${Math.min(100, (done / g.weeks) * 100)}%`, background: "var(--accent)" }} /></div>
            </div>
          ); })}
        </div>
      ) : null}
      {line ? <Card className="mb-3"><p className="font-prose text-[14.5px] leading-relaxed">{line}</p></Card> : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {FLESH.map((f) => {
          const why = canGrow(save, p, f);
          const felt = fleshFelt(p, f);
          return (
            <Card key={f.id} className="py-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px]">{f.name}</div>
                  <div className="font-prose text-[12.5px] dim">{f.what}</div>
                </div>
                <div className="text-right shrink-0 text-[11px] dim"><div>¤{f.cost.toLocaleString()}</div><div>{f.weeks} weeks</div></div>
              </div>
              <div className="text-[11.5px] mt-1.5" style={{ color: felt <= -4 ? "var(--danger)" : felt < 0 ? "var(--warn)" : felt > 2 ? "var(--good)" : undefined }}>
                {felt <= -4 ? "She'll be frightened of it." : felt < 0 ? "She won't like it." : felt > 2 ? "She wants it." : "She won't mind much."}
              </div>
              {why ? <div className="text-[11px] dim mt-2">{why}</div> : (
                <Button size="sm" className="mt-2" onClick={() => { let out = { ok: false, line: "" }; mutate((s) => { out = startGrowing(s, s.people[id], f.id); }); setLine(out.line); }}>start it</Button>
              )}
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
