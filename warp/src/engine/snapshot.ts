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
  if (came.length) out.push(`NEW IN THE HOUSE: ${came.map((p) => `${p.name} (${p.origin.nationality}, was a ${p.origin.career}; ${p.origin.acquired_how})`).join("; ")}.`);
  const gone = Object.values(s.people).filter((p) => p.exit_week !== undefined && p.exit_week >= week);
  if (gone.length) out.push(`GONE FROM THE HOUSE: ${gone.map((p) => `${p.name}, ${p.status}${p.exit_note ? ` (${p.exit_note})` : ""}`).join("; ")}.`);

  const laws = lawsOf(s).filter((x) => x.week >= week - 1).map((x) => LAW_BY_ID[x.id]).filter(Boolean);
  if (laws.length) out.push(`NEW LAWS: ${laws.map((l) => `the ${l.name}: "${l.text}"`).join(" | ")}`);

  const talk = s.rumors.filter((r) => r.week >= week).sort((a, b) => b.salience - a.salience).slice(0, 5);
  if (talk.length) out.push(`WHAT PEOPLE ARE SAYING: ${talk.map((r) => r.content).join(" | ")}`);

  const wars = activeWars(s);
  if (wars.length) out.push(`AT WAR WITH: ${wars.map((w) => `${w.name} (${w.weeks} weeks, ${w.front > 20 ? "winning" : w.front < -20 ? "losing" : "stalemate"})`).join("; ")}.`);

  const govs = activeGovernors(s);
  if (govs.length) out.push(`CITIES YOUR WOMEN RUN: ${govs.map((g) => `${g.name}, run by ${s.people[g.person]?.name}${g.problems?.length ? ` (trouble: ${g.problems.map((x) => x.text).join("; ")})` : ""}`).join(" | ")}`);

  const done = (s.chronicle ?? []).filter((e) => e.week >= week).slice(-8);
  if (done.length) out.push(`WHAT THE OWNER DID THIS WEEK: ${done.map((e) => e.text.slice(0, 180)).join(" | ")}`);

  const world = worldBrief(s);
  if (world) out.push(`OUTSIDE: ${world.replace(/\n/g, " ")}`);
  return `## THIS WEEK (week ${week})\n${out.join("\n")}`;
}
