/**
 * THE WORLD — it moves on its own, it starts crises, and the things you build blunt them.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { worldOf, tickWorld, comingUp } from "../src/engine/world.ts";
import { Ledger } from "../src/engine/economy.ts";
import { answer, pendingBeat, optionsFor } from "../src/engine/story.ts";
import { EVENTS } from "../src/engine/events.ts";
import type { PendingEvent } from "../src/engine/types.ts";

function run(seed: string, weeks: number) {
  const s = newGame({ seed, starting_slaves: 5 } as never);
  s.arcology.cash = 300000;
  for (let w = 0; w < weeks; w++) {
    endWeek(s);
    for (let i = 0; i < 4; i++) {
      if (!pendingBeat(s)) break;
      const o = optionsFor(s).find((x) => !x.locked && !x.pick);
      if (!o) break;
      answer(s, o.id);
    }
  }
  return s;
}

{
  const a = run("world-det", 20), b = run("world-det", 20);
  check("the world is the same for the same seed", JSON.stringify(a.world) === JSON.stringify(b.world));
  check("the news keeps coming", (a.world?.headlines.length ?? 0) >= 10, a.world?.headlines.length);
  check("the weather changes", new Set(a.world!.headlines.map((h) => h.text)).size > 5);
}

{
  let crises = 0;
  for (const seed of ["wa", "wb", "wc", "wd"]) {
    const s = run(seed, 60);
    crises += Object.keys(s.story!.arcs).filter((id) => id.startsWith("w_")).length;
  }
  check("world crises start on their own over a long game", crises >= 6, crises);
}

{
  const s = newGame({ seed: "wall", starting_slaves: 2 } as never);
  const w = worldOf(s);
  w.forecast = [{ kind: "superstorm", week: s.arcology.week + 1 }, { kind: "clear", week: s.arcology.week + 2 }];
  w.weather = { kind: "clear", week: s.arcology.week };
  const bare = new Ledger();
  const copy = JSON.parse(JSON.stringify(s));
  tickWorld(s, bare);
  copy.story.flags["sea_wall"] = true; copy.story.flags["shutters"] = true;
  const walled = new Ledger();
  tickWorld(copy, walled);
  const dmg = (l: Ledger) => l.lines.filter((x) => /superstorm/.test(x.label)).reduce((n, x) => n + x.cash, 0);
  check("a sea wall and shutters blunt a superstorm", dmg(walled) > dmg(bare) && dmg(bare) < 0, { bare: dmg(bare), walled: dmg(walled) });
}

{
  const s = newGame({ seed: "coming", starting_slaves: 2 } as never);
  worldOf(s).forecast = [{ kind: "heatwave", week: s.arcology.week + 1 }];
  check("the forecast shows up in what's coming", comingUp(s).some((c) => /heatwave/i.test(c.text)));
}

{
  const s = newGame({ seed: "outcomes", starting_slaves: 3 } as never);
  const p = Object.values(s.people)[0];
  let short: string | undefined;
  for (const def of EVENTS) {
    for (const o of def.options) {
      const copy = JSON.parse(JSON.stringify(s));
      const who = copy.people[p.id];
      const e = { id: "t", kind: def.id, person: who.id, seed: "", options: [], week: 1, severity: def.severity } as PendingEvent;
      let text = "";
      try { text = o.resolve(copy, e, who); } catch { continue; }
      if (text && (text.length < 60 || /undefined/.test(text))) { short = `${def.id}:${o.id} → ${text}`; break; }
    }
    if (short) break;
  }
  check("every event outcome is a real paragraph", short === undefined, short);
}
