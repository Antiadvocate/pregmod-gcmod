/**
 * THREADS — the situations the simulation notices about itself.
 *
 * The claim these protect: the game can look at the last two months and find a story in it, and
 * the story is READ off the kernel rather than rolled. If this file goes red, the game has gone
 * back to firing incidents that do not accumulate.
 *
 * The three properties that matter, in order of how badly it breaks without them:
 *   · Nothing is rolled — two identical saves produce identical threads.
 *   · A thread whose conditions stop holding LAPSES rather than running to completion.
 *   · A thread that was answered does not come back on the same people.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { resolveAct } from "../src/engine/intimacy.ts";
import { read, refresh } from "../src/engine/obedience.ts";
import { newMemory } from "../src/engine/memory.ts";
import { tickThreads, threadsOf, liveThreads, answerThread, threadBrief } from "../src/engine/threads.ts";
import { THREADS, THREAD_BY_KIND } from "../src/data/threads.ts";
import { traceOf, slope, signalsFor, recordTrace } from "../src/engine/trace.ts";
import { gossip, startRumor, getEdge } from "../src/engine/social.ts";

function house(seed: string, n = 6) {
  const s = newGame({ seed, starting_slaves: n });
  s.arcology.cash = 900_000;
  const b = s.arcology.facilities["brothel"];
  b.level = 1; b.capacity = 10;
  for (const p of Object.values(s.people)) {
    if (p.status !== "owned") continue;
    p.assignment = "work in the brothel"; p.facility = "brothel"; b.workers.push(p.id);
  }
  return s;
}

/* ── the trace, which is what makes a trend visible at all ─────────────────────────────────── */
{
  const s = house("trace", 2);
  const p = Object.values(s.people)[0];
  for (let i = 0; i < 8; i++) { p.bond.resentment = 20 + i * 6; refresh(p, s.memory[p.id]); s.arcology.week = i + 1; recordTrace(s, p); }
  const t = traceOf(s, p.id);
  check("the trace keeps a rolling window", t.rows.length === 8, t.rows.length);
  check("and a rising line reads as a rising slope", slope(t, "res") > 4, slope(t, "res"));

  // A spike is not a trend. This is the whole reason it is least squares and not last-minus-first.
  const q = Object.values(s.people)[1];
  const vals = [30, 80, 31, 30, 31, 30, 31, 30, 31, 30];
  for (let i = 0; i < vals.length; i++) { q.bond.resentment = vals[i]; refresh(q, s.memory[q.id]); s.arcology.week = i + 1; recordTrace(s, q); }
  check("but one bad Tuesday ages out of the window", Math.abs(slope(traceOf(s, q.id), "res")) < 1.5, slope(traceOf(s, q.id), "res"));
}

/* ── nothing is rolled ─────────────────────────────────────────────────────────────────────── */
{
  const run = () => {
    const s = house("determinism", 6);
    for (let w = 0; w < 40; w++) {
      for (const p of Object.values(s.people)) if (p.status === "owned") resolveAct(s, p, "discipline");
      endWeek(s);
    }
    // Compare the SHAPE, not the ids. Person ids are minted from Date.now() rather than from the
    // seed, so two runs of the same save cast structurally identical threads on differently-named
    // people. That is a separate (and much smaller) determinism gap than the one this is testing:
    // what matters here is that the same history finds the same situations in the same order.
    return threadsOf(s).map((t) => `${t.kind}:${Object.keys(t.cast).sort().join("+")}:${t.stage}:${Math.round(t.heat / 10)}`).join("|");
  };
  const a = run(), b = run();
  check("two identical saves produce identical threads", a === b, { a: a.slice(0, 90), b: b.slice(0, 90) });
  check("and something was actually found", a.length > 0, a.slice(0, 120));
}

/* ── a thread that stops being true lapses ─────────────────────────────────────────────────── */
{
  const s = house("lapse", 4);
  const [a, b] = Object.values(s.people);
  // Manufacture the talkers configuration.
  for (const p of [a, b]) { p.bond.resentment = 80; p.bond.bond = -20; p.bond.fear = 5; refresh(p, s.memory[p.id]); }
  for (let w = 0; w < 14; w++) {
    for (const p of [a, b]) { p.bond.resentment = 80; p.bond.bond = -20; refresh(p, s.memory[p.id]); }
    endWeek(s);
  }
  const opened = threadsOf(s).find((t) => t.kind === "talkers");
  check("a manufactured situation is detected", !!opened, threadsOf(s).map((t) => t.kind));

  if (opened) {
    const heat = opened.heat;
    // Fix it. Resentment down, and the thread should cool out rather than run to completion.
    for (const p of [a, b]) { p.bond.resentment = 5; refresh(p, s.memory[p.id]); }
    for (let w = 0; w < 26; w++) { for (const p of [a, b]) { p.bond.resentment = 5; refresh(p, s.memory[p.id]); } endWeek(s); }
    check("and fixing the thing makes it lapse rather than finish",
      opened.ended?.how === "lapsed", { how: opened.ended?.how, heatWas: heat, now: opened.heat });
  }
}

{
  // One bad week must not kill a situation — the hysteresis that stopped the log stuttering.
  const s = house("hyst", 4);
  const [a, b] = Object.values(s.people);
  for (const p of [a, b]) { p.bond.resentment = 80; p.bond.bond = -20; refresh(p, s.memory[p.id]); }
  for (let w = 0; w < 16; w++) { for (const p of [a, b]) { p.bond.resentment = 80; p.bond.bond = -20; refresh(p, s.memory[p.id]); } endWeek(s); }
  const t = threadsOf(s).find((x) => x.kind === "talkers" && !x.ended);
  if (t) {
    const before = t.heat;
    a.bond.resentment = 4; refresh(a, s.memory[a.id]); endWeek(s);
    check("one week outside the condition does not cool a thread", t.heat >= before && !t.ended, { before, after: t.heat });
    a.bond.resentment = 80; refresh(a, s.memory[a.id]); endWeek(s);
    // Not `heat > before`: sixteen weeks of a condition holding puts a talkers thread on the cap,
    // and a capped thread cannot climb, so that assertion was asking heat to exceed 100. What
    // "picks up where it left off" actually means is that the miss is forgotten — the counter is
    // back to zero, so the next bad week starts the four-week grace over rather than continuing a
    // count from before the good one.
    check("and it picks up where it left off", t.heat >= before && !t.misses && !t.ended, { before, after: t.heat, misses: t.misses });

    // The other half of the same contract: the grace is finite. Four consecutive weeks outside
    // the condition and it does start to cool.
    const held = t.heat;
    for (let w = 0; w < 4; w++) { a.bond.resentment = 4; refresh(a, s.memory[a.id]); endWeek(s); }
    check("but four bad weeks in a row do cool it", t.heat < held, { held, after: t.heat });
  } else check("hysteresis: a thread was open to test", false);
}

/* ── answering it, and it staying answered ─────────────────────────────────────────────────── */
{
  const s = house("answer", 4);
  const [a, b] = Object.values(s.people);
  for (const p of [a, b]) { p.bond.resentment = 85; p.bond.bond = -25; refresh(p, s.memory[p.id]); }
  let asked: string | undefined;
  for (let w = 0; w < 40 && !asked; w++) {
    for (const p of [a, b]) { p.bond.resentment = 85; p.bond.bond = -25; refresh(p, s.memory[p.id]); }
    endWeek(s);
    // Specifically the talkers thread — a household this angry also generates a belief, and the
    // first version of this test answered whichever asked first and then asserted about the other.
    asked = liveThreads(s).find((t) => t.pending !== undefined && t.kind === "talkers")?.id;
  }
  check("a thread eventually asks the player something", !!asked, threadsOf(s).map((t) => `${t.kind}@${t.stage}`));

  if (asked) {
    const t = threadsOf(s).find((x) => x.id === asked)!;
    const resBefore = a.bond.resentment;
    const out = answerThread(s, asked, "sit");
    check("answering it does something to real state", a.bond.resentment < resBefore, { before: resBefore, after: a.bond.resentment });
    check("and it says what happened", out.line.length > 20, out.line);
    check("and the thread closes", !!t.ended && t.ended.how === "sit", t.ended);
    check("and it goes in canon", s.canon.some((c) => c.includes("Two slaves are plotting")), s.canon.slice(-2));

    // The same situation must not immediately reopen on the same two people.
    for (const p of [a, b]) { p.bond.resentment = 85; refresh(p, s.memory[p.id]); }
    for (let w = 0; w < 40; w++) { for (const p of [a, b]) { p.bond.resentment = 85; refresh(p, s.memory[p.id]); } endWeek(s); }
    const again = threadsOf(s).filter((x) => x.kind === "talkers" && Object.values(x.cast).sort().join() === [a.id, b.id].sort().join());
    check("and an answered situation does not come back on the same people", again.length === 1, again.length);
  }
}

/* ── the detectors are wired to the kernel ─────────────────────────────────────────────────── */
{
  // Every thread in the table must be reachable by SOME detector, or it is unreachable content.
  const s = house("cover", 8);
  const kinds = new Set<string>();
  for (const mode of ["cruel", "kind", "mixed"] as const) {
    const g = house(`cover-${mode}`, 8);
    for (let w = 0; w < 90; w++) {
      for (const p of Object.values(g.people)) {
        if (p.status !== "owned") continue;
        if (mode === "cruel") resolveAct(g, p, "discipline");
        else if (mode === "kind") { resolveAct(g, p, "talk"); resolveAct(g, p, "aftercare"); }
        else if (w % 2) resolveAct(g, p, "oral");
      }
      endWeek(g);
      for (const t of liveThreads(g)) if (t.pending !== undefined) answerThread(g, t.id, THREAD_BY_KIND[t.kind]!.beats[t.pending]!.options![0].id);
    }
    for (const t of threadsOf(g)) kinds.add(t.kind);
  }
  check("most of the thread table is reachable from ordinary play", kinds.size >= 5, [...kinds]);
  check("and the ones that fire include both social and psychological kinds",
    ["talkers", "pair", "belief"].some((k) => kinds.has(k)) && ["gone_quiet", "remodelled", "watcher"].some((k) => kinds.has(k)),
    [...kinds]);
}

{
  // The narrator is told the situation and never the mechanism.
  const s = house("brief", 4);
  const [a, b] = Object.values(s.people);
  for (const p of [a, b]) { p.bond.resentment = 85; p.bond.bond = -25; refresh(p, s.memory[p.id]); }
  for (let w = 0; w < 16; w++) { for (const p of [a, b]) { p.bond.resentment = 85; p.bond.bond = -25; refresh(p, s.memory[p.id]); } endWeek(s); }
  const brief = threadBrief(s);
  check("live situations reach the narrator", brief.length > 0, brief.slice(0, 80));
  check("and it is never told the numbers", !/heat|stage|slope|\bthread\b/i.test(brief), brief.slice(0, 120));
}

/* ── the two engine bugs this work uncovered ───────────────────────────────────────────────── */
{
  /**
   * A rumour created without a stated source had an EMPTY knower list, and diffusion only carries
   * a story out of a room that already contains somebody who knows it. So every household-wide
   * rumour in the codebase was inert from the first tick and decayed out three weeks later. The
   * whole gossip layer produced nothing in seventy weeks of play.
   */
  const s = house("rumour", 5);
  const r = startRumor(s, "he decides who it is going to be before he comes down", { salience: 8, charge: -1 });
  check("a rumour with no stated source still has somebody who knows it", r.knowers.length > 0, r.knowers);

  const about = Object.values(s.people)[0];
  const r2 = startRumor(s, `${about.name} came back from the theatre and is not right`, { about: about.id, salience: 7 });
  check("and one about somebody starts with her", r2.knowers.includes(about.id), r2.knowers);
}

{
  // Ordinary weeks have to produce gossip, or nothing downstream of it can ever run.
  const s = house("gossip", 6);
  for (const p of Object.values(s.people)) { p.bond.resentment = 70; p.psyche.relaxation = -6; refresh(p, s.memory[p.id]); }
  s.arcology.week = 5;
  const seeded = gossip(s, 5);
  check("an ordinary bad week produces things for the house to say", seeded.length > 0, seeded.length);
  check("and they carry a charge, so the belief detector can read them", seeded.some((x) => x.charge === -1));
}

{
  /**
   * Warmth used to be `0.3 + meanRelaxation * 0.08`, which meant a household where everybody was
   * suffering grew NEGATIVE warmth — nine months in a brothel under a cruel owner left six women
   * who had never met. Shared adversity is the oldest bond there is and the curve had it backwards.
   */
  const s = house("foxhole", 4);
  for (const p of Object.values(s.people)) { p.psyche.relaxation = -6; p.psyche.capacity = -5; }
  for (let w = 0; w < 20; w++) endWeek(s);
  const [a, b] = Object.values(s.people);
  const e = getEdge(s.edges, a.id, b.id);
  check("women who suffer together get closer, not colder", (e?.warmth ?? 0) > 20, e?.warmth);
}

{
  // Every beat in the table has to be able to render, and every option has to be answerable.
  let bad: string | undefined;
  const s = house("render", 4);
  const [a, b] = Object.values(s.people);
  const c = { s, who: { a: a.name, b: b.name, her: a.name, risen: a.name, passed: b.name, one: a.name, other: b.name }, weeks: 9, heat: 80, facts: ["Something got out."] };
  for (const def of THREADS) {
    for (const beat of def.beats) {
      const line = beat.line(c);
      if (!line || /undefined|\[object/.test(line)) { bad = `${def.kind}: ${line}`; break; }
      if (beat.options?.length) {
        const text = beat.text?.(c) ?? "";
        if (!text || /undefined|\[object/.test(text)) { bad = `${def.kind} text: ${text.slice(0, 60)}`; break; }
        if (!beat.title) { bad = `${def.kind} has options and no title`; break; }
      }
    }
    if (bad) break;
  }
  check("every beat renders without a hole in it", bad === undefined, bad);
}
