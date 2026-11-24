/**
 * HOW SHE TALKS, IN NUMBERS.
 *
 * A model asked to invent a voice invents the same one every time: quiet, short sentences. Asked
 * to keep to a sentence describing a voice, it reads the sentence and writes its own house rhythm
 * anyway. So her voice is numbers, rolled once from her id like her body is, and shaped by who she
 * is: a temperament (the five usual axes) and a set of speech dials that follow from it, her
 * schooling, her age and where she grew up. The numbers go into every prompt as targets, and what
 * the model actually wrote is measured against them, so a reply that came out in someone else's
 * rhythm is named and the next one is corrected.
 *
 * Nothing here is written by a model, and nothing a model writes changes it. Her state on the day
 * (scared, easy, exhausted, turned on) bends the targets; it never rewrites them.
 */
import type { Person } from "./types";
import { rng } from "./rng";

/** The five usual axes, 0–1. */
export interface Temperament {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface SpeechDials {
  /** Words of speech in an ordinary reply to an ordinary question. */
  words: number;
  /** Mean words per sentence. */
  sentence: number;
  /** 0 every sentence the same length … 1 a word, then forty. */
  spread: number;
  /** Chance, 0–1, that a line of hers has a fumble in it (a restart, a lost word, a correction). */
  fumble: number;
  /** Frightened, does she go quiet or talk more? */
  stress: "clams" | "babbles";
  /** 0 slangy, all contractions … 1 formal, careful. */
  formality: number;
  /** Swears per hundred words. */
  swearing: number;
  /** 0 circles round it … 1 says it straight out. */
  directness: number;
  /** 0 stays on the point … 1 wanders off it. */
  tangents: number;
  /** 0 earnest … 1 jokes her way through things. */
  humour: number;
  /** 0 never asks back … 1 asks you as much as you ask her. */
  asks: number;
  /** 0 says nothing of what she feels … 1 says all of it. */
  feeling: number;
  /** 0 plain words … 1 a big vocabulary. */
  vocabulary: number;
  /** Filler words she leans on, if any. */
  fillers: string[];
  /** A way she often starts. */
  opener?: string;
  /** English as a second language: her own, and how good her English is, 0–1. */
  second?: { language: string; fluency: number };
  v: number;
}

export const SPEECH_V = 1;

const LANGUAGE: Record<string, string> = {
  Japanese: "Japanese", Chinese: "Mandarin", Russian: "Russian", Brazilian: "Portuguese", Egyptian: "Arabic",
  German: "German", Indian: "Hindi", Mexican: "Spanish", French: "French", Ukrainian: "Ukrainian", Filipina: "Tagalog",
  Vietnamese: "Vietnamese", Ethiopian: "Amharic", Italian: "Italian",
};

const FILLERS = ["like", "you know", "I mean", "kind of", "anyway", "right?", "so", "honestly", "or whatever", "I guess"];
const OPENERS = ["Look,", "Okay, so", "Well,", "I mean,", "See,", "Thing is,", "No, but", "Listen,", "Honestly?", "So, yeah,"];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const round = (x: number, d = 2) => Math.round(x * 10 ** d) / 10 ** d;

/** Her temperament, rolled once and kept. */
export function temperamentOf(p: Person): Temperament {
  const t = p.persona.temperament;
  if (t) return t;
  const r = rng(`${p.id}:temperament`);
  // Two dice averaged: most people near the middle, some at the ends, nobody all the same.
  const roll = () => round((r() + r()) / 2);
  const out: Temperament = { openness: roll(), conscientiousness: roll(), extraversion: roll(), agreeableness: roll(), neuroticism: roll() };
  // What the game already knows about her pulls on it a little.
  out.extraversion = round(clamp01(0.7 * out.extraversion + 0.3 * (p.persona.gregariousness ?? 0.5)));
  out.agreeableness = round(clamp01(0.8 * out.agreeableness + 0.2 * (p.persona.conscience ?? 0.5)));
  p.persona.temperament = out;
  return out;
}

const IQ = { impaired: 0, slow: 0.25, average: 0.5, sharp: 0.75, brilliant: 1 } as const;

/** Her speech dials, rolled once from her id and who she is, and kept. */
export function dialsOf(p: Person): SpeechDials {
  const have = p.persona.speech;
  if (have && have.v === SPEECH_V) return have;
  const t = temperamentOf(p);
  const r = rng(`${p.id}:speech`);
  const mix = (...xs: [number, number][]) => clamp01(xs.reduce((a, [w, x]) => a + w * x, 0));
  const ed = (p.persona.education ?? 50) / 100;
  const iq = IQ[p.persona.intelligence] ?? 0.5;
  const older = clamp01((p.age - 22) / 25);
  const vocabulary = mix([0.55, ed], [0.25, iq], [0.2, r()]);
  const formality = mix([0.3, t.conscientiousness], [0.3, ed], [0.2, older], [0.2, r()]);
  // The two numbers you hear first get a die of their own with most of the weight, stretched at the
  // ends, so a household has a woman who barely speaks and one who never stops.
  const stretch = (x: number) => clamp01(0.5 + 1.35 * (x - 0.5));
  const talky = stretch(mix([0.35, t.extraversion], [0.65, r()]));
  const d: SpeechDials = {
    words: Math.round(5 + 105 * talky ** 1.4),
    sentence: Math.round(4 + 22 * stretch(mix([0.3, vocabulary], [0.1, t.openness], [0.6, r()])) ** 1.2),
    spread: round(mix([0.4, t.openness], [0.3, t.neuroticism], [0.3, r()])),
    fumble: round(0.05 + 0.5 * mix([0.6, t.neuroticism], [0.2, 1 - t.conscientiousness], [0.2, r()])),
    stress: r() < 0.1 + 0.8 * t.extraversion ? "babbles" : "clams",
    formality: round(formality),
    swearing: round(8 * mix([0.4, 1 - t.agreeableness], [0.3, 1 - formality], [0.3, r()]) ** 1.6, 1),
    directness: round(mix([0.3, 1 - t.neuroticism], [0.2, t.conscientiousness], [0.5, r()])),
    tangents: round(mix([0.4, t.openness], [0.3, 1 - t.conscientiousness], [0.3, r()])),
    humour: round(mix([0.3, t.extraversion], [0.3, t.openness], [0.4, r()])),
    asks: round(mix([0.3, t.agreeableness], [0.3, t.extraversion], [0.4, r()])),
    feeling: round(mix([0.3, t.extraversion], [0.2, t.neuroticism], [0.5, r()])),
    vocabulary: round(vocabulary),
    fillers: [],
    v: SPEECH_V,
  };
  const nFill = r() < 0.3 + 0.4 * formality ? 0 : r() < 0.75 ? 1 : 2;
  const pool = [...FILLERS];
  for (let i = 0; i < nFill; i++) d.fillers.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  if (r() < 0.4) {
    const pick = OPENERS[Math.floor(r() * OPENERS.length)];
    if (!d.fillers.some((f) => pick.toLowerCase().startsWith(f.toLowerCase()))) d.opener = pick;
  }
  const lang = LANGUAGE[p.origin.nationality];
  if (lang) d.second = { language: lang, fluency: round(mix([0.5, ed], [0.2, iq], [0.3, r()])) };
  p.persona.speech = d;
  return d;
}

/** What her dials come to today: fear, ease, tiredness and arousal bend them. */
export function liveDials(p: Person): SpeechDials {
  const d = { ...dialsOf(p) };
  const rel = p.psyche.relaxation;
  if (p.psyche.state === "broken") { d.words *= 0.35; d.sentence *= 0.6; d.feeling *= 0.2; d.humour = 0; d.asks = 0; }
  else if (rel <= -3) {
    const k = Math.min(1, (-rel - 2) / 6);
    if (d.stress === "clams") { d.words *= 1 - 0.55 * k; d.sentence *= 1 - 0.3 * k; d.asks *= 1 - k; }
    else { d.words *= 1 + 0.5 * k; d.spread = clamp01(d.spread + 0.3 * k); d.tangents = clamp01(d.tangents + 0.3 * k); }
    d.fumble = clamp01(d.fumble + 0.35 * k);
    d.humour *= d.stress === "babbles" ? 1 : 1 - k;
  } else if (rel >= 3) { d.words *= 1.15; d.fumble *= 0.7; d.humour = clamp01(d.humour + 0.1); d.feeling = clamp01(d.feeling + 0.15); }
  if (p.health.energy < 25) { d.words *= 0.7; d.fumble = clamp01(d.fumble + 0.15); }
  if (p.psyche.arousal >= 70) { d.sentence *= 0.75; d.fumble = clamp01(d.fumble + 0.15); }
  d.words = Math.max(3, Math.round(d.words));
  d.sentence = Math.max(3, Math.round(d.sentence));
  return d;
}

const band = (x: number, words: string[]) => words[Math.min(words.length - 1, Math.floor(x * words.length))];

/** Her voice in the prompt: targets in numbers, and what each one looks like. */
export function speechLine(p: Person): string {
  const d = liveDials(p);
  const out: string[] = [];
  out.push(`An ordinary answer from her is about ${d.words} words of speech, in sentences of about ${d.sentence} words${d.spread > 0.6 ? ", though they swing wildly: a word or two, then a long run-on" : d.spread < 0.25 ? ", all much the same length" : ", some shorter, some longer"}.`);
  out.push(`About ${Math.round(d.fumble * 10)} in 10 of her lines have a fumble in them (she restarts, loses a word, corrects herself, trails off).`);
  if (p.psyche.relaxation <= -3) out.push(d.stress === "clams" ? "Scared, she clams up: less and less comes out." : "Scared, she babbles: more comes out, faster, and she can't stop.");
  out.push(`She ${d.swearing < 0.5 ? "almost never swears" : d.swearing < 2 ? "swears now and then" : d.swearing < 4.5 ? "swears a lot, a couple of times a reply" : "swears in nearly every sentence"} (about ${d.swearing} in every hundred words).`);
  out.push(`Her way of speaking is ${band(d.formality, ["slangy and loose, all contractions", "casual", "ordinary", "careful and correct", "formal, almost stiff"])}, with ${band(d.vocabulary, ["plain, small words", "everyday words", "a decent vocabulary", "a wide vocabulary", "big, precise words"])}.`);
  out.push(`She ${band(d.directness, ["circles round anything hard and almost never says it straight", "takes the long way to the point", "gets there", "mostly says it straight", "says it straight out, first thing"])}, ${band(d.tangents, ["stays on the point", "rarely wanders", "wanders off it now and then", "wanders off it a lot", "can't stay on one thing"])}, and ${band(d.humour, ["is earnest, no jokes", "jokes rarely", "jokes sometimes", "jokes a lot", "jokes her way through everything, even the bad stuff"])}.`);
  out.push(`She ${band(d.feeling, ["says nothing about what she feels", "lets very little of what she feels out", "says some of what she feels", "says a lot of what she feels", "says everything she feels, out loud"])} and ${band(d.asks, ["never asks anything back", "rarely asks back", "asks back sometimes", "often asks back", "asks you as much as you ask her"])}.`);
  if (d.fillers.length) out.push(`She leans on ${d.fillers.map((f) => `"${f}"`).join(" and ")}.`);
  if (d.opener) out.push(`She often starts with "${d.opener}"`);
  if (d.second) out.push(`English is her second language; ${d.second.language} is her first. Her English is ${band(d.second.fluency, ["broken: dropped words, wrong tenses, she reaches for words and doesn't find them", "rough: small grammar slips in most lines and the odd wrong word", "good, with an accent and the odd slip", "near-fluent, with an accent", "fluent"])}${d.second.fluency < 0.8 ? `, and when she's upset or swearing a word of ${d.second.language} comes out` : ""}.`);
  return `HOW SHE TALKS, IN NUMBERS (these are her: keep to them; they win over any description of her voice above unless the player wrote it): ${out.join(" ")}`;
}

/* ── measuring what was written ─────────────────────────────────────────────────────────── */

export const SWEAR = /\b(fuck\w*|shit\w*|cunt\w*|cock\w*|dick\w*|ass(hole)?|bitch\w*|damn\w*|piss\w*|tits?|bastard\w*|crap)\b/gi;
const FUMBLE = [
  /\b(\w+)[-—–]\s*\1\b/i, /\b(\w{1,3})-\1/i, /\b(\w+),?\s+\1\b/i, /\.\.\.|…/,
  /—\s*(no|i mean|wait|sorry|that's not)/i, /\b(um+|uh+|er+|erm|hm+)\b/i, /\w[-—]$/,
  /\bi mean\b|\bwhat i meant\b|\bhow do i say\b/i,
];
export const fumbled = (q: string) => FUMBLE.some((r) => r.test(q));
const words = (t: string) => t.split(/\s+/).filter((w) => /[a-z]/i.test(w));
const sentences = (t: string) => t.split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter((x) => words(x).length);

/** The quoted speech in a piece of prose. */
export function spoken(prose: string): string[] {
  return [...prose.split(/\n\s*OPTIONS:/)[0].matchAll(/["“]([^"”]{1,800})["”]/g)].map((m) => m[1].trim()).filter(Boolean);
}

export interface Measured { words: number; sentence: number; fumble: number; swearing: number; lines: number }

export function measure(quotes: string[]): Measured {
  const text = quotes.join(" ");
  const w = words(text).length;
  const s = quotes.flatMap(sentences);
  return {
    words: w,
    sentence: s.length ? round(s.reduce((a, x) => a + words(x).length, 0) / s.length, 1) : 0,
    fumble: quotes.length ? round(quotes.filter(fumbled).length / quotes.length) : 0,
    swearing: w ? round(100 * (text.match(SWEAR)?.length ?? 0) / w, 1) : 0,
    lines: quotes.length,
  };
}

/**
 * HOW FAR THE LAST REPLY CAME OUT FROM HER. Named in the next prompt, which is the one correction
 * a model reliably acts on. Only the big misses are named: a reply's length follows what was asked
 * as much as who she is, so a single short answer to "yes or no?" is not a miss.
 */
export function driftLine(p: Person, quotes: string[]): string {
  if (!quotes.length) return "";
  const m = measure(quotes), d = liveDials(p);
  const miss: string[] = [];
  if (m.sentence && (m.sentence < d.sentence * 0.6 || m.sentence > d.sentence * 1.7)) miss.push(`her sentences came out at ${m.sentence} words; hers run about ${d.sentence}`);
  if (m.words < d.words * 0.4 && d.words >= 20) miss.push(`she said ${m.words} words; she'd say about ${d.words}`);
  if (m.words > d.words * 2.5 && d.words <= 30) miss.push(`she said ${m.words} words; she'd say about ${d.words}`);
  if (Math.abs(m.swearing - d.swearing) > 3 && m.words >= 25) miss.push(`she swore ${m.swearing} times in a hundred words; she swears about ${d.swearing}`);
  if (m.lines >= 3 && d.fumble >= 0.3 && m.fumble === 0) miss.push(`none of her lines had a fumble; about ${Math.round(d.fumble * 10)} in 10 of hers do`);
  if (!miss.length) return "";
  const first = p.name.split(" ")[0];
  return `${first.toUpperCase()} CAME OUT WRONG LAST TIME: ${miss.join("; ")}. Write her to her numbers this time.`;
}
