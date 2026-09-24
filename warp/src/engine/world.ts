/**
 * THE WORLD — weather, climate, pollution, the economy, and the Old World regions, ticked weekly.
 *
 * Every week the world moves whether or not you do: seasons turn, the climate gets a little worse,
 * your own industry fouls the air, the Free Cities economy booms and busts, and the regions your
 * docks trade with rise and fall. Each of those has an effect on the arcology you can see in the
 * week report, a headline on the news wire, and, when it goes far enough, a world arc: a crisis in
 * several beats that you have to answer (data/story/world.ts).
 */
import type { Person, ReportLine, SaveState } from "./types";
import { rng } from "./rng";
import { clamp } from "./psyche";
import { WEATHER, HEADLINES, NEIGHBOR_FS, REGION_STATE_WORD, type WeatherKind, type RegionState } from "../data/world";
import { REGIONS, REGION_BY_ID } from "../data/districts";
import type { Ledger } from "./economy";
import { allArcs, startArc, arcDef, promote } from "./story";

export type Season = "spring" | "summer" | "autumn" | "winter";

export interface Weather { kind: WeatherKind; week: number }

export interface RegionRun { stability: number; state: RegionState; since: number; plague_until?: number }

export interface Headline { week: number; text: string; tone: ReportLine["tone"] }

export interface WorldState {
  seed: string;
  /** 0–100. Rises every week and with your pollution; makes the weather worse. */
  strain: number;
  /** 0–100. Your own industry's output, fouling the air. */
  pollution: number;
  weather: Weather;
  /** The next two weeks, as the forecast has them. */
  forecast: Weather[];
  economy: { index: number; trend: number; phase: "boom" | "steady" | "slump" | "crash" };
  regions: Record<string, RegionRun>;
  headlines: Headline[];
  /** Week each world arc last started, for cooldowns. */
  crisis_started: Record<string, number>;
  last_crisis: number;
}

export function seasonOf(week: number): Season {
  return (["spring", "summer", "autumn", "winter"] as const)[Math.floor(((week - 1) % 52) / 13)];
}

export function newWorld(s: SaveState): WorldState {
  const seed = `world:${s.story?.seed ?? s.id}`;
  const r = rng(seed);
  const regions: Record<string, RegionRun> = {};
  for (const reg of REGIONS) {
    const stability = Math.round(22 + r() * 60);
    regions[reg.id] = { stability, state: stateFor(stability), since: s.arcology.week };
  }
  const w: WorldState = {
    seed, strain: 22 + r.int(0, 12), pollution: 5,
    weather: { kind: "clear", week: s.arcology.week },
    forecast: [],
    economy: { index: 100, trend: 0, phase: "steady" },
    regions, headlines: [], crisis_started: {}, last_crisis: s.arcology.week,
  };
  w.forecast = [rollWeather(s, w, s.arcology.week + 1), rollWeather(s, w, s.arcology.week + 2)];
  return w;
}

export function worldOf(s: SaveState): WorldState {
  if (!s.world) s.world = newWorld(s);
  return s.world;
}

function stateFor(stability: number): RegionState {
  if (stability < 13) return "collapse";
  if (stability < 28) return "war";
  if (stability < 40) return "unrest";
  if (stability > 82) return "boom";
  return "calm";
}

function rollWeather(s: SaveState, w: WorldState, week: number): Weather {
  const r = rng(`${w.seed}:weather:${week}`);
  const k = w.strain;
  const season = seasonOf(week);
  const table: [WeatherKind, number][] = season === "spring"
    ? [["clear", 4], ["rain", 4], ["storm", 1 + k / 50], ["fog", 1.5], ["hot", 0.5 + k / 60]]
    : season === "summer"
      ? [["clear", 3], ["hot", 4], ["heatwave", 0.8 + k / 22], ["storm", 0.8 + k / 45], ["dust", 0.3 + k / 55], ["superstorm", k / 110]]
      : season === "autumn"
        ? [["rain", 4], ["storm", 1.5 + k / 30], ["superstorm", 0.15 + k / 70], ["fog", 2], ["clear", 2]]
        : [["cold", 4], ["freeze", 0.8 + k / 45], ["clear", 2], ["fog", 1], ["storm", 0.6 + k / 60]];
  if (w.pollution > 25) table.push(["smog", w.pollution / 18]);
  return { kind: r.weighted(table, (x) => x[1])[0], week };
}

const exposed = (s: SaveState): Person[] => Object.values(s.people).filter((p) =>
  (p.status === "owned" || p.status === "indentured") &&
  (p.assignment === "whore" || p.assignment === "public servant" || p.facility === "farmyard" || p.assignment === "recruit girls"));
const household = (s: SaveState): Person[] => Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");

/** One week of the world. Called in endWeek before the arcology's money is settled. */
export function tickWorld(s: SaveState, led: Ledger): ReportLine[] {
  const w = worldOf(s);
  const week = s.arcology.week;
  const r = rng(`${w.seed}:week:${week}`);
  const lines: ReportLine[] = [];
  const arc = s.arcology;
  const push = (text: string, tone: ReportLine["tone"] = "neutral", weight = 6) => lines.push({ text, tone, weight });
  const news = (text: string, tone: ReportLine["tone"] = "neutral") => { w.headlines.push({ week, text, tone }); };

  /* ── climate and pollution ── */
  const districts = s.city?.districts ?? [];
  const works = districts.filter((d) => d.kind === "industrial" && d.level > 0).reduce((n, d) => n + d.level, 0);
  const cleaner = arc.policies["sanitation"] ? 0.6 : 1;
  const flags = s.story?.flags ?? {};
  const scrubbed = flags["scrubbers"] ? 0.4 : 1;
  w.pollution = clamp(w.pollution * 0.9 + works * 2.2 * cleaner * scrubbed + (arc.facilities["dairy"]?.level ?? 0) * 0.4, 0, 100);
  w.strain = clamp(w.strain + 0.3 + w.pollution / 400, 0, 100);

  /* ── the weather ── */
  w.weather = w.forecast.shift() ?? rollWeather(s, w, week);
  w.weather.week = week;
  w.forecast.push(rollWeather(s, w, week + w.forecast.length + 1));
  const season = seasonOf(week);
  const kind = w.weather.kind;
  const def = WEATHER[kind];
  push(`Weather: ${def.line}`, ["superstorm", "heatwave", "freeze", "smog"].includes(kind) ? "bad" : kind === "storm" || kind === "dust" ? "warning" : "neutral", ["superstorm", "heatwave"].includes(kind) ? 9 : 3);

  const hurtExposed = (health: number, energy: number, why: string) => {
    const who = exposed(s);
    for (const p of who) { p.health.health = clamp(p.health.health + health, -100, 100); p.health.energy = clamp(p.health.energy + energy, 0, 100); }
    if (who.length) push(`${who.map((p) => p.name).slice(0, 4).join(", ")}${who.length > 4 ? ` and ${who.length - 4} others` : ""} ${why}.`, "bad", 6);
  };
  const disruptRoutes = (weeks: number) => {
    for (const route of s.city?.routes ?? []) route.disrupted = Math.max(route.disrupted, weeks);
  };

  switch (kind) {
    case "hot":
      led.spend("world", "extra cooling in the heat", 300 + w.strain * 6);
      if (arc.facilities["club"]?.level) led.earn("world", "the club sells more drinks in the heat", 400);
      break;
    case "heatwave":
      led.spend("world", "power for cooling during the heatwave", 1200 + w.strain * 25);
      hurtExposed(-5, -12, "suffered working in the heatwave");
      arc.food.production *= 0.85;
      if (flags["desal"]) {
        if (flags["water_seller"]) led.earn("world", "selling desalinated water to the neighbors", 2500);
      } else arc.prosperity = clamp(arc.prosperity - 2, 5, 200);
      break;
    case "storm":
      led.spend("world", "storm repairs", flags["sea_wall"] ? 300 : 900);
      disruptRoutes(1);
      break;
    case "superstorm": {
      const guard = (flags["sea_wall"] ? 0.4 : 1) * (flags["shutters"] ? 0.6 : 1);
      const dmg = Math.round((4000 + w.strain * 90) * guard);
      led.spend("world", "superstorm damage", dmg);
      disruptRoutes(2 + r.int(0, 1));
      arc.prosperity = clamp(arc.prosperity - 5, 5, 200);
      arc.food.stores = Math.round(arc.food.stores * 0.9);
      const who = exposed(s);
      const hurt = who.length ? r.pick(who) : undefined;
      if (hurt) {
        hurt.health.health = clamp(hurt.health.health - 25, -100, 100);
        hurt.health.injuries.push({ what: "hurt by flying debris in the superstorm", severity: "notable", week });
        push(`${hurt.name} was caught out in the superstorm and hurt by flying debris.`, "bad", 8);
      }
      break;
    }
    case "cold": led.spend("world", "heating", 500 + w.strain * 4); break;
    case "freeze":
      led.spend("world", "heating and burst pipes in the freeze", 1500 + w.strain * 15);
      arc.food.production *= 0.7;
      for (const p of exposed(s)) if (r.chance(0.3)) { p.health.illness = Math.max(p.health.illness, 1) as 1; }
      hurtExposed(-3, -8, "got badly chilled working in the freeze");
      break;
    case "dust":
      arc.food.production *= 0.8;
      for (const p of household(s)) p.health.health = clamp(p.health.health - 1, -100, 100);
      led.spend("world", "replacing clogged air filters", 600);
      break;
    case "smog":
      for (const p of household(s)) p.health.health = clamp(p.health.health - 2, -100, 100);
      arc.prosperity = clamp(arc.prosperity - 2, 5, 200);
      break;
  }
  if (season === "winter") arc.food.production *= 0.75;
  if (season === "summer") arc.food.production *= 1.1;
  if (w.pollution > 40) {
    arc.prosperity = clamp(arc.prosperity - w.pollution / 60, 5, 200);
    if (r.chance(0.3)) push(`Pollution from your industry is at ${Math.round(w.pollution)}. Citizens are complaining about the air.`, "warning", 5);
  }

  /* ── the economy ── */
  const e = w.economy;
  const before = e.phase;
  e.trend = e.trend * 0.8 + r.normal(0, 2.2) + (100 - e.index) * 0.05;
  if (r.chance(0.015)) e.trend -= 20;
  e.index = clamp(e.index + e.trend, 55, 150);
  e.phase = e.index < 75 ? "crash" : e.index < 92 ? "slump" : e.index > 112 ? "boom" : "steady";
  if (e.phase !== before) {
    if (e.phase === "crash") news(r.pick(HEADLINES.crash), "bad");
    else if (e.phase === "boom") news(r.pick(HEADLINES.boomEconomy), "good");
    else if (e.phase === "slump") news(r.pick(HEADLINES.slump), "warning");
  }
  const econ = Math.round((e.index - 100) * (40 + arc.population / 60));
  if (Math.abs(econ) > 50) led.entry("world", e.index >= 100 ? "the economy is strong" : "the economy is weak", econ);

  /* ── the regions ── */
  for (const reg of REGIONS) {
    const run = (w.regions[reg.id] ??= { stability: 50, state: "calm", since: week });
    run.stability = clamp(run.stability + r.normal(0, 8) + (52 - run.stability) * 0.015 - w.strain / 200, 0, 100);
    let next = stateFor(run.stability);
    if (run.plague_until && week < run.plague_until) next = "plague";
    else if (run.plague_until && week >= run.plague_until) run.plague_until = undefined;
    else if (run.stability < 55 && r.chance(0.008 + w.strain / 8000)) { run.plague_until = week + 6 + r.int(0, 5); next = "plague"; }
    if (next !== run.state) {
      const worse = ["collapse", "war", "plague", "unrest"].includes(next);
      const pool = next === "calm" ? HEADLINES.recover : HEADLINES[next];
      news(r.pick(pool).replaceAll("{r}", reg.name), worse ? "bad" : "good");
      run.state = next;
      run.since = week;
    }
    const route = s.city?.routes.find((x) => x.region === reg.id);
    if (route && (run.state === "war" || run.state === "collapse")) route.disrupted = Math.max(route.disrupted, 1);
    if (route && run.state === "plague" && r.chance(0.12)) {
      const p = r.pick(household(s));
      if (p && !p.health.illness) { p.health.illness = 1; push(`${p.name} caught the fever that came in on a ship from ${reg.name}.`, "bad", 7); }
    }
    if (route && run.state === "boom") led.earn("world", `strong demand from ${reg.name}`, 600);
  }

  /* ── neighbours, the climate, and everything else on the wire ── */
  for (const n of arc.neighbours) {
    if (r.chance(0.04)) news(r.pick(HEADLINES.neighborFS).replaceAll("{n}", n.name).replaceAll("{fs}", r.pick(NEIGHBOR_FS)));
    else if (n.prosperity > 120 && r.chance(0.04)) news(r.pick(HEADLINES.neighborRich).replaceAll("{n}", n.name));
    else if (n.prosperity < 35 && r.chance(0.05)) news(r.pick(HEADLINES.neighborPoor).replaceAll("{n}", n.name), "warning");
  }
  if (r.chance(0.2 + w.strain / 300)) news(r.pick(HEADLINES.climate), "warning");
  if (r.chance(0.45)) news(r.pick(HEADLINES.flavor));
  if (w.headlines.length > 60) w.headlines = w.headlines.slice(-60);
  for (const h of w.headlines.filter((x) => x.week === week)) push(`News: ${h.text}`, h.tone, 4);

  /* ── crises: when the world has gone far enough, a world arc starts ── */
  startCrises(s, w);

  return lines;
}

function startCrises(s: SaveState, w: WorldState): void {
  const st = s.story;
  if (!st || st.ended) return;
  const week = s.arcology.week;
  if (week - w.last_crisis < 3) return;
  for (const def of allArcs().filter((a) => a.kind === "world")) {
    const run = st.arcs[def.id];
    if (run && !run.done) continue;
    const last = w.crisis_started[def.id];
    if (last !== undefined && (!def.repeat || week - last < def.repeat)) continue;
    if (!def.when || !def.when(s, st)) continue;
    if (run) delete st.arcs[def.id];
    startArc(s, st, def);
    w.crisis_started[def.id] = week;
    w.last_crisis = week;
    promote(s);
    return;
  }
}

/* ── reads for the UI and the narrator ────────────────────────────────────────────────────── */

export function regionState(s: SaveState, id: string): RegionState {
  return worldOf(s).regions[id]?.state ?? "calm";
}

export function worstRegion(s: SaveState, states: RegionState[]): { id: string; name: string; run: RegionRun } | undefined {
  const w = worldOf(s);
  const hits = Object.entries(w.regions).filter(([, run]) => states.includes(run.state)).sort((a, b) => a[1].stability - b[1].stability);
  if (!hits.length) return undefined;
  const [id, run] = hits[0];
  return { id, name: REGION_BY_ID[id]?.name ?? id, run };
}

/** What is coming, for the Penthouse: the forecast, and every story beat due in the next weeks. */
export function comingUp(s: SaveState): { weeks: number; text: string; tone: ReportLine["tone"] }[] {
  const w = worldOf(s);
  const week = s.arcology.week;
  const out: { weeks: number; text: string; tone: ReportLine["tone"] }[] = [];
  w.forecast.forEach((f, i) => {
    const d = WEATHER[f.kind];
    if (f.kind === "clear" || f.kind === "fog") return;
    out.push({ weeks: i + 1, text: `Forecast: ${d.name.toLowerCase()} — ${d.effect}.`, tone: ["superstorm", "heatwave", "freeze"].includes(f.kind) ? "bad" : "neutral" });
  });
  for (const a of Object.values(s.story?.arcs ?? {})) {
    if (a.done || !a.beat) continue;
    const def = arcDef(a.id);
    if (!def || a.due <= week) continue;
    const beat = def.beats[a.beat];
    const title = beat ? (typeof beat.title === "function" ? "" : beat.title) : "";
    out.push({ weeks: a.due - week, text: `${def.title}${title ? `: ${title}` : ""}`, tone: def.kind === "world" ? "warning" : "neutral" });
  }
  for (const loan of s.arcology.loans) if (loan.due_week > week && loan.due_week - week <= 4) out.push({ weeks: loan.due_week - week, text: `A ${loan.lender} loan payment is due.`, tone: "warning" });
  for (const [id, run] of Object.entries(w.regions)) {
    if (run.state === "war" || run.state === "collapse" || run.state === "plague") out.push({ weeks: 0, text: `${REGION_BY_ID[id]?.name ?? id} is ${REGION_STATE_WORD[run.state]}.`, tone: "bad" });
  }
  return out.sort((a, b) => a.weeks - b.weeks);
}

/** The world in a few lines, for the narrator's state document. */
export function worldBrief(s: SaveState): string {
  if (!s.world) return "";
  const w = s.world;
  const troubled = Object.entries(w.regions).filter(([, r]) => r.state !== "calm").map(([id, r]) => `${REGION_BY_ID[id]?.name ?? id} ${REGION_STATE_WORD[r.state]}`);
  return [
    `Season: ${seasonOf(s.arcology.week)}. Weather this week: ${WEATHER[w.weather.kind].line}`,
    `Economy: ${w.economy.phase}.${troubled.length ? ` Abroad: ${troubled.join("; ")}.` : ""}`,
    w.headlines.filter((h) => h.week >= s.arcology.week - 2).slice(-3).map((h) => `News: ${h.text}`).join(" "),
  ].filter(Boolean).join("\n");
}
