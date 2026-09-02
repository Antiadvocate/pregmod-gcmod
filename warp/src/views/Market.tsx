/** THE MARKET — five different populations, five different lies.
 *
 *  What a seller says is on the card. What they are not saying costs 3% of the asking price to
 *  find out, and you will not always find all of it. Buying is a judgement, not a shopping trip. */
import { useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Empty, Meter, Money, Section, Sheet } from "../lib/ui";
import { MARKETS, askingPrice, buy, inspect } from "../engine/market";
import { read } from "../engine/obedience";
import { band } from "../engine/psyche";
import { societyScore } from "../engine/society";
import type { MarketOffer } from "../engine/types";

export default function Market() {
  const { save, mutate } = useGame();
  const [open, setOpen] = useState<MarketOffer | null>(null);
  const [found, setFound] = useState<Record<string, string[]>>({});

  return (
    <>
      {MARKETS.map((m) => {
        const offers = save.market.offers[m.id] ?? [];
        const locked = save.arcology.rep < m.needs_rep;
        return (
          <Section key={m.id} title={m.name} right={<span className="text-[11px] dim">{m.blurb}</span>}>
            {locked ? (
              <Empty>They will not deal with you at {Math.round(save.arcology.rep)} reputation. They want {m.needs_rep.toLocaleString()}.</Empty>
            ) : offers.length ? (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {offers.map((o) => {
                  const p = o.person;
                  const fit = societyScore(save, p).total;
                  return (
                    <Card key={o.id} onClick={() => setOpen(o)}>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[14px]">{p.name}</span>
                        <span className="text-[11px] dim font-mono">{p.age} · {p.origin.nationality}</span>
                        <span className="ml-auto font-mono text-[13px] acc">¤{askingPrice(save, o).toLocaleString()}</span>
                      </div>
                      <div className="font-prose text-[13px] mid mt-1.5">&ldquo;{o.pitch}&rdquo;</div>
                      <div className="text-[11.5px] dim mt-1.5">{p.body.appearance_facts}</div>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        <Chip>{band(p.psyche)}</Chip>
                        <Chip>{p.origin.career}</Chip>
                        {Math.abs(fit) > 0.15 ? <Chip tone={fit > 0 ? "good" : "bad"}>doctrine {fit > 0 ? "+" : ""}{fit.toFixed(2)}</Chip> : null}
                        {found[o.id]?.length ? <Chip tone="bad">{found[o.id].length} problems found</Chip> : null}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : <Empty>Nothing this week.</Empty>}
          </Section>
        );
      })}

      {save.market.offers["recruit"]?.length ? (
        <Section title="Your recruiter brought somebody back">
          {save.market.offers["recruit"].map((o) => (
            <Card key={o.id} onClick={() => setOpen(o)}>
              <div className="flex items-baseline gap-2">
                <span className="text-[14px]">{o.person.name}</span>
                <span className="ml-auto font-mono acc">¤{o.price.toLocaleString()}</span>
              </div>
              <div className="font-prose text-[13px] mid mt-1">{o.pitch}</div>
            </Card>
          ))}
        </Section>
      ) : null}

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.person.name ?? ""} wide>
        {open ? (
          <div className="space-y-4">
            <Card>
              <p className="font-prose text-[14.5px] leading-relaxed">{open.person.body.appearance_facts}</p>
              <p className="text-[12.5px] dim mt-2">{open.person.origin.background}</p>
            </Card>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Meter value={open.person.health.health} range={[-100, 100]} label="health" />
              <Meter value={read(open.person).devotion} range={[-100, 100]} label="devotion" />
              <Meter value={read(open.person).trust} range={[-100, 100]} label="trust" />
              <Meter value={open.person.body.face} label="face" />
            </div>
            <div className="text-[12.5px] mid space-y-1">
              <div>Was a {open.person.origin.career}. {open.person.persona.attachment.style} attachment — under threat she {open.person.persona.attachment.under_threat}.</div>
              <div>Traits: {open.person.persona.core_traits.join(" · ")}</div>
            </div>

            <Card>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-[12.5px]">
                  {found[open.id]
                    ? found[open.id].length
                      ? <ul className="space-y-1">{found[open.id].map((f, i) => <li key={i} className="bad">· {f}</li>)}</ul>
                      : <span className="dim">An hour with her turned up nothing. That is not the same as there being nothing.</span>
                    : <span className="dim">An hour and a doctor, at 3% of the asking price. You will not always find everything.</span>}
                </div>
                {!found[open.id] ? (
                  <Button size="sm" onClick={() => {
                    const res = inspect(save, open);
                    mutate((s) => { s.arcology.cash -= res.cost; });
                    setFound((f) => ({ ...f, [open.id]: res.found }));
                  }}>inspect · ¤{Math.round(open.price * 0.03)}</Button>
                ) : null}
              </div>
            </Card>

            <div className="flex items-center gap-3">
              <span className="font-mono text-[16px] acc">¤{askingPrice(save, open).toLocaleString()}</span>
              {askingPrice(save, open) < open.price ? <span className="text-[11px] dim">asking ¤{open.price.toLocaleString()}; you talked them down</span> : null}
              <Button kind="primary" disabled={save.arcology.cash < askingPrice(save, open)}
                onClick={() => { mutate((s) => { buy(s, open); }); setOpen(null); }}>
                buy her
              </Button>
              <span className="text-[11px] dim">you have <Money n={save.arcology.cash} /></span>
            </div>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
