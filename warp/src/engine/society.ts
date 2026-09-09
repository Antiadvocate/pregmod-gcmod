/**
 * DOCTRINE — one scoring function instead of eleven thousand conditionals.
 *
 * Every adopted doctrine wants people to be a certain way along nine shared axes (data/doctrines.ts).
 * Every person has a position on those axes, computed here from their body, their life and their
 * week. The dot product of the two is how well that person serves that doctrine, and the sum over
 * adopted doctrines is what they do to your reputation.
 *
 * The reason this is worth doing is not compactness, it is EXPLICABILITY. `explainFor` can hand
 * the player a sentence per doctrine — "Slimness Enthusiasm: she is well past what your citizens
 * consider a body (−0.7)" — which the old game could not do at any price, because the judgement
 * did not exist in one place to be reported from.
 */
import type { Person, SaveState } from "./types";
import { DOCTRINES, DOCTRINE_BY_ID, AXIS_LABEL, conflictsWith, type Axis, type Doctrine } from "../data/doctrines";
import { clamp } from "./psyche";

export type AxisVector = Record<Axis, number>;

/** Where this person sits on each axis, −1 … +1. */
export function axesOf(p: Person): AxisVector {
  const b = p.body;
  const mods = b.marks.filter((m) => m.kind === "implant" || m.kind === "prosthetic").length
    + (b.boob_implant > 0 ? 2 : 0) + (b.butt_implant > 0 ? 1 : 0) + (b.belly_implant > 0 ? 1 : 0)
    + b.marks.filter((m) => m.kind === "tattoo" || m.kind === "piercing").length * 0.4;

  const intelligenceScore = { impaired: -1, slow: -0.5, average: 0, sharp: 0.6, brilliant: 1 }[p.persona.intelligence];

  const hasDick = b.dick !== null && b.dick > 0;
  const hasVagina = b.vagina !== null;
  const gender = hasDick && hasVagina ? 1 : hasDick && p.pronouns === "she/her" ? 0.8 : hasVagina ? -0.6 : 0;

  const bearing = p.womb.fetuses.length ? 1 : p.womb.births > 0 ? 0.5 : 0;
  const barred = p.chastity.vagina || p.womb.sterile || p.womb.contraceptives ? -0.8 : 0;

  const quality = clamp(
    p.health.health / 120 + p.psyche.relaxation / 14 + (p.bond.read.trust ?? 0) / 220
    - (p.assignment === "be confined in the arcade" ? 0.9 : 0)
    - (p.assignment === "be confined in the cellblock" ? 0.6 : 0), -1, 1);

  return {
    age: clamp((p.physical_age - 25) / 14, -1, 1),
    height: clamp((b.height_cm - 165) / 18, -1, 1),
    weight: clamp(b.weight / 55, -1, 1),
    modification: clamp(mods / 5 - 0.35, -1, 1),
    assets: clamp((b.boobs - 500) / 900 * 0.6 + (b.butt - 3) / 5 * 0.4, -1, 1),
    intelligence: clamp(intelligenceScore * 0.6 + (p.persona.education - 50) / 90, -1, 1),
    gender,
    breeding: clamp(bearing + barred, -1, 1),
    quality,
  };
}

/** −1 … +1: how well this person serves this doctrine. Indifferent axes contribute nothing, so a
 *  doctrine that cares about one thing judges on that one thing and is not diluted. */
export function scoreFor(p: Person, d: Doctrine, ax = axesOf(p)): number {
  const keys = Object.keys(d.wants) as Axis[];
  if (!keys.length) return 0;
  let sum = 0, weight = 0;
  for (const k of keys) {
    const want = d.wants[k]!;
    sum += want * ax[k] * Math.abs(want);
    weight += Math.abs(want) * Math.abs(want);
  }
  return weight ? clamp(sum / weight, -1, 1) : 0;
}

/** The whole household's standing with the doctrines you have actually adopted. */
export function societyScore(state: SaveState, p: Person): { total: number; per: { id: string; score: number; adoption: number }[] } {
  const ax = axesOf(p);
  const per: { id: string; score: number; adoption: number }[] = [];
  let total = 0;
  for (const [id, st] of Object.entries(state.arcology.doctrines)) {
    const d = DOCTRINE_BY_ID[id];
    if (!d || st.adoption <= 0) continue;
    const s = scoreFor(p, d, ax);
    per.push({ id, score: +s.toFixed(2), adoption: st.adoption });
    total += s * (st.adoption / 100);
  }
  return { total: +total.toFixed(3), per };
}

/** The sentence per doctrine. This is the feature. */
export function explainFor(state: SaveState, p: Person): string[] {
  const { per } = societyScore(state, p);
  const ax = axesOf(p);
  const out: string[] = [];
  for (const row of per.sort((a, b) => Math.abs(b.score) - Math.abs(a.score))) {
    const d = DOCTRINE_BY_ID[row.id];
    if (Math.abs(row.score) < 0.12) continue;
    const axis = (Object.keys(d.wants) as Axis[]).sort((a, b) => Math.abs(d.wants[b]!) - Math.abs(d.wants[a]!))[0];
    const [low, high] = AXIS_LABEL[axis];
    const wants = d.wants[axis]! > 0 ? high : low;
    const isPos = row.score > 0;
    out.push(`${d.noun}: wants ${wants}; ${isPos ? "she is" : "she is not"} (${row.score > 0 ? "+" : ""}${row.score.toFixed(2)})`);
  }
  return out;
}

/** WEEKLY DOCTRINE PASS. Adoption moves toward what the household actually looks like — you do not
 *  legislate a culture, you demonstrate one — and pays or costs on the way. */
export function tickSociety(state: SaveState): { rep: number; cash: number; lines: string[] } {
  const arc = state.arcology;
  const owned = Object.values(state.people).filter((p) => p.status === "owned" || p.status === "indentured");
  const lines: string[] = [];
  let rep = 0, cash = 0;

  for (const [id, st] of Object.entries(arc.doctrines)) {
    const d = DOCTRINE_BY_ID[id];
    if (!d) continue;
    const scores = owned.map((p) => scoreFor(p, d));
    const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Adoption chases the demonstration, slowly. A doctrine nobody in your household embodies
    // slides back however many speeches you make.
    const target = clamp(50 + mean * 60 + (st.decoration * 6) + (st.research ? 10 : 0), 0, 100);
    const before = st.adoption;
    st.adoption = clamp(+(st.adoption + (target - st.adoption) * 0.12).toFixed(1), 0, 100);

    const share = st.adoption / 100;
    const popScale = clamp(arc.population / 1200, 0.4, 2.2);
    rep += Math.round(d.rep * share * popScale * (0.4 + mean * 0.6 + 0.4));
    cash += Math.round(d.cash * share * popScale);

    if (st.adoption >= 90 && before < 90) lines.push(`${d.noun} is now culturally established. Your citizens have stopped arguing about it.`);
    if (st.adoption <= 10 && before > 10) lines.push(`${d.noun} has collapsed to nothing. Nobody in your arcology is living it.`);
    if (mean < -0.3 && st.adoption > 40) lines.push(`${d.noun} is losing ground: your household is the argument against it.`);
  }
  return { rep, cash, lines };
}

export function adoptDoctrine(state: SaveState, id: string): { ok: boolean; why?: string } {
  const d = DOCTRINE_BY_ID[id];
  if (!d) return { ok: false, why: "no such doctrine" };
  if (state.arcology.doctrines[id]) return { ok: false, why: "already adopted" };
  const clash = conflictsWith(id).find((c) => state.arcology.doctrines[c]);
  if (clash) return { ok: false, why: `${DOCTRINE_BY_ID[clash].noun} says otherwise, and both cannot be true at once` };
  const adopted = Object.keys(state.arcology.doctrines).length;
  if (adopted >= 4) return { ok: false, why: "four doctrines is as much as any population will hold at once" };
  state.arcology.doctrines[id] = { adoption: 5, decoration: 0, research: false, policies: {}, adopted_week: state.arcology.week };
  return { ok: true };
}

export function abandonDoctrine(state: SaveState, id: string): void {
  delete state.arcology.doctrines[id];
}

export const ALL_DOCTRINES = DOCTRINES;
