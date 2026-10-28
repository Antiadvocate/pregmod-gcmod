/** SETTINGS — models, saves, and the two dials that change how the world behaves. */
import { setLayout, setNav, useLayout } from "../lib/layout";
import { setGraphics, useGraphics } from "../lib/graphics";
import { liftBan } from "../engine/bans";
import { useEffect, useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Field, Section, cx } from "../lib/ui";
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
  const { layout, nav } = useLayout();
  const gfx = useGraphics();
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
          <Field label="City feed — the cheap model that writes the posts" hint="Short posts only, a few at a time, and the narrator writes the full story when you open one. Blank uses the bookkeeper.">
            <ModelPicker value={save.models.feed_model ?? ""} models={models} onChange={(id) => mutate((s) => { s.models.feed_model = id; })} />
          </Field>
          <Field label="How often the city posts" hint="While the game is open and in front of you. Each batch is one small call.">
            <div className="flex gap-2 flex-wrap">
              {[0, 2, 5, 10, 20].map((m) => (
                <Chip key={m} on={(save.models.feed_pace ?? 5) === m} onClick={() => mutate((s) => { s.models.feed_pace = m; })}>{m ? `every ${m} min` : "off"}</Chip>
              ))}
            </div>
          </Field>
          <Field label="Lean mode" hint="Only call the model when you ask for something. There's no automatic week summary and no automatic assistant brief (she gets a button instead). Scenes, conversations and events still use the model when you play them.">
            <div className="flex gap-1.5">
              <Chip on={!!save.models.lean_mode} onClick={() => mutate((s) => { s.models.lean_mode = true; })}>On</Chip>
              <Chip on={!save.models.lean_mode} onClick={() => mutate((s) => { s.models.lean_mode = false; })}>Off</Chip>
            </div>
            <div className="text-[12px] dim mt-3 mb-1">Business, money and politics as events, like loans, suppliers, share raids, envoys and summits, strikes, festivals, citizens' meetings. Attacks and wars still come whatever this says.</div>
            <div className="flex gap-1.5">
              {(["off", "some", "on"] as const).map((k) => <Chip key={k} on={(save.business_events ?? "off") === k} onClick={() => mutate((s) => { s.business_events = k; })}>{{ off: "None of it", some: "One a month", on: "All of it" }[k]}</Chip>)}
            </div>
            <div className="text-[12px] dim mt-3 mb-1">How much the other powers bother you with envoys, offers and summits, when business events are on. Enemies will still come for you whatever this says.</div>
            <div className="flex gap-1.5">
              {(["none", "some", "full"] as const).map((k) => <Chip key={k} on={(save.world_pace ?? "some") === k} onClick={() => mutate((s) => { s.world_pace = k; })}>{{ none: "Leave me alone", some: "Now and then", full: "Constantly" }[k]}</Chip>)}
            </div>
            <div className="text-[12px] dim mt-3 mb-1">After you answer an event, have the model write out what happens. Off: you get the game's line and what changed, and each event still has "play it out" if you want it.</div>
            <div className="flex gap-1.5">
              <Chip on={save.models.write_outcomes !== false} onClick={() => mutate((s) => { s.models.write_outcomes = true; })}>Write it out</Chip>
              <Chip on={save.models.write_outcomes === false} onClick={() => mutate((s) => { s.models.write_outcomes = false; })}>Just apply it</Chip>
            </div>
          </Field>
          <Field label="Thinking" hint="Reasoning models (and many flash models) think before they write, which can take a long time. Off asks them not to, and if a model refuses the switch, the call is sent again without it.">
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
            (kept consistent across the game) and a picture after every scene. It has to be local, because hosted image APIs
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
            with <span className="font-mono">local/</span>. The bookkeeper can stay hosted, because it only outputs JSON,
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

      {(save.bans ?? []).length ? (
        <Section title="Dropped storylines">
          <Card>
            <div className="text-[12px] mid mb-2">Storylines and people you ended for good. Nothing about them comes up again until you bring them back.</div>
            {(save.bans ?? []).map((b) => (
              <div key={b.id} className="flex items-center gap-2 py-1 hairline-top first:border-0">
                <div className="flex-1 text-[13px]">{b.what}<span className="dim text-[11.5px]"> · week {b.week}{b.words.length ? ` · ${b.words.join(", ")}` : ""}{b.faces.length ? ` · ${b.faces.length} ${b.faces.length === 1 ? "person" : "people"}` : ""}</span></div>
                <button className="chip" onClick={() => mutate((s) => liftBan(s, b.id))}>bring back</button>
              </div>
            ))}
          </Card>
        </Section>
      ) : null}

      <Section title="Graphics">
        <Card>
          <div className="text-[12px] mid mb-1.5">How much the screen draws. Turn it down if your phone runs hot or the battery drains.</div>
          <div className="segmented mb-1.5">
            {([["full", "Full"], ["still", "Still"], ["off", "Off"]] as const).map(([k, label]) => (
              <button key={k} className={cx("seg", gfx === k && "on")} onClick={() => setGraphics(k)}>{label}</button>
            ))}
          </div>
          <div className="text-[11.5px] dim">{gfx === "full" ? "Portraits breathe and blink, the city moves, the globe spins. Capped at 30 frames a second." : gfx === "still" ? "Portraits are drawn but hold still. No looping effects, no glass blur, and the globe only redraws when you touch it." : "No portraits or drawn art at all, just the words. The lightest it gets."}</div>
        </Card>
      </Section>

      <Section title="Layout">
        <Card>
          <div className="text-[12px] mid mb-1.5">How screens are laid out</div>
          <div className="segmented mb-1.5">
            {([["columns", "Side by side"], ["strip", "Scroll sideways"], ["stack", "One column"]] as const).map(([k, label]) => (
              <button key={k} className={cx("seg", layout === k && "on")} onClick={() => setLayout(k)}>{label}</button>
            ))}
          </div>
          <div className="text-[11px] dim mb-3">{layout === "columns" ? "Cards flow into as many columns as the window has room for." : layout === "strip" ? "The screen flows into columns down the height of the window and scrolls sideways, like a broadsheet. The mouse wheel scrolls it, and there are arrows at the edges." : "The old single column, scrolling down."}</div>
          <div className="text-[12px] mid mb-1.5">Getting around, on a wider screen</div>
          <div className="segmented mb-1.5">
            {([["top", "Across the top"], ["rail", "Down the side"]] as const).map(([k, label]) => (
              <button key={k} className={cx("seg", nav === k && "on")} onClick={() => setNav(k)}>{label}</button>
            ))}
          </div>
          <div className="text-[11px] dim">On a phone the tab bar stays at the bottom either way.</div>
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
