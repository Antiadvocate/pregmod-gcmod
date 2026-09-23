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
  if (frag > 0.65) lines.push(`Fear does most of the work in your house: ${Math.round(frag * 100)}% of it. Stop keeping it up and it's gone within a month.`);
  else if (frag < 0.3) lines.push(`Most of them stay because they've decided to. That holds when you're away or have a bad month.`);
  if (resent / n > 50) lines.push(`They're carrying a lot they haven't forgiven. Sooner or later one of them acts on it.`);
  if (hope / n < 15) lines.push(`None of them expects anything to get better. A promise means nothing to them until you keep one.`);
  else if (hope / n > 55) lines.push(`They think things can get better here, and it shows in how hard they try.`);
  const broken = household.filter((p) => p.psyche.state !== "intact").length;
  if (broken) lines.push(`${broken} of them ${broken === 1 ? "is" : "are"} coming apart, or already has.`);
  if (!lines.length) lines.push(`They do the work and think about something else.`);
  return { feared, trusted, label, lines };
}

/** The player's own skills, and what raises them. Kept small: five numbers, each of which does one
 *  legible thing, rather than the twelve the old game had and the two that mattered. */
export const PLAYER_SKILLS: { id: string; name: string; does: string }[] = [
  { id: "trading", name: "Trading", does: "better prices in the markets, and more found on an inspection" },
  { id: "slaving", name: "Slaving", does: "training goes faster, and you read a body correctly on sight" },
  { id: "medicine", name: "Medicine", does: "procedures are safer and recovery is shorter" },
  { id: "engineering", name: "Engineering", does: "construction and upgrades cost less" },
  { id: "hacking", name: "Hacking", does: "you see the neighbours' schemes earlier" },
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
};

/** Practice. Capped at 100, and slower the better you get. */
export function practise(s: SaveState, id: string, amount = 1): void {
  const now = s.player.skills[id] ?? 0;
  s.player.skills[id] = clamp(now + amount * (1 - now / 130), 0, 100);
}

export function refreshPlayer(s: SaveState): void {
  const r = householdRead(s);
  s.player.household_read = { feared: Math.round(r.feared), trusted: Math.round(r.trusted), label: r.label };
}
