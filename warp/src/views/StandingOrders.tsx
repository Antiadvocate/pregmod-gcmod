/**
 * STANDING ORDERS, on screen: what you told her (or everyone) about how you're to be treated, with a
 * way to add one directly and to take one back. And, when a slave holds your collar, her rule.
 */
import { useState } from "react";
import { X } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Card, Meter, Section } from "../lib/ui";
import { agreementsOf, captureInstructions, houseRules, keep } from "../engine/agreements";
import { reignOf, STYLE_NOTE } from "../engine/reign";
import { LAW_BY_ID } from "../data/laws";

export function StandingOrders({ person }: { person?: string }) {
  const { save, mutate } = useGame();
  const [text, setText] = useState("");
  const p = person ? save.people[person] : undefined;
  const list = p ? agreementsOf(p) : houseRules(save);
  const mine = list.filter((a) => a.by === "you");
  const hers = list.filter((a) => a.by === "her");
  const add = () => {
    const t = text.trim();
    if (!t) return;
    mutate((s) => {
      const who = person ? [s.people[person]] : [];
      const got = captureInstructions(s, person ? t : `All of you: ${t}`, who);
      // Not in one of the shapes the reader knows: keep it as written.
      if (!got.length) keep(person ? agreementsOf(s.people[person]) : houseRules(s), { rule: t.replace(/[.!]+$/, ""), week: s.arcology.week, by: "you" });
    });
    setText("");
  };
  const drop = (rule: string) => mutate((s) => {
    const l = person ? agreementsOf(s.people[person]) : houseRules(s);
    const i = l.findIndex((a) => a.rule === rule && a.by === "you");
    if (i >= 0) l.splice(i, 1);
  });
  return (
    <Card>
      <div className="text-[11px] uppercase tracking-wider dim mb-1.5">{p ? `What ${p.name} has agreed to` : "Standing orders to the whole household"}</div>
      {mine.length ? (
        <ul className="space-y-1 mb-2">
          {mine.map((a) => (
            <li key={a.rule} className="flex items-center gap-2 text-[13px]">
              <span className="flex-1">{p ? `She ${a.rule}` : `Everyone ${a.rule}`}<span className="text-[11px] dim"> · since week {a.week}</span></span>
              <button className="dim" aria-label="take it back" title="take it back" onClick={() => drop(a.rule)}><X size={13} /></button>
            </li>
          ))}
        </ul>
      ) : <div className="text-[12px] dim mb-2">Nothing yet. Tell {p ? "her" : "them"} in a scene ("call me Rabi", "from now on…", "always…", "never…") and it's kept here, or write it below.</div>}
      {hers.length ? (
        <>
          <div className="text-[11px] uppercase tracking-wider dim mb-1 mt-2">{p && save.player.owned_by === p.id ? "Her rules for you" : "What she's been given over you"}</div>
          <ul className="space-y-0.5 mb-2">{hers.map((a) => <li key={a.rule} className="text-[13px]">· {a.rule}</li>)}</ul>
        </>
      ) : null}
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <input className="flex-1 min-w-0" value={text} onChange={(e) => setText(e.target.value)} placeholder={p ? `e.g. call me Rabi` : `e.g. kneel when I come in`} />
        <Button size="sm" kind="primary" disabled={!text.trim()} onClick={add}>Add</Button>
      </form>
    </Card>
  );
}

export function ReignCard() {
  const { save } = useGame();
  const r = reignOf(save);
  const h = r ? save.people[r.keeper] : undefined;
  if (!r || !h) return null;
  return (
    <Section title={`You belong to ${h.name}`}>
      <Card>
        <p className="font-prose text-[15px] leading-relaxed">{STYLE_NOTE[r.style]}</p>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mt-3 text-[13px]">
          <div><span className="dim">You call her</span> {r.her_title}</div>
          <div><span className="dim">She calls you</span> {r.your_name}</div>
          <div><span className="dim">You wear</span> {r.dress}</div>
          <div><span className="dim">You sleep</span> {r.sleep}</div>
        </div>
        <div className="text-[13px] mt-2"><span className="dim">Your duties:</span> {r.duties.join("; ")}.</div>
        <div className="mt-3"><Meter value={(r.favour + 100) / 2} label={`how pleased she is with you · obeyed ${r.obeyed}, defied ${r.defied}`} showValue={false} /></div>
        <div className="text-[12px] dim mt-2">
          {r.shown === "public" ? "She shows you off in public." : r.shown === "private" ? "She keeps you in the penthouse." : "She takes you out with her sometimes."}
          {r.deputy && save.people[r.deputy] ? ` ${save.people[r.deputy].name} is in charge of you when she's out.` : ""}
          {r.married ? " You're married, and still hers." : r.permanent ? " She made it permanent." : ""}
        </div>
        {r.laws.length ? <div className="text-[12.5px] mt-2"><span className="dim">Laws she signed:</span> {r.laws.map((id) => LAW_BY_ID[id]?.name ?? id).join(", ")}</div> : null}
        {r.log.length ? (
          <ul className="mt-3 space-y-0.5">
            {r.log.slice(-8).reverse().map((l, i) => <li key={i} className="text-[12.5px] flex gap-2"><span className="font-mono dim w-12 shrink-0">wk {l.week}</span><span>{l.text}</span></li>)}
          </ul>
        ) : null}
      </Card>
    </Section>
  );
}
