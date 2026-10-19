/**
 * GOVERNORS — one of your women, running an arcology you took, in your name.
 *
 * Take a city (a war won, a vassal, a neighbour bought into) and you can put her in charge of it.
 * She stays yours: wholly loyal, the city's loyalty locked to you through her, its tribute coming
 * home every week. But it is HER city. Its doctrine is read off who she is (what she likes, what
 * she's into, how much other people matter to her), she writes its decrees, and what she makes of
 * it depends on how sharp she is, how she's held up, and how much she has learned running things
 * for you. She writes to you. You can call her and talk, give her orders, praise her, punish her,
 * or bring her home.
 *
 * The model writes her letters and plays her on the line (engine/living, engine/talk). This file
 * is the half that holds without one: who can govern what, the doctrine she brings, the week.
 */
import type { Person, SaveState } from "./types";
import { addState, clamp, shove } from "./psyche";
import { applyTreatment, read } from "./obedience";
import { remember } from "./memory";
import { rng } from "./rng";
import { assignToFacility, setAssignment } from "./rules";
import { empireOf, powerById, powers, note, type PowerView } from "./power";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { chronicle } from "./chronicle";
import { startRumor } from "./social";
import { generatePerson } from "./generate";
import { newMemory } from "./memory";
import { refresh } from "./obedience";
import { LAW_BY_ID } from "../data/laws";
import { NATIONS } from "../data/people";
import { forces } from "./power";
import { asFate, sameName, settle, FATE_WORDS } from "./fates";
import { file } from "./others";

export interface Governorship {
  place: string;
  person: string;
  name: string;
  since: number;
  /** What her city believes, read off her. */
  doctrines: string[];
  /** Her laws, in her words. */
  decrees: { text: string; week: number }[];
  /** 0–100, her city's. */
  prosperity: number;
  order: number;
  letters: { week: number; text: string; read?: boolean }[];
  talk: { role: "you" | "her"; text: string; week: number }[];
  /** Messages this week, so a call is a call and not an endless one. */
  used?: { week: number; n: number };
  ended?: number;
  /** How she runs it, read off who she is. See styleOf. */
  style?: string[];
  /** People in her city she has to deal with. */
  faces?: Face[];
  /** What's going wrong there, and what it would take to fix it. */
  problems?: GovProblem[];
  /** Your troops stationed there, 0–3. */
  garrison?: number;
  /** One of your women sent to help her run it. */
  deputy?: string;
  /** Last week you spoke to her. */
  last_heard?: number;
  /** Things that happened there, as they happened, for her letters. */
  news?: { week: number; text: string }[];
}

export interface Face {
  name: string; role: string; /** −1 against her … +1 with her */ leaning: number;
  /** Dealt with (engine/fates). Kept, so nobody brings them back. */
  gone?: import("./fates").Settled;
  /** Who held this job before, if they were dealt with. */
  after?: string;
}
export type Need = "troops" | "cash" | "labour" | "advisor" | "you";
export interface GovProblem { id: string; kind: string; text: string; need: Need; severity: number; since: number; face?: string; crisis?: boolean }

export const NEED_WORDS: Record<Need, string> = {
  troops: "soldiers", cash: "money", labour: "hands", advisor: "someone who knows how to run things", you: "you",
};

export function governorsOf(s: SaveState): Governorship[] { return (s.governors ??= []); }
export function activeGovernors(s: SaveState): Governorship[] { return governorsOf(s).filter((g) => !g.ended); }
export function governorshipOf(s: SaveState, placeOrPerson: string): Governorship | undefined {
  return activeGovernors(s).find((g) => g.place === placeOrPerson || g.person === placeOrPerson);
}

/** Why this place can't be given a governor now, or null. */
export function canGovern(s: SaveState, placeId: string): string | null {
  const p = powerById(s, placeId);
  if (!p) return "it isn't on the map any more";
  if (governorshipOf(s, placeId)) return "she's already there";
  if (p.atWar) return "you're at war with it";
  if (p.rec.status === "vassal" || p.rec.status === "conquered") return null;
  if (p.kind === "neighbour" && (p.owned ?? 0) >= 55) return null;
  return "you need to hold it first: win it, make it a vassal, or own 55% of it";
}

/** Who could go. Adults of yours who can talk and think, and aren't already governing. */
export function governorCandidates(s: SaveState): Person[] {
  return Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18 && !p.governs && p.body.voice !== 0 && p.persona.intelligence !== "impaired" && p.psyche.state !== "broken" && s.player.owned_by !== p.id);
}

/** The doctrine she brings: what she's into, what she is, how much other people register. */
export function doctrinesFor(p: Person): string[] {
  const score: Record<string, number> = {};
  const add = (id: string, n: number) => { if (DOCTRINE_BY_ID[id]) score[id] = (score[id] ?? 0) + n; };
  const FROM_FETISH: Record<string, string[]> = {
    pregnancy: ["repopulation"], dom: ["degradationist"], sadist: ["degradationist"], humiliation: ["degradationist"],
    masochist: ["degradationist"], submissive: ["paternalist"], romantic: ["paternalist"], boobs: ["expansionist"],
    buttslut: ["expansionist"], cumslut: ["cummunism", "hedonist"], tease: ["hedonist"], perverted: ["hedonist"],
    "gagfuck queen": ["degradationist"], "painal queen": ["degradationist"], "strugglefuck queen": ["degradationist"],
  };
  for (const f of p.persona.fetishes) for (const id of FROM_FETISH[f.name] ?? []) add(id, f.strength / 30);
  if (p.persona.paraphilia) for (const id of FROM_FETISH[p.persona.paraphilia] ?? []) add(id, 3);
  if (p.persona.quirk?.id === "caring") add("paternalist", 2);
  add(p.persona.conscience > 0.6 ? "paternalist" : p.persona.conscience < 0.3 ? "degradationist" : "professionalism", 1.5);
  if (["sharp", "brilliant"].includes(p.persona.intelligence)) { add("eugenics", 1); add("professionalism", 1); }
  if (p.age >= 35) add("maturity", 1.2); else if (p.age <= 22) add("youth", 1);
  if (p.body.height_cm >= 180) add("statuesque", 1); else if (p.body.height_cm <= 155) add("petite", 1);
  if (p.body.boobs >= 1200) add("expansionist", 1);
  if (p.body.traits?.length) add("transformation", 1.5);
  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  // Two that can stand together.
  const out: string[] = [];
  for (const id of ranked) {
    if (out.length >= 2) break;
    if (out.some((o) => (o === "paternalist" && id === "degradationist") || (o === "degradationist" && id === "paternalist") || (o === "youth" && id === "maturity") || (o === "maturity" && id === "youth") || (o === "petite" && id === "statuesque") || (o === "statuesque" && id === "petite"))) continue;
    out.push(id);
  }
  return out.length ? out : ["professionalism"];
}

/* ── how she runs it ──────────────────────────────────────────────────────────────────────────── */

export interface Style { id: string; line: string; order: number; prosperity: number; sickness: number; unrest: number }

const STYLES: Record<string, Style> = {
  iron: { id: "iron", line: "She runs it by fear: public punishments, informers on every floor, a curfew she enforces herself.", order: 1.4, prosperity: -0.4, sickness: 0, unrest: 0.1 },
  soft: { id: "soft", line: "She runs it gently: amnesties, open kitchens, slaves allowed to bring her their complaints. People take advantage.", order: -1, prosperity: 0.4, sickness: 0, unrest: 0 },
  vice: { id: "vice", line: "Her city runs on pleasure: the brothels and clubs never close, she sets the fashion, and the money follows the fucking.", order: -0.8, prosperity: 0.9, sickness: 0.1, unrest: 0 },
  queen: { id: "queen", line: "She rules it like a queen: ceremony, her picture everywhere, citizens kneeling when she passes. The old families hate it.", order: 0.5, prosperity: -0.3, sickness: 0, unrest: 0.05 },
  lost: { id: "lost", line: "She doesn't really know how to run a city: contracts sit unsigned, the books go unread, and whoever talks to her last gets their way.", order: -0.6, prosperity: -1, sickness: 0.03, unrest: 0.03 },
  sharp: { id: "sharp", line: "She runs it like a business: she reads every ledger, cuts what doesn't pay, and nobody fools her twice.", order: 0.4, prosperity: 0.8, sickness: 0, unrest: 0 },
};

/** How she governs: one or two styles, from her conscience, her appetites, her pride and her brains. */
export function styleOf(p: Person): Style[] {
  const out: Style[] = [];
  const pride = /proud|vain|arrogant|haughty|bossy|imperious|spoiled/i.test(p.persona.core_traits.join(" ")) || (p.romance?.dominion ?? -100) > 20;
  const appetite = p.psyche.libido > 60 || p.persona.quirk?.id === "perverted" || p.persona.fetishes.some((f) => f.strength > 85 && ["cumslut", "tease", "perverted", "buttslut"].includes(f.name));
  if (p.persona.conscience < 0.35) out.push(STYLES.iron);
  else if (p.persona.conscience > 0.65) out.push(STYLES.soft);
  if (appetite) out.push(STYLES.vice);
  else if (pride) out.push(STYLES.queen);
  if (["impaired", "slow"].includes(p.persona.intelligence) || p.persona.education < 25) out.push(STYLES.lost);
  else if (p.persona.intelligence === "brilliant" || (p.persona.intelligence === "sharp" && p.persona.education > 60)) out.push(STYLES.sharp);
  return (out.length ? out : [STYLES.sharp]).slice(0, 2);
}

const ROLES = [
  "the dock boss", "the widow of the man who ran it before", "the police captain", "a slave dealer who hates taking orders from a slave",
  "the madam of the biggest brothel", "a preacher with a following", "the head of the engineers' guild", "a rich old citizen who lends everyone money",
  "the leader of the city's freed slaves", "a smuggler everyone pretends not to know",
];

function facesFor(s: SaveState, placeId: string): Face[] {
  const r = rng(`${s.id}:faces:${placeId}`);
  const roles = [...ROLES];
  const out: Face[] = [];
  for (let i = 0; i < 3; i++) {
    const nation = r.weighted(NATIONS, (n) => n.weight);
    const male = r.chance(0.55);
    const role = roles.splice(r.int(0, roles.length - 1), 1)[0];
    out.push({ name: `${r.pick(male ? nation.male : nation.female)} ${r.pick(nation.surnames)}`, role, leaning: Math.round((r() * 2 - 1) * 10) / 10 });
  }
  return out;
}

/* ── what goes wrong ─────────────────────────────────────────────────────────────────────────── */

interface ProblemDef { need: Need; chance: (s: SaveState, g: Governorship, p: Person, c: number) => number; text: (g: Governorship, p: Person, f?: Face) => string; hits: "prosperity" | "order" | "her" }

const PROBLEMS: Record<string, ProblemDef> = {
  unrest: { need: "troops", hits: "order",
    chance: (_s, g, p) => (g.order < 40 ? 0.3 : 0.03) + styleOf(p).reduce((n, x) => n + x.unrest, 0),
    text: (g, p, f) => `There were fights on ${g.name}'s lower levels after one of ${p.name}'s decrees was read out${f ? `, and ${f.name}, ${f.role}, is telling anyone who'll listen that a slave has no business giving orders` : ""}. Her guards are outnumbered.` },
  raiders: { need: "troops", hits: "prosperity",
    chance: (s, g) => ((g.garrison ?? 0) > 0 ? 0.01 : 0.05 + (powers(s).some((x) => x.attitude < -25 && x.id !== g.place) ? 0.06 : 0)),
    text: (g, _p, f) => `Raiders came in by the freight lifts at night and cleaned out two of ${g.name}'s warehouses${f ? `. ${f.name}, ${f.role}, lost the most and wants to know where the owner's soldiers are` : ""}. There's nobody there to stop them coming back.` },
  shortage: { need: "cash", hits: "prosperity",
    chance: (_s, g, p, c) => (g.prosperity < 40 ? 0.15 : 0.02) + (c < 0.85 ? 0.08 : 0) + (styleOf(p).some((x) => x.id === "lost") ? 0.05 : 0),
    text: (g, p, f) => `${g.name} is running short: the food stores were never restocked after ${p.name} moved the money somewhere else${f ? `, and ${f.name}, ${f.role}, has started selling what's left at three times the price` : ""}.` },
  sickness: { need: "cash", hits: "prosperity",
    chance: (_s, _g, p) => 0.02 + styleOf(p).reduce((n, x) => n + x.sickness, 0),
    text: (g, _p, f) => `Something is going round ${g.name}'s brothels and slave pens, a fever and a rash, and the clinic there has run out of everything${f ? `. ${f.name}, ${f.role}, has shut their doors until someone does something` : ""}.` },
  labour: { need: "labour", hits: "prosperity",
    chance: (_s, g) => (g.prosperity > 55 ? 0.07 : 0.01),
    text: (g, p, f) => `${g.name} is growing faster than it has bodies for: half-built floors, ships waiting at the dock for crews${f ? `, and ${f.name}, ${f.role}, says ${p.name} promised workers she doesn't have` : ""}.` },
  mess: { need: "advisor", hits: "prosperity",
    chance: (_s, _g, p, c) => (styleOf(p).some((x) => x.id === "sharp") ? 0 : c < 0.8 ? 0.18 : c < 0.95 ? 0.04 : 0),
    text: (g, p, f) => `${p.name} has signed three contracts in ${g.name} that contradict each other, and nobody there knows which one to follow${f ? `. ${f.name}, ${f.role}, read all three and is quietly making money off the gaps` : ""}.` },
  rival: { need: "troops", hits: "order",
    chance: (_s, g) => (live(g).some((f) => f.leaning < -0.3) ? 0.06 : 0),
    text: (g, p, f) => `${f ? `${f.name}, ${f.role},` : "Someone in the city"} is holding meetings about ${p.name}: who she was before you collared her, and whether ${g.name} has to put up with her.` },
  her: { need: "you", hits: "her",
    chance: (s, g, p) => (p.psyche.relaxation < -2 ? 0.3 : 0) + (s.arcology.week - (g.last_heard ?? g.since) > 5 ? 0.25 : 0) + (p.bond.hope < 25 ? 0.1 : 0),
    text: (g, p) => `${p.name} isn't coping. Her staff in ${g.name} say she's stopped sleeping, snaps at everyone, and spends the evenings alone asking whether you've called.` },
};

/** The people in her city who are still around. */
const live = (g: Governorship): Face[] => (g.faces ?? []).filter((f) => !f.gone);

const pickFace = (g: Governorship, r: ReturnType<typeof rng>, against = false): Face | undefined => {
  const fs = live(g).filter((f) => !against || f.leaning < 0.2);
  return fs.length ? r.pick(fs) : undefined;
};

/** Her first decrees, written by the game; a model rewrites them in her voice (engine/living). */
function firstDecrees(p: Person, doctrines: string[]): string[] {
  const line: Record<string, string> = {
    paternalist: "Slaves in this city are to be fed, housed and spoken to properly. Anyone who breaks one answers to me.",
    degradationist: "Slaves kneel when a citizen passes, and are used where they kneel if the citizen wants.",
    repopulation: "Every fertile slave in the city is to be kept pregnant. Contraceptives are confiscated.",
    expansionist: "The clinics are to make every slave's tits and ass bigger, at the city's expense.",
    hedonist: "Nobody in this city goes hungry or goes without. Eat, drink, fuck.",
    cummunism: "Cum is to be shared. No slave in the city refuses a cock.",
    professionalism: "Every slave learns a trade and does it well, or is sold.",
    eugenics: "Only the best breed. The rest are sterilised.",
    maturity: "Older slaves are to be given the best posts and the best treatment.",
    youth: "The youngest slaves are the city's pride and are kept that way.",
    statuesque: "Tall slaves are prized and fed for it.",
    petite: "Small slaves are prized and kept small.",
    transformation: "The labs are open to anyone who wants to be made into something else.",
  };
  return doctrines.map((d) => line[d]).filter(Boolean).slice(0, 2).concat(`The city answers to ${p.name}, and ${p.name} answers to the owner.`);
}

/** Put her in charge. Returns the line for the screen. */
export function installGovernor(s: SaveState, placeId: string, personId: string): { ok: boolean; line: string } {
  const why = canGovern(s, placeId);
  if (why) return { ok: false, line: why };
  const p = s.people[personId];
  if (!p || !governorCandidates(s).includes(p)) return { ok: false, line: "She can't go." };
  const place = powerById(s, placeId)!;
  const rec = place.rec;
  if (rec.status === "free") { rec.status = "vassal"; rec.since = s.arcology.week; }
  rec.governor = p.id;
  rec.attitude = 100; rec.grudge = 0;
  rec.pays = Math.max(rec.pays ?? 0, Math.round(place.strength * 140));
  const n = s.arcology.neighbours.find((x) => x.id === placeId);
  if (n) { n.attitude = 100; n.scheme = undefined; }

  assignToFacility(s, p, undefined);
  setAssignment(s, p, "be your agent");
  p.governs = placeId;
  const doctrines = doctrinesFor(p);
  if (n) n.doctrines = doctrines;
  const g: Governorship = {
    place: placeId, person: p.id, name: place.name, since: s.arcology.week, doctrines,
    decrees: firstDecrees(p, doctrines).map((text) => ({ text, week: s.arcology.week })),
    prosperity: clamp(Math.round(place.strength * 0.6), 20, 80), order: rec.status === "conquered" ? 35 : 55,
    letters: [], talk: [],
    style: styleOf(p).map((x) => x.id), faces: facesFor(s, placeId), problems: [], garrison: 0, last_heard: s.arcology.week, news: [],
  };
  governorsOf(s).push(g);

  applyTreatment(p, { kind: "recognition", size: 10, why: `the owner gave her ${place.name} to rule` }, s.arcology.week);
  shove(p.psyche, 1.5);
  const mem = s.memory[p.id];
  if (mem) remember(mem, { content: `the owner sent me to rule ${place.name} in their name`, week: s.arcology.week, importance: 10, charge: "bright", core: true });
  const doc = doctrines.map((d) => DOCTRINE_BY_ID[d]?.noun ?? d).join(" and ");
  startRumor(s, `the owner has put ${p.name} in charge of ${place.name}`, { salience: 9, about: p.id });
  chronicle(s, { keys: [p.id, `gov:${placeId}`, `place:${placeId}`], title: "a governor", text: `You put ${p.name} in charge of ${place.name}. She brought ${doc} with her.`, hook: `how ${p.name} rules ${place.name}` });
  note(s, `${p.name} now governs ${place.name} for you.`);
  return { ok: true, line: `${p.name} leaves for ${place.name} with your seal. The city is hers to run, and hers is yours. She'll take ${doc} with her.` };
}

/** Bring her home. */
export function recallGovernor(s: SaveState, placeId: string, why = "recalled"): string {
  const g = governorshipOf(s, placeId);
  if (!g) return "";
  g.ended = s.arcology.week;
  const p = s.people[g.person];
  const rec = empireOf(s).powers[placeId];
  if (rec) { rec.governor = undefined; rec.attitude = 30; }
  const dep = g.deputy ? s.people[g.deputy] : undefined;
  if (dep && dep.governs === placeId) { dep.governs = undefined; if (dep.status === "owned") setAssignment(s, dep, "rest"); }
  if (p) {
    p.governs = undefined;
    if (p.status === "owned") setAssignment(s, p, "rest");
    const mem = s.memory[p.id];
    if (mem && p.status === "owned") remember(mem, { content: `the owner brought me home from ${g.name}`, week: s.arcology.week, importance: 7, charge: "dull" });
  }
  chronicle(s, { keys: [g.person, `gov:${placeId}`, `place:${placeId}`], text: `${p?.name ?? "Your governor"} left ${g.name} (${why}).` });
  return `${p?.name ?? "She"} comes home from ${g.name}.`;
}

/** Lock her up: the cellblock if you have one, a storeroom with a lock on the outside if you don't. */
export function lockUp(s: SaveState, p: Person, why: string): string {
  const week = s.arcology.week;
  const cells = Object.values(s.arcology.facilities).find((f) => f.kind === "cellblock" && f.level > 0 && f.workers.length < f.capacity);
  if (p.governs) { const g = governorshipOf(s, p.governs); if (g?.deputy === p.id) { g.deputy = undefined; } p.governs = undefined; }
  if (cells) assignToFacility(s, p, cells.id);
  else { assignToFacility(s, p, undefined); setAssignment(s, p, "be confined in the cellblock"); }
  applyTreatment(p, { kind: "cruelty", size: 7, why }, week);
  p.bond.fear = clamp(p.bond.fear + 15, 0, 100);
  shove(p.psyche, -2.5, { hard: true });
  addState(p.psyche, "dread of the cell", week);
  const mem = s.memory[p.id];
  if (mem) remember(mem, { content: `the owner had me ${why}`, week, importance: 9, charge: "sharp", core: true });
  startRumor(s, `${p.name} was ${why}`, { about: p.id, salience: 9, charge: -1 });
  // Everyone in the house hears what happens to a woman who displeases the owner.
  for (const o of Object.values(s.people)) if (o.id !== p.id && o.status === "owned") o.bond.fear = clamp(o.bond.fear + 3, 0, 100);
  chronicle(s, { keys: [p.id], title: "locked up", text: `You had ${p.name} ${why}.`, hook: `${p.name} in the cell, and what she does to get out` });
  return `${p.name} is locked in ${cells ? "the cellblock" : "a storeroom under the penthouse with a bolt on the outside"}.`;
}

/** How good she is at it: brains, what she's learned running things, and how she's holding up. */
export function competence(s: SaveState, p: Person): number {
  const brains = { impaired: 0.3, slow: 0.6, average: 0.9, sharp: 1.15, brilliant: 1.35 }[p.persona.intelligence];
  const mgmt = Math.max(0, ...Object.values(p.skills.management ?? {}), 0) / 100;
  const held = p.psyche.state === "intact" ? 1 : 0.6;
  const educated = 0.8 + p.persona.education / 250;
  const g = p.governs ? governorshipOf(s, p.governs) : undefined;
  const dep = g?.deputy && g.deputy !== p.id ? s.people[g.deputy] : undefined;
  const help = dep && dep.status === "owned" ? 0.25 * baseCompetence(dep) : 0;
  return clamp(brains * educated * held * (0.85 + mgmt * 0.5) + help, 0.2, 1.8);
}

function baseCompetence(p: Person): number {
  const brains = { impaired: 0.3, slow: 0.6, average: 0.9, sharp: 1.15, brilliant: 1.35 }[p.persona.intelligence];
  return brains * (0.8 + p.persona.education / 250);
}

/** For her card: she governs, and what. */
export function governorLine(s: SaveState, p: Person): string {
  if (!p.governs) return "";
  const g = governorshipOf(s, p.governs);
  if (!g) return "";
  if (g.person !== p.id) return `SHE IS AWAY IN ${g.name.toUpperCase()}: you sent her to help ${s.people[g.person]?.name ?? "its governor"} run it.`;
  const style = styleOf(p).map((x) => x.line).join(" ");
  const trouble = (g.problems ?? []).map((x) => x.text).join(" ");
  return `SHE GOVERNS ${g.name.toUpperCase()} FOR YOU (since week ${g.since}): she lives there and runs it in your name, completely loyal to you, entirely in her own way. ${style} Her decrees: ${g.decrees.slice(-3).map((d) => `"${d.text}"`).join(" ")}${trouble ? ` What's going wrong there: ${trouble}` : ""}`;
}

/** Everything about her city, for a prompt. */
export function governorBrief(s: SaveState, g: Governorship): string {
  const place = powerById(s, g.place);
  const yourLaws = (place?.rec.laws ?? []).map((id) => LAW_BY_ID[id]?.name).filter(Boolean);
  return [
    `${g.name.toUpperCase()}, HER CITY. ${place ? `A ${place.kind === "neighbour" ? "neighbouring arcology" : place.kind === "freecity" ? "Free City" : "Old World state"}, strength ${place.strength}.` : ""} She has run it since week ${g.since} (now week ${s.arcology.week}).`,
    `It believes in: ${g.doctrines.map((d) => `${DOCTRINE_BY_ID[d]?.noun ?? d} (${DOCTRINE_BY_ID[d]?.creed ?? ""})`).join("; ")}.`,
    `Her decrees: ${g.decrees.map((d) => `"${d.text}" (week ${d.week})`).join(" ")}`,
    yourLaws.length ? `Your laws it keeps because you told it to: ${yourLaws.join(", ")}.` : "",
    `HOW SHE RUNS IT: ${(g.style ?? []).map((id) => STYLES[id]?.line).filter(Boolean).join(" ")}`,
    `HOW IT'S GOING: ${g.prosperity > 65 ? "rich and getting richer" : g.prosperity > 45 ? "getting by" : g.prosperity > 25 ? "going downhill" : "in a bad way"}; ${g.order > 65 ? "under control" : g.order > 40 ? "restless" : "close to boiling over"}. Your soldiers there: ${["none", "a company", "a battalion", "a whole garrison"][g.garrison ?? 0]}.${g.deputy && s.people[g.deputy] ? ` Her deputy, sent by you: ${s.people[g.deputy].name}.` : ""}`,
    live(g).length ? `PEOPLE SHE DEALS WITH THERE: ${live(g).map((f) => `${f.name}, ${f.role} (${f.leaning > 0.3 ? "on her side" : f.leaning < -0.3 ? "against her" : "out for themselves"})${f.after ? `, who took the job after ${f.after} was dealt with` : ""}`).join("; ")}.` : "",
    (g.faces ?? []).some((f) => f.gone) ? `GONE, AND STAYING GONE: ${(g.faces ?? []).filter((f) => f.gone).map((f) => `${f.name}, who was ${f.role}: ${FATE_WORDS[f.gone!.fate]} in week ${f.gone!.week}`).join("; ")}.` : "",
    (g.problems ?? []).length ? `WHAT'S GOING WRONG, AND WHAT SHE NEEDS:\n${(g.problems ?? []).map((x) => `· ${x.text} She needs ${NEED_WORDS[x.need]}. (${x.severity >= 7 ? "it's bad now" : x.severity >= 4 ? "getting worse" : "new"}, since week ${x.since})`).join("\n")}` : "Nothing is badly wrong there right now.",
    (g.news ?? []).length ? `RECENTLY THERE: ${(g.news ?? []).slice(-5).map((n) => `week ${n.week}: ${n.text}`).join(" | ")}` : "",
    g.letters.length ? `Her last letter (week ${g.letters.at(-1)!.week}), DON'T REPEAT IT: ${g.letters.at(-1)!.text.slice(0, 500)}` : "",
  ].filter(Boolean).join("\n");
}

export interface GovOrder { note: string; run: (s: SaveState, g: Governorship, p: Person, value?: string | number) => string }

/** What you can tell her to do. Closed: a model on the call picks from these, nothing else. */
export const GOV_ORDERS: Record<string, GovOrder> = {
  decree: { note: "she makes a new law in her city; value is the law in plain words", run: (s, g, _p, v) => { const text = String(v ?? "").trim().slice(0, 220); if (!text) return ""; g.decrees.push({ text, week: s.arcology.week }); if (g.decrees.length > 8) g.decrees.shift(); g.order = clamp(g.order + 2, 0, 100); return `New decree in ${g.name}: "${text}"`; } },
  your_law: { note: "her city adopts one of your laws; value is the law id", run: (s, g, _p, v) => { const l = LAW_BY_ID[String(v)]; const rec = empireOf(s).powers[g.place]; if (!l || !rec) return ""; rec.laws = [...new Set([...(rec.laws ?? []), l.id])]; g.decrees.push({ text: `${l.name}: ${l.text}`, week: s.arcology.week }); s.arcology.rep += 120; return `${g.name} now keeps your ${l.name}.`; } },
  send_cash: { note: "she sends extra money now; value is the amount, at most what the city can spare", run: (s, g, _p, v) => { const place = powerById(s, g.place); const cap = Math.round((place?.strength ?? 50) * 800 * (g.prosperity / 60)); const n = clamp(Math.round(Number(v) || cap / 2), 1000, Math.max(1000, cap)); s.arcology.cash += n; g.prosperity = clamp(g.prosperity - n / Math.max(4000, (place?.strength ?? 50) * 150), 0, 100); return `${g.name} sends ¤${n.toLocaleString()}.`; } },
  send_girls: { note: "she sends you women from her city; value is how many, 1 to 3", run: (s, g, p, v) => { const k = clamp(Math.round(Number(v) || 1), 1, 3); const names: string[] = []; for (let i = 0; i < k; i++) { const w = generatePerson({ seed: `gov:${g.place}:${s.arcology.week}:${i}:${g.talk.length}`, week: s.arcology.week, quality: clamp(0.3 + g.prosperity / 200, 0, 0.9) }); w.origin.acquired_how = `sent from ${g.name} by ${p.name}`; w.origin.acquired_week = s.arcology.week; w.economics.price_paid = 0; s.people[w.id] = w; s.memory[w.id] = newMemory(); refresh(w, s.memory[w.id]); names.push(w.name); } g.prosperity = clamp(g.prosperity - 2 * k, 0, 100); return `${names.join(" and ")} arrive from ${g.name}, sent by ${p.name}.`; } },
  deal_with: { note: "she has one person in her city dealt with, the way the owner said; value is \"Full Name: kill|ruin|exile|jail|buy\"", run: (s, g, p, v) => dealWith(s, g, p, String(v ?? "")) },
  crackdown: { note: "she clamps down on her city: more order, less prosperity", run: (_s, g) => { g.order = clamp(g.order + 15, 0, 100); g.prosperity = clamp(g.prosperity - 4, 0, 100); return `${g.name} is locked down. It's quiet.`; } },
  festival: { note: "she throws the city a festival: prosperity and goodwill, at a cost", run: (s, g) => { s.arcology.cash -= 6000; g.prosperity = clamp(g.prosperity + 5, 0, 100); g.order = clamp(g.order - 3, 0, 100); return `${g.name} has a festival in your name. ¤6,000.`; } },
  recall: { note: "she comes home and stops governing", run: (s, g) => recallGovernor(s, g.place) },
  imprison: { note: "the owner has her stripped of the city, brought home under guard and locked in a cell", run: (s, g, p) => { recallGovernor(s, g.place, "dragged home and locked up"); return lockUp(s, p, `taken out of ${g.name} and locked up`); } },
  support_cash: { note: "YOU send her money for her city; value is the amount", run: (s, g, _p, v) => supportGovernor(s, g.place, "cash", Number(v) || 10000) },
  support_troops: { note: "YOU send soldiers to her city", run: (s, g) => supportGovernor(s, g.place, "troops") },
  support_labour: { note: "YOU send her workers (menials)", run: (s, g) => supportGovernor(s, g.place, "labour") },
};

/** Have someone in her city dealt with. She has your soldiers and your name behind her, so it
 *  gets done; how cleanly depends on her. */
function dealWith(s: SaveState, g: Governorship, p: Person, v: string): string {
  const [rawName, rawHow] = v.split(/:|\|/).map((x) => x.trim());
  const fate = asFate(rawHow) ?? "dead";
  const f = live(g).find((x) => rawName && sameName(x.name, rawName));
  if (!f) return "";
  if (fate === "bought" && s.arcology.cash < 5000) return `You don't have the ¤5,000 it would take to buy ${f.name}.`;
  if (fate === "bought") s.arcology.cash -= 5000;
  const c = competence(s, p);
  const styles = (g.style ?? []).join(" ");
  const who = f.name.split(" ")[0];
  const how = {
    dead: c < 0.7 ? `${p.name} had it done, badly: in daylight, with witnesses, and everyone knows who ordered it` : /fear|cruel/.test(styles) ? `${p.name} had it done where people would see the body` : `${p.name} had it done quietly, and ${who} turned up in the water two days later`,
    ruined: `${p.name} took ${who}'s contracts, accounts and good name, and left nothing`,
    exiled: `${p.name}'s guards put ${who} on a boat with one bag`,
    jailed: `${p.name} had ${who} taken at night and put in a cell`,
    bought: `${p.name} paid ${who} ¤5,000 of yours, and ${who} works for her now`,
  }[fate];
  if (fate === "dead" && c < 0.7) { g.order = clamp(g.order - 8, 0, 100); startRumor(s, `${p.name} had ${f.name} killed in ${g.name}`, { about: p.id, salience: 7 }); }
  if (fate === "bought") f.leaning = 0.6;
  const lines = settle(s, f.name, fate, how, { place: g.place, by: p.name });
  if (fate === "bought") { delete f.gone; f.leaning = 0.6; }
  remember(s.memory[p.id] ?? (s.memory[p.id] = newMemory()), { content: `the owner told me to deal with ${f.name}, and I did: ${how}`, week: s.arcology.week, importance: 7, charge: "cold" });
  return `${f.name}, ${f.role}: ${FATE_WORDS[fate]}. ${how}.${lines.length > 1 ? ` ${lines.slice(1).join("; ")}.` : ""}`.replace(/\.\./g, ".");
}

/** What sending this would cost, or why you can't. */
export function supportBlocked(s: SaveState, placeId: string, kind: Need, amount = 10000): string | null {
  const g = governorshipOf(s, placeId);
  if (!g) return "nobody's governing there";
  if (kind === "cash") return s.arcology.cash < amount ? `you don't have ¤${amount.toLocaleString()}` : null;
  if (kind === "troops") { const cap = troopCap(s); return (g.garrison ?? 0) >= 3 ? "she has a whole garrison already" : (g.garrison ?? 0) >= cap ? `your forces (${forces(s).total}) can't spare more; build up your arsenal` : null; }
  if (kind === "labour") return (s.menials?.owned ?? 0) < 20 && s.arcology.cash < 9000 ? "you have no menials to spare and can't buy them (¤9,000)" : null;
  return null;
}

/** How many companies your forces can keep abroad. */
const troopCap = (s: SaveState) => clamp(Math.floor(forces(s).total / 25), 0, 3);

/** Send her help. Fixes what it can, and she hears about it. */
export function supportGovernor(s: SaveState, placeId: string, kind: Need, value?: number | string): string {
  const g = governorshipOf(s, placeId);
  const p = g ? s.people[g.person] : undefined;
  if (!g || !p) return "";
  const why = supportBlocked(s, placeId, kind, Number(value) || 10000);
  if (why) return `You can't: ${why}.`;
  const week = s.arcology.week;
  const fix = (needs: Need[], by: number) => { for (const x of g.problems ?? []) if (needs.includes(x.need)) x.severity -= by; g.problems = (g.problems ?? []).filter((x) => x.severity > 0); };
  let line = "";
  if (kind === "cash") {
    const n = Math.round(Number(value) || 10000);
    s.arcology.cash -= n;
    fix(["cash"], Math.max(2, n / 3000));
    g.prosperity = clamp(g.prosperity + n / 6000, 0, 100);
    line = `You send ¤${n.toLocaleString()} to ${g.name}.`;
  } else if (kind === "troops") {
    g.garrison = (g.garrison ?? 0) + 1;
    empireOf(s).readiness = clamp(empireOf(s).readiness - 10, 0, 100);
    fix(["troops"], 5);
    g.order = clamp(g.order + 8, 0, 100);
    line = `A company of your soldiers goes to ${g.name}. They'll cost ¤3,500 a week to keep there.`;
  } else if (kind === "labour") {
    if ((s.menials?.owned ?? 0) >= 20) s.menials!.owned -= 20; else s.arcology.cash -= 9000;
    fix(["labour"], 10);
    g.prosperity = clamp(g.prosperity + 3, 0, 100);
    line = `Twenty menials go to ${g.name} to work.`;
  }
  (g.news ??= []).push({ week, text: line });
  applyTreatment(p, { kind: "recognition", size: 3, why: `the owner sent help to ${g.name}` }, week);
  chronicle(s, { keys: [`gov:${placeId}`, p.id], title: "help sent", text: `${line} ${p.name} had asked for it.` });
  return line;
}

/** Send another of your women to help her: competence for the city, a companion or a rival for her. */
export function sendDeputy(s: SaveState, placeId: string, personId: string): string {
  const g = governorshipOf(s, placeId);
  const p = g ? s.people[g.person] : undefined;
  const d = s.people[personId];
  if (!g || !p || !d || !governorCandidates(s).includes(d)) return "";
  if (g.deputy && s.people[g.deputy]) { s.people[g.deputy].governs = undefined; setAssignment(s, s.people[g.deputy], "rest"); }
  assignToFacility(s, d, undefined);
  setAssignment(s, d, "be your agent");
  d.governs = placeId;
  g.deputy = d.id;
  g.problems = (g.problems ?? []).filter((x) => x.need !== "advisor");
  const line = `${d.name} goes to ${g.name} to help ${p.name} run it.`;
  (g.news ??= []).push({ week: s.arcology.week, text: line });
  chronicle(s, { keys: [`gov:${placeId}`, p.id, d.id], title: "a deputy", text: line, hook: `how ${p.name} and ${d.name} get on, running ${g.name} together` });
  return line;
}

export interface GovLine { text: string; tone: "good" | "bad" | "neutral" | "warning"; person?: string }

/** Weekly. Her style moves her city; her weaknesses make trouble; trouble left alone gets worse. */
export function tickGovernors(s: SaveState): { cash: number; lines: GovLine[] } {
  const lines: GovLine[] = [];
  let cash = 0;
  const week = s.arcology.week;
  for (const g of activeGovernors(s)) {
    const p = s.people[g.person];
    const place = powerById(s, g.place);
    if (!p || p.status !== "owned" || !place || place.rec.status === "free") {
      const why = !p || p.status === "dead" ? "she died" : p.status !== "owned" ? "she isn't yours any more" : "the city is gone";
      recallGovernor(s, g.place, why);
      lines.push({ text: `${g.name} has no governor now: ${why}.`, tone: "bad", person: g.person });
      continue;
    }
    g.problems ??= []; g.news ??= []; g.faces ??= facesFor(s, g.place); g.style ??= styleOf(p).map((x) => x.id);
    const r = rng(`gov:${g.place}:${week}`);
    for (const f of live(g)) file(s, f.name, `${f.role} in ${g.name}`);

    // Somebody always takes the job of a man who was dealt with, a few weeks on, and they know why it was free.
    for (const f of g.faces) {
      if (!f.gone || f.gone.fate === "bought" || week - f.gone.week < 3 || g.faces.some((x) => x.after === f.name)) continue;
      const nation = r.weighted(NATIONS, (n) => n.weight);
      const male = r.chance(0.55);
      const next: Face = { name: `${r.pick(male ? nation.male : nation.female)} ${r.pick(nation.surnames)}`, role: f.role, after: f.name,
        leaning: f.gone.fate === "dead" || f.gone.fate === "jailed" ? 0.2 : f.gone.fate === "ruined" ? -0.2 : 0 };
      g.faces.push(next);
      const text = `${next.name} is ${f.role} in ${g.name} now, since ${f.name} was ${FATE_WORDS[f.gone.fate]}. ${next.leaning > 0 ? "They're being very careful around her." : "They remember what happened to the last one, and they're quieter about it."}`;
      g.news.push({ week, text });
      lines.push({ text, tone: "neutral", person: p.id });
      chronicle(s, { keys: [`gov:${g.place}`, p.id], title: "a new face", text });
    }
    const c = competence(s, p);
    const styles = styleOf(p);
    g.style = styles.map((x) => x.id);

    // Her way of running it.
    g.prosperity = clamp(g.prosperity + (c - 0.9) * 2.5 + styles.reduce((n, x) => n + x.prosperity, 0) + r.normal(0, 1), 5, 100);
    g.order = clamp(g.order + (c - 0.9) * 1.5 + styles.reduce((n, x) => n + x.order, 0) + (g.garrison ?? 0) * 0.8 + r.normal(0, 0.8), 5, 100);

    // Trouble already there gets worse, and costs.
    for (const x of g.problems) {
      const def = PROBLEMS[x.kind];
      x.severity = clamp(x.severity + (x.kind === "her" && week - (g.last_heard ?? 0) <= 1 ? -3 : 1) - (x.need === "troops" ? (g.garrison ?? 0) : 0), 0, 10);
      if (def?.hits === "prosperity") g.prosperity = clamp(g.prosperity - x.severity * 0.3, 5, 100);
      if (def?.hits === "order") g.order = clamp(g.order - x.severity * 0.35, 5, 100);
      if (def?.hits === "her") { shove(p.psyche, -0.15 * x.severity); p.bond.hope = clamp(p.bond.hope - 0.5, 0, 100); }
      if (x.severity >= 8 && !x.crisis) {
        x.crisis = true;
        const text = x.kind === "unrest" || x.kind === "rival" ? `${g.name} rioted. ${p.name} had to lock herself in the governor's palace while the lower levels burned.`
          : x.kind === "raiders" ? `Raiders sacked ${g.name}'s docks. This week's tribute went with them.`
          : x.kind === "her" ? `${p.name} broke down in front of her staff in ${g.name}. She hasn't left her rooms since.`
          : `What was going wrong in ${g.name} has become a disaster: ${x.text}`;
        if (x.kind === "unrest" || x.kind === "rival") { g.prosperity = clamp(g.prosperity - 8, 5, 100); g.order = clamp(g.order - 10, 5, 100); }
        if (x.kind === "raiders") place.rec.pays = 0;
        if (x.kind === "her") shove(p.psyche, -2, { hard: true });
        g.news.push({ week, text });
        lines.push({ text, tone: "bad", person: p.id });
        chronicle(s, { keys: [`gov:${g.place}`, p.id], title: "a crisis", text, hook: `what's left of ${g.name} after it` });
      }
    }
    g.problems = g.problems.filter((x) => x.severity > 0);

    // New trouble, from who she is and what she has.
    if (g.problems.length < 3) {
      const open = new Set(g.problems.map((x) => x.kind));
      const pool = Object.entries(PROBLEMS).filter(([k]) => !open.has(k)).map(([k, d]) => ({ k, d, w: d.chance(s, g, p, c) })).filter((x) => x.w > 0);
      for (const x of pool) {
        if (!r.chance(x.w)) continue;
        const face = x.k === "her" ? undefined : pickFace(g, r, x.k === "rival" || x.k === "unrest");
        const text = x.d.text(g, p, face);
        g.problems.push({ id: `${x.k}-${week}`, kind: x.k, text, need: x.d.need, severity: 2, since: week, face: face?.name });
        g.news.push({ week, text });
        lines.push({ text, tone: "warning", person: p.id });
        chronicle(s, { keys: [`gov:${g.place}`, p.id], title: "trouble", text, hook: `${NEED_WORDS[x.d.need]} for ${g.name}` });
        break;
      }
    }
    if (g.news.length > 16) g.news.splice(0, g.news.length - 16);

    // Your soldiers there cost you.
    cash -= (g.garrison ?? 0) * 3500;
    const crises = g.problems.filter((x) => x.severity >= 6).length;
    if (place.rec.pays !== 0 || !g.problems.some((x) => x.kind === "raiders" && x.crisis)) place.rec.pays = Math.round(place.strength * 140 * (0.4 + g.prosperity / 100) * (0.8 + c * 0.2) * (1 - crises * 0.2));
    p.skills.management.governor = clamp((p.skills.management.governor ?? 0) + 2, 0, 100);
    shove(p.psyche, g.problems.length ? -0.1 * g.problems.length : 0.3);
    if ((week - g.since) % 4 === 3) applyTreatment(p, { kind: "recognition", size: 2, why: `still trusted with ${g.name}` }, week);
  }
  return { cash, lines };
}

/** Governed places on the map, for the screens. */
export function governedPlaces(s: SaveState): { g: Governorship; p?: Person; place?: PowerView }[] {
  const all = powers(s);
  return activeGovernors(s).map((g) => ({ g, p: s.people[g.person], place: all.find((x) => x.id === g.place) }));
}
