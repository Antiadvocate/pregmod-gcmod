/**
 * KEEPING IT SMALL — repeats fold together, scenes end with the week, promises to strangers land.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { remember, compactMemory, dedupeLines, memoryLine } from "../src/engine/memory.ts";
import { openMoment, playMoment, momentsOf, closeAllMoments } from "../src/engine/moments.ts";
import { deedsOf } from "../src/engine/deeds.ts";
import { resolveDynamic } from "../src/engine/dynamic.ts";
import { digest } from "../src/engine/prompts.ts";
import type { SaveState } from "../src/engine/types.ts";

const game = (seed: string) => newGame({ seed, starting_slaves: 3, plot: false } as never) as SaveState;

{
  const s = game("tok-mem");
  const p = Object.values(s.people).find((x) => x.status === "owned")!;
  const mem = s.memory[p.id];
  const before = mem.episodic.length;
  for (let w = 1; w <= 6; w++) remember(mem, { content: `the owner had her serve him dinner on her knees in turn ${20 + w}`, week: w, importance: 5 });
  check("the same beat filed six times is one memory", mem.episodic.length === before + 1, mem.episodic.length - before);
  const e = mem.episodic.find((x) => /serve him dinner/.test(x.content))!;
  check("with a count", (e.times ?? 1) === 6 && /6 times, weeks 1–6/.test(memoryLine(e)), memoryLine(e));
  mem.episodic.push({ ...e, id: "x", times: 1 }, { ...e, id: "y", times: 2 });
  compactMemory(mem);
  check("compaction folds old duplicates", mem.episodic.filter((x) => /serve him dinner/.test(x.content)).length === 1);
  check("near-identical lines collapse", dedupeLines(["she served him on turn 21", "she served him on turn 22", "she cried"]).length === 2);
}

{
  const s = game("tok-hist");
  for (let i = 0; i < 8; i++) s.history.push({ week: 1, turn: i, action: "x", mode: "do", prose: "", summary: `Mira served the owner at dinner, turn ${i}` } as never);
  s.models.history_window = 8;
  const d = digest(s);
  check("the scene's history collapses repeats", (d.match(/Mira served the owner/g) ?? []).length <= 2, (d.match(/Mira served the owner/g) ?? []).length);
}

{
  const s = game("tok-week");
  const p = Object.values(s.people).find((x) => x.status === "owned" && x.age >= 18)!;
  const id = openMoment(s, { person: p.id, title: "Talking", source: "test", happened: `${p.name} waits.` });
  await playMoment(s, id, "Thank you. I promise I'll free you in a year.");
  endWeek(s);
  const m = momentsOf(s).find((x) => x.id === id)!;
  check("ending the week ends the scene", !m.open);
  await new Promise((r) => setTimeout(r, 0));
  check("and it still counts", deedsOf(s).some((d) => d.source === "test"), deedsOf(s).map((d) => d.source));
  const id2 = openMoment(s, { person: p.id, title: "Again", source: "test2", happened: "x" });
  openMoment(s, { person: p.id, title: "Again", source: "test3", happened: "y" });
  check("clear all ends every open scene", closeAllMoments(s) === 2 && !momentsOf(s).some((x) => x.open), id2);
}

{
  const s = game("tok-npc");
  const cash = s.arcology.rep;
  s.events.push({ id: "echo-z", kind: "dynamic", seed: "Dario Bellini, the trader you promised a berth at the docks, is back to collect.", options: [{ id: "d0:promise_kept:", label: "Give him the berth" }], week: 1, severity: "notable" });
  const line = resolveDynamic(s, s.events[0], "d0:promise_kept:");
  check("a promise to a stranger lands", /Dario/.test(line) && s.arcology.rep > cash, line);
  check("and the event clears", !s.events.some((e) => e.id === "echo-z"));
}
