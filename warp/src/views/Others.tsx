/**
 * OTHERS — everyone in the story who isn't yours.
 *
 * The citizen one of your women married, the dock boss in her city, the journalist who keeps
 * coming back, the owner next door. Each has a record: what they do, who they are to your people,
 * what they think of you, what they like, and what they remember. Every scene they turn up in is
 * told all of it. Here you can read it, change it, meet them, or have them dealt with.
 */
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Pin, PinOff } from "lucide-react";
import { useGame } from "../lib/game";
import { useHand } from "../lib/hand";
import { Button, Chip, cx } from "../lib/ui";
import type { Person, SaveState } from "../engine/types";
import { facesOf, findFace, keyOf, knownFaces, personOf, syncStoryCast, type Face } from "../engine/faces";
import { known, note, tie } from "../engine/others";
import { BUY_OFF, FATE_WORDS, orderDealt, type Fate } from "../engine/fates";
import { openMoment } from "../engine/moments";
import { SlaveHead } from "./SlaveArt";
import MomentCard from "./MomentCard";

const towardWord = (n?: number) => n === undefined ? "" : n >= 50 ? "fond of you" : n >= 15 ? "likes you" : n > -15 ? "careful with you" : n > -50 ? "dislikes you" : "hates you";

/** Their record, filed if it was only the story's until now, so it can be changed. */
function filed(s: SaveState, name: string): Face | undefined {
  syncStoryCast(s);
  return findFace(s, name) ?? facesOf(s)[keyOf(name)];
}

export default function Others() {
  const { save } = useGame();
  const [show, setShow] = useState<"around" | "gone">("around");
  const [find, setFind] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const all = useMemo(() => knownFaces(save).filter((f) => known(f) || f.seen >= 2), [save, save.arcology.week, save.faces && Object.keys(save.faces).length]);
  const list = all
    .filter((f) => (show === "gone" ? f.fate && f.fate.fate !== "bought" : !f.fate || f.fate.fate === "bought"))
    .filter((f) => !find.trim() || `${f.name} ${f.what ?? ""} ${f.role ?? ""}`.toLowerCase().includes(find.trim().toLowerCase()))
    .sort((a, b) => Number(!!b.kept) - Number(!!a.kept) || b.last - a.last);
  return (
    <div className="pb-24">
      <p className="text-[12.5px] dim mb-3">People who aren't yours but keep turning up. What's on their record goes into every scene they're in.</p>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Chip on={show === "around"} onClick={() => setShow("around")}>around ({all.filter((f) => !f.fate || f.fate.fate === "bought").length})</Chip>
        <Chip on={show === "gone"} onClick={() => setShow("gone")}>dealt with ({all.filter((f) => f.fate && f.fate.fate !== "bought").length})</Chip>
        <input className="flex-1 min-w-[160px]" placeholder="find someone" value={find} onChange={(e) => setFind(e.target.value)} />
      </div>
      {!list.length ? <div className="text-[13px] dim">{show === "gone" ? "Nobody yet." : "Nobody has turned up often enough to keep a record of yet."}</div> : null}
      <div className="space-y-2.5">
        {list.map((f) => <OtherCard key={f.name} f={f} open={open === f.name} onToggle={() => setOpen(open === f.name ? null : f.name)} />)}
      </div>
    </div>
  );
}

function OtherCard({ f, open, onToggle }: { f: Face; open: boolean; onToggle: () => void }) {
  const { save } = useGame();
  const look: Person = useMemo(() => personOf(f), [f.name]);
  const ties = (f.ties ?? []).map((t) => (t.person && save.people[t.person] ? `${t.what} (${save.people[t.person].name.split(" ")[0]})` : t.what));
  return (
    <div className="card p-3">
      <button className="w-full text-left flex items-start gap-3" onClick={onToggle}>
        <SlaveHead person={look} size={50} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[14px]">{f.name}</span>
            <span className="text-[11px] dim font-mono">{f.age}{f.nation ? ` · ${f.nation}` : ""}</span>
            {f.fate ? <Chip tone={f.fate.fate === "bought" ? "good" : "bad"}>{FATE_WORDS[f.fate.fate]}</Chip> : null}
            {f.kept ? <Pin size={11} className="dim" /> : null}
          </div>
          <div className="text-[12px] mid truncate">{f.what ?? f.role?.replace(/_/g, " ") ?? f.detail ?? "met in passing"}</div>
          <div className="text-[11.5px] dim truncate">{[towardWord(f.toward), ...ties].filter(Boolean).join(" · ")}</div>
        </div>
        {open ? <ChevronDown size={15} className="dim mt-1" /> : <ChevronRight size={15} className="dim mt-1" />}
      </button>
      {open ? <OtherRecord f={f} /> : null}
    </div>
  );
}

function OtherRecord({ f }: { f: Face }) {
  const { save, mutate } = useGame();
  const order = useHand("people");
  const [edit, setEdit] = useState(false);
  const [said, setSaid] = useState("");
  const [meeting, setMeeting] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [tieWho, setTieWho] = useState("");
  const [tieWhat, setTieWhat] = useState("");
  const yours = Object.values(save.people).filter((p) => p.status === "owned" || p.status === "indentured" || p.status === "free");
  const set = (fn: (x: Face) => void) => mutate((s) => { const x = filed(s, f.name); if (x) fn(x); });
  const dead = f.fate?.fate === "dead";

  const deal = (fate: Fate) => {
    let lines: string[] = [];
    order((s) => { lines = orderDealt(s, f.name, fate); });
    setSaid(lines.join(". "));
  };
  const meet = () => {
    let id = "";
    mutate((s) => {
      const x = filed(s, f.name);
      if (x) { x.last = s.arcology.week; x.seen++; }
      id = openMoment(s, { title: `With ${f.name}`, source: "other", happened: `${f.name}${f.what ? `, who ${/^(is|was|runs|owns|has|works)\b/.test(f.what) ? f.what : `is ${f.what}`},` : ""} comes up to see you.` });
    });
    setMeeting(id);
  };

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--line)" }}>
      {f.fate ? <p className="text-[13px] mb-2"><span className={f.fate.fate === "bought" ? "good" : "bad"}>{FATE_WORDS[f.fate.fate]}</span>, week {f.fate.week}. {f.fate.how}</p> : null}

      {!edit ? (
        <div className="space-y-1 text-[12.5px]">
          {f.detail ? <div><span className="dim">looks: </span>{f.detail}</div> : null}
          {f.likes ? <div><span className="dim">likes: </span>{f.likes}</div> : null}
          {f.dislikes ? <div><span className="dim">can't stand: </span>{f.dislikes}</div> : null}
          {(f.ties ?? []).length ? <div><span className="dim">ties: </span>{(f.ties ?? []).map((t) => t.person && save.people[t.person] ? `${t.what} (${save.people[t.person].name})` : t.what).join("; ")}</div> : null}
        </div>
      ) : (
        <div className="space-y-2 text-[12.5px]">
          {(["what", "detail", "likes", "dislikes"] as const).map((k) => (
            <label key={k} className="block">
              <span className="dim text-[11px]">{{ what: "what they do", detail: "how they look", likes: "likes", dislikes: "can't stand" }[k]}</span>
              <input className="w-full" defaultValue={f[k] ?? ""} onBlur={(e) => { const v = e.target.value.trim(); set((x) => { x[k] = v || undefined; }); }} />
            </label>
          ))}
          <label className="block">
            <span className="dim text-[11px]">toward you: {towardWord(f.toward ?? 0)}</span>
            <input type="range" min={-100} max={100} className="w-full" defaultValue={f.toward ?? 0} onChange={(e) => { const v = Number(e.target.value); set((x) => { x.toward = v; }); }} />
          </label>
          <div>
            <span className="dim text-[11px]">ties</span>
            {(f.ties ?? []).map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1">{t.what}{t.person && save.people[t.person] ? ` (${save.people[t.person].name})` : ""}</span>
                <button className="text-[11px] dim underline" onClick={() => set((x) => { x.ties = (x.ties ?? []).filter((_, j) => j !== i); })}>remove</button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 mt-1">
              <select value={tieWho} onChange={(e) => setTieWho(e.target.value)}>
                <option value="">to you</option>
                {yours.map((p) => <option key={p.id} value={p.id}>to {p.name}</option>)}
              </select>
              <input className="flex-1 min-w-[140px]" placeholder={tieWho ? "her husband, her regular…" : "owes you money, your rival…"} value={tieWhat} onChange={(e) => setTieWhat(e.target.value)} />
              <Button size="sm" disabled={!tieWhat.trim()} onClick={() => { set((x) => tie(x, tieWhat, tieWho || undefined)); setTieWhat(""); }}>add</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3">
        <div className="text-[10.5px] uppercase tracking-wider dim mb-1">What they remember</div>
        {(f.notes ?? []).length
          ? <ul className="space-y-1 text-[12.5px]">{[...(f.notes ?? [])].reverse().map((n, i) => (
              <li key={i} className="flex gap-2"><span className="dim font-mono text-[11px] shrink-0">w{n.week}</span><span className="flex-1">{n.text}</span>
                {edit ? <button className="text-[11px] dim underline shrink-0" onClick={() => set((x) => { x.notes = (x.notes ?? []).filter((m) => m.text !== n.text); })}>forget</button> : null}
              </li>))}</ul>
          : <div className="text-[12px] dim">Nothing yet. What happens when they turn up in a scene goes here.</div>}
        {edit ? (
          <div className="flex gap-2 mt-2">
            <input className="flex-1" placeholder="something they remember" value={newNote} onChange={(e) => setNewNote(e.target.value)} />
            <Button size="sm" disabled={!newNote.trim()} onClick={() => { mutate((s) => { const x = filed(s, f.name); if (x) note(s, x, newNote); }); setNewNote(""); }}>add</Button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {!dead ? <Button size="sm" kind="primary" onClick={meet}>Meet them</Button> : null}
        <Button size="sm" kind="ghost" onClick={() => setEdit(!edit)}>{edit ? "done editing" : "edit their record"}</Button>
        <Button size="sm" kind="ghost" onClick={() => set((x) => { x.kept = !x.kept; })}>{f.kept ? <><PinOff size={12} /> stop keeping</> : <><Pin size={12} /> keep on file</>}</Button>
      </div>

      {!f.fate || f.fate.fate === "bought" ? (
        <div className="mt-3">
          <div className="text-[10.5px] uppercase tracking-wider dim mb-1">Have them dealt with</div>
          <div className="flex flex-wrap gap-1.5">
            <button className="chip" onClick={() => deal("dead")}>kill</button>
            <button className="chip" onClick={() => deal("ruined")}>ruin</button>
            <button className="chip" onClick={() => deal("exiled")}>throw out</button>
            <button className="chip" onClick={() => deal("jailed")}>lock up</button>
            {f.fate?.fate !== "bought" ? <button className={cx("chip", save.arcology.cash < BUY_OFF && "opacity-50")} disabled={save.arcology.cash < BUY_OFF} onClick={() => deal("bought")}>buy off (¤{BUY_OFF.toLocaleString()})</button> : null}
          </div>
        </div>
      ) : null}
      {said ? <p className="text-[12.5px] mt-2 acc">{said}.</p> : null}
      {meeting ? <MomentCard id={meeting} className="mt-3" onClose={() => setMeeting(null)} /> : null}
    </div>
  );
}
