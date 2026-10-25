/**
 * THE REGION — the other powers living their own lives, and coming to you only for a reason.
 *
 * The powers used to roll dice at you every week: a fee, a trade pact, a summit, a sabotage,
 * whoever they were and whether or not they'd heard of you. Now:
 *
 *   KNOWN    a new owner is nobody. Each power knows you as well as your name, your reach and your
 *            dealings with it have carried: the neighbours have noticed, a Free City across the sea
 *            hasn't, an Old World capital won't until you're somebody. Nobody forms an opinion of
 *            someone they've never heard of, and nobody comes to your door before they know it.
 *   BETWEEN  the powers have their own friendships, feuds and wars. They happen whether or not you
 *            are watching; you hear about them as news, and they change what people need.
 *   NEEDS    what a power is short of, read off the world: food in a collapse, medicine in a
 *            plague, soldiers in a war it's losing, money to rebuild after one.
 *   OPENINGS each week, the real reasons anyone has to come to you: a need you could meet, a war
 *            they want you in, your army frightening them, a grudge for something you did, first
 *            notice of you. Each with its cause. Without a model the strongest goes; with one, the
 *            model reads them with the history and decides whether any of it is worth your time,
 *            and writes it (engine/living, worldDesk).
 */
import type { SaveState } from "./types";
import { rng } from "./rng";
import { clamp } from "./psyche";
import { empireOf, forces, has, powers, theyAct, type PowerView } from "./power";
import { worldOf } from "./world";
import { activeWars } from "./war";

export interface Tie { warmth: number; war?: number }
export interface Opening { power: string; kind: string; why: string; weight: number }

export interface RegionMind {
  ties: Record<string, Tie>;
  /** What happened between them this week and lately: news, not events. */
  news: { week: number; text: string }[];
  /** This week's reasons for anyone to come to you, strongest first. */
  openings: Opening[];
  /** The last week anything from the region was put in front of you. */
  last?: number;
}

export function regionOf(s: SaveState): RegionMind {
  return (s.region ??= { ties: {}, news: [], openings: [] });
}

const pair = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export function tieOf(s: SaveState, a: string, b: string): Tie {
  const m = regionOf(s);
  const k = pair(a, b);
  if (!m.ties[k]) m.ties[k] = { warmth: rng(`${s.id}:tie:${k}`).int(-45, 45) };
  return m.ties[k];
}

/** At war with another power, if it is: who, and since when. */
export function theirWar(s: SaveState, p: PowerView, all: PowerView[]): PowerView | undefined {
  return all.find((o) => o.id !== p.id && tieOf(s, p.id, o.id).war !== undefined);
}

export function knownWord(n?: number): string {
  const k = n ?? 0;
  return k < 10 ? "never heard of you" : k < 25 ? "knows your name" : k < 50 ? "knows of you" : k < 75 ? "knows you" : "knows you well";
}

/** How far your name carries to this power, before anything passes between you. */
function reach(s: SaveState, p: PowerView): number {
  const name = Math.min(30, s.arcology.rep / 600);
  // An army is its own introduction: people hear about the guns before they hear your name.
  const arms = Math.min(25, forces(s).total / 40);
  const wings = (has(s, "airport") ? 6 : 0) + (has(s, "airline") ? 8 : 0) + (has(s, "media") ? 10 : 0);
  const near = p.kind === "neighbour" ? 1.6 : p.kind === "freecity" ? 1 / (1 + p.km / 3500) : 0.7 / (1 + p.km / 6000);
  const tied = p.rec.status === "vassal" || p.rec.status === "conquered" ? 60 : p.rec.status === "allied" ? 40 : p.rec.pact ? 25 : 0;
  const war = activeWars(s).length ? 10 : 0;
  return clamp((name + wings + war + arms) * near + tied + (p.kind === "neighbour" ? 15 : 0), 0, 100);
}

/** Weekly: what they know, what's between them, what they need, and what that brings to your door. */
export function tickRegion(s: SaveState, firesNow: boolean): { lines: string[]; cash: number } {
  const m = regionOf(s);
  const week = s.arcology.week;
  const r = rng(`region:${s.id}:${week}`);
  const all = powers(s).filter((p) => p.rec.status !== "conquered");
  const free = all.filter((p) => p.rec.status !== "vassal");
  const mine = forces(s).total;
  const lines: string[] = [];
  let cash = 0;
  const news = (text: string) => { m.news.push({ week, text }); worldOf(s).headlines.push({ week, text, tone: "neutral" }); };

  // What they know of you: drifting toward how far your name carries, and up when you deal with them.
  for (const p of all) {
    const rec = p.rec;
    rec.known ??= p.kind === "neighbour" ? 20 : 0;
    const target = reach(s, p) + ((rec.last_you ?? -99) >= week - 1 ? 15 : 0);
    rec.known = clamp(rec.known + (target - rec.known) * (target > rec.known ? 0.15 : 0.02), 0, 100);
  }

  // Between themselves: old feelings drift, feuds become wars, and wars end.
  for (let i = 0; i < free.length; i++) for (let j = i + 1; j < free.length; j++) {
    const a = free[i], b = free[j];
    if (a.kind === "region" && b.kind === "region" && r.chance(0.5)) continue;
    const t = tieOf(s, a.id, b.id);
    t.warmth = clamp(t.warmth + r.normal(0, 1.5), -100, 100);
    if (t.war === undefined && t.warmth < -60 && r.chance(0.03)) {
      t.war = week;
      news(`${a.name} and ${b.name} are at war.`);
    } else if (t.war !== undefined) {
      const loser = a.strength < b.strength ? a : b;
      loser.rec.hurt += 1;
      if (week - t.war > 4 && r.chance(0.1)) { delete t.war; t.warmth = clamp(t.warmth + 25, -100, 100); news(`${a.name} and ${b.name} have made peace. ${loser.name} came off worse.`); }
    }
  }

  // What they're short of, read off the world.
  for (const p of free) {
    const rec = p.rec;
    const foe = theirWar(s, p, free);
    const st = p.state;
    const need: NonNullable<typeof rec.need> | undefined =
      foe && p.strength < foe.strength ? { what: "soldiers", why: `They're at war with ${foe.name}, and losing.`, since: rec.need?.since ?? week }
      : st === "plague" ? { what: "medicine", why: `There's a plague in ${p.name}.`, since: rec.need?.since ?? week }
      : st === "collapse" ? { what: "food", why: `${p.name} is coming apart, and people are going hungry.`, since: rec.need?.since ?? week }
      : st === "war" ? { what: "food", why: `There's fighting all over ${p.name}, and the harvest didn't come in.`, since: rec.need?.since ?? week }
      : rec.hurt > p.strength * 0.25 ? { what: "money", why: `${p.name} is still paying for its last war.`, since: rec.need?.since ?? week }
      : undefined;
    if (need) rec.need = need; else delete rec.need;
  }

  // What brings anyone to your door this week, and why.
  const open: Opening[] = [];
  for (const p of free) {
    const rec = p.rec;
    const k = rec.known ?? 0;
    if (p.atWar || k < 10) continue;
    if ((rec.last_them ?? -99) > week - 8) continue;
    const a = p.attitude;
    const ratio = p.strength / Math.max(1, mine);
    const foe = theirWar(s, p, free);
    const add = (kind: string, why: string, weight: number) => open.push({ power: p.id, kind, why, weight });
    if (rec.met === undefined && k >= 15) add("first_contact", `${p.name} has only just started hearing about you.`, 2.5);
    if (rec.need && k >= 20 && a >= -15) add("aid_ask", rec.need.why, 3 + (week - rec.need.since) * 0.3);
    if (foe && k >= 30 && a >= 15 && rec.status !== "allied") add("alliance_offer", `They're at war with ${foe.name} and want you beside them.`, 2.5);
    if (foe && rec.status === "allied") add("ally_gift", `Your ally is at war with ${foe.name}.`, 3);
    if (ratio < 0.5 && k >= 30 && (p.kind === "neighbour" || p.km < 2500) && a > -20 && a < 50 && rec.status === "free") add("protection_ask", `Your army frightens them, and their neighbours frighten them more.`, 2);
    if (ratio < 0.5 && k >= 25 && a > -10 && a < 30) add("courting", `They'd rather you thought well of them.`, 1);
    if (k >= 30 && a >= 15 && !rec.pact) add("trade_offer", `They've heard your docks are busy.`, 1.4);
    if (rec.pact && a >= 45 && k >= 50) add("summit", `Your pact has made you friends.`, 0.8);
    if (ratio > 1.3 && k >= 40 && a > -25 && a < 25 && (rec.no_fee_until ?? -1) <= week && week - (empireOf(s).last_fee ?? -99) >= 8) add("envoy_demand", `They're bigger than you, and they've noticed your ships in their waters.`, 1);
    // Hostility needs a reason: a grudge for something you did, and knowing you well enough to aim.
    if (a <= -40 && rec.grudge >= 15 && k >= 35) {
      if (a <= -60 && rec.grudge >= 35 && p.strength > mine * 0.9 && week > 20) add("war", `${p.name} has decided it's had enough of you.`, 4);
      else if (a <= -70 && rec.grudge >= 40) add(r.pick(["assassins", "terror", "sabotage"]), `${p.name} hasn't forgotten what you did.`, 3);
      else add(r.pick(["sanctions", "smear", "sabotage", "raiders"]), `${p.name} holds a grudge against you.`, 2 + rec.grudge / 30);
    }
  }
  m.openings = open.sort((x, y) => y.weight - x.weight);
  if (m.news.length > 40) m.news.splice(0, m.news.length - 40);

  // Whether anything reaches you this week. Hostile acts don't wait on your settings.
  // Envoys, offers and summits are paperwork: none at all while business events are off.
  const pace = (s.business_events ?? "off") === "off" ? "none" : s.world_pace ?? "some";
  const gap = pace === "full" ? 1 : 2;
  const hostile = (o: Opening) => ["war", "assassins", "terror", "sabotage", "sanctions", "smear", "raiders"].includes(o.kind);
  const quietEnough = week - (m.last ?? -99) >= gap;
  const pick = m.openings.find((o) => hostile(o) || (pace !== "none" && quietEnough));
  // Quiet, small things (a careful letter with money in it) happen without asking you anything.
  for (const o of m.openings.filter((x) => x.kind === "courting").slice(0, 1)) {
    if (o === pick) continue;
    const p = all.find((x) => x.id === o.power);
    if (p && r.chance(0.3)) { const done = theyAct(s, p, "courting", o.why); lines.push(done.line); cash += done.cash; }
  }
  // Hostility happens to you whatever; the rest waits for the model to decide it's worth your time,
  // when there is one.
  if (pick && (firesNow || hostile(pick))) {
    const p = all.find((x) => x.id === pick.power)!;
    const done = bring(s, p, pick);
    if (done.line) lines.push(done.line);
    cash += done.cash;
  }
  return { lines, cash };
}

/** Put one opening in front of you. */
export function bring(s: SaveState, p: PowerView, o: Opening): { line: string; cash: number } {
  const m = regionOf(s);
  m.last = s.arcology.week;
  if (o.kind === "first_contact") p.rec.met = s.arcology.week;
  m.openings = m.openings.filter((x) => x !== o);
  return theyAct(s, p, o.kind, o.why);
}

/** For a prompt: what's been going on between the powers. */
export function regionNews(s: SaveState, n = 6): string {
  const list = regionOf(s).news.slice(-n);
  return list.length ? `BETWEEN THE OTHER POWERS LATELY: ${list.map((x) => `week ${x.week}: ${x.text}`).join(" | ")}` : "";
}
