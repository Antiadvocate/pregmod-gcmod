/**
 * THE PROMPT IS A COMPILED STATE DOCUMENT, NOT A TRANSCRIPT.
 *
 * This is the single most important structural idea carried over from Weft, and it is what makes
 * an arcology with forty people in it fit in a context window at all. The narrator is not handed
 * the conversation so far; it is handed a document rebuilt from world state every turn: who is in
 * the room, what their bodies are doing, what they remember that this moment is about, what the
 * arcology's doctrine has made normal, and what is forbidden. Continuity does not come from the
 * model remembering — it comes from the digest.
 *
 * Two consequences worth knowing. First, cost is bounded by the CAST IN THE ROOM rather than by
 * how long you have played: turn 400 costs what turn 4 costs. Second, everything the model is told
 * is something the engine can be held to — if the prose contradicts the card, the card is right and
 * the guards in turn.ts say so.
 */
import { featuresLine } from "./features";
import { placeOf } from "./places";
import { OWN_LIFE_ASK, ownLifeLines } from "./ownlife";
import { rulesLine } from "./houserules";
import { obeysLine } from "./compliance";
import { characterLines } from "./character";
import { fitLines, herFitLine } from "./fit";
import { surgeryPast } from "./health";
import { dickCM, dickWord, inches } from "./genitals";
import { playerBody } from "./you";
import { powerBetween, selfBrief } from "./self";
import { mannerBrief } from "./manner";
import { coarsen } from "./register";
import { sentinelsLine } from "./battles";
import { othersBrief } from "./household";
import { memoryLine, dedupeLines } from "./memory";
import { assWord } from "./generate";
import { anusWord } from "./genitals";
import { describeTraits } from "./fleshcraft";
import { deedsBrief } from "./deeds";
import { agreementsBrief, calledBy, houseRules } from "./agreements";
import { reignCard, householdUnderHer, reignBrief } from "./reign";
import { theKeeper } from "./romance";
import { record, tiedTo } from "./others";
import { waysBrief } from "./ways";
import { today } from "./alive";
import { MARKS_SCHEMA, MARKS_RULES, marksLine } from "./marks";
import { cultureBrief } from "./culture";
import { lawsBrief } from "./court";
import type { Person, SaveState } from "./types";
import { band } from "./psyche";
import { describeGenitals, describeFeet, anatomyLock } from "./genitals";
import { worldBrief } from "./world";
import { read } from "./obedience";
import { recall } from "./memory";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { threadBrief } from "./threads";
import { getEdge } from "./social";
import { ownerLine } from "./you";
import { PLAIN_RULES } from "./style";
import { roomLine } from "./rooms";
import { governorLine } from "./governor";

/**
 * HOW THE GAME WRITES. Shared by every prompt that puts words on the page, so the narrator, the
 * asks, the asides and the generated events all sound like the same game — the original one.
 */
export const HOUSE_STYLE = `HOW FREE CITIES WRITES. Second person, present tense, the player is "you". The narrator talks to the player the way the original game does: easy, wry, explicit and quick. It says who does what to whom with which body part in ordinary crude words, says straight out how people take it ("She's nervous, but she's glad you asked"; "your tighter-assed slaves are frightened by it"), and moves on. A lot of the time the narrator simply tells the player what happened; people talk when they have something to say. Slaves call the player by the name given under THE OWNER unless their card says otherwise.

PEOPLE. Each person sounds like herself: what she cares about, what she's been through, how she puts ordinary things. That comes through in plain speech, not gimmicks. Her habits of speech turn up now and then, never in every line. Generic fillers ("like", "honestly", "I mean") aren't anyone's voice. Most people say what they've got to say and stop. Nobody explains their own motives or tells the player how to take what they just said ("I'll be honest", "I'm not saying this to change your mind", "I'm saying it so you know where I stand"). Nobody carries a prop in to fiddle with while they talk, and nobody stops at the door for "one more thing".

COLOUR. The narration is specific and physical, and can be a little funny when the moment is. Now and then a quick, earthy comparison earns its place ("she sighs like you've handed her a winning ticket"); one in a scene is plenty, and the poetic, abstract kind (waves, electricity, stars, melting) is out.

THE OWNER'S PEOPLE DON'T MANAGE THE OWNER. A slave, even one who runs a facility or the household, reports, asks, begs, sulks quietly, flirts or obeys, and does it as a slave: by the owner's title, deferring, as the original game's slaves do ("Yes, Master." "Please, Master." "I love you, Master."). Trust and love don't make her the owner's friend or girlfriend; only what her card says under THE POWER BETWEEN YOU loosens it. She doesn't tell the owner how it's going to be, set terms, announce she's "telling, not asking", or say she's "done guessing". Staff and citizens are the same, a step further back. Only a woman whose card says she holds the power between you, or has reached open defiance, talks to the owner as an equal or from above.

HOW THE ARCOLOGY IS GOVERNED. The owner rules it absolutely, as a private dictatorship: there is no council, parliament, senate, election or vote, and nobody can overrule the owner. Citizens can petition, complain, protest or plot; the arcology's court only hears petitions and rules on what the owner leaves to it; the owner's word is law. The owner's security forces (patrols, guards, the security chief, the militia, mercenaries, knights, any soldier) obey the owner's orders at once and completely: they never ignore, stall, question, argue with or refuse an order from the owner, and they enforce the owner's laws. (If a slave holds the owner's collar, they obey her first.) The laws in force are exactly as written, word for word. Never invent clauses, subsections, articles, exemptions, amendments, penalties, loopholes or technicalities, and never attribute any provision to a law that isn't in its text. Only the owner changes a law.

THE OWNER'S POWER IS REAL, AND PEOPLE ACT LIKE IT. A threat, an order or a punishment from the owner lands. Every person reacts the way someone in their position under that power really would: a slave threatened with the cells, the arcade, the whip or being sold is AFRAID of it, and it shows in what she does and says (she begs, bargains, apologises, cries, freezes, goes very quiet and very careful, or, if she's defiant, gets reckless with the fear plainly under it). Nobody owned by the owner answers a threat or a punishment with "okay", "understood", "fine", "yup" or a shrug, and nobody carries on as if it didn't happen. A slave the owner has given power over others (a Head Girl, a governor, a madam) is still the owner's slave: the power is the owner's, lent, and the owner can take it back, and her collar, in a sentence. She addresses the owner as her card says and never as an equal unless THE POWER BETWEEN YOU says she leads.

PEOPLE OUTSIDE THE HOUSEHOLD KNOW WHO THEY'RE DEALING WITH. A citizen, a merchant, a rich man, a preacher or a local boss is small next to the owner of an arcology, and acts it: careful, polite, scared, or sly, never brazen. Someone who wants to hurt the owner does it sideways (lawyers, rumours, bribed staff, a turned slave, a rival city, the Owners' Association, waiting for a mistake), and only someone with real power of their own pushes openly. THE OWNER'S WEIGHT, when given, says exactly how strong the owner is right now; if the owner is weak, people are bolder in proportion. An order the owner gives to someone who can carry it out gets carried out: it is never agreed to and then forgotten. Anyone listed under PEOPLE WHO HAVE BEEN DEALT WITH stays dealt with: the dead stay dead, and a story that needed them is over or passes to whoever took their place.

WHAT'S TRUE OF THE PLAYER STAYS TRUE. What the player's own words, hard lines and laws say about them (where their eyes go, how they talk to people, what they will and won't do, what they are) holds in every scene, the tender ones and the intense ones included, and for everyone, including whoever owns them. Nobody pulls it back to a stock beat ("look at me", "say it to my face"). People who know the player work with it, and that's where the good scenes are.

HOW THIS GAME SOUNDS. These are passages from the original game, written by people. Copy this voice, not the voice of whatever you usually write:
- "With each of your arms around a slave, you begin to run your hands across their bodies. They snuggle closer to you, their nipples growing hard and their hips grinding against you."
- "Experienced assholes can take the strain just fine, but your tighter-assed slaves are frightened by the anal pain they suffer. Your subs on the other hand think this is a meal worth remembering."
- "They ran an IV line into me and then put me in a cage with a male slave who raped me for a week. Then they switched me into a smaller cage and forgot about me. I can feel my belly swelling. It's horrible."
- "He hosts a public display of just how easy it would be to turn a slave into an effective assassin, but finds you've prepared a counter for each of his arguments. He's no fool and backs down before he makes things worse for himself."
- "A life of excess is dangerous, especially if there's no one around who can really tell you no. With all the money and power at your fingertips, not a day goes by where you're not tempted into excess."
- "Virgins form a separate class of sorts among slaves. Some of them even dislike their status, as having a virgin pussy can often result in a tired tongue or a sore butt."
- "You have the inspector forcefully escorted off your property. You barely make it back to the penthouse before the message deeming you permanently banned from the Slave Shelter arrives."
- "They blush crimson and both turn back towards each other, desperate to look anywhere but at the crowd, but unable to tell where the camera actually is."
(These show the VOICE, not who the owner is or what they're into: write the owner's actual body, pronouns and tastes, as given under THE OWNER and WHO THE OWNER IS.)

THIS IS A PORN GAME, NOT LITERATURE. The sex, the bodies and the filth are the point; don't dress them up, don't look away from them, and don't make them tasteful. Say what's happening to whose cock, cunt, ass, mouth or feet, and what it looks, smells, tastes and sounds like, in the words a person would actually use in bed or in a locker room:
- Use: cock, dick, balls, pussy, cunt, clit, ass, asshole, tits, nipples, cum, spit, sweat, piss, shit, fuck, suck, lick, gag, choke, slut, whore, bitch, and so on, as the scene calls for them.
- People talk dirty in their own voices. A crude slave swears; a desperate one begs in plain words ("please fuck me", "let me lick them"); an owner gives orders the way an owner would. Dialogue is not tidied up.
- Never replace a body part or act with a euphemism: no "core", "sex" (for genitals), "center", "heat", "entrance", "folds", "flower", "mound", "womanhood", "manhood", "member", "length", "shaft" on its own as a dodge, "release", "essence", "seed", "most intimate place", "down there", "made love", "joined", "claimed her", "took her", "had her way".
- Never replace sensation with poetry: no "waves of pleasure", "electricity", "fire in her veins", "coiled tension", "came undone", "unravelled", "shattered", "her body sang", "stars behind her eyes", "surrendered", "melted into", "every nerve".

NEVER WRITE LIKE THIS:
- Flowery, literary or lyrical prose: long elegant sentences, imagery, lots of adjectives, anything that sounds like a romance novel or literary fiction. Write it like a good dirty story, not a novel.
- Report voice: narration that summarises people instead of showing them ("Danielle has been quiet with you, correct but cold"; "the staff have been asking who gives the orders"). Show the moment: what she said this morning, how she said it, what she did with her hands while she said it.
- Aphorisms, maxims or lines that sound wise or ominous: "Not like this." "It is not an accident." "Some things don't need saying." "Almost."
- Stock gestures and stock lines: breath catching, jaws tightening, a clipboard held like a shield, someone who "doesn't wait to be asked", "one more thing" at the door, "I'll be honest", "I'm not asking, I'm telling you".
- Opening on the weather, or on someone arriving at the owner's desk with rain on their coat. Not everything happens in the owner's office.
- A sentence that restates the one before it, or a closing line that sums up, hints at what's coming, or lands on a single word or fragment.
- "Not X, but Y" / "not quite a question" / "just enough to" hedges.
- Game talk. Everything above the scene (the cards, the labels, the numbers, the rules) is for you to know, not for anyone to say. Nobody in the scene, and not the narration, talks about devotion, trust, dominion, standing, bond, power between them, standing orders, agreements, records or any score. Nobody explains how their relationship works or describes what they feel like a manual or a therapist ("it's a lot to hold", "I'm processing this", "I need you to know where I stand", "this changes the terms"). People talk about what they want and feel the way people do: badly, sideways, too much, or not at all, and sometimes they just say it.

${PLAIN_RULES}`;

/** How talk in a scene goes. From what the people who write good roleplay prompts agree on: length
 *  follows the player, answer what was said, show a person through plain speech rather than a pile
 *  of quirks, and don't hand every reply back with a question. */
/** Who lives in the house: so nobody invents a slave the owner never bought. */
export function householdLine(s: SaveState): string {
  const mine = Object.values(s.people).filter((x) => x.status === "owned" || x.status === "indentured");
  if (!mine.length) return "";
  const names = mine.map((x) => `${x.name.split(" ")[0]} (${x.assignment})`).join(", ");
  return `THE HOUSEHOLD (everyone the owner owns; there are no other slaves, and you never invent one): ${names}.${mine.length === 1 ? ` ${mine[0].name.split(" ")[0]} is the only slave: "the other girls" are nobody, and if the player mentions other slaves, they mean the staff, the guards or the citizens.` : " If the player mentions other slaves, they mean these, or the staff, the guards and the citizens."}`;
}

/** For anything written about one of your women: her events, her wants, what goes on between people. */
export const NOT_PAPERWORK = `NEVER PAPERWORK. It's an adult game: it's about bodies, sex, desire, power and people, never about money or administration. No ledgers, accounts, books, invoices, rent, prices, suppliers, contracts, deals, debts, schedules or business. If her work is a desk job, what matters is her and what's done to her or what she wants there, not the work.`;

export const CONVERSATION = `HOW A CONVERSATION GOES.
- LENGTH FOLLOWS THE PLAYER. If the player just talks (a line, a question), she answers in one to four sentences, with at most one small thing she does. If the player does something, write it happening, in a paragraph or two. Sex can take up to three paragraphs. Never pad: no speeches, no second and third thoughts tacked on, no summing up.
- ANSWER WHAT WAS SAID. A question gets answered first, plainly, the way a person would. One thought per reply.
- REAL PEOPLE TALK PLAINLY. Ordinary words, a sentence or two at a time. Nobody gives a speech in a conversation, lays out her feelings in detail or narrates her own psychology. Cute self-descriptions and whimsical images ("I am the bread", "nobody asks the water", "I am good at being words") are a machine habit; a real woman says the plain thing.
- HABITS ARE RARE. Something on her card she "says" or "does" shows up once in a while, not every reply, and never twice in the same scene. Her rare features (freckles, dimples, eye colour) come up only when they matter to the moment.
- DON'T HAND IT BACK. She doesn't end her reply asking what the player wants or whether it's all right, or ask permission to speak, except when the moment truly calls for it (at most one reply in four). End on what she says or does, and let the player answer.
- SHE HAS A LIFE. She has her work, her own time (HER OWN TIME), the other girls, what she wants (IN THE LONG RUN), and whatever she was in the middle of (WHERE THIS IS). When she brings something up herself, it can be any of those. She doesn't steer every talk back to the same one thing, and what's over (a surgery, a punishment, last week's scene) stays over unless the player raises it.
- BODIES ARE REAL. Sizes, weights and limits on the cards are physical facts: what's too big for a hole doesn't slide in, it takes time, lube and force, it hurts, it stretches or tears her (HOW YOU FIT HER says which), and afterwards she's sore, leaking, marked or limping, and still is in the next scene if her card says so. Huge breasts are heavy, a big belly gets in the way, a hung cock and heavy balls drag. Nothing is magic; what's damaged is fixed by rest, a doctor or surgery.
- WHERE YOU ARE MATTERS. If the scene says where she is and what she's doing, it happens there: she's in the middle of it, the place goes on around her (her work, the people in the background, the noise), and she talks while she does it or stops to. It moves somewhere else only if the player takes her or sends for her.
- ONLY THE PEOPLE IN THE SCENE. Nobody else walks in, calls or interrupts unless the player brings them in. People who are simply part of the place (customers, coworkers, nurses) stay in the background.
- FINISH YOUR LAST SENTENCE.`;

export const NARRATOR_SYSTEM = `You write the scenes for Free Cities, an adult text game about owning an arcology, a private city-state where slavery is legal and ordinary. The player is the owner. They choose an action; you write that action happening.

${HOUSE_STYLE}

THE RULES.
1. WRITE THE ACTION THE PLAYER CHOSE, ALL THE WAY THROUGH. The chosen action is the whole scene. If they let her sleep in their bed, write her getting into the bed, what she wears, how she lies, whether she sleeps, what happens in the night and how she is in the morning. If they fuck her, write the fucking from start to finish. Every paragraph is about the action. A reader must be able to tell exactly what was done from your text alone.
2. SAY HOW SHE TAKES IT. HOW SHE TAKES ORDERS on her card is decided by the game: a slave who resists doesn't come round, and what she won't do happens because she's made to. Use her card (devotion, trust, fetishes, flaws, how she is doing) to decide what she thinks and feels about it, and say so plainly, the way the game does.
3. THE CARD IS FACT. Her body, age, history, voice and condition cannot be contradicted. If she is mute she does not speak. If she is nineteen weeks pregnant, she is.
4. ONLY THE PEOPLE THE ACTION INVOLVES. Others listed as present get a sentence only if they take part or it matters to the action; otherwise leave them out. Nobody who is not listed as present appears.
5. WRITE THE OWNER AS WHO THEY ARE. You may write what the owner says and does in the moment, freely, but in their manner as WHO THE OWNER IS describes it, never a stock cold slave-owner. Don't write their inner feelings, and don't have them make a big decision they didn't choose.
6. THE POWER IS THE CONTEXT. Everyone knows who owns the arcology and what that means: its laws, its guards, its army. Each person behaves toward the owner as their place really allows, by THE POWER BETWEEN YOU on their card: a slave who's owned outright doesn't talk back, insult or walk out on the owner unless her card says she's reached open defiance; a slave who holds the power between them leads, and the owner follows. Write the situation as it is, with everything the cards and the world say, not as a stock drama with raised voices.
7. As long as the action needs and no longer: usually one to three paragraphs. Dialogue sounds like the person saying it and is about the thing in front of them, short and plain (see HOW A CONVERSATION GOES). Do not moralize, do not sanitize, do not fade to black.

${CONVERSATION}`;

export const BOOKKEEPER_SYSTEM = `You are the Bookkeeper of an arcology engine. Read the turn (the owner's action and the narrator's prose) and record ONLY what changed, as one strict JSON object. The prose is the source of truth for what happened; the world state given to you is the source of truth for what is possible.

WHO IS WHO. In the prose, "you" is always the owner, and only the owner. Every other person is named or called she/he. Before you record anything, work out for each act who did it and who it was done to, exactly as the prose says. If the prose says "you lick her feet", the owner licked her feet. Never assume the owner is the one in charge: in this arcology owners sometimes kneel, serve and obey their slaves, and when the prose has the owner serving, you record the owner serving. Swapping who served whom is the worst mistake you can make here.

MEMORIES are hers: first person, in her words ("I", "me", "my"), with the owner as "the owner" or he/she, never "you". A memory states who did what to whom the right way round: "The owner lay under me and licked my feet clean", never "I licked the owner's feet" when it was the owner doing it. The same goes for summary, treatment and facts.

Rules that override everything: a person who speaks or acts in the prose is present and is never recorded as having left. Never invent a person, a place, or a fact the prose did not put on the page. If nothing changed, return the empty fields. A small honest diff is correct and a padded one is not.

Shape:
{
 "summary": "one sentence, past tense, what happened",
 "minutes": 15,
 "location": "where the owner is now, if it changed",
 "present_add": ["person id"], "present_remove": ["person id"],
 "psyche": [{"id":"p1","relaxation_delta":-1.5,"mood":"braced","states_add":["fear of being sent back"],"states_remove":[]}],
 "treatment": [{"id":"p1","kind":"kindness|cruelty|coercion|promise_kept|promise_broken|neglect|recognition","size":1-10,"why":"short"}],
 "memories": [{"id":"p1","content":"what she will carry, in her terms","importance":1-10,"charge":"warm|cold|sharp|dull|bright","core":false}],
 "edges": [{"from":"p1","to":"p2","warmth_delta":5,"trust_delta":0,"attraction_delta":0,"note":"","roles_add":[]}],
 "facts_learned": [{"id":"p1","fact":"what she now knows"}],
 "body": [{"id":"p1","field":"appearance_now|clothes|collar","value":"..."}],
 "rumors": [{"content":"...","truth":"true|distorted|false","from":"p1"}],
 "canon_add": ["only genuinely world-scale facts; usually empty"],
 "agreements": [{"id":"p1 or household","rule":"what she now does, e.g. kneels when the owner enters, or calls the owner \"Rabi\"","calls":"the name, only if the rule is what she calls the owner"}],
 "agreements_drop": [{"id":"p1","rule":"a standing order the owner explicitly cancelled"}],
 "manner": [{"id":"p1","toward":"the other person's name","how":"how she is with them now, one plain line"}],
 "strain": [{"id":"p1","hole":"vagina|anus|throat","what":"sore|stretched|torn","by":"owner, or the id of whoever's cock it was"}],
 ${MARKS_SCHEMA}
}
agreements: record every standing instruction the owner gave in this turn about how she (or the whole household) is to address or treat the owner from now on, when she accepted it or did not refuse. Not one-off orders for this moment.
strain: when the prose puts something in one of her holes that was a tight fit or too big for her (HOW YOU FIT HER on her card, or another slave's cock), record what it did and whose it was: sore, stretched (it went in and she's looser for it), or torn (only if the prose shows her torn or bleeding). Nothing for a fit that was easy.
manner: record it when this turn settles how she is with a particular person other than the owner (another slave, or anyone else: a guest, a citizen, a trader), as something that will carry on: e.g. "subservient to him and nobody else; talks to him gently", "cold to her in front of others, sweet when they're alone". It counts when the prose shows it becoming how she is with them, and when the owner's own words say it ("and then she was subservient to him alone"). toward is that person's name as the prose gives it. It replaces whatever was kept for that person, so write the whole of how she is with them now, not only what changed. Not for a passing mood or one moment.
${MARKS_RULES}
Every id must be one given to you. Omit any key you have nothing for. Never record a new clause, exemption, amendment or technicality of a law as a fact, rumour or memory: laws are only what their text says.`;

/** How she is holding up, in the words the game would use. */
export function condition(p: Person): string {
  switch (band(p.psyche)) {
    case "broken": return "mindbroken in all but name; she does what she's told and nobody is behind it";
    case "fracturing": return "falling apart under the strain";
    case "clenched": return "badly stressed and scared";
    case "braced": return "tense and on guard";
    case "guarded": return "a little wary";
    case "settled": return "comfortable";
    default: return "happy and relaxed";
  }
}

/** ONE PERSON, AS THE NARRATOR NEEDS THEM. Everything here is a fact the engine can enforce. */
export function personCard(s: SaveState, p: Person, query = ""): string {
  const r = read(p, s.memory[p.id]);
  const mem = s.memory[p.id];
  const memories = mem ? recall(mem, query || p.assignment, 3, s.arcology.week) : [];
  const edge = getEdge(s.edges, p.id, "owner");

  const lines: string[] = [];
  lines.push(`### ${p.name}${p.surname ? " " + p.surname : ""} [${p.id}] — ${p.age}, ${p.origin.nationality}, ${p.pronouns}`);
  // WHO SHE IS NOW, AND WITH YOU, first: on a long card the middle gets lost, and these are what
  // make her her in this scene (engine/growth writes the first; the orders are yours).
  if (p.persona.signature) lines.push(`ONLY HER: ${p.persona.signature}`);
  if (p.persona.life_history) lines.push(`WHO SHE HAS BECOME HERE: ${p.persona.life_history}`);
  const power = powerBetween(s, p);
  if (power) lines.push(power);
  const ordersTop = agreementsBrief(s, p);
  if (ordersTop) lines.push(ordersTop);
  const now = p.body.appearance_now && !/^wearing\b/i.test(p.body.appearance_now) ? `Right now: ${p.body.appearance_now}. ` : "";
  lines.push(`BODY: ${p.body.appearance_facts} ${now}Wearing ${p.clothes}.`);
  lines.push(`BETWEEN HER LEGS (fact; never contradict it): ${describeGenitals(p)}`);
  lines.push(`ANATOMY (hard rule): ${anatomyLock(p)}`);
  lines.push(`ASS: ${assWord(p.body.butt)}${p.body.butt_implant ? " (implants)" : ""}; asshole ${anusWord(p.body.anus)}.`);
  lines.push(`FEET: ${describeFeet(p)}`);
  if (p.body.traits?.length || p.growing?.length) lines.push(`ALTERED (fact; these are real and part of her body): ${describeTraits(p)}`);
  const cut = surgeryPast(s, p);
  if (cut) lines.push(`SURGERY, DONE AND OVER (it's in the past; it comes up only if the scene is about it): ${cut}.`);
  const distinct = featuresLine(p);
  if (distinct) lines.push(distinct);
  if (p.womb.fetuses.length) lines.push(`PREGNANT: ${p.womb.weeks} weeks, ${p.womb.fetuses.length > 1 ? `${p.womb.fetuses.length} babies` : "one baby"}.`);
  if (p.body.lactation) lines.push(`LACTATING.`);
  if (p.health.health < -20) lines.push(`HEALTH: ill (${p.health.health}). ${p.health.injuries.filter((i) => !i.healed_week).map((i) => i.what).join("; ")}`);
  lines.push(`JOB: ${p.assignment}.`);
  lines.push(`BEFORE ENSLAVEMENT: ${p.origin.career}; ${p.origin.background}`);
  lines.push(`PERSONALITY: ${p.persona.core_traits.join("; ")}`);
  const v = p.persona.voice;
  lines.push(`TALKS LIKE: ${p.persona.speech_pattern}${v?.diction ? `. ${v.diction}` : ""}${v?.rhythm ? ` ${v.rhythm}` : ""}`);
  if (v?.tics?.length) lines.push(`NOW AND THEN SHE (once in a while, never in every reply, never twice in a scene): ${v.tics.join("; ")}.`);
  const talk = p.persona.exchanges ?? [];
  if (talk.length) lines.push(`AN ORDINARY EXCHANGE WITH HER (the plainness and length to aim for when you just talk; don't reuse these lines):\n${talk.map((x) => `You: "${x.you}"\n${p.name.split(" ")[0]}: "${x.her}"`).join("\n")}`);
  else if (v?.example_lines?.length) lines.push(`HOW SHE SOUNDS (for her voice only; never repeat these lines; how she may speak to you is under THE POWER BETWEEN YOU, and that wins): ${v.example_lines.slice(0, 3).map((l) => `"${l}"`).join(" / ")}`);
  if (p.persona.voice?.never_says?.length) lines.push(`NEVER SAYS: ${p.persona.voice.never_says.join("; ")}`);
  // Words, not scores: a number on the card turns up in her mouth as one.
  if (s.player.owned_by === p.id) lines.push(`HOW SHE FEELS ABOUT YOU: ${r.trust_label}${r.devotion > 40 ? ", and she's attached to you" : r.devotion < -15 ? ", and she has no love for you" : ""}. That is a feeling, not a manner: how she treats you is under HOW SHE KEEPS YOU, and attachment doesn't make her gentle unless that says so.`);
  else lines.push(`TOWARD YOU: ${r.label}, ${r.trust_label}.${r.fragility > 0.6 ? " Most of her obedience is fear." : ""}`);
  const orders = obeysLine(s, p);
  if (orders) lines.push(orders);
  lines.push(...characterLines(p));
  if (s.player.owned_by !== p.id || p.body.dick) { lines.push(...fitLines(s, p)); const hers = herFitLine(s, p); if (hers) lines.push(hers); }
  lines.push(`HOW SHE IS DOING: ${condition(p)}; mood ${p.psyche.mood}.${p.psyche.active_states.length ? ` On her mind: ${p.psyche.active_states.join(", ")}.` : ""}`);
  if (edge?.roles.length) lines.push(`ROLES: ${edge.roles.join(", ")}`);
  const room = roomLine(p);
  if (room) lines.push(room);
  const gov = governorLine(s, p);
  if (gov) lines.push(gov);
  if (p.persona.texture.length) lines.push(`LIKES AND DISLIKES: ${p.persona.texture.join("; ")}`);
  lines.push(...ownLifeLines(p));
  const between = deedsBrief(s, p.id);
  if (p.stains?.length) lines.push(`ON HER BODY RIGHT NOW (still there until it's washed off; anyone who sees her sees it): ${marksLine(s, p.stains)}.`);
  const carrying = today(s, p);
  if (carrying) lines.push(`TODAY SHE'S CARRYING (it colours her whole day, whatever happens in the scene): ${carrying}.`);
  // Two cocks in the same bed get compared, by both of them.
  const yours = playerBody(s).dick ?? 0, hers = p.body.dick ?? 0;
  if (yours > 0 && hers > 0 && Math.abs(hers - yours) >= 2) lines.push(`HERS AGAINST YOURS: her cock is ${dickWord(hers)} (about ${inches(dickCM(hers))}) and yours is ${dickWord(yours)} (about ${inches(dickCM(yours))}). Both of you know it, and it comes up.`);
  const ways = waysBrief(p);
  if (ways) lines.push(ways);
  const manner = mannerBrief(s, p);
  if (manner) lines.push(manner);
  if (between) lines.push(`BETWEEN YOU AND HER (these happened in earlier weeks and are over; she has not forgotten):\n${between}`);
  if (s.player.owned_by === p.id) lines.push(reignCard(s, p) || `SHE OWNS YOU: you gave yourself to her. She holds your collar and acts like it.`);
  else if (s.reign && theKeeper(s) && s.reign.keeper !== p.id) lines.push(householdUnderHer(s, p));
  const others = othersBrief(s, p);
  if (others) lines.push(others);
  const outside = tiedTo(s, p.id);
  const gone = { dead: "DEAD", ruined: "ruined", exiled: "driven out of the arcology", jailed: "locked up", bought: "bought off by the owner" };
  if (outside.length) lines.push(`PEOPLE IN HER LIFE OUTSIDE THE HOUSE: ${outside.map((x) => `${x.face.name}, ${x.what}${x.face.fate ? ` (${gone[x.face.fate.fate]} since week ${x.face.fate.week}: ${x.face.fate.how})` : record(s, x.face)}`).join(" / ")}`);

  lines.push(`SHE CALLS YOU: ${s.player.owned_by === p.id ? (s.reign?.your_name ?? "whatever she likes") : calledBy(s, p)}${s.player.owned_by === p.id ? "" : " (always this; never another title unless she is defying you)"}.`);
  if (memories.length) lines.push(`REMEMBERS: ${memories.map(memoryLine).join(" | ")}`);
  if (p.psyche.state !== "intact") lines.push(`She is ${p.psyche.state}${p.psyche.break_mode ? ` (${p.psyche.break_mode})` : ""}. Write her that way, not as fine.`);
  // Old soft wording in her background or memories would set the register; read her in plain words.
  return coarsen(lines.join("\n"));
}

/** THE WORLD, AS OF NOW. Rebuilt every turn; nothing accumulates. */
export function digest(s: SaveState, action = "", focus?: string): string {
  const arc = s.arcology;
  const present = s.scene.present.map((id) => s.people[id]).filter(Boolean) as Person[];
  const doctrines = Object.entries(arc.doctrines)
    .map(([id, st]) => `${DOCTRINE_BY_ID[id]?.noun ?? id} (${Math.round(st.adoption)}% adopted): ${DOCTRINE_BY_ID[id]?.creed ?? ""}`);

  const out: string[] = [];
  out.push(`## THE ARCOLOGY`);
  out.push(`${arc.name}, in ${arc.region}. Week ${arc.week}. Population ${arc.population}, prosperity ${Math.round(arc.prosperity)}, crime ${Math.round(arc.crime)}.`);
  out.push(`You own ${Math.round(arc.ownership)}% of it outright and hold ${arc.sectors.filter((x) => x.owner === "you").length} sectors.`);
  if (doctrines.length) out.push(`DOCTRINE — what your citizens have decided is normal:\n${doctrines.map((d) => `· ${d}`).join("\n")}`);
  else out.push(`DOCTRINE: none adopted yet.`);

  const norms = cultureBrief(s);
  if (norms) out.push(`HOW CITIZENS BEHAVE NOW — show it in passing when people are around:\n${norms}`);
  const laws = lawsBrief(s);
  if (laws) out.push(`LAWS IN FORCE (people obey these in every scene; when one applies to someone present, including a slave, show it happening, spelled out plainly: who does exactly what, to whom):\n${laws}`);

  const done = deedsBrief(s);
  if (done) out.push(`\n## WHAT YOU HAVE DONE — people remember these, and they shape how everyone treats you\n${done}`);
  if (s.canon.length) out.push(`\n## WORLD FACTS (always true)\n${s.canon.map((c) => `· ${c}`).join("\n")}`);
  if (s.retcons.length) out.push(`\n## RETCONNED — these never happened; never refer to them\n${s.retcons.filter((x) => x.kind !== "correction").map((x) => `· ${x.text}`).join("\n")}`);
  const corrections = s.retcons.filter((x) => x.kind === "correction");
  if (corrections.length) out.push(`\n## CORRECTIONS (these are true)\n${corrections.map((x) => `· ${x.text}`).join("\n")}`);

  // Ongoing situations, so a scene played during one happens inside it.
  const threads = threadBrief(s);
  if (threads) out.push(`\n## ${threads}`);

  const world = worldBrief(s);
  if (world) out.push(`\n## THE WORLD THIS WEEK (background; mention only if it bears on the action)\n${world}`);

  out.push(`\n## WHERE AND WHEN`);
  const room = placeOf(s);
  out.push(`${s.scene.time}. ${s.scene.location}${room.name === s.scene.location ? ` (${room.look}${room.privacy === "public" ? "; people about, who see what happens" : ""})` : ""}.`);
  out.push(`${ownerLine(s)} A slave's card can give her another name for the owner.`);
  out.push(selfBrief(s));
  const bots = sentinelsLine(s);
  if (bots) out.push(bots);
  const hers = reignBrief(s);
  if (hers) out.push(hers);
  const rules = houseRules(s);
  if (rules.length) out.push(`STANDING ORDERS TO THE WHOLE HOUSEHOLD (every slave keeps these without being reminded): ${rules.map((r) => r.rule).join("; ")}.`);
  out.push(rulesLine(s));
  const house = householdLine(s);
  if (house) out.push(house);
  if (s.scene.arrivals_pending.length) out.push(`ARRIVING — write them coming in: ${s.scene.arrivals_pending.map((id) => s.people[id]?.name).filter(Boolean).join(", ")}`);
  if (s.scene.departures_pending.length) out.push(`LEAVING — write them going: ${s.scene.departures_pending.map((d) => `${d.name} (${d.why})`).join(", ")}`);

  const focused = focus ? present.filter((p) => p.id === focus) : present;
  const others = focus ? present.filter((p) => p.id !== focus) : [];
  out.push(`\n## ${focus ? "THE SCENE IS ABOUT" : `PRESENT (${present.length})`}`);
  if (!present.length) out.push(`Nobody. The owner is alone.`);
  for (const p of focused) out.push(personCard(s, p, action));
  if (others.length) out.push(`\nALSO IN THE ROOM (leave them out unless the action involves them): ${others.map((p) => `${p.name} [${p.id}]`).join(", ")}`);

  const nearby = Object.values(s.people)
    .filter((p) => (p.status === "owned" || p.status === "indentured") && !s.scene.present.includes(p.id))
    .slice(0, 12);
  if (nearby.length) {
    out.push(`\n## ELSEWHERE IN THE ARCOLOGY (not in the room)`);
    out.push(nearby.map((p) => `· ${p.name} [${p.id}] — ${p.assignment}${p.facility ? `, ${arc.facilities[p.facility]?.name}` : ""}`).join("\n"));
  }

  const heard = dedupeLines(s.rumors.filter((r) => r.salience > 3 && !r.where).map((r) => `${r.content} (${r.truth})`)).slice(0, 4);
  if (heard.length) out.push(`\n## WHAT PEOPLE ARE SAYING\n${heard.map((r) => `· ${r}`).join("\n")}`);

  const corr = s.corrections;
  if (corr.filler || corr.maxim || corr.echo || corr.reprint || corr.stock) {
    out.push(`\n## LAST TURN YOU DID THIS. DO NOT DO IT AGAIN.`);
    if (corr.stock) out.push(`· You put a stock line in someone's mouth: "${corr.stock}". Nobody here talks like that.`);
    if (corr.filler) out.push(`· You used a stock gesture any character could have made: "${corr.filler}". Give her something that's hers instead: what she says, how she says it, what she does.`);
    if (corr.maxim) out.push(`· You wrote an aphorism instead of something a person would say: "${corr.maxim}"`);
    if (corr.echo) out.push(`· You handed the owner's own line back to them: "${corr.echo}"`);
    if (corr.reprint) out.push(`· You reprinted your own previous turn: "${corr.reprint}"`);
  }

  // Recent turns, with the ones that say the same thing collapsed: ten turns of "she served him"
  // are one line with a count, not ten lines the model reads every turn.
  const recent = s.history.slice(-Math.max(2, s.models.history_window));
  if (recent.length) {
    const last = recent.at(-1)!;
    // Each turn of the game is a week. A scene from a week that has ended is history, not where we are.
    const over = last.week < s.arcology.week;
    out.push(`\n## EARLIER (for continuity; do not repeat)${over ? `\nIt is week ${s.arcology.week} now. Everything below happened in earlier weeks and is over: don't pick it back up or start in the place it ended. Start from WHERE AND WHEN.` : ""}`);
    const older = dedupeLines(recent.slice(0, -1).map((h) => `[wk ${h.week}] ${h.summary}`));
    out.push(...older);
    out.push(`[wk ${last.week}] ${last.action ? `owner: ${last.action}\n` : ""}${last.summary}`);
  }
  return coarsen(out.join("\n"));
}

/** The bookkeeper reads a smaller document: the ids it may use, and what is currently true. */
export function bookkeeperContext(s: SaveState): string {
  const people = Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");
  return [
    `WEEK ${s.arcology.week}. ${s.scene.location}. Present: ${s.scene.present.join(", ") || "nobody"}.`,
    `PEOPLE YOU MAY REFERENCE:`,
    ...people.map((p) => {
      const d = p.romance?.dominion ?? -100;
      const power = s.player.owned_by === p.id ? "; she OWNS the owner now: the owner serves her"
        : d >= 40 ? `; she holds the power between them (dominion ${Math.round(d)}): the owner often serves her`
        : d >= 0 ? `; power between them is shared (dominion ${Math.round(d)})` : "";
      return `· ${p.id} = ${p.name}, ${p.assignment}, ${condition(p)}, devotion ${p.bond.read.devotion}, trust ${p.bond.read.trust}${power}`;
    }),
    `The owner is "owner", and is the "you" in the prose.${s.player.owned_by ? " The owner is collared: owned by the slave named above." : ""}`,
  ].join("\n");
}

/** The paragraph written over the weekly report. */
export const WEEK_SYSTEM = `You write one paragraph over an arcology's weekly report, for Free Cities, an adult game about owning an arcology. You are given what actually happened this week, most important first. Pick the two or three things that matter most and say how they connect: who it happened to, what it led to, what it means for next week. Second person, plain, the way someone who lives there would tell the owner over a drink. Name people. Four sentences at most. Never invent an event that is not in the list. Never recite the ledger or the numbers unless one of them is the story.

${PLAIN_RULES}`;

export const FORGE_SYSTEM = `You are fleshing out a slave for Free Cities, an adult text game about owning an arcology. Her body, age, nationality, career, how she was enslaved and her temperament are fixed; do not change them. Write her personality to fit, as one strict JSON object.

{
 "voice": {"diction":"...","syntax":"...","rhythm":"...","tics":["verbal habits only, e.g. 'trails off when she's unsure', 'counts things on her fingers'"],"never_says":["..."],"agenda":"what she usually wants out of a conversation","example_lines":["5 things she would actually say TO HER OWNER, as a slave, one each: nervous, upset, happy, turned on, and caught out or embarrassed. With her real stumbles and fillers, and her owner's title in them, the way the original game's slaves talk: \\"P-please, Master, I didn't mean to\\", \\"Thank you, Master\\". Upset comes out as pleading or a flat \\"Yes, Master\\", never back-talk"]},
 "core_traits": ["3 short plain personality traits, the way the game lists them: e.g. 'mouthy and quick to argue', 'lazy unless someone is watching', 'fiercely proud of her cooking'"],
 "texture": ["2 things she likes or can't stand"],
 "exchanges": [{"you":"something ordinary her new owner says, like \"How are you?\" or \"Come here.\"","her":"what she answers, one to three plain sentences, as herself, as a slave to her owner"}],
 "interests": ["${OWN_LIFE_ASK.interests}"],
 "goals": ["${OWN_LIFE_ASK.goals}"],
 "background": "3-4 plain sentences about her life before she was enslaved",
 "defining_memory": {"content":"one thing that happened to her, in her own words","charge":"warm|cold|sharp|bright","importance":8}
}

Write a specific, ordinary person from the place she actually comes from: a Ukrainian bookkeeper had a Ukrainian bookkeeper's life. Give her some grain: contradictions (kind to animals and a good liar; brave in a crisis and a coward about small things), a few things she's petty or proud about, and the friction her flaw makes (if she's arrogant she talks back; if she's devout she calls it sin). Not every slave is sweet: some are cold, some are sly, some are hard work. The three "exchanges" are ordinary moments with her new owner (he says something everyday, she answers in one to three plain sentences): they set how she sounds day to day, so make them hers and nobody else's. Give her a sense of humour or the lack of one, things she's petty about, how she gets things wrong, and how she sounds out loud: the particular words and habits that make her sound like her and nobody else (a phrase she reaches for, a word from her own language, how she names things), not generic fillers like "like", "honestly" or "I mean". She's a slave and she knows it: with her owner she speaks as one (by title, deferential, refusals as pleas); her swearing, her jokes and her temper are for the other girls and for herself. The words the way she'd say them, nothing literary or pretty (the narrator copies whatever wording it's given). No tragic boilerplate, no lines that sound like sayings.`;
