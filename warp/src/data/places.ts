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
  { id: "penthouse", name: "the penthouse", look: "your penthouse office at the top of the arcology", privacy: "private" },
  { id: "suite", name: "the master suite", look: "your private suite, with a huge bed", privacy: "private", facility: "master_suite", needs_facility: true },
  { id: "her_room", name: "her room", look: "a small bedroom with a bed and a lamp", privacy: "private" },
  { id: "servants_hall", name: "the servants' hall", look: "the slave dormitory and laundry", privacy: "household", facility: "servants", needs_facility: true },
  { id: "concourse", name: "the concourse", look: "the main concourse, busy with citizens", privacy: "public", tags: ["public use", "exposure"] },
  { id: "promenade", name: "the promenade", look: "the red-light strip where whores stand and wait for customers", privacy: "public", tags: ["public use", "exposure"] },
  { id: "brothel_floor", name: "the brothel floor", look: "the brothel: a bar downstairs and bedrooms upstairs", privacy: "public", facility: "brothel", needs_facility: true, tags: ["public use"] },
  { id: "club_floor", name: "the club", look: "the club: a dance floor, low tables and a DJ booth", privacy: "public", facility: "club", needs_facility: true, tags: ["exposure"] },
  { id: "dairy_floor", name: "the dairy", look: "the dairy: tiled stalls and loud milking machines", privacy: "household", facility: "dairy", needs_facility: true, tags: ["milking"] },
  { id: "arcade_hall", name: "the arcade", look: "the arcade: a dim corridor of glory-hole booths", privacy: "public", facility: "arcade", needs_facility: true, tags: ["public use", "degradation"] },
  { id: "cellblock_floor", name: "the cellblock", look: "the cellblock: a row of cells and a punishment room", privacy: "household", facility: "cellblock", needs_facility: true, tags: ["punishment", "restraint"] },
  { id: "spa_floor", name: "the spa", look: "the spa: steam rooms, pools and massage tables", privacy: "household", facility: "spa", needs_facility: true, tags: ["aftercare", "slow"] },
  { id: "clinic_floor", name: "the clinic", look: "the clinic: a clean white medical ward", privacy: "household", facility: "clinic", needs_facility: true },
  { id: "pit_floor", name: "the pit", look: "the pit: a sand arena with a crowd rail", privacy: "public", facility: "pit", needs_facility: true, tags: ["exposure"] },
  { id: "farmyard_floor", name: "the farmyard", look: "the farmyard: grow lights, soil beds and animal pens", privacy: "household", facility: "farmyard", needs_facility: true },
  { id: "nursery_floor", name: "the nursery", look: "the nursery: cribs and a play area", privacy: "household", facility: "nursery", needs_facility: true },
];

export const PLACE_BY_ID: Record<string, PlaceDef> = Object.fromEntries(PLACES.map((p) => [p.id, p]));
export const PLACE_BY_NAME: Record<string, PlaceDef> = Object.fromEntries(PLACES.map((p) => [p.name, p]));
