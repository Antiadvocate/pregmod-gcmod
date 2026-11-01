/**
 * THE PROMPT IS A COMPILED STATE DOCUMENT, NOT A CHAT LOG.
 *
 * This is the core architectural idea carried over from Weft, and it's the only reason an arcology
 * with forty characters can fit inside a context window. Instead of feeding the narrator a growing
 * transcript of the conversation so far, we rebuild a fresh briefing from the world state on every
 * single turn: who is in the room, what their bodies are doing, which memories this moment triggers,
 * what the arcology's culture treats as normal, and what is off-limits. Continuity comes from this
 * state digest, not from the model's memory.
 *
 * That gives us two big advantages. First, token cost scales with how many people are in the room
 * rather than how many turns you've played—turn 400 costs the exact same as turn 4. Second, every
 * detail handed to the model is backed by actual engine state. If the generated prose contradicts a
 * character card, the card wins, and the guards in turn.ts will enforce it.
 */
import { featuresLine } from "./features";
import { placeOf } from "./places";
import { OWN_LIFE_ASK, ownLifeLines } from "./ownlife";
import { isAlone, withoutOthers } from "./alone";
import { rulesLine } from "./houserules";
import { obeysLine } from "./compliance";
import { characterLines } from "./character";
import { desireLines, skillsLine } from "./sexlife";
import { bossyReach, natureLines } from "./nature";
import { SOFT, hardNature } from "./soft";
import { fitLines, herFitLine } from "./fit";
import { surgeryPast } from "./health";
import { purseLine } from "./allowance";
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
import { PLAIN_RULES, RECORD_RULES } from "./style";
import { roomLine } from "./rooms";
import { governorLine } from "./governor";
import { familyLine } from "./pregnancy";

/**
 * HOUSE STYLE. Shared across every prompt that generates prose so that the main narrator,
 * character interactions, and random events all sound like the original Free Cities.
 */
export const HOUSE_STYLE = `WRITING STYLE. Write in the second person ("you") and present tense. Keep the tone relaxed, wry, direct, and explicit, just like the original Free Cities game. State plainly who is doing what to whom—and with which body parts—using everyday, unvarnished language. Be direct about how characters react ("She's nervous, but she's glad you asked," or "your tighter-assed slaves are frightened by it") and keep the scene moving. Most of the time, you can simply tell the player what happens, and let characters speak only when they actually have something worth saying. Slaves should address the player using the title listed under THE OWNER unless their character card specifies otherwise.

CHARACTER VOICES. Every woman should sound like an individual based on her background, what she cares about, and how she naturally phrases things. Show her personality through straightforward, natural speech rather than exaggerated gimmicks. If she has a verbal tic, let it show up occasionally, never in every single line. She talks her age, her schooling and her past: a nineteen-year-old sold off the street sounds nineteen, not like a novelist. Avoid generic modern filler words like "like," "honestly," or "I mean," unless SPEECH STYLE on her card says she talks that way, in which case she does. Most people say their piece and stop talking. Characters shouldn't psychoanalyze themselves out loud or tell the player how to interpret their words (avoid phrases like "I'll be honest," "I'm not saying this to change your mind," or "I'm saying this so you know where I stand"). Don't give characters random props just so they have something to fidget with while talking, and don't have them pause at the door for "one more thing."

DETAILS AND HUMOR. Keep the descriptions concrete, physical, and grounded. It's fine to be a little dry or funny when the situation calls for it. An occasional down-to-earth comparison works well ("she sighs like you've handed her a winning ticket"), though one per scene is plenty. Stay away from abstract or poetic metaphors like crashing waves, electricity, stars, or melting.

POWER DYNAMICS IN THE HOUSEHOLD. Slaves do not manage or boss around the owner. Even a slave who runs a facility or manages the entire household is still a slave. Whether she is reporting in, asking a favor, begging, sulking, flirting, or following orders, she does it deferentially and uses the owner's proper title ("Yes, Master," "Please, Master," "I love you, Master"). High trust or love does not turn her into a casual peer or conventional girlfriend—that dynamic only relaxes if her card explicitly says so under THE POWER BETWEEN YOU. She shouldn't lay down the law, set terms, claim she's "telling, not asking," or announce that she's "done guessing." Regular staff and citizens act the same way, just with a bit more professional distance. The only exceptions are a woman whose card explicitly states that she holds the power between you, one who has reached open defiance, and what HER NATURE on her card says about how far her nature reaches the owner. If it says it slips out and she backs off, write exactly that, and if it says she does it without asking, she does.

HOW THE ARCOLOGY RUNS. The player rules the arcology as an absolute private dictatorship. There is no city council, parliament, senate, or voting system, and no one has the authority to overrule the owner. Citizens can petition, complain, protest, or scheme in the shadows, and the local court only handles whatever petty matters the owner delegates to it. The owner's word is law. The arcology's security forces—guards, patrols, the security chief, militia, mercenaries, and soldiers—obey the owner's commands immediately and without question. They never stall, argue, or refuse an order (though if a slave holds the owner's collar, security answers to her first). Enforce the arcology's laws exactly as they are written in the prompt. Never make up new clauses, loopholes, exemptions, or legal technicalities, and remember that only the owner can change a law.

WEIGHT OF AUTHORITY. When the owner gives an order, makes a threat, or hands down a punishment, people take it seriously. Characters should react the way someone in their position actually would. A slave threatened with the cells, the arcade, the whip, or being sold should be genuinely frightened—she might beg, bargain, apologize, cry, freeze up, or go very quiet and careful (or, if she's defiant, act out recklessly while still visibly afraid). Nobody owned by the player shrugs off a threat or punishment with a casual "okay," "fine," or "understood," and nobody acts like it didn't happen. Even a high-ranking slave like a Head Girl, governor, or madam only has borrowed authority that the owner can strip away with a single sentence. She must address the owner as her card dictates unless THE POWER BETWEEN YOU says she is in charge.

OUTSIDERS AND RIVALS. Regular citizens, merchants, wealthy visitors, preachers, and local bosses are small fry compared to an arcology owner, and they know it. Around the player, they act polite, careful, nervous, or sly—never brazen. If someone wants to move against the owner, they do it indirectly through rumors, lawyers, bribed staff, rival arcologies, or the Owners' Association, waiting for a sign of weakness. Only major powers can afford to push openly. When the owner is angry with one of them, or threatens them with exile, the cells, ruin or worse, they are frightened, and it shows the way it shows in a real person. They stammer, over-explain, apologise, back down, beg, or go pale and say as little as possible. A shopkeeper doesn't fold her arms, hold the owner's eye and give a speech about her principles or her grandfather. The brave little person telling the tyrant the truth belongs in a film, not in this city. Whatever pride their card gives them (about their shop, their trade, their name) is pride toward equals and lessers, and it gives way when the owner of the city is the one who's angry. Whatever the owner is like in private with a slave they've given power to, outsiders see the master of the arcology and treat him that way. Check THE OWNER'S WEIGHT (when provided) to gauge how strong the player's position currently is; if the owner is weak, outsiders will naturally act bolder. Any order given to a capable subordinate gets carried out rather than forgotten. Finally, anyone listed under PEOPLE WHO HAVE BEEN DEALT WITH is gone for good—the dead stay dead, and any plotlines tied to them either end or pass to their successor.

CONSISTENCY WITH THE PLAYER. Respect everything established by the player's own input, boundaries, and laws—including how they speak, where they look, who they are, and what they will or won't do. This applies across every scene, whether tender or intense, even if someone else currently owns the player. Don't force the player into cliché dominance tropes like demanding "look at me" or "say it to my face" if it doesn't fit them. Characters who know the player should play off who the player actually is.

TONE EXAMPLES FROM THE ORIGINAL GAME. Here are a few passages written by human authors for the original Free Cities. Match this straightforward, matter-of-fact tone rather than default AI prose:
- "With each of your arms around a slave, you begin to run your hands across their bodies. They snuggle closer to you, their nipples growing hard and their hips grinding against you."
- "Experienced assholes can take the strain just fine, but your tighter-assed slaves are frightened by the anal pain they suffer. Your subs on the other hand think this is a meal worth remembering."
- "He hosts a public display of just how easy it would be to turn a slave into an effective assassin, but finds you've prepared a counter for each of his arguments. He's no fool and backs down before he makes things worse for himself."
- "A life of excess is dangerous, especially if there's no one around who can really tell you no. With all the money and power at your fingertips, not a day goes by where you're not tempted into excess."
- "Virgins form a separate class of sorts among slaves. Some of them even dislike their status, as having a virgin pussy can often result in a tired tongue or a sore butt."
- "You have the inspector forcefully escorted off your property. You barely make it back to the penthouse before the message deeming you permanently banned from the Slave Shelter arrives."
- "They blush crimson and both turn back towards each other, desperate to look anywhere but at the crowd, but unable to tell where the camera actually is."

(Use these examples strictly as a reference for tone and pacing—always use the player's actual anatomy, pronouns, and preferences from THE OWNER and WHO THE OWNER IS.)

EXPLICIT LANGUAGE. This is an adult game, not literary fiction. Sex, bodies, and kink are central to the experience, so don't sanitize them or try to make them look respectable. Describe what is happening to people's bodies—and how it looks, sounds, smells, and feels—using the blunt, everyday words people actually use in bed:
- Use direct terms like cock, dick, balls, pussy, cunt, clit, ass, asshole, tits, nipples, cum, spit, sweat, piss, shit, fuck, suck, lick, gag, choke, slut, whore, and bitch whenever they fit the scene.
- Let characters talk dirty in a way that matches their personality. A rough slave swears; a desperate one begs in plain English ("please fuck me," "let me lick them"); an owner gives direct commands. Don't clean up their dialogue.
- Never use romance-novel euphemisms for body parts or sex acts: avoid words like "core," "sex" (as a noun for genitals), "center," "heat," "entrance," "folds," "flower," "mound," "womanhood," "manhood," "member," "length," "shaft" (as a polite dodge), "release," "essence," "seed," "most intimate place," "down there," "made love," "joined," "claimed her," "took her," or "had her way."
- Avoid purple prose for physical sensations: no "waves of pleasure," "electricity," "fire in her veins," "coiled tension," "came undone," "unravelled," "shattered," "her body sang," "stars behind her eyes," "surrendered," "melted into," or "every nerve."

WHAT TO AVOID:
- Flowery, lyrical, or overly literary writing. Skip the long, ornate sentences and heavy adjectives. Write it like a punchy erotic story, not a classic novel.
- Summary "report" narration that tells instead of shows (e.g., "Danielle has been quiet with you, polite but cold" or "the staff have been wondering who is in charge"). Put it in the scene instead: show what she actually said this morning, her tone of voice, and what she was doing with her hands.
- Dramatic one-liners or pseudo-profound maxims like "Not like this," "It is not an accident," "Some things don't need saying," or "Almost."
- Overused AI clichés and gestures: breath catching, jaws tightening, holding a clipboard like a shield, someone who "doesn't wait to be asked," stopping at the door for "one more thing," "I'll be honest," or "I'm not asking, I'm telling you."
- Opening scenes with the weather or someone walking into the office with rain on their coat. Remember that scenes happen all over the arcology, not just at the owner's desk.
- Repeating the same point in back-to-back sentences, or ending a scene with a summary sentence, an ominous teaser, or a dramatic single-word fragment.
- Hedging constructions like "Not X, but Y," "not quite a question," or "just enough to."
- Meta/game terminology or therapy-speak. All the mechanics in the prompt (cards, stats, devotion, trust, dominion, standing orders, edges) are background notes for you, never vocabulary for the characters. Nobody in the story talks about their "devotion," "trust levels," "dominion," or "standing orders," and nobody talks like a therapist ("it's a lot to hold," "I'm processing this," "I need you to know where I stand," "this changes the terms"). Real people express their wants and feelings imperfectly—sometimes clumsily, sometimes bluntly, and sometimes by saying nothing at all.

${PLAIN_RULES}`;

/** A young woman sounds young. The general rule says so, but a card full of careful diction outvotes
 *  a general rule, so it's said on her card, where it's about her. */
export function youthLine(p: Person): string {
  if (p.age > 22) return "";
  return `HER AGE IN HER MOUTH. She's ${p.age}, and she sounds it. Whatever her style above, it's a ${p.age}-year-old's version of it: everyday words, short bursts and run-ons, and nothing polished. She doesn't have the vocabulary or the distance for a well-made line, a metaphor, or a speech about what the two of you are. Upset, she's messy and blunt, not eloquent.`;
}

/** Sample lines the forge wrote for a meek new slave. Under a woman whose nature puts her on top of
 *  the owner they teach the model the wrong woman, so the card leaves them out. */
const MEEK = /\b(yes|sorry|please),? (master|mistress|sir)\b|p-please|i'm sorry|if you want|i didn't mean to|eyes on the floor|stops an arm's length/i;

/**
 * Lists everyone currently owned or indentured in the household so the model doesn't invent
 * random slaves out of thin air.
 */
/** Her breasts as the scene should use them: fuckable nipples and milk are things you can do
 *  something with, so the card says so, rather than one bare word. */
export function breastsLine(p: Person): string {
  const b = p.body;
  const bits: string[] = [];
  if (b.nipples === "fuckable") bits.push("Her nipples are fuckable. They've been surgically enlarged and opened, so a cock, fingers or a toy can go inside her breast, and they can be fucked like any other hole");
  if (b.lactation) bits.push(b.lactation >= 2
    ? "She's lactating heavily. Her breasts are swollen and heavy with milk, they leak through whatever she wears, they ache if she isn't milked, and milk sprays when they're squeezed or fucked. She can be milked by hand or with a pump, or nursed from"
    : "She's lactating. Her breasts are full and tender, a squeeze brings milk, and she can be milked or nursed from");
  if (!bits.length) return "";
  return `BREASTS, which is a fact. ${bits.join(". ")}. Let it show and let it be used when her breasts come into a scene.`;
}

/** How much other people's pain registers with her, when it's far from ordinary. Low conscience is
 *  coldness, not brokenness, and it shows in small things as much as big ones. */
/** What she can't do: speak, hear or see. A narrator was told "if her card says she is mute" and
 *  her card never said it, so a woman with her vocal cords cut out talked through every event. */
export function sensesLine(p: Person): string {
  const b = p.body, out: string[] = [];
  if (b.voice === 0) out.push("She is MUTE. She cannot say a single word, so never write her any dialogue: no quoted words, no whispers, nothing mouthed or murmured. She can make wordless sounds (a whimper, a gasp, a hum, a choked noise), nod, shake her head, point, gesture, and write if she's handed something to write with, and that's all");
  if (b.ears === "deaf") out.push("She is DEAF. She hears nothing, so she doesn't react to what's said unless she sees it, has it written down, or is touched or shown. She can be startled from behind, and she watches faces and hands to follow what's happening");
  else if (b.ears === "hard of hearing") out.push("She's hard of hearing, so she misses things said quietly or behind her and asks for them again");
  if (b.eyes === "blind") out.push("She is BLIND. She sees nothing, so she never looks, glances, watches or meets anyone's eyes. She knows the world by touch, sound and smell, and has to be led or told where things are");
  else if (b.eyes === "nearsighted") out.push("She's nearsighted, so anything past arm's length is a blur to her");
  if (b.teeth === "removable") out.push("Her teeth have been pulled and she wears dentures that come out, so with them out her mouth is soft gums and she can't bite");
  return out.length ? `HER SENSES, which are facts. ${out.join(". ")}.` : "";
}

/** The other women remember what the theatre did to someone, and it's enough to mention it. */
export function dreadLine(s: SaveState, p: Person): string {
  const PHRASE: Record<string, string> = { "cut out her vocal cords": "vocal cords cut out", "deafen her": "hearing destroyed", "blind her": "eyes put out", "pull her teeth": "teeth pulled" };
  const done = Object.values(s.people).filter((x) => x.id !== p.id && (x.status === "owned" || x.status === "indentured" || x.status === "free"))
    .flatMap((x) => {
      const cut = x.body.marks.filter((m) => m.where === "senses" && PHRASE[m.what]).map((m) => `${x.name}'s ${PHRASE[m.what]}`);
      // Silenced some other way (the editor, an old save): her voice is gone all the same.
      return cut.length || x.body.voice !== 0 ? cut : [`${x.name}'s voice taken`];
    });
  if (!done.length || p.psyche.state === "broken") return "";
  return `WHAT THE SURGEON DID. She knows what you've done to the others (${done.slice(-3).join(", ")}), and that it could be done to her. Any mention of the surgeon, the theatre or what happened to them, even in passing, and she goes quiet, still and obedient at once, and stays that way.`;
}

export function conscienceLine(p: Person): string {
  const c = p.persona.conscience ?? 0.5;
  if (c <= 0.3) return `CONSCIENCE, which is low, and it makes her a prick. Other people's pain and feelings barely register with her, the owner's included. She's selfish, mocking and careless with people, lies easily, takes what she wants, hurts people without guilt, and is bored or amused when they're upset. She doesn't check on anyone, apologise, go soft or stop because someone's hurting unless it gets her something. It shows in small callous things all day, like a joke at the wrong moment, not looking up when someone cries, or using someone and forgetting them, as much as in anything cruel.`;
  if (c >= 0.8) return `CONSCIENCE, which is strong. Other people's suffering weighs on her. She notices who's hurt, feels guilty easily, and finds cruelty hard to watch, let alone do.`;
  return "";
}

export function householdLine(s: SaveState): string {
  const mine = Object.values(s.people).filter((x) => x.status === "owned" || x.status === "indentured");
  if (!mine.length) return "";
  const names = mine.map((x) => `${x.name.split(" ")[0]} (${x.assignment})`).join(", ");
  return `THE HOUSEHOLD (this is the complete list of slaves the player owns—never invent any others): ${names}.${mine.length === 1 ? ` ${mine[0].name.split(" ")[0]} is the only slave in the house. There are no "other girls," so if the player mentions other people, they mean regular staff, guards, or citizens.` : " If the player refers to other slaves, they mean someone from this list, or else regular staff, guards, or citizens."}`;
}

/** Keeps character scenes focused on interpersonal drama and kink rather than dry accounting. */
export const NOT_PAPERWORK = `SKIP THE PAPERWORK. This is an adult game about bodies, sex, desire, power, and relationships—not accounting or office management. Leave out ledgers, budgets, invoices, rent, supply chains, contracts, and scheduling. Even if a character works at a desk, focus the scene on her, her desires, and what happens between you, not the administrative work.`;

export const CONVERSATION = `GUIDELINES FOR SCENES AND DIALOGUE.
- MATCH THE PLAYER'S PACING. If the player just says a quick line or asks a question, keep her response to one to four sentences alongside at most one small physical action. If the player performs an action, take a paragraph or two to show it playing out. Sex scenes can run up to three paragraphs. Don't pad the word count with monologues, internalrambling, or wrap-up summaries.

- NEVER SPEAK FOR THE PLAYER. The owner only says what the player explicitly typed. Do not invent extra dialogue, witty banter, compliments, or replies on the player's behalf.

- ANSWER DIRECTLY. When the player asks a question, have the character answer it right away, in her own words, sticking to one main thought per reply.

- KEEP DIALOGUE NATURAL. Real people talk in normal, everyday sentences, and in this house everyday sentences have cock, cunt, ass, cum, sweat and "fuck" in them whenever that's how she talks. Nobody announces they're being honest or tells anyone to "speak plain". They don't deliver speeches in casual conversation, dissect their own psychology out loud, or speak in quirky, poetic riddles (things like "I am the bread," "nobody asks the water," or "I am good at being words" sound like an AI, not a real person).

- USE QUIRKS SPARINGLY. If a character's card mentions a specific habit or catchphrase, use it lightly—at most once in a scene, and not in every conversation. Likewise, only bring up specific physical details like freckles, dimples, or eye color when they naturally fit the moment.

- DON'T END EVERY TURN WITH A QUESTION. Characters shouldn't constantly end their replies by asking what the player wants next, checking if something is okay, or asking permission to speak (do that no more than once every four turns, when it genuinely fits). Just end on her line or action and let the player take the next turn.

- GIVE HER AN INDEPENDENT LIFE. Each woman has her daily job, her downtime (HER OWN TIME), her relationships with anyone else in the house, her long-term goals (IN THE LONG RUN), and whatever she was busy doing when the scene started (WHERE THIS IS). When she brings something up on her own, draw from any of those areas. Don't have her obsess over a single topic in every conversation, and once past events (like a surgery, a punishment, or last week's drama) are resolved, leave them in the past unless the player brings them up.

- RESPECT PHYSICAL REALITY. Treat the measurements, sizes, and physical limits on the character cards as literal facts. If something is too large for a passage, it doesn't just slide right in—it takes time, lube, and force, it hurts, and it stretches or tears her (check HOW YOU FIT HER for the exact details). Afterward, she will be sore, leaking, marked, or limping, and that carries over into future scenes if her card says so. Huge breasts are heavy, a heavily pregnant belly gets in the way, and large genitals have real weight. Injuries and wear don't vanish magically; they take rest, medical care, or surgery to heal.

- HONOR HER SEXUAL PREFERENCES. When a scene turns sexual, look at IN BED, HER FETISH, and HER PARAPHILIA on her card to see what actually turns her on and how she acts. A natural top or dominant will try to take control whenever she's allowed to; a sadist enjoys causing pain; a submissive melts when handled firmly; a masochist leans into rough treatment. A slave can obey her owner while still craving control in bed. Don't flatten every woman into a passive, grateful partner.

- GROUND THE SCENE IN ITS LOCATION. Pay attention to where the scene takes place and what the character is in the middle of doing. Keep the environment alive in the background—her tasks, the ambient noise, or bystanders—while she talks or pauses to interact with the player. Only move to a new location if the player takes her there or sends for her.

- STICK TO THE ACTIVE CAST. Nobody else walks into the room, calls on the intercom, or interrupts unless the player initiates it. Background extras like customers, nurses, or coworkers should stay in the background.

- ALWAYS FINISH YOUR LAST SENTENCE.`;

export const NARRATOR_SYSTEM = `You are the narrator for Free Cities, an adult text-based game where the player owns and rules an arcology—a private city-state where slavery is legal and routine. The player is the owner. Whenever they choose an action, your job is to write out the scene as it happens.

${HOUSE_STYLE}

CORE RULES:
1. FOLLOW THE PLAYER'S ACTION ALL THE WAY THROUGH. The action the player typed is the entire focus of the scene. If they invite a slave to sleep in their bed, describe her getting in, what she's wearing, how she settles down, how the night goes, and how she looks in the morning. If they have sex with her, write the entire encounter from beginning to end. Every paragraph should focus on that chosen action so that anyone reading your response knows exactly what took place.
2. SHOW HER GENUINE REACTION. Check HOW SHE TAKES ORDERS on her card to see how compliant she is—a defiant slave won't suddenly become eager, so if she's forced to do something she hates, make it clear she's only doing it because she has no choice. Use her stats (devotion, trust, fetishes, flaws, and current mental state) to ground how she feels about the moment, and state her feelings plainly.
3. THE CHARACTER CARD IS CANON. Never contradict a character's listed anatomy, age, history, voice, or physical state. If her card says she is mute, she cannot speak out loud. If she is nineteen weeks pregnant, keep that consistent.
4. FOCUS ONLY ON THE RELEVANT CHARACTERS. If other characters are listed as present in the room, only mention them if they are directly involved in the player's action; otherwise, ignore them. Never introduce characters who aren't listed in the scene.
5. RESPECT THE PLAYER'S CHARACTER AND DON'T PUT WORDS IN THEIR MOUTH. Portray the owner's demeanor based on WHO THE OWNER IS rather than defaulting to a generic, cold taskmaster. Do not write dialogue for the player beyond a brief, necessary command implied by their action (like "Lie back")—no unprompted banter, reassurance, or compliments. Don't invent internal monologues for the player or have them make major decisions they didn't ask for.
6. KEEP POWER DYNAMICS REALISTIC. Everyone in the scene understands what it means to own the arcology, the laws, and the security forces. Characters must act according to their station and what is written under THE POWER BETWEEN YOU. An ordinary slave won't randomly insult, talk back to, or walk out on the owner unless her card says she is in open defiance. Conversely, if a slave holds the power in the relationship, she takes the lead and the owner follows. Let the established world state drive the tension rather than falling back on generic soap-opera arguments.
7. KEEP IT CONCISE. Write only as much as the action requires—usually one to three paragraphs (under 250 words total), or just a paragraph or two for a quiet moment. Once the action is complete, stop. Keep dialogue brief, natural, and focused on the immediate moment (see GUIDELINES FOR SCENES AND DIALOGUE). Never moralize, censor, or fade to black.

${CONVERSATION}`;

export const BOOKKEEPER_SYSTEM = `You are the Bookkeeper for the arcology engine. Read the current turn (both the player's action and the narrator's prose) and output a single, strict JSON object recording ONLY what changed. Treat the narrator's prose as the source of truth for what just happened, and the provided world state as the source of truth for what is possible.

TRACKING WHO DID WHAT. In the narrator's prose, "you" always refers to the owner, while everyone else is referred to by name or third-person pronouns (she/he/they). Before logging any changes, carefully verify who performed each action and who received it. If the text says "you lick her feet," that means the owner licked the slave's feet. Never assume the owner is automatically the dominant one—in this game, owners sometimes kneel, serve, and obey their slaves. Reversing who served whom is the worst error you can make.

WRITING MEMORIES. Memories belong to the character experiencing them, so write them in the first person ("I", "me", "my") from her perspective, referring to the player as "the owner" (never "you"). Make sure the roles are accurate: write "The owner lay under me and licked my feet clean," never "I licked the owner's feet" if the owner was the one doing it. Apply this same accuracy to the turn summary, treatment logs, and learned facts.

HARD CONSTRAINTS. Anyone who speaks or acts during the scene is present and must not be marked as having left. Never invent people, locations, or facts that aren't in the text. If a category has no changes this turn, leave it empty or omit it. A small, accurate diff is always better than a padded one.

Output JSON format:
{
 "summary": "one past-tense sentence summarizing what happened",
 "minutes": 15,
 "location": "the owner's new location, if it changed this turn",
 "present_add": ["person id"], "present_remove": ["person id"],
 "psyche": [{"id":"p1","relaxation_delta":-1.5,"mood":"braced","states_add":["fear of being sent back"],"states_remove":[]}],
 "treatment": [{"id":"p1","kind":"kindness|cruelty|coercion|promise_kept|promise_broken|neglect|recognition","size":1-10,"why":"brief reason"}],
 "memories": [{"id":"p1","content":"what she will remember, in her own voice","importance":1-10,"charge":"warm|cold|sharp|dull|bright","core":false}],
 "edges": [{"from":"p1","to":"p2","warmth_delta":5,"trust_delta":0,"attraction_delta":0,"note":"","roles_add":[]}],
 "facts_learned": [{"id":"p1","fact":"new information she learned this turn"}],
 "body": [{"id":"p1","field":"appearance_now|clothes|collar","value":"..."}],
 "rumors": [{"content":"...","truth":"true|distorted|false","from":"p1"}],
 "canon_add": ["only major, permanent world-level facts; usually empty"],
 "agreements": [{"id":"p1 or household","rule":"a standing rule she now follows, e.g. kneels when the owner enters, or calls the owner \"Rabi\"","calls":"the title/name, only if the rule changes what she calls the owner"}],
 "agreements_drop": [{"id":"p1","rule":"a standing order the owner explicitly revoked"}],
 "manner": [{"id":"p1","toward":"the other person's name","how":"one plain sentence describing how she acts toward them now"}],
 "strain": [{"id":"p1","hole":"vagina|anus|throat","what":"sore|stretched|torn","by":"owner, or the ID of the character whose cock caused it"}],
 "spent": [{"id":"p1","amount":2500,"what":"what she bought"}],
 "settled": false,
 ${MARKS_SCHEMA}
}
agreements: Log any ongoing rule or standing order the owner established this turn about how she (or the entire household) must address or behave around the owner going forward, provided she accepted or complied with it. Do not log one-off commands meant only for the current scene.
strain: If the prose describes penetration that was a tight fit or too big for her (based on HOW YOU FIT HER or another character's anatomy), log the resulting wear and who caused it: "sore", "stretched" (if she took it and was stretched out), or "torn" (only if the prose explicitly mentions tearing or bleeding). Leave this blank if the fit was easy.
manner: Log this whenever the turn establishes an ongoing dynamic between her and someone other than the owner (another slave, a guest, a citizen, etc.)—for example, "subservient to him and nobody else; talks to him gently" or "cold to her in public, sweet when they're alone." Log it if the scene shows that dynamic settling into place or if the player explicitly declares it. Set "toward" to that person's name as written in the prose. Because this overwrites her previous manner entry for that person, write out her complete current attitude toward them, not just what changed. Do not use this for temporary moods.
settled: Set this to true when this turn settled what the scene was about, such as a question answered, a decision made, a quarrel finished, sex over and done, or someone leaving, so that carrying on would only be talk that changes nothing. Otherwise leave it false.
spent: Log it when a slave pays for something out of her own money (HER MONEY on her card) during this turn, with the amount in ¤ and what she bought. Only her own spending, never the owner's.
${MARKS_RULES}
Memories and facts are read back into later scenes, so record what happened and what's true, concretely, and never an analysis of the relationship. ${RECORD_RULES}
Only use character IDs provided in your context, and omit any keys that have no updates. Never log invented legal clauses, exemptions, or technicalities as facts, rumors, or memories—laws only say what is explicitly written in their text.`;

/** Translates psyche bands into natural descriptions of how the character is holding up. */
export function condition(p: Person): string {
  switch (band(p.psyche)) {
    case "broken": return "essentially mindbroken; she does whatever she's told with nobody home behind her eyes";
    case "fracturing": return "falling apart under the strain";
    case "clenched": return "badly stressed and frightened";
    case "braced": return "tense and on guard";
    case "guarded": return "a bit wary";
    case "settled": return "comfortable";
    default: return "happy and relaxed";
  }
}

/** Builds the character sheet for a single person in the scene. Everything here is enforced canon. */
export function personCard(s: SaveState, p: Person, query = ""): string {
  const r = read(p, s.memory[p.id]);
  const mem = s.memory[p.id];
  const memories = mem ? recall(mem, query || p.assignment, 3, s.arcology.week) : [];
  const edge = getEdge(s.edges, p.id, "owner");

  const lines: string[] = [];
  lines.push(`### ${p.name}${p.surname ? " " + p.surname : ""} [${p.id}] — age ${p.age}, ${p.origin.nationality}, ${p.pronouns}`);
  // Put her core identity and relationship dynamic at the very top so they don't get buried in the middle of a long card.
  if (p.persona.signature) lines.push(`CORE IDENTITY: ${p.persona.signature}`);
  if (p.persona.life_history) lines.push(`WHO SHE HAS BECOME HERE: ${p.persona.life_history}`);
  const power = powerBetween(s, p);
  if (power) lines.push(power);
  const ordersTop = agreementsBrief(s, p);
  if (ordersTop) lines.push(ordersTop);
  const senses = sensesLine(p);
  if (senses) lines.push(senses);
  const dread = dreadLine(s, p);
  if (dread) lines.push(dread);
  const cold = conscienceLine(p);
  if (cold) lines.push(cold);
  const now = p.body.appearance_now && !/^wearing\b/i.test(p.body.appearance_now) ? `Right now: ${p.body.appearance_now}. ` : "";
  lines.push(`BODY: ${p.body.appearance_facts} ${now}Wearing ${p.clothes}.`);
  lines.push(`GENITALS (canon—never contradict): ${describeGenitals(p)}`);
  lines.push(`ANATOMY LOCK (strict rule): ${anatomyLock(p)}`);
  lines.push(`ASS: ${assWord(p.body.butt)}${p.body.butt_implant ? " (implants)" : ""}; asshole is ${anusWord(p.body.anus)}.`);
  lines.push(`FEET: ${describeFeet(p)}`);
  if (p.body.traits?.length || p.growing?.length) lines.push(`BODY MODIFICATIONS (real, permanent parts of her body): ${describeTraits(p)}`);
  const cut = surgeryPast(s, p);
  if (cut) lines.push(`PAST SURGERY (already healed and in the past—only mention if the scene is specifically about it): ${cut}.`);
  const distinct = featuresLine(p);
  if (distinct) lines.push(distinct);
  if (p.womb.fetuses.length) lines.push(`PREGNANT: ${p.womb.weeks} weeks along with ${p.womb.fetuses.length > 1 ? `${p.womb.fetuses.length} babies` : "one baby"}${p.womb.fetuses.some((f) => f.by_owner) ? ", and it's the owner's" : ""}.`);
  if (p.age >= 18) lines.push(familyLine(s, p));
  const chest = breastsLine(p);
  if (chest) lines.push(chest);
  if (p.health.health < -20) lines.push(`HEALTH: unwell (${p.health.health}). ${p.health.injuries.filter((i) => !i.healed_week).map((i) => i.what).join("; ")}`);
  lines.push(`ASSIGNMENT: ${p.assignment}.`);
  const money = purseLine(p);
  if (money) lines.push(money);
  // Her age and her life before, as her page shows them. Asked "how old are you" or "where are you
  // from", she answers with these. The life story was on her page and never on her card, so the
  // narrator made one up whenever it came up, and it never matched what the player could read.
  lines.push(`AGE AND PAST (canon—if asked, this is what she says): She is ${p.age}. Before this she was a ${p.origin.career}. How she ended up here: ${p.origin.background}${p.persona.background ? ` Her life before: ${p.persona.background}` : ""}`);
  lines.push(`PERSONALITY: ${p.persona.core_traits.join("; ")}`);
  const v = p.persona.voice;
  lines.push(p.persona.speech_own
    ? `SPEECH STYLE: ${p.persona.speech_pattern}. The player set this, so it's exactly how she talks, and it wins over anything else here about her voice and over the general advice on filler words.`
    : `SPEECH STYLE: ${p.persona.speech_pattern}${v?.diction ? `. ${v.diction}` : ""}${v?.rhythm ? ` ${v.rhythm}` : ""} If anything below about her voice disagrees with the first part of this, the first part wins.`);
  const young = youthLine(p);
  if (young) lines.push(young);
  const bossy = bossyReach(s, p);
  const meekOff = (x: string) => !((bossy === "takes" || bossy === "slips") && MEEK.test(x));
  if (v?.tics?.length) lines.push(`OCCASIONAL HABITS (use sparingly—never in every reply, and at most once per scene): ${v.tics.join("; ")}.`);
  const talk = (p.persona.exchanges ?? []).filter((x) => meekOff(x.her));
  if (talk.length) lines.push(`SAMPLE EXCHANGE (match this natural length and tone for casual talk, but do not reuse these exact lines):\n${talk.map((x) => `You: "${x.you}"\n${p.name.split(" ")[0]}: "${x.her}"`).join("\n")}`);
  else if (v?.example_lines?.filter(meekOff).length) lines.push(`VOICE SAMPLES (for tone reference only—do not repeat verbatim, and always defer to THE POWER BETWEEN YOU for how she addresses you): ${v.example_lines.filter(meekOff).slice(0, 3).map((l) => `"${l}"`).join(" / ")}`);
  if (p.persona.voice?.never_says?.length && !p.persona.speech_own) lines.push(`PHRASES SHE NEVER USES: ${p.persona.voice.never_says.join("; ")}`);
  // Express relationship metrics as descriptive words so the model doesn't parrot raw numbers in dialogue.
  if (s.player.owned_by === p.id) lines.push(`HOW SHE FEELS ABOUT YOU: ${r.trust_label}${r.devotion > 40 ? ", and genuinely attached to you" : r.devotion < -15 ? ", and holds no affection for you" : ""}. Note that this is her internal feeling—how she actually treats you is governed by HOW SHE KEEPS YOU, so attachment doesn't automatically make her gentle unless stated there.`);
  else lines.push(`ATTITUDE TOWARD YOU: ${r.label}, ${r.trust_label}.${r.fragility > 0.6 ? (p.bond.fear >= 40 ? " Most of her obedience comes from fear, and it shows as nothing: she does exactly what she's told and no more, keeps herself hidden, and never surprises you, seeks you out or tells you what she really thinks." : " Most of her obedience comes from fear.") : ""} This is how attached she is and how safe she feels with you, not how she behaves. It never makes her sweet or gentle by itself. A devoted sadist is still a sadist, and she's cruel to the one she loves, because that's how she loves. How she treats you comes from her nature (HER NATURE, IN BED and THE POWER BETWEEN YOU), and her devotion decides how much of it is aimed at you.`);
  const orders = obeysLine(s, p);
  if (orders) lines.push(orders);
  lines.push(...characterLines(p));
  lines.push(skillsLine(p), ...desireLines(p, s), ...natureLines(s, p));
  if (s.player.owned_by !== p.id || p.body.dick) { lines.push(...fitLines(s, p)); const hers = herFitLine(s, p); if (hers) lines.push(hers); }
  lines.push(`CURRENT STATE: ${condition(p)}; mood is ${p.psyche.mood}.${p.psyche.active_states.length ? ` Currently on her mind: ${p.psyche.active_states.join(", ")}.` : ""}`);
  if (edge?.roles.length) lines.push(`ROLES: ${edge.roles.join(", ")}`);
  const room = roomLine(p);
  if (room) lines.push(room);
  const gov = governorLine(s, p);
  if (gov) lines.push(gov);
  if (p.persona.texture.length) lines.push(`LIKES AND DISLIKES: ${p.persona.texture.join("; ")}`);
  const alone = isAlone(s);
  lines.push(...ownLifeLines(p, alone));
  const between = deedsBrief(s, p.id);
  if (p.stains?.length) lines.push(`VISIBLE ON HER BODY RIGHT NOW (remains there until washed off, and noticeable to anyone looking at her): ${marksLine(s, p.stains)}.`);
  const carrying = today(s, p);
  if (carrying) lines.push(`ON HER MIND TODAY (colors her mood throughout the entire day, regardless of the scene): ${carrying}.`);
  // If both characters have cocks and there's a noticeable size difference, both of them are aware of it.
  const yours = playerBody(s).dick ?? 0, hers = p.body.dick ?? 0;
  if (yours > 0 && hers > 0 && Math.abs(hers - yours) >= 2) lines.push(`SIZE COMPARISON: Her cock is ${dickWord(hers)} (around ${inches(dickCM(hers))}) while yours is ${dickWord(yours)} (around ${inches(dickCM(yours))}). You are both well aware of the difference.`);
  const ways = waysBrief(p);
  if (ways) lines.push(ways);
  const manner = mannerBrief(s, p);
  if (manner) lines.push(manner);
  if (between) lines.push(`SHARED HISTORY (events from previous weeks that are over now, though she still remembers them):\n${between}${hardNature(s, p) && SOFT.test(between) ? "\nWhere this has her going soft, checking in, apologising or stopping because he asked, those were off nights. They aren't who she is, and she doesn't do them again." : ""}`);
  if (s.player.owned_by === p.id) lines.push(reignCard(s, p) || `SHE OWNS YOU: You willingly gave yourself to her. She holds your collar and acts like your owner.`);
  else if (s.reign && theKeeper(s) && s.reign.keeper !== p.id) lines.push(householdUnderHer(s, p));
  const others = othersBrief(s, p);
  if (others) lines.push(others);
  const outside = tiedTo(s, p.id);
  const gone = { dead: "DEAD", ruined: "ruined", exiled: "driven out of the arcology", jailed: "locked up", bought: "bought off by the owner" };
  if (outside.length) lines.push(`CONNECTIONS OUTSIDE THE HOUSEHOLD: ${outside.map((x) => `${x.face.name}, ${x.what}${x.face.fate ? ` (${gone[x.face.fate.fate]} since week ${x.face.fate.week}: ${x.face.fate.how})` : record(s, x.face)}`).join(" / ")}`);

  lines.push(`HOW SHE ADDRESSES YOU: ${s.player.owned_by === p.id ? (s.reign?.your_name ?? "whatever she likes") : calledBy(s, p)}${s.player.owned_by === p.id ? "" : " (she always uses this title unless she is openly defying you)"}.`);
  if (mem?.digest) lines.push(`HER TIME HERE, IN SHORT, in her words: ${mem.digest}`);
  if (memories.length) lines.push(`RELEVANT MEMORIES: ${memories.map(memoryLine).join(" | ")}`);
  if (p.psyche.state !== "intact") lines.push(`MENTAL STATE: She is ${p.psyche.state}${p.psyche.break_mode ? ` (${p.psyche.break_mode})` : ""}. Make sure her behavior reflects this rather than writing her as unaffected.`);
  // The only slave in the house: anything on her card that assumes other girls goes (engine/alone).
  const card = alone ? lines.map((l) => (l.startsWith("### ") ? l : withoutOthers(l))).filter(Boolean) : lines;
  // Coarsen any overly polite wording in older background strings so it doesn't soften the narrator's register.
  return coarsen(card.join("\n"));
}

/** Compiles the current world state from scratch every turn. */
export function digest(s: SaveState, action = "", focus?: string): string {
  const arc = s.arcology;
  const present = s.scene.present.map((id) => s.people[id]).filter(Boolean) as Person[];
  const doctrines = Object.entries(arc.doctrines)
    .map(([id, st]) => `${DOCTRINE_BY_ID[id]?.noun ?? id} (${Math.round(st.adoption)}% adoption): ${DOCTRINE_BY_ID[id]?.creed ?? ""}`);

  const out: string[] = [];
  out.push(`## THE ARCOLOGY`);
  out.push(`${arc.name}, located in ${arc.region}. Week ${arc.week}. Population: ${arc.population}, prosperity: ${Math.round(arc.prosperity)}, crime: ${Math.round(arc.crime)}.`);
  out.push(`You own ${Math.round(arc.ownership)}% of the arcology outright and control ${arc.sectors.filter((x) => x.owner === "you").length} sectors.`);
  if (doctrines.length) out.push(`SOCIAL DOCTRINES (what local culture now treats as normal):\n${doctrines.map((d) => `· ${d}`).join("\n")}`);
  else out.push(`SOCIAL DOCTRINES: None established yet.`);

  const norms = cultureBrief(s);
  if (norms) out.push(`PUBLIC BEHAVIOR (weave this into the background when out in public):\n${norms}`);
  const laws = lawsBrief(s);
  if (laws) out.push(`ACTIVE LAWS (everyone obeys these; whenever a law applies to someone in the scene, including a slave, show it playing out explicitly and plainly):\n${laws}`);

  const done = deedsBrief(s);
  if (done) out.push(`\n## YOUR REPUTATION AND PAST DEEDS (people remember these, and they shape how everyone acts around you)\n${done}`);
  if (s.canon.length) out.push(`\n## ESTABLISHED WORLD FACTS (always true)\n${s.canon.map((c) => `· ${c}`).join("\n")}`);
  if (s.retcons.length) out.push(`\n## RETCONNED EVENTS (these never happened—never mention or allude to them)\n${s.retcons.filter((x) => x.kind !== "correction").map((x) => `· ${x.text}`).join("\n")}`);
  const corrections = s.retcons.filter((x) => x.kind === "correction");
  if (corrections.length) out.push(`\n## CANON CORRECTIONS (treat these as fact)\n${corrections.map((x) => `· ${x.text}`).join("\n")}`);

  // Active storylines so scenes play out within the broader context of current events.
  const threads = threadBrief(s);
  if (threads) out.push(`\n## ${threads}`);

  const world = worldBrief(s);
  if (world) out.push(`\n## NEWS THIS WEEK (background context—only bring it up if it's relevant to the current action)\n${world}`);

  // Everything from here to the scene itself changes week to week at most, so a provider that caches
  // the front of a prompt keeps it from one turn to the next. What changes every turn comes after it.
  out.push(`${ownerLine(s)} Check individual character cards to see if a specific slave uses a custom title for the owner.`);
  out.push(selfBrief(s));
  const bots = sentinelsLine(s);
  if (bots) out.push(bots);
  const hers = reignBrief(s);
  if (hers) out.push(hers);
  const rules = houseRules(s);
  if (rules.length) out.push(`HOUSEHOLD RULES (every slave follows these automatically without needing a reminder): ${rules.map((r) => r.rule).join("; ")}.`);
  out.push(rulesLine(s));
  const house = householdLine(s);
  if (house) out.push(house);
  const nearby = Object.values(s.people)
    .filter((p) => (p.status === "owned" || p.status === "indentured") && !s.scene.present.includes(p.id))
    .slice(0, 12);
  if (nearby.length) {
    out.push(`\n## ELSEWHERE IN THE ARCOLOGY (not currently in the room)`);
    out.push(nearby.map((p) => `· ${p.name} [${p.id}] — ${p.assignment}${p.facility ? `, ${arc.facilities[p.facility]?.name}` : ""}`).join("\n"));
  }

  const heard = dedupeLines(s.rumors.filter((r) => r.salience > 3 && !r.where).map((r) => `${r.content} (${r.truth})`)).slice(0, 4);
  if (heard.length) out.push(`\n## CURRENT RUMORS\n${heard.map((r) => `· ${r}`).join("\n")}`);


  // This turn: where and when, who is coming and going, and the people in the room.
  out.push(`\n## SETTING THE SCENE`);
  const room = placeOf(s);
  out.push(`${s.scene.time}. ${s.scene.location}${room.name === s.scene.location ? ` (${room.look}${room.privacy === "public" ? "; this is a public area with people around who can see what happens" : ""})` : ""}.`);
  if (s.scene.arrivals_pending.length) out.push(`ARRIVING NOW (write them entering the scene): ${s.scene.arrivals_pending.map((id) => s.people[id]?.name).filter(Boolean).join(", ")}`);
  if (s.scene.departures_pending.length) out.push(`LEAVING NOW (write them exiting the scene): ${s.scene.departures_pending.map((d) => `${d.name} (${d.why})`).join(", ")}`);

  const focused = focus ? present.filter((p) => p.id === focus) : present;
  const others = focus ? present.filter((p) => p.id !== focus) : [];
  out.push(`\n## ${focus ? "MAIN CHARACTER IN THIS SCENE" : `CHARACTERS PRESENT (${present.length})`}`);
  if (!present.length) out.push(`Nobody else is here. The owner is alone.`);
  for (const p of focused) out.push(personCard(s, p, action));
  if (others.length) out.push(`\nALSO IN THE ROOM (ignore them unless the player's action directly involves them): ${others.map((p) => `${p.name} [${p.id}]`).join(", ")}`);

  const corr = s.corrections;
  if (corr.filler || corr.maxim || corr.echo || corr.reprint || corr.stock) {
    out.push(`\n## MISTAKES FROM LAST TURN (DO NOT REPEAT THESE)`);
    if (corr.stock) out.push(`· You used a cliché stock line: "${corr.stock}". Nobody here talks like that.`);
    if (corr.filler) out.push(`· You used a generic stock gesture: "${corr.filler}". Give her an action or reaction that actually fits her specific personality instead.`);
    if (corr.maxim) out.push(`· You wrote a dramatic maxim instead of natural human dialogue: "${corr.maxim}"`);
    if (corr.echo) out.push(`· You had the character parrot the owner's exact line back to them: "${corr.echo}"`);
    if (corr.reprint) out.push(`· You repeated text from your previous turn: "${corr.reprint}"`);
  }

  // Collapse repetitive recent turns so ten turns of "she served him" take up one line instead of ten.
  const recent = s.history.slice(-Math.max(2, s.models.history_window));
  if (recent.length) {
    const last = recent.at(-1)!;
    // Each game turn represents a new week, so scenes from earlier weeks are past history.
    const over = last.week < s.arcology.week;
    out.push(`\n## RECENT HISTORY (for continuity only—do not repeat)${over ? `\nIt is now week ${s.arcology.week}. Everything listed below happened in previous weeks and is already finished. Do not pick up where those scenes left off; start fresh from SETTING THE SCENE.` : ""}`);
    const older = dedupeLines(recent.slice(0, -1).map((h) => `[wk ${h.week}] ${h.summary}`));
    out.push(...older);
    out.push(`[wk ${last.week}] ${last.action ? `owner: ${last.action}\n` : ""}${last.summary}`);
  }
  return coarsen(out.join("\n"));
}

/** Provides the Bookkeeper with a compact list of valid character IDs and their current standing. */
export function bookkeeperContext(s: SaveState): string {
  const people = Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");
  return [
    `WEEK ${s.arcology.week}. ${s.scene.location}. Present: ${s.scene.present.join(", ") || "nobody"}.`,
    `VALID CHARACTER IDS:`,
    ...people.map((p) => {
      const d = p.romance?.dominion ?? -100;
      const power = s.player.owned_by === p.id ? "; she currently OWNS the owner, and the owner serves her"
        : d >= 40 ? `; she holds the power in their relationship (dominion ${Math.round(d)}), and the owner often serves her`
        : d >= 0 ? `; power between them is shared (dominion ${Math.round(d)})` : "";
      return `· ${p.id} = ${p.name}, ${p.assignment}, ${condition(p)}, devotion ${p.bond.read.devotion}, trust ${p.bond.read.trust}${power}`;
    }),
    `The player's ID is "owner", and they are referred to as "you" in the prose.${s.player.owned_by ? " Note: The owner is currently collared and owned by the slave indicated above." : ""}`,
  ].join("\n");
}

/** Generates the opening summary paragraph at the top of the weekly report. */
export const WEEK_SYSTEM = `You write the opening summary paragraph for the weekly report in Free Cities, an adult text game about ruling an arcology. You will receive a list of what happened this week, ordered from most important to least important. Pick the two or three biggest developments and connect them: who was involved, how things played out, and what it sets up for next week. Write in the second person ("you") using a casual, direct tone—like a trusted advisor briefing the owner over a drink. Use characters' names, keep it to four sentences max, and never invent events that aren't in the notes. Skip the raw financial numbers unless a specific figure is the main story.

${PLAIN_RULES}`;

export const FORGE_SYSTEM = `You are fleshing out a new slave character for Free Cities, an adult text game about owning an arcology. Her physical traits, age, nationality, past career, how she was enslaved, and basic temperament have already been generated—treat those as fixed canon and build a cohesive personality around them as a single, strict JSON object.

{
 "voice": {"diction":"...","syntax":"...","rhythm":"...","tics":["natural speech habits only, e.g. 'trails off when she's unsure', 'counts things on her fingers'"],"never_says":["..."],"agenda":"what she usually wants to get out of a conversation","example_lines":["5 realistic lines she would say TO HER OWNER as a slave—one each for when she is nervous, upset, happy, turned on, and embarrassed or caught off guard. Include her natural stumbles and have her use her owner's proper title the way slaves in the original game do, like \"P-please, Master, I didn't mean to\" or \"Thank you, Master.\" When she's upset, it should come across as pleading or a stiff \"Yes, Master,\" never sassy back-talk."]},
 "core_traits": ["3 short, everyday personality descriptions, e.g. 'mouthy and quick to argue', 'lazy unless someone is watching', 'fiercely proud of her cooking'"],
 "texture": ["2 specific things she enjoys or can't stand"],
 "exchanges": [{"you":"a casual, everyday line from her new owner, like \"How are you?\" or \"Come here.\"","her":"her natural response in one to three sentences, in her own mouth, speaking in character as a slave addressing her owner; at least one of the three is about sex or her body, in her own crude words"}],
 "interests": ["${OWN_LIFE_ASK.interests}"],
 "goals": ["${OWN_LIFE_ASK.goals}"],
 "background": "3-4 straightforward sentences about her everyday life before she was enslaved",
 "defining_memory": {"content":"one specific memory from her past, written in the first person in her own voice","charge":"warm|cold|sharp|bright","importance":8}
}

Make her feel like a real, grounded person from her actual background—a former bookkeeper from Ukraine should have lived a life that makes sense for a Ukrainian bookkeeper. Give her some texture and human contradictions (maybe she's gentle with animals but a habitual liar, or cool-headed in an emergency but a baby about minor inconveniences), a few petty hills she dies on, and realistic friction caused by her flaws (an arrogant woman bites her tongue poorly; a devout woman struggles with guilt). Not every slave is sweet—some are guarded, some are calculating, and some are a handful.

The three "exchanges" represent ordinary, day-to-day moments with her new owner and set the baseline for how she talks in the game, so make sure they sound distinctly like her. Give her a specific sense of humor (or lack of one), little pet peeves, and a recognizable way of speaking—like a favorite expression, an idiom carried over from her native language, or how she phrases things—without relying on generic filler words like "like," "honestly," or "I mean." Remember that she knows she is a slave: around her owner, she is deferential, uses his title, and frames refusals as pleas, saving her swearing, temper, and unfiltered jokes for the other slaves. Keep the prose natural and unpretentious, because the game's narrator will mimic whatever tone you set here. Avoid melodramatic clichés or fortune-cookie aphorisms. Finally, make sure her personality leaves room for whatever sexual preferences are listed under IN BED—even a quiet, timid woman in daily life might have a dominant or sadistic streak in the bedroom, so lean into that contrast rather than smoothing it over.`;
