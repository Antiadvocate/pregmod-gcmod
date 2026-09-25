/**
 * CULTURE — what the city has come to think is normal, and why.
 *
 * Doctrine adoption says which future society is winning. This is underneath it: eight norms,
 * each −100…+100, that describe how citizens actually behave toward slaves and each other. They
 * drift toward what your doctrines, laws and broadcasts pull for, and they are pushed, week by
 * week, by what you do where people can see it: your deeds, the jobs you give your slaves, what
 * you did at the fountain. Every push is recorded with its reason, so the society screen can say
 * which of your choices moved the city and how far. The court reads them to write laws; the walk
 * through the city reads them to show you what people are doing.
 */
import type { SaveState } from "./types";
import { clamp } from "./psyche";
import { DOCTRINE_BY_ID } from "../data/doctrines";

export type Norm = "cruelty" | "exposure" | "personhood" | "reversal" | "feet" | "manumission" | "modification" | "order";

export const NORMS: Record<Norm, { name: string; low: string; high: string; lowLine: string; highLine: string; lowMid: string; highMid: string }> = {
  cruelty: { name: "How slaves are treated", low: "gentle", high: "cruel",
    lowLine: "Citizens are gentle with their slaves; hitting one in public draws stares.",
    highLine: "Citizens beat their slaves in the street and nobody looks twice.",
    lowMid: "Most owners are gentle in public, and a slap draws a few looks.",
    highMid: "Most owners hit their slaves in public when they feel like it, and only a few people look away." },
  exposure: { name: "Public sex and nudity", low: "modest", high: "open",
    lowLine: "Slaves are covered in public and sex stays behind doors.",
    highLine: "Naked slaves are everywhere and people fuck in the concourse.",
    lowMid: "Most slaves are covered in public, and a naked one draws looks.",
    highMid: "Plenty of slaves go naked in the concourse, and nobody complains much." },
  personhood: { name: "Are slaves people?", low: "property", high: "people",
    lowLine: "A slave is furniture. Citizens talk over them and about them.",
    highLine: "Citizens say please to other people's slaves and ask their names.",
    lowMid: "Most citizens talk about slaves as if they weren't in the room.",
    highMid: "More citizens than not speak to slaves as people." },
  reversal: { name: "Owners who serve", low: "unthinkable", high: "admired",
    lowLine: "An owner who kneels to a slave would be laughed out of the arcology.",
    highLine: "Owners kneeling to their slaves is romantic, and a few citizens do it too.",
    lowMid: "An owner who served a slave would be a joke in most company.",
    highMid: "An owner kneeling to a slave gets smiles more often than laughs." },
  feet: { name: "Slaves' feet", low: "ignored", high: "sacred",
    lowLine: "Nobody thinks about slaves' feet except to make them walk.",
    highLine: "Citizens kneel to kiss slaves' feet and caning a sole is a scandal.",
    lowMid: "Slaves' feet are for walking, and nobody much cares how they're kept.",
    highMid: "People notice slaves' feet now: painted toes, bare soles, who washes them." },
  manumission: { name: "Freeing slaves", low: "never", high: "expected",
    lowLine: "A slave is a slave for life; freeing one is waste.",
    highLine: "Citizens expect a good slave to earn her freedom eventually.",
    lowMid: "Most citizens think freeing a slave is throwing money away.",
    highMid: "Freeing a good slave after some years is starting to seem decent." },
  modification: { name: "Changing bodies", low: "pure", high: "remade",
    lowLine: "Implants and surgery are vulgar; natural bodies are prized.",
    highLine: "Nobody keeps the body they were born with if they can afford better.",
    lowMid: "Most citizens think implants look cheap.",
    highMid: "Implants and surgery are ordinary; an untouched body looks a little old-fashioned." },
  order: { name: "Order in the streets", low: "loose", high: "strict",
    lowLine: "The streets look after themselves, for better and worse.",
    highLine: "Patrols on every corner, curfews, and papers checked at the lifts.",
    lowMid: "Patrols are thin, and the streets mostly sort themselves out.",
    highMid: "Patrols are a common sight, and people carry their papers." },
};
export const NORM_IDS = Object.keys(NORMS) as Norm[];

export interface Push { week: number; norm: Norm; by: number; why: string }

export interface Culture {
  norms: Record<Norm, number>;
  /** What moved them, newest last; kept for a season. */
  pushes: Push[];
  history: { week: number; norms: Record<Norm, number> }[];
}

export function cultureOf(s: SaveState): Culture {
  if (!s.culture) {
    s.culture = { norms: { cruelty: 10, exposure: 20, personhood: -20, reversal: -40, feet: 0, manumission: -20, modification: 10, order: 0 }, pushes: [], history: [] };
  }
  for (const n of NORM_IDS) s.culture.norms[n] ??= 0;
  return s.culture;
}

/** Move a norm, and remember why. Callers use it for anything the city saw you do. */
export function pushNorm(s: SaveState, norm: Norm, by: number, why: string): void {
  const c = cultureOf(s);
  if (!by) return;
  c.norms[norm] = clamp(c.norms[norm] + by, -100, 100);
  c.pushes.push({ week: s.arcology.week, norm, by: +by.toFixed(2), why });
  if (c.pushes.length > 600) c.pushes.splice(0, c.pushes.length - 600);
}

/** Where each doctrine pulls the norms, at full adoption. */
const DOCTRINE_PULL: Record<string, Partial<Record<Norm, number>>> = {
  paternalist: { cruelty: -60, personhood: 50, manumission: 20 },
  degradationist: { cruelty: 70, personhood: -60, exposure: 30 },
  body_purist: { modification: -70 },
  transformation: { modification: 70 },
  supplication: { reversal: 70, personhood: 40 },
  podolatry: { feet: 80, cruelty: -15 },
  subjugationist: { cruelty: 40, personhood: -40 },
  supremacist: { cruelty: 30, personhood: -30 },
  hedonist: { exposure: 50 },
  chattel_religion: { order: 40, personhood: 10 },
  roman: { order: 30, cruelty: 20 },
  neo_imperial: { order: 50 },
  repopulation: { exposure: 20, personhood: 10 },
  eugenics: { modification: 20, personhood: -20 },
  professionalism: { personhood: 30, exposure: -20 },
  dependency: { personhood: -40 },
};

const LAW_PULL: Record<string, Partial<Record<Norm, number>>> = {};
const LAW_NAME: Record<string, string> = {};
/** Laws register how they pull the city (engine/court.ts). */
export function registerLawPull(id: string, pull: Partial<Record<Norm, number>>, name?: string): void { LAW_PULL[id] = pull; if (name) LAW_NAME[id] = name; }

/** Weekly: drift toward what the institutions pull for, then take this week's pushes. */
export function tickCulture(s: SaveState): string[] {
  const c = cultureOf(s);
  const week = s.arcology.week;
  const out: string[] = [];
  const before = { ...c.norms };

  // Institutions: doctrines at their adoption, laws in force, the broadcasts.
  const target: Record<Norm, number> = { cruelty: 0, exposure: 0, personhood: 0, reversal: -15, feet: 0, manumission: -10, modification: 0, order: 0 };
  const weight: Record<Norm, number> = { cruelty: 0.5, exposure: 0.5, personhood: 0.5, reversal: 0.5, feet: 0.5, manumission: 0.5, modification: 0.5, order: 0.5 };
  const from: Record<Norm, { label: string; v: number }[]> = { cruelty: [], exposure: [], personhood: [], reversal: [], feet: [], manumission: [], modification: [], order: [] };
  const pull = (src: Partial<Record<Norm, number>>, strength: number, label: string) => {
    for (const [n, v] of Object.entries(src) as [Norm, number][]) { target[n] += v * strength; weight[n] += strength; if (strength > 0.05) from[n].push({ label, v: v * strength }); }
  };
  for (const [id, st] of Object.entries(s.arcology.doctrines)) if (DOCTRINE_PULL[id]) pull(DOCTRINE_PULL[id], st.adoption / 100, DOCTRINE_BY_ID[id]?.noun ?? id);
  for (const law of s.laws ?? []) if (LAW_PULL[law.id]) pull(LAW_PULL[law.id], 0.8, `the ${LAW_NAME[law.id] ?? law.id}`);
  const tv = s.fctv;
  if (tv?.on) {
    const tot = Object.values(tv.slots).reduce((a, b) => a + b, 0) || 1;
    pull({ exposure: 60 }, (tv.slots.porn / tot) * 0.6, "the porn on FCTV");
    pull({ cruelty: -30, personhood: 20 }, (tv.slots.home / tot) * 0.6, "the home shows on FCTV");
    pull({ cruelty: 30, order: 30 }, (tv.slots.sport / tot) * 0.6, "the fights on FCTV");
  }
  pull({ order: clamp(s.arcology.security - 40, -40, 60) }, 0.5, s.arcology.security >= 40 ? "your security forces" : "how thin your security is");
  for (const n of NORM_IDS) {
    const t = target[n] / weight[n];
    const d = (t - c.norms[n]) * 0.06;
    if (Math.abs(d) < 0.2) continue;
    const lead = from[n].filter((x) => Math.sign(x.v) === Math.sign(d)).sort((a, b) => Math.abs(b.v) - Math.abs(a.v))[0];
    pushNorm(s, n, d, lead ? `${lead.label} pulls it ${d > 0 ? "up" : "down"}` : `it drifts back ${d > 0 ? "up" : "down"} toward where free cities usually sit`);
  }

  // What your household visibly does, every week.
  const house = Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);
  const n = Math.max(1, house.length);
  const count = (f: (p: (typeof house)[number]) => boolean) => house.filter(f).length;
  const publicSex = count((p) => ["whore", "public servant", "work in the brothel", "serve in the club"].includes(p.assignment));
  if (publicSex) pushNorm(s, "exposure", publicSex * 0.25, "your slaves work in public");
  const arcade = count((p) => p.assignment === "be confined in the arcade");
  if (arcade) { pushNorm(s, "personhood", -arcade * 0.35, "your slaves locked in the arcade"); pushNorm(s, "cruelty", arcade * 0.2, "your slaves locked in the arcade"); }
  const cared = count((p) => ["classes", "learn in the schoolroom", "rest in the spa", "work in an office", "be your secretary"].includes(p.assignment));
  if (cared) pushNorm(s, "personhood", cared * 0.15, "your slaves are schooled, rested or doing skilled work");
  const idols = count((p) => p.assignment === "be an idol");
  if (idols) pushNorm(s, "personhood", idols * 0.2, "your slaves are famous as idols");
  // How you treat them gets out: the staff, the visitors, the slaves you sell on all talk.
  const hurt = count((p) => p.bond.weeks_since_cruelty <= 1);
  if (hurt) pushNorm(s, "cruelty", hurt * 0.3, "you hurt your slaves, and people hear about it");
  const kind = count((p) => p.bond.weeks_since_kindness <= 1);
  if (kind > hurt) pushNorm(s, "cruelty", -(kind - hurt) * 0.12, "you're known to be kind to your slaves");
  const freed = Object.values(s.people).filter((p) => p.status === "free" && p.exit_week === week).length;
  if (freed) pushNorm(s, "manumission", freed * 2, "you free slaves");
  const barefoot = count((p) => !p.shoes || p.shoes === "none" || /bare/i.test(p.shoes));
  if (barefoot > n / 2) pushNorm(s, "feet", 0.2, "your household goes barefoot");
  const altered = count((p) => (p.body.traits?.length ?? 0) > 0 || p.body.boob_implant > 0 || p.body.marks.some((m) => m.kind === "implant"));
  if (altered > n / 2) pushNorm(s, "modification", 0.3, "most of your household has been altered");

  // Deeds from this week the city heard about.
  for (const d of (s.deeds ?? []).filter((x) => x.week === week - 1 || x.week === week)) {
    if ((d as { culture_done?: boolean }).culture_done) continue;
    (d as { culture_done?: boolean }).culture_done = true;
    const w = d.public ? 3 : 0.7;
    const why = d.summary.slice(0, 90);
    for (const t of d.tags) {
      const map: Record<string, Partial<Record<Norm, number>>> = {
        cruelty: { cruelty: 2 }, humiliated_her: { cruelty: 1.2, personhood: -0.8 }, punished: { order: 0.8, cruelty: 0.6 },
        tenderness: { cruelty: -0.8, personhood: 0.6 }, mercy: { cruelty: -1 }, gift: { personhood: 0.6 }, gratitude: { personhood: 0.8 },
        freed_her: { manumission: 3, personhood: 1 }, promised_freedom: { manumission: 1.2 }, married_her: { personhood: 1.5, reversal: 0.6 },
        owner_enslaved: { reversal: 4, personhood: 1.5 }, owner_submitted: { reversal: 1.5 }, public_spectacle: { exposure: 1.5 },
        feet_worship: { feet: 1.5 }, shared_her: { exposure: 0.8, personhood: -0.5 }, elevated: { personhood: 0.8 }, threatened_sale: { personhood: -0.5 },
      };
      for (const [nm, v] of Object.entries(map[t] ?? {}) as [Norm, number][]) pushNorm(s, nm, v * w, `you: ${why}`);
    }
  }

  c.history.push({ week, norms: { ...c.norms } });
  if (c.history.length > 104) c.history.shift();
  for (const nm of NORM_IDS) {
    const crossed = (x: number) => (x >= 50 ? 1 : x <= -50 ? -1 : 0);
    if (crossed(before[nm]) !== crossed(c.norms[nm]) && crossed(c.norms[nm]) !== 0) out.push(crossed(c.norms[nm]) > 0 ? NORMS[nm].highLine : NORMS[nm].lowLine);
  }
  return out;
}

/** The biggest reasons a norm moved over the last `weeks`, summed by reason. */
export function drivers(s: SaveState, norm: Norm, weeks = 12): { why: string; by: number }[] {
  const c = cultureOf(s);
  const since = s.arcology.week - weeks;
  const m = new Map<string, number>();
  for (const p of c.pushes) if (p.norm === norm && p.week > since) m.set(p.why, (m.get(p.why) ?? 0) + p.by);
  return [...m.entries()].map(([why, by]) => ({ why, by: +by.toFixed(1) })).sort((a, b) => Math.abs(b.by) - Math.abs(a.by)).slice(0, 4);
}

export function normLine(n: Norm, v: number): string {
  const d = NORMS[n];
  if (v >= 50) return d.highLine;
  if (v <= -50) return d.lowLine;
  if (v >= 15) return d.highMid;
  if (v <= -15) return d.lowMid;
  return "Nobody agrees yet; you see both kinds.";
}

/** For the narrator and the walks. */
export function cultureBrief(s: SaveState): string {
  const c = cultureOf(s);
  return NORM_IDS.filter((n) => Math.abs(c.norms[n]) >= 15).map((n) => `· ${NORMS[n].name}: ${normLine(n, c.norms[n])} (${Math.round(c.norms[n])})`).join("\n");
}
