/**
 * WHAT SHE'S LIKE IN BED — her skills, fetishes, quirk, flaw and paraphilia are on her card as
 * fact, skill is technique, her work feeds what she needs or doesn't, and her quirk and flaw make
 * her better or worse at the work.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { personCard } from "../src/engine/prompts.ts";
import { resolveAct, actDirective } from "../src/engine/intimacy.ts";
import { capacity } from "../src/engine/fit.ts";
import { jobFit, weeklyDesires } from "../src/engine/sexlife.ts";
import type { Person, SaveState } from "../src/engine/types.ts";

const s = newGame({ seed: "sexlife", starting_slaves: 2, plot: false } as never) as SaveState;
const p = Object.values(s.people).find((x) => x.status === "owned" && x.age >= 18)! as Person;
p.skills.oral = 80; p.skills.anal = 0;
p.persona.fetishes = [{ name: "cumslut", strength: 70, known: false }];
p.persona.quirk = { id: "tease", known: true } as never;
p.persona.flaw = { id: "shamefast", known: true, worn: 0 } as never;
const card = personCard(s, p);
check("her skills are on her card, in words", /HER SKILLS[^\n]*oral expert/.test(card) && /anal untrained/.test(card));
check("a fetish the owner doesn't know is shown, not named", /HER FETISH \(the owner doesn't know this yet: show it[^\n]*cumslut/.test(card));
check("her quirk and flaw too", /HER SEXUAL QUIRK \(known\): tease/.test(card) && /HER SEXUAL FLAW \(known\): shamefast/.test(card));

const out = resolveAct(s, p, "oral");
if (!("error" in out)) check("an act says how good she is at it", /HOW GOOD SHE IS AT IT[^\n]*very good with her mouth/.test(actDirective(s, p, out)));
check("and something she's into counts as fed", p.counters.fed === s.arcology.week);

const before = capacity(p, "anus", s);
p.skills.anal = 100;
check("skill is technique: a practised woman takes more", capacity(p, "anus", s) >= before + 2);

p.assignment = "be an idol"; p.facility = undefined;
const fit = jobFit(s, p);
check("her quirk suits the work and her flaw fights it", fit.why.some((w) => /tease suits/.test(w)) && fit.why.some((w) => /shamefast gets in the way/.test(w)));

p.persona.fetishes = [{ name: "humiliation", strength: 115, known: true }];
p.persona.paraphilia = "attention whore" as never;
p.assignment = "rest"; p.counters.fed = -99;
const resent = p.bond.resentment;
const starved = weeklyDesires(s, p);
check("a paraphilia starved makes her miserable, and the report says so", /goes unfed/.test(starved ?? "") && p.bond.resentment > resent, starved);
p.assignment = "public servant";
const bond = p.bond.bond;
const fedLine = weeklyDesires(s, p);
check("fed by her work, she's happier and closer", /happier/.test(fedLine ?? "") && p.bond.bond > bond, fedLine);
