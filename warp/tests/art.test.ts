/**
 * THE PAPER DOLL, AGAINST THE ACTUAL FILES ON DISK.
 *
 * This exists because of a bug that was invisible for weeks: the stack asked for
 * `Art_Vector_Penis` and `Art_Vector_Flaccid`, and the pack ships eleven of each indexed by size
 * and no unsized file at all. The renderer drops layers that 404 without complaining — that is
 * deliberate, it means a wrong guess costs a detail rather than the whole figure — so every futa
 * in the arcology was drawn with nothing between her legs and there was nothing on screen to say
 * so. Silence is exactly what the fallback is designed to produce, which is why it needs a test.
 *
 * The rule: for every layer the stack asks for, either the file exists, or a fallback in the same
 * request resolves. Never both missing.
 */
import { readdirSync } from "node:fs";
import { check } from "./harness.ts";
import { generatePerson } from "../src/engine/generate.ts";
import { layersFor } from "../src/lib/vectorart.ts";

const have = new Set(
  readdirSync("public/art/vector")
    .filter((f: string) => f.startsWith("Art_Vector_") && f.endsWith(".svg"))
    .map((f: string) => f.slice("Art_Vector_".length, -".svg".length)),
);

check("the art pack is actually on disk", have.size > 500, have.size);

/* The hair layers are requested as a sized/unsized pair on purpose, so they are checked as a pair.
 * Everything else has to resolve on its own. */
function bodyPart(id: string): boolean { return !id.startsWith("Hair_"); }

{
  const missing = new Set<string>();
  const baldy: string[] = [];
  let futas = 0, drawnCocks = 0, drawnBalls = 0;

  for (let i = 0; i < 400; i++) {
    const sex = i % 3 === 0 ? "futa" : i % 7 === 0 ? "male" : "female";
    const p = generatePerson({ seed: `art-${i}`, sex });
    if (i % 5 === 0) p.chastity.penis = true;
    if (i % 6 === 0) p.chastity.vagina = true;
    if (i % 4 === 0) p.body.marks.push({ kind: "piercing", where: "nipples", what: "rings", week: 1 });
    if (i % 9 === 0) p.body.marks.push({ kind: "piercing", where: "pussy", what: "a ladder", week: 1 });
    if (i % 11 === 0) p.body.marks.push({ kind: "tattoo", where: "areola", what: "hearts", week: 1 });
    if (i % 13 === 0) p.body.foreskin = 0;

    const ids = layersFor(p).map((l) => l.id);
    for (const id of ids) if (bodyPart(id) && !have.has(id)) missing.add(id);

    const hairAsked = ids.filter((id) => id.startsWith("Hair_Back_"));
    if (hairAsked.length && !hairAsked.some((id) => have.has(id))) baldy.push(hairAsked.join("/"));

    if (sex === "futa") {
      futas++;
      if (ids.some((id) => /^(Penis|Flaccid)/.test(id) && have.has(id))) drawnCocks++;
      if (ids.includes("Balls") && have.has("Balls")) drawnBalls++;
    }
  }

  check("every layer the stack asks for is a file that exists", missing.size === 0, [...missing]);
  check("no hairstyle resolves to a bald head", baldy.length === 0, baldy.slice(0, 3));
  check("a futa is drawn with a cock, at her own size", futas > 0 && drawnCocks === futas, { futas, drawnCocks });
  check("and with balls when she has them", drawnBalls > futas * 0.8, { futas, drawnBalls });
}

{
  // The size index has to move with her, or every futa is drawn identically.
  const sizes = new Set<string>();
  for (let d = 1; d <= 11; d++) {
    const p = generatePerson({ seed: "sizes", sex: "futa" });
    p.body.dick = d; p.psyche.relaxation = 5; p.chastity.penis = false;
    const cock = layersFor(p).map((l) => l.id).find((id) => /^Penis_/.test(id));
    if (cock) sizes.add(cock);
  }
  check("eleven sizes of cock, not one", sizes.size === 11, [...sizes].sort());
}

{
  // Chastity and comfort decide hard or soft, and both files have to exist.
  const p = generatePerson({ seed: "state", sex: "futa" });
  p.body.dick = 5; p.body.foreskin = 3;
  p.psyche.relaxation = 5; p.chastity.penis = false;
  const easy = layersFor(p).map((l) => l.id);
  p.chastity.penis = true;
  const locked = layersFor(p).map((l) => l.id);
  check("comfortable and unlocked draws her hard",
    easy.some((id) => id.startsWith("Penis_") && have.has(id)), easy.filter((i) => /Penis|Flaccid/.test(i)));
  check("locked up draws her soft",
    locked.some((id) => id.startsWith("Flaccid_") && have.has(id)), locked.filter((i) => /Penis|Flaccid/.test(i)));

  p.chastity.penis = false; p.body.foreskin = 0;
  const cut = layersFor(p).map((l) => l.id);
  check("and circumcision uses the pack's parallel set",
    cut.some((id) => id.startsWith("PenisCirc_") && have.has(id)), cut.filter((i) => /Penis|Flaccid/.test(i)));
}
