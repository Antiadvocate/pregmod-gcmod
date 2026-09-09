/**
 * THE CITY — what an arcology owner actually owns, and what it does for them.
 *
 * The rebuild had a `Sector` with four fields: a kind, an owner, and a condition number. It was
 * scenery. You could not build one, upgrade one, or lose one, and nothing on screen ever showed
 * you the place you were supposedly running.
 *
 * A district is the 4X unit. It sits in a ring around your spire, it has a level you pay to raise,
 * it produces something specific every week, and — the part that makes it worth having — the
 * skyline is drawn FROM this table, so a level you buy is a building that gets taller.
 *
 * WHAT EACH RING MEANS. The core is the arcology's own footing and can hold the expensive things.
 * The inner and outer rings are the city proper. The verge is what the Free City has instead of
 * suburbs: cheap, ugly, and where the people who service everything actually live. Building out is
 * cheaper than building up, and building up is worth more.
 */

export type DistrictKind =
  | "spire" | "residential" | "commercial" | "industrial"
  | "civic" | "docks" | "academy" | "barracks" | "pleasure";

export interface DistrictDef {
  kind: DistrictKind;
  name: string;
  /** One line of what it is, in the voice of somebody who lives near it. */
  blurb: string;
  /** Cost to claim a vacant plot and put the first thing on it. */
  found: number;
  /** Cost per level after the first. Multiplied by the level being bought. */
  step: number;
  /** How tall it draws, per level, as a fraction of the spire. Shapes the skyline. */
  bulk: number;
  /** Its accent in the panorama. Deliberately desaturated — the skyline is a city at dusk, not
   *  a pie chart, and eight fully saturated hues across a horizon is a toy. */
  hue: string;
  /** Highest level it can reach without a doctrine or a project unlocking more. */
  cap: number;
  /** What one level produces each week. Read by engine/city.ts. */
  yields: Partial<{
    cash: number;
    /** Citizens housed. The population ceiling is the sum of these. */
    housing: number;
    prosperity: number;
    security: number;
    /** Reduces the cost of everything you build, as a percentage per level. */
    industry: number;
    /** Trade reach, in regions. Docks are the only source. */
    reach: number;
    /** Weekly skill gain multiplier for every slave in training. */
    schooling: number;
    /** Military strength, which is the only currency the neighbours read. */
    arms: number;
    rep: number;
  }>;
  /** Doctrines that want this built, and pay reputation for it. */
  favoured_by?: string[];
  /** What it does to the household, if anything. The city is not separate from the people in it. */
  household?: string;
}

export const DISTRICTS: DistrictDef[] = [
  {
    kind: "spire", name: "The Spire", blurb: "Your arcology. Everything above the ninetieth floor is yours and everyone knows it.",
    found: 0, step: 40000, bulk: 1, hue: "#8f7a52", cap: 8,
    yields: { rep: 40, prosperity: 2, cash: 900 },
    household: "Every level adds four beds' worth of room in the facilities below you.",
  },
  {
    kind: "residential", name: "Housing block", blurb: "Where the people who make the arcology work go at night.",
    found: 9000, step: 7000, bulk: 0.34, hue: "#6b7a8f", cap: 6,
    yields: { housing: 900, cash: 340, prosperity: 1 },
    favoured_by: ["paternalist", "repopulation"],
  },
  {
    kind: "commercial", name: "Commercial row", blurb: "Frontage, footfall, and rents that go up whether or not anything is selling.",
    found: 14000, step: 11000, bulk: 0.42, hue: "#8f7d5e", cap: 6,
    yields: { cash: 1400, prosperity: 3 },
    favoured_by: ["hedonist", "professionalism"],
  },
  {
    kind: "industrial", name: "Works", blurb: "Fabrication, recycling, and the smell on a south wind.",
    found: 12000, step: 9000, bulk: 0.5, hue: "#7a6b60", cap: 6,
    yields: { industry: 6, cash: 700, prosperity: -1 },
    favoured_by: ["cummunism"],
  },
  {
    kind: "civic", name: "Civic hall", blurb: "Courts, the registry, the watch. The paperwork that makes any of the rest of it real.",
    found: 16000, step: 13000, bulk: 0.38, hue: "#7d8578", cap: 5,
    yields: { security: 7, rep: 18, prosperity: 1 },
    favoured_by: ["paternalist", "chattel_religion"],
    household: "Standing orders run cleaner — the watch does the flagging you would otherwise do yourself.",
  },
  {
    kind: "docks", name: "Docks", blurb: "Where everything arrives and where an embargo is felt first.",
    found: 20000, step: 15000, bulk: 0.3, hue: "#5f7a7d", cap: 5,
    yields: { reach: 1, cash: 1100, industry: 2 },
    household: "New arrivals land here, so the market shows you more of them.",
  },
  {
    kind: "academy", name: "Academy", blurb: "Instructors, examination halls, and a great deal of expensive silence.",
    found: 22000, step: 17000, bulk: 0.36, hue: "#7a7290", cap: 4,
    yields: { schooling: 0.35, rep: 22, prosperity: 1 },
    favoured_by: ["professionalism", "chinese", "paternalist"],
    household: "Every woman in classes learns faster, and the schoolroom's ceiling goes up with it.",
  },
  {
    kind: "barracks", name: "Barracks", blurb: "The only argument the other arcologies have ever found persuasive.",
    found: 24000, step: 19000, bulk: 0.28, hue: "#8a6a5e", cap: 5,
    yields: { arms: 12, security: 5 },
    favoured_by: ["roman", "neo_imperial"],
    household: "Raids on your building stop reaching the residential ring.",
  },
  {
    kind: "pleasure", name: "Pleasure quarter", blurb: "The reason people come here rather than to Kestrel, and everybody's second-favourite export.",
    found: 18000, step: 14000, bulk: 0.32, hue: "#8f6478", cap: 6,
    yields: { cash: 2100, rep: 12, prosperity: 2, security: -3 },
    favoured_by: ["hedonist", "degradationist", "supplication"],
    household: "Whores and public servants earn more, and the arcology notices what they are worth.",
  },
];

export const DISTRICT_BY_KIND: Record<DistrictKind, DistrictDef> =
  Object.fromEntries(DISTRICTS.map((d) => [d.kind, d])) as Record<DistrictKind, DistrictDef>;

/** The rings, outward. Building out is cheap and shallow; building up is expensive and pays. */
export const RINGS = [
  { id: 0, name: "the core", mult: 1.6, slots: 1 },
  { id: 1, name: "the inner ring", mult: 1.25, slots: 6 },
  { id: 2, name: "the outer ring", mult: 1.0, slots: 8 },
  { id: 3, name: "the verge", mult: 0.75, slots: 8 },
] as const;

/**
 * THE WORLD BEYOND THE CITY — what the docks reach.
 *
 * The original's map was three neighbours with an attitude number. Trade regions are the explore
 * half of the game: each one is worth something specific, costs a dock level of reach to open, and
 * carries a risk that is the honest reason nobody has already taken it.
 */
export interface Region {
  id: string;
  name: string;
  /** Dock reach needed before a route can be opened at all. */
  reach: number;
  /** Cost to open the route. */
  open: number;
  /** Per week, once open. */
  cash: number;
  /** 0–1 chance per week something goes wrong out there. */
  risk: number;
  /** What it sends you, beyond money. */
  note: string;
  /** Bodies per week, on average, at a discount — the reason most of these routes exist. */
  supply?: number;
}

export const REGIONS: Region[] = [
  { id: "cape", name: "The Cape", reach: 1, open: 12000, cash: 1400, risk: 0.04,
    note: "Bulk staples and the shipping paper everything else is written on." },
  { id: "delta", name: "The Delta", reach: 1, open: 18000, cash: 900, risk: 0.10, supply: 0.5,
    note: "Debt bondage, mostly. The paperwork is clean and nobody looks at it twice." },
  { id: "steppe", name: "The Steppe", reach: 2, open: 26000, cash: 1900, risk: 0.14, supply: 0.35,
    note: "Metals, horses, and women whose families were paid in advance." },
  { id: "archipelago", name: "The Archipelago", reach: 2, open: 31000, cash: 2600, risk: 0.09,
    note: "Fuel, and a bank that does not ask what the collateral is." },
  { id: "interior", name: "The Interior", reach: 3, open: 44000, cash: 3400, risk: 0.22, supply: 0.8,
    note: "Whatever is left of a country that stopped being one about four years ago." },
  { id: "north", name: "The Northern Cities", reach: 4, open: 60000, cash: 5200, risk: 0.06,
    note: "Old money, old machines, and buyers who pay what a trained woman is actually worth." },
];

export const REGION_BY_ID: Record<string, Region> = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
