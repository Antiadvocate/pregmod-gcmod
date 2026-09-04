/** CHEATS — every number in the game, directly. Nobody to be fair to in a single-player arcology. */
import { useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Field, Money, Section, Stat } from "../lib/ui";
import {
  addCash, setCash, setRep, buildAll, setFacility, ownAllSectors, forceDoctrine, enactAllPolicies,
  spawn, perfect, maxSkills, setStanding, setBond, backfill, revealAll,
} from "../engine/cheats";
import { FACILITIES } from "../data/facilities";
import { DOCTRINES } from "../data/doctrines";
import { NATIONS } from "../data/people";
import { FETISHES } from "../data/intimacy";
import { LADDER, RUNG_BY_ID, romanceOf } from "../engine/romance";
import { endWeek } from "../engine/week";
import { read } from "../engine/obedience";
import { reversalOf, nextEvent as chainEvent } from "../engine/reversal";
import { CHAIN } from "../data/reversal";

export default function Cheats() {
  const { save, mutate } = useGame();
  const [note, setNote] = useState("");
  const [who, setWho] = useState<string>("");
  const [spawnSpec, setSpawnSpec] = useState({ count: 1, nation: "", age: 22, quality: 0.5, fetish: "", devoted: true });
  const people = Object.values(save.people).filter((p) => p.status === "owned" || p.status === "indentured");
  const target = who ? save.people[who] : people[0];

  const say = (s: string) => setNote(s);

  return (
    <>
      {note ? <Card className="mb-4 text-[12.5px] acc">{note}</Card> : null}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Stat label="cash" value={<Money n={save.arcology.cash} />} />
        <Stat label="rep" value={Math.round(save.arcology.rep)} />
        <Stat label="week" value={save.arcology.week} />
        <Stat label="owned" value={people.length} />
      </div>

      <Section title="Money">
        <Card>
          <div className="flex flex-wrap gap-2 mb-3">
            {[10000, 100000, 1000000].map((n) => (
              <Button key={n} size="sm" onClick={() => mutate((s) => { addCash(s, n); say(`+¤${n.toLocaleString()}`); })}>+¤{n.toLocaleString()}</Button>
            ))}
            <Button size="sm" onClick={() => mutate((s) => { setCash(s, 0); say("cash zeroed"); })}>zero it</Button>
            <Button size="sm" onClick={() => mutate((s) => { setRep(s, 20000); say("reputation maxed"); })}>max reputation</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Set cash exactly">
              <input type="number" defaultValue={save.arcology.cash}
                onBlur={(e) => mutate((s) => { setCash(s, Number(e.target.value)); say("cash set"); })} />
            </Field>
            <Field label="Set reputation">
              <input type="number" defaultValue={Math.round(save.arcology.rep)}
                onBlur={(e) => mutate((s) => { setRep(s, Number(e.target.value)); say("reputation set"); })} />
            </Field>
          </div>
        </Card>
      </Section>

      <Section title="The arcology">
        <Card>
          <div className="grid sm:grid-cols-3 gap-3">
            {([["prosperity", 200], ["security", 100], ["crime", 100], ["population", 20000], ["ownership", 100]] as const).map(([k, max]) => (
              <Field key={k} label={`${k} — ${Math.round(save.arcology[k] as number)}`}>
                <input type="range" min={0} max={max} value={Math.round(save.arcology[k] as number)}
                  onChange={(e) => mutate((s) => { (s.arcology[k] as number) = Number(e.target.value); })} />
              </Field>
            ))}
            <Field label={`food stores — ${Math.round(save.arcology.food.stores)}`}>
              <input type="range" min={0} max={8000} value={Math.round(save.arcology.food.stores)}
                onChange={(e) => mutate((s) => { s.arcology.food.stores = Number(e.target.value); })} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => mutate((s) => { ownAllSectors(s); say("every sector is yours"); })}>own every sector</Button>
            <Button size="sm" onClick={() => mutate((s) => { s.arcology.loans = []; say("debts cleared"); })}>clear debts</Button>
            <Button size="sm" onClick={() => mutate((s) => { s.arcology.mercenaries = { hired: true, strength: 100, loyalty: 100, upkeep: 0 }; say("mercenaries, free and loyal"); })}>free mercenaries</Button>
          </div>
        </Card>
      </Section>

      <Section title="Spaces">
        <Card>
          <div className="flex flex-wrap gap-2 mb-3">
            <Button size="sm" kind="primary" onClick={() => mutate((s) => { buildAll(s, 3); say("everything built to level 3, fully upgraded"); })}>build everything</Button>
            <Button size="sm" onClick={() => mutate((s) => { buildAll(s, 6); say("everything at level 6"); })}>and make it huge</Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {FACILITIES.map((def) => {
              const f = save.arcology.facilities[def.id];
              return (
                <div key={def.id} className="card-2 p-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px]">{def.name}</div>
                    <div className="text-[11px] dim font-mono">lvl {f?.level ?? 0} · {f?.workers.length ?? 0}/{f?.capacity ?? 0}</div>
                  </div>
                  <input type="number" className="w-16" min={0} max={9} value={f?.level ?? 0}
                    onChange={(e) => mutate((s) => setFacility(s, def.id, Number(e.target.value)))} />
                </div>
              );
            })}
          </div>
        </Card>
      </Section>

      <Section title="Doctrine and law">
        <Card>
          <div className="flex flex-wrap gap-2 mb-3">
            <Button size="sm" onClick={() => mutate((s) => { enactAllPolicies(s); say("every policy in force"); })}>enact every policy</Button>
            <Button size="sm" onClick={() => mutate((s) => { s.arcology.policies = {}; s.arcology.doctrines = {}; say("wiped"); })}>wipe doctrine and law</Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DOCTRINES.map((d) => (
              <Chip key={d.id} on={!!save.arcology.doctrines[d.id]}
                onClick={() => mutate((s) => {
                  if (s.arcology.doctrines[d.id]) delete s.arcology.doctrines[d.id];
                  else forceDoctrine(s, d.id, 100);
                  say(`${d.noun} ${s.arcology.doctrines[d.id] ? "adopted at 100%" : "dropped"}`);
                })}>
                {d.noun}
              </Chip>
            ))}
          </div>
          <div className="text-[11px] dim mt-2">Ignores the four-at-once cap and every conflict.</div>
        </Card>
      </Section>

      <Section title="Conjure people">
        <Card>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="How many"><input type="number" min={1} max={50} value={spawnSpec.count} onChange={(e) => setSpawnSpec({ ...spawnSpec, count: Number(e.target.value) })} /></Field>
            <Field label="Age"><input type="number" min={18} max={50} value={spawnSpec.age} onChange={(e) => setSpawnSpec({ ...spawnSpec, age: Number(e.target.value) })} /></Field>
            <Field label="Quality"><input type="range" min={-100} max={100} value={spawnSpec.quality * 100} onChange={(e) => setSpawnSpec({ ...spawnSpec, quality: Number(e.target.value) / 100 })} /></Field>
            <Field label="From">
              <select value={spawnSpec.nation} onChange={(e) => setSpawnSpec({ ...spawnSpec, nation: e.target.value })}>
                <option value="">anywhere</option>
                {NATIONS.map((n) => <option key={n.name} value={n.name}>{n.name}</option>)}
              </select>
            </Field>
            <Field label="Into">
              <select value={spawnSpec.fetish} onChange={(e) => setSpawnSpec({ ...spawnSpec, fetish: e.target.value })}>
                <option value="">whatever she rolls</option>
                {FETISHES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </Field>
            <Field label=" ">
              <Chip on={spawnSpec.devoted} onClick={() => setSpawnSpec({ ...spawnSpec, devoted: !spawnSpec.devoted })}>arrives devoted</Chip>
            </Field>
          </div>
          <Button kind="primary" onClick={() => mutate((s) => {
            const made = spawn(s, { ...spawnSpec, nation: spawnSpec.nation || undefined, fetish: spawnSpec.fetish || undefined });
            say(`${made.map((m) => m.name).join(", ")} — conjured`);
          })}>conjure</Button>
        </Card>
      </Section>

      <Section title="The household">
        <Card>
          <div className="flex flex-wrap gap-2 mb-3">
            <Button size="sm" onClick={() => mutate((s) => { for (const p of Object.values(s.people)) perfect(s, p); say("everyone is perfect and adores you"); })}>perfect everyone</Button>
            <Button size="sm" onClick={() => mutate((s) => { for (const p of Object.values(s.people)) maxSkills(p); say("every skill maxed"); })}>max every skill</Button>
            <Button size="sm" onClick={() => mutate((s) => { const n = revealAll(s); say(`${n} hidden things revealed`); })}>reveal every fetish</Button>
            <Button size="sm" onClick={() => mutate((s) => { const r = backfill(s); say(`backfilled ${r.people} people — ${r.fetishes} fetishes, ${r.quirks} quirks, ${r.flaws} flaws`); })}>
              backfill an old save
            </Button>
          </div>
          <div className="text-[11px] dim">
            Backfill only fills what is missing. A save made before fetishes existed has none, which is why an old
            household looks empty.
          </div>
        </Card>
      </Section>

      {target ? (
        <Section title="One person">
          <Card>
            <Field label="Who">
              <select value={target.id} onChange={(e) => setWho(e.target.value)}>
                {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <div className="grid sm:grid-cols-4 gap-3">
              {([["bond", -100, 100], ["fear", 0, 100], ["resentment", 0, 100], ["hope", 0, 100]] as const).map(([k, lo, hi]) => (
                <Field key={k} label={`${k} — ${Math.round(target.bond[k])}`}>
                  <input type="range" min={lo} max={hi} value={Math.round(target.bond[k])}
                    onChange={(e) => mutate((s) => setBond(s, s.people[target.id], { [k]: Number(e.target.value) }))} />
                </Field>
              ))}
            </div>
            <div className="grid sm:grid-cols-4 gap-3">
              <Field label={`relaxation — ${target.psyche.relaxation.toFixed(1)}`}>
                <input type="range" min={-10} max={10} step={0.5} value={target.psyche.relaxation}
                  onChange={(e) => mutate((s) => { s.people[target.id].psyche.relaxation = Number(e.target.value); })} />
              </Field>
              <Field label={`health — ${Math.round(target.health.health)}`}>
                <input type="range" min={-100} max={100} value={Math.round(target.health.health)}
                  onChange={(e) => mutate((s) => { s.people[target.id].health.health = Number(e.target.value); })} />
              </Field>
              <Field label={`boobs — ${target.body.boobs}cc`}>
                <input type="range" min={0} max={3000} step={50} value={target.body.boobs}
                  onChange={(e) => mutate((s) => { s.people[target.id].body.boobs = Number(e.target.value); })} />
              </Field>
              <Field label={`weight — ${target.body.weight}`}>
                <input type="range" min={-100} max={100} value={target.body.weight}
                  onChange={(e) => mutate((s) => { s.people[target.id].body.weight = Number(e.target.value); })} />
              </Field>
            </div>
            <Field label={`Where she stands — ${RUNG_BY_ID[romanceOf(target).standing].name}, she decides ${Math.round(romanceOf(target).dominion)}`}>
              <div className="flex flex-wrap gap-1.5">
                {LADDER.map((st) => (
                  <Chip key={st} on={romanceOf(target).standing === st}
                    onClick={() => mutate((s) => { setStanding(s, s.people[target.id], st, st === "keeper" ? 100 : undefined); say(`${target.name}: ${RUNG_BY_ID[st].name}`); })}>
                    {RUNG_BY_ID[st].name}
                  </Chip>
                ))}
              </div>
            </Field>
            <Field label={`Dominion — ${Math.round(romanceOf(target).dominion)}`}>
              <input type="range" min={-100} max={100} value={Math.round(romanceOf(target).dominion)}
                onChange={(e) => mutate((s) => { romanceOf(s.people[target.id]).dominion = Number(e.target.value); })} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => mutate((s) => { perfect(s, s.people[target.id]); say(`${target.name} is perfect`); })}>perfect her</Button>
              <Button size="sm" onClick={() => mutate((s) => { s.people[target.id].womb.fetuses = []; s.people[target.id].womb.weeks = 0; s.people[target.id].body.belly = 0; say("no longer pregnant"); })}>end pregnancy</Button>
              <Button size="sm" kind="danger" onClick={() => mutate((s) => { delete s.people[target.id]; setWho(""); say(`${target.name} removed`); })}>remove her</Button>
            </div>
            <div className="text-[11px] dim mt-2 font-mono">
              reads: devotion {read(target, save.memory[target.id]).devotion} · trust {read(target, save.memory[target.id]).trust}
            </div>
          </Card>
        </Section>
      ) : null}

      <Section title="Supplicationism">
        <Card>
          <div className="flex flex-wrap gap-2 items-end mb-3">
            <Field label={`deference — ${Math.round(reversalOf(save).deference)}`}>
              <input type="range" min={0} max={100} value={Math.round(reversalOf(save).deference)}
                onChange={(e) => mutate((s) => { reversalOf(s).deference = Number(e.target.value); })} />
            </Field>
            <Field label={`the Association — ${Math.round(reversalOf(save).association)}`}>
              <input type="range" min={-100} max={100} value={Math.round(reversalOf(save).association)}
                onChange={(e) => mutate((s) => { reversalOf(s).association = Number(e.target.value); })} />
            </Field>
            <Button size="sm" onClick={() => mutate((s) => {
              const rev = reversalOf(s);
              rev.fees_open = !rev.fees_open; say(rev.fees_open ? "service fees open" : "service fees closed");
            })}>{reversalOf(save).fees_open ? "close the fees" : "open the fees"}</Button>
            <Button size="sm" onClick={() => mutate((s) => {
              const rev = reversalOf(s);
              rev.deference = 0; rev.done = []; rev.association = 0; rev.fees_open = false; rev.embargo = 0;
              delete rev.pending; delete rev.ended; delete rev.subject; delete rev.last_public; delete rev.last_gesture;
              say("chain reset");
            })}>reset the chain</Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CHAIN.map((e) => {
              const rev = reversalOf(save);
              const state = rev.pending === e.id ? "on" : rev.done.includes(e.id) ? "done" : "";
              return (
                <Chip key={e.id} on={state === "on"} tone={state === "done" ? "good" : undefined} onClick={() => mutate((s) => {
                  const r = reversalOf(s);
                  r.done = CHAIN.slice(0, CHAIN.indexOf(e)).map((x) => x.id);
                  r.deference = Math.max(r.deference, e.needs_deference ?? 0);
                  r.pending = e.id;
                  s.arcology.week = Math.max(s.arcology.week, e.week);
                  delete r.ended;
                  say(`jumped to "${e.title}" — it is waiting in the penthouse`);
                })}>{e.week}. {e.title}{state === "done" ? " ✓" : ""}</Chip>
              );
            })}
          </div>
          <div className="text-[11px] dim mt-2">
            {chainEvent(save) ? `Waiting: ${chainEvent(save)!.title}.` : reversalOf(save).ended ? `Finished: ${reversalOf(save).ended}.` : "Nothing pending. The next beat is gated on its week and your deference."}
          </div>
        </Card>
      </Section>

      <Section title="Time">
        <Card>
          <div className="flex flex-wrap gap-2">
            {[1, 4, 12].map((n) => (
              <Button key={n} size="sm" onClick={() => mutate((s) => { for (let i = 0; i < n; i++) endWeek(s); say(`${n} week${n > 1 ? "s" : ""} run`); })}>
                run {n} week{n > 1 ? "s" : ""}
              </Button>
            ))}
          </div>
          <div className="text-[11px] dim mt-2">Runs the full weekly pipeline, so everything that would have happened does.</div>
        </Card>
      </Section>
    </>
  );
}
