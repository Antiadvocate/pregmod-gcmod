/**
 * THE VOICE PROBE — why every line in this game reads like a proverb.
 *
 *   npm run voice            the numbers
 *   npm run voice -- -v      and the worst offenders per file
 *
 * `src/engine/prompts.ts` tells the model, in NARRATOR_SYSTEM: "No maxims: nobody delivers a
 * portable general truth about life." Weft ships a whole module to catch the model doing it anyway.
 * Neither of those applies to the ~1350 strings in this repo that the engine prints directly,
 * and those are the ones the player actually reads. A single screen of real play:
 *
 *     The room did not go quiet, which was worse.
 *     Nothing was said. She noticed that too.
 *     Nothing changed, which is its own decision.
 *     Twelve thousand, and the suppliers stayed.
 *     Both punished. Neither learned the lesson you meant.
 *     A woman produces. That is what she is.
 *
 * THE CAUSE IS MECHANICAL, NOT A MATTER OF TASTE. Measured over the corpus, before any of this was
 * fixed: median sentence eight words, 77% of sentences under twelve, 1% over twenty-five. Eighteen
 * per cent of sentences contain a subordinating connective of any kind, and the word "because"
 * appears TEN TIMES in sixteen hundred sentences. Three per cent of strings contain anything anyone
 * says out loud.
 *
 * That combination cannot produce anything but aphorism. A maxim IS a short clause with the
 * connective removed — you assert a relation by putting two things side by side and refusing to say
 * how they relate, and the reader does the work and hears wisdom. Write every sentence at eight
 * words with no "because" in it and you are writing proverbs whether or not you meant to. The
 * register is not a style that was chosen; it is what is left when subordination and sentence-length
 * variance are both missing.
 *
 * SO THE FIX IS NOT "USE FEWER GOOD LINES." None of those lines is bad alone. "Both punished.
 * Neither learned the lesson you meant." is a good line. The problem is it is also every other line,
 * and a turn needs flat ground to turn against. What this probe enforces is the flat ground:
 * long sentences exist, relations get stated, people talk.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const VERBOSE = process.argv.includes("-v");

/* ── the corpus ─────────────────────────────────────────────────────────────────────────────
 * Crude on purpose: over-collect, then throw junk away on a word gate. Cheaper than parsing TS,
 * and the only cost of a stray match is a slightly noisy denominator. */
interface Str { file: string; line: number; text: string }

function corpus(dir: string): Str[] {
  const files: string[] = [];
  (function walk(d: string) {
    for (const e of readdirSync(d)) {
      if (e === "node_modules") continue;
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p); else if (/\.tsx?$/.test(p)) files.push(p);
    }
  })(dir);

  const out: Str[] = [];
  for (const f of files) {
    readFileSync(f, "utf8").split("\n").forEach((ln, i) => {
      if (/^\s*(?:\/\/|\*|\/\*)/.test(ln)) return;       // comments are prose about prose
      const re = /[`'"]([^`'"\n]{24,})[`'"]/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(ln))) {
        const raw = m[1];
        if (!/[a-z] [a-z]/.test(raw)) continue;
        if (/=>|\bfunction\b|\bimport\b|===|\bconst\b|className|^[\w.\-\/]+$/.test(raw)) continue;
        // An interpolation stands for the name it will print, so the sentence scans as a sentence.
        const text = raw.replace(/\$\{[^}]*\}/g, "Nadia");
        if (text.split(/\s+/).length < 5) continue;
        out.push({ file: f.replace(/^src\//, ""), line: i + 1, text });
      }
    });
  }
  return out;
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter((x) => words(x) >= 2);

/** Subordination — the machinery for saying how one thing bears on another. Its absence is what
 *  turns an ordinary observation into a pronouncement. */
const CONNECTIVE = /\b(?:because|so that|in order to|although|though|whereas|while|since|unless|until|before|after|if|when|whenever|which|who|whom|whose|that)\b/i;

/** Anything anybody says out loud, including reported speech. */
const SPEECH = /["“”]|\b(?:said|says|told|asked|answered|calls it|calls her)\b/;

/* ── the measurements ────────────────────────────────────────────────────────────────────── */

interface Budget { name: string; got: number; want: string; ok: boolean; why: string }

const all = corpus("src");
const sents = all.flatMap((r) => sentences(r.text));
const lens = sents.map(words).sort((a, b) => a - b);
const pct = (p: number) => lens[Math.min(lens.length - 1, Math.floor(lens.length * p))];

const longRate = lens.filter((n) => n > 22).length / lens.length;
const shortRate = lens.filter((n) => n < 12).length / lens.length;
const connRate = sents.filter((s) => CONNECTIVE.test(s)).length / sents.length;
const becauses = sents.filter((s) => /\b(?:because|so that)\b/i.test(s)).length;
const speechRate = all.filter((r) => SPEECH.test(r.text)).length / all.length;

/** The signature move: two or more short sentences jammed together with no connective, the second
 *  one recontextualising the first. One of these is a good line. A corpus of them is a drone. */
const paratactic = all.filter((r) => {
  const ss = sentences(r.text);
  return ss.length >= 2 && ss.every((x) => words(x) <= 13)
    && !ss.slice(1).some((x) => /^(?:But|And|So|Because|Then|Which|Though)\b/i.test(x));
});

const budgets: Budget[] = [
  { name: "long sentences exist", got: longRate, want: "≥ 8% over 22 words", ok: longRate >= 0.08,
    why: "nothing long enough to need a comma means nothing that isn't an epigram" },
  { name: "not all of them are short", got: shortRate, want: "≤ 65% under 12 words", ok: shortRate <= 0.65,
    why: "one sentence length for 1600 sentences is a drone, whatever the words are" },
  { name: "relations get stated", got: connRate, want: "≥ 30% take a connective", ok: connRate >= 0.30,
    why: "juxtaposition without a connective IS the maxim; it is the whole mechanism" },
  { name: "people talk", got: speechRate, want: "≥ 10% carry speech", ok: speechRate >= 0.10,
    why: "nine women in the building and one narrator doing all nine voices" },
  { name: "paratactic pairs are rare", got: paratactic.length / all.length, want: "≤ 7% of strings", ok: paratactic.length / all.length <= 0.07,
    why: "'Nothing was said. She noticed that too.' — good once, fatal eight hundred times" },
];

console.log(`VOICE — ${all.length} printed strings, ${sents.length} sentences\n`);
console.log(`sentence length   p10 ${pct(.1)}   p25 ${pct(.25)}   median ${pct(.5)}   p75 ${pct(.75)}   p90 ${pct(.9)}   max ${lens[lens.length - 1]}`);
console.log(`"because"/"so that" in the whole corpus: ${becauses}\n`);

let failed = 0;
for (const b of budgets) {
  if (!b.ok) failed++;
  console.log(`${b.ok ? "ok  " : "OVER"} ${b.name.padEnd(26)} ${(Math.round(b.got * 100) + "%").padStart(5)}   ${b.want}`);
  if (!b.ok) console.log(`     ${b.why}`);
}

/* ── where it is worst ───────────────────────────────────────────────────────────────────── */
const byFile = new Map<string, Str[]>();
for (const r of all) { if (!byFile.has(r.file)) byFile.set(r.file, []); byFile.get(r.file)!.push(r); }

const rows = [...byFile.entries()]
  .filter(([, l]) => l.length >= 10)
  .map(([file, list]) => {
    const ss = list.flatMap((r) => sentences(r.text));
    const conn = ss.filter((s) => CONNECTIVE.test(s)).length / (ss.length || 1);
    const para = list.filter((r) => paratactic.includes(r)).length;
    return { file, n: list.length, conn, para, list };
  })
  .sort((a, b) => a.conn - b.conn);

console.log(`\n${"file".padEnd(28)} ${"strings".padStart(7)} ${"connective".padStart(10)} ${"paratactic".padStart(10)}`);
console.log("─".repeat(60));
for (const r of rows) {
  console.log(`${r.file.padEnd(28)} ${String(r.n).padStart(7)} ${(Math.round(r.conn * 100) + "%").padStart(10)} ${String(r.para).padStart(10)}`);
  if (VERBOSE && r.para) {
    for (const x of r.list.filter((y) => paratactic.includes(y)).slice(0, 8)) {
      console.log(`     ${String(x.line).padStart(4)}  ${x.text.slice(0, 92)}`);
    }
  }
}

console.log(`\n${failed ? `${failed} budget${failed > 1 ? "s" : ""} over the line` : "within budget"}`);
if (!VERBOSE) console.log("run with -- -v for the offending lines");
