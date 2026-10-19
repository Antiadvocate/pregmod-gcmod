/**
 * KEPT — your life once she holds your collar.
 *
 * The arcology stops being the thing you look at. What you look at is your room, which is
 * whatever she says it is; the job she's given you; this week's list of what she wants done; and
 * the few things she lets you have, like the key to the lift and leave to see the others. She
 * gives and takes all of it, out of who she is and how you've been, and every scene with her knows
 * what you have and what you've lost.
 */
import type { SaveState, Person, ReportLine } from "./types";
import type { Reign, ReignStyle } from "./reign";
import { AXES, type RoomAxis } from "../data/rooms";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { remember } from "./memory";

/* ── your room ──────────────────────────────────────────────────────────────────────────────── */

export interface YourItem {
  id: string;
  name: string;
  /** Good for you (+) or done to you (−). */
  comfort: number;
  /** What it lets you do. */
  lets?: "city" | "others" | "calls";
  note: string;
}

export const YOUR_ITEMS: YourItem[] = [
  { id: "lift", name: "a key to the lift", comfort: 1.5, lets: "city", note: "you can go down into the city" },
  { id: "others", name: "leave to see the others", comfort: 1.2, lets: "others", note: "you can spend time with the other slaves" },
  { id: "phone", name: "your old phone", comfort: 1, lets: "calls", note: "you can call her governors and the other cities" },
  { id: "clothes", name: "clothes of your own", comfort: 0.8, note: "something to wear she didn't pick" },
  { id: "books", name: "a shelf of books", comfort: 0.6, note: "something to read" },
  { id: "screen", name: "a screen with the feeds", comfort: 0.6, note: "the news, the shows" },
  { id: "keepsakes", name: "things from before", comfort: 1, note: "a few things from when you owned the place" },
  { id: "plant", name: "a plant to look after", comfort: 0.4, note: "something alive" },
  { id: "chain", name: "a chain from your collar to her bed", comfort: -1.5, note: "you can't get further than the bed's length" },
  { id: "camera", name: "a camera watching you", comfort: -1, note: "she sees everything you do" },
  { id: "bell", name: "a bell on your collar", comfort: -0.4, note: "everyone hears you coming" },
  { id: "cane", name: "a cane on a hook by the door", comfort: -0.8, note: "a reminder" },
];
export const YOUR_ITEM: Record<string, YourItem> = Object.fromEntries(YOUR_ITEMS.map((x) => [x.id, x]));

export interface YourRoom {
  levels: Record<RoomAxis, number>;
  items: string[];
  log: { week: number; text: string; gave: boolean }[];
}

const START: Record<ReignStyle, { levels: Record<RoomAxis, number>; items: string[] }> = {
  doting: { levels: { space: 3, bed: 3, bath: 2, view: 2, climate: 2 }, items: ["lift", "others", "phone", "clothes", "books", "keepsakes"] },
  reluctant: { levels: { space: 4, bed: 3, bath: 2, view: 3, climate: 2 }, items: ["lift", "others", "phone", "clothes", "books", "screen", "keepsakes"] },
  playful: { levels: { space: 3, bed: -1, bath: 1, view: 2, climate: 1 }, items: ["others", "bell"] },
  stern: { levels: { space: 3, bed: -1, bath: 0, view: 1, climate: 1 }, items: ["others"] },
  cruel: { levels: { space: 3, bed: -1, bath: 0, view: 0, climate: -1 }, items: ["chain", "camera", "cane"] },
  vengeful: { levels: { space: -1, bed: -1, bath: 0, view: 0, climate: -1 }, items: ["camera"] },
};

export function yourRoom(s: SaveState): YourRoom | undefined {
  const r = s.reign;
  if (!r || r.ended) return undefined;
  if (!r.room) {
    const st = START[r.style];
    r.room = { levels: { ...st.levels }, items: [...st.items], log: [] };
  }
  return r.room;
}

export function roomLevelName(axis: RoomAxis, level: number): string {
  // The good rooms are hers: you sleep in them because she keeps you there.
  if (axis === "space" && level === 3) return "her bedroom, on the residential floors";
  if (axis === "space" && level === 4) return "her suite in the spire";
  const l = AXES[axis].levels.find((x) => x.level === level) ?? AXES[axis].levels[0];
  // The room tables are written about her; yours is the same furniture.
  return l.name.replace(/\bher own\b/g, "your own").replace(/\bher\b(?! likes)/g, "your");
}

export function roomComfort(room: YourRoom): number {
  let c = 0;
  for (const a of Object.keys(AXES) as RoomAxis[]) c += AXES[a].levels.find((x) => x.level === room.levels[a])?.comfort ?? 0;
  for (const id of room.items) c += YOUR_ITEM[id]?.comfort ?? 0;
  return Math.round(c * 10) / 10;
}

/** Whether she lets you do this. Always yes when nobody holds your collar. */
export function allowed(s: SaveState, what: "city" | "others" | "calls"): boolean {
  const r = s.reign;
  if (!s.player.owned_by || !r || r.ended) return true;
  return (yourRoom(s)?.items ?? []).some((id) => YOUR_ITEM[id]?.lets === what);
}

export const NOT_ALLOWED: Record<"city" | "others" | "calls", (her: string) => string> = {
  city: (h) => `${h} hasn't given you a key to the lift. You don't go down into the city unless she takes you.`,
  others: (h) => `${h} hasn't given you leave to see the others. You go where she sends you.`,
  calls: (h) => `${h} has your phone. Nobody outside hears from you unless she says so.`,
};

/** For prompts: what you have, in plain words. */
export function roomBrief(s: SaveState): string {
  const room = yourRoom(s);
  if (!room) return "";
  const axes = (Object.keys(AXES) as RoomAxis[]).map((a) => roomLevelName(a, room.levels[a]));
  const items = room.items.map((id) => YOUR_ITEM[id]?.name).filter(Boolean);
  const missing = YOUR_ITEMS.filter((x) => x.lets && !room.items.includes(x.id)).map((x) => x.name);
  const last = room.log.slice(-2).map((l) => `week ${l.week}, she ${l.gave ? "gave you" : "took"} ${l.text}`);
  return `YOUR ROOM, AS SHE KEEPS IT: ${axes.join(", ")}${items.length ? `; you have ${items.join(", ")}` : ""}.${missing.length ? ` You don't have ${missing.join(" or ")}.` : ""}${last.length ? ` Lately: ${last.join("; ")}.` : ""}`;
}

const AXIS_ORDER: RoomAxis[] = ["bed", "climate", "space", "view", "bath"];

/** She gives you something. Returns what, or "" when there's nothing left to give. */
export function give(s: SaveState, what?: string): string {
  const room = yourRoom(s);
  if (!room) return "";
  const r = s.reign!;
  const pick = what && YOUR_ITEM[what] && !room.items.includes(what) ? what
    : YOUR_ITEMS.filter((x) => x.comfort > 0 && !room.items.includes(x.id)).sort((a, b) => a.comfort - b.comfort)[0]?.id;
  const bad = room.items.find((id) => (YOUR_ITEM[id]?.comfort ?? 0) < 0);
  // Taking away something done to you is a gift too, and a kind one does that first.
  if (!what && bad && (r.style === "doting" || r.style === "reluctant")) {
    room.items = room.items.filter((x) => x !== bad);
    return log(s, room, `${YOUR_ITEM[bad].name} away`, true);
  }
  if (what && what in AXES) return raise(s, room, what as RoomAxis, 1);
  if (pick) { room.items.push(pick); return log(s, room, YOUR_ITEM[pick].name, true); }
  for (const a of AXIS_ORDER) { const t = raise(s, room, a, 1); if (t) return t; }
  return "";
}

/** She takes something away, or does something to your room. */
export function take(s: SaveState, what?: string): string {
  const room = yourRoom(s);
  if (!room) return "";
  const r = s.reign!;
  if (what && what in AXES) return raise(s, room, what as RoomAxis, -1);
  const has = room.items.filter((id) => (YOUR_ITEM[id]?.comfort ?? 0) > 0);
  // The privileges go first when she's angry: they're what you'd miss.
  const pick = what && room.items.includes(what) ? what : has.sort((a, b) => (YOUR_ITEM[b].lets ? 1 : 0) - (YOUR_ITEM[a].lets ? 1 : 0))[0];
  if (pick && (YOUR_ITEM[pick]?.comfort ?? 0) > 0) { room.items = room.items.filter((x) => x !== pick); return log(s, room, YOUR_ITEM[pick].name, false); }
  const worse = (r.style === "cruel" || r.style === "vengeful") ? ["chain", "cane", "camera", "bell"].find((x) => !room.items.includes(x)) : undefined;
  if (worse) { room.items.push(worse); return log(s, room, `${YOUR_ITEM[worse].name} put in`, false); }
  for (const a of AXIS_ORDER) { const t = raise(s, room, a, -1); if (t) return t; }
  return "";
}

function raise(s: SaveState, room: YourRoom, a: RoomAxis, by: number): string {
  const levels = AXES[a].levels.map((x) => x.level);
  const next = room.levels[a] + by;
  if (!levels.includes(next)) return "";
  room.levels[a] = next;
  return log(s, room, roomLevelName(a, next), by > 0, by < 0);
}

function log(s: SaveState, room: YourRoom, text: string, gave: boolean, downgrade = false): string {
  room.log.push({ week: s.arcology.week, text: downgrade ? `you down to ${text}` : text, gave });
  if (room.log.length > 30) room.log.shift();
  const h = s.player.owned_by ? s.people[s.player.owned_by] : undefined;
  const line = gave ? `${h?.name ?? "She"} gave you ${text}.` : downgrade ? `${h?.name ?? "She"} moved you down to ${text}.` : / put in$/.test(text) ? `${h?.name ?? "She"} had ${text.replace(/ put in$/, "")} put in your room.` : `${h?.name ?? "She"} took ${text} away from you.`;
  if (h && s.memory[h.id]) remember(s.memory[h.id], { content: gave ? `I gave the owner ${text}` : `I took ${text} from the owner`, week: s.arcology.week, importance: 4, charge: gave ? "warm" : "cold" });
  return line;
}

/* ── your job, and this week's list ─────────────────────────────────────────────────────────── */

export interface Job { id: string; name: string; tasks: string[]; cash?: number; rep?: number }

export const JOBS: Job[] = [
  { id: "body", name: "her body servant", tasks: ["dress her in the morning and undress her at night", "draw her bath and wash her", "wait outside her door all evening in case she calls"] },
  { id: "table", name: "serving at her table", tasks: ["serve her dinner on your knees and eat what she leaves", "pour for her guests all night without speaking", "polish the silver she eats with"] },
  { id: "floors", name: "scrubbing the penthouse", tasks: ["scrub the penthouse floors on your hands and knees", "clean the slaves' quarters, the showers included", "do the household's laundry"] },
  { id: "books", name: "keeping her books", tasks: ["go through the week's accounts and report to her", "write her letters for her to sign", "sit beside her in her meetings and take notes"], cash: 1500 },
  { id: "display", name: "on display in the concourse", tasks: ["kneel on the plinth in the concourse for the afternoon", "let citizens look you over and answer their questions", "wear the sign she wrote for you"], rep: 150 },
  { id: "parties", name: "entertaining at her parties", tasks: ["serve drinks naked at her party", "do what her guests ask for an evening", "dance for the room when she tells you to"], rep: 100 },
  { id: "brothel", name: "working in the brothel", tasks: ["take customers in the brothel for a shift", "work the brothel window for the evening", "do whatever the madam says for a night"], cash: 2500, rep: -200 },
];
export const JOB: Record<string, Job> = Object.fromEntries(JOBS.map((j) => [j.id, j]));

const JOB_BY_STYLE: Record<ReignStyle, string[]> = {
  doting: ["body", "books"], reluctant: ["books"], playful: ["parties", "display", "body"],
  stern: ["table", "books", "floors"], cruel: ["floors", "display", "brothel"], vengeful: ["floors", "brothel", "table"],
};

export interface Task { id: string; text: string; state: "open" | "done" | "refused" | "neglected"; from: "job" | "duty" }

/** The job she gives you, by who she is. Kept until she changes it. */
export function jobOf(s: SaveState): Job | undefined {
  const r = s.reign;
  if (!r || r.ended) return undefined;
  if (!r.job || !JOB[r.job]) r.job = rng(`job:${r.keeper}:${r.since}`).pick(JOB_BY_STYLE[r.style]);
  return JOB[r.job];
}

/** This week's list: two things from your job and one of her standing rules. */
export function weekTasks(s: SaveState, r: Reign): Task[] {
  const job = jobOf(s);
  const rnd = rng(`tasks:${s.arcology.week}:${r.keeper}`);
  const from = job ? rnd.shuffle([...job.tasks]).slice(0, 2).map((text) => ({ text, from: "job" as const })) : [];
  const duty = r.duties.length ? [{ text: rnd.pick(r.duties), from: "duty" as const }] : [];
  return [...from, ...duty].map((t, i) => ({ id: `t${s.arcology.week}-${i}`, text: t.text, state: "open", from: t.from }));
}

const DONE: Record<ReignStyle, (n: string) => string> = {
  doting: (n) => `${n} notices, and kisses the top of your head.`,
  reluctant: (n) => `${n} thanks you, and looks like she means it.`,
  playful: (n) => `${n} calls you a good pet and scratches behind your ear.`,
  stern: (n) => `${n} checks it, nods once, and moves on.`,
  cruel: (n) => `${n} finds something wrong with it anyway, but lets it go.`,
  vengeful: (n) => `${n} watches you finish and says nothing.`,
};
const REFUSED: Record<ReignStyle, (n: string) => string> = {
  doting: (n) => `${n} is hurt, and doesn't hide it.`,
  reluctant: (n) => `${n} doesn't make you. She looks lost.`,
  playful: (n) => `${n} laughs, and makes you do it on a leash instead.`,
  stern: (n) => `${n} adds a punishment to your list for Sunday.`,
  cruel: (n) => `${n} has you held down and caned in front of the household.`,
  vengeful: (n) => `${n} writes it down.`,
};

/** You did it, or you refused. */
export function answerTask(s: SaveState, taskId: string, done: boolean): string {
  const r = s.reign, h = s.player.owned_by ? s.people[s.player.owned_by] : undefined;
  const t = r?.tasks?.find((x) => x.id === taskId);
  if (!r || !h || !t || t.state !== "open") return "";
  t.state = done ? "done" : "refused";
  r.favour = clamp(r.favour + (done ? 4 : -8), -100, 100);
  if (done) r.obeyed++; else r.defied++;
  const job = r.job ? JOB[r.job] : undefined;
  if (done && t.from === "job" && job) { if (job.cash) s.arcology.cash += Math.round(job.cash / 2); if (job.rep) s.arcology.rep = Math.max(0, s.arcology.rep + Math.round(job.rep / 2)); }
  return `${done ? `You ${t.text}.` : `You refuse to ${t.text}.`} ${(done ? DONE : REFUSED)[r.style](h.name)}`;
}

/**
 * Weekly, from her reign: last week's list is settled (what you left undone counts against you),
 * a new one is written, and she gives or takes something from your room, by how you've been.
 * `herHand` is false when the model is deciding what she does with your room this week.
 */
export function tickKept(s: SaveState, h: Person, r: Reign, herHand: boolean): ReportLine[] {
  const out: ReportLine[] = [];
  const week = s.arcology.week;
  yourRoom(s);
  jobOf(s);
  const last = r.tasks ?? [];
  const done = last.filter((t) => t.state === "done").length;
  const left = last.filter((t) => t.state === "open");
  for (const t of left) { t.state = "neglected"; r.favour = clamp(r.favour - 3, -100, 100); }
  if (left.length) out.push({ text: `You left ${left.length === 1 ? "one thing" : `${left.length} things`} on ${h.name}'s list undone. She noticed.`, tone: "warning", weight: 6, person: h.id });
  const refused = last.filter((t) => t.state === "refused").length;
  r.tasks = weekTasks(s, r);
  if (herHand && last.length) {
    const good = done === last.length && r.favour > 10;
    const bad = refused + left.length >= 2 || r.favour < -25;
    const rnd = rng(`room:${week}:${h.id}`);
    const line = good && rnd.chance(r.style === "cruel" || r.style === "vengeful" ? 0.25 : 0.55) ? give(s)
      : bad && rnd.chance(r.style === "doting" || r.style === "reluctant" ? 0.3 : 0.7) ? take(s) : "";
    if (line) out.push({ text: line, tone: good ? "good" : "bad", weight: 7, person: h.id });
  }
  // Her job for you changes now and then.
  if (herHand && week - r.since > 0 && (week - r.since) % 8 === 0) {
    const pool = JOB_BY_STYLE[r.style].filter((j) => j !== r.job);
    if (pool.length) { r.job = rng(`job:${week}:${h.id}`).pick(pool); out.push({ text: `${h.name} has a new job for you: ${JOB[r.job].name}.`, tone: "warning", weight: 7, person: h.id }); }
  }
  return out;
}
