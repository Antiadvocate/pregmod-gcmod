/** SETTINGS — models, saves, and the two dials that change how the world behaves. */
import { useEffect, useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Field, Section } from "../lib/ui";
import { getApiKey, setApiKey, getLocalEndpoint, setLocalEndpoint, modelsAvailable, getLocalImage, setLocalImage, LOCAL_IMAGE_DEFAULTS, type LocalImageEndpoint } from "../config";
import { generateLocalImage, KONTEXT_WORKFLOW, listLocalCheckpoints, WORKFLOW_TOKENS } from "../lib/diffusion";
import { dynamicReadiness } from "../engine/dynamic";
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
  const [img, setImg] = useState<LocalImageEndpoint>(getLocalImage() ?? { url: "", backend: "comfy" });
  const [testing, setTesting] = useState("");
  const [testImg, setTestImg] = useState<string | null>(null);
  const [checkpoints, setCheckpoints] = useState<string[]>([]);
  const dyn = dynamicReadiness(save);

  const saveImg = (patch: Partial<LocalImageEndpoint>) => {
    const next = { ...img, ...patch };
    setImg(next);
    setLocalImage(next.url ? next : null);
  };

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("warp-theme", theme); }, [theme]);

  return (
    <>
      <Section title="Start over">
        <Card>
          <div className="text-[12.5px] mid mb-3">
            A new game generates a fresh arcology and a fresh household. This save is kept — it is in the list on the
            way in, and nothing here deletes it.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button kind="primary" onClick={onSwitch}>new game, or load another save</Button>
            <Button onClick={() => exportSave(save)}>export this one first</Button>
          </div>
        </Card>
      </Section>

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

      <Section title="Pictures">
        <Card>
          <div className="text-[11.5px] dim mb-3">
            Point this at ComfyUI or an A1111-style WebUI on your own machine and the game draws itself: a portrait
            per person that holds still across a campaign, and a picture of the moment after every scene.
            It has to be local — a hosted image API refuses most of what this game needs to draw, and bills for the
            rest at a few cents a frame. On your own GPU it is free, which is what makes a picture a turn reasonable.
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Field label="Server" hint="ComfyUI http://127.0.0.1:8188 · A1111/Forge http://127.0.0.1:7860">
                <input value={img.url} placeholder="http://127.0.0.1:8188" onChange={(e) => saveImg({ url: e.target.value })} />
              </Field>
            </div>
            <Field label="Backend">
              <select value={img.backend} onChange={(e) => saveImg({ backend: e.target.value as "comfy" | "a1111" })}>
                <option value="comfy">ComfyUI</option>
                <option value="a1111">A1111 / Forge / SD.Next</option>
              </select>
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Checkpoint" hint={checkpoints.length ? `${checkpoints.length} found on the server` : undefined}>
              <input list="warp-ckpts" value={img.checkpoint ?? ""} onChange={(e) => saveImg({ checkpoint: e.target.value })} />
              <datalist id="warp-ckpts">{checkpoints.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            <Field label="Steps"><input type="number" value={img.steps ?? LOCAL_IMAGE_DEFAULTS.steps} onChange={(e) => saveImg({ steps: Number(e.target.value) })} /></Field>
            <Field label="CFG"><input type="number" step="0.5" value={img.cfg ?? LOCAL_IMAGE_DEFAULTS.cfg} onChange={(e) => saveImg({ cfg: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Prompt dialect" hint="SD1.5, SDXL and Pony parse comma-separated tags and stop attending past about seventy tokens. Flux and SD3 read sentences.">
            <div className="flex gap-2">
              {(["natural", "tags"] as const).map((d) => (
                <Button key={d} size="sm" kind={(img.prompt_style ?? "natural") === d ? "primary" : undefined} onClick={() => saveImg({ prompt_style: d })}>{d}</Button>
              ))}
            </div>
          </Field>
          <div className="flex flex-wrap gap-2 mb-3">
            <Chip on={img.lock_seed !== false} onClick={() => saveImg({ lock_seed: img.lock_seed === false })}>hold a scene's seed</Chip>
            <Chip on={!!img.auto_scene} onClick={() => saveImg({ auto_scene: !img.auto_scene })}>paint every scene turn</Chip>
          </div>
          {img.backend === "comfy" ? (
            <Field label="Workflow (API format)" hint={`Export yours from ComfyUI with Workflow → Export (API) and replace the values Warp should fill with ${WORKFLOW_TOKENS.slice(0, 8).join(" ")}. Blank uses a plain txt2img graph. Numbers are substituted through their quotes, so "seed": "%seed%" arrives as a real number.`}>
              <textarea rows={4} className="font-mono text-[11px]" value={img.workflow ?? ""} onChange={(e) => saveImg({ workflow: e.target.value })} />
            </Field>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={!img.url} onClick={async () => {
              setTesting("painting a test…"); setTestImg(null);
              try {
                const res = await generateLocalImage({ prompt: "a woman standing in a lit corridor, photographic", aspect: "portrait", onProgress: (n) => setTesting(n) });
                setTestImg(res.url); setTesting(`came back in ${(res.took_ms / 1000).toFixed(1)}s`);
              } catch (e) { setTesting((e as Error).message); }
            }}>paint a test</Button>
            {img.backend === "comfy" ? (
              <>
                <Button size="sm" kind="ghost" onClick={() => saveImg({ workflow: KONTEXT_WORKFLOW })}>load Flux Kontext</Button>
                <Button size="sm" kind="ghost" onClick={async () => setCheckpoints(await listLocalCheckpoints())}>list checkpoints</Button>
              </>
            ) : null}
          </div>
          {testing ? <div className="text-[11.5px] mid mt-2">{testing}</div> : null}
          {testImg ? <img src={testImg} alt="" className="mt-3 rounded-lg max-h-64" /> : null}
        </Card>
      </Section>

      <Section title="What the model is asked to write">
        <Card>
          <div className="text-[12.5px] mid mb-2">{dyn.note}</div>
          <div className="text-[11.5px] dim">
            The scenes, the generated events and the wording of what she asks for all go through the narrator slot.
            This game asks for explicit material as a matter of course, and a hosted model will decline a fair share
            of it, soften the rest, and give you the half-written scenes the genre's players recognise immediately.
            Put a local model behind the narrator — KoboldCpp, llama-server, LM Studio, Ollama — and prefix the id
            with <span className="font-mono">local/</span>. The bookkeeper can stay hosted: it only ever emits JSON,
            which is the thing small models are worst at.
          </div>
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
            <Button kind="ghost" onClick={onSwitch}>new game / saves</Button>
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
