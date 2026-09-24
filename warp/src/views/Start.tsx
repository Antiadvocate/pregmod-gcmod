/** The first screen. A name, a difficulty, and you are in — the arcology is generated whole and
 *  nothing else is asked of you before you can look at it. */
import { useEffect, useState } from "react";
import type { SaveState } from "../engine/types";
import { newGame } from "../engine/state";
import { getSave, importSave, listSaves, putSave, deleteSave } from "../store";
import { Button, Card, Field, Section, cx } from "../lib/ui";
import { Dice5 } from "lucide-react";
import { ORIGINS } from "../data/story";
import { TWISTS, TWIST_BY_ID } from "../engine/run";
import { modelsAvailable } from "../config";
import { KITS, type Kit } from "../engine/you";

const ADDRESSES = ["Master", "Mistress", "Sir", "Ma'am", "Owner"];

export default function Start({ onStart }: { onStart: (s: SaveState) => void }) {
  const [saves, setSaves] = useState<{ id: string; name: string; week: number; arcology: string; people: number; updated_at: string }[]>([]);
  const [name, setName] = useState("");
  const [player, setPlayer] = useState("");
  const [address, setAddress] = useState("Master");
  const [custom, setCustom] = useState("");
  const [origin, setOrigin] = useState<string>(() => ORIGINS[Math.floor(Math.random() * ORIGINS.length)].id);
  const [supplication, setSupplication] = useState(false);
  const [plot, setPlot] = useState(true);
  const [kit, setKit] = useState<Kit | null>(null);
  const [twists, setTwists] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"generous" | "standard" | "hard">("standard");
  const [busy, setBusy] = useState(false);

  useEffect(() => { void listSaves().then(setSaves); }, []);

  async function begin() {
    setBusy(true);
    const s = newGame({
      arcology_name: name || undefined, player_name: player || undefined, difficulty, origin,
      address: address === "custom" ? custom.trim() || "Master" : address, supplication, plot, twists, kit: kit ?? undefined,
    });
    await putSave(s);
    localStorage.setItem("warp-last", s.id);
    onStart(s);
  }

  const picked = ORIGINS.find((o) => o.id === origin)!;

  return (
    <div className="min-h-dvh grid place-items-center p-4 sm:p-6">
      <div className="w-full max-w-xl">
        <h1 className="font-display text-[34px] leading-none tracking-tight mb-1">Warp</h1>
        <p className="mid text-[13px] mb-6">Free Cities, rebuilt. Every run starts somewhere different.</p>

        <Section title="Who were you?" right={
          <Button size="sm" kind="ghost" onClick={() => setOrigin(ORIGINS[Math.floor(Math.random() * ORIGINS.length)].id)}><Dice5 size={14} /> roll</Button>
        }>
          <div className="grid gap-2 sm:grid-cols-2">
            {ORIGINS.map((o) => (
              <button key={o.id} onClick={() => setOrigin(o.id)} className={cx("choice", origin === o.id && "on")}>
                <span className="block font-display text-[16px]">{o.name}</span>
                <span className="block text-[12.5px] mid mt-0.5 leading-snug">{o.pitch}</span>
              </button>
            ))}
          </div>
          <p className="text-[12px] dim mt-2.5">{picked.start}</p>
        </Section>

        <Card className="mb-5">
          <Field label="Your name"><input value={player} onChange={(e) => setPlayer(e.target.value)} placeholder="leave blank to stay nameless" /></Field>
          <Field label="What they call you">
            <div className="flex flex-wrap gap-1.5">
              {[...ADDRESSES, "custom"].map((a) => (
                <button key={a} className={cx("chip !text-[12px] !py-1 !px-3", address === a && "on")} onClick={() => setAddress(a)}>{a === "custom" ? "something else" : a}</button>
              ))}
            </div>
            {address === "custom" ? <input className="mt-2" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Madam, Boss, your name" /> : null}
          </Field>
          <Field label="Between your legs" hint={kit ? "Height, build, chest and the rest are yours to shape on the You screen." : "The scenes follow this. Pick one to begin."}>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(KITS) as Kit[]).map((k) => (
                <button key={k} className={cx("chip !text-[12px] !py-1 !px-3", kit === k && "on")} onClick={() => setKit(k)}>{KITS[k].label}</button>
              ))}
            </div>
          </Field>
          <Field label="The arcology"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="leave blank for a random name" /></Field>
          <Field label="How hard" hint="Money only. Your origin sets the rest.">
            <div className="flex gap-2">
              {(["generous", "standard", "hard"] as const).map((d) => (
                <Button key={d} kind={difficulty === d ? "primary" : undefined} size="sm" onClick={() => setDifficulty(d)}>{d}</Button>
              ))}
            </div>
          </Field>
          <Field label="Twists" hint={twists.length ? twists.map((t) => TWIST_BY_ID[t].what).join(" ") : "Pick up to two."}>
            <div className="flex flex-wrap gap-1.5">
              {TWISTS.map((t) => (
                <button key={t.id} className={cx("chip !text-[12px] !py-1 !px-3", twists.includes(t.id) && "on")}
                  onClick={() => setTwists((xs) => (xs.includes(t.id) ? xs.filter((x) => x !== t.id) : [...xs, t.id].slice(-2)))}>{t.name}</button>
              ))}
              <button className="chip !text-[12px] !py-1 !px-3" onClick={() => {
                const pool = [...TWISTS].sort(() => Math.random() - 0.5);
                setTwists(pool.slice(0, 1 + Math.floor(Math.random() * 2)).map((t) => t.id));
              }}><Dice5 size={12} /> roll</button>
            </div>
          </Field>
          <label className="flex items-start gap-2.5 mt-1 cursor-pointer">
            <input type="checkbox" className="!w-auto mt-0.5" checked={plot} onChange={(e) => setPlot(e.target.checked)} />
            <span className="text-[12.5px] mid">Run the <span className="hi">main plot</span>: the original game's chain, from the strip club closing in week 6 to the coup in week 71.</span>
          </label>
          <label className="flex items-start gap-2.5 mt-1 cursor-pointer">
            <input type="checkbox" className="!w-auto mt-0.5" checked={supplication} onChange={(e) => setSupplication(e.target.checked)} />
            <span className="text-[12.5px] mid">Also run <span className="hi">Supplicationism</span>: a long storyline where one of your slaves gradually comes to own you.</span>
          </label>
          <Button kind="primary" onClick={begin} disabled={busy || !kit} className="w-full mt-4">Begin</Button>
          {!modelsAvailable() ? (
            <p className="text-[11.5px] dim mt-3">
              No AI model set up. Everything works without one, including every story, scene and conversation. A model
              in Settings adds free-form scenes and rewrites dialogue on top.
            </p>
          ) : null}
        </Card>

        {saves.length ? (
          <Section title="Continue">
            <div className="space-y-2">
              {saves.map((s) => (
                <div key={s.id} className="card p-3 flex items-center gap-3">
                  <button className="flex-1 text-left" onClick={async () => {
                    const loaded = await getSave(s.id);
                    if (loaded) { localStorage.setItem("warp-last", s.id); onStart(loaded); }
                  }}>
                    <div className="text-[13px]">{s.arcology}</div>
                    <div className="text-[11px] dim font-mono">week {s.week} · {s.people} people · {new Date(s.updated_at).toLocaleDateString()}</div>
                  </button>
                  <Button size="sm" kind="ghost" onClick={async () => { await deleteSave(s.id); setSaves(await listSaves()); }}>delete</Button>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        <label className="btn btn-ghost btn-sm cursor-pointer">
          import a save
          <input type="file" accept="application/json" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const s = await importSave(f);
            localStorage.setItem("warp-last", s.id);
            onStart(s);
          }} />
        </label>
      </div>
    </div>
  );
}
