/**
 * POWER — your arsenal, the other powers on the map, and what passes between you.
 *
 * Every place on the World screen that isn't yours is a power: the neighbouring arcologies, the
 * distant Free Cities, and the Old World states. Each has a strength, an opinion of you, and a
 * status (free, allied, your vassal, conquered, or at war with you). Each week they act on that
 * opinion: the ones who like you offer trade and alliances, the ones who hate you sanction you,
 * spy on you, arm your enemies, try to kill you, or come for you outright. You answer with envoys
 * and gifts, pacts and alliances, demands for tribute, ultimatums, spies and coups, and war
 * (engine/war). Take enough of the world and the world is yours.
 */
import type { SaveState } from "./types";
import { PROGRAMS, PROGRAM_BY_ID, type Branch } from "../data/arsenal";
import { places, type Place } from "./globe";
import { cityOf, militaryStrength } from "./city";
import { skill } from "./player";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { startRumor } from "./social";
import { worldOf } from "./world";
import { registerEvents, fireEvent, type EventDef } from "./events";
import { generatePerson } from "./generate";
import { newMemory } from "./memory";
import { refresh } from "./obedience";

export type PowerStatus = "free" | "allied" | "vassal" | "conquered";

export interface PowerRec {
  /** Opinion of you, −100 … 100. Neighbours keep theirs on the neighbour itself. */
  attitude: number;
  status: PowerStatus;
  /** Damage done to them that hasn't healed: a war, a sabotage. Subtracted from their strength. */
  hurt: number;
  /** What they won't forget: wars, coups, insults. Feeds how hard they hit back. */
  grudge: number;
  pact?: boolean;
  since?: number;
  /** Last week you sent them anything, and last week they did anything to you. */
  last_you?: number;
  last_them?: number;
  /** Tribute or income they send each week, once they're yours. */
  pays?: number;
  /** Kept once they're conquered, for a neighbour that has been folded into your city and left the map. */
  name?: string;
  base?: number;
}

export interface Empire {
  /** Units of each program you own, and anything under construction. */
  arsenal: Record<string, number>;
  building: { id: string; left: number }[];
  /** 0–100: how ready your forces are. Falls at war, recovers in peace. */
  readiness: number;
  powers: Record<string, PowerRec>;
  wars: import("./war").War[];
  /** Which power an event that's waiting on you is about, by event kind. */
  about: Record<string, string>;
  /** Security still lost to the last war, weeks it has left. */
  scar?: { weeks: number; per: number };
  log: { week: number; text: string }[];
  /** Week you became master of the world, once you are. */
  dictator?: number;
}

export function empireOf(s: SaveState): Empire {
  const e = (s.empire ??= { arsenal: {}, building: [], readiness: 100, powers: {}, wars: [], about: {}, log: [] });
  e.about ??= {};
  return e;
}

export const note = (s: SaveState, text: string) => { const e = empireOf(s); e.log.push({ week: s.arcology.week, text }); if (e.log.length > 60) e.log.shift(); };

/* ── the arsenal ─────────────────────────────────────────────────────────────────────────────── */

export const has = (s: SaveState, id: string) => (empireOf(s).arsenal[id] ?? 0) > 0;
export const units = (s: SaveState, id: string) => empireOf(s).arsenal[id] ?? 0;

/** Why you can't buy this now, or null. */
export function canBuild(s: SaveState, id: string): string | null {
  const p = PROGRAM_BY_ID[id];
  if (!p) return "no such program";
  const e = empireOf(s);
  const owned = units(s, id) + e.building.filter((b) => b.id === id).length;
  if (owned >= p.max) return p.max === 1 ? "you have it" : `you have all ${p.max}`;
  const missing = (p.needs ?? []).filter((n) => !has(s, n));
  if (missing.length) return `needs ${missing.map((n) => PROGRAM_BY_ID[n]?.name.toLowerCase() ?? n).join(" and ")}`;
  if (p.district && !cityOf(s).districts.some((d) => d.kind === p.district && d.level > 0)) return `needs a ${p.district === "docks" ? "docks" : p.district} district`;
  if (p.branch === "air" && id !== "drones" && !has(s, "airport")) return "needs an airport";
  if (p.branch === "space" && !has(s, "launch")) return "needs a launch complex";
  if (s.arcology.cash < p.cost) return `costs ¤${p.cost.toLocaleString()}`;
  return null;
}

export function build(s: SaveState, id: string): { ok: boolean; line: string } {
  const why = canBuild(s, id);
  if (why) return { ok: false, line: why };
  const p = PROGRAM_BY_ID[id];
  s.arcology.cash -= p.cost;
  empireOf(s).building.push({ id, left: p.weeks });
  practiseCommand(s, p.cost);
  return { ok: true, line: `${p.name}: paid for, ready in ${p.weeks} weeks.` };
}

function practiseCommand(s: SaveState, spend: number) {
  const now = s.player.skills.command ?? 0;
  s.player.skills.command = clamp(now + Math.min(3, spend / 400_000) * (1 - now / 130), 0, 100);
}

/** Your forces, by branch, and in all. Readiness and the AI network are folded in. */
export function forces(s: SaveState): { total: number; by: Record<Branch, number>; defence: number; upkeep: number } {
  const e = empireOf(s);
  const by = { grand: 0, ground: 0, air: 0, sea: 0, missile: 0, cyber: 0, space: 0 } as Record<Branch, number>;
  let defence = 0, upkeep = 0;
  for (const p of PROGRAMS) {
    const n = units(s, p.id);
    if (!n) continue;
    by[p.branch] += p.power * n;
    defence += (p.defence ?? 0) * n;
    upkeep += p.upkeep * n;
  }
  if (by.cyber) by.cyber *= 1 + (s.player.skills.hacking ?? 0) / 100;
  const net = has(s, "ai_net") ? 1.15 : 1;
  const ready = 0.4 + (e.readiness / 100) * 0.6;
  const arsenal = Object.values(by).reduce((a, b) => a + b, 0) * net * ready * skill.command(s);
  return { total: Math.round(militaryStrength(s) + arsenal), by, defence: +defence.toFixed(1), upkeep };
}

/* ── the powers ──────────────────────────────────────────────────────────────────────────────── */

export interface PowerView extends Place {
  strength: number;
  attitude: number;
  rec: PowerRec;
  atWar: boolean;
}

function baseStrength(s: SaveState, p: Place): number {
  const g = rng(`${s.id}:power:${p.id}`);
  if (p.kind === "neighbour") { const n = s.arcology.neighbours.find((x) => x.id === p.id); return Math.round((n?.prosperity ?? 50) * 0.5 + 20); }
  if (p.kind === "freecity") return Math.round(p.radiusKm * 1.4 + g.int(10, 50));
  // An Old World state: big, and weaker the further it has fallen apart.
  const stab = worldOf(s).regions[p.id.replace(/^region:/, "")]?.stability ?? 50;
  return Math.round(g.int(180, 320) * (0.45 + stab / 180));
}

function startingAttitude(s: SaveState, p: Place): number {
  const g = rng(`${s.id}:attitude:${p.id}`);
  const mine = new Set(Object.keys(s.arcology.doctrines));
  const shared = (p.doctrines ?? []).filter((d) => mine.has(d)).length;
  return p.kind === "region" ? g.int(-45, 5) : g.int(-25, 25) + shared * 15;
}

export function recOf(s: SaveState, p: Place): PowerRec {
  const e = empireOf(s);
  return (e.powers[p.id] ??= { attitude: startingAttitude(s, p), status: "free", hurt: 0, grudge: 0 });
}

export function attitudeOf(s: SaveState, id: string): number {
  const n = s.arcology.neighbours.find((x) => x.id === id);
  return n ? n.attitude : empireOf(s).powers[id]?.attitude ?? 0;
}

export function shift(s: SaveState, id: string, by: number): void {
  const n = s.arcology.neighbours.find((x) => x.id === id);
  if (n) n.attitude = clamp(n.attitude + by, -100, 100);
  const r = empireOf(s).powers[id];
  if (r) r.attitude = clamp(r.attitude + by, -100, 100);
}

/** Every power on the map that isn't you, with its strength and opinion this week. */
export function powers(s: SaveState): PowerView[] {
  const e = empireOf(s);
  return places(s).filter((p) => p.kind !== "yours").map((p) => {
    const rec = recOf(s, p);
    if (p.kind === "neighbour") rec.attitude = attitudeOf(s, p.id);
    return { ...p, rec, strength: Math.max(5, baseStrength(s, p) - rec.hurt), attitude: Math.round(rec.attitude), atWar: e.wars.some((w) => w.target === p.id && !w.ended) };
  });
}

export function powerById(s: SaveState, id: string): PowerView | undefined {
  return powers(s).find((p) => p.id === id);
}

export function attitudeWord(a: number): string {
  return a <= -60 ? "hates you" : a <= -25 ? "hostile" : a < 25 ? "wary" : a < 60 ? "friendly" : "close";
}

/** How much of the world answers to you, 0–1, by strength. */
/** Conquered powers that have left the map: neighbours folded into your city. */
export function absorbed(s: SaveState): (PowerRec & { id: string })[] {
  const here = new Set(places(s).map((p) => p.id));
  return Object.entries(empireOf(s).powers).filter(([id, r]) => r.status === "conquered" && !here.has(id)).map(([id, r]) => ({ ...r, id }));
}

/** Remember who they were, for when they're no longer on the map. */
export function keepRecord(s: SaveState, p: PowerView): void {
  p.rec.name = p.name;
  p.rec.base = baseStrength(s, p);
}

export function dominion(s: SaveState): { share: number; title: string; yours: number; all: number } {
  const ps = powers(s);
  const gone = absorbed(s).reduce((n, r) => n + (r.base ?? 50), 0);
  const all = ps.reduce((n, p) => n + baseStrength(s, p), 0) + gone;
  const yours = gone + ps.reduce((n, p) => n + (p.rec.status === "conquered" ? 1 : p.rec.status === "vassal" ? 0.7 : p.rec.status === "allied" ? 0.15 : 0) * baseStrength(s, p), 0);
  const share = all ? yours / all : 0;
  const done = ps.length > 0 && ps.every((p) => p.rec.status === "conquered" || p.rec.status === "vassal");
  const title = done ? "Master of the World" : share >= 0.6 ? "Emperor" : share >= 0.3 ? "Hegemon" : share >= 0.1 ? "Regional power" : "Arcology owner";
  return { share: done ? 1 : share, title, yours: Math.round(yours), all: Math.round(all) };
}

/* ── diplomacy: what you can send them ───────────────────────────────────────────────────────── */

export type Move = "envoy" | "gift" | "pact" | "alliance" | "tribute" | "ultimatum" | "spy" | "coup" | "debt";

export const MOVES: Record<Move, { label: string; note: string }> = {
  envoy: { label: "Send an envoy", note: "warms them; better with Diplomacy" },
  gift: { label: "Send a lavish gift", note: "warms them a lot" },
  pact: { label: "Offer a trade pact", note: "needs them friendly; money both ways, every week" },
  alliance: { label: "Propose an alliance", note: "needs them close and a pact; they fight beside you" },
  tribute: { label: "Demand tribute", note: "needs twice their strength; they pay, or they hate you for asking" },
  ultimatum: { label: "Ultimatum: submit or else", note: "needs three times their strength; they kneel, or it's war" },
  spy: { label: "Run an operation against them", note: "needs your intelligence service; weakens them" },
  coup: { label: "Back a coup", note: "needs intelligence and special forces; a puppet, or a scandal" },
  debt: { label: "Buy up their debt", note: "Old World states only; needs your debt desk" },
};

export function moveCost(s: SaveState, p: PowerView, m: Move): number {
  const far = 1 + p.km / 6000;
  switch (m) {
    case "envoy": return Math.round(8_000 * far);
    case "gift": return Math.round(40_000 + p.strength * 400);
    case "spy": return 60_000;
    case "coup": return Math.round(150_000 + p.strength * 1500);
    case "debt": return Math.round(p.strength * 6_000);
    default: return 0;
  }
}

export function canMove(s: SaveState, p: PowerView, m: Move): string | null {
  if (p.rec.status === "conquered") return "it's yours";
  if (p.atWar && m !== "envoy") return "you're at war with them";
  if (p.rec.last_you !== undefined && s.arcology.week - p.rec.last_you < 3) return "you've sent them something recently; wait a few weeks";
  const mine = forces(s).total;
  const cost = moveCost(s, p, m);
  if (cost && s.arcology.cash < cost) return `costs ¤${cost.toLocaleString()}`;
  switch (m) {
    case "pact": return p.rec.pact ? "you have one" : p.attitude < 25 ? "they need to be friendly first (25+)" : null;
    case "alliance": return p.rec.status === "allied" ? "already allied" : !p.rec.pact ? "needs a trade pact first" : p.attitude < 55 ? "they need to be close (55+)" : null;
    case "tribute": return p.rec.status === "vassal" ? "they already pay" : mine < p.strength * 2 ? `needs twice their strength (${p.strength * 2}; you have ${mine})` : null;
    case "ultimatum": return p.rec.status === "vassal" ? "they already answer to you" : mine < p.strength * 3 ? `needs three times their strength (${p.strength * 3}; you have ${mine})` : null;
    case "spy": return has(s, "intel") ? null : "needs a private intelligence service";
    case "coup": return !has(s, "intel") || !has(s, "special") ? "needs intelligence and special forces" : p.rec.status === "vassal" ? "they already answer to you" : null;
    case "debt": return p.kind !== "region" ? "only Old World states sell their debt" : !has(s, "bank") ? "needs a sovereign debt desk" : p.rec.status === "vassal" ? "you already own them" : null;
    default: return null;
  }
}

/** Do it. Returns what happened. War is engine/war. */
export function makeMove(s: SaveState, id: string, m: Move): { ok: boolean; line: string } {
  const p = powerById(s, id);
  if (!p) return { ok: false, line: "No such power." };
  const why = canMove(s, p, m);
  if (why) return { ok: false, line: why };
  const r = rng(`move:${s.id}:${id}:${m}:${s.arcology.week}`);
  const cost = moveCost(s, p, m);
  s.arcology.cash -= cost;
  p.rec.last_you = s.arcology.week;
  const dip = skill.diplomacy(s);
  const practise = (n: number) => { const now = s.player.skills.diplomacy ?? 0; s.player.skills.diplomacy = clamp(now + n * (1 - now / 130), 0, 100); };
  let line = "";
  switch (m) {
    case "envoy": { const by = Math.round(5 + dip * 14 + r.int(-2, 4)); shift(s, id, by); practise(1.5); line = `Your envoy spends a week in ${p.name}. They come back warmer (+${by}).`; break; }
    case "gift": { const by = Math.round(12 + dip * 8); shift(s, id, by); practise(0.5); line = `${p.name} receives your gift in public. Their opinion of you rises (+${by}).`; break; }
    case "pact": { p.rec.pact = true; shift(s, id, 5); practise(2); line = `A trade pact with ${p.name}. Cargo moves both ways, and both of you get richer every week.`; break; }
    case "alliance": { p.rec.status = "allied"; p.rec.since = s.arcology.week; shift(s, id, 10); practise(3); startRumor(s, `${s.arcology.name} and ${p.name} are allies now`, { salience: 7 }); line = `${p.name} signs an alliance with you. Their forces will fight beside yours.`; break; }
    case "tribute": {
      const yes = r.chance(clamp(0.35 + (p.attitude + 30) / 150 + dip * 0.3, 0.05, 0.95));
      if (yes) { p.rec.status = "vassal"; p.rec.since = s.arcology.week; p.rec.pays = Math.round(p.strength * 120); shift(s, id, -10); line = `${p.name} agrees to pay you ¤${p.rec.pays.toLocaleString()} a week. They aren't happy about it.`; }
      else { shift(s, id, -25); p.rec.grudge = clamp(p.rec.grudge + 20, 0, 100); line = `${p.name} refuses, and publishes your demand so the world can see it.`; }
      practise(1); break;
    }
    case "ultimatum": {
      const yes = r.chance(clamp(0.5 + dip * 0.3 + (forces(s).total / p.strength - 3) * 0.1, 0.1, 0.95));
      if (yes) { p.rec.status = "vassal"; p.rec.since = s.arcology.week; p.rec.pays = Math.round(p.strength * 160); p.rec.grudge = clamp(p.rec.grudge + 25, 0, 100); line = `${p.name} submits. Its government will pay you ¤${p.rec.pays.toLocaleString()} a week and answer to you.`; }
      else { line = `${p.name} rejects your ultimatum.`; return { ok: true, line: `${line} ${startWarLine(s, id, "you")}` }; }
      break;
    }
    case "spy": {
      const caught = r.chance(clamp(0.35 - (s.player.skills.hacking ?? 0) / 300, 0.05, 0.6));
      p.rec.hurt += Math.round(p.strength * 0.15);
      if (caught) { shift(s, id, -20); p.rec.grudge = clamp(p.rec.grudge + 15, 0, 100); line = `Your operation in ${p.name} works, but they catch one of your people, and they know who sent him.`; }
      else line = `Your people blow up a fuel depot and a radar station in ${p.name}. Nobody can prove it was you.`;
      break;
    }
    case "coup": {
      const ok = r.chance(clamp(0.3 + (forces(s).total / p.strength) * 0.05 + (100 - p.attitude) / 600, 0.1, 0.8));
      if (ok) { p.rec.status = "vassal"; p.rec.since = s.arcology.week; p.rec.pays = Math.round(p.strength * 100); p.rec.attitude = 40; line = `The coup in ${p.name} succeeds. Its new government owes you everything, and knows it.`; }
      else { shift(s, id, -45); p.rec.grudge = clamp(p.rec.grudge + 40, 0, 100); s.arcology.rep = Math.max(0, s.arcology.rep - 600); line = `The coup in ${p.name} fails. Your people are paraded on their television, and the whole world knows it was you.`; }
      break;
    }
    case "debt": { p.rec.status = "vassal"; p.rec.since = s.arcology.week; p.rec.pays = Math.round(p.strength * 90); shift(s, id, -10); line = `You own ${p.name}'s debt. Its government does what your bank says now, and pays ¤${p.rec.pays.toLocaleString()} a week in interest.`; break; }
  }
  note(s, line);
  return { ok: true, line };
}

/** Defined in engine/war, set there to avoid a circular import. */
let warStarter: (s: SaveState, id: string, by: "you" | "them") => string = () => "";
export function setWarStarter(f: typeof warStarter) { warStarter = f; }
export const startWarLine = (s: SaveState, id: string, by: "you" | "them") => warStarter(s, id, by);

/* ── the week ────────────────────────────────────────────────────────────────────────────────── */

/** Programs finish, upkeep is paid, vassals pay, opinions move, and the powers act. */
export function tickPowers(s: SaveState): { lines: string[]; cash: number } {
  const e = empireOf(s);
  const lines: string[] = [];
  let cash = 0;
  const week = s.arcology.week;
  const r = rng(`powers:${s.id}:${week}`);

  // Construction.
  for (const b of [...e.building]) {
    b.left--;
    if (b.left > 0) continue;
    e.building = e.building.filter((x) => x !== b);
    e.arsenal[b.id] = (e.arsenal[b.id] ?? 0) + 1;
    const p = PROGRAM_BY_ID[b.id];
    lines.push(`${p?.name ?? b.id} is ready.`);
    note(s, `${p?.name ?? b.id} entered service.`);
    if (b.id === "airport") startRumor(s, `the first flights are landing at ${s.arcology.name}'s new airport`, { salience: 7, charge: 1 });
  }
  const f = forces(s);
  cash -= f.upkeep;
  if (has(s, "airport")) cash += 6_000;
  if (has(s, "airline")) { cash += 12_000; s.arcology.rep += 20; }
  if (has(s, "media")) s.arcology.rep += 40;
  if (!e.wars.some((w) => !w.ended)) e.readiness = clamp(e.readiness + 6, 0, 100);
  if (e.scar && e.scar.weeks > 0) { s.arcology.security = clamp(s.arcology.security - e.scar.per, 0, 100); e.scar.weeks--; }

  for (const r of absorbed(s)) cash += r.pays ?? 0;
  for (const p of powers(s)) {
    const rec = p.rec;
    rec.hurt = Math.max(0, rec.hurt - 2);
    rec.grudge = Math.max(0, rec.grudge - 0.3);
    if (rec.status === "conquered") { cash += rec.pays ?? 0; continue; }
    if (rec.status === "vassal") {
      cash += rec.pays ?? 0;
      if (p.attitude < -50 && r.chance(0.06)) { rec.status = "free"; rec.pays = 0; lines.push(`${p.name} has stopped paying you, and thrown out your people. It's in revolt.`); note(s, `${p.name} revolted.`); }
      continue;
    }
    // Opinion drifts: your diplomacy, your media, pacts, and what they hold against you.
    if (p.kind !== "neighbour") rec.attitude = clamp(rec.attitude + skill.diplomacy(s) * 1.2 + (has(s, "media") ? 0.6 : 0) + (has(s, "airline") ? 0.3 : 0) + (rec.pact ? 0.4 : 0) - rec.grudge / 60, -100, 100);
    if (rec.pact) cash += Math.round(p.strength * 25);
    if (p.atWar) continue;
    // What they do about you. At most once every five weeks each, and not every time they could.
    if (rec.last_them !== undefined && week - rec.last_them < 5) continue;
    if (!r.chance(0.18)) continue;
    const a = p.attitude;
    const theirs = p.strength, mine = f.total;
    let kind = "";
    if (a <= -60 && week > 20 && theirs > mine * 0.9 && r.chance(0.35)) { rec.last_them = week; lines.push(startWarLine(s, p.id, "them")); continue; }
    if (a <= -60) kind = r.pick(["assassins", "terror", "sabotage"]);
    else if (a <= -25) kind = r.pick(["sanctions", "smear", "sabotage", "raiders"]);
    else if (a < 25) kind = r.chance(0.5) ? "envoy_demand" : "";
    else if (a < 60) kind = rec.pact ? "summit" : "trade_offer";
    else kind = rec.status === "allied" ? "ally_gift" : "alliance_offer";
    if (!kind) continue;
    rec.last_them = week;
    if (kind === "sanctions") { const n = Math.round(4_000 + theirs * 60); cash -= n; lines.push(`${p.name} has put sanctions on your trade. It's costing you ¤${n.toLocaleString()} this week.`); note(s, `${p.name} sanctioned you.`); continue; }
    if (kind === "smear") { s.arcology.rep = Math.max(0, s.arcology.rep - 250); lines.push(`${p.name}'s state media has been running stories about you all week. Some of them are true.`); continue; }
    if (kind === "raiders") { const h = (s.battles ??= []); if (!s.events.some((x) => x.kind === "attack")) { h.push({ attacker: "mercs", size: +(3 + theirs / 40).toFixed(1), week }); fireEvent(s, "attack"); lines.push(`${p.name} has paid a mercenary company to hit you.`); } continue; }
    e.about[kind] = p.id;
    if (fireEvent(s, kind)) note(s, `${p.name}: ${kind.replace(/_/g, " ")}.`);
  }
  return { lines, cash };
}

/* ── what they send you ──────────────────────────────────────────────────────────────────────── */

/** The power a waiting event is about, or a stand-in so an event can always resolve. */
export function aboutOf(s: SaveState, kind: string): PowerView {
  const id = empireOf(s).about[kind];
  const p = (id && powerById(s, id)) || powers(s)[0];
  return p ?? ({ id: "nobody", kind: "freecity", name: "a distant Free City", at: [0, 0], radiusKm: 50, lines: [], km: 3000, strength: 60, attitude: 0, rec: { attitude: 0, status: "free", hurt: 0, grudge: 0 }, atWar: false } as PowerView);
}

function gift(s: SaveState, n: number, how: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const p = generatePerson({ seed: `gift:${s.id}:${s.arcology.week}:${i}`, week: s.arcology.week, quality: 0.75 });
    p.origin.acquired_how = how; p.origin.acquired_week = s.arcology.week; p.economics.price_paid = 0;
    s.people[p.id] = p; s.memory[p.id] = newMemory(); refresh(p, s.memory[p.id]);
    out.push(p.name);
  }
  return out;
}

export const POWER_EVENTS: EventDef[] = [
  {
    id: "assassins", severity: "major", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `Your security chief wakes you at four in the morning. Two men were caught in the service shafts under the penthouse with rifles and floor plans, and one of them has talked: ${aboutOf(s, "assassins").name} sent them. They wanted you dead before the end of the month.\n\nThe second man hasn't said anything yet.`,
    options: [
      { id: "public", label: "Parade them on every feed, and name who sent them", resolve: (s) => { const p = aboutOf(s, "assassins"); s.arcology.rep += 400; shift(s, p.id, -10); for (const o of powers(s)) if (o.id !== p.id) shift(s, o.id, -3 * (o.attitude < 0 ? 0 : 1)); return `The confessions run on every feed in the Free Cities. ${p.name} denies all of it and nobody believes them. Your own people rally to you; the world gets a little more nervous.`; } },
      { id: "return", label: "Send them back where they came from, in pieces", resolve: (s) => { const p = aboutOf(s, "assassins"); p.rec.grudge = clamp(p.rec.grudge + 20, 0, 100); s.arcology.security = clamp(s.arcology.security + 6, 0, 100); return `You send the bodies back to ${p.name} in a refrigerated container, with your compliments. They understand the message. So does everyone who hears about it.`; } },
      { id: "turn", label: "Turn the quiet one, and send him home", resolve: (s) => { const p = aboutOf(s, "assassins"); p.rec.hurt += Math.round(p.strength * 0.1); return `The quiet one goes home a rich man and your agent. For months you know what ${p.name} is planning before its own ministers do.`; } },
    ],
  },
  {
    id: "terror", severity: "major", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `A bomb went off on the concourse at the evening rush. Eleven dead, forty wounded, and the fountain is a crater. The group that claimed it is a front, and your analysts are certain who pays for it: ${aboutOf(s, "terror").name}.\n\nThe city is waiting to see what you do.`,
    options: [
      { id: "lockdown", label: "Lock the city down and hunt the cell", resolve: (s) => { s.arcology.security = clamp(s.arcology.security + 10, 0, 100); s.arcology.prosperity = clamp(s.arcology.prosperity - 6, 0, 200); s.arcology.crime = clamp(s.arcology.crime - 8, 0, 100); return `Checkpoints on every level for two weeks. Your people find the cell in a flat in the residential block and none of them are taken alive. Trade suffers; nobody complains out loud.`; } },
      { id: "strike", label: "Hit back at them, today", note: "missiles or drones, if you have them", resolve: (s) => { const p = aboutOf(s, "terror"); const f = forces(s); const hit = f.by.missile + f.by.air; p.rec.hurt += Math.round(Math.min(p.strength * 0.3, hit * 0.5 + 5)); shift(s, p.id, -15); s.arcology.rep += hit > 20 ? 300 : -100; return hit > 20 ? `Your answer lands on ${p.name} before the funerals are over: their intelligence headquarters, flattened on live television. Your citizens cheer it.` : `You don't have the reach to hit them properly. What you can send does little, and everyone sees how little.`; } },
      { id: "mourn", label: "Mourn them in public, and say nothing about who", resolve: (s) => { s.arcology.public_standing = clamp(s.arcology.public_standing + 2, -10, 10); s.arcology.prosperity = clamp(s.arcology.prosperity - 3, 0, 200); return `You stand at the crater in front of the cameras and read every name. The city loves you for it. ${aboutOf(s, "terror").name} decides you're soft.`; } },
    ],
  },
  {
    id: "sabotage", severity: "notable", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `A fire in the power plant's control room, and another, the same night, in the water works. Not accidents: the same accelerant in both, and a trail that leads to agents of ${aboutOf(s, "sabotage").name}. Half the arcology was dark for six hours.`,
    options: [
      { id: "repair", label: "Pay for the repairs and harden everything", note: "¤40,000", resolve: (s) => { s.arcology.cash -= 40_000; s.arcology.security = clamp(s.arcology.security + 5, 0, 100); return `Repairs, new locks, new guards, new background checks on everyone who works on the plant. It costs a fortune and it will not happen again in the same way.`; } },
      { id: "expel", label: "Expel every citizen of theirs from the arcology", resolve: (s) => { const p = aboutOf(s, "sabotage"); shift(s, p.id, -15); s.arcology.population = Math.max(200, Math.round(s.arcology.population * 0.98)); s.arcology.security = clamp(s.arcology.security + 4, 0, 100); return `Everyone holding ${p.name}'s papers is put on buses to the border within the week. Some of them had lived here for years.`; } },
    ],
  },
  {
    id: "envoy_demand", severity: "notable", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => { const p = aboutOf(s, "envoy_demand"); return `An envoy from ${p.name} is in your office: a careful, tired diplomat who has done this before. ${p.name} wants a "fee" for the use of shipping lanes it says are its own, ¤${Math.round(15_000 + p.strength * 150).toLocaleString()}, and it wants your answer before she leaves.`; },
    options: [
      { id: "pay", label: "Pay it", resolve: (s) => { const p = aboutOf(s, "envoy_demand"); s.arcology.cash -= Math.round(15_000 + p.strength * 150); shift(s, p.id, 12); return `You pay. The envoy thanks you, and ${p.name} treats you a little better for a while. Others will have heard you pay.`; } },
      { id: "counter", label: "Talk her down", note: "Diplomacy", resolve: (s) => { const p = aboutOf(s, "envoy_demand"); const good = (s.player.skills.diplomacy ?? 0) > 40; if (good) { shift(s, p.id, 10); return `By dinner she's agreed it was a misunderstanding, and by midnight you've agreed to a joint patrol of the lanes instead. She leaves impressed.`; } shift(s, p.id, -8); return `You try to talk her round and it goes badly. She leaves early, and ${p.name} remembers the tone.`; } },
      { id: "refuse", label: "Throw her out", resolve: (s) => { const p = aboutOf(s, "envoy_demand"); shift(s, p.id, -15); s.arcology.rep += 100; return `You have her escorted to the lifts. ${p.name} recalls its ambassador from the Free Cities' council in protest. Your citizens like the story.`; } },
    ],
  },
  {
    id: "trade_offer", severity: "minor", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `${aboutOf(s, "trade_offer").name} proposes a trade pact: tariffs dropped on both sides, a joint shipping office, and a regular summit. Their trade minister is in the lobby with the papers ready to sign.`,
    options: [
      { id: "sign", label: "Sign it", resolve: (s) => { const p = aboutOf(s, "trade_offer"); p.rec.pact = true; shift(s, p.id, 8); return `You sign. Within a month their cargo is on your docks every day, and your goods are in their shops. Both sides are richer for it.`; } },
      { id: "decline", label: "Decline, politely", resolve: (s) => { const p = aboutOf(s, "trade_offer"); shift(s, p.id, -4); return `You decline, with a dinner and a gift to soften it. ${p.name} takes it well enough, and keeps the offer open.`; } },
    ],
  },
  {
    id: "summit", severity: "minor", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `${aboutOf(s, "summit").name} invites you to a summit: three days, its leader and yours, an island resort with no press. Everyone will want something; nobody will say so on the first day.`,
    options: [
      { id: "go", label: "Go yourself", resolve: (s) => { const p = aboutOf(s, "summit"); shift(s, p.id, 12); const now = s.player.skills.diplomacy ?? 0; s.player.skills.diplomacy = clamp(now + 3 * (1 - now / 130), 0, 100); return `Three days of long dinners and short meetings. You come back with an understanding, a better sense of how these people think, and a friend in ${p.name}'s cabinet.`; } },
      { id: "send", label: "Send someone in your place", resolve: (s) => { const p = aboutOf(s, "summit"); shift(s, p.id, 3); return `Your deputy goes in your place. It's fine. ${p.name} notices that it isn't you.`; } },
    ],
  },
  {
    id: "alliance_offer", severity: "notable", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `${aboutOf(s, "alliance_offer").name} wants more than trade. Its leader proposes an alliance: mutual defence, shared intelligence, and their forces beside yours in any war you fight. To seal it, they're sending a gift that's customary between powers here: two of the best slaves in their city.`,
    options: [
      { id: "accept", label: "Accept the alliance, and the gift", resolve: (s) => { const p = aboutOf(s, "alliance_offer"); p.rec.status = "allied"; p.rec.pact = true; p.rec.since = s.arcology.week; const who = gift(s, 2, `a gift from ${p.name} to seal your alliance`); return `You accept. ${p.name} is your ally now, and ${who.join(" and ")} arrive the next day with the treaty papers, kneeling in the lobby.`; } },
      { id: "gift_only", label: "Take the gift, not the alliance", resolve: (s) => { const p = aboutOf(s, "alliance_offer"); shift(s, p.id, -15); const who = gift(s, 2, `a gift from ${p.name}`); return `You keep ${who.join(" and ")} and send the treaty back unsigned. ${p.name} won't make the offer again soon.`; } },
      { id: "decline", label: "Decline both", resolve: (s) => { const p = aboutOf(s, "alliance_offer"); shift(s, p.id, -5); return `You decline. ${p.name} is disappointed, and polite about it, and goes on liking you a little less than before.`; } },
    ],
  },
  {
    id: "ally_gift", severity: "minor", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `${aboutOf(s, "ally_gift").name}, your ally, asks for your help: a rival is massing on its border and it wants your forces seen standing beside it. In return, its leader offers a share of the reconstruction contracts when it's over.`,
    options: [
      { id: "help", label: "Send forces", resolve: (s) => { const p = aboutOf(s, "ally_gift"); const e = empireOf(s); e.readiness = clamp(e.readiness - 15, 0, 100); shift(s, p.id, 12); s.arcology.cash += Math.round(20_000 + p.strength * 200); return `Your forces stand on their border for a month. The rival thinks better of it. The contracts come through, and ${p.name} won't forget who turned up.`; } },
      { id: "refuse", label: "Stay out of it", resolve: (s) => { const p = aboutOf(s, "ally_gift"); shift(s, p.id, -20); return `You stay out. ${p.name} handles it alone, barely, and asks itself what the alliance is for.`; } },
    ],
  },
];
registerEvents(POWER_EVENTS);
