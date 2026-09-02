/** STANDING ORDERS — a rule is a sentence, and it tells you who it would touch before it does.
 *
 *  Every rule renders as English, and the preview under it is a real dry run against the household
 *  as it stands right now: the same code path the week uses, with writes turned off. */
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Card, Chip, Empty, Field, Section, Sheet } from "../lib/ui";
import { EFFECT_BY_ID, FIELD_BY_ID, RULE_EFFECTS, RULE_FIELDS, describe, preview } from "../engine/rules";
import type { RuleCondition, RuleEffect, StandingOrder } from "../engine/types";
import { FACILITIES } from "../data/facilities";
import { ASSIGNMENTS } from "../data/assignments";

const OPS: RuleCondition["op"][] = ["lt", "lte", "gt", "gte", "eq", "neq"];

export default function Orders() {
  const { save, mutate } = useGame();
  const [editing, setEditing] = useState<StandingOrder | null>(null);

  return (
    <>
      <Section title="Standing orders" right={
        <Button size="sm" onClick={() => setEditing({
          id: `o-${Date.now().toString(36)}`, name: "New order", enabled: false, priority: 50,
          conditions: [{ field: "health", op: "lt", value: 0 }], effects: [{ field: "flag_review", value: "look at her" }],
        })}><Plus size={13} /> new</Button>
      }>
        {save.orders.length ? (
          <div className="space-y-2.5">
            {[...save.orders].sort((a, b) => a.priority - b.priority).map((o) => {
              const hits = preview(save, o);
              return (
                <Card key={o.id}>
                  <div className="flex items-start gap-3">
                    <button className="mt-0.5" onClick={() => mutate((s) => { const t = s.orders.find((x) => x.id === o.id); if (t) t.enabled = !t.enabled; })}>
                      <span className={`chip ${o.enabled ? "on" : ""}`}>{o.enabled ? "armed" : "off"}</span>
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px]">{o.name} <span className="dim font-mono text-[11px]">#{o.priority}</span></div>
                      <div className="font-prose text-[13px] mid mt-1">{describe(o)}</div>
                      <div className="text-[11.5px] mt-2">
                        {hits.length ? (
                          <>
                            <span className="acc">right now it would touch {hits.length}:</span>{" "}
                            <span className="dim">{hits.slice(0, 5).map((h) => `${h.person.name} (${h.changes[0] ?? "no change"})`).join(", ")}{hits.length > 5 ? "…" : ""}</span>
                          </>
                        ) : <span className="dim">nobody matches it at the moment</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button size="sm" kind="ghost" onClick={() => setEditing(structuredClone(o))}>edit</Button>
                      <Button size="sm" kind="ghost" onClick={() => mutate((s) => { s.orders = s.orders.filter((x) => x.id !== o.id); })}><Trash2 size={12} /></Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : <Empty>No standing orders. The week will do exactly what you set by hand, and nothing else.</Empty>}
      </Section>

      <Card className="text-[11.5px] dim">
        Rules run in ascending order before anything else in the week, and a later rule beats an earlier one on the same
        field. That is the only precedence law. Anybody marked exempt on their own panel is skipped entirely.
      </Card>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Edit order" wide>
        {editing ? <Editor order={editing} onChange={setEditing} onSave={() => {
          mutate((s) => {
            const idx = s.orders.findIndex((x) => x.id === editing.id);
            if (idx >= 0) s.orders[idx] = editing; else s.orders.push(editing);
          });
          setEditing(null);
        }} /> : null}
      </Sheet>
    </>
  );
}

function Editor({ order, onChange, onSave }: { order: StandingOrder; onChange: (o: StandingOrder) => void; onSave: () => void }) {
  const { save } = useGame();
  const set = (patch: Partial<StandingOrder>) => onChange({ ...order, ...patch });
  const hits = preview(save, order);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2"><Field label="Name"><input value={order.name} onChange={(e) => set({ name: e.target.value })} /></Field></div>
        <Field label="Priority"><input type="number" value={order.priority} onChange={(e) => set({ priority: Number(e.target.value) })} /></Field>
      </div>

      <Section title="When">
        <div className="space-y-2">
          {order.conditions.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select value={c.field} onChange={(e) => { const cs = [...order.conditions]; cs[i] = { ...c, field: e.target.value }; set({ conditions: cs }); }}>
                {RULE_FIELDS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              <select className="w-28" value={c.op} onChange={(e) => { const cs = [...order.conditions]; cs[i] = { ...c, op: e.target.value as RuleCondition["op"] }; set({ conditions: cs }); }}>
                {OPS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {FIELD_BY_ID[c.field]?.options ? (
                <select value={String(c.value)} onChange={(e) => { const cs = [...order.conditions]; cs[i] = { ...c, value: e.target.value }; set({ conditions: cs }); }}>
                  {FIELD_BY_ID[c.field]!.options!.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input className="w-28" value={String(c.value)} onChange={(e) => { const cs = [...order.conditions]; const v = e.target.value; cs[i] = { ...c, value: /^-?\d+$/.test(v) ? Number(v) : v }; set({ conditions: cs }); }} />
              )}
              <Button size="sm" kind="ghost" onClick={() => set({ conditions: order.conditions.filter((_, j) => j !== i) })}><Trash2 size={12} /></Button>
            </div>
          ))}
          <Button size="sm" onClick={() => set({ conditions: [...order.conditions, { field: "devotion", op: "lt", value: 0 }] })}><Plus size={12} /> condition</Button>
        </div>
      </Section>

      <Section title="Then">
        <div className="space-y-2">
          {order.effects.map((e, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select value={e.field} onChange={(ev) => { const es = [...order.effects]; es[i] = { ...e, field: ev.target.value }; set({ effects: es }); }}>
                {RULE_EFFECTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
              {e.field === "facility" ? (
                <select value={String(e.value)} onChange={(ev) => { const es = [...order.effects]; es[i] = { ...e, value: ev.target.value }; set({ effects: es }); }}>
                  <option value="">none</option>
                  {FACILITIES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              ) : e.field === "assignment" ? (
                <select value={String(e.value)} onChange={(ev) => { const es = [...order.effects]; es[i] = { ...e, value: ev.target.value }; set({ effects: es }); }}>
                  {ASSIGNMENTS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              ) : EFFECT_BY_ID[e.field]?.kind === "bool" ? (
                <select value={e.value ? "yes" : "no"} onChange={(ev) => { const es = [...order.effects]; es[i] = { ...e, value: ev.target.value === "yes" }; set({ effects: es }); }}>
                  <option value="yes">yes</option><option value="no">no</option>
                </select>
              ) : EFFECT_BY_ID[e.field]?.options ? (
                <select value={String(e.value)} onChange={(ev) => { const es = [...order.effects]; es[i] = { ...e, value: ev.target.value }; set({ effects: es }); }}>
                  {EFFECT_BY_ID[e.field]!.options!.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input value={String(e.value)} onChange={(ev) => { const es = [...order.effects]; const v = ev.target.value; es[i] = { ...e, value: /^-?\d+$/.test(v) ? Number(v) : v }; set({ effects: es }); }} />
              )}
              <Button size="sm" kind="ghost" onClick={() => set({ effects: order.effects.filter((_, j) => j !== i) })}><Trash2 size={12} /></Button>
            </div>
          ))}
          <Button size="sm" onClick={() => set({ effects: [...order.effects, { field: "flag_review", value: "look at her" } as RuleEffect] })}><Plus size={12} /> effect</Button>
        </div>
      </Section>

      <Card>
        <div className="font-prose text-[14px] mb-2">{describe(order)}</div>
        <div className="text-[12px] mid">
          {hits.length ? (
            <ul className="space-y-1">
              {hits.map((h) => <li key={h.person.id}><span className="hi">{h.person.name}</span> <span className="dim">— {h.changes.join("; ") || "nothing would change"}</span></li>)}
            </ul>
          ) : <span className="dim">Nobody matches this right now.</span>}
        </div>
      </Card>

      <div className="flex gap-2">
        <Button kind="primary" onClick={onSave}>save</Button>
        <Chip on={order.enabled} onClick={() => onChange({ ...order, enabled: !order.enabled })}>{order.enabled ? "armed" : "off"}</Chip>
      </div>
    </div>
  );
}
