/** FCTV — the receivers, the schedule, and her show. */
import { useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Fold, cx } from "../lib/ui";
import { CHANNELS, FORMATS, installFCTV, RECEIVERS, startShow, type Channel, type ShowFormat } from "../engine/fctv";

export default function FCTVCard() {
  const { save, mutate } = useGame();
  const t = save.fctv;
  const [star, setStar] = useState("");
  const [format, setFormat] = useState<ShowFormat>("reality");
  const owned = Object.values(save.people).filter((p) => p.status === "owned" && p.age >= 18);

  if (!t?.on) {
    return (
      <Fold id="fctv" title="FCTV">
        <Card>
          <p className="font-prose text-[14px] leading-relaxed mb-2">Install FCTV receivers across the arcology. What your citizens watch changes what they think: doctrine shows push your doctrines, the news steadies them, the porn channel makes them spend. You can put one of your slaves on the air in a show of her own.</p>
          <Button kind="primary" disabled={save.arcology.cash < RECEIVERS} onClick={() => mutate((s) => { installFCTV(s); })}>Install receivers · ¤{RECEIVERS.toLocaleString()}</Button>
        </Card>
      </Fold>
    );
  }
  const her = t.show ? save.people[t.show.star] : undefined;
  return (
    <Fold id="fctv" title="FCTV" count={t.show ? 1 : undefined}>
      <Card>
        {t.last?.text.length ? <p className="font-prose text-[14px] leading-relaxed mb-3">{t.last.text.join(" ")}</p> : <p className="text-[12px] dim mb-3">The first broadcast goes out when this week ends.</p>}
        <div className="text-[11px] uppercase tracking-wider dim mb-1">Prime time</div>
        <div className="space-y-1.5">
          {(Object.keys(CHANNELS) as Channel[]).map((c) => (
            <div key={c} className="flex items-center gap-2">
              <div className="flex-1 min-w-0"><div className="text-[12.5px]">{CHANNELS[c].name}</div><div className="text-[11px] dim truncate">{CHANNELS[c].note}</div></div>
              {[0, 1, 2, 3].map((n) => <button key={n} className={cx("chip !px-2 !py-0.5 !text-[11px]", t.slots[c] === n && "on")} onClick={() => mutate((s) => { s.fctv!.slots[c] = n; })}>{n}</button>)}
            </div>
          ))}
        </div>
        <div className="text-[11px] uppercase tracking-wider dim mt-4 mb-1">Her own show</div>
        {t.show && her ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 text-[12.5px]">{her.name}'s {FORMATS[t.show.format].name.toLowerCase()} · {t.show.weeks} weeks · {t.show.viewers.toLocaleString()} viewers</div>
            <Button size="sm" kind="ghost" onClick={() => mutate((s) => { s.fctv!.show = undefined; })}>cancel it</Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            <select value={star} onChange={(e) => setStar(e.target.value)} className="!w-auto">
              <option value="">— who —</option>
              {owned.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={format} onChange={(e) => setFormat(e.target.value as ShowFormat)} className="!w-auto">
              {(Object.keys(FORMATS) as ShowFormat[]).map((f) => <option key={f} value={f}>{FORMATS[f].name}</option>)}
            </select>
            <Button size="sm" disabled={!star} onClick={() => mutate((s) => { const p = s.people[star]; if (p) startShow(s, p, format); })}>Put her on the air</Button>
            <div className="text-[11px] dim w-full">{FORMATS[format].note}</div>
          </div>
        )}
      </Card>
    </Fold>
  );
}
