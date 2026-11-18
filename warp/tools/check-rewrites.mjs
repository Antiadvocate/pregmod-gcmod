#!/usr/bin/env node
// Check a rewrites file against its manifest before anything is spliced into src.
import fs from "node:fs";
import path from "node:path";

const [manifestPath, ...files] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const byId = new Map(manifest.map((x) => [x.id, x]));
const rewrites = {};
for (const f of files) Object.assign(rewrites, JSON.parse(fs.readFileSync(f, "utf8")));

const issues = [];
let missing = 0;
for (const it of manifest) {
  if (!(it.id in rewrites)) { missing++; continue; }
  const out = String(rewrites[it.id] ?? "");
  const src = it.text;
  const where = `${it.file} ${it.name ?? ""} #${it.id}`;
  if (!out.trim()) issues.push(`${where}: empty`);
  const ratio = out.length / src.length;
  if (ratio < 0.85 || ratio > 1.15) issues.push(`${where}: length ${(ratio * 100).toFixed(0)}% (${src.length} -> ${out.length})`);
  if (/[—–]/.test(out)) issues.push(`${where}: dash ${JSON.stringify(out.match(/[—–]/g))}`);
  if (/\*\*/.test(out)) issues.push(`${where}: markdown bold`);
  if (/[“”‘’]/.test(out)) issues.push(`${where}: curly quote`);
  for (const tok of ["${", "<<", "[[", "\\n", "\\t"]) {
    if (src.split(tok).length - 1 !== out.split(tok).length - 1) issues.push(`${where}: token count changed for ${tok}`);
  }
  // Every ALL-CAPS label in the source should survive.
  const labels = (s) => (s.match(/\b[A-Z][A-Z0-9 '&-]{3,}:?\b/g) ?? []).sort().join("|");
  if (labels(src) !== labels(out)) issues.push(`${where}: labels changed`);
}

const extra = Object.keys(rewrites).filter((id) => !byId.has(id));
console.log(JSON.stringify({
  manifest: manifest.length, rewritten: manifest.length - missing, missing, extra: extra.length,
  lengthBefore: manifest.reduce((a, x) => a + x.text.length, 0),
  lengthAfter: manifest.reduce((a, x) => a + (rewrites[x.id]?.length ?? x.text.length), 0),
  issues: issues.length,
}, null, 2));
for (const line of issues.slice(0, 60)) console.log("  " + line);
if (issues.length > 60) console.log(`  ... ${issues.length - 60} more`);
