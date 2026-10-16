/**
 * WAR — declare it, fight it week by week, and decide what to do with what you take.
 *
 * A war has a front, from −100 (they're at your gates) to +100 (you hold their capital). Each week
 * your forces meet theirs: what counts depends on who you're fighting (a Free City across the sea
 * needs ships and aircraft; an Old World state needs ground forces to hold what the air took), your
 * allies add a share of theirs, and the front moves by the difference. Every week costs money,
 * readiness and reputation, and the arcology lives on a war footing: security goes to the front.
 *
 * How hard they hit back is how much they hated you. A power that loathed you before you declared
 * sends assassins, bombs and saboteurs into your city while its army loses; one that merely
 * disliked you fights fair. When it's over the security you spent stays spent for a while.
 *
 * Win and they're yours: annex them, make them pay as a vassal, loot them, or let them go. Take
 * every power on the map and you're master of the world.
 */
import type { SaveState } from "./types";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { startRumor } from "./social";
import { absorbNeighbour, militaryStrength } from "./city";
import { registerEvents, fireEvent, type EventDef } from "./events";
import { empireOf, forces, has, keepRecord, note, powerById, powers, shift, setWarStarter, dominion, type PowerView } from "./power";

export type Strategy = "balanced" | "air" | "siege" | "shock";

export const STRATEGY: Record<Strategy, { name: string; note: string }> = {
  balanced: { name: "Combined arms", note: "steady; costs what it costs" },
  air: { name: "Air and missile campaign", note: "your losses low, theirs high, the world appalled" },
  siege: { name: "Blockade and siege", note: "slow, cheap, and it starves them" },
  shock: { name: "Shock assault", note: "fast and expensive; readiness burns" },
};

export interface War {
  id: string;
  target: string;
  name: string;
  started: number;
  by: "you" | "them";
  /** −100 … 100: who is winning, and by how much. */
  front: number;
  strategy: Strategy;
  /** How much they hated you when it began: sets how hard they hit back at home. */
  hatred: number;
  weeks: number;
  log: { week: number; text: string; delta: number }[];
  ended?: { week: number; result: "won" | "lost" | "peace" };
}

export const activeWars = (s: SaveState) => empireOf(s).wars.filter((w) => !w.ended);
export const warWith = (s: SaveState, id: string) => activeWars(s).find((w) => w.target === id);

/** What of yours counts against this kind of enemy. */
function fieldAgainst(s: SaveState, p: PowerView, strategy: Strategy): number {
  const f = forces(s);
  const b = f.by;
  const mix = p.kind === "freecity"
    ? b.sea * 1.3 + b.air * 1.1 + b.missile * 1.1 + b.space + b.cyber + b.ground * 0.5
    : p.kind === "region"
      ? b.ground * 1.3 + b.air * 1.1 + b.missile + b.space + b.cyber + b.sea * 0.5
      : b.ground * 1.1 + b.air + b.missile + b.space + b.cyber + b.sea * 0.7;
  const raw = Object.values(b).reduce((x, y) => x + y, 0);
  const weight = raw || 1;
  // The garrison counts as it is; the arsenal counts by how well it suits this enemy.
  const home = militaryStrength(s);
  const shaped = home + (raw ? (f.total - home) * (mix / raw) : 0);
  const strat = strategy === "air" ? (b.air + b.missile + b.space > weight * 0.4 ? 1.2 : 0.9) : strategy === "shock" ? 1.25 : strategy === "siege" ? 0.85 : 1;
  // Allies bring a share of theirs.
  const allies = powers(s).filter((x) => x.rec.status === "allied" && x.id !== p.id).reduce((n, x) => n + x.strength * 0.3, 0);
  return Math.round(shaped * strat + allies);
}

/** Start a war. Returns a line for the screen. */
export function declareWar(s: SaveState, id: string, by: "you" | "them" = "you"): string {
  const p = powerById(s, id);
  if (!p) return "No such power.";
  if (warWith(s, id)) return `You're already at war with ${p.name}.`;
  if (p.rec.status === "conquered") return `${p.name} is already yours.`;
  const e = empireOf(s);
  const hatred = clamp(Math.max(0, -p.attitude) + p.rec.grudge, 0, 200);
  const w: War = { id: `war-${id}-${s.arcology.week}`, target: id, name: p.name, started: s.arcology.week, by, front: by === "you" ? 5 : -10, strategy: "balanced", hatred, weeks: 0, log: [] };
  e.wars.push(w);
  if (p.rec.status === "allied" || p.rec.status === "vassal") { p.rec.status = "free"; p.rec.pays = 0; }
  p.rec.pact = false;
  if (by === "you") {
    shift(s, id, -40);
    p.rec.grudge = clamp(p.rec.grudge + 30, 0, 100);
    s.arcology.rep = Math.max(0, s.arcology.rep - 500);
    // Everyone watching gets a little more careful of you; the ones who share its beliefs, more.
    for (const o of powers(s)) if (o.id !== id && o.rec.status !== "conquered") shift(s, o.id, (o.doctrines ?? []).some((d) => (p.doctrines ?? []).includes(d)) ? -10 : -4);
  }
  startRumor(s, by === "you" ? `the owner has declared war on ${p.name}` : `${p.name} has declared war on us`, { salience: 10 });
  const line = by === "you"
    ? `You declare war on ${p.name}. ${hatred > 80 ? "They hated you before this; expect them to hit back inside your walls." : "The world holds its breath."}`
    : `${p.name} declares war on you. ${hatred > 80 ? "Their hatred is personal, and they'll bring it to your streets." : "Their forces are moving."}`;
  note(s, line);
  return line;
}
setWarStarter(declareWar);

export function setStrategy(s: SaveState, warId: string, st: Strategy): void {
  const w = empireOf(s).wars.find((x) => x.id === warId);
  if (w && !w.ended) w.strategy = st;
}

/** Ask for peace. They accept when it suits them. */
export function suePeace(s: SaveState, warId: string): string {
  const w = empireOf(s).wars.find((x) => x.id === warId && !x.ended);
  if (!w) return "There's no such war.";
  const p = powerById(s, w.target);
  if (w.front > 30) {
    const n = Math.round((p?.strength ?? 60) * 900);
    s.arcology.cash += n;
    end(s, w, "peace");
    return `${w.name} accepts your peace and pays ¤${n.toLocaleString()} in reparations for the privilege.`;
  }
  if (w.front < -30) {
    const n = Math.round((p?.strength ?? 60) * 1200);
    s.arcology.cash -= n;
    s.arcology.rep = Math.max(0, s.arcology.rep - 800);
    end(s, w, "peace");
    return `${w.name} names its price: ¤${n.toLocaleString()} in reparations, and a public apology. You pay it.`;
  }
  end(s, w, "peace");
  return `Peace with ${w.name}, on the lines as they stand. Nobody won. Everybody paid.`;
}

/** A strike from the air, sea or orbit, outside the weekly fighting. */
export function strike(s: SaveState, warId: string): string {
  const w = empireOf(s).wars.find((x) => x.id === warId && !x.ended);
  if (!w) return "There's no such war.";
  const f = forces(s);
  const reach = f.by.missile + f.by.space + f.by.air * 0.5;
  if (reach < 10) return "You don't have the missiles, aircraft or satellites to strike them from here.";
  if (w.log.at(-1)?.week === s.arcology.week && w.log.at(-1)?.text.startsWith("Strike")) return "You've struck them already this week.";
  const cost = Math.round(10_000 + reach * 200);
  if (s.arcology.cash < cost) return `A strike costs ¤${cost.toLocaleString()} in munitions.`;
  s.arcology.cash -= cost;
  const p = powerById(s, w.target);
  const delta = Math.round(clamp(reach / Math.max(20, p?.strength ?? 60) * 18, 4, 30));
  w.front = clamp(w.front + delta, -100, 100);
  if (p) p.rec.hurt += Math.round(delta * 0.8);
  s.arcology.rep = Math.max(0, s.arcology.rep - (f.by.space > 0 ? 400 : 150));
  const how = f.by.space >= 300 ? "Rods from orbit come down on their command bunkers" : f.by.missile >= 90 ? "Hypersonic missiles hit their airfields and ministries" : f.by.missile > 0 ? "Your cruise missiles hit their depots and radar" : "Your aircraft hit their supply lines";
  const text = `Strike: ${how}. The front moves ${delta} toward you.`;
  w.log.push({ week: s.arcology.week, text, delta });
  if (w.front >= 100) win(s, w);
  return text;
}

function end(s: SaveState, w: War, result: "won" | "lost" | "peace") {
  w.ended = { week: s.arcology.week, result };
  const e = empireOf(s);
  // What the war cost the arcology at home doesn't come back the day it ends.
  e.scar = { weeks: Math.min(12, Math.ceil(w.weeks / 2) + 2), per: w.hatred > 80 ? 1.5 : 1 };
  note(s, `The war with ${w.name} is over: ${result === "won" ? "you won" : result === "lost" ? "you lost" : "peace"}.`);
}

function win(s: SaveState, w: War) {
  end(s, w, "won");
  empireOf(s).about.victory = w.target;
  fireEvent(s, "victory");
}

/** Weekly: every front moves, the war costs what it costs, and they hit back. */
export function tickWars(s: SaveState): { lines: string[]; cash: number } {
  const e = empireOf(s);
  const out: string[] = [];
  let spent = 0;
  for (const w of activeWars(s)) {
    const p = powerById(s, w.target);
    if (!p) { w.ended = { week: s.arcology.week, result: "peace" }; continue; }
    const r = rng(`war:${w.id}:${s.arcology.week}`);
    w.weeks++;
    // Fighting at home, behind your own walls, is worth a third again.
    const mine = Math.round(fieldAgainst(s, p, w.strategy) * (w.by === "them" ? 1.35 : 1));
    const theirs = p.strength * (w.by === "you" ? 1.15 : 1) * (w.strategy === "siege" ? 0.9 + 0.1 * Math.max(0, 1 - w.weeks / 10) : 1);
    const delta = Math.round(clamp(((mine - theirs) / Math.max(15, theirs)) * 14 + r.normal(0, 5) + (w.strategy === "shock" ? 3 : 0), -25, 25));
    w.front = clamp(w.front + delta, -100, 100);
    p.rec.hurt += Math.max(0, Math.round(delta * 0.6));
    // The cost of it.
    const burn = w.strategy === "shock" ? 14 : w.strategy === "air" ? 6 : w.strategy === "siege" ? 4 : 9;
    e.readiness = clamp(e.readiness - burn, 0, 100);
    const money = Math.round(3_000 + mine * 60 * (w.strategy === "siege" ? 0.6 : 1));
    spent += money;
    s.arcology.security = clamp(s.arcology.security - 1.5, 0, 100);
    s.arcology.crime = clamp(s.arcology.crime + 0.8, 0, 100);
    if (w.by === "you") s.arcology.rep = Math.max(0, s.arcology.rep - (w.strategy === "air" ? 60 : 30));
    if (w.weeks > 16) s.arcology.public_standing = clamp(s.arcology.public_standing - 0.5, -10, 10);
    const text = delta >= 8 ? `Your forces push ${p.name} back (${mine} against ${Math.round(theirs)}).`
      : delta <= -8 ? `${p.name} pushes your forces back (${mine} against ${Math.round(theirs)}).`
      : `The front with ${p.name} barely moves (${mine} against ${Math.round(theirs)}).`;
    w.log.push({ week: s.arcology.week, text, delta });
    if (w.log.length > 30) w.log.shift();
    out.push(`${text} The war cost ¤${money.toLocaleString()} this week.`);

    // They bring it home to you, as hard as they hate you.
    const hit = 0.08 + w.hatred / 400;
    if (r.chance(hit)) {
      const kind = has(s, "shield") && r.chance(0.6) ? "" : r.pick(w.hatred > 80 ? ["war_bombing", "assassins", "terror", "war_hostage"] : ["war_bombing", "sabotage"]);
      if (kind) { e.about[kind] = p.id; fireEvent(s, kind); }
      else out.push(`${p.name} fired missiles at the spire. Your shield took every one of them down.`);
    }

    if (w.front >= 100) { win(s, w); out.push(`${p.name} has fallen. Its government is asking for terms.`); }
    else if (w.front <= -100) { end(s, w, "lost"); e.about.defeat = p.id; fireEvent(s, "defeat"); out.push(`Your forces have broken. ${p.name} is at your gates.`); }
  }
  // Anyone you've conquered may not stay quiet.
  for (const p of powers(s).filter((x) => x.rec.status === "conquered")) {
    const r = rng(`occupation:${p.id}:${s.arcology.week}`);
    if (p.rec.grudge > 30 && r.chance(0.04)) { e.about.insurgency = p.id; fireEvent(s, "insurgency"); }
  }
  // The world may be yours.
  const d = dominion(s);
  if (d.share >= 1 && !e.dictator) {
    e.dictator = s.arcology.week;
    s.player.title = "Master of the World";
    s.canon.push(`${s.player.name || "The owner"} of ${s.arcology.name} rules the whole world: every power on the map is theirs or answers to them.`);
    s.arcology.rep += 10_000;
    fireEvent(s, "world_dictator");
    out.push(`There is nobody left who doesn't answer to you. You rule the world.`);
  }
  return { lines: out, cash: -spent };
}

/* ── the events that come of it ──────────────────────────────────────────────────────────────── */

const about = (s: SaveState, kind: string) => powerById(s, empireOf(s).about[kind] ?? "") ?? powers(s)[0];
const nameOf = (s: SaveState, kind: string) => about(s, kind)?.name ?? "the enemy";

function take(s: SaveState, how: "annex" | "vassal" | "loot" | "release"): string {
  const p = about(s, "victory");
  if (!p) return "There is nobody left to make terms with, and the war simply stops.";
  const rec = p.rec;
  const income = Math.round(p.strength * (how === "annex" ? 220 : 140));
  if (how === "annex") {
    keepRecord(s, p);
    rec.status = "conquered"; rec.pays = income; rec.since = s.arcology.week; rec.grudge = clamp(rec.grudge + 20, 0, 100);
    if (p.kind === "neighbour") absorbNeighbour(s, p.id, "force");
    s.canon.push(`${p.name} was conquered by ${s.arcology.name} in week ${s.arcology.week}.`);
    return `${p.name} is yours. Your flag goes up over its government buildings, and its revenues, ¤${income.toLocaleString()} a week, come to you now.`;
  }
  if (how === "vassal") { rec.status = "vassal"; rec.pays = income; rec.since = s.arcology.week; rec.attitude = Math.max(rec.attitude, -10); return `${p.name} keeps its government and its flag, and pays you ¤${income.toLocaleString()} a week, and does what it's told.`; }
  if (how === "loot") { const n = Math.round(p.strength * 2500); s.arcology.cash += n; rec.grudge = 100; rec.hurt += p.strength; for (const o of powers(s)) if (o.id !== p.id) shift(s, o.id, -8); return `Your forces strip ${p.name} of everything that can be carried: ¤${n.toLocaleString()} of it. They leave behind a country that will hate you for a century.`; }
  rec.status = "free"; rec.attitude = 20; rec.grudge = Math.max(0, rec.grudge - 30); s.arcology.rep += 500;
  return `You withdraw from ${p.name} and ask nothing. The world doesn't know what to make of it, and ${p.name} doesn't either.`;
}

export const WAR_EVENTS: EventDef[] = [
  {
    id: "victory", severity: "major", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `${nameOf(s, "victory")} has fallen. Its leaders have fled or are in your custody, its army has surrendered, and its people are waiting in their streets to find out who they belong to now.\n\nYour generals want to know what you want done with it.`,
    options: [
      { id: "annex", label: "Annex it: it's yours now", note: "most income; they'll resent it", resolve: (s) => take(s, "annex") },
      { id: "vassal", label: "Leave it a government that answers to you", note: "tribute, less trouble", resolve: (s) => take(s, "vassal") },
      { id: "govern", label: "Keep it, and put one of your women in charge of it", note: "pick her in the War Room; she runs it as herself, loyal to you", resolve: (s) => `${take(s, "vassal")} Its palace is empty, waiting for whoever you send. Choose her in the War Room.` },
      { id: "loot", label: "Strip it and leave", note: "a fortune now, hatred forever", resolve: (s) => take(s, "loot") },
      { id: "release", label: "Let it go", note: "reputation", resolve: (s) => take(s, "release") },
    ],
  },
  {
    id: "defeat", severity: "major", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `Your lines have broken. ${nameOf(s, "defeat")}'s forces are in sight of the outer ring, and their terms came in an hour ago: money, an apology on every feed, and a share of your arcology.`,
    options: [
      { id: "pay", label: "Accept their terms", resolve: (s) => { const p = about(s, "defeat"); const n = Math.round((p?.strength ?? 60) * 1500); s.arcology.cash -= n; s.arcology.ownership = clamp(s.arcology.ownership - 8, 0, 100); s.arcology.rep = Math.max(0, s.arcology.rep - 1500); return `You sign. ¤${n.toLocaleString()}, eight percent of the arcology, and you read their apology yourself on camera. They go home. Everyone saw it.`; } },
      { id: "fight", label: "Fight for every floor", resolve: (s) => { const p = about(s, "defeat"); s.arcology.prosperity = clamp(s.arcology.prosperity - 20, 0, 200); s.arcology.population = Math.max(200, Math.round(s.arcology.population * 0.9)); s.arcology.security = clamp(s.arcology.security - 15, 0, 100); if (p) p.rec.hurt += Math.round(p.strength * 0.5); return `They come into the outer ring and you fight them floor by floor for nine days. They take the verge and lose half their army doing it, and in the end they go home with nothing but their dead. Your city will take years to rebuild.`; } },
    ],
  },
  {
    id: "war_bombing", severity: "major", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `Air raid sirens at two in the morning. ${nameOf(s, "war_bombing")} got bombers through: the outer ring is burning, the docks are hit, and the hospital is full. Your citizens are in the shelters asking each other what the war is for.`,
    options: [
      { id: "rebuild", label: "Rebuild at once, at any cost", note: "¤50,000", resolve: (s) => { s.arcology.cash -= 50_000; s.arcology.public_standing = clamp(s.arcology.public_standing + 1, -10, 10); return `Crews are on the rubble before the fires are out. By the end of the week the docks are working and the city sees that you meant it.`; } },
      { id: "revenge", label: "Answer it, twice as hard", resolve: (s) => { const p = about(s, "war_bombing"); const w = p && warWith(s, p.id); if (w) w.front = clamp(w.front + 8, -100, 100); s.arcology.rep = Math.max(0, s.arcology.rep - 300); s.arcology.prosperity = clamp(s.arcology.prosperity - 5, 0, 200); return `Your answer goes out the same night. Their capital burns brighter than your outer ring did. The front moves your way, and the world counts the dead.`; } },
      { id: "shelter", label: "Keep people underground and wait", resolve: (s) => { s.arcology.prosperity = clamp(s.arcology.prosperity - 8, 0, 200); return `You keep the city in the shelters for a week. Nobody else dies; nothing gets made or sold; the outer ring is left to burn itself out.`; } },
    ],
  },
  {
    id: "war_hostage", severity: "major", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => { const who = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18); return `${nameOf(s, "war_hostage")}'s agents took ${who ? who.name : "one of your slaves"} off the concourse in broad daylight. Their state television is showing her now, unharmed so far, and the price for her return is a ceasefire.`; },
    options: [
      { id: "ceasefire", label: "Agree to the ceasefire", resolve: (s) => { const p = about(s, "war_hostage"); const w = p && warWith(s, p.id); if (w) w.front = clamp(w.front - 15, -100, 100); return `You agree, and she's back at the border in two days, shaking. The ceasefire lasts a week, and gives them the time they needed. Your household saw what you'd pay for one of them.`; } },
      { id: "rescue", label: "Send special forces after her", resolve: (s) => { const ok = has(s, "special"); if (ok) { s.arcology.rep += 600; return `Your special forces go in at night. They bring her out alive, and bring back the man who took her in a bag. Every slave in the arcology knows the story by morning.`; } const who = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18); if (who) { who.status = "sold"; who.exit_week = s.arcology.week; who.exit_note = "taken as a hostage in the war and never returned"; } return `You don't have the people for it. The mercenaries you hire instead get there two days too late, and she isn't there.`; } },
      { id: "refuse", label: "Refuse. No deals.", resolve: (s) => { for (const p of Object.values(s.people).filter((x) => x.status === "owned")) p.bond.hope = clamp(p.bond.hope - 5, 0, 100); s.arcology.rep += 200; return `You refuse on camera. The world calls it strength. Your household calls it something else, quietly, among themselves.`; } },
    ],
  },
  {
    id: "insurgency", severity: "notable", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `${nameOf(s, "insurgency")} isn't quiet. A convoy of yours was ambushed on its main road, your governor's car was bombed, and the walls of its capital are covered in the same three words.`,
    options: [
      { id: "crush", label: "Crush it", resolve: (s) => { const p = about(s, "insurgency"); if (p) p.rec.grudge = clamp(p.rec.grudge + 15, 0, 100); empireOf(s).readiness = clamp(empireOf(s).readiness - 10, 0, 100); s.arcology.rep = Math.max(0, s.arcology.rep - 200); return `Curfews, raids, and public hangings in the square. It stops. It will start again, and everyone there will remember who did this.`; } },
      { id: "concede", label: "Give them some of what they want", resolve: (s) => { const p = about(s, "insurgency"); if (p) { p.rec.grudge = Math.max(0, p.rec.grudge - 25); p.rec.pays = Math.round((p.rec.pays ?? 0) * 0.8); } return `Local councils, their own language in the schools, and a lighter levy. The attacks die down. Your take from it is smaller, and steadier.`; } },
    ],
  },
  {
    id: "world_dictator", severity: "major", endogenous: false, candidates: () => [], weight: () => 0,
    seed: (s) => `It's done. Every Free City, every arcology on your horizon and every Old World state either flies your flag or pays you not to have to. ${s.arcology.name} is the capital of the world. The last holdout's envoy signed this morning, and the representatives of every power on earth are in your atrium, waiting for you to tell them what happens now.`,
    options: [
      { id: "crown", label: "Have yourself crowned, in front of all of them", resolve: (s) => { s.player.title = "Emperor of the World"; s.arcology.public_standing = clamp(s.arcology.public_standing + 5, -10, 10); startRumor(s, `the owner was crowned ruler of the world in the atrium`, { salience: 10, charge: 1 }); return `They kneel, one by one, in the order you choose. The crown is new and heavier than it looks. Every screen on earth carries it.`; } },
      { id: "quiet", label: "Send them home. Nothing changes but who they answer to.", resolve: (s) => { s.arcology.rep += 2000; return `You thank them and send them home. The world goes on the way it was, except that every decision that matters is now made in your office, and everyone knows it.`; } },
    ],
  },
];
registerEvents(WAR_EVENTS);
