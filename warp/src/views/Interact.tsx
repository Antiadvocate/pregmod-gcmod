/**
 * WITH HER.
 *
 * The screen the whole game is for. Her at the top, drawn and breathing and posed by what is
 * happening; what happened directly underneath, newest at the bottom and always in view; and the
 * next thing you can do pinned to the bottom edge where a thumb already is. Nothing you tap sends
 * the answer somewhere you have to scroll to.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Loader2, MessageCircle } from "lucide-react";
import { useGame } from "../lib/game";
import { cx } from "../lib/ui";
import { ACTS, ACT_BY_ID, FETISH_BY_ID } from "../data/intimacy";
import { affinity, canDo, type ActOutcome } from "../engine/intimacy";
import { runActTurn } from "../engine/turn";
import { followupsFor, runFollowup, talk, TOPICS, type Followup } from "../engine/encounter";
import { isPublic, placeOf } from "../engine/places";
import { registerOf, REGISTER_LABEL, say } from "../engine/voice";
import { band } from "../engine/psyche";
import { rng } from "../engine/rng";
import { writeLead } from "../engine/writer";
import { POSE_BY_ID, poseForAct, restingPose, type Pose } from "../lib/rig";
import { modelsAvailable } from "../config";
import SlaveArt from "./SlaveArt";
import type { Moment } from "../lib/expression";
import { RoomBackdrop } from "../lib/rooms";

type Entry =
  | { k: "you"; text: string }
  | { k: "prose"; text: string }
  | { k: "said"; text: string }
  | { k: "tags"; tags: string[]; tone?: ActOutcome["landing"] }
  | { k: "learned"; text: string }
  | { k: "note"; text: string };

const GROUPS: { id: string; label: string }[] = [
  { id: "tenderness", label: "Tender" },
  { id: "use", label: "Use her" },
  { id: "hers", label: "Serve her" },
  { id: "play", label: "Play" },
  { id: "service", label: "Put her to work" },
  { id: "feet", label: "Feet" },
  { id: "display", label: "Show her off" },
  { id: "discipline", label: "Discipline" },
  { id: "talk", label: "Talk" },
];

/** A reaction the figure plays once, by how it landed. */
function reactionFor(o: ActOutcome): string {
  if (o.finished) return "rx-shudder";
  if (o.landing === "hated") return "rx-flinch";
  if (o.landing === "wanted") return "rx-glow";
  if (ACT_BY_ID[o.act]?.group === "tenderness") return "rx-glow";
  return "rx-breathe";
}

function poseAfter(o: ActOutcome, fallback: Pose): Pose {
  if (o.finished) return POSE_BY_ID.spent;
  if (o.landing === "hated") return POSE_BY_ID.curled;
  if (o.landing === "endured") return POSE_BY_ID.braced;
  if (o.landing === "wanted") return POSE_BY_ID.easy;
  if (ACT_BY_ID[o.act]?.group === "tenderness") return POSE_BY_ID.reaching;
  return fallback;
}

export default function Interact({ id, onClose }: { id: string; onClose: () => void }) {
  const { save, mutate } = useGame();
  const p = save.people[id];
  const [log, setLog] = useState<Entry[]>(() => {
    if (!p) return [];
    const r = rng(`open:${id}:${save.turn}`);
    return [{ k: "prose", text: writeLead(save, p, r) }, { k: "said", text: say(save, p, "open", r) }];
  });
  const [group, setGroup] = useState<string>("tenderness");
  const [busy, setBusy] = useState(false);
  const [stream, setStream] = useState("");
  const [next, setNext] = useState<Followup[]>([]);
  const [lastAct, setLastAct] = useState<string | null>(null);
  const [pose, setPose] = useState<Pose | undefined>(undefined);
  const [rx, setRx] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);
  const [ended, setEnded] = useState(false);
  const [tray, setTray] = useState(true);
  const [moment, setMoment] = useState<Moment | undefined>(undefined);
  const logRef = useRef<HTMLDivElement>(null);

  // Keep the newest thing in view. This is the whole reason the screen exists.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [log, stream, busy]);

  // Lock the page behind the overlay so a phone does not scroll two things at once.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const acts = useMemo(() => {
    if (!p) return [];
    return ACTS.filter((a) => a.group === group).map((a) => ({ a, blocked: canDo(p, a, save), aff: affinity(p, a).score }));
  }, [p, group, save.turn]);

  if (!p) return null;
  const reg = registerOf(p);
  const place = placeOf(save);
  const pub = isPublic(save);

  function play(r: string) {
    setRx("");
    requestAnimationFrame(() => setRx(r));
  }

  async function doAct(actId: string) {
    if (busy) return;
    const act = ACT_BY_ID[actId];
    setBusy(true);
    setTray(false);
    setNext([]);
    setStream("");
    setLog((l) => [...l, { k: "you", text: act.name }]);
    setPose(poseForAct(p, act.tags));
    // While it is happening, her body keeps time with it.
    if (["use", "service", "hers", "play", "feet"].includes(act.group)) play("rx-rhythm");
    const res = await runActTurn(save, id, actId, {
      public: pub,
      lead: false,
      onDelta: modelsAvailable() ? (c) => setStream((x) => x + c) : undefined,
    });
    mutate(() => {});
    setStream("");
    if ("error" in res.outcome) {
      setLog((l) => [...l, { k: "note", text: res.outcome && "error" in res.outcome ? res.outcome.error : "" }]);
      setBusy(false);
      return;
    }
    const o = res.outcome;
    const entries: Entry[] = [];
    // A model's prose replaces the written scene; the written line she says stays either way.
    if (modelsAvailable() && res.prose && res.prose !== res.written?.paragraphs.join("\n\n")) {
      for (const para of res.prose.split(/\n\n+/)) entries.push({ k: "prose", text: para });
    } else if (res.written) {
      for (const para of res.written.paragraphs) entries.push({ k: "prose", text: para });
      if (res.written.said) entries.push({ k: "said", text: res.written.said });
    }
    if (res.written?.tags.length) entries.push({ k: "tags", tags: res.written.tags, tone: o.landing });
    setLog((l) => [...l, ...entries]);
    setPose(poseAfter(o, restingPose(p)));
    setMoment({ landing: o.landing, finished: o.finished, act: o.act });
    play(reactionFor(o));
    setLastAct(actId);
    setNext(followupsFor(o));
    setBusy(false);
  }

  function doFollow(f: Followup) {
    if (f.id === "again" && lastAct) { void doAct(lastAct); return; }
    let beat: ReturnType<typeof runFollowup> | null = null;
    mutate((s) => { beat = runFollowup(s, id, f.id); });
    const b = beat as ReturnType<typeof runFollowup> | null;
    if (!b) return;
    const entries: Entry[] = [{ k: "you", text: b.you }];
    if (b.text) entries.push({ k: "prose", text: b.text });
    if (b.said) entries.push({ k: "said", text: b.said });
    if (b.learned) entries.push({ k: "learned", text: b.learned });
    setLog((l) => [...l, ...entries]);
    if (f.id === "hold" || f.id === "comfort") { setPose(POSE_BY_ID.easy); play("rx-glow"); setMoment((m) => (m ? { ...m, landing: m.landing === "hated" ? "endured" : m.landing } : m)); }
    if (f.id === "mock" || f.id === "thank") { setPose(POSE_BY_ID.braced); play("rx-flinch"); }
    setNext((n) => n.filter((x) => x.id !== f.id && x.id !== "again"));
    if (b.ends) setEnded(true);
  }

  function doTalk(topic: string) {
    let beat: ReturnType<typeof talk> | null = null;
    mutate((s) => { beat = talk(s, id, topic); });
    const b = beat as ReturnType<typeof talk> | null;
    if (!b) return;
    const entries: Entry[] = [{ k: "you", text: b.you }];
    if (b.said) entries.push({ k: "said", text: b.said });
    if (b.learned) entries.push({ k: "learned", text: b.learned });
    setLog((l) => [...l, ...entries]);
    setNext([]);
  }

  const knownFetish = p.persona.fetishes.filter((f) => f.known && f.name !== "none");

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: "var(--ink-0)" }}>
      {/* header */}
      <header className="topbar flex items-center gap-2 px-2 py-2 shrink-0" style={{ paddingTop: "max(8px, env(safe-area-inset-top))" }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="back"><ChevronLeft size={18} /></button>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] leading-tight truncate">{p.name}</div>
          <div className="text-[11px] dim truncate">{REGISTER_LABEL[reg]} · {band(p.psyche)} · {place.name}{pub ? " · in public" : ""}</div>
        </div>
        <div className="w-20 shrink-0">
          <div className="text-[10px] dim text-right mb-0.5">aroused</div>
          <div className="meter"><div style={{ width: `${p.psyche.arousal}%`, background: p.psyche.arousal > 70 ? "var(--danger)" : "var(--accent)" }} /></div>
        </div>
      </header>

      {/* her */}
      <div className="stage-room shrink-0 relative flex justify-center" style={{ height: tray ? "28dvh" : "36dvh", transition: "height .25s ease" }}>
        <RoomBackdrop place={place.id} />
        <div className={cx("h-full relative", rx)} onAnimationEnd={() => setRx("")}>
          <SlaveArt person={p} height="100%" pose={pose} moment={moment} />
        </div>
        {knownFetish.length || p.persona.flaw?.known ? (
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 justify-center pointer-events-none">
            {knownFetish.map((f) => <span key={f.name} className="chip good">{FETISH_BY_ID[f.name]?.name}</span>)}
            {p.persona.flaw?.known ? <span className="chip bad">{p.persona.flaw.id}</span> : null}
          </div>
        ) : null}
      </div>

      {/* what happened */}
      <div ref={logRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {log.map((e, i) => <LogEntry key={i} e={e} />)}
        {stream ? <p className="font-prose text-[15.5px] leading-relaxed mid">{stream}</p> : null}
        {busy ? <div className="flex items-center gap-2 dim text-[12px]"><Loader2 size={13} className="animate-spin" /> …</div> : null}
      </div>

      {/* what you do next */}
      <div className="shrink-0 hairline-top" style={{ background: "var(--ink-1)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        {ended ? (
          <div className="p-3 flex gap-2">
            <button className="btn btn-primary flex-1" onClick={onClose}>Leave her be</button>
            <button className="btn" onClick={() => setEnded(false)}>Call her back</button>
          </div>
        ) : null}
        {!ended && next.length ? (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {next.map((f) => (
              <button key={f.id} disabled={busy} onClick={() => doFollow(f)}
                className={cx("btn btn-sm", f.tone === "kind" && "btn-primary", f.tone === "cruel" && "btn-danger")}>{f.label}</button>
            ))}
          </div>
        ) : null}
        {ended ? null : <>
        <div className="flex gap-1.5 px-3 pt-3 pb-2 overflow-x-auto no-scrollbar">
          {GROUPS.map((g) => (
            <button key={g.id} onClick={() => { if (group === g.id) setTray((t) => !t); else { setGroup(g.id); setTray(true); } }}
              className={cx("chip shrink-0 !text-[12px] !py-1 !px-3", group === g.id && tray && "on")}>
              {g.id === "talk" ? <MessageCircle size={12} /> : null}{g.label}
            </button>
          ))}
        </div>
        {tray ? <div className="px-3 pb-3 overflow-y-auto" style={{ maxHeight: "30dvh" }}>
          {group === "talk" ? (
            <div className="grid grid-cols-1 gap-1.5">
              {TOPICS.map((t) => (
                <button key={t.id} disabled={busy} onClick={() => doTalk(t.id)} className="actbtn">{t.label}</button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {acts.filter((x) => showBlocked || !x.blocked).map(({ a, blocked, aff }) => {
                const count = p.acts?.[a.id] ?? 0;
                const known = count > 0 || p.persona.fetishes.some((f) => f.known && FETISH_BY_ID[f.name]?.acts.some((t) => a.tags.includes(t))) || !!p.persona.flaw?.known;
                const hint = blocked ? blocked : known && aff > 0.35 ? "she's into this" : known && aff < -0.35 ? "she hates this" : count ? `×${count}` : "";
                return (
                  <button key={a.id} disabled={!!blocked || busy} onClick={() => doAct(a.id)} className={cx("actbtn", blocked && "opacity-40")}>
                    <span className="block text-[13px] leading-tight">{a.name}</span>
                    {hint ? <span className={cx("block text-[10.5px] mt-0.5", !blocked && aff > 0.35 && known ? "good" : !blocked && aff < -0.35 && known ? "bad" : "dim")}>{hint}</span> : null}
                  </button>
                );
              })}
              {acts.some((x) => x.blocked) ? (
                <button className="actbtn dim text-[11.5px]" onClick={() => setShowBlocked((v) => !v)}>
                  {showBlocked ? "hide what's not possible" : `${acts.filter((x) => x.blocked).length} not possible right now`}
                </button>
              ) : null}
            </div>
          )}
        </div> : null}
        </>}
      </div>
    </div>
  );
}

function LogEntry({ e }: { e: Entry }) {
  switch (e.k) {
    case "you": return <div className="player-line !my-1 fade-in">{e.text}</div>;
    case "prose": return <p className="font-prose text-[15.5px] leading-relaxed fade-in" style={{ color: "#e6dfd1" }}>{e.text}</p>;
    case "said": return <p className="said-line fade-in">&ldquo;{e.text.replace(/^"|"$/g, "")}&rdquo;</p>;
    case "learned": return <div className="text-[12px] good fade-in">You learned: {e.text}</div>;
    case "note": return <div className="text-[12px] bad fade-in">{e.text}</div>;
    case "tags": return (
      <div className="flex flex-wrap gap-1.5 fade-in">
        {e.tags.map((t) => <span key={t} className={cx("chip", t === "she came" || t === "found out" ? "good" : t === "changed" ? "bad" : "")}>{t}</span>)}
      </div>
    );
  }
}
