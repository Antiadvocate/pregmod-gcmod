/**
 * THE DRESSING ROOM.
 *
 * Her, big, redrawn the moment anything changes; underneath, everything you can put on her or do
 * to her hair and face. Something already owned by somebody in the house costs nothing to put on
 * her; everything else is bought on the spot.
 */
import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useGame } from "../lib/game";
import { cx } from "../lib/ui";
import type { Look, Person, SaveState } from "../engine/types";
import { WARDROBE, WARDROBE_KINDS, garment, type Garment } from "../data/wardrobe";
import { registerOf } from "../engine/voice";
import { rng } from "../engine/rng";
import { POSE_BY_ID } from "../lib/rig";
import SlaveArt from "./SlaveArt";
import { RoomBackdrop } from "../lib/rooms";

export const HAIR_COLORS = ["black", "dark brown", "brown", "light brown", "auburn", "red", "strawberry blonde", "blonde", "platinum blonde", "silver", "white", "pink", "blue", "green", "purple"];
export const HAIR_STYLES: { label: string; value: string }[] = [
  { label: "Loose", value: "loose" }, { label: "Neat", value: "neat" }, { label: "Ponytail", value: "in a ponytail" },
  { label: "Pigtails", value: "in pigtails" }, { label: "Bun", value: "pinned up in a bun" }, { label: "Braid", value: "in a braid" },
  { label: "Up", value: "tied back" }, { label: "Curls", value: "curled" }, { label: "Waves", value: "in luxurious waves" },
  { label: "Perm", value: "permed" }, { label: "Top-knot", value: "in a ninja top-knot" }, { label: "Bob", value: "tucked behind her ears" },
  { label: "Afro", value: "in an afro" }, { label: "Cornrows", value: "in cornrows" }, { label: "Dreadlocks", value: "in dreadlocks" },
];
const LIPS: { label: string; hex?: string }[] = [
  { label: "her own" }, { label: "red", hex: "#b3121e" }, { label: "pink", hex: "#e05a8c" }, { label: "plum", hex: "#6e2345" },
  { label: "black", hex: "#1a1414" }, { label: "nude", hex: "#c98f7a" },
];
const DYES = ["", "dyed pink", "dyed blue", "dyed green", "dyed purple", "dyed white", "dyed black", "tiger striped"];

function ownedGarments(s: SaveState): Set<string> {
  const worn = new Set<string>();
  for (const p of Object.values(s.people)) for (const x of [p.clothes, p.collar, p.shoes, p.legwear ?? ""]) worn.add(x);
  return worn;
}

/** How she takes it, in one line. */
function reaction(p: Person, g: Garment): string {
  const r = rng(`dress:${p.id}:${g.id}`);
  const reg = registerOf(p);
  if (g.relaxation <= -0.4) return r.pick([`${p.name} hates it, and won't look in the mirror.`, `${p.name} tries to move in it, and finds she can barely move at all.`]);
  if (g.relaxation >= 0.2) return reg === "sullen" ? `${p.name} doesn't thank you, but she obviously likes it.` : r.pick([`${p.name} likes it, and smiles.`, `${p.name} admires herself in the mirror.`]);
  if (g.appeal >= 1.2) return reg === "eager" || reg === "bratty" ? `${p.name} looks at herself in it and then at you. "Well?"` : `${p.name} is a little embarrassed by how sexy it is.`;
  if (g.id === "none") return `${p.name} strips naked.`;
  return `${p.name} puts it on without comment.`;
}

type Tab = "clothes" | "extras" | "salon";

export default function Dressing({ id, onClose }: { id: string; onClose: () => void }) {
  const { save, mutate } = useGame();
  const p = save.people[id];
  const [tab, setTab] = useState<Tab>("clothes");
  const [kind, setKind] = useState<NonNullable<Garment["kind"]>>(() => garment(p?.clothes)?.kind ?? "lingerie");
  const [line, setLine] = useState("");
  const owned = useMemo(() => ownedGarments(save), [save, save.turn, save.arcology.cash]);
  if (!p) return null;

  const pay = (s: SaveState, n: number) => { s.arcology.cash -= n; };
  const wear = (g: Garment) => {
    mutate((s) => {
      const her = s.people[id];
      if (g.cost && !owned.has(g.name)) pay(s, g.cost);
      if (g.slot === "clothes") her.clothes = g.name;
      else if (g.slot === "collar") her.collar = g.name;
      else if (g.slot === "shoes") her.shoes = g.name;
      else her.legwear = g.name;
    });
    if (g.slot === "clothes") setLine(reaction(p, g));
  };
  const look = (patch: Partial<Look>, cost = 0) => mutate((s) => { const her = s.people[id]; her.look = { ...(her.look ?? {}), ...patch }; if (cost) pay(s, cost); });
  const body = (patch: Partial<Person["body"]>, cost = 0) => mutate((s) => { Object.assign(s.people[id].body, patch); if (cost) pay(s, cost); });

  const current = (slot: Garment["slot"]) => slot === "clothes" ? p.clothes : slot === "collar" ? p.collar : slot === "shoes" ? p.shoes : (p.legwear ?? "bare legs");
  const Item = ({ g }: { g: Garment }) => {
    const on = current(g.slot) === g.name || (g.id === "collar_none" && p.collar === "none") || (g.id === "shoes_none" && p.shoes === "none");
    const free = !g.cost || owned.has(g.name);
    const broke = !free && save.arcology.cash < g.cost;
    return (
      <button disabled={broke} onClick={() => wear(g)} className={cx("actbtn", on && "!border-[var(--accent-glow)] !bg-[var(--accent-soft)]", broke && "opacity-40")}>
        <span className="block text-[13px] leading-tight">{g.name}</span>
        <span className="block text-[10.5px] dim mt-0.5">{free ? (on ? "wearing" : "owned") : `¤${g.cost.toLocaleString()}`}{g.appeal >= 1.2 ? " · eye-catching" : ""}{g.relaxation <= -0.4 ? " · harsh" : g.relaxation >= 0.2 ? " · comfortable" : ""}</span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: "var(--ink-0)" }}>
      <header className="topbar flex items-center gap-2 px-2 py-2 shrink-0" style={{ paddingTop: "max(8px, env(safe-area-inset-top))" }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="back"><ChevronLeft size={18} /></button>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] truncate">Dressing {p.name}</div>
          <div className="text-[11px] dim truncate">{p.clothes}{garment(p.collar) ? ` · ${p.collar}` : ""}{garment(p.shoes) ? ` · ${p.shoes}` : ""}</div>
        </div>
        <span className="font-mono text-[12.5px] mr-2">¤{Math.round(save.arcology.cash).toLocaleString()}</span>
      </header>

      <div className="stage-room shrink-0 flex justify-center relative" style={{ height: "40dvh" }}>
        <RoomBackdrop place="dressing" />
        <div className="relative h-full"><SlaveArt person={p} height="100%" pose={POSE_BY_ID.easy} /></div>
        {line ? <div className="absolute bottom-2 left-3 right-3 text-center font-prose text-[14px] mid fade-in" key={line}>{line}</div> : null}
      </div>

      <div className="flex gap-1.5 px-3 pt-3 shrink-0">
        {(["clothes", "extras", "salon"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cx("chip !text-[12px] !py-1 !px-3", tab === t && "on")}>
            {t === "clothes" ? "Clothes" : t === "extras" ? "Collar, shoes, stockings" : "Hair and face"}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
        {tab === "clothes" ? (
          <>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
              {WARDROBE_KINDS.map((k) => (
                <button key={k.id} onClick={() => setKind(k.id)} className={cx("chip shrink-0", kind === k.id && "on")}>{k.label}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              {WARDROBE.filter((g) => g.slot === "clothes" && g.kind === kind).map((g) => <Item key={g.id} g={g} />)}
            </div>
            <div className="mt-4">
              <label className="block mb-1">Colour of what she's wearing</label>
              <input type="range" min={0} max={345} step={15} value={p.look?.clothes_hue ?? 0}
                onChange={(e) => look({ clothes_hue: Number(e.target.value) || undefined })} />
              <div className="h-2 rounded-full mt-1" style={{ background: "linear-gradient(90deg, hsl(0 60% 50%), hsl(60 60% 50%), hsl(120 60% 50%), hsl(180 60% 50%), hsl(240 60% 50%), hsl(300 60% 50%), hsl(360 60% 50%))", opacity: 0.6 }} />
            </div>
          </>
        ) : tab === "extras" ? (
          <>
            {(["collar", "shoes", "legwear"] as const).map((slot) => (
              <div key={slot} className="mb-4">
                <div className="text-[11px] uppercase tracking-wider dim mb-1.5">{slot === "legwear" ? "stockings" : slot}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {WARDROBE.filter((g) => g.slot === slot).map((g) => <Item key={g.id} g={g} />)}
                </div>
              </div>
            ))}
            <div className="text-[11px] uppercase tracking-wider dim mb-1.5">costume pieces · ¤400 each</div>
            <div className="flex flex-wrap gap-1.5">
              <button className={cx("chip", !p.look?.ears && "on")} onClick={() => look({ ears: undefined })}>no ears</button>
              {(["cat", "fox", "cow", "elf"] as const).map((e) => (
                <button key={e} className={cx("chip", p.look?.ears === e && "on")} onClick={() => look({ ears: e }, p.look?.ears === e ? 0 : 400)}>{e} ears</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button className={cx("chip", !p.look?.tail && "on")} onClick={() => look({ tail: undefined })}>no tail</button>
              {(["cat", "fox", "cow"] as const).map((t) => (
                <button key={t} className={cx("chip", p.look?.tail === t && "on")} onClick={() => look({ tail: t }, p.look?.tail === t ? 0 : 400)}>{t} tail</button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-[11px] uppercase tracking-wider dim mb-1.5">hair colour · ¤300 to dye</div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {HAIR_COLORS.map((c) => (
                <button key={c} className={cx("chip", p.body.hair_color === c && "on")} onClick={() => p.body.hair_color !== c && body({ hair_color: c }, 300)}>{c}</button>
              ))}
            </div>
            <div className="text-[11px] uppercase tracking-wider dim mb-1.5">style · ¤150</div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {HAIR_STYLES.map((h) => (
                <button key={h.value} className={cx("chip", p.body.hair_style === h.value && "on")} onClick={() => p.body.hair_style !== h.value && body({ hair_style: h.value }, 150)}>{h.label}</button>
              ))}
            </div>
            <label className="block mb-1">Length — {p.body.hair_length}cm {p.body.hair_length < 3 ? "(shaved)" : ""}</label>
            <input type="range" min={0} max={Math.max(120, p.body.hair_length)} value={p.body.hair_length}
              onChange={(e) => { const n = Number(e.target.value); if (n <= p.body.hair_length) body({ hair_length: n }); }} />
            <div className="text-[11px] dim mb-4">Cutting is instant. Growing it back takes time.</div>
            <div className="text-[11px] uppercase tracking-wider dim mb-1.5">lipstick</div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {LIPS.map((l) => (
                <button key={l.label} className={cx("chip", (p.look?.lips ?? undefined) === l.hex && "on")} onClick={() => look({ lips: l.hex })}>
                  {l.hex ? <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: l.hex }} /> : null}{l.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button className={cx("chip", p.look?.glasses && "on")} onClick={() => look({ glasses: !p.look?.glasses }, p.look?.glasses ? 0 : 200)}>glasses</button>
            </div>
            <div className="text-[11px] uppercase tracking-wider dim mb-1.5">skin dye · ¤2,000</div>
            <div className="flex flex-wrap gap-1.5">
              {DYES.map((d) => {
                const natural = p.body.skin.replace(/^(dyed \w+|tiger striped)\s*/, "") || p.body.skin;
                const on = d ? p.body.skin.startsWith(d) : !/^(dyed|tiger)/.test(p.body.skin);
                return (
                  <button key={d || "none"} className={cx("chip", on && "on")} onClick={() => !on && body({ skin: d ? `${d} ${natural}`.trim() : natural }, d ? 2000 : 0)}>
                    {d || "her own"}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
