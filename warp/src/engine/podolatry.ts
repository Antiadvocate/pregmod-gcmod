/**
 * PODOLATRY IN PLAY — what the believers see you do to feet, and what the policies do each week.
 *
 * Before the doctrine exists, the movement on the concourse is a story flag (`feet_movement`, 0…100)
 * and the same acts move it. Once adopted, they move adoption instead.
 */
import type { Person, SaveState } from "./types";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { FOOT_HONOUR, FOOT_SACRILEGE, PODOLATRY } from "../data/podolatry";
import { feetOf } from "./genitals";
import { clamp } from "./psyche";
import { startRumor } from "./social";
import { applyTreatment } from "./obedience";

export function podolatry(s: SaveState) {
  return s.arcology.doctrines[PODOLATRY.id];
}

/** The believers: the doctrine's adoption once adopted, the movement's strength before. */
export function believers(s: SaveState): number {
  const d = podolatry(s);
  if (d) return d.adoption;
  const m = s.story?.flags["feet_movement"];
  return typeof m === "number" ? m : 0;
}

function move(s: SaveState, n: number): void {
  const d = podolatry(s);
  if (d) { d.adoption = clamp(+(d.adoption + n).toFixed(1), 0, 100); return; }
  const st = s.story;
  if (!st || st.flags["feet_movement"] === undefined) return;
  st.flags["feet_movement"] = clamp(Number(st.flags["feet_movement"]) + n, 0, 100);
}

/** After an act. Returns a line when the believers noticed. */
export function footAct(s: SaveState, p: Person, actId: string, pub: boolean): string | undefined {
  const b = believers(s);
  if (b <= 0) return undefined;
  const seen = pub ? 1 : 0.4;
  if (FOOT_SACRILEGE.includes(actId)) {
    move(s, -3 * seen);
    s.arcology.rep = Math.max(0, s.arcology.rep - Math.round(b * 0.6 * seen));
    const st = s.story;
    if (st) st.flags["foot_sacrilege"] = Number(st.flags["foot_sacrilege"] ?? 0) + 1;
    if (pub || b > 40) startRumor(s, `the owner caned ${p.name}'s soles`, { salience: 7, charge: -1 });
    return `The believers hear that you caned ${p.name}'s soles. That's sacrilege to them.`;
  }
  if (FOOT_HONOUR.includes(actId)) {
    move(s, 0.8 * seen);
    s.arcology.rep += Math.round(b * 0.08 * seen);
    return pub ? `The believers watching see you honour ${p.name}'s feet.` : undefined;
  }
  return undefined;
}

/** After surgery on her feet. */
export function footSurgery(s: SaveState, p: Person, procId: string): void {
  const b = believers(s);
  if (b <= 0) return;
  if (procId === "clip_tendons") {
    move(s, -10);
    s.arcology.rep = Math.max(0, s.arcology.rep - Math.round(b * 2));
    startRumor(s, `the owner had ${p.name}'s tendons clipped`, { salience: 9, charge: -1 });
  } else if (procId === "repair_tendons") {
    move(s, 4);
    s.arcology.rep += Math.round(b * 0.5);
  }
}

/** Weekly: the policies. */
export function tickPodolatry(s: SaveState): { cash: number; rep: number; lines: string[] } {
  const d = podolatry(s);
  const out = { cash: 0, rep: 0, lines: [] as string[] };
  if (!d || !DOCTRINE_BY_ID[PODOLATRY.id]) return out;
  const owned = Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);
  const week = s.arcology.week;
  if (d.policies["barefoot_law"]) {
    let shod = 0;
    for (const p of owned) if (p.shoes && p.shoes !== "barefoot" && p.shoes !== "none") { p.shoes = "barefoot"; shod++; }
    if (shod) out.lines.push(`Under the barefoot law, ${shod === 1 ? "one of your slaves had her shoes taken" : `${shod} of your slaves had their shoes taken`}.`);
  }
  if (d.policies["pedicure_rite"]) {
    out.cash -= owned.length * 60;
    for (const p of owned) {
      const f = feetOf(p);
      if (f.soles === "calloused") f.soles = "normal";
      else if (f.soles === "normal" && (week + p.id.length) % 3 === 0) f.soles = "soft";
      if (f.toenails === "bare") f.toenails = ["red", "pale pink", "gold", "deep purple"][(week + p.id.length) % 4];
      p.psyche.relaxation = clamp(p.psyche.relaxation + 0.3, -10, 10);
    }
  }
  if (d.policies["foot_tithe"]) {
    let take = 0;
    for (const p of owned) {
      const f = feetOf(p);
      if (p.health.recovery_weeks > 0) continue;
      const worth = (f.soles === "soft" ? 90 : f.soles === "normal" ? 50 : 20) + (f.toenails !== "bare" ? 20 : 0) + (f.heels_clipped ? -40 : 0);
      take += Math.max(0, Math.round(worth * (d.adoption / 60) * Math.min(2, s.arcology.population / 1200)));
      // Having strangers kneel to her every day does something to a woman.
      if (p.bond.fear > 50) applyTreatment(p, { kind: "recognition", size: 1, why: "citizens kneel to kiss her feet on the concourse" }, week);
      else p.psyche.relaxation = clamp(p.psyche.relaxation + 0.2, -10, 10);
    }
    out.cash += take;
    if (take) out.lines.push(`Citizens paid ¤${take.toLocaleString()} in the tithe of kisses this week.`);
  }
  return out;
}
