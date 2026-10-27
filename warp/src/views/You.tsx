/** YOU — the one character in the game whose interior the engine is not allowed to author, and
 *  the only place you can see what your household actually thinks of you. */
import { useGame } from "../lib/game";
import { Button, Card, Field, Meter, Section, Stat, cx } from "../lib/ui";
import { genderWord } from "../engine/you";
import { selfProfile } from "../engine/self";
import { addCustomSkill, allSkills, buyTraining, householdRead, PLAYER_SKILLS, removeCustomSkill, skillWord, TIERS, trainingCost, type Tier } from "../engine/player";
import { endowment, enlarge, enlargeCost, menace, talkOfIt, undoEnlarge } from "../engine/endowment";
import { useState } from "react";
import { unrest } from "../engine/security";
import { read } from "../engine/obedience";
import YourBody from "./YourBody";
import { ReignCard, StandingOrders } from "./StandingOrders";

const TIGHTNESS = ["relaxed", "a little tense", "tense", "very tense", "guarded", "completely closed off"];

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
        <Stat label="unrest" value={Math.round(u)} tone={u > 50 ? "bad" : undefined} sub="security doesn't reduce this" />
      </div>

      <ReignCard />

      <Section title="What your slaves think of you">
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
            <Field label="You are" hint="Every scene, and everyone in them, calls you this.">
              <div className="flex flex-wrap gap-1.5">
                {([["he/him", "a man · he"], ["she/her", "a woman · she"], ["they/them", "neither · they"]] as const).map(([k, label]) => (
                  <button key={k} className={cx("chip !text-[12px] !py-1 !px-3", save.player.pronouns === k && "on")}
                    onClick={() => mutate((s) => { s.player.pronouns = k; s.player.pronouns_set = true; })}>{label}</button>
                ))}
              </div>
              <div className="text-[11.5px] dim mt-1.5">{genderWord(save).replace(/^./, (c) => c.toUpperCase())}.</div>
            </Field>
            <Field label="What your slaves call you" hint="Unless one of them has agreed to something else."><input value={save.player.address ?? ""} placeholder="Master" onChange={(e) => mutate((s) => { s.player.address = e.target.value || undefined; })} /></Field>
          </div>
          <Field label="Your appearance" hint="The narrator uses this exactly as written.">
            <textarea rows={2} value={save.player.body.appearance_facts}
              onChange={(e) => mutate((s) => { s.player.body.appearance_facts = e.target.value; })} />
          </Field>
        </Card>
      </Section>

      <Section title="Who you are">
        <WhoYouAre />
      </Section>

      <Section title="Standing orders">
        <StandingOrders />
      </Section>

      <Section title="Your body">
        <YourBody />
        <WhatTheySay />
      </Section>

      <Section title="What you are good at">
        <Skills />
      </Section>

      <Section title="How reserved you are">
        <Card>
          <div className="text-[12px] dim mb-3">Limits how emotionally open the narrator writes you.</div>
          <input type="range" min={0} max={5} value={save.player.tightness ?? 0}
            onChange={(e) => mutate((s) => { s.player.tightness = Number(e.target.value); })} />
          <div className="text-[12px] mid mt-1">{TIGHTNESS[save.player.tightness ?? 0]}</div>
        </Card>
      </Section>

      <Section title="Your most attached slaves">
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

/** Your skills, what each one does, and money for getting better at them faster than practice. */
function Skills() {
  const { save, mutate } = useGame();
  const [open, setOpen] = useState<string | null>(null);
  const [said, setSaid] = useState("");
  const [name, setName] = useState("");
  const [does, setDoes] = useState("");
  const t = save.player.training;
  const social = new Set(["charisma", "seduction", "intimidation", "insight"]);
  const groups: [string, { id: string; name: string; does: string; custom?: boolean }[]][] = [
    ["With people", PLAYER_SKILLS.filter((x) => social.has(x.id))],
    ["Running things", PLAYER_SKILLS.filter((x) => !social.has(x.id))],
    ["Your own", (save.player.custom_skills ?? []).map((c) => ({ ...c, custom: true }))],
  ];
  const row = (sk: { id: string; name: string; does: string; custom?: boolean }) => (
    <div key={sk.id} className="skill-row">
      <button className="w-full text-left" onClick={() => setOpen(open === sk.id ? null : sk.id)}>
        <Meter value={save.player.skills[sk.id] ?? 0} label={`${sk.name} · ${Math.round(save.player.skills[sk.id] ?? 0)} · ${skillWord(save.player.skills[sk.id] ?? 0)}`} />
      </button>
      <div className="text-[11px] dim mt-0.5">{sk.custom ? `"${sk.does}"` : sk.does}</div>
      {open === sk.id ? (
        <div className="mt-2 space-y-1.5 fade-in">
          {(Object.keys(TIERS) as Tier[]).map((tier) => {
            const cost = trainingCost(save, sk.id, tier);
            const busy = !!TIERS[tier].weeks && !!t;
            return (
              <button key={tier} className="choice" disabled={busy || save.arcology.cash < cost} onClick={() => { let r = { ok: false, line: "" }; mutate((s) => { r = buyTraining(s, sk.id, tier); }); setSaid(r.line); setOpen(null); }}>
                <span className="block text-[13.5px] leading-snug">{TIERS[tier].name} · ¤{cost.toLocaleString()}{TIERS[tier].weeks ? ` · ${TIERS[tier].weeks} weeks` : " · today"}</span>
                <span className="block text-[11.5px] dim mt-0.5">{TIERS[tier].note} About +{TIERS[tier].gain}, less the better you already are.</span>
              </button>
            );
          })}
          {sk.custom ? <Button size="sm" kind="ghost" onClick={() => { mutate((s) => removeCustomSkill(s, sk.id)); setOpen(null); }}>forget this skill</Button> : null}
        </div>
      ) : null}
    </div>
  );
  return (
    <Card>
      {t ? <div className="text-[12.5px] acc mb-3">{TIERS[t.tier].name} in {allSkills(save).find((x) => x.id === t.skill)?.name.toLowerCase()}: {t.left} week{t.left === 1 ? "" : "s"} to go.</div> : null}
      {said ? <div className="text-[12.5px] mid mb-3">{said}</div> : null}
      <div className="skill-groups">
        {groups.map(([title, list]) => (
          <div key={title} className="skill-group">
            <div className="text-[10.5px] uppercase tracking-[.12em] dim mb-2">{title}</div>
            <div className="space-y-3">
              {list.map(row)}
              {title === "Your own" ? (
                <div className="card-2 p-3">
                  <div className="text-[12px] mid mb-2">Make up a skill of your own. Every scene, event and story is told what it is and how good you are. You get better by using it (say its name when you do), or by paying.</div>
                  <input className="mb-2" value={name} maxLength={40} placeholder="Name, e.g. Hypnosis" onChange={(e) => setName(e.target.value)} />
                  <textarea rows={2} value={does} maxLength={300} placeholder="What it lets you do, in your words, e.g. I can put people under with my voice and they do what I say." onChange={(e) => setDoes(e.target.value)} />
                  <Button size="sm" kind="primary" className="mt-2" disabled={!name.trim() || !does.trim()} onClick={() => {
                    let ok = false;
                    mutate((s) => { ok = !!addCustomSkill(s, name, does, 20); });
                    setSaid(ok ? `${name.trim()} is yours now, at 20.` : "You already have a skill by that name.");
                    if (ok) { setName(""); setDoes(""); }
                  }}>Add it</Button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="text-[11px] dim mt-3">Tap a skill to pay for training. You also get better at each by doing it, charm by talking, seduction in bed, intimidation by punishing, insight by finding things out.</div>
    </Card>
  );
}

/** What the city says about your cock, and the one thing money can do about it. */
function WhatTheySay() {
  const { save, mutate } = useGame();
  const [said, setSaid] = useState("");
  const e = endowment(save);
  if (e.dick === null) return null;
  const talk = talkOfIt(save);
  const m = menace(save);
  const cost = enlargeCost(save);
  return (
    <Card className="mt-3">
      <div className="text-[13px] mb-1">What they say about it</div>
      <p className="text-[12.5px] mid">
        {e.bought ? "It was made bigger, and everyone who knew it before knows it was bought. The jokes are about the surgery now."
          : e.big ? "Nobody laughs. People who've seen it talk about it the other way."
          : e.small ? (talk < 10 ? "Only the women you've had know, so far. They'll talk." : m >= 0.55 ? "Everyone knows, and nobody dares say it to you. You can tell from the silences." : "Everyone knows, and they joke about it where you can hear.")
          : "Nothing worth repeating."}
      </p>
      {e.small ? <div className="mt-2"><Meter value={talk} label="how far it's got around" /></div> : null}
      {e.small ? <div className="text-[11px] dim mt-1">{m >= 0.55 ? "You're feared, so it stays whispered." : m >= 0.3 ? "People are careful about it, mostly." : "Nobody's afraid of you enough to keep quiet."}</div> : null}
      {said ? <div className="text-[12.5px] acc mt-2">{said}</div> : null}
      <div className="flex gap-2 mt-2.5 flex-wrap">
        {(e.dick ?? 0) < 7 ? <Button size="sm" disabled={save.arcology.cash < cost} onClick={() => { let r = { ok: false, line: "" }; mutate((s) => { r = enlarge(s); }); setSaid(r.line); }}>Have it enlarged · ¤{cost.toLocaleString()}</Button> : null}
        {e.bought ? <Button size="sm" kind="ghost" onClick={() => { mutate((s) => undoEnlarge(s)); setSaid("Back to how you were born."); }}>have it reversed</Button> : null}
      </div>
      <div className="text-[11px] dim mt-2">Medicine makes it cheaper. The size you set in the body editor is what you were born with.</div>
    </Card>
  );
}

/** What the narrator reads about your character: your own words, and what your record says. */
function WhoYouAre() {
  const { save, mutate } = useGame();
  const read = selfProfile({ ...save, player: { ...save.player, self: "" } });
  return (
    <Card>
      <Field label="In your own words" hint="How you are with people, how you talk, what you're like with the ones you defer to. Every scene writes you this way, and it wins over the record below.">
        <textarea rows={3} value={save.player.self ?? ""} placeholder="e.g. Quiet and courteous with everyone. Generous with the household. With Sabine I'm hers: I ask permission and I mean it."
          onChange={(e) => mutate((s) => { s.player.self = e.target.value || undefined; })} />
      </Field>
      <div className="text-[11px] uppercase tracking-wider dim mt-3 mb-1">What your record tells the narrator</div>
      <ul className="space-y-1">{read.map((l, i) => <li key={i} className="text-[12.5px] mid flex gap-2"><span className="acc">·</span><span>{l}</span></li>)}</ul>
    </Card>
  );
}
