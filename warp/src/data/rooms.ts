/**
 * WHERE SHE SLEEPS — the furniture of a life, priced.
 *
 * Every slave starts with a bunk in the shared dormitory, a thin mattress, the communal showers
 * and no window. Each of those can be bought up, one woman at a time, or taken away. Five axes with
 * levels, and a set of things that are hers or aren't. Each item says what it costs, what it costs
 * to keep, and who it means most to: a shelf of books is furniture to one woman and a way out of
 * her head to another.
 */
import type { Person } from "../engine/types";

export type RoomAxis = "space" | "bed" | "bath" | "view" | "climate";

export interface AxisLevel { level: number; name: string; cost: number; upkeep: number; comfort: number }

export const AXES: Record<RoomAxis, { name: string; levels: AxisLevel[] }> = {
  space: { name: "Where she sleeps", levels: [
    { level: -1, name: "a cage in the kennels", cost: 300, upkeep: 0, comfort: -4 },
    { level: 0, name: "a bunk in the shared dormitory", cost: 0, upkeep: 0, comfort: 0 },
    { level: 1, name: "a curtained cubicle at the end of the dormitory", cost: 2500, upkeep: 40, comfort: 1.5 },
    { level: 2, name: "a small room of her own", cost: 8000, upkeep: 140, comfort: 3 },
    { level: 3, name: "a proper bedroom on the residential floors", cost: 20000, upkeep: 380, comfort: 4.5 },
    { level: 4, name: "a suite in the spire", cost: 55000, upkeep: 1000, comfort: 6 },
  ] },
  bed: { name: "Her bed", levels: [
    { level: -1, name: "a mat on the floor", cost: 0, upkeep: 0, comfort: -1.5 },
    { level: 0, name: "a thin mattress", cost: 0, upkeep: 0, comfort: 0 },
    { level: 1, name: "a decent bed with real pillows", cost: 900, upkeep: 0, comfort: 1 },
    { level: 2, name: "a big soft bed", cost: 3500, upkeep: 20, comfort: 2 },
    { level: 3, name: "a four-poster with silk sheets", cost: 12000, upkeep: 80, comfort: 3 },
  ] },
  bath: { name: "Washing", levels: [
    { level: 0, name: "the communal showers", cost: 0, upkeep: 0, comfort: 0 },
    { level: 1, name: "a private shower", cost: 4000, upkeep: 40, comfort: 1.2 },
    { level: 2, name: "her own bathroom with a deep tub", cost: 14000, upkeep: 120, comfort: 2.4 },
  ] },
  view: { name: "Window", levels: [
    { level: 0, name: "no window", cost: 0, upkeep: 0, comfort: 0 },
    { level: 1, name: "a small window", cost: 3000, upkeep: 0, comfort: 0.8 },
    { level: 2, name: "a window over the city", cost: 9000, upkeep: 0, comfort: 1.6 },
    { level: 3, name: "floor-to-ceiling glass high in the spire", cost: 30000, upkeep: 0, comfort: 2.5 },
  ] },
  climate: { name: "Heat", levels: [
    { level: -1, name: "kept cold on purpose", cost: 0, upkeep: 0, comfort: -1.5 },
    { level: 0, name: "cold at night", cost: 0, upkeep: 0, comfort: 0 },
    { level: 1, name: "properly heated", cost: 1200, upkeep: 30, comfort: 0.8 },
    { level: 2, name: "climate controlled, set how she likes it", cost: 5000, upkeep: 70, comfort: 1.4 },
  ] },
};

/** A view needs a room with walls of its own; a tub needs a room to put it in. */
export const NEEDS: Partial<Record<RoomAxis, { axis: RoomAxis; level: number }>> = {
  view: { axis: "space", level: 2 },
  bath: { axis: "space", level: 1 },
};

export interface Extra {
  id: string;
  name: string;
  cost: number;
  upkeep: number;
  /** What it does for the average woman. Negative for the things that are done to her. */
  comfort: number;
  /** How much more (or less) it means to her, by who she is. 1 is average. */
  fits: (p: Person) => number;
  note: string;
  /** Moves fear and trust as well as comfort. */
  fear?: number;
  trust?: number;
  arousal?: number;
}

const texture = (p: Person, re: RegExp) => [...p.persona.texture, ...p.persona.core_traits, p.origin.career, p.persona.background].some((t) => re.test(t ?? ""));
const fetish = (p: Person, id: string, min = 40) => p.persona.fetishes.some((f) => f.name === id && f.strength >= min);

export const EXTRAS: Extra[] = [
  { id: "lock", name: "a lock on her door, and the only key", cost: 600, upkeep: 0, comfort: 1, trust: 4, note: "she can shut people out, so trust rises",
    fits: (p) => (p.bond.fear > 40 ? 1.8 : 1) * (p.persona.attachment.style === "avoidant" ? 1.5 : 1) },
  { id: "books", name: "a shelf of books", cost: 1500, upkeep: 20, comfort: 0.6, note: "means a great deal to a reader",
    fits: (p) => (p.persona.education > 55 || ["sharp", "brilliant"].includes(p.persona.intelligence) ? 2.2 : 0.7) * (texture(p, /book|read|stud|librar|teach|writ/i) ? 1.5 : 1) },
  { id: "screen", name: "a screen and a feed subscription", cost: 1200, upkeep: 30, comfort: 0.8, note: "the news, shows, the outside",
    fits: (p) => (texture(p, /tv|show|film|movie|game|news/i) ? 1.6 : 1) },
  { id: "wardrobe", name: "a wardrobe of clothes that are hers", cost: 3000, upkeep: 40, comfort: 0.8, note: "things to wear that nobody issued",
    fits: (p) => (texture(p, /fashion|cloth|dress|style|model/i) ? 2 : 1) * (p.persona.flaw?.id === "shamefast" ? 1.6 : 1) },
  { id: "vanity", name: "a vanity with a mirror and makeup", cost: 1800, upkeep: 25, comfort: 0.6, note: "her face, done her way",
    fits: (p) => (texture(p, /makeup|beauty|vain|mirror|pretty|model/i) ? 2 : 1) },
  { id: "plants", name: "plants, and a lamp to grow them", cost: 700, upkeep: 10, comfort: 0.5, note: "something alive that depends on her",
    fits: (p) => (texture(p, /plant|garden|flower|farm|grow|nature|village/i) ? 2.4 : 0.8) },
  { id: "music", name: "a music player and her own music", cost: 800, upkeep: 10, comfort: 0.6, note: "songs from before",
    fits: (p) => (texture(p, /music|sing|danc|song|band|piano|guitar/i) || p.skills.entertainment > 50 ? 2 : 1) },
  { id: "kitchen", name: "a kitchenette", cost: 6000, upkeep: 60, comfort: 1.1, note: "she can cook for herself",
    fits: (p) => (texture(p, /cook|bak|kitchen|chef|food|restaurant/i) ? 2.4 : 1) },
  { id: "keepsakes", name: "things brought back from her old life", cost: 5000, upkeep: 0, comfort: 1.2, note: "photos, letters, whatever your people could find",
    fits: (p) => 1 + (100 - p.bond.hope) / 80 },
  { id: "pet", name: "a cat", cost: 900, upkeep: 30, comfort: 1, note: "something to look after",
    fits: (p) => (texture(p, /cat|dog|animal|pet|vet/i) || p.persona.quirk?.id === "caring" ? 2.2 : 1) },
  { id: "toys", name: "a drawer of toys, for when she's alone", cost: 1000, upkeep: 15, comfort: 0.5, arousal: 15, note: "keeps her wound up",
    fits: (p) => (p.psyche.libido > 60 || p.persona.quirk?.id === "perverted" ? 2 : 0.6) },
  { id: "restraints", name: "restraint points in the walls and the bed", cost: 1500, upkeep: 0, comfort: -1, fear: 5, arousal: 10, note: "she sleeps where she can be tied",
    fits: (p) => (fetish(p, "submissive") || fetish(p, "masochist") ? -1.4 : 1) },
  { id: "camera", name: "a camera that watches her all night", cost: 800, upkeep: 10, comfort: -1.2, fear: 6, trust: -6, note: "she is never alone",
    fits: (p) => (fetish(p, "humiliation") ? 0.3 : 1) * (p.persona.flaw?.id === "shamefast" ? 1.6 : 1) },
];
export const EXTRA_BY_ID: Record<string, Extra> = Object.fromEntries(EXTRAS.map((e) => [e.id, e]));

export const TOUCH_COST = 600;
