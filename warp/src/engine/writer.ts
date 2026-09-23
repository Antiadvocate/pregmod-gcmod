/**
 * THE WRITER — what happened, written as a scene, with no model required.
 *
 * `resolveAct` decides what an act did to her. This file writes it: a lead-in shaped by how she is
 * holding herself, the act itself on her actual body, how it landed, whether she came, what she
 * said, and anything you found out. Every piece is drawn from pools with a seeded stream, so the
 * same save replays the same words and two different nights read differently.
 *
 * A configured narrator model still writes over the top of this. This is the floor, and the floor
 * has to be a scene.
 */
import { dickWord, ballsWord, feetOf, footSizeWord } from "./genitals";
import type { Person, SaveState } from "./types";
import type { ActOutcome } from "./intimacy";
import { ACT_BY_ID, FETISH_BY_ID } from "../data/intimacy";
import { rng, type Rng } from "./rng";
import { registerOf, say, fill, type Register } from "./voice";
import { buildOf } from "./build";
import { hasCock } from "./you";

/* ── her body, in words ─────────────────────────────────────────────────────────────────────── */

export function bodyWords(p: Person): Record<string, string> {
  const b = p.body;
  const tits = b.boobs < 200 ? "her flat chest" : b.boobs < 400 ? "her small breasts" : b.boobs < 750 ? "her breasts"
    : b.boobs < 1300 ? "her heavy tits" : b.boobs < 2600 ? "her huge tits" : "her enormous tits";
  const ass = b.butt <= 1 ? "her narrow ass" : b.butt <= 3 ? "her ass" : b.butt <= 5 ? "her round ass" : "her huge ass";
  const hairLen = b.hair_length < 8 ? "cropped" : b.hair_length < 25 ? "short" : b.hair_length < 55 ? "" : "long";
  const hair = `${hairLen ? hairLen + " " : ""}${b.hair_color} hair`;
  const cock = b.dick === null || b.dick === 0 ? "" : `her ${dickWord(b.dick)} cock`;
  const balls = b.balls ? `her ${ballsWord(b.balls)} balls` : "";
  const f = feetOf(p);
  const feet = `her ${footSizeWord(f.size)} feet`;
  const soles = f.soles === "soft" ? "her soft soles" : f.soles === "calloused" ? "her rough soles" : "her soles";
  const build = b.height_cm < 155 ? "small" : b.height_cm > 178 ? "tall" : ["fat", "obese"].includes(buildOf(b.weight)) ? "fat" : buildOf(b.weight) === "chubby" ? "soft" : b.muscle > 30 ? "hard-bodied" : "slim";
  const belly = p.womb.weeks > 20 ? "her swollen belly" : b.belly > 4000 ? "her round belly" : "her stomach";
  const she = p.pronouns === "he/him" ? "he" : p.pronouns === "they/them" ? "they" : "she";
  const her = p.pronouns === "he/him" ? "his" : p.pronouns === "they/them" ? "their" : "her";
  const herObj = p.pronouns === "he/him" ? "him" : p.pronouns === "they/them" ? "them" : "her";
  return {
    name: p.name, tits, ass, hair, cock, balls, feet, soles, build, belly, skin: `${b.skin} skin`,
    eyes: `${b.eye_color} eyes`, she, She: cap(she), her, Her: cap(her), herObj,
  };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ── the lead-in, by how she is holding herself ─────────────────────────────────────────────── */

const LEAD: Record<Register, string[]> = {
  hollow: [
    "{name} is where you left her. She looks up when you come in and waits to be told.",
    "{name} gets up before you've said anything and stands with her hands at her sides.",
    "{name} is already kneeling by the bed, waiting for orders.",
  ],
  timid: [
    "{name} is on her feet the second the door opens, hands knotted in front of her.",
    "{name} flinches when you come in and watches you nervously as you cross the room.",
    "{name} has pulled her knees up on the edge of the bed. She puts her feet down when she sees you.",
  ],
  sullen: [
    "{name} doesn't get up. She glances at you and goes back to ignoring you.",
    "{name} is sitting cross-legged on the floor and makes you wait before she stands.",
    "{name} sighs loud enough that you hear it from the door.",
  ],
  proper: [
    "{name} stands when you come in and smooths her {hair} back from her face.",
    "{name} puts down what she was reading and turns to face you.",
    "{name} is waiting by the window, posture straight, and nods when you come in.",
  ],
  warm: [
    "{name} smiles when she sees it's you and pats the bed beside her.",
    "{name} is halfway through telling you about her day before you've shut the door.",
    "{name} reaches for your hand before you've even sat down.",
  ],
  eager: [
    "{name} is on you before the door has closed, mouth on your neck.",
    "{name} has been waiting for you, flushed and horny, already half out of her clothes.",
    "{name} crosses the room fast and presses {tits} against you.",
  ],
  bratty: [
    "{name} is sprawled across your side of the bed and doesn't move.",
    "{name} raises an eyebrow at you and doesn't get up.",
    "{name} looks you up and down, slowly, like she's deciding whether you'll do.",
  ],
  crude: [
    "{name} is eating something off a plate with her fingers. She licks them clean and looks you over.",
    "{name} whistles when you come in.",
    "{name} kicks the door shut behind you with one bare foot.",
  ],
  commanding: [
    "{name} is sitting in your chair, and she doesn't get up.",
    "{name} points at the floor in front of her.",
    "{name} is going through the papers on your desk, and doesn't stop when you come in.",
  ],
};

/** How she is when you walk in, in one line. */
export function writeLead(_s: SaveState, p: Person, r: Rng): string {
  return fill(r.pick(LEAD[registerOf(p)]), bodyWords(p));
}

/* ── the act itself ─────────────────────────────────────────────────────────────────────────── */

interface ActText {
  /** The act on the page. Several variants; one is picked. */
  core: string[];
  /** How you finish, when you do. Omitted where the core already says. */
  yours?: string[];
  /** The same act when you have no cock: your mouth and cunt, or the strap-on from the drawer. */
  nocock?: { core: string[]; yours?: string[] };
}

const ACT_TEXT: Record<string, ActText> = {
  oral: {
    core: [
      "You put a hand on her shoulder and she goes down. Her mouth is warm and she takes you slowly at first, eyes on your face.",
      "She kneels between your knees and takes you in her mouth, one hand steadying herself on your thigh.",
    ],
    yours: ["You finish in her mouth.", "You pull out at the last moment and finish across her lips and chin."],
    nocock: {
      core: [
        "You sit on the edge of the bed and she kneels between your thighs and puts her mouth on you. She starts slow, eyes on your face.",
        "You push her down onto her back and straddle her face. Her tongue finds you and she keeps at it.",
      ],
      yours: ["You come against her mouth, thighs tight around her head.", "You come with your fingers in her {hair}, holding her where she is."],
    },
  },
  throat: {
    core: [
      "You take a handful of her {hair} and push. She gags the first time, then opens her throat and lets you use it, spit running down her chin.",
      "You hold her head still and fuck her throat. Her hands come up to your hips and stay there, not pushing, just holding on.",
    ],
    yours: ["You hold her there while you come, and let go. She drags in air.", "You finish deep in her throat and she swallows around you because there's nowhere else for it to go."],
    nocock: {
      core: [
        "You buckle the strap-on on and take a handful of her {hair}. She gags on it the first time, then opens her throat and takes it, spit running down her chin.",
        "You hold her head still and fuck her throat with the strap-on. Her hands come up to your hips and stay there.",
      ],
      yours: ["You hold her there until she taps your thigh, and let go. She drags in air."],
    },
  },
  vaginal: {
    core: [
      "You put her on her back and push into her. Her cunt is tight around you and her heels hook behind your thighs.",
      "You bend her over the edge of the bed and fuck her from behind, one hand on the small of her back.",
      "She climbs on and sinks down onto you, hands flat on your chest, and you take her hips and set the pace.",
    ],
    yours: ["You come inside her.", "You pull out and finish on {her} stomach."],
    nocock: {
      core: [
        "You buckle the strap-on on, put her on her back and push into her. Her heels hook behind your thighs.",
        "You bend her over the edge of the bed and fuck her from behind with the strap-on, one hand on the small of her back.",
        "You lie back with her between your legs and grind against her until you're both wet, her thigh between yours.",
      ],
      yours: ["The base of the strap grinds against you with every stroke and you come like that, buried in her.", "You come grinding against her, and keep going after."],
    },
  },
  anal: {
    core: [
      "You work lube into her and push into her ass slowly. She grunts, then takes the rest of it.",
      "You put her on her knees, face in the pillow, and fuck her ass with long, steady strokes.",
    ],
    yours: ["You finish deep in her ass.", "You come inside her and hold still until you soften."],
    nocock: {
      core: [
        "You buckle the strap-on on, work lube into her and push into her ass slowly. She grunts, then takes the rest of it.",
        "You put her on her knees, face in the pillow, and fuck her ass with the strap-on in long, steady strokes.",
      ],
      yours: ["The strap grinds against you with every stroke and you come like that, deep in her ass."],
    },
  },
  painal: {
    core: [
      "You don't bother warming her up. You push into her ass dry and she screams.",
      "You pin her face-down and force your way into her ass. She claws at the sheet.",
    ],
    yours: ["You finish inside her and pull out. She lies there sobbing."],
    nocock: {
      core: [
        "You don't bother warming her up. You push the strap-on into her ass dry and she screams.",
        "You pin her face-down and force the strap-on into her ass. She claws at the sheet.",
      ],
      yours: ["You pull out when you're done with her. She lies there sobbing."],
    },
  },
  mammary: {
    core: [
      "She pushes {tits} together around you and works you between them, looking up at you over the top.",
      "You straddle her ribs and fuck the valley between {tits} while she holds them tight for you.",
    ],
    yours: ["You finish across her chest and throat."],
  },
  facial: {
    core: [
      "You finish on her face and tell her to leave it. She kneels there with it drying on her cheek and her {hair}.",
      "You come across her face. She closes her eyes just in time and keeps them closed.",
    ],
  },
  swallow: {
    core: [
      "You finish in her mouth and tell her to swallow. She does, and opens her mouth to show you.",
      "She takes all of it and swallows without being told twice.",
    ],
  },
  penetrative: {
    core: [
      "You lie back and let her take you. {Her} cock is hard and she pushes into you slowly, asks if you're ready, then fucks you properly.",
      "She fucks you on your back with your knees over her shoulders, and she's better at it than you expected.",
    ],
    yours: ["You come with her still inside you."],
  },
  group: {
    core: [
      "You bring in a second girl and put them both to work. They have to take turns on you, and keep bumping heads.",
      "You take two of them at once, one riding you while the other's mouth is busy lower down. {name} keeps glancing at the other one.",
    ],
    yours: ["You finish in {name}, and the other girl cleans you off."],
    nocock: {
      core: [
        "You bring in a second girl and put them both to work. One mouth on you, one on your tits, and they keep bumping heads.",
        "You take two of them at once: {name} between your legs, the other one kissing up your neck. {name} keeps glancing at the other one.",
      ],
      yours: ["You come on {name}'s tongue while the other girl holds your thighs apart."],
    },
  },
  servicing: {
    core: [
      "You sit back and have her go down on one of the other girls. You watch her work, and so does the girl she's working on.",
      "You put her on her knees in front of another of yours and tell her to make it good. You stay to watch.",
    ],
  },
  milking: {
    core: [
      "You fit the cups over her nipples and switch the pump on. Milk starts in thin jets and she watches the bottles fill.",
      "You milk her by hand, slow pulls, and her milk runs over your knuckles into the bowl.",
    ],
  },
  breeding: {
    core: [
      "You fuck her slow and deep and finish as far inside her as you can get, and stay there after.",
      "You put a pillow under her hips first. She knows what that means. You fuck her and come inside her and keep her like that for a while.",
    ],
  },
  teasing: {
    core: [
      "You work her with your fingers until her hips are chasing your hand, then stop. You wait. You start again. You stop again.",
      "You bring her right to the edge three times and leave her there each time, trembling.",
    ],
  },
  getoff: {
    core: [
      "You put your hand between her legs and don't stop until she's done. That's all this is for.",
      "You take your time with her, fingers and mouth, and ask nothing back.",
    ],
  },
  toys: {
    core: [
      "You open the drawer and let her see what's in it. You start small and work up.",
      "You strap a vibrator between her thighs, turn it up, and sit back to watch.",
    ],
  },
  rimming: {
    core: [
      "You tell her to use her tongue, and where. She hesitates for a second, then does.",
      "She spreads you with both hands and licks, slow and thorough, because you told her to.",
    ],
  },
  "public use": {
    core: [
      "You bend her over a rail on the concourse and fuck her in front of the evening crowd. Somebody films it. Somebody claps.",
      "You take her against a pillar outside the shops. People slow down to watch; a few stop.",
    ],
    yours: ["You finish inside her and leave her there, legs shaking, for whoever's still looking."],
    nocock: {
      core: [
        "You bend her over a rail on the concourse and fuck her with the strap-on in front of the evening crowd. Somebody films it. Somebody claps.",
        "You sit on a bench outside the shops and make her kneel and eat you out where people walk past. A few stop.",
      ],
      yours: ["You finish and leave her there, face wet, for whoever's still looking."],
    },
  },
  exposure: {
    core: [
      "You walk her through the arcade level naked, a hand on the back of her neck. Heads turn in waves.",
      "You make her stand on a bench in the atrium with her hands behind her head while you finish your coffee.",
    ],
  },
  degradation: {
    core: [
      "You tell her what she is, loudly, with people in earshot, and make her repeat it back.",
      "You make her crawl to you across the lounge floor while your guests watch, and thank you when she gets there.",
    ],
  },
  restraint: {
    core: [
      "You tie her wrists to the headboard and her ankles apart. She tests the knots once and then lies still.",
      "You cuff her hands behind her and push her down on the bed. She can't do anything now but take what comes next.",
    ],
    yours: ["You fuck her tied up and leave her tied a while longer after you finish."],
    nocock: {
      core: [
        "You tie her wrists to the headboard and her ankles apart. She tests the knots once and then lies still.",
        "You cuff her hands behind her and push her down on the bed. She can't do anything now but take what comes next.",
      ],
      yours: ["You fuck her tied up with the strap-on and leave her tied a while longer after you finish.", "You sit on her face while she's tied and she can't do anything but work."],
    },
  },
  discipline: {
    core: [
      "You put her over your knee and punish her. Twenty strokes, and you make her count them out.",
      "You use the crop across the backs of her thighs until they're striped red, and tell her exactly what it's for.",
    ],
  },
  orders: {
    core: [
      "You tell her to strip, slowly, and then to crawl, and then to beg. She does each thing as you say it.",
      "You make her kneel in the corner with her hands on her head for an hour and tell her not to move. She doesn't.",
    ],
  },
  "suck her": {
    core: [
      "You kneel between her thighs and take {cock} in your mouth. She moans, surprised that her owner is doing this for her.",
      "You go down on her properly, your hand on {cock}'s base, until her fingers are knotted in your hair.",
    ],
  },
  "stroke her": {
    core: [
      "You take {cock} in your hand and jerk her off slowly.",
      "You wrap your fist around her and stroke her off while she lies back with an arm over her eyes.",
    ],
  },
  "ride her": {
    core: [
      "You push her onto her back and climb on top, and sink down onto {cock} at your own pace.",
      "You ride her, slow, then not slow. Her hands find your hips and grip.",
    ],
    yours: ["You come on her, then she comes in you."],
  },
  "drain her": {
    core: [
      "You keep going after she comes the first time. And the second. She's begging you to stop long before you do.",
      "You milk her dry, stroke after stroke, until nothing comes and she's shaking.",
    ],
  },
  "eat her": {
    core: [
      "You push her thighs apart and put your mouth on her cunt. She starts to say something and ends up moaning instead.",
      "You eat her slowly, tongue and lips, one arm across her hips to hold her down.",
    ],
  },
  "worship her": {
    core: [
      "You spend an hour on her: hands, mouth, every inch, and you don't ask for anything back.",
      "You kiss your way down her body and back up and down again, taking your time over every part of her.",
    ],
  },
  footjob: {
    core: [
      "She oils her feet and works you between her soles, slow and steady, watching your face.",
      "You sit her on the edge of the desk and she strokes you with her feet, toes curled around you.",
    ],
    yours: ["You finish across her feet and ankles."],
  },
  "worship feet": {
    core: [
      "You take her foot in both hands and kiss the arch, then suck her toes one at a time.",
      "You kneel and rub her feet, then put your mouth to them. She props herself on her elbows to see.",
    ],
  },
  "make her worship": {
    core: [
      "You put your foot in her lap and tell her to be grateful for it. She kisses it.",
      "You make her kneel and lick your feet clean, one after the other.",
    ],
  },
  "nipple fuck": {
    core: [
      "You press into her nipple and her breast takes you. She gasps at the strangeness of it.",
      "You fuck one of her nipples while she holds the breast up for you with both hands.",
    ],
    yours: ["You finish inside her breast."],
  },
  suckle: {
    core: [
      "You take her nipple in your mouth and suck. Her milk comes warm and sweet, and she strokes your head while you drink.",
      "You lie against her and nurse. Her milk comes warm and sweet and she strokes your hair.",
    ],
  },
  "belly fuck": {
    core: [
      "She holds {belly} up with both hands and you fuck the crease beneath it.",
      "You press yourself against the underside of {belly} and she moves against you.",
    ],
    yours: ["You finish across the curve of her belly."],
  },
  "belly worship": {
    core: [
      "You spread your hands over {belly} and kiss it all over. Something inside kicks under your lips.",
      "You oil {belly} slowly, then put your ear against it and listen.",
    ],
  },
  "breed her back": {
    core: [
      "She pins you down and fucks you with {cock} until she comes inside you, and she holds you there after.",
      "She takes you from behind, slow and deliberate, and finishes deep in you with a groan.",
    ],
  },
  "fill her": {
    core: [
      "You finish in her ass and push a plug in before any of it can come back out. You tell her she's wearing it till tomorrow.",
      "You fuck her ass, come in it, and plug it. She has to walk out like that.",
    ],
  },
  toilet: {
    core: [
      "You put her in the shower on her knees and use her. Afterwards, you make her say thank you.",
      "You make her kneel in the tub and open her mouth. She does it because she has no choice, and then she thanks you.",
    ],
  },
  abuse: {
    core: [
      "You've had a bad day and she's the only one in the room. You take it out on her.",
      "You grab her by the {hair} and hurt her, and you don't make it about anything.",
    ],
  },
  kissing: {
    core: [
      "You tip her chin up and kiss her, slow, and don't take it any further than that.",
      "You pull her close and kiss her properly. She's surprised, then kisses you back.",
    ],
  },
  slow: {
    core: [
      "You take the whole night over her. No hurry, no instructions, just hands and mouths and her body under yours.",
      "You undress her slowly and take your time with every part of her, and when you finally fuck her it's unhurried.",
    ],
    yours: ["You come inside her, holding her close."],
    nocock: {
      core: [
        "You take the whole night over her. No hurry, no instructions, just hands and mouths and her body against yours.",
        "You undress her slowly and take your time with every part of her, and she takes her time with you.",
      ],
      yours: ["You come with her fingers inside you, holding her close."],
    },
  },
  "ball worship": {
    core: [
      "You kneel between her legs and take {balls} in your hands, then your mouth, sucking each one in turn while you stroke {cock} slowly.",
      "You lick up the underside of {balls} and suck on them one at a time, her cock twitching against your cheek.",
    ],
  },
  prostate: {
    core: [
      "You put her on her back with her knees up, work a lubed finger into her ass and curl it against her prostate. You massage it steadily; {cock} starts to leak without being touched.",
      "You bend her over and milk her prostate with two fingers, slow and firm, until a steady drip runs from her.",
    ],
  },
  "clit suck": {
    core: [
      "You spread her open and take her swollen clit into your mouth, sucking it like a little cock while she grips the sheets.",
      "You wrap your lips around her oversized clit and bob on it, tongue working underneath, until her hips are bucking.",
    ],
  },
  frot: {
    core: [
      "You press your cock against {cock} and wrap your fist around both, grinding them together until you're both slick.",
      "You straddle her and rub your cock along the length of hers, slow at first, then fast.",
    ],
    yours: ["You cum together, all over her stomach.", "You cum first, across {cock}, and keep stroking until she follows."],
  },
  "cage tease": {
    core: [
      "You run your fingers over her cage and fondle {balls} while she strains against the plastic. You lick the tip through the bars until she's leaking and begging, then stop.",
      "You tease her locked cock through the cage for half an hour. She's dripping and desperate by the end, and you leave her locked.",
    ],
  },
  "own cum": {
    core: [
      "You put her on her back with her legs over her head and jerk {cock} until she cums across her own face and into her open mouth. Then you make her lick up what she missed.",
      "You stroke her off into a glass and make her drink every drop while you watch.",
    ],
  },
  cbt: {
    core: [
      "You tie off {balls} with a cord and slap them until they're red, then squeeze until she screams.",
      "You flick the head of {cock} and slap {balls}, again and again, until she's sobbing and her legs are shaking.",
    ],
  },
  "tickle feet": {
    core: [
      "You pin her ankles in your lap and run your fingers over {soles}. She's shrieking with laughter within seconds, thrashing and begging you to stop. You don't.",
      "You tie her ankles down and tickle {soles} with a feather, then your nails, until she's crying with laughter and out of breath.",
    ],
  },
  bastinado: {
    core: [
      "You tie her ankles to the bar with {soles} facing you and cane them, one stroke at a time, making her count. By twenty she can't stand on them.",
      "You whip the soles of her feet with a thin rod until they're striped red and she's howling.",
    ],
  },
  trample: {
    core: [
      "You lie down on the floor and she steps onto your chest barefoot, walking slowly up and down you and resting {feet} on your face.",
      "She stands on your stomach, balancing with a hand on the wall, then walks up your chest and plants one sole over your mouth.",
    ],
  },
  "foot smother": {
    core: [
      "She leans back on the couch and presses {soles} against your face, making you breathe her in and lick them while she relaxes.",
      "She props {feet} on your face and wiggles her toes in your mouth while she reads.",
    ],
  },
  "toe suck": {
    core: [
      "You take her foot in your hands and suck her toes one at a time, then lick slowly up {soles} from heel to toe.",
      "You kneel and suck on her big toe, then the rest, running your tongue between them while she watches.",
    ],
  },
  "sole job": {
    core: [
      "She lies back and presses {soles} together, and you fuck the gap between them.",
      "You hold her ankles together and slide your cock between {soles}, her toes curling around you.",
    ],
    yours: ["You cum across her toes and the tops of her feet."],
  },
  pedicure: {
    core: [
      "You soak her feet in warm water, scrub {soles} smooth, rub lotion into them, and paint her toenails while she watches.",
      "You sit her down, put {feet} in your lap, and give her a full pedicure: filing, lotion, and fresh polish on every toenail.",
    ],
  },
  "sleeping together": {
    core: [
      "You tell her she's sleeping in your bed tonight. She strips and climbs in beside you, and you pull her against you under the covers. You don't fuck her; you just go to sleep with your arm around her. In the morning she's still there, warm and pressed against your side.",
      "At the end of the night you take her to your bed and tell her to get in. She lies down next to you stiffly, expecting to be used. When nothing happens she slowly relaxes, and falls asleep with her head on your shoulder. She wakes before you and stays where she is until you get up.",
      "You let her sleep in your bed tonight. She curls up against your back under the covers. You talk for a little while in the dark, and then you both fall asleep. You don't touch her except to hold her.",
    ],
  },
  aftercare: {
    core: [
      "You clean her up with a warm cloth, get her into something soft and sit with her until her breathing slows.",
      "You run her a bath and sit on the edge while she soaks.",
    ],
  },
  talk: {
    core: [
      "You sit down with her and ask about her life before she was enslaved: her family, her job, what she misses. She talks for a while, and you listen.",
      "You pour two drinks and ask her how she's finding life in the arcology. It takes her a while to give you an honest answer.",
    ],
  },
};

/* ── how it landed, written on her body ─────────────────────────────────────────────────────── */

const LANDED: Record<ActOutcome["landing"], string[]> = {
  wanted: [
    "She's into it from the first minute. Her breathing goes ragged and she pushes back for more.",
    "She stops pretending to be calm about it. Her toes curl.",
    "She's wet before you've properly started, and she makes a noise she doesn't bother hiding.",
    "Her eyes close and her whole body goes loose under you.",
  ],
  willing: [
    "She goes along with it happily enough.",
    "She's relaxed, and sighs happily when you get it right.",
    "She's comfortable with it, and enjoys it a little.",
  ],
  endured: [
    "She does what's expected, staring at the ceiling the whole time.",
    "She goes through the motions without any enthusiasm.",
    "She just waits for it to be over.",
  ],
  hated: [
    "She does it, but she hates every second, and it shows.",
    "She goes rigid and clenches her fists, close to tears.",
    "She flinches every time. By the end she's shaking with misery.",
  ],
  nothing: [
    "She lies there and lets it happen, and doesn't seem to feel much of anything.",
    "She makes the right noises, but she's obviously faking.",
    "It doesn't do anything for her either way.",
  ],
};

/** Being hurt or shown off lands differently from being fucked, so it gets its own words. */
const PAIN_LANDED: Record<ActOutcome["landing"], string[]> = {
  wanted: ["She arches into every stroke and makes a sound that isn't a complaint.", "By halfway she's pushing back for the next one.", "She's flushed and wet by the end of it, and not from crying."],
  willing: ["She takes it without fuss, breathing through each one.", "She holds position. She doesn't make you tell her twice."],
  endured: ["She takes it in silence, refusing to give you the satisfaction.", "She counts out loud, voice flat, and doesn't lose count."],
  hated: ["She cries by the end, quietly, and hates that you can see it.", "She flinches at every one and her hands keep trying to cover herself.", "About halfway through she stops reacting and just shakes."],
  nothing: ["She takes it without much reaction.", "She doesn't react much. It's hard to tell whether she feels it."],
};
const SHOWN_LANDED: Record<ActOutcome["landing"], string[]> = {
  wanted: ["She's wet by the time the first stranger stops to look, and she doesn't hide it.", "The more of them look, the brighter her eyes get."],
  willing: ["She holds her head up and lets them look.", "She's steadier about it than you expected."],
  endured: ["She fixes her eyes on a point on the far wall and keeps them there.", "She keeps her face carefully blank."],
  hated: ["She can't stop her face going red and her eyes going wet. Somebody laughs.", "She tries to hide behind her own hands and you don't let her."],
  nothing: ["She doesn't seem to notice the crowd much either way."],
};

const TENDER_LANDED: string[] = [
  "She's surprised by the affection, and a little suspicious, but she enjoys it.",
  "She relaxes and leans into you.",
  "She's grateful, and it shows.",
];

const SERVED_LANDED: string[] = [
  "She lies back and lets you. Her hand ends up in your hair.",
  "She watches you do it, amazed that her owner is serving her.",
  "Her thighs tremble against your head.",
];

/* ── finishing ──────────────────────────────────────────────────────────────────────────────── */

function comeLine(p: Person, o: ActOutcome, r: Rng): string {
  const w = bodyWords(p);
  const hasCock = !!w.cock;
  if (o.landing === "hated") {
    return fill(r.pick([
      "Her body betrays her and she comes anyway. She's humiliated, and turns her face into the sheet.",
      "She comes, and hates herself for it.",
    ]), w);
  }
  const pool = hasCock ? [
    "{cock} jerks and she comes in spurts across {belly}, gasping.",
    "She comes hard, {cock} pulsing, and her back comes off the bed.",
    "She spills over your hand with a groan, hips bucking.",
  ] : [
    "Her thighs clamp around you and she comes with a loud moan, then lies there panting.",
    "She comes, shuddering, fingers digging into your arm, and it goes on longer than she expected.",
    "Her back arches and she comes, soaking the sheet, and laughs once, breathless, at herself.",
    "She comes hard, crying out.",
  ];
  return fill(r.pick(pool), w);
}

function leftLine(p: Person, r: Rng): string {
  return fill(r.pick([
    "She doesn't come. She's close, and her hips keep moving after you've stopped.",
    "She's left wound tight and flushed, and she presses her thighs together when you pull away.",
    "She's right on the edge when you stop. She makes a small, frustrated sound.",
  ]), bodyWords(p));
}

/* ── the moments ────────────────────────────────────────────────────────────────────────────── */

/** The first time you do a given thing with her. Not a claim about her whole life — about the
 *  two of you. */
const FIRST: string[] = [
  "It's the first time you've done this with her, and she's a little unsure of herself.",
  "It's the first time she's done this with you.",
  "It's new for her, and she's still thinking about it afterwards.",
];
const FIRST_TENDER: string[] = [
  "You haven't treated her like this before, and she's not sure what to make of it.",
  "It's the first time you've done this for her, and it surprises her.",
];

function discoveryLine(p: Person, o: ActOutcome, r: Rng): string {
  const f = p.persona.fetishes.find((x) => x.known && o.discovered?.includes(FETISH_BY_ID[x.name]?.name ?? "§"));
  if (f) {
    const lines: Record<string, string[]> = {
      boobs: ["When you get your hands on {tits} she moans. She has a thing for her breasts, and now you know it."],
      buttslut: ["The moment you're in her ass she stops pretending. She pushes back onto you and begs for more. She's a buttslut."],
      cumslut: ["When you finish she chases it with her tongue. She's a cumslut, and that was her favorite part."],
      humiliation: ["It's the watching that does it. The more people look, the wetter she gets. She gets off on humiliation."],
      submissive: ["Once she's got no say, she relaxes completely. She's submissive, and now you know it."],
      dom: ["Given an inch of control she takes the whole thing and her eyes light up. She's a dom at heart."],
      masochist: ["It's the hurting that gets her there. She's a masochist."],
      sadist: ["She enjoys seeing someone else hurt. She's a sadist."],
      pregnancy: ["When you finish inside her she puts a hand on her stomach and keeps it there. She wants to be bred."],
    };
    return fill(r.pick(lines[f.name] ?? [`She's a ${FETISH_BY_ID[f.name]?.name}. It was obvious once you saw it.`]), bodyWords(p));
  }
  if (o.discovered?.includes("quirk") || (p.persona.quirk?.known && o.discovered?.includes(p.persona.quirk.id))) {
    return `From how she took that, it's clear she's a ${p.persona.quirk?.id}.`;
  }
  if (p.persona.flaw?.known && o.discovered?.includes(p.persona.flaw.id)) {
    return `She ${p.persona.flaw.id}; it was obvious from her face.`;
  }
  return o.discovered ? cap(o.discovered) + "." : "";
}

function convertedLine(p: Person, o: ActOutcome): string {
  if (!o.converted) return "";
  const [from, to] = o.converted.split(" → ");
  if (p.persona.paraphilia === to) return `She doesn't just like it any more; she needs it. Her ${from} fetish has become ${to}.`;
  return `She used to be ${from}. Now she's a ${to}.`;
}

/* ── putting it together ────────────────────────────────────────────────────────────────────── */

export interface Written {
  /** Paragraphs of narration, in order. */
  paragraphs: string[];
  /** What she says, if anything, already in her register. */
  said?: string;
  /** Short labels for the moment, shown as tags. */
  tags: string[];
}

/** How many times this has been written for this person, so repeat nights do not read the same. */
function seedFor(s: SaveState, p: Person, act: string): string {
  return `write:${p.id}:${act}:${p.acts?.[act] ?? 0}:${s.turn}`;
}

export function writeAct(s: SaveState, p: Person, o: ActOutcome, opts?: { lead?: boolean }): Written {
  const r = rng(seedFor(s, p, o.act));
  const act = ACT_BY_ID[o.act];
  const found = ACT_TEXT[o.act];
  const text: ActText | undefined = found?.nocock && !hasCock(s) ? found.nocock : found;
  const w = bodyWords(p);
  const reg = registerOf(p);
  const tags: string[] = [];
  const paras: string[] = [];

  // Lead-in: only when this is the start of an encounter, not the fourth thing in a row.
  const last = s.history.at(-1);
  const fresh = !last || !last.present.includes(p.id) || last.turn < s.turn;
  if (opts?.lead ?? fresh) paras.push(fill(r.pick(LEAD[reg]), w));

  // The act.
  const core = text ? r.pick(text.core) : `${cap(act.what)}.`;
  const tender = act.group === "tenderness";
  const served = act.group === "hers" || act.tags.includes("worship");
  const pain = act.group === "discipline" && (act.tags.includes("pain") || act.tags.includes("punishment") || act.tags.includes("orders"));
  const shown = act.group === "display";
  const react = tender ? r.pick(TENDER_LANDED)
    : served && o.landing !== "hated" ? r.pick(SERVED_LANDED)
    : pain ? r.pick(PAIN_LANDED[o.landing])
    : shown ? r.pick(SHOWN_LANDED[o.landing])
    : r.pick(LANDED[o.landing]);
  // Scenes that already carry her reaction to the end of the night do not get a second one.
  const selfContained = o.act === "sleeping together";
  paras.push(selfContained ? fill(core, w) : `${fill(core, w)} ${fill(react, w)}`);

  // The end of it.
  const end: string[] = [];
  if (o.first) { end.push(r.pick(tender || served ? FIRST_TENDER : FIRST)); tags.push("first time"); }
  if (o.finished) { end.push(comeLine(p, o, r)); tags.push("she came"); }
  else if (p.psyche.arousal >= 70 && act.base.arousal > 0) { end.push(leftLine(p, r)); tags.push("left wanting"); }
  if (act.base.release >= 5 && text?.yours) {
    // Finding out she wants to be bred is found out BY finishing inside her, so that is how it ends.
    const bred = !!o.discovered && p.persona.fetishes.some((f) => f.name === "pregnancy" && f.known);
    end.push(fill(bred ? text.yours[0] : r.pick(text.yours), w));
  }
  if (end.length) paras.push(end.join(" "));

  if (o.discovered) { paras.push(discoveryLine(p, o, r)); tags.push("found out"); }
  if (o.converted) { paras.push(convertedLine(p, o)); tags.push("changed"); }

  // What she says. Tenderness and pain get their own lines; otherwise it is how it landed.
  let said: string;
  if (o.finished && o.landing !== "hated") said = say(s, p, "came", r);
  else if (tender) said = say(s, p, o.act === "talk" ? "talk_open" : "tender", r);
  else if (act.tags.includes("pain") && o.landing !== "wanted") said = say(s, p, "pain", r);
  else if (!o.finished && p.psyche.arousal >= 70 && act.base.arousal > 0) said = say(s, p, "left", r);
  else if (["toilet", "degradation", "make her worship"].includes(o.act)) said = say(s, p, "thank", r);
  else said = say(s, p, o.landing, r);

  return { paragraphs: paras.filter(Boolean), said, tags };
}

/** The one-line version, for the log and the report. */
export function summarise(p: Person, o: ActOutcome): string {
  const act = ACT_BY_ID[o.act];
  const how = { wanted: "she loved it", willing: "she was into it", endured: "she put up with it", hated: "she hated it", nothing: "it did nothing for her" }[o.landing];
  return `${act.name} — ${how}${o.finished ? ", and she came" : ""}.`;
}
