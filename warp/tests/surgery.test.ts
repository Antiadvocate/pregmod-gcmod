/**
 * THE THEATRE.
 *
 * The rebuild shipped with no surgery at all, which meant a slave was whatever she was generated
 * as forever. That is the one thing the original is unambiguously about: you can change what she
 * is, it costs real money, and she carries it.
 *
 * What these protect: the body actually changes, the operations gate on each other properly
 * (you cannot build a cunt on a body that already has one, or geld a woman with no balls), the
 * money and the recovery are real, and — the part that matters — the same operation lands
 * differently on different women rather than being a flat penalty.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { generatePerson } from "../src/engine/generate.ts";
import { newMemory } from "../src/engine/memory.ts";
import { refresh } from "../src/engine/obedience.ts";
import { operate, howSheTakesIt, optionsFor, available } from "../src/engine/surgery.ts";
import { PROCEDURES, PROCEDURE_BY_ID } from "../src/data/surgery.ts";
import { genesOf } from "../src/engine/pregnancy.ts";

function theatre(seed: string, sex: "female" | "male" | "futa" = "female", level = 2) {
  const s = newGame({ seed, starting_slaves: 2 });
  s.arcology.cash = 500000;
  s.arcology.facilities["surgery"] = {
    id: "surgery", kind: "surgery", name: "Surgical theatre", level,
    upgrades: {}, capacity: 4, workers: [], decoration: 0, settings: {},
  };
  const p = generatePerson({ seed: `${seed}-p`, sex });
  p.age = 24; p.physical_age = 24; p.status = "owned";
  s.people[p.id] = p;
  s.memory[p.id] = newMemory();
  refresh(p, s.memory[p.id]);
  return { s, p };
}

/* ── the body actually changes ──────────────────────────────────────────────────────────────── */
{
  const { s, p } = theatre("mtf", "futa");
  p.body.vagina = null;
  const before = s.arcology.cash;
  const out = operate(s, p, "male_to_female");
  check("a woman with a cock can be given a cunt and keep the cock",
    out.ok && p.body.vagina === 0 && p.body.dick !== null && p.body.dick > 0,
    { ok: out.ok, why: out.why, vagina: p.body.vagina, dick: p.body.dick });
  check("it costs money and puts her on the ward",
    s.arcology.cash === before - 15000 && p.health.recovery_weeks >= 3,
    { spent: before - s.arcology.cash, weeks: p.health.recovery_weeks });
}

{
  const { s, p } = theatre("chop", "futa");
  const out = operate(s, p, "chop");
  check("and it can be taken off again", out.ok && p.body.dick === null, { ok: out.ok, why: out.why, dick: p.body.dick });
}

{
  const { s, p } = theatre("null", "female");
  p.body.vagina = null; p.body.dick = null; p.body.foreskin = null;
  check("a null cannot use the ordinary operation", PROCEDURE_BY_ID["male_to_female"].can(p) !== null);
  const out = operate(s, p, "none_to_female");
  check("but the harder one builds her one from nothing", out.ok && p.body.vagina === 0, { ok: out.ok, why: out.why });
}

{
  const { s, p } = theatre("herm", "futa");
  p.body.vagina = null;
  operate(s, p, "herm");
  check("a herm is a cock and a cunt on the same body", p.body.dick !== null && p.body.vagina !== null,
    { dick: p.body.dick, vagina: p.body.vagina });
  check("and she cannot be given a second one", PROCEDURE_BY_ID["herm"].can(p) !== null);
}

{
  const { s, p } = theatre("geld", "futa");
  p.body.balls = 3;
  operate(s, p, "geld");
  check("gelding takes the balls and the prostate with them", p.body.balls === null && p.body.prostate === 0);
  check("and there is nothing left to geld", PROCEDURE_BY_ID["geld"].can(p) !== null);
}

/* ── the gates ──────────────────────────────────────────────────────────────────────────────── */
{
  const { s, p } = theatre("gates", "female", 1);
  check("an unupgraded theatre cannot do the hard operations",
    available(s, PROCEDURE_BY_ID["none_to_female"]) !== null, available(s, PROCEDURE_BY_ID["none_to_female"]));
  check("but can do the ordinary ones", available(s, PROCEDURE_BY_ID["tighten"]) === null);

  s.content = { extreme: false };
  check("and the extreme switch really switches it off",
    available(s, PROCEDURE_BY_ID["chop"]) !== null, available(s, PROCEDURE_BY_ID["chop"]));
}

{
  const { s, p } = theatre("broke");
  p.body.vagina = 3;
  s.arcology.cash = 100;
  const out = operate(s, p, "tighten");
  check("you cannot operate on credit", !out.ok && /¤/.test(out.why ?? ""), out.why);
}

{
  const { s, p } = theatre("carrying");
  p.womb.fetuses = [{
    id: "f1", week: 4, father_id: null, mother_id: p.id,
    genes: genesOf(p), sex: "XX", viable: true,
  }];
  const out = operate(s, p, "chop");
  check("and not while she is carrying", !out.ok, out.why);
}

{
  const { s, p } = theatre("twice");
  p.body.vagina = 3; p.body.anus = 3;
  operate(s, p, "tighten");
  const again = operate(s, p, "anal_tighten");
  check("one operation at a time", !again.ok && /recovering/.test(again.why ?? ""), again.why);
}

/* ── the same operation, different women ────────────────────────────────────────────────────── */
{
  const { s: s1, p: masochist } = theatre("maso", "futa");
  masochist.persona.fetishes = [{ name: "masochist", strength: 85, known: true }];
  masochist.bond.fear = 10;
  const { s: s2, p: leader } = theatre("dom", "futa");
  leader.persona.fetishes = [{ name: "dom", strength: 85, known: true }];
  leader.bond.fear = 10;

  const a = howSheTakesIt(s1, masochist, PROCEDURE_BY_ID["geld"]);
  const b = howSheTakesIt(s2, leader, PROCEDURE_BY_ID["geld"]);
  check("a masochist takes being cut better than a dom does", a.score > b.score, { masochist: a, dom: b });
  check("and the panel can say why in her terms", !!a.why && !!b.why && a.why !== b.why, [a.why, b.why]);
}

{
  // The arcology she has been living in changes what the same operation means.
  const { s, p } = theatre("doctrine", "futa");
  p.body.vagina = null;
  const plain = howSheTakesIt(s, p, PROCEDURE_BY_ID["herm"]).score;
  s.arcology.doctrines["gender_radical"] = { adoption: 90, decoration: 3, research: true, policies: {}, adopted_week: 1 };
  const radical = howSheTakesIt(s, p, PROCEDURE_BY_ID["herm"]).score;
  delete s.arcology.doctrines["gender_radical"];
  s.arcology.doctrines["body_purist"] = { adoption: 90, decoration: 3, research: true, policies: {}, adopted_week: 1 };
  const purist = howSheTakesIt(s, p, PROCEDURE_BY_ID["herm"]).score;
  check("a gender radical arcology makes it easier and a purist one makes it worse",
    radical > plain && purist < plain, { plain, radical, purist });
}

{
  // Taking something off her is a thing the whole household reads.
  const { s, p } = theatre("household", "futa");
  const others = Object.values(s.people).filter((x) => x.id !== p.id);
  for (const o of others) { o.bond.fear = 20; o.bond.bond = 60; }
  p.bond.fear = 80;
  const fearBefore = others.map((o) => o.bond.fear);
  operate(s, p, "chop");
  check("the rest of them do the arithmetic when somebody comes back short",
    others.every((o, i) => o.bond.fear > fearBefore[i]),
    { before: fearBefore, after: others.map((o) => o.bond.fear) });
}

/* ── nothing in the table is unreachable or broken ──────────────────────────────────────────── */
{
  let bad: string | undefined;
  for (const proc of PROCEDURES) {
    const { s, p } = theatre(`all-${proc.id}`, "futa");
    // Give her everything, so the only thing that can block is the procedure's own logic.
    p.body.vagina = 2; p.body.dick = 4; p.body.foreskin = 3; p.body.balls = 3; p.body.prostate = 2;
    p.body.boobs = 800; p.body.anus = 3; p.body.nipples = "inverted"; p.body.hymen = false;
    p.body.lactation = 0; p.womb.sterile = false;
    s.content = { extreme: true };
    const before = JSON.stringify(p.body) + JSON.stringify(p.womb.sterile);
    const out = operate(s, p, proc.id);
    if (!out.ok && !proc.can(p)) { bad = `${proc.id}: ${out.why}`; break; }
    if (out.ok && JSON.stringify(p.body) + JSON.stringify(p.womb.sterile) === before) { bad = `${proc.id} changed nothing`; break; }
  }
  check("every procedure in the table does something to a body that can take it", bad === undefined, bad);

  const { s, p } = theatre("options", "futa");
  const rows = optionsFor(s, p);
  check("and the theatre can list them all with a reason each", rows.length === PROCEDURES.length && rows.every((r) => !!r.felt.why));
}
