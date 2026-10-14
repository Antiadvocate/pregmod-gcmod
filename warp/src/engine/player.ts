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
  { id: "command", name: "Command", does: "your forces fight harder: every point is half a percent on your military strength, in defence and at war" },
  { id: "diplomacy", name: "Diplomacy", does: "other powers warm to you each week, and your envoys, treaties and ultimatums land better" },
];

/** THE FIVE SKILLS, AND THE ONE PLACE EACH OF THEM IS READ.
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
};

/* ── buying it ───────────────────────────────────────────────────────────────────────────────── */

/** Three ways to get better at something with money instead of years. */
export type Tier = "tutor" | "course" | "implant";
export const TIERS: Record<Tier, { name: string; note: string; base: number; weeks: number; gain: number }> = {
  tutor: { name: "Private tutor", note: "The best in the world at it, flown in to teach you one to one. Some weeks of your evenings.", base: 15000, weeks: 3, gain: 8 },
  course: { name: "Intensive immersion", note: "A month away at a war college, a diplomatic academy or a lab, with people who don't know who you are.", base: 60000, weeks: 4, gain: 18 },
  implant: { name: "Neural augmentation", note: "A procedure most of the world can't buy. Done in a day; the knowledge is just there when you wake.", base: 300000, weeks: 0, gain: 25 },
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
  const sk = PLAYER_SKILLS.find((x) => x.id === id);
  if (!sk) return { ok: false, line: "No such skill." };
  const now = s.player.skills[id] ?? 0;
  if (now >= 99) return { ok: false, line: `You're as good at ${sk.name.toLowerCase()} as anyone alive.` };
  if (TIERS[tier].weeks && s.player.training) return { ok: false, line: "You're already in the middle of one; finish it first." };
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
  const name = PLAYER_SKILLS.find((x) => x.id === t.skill)?.name ?? t.skill;
  return [`Your ${TIERS[t.tier].name.toLowerCase()} in ${name.toLowerCase()} is finished. You're at ${Math.round(s.player.skills[t.skill])}.`];
}

/** Practice. Capped at 100, and slower the better you get. */
export function practise(s: SaveState, id: string, amount = 1): void {
  const now = s.player.skills[id] ?? 0;
  s.player.skills[id] = clamp(now + amount * (1 - now / 130), 0, 100);
}

export function refreshPlayer(s: SaveState): void {
  const r = householdRead(s);
  s.player.household_read = { feared: Math.round(r.feared), trusted: Math.round(r.trusted), label: r.label };
}
