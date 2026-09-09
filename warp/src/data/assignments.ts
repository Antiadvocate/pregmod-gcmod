/**
 * ASSIGNMENTS — what a week of this does.
 *
 * Every job in the arcology, facility or not, resolves to one record here. The weekly pass reads
 * income, wear and training off this table; nothing else knows what a whore is.
 *
 * `demands` is the honest half. The old game let you put a blind mute in the club and then wrote
 * around it in prose. A demand that is not met does not block the assignment — it costs, and the
 * report says which demand cost you, because being able to do a stupid thing and see the bill is
 * more interesting than not being allowed to.
 */
import type { Assignment } from "../engine/types";

export interface AssignmentDef {
  id: Assignment;
  label: string;
  /** Which drawer of the UI it lives in. */
  group: "household" | "facility" | "management" | "public" | "care";
  facility?: string;
  blurb: string;
  /** Base cash per week before beauty, skill, doctrine and facility multipliers. */
  base_income: number;
  /** Reputation per week. */
  rep: number;
  /** Nervous system, per week — see FacilityDef.psyche for the same fields. */
  psyche: { relaxation: number; wear: number; health: number; energy: number };
  trains: Partial<Record<string, number>>;
  /** Faculties the work needs. Unmet ones are reported and taxed, never forbidden. */
  demands?: ("see" | "hear" | "speak" | "walk" | "hold" | "think")[];
  /** Minimum read devotion for the job to go WELL. Below it the person does it badly, on purpose. */
  wants_devotion?: number;
}

export const ASSIGNMENTS: AssignmentDef[] = [
  { id: "rest", label: "Rest", group: "household", blurb: "Nothing. Which is sometimes the whole treatment.",
    base_income: 0, rep: 0, psyche: { relaxation: 0.8, wear: 0.8, health: 3, energy: -40 }, trains: {} },
  { id: "please you", label: "Please you", group: "household", blurb: "Yours, at hand, all week.",
    base_income: 0, rep: 4, psyche: { relaxation: 0.3, wear: 0.2, health: 0, energy: 25 },
    trains: { oral: 1.0, vaginal: 1.0, anal: 0.8, entertainment: 0.5 } },
  { id: "fucktoy", label: "Serve as a fucktoy", group: "household", blurb: "Available to the household, continuously.",
    base_income: 0, rep: 2, psyche: { relaxation: -0.9, wear: -1.0, health: -2, energy: 45 },
    trains: { oral: 1.2, vaginal: 1.2, anal: 1.2 } },
  { id: "house servant", label: "House servant", group: "household", blurb: "Cleaning, carrying, and being invisible.",
    base_income: 0, rep: 0, psyche: { relaxation: 0.1, wear: -0.2, health: 0, energy: 30 },
    trains: {}, demands: ["walk", "hold", "see"] },
  { id: "whore", label: "Whore on the streets", group: "public", blurb: "The promenade, without a room to take them to.",
    base_income: 900, rep: 3, psyche: { relaxation: -1.2, wear: -1.4, health: -4, energy: 50 },
    trains: { whoring: 1.8, oral: 1.2, vaginal: 1.2, anal: 0.8 }, demands: ["walk", "speak"] },
  { id: "public servant", label: "Serve the public", group: "public", blurb: "Free, to any citizen who asks. It buys goodwill.",
    base_income: 0, rep: 14, psyche: { relaxation: -1.0, wear: -1.2, health: -3, energy: 50 },
    trains: { oral: 1.0, vaginal: 1.0, anal: 1.0 }, demands: ["walk"] },
  { id: "classes", label: "Take classes", group: "care", blurb: "Learning, at your expense.",
    base_income: -150, rep: 0, psyche: { relaxation: 0.4, wear: 0.3, health: 0, energy: 20 },
    trains: { oral: 0.8, vaginal: 0.8, anal: 0.8, entertainment: 0.8, whoring: 0.8 }, demands: ["think"] },
  { id: "get treatment", label: "Get treatment", group: "care", blurb: "Whatever medicine you are paying for.",
    base_income: -300, rep: 0, psyche: { relaxation: 0.3, wear: 0.3, health: 7, energy: -10 }, trains: {} },
  { id: "recruit girls", label: "Recruit", group: "management", blurb: "Out in the world, finding the next one.",
    base_income: 0, rep: 2, psyche: { relaxation: 0.4, wear: 0.3, health: 0, energy: 35 },
    trains: { entertainment: 0.8 }, demands: ["speak", "walk", "think"], wants_devotion: 50 },
  { id: "be your agent", label: "Run a holding", group: "management", blurb: "Your interests, in somebody else's arcology.",
    base_income: 0, rep: 6, psyche: { relaxation: 0.5, wear: 0.5, health: 0, energy: 30 },
    trains: {}, demands: ["speak", "think"], wants_devotion: 70 },
  { id: "guard you", label: "Guard you", group: "management", facility: "barracks", blurb: "Between you and it.",
    base_income: 0, rep: 8, psyche: { relaxation: 0.2, wear: 0.2, health: 0, energy: 35 },
    trains: { combat: 2.0 }, demands: ["see", "walk", "hold"], wants_devotion: 60 },
  { id: "be your Head Girl", label: "Head Girl", group: "management", blurb: "Runs the household so you do not have to.",
    base_income: 0, rep: 10, psyche: { relaxation: 0.4, wear: 0.4, health: 0, energy: 40 },
    trains: {}, demands: ["speak", "think", "walk"], wants_devotion: 70 },
];

/** Facility work and manager posts are generated from the facility table so the two cannot drift.
 *  See data/facilities.ts — this only fills in what a facility record does not say. */
export const ASSIGNMENT_BY_ID: Record<string, AssignmentDef> = Object.fromEntries(ASSIGNMENTS.map((a) => [a.id, a]));

/** Everything a person could be doing, for the assignment picker. */
export function assignmentLabel(id: Assignment): string {
  return ASSIGNMENT_BY_ID[id]?.label ?? id.replace(/^be (the |your )?/, "").replace(/^(work|serve|rest|learn|get) /, "");
}
