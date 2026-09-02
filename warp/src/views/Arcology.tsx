/** THE ARCOLOGY — the building, its money, and the three neighbours who have opinions about you. */
import { useGame } from "../lib/game";
import { Button, Card, Chip, Empty, Meter, Money, Section, Stat } from "../lib/ui";
import { FACILITIES, FACILITY_BY_ID } from "../data/facilities";
import { POLICIES } from "../data/policies";
import { enact, repeal } from "../engine/policies";
import { dismissMercenaries, hireMercenaries, unrest } from "../engine/security";
import { practise, skill } from "../engine/player";

export default function ArcologyView() {
  const { save, mutate } = useGame();
  const arc = save.arcology;
  // Your own engineering is a real discount on every price on this screen, and it goes up by
  // spending money on buildings — which is the only way anybody has ever learned construction.
  const eng = skill.engineering(save);
  const price = (n: number) => Math.round(n * eng);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Stat label="prosperity" value={Math.round(arc.prosperity)} sub={`population ${arc.population.toLocaleString()}`} />
        <Stat label="security" value={Math.round(arc.security)} sub={`crime ${Math.round(arc.crime)}`} tone={arc.crime > 60 ? "bad" : undefined} />
        <Stat label="ownership" value={`${Math.round(arc.ownership)}%`} sub={`${arc.sectors.filter((s) => s.owner === "you").length} of ${arc.sectors.length} sectors`} />
        <Stat label="food" value={Math.round(arc.food.stores)} sub={`eats ${arc.food.consumption}/wk`} tone={arc.food.stores < 200 ? "warn" : undefined} />
      </div>

      <Section title="Force">
        <Card>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <div className="mb-2"><Meter value={arc.security} label="security — against the outside" /></div>
              <Meter value={unrest(save)} range={[0, 100]} invert label="unrest — inside your own household" />
              <div className="text-[11px] dim mt-2">
                Two different problems. Watch and drones move the first number and do nothing whatever to the
                second; the only things that move unrest are the ones that change what your people are carrying.
              </div>
            </div>
            <div>
              <div className="text-[13px] mb-1.5">{arc.mercenaries.hired ? "A mercenary company, on retainer" : "No mercenaries"}</div>
              {arc.mercenaries.hired ? (
                <>
                  <Meter value={arc.mercenaries.loyalty} label="their loyalty" />
                  <div className="text-[11.5px] dim mt-1.5">Strength {arc.mercenaries.strength} · <Money n={-arc.mercenaries.upkeep} />/wk. Miss a payment and they say so where people can hear.</div>
                  <Button size="sm" kind="ghost" className="mt-2" onClick={() => mutate((s) => dismissMercenaries(s))}>dismiss them</Button>
                </>
              ) : (
                <>
                  <div className="text-[11.5px] dim mb-2">¤30,000 up front, ¤3,500 a week. They are the difference between a raid and a break-in.</div>
                  <Button size="sm" disabled={arc.cash < 30000} onClick={() => mutate((s) => { hireMercenaries(s); })}>hire a company</Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Policies">
        <div className="grid gap-2 sm:grid-cols-2">
          {POLICIES.map((pol) => {
            const on = !!arc.policies[pol.id];
            const refuser = (pol.refused_by ?? []).find((d) => (arc.doctrines[d]?.adoption ?? 0) > 40);
            return (
              <Card key={pol.id} className="py-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px]">{pol.name} <span className="chip">{pol.group}</span></div>
                    <div className="font-prose text-[12.5px] dim mt-0.5">{pol.blurb}</div>
                    <div className="text-[11px] dim mt-1 font-mono">
                      {pol.cost ? `¤${pol.cost.toLocaleString()} to enact · ` : ""}
                      {pol.weekly ? `${pol.weekly > 0 ? "+" : "−"}¤${Math.abs(pol.weekly).toLocaleString()}/wk` : "no running cost"}
                    </div>
                    {refuser ? <div className="text-[11px] bad mt-1">your citizens will not have it while {refuser} is what they believe</div> : null}
                  </div>
                  {on
                    ? <Button size="sm" kind="ghost" onClick={() => mutate((s) => repeal(s, pol.id))}>repeal</Button>
                    : <Button size="sm" disabled={!!refuser || arc.cash < pol.cost} onClick={() => mutate((s) => { enact(s, pol.id); })}>enact</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

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
                      <Button size="sm" disabled={arc.cash < price(def.level_cost)}
                        onClick={() => mutate((s) => { s.arcology.cash -= price(def.level_cost); s.arcology.facilities[def.id].level++; s.arcology.facilities[def.id].capacity += def.capacity_per_level; practise(s, "engineering", 2); })}>
                        expand · ¤{price(def.level_cost).toLocaleString()}
                      </Button>
                      {def.upgrades.map((u) => {
                        const has = !!f.upgrades[u.id];
                        const locked = (u.needs_level ?? 0) > f.level;
                        return (
                          <Button key={u.id} size="sm" kind={has ? "primary" : undefined} disabled={has || locked || arc.cash < price(u.cost)}
                            title={locked ? `needs level ${u.needs_level}` : u.note}
                            onClick={() => mutate((s) => { s.arcology.cash -= price(u.cost); s.arcology.facilities[def.id].upgrades[u.id] = 1; practise(s, "engineering", 1.5); })}>
                            {u.name}{has ? "" : ` · ¤${price(u.cost).toLocaleString()}`}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="text-[11px] dim mt-2">
                      {def.psyche.relaxation < -1 ? "This place takes something out of the people in it." : def.psyche.relaxation > 0.5 ? "People come out of here better than they went in." : ""}
                    </div>
                  </>
                ) : (
                  <Button size="sm" className="mt-3" disabled={arc.cash < price(def.build_cost)}
                    onClick={() => mutate((s) => {
                      s.arcology.cash -= price(def.build_cost);
                      const fac = s.arcology.facilities[def.id];
                      fac.level = 1;
                      fac.capacity = def.capacity_per_level;
                      practise(s, "engineering", 3);
                    })}>
                    build · ¤{price(def.build_cost).toLocaleString()}
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
                <div className="text-[11.5px] dim">
                  prosperity {Math.round(n.prosperity)}
                  {n.scheme
                    ? skill.hacking(save)
                      ? ` · running a ${n.scheme.kind} against you, ${Math.round(n.scheme.progress)}% along`
                      : " · something is happening over there and you cannot see what"
                    : ""}
                </div>
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
