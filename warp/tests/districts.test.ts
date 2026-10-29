/**
 * THE BUILDINGS. Every district was the same box in a different colour, and the city had no
 * therapy offices, restaurants, university, public gardens or border wall. Each kind now has its
 * own design, the new ones do something, and each kind has trouble of its own.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { DISTRICTS, DISTRICT_BY_KIND } from "../src/data/districts.ts";
import { canRaise, cityOf, cityYield } from "../src/engine/city.ts";
import { DESIGNS, designHeight, drawDesign, type Kit } from "../src/views/isoBuildings.tsx";
import { DISTRICT_EVENTS } from "../src/engine/districtlife.ts";
import { EVENT_BY_ID } from "../src/engine/events.ts";
import { projection } from "../src/lib/iso.ts";
import { garrison } from "../src/engine/battles.ts";

{
  const kinds = DISTRICTS.map((d) => d.kind).filter((k) => k !== "spire");
  check("every district has its own design", kinds.every((k) => DESIGNS[k]), kinds.filter((k) => !DESIGNS[k]));
  const p = projection(28);
  const drawn = kinds.map((k) => { const out: unknown[] = []; drawDesign({ out, p, light: 1, lamps: 0.5, win: "#fff", base: "#888888", seed: 3, level: 3, ascendant: false } as Kit, k, 0, 0, 0.8, 9, designHeight(k, 3, DISTRICT_BY_KIND[k].bulk)); return out.length; });
  check("and each draws more than a single box", drawn.every((n) => n >= 3), drawn);
  check("a works stays low however big it gets", designHeight("industrial", 6, DISTRICT_BY_KIND.industrial.bulk) <= 40);
  check("and an exchange tower doesn't", designHeight("exchange", 6, DISTRICT_BY_KIND.exchange.bulk) > 200);
  check("the new kinds are there", (["therapy", "restaurant", "university", "park", "wall"] as const).every((k) => DISTRICT_BY_KIND[k]?.household));
  check("every kind has trouble of its own", kinds.every((k) => DISTRICT_EVENTS.some((e) => e.id.startsWith(`dl_${k}_`)) && DISTRICT_EVENTS.every((e) => EVENT_BY_ID[e.id])));
}

{
  const s = newGame({ seed: "districts", starting_slaves: 2 } as never);
  const city = cityOf(s);
  const inner = city.districts.find((d) => d.ring === 1)!;
  const outer = city.districts.find((d) => d.ring === 3)!;
  s.arcology.cash = 1e7;
  check("the wall can't go on the inner ring", /only goes on/.test(canRaise(s, inner, "wall") ?? ""), canRaise(s, inner, "wall"));
  check("but can on the verge", canRaise(s, outer, "wall") === null, canRaise(s, outer, "wall"));

  check("no events about a district you don't own", DISTRICT_EVENTS.every((e) => !e.candidates(s).length || (s.city?.districts ?? []).some((d) => d.owner === "you" && d.level > 0 && e.id.startsWith(`dl_${d.kind}_`))));
  const before = garrison(s).total;
  for (const [i, k] of (["therapy", "restaurant", "park", "wall"] as const).entries()) {
    const d = city.districts.filter((x) => x.ring >= 2)[i];
    Object.assign(d, { kind: k, level: 3, owner: "you", condition: 90 });
  }
  const y = cityYield(s);
  check("therapy, restaurants and parks yield what they promise", y.mending > 0 && y.fare > 0 && y.clean > 0, y);
  check("the wall counts in a fight", garrison(s).total > before, [before, garrison(s).total]);

  const broken = Object.values(s.people).find((p) => p.status === "owned")!;
  broken.psyche.state = "fracturing";
  broken.psyche.relaxation = -6;
  const hope = broken.bond.hope;
  if (s.world) s.world.pollution = 50;
  const air = s.world?.pollution ?? 0;
  endWeek(s);
  check("the household eats from restaurant row", broken.bond.hope > hope - 3, [hope, broken.bond.hope]);
  check("the gardens clean the air", !s.world || s.world.pollution < air + 5, [air, s.world?.pollution]);

  // Every option of every building's event resolves without throwing, with a slave to ask for.
  const bad: string[] = [];
  for (const e of DISTRICT_EVENTS) for (const o of e.options) {
    try { const line = o.resolve(s, { id: "x", kind: e.id, seed: "", options: [], week: s.arcology.week, severity: "notable" } as never, undefined); if (!line) bad.push(`${e.id}.${o.id}: no line`); }
    catch (err) { bad.push(`${e.id}.${o.id}: ${(err as Error).message}`); }
  }
  check("every choice around every building resolves and says what happened", !bad.length, bad);
}
