/**
 * ONE THING AT A TIME, PER PERSON. A second event about the same woman, written the same week, was
 * stale by the time the first was answered, and still played out into her memories.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { hasPending, oneEach } from "../src/engine/pending.ts";
import { pickSubject } from "../src/engine/dynamic.ts";

{
  const s = newGame({ seed: "one each", starting_slaves: 2 } as never);
  const [a, b] = Object.values(s.people).filter((p) => p.status === "owned");
  const ev = (id: string, person: string, severity: string, week = s.arcology.week, other?: string) => ({ id, kind: "dynamic", person, other, seed: id, options: [], week, severity }) as never;
  s.events = [ev("old", a.id, "minor", s.arcology.week - 1), ev("new", a.id, "minor"), ev("pair", b.id, "minor", s.arcology.week, a.id), ev("city", undefined as never, "minor")];
  oneEach(s);
  check("she has one thing waiting, the one that was there first", s.events.filter((e) => e.person === a.id || e.other === a.id).map((e) => e.id).join() === "old", s.events.map((e) => e.id));
  check("events about nobody in particular aren't touched", s.events.some((e) => e.id === "city"));
  s.events.push(ev("urgent", a.id, "major"));
  oneEach(s);
  check("something urgent takes the place of something minor", s.events.filter((e) => e.person === a.id).map((e) => e.id).join() === "urgent");
  check("and nothing new is picked for her while it waits", hasPending(s, a.id) && pickSubject(s)?.id !== a.id);
  for (let w = 0; w < 6; w++) {
    endWeek(s);
    const per = new Map<string, number>();
    for (const e of s.events) for (const id of [e.person, e.other]) if (id) per.set(id, (per.get(id) ?? 0) + 1);
    if ([...per.values()].some((n) => n > 1)) { check("a week never leaves anyone with two", false, s.events.map((e) => [e.id, e.person, e.other])); break; }
    if (w === 5) check("a week never leaves anyone with two", true);
  }
}

import { ensureSlaveEvent, hasSlaveEvent, resolveEvent } from "../src/engine/events.ts";
{
  // The player got events from the city and nothing from their own women, week after week.
  const s = newGame({ seed: "every-week", starting_slaves: 2 } as never);
  s.models.tension = 0;
  let every = true;
  for (let w = 0; w < 6; w++) {
    // Deal with whatever's waiting, the way a player does, so the next week starts clean.
    for (const e of [...s.events]) resolveEvent(s, e, e.options[0].id);
    endWeek(s);
    if (!hasSlaveEvent(s)) every = false;
  }
  check("every week, something from one of your own slaves is waiting", every, s.events.map((e) => e.kind));

  s.events = [];
  const e = ensureSlaveEvent(s)!;
  check("the floor puts one on an empty table", !!e && !!e.person && hasSlaveEvent(s));
  check("and never a second", ensureSlaveEvent(s) === null);
  const line = resolveEvent(s, e, e.options[0].id);
  check("and it can be answered", !!line, line);
}
