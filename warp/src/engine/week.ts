/**
 * THE WEEK — the macro tick, and the only place the arcology's clock advances.
 *
 * Order matters and is stated once, here, so that the answer to "why did that happen before that"
 * is a line in this file rather than an emergent property of forty passages:
 *
 *   1. Standing orders run FIRST, on last week's state. They are your instructions about the week
 *      that is starting; running them after the work would be running them on the results.
 *   2. Every person works their assignment: money, training, health, the body, the nervous system.
 *   3. The household reacts to itself: co-regulation, proximity, rumour.
 *   4. The arcology reacts to the household: doctrine, prosperity, crime, rents.
 *   5. The world reacts to the arcology: neighbours, projects, markets, events.
 *   6. The report is assembled from what the passes actually recorded — never recomputed.
 *
 * Everything a pass wants the player to know it PUSHES into the report. Nothing reads the state
 * afterwards to work out what must have happened, which is how the old end-of-week text and the
 * old budget screen ended up describing two different weeks.
 */
import type { Person, ReportLine, SaveState, WeekReport } from "./types";
import { FACILITY_BY_ID } from "../data/facilities";
import { ASSIGNMENT_BY_ID } from "../data/assignments";
import { Ledger, arcologyMoney, weeklyMoney } from "./economy";
import { tickHealth } from "./health";
import { tickPregnancy, tickChild, tickAge, tryConception } from "./pregnancy";
import { tickBond, refresh, applyTreatment, read } from "./obedience";
import { clamp, shove, tickWeek, tickEmotions, tickDischarge, addState, wear } from "./psyche";
import { decayMemory, reflect, remember } from "./memory";
import { coRegulate, diffuseRumors, tickProximity, startRumor } from "./social";
import { tickSociety } from "./society";
import { runOrders } from "./rules";
import { selectEvents } from "./events";
import { rollMarkets, recruitResult } from "./market";
import { rng } from "./rng";
import { runHeadGirl, runManager, type ManagerEffect } from "./managers";
import { tickPolicies } from "./policies";
import { tickSecurity, unrest } from "./security";
import { GARMENT_BY_NAME } from "../data/wardrobe";
import { refreshPlayer, practise, skill } from "./player";
import { tickRomance, keeperRunsTheWeek, theKeeper, romanceOf } from "./romance";
import { collectAsks } from "./asks";
import { tickReversal } from "./reversal";

const alive = (s: SaveState): Person[] => Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");

export function endWeek(s: SaveState): WeekReport {
  const week = s.arcology.week;
  const led = new Ledger();
  const lines: ReportLine[] = [];
  const problems: string[] = [];
  const cashStart = s.arcology.cash;
  const repStart = s.arcology.rep;
  const r = rng(`week:${week}`);

  const push = (text: string, tone: ReportLine["tone"] = "neutral", weight = 5, person?: string, facility?: string) =>
    lines.push({ text, tone, weight, person, facility });

  /* ── 1. standing orders ─────────────────────────────────────────────────────────────────── */
  const ruleRuns = runOrders(s, false);
  for (const run of ruleRuns) {
    const p = s.people[run.person];
    const order = s.orders.find((o) => o.id === run.rule);
    if (p && order) push(`${order.name}: ${p.name} — ${run.changes.join("; ")}`, "neutral", 3, p.id);
  }

  /* ── 1b. the people who run things ──────────────────────────────────────────────────────── */
  // Managers are resolved BEFORE the work, because what they do is change what the work is. Their
  // own week is worked in the loop below like anybody else's.
  const managed = new Map<string, ManagerEffect>();
  for (const fac of Object.values(s.arcology.facilities)) {
    if (!fac.level || !fac.manager) continue;
    const eff = runManager(s, fac.id);
    managed.set(fac.id, eff);
    lines.push(...eff.lines);
  }
  lines.push(...runHeadGirl(s));

  /* ── 2. the work ────────────────────────────────────────────────────────────────────────── */
  const dead: Person[] = [];
  for (const p of alive(s)) {
    p.economics.weeks_owned++;
    const fac = p.facility ? s.arcology.facilities[p.facility] : undefined;
    const facDef = fac ? FACILITY_BY_ID[fac.kind] : undefined;
    const asgDef = ASSIGNMENT_BY_ID[p.assignment];
    const load = facDef?.psyche ?? asgDef?.psyche ?? { relaxation: 0, wear: 0, health: 0, energy: 20 };

    const mgr = p.facility ? managed.get(p.facility) : undefined;
    const managedByThem = mgr && fac?.manager !== p.id;

    // MONEY
    const money = weeklyMoney(s, p);
    if (managedByThem && mgr) money.income = Math.round(money.income * mgr.income);
    if (money.income) led.earn("slaves", `${p.name} — ${money.note || p.assignment}`, money.income, p.id);
    led.spend("upkeep", `${p.name}`, money.upkeep, p.id);
    if (money.rep) led.entry("standing", `${p.name}`, 0, money.rep, p.id);
    p.economics.income_last_week = money.income;
    p.economics.income_lifetime += money.income;
    p.economics.upkeep_last_week = money.upkeep;
    p.economics.upkeep_lifetime += money.upkeep;
    p.economics.customers_last_week = money.customers;

    // WORK ON THE NERVOUS SYSTEM. This is where a facility stops being a multiplier and starts
    // being a place: the shove lands, the resting point takes the wear, and the emotion the work
    // produced gets a name that the narrator will use later.
    tickWeek(p.psyche);
    // What she is wearing, every day, all week. Small and relentless — the way clothing actually is.
    let worn = 0;
    for (const item of [p.clothes, p.collar, p.shoes]) worn += GARMENT_BY_NAME[item]?.relaxation ?? 0;
    const felt = shove(p.psyche, load.relaxation * (1 + (p.health.energy < 25 ? 0.4 : 0)) + worn + (managedByThem && mgr ? mgr.care : 0));
    if (load.wear < -0.8) p.psyche.braced_run += 2;
    if (load.wear > 0.8) p.psyche.settled_run += 2;

    if (facDef?.id === "arcade" && r.chance(0.5)) addState(p.psyche, "dread of the booth", week);
    if (facDef?.id === "cellblock") addState(p.psyche, "fear of the wardeness", week);
    if (facDef?.id === "spa" && p.psyche.relaxation > 2) addState(p.psyche, "relief", week);

    const emo = tickEmotions(p.psyche, week);
    if (emo.liberated.length) push(`${p.name} let go of ${emo.liberated[0]} — what is left is ${emo.residue[0]}.`, "good", 4, p.id);
    if (emo.fed) push(`${p.name} is still telling herself about ${emo.fed}, and it is costing her.`, "bad", 4, p.id);
    const dis = tickDischarge(p.psyche);
    if (dis.fired) push(`${p.name} finally came apart and then came back — ${dis.released ? `${dis.released} is gone` : "something went"}.`, "good", 7, p.id);

    // TRAINING
    const trains = { ...(facDef?.trains ?? {}), ...(asgDef?.trains ?? {}) };
    const aptitude = 1 + ({ impaired: -0.5, slow: -0.25, average: 0, sharp: 0.25, brilliant: 0.5 }[p.persona.intelligence]);
    const willing = clamp(1 + read(p).devotion / 200, 0.4, 1.4);
    const teacher = (fac && facDef?.manager && fac.manager ? 1.7 : 1) * skill.slaving(s);
    for (const [skill, rate] of Object.entries(trains)) {
      const gain = (rate as number) * aptitude * willing * teacher * (managedByThem && mgr ? mgr.training : 1);
      const key = skill as keyof typeof p.skills;
      if (typeof p.skills[key] === "number") {
        const before = p.skills[key] as number;
        (p.skills[key] as number) = clamp(before + gain, 0, 100);
        if (Math.floor(before / 25) < Math.floor((p.skills[key] as number) / 25)) push(`${p.name} has got noticeably better at ${skill}.`, "good", 3, p.id);
      }
    }
    if (p.assignment === "classes" || fac?.kind === "schoolroom") p.persona.education = clamp(p.persona.education + 2.5 * aptitude, 0, 100);

    // MANAGEMENT SKILL, for whoever is running something
    if (fac && fac.manager === p.id && facDef?.manager) {
      const k = facDef.manager.skill;
      p.skills.management[k] = clamp((p.skills.management[k] ?? 0) + 3, 0, 100);
    }

    // HEALTH AND THE BODY
    const hw = tickHealth(s, p, { health: load.health + (managedByThem && mgr ? mgr.health : 0), energy: load.energy });
    for (const n of hw.notes) push(`${p.name}: ${n}.`, n.includes("healed") || n.includes("back on her feet") ? "good" : "bad", 5, p.id);
    if (hw.died) { dead.push(p); continue; }

    // SEX, AND WHAT COMES OF IT
    const exposure = sexualExposure(p);
    if (exposure > 0 && !p.womb.contraceptives) {
      const father = exposure > 3 ? null : s.player.name ? null : null;
      const f = tryConception(s, p, father, exposure);
      if (f) push(`${p.name} is pregnant.`, "neutral", 6, p.id);
    }
    const preg = tickPregnancy(s, p);
    for (const n of preg.notes) push(`${p.name}: ${n}.`, "neutral", 5, p.id);
    for (const child of preg.born) {
      push(`${p.name} gave birth to ${child.name}.`, "good", 9, p.id);
      startRumor(s, `${p.name} had her baby`, { about: p.id, salience: 6, from: p.id });
    }
    for (const n of tickChild(s, p)) push(n, "neutral", 7, p.id);
    for (const n of tickAge(s, p)) push(n, "neutral", 3, p.id);

    // THE WEEK, AS SHE WILL REMEMBER IT
    const mem = s.memory[p.id];
    if (mem) {
      const charge = felt < -1.2 ? "sharp" : felt > 1 ? "warm" : "dull";
      const importance = Math.min(9, Math.round(Math.abs(felt) * 2.5 + (money.customers > 40 ? 2 : 0)));
      if (importance >= 3) {
        remember(mem, {
          content: weekMemory(p, facDef?.name ?? asgDef?.label ?? p.assignment, money),
          week, importance, charge, where: facDef?.name ?? "the penthouse",
        });
      }
      decayMemory(mem, week);
      if (week % 8 === 0) {
        const belief = reflect(mem, week, p.psyche.relaxation < -2);
        if (belief) push(`${p.name} has come to a conclusion: "${belief}"`, "neutral", 6, p.id);
      }
    }

    // The bond ledger, and what the week did to it without anybody deciding.
    if (facDef?.id === "arcade" || facDef?.id === "cellblock") {
      applyTreatment(p, { kind: "cruelty", size: facDef.id === "arcade" ? 4 : 3, why: `a week in the ${facDef.name.toLowerCase()}` }, week);
    } else if (facDef?.id === "spa" || facDef?.id === "master_suite") {
      applyTreatment(p, { kind: "kindness", size: 2, why: `a week in the ${facDef.name.toLowerCase()}` }, week);
    }
    tickBond(p);
    lines.push(...tickRomance(s, p));
    refresh(p, mem);

    // Indenture runs down, and it is the one clock the player cannot quietly extend.
    if (p.status === "indentured" && p.indenture_weeks !== undefined) {
      p.indenture_weeks--;
      if (p.indenture_weeks <= 0) {
        p.status = "free";
        p.exit_week = week;
        p.exit_note = "indenture expired";
        push(`${p.name}'s indenture is up. She is a citizen as of Monday.`, "warning", 9, p.id);
      }
    }
  }

  for (const p of dead) {
    p.status = "dead";
    p.exit_week = week;
    p.exit_note = "died";
    push(`${p.name} died.`, "bad", 10, p.id);
    startRumor(s, `${p.name} died in the ${p.facility ?? "penthouse"}`, { salience: 8, about: p.id });
    for (const other of alive(s)) {
      shove(other.psyche, -0.6, { hard: true });
      other.bond.fear = clamp(other.bond.fear + 6, 0, 100);
    }
  }

  /* ── 3. the household reacts to itself ──────────────────────────────────────────────────── */
  tickProximity(s);
  const pulled = coRegulate(s);
  const flips = pulled.filter((x) => Math.abs(x.pull) > 0.25).length;
  if (flips >= 3) push(`The mood moved through ${flips} of them together this week — whatever is in that room, they are all in it.`, "neutral", 4);
  diffuseRumors(s);
  for (const rum of s.rumors) {
    if (rum.week === week - 1 && rum.knowers.length > 3) push(`Everybody has heard: ${rum.content}.`, "neutral", 3);
  }

  // Whoever is running this place, if it is not you.
  lines.push(...keeperRunsTheWeek(s).lines);

  /* ── 4. the arcology reacts to the household ────────────────────────────────────────────── */
  lines.push(...tickPolicies(s, led));

  const sec = tickSecurity(s);
  lines.push(...sec.lines);
  if (sec.cash) led.entry("security", "what it cost when it went wrong", sec.cash);

  // The plot chain, which is a society pass of its own: it moves your standing with the trade, it
  // moves the arcology's adoption, and it is where the service fees come from once they are open.
  lines.push(...tickReversal(s));

  const soc = tickSociety(s);
  led.entry("doctrine", "your citizens, on how you live", soc.cash, soc.rep);
  for (const l of soc.lines) push(l, "neutral", 6);

  arcologyMoney(s, led);

  const arc = s.arcology;
  const staff = alive(s).length;
  const publicWork = alive(s).filter((p) => p.assignment === "public servant" || p.assignment === "whore").length;
  arc.prosperity = clamp(arc.prosperity + clamp((led.cash / 3500) + publicWork * 0.4 - (arc.crime / 40), -6, 6), 5, 200);
  arc.crime = clamp(arc.crime + (arc.security < 30 ? 3 : -2) + (arc.prosperity < 40 ? 2 : -1), 0, 100);
  arc.population = Math.round(clamp(arc.population * (1 + (arc.prosperity - 60) / 4000), 200, 20000));
  arc.ownership = clamp(arc.ownership + (arc.cash > 60000 ? 0.4 : 0), 0, 100);

  /* ── 5. the world reacts to the arcology ────────────────────────────────────────────────── */
  for (const n of arc.neighbours) {
    n.prosperity = clamp(n.prosperity + r.normal(0, 2), 10, 200);
    n.attitude = clamp(n.attitude + (arc.prosperity > n.prosperity ? -1.2 : 0.6), -100, 100);
  }
  for (const proj of [...arc.projects]) {
    proj.weeks_left--;
    if (proj.weeks_left <= 0) {
      arc.projects = arc.projects.filter((x) => x.id !== proj.id);
      push(`${proj.title} is finished.`, "good", 8);
      applyProjectEffect(s, proj.on_complete);
    }
  }
  for (const loan of [...arc.loans]) {
    if (week >= loan.due_week) {
      const owed = Math.round(loan.principal * (1 + loan.apr / 4));
      if (arc.cash >= owed) { arc.cash -= owed; arc.loans = arc.loans.filter((l) => l !== loan); push(`Repaid the ${loan.lender}: ${owed}.`, "neutral", 6); }
      else { problems.push(`The ${loan.lender} wants ${owed} and you do not have it.`); if (loan.lender === "shark") { arc.security = clamp(arc.security - 15, 0, 100); push(`The shark's people came to the residential level. Security is down fifteen.`, "bad", 10); } }
    }
  }

  const recruiter = alive(s).find((p) => p.assignment === "recruit girls");
  if (recruiter) {
    const found = recruitResult(s, recruiter);
    if (found) {
      s.market.offers["recruit"] = [found];
      push(`${recruiter.name} found somebody. She is waiting in reception.`, "good", 8, recruiter.id);
    }
  }

  /* ── 6. bookkeeping, and the shape of next week ─────────────────────────────────────────── */
  arc.cash += led.cash;
  arc.rep = Math.max(0, arc.rep + led.rep);
  arc.week++;

  s.market = rollMarkets(s);
  // What the household wants from you this week. Two, at most, and the ones with the most standing
  // to ask go first — a screen of twelve requests is a queue, and a queue is not a decision.
  s.asks = collectAsks(s);
  for (const ask of s.asks) {
    const who = s.people[ask.person];
    if (who) push(`${who.name} wants something.`, "neutral", 7, who.id);
  }
  s.events = [...s.events.filter((e) => week - e.week < 2), ...selectEvents(s)];
  for (const e of s.events.filter((x) => x.week === arc.week - 1 || x.week === arc.week)) {
    push(e.seed, e.severity === "major" ? "warning" : "neutral", 10, e.person);
  }

  if (arc.cash < 0) problems.push(`You are ${Math.abs(arc.cash)} in the red.`);
  if (arc.food.stores < 100 && arc.food.consumption > 0) problems.push("Food stores are nearly out.");
  const overworked = alive(s).filter((p) => p.health.energy < 12);
  if (overworked.length) problems.push(`${overworked.length} of them have nothing left in the tank.`);
  const wornOut = alive(s).filter((p) => wear(p.psyche) > 0.7);
  if (wornOut.length) problems.push(`${wornOut.length} have been braced so long their resting point has moved.`);
  const u = unrest(s);
  if (u > 50) problems.push(`Household unrest is at ${Math.round(u)}. No amount of security touches this number.`);

  // You get better at this by doing it: a week of running a household is a week of practice.
  practise(s, "slaving", 0.5 + alive(s).length * 0.05);
  practise(s, "trading", 0.15);
  const keeper = theKeeper(s);
  if (keeper) push(`${keeper.name} closed the week. This is her report; you are reading it because she let you.`, "warning", 11, keeper.id);
  refreshPlayer(s);

  const report: WeekReport = {
    week,
    ledger: led.lines,
    lines: lines.sort((a, b) => b.weight - a.weight),
    cash_start: cashStart,
    cash_end: arc.cash,
    rep_start: repStart,
    rep_end: arc.rep,
    problems,
  };
  s.reports.push(report);
  if (s.reports.length > 24) s.reports.shift();
  return report;
}

/** Roughly how much sex a week of this assignment is. Feeds conception, and nothing else — the
 *  income model already counts customers separately. */
function sexualExposure(p: Person): number {
  switch (p.assignment) {
    case "work in the brothel": return 5;
    case "be confined in the arcade": return 6;
    case "whore": return 4;
    case "public servant": return 4;
    case "fucktoy": return 4;
    case "please you": return 3;
    case "serve in the club": return 2;
    case "be your Concubine": return 3;
    default: return 0;
  }
}

function weekMemory(p: Person, where: string, money: { customers: number; note: string }): string {
  if (money.customers > 60) return `a week of ${money.customers} of them in ${where}`;
  if (money.customers > 0) return `${money.customers} customers in ${where}`;
  if (p.assignment === "rest" || p.assignment === "rest in the spa") return `a week where nothing was asked of her, in ${where}`;
  return `a week working in ${where}`;
}

function applyProjectEffect(s: SaveState, effect: { effect: string; payload?: Record<string, unknown> }): void {
  const arc = s.arcology;
  switch (effect.effect) {
    case "facility_level": {
      const id = String(effect.payload?.facility ?? "");
      const f = arc.facilities[id];
      if (f) { f.level++; f.capacity += Number(effect.payload?.capacity ?? 4); }
      break;
    }
    case "security": arc.security = clamp(arc.security + Number(effect.payload?.amount ?? 10), 0, 100); break;
    case "prosperity": arc.prosperity = clamp(arc.prosperity + Number(effect.payload?.amount ?? 5), 0, 200); break;
    case "doctrine_research": {
      const id = String(effect.payload?.doctrine ?? "");
      if (arc.doctrines[id]) arc.doctrines[id].research = true;
      break;
    }
  }
}
