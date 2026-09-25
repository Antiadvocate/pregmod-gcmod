/**
 * ATTACKS — the weeks somebody comes for the arcology.
 *
 * The original's Security Expansion had a small chance each week that a force would approach:
 * raiders, an Old World army, a rival's mercenaries, freed slaves. Here the chance comes from the
 * world (wars nearby, a crumbling region, how rich you look) and the fight is settled by what you
 * built: walls, drone racks, an armory, mercenaries, your militia and knights, a bodyguard. You pick
 * how to meet them; the dice only decide the margin.
 */
import type { SaveState } from "./types";
import { clamp } from "./psyche";
import { applyTreatment, read } from "./obedience";
import { rng } from "./rng";
import { guardStrength } from "./managers";
import { generatePerson } from "./generate";
import { newMemory } from "./memory";
import { refresh } from "./obedience";
import { startRumor } from "./social";
import { registerEvents, fireEvent, type EventDef } from "./events";

export type Defense = "walls" | "drones" | "armory";
export const DEFENSES: Record<Defense, { name: string; note: string; cost: number; power: number }> = {
  walls: { name: "Walls and gates", note: "the outer rings can be sealed; defending costs you less", cost: 25000, power: 1.2 },
  drones: { name: "Drone racks", note: "armed drones over every concourse", cost: 30000, power: 1.5 },
  armory: { name: "Armory", note: "rifles and armour for anyone who'll fight", cost: 20000, power: 1.0 },
};

export type Attacker = "raiders" | "militia" | "mercs" | "freed" | "pirates";
export const ATTACKERS: Record<Attacker, { name: string; desc: string; base: number; loot: number }> = {
  raiders: { name: "raiders", desc: "a few hundred raiders in trucks and technicals, from the dead lands inland", base: 3, loot: 6000 },
  militia: { name: "an Old World militia", desc: "an Old World militia with old tanks and a grudge against the Free Cities", base: 5, loot: 9000 },
  mercs: { name: "mercenaries paid by a rival", desc: "professional mercenaries, well equipped, paid by someone who wants your arcology", base: 6, loot: 12000 },
  freed: { name: "an army of freed slaves", desc: "freed slaves from a fallen arcology up the coast, armed with what they took, and angry", base: 4, loot: 3000 },
  pirates: { name: "pirates", desc: "a pirate flotilla that has come in off the sea to take the docks", base: 4, loot: 8000 },
};

export interface Battle { attacker: Attacker; size: number; week: number; result?: "won" | "lost" | "paid" | "held" }

export function defensesOf(s: SaveState): Record<Defense, number> {
  return (s.arcology.defenses ??= { walls: 0, drones: 0, armory: 0 });
}

export function buildDefense(s: SaveState, d: Defense): boolean {
  const lv = defensesOf(s)[d];
  const cost = DEFENSES[d].cost * (lv + 1);
  if (lv >= 3 || s.arcology.cash < cost) return false;
  s.arcology.cash -= cost;
  defensesOf(s)[d] = lv + 1;
  s.arcology.security = clamp(s.arcology.security + 4, 0, 100);
  return true;
}

/** Your strength, in the same units as an attacker's size. */
export function garrison(s: SaveState): { total: number; parts: string[] } {
  const arc = s.arcology;
  const f = s.story?.flags ?? {};
  const d = defensesOf(s);
  const parts: [string, number][] = [
    ["security", arc.security / 25],
    ["mercenaries", arc.mercenaries.hired ? (arc.mercenaries.strength / 25) * (0.5 + arc.mercenaries.loyalty / 200) : 0],
    ["walls", d.walls * DEFENSES.walls.power],
    ["drones", d.drones * DEFENSES.drones.power + (f["plot_drones"] ? 1 : 0)],
    ["armory", d.armory * DEFENSES.armory.power],
    ["militia", f["plot_militia"] ? 1.5 : 0],
    ["knights", f["plot_knights"] ? 1.5 : 0],
    ["bodyguard", guardStrength(s)],
  ];
  const on = parts.filter(([, n]) => n > 0.05);
  return { total: +on.reduce((n, [, v]) => n + v, 0).toFixed(1), parts: on.map(([k, v]) => `${k} ${v.toFixed(1)}`) };
}

/** Weekly: does anyone come? */
export function tickBattles(s: SaveState): string[] {
  const week = s.arcology.week;
  const hist = (s.battles ??= []);
  const last = hist[hist.length - 1];
  if (week < 12 || (last && week - last.week < 8) || s.events.some((e) => e.kind === "attack")) return [];
  const r = rng(`attack:${s.id}:${week}`);
  const w = s.world;
  const wars = w ? Object.values(w.regions).filter((x) => x.state === "war" || x.state === "collapse").length : 0;
  const chance = 0.03 + wars * 0.02 + clamp(s.arcology.prosperity / 100, 0, 2) * 0.015 + (w ? w.strain / 2000 : 0);
  if (!r.chance(chance)) return [];
  const attacker: Attacker = wars >= 2 ? r.pick(["militia", "freed", "raiders"]) : s.arcology.neighbours[0]?.attitude < -30 ? "mercs" : r.pick(["raiders", "pirates", "raiders", "militia"]);
  const size = +(ATTACKERS[attacker].base * (0.8 + r() * 0.6) * (1 + week / 150) * (1 + clamp(s.arcology.prosperity / 200, 0, 0.8))).toFixed(1);
  hist.push({ attacker, size, week });
  fireEvent(s, "attack");
  return [`Scouts report ${ATTACKERS[attacker].name} moving on ${s.arcology.name}.`];
}

function current(s: SaveState): Battle {
  const b = (s.battles ?? [])[(s.battles ?? []).length - 1];
  return b ?? { attacker: "raiders", size: 3, week: s.arcology.week };
}

function fight(s: SaveState, bonus: number, seed: string): { win: boolean; margin: number } {
  const b = current(s);
  const g = garrison(s).total + bonus;
  const r = rng(`${seed}:${s.arcology.week}`);
  const roll = g * (0.75 + r() * 0.5) - b.size * (0.75 + r() * 0.5);
  return { win: roll >= 0, margin: roll };
}

function prisoners(s: SaveState, n: number, how: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const p = generatePerson({ seed: `pow:${s.id}:${s.arcology.week}:${i}`, week: s.arcology.week, quality: 0.2 });
    p.origin.acquired_how = how; p.origin.acquired_week = s.arcology.week; p.economics.price_paid = 0;
    p.bond = { ...p.bond, bond: -30, fear: 35, resentment: 55, hope: 20 };
    p.skills.combat = Math.max(p.skills.combat, 35);
    s.people[p.id] = p; s.memory[p.id] = newMemory(); refresh(p, s.memory[p.id]);
    out.push(p.name);
  }
  return out;
}

function lose(s: SaveState, heavy: boolean): string {
  const b = current(s);
  const arc = s.arcology;
  const cash = Math.round(Math.min(arc.cash * (heavy ? 0.25 : 0.1), ATTACKERS[b.attacker].loot * (heavy ? 2 : 1)));
  arc.cash -= cash;
  arc.prosperity = clamp(arc.prosperity - (heavy ? 12 : 5), 0, 200);
  arc.population = Math.max(200, Math.round(arc.population * (heavy ? 0.93 : 0.97)));
  arc.rep = Math.max(0, arc.rep - (heavy ? 800 : 300));
  const sector = heavy ? arc.sectors.find((x) => x.owner === "you") : undefined;
  if (sector) sector.condition = clamp(sector.condition - 40, 0, 100);
  let taken = "";
  if (heavy) {
    const v = Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18 && p.assignment !== "guard you").sort((a, c) => a.bond.bond - c.bond.bond)[0];
    if (v) { v.status = "free"; v.exit_week = arc.week; v.exit_note = `taken by ${ATTACKERS[b.attacker].name} when they broke into the arcology`; taken = v.name; }
  }
  return `They lose you ¤${cash.toLocaleString()} in looted stores and damage${sector ? `, and a sector of the outer ring is wrecked` : ""}.${taken ? ` ${taken} is gone when the smoke clears; ${b.attacker === "freed" ? "she went with them" : "they took her"}.` : ""}`;
}

const ATTACK: EventDef = {
  id: "attack", severity: "major", endogenous: false,
  candidates: () => [], weight: () => 0,
  seed: (s) => {
    const b = current(s);
    const g = garrison(s);
    const odds = g.total / Math.max(0.5, b.size);
    return `${ATTACKERS[b.attacker].desc[0].toUpperCase()}${ATTACKERS[b.attacker].desc.slice(1)}. They'll be at the outer ring by morning. Your security chief puts their strength at about ${b.size.toFixed(1)} against your ${g.total.toFixed(1)} (${g.parts.join(", ") || "almost nothing"}).\n\n${odds > 1.4 ? "You should win this if you meet them." : odds > 0.9 ? "It could go either way." : "If you meet them in the open, you'll probably lose."} Your citizens are watching the feeds.`;
  },
  options: [
    { id: "meet", label: "Meet them at the gates", note: "win big or lose big",
      resolve: (s) => { const b = current(s); const r = fight(s, 0, "meet");
        if (r.win) { b.result = "won"; s.arcology.rep += 700 + Math.round(b.size * 100); s.arcology.cash += ATTACKERS[b.attacker].loot; const pr = prisoners(s, b.attacker === "freed" ? 0 : r.margin > 2 ? 2 : 1, `taken prisoner when ${ATTACKERS[b.attacker].name} attacked the arcology`); startRumor(s, `${s.arcology.name} beat off ${ATTACKERS[b.attacker].name} at its gates`, { salience: 8, charge: 1 });
          return `Your forces meet them on the approach road at dawn. It's over by noon: the survivors scatter back the way they came and leave their trucks and supplies behind, worth ¤${ATTACKERS[b.attacker].loot.toLocaleString()}.${pr.length ? ` Your people bring back ${pr.join(" and ")} in chains.` : ""} The citizens cheer the returning troops through the concourse.`; }
        b.result = "lost"; return `Your forces meet them at the gates and are driven back into the arcology. They pour into the outer ring for a night of looting before your people push them out again. ${lose(s, true)}`; } },
    { id: "hold", label: "Seal the spire and let the outer ring take it", note: "safer; the outer ring suffers",
      resolve: (s) => { const b = current(s); const r = fight(s, 1.5 + defensesOf(s).walls * 0.8, "hold"); b.result = "held";
        s.arcology.prosperity = clamp(s.arcology.prosperity - 4, 0, 200); s.arcology.public_standing = clamp(s.arcology.public_standing - 1, -10, 10);
        return r.win ? `You seal the spire and let them have the outer ring for a day. They smash windows and loot shops, but they can't get through the gates, and when your people counterattack at dusk they break and run. The outer ring's citizens remember whose doors were locked.` : `You seal the spire. They can't get in, but they take the outer ring apart looking for a way. ${lose(s, false)}`; } },
    { id: "pay", label: "Pay them to go away", note: "costly, but nobody gets hurt",
      resolve: (s) => { const b = current(s); const cost = Math.round(b.size * 3000); s.arcology.cash -= cost; s.arcology.rep = Math.max(0, s.arcology.rep - 250); b.result = "paid";
        return `You send an envoy out to them with ¤${cost.toLocaleString()} in a case. They take it and turn around. Every raider on the coast hears about it within the week.`; } },
    { id: "champion", label: "Send your bodyguard out to lead the defense",
      resolve: (s) => { const b = current(s); const g = Object.values(s.people).find((p) => p.status === "owned" && p.assignment === "guard you");
        if (!g) { const r = fight(s, 0, "noguard"); b.result = r.win ? "won" : "lost"; return r.win ? `You have no bodyguard to send, so your security chief leads it. It's enough, barely.` : `You have no bodyguard to send. Your security chief leads it and it goes badly. ${lose(s, true)}`; }
        const bonus = g.skills.combat / 30 + read(g).devotion / 100;
        const r = fight(s, bonus, "champion");
        if (r.win) { b.result = "won"; s.arcology.rep += 900; applyTreatment(g, { kind: "recognition", size: 9, why: "led the defense of the arcology and won" }, s.arcology.week); g.fame.prestige = Math.max(g.fame.prestige, 2) as 2; g.fame.why = `led the defense against ${ATTACKERS[b.attacker].name}`; g.skills.combat = Math.min(100, g.skills.combat + 6);
          return `${g.name} leads your forces out in borrowed armour with a rifle across her back. She's at the front the whole morning. By noon the attackers are running, and ${g.name} comes back through the gates with blood on her face, most of it not hers, to a crowd chanting her name.`; }
        b.result = "lost"; g.health.health = clamp(g.health.health - 40, -100, 100); g.health.injuries.push({ what: "wounded leading the defense of the arcology", severity: "grave", week: s.arcology.week }); applyTreatment(g, { kind: "cruelty", size: 3, why: "sent out to lead a fight she lost" }, s.arcology.week);
        return `${g.name} leads them out and fights hard, but there are too many. She's carried back through the gates unconscious. ${lose(s, true)}`; } },
  ],
};

registerEvents([ATTACK]);

export function lastBattles(s: SaveState, n = 5): Battle[] {
  return (s.battles ?? []).slice(-n).reverse();
}

