/**
 * LET HER GO — and she is still out there.
 *
 * Freeing a woman used to end her: she went onto a list headed "freed and gone" and the world
 * forgot her. Now she walks out of the penthouse into the city you built and makes a life in it. She
 * takes a job in one of your districts, she does well or badly by how that district is doing and
 * what your laws let a freed woman do, and how she feels about you is what you left her with. She
 * is off the People tab because she isn't yours, but she turns up: on walks through the district
 * she lives in, in the city's posts, and in events, coming back to thank you, to ask for help, to
 * offer what she has learned, or to make trouble.
 */
import type { Person, SaveState } from "./types";
import { cityOf } from "./city";
import { DISTRICTS } from "../data/districts";
import { read, applyTreatment, refresh } from "./obedience";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { startRumor } from "./social";
import { remember } from "./memory";
import { registerEvents, type EventDef } from "./events";

export type FreeHow = "papers" | "stake" | "cast_out";

export const FREE_HOW: Record<FreeHow, { label: string; note: string; cost: (s: SaveState) => number }> = {
  papers: { label: "Sign her papers", note: "She leaves free, with the clothes she's wearing.", cost: () => 0 },
  stake: { label: "Free her with a stake", note: "Papers, a flat and enough money to start something.", cost: (s) => Math.round(8000 + s.arcology.prosperity * 60) },
  cast_out: { label: "Turn her out", note: "Off the books and out the door, no papers to speak of. She'll remember how.", cost: () => 0 },
};

/** Her life now. */
export interface FreeLife {
  how: FreeHow;
  /** District kind she lives and works in. */
  district: string;
  job: string;
  /** −100 ruined … 100 thriving. */
  fortune: number;
  /** How she feels about you now. */
  stance: "devoted" | "grateful" | "indifferent" | "bitter";
  /** Last week she crossed your path, so she doesn't do it every week. */
  seen?: number;
}

const JOBS: Record<string, string[]> = {
  residential: ["cleans flats for families in the block", "minds other people's children", "runs a laundry out of her flat"],
  commercial: ["works the counter in a café", "sells clothes on the row", "keeps a market stall"],
  industrial: ["works a shift on the line at the works", "sorts salvage at the recycling plant"],
  civic: ["files papers at the registry", "works as a clerk for the court"],
  docks: ["checks manifests on the quay", "runs a food cart for the dockers"],
  academy: ["teaches at the academy", "cleans the halls at the academy"],
  barracks: ["cooks for the militia", "enlisted in the militia"],
  pleasure: ["dances at a club", "works in a brothel, for herself this time", "tends bar in the pleasure quarter"],
  arena: ["sells tickets at the arena", "fights in the arena for money"],
  clinic: ["works as a nurse at the clinic", "cleans the operating theatres"],
  garden: ["works the terraces in the sky garden"],
  temple: ["keeps the temple and lives on its charity"],
  exchange: ["runs errands for brokers on the exchange floor"],
  dairy: ["works the milking hall, on wages"],
  power: ["does maintenance shifts at the plant"],
  verge: ["lives rough on the verge and takes what work comes"],
};

/** Where in your city a freed woman can make a living, and what her old career fits best. */
function settle(s: SaveState, p: Person, how: FreeHow): { district: string; job: string } {
  const r = rng(`free:${p.id}:${s.arcology.week}`);
  const kinds = [...new Set(cityOf(s).districts.filter((d) => d.kind !== "vacant" && d.kind !== "spire" && d.level > 0).map((d) => d.kind))];
  if (how === "cast_out" || !kinds.length) return { district: "verge", job: r.pick(JOBS.verge) };
  const career = p.origin.career.toLowerCase();
  const fits = kinds.find((k) => (
    (k === "clinic" && /nurse|doctor|medic/.test(career)) || (k === "academy" && /teach|student|professor/.test(career)) ||
    (k === "pleasure" && /dancer|escort|prostitute|stripper|model/.test(career)) || (k === "barracks" && /soldier|police|guard/.test(career)) ||
    (k === "commercial" && /shop|sales|clerk|cashier|waitress/.test(career)) || (k === "exchange" && /bank|account|finance/.test(career))));
  const district = fits ?? r.pick(kinds);
  return { district, job: r.pick(JOBS[district] ?? JOBS.residential) };
}

export function lifeOf(p: Person): FreeLife | undefined { return p.free_life; }

/** Free her. Returns a line for the screen, or why not. */
export function freeHer(s: SaveState, id: string, how: FreeHow): { ok: boolean; line: string } {
  const p = s.people[id];
  if (!p || (p.status !== "owned" && p.status !== "indentured")) return { ok: false, line: "She isn't yours to free." };
  const cost = FREE_HOW[how].cost(s);
  if (s.arcology.cash < cost) return { ok: false, line: `That costs ¤${cost.toLocaleString()}, which you don't have.` };
  s.arcology.cash -= cost;
  const r = read(p, s.memory[p.id]);
  const home = settle(s, p, how);
  const stance: FreeLife["stance"] = how === "cast_out" ? (r.devotion > 60 ? "devoted" : "bitter")
    : r.devotion > 55 ? "devoted" : r.devotion > 10 || how === "stake" ? "grateful" : p.bond.resentment > 50 ? "bitter" : "indifferent";
  p.status = "free";
  p.exit_week = s.arcology.week;
  p.exit_note = how === "cast_out" ? "turned out" : how === "stake" ? "freed with a stake" : "freed";
  p.assignment = "rest";
  delete p.facility;
  p.free_life = { how, district: home.district, job: home.job, fortune: how === "stake" ? 35 : how === "cast_out" ? -40 : 0, stance };
  const mem = s.memory[p.id];
  if (mem) remember(mem, { content: how === "cast_out" ? "the owner turned me out of the arcology with nothing" : how === "stake" ? "the owner freed me and gave me money to start again" : "the owner signed my papers and let me go", week: s.arcology.week, importance: 10, charge: how === "cast_out" ? "sharp" : "bright", core: true });

  // The household watches it happen, and reads it as the thing they'd most like to be true.
  for (const h of Object.values(s.people).filter((x) => x.id !== p.id && (x.status === "owned" || x.status === "indentured"))) {
    if (how === "cast_out") applyTreatment(h, { kind: "cruelty", size: 2, why: `${p.name} was turned out` }, s.arcology.week);
    else { applyTreatment(h, { kind: "promise_kept", size: 2, why: `${p.name} was freed` }, s.arcology.week); h.bond.hope = clamp(h.bond.hope + 6, 0, 100); }
    refresh(h, s.memory[h.id]);
  }
  if (how !== "cast_out") {
    s.arcology.rep += how === "stake" ? 250 : 120;
    const pat = s.arcology.doctrines["paternalist" as keyof typeof s.arcology.doctrines];
    if (pat) pat.adoption = clamp(pat.adoption + 2, 0, 100);
  }
  startRumor(s, how === "cast_out" ? `the owner threw ${p.name} out with nothing` : `the owner freed ${p.name}`, { about: p.id, salience: 6 });
  const where = DISTRICTS.find((d) => d.kind === home.district)?.name ?? "the verge";
  return { ok: true, line: how === "cast_out"
    ? `${p.name} is walked to the lifts with nothing. She ends up on the verge, and she ${home.job.replace(/^lives rough on the verge and /, "")}.`
    : `${p.name} is free. She finds a room in the ${where.toLowerCase()} and ${home.job}.` };
}

/** Freed women still living in your city. */
export function freedInCity(s: SaveState): Person[] {
  return Object.values(s.people).filter((p) => p.status === "free" && p.free_life && p.age >= 18);
}

/** Who lives in a district, for walks and the city picture. */
export function freedIn(s: SaveState, district: string): Person[] {
  return freedInCity(s).filter((p) => p.free_life!.district === district);
}

export function fortuneWord(f: number): string {
  return f > 50 ? "doing well" : f > 15 ? "getting by comfortably" : f > -15 ? "getting by" : f > -50 ? "struggling" : "in a bad way";
}

/** One line, for prompts and the freed list. */
export function freeLine(s: SaveState, p: Person): string {
  const l = p.free_life;
  if (!l) return `${p.name} is free, and nobody knows where she is.`;
  const where = l.district === "verge" ? "the verge" : `the ${(DISTRICTS.find((d) => d.kind === l.district)?.name ?? l.district).toLowerCase()}`;
  return `${p.name} was freed in week ${p.exit_week}. She lives in ${where} and ${l.job}, she's ${fortuneWord(l.fortune)}, and toward the owner she is ${l.stance}.`;
}

/** Weekly: how she's doing out there. Returns lines for the report. */
export function tickFreed(s: SaveState): string[] {
  const out: string[] = [];
  const city = cityOf(s);
  for (const p of freedInCity(s)) {
    const l = p.free_life!;
    const r = rng(`freed:${p.id}:${s.arcology.week}`);
    const same = city.districts.filter((d) => d.kind === l.district);
    const condition = same.length ? same.reduce((n, d) => n + d.condition, 0) / same.length : 25;
    const drift = (condition - 50) / 25 + (s.arcology.prosperity - 60) / 40 - s.arcology.crime / 50 + r.normal(0, 3);
    const before = l.fortune;
    l.fortune = clamp(l.fortune + drift, -100, 100);
    // Time softens most things, one way or the other.
    if (l.stance === "indifferent" && l.fortune > 50 && r.chance(0.05)) l.stance = "grateful";
    if (l.stance === "grateful" && l.fortune < -60 && r.chance(0.05)) l.stance = "bitter";
    if (before > -50 && l.fortune <= -50) out.push(`${p.name}, who you freed, has fallen on hard times in the ${l.district === "verge" ? "verge" : l.district}.`);
    if (before < 50 && l.fortune >= 50) out.push(`${p.name}, who you freed, is doing well for herself. She ${l.job}.`);
  }
  return out;
}

/** For walks: the people you used to own who live where you are walking. */
export function freedWalkLine(s: SaveState, placeId: string): string {
  const here = freedIn(s, placeId === "concourse" ? "commercial" : placeId);
  if (!here.length) return "";
  return `## WOMEN YOU USED TO OWN, WHO LIVE HERE NOW\nThey're free now. One of them may cross the owner's path, and if she does, she acts on how she feels about the owner.\n${here.slice(0, 3).map((p) => `· ${freeLine(s, p)}`).join("\n")}`;
}

/* ── when she comes back into your life ───────────────────────────────────────────────────────── */

const freed = (s: SaveState, f: (l: FreeLife, p: Person) => boolean) =>
  freedInCity(s).filter((p) => s.arcology.week - (p.exit_week ?? 0) >= 2 && f(p.free_life!, p) && s.arcology.week - (p.free_life!.seen ?? -99) >= 8);

const seen = (s: SaveState, p?: Person) => { if (p?.free_life) p.free_life.seen = s.arcology.week; };
/** Her life, or a stand-in when the event is resolved without one (a test, an old save). */
const lifeOrNew = (p?: Person): FreeLife => p?.free_life ?? { how: "papers", district: "residential", job: "", fortune: 0, stance: "indifferent" };

export const FREED_EVENTS: EventDef[] = [
  {
    id: "freed_thanks", severity: "minor", endogenous: true,
    candidates: (s) => freed(s, (l) => (l.stance === "devoted" || l.stance === "grateful") && l.fortune > 10).map((person) => ({ person })),
    weight: () => 3,
    seed: (s, c) => `${c.person!.name} is waiting in the lobby of the spire, dressed better than you ever saw her dressed. She ${c.person!.free_life!.job} now, and she's done well enough to come and say so.\n\nShe brought something for you, wrapped in paper.`,
    options: [
      { id: "see", label: "See her, and let her thank you", resolve: (s, _e, p) => { seen(s, p); s.arcology.rep += 80; startRumor(s, `${p!.name}, who the owner freed, came back to thank them`, { about: p!.id, salience: 6, charge: 1 }); return `She thanks you properly, standing, looking you in the eye. The gift is a bottle from the place she works. The doorman tells the story all week.`; } },
      { id: "invite", label: "Invite her upstairs", resolve: (s, _e, p) => { seen(s, p); lifeOrNew(p).stance = "devoted"; return `She comes up. She sits in the chair she used to kneel beside, and laughs at herself for noticing. She stays longer than either of you meant.`; } },
      { id: "decline", label: "Have the doorman send her away", resolve: (s, _e, p) => { seen(s, p); lifeOrNew(p).stance = "indifferent"; return `The doorman takes the gift and sends her off. She doesn't come back.`; } },
    ],
  },
  {
    id: "freed_trouble", severity: "notable", endogenous: true,
    candidates: (s) => freed(s, (l) => l.fortune < -35 && l.stance !== "bitter").map((person) => ({ person })),
    weight: (_s, c) => 2 + Math.abs(c.person!.free_life!.fortune) / 30,
    seed: (s, c) => `A message from ${c.person!.name}, who you freed. She's behind on everything, she owes money to people who don't wait, and she ${c.person!.free_life!.job} for less than it costs to live.\n\n"I'm not asking to come back," she writes. "I'm asking for help. You're the only person I know with any."`,
    options: [
      { id: "pay", label: "Clear her debts", note: "¤6,000", resolve: (s, _e, p) => { seen(s, p); s.arcology.cash -= 6000; const l = lifeOrNew(p); l.fortune = clamp(l.fortune + 55, -100, 100); l.stance = "devoted"; return `You have her debts paid off quietly. She doesn't write again for a while, and then she writes to say she's all right now, and that she won't forget it.`; } },
      { id: "back", label: "Offer to take her back", resolve: (s, _e, p) => { seen(s, p); const back = lifeOrNew(p).stance === "devoted" || lifeOrNew(p).fortune < -70; if (!back) return `She reads the offer and doesn't answer it. A week later she's moved somewhere you don't have the address of.`; p!.status = "owned"; delete p!.exit_week; p!.exit_note = undefined; delete p!.free_life; return `She comes back. She hands over her papers at the door herself, and doesn't look at them as they go into the drawer.`; } },
      { id: "ignore", label: "Don't answer", resolve: (s, _e, p) => { seen(s, p); const l = lifeOrNew(p); l.stance = "bitter"; l.fortune = clamp(l.fortune - 15, -100, 100); return `You don't answer. She writes twice more, shorter each time, and then she stops writing.`; } },
    ],
  },
  {
    id: "freed_agitator", severity: "notable", endogenous: false,
    candidates: (s) => freed(s, (l) => l.stance === "bitter").map((person) => ({ person })),
    weight: (s) => 1.5 + s.arcology.crime / 30,
    seed: (s, c) => `Your security chief has a file on ${c.person!.name}. Since you ${c.person!.free_life!.how === "cast_out" ? "turned her out" : "freed her"}, she's been talking in the bars of the ${c.person!.free_life!.district === "verge" ? "verge" : c.person!.free_life!.district}, to your slaves on their errands, to anyone who'll listen. What she says about you is specific and mostly true, and people are starting to repeat it.`,
    options: [
      { id: "buy", label: "Pay her to stop", note: "¤10,000", resolve: (s, _e, p) => { seen(s, p); s.arcology.cash -= 10000; const l = lifeOrNew(p); l.fortune = clamp(l.fortune + 40, -100, 100); l.stance = "indifferent"; return `She takes the money. She doesn't thank you, and she doesn't talk about you any more.`; } },
      { id: "exile", label: "Have her removed from the arcology", resolve: (s, _e, p) => { seen(s, p); s.arcology.rep -= 150; delete p!.free_life; p!.exit_note = "exiled from the arcology"; startRumor(s, `the owner had ${p!.name} thrown out of the city for talking`, { salience: 8 }); return `Security walks her to the border with a bag. The story of it goes round faster than anything she was saying.`; } },
      { id: "let", label: "Let her talk", resolve: (s, _e, p) => { seen(s, p); s.arcology.crime = clamp(s.arcology.crime + 4, 0, 100); for (const h of Object.values(s.people).filter((x) => x.status === "owned")) h.bond.resentment = clamp(h.bond.resentment + 3, 0, 100); return `You let her talk. Your slaves hear it on their errands, and it shows in how they look at you.`; } },
    ],
  },
  {
    id: "freed_informant", severity: "minor", endogenous: false,
    candidates: (s) => freed(s, (l) => l.stance === "devoted" && ["docks", "exchange", "pleasure", "civic", "commercial"].includes(l.district)).map((person) => ({ person })),
    weight: () => 2,
    seed: (s, c) => `${c.person!.name} asks to see you, privately. Where she works now, people talk in front of her the way they never would in front of you, and she has heard something she thinks you should know. Someone in the ${c.person!.free_life!.district} is skimming from you, and she knows who.`,
    options: [
      { id: "act", label: "Act on it", resolve: (s, _e, p) => { seen(s, p); const n = 4000 + Math.round(s.arcology.prosperity * 40); s.arcology.cash += n; s.arcology.crime = clamp(s.arcology.crime - 3, 0, 100); return `She was right. You get back ¤${n.toLocaleString()}, and the people who took it are made an example of.`; } },
      { id: "keep", label: "Keep her on as your ears", note: "¤1,000 a month to her", resolve: (s, _e, p) => { seen(s, p); s.arcology.cash -= 1000; s.arcology.security = clamp(s.arcology.security + 4, 0, 100); return `She becomes one of the people who tell you things. It's worth more than you pay her.`; } },
    ],
  },
];
registerEvents(FREED_EVENTS);
