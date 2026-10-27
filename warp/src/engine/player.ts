/**
 * YOU, AS THEY SEE YOU.
 *
 * The owner has never been a character in this genre's engines — a wallet with a name on it, and a
 * set of stats that gate menu options. But every person in the household is keeping a private model
 * of you (that is what `bond` and the edges ARE), and the aggregate of those models is a fact about
 * you that you cannot see and everybody else can.
 *
 * So it is computed and shown. Not as a score: as the sentence your household would say about you
 * if you were not in the room.
 */
import type { SaveState } from "./types";
import { read } from "./obedience";
import { clamp } from "./psyche";

export interface HouseholdRead {
  feared: number;      // 0–100
  trusted: number;     // 0–100
  label: string;
  lines: string[];
}

export function householdRead(s: SaveState): HouseholdRead {
  const household = Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");
  if (!household.length) return { feared: 0, trusted: 0, label: "nobody in particular", lines: ["You don't own anyone yet."] };

  let fear = 0, trust = 0, hope = 0, resent = 0, fragility = 0;
  for (const p of household) {
    const r = read(p, s.memory[p.id]);
    fear += p.bond.fear;
    trust += Math.max(0, r.trust);
    hope += p.bond.hope;
    resent += p.bond.resentment;
    fragility += r.fragility;
  }
  const n = household.length;
  const feared = clamp(fear / n, 0, 100);
  const trusted = clamp(trust / n, 0, 100);
  const frag = fragility / n;

  const label =
    feared > 60 && trusted < 25 ? "someone to be careful around" :
    trusted > 55 && feared < 25 ? "worth staying for" :
    feared > 45 && trusted > 45 ? "impossible to read" :
    feared < 20 && trusted < 20 ? "hardly ever around" :
    "fair enough, as owners go";

  const lines: string[] = [];
  if (frag > 0.65) lines.push(`Your slaves obey mostly out of fear (${Math.round(frag * 100)}%). If you stop keeping it up, it'll be gone within a month.`);
  else if (frag < 0.3) lines.push(`Most of your slaves are genuinely attached to you, which holds up when you're away or have a bad month.`);
  if (resent / n > 50) lines.push(`Your slaves resent you a lot. Sooner or later one of them will act on it.`);
  if (hope / n < 15) lines.push(`Your slaves have lost hope. Promises mean nothing to them until you keep one.`);
  else if (hope / n > 55) lines.push(`Your slaves are hopeful, and they work harder for it.`);
  const broken = household.filter((p) => p.psyche.state !== "intact").length;
  if (broken) lines.push(`${broken} of them ${broken === 1 ? "is" : "are"} broken or close to it.`);
  if (!lines.length) lines.push(`Your slaves do their work without strong feelings about you either way.`);
  return { feared, trusted, label, lines };
}

/** The player's own skills, and what raises them. Kept small: five numbers, each of which does one
 *  legible thing, rather than the twelve the old game had and the two that mattered. */
export const PLAYER_SKILLS: { id: string; name: string; does: string }[] = [
  { id: "trading", name: "Trading", does: "better prices in the markets, and more found on an inspection" },
  { id: "slaving", name: "Slaving", does: "training goes faster, and you can judge slaves accurately on sight" },
  { id: "medicine", name: "Medicine", does: "procedures are safer and recovery is shorter" },
  { id: "engineering", name: "Engineering", does: "construction and upgrades cost less" },
  { id: "hacking", name: "Hacking", does: "you see the neighbours' schemes, and their cyber attacks and sabotage move slower" },
  { id: "command", name: "Command", does: "your forces fight harder, with every point adding half a percent to your military strength, in defence and at war" },
  { id: "diplomacy", name: "Diplomacy", does: "other powers warm to you each week, and your envoys, treaties and ultimatums land better" },
  // The four that work on people in the room: a slave on her knees, a ruler on the line, a crowd.
  { id: "charisma", name: "Charisma", does: "people open up to you and come round to you. A slave tells you the truth sooner, a ruler gives more in talks, and every scene writes you as someone people want to agree with" },
  { id: "seduction", name: "Seduction", does: "what you do in bed lands better. More of it is wanted and less of it is resented, and you find out what she's into sooner" },
  { id: "intimidation", name: "Intimidation", does: "people fear you without hating you as much. Punishment and cruelty leave less resentment, and in a scene people back down when you lean on them" },
  { id: "insight", name: "Insight", does: "you read people well. Her tastes, flaws and lies show sooner, a slave who's only afraid can't pass for loyal, and the scenes let you notice what she's hiding" },
];

/** A skill the player wrote for themselves. It has a number like any other, it grows by being
 *  used, and every scene, event and saga is told what it is and how good the owner is at it. */
export interface CustomSkill { id: string; name: string; does: string }

/** Every skill the owner has: the built-in ones, then their own. */
export function allSkills(s: SaveState): { id: string; name: string; does: string; custom?: boolean }[] {
  return [...PLAYER_SKILLS, ...(s.player.custom_skills ?? []).map((c) => ({ ...c, custom: true }))];
}

/** Add one of your own. Starts where you say, up to 40: the rest is earned or paid for. */
export function addCustomSkill(s: SaveState, name: string, does: string, level = 20): CustomSkill | null {
  const n = name.trim().slice(0, 40), d = does.trim().slice(0, 300);
  if (!n || !d) return null;
  const id = `custom:${n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "skill"}`;
  const list = (s.player.custom_skills ??= []);
  if (list.some((c) => c.id === id) || PLAYER_SKILLS.some((x) => x.name.toLowerCase() === n.toLowerCase())) return null;
  const sk = { id, name: n, does: d };
  list.push(sk);
  s.player.skills[id] = clamp(level, 0, 40);
  return sk;
}

export function removeCustomSkill(s: SaveState, id: string): void {
  s.player.custom_skills = (s.player.custom_skills ?? []).filter((c) => c.id !== id);
  delete s.player.skills[id];
  if (s.player.training?.skill === id) delete s.player.training;
}

/** "masterful" … "hopeless": how a number reads to the narrator. */
export function skillWord(n: number): string {
  return n >= 85 ? "masterful" : n >= 65 ? "very good" : n >= 45 ? "good" : n >= 25 ? "fair" : n >= 10 ? "poor" : "hopeless";
}

const SOCIAL_SHOWS: Record<string, [string, string]> = {
  charisma: ["people want to agree with them, so they listen, laugh at the right moment and come round to the owner's way of seeing things more often than not", "they don't win people over, so a pitch falls flat and a plea gets a polite no"],
  seduction: ["they know exactly what they're doing with a body, so their touch, timing and words land, and partners want more", "they're clumsy in bed and misread what lands and what doesn't"],
  intimidation: ["people go quiet when they lean on them, a look is enough, and their threats are believed", "their threats don't frighten anyone much"],
  insight: ["they read people, noticing the lie, the flinch, and the thing she wants and won't say, and the scene shows them noticing", "they miss what people are hiding"],
};

/** WHAT THE OWNER IS GOOD AT, for every model call: the social skills read as how people respond to
 *  them, the rest as competence, and the owner's own skills by their own description. A skill
 *  that changed nothing in a scene would be one more lie told in the interface. */
export function skillsBrief(s: SaveState): string {
  const lines: string[] = [];
  for (const [id, [hi, lo]] of Object.entries(SOCIAL_SHOWS)) {
    const n = s.player.skills[id] ?? 0;
    const name = PLAYER_SKILLS.find((x) => x.id === id)!.name;
    if (n >= 40) lines.push(`Their ${name.toLowerCase()} is ${Math.round(n)} (${skillWord(n)}), so ${hi}.`);
    else if (n < 12 && s.player.skills[id] !== undefined) lines.push(`Their ${name.toLowerCase()} is ${Math.round(n)} (${skillWord(n)}), so ${lo}.`);
  }
  const other = PLAYER_SKILLS.filter((x) => !SOCIAL_SHOWS[x.id] && (s.player.skills[x.id] ?? 0) >= 50);
  if (other.length) lines.push(`They're also good at ${other.map((x) => `${x.name.toLowerCase()} (${Math.round(s.player.skills[x.id] ?? 0)})`).join(", ")}, and when it comes up, they know what they're doing.`);
  for (const c of s.player.custom_skills ?? []) {
    const n = s.player.skills[c.id] ?? 0;
    lines.push(`They have a skill of their own, ${c.name}, at ${Math.round(n)} out of 100 (${skillWord(n)}). In their words, "${c.does}" It's real in this world. When they use it, it works about as well as that number says, so at ${Math.round(n)} it ${n >= 65 ? "almost always works, and people who've seen it are wary of it" : n >= 40 ? "usually works, though not on everyone" : n >= 20 ? "works sometimes, unreliably, and takes effort" : "rarely works yet"}.`);
  }
  if (!lines.length) return "";
  return `WHAT THE OWNER IS GOOD AT. These skills run from 0 to 100. Let them decide how things go when the owner tries them, the way a die roll would.\n${lines.map((l) => `· ${l}`).join("\n")}`;
}

/** THE SKILLS, AND THE PLACES EACH OF THEM IS READ.
 *
 *  A skill listed on a screen with a sentence describing what it does, which nothing in the engine
 *  reads, is a lie told in the interface. Each of these is called from exactly one place, named in
 *  the comment, and each one also GROWS from the thing it affects — you get better at buying people
 *  by buying people, which is the only honest way for a number like this to move.
 */
export const skill = {
  /** market.ts — what you talk them down to, and what an hour of inspection turns up. */
  trading: (s: SaveState): number => clamp(1 - (s.player.skills.trading ?? 0) / 500, 0.8, 1),
  /** week.ts — how fast the household learns under you. */
  slaving: (s: SaveState): number => 1 + (s.player.skills.slaving ?? 0) / 300,
  /** views/Roster procedures — recovery weeks and the health toll of surgery. */
  medicine: (s: SaveState): number => clamp(1 - (s.player.skills.medicine ?? 0) / 250, 0.6, 1),
  /** views/Arcology — what construction and upgrades cost. */
  engineering: (s: SaveState): number => clamp(1 - (s.player.skills.engineering ?? 0) / 400, 0.75, 1),
  /** views/Arcology — whether you can see what a neighbour is actually running at you. */
  hacking: (s: SaveState): boolean => (s.player.skills.hacking ?? 0) >= 30,
  /** security.ts — how much slower their cyber attacks and sabotage come together. */
  counterIntel: (s: SaveState): number => clamp(1 - (s.player.skills.hacking ?? 0) / 160, 0.4, 1),
  /** city.ts militaryStrength, and engine/war — how much harder your forces fight under you. */
  command: (s: SaveState): number => 1 + (s.player.skills.command ?? 0) / 200,
  /** week.ts and engine/powers — the weekly warming, and how far an envoy moves them. */
  diplomacy: (s: SaveState): number => (s.player.skills.diplomacy ?? 0) / 100,
  /** encounter.ts talk, talk.ts — how much trust it takes before she tells you the truth, and how far a ruler bends. 0 … 1. */
  charisma: (s: SaveState): number => clamp((s.player.skills.charisma ?? 0) / 100, 0, 1),
  /** intimacy.ts resolveAct — added to how well an act lands, and how strong a taste must be to show. 0 … 1. */
  seduction: (s: SaveState): number => clamp((s.player.skills.seduction ?? 0) / 100, 0, 1),
  /** intimacy.ts resolveAct and encounter.ts — how much of the resentment a hard act would leave is taken off. 0 … 1. */
  intimidation: (s: SaveState): number => clamp((s.player.skills.intimidation ?? 0) / 100, 0, 1),
  /** intimacy.ts and encounter.ts — her quirks, flaws and tastes noticed without being stumbled on. 0 … 1. */
  insight: (s: SaveState): number => clamp((s.player.skills.insight ?? 0) / 100, 0, 1),
};

/* ── buying it ───────────────────────────────────────────────────────────────────────────────── */

/** Three ways to get better at something with money instead of years. */
export type Tier = "tutor" | "course" | "implant";
export const TIERS: Record<Tier, { name: string; note: string; base: number; weeks: number; gain: number }> = {
  tutor: { name: "Private tutor", note: "The best in the world at it, flown in to teach you one to one. Some weeks of your evenings.", base: 15000, weeks: 3, gain: 8 },
  course: { name: "Intensive immersion", note: "A month away at a war college, a diplomatic academy or a lab, with people who don't know who you are.", base: 60000, weeks: 4, gain: 18 },
  implant: { name: "Neural augmentation", note: "A procedure most of the world can't buy. It's done in a day, and the knowledge is just there when you wake.", base: 300000, weeks: 0, gain: 25 },
};

/** What a tier costs you for a skill, at the level you're at: the last points are the dear ones. */
export function trainingCost(s: SaveState, id: string, tier: Tier): number {
  const now = s.player.skills[id] ?? 0;
  return Math.round(TIERS[tier].base * (1 + now / 40));
}

export function training(s: SaveState): { skill: string; tier: Tier; left: number; gain: number } | undefined {
  return s.player.training;
}

/** Pay for it. A tutor or course runs for weeks (one at a time); an implant is done now. */
export function buyTraining(s: SaveState, id: string, tier: Tier): { ok: boolean; line: string } {
  const sk = allSkills(s).find((x) => x.id === id);
  if (!sk) return { ok: false, line: "No such skill." };
  const now = s.player.skills[id] ?? 0;
  if (now >= 99) return { ok: false, line: `You're as good at ${sk.name.toLowerCase()} as anyone alive.` };
  if (TIERS[tier].weeks && s.player.training) return { ok: false, line: "You're already in the middle of one, so finish it first." };
  const cost = trainingCost(s, id, tier);
  if (s.arcology.cash < cost) return { ok: false, line: `That costs ¤${cost.toLocaleString()}.` };
  s.arcology.cash -= cost;
  const gain = TIERS[tier].gain;
  if (!TIERS[tier].weeks) {
    s.player.skills[id] = clamp(now + gain * (1 - now / 140), 0, 100);
    s.arcology.rep += 100;
    return { ok: true, line: `You go under for an afternoon. When you wake, ${sk.name.toLowerCase()} is simply there, as if you'd always known it. (${Math.round(now)} → ${Math.round(s.player.skills[id])})` };
  }
  s.player.training = { skill: id, tier, left: TIERS[tier].weeks, gain };
  return { ok: true, line: `${TIERS[tier].name} in ${sk.name.toLowerCase()}: ${TIERS[tier].weeks} weeks.` };
}

/** Weekly: a running course comes a week closer to done. */
export function tickTraining(s: SaveState): string[] {
  const t = s.player.training;
  if (!t) return [];
  const per = t.gain / TIERS[t.tier].weeks;
  const now = s.player.skills[t.skill] ?? 0;
  s.player.skills[t.skill] = clamp(now + per * (1 - now / 140), 0, 100);
  t.left--;
  if (t.left > 0) return [];
  delete s.player.training;
  const name = allSkills(s).find((x) => x.id === t.skill)?.name ?? t.skill;
  return [`Your ${TIERS[t.tier].name.toLowerCase()} in ${name.toLowerCase()} is finished. You're at ${Math.round(s.player.skills[t.skill])}.`];
}

/** WHAT YOU REACH FOR WHEN YOU TALK. A typed line that uses a skill by name, or in the obvious
 *  words for it, is practice at it: the owner who keeps trying to hypnotise people gets better at
 *  hypnosis. Returns the names of the skills it counted, for whoever wants to say so. */
const SOCIAL_WORDS: Record<string, RegExp> = {
  charisma: /\b(persuade|convince|charm|reason with|win (her|him|them) over|talk (her|him|them) (into|round))\b/i,
  seduction: /\b(seduce|tease|caress|kiss (her|him) slowly|whisper)\b/i,
  intimidation: /\b(threaten|intimidate|loom|glare|or else|warn (her|him|them))\b/i,
  insight: /\b(read (her|him|them)|study (her|his|their) face|watch (her|him|them) closely|notice|look for)\b/i,
};
export function practiseFrom(s: SaveState, text: string): string[] {
  const t = text.toLowerCase();
  const used: string[] = [];
  for (const c of s.player.custom_skills ?? []) {
    // "Hypnosis" is practised by hypnotising: each word of the name, cut back to its root.
    const stems = c.name.toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 4).map((w) => w.slice(0, Math.max(4, Math.ceil(w.length * 0.6))));
    if (stems.some((x) => t.includes(x))) { practise(s, c.id, 0.6); used.push(c.name); }
  }
  for (const [id, re] of Object.entries(SOCIAL_WORDS)) if (re.test(text)) { practise(s, id, 0.25); used.push(id); }
  return used;
}

/** Practice. Capped at 100, and slower the better you get. */
export function practise(s: SaveState, id: string, amount = 1): void {
  const now = s.player.skills[id] ?? 0;
  s.player.skills[id] = clamp(now + amount * (1 - now / 130), 0, 100);
}

/** The four skills with people came after the rest: a save from before them starts at "poor", not "hopeless". */
export function settleSkills(s: SaveState): void {
  for (const id of ["charisma", "seduction", "intimidation", "insight"]) if (s.player.skills[id] === undefined) s.player.skills[id] = 15;
}

export function refreshPlayer(s: SaveState): void {
  settleSkills(s);
  const r = householdRead(s);
  s.player.household_read = { feared: Math.round(r.feared), trusted: Math.round(r.trusted), label: r.label };
}
