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
import { clamp, shove } from "./psyche";
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
}

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
  if (p) {
    p.governs = undefined;
    if (p.status === "owned") setAssignment(s, p, "rest");
    const mem = s.memory[p.id];
    if (mem && p.status === "owned") remember(mem, { content: `the owner brought me home from ${g.name}`, week: s.arcology.week, importance: 7, charge: "dull" });
  }
  chronicle(s, { keys: [g.person, `gov:${placeId}`, `place:${placeId}`], text: `${p?.name ?? "Your governor"} left ${g.name} (${why}).` });
  return `${p?.name ?? "She"} comes home from ${g.name}.`;
}

/** How good she is at it: brains, what she's learned running things, and how she's holding up. */
export function competence(s: SaveState, p: Person): number {
  const brains = { impaired: 0.3, slow: 0.6, average: 0.9, sharp: 1.15, brilliant: 1.35 }[p.persona.intelligence];
  const mgmt = Math.max(0, ...Object.values(p.skills.management ?? {}), 0) / 100;
  const held = p.psyche.state === "intact" ? 1 : 0.6;
  const educated = 0.8 + p.persona.education / 250;
  return clamp(brains * educated * held * (0.85 + mgmt * 0.5), 0.2, 1.8);
}

/** For her card: she governs, and what. */
export function governorLine(s: SaveState, p: Person): string {
  if (!p.governs) return "";
  const g = governorshipOf(s, p.governs);
  if (!g) return "";
  return `SHE GOVERNS ${g.name.toUpperCase()} FOR YOU (since week ${g.since}): she lives there and runs it in your name, completely loyal to you. Her city believes in ${g.doctrines.map((d) => DOCTRINE_BY_ID[d]?.noun ?? d).join(" and ")}. Her decrees: ${g.decrees.slice(-4).map((d) => `"${d.text}"`).join(" ")} Prosperity ${Math.round(g.prosperity)}/100, order ${Math.round(g.order)}/100.`;
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
    `Prosperity ${Math.round(g.prosperity)}/100. Order ${Math.round(g.order)}/100. It sends you ¤${(place?.rec.pays ?? 0).toLocaleString()} a week.`,
    g.letters.length ? `Her last letter (week ${g.letters.at(-1)!.week}): ${g.letters.at(-1)!.text.slice(0, 500)}` : "",
  ].filter(Boolean).join("\n");
}

export interface GovOrder { note: string; run: (s: SaveState, g: Governorship, p: Person, value?: string | number) => string }

/** What you can tell her to do. Closed: a model on the call picks from these, nothing else. */
export const GOV_ORDERS: Record<string, GovOrder> = {
  decree: { note: "she makes a new law in her city; value is the law in plain words", run: (s, g, _p, v) => { const text = String(v ?? "").trim().slice(0, 220); if (!text) return ""; g.decrees.push({ text, week: s.arcology.week }); if (g.decrees.length > 8) g.decrees.shift(); g.order = clamp(g.order + 2, 0, 100); return `New decree in ${g.name}: "${text}"`; } },
  your_law: { note: "her city adopts one of your laws; value is the law id", run: (s, g, _p, v) => { const l = LAW_BY_ID[String(v)]; const rec = empireOf(s).powers[g.place]; if (!l || !rec) return ""; rec.laws = [...new Set([...(rec.laws ?? []), l.id])]; g.decrees.push({ text: `${l.name}: ${l.text}`, week: s.arcology.week }); s.arcology.rep += 120; return `${g.name} now keeps your ${l.name}.`; } },
  send_cash: { note: "she sends extra money now; value is the amount, at most what the city can spare", run: (s, g, _p, v) => { const place = powerById(s, g.place); const cap = Math.round((place?.strength ?? 50) * 800 * (g.prosperity / 60)); const n = clamp(Math.round(Number(v) || cap / 2), 1000, Math.max(1000, cap)); s.arcology.cash += n; g.prosperity = clamp(g.prosperity - n / Math.max(4000, (place?.strength ?? 50) * 150), 0, 100); return `${g.name} sends ¤${n.toLocaleString()}.`; } },
  send_girls: { note: "she sends you women from her city; value is how many, 1 to 3", run: (s, g, p, v) => { const k = clamp(Math.round(Number(v) || 1), 1, 3); const names: string[] = []; for (let i = 0; i < k; i++) { const w = generatePerson({ seed: `gov:${g.place}:${s.arcology.week}:${i}:${g.talk.length}`, week: s.arcology.week, quality: clamp(0.3 + g.prosperity / 200, 0, 0.9) }); w.origin.acquired_how = `sent from ${g.name} by ${p.name}`; w.origin.acquired_week = s.arcology.week; w.economics.price_paid = 0; s.people[w.id] = w; s.memory[w.id] = newMemory(); refresh(w, s.memory[w.id]); names.push(w.name); } g.prosperity = clamp(g.prosperity - 2 * k, 0, 100); return `${names.join(" and ")} arrive from ${g.name}, sent by ${p.name}.`; } },
  crackdown: { note: "she clamps down on her city: more order, less prosperity", run: (_s, g) => { g.order = clamp(g.order + 15, 0, 100); g.prosperity = clamp(g.prosperity - 4, 0, 100); return `${g.name} is locked down. It's quiet.`; } },
  festival: { note: "she throws the city a festival: prosperity and goodwill, at a cost", run: (s, g) => { s.arcology.cash -= 6000; g.prosperity = clamp(g.prosperity + 5, 0, 100); g.order = clamp(g.order - 3, 0, 100); return `${g.name} has a festival in your name. ¤6,000.`; } },
  recall: { note: "she comes home and stops governing", run: (s, g) => recallGovernor(s, g.place) },
};

export interface GovLine { text: string; tone: "good" | "bad" | "neutral" | "warning"; person?: string }

/** Weekly. Her city moves by how good she is at it; the tribute moves with her city. */
export function tickGovernors(s: SaveState): { cash: number; lines: GovLine[] } {
  const lines: GovLine[] = [];
  for (const g of activeGovernors(s)) {
    const p = s.people[g.person];
    const place = powerById(s, g.place);
    if (!p || p.status !== "owned" || !place || place.rec.status === "free") {
      const why = !p || p.status === "dead" ? "she died" : p.status !== "owned" ? "she isn't yours any more" : "the city is gone";
      recallGovernor(s, g.place, why);
      lines.push({ text: `${g.name} has no governor now: ${why}.`, tone: "bad", person: g.person });
      continue;
    }
    const r = rng(`gov:${g.place}:${s.arcology.week}`);
    const c = competence(s, p);
    g.prosperity = clamp(g.prosperity + (c - 0.9) * 3 + r.normal(0, 1.2), 5, 100);
    // A cold governor keeps order; a warm one keeps people.
    g.order = clamp(g.order + (0.5 - p.persona.conscience) * 2 + (c - 0.9) * 2 + r.normal(0, 1), 5, 100);
    if (g.order < 20 && r.chance(0.3)) { g.prosperity = clamp(g.prosperity - 6, 0, 100); lines.push({ text: `There's rioting in ${g.name}. ${p.name} is dealing with it.`, tone: "warning", person: p.id }); }
    place.rec.pays = Math.round(place.strength * 140 * (0.5 + g.prosperity / 100) * (0.8 + c * 0.2));
    p.skills.management.governor = clamp((p.skills.management.governor ?? 0) + 2, 0, 100);
    shove(p.psyche, 0.3);
    if ((s.arcology.week - g.since) % 4 === 3) {
      applyTreatment(p, { kind: "recognition", size: 2, why: `still trusted with ${g.name}` }, s.arcology.week);
      if (!g.letters.some((l) => l.week >= s.arcology.week - 3)) {
        const mood = g.prosperity > 65 ? "is doing well" : g.prosperity < 35 ? "is struggling" : "is holding";
        lines.push({ text: `${g.name} ${mood} under ${p.name}: prosperity ${Math.round(g.prosperity)}, order ${Math.round(g.order)}, ¤${place.rec.pays.toLocaleString()} a week to you.`, tone: g.prosperity < 35 ? "warning" : "neutral", person: p.id });
      }
    }
    // She runs on how she is with you, like anyone.
    if (read(p).devotion < 0 && r.chance(0.1)) lines.push({ text: `${p.name}'s letters from ${g.name} have got short.`, tone: "warning", person: p.id });
  }
  return { cash: 0, lines };
}

/** Governed places on the map, for the screens. */
export function governedPlaces(s: SaveState): { g: Governorship; p?: Person; place?: PowerView }[] {
  const all = powers(s);
  return activeGovernors(s).map((g) => ({ g, p: s.people[g.person], place: all.find((x) => x.id === g.place) }));
}
