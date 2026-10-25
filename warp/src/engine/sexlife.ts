/**
 * WHAT SHE'S LIKE IN BED, AND WHAT HER WORK DOES TO IT.
 *
 * Her sex skills, her fetishes, her quirk, her sexual flaw and her paraphilia all existed, and the
 * scene never heard of any of them: nothing on her card said she was an expert at oral or had never
 * taken it in the ass, that she was a cumslut or a dom, that she hated anal, that she'd crossed
 * into needing it. They moved her price and how an act landed, and nothing you could see. In the
 * original they were half the character: skills in every sex scene, fetishes fed or starved by her
 * job, a paraphilia as a need, quirks and flaws as what made her good or bad at her work.
 *
 * Now:
 *   · Her card has all of it as fact for the narrator, in words. What you don't know yet she still
 *     is: the narrator shows it in what she does, without naming it, which is how you find out.
 *   · An act says how good she is at it, and skill is technique: a practised woman takes more in
 *     her pussy or ass with less pain, an untrained one is awkward and it hurts.
 *   · Each week her job (and what you did with her) feeds her fetish or doesn't. Fed, she's easier
 *     and it grows; a strong one starved leaves her wound up. A paraphilia is a need: fed, she's
 *     happy and devoted; starved, she's miserable and resentful, and the report says so.
 *   · Her quirk makes her better at the work that fits it, her flaw worse at the work it clashes
 *     with, and the money says so.
 */
import type { Person, SaveState } from "./types";
import { FETISH_BY_ID, FLAW_BY_ID, QUIRK_BY_ID, ACT_BY_ID, fetishBand } from "../data/intimacy";
import { clamp, shove } from "./psyche";

const SKILL_WORD = (n: number) => (n >= 100 ? "masterful" : n > 60 ? "expert" : n > 30 ? "skilled" : n > 10 ? "basic" : "untrained");

const SKILL_SHOWS: Record<string, Record<string, string>> = {
  oral: { untrained: "clumsy with her mouth: teeth, gagging, no rhythm", basic: "she knows the basics with her mouth", skilled: "good with her mouth", expert: "very good with her mouth: deep, wet, knows exactly what she's doing", masterful: "she can do anything with her mouth and throat" },
  vaginal: { untrained: "stiff and awkward when she's fucked; she doesn't know how to move", basic: "she can ride and move a little", skilled: "she moves well and grips on purpose", expert: "she fucks like a professional", masterful: "she can make a man come with her pussy alone" },
  anal: { untrained: "she's never learned anal: she can't relax for it and it hurts", basic: "she can relax for anal if she's warmed up", skilled: "she takes anal well", expert: "she takes anal easily and knows how to make it good", masterful: "anal is her best trick" },
  penetrative: { untrained: "she's never used her cock on anyone: clumsy, too fast", basic: "she can fuck with her cock", skilled: "she knows how to use her cock", expert: "she fucks with her cock like a stud", masterful: "her cock is a weapon and she knows it" },
  whoring: { untrained: "she doesn't know how to work a client", basic: "she can handle a client", skilled: "a good whore", expert: "an expert whore who gets paid for more than she gives", masterful: "a legend of a whore" },
  entertainment: { untrained: "no idea how to perform or flirt", basic: "she can flirt and dance a little", skilled: "a good performer", expert: "a polished entertainer", masterful: "a star" },
};

/** Her sex skills, in words. */
export function skillsLine(p: Person): string {
  const s = p.skills;
  const parts = [
    `oral ${SKILL_WORD(s.oral)} (${SKILL_SHOWS.oral[SKILL_WORD(s.oral)]})`,
    p.body.vagina !== null ? `pussy ${SKILL_WORD(s.vaginal)} (${SKILL_SHOWS.vaginal[SKILL_WORD(s.vaginal)]})` : "",
    `anal ${SKILL_WORD(s.anal)} (${SKILL_SHOWS.anal[SKILL_WORD(s.anal)]})`,
    (p.body.dick ?? 0) > 0 ? `with her cock ${SKILL_WORD(s.penetrative ?? 0)} (${SKILL_SHOWS.penetrative[SKILL_WORD(s.penetrative ?? 0)]})` : "",
    `as a whore ${SKILL_WORD(s.whoring)}`,
    `performing ${SKILL_WORD(s.entertainment)}`,
  ].filter(Boolean);
  return `HER SKILLS (fact; show them in what she does, skilled or clumsy): ${parts.join("; ")}.`;
}

/** What she wants and hates in bed, known or not. */
export function desireLines(p: Person): string[] {
  const out: string[] = [];
  const hide = "the owner doesn't know this yet: show it in what she does and how she reacts, never name it";
  const fets = p.persona.fetishes.filter((f) => f.name !== "none" && f.strength >= 10 && FETISH_BY_ID[f.name]);
  for (const f of fets) {
    const d = FETISH_BY_ID[f.name];
    out.push(`HER FETISH (${f.known ? "known" : hide}): ${d.name}, she ${fetishBand(f.strength)} it. ${d.note}`);
  }
  if (p.persona.paraphilia) out.push(`HER PARAPHILIA: ${p.persona.paraphilia}. It isn't a preference any more, it's a need: she's restless and miserable without it, and lights up when she gets it.`);
  const q = p.persona.quirk ? QUIRK_BY_ID[p.persona.quirk.id] : undefined;
  if (q) out.push(`HER SEXUAL QUIRK (${p.persona.quirk!.known ? "known" : hide}): ${q.id}. ${q.note}`);
  const fl = p.persona.flaw ? FLAW_BY_ID[p.persona.flaw.id] : undefined;
  if (fl) out.push(`HER SEXUAL FLAW (${p.persona.flaw!.known ? "known" : hide}): ${fl.id}. ${fl.note}${(p.persona.flaw!.worn ?? 0) > 60 ? " It's wearing down: she minds less than she did." : ""}`);
  return out;
}

/** How good she is at the act in front of her, for the narrator. */
export function actSkillLine(p: Person, actId: string): string {
  const act = ACT_BY_ID[actId];
  if (!act) return "";
  const key = act.tags.includes("oral") || act.tags.includes("throat") ? "oral" : act.tags.includes("anal") ? "anal" : act.tags.includes("vaginal") ? "vaginal" : act.tags.includes("penetrative") ? "penetrative" : act.group === "display" ? "entertainment" : "";
  if (!key) return "";
  const n = (p.skills as unknown as Record<string, number>)[key] ?? 0;
  return `HOW GOOD SHE IS AT IT (fact): ${SKILL_SHOWS[key][SKILL_WORD(n)]}.`;
}

/** What her work is made of, for what it feeds and what it clashes with. */
function jobTags(s: SaveState, p: Person): Set<string> {
  const a = p.assignment ?? "", f = p.facility ?? "";
  const t = new Set<string>();
  const add = (...xs: string[]) => xs.forEach((x) => t.add(x));
  if (/whore/.test(a) || f === "brothel") add("sex", "clients", "oral", "vaginal", "anal");
  if (/public servant/.test(a)) add("sex", "public", "clients", "oral", "vaginal");
  if (f === "arcade" || /arcade/.test(a)) add("sex", "restraint", "degradation", "oral", "anal", "public");
  if (f === "club" || /idol/.test(a)) add("show", "public", "tease");
  if (f === "dairy" || /milk/.test(a)) add("milking", "boobs");
  if (/please you|fucktoy/.test(a) || f === "master_suite") add("sex", "owner", "oral", "vaginal", "anal", "submission");
  if (f === "cellblock" || /cellblock|confined/.test(a)) add("restraint", "pain", "submission");
  if (f === "pit") add("fight", "pain", "public");
  if (/Head Girl|guard|agent|recruit/.test(a) || Object.values(s.arcology.facilities).some((x) => x.manager === p.id)) add("power");
  if (["clinic", "spa", "nursery"].includes(f)) add("care");
  if (p.womb.fetuses.length) add("pregnant");
  return t;
}

const FEEDS: Record<string, string[]> = {
  humiliation: ["public", "degradation"], submissive: ["submission", "restraint"], cumslut: ["oral", "clients"], buttslut: ["anal"],
  boobs: ["boobs", "milking"], pregnancy: ["pregnant"], dom: ["power"], sadist: ["power"], masochist: ["pain", "restraint"],
};

const QUIRK_JOB: Record<string, string[]> = {
  tease: ["show", "tease"], romantic: ["owner"], caring: ["care", "owner"], "gagfuck queen": ["oral", "clients"], "painal queen": ["anal", "restraint"],
  "strugglefuck queen": ["restraint"], perverted: ["clients", "public"], unflinching: ["degradation", "restraint"], "size queen": ["clients"],
};
const FLAW_JOB: Record<string, string[]> = {
  "hates oral": ["oral", "clients"], "hates anal": ["anal"], "hates penetration": ["vaginal", "anal", "clients"], repressed: ["sex", "public"],
  idealistic: ["clients", "public"], shamefast: ["public", "show"], apathetic: ["sex", "show"], crude: ["show", "clients"], judgemental: ["clients"],
};

/** What her quirk and flaw do to what her work earns. */
export function jobFit(s: SaveState, p: Person): { mult: number; why: string[] } {
  const t = jobTags(s, p);
  const why: string[] = [];
  let mult = 1;
  const q = p.persona.quirk?.id;
  if (q && (QUIRK_JOB[q] ?? []).some((x) => t.has(x))) { mult *= 1.15; why.push(`her ${q} suits the work`); }
  const f = p.persona.flaw?.id;
  if (f && (FLAW_JOB[f] ?? []).some((x) => t.has(x))) { const worn = clamp((p.persona.flaw?.worn ?? 0) / 120, 0, 0.75); mult *= 1 - 0.2 * (1 - worn); why.push(`her ${f} gets in the way`); }
  return { mult, why };
}

/** Mark that something she did fed a fetish of hers (engine/intimacy). */
export function fed(p: Person, week: number): void {
  p.counters.fed = week;
}

/** Weekly: her fetish and paraphilia, fed by her work and what you did with her, or not. Returns a
 *  line for the report when it matters. */
export function weeklyDesires(s: SaveState, p: Person): string | null {
  if (p.psyche.state === "broken") return null;
  const t = jobTags(s, p);
  const week = s.arcology.week;
  const byYou = (p.counters.fed ?? -99) >= week - 1;
  let line: string | null = null;
  for (const f of p.persona.fetishes) {
    if (f.name === "none" || f.strength < 30) continue;
    const def = FETISH_BY_ID[f.name];
    const isFed = byYou || (FEEDS[f.name] ?? []).some((x) => t.has(x));
    const para = !!def?.becomes && p.persona.paraphilia === def.becomes;
    if (isFed) {
      shove(p.psyche, para ? 0.5 : 0.2);
      p.psyche.arousal = clamp(p.psyche.arousal - 10, 0, 100);
      f.strength = Math.min(120, f.strength + 1);
      if (para) { p.bond.bond = clamp(p.bond.bond + 2, -100, 100); line = `${p.name}'s ${p.persona.paraphilia} is fed${byYou ? " by what you do with her" : " by her work"}, and she's never been happier.`; }
    } else if (para) {
      shove(p.psyche, -0.6);
      p.bond.resentment = clamp(p.bond.resentment + 2, 0, 100);
      p.psyche.arousal = clamp(p.psyche.arousal + 15, 0, 100);
      line = `${p.name}'s ${p.persona.paraphilia} goes unfed this week, and she's restless and miserable for it.`;
    } else if (f.strength >= 60) p.psyche.arousal = clamp(p.psyche.arousal + 8, 0, 100);
  }
  return line;
}
