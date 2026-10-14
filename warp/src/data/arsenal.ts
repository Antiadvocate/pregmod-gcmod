/**
 * THE ARSENAL — what an arcology with money can build that a country would envy.
 *
 * Each program is bought once and then takes weeks; most can be bought again for another unit, up
 * to `max`. `power` is per unit, on the same scale as militaryStrength (a neighbour fields 40–60, a
 * Free City 100–200, an Old World state a few hundred). `defence` is per unit on the garrison's scale,
 * for raids on the arcology itself. Upkeep is weekly, per unit. Grand projects carry no power but
 * change what you can do: an airport is what lets you fly anything.
 */
import type { DistrictKind } from "./districts";

export type Branch = "grand" | "ground" | "air" | "sea" | "missile" | "cyber" | "space";

export const BRANCHES: Record<Branch, { name: string; note: string }> = {
  grand: { name: "Grand projects", note: "Infrastructure a nation would build: what makes the rest possible." },
  ground: { name: "Ground", note: "What holds ground once it's taken." },
  air: { name: "Air", note: "Needs an airport, except drones." },
  sea: { name: "Sea", note: "Needs docks. What reaches the Free Cities over water." },
  missile: { name: "Missiles", note: "Reach without risk: strikes, and the shield against theirs." },
  cyber: { name: "Cyber", note: "Blinds them before you hit them." },
  space: { name: "Space", note: "Needs a launch complex. Sees everything; can hit anything." },
};

export interface Program {
  id: string;
  name: string;
  branch: Branch;
  note: string;
  cost: number;
  weeks: number;
  power: number;
  upkeep: number;
  max: number;
  needs?: string[];
  district?: DistrictKind;
  defence?: number;
  /** What it does besides fight, in a phrase. */
  does?: string;
}

export const PROGRAMS: Program[] = [
  /* grand */
  { id: "airport", name: "International airport", branch: "grand", cost: 250_000, weeks: 6, power: 0, upkeep: 2_000, max: 1, note: "Runways long enough for anything, on reclaimed ground off the verge.", does: "air programs; +¤6,000 a week in traffic; reach; visits abroad cost half" },
  { id: "airline", name: "Your own airline", branch: "grand", cost: 400_000, weeks: 5, power: 0, upkeep: 3_000, max: 1, needs: ["airport"], note: "Your livery on tails in every Free City.", does: "+¤12,000 a week; reputation abroad; other powers warm to you" },
  { id: "intel", name: "Private intelligence service", branch: "grand", cost: 300_000, weeks: 4, power: 0, upkeep: 2_500, max: 1, note: "Analysts, agents and a building with no name on it.", does: "espionage and coups against other powers; their schemes against you move slower" },
  { id: "media", name: "Global media network", branch: "grand", cost: 600_000, weeks: 6, power: 0, upkeep: 4_000, max: 1, note: "Channels, feeds and papers, in forty languages, all saying what you'd like said.", does: "+reputation every week; every power's opinion of you drifts up" },
  { id: "bank", name: "Sovereign debt desk", branch: "grand", cost: 900_000, weeks: 6, power: 0, upkeep: 3_000, max: 1, note: "A bank that lends to governments, and owns them when they can't pay.", does: "buy an Old World state's debt and make it your vassal" },
  { id: "launch", name: "Launch complex", branch: "grand", cost: 1_500_000, weeks: 10, power: 0, upkeep: 6_000, max: 1, note: "A pad, a gantry, and rockets that land themselves.", does: "space programs" },

  /* ground */
  { id: "armour", name: "Armoured brigade", branch: "ground", cost: 90_000, weeks: 3, power: 15, upkeep: 900, max: 6, note: "Tanks and fighting vehicles, crewed by people who are paid very well.", district: "barracks", defence: 0.6 },
  { id: "special", name: "Special forces", branch: "ground", cost: 120_000, weeks: 3, power: 10, upkeep: 1_200, max: 3, note: "Small teams that go where armies can't.", does: "coups and assassinations abroad", defence: 0.4 },
  { id: "androids", name: "Combat android legion", branch: "ground", cost: 2_000_000, weeks: 8, power: 120, upkeep: 15_000, max: 3, needs: ["ai_net"], note: "Machines that hold a city without sleeping, eating or doubting.", defence: 2 },

  /* air */
  { id: "drones", name: "Attack drone squadron", branch: "air", cost: 40_000, weeks: 2, power: 8, upkeep: 400, max: 8, note: "Cheap, numerous, and very hard to stop.", defence: 0.5 },
  { id: "fighters", name: "Fighter wing", branch: "air", cost: 350_000, weeks: 6, power: 35, upkeep: 3_500, max: 4, needs: ["airport"], note: "Twelve fighters bought second-hand from a government that needed the money.", defence: 1 },
  { id: "bombers", name: "Strategic bomber wing", branch: "air", cost: 800_000, weeks: 8, power: 60, upkeep: 8_000, max: 3, needs: ["fighters"], note: "Range to reach any capital on earth and come back." },
  { id: "stealth", name: "Stealth wing", branch: "air", cost: 2_500_000, weeks: 10, power: 110, upkeep: 20_000, max: 2, needs: ["bombers"], note: "Aircraft their radar has never seen and never will." },

  /* sea */
  { id: "patrol", name: "Patrol flotilla", branch: "sea", cost: 60_000, weeks: 3, power: 10, upkeep: 600, max: 4, district: "docks", note: "Fast boats with guns; the end of piracy in your waters.", defence: 0.6 },
  { id: "frigates", name: "Frigate squadron", branch: "sea", cost: 450_000, weeks: 8, power: 40, upkeep: 4_500, max: 3, needs: ["patrol"], note: "Warships that can sit off any coast for a month." },
  { id: "subs", name: "Attack submarines", branch: "sea", cost: 1_000_000, weeks: 10, power: 70, upkeep: 9_000, max: 2, needs: ["frigates"], note: "Nobody knows where they are. That is the point." },
  { id: "carrier", name: "Carrier group", branch: "sea", cost: 4_000_000, weeks: 16, power: 180, upkeep: 35_000, max: 1, needs: ["frigates", "fighters"], note: "An airfield that sails. Most countries never had one." },

  /* missiles */
  { id: "batteries", name: "Missile batteries", branch: "missile", cost: 80_000, weeks: 3, power: 12, upkeep: 800, max: 4, note: "Cruise missiles on trucks, and the radar to aim them.", defence: 0.8 },
  { id: "hypersonic", name: "Hypersonic arsenal", branch: "missile", cost: 1_500_000, weeks: 10, power: 90, upkeep: 12_000, max: 2, needs: ["batteries"], note: "Too fast to intercept. Anywhere in twenty minutes." },
  { id: "shield", name: "Missile shield", branch: "missile", cost: 700_000, weeks: 8, power: 0, upkeep: 6_000, max: 1, needs: ["batteries"], note: "Interceptors over the spire.", does: "their strikes on your arcology mostly fail", defence: 2.5 },

  /* cyber */
  { id: "cyber", name: "Cyber warfare division", branch: "cyber", cost: 120_000, weeks: 4, power: 12, upkeep: 1_500, max: 2, note: "People who can turn off a country's lights.", does: "your skill in hacking counts double at war" },
  { id: "ai_net", name: "AI command network", branch: "cyber", cost: 1_200_000, weeks: 10, power: 0, upkeep: 10_000, max: 1, needs: ["cyber"], note: "One mind running every unit you own.", does: "+15% to everything you field" },

  /* space */
  { id: "satellites", name: "Satellite constellation", branch: "space", cost: 1_200_000, weeks: 8, power: 30, upkeep: 8_000, max: 1, needs: ["launch"], note: "Four hundred eyes in orbit.", does: "you see every power's strength and schemes" },
  { id: "orbital", name: "Orbital strike platform", branch: "space", cost: 8_000_000, weeks: 20, power: 300, upkeep: 50_000, max: 1, needs: ["satellites"], note: "Tungsten rods, dropped from orbit. Nothing on earth is out of reach, and nothing stops them." },
];

export const PROGRAM_BY_ID: Record<string, Program> = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));
