/** THE ASSISTANT — set her up, read her brief, ask her things. */
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Card, cx } from "../lib/ui";
import { askAssistant, briefWeek, makeAssistant, PA_LOOKS, PA_MANNERS, PA_QUESTIONS, type PALook, type PAManner } from "../engine/assistant";

export function PAAvatar({ look, hue, size = 56 }: { look: PALook; hue: number; size?: number }) {
  const c = `hsl(${hue} 70% 62%)`, d = `hsl(${hue} 60% 38%)`, glow = `hsl(${hue} 90% 75%)`;
  const face = look === "shadow" ? "#15161b" : look === "classic" ? "none" : `hsl(${(hue + 20) % 360} 35% 78%)`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="30" fill={`hsl(${hue} 40% 14%)`} stroke={c} strokeWidth="1.5" />
      {look === "goddess" ? <circle cx="32" cy="32" r="26" fill={glow} opacity=".25" /> : null}
      {look === "angel" ? <><path d="M10 40 Q4 22 18 20 Q14 30 20 40Z M54 40 Q60 22 46 20 Q50 30 44 40Z" fill="#f4f1ea" opacity=".85" /><ellipse cx="32" cy="12" rx="10" ry="3" fill="none" stroke="#f3d56b" strokeWidth="2" /></> : null}
      {look === "classic" ? <><circle cx="32" cy="32" r="16" fill="none" stroke={c} strokeWidth="2" /><circle cx="32" cy="32" r="8" fill={c} opacity=".6" /><circle cx="32" cy="32" r="3" fill={glow} /></> : (
        <>
          {look === "amazon" ? <path d="M18 26 Q32 8 46 26 L46 30 L18 30Z" fill="#b8913c" /> : null}
          <ellipse cx="32" cy="34" rx="13" ry="15" fill={face} />
          {look === "witch" ? <path d="M14 26 L50 26 L38 22 L33 4 L26 22Z" fill="#1e1a2b" stroke={c} strokeWidth="1" /> : null}
          {look === "imp" || look === "succubus" ? <path d="M21 22 Q17 12 22 8 Q23 16 26 20Z M43 22 Q47 12 42 8 Q41 16 38 20Z" fill={look === "imp" ? "#b0352f" : "#2a1a2e"} /> : null}
          {look === "schoolgirl" ? <path d="M22 20 l-5 -4 l2 7Z M42 20 l5 -4 l-2 7Z" fill={c} /> : null}
          {look === "succubus" ? <path d="M44 52 Q56 50 54 40 l3 -2 l-1 5" fill="none" stroke="#2a1a2e" strokeWidth="2" /> : null}
          <ellipse cx="27" cy="33" rx="2.2" ry={look === "shadow" ? 1.4 : 2.4} fill={look === "shadow" ? glow : d} />
          <ellipse cx="37" cy="33" rx="2.2" ry={look === "shadow" ? 1.4 : 2.4} fill={look === "shadow" ? glow : d} />
          {look === "businesswoman" ? <><circle cx="27" cy="33" r="4" fill="none" stroke="#222" strokeWidth="1" /><circle cx="37" cy="33" r="4" fill="none" stroke="#222" strokeWidth="1" /><path d="M31 33 h2" stroke="#222" /></> : null}
          {look !== "shadow" ? <path d="M28 41 Q32 44 36 41" fill="none" stroke={look === "succubus" ? "#8c1f3a" : d} strokeWidth="1.4" strokeLinecap="round" /> : null}
        </>
      )}
    </svg>
  );
}

function Setup() {
  const { mutate } = useGame();
  const [name, setName] = useState("Aria");
  const [look, setLook] = useState<PALook>("classic");
  const [manner, setManner] = useState<PAManner>("loyal");
  const [hue, setHue] = useState(210);
  return (
    <Card className="mb-6">
      <div className="flex gap-3 items-center mb-3">
        <PAAvatar look={look} hue={hue} />
        <div>
          <div className="text-[14px]">Your personal assistant</div>
          <div className="text-[12px] dim">The arcology's AI. She reads everything that happens and answers your questions.</div>
        </div>
      </div>
      <label className="text-[11px] uppercase tracking-wider dim">Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className="mb-3" />
      <div className="text-[11px] uppercase tracking-wider dim mb-1">How she appears</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {(Object.keys(PA_LOOKS) as PALook[]).map((k) => <button key={k} title={PA_LOOKS[k].note} onClick={() => setLook(k)} className={cx("chip !text-[12px]", look === k && "on")}>{PA_LOOKS[k].name}</button>)}
      </div>
      <div className="text-[11px] uppercase tracking-wider dim mb-1">How she talks</div>
      <div className="flex flex-wrap gap-1.5 mb-1">
        {(Object.keys(PA_MANNERS) as PAManner[]).map((k) => <button key={k} onClick={() => setManner(k)} className={cx("chip !text-[12px]", manner === k && "on")}>{PA_MANNERS[k].name}</button>)}
      </div>
      <div className="text-[11.5px] dim mb-3">{PA_MANNERS[manner].note}</div>
      <div className="text-[11px] uppercase tracking-wider dim mb-1">Colour</div>
      <input type="range" min={0} max={359} value={hue} onChange={(e) => setHue(Number(e.target.value))} className="w-full mb-3" />
      <Button kind="primary" onClick={() => mutate((s) => { makeAssistant(s, { name, look, manner, hue }); })}>Switch her on</Button>
    </Card>
  );
}

export default function AssistantCard() {
  const { save, mutate } = useGame();
  const a = save.assistant;
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const lastWeek = save.reports[save.reports.length - 1]?.week;

  useEffect(() => {
    if (!a || lastWeek === undefined || a.brief?.week === lastWeek) return;
    let live = true;
    void briefWeek(save).then(() => { if (live) mutate(() => {}); });
    return () => { live = false; };
  }, [a?.name, lastWeek]);

  if (!a) return <Setup />;
  const ask = async (text: string, topic?: string) => {
    if (busy || !text.trim()) return;
    setBusy(true); setOpen(true);
    await askAssistant(save, text.trim(), topic);
    mutate(() => {});
    setBusy(false); setQ("");
  };
  const log = a.log.slice(-6);

  return (
    <Card className="mb-6">
      <div className="flex gap-3 items-start">
        <PAAvatar look={a.look} hue={a.hue} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[14px]">{a.name}</span>
            <span className="text-[11px] dim">{PA_LOOKS[a.look].name.toLowerCase()} · {PA_MANNERS[a.manner].name.toLowerCase()}</span>
            <button className="ml-auto text-[11px] dim underline" onClick={() => mutate((s) => { s.assistant = undefined; })}>change her</button>
          </div>
          <p className="font-prose text-[14.5px] leading-relaxed mt-1">
            {a.brief && a.brief.week === lastWeek ? a.brief.text : lastWeek === undefined ? `${a.name} is watching. She'll brief you when the first week is done.` : <span className="dim"><Loader2 size={12} className="inline animate-spin" /> …</span>}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {PA_QUESTIONS.map((x) => <button key={x.id} disabled={busy} className="chip !text-[12px]" onClick={() => void ask(x.label, x.id)}>{x.label}</button>)}
      </div>
      <form className="flex gap-2 mt-2" onSubmit={(e) => { e.preventDefault(); void ask(q); }}>
        <input className="flex-1 min-w-0" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Ask ${a.name} anything`} disabled={busy} />
        <Button size="sm" kind="primary" disabled={busy || !q.trim()} onClick={() => void ask(q)}>{busy ? "…" : "Ask"}</Button>
      </form>
      {open && log.length ? (
        <div className="mt-3 space-y-2">
          {log.map((l, i) => l.role === "you"
            ? <div key={i} className="player-line !my-1">{l.text}</div>
            : <p key={i} className="font-prose text-[14px] leading-relaxed" style={{ color: `hsl(${a.hue} 60% 82%)` }}>{l.text}</p>)}
          <button className="text-[11px] dim underline" onClick={() => setOpen(false)}>hide</button>
        </div>
      ) : log.length ? <button className="text-[11px] dim underline mt-2" onClick={() => setOpen(true)}>show what she said</button> : null}
    </Card>
  );
}
