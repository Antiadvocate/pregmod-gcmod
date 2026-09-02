/**
 * THE FORGE, OFFLINE HALF — a whole person, with no model in the loop.
 *
 * This is deliberately the primary path, not the fallback. Warp runs with no API key at all: you
 * get bodies, histories, temperaments, nervous systems and market prices out of a seeded stream,
 * and the game is complete. When a model IS configured, engine/forge.ts takes what this produced
 * and writes the interior over the top of it — voice, texture, the specific memory that explains
 * the temperament — because a model handed a concrete sketch writes a person, and a model handed
 * an empty prompt writes the average of everyone it has ever read.
 *
 * The body-first order matters. Nationality picks the palette; age and career pick the history;
 * the history picks the temperament; the temperament picks the resting point. Generate in the
 * other direction and you get forty women who are all quietly "guarded but kind" with randomised
 * hair, which is what most character generators produce and why they all feel the same.
 */
import type { Body, Bond, Health, Person, Persona, Psyche, Skills, Womb, Pronouns } from "./types";
import { NATIONS, CAREERS, ORIGINS, NATION_WEIGHT, type Nation } from "../data/people";
import { newPsyche, clamp } from "./psyche";
import { rng, type Rng } from "./rng";

let seq = 0;
export function personId(): string { return `p${Date.now().toString(36)}${(seq++).toString(36)}`; }

export interface GenOptions {
  seed?: number | string;
  nation?: string;
  age?: number;
  /** "female" | "male" | "futa" — the arrangement of parts, before any surgery. */
  sex?: "female" | "male" | "futa";
  career?: string;
  origin?: string;
  week?: number;
  /** Bias the roll toward better or worse stock: markets differ, and so should what they hold. */
  quality?: number;   // −1 … +1
  central?: boolean;
}

export function generatePerson(opts: GenOptions = {}): Person {
  const r = rng(opts.seed ?? Math.floor(Math.random() * 1e9));
  const nation = opts.nation
    ? NATIONS.find((n) => n.name === opts.nation) ?? r.weighted(NATIONS, (n) => n.weight)
    : r.weighted(NATIONS, (n) => n.weight / NATION_WEIGHT);
  const q = clamp(opts.quality ?? 0, -1, 1);
  const sex = opts.sex ?? (r.chance(0.86) ? "female" : r.chance(0.6) ? "futa" : "male");
  const age = opts.age ?? Math.round(clamp(r.normal(23, 5), 18, 46));
  const female = sex !== "male";
  const pronouns: Pronouns = female ? "she/her" : "he/him";

  const name = r.pick(female ? nation.female : nation.male);
  const surname = r.pick(nation.surnames);
  const careerRec = opts.career
    ? CAREERS.find((c) => c.name === opts.career) ?? r.pick(CAREERS)
    : r.pick(CAREERS);
  const originRec = opts.origin ? ORIGINS.find((o) => o.how === opts.origin) ?? r.pick(ORIGINS) : r.pick(ORIGINS);

  const body = generateBody(r, nation, age, sex, q);
  const persona = generatePersona(r, careerRec, originRec, q);
  const psyche = generatePsycheFrom(r, originRec, persona);
  const skills = generateSkills(r, careerRec, age, q);

  const health: Health = {
    health: Math.round(clamp(r.normal(20 + q * 25, 22), -60, 90)),
    energy: Math.round(clamp(r.normal(70, 12), 20, 100)),
    attrition: Math.max(0, Math.round(r.normal(age > 30 ? 12 : 4, 6))),
    illness: r.chance(0.08) ? (r.int(1, 2) as 1 | 2) : 0,
    drugs: [],
    curatives: 0,
    aphrodisiacs: 0,
    addiction: 0,
    injuries: [],
    recovery_weeks: 0,
    diet: "healthy",
  };

  const womb: Womb = {
    fertility: female ? Math.round(clamp(r.normal(70 - Math.max(0, age - 30) * 2.5, 15), 0, 100)) : 0,
    cycle_day: r.int(0, 27),
    fertile_known: false,
    fetuses: [],
    weeks: 0,
    contraceptives: false,
    sterile: !female || r.chance(0.05),
    births: age > 24 && r.chance(0.2) ? r.int(1, 2) : 0,
    miscarriages: 0,
    abortions: 0,
    sired_by: {},
  };

  const bond: Bond = {
    bond: originRec.bond + Math.round(r.normal(0, 6)),
    fear: clamp(Math.round(r.normal(18, 10) - originRec.trust * 0.3), 0, 100),
    resentment: clamp(Math.round(-originRec.devotion * 0.9 + r.normal(10, 8)), 0, 100),
    hope: clamp(Math.round(r.normal(35, 14) + originRec.devotion * 0.4), 0, 100),
    weeks_since_kindness: 4,
    weeks_since_cruelty: 4,
    read: { devotion: 0, trust: 0, label: "careless" },
  };

  const p: Person = {
    id: personId(),
    name,
    surname,
    pronouns,
    age,
    birth_week: (opts.week ?? 0) - age * 52,
    physical_age: age,
    origin: {
      nationality: nation.name,
      race: nation.race,
      career: careerRec.name,
      background: `${careerRec.arrives}; ${originRec.line}`,
      acquired_week: opts.week ?? 0,
      acquired_how: originRec.how,
    },
    body,
    psyche,
    persona,
    skills,
    health,
    womb,
    bond,
    assignment: "rest",
    rules_exempt: false,
    rules_applied: [],
    status: "owned",
    clothes: "no clothing",
    collar: "none",
    shoes: "none",
    chastity: { vagina: false, anus: false, penis: false },
    economics: {
      price_paid: 0, weeks_owned: 0, income_last_week: 0, income_lifetime: 0,
      upkeep_last_week: 0, upkeep_lifetime: 0, customers_last_week: 0,
    },
    fame: { prestige: 0, why: "", porn_fame: 0, porn_focus: "" },
    counters: {},
    central: opts.central ?? false,
  };
  return p;
}

function generateBody(r: Rng, nation: Nation, age: number, sex: "female" | "male" | "futa", q: number): Body {
  const female = sex !== "male";
  const height = Math.round(clamp(r.normal(nation.height + (female ? 0 : 13), 7), 140, 205));
  const face = Math.round(clamp(r.normal(52 + q * 18, 15), 5, 99));
  const boobs = female ? Math.round(clamp(r.normal(450 + q * 120, 220), 0, 2000)) : r.chance(0.1) ? 200 : 0;
  const weight = Math.round(clamp(r.normal(q * -6, 22), -60, 80));
  const bmi = 21 + weight * 0.09;
  const weight_kg = Math.round((bmi * (height / 100) ** 2) * 10) / 10;

  const skin = r.pick(nation.skin);
  const hair = r.pick(nation.hair);
  const eyes = r.pick(nation.eyes);
  const hairLen = Math.round(clamp(r.normal(35, 22), 0, 120));

  const body: Body = {
    height_cm: height,
    weight_kg,
    weight,
    muscle: Math.round(clamp(r.normal(5, 18), -60, 80)),
    face,
    face_shape: female ? r.pick(["normal", "normal", "cute", "sensual", "exotic", "androgynous"] as const) : r.pick(["masculine", "androgynous", "normal"] as const),
    boobs,
    boob_implant: 0,
    nipples: r.pick(["cute", "cute", "tiny", "puffy", "huge", "inverted"] as const),
    areolae: r.int(0, 2) as 0 | 1 | 2,
    butt: Math.round(clamp(r.normal(female ? 3 : 2, 1.4), 0, 10)),
    butt_implant: 0,
    hips: r.pick([-1, 0, 0, 1, 1, 2] as const),
    waist: Math.round(clamp(r.normal(female ? -20 : 10, 25), -100, 100)),
    shoulders: r.pick([-1, 0, 0, 1] as const),
    vagina: female ? r.int(0, 3) : null,
    vagina_lube: female ? (r.int(0, 1) as 0 | 1) : 0,
    clit: female ? (r.chance(0.85) ? 0 : 1) : 0,
    labia: female ? (r.int(0, 2) as 0 | 1 | 2) : 0,
    hymen: female && r.chance(0.18),
    dick: sex === "female" ? null : r.int(2, 5),
    balls: sex === "female" ? null : r.int(2, 4),
    prostate: sex === "female" ? 0 : 1,
    anus: r.int(0, 2),
    lactation: 0,
    lactation_weeks: 0,
    belly: 0,
    belly_implant: 0,
    belly_sag: 0,
    skin,
    hair_color: hair,
    hair_length: hairLen,
    hair_style: r.pick(["loose", "in a braid", "tied back", "cropped short", "shoulder-length and untidy", "pinned up"]),
    pubic_hair: r.pick(["neat", "waxed", "hairless", "in a strip", "bushy"] as const),
    eye_color: eyes,
    eyes: r.chance(0.08) ? "nearsighted" : "normal",
    ears: "normal",
    voice: female ? 3 : 1,
    teeth: r.chance(0.12) ? "crooked" : "normal",
    marks: [],
    appearance_facts: "",
    appearance_now: "",
  };
  body.appearance_facts = describeBody(body, nation, age);
  body.appearance_now = "wearing whatever she arrived in";
  return body;
}

/** The bedrock look, as one sentence a narrator and a diffusion model can both use. Appended to,
 *  never rewritten — a permanent change adds a clause; nothing edits the original. */
export function describeBody(b: Body, nation: Nation, age: number): string {
  const build = b.weight > 30 ? "heavy" : b.weight > 10 ? "soft" : b.weight < -25 ? "thin to the point of it showing" : b.muscle > 30 ? "visibly strong" : "average build";
  const chest = b.boobs > 1200 ? "enormous breasts" : b.boobs > 700 ? "big breasts" : b.boobs > 350 ? "full breasts" : b.boobs > 100 ? "small breasts" : "flat-chested";
  const hair = b.hair_length > 60 ? `long ${b.hair_color} hair` : b.hair_length > 20 ? `${b.hair_color} hair to the shoulder` : `short ${b.hair_color} hair`;
  return `${age}, ${nation.name}, ${b.height_cm}cm, ${build}. ${b.skin} skin, ${hair}, ${b.eye_color} eyes. ${chest}.`;
}

function generatePersona(r: Rng, career: (typeof CAREERS)[number], origin: (typeof ORIGINS)[number], q: number): Persona {
  const style = r.weighted(
    ["secure", "anxious", "avoidant", "disorganized"] as const,
    (s) => (s === "secure" ? 5 : s === "anxious" ? 3.5 : s === "avoidant" ? 3 : 1.5));

  const underThreat = {
    secure: "says what is wrong, once, and then deals with it",
    anxious: "pursues, explains, re-checks, and cannot leave it alone",
    avoidant: "goes flat and finds a reason to be somewhere else",
    disorganized: "reaches for whoever is nearest and flinches from them in the same motion",
  }[style];
  const soothed = {
    secure: "being told the truth about what is going to happen",
    anxious: "somebody staying in the room",
    avoidant: "being left alone for an afternoon and not asked about it after",
    disorganized: "predictability — the same thing, at the same time, for weeks",
  }[style];

  const traitPool = [
    "answers a question with a joke first and the real answer only if you wait her out",
    "watches hands, not faces",
    "tidies whatever is in reach when a conversation gets difficult",
    "counts things under her breath",
    "agrees out loud and does it her own way",
    "asks a question back instead of answering one",
    "goes very still before she says something that costs her",
    "makes herself useful the moment she is frightened",
    "keeps a private ledger of who owes whom",
    "touches people on the arm to end a conversation",
    "laughs at the wrong moment and knows it",
    "will not eat in front of anyone she does not know",
    "learns everybody's name in a room within an hour",
    "repeats an instruction back before she follows it",
  ];
  const valuePool = ["not being lied to", "her own privacy", "being useful", "her family, wherever they are",
    "getting through it intact", "the people she came in with", "not owing anyone", "being good at something",
    "keeping her word", "her own body", "one day being somewhere else"];
  const texturePool = ["always cold", "knows a great deal about birds", "hums when she thinks nobody is listening",
    "cannot sleep with a door open", "counts stairs", "reads whatever is left lying around", "afraid of the lifts",
    "good with her hands", "sings badly and often", "keeps a plant alive"];

  return {
    background: `A ${career.name}. ${career.arrives.replace(/^(with|still|already|expecting|slotting|waiting|assessing|praying|on|having|somewhere)/, (m) => m)}.`,
    life_history: "",
    core_traits: r.shuffle([...traitPool]).slice(0, 3),
    values: r.shuffle([...valuePool]).slice(0, 2),
    speech_pattern: r.pick([
      "short sentences, and a long pause before the ones that matter",
      "talks around a thing three times before naming it",
      "polite in a way that is its own kind of distance",
      "fast, and interrupts herself",
      "answers exactly the question asked and nothing more",
      "warm and a little too familiar, on purpose",
    ]),
    attachment: { style, under_threat: underThreat, soothed_by: soothed },
    conscience: clamp(+r.normal(0.68, 0.2).toFixed(2), 0.05, 1),
    intelligence: r.weighted(["impaired", "slow", "average", "sharp", "brilliant"] as const,
      (i) => (i === "average" ? 5 : i === "sharp" ? 3 : i === "slow" ? 2.5 : i === "brilliant" ? 1 : 0.8)),
    education: clamp(Math.round(r.normal(40 + (career.smart ?? 0) * 15 + q * 10, 20)), 0, 100),
    texture: r.shuffle([...texturePool]).slice(0, 2),
    attracted_to: r.weighted(["men", "women", "anyone", "no one"] as const,
      (a) => (a === "men" ? 5 : a === "women" ? 2 : a === "anyone" ? 2.5 : 0.4)),
    taste: r.pick([
      "tall, quiet, and older than her",
      "somebody competent doing their job well",
      "soft, warm, and safe to be near",
      "anyone who is obviously dangerous, which she knows is a problem",
      "clever above everything; she has to be interested before anything else happens",
      "familiar — she wants somebody who reminds her of home",
    ]),
    fetishes: r.chance(0.45) ? [{ name: r.pick(["submission", "dominance", "being watched", "pregnancy", "humiliation", "cuddling", "pain", "buttslut", "oral fixation"]), strength: r.int(20, 70), known: false }] : [],
    gregariousness: +clamp(r.normal(0.5, 0.22), 0.02, 1).toFixed(2),
  };
}

/** The resting point comes from who they are and how they arrived — not from a flat roll.
 *  Somebody taken off a street starts braced; somebody who signed the paperwork does not. */
function generatePsycheFrom(r: Rng, origin: (typeof ORIGINS)[number], persona: Persona): Psyche {
  const base = r.normal(0.5, 2.2);
  const originPull = origin.trust / 22;            // −1.8 … +0.5
  const styleShift = persona.attachment.style === "secure" ? 0.8 : persona.attachment.style === "anxious" ? -0.6 : persona.attachment.style === "disorganized" ? -1.1 : -0.3;
  const capacity = +clamp(base + originPull + styleShift, -6, 6).toFixed(2);
  const recovery = +clamp(r.normal(0.18, 0.08), 0.02, 0.45).toFixed(3);
  const p = newPsyche(capacity, recovery);
  // Arrival is not a resting state: they get here braced by however they got here.
  p.relaxation = +clamp(capacity + origin.trust / 18, -10, 10).toFixed(2);
  p.prev_relaxation = p.relaxation;
  p.mood = origin.trust < -20 ? "braced" : "flat";
  p.libido = Math.round(clamp(r.normal(45, 18), 5, 100));
  return p;
}

function generateSkills(r: Rng, career: (typeof CAREERS)[number], age: number, q: number): Skills {
  const base = () => Math.round(clamp(r.normal(8 + q * 6 + (age - 18) * 0.7, 10), 0, 60));
  const s: Skills = {
    oral: base(), vaginal: base(), anal: Math.round(base() * 0.6), penetrative: Math.round(base() * 0.4),
    whoring: Math.round(base() * 0.5), entertainment: base(), combat: Math.round(base() * 0.3),
    management: {},
  };
  for (const [k, v] of Object.entries(career.skills)) {
    if (k === "management") { s.management.general = v; continue; }
    (s as unknown as Record<string, number>)[k] = clamp(((s as unknown as Record<string, number>)[k] ?? 0) + v, 0, 100);
  }
  return s;
}

/** A batch, for markets and for the opening roster. Seeded off one string so the same week always
 *  offers the same people until you change something. */
export function generateBatch(seed: string, n: number, opts: GenOptions = {}): Person[] {
  const out: Person[] = [];
  for (let i = 0; i < n; i++) out.push(generatePerson({ ...opts, seed: `${seed}:${i}` }));
  return out;
}
