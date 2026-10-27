/** MARRY HER, ON YOUR TERMS. You write how it goes; the narrator writes the wedding and says what
 *  you built; you read it before it's true, and can write it again. See engine/marriage. */
import { useRef, useState } from "react";
import { Gem, Loader2 } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Sheet } from "../lib/ui";
import { canMarry, divorce, marriageOf, marry, readTerms, writeWedding, type Written } from "../engine/marriage";
import { modelsAvailable } from "../config";

const IDEAS = [
  "On the concourse at sunset, in front of everyone. She keeps her collar, gold now, and kneels for the vows. Afterwards she still calls me Master, but she sleeps in my bed and runs the household staff.",
  "Private, just the two of us and a registrar, in my rooms. I free her first so she marries me as a free woman, and between us we're equals.",
  "A ceremony she designs. I kneel to her in front of the household and she puts a ring on me. In our house she leads; in public I'm still the owner.",
];

const STATUS: Record<Written["status"], string> = { "slave wife": "keeps her collar", wife: "off the slave registry", "free wife": "freed" };
const LEADS: Record<Written["power"], string> = { you: "you lead", equal: "equals", her: "she leads" };

export default function MarriageCard({ id }: { id: string }) {
  const { save, mutate } = useGame();
  const [open, setOpen] = useState(false);
  const [terms, setTerms] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Written | null>(null);
  const [sure, setSure] = useState(false);
  const [showScene, setShowScene] = useState(false);
  const stop = useRef<AbortController | null>(null);
  const p = save.people[id];
  if (!p) return null;
  const m = marriageOf(save);
  const mine = m?.person === id;
  const why = canMarry(save, p);

  if (mine && m) {
    return (
      <Card className="marriage-card">
        <div className="flex items-center gap-2 mb-1.5"><Gem size={14} className="acc" /><span className="text-[14px] font-display">{m.title}</span><span className="text-[11px] dim ml-auto">week {m.week}</span></div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Chip on>{m.status}</Chip><Chip on>{LEADS[m.power]}</Chip><Chip>{m.public ? "public" : "private"}</Chip>
        </div>
        <p className="text-[12.5px] mid mb-2">{m.seen}</p>
        {m.vows.length ? <ul className="text-[12.5px] space-y-1 mb-2">{m.vows.map((v, i) => <li key={i} className="font-prose italic">&ldquo;{v}&rdquo;</li>)}</ul> : null}
        <div className="text-[11px] dim mb-2">Your terms: {m.terms}</div>
        <div className="flex gap-2 flex-wrap">
          {m.scene ? <Button size="sm" kind="ghost" onClick={() => setShowScene((v) => !v)}>{showScene ? "hide the wedding" : "read the wedding again"}</Button> : null}
          {sure
            ? <><Button size="sm" kind="danger" onClick={() => { mutate((s) => { for (const l of divorce(s, "the owner ended it")) s.notifications.push({ id: `n-div-${s.arcology.week}`, week: s.arcology.week, text: l.text, kind: "danger", person: id, seen: false }); }); setSure(false); }}>yes, end it</Button><Button size="sm" kind="ghost" onClick={() => setSure(false)}>no</Button></>
            : <Button size="sm" kind="ghost" onClick={() => setSure(true)}>end the marriage</Button>}
        </div>
        {showScene ? <div className="prose-stream !text-[15px] mt-3 fade-in">{m.scene.split(/\n\s*\n/).map((t, i) => <p key={i}>{t}</p>)}</div> : null}
      </Card>
    );
  }
  if (why) return null;

  async function write() {
    setBusy(true);
    stop.current = new AbortController();
    const w = await writeWedding(save, id, terms, stop.current.signal);
    stop.current = null;
    setDraft(w);
    setBusy(false);
  }

  const guess = terms.trim() ? readTerms(terms) : null;

  return (
    <>
      <Button size="sm" kind="primary" onClick={() => setOpen(true)}><Gem size={13} /> Marry her, on your terms</Button>
      <Sheet open={open} onClose={() => { stop.current?.abort(); setOpen(false); }} title={`Marrying ${p.name}`} wide>
        {!draft ? (
          <>
            <p className="text-[12.5px] dim mb-2">No ladder, no gates. Say how the marriage goes: where, who's watching, what she wears, what's said and done, what she is to you afterwards, and who leads. {modelsAvailable() ? "The narrator writes the wedding from your words, and you read it before it's true." : "Without a model the game reads your words for what matters: public or private, whether she stays a slave, and who leads."}</p>
            <textarea rows={6} value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="How the marriage plays out…" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {IDEAS.map((t, i) => <button key={i} className="chip !text-[11.5px]" onClick={() => setTerms(t)}>idea {i + 1}</button>)}
            </div>
            {guess ? <div className="text-[11.5px] dim mt-2">Reads as: {guess.public ? "public" : "private"} · she {STATUS[guess.status]} · {LEADS[guess.power]}</div> : null}
            <div className="flex gap-2 mt-3">
              <Button kind="primary" disabled={busy || terms.trim().length < 12} onClick={() => void write()}>{busy ? <><Loader2 size={13} className="animate-spin" /> writing the wedding…</> : "Write the wedding"}</Button>
              {busy ? <Button kind="ghost" onClick={() => stop.current?.abort()}>stop</Button> : null}
            </div>
          </>
        ) : (
          <>
            <div className="font-display text-[17px] mb-2">{draft.title}</div>
            <div className="prose-stream !text-[15.5px] mb-3">{draft.scene.split(/\n\s*\n/).map((t, i) => <p key={i}>{t}</p>)}</div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Chip on>{draft.status}</Chip><Chip on>{LEADS[draft.power]}</Chip><Chip>{draft.public ? "public" : "private"}</Chip>
              {draft.rep ? <Chip tone={draft.rep > 0 ? "good" : "bad"}>{draft.rep > 0 ? "+" : "−"}{Math.abs(draft.rep)} rep</Chip> : null}
            </div>
            <p className="text-[12.5px] mid mb-2">{draft.seen}</p>
            {draft.hooks.length ? <div className="text-[12px] dim mb-3">What it leaves open: {draft.hooks.join(" ")}</div> : null}
            <div className="flex gap-2 flex-wrap">
              <Button kind="primary" onClick={() => { mutate((s) => { const r = marry(s, id, terms, draft); for (const l of r.lines) s.notifications.push({ id: `n-wed-${s.arcology.week}-${Math.random().toString(36).slice(2, 6)}`, week: s.arcology.week, text: l.text, kind: l.tone === "good" ? "good" : l.tone === "warning" ? "warning" : "info", person: l.person, seen: false }); }); setOpen(false); setDraft(null); }}>Marry her</Button>
              <Button kind="ghost" onClick={() => void write()} disabled={busy}>{busy ? <Loader2 size={13} className="animate-spin" /> : "write it again"}</Button>
              <Button kind="ghost" onClick={() => setDraft(null)}>change the terms</Button>
            </div>
          </>
        )}
      </Sheet>
    </>
  );
}
