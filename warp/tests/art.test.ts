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
import { newMemory } from "../src/engine/memory.ts";
import { refresh } from "../src/engine/obedience.ts";
import { generatePerson } from "../src/engine/generate.ts";
import { layersFor } from "../src/lib/vectorart.ts";
import { POSES, restingPose, frameAt, transformFor, jointFor, PIVOT } from "../src/lib/rig.ts";

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


/* ── the rig ────────────────────────────────────────────────────────────────────────────────── */
{
  // Every pose × every limb family has to resolve, including the prosthetic sets that carry only
  // three positions on the right. This is the check the arm fallback exists for.
  const missing = new Set<string>();
  const families: [string, string][] = [
    ["flesh", ""], ["fat", "fat"],
    ["basic", "set of basic prosthetic limbs"], ["beauty", "set of advanced beauty limbs"],
    ["combat", "set of advanced combat limbs"], ["sexy", "set of advanced sex limbs"],
  ];
  for (const [label, what] of families) {
    for (const pose of POSES) {
      const p = generatePerson({ seed: `rig-${label}-${pose.id}`, sex: "female" });
      if (what === "fat") p.body.weight = 60;
      else if (what) p.body.marks.push({ kind: "prosthetic", where: "arms", what, week: 1 });
      for (const l of layersFor(p, pose)) {
        if (/^(Arm|ArmFat)/.test(l.id) && !have.has(l.id)) missing.add(`${label}/${pose.id}: ${l.id}`);
      }
    }
  }
  check("every pose resolves to real arm art, on flesh and on all four prosthetic sets",
    missing.size === 0, [...missing].slice(0, 6));
}

{
  // Poses have to actually differ, or the whole rig is decoration.
  const p = generatePerson({ seed: "distinct", sex: "female" });
  const sigs = new Set(POSES.map((pose) => layersFor(p, pose).map((l) => l.id).join("|")));
  check("the poses are not all the same picture", sigs.size >= 5, sigs.size);
}

{
  // The involuntary layer must read her state, not just tick.
  const calm = generatePerson({ seed: "breath", sex: "female" });
  calm.psyche.relaxation = 6; calm.psyche.arousal = 5;
  const scared = generatePerson({ seed: "breath", sex: "female" });
  scared.psyche.relaxation = -8; scared.psyche.arousal = 5;

  // Sample a few seconds and count how many times the chest crosses its resting scale: a
  // frightened woman breathes faster than a comfortable one, and it should be visible.
  const crossings = (p: typeof calm) => {
    let n = 0, prev = 0;
    for (let ms = 0; ms < 20000; ms += 40) {
      const v = frameAt(p, restingPose(p), ms).chest.scale - 1;
      if (prev <= 0 && v > 0) n++;
      prev = v;
    }
    return n;
  };
  const a = crossings(calm), b = crossings(scared);
  check("a frightened woman breathes faster than a comfortable one", b > a * 1.2, { calm: a, scared: b });
}

{
  const p = generatePerson({ seed: "phase", sex: "female" });
  const q = generatePerson({ seed: "phase-other", sex: "female" });
  const f1 = frameAt(p, restingPose(p), 3000);
  const f2 = frameAt(q, restingPose(q), 3000);
  check("two women at the same instant are not the same animation",
    f1.hips.dx !== f2.hips.dx || f1.chest.scale !== f2.chest.scale, { f1, f2 });
}

{
  // The composed transform has to be legal SVG and has to pivot where the joint actually is.
  let bad: string | undefined;
  const p = generatePerson({ seed: "xform", sex: "futa" });
  const f = frameAt(p, restingPose(p), 1234);
  for (const l of layersFor(p)) {
    const x = transformFor(jointFor(l.id), f);
    if (x && !/^[a-z0-9()\-. ]+$/i.test(x)) { bad = `${l.id}: ${x}`; break; }
    if (/NaN|Infinity|undefined/.test(x)) { bad = `${l.id}: ${x}`; break; }
  }
  check("no joint produces a malformed transform", bad === undefined, bad);
  check("the head pivots at the neck, not the canvas origin", PIVOT.neck[1] > 150 && PIVOT.neck[1] < 230, PIVOT.neck);
}

{
  // A blink is an event, not a wave: she should be open the overwhelming majority of the time.
  const p = generatePerson({ seed: "blink", sex: "female" });
  let shut = 0, n = 0;
  for (let ms = 0; ms < 120000; ms += 33) { n++; if (frameAt(p, restingPose(p), ms).eyelid < 0.5) shut++; }
  const pct = shut / n;
  check("she blinks, and does not sit there with her eyes shut", pct > 0 && pct < 0.12, { closed: `${(pct * 100).toFixed(1)}%` });
}

{
  const p = generatePerson({ seed: "state-pose", sex: "female" });
  p.psyche.state = "intact"; p.health.energy = 60; p.health.health = 0;
  p.psyche.relaxation = -8;
  const braced = restingPose(p).id;
  p.psyche.relaxation = 3; p.bond.bond = 90; p.bond.fear = 2;
  refresh(p, newMemory());
  const easy = restingPose(p).id;
  p.health.energy = 5;
  const spent = restingPose(p).id;
  check("how she stands is read off her state", braced !== easy && spent === "spent", { braced, easy, spent });
}
