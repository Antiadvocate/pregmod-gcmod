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
import { DOMINANT, dominantStrength, reachOf } from "./nature";

const SKILL_WORD = (n: number) => (n >= 100 ? "masterful" : n > 60 ? "expert" : n > 30 ? "skilled" : n > 10 ? "basic" : "untrained");

const SKILL_SHOWS: Record<string, Record<string, string>> = {
  oral: { untrained: "she's clumsy with her mouth, with teeth, gagging and no rhythm", basic: "she knows the basics with her mouth", skilled: "she's good with her mouth", expert: "she's very good with her mouth, deep and wet, and she knows exactly what she's doing", masterful: "she can do anything with her mouth and throat" },
  vaginal: { untrained: "she's stiff and awkward when she's fucked, and doesn't know how to move", basic: "she can ride and move a little", skilled: "she moves well and grips on purpose", expert: "she fucks like a professional", masterful: "she can make a man come with her pussy alone" },
  anal: { untrained: "she's never learned anal, so she can't relax for it and it hurts", basic: "she can relax for anal if she's warmed up", skilled: "she takes anal well", expert: "she takes anal easily and knows how to make it good", masterful: "anal is her best trick" },
  penetrative: { untrained: "she's never used her cock on anyone, so she's clumsy and too fast", basic: "she can fuck with her cock", skilled: "she knows how to use her cock", expert: "she fucks with her cock like a stud", masterful: "her cock is a weapon and she knows it" },
  whoring: { untrained: "she doesn't know how to work a client", basic: "she can handle a client", skilled: "she's a good whore", expert: "she's an expert whore who gets paid for more than she gives", masterful: "she's a legend of a whore" },
  entertainment: { untrained: "she has no idea how to perform or flirt", basic: "she can flirt and dance a little", skilled: "she's a good performer", expert: "she's a polished entertainer", masterful: "she's a star" },
};

/** Her sex skills, in words. */
export function skillsLine(p: Person): string {
  const s = p.skills;
  const parts = [
    `orally she's ${SKILL_WORD(s.oral)} (${SKILL_SHOWS.oral[SKILL_WORD(s.oral)]})`,
    p.body.vagina !== null ? `with her pussy she's ${SKILL_WORD(s.vaginal)} (${SKILL_SHOWS.vaginal[SKILL_WORD(s.vaginal)]})` : "",
    `at anal she's ${SKILL_WORD(s.anal)} (${SKILL_SHOWS.anal[SKILL_WORD(s.anal)]})`,
    (p.body.dick ?? 0) > 0 ? `with her cock she's ${SKILL_WORD(s.penetrative ?? 0)} (${SKILL_SHOWS.penetrative[SKILL_WORD(s.penetrative ?? 0)]})` : "",
    `as a whore she's ${SKILL_WORD(s.whoring)}`,
    `as a performer she's ${SKILL_WORD(s.entertainment)}`,
  ].filter(Boolean);
  return `HER SKILLS. These are facts, so show them in what she does, whether she's skilled or clumsy. ${parts.join(", ").replace(/^./, (c) => c.toUpperCase())}.`;
}

/* ── who she is in bed ───────────────────────────────────────────────────────────────────────
 * A one-line note ("she likes being in charge in bed") lost to everything else on her card: a
 * forged voice that says she goes still and quiet, an agenda of staying out of trouble, a stance
 * that says she obeys. The narrator wrote the quiet, obedient woman and the dom never showed. So
 * each one is spelled out as what she does when sex happens, it's said to win over the quieter
 * reading of her personality, and how it sits with her obeying the owner is said too. */

const FETISH_SHOWS: Record<string, string> = {
  dom: "she wants to be the one in charge. She takes the top whenever she can get it, pins wrists, sets the pace, tells her partner what to do and how, kisses hard and bites. Giving orders and making someone take it is what gets her wet. Lying there being used does little for her, and she tries to turn it around",
  sadist: "someone else's pain gets her off. She pinches, slaps, bites and digs her nails in, and she watches the face she's hurting. A wince or a whimper does more for her than anything done to her",
  masochist: "pain gets her off. She wants it rough, pushes into the slap, asks to be hurt and comes harder for a bruise. Gentle sex does nothing for her and she gets impatient with it",
  submissive: "she wants to be told what to do and held down. An order or a hand on her throat melts her, she goes soft and wet when she's gripped and used, and she's lost when someone asks her what she wants",
  humiliation: "being watched and shamed gets her off. She wants an audience, to be exposed, and to be called what she is. She blushes and gets wetter for it, and privacy bores her",
  cumslut: "she's after cum. She wants it in her mouth or on her face, asks for it, swallows it and licks up what she missed, and the taste is what finishes her",
  buttslut: "she wants it in her ass. She pushes back onto it, asks for it there, and comes hardest from anal",
  boobs: "her breasts are everything to her. Having them played with, sucked, squeezed or fucked gets her off faster than anything else, and she offers them first",
  pregnancy: "she wants to be bred. She begs to be filled and wants it left inside her, and being pregnant, or even the thought of it, makes her desperate",
  armpits: "she wants her armpits worshipped. She lifts an arm and puts a face in it, she's stopped shaving them, and a tongue there gets her wetter than one between her legs",
  musk: "she wants her smell to be wanted. She comes to bed unwashed on purpose, pushes a face into her armpit, her neck or the arch of her foot, and watches it breathe her in",
  facesitting: "she wants to sit on a face. She climbs up, settles her whole weight, closes her thighs and grinds, and she lifts off when she decides to, not when she's asked",
  assworship: "she wants her ass worshipped. She presents it, reaches back to spread herself, and tells the tongue where to go and how long to stay there",
  goddess: "she wants to be worshipped rather than fucked. She wants to be knelt to, praised out loud and kissed all over as if her body were holy, and being treated as something to use leaves her cold",
  pegging: "she wants to fuck her partner with a strap-on. She talks about it, buckles it on given half a chance, and the sound a man makes taking it is what she's after",
  keyholder: "she wants her partner locked in a cage with the only key on a chain around her neck. She checks the lock, keeps count of the days, and teases him through the bars by stroking it, grinding on it, and sitting on his face while he strains against it. She edges him when she unlocks him, ruins it more often than not, and squeezes or flicks the cage and his balls when he begs. She takes other men while he's locked, makes him watch or listen or clean up afterwards, and reminds him that they get to come and he doesn't",
  spit: "she wants to spit in an open mouth or on a face and watch it get swallowed. It's a small thing, and it gets her wetter than it should",
  ballbusting: "she gets off on hurting balls. She uses a knee, a slap or a slow squeeze, and she watches for the face someone makes",
  findom: "money spent on her because she said so is what gets her wet. She puts a price on things, holds out her hand and waits, and makes sure the owner sees what his money bought. The handing over does more for her than being touched, and it shows in her face and her mood, never in her explaining it",
  sph: "she gets off on laughing at a cock. She measures it with her fingers, compares it to her toys and to men she's had, and says exactly how little it does for her. A small one delights her",
  cuckoldress: "she wants her partner to watch her with someone bigger and better, and to hear about it afterwards in detail. His face while it happens is the point",
  petplay: "she wants to be a pet, with ears, a collar and a leash, on all fours, praised and petted, with a bowl on the floor. She stays in it for hours",
  breathplay: "a hand on a throat is her thing, whether it's hers on her partner's or someone's on hers. The edge of running out of air is where she comes",
  voyeur: "she gets off watching other people fuck, her owner with someone else, or anyone who doesn't know she's there. She'd rather watch than join in",
  tickling: "being tickled until she can't breathe gets her off, and she begs for it to stop and for it to go on in the same breath",
  furniture: "she wants a person for furniture, as a footstool under her feet, a seat, or a table for her drink, and she wants to forget they're there",
};

const PARAPHILIA_SHOWS: Record<string, string> = {
  abusive: "she needs to dominate someone and abuse them sexually. She holds them down, uses them for her own pleasure, makes them cry and keeps going. It's what gets her off, and nothing else really does. When she's starved of it she's tense, short-tempered and rough with things and people",
  malicious: "she needs to hurt people to get off, with real pain, tears and marks. She looks for chances to be cruel, and it's the only thing that finishes her. When she's starved of it she's vicious in small ways",
  "self hating": "she needs to be hurt and degraded. She thinks she deserves it, begs for it, and wants it to go further than is safe, and kindness makes her uneasy",
  "attention whore": "she needs to be seen having sex. An audience is the point, and sex in private barely registers",
  "cum addict": "she needs cum, constantly. She thinks about it all day, begs for it, and gets shaky and irritable without it",
  "anal addict": "she needs it in her ass, constantly. She begs for anal, and nothing else gets her off",
  "breast growth": "she's obsessed with her breasts getting bigger. She talks about it, touches them, and their growing is what gets her off",
  breeder: "she's obsessed with being bred and being pregnant. It's what she wants from every fuck, and not being pregnant torments her",
  neglectful: "she's given up having needs of her own. All that matters to her in bed is the other person's pleasure, and her own barely registers",
  "scent obsessed": "she needs her smell worshipped. She won't wash before bed, she pushes faces into her armpits and under her feet, and nothing gets her off unless someone breathes her in first",
  "goddess complex": "she needs to be worshipped. She expects kneeling, praise and service as her due, and sex that isn't worship barely registers with her",
  throne: "she needs to sit on faces. Having a partner underneath her is how she comes, and she stays down longer every time",
  "keyholder for life": "she needs her partner locked up, permanently. The cage stays on, the key never leaves her neck, and release is something she hands out once in a long while and usually ruins. Teasing him through it, hurting it, and having other men in front of him while he's locked are what get her off. An unlocked man in her bed bores her",
  humiliatrix: "she needs to humiliate her partner, by laughing at him, spitting on him, pegging him and telling him what he is. It's the only thing that finishes her",
  cuckqueen: "she needs her partner to watch her with someone else, and to know he isn't enough",
  "pet for life": "she needs to be a pet, on a leash, praised and petted and past words. Being a person in bed doesn't do anything for her any more",
  "breath addict": "she needs the edge of running out of air, from a hand on a throat or a face under her thighs, and without it she can't come",
  "tribute junkie": "she needs to be paid, with tribute, gifts and money handed over because she said so. It's what she thinks about, and it's what she comes from",
};

/** The paraphilias that need a victim rather than a partner. */
const ABUSIVE = new Set(["abusive", "malicious"]);

/** Whether she's the kind who takes charge in bed: a dom or sadist fetish that's real, or the
 *  paraphilia either becomes. */
export function dominantInBed(p: Person): boolean {
  return p.persona.fetishes.some((f) => DOMINANT.has(f.name) && f.strength >= 30) || DOMINANT.has(p.persona.paraphilia ?? "");
}

/** A devoted woman with a dominant streak: devotion isn't softness. How far it reaches the owner is
 *  engine/nature's call (strength against ease, trust, fear and room), the same as on HER NATURE,
 *  so the bed lines never tell her to wait to be handed control when her nature says she takes it. */
function devotedDom(s: SaveState, p: Person): string {
  const reach = reachOf(s, p, dominantStrength(p));
  if (reach === "takes") return "She's devoted to the owner, and with her that doesn't mean gentle. She takes charge of him without waiting to be handed it. She gives him orders, holds him down, uses him and hurts him the way her nature wants, and how much she loves him shows in how hard she goes. She stops if he really stops her.";
  if (reach === "slips") return "She obeys the owner and she wants control, both at once. Now and then she grabs it before she thinks, pins him, gives an order or gets rough, and the moment she catches herself she backs off, knowing she's overstepped, unless he lets her carry on. When he hands her control, she uses it hard.";
  return "";
}

/** How a dominant streak sits with how she takes orders. */
function withOrders(stance: Stance, devoted = ""): string {
  if ((stance === "eager" || stance === "obedient") && devoted) return devoted;
  if (stance === "eager" || stance === "obedient") return "She obeys the owner and she wants control, both at once. She asks him for it, drops hints and pushes a little, and she only takes charge when he hands it to her. Until he does she gives him no orders, and if she's told to lie still and take it she does, and it shows as frustration rather than pleasure.";
  if (stance === "reluctant" || stance === "resists" || stance === "fights") return "With an owner she doesn't want, it comes out as a fight. She shoves back, goes for the top, scratches and bites, and the struggle does more for her than she'd ever admit.";
  if (stance === "terrified") return "Fear holds it down when she's with the owner, so it comes out on anyone weaker than her.";
  if (stance === "free") return "She isn't bound to obey him, and in bed she takes charge as far as he lets her.";
  return "";
}

/** Who a need to use or hurt someone can land on, under the house rules. */
function targets(s: SaveState, p: Person): string {
  const others = Object.values(s.people).filter((x) => x.id !== p.id && x.age >= 18 && (x.status === "owned" || x.status === "indentured"));
  if (!others.length) return reachOf(s, p, dominantStrength(p)) === "takes"
    ? "There's no other slave in the house, so it all lands on the owner, and she doesn't wait to be handed control to put it there."
    : "There's no other slave in the house, so it has nowhere to go but the owner. She's rough with him when he hands her control, and the rest of the time it shows as restlessness.";
  if (forcedAllowed(s)) return "The house rules let her take the other slaves whether they want it or not, and she does.";
  if (slaveSex(s)) return "The house rules let her have the other slaves only if they agree, and what she needs goes past what they'll agree to.";
  return "The house rules forbid her from touching the other slaves, and it eats at her. She watches them, and the need comes out on the owner when he lets it.";
}

/** Kinks that live in the rest of the day too, not only in bed: being paid, being served, using
 *  someone as furniture. Their line says so, or a model keeps them for the bedroom. */
const EVERYDAY = new Set(["findom", "goddess", "furniture", "keyholder", "cuckoldress", "petplay", "sph"]);

/** What she wants and hates in bed, known or not, and who she is when sex happens. */
export function desireLines(p: Person, s?: SaveState): string[] {
  const out: string[] = [];
  const hide = "The owner doesn't know this yet, so show it in what she does and how she reacts, and never name it.";
  const fets = p.persona.fetishes.filter((f) => f.name !== "none" && f.strength >= 10 && FETISH_BY_ID[f.name]);
  for (const f of fets) {
    const d = FETISH_BY_ID[f.name];
    const shows = f.strength >= 30 && FETISH_SHOWS[f.name] ? ` ${EVERYDAY.has(f.name) ? "Day to day as much as in bed" : "In bed"}, ${FETISH_SHOWS[f.name]}.` : ` ${d.note}`;
    out.push(`HER FETISH: ${d.name}, and she ${fetishBand(f.strength)} it.${shows}${f.known ? "" : ` ${hide}`}`);
  }
  const para = p.persona.paraphilia;
  if (para) out.push(`HER PARAPHILIA: ${para}. It isn't a preference any more but a need, because ${PARAPHILIA_SHOWS[para] ?? "she's restless and miserable without it, and she lights up when she gets it"}.`);
  const q = p.persona.quirk ? QUIRK_BY_ID[p.persona.quirk.id] : undefined;
  if (q) out.push(`HER SEXUAL QUIRK: ${q.id}. ${q.note}${p.persona.quirk!.known ? "" : ` ${hide}`}`);
  const fl = p.persona.flaw ? FLAW_BY_ID[p.persona.flaw.id] : undefined;
  if (fl) out.push(`HER SEXUAL FLAW: ${fl.id}. ${fl.note}${(p.persona.flaw!.worn ?? 0) > 60 ? " It's wearing down, and she minds less than she did." : ""}${p.persona.flaw!.known ? "" : ` ${hide}`}`);
  const strong = fets.some((f) => f.strength >= 30) || !!para;
  if (strong && p.psyche.state !== "broken") {
    const parts = ["IN BED. This is a fact. When sex happens, or when she's turned on, her fetish and paraphilia above decide what she reaches for, what gets her off and what leaves her cold. They win over the quieter reading of her personality and voice, so a shy, careful or obedient woman can be a dom in bed, and the contrast is the point. Show it in what she does every time sex happens."];
    if (s && dominantInBed(p)) {
      const how = withOrders(obeys(s, p).stance, devotedDom(s, p));
      if (how) parts.push(how);
      if (ABUSIVE.has(para ?? "")) parts.push(targets(s, p));
    }
    out.push(parts.join(" "));
  }
  return out;
}

/** Who she is in bed, in a line, for the prompts that write her personality (engine/forge,
 *  engine/growth): what they wrote without it is how a dom ended up meek. */
export function inBed(p: Person): string {
  const parts = p.persona.fetishes.filter((f) => f.name !== "none" && f.strength >= 30)
    .map((f) => `She's into ${f.name} (${f.strength >= 100 ? "past a preference" : f.strength >= 60 ? "strongly" : "for real"})${FETISH_SHOWS[f.name] ? `, and in bed ${FETISH_SHOWS[f.name]}` : ""}.`);
  if (p.persona.paraphilia) parts.push(`She has a paraphilia, ${p.persona.paraphilia}, which means ${PARAPHILIA_SHOWS[p.persona.paraphilia] ?? "it's a need rather than a preference"}.`);
  if (p.persona.quirk) parts.push(`Her sexual quirk is that she's a ${p.persona.quirk.id}.`);
  if (p.persona.flaw) parts.push(`Her sexual flaw is that she ${p.persona.flaw.id}.`);
  return parts.join(" ");
}

/** For an act: what her fetish and paraphilia make of it, beyond liking or not. */
export function actDesireLine(s: SaveState, p: Person, actId: string): string {
  const act = ACT_BY_ID[actId];
  if (!act || p.psyche.state === "broken" || !dominantInBed(p)) return "";
  const hers = act.tags.some((t) => ["domination", "using another", "pain on another", "punishing another", "femdom"].includes(t));
  const abusive = ABUSIVE.has(p.persona.paraphilia ?? "");
  if (hers) return `SHE'S IN CHARGE HERE, and this is a fact. This is what she's made for. She takes control for real, sets the pace, holds you down and tells you what to do and how, and it gets her wetter than anything done to her.${abusive ? " She's rough, she pushes past what you asked if you let her, and she loves the moment it stops being comfortable for you." : ""}`;
  // Served, not used: a pedicure or her feet worshipped is you doing something for her, and a dom
  // enjoys it; it isn't her cue to start giving orders.
  const served = act.receives || act.group === "tenderness" || act.group === "hers" || act.tags.includes("worship");
  if (served) return "SHE LIKES BEING SERVED, and this is a fact. You doing this for her suits her, and it shows in how she settles into it and enjoys it, not in her giving you orders.";
  const stance = obeys(s, p).stance;
  if (stance === "terrified") return "SHE'D RATHER BE ON TOP, and this is a fact. Being used isn't what she wants, but she's too afraid of you to show it, and it leaves her cold.";
  const devoted = (stance === "eager" || stance === "obedient") ? devotedDom(s, p) : "";
  if (devoted) return `SHE'D RATHER BE ON TOP, and this is a fact. ${devoted}`;
  if (stance === "eager" || stance === "obedient") return "SHE'D RATHER BE ON TOP, and this is a fact. Being used isn't what she wants. She may ask to be on top or push back a little, but if you don't let her she does what you want, and it shows as frustration rather than pleasure. She gives you no orders.";
  return "SHE'D RATHER BE ON TOP, and this is a fact. She fights for control as much as she fights against you, shoving back, going for the top, biting and scratching.";
}

/** How good she is at the act in front of her, for the narrator. */
export function actSkillLine(p: Person, actId: string): string {
  const act = ACT_BY_ID[actId];
  if (!act) return "";
  const key = act.tags.includes("oral") || act.tags.includes("throat") ? "oral" : act.tags.includes("anal") ? "anal" : act.tags.includes("vaginal") ? "vaginal" : act.tags.includes("penetrative") ? "penetrative" : act.group === "display" ? "entertainment" : "";
  if (!key) return "";
  const n = (p.skills as unknown as Record<string, number>)[key] ?? 0;
  return `HOW GOOD SHE IS AT IT, which is a fact: ${SKILL_SHOWS[key][SKILL_WORD(n)]}.`;
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
