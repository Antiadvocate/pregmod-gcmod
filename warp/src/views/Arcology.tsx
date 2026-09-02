/** THE ARCOLOGY — the building, its money, and the three neighbours who have opinions about you. */
import { useGame } from "../lib/game";
import { Button, Card, Chip, Empty, Meter, Money, Section, Stat } from "../lib/ui";
import { FACILITIES, FACILITY_BY_ID } from "../data/facilities";

export default function ArcologyView() {
  const { save, mutate } = useGame();
  const arc = save.arcology;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Stat label="prosperity" value={Math.round(arc.prosperity)} sub={`population ${arc.population.toLocaleString()}`} />
        <Stat label="security" value={Math.round(arc.security)} sub={`crime ${Math.round(arc.crime)}`} tone={arc.crime > 60 ? "bad" : undefined} />
        <Stat label="ownership" value={`${Math.round(arc.ownership)}%`} sub={`${arc.sectors.filter((s) => s.owner === "you").length} of ${arc.sectors.length} sectors`} />
        <Stat label="food" value={Math.round(arc.food.stores)} sub={`eats ${arc.food.consumption}/wk`} tone={arc.food.stores < 200 ? "warn" : undefined} />
      </div>

      <Section title="Facilities">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {FACILITIES.map((def) => {
            const f = arc.facilities[def.id];
            const built = f.level > 0;
            const manager = f.manager ? save.people[f.manager] : undefined;
            return (
              <Card key={def.id}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px]">{def.name} {built ? <span className="dim font-mono text-[11px]">lvl {f.level}</span> : null}</div>
                    <div className="text-[11.5px] dim">{def.blurb}</div>
                  </div>
                  {built ? <Chip>{f.workers.length}/{f.capacity}</Chip> : null}
                </div>

                {built ? (
                  <>
                    {def.manager ? (
                      <div className="text-[11.5px] mid mt-2">
                        {def.manager.title}: {manager ? <span className="hi">{manager.name}</span> : <span className="dim">nobody — {def.manager.effect}</span>}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Button size="sm" disabled={arc.cash < def.level_cost}
                        onClick={() => mutate((s) => { s.arcology.cash -= def.level_cost; s.arcology.facilities[def.id].level++; s.arcology.facilities[def.id].capacity += def.capacity_per_level; })}>
                        expand · ¤{def.level_cost.toLocaleString()}
                      </Button>
                      {def.upgrades.map((u) => {
                        const has = !!f.upgrades[u.id];
                        const locked = (u.needs_level ?? 0) > f.level;
                        return (
                          <Button key={u.id} size="sm" kind={has ? "primary" : undefined} disabled={has || locked || arc.cash < u.cost}
                            title={locked ? `needs level ${u.needs_level}` : u.note}
                            onClick={() => mutate((s) => { s.arcology.cash -= u.cost; s.arcology.facilities[def.id].upgrades[u.id] = 1; })}>
                            {u.name}{has ? "" : ` · ¤${u.cost.toLocaleString()}`}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="text-[11px] dim mt-2">
                      {def.psyche.relaxation < -1 ? "This place takes something out of the people in it." : def.psyche.relaxation > 0.5 ? "People come out of here better than they went in." : ""}
                    </div>
                  </>
                ) : (
                  <Button size="sm" className="mt-3" disabled={arc.cash < def.build_cost}
                    onClick={() => mutate((s) => {
                      s.arcology.cash -= def.build_cost;
                      const fac = s.arcology.facilities[def.id];
                      fac.level = 1;
                      fac.capacity = def.capacity_per_level;
                    })}>
                    build · ¤{def.build_cost.toLocaleString()}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </Section>

      <Section title="Sectors">
        <Card>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mb-3">
            {arc.sectors.map((s) => (
              <button key={s.id} title={`${s.kind} · ${s.owner} · condition ${Math.round(s.condition)}`}
                className="aspect-square rounded"
                style={{
                  background: s.owner === "you" ? "var(--accent-soft)" : s.owner === "citizen" ? "var(--ink-3)" : "var(--ink-2)",
                  border: `1px solid ${s.owner === "you" ? "var(--accent-glow)" : "var(--line)"}`,
                }}
                onClick={() => {
                  if (s.owner === "you") return;
                  const price = Math.round(4000 + s.condition * 60);
                  if (save.arcology.cash < price) return;
                  mutate((st) => {
                    st.arcology.cash -= price;
                    const sec = st.arcology.sectors.find((x) => x.id === s.id)!;
                    sec.owner = "you";
                    st.arcology.ownership = Math.min(100, st.arcology.ownership + 2);
                  });
                }} />
            ))}
          </div>
          <div className="text-[11.5px] dim">Click a sector you do not own to buy it. Cost scales with condition; owning more raises your rents and your say.</div>
        </Card>
      </Section>

      <Section title="Neighbours">
        <div className="space-y-2">
          {arc.neighbours.map((n) => (
            <Card key={n.id} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-[13.5px]">{n.name} <span className="dim text-[11px]">· {n.direction}</span></div>
                <div className="text-[11.5px] dim">prosperity {Math.round(n.prosperity)}{n.scheme ? ` · running a ${n.scheme.kind} against you` : ""}</div>
              </div>
              <div className="w-32"><Meter value={n.attitude} range={[-100, 100]} label="attitude" /></div>
            </Card>
          ))}
        </div>
      </Section>

      {arc.projects.length ? (
        <Section title="In progress">
          <div className="space-y-2">
            {arc.projects.map((p) => (
              <Card key={p.id} className="flex items-center gap-4">
                <div className="flex-1"><div className="text-[13px]">{p.title}</div><div className="text-[11px] dim">{p.weeks_left} weeks · <Money n={-p.weekly_cost} />/wk</div></div>
              </Card>
            ))}
          </div>
        </Section>
      ) : null}

      {arc.loans.length ? (
        <Section title="Debt">
          <div className="space-y-2">
            {arc.loans.map((l, i) => (
              <Card key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-[13px]">{l.lender === "shark" ? "The shark" : "The bank"} — <Money n={l.principal} /></div>
                  <div className="text-[11px] dim">{Math.round(l.apr * 100)}% APR · due week {l.due_week}</div>
                </div>
                <Button size="sm" disabled={arc.cash < l.principal}
                  onClick={() => mutate((s) => { s.arcology.cash -= l.principal; s.arcology.loans.splice(i, 1); })}>pay it off</Button>
              </Card>
            ))}
          </div>
        </Section>
      ) : <Section title="Debt"><Empty>You owe nobody anything.</Empty></Section>}
    </>
  );
}
