/**
 * DRESS CODES — how a whole city dresses, earned from its laws, its doctrines and its habits together.
 *
 * No single thing decides what people wear. A Decency Statute pulls toward office modesty; so does
 * Slave Professionalism; so does a city that already covers up. A code scores a point for every
 * source that backs it (a law counts most, a doctrine next, a habit least), and the city dresses by
 * the code with the most behind it. The sources are kept, so the screen can say what built the look.
 *
 * Each code names what a citizen woman, her husband and her slave wear. Clothes, collars and shoes
 * are the wardrobe's own names, so the figures can draw them.
 */
import type { Norm } from "../engine/culture";

export interface DressSignals {
  /** Ids of laws in force (built-in and your own), and `policy:<id>` for policies. */
  laws: string[];
  doctrines: string[];
  norms: Record<Norm, number>;
  prosperity: number;
}

export interface DressCode {
  id: string;
  name: string;
  /** One line on what it looks like on the concourse. */
  look: string;
  citizen: string;
  citizenShoes: string;
  husband: string;
  slave: string;
  collar?: string;
  slaveShoes?: string;
  /** Laws, doctrines and habits that back it, and how much each counts. */
  backers: { law?: string; doctrine?: string; norm?: Norm; above?: number; below?: number; weight: number; label: string }[];
}

const L = (law: string, label: string, weight = 3) => ({ law, label, weight });
const D = (doctrine: string, label: string, weight = 2) => ({ doctrine, label, weight });
const N = (norm: Norm, cmp: { above?: number; below?: number }, label: string, weight = 1.2) => ({ norm, ...cmp, label, weight });

export const DRESS_CODES: DressCode[] = [
  { id: "office", name: "Office modesty", look: "Citizens in tailoring, slaves in neat uniforms, hemlines below the knee.",
    citizen: "conservative clothing", citizenShoes: "pumps", husband: "a dark suit", slave: "conservative clothing", collar: "a satin choker", slaveShoes: "flats",
    backers: [L("decency_statute", "the Decency Statute"), D("professionalism", "Slave Professionalism"), N("exposure", { below: -20 }, "a modest city")] },
  { id: "open", name: "Open skin", look: "Skin is the fashion: citizens in almost nothing, slaves in nothing at all.",
    citizen: "slutty business attire", citizenShoes: "heels", husband: "an open silk shirt and tailored trousers", slave: "no clothing", collar: "a plain collar", slaveShoes: "barefoot",
    backers: [L("nudity_ordinance", "the Nudity Ordinance"), D("hedonist", "Decadent Hedonism"), N("exposure", { above: 45 }, "an open city", 1.5)] },
  { id: "livery", name: "Household livery", look: "Slaves wear their household's colours, well cut and kept clean; people ask their names.",
    citizen: "nice business attire", citizenShoes: "pumps", husband: "a dark suit", slave: "household uniform", collar: "a silk ribbon", slaveShoes: "flats",
    backers: [L("welfare_code", "the Slave Welfare Code"), L("slave_testimony", "the Slave Testimony Act", 2), D("paternalist", "Paternalism"), L("manumission_registry", "the Manumission Registry", 1.5), N("personhood", { above: 30 }, "a city that treats slaves as people")] },
  { id: "chattel", name: "Chattel display", look: "Slaves are shown the way property is shown: chained, marked, and on view.",
    citizen: "nice business attire", citizenShoes: "heels", husband: "a dark suit with a riding crop at his belt", slave: "chains", collar: "a cruel leather collar", slaveShoes: "barefoot",
    backers: [L("chattel_act", "the Chattel Act"), L("public_discipline", "the Public Discipline Act", 2.5), D("degradationist", "Degradationism"), D("subjugationist", "Racial Subjugationism", 1.2), D("dependency", "Intellectual Dependency", 1), N("cruelty", { above: 40 }, "a cruel city"), N("personhood", { below: -40 }, "a city of property")] },
  { id: "roman", name: "Roman dress", look: "Togas on the citizens, loincloths on the slaves, bronze on everyone's wrists.",
    citizen: "a toga", citizenShoes: "flats", husband: "a toga with a purple stripe", slave: "a skimpy loincloth", collar: "a heavy steel collar", slaveShoes: "barefoot",
    backers: [D("roman", "Roman Revivalism", 4)] },
  { id: "temple", name: "Temple habit", look: "Everyone is in religious dress; the slaves' habits are the plainest.",
    citizen: "a habit", citizenShoes: "flats", husband: "a priest's black cassock", slave: "a penitent nun's habit", collar: "a plain collar", slaveShoes: "barefoot",
    backers: [D("chattel_religion", "Chattel Religionism", 4)] },
  { id: "egyptian", name: "Egyptian linen", look: "White linen and gold; slaves in sheer silks and broad collars.",
    citizen: "silks", citizenShoes: "flats", husband: "a linen kilt and a gold collar of office", slave: "silks", collar: "an ancient Egyptian collar", slaveShoes: "barefoot",
    backers: [D("egyptian", "Egyptian Revivalism", 4)] },
  { id: "imperial", name: "Imperial order", look: "Braid, buttons and rank; slaves in livery with their owner's crest on a gold collar.",
    citizen: "nice business attire", citizenShoes: "boots", husband: "a braided dress uniform", slave: "household uniform", collar: "a heavy gold collar", slaveShoes: "flats",
    backers: [D("neo_imperial", "Neo-Imperialism", 3), L("curfew", "Curfew and Patrols", 1.5), N("order", { above: 40 }, "a strict city")] },
  { id: "barefoot", name: "Barefoot grace", look: "Slaves go barefoot on warm floors, soles oiled; citizens wear sandals to show they could.",
    citizen: "a halter top dress", citizenShoes: "flats", husband: "linen trousers and sandals", slave: "silks", collar: "a silk ribbon", slaveShoes: "barefoot",
    backers: [L("barefoot_statute", "the Barefoot Statute"), L("sole_protection", "the Sole Protection Act", 2), D("podolatry", "Podolatry"), N("feet", { above: 40 }, "a city that worships feet")] },
  { id: "kneeling", name: "Kneeling romance", look: "Slaves are dressed better than their owners; owners wear their slave's colours.",
    citizen: "conservative clothing", citizenShoes: "flats", husband: "a plain suit with his slave's ribbon at the lapel", slave: "an evening gown", collar: "a jewelled collar", slaveShoes: "heels",
    backers: [L("collar_covenant", "the Collar Covenant"), D("supplication", "Supplicationism"), N("reversal", { above: 30 }, "a city that admires owners who serve")] },
  { id: "remade", name: "Remade bodies", look: "Clothes cut to show off surgery: latex, bodysuits, cutouts where the work is.",
    citizen: "a comfortable bodysuit", citizenShoes: "heels", husband: "a fitted bodysuit under an open coat", slave: "a latex suit", collar: "a neck corset", slaveShoes: "extreme heels",
    backers: [L("flesh_freedom", "the Flesh Freedom Act"), D("transformation", "Transformation Fetishism"), N("modification", { above: 45 }, "a city that remakes bodies")] },
  { id: "natural", name: "Natural linen", look: "Undyed cloth and bare faces; anything that hides the body's own shape is vulgar.",
    citizen: "conservative clothing", citizenShoes: "flats", husband: "undyed linen", slave: "a plain shift", collar: "a plain collar", slaveShoes: "flats",
    backers: [L("purity_law", "the Purity Law"), D("body_purist", "Body Purism"), N("modification", { below: -40 }, "a city that prizes natural bodies")] },
];

/** The street default, for a city nothing has shaped yet. */
export const STREET: DressCode = {
  id: "street", name: "Street clothes", look: "Whatever people can afford; slaves in cheap uniforms.",
  citizen: "a t-shirt and jeans", citizenShoes: "flats", husband: "a jacket and jeans", slave: "household uniform", collar: "a plain collar", slaveShoes: "flats",
  backers: [],
};

export interface DressChoice { code: DressCode; score: number; because: string[]; runnerUp?: { code: DressCode; because: string[] } }

function scored(c: DressCode, x: DressSignals): { score: number; because: string[] } {
  let score = 0;
  const because: string[] = [];
  for (const b of c.backers) {
    const hit = b.law ? x.laws.includes(b.law)
      : b.doctrine ? x.doctrines.includes(b.doctrine)
      : b.norm ? (b.above !== undefined ? x.norms[b.norm] >= b.above : true) && (b.below !== undefined ? x.norms[b.norm] <= b.below : true) : false;
    if (hit) { score += b.weight; because.push(b.label); }
  }
  return { score, because };
}

/** The code with the most behind it, and the one after it. Nothing behind any code means street clothes. */
export function dressCodeFor(x: DressSignals): DressChoice {
  const ranked = DRESS_CODES.map((c) => ({ code: c, ...scored(c, x) })).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
  if (!ranked.length) {
    const rich = x.prosperity >= 90;
    return { code: rich ? { ...STREET, citizen: "nice business attire", citizenShoes: "pumps", husband: "a dark suit" } : STREET, score: 0, because: [] };
  }
  const [top, next] = ranked;
  return { code: top.code, score: top.score, because: top.because, runnerUp: next ? { code: next.code, because: next.because } : undefined };
}
