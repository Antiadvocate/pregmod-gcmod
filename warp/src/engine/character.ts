/**
 * MORE OF A PERSON — her behaviour, a trait with some grain to it, and what she's good at.
 *
 * Generated women came from a short list: fourteen traits, twenty careers, a handful of ways to be
 * enslaved, and nothing she was good at besides what the skills table counts. So the household
 * blurred: every third girl was "nervous and fidgety", none of them could cook, and none of them
 * had the original's behavioural flaws, the friction love alone doesn't fix.
 *
 * Seeded once per woman from her own stream (so nothing else rolled for her shifts), and on load for
 * older saves:
 *   · a behavioural flaw or quirk (data/behavior), weighted by the life she had;
 *   · one of her three traits swapped for one from a long list of specific, contradictory ones;
 *   · what she's good at besides sex, from her career, which earns a little more when her job uses it.
 */
import type { Person } from "./types";
import { rng, type Rng } from "./rng";
import { BEHAVIOR_FLAWS, BEHAVIOR_FLAW_BY_ID, BEHAVIOR_QUIRKS, BEHAVIOR_QUIRK_BY_ID } from "../data/behavior";

const TRAITS = [
  "lies easily and well, and is kind to animals", "proud of her body and ashamed of wanting", "funny when she's scared",
  "keeps promises, even stupid ones", "petty about small things and generous about big ones", "talks to herself while she works",
  "can't stand being laughed at", "flirts when she's nervous", "remembers every slight, word for word", "fiercely loyal once she's won over",
  "sulks in silence instead of arguing", "brave in a crisis and a coward about small things", "superstitious about everything",
  "competitive about everything, even who finishes her plate first", "hates being pitied", "dramatic about small hurts and silent about big ones",
  "curious about things she shouldn't be", "a good liar and a bad actress", "cheerful in a way that wears people out", "stubborn, and proud of it",
  "polite to everyone and warm to almost no one", "can't keep a secret", "keeps everyone's secrets but her own", "jealous, and knows it",
  "vain about her hair", "blunt to the point of rudeness", "bored within a day of anything", "a romantic who'd never admit it",
  "a snob about food", "practical to the bone", "secretly sentimental", "hates silence and fills it", "obsessed with what's fair",
  "a show-off", "a worrier who plans for the worst", "a schemer who can't help it", "sweet to your face, sharp behind your back",
  "quick to cry and quick to forgive", "slow to anger and frightening once she gets there", "lazy until someone she likes is watching",
];

/** What she's good at, by the life she had, and the work it helps. */
const TALENTS: Record<string, [string, Tag][]> = {
  nurse: [["nursing and first aid", "care"]], doctor: [["medicine", "care"]], masseuse: [["massage", "care"]],
  "flight attendant": [["calming frightened people", "care"]], nun: [["patience", "care"]], "social worker": [["looking after people", "care"]],
  cook: [["cooking", "house"]], housewife: [["cooking and keeping a house", "house"]], waitress: [["waiting tables", "house"]],
  maid: [["keeping a house spotless", "house"]], servant: [["service", "house"]], refugee: [["making do with nothing", "house"]],
  teacher: [["teaching", "teach"]], librarian: [["teaching", "teach"]], student: [["learning fast", "teach"]],
  dancer: [["dancing", "show"]], stripper: [["dancing", "show"]], actress: [["acting", "show"]], cheerleader: [["dancing", "show"]],
  musician: [["music", "show"]], camgirl: [["performing for a camera", "show"]], influencer: [["performing for a camera", "show"]],
  model: [["posing", "show"]], artist: [["drawing", "show"]], hairdresser: [["hair and makeup", "show"]], bartender: [["reading a room", "show"]],
  soldier: [["fighting", "fight"]], mercenary: [["fighting", "fight"]], "police officer": [["fighting", "fight"]], "gang member": [["fighting", "fight"]],
  athlete: [["fitness", "fight"]], "personal trainer": [["fitness", "fight"]],
  engineer: [["fixing machines", "tech"]], mechanic: [["fixing machines", "tech"]], programmer: [["computers", "tech"]], scientist: [["working things out", "tech"]], gamer: [["computers", "tech"]],
  escort: [["reading what a man wants", "sex"]], prostitute: [["reading what a client wants", "sex"]], dominatrix: [["reading what a client wants", "sex"]], "porn actress": [["performing sex", "sex"]],
  farmer: [["growing things and handling animals", "farm"]],
  lawyer: [["talking her way through anything", "people"]], journalist: [["getting people to talk", "people"]], translator: [["languages", "people"]],
  "office worker": [["organising people", "people"]], heiress: [["manners", "people"]], criminal: [["picking locks and lying", "people"]],
};
type Tag = "care" | "house" | "teach" | "show" | "fight" | "tech" | "sex" | "farm" | "people";
const EXTRA: [string, Tag][] = [["singing", "show"], ["sewing", "house"], ["languages", "people"], ["cards", "people"], ["cooking", "house"], ["massage", "care"], ["make-up", "show"]];

/** What each job or facility uses. */
const USES: Record<string, Tag> = {
  "house servant": "house", servants: "house", "be an idol": "show", club: "show", whore: "sex", brothel: "sex", "public servant": "sex", arcade: "sex",
  "work in an office": "people", "be your secretary": "people", "recruit girls": "people", "be your Head Girl": "people",
  classes: "teach", schoolroom: "teach", clinic: "care", spa: "care", nursery: "care", "guard you": "fight", barracks: "fight", pit: "fight", farmyard: "farm",
};

/** Roll what she hasn't got yet. */
export function seedCharacter(p: Person, r: Rng = rng(`character:${p.id}`), fresh = true): void {
  const per = p.persona;
  if (!per.behavior) {
    const career = (p.origin.career ?? "").toLowerCase();
    // The life she had leans her one way.
    const lean: Record<string, string> = { nun: "devout", heiress: "arrogant", lawyer: "liberated", journalist: "liberated", "social worker": "liberated", student: "liberated", model: "arrogant", dominatrix: "arrogant", "gang member": "bitchy", mercenary: "arrogant", influencer: "arrogant" };
    const roll = r();
    if (roll < 0.45) {
      const flaw = lean[career] && r.chance(0.5) ? lean[career] : r.pick(BEHAVIOR_FLAWS).id;
      per.behavior = { flaw, worn: 0 };
    } else if (roll < 0.72) per.behavior = { quirk: r.pick(BEHAVIOR_QUIRKS).id };
    else per.behavior = {};
  }
  if (!per.talents) {
    const career = (p.origin.career ?? "").toLowerCase();
    const mine = (TALENTS[career] ?? []).map(([t]) => t);
    const extra = r.chance(0.35) ? r.pick(EXTRA)[0] : undefined;
    per.talents = [...new Set([...mine, ...(extra ? [extra] : [])])];
  }
  // Only a woman being made now: one already in a save has traits someone wrote for her.
  if (!fresh) per.grain = true;
  if (!per.grain) {
    // One of her traits becomes something with some grain to it; the others stay.
    const t = r.pick(TRAITS);
    if (!per.core_traits.includes(t) && per.core_traits.length) per.core_traits = [...per.core_traits.slice(0, -1), t];
    per.grain = true;
  }
}

/** What her job uses of what she's good at: a little more money when it fits. */
export function talentFits(p: Person): string | undefined {
  const tag = USES[p.facility ?? ""] ?? USES[p.assignment];
  if (!tag) return undefined;
  const career = (p.origin.career ?? "").toLowerCase();
  const all = [...(TALENTS[career] ?? []), ...EXTRA];
  return (p.persona.talents ?? []).find((t) => all.some(([x, g]) => x === t && g === tag));
}

/** For her card. */
export function characterLines(p: Person): string[] {
  const out: string[] = [];
  const b = p.persona.behavior;
  const flaw = b?.flaw ? BEHAVIOR_FLAW_BY_ID[b.flaw] : undefined;
  const quirk = b?.quirk ? BEHAVIOR_QUIRK_BY_ID[b.quirk] : undefined;
  if (flaw) out.push(`HER FLAW, ${flaw.id}. ${flaw.note} When she's told what to do, ${flaw.friction}. Being fond of the owner doesn't fix it. Only being made to answer for it, again and again, wears it down.`);
  // One written in by hand (the editor, or a model) isn't in the table: it's shown as written.
  else if (b?.flaw) out.push(`HER FLAW: ${b.flaw}. It shows whenever it can, and being fond of the owner doesn't fix it.`);
  if (quirk) out.push(`HER WAY (${quirk.id}): ${quirk.note}`);
  else if (b?.quirk) out.push(`HER WAY: ${b.quirk}.`);
  if (p.persona.talents?.length) out.push(`WHAT SHE'S GOOD AT, BESIDES SEX: ${p.persona.talents.join(", ")}.`);
  return out;
}
