/**
 * WHERE SHE IS, AND WHAT SHE'S DOING.
 *
 * Being with her used to happen nowhere: whatever room you'd last walked into, with her standing
 * there waiting, the same whether she works a desk on the commercial levels, a bar in the brothel
 * or a stall in the dairy. Now she is somewhere: at work in the place her job puts her, in the
 * middle of it, or, some weeks, on her own time doing one of the things she does (engine/ownlife).
 * You go to her, and the scene happens there, with the place going on around her; or you send for
 * her, and she comes to you.
 *
 * Seeded by the week and the turn, so she's in the same place for the length of one visit and
 * somewhere else the next time.
 */
import type { Person, SaveState } from "./types";
import { PLACE_BY_ID, PLACES, type PlaceDef } from "../data/places";
import { rng } from "./rng";
import { sane } from "./health";

export interface Whereabouts {
  /** A place id: a room in data/places, or one of its ELSEWHERE. */
  place: string;
  name: string;
  look: string;
  privacy: PlaceDef["privacy"];
  /** What she's in the middle of when you find her, as a clause: "going through a stack of invoices at her desk". */
  doing: string;
  /** On her own time, not at work. */
  own?: boolean;
  /** Her place is at your side already: there's nowhere to go to. */
  withYou?: boolean;
}

/** What a woman at work in each place is doing when you come in. */
const AT: Record<string, string[]> = {
  penthouse: ["tidying your office", "sorting the post on your desk", "polishing the glass of the big window"],
  suite: ["making the bed", "laying out your things for the evening", "running you a bath"],
  her_room: ["lying on her bed", "sitting on her bed with her knees up", "folding her clothes into the drawer"],
  servants_hall: ["folding sheets in the laundry", "scrubbing pots in the big sink", "ironing at the long table"],
  concourse: ["working the crowd on the concourse", "standing where the foot traffic is thickest", "talking to a citizen by the fountain"],
  promenade: ["leaning in a doorway on the strip, watching the men go past", "haggling with a customer under a red light", "waiting under a streetlamp for the next one"],
  brothel_floor: ["sitting at the bar downstairs between customers", "coming down the stairs from one of the rooms", "on a customer's lap at a corner table"],
  club_floor: ["dancing on the floor", "carrying drinks between the low tables", "laughing with a table of regulars"],
  dairy_floor: ["hooked up to the machine in her stall", "sitting in her stall while the pumps run", "being unhooked from the machine"],
  arcade_hall: ["locked in her booth, a customer at the hole", "in her booth between customers"],
  cellblock_floor: ["sitting on the cot in her cell", "standing at the bars of her cell"],
  spa_floor: ["soaking in the pool", "lying on a massage table", "sitting in the steam room"],
  clinic_floor: ["in a ward bed, reading", "sitting up in a ward bed while a nurse checks her"],
  pit_floor: ["training in the sand", "having her hands taped at the edge of the arena"],
  farmyard_floor: ["on her knees in the soil beds", "carrying feed to the pens", "checking the grow lights"],
  nursery_floor: ["rocking a baby", "picking toys up off the floor of the play area"],
  office: ["going through a stack of invoices at her desk", "on the phone at her desk, taking notes", "at the copier with a pile of contracts", "in a meeting with two of the office staff"],
  classroom: ["at a desk taking notes", "standing at the board working through a problem"],
  schoolroom_floor: ["at her lessons with the other girls", "reciting for the tutor"],
  barracks_floor: ["drilling on the mat", "cleaning a rifle at the weapons rack"],
  stage: ["on the little stage, mid-song", "signing things for a queue of fans", "between sets, drinking water at the side of the stage"],
  storeroom: ["sitting on the cot in the storeroom", "curled up on the cot with the bulb on"],
  town_clinic: ["in a ward bed, reading", "sitting up while a nurse changes her dressing"],
};

const FACILITY_PLACE: Record<string, string> = Object.fromEntries(
  [...PLACES, ...Object.values(PLACE_BY_ID)].filter((p) => p.facility).map((p) => [p.facility!, p.id]),
);

function built(s: SaveState, facility: string): boolean {
  return (s.arcology.facilities[facility]?.level ?? 0) > 0;
}

/** Where her job puts her. */
function workplace(s: SaveState, p: Person): { place: string; withYou?: boolean } {
  if (p.facility === "master_suite") return { place: "suite", withYou: true };
  if (p.facility && FACILITY_PLACE[p.facility]) return { place: FACILITY_PLACE[p.facility] };
  switch (p.assignment) {
    case "please you": case "fucktoy": case "guard you": case "be your agent":
      return { place: built(s, "master_suite") && p.assignment !== "guard you" && p.assignment !== "be your agent" ? "suite" : "penthouse", withYou: true };
    case "be your secretary": return { place: "penthouse", withYou: true };
    case "house servant": return { place: built(s, "servants") ? "servants_hall" : "penthouse" };
    case "rest": return { place: "her_room" };
    case "whore": return { place: "promenade" };
    case "public servant": case "recruit girls": return { place: "concourse" };
    case "be an idol": return { place: built(s, "club") ? "club_floor" : "stage" };
    case "work in an office": return { place: "office" };
    case "classes": return { place: built(s, "schoolroom") ? "schoolroom_floor" : "classroom" };
    case "get treatment": return { place: built(s, "clinic") ? "clinic_floor" : "town_clinic" };
    case "be confined in the cellblock": return { place: built(s, "cellblock") ? "cellblock_floor" : "storeroom" };
    case "be your Head Girl": return { place: built(s, "servants") ? "servants_hall" : "penthouse" };
    default: return { place: "her_room" };
  }
}

const at = (id: string, doing: string, extra: Partial<Whereabouts> = {}): Whereabouts => {
  const pl = PLACE_BY_ID[id] ?? PLACE_BY_ID.her_room;
  return { place: pl.id, name: pl.name, look: pl.look, privacy: pl.privacy, doing, ...extra };
};

/** Where her work is, whatever she's doing this minute. */
export function workplaceOf(s: SaveState, p: Person): Whereabouts {
  const job = workplace(s, p);
  return at(job.place, "at work", { withYou: job.withYou });
}

/** Where she is right now, and what she's doing. */
export function whereabouts(s: SaveState, p: Person, salt: string | number = s.turn): Whereabouts {
  const r = rng(`where:${p.id}:${s.arcology.week}:${salt}`);
  // Laid up after surgery: in bed, wherever she's recovering.
  if (sane(p.health.recovery_weeks) > 0) {
    const ward = p.facility === "clinic" || (p.assignment ?? "").startsWith("get treatment");
    return at(ward ? (built(s, "clinic") ? "clinic_floor" : "town_clinic") : "her_room", "in bed, still recovering from her surgery");
  }
  const job = workplace(s, p);
  const locked = /cellblock|confined/.test(p.assignment ?? "") || p.facility === "cellblock" || p.facility === "arcade";
  // Some of the time she's off: in her room, or wherever she does what she does with her own time.
  const does = p.persona.interests ?? [];
  if (!locked && does.length && r.chance(job.withYou ? 0.25 : 0.35)) {
    const hobby = r.pick(does).replace(/^she\s+/i, "");
    const doing = ing(hobby);
    return at(built(s, "servants") && r.chance(0.4) ? "servants_hall" : "her_room", doing ? `on her own time, ${doing}` : `on her own time (she ${hobby})`, { own: true });
  }
  const pool = AT[job.place] ?? AT.her_room;
  return at(job.place, r.pick(pool), { withYou: job.withYou });
}

const DOUBLE: Record<string, string> = { runs: "running", sits: "sitting", gets: "getting", puts: "putting", plans: "planning", swims: "swimming", jogs: "jogging" };

/** "keeps seedlings in a cup" → "keeping seedlings in a cup". Null when it isn't something she can be in the middle of. */
export function ing(what: string): string | null {
  const t = what.trim();
  const going = t.match(/^(?:has been|has started|is|was|keeps on)\s+(\w+ing\b.*)$/i);
  if (going) return going[1];
  const [w, ...rest] = t.split(/\s+/);
  const v = verbIng(w);
  if (!v) return null;
  // "sews and alters her clothes": both verbs.
  if (rest[0] === "and" && rest[1]) rest[1] = verbIng(rest[1]) ?? rest[1];
  return [v, ...rest].join(" ");
}

function verbIng(w: string): string | null {
  const lw = w.toLowerCase();
  if (/^(knows|likes|loves|hates|wants|is|has|can|can't|won't|needs|misses)$/.test(lw)) return null;
  if (DOUBLE[lw]) return DOUBLE[lw];
  if (/ies$/.test(lw)) return `${lw.slice(0, -3)}ying`;
  if (/(sh|ch|x|ss|z)es$/.test(lw)) return `${lw.slice(0, -2)}ing`;
  if (/s$/.test(lw)) { const base = lw.slice(0, -1); return /[^e]e$/.test(base) ? `${base.slice(0, -1)}ing` : `${base}ing`; }
  return null;
}

/** "her room" → "in her room"; "the concourse" → "on the concourse". */
export function inPlace(name: string): string {
  return /concourse|promenade|brothel floor|stage/.test(name) ? `on ${name}` : `in ${name}`;
}

/** For the narrator: where the scene is, and that it stays there. */
export function whereLine(w: Whereabouts, summoned = false): string {
  if (summoned) return `## WHERE THIS IS\nThe player sent for her; she has come to the player, from ${w.name} where she was ${w.doing}. The scene is where the player is.`;
  return `## WHERE THIS IS\n${w.name[0].toUpperCase()}${w.name.slice(1)}: ${w.look}. ${w.withYou ? "She's here because her place is with the player." : "The player has come to find her here."} When the player comes in she's ${w.doing}. The scene happens here, around what she's doing: she carries on with it, or stops for the player, and the place goes on around her${w.privacy === "public" ? " (people about, who see whatever happens)" : w.privacy === "household" ? " (others of the household nearby)" : ""}. Background people belong to the place and stay in the background unless the player involves them. It moves somewhere else only if the player takes her or sends for her.`;
}
