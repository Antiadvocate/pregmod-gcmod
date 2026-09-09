/**
 * THE ROOMS.
 *
 * A scene used to happen at "the penthouse", which is a string. A room is not a string: it decides
 * who is standing in it, whether what you do there is private or in front of paying citizens, and —
 * because a place holds what happened to you in it — what walking into it does to somebody before
 * a word is said.
 *
 * `privacy` is the one that has teeth. The same act in the suite and on the concourse are different
 * acts: the second one is public use, it hits `humiliation` and `exposure`, and it earns money and
 * costs her something the first one does not.
 */

export interface PlaceDef {
  id: string;
  name: string;
  /** One line for the narrator; it is not allowed to invent the room around it. */
  look: string;
  /** private — nobody sees. household — the others see. public — the arcology sees, and pays. */
  privacy: "private" | "household" | "public";
  /** The facility whose workers are standing here, if any. */
  facility?: string;
  /** Requires the facility to be built. */
  needs_facility?: boolean;
  /** Acts done here get these tags added, which is how a room changes what an act IS. */
  tags?: string[];
}

export const PLACES: PlaceDef[] = [
  { id: "penthouse", name: "the penthouse", look: "your own floor: glass on two sides, the arcology dropping away below it, and nobody up here who was not sent for", privacy: "private" },
  { id: "suite", name: "the master suite", look: "the top of the residential spire and the only quiet on it", privacy: "private", facility: "master_suite", needs_facility: true },
  { id: "her_room", name: "her room", look: "a bed, a light, a door that does not lock from the inside", privacy: "private" },
  { id: "servants_hall", name: "the servants' hall", look: "a dormitory, a laundry, and a service corridor to everywhere", privacy: "household", facility: "servants", needs_facility: true },
  { id: "concourse", name: "the concourse", look: "the commercial level at shift change, four hundred citizens moving through it and every one of them able to stop and watch", privacy: "public", tags: ["public use", "exposure"] },
  { id: "promenade", name: "the promenade", look: "the lit frontage where the working girls stand, and where the citizens do their looking before they do their buying", privacy: "public", tags: ["public use", "exposure"] },
  { id: "brothel_floor", name: "the brothel floor", look: "a bar, a stair, and rooms off the landing with the doors half open", privacy: "public", facility: "brothel", needs_facility: true, tags: ["public use"] },
  { id: "club_floor", name: "the club", look: "an open floor, low tables, a booth, and a view down into the concourse", privacy: "public", facility: "club", needs_facility: true, tags: ["exposure"] },
  { id: "dairy_floor", name: "the dairy", look: "tiled, drained, warm, and very loud with machinery", privacy: "household", facility: "dairy", needs_facility: true, tags: ["milking"] },
  { id: "arcade_hall", name: "the arcade", look: "a dim corridor of booths, coin slots on the outside and nothing at all on the inside", privacy: "public", facility: "arcade", needs_facility: true, tags: ["public use", "degradation"] },
  { id: "cellblock_floor", name: "the cellblock", look: "a short row of cells and a room with a drain in the middle of the floor", privacy: "household", facility: "cellblock", needs_facility: true, tags: ["punishment", "restraint"] },
  { id: "spa_floor", name: "the spa", look: "steam, warm stone, and somebody whose whole job is to be gentle", privacy: "household", facility: "spa", needs_facility: true, tags: ["aftercare", "slow"] },
  { id: "clinic_floor", name: "the clinic", look: "white, quiet, and better equipped than anything else on this floor", privacy: "household", facility: "clinic", needs_facility: true },
  { id: "pit_floor", name: "the pit", look: "sand, a rail, and standing room for four hundred", privacy: "public", facility: "pit", needs_facility: true, tags: ["exposure"] },
  { id: "farmyard_floor", name: "the farmyard", look: "grow lights, soil beds, and animal pens along the far wall", privacy: "household", facility: "farmyard", needs_facility: true },
  { id: "nursery_floor", name: "the nursery", look: "cots, a play floor, and staff who were chosen for patience", privacy: "household", facility: "nursery", needs_facility: true },
];

export const PLACE_BY_ID: Record<string, PlaceDef> = Object.fromEntries(PLACES.map((p) => [p.id, p]));
export const PLACE_BY_NAME: Record<string, PlaceDef> = Object.fromEntries(PLACES.map((p) => [p.name, p]));
