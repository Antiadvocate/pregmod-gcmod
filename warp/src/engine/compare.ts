/**
 * THE COMPARISON — your arcology set beside its neighbours and the Old World.
 *
 * Everything here is read from the save: your culture's eight habits, the laws and policies in
 * force, prosperity, crime and security. A neighbour's habits come from its doctrines, pulled the
 * way tickCulture pulls yours; a neighbour that has never declared any is given two, seeded from
 * the save and its name, so it keeps the same character every time you look. The Old World is
 * fixed: slavery is illegal there, and it is only as prosperous and safe as its regions are stable.
 *
 * From those numbers come a typical household (a citizen woman and the slave who serves her, with
 * what each wears), how their lives go, and where each place is better or worse than yours.
 */
import type { Person, SaveState } from "./types";
import { clamp } from "./psyche";
import { cultureOf, DOCTRINE_PULL, NORMS, NORM_IDS, normLine, type Norm } from "./culture";
import { lawsOf } from "./court";
import { LAW_BY_ID } from "../data/laws";
import { POLICY_BY_ID } from "../data/policies";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { generatePerson } from "./generate";
import { garment } from "../data/wardrobe";
import { rng } from "./rng";

export interface Society {
  id: string;
  name: string;
  kind: "yours" | "neighbour" | "oldworld";
  /** Where it is, relative to you. */
  where: string;
  norms: Record<Norm, number>;
  prosperity: number;   // 0–200
  crime: number;        // 0–100
  security: number;     // 0–100
  doctrines: string[];
  /** Laws and policies, as a citizen would describe them. */
  laws: { name: string; text: string }[];
  /** A neighbour's feeling toward you, −100 … +100. */
  attitude?: number;
  /** What the narrator model dressed this household in, read from its laws; used while it still matches. */
  written?: Outfits;
}

/** A household's clothes as the narrator chose them, from the wardrobe's own names. */
export interface Outfits { citizen_clothes: string; citizen_shoes: string; husband: string; slave_clothes?: string; slave_collar?: string; slave_shoes?: string; slaves?: number }

/** What a society's laws and habits are, for telling whether a written household is still true. */
export function fingerprint(x: Society): string {
  return JSON.stringify([x.laws.map((l) => l.name + l.text), x.doctrines, NORM_IDS.map((n) => Math.round(x.norms[n] / 10)), Math.round(x.prosperity / 20)]);
}

/** Where a free city sits before anything pulls it: the numbers a new game starts at. */
const FREE_CITY: Record<Norm, number> = { cruelty: 10, exposure: 20, personhood: -20, reversal: -40, feet: 0, manumission: -20, modification: 10, order: 0 };
const OLD_WORLD: Record<Norm, number> = { cruelty: -60, exposure: -45, personhood: 85, reversal: -50, feet: -10, manumission: 100, modification: 0, order: 35 };

/** Doctrines that move a city's habits, in the order a neighbour's character is drawn from. */
const PULLING = Object.keys(DOCTRINE_PULL);

function neighbourDoctrines(s: SaveState, n: SaveState["arcology"]["neighbours"][number]): string[] {
  if (n.doctrines.length) return n.doctrines;
  const r = rng(`${s.id}:character:${n.id}`);
  const first = r.pick(PULLING);
  const rest = PULLING.filter((d) => d !== first && !DOCTRINE_BY_ID[first]?.excludes?.includes(d) && !DOCTRINE_BY_ID[d]?.excludes?.includes(first));
  return [first, r.pick(rest)];
}

/** A city's habits from its doctrines: the free-city start, pulled toward each doctrine's aims. */
function normsFrom(doctrines: string[]): Record<Norm, number> {
  const out = {} as Record<Norm, number>;
  for (const n of NORM_IDS) {
    // A doctrine is what a city is; the free-city start is only what's left where no doctrine reaches.
    const pulls = doctrines.map((d) => DOCTRINE_PULL[d]?.[n]).filter((v): v is number => v !== undefined);
    out[n] = Math.round(clamp(pulls.length ? FREE_CITY[n] * 0.3 + pulls.reduce((a, b) => a + b, 0) * 0.9 : FREE_CITY[n], -100, 100));
  }
  return out;
}

export function societies(s: SaveState): Society[] {
  const a = s.arcology;
  const yours: Society = {
    id: "yours", name: a.name, kind: "yours", where: "yours",
    norms: { ...cultureOf(s).norms }, prosperity: a.prosperity, crime: a.crime, security: a.security,
    doctrines: Object.entries(a.doctrines).filter(([, d]) => d.adoption >= 30).sort((x, y) => y[1].adoption - x[1].adoption).map(([id]) => id),
    laws: [
      ...lawsOf(s).map((x) => LAW_BY_ID[x.id]).filter(Boolean).map((l) => ({ name: l.name, text: l.text })),
      ...Object.keys(a.policies).filter((id) => a.policies[id] && POLICY_BY_ID[id]).map((id) => ({ name: POLICY_BY_ID[id].name, text: POLICY_BY_ID[id].blurb })),
    ],
  };
  const near = a.neighbours.map((n): Society => {
    const doctrines = neighbourDoctrines(s, n);
    const norms = normsFrom(doctrines);
    return {
      id: n.id, name: n.name, kind: "neighbour", where: `the arcology to the ${n.direction}`,
      norms, prosperity: n.prosperity, crime: Math.round(clamp(32 - norms.order * 0.25, 5, 70)), security: Math.round(clamp(45 + norms.order * 0.4, 10, 95)),
      doctrines, laws: doctrines.map((d) => DOCTRINE_BY_ID[d]).filter(Boolean).map((d) => ({ name: d.noun, text: d.creed })), attitude: n.attitude,
    };
  });
  const regions = Object.values(s.world?.regions ?? {});
  const stable = regions.length ? regions.reduce((t, r) => t + r.stability, 0) / regions.length : 50;
  const old: Society = {
    id: "oldworld", name: "The Old World", kind: "oldworld", where: "the countries outside the Free Cities",
    norms: { ...OLD_WORLD }, prosperity: Math.round(20 + stable * 0.5), crime: Math.round(clamp(75 - stable * 0.6, 10, 90)), security: Math.round(clamp(stable * 0.7, 10, 80)),
    doctrines: [],
    laws: [
      { name: "Abolition", text: "Owning a person is a crime. Debt bondage and trafficking go on anyway, out of sight." },
      { name: "Citizenship", text: "Everyone born there has a vote, a passport and a right to a trial, for what those are still worth." },
      { name: "Welfare", text: "Public hospitals and schools, underfunded and closing a district at a time." },
    ],
  };
  const all = [yours, ...near, old];
  for (const x of all) { const w = s.compare_written?.[x.id]; if (w && w.fp === fingerprint(x)) x.written = w.outfits; }
  return all;
}

/**
 * What the laws themselves say about clothes. The habits say how people dress by choice; a law that
 * says citizens go naked, or that slaves are covered, beats them. Read from the law's own words.
 */
export function lawDress(x: Society): { citizen?: "naked" | "covered"; slave?: "naked" | "covered"; barefoot?: boolean } {
  const out: ReturnType<typeof lawDress> = {};
  const NAKED = /\b((?:nobody|no one|no citizens?|no slaves?)\s+(?:may|shall|can|is allowed to|are allowed to)\s+(?:be\s+(?:dressed|clothed)|wear(?!\s+(?:shoes|heels|boots|sandals|collars?|jewel\w*|make-?up|hats?|gloves|veils?|masks?)\b))|naked|nude|nudity|unclothed|undressed|bare[- ]skinned|no cloth\w*|without cloth\w*|(?:may|must|can|shall)\s*not\s+(?:be\s+(?:dressed|clothed)|wear(?!\s+(?:shoes|heels|boots|sandals|collars?|jewel\w*|make-?up|hats?|gloves|veils?|masks?)\b))|cannot\s+(?:be\s+(?:dressed|clothed)|wear(?!\s+(?:shoes|heels|boots|sandals|collars?|jewel\w*|make-?up|hats?|gloves|veils?|masks?)\b))|forbidden\s+(?:to\s+wear|clothing)|clothing\s+is\s+(?:banned|forbidden|illegal))/i;
  const COVER = /\b(covered|modest\w*|must\s+(?:be\s+)?(?:dressed|clothed|wear)|decen\w+|uniform)/i;
  for (const l of x.laws) {
    for (const sentence of l.text.split(/(?<=[.;!?])\s+/)) {
      const everyone = /\b(everyone|everybody|all (?:people|persons|residents)|no one|nobody|anyone)\b/i.test(sentence);
      const citizens = everyone || /\bcitizens?\b|\bresidents?\b|\bfree (?:men|women|people)\b/i.test(sentence);
      const slaves = everyone || /\bslaves?\b|\bchattel\b/i.test(sentence);
      const how = NAKED.test(sentence) ? "naked" : COVER.test(sentence) ? "covered" : undefined;
      if (how && citizens) out.citizen = how;
      if (how && slaves) out.slave = how;
      if (/\bbarefoot|bare feet|no shoes\b|not\s+wear\s+(?:shoes|heels|boots|sandals)/i.test(sentence) && slaves) out.barefoot = true;
    }
  }
  return out;
}

/* ── the household ───────────────────────────────────────────────────────────────────────────── */

export interface Household {
  citizen: { clothes: string; shoes: string; line: string };
  /** What her husband wears, in words: the art draws only women, so he lives in the text and the photo prompt. */
  husband: string;
  /** Undefined in the Old World, where there are no slaves to draw. */
  slave?: { clothes: string; collar: string; shoes: string; line: string };
  /** Slaves in a middling citizen household. */
  slaves: number;
  family: string;
}

const has = (x: Society, d: string) => x.doctrines.includes(d);

export function household(x: Society): Household {
  const h = householdByHabit(x);
  const law = lawDress(x);
  if (law.citizen === "naked") { h.citizen.clothes = "no clothing"; h.citizen.shoes = "barefoot"; h.husband = "nothing at all, as the law requires"; }
  else if (law.citizen === "covered" && GARMENT_KIND(h.citizen.clothes) !== "modest") h.citizen.clothes = "conservative clothing";
  if (h.slave && law.slave === "naked") { h.slave.clothes = "no clothing"; h.slave.shoes = "barefoot"; }
  else if (h.slave && law.slave === "covered" && ["bare", "lingerie", "swim"].includes(GARMENT_KIND(h.slave.clothes) ?? "")) h.slave.clothes = "household uniform";
  if (h.slave && law.barefoot) h.slave.shoes = "barefoot";
  const w = x.written;
  if (w) {
    h.citizen.clothes = w.citizen_clothes; h.citizen.shoes = w.citizen_shoes; h.husband = w.husband;
    if (h.slave && w.slave_clothes) { h.slave.clothes = w.slave_clothes; h.slave.collar = w.slave_collar ?? h.slave.collar; h.slave.shoes = w.slave_shoes ?? h.slave.shoes; }
    if (w.slaves !== undefined && x.kind !== "oldworld") h.slaves = w.slaves;
  }
  h.citizen.line = h.citizen.clothes === "no clothing" ? "A citizen woman, naked." : `A citizen woman in ${h.citizen.clothes}${h.citizen.shoes === "heels" ? " and heels" : ""}.`;
  if (h.slave) h.slave.line = `Her slave, ${h.slave.clothes === "no clothing" ? "naked" : `in ${h.slave.clothes}`}, wearing ${h.slave.collar}${h.slave.shoes === "barefoot" ? ", barefoot" : ""}.`;
  return h;
}

const GARMENT_KIND = (name: string) => garment(name)?.kind;

function householdByHabit(x: Society): Household {
  const n = x.norms;
  if (x.kind === "oldworld") {
    return {
      citizen: { clothes: "a t-shirt and jeans", shoes: "flats", line: "A woman in jeans and a t-shirt, on her way to a job that pays less every year." },
      husband: "a worn work jacket and jeans",
      slaves: 0,
      family: "A couple and their children in a rented flat. Nobody in the family owns anybody. Some of the people who clean their building are paying off a debt to whoever smuggled them in, and nobody asks.",
    };
  }
  const rich = x.prosperity >= 90;
  const citizenClothes = has(x, "roman") ? "a toga" : has(x, "chattel_religion") ? "a habit" : has(x, "egyptian") ? "silks"
    : n.exposure >= 70 ? "slutty business attire" : n.exposure >= 45 ? "a mini dress" : n.exposure <= -25 || has(x, "professionalism") ? "conservative clothing"
    : rich ? "nice business attire" : "a t-shirt and jeans";
  const slaveClothes = has(x, "chattel_religion") && n.exposure < 50 ? "a penitent nun's habit" : has(x, "roman") && n.exposure < 50 ? "a skimpy loincloth" : has(x, "egyptian") && n.exposure < 50 ? "silks"
    : n.exposure >= 50 ? (has(x, "hedonist") ? "body oil" : "no clothing")
    : n.cruelty >= 55 && n.personhood <= -35 ? "chains"
    : n.personhood >= 35 || has(x, "professionalism") ? (n.exposure >= 20 ? "a nice nurse outfit" : "household uniform")
    : n.exposure >= 15 ? "a slutty maid outfit"
    : n.exposure <= -20 ? "a plain shift" : "household uniform";
  const collar = n.personhood >= 45 ? "a silk ribbon" : n.cruelty >= 55 ? "a cruel leather collar" : n.order >= 45 ? "a shock collar" : has(x, "neo_imperial") || rich && n.personhood > 0 ? "a jewelled collar" : n.cruelty >= 25 ? "a heavy steel collar" : "a plain collar";
  const slaveShoes = n.feet >= 30 || n.cruelty >= 40 || slaveClothes === "no clothing" || slaveClothes === "body oil" || slaveClothes === "chains" ? "barefoot" : "flats";
  const citizenShoes = n.exposure >= 35 ? "heels" : rich ? "pumps" : "flats";
  const slaves = Math.round(clamp(x.prosperity / 45 - n.personhood / 50 + (n.cruelty > 30 ? 0.5 : 0), 0, 5));
  const slaveWord = slaves === 1 ? "one slave" : `${slaves} slaves`;
  const kept = n.personhood >= 35 ? "who has a room of her own and a day off a week" : n.personhood <= -35 ? "who sleeps on a mat by the kitchen door" : "who sleeps in the servants' room";
  return {
    citizen: { clothes: citizenClothes, shoes: citizenShoes, line: `A citizen woman in ${citizenClothes}${citizenShoes === "heels" ? " and heels" : ""}.` },
    husband: citizenClothes === "a toga" ? "a toga with a purple stripe" : citizenClothes === "a habit" ? "a priest's black cassock" : citizenClothes === "silks" ? "a linen kilt and a gold collar of office"
      : citizenClothes === "a t-shirt and jeans" ? "a jacket and jeans" : n.exposure >= 45 ? "an open-necked shirt and tailored trousers" : "a dark suit",
    slave: { clothes: slaveClothes, collar, shoes: slaveShoes, line: `Her slave, ${slaveClothes === "no clothing" ? "naked" : `in ${slaveClothes}`}, wearing ${collar}${slaveShoes === "barefoot" ? ", barefoot" : ""}.` },
    slaves,
    family: slaves
      ? `A citizen couple, their children, and ${slaveWord} ${slaves === 1 ? kept : kept.replace("who has a room", "who each have a room").replace("sleeps", "sleep")}. ${n.reversal >= 30 ? "One of the couple kneels to the household's favourite slave in private, and the neighbours find it romantic." : n.reversal <= -40 ? "Nobody in the family would dream of serving a slave." : ""}`.trim()
      : "A citizen couple and their children, too poor to keep a slave of their own. They rent one by the hour when they have guests.",
  };
}

/** A person for the art to draw: the same body every time for the same society and role, dressed for it. */
export function figureFor(x: Society, role: "citizen" | "slave"): Person | null {
  const h = household(x);
  const p = generatePerson({ seed: `${x.name} ${role} ${x.id} household`, sex: "female", age: role === "citizen" ? 34 : 22 });
  if (role === "citizen") { p.clothes = h.citizen.clothes; p.collar = "no collar"; p.shoes = h.citizen.shoes; return p; }
  if (!h.slave) return null;
  p.clothes = h.slave.clothes; p.collar = h.slave.collar; p.shoes = h.slave.shoes;
  return p;
}

/* ── their lives ─────────────────────────────────────────────────────────────────────────────── */

export function citizenLife(x: Society): string[] {
  const n = x.norms;
  const out: string[] = [];
  out.push(x.prosperity >= 120 ? "Money is easy. Most citizens have more than they spend." : x.prosperity >= 70 ? "Comfortable, if you work." : x.prosperity >= 40 ? "Getting by; rents are high and wages aren't." : "Poor, and getting poorer.");
  out.push(x.crime >= 45 ? "You lock your door and carry something in your bag." : x.crime >= 25 ? "Safe on the main concourses; less so at night in the lower blocks." : "Safe at any hour.");
  if (n.order !== 0) out.push(normLine("order", n.order));
  if (x.kind !== "oldworld") out.push(normLine("exposure", n.exposure));
  for (const l of x.laws.slice(0, 4)) out.push(`${l.name}: ${l.text}`);
  return out;
}

export function slaveLife(x: Society): string[] {
  if (x.kind === "oldworld") return ["There are no slaves in law. There are debt workers, trafficked women and prisoners in labour camps, and the law is slow to find them."];
  const n = x.norms;
  return [normLine("cruelty", n.cruelty), normLine("personhood", n.personhood), normLine("manumission", n.manumission), ...(Math.abs(n.modification) >= 15 ? [normLine("modification", n.modification)] : []), ...(Math.abs(n.feet) >= 15 ? [normLine("feet", n.feet)] : [])];
}

/* ── the scorecard ───────────────────────────────────────────────────────────────────────────── */

export interface Metric { id: string; who: "citizen" | "slave"; label: string; better: string; worse: string; score: (x: Society) => number }

/** 0–100, higher is better for the person named. */
export const METRICS: Metric[] = [
  { id: "wealth", who: "citizen", label: "Wealth", better: "richer", worse: "poorer", score: (x) => clamp(x.prosperity / 1.6, 0, 100) },
  { id: "safety", who: "citizen", label: "Safety", better: "safer", worse: "less safe", score: (x) => 100 - x.crime },
  { id: "liberty", who: "citizen", label: "Liberty", better: "freer to come and go", worse: "watched more closely", score: (x) => clamp(55 - x.norms.order / 2 - (x.laws.some((l) => /curfew/i.test(l.name)) ? 10 : 0), 0, 100) },
  { id: "service", who: "citizen", label: "Service", better: "better served", worse: "less served", score: (x) => clamp(household(x).slaves * 20, 0, 100) },
  { id: "treatment", who: "slave", label: "Treatment", better: "treated more gently", worse: "treated more harshly", score: (x) => clamp(50 - x.norms.cruelty / 2, 0, 100) },
  { id: "standing", who: "slave", label: "Standing", better: "seen more as a person", worse: "seen more as property", score: (x) => clamp(50 + x.norms.personhood / 2, 0, 100) },
  { id: "way_out", who: "slave", label: "A way out", better: "closer to freedom", worse: "further from freedom", score: (x) => clamp(50 + x.norms.manumission / 2, 0, 100) },
  { id: "covered", who: "slave", label: "Covered", better: "more covered", worse: "more exposed", score: (x) => clamp(50 - x.norms.exposure / 2, 0, 100) },
];

/** Where `other` beats yours and where yours beats it, by ten points or more. */
export function contrast(yours: Society, other: Society): { theirs: string[]; ours: string[] } {
  const theirs: string[] = [], ours: string[] = [];
  for (const m of METRICS) {
    if (m.who === "slave" && (yours.kind === "oldworld" || other.kind === "oldworld")) continue;
    const d = m.score(other) - m.score(yours);
    if (Math.abs(d) < 10) continue;
    const who = m.who === "citizen" ? "citizens" : "slaves";
    if (d > 0) theirs.push(`Their ${who} are ${m.better} (${Math.round(m.score(other))} to your ${Math.round(m.score(yours))}).`);
    else ours.push(`Your ${who} are ${m.better} (${Math.round(m.score(yours))} to their ${Math.round(m.score(other))}).`);
  }
  if (other.kind === "oldworld") ours.push(`Slavery is legal in ${yours.name}; in the Old World, the people who'd be your slaves are poor instead.`);
  for (const nm of other.kind === "oldworld" ? [] : ["reversal", "feet", "modification"] as Norm[]) {
    const d = other.norms[nm] - yours.norms[nm];
    if (Math.abs(d) >= 30) (d > 0 ? theirs : ours).push(`${NORMS[nm].name}: ${d > 0 ? other.name : yours.name} is more ${NORMS[nm].high} (${Math.round(Math.max(other.norms[nm], yours.norms[nm]))} to ${Math.round(Math.min(other.norms[nm], yours.norms[nm]))}).`);
  }
  return { theirs, ours };
}

/** The setting, for an image prompt. */
export function settingFor(x: Society): string {
  if (x.kind === "oldworld") return "a tired, ordinary Old World city street, cracked pavement, shuttered shops";
  const look = x.doctrines.map((d) => DOCTRINE_BY_ID[d]?.look).filter(Boolean)[0];
  return `the concourse of a luxurious futuristic arcology city${look ? `: ${look}` : ""}`;
}
