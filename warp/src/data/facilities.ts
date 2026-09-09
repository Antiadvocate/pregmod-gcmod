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
    blurb: "Sex, sold by the hour, to anyone with the fare.",
    look: "a lit frontage on the commercial promenade, a bar, and a stair to the rooms",
    build_cost: 10000, capacity_per_level: 6, level_cost: 8000, upkeep_per_slot: 100,
    manager: { title: "Madam", skill: "madam", careers: ["prostitute", "escort", "hotel manager", "madam"], min_devotion: 20, effect: "trains the girls between customers and skims fewer of them into hospital" },
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
    blurb: "Company, in public, for citizens who want to be seen having it.",
    look: "an open floor, low tables, a DJ booth, and a view down into the concourse",
    build_cost: 10000, capacity_per_level: 6, level_cost: 8000, upkeep_per_slot: 120,
    manager: { title: "DJ", skill: "DJ", careers: ["DJ", "musician", "entertainer", "hostess"], min_devotion: 20, effect: "sets the room's temperature; a good one raises the whole arcology's mood" },
    work: "serve in the club", income: "customers",
    psyche: { relaxation: 0.2, wear: 0, health: -1, energy: 35 },
    trains: { entertainment: 2.0, oral: 0.6, whoring: 0.6 },
    upgrades: [
      { id: "lights", name: "Lighting rig", cost: 6000, note: "the room reads better; reputation per week" },
      { id: "bar", name: "Full bar", cost: 9000, note: "citizens stay; income up" },
    ],
    pleases: ["hedonist", "roman"],
  },
  {
    id: "dairy", name: "The Dairy",
    blurb: "Production, measured in litres.",
    look: "tiled, drained, warm, and very loud with machinery",
    build_cost: 12000, capacity_per_level: 6, level_cost: 9000, upkeep_per_slot: 140,
    manager: { title: "Milkmaid", skill: "milkmaid", careers: ["farmer", "nurse", "dairy worker"], min_devotion: 10, effect: "keeps yields up and udders intact" },
    work: "work in the dairy", income: "production",
    psyche: { relaxation: -0.4, wear: -0.6, health: -1, energy: 30 },
    trains: {},
    upgrades: [
      { id: "pumps", name: "Industrial pumps", cost: 10000, note: "yield up, comfort down" },
      { id: "feeds", name: "Feed lines", cost: 12000, note: "the cows stop leaving the machines", needs_level: 2 },
      { id: "restraints", name: "Full restraint", cost: 15000, note: "maximum yield; nobody walks out of here the same", needs_level: 3 },
    ],
    pleases: ["pastoralist", "expansionist"],
  },
  {
    id: "farmyard", name: "The Farmyard",
    blurb: "Food, grown in the arcology, by people who used to be something else.",
    look: "grow lights, soil beds, animal pens along the far wall",
    build_cost: 15000, capacity_per_level: 8, level_cost: 10000, upkeep_per_slot: 60,
    manager: { title: "Farmer", skill: "farmer", careers: ["farmer", "gardener", "veterinarian"], min_devotion: 0, effect: "the yields stop being a rounding error" },
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
    blurb: "A wall of holes. Cheap, constant, and the fastest way to break somebody.",
    look: "a dim corridor of booths, coin slots on the outside, nothing on the inside",
    build_cost: 8000, capacity_per_level: 10, level_cost: 6000, upkeep_per_slot: 40,
    work: "be confined in the arcade", income: "customers",
    psyche: { relaxation: -2.5, wear: -3, health: -8, energy: 60 },
    trains: { oral: 0.8, anal: 0.8, vaginal: 0.8 },
    upgrades: [
      { id: "sanitation", name: "Sanitation", cost: 7000, note: "they stop dying of it" },
      { id: "restraints", name: "Comfortable restraints", cost: 9000, note: "less physical damage, same everything else" },
    ],
    pleases: ["degradationist"],
  },
  {
    id: "cellblock", name: "The Cellblock",
    blurb: "For the ones who will not.",
    look: "a short row of cells and a room with a drain in the middle of the floor",
    build_cost: 8000, capacity_per_level: 5, level_cost: 6000, upkeep_per_slot: 80,
    manager: { title: "Wardeness", skill: "wardeness", careers: ["prison guard", "soldier", "police officer"], min_devotion: 40, effect: "breaks them faster, and decides how much of them is left" },
    work: "be confined in the cellblock", income: "none",
    psyche: { relaxation: -2.0, wear: -2.5, health: -3, energy: 20 },
    trains: {},
    upgrades: [
      { id: "isolation", name: "Isolation", cost: 8000, note: "faster, and worse" },
      { id: "chemicals", name: "Chemical suite", cost: 11000, note: "obedience without the marks" },
    ],
  },
  {
    id: "spa", name: "The Spa",
    blurb: "Where you put someone you would rather not lose.",
    look: "steam, warm stone, and somebody whose job is to be gentle",
    build_cost: 10000, capacity_per_level: 5, level_cost: 7000, upkeep_per_slot: 150,
    manager: { title: "Attendant", skill: "attendant", careers: ["masseuse", "nurse", "therapist"], min_devotion: 40, effect: "the difference between rest and recovery" },
    work: "rest in the spa", income: "none",
    psyche: { relaxation: 1.6, wear: 1.5, health: 4, energy: -30 },
    trains: {},
    upgrades: [
      { id: "pool", name: "Mineral pool", cost: 9000, note: "health recovery up" },
      { id: "counselling", name: "Counselling", cost: 12000, note: "the broken can come back from further" },
    ],
    pleases: ["paternalist"],
  },
  {
    id: "clinic", name: "The Clinic",
    blurb: "Surgery, recovery, and the long treatments.",
    look: "white, quiet, and better equipped than anything else on this floor",
    build_cost: 12000, capacity_per_level: 4, level_cost: 9000, upkeep_per_slot: 200,
    manager: { title: "Nurse", skill: "nurse", careers: ["nurse", "doctor", "paramedic"], min_devotion: 40, effect: "recovery weeks halve and the complications mostly do not happen" },
    work: "get treatment in the clinic", income: "none",
    psyche: { relaxation: 0.4, wear: 0.4, health: 8, energy: -20 },
    trains: {},
    upgrades: [
      { id: "diagnostics", name: "Diagnostics", cost: 10000, note: "problems are found before they are emergencies" },
      { id: "surgery", name: "Surgical theatre", cost: 16000, note: "procedures on site; cheaper and safer" },
      { id: "organ_farm", name: "Organ farm", cost: 22000, note: "grow the parts instead of buying them", needs_level: 2 },
    ],
    pleases: ["paternalist", "transformation"],
  },
  {
    id: "schoolroom", name: "The Schoolroom",
    blurb: "Teaching, on the theory that it pays.",
    look: "rows, a board, and better light than the corridor outside",
    build_cost: 9000, capacity_per_level: 6, level_cost: 7000, upkeep_per_slot: 90,
    manager: { title: "Schoolteacher", skill: "teacher", careers: ["teacher", "professor", "tutor"], min_devotion: 30, effect: "everyone in the room learns roughly twice as fast" },
    work: "learn in the schoolroom", income: "none",
    psyche: { relaxation: 0.5, wear: 0.4, health: 0, energy: 15 },
    trains: { oral: 1.0, vaginal: 1.0, anal: 1.0, entertainment: 1.0, whoring: 1.0 },
    upgrades: [
      { id: "remedial", name: "Remedial track", cost: 8000, note: "the illiterate stop being illiterate" },
      { id: "advanced", name: "Advanced curriculum", cost: 12000, note: "skills past competence", needs_level: 2 },
    ],
    pleases: ["professionalism", "paternalist", "chinese"],
  },
  {
    id: "servants", name: "Servants' Quarters",
    blurb: "The people who keep the rest of it running.",
    look: "a dormitory, a laundry, and a service corridor to everywhere",
    build_cost: 7000, capacity_per_level: 8, level_cost: 5000, upkeep_per_slot: 50,
    manager: { title: "Stewardess", skill: "stewardess", careers: ["housekeeper", "butler", "hotel manager"], min_devotion: 30, effect: "the household's upkeep drops and nothing goes missing" },
    work: "work as a servant", income: "none",
    psyche: { relaxation: 0.1, wear: -0.2, health: 0, energy: 30 },
    trains: {},
    upgrades: [{ id: "machines", name: "Labour machinery", cost: 9000, note: "fewer bodies for the same work" }],
  },
  {
    id: "master_suite", name: "The Master Suite",
    blurb: "Your rooms, and whoever lives in them.",
    look: "the top of the residential spire, and the only quiet on it",
    build_cost: 14000, capacity_per_level: 4, level_cost: 10000, upkeep_per_slot: 250,
    manager: { title: "Concubine", skill: "concubine", careers: ["courtesan", "wife", "escort"], min_devotion: 60, effect: "runs the suite, and the arcology reads her as your consort" },
    work: "please you", income: "none",
    psyche: { relaxation: 1.0, wear: 1.0, health: 1, energy: 25 },
    trains: { oral: 0.8, vaginal: 0.8, anal: 0.6, entertainment: 0.6 },
    upgrades: [
      { id: "luxury", name: "Furnishing", cost: 12000, note: "the suite settles people faster" },
      { id: "pit", name: "Sunken bath", cost: 9000, note: "health, and a place for more than two" },
    ],
    pleases: ["paternalist", "arabian"],
  },
  {
    id: "nursery", name: "The Nursery",
    blurb: "Where the children go.",
    look: "cots, a play floor, and staff who were chosen for patience",
    build_cost: 12000, capacity_per_level: 8, level_cost: 8000, upkeep_per_slot: 180,
    manager: { title: "Matron", skill: "matron", careers: ["nanny", "teacher", "nurse", "mother"], min_devotion: 50, effect: "children raised here grow up as somebody rather than as stock" },
    work: "work as a servant", income: "none",
    psyche: { relaxation: 0.8, wear: 0.8, health: 1, energy: 25 },
    trains: {},
    upgrades: [{ id: "school", name: "Early schooling", cost: 11000, note: "they arrive at fourteen already educated" }],
    pleases: ["repopulation", "gender_fundamentalist", "paternalist"],
  },
  {
    id: "incubator", name: "The Incubator",
    blurb: "Gestation without a mother, and growth without a childhood.",
    look: "a bank of tanks, lit from underneath, each with a name card",
    build_cost: 25000, capacity_per_level: 4, level_cost: 15000, upkeep_per_slot: 400,
    work: "rest", income: "none",
    psyche: { relaxation: 0, wear: 0, health: 0, energy: 0 },
    trains: {},
    upgrades: [
      { id: "speed", name: "Accelerated growth", cost: 20000, note: "years become weeks; nothing about that is free" },
      { id: "conditioning", name: "Conditioning suite", cost: 18000, note: "they come out already shaped", needs_level: 2 },
    ],
    pleases: ["eugenics", "transformation"],
  },
  {
    id: "pit", name: "The Pit",
    blurb: "Fights, for money and for the crowd.",
    look: "sand, a rail, and standing room for four hundred",
    build_cost: 9000, capacity_per_level: 4, level_cost: 6000, upkeep_per_slot: 60,
    work: "fight in the pit", income: "customers",
    psyche: { relaxation: -1.2, wear: -1.2, health: -6, energy: 50 },
    trains: { combat: 3.0 },
    upgrades: [
      { id: "seating", name: "Seating", cost: 8000, note: "a bigger gate" },
      { id: "lethal", name: "Lethal bouts", cost: 0, note: "the crowd pays double and you lose people" },
    ],
    pleases: ["roman", "aztec", "degradationist"],
  },
  {
    id: "barracks", name: "The Barracks",
    blurb: "Your own soldiers, and somewhere to keep them.",
    look: "a drill floor, an armoury, and men who watch you cross it",
    build_cost: 16000, capacity_per_level: 4, level_cost: 10000, upkeep_per_slot: 120,
    manager: { title: "Bodyguard", skill: "bodyguard", careers: ["soldier", "bodyguard", "mercenary", "police officer"], min_devotion: 60, effect: "stands between you and the thing that was going to happen" },
    work: "guard you", income: "none",
    psyche: { relaxation: 0.2, wear: 0.2, health: 0, energy: 35 },
    trains: { combat: 2.0 },
    upgrades: [
      { id: "drones", name: "Security drones", cost: 14000, note: "arcology security up" },
      { id: "armory", name: "Armoury", cost: 12000, note: "your people survive the bad week" },
    ],
  },
];

export const FACILITY_BY_ID: Record<string, FacilityDef> = Object.fromEntries(FACILITIES.map((f) => [f.id, f]));
