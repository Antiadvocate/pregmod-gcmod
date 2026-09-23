/**
 * GENITALS AND FEET — what she has is on her card, the theatre and the drugs change it, and the
 * acts that need it check it.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { generatePerson } from "../src/engine/generate.ts";
import { newMemory } from "../src/engine/memory.ts";
import { refresh } from "../src/engine/obedience.ts";
import { describeGenitals, describeFeet, erection, dickCM, mobility, feetOf } from "../src/engine/genitals.ts";
import { personCard } from "../src/engine/prompts.ts";
import { operate } from "../src/engine/surgery.ts";
import { canStart } from "../src/data/drugs.ts";
import { tickHealth } from "../src/engine/health.ts";
import { resolveAct, actDirective, affinity, canDo } from "../src/engine/intimacy.ts";
import { ACT_BY_ID } from "../src/data/intimacy.ts";

function world(seed: string, sex: "female" | "male" | "futa" = "futa") {
  const s = newGame({ seed, starting_slaves: 1 });
  s.arcology.cash = 500000;
  s.arcology.facilities["clinic"] = {
    id: "clinic", kind: "clinic", name: "The Clinic", level: 2,
    upgrades: { surgery: 1 }, capacity: 4, workers: [], decoration: 0, settings: {},
  };
  const p = generatePerson({ seed: `${seed}-p`, sex });
  p.age = 25; p.physical_age = 25; p.status = "owned";
  s.people[p.id] = p;
  s.memory[p.id] = newMemory();
  refresh(p, s.memory[p.id]);
  return { s, p };
}

/* ── what she has is written down ───────────────────────────────────────────────────────────── */
{
  const { s, p } = world("desc");
  p.body.dick = 5; p.body.balls = 4; p.body.scrotum = 4; p.body.foreskin = 5;
  const g = describeGenitals(p);
  check("a futa's cock is described with its size and length", /huge uncut cock/.test(g) && g.includes(`${dickCM(5)}cm`), g);
  check("and her balls", /large balls/.test(g), g);
  check("and her pussy", /pussy/.test(g), g);
  const card = personCard(s, p);
  check("the narrator's card carries it as fact", /BETWEEN HER LEGS/.test(card) && /huge uncut cock/.test(card), card);
  check("and her feet", /FEET: She has .* feet \(EU \d+\)/.test(card), card);
  check("generated people get feet and a fitted scrotum", !!p.body.feet && (p.body.scrotum ?? -1) >= (p.body.balls ?? 0));
}

/* ── size has consequences ──────────────────────────────────────────────────────────────────── */
{
  const { p } = world("size");
  p.body.height_cm = 160; p.body.dick = 3; p.body.balls = 3;
  check("an average cock gets hard", erection(p) === "full");
  p.body.dick = 14;
  check("a hyper cock on a short body can't", erection(p) === "soft");
  p.body.dick = 4; p.body.balls = null; p.health.drugs = [];
  check("no balls, no erection", erection(p) === "soft");
  p.body.balls = 40;
  check("balls past 37 leave her barely able to walk", mobility(p).level === 2);
  check("and she can't do an act that needs her standing", !!canDo(p, ACT_BY_ID["trample"]));
}

/* ── the theatre ────────────────────────────────────────────────────────────────────────────── */
{
  const { s, p } = world("addcock", "female");
  const out = operate(s, p, "add_penis");
  check("a woman can be given a cock", out.ok && (p.body.dick ?? 0) > 0, out.why);
  p.health.recovery_weeks = 0;
  const out2 = operate(s, p, "add_balls");
  check("and balls", out2.ok && (p.body.balls ?? 0) > 0 && (p.body.scrotum ?? 0) > 0, out2.why);
  p.health.recovery_weeks = 0;
  const before = p.body.dick ?? 0;
  operate(s, p, "penis_enlarge");
  check("and have it enlarged", (p.body.dick ?? 0) === before + 1);
}
{
  const { s, p } = world("feet");
  s.content = { extreme: true };
  operate(s, p, "clip_tendons");
  check("clipped tendons are recorded on her feet", feetOf(p).heels_clipped && /clipped/.test(describeFeet(p)));
  check("and stop her standing", !!canDo(p, ACT_BY_ID["trample"]));
}

/* ── the drugs ──────────────────────────────────────────────────────────────────────────────── */
{
  const { s, p } = world("drugs");
  p.body.dick = 3; p.body.balls = 3; p.body.scrotum = 3;
  p.health.drugs = ["penis enhancement"];
  for (let w = 0; w < 60; w++) { s.arcology.week++; tickHealth(s, p, { health: 0, energy: 0 }); }
  check("penis enhancement grows her cock and stops at 10", p.body.dick === 10, p.body.dick);
  check("and takes her off the regimen when it's done", !p.health.drugs.includes("penis enhancement"));
  s.content = { hyper: false };
  check("hyper drugs respect the content switch", !!canStart(s, p, "hyper penis enhancement"));
  s.content = {};
  p.health.drugs = ["testicle enhancement"];
  check("growth and atrophy of the same organ don't mix", !!canStart(s, p, "testicle atrophiers"));
  p.health.drugs = ["hyper testicle enhancement"];
  for (let w = 0; w < 40; w++) { s.arcology.week++; tickHealth(s, p, { health: 0, energy: 0 }); }
  check("hyper testicle enhancement goes past natural sizes", (p.body.balls ?? 0) > 10, p.body.balls);
  check("and her scrotum stretches to follow", (p.body.scrotum ?? 0) > 5, p.body.scrotum);
}

/* ── the acts ───────────────────────────────────────────────────────────────────────────────── */
{
  const { s, p } = world("suck");
  p.body.dick = 4; p.body.balls = 3; p.chastity.penis = false;
  p.persona.flaw = { id: "hates oral", known: false, worn: 0 };
  check("hating giving head doesn't make being sucked off a flaw", affinity(p, ACT_BY_ID["suck her"]).score > -0.5, affinity(p, ACT_BY_ID["suck her"]));
  const o = resolveAct(s, p, "suck her");
  if ("error" in o) check("suck her resolves", false, o.error);
  else {
    const d = actDirective(s, p, o);
    check("the directive says who is doing it to whom", /you do this TO/.test(d), d);
  }
  p.health.recovery_weeks = 0;
  const pedi = resolveAct(s, p, "pedicure");
  check("a pedicure paints her toenails", !("error" in pedi) && feetOf(p).toenails !== "bare", feetOf(p).toenails);
}
{
  const { p } = world("old");
  delete p.body.feet;
  const a = feetOf(p).size;
  delete p.body.feet;
  check("an old save's feet are derived the same way every time", feetOf(p).size === a);
}
