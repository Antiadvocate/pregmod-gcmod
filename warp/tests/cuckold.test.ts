/**
 * THE OTHER MAN — she can be given, every chapter reads and answers, the nights happen between
 * them, and each ending does what it says.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { begin, eligible, ready, tickCuckold } from "../src/engine/cuckold.ts";
import { answerBeat, beatNow, cx, BEATS } from "../src/data/cuckold.ts";
import type { SaveState } from "../src/engine/types.ts";

function setup(seed: string): SaveState {
  const s = newGame({ seed, starting_slaves: 4 } as never);
  s.arcology.cash = 400000;
  return s;
}

function grown(s: SaveState) {
  return Object.values(s.people).find((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18 && p.health.recovery_weeks <= 0)!;
}

/** Answer every chapter with the option at `pref` (or the first one open), until it ends or runs out of weeks. */
function play(s: SaveState, pref: (beat: string) => string, weeks = 40): string[] {
  const seen: string[] = [];
  for (let w = 0; w < weeks && s.cuckold && !s.cuckold.ended; w++) {
    for (let i = 0; i < 3 && ready(s); i++) {
      const b = beatNow(s)!;
      const x = cx(s)!;
      const opts = b.options(x).filter((o) => !o.locked?.(x));
      const want = pref(b.id);
      const o = opts.find((q) => q.id === want) ?? opts.find((q) => q.id !== "stop" && q.id !== "never") ?? opts[0];
      seen.push(`${b.id}:${o.id}`);
      const r = answerBeat(s, o.id);
      check(`${b.id} answered with ${o.id} writes something`, !!r && r.text.length > 40 && !/undefined|\[object/.test(r.text), r?.text.slice(0, 200));
    }
    if (s.cuckold && !s.cuckold.ended) endWeek(s);
  }
  return seen;
}

{
  const s = setup("cuck-a");
  const her = grown(s);
  check("an adult she can be given", eligible(s, her) === null, eligible(s, her));
  const young = Object.values(s.people).find((p) => p.age < 18);
  if (young) check("a child never can", eligible(s, young) !== null);
  begin(s, her);
  check("the first chapter is ready straight away", ready(s));
  const all = BEATS.map((b) => b.id);
  const seen = play(s, (b) => ({ ask: "brute", dinner: "lap", kiss: "taste", first: "chair", home: "clean", call: "stay", name: "again", bed: "cage", seed: "yes", offer: "his" } as Record<string, string>)[b]);
  check("the whole way down reaches an ending", !!s.cuckold!.ended, seen);
  check("it went through the chapters in order", seen[0].startsWith("ask") && seen.some((x) => x.startsWith("first")) && seen.at(-1)!.startsWith("offer"), seen);
  check("every chapter name is real", seen.every((x) => all.includes(x.split(":")[0])));
  check("she spent nights with him", s.cuckold!.nights >= 3, s.cuckold!.nights);
  check("she's gone a long way to him", s.cuckold!.fall >= 60, s.cuckold!.fall);
  check("he's the one she goes to now", s.cuckold!.pull < 40, s.cuckold!.pull);
  const ending = s.cuckold!.ended!.ending;
  check("pushing all the way can end with her his", ending === "his" || ending === "shared" || ending === "lost", ending);
  // After an ending that leaves her with him, the nights keep coming in the week report.
  if (ending === "his") {
    const before = s.cuckold!.nights;
    const lines = tickCuckold(s);
    check("the nights go on after she's his", s.cuckold!.nights > before && lines.length > 0, lines);
  }
}

{
  const s = setup("cuck-b");
  const her = grown(s);
  begin(s, her);
  const seen = play(s, (b) => (b === "ask" ? "broker" : b === "dinner" ? "stop" : ""));
  check("you can call it off early", s.cuckold!.ended?.ending === "called_off", seen);
  check("calling it off before he's had her leaves no nights", s.cuckold!.nights === 0);
  check("and someone else can be asked after", eligible(s, Object.values(s.people).find((p) => p.id !== her.id && p.age >= 18 && p.status === "owned") ?? her) === null);
}

{
  const s = setup("cuck-c");
  const her = grown(s);
  const cash = s.arcology.cash;
  begin(s, her);
  play(s, (b) => ({ ask: "boy", offer: "sell" } as Record<string, string>)[b] ?? "");
  check("selling her to him ends it", s.cuckold!.ended?.ending === "sold", s.cuckold!.ended);
  check("and she leaves the household", s.people[her.id].status === "sold");
  check("and he paid for her", s.arcology.cash > cash - 50000, [cash, s.arcology.cash]);
  check("nothing happens once she's gone", tickCuckold(s).length === 0);
}

{
  const s = setup("cuck-d");
  const her = grown(s);
  begin(s, her);
  play(s, (b) => ({ ask: "broker", dinner: "hand", kiss: "watch", first: "listen", home: "reclaim", call: "hang", name: "forgive", bed: "no", seed: "no", offer: "back" } as Record<string, string>)[b] ?? "");
  const e = s.cuckold!.ended?.ending;
  check("holding on the whole way, you can take her back", e === "reclaimed" || e === "lost", e);
  check("taking her back stops the nights", tickCuckold(s).length === 0);
}
