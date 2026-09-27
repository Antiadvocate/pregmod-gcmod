/**
 * THE GENOME PROGRAM — rewriting the DNA of your slaves and your citizens, in bulk.
 *
 * You write what you want in your own words ("blue skin for every citizen", "slaves who can work
 * through a heatwave"), choose who it is for, and have it designed. The design is a spec from a
 * closed menu: skin, hair and eye colour, height, resistance to heat, cold, disease and pollution,
 * a health boost, and how much it pushes the city toward remade bodies. A narrator model reads your
 * words and fills the menu, and writes what it does to society; without one, the game reads your
 * words for the same things. Anything outside the menu is not applied, whatever the words asked.
 *
 * It is priced by the head and by how hard it is: ¤60 a citizen and ¤600 a slave, times the
 * design's complexity (1–5). Applying it changes every slave's body, in the art and in what the
 * narrator reads about her; it changes a share of the citizens, which newcomers dilute; and its
 * resistances cut what the weather, the smog and the plagues do (engine/world reads them). What it
 * did to society goes into the city's description, which every narrator prompt carries.
 */
import type { Person, SaveState } from "./types";
import { clamp } from "./psyche";
import { call, parseJson } from "../llm";
import { NATIONS } from "../data/people";
import { rng } from "./rng";
import { pushNorm } from "./culture";
import { startRumor } from "./social";

export type Target = "slaves" | "citizens" | "both";
export type Resist = "heat" | "cold" | "disease" | "pollution";
export const RESISTS: Resist[] = ["heat", "cold", "disease", "pollution"];

/** Colours the art can draw on a body that wasn't born with them. */
export const GENE_COLOURS = ["blue", "green", "purple", "violet", "teal", "grey", "silver", "gold", "red", "pink", "white", "black"] as const;

export interface GeneSpec {
  summary: string;
  complexity: number;
  skin?: string;
  hair?: string;
  eyes?: string;
  /** cm, −12…12 */
  height?: number;
  resist: Partial<Record<Resist, number>>;
  /** One-off health boost, 0…20. */
  health?: number;
  /** How far it pushes the city toward remade bodies, 0…15. */
  remade?: number;
  /** What it does to the city, in prose: the narrator reads this from now on. */
  society: string;
  side_effects: string;
  /** How citizens take it: −2…2 standing. */
  reaction: number;
}

export interface GeneEdit {
  id: string;
  name: string;
  text: string;
  target: Target;
  spec: GeneSpec;
  by: "narrator" | "game";
  week: number;
  cost: number;
  /** Citizens edited when it was applied; newcomers since are not. */
  citizens: number;
  slaves: string[];
  /** Which repair pass it has had (see heal). `true` was the first. */
  healed?: boolean | number;
  /** Pay every week to reach new slaves and newcomers, so the whole city keeps it. */
  auto?: boolean;
}

export interface Genome { edits: GeneEdit[]; draft?: { name: string; text: string; target: Target; spec: GeneSpec; by: "narrator" | "game" } }
export function genomeOf(s: SaveState): Genome {
  const g = (s.genome ??= { edits: [] });
  heal(s, g);
  return g;
}

/** What the owner's words actually ask to change about how people look. A visible change the words
 *  don't ask for is never made, whatever a narrator put in its answer. */
export function asked(text: string): { skin: boolean; hair: boolean; eyes: boolean; height: boolean } {
  return {
    skin: /\b(skin|skinned|complexions?|pigment\w*|skin[- ]?tone)\b/i.test(text),
    hair: /\bhair(ed)?\b/i.test(text),
    eyes: /\b(eyes?|eyed|iris(es)?)\b/i.test(text),
    height: /\b(tall|taller|short|shorter|height|stature|giants?|petite)\b(?!-)/i.test(text),
  };
}

/** Strip from a spec every visible change the owner's words don't ask for. */
export function onlyAsked(spec: GeneSpec, text: string): GeneSpec {
  const a = asked(text);
  return { ...spec, skin: a.skin ? spec.skin : undefined, hair: a.hair ? spec.hair : undefined, eyes: a.eyes ? spec.eyes : undefined, height: a.height ? spec.height : undefined };
}

/** What she looked like before any program touched her, from what was kept, or from where she's from. */
function born(p: Person): { skin: string; hair_color: string; eye_color: string } {
  if (p.body.born) return p.body.born;
  const nation = NATIONS.find((n) => n.name === p.origin.nationality);
  const r = rng(`born:${p.id}`);
  return {
    skin: /\(engineered\)/.test(p.body.skin) ? (nation ? r.pick(nation.skin) : "olive") : p.body.skin,
    hair_color: p.body.hair_color, eye_color: p.body.eye_color,
  };
}

/**
 * Put right what earlier versions got wrong, once per edit:
 *  · a narrator filled in a skin (or hair, or eye) colour the owner never asked for, and it was
 *    applied; and the first repair read colours out of words too loosely. Any visible change the
 *    owner's words don't ask for is taken off the edit, and every slave it touched gets back what
 *    she was born with, unless another program she's had does ask for it.
 *  · an edit that did ask for a colour, in a word the old list didn't know ("azure"), gets it.
 */
const HEAL = 2;
function heal(s: SaveState, g: Genome): void {
  const touched = new Set<string>();
  for (const e of g.edits) {
    const done = e.healed === true ? 1 : typeof e.healed === "number" ? e.healed : 0;
    if (done >= HEAL) continue;
    e.healed = HEAL;
    const before = { skin: e.spec.skin, hair: e.spec.hair, eyes: e.spec.eyes };
    e.spec = onlyAsked(e.spec, e.text);
    const w = onlyAsked(readWords(e.text), e.text);
    if (!e.spec.skin && w.skin) e.spec.skin = w.skin;
    if (!e.spec.hair && w.hair) e.spec.hair = w.hair;
    if (!e.spec.eyes && w.eyes) e.spec.eyes = w.eyes;
    if (before.skin !== e.spec.skin || before.hair !== e.spec.hair || before.eyes !== e.spec.eyes) for (const id of e.slaves) touched.add(id);
  }
  for (const id of touched) {
    const p = s.people[id];
    if (!p) continue;
    const mine = g.edits.filter((e) => e.slaves.includes(id));
    const orig = born(p);
    const skin = mine.map((e) => e.spec.skin).filter(Boolean).at(-1);
    const hair = mine.map((e) => e.spec.hair).filter(Boolean).at(-1);
    const eyes = mine.map((e) => e.spec.eyes).filter(Boolean).at(-1);
    p.body.skin = skin ? `${skin} (engineered)` : orig.skin;
    if (hair) p.body.hair_color = hair; else if (p.body.born) p.body.hair_color = orig.hair_color;
    if (eyes) p.body.eye_color = eyes; else if (p.body.born) p.body.eye_color = orig.eye_color;
    // Rewrite what the narrator reads about her: each program's line says only what it did.
    p.body.appearance_facts = p.body.appearance_facts.replace(/ ?Her DNA was rewritten by the [^:]+ program: [^.]*\./g, "").trim();
    for (const e of mine) rewrite(p, { ...e.spec, height: undefined, health: undefined }, e.name);
  }
}

const household = (s: SaveState): Person[] => Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);

/** Any colour word to one the art can draw: "light blue", "azure" and "cobalt" are all blue. */
const SHADES: [RegExp, (typeof GENE_COLOURS)[number]][] = [
  [/teal|turquoise|aqua|cyan/, "teal"], [/violet|lilac|lavender|indigo/, "violet"], [/purple|plum|magenta|mauve/, "purple"],
  [/blue|azure|cobalt|navy|sapphire|cerulean/, "blue"], [/green|emerald|jade|olive green|verdant/, "green"],
  [/silver|platinum|chrome|metallic/, "silver"], [/gr[ae]y|ash|slate|charcoal/, "grey"], [/gold|golden|amber|bronze|brass/, "gold"],
  [/pink|rose|blush/, "pink"], [/red|crimson|scarlet|ruby|ruddy/, "red"], [/white|ivory|pearl|alabaster|snow/, "white"], [/black|ebony|jet|onyx|obsidian/, "black"],
];
export function geneColour(v: unknown): string | undefined {
  if (typeof v !== "string" || !v.trim()) return undefined;
  const t = v.toLowerCase();
  return SHADES.find(([re]) => re.test(t))?.[1];
}

/* ── pricing ─────────────────────────────────────────────────────────────────────────────────── */

export const PER_CITIZEN = 60;
export const PER_SLAVE = 600;

export function quote(s: SaveState, target: Target, spec: GeneSpec, slaves = household(s)): { citizens: number; slaves: number; cost: number } {
  const c = target !== "slaves" ? Math.round(s.arcology.population) : 0;
  const n = target !== "citizens" ? slaves.length : 0;
  const k = clamp(Math.round(spec.complexity), 1, 5);
  return { citizens: c, slaves: n, cost: (c * PER_CITIZEN + n * PER_SLAVE) * k };
}

/* ── reading the words ───────────────────────────────────────────────────────────────────────── */

/** The colour a body part is given: "blue skin", "blue-green hair", "skin dyed blue", "eyes that are gold". */
const colourNear = (text: string, part: string): string | undefined => {
  const C = "light blue|dark blue|pale blue|deep blue|" + [...GENE_COLOURS, "azure", "cobalt", "navy", "sapphire", "emerald", "jade", "turquoise", "lavender", "lilac", "golden", "crimson", "scarlet", "ivory", "ebony", "gray", "platinum"].join("|");
  const before = new RegExp(`\\b(${C})(?:[\\s-]+\\w+)?[\\s-]+${part}`, "i").exec(text);
  if (before) return geneColour(before[1]);
  // "skin ... to be blue", "hair turned silver", "eyes dyed gold": a colour after the part needs a word that says it's becoming it.
  const after = new RegExp(`\\b${part}(?:[\\s,]+(?!and\\b)\\w+){0,5}?[\\s,]+(?:to be|to|turn(?:ed|s)?|become|becomes|dyed|colou?red|made|is|are|go(?:es)?|into)(?:[\\s]+(?:a|an|the|bright|deep|pale|light|dark))?[\\s]+(${C})\\b`, "i").exec(text);
  return after ? geneColour(after[1]) : undefined;
};

/** The game's own reading of what you wrote, for when there is no narrator. */
export function readWords(text: string): GeneSpec {
  const t = text.toLowerCase();
  const resist: GeneSpec["resist"] = {};
  const climate = /\b(climate|weather)\b/.test(t);
  if (climate || /\b(heat|hot|sun|desert)/.test(t)) resist.heat = 0.6;
  if (climate || /\b(cold|freez|winter|arctic)/.test(t)) resist.cold = 0.6;
  if (/\b(disease|plague|fever|immun|virus|sick)/.test(t)) resist.disease = 0.6;
  if (/\b(pollution|smog|air\b|lungs?\b|toxin)/.test(t)) resist.pollution = 0.6;
  const spec: GeneSpec = {
    summary: "",
    complexity: 1,
    skin: colourNear(t, "skin"),
    hair: colourNear(t, "hair"),
    eyes: colourNear(t, "eyes?"),
    height: /\b(tall|taller)\b(?!-)/.test(t) ? 6 : /\b(short|shorter)\b(?!-)/.test(t) ? -6 : undefined,
    resist,
    health: /\b(health|longevity|long-lived|vigou?r|strong)/.test(t) ? 8 : undefined,
    society: "", side_effects: "", reaction: 0,
  };
  const parts = [spec.skin && `${spec.skin} skin`, spec.hair && `${spec.hair} hair`, spec.eyes && `${spec.eyes} eyes`, spec.height && (spec.height > 0 ? "taller" : "shorter"), ...RESISTS.filter((r) => resist[r]).map((r) => `${r}-resistant`), spec.health && "healthier"].filter(Boolean) as string[];
  spec.complexity = clamp(parts.length, 1, 5);
  spec.remade = 3 + parts.length * 2;
  spec.summary = parts.length ? parts.join(", ") : "nothing the clinics can do";
  spec.society = parts.length ? `Everyone the program reached shows it: ${parts.join(", ")}. People notice who has had it and who hasn't.` : "";
  spec.side_effects = spec.complexity >= 3 ? "Some of the edited run fevers for a week while it takes." : "None worth reporting.";
  return spec;
}

/** Keep a spec inside the menu, whatever came back. */
export function clampSpec(raw: Partial<GeneSpec> & Record<string, unknown>, text?: string): GeneSpec {
  const spec = clampAll(raw);
  return text === undefined ? spec : onlyAsked(spec, text);
}
function clampAll(raw: Partial<GeneSpec> & Record<string, unknown>): GeneSpec {
  const colour = (v: unknown) => geneColour(v);
  const num = (v: unknown, lo: number, hi: number) => (typeof v === "number" && Number.isFinite(v) ? clamp(v, lo, hi) : undefined);
  const resist: GeneSpec["resist"] = {};
  const r = (raw.resist ?? {}) as Record<string, unknown>;
  for (const k of RESISTS) { const v = num(r[k], 0, 0.9); if (v) resist[k] = Math.round(v * 100) / 100; }
  const str = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  return {
    summary: str(raw.summary, 200) || "an edit",
    complexity: Math.round(num(raw.complexity, 1, 5) ?? 2),
    skin: colour(raw.skin), hair: colour(raw.hair), eyes: colour(raw.eyes),
    height: num(raw.height, -12, 12) !== undefined ? Math.round(num(raw.height, -12, 12)!) : undefined,
    resist,
    health: num(raw.health, 0, 20),
    remade: num(raw.remade, 0, 15),
    society: str(raw.society, 1200),
    side_effects: str(raw.side_effects, 400),
    reaction: Math.round((num(raw.reaction, -2, 2) ?? 0) * 10) / 10,
  };
}

/** Have it designed: the narrator if one is given, else the game's reading. The draft waits to be applied. */
export async function design(s: SaveState, draft: { name: string; text: string; target: Target }, model?: string, fallback?: string): Promise<{ ok: boolean; error?: string }> {
  const name = draft.name.trim().slice(0, 60) || "Unnamed edit";
  const text = draft.text.trim().slice(0, 600);
  if (!text) return { ok: false, error: "Write what the edit should do." };
  let spec: GeneSpec | null = null;
  let by: "narrator" | "game" = "game";
  if (model) {
    const who = draft.target === "slaves" ? "the owner's slaves (all adults)" : draft.target === "citizens" ? "the arcology's citizens" : "the owner's slaves and the arcology's citizens";
    const res = await call({
      system: "You are the chief geneticist of a Free City arcology in a dark future where the owner can rewrite the DNA of whoever they pay for. You design mass gene edits from the owner's words, and answer only with JSON. The game can apply only what the JSON schema offers; leave out anything else. Describe only adults, and never describe a child's body.",
      user: [
        `THE OWNER'S WORDS: "${text}"`,
        `APPLIED TO: ${who}.`,
        `THE CITY: ${s.arcology.name}, ${Math.round(s.arcology.population).toLocaleString()} citizens, prosperity ${Math.round(s.arcology.prosperity)}.`,
        ``,
        `Answer with JSON. Change only what the owner's words ask for. In particular, do NOT change skin, hair or eye colour or height unless the words ask for that exact thing; most edits change none of them, and a field you leave out stays as the people were born.`,
        `{"summary": "<what it does, a few words>", "complexity": <1-5, how hard: a colour is 1, one resistance 2, several changes 3-5>,`,
        ` ONLY IF ASKED: "skin": "<one of ${GENE_COLOURS.join(", ")}>", "hair": "<same list>", "eyes": "<same list>", "height": <cm change, -12..12>,`,
        ` "resist": {"heat": <0-0.9>, "cold": <0-0.9>, "disease": <0-0.9>, "pollution": <0-0.9>}, "health": <0-20 one-off>, "remade": <0-15, how far it pushes the city toward remade bodies>,`,
        ` "society": "<120-220 words: how the city changes once this is done: fashion, work, who has it and who doesn't, what the neighbours and the Old World say. Concrete, no moralising.>",`,
        ` "side_effects": "<one or two sentences>", "reaction": <-2..2, how the citizens take it>}`,
      ].join("\n"),
      model, fallback, json: true, maxTokens: 900, temperature: 0.8,
    });
    const j = res.ok ? parseJson<Record<string, unknown>>(res.text) : null;
    if (j) { spec = clampSpec(j, text); by = "narrator"; }
  }
  spec ??= readWords(text);
  genomeOf(s).draft = { name, text, target: draft.target, spec, by };
  return { ok: true };
}

/* ── applying it ─────────────────────────────────────────────────────────────────────────────── */

/** One body, rewritten. */
export function rewrite(p: Person, spec: GeneSpec, name: string): void {
  const b = p.body;
  if ((spec.skin || spec.hair || spec.eyes) && !b.born && !/\(engineered\)/.test(b.skin)) b.born = { skin: b.skin, hair_color: b.hair_color, eye_color: b.eye_color };
  if (spec.skin) b.skin = `${spec.skin} (engineered)`;
  if (spec.hair) b.hair_color = spec.hair;
  if (spec.eyes) b.eye_color = spec.eyes;
  if (spec.height) b.height_cm = Math.round(clamp(b.height_cm + spec.height, 130, 210));
  if (spec.health) p.health.health = clamp(p.health.health + spec.health, -100, 100);
  const traits = RESISTS.filter((r) => (spec.resist[r] ?? 0) > 0).map((r) => `${r}-resistant (engineered)`);
  b.traits = [...new Set([...(b.traits ?? []), ...traits])];
  const bits = [spec.skin && `${spec.skin} skin`, spec.hair && `${spec.hair} hair`, spec.eyes && `${spec.eyes} eyes`, ...traits.map((t) => t.replace(" (engineered)", ""))].filter(Boolean);
  if (bits.length && !b.appearance_facts.includes(`the ${name} program`)) b.appearance_facts = `${b.appearance_facts.trim()} Her DNA was rewritten by the ${name} program: ${bits.join(", ")}.`.trim();
}

export function apply(s: SaveState): string {
  const g = genomeOf(s);
  const d = g.draft;
  if (!d) return "";
  const slaves = household(s);
  const q = quote(s, d.target, d.spec, slaves);
  if (s.arcology.cash < q.cost) return `You have ¤${Math.round(s.arcology.cash).toLocaleString()}; the program costs ¤${q.cost.toLocaleString()}.`;
  s.arcology.cash -= q.cost;
  if (d.target !== "citizens") for (const p of slaves) rewrite(p, d.spec, d.name);
  const edit: GeneEdit = { id: `gene_${s.arcology.week}_${g.edits.length}`, name: d.name, text: d.text, target: d.target, spec: d.spec, by: d.by, week: s.arcology.week, cost: q.cost, citizens: q.citizens, slaves: d.target !== "citizens" ? slaves.map((p) => p.id) : [] };
  g.edits.push(edit);
  g.draft = undefined;
  // What it does to the city's habits and its opinion of you.
  pushNorm(s, "modification", d.spec.remade ?? 4, `you ran the ${d.name} gene program`);
  startRumor(s, `the owner has rewritten the DNA of ${d.target === "slaves" ? "their slaves" : d.target === "citizens" ? "the citizens" : "the whole arcology"}: ${d.spec.summary}`, { salience: 8 });
  s.arcology.public_standing = clamp(s.arcology.public_standing + d.spec.reaction, -10, 10);
  return `The ${d.name} program runs: ${[q.citizens && `${q.citizens.toLocaleString()} citizens`, q.slaves && `${q.slaves} slave${q.slaves === 1 ? "" : "s"}`].filter(Boolean).join(" and ")} rewritten (−¤${q.cost.toLocaleString()}).`;
}

/** Run an edit again for those it hasn't reached: new slaves, and citizens who arrived since. */
export function topUp(s: SaveState, id: string, dryRun = false): { citizens: number; slaves: Person[]; cost: number; line?: string } {
  const e = genomeOf(s).edits.find((x) => x.id === id);
  if (!e) return { citizens: 0, slaves: [], cost: 0 };
  // Only the ones it hasn't reached: the heritable share of the growth already carries it.
  const citizens = e.target !== "slaves" ? Math.max(0, Math.round(s.arcology.population * (1 - citizenShare(s, e)))) : 0;
  const slaves = e.target !== "citizens" ? household(s).filter((p) => !e.slaves.includes(p.id)) : [];
  const cost = (citizens * PER_CITIZEN + slaves.length * PER_SLAVE) * e.spec.complexity;
  if (dryRun || (!citizens && !slaves.length) || s.arcology.cash < cost) return { citizens, slaves, cost };
  s.arcology.cash -= cost;
  for (const p of slaves) rewrite(p, e.spec, e.name);
  // Everyone alive now has it; growth from here dilutes it again, less the heritable share.
  if (citizens) e.citizens = Math.round(s.arcology.population);
  e.slaves.push(...slaves.map((p) => p.id)); e.cost += cost;
  return { citizens, slaves, cost, line: `The ${e.name} program reaches ${[citizens && `${citizens.toLocaleString()} more citizens`, slaves.length && `${slaves.length} more slave${slaves.length === 1 ? "" : "s"}`].filter(Boolean).join(" and ")} (−¤${cost.toLocaleString()}).` };
}

/* ── what it does, every week ────────────────────────────────────────────────────────────────── */

/** Share of the citizens an edit reaches now: newcomers since dilute it. */
/** Share of the citizens an edit reaches now. It's heritable: about a third of the city's growth is
 *  children born to the edited, who carry it. The rest are newcomers, who don't until you pay. */
export const HERITABLE = 0.3;
export function citizenShare(s: SaveState, e: GeneEdit): number {
  if (e.target === "slaves" || e.citizens <= 0) return 0;
  const pop = Math.max(1, s.arcology.population);
  return clamp((e.citizens + Math.max(0, pop - e.citizens) * HERITABLE) / pop, 0, 1);
}
/** Share of your slaves an edit reaches now. */
export function slaveShare(s: SaveState, e: GeneEdit): number {
  if (e.target === "citizens") return 0;
  const h = household(s);
  return h.length ? h.filter((p) => e.slaves.includes(p.id)).length / h.length : 0;
}

/** How much of a kind of harm the edits spare, 0…0.9, for your slaves or your citizens. */
export function resistance(s: SaveState, kind: Resist, who: "slaves" | "citizens"): number {
  let best = 0;
  for (const e of s.genome?.edits ?? []) {
    const share = who === "slaves" ? slaveShare(s, e) : citizenShare(s, e);
    best = Math.max(best, (e.spec.resist[kind] ?? 0) * share);
  }
  return clamp(best, 0, 0.9);
}

/** For the art and the comparison: the look most citizens (or slaves) now have. */
export interface Look { skin?: string; hair?: string; eyes?: string; from?: string[] }
export function prevailingLook(s: SaveState, who: "slaves" | "citizens"): Look {
  if (s.genome) genomeOf(s);
  const out: Look = {};
  for (const e of s.genome?.edits ?? []) {
    const share = who === "slaves" ? slaveShare(s, e) : citizenShare(s, e);
    if (share < 0.4 || !(e.spec.skin || e.spec.hair || e.spec.eyes)) continue;
    if (e.spec.skin) out.skin = e.spec.skin;
    if (e.spec.hair) out.hair = e.spec.hair;
    if (e.spec.eyes) out.eyes = e.spec.eyes;
    (out.from ??= []).push(e.name);
  }
  return out;
}

/** "blue skin and silver hair", for a sentence. */
export function lookWords(l?: Look): string {
  if (!l) return "";
  const parts = [l.skin && `${l.skin} skin`, l.hair && `${l.hair} hair`, l.eyes && `${l.eyes} eyes`].filter(Boolean) as string[];
  return parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

/** For every narrator: what has been done to the city's DNA, and what it did to the city. */
export function genomeBrief(s: SaveState): string {
  const edits = s.genome ? genomeOf(s).edits : [];
  if (!edits.length) return "";
  return edits.map((e) => {
    const c = citizenShare(s, e), sl = slaveShare(s, e);
    const reach = [c && `${Math.round(c * 100)}% of citizens`, sl && `${Math.round(sl * 100)}% of the owner's slaves`].filter(Boolean).join(" and ");
    return `· Engineered, the ${e.name} program (${e.spec.summary}; ${reach || "nobody any more"}).${e.spec.society ? ` ${e.spec.society}` : ""}`;
  }).join("\n");
}

/** Weekly: programs set to keep up reach whoever arrived since, and charge for it. */
export function tickGenome(s: SaveState): string[] {
  if (!s.genome) return [];
  const out: string[] = [];
  for (const e of genomeOf(s).edits) {
    if (!e.auto) continue;
    const more = topUp(s, e.id, true);
    if (!more.citizens && !more.slaves.length) continue;
    if (s.arcology.cash < more.cost) { out.push(`The ${e.name} program couldn't reach this week's newcomers: it needs ¤${more.cost.toLocaleString()}.`); continue; }
    const done = topUp(s, e.id);
    if (done.line) out.push(done.line);
  }
  return out;
}
