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
    blurb: "Every slave in the arcology is registered with a name and an owner.",
    effect: { kind: "rep", amount: 6 } },
  { id: "slave_courts", name: "Slave courts", group: "law", cost: 12000, weekly: -400,
    blurb: "Slaves can bring complaints against owners in court. They rarely win.",
    effect: { kind: "household_hope", amount: 4 }, wants: ["paternalist"], refused_by: ["degradationist"] },
  { id: "public_punishment", name: "Public punishment", group: "law", cost: 4000, weekly: -100,
    blurb: "Slave punishments are carried out publicly on the concourse.",
    effect: { kind: "household_fear", amount: 5 }, wants: ["degradationist"], refused_by: ["paternalist"] },
  { id: "curfew", name: "Curfew", group: "law", cost: 3000, weekly: -300,
    blurb: "Nobody moves between floors after midnight without a permit.",
    effect: { kind: "crime", amount: -8 } },
  { id: "manumission", name: "Manumission scheme", group: "law", cost: 15000, weekly: -600,
    blurb: "Slaves can buy their freedom at a published price. Few ever manage it, but it gives them hope.",
    effect: { kind: "household_hope", amount: 9 }, wants: ["paternalist"], refused_by: ["eugenics"] },

  { id: "sanitation", name: "Public sanitation", group: "civic", cost: 9000, weekly: -500,
    blurb: "Water, waste disposal and air filtration.",
    effect: { kind: "household_health", amount: 3 } },
  { id: "clinics", name: "Citizen clinics", group: "civic", cost: 14000, weekly: -900,
    blurb: "Free medical care for citizens.",
    effect: { kind: "prosperity", amount: 3 } },
  { id: "schools", name: "Citizen schools", group: "civic", cost: 16000, weekly: -1100,
    blurb: "Free schooling. Educated citizens are more productive and harder to control.",
    effect: { kind: "prosperity", amount: 4 }, wants: ["professionalism"], refused_by: ["dependency"] },
  { id: "festivals", name: "Festivals", group: "civic", cost: 5000, weekly: -700,
    blurb: "You pay for three public festivals a year.",
    effect: { kind: "rep", amount: 14 }, wants: ["roman", "aztec"] },
  { id: "surveillance", name: "Full surveillance", group: "civic", cost: 20000, weekly: -800,
    blurb: "Cameras in every corridor and elevator, monitored around the clock.",
    effect: { kind: "crime", amount: -14 }, refused_by: ["paternalist"] },

  { id: "free_port", name: "Free port", group: "trade", cost: 18000, weekly: -200,
    blurb: "No tariffs on goods passing through. More trade makes up for it.",
    effect: { kind: "trade", amount: 0.25 } },
  { id: "slave_market_licence", name: "Licensed slave market", group: "trade", cost: 11000, weekly: 400,
    blurb: "You take a cut of every sale made in the arcology.",
    effect: { kind: "market_discount", amount: 0.08 } },
  { id: "arms_trade", name: "Arms trade", group: "trade", cost: 22000, weekly: 900,
    blurb: "Weapons manufacturing. Profitable, but it arms people who hate you.",
    effect: { kind: "crime", amount: 6 } },
  { id: "media", name: "Arcology media", group: "trade", cost: 13000, weekly: -300,
    blurb: "An arcology media channel that reports the news your way.",
    effect: { kind: "rep", amount: 10 } },

  { id: "household_rations", name: "Cut household rations", group: "household", cost: 0, weekly: 600,
    blurb: "Cheaper, smaller rations for slaves. Saves money.",
    effect: { kind: "household_health", amount: -4 }, refused_by: ["paternalist", "hedonist"] },
  { id: "uniforms", name: "Household uniform", group: "household", cost: 4000, weekly: -200,
    blurb: "All your slaves wear the same uniform.",
    effect: { kind: "rep", amount: 5 } },
  { id: "rest_day", name: "One day off in seven", group: "household", cost: 0, weekly: -400,
    blurb: "Slaves get one day off a week, costing a seventh of their income.",
    effect: { kind: "household_rest", amount: 1 }, wants: ["paternalist"] },
  { id: "quotas", name: "Production quotas", group: "household", cost: 2000, weekly: 0,
    blurb: "Slaves have work quotas and are punished for missing them.",
    effect: { kind: "household_push", amount: 1 }, refused_by: ["paternalist"] },
];

export const POLICY_BY_ID: Record<string, Policy> = Object.fromEntries(POLICIES.map((p) => [p.id, p]));
