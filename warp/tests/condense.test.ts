/**
 * CONDENSING A MEMORY BANK. One model call folds the older lines into fewer; core memories and the
 * last few weeks are never touched, and an answer that doesn't hold up changes nothing.
 */
import { check } from "./harness.ts";
import { newMemory, remember } from "../src/engine/memory.ts";
import { applyCondensed, memoryTokens, needsCondensing } from "../src/engine/condense.ts";
import { memoryTilt } from "../src/engine/obedience.ts";

function bank() {
  const mem = newMemory();
  // Different enough that the weekly dedupe keeps every one: the pile the condenser is for.
  const word = (w: number, i: number) => `job${w}part${i}`;
  for (let w = 1; w <= 24; w++) remember(mem, { content: `chores ${Array.from({ length: 14 }, (_, i) => word(w, i)).join(" ")} hours`, week: w, importance: 4, charge: "cold" });
  remember(mem, { content: "the owner gave me a window", week: 10, importance: 7, charge: "warm" });
  remember(mem, { content: "the first time the owner took me", week: 2, importance: 9, charge: "sharp", core: true });
  remember(mem, { content: "the owner let me sleep in", week: 29, importance: 5, charge: "warm" });
  return mem;
}

{
  const mem = bank();
  const week = 30;
  check("a big bank is due", needsCondensing(mem, week), memoryTokens(mem));
  check("a small one isn't", !needsCondensing(newMemory(), week));
  const lines = mem.episodic.filter((e) => !e.core && week - (e.last_week ?? e.week) >= 4);
  const scrubs = lines.map((e, i) => (/ hours$/.test(e.content) ? i + 1 : 0)).filter(Boolean);
  const window = lines.findIndex((e) => e.content.includes("window")) + 1;
  const tilt = memoryTilt(mem);
  const ok = applyCondensed(mem, lines, {
    memories: [
      { text: "for weeks the owner had me scrub the floors until my knees bled", covers: scrubs, importance: 4, charge: "cold" },
      { text: "the owner gave me a window", covers: [window], importance: 7, charge: "warm" },
    ],
    facts: [],
    story: "I came in scared and was put to the floors. Then the owner gave me a window, and I started to sleep.",
  }, week);
  check("a good answer is taken", ok);
  check("the bank is much smaller", mem.episodic.length === 4, mem.episodic.map((e) => e.content));
  const merged = mem.episodic.find((e) => e.content.includes("scrub the floors"))!;
  check("the merged one keeps its span and count", merged.week === 1 && merged.last_week === 24 && merged.times === 24, merged);
  check("core and recent memories are untouched", mem.episodic.some((e) => e.core && e.content.includes("first time")) && mem.episodic.some((e) => e.week === 29));
  check("she has a short story of her time here", !!mem.digest && mem.condensed_week === week);
  check("how she feels about the owner barely moves", Math.abs(memoryTilt(mem) - tilt) <= 0.15, [tilt, memoryTilt(mem)]);
}

{
  const mem = bank();
  const lines = mem.episodic.filter((e) => !e.core && 30 - e.week >= 4);
  const was = mem.episodic.length;
  check("nothing usable changes nothing", !applyCondensed(mem, lines, { memories: [{ text: "", covers: [] }] }, 30) && mem.episodic.length === was);
  check("an answer pointing at memories that weren't there changes nothing", !applyCondensed(mem, lines, { memories: [{ text: "x happened", covers: [999] }] }, 30) && mem.episodic.length === was);
  // Turning a cold run into a warm one would change how she feels about the owner: thrown away.
  const all = lines.map((_, i) => i + 1);
  check("an answer that flips how she feels is thrown away", !applyCondensed(mem, lines, { memories: [{ text: "it was all lovely", covers: all, importance: 10, charge: "bright" }] }, 30) && mem.episodic.length === was);
}
