import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { writeLaw } from "../src/engine/court.ts";
import { cityThisWeek, chooseInScene, cityProseBrief } from "../src/engine/citylife.ts";
import { buyMenials, setJob, menialsOf } from "../src/engine/menials.ts";
import { design, apply } from "../src/engine/genome.ts";
import { build } from "../src/engine/works.ts";
import { worldOf } from "../src/engine/world.ts";
import { SYSTEM_EVENTS } from "../src/engine/systemevents.ts";

const built = async (seed: string) => {
  const s = newGame({ seed });
  s.arcology.rep = 20000; s.arcology.cash = 10_000_000;
  writeLaw(s, { name: "Quiet Hours", text: "No slave may speak above a whisper on the residential floors after the tenth hour.", push: [{ norm: "order", dir: 1 }], effects: [] });
  buyMenials(s, 600); setJob(s, "farms", 200); setJob(s, "lease", 200); setJob(s, "labour", 200);
  build(s, "hydroponics"); build(s, "scrubbers");
  await design(s, { name: "Furnace", text: "citizens who can work through a heatwave and shrug off fevers", target: "citizens" });
  apply(s);
  return s;
};

{
  const s = await built("citylife-a");
  const r = endWeek(s);
  const places = new Set((r.city ?? []).map((c) => c.where));
  check("every week has five scenes, from five places", r.city?.length === 5 && places.size === 5, r.city?.map((c) => c.where));
  const all: string[] = [];
  const keys: string[][] = [];
  for (let i = 0; i < 6; i++) { const w = endWeek(s); all.push(...(w.city ?? []).map((c) => c.text)); keys.push((w.city ?? []).map((c) => c.key)); }
  s.citylife_seen = {};
  const every = cityThisWeek(s, 40).map((c) => c.text);
  check("your own law is always among the city's scenes, word for word", every.some((t) => /Quiet Hours/.test(t) && /whisper/.test(t)));
  check("so are the menials and the public works", every.some((t) => /menial|numbers on their wrists|leased/.test(t)) && every.some((t) => /hydroponic|scrubber/i.test(t)));
  const repeats = keys.some((k, i) => k.some((x) => keys.slice(Math.max(0, i - 3), i).some((prev) => prev.includes(x))));
  check("nothing repeats within four weeks", !repeats);
  check("gene programs show in what they do, and nobody's skin is the point", !all.some((t) => /\bskin\b/i.test(t)));
}

{
  // A heatwave shows what a heat edit is for.
  const s = await built("citylife-heat");
  worldOf(s).weather = { kind: "heatwave", week: s.arcology.week };
  const scenes = Array.from({ length: 4 }, (_, i) => { s.citylife_seen = {}; s.arcology.week += i ? 1 : 0; return cityThisWeek(s, 12); }).flat();
  check("the heat-resistant keep working through a heatwave", scenes.some((c) => /Furnace program shows/.test(c.text)), scenes.map((c) => c.key));
}

{
  // Choices: small, and once.
  const s = await built("citylife-choose");
  worldOf(s).regions.delta.state = "war"; worldOf(s).regions.delta.stability = 5; worldOf(s).regions.delta.since = s.arcology.week;
  let r = endWeek(s);
  for (let i = 0; i < 6 && !(r.city ?? []).some((c) => c.options?.length); i++) r = endWeek(s);
  const c = (r.city ?? []).find((x) => x.options?.length);
  check("some scenes end in a choice", !!c, r.city?.map((x) => x.key));
  if (c) {
    const out = chooseInScene(s, r.week, c.key, c.options![0].id);
    check("choosing resolves it once", !!out && chooseInScene(s, r.week, c.key, c.options![0].id) === "" && s.reports.find((x) => x.week === r.week)!.city!.find((x) => x.key === c.key)!.picked === c.options![0].id);
  }
  const b = cityProseBrief(s, r.week)!;
  check("the narrator's column is only a brief until you ask", !!b && /Quiet Hours/.test(b.user) && /don't dwell on skin/.test(b.system) && !s.reports.at(-1)!.city_prose);
}

{
  // Events from what you've built only fire when you've built it.
  const bare = newGame({ seed: "citylife-bare" });
  const s = await built("citylife-sys");
  menialsOf(s).treatment = "harsh";
  const can = (x: typeof s, id: string) => SYSTEM_EVENTS.find((e) => e.id === id)!.candidates(x).length > 0;
  check("a fresh game has none of them", !SYSTEM_EVENTS.some((e) => e.candidates(bare).length && e.id !== "sys_research_spy"));
  check("harsh menials can strike; leases can go wrong; your law can catch a tourist", can(s, "sys_menial_strike") && can(s, "sys_leased_abuse") && can(s, "sys_law_tourist"));
}

{
  // Even a young city with nothing built fills its five, week after week, without the weather saying "no effect".
  const s = newGame({ seed: "citylife-young" });
  let ok = true, bad = "";
  for (let i = 0; i < 10; i++) {
    const r = endWeek(s);
    const places = new Set((r.city ?? []).map((c) => c.where));
    if ((r.city ?? []).length !== 5 || places.size !== 5) { ok = false; bad = JSON.stringify(r.city?.map((c) => c.where)); }
    if ((r.city ?? []).some((c) => /no effect/.test(c.text))) { ok = false; bad = "no effect"; }
  }
  check("ten weeks of a fresh game: five scenes from five places every week", ok, bad);
}
