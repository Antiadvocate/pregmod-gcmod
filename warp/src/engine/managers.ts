/**
 * THE PEOPLE WHO RUN THINGS.
 *
 * A manager post was a title with a training bonus attached, which is not a job. Here each post
 * has one effect that materially changes the week, computed from that specific person's skill,
 * devotion and nature — so a Head Girl is not interchangeable with the next body you own, and a
 * Wardeness who hates you is a liability rather than a rounding error.
 *
 * Every post also has a floor: a manager whose read devotion is under the post's minimum does the
 * job badly ON PURPOSE, and the report says so. That is the one place in the engine where somebody
 * gets to sabotage you, and it is deliberate — a household where disloyalty has no lever is a
 * household where loyalty is decoration.
 */
import type { Person, ReportLine, SaveState } from "./types";
import { FACILITY_BY_ID } from "../data/facilities";
import { clamp, shove } from "./psyche";
import { read, applyTreatment } from "./obedience";
import { moveEdge } from "./social";

export interface ManagerEffect {
  /** Multiplier on what the facility's workers earn. */
  income: number;
  /** Extra training multiplier for the workers. */
  training: number;
  /** Weekly shove to each worker's nervous system, from being managed well or badly. */
  care: number;
  /** Health per worker per week. */
  health: number;
  lines: ReportLine[];
}

const NEUTRAL: ManagerEffect = { income: 1, training: 1, care: 0, health: 0, lines: [] };

/** How good is this person at running this? Skill in the post, plus willingness, plus whether they
 *  can actually see and speak to the people they are running. */
export function managerQuality(s: SaveState, m: Person, skillKey: string): number {
  const skill = m.skills.management[skillKey] ?? 0;
  const r = read(m, s.memory[m.id]);
  const willing = clamp(1 + r.devotion / 150, 0.2, 1.6);
  const able = (m.body.eyes === "blind" ? 0.7 : 1) * (m.body.voice === 0 ? 0.6 : 1) * clamp(1 + m.health.health / 300, 0.6, 1.15);
  const smart = 1 + ({ impaired: -0.35, slow: -0.15, average: 0, sharp: 0.15, brilliant: 0.3 }[m.persona.intelligence]);
  return clamp((0.4 + skill / 110) * willing * able * smart, 0.1, 2.2);
}

/** Resolve one facility's manager for the week. */
export function runManager(s: SaveState, facilityId: string): ManagerEffect {
  const fac = s.arcology.facilities[facilityId];
  const def = FACILITY_BY_ID[facilityId];
  if (!fac?.manager || !def?.manager) return NEUTRAL;
  const m = s.people[fac.manager];
  if (!m || m.status === "dead" || m.status === "sold") { delete fac.manager; return NEUTRAL; }

  const q = managerQuality(s, m, def.manager.skill);
  const r = read(m, s.memory[m.id]);
  const lines: ReportLine[] = [];
  const disloyal = r.devotion < def.manager.min_devotion;

  // A manager below the post's floor does the job badly on purpose, and it is visible in the
  // numbers before it is visible anywhere else.
  if (disloyal) {
    lines.push({
      person: m.id, facility: facilityId, tone: "bad", weight: 8,
      text: `${m.name} is running ${def.name} at ${r.devotion} devotion, which is under what the post needs. The numbers are worse than they should be and it is not an accident.`,
    });
    // She is also skimming.
    const skim = Math.round(400 + Math.random() * 900);
    s.arcology.cash -= skim;
    lines.push({ person: m.id, tone: "bad", weight: 6, text: `¤${skim} has gone missing from ${def.name}'s takings.` });
    return { income: 0.75, training: 0.9, care: -0.2, health: -0.5, lines };
  }

  const eff: ManagerEffect = { income: 1, training: 1, care: 0, health: 0, lines };

  switch (facilityId) {
    case "brothel":
      eff.income = 1 + q * 0.35;
      eff.training = 1 + q * 0.5;
      eff.health = q * 1.2;                       // she keeps the worst customers off them
      break;
    case "club":
      eff.income = 1 + q * 0.3;
      eff.care = q * 0.25;
      s.arcology.rep += Math.round(q * 30);
      lines.push({ person: m.id, tone: "good", weight: 3, text: `${m.name} kept the room warm all week; the arcology noticed.` });
      break;
    case "dairy":
      eff.income = 1 + q * 0.4;
      eff.health = q * 1.5;
      break;
    case "farmyard":
      s.arcology.food.production += q * 60;
      eff.income = 1 + q * 0.2;
      break;
    case "cellblock":
      // The Wardeness decides how much of somebody is left. Quality is speed; conscience is mercy.
      eff.care = -0.6 - q * 0.5;
      eff.health = -q * 0.8;
      for (const id of fac.workers) {
        const w = s.people[id];
        if (!w) continue;
        w.bond.fear = clamp(w.bond.fear + 4 + q * 5, 0, 100);
        if (m.persona.conscience < 0.35) w.bond.resentment = clamp(w.bond.resentment + 3, 0, 100);
        moveEdge(s.edges, id, m.id, { warmth: -6, trust: -4 });
      }
      break;
    case "spa":
      eff.care = 0.5 + q * 0.7;
      eff.health = 2 + q * 3;
      for (const id of fac.workers) {
        const w = s.people[id];
        if (!w) continue;
        moveEdge(s.edges, id, m.id, { warmth: 4, trust: 3 });
        if (w.psyche.state !== "intact" && q > 1) {
          w.psyche.relaxation = clamp(w.psyche.relaxation + 1.2, -10, 10);
          lines.push({ person: id, tone: "good", weight: 7, text: `${m.name} got ${w.name} to eat, and to sleep. It is the first week that has happened.` });
        }
      }
      break;
    case "clinic":
      eff.health = 3 + q * 4;
      for (const id of fac.workers) {
        const w = s.people[id];
        if (w && w.health.recovery_weeks > 0 && q > 0.9) w.health.recovery_weeks = Math.max(0, w.health.recovery_weeks - 1);
      }
      break;
    case "schoolroom":
      eff.training = 1 + q * 0.9;
      break;
    case "servants": {
      // The Stewardess takes the household's upkeep down, which is the only post that pays for
      // itself in a line the player can point at.
      const saved = Math.round(q * 90 * Object.values(s.people).filter((p) => p.status === "owned").length);
      s.arcology.cash += saved;
      lines.push({ person: m.id, tone: "good", weight: 4, text: `${m.name} ran the household ¤${saved} cheaper this week.` });
      break;
    }
    case "master_suite":
      eff.care = 0.4 + q * 0.5;
      s.arcology.rep += Math.round(q * 40);
      break;
    case "nursery":
      eff.care = 0.3 + q * 0.4;
      break;
    case "barracks":
      s.arcology.security = clamp(s.arcology.security + q * 3, 0, 100);
      s.arcology.crime = clamp(s.arcology.crime - q * 2, 0, 100);
      break;
  }

  if (q > 1.5) lines.push({ person: m.id, tone: "good", weight: 5, text: `${m.name} is very good at being ${def.manager.title}. It shows in ${def.name}'s numbers.` });
  return eff;
}

/** THE HEAD GIRL — the one post that is about the whole household rather than one room. She runs
 *  the people you are not looking at, which is most of them. */
export function runHeadGirl(s: SaveState): ReportLine[] {
  const hg = Object.values(s.people).find((p) => p.assignment === "be your Head Girl" && p.status === "owned");
  if (!hg) return [];
  const q = managerQuality(s, hg, "headgirl");
  const r = read(hg, s.memory[hg.id]);
  const lines: ReportLine[] = [];

  if (r.devotion < 70) {
    lines.push({ person: hg.id, tone: "warning", weight: 8, text: `${hg.name} is your Head Girl at ${r.devotion} devotion. She is running your household and she is not yours.` });
    return lines;
  }

  hg.skills.management.headgirl = clamp((hg.skills.management.headgirl ?? 0) + 4, 0, 100);

  // She picks the two who most need something and does something about them.
  const household = Object.values(s.people).filter((p) => p.status === "owned" && p.id !== hg.id);
  const needy = household
    .map((p) => ({ p, r: read(p, s.memory[p.id]) }))
    .sort((a, b) => (a.r.devotion - b.r.devotion) || (a.p.health.health - b.p.health.health))
    .slice(0, Math.max(1, Math.round(q * 2)));

  for (const { p } of needy) {
    // Her method is her nature. A warm Head Girl talks them round; a cold one frightens them.
    if (hg.persona.conscience > 0.55) {
      applyTreatment(p, { kind: "kindness", size: 2, why: `${hg.name} spent time with her` }, s.arcology.week);
      shove(p.psyche, 0.4);
      moveEdge(s.edges, p.id, hg.id, { warmth: 6, trust: 4 });
      lines.push({ person: p.id, tone: "good", weight: 4, text: `${hg.name} got somewhere with ${p.name} this week.` });
    } else {
      applyTreatment(p, { kind: "coercion", size: 2, why: `${hg.name} made the position clear` }, s.arcology.week);
      shove(p.psyche, -0.3);
      moveEdge(s.edges, p.id, hg.id, { warmth: -5, trust: -3 });
      lines.push({ person: p.id, tone: "neutral", weight: 4, text: `${hg.name} had a word with ${p.name}. ${p.name} has been very compliant since.` });
    }
    p.skills.oral = clamp(p.skills.oral + q, 0, 100);
    p.skills.entertainment = clamp(p.skills.entertainment + q * 0.6, 0, 100);
  }
  return lines;
}

/** THE BODYGUARD — what stands between you and the week's worst possibility. */
export function guardStrength(s: SaveState): number {
  const guard = Object.values(s.people).find((p) => p.assignment === "guard you" && p.status === "owned");
  if (!guard) return 0;
  const r = read(guard, s.memory[guard.id]);
  if (r.devotion < 40) return 0;   // a bodyguard who does not like you is not a bodyguard
  return clamp(guard.skills.combat / 60 + r.devotion / 200 + guard.health.health / 250, 0, 2.5);
}
