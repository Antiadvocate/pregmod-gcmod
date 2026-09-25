/**
 * FACILITIES — the rooms of the arcology, and what standing in one does to a person.
 *
 * Each record owns everything about a facility that used to be spread across a passage, a manager
 * file, an upgrade list and a chunk of the weekly pass: what it costs, how many it holds, who runs
 * it, what the work does to a body and a nervous system, and what it earns. The weekly pipeline
 * (engine/week.ts) walks this table; it has no per-facility branches at all.
 *
 * `psyche` is the part the old game had no vocabulary for. A week in the arcade and a week in the
 * spa both moved `devotion` by an integer; here they move the resting point in opposite directions
 * and leave different memories, which is the difference between a mechanic and a place.
 */
import type { Assignment } from "../engine/types";

export interface FacilityUpgrade {
  id: string;
  name: string;
  cost: number;
  note: string;
  /** Requires this many levels of the facility first. */
  needs_level?: number;
}

export interface ManagerPost {
  title: string;
  /** The management skill this post trains and reads. */
  skill: string;
  /** Careers that count as prior experience. */
  careers: string[];
  /** Minimum read devotion to hold the post at all — a manager who hates you steals. */
  min_devotion: number;
  /** What having a good one does, in one line, for the UI. */
  effect: string;
}

export interface FacilityDef {
  id: string;
  name: string;
  /** One line in the arcology's voice. */
  blurb: string;
  /** What it looks like, for the narrator. */
  look: string;
  build_cost: number;
  /** Slots added per level. Level 0 = not built. */
  capacity_per_level: number;
  /** Cost to add one more level of room. */
  level_cost: number;
  /** Upkeep per occupied slot per week. */
  upkeep_per_slot: number;
  manager?: ManagerPost;
  /** The assignment a worker here holds. */
  work: Assignment;
  /** How it makes money. `customers` scales with beauty and skill; `production` with the body;
   *  `none` costs money and buys something else. */
  income: "customers" | "production" | "none";
  /** Per-week effect on a worker's nervous system and body. Applied by week.ts. */
  psyche: {
    /** Direct shove to relaxation each week. */
    relaxation: number;
    /** Pressure on the resting point: negative wears, positive settles. Applied as run credit. */
    wear: number;
    /** Health per week. */
    health: number;
    /** Energy drain per week, 0–100. */
    energy: number;
  };
  /** Skills the work trains, per week, before aptitude. */
  trains: Partial<Record<string, number>>;
  upgrades: FacilityUpgrade[];
  /** Doctrine ids this facility pleases when it is busy. */
  pleases?: string[];
}

export const FACILITIES: FacilityDef[] = [
  {
    id: "brothel", name: "The Brothel",
    blurb: "Slaves sell sex by the hour to paying customers.",
    look: "a lit frontage on the commercial promenade, a bar, and a stair to the rooms",
    build_cost: 10000, capacity_per_level: 6, level_cost: 8000, upkeep_per_slot: 100,
    manager: { title: "Madam", skill: "madam", careers: ["prostitute", "escort", "hotel manager", "madam"], min_devotion: 20, effect: "trains the whores and keeps them healthier" },
    work: "work in the brothel", income: "customers",
    psyche: { relaxation: -0.8, wear: -1, health: -2, energy: 45 },
    trains: { oral: 1.4, vaginal: 1.4, anal: 1.0, whoring: 2.0 },
    upgrades: [
      { id: "advertising", name: "Advertising", cost: 5000, note: "more customers, worse ones" },
      { id: "drugs", name: "Bar and dispensary", cost: 8000, note: "customers pay more and stay longer" },
      { id: "rooms", name: "Private rooms", cost: 12000, note: "higher prices; the work is less public", needs_level: 2 },
    ],
    pleases: ["degradationist", "cummunism"],
  },
  {
    id: "club", name: "The Club",
    blurb: "Slaves entertain and sleep with citizens in public, for reputation.",
    look: "an open floor, low tables, a DJ booth, and a view down into the concourse",
    build_cost: 10000, capacity_per_level: 6, level_cost: 8000, upkeep_per_slot: 120,
    manager: { title: "DJ", skill: "DJ", careers: ["DJ", "musician", "entertainer", "hostess"], min_devotion: 20, effect: "a good DJ raises the club's income and your reputation" },
    work: "serve in the club", income: "customers",
    psyche: { relaxation: 0.2, wear: 0, health: -1, energy: 35 },
    trains: { entertainment: 2.0, oral: 0.6, whoring: 0.6 },
    upgrades: [
      { id: "lights", name: "Lighting rig", cost: 6000, note: "extra reputation each week" },
      { id: "bar", name: "Full bar", cost: 9000, note: "citizens stay; income up" },
    ],
    pleases: ["hedonist", "roman"],
  },
  {
    id: "dairy", name: "The Dairy",
    blurb: "Slaves are milked for profit.",
    look: "tiled, drained, warm, and very loud with machinery",
    build_cost: 12000, capacity_per_level: 6, level_cost: 9000, upkeep_per_slot: 140,
    manager: { title: "Milkmaid", skill: "milkmaid", careers: ["farmer", "nurse", "dairy worker"], min_devotion: 10, effect: "keeps milk yields up and the cows healthy" },
    work: "work in the dairy", income: "production",
    psyche: { relaxation: -0.4, wear: -0.6, health: -1, energy: 30 },
    trains: {},
    upgrades: [
      { id: "pumps", name: "Industrial pumps", cost: 10000, note: "yield up, comfort down" },
      { id: "feeds", name: "Feed lines", cost: 12000, note: "cows stay on the machines full time", needs_level: 2 },
      { id: "restraints", name: "Full restraint", cost: 15000, note: "maximum yield, at a heavy cost to the cows' minds", needs_level: 3 },
    ],
    pleases: ["pastoralist", "expansionist"],
  },
  {
    id: "farmyard", name: "The Farmyard",
    blurb: "Slaves grow food for the arcology.",
    look: "grow lights, soil beds, animal pens along the far wall",
    build_cost: 15000, capacity_per_level: 8, level_cost: 10000, upkeep_per_slot: 60,
    manager: { title: "Farmer", skill: "farmer", careers: ["farmer", "gardener", "veterinarian"], min_devotion: 0, effect: "raises food production" },
    work: "work as a farmhand", income: "production",
    psyche: { relaxation: 0.3, wear: 0.2, health: 1, energy: 40 },
    trains: {},
    upgrades: [
      { id: "hydroponics", name: "Hydroponics", cost: 14000, note: "food production up sharply" },
      { id: "livestock", name: "Livestock", cost: 18000, note: "meat, and a use for the pens" },
    ],
  },
  {
    id: "arcade", name: "The Arcade",
    blurb: "Slaves are restrained in glory holes and used by the public. Profitable, and very hard on them.",
    look: "a dim corridor of booths, coin slots on the outside, nothing on the inside",
    build_cost: 8000, capacity_per_level: 10, level_cost: 6000, upkeep_per_slot: 40,
    work: "be confined in the arcade", income: "customers",
    psyche: { relaxation: -2.5, wear: -3, health: -8, energy: 60 },
    trains: { oral: 0.8, anal: 0.8, vaginal: 0.8 },
    upgrades: [
      { id: "sanitation", name: "Sanitation", cost: 7000, note: "fewer health problems" },
      { id: "restraints", name: "Comfortable restraints", cost: 9000, note: "less physical damage" },
    ],
    pleases: ["degradationist"],
  },
  {
    id: "cellblock", name: "The Cellblock",
    blurb: "Confinement for disobedient slaves, to break their will.",
    look: "a short row of cells and a room with a drain in the middle of the floor",
    build_cost: 8000, capacity_per_level: 5, level_cost: 6000, upkeep_per_slot: 80,
    manager: { title: "Wardeness", skill: "wardeness", careers: ["prison guard", "soldier", "police officer"], min_devotion: 40, effect: "breaks prisoners faster" },
    work: "be confined in the cellblock", income: "none",
    psyche: { relaxation: -2.0, wear: -2.5, health: -3, energy: 20 },
    trains: {},
    upgrades: [
      { id: "isolation", name: "Isolation", cost: 8000, note: "faster, and worse" },
      { id: "chemicals", name: "Chemical suite", cost: 11000, note: "drugs that break them without marking them" },
    ],
  },
  {
    id: "spa", name: "The Spa",
    blurb: "Slaves rest and recover here.",
    look: "steam rooms, warm stone and massage tables",
    build_cost: 10000, capacity_per_level: 5, level_cost: 7000, upkeep_per_slot: 150,
    manager: { title: "Attendant", skill: "attendant", careers: ["masseuse", "nurse", "therapist"], min_devotion: 40, effect: "faster recovery, including mental recovery" },
    work: "rest in the spa", income: "none",
    psyche: { relaxation: 1.6, wear: 1.5, health: 4, energy: -30 },
    trains: {},
    upgrades: [
      { id: "pool", name: "Mineral pool", cost: 9000, note: "health recovery up" },
      { id: "counselling", name: "Counselling", cost: 12000, note: "helps mentally broken slaves recover" },
    ],
    pleases: ["paternalist"],
  },
  {
    id: "clinic", name: "The Clinic",
    blurb: "Slaves get medical care and recover from surgery here.",
    look: "a clean white ward with surgical equipment",
    build_cost: 12000, capacity_per_level: 4, level_cost: 9000, upkeep_per_slot: 200,
    manager: { title: "Nurse", skill: "nurse", careers: ["nurse", "doctor", "paramedic"], min_devotion: 40, effect: "faster recovery and fewer complications" },
    work: "get treatment in the clinic", income: "none",
    psyche: { relaxation: 0.4, wear: 0.4, health: 8, energy: -20 },
    trains: {},
    upgrades: [
      { id: "diagnostics", name: "Diagnostics", cost: 10000, note: "catches health problems early" },
      { id: "surgery", name: "Surgical theatre", cost: 16000, note: "unlocks surgery on each slave's surgery tab; level 2 unlocks the advanced procedures" },
      { id: "organ_farm", name: "Organ farm", cost: 22000, note: "grow the parts instead of buying them", needs_level: 2 },
      { id: "gene_lab", name: "Gene lab", cost: 30000, note: "unlocks fleshcraft on the surgery tab: real ears and tails, scales, milk and fertility genes, slowed ageing", needs_level: 2 },
    ],
    pleases: ["paternalist", "transformation"],
  },
  {
    id: "schoolroom", name: "The Schoolroom",
    blurb: "Slaves are taught skills and educated here.",
    look: "rows of desks and a whiteboard",
    build_cost: 9000, capacity_per_level: 6, level_cost: 7000, upkeep_per_slot: 90,
    manager: { title: "Schoolteacher", skill: "teacher", careers: ["teacher", "professor", "tutor"], min_devotion: 30, effect: "students learn about twice as fast" },
    work: "learn in the schoolroom", income: "none",
    psyche: { relaxation: 0.5, wear: 0.4, health: 0, energy: 15 },
    trains: { oral: 1.0, vaginal: 1.0, anal: 1.0, entertainment: 1.0, whoring: 1.0 },
    upgrades: [
      { id: "remedial", name: "Remedial track", cost: 8000, note: "teaches illiterate slaves to read" },
      { id: "advanced", name: "Advanced curriculum", cost: 12000, note: "higher skill caps", needs_level: 2 },
    ],
    pleases: ["professionalism", "paternalist", "chinese"],
  },
  {
    id: "servants", name: "Servants' Quarters",
    blurb: "Slaves do the cleaning and maintenance for the arcology.",
    look: "a dormitory, a laundry, and a service corridor to everywhere",
    build_cost: 7000, capacity_per_level: 8, level_cost: 5000, upkeep_per_slot: 50,
    manager: { title: "Stewardess", skill: "stewardess", careers: ["housekeeper", "butler", "hotel manager"], min_devotion: 30, effect: "lowers upkeep costs" },
    work: "work as a servant", income: "none",
    psyche: { relaxation: 0.1, wear: -0.2, health: 0, energy: 30 },
    trains: {},
    upgrades: [{ id: "machines", name: "Labour machinery", cost: 9000, note: "fewer bodies for the same work" }],
  },
  {
    id: "master_suite", name: "The Master Suite",
    blurb: "Your private suite, where your favorite slaves live and serve you.",
    look: "a luxurious suite at the top of the arcology",
    build_cost: 14000, capacity_per_level: 4, level_cost: 10000, upkeep_per_slot: 250,
    manager: { title: "Concubine", skill: "concubine", careers: ["courtesan", "wife", "escort"], min_devotion: 60, effect: "runs the suite, and serves as your consort in public" },
    work: "please you", income: "none",
    psyche: { relaxation: 1.0, wear: 1.0, health: 1, energy: 25 },
    trains: { oral: 0.8, vaginal: 0.8, anal: 0.6, entertainment: 0.6 },
    upgrades: [
      { id: "luxury", name: "Furnishing", cost: 12000, note: "slaves in the suite relax faster" },
      { id: "pit", name: "Sunken bath", cost: 9000, note: "health, and room for group sex" },
    ],
    pleases: ["paternalist", "arabian"],
  },
  {
    id: "nursery", name: "The Nursery",
    blurb: "Children are raised here.",
    look: "cribs, toys and a play area",
    build_cost: 12000, capacity_per_level: 8, level_cost: 8000, upkeep_per_slot: 180,
    manager: { title: "Matron", skill: "matron", careers: ["nanny", "teacher", "nurse", "mother"], min_devotion: 50, effect: "raises the children better" },
    work: "work as a servant", income: "none",
    psyche: { relaxation: 0.8, wear: 0.8, health: 1, energy: 25 },
    trains: {},
    upgrades: [{ id: "school", name: "Early schooling", cost: 11000, note: "children are educated as they grow" }],
    pleases: ["repopulation", "gender_fundamentalist", "paternalist"],
  },
  {
    id: "incubator", name: "The Incubator",
    blurb: "Artificial wombs and growth tanks.",
    look: "a row of lit growth tanks",
    build_cost: 25000, capacity_per_level: 4, level_cost: 15000, upkeep_per_slot: 400,
    work: "rest", income: "none",
    psyche: { relaxation: 0, wear: 0, health: 0, energy: 0 },
    trains: {},
    upgrades: [
      { id: "speed", name: "Accelerated growth", cost: 20000, note: "much faster growth, with side effects" },
      { id: "conditioning", name: "Conditioning suite", cost: 18000, note: "they come out already shaped", needs_level: 2 },
    ],
    pleases: ["eugenics", "transformation"],
  },
  {
    id: "pit", name: "The Pit",
    blurb: "Slaves fight for the crowd's entertainment.",
    look: "a sand pit with standing room for four hundred",
    build_cost: 9000, capacity_per_level: 4, level_cost: 6000, upkeep_per_slot: 60,
    work: "fight in the pit", income: "customers",
    psyche: { relaxation: -1.2, wear: -1.2, health: -6, energy: 50 },
    trains: { combat: 3.0 },
    upgrades: [
      { id: "seating", name: "Seating", cost: 8000, note: "more ticket sales" },
      { id: "lethal", name: "Lethal bouts", cost: 0, note: "fights to the death: double the income, but slaves die" },
    ],
    pleases: ["roman", "aztec", "degradationist"],
  },
  {
    id: "barracks", name: "The Barracks",
    blurb: "Barracks for your private security force.",
    look: "a drill floor and an armory",
    build_cost: 16000, capacity_per_level: 4, level_cost: 10000, upkeep_per_slot: 120,
    manager: { title: "Bodyguard", skill: "bodyguard", careers: ["soldier", "bodyguard", "mercenary", "police officer"], min_devotion: 60, effect: "protects you from attacks" },
    work: "guard you", income: "none",
    psyche: { relaxation: 0.2, wear: 0.2, health: 0, energy: 35 },
    trains: { combat: 2.0 },
    upgrades: [
      { id: "drones", name: "Security drones", cost: 14000, note: "arcology security up" },
      { id: "armory", name: "Armoury", cost: 12000, note: "your forces survive attacks more often" },
    ],
  },
];

export const FACILITY_BY_ID: Record<string, FacilityDef> = Object.fromEntries(FACILITIES.map((f) => [f.id, f]));
