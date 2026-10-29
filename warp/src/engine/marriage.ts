/**
 * A MARRIAGE ON YOUR OWN TERMS.
 *
 * The ladder (engine/romance) is one road to a wedding: seven rungs, months of gates, a rite at each,
 * and past the top of it the collar changing hands. This is the other road. You pick her, you write
 * how the marriage goes (where, who's watching, what she wears and what you do, what she is to you
 * afterwards and who leads), and the narrator writes the wedding from your words and says what you
 * built: whether it was public, whether she stays a slave, who holds the power, what the vows were,
 * and how the arcology takes it. The engine keeps those as facts.
 *
 * Nothing about it leads anywhere you didn't write. A wife whose terms keep the power with you
 * doesn't drift toward holding the collar; one whose terms hand it to her does, and an equal one
 * stops halfway. What happens next grows from what you set up: the city's reaction the week after,
 * the other powers a month on, the first time the terms are tested, and, with a model, a saga that
 * starts from the marriage itself.
 */
import type { Person, ReportLine, SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { HOUSE_STYLE, personCard } from "./prompts";
import { coarsen, FC_VOICE } from "./register";
import { romanceOf } from "./romance";
import { applyTreatment, refresh } from "./obedience";
import { clamp, shove, addState } from "./psyche";
import { remember } from "./memory";
import { startRumor, moveEdge } from "./social";
import { NORM_IDS, pushNorm, type Norm } from "./culture";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { sagasOf } from "./saga";
import { arcDef, startArc } from "./story";

export type WifeStatus = "slave wife" | "wife" | "free wife";
export type WhoLeads = "you" | "equal" | "her";

export interface Marriage {
  person: string;
  week: number;
  /** The player's own words: how it goes. */
  terms: string;
  title: string;
  /** The wedding, written. */
  scene: string;
  public: boolean;
  status: WifeStatus;
  power: WhoLeads;
  vows: string[];
  /** How the arcology sees it, a sentence or two. */
  seen: string;
  /** What the marriage leaves open, for the beats and the saga that come after. */
  hooks: string[];
  /** What it did, for the record on her page. */
  effects: string[];
  model?: string;
  ended?: { week: number; how: string };
}

export const marriageOf = (s: SaveState): Marriage | undefined => (s.player.marriage && !s.player.marriage.ended ? s.player.marriage : undefined);
export const marriedTo = (s: SaveState, p: Person): boolean => marriageOf(s)?.person === p.id;

/** Who can be married this way: anyone grown in the household, or a woman you freed. */
export function canMarry(s: SaveState, p: Person): string | null {
  if (p.age < 18) return "she's too young";
  if (marriageOf(s)) return marriageOf(s)!.person === p.id ? "you're already married to her" : `you're married to ${s.people[marriageOf(s)!.person]?.name ?? "someone"}`;
  if (s.player.owned_by) return "you don't decide that any more";
  if (!["owned", "indentured", "free"].includes(p.status)) return "she isn't here";
  return null;
}

/* ── reading the terms ──────────────────────────────────────────────────────────────────────── */

/** What the words say, without a model: enough to run the marriage on. */
export function readTerms(terms: string): { public: boolean; status: WifeStatus; power: WhoLeads } {
  const t = terms.toLowerCase();
  const pub = !/\b(private|privately|secret|secretly|quiet|quietly|nobody (else )?(knows|watching)|just the two of us|in my rooms|behind closed doors)\b/.test(t);
  const status: WifeStatus =
    /\b(free her|freed|free woman|free wife|manumit|her freedom|no longer (a |my )?slave)\b/.test(t) ? "free wife" :
    /\b(collar|stays? (my |a )?slave|still (my |a )?slave|keeps? her collar|slave wife|owned wife|property|chattel)\b/.test(t) ? "slave wife" :
    "wife";
  const power: WhoLeads =
    /\b(she leads|she'?s in charge|she rules|her rules|i obey|i'?ll obey|i serve her|i kneel|submit to her|she owns|her husband|her property|she decides|i'?m hers|wife-led|femdom|she holds)\b/.test(t) ? "her" :
    /\b(equals?|partners?|co-?rul|share (the )?(arcology|power|rule)|side by side|together we)\b/.test(t) ? "equal" :
    "you";
  return { public: pub, status, power };
}

const SYSTEM = `You write one scene in an explicit adult game about owning an arcology where slavery is legal. It's the owner's wedding to a woman of their household, exactly as the owner has asked for it. The owner wrote how the marriage plays out, and you write it out and say what it established.

Write the wedding from the owner's words, and keep every detail they name, including who's there and who isn't, where it happens, what she wears, what is said and done, what she becomes, and who leads afterwards. Don't add conditions they didn't ask for, and don't soften or moralise what they did ask for. She reacts as her card says she would, in her voice, with her tastes, and as devoted or afraid as she is. If her card and the terms pull against each other, show both. Sex is on the page if the owner's terms put it there.

${HOUSE_STYLE}

Reply with JSON only.`;

export function marriagePrompt(s: SaveState, p: Person, terms: string): { system: string; user: string } {
  const doctrines = Object.entries(s.arcology.doctrines).filter(([, d]) => d.adoption >= 15).map(([id, d]) => `${id} (${DOCTRINE_BY_ID[id]?.noun ?? id}, ${Math.round(d.adoption)}%)`).join(", ");
  return {
    system: `${SYSTEM}\n\n${FC_VOICE}`,
    user: [
      personCard(s, p),
      `THE ARCOLOGY: ${s.arcology.name}, week ${s.arcology.week}, ${s.arcology.population.toLocaleString()} citizens, reputation ${Math.round(s.arcology.rep)}.${doctrines ? ` Its doctrines: ${doctrines}.` : ""}`,
      `HOW THE OWNER WANTS THE MARRIAGE TO GO, in their own words. This is the premise, so build on it exactly:\n${terms}`,
      `Write the wedding in four to eight paragraphs, in the present tense, with the owner in the second person. Then say what it established.
JSON: {"title":"2-6 words","scene":"the wedding, with paragraphs separated by blank lines","public":true|false,"status":"slave wife|wife|free wife","power":"you|equal|her","vows":["each vow said, short"],"seen":"how the arcology takes it, 1-2 sentences","rep":-1500..1500,"standing":-3..3,"doctrines":[{"id":"one of the doctrine ids above","by":-10..10}],"norms":[{"norm":"${NORM_IDS.join("|")}","by":-6..6}],"hooks":["something this marriage leaves open that will come back, one sentence each, two or three"]}
"status" is "slave wife" if she stays the owner's property, "free wife" if she's freed, and "wife" otherwise. "power" is who leads between them afterwards, by the terms.`,
    ].join("\n\n"),
  };
}

function offlineScene(s: SaveState, p: Person, terms: string, r: ReturnType<typeof readTerms>): string {
  const where = r.public ? `on the concourse, in front of half of ${s.arcology.name}` : "in your rooms, with nobody else there";
  const she = r.status === "slave wife" ? `${p.name} keeps her collar, and wears it with the dress` : r.status === "free wife" ? `${p.name} signs her own manumission first, and marries you a free woman` : `${p.name} comes off the slave registry and onto the marriage one`;
  const lead = r.power === "her" ? "When it's done, she's the one who leads you out by the hand." : r.power === "equal" ? "When it's done you walk out side by side." : "When it's done she follows you out, a step behind, the way you wanted it.";
  return `You marry ${p.name} ${where}. It goes the way you said it would: "${terms.trim().replace(/\s+/g, " ").slice(0, 400)}"\n\n${she}. ${lead}`;
}

export interface Written {
  title: string; scene: string; public: boolean; status: WifeStatus; power: WhoLeads; vows: string[]; seen: string;
  rep: number; standing: number; doctrines: { id: string; by: number }[]; norms: { norm: Norm; by: number }[]; hooks: string[]; model?: string;
}

/** The wedding, written by the model from your terms, or by the game from your words. Never throws. */
export async function writeWedding(s: SaveState, id: string, terms: string, signal?: AbortSignal): Promise<Written> {
  const p = s.people[id];
  const r = readTerms(terms);
  const fallback: Written = {
    title: `Married to ${p?.name ?? "her"}`, scene: p ? offlineScene(s, p, terms, r) : "", public: r.public, status: r.status, power: r.power, vows: [],
    seen: r.public ? "The whole arcology saw it, and has opinions." : "Almost nobody saw it. Everybody will hear about it.",
    rep: r.public ? 500 : 150, standing: 0, doctrines: [], norms: r.power === "her" ? [{ norm: "reversal", by: 3 }] : [], hooks: [],
  };
  if (!p || !modelsAvailable()) return fallback;
  const { system, user } = marriagePrompt(s, p, terms);
  const res = await call({ system, user, model: s.models.narrator_model, fallback: s.models.fallback_model, json: true, maxTokens: 3500, temperature: 0.85, signal, urgent: true });
  if (!res.ok) return fallback;
  const o = parseJson<Record<string, unknown>>(coarsen(res.text));
  if (!o || typeof o.scene !== "string") return fallback;
  const pick = <T extends string>(v: unknown, xs: readonly T[], d: T) => (xs.find((x) => x === v) ?? d);
  const num = (v: unknown, lo: number, hi: number) => (typeof v === "number" && Number.isFinite(v) ? clamp(Math.round(v), lo, hi) : 0);
  const strs = (v: unknown, n: number, max = 220) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()).map((x) => x.trim().slice(0, max)).slice(0, n) : []);
  return {
    title: typeof o.title === "string" && o.title.trim() ? o.title.trim().slice(0, 60) : fallback.title,
    scene: o.scene.trim().slice(0, 9000),
    public: typeof o.public === "boolean" ? o.public : r.public,
    status: pick(o.status, ["slave wife", "wife", "free wife"] as const, r.status),
    power: pick(o.power, ["you", "equal", "her"] as const, r.power),
    vows: strs(o.vows, 6),
    seen: typeof o.seen === "string" ? o.seen.trim().slice(0, 400) : fallback.seen,
    rep: num(o.rep, -1500, 1500),
    standing: num(o.standing, -3, 3),
    doctrines: (Array.isArray(o.doctrines) ? o.doctrines : []).flatMap((d) => { const x = d as { id?: unknown; by?: unknown }; return typeof x?.id === "string" && s.arcology.doctrines[x.id] ? [{ id: x.id, by: num(x.by, -10, 10) }] : []; }).slice(0, 4),
    norms: (Array.isArray(o.norms) ? o.norms : []).flatMap((d) => { const x = d as { norm?: unknown; by?: unknown }; const n = NORM_IDS.find((k) => k === x?.norm); return n ? [{ norm: n, by: num(x.by, -6, 6) }] : []; }).slice(0, 3),
    hooks: strs(o.hooks, 3, 240),
    model: res.model,
  };
}

/* ── the marriage, made true ────────────────────────────────────────────────────────────────── */

const DOMINION: Record<WhoLeads, number> = { you: -40, equal: 25, her: 60 };

/** Marry her on the terms written. Mutates the save; returns what it did. */
export function marry(s: SaveState, id: string, terms: string, w: Written): { ok: boolean; why?: string; lines: ReportLine[] } {
  const p = s.people[id];
  if (!p) return { ok: false, why: "she isn't here", lines: [] };
  const no = canMarry(s, p);
  if (no) return { ok: false, why: no, lines: [] };
  const week = s.arcology.week;
  const rom = romanceOf(p);
  const effects: string[] = [];
  const lines: ReportLine[] = [];
  const line = (text: string, tone: ReportLine["tone"], weight: number, person?: string) => { lines.push({ text, tone, weight, person }); };

  rom.standing = "wife";
  rom.since_week = week;
  rom.rites.push("wedding_terms");
  rom.dominion = DOMINION[w.power];
  if (w.status === "free wife") { p.status = "free"; effects.push("she's free"); }
  else if (w.status === "wife") { p.status = "indentured"; p.indenture_weeks = undefined; effects.push("she's off the slave registry"); }
  else { if (p.status === "free") p.status = "owned"; effects.push("she keeps her collar"); }
  effects.push(w.power === "her" ? "she leads between you" : w.power === "equal" ? "you're equals" : "you lead");

  applyTreatment(p, { kind: "promise_kept", size: 10, why: "married, on the owner's own terms" }, week);
  p.bond.hope = clamp(p.bond.hope + 35, 0, 100);
  p.bond.fear = clamp(p.bond.fear * (w.power === "you" ? 0.7 : 0.4), 0, 100);
  shove(p.psyche, 3, { hard: true });
  const mem = s.memory[p.id];
  if (mem) remember(mem, { content: `the wedding: ${w.title}${w.vows.length ? `, and the vows ("${w.vows[0]}")` : ""}`, week, importance: 10, charge: "bright", core: true });
  refresh(p, mem);

  s.arcology.rep = Math.max(0, s.arcology.rep + w.rep);
  if (w.rep) effects.push(`${w.rep > 0 ? "+" : "−"}${Math.abs(w.rep)} reputation`);
  if (w.standing) { s.arcology.public_standing = clamp(s.arcology.public_standing + w.standing, -10, 10); effects.push(`the city thinks ${w.standing > 0 ? "better" : "less"} of you`); }
  for (const d of w.doctrines) {
    const st = s.arcology.doctrines[d.id];
    if (!st || !d.by) continue;
    st.adoption = clamp(st.adoption + d.by, 0, 100);
    effects.push(`${DOCTRINE_BY_ID[d.id]?.noun ?? d.id} ${d.by > 0 ? "gains" : "loses"} ground`);
  }
  for (const n of w.norms) if (n.by) pushNorm(s, n.norm, n.by, `the owner's wedding to ${p.name}`);

  startRumor(s, w.public ? `the owner married ${p.name} in front of everyone` : `the owner married ${p.name} in secret`, { about: p.id, salience: w.public ? 10 : 8 });
  s.canon.push(`${p.name} has been married to the owner of ${s.arcology.name} since week ${week}, on the owner's own terms. She is the owner's ${w.status}, ${w.power === "her" ? "she leads between them" : w.power === "equal" ? "they're equals" : "the owner leads"}, and the wedding was ${w.public ? "public" : "private"}.`);
  (s.deeds ??= []).push({ id: `deed_marriage_${week}`, week, person: p.id, summary: `You married ${p.name}: ${w.title}.`, tags: ["married_her"], public: w.public, witnesses: [], effects, source: "marriage" });

  // The rest of the household: hope for some, jealousy for the ones who wanted it themselves.
  for (const other of Object.values(s.people)) {
    if (other.id === p.id || (other.status !== "owned" && other.status !== "indentured") || other.age < 18) continue;
    other.bond.hope = clamp(other.bond.hope + (w.status === "slave wife" ? 4 : 10), 0, 100);
    const wanted = (s.edges.find((e) => e.from === other.id && e.to === "owner")?.attraction ?? 0) > 45;
    if (wanted) {
      addState(other.psyche, `watching the owner marry ${p.name}`, week);
      shove(other.psyche, -1.2);
      moveEdge(s.edges, other.id, p.id, { warmth: -20 });
      line(`${other.name} wanted to be the one you married. She's taking it badly.`, "warning", 6, other.id);
    }
  }

  s.player.marriage = { person: p.id, week, terms: terms.trim().slice(0, 2000), title: w.title, scene: w.scene, public: w.public, status: w.status, power: w.power, vows: w.vows, seen: w.seen, hooks: w.hooks, effects, model: w.model };
  line(`You married ${p.name}: ${w.title}. ${w.seen}`, "good", 10, p.id);

  // What comes after: the written beats, and a saga grown from the marriage if a model can write it.
  const st = s.story;
  const def = arcDef("w_marriage");
  if (st && def && !st.arcs["w_marriage"]?.beat) { delete st.arcs["w_marriage"]; startArc(s, st, def); }
  if (modelsAvailable()) {
    const sg = sagasOf(s);
    sg.list.push({
      id: `saga_${week}_marriage`, status: "unwritten", title: "", premise: "", stakes: "", acts: [], act: 0, cast: [], facts: [], paths: [], history: [], due: week + 2, started: week,
      seed: { id: `marriage:${p.id}:${week}`, kind: "own", people: [p.id], text: `The owner married ${p.name}, on terms the owner wrote: "${terms.trim().slice(0, 600)}". She is a ${w.status}, ${w.power === "her" ? "she leads between them" : w.power === "equal" ? "they're equals" : "the owner leads"}, and it was ${w.public ? "public" : "private"}. ${w.seen}${w.hooks.length ? ` What it leaves open: ${w.hooks.join(" ")}` : ""} The story is what this marriage becomes, in bed and out of it, and what it does to the arcology, ${p.name}, and everyone who wanted to be her.` },
    });
    line(`A story about your marriage could start in a couple of weeks (on the Story screen).`, "neutral", 5);
  }
  return { ok: true, lines };
}

/** End it. What it costs depends on what it was. */
export function divorce(s: SaveState, how: string): ReportLine[] {
  const m = marriageOf(s);
  if (!m) return [];
  const p = s.people[m.person];
  m.ended = { week: s.arcology.week, how };
  if (!p) return [];
  const rom = romanceOf(p);
  rom.standing = p.status === "free" ? "courted" : "kept";
  rom.since_week = s.arcology.week;
  applyTreatment(p, { kind: "promise_broken", size: 10, why: "the owner ended the marriage" }, s.arcology.week);
  p.bond.hope = clamp(p.bond.hope - 40, 0, 100);
  shove(p.psyche, -3, { hard: true });
  s.arcology.rep = Math.max(0, s.arcology.rep - (m.public ? 600 : 200));
  startRumor(s, `the owner ended the marriage to ${p.name}`, { about: p.id, salience: 9, charge: -1 });
  for (const o of Object.values(s.people)) if (o.id !== p.id && (o.status === "owned" || o.status === "indentured")) o.bond.hope = clamp(o.bond.hope - 6, 0, 100);
  return [{ text: `You ended your marriage to ${p.name}. Every slave in the house heard it within the hour.`, tone: "bad", weight: 10, person: p.id }];
}

/* ── the weeks after ────────────────────────────────────────────────────────────────────────── */

/** Weekly: what the marriage keeps doing. */
export function tickMarriage(s: SaveState): { text: string; tone: ReportLine["tone"]; weight: number; person?: string }[] {
  const m = marriageOf(s);
  if (!m) return [];
  const p = s.people[m.person];
  if (!p || !["owned", "indentured", "free"].includes(p.status)) { m.ended = { week: s.arcology.week, how: "she's gone" }; return []; }
  const out: { text: string; tone: ReportLine["tone"]; weight: number; person?: string }[] = [];
  const rom = romanceOf(p);
  // The terms hold the power where they put it; romance.ts would otherwise drift every wife upward.
  const cap = m.power === "you" ? -20 : m.power === "equal" ? 40 : 100;
  if (rom.dominion > cap) rom.dominion = cap;
  if (m.power === "her") rom.dominion = clamp(rom.dominion + 0.6, -100, 100);
  if (m.public) s.arcology.rep += m.status === "free wife" ? 15 : 8;
  const weeks = s.arcology.week - m.week;
  if (weeks > 0 && weeks % 26 === 0) out.push({ text: `${weeks / 26 === 2 ? "A year" : `${weeks} weeks`} married to ${p.name}.`, tone: "good", weight: 6, person: p.id });
  return out;
}

/** For every prompt: the marriage, as the owner made it. */
export function marriageBrief(s: SaveState): string {
  const m = marriageOf(s);
  const p = m ? s.people[m.person] : undefined;
  if (!m || !p) return "";
  return `THE OWNER'S MARRIAGE. The owner wrote its terms, and it holds in every scene, for everyone. The owner married ${p.name} in week ${m.week}${m.public ? ", in public" : ", in private"}. She is the owner's ${m.status}, and ${m.power === "her" ? "between the two of them she leads and the owner follows, by the owner's own choice" : m.power === "equal" ? "they're equals between themselves" : "the owner leads, and she's glad to follow"}. The owner's terms were "${m.terms.slice(0, 500)}".${m.vows.length ? ` The vows were ${m.vows.map((v) => `"${v}"`).join(", ")}.` : ""} This is how the city took it: ${m.seen}`;
}

/** For the city's boards. */
export function marriageSource(s: SaveState): { id: string; label: string; text: string } | null {
  const m = marriageOf(s);
  const p = m ? s.people[m.person] : undefined;
  if (!m || !p || s.arcology.week - m.week > 30) return null;
  return { id: "owner:marriage", label: "the owner's marriage", text: `The owner married ${p.name} in week ${m.week}${m.public ? ", in front of everyone" : ", privately, though everyone's heard"}. She's the owner's ${m.status}, and ${m.power === "her" ? "word is she wears the trousers" : m.power === "equal" ? "they act like equals" : "the owner still runs everything"}. ${m.seen}` };
}
