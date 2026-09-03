/**
 * WHAT ACTUALLY HAPPENS, AND WHAT IT DOES TO HER.
 *
 * This is a brothel simulator. The economy is the frame the thing hangs on; this file is the game.
 *
 * The vocabulary here is the base game's own — its fetishes, its paraphilias, its quirks and flaws,
 * spelled the way it spells them — because a rebuild that renames everything into softer words is a
 * rebuild its audience opens once. `buttslut` is a fetish, `hates anal` is a flaw, `painal queen` is
 * a quirk, and the engine says so plainly on the page.
 *
 * The mechanical claim of this file: an act is not a stat increment. What it does depends on who it
 * is being done to. The same hour is a gift to one woman, a chore to the next, and a thing the third
 * will still be carrying in a year — and the difference is her fetish, her flaw, her nervous system
 * and what she remembers. That difference is the whole reason to model any of this.
 */

/** The base game's fetish list, unchanged. `none` is a real value, not an absence. */
export type FetishId =
  | "none" | "boobs" | "buttslut" | "cumslut" | "humiliation" | "submissive" | "dom" | "masochist" | "sadist" | "pregnancy";

/** Its paraphilias — a fetish that has gone past appetite into need. */
export type ParaphiliaId =
  | "abusive" | "anal addict" | "attention whore" | "breast growth" | "breeder" | "cum addict" | "malicious" | "neglectful" | "self hating";

/** Sexual quirks: the good half of a specific taste. */
export type QuirkId =
  | "gagfuck queen" | "painal queen" | "strugglefuck queen" | "tease" | "romantic" | "perverted" | "caring" | "unflinching" | "size queen";

/** Sexual flaws: the thing she will not do gladly, and what it costs to make her. */
export type FlawId =
  | "hates oral" | "hates anal" | "hates penetration" | "repressed" | "idealistic" | "shamefast" | "apathetic" | "crude" | "judgemental";

export interface FetishDef {
  id: FetishId;
  /** How it reads on the page. */
  name: string;
  /** One line, in the game's register, of what she is actually like about it. */
  note: string;
  /** Acts that hit it. */
  acts: string[];
  /** The paraphilia it becomes if it is fed until it stops being a preference. */
  becomes?: ParaphiliaId;
}

export const FETISHES: FetishDef[] = [
  { id: "none", name: "no particular thing", note: "Nothing in particular gets her. She is not broken; some people simply are not wired to a single thing.", acts: [] },
  { id: "boobs", name: "boobs", note: "Her tits are the whole event for her. Attention there is worth more than anything else you could do.", acts: ["mammary", "tit worship", "oral"], becomes: "breast growth" },
  { id: "buttslut", name: "buttslut", note: "She wants it in the ass and she has stopped pretending otherwise.", acts: ["anal", "anal toys", "rimming"], becomes: "anal addict" },
  { id: "cumslut", name: "cumslut", note: "She wants to be finished in the mouth, on the face, anywhere she can taste it.", acts: ["oral", "facial", "swallow"], becomes: "cum addict" },
  { id: "humiliation", name: "humiliation", note: "Being seen is the point. Being used where people are watching is better than the using.", acts: ["public use", "exposure", "degradation"], becomes: "attention whore" },
  { id: "submissive", name: "submissive", note: "Being told, being held down, being given no say — that is where she goes quiet and easy.", acts: ["restraint", "discipline", "orders"], becomes: "self hating" },
  { id: "dom", name: "dom", note: "She wants to be the one running it, and she is good at it when she is let.", acts: ["penetrative", "domination", "using another"], becomes: "abusive" },
  { id: "masochist", name: "masochist", note: "It has to hurt to land. Gentleness reads as nothing at all to her.", acts: ["pain", "discipline", "painal"], becomes: "self hating" },
  { id: "sadist", name: "sadist", note: "She wants somebody else's bad afternoon, and she is entirely honest about it.", acts: ["domination", "punishing another", "pain on another"], becomes: "malicious" },
  { id: "pregnancy", name: "pregnancy", note: "Being bred, being full, being obviously so in front of people.", acts: ["breeding", "belly worship", "vaginal"], becomes: "breeder" },
];

export const FETISH_BY_ID: Record<string, FetishDef> = Object.fromEntries(FETISHES.map((f) => [f.id, f]));

/** Strength bands, from the base game: 10+ enjoys, 60+ likes, 95+ loves. Past 100 it is a paraphilia. */
export function fetishBand(strength: number): string {
  if (strength >= 95) return "loves";
  if (strength >= 60) return "likes";
  if (strength >= 10) return "enjoys";
  return "is indifferent to";
}

export interface QuirkDef { id: QuirkId; note: string; acts: string[] }
export const QUIRKS: QuirkDef[] = [
  { id: "gagfuck queen", note: "She likes it rough in the throat and does not want you to be careful.", acts: ["oral", "throat"] },
  { id: "painal queen", note: "She wants her ass taken hard and dry and she will say so.", acts: ["anal", "painal"] },
  { id: "strugglefuck queen", note: "She wants to be held down and taken through the fight she puts up.", acts: ["restraint", "rough"] },
  { id: "tease", note: "She would rather build it for an hour than get to it.", acts: ["teasing", "denial"] },
  { id: "romantic", note: "It only really works for her if it means something, and she needs to hear that it does.", acts: ["kissing", "slow", "sleeping together"] },
  { id: "perverted", note: "Nothing is off the table and she gets bored of the ordinary faster than you do.", acts: ["group", "public use", "unusual"] },
  { id: "caring", note: "She is more interested in getting somebody else there than in getting there.", acts: ["oral", "servicing", "aftercare"] },
  { id: "unflinching", note: "Nothing shocks her. Whatever it is, she has already decided it is fine.", acts: ["anything"] },
  { id: "size queen", note: "Small does not register. She wants to feel it the next day.", acts: ["vaginal", "anal", "toys"] },
];

export interface FlawDef { id: FlawId; note: string; hates: string[]; /** what it becomes if she is worked past it */ softens_to?: QuirkId }
export const FLAWS: FlawDef[] = [
  { id: "hates oral", note: "She gags, she hates it, and she is not performing that.", hates: ["oral", "throat", "facial"], softens_to: "gagfuck queen" },
  { id: "hates anal", note: "She will do it and she will hold a grudge about it for a month.", hates: ["anal", "painal", "rimming"], softens_to: "painal queen" },
  { id: "hates penetration", note: "Anything inside her is a thing she is enduring.", hates: ["vaginal", "anal"], softens_to: "strugglefuck queen" },
  { id: "repressed", note: "She was raised to think all of it is filthy and none of that has gone anywhere.", hates: ["public use", "exposure", "group"], softens_to: "perverted" },
  { id: "idealistic", note: "She still believes sex is supposed to mean something, which makes the arcade a special horror.", hates: ["public use", "group", "degradation"], softens_to: "romantic" },
  { id: "shamefast", note: "She cannot be looked at. Being watched is worse than anything being done.", hates: ["exposure", "public use"], softens_to: "tease" },
  { id: "apathetic", note: "She is not there for any of it. You could be anyone.", hates: [], softens_to: "caring" },
  { id: "crude", note: "She says the ugliest possible thing at the worst possible moment and it kills the room.", hates: [], softens_to: "perverted" },
  { id: "judgemental", note: "She has opinions about what you are into and she does not keep them to herself.", hates: ["unusual", "group"], softens_to: "unflinching" },
];

export const FLAW_BY_ID: Record<string, FlawDef> = Object.fromEntries(FLAWS.map((f) => [f.id, f]));
export const QUIRK_BY_ID: Record<string, QuirkDef> = Object.fromEntries(QUIRKS.map((q) => [q.id, q]));

/* ── THE ACTS ─────────────────────────────────────────────────────────────────────────────────
 * Everything you can actually do, with what it needs, what it trains, and what it does to a body
 * and a nervous system. `tags` are what fetishes, quirks and flaws match against.
 */

export interface ActDef {
  id: string;
  /** What the menu says. Plain. */
  name: string;
  /** One line of what it is, for the narrator's directive. */
  what: string;
  group: "use" | "service" | "play" | "discipline" | "tenderness" | "display";
  tags: string[];
  /** Anatomy required of her. */
  needs?: ("mouth" | "vagina" | "anus" | "dick" | "breasts" | "milk")[];
  /** Skill trained, and how fast. */
  trains?: Record<string, number>;
  /** Base effect before her own wiring is applied. */
  base: {
    /** her arousal, 0–100 scale */
    arousal: number;
    /** the nervous system */
    relaxation: number;
    /** what it does to the bond, before fetish match */
    bond: number;
    /** what it costs her if she is not into it */
    resentment: number;
    /** how much of the player's own appetite it answers */
    release: number;
  };
  /** Requires her to be willing, or it counts as taken rather than given. */
  wants_devotion?: number;
}

export const ACTS: ActDef[] = [
  // ── use ────────────────────────────────────────────────────────────────────────────────────
  { id: "oral", name: "Use her mouth", what: "she sucks you off", group: "use", tags: ["oral", "servicing"], needs: ["mouth"],
    trains: { oral: 2.5 }, base: { arousal: 6, relaxation: -0.1, bond: 0.5, resentment: 1, release: 6 } },
  { id: "throat", name: "Fuck her throat", what: "you hold her head and use her throat, and she takes it", group: "use", tags: ["oral", "throat", "rough"], needs: ["mouth"],
    trains: { oral: 3.5 }, base: { arousal: 4, relaxation: -0.8, bond: -0.5, resentment: 4, release: 8 } },
  { id: "vaginal", name: "Fuck her", what: "you fuck her cunt", group: "use", tags: ["vaginal", "penetration"], needs: ["vagina"],
    trains: { vaginal: 2.5 }, base: { arousal: 10, relaxation: 0.1, bond: 1, resentment: 1, release: 8 } },
  { id: "anal", name: "Fuck her ass", what: "you fuck her ass", group: "use", tags: ["anal", "penetration"], needs: ["anus"],
    trains: { anal: 3 }, base: { arousal: 6, relaxation: -0.4, bond: 0, resentment: 3, release: 8 } },
  { id: "painal", name: "Take her ass dry", what: "you take her ass without working her up to it", group: "use", tags: ["anal", "painal", "pain", "rough"], needs: ["anus"],
    trains: { anal: 4 }, base: { arousal: 2, relaxation: -1.6, bond: -2, resentment: 9, release: 8 } },
  { id: "mammary", name: "Use her tits", what: "you fuck her tits", group: "use", tags: ["mammary", "boobs"], needs: ["breasts"],
    trains: { oral: 0.5 }, base: { arousal: 5, relaxation: 0, bond: 0.5, resentment: 1, release: 6 } },
  { id: "facial", name: "Finish on her face", what: "you finish on her face and leave it there a while", group: "use", tags: ["facial", "cum", "degradation"],
    base: { arousal: 3, relaxation: -0.3, bond: -0.5, resentment: 3, release: 3 } },
  { id: "swallow", name: "Make her swallow", what: "you finish in her mouth and she swallows it", group: "use", tags: ["cum", "swallow", "oral"], needs: ["mouth"],
    base: { arousal: 3, relaxation: -0.2, bond: 0, resentment: 2, release: 3 } },
  { id: "penetrative", name: "Let her fuck you", what: "she fucks you", group: "use", tags: ["penetrative", "domination", "using another"], needs: ["dick"],
    trains: { penetrative: 3 }, base: { arousal: 12, relaxation: 0.6, bond: 3, resentment: 0, release: 4 }, wants_devotion: 20 },
  { id: "group", name: "Two of them at once", what: "you take two of them together and they have to work around each other", group: "use", tags: ["group", "unusual", "sharing"],
    trains: { oral: 1.5, vaginal: 1.5 }, base: { arousal: 7, relaxation: -0.5, bond: -0.5, resentment: 3, release: 9 } },

  // ── service ────────────────────────────────────────────────────────────────────────────────
  { id: "servicing", name: "Have her serve another slave", what: "you put her mouth to work on one of the others while you watch", group: "service", tags: ["servicing", "oral", "sharing"], needs: ["mouth"],
    trains: { oral: 2 }, base: { arousal: 5, relaxation: -0.2, bond: 0, resentment: 2, release: 2 } },
  { id: "milking", name: "Milk her", what: "she gets milked, by hand or by machine", group: "service", tags: ["milking", "boobs"], needs: ["milk"],
    base: { arousal: 4, relaxation: 0.2, bond: 0, resentment: 2, release: 1 } },
  { id: "breeding", name: "Breed her", what: "you finish in her cunt and both of you know exactly what for", group: "service", tags: ["breeding", "vaginal", "pregnancy"], needs: ["vagina"],
    trains: { vaginal: 2 }, base: { arousal: 9, relaxation: -0.2, bond: 1, resentment: 4, release: 9 } },

  // ── play ───────────────────────────────────────────────────────────────────────────────────
  { id: "teasing", name: "Work her up and stop", what: "you get her most of the way there and then leave it", group: "play", tags: ["teasing", "denial"],
    base: { arousal: 18, relaxation: -0.3, bond: 0.5, resentment: 2, release: 0 } },
  { id: "getoff", name: "Get her off", what: "you put the work in and get her there, and nothing else happens", group: "play", tags: ["tenderness", "servicing"],
    base: { arousal: -35, relaxation: 1.4, bond: 4, resentment: -3, release: 0 } },
  { id: "toys", name: "Use toys on her", what: "you work her over with something out of the drawer", group: "play", tags: ["toys", "anal toys", "unusual"],
    trains: { anal: 1 }, base: { arousal: 12, relaxation: -0.2, bond: 0.5, resentment: 1, release: 2 } },
  { id: "rimming", name: "Have her rim you", what: "her tongue, your ass, and no negotiation about it", group: "play", tags: ["rimming", "degradation", "servicing"], needs: ["mouth"],
    base: { arousal: 2, relaxation: -0.5, bond: -0.5, resentment: 4, release: 3 } },

  // ── display ────────────────────────────────────────────────────────────────────────────────
  { id: "public use", name: "Use her in public", what: "you take her on the concourse where the citizens can watch", group: "display", tags: ["public use", "exposure", "humiliation", "degradation"],
    trains: { whoring: 2 }, base: { arousal: 5, relaxation: -1.2, bond: -1, resentment: 7, release: 7 } },
  { id: "exposure", name: "Show her off", what: "you walk her through the arcology with nothing on and let people look", group: "display", tags: ["exposure", "humiliation"],
    base: { arousal: 4, relaxation: -0.9, bond: -0.5, resentment: 5, release: 1 } },
  { id: "degradation", name: "Degrade her", what: "you make it clear in front of people exactly what she is", group: "display", tags: ["degradation", "humiliation"],
    base: { arousal: 2, relaxation: -1.4, bond: -2.5, resentment: 9, release: 2 } },

  // ── discipline ─────────────────────────────────────────────────────────────────────────────
  { id: "restraint", name: "Tie her down", what: "she is restrained and has no say in what happens next", group: "discipline", tags: ["restraint", "bondage", "orders"],
    base: { arousal: 8, relaxation: -0.6, bond: 0, resentment: 3, release: 4 } },
  { id: "discipline", name: "Punish her", what: "she is punished, properly, and she knows what for", group: "discipline", tags: ["pain", "discipline", "punishment"],
    base: { arousal: 2, relaxation: -1.8, bond: -3, resentment: 8, release: 2 } },
  { id: "orders", name: "Give her an order and watch her obey", what: "you tell her to do something humiliating and she does it while you watch", group: "discipline", tags: ["orders", "humiliation", "submission"],
    base: { arousal: 5, relaxation: -0.5, bond: -0.5, resentment: 4, release: 3 } },

  // ── tenderness ─────────────────────────────────────────────────────────────────────────────
  { id: "kissing", name: "Kiss her", what: "you kiss her like she is somebody, and she does not know what to do with that", group: "tenderness", tags: ["kissing", "slow", "tenderness"],
    base: { arousal: 8, relaxation: 0.8, bond: 3, resentment: -2, release: 0 } },
  { id: "slow", name: "Take your time with her", what: "the whole night, unhurried, and she is allowed to enjoy it", group: "tenderness", tags: ["slow", "tenderness", "kissing"],
    trains: { vaginal: 1, oral: 1 }, base: { arousal: 14, relaxation: 1.6, bond: 6, resentment: -5, release: 7 } },
  { id: "sleeping together", name: "Let her sleep in your bed", what: "she stays the night, and nothing else is asked of her", group: "tenderness", tags: ["sleeping together", "tenderness", "slow"],
    base: { arousal: 0, relaxation: 1.8, bond: 7, resentment: -6, release: 0 } },
  { id: "aftercare", name: "Look after her afterwards", what: "you clean her up, put her somewhere warm, and sit with her until she is back", group: "tenderness", tags: ["aftercare", "tenderness"],
    base: { arousal: -5, relaxation: 1.5, bond: 5, resentment: -7, release: 0 } },
  { id: "talk", name: "Just talk to her", what: "you ask her something and then actually listen to the answer", group: "tenderness", tags: ["talk", "tenderness"],
    base: { arousal: 0, relaxation: 0.9, bond: 4, resentment: -4, release: 0 } },
];

export const ACT_BY_ID: Record<string, ActDef> = Object.fromEntries(ACTS.map((a) => [a.id, a]));

/** Which hole she would pick if it were up to her. The base game's `preferredHole`, kept. */
export type Hole = "mouth" | "vagina" | "anus" | "dick" | "boobs";

export const HOLE_LABEL: Record<Hole, string> = {
  mouth: "her mouth", vagina: "her cunt", anus: "her ass", dick: "her cock", boobs: "her tits",
};
