/**
 * YOUR WEEK.
 *
 * Every turn is a week, and the owner spent all of them standing in the penthouse waiting for
 * something to happen. Now you say what you're doing with it: one of three things suggested from
 * who you are and what the city needs, or your own words. It trains what it uses, the scenes that
 * week know where you've been, and with a model, something happens to you while you're at it, which
 * comes up like any other event.
 */
import type { PendingEvent, SaveState } from "./types";
import { allSkills, practise, skillsBrief } from "./player";
import { selfBrief } from "./self";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { coarsen, REGISTER_TAIL } from "./register";
import { chronicle } from "./chronicle";
import { cityProblems } from "./city";
import { DYNAMIC_EFFECTS, effectList } from "./dynamic";
import { HOUSE_STYLE, NOT_PAPERWORK } from "./prompts";
import { PLAIN_RULES } from "./style";

export interface WeekPlan { week: number; text: string; skill?: string; source: "suggested" | "own" }
export interface PlanOption { label: string; skill?: string; what: string }

/** What a week at each skill looks like, for when there's no model to suggest anything. */
const BY_SKILL: Record<string, string> = {
  trading: "Work the trading floor and the markets",
  slaving: "Spend the week training the household",
  medicine: "Work shifts at the clinic",
  engineering: "Walk the building sites with the engineers",
  hacking: "Dig through the neighbours' networks",
  command: "Drill with the guards",
  diplomacy: "Wine and dine the neighbours' envoys",
  charisma: "Hold court on the concourse",
  seduction: "Work your way through the pleasure quarter",
  intimidation: "Find someone to make an example of",
  insight: "Sit in the cafés and watch people",
};

/** Words that give away which skill a week uses, for one you typed. */
const CLUES: [RegExp, string][] = [
  [/trad|market|deal|buy|sell|invest|bank|exchange/i, "trading"],
  [/train|break|discipline|slave|household|collar/i, "slaving"],
  [/clinic|doctor|surg|medic|heal|nurse/i, "medicine"],
  [/build|engineer|construct|repair|works|plant/i, "engineering"],
  [/hack|network|comput|spy on|surveil/i, "hacking"],
  [/drill|guard|soldier|army|militia|fight|train(ing)? with/i, "command"],
  [/envoy|neighbou?r|diplomac|treaty|summit|ambassador/i, "diplomacy"],
  [/speech|crowd|court|charm|party|parties|concourse|socialis/i, "charisma"],
  [/seduc|fuck|club|brothel|pleasure|sleep with|bed/i, "seduction"],
  [/threat|intimidat|example|punish|scare|fear/i, "intimidation"],
  [/watch|listen|observe|study|read people|investigat/i, "insight"],
];

export function skillOf(s: SaveState, text: string): string | undefined {
  for (const c of s.player.custom_skills ?? []) if (c.name.toLowerCase().split(/\s+/).some((w) => w.length >= 4 && text.toLowerCase().includes(w.slice(0, Math.max(4, w.length - 2))))) return c.id;
  return CLUES.find(([re]) => re.test(text))?.[1];
}

export const planOf = (s: SaveState): WeekPlan | undefined => (s.player.plan?.week === s.arcology.week ? s.player.plan : undefined);

export function setPlan(s: SaveState, text: string, source: WeekPlan["source"], skill?: string): WeekPlan | null {
  const t = text.replace(/\s+/g, " ").trim().slice(0, 300);
  if (!t) return null;
  const plan: WeekPlan = { week: s.arcology.week, text: t, skill: skill && allSkills(s).some((k) => k.id === skill) ? skill : skillOf(s, t), source };
  s.player.plan = plan;
  return plan;
}

/** Three things to do, without a model: what you're best at, and what you're worst at. */
export function offlinePlans(s: SaveState): PlanOption[] {
  const ranked = allSkills(s).map((k) => ({ k, v: s.player.skills[k.id] ?? 0 })).sort((a, b) => b.v - a.v);
  const pick = [ranked[0], ranked[1], ranked[ranked.length - 1]].filter(Boolean);
  return pick.map(({ k }) => ({ label: BY_SKILL[k.id] ?? `Practise ${k.name}`, skill: k.id, what: k.does }));
}

const PLAN_SYSTEM = `You suggest three different ways the owner of an arcology could spend the coming week, in Free Cities, an adult game about owning an arcology where slavery is legal. Each grows out of who the owner is (WHO THE OWNER IS, their skills) and what's going on in the city right now (THE CITY). Make them concrete and specific to this week: where they'd be and what they'd be doing, never a generic category. One plays to the owner's strengths, one works on a weakness, and one is for pleasure.

Reply with JSON only: {"options":[{"label":"what the owner does this week, 5-12 words","skill":"one SKILL id it uses, or empty","what":"one sentence on what could come of it"}]}`;

/** Three suggestions for this week. With no model, or if it fails, the game's own three. */
export async function suggestPlans(s: SaveState, signal?: AbortSignal): Promise<PlanOption[]> {
  if (!modelsAvailable()) return offlinePlans(s);
  const skills = allSkills(s).map((k) => `${k.id} (${k.name}, ${Math.round(s.player.skills[k.id] ?? 0)})`).join(", ");
  const res = await call({
    system: PLAN_SYSTEM,
    user: [
      selfBrief(s), skillsBrief(s),
      `## THE CITY\nWeek ${s.arcology.week}. ¤${Math.round(s.arcology.cash).toLocaleString()} in the bank, ${Math.round(s.arcology.population).toLocaleString()} people, prosperity ${Math.round(s.arcology.prosperity)}, crime ${Math.round(s.arcology.crime)}. ${Object.values(s.people).filter((p) => p.status === "owned").length} slaves in the household.\n${cityProblems(s).map((p) => `· ${p}`).join("\n")}`,
      `SKILL ids: ${skills}`,
    ].filter(Boolean).join("\n\n"),
    model: s.models.bookkeeper_model || s.models.narrator_model, fallback: s.models.fallback_model, json: true, maxTokens: 700, temperature: 0.9, signal, tag: "plans",
  });
  const out = res.ok ? parseJson<{ options?: { label?: string; skill?: string; what?: string }[] }>(coarsen(res.text)) : null;
  const opts = (out?.options ?? []).filter((o) => o?.label).slice(0, 3).map((o) => ({ label: String(o.label).slice(0, 100), skill: allSkills(s).some((k) => k.id === o.skill) ? String(o.skill) : undefined, what: String(o.what ?? "").slice(0, 200) }));
  return opts.length >= 2 ? opts : offlinePlans(s);
}

/** For every prompt: where the owner is this week, so a scene doesn't put them somewhere else. */
export function planLine(s: SaveState): string {
  const p = planOf(s);
  return p ? `THIS WEEK THE OWNER IS: ${p.text}. Scenes this week can touch on it, and the owner isn't somewhere that contradicts it.` : "";
}

/** Weekly, at the end of the week: it trains what it used and goes in the record. Returns the
 *  report line, and keeps the plan as last week's for the event that can grow out of it. */
export function tickPlan(s: SaveState): string | null {
  const p = planOf(s);
  if (!p) return null;
  if (p.skill) practise(s, p.skill, 2.5);
  chronicle(s, { keys: ["you"], title: "your week", text: `You spent week ${p.week}: ${p.text}.` });
  s.player.last_plan = p;
  const k = allSkills(s).find((x) => x.id === p.skill);
  return `You spent the week: ${p.text}.${k ? ` Your ${k.name.toLowerCase()} came on.` : ""}`;
}

const HAPPENED_SYSTEM = `You write one event for Free Cities, an adult text game about owning an arcology where slavery is legal. It's about the OWNER, and something that happened to them while they were doing what they spent the week doing (THE OWNER'S WEEK). Somebody they met, something they found, an offer, a problem, a temptation, a fight, a fuck. Tie it to the week they actually had and the city as it is. Write one or two short paragraphs in the second person and the present tense, ending where the owner has to decide something.

Then give three or four genuinely different choices, each with an effect id from EFFECT IDS, and make at least one of them let it go.

${NOT_PAPERWORK}

${HOUSE_STYLE}

Output ONE strict JSON object and nothing else:
{"title":"2-5 words","situation":"...","options":[{"label":"what you do, 2-9 words","note":"cost or risk, a few words","effect":"effect id","value":"optional"}],"hook":"what this leaves open for later, or empty"}`;

/** Something that happened while you were at it. Null without a model, or a plan, or if it fails. */
export async function generatePlanEvent(s: SaveState, snapshot: string): Promise<PendingEvent | null> {
  const p = s.player.last_plan;
  if (!p || p.week !== s.arcology.week - 1 || !modelsAvailable()) return null;
  const res = await call({ narration: true, tag: "your week",
    system: HAPPENED_SYSTEM,
    user: [snapshot, selfBrief(s), `## THE OWNER'S WEEK\nWeek ${p.week}: ${p.text}.`, `## EFFECT IDS\n${effectList()}`, PLAIN_RULES, REGISTER_TAIL].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model, fallback: s.models.fallback_model, json: true, maxTokens: 1000, temperature: 0.95,
  });
  if (!res.ok) return null;
  const out = parseJson<{ title?: string; situation?: string; options?: { label?: string; note?: string; effect?: string; value?: string | number }[]; hook?: string }>(coarsen(res.text));
  if (!out?.situation || !Array.isArray(out.options)) return null;
  const options = out.options.filter((o) => o?.label && o.effect && DYNAMIC_EFFECTS[String(o.effect)]).slice(0, 4)
    .map((o, i) => ({ id: `d${i}:${o.effect}:${o.value ?? ""}`, label: String(o.label).slice(0, 80), note: o.note ? String(o.note).slice(0, 90) : undefined }));
  if (options.length < 2) return null;
  return {
    id: `plan-${s.arcology.week}`, kind: "dynamic", seed: String(out.situation).slice(0, 2400), options,
    week: s.arcology.week, severity: "notable",
    written: { model: res.model, title: out.title ? String(out.title).slice(0, 60) : undefined },
    hook: out.hook ? String(out.hook).slice(0, 200) : undefined,
  };
}
