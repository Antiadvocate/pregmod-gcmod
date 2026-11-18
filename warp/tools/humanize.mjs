#!/usr/bin/env node
/**
 * Rewrite Warp's model instructions without touching code.
 *
 * The text is found with the TypeScript parser, copied out as JSON, rewritten
 * outside the file, and spliced back into the exact string ranges it came from.
 * Identifiers, keys, `${...}`, escapes and every byte outside those ranges stay put.
 * `apply` then re-parses each file and compares the old and new source with the
 * selected ranges masked out, so any change to code is a hard error.
 *
 *   node tools/humanize.mjs extract --root src/engine --out .humanize/prompts
 *   node tools/humanize.mjs extract --root src/views --out .humanize/ui --all --min 60
 *   node tools/humanize.mjs apply   --out .humanize/prompts --rewrites <file.json>
 *   node tools/humanize.mjs verify  --out .humanize/prompts --baseline HEAD
 *
 * A rewrites file maps item id (a string) to the new text.
 */
import ts from "typescript";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const flag = (name) => args.includes(`--${name}`);
const ROOT = path.resolve(opt("root", "src"));
const OUT = path.resolve(opt("out", ".humanize"));
const MIN = Number(opt("min", "40"));

const INSTRUCTION = /(SYSTEM|VOICE|STYLE|RULES|CONVERSATION|REGISTER|PLAIN|RECORD|BRIEF|GUIDE|PROMPT|INSTRUCTIONS|NOT_PAPERWORK|EXAMPLES|HOUSE|TAIL|HEAD)/i;
const NOT_INSTRUCTION = /(ACT_TEXT|DOCTRINES|LAWS|FACILITIES|ORIGINS|CAREERS|BY_CAREER|FETISHES|DISTRICTS|QUIRKS|_LIST|TABLE|SCHEMA)/i;

const isProse = (s, ui = false) => {
  const t = s.trim();
  if (t.length < MIN || !/\s/.test(t)) return false;
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  if (letters < 20 || letters / t.length < 0.45) return false;
  if (/^(https?:|data:|\/|\.\/|\.\.\/)/.test(t)) return false;
  if (/^[A-Za-z0-9_$.-]+$/.test(t)) return false;
  if ((t.match(/[{}]/g) || []).length > t.length * 0.1) return false;
  if (ui && /(?:^|\s)(?:flex|grid|text-\[|font-prose|font-|px-|py-|mt-|mb-|ml-|mr-|rounded|border-|bg-|w-full|h-full|items-|justify-|gap-|opacity-|hover:|md:|sm:|absolute|relative|inline-block|whitespace-)/.test(t)) return false;
  return true;
};

function sourceFiles(dir) {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
    }
  })(dir);
  return out;
}
const parse = (file, text) => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
const rel = (f) => path.relative(process.cwd(), f).replaceAll("\\", "/");

function interior(node, src) {
  const a = node.getStart(), b = node.end, raw = src.slice(a, b);
  if (node.kind === ts.SyntaxKind.StringLiteral) {
    return { start: a + 1, end: b - 1, mode: raw[0] === "'" ? "s" : "d" };
  }
  if (node.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) return { start: a + 1, end: b - 1, mode: "t" };
  if (node.kind === ts.SyntaxKind.JsxText) return { start: a, end: b, mode: "j" };
  const lead = raw.startsWith("${") ? 2 : raw.startsWith("}") ? 1 : raw.startsWith("`") ? 1 : 0;
  const tail = raw.endsWith("${") ? 2 : raw.endsWith("`") ? 1 : 0;
  return { start: a + lead, end: b - tail, mode: "t" };
}
const unescape = (raw) => {
  // Decode the escapes a TS string can hold, so the model reads prose, not source.
  return raw.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|\r?\n|.)/g, (m, e) => {
    switch (e) {
      case "n": return "\n";
      case "r": return "\r";
      case "t": return "\t";
      case "b": return "\b";
      case "f": return "\f";
      case "v": return "\v";
      case "0": return "\0";
      case "\\": return "\\";
      case "`": return "`";
      case "'": return "'";
      case '"': return '"';
      case "$": return "$";
      case "\n": case "\r\n": return "";
      default:
        if (e.startsWith("u{")) return String.fromCodePoint(parseInt(e.slice(2, -1), 16));
        if (e.startsWith("u")) return String.fromCharCode(parseInt(e.slice(1), 16));
        if (e.startsWith("x")) return String.fromCharCode(parseInt(e.slice(1), 16));
        return m;
    }
  });
};
const encode = (text, mode) => {
  if (mode === "j") return text;
  if (mode === "t") {
    // Keep paragraph breaks in the source: prompts are read and reviewed as templates.
    return text.replaceAll("\\", "\\\\").replaceAll("\r", "").replaceAll("`", "\\`").replaceAll("${", "\\${");
  }
  const t = text.replaceAll("\\", "\\\\").replaceAll("\r", "\\r").replaceAll("\n", "\\n").replaceAll("\t", "\\t");
  return t.replaceAll(mode === "s" ? "'" : '"', `\\${mode === "s" ? "'" : '"'}`);
};

function collect(file, text, all) {
  const sf = parse(file, text);
  const items = [];
  const scan = (node, name) => {
    const k = node.kind;
    if (k === ts.SyntaxKind.StringLiteral || k === ts.SyntaxKind.NoSubstitutionTemplateLiteral || k === ts.SyntaxKind.JsxText
      || k === ts.SyntaxKind.TemplateHead || k === ts.SyntaxKind.TemplateMiddle || k === ts.SyntaxKind.TemplateTail) {
      const { start, end, mode } = interior(node, text);
      if (end > start) {
        const raw = text.slice(start, end);
        if (isProse(raw, all)) items.push({ file: rel(file), name, mode, start, end, text: unescape(raw) });
      }
    }
    ts.forEachChild(node, (n) => scan(n, name));
  };

  if (all) { scan(sf, undefined); return items; }

  const visit = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
      const name = n.name.text;
      if (INSTRUCTION.test(name) && !NOT_INSTRUCTION.test(name)) scan(n.initializer, name);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return items;
}

function byFile(manifest) {
  const m = new Map();
  for (const it of manifest) { if (!m.has(it.file)) m.set(it.file, []); m.get(it.file).push(it); }
  return m;
}
const TEXTY = new Set([
  ts.SyntaxKind.StringLiteral, ts.SyntaxKind.NoSubstitutionTemplateLiteral, ts.SyntaxKind.JsxText,
  ts.SyntaxKind.TemplateHead, ts.SyntaxKind.TemplateMiddle, ts.SyntaxKind.TemplateTail,
]);
/** The file with every string's contents erased: two versions with the same shape
 *  differ only in text the humanizer was allowed to touch. */
function shape(file, text) {
  const src = parse(file, text.replace(/\r\n/g, "\n"));
  const walk = (n) => {
    if (TEXTY.has(n.kind) || n.kind === ts.SyntaxKind.JSDoc) return "S";
    const kids = n.getChildren(src);
    if (!kids.length) return `${n.kind}:${n.getText(src)}`;
    return `${n.kind}(${kids.map(walk).join(",")})`;
  };
  return walk(src);
}
function check(manifest, original) {
  for (const [file, _items] of byFile(manifest)) {
    const now = fs.readFileSync(file, "utf8");
    if (parse(file, now).parseDiagnostics.length) throw new Error(`${file}: does not parse after rewrite`);
    if (original && shape(file, original.get(file)) !== shape(file, now)) throw new Error(`${file}: code outside the rewritten strings changed`);
  }
}

if (cmd === "extract") {
  const all = flag("all");
  const items = [];
  for (const f of sourceFiles(ROOT)) items.push(...collect(f, fs.readFileSync(f, "utf8"), all));
  items.forEach((it, i) => { it.id = String(i); });
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(items));
  const BATCH = 10, MAX = 6000;
  let n = 0, batch = [], size = 0, chars = 0;
  const flush = () => {
    if (!batch.length) return;
    fs.writeFileSync(path.join(OUT, `batch-${String(n++).padStart(2, "0")}.json`), JSON.stringify(batch, null, 2));
    batch = []; size = 0;
  };
  for (const it of items) {
    const b = { id: it.id, name: it.name, text: it.text };
    if (batch.length && (size + it.text.length > MAX || batch.length >= BATCH)) flush();
    batch.push(b); size += it.text.length; chars += it.text.length;
  }
  flush();
  console.log(JSON.stringify({ root: rel(ROOT), items: items.length, chars, kb: +(chars / 1024).toFixed(1), batches: n }, null, 2));
}

if (cmd === "apply") {
  const manifest = JSON.parse(fs.readFileSync(path.join(OUT, "manifest.json"), "utf8"));
  const rewrites = JSON.parse(fs.readFileSync(path.resolve(opt("rewrites")), "utf8"));
  const original = new Map();
  let applied = 0, skipped = 0;
  for (const [file, items] of byFile(manifest)) {
    const src = fs.readFileSync(file, "utf8");
    original.set(file, src);
    const edits = [];
    for (const it of items) {
      if (!(it.id in rewrites)) { skipped++; continue; }
      const next = String(rewrites[it.id] ?? "");
      if (!next.trim() || next === it.text) { skipped++; continue; }
      edits.push({ start: it.start, end: it.end, text: encode(next, it.mode) });
    }
    edits.sort((a, b) => b.start - a.start);
    let out = src;
    for (const e of edits) { out = out.slice(0, e.start) + e.text + out.slice(e.end); applied++; }
    fs.writeFileSync(file, out);
  }
  check(manifest, original);
  console.log(JSON.stringify({ applied, skipped, files: original.size }, null, 2));
}

if (cmd === "verify") {
  const manifest = JSON.parse(fs.readFileSync(path.join(OUT, "manifest.json"), "utf8"));
  const base = opt("baseline", "HEAD");
  const top = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  const original = new Map();
  for (const file of new Set(manifest.map((x) => x.file))) {
    const inRepo = path.relative(top, path.resolve(file)).replaceAll("\\", "/");
    original.set(file, execFileSync("git", ["show", `${base}:${inRepo}`], { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 }));
  }
  check(manifest, original);
  console.log(`verified ${manifest.length} strings against ${base}: all files parse, no code changed`);
}
