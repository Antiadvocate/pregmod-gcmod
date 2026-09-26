/** SETTINGS — models, saves, and the two dials that change how the world behaves. */
import { useEffect, useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Field, Section } from "../lib/ui";
import { getThinking, setThinking, type Thinking, getApiKey, setApiKey, getLocalEndpoint, setLocalEndpoint, modelsAvailable, getLocalImage, setLocalImage, LOCAL_IMAGE_DEFAULTS, type LocalImageEndpoint } from "../config";
import { generateLocalImage, KONTEXT_WORKFLOW, listLocalCheckpoints, WORKFLOW_TOKENS } from "../lib/diffusion";
import { dynamicReadiness } from "../engine/dynamic";
import { exportSave } from "../store";
import { llmErrors, listOpenRouterModels, listLocalModels, type ModelInfo } from "../llm";
import ModelPicker from "../lib/ModelPicker";
import { imageModels } from "../lib/imagegen";


export default function SettingsView({ onSwitch }: { onSwitch: () => void }) {
  const { save, mutate } = useGame();
  const [key, setKey] = useState(getApiKey());
  const [thinking, setThinkingState] = useState<Thinking>(getThinking());
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelsState, setModelsState] = useState("Loading the OpenRouter model list…");
  async function loadModels(force = false) {
    setModelsState("Loading the OpenRouter model list…");
    const [remote, local] = await Promise.allSettled([listOpenRouterModels(force), listLocalModels()]);
    const list = [...(local.status === "fulfilled" ? local.value : []), ...(remote.status === "fulfilled" ? remote.value : [])];
    setModels(list);
    const bits = [
      remote.status === "fulfilled" ? `${remote.value.length} OpenRouter models` : `couldn't reach OpenRouter (${(remote.reason as Error)?.message ?? "error"})`,
      local.status === "fulfilled" ? (local.value.length ? `${local.value.length} local` : "") : "local server didn't answer",
    ].filter(Boolean);
    setModelsState(bits.join(" · "));
  }
  useEffect(() => { void loadModels(); }, []);
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
            A new game generates a fresh arcology and a fresh household. This save is kept, and
            stays in the save list.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button kind="primary" onClick={onSwitch}>new game, or load another save</Button>
            <Button onClick={() => exportSave(save)}>export this one first</Button>
          </div>
        </Card>
      </Section>

      <Section title="Models">
        <Card>
          <Field label="OpenRouter key" hint="Stored in this browser only, sent to OpenRouter and nowhere else. Warp works without one, using the built-in written scenes.">
            <input type="password" value={key} placeholder="sk-or-…" onChange={(e) => { setKey(e.target.value); setApiKey(e.target.value); }} />
          </Field>
          <Field label="Local server (optional)" hint="An OpenAI-compatible base URL — KoboldCpp http://localhost:5001/v1, LM Studio http://localhost:1234/v1. Then prefix a model id with local/ to route it there.">
            <input value={local} placeholder="http://localhost:5001/v1" onChange={(e) => { setLocal(e.target.value); setLocalEndpoint(e.target.value ? { url: e.target.value } : null); }} onBlur={() => loadModels()} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            {([["narrator_model", "Narrator — the long creative call"], ["bookkeeper_model", "Bookkeeper — strict JSON, small model"], ["forge_model", "Forge — writes a person's interior"], ["fallback_model", "Fallback — when the first one fails"]] as const).map(([k, label]) => (
              <Field key={k} label={label}>
                <ModelPicker value={save.models[k]} models={models} onChange={(id) => mutate((s) => { s.models[k] = id; })} />
              </Field>
            ))}
          </div>
          <Field label="Thinking" hint="Reasoning models (and many flash models) think before they write, which can take a long time. Off asks them not to; if a model refuses the switch, the call is sent again without it.">
            <div className="flex gap-1.5">
              {([["off", "Off — fastest"], ["low", "A little"], ["model", "Model's default"]] as [Thinking, string][]).map(([v, label]) => (
                <Chip key={v} on={thinking === v} onClick={() => { setThinking(v); setThinkingState(v); }}>{label}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Photo model — redraws the drawn feet as photographs" hint={`${imageModels(models).length} OpenRouter models that output images. Each redraw is one image per view, billed by the model.`}>
            <ModelPicker value={save.models.photo_model ?? ""} models={imageModels(models)} onChange={(id) => mutate((s) => { s.models.photo_model = id; })} />
          </Field>
          <div className="flex items-center gap-2 text-[11.5px] dim">
            <span>{modelsState}</span>
            <Button size="sm" kind="ghost" onClick={() => loadModels(true)}>refresh list</Button>
          </div>
          <div className="text-[11.5px] dim">{modelsAvailable() ? "Configured." : "Nothing configured — the game runs offline."}</div>
        </Card>
      </Section>

      <Section title="Pictures">
        <Card>
          <div className="text-[11.5px] dim mb-3">
            Point this at ComfyUI or an A1111-style WebUI on your own machine to generate a portrait for each slave
            (kept consistent across the game) and a picture after every scene. It has to be local: hosted image APIs
            refuse most of this game's content and charge per image.
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
            This game asks for explicit material, and hosted models often refuse it or tone it down.
            Put a local model behind the narrator — KoboldCpp, llama-server, LM Studio, Ollama — and prefix the id
            with <span className="font-mono">local/</span>. The bookkeeper can stay hosted; it only outputs JSON,
            which small local models are bad at.
          </div>
        </Card>
      </Section>

      <Section title="Content">
        <Card>
          <div className="text-[11.5px] dim mb-2">All on by default, as in the original. Turning one off hides it from surgery, drugs and acts.</div>
          <div className="flex flex-wrap gap-2">
            {([
              ["extreme", "extreme content (castration, removing genitals, clipped tendons)"],
              ["hyper", "hyper growth (cocks and balls past natural sizes)"],
              ["circumcision", "circumcision"],
              ["watersports", "watersports"],
            ] as const).map(([k, label]) => {
              const on = save.content?.[k] !== false;
              return <Chip key={k} on={on} onClick={() => mutate((s) => { s.content = { ...(s.content ?? {}), [k]: !on }; })}>{label}</Chip>;
            })}
          </div>
        </Card>
      </Section>

      <Section title="How much the world does on its own">
        <Card>
          <Field label={`Tension — ${save.models.tension}`} hint="0 means only your own household causes events. Higher means outside events happen more often and escalate faster.">
            <input type="range" min={0} max={10} value={save.models.tension} onChange={(e) => mutate((s) => { s.models.tension = Number(e.target.value); })} />
          </Field>
          <Field label={`Scene history kept in context — ${save.models.history_window} turns`} hint="How many recent turns the narrator sees for continuity. Lower is cheaper.">
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
        <Section title="Model mistakes caught">
          <Card>
            <div className="text-[11.5px] dim mb-2">
              Every mistake in the model's writing that the game caught and corrected.
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
