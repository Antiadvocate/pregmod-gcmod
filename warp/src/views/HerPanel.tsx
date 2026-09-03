/**
 * WHERE SHE STANDS, AND WHO IS DECIDING.
 *
 * The ladder with every gate visible, including the ones she has not cleared — because "you cannot
 * marry her yet" is not useful and "78% of her obedience is fear and this rung allows 22%" is the
 * whole game. The wall is the content.
 */
import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Meter, Money, Section, cx } from "../lib/ui";
import { LADDER, RUNGS, RUNG_BY_ID, RITES, ascend, nextRung, renounce, romanceOf, rungIndex, herReach } from "../engine/romance";
import { read } from "../engine/obedience";
import { generateAsk, grantAsk, refuseAsk, voiceAsk } from "../engine/asks";
import { runTurn } from "../engine/turn";
import { modelsAvailable } from "../config";

export default function HerPanel({ id }: { id: string }) {
  const { save, mutate } = useGame();
  const [busy, setBusy] = useState(false);
  const [rite, setRite] = useState<string | null>(null);
  const p = save.people[id];
  if (!p) return null;

  const rom = romanceOf(p);
  const r = read(p, save.memory[id]);
  const next = nextRung(save, p);
  const idx = rungIndex(rom.standing);
  const reach = herReach(p);
  const ask = save.asks?.find((a) => a.person === id) ?? null;

  async function climb() {
    if (!next?.ready) return;
    setBusy(true);
    let seed: string | undefined;
    mutate((s) => {
      const res = ascend(s, s.people[id]);
      seed = res.seed;
      for (const l of res.lines) s.notifications.push({ id: `n-rite-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, week: s.arcology.week, text: l.text, kind: l.tone === "bad" ? "danger" : l.tone === "good" ? "good" : "info", person: id, seen: false });
    });
    // The rite is played as a scene when there is a narrator to play it.
    if (seed && modelsAvailable()) {
      await runTurn(save, seed, "story");
      mutate(() => {});
    }
    setRite(seed ?? null);
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Heart size={14} className="acc" />
          <span className="text-[14px]">{RUNG_BY_ID[rom.standing].name}</span>
          <span className="text-[11px] dim">since week {rom.since_week}</span>
          {rom.exclusive ? <Chip tone="good">the only one</Chip> : null}
        </div>
        <p className="font-prose text-[14px] mid">{RUNG_BY_ID[rom.standing].what}</p>

        <div className="mt-4">
          <Meter value={rom.dominion} range={[-100, 100]} label="who is deciding — you ← → her" />
          <div className="text-[11px] dim mt-1">
            {rom.dominion <= -60 ? "You decide everything and she knows it."
              : rom.dominion < 0 ? "She has opinions. You have not had to hear many of them."
              : rom.dominion < 40 ? "She says things now, and sometimes you do them."
              : rom.dominion < 70 ? "She moves people around the household and tells you afterwards."
              : rom.dominion < 85 ? "She is running this. You are being kept informed."
              : "She decides. You are asked."}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Chip on={reach.assignments}>assignments</Chip>
            <Chip on={reach.purchases}>spending</Chip>
            <Chip on={reach.policy}>doctrine</Chip>
            <Chip on={reach.everything}>the books</Chip>
          </div>
          <div className="text-[11px] dim mt-2 font-mono">granted {rom.granted} · refused {rom.refused}</div>
        </div>
      </Card>

      {ask ? (
        <Card>
          <div className="text-[11px] uppercase tracking-wider dim mb-1.5">{ask.kind === "instruction" ? "she is not asking" : "she is asking"}</div>
          <p className="font-prose text-[15px] mb-3">{ask.text}</p>
          <div className="flex flex-wrap gap-2">
            <Button kind="primary" onClick={() => mutate((s) => { grantAsk(s, ask); })}>
              do it{ask.cash ? ` · ¤${ask.cash.toLocaleString()}` : ""}
            </Button>
            <Button onClick={() => mutate((s) => { refuseAsk(s, ask, false); })}>say no</Button>
            <Button kind="danger" onClick={() => mutate((s) => { refuseAsk(s, ask, true); })}>put her in her place</Button>
          </div>
          <div className="text-[11px] dim mt-2 font-mono">
            she gains {ask.gain} if you do · she loses {ask.loss} if you do not
          </div>
        </Card>
      ) : (
        <Button size="sm" kind="ghost" disabled={busy} onClick={async () => {
          setBusy(true);
          const a = generateAsk(save, p);
          if (a) {
            a.text = await voiceAsk(save, a);
            mutate((s) => { s.asks = [...(s.asks ?? []).filter((x) => x.person !== id), a]; });
          }
          setBusy(false);
        }}>
          {busy ? <Loader2 size={13} className="animate-spin" /> : "ask her what she wants"}
        </Button>
      )}

      <Section title="The ladder">
        <div className="space-y-2">
          {RUNGS.map((rung, i) => {
            const here = i === idx;
            const done = i < idx;
            const isNext = i === idx + 1;
            return (
              <div key={rung.id} className={cx("card-2 p-3", here && "border-l-2", !done && !here && !isNext && "opacity-45")}
                style={here ? { borderLeftColor: "var(--accent)" } : undefined}>
                <div className="flex items-baseline gap-2">
                  <span className={cx("text-[13px]", done && "dim")}>{rung.name}</span>
                  {done ? <Chip tone="good">done</Chip> : here ? <Chip on>here</Chip> : null}
                  {rung.rite && !done ? <span className="ml-auto text-[11px] dim">{RITES[rung.rite]?.cash ? <Money n={-RITES[rung.rite].cash} /> : "no cost"}</span> : null}
                </div>
                <div className="text-[12px] dim mt-0.5">{rung.what}</div>
                {isNext && next ? (
                  <div className="mt-2.5">
                    {next.ready ? (
                      <Button kind="primary" size="sm" disabled={busy} onClick={climb}>
                        {busy ? <Loader2 size={13} className="animate-spin" /> : RITES[rung.rite ?? ""]?.name ?? "go up"}
                      </Button>
                    ) : (
                      <ul className="text-[11.5px] space-y-1">
                        {next.blocked.map((b, j) => <li key={j} className="flex gap-2"><span className="bad">·</span><span className="mid">{b}</span></li>)}
                      </ul>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Section>

      {rite ? (
        <Card>
          <div className="text-[11px] uppercase tracking-wider dim mb-1.5">it happened</div>
          <p className="font-prose text-[15px]">{rite}</p>
          <div className="text-[11.5px] dim mt-2">Played out in the scene log.</div>
        </Card>
      ) : null}

      {idx > 0 ? (
        <Button kind="danger" size="sm" onClick={() => {
          const why = prompt(`Take it back from ${p.name}. Why?`, "you changed your mind");
          if (!why) return;
          mutate((s) => {
            for (const l of renounce(s, s.people[id], why)) {
              s.notifications.push({ id: `n-ren-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, week: s.arcology.week, text: l.text, kind: "danger", person: id, seen: false });
            }
          });
        }}>take it back</Button>
      ) : null}

      <Card className="text-[11.5px] dim">
        {Math.round(r.fragility * 100)}% of her obedience is fear rather than bond. Courting needs it under 35%,
        marriage under 15%.
      </Card>
    </div>
  );
}
