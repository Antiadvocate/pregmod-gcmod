/**
 * THE DOCTRINES — what your arcology has decided people are for.
 *
 * The old game shipped thirty-three of these, and each one was implemented as a spray of
 * conditionals across the whole codebase: a block in the weekly society pass, a block in every
 * slave's assessment, a block in the decoration code, a block per event. Adding a thirty-fourth
 * meant editing forty files, and the reason nobody could ever answer "why did my Supremacist
 * arcology dislike her" is that the answer was distributed across all of them.
 *
 * Here a doctrine is one record. It declares what it WANTS along nine shared axes, and one
 * scoring function (engine/society.ts) reads every doctrine against every person. The answer to
 * "why did it dislike her" is then a sentence the engine can generate rather than a thing you go
 * and read the source for.
 *
 * The nine axes are pregmod's own FSHumanDevelopmentVector, which was the right idea sitting
 * unused next to the conditionals. Each axis runs −1 … +1 and every doctrine names its pole.
 */

export type Axis =
  | "age"          // + mature, − young
  | "height"       // + statuesque, − petite
  | "weight"       // + decadent/soft, − ideal/lean
  | "modification" // + transformed, − pure
  | "assets"       // + expanded, − slim
  | "intelligence" // + educated professional, − dependent
  | "gender"       // + radical (dick on a girl), − fundamental (women as women)
  | "breeding"     // + repopulation, − eugenics
  | "quality"      // + paternalist, − degradationist
  ;

export interface Doctrine {
  id: string;
  noun: string;
  adj: string;
  /** One line, in the voice of somebody who believes it. */
  creed: string;
  /** What it wants of a body and a life, along the shared axes. Absent axis = indifferent. */
  wants: Partial<Record<Axis, number>>;
  /** Doctrines that cannot be held at the same time. Symmetric; declared once. */
  excludes?: string[];
  /** Rep per week at full adoption, before the population multiplier. */
  rep: number;
  /** Cash per week at full adoption. Some doctrines pay; most cost. */
  cash: number;
  /** Named policy switches this doctrine unlocks, and what each one does in one line. */
  policies?: { id: string; name: string; note: string; cost: number }[];
  /** What the arcology LOOKS like at high decoration, for the narrator. */
  look: string;
  /** Research unlock cost, when it has one. */
  research?: number;
}

export const DOCTRINES: Doctrine[] = [
  {
    id: "paternalist", noun: "Paternalism", adj: "Paternalist",
    creed: "A slave who is educated, healthy and unafraid is worth four who are not.",
    wants: { quality: 1, intelligence: 0.6 }, excludes: ["degradationist"],
    rep: 22, cash: -900, research: 15000,
    look: "clean lines, open galleries, water features, a great deal of glass",
    policies: [{ id: "rehab", name: "Rehabilitation clinics", note: "broken slaves recover faster and citizens approve", cost: 8000 }],
  },
  {
    id: "degradationist", noun: "Degradationism", adj: "Degradationist",
    creed: "They are property. Let the architecture say so, at volume.",
    wants: { quality: -1, modification: 0.5 }, excludes: ["paternalist"],
    rep: 18, cash: 400, research: 15000,
    look: "public restraints, exposed plumbing, screens showing what happens to the disobedient",
  },
  {
    id: "body_purist", noun: "Body Purism", adj: "Body Purist",
    creed: "Surgery is an admission that you could not find the real thing.",
    wants: { modification: -1 }, excludes: ["transformation"],
    rep: 20, cash: -400, research: 12000,
    look: "unretouched stone, natural light, nothing chromed",
  },
  {
    id: "transformation", noun: "Transformation Fetishism", adj: "Transformation Fetishist",
    creed: "The body is a draft.",
    wants: { modification: 1, assets: 0.5 }, excludes: ["body_purist"],
    rep: 20, cash: -600, research: 12000,
    look: "surgical white, display cases, before-and-after everywhere",
  },
  {
    id: "youth", noun: "Youth Preferentialism", adj: "Youth Preferentialist",
    creed: "Nothing after twenty-five is worth the rent.",
    wants: { age: -1 }, excludes: ["maturity"],
    rep: 18, cash: -200, research: 10000,
    look: "bright colours, school iconography, everything scaled a little small",
  },
  {
    id: "maturity", noun: "Maturity Preferentialism", adj: "Maturity Preferentialist",
    creed: "A woman who knows what she is doing.",
    wants: { age: 1 }, excludes: ["youth"],
    rep: 18, cash: -200, research: 10000,
    look: "dark wood, low light, the furniture of somebody's study",
  },
  {
    id: "slimness", noun: "Slimness Enthusiasm", adj: "Slimness Enthusiast",
    creed: "The line of a body, uninterrupted.",
    wants: { assets: -1, weight: -0.5 }, excludes: ["expansionist"],
    rep: 18, cash: -300, research: 10000,
    look: "narrow arches, tall mirrors, nothing upholstered",
  },
  {
    id: "expansionist", noun: "Asset Expansionism", adj: "Asset Expansionist",
    creed: "More.",
    wants: { assets: 1 }, excludes: ["slimness"],
    rep: 18, cash: -500, research: 10000,
    look: "wide doorways, reinforced seating, ceilings that had to be raised",
  },
  {
    id: "gender_radical", noun: "Gender Radicalism", adj: "Gender Radicalist",
    creed: "Sex is an arrangement of parts and the arrangement is yours to choose.",
    wants: { gender: 1, modification: 0.4 }, excludes: ["gender_fundamentalist"],
    rep: 20, cash: -400, research: 12000,
    look: "ambiguous statuary, mirrored corridors, signage with no pictograms",
  },
  {
    id: "gender_fundamentalist", noun: "Gender Fundamentalism", adj: "Gender Fundamentalist",
    creed: "Women are for bearing and pleasing. It is not complicated.",
    wants: { gender: -1, breeding: 0.5 }, excludes: ["gender_radical"],
    rep: 20, cash: -300, research: 12000,
    look: "soft furnishing, nurseries visible from the promenade, a great deal of pink",
  },
  {
    id: "physical_idealist", noun: "Physical Idealism", adj: "Physical Idealist",
    creed: "Strength is the only beauty that is also true.",
    wants: { weight: -1, modification: -0.3 }, excludes: ["hedonist"],
    rep: 20, cash: -700, research: 12000,
    look: "training floors on every level, chalk dust, weights as ornament",
  },
  {
    id: "hedonist", noun: "Decadent Hedonism", adj: "Hedonistic",
    creed: "Comfort, and then more comfort.",
    wants: { weight: 1, quality: 0.3 }, excludes: ["physical_idealist"],
    rep: 20, cash: -800, research: 12000,
    look: "cushions, steam, food within reach of every chair",
  },
  {
    id: "pastoralist", noun: "Pastoralism", adj: "Pastoralist",
    creed: "A woman produces. That is what she is.",
    wants: { assets: 0.7, breeding: 0.3 }, rep: 20, cash: 600, research: 12000,
    look: "dairy glass, tiled runoff channels, the smell of warm milk in the arcade halls",
    policies: [{ id: "milk_law", name: "Mandatory lactation", note: "every slave milks; citizens expect it", cost: 10000 }],
  },
  {
    id: "repopulation", noun: "Repopulation Focus", adj: "Repopulationist",
    creed: "Every womb in this arcology should be occupied.",
    wants: { breeding: 1 }, excludes: ["eugenics"],
    rep: 22, cash: -1200, research: 15000,
    look: "wide seating, birth suites off the main concourse, pregnancy as public ornament",
  },
  {
    id: "eugenics", noun: "Eugenics", adj: "Eugenicist",
    creed: "Breeding is a privilege and almost nobody has earned it.",
    wants: { breeding: -1, intelligence: 0.6 }, excludes: ["repopulation"],
    rep: 25, cash: 400, research: 18000,
    look: "registry offices, lineage displays, chastity as visible hardware",
  },
  {
    id: "professionalism", noun: "Slave Professionalism", adj: "Professional",
    creed: "An expert is worth twenty warm bodies.",
    wants: { intelligence: 1, quality: 0.4 }, excludes: ["dependency"],
    rep: 22, cash: -600, research: 15000,
    look: "libraries, practice rooms, a concert schedule posted at the lifts",
  },
  {
    id: "dependency", noun: "Intellectual Dependency", adj: "Dependent",
    creed: "Give them nothing to think with and they will never think of leaving.",
    wants: { intelligence: -1 }, excludes: ["professionalism"],
    rep: 20, cash: -400, research: 15000,
    look: "screens everywhere, no clocks, nothing to read",
  },
  {
    id: "petite", noun: "Petite Admiration", adj: "Petite Admirer",
    creed: "Small enough to pick up.",
    wants: { height: -1 }, excludes: ["statuesque"],
    rep: 18, cash: -300, research: 10000,
    look: "low counters, small doors, furniture built two thirds scale",
  },
  {
    id: "statuesque", noun: "Statuesque Glorification", adj: "Statuesque Glorifier",
    creed: "Look up at her.",
    wants: { height: 1 }, excludes: ["petite"],
    rep: 18, cash: -300, research: 10000,
    look: "raised plinths, double-height doorways, everything vertical",
  },
  {
    id: "supremacist", noun: "Racial Supremacism", adj: "Supremacist",
    creed: "One people, on top, permanently.",
    wants: {}, excludes: ["subjugationist", "multicultural"],
    rep: 20, cash: 0,
    look: "one face repeated in every mural",
  },
  {
    id: "subjugationist", noun: "Racial Subjugationism", adj: "Subjugationist",
    creed: "One people, underneath, permanently.",
    wants: {}, excludes: ["supremacist", "multicultural"],
    rep: 20, cash: 200,
    look: "segregated lifts, service corridors nobody else uses",
  },
  {
    id: "multicultural", noun: "Multiculturalism", adj: "Multiculturalist",
    creed: "Where they came from is not interesting.",
    wants: {}, excludes: ["supremacist", "subjugationist"],
    rep: 14, cash: 0,
    look: "flags of nowhere, food from everywhere",
  },
  {
    id: "chattel_religion", noun: "Chattel Religionism", adj: "Chattel Religionist",
    creed: "It is written that they serve, and gladly.",
    wants: { quality: 0.3, breeding: 0.3 }, rep: 24, cash: -500, research: 14000,
    look: "a temple on the top floor, service as liturgy, incense in the lift shafts",
  },
  {
    id: "roman", noun: "Roman Revivalism", adj: "Roman Revivalist",
    creed: "Bread, games, and a citizenry that knows its place in the order.",
    wants: { quality: 0.2, height: 0.2 }, excludes: ["egyptian", "edo", "arabian", "chinese", "aztec", "neo_imperial", "antebellum"],
    rep: 22, cash: -600,
    look: "colonnades, a working arena, water brought in on a visible aqueduct",
  },
  {
    id: "neo_imperial", noun: "Neo-Imperialism", adj: "Neo-Imperialist",
    creed: "A knight, a keep, and a household that answers to both.",
    wants: { quality: 0.2 }, excludes: ["roman", "egyptian", "edo", "arabian", "chinese", "aztec", "antebellum"],
    rep: 22, cash: -700,
    look: "heraldry over every doorway, a curtain wall around the residential ring",
  },
  {
    id: "egyptian", noun: "Egyptian Revivalism", adj: "Egyptian Revivalist",
    creed: "The bloodline is the state, and it must stay in the family.",
    wants: { breeding: 0.5 }, excludes: ["roman", "neo_imperial", "edo", "arabian", "chinese", "aztec", "antebellum"],
    rep: 22, cash: -600,
    look: "sandstone facing, a false river, colossi in the atrium",
  },
  {
    id: "edo", noun: "Edo Revivalism", adj: "Edo Revivalist",
    creed: "Restraint in everything visible. Everything else is private.",
    wants: { quality: 0.3, height: -0.2 }, excludes: ["roman", "neo_imperial", "egyptian", "arabian", "chinese", "aztec", "antebellum"],
    rep: 22, cash: -500,
    look: "paper screens, raked gravel, nothing raised above eye level",
  },
  {
    id: "arabian", noun: "Arabian Revivalism", adj: "Arabian Revivalist",
    creed: "A household, and everyone in it accounted for.",
    wants: { breeding: 0.3 }, excludes: ["roman", "neo_imperial", "egyptian", "edo", "chinese", "aztec", "antebellum"],
    rep: 22, cash: -500,
    look: "tiled courtyards, screened galleries, water running through every room",
  },
  {
    id: "chinese", noun: "Chinese Revivalism", adj: "Chinese Revivalist",
    creed: "Examinations, ministries, and a slave who has passed hers.",
    wants: { intelligence: 0.7 }, excludes: ["roman", "neo_imperial", "egyptian", "edo", "arabian", "aztec", "antebellum"],
    rep: 22, cash: -500,
    look: "ministry buildings, examination halls, lacquer and long horizontal roofs",
  },
  {
    id: "aztec", noun: "Aztec Revivalism", adj: "Aztec Revivalist",
    creed: "The sun is paid for.",
    wants: { quality: -0.4 }, excludes: ["roman", "neo_imperial", "egyptian", "edo", "arabian", "chinese", "antebellum"],
    rep: 22, cash: -600,
    look: "stepped terraces, a working altar on the top of them",
  },
  {
    id: "antebellum", noun: "Antebellum Revivalism", adj: "Antebellum Revivalist",
    creed: "The house, the grounds, and the people who keep both.",
    wants: { quality: -0.2, gender: -0.3 }, excludes: ["roman", "neo_imperial", "egyptian", "edo", "arabian", "chinese", "aztec"],
    rep: 22, cash: -500,
    look: "white columns, deep verandas, an enormous lawn that nothing is grown on",
  },
  {
    id: "cummunism", noun: "Cummunism", adj: "Cummunist",
    creed: "From each according to their output.",
    wants: { gender: 0.5, assets: 0.3 }, rep: 18, cash: 500, research: 12000,
    look: "collection points, production quotas posted publicly",
  },
  {
    id: "incest", noun: "Incest Fetishism", adj: "Incest Fetishist",
    creed: "Family is the closest anyone gets.",
    wants: { breeding: 0.4 }, rep: 16, cash: -300, research: 12000,
    look: "family portraits in the concourse, lineage charts as public art",
  },
];

export const DOCTRINE_BY_ID: Record<string, Doctrine> = Object.fromEntries(DOCTRINES.map((d) => [d.id, d]));

/** Doctrines that cannot coexist, resolved symmetrically — declaring it on one side is enough. */
export function conflictsWith(id: string): string[] {
  const out = new Set<string>(DOCTRINE_BY_ID[id]?.excludes ?? []);
  for (const d of DOCTRINES) if (d.excludes?.includes(id)) out.add(d.id);
  return [...out];
}

export const AXIS_LABEL: Record<Axis, [string, string]> = {
  age: ["young", "mature"],
  height: ["petite", "tall"],
  weight: ["lean", "soft"],
  modification: ["unaltered", "modified"],
  assets: ["slim", "expanded"],
  intelligence: ["dependent", "educated"],
  gender: ["conventional", "radical"],
  breeding: ["barren", "bearing"],
  quality: ["degraded", "cared for"],
};
