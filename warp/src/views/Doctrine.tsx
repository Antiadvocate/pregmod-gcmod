/** DOCTRINE — what your citizens have decided people are for, and how far they have got with it.
 *
 *  Adoption is not a slider you drag. It chases what your household actually looks like: the score
 *  under each doctrine is the mean of how well the people you own embody it. You demonstrate a
 *  culture; you do not legislate one. */
import { useGame } from "../lib/game";
import { Button, Card, Chip, Meter, Money, Section } from "../lib/ui";
import { DOCTRINES, conflictsWith, AXIS_LABEL, type Axis } from "../data/doctrines";
import { abandonDoctrine, adoptDoctrine, scoreFor, axesOf } from "../engine/society";

export default function Doctrine() {
  const { save, mutate } = useGame();
  const arc = save.arcology;
  const owned = Object.values(save.people).filter((p) => p.status === "owned" || p.status === "indentured");
  const adopted = Object.keys(arc.doctrines);

  return (
    <>
      <Section title={`Adopted — ${adopted.length} of 4`}>
        {adopted.length ? (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {adopted.map((id) => {
              const d = DOCTRINES.find((x) => x.id === id)!;
              const st = arc.doctrines[id];
              const scores = owned.map((p) => scoreFor(p, d));
              const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
              return (
                <Card key={id}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="text-[14px]">{d.noun}</div>
                      <div className="font-prose text-[13px] dim mt-0.5">&ldquo;{d.creed}&rdquo;</div>
                    </div>
                    <Button size="sm" kind="ghost" onClick={() => mutate((s) => abandonDoctrine(s, id))}>drop</Button>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Meter value={st.adoption} label="adoption" />
                    <Meter value={mean * 50 + 50} label={`your household embodies it (${mean > 0 ? "+" : ""}${mean.toFixed(2)})`} showValue={false} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Button size="sm" disabled={arc.cash < 5000 || st.decoration >= 5}
                      onClick={() => mutate((s) => { s.arcology.cash -= 5000; s.arcology.doctrines[id].decoration++; })}>
                      decorate ({st.decoration}/5) · ¤5,000
                    </Button>
                    {d.research ? (
                      <Button size="sm" kind={st.research ? "primary" : undefined} disabled={st.research || arc.cash < d.research}
                        onClick={() => mutate((s) => { s.arcology.cash -= d.research!; s.arcology.doctrines[id].research = true; })}>
                        {st.research ? "researched" : `research · ¤${d.research.toLocaleString()}`}
                      </Button>
                    ) : null}
                  </div>
                  <div className="text-[11px] dim mt-2">
                    {d.rep > 0 ? `+${d.rep} rep/wk at full adoption. ` : ""}
                    {d.cash < 0 ? `Costs ¤${Math.abs(d.cash)}/wk. ` : d.cash > 0 ? `Earns ¤${d.cash}/wk. ` : ""}
                    {st.decoration >= 3 ? d.look : ""}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card><div className="text-[13px] mid">
            No doctrine. Your arcology has no culture of its own — it earns nothing from what it believes, and the
            people in it are read as nothing in particular. Adopt up to four; conflicting ones cannot be held together.
          </div></Card>
        )}
      </Section>

      <Section title="Available">
        <div className="grid gap-2 sm:grid-cols-2">
          {DOCTRINES.filter((d) => !arc.doctrines[d.id]).map((d) => {
            const clash = conflictsWith(d.id).filter((c) => arc.doctrines[c]);
            const scores = owned.map((p) => scoreFor(p, d));
            const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            const wants = (Object.keys(d.wants) as Axis[]).map((a) => (d.wants[a]! > 0 ? AXIS_LABEL[a][1] : AXIS_LABEL[a][0]));
            return (
              <Card key={d.id} className="py-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px]">{d.noun}</div>
                    <div className="font-prose text-[12.5px] dim">&ldquo;{d.creed}&rdquo;</div>
                    {wants.length ? <div className="flex flex-wrap gap-1 mt-1.5">{wants.map((w) => <Chip key={w}>{w}</Chip>)}</div> : null}
                    {clash.length ? <div className="text-[11px] bad mt-1.5">conflicts with {clash.map((c) => DOCTRINES.find((x) => x.id === c)?.noun).join(", ")}</div> : null}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] dim">your people</div>
                    <div className="font-mono text-[13px]" style={{ color: mean > 0.1 ? "var(--good)" : mean < -0.1 ? "var(--danger)" : undefined }}>
                      {mean > 0 ? "+" : ""}{mean.toFixed(2)}
                    </div>
                  </div>
                </div>
                <Button size="sm" className="mt-2.5" disabled={!!clash.length || adopted.length >= 4}
                  onClick={() => mutate((s) => adoptDoctrine(s, d.id))}>adopt</Button>
              </Card>
            );
          })}
        </div>
      </Section>
    </>
  );
}
