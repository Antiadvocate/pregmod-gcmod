/**
 * POLICIES — the decisions that are about the arcology rather than about a person.
 *
 * Each one is a standing law with a purchase price, a weekly cost and an effect the weekly pass
 * reads. They are here rather than scattered through the passes for the same reason the doctrines
 * are: a policy screen that cannot tell you what a policy is doing is a policy screen nobody uses.
 *
 * `effect` is applied by engine/policies.ts. Everything in that switch is one line; anything that
 * needs more than a line belongs in its own module and gets a `custom` effect instead.
 */

export interface Policy {
  id: string;
  name: string;
  group: "law" | "civic" | "trade" | "household";
  blurb: string;
  /** One-off cost to enact. */
  cost: number;
  /** Weekly cost (negative) or income (positive). */
  weekly: number;
  /** What it does, read by engine/policies.ts. */
  effect: { kind: string; amount?: number };
  /** Doctrines that make this cheaper or that require it. */
  wants?: string[];
  /** Doctrines that will not stand for it. */
  refused_by?: string[];
}

export const POLICIES: Policy[] = [
  { id: "prop_registry", name: "Property registry", group: "law", cost: 6000, weekly: -120,
    blurb: "Every body in the arcology on a ledger, with a name and a holder.",
    effect: { kind: "rep", amount: 6 } },
  { id: "slave_courts", name: "Slave courts", group: "law", cost: 12000, weekly: -400,
    blurb: "A slave may bring a complaint. Most lose. The ones who win are remembered.",
    effect: { kind: "household_hope", amount: 4 }, wants: ["paternalist"], refused_by: ["degradationist"] },
  { id: "public_punishment", name: "Public punishment", group: "law", cost: 4000, weekly: -100,
    blurb: "It happens on the concourse, at shift change, where everyone is.",
    effect: { kind: "household_fear", amount: 5 }, wants: ["degradationist"], refused_by: ["paternalist"] },
  { id: "curfew", name: "Curfew", group: "law", cost: 3000, weekly: -300,
    blurb: "Nobody moves between the floors after midnight without a reason on paper.",
    effect: { kind: "crime", amount: -8 } },
  { id: "manumission", name: "Manumission scheme", group: "law", cost: 15000, weekly: -600,
    blurb: "A published price at which a slave may buy herself out. Almost nobody reaches it. The number matters anyway.",
    effect: { kind: "household_hope", amount: 9 }, wants: ["paternalist"], refused_by: ["eugenics"] },

  { id: "sanitation", name: "Public sanitation", group: "civic", cost: 9000, weekly: -500,
    blurb: "Water, waste, filters. The unglamorous half of a city.",
    effect: { kind: "household_health", amount: 3 } },
  { id: "clinics", name: "Citizen clinics", group: "civic", cost: 14000, weekly: -900,
    blurb: "Medicine for the people who live here, not only the ones you own.",
    effect: { kind: "prosperity", amount: 3 } },
  { id: "schools", name: "Citizen schools", group: "civic", cost: 16000, weekly: -1100,
    blurb: "An educated population is more productive and considerably harder to govern.",
    effect: { kind: "prosperity", amount: 4 }, wants: ["professionalism"], refused_by: ["dependency"] },
  { id: "festivals", name: "Festivals", group: "civic", cost: 5000, weekly: -700,
    blurb: "Three a year, on the concourse, at your expense.",
    effect: { kind: "rep", amount: 14 }, wants: ["roman", "aztec"] },
  { id: "surveillance", name: "Full surveillance", group: "civic", cost: 20000, weekly: -800,
    blurb: "Every corridor, every lift, and a room where somebody watches all of it.",
    effect: { kind: "crime", amount: -14 }, refused_by: ["paternalist"] },

  { id: "free_port", name: "Free port", group: "trade", cost: 18000, weekly: -200,
    blurb: "No tariff on transit. The volume more than covers it.",
    effect: { kind: "trade", amount: 0.25 } },
  { id: "slave_market_licence", name: "Licensed slave market", group: "trade", cost: 11000, weekly: 400,
    blurb: "Your arcology takes a cut of every sale made inside it.",
    effect: { kind: "market_discount", amount: 0.08 } },
  { id: "arms_trade", name: "Arms trade", group: "trade", cost: 22000, weekly: 900,
    blurb: "Lucrative, and it puts weapons within two floors of everybody who resents you.",
    effect: { kind: "crime", amount: 6 } },
  { id: "media", name: "Arcology media", group: "trade", cost: 13000, weekly: -300,
    blurb: "Your own channel, your own version of events.",
    effect: { kind: "rep", amount: 10 } },

  { id: "household_rations", name: "Cut household rations", group: "household", cost: 0, weekly: 600,
    blurb: "Feed them less. It saves a real amount of money.",
    effect: { kind: "household_health", amount: -4 }, refused_by: ["paternalist", "hedonist"] },
  { id: "uniforms", name: "Household uniform", group: "household", cost: 4000, weekly: -200,
    blurb: "Everyone in the same thing, and everyone visibly yours.",
    effect: { kind: "rep", amount: 5 } },
  { id: "rest_day", name: "One day off in seven", group: "household", cost: 0, weekly: -400,
    blurb: "Nobody works the seventh day. It costs you a seventh of everything they earn.",
    effect: { kind: "household_rest", amount: 1 }, wants: ["paternalist"] },
  { id: "quotas", name: "Production quotas", group: "household", cost: 2000, weekly: 0,
    blurb: "A number on the wall, and consequences under it.",
    effect: { kind: "household_push", amount: 1 }, refused_by: ["paternalist"] },
];

export const POLICY_BY_ID: Record<string, Policy> = Object.fromEntries(POLICIES.map((p) => [p.id, p]));
