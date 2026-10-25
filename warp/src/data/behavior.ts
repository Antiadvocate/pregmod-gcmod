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
  { id: "odd", note: "She's odd: strange habits, strange things said at the wrong moment.", friction: "she says and does strange things at the wrong moment", softens_to: "funny", misdeed: "was found rearranging the furniture in the atrium at three in the morning" },
  { id: "hates men", note: "She can't stand men.", friction: "she stiffens at a man's touch and drags her feet on a man's orders", softens_to: "adores women", resists: "men", misdeed: "slapped a man who put his hand on her" },
  { id: "hates women", note: "She can't stand women.", friction: "she bristles at women and drags her feet on a woman's orders", softens_to: "adores men", resists: "women", misdeed: "picked a fight with the women she works with" },
  { id: "gluttonous", note: "She eats whenever she can, and steals food.", friction: "she sneaks food and lies about it", softens_to: "fitness", misdeed: "was caught stealing from the kitchens again" },
  { id: "anorexic", note: "She barely eats, and hides it.", friction: "she skips meals and lies about it", softens_to: "insecure", misdeed: "hasn't eaten properly all week, and hid it" },
  { id: "devout", note: "She's devoutly religious and believes what's done to her is a sin.", friction: "she prays under her breath, calls sex a sin, and resists sexual orders unless she's truly devoted", softens_to: "sinful", resists: "sex", misdeed: "spent her shift praying instead of working, and told a client he was damned" },
  { id: "liberated", note: "She believes slavery is wrong and says so.", friction: "she argues she's a person and not property, and resists being treated as a thing", softens_to: "advocate", resists: "orders", misdeed: "was overheard telling the other slaves they don't have to put up with this" },
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
];

export const BEHAVIOR_FLAW_BY_ID: Record<string, BehaviorFlawDef> = Object.fromEntries(BEHAVIOR_FLAWS.map((f) => [f.id, f]));
export const BEHAVIOR_QUIRK_BY_ID: Record<string, BehaviorQuirkDef> = Object.fromEntries(BEHAVIOR_QUIRKS.map((q) => [q.id, q]));
