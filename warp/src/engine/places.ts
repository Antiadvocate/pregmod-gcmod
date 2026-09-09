/**
 * MOVING AROUND, AND WHAT THE ROOM DOES TO HER ON THE WAY IN.
 *
 * Two jobs.
 *
 * FIRST: presence. Walking somewhere puts you in a room with whoever is assigned to it, which is
 * how the household stops being a list and becomes a building. You go to the dairy, the women who
 * work the dairy are there.
 *
 * SECOND, and the reason this is a module rather than a string swap: THE ROOM GOT THERE FIRST.
 * What a place holds for somebody is what happened to them in it, and walking in gets some of that
 * before anybody has said a word. It is computed from her own memory bank, so the same corridor is
 * charged for one of two women standing in it and inert for the other. It fires on arrival rather
 * than every turn you stand there, it is bounded at ±1.2 — a fifth of a bad conversation — and it
 * HABITUATES: divided by how often she has been here lately, so the room she works in every day
 * stops announcing itself and the one she has been kept out of for a month does not.
 *
 * That habituation term is the whole difference between this and a haunted house.
 */
import type { Person, SaveState } from "./types";
import { PLACES, PLACE_BY_ID, PLACE_BY_NAME, type PlaceDef } from "../data/places";
import { clamp, shove } from "./psyche";

export function placeOf(s: SaveState): PlaceDef {
  return PLACE_BY_NAME[s.scene.location] ?? PLACE_BY_ID[s.scene.location] ?? PLACES[0];
}

/** Everywhere you can currently go: the rooms that exist, plus the facilities you have built. */
export function openPlaces(s: SaveState): PlaceDef[] {
  return PLACES.filter((p) => !p.needs_facility || (p.facility && (s.arcology.facilities[p.facility]?.level ?? 0) > 0));
}

/** Who is standing in a room, by where they are assigned. */
export function occupants(s: SaveState, place: PlaceDef): Person[] {
  return Object.values(s.people).filter((p) => {
    if (p.status !== "owned" && p.status !== "indentured") return false;
    if (place.facility) return p.facility === place.facility;
    if (place.id === "promenade") return p.assignment === "whore" || p.assignment === "public servant";
    if (place.id === "penthouse" || place.id === "her_room") return !p.facility && (p.assignment === "please you" || p.assignment === "fucktoy" || p.assignment === "rest");
    return false;
  });
}

/** WHAT THIS ROOM HOLDS FOR HER. −1.2 … +1.2, habituated by recent visits. */
export function groundShove(s: SaveState, p: Person, place: PlaceDef): { shove: number; about: string } {
  const mem = s.memory[p.id];
  if (!mem?.episodic.length) return { shove: 0, about: "" };
  const here = mem.episodic.filter((m) => m.where === place.name || m.where === place.id);
  if (here.length < 2 && !here.some((m) => m.importance >= 7)) return { shove: 0, about: "" };

  let sum = 0, weight = 0, worst = here[0];
  for (const m of here) {
    const w = (m.importance / 10) * Math.max(0.2, m.decay) * (m.core ? 2 : 1);
    const sign = m.charge === "warm" || m.charge === "bright" ? 1 : m.charge === "sharp" || m.charge === "cold" ? -1 : 0;
    sum += sign * w;
    weight += w;
    if (Math.abs(sign) * w > Math.abs(worst.importance / 10)) worst = m;
  }
  if (!weight) return { shove: 0, about: "" };

  // Habituation: how many of her recent memories happened here at all.
  const recent = mem.episodic.filter((m) => s.arcology.week - m.week <= 8);
  const visits = recent.filter((m) => m.where === place.name).length;
  const habituation = 1 / (1 + visits * 0.6);

  const raw = clamp((sum / weight) * 1.2 * habituation, -1.2, 1.2);
  return { shove: +raw.toFixed(2), about: worst.content };
}

export interface Arrival { id: string; shove: number; about: string }

/** Go somewhere. Rebuilds who is present, and lands the room on each of them. */
export function goTo(s: SaveState, placeId: string): { place: PlaceDef; arrivals: Arrival[] } {
  const place = PLACE_BY_ID[placeId] ?? PLACES[0];
  const before = new Set(s.scene.present);
  s.scene.present_prev = [...before];
  s.scene.location = place.name;

  const here = occupants(s, place);
  s.scene.present = here.map((p) => p.id);
  // Anybody you were with who is not assigned here has been walked along with you rather than
  // silently deleted: the narrator is told, so it writes them arriving.
  s.scene.arrivals_pending = s.scene.present.filter((id) => !before.has(id));

  const arrivals: Arrival[] = [];
  for (const p of here) {
    const g = groundShove(s, p, place);
    if (g.shove) {
      shove(p.psyche, g.shove, { hard: true });
      arrivals.push({ id: p.id, shove: g.shove, about: g.about });
    }
  }
  return { place, arrivals };
}

/** Bring one person with you, wherever you are going. */
export function bring(s: SaveState, personId: string): void {
  if (!s.scene.present.includes(personId)) {
    s.scene.present.push(personId);
    s.scene.arrivals_pending.push(personId);
  }
}

/** Is what happens here in front of people? Feeds the act resolution — the same act in the suite
 *  and on the concourse are different acts. */
export function isPublic(s: SaveState): boolean {
  return placeOf(s).privacy === "public";
}
