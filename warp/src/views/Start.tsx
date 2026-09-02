/** The first screen. A name, a difficulty, and you are in — the arcology is generated whole and
 *  nothing else is asked of you before you can look at it. */
import { useEffect, useState } from "react";
import type { SaveState } from "../engine/types";
import { newGame } from "../engine/state";
import { getSave, importSave, listSaves, putSave, deleteSave } from "../store";
import { Button, Card, Field, Section } from "../lib/ui";
import { modelsAvailable } from "../config";

export default function Start({ onStart }: { onStart: (s: SaveState) => void }) {
  const [saves, setSaves] = useState<{ id: string; name: string; week: number; arcology: string; people: number; updated_at: string }[]>([]);
  const [name, setName] = useState("");
  const [player, setPlayer] = useState("");
  const [difficulty, setDifficulty] = useState<"generous" | "standard" | "hard">("standard");
  const [busy, setBusy] = useState(false);

  useEffect(() => { void listSaves().then(setSaves); }, []);

  async function begin() {
    setBusy(true);
    const s = newGame({ arcology_name: name || undefined, player_name: player || undefined, difficulty });
    await putSave(s);
    localStorage.setItem("warp-last", s.id);
    onStart(s);
  }

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="font-display text-[34px] leading-none tracking-tight mb-1">Warp</h1>
        <p className="mid text-[13px] mb-7">
          An arcology that remembers. Free Cities' city-state, rebuilt on a nervous system —
          devotion and trust are read off the people rather than stored on them.
        </p>

        <Card className="mb-5">
          <Field label="Arcology"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="left blank, it names itself" /></Field>
          <Field label="You are called"><input value={player} onChange={(e) => setPlayer(e.target.value)} placeholder="you" /></Field>
          <Field label="Opening position" hint="Money and nothing else. The people are generated the same either way.">
            <div className="flex gap-2">
              {(["generous", "standard", "hard"] as const).map((d) => (
                <Button key={d} kind={difficulty === d ? "primary" : undefined} size="sm" onClick={() => setDifficulty(d)}>{d}</Button>
              ))}
            </div>
          </Field>
          <Button kind="primary" onClick={begin} disabled={busy} className="w-full mt-2">Take the arcology</Button>
          {!modelsAvailable() ? (
            <p className="text-[11.5px] dim mt-3">
              No model configured. Everything works — the people, the week, the economy, the doctrine — you simply
              get stage directions instead of prose in scenes. Add a key in Settings whenever you like.
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
