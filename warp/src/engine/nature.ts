/**
 * WHO SHE IS, NOT WHAT SHE DOES IN BED.
 *
 * A fetish, a paraphilia or a sexual quirk on her card used to read as a bed act: "in bed, she
 * takes the top". A model kept it there, and between scenes of sex the woman was a blank. That's
 * not how it works in a person. A dom bosses the kitchen, a sadist pinches, a findom keeps count,
 * a masochist picks at the bruise. How much of it shows is how strong it is.
 *
 * How much of it lands on the owner is a second question, and the answer is the game's, not the
 * model's. It's her strength against how relaxed she is, how much she trusts him, how afraid she
 * is, and how much room he's given her:
 *   · HELD. She's afraid of him, or wound tight. Around him she buries it. It comes out elsewhere.
 *   · KEPT. She knows her place. With him it shows only in small ways: a look, what she wants.
 *   · SLIPS. Strong, and she's comfortable enough or has the room. Now and then it slips out on him
 *     before she thinks, and the moment she catches herself she backs off, knowing she's overstepped,
 *     unless he's allowed it, in which case she doesn't need to.
 *   · TAKES. Very strong, she's very relaxed, she trusts him and isn't afraid, or he's handed her the
 *     power. She does it to him without asking. It's who she is with him.
 */
import type { Person, SaveState } from "./types";
import { FETISH_BY_ID, FLAW_BY_ID, QUIRK_BY_ID } from "../data/intimacy";
import { read } from "./obedience";
import { romanceOf } from "./romance";
import { latitudeOf } from "./voice";

interface Nature {
  /** Who she is because of it, outside sex. A sentence or two, in plain words. */
  is: string;
  /** What it looks like aimed at the owner, as "like …" would finish: only for the kinds that can
   *  be aimed at someone. */
  aim?: string;
}

const NATURE: Record<string, Nature> = {
  // fetishes
  boobs: { is: "She's always aware of her breasts. She touches them without thinking, dresses to show them, and lights up when anyone looks." },
  buttslut: { is: "She's shameless about her ass. She sits on laps, bends over when she doesn't need to, and makes jokes about it.", aim: "backing her ass into you, or bending over in front of you when there's no reason to" },
  cumslut: { is: "Cum is never far from her mind. She talks about it, licks her lips at it, and makes crude jokes at meals.", aim: "dropping to her knees or reaching for your belt without being asked" },
  humiliation: { is: "She courts embarrassment. She says things she shouldn't in front of people, wears too little, and goes pink and pleased when it lands.", aim: "putting herself on show and in your way to be shamed" },
  submissive: { is: "She's soft and deferent all day, not just in bed. She waits for instructions, asks permission for small things, and melts at a firm word.", aim: "kneeling at your feet unasked and asking you what to do" },
  dom: { is: "She's bossy by nature. She takes charge of rooms, tells people what to do, corrects how they do it, and doesn't like being told.", aim: "telling you what to do, steering you by the wrist, and taking the decision out of your hands" },
  masochist: { is: "She's drawn to pain in ordinary life. She presses her bruises, picks the hard way, takes knocks without complaint and seems calmer after.", aim: "provoking you on purpose so you'll be rough with her" },
  sadist: { is: "She likes other people's discomfort. She pinches, teases until it stings, laughs when someone stubs a toe, and watches pain closely.", aim: "pinching, slapping or digging her nails into you, and watching your face" },
  pregnancy: { is: "She's broody. She talks about babies, touches her belly, and watches pregnant women in the street." },
  armpits: { is: "She's unselfconscious about her body and its hair. She lifts her arms when she doesn't need to and likes being near people's faces.", aim: "lifting an arm and pulling your face into it" },
  musk: { is: "She's proud of her smell. She skips the shower, comes in sweaty on purpose, and notices how people react.", aim: "pressing your face to her neck or armpit after a shift" },
  facesitting: { is: "She likes being above people. She perches on armrests and tables, stands over people who sit, and takes the high seat.", aim: "sitting on your face or your chest the moment you lie down" },
  assworship: { is: "She's vain about her ass. She checks it in reflections, wears what shows it, and wants it noticed.", aim: "presenting her ass to you and telling you where to put your mouth" },
  goddess: { is: "She expects to be treated as special. She waits to be served, likes to be praised, and doesn't do small chores.", aim: "expecting you to kneel, praise her and serve her, as if it's her due" },
  pegging: { is: "She has a forward, take-charge streak. She jokes about turning the tables and likes being the one doing it.", aim: "pushing you face down and reaching for the strap-on" },
  keyholder: { is: "She's possessive about other people's pleasure. She decides when they get to come, makes them wait and ask, and ruins it when she feels like it. Whoever is hers she wants locked in a cage with the key on her neck, and until he is, she brings it up, shops for one and asks for it.", aim: "deciding when you get to come, making you ask and telling you no, stopping you right at the edge, treating an orgasm you had without her say-so as hers you wasted, and checking your cage, or, if you aren't locked yet, telling you you will be" },
  spit: { is: "She's crude and physical. She spits, wipes her mouth on her hand, and likes a reaction.", aim: "spitting in your mouth or on your face" },
  ballbusting: { is: "She's rough in play. She shoves, knees, flicks, and laughs when it lands where it hurts.", aim: "kneeing or squeezing your balls and watching you double over" },
  findom: { is: "Money is personal to her. She asks for things, names prices, keeps a count of every coin spent on her, and makes sure you see what your money bought.", aim: "naming a number and expecting you to pay it, there and then" },
  sph: { is: "She's cutting about size. She compares, measures and laughs at what's small, whether it's a car, a man or a promise.", aim: "laughing at your cock and saying exactly how little it does for her" },
  cuckoldress: { is: "She's a flirt with other people in front of you, and she enjoys you watching it.", aim: "flirting with other men in front of you and telling you about it after" },
  petplay: { is: "She's playful and clingy, like a pet. She curls up at feet, nuzzles, wants petting and praise, and sulks without it.", aim: "curling up at your feet and nudging your hand to be petted" },
  breathplay: { is: "She's drawn to the edge. She holds her breath underwater too long and likes hands near throats, hers or anyone's.", aim: "putting your hand on her throat, or hers on yours" },
  voyeur: { is: "She watches. Doorways, windows, other people's business. She knows what everyone's doing and with whom.", aim: "watching you when you don't know she's there" },
  tickling: { is: "She's giggly and squirmy, and she can't keep her hands off people's ribs or feet.", aim: "tickling you, or squirming close so you'll tickle her" },
  furniture: { is: "She treats people like fixtures. She puts her feet up on whoever's nearest, hands them her glass, and forgets they're there.", aim: "putting her feet up on you, using you as a footstool or a table, and forgetting you're there" },
  // paraphilias: the need, all day
  abusive: { is: "She's domineering and rough with everyone. She shoves, grabs, orders, and has to be in control of whoever's near her.", aim: "shoving you down and using you rough for her own pleasure" },
  malicious: { is: "She's cruel. She hurts people and enjoys it, looks for the soft spot in everyone, and pushes on it.", aim: "hurting you for real and watching it" },
  "self hating": { is: "She thinks she's worth nothing. She apologises for existing, takes the worst of everything, and asks to be punished.", aim: "begging you to hurt or degrade her" },
  "attention whore": { is: "She needs to be looked at. She's loud, dresses to be seen, and goes flat when nobody's watching.", aim: "putting herself on show in front of you and anyone else" },
  "cum addict": { is: "She thinks about cum all day and gets shaky and short-tempered without it.", aim: "reaching for your belt without asking" },
  "anal addict": { is: "She's restless and distracted when she hasn't had it, and crude about it with anyone.", aim: "pushing herself onto you and asking for it in her ass" },
  "breast growth": { is: "Her breasts are her obsession. She measures them, talks about them, and asks for bigger." },
  breeder: { is: "She's fixated on being pregnant. She talks about it, counts days, and resents anything that stops it." },
  neglectful: { is: "She's given up on wanting things for herself. She does what pleases others and has no answer when asked what she wants." },
  "scent obsessed": { is: "She won't wash. She's proud of her smell, makes people notice it, and is hurt when they don't want it.", aim: "pushing your face into her armpit or between her legs after a day's work" },
  "goddess complex": { is: "She expects worship from everyone. Service, praise and kneeling are her due, and she's icy when she doesn't get them.", aim: "expecting you on your knees, praising and serving her" },
  throne: { is: "She has to be above people. She takes the high seat, perches on people and stands over them.", aim: "sitting on your face whenever you're lying down" },
  "keyholder for life": { is: "She needs someone locked. If she has him, the key never leaves her neck, she knows to the day how long it's been, and she takes other lovers as a matter of course, because the one who's locked doesn't get to. If she hasn't, getting him into a cage is what she's working on.", aim: "keeping you locked, teasing and hurting you through the cage and making you watch or clean up after the men she has instead, or, if you aren't locked yet, getting you there, and never letting you come on your own" },
  humiliatrix: { is: "She has to cut people down. She laughs at them, belittles them and makes them small.", aim: "laughing at you, spitting on you and telling you what you are" },
  cuckqueen: { is: "She has to make her partner jealous. She flirts in front of him and tells him about it.", aim: "making you watch her with someone else, and telling you you aren't enough" },
  "pet for life": { is: "She's more pet than person. She curls up at feet, nuzzles for attention and has trouble being a woman with opinions.", aim: "curling up at your feet and begging to be petted" },
  "breath addict": { is: "She chases the edge of air. Hands near throats, pressure, holding her breath.", aim: "putting your hand on her throat, or hers on yours" },
  "tribute junkie": { is: "She needs to be paid. Gifts, money and tribute handed over because she said so are what she lives for, and she asks for them all the time.", aim: "demanding money or a gift from you and expecting it handed over" },
  // sexual quirks, as a manner
  "gagfuck queen": { is: "She's tough and proud of it, and she likes rough play." },
  "painal queen": { is: "She's tough and likes things rough." },
  "strugglefuck queen": { is: "She's a fighter. She wrestles, squirms out of grips and likes being caught.", aim: "picking a play-fight with you so you'll pin her" },
  tease: { is: "She's a tease all day. She flirts, withholds, makes people wait and enjoys it.", aim: "teasing you, getting close and pulling away" },
  romantic: { is: "She's a romantic. She wants affection, small gestures and being chosen, and she notices when they're missing." },
  perverted: { is: "She's curious and shameless. She talks about sex like the weather and suggests things nobody asked for." },
  caring: { is: "She looks after people. She notices who's tired or hurt and fusses over them." },
  unflinching: { is: "Nothing shocks her. She takes things in stride." },
  "size queen": { is: "She notices size in everything, and comments on it." },
  "throne queen": { is: "She likes being above people, on the high seat or the edge of the table.", aim: "settling herself on your face whenever you lie back" },
  "scent proud": { is: "She's proud of how she smells after work and doesn't hide it." },
  "edge queen": { is: "She likes making people wait. She stretches things out, stops just short, and enjoys the asking.", aim: "keeping you on edge and stopping a second before" },
  "mean girl": { is: "She's mean when she's in a good mood. She laughs at people, says the wrong thing on purpose and enjoys the wince.", aim: "laughing at you and saying exactly the wrong thing on purpose" },
  "good pet": { is: "She's affectionate and clingy, and she likes being praised like an animal.", aim: "curling up at your feet for praise" },
  watcher: { is: "She'd rather watch than join in, in everything. She hangs back and takes it in." },
  // sexual flaws, as a touchiness
  "hates oral": { is: "She's squeamish about mouths and gags at the thought." },
  "hates anal": { is: "She's touchy about her ass and goes stiff if anyone mentions it." },
  "hates penetration": { is: "She's guarded about her body and doesn't like being crowded." },
  repressed: { is: "She's prim and thinks most sex is dirty. She looks away, changes the subject and disapproves." },
  idealistic: { is: "She's idealistic and thinks things should mean something, sex included." },
  shamefast: { is: "She covers up and hates being looked at. She dresses modestly and blushes easily." },
  apathetic: { is: "She's flat. Not much gets a rise out of her." },
  crude: { is: "She's crude, says disgusting things at the wrong moment and laughs at them." },
  judgemental: { is: "She's judgemental about other people's tastes and says so." },
  fastidious: { is: "She's fastidious. Sweat, spit and smell disgust her, and she cleans up after everyone." },
  bratty: { is: "She's a brat. Told to do anything, she argues and stalls and makes you work for it.", aim: "arguing, stalling and making you work for every little thing" },
  prissy: { is: "She's prissy and delicate, and doesn't like getting her hands dirty." },
};

export type Reach = "held" | "kept" | "slips" | "takes";

/** The kinks and needs that put her on top of someone. */
export const DOMINANT = new Set(["dom", "sadist", "abusive", "malicious", "facesitting", "pegging", "keyholder", "ballbusting", "sph", "cuckoldress", "goddess", "furniture", "spit", "findom",
  "throne", "humiliatrix", "keyholder for life", "cuckqueen", "goddess complex", "tribute junkie"]);

/** How strong her dominant streak is: the strongest dominant fetish, or a paraphilia, which is a need. */
export const dominantStrength = (p: Person): number => Math.max(DOMINANT.has(p.persona.paraphilia ?? "") ? 100 : 0, ...p.persona.fetishes.filter((f) => DOMINANT.has(f.name)).map((f) => f.strength));

/** How far her dominant streak reaches the owner, or null if she hasn't got one worth the name. */
export function bossyReach(s: SaveState, p: Person): Reach | null {
  const strength = dominantStrength(p);
  return strength >= 30 ? reachOf(s, p, strength) : null;
}

/** How far it reaches the owner, by the game's rules, not the model's. */
export function reachOf(s: SaveState, p: Person, strength: number): Reach {
  if (p.psyche.state === "broken") return "held";
  const r = read(p, s.memory[p.id]);
  const fear = p.bond.fear ?? 0;
  const relax = p.psyche.relaxation ?? 0;
  const power = (romanceOf(p).dominion ?? -100) >= 40;
  const lat = latitudeOf(p);
  const room = power ? 1 : lat === "free" ? 1 : lat === "latitude" ? 0.5 : p.rules_exempt ? 0.5 : 0;
  if (power && strength >= 50) return "takes";
  if (strength >= 90 && relax >= 4 && r.trust >= 50 && fear <= 20) return "takes";
  if (fear >= 60 || relax <= -4) return "held";
  if (strength >= 60 && fear <= 40 && (room >= 0.5 || (relax >= 2 && r.trust >= 20))) return "slips";
  return "kept";
}

function reachLine(reach: Reach, aim: string, allowed: boolean): string {
  switch (reach) {
    case "takes": return `With you, she does it without asking, like ${aim}. It's who she is with you now, and she doesn't wait for permission. How she's told to speak to you doesn't stop it: she can use your title and still do it. She stops if you really stop her.`;
    case "slips": return allowed
      ? `With you it comes out when she feels like it, like ${aim}, and since you've given her the room, she doesn't back off.`
      : `Now and then it slips out on you before she thinks, like ${aim}. The moment she catches herself she backs off at once, scared, knowing she's overstepped, and apologises.`;
    case "held": return "Around you she buries it, because she's too afraid or too wound up to let it show, and it comes out on other people or when she's alone. But if you order it, or it's one of her standing orders, she does exactly that, at once and properly, because she's afraid not to.";
    default: return "With you she knows her place, so on her own it only shows in small ways, like a look, what she asks for, or what she reaches for when she's allowed. When you order it, she does it.";
  }
}

/** For her card: each of her kinks and quirks as who she is, how strong, and how far it reaches you. */
export function natureLines(s: SaveState, p: Person): string[] {
  const out: string[] = [];
  const lat = latitudeOf(p);
  const allowed = lat !== "slave" || (romanceOf(p).dominion ?? -100) >= 40;
  const add = (id: string, label: string, strength: number, known: boolean) => {
    const n = NATURE[id];
    if (!n || strength < 30) return;
    const how = strength >= 85 ? "It's who she is, all day, not just in bed" : strength >= 60 ? "It shows all day, not just in bed" : "It colours her day, not just her bed";
    const reach = n.aim ? ` ${reachLine(reachOf(s, p, strength), n.aim, allowed)}` : "";
    out.push(`${label}. ${how}. ${n.is}${reach}${known ? "" : " The owner doesn't know this about her yet, so show it and never name it."}`);
  };
  const bossy = bossyReach(s, p);
  const onTop = bossy === "takes" || bossy === "slips";
  for (const f of p.persona.fetishes) if (f.name !== "none" && FETISH_BY_ID[f.name]) add(f.name, `HER NATURE (${FETISH_BY_ID[f.name].name})`, f.strength, !!f.known);
  if (p.persona.paraphilia) add(p.persona.paraphilia, `HER NATURE (${p.persona.paraphilia}, a need)`, 100, true);
  const q = p.persona.quirk;
  if (q && QUIRK_BY_ID[q.id]) add(q.id, `HER NATURE (${q.id})`, 65, !!q.known);
  if (q?.id === "romantic" && onTop && out.at(-1)?.startsWith("HER NATURE (romantic)")) out[out.length - 1] += " With a nature like hers it comes out as possession. Being chosen means he's hers, and jealousy makes her claim him harder and rougher. It doesn't make her soft, tearful or kneeling.";
  const fl = p.persona.flaw;
  if (fl && FLAW_BY_ID[fl.id]) add(fl.id, `HER NATURE (${fl.id})`, Math.max(30, 65 - (fl.worn ?? 0) / 2), !!fl.known);
  if (onTop && out.length) out.push("IF HE ASKS FOR IT. If he asks her to force him, use him, hurt him or rape him, or dares her to, he's offering her what her nature wants. She takes it, there and then, her way. She doesn't make him ask properly, doesn't turn it into a talk about how he asked or what it means, and doesn't refuse to make a point. If she's angry or jealous, it shows in how rough she is.");
  return out.length ? ["HER NATURE, below, is for you to show in what she does, wants and reaches for. She never names it, explains it or talks about it as a trait of hers.", ...out] : out;
}
