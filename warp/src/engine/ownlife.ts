/**
 * HER OWN LIFE.
 *
 * A woman in the house had a job, a body, a record of everything done to her and a voice, and
 * nothing of her own: no hobby, nothing she was working at, nothing she wanted past the next scene.
 * So every conversation was about whatever had happened to her lately (Océane counted the days
 * since a surgery that was over), because there was nothing else on her card to talk about.
 *
 * Now each woman has two things she does with her own time and one or two things she wants in the
 * long run. This is a porn game, so each of them has a sexual edge, and each grows out of who she
 * is: her personality traits first (the eager-to-please one practises her deepthroat on whatever's
 * the right shape in the kitchen; the one who keeps score keeps a tally of who's been called to the
 * owner's bed), then what she's into, then the job she had before. The model writes them when she's
 * fleshed out (engine/forge) and again when she's re-read (engine/growth); until then, and with no
 * model, they come from the tables here, so a woman in an old save has them too.
 */
import type { Person } from "./types";
import { rng, type Rng } from "./rng";
import { OTHERS_RE } from "./alone";

/** Version of these tables. A woman seeded by an older one is seeded again; the first were
 *  ordinary hobbies (seedlings, crosswords) with nothing sexual in them. */
export const OWN_V = 2;

type Life = { does: string[]; wants: string[] };

/** By her personality: matched against her traits, how she talks, her quirk and her flaw. */
const BY_TRAIT: [RegExp, Life][] = [
  [/neat|tidy|clean|order|fold|fix|fuss/, { does: ["keeps the toy drawer cleaned and sorted, and gets snippy when anyone puts a plug back in the wrong place"], wants: ["to run the house's bedrooms her way, deciding who sleeps where and who gets used when"] }],
  [/nervous|fidget|anxious|jumpy|flinch|scared|frightened|timid/, { does: ["reads the filthiest books she can find under the covers, and blushes at her own pages"], wants: ["to be told she's good in bed by someone who means it"] }],
  [/joke|funny|laugh|giggl|grin|mischie|playful|wit/, { does: ["makes up rude nicknames for every man who's had her and tells the other girls", "draws dirty cartoons of the house on scraps and passes them round the other girls"], wants: ["to make the owner laugh with his cock in her mouth"] }],
  [/suspicious|guarded|evasive|cold|distant|wary|closed|secret/, { does: ["keeps a notebook of who's sleeping with whom in the house, in a code only she can read"], wants: ["to be the one girl in the house nobody can touch without her say-so"] }],
  [/says yes and|stubborn|defian|mouthy|argu|proud|bratty|sharp|sulk/, { does: ["bets the other girls on who can make a man come fastest, and usually wins"], wants: ["to make the owner beg for it, just once"] }],
  [/shy|quiet|slow to open|reserved|repressed|shamefast/, { does: ["writes dirty stories in a notebook she'd die if anyone read"], wants: ["to have one person she can be completely filthy with and not be ashamed"] }],
  [/eager|please|devot|obedient|follow instructions|careful|dutiful/, { does: ["practises her deepthroat on whatever's the right shape in the kitchen, so she'll be better for the owner", "practises the positions from the house manual until she has them perfect"], wants: ["to be the owner's favourite and sleep at the foot of his bed every night"] }],
  [/grudge|score|jealous|compet|ambiti|rival/, { does: ["keeps a tally of who's been called to the owner's bed and how often, and checks it every night"], wants: ["to be called to the owner's bed more often than anyone else in the house"] }],
  [/touchy|cuddl|affection|warm|sweet|gentle|kind|caring/, { does: ["curls up with whichever girl is on the couch and lets her hands wander"], wants: ["to have someone to sleep tangled up with every night"] }],
  [/self-conscious|her body|vain|mirror|looks|pretty/, { does: ["tries on lingerie in front of the mirror when she thinks nobody's watching, and practises poses"], wants: ["to be the one men stop and stare at on the concourse"] }],
  [/friendly|sociable|chatty|gossip|outgoing|familiar/, { does: ["trades gossip about who's fucking who, and always knows first"], wants: ["to have her own regulars who ask for her by name"] }],
  [/lazy|sleepy|bath|comfort|idle/, { does: ["spends her free hour in the bath with the shower head"], wants: ["to be kept, fed, fucked and never made to work"] }],
  [/cook|bak|kitchen|food/, { does: ["bakes things shaped like cocks to make the other girls laugh"], wants: ["to cook for the owner in an apron and nothing else, every night"] }],
  [/strong|tough|fight|hard|athlet/, { does: ["wrestles the other girls for the good blanket, and it doesn't always stay wrestling"], wants: ["to pin the owner down, just once, and see what he does"] }],
  [/crude|perver|dirty|filthy/, { does: ["tells the filthiest jokes in the house at dinner"], wants: ["to try everything at least once, with the owner watching"] }],
  [/romantic|idealist|dream/, { does: ["writes the owner love letters she never gives him"], wants: ["to be the owner's, really his, not just owned"] }],
];

/** By what she's into, strongest first. */
const BY_FETISH: Record<string, Life> = {
  boobs: { does: ["oils and massages her tits every night and admires them in the mirror"], wants: ["bigger tits, and everyone staring at them"] },
  buttslut: { does: ["stretches herself with a plug in her free time and calls it training"], wants: ["to take the owner's cock in her ass every day"] },
  cumslut: { does: ["keeps count of how many loads she's swallowed this month, and tries to beat it"], wants: ["to be the house's favourite mouth"] },
  humiliation: { does: ["volunteers for the jobs where people can watch her"], wants: ["to be used in front of a crowd on the concourse"] },
  submissive: { does: ["practises kneeling still for an hour at a time"], wants: ["to be owned completely, with nothing left that's hers"] },
  dom: { does: ["orders the newer girls around and makes them call her ma'am"], wants: ["to have a slave of her own"] },
  masochist: { does: ["pinches and bites herself in the shower to see how far she can go"], wants: ["to be marked by the owner where it shows"] },
  sadist: { does: ["teases the other girls until they squirm, and enjoys every second"], wants: ["to be allowed to punish the other girls"] },
  pregnancy: { does: ["knits baby things she says are for someone else"], wants: ["to be bred by the owner, and keep the baby"] },
  tease: { does: ["flashes the guards on the stairs to watch them lose their place"], wants: ["to make the owner wait for her, and want it"] },
  romantic: { does: ["writes the owner love letters she never gives him"], wants: ["to be the owner's, really his, not just owned"] },
  perverted: { does: ["collects dirty pictures and trades them with the other girls"], wants: ["to try everything at least once, with the owner watching"] },
};

/** By the job she had before. */
const BY_CAREER: Record<string, Life> = {
  student: { does: ["takes notes on what works in bed like it's coursework"], wants: ["to be top of the class in everything the house's trainers teach"] },
  waitress: { does: ["serves the other girls' drinks in nothing but an apron to make them laugh"], wants: ["to run a bar where the waitresses are on the menu"] },
  nurse: { does: ["patches the other girls up after rough clients and checks them over a little too thoroughly"], wants: ["to run the clinic, gloves and all"] },
  teacher: { does: ["teaches the new girls how to give head, with a banana and a lot of notes"], wants: ["to train the house's girls her way"] },
  prostitute: { does: ["does the other girls' makeup for work and teaches them tricks with their mouths"], wants: ["to be paid what she's worth, and keep it"] },
  escort: { does: ["follows the society gossip to learn which rich men like what in bed"], wants: ["to be kept by someone rich and important"] },
  dancer: { does: ["practises her lap dance on the bedpost in her room", "makes up dances to whatever's playing, and they get dirtier every week"], wants: ["to dance for a real audience again, in nothing but heels"] },
  soldier: { does: ["trains in her room in her underwear, and wrestles anyone who'll take her on"], wants: ["to get the guard captain under her, one way or another"] },
  "police officer": { does: ["handcuffs the other girls to things for fun"], wants: ["to be the one holding the cuffs again"] },
  farmer: { does: ["grows a cucumber in a pot by her bed, and everyone knows what it's for"], wants: ["to have her own patch of land, and a big man to work it with"] },
  housewife: { does: ["cooks for the other girls in an apron and nothing else"], wants: ["to keep house for the owner like a wife, in bed too"] },
  "office worker": { does: ["keeps a schedule of who the owner sees at night, in neat columns"], wants: ["to be the owner's secretary, desk and all"] },
  musician: { does: ["writes dirty songs about the men in the house"], wants: ["to sing for a crowd that wants her"] },
  athlete: { does: ["trains in her room, then shows off what it's done to her ass"], wants: ["to win in the pit and take her pick of the crowd"] },
  criminal: { does: ["plays strip poker with the other girls, and cheats"], wants: ["to get rich, one way or another, and a lot of it on her back"] },
  servant: { does: ["knows everyone's business in the house, especially who's in whose bed"], wants: ["to run the household and decide who goes to the owner's bed"] },
  engineer: { does: ["builds the house's toys better than the shop does, and tests them herself"], wants: ["to build a machine in the arcology that makes the girls scream"] },
  model: { does: ["spends hours on her hair, skin and nails, practising looking fuckable"], wants: ["to be on posters men touch themselves to"] },
  gamer: { does: ["plays anything with a screen, and strip versions of everything else"], wants: ["to stream herself again, to a lot more watchers"] },
  nun: { does: ["prays at set hours and confesses things that make the guards blush"], wants: ["to keep her faith whatever is done to her, and stop enjoying it"] },
  lawyer: { does: ["argues the house rules with the other girls like a case, and wins"], wants: ["to talk her way into the owner's bed and out of her collar"] },
  doctor: { does: ["examines the other girls after rough nights, clinically, and takes notes"], wants: ["to run the clinic, and decide what's done to bodies there"] },
  stripper: { does: ["practises her routine on any pole she can find"], wants: ["to headline the club, with the owner watching"] },
  "porn actress": { does: ["rates the house's men on technique, out loud"], wants: ["to be filmed again, properly, and be famous for it"] },
  camgirl: { does: ["poses for any camera that points her way"], wants: ["an audience again, a big one"] },
  maid: { does: ["cleans the owner's rooms in a uniform that gets shorter every week"], wants: ["to be the maid who serves the owner in every way"] },
  cook: { does: ["feeds the other girls off her fingers"], wants: ["to cook for the owner every night and be dessert"] },
  librarian: { does: ["reads the filthiest books in the house and keeps them in order"], wants: ["to live out one of her books, all the way through"] },
  programmer: { does: ["hacks the house's toys to do things they weren't built for"], wants: ["to get into the arcology's cameras and see everything"] },
  mercenary: { does: ["spars with the guards and doesn't always let them win"], wants: ["to be the owner's bodyguard, at his side and in his bed"] },
  dominatrix: { does: ["trains the newer girls to kneel properly, whether they asked or not"], wants: ["to have the owner on his knees, just once"] },
  heiress: { does: ["has the other girls do her nails and calls them her staff"], wants: ["to be kept like a princess, in silk and diamonds"] },
  bartender: { does: ["mixes the girls drinks with dirty names"], wants: ["to run the club's bar and pick who goes home with whom"] },
  masseuse: { does: ["gives the other girls massages that don't stay on their shoulders"], wants: ["to have the owner under her hands every night"] },
  influencer: { does: ["practises her angles in every mirror"], wants: ["to be the most watched slave in the arcology"] },
  cheerleader: { does: ["does splits and high kicks wherever someone might look up her skirt"], wants: ["to be the owner's favourite toy"] },
  hairdresser: { does: ["does the other girls' hair and gossips about who's been in whose bed"], wants: ["to run the salon where the owner's girls are made pretty"] },
};

const DOES = [
  "dances for herself in the mirror in nothing but heels", "keeps a diary of every man who's had her, with grades",
  "reads trashy romance novels and dog-ears the dirty parts", "does yoga in tight shorts where the guards can see",
  "paints her toenails and shows them off to anyone who looks",
];

const WANTS = ["to be the owner's favourite", "to have her own regulars who ask for her by name", "to wear the owner's collar", "to be worth more than any slave on the market"];

const VALUE_WANTS: [RegExp, string][] = [
  [/free/, "to fuck her way to her freedom papers"],
  [/family/, "to earn enough on her back to buy her family out"],
  [/useful|good at/, "to be the girl the owner can't do without, in bed and out of it"],
  [/privacy/, "to have a room of her own where she decides who comes in"],
  [/owing/, "to have men paying her, and owe nobody anything"],
  [/body/, "to decide who gets to touch her"],
  [/word|lied/, "to be the one the owner tells the truth to, in bed"],
];

/** Fill in what she does with her time and what she wants, if nothing has written them yet under
 *  the current tables. */
export function seedOwnLife(p: Person, r: Rng = rng(`ownlife:${p.id}`)): void {
  const fresh = (p.persona.own_v ?? 1) < OWN_V;
  if (p.persona.interests?.length && p.persona.goals?.length && !fresh) return;
  const traits = [...p.persona.core_traits, p.persona.speech_pattern ?? "", p.persona.quirk?.id ?? "", p.persona.flaw?.id ?? ""].join(" ").toLowerCase();
  const byTrait = BY_TRAIT.filter(([re]) => re.test(traits)).map(([, l]) => l);
  const byFetish = p.persona.fetishes.filter((f) => f.strength >= 30 && BY_FETISH[f.name]).sort((a, b) => b.strength - a.strength).map((f) => BY_FETISH[f.name]);
  const career = BY_CAREER[p.origin.career?.toLowerCase() ?? ""];
  const take = (groups: Life[], k: "does" | "wants") => r.shuffle(groups.flatMap((l) => l[k]));

  if (!p.persona.interests?.length || fresh) {
    // Her nature first, then what she's into or what she did before.
    const first = take(byTrait, "does")[0];
    const second = take([...byFetish.slice(0, 1), ...(career ? [career] : [])], "does").find((x) => x !== first);
    const picked = [first, second].filter((x): x is string => !!x);
    for (const x of r.shuffle([...DOES])) if (picked.length < 2 && !picked.includes(x)) picked.push(x);
    p.persona.interests = picked;
  }
  if (!p.persona.goals?.length || fresh) {
    const fromValues = (p.persona.values ?? []).map((v) => VALUE_WANTS.find(([re]) => re.test(v))?.[1]).filter((x): x is string => !!x);
    const first = take([...byTrait.slice(0, 2), ...byFetish.slice(0, 1)], "wants")[0] ?? career?.wants[0] ?? fromValues[0] ?? r.pick(WANTS);
    const second = [...fromValues, ...(career?.wants ?? []), ...r.shuffle([...WANTS])].find((x) => x !== first);
    p.persona.goals = r.chance(0.5) && second ? [first, second] : [first];
  }
  p.persona.own_v = OWN_V;
}

/** Her own life on her card: not a script, things that can come up. `alone`: she's the only slave
 *  in the house, so what only makes sense with other girls around goes, and something of her own
 *  stands in for it (engine/alone). Her card in the save keeps it, for when she isn't alone. */
export function ownLifeLines(p: Person, alone = false): string[] {
  const out: string[] = [];
  let does = p.persona.interests ?? [];
  let wants = p.persona.goals ?? [];
  if (alone) {
    const r = rng(`ownlife-alone:${p.id}`);
    const keep = (xs: string[]) => xs.filter((x) => !OTHERS_RE.test(x));
    if (does.length) { does = keep(does); for (const x of r.shuffle(keep(DOES))) if (does.length < 2 && !does.includes(x)) does.push(x); }
    if (wants.length) { wants = keep(wants); if (!wants.length) wants = [r.pick(keep(WANTS).filter((x) => !/favourite/.test(x)))]; }
  }
  if (does.length) out.push(`HER OWN TIME. This is what she does when she isn't working or with you. She can be in the middle of it, mention it, or ask for time or things for it: ${does.join(", and ")}.`);
  if (wants.length) out.push(`WHAT SHE WANTS FOR HERSELF IN THE LONG RUN. It colours what she hopes for and asks for, though she rarely says it outright: ${wants.join(", and ")}.`);
  return out;
}

/** What the model is asked for, in the forge and the re-reading. */
export const OWN_LIFE_ASK = {
  interests: "2 or 3 things she does with her own time, each with a sexual edge and grown out of her personality traits first, then her fetishes, then the job she had. They're things she does rather than things she likes. For example, for an eager-to-please one 'practises her deepthroat on whatever's the right shape in the kitchen', for one who keeps score 'keeps a tally of who's been called to the owner's bed', for a dancer 'practises her lap dance on the bedpost'",
  goals: "1 or 2 things she wants for herself in the long run, with sex or desire in them, from her personality, e.g. 'to be called to the owner's bed more than anyone in the house', 'to fuck her way to her freedom papers', 'to have a slave of her own'",
};

/** Tidy what a model wrote: a few short plain lines. */
export function cleanList(xs: unknown, k: number, n = 140): string[] {
  return (Array.isArray(xs) ? xs : []).map((x) => String(x ?? "").replace(/\s+/g, " ").trim().slice(0, n)).filter(Boolean).slice(0, k);
}
