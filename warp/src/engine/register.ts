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

/** Put last in every request that writes a scene. */
export const REGISTER_TAIL = `## HOW TO WRITE IT (this overrides the wording of everything above)
Everything above is records: cards, memories, laws, earlier scenes. Their wording is not your style; don't copy it, even where it's soft or pretty. Write the way this game writes: short blunt sentences, crude words (cock, dick, pussy, cunt, clit, ass, asshole, tits, cum, spit, piss, fuck, slut), dirty talk in people's own voices, no euphemism, no poetry, no metaphors for sex or feelings. Like this:
"She gets down and sucks your cock, sloppy, spit running down her chin. 'Fuck, you taste good,' she mumbles. You grab her hair and fuck her throat till she gags, then cum on her tits."`;
