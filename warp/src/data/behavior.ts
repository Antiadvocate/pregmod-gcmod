/**
 * BEHAVIOURAL FLAWS AND QUIRKS — the original's other half of a slave's character.
 *
 * Next to her sexual flaw and quirk (data/intimacy), the original gave every slave a chance at a
 * behavioural one: arrogant, bitchy, odd, hating men or women, gluttonous, anorexic, devout,
 * liberated. They were friction that devotion alone didn't fix: an arrogant slave who loves you
 * still talks back, a devout one still calls what you do to her a sin. Training and punishment wore
 * a flaw down until it turned into its mirror quirk: arrogance into confidence, a sharp tongue into
 * wit, faith into the enjoyment of sin.
 */

export interface BehaviorFlawDef {
  id: string;
  note: string;
  /** How it shows when she's told what to do, for the narrator. */
  friction: string;
  /** What the flaw turns into once it's been worn down. */
  softens_to: string;
  /** What kind of order she pushes back on. */
  resists?: "demeaning" | "sex" | "men" | "women" | "orders";
  /** What she does when she misbehaves, for the week. */
  misdeed: string;
}

export const BEHAVIOR_FLAWS: BehaviorFlawDef[] = [
  { id: "arrogant", note: "She thinks she's better than this, and better than most people.", friction: "she talks back and looks down on orders, and does demeaning things only when she's made to", softens_to: "confident", resists: "demeaning", misdeed: "told a guest exactly what she thought of him" },
  { id: "bitchy", note: "She has a sharp tongue and uses it on everyone.", friction: "she makes cutting remarks, at the owner too when she thinks she can get away with it", softens_to: "cutting", misdeed: "made one of the staff cry with a remark at dinner" },
  { id: "odd", note: "She's odd, with strange habits, and she says strange things at the wrong moment.", friction: "she says and does strange things at the wrong moment", softens_to: "funny", misdeed: "was found rearranging the furniture in the atrium at three in the morning" },
  { id: "hates men", note: "She can't stand men.", friction: "she stiffens at a man's touch and drags her feet on a man's orders", softens_to: "adores women", resists: "men", misdeed: "slapped a man who put his hand on her" },
  { id: "hates women", note: "She can't stand women.", friction: "she bristles at women and drags her feet on a woman's orders", softens_to: "adores men", resists: "women", misdeed: "picked a fight with the women she works with" },
  { id: "gluttonous", note: "She eats whenever she can, and steals food.", friction: "she sneaks food and lies about it", softens_to: "fitness", misdeed: "was caught stealing from the kitchens again" },
  { id: "anorexic", note: "She barely eats, and hides it.", friction: "she skips meals and lies about it", softens_to: "insecure", misdeed: "hasn't eaten properly all week, and hid it" },
  { id: "devout", note: "She's devoutly religious and believes what's done to her is a sin.", friction: "she prays under her breath, calls sex a sin, and resists sexual orders unless she's truly devoted", softens_to: "sinful", resists: "sex", misdeed: "spent her shift praying instead of working, and told a client he was damned" },
  { id: "liberated", note: "She believes slavery is wrong and says so.", friction: "she argues she's a person and not property, and resists being treated as a thing", softens_to: "advocate", resists: "orders", misdeed: "was overheard telling the other slaves they don't have to put up with this" },
  // The odder half, most of it a woman who thinks she ought to be the one giving the orders.
  { id: "bossy", note: "She tells everyone what to do, including people she has no business telling.", friction: "she rephrases every order as if it were her idea, corrects how it should be done, and tells the owner how he ought to have asked", softens_to: "commanding", resists: "orders", misdeed: "reorganised the whole kitchen staff's shifts without asking anyone, and they did what she said" },
  { id: "vain", note: "She thinks she's the most beautiful woman in the building and needs to be told so.", friction: "she sulks until she's admired, checks every reflective surface, and does nothing well that might mess up her hair", softens_to: "radiant", resists: "demeaning", misdeed: "spent an hour of her shift in the mirror and refused to clean anything that might chip her nails" },
  { id: "possessive", note: "She wants the owner to herself and hates every other woman he looks at.", friction: "she's sweet to the owner and vicious about the others, and drags her feet on anything that involves sharing him", softens_to: "devoted", resists: "women", misdeed: "cut another slave's hair off in her sleep for sitting too close to the owner" },
  { id: "unwashed", note: "She won't wash unless she's made to, and she's proud of how she smells.", friction: "she dodges the showers, goes to bed sweaty on purpose, and laughs when people notice", softens_to: "earthy", misdeed: "went a week without bathing and lifted her arm in a client's face when he complained" },
  { id: "exhibitionist", note: "She takes her clothes off at the wrong moments, in front of the wrong people.", friction: "she strips, flashes and lounges naked whenever it will cause the most trouble, and calls it nothing", softens_to: "shameless", misdeed: "walked through the citizens' atrium naked at lunchtime and stopped to chat" },
  { id: "spiteful", note: "She keeps score, and gets even for the smallest thing.", friction: "she obeys and then gets her own back somehow, with something lost, something spilled, or a story told", softens_to: "loyal", misdeed: "put salt in a guard's coffee every morning for a month because he once laughed at her" },
  { id: "superstitious", note: "She lives by omens, charms and rules nobody else can see.", friction: "she won't do things on the wrong day, in the wrong room, or after a bad sign, and argues the point", softens_to: "intuitive", misdeed: "refused to work the thirteenth floor and hid in a linen cupboard for her whole shift" },
  { id: "gossip", note: "She can't keep anything to herself.", friction: "she repeats everything she hears to everyone, the owner's business included", softens_to: "informant", misdeed: "told half the household something the owner said in bed" },
  { id: "lazy", note: "She does as little as she can get away with, and is very good at it.", friction: "she does exactly what was asked, slowly, and never one thing more", softens_to: "serene", misdeed: "slept through most of her shift in a storeroom she'd made comfortable" },
];

export interface BehaviorQuirkDef { id: string; note: string }

export const BEHAVIOR_QUIRKS: BehaviorQuirkDef[] = [
  { id: "confident", note: "She's confident, and carries herself like it." },
  { id: "cutting", note: "She has a cutting wit, and turns it on people the owner doesn't like." },
  { id: "funny", note: "She's funny, in a strange way that makes people laugh." },
  { id: "adores women", note: "She loves women, and it shows." },
  { id: "adores men", note: "She loves men, and it shows." },
  { id: "fitness", note: "She keeps herself fit and is proud of it." },
  { id: "insecure", note: "She's insecure and needs to be told she's good." },
  { id: "sinful", note: "She enjoys sin, and knows it's one." },
  { id: "advocate", note: "She argues for slavery now, as only a convert can." },
  { id: "commanding", note: "She takes charge when something goes wrong, and the other slaves do what she says." },
  { id: "radiant", note: "She knows she's beautiful and carries it like a gift to whoever's looking." },
  { id: "devoted", note: "She's the owner's, entirely, and makes sure the others know it without being cruel about it." },
  { id: "earthy", note: "She's at home in her body, sweat, smell and all, and she makes other people comfortable in theirs." },
  { id: "shameless", note: "Nothing about her body embarrasses her, and it's catching." },
  { id: "loyal", note: "She remembers every kindness as carefully as she used to remember slights." },
  { id: "intuitive", note: "She has hunches about people, and they're right more often than they should be." },
  { id: "informant", note: "She hears everything, and now she brings it to the owner first." },
  { id: "serene", note: "Nothing hurries her and nothing rattles her, and she calms the room." },
  // Odd ones that were never flaws: they just are.
  { id: "worshipful", note: "She wants to be worshipped first thing in the morning, before anyone asks anything of her, and she's sweeter all day for it." },
  { id: "sniffer", note: "She smells people's necks, clothes and hair. She knows everyone in the house by scent." },
  { id: "throne sitter", note: "She sits on people instead of chairs when she can get away with it, on laps and backs, and on faces if she's allowed." },
  { id: "barefoot", note: "She won't wear shoes indoors, and makes a point of putting her feet on things." },
  { id: "collector", note: "She keeps things from everyone she's been with, like a button, a hair or a sock. She has a box." },
  { id: "night owl", note: "She comes alive after midnight and drifts through the day half asleep." },
  { id: "hums", note: "She hums all the time, the same few songs, and doesn't know she's doing it." },
  { id: "tickle-proof", note: "She can't be tickled, and she's smug about it, and she's merciless at tickling other people." },
];

export const BEHAVIOR_FLAW_BY_ID: Record<string, BehaviorFlawDef> = Object.fromEntries(BEHAVIOR_FLAWS.map((f) => [f.id, f]));
export const BEHAVIOR_QUIRK_BY_ID: Record<string, BehaviorQuirkDef> = Object.fromEntries(BEHAVIOR_QUIRKS.map((q) => [q.id, q]));
