/**
 * THE COURT — laws that grow out of how the city lives.
 *
 * Every four weeks the arcology's court sits. If the city has gone far enough in some direction
 * (engine/culture), somebody petitions for the law that matches it, and the case comes to you:
 * sign it, sign it with your own household exempt, veto it, or let the court decide. When the city
 * swings back, the same law comes up for repeal. The petition names what moved the city, and when
 * that was you, it says so. A case you ignore for two weeks is decided without you.
 */
import { lawPassed } from "./lawlife";
import type { SaveState } from "./types";
import { clamp } from "./psyche";
import { type Norm, cultureOf, drivers, normLine, pushNorm, registerLawPull } from "./culture";
import { LAWS, LAW_BY_ID, type LawDef } from "../data/laws";
import { customLawDef, CUSTOM_EFFECTS, type CustomLaw } from "../data/customlaws";
import { registerEvents, fireEvent, resolveEvent, type EventDef } from "./events";

export interface LawInForce { id: string; week: number; exempt?: boolean; by: "you" | "court" | "keeper" }
export interface CourtCase { week: number; law: string; kind: "enact" | "repeal"; outcome: string }
export interface CourtState { last: number; record: CourtCase[]; vetoed: Record<string, number>; vetoes: number;
  /** Laws you put before the court yourself, by week: your backing counts for 25 points of the city's opinion. */
  backed?: Record<string, number> }

for (const l of LAWS) registerLawPull(l.id, l.pull, l.name);

export function courtOf(s: SaveState): CourtState {
  return (s.court ??= { last: 0, record: [], vetoed: {}, vetoes: 0 });
}
/** Laws you wrote are registered next to the built-in ones, so everything that reads a law reads them. */
function registerCustom(s: SaveState) {
  for (const c of s.custom_laws ?? []) {
    // The registry is shared by every save in this session: re-register if a different law has the id.
    if (LAW_BY_ID[c.id] && LAW_BY_ID[c.id].name === c.name && LAW_BY_ID[c.id].text === c.text) continue;
    const def = customLawDef(c);
    LAW_BY_ID[c.id] = def;
    registerLawPull(c.id, def.pull, def.name);
    registerEvents([repealEvent(def)], true);
  }
}
export const lawsOf = (s: SaveState) => { registerCustom(s); return (s.laws ??= []); };
export const inForce = (s: SaveState, id: string) => lawsOf(s).some((l) => l.id === id);

const std = (s: SaveState, by: number) => { s.arcology.public_standing = clamp(s.arcology.public_standing + by, -10, 10); };
/** Laws you back carry your weight for twelve weeks. */
export const backedNow = (s: SaveState, id: string) => s.arcology.week - (courtOf(s).backed?.[id] ?? -99) <= 12;
const margin = (s: SaveState, l: LawDef) => (cultureOf(s).norms[l.norm] - l.at) * l.dir + (backedNow(s, l.id) ? 25 : 0);
/** How far the city is from a law, before your backing. */
export const cityMargin = (s: SaveState, l: LawDef) => (cultureOf(s).norms[l.norm] - l.at) * l.dir;
const repealMargin = (s: SaveState, l: LawDef) => (l.repealAt - cultureOf(s).norms[l.norm]) * l.dir;

export function enact(s: SaveState, l: LawDef, by: LawInForce["by"], exempt = false): string {
  const struck = lawsOf(s).filter((x) => l.opposes?.includes(x.id)).map((x) => LAW_BY_ID[x.id]?.name ?? x.id);
  s.laws = lawsOf(s).filter((x) => !l.opposes?.includes(x.id) && x.id !== l.id);
  s.laws.push({ id: l.id, week: s.arcology.week, by, exempt });
  lawPassed(s, l);
  return struck.length ? ` It replaces the ${struck.join(" and the ")}.` : "";
}

function record(s: SaveState, l: LawDef, kind: CourtCase["kind"], outcome: string) {
  const c = courtOf(s);
  if (c.backed) delete c.backed[l.id];
  c.record.push({ week: s.arcology.week, law: l.id, kind, outcome });
  if (c.record.length > 60) c.record.shift();
}

/** What the petition says moved the city: your own deeds first, if any of them did. */
function citation(s: SaveState, l: LawDef): string {
  const ds = drivers(s, l.norm, 16).filter((d) => Math.sign(d.by) === l.dir);
  const yours = ds.find((d) => d.why.startsWith("you: "));
  const top = yours ?? ds[0];
  if (!top) return "";
  return yours ? ` The petition names you: ${yours.why.slice(5).replace(/\.$/, "")}.` : ` The petition points to ${top.why}.`;
}

function enactEvent(l: LawDef): EventDef {
  return {
    id: `court_enact_${l.id}`, severity: "notable", endogenous: true,
    candidates: () => [], weight: () => 0,
    seed: (s) => `The court has a case before it. ${cap(l.petitioners)} have drafted the ${l.name}: "${l.text}"\n\nThey say the city already lives this way. ${normLine(l.norm, cultureOf(s).norms[l.norm])}${citation(s, l)}\n\nThe arcology's charter gives you the last word. If you say nothing, the court rules in two weeks.`,
    options: [
      { id: "sign", label: "Sign it into law",
        resolve: (s) => { const extra = enact(s, l, "you"); std(s, 1); s.arcology.rep += 120; record(s, l, "enact", "you signed it"); return `You sign the ${l.name}. It is read out in the civic hall the same afternoon and posted at every lift.${extra}\n\nThe petitioners are in the plaza by evening, drinking to you.`; } },
      { id: "exempt", label: "Sign it, but exempt your household", note: "citizens will talk",
        resolve: (s) => { const extra = enact(s, l, "you", true); std(s, -1); s.arcology.rep -= 60; record(s, l, "enact", "you signed it with your household exempt"); return `You sign the ${l.name} with a clause that puts the penthouse outside it. It binds every citizen in the arcology except you.${extra}\n\nThe clause is the first thing anyone reads, and it's what they talk about in the concourses.`; } },
      { id: "veto", label: "Veto it", note: "standing falls",
        resolve: (s) => {
          const c = courtOf(s);
          c.vetoed[l.id] = s.arcology.week; c.vetoes++;
          std(s, -Math.min(3, 1 + c.vetoes * 0.3));
          pushNorm(s, l.norm, -l.dir * 6, `you vetoed the ${l.name}`);
          record(s, l, "enact", "you vetoed it");
          return `You veto the ${l.name}. The court clerk reads your veto aloud to a hall full of the people who wrote it, and ${l.petitioners} walk out before he's finished.\n\nIf the city keeps living this way, they'll bring it back.`;
        } },
      { id: "court", label: "Let the court decide",
        resolve: (s) => decide(s, l) },
    ],
  };
}

function decide(s: SaveState, l: LawDef): string {
  if (margin(s, l) >= 5) {
    const extra = enact(s, l, "court");
    record(s, l, "enact", "the court passed it");
    return `The court passes the ${l.name} on a show of hands, and it's in force from Monday.${extra}\n\nNobody asks what you think of it, because you made it clear you'd let them decide.`;
  }
  courtOf(s).vetoed[l.id] = s.arcology.week - 8;
  record(s, l, "enact", "the court threw it out");
  return `The court throws out the ${l.name}, narrowly. Half the hall says the city isn't ready for it.\n\n${cap(l.petitioners)} say they'll bring it back.`;
}

function repealEvent(l: LawDef): EventDef {
  return {
    id: `court_repeal_${l.id}`, severity: "notable", endogenous: true,
    candidates: () => [], weight: () => 0,
    seed: (s) => `A petition to repeal the ${l.name} is before the court. The city doesn't live by it any more: ${normLine(l.norm, cultureOf(s).norms[l.norm]).replace(/^./, (x) => x.toLowerCase())}\n\nIf you say nothing, the court rules in two weeks.`,
    options: [
      { id: "repeal", label: "Strike it from the books",
        resolve: (s) => { s.laws = lawsOf(s).filter((x) => x.id !== l.id); std(s, 0.5); record(s, l, "repeal", "you struck it"); return `You strike the ${l.name}. The notices come down from the lifts the same night, and by the end of the week people have stopped mentioning it.`; } },
      { id: "keep", label: "Keep it by decree", note: "standing falls",
        resolve: (s) => { courtOf(s).vetoed[`repeal:${l.id}`] = s.arcology.week; std(s, -1); record(s, l, "repeal", "you kept it by decree"); return `You keep the ${l.name} by decree. It stays posted at every lift, and the city goes on ignoring it where the patrols can't see.\n\nThe petitioners will be back.`; } },
      { id: "court", label: "Let the court decide",
        resolve: (s) => {
          if (repealMargin(s, l) >= 5) { s.laws = lawsOf(s).filter((x) => x.id !== l.id); record(s, l, "repeal", "the court repealed it"); return `The court repeals the ${l.name}. The notices come down from the lifts, and a few of the people who wrote it stand in the plaza to watch.`; }
          courtOf(s).vetoed[`repeal:${l.id}`] = s.arcology.week - 6; record(s, l, "repeal", "the court kept it");
          return `The court keeps the ${l.name}, by a handful of votes. The people who wanted it gone say the city has already moved on without the law.`;
        } },
    ],
  };
}

const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

registerEvents(LAWS.flatMap((l) => [enactEvent(l), repealEvent(l)]));

/** Weekly: laws do their work; the court sits every four weeks; stale cases are decided. */
export function tickCourt(s: SaveState): string[] {
  const out: string[] = [];
  const week = s.arcology.week;
  const c = courtOf(s);

  for (const law of lawsOf(s)) {
    const def = LAW_BY_ID[law.id];
    const line = def?.weekly(s, !law.exempt);
    if (line) out.push(line);
  }

  for (const e of [...s.events]) {
    if (!e.kind.startsWith("court_") || week - e.week < 2) continue;
    const line = resolveEvent(s, e, "court");
    if (line) out.push(`You didn't answer the court. ${line.split("\n")[0]}`);
  }

  if (week - c.last < 4 || s.events.some((e) => e.kind.startsWith("court_"))) return out;
  c.last = week;
  const enactable = LAWS.filter((l) => !inForce(s, l.id) && margin(s, l) > 0 && (l.also?.(s) ?? true) && (week - (c.vetoed[l.id] ?? -99) >= 16 || backedNow(s, l.id)))
    .map((l) => ({ l, m: margin(s, l), kind: "enact" as const }));
  const repealable = lawsOf(s).map((x) => LAW_BY_ID[x.id]).filter((l): l is LawDef => !!l && repealMargin(s, l) > 0 && week - (c.vetoed[`repeal:${l.id}`] ?? -99) >= 12)
    .map((l) => ({ l, m: repealMargin(s, l), kind: "repeal" as const }));
  const pick = [...enactable, ...repealable].sort((a, b) => b.m - a.m)[0];
  if (!pick) return out;
  const e = fireEvent(s, `court_${pick.kind}_${pick.l.id}`);
  if (e) out.push(pick.kind === "enact" ? `The court has the ${pick.l.name} before it, and wants your word.` : `A petition to repeal the ${pick.l.name} is before the court.`);
  return out;
}

/** For the narrator: the laws the city lives under. */
export function lawsBrief(s: SaveState): string {
  const ls = lawsOf(s).map((x) => LAW_BY_ID[x.id]).filter(Boolean) as LawDef[];
  if (!ls.length) return "";
  return ls.map((l) => `· ${l.name}: ${l.text}${lawsOf(s).find((x) => x.id === l.id)?.exempt ? " (your household is exempt)" : ""}`).join("\n");
}


/* ── pushing it yourself ────────────────────────────────────────────────────────────────────── */

/** Put a law before the court with your name on it. It's heard at the next sitting. */
export function backLaw(s: SaveState, id: string): string {
  const l = LAW_BY_ID[id];
  if (!l || inForce(s, id)) return "";
  const c = courtOf(s);
  (c.backed ??= {})[id] = s.arcology.week;
  c.last = Math.min(c.last, s.arcology.week - 4);
  return `You put the ${l.name} before the court. It will be heard at the next sitting, with your name on the petition.`;
}

/** What decreeing a law over the court's head costs: more, the further the city is from it. */
export function decreeCost(s: SaveState, l: LawDef): { standing: number; rep: number } {
  const gap = Math.max(0, -cityMargin(s, l));
  return { standing: Math.min(4, Math.round(gap / 25)), rep: Math.round(300 + gap * 25) };
}

/** Enact it now, over the court. */
export function decreeLaw(s: SaveState, id: string): string {
  const l = LAW_BY_ID[id];
  if (!l || inForce(s, id)) return "";
  const cost = decreeCost(s, l);
  const extra = enact(s, l, "you");
  std(s, -cost.standing);
  s.arcology.rep -= cost.rep;
  pushNorm(s, l.norm, l.dir * 6, `you decreed the ${l.name}`);
  record(s, l, "enact", "you decreed it over the court");
  return `You decree the ${l.name}. It's posted at every lift by the evening.${extra}${cost.standing ? " The court takes it badly, and so do the people who didn't want it." : ""}`;
}

/** Strike it yourself. */
export function repealByDecree(s: SaveState, id: string): string {
  const l = LAW_BY_ID[id];
  if (!l || !inForce(s, id)) return "";
  s.laws = lawsOf(s).filter((x) => x.id !== id);
  const against = cityMargin(s, l) > 15;
  if (against) std(s, -1);
  s.arcology.rep -= 200;
  pushNorm(s, l.norm, -l.dir * 5, `you struck the ${l.name}`);
  record(s, l, "repeal", "you struck it by decree");
  return `You strike the ${l.name} by decree.${against ? " The city was living by it, and it notices." : ""}`;
}

/* ── laws you write ─────────────────────────────────────────────────────────────────────────── */

/** Reputation you need to write a law: more for every law of yours already in force. */
export function customLawRep(s: SaveState): number {
  const mine = (s.custom_laws ?? []).filter((c) => inForce(s, c.id)).length;
  return 2000 + mine * 1500;
}

/** What it costs, beyond the reputation you need: some of it, and standing if the city is against it. */
export function customLawCost(s: SaveState, push: CustomLaw["push"]): { rep: number; standing: number; against: Norm[] } {
  const norms = cultureOf(s).norms;
  const against = push.filter((p) => norms[p.norm] * p.dir < -30).map((p) => p.norm);
  return { rep: 600 + against.length * 400, standing: against.length, against };
}

export function writeLaw(s: SaveState, draft: { name: string; text: string; push: CustomLaw["push"]; effects: string[] }): { ok: boolean; line: string } {
  // The game says "the X Act" itself; a name that starts with "The" would read "the The".
  const name = draft.name.trim().replace(/^the\s+/i, "").slice(0, 60);
  const text = draft.text.trim().slice(0, 300);
  if (!name || !text) return { ok: false, line: "A law needs a name and something it says." };
  if (!draft.push.length && !draft.effects.length) return { ok: false, line: "Choose at least one thing it does." };
  const need = customLawRep(s);
  if (s.arcology.rep < need) return { ok: false, line: `You need ${need.toLocaleString()} reputation to write a law; you have ${Math.round(s.arcology.rep).toLocaleString()}.` };
  const cost = customLawCost(s, draft.push);
  const c: CustomLaw = { id: `custom_${s.arcology.week}_${(s.custom_laws ?? []).length}_${Date.now().toString(36)}`, name, text, push: draft.push.slice(0, 2), effects: draft.effects.filter((e) => CUSTOM_EFFECTS[e]).slice(0, 2), week: s.arcology.week };
  (s.custom_laws ??= []).push(c);
  registerCustom(s);
  const def = LAW_BY_ID[c.id];
  lawsOf(s).push({ id: c.id, week: s.arcology.week, by: "you" });
  s.arcology.rep -= cost.rep;
  std(s, -cost.standing);
  for (const p of c.push) pushNorm(s, p.norm, p.dir * 6, `you wrote the ${name}`);
  record(s, def, "enact", "you wrote it");
  lawPassed(s, def);
  return { ok: true, line: `The ${name} is law from Monday: "${text}" It's posted at every lift by the evening.${cost.standing ? " The city didn't ask for it, and it lets you know." : ""}` };
}
