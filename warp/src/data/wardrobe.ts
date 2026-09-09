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
  slot: "clothes" | "collar" | "shoes";
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
}

export const WARDROBE: Garment[] = [
  { id: "none", name: "no clothing", slot: "clothes", cost: 0, appeal: 1.0, relaxation: -0.25, rep: 0, wants: ["degradationist"], note: "the default, and it is a statement" },
  { id: "shift", name: "a plain shift", slot: "clothes", cost: 200, appeal: 1.0, relaxation: 0.1, rep: 0 },
  { id: "uniform", name: "household uniform", slot: "clothes", cost: 600, appeal: 1.05, relaxation: 0.15, rep: 1, note: "visibly yours, and visibly somebody" },
  { id: "silk", name: "silks", slot: "clothes", cost: 3500, appeal: 1.25, relaxation: 0.3, rep: 3, wants: ["arabian", "hedonist"] },
  { id: "evening", name: "an evening gown", slot: "clothes", cost: 5200, appeal: 1.35, relaxation: 0.25, rep: 4, wants: ["professionalism"] },
  { id: "latex", name: "a latex suit", slot: "clothes", cost: 2800, appeal: 1.2, relaxation: -0.15, rep: 1, wants: ["transformation"] },
  { id: "restrictive", name: "restrictive gear", slot: "clothes", cost: 1900, appeal: 1.15, relaxation: -0.6, rep: 0, wants: ["degradationist"] },
  { id: "habit", name: "a habit", slot: "clothes", cost: 1400, appeal: 1.0, relaxation: 0.2, rep: 3, wants: ["chattel_religion"] },
  { id: "toga", name: "a toga", slot: "clothes", cost: 1600, appeal: 1.1, relaxation: 0.15, rep: 2, wants: ["roman"] },
  { id: "kimono", name: "a kimono", slot: "clothes", cost: 3100, appeal: 1.2, relaxation: 0.2, rep: 3, wants: ["edo"] },
  { id: "practical", name: "work clothes", slot: "clothes", cost: 400, appeal: 0.9, relaxation: 0.25, rep: 0, note: "for anybody whose job is actually a job" },

  { id: "collar_none", name: "no collar", slot: "collar", cost: 0, appeal: 1.0, relaxation: 0.15, rep: 0 },
  { id: "collar_plain", name: "a plain collar", slot: "collar", cost: 150, appeal: 1.0, relaxation: -0.1, rep: 0 },
  { id: "collar_pretty", name: "a jewelled collar", slot: "collar", cost: 2600, appeal: 1.15, relaxation: 0.05, rep: 2 },
  { id: "collar_heavy", name: "a heavy steel collar", slot: "collar", cost: 500, appeal: 0.95, relaxation: -0.45, rep: 1, wants: ["degradationist"] },
  { id: "collar_name", name: "a collar with your name on it", slot: "collar", cost: 900, appeal: 1.05, relaxation: -0.05, rep: 2, note: "she reads it every time she passes a mirror" },

  { id: "shoes_none", name: "barefoot", slot: "shoes", cost: 0, appeal: 1.0, relaxation: 0, rep: 0 },
  { id: "shoes_flat", name: "flats", slot: "shoes", cost: 200, appeal: 1.0, relaxation: 0.05, rep: 0 },
  { id: "shoes_heels", name: "heels", slot: "shoes", cost: 800, appeal: 1.12, relaxation: -0.15, rep: 1 },
  { id: "shoes_boots", name: "boots", slot: "shoes", cost: 600, appeal: 1.05, relaxation: 0.05, rep: 0 },
];

export const GARMENT_BY_NAME: Record<string, Garment> = Object.fromEntries(WARDROBE.map((g) => [g.name, g]));

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
