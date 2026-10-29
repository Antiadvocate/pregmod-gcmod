/**
 * THE REGISTER — keeping the narrator crude.
 *
 * Models write in the register of what they read. DeepSeek especially: one soft paragraph in a
 * card, a memory or the last scene, and the next scene comes back softer, and that one is read by
 * the scene after. Rules in the system prompt lose to that. So two things, both cheap:
 *
 *   coarsen      every piece of prose the models write goes through it before it's kept, and so
 *                before it's read again: the stock euphemisms become the plain words. The loop
 *                that softens the game one scene at a time has nothing left to feed on.
 *   REGISTER_TAIL  the last thing in every request, where the model looks hardest: everything
 *                above is records, not a style to copy, and here's what the style actually is.
 *
 * The substitutions are the unambiguous ones only. "Her core" is never her abdominal muscles in
 * a scene like this; "her chest" might be, so it stays.
 */

type Swap = [RegExp, string | ((...m: string[]) => string)];

const HER = "(her|my|your)";
const HIS = "(his|my|your)";

// A word that is sometimes a euphemism and sometimes not is only swapped where the next word
// doesn't make it innocent: "her sex life", "her centre of gravity", "his length of rope".
const NOT = "(?![-\\w]|\\s+(?:of|life|appeal|drive|work|worker|workers|slave|slaves|toy|toys|scene|act|acts|education|position|positions|shop|drawer|lip|lips|step|steps|sleeve|up)\\b)";

const SWAPS: Swap[] = [
  // her
  [new RegExp(`\\b${HER} (?:most )?(?:intimate (?:place|places|parts|area)|core|center|centre|womanhood|femininity|flower|heat|mound|sex|secret place)${NOT}`, "gi"), "$1 pussy"],
  [new RegExp(`\\b${HER} (?:inner |slick |wet |swollen )?folds${NOT}`, "gi"), "$1 pussy lips"],
  [new RegExp(`\\b${HER} (?:tight|wet|slick|dripping|waiting) entrance\\b`, "gi"), "$1 hole"],
  [new RegExp(`\\b${HER} (?:sensitive |swollen )?(?:nub|bud)${NOT}`, "gi"), "$1 clit"],
  [new RegExp(`\\b${HER} (?:bosom|breasts)\\b`, "gi"), "$1 tits"],
  [/\b(her|his|my|your) (?:backside|derriere|posterior)\b/gi, "$1 ass"],
  [/\b(her|his|my|your) (?:rosebud|pucker|back entrance)\b/gi, "$1 asshole"],
  // his
  [new RegExp(`\\b${HIS} (?:throbbing |hard |rigid |swollen )?(?:member|manhood|length|hardness|erection|shaft)${NOT}`, "gi"), "$1 cock"],
  [new RegExp(`\\b${HIS} (?:hot )?(?:seed|essence)${NOT}`, "gi"), "$1 cum"],
  // what happens
  [/\b(found|reached|finds|reaches|find|reach) (her|his|my|your|their) (?:release|climax|peak|completion)\b/gi, (_m, v: string) => (/^(found|reached)$/i.test(v) ? "came" : /s$/i.test(v) ? "comes" : "come")],
  [/\bmade love to\b/gi, "fucked"],
  [/\bmaking love to\b/gi, "fucking"],
  [/\bmake love to\b/gi, "fuck"],
  [/\bcame undone\b/gi, "came"],
  [/\bcomes undone\b/gi, "comes"],
];

/** The stock euphemisms turned into the plain words. Everything else is left as written. */
export function coarsen(text: string): string {
  if (!text) return text;
  let out = text;
  for (const [re, to] of SWAPS) out = out.replace(re, to as never);
  return out;
}

/**
 * WHAT FREE CITIES SOUNDS LIKE. The prompts used to describe the style ("plain", "plainly", "plain
 * words", eighty-odd times) instead of showing it, and the models obeyed the description: careful,
 * restrained prose about feelings, characters saying "speak plain", nobody swearing, nobody saying
 * cock or armpit. A player read a story pitch ("she's watching for the catch while pretending she
 * isn't", "kneeling because she wants to, not because she has to") and called it HBO's Euphoria.
 * The original game is horny, crude, funny and matter-of-fact about bodies, and so is this block.
 */
export const FC_VOICE = `WHAT THIS GAME SOUNDS LIKE. This is Free Cities: a dirty, funny, matter-of-fact porn game about owning people. It is not prestige TV and it is not literary fiction. People here are horny, greedy, scared, petty, jealous, bored and showing off, like real people, and they say so in their own mouths. They swear. They talk about cocks, cunts, asses, tits, feet, armpits, sweat, piss and cum the way people talk about the weather, and they complain about sore knees, a stretched hole, a stingy owner and the girl who got the better shoes. The narration says what happens to whose body, crude and specific, and gets on with it. Write like this:
- "She gets down and licks your balls without being asked twice, then pulls back and wipes her mouth. 'Fuck, you taste like the gym, Master.' She goes back to it anyway."
- "'My cunt's still sore from the club,' she says, pulling her panties to one side so you can see. 'Can you use my ass tonight? Please?'"
- "Hanna sniffs her own armpit, makes a face, and grins. 'Two shifts in this dress. Want me to shower or do you want it like this?'"
- "The inspector sees what your Head Girl is doing under the desk and loses his place in the sentence three times."
NEVER write like this, in narration, dialogue, choices, endings or summaries: "she's watching for the catch while pretending she isn't", "the pretending cracks her open", "kneeling because she wants to, not because she has to", "the only woman who knows you by choice", "what she can't say out loud", "it's not about the sex", "speak plain" or "say it plainly" or anyone announcing they'll be honest. No therapy words, no inner arcs, no lines shaped "X, not Y" or "not X but Y", no stakes about being seen, being known, choosing or meaning it. Wanting to get fucked, paid, fed, promoted or out of the arcade are stakes. Feelings show in what someone does with her mouth and hands, and what she says, crudely, in her own words.`;

/** Put last in every request that writes a scene. */
export const REGISTER_TAIL = `## HOW TO WRITE IT
This overrides the wording of everything above. Everything above is records, like cards, memories, laws and earlier scenes. Their wording is not your style, so don't copy it, even where it's soft or pretty. Write the way this game writes. Use crude words (cock, dick, pussy, cunt, clit, ass, asshole, tits, cum, spit, piss, fuck, slut), with no euphemism and no poetry. A quick, earthy, funny comparison is fine, but "waves of pleasure" is not.
${FC_VOICE}
People should sound like themselves, with everyday talk, swearing and dirty talk in their own voices, their kinks and their history showing in what they do, and their habits only now and then. Keep to GUIDELINES FOR SCENES AND DIALOGUE. Length follows the player, you answer what was said, and nobody makes speeches. A slave talking to her owner still talks the way THE POWER BETWEEN YOU says, using the owner's title, as a slave to her owner, however close they are. Like this:
"She drops to her knees and goes at your cock like someone told her there's a prize at the bottom, cheeks hollowed, spit running off her chin onto her tits. She pulls off with a wet pop just long enough to gasp, 'Thank you, Master. Fuck. Thank you,' and sinks back down, humming it into you. You grab her hair and fuck her throat till she gags, and she's laughing and coughing when you cum on her tits, already checking your face to see if she did it right."`;
