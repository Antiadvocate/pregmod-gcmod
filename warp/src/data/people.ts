/**
 * THE SOURCE MATERIAL — where a person comes from before the forge touches them.
 *
 * Two jobs. First, the deterministic generator needs somewhere to draw a nationality, a name, a
 * face and a life from, so that WARP IS PLAYABLE WITH NO MODEL CONFIGURED AT ALL. That matters
 * more than it sounds: an engine that cannot make a person without an API key is an engine whose
 * whole cast is hostage to somebody's billing, and the old game's greatest strength was that it
 * ran on a laptop in a plane with the wifi off.
 *
 * Second, when a model IS configured, this is the sketch it gets handed. The forge does not invent
 * a person from nothing — it is given a nationality, an age, a career and a body, and asked for
 * the interior. That is why forged people here have specific histories instead of the smooth
 * plausible mush a model produces from an empty prompt.
 */

export interface Nation {
  name: string;
  race: string;
  /** Rough share of the global slave trade, weighting the markets. */
  weight: number;
  female: string[];
  male: string[];
  surnames: string[];
  /** Skin and hair the generator draws from, in order of frequency. */
  skin: string[];
  hair: string[];
  eyes: string[];
  /** Median adult height in cm, female. Male adds 13. */
  height: number;
}

export const NATIONS: Nation[] = [
  { name: "Japanese", race: "asian", weight: 6, height: 158,
    female: ["Aiko", "Hana", "Yui", "Rin", "Sakura", "Mei", "Nanami", "Kaori", "Emi", "Chiyo"],
    male: ["Haruto", "Ren", "Sota", "Kaito", "Yuto", "Riku"],
    surnames: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Nakamura"],
    skin: ["pale", "light", "fair"], hair: ["black", "dark brown"], eyes: ["brown", "dark brown"] },
  { name: "Chinese", race: "asian", weight: 9, height: 159,
    female: ["Li", "Xiu", "Mei", "Jing", "Yan", "Lan", "Ning", "Qing", "Fang"],
    male: ["Wei", "Jun", "Hao", "Lei", "Chen"],
    surnames: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang"],
    skin: ["light", "pale", "olive"], hair: ["black", "dark brown"], eyes: ["brown", "dark brown"] },
  { name: "Russian", race: "white", weight: 7, height: 165,
    female: ["Anastasia", "Yelena", "Irina", "Katya", "Svetlana", "Nadia", "Olga", "Vera", "Marina"],
    male: ["Dmitri", "Sergei", "Pavel", "Anton", "Yuri"],
    surnames: ["Ivanova", "Petrova", "Sokolova", "Volkova", "Morozova", "Popova"],
    skin: ["pale", "fair", "light"], hair: ["blonde", "light brown", "brown", "auburn"], eyes: ["blue", "grey", "green", "hazel"] },
  { name: "Brazilian", race: "latina", weight: 8, height: 161,
    female: ["Ana", "Beatriz", "Camila", "Larissa", "Júlia", "Fernanda", "Rafaela", "Bruna"],
    male: ["Lucas", "Gabriel", "Rafael", "Thiago"],
    surnames: ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira"],
    skin: ["olive", "brown", "tan", "dark"], hair: ["black", "dark brown", "brown"], eyes: ["brown", "dark brown", "hazel"] },
  { name: "American", race: "mixed", weight: 10, height: 163,
    female: ["Ashley", "Madison", "Brianna", "Kayla", "Destiny", "Hailey", "Sierra", "Jasmine", "Cheyenne"],
    male: ["Tyler", "Cody", "Austin", "Dylan", "Brandon"],
    surnames: ["Miller", "Davis", "Brooks", "Reyes", "Nguyen", "Washington", "Kowalski"],
    skin: ["fair", "light", "olive", "brown", "dark"], hair: ["blonde", "brown", "black", "auburn", "red"], eyes: ["blue", "brown", "green", "hazel"] },
  { name: "Nigerian", race: "black", weight: 7, height: 162,
    female: ["Chidinma", "Amara", "Ngozi", "Adaeze", "Folake", "Zainab", "Yetunde"],
    male: ["Emeka", "Chidi", "Kayode", "Ibrahim"],
    surnames: ["Okafor", "Adeyemi", "Balogun", "Eze", "Abubakar", "Nwosu"],
    skin: ["dark", "deep brown", "brown"], hair: ["black"], eyes: ["dark brown", "brown"] },
  { name: "Egyptian", race: "middle eastern", weight: 5, height: 160,
    female: ["Nadia", "Layla", "Yasmin", "Farida", "Amira", "Salma", "Dalia"],
    male: ["Karim", "Omar", "Tarek", "Youssef"],
    surnames: ["Hassan", "Mahmoud", "Fahmy", "Nasser", "Said"],
    skin: ["olive", "tan", "light brown"], hair: ["black", "dark brown"], eyes: ["dark brown", "brown", "hazel"] },
  { name: "German", race: "white", weight: 5, height: 166,
    female: ["Lena", "Hanna", "Mia", "Greta", "Annika", "Ingrid", "Franziska"],
    male: ["Lukas", "Jonas", "Felix", "Matthias"],
    surnames: ["Müller", "Schmidt", "Weber", "Fischer", "Wagner", "Becker"],
    skin: ["fair", "pale", "light"], hair: ["blonde", "light brown", "brown"], eyes: ["blue", "green", "grey", "hazel"] },
  { name: "Indian", race: "indo-aryan", weight: 9, height: 155,
    female: ["Priya", "Ananya", "Kavya", "Meera", "Divya", "Ishita", "Nisha"],
    male: ["Arjun", "Rohan", "Vikram", "Aditya"],
    surnames: ["Sharma", "Patel", "Reddy", "Iyer", "Singh", "Nair"],
    skin: ["brown", "light brown", "olive", "dark"], hair: ["black", "dark brown"], eyes: ["dark brown", "brown"] },
  { name: "Mexican", race: "latina", weight: 8, height: 158,
    female: ["Guadalupe", "Ximena", "Valentina", "Regina", "Lucía", "Itzel", "Renata"],
    male: ["Diego", "Santiago", "Emiliano", "Mateo"],
    surnames: ["Hernández", "García", "Martínez", "López", "Ramírez", "Flores"],
    skin: ["tan", "olive", "brown"], hair: ["black", "dark brown"], eyes: ["dark brown", "brown"] },
  { name: "French", race: "white", weight: 4, height: 164,
    female: ["Camille", "Élise", "Manon", "Chloé", "Amélie", "Océane"],
    male: ["Hugo", "Louis", "Théo", "Antoine"],
    surnames: ["Dubois", "Moreau", "Laurent", "Girard", "Lefèvre"],
    skin: ["fair", "light", "olive"], hair: ["brown", "dark brown", "blonde"], eyes: ["brown", "green", "blue", "hazel"] },
  { name: "Ukrainian", race: "white", weight: 6, height: 166,
    female: ["Oksana", "Yulia", "Daryna", "Sofiya", "Halyna", "Alina"],
    male: ["Taras", "Bohdan", "Andriy"],
    surnames: ["Shevchenko", "Bondarenko", "Tkachenko", "Kovalenko"],
    skin: ["pale", "fair"], hair: ["blonde", "light brown", "brown"], eyes: ["blue", "grey", "green"] },
  { name: "Filipina", race: "asian", weight: 6, height: 152,
    female: ["Maria", "Angeline", "Jasmin", "Rosalie", "Divina", "Marilou"],
    male: ["Jomar", "Andres", "Rico"],
    surnames: ["Santos", "Reyes", "Cruz", "Bautista", "Villanueva"],
    skin: ["brown", "tan", "light brown"], hair: ["black", "dark brown"], eyes: ["dark brown", "brown"] },
  { name: "Vietnamese", race: "asian", weight: 5, height: 153,
    female: ["Linh", "Mai", "Thao", "Trang", "Ngoc", "Hoa"],
    male: ["Minh", "Tuan", "Hieu"],
    surnames: ["Nguyen", "Tran", "Le", "Pham", "Vo"],
    skin: ["light", "tan", "olive"], hair: ["black"], eyes: ["dark brown", "brown"] },
  { name: "Ethiopian", race: "black", weight: 4, height: 160,
    female: ["Selam", "Hanan", "Mekdes", "Bethlehem", "Tigist"],
    male: ["Dawit", "Yonas", "Abel"],
    surnames: ["Tesfaye", "Bekele", "Haile", "Girma"],
    skin: ["deep brown", "brown", "dark"], hair: ["black", "dark brown"], eyes: ["dark brown", "brown"] },
  { name: "Italian", race: "white", weight: 4, height: 163,
    female: ["Giulia", "Chiara", "Francesca", "Alessia", "Martina"],
    male: ["Matteo", "Alessandro", "Giovanni"],
    surnames: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi"],
    skin: ["olive", "light", "tan"], hair: ["dark brown", "black", "brown"], eyes: ["brown", "hazel", "green"] },
];

/** Total weight, precomputed — the generator draws against it constantly. */
export const NATION_WEIGHT = NATIONS.reduce((n, c) => n + c.weight, 0);

/** What they did before. Careers carry real starting skills and real starting attitudes; the
 *  second string is how a person with that history tends to arrive. */
export const CAREERS: { name: string; skills: Record<string, number>; arrives: string; smart?: number }[] = [
  { name: "student", skills: {}, arrives: "young, confused and frightened", smart: 1 },
  { name: "waitress", skills: { entertainment: 15 }, arrives: "used to smiling at rude customers" },
  { name: "nurse", skills: { management: 20 }, arrives: "competent, and horrified by the medical care here", smart: 1 },
  { name: "teacher", skills: { management: 20 }, arrives: "still correcting people's grammar, which gets her in trouble", smart: 2 },
  { name: "prostitute", skills: { whoring: 35, oral: 25, vaginal: 25 }, arrives: "not surprised; she's done sex work before" },
  { name: "escort", skills: { whoring: 30, entertainment: 25, oral: 20 }, arrives: "expecting better treatment than she's getting" },
  { name: "dancer", skills: { entertainment: 35 }, arrives: "graceful, and used to being watched" },
  { name: "soldier", skills: { combat: 40 }, arrives: "looking for a way out, and not hiding it well" },
  { name: "police officer", skills: { combat: 25, management: 10 }, arrives: "bitter about being on the wrong side of the law she used to enforce" },
  { name: "farmer", skills: {}, arrives: "tough, practical and not easily scared" },
  { name: "housewife", skills: {}, arrives: "grieving the husband and home she lost" },
  { name: "office worker", skills: { management: 10 }, arrives: "waiting for somebody to tell her the rules", smart: 1 },
  { name: "musician", skills: { entertainment: 40 }, arrives: "quiet and observant" },
  { name: "athlete", skills: { combat: 15 }, arrives: "fit and strong, and angry that her body now belongs to someone else" },
  { name: "criminal", skills: { combat: 20 }, arrives: "already sizing up who she can take advantage of" },
  { name: "servant", skills: {}, arrives: "used to serving, and fitting in quickly" },
  { name: "engineer", skills: { management: 15 }, arrives: "critical of how everything here is built", smart: 2 },
  { name: "model", skills: { entertainment: 20 }, arrives: "vain, and aware her looks are all she has left" },
  { name: "gamer", skills: {}, arrives: "distracted and a bit out of it" },
  { name: "nun", skills: {}, arrives: "still praying, and more and more devout" },
];

/** How somebody ends up in an arcology. The one line is the story the market tells. */
export const ORIGINS: { how: string; line: string; devotion: number; trust: number; bond: number }[] = [
  { how: "debt", line: "sold to pay off a family debt", devotion: -5, trust: -10, bond: -5 },
  { how: "kidnapped", line: "kidnapped off the street in a lawless part of the Old World", devotion: -25, trust: -35, bond: -25 },
  { how: "sold by family", line: "sold by her own family", devotion: -15, trust: -30, bond: -20 },
  { how: "volunteered", line: "volunteered for enslavement at a broker's office", devotion: 15, trust: 10, bond: 10 },
  { how: "convict", line: "enslaved as a criminal sentence", devotion: -10, trust: -15, bond: -10 },
  { how: "war", line: "captured as a prisoner of war", devotion: -20, trust: -30, bond: -20 },
  { how: "born to it", line: "born a slave in an arcology", devotion: 20, trust: 5, bond: 5 },
  { how: "bankruptcy", line: "enslaved when her business went bankrupt", devotion: 0, trust: -5, bond: 0 },
  { how: "trafficked", line: "trafficked through several owners before you", devotion: -20, trust: -40, bond: -25 },
];
