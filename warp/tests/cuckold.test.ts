/**
 * THE OTHER MAN — the engine under the model: the phases, the moves, the nights between chapters,
 * and every ending doing what it says. Chapters here are stand-ins offering every allowed move;
 * the model's side is tests/cuckwriter.test.ts.
 */
import { check } from "./harness.ts";
import { newGame, sanitize } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { answer, begin, eligible, movesNow, ready, tickCuckold, type Choice } from "../src/engine/cuckold.ts";
import type { SaveState } from "../src/engine/types.ts";

function setup(seed: string): SaveState {
  const s = newGame({ seed, starting_slaves: 4 } as never);
  s.arcology.cash = 400000;
  return s;
}
const grown = (s: SaveState) => Object.values(s.people).find((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18 && p.health.recovery_weeks <= 0)!;

/** A stand-in chapter offering every move allowed now, and three men in the first. */
function stage(s: SaveState): Choice[] {
  const { may } = movesNow(s);
  const choices: Choice[] = may.filter((m) => m.id !== "pick").map((m) => ({ label: `say ${m.id}`, move: m.id }));
  if (may.some((m) => m.id === "pick")) for (const n of ["Kade Whitlock", "Julian Marr", "Eli Brandt"]) choices.unshift({ label: `him, ${n}`, move: "pick", man: { name: n, age: 33, who: "a man", manner: "quiet" } });
  s.cuckold!.chapter = { title: "t", scene: "s", choices, model: "test", week: s.arcology.week };
  return choices;
}

function play(s: SaveState, prefer: string[], weeks = 50): string[] {
  const seen: string[] = [];
  for (let w = 0; w < weeks && s.cuckold && !s.cuckold.ended; w++) {
    if (ready(s)) {
      const choices = stage(s);
      const ch = prefer.map((m) => choices.find((x) => x.move === m)).find(Boolean) ?? choices.find((x) => !["stop", "never"].includes(x.move))!;
      const e = answer(s, ch);
      check(`${ch.move} is answerable`, !!e, ch);
      seen.push(`${s.cuckold!.phase}:${ch.move}`);
      if (e) e.text = "written";
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
  check("the first chapter is due straight away", ready(s));
  check("the first chapter must offer a way out", movesNow(s).must.some((m) => m.id === "never"));
  const seen = play(s, ["pick", "first", "clean", "cage", "breed_yes", "his", "push"]);
  const c = s.cuckold!;
  check("the whole way down reaches an ending", !!c.ended, seen);
  check("he was picked, then had her, then made his offer", !!c.bull && seen.some((x) => x.endsWith(":first")) && ["his", "share", "sell", "reclaim"].some((m) => seen.at(-1)!.endsWith(m)), seen);
  check("she spent nights with him", c.nights >= 5, c.nights);
  check("pushed all the way, she's gone a long way", c.fall >= 60 && c.pull < 40, [c.fall, c.pull]);
  check("and you went far enough to give her to him", c.ended!.ending === "his", c.ended);
  const before = c.nights;
  check("the nights go on after she's his", tickCuckold(s).length > 0 && c.nights > before);
}

{
  const s = setup("cuck-b");
  begin(s, grown(s));
  play(s, ["pick", "stop"]);
  check("you can call it off before he has her", s.cuckold!.ended?.ending === "called_off" && s.cuckold!.nights === 0);
}

{
  const s = setup("cuck-c");
  const her = grown(s);
  const cash = s.arcology.cash;
  begin(s, her);
  play(s, ["pick", "first", "sell", "watch"]);
  check("selling her to him ends it", s.cuckold!.ended?.ending === "sold", s.cuckold!.ended);
  check("and she leaves the household, paid for", s.people[her.id].status === "sold" && s.arcology.cash > cash - 50000);
  check("nothing happens once she's gone", tickCuckold(s).length === 0);
}

{
  const s = setup("cuck-d");
  begin(s, grown(s));
  play(s, ["pick", "first", "reclaim", "hold"]);
  const e = s.cuckold!.ended?.ending;
  check("holding on, you can take her back", e === "reclaimed" || e === "lost", e);
  check("taking her back stops the nights", tickCuckold(s).length === 0);
}

{
  const s = setup("cuck-e");
  begin(s, grown(s));
  stage(s);
  check("a move that isn't allowed now does nothing", answer(s, { label: "sell her", move: "sell" }) === null && !s.cuckold!.ended);
  check("nor one that doesn't exist", answer(s, { label: "?", move: "teleport" }) === null);
  check("a pick needs a man", answer(s, { label: "him", move: "pick" }) === null);
}

{
  // A save from the scripted version, waiting on "His Name" after the player had answered.
  const s = setup("cuck-old");
  const her = grown(s);
  (s as unknown as Record<string, unknown>).cuckold = {
    her: her.id, motive: "for_her", beat: "name", due: s.arcology.week, fall: 50, pull: -5, yielded: 30, nights: 6, firsts: [], seeing: true, started: 1,
    bull: { kind: "brute", name: "Kade Whitlock", short: "Kade", age: 34, dick: 6 },
    log: [{ week: 1, beat: "ask", title: "Asking Her", chose: "Kade Whitlock, from your security detail", text: "He answers in a minute.", setup: "You call her up." }],
    written: { beat: "name", scene: "x", labels: {}, model: "m" },
  };
  const loaded = sanitize(JSON.parse(JSON.stringify(s)));
  const c = loaded.cuckold!;
  check("an old story carries on in the right phase", c.phase === "affair" && c.in_phase === 2, [c.phase, c.in_phase]);
  check("its log keeps what was read and chosen", c.log[0].scene === "You call her up." && Array.isArray(c.log[0].facts) && c.log[0].text === "He answers in a minute.");
  check("its man keeps who he was", c.bull!.who.includes("security detail") && c.bull!.manner === "");
  check("and nothing of the old script is left", !("beat" in c) && !("written" in c));
  check("it can be answered again", ready(loaded) && stage(loaded).length >= 3 && !!answer(loaded, loaded.cuckold!.chapter!.choices[0]));
  const again = sanitize(JSON.parse(JSON.stringify(loaded)));
  check("repairing twice changes nothing", JSON.stringify(again.cuckold) === JSON.stringify(loaded.cuckold));
}
