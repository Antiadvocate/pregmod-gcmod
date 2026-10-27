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
  | "none" | "boobs" | "buttslut" | "cumslut" | "humiliation" | "submissive" | "dom" | "masochist" | "sadist" | "pregnancy"
  // Past the base game's list: the tastes it never had a word for, most of them hers to enjoy and
  // a good half of them about being served, worshipped or obeyed.
  | "armpits" | "musk" | "facesitting" | "assworship" | "goddess" | "pegging" | "keyholder" | "spit" | "ballbusting"
  | "findom" | "sph" | "cuckoldress" | "petplay" | "breathplay" | "voyeur" | "tickling" | "furniture";

/** Its paraphilias — a fetish that has gone past appetite into need. */
export type ParaphiliaId =
  | "abusive" | "anal addict" | "attention whore" | "breast growth" | "breeder" | "cum addict" | "malicious" | "neglectful" | "self hating"
  | "scent obsessed" | "goddess complex" | "throne" | "keyholder for life" | "humiliatrix" | "cuckqueen" | "pet for life" | "breath addict" | "tribute junkie";

/** Sexual quirks: the good half of a specific taste. */
export type QuirkId =
  | "gagfuck queen" | "painal queen" | "strugglefuck queen" | "tease" | "romantic" | "perverted" | "caring" | "unflinching" | "size queen"
  | "throne queen" | "scent proud" | "edge queen" | "mean girl" | "good pet" | "watcher";

/** Sexual flaws: the thing she will not do gladly, and what it costs to make her. */
export type FlawId =
  | "hates oral" | "hates anal" | "hates penetration" | "repressed" | "idealistic" | "shamefast" | "apathetic" | "crude" | "judgemental"
  | "fastidious" | "bratty" | "prissy";

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
  { id: "none", name: "no particular thing", note: "She has no particular fetish.", acts: [] },
  { id: "boobs", name: "boobs", note: "She loves having her breasts played with more than anything else.", acts: ["mammary", "tit worship", "oral"], becomes: "breast growth" },
  { id: "buttslut", name: "buttslut", note: "She loves anal and doesn't pretend otherwise.", acts: ["anal", "anal toys", "rimming"], becomes: "anal addict" },
  { id: "cumslut", name: "cumslut", note: "She loves cum in her mouth, on her face, anywhere she can taste it.", acts: ["oral", "facial", "swallow", "feet"], becomes: "cum addict" },
  { id: "humiliation", name: "humiliation", note: "She gets off on being watched and humiliated, the more public the better.", acts: ["public use", "exposure", "degradation"], becomes: "attention whore" },
  { id: "submissive", name: "submissive", note: "She loves being ordered around and held down.", acts: ["restraint", "discipline", "orders"], becomes: "self hating" },
  { id: "dom", name: "dom", note: "She likes being in charge in bed, and she's good at it.", acts: ["penetrative", "domination", "using another", "feet", "hers"], becomes: "abusive" },
  { id: "masochist", name: "masochist", note: "She gets off on pain. Gentle sex does nothing for her.", acts: ["pain", "discipline", "painal"], becomes: "self hating" },
  { id: "sadist", name: "sadist", note: "She enjoys hurting other people and doesn't hide it.", acts: ["domination", "punishing another", "pain on another", "feet"], becomes: "malicious" },
  { id: "pregnancy", name: "pregnancy", note: "She loves being bred and being visibly pregnant.", acts: ["breeding", "belly worship", "vaginal", "pregnancy"], becomes: "breeder" },
  { id: "armpits", name: "armpit worship", note: "She wants her armpits worshipped, kissed, sniffed and licked clean, with a face buried in them. She stops shaving them for it.", acts: ["armpits", "musk"], becomes: "scent obsessed" },
  { id: "musk", name: "musk", note: "She gets off on her own smell being wanted, when she's unwashed and sweaty after a shift and someone presses their nose into her.", acts: ["musk", "armpits", "feet", "smother", "facesitting"], becomes: "scent obsessed" },
  { id: "facesitting", name: "facesitting", note: "She wants to sit on faces. All her weight, her thighs closed around your ears, and you breathing when she lets you.", acts: ["facesitting", "smother", "ass worship"], becomes: "throne" },
  { id: "assworship", name: "ass worship", note: "She wants her ass worshipped, kissed and licked, with a tongue where she points it and a face where she sits.", acts: ["ass worship", "facesitting", "rimming her"], becomes: "throne" },
  { id: "goddess", name: "goddess", note: "She wants to be worshipped. Not fucked, worshipped: knelt to, praised, served, her body treated as something holy.", acts: ["worship", "furniture", "tribute", "hers"], becomes: "goddess complex" },
  { id: "pegging", name: "pegging", note: "She wants to fuck you with a strap-on, and she thinks about it far more than she lets on.", acts: ["pegging"], becomes: "humiliatrix" },
  { id: "keyholder", name: "keyholder", note: "She wants your cock locked in a cage and the key on a chain around her neck, and to decide when you come, if ever.", acts: ["keyholding", "denial", "teasing"], becomes: "keyholder for life" },
  { id: "spit", name: "spit", note: "She wants to spit in your open mouth and on your face, and watch you take it.", acts: ["spit"], becomes: "humiliatrix" },
  { id: "ballbusting", name: "ballbusting", note: "She gets off on hurting balls with a knee, a kick or a slow squeeze, and on the face someone makes.", acts: ["ballbusting", "cbt"], becomes: "malicious" },
  { id: "findom", name: "findom", note: "Money spent on her because she said so gets her wetter than anything done to her body.", acts: ["tribute"], becomes: "tribute junkie" },
  { id: "sph", name: "size humiliation", note: "She gets off on laughing at a cock, measuring it, comparing it and telling its owner exactly how little it does for her.", acts: ["sph", "humiliating you"], becomes: "humiliatrix" },
  { id: "cuckoldress", name: "cuckoldress", note: "She wants you to watch her with someone better, and to be told about it afterwards in detail.", acts: ["cuckold", "humiliating you", "sharing"], becomes: "cuckqueen" },
  { id: "petplay", name: "petplay", note: "She wants a leash, a bowl, ears, and to be somebody's pet, praised, petted and walked on all fours.", acts: ["petplay", "leash"], becomes: "pet for life" },
  { id: "breathplay", name: "breathplay", note: "She wants a hand on her throat, or her own hand on yours. The edge of air is where she comes.", acts: ["choking", "smother"], becomes: "breath addict" },
  { id: "voyeur", name: "voyeur", note: "She gets off watching other people fuck, you with someone else, or anyone who doesn't know she's there.", acts: ["watching", "servicing", "group", "cuckold"], becomes: "attention whore" },
  { id: "tickling", name: "tickling", note: "Being tickled until she can't breathe does something to her that she can't explain and won't stop asking for.", acts: ["tickle", "ticklish"] },
  { id: "furniture", name: "human furniture", note: "She wants to use a person as furniture, as a footstool, a seat or a table for her drink, and to forget they're there.", acts: ["furniture", "feet"], becomes: "goddess complex" },
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
  { id: "gagfuck queen", note: "She likes having her throat fucked hard.", acts: ["oral", "throat"] },
  { id: "painal queen", note: "She likes rough, painful anal and asks for it.", acts: ["anal", "painal"] },
  { id: "strugglefuck queen", note: "She likes to struggle while she's held down and fucked.", acts: ["restraint", "rough"] },
  { id: "tease", note: "She loves teasing and being teased, the longer the better.", acts: ["teasing", "denial"] },
  { id: "romantic", note: "She's a romantic. Sex is best for her when it comes with affection.", acts: ["kissing", "slow", "sleeping together", "worship"] },
  { id: "perverted", note: "She's up for anything and gets bored of vanilla sex quickly.", acts: ["group", "public use", "unusual", "feet", "watersports", "nipples"] },
  { id: "caring", note: "She cares more about her partner getting off than about getting off herself.", acts: ["oral", "servicing", "aftercare", "feet"] },
  { id: "unflinching", note: "Nothing shocks her. She'll do anything without complaint.", acts: ["anything"] },
  { id: "size queen", note: "She loves big cocks and big toys.", acts: ["vaginal", "anal", "toys"] },
  { id: "throne queen", note: "She likes sitting on faces and is good at it, because she knows how long to stay down.", acts: ["facesitting", "smother", "ass worship"] },
  { id: "scent proud", note: "She's proud of how she smells after a day's work, and likes a nose in her armpit or under her arch.", acts: ["musk", "armpits", "feet"] },
  { id: "edge queen", note: "She likes keeping someone on the edge, for hours, and stopping a second before.", acts: ["keyholding", "denial", "teasing"] },
  { id: "mean girl", note: "She's at her best in bed when she's being mean, laughing, spitting and saying exactly the wrong thing on purpose.", acts: ["sph", "humiliating you", "spit"] },
  { id: "good pet", note: "She loves being petted, leashed and praised like an animal, and stays in it for hours.", acts: ["petplay", "leash", "orders"] },
  { id: "watcher", note: "She likes to watch more than to join in, and says so.", acts: ["watching", "cuckold", "servicing"] },
];

export interface FlawDef { id: FlawId; note: string; hates: string[]; /** what it becomes if she is worked past it */ softens_to?: QuirkId }
export const FLAWS: FlawDef[] = [
  { id: "hates oral", note: "She hates oral sex and gags on it.", hates: ["oral", "throat", "facial"], softens_to: "gagfuck queen" },
  { id: "hates anal", note: "She hates anal. She'll do it, but she resents it.", hates: ["anal", "painal", "rimming"], softens_to: "painal queen" },
  { id: "hates penetration", note: "She hates being penetrated.", hates: ["vaginal", "anal"], softens_to: "strugglefuck queen" },
  { id: "repressed", note: "She's sexually repressed and thinks most sex is dirty.", hates: ["public use", "exposure", "group", "watersports", "feet"], softens_to: "perverted" },
  { id: "idealistic", note: "She's idealistic and thinks sex should mean something, so being used by strangers horrifies her.", hates: ["public use", "group", "degradation", "watersports"], softens_to: "romantic" },
  { id: "shamefast", note: "She's shamefast and can't stand being looked at naked.", hates: ["exposure", "public use"], softens_to: "tease" },
  { id: "apathetic", note: "She's apathetic in bed and just lies there.", hates: [], softens_to: "caring" },
  { id: "crude", note: "She's crude, and says disgusting things during sex that ruin the mood.", hates: [], softens_to: "perverted" },
  { id: "judgemental", note: "She's judgemental about other people's kinks and says so.", hates: ["unusual", "group"], softens_to: "unflinching" },
  { id: "fastidious", note: "She's fastidious about bodies, and sweat, spit, smell and feet make her gag.", hates: ["musk", "armpits", "spit", "feet", "watersports"], softens_to: "scent proud" },
  { id: "bratty", note: "She's a brat. When she's told to do something, she argues, stalls and makes you work for it.", hates: ["orders", "submission", "petplay"], softens_to: "good pet" },
  { id: "prissy", note: "She's prissy about being on top of anyone, and sitting on a face or standing on a man embarrasses her.", hates: ["facesitting", "furniture", "domination"], softens_to: "throne queen" },
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
  /** "hers" is the column the rebuild was missing: acts where she is the one being served, and
   *  where a cock on a slave is a thing you do something with rather than a line on a sheet. */
  group: "use" | "service" | "play" | "discipline" | "tenderness" | "display" | "hers" | "feet";
  tags: string[];
  /** Anatomy required of her. */
  needs?: ("mouth" | "vagina" | "anus" | "dick" | "breasts" | "milk" | "balls" | "feet" | "pregnant" | "belly" | "nipples"
    | "hard" | "prostate" | "clit" | "caged" | "ticklish" | "standing")[];
  /** She is on the receiving end: you do it to her. Her flaws about GIVING (hates oral) don't
   *  fire, and the narrator is told plainly who is doing what. */
  receives?: boolean;
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
  /** What it needs from YOU. "cock": something that comes; "sire": something that can get her
   *  pregnant. Everything else a strap-on or your hands and mouth can do. */
  you?: "cock" | "sire";
  /** Requires her to be willing, or it counts as taken rather than given. */
  wants_devotion?: number;
}

export const ACTS: ActDef[] = [
  // ── use ────────────────────────────────────────────────────────────────────────────────────
  { id: "oral", name: "Use her mouth", what: "she sucks you off", group: "use", tags: ["oral", "servicing"], needs: ["mouth"],
    trains: { oral: 2.5 }, base: { arousal: 6, relaxation: -0.1, bond: 0.5, resentment: 1, release: 6 } },
  { id: "throat", name: "Fuck her throat", what: "you hold her head and fuck her throat", group: "use", tags: ["oral", "throat", "rough"], needs: ["mouth"],
    trains: { oral: 3.5 }, base: { arousal: 4, relaxation: -0.8, bond: -0.5, resentment: 4, release: 8 } },
  { id: "vaginal", name: "Fuck her", what: "you fuck her cunt", group: "use", tags: ["vaginal", "penetration"], needs: ["vagina"],
    trains: { vaginal: 2.5 }, base: { arousal: 10, relaxation: 0.1, bond: 1, resentment: 1, release: 8 } },
  { id: "anal", name: "Fuck her ass", what: "you fuck her ass", group: "use", tags: ["anal", "penetration"], needs: ["anus"],
    trains: { anal: 3 }, base: { arousal: 6, relaxation: -0.4, bond: 0, resentment: 3, release: 8 } },
  { id: "painal", name: "Take her ass dry", what: "you fuck her ass with no lube and no warm-up", group: "use", tags: ["anal", "painal", "pain", "rough"], needs: ["anus"],
    trains: { anal: 4 }, base: { arousal: 2, relaxation: -1.6, bond: -2, resentment: 9, release: 8 } },
  { id: "mammary", you: "cock", name: "Use her tits", what: "you fuck her tits", group: "use", tags: ["mammary", "boobs"], needs: ["breasts"],
    trains: { oral: 0.5 }, base: { arousal: 5, relaxation: 0, bond: 0.5, resentment: 1, release: 6 } },
  { id: "facial", you: "cock", name: "Finish on her face", what: "you cum on her face and make her keep it there for a while", group: "use", tags: ["facial", "cum", "degradation"],
    base: { arousal: 3, relaxation: -0.3, bond: -0.5, resentment: 3, release: 3 } },
  { id: "swallow", you: "cock", name: "Make her swallow", what: "you finish in her mouth and she swallows it", group: "use", tags: ["cum", "swallow", "oral"], needs: ["mouth"],
    base: { arousal: 3, relaxation: -0.2, bond: 0, resentment: 2, release: 3 } },
  { id: "penetrative", name: "Let her fuck you", what: "she fucks you with her cock", group: "use", tags: ["penetrative", "domination", "using another"], needs: ["dick", "hard"],
    trains: { penetrative: 3 }, base: { arousal: 12, relaxation: 0.6, bond: 3, resentment: 0, release: 4 }, wants_devotion: 20 },
  { id: "group", name: "Two of them at once", what: "you have sex with her and another slave at the same time", group: "use", tags: ["group", "unusual", "sharing"],
    trains: { oral: 1.5, vaginal: 1.5 }, base: { arousal: 7, relaxation: -0.5, bond: -0.5, resentment: 3, release: 9 } },

  // ── service ────────────────────────────────────────────────────────────────────────────────
  { id: "servicing", name: "Have her serve another slave", what: "you have her go down on another slave while you watch", group: "service", tags: ["servicing", "oral", "sharing"], needs: ["mouth"],
    trains: { oral: 2 }, base: { arousal: 5, relaxation: -0.2, bond: 0, resentment: 2, release: 2 } },
  { id: "milking", name: "Milk her", what: "you milk her breasts by hand or with a pump", group: "service", tags: ["milking", "boobs"], needs: ["milk"],
    base: { arousal: 4, relaxation: 0.2, bond: 0, resentment: 2, release: 1 } },
  { id: "breeding", you: "sire", name: "Breed her", what: "you cum in her pussy to get her pregnant", group: "service", tags: ["breeding", "vaginal", "pregnancy"], needs: ["vagina"],
    trains: { vaginal: 2 }, base: { arousal: 9, relaxation: -0.2, bond: 1, resentment: 4, release: 9 } },

  // ── play ───────────────────────────────────────────────────────────────────────────────────
  { id: "teasing", name: "Work her up and stop", what: "you get her close to orgasm and then stop", group: "play", tags: ["teasing", "denial"],
    base: { arousal: 18, relaxation: -0.3, bond: 0.5, resentment: 2, release: 0 } },
  { id: "getoff", receives: true, name: "Get her off", what: "you use your hands and mouth to make her cum, and ask for nothing back", group: "play", tags: ["tenderness", "servicing"],
    base: { arousal: -35, relaxation: 1.4, bond: 4, resentment: -3, release: 0 } },
  { id: "toys", name: "Use toys on her", what: "you use vibrators, dildos and plugs on her", group: "play", tags: ["toys", "anal toys", "unusual"],
    trains: { anal: 1 }, base: { arousal: 12, relaxation: -0.2, bond: 0.5, resentment: 1, release: 2 } },
  { id: "rimming", name: "Have her rim you", what: "she licks your asshole", group: "play", tags: ["rimming", "degradation", "servicing"], needs: ["mouth"],
    base: { arousal: 2, relaxation: -0.5, bond: -0.5, resentment: 4, release: 3 } },

  // ── display ────────────────────────────────────────────────────────────────────────────────
  { id: "public use", name: "Use her in public", what: "you fuck her out on the concourse where citizens can watch", group: "display", tags: ["public use", "exposure", "humiliation", "degradation"],
    trains: { whoring: 2 }, base: { arousal: 5, relaxation: -1.2, bond: -1, resentment: 7, release: 7 } },
  { id: "exposure", name: "Show her off", what: "you walk her through the arcology naked so people can look at her", group: "display", tags: ["exposure", "humiliation"],
    base: { arousal: 4, relaxation: -0.9, bond: -0.5, resentment: 5, release: 1 } },
  { id: "degradation", name: "Degrade her", what: "you humiliate her in front of other people and remind her she's a slave", group: "display", tags: ["degradation", "humiliation"],
    base: { arousal: 2, relaxation: -1.4, bond: -2.5, resentment: 9, release: 2 } },

  // ── discipline ─────────────────────────────────────────────────────────────────────────────
  { id: "restraint", name: "Tie her down", what: "you tie her down and use her however you want", group: "discipline", tags: ["restraint", "bondage", "orders"],
    base: { arousal: 8, relaxation: -0.6, bond: 0, resentment: 3, release: 4 } },
  { id: "discipline", name: "Punish her", what: "you punish her with a spanking or a beating, and tell her what it's for", group: "discipline", tags: ["pain", "discipline", "punishment"],
    base: { arousal: 2, relaxation: -1.8, bond: -3, resentment: 8, release: 2 } },
  { id: "orders", name: "Give her an order and watch her obey", what: "you order her to do something humiliating and watch her do it", group: "discipline", tags: ["orders", "humiliation", "submission"],
    base: { arousal: 5, relaxation: -0.5, bond: -0.5, resentment: 4, release: 3 } },


  // ── hers ───────────────────────────────────────────────────────────────────────────────────
  // The old game had a whole second column of these and the rebuild had exactly one. Every act
  // above treats her as somewhere to put something. These treat her as somebody with a body: a
  // tenth of the arcology has a cock and the rest have a cunt, and until now neither fact was
  // anything you could do anything about.
  { id: "suck her", receives: true, name: "Suck her off", what: "you suck her cock until she cums", group: "hers", tags: ["oral", "servicing", "hers", "worship"], needs: ["dick"],
    base: { arousal: -30, relaxation: 1.5, bond: 5, resentment: -4, release: 0 }, wants_devotion: -20 },
  { id: "stroke her", receives: true, name: "Get her off with your hand", what: "you jerk her off until she cums", group: "hers", tags: ["hers", "tenderness", "servicing"], needs: ["dick"],
    base: { arousal: -25, relaxation: 1.1, bond: 3.5, resentment: -3, release: 0 } },
  { id: "ride her", name: "Ride her", what: "you put her on her back and ride her cock", group: "hers", tags: ["penetrative", "hers", "domination"], needs: ["dick", "hard"],
    trains: { penetrative: 3.5 }, base: { arousal: 14, relaxation: 0.8, bond: 3, resentment: -1, release: 5 }, wants_devotion: 10 },
  { id: "take charge", name: "Let her take charge", what: "you lie back and give her control, so she decides what happens, pins you down, sits on your face and rides you, and uses you for her own pleasure", group: "hers", tags: ["domination", "hers", "using another"],
    trains: { vaginal: 1.5, oral: 0.5 }, base: { arousal: 10, relaxation: 0.5, bond: 2.5, resentment: 0, release: 5 }, wants_devotion: 10 },
  { id: "drain her", name: "Empty her", what: "you milk her balls, making her cum over and over until she's dry", group: "hers", tags: ["hers", "oral", "rough", "denial"], needs: ["balls"],
    base: { arousal: -10, relaxation: -0.9, bond: 0.5, resentment: 4, release: 0 } },
  { id: "eat her", receives: true, name: "Go down on her", what: "you eat her pussy until she cums", group: "hers", tags: ["oral", "servicing", "hers", "worship", "tenderness"], needs: ["vagina"],
    base: { arousal: -35, relaxation: 1.7, bond: 5.5, resentment: -5, release: 0 }, wants_devotion: -20 },
  { id: "worship her", receives: true, name: "Worship her", what: "you spend an hour worshipping her body with your hands and mouth", group: "hers", tags: ["hers", "worship", "tenderness", "servicing"],
    base: { arousal: -20, relaxation: 2.0, bond: 7, resentment: -8, release: 0 } },

  // ── her feet ───────────────────────────────────────────────────────────────────────────────
  { id: "footjob", you: "cock", name: "Have her use her feet", what: "she oils her feet and gives you a footjob", group: "feet", tags: ["feet", "servicing", "unusual"], needs: ["feet"],
    trains: { oral: 0.5 }, base: { arousal: 4, relaxation: 0.2, bond: 0.5, resentment: 1, release: 6 } },
  { id: "worship feet", receives: true, name: "Worship her feet", what: "you massage, kiss and suck her feet", group: "feet", tags: ["feet", "worship", "hers", "servicing"], needs: ["feet"],
    base: { arousal: -8, relaxation: 1.2, bond: 4, resentment: -4, release: 0 }, wants_devotion: -30 },
  { id: "make her worship", name: "Make her worship yours", what: "she kneels and kisses, licks and sucks your feet", group: "feet", tags: ["feet", "degradation", "orders", "submission"],
    base: { arousal: 3, relaxation: -0.9, bond: -1, resentment: 6, release: 1 } },

  // ── the body it is doing ───────────────────────────────────────────────────────────────────
  { id: "nipple fuck", you: "cock", name: "Fuck her nipples", what: "you fuck her enlarged nipples", group: "use", tags: ["nipples", "boobs", "unusual", "mammary"], needs: ["nipples"],
    base: { arousal: 8, relaxation: -0.3, bond: 0, resentment: 3, release: 7 } },
  { id: "suckle", name: "Nurse from her", what: "you suck milk from her breasts", group: "service", tags: ["milking", "boobs", "tenderness", "unusual"], needs: ["milk"],
    base: { arousal: 2, relaxation: 1.4, bond: 5, resentment: -3, release: 0 } },
  { id: "belly fuck", you: "cock", name: "Fuck her belly", what: "you fuck the fold under her belly while she holds it up", group: "use", tags: ["pregnancy", "belly worship", "unusual"], needs: ["belly"],
    base: { arousal: 5, relaxation: -0.2, bond: 0.5, resentment: 2, release: 6 } },
  { id: "belly worship", receives: true, name: "Worship her belly", what: "you rub, kiss and worship her pregnant belly", group: "tenderness", tags: ["pregnancy", "belly worship", "worship", "tenderness"], needs: ["pregnant"],
    base: { arousal: 4, relaxation: 1.8, bond: 6, resentment: -6, release: 0 } },
  { id: "breed her back", name: "Let her breed you", what: "she cums inside you to get you pregnant", group: "hers", tags: ["penetrative", "breeding", "hers", "domination", "pregnancy"], needs: ["balls", "hard"],
    trains: { penetrative: 2 }, base: { arousal: 12, relaxation: 1.0, bond: 5, resentment: -2, release: 4 }, wants_devotion: 30 },

  // ── the ugly end ───────────────────────────────────────────────────────────────────────────
  // The base game has these and the rebuild was pretending it was a nicer game than it is.
  { id: "fill her", you: "cock", name: "Fill her ass and plug it", what: "you cum in her ass and plug it so she has to keep it in", group: "discipline", tags: ["anal", "degradation", "cum", "orders"], needs: ["anus"],
    trains: { anal: 2 }, base: { arousal: 4, relaxation: -1.1, bond: -1.5, resentment: 7, release: 8 } },
  { id: "toilet", name: "Use her as a toilet", what: "you piss in her mouth and make her drink it and thank you", group: "discipline", tags: ["watersports", "degradation", "humiliation", "unusual"], needs: ["mouth"],
    base: { arousal: 1, relaxation: -2.2, bond: -4, resentment: 12, release: 2 } },
  { id: "abuse", name: "Take it out on her", what: "you take your bad mood out on her, roughly", group: "discipline", tags: ["pain", "rough", "punishment", "degradation"],
    base: { arousal: 2, relaxation: -2.6, bond: -5, resentment: 14, release: 5 } },

  // ── her cock and balls ─────────────────────────────────────────────────────────────────────
  { id: "ball worship", receives: true, name: "Worship her balls", what: "you lick, suck and fondle her balls, taking each one in your mouth, while you stroke her cock", group: "hers", tags: ["hers", "worship", "servicing"], needs: ["balls"],
    base: { arousal: 18, relaxation: 1.0, bond: 3.5, resentment: -3, release: 0 } },
  { id: "prostate", receives: true, name: "Milk her prostate", what: "you work a lubed finger into her ass and massage her prostate until her cock leaks and she cums without being touched", group: "hers", tags: ["anal", "hers", "milking", "anal toys"], needs: ["prostate", "anus"],
    trains: { anal: 1 }, base: { arousal: -20, relaxation: 0.8, bond: 2.5, resentment: 1, release: 0 } },
  { id: "clit suck", receives: true, name: "Suck her clit", what: "you suck her oversized clit like a little cock until she cums", group: "hers", tags: ["oral", "hers", "worship"], needs: ["clit"],
    base: { arousal: -30, relaxation: 1.4, bond: 4.5, resentment: -4, release: 0 } },
  { id: "frot", you: "cock", name: "Rub cocks with her", what: "you press your cock against hers and grind them together in your fist until you both cum", group: "hers", tags: ["hers", "unusual"], needs: ["dick"],
    base: { arousal: -15, relaxation: 0.6, bond: 2.5, resentment: 0, release: 6 } },
  { id: "cage tease", name: "Tease her through her cage", what: "you stroke and lick her caged cock and fondle her balls until she's desperate and leaking through the cage, and leave her locked", group: "play", tags: ["teasing", "denial", "hers", "submissive"], needs: ["caged"],
    base: { arousal: 25, relaxation: -0.4, bond: 0, resentment: 3, release: 1 } },
  { id: "own cum", name: "Make her eat her own cum", what: "you jerk her off with her cock aimed at her face, then make her lick up and swallow every drop", group: "discipline", tags: ["cum", "degradation", "humiliation", "hers"], needs: ["dick", "balls"],
    base: { arousal: -10, relaxation: -0.8, bond: -1, resentment: 6, release: 2 } },
  { id: "cbt", name: "Torture her cock and balls", what: "you tie off her balls, slap and squeeze them, and flick her cock until she's crying", group: "discipline", tags: ["pain", "discipline", "punishment", "cbt"], needs: ["balls"],
    base: { arousal: 1, relaxation: -2.0, bond: -3, resentment: 10, release: 3 } },

  // ── more of her feet ───────────────────────────────────────────────────────────────────────
  { id: "tickle feet", name: "Tickle her feet", what: "you pin her ankles in your lap and tickle her bare soles until she's shrieking with laughter and begging you to stop", group: "feet", tags: ["feet", "teasing", "humiliation", "play", "tickle"], needs: ["feet", "ticklish"],
    base: { arousal: 4, relaxation: -0.3, bond: 1, resentment: 2, release: 2 } },
  { id: "bastinado", name: "Whip her soles", what: "you tie her ankles up with her soles facing you and cane the soles of her feet, stroke by stroke", group: "discipline", tags: ["feet", "pain", "punishment", "discipline"], needs: ["feet"],
    base: { arousal: 1, relaxation: -1.8, bond: -2.5, resentment: 8, release: 3 } },
  { id: "trample", name: "Have her walk on you", what: "you lie on the floor and she stands on you barefoot, walking over your chest and stomach and resting a sole on your face", group: "feet", tags: ["feet", "domination", "hers"], needs: ["feet", "standing"],
    base: { arousal: 6, relaxation: 0.6, bond: 2, resentment: -1, release: 2 } },
  { id: "foot smother", name: "Have her rest her feet on your face", what: "she sits back and presses her bare soles against your face, making you smell and lick them while she relaxes", group: "feet", tags: ["feet", "domination", "hers"], needs: ["feet"],
    base: { arousal: 5, relaxation: 0.8, bond: 2, resentment: -1, release: 2 } },
  { id: "toe suck", receives: true, name: "Suck her toes", what: "you take her toes into your mouth one at a time and suck them, then lick up her soles", group: "feet", tags: ["feet", "worship", "hers"], needs: ["feet"],
    base: { arousal: 6, relaxation: 1.0, bond: 3, resentment: -2, release: 0 } },
  { id: "sole job", you: "cock", name: "Fuck her soles", what: "she presses her soles together and you fuck the gap between them, then cum across her toes", group: "feet", tags: ["feet", "servicing", "cum"], needs: ["feet"],
    base: { arousal: 3, relaxation: 0.1, bond: 0.5, resentment: 1, release: 6 } },
  { id: "pedicure", name: "Give her a pedicure", what: "you soak her feet, rub lotion into her soles and paint her toenails", group: "tenderness", tags: ["feet", "tenderness", "worship"], needs: ["feet"],
    base: { arousal: 2, relaxation: 1.6, bond: 4, resentment: -4, release: 0 } },

  // ── hers to enjoy ──────────────────────────────────────────────────────────────────────────
  // The tastes the base game never had a word for, and the acts that feed them. Most of these are
  // her doing something to you, or you serving a part of her nobody else bothers with; `femdom`
  // marks the ones where she's on top of you, so the page reads her taking it, not lying back.
  { id: "worship armpits", receives: true, name: "Worship her armpits", what: "you bury your face in her armpits, breathe her in, and kiss and lick them clean while she holds her arm up for you", group: "hers", tags: ["armpits", "musk", "worship", "hers"],
    base: { arousal: 7, relaxation: 1.0, bond: 3.5, resentment: -2, release: 0 }, wants_devotion: -30 },
  { id: "smell her", receives: true, name: "Smell her after her shift", what: "she comes to you unwashed at the end of her shift and you smell her all over, armpits, neck, feet and between her legs, slowly, and tell her how she smells", group: "hers", tags: ["musk", "armpits", "feet", "worship", "hers"],
    base: { arousal: 6, relaxation: 0.8, bond: 2.5, resentment: -1, release: 0 }, wants_devotion: -30 },
  { id: "ass worship", receives: true, name: "Worship her ass", what: "you kneel behind her and worship her ass with your hands and mouth, and lick wherever she reaches back and points", group: "hers", tags: ["ass worship", "worship", "hers", "rimming her"],
    base: { arousal: 9, relaxation: 1.0, bond: 3.5, resentment: -2, release: 0 }, wants_devotion: -20 },
  { id: "facesit", name: "Let her sit on your face", what: "you lie back and she sits on your face with all her weight, thighs closed around your head, and decides when you get to breathe", group: "hers", tags: ["facesitting", "smother", "domination", "hers", "ass worship", "femdom"],
    base: { arousal: 13, relaxation: 0.8, bond: 3, resentment: -1, release: 2 }, wants_devotion: 0 },
  { id: "peg you", name: "Let her peg you", what: "she buckles on a strap-on, bends you over, and fucks your ass at her own pace while she tells you how you look", group: "hers", tags: ["pegging", "domination", "hers", "femdom"],
    trains: { penetrative: 2 }, base: { arousal: 11, relaxation: 0.7, bond: 3, resentment: -1, release: 4 }, wants_devotion: 15 },
  { id: "lock you", you: "cock", name: "Give her the key", what: "you let her lock your cock in a chastity cage and hang the only key on a chain around her neck, and she decides when, and whether, you come", group: "hers", tags: ["keyholding", "denial", "domination", "hers", "femdom"],
    base: { arousal: 9, relaxation: 0.6, bond: 3, resentment: -1, release: 0 }, wants_devotion: 10 },
  { id: "spit", name: "Let her spit in your mouth", what: "you kneel with your mouth open and she spits in it, then on your face, and watches you swallow", group: "hers", tags: ["spit", "domination", "hers", "humiliating you", "femdom"],
    base: { arousal: 6, relaxation: 0.4, bond: 1.5, resentment: -1, release: 0 }, wants_devotion: 0 },
  { id: "ballbust", you: "sire", name: "Let her kick your balls", what: "you stand with your legs apart and your hands behind your back while she knees, kicks and squeezes your balls and watches your face", group: "hers", tags: ["ballbusting", "pain on another", "domination", "hers", "femdom"],
    base: { arousal: 8, relaxation: 0.5, bond: 2, resentment: -1, release: 0 }, wants_devotion: 10 },
  { id: "mock your cock", you: "cock", name: "Let her laugh at your cock", what: "she looks your cock over, measures it against her hand and her toys, and tells you exactly what she thinks of it", group: "hers", tags: ["sph", "humiliating you", "domination", "hers", "femdom"],
    base: { arousal: 6, relaxation: 0.5, bond: 1.5, resentment: -1, release: 1 }, wants_devotion: 0 },
  { id: "footstool", name: "Be her footstool", what: "you kneel on all fours and she uses you as furniture for the evening, with her feet on your back and her drink on you, and she forgets you're there", group: "feet", tags: ["furniture", "feet", "domination", "hers", "femdom"], needs: ["feet"],
    base: { arousal: 3, relaxation: 1.3, bond: 2.5, resentment: -2, release: 0 }, wants_devotion: -10 },
  { id: "watch her", name: "Watch her with another man", what: "she has one of your guards in your bed while you sit in the corner and watch, and afterwards she tells you how much bigger and better he was", group: "hers", tags: ["cuckold", "sharing", "humiliating you", "hers", "watching", "femdom"],
    base: { arousal: 14, relaxation: 0.4, bond: 1, resentment: 0, release: 2 }, wants_devotion: 20 },
  { id: "choked by her", name: "Let her choke you", what: "she straddles you and wraps her hand around your throat, and squeezes, and lets go, and squeezes, watching your face", group: "hers", tags: ["choking", "domination", "hers", "smother", "femdom"],
    base: { arousal: 9, relaxation: 0.5, bond: 2, resentment: -1, release: 3 }, wants_devotion: 10 },
  { id: "tribute", name: "Pay her tribute", what: "you hand her ¤1,500 because she told you to, and thank her for taking it", group: "hers", tags: ["tribute", "worship", "hers", "femdom"],
    base: { arousal: 6, relaxation: 1.0, bond: 3, resentment: -2, release: 0 }, wants_devotion: 0 },
  { id: "choke her", name: "Choke her", what: "you hold her down by the throat while you use her, and decide when she breathes", group: "play", tags: ["choking", "rough", "submission"],
    base: { arousal: 8, relaxation: -0.8, bond: -0.5, resentment: 4, release: 3 } },
  { id: "leash her", name: "Put her on a leash", what: "you put ears and a collar with a leash on her and walk her around your suite on all fours, and pet her when she's good", group: "play", tags: ["petplay", "leash", "orders", "submission"],
    base: { arousal: 5, relaxation: -0.2, bond: 0.5, resentment: 3, release: 1 } },
  { id: "tickle her", name: "Tickle her", what: "you pin her down and tickle her ribs, her sides and under her arms until she's shrieking and can't breathe", group: "play", tags: ["tickle", "teasing", "play"],
    base: { arousal: 5, relaxation: 0.2, bond: 1.5, resentment: 1, release: 1 } },

  // ── tenderness ─────────────────────────────────────────────────────────────────────────────
  { id: "kissing", name: "Kiss her", what: "you kiss her, slowly and properly", group: "tenderness", tags: ["kissing", "slow", "tenderness"],
    base: { arousal: 8, relaxation: 0.8, bond: 3, resentment: -2, release: 0 } },
  { id: "slow", name: "Take your time with her", what: "you have long, slow sex with her and make sure she enjoys it", group: "tenderness", tags: ["slow", "tenderness", "kissing"],
    trains: { vaginal: 1, oral: 1 }, base: { arousal: 14, relaxation: 1.6, bond: 6, resentment: -5, release: 7 } },
  { id: "sleeping together", name: "Let her sleep in your bed", what: "she sleeps the night in your bed with you, and you don't have sex with her", group: "tenderness", tags: ["sleeping together", "tenderness", "slow"],
    base: { arousal: 0, relaxation: 1.8, bond: 7, resentment: -6, release: 0 } },
  { id: "aftercare", name: "Look after her afterwards", what: "after sex you clean her up, hold her and look after her until she's recovered", group: "tenderness", tags: ["aftercare", "tenderness"],
    base: { arousal: -5, relaxation: 1.5, bond: 5, resentment: -7, release: 0 } },
  { id: "talk", name: "Just talk to her", what: "you sit and talk with her about her life and listen to what she says", group: "tenderness", tags: ["talk", "tenderness"],
    base: { arousal: 0, relaxation: 0.9, bond: 4, resentment: -4, release: 0 } },
    { id: "eat Shit", name: "ask her to feed you", what: "you sit under her and open your mouth, and beg her to let you eat her shit", group: "tenderness", tags: ["shit", "tenderness"],
    base: { arousal: 2, relaxation: 2.9, bond: 8, resentment: -4, release: 0 } },
];

export const ACT_BY_ID: Record<string, ActDef> = Object.fromEntries(ACTS.map((a) => [a.id, a]));

/** Which hole she would pick if it were up to her. The base game's `preferredHole`, kept. */
export type Hole = "mouth" | "vagina" | "anus" | "dick" | "boobs";

export const HOLE_LABEL: Record<Hole, string> = {
  mouth: "her mouth", vagina: "her cunt", anus: "her ass", dick: "her cock", boobs: "her tits",
};
