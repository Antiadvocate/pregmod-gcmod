/**
 * THIS WEEK, AS IT HAPPENED — one picture of the week that just ended, for every prompt that has
 * to tie something to it.
 *
 * An event that could have happened any week is filler. Everything the model writes after a week
 * (what a woman wants, a governor's letter, a law line, the rewrite of a world event) gets this
 * snapshot and is told to hang what it writes on something in it: who arrived, who was sold or
 * died, the law that passed, the rumour going round, the war, the weather, the city she governs.
 */
import type { SaveState, WeekReport } from "./types";
import { lawsOf } from "./court";
import { LAW_BY_ID } from "../data/laws";
import { activeWars } from "./war";
import { activeGovernors } from "./governor";
import { worldBrief } from "./world";

/** The week that just ended is the arcology's week minus one: endWeek has already moved the clock. */
export function weekSnapshot(s: SaveState, report?: WeekReport | null): string {
  const week = s.arcology.week - 1;
  const out: string[] = [];
  const lines = (report?.lines ?? [])
    .filter((l) => l.weight >= 5 && !l.facility?.startsWith("law:"))
    .slice(0, 12)
    .map((l) => `· ${l.text.split(/\n/)[0].slice(0, 220)}`);
  if (lines.length) out.push(`WHAT HAPPENED IN THE ARCOLOGY:\n${lines.join("\n")}`);

  const came = Object.values(s.people).filter((p) => p.origin.acquired_week >= week && p.status === "owned");
  if (came.length) out.push(`NEW IN THE HOUSE: ${came.map((p) => `${p.name} (${p.origin.nationality}, was a ${p.origin.career}, ${p.origin.acquired_how})`).join(", ")}.`);
  const gone = Object.values(s.people).filter((p) => p.exit_week !== undefined && p.exit_week >= week);
  if (gone.length) out.push(`GONE FROM THE HOUSE: ${gone.map((p) => `${p.name}, ${p.status}${p.exit_note ? ` (${p.exit_note})` : ""}`).join(", ")}.`);

  const laws = lawsOf(s).filter((x) => x.week >= week - 1).map((x) => LAW_BY_ID[x.id]).filter(Boolean);
  if (laws.length) out.push(`NEW LAWS: ${laws.map((l) => `the ${l.name}: "${l.text}"`).join(" | ")}`);

  const talk = s.rumors.filter((r) => r.week >= week).sort((a, b) => b.salience - a.salience).slice(0, 5);
  if (talk.length) out.push(`WHAT PEOPLE ARE SAYING: ${talk.map((r) => r.content).join(" | ")}`);

  const wars = activeWars(s);
  if (wars.length) out.push(`AT WAR WITH: ${wars.map((w) => `${w.name} (${w.weeks} weeks, ${w.front > 20 ? "winning" : w.front < -20 ? "losing" : "stalemate"})`).join(", ")}.`);

  const govs = activeGovernors(s);
  if (govs.length) out.push(`CITIES YOUR WOMEN RUN: ${govs.map((g) => `${g.name}, run by ${s.people[g.person]?.name}${g.problems?.length ? ` (trouble with ${g.problems.map((x) => x.text).join(", ")})` : ""}`).join(" | ")}`);

  const done = (s.chronicle ?? []).filter((e) => e.week >= week).slice(-8);
  if (done.length) out.push(`WHAT THE OWNER DID THIS WEEK: ${done.map((e) => e.text.slice(0, 180)).join(" | ")}`);

  const world = worldBrief(s);
  if (world) out.push(`OUTSIDE: ${world.replace(/\n/g, " ")}`);
  return `## THIS WEEK (week ${week})\n${out.join("\n")}`;
}

/**
 * WHAT ELSE IS GOING ON. An event about one corner of the arcology (a woman and her tailor, two of
 * your girls in the laundry) used to be written as if nothing else had happened: the owner could
 * level half the city and the next scene at the silk shop carried on about a dress. This is the rest
 * of the world over the last few weeks, as one list, for every writer that works on one thread:
 * what the owner did, what happened to the city, the stories running, what people are saying.
 *
 * With `since`, it's what happened after a scene was last played, so a scene picked up again weeks
 * later starts from where things stand now and not from where it stopped.
 */
export function aroundBrief(s: SaveState, opts: { since?: number; scene?: string } = {}): string {
  const week = s.arcology.week;
  const since = opts.since ?? week - 3;
  const items: { week: number; text: string }[] = [];
  for (const e of s.chronicle ?? []) if (e.week >= since) items.push({ week: e.week, text: e.text });
  for (const d of s.deeds ?? []) if (d.public && d.week >= since && !items.some((x) => x.text === d.summary)) items.push({ week: d.week, text: `${d.summary} (everyone knows)` });
  for (const h of s.world?.headlines ?? []) if (h.week >= since) items.push({ week: h.week, text: `News: ${h.text}` });
  for (const r of s.reports ?? []) if (r.week >= since) for (const l of r.lines) if (l.weight >= 7 && !l.facility?.startsWith("law:")) items.push({ week: r.week, text: l.text.split(/\n/)[0] });
  const seen = new Set<string>();
  const list = items.sort((a, b) => b.week - a.week).filter((x) => { const k = x.text.slice(0, 60); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10)
    .map((x) => `· week ${x.week}${x.week === week ? " (this week)" : ""}: ${x.text.slice(0, 220)}`);
  const sagas = (s.sagas?.list ?? []).filter((x) => x.status === "running" && x.title).map((x) => x.title).slice(0, 3);
  const talk = (s.rumors ?? []).filter((r) => r.week >= since).sort((a, b) => b.salience - a.salience).slice(0, 3).map((r) => r.content);
  if (!list.length && !sagas.length && !talk.length) return "";
  const head = opts.since !== undefined
    ? `## WHAT'S HAPPENED SINCE ${opts.scene ? "THIS SCENE LAST MOVED" : "THEN"} (week ${since}, and it's week ${week} now)\nTime has passed and the world has moved. Pick up from where things stand now, not from where it stopped. If something here changes the situation, the people in it know, and they act on it. They might bring it up, or be scared, angry or changed by it, or the scene might move on because of it.`
    : `## WHAT ELSE IS GOING ON\nThis is the same arcology over the last few weeks. Nothing happens in isolation. People know about what happened here and are affected by it, so let what you write tie into it where it fits. That might be what they're talking about, why they're where they are, what's changed for them, or a reason the event happens at all. If something big happened, it's on everyone's mind.`;
  return [head, ...list, sagas.length ? `Stories running: ${sagas.join("; ")}.` : "", talk.length ? `What people are saying: ${talk.join(" | ")}` : ""].filter(Boolean).join("\n");
}
