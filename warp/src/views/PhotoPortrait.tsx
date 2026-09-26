/**
 * Her drawing, redrawn as a photograph: a face portrait (with an expression from who she is and how
 * she is), or a full-body attempt the model may refuse. Run by hand; each is one image, billed by
 * the model chosen in Settings.
 */
import { useRef, useState, type RefObject } from "react";
import { useGame } from "../lib/game";
import { Button } from "../lib/ui";
import { hasApiKey } from "../config";
import { frameFigures, redraw, svgToPng, toJpeg } from "../lib/imagegen";
import { portraitPrompt } from "../lib/portrait";
import SlaveArt from "./SlaveArt";

export default function PhotoPortrait({ id, body }: { id: string; body: RefObject<SVGSVGElement | null> }) {
  const { save, mutate } = useGame();
  const p = save.people[id];
  const head = useRef<SVGSVGElement>(null);
  const [busy, setBusy] = useState<"" | "face" | "body">("");
  const [show, setShow] = useState<"face" | "body">("face");
  const model = save.models.photo_model ?? "";
  if (!p) return null;
  const ph = p.photo_portrait;

  const take = async (mode: "face" | "body") => {
    const svg = mode === "face" ? head.current : body.current;
    if (!svg || busy || !model) return;
    setBusy(mode);
    try {
      const raw = await svgToPng(svg, mode === "face" ? 3 : 2.5);
      const png = mode === "body" ? await frameFigures([raw]) : raw;
      const img = await toJpeg(await redraw(model, png, portraitPrompt(save, p, mode)), 900, 0.86);
      mutate((s) => { const q = s.people[id]; q.photo_portrait = { ...(q.photo_portrait ?? {}), model, week: s.arcology.week, [mode]: img, error: undefined }; });
      setShow(mode);
    } catch (e) {
      const msg = (e as Error).message;
      mutate((s) => { const q = s.people[id]; q.photo_portrait = { ...(q.photo_portrait ?? { model, week: s.arcology.week }), error: mode === "body" ? `The model wouldn't do the full body (${msg.slice(0, 160)}). The face usually works.` : msg.slice(0, 200) }; });
    }
    setBusy("");
  };

  const pic = ph?.[show] ?? ph?.face ?? ph?.body;
  return (
    <div className="mb-2">
      {/* The head crop the face portrait is made from; drawn off-screen. */}
      <div aria-hidden style={{ position: "absolute", left: -9999, top: 0, width: 320 }}><SlaveArt person={p} height={320} crop="head" animate={false} svgRef={head} /></div>
      {pic ? <img src={pic} alt={`photo of ${p.name}`} className={pic === ph?.body ? "w-full max-h-[28rem] object-contain rounded-lg mb-1.5" : "w-full max-h-72 object-cover object-top rounded-lg mb-1.5"} /> : null}
      {ph?.face && ph?.body ? (
        <div className="flex gap-1.5 mb-1.5 text-[11px]">
          <button className={show === "face" ? "acc" : "dim"} onClick={() => setShow("face")}>face</button>
          <button className={show === "body" ? "acc" : "dim"} onClick={() => setShow("body")}>full body</button>
        </div>
      ) : null}
      {model && hasApiKey() ? (
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" kind="ghost" disabled={!!busy} onClick={() => void take("face")} title="Head and shoulders, with an expression from who she is and how she feels right now">{busy === "face" ? "photographing…" : ph?.face ? "retake face photo" : "photo portrait (face)"}</Button>
          <Button size="sm" kind="ghost" disabled={!!busy} onClick={() => void take("body")} title="The whole figure. Image models often refuse this; nothing is lost if it does">{busy === "body" ? "photographing…" : ph?.body ? "retake full body" : "try full body"}</Button>
        </div>
      ) : <div className="text-[11px] dim">Set a photo model in Settings to redraw her as a photograph.</div>}
      {ph?.error ? <div className="text-[11.5px] warn mt-1">{ph.error}</div> : null}
    </div>
  );
}
