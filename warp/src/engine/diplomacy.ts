/**
 * TALKING TO THE OTHER POWERS — who runs them, and what they can actually be made to agree to.
 *
 * Every power on the map has a ruler: a name, a manner, something they want and something they're
 * afraid of, rolled once per run and kept. You talk to them in your own words (engine/talk), and a
 * model plays them. What it cannot do is invent a deal. Every term the engine knows is in TERMS
 * below, each with the condition under which a ruler in this position would sign it; the model is
 * handed the ones open THIS week, with their limits, and anything it records outside that list is
 * dropped. So a ruler can be charmed, bullied, bribed or insulted in any words you like, and still
 * only gives up what your strength, their opinion of you and your money can actually get.
 */
import type { SaveState } from "./types";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { NATIONS } from "../data/people";
import { empireOf, forces, powerById, shift, note, type PowerView } from "./power";
import { lawsOf } from "./court";
import { LAW_BY_ID } from "../data/laws";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { generatePerson } from "./generate";
import { newMemory } from "./memory";
import { refresh } from "./obedience";
import { startRumor } from "./social";
import { chronicle } from "./chronicle";
import { activeWars, suePeace } from "./war";

export interface Ruler {
  name: string;
  title: string;
  sex: "woman" | "man";
  age: number;
  manner: string;
  wants: string;
  fears: string;
  vice: string;
}

export interface TalkLine { role: "you" | "them"; text: string; week: number }
export interface Talk { log: TalkLine[]; used?: { week: number; n: number; warmth: number } }
export interface DiplomacyState { rulers: Record<string, Ruler>; talks: Record<string, Talk> }

export function diplomacyOf(s: SaveState): DiplomacyState {
  const d = (s.diplomacy ??= { rulers: {}, talks: {} });
  d.rulers ??= {}; d.talks ??= {};
  return d;
}

const MANNERS = [
  "smooth and patient, never says no outright", "blunt to the point of rudeness", "flirts with everyone, means none of it",
  "cold and exact, talks in numbers", "loud, jovial, and much sharper than he lets on", "pious and disapproving",
  "paranoid, assumes every offer is a trap", "bored by everything except money", "vain, wants to be flattered",
  "an old soldier who respects force and nothing else", "a former trader who haggles over everything", "young, nervous, and trying hard not to show it",
];
const WANTS = [
  "money, as much as can be had", "to be treated as your equal in public", "safety from a stronger neighbour",
  "your best slaves", "a seat at the table when the Free Cities decide anything", "trade through your docks",
  "to see your laws fail", "a marriage of interests", "revenge on someone who wronged them", "to be left alone",
];
const FEARS = [
  "being invaded", "a slave revolt at home", "looking weak in front of their own people", "running out of money",
  "the Old World armies", "assassins", "being laughed at", "losing their trade",
];
const VICES = ["drinks", "gambles", "keeps too many slaves for one person", "can be bought", "can't resist a challenge", "holds grudges for years", "talks too much when flattered", "none that anyone has found"];
const TITLES: Record<string, string[]> = {
  neighbour: ["owner of", "master of", "mistress of"],
  freecity: ["first citizen of", "chairman of", "the hand that runs"],
  region: ["president of", "the general who runs", "prime minister of"],
};

export function rulerOf(s: SaveState, p: PowerView): Ruler {
  const d = diplomacyOf(s);
  if (d.rulers[p.id]) return d.rulers[p.id];
  const r = rng(`${s.id}:ruler:${p.id}`);
  const nation = r.weighted(NATIONS, (n) => n.weight);
  const sex = r.chance(0.4) ? "woman" : "man";
  const first = r.pick(sex === "woman" ? nation.female : nation.male);
  const name = `${first} ${r.pick(nation.surnames)}`;
  const kind = TITLES[p.kind] ?? TITLES.neighbour;
  let title = r.pick(kind);
  if (title === "master of" && sex === "woman") title = "mistress of";
  if (title === "mistress of" && sex === "man") title = "master of";
  let manner = r.pick(MANNERS);
  if (sex === "woman") manner = manner.replace(/\bhe\b/g, "she");
  const ruler: Ruler = { name, title: `${title} ${p.name}`, sex, age: r.int(32, 68), manner, wants: r.pick(WANTS), fears: r.pick(FEARS), vice: r.pick(VICES) };
  d.rulers[p.id] = ruler;
  return ruler;
}

export function talkOf(s: SaveState, id: string): Talk {
  const d = diplomacyOf(s);
  return (d.talks[id] ??= { log: [] });
}

/** How many times you can speak to one power in a week, and how far it can move them. */
export const TALK_PER_WEEK = 8;
export const WARMTH_PER_WEEK = 15;

export function talkLeft(s: SaveState, id: string): number {
  const u = talkOf(s, id).used;
  return u && u.week === s.arcology.week ? Math.max(0, TALK_PER_WEEK - u.n) : TALK_PER_WEEK;
}

/* ── the terms ───────────────────────────────────────────────────────────────────────────────── */

export interface Term {
  label: string;
  /** What the value means, for the model. */
  value: string;
  /** Null when they would sign it now; otherwise what stands in the way. */
  open: (s: SaveState, p: PowerView, lev: number) => string | null;
  /** The most they'd give or take, for terms with an amount. */
  cap?: (s: SaveState, p: PowerView, lev: number) => number;
  apply: (s: SaveState, p: PowerView, value: string | number | undefined, detail: string, lev: number) => string;
}

/** Your strength over theirs. */
export function leverage(s: SaveState, p: PowerView): number {
  return forces(s).total / Math.max(5, p.strength);
}

const yourLawIds = (s: SaveState) => lawsOf(s).map((x) => x.id).filter((id) => LAW_BY_ID[id]);
const friendly = (p: PowerView, n: number) => p.attitude >= n;
const tied = (p: PowerView) => p.rec.status === "vassal" || p.rec.status === "conquered" || p.rec.status === "allied";

export const TERMS: Record<string, Term> = {
  pay_you: {
    label: "they pay you a sum now", value: "the amount in ¤",
    open: (_s, p, lev) => (lev >= 1.5 || friendly(p, 55) || tied(p) ? null : "they owe you nothing and don't fear you"),
    cap: (_s, p, lev) => Math.round(p.strength * (tied(p) ? 900 : 500) * clamp(lev / 2, 0.3, 2)),
    apply: (s, p, v, _d, lev) => { const cap = TERMS.pay_you.cap!(s, p, lev); const n = clamp(Math.round(Number(v) || cap / 2), 500, cap); s.arcology.cash += n; if (!friendly(p, 55)) shift(s, p.id, -Math.round(n / Math.max(1000, cap) * 10)); return `${p.name} pays you ¤${n.toLocaleString()}.`; },
  },
  you_pay: {
    label: "you pay them a sum now (to buy goodwill or seal something)", value: "the amount in ¤",
    open: (s) => (s.arcology.cash > 1000 ? null : "you don't have the money"),
    cap: (s) => Math.max(0, Math.round(s.arcology.cash)),
    apply: (s, p, v) => { const n = clamp(Math.round(Number(v) || 5000), 500, Math.max(500, Math.round(s.arcology.cash))); s.arcology.cash -= n; const by = clamp(Math.round(n / Math.max(400, p.strength * 120)), 1, 20); shift(s, p.id, by); return `You pay ${p.name} ¤${n.toLocaleString()}. They like you better for it (+${by}).`; },
  },
  pact: {
    label: "a trade pact: money both ways every week", value: "nothing",
    open: (_s, p) => (p.rec.pact ? "you already have one" : p.attitude >= 15 || tied(p) ? null : "they need to like you more (15+)"),
    apply: (s, p) => { p.rec.pact = true; shift(s, p.id, 4); return `A trade pact with ${p.name}.`; },
  },
  alliance: {
    label: "an alliance: their forces fight beside yours", value: "nothing",
    open: (_s, p) => (p.rec.status === "allied" ? "already allied" : p.rec.status !== "free" ? "they already answer to you" : !p.rec.pact ? "needs a trade pact first" : p.attitude < 45 ? "they need to be close to you (45+)" : null),
    apply: (s, p) => { p.rec.status = "allied"; p.rec.since = s.arcology.week; shift(s, p.id, 8); startRumor(s, `${s.arcology.name} and ${p.name} are allies now`, { salience: 7 }); return `${p.name} is your ally.`; },
  },
  adopt_law: {
    label: "they make one of your laws a law in their city too", value: "the law's id, from YOUR LAWS",
    open: (s, p, lev) => (!yourLawIds(s).length ? "you have no laws to give them" : friendly(p, 30) || lev >= 1.5 || tied(p) ? null : "they need to like you (30+) or fear you (half again their strength)"),
    apply: (s, p, v, _d, lev) => { const id = String(v); const l = LAW_BY_ID[id]; if (!l || !yourLawIds(s).includes(id)) return ""; p.rec.laws = [...new Set([...(p.rec.laws ?? []), id])]; s.arcology.rep += 200; if (!friendly(p, 30) && lev >= 1.5) { shift(s, p.id, -6); p.rec.grudge = clamp(p.rec.grudge + 5, 0, 100); } startRumor(s, `${p.name} has adopted the owner's ${l.name}`, { salience: 7, charge: 1 }); return `${p.name} adopts your ${l.name}: "${l.text}"`; },
  },
  adopt_doctrine: {
    label: "they take up one of your arcology's beliefs", value: "the doctrine id, from YOUR DOCTRINES",
    open: (s, p, lev) => (!Object.keys(s.arcology.doctrines).length ? "your city has no doctrine yet" : friendly(p, 40) || lev >= 2 || tied(p) ? null : "they need to like you (40+) or fear you (twice their strength)"),
    apply: (s, p, v) => { const id = String(v); if (!DOCTRINE_BY_ID[id] || !s.arcology.doctrines[id]) return ""; p.rec.doctrines_added = [...new Set([...(p.rec.doctrines_added ?? []), id])]; const n = s.arcology.neighbours.find((x) => x.id === p.id); if (n && !n.doctrines.includes(id)) n.doctrines = [...n.doctrines.slice(-2), id]; s.arcology.rep += 150; return `${p.name} takes up ${DOCTRINE_BY_ID[id].noun}.`; },
  },
  girls: {
    label: "they send you women from their city", value: "how many, 1 to 3; put what kind in detail",
    open: (_s, p, lev) => (friendly(p, 40) || lev >= 2 || tied(p) ? null : "they need to like you (40+) or fear you (twice their strength)"),
    apply: (s, p, v, detail) => { const k = clamp(Math.round(Number(v) || 1), 1, 3); const names: string[] = []; const nation = NATIONS.find((n) => detail.toLowerCase().includes(n.name.toLowerCase()))?.name; for (let i = 0; i < k; i++) { const w = generatePerson({ seed: `dip:${p.id}:${s.arcology.week}:${i}:${talkOf(s, p.id).log.length}`, week: s.arcology.week, quality: 0.65, nation }); w.origin.acquired_how = `sent by ${p.name}${detail ? ` (${detail.slice(0, 80)})` : ""}`; w.origin.acquired_week = s.arcology.week; w.economics.price_paid = 0; s.people[w.id] = w; s.memory[w.id] = newMemory(); refresh(w, s.memory[w.id]); names.push(w.name); } if (!friendly(p, 40)) shift(s, p.id, -4 * k); return `${p.name} sends ${names.join(" and ")}.`; },
  },
  stake: {
    label: "they sell you a share of their arcology", value: "percentage points, at most 15",
    open: (_s, p, lev) => (p.kind !== "neighbour" ? "only a neighbouring arcology sells shares" : (p.owned ?? 0) >= 100 ? "you own all of it" : friendly(p, 20) || lev >= 1.5 ? null : "they need to like you (20+) or fear you"),
    apply: (s, p, v) => { const n = s.arcology.neighbours.find((x) => x.id === p.id); if (!n) return ""; const pts = clamp(Math.round(Number(v) || 5), 1, Math.min(15, 100 - n.ownership)); const price = Math.round(pts * n.prosperity * 90); if (s.arcology.cash < price) return `A ${pts}% stake would cost ¤${price.toLocaleString()}, which you don't have.`; s.arcology.cash -= price; n.ownership = clamp(n.ownership + pts, 0, 100); return `You buy ${pts}% of ${p.name} for ¤${price.toLocaleString()}. You hold ${Math.round(n.ownership)}% now.`; },
  },
  stop_scheme: {
    label: "they call off whatever they're doing against you", value: "nothing",
    open: (_s, p, lev) => (friendly(p, 0) || lev >= 1.5 ? null : "they hate you and don't fear you"),
    apply: (s, p) => { const n = s.arcology.neighbours.find((x) => x.id === p.id); if (n) n.scheme = undefined; p.rec.last_them = s.arcology.week + 4; return `${p.name} calls off its people.`; },
  },
  truce: {
    label: "a non-aggression promise for three months", value: "nothing",
    open: (_s, p, lev) => (friendly(p, -30) || lev >= 1.2 ? null : "they hate you too much"),
    apply: (s, p) => { p.rec.last_them = s.arcology.week + 8; return `${p.name} promises to leave you alone for three months.`; },
  },
  peace: {
    label: "peace, ending the war between you", value: "nothing",
    open: (s, p) => (activeWars(s).some((w) => w.target === p.id) ? null : "you aren't at war"),
    apply: (s, p) => { const w = activeWars(s).find((x) => x.target === p.id); return w ? suePeace(s, w.id) : ""; },
  },
  tribute: {
    label: "they become your vassal and pay you every week", value: "nothing",
    open: (_s, p, lev) => (tied(p) && p.rec.status !== "allied" ? "they already answer to you" : lev >= 2 || (friendly(p, 70) && lev >= 1) ? null : "needs twice their strength, or them devoted to you and you at least as strong"),
    apply: (s, p) => { p.rec.status = "vassal"; p.rec.since = s.arcology.week; p.rec.pays = Math.round(p.strength * 120); return `${p.name} agrees to pay you ¤${p.rec.pays.toLocaleString()} a week and answer to you.`; },
  },
  submit: {
    label: "they submit to you completely: their city is yours to run (you can then put one of your women in charge of it)", value: "nothing",
    open: (_s, p, lev) => (p.rec.status === "conquered" ? "it's already yours" : lev >= 3 || (friendly(p, 85) && lev >= 1.5) ? null : "needs three times their strength, or them devoted to you and you much the stronger"),
    apply: (s, p) => { p.rec.status = "vassal"; p.rec.since = s.arcology.week; p.rec.pays = Math.round(p.strength * 160); p.rec.grudge = clamp(p.rec.grudge + 10, 0, 100); startRumor(s, `${p.name} has submitted to the owner`, { salience: 9 }); return `${p.name} submits. It's yours to run. Put someone in charge of it from the War Room.`; },
  },
};

/** Every term, open or not, with what stands in the way. */
export function termsFor(s: SaveState, p: PowerView): { id: string; term: Term; why: string | null; cap?: number }[] {
  const lev = leverage(s, p);
  return Object.entries(TERMS).map(([id, term]) => ({ id, term, why: term.open(s, p, lev), cap: term.cap?.(s, p, lev) }));
}

/** Apply one agreed term, if it is open. Returns the line, or "" if it wasn't really on the table. */
export function applyTerm(s: SaveState, id: string, termId: string, value: string | number | undefined, detail = ""): string {
  const p = powerById(s, id);
  const term = TERMS[termId];
  if (!p || !term) return "";
  const lev = leverage(s, p);
  if (term.open(s, p, lev)) return "";
  const line = term.apply(s, p, value, detail, lev);
  if (line) {
    note(s, line);
    chronicle(s, { keys: [`place:${id}`], title: "a deal", text: `${line}${detail ? ` (${detail.slice(0, 120)})` : ""}` });
  }
  return line;
}

/** Everything a prompt needs about this power, in words. */
export function powerBrief(s: SaveState, p: PowerView): string {
  const ruler = rulerOf(s, p);
  const lev = leverage(s, p);
  const rel = lev >= 3 ? "The player could crush them and everyone knows it." : lev >= 2 ? "The player is much stronger than them." : lev >= 1.2 ? "The player is stronger than them." : lev >= 0.8 ? "They and the player are about evenly matched." : lev >= 0.5 ? "They are stronger than the player." : "They are far stronger than the player and could crush them.";
  const war = activeWars(s).find((w) => w.target === p.id);
  const e = empireOf(s);
  const theirLog = e.log.filter((l) => l.text.includes(p.name)).slice(-4).map((l) => `week ${l.week}: ${l.text}`);
  return [
    `${p.name.toUpperCase()}: ${p.kind === "neighbour" ? "a neighbouring arcology" : p.kind === "freecity" ? "a Free City" : "an Old World state"}, ${p.km.toLocaleString()} km away. ${p.lines.filter(Boolean).join(" ")}`,
    `ITS RULER: ${ruler.name}, ${ruler.title}, a ${ruler.age}-year-old ${ruler.sex}. Manner: ${ruler.manner}. Wants ${ruler.wants}. Afraid of ${ruler.fears}. Vice: ${ruler.vice}.`,
    `STRENGTH: theirs ${p.strength}, the player's ${forces(s).total}. ${rel}`,
    `OPINION OF THE PLAYER: ${p.attitude} out of ±100. Grudge ${Math.round(p.rec.grudge)}. Status: ${p.rec.status}${p.rec.pact ? ", trade pact" : ""}${war ? `, AT WAR (front ${war.front}, positive means the player is winning)` : ""}.`,
    p.rec.laws?.length ? `They already keep these of the player's laws: ${p.rec.laws.map((id) => LAW_BY_ID[id]?.name).filter(Boolean).join(", ")}.` : "",
    p.rec.governor && s.people[p.rec.governor] ? `It is governed for the player by ${s.people[p.rec.governor].name}, one of the player's slaves.` : "",
    theirLog.length ? `RECENT DEALINGS: ${theirLog.join(" | ")}` : "",
  ].filter(Boolean).join("\n");
}
