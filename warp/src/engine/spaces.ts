/**
 * THE SPACES INSIDE THE ARCOLOGY.
 *
 * A place used to be a line of description a scene was set in, and a woman's room was a bag of
 * numbers on her record. Now every place inside the arcology is an object kept in the save: it has
 * a floor and a spot on it, what's in it and whose those things are, how clean it is, who's allowed
 * in, who is in it at each part of the day, and what has happened in it. You build something and it
 * appears; you give a woman a room of her own and it's a room on the residential floor, with her
 * things in it, that people walk into.
 *
 * THE DAY. Four parts: morning and afternoon are work, evening is her own time, night is where she
 * sleeps. Each week every woman is put somewhere for each, by her job, her tiredness, her friends,
 * what she does with her time and who's allowed where. Being in the same place at the same time is
 * how people meet, so who gets on with whom now follows where they actually are.
 *
 * THE WORLD REACTS. Use wears a place down and the servants and the menials put it right; a filthy
 * place frays the nerves of whoever spends the evening in it, a crowded one more so. Two women
 * who can't stand each other in the same lounge every evening have a scene; two who want each other
 * have another kind. All of it goes into the place's history, which the narrator reads when a scene
 * is set there, so a room remembers.
 */
import type { Person, SaveState } from "./types";
import { PLACES, PLACE_BY_ID, type PlaceDef } from "../data/places";
import { rng } from "./rng";
import { clamp, shove } from "./psyche";
import { getEdge, moveEdge } from "./social";
import { menialsOf } from "./menials";
import { workplaceOf } from "./whereabouts";

export type Part = "morning" | "afternoon" | "evening" | "night";
export const PARTS: Part[] = ["morning", "afternoon", "evening", "night"];
export const PART_LABEL: Record<Part, string> = { morning: "Morning", afternoon: "Afternoon", evening: "Evening", night: "Night" };

export type Floor = "penthouse" | "residential" | "facilities" | "public";
export const FLOORS: Floor[] = ["penthouse", "residential", "facilities", "public"];
export const FLOOR_LABEL: Record<Floor, string> = { penthouse: "The penthouse", residential: "Residential floors", facilities: "The facilities", public: "The concourse levels" };

export type Access = "anyone" | "household" | "invited" | "owner";
export const ACCESS_LABEL: Record<Access, string> = {
  anyone: "anyone, citizens included", household: "the household", invited: "only who lives here and who you send", owner: "only you, and who you bring",
};

export interface Item { id: string; name: string; owner?: string; by: "you" | "her" | "game"; week: number }
export interface Happening { week: number; part: Part; text: string; who: string[] }

export interface Space {
  id: string;
  name: string;
  floor: Floor;
  /** What it looks like, in one locked line, for the narrator and for pictures. */
  look: string;
  privacy: PlaceDef["privacy"];
  capacity: number;
  /** Her room: whose it is. */
  owner?: string;
  facility?: string;
  items: Item[];
  /** 0 filthy … 100 spotless. */
  condition: number;
  access: Access;
  history: Happening[];
  /** For pictures: the same place framed the same way every time. */
  seed: number;
  /** Whose evening place it is by habit, filled as people use it. */
  since: number;
  /** No longer there (a facility torn down, a woman gone): kept for the record, not shown. */
  gone?: boolean;
}

export interface Schedule { week: number; at: Record<string, Partial<Record<Part, string>>> }

/** The rooms every arcology has, whatever you've built. */
const BASE: { id: string; name: string; floor: Floor; look: string; privacy: PlaceDef["privacy"]; capacity: number; access: Access }[] = [
  { id: "penthouse", name: "the penthouse", floor: "penthouse", look: "your office at the top of the arcology, glass on three sides and the city under it", privacy: "private", capacity: 6, access: "owner" },
  { id: "kitchen", name: "the kitchen", floor: "residential", look: "the household kitchen, steel counters, a long table and a pantry door", privacy: "household", capacity: 10, access: "household" },
  { id: "baths", name: "the baths", floor: "residential", look: "the household baths, tiled, with a big shared tub and a row of showers", privacy: "household", capacity: 8, access: "household" },
  { id: "lounge", name: "the lounge", floor: "residential", look: "the household lounge, low couches, a screen on the wall and a window on the concourse", privacy: "household", capacity: 12, access: "household" },
  { id: "dormitory", name: "the dormitory", floor: "residential", look: "the dormitory, rows of narrow bunks with a locker each", privacy: "household", capacity: 30, access: "household" },
];

const FLOOR_OF: Record<string, Floor> = {
  suite: "penthouse", her_room: "residential", servants_hall: "residential",
  concourse: "public", promenade: "public", brothel_floor: "public", club_floor: "public", arcade_hall: "public", pit_floor: "public",
};

const hashOf = (t: string) => Math.abs([...t].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7));
const mine = (s: SaveState) => Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");
const first = (p: Person) => p.name.split(" ")[0];
const built = (s: SaveState, facility: string) => (s.arcology.facilities[facility]?.level ?? 0) > 0;

export function spacesOf(s: SaveState): Record<string, Space> {
  return (s.spaces ??= {});
}
export const roomIdOf = (p: Person) => `room:${p.id}`;
/** Whether she has a room of her own rather than a bunk. */
export const ownsRoom = (p: Person) => (p.room?.levels?.space ?? 0) > 0;

function make(id: string, name: string, floor: Floor, look: string, privacy: PlaceDef["privacy"], capacity: number, access: Access, week: number, extra: Partial<Space> = {}): Space {
  return { id, name, floor, look, privacy, capacity, access, items: [], condition: 80, history: [], seed: hashOf(id) % 2147483647, since: week, ...extra };
}

/**
 * MAKE THE SPACES MATCH THE ARCOLOGY. Run before anything reads them: what you've built appears,
 * what's gone is marked gone (its history kept), and every woman with a room of her own has it.
 */
export function syncSpaces(s: SaveState): Record<string, Space> {
  const sp = spacesOf(s);
  const week = s.arcology.week;
  const want = new Set<string>();
  for (const b of BASE) { want.add(b.id); sp[b.id] ??= make(b.id, b.name, b.floor, b.look, b.privacy, b.capacity, b.access, week); }
  for (const d of PLACES) {
    if (d.id === "her_room" || d.id === "penthouse") continue;
    if (d.needs_facility && d.facility && !built(s, d.facility)) continue;
    want.add(d.id);
    const floor = FLOOR_OF[d.id] ?? "facilities";
    sp[d.id] ??= make(d.id, d.name, floor, d.look, d.privacy, d.privacy === "public" ? 60 : 16,
      d.id === "suite" ? "owner" : d.privacy === "public" ? "anyone" : "household", week, { facility: d.facility });
  }
  for (const p of mine(s)) {
    if (!ownsRoom(p)) continue;
    const id = roomIdOf(p);
    want.add(id);
    sp[id] ??= make(id, `${first(p)}'s room`, "residential", "a bedroom of her own on the residential floor", "private", 3, "invited", week, { owner: p.id });
    sp[id].name = `${first(p)}'s room`;
    sp[id].look = roomLook(p);
  }
  for (const [id, x] of Object.entries(sp)) x.gone = !want.has(id) ? true : undefined;
  return sp;
}

/** Her room as it is, from engine/rooms and what's in it. */
function roomLook(p: Person): string {
  const r = p.room;
  const things = [...(r?.touches ?? []).map((t) => t.text)].slice(0, 3);
  return `${first(p)}'s own bedroom on the residential floor${things.length ? `, with ${things.join(", ")}` : ""}`;
}

export function liveSpaces(s: SaveState): Space[] {
  return Object.values(syncSpaces(s)).filter((x) => !x.gone);
}

/* ── where everyone is ───────────────────────────────────────────────────────────────────────── */

/** May she be in this space? */
export function allowed(s: SaveState, p: Person, x: Space): boolean {
  if (x.owner === p.id) return true;
  if (x.access === "anyone" || x.access === "household") return true;
  if (x.access === "owner") return false;
  // Invited: the woman who lives there, and anyone who shares it with her.
  return !!x.owner && !!getEdge(s.edges, x.owner, p.id)?.roles.includes("shares her room");
}

/** Where her job puts her, as a space id: one on the map, or "away" when her work is outside it
 *  (an office downtown, a classroom, a ward). */
function workSpace(s: SaveState, p: Person): string {
  const job = workplaceOf(s, p).place;
  if (job === "her_room") return sleepSpace(s, p);
  const x = spacesOf(s)[job];
  return x && !x.gone ? x.id : AWAY;
}

/** Out of the building, at work somewhere that isn't on the map. */
export const AWAY = "away";

function sleepSpace(s: SaveState, p: Person): string {
  if (/please you|fucktoy/.test(p.assignment ?? "") && spacesOf(s).suite && !spacesOf(s).suite.gone) return "suite";
  return ownsRoom(p) ? roomIdOf(p) : "dormitory";
}

/** Where she goes in her own time: by tiredness, her friends, what she does with her time. */
function eveningSpace(s: SaveState, p: Person, r: ReturnType<typeof rng>, placed: Record<string, Partial<Record<Part, string>>>): string {
  const locked = /cellblock|confined/.test(p.assignment ?? "") || p.facility === "cellblock" || p.facility === "arcade";
  if (locked) return placed[p.id]?.afternoon ?? sleepSpace(s, p);
  if (p.health.energy < 25 || p.psyche.state === "broken") return sleepSpace(s, p);
  const does = (p.persona.interests ?? []).join(" ").toLowerCase();
  const weights: [string, number][] = [
    ["lounge", 3 + (p.persona.gregariousness ?? 0.5) * 4],
    ["kitchen", 1 + (/cook|bak|eat|food|kitchen/.test(does) ? 4 : 0)],
    ["baths", 1 + (/bath|soak|shower|wash|pool/.test(does) ? 4 : 0) + (p.psyche.relaxation < -3 ? 1.5 : 0)],
    [sleepSpace(s, p), 2 + (p.psyche.relaxation < -3 ? 2 : 0) + ((p.persona.gregariousness ?? 0.5) < 0.3 ? 3 : 0)],
  ];
  if (spacesOf(s).spa && !spacesOf(s).spa.gone) weights.push(["spa_floor", /massage|steam|spa/.test(does) ? 3 : 0.5]);
  // Friends pull: the warmest edge she has, wherever that woman already is this evening.
  let best: { id: string; w: number } | null = null;
  for (const q of mine(s)) {
    if (q.id === p.id) continue;
    const w = getEdge(s.edges, p.id, q.id)?.warmth ?? 0;
    if (w > 30 && placed[q.id]?.evening && (!best || w > best.w)) best = { id: placed[q.id].evening!, w };
  }
  if (best) weights.push([best.id, best.w / 12]);
  const sp = spacesOf(s);
  const ok = weights.filter(([id, w]) => w > 0 && sp[id] && !sp[id].gone && allowed(s, p, sp[id]));
  return ok.length ? r.weighted(ok.map((x) => x[0]), (id) => ok.find((x) => x[0] === id)![1]) : sleepSpace(s, p);
}

/** Put everyone somewhere for each part of the day, once a week. */
export function scheduleWeek(s: SaveState): Schedule {
  syncSpaces(s);
  const week = s.arcology.week;
  const at: Schedule["at"] = {};
  const people = mine(s).sort((a, b) => a.id.localeCompare(b.id));
  for (const p of people) {
    const work = workSpace(s, p);
    const home = sleepSpace(s, p);
    at[p.id] = { morning: work, afternoon: work, night: home };
  }
  // Evenings after everyone's work is known, so friends can find each other.
  for (const p of people) {
    at[p.id].evening = eveningSpace(s, p, rng(`evening:${p.id}:${week}`), at);
    // Nothing to do all day: the afternoon goes wherever her evenings do.
    if ((p.assignment ?? "rest") === "rest") at[p.id].afternoon = at[p.id].evening;
  }
  // Crowding: past twice its capacity, the latest arrivals go home.
  const sp = spacesOf(s);
  for (const part of PARTS) {
    const count: Record<string, number> = {};
    for (const p of people) {
      const id = at[p.id][part]!;
      count[id] = (count[id] ?? 0) + 1;
      if (sp[id] && count[id] > sp[id].capacity * 2 && part === "evening") at[p.id].evening = sleepSpace(s, p);
    }
  }
  return (s.schedule = { week, at });
}

export function scheduleOf(s: SaveState): Schedule {
  return s.schedule && s.schedule.week === s.arcology.week ? s.schedule : scheduleWeek(s);
}

/** Who's in a space at a part of the day. */
export function occupants(s: SaveState, spaceId: string, part: Part): Person[] {
  const sch = scheduleOf(s);
  return mine(s).filter((p) => sch.at[p.id]?.[part] === spaceId);
}

/** The part of the day a clock string falls in ("Week 12, Tuesday 14:30"). */
export function partAt(time: string | undefined): Part {
  const h = Number(/(\d{1,2}):\d{2}/.exec(time ?? "")?.[1] ?? 12);
  return h < 5 || h >= 23 ? "night" : h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}

/** Where she is at a part of the day, as a space. */
export function whereNow(s: SaveState, p: Person, part: Part): Space | undefined {
  const id = scheduleOf(s).at[p.id]?.[part];
  return id ? spacesOf(s)[id] : undefined;
}

/* ── the week in the spaces ──────────────────────────────────────────────────────────────────── */

const HISTORY = 24;
export function note(x: Space, h: Happening): void {
  x.history.push(h);
  if (x.history.length > HISTORY) x.history.splice(0, x.history.length - HISTORY);
}

/**
 * THE WEEK, PLACE BY PLACE. Wear and cleaning, crowding and mess on the nerves of whoever's there,
 * the evenings that bring people together, and the incidents that come of who meets whom. Returns
 * report lines.
 */
export function tickSpaces(s: SaveState): string[] {
  const sch = scheduleOf(s);
  const sp = spacesOf(s);
  const week = s.arcology.week;
  const lines: string[] = [];
  const people = mine(s);

  // Cleaning: house servants and menials on sanitation, spread over the household's rooms.
  const cleaners = people.filter((p) => /servant|clean/.test(p.assignment ?? "")).length;
  // Women with nothing to do keep their own quarters, after a fashion.
  const idleHands = people.filter((p) => (p.assignment ?? "rest") === "rest" && p.psyche.state !== "broken").length;
  const menial = menialsOf(s).jobs.sanitation ?? 0;
  const cleanPower = cleaners * 18 + idleHands * 4 + Math.min(200, menial) * 0.6;
  const kept = Object.values(sp).filter((x) => !x.gone && x.floor !== "public");
  const share = kept.length ? cleanPower / kept.length : 0;

  for (const x of Object.values(sp)) {
    if (x.gone) continue;
    // Sleeping in a place wears it far less than living in it all day.
    const use = PARTS.reduce((n, part) => n + people.filter((p) => sch.at[p.id]?.[part] === x.id).length * (part === "night" ? 0.35 : 1), 0);
    // Her own room she keeps herself, about as well as she's doing.
    const self = x.owner ? (s.people[x.owner]?.psyche.relaxation ?? 0) * 0.8 + 4 : 0;
    // The household tidies up after itself about as fast as an ordinary week dirties a place; it's
    // a crowd, a big household with nobody on cleaning, or neglect that lets one go.
    const tidy = Math.min(use, 10) * 0.9 + 3;
    x.condition = clamp(Math.round(x.condition - use * 1.1 + tidy + (x.floor === "public" ? 6 : share) + self), 0, 100);
    if (x.condition < 25 && !x.history.some((h) => h.week >= week - 3 && /filthy/.test(h.text))) {
      note(x, { week, part: "evening", text: `${x.name} has gone filthy: nobody's keeping it`, who: [] });
      lines.push(`${cap(x.name)} has gone filthy. Nobody's keeping it.`);
    }
  }

  for (const part of PARTS) {
    const groups = new Map<string, Person[]>();
    for (const p of people) {
      const id = sch.at[p.id]?.[part];
      if (!id) continue;
      (groups.get(id) ?? groups.set(id, []).get(id)!).push(p);
    }
    for (const [id, group] of groups) {
      const x = sp[id];
      if (!x) continue;
      // Mess and crowding on the nerves, felt most in her own time.
      const weight = part === "evening" ? 1 : part === "night" ? 0.6 : 0.4;
      const crowd = group.length > x.capacity ? (group.length / x.capacity - 1) * 0.6 : 0;
      const mess = x.condition < 30 ? (30 - x.condition) / 60 : x.condition > 85 ? -0.1 : 0;
      for (const p of group) if (crowd + mess) shove(p.psyche, -clamp((crowd + mess) * weight, -0.3, 1.2));
      if (part !== "evening" || group.length < 2) continue;
      // Who meets whom in their own time: this is where friends and enemies are made.
      const sample = group.slice(0, 8);
      for (const a of sample) for (const b of sample) {
        if (a.id >= b.id) continue;
        moveEdge(s.edges, a.id, b.id, { warmth: 0.6 });
        moveEdge(s.edges, b.id, a.id, { warmth: 0.6 });
      }
      const r = rng(`incident:${id}:${week}`);
      const pair = incident(s, sample, r);
      if (pair) {
        note(x, { week, part, text: pair.text, who: pair.who });
        lines.push(pair.text.charAt(0).toUpperCase() + pair.text.slice(1) + ".");
      }
    }
  }
  return lines;
}

/** One thing that happened between two of them, if anything did. */
function incident(s: SaveState, group: Person[], r: ReturnType<typeof rng>): { text: string; who: string[] } | null {
  if (r() > 0.45) return null;
  let worst: [Person, Person, number] | null = null, hottest: [Person, Person, number] | null = null;
  for (const a of group) for (const b of group) {
    if (a.id === b.id) continue;
    const e = getEdge(s.edges, a.id, b.id);
    if (!e) continue;
    if (e.warmth < -15 && (!worst || e.warmth < worst[2])) worst = [a, b, e.warmth];
    if (e.attraction > 45 && e.warmth > 10 && (!hottest || e.attraction > hottest[2])) hottest = [a, b, e.attraction];
  }
  if (worst && r() < 0.7) {
    const [a, b] = worst;
    moveEdge(s.edges, a.id, b.id, { warmth: -3 }); moveEdge(s.edges, b.id, a.id, { warmth: -3 });
    shove(a.psyche, -0.6); shove(b.psyche, -0.6);
    return { text: r.pick([`${first(a)} and ${first(b)} had a screaming row in front of everyone`, `${first(a)} threw something at ${first(b)}`, `${first(a)} said something about ${first(b)} that got back to her within the hour`]), who: [a.id, b.id] };
  }
  if (hottest && r() < 0.6) {
    const [a, b] = hottest;
    moveEdge(s.edges, a.id, b.id, { warmth: 3, attraction: 2 }); moveEdge(s.edges, b.id, a.id, { warmth: 3, attraction: 2 });
    a.psyche.arousal = clamp(a.psyche.arousal + 15, 0, 100); b.psyche.arousal = clamp(b.psyche.arousal + 15, 0, 100);
    return { text: r.pick([`${first(a)} and ${first(b)} disappeared together and came back flushed`, `${first(a)} ended up in ${first(b)}'s lap and nobody said anything`, `${first(a)} and ${first(b)} were caught kissing`]), who: [a.id, b.id] };
  }
  return null;
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/* ── for the narrator ───────────────────────────────────────────────────────────────────────── */

const condWord = (c: number) => c < 20 ? "filthy" : c < 45 ? "grubby and neglected" : c < 75 ? "lived-in" : c < 90 ? "clean" : "spotless";

/** A space as the narrator should see it: what it's like, what's in it, who's there, what happened here. */
export function spaceLine(s: SaveState, x: Space, part: Part, except: string[] = []): string {
  const here = occupants(s, x.id, part).filter((p) => !except.includes(p.id)).map((p) => first(p));
  const things = x.items.map((i) => `${i.name}${i.owner && s.people[i.owner] ? ` (${first(s.people[i.owner])}'s)` : ""}`);
  const past = x.history.slice(-3).map((h) => `week ${h.week}: ${h.text}`);
  return [
    `THE PLACE: ${x.name}. ${cap(x.look)}. It's ${condWord(x.condition)}.`,
    things.length ? `In it: ${things.join(", ")}.` : "",
    here.length ? `Also here this ${part}: ${here.join(", ")}. They're in the background unless the player brings them in.` : `Nobody else from the household is here this ${part}.`,
    past.length ? `What happened here before, which people here remember: ${past.join("; ")}.` : "",
  ].filter(Boolean).join(" ");
}

/** Her week in places, for her card. */
export function dayLine(s: SaveState, p: Person): string {
  const at = scheduleOf(s).at[p.id];
  if (!at) return "";
  const name = (id?: string) => (id ? spacesOf(s)[id]?.name : undefined) ?? "somewhere";
  return `HER DAY THIS WEEK: mornings and afternoons in ${name(at.morning)}${at.afternoon !== at.morning ? ` / ${name(at.afternoon)}` : ""}, evenings in ${name(at.evening)}, nights in ${name(at.night)}.`;
}

/* ── what you do to a space ─────────────────────────────────────────────────────────────────── */

export const ITEM_COST = 500;
export const CLEAN_COST = 800;

export function addItem(s: SaveState, spaceId: string, name: string, owner?: string): string {
  const x = spacesOf(s)[spaceId];
  const t = name.trim().replace(/\s+/g, " ").slice(0, 100);
  if (!x || !t) return "";
  if (s.arcology.cash < ITEM_COST) return `That costs ¤${ITEM_COST}.`;
  s.arcology.cash -= ITEM_COST;
  x.items.push({ id: `i${s.arcology.week}-${x.items.length}-${hashOf(t) % 1000}`, name: t, owner, by: "you", week: s.arcology.week });
  if (x.items.length > 12) x.items.shift();
  note(x, { week: s.arcology.week, part: "morning", text: `you had ${t} put in ${x.name}`, who: [] });
  return `${t}: in ${x.name} now.`;
}

export function removeItem(s: SaveState, spaceId: string, itemId: string): string {
  const x = spacesOf(s)[spaceId];
  const it = x?.items.find((i) => i.id === itemId);
  if (!x || !it) return "";
  x.items = x.items.filter((i) => i.id !== itemId);
  note(x, { week: s.arcology.week, part: "morning", text: `you had ${it.name} taken out of ${x.name}`, who: [] });
  return `${it.name}: gone.`;
}

export function cleanSpace(s: SaveState, spaceId: string): string {
  const x = spacesOf(s)[spaceId];
  if (!x) return "";
  if (s.arcology.cash < CLEAN_COST) return `That costs ¤${CLEAN_COST}.`;
  s.arcology.cash -= CLEAN_COST;
  x.condition = 100;
  return `${cap(x.name)} is scrubbed top to bottom.`;
}

export function setAccess(s: SaveState, spaceId: string, access: Access): void {
  const x = spacesOf(s)[spaceId];
  if (!x) return;
  x.access = access;
  s.schedule = undefined;
}

/** The kinds of place a space is, for the map's colours. */
export function placeDef(x: Space): PlaceDef | undefined { return PLACE_BY_ID[x.id]; }
