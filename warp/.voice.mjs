// tools/voice.ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
var VERBOSE = process.argv.includes("-v");
function corpus(dir) {
  const files = [];
  (function walk(d) {
    for (const e of readdirSync(d)) {
      if (e === "node_modules") continue;
      const p = join(d, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(p)) files.push(p);
    }
  })(dir);
  const out = [];
  for (const f of files) {
    readFileSync(f, "utf8").split("\n").forEach((ln, i) => {
      if (/^\s*(?:\/\/|\*|\/\*)/.test(ln)) return;
      const re = /[`'"]([^`'"\n]{24,})[`'"]/g;
      let m;
      while (m = re.exec(ln)) {
        const raw = m[1];
        if (!/[a-z] [a-z]/.test(raw)) continue;
        if (/=>|\bfunction\b|\bimport\b|===|\bconst\b|className|^[\w.\-\/]+$/.test(raw)) continue;
        if (/\b(?:flex|grid|px-|py-|mt-|mb-|gap-|text-\[|w-\[|min-w|shrink|overflow|items-|justify-)/.test(raw)) continue;
        const text = raw.replace(/\$\{[^}]*\}/g, "Nadia").trim();
        if (text.split(/\s+/).length < 5) continue;
        if (!/[.!?]$/.test(text)) continue;
        out.push({ file: f.replace(/^src\//, ""), line: i + 1, text });
      }
    });
  }
  return out;
}
var words = (s) => s.split(/\s+/).filter(Boolean).length;
var sentences = (s) => s.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter((x) => words(x) >= 2);
var CONNECTIVE = /\b(?:because|so that|in order to|although|though|whereas|while|since|unless|until|before|after|if|when|whenever|which|who|whom|whose|that)\b/i;
var SPEECH = /["“”]|\b(?:said|says|told|asked|answered|calls it|calls her)\b/;
var all = corpus("src");
var sents = all.flatMap((r) => sentences(r.text));
var lens = sents.map(words).sort((a, b) => a - b);
var pct = (p) => lens[Math.min(lens.length - 1, Math.floor(lens.length * p))];
var longRate = lens.filter((n) => n > 22).length / lens.length;
var shortRate = lens.filter((n) => n < 12).length / lens.length;
var connRate = sents.filter((s) => CONNECTIVE.test(s)).length / sents.length;
var becauses = sents.filter((s) => /\b(?:because|so that)\b/i.test(s)).length;
var speechRate = all.filter((r) => SPEECH.test(r.text)).length / all.length;
var paratactic = all.filter((r) => {
  const ss = sentences(r.text);
  return ss.length >= 2 && ss.every((x) => words(x) <= 13) && !ss.slice(1).some((x) => /^(?:But|And|So|Because|Then|Which|Though)\b/i.test(x));
});
var budgets = [
  {
    name: "long sentences exist",
    got: longRate,
    want: "\u2265 8% over 22 words",
    ok: longRate >= 0.08,
    why: "nothing long enough to need a comma means nothing that isn't an epigram"
  },
  {
    name: "not all of them are short",
    got: shortRate,
    want: "\u2264 65% under 12 words",
    ok: shortRate <= 0.65,
    why: "one sentence length for 1600 sentences is a drone, whatever the words are"
  },
  {
    name: "relations get stated",
    got: connRate,
    want: "\u2265 30% take a connective",
    ok: connRate >= 0.3,
    why: "juxtaposition without a connective IS the maxim; it is the whole mechanism"
  },
  {
    name: "people talk",
    got: speechRate,
    want: "\u2265 10% carry speech",
    ok: speechRate >= 0.1,
    why: "nine women in the building and one narrator doing all nine voices"
  },
  {
    name: "paratactic pairs are rare",
    got: paratactic.length / all.length,
    want: "\u2264 10% of strings",
    ok: paratactic.length / all.length <= 0.1,
    why: "'Nothing was said. She noticed that too.' \u2014 good once, fatal eight hundred times"
  }
];
console.log(`VOICE \u2014 ${all.length} narration strings, ${sents.length} sentences
`);
console.log(`sentence length   p10 ${pct(0.1)}   p25 ${pct(0.25)}   median ${pct(0.5)}   p75 ${pct(0.75)}   p90 ${pct(0.9)}   max ${lens[lens.length - 1]}`);
console.log(`"because"/"so that" in the whole corpus: ${becauses}
`);
var failed = 0;
for (const b of budgets) {
  if (!b.ok) failed++;
  console.log(`${b.ok ? "ok  " : "OVER"} ${b.name.padEnd(26)} ${(Math.round(b.got * 100) + "%").padStart(5)}   ${b.want}`);
  if (!b.ok) console.log(`     ${b.why}`);
}
var byFile = /* @__PURE__ */ new Map();
for (const r of all) {
  if (!byFile.has(r.file)) byFile.set(r.file, []);
  byFile.get(r.file).push(r);
}
var rows = [...byFile.entries()].filter(([, l]) => l.length >= 6).map(([file, list]) => {
  const ss = list.flatMap((r) => sentences(r.text));
  const conn = ss.filter((s) => CONNECTIVE.test(s)).length / (ss.length || 1);
  const para = list.filter((r) => paratactic.includes(r)).length;
  return { file, n: list.length, conn, para, list };
}).sort((a, b) => a.conn - b.conn);
console.log(`
${"file".padEnd(28)} ${"narr".padStart(7)} ${"connective".padStart(10)} ${"paratactic".padStart(10)}`);
console.log("\u2500".repeat(60));
for (const r of rows) {
  console.log(`${r.file.padEnd(28)} ${String(r.n).padStart(7)} ${(Math.round(r.conn * 100) + "%").padStart(10)} ${String(r.para).padStart(10)}`);
  if (VERBOSE && r.para) {
    for (const x of r.list.filter((y) => paratactic.includes(y)).slice(0, 8)) {
      console.log(`     ${String(x.line).padStart(4)}  ${x.text.slice(0, 92)}`);
    }
  }
}
console.log(`
${failed ? `${failed} budget${failed > 1 ? "s" : ""} over the line` : "within budget"}`);
if (!VERBOSE) console.log("run with -- -v for the offending lines");
