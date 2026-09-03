/** YOU — the one character in the game whose interior the engine is not allowed to author, and
 *  the only place you can see what your household actually thinks of you. */
import { useGame } from "../lib/game";
import { Button, Card, Field, Meter, Section, Stat } from "../lib/ui";
import { householdRead, PLAYER_SKILLS } from "../engine/player";
import { unrest } from "../engine/security";
import { read } from "../engine/obedience";

const TIGHTNESS = ["not holding anything", "a little wound up", "tight", "very tight", "clenched", "nothing is getting through"];

export default function You() {
  const { save, mutate } = useGame();
  const r = householdRead(save);
  const household = Object.values(save.people).filter((p) => p.status === "owned" || p.status === "indentured");
  const u = unrest(save);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <Stat label="household" value={household.length} sub={`${household.filter((p) => p.facility).length} in facilities`} />
        <Stat label="feared" value={Math.round(r.feared)} tone={r.feared > 60 ? "warn" : undefined} />
        <Stat label="trusted" value={Math.round(r.trusted)} tone={r.trusted > 50 ? "good" : undefined} />
        <Stat label="unrest" value={Math.round(u)} tone={u > 50 ? "bad" : undefined} sub="watch does not touch this" />
      </div>

      <Section title="What they would say about you if you were not in the room">
        <Card>
          <p className="font-prose text-[15.5px] mb-3">You are {r.label}.</p>
          <ul className="space-y-2 text-[13px]">
            {r.lines.map((l, i) => <li key={i} className="flex gap-2"><span className="acc">·</span><span>{l}</span></li>)}
          </ul>
        </Card>
      </Section>

      <Section title="You">
        <Card>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name"><input value={save.player.name} onChange={(e) => mutate((s) => { s.player.name = e.target.value; })} /></Field>
            <Field label="What they call you"><input value={save.player.title} onChange={(e) => mutate((s) => { s.player.title = e.target.value; })} /></Field>
          </div>
          <Field label="How you look, to somebody meeting you" hint="The narrator uses this verbatim. Nothing else writes it.">
            <textarea rows={2} value={save.player.body.appearance_facts}
              onChange={(e) => mutate((s) => { s.player.body.appearance_facts = e.target.value; })} />
          </Field>
        </Card>
      </Section>

      <Section title="What you are good at">
        <Card>
          <div className="space-y-3">
            {PLAYER_SKILLS.map((sk) => (
              <div key={sk.id}>
                <Meter value={save.player.skills[sk.id] ?? 0} label={sk.name} />
                <div className="text-[11px] dim mt-0.5">{sk.does}</div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="How tightly you are holding yourself">
        <Card>
          <div className="text-[12px] dim mb-3">Caps how open the narrator may write you. Never lifts it.</div>
          <input type="range" min={0} max={5} value={save.player.tightness ?? 0}
            onChange={(e) => mutate((s) => { s.player.tightness = Number(e.target.value); })} />
          <div className="text-[12px] mid mt-1">{TIGHTNESS[save.player.tightness ?? 0]}</div>
        </Card>
      </Section>

      <Section title="The ones who would notice if you stopped">
        <div className="space-y-1.5">
          {household
            .map((p) => ({ p, r: read(p, save.memory[p.id]) }))
            .sort((a, b) => b.p.bond.bond - a.p.bond.bond)
            .slice(0, 6)
            .map(({ p, r: pr }) => (
              <div key={p.id} className="card-2 px-3 py-2 flex items-center gap-3">
                <span className="text-[13px] flex-1">{p.name}</span>
                <span className="text-[11px] dim">{pr.fragility > 0.6 ? "held by fear" : p.bond.bond > 25 ? "held by the bond" : "held by neither, particularly"}</span>
                <div className="w-24"><Meter value={p.bond.bond} range={[-100, 100]} showValue={false} /></div>
              </div>
            ))}
        </div>
      </Section>
    </>
  );
}
