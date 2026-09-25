/**
 * HERO SLAVES — women there is only one of.
 *
 * The original kept a list of hand-written unique slaves who turned up rarely at market, each with
 * a history and a body and a temper that no generator would roll. These are this game's own: each
 * appears at most once a game, at the elite auction or in the shark's back room, and the seller
 * knows exactly what she is.
 */
import type { Feet, Skills } from "../engine/types";

export interface HeroDef {
  id: string;
  name: string;
  surname: string;
  age: number;
  nation: string;
  sex?: "female" | "futa";
  career: string;
  /** How she came to be sold, one paragraph. */
  story: string;
  pitch: string;
  traits: string[];
  speech: string;
  line: string;
  fetish?: { name: string; strength: number };
  quirk?: string;
  flaw?: string;
  intelligence: "slow" | "average" | "sharp" | "brilliant";
  education: number;
  conscience: number;
  skills: Partial<Skills>;
  body: { face?: number; height_cm?: number; hair_color?: string; hair_length?: number; eye_color?: string; skin?: string; boobs?: number; butt?: number; muscle?: number; dick?: number; balls?: number };
  feet?: Partial<Feet>;
  /** Devotion and fear she arrives with. */
  bond?: { bond?: number; fear?: number; resentment?: number; hope?: number };
  /** Price over what she'd normally be worth. */
  markup: number;
}

export const HEROES: HeroDef[] = [
  {
    id: "valka", name: "Valka", surname: "Oyelaran", age: 29, nation: "Nigerian",
    career: "a heavyweight boxer",
    story: "She held a title in Lagos for three years and lost it to a fixed fight, then lost everything else betting on the rematch.",
    pitch: "a champion boxer; she broke the last handler's jaw, so bring two",
    traits: ["cracks her knuckles one at a time when she's thinking", "stands with her weight on the balls of her feet", "watches doors"],
    speech: "slow, low, and very few words", line: "Hit me first. Then we'll see who's the owner.",
    fetish: { name: "dom", strength: 70 }, quirk: "unflinching", flaw: "crude",
    intelligence: "average", education: 35, conscience: 0.55,
    skills: { combat: 85, entertainment: 20 },
    body: { face: 58, height_cm: 186, hair_color: "black", hair_length: 2, eye_color: "dark brown", skin: "dark brown", boobs: 450, butt: 4, muscle: 70 },
    feet: { size: 43, arch: "high", soles: "calloused", width: "wide", shape: "roman" },
    bond: { bond: -20, fear: 5, resentment: 40, hope: 40 }, markup: 1.6,
  },
  {
    id: "mireille", name: "Mireille", surname: "Delacroix", age: 34, nation: "French",
    career: "a principal dancer with the Paris ballet",
    story: "She danced lead at the Opéra until the city emptied; she sold herself to a collector to keep her mother in a clinic, and the collector has died.",
    pitch: "a prima ballerina; the feet alone are worth the price",
    traits: ["stands in fifth position without noticing", "stretches her insteps against the furniture", "eats almost nothing"],
    speech: "precise, formal French-accented English, never contracts a word", line: "You may look. Everyone does. It is what I was made for.",
    fetish: { name: "humiliation", strength: 55 }, quirk: "tease", flaw: "judgemental",
    intelligence: "sharp", education: 70, conscience: 0.5,
    skills: { entertainment: 95, oral: 30 },
    body: { face: 82, height_cm: 168, hair_color: "dark brown", hair_length: 60, eye_color: "grey", skin: "pale", boobs: 280, butt: 2, muscle: 40 },
    feet: { size: 37, arch: "high", soles: "calloused", width: "narrow", shape: "egyptian", toenails: "pale pink" },
    bond: { bond: 0, fear: 20, resentment: 25, hope: 30 }, markup: 1.8,
  },
  {
    id: "sun", name: "Sun", surname: "Xiaolan", age: 26, nation: "Chinese",
    career: "a hacker for a Shenzhen crime syndicate",
    story: "She stole from the people she worked for, got caught, and was sold instead of killed because someone thought she might be useful.",
    pitch: "a hacker; she can open anything with a screen, and she knows it",
    traits: ["types on her own thigh when she's bored", "never sits with her back to a room", "chews her hair"],
    speech: "fast, sarcastic, all lower case if she could manage it", line: "Your network's a joke. I could own you from the laundry.",
    fetish: { name: "submissive", strength: 45 }, quirk: "perverted", flaw: "apathetic",
    intelligence: "brilliant", education: 85, conscience: 0.3,
    skills: { entertainment: 15 },
    body: { face: 66, height_cm: 157, hair_color: "black", hair_length: 45, eye_color: "dark brown", skin: "fair", boobs: 300, butt: 2 },
    feet: { size: 35, arch: "normal", soles: "soft", width: "narrow", shape: "greek" },
    bond: { bond: -10, fear: 15, resentment: 35, hope: 50 }, markup: 1.5,
  },
  {
    id: "harriet", name: "Harriet", surname: "Whitlock", age: 41, nation: "American",
    career: "a senator's wife",
    story: "Her husband lost the election and then the country; she was on the last plane out, and the plane landed in a Free City that took its passengers as payment.",
    pitch: "an Old World senator's wife; still thinks she's in charge",
    traits: ["straightens anything crooked on a table", "smiles with her mouth only", "holds her hands folded at her waist"],
    speech: "gracious, Southern, and cutting underneath", line: "I'm sure you mean well, sugar. Now fetch me a chair.",
    fetish: { name: "masochist", strength: 60 }, quirk: "caring", flaw: "judgemental",
    intelligence: "sharp", education: 75, conscience: 0.45,
    skills: { entertainment: 60, oral: 45 },
    body: { face: 70, height_cm: 170, hair_color: "blonde", hair_length: 35, eye_color: "blue", skin: "fair", boobs: 650, butt: 4 },
    feet: { size: 39, arch: "normal", soles: "soft", width: "average", shape: "egyptian", toenails: "red" },
    bond: { bond: -30, fear: 10, resentment: 60, hope: 35 }, markup: 1.4,
  },
  {
    id: "iolanthe", name: "Iolanthe", surname: "Achterberg", age: 23, nation: "German",
    sex: "futa", career: "a medical student",
    story: "She was born with both and hid it all her life, until a clinic records breach put her on a sale list in three arcologies at once.",
    pitch: "a medical student with a secret between her legs; very rare",
    traits: ["pulls her sleeves over her hands", "apologises when someone bumps into her", "reads the labels on everything"],
    speech: "careful and quiet, with a medical word where a rude one would do", line: "It's called a phallus. You don't need to stare at it.",
    fetish: { name: "submissive", strength: 65 }, quirk: "romantic", flaw: "shamefast",
    intelligence: "brilliant", education: 80, conscience: 0.8,
    skills: { oral: 20, penetrative: 25 },
    body: { face: 74, height_cm: 172, hair_color: "strawberry blonde", hair_length: 50, eye_color: "green", skin: "pale", boobs: 380, butt: 3, dick: 4, balls: 3 },
    feet: { size: 40, arch: "normal", soles: "soft", width: "narrow", shape: "greek" },
    bond: { bond: 0, fear: 45, resentment: 15, hope: 30 }, markup: 1.7,
  },
  {
    id: "sister_agnes", name: "Agnes", surname: "Moreau", age: 31, nation: "Italian",
    career: "a nun",
    story: "Her convent in the hills ran out of food, then out of sisters; the last three walked to the coast and sold themselves for passage for the orphans.",
    pitch: "a nun from the hill convents; still prays three times a day",
    traits: ["crosses herself before she eats", "keeps her eyes down", "hums hymns when she scrubs"],
    speech: "soft and plain, quotes scripture when frightened", line: "I'll do what I'm told. I won't pretend to like it.",
    fetish: { name: "none", strength: 0 }, quirk: "caring", flaw: "repressed",
    intelligence: "average", education: 55, conscience: 0.95,
    skills: { entertainment: 10 },
    body: { face: 72, height_cm: 164, hair_color: "brown", hair_length: 30, eye_color: "hazel", skin: "olive", boobs: 420, butt: 3 },
    feet: { size: 37, arch: "flat", soles: "calloused", width: "average", shape: "egyptian" },
    bond: { bond: 5, fear: 30, resentment: 10, hope: 45 }, markup: 1.3,
  },
  {
    id: "renata", name: "Renata", surname: "Ferreira", age: 27, nation: "Brazilian",
    career: "a samba queen at Carnival",
    story: "She led her samba school for four Carnivals; after the last one, the school's owner sold its dancers to pay the band.",
    pitch: "a Carnival samba queen; she's never been shy about anything",
    traits: ["can't keep still when there's music", "touches whoever she's talking to", "laughs from the belly"],
    speech: "loud, warm, flirty, half in Portuguese", line: "Ai, you're the owner? You're cuter than the last one.",
    fetish: { name: "buttslut", strength: 75 }, quirk: "perverted", flaw: "crude",
    intelligence: "average", education: 30, conscience: 0.6,
    skills: { entertainment: 80, anal: 55, vaginal: 45, whoring: 30 },
    body: { face: 76, height_cm: 165, hair_color: "dark brown", hair_length: 55, eye_color: "brown", skin: "tan", boobs: 550, butt: 7, muscle: 30 },
    feet: { size: 38, arch: "high", soles: "normal", width: "average", shape: "roman", toenails: "gold" },
    bond: { bond: 20, fear: 5, resentment: 5, hope: 60 }, markup: 1.5,
  },
  {
    id: "yuki", name: "Yuki", surname: "Ishikawa", age: 24, nation: "Japanese",
    career: "a pop idol",
    story: "Her agency owned her contract before anyone owned her; when the agency went under, the contracts were sold as assets, with the girls attached.",
    pitch: "a real pop idol from the Old World; she still has fans",
    traits: ["makes a peace sign at cameras without thinking", "bows when she's told off", "counts her steps"],
    speech: "bright and polite, with a smile you can hear", line: "Thank you for your support! ...Is that what I'm supposed to say now?",
    fetish: { name: "humiliation", strength: 50 }, quirk: "tease", flaw: "shamefast",
    intelligence: "average", education: 50, conscience: 0.6,
    skills: { entertainment: 90, oral: 25 },
    body: { face: 88, height_cm: 155, hair_color: "black", hair_length: 50, eye_color: "dark brown", skin: "fair", boobs: 320, butt: 2 },
    feet: { size: 34, arch: "normal", soles: "soft", width: "narrow", shape: "egyptian", toenails: "pink" },
    bond: { bond: 10, fear: 25, resentment: 10, hope: 50 }, markup: 1.9,
  },
  {
    id: "dunya", name: "Dunya", surname: "Novak", age: 38, nation: "Russian",
    career: "a tank commander",
    story: "Her brigade was the last to surrender; the victors sold the officers, and she was sold last because nobody wanted to be the one to take her collar off.",
    pitch: "an Old World tank commander; she's killed more people than you've met",
    traits: ["counts exits", "sleeps sitting up", "eats fast with her arm around the plate"],
    speech: "flat orders, even when she's the one being ordered", line: "Report. Where do I stand, and who do I kill.",
    fetish: { name: "sadist", strength: 55 }, quirk: "unflinching", flaw: "apathetic",
    intelligence: "sharp", education: 60, conscience: 0.35,
    skills: { combat: 90 },
    body: { face: 55, height_cm: 176, hair_color: "blonde", hair_length: 8, eye_color: "grey", skin: "pale", boobs: 500, butt: 4, muscle: 60 },
    feet: { size: 41, arch: "normal", soles: "calloused", width: "wide", shape: "germanic" },
    bond: { bond: -25, fear: 0, resentment: 45, hope: 25 }, markup: 1.5,
  },
  {
    id: "priya", name: "Priya", surname: "Castellan", age: 30, nation: "Indian",
    career: "a surgeon",
    story: "She ran a field hospital through two sieges; when the city fell, the new government sold its doctors to pay for its army.",
    pitch: "a trauma surgeon; put her in your clinic and she'll save lives",
    traits: ["washes her hands too often", "looks at people's eyes to check their pupils", "hums while she concentrates"],
    speech: "brisk, dry, and clinical, softened only for patients", line: "Lie back. This will hurt. Then it will stop.",
    fetish: { name: "dom", strength: 50 }, quirk: "caring", flaw: "judgemental",
    intelligence: "brilliant", education: 95, conscience: 0.85,
    skills: {},
    body: { face: 68, height_cm: 162, hair_color: "black", hair_length: 40, eye_color: "dark brown", skin: "light brown", boobs: 400, butt: 3 },
    feet: { size: 37, arch: "high", soles: "normal", width: "narrow", shape: "greek" },
    bond: { bond: -5, fear: 10, resentment: 30, hope: 40 }, markup: 1.4,
  },
  {
    id: "amara", name: "Amara", surname: "Sarr", age: 22, nation: "Ethiopian",
    career: "a marathon runner",
    story: "She ran for her country at the last Games anyone held; the country stopped existing while she was abroad, and she was sold with the team's luggage.",
    pitch: "an Olympic runner; legs like nothing you've seen",
    traits: ["runs up stairs two at a time", "stretches her calves against walls", "goes very quiet when she's angry"],
    speech: "shy, careful English, with long silences", line: "I can run very far. Tell me where it's safe to run to.",
    fetish: { name: "none", strength: 0 }, quirk: "romantic", flaw: "idealistic",
    intelligence: "average", education: 45, conscience: 0.75,
    skills: { combat: 30 },
    body: { face: 80, height_cm: 171, hair_color: "black", hair_length: 10, eye_color: "dark brown", skin: "deep brown", boobs: 250, butt: 3, muscle: 45 },
    feet: { size: 38, arch: "high", soles: "calloused", width: "narrow", shape: "egyptian" },
    bond: { bond: 5, fear: 30, resentment: 15, hope: 55 }, markup: 1.4,
  },
  {
    id: "leonie", name: "Leonie", surname: "Bellamy", age: 45, nation: "French",
    career: "a madam who ran the best house in Marseille",
    story: "She ran the finest brothel on the coast for twenty years, until a rival bought her debts and sold her with the furniture.",
    pitch: "a madam from Marseille; she'll run your brothel better than you can",
    traits: ["assesses everyone's price when they walk in", "smokes thin cigarettes", "never raises her voice"],
    speech: "worldly and amused, calls everyone 'darling'", line: "Darling, I've owned more girls than you have. Let's not pretend.",
    fetish: { name: "dom", strength: 60 }, quirk: "perverted", flaw: "crude",
    intelligence: "sharp", education: 55, conscience: 0.4,
    skills: { whoring: 90, oral: 80, vaginal: 75, anal: 70, entertainment: 70 },
    body: { face: 72, height_cm: 169, hair_color: "auburn", hair_length: 40, eye_color: "green", skin: "fair", boobs: 700, butt: 5 },
    feet: { size: 38, arch: "normal", soles: "soft", width: "average", shape: "roman", toenails: "deep purple" },
    bond: { bond: 10, fear: 0, resentment: 20, hope: 40 }, markup: 1.3,
  },
];

export const HERO_BY_ID: Record<string, HeroDef> = Object.fromEntries(HEROES.map((h) => [h.id, h]));
