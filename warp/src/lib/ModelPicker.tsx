/** A dropdown over the live model lists: OpenRouter's catalogue, and the local server's when one
 *  is set. The search box narrows the list; whatever id the save already holds stays selectable
 *  even if the catalogue no longer carries it. */
import { useMemo, useState } from "react";
import type { ModelInfo } from "../llm";

function label(m: ModelInfo): string {
  if (m.local) return m.name;
  const price = m.price_in === undefined ? "" : m.price_in === 0 && m.price_out === 0 ? " · free" : ` · $${m.price_in}/$${m.price_out} per M`;
  const ctx = m.context ? ` · ${Math.round(m.context / 1000)}k` : "";
  return `${m.name}${price}${ctx}`;
}

export default function ModelPicker({ value, models, onChange }: { value: string; models: ModelInfo[]; onChange: (id: string) => void }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const hit = needle ? models.filter((m) => m.id.toLowerCase().includes(needle) || m.name.toLowerCase().includes(needle)) : models;
    return hit.slice(0, 400);
  }, [q, models]);
  const groups = useMemo(() => {
    const out = new Map<string, ModelInfo[]>();
    for (const m of shown) {
      const g = m.local ? "Local server" : m.id.split("/")[0];
      if (!out.has(g)) out.set(g, []);
      out.get(g)!.push(m);
    }
    return [...out.entries()];
  }, [shown]);
  const known = models.some((m) => m.id === value);

  return (
    <div className="space-y-1.5">
      <input value={q} placeholder="search models…" onChange={(e) => setQ(e.target.value)} />
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {!known && value ? <option value={value}>{value} (current)</option> : null}
        {!value ? <option value="">— choose a model —</option> : null}
        {groups.map(([g, ms]) => (
          <optgroup key={g} label={g}>
            {ms.map((m) => <option key={m.id} value={m.id}>{label(m)}</option>)}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
