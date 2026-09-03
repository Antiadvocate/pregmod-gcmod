/**
 * THE THING YOU ACTUALLY DO.
 *
 * Every act in the game, grouped, with three things visible before you commit: whether her body
 * can take it, what it is going to do to her, and — once you have found it out — whether it is the
 * thing she is into or the thing she cannot stand. The engine already knows all three; hiding them
 * behind a menu of verbs would be a worse game, not a more mysterious one.
 *
 * Affinity is only shown for what you have DISCOVERED. An undiscovered fetish is a dimmed row and
 * a surprise, which is the correct order of events.
 */
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Section, cx } from "../lib/ui";
import { ACTS, ACT_BY_ID, FETISH_BY_ID, fetishBand } from "../data/intimacy";
import { affinity, canDo } from "../engine/intimacy";
import { runActTurn } from "../engine/turn";
import { getLocalImage, modelsAvailable } from "../config";
import type { ActOutcome } from "../engine/intimacy";

/** The one word the panel colours by, said in English rather than in the engine's enum. */
const LANDING: Record<string, string> = {
  wanted: "she wanted it",
  willing: "she was willing",
  endured: "she endured it",
  hated: "she hated it",
  nothing: "it did nothing for her",
};

const GROUPS: { id: string; label: string }[] = [
  { id: "use", label: "Use her" },
  { id: "service", label: "Put her to work" },
  { id: "play", label: "Play" },
  { id: "tenderness", label: "Be good to her" },
  { id: "display", label: "Show her off" },
  { id: "discipline", label: "Discipline" },
];

export default function Acts({ id }: { id: string }) {
  const { save, mutate } = useGame();
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [last, setLast] = useState<{ outcome: ActOutcome; prose: string; image?: string; notes: string[] } | null>(null);
  const p = save.people[id];
  if (!p) return null;

  const knownFetish = p.persona.fetishes.filter((f) => f.known && f.name !== "none");
  const hasImages = !!getLocalImage();

  async function doAct(actId: string) {
    setBusy(actId);
    setProgress("");
    setLast(null);
    let image: string | undefined;
    const res = await runActTurn(save, id, actId, {
      onProgress: (n) => setProgress(n),
      onImage: (url) => { image = url; },
    });
    mutate(() => {});
    if (!("error" in res.outcome)) {
      setLast({ outcome: res.outcome, prose: res.prose, image: image ?? save.history.at(-1)?.image, notes: res.notes });
    } else {
      setLast(null);
      setProgress(res.outcome.error);
    }
    setBusy(null);
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="dim">arousal</span>
          <div className="meter w-24"><div style={{ width: `${p.psyche.arousal}%`, background: p.psyche.arousal > 70 ? "var(--danger)" : "var(--accent)" }} /></div>
          <span className="font-mono">{Math.round(p.psyche.arousal)}</span>
          <span className="dim ml-2">{p.psyche.arousal > 80 ? "she is wound up and it is obvious" : p.psyche.arousal > 40 ? "warming" : "nothing doing on its own"}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {knownFetish.map((f) => (
            <Chip key={f.name} tone="good" title={FETISH_BY_ID[f.name]?.note}>{fetishBand(f.strength)} {f.name}</Chip>
          ))}
          {p.persona.paraphilia ? <Chip tone="bad" title="past a preference — she needs it now">{p.persona.paraphilia}</Chip> : null}
          {p.persona.quirk?.known ? <Chip>{p.persona.quirk.id}</Chip> : null}
          {p.persona.flaw?.known ? <Chip tone="bad" title={`worn ${p.persona.flaw.worn ?? 0}/120`}>{p.persona.flaw.id}</Chip> : null}
          {!knownFetish.length && !p.persona.quirk?.known && !p.persona.flaw?.known ? (
            <span className="text-[11.5px] dim">You do not know what she is into yet. You find that out by doing things and watching.</span>
          ) : null}
        </div>
      </Card>

      {last ? (
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Chip tone={last.outcome.landing === "hated" ? "bad" : last.outcome.landing === "wanted" ? "good" : undefined}>
              {LANDING[last.outcome.landing]}
            </Chip>
            {last.outcome.first ? <Chip>first time</Chip> : null}
            {last.outcome.finished ? <Chip tone="good">she got there</Chip> : null}
            {last.outcome.discovered ? <Chip tone="good">{last.outcome.discovered}</Chip> : null}
            {last.outcome.converted ? <Chip tone="bad">{last.outcome.converted}</Chip> : null}
          </div>
          {last.image ? <img src={last.image} alt="" className="w-full rounded-lg mb-3" /> : null}
          {modelsAvailable() ? (
            <div className="prose-stream text-[15px]">
              {last.prose.split(/\n\n+/).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          ) : (
            <div className="stage">{last.prose}</div>
          )}
          <div className="text-[11px] dim font-mono mt-2">
            arousal {last.outcome.arousal >= 0 ? "+" : ""}{last.outcome.arousal} · relaxation {last.outcome.relaxation >= 0 ? "+" : ""}{last.outcome.relaxation.toFixed(2)} · bond {last.outcome.bond >= 0 ? "+" : ""}{last.outcome.bond} · resentment +{last.outcome.resentment}
            {Object.entries(last.outcome.trained).map(([k, v]) => ` · ${k} +${v}`)}
          </div>
          {last.notes.map((n, i) => <div key={i} className="text-[11px] dim mt-1">· {n}</div>)}
        </Card>
      ) : progress && !busy ? (
        <Card className="text-[12.5px] bad">{progress}</Card>
      ) : null}

      {GROUPS.map((g) => {
        const acts = ACTS.filter((a) => a.group === g.id);
        if (!acts.length) return null;
        return (
          <Section key={g.id} title={g.label}>
            <div className="grid gap-2 sm:grid-cols-2">
              {acts.map((a) => {
                const blocked = canDo(p, a);
                const aff = affinity(p, a).score;
                // Only show the read on things you have actually found out about her.
                const known = (p.persona.flaw?.known && a.tags.some((t) => p.persona.flaw && FETISH_BY_ID[t] === undefined)) ||
                  p.persona.fetishes.some((f) => f.known && FETISH_BY_ID[f.name]?.acts.some((x) => a.tags.includes(x) || x === a.id)) ||
                  (p.persona.quirk?.known ?? false) || (p.persona.flaw?.known ?? false) || (p.acts?.[a.id] ?? 0) > 0;
                return (
                  <div key={a.id} className={cx("card-2 p-3 flex items-center gap-3", blocked && "opacity-40")}>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px]">{a.name}</div>
                      <div className="text-[11px] dim truncate">{blocked ?? a.what}</div>
                      {known && !blocked && Math.abs(aff) > 0.35 ? (
                        <div className={cx("text-[11px] mt-0.5", aff > 0 ? "good" : "bad")}>
                          {aff > 0 ? "she is into this" : "she cannot stand this"}
                        </div>
                      ) : null}
                      {(p.acts?.[a.id] ?? 0) > 0 ? <div className="text-[10.5px] dim font-mono mt-0.5">×{p.acts?.[a.id]}</div> : null}
                    </div>
                    <Button size="sm" disabled={!!blocked || !!busy} onClick={() => doAct(a.id)}>
                      {busy === a.id ? <Loader2 size={13} className="animate-spin" /> : "do it"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Section>
        );
      })}

      {busy ? (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 card px-4 py-2 text-[12px] flex items-center gap-2 z-50">
          <Loader2 size={13} className="animate-spin" />
          {progress || (hasImages ? "writing, then painting" : "writing")}
        </div>
      ) : null}
    </div>
  );
}
