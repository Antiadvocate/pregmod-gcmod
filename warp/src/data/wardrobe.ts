/**
 * WHAT SHE IS WEARING — and what the arcology reads off it.
 *
 * Clothing was free text, which meant the narrator could describe it and nothing else could see
 * it. Here each item carries what it actually does: how much it raises what she earns, what it
 * does to a body's own sense of itself, and which doctrines approve. A collar is not decoration in
 * an arcology; it is a legal document you can see from across a room.
 */

export interface Garment {
  id: string;
  name: string;
  slot: "clothes" | "collar" | "shoes" | "legwear";
  cost: number;
  /** Multiplier on what she earns from being looked at. */
  appeal: number;
  /** Weekly shove to the nervous system — dignity, exposure, or the lack of both. */
  relaxation: number;
  /** Reputation per week when worn in public work. */
  rep: number;
  /** Doctrines that approve. */
  wants?: string[];
  note?: string;
  /** The art pack's name for it: the outfit suffix for clothes, the layer stem for a collar or shoes. */
  art?: string;
  /** A full-body suit paints her skin its own colour. */
  skin?: string;
  /** Latex and oil catch the light. */
  shine?: boolean;
  /** Covers the groin, so a cock shows as a bulge rather than bare. */
  covers?: boolean;
  /** Which group it sits in on the wardrobe screen. */
  kind?: "bare" | "modest" | "work" | "dress" | "lingerie" | "swim" | "costume" | "uniform" | "bondage" | "culture";
}

type G = Omit<Garment, "slot">;
const clothes = (xs: G[]): Garment[] => xs.map((x) => ({ ...x, slot: "clothes" }));

export const WARDROBE: Garment[] = [
  ...clothes([
    { id: "none", name: "no clothing", kind: "bare", cost: 0, appeal: 1.0, relaxation: -0.25, rep: 0, wants: ["degradationist"], note: "naked, for all to see" },
    { id: "oil", name: "body oil", art: "BodyOil", kind: "bare", shine: true, cost: 150, appeal: 1.12, relaxation: -0.2, rep: 1, wants: ["hedonist"] },
    { id: "jewelry", name: "slutty jewelry", art: "SluttyJewelry", kind: "bare", cost: 2400, appeal: 1.2, relaxation: -0.15, rep: 2, wants: ["arabian", "hedonist"] },

    { id: "shift", name: "a plain shift", art: "SlaveGown", kind: "modest", covers: true, cost: 200, appeal: 1.0, relaxation: 0.1, rep: 0 },
    { id: "conservative", name: "conservative clothing", art: "Conservative", kind: "modest", covers: true, cost: 700, appeal: 0.95, relaxation: 0.3, rep: 1, wants: ["paternalist"] },
    { id: "sweater", name: "a sweater", art: "Sweater", kind: "modest", covers: true, cost: 400, appeal: 1.0, relaxation: 0.3, rep: 0 },
    { id: "oversized", name: "an oversized t-shirt", art: "OversizedTshirt", kind: "modest", covers: true, cost: 150, appeal: 1.0, relaxation: 0.3, rep: 0 },
    { id: "tjeans", name: "a t-shirt and jeans", art: "TshirtAndJeans", kind: "modest", covers: true, cost: 300, appeal: 0.95, relaxation: 0.3, rep: 0 },
    { id: "hijab", name: "a hijab and blouse", art: "HijabAndBlouse", kind: "modest", covers: true, cost: 900, appeal: 0.95, relaxation: 0.25, rep: 1, wants: ["arabian"] },
    { id: "abaya", name: "a hijab and abaya", art: "HijabAndAbaya", kind: "modest", covers: true, cost: 1100, appeal: 0.9, relaxation: 0.2, rep: 1, wants: ["arabian"] },

    { id: "practical", name: "work clothes", art: "CutoffsAndATshirt", kind: "work", covers: true, cost: 400, appeal: 0.9, relaxation: 0.25, rep: 0, note: "practical clothes for physical work" },
    { id: "uniform", name: "household uniform", art: "NiceMaid", kind: "work", covers: true, cost: 600, appeal: 1.05, relaxation: 0.15, rep: 1, note: "a neat uniform that marks her as your servant" },
    { id: "slutmaid", name: "a slutty maid outfit", art: "SluttyMaid", kind: "work", covers: true, cost: 900, appeal: 1.2, relaxation: 0, rep: 1 },
    { id: "nurse", name: "a nice nurse outfit", art: "NiceNurse", kind: "work", covers: true, cost: 800, appeal: 1.05, relaxation: 0.15, rep: 1 },
    { id: "slutnurse", name: "a slutty nurse outfit", art: "SluttyNurse", kind: "work", covers: true, cost: 900, appeal: 1.2, relaxation: 0, rep: 1 },
    { id: "apron", name: "an apron", art: "Apron", kind: "work", cost: 100, appeal: 1.1, relaxation: -0.1, rep: 0 },
    { id: "business", name: "nice business attire", art: "NiceBusinessAttire", kind: "work", covers: true, cost: 2600, appeal: 1.1, relaxation: 0.2, rep: 3, wants: ["professionalism"] },
    { id: "slutbusiness", name: "slutty business attire", art: "SluttyBusinessAttire", kind: "work", covers: true, cost: 2200, appeal: 1.22, relaxation: 0.05, rep: 2, wants: ["professionalism"] },

    { id: "evening", name: "an evening gown", art: "BallGown", kind: "dress", covers: true, cost: 5200, appeal: 1.35, relaxation: 0.25, rep: 4, wants: ["professionalism"] },
    { id: "minidress", name: "a mini dress", art: "MiniDress", kind: "dress", covers: true, cost: 1400, appeal: 1.2, relaxation: 0.1, rep: 1 },
    { id: "halter", name: "a halter top dress", art: "HalterTopDress", kind: "dress", covers: true, cost: 1600, appeal: 1.2, relaxation: 0.15, rep: 2 },
    { id: "maternity", name: "a maternity dress", art: "MaternityDress", kind: "dress", covers: true, cost: 1200, appeal: 1.1, relaxation: 0.25, rep: 1, wants: ["repopulation"] },
    { id: "lolita", name: "a gothic lolita dress", art: "GothicLolitaDress", kind: "dress", covers: true, cost: 2600, appeal: 1.2, relaxation: 0.15, rep: 2 },

    { id: "lingerie", name: "attractive lingerie", art: "AttractiveLingerie", kind: "lingerie", covers: true, cost: 1200, appeal: 1.25, relaxation: 0, rep: 1, wants: ["hedonist"] },
    { id: "preglingerie", name: "lingerie for a pregnant woman", art: "AttractiveLingerieForAPregnantWoman", kind: "lingerie", covers: true, cost: 1300, appeal: 1.25, relaxation: 0.05, rep: 1, wants: ["repopulation"] },
    { id: "kitty", name: "kitty lingerie", art: "KittyLingerie", kind: "lingerie", covers: true, cost: 1100, appeal: 1.25, relaxation: -0.05, rep: 1 },
    { id: "panties", name: "panties", art: "Panties", kind: "lingerie", covers: true, cost: 80, appeal: 1.05, relaxation: -0.1, rep: 0 },
    { id: "thong", name: "a thong", art: "Thong", kind: "lingerie", covers: true, cost: 90, appeal: 1.1, relaxation: -0.15, rep: 0 },
    { id: "boyshorts", name: "boyshorts", art: "Boyshorts", kind: "lingerie", covers: true, cost: 90, appeal: 1.05, relaxation: -0.05, rep: 0 },
    { id: "pasties", name: "panties and pasties", art: "PantiesAndPasties", kind: "lingerie", covers: true, cost: 120, appeal: 1.15, relaxation: -0.15, rep: 0 },
    { id: "shirtpanties", name: "a button-up shirt and panties", art: "ButtonupShirtAndPanties", kind: "lingerie", covers: true, cost: 400, appeal: 1.15, relaxation: 0.1, rep: 0 },

    { id: "bikini", name: "a string bikini", art: "StringBikini", kind: "swim", covers: true, cost: 300, appeal: 1.15, relaxation: -0.05, rep: 0 },
    { id: "monokini", name: "a monokini", art: "Monokini", kind: "swim", covers: true, cost: 400, appeal: 1.15, relaxation: -0.05, rep: 0 },
    { id: "onepiece", name: "a one-piece swimsuit", art: "OnepieceSwimsuit", kind: "swim", covers: true, cost: 350, appeal: 1.05, relaxation: 0.1, rep: 0 },
    { id: "burkini", name: "a burkini", art: "Burkini", kind: "swim", covers: true, cost: 500, appeal: 0.95, relaxation: 0.2, rep: 1, wants: ["arabian"] },
    { id: "scalemail", name: "a scalemail bikini", art: "ScalemailBikini", kind: "swim", covers: true, cost: 1800, appeal: 1.2, relaxation: 0, rep: 2, wants: ["physical_idealist"] },
    { id: "sporty", name: "sport shorts and a sports bra", art: "SportShortsAndASportsBra", kind: "swim", covers: true, cost: 300, appeal: 1.05, relaxation: 0.2, rep: 0, wants: ["physical_idealist"] },
    { id: "leotard", name: "a leotard", art: "Leotard", kind: "swim", covers: true, cost: 500, appeal: 1.15, relaxation: 0.05, rep: 1 },

    { id: "bunny", name: "a bunny outfit", art: "Bunny", kind: "costume", covers: true, cost: 1200, appeal: 1.25, relaxation: 0, rep: 2 },
    { id: "cheerleader", name: "a cheerleader outfit", art: "Cheerleader", kind: "costume", covers: true, cost: 700, appeal: 1.2, relaxation: 0.05, rep: 1, wants: ["youth"] },
    { id: "schoolgirl", name: "a schoolgirl outfit", art: "Schoolgirl", kind: "costume", covers: true, cost: 600, appeal: 1.2, relaxation: 0, rep: 1, wants: ["youth"] },
    { id: "succubus", name: "a succubus outfit", art: "Succubus", kind: "costume", covers: true, cost: 1500, appeal: 1.3, relaxation: -0.05, rep: 2, wants: ["transformation"] },
    { id: "slutty", name: "a slutty outfit", art: "Slutty", kind: "costume", covers: true, cost: 500, appeal: 1.25, relaxation: -0.1, rep: 1, wants: ["hedonist"] },
    { id: "netting", name: "clubslut netting", art: "ClubslutNetting", kind: "costume", cost: 400, appeal: 1.25, relaxation: -0.2, rep: 1, wants: ["hedonist"] },
    { id: "loincloth", name: "a skimpy loincloth", art: "SkimpyLoincloth", kind: "costume", covers: true, cost: 200, appeal: 1.15, relaxation: -0.1, rep: 1, wants: ["aztec"] },
    { id: "silk", name: "silks", art: "HaremGauze", kind: "costume", cost: 3500, appeal: 1.25, relaxation: 0.3, rep: 3, wants: ["arabian", "hedonist"] },
    { id: "western", name: "Western clothing", art: "Western", kind: "costume", covers: true, cost: 1100, appeal: 1.1, relaxation: 0.2, rep: 1, wants: ["antebellum"] },
    { id: "fallennun", name: "a fallen nun's habit", art: "FallenNunsHabit", kind: "costume", covers: true, cost: 1200, appeal: 1.25, relaxation: -0.1, rep: 2, wants: ["chattel_religion"] },

    { id: "military", name: "a military uniform", art: "MilitaryUniform", kind: "uniform", covers: true, cost: 1800, appeal: 1.05, relaxation: 0.2, rep: 2, wants: ["neo_imperial"] },
    { id: "police", name: "a police uniform", art: "PoliceUniform", kind: "uniform", covers: true, cost: 1500, appeal: 1.1, relaxation: 0.15, rep: 1 },
    { id: "mounty", name: "a mounty outfit", art: "Mounty", kind: "uniform", covers: true, cost: 1600, appeal: 1.1, relaxation: 0.15, rep: 1 },
    { id: "battledress", name: "battledress", art: "Battledress", kind: "uniform", covers: true, cost: 1200, appeal: 0.95, relaxation: 0.25, rep: 1, note: "military fatigues" },
    { id: "armor", name: "battlearmor", art: "Battlearmor", kind: "uniform", covers: true, cost: 6500, appeal: 1.0, relaxation: 0.3, rep: 3, wants: ["neo_imperial"], note: "real armor, for a bodyguard or pit fighter" },
    { id: "bodysuit", name: "a comfortable bodysuit", art: "ComfortableBodysuit", kind: "uniform", covers: true, skin: "#464646", cost: 1600, appeal: 1.15, relaxation: 0.15, rep: 1, wants: ["transformation"] },

    { id: "latex", name: "a latex suit", art: "Latex", kind: "bondage", covers: true, skin: "#515351", shine: true, cost: 2800, appeal: 1.2, relaxation: -0.15, rep: 1, wants: ["transformation"] },
    { id: "restrictive", name: "restrictive gear", art: "UncomfortableStraps", kind: "bondage", cost: 1900, appeal: 1.15, relaxation: -0.6, rep: 0, wants: ["degradationist"] },
    { id: "chains", name: "chains", art: "Chains", kind: "bondage", cost: 700, appeal: 1.1, relaxation: -0.7, rep: 0, wants: ["degradationist"] },
    { id: "shibari", name: "shibari ropes", art: "ShibariRopes", kind: "bondage", cost: 500, appeal: 1.2, relaxation: -0.35, rep: 1, wants: ["edo", "degradationist"] },
    { id: "penitent", name: "a penitent nun's habit", art: "PenitentNunsHabit", kind: "bondage", covers: true, cost: 1400, appeal: 0.95, relaxation: -0.4, rep: 2, wants: ["chattel_religion"] },

    { id: "habit", name: "a habit", art: "ChattelHabit", kind: "culture", covers: true, cost: 1400, appeal: 1.0, relaxation: 0.2, rep: 3, wants: ["chattel_religion"] },
    { id: "toga", name: "a toga", art: "Toga", kind: "culture", covers: true, cost: 1600, appeal: 1.1, relaxation: 0.15, rep: 2, wants: ["roman"] },
    { id: "kimono", name: "a kimono", art: "Kimono", kind: "culture", covers: true, cost: 3100, appeal: 1.2, relaxation: 0.2, rep: 3, wants: ["edo"] },
    { id: "qipao", name: "a long qipao", art: "LongQipao", kind: "culture", covers: true, cost: 2800, appeal: 1.2, relaxation: 0.2, rep: 3, wants: ["chinese"] },
    { id: "slutqipao", name: "a slutty qipao", art: "SluttyQipao", kind: "culture", covers: true, cost: 1800, appeal: 1.25, relaxation: 0.05, rep: 2, wants: ["chinese"] },
    { id: "hanbok", name: "a hanbok", art: "Hanbok", kind: "culture", covers: true, cost: 2400, appeal: 1.15, relaxation: 0.2, rep: 2 },
    { id: "dirndl", name: "a dirndl", art: "Dirndl", kind: "culture", covers: true, cost: 1300, appeal: 1.15, relaxation: 0.2, rep: 1 },
    { id: "lederhosen", name: "lederhosen", art: "Lederhosen", kind: "culture", covers: true, cost: 1200, appeal: 1.1, relaxation: 0.2, rep: 1 },
    { id: "huipil", name: "a huipil", art: "Huipil", kind: "culture", covers: true, cost: 1100, appeal: 1.1, relaxation: 0.25, rep: 2, wants: ["aztec"] },
    { id: "biyelgee", name: "a biyelgee costume", art: "BiyelgeeCostume", kind: "culture", covers: true, cost: 1500, appeal: 1.15, relaxation: 0.2, rep: 2 },
  ]),

  { id: "collar_none", name: "no collar", slot: "collar", cost: 0, appeal: 1.0, relaxation: 0.15, rep: 0 },
  { id: "collar_plain", name: "a plain collar", art: "Collar_Stylish_Leather", slot: "collar", cost: 150, appeal: 1.0, relaxation: -0.1, rep: 0 },
  { id: "collar_choker", name: "a satin choker", art: "Collar_Satin_Choker", slot: "collar", cost: 300, appeal: 1.08, relaxation: 0, rep: 1 },
  { id: "collar_ribbon", name: "a silk ribbon", art: "Collar_Silk_Ribbon", slot: "collar", cost: 200, appeal: 1.05, relaxation: 0.1, rep: 0 },
  { id: "collar_bowtie", name: "a bowtie collar", art: "Collar_Bowtie", slot: "collar", cost: 250, appeal: 1.06, relaxation: 0.05, rep: 0 },
  { id: "collar_pretty", name: "a jewelled collar", art: "Collar_Pretty_Jewelry", slot: "collar", cost: 2600, appeal: 1.15, relaxation: 0.05, rep: 2 },
  { id: "collar_gold", name: "a heavy gold collar", art: "Collar_Gold_Heavy", slot: "collar", cost: 4200, appeal: 1.18, relaxation: -0.1, rep: 3, wants: ["egyptian", "arabian"] },
  { id: "collar_egypt", name: "an ancient Egyptian collar", art: "Collar_Ancientegyptian", slot: "collar", cost: 3000, appeal: 1.15, relaxation: 0, rep: 3, wants: ["egyptian"] },
  { id: "collar_heavy", name: "a heavy steel collar", art: "Collar_Tight_Steel", slot: "collar", cost: 500, appeal: 0.95, relaxation: -0.45, rep: 1, wants: ["degradationist"] },
  { id: "collar_cruel", name: "a cruel leather collar", art: "Collar_Leather_Cruel", slot: "collar", cost: 400, appeal: 0.95, relaxation: -0.5, rep: 0, wants: ["degradationist"] },
  { id: "collar_shock", name: "a shock collar", art: "Collar_Shock_Punishment", slot: "collar", cost: 1200, appeal: 0.9, relaxation: -0.8, rep: 0, wants: ["degradationist"], note: "lets you shock her whenever she misbehaves" },
  { id: "collar_cowbell", name: "a cowbell collar", art: "Collar_Cowbell", slot: "collar", cost: 200, appeal: 1.02, relaxation: -0.2, rep: 0, wants: ["pastoralist"] },
  { id: "collar_corset", name: "a neck corset", art: "Collar_Neck_Corset", slot: "collar", cost: 900, appeal: 1.1, relaxation: -0.3, rep: 1 },
  { id: "collar_name", name: "a collar with your name on it", art: "Collar_Retirement_Nice", slot: "collar", cost: 900, appeal: 1.05, relaxation: -0.05, rep: 2, note: "shows everyone who owns her" },

  { id: "shoes_none", name: "barefoot", slot: "shoes", cost: 0, appeal: 1.0, relaxation: 0, rep: 0 },
  { id: "shoes_flat", name: "flats", art: "Shoes_Flat", slot: "shoes", cost: 200, appeal: 1.0, relaxation: 0.05, rep: 0 },
  { id: "shoes_pumps", name: "pumps", art: "Shoes_Pump", slot: "shoes", cost: 500, appeal: 1.08, relaxation: -0.05, rep: 0 },
  { id: "shoes_heels", name: "heels", art: "Shoes_Heel", slot: "shoes", cost: 800, appeal: 1.12, relaxation: -0.15, rep: 1 },
  { id: "shoes_extreme", name: "extreme heels", art: "Shoes_Extreme_Heel", slot: "shoes", cost: 1200, appeal: 1.18, relaxation: -0.45, rep: 1, note: "so high she can barely walk" },
  { id: "shoes_boots", name: "boots", art: "Shoes_Boot", slot: "shoes", cost: 600, appeal: 1.05, relaxation: 0.05, rep: 0 },

  { id: "legs_none", name: "bare legs", slot: "legwear", cost: 0, appeal: 1.0, relaxation: 0, rep: 0 },
  { id: "legs_short", name: "short stockings", art: "SS", slot: "legwear", cost: 150, appeal: 1.05, relaxation: 0, rep: 0 },
  { id: "legs_long", name: "long stockings", art: "LL", slot: "legwear", cost: 250, appeal: 1.08, relaxation: 0, rep: 0 },
];

export const GARMENT_BY_NAME: Record<string, Garment> = Object.fromEntries(WARDROBE.map((g) => [g.name, g]));

/** What a garment draws with, for anything worn by name. "none" is the generator's word for no
 *  collar and no shoes, and it still has to mean that. */
export function garment(name: string | undefined): Garment | undefined {
  if (!name || name === "none") return undefined;
  return GARMENT_BY_NAME[name];
}

export const WARDROBE_KINDS: { id: NonNullable<Garment["kind"]>; label: string }[] = [
  { id: "bare", label: "Next to nothing" }, { id: "lingerie", label: "Lingerie" }, { id: "modest", label: "Modest" },
  { id: "work", label: "Work" }, { id: "dress", label: "Dresses" }, { id: "swim", label: "Swim and sport" },
  { id: "costume", label: "Costumes" }, { id: "uniform", label: "Uniforms" }, { id: "bondage", label: "Bondage" },
  { id: "culture", label: "Traditional" },
];

/** Salon and body-modification work. Cosmetic, permanent, and read by the doctrines that care. */
export interface Modification {
  id: string;
  name: string;
  kind: "tattoo" | "piercing" | "brand" | "scar";
  cost: number;
  where: string;
  /** What it does to her, the week it is done. */
  relaxation: number;
  resented: number;
  wants?: string[];
}

export const MODIFICATIONS: Modification[] = [
  { id: "tattoo_small", name: "a small tattoo", kind: "tattoo", cost: 400, where: "shoulder", relaxation: -0.1, resented: 1 },
  { id: "tattoo_full", name: "full sleeve work", kind: "tattoo", cost: 2200, where: "arms", relaxation: -0.2, resented: 2, wants: ["transformation"] },
  { id: "tattoo_owner", name: "your name, permanently", kind: "tattoo", cost: 900, where: "hip", relaxation: -0.5, resented: 4, wants: ["degradationist"] },
  { id: "piercing_ears", name: "pierced ears", kind: "piercing", cost: 150, where: "ears", relaxation: 0, resented: 0 },
  { id: "piercing_navel", name: "a navel piercing", kind: "piercing", cost: 300, where: "navel", relaxation: -0.05, resented: 1 },
  { id: "piercing_heavy", name: "heavy piercings", kind: "piercing", cost: 1400, where: "everywhere", relaxation: -0.4, resented: 3, wants: ["transformation", "degradationist"] },
  { id: "brand", name: "a brand", kind: "brand", cost: 600, where: "thigh", relaxation: -1.2, resented: 7, wants: ["degradationist", "antebellum"] },
];
