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

// A dom with an abusive streak, written meek by her forged voice: in bed the dom wins.
{
  const { refresh } = await import("../src/engine/obedience.ts");
  const { inBed } = await import("../src/engine/sexlife.ts");
  const s = newGame({ seed: "sexlife-dom", starting_slaves: 1, plot: false } as never) as SaveState;
  const d = Object.values(s.people).find((x) => x.status === "owned" && x.age >= 18)! as Person;
  d.persona.fetishes = [{ name: "dom", strength: 56, known: true }];
  d.persona.paraphilia = "abusive" as never;
  d.persona.core_traits = ["shuts down and goes still when she's frightened"];
  d.psyche.state = "intact"; d.romance = undefined; d.latitude = undefined;
  Object.assign(d.bond, { bond: 48, fear: 18, resentment: 12, hope: 90 });
  refresh(d, s.memory[d.id]);
  const card = personCard(s, d);
  check("her dom fetish says what she does in bed", /HER FETISH \(known\): dom[^\n]*takes the top/.test(card));
  check("her paraphilia says what the need is", /HER PARAPHILIA: abusive[^\n]*dominate and abuse/.test(card));
  check("and it wins over the quieter reading of her personality", /IN BED \(fact\)[^\n]*win over the quieter reading/.test(card));
  check("obeying and wanting control are both true", /IN BED[^\n]*obeys the owner and she wants control/.test(card), card.match(/IN BED[^\n]*/)?.[0]);
  check("alone in the house, the need lands on the owner", /IN BED[^\n]*no other slave in the house/.test(card));
  const { generatePerson } = await import("../src/engine/generate.ts");
  const other = generatePerson({ seed: "sexlife-other", sex: "female" });
  other.status = "owned"; other.age = Math.max(other.age, 20);
  s.people[other.id] = other;
  check("with others and the default rules, she may not touch them", /IN BED[^\n]*forbid her touching/.test(personCard(s, d)));

  const used = resolveAct(s, d, "vaginal");
  if (!("error" in used)) check("used, she'd rather be on top, and tries to turn it", /SHE'D RATHER BE ON TOP[^\n]*tries to turn it/.test(actDirective(s, d, used)));
  d.counters.fed = -99;
  const led = resolveAct(s, d, "take charge");
  check("you can let her take charge", !("error" in led), led);
  if (!("error" in led)) check("and then she's in charge for real, rough with it", /SHE'S IN CHARGE HERE[^\n]*rough/.test(actDirective(s, d, led)));
  check("which feeds her", d.counters.fed === s.arcology.week);

  check("the prompts that write her personality are told who she is in bed", /dom \(real\)[^;]*takes the top/.test(inBed(d)) && /paraphilia, abusive/.test(inBed(d)));
}
