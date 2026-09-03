/**
 * THE ROSTER, AND THE PERSON.
 *
 * The list answers "who do I have and what state are they in" at a glance; the panel answers "why
 * is she like that", which is the question the old game could not answer at any price because the
 * answer was distributed across every passage that had ever touched her.
 */
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Empty, Field, Meter, Money, Section, Sheet, cx } from "../lib/ui";
import type { Assignment, Person } from "../engine/types";
import { explain, read } from "../engine/obedience";
import { band, wear, aperture, perception } from "../engine/psyche";
import { explainFor } from "../engine/society";
import { assignToFacility, allowedAssignments, isMinor, setAssignment, MINOR_FACILITIES } from "../engine/rules";
import { ASSIGNMENTS } from "../data/assignments";
import { FACILITIES, FACILITY_BY_ID } from "../data/facilities";
import { PROCEDURES } from "../engine/health";
import { WARDROBE, MODIFICATIONS, GARMENT_BY_NAME } from "../data/wardrobe";
import { sell } from "../engine/market";
import { enrichPerson } from "../engine/forge";
import { getEdge } from "../engine/social";
import Acts from "./Acts";
import HerPanel from "./HerPanel";
import { romanceOf, RUNG_BY_ID } from "../engine/romance";
import { paintPortrait } from "../engine/turn";
import { getLocalImage, modelsAvailable } from "../config";
import { askHer } from "../engine/consult";
import SlaveArt, { SlaveHead } from "./SlaveArt";
import { practise, skill } from "../engine/player";

type Sort = "name" | "devotion" | "trust" | "health" | "income" | "trouble";

export default function Roster() {
  const { save, mutate } = useGame();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("trouble");
  const [openId, setOpenId] = useState<string | null>(null);

  const people = useMemo(() => {
    const list = Object.values(save.people).filter((p) => p.status === "owned" || p.status === "indentured");
    const filtered = q ? list.filter((p) => (p.name + " " + p.assignment + " " + p.origin.nationality).toLowerCase().includes(q.toLowerCase())) : list;
    const score = (p: Person) => {
      const r = read(p, save.memory[p.id]);
      switch (sort) {
        case "name": return 0;
        case "devotion": return -r.devotion;
        case "trust": return -r.trust;
        case "health": return p.health.health;
        case "income": return -p.economics.income_last_week;
        default: return -(r.flight_risk * 100 + (p.psyche.state !== "intact" ? 60 : 0) + Math.max(0, -p.health.health));
      }
    };
    return [...filtered].sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : score(a) - score(b)));
  }, [save, q, sort]);

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search" className="pl-9" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="w-auto">
          <option value="trouble">by trouble</option>
          <option value="name">by name</option>
          <option value="devotion">by devotion</option>
          <option value="trust">by trust</option>
          <option value="health">by health</option>
          <option value="income">by earnings</option>
        </select>
      </div>

      {people.length ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {people.map((p) => <RosterCard key={p.id} p={p} onOpen={() => setOpenId(p.id)} />)}
        </div>
      ) : <Empty>Nobody. The market is on the left.</Empty>}

      <Sheet open={!!openId} onClose={() => setOpenId(null)} title={openId ? save.people[openId]?.name ?? "" : ""} wide>
        {openId && save.people[openId] ? <PersonPanel id={openId} onClose={() => setOpenId(null)} /> : null}
      </Sheet>
    </>
  );
}

/** ASK HER SOMETHING. Out of scene, in her own voice, out of her own knowledge, and it leaves no
 *  trace: no memory forms, no bond moves, no clock advances. A channel where you can ask a woman
 *  what she thinks without it becoming an event is a different thing from another scene. */
function AskHer({ id }: { id: string }) {
  const { save } = useGame();
  const [q, setQ] = useState("");
  const [says, setSays] = useState("");
  const [busy, setBusy] = useState(false);
  const p = save.people[id];
  if (!p) return null;

  async function ask() {
    if (!q.trim() || busy) return;
    setBusy(true);
    setSays("");
    const res = await askHer(save, id, q.trim());
    setSays(res.says);
    setBusy(false);
  }

  return (
    <Card>
      <div className="text-[11px] uppercase tracking-wider dim mb-2">ask her something · leaves no trace</div>
      <div className="flex gap-2">
        <input value={q} placeholder={`ask ${p.name} anything`} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void ask(); }} />
        <Button size="sm" onClick={ask} disabled={busy || !q.trim()}>{busy ? "…" : "ask"}</Button>
      </div>
      {says ? <p className="font-prose text-[15px] leading-relaxed mt-3">{says}</p> : null}
      {!modelsAvailable() ? <div className="text-[11px] dim mt-2">Needs a model — this one is all voice.</div> : null}
    </Card>
  );
}

/** Anything already worn by somebody in the household is paid for. */
function ownedGarments(save: ReturnType<typeof useGame>["save"]): Set<string> {
  const worn = new Set<string>();
  for (const p of Object.values(save.people)) { worn.add(p.clothes); worn.add(p.collar); worn.add(p.shoes); }
  return worn;
}

function RosterCard({ p, onOpen }: { p: Person; onOpen: () => void }) {
  const { save } = useGame();
  const r = read(p, save.memory[p.id]);
  const fac = p.facility ? save.arcology.facilities[p.facility] : undefined;
  return (
    <Card onClick={onOpen} className="py-3">
      <div className="flex items-start gap-3">
        <SlaveHead person={p} size={54} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[14px]">{p.name}</span>
            <span className="text-[11px] dim font-mono">{p.age} · {p.origin.nationality}</span>
            {p.status === "indentured" ? <Chip>indentured {p.indenture_weeks}w</Chip> : null}
            {p.age < 18 ? <Chip>child</Chip> : null}
            {p.romance && p.romance.standing !== "property" ? <Chip on>{RUNG_BY_ID[p.romance.standing].name.toLowerCase()}</Chip> : null}
          </div>
          <div className="text-[11.5px] dim truncate mt-0.5">{fac ? fac.name : p.assignment}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px]" style={{ color: p.psyche.state !== "intact" ? "var(--danger)" : "var(--text-mid)" }}>
            {p.psyche.state !== "intact" ? p.psyche.state : band(p.psyche)}
          </div>
          <div className="text-[11px] dim font-mono">{p.economics.income_last_week ? `¤${p.economics.income_last_week}` : ""}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <Meter value={r.devotion} range={[-100, 100]} label="devotion" />
        <Meter value={r.trust} range={[-100, 100]} label="trust" />
        <Meter value={p.health.health} range={[-100, 100]} label="health" />
      </div>
      {r.fragility > 0.6 || r.flight_risk > 0.3 ? (
        <div className="flex gap-1.5 mt-2.5">
          {r.fragility > 0.6 ? <Chip tone="bad" title="how much of her compliance is bought with fear">fear-held {Math.round(r.fragility * 100)}%</Chip> : null}
          {r.flight_risk > 0.3 ? <Chip tone="bad">flight {Math.round(r.flight_risk * 100)}%</Chip> : null}
        </div>
      ) : null}
    </Card>
  );
}

function PersonPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const { save, mutate } = useGame();
  const [tab, setTab] = useState<"do" | "her" | "read" | "body" | "work" | "history">("do");
  const [painting, setPainting] = useState(false);
  const [forging, setForging] = useState(false);
  const p = save.people[id];
  const r = read(p, save.memory[id]);
  const mem = save.memory[id];

  return (
    <div>
      {/* Her, then the numbers about her — in that order, at that ratio. */}
      <div className="flex gap-4 mb-4">
        <div className="card-2 shrink-0 px-2" style={{ width: 132 }}>
          <SlaveArt person={p} height={300} />
        </div>
        <div className="flex-1 min-w-0">
          {p.body.portrait_url ? <img src={p.body.portrait_url} alt="" className="w-full max-h-40 object-cover rounded-lg mb-2" /> : null}
          <p className="font-prose text-[14px] leading-relaxed">{p.body.appearance_facts}</p>
          <p className="text-[12px] dim mt-1">{p.body.appearance_now}. Wearing {p.clothes}.</p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <Meter value={r.devotion} range={[-100, 100]} label={r.label} />
            <Meter value={r.trust} range={[-100, 100]} label={r.trust_label} />
            <Meter value={p.health.health} range={[-100, 100]} label="health" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {p.romance && p.romance.standing !== "property" ? <Chip on>{RUNG_BY_ID[p.romance.standing].name}</Chip> : null}
        <Chip>{p.origin.nationality}</Chip>
        <Chip>{p.age}</Chip>
        <Chip>{p.pronouns}</Chip>
        <Chip on>{band(p.psyche)}</Chip>
        {p.womb.fetuses.length ? <Chip>{p.womb.weeks}w pregnant</Chip> : null}
        {p.body.lactation ? <Chip>lactating</Chip> : null}
        <span className="ml-auto text-[11px] dim font-mono">owned {p.economics.weeks_owned}w</span>
        {getLocalImage() ? (
          <Button size="sm" kind="ghost" disabled={painting} onClick={async () => {
            setPainting(true);
            try { await paintPortrait(save, id); mutate(() => {}); } catch { /* the panel says nothing; Settings has the diagnostics */ }
            setPainting(false);
          }}>{painting ? "painting…" : p.body.portrait_url ? "repaint" : "paint her"}</Button>
        ) : null}
      </div>

      <div className="flex gap-1 mb-4">
        {(["do", "her", "read", "body", "work", "history"] as const).map((t) => (
          <Button key={t} size="sm" kind={tab === t ? "primary" : "ghost"} onClick={() => setTab(t)}>{t}</Button>
        ))}
      </div>

      {tab === "do" && <Acts id={id} />}
      {tab === "her" && <HerPanel id={id} />}

      {tab === "read" && (
        <div className="space-y-4">
          <AskHer id={id} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Meter value={r.devotion} range={[-100, 100]} label={`devotion — ${r.label}`} />
            <Meter value={r.trust} range={[-100, 100]} label={`trust — ${r.trust_label}`} />
            <Meter value={p.psyche.relaxation} range={[-10, 10]} label="relaxation" />
            <Meter value={p.health.health} range={[-100, 100]} label="health" />
          </div>

          <Section title="Why she is like this">
            <Card>
              <ul className="space-y-2 text-[13px] leading-relaxed">
                {explain(p, mem).map((line, i) => <li key={i} className="flex gap-2"><span className="acc">·</span><span>{line}</span></li>)}
              </ul>
            </Card>
          </Section>

          <Section title="What is actually holding her">
            <Card>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Meter value={p.bond.bond} range={[-100, 100]} label="bond (slow, sticky)" />
                <Meter value={p.bond.fear} range={[0, 100]} invert label="fear (fast, brittle)" />
                <Meter value={p.bond.resentment} range={[0, 100]} invert label="resentment" />
                <Meter value={p.bond.hope} range={[0, 100]} label="hope" />
              </div>
              <p className="text-[11.5px] dim mt-3">Fear decays 15% a week unmaintained. Bond does not.</p>
            </Card>
          </Section>

          <Section title="Her nervous system">
            <Card>
              <div className="text-[12.5px] space-y-1.5 mid">
                <div>Resting point <span className="font-mono hi">{p.psyche.capacity.toFixed(1)}</span> (born {p.psyche.capacity_born.toFixed(1)}) · recovery <span className="font-mono">{p.psyche.recovery.toFixed(2)}</span>/tick</div>
                <div>Attachment: <span className="hi">{p.persona.attachment.style}</span> — under threat she {p.persona.attachment.under_threat}. Settled by {p.persona.attachment.soothed_by}.</div>
                <div>Conscience <span className="font-mono">{p.persona.conscience.toFixed(2)}</span> — {p.persona.conscience <= 0.35 ? "other people's experience does not register as mattering. Calm makes her effective, not kinder." : "other people's pain lands on her."}</div>
                <div>Sees: {perception(p.psyche, p.persona.conscience).note}</div>
                <div>Speech: {aperture(p.psyche).note}</div>
                {wear(p.psyche) > 0.2 ? <div className="bad">Worn {Math.round(wear(p.psyche) * 100)}% — ordinary friction has stopped landing.</div> : null}
                {p.psyche.active_states.length ? <div>Holding: {p.psyche.active_states.join(", ")}</div> : null}
              </div>
            </Card>
          </Section>

          <Section title="How your doctrine reads her">
            <Card>
              {explainFor(save, p).length
                ? <ul className="text-[12.5px] space-y-1 mid">{explainFor(save, p).map((l, i) => <li key={i}>{l}</li>)}</ul>
                : <span className="text-[12.5px] dim">No doctrine has an opinion about her yet.</span>}
            </Card>
          </Section>
        </div>
      )}

      {tab === "body" && (
        <div className="space-y-4">
          {isMinor(p) ? <Card className="text-[12px] mid">She is {p.age}. Nothing on this page applies to her.</Card> : null}
          <Card>
            <p className="font-prose text-[14.5px] leading-relaxed">{p.body.appearance_facts}</p>
            <p className="text-[12.5px] dim mt-2">{p.body.appearance_now}</p>
          </Card>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[["height", `${p.body.height_cm}cm`], ["weight", `${p.body.weight_kg}kg`], ["build", p.body.weight > 20 ? "soft" : p.body.muscle > 25 ? "strong" : "average"],
              ["face", `${p.body.face}/100`], ["breasts", `${p.body.boobs}cc${p.body.boob_implant ? " (implants)" : ""}`], ["butt", `${p.body.butt}/10`],
              ["hair", `${p.body.hair_color}, ${p.body.hair_length}cm`], ["eyes", p.body.eye_color], ["skin", p.body.skin]].map(([k, v]) => (
              <div key={k} className="card-2 px-3 py-2">
                <div className="text-[10.5px] uppercase tracking-wider dim">{k}</div>
                <div className="text-[13px] font-mono">{v}</div>
              </div>
            ))}
          </div>
          {p.body.marks.length ? (
            <Section title="Marks"><Card><ul className="text-[12.5px] mid space-y-1">{p.body.marks.map((m, i) => <li key={i}>{m.what} — {m.where} (wk {m.week})</li>)}</ul></Card></Section>
          ) : null}
          <Section title="What she is wearing" >
            <Card>
              <div className="grid sm:grid-cols-3 gap-3">
                {(["clothes", "collar", "shoes"] as const).map((slot) => (
                  <Field key={slot} label={slot}>
                    <select value={p[slot]} onChange={(e) => mutate((s) => {
                      const g = GARMENT_BY_NAME[e.target.value];
                      if (g && g.cost && !ownedGarments(save).has(g.name)) s.arcology.cash -= g.cost;
                      s.people[id][slot] = e.target.value;
                    })}>
                      {WARDROBE.filter((g) => g.slot === slot).map((g) => (
                        <option key={g.id} value={g.name}>{g.name}{g.cost ? ` — ¤${g.cost}` : ""}</option>
                      ))}
                    </select>
                  </Field>
                ))}
              </div>
              <div className="text-[11.5px] dim">
                {[p.clothes, p.collar, p.shoes].map((n) => GARMENT_BY_NAME[n]).filter(Boolean).map((g) => (
                  `${g!.name}: ×${g!.appeal.toFixed(2)} on what she earns${g!.relaxation ? `, ${g!.relaxation > 0 ? "+" : ""}${g!.relaxation.toFixed(2)} a week to her` : ""}${g!.note ? ` — ${g!.note}` : ""}`
                )).join(" · ")}
              </div>
            </Card>
          </Section>

          {isMinor(p) ? null : <Section title="Marking her">
            <div className="grid gap-2 sm:grid-cols-2">
              {MODIFICATIONS.map((m) => (
                <div key={m.id} className="card-2 p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-[13px]">{m.name}</div>
                    <div className="text-[11px] dim font-mono">¤{m.cost} · {m.where}{m.resented > 3 ? " · she will not forgive this quickly" : ""}</div>
                  </div>
                  <Button size="sm" disabled={save.arcology.cash < m.cost}
                    onClick={() => mutate((s) => {
                      const person = s.people[id];
                      s.arcology.cash -= m.cost;
                      person.body.marks.push({ kind: m.kind, where: m.where, what: m.name, week: s.arcology.week });
                      person.psyche.relaxation = Math.max(-10, person.psyche.relaxation + m.relaxation);
                      if (m.resented) {
                        person.bond.resentment = Math.min(100, person.bond.resentment + m.resented * 1.5);
                        person.bond.weeks_since_cruelty = 0;
                      }
                    })}>do it</Button>
                </div>
              ))}
            </div>
          </Section>}

          {isMinor(p) ? null : <Section title="Procedures">
            <div className="grid gap-2 sm:grid-cols-2">
              {PROCEDURES.map((proc) => (
                <div key={proc.id} className="card-2 p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-[13px]">{proc.name}</div>
                    <div className="text-[11px] dim font-mono">
                      <Money n={-proc.cost} /> · {Math.max(0, Math.round(proc.recovery * skill.medicine(save)))}w recovery · {Math.round(proc.toll * skill.medicine(save))} health
                    </div>
                  </div>
                  <Button size="sm" disabled={save.arcology.cash < proc.cost || p.health.recovery_weeks > 0}
                    onClick={() => mutate((s) => {
                      const person = s.people[id];
                      s.arcology.cash -= proc.cost;
                      proc.apply(person);
                      const med = skill.medicine(s);
                      person.health.health = Math.max(-100, person.health.health - proc.toll * med);
                      person.health.recovery_weeks += Math.max(0, Math.round(proc.recovery * med));
                      practise(s, "medicine", 2);
                      for (const m of person.body.marks) if (!m.week) m.week = s.arcology.week;
                      if (proc.resented) {
                        person.bond.resentment = Math.min(100, person.bond.resentment + proc.resented * 2);
                        person.bond.weeks_since_cruelty = 0;
                      }
                    })}>do it</Button>
                </div>
              ))}
            </div>
          </Section>}
        </div>
      )}

      {tab === "work" && (
        <div className="space-y-4">
          {isMinor(p) ? (
            <Card className="text-[12px] mid">
              {p.name} is {p.age}. Rest, the nursery, the schoolroom and medical care are the entire list
              of things she can be assigned to, and the gate is in the engine rather than in this dropdown —
              a standing order cannot route around it either.
            </Card>
          ) : null}
          <Field label="Assignment">
            <select value={p.assignment} onChange={(e) => mutate((s) => {
              const person = s.people[id];
              assignToFacility(s, person, undefined);
              setAssignment(s, person, e.target.value as Assignment);
            })}>
              {allowedAssignments(p, ASSIGNMENTS.map((a) => a.id)).map((a) => {
                const def = ASSIGNMENTS.find((x) => x.id === a)!;
                return <option key={a} value={a}>{def.label}</option>;
              })}
            </select>
          </Field>
          <Field label="Facility" hint="A facility overrides the assignment above with its own work.">
            <select value={p.facility ?? ""} onChange={(e) => mutate((s) => assignToFacility(s, s.people[id], e.target.value || undefined))}>
              <option value="">— none —</option>
              {FACILITIES.filter((f) => save.arcology.facilities[f.id]?.level > 0 && (!isMinor(p) || MINOR_FACILITIES.includes(f.id))).map((f) => {
                const built = save.arcology.facilities[f.id];
                return <option key={f.id} value={f.id} disabled={built.workers.length >= built.capacity && p.facility !== f.id}>
                  {f.name} ({built.workers.length}/{built.capacity})
                </option>;
              })}
            </select>
          </Field>
          {p.facility && FACILITY_BY_ID[p.facility]?.manager ? (
            <Button size="sm" kind={save.arcology.facilities[p.facility].manager === id ? "primary" : undefined}
              onClick={() => mutate((s) => {
                const f = s.arcology.facilities[p.facility!];
                f.manager = f.manager === id ? undefined : id;
              })}>
              {save.arcology.facilities[p.facility].manager === id ? `she is the ${FACILITY_BY_ID[p.facility].manager!.title}` : `make her the ${FACILITY_BY_ID[p.facility].manager!.title}`}
            </Button>
          ) : null}

          <Section title="Skills">
            <Card>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(["oral", "vaginal", "anal", "whoring", "entertainment", "combat"] as const).map((k) => (
                  <Meter key={k} value={p.skills[k]} label={k} />
                ))}
                <Meter value={p.persona.education} label="education" />
              </div>
            </Card>
          </Section>

          <Section title="Regimen">
            <Card>
              <Field label="Diet">
                <select value={p.health.diet} onChange={(e) => mutate((s) => { s.people[id].health.diet = e.target.value as Person["health"]["diet"]; })}>
                  {["healthy", "restricted", "fattening", "muscle building", "slimming", "cleansing"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={`Curatives (${p.health.curatives})`}>
                  <input type="range" min={0} max={2} value={p.health.curatives} onChange={(e) => mutate((s) => { s.people[id].health.curatives = Number(e.target.value) as 0 | 1 | 2; })} />
                </Field>
                <Field label={`Aphrodisiacs (${p.health.aphrodisiacs})`} hint={p.health.addiction > 20 ? `dependent: ${Math.round(p.health.addiction)}` : undefined}>
                  <input type="range" min={0} max={3} value={p.health.aphrodisiacs} onChange={(e) => mutate((s) => { s.people[id].health.aphrodisiacs = Number(e.target.value) as 0 | 1 | 2 | 3; })} />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <Chip on={p.womb.contraceptives} onClick={() => mutate((s) => { s.people[id].womb.contraceptives = !s.people[id].womb.contraceptives; })}>contraceptives</Chip>
                <Chip on={p.chastity.vagina} onClick={() => mutate((s) => { s.people[id].chastity.vagina = !s.people[id].chastity.vagina; })}>chastity</Chip>
                <Chip on={p.rules_exempt} onClick={() => mutate((s) => { s.people[id].rules_exempt = !s.people[id].rules_exempt; })}>exempt from standing orders</Chip>
              </div>
            </Card>
          </Section>

          <Section title="Money">
            <Card>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
                <div><div className="dim">last week</div><Money n={p.economics.income_last_week} /></div>
                <div><div className="dim">upkeep</div><Money n={-p.economics.upkeep_last_week} /></div>
                <div><div className="dim">lifetime</div><Money n={p.economics.income_lifetime - p.economics.upkeep_lifetime} sign /></div>
                <div><div className="dim">paid for her</div><Money n={-p.economics.price_paid} /></div>
              </div>
            </Card>
          </Section>

          <div className="flex gap-2">
            <Button kind="danger" onClick={() => { mutate((s) => { sell(s, s.people[id]); }); onClose(); }}>sell her</Button>
            {modelsAvailable() && !p.persona.voice ? (
              <Button disabled={forging} onClick={async () => {
                setForging(true);
                await enrichPerson(save, save.people[id]);
                mutate(() => {});
                setForging(false);
              }}>{forging ? "writing…" : "forge her interior"}</Button>
            ) : null}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-4">
          <Card>
            <div className="text-[12.5px] mid space-y-1">
              <div><span className="dim">was</span> a {p.origin.career}</div>
              <div><span className="dim">how</span> {p.origin.background}</div>
              <div><span className="dim">acquired</span> week {p.origin.acquired_week}</div>
            </div>
            {p.persona.background ? <p className="font-prose text-[14px] leading-relaxed mt-3">{p.persona.background}</p> : null}
          </Card>
          {p.persona.voice?.example_lines?.length ? (
            <Section title="How she sounds">
              <Card><ul className="font-prose text-[14px] space-y-1.5">{p.persona.voice.example_lines.map((l, i) => <li key={i}>&ldquo;{l}&rdquo;</li>)}</ul></Card>
            </Section>
          ) : null}
          <Section title="What she carries">
            {mem?.episodic.length ? (
              <div className="space-y-1.5">
                {[...mem.episodic].sort((a, b) => b.week - a.week).slice(0, 14).map((m) => (
                  <div key={m.id} className="card-2 px-3 py-2 flex gap-3 items-baseline">
                    <span className="font-mono text-[11px] dim shrink-0">wk {m.week}</span>
                    <span className="text-[12.5px] flex-1" style={{ opacity: 0.4 + m.decay * 0.6 }}>{m.content}</span>
                    <span className="text-[10.5px] dim">{m.charge}{m.core ? " · core" : ""}</span>
                  </div>
                ))}
              </div>
            ) : <Empty>Nothing yet. Nothing has happened to her here.</Empty>}
          </Section>
          {mem?.beliefs.length ? (
            <Section title="What she has concluded">
              <Card><ul className="font-prose text-[14px] space-y-1.5">{mem.beliefs.map((b, i) => <li key={i}>&ldquo;{b.text}&rdquo; <span className="dim text-[11px] font-sans">({b.strength})</span></li>)}</ul></Card>
            </Section>
          ) : null}
          <Section title="Who she knows">
            {save.edges.filter((e) => e.from === id && (e.warmth || e.roles.length)).length ? (
              <div className="space-y-1.5">
                {save.edges.filter((e) => e.from === id).sort((a, b) => Math.abs(b.warmth) - Math.abs(a.warmth)).slice(0, 8).map((e) => (
                  <div key={e.to} className="card-2 px-3 py-2 flex items-center gap-3">
                    <span className="text-[12.5px] flex-1">{save.people[e.to]?.name ?? e.to}{e.roles.length ? ` — ${e.roles.join(", ")}` : ""}</span>
                    <div className="w-20"><Meter value={e.warmth} range={[-100, 100]} showValue={false} /></div>
                    <span className="text-[11px] dim font-mono w-8 text-right">{Math.round(e.warmth)}</span>
                  </div>
                ))}
              </div>
            ) : <Empty>She has not got to know anybody yet.</Empty>}
          </Section>
        </div>
      )}
    </div>
  );
}
