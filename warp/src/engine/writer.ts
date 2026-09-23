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
import type { Person, SaveState } from "./types";
import type { ActOutcome } from "./intimacy";
import { ACT_BY_ID, FETISH_BY_ID } from "../data/intimacy";
import { rng, type Rng } from "./rng";
import { registerOf, say, fill, type Register } from "./voice";

/* ── her body, in words ─────────────────────────────────────────────────────────────────────── */

export function bodyWords(p: Person): Record<string, string> {
  const b = p.body;
  const tits = b.boobs < 200 ? "her flat chest" : b.boobs < 400 ? "her small breasts" : b.boobs < 750 ? "her breasts"
    : b.boobs < 1300 ? "her heavy tits" : b.boobs < 2600 ? "her huge tits" : "her enormous tits";
  const ass = b.butt <= 1 ? "her narrow ass" : b.butt <= 3 ? "her ass" : b.butt <= 5 ? "her round ass" : "her huge ass";
  const hairLen = b.hair_length < 8 ? "cropped" : b.hair_length < 25 ? "short" : b.hair_length < 55 ? "" : "long";
  const hair = `${hairLen ? hairLen + " " : ""}${b.hair_color} hair`;
  const cock = b.dick === null || b.dick === 0 ? "" : b.dick <= 2 ? "her small cock" : b.dick <= 4 ? "her cock" : "her thick cock";
  const build = b.height_cm < 155 ? "small" : b.height_cm > 178 ? "tall" : b.weight > 30 ? "soft" : b.muscle > 30 ? "hard-bodied" : "slim";
  const belly = p.womb.weeks > 20 ? "her swollen belly" : b.belly > 4000 ? "her round belly" : "her stomach";
  const she = p.pronouns === "he/him" ? "he" : p.pronouns === "they/them" ? "they" : "she";
  const her = p.pronouns === "he/him" ? "his" : p.pronouns === "they/them" ? "their" : "her";
  const herObj = p.pronouns === "he/him" ? "him" : p.pronouns === "they/them" ? "them" : "her";
  return {
    name: p.name, tits, ass, hair, cock, build, belly, skin: `${b.skin} skin`,
    eyes: `${b.eye_color} eyes`, she, She: cap(she), her, Her: cap(her), herObj,
  };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ── the lead-in, by how she is holding herself ─────────────────────────────────────────────── */

const LEAD: Record<Register, string[]> = {
  hollow: [
    "{name} is where you left her. She looks up when you come in and waits to be told.",
    "{name} gets up before you've said anything and stands with her hands at her sides.",
    "{name} is kneeling by the bed already. Nobody told her to; somebody did once, and it stuck.",
  ],
  timid: [
    "{name} is on her feet the second the door opens, hands knotted in front of her.",
    "{name} watches your hands, not your face, all the way across the room.",
    "{name} has pulled her knees up on the edge of the bed. She puts her feet down when she sees you.",
  ],
  sullen: [
    "{name} doesn't get up. She looks at you over her shoulder and goes back to looking at the wall.",
    "{name} is sitting cross-legged on the floor and makes you wait before she stands.",
    "{name} sighs loud enough that you hear it from the door.",
  ],
  proper: [
    "{name} stands when you come in and smooths her {hair} back from her face.",
    "{name} sets down what she was reading, squared to the edge of the table, and turns to you.",
    "{name} is waiting by the window, posture straight, and nods when you come in.",
  ],
  warm: [
    "{name} smiles when she sees it's you and pats the bed beside her.",
    "{name} is halfway through telling you about her day before you've shut the door.",
    "{name} reaches for your hand before you've even sat down.",
  ],
  eager: [
    "{name} is on you before the door has closed, mouth on your neck.",
    "{name} has been waiting, and it shows: flushed, restless, already half out of what she's wearing.",
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
    "{name} is in your chair. She doesn't get up, and she doesn't expect you to ask her to.",
    "{name} points at the floor in front of her.",
    "{name} looks up from your desk, where she has been going through your papers, and puts them down.",
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
}

const ACT_TEXT: Record<string, ActText> = {
  oral: {
    core: [
      "You put a hand on her shoulder and she goes down. Her mouth is warm and she takes you slowly at first, eyes on your face.",
      "She kneels between your knees and takes you in her mouth, one hand steadying herself on your thigh.",
    ],
    yours: ["You finish in her mouth.", "You pull out at the last moment and finish across her lips and chin."],
  },
  throat: {
    core: [
      "You take a handful of her {hair} and push. She gags the first time, then opens her throat and lets you use it, spit running down her chin.",
      "You hold her head still and fuck her throat. Her hands come up to your hips and stay there, not pushing, just holding on.",
    ],
    yours: ["You hold her there while you come, and let go. She drags in air.", "You finish deep in her throat and she swallows around you because there's nowhere else for it to go."],
  },
  vaginal: {
    core: [
      "You put her on her back and push into her. Her cunt is tight around you and her heels hook behind your thighs.",
      "You bend her over the edge of the bed and fuck her from behind, one hand on the small of her back.",
      "She climbs on and sinks down onto you, hands flat on your chest, and you take her hips and set the pace.",
    ],
    yours: ["You come inside her.", "You pull out and finish on {her} stomach."],
  },
  anal: {
    core: [
      "You work lube into her and push into her ass slowly. She breathes out through her teeth and takes the rest.",
      "You put her on her knees, face in the pillow, and fuck her ass with long, steady strokes.",
    ],
    yours: ["You finish deep in her ass.", "You come inside her and hold still until you soften."],
  },
  painal: {
    core: [
      "You don't bother warming her up. You push into her ass dry and she makes a sound you'll remember.",
      "You pin her face-down and force your way into her ass. She claws at the sheet.",
    ],
    yours: ["You finish inside her and pull out. She doesn't move for a while."],
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
      "You lie back and let her take you. {Her} cock is hard and she pushes into you slowly, watching your face for permission, then stops watching.",
      "She fucks you on your back with your knees over her shoulders, and she's better at it than you expected.",
    ],
    yours: ["You come with her still inside you."],
  },
  group: {
    core: [
      "You bring in a second girl and put them both to work. They have to share you, and they bump heads, and neither of them laughs.",
      "You take two of them at once, one riding you while the other's mouth is busy lower down. {name} keeps glancing at the other one.",
    ],
    yours: ["You finish in {name}, and the other girl cleans you off."],
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
      "You kneel between her thighs and take {cock} in your mouth. She makes a sound like she's surprised you meant it.",
      "You go down on her properly, your hand on {cock}'s base, until her fingers are knotted in your hair.",
    ],
  },
  "stroke her": {
    core: [
      "You take {cock} in your hand and work her slowly, watching her face change.",
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
      "You push her thighs apart and put your mouth on her cunt. She tries to say something and gives up.",
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
      "You take her foot in both hands and kiss the arch, then her toes, one at a time. She watches you do it.",
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
      "You take her nipple in your mouth and drink. Neither of you says anything. Her hand comes to rest on your head.",
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
      "You kiss her like you mean it. She holds still for a moment before she kisses back.",
    ],
  },
  slow: {
    core: [
      "You take the whole night over her. No hurry, no instructions, just hands and mouths and her body under yours.",
      "You undress her slowly and take your time with every part of her, and when you finally fuck her it's unhurried.",
    ],
    yours: ["You come inside her, holding her close."],
  },
  "sleeping together": {
    core: [
      "You pull back the covers and tell her to get in. She does. You sleep. That's all.",
      "She sleeps in your bed tonight, curled against your back, and nothing is asked of her.",
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
      "You sit down across from her and ask her about herself. Then you listen.",
      "You pour two drinks and ask her how she's doing, and wait for the real answer.",
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
    "She goes along with it easily, not transported, just there with you.",
    "She keeps up, relaxed, and sighs once when you get it right.",
    "She's comfortable, and it shows in her shoulders.",
  ],
  endured: [
    "She does it well and her eyes are on the ceiling the whole time.",
    "She goes through the motions. Nothing about her face moves.",
    "She counts something under her breath — ceiling tiles, maybe, or seconds.",
  ],
  hated: [
    "She does it, and her whole body fights her the entire time. Her jaw is locked when you're done.",
    "She goes rigid. Her hands are fists. She doesn't cry, quite.",
    "You feel her flinch every time. By the end she's shaking, and not the good kind.",
  ],
  nothing: [
    "She's there, technically. Somewhere else in every way that counts.",
    "She makes the right noises at the right times and none of them are real.",
    "It doesn't seem to reach her either way.",
  ],
};

/** Being hurt or shown off lands differently from being fucked, so it gets its own words. */
const PAIN_LANDED: Record<ActOutcome["landing"], string[]> = {
  wanted: ["She arches into every stroke and makes a sound that isn't a complaint.", "By halfway she's pushing back for the next one.", "She's flushed and wet by the end of it, and not from crying."],
  willing: ["She takes it without fuss, breathing through each one.", "She holds position. She doesn't make you tell her twice."],
  endured: ["She takes it with her jaw set and doesn't give you a sound.", "She counts out loud, voice flat, and doesn't lose count."],
  hated: ["She cries by the end, quietly, and hates that you can see it.", "She flinches at every one and her hands keep trying to cover herself.", "She goes somewhere behind her eyes about halfway through."],
  nothing: ["She takes it like weather.", "She doesn't react much. It's hard to tell if it's landing."],
};
const SHOWN_LANDED: Record<ActOutcome["landing"], string[]> = {
  wanted: ["She's wet by the time the first stranger stops to look, and she doesn't hide it.", "The more of them look, the brighter her eyes get."],
  willing: ["She holds her head up and lets them look.", "She's steadier about it than you expected."],
  endured: ["She fixes her eyes on a point on the far wall and keeps them there.", "Her face goes smooth and blank, like a shop window."],
  hated: ["She can't stop her face going red and her eyes going wet. Somebody laughs.", "She tries to hide behind her own hands and you don't let her."],
  nothing: ["She doesn't seem to notice the crowd much either way."],
};

const TENDER_LANDED: string[] = [
  "She doesn't know what to do with her hands at first. Then she does.",
  "Something in her shoulders lets go.",
  "She goes quiet, and stays quiet, and leans into you a little.",
];

const SERVED_LANDED: string[] = [
  "She lies back and lets you. Her hand ends up in your hair.",
  "She watches you do it with an expression you haven't seen on her before.",
  "Her thighs tremble against your head.",
];

/* ── finishing ──────────────────────────────────────────────────────────────────────────────── */

function comeLine(p: Person, o: ActOutcome, r: Rng): string {
  const w = bodyWords(p);
  const hasCock = !!w.cock;
  if (o.landing === "hated") {
    return fill(r.pick([
      "Her body goes anyway, which is the worst part of it for her. She turns her face into the sheet.",
      "She comes, and hates that she does. She won't look at you after.",
    ]), w);
  }
  const pool = hasCock ? [
    "{cock} jerks and she comes in spurts across {belly}, gasping.",
    "She comes hard, {cock} pulsing, and her back comes off the bed.",
    "She spills over your hand with a groan, hips bucking.",
  ] : [
    "Her thighs clamp and she comes with a sound she didn't plan to make, then lies there breathing through her mouth.",
    "She comes, shuddering, fingers digging into your arm, and it goes on longer than she expected.",
    "Her back arches and she comes, soaking the sheet, and laughs once, breathless, at herself.",
    "She comes with her face screwed up and her mouth open, silent, until she isn't.",
  ];
  return fill(r.pick(pool), w);
}

function leftLine(p: Person, r: Rng): string {
  return fill(r.pick([
    "She doesn't come. She's close, and she stays close, hips still moving after you've stopped.",
    "She's left wound tight and flushed, and she presses her thighs together when you pull away.",
    "She's right on the edge when you stop. She makes a small, frustrated sound.",
  ]), bodyWords(p));
}

/* ── the moments ────────────────────────────────────────────────────────────────────────────── */

/** The first time you do a given thing with her. Not a claim about her whole life — about the
 *  two of you. */
const FIRST: string[] = [
  "It's the first time you've done this with her. She stops halfway through to find her bearings.",
  "It's the first time with you. She'll remember it.",
  "That's new between the two of you. She looks at you afterwards like she's filing it somewhere.",
];
const FIRST_TENDER: string[] = [
  "You haven't been like this with her before. She keeps checking your face.",
  "It's the first time you've done this for her. She doesn't know what to make of it yet.",
];

function discoveryLine(p: Person, o: ActOutcome, r: Rng): string {
  const f = p.persona.fetishes.find((x) => x.known && o.discovered?.includes(FETISH_BY_ID[x.name]?.name ?? "§"));
  if (f) {
    const lines: Record<string, string[]> = {
      boobs: ["When you get your hands on {tits} she stops breathing for a second. That's the spot. That's always going to be the spot."],
      buttslut: ["The moment you're in her ass she stops pretending. She pushes back onto you and says please. That's what she's been waiting for."],
      cumslut: ["When you finish she chases it with her tongue. She wanted that more than anything else you did."],
      humiliation: ["It's the watching that does it. The more people look, the wetter she gets, and she knows you've seen it."],
      submissive: ["Once she's got no say, something in her goes quiet and easy. She wants to be told. Now you know."],
      dom: ["Given an inch of control she takes the whole thing and her eyes light up. She wants to be the one in charge."],
      masochist: ["It's the hurting that gets her there. Gentle does nothing for her. Pain does."],
      sadist: ["She likes it when it's somebody else hurting. You saw her smile."],
      pregnancy: ["When you finish inside her she puts a hand on her stomach and keeps it there. She wants to be bred."],
    };
    return fill(r.pick(lines[f.name] ?? [`She's a ${FETISH_BY_ID[f.name]?.name}. It was obvious once you saw it.`]), bodyWords(p));
  }
  if (o.discovered?.includes("quirk") || (p.persona.quirk?.known && o.discovered?.includes(p.persona.quirk.id))) {
    return `There's something about how she took that. She's a ${p.persona.quirk?.id}, and you won't forget it.`;
  }
  if (p.persona.flaw?.known && o.discovered?.includes(p.persona.flaw.id)) {
    return `She ${p.persona.flaw.id}. It was all over her face, and she knows you saw.`;
  }
  return o.discovered ? cap(o.discovered) + "." : "";
}

function convertedLine(p: Person, o: ActOutcome): string {
  if (!o.converted) return "";
  const [from, to] = o.converted.split(" → ");
  if (p.persona.paraphilia === to) return `She's past wanting it now. She needs it. What was ${from} is ${to}.`;
  return `Whatever she used to be about it, she isn't any more. She was ${from}. Now she's a ${to}.`;
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
  const text = ACT_TEXT[o.act];
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
  paras.push(`${fill(core, w)} ${fill(react, w)}`);

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
  const how = { wanted: "she loved it", willing: "she was into it", endured: "she put up with it", hated: "she hated it", nothing: "it didn't reach her" }[o.landing];
  return `${act.name} — ${how}${o.finished ? ", and she came" : ""}.`;
}
