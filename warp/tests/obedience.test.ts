/**
 * THE THESIS TEST.
 *
 * Two women read devotion 60. One of them is here because she has decided her life is here; the
 * other is here because the cellblock is downstairs. In the game this replaces, they were the same
 * record and the same integer, and a month of leaving them both alone changed neither.
 *
 * If this test ever goes green-to-red, the entire reason this rebuild exists has been removed.
 */
import { check } from "./harness.ts";
import { generatePerson } from "../src/engine/generate.ts";
import { read, refresh, tickBond, applyTreatment, explain } from "../src/engine/obedience.ts";

const bonded = generatePerson({ seed: "bonded" });
const feared = generatePerson({ seed: "feared" });

// Same nervous system, so the only difference is what is holding them. Relaxation is pinned rather
// than taken from the generator: this test is about bond against fear, and it should not start
// failing because somebody added a field to the forge and shifted the seeded rolls behind it.
feared.psyche = structuredClone(bonded.psyche);
feared.persona.attachment = structuredClone(bonded.persona.attachment);
bonded.psyche.relaxation = 0;
feared.psyche.relaxation = 0;

bonded.bond = { bond: 70, fear: 5, resentment: 10, hope: 55, weeks_since_kindness: 1, weeks_since_cruelty: 30, read: { devotion: 0, trust: 0, label: "" } };
feared.bond = { bond: 0, fear: 85, resentment: 45, hope: 8, weeks_since_kindness: 20, weeks_since_cruelty: 0, read: { devotion: 0, trust: 0, label: "" } };

const b0 = read(bonded), f0 = read(feared);
check("both read as obedient at the start", b0.devotion > 35 && f0.devotion > 35, { bonded: b0.devotion, feared: f0.devotion });
check("but the engine knows which is which", f0.fragility > 0.8 && b0.fragility < 0.35, { bonded: b0.fragility, feared: f0.fragility });

// Eight weeks in which nothing whatever happens to either of them.
for (let i = 0; i < 8; i++) { tickBond(bonded); tickBond(feared); }
const b1 = read(bonded), f1 = read(feared);

// Stated as a proportion rather than as a number of points. The claim is "fear-bought obedience
// mostly evaporates and earned obedience mostly does not", and an absolute threshold turns that
// claim into an assertion about this month's tuning constants instead.
const feltLoss = 1 - f1.devotion / Math.max(1, f0.devotion);
const bondLoss = 1 - b1.devotion / Math.max(1, b0.devotion);
check("fear-held obedience mostly evaporates when the pressure stops", feltLoss > 0.5, { was: f0.devotion, now: f1.devotion, lost: feltLoss });
check("bond-held obedience mostly survives being left alone", bondLoss < 0.2, { was: b0.devotion, now: b1.devotion, lost: bondLoss });
check("and the fear-held one loses far more of it than the bonded one", feltLoss > bondLoss * 2.5, { feltLoss, bondLoss });
check("and they no longer read the same", Math.abs(b1.devotion - f1.devotion) > 30, { bonded: b1.devotion, feared: f1.devotion });

// A broken promise is the expensive move, and it costs hope rather than devotion directly.
const hopeful = generatePerson({ seed: "hopeful" });
hopeful.bond.hope = 70;
const beforeHope = hopeful.bond.hope;
applyTreatment(hopeful, { kind: "promise_broken", size: 6, why: "said she could see her sister" }, 5);
check("a broken promise spends hope, hard", hopeful.bond.hope < beforeHope - 15, { was: beforeHope, now: hopeful.bond.hope });
check("and it plants resentment", hopeful.bond.resentment > 5);

// The explanation exists, which is the feature that could not be built in the old model at all.
const lines = explain(feared);
check("the engine can say why she is like this", lines.length > 0 && lines.some((l) => /fear/i.test(l)), lines);

// Terror saturates: past a point more fear stops buying more obedience.
const a = generatePerson({ seed: "sat-a" }), c = generatePerson({ seed: "sat-b" });
c.psyche = structuredClone(a.psyche);
c.persona.attachment = structuredClone(a.persona.attachment);
a.bond = { ...a.bond, bond: 0, fear: 50, resentment: 0, hope: 20 };
c.bond = { ...c.bond, bond: 0, fear: 100, resentment: 0, hope: 20 };
const gain = read(c).devotion - read(a).devotion;
check("doubling terror does not double obedience", gain < 14, { gain });
refresh(a); refresh(c);
