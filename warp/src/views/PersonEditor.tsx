/**
 * THE FULL EDITOR — every field on a slave, for the Cheats screen.
 *
 * It walks the person record itself rather than listing fields by hand, so anything the engine
 * adds later shows up here without anyone remembering to wire it. Fields with a fixed set of values
 * get a dropdown; nullable organs get a "none" button; lists can be added to and trimmed; and the
 * raw JSON of the whole record (and her memory) is there for anything the form can't express.
 */
import { useMemo, useState } from "react";
import type { Person, SaveState } from "../engine/types";
import { useGame } from "../lib/game";
import { Button, Card } from "../lib/ui";
import { ASSIGNMENTS } from "../data/assignments";
import { FETISHES, QUIRKS, FLAWS } from "../data/intimacy";
import { NATIONS } from "../data/people";
import { refresh } from "../engine/obedience";
import { feetOf } from "../engine/genitals";
import { romanceOf } from "../engine/romance";

type Path = (string | number)[];

/** Keyed by the path with array indices replaced by "*". */
const ENUMS: Record<string, readonly (string | number)[]> = {
  status: ["owned", "indentured", "free", "sold", "dead"],
  pronouns: ["she/her", "he/him", "they/them"],
  assignment: ASSIGNMENTS.map((a) => a.id),
  "origin.nationality": NATIONS.map((n) => n.name),
  "body.face_shape": ["masculine", "androgynous", "normal", "cute", "sensual", "exotic"],
  "body.nipples": ["tiny", "cute", "puffy", "inverted", "partially inverted", "huge", "flat", "fuckable"],
  "body.pubic_hair": ["hairless", "waxed", "in a strip", "neat", "bushy", "very bushy"],
  "body.eyes": ["normal", "nearsighted", "blind", "prosthetic"],
  "body.ears": ["normal", "hard of hearing", "deaf", "prosthetic"],
  "body.teeth": ["normal", "crooked", "gapped", "fixed", "removable", "pointy", "baleen"],
  "body.voice": [0, 1, 2, 3],
  "body.hips": [-2, -1, 0, 1, 2, 3],
  "body.shoulders": [-2, -1, 0, 1, 2],
  "body.areolae": [0, 1, 2, 3, 4],
  "body.labia": [0, 1, 2, 3],
  "body.vagina_lube": [0, 1, 2],
  "body.prostate": [0, 1, 2, 3],
  "body.lactation": [0, 1, 2],
  "body.feet.arch": ["flat", "normal", "high"],
  "body.feet.soles": ["soft", "normal", "calloused"],
  "body.feet.ticklish": [0, 1, 2, 3],
  "psyche.state": ["intact", "fracturing", "broken"],
  "psyche.break_mode": ["dissociative", "fawning", "mirror", "fractured"],
  "persona.attachment.style": ["secure", "anxious", "avoidant", "disorganized"],
  "persona.intelligence": ["impaired", "slow", "average", "sharp", "brilliant"],
  "persona.attracted_to": ["women", "men", "anyone", "no one"],
  "persona.fetishes.*.name": FETISHES.map((f) => f.id),
  "persona.quirk.id": QUIRKS.map((q) => q.id),
  "persona.flaw.id": FLAWS.map((f) => f.id),
  "persona.paraphilia": ["abusive", "anal addict", "attention whore", "breast growth", "breeder", "cum addict", "malicious", "neglectful", "self hating"],
  "health.illness": [0, 1, 2, 3, 4, 5],
  "health.curatives": [0, 1, 2],
  "health.aphrodisiacs": [0, 1, 2, 3],
  "health.diet": ["healthy", "restricted", "fattening", "muscle building", "slimming", "cleansing", "XX", "XY", "XXY"],
  "fame.prestige": [0, 1, 2, 3],
  "romance.standing": ["property", "favourite", "kept", "courted", "betrothed", "wife", "keeper"],
};

/** Fields that mean "absent" when null, and what "present" starts at. */
const NULLABLE: Record<string, number> = { "body.dick": 3, "body.balls": 3, "body.vagina": 1, "body.foreskin": 3 };

/** Blank items for the lists you can add to. */
const TEMPLATES: Record<string, () => unknown> = {
  "persona.fetishes": () => ({ name: "submissive", strength: 50, known: true }),
  "persona.core_traits": () => "",
  "persona.values": () => "",
  "persona.texture": () => "",
  "body.marks": () => ({ kind: "tattoo", where: "lower back", what: "a tattoo", week: 0 }),
  "health.injuries": () => ({ what: "an injury", severity: "minor", week: 0 }),
  "health.drugs": () => "female hormones",
  "psyche.active_states": () => "",
  "body.feet.jewelry": () => "an anklet",
};

/** Optional records and what adding one starts as. */
const OPTIONAL: Record<string, () => unknown> = {
  "persona.quirk": () => ({ id: "romantic", known: true }),
  "persona.flaw": () => ({ id: "hates anal", known: true, worn: 0 }),
  "persona.paraphilia": () => "cum addict",
};

/** Things that are not hers to edit here, or that break the save if touched. */
const SKIP = new Set(["id", "portrait_url", "visual_signature"]);

const keyOf = (path: Path) => path.map((p) => (typeof p === "number" ? "*" : p)).join(".");

function getAt(obj: unknown, path: Path): unknown {
  let o = obj as Record<string | number, unknown>;
  for (const k of path) { if (o == null) return undefined; o = o[k] as Record<string | number, unknown>; }
  return o;
}
function setAt(obj: unknown, path: Path, value: unknown): void {
  let o = obj as Record<string | number, unknown>;
  for (const k of path.slice(0, -1)) {
    if (o[k] == null) o[k] = typeof path[path.indexOf(k) + 1] === "number" ? [] : {};
    o = o[k] as Record<string | number, unknown>;
  }
  o[path[path.length - 1]] = value;
}

export default function PersonEditor({ target }: { target: Person }) {
  const { save, mutate } = useGame();
  const [filter, setFilter] = useState("");
  const [raw, setRaw] = useState<string | null>(null);
  const [rawMem, setRawMem] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const id = target.id;
  // Old saves: make sure the records the editor walks exist.
  feetOf(target);
  romanceOf(target);
  // Optional parts she may not have yet, listed so they can be added.
  for (const k of ["quirk", "flaw", "paraphilia"] as const) if (!(k in target.persona)) (target.persona as unknown as Record<string, unknown>)[k] = undefined;

  const write = (path: Path, value: unknown) => mutate((s: SaveState) => {
    const p = s.people[id];
    setAt(p, path, value);
    refresh(p, s.memory[p.id]);
  });

  const needle = filter.trim().toLowerCase();
  const matches = (path: Path) => !needle || keyOf(path).toLowerCase().includes(needle);

  return (
    <Card>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <input className="flex-1 min-w-[180px]" placeholder="find a field (e.g. dick, fetish, devotion, feet)…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <Button size="sm" kind="ghost" onClick={() => { setRaw(raw === null ? JSON.stringify(target, null, 2) : null); setErr(""); }}>{raw === null ? "raw JSON" : "close JSON"}</Button>
        <Button size="sm" kind="ghost" onClick={() => { setRawMem(rawMem === null ? JSON.stringify(save.memory[id] ?? {}, null, 2) : null); setErr(""); }}>{rawMem === null ? "memory JSON" : "close memory"}</Button>
      </div>
      {err ? <div className="text-[12px] bad mb-2">{err}</div> : null}

      {raw !== null ? (
        <div className="mb-4">
          <textarea className="w-full font-mono text-[11px]" rows={18} value={raw} onChange={(e) => setRaw(e.target.value)} />
          <Button size="sm" className="mt-1" onClick={() => {
            try {
              const next = JSON.parse(raw) as Person;
              mutate((s) => { s.people[id] = { ...next, id }; refresh(s.people[id], s.memory[id]); });
              setErr(""); setRaw(null);
            } catch (e) { setErr(`Not valid JSON: ${(e as Error).message}`); }
          }}>apply JSON</Button>
        </div>
      ) : null}
      {rawMem !== null ? (
        <div className="mb-4">
          <textarea className="w-full font-mono text-[11px]" rows={12} value={rawMem} onChange={(e) => setRawMem(e.target.value)} />
          <Button size="sm" className="mt-1" onClick={() => {
            try { const next = JSON.parse(rawMem); mutate((s) => { s.memory[id] = next; }); setErr(""); setRawMem(null); }
            catch (e) { setErr(`Not valid JSON: ${(e as Error).message}`); }
          }}>apply memory</Button>
        </div>
      ) : null}

      <Node value={target} path={[]} write={write} matches={matches} open={!!needle} />
    </Card>
  );
}

function Node({ value, path, write, matches, open }: {
  value: unknown; path: Path; write: (p: Path, v: unknown) => void; matches: (p: Path) => boolean; open: boolean;
}) {
  const key = keyOf(path);
  const name = String(path[path.length - 1] ?? "");

  // Objects and arrays: a collapsible group.
  if (value && typeof value === "object") {
    const entries: [string | number, unknown][] = Array.isArray(value) ? value.map((v, i) => [i, v]) : Object.entries(value);
    const children = entries.filter(([k]) => !SKIP.has(String(k)));
    const anyMatch = open ? deepMatch(value, path, matches) : true;
    if (!anyMatch) return null;
    const body = (
      <div className={path.length ? "pl-3 border-l ml-1" : ""} style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {Array.isArray(value) && value.every((v) => typeof v !== "object") ? (
          <Leaf label={name} path={path} value={value.join(", ")} kind="list" write={write} />
        ) : children.map(([k, v]) => (
          <div key={String(k)} className="flex items-start gap-1">
            <div className="flex-1 min-w-0"><Node value={v} path={[...path, k]} write={write} matches={matches} open={open} /></div>
            {Array.isArray(value) ? <button className="chip bad mt-1" onClick={() => write(path, value.filter((_, i) => i !== k))}>×</button> : null}
          </div>
        ))}
        {Array.isArray(value) && TEMPLATES[key] ? (
          <button className="chip mt-1" onClick={() => write(path, [...value, TEMPLATES[key]()])}>+ add</button>
        ) : null}
      </div>
    );
    if (!path.length) return body;
    return (
      <details open={open || path.length === 1 && ["body", "persona"].includes(name)} className="my-1">
        <summary className="cursor-pointer text-[12px] uppercase tracking-wider dim">
          {name}
          {OPTIONAL[key] ? <button className="chip bad ml-2" onClick={(e) => { e.preventDefault(); write(path, undefined); }}>remove</button> : null}
        </summary>
        {body}
      </details>
    );
  }

  if (!matches(path) && !(value === null && NULLABLE[key] !== undefined && matches(path))) return null;
  if (value === null || value === undefined) {
    return (
      <div className="flex items-center gap-2 py-0.5">
        <span className="text-[12px] w-40 shrink-0 dim">{name}</span>
        <span className="text-[12px] dim">none</span>
        {NULLABLE[key] !== undefined || ENUMS[key] || OPTIONAL[key] ? (
          <button className="chip" onClick={() => write(path, OPTIONAL[key] ? OPTIONAL[key]() : NULLABLE[key] ?? ENUMS[key][0])}>add</button>
        ) : null}
      </div>
    );
  }
  return <Leaf label={name} path={path} value={value} kind={typeof value === "boolean" ? "bool" : typeof value === "number" ? "number" : "text"} write={write} />;
}

function deepMatch(value: unknown, path: Path, matches: (p: Path) => boolean): boolean {
  if (matches(path)) return true;
  if (value && typeof value === "object") {
    const entries: [string | number, unknown][] = Array.isArray(value) ? value.map((v, i) => [i, v]) : Object.entries(value);
    return entries.some(([k, v]) => deepMatch(v, [...path, k], matches));
  }
  return false;
}

function Leaf({ label, path, value, kind, write }: {
  label: string; path: Path; value: unknown; kind: "bool" | "number" | "text" | "list"; write: (p: Path, v: unknown) => void;
}) {
  const key = keyOf(path);
  const options = ENUMS[key];
  const nullable = NULLABLE[key] !== undefined;
  const [draft, setDraft] = useState<string | null>(null);
  const shown = useMemo(() => (draft ?? String(value)), [draft, value]);

  let input;
  if (kind === "bool") {
    input = <input type="checkbox" checked={!!value} onChange={(e) => write(path, e.target.checked)} />;
  } else if (options) {
    input = (
      <select value={String(value)} onChange={(e) => write(path, typeof options[0] === "number" ? Number(e.target.value) : e.target.value)}>
        {!options.map(String).includes(String(value)) ? <option value={String(value)}>{String(value)}</option> : null}
        {options.map((o) => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
      </select>
    );
  } else {
    input = (
      <input
        type={kind === "number" ? "number" : "text"}
        step="any"
        value={shown}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft === null) return;
          if (kind === "number") { const n = Number(draft); if (Number.isFinite(n)) write(path, n); }
          else if (kind === "list") write(path, draft.split(",").map((x) => x.trim()).filter(Boolean));
          else write(path, draft);
          setDraft(null);
        }}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      />
    );
  }
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-[12px] w-40 shrink-0 truncate" title={key}>{label}</span>
      <div className="flex-1 min-w-0">{input}</div>
      {nullable ? <button className="chip" onClick={() => write(path, null)}>none</button> : null}
    </div>
  );
}
