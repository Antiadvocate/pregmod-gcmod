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
import { obeys, type Stance } from "./compliance";
import { forcedAllowed, slaveSex } from "./houserules";

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

/* ── who she is in bed ───────────────────────────────────────────────────────────────────────
 * A one-line note ("she likes being in charge in bed") lost to everything else on her card: a
 * forged voice that says she goes still and quiet, an agenda of staying out of trouble, a stance
 * that says she obeys. The narrator wrote the quiet, obedient woman and the dom never showed. So
 * each one is spelled out as what she does when sex happens, it's said to win over the quieter
 * reading of her personality, and how it sits with her obeying the owner is said too. */

const FETISH_SHOWS: Record<string, string> = {
  dom: "she wants to be the one in charge: she takes the top whenever she can get it, pins wrists, sets the pace, tells her partner what to do and how, kisses hard and bites. Giving orders and making someone take it is what gets her wet; lying there being used does little for her, and she tries to turn it around",
  sadist: "someone else's pain gets her off: she pinches, slaps, bites, digs her nails in and watches the face she's hurting; a wince or a whimper does more for her than anything done to her",
  masochist: "pain gets her off: she wants it rough, pushes into the slap, asks to be hurt and comes harder for a bruise; gentle sex does nothing for her and she gets impatient with it",
  submissive: "she wants to be told and held down: an order or a hand on her throat melts her, she goes soft and wet when she's gripped and used, and she's lost when asked what she wants",
  humiliation: "being watched and shamed gets her off: an audience, being exposed, being called what she is; she blushes and gets wetter for it, and privacy bores her",
  cumslut: "she's after cum: she wants it in her mouth or on her face, asks for it, swallows and licks up what she missed, and the taste is what finishes her",
  buttslut: "she wants it in her ass: she pushes back onto it, asks for it there, and comes hardest from anal",
  boobs: "her breasts are everything: having them played with, sucked, squeezed or fucked gets her off faster than anything else, and she offers them first",
  pregnancy: "she wants to be bred: she begs to be filled, wants it inside her and not pulled out, and being pregnant, or the thought of it, makes her desperate",
};

const PARAPHILIA_SHOWS: Record<string, string> = {
  abusive: "she needs to dominate and abuse someone sexually: hold them down, use them for her own pleasure, make them cry and keep going. It's what gets her off, and nothing else really does. Starved of it she's tense, short-tempered and rough with things and people",
  malicious: "she needs to hurt people to get off: real pain, tears, marks. She looks for chances to be cruel, and it's the only thing that finishes her. Starved of it she's vicious in small ways",
  "self hating": "she needs to be hurt and degraded: she thinks she deserves it, begs for it, and wants it to go further than is safe; kindness makes her uneasy",
  "attention whore": "she needs to be seen having sex: an audience is the point, and sex in private barely registers",
  "cum addict": "she needs cum, constantly: she thinks about it all day, begs for it, and gets shaky and irritable without it",
  "anal addict": "she needs it in her ass, constantly: she begs for anal, and nothing else gets her off",
  "breast growth": "she's obsessed with her breasts getting bigger: she talks about it, touches them, and growth gets her off",
  breeder: "she's obsessed with being bred and pregnant: it's what she wants from every fuck, and not being pregnant torments her",
  neglectful: "she's given up having needs of her own: all that matters to her in bed is the other person's pleasure, and her own barely registers",
};

const DOMINANT = new Set(["dom", "sadist", "abusive", "malicious"]);

/** Whether she's the kind who takes charge in bed: a dom or sadist fetish that's real, or the
 *  paraphilia either becomes. */
export function dominantInBed(p: Person): boolean {
  return p.persona.fetishes.some((f) => DOMINANT.has(f.name) && f.strength >= 30) || DOMINANT.has(p.persona.paraphilia ?? "");
}

/** How a dominant streak sits with how she takes orders. */
function withOrders(stance: Stance): string {
  if (stance === "eager" || stance === "obedient") return "She obeys the owner and she wants control, both at once: with him she asks for it, angles for it, slips into it, and takes over the moment he gives her an inch; told to lie still and take it, she does, and it shows as frustration, not pleasure.";
  if (stance === "reluctant" || stance === "resists" || stance === "fights") return "With an owner she doesn't want, it comes out as fight: she shoves back, goes for the top, scratches and bites, and the struggle does more for her than she'd ever admit.";
  if (stance === "terrified") return "Fear holds it down with the owner; it comes out on anyone weaker than her.";
  if (stance === "free") return "She isn't bound to obey him, and in bed she takes charge as far as he lets her.";
  return "";
}

/** Who a need to use or hurt someone can land on, under the house rules. */
function targets(s: SaveState, p: Person): string {
  const others = Object.values(s.people).filter((x) => x.id !== p.id && x.age >= 18 && (x.status === "owned" || x.status === "indentured"));
  if (!others.length) return "There's no other slave in the house, so it has nowhere to go but the owner: she's rough with him whenever she's let, and the need shows when she isn't.";
  if (forcedAllowed(s)) return "The house rules let her take the other slaves whether they want it or not, and she does.";
  if (slaveSex(s)) return "The house rules let her have the other slaves only if they agree, and what she needs goes past what they'll agree to.";
  return "The house rules forbid her touching the other slaves, and it eats at her: she watches them, and the need comes out on the owner when he lets it.";
}

/** What she wants and hates in bed, known or not, and who she is when sex happens. */
export function desireLines(p: Person, s?: SaveState): string[] {
  const out: string[] = [];
  const hide = "the owner doesn't know this yet: show it in what she does and how she reacts, never name it";
  const fets = p.persona.fetishes.filter((f) => f.name !== "none" && f.strength >= 10 && FETISH_BY_ID[f.name]);
  for (const f of fets) {
    const d = FETISH_BY_ID[f.name];
    const shows = f.strength >= 30 && FETISH_SHOWS[f.name] ? ` In bed: ${FETISH_SHOWS[f.name]}.` : ` ${d.note}`;
    out.push(`HER FETISH (${f.known ? "known" : hide}): ${d.name}, she ${fetishBand(f.strength)} it.${shows}`);
  }
  const para = p.persona.paraphilia;
  if (para) out.push(`HER PARAPHILIA: ${para}. It isn't a preference any more, it's a need: ${PARAPHILIA_SHOWS[para] ?? "she's restless and miserable without it, and lights up when she gets it"}.`);
  const q = p.persona.quirk ? QUIRK_BY_ID[p.persona.quirk.id] : undefined;
  if (q) out.push(`HER SEXUAL QUIRK (${p.persona.quirk!.known ? "known" : hide}): ${q.id}. ${q.note}`);
  const fl = p.persona.flaw ? FLAW_BY_ID[p.persona.flaw.id] : undefined;
  if (fl) out.push(`HER SEXUAL FLAW (${p.persona.flaw!.known ? "known" : hide}): ${fl.id}. ${fl.note}${(p.persona.flaw!.worn ?? 0) > 60 ? " It's wearing down: she minds less than she did." : ""}`);
  const strong = fets.some((f) => f.strength >= 30) || !!para;
  if (strong && p.psyche.state !== "broken") {
    const parts = ["IN BED (fact): when sex happens, or she's turned on, her fetish and paraphilia above decide what she reaches for, what gets her off and what leaves her cold. They win over the quieter reading of her personality and voice: a shy, careful or obedient woman can be a dom in bed, and the contrast is the point. Show it in what she does, every time sex happens."];
    if (s && dominantInBed(p)) {
      const how = withOrders(obeys(s, p).stance);
      if (how) parts.push(how);
      if (DOMINANT.has(para ?? "")) parts.push(targets(s, p));
    }
    out.push(parts.join(" "));
  }
  return out;
}

/** Who she is in bed, in a line, for the prompts that write her personality (engine/forge,
 *  engine/growth): what they wrote without it is how a dom ended up meek. */
export function inBed(p: Person): string {
  const parts = p.persona.fetishes.filter((f) => f.name !== "none" && f.strength >= 30)
    .map((f) => `${f.name} (${f.strength >= 100 ? "past a preference" : f.strength >= 60 ? "strong" : "real"})${FETISH_SHOWS[f.name] ? `: ${FETISH_SHOWS[f.name]}` : ""}`);
  if (p.persona.paraphilia) parts.push(`paraphilia, ${p.persona.paraphilia}: ${PARAPHILIA_SHOWS[p.persona.paraphilia] ?? "a need, not a preference"}`);
  if (p.persona.quirk) parts.push(`sexual quirk: ${p.persona.quirk.id}`);
  if (p.persona.flaw) parts.push(`sexual flaw: ${p.persona.flaw.id}`);
  return parts.join("; ");
}

/** For an act: what her fetish and paraphilia make of it, beyond liking or not. */
export function actDesireLine(s: SaveState, p: Person, actId: string): string {
  const act = ACT_BY_ID[actId];
  if (!act || p.psyche.state === "broken" || !dominantInBed(p)) return "";
  const hers = act.tags.some((t) => ["domination", "using another", "pain on another", "punishing another"].includes(t));
  const abusive = DOMINANT.has(p.persona.paraphilia ?? "");
  if (hers) return `SHE'S IN CHARGE HERE (fact): this is what she's made for. She takes control for real: sets the pace, holds you down, tells you what to do and how, and it gets her wetter than anything done to her.${abusive ? " She's rough, she pushes past what you asked if you let her, and she loves the moment it stops being comfortable for you." : ""}`;
  if (act.receives) return "";
  const stance = obeys(s, p).stance;
  if (stance === "terrified") return "SHE'D RATHER BE ON TOP (fact): being used isn't what she wants, but she's too afraid of you to show it; it leaves her cold.";
  if (stance === "eager" || stance === "obedient") return "SHE'D RATHER BE ON TOP (fact): being used isn't what she wants. She tries to turn it: gets on top, sets the pace, grabs your hair, tells you how she wants it, as far as you let her. If you stop her she submits, and it shows as frustration, not pleasure.";
  return "SHE'D RATHER BE ON TOP (fact): she fights for control as much as against you: shoves back, goes for the top, bites and scratches.";
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
