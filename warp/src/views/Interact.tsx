/**
 * WITH HER.
 *
 * The screen the whole game is for. Her at the top, drawn and breathing and posed by what is
 * happening; what happened directly underneath, newest at the bottom and always in view; and the
 * next thing you can do pinned to the bottom edge where a thumb already is. Nothing you tap sends
 * the answer somewhere you have to scroll to.
 */
import { isKeeper } from "../engine/romance";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Loader2, MessageCircle, RotateCcw, Square } from "lucide-react";
import { rollback, snapshot } from "../engine/state";
import { useGame } from "../lib/game";
import { cx } from "../lib/ui";
import { ACTS, ACT_BY_ID, FETISH_BY_ID } from "../data/intimacy";
import { affinity, canDo, type ActOutcome } from "../engine/intimacy";
import { runActTurn } from "../engine/turn";
import { followupsFor, runFollowup, talk, TOPICS, type Followup } from "../engine/encounter";
import { PLACE_BY_ID, PLACE_BY_NAME } from "../data/places";
import { inPlace, whereabouts } from "../engine/whereabouts";
import { registerOf, REGISTER_LABEL, say } from "../engine/voice";
import { band } from "../engine/psyche";
import { rng } from "../engine/rng";
import { arrivalLead } from "../engine/writer";
import { POSE_BY_ID, poseForAct, restingPose, type Pose } from "../lib/rig";
import { modelsAvailable } from "../config";
import { closeMoment, momentsOf, noteMoment, openMoment, playMoment, type MomentLine } from "../engine/moments";
import { concludeMoment } from "../engine/deeds";
import { DeedCard } from "./MomentCard";
import SlaveArt, { SlaveHead } from "./SlaveArt";
import { useVisibleViewport } from "../lib/viewport";
import { obeys } from "../engine/compliance";
import type { Moment } from "../lib/expression";
import { RoomBackdrop } from "../lib/rooms";

type Entry =
  | { k: "you"; text: string }
  | { k: "prose"; text: string }
  | { k: "said"; text: string }
  | { k: "tags"; tags: string[]; tone?: ActOutcome["landing"] }
  | { k: "learned"; text: string }
  | { k: "note"; text: string }
  | { k: "deed"; id: string };

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
  const { save, mutate, replace } = useGame();
  const p = save.people[id];
  // Where she is when you come looking (at work, or on her own time), and where you were. You go
  // to her and it happens there, or you send for her and she comes to you (engine/whereabouts).
  const [spot] = useState(() => (p ? whereabouts(save, p) : undefined));
  const [home] = useState(() => ({ location: save.scene.location, present: [...save.scene.present] }));
  const [summoned, setSummoned] = useState(false);
  const opening = (sent: boolean): Entry[] => {
    if (!p || !spot) return [];
    const r = rng(`open:${id}:${save.turn}`);
    return [{ k: "prose", text: arrivalLead(p, spot, sent, r) }, { k: "said", text: say(save, p, "open", r) }];
  };
  const asLines = (es: Entry[]): MomentLine[] => [{ role: "scene", text: es.map((e) => (e.k === "said" ? `"${e.text.replace(/^"|"$/g, "")}"` : "text" in e ? e.text : "")).filter(Boolean).join(" ") }];
  const [log, setLog] = useState<Entry[]>(() => opening(false));
  // When she owns you, you serve; the owner's moves are hers now, not yours.
  const hers = !!p && isKeeper(save, p);
  const groups = hers ? [...GROUPS.filter((g) => g.id === "hers"), ...GROUPS.filter((g) => ["tenderness", "feet", "play", "talk"].includes(g.id))] : GROUPS;
  const [group, setGroup] = useState<string>(hers ? "hers" : "tenderness");
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
  // The encounter as a scene the model can carry on, once there's something to carry on from.
  const [mid, setMid] = useState<string | null>(null);
  const [replies, setReplies] = useState<string[]>([]);
  const [said, setSaid] = useState("");
  const engaged = useRef(false);
  const midRef = useRef<string | null>(null);
  const history = useRef<MomentLine[]>(asLines(log));
  const sceneAt = !spot || summoned ? home.location : (PLACE_BY_ID[spot.place]?.name ?? home.location);
  // For the length of the visit the room is wherever it's happening, with just the two of you in it,
  // so what you do there is done there (in public, if that's where she works); put back on the way out.
  useEffect(() => { mutate((s) => { s.scene.location = sceneAt; s.scene.present = [id]; }); }, [sceneAt]);
  useEffect(() => () => { mutate((s) => { s.scene.location = home.location; s.scene.present = home.present; }); }, []);
  const sendFor = (sent: boolean) => {
    setSummoned(sent);
    const o = opening(sent);
    setLog(o);
    history.current = asLines(o);
  };

  const record = (lines: MomentLine[]) => {
    history.current.push(...lines);
    if (midRef.current) { const m = midRef.current; mutate((s) => noteMoment(s, m, lines)); }
  };
  const ensureMoment = (): string => {
    if (midRef.current) return midRef.current;
    let made = "";
    mutate((s) => {
      made = openMoment(s, { person: id, title: `With ${s.people[id]?.name ?? "her"}, week ${s.arcology.week}`, source: "encounter", happened: "", where: spot ? { ...spot, summoned } : undefined });
      noteMoment(s, made, history.current.slice(-12));
    });
    midRef.current = made;
    setMid(made);
    return made;
  };

  /** Your words, or the model's expansion of what just happened (reply null). */
  const stopper = useRef<AbortController | null>(null);
  /** The last model reply, for Retry: what it answered, and how long the log was before it. */
  const lastCall = useRef<{ reply: string | null; logLen: number } | null>(null);
  const [again, setAgain] = useState<string | null | undefined>(undefined);
  useEffect(() => { if (again !== undefined) { const a = again; setAgain(undefined); void carryOn(a); } }, [again]);

  async function carryOn(reply: string | null) {
    if (busy) return;
    const m = ensureMoment();
    const logLen = log.length;
    mutate((s) => { snapshot(s); });
    if (reply) { engaged.current = true; setLog((l) => [...l, { k: "you", text: reply }]); }
    setBusy(true); setStream(""); setReplies([]); setTray(false);
    const ctl = new AbortController();
    stopper.current = ctl;
    const res = await playMoment(save, m, reply, { onDelta: modelsAvailable() ? (c) => setStream((x) => x + c) : undefined, onReset: () => setStream(""), signal: ctl.signal });
    stopper.current = null;
    if (ctl.signal.aborted) {
      const back = rollback(save);
      if (back) replace(back);
      setLog((l) => [...l.slice(0, logLen), { k: "note", text: "Stopped. Nothing from that reply was kept." }]);
      setStream(""); setBusy(false);
      if (reply) setSaid(reply);
      lastCall.current = null;
      return;
    }
    lastCall.current = modelsAvailable() ? { reply, logLen } : null;
    mutate(() => {});
    setStream("");
    const entries: Entry[] = res.prose.split(/\n\n+/).filter(Boolean).map((t) => ({ k: "prose" as const, text: t }));
    if (!res.ok && res.error) entries.push({ k: "note", text: res.error });
    setLog((l) => [...l, ...entries]);
    const mo = save.moments?.find((x) => x.id === m);
    setReplies(mo?.options ?? []);
    setBusy(false);
  }

  const retry = () => {
    const c = lastCall.current;
    if (!c || busy) return;
    const back = rollback(save);
    if (!back) return;
    replace(back);
    setLog((l) => l.slice(0, c.logLen));
    setAgain(c.reply);
  };

  /** End the scene here: it's read back as a deed and starts changing things. */
  async function endHere() {
    const m = midRef.current;
    const mo = m ? momentsOf(save).find((x) => x.id === m) : undefined;
    if (!mo || busy) return;
    setBusy(true); setReplies([]);
    const d = await concludeMoment(save, mo);
    mutate(() => {});
    setBusy(false);
    setLog((l) => [...l, d ? { k: "deed", id: d.id } : { k: "note", text: "That's where it ended." }]);
    midRef.current = null; setMid(null); engaged.current = false;
    history.current = [];
    setEnded(true);
  }

  // Walking out: a scene you took part in stays open for later; one you didn't is closed.
  useEffect(() => () => {
    if (!midRef.current) return;
    const m = midRef.current;
    // A scene you took part in stays open under "Left unfinished" until you end it.
    if (!engaged.current) mutate((s) => closeMoment(s, m));
  }, []);

  // The text is the scene: her whole figure only if you ask for it, and nothing but the text and the
  // box you're typing in while the keyboard is up. The screen is sized to what the keyboard leaves.
  const vp = useVisibleViewport();
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [figure, setFigure] = useState(() => { try { return localStorage.getItem("warp-with-figure") === "1"; } catch { return false; } });
  const toggleFigure = () => setFigure((f) => { try { localStorage.setItem("warp-with-figure", f ? "0" : "1"); } catch { /* private mode */ } return !f; });

  // Keep the newest thing in view. This is the whole reason the screen exists.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [log, stream, busy, typing, vp.height]);

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
  const stand = obeys(save, p);
  const place = PLACE_BY_NAME[sceneAt] ?? PLACE_BY_ID[sceneAt] ?? PLACE_BY_ID.penthouse;
  const pub = place.privacy === "public";

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
      onReset: () => setStream(""),
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
    const refused = res.notes.find((n) => /refused/.test(n));
    if (refused) entries.push({ k: "note", text: `${refused.replace(/^the narrator did not answer \((.*)\)$/, "$1")}; this is the game's own version. Pick a different narrator model in Settings.` });
    setLog((l) => [...l, ...entries]);
    record([{ role: "you", text: act.name }, { role: "scene", text: entries.filter((e) => e.k === "prose" || e.k === "said").map((e) => ("text" in e ? e.text : "")).join("\n\n") }]);
    setReplies([]);
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
    record([{ role: "you", text: b.you }, { role: "scene", text: [b.text, b.said ? `"${b.said.replace(/^"|"$/g, "")}"` : ""].filter(Boolean).join(" ") }]);
    if (b.ends) { setEnded(true); return; }
    // Her answer doesn't stop at a line: the model writes the moment out and gives you things to say.
    if (modelsAvailable()) void carryOn(null);
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
    record([{ role: "you", text: b.you }, { role: "scene", text: b.said ? `"${b.said.replace(/^"|"$/g, "")}"` : "" }]);
    if (modelsAvailable()) void carryOn(null);
    else setReplies([`Ask ${p.name} to say more`, "Tell her that's enough", "Kiss her"]);
  }

  const knownFetish = p.persona.fetishes.filter((f) => f.known && f.name !== "none");

  return (
    <div className="fixed left-0 right-0 z-[60] flex flex-col" style={{ background: "var(--ink-0)", top: vp.top, height: vp.height }}>
      {/* header */}
      <header className="topbar flex items-center gap-2 px-2 py-2 shrink-0" style={{ paddingTop: typing ? 8 : "max(8px, env(safe-area-inset-top))" }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="back"><ChevronLeft size={18} /></button>
        <button type="button" className="shrink-0 rounded-full overflow-hidden" onClick={toggleFigure} title={figure ? "Hide her figure" : "Show her figure"} aria-label={figure ? "Hide her figure" : "Show her figure"}>
          <SlaveHead person={p} size={34} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] leading-tight truncate">{p.name}</div>
          <div className="text-[11px] dim truncate"><span className={cx(["resists", "fights"].includes(stand.stance) && "bad", stand.pushes && "warn")}>{stand.label}</span> · {REGISTER_LABEL[reg]} · {place.name}{pub ? " · in public" : ""}</div>
        </div>
        <div className="w-20 shrink-0">
          <div className="text-[10px] dim text-right mb-0.5">aroused</div>
          <div className="meter"><div style={{ width: `${p.psyche.arousal}%`, background: p.psyche.arousal > 70 ? "var(--danger)" : "var(--accent)" }} /></div>
        </div>
      </header>

      {/* her, when you want to see her */}
      {figure && !typing ? <div className="stage-room shrink-0 relative flex justify-center" style={{ height: tray ? "24dvh" : "32dvh", transition: "height .25s ease" }}>
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
      </div> : null}

      {/* what happened */}
      <div ref={logRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {log.map((e, i) => <LogEntry key={i} e={e} />)}
        {spot && !spot.withYou && !mid && !busy && log.length <= 2 ? (
          <div className="flex justify-center">
            <button className="chip !text-[12px]" onClick={() => sendFor(!summoned)}>{summoned ? `Go to her ${inPlace(spot.name)} instead` : "Send for her instead"}</button>
          </div>
        ) : null}
        {stream ? <p className="font-prose text-[15.5px] leading-relaxed mid">{stream}</p> : null}
        {busy ? <div className="flex items-center gap-2 dim text-[12px]"><Loader2 size={13} className="animate-spin" /> …</div> : null}
      </div>

      {/* what you do next */}
      <div className="shrink-0 hairline-top" style={{ background: "var(--ink-1)", paddingBottom: typing ? 6 : "env(safe-area-inset-bottom)" }}>
        {ended ? (
          <div className="p-3 flex gap-2">
            <button className="btn btn-primary flex-1" onClick={onClose}>Leave her be</button>
            <button className="btn" onClick={() => setEnded(false)}>Call her back</button>
          </div>
        ) : null}
        {!ended && replies.length && !busy && !typing ? (
          <div className="flex flex-col gap-1.5 px-3 pt-3">
            {replies.map((r) => <button key={r} className="choice !py-2" onClick={() => void carryOn(r)}><span className="block text-[13.5px] leading-snug">{r}</span></button>)}
          </div>
        ) : null}
        {!ended ? (
          <form className={cx("flex gap-2 px-3", typing ? "pt-1.5" : "pt-3")} onSubmit={(e) => {
            e.preventDefault();
            const t = said.trim();
            // Sent: the keyboard goes, so her answer has the screen. (A disabled input doesn't always say it lost focus.)
            if (t) { setSaid(""); inputRef.current?.blur(); setTyping(false); void carryOn(t); }
          }}>
            <input ref={inputRef} className="flex-1 min-w-0" value={said} disabled={busy} onChange={(e) => setSaid(e.target.value)} onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} placeholder={`Say or do something to ${p.name}`} />
            {busy && stopper.current
              ? <button type="button" className="btn btn-sm btn-danger" onClick={() => stopper.current?.abort()} title="Stop the model; this reply is thrown away"><Square size={12} /> stop</button>
              : <button className="btn btn-sm btn-primary" disabled={busy || !said.trim()} onMouseDown={(e) => e.preventDefault()}>Go</button>}
            {!busy && lastCall.current ? <button type="button" className="btn btn-sm" onClick={retry} title="Throw away that response and ask the model again"><RotateCcw size={12} /> retry</button> : null}
            {mid && engaged.current ? <button type="button" className="btn btn-sm" disabled={busy} onClick={() => void endHere()} title="End the scene; what you did in it starts to count">Done</button> : null}
          </form>
        ) : null}
        {!ended && next.length && !typing ? (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {next.map((f) => (
              <button key={f.id} disabled={busy} onClick={() => doFollow(f)}
                className={cx("btn btn-sm", f.tone === "kind" && "btn-primary", f.tone === "cruel" && "btn-danger")}>{f.label}</button>
            ))}
          </div>
        ) : null}
        {ended || typing ? null : <>
        <div className="flex gap-1.5 px-3 pt-3 pb-2 overflow-x-auto no-scrollbar">
          {groups.map((g) => (
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
    case "deed": return <DeedCard id={e.id} />;
    case "tags": return (
      <div className="flex flex-wrap gap-1.5 fade-in">
        {e.tags.map((t) => <span key={t} className={cx("chip", t === "she came" || t === "found out" ? "good" : t === "changed" ? "bad" : "")}>{t}</span>)}
      </div>
    );
  }
}
