/**
 * WHAT SHE WANTS THIS WEEK — and whether it's worth bothering you with.
 *
 * With a model on, this replaces both the stock per-slave events (the escape attempt, the
 * breakdown, the feud, the nervous request for "a warmer blanket") and the two requests a week
 * that used to arrive whether or not anybody had a reason. Instead every woman in the house is read
 * for REASONS, each one a fact the engine can point at: a friend of hers was sold this week, a law
 * that just passed says something about women like her, she was refused last week and hasn't let
 * it go, she's thirty weeks pregnant, she's afraid of you, her room is worse than everyone's, a
 * thread left open between you. Reasons add up. Only a woman with enough of them gets an event,
 * one a week at most (two if the house is boiling), and nobody twice in a row.
 *
 * The model then writes what she wants out of all that, tied to what happened this week (the
 * snapshot) and to who she was before. The engine supplies what the answers DO: granting the
 * request it found for her (if any), refusing it, and the closed effect table.
 */
import type { PendingEvent, Person, SaveState } from "./types";
import { read } from "./obedience";
import { romanceOf } from "./romance";
import { lawsOf } from "./court";
import { LAW_BY_ID } from "../data/laws";
import { openHooks } from "./chronicle";
import { comfort, roomOf } from "./rooms";
import { generateAsk, type Ask } from "./asks";
import { call, parseJson } from "../llm";
import { coarsen, REGISTER_TAIL } from "./register";
import { HOUSE_STYLE, personCard } from "./prompts";
import { PLAIN_RULES } from "./style";
import { chronicleBrief } from "./chronicle";
import { DYNAMIC_EFFECTS, effectList } from "./dynamic";
import { ACT_BY_ID } from "../data/intimacy";
import { EXTRA_BY_ID } from "../data/rooms";

export interface Reason { tag: string; why: string; weight: number; /** Happened this week, as opposed to how things have been for a while. */ fresh?: boolean }

/** Tags that are always something that just happened. */
const FRESH = new Set(["friend", "rival", "law", "standing", "room", "talk", "home", "thread"]);

/** Every reason she has to want something this week, with how much it weighs. */
export function reasonsOf(s: SaveState, p: Person): Reason[] {
  const week = s.arcology.week - 1;
  const r = read(p, s.memory[p.id]);
  const rom = romanceOf(p);
  const out: Reason[] = [];
  const log = s.event_log ?? {};
  const add = (tag: string, why: string, weight: number, fresh = FRESH.has(tag)) => {
    if (weight <= 0) return;
    // Something she's already had her say about weighs less until it changes.
    const said = log[`wanttag:${p.id}:${tag}`];
    const stale = !fresh && said !== undefined && s.arcology.week - said < 12 ? 0.35 : 1;
    out.push({ tag, why, weight: weight * stale, fresh });
  };

  // People she cares about, and people she can't stand.
  for (const e of s.edges.filter((x) => x.from === p.id)) {
    const o = s.people[e.to];
    if (!o) continue;
    if (e.warmth > 40 && o.exit_week !== undefined && o.exit_week >= week) add("friend", `${o.name}, who she's close to, was ${o.status === "dead" ? "killed or died" : o.status === "sold" ? "sold" : "let go"} this week${o.exit_note ? ` (${o.exit_note})` : ""}.`, 4.5);
    if (e.warmth > 40 && o.status === "owned" && (o.psyche.state !== "intact" || o.health.health < -30)) add("friend", `${o.name}, who she's close to, is in a bad way (${o.psyche.state !== "intact" ? o.psyche.state : "ill"}).`, 2.5, false);
    if (e.warmth < -35 && o.status === "owned" && (o.romance?.since_week ?? -9) >= week) add("rival", `${o.name}, who she can't stand, just went up in the owner's favour.`, 2.5);
    if (e.attraction > 60 && o.status === "owned") add("desire", `She wants ${o.name}, and it's getting hard to hide.`, 1.2);
  }

  // The laws, especially new ones.
  for (const x of lawsOf(s)) {
    const l = LAW_BY_ID[x.id];
    if (!l) continue;
    const fresh = x.week >= week - 1;
    const hurts = (l.pull.cruelty ?? 0) > 0 || (l.pull.personhood ?? 0) < 0;
    const helps = (l.pull.personhood ?? 0) > 0 || (l.pull.manumission ?? 0) > 0 || (l.pull.cruelty ?? 0) < 0;
    const minds = hurts ? 0.6 + p.persona.conscience + p.bond.resentment / 100 : helps ? 0.5 + p.bond.hope / 100 : 0.5;
    if (fresh) add("law", `The owner just made a law, the ${l.name}: "${l.text}" It changes something for her.`, 2.2 * minds);
  }

  // Her body and her days.
  if (p.womb.fetuses.length && p.womb.weeks >= 28) add("body", `She's ${p.womb.weeks} weeks pregnant.`, 1.8);
  if (p.health.health < -30) add("body", `She's ill (health ${p.health.health}).`, 2);
  if (p.health.energy < 15) add("body", "She's exhausted.", 1.2);
  if (p.psyche.arousal > 80) add("body", "She's been wound up for days.", 1.2 * (p.psyche.libido / 60));
  if (p.health.addiction > 40) add("body", "She's hooked on what you give her.", 1.5);

  // How she is with you.
  if (r.flight_risk > 0.3) add("flight", `She's thinking about running (risk ${Math.round(r.flight_risk * 100)}%).`, 3 + r.flight_risk * 3);
  if (p.psyche.state === "fracturing") add("breaking", "She's coming apart.", 3.5);
  if (p.bond.resentment > 60) add("anger", "She resents you, a lot, and it's near the surface.", 2.5);
  if (p.bond.hope < 15 && r.trust > -20) add("hope", "She's lost hope that anything here will get better.", 2);
  if (rom.since_week >= week && rom.standing !== "property") add("standing", `She just became your ${rom.standing}.`, 3);
  if (rom.dominion >= 40) add("standing", "She has real say over you now and uses it.", 1.5, false);
  const refused = Object.entries(p.counters).filter(([k, v]) => k.startsWith("ask_refused:") && week - v <= 2);
  if (refused.length) add("refused", "You refused her something in the last two weeks.", 1.8);

  // Where she sleeps.
  const rm = p.room ? roomOf(p) : undefined;
  if (rm?.changed !== undefined && rm.changed >= week) add("room", "Her room was just changed.", 1.5);
  const others = Object.values(s.people).filter((o) => o.status === "owned" && o.id !== p.id);
  const mean = others.length ? others.reduce((n, o) => n + comfort(o), 0) / others.length : 0;
  if (comfort(p) < mean - 3) add("room", "Her room is worse than the others', and she sees it every night.", 1.4, false);

  // What happened in the house this week that touches her.
  const about = s.rumors.filter((x) => x.about === p.id && x.week >= week);
  if (about.length) add("talk", `People are talking about her: ${about[0].content}.`, 2);
  const came = Object.values(s.people).filter((o) => o.origin.acquired_week >= week && o.status === "owned" && o.id !== p.id && o.origin.nationality === p.origin.nationality);
  if (came.length) add("home", `${came[0].name}, from ${p.origin.nationality === came[0].origin.nationality ? "her own country" : "somewhere she knows"}, just arrived in the house.`, 2.2);
  if (p.economics.weeks_owned > 0 && p.economics.weeks_owned % 52 === 0) add("home", `It's a year to the week since she was brought here.`, 2.5);

  // What the week report says happened to her, and what you did to her this week.
  const report = s.reports.at(-1);
  const mine = (report?.week === week ? report.lines : []).filter((l) => l.person === p.id && l.weight >= 4 && !/^.{0,40} wants something\.$/.test(l.text)).slice(0, 2);
  for (const l of mine) add("week", `This week: ${l.text.split(/\n/)[0].slice(0, 200)}`, 1.6 + Math.min(1.5, (l.weight - 4) / 4), true);
  const done = (s.chronicle ?? []).filter((e) => e.week >= week && e.keys.includes(p.id)).slice(-2);
  for (const e of done) add("you", `What you did with her this week: ${e.text.slice(0, 200)}`, 2, true);

  // Threads left open between you.
  for (const h of openHooks(s, [p.id]).slice(0, 2)) add("thread", `Left open from week ${h.week}: ${h.hook}`, 2.5);

  return out.sort((a, b) => b.weight - a.weight);
}

/** How much she has going on, with the cooldown: nobody carries the week two weeks running. */
export function wantScore(s: SaveState, p: Person, reasons = reasonsOf(s, p)): number {
  const last = (s.event_log ?? {})[`want:${p.id}`];
  const cool = last !== undefined && s.arcology.week - last < 4 ? 0.25 : 1;
  const voice = p.persona.attachment?.style === "anxious" ? 1.15 : p.persona.attachment?.style === "avoidant" ? 0.85 : 1;
  return reasons.reduce((n, r) => n + r.weight, 0) * cool * voice;
}

export const WANT_THRESHOLD = 6;

/** Who has enough going on to carry an event this week. Usually nobody or one; two only when the
 *  house is boiling. */
export function pickWants(s: SaveState): { p: Person; reasons: Reason[]; score: number }[] {
  const pool = Object.values(s.people)
    .filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18 && !p.governs && p.psyche.state !== "broken")
    .map((p) => { const reasons = reasonsOf(s, p); return { p, reasons, score: wantScore(s, p, reasons) }; })
    // Something has to have happened: how things have been for weeks is not, on its own, an event.
    .filter((x) => x.score >= WANT_THRESHOLD && x.reasons.length >= 2 && (x.reasons.some((r) => r.fresh) || x.score >= WANT_THRESHOLD * 1.6))
    .sort((a, b) => b.score - a.score);
  // A house that had one last week needs more to have one again.
  const last = (s.event_log ?? {})["want:last"];
  const bar = last !== undefined && s.arcology.week - last <= 1 ? WANT_THRESHOLD * 1.5 : WANT_THRESHOLD;
  const out = pool.filter((x) => x.score >= bar).slice(0, 1);
  if (out.length && pool[1] && pool[1].score >= WANT_THRESHOLD * 2) out.push(pool[1]);
  return out;
}

const WANT_SYSTEM = `You write one event for Free Cities, an adult text game about owning an arcology where slavery is legal and ordinary. It is about ONE of the owner's slaves and what SHE wants this week: to get something, stop something, change something, say something, or do something about her situation, whether by asking, bargaining, sulking, scheming, seducing, defying or running.

How to build it:
- Start from HER REASONS THIS WEEK: they are facts the game found. Pick the one or two that matter most to her and build what she wants out of them, filtered through who she is (her background, her career before, her personality, her fetishes and flaws), how she stands with the owner, and the laws she lives under.
- Tie it to THIS WEEK: something that actually happened (a person, a law, a sale, a rumour, the war, the weather) is the reason it's happening now. Name it.
- It has to make sense. A frightened slave doesn't demand; a devoted one doesn't scheme against the owner; a woman who hates a law and knows the owner wrote it handles that carefully or recklessly according to who she is.
- If ENGINE REQUEST is given, it is a concrete thing she could ask for; use it if it fits what she wants (then the "grant" and "refuse" effects do it), or ignore it.
- Second person, present tense, one or two short paragraphs, ending where the owner has to answer. Her words in her voice.

Then three or four choices for the owner, each a genuinely different response, at least one of which lets it go.

${HOUSE_STYLE}

Output ONE strict JSON object and nothing else:
{"title":"2-5 words","situation":"...","options":[{"label":"what you do, 2-9 words","note":"a few plain words for the player, like \"she won't forget it\" or \"costs you ¤2,000\"; never the effect's description","effect":"effect id","value":"optional"}],"hook":"what this leaves open for later, or empty"}`;

/** Write her event. Null when there's no model or it came back unusable. */
export async function generateWant(s: SaveState, p: Person, reasons: Reason[], snapshot: string): Promise<PendingEvent | null> {
  const ask: Ask | null = generateAsk(s, p);
  const effects = [
    ...(ask ? [`grant: give her the ENGINE REQUEST${ask.cash ? ` (costs ¤${ask.cash.toLocaleString()})` : ""}`, "refuse: say no to it", "refuse_harsh: say no, and punish her for asking"] : []),
    ...effectList().split("\n"),
  ];
  const res = await call({
    system: WANT_SYSTEM,
    user: [
      snapshot,
      `## HER\n${personCard(s, p)}`,
      chronicleBrief(s, [p.id], 8),
      `## HER REASONS THIS WEEK\n${reasons.slice(0, 6).map((r) => `· ${r.why}`).join("\n")}`,
      ask ? `## ENGINE REQUEST\n${ask.text}${ask.against ? ` (It goes against ${ask.against}, and she knows.)` : ""}` : "",
      `## EFFECT IDS\n${effects.join("\n")}\nACT IDS: ${Object.keys(ACT_BY_ID).join(", ")}\nROOM ITEM IDS: ${Object.keys(EXTRA_BY_ID).join(", ")}`,
      PLAIN_RULES,
      REGISTER_TAIL,
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 1100,
    temperature: 0.95,
  });
  if (!res.ok) return null;
  const out = parseJson<{ title?: string; situation?: string; options?: { label?: string; note?: string; effect?: string; value?: string | number }[]; hook?: string }>(coarsen(res.text));
  if (!out?.situation || !Array.isArray(out.options)) return null;
  const known = (id: string) => !!DYNAMIC_EFFECTS[id] || (!!ask && ["grant", "refuse", "refuse_harsh"].includes(id));
  const options = out.options.filter((o) => o?.label && o.effect && known(String(o.effect))).slice(0, 4)
    .map((o, i) => ({ id: `d${i}:${o.effect}:${o.value ?? ""}`, label: String(o.label).slice(0, 80), note: o.note ? String(o.note).slice(0, 90) : undefined }));
  if (options.length < 2) return null;
  const week = s.arcology.week;
  (s.event_log ??= {})[`want:${p.id}`] = week;
  s.event_log["want:last"] = week;
  for (const r of reasons) s.event_log[`wanttag:${p.id}:${r.tag}`] = week;
  return {
    id: `want-${week}-${p.id}`,
    kind: "dynamic",
    person: p.id,
    seed: String(out.situation).slice(0, 2400),
    options,
    week,
    severity: reasons.some((r) => r.tag === "flight" || r.tag === "breaking") ? "major" : "notable",
    written: { model: res.model, title: out.title ? String(out.title).slice(0, 60) : undefined },
    hook: out.hook ? String(out.hook).slice(0, 200) : undefined,
    ask: ask ?? undefined,
  };
}
