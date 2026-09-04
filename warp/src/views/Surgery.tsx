/** THE THEATRE — what can be done to this body, what it costs, and how she will take it.
 *
 *  Every row shows the reaction before you commit, because she is not a surprise: the engine
 *  already knows whether she has been asking for this or whether it is the worst thing that will
 *  ever happen to her, and hiding that behind the button would make the choice meaningless. */
import { useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Empty, Section } from "../lib/ui";
import { optionsFor, operate } from "../engine/surgery";
import type { Procedure } from "../data/surgery";

const GROUPS: { id: Procedure["group"]; label: string; note: string }[] = [
  { id: "genitals", label: "What she is", note: "A cock, a cunt, both, or neither. None of it grows back on its own." },
  { id: "fertility", label: "What she can do", note: "Whether any of it comes to anything." },
  { id: "body", label: "The body", note: "The rest of the work the theatre does." },
];

export default function Surgery({ id }: { id: string }) {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState<{ line: string; reaction: string } | null>(null);
  const p = save.people[id];
  if (!p) return null;
  const rows = optionsFor(save, p);
  const theatre = save.arcology.facilities["surgery"];

  if (!theatre?.level) {
    return <Empty>You have no surgical theatre. Build one in the arcology before you start changing what people are.</Empty>;
  }

  return (
    <>
      {said ? (
        <Card className="mb-4">
          <div className="text-[13px] mb-1.5">{said.line}</div>
          <p className="font-prose text-[15px] leading-relaxed">{said.reaction}</p>
          <Button size="sm" kind="ghost" className="mt-2" onClick={() => setSaid(null)}>done</Button>
        </Card>
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
                      <div>{proc.recovery}w down</div>
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
                      if (out.ok) setSaid({ line: out.line ?? "", reaction: out.reaction ?? "" });
                      else setSaid({ line: "Not done.", reaction: out.why ?? "" });
                    }}>do it</Button>
                  )}
                </Card>
              ))}
            </div>
          </Section>
        );
      })}
    </>
  );
}
