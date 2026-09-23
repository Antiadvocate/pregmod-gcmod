/**
 * YOUR BODY, SHAPED.
 *
 * The same numbers a slave has, with the same figure drawing them, redrawn as you drag. What you
 * set between your legs decides which acts are open to you and how the scenes are written.
 */
import { useMemo, useState } from "react";
import { useGame } from "../lib/game";
import { cx } from "../lib/ui";
import type { Body } from "../engine/types";
import { playerAsPerson, playerBody, describeYou, settleBody } from "../engine/you";
import { buildOf } from "../engine/build";
import { WARDROBE, WARDROBE_KINDS, type Garment } from "../data/wardrobe";
import { POSE_BY_ID } from "../lib/rig";
import SlaveArt from "./SlaveArt";
import { RoomBackdrop } from "../lib/rooms";
import { HAIR_COLORS, HAIR_STYLES } from "./Dressing";

type Tab = "shape" | "sex" | "face" | "wear";
const SKINS = ["pale", "fair", "light", "olive", "tan", "light brown", "brown", "dark brown"];
const EYES = ["brown", "hazel", "green", "blue", "grey", "amber", "black"];
const FACES: Body["face_shape"][] = ["masculine", "androgynous", "normal", "cute", "sensual", "exotic"];
const PUBIC: Body["pubic_hair"][] = ["hairless", "in a strip", "neat", "bushy", "very bushy"];

const CUP = (cc: number) => cc < 150 ? "flat" : cc < 300 ? "A" : cc < 450 ? "B" : cc < 600 ? "C" : cc < 800 ? "D" : cc < 1000 ? "DD" : cc < 1400 ? "F" : cc < 2000 ? "G–H" : "past lettering";
const HIPS = ["very narrow", "narrow", "average", "wide", "very wide", "broad as a door"];
const SHOULDERS = ["very narrow", "narrow", "average", "broad", "very broad"];
const COCK = ["", "tiny", "small", "modest", "average", "big", "huge", "enormous", "absurd"];
const BALLS = ["", "tiny", "small", "average", "big", "huge", "enormous"];

function Slider({ label, value, min, max, step = 1, word, onChange }:
  { label: string; value: number; min: number; max: number; step?: number; word: string; onChange: (n: number) => void }) {
  return (
    <label className="block mb-3">
      <div className="flex justify-between text-[12px] mb-1"><span className="mid">{label}</span><span className="hi">{word}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function Chips<T extends string>({ label, value, options, onPick, show }: { label: string; value: T; options: readonly T[]; onPick: (v: T) => void; show?: (v: T) => string }) {
  return (
    <div className="mb-3">
      <div className="text-[12px] mid mb-1">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => <button key={o} className={cx("chip !text-[12px] !py-1 !px-2.5", value === o && "on")} onClick={() => onPick(o)}>{show ? show(o) : o}</button>)}
      </div>
    </div>
  );
}

export default function YourBody() {
  const { save, mutate } = useGame();
  const [tab, setTab] = useState<Tab>("shape");
  const b = playerBody(save);
  // The save is mutated in place, so the figure is keyed on what it is drawn from, not on identity.
  const key = JSON.stringify([save.player.body, save.player.clothes, save.player.shoes, save.player.legwear, save.player.look]);
  const me = useMemo(() => playerAsPerson(save), [key]);
  const set = <K extends keyof Body>(k: K, v: Body[K]) => mutate((s) => {
    if (s.player.body.height_cm === undefined) settleBody(s);
    (s.player.body as Body)[k] = v;
  });
  const wear = (g: Garment) => mutate((s) => {
    if (g.slot === "shoes") s.player.shoes = g.name;
    else if (g.slot === "legwear") s.player.legwear = g.name;
    else if (g.slot === "clothes") s.player.clothes = g.name;
  });

  return (
    <div className="card overflow-hidden">
      <div className="stage-room flex justify-center relative" style={{ height: "46dvh", maxHeight: 460 }}>
        <RoomBackdrop place="penthouse" />
        <div className="relative h-full"><SlaveArt person={me} height="100%" pose={POSE_BY_ID.easy} face={false} /></div>
      </div>
      <div className="px-4 pt-3 text-[12.5px] mid">{describeYou(save)}.</div>
      <div className="flex gap-1.5 px-4 pt-3 flex-wrap">
        {(["shape", "sex", "face", "wear"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cx("chip !text-[12px] !py-1 !px-3", tab === t && "on")}>
            {t === "shape" ? "Shape" : t === "sex" ? "Between your legs" : t === "face" ? "Face and hair" : "What you wear"}
          </button>
        ))}
      </div>
      <div className="p-4">
        {tab === "shape" ? (
          <>
            <Slider label="Height" value={b.height_cm} min={140} max={210} word={`${b.height_cm}cm`} onChange={(n) => set("height_cm", n)} />
            <Slider label="Weight" value={b.weight} min={-100} max={100} word={`${buildOf(b.weight)}, ${b.weight_kg}kg`} onChange={(n) => set("weight", n)} />
            <Slider label="Muscle" value={b.muscle} min={-50} max={100} word={b.muscle >= 97 ? "huge" : b.muscle >= 62 ? "ripped" : b.muscle >= 30 ? "toned" : b.muscle < -20 ? "soft" : "ordinary"} onChange={(n) => set("muscle", n)} />
            <Slider label="Chest" value={b.boobs} min={0} max={4000} step={50} word={b.boobs < 150 ? "flat" : `${b.boobs}cc, ${CUP(b.boobs)}`} onChange={(n) => set("boobs", n)} />
            <Slider label="Shoulders" value={b.shoulders} min={-2} max={2} word={SHOULDERS[b.shoulders + 2]} onChange={(n) => set("shoulders", n as Body["shoulders"])} />
            <Slider label="Waist" value={b.waist} min={-100} max={100} step={5} word={b.waist < -60 ? "wasp" : b.waist < -20 ? "narrow" : b.waist > 60 ? "thick" : b.waist > 20 ? "straight" : "average"} onChange={(n) => set("waist", n)} />
            <Slider label="Hips" value={b.hips} min={-2} max={3} word={HIPS[b.hips + 2]} onChange={(n) => set("hips", n as Body["hips"])} />
            <Slider label="Ass" value={b.butt} min={1} max={8} word={["", "flat", "small", "plump", "big", "huge", "massive", "enormous", "absurd"][b.butt] ?? ""} onChange={(n) => set("butt", n)} />
          </>
        ) : tab === "sex" ? (
          <>
            <Chips label="Cock" value={b.dick ? "yes" : "no"} options={["yes", "no"] as const} onPick={(v) => { set("dick", v === "yes" ? 4 : null); set("foreskin", v === "yes" ? 2 : null); if (v === "no") set("balls", null); else if (!b.balls) set("balls", 3); }} />
            {b.dick ? <Slider label="Size" value={b.dick} min={1} max={8} word={COCK[b.dick]} onChange={(n) => set("dick", n)} /> : null}
            {b.dick ? <Chips label="Balls" value={b.balls ? "yes" : "no"} options={["yes", "no"] as const} show={(v) => v === "yes" ? "yes" : "none (you can't get anyone pregnant)"} onPick={(v) => set("balls", v === "yes" ? 3 : null)} /> : null}
            {b.dick && b.balls ? <Slider label="Balls, size" value={b.balls} min={1} max={6} word={BALLS[b.balls]} onChange={(n) => set("balls", n)} /> : null}
            {b.dick ? <Chips label="Foreskin" value={b.foreskin ? "uncut" : "cut"} options={["uncut", "cut"] as const} onPick={(v) => set("foreskin", v === "uncut" ? 2 : 0)} /> : null}
            <Chips label="Pussy" value={b.vagina !== null ? "yes" : "no"} options={["yes", "no"] as const} onPick={(v) => set("vagina", v === "yes" ? 2 : null)} />
            <Chips label="Pubic hair" value={b.pubic_hair} options={PUBIC} onPick={(v) => set("pubic_hair", v)} />
            <p className="text-[12px] dim">{b.dick ? (b.balls ? "Every act is open to you." : "No balls: you can't breed anyone, and nobody on a fucktoy or concubine job gets pregnant by you.")
              : "Without a cock, penetration is the strap-on from the drawer, and anything that needs you to come in or on her is closed."}</p>
          </>
        ) : tab === "face" ? (
          <>
            <Chips label="Face" value={b.face_shape} options={FACES} onPick={(v) => set("face_shape", v)} />
            <Chips label="Skin" value={b.skin} options={SKINS} onPick={(v) => set("skin", v)} />
            <Chips label="Eyes" value={b.eye_color} options={EYES} onPick={(v) => set("eye_color", v)} />
            <Chips label="Hair colour" value={b.hair_color} options={HAIR_COLORS} onPick={(v) => set("hair_color", v)} />
            <Chips label="Hair style" value={b.hair_style} options={HAIR_STYLES.map((h) => h.value)} show={(v) => HAIR_STYLES.find((h) => h.value === v)?.label ?? v} onPick={(v) => set("hair_style", v)} />
            <Slider label="Hair length" value={b.hair_length} min={0} max={120} word={b.hair_length < 3 ? "shaved" : `${b.hair_length}cm`} onChange={(n) => set("hair_length", n)} />
          </>
        ) : (
          <>
            {WARDROBE_KINDS.map((k) => (
              <Chips key={k.id} label={k.label} value={save.player.clothes ?? "no clothing"}
                options={WARDROBE.filter((g) => g.slot === undefined || g.slot === "clothes").filter((g) => g.kind === k.id).map((g) => g.name)}
                onPick={(v) => wear(WARDROBE.find((g) => g.name === v)!)} />
            ))}
            <Chips label="Shoes" value={save.player.shoes ?? "barefoot"} options={WARDROBE.filter((g) => g.slot === "shoes").map((g) => g.name)}
              onPick={(v) => wear(WARDROBE.find((g) => g.name === v)!)} />
            <Chips label="Legs" value={save.player.legwear ?? "bare legs"} options={WARDROBE.filter((g) => g.slot === "legwear").map((g) => g.name)}
              onPick={(v) => wear(WARDROBE.find((g) => g.name === v)!)} />
          </>
        )}
      </div>
    </div>
  );
}
