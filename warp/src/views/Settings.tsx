/** SETTINGS — models, saves, and the two dials that change how the world behaves. */
import { useEffect, useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Field, Section } from "../lib/ui";
import { getApiKey, setApiKey, getLocalEndpoint, setLocalEndpoint, modelsAvailable } from "../config";
import { exportSave } from "../store";
import { llmErrors } from "../llm";

const SUGGESTED = [
  "deepseek/deepseek-chat",
  "anthropic/claude-3.5-sonnet",
  "openai/gpt-4o-mini",
  "meta-llama/llama-3.3-70b-instruct",
  "google/gemini-flash-1.5",
];

export default function SettingsView({ onSwitch }: { onSwitch: () => void }) {
  const { save, mutate } = useGame();
  const [key, setKey] = useState(getApiKey());
  const [local, setLocal] = useState(getLocalEndpoint()?.url ?? "");
  const [theme, setTheme] = useState(document.documentElement.dataset.theme ?? "brass");

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("warp-theme", theme); }, [theme]);

  return (
    <>
      <Section title="Models">
        <Card>
          <Field label="OpenRouter key" hint="Stored in this browser only, sent to OpenRouter and nowhere else. Warp works without one — you get stage directions instead of prose.">
            <input type="password" value={key} placeholder="sk-or-…" onChange={(e) => { setKey(e.target.value); setApiKey(e.target.value); }} />
          </Field>
          <Field label="Local server (optional)" hint="An OpenAI-compatible base URL — KoboldCpp http://localhost:5001/v1, LM Studio http://localhost:1234/v1. Then prefix a model id with local/ to route it there.">
            <input value={local} placeholder="http://localhost:5001/v1" onChange={(e) => { setLocal(e.target.value); setLocalEndpoint(e.target.value ? { url: e.target.value } : null); }} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            {([["narrator_model", "Narrator — the long creative call"], ["bookkeeper_model", "Bookkeeper — strict JSON, small model"], ["forge_model", "Forge — writes a person's interior"], ["fallback_model", "Fallback — when the first one fails"]] as const).map(([k, label]) => (
              <Field key={k} label={label}>
                <input list="warp-models" value={save.models[k]} onChange={(e) => mutate((s) => { s.models[k] = e.target.value; })} />
              </Field>
            ))}
          </div>
          <datalist id="warp-models">{SUGGESTED.map((m) => <option key={m} value={m} />)}</datalist>
          <div className="text-[11.5px] dim">{modelsAvailable() ? "Configured." : "Nothing configured — the game runs offline."}</div>
        </Card>
      </Section>

      <Section title="How much the world does on its own">
        <Card>
          <Field label={`Tension — ${save.models.tension}`} hint="0 means the engine originates nothing: every event that fires comes out of your own household. Higher means the world outside reaches in more often and escalates faster.">
            <input type="range" min={0} max={10} value={save.models.tension} onChange={(e) => mutate((s) => { s.models.tension = Number(e.target.value); })} />
          </Field>
          <Field label={`Scene history kept in context — ${save.models.history_window} turns`} hint="The prompt is a compiled state document, not a transcript, so this is for continuity of phrasing only. Lower is cheaper and loses very little.">
            <input type="range" min={2} max={12} value={save.models.history_window} onChange={(e) => mutate((s) => { s.models.history_window = Number(e.target.value); })} />
          </Field>
        </Card>
      </Section>

      <Section title="Look">
        <div className="flex gap-2">
          {["brass", "rust", "sea", "bone"].map((t) => <Chip key={t} on={theme === t} onClick={() => setTheme(t)}>{t}</Chip>)}
        </div>
      </Section>

      <Section title="This save">
        <Card>
          <div className="text-[12.5px] mid mb-3">
            {save.arcology.name} · week {save.arcology.week} · {Object.keys(save.people).length} people on record · {save.history.length} scene turns
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => exportSave(save)}>export to a file</Button>
            <Button kind="ghost" onClick={onSwitch}>switch save</Button>
          </div>
        </Card>
      </Section>

      {save.integrity.fires.length ? (
        <Section title="What the guards caught">
          <Card>
            <div className="text-[11.5px] dim mb-2">
              Every contradiction the engine caught and corrected, counted rather than forgotten. A story can come apart
              while the engine notices each individual crack.
            </div>
            <ul className="text-[12px] mid space-y-1 max-h-52 overflow-y-auto">
              {[...save.integrity.fires].reverse().slice(0, 30).map((f, i) => (
                <li key={i}><span className="font-mono dim">wk {f.week} {f.kind}</span> — {f.detail}</li>
              ))}
            </ul>
          </Card>
        </Section>
      ) : null}

      {llmErrors.length ? (
        <Section title="Model failures this session">
          <Card><ul className="text-[12px] mid space-y-1">{llmErrors.slice(-6).map((e, i) => <li key={i}><span className="font-mono dim">{e.model}</span> — {e.message}</li>)}</ul></Card>
        </Section>
      ) : null}
    </>
  );
}
