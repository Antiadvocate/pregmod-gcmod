/**
 * MOMENTS — a reaction that doesn't end on one line.
 *
 * Anything a slave does in answer to you — after an event, a household situation, a request, a
 * follow-up in bed, a question — can open a moment. With a model configured, the narrator writes
 * the moment out in full and offers four ways to answer; your reply (picked or typed) continues it,
 * and the bookkeeper records what changed. A moment you walk away from stays open on her page and
 * on the Penthouse, and picks up where it left off, however many weeks later. Only you end one; the
 * game says when it thinks a scene has wound down, and leaves the call to you. An ended one can be
 * picked back up. With no model, the written game answers in her voice and still offers you the next
 * thing to say.
 */
import { continuitySlips } from "./continuity";
import { practiseFrom } from "./player";
import { coarsen, REGISTER_TAIL } from "./register";
import { sentinelsLine } from "./battles";
import { cultureBrief } from "./culture";
import { lawsLine } from "./lawlife";
import type { Person, SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { castBrief, facesIn, keyOf, meet, parseCast } from "./faces";
import { settledBrief, weightBrief } from "./fates";
import { ownedBrief } from "./share";
import { CONVERSATION, HOUSE_STYLE, personCard, BOOKKEEPER_SYSTEM, bookkeeperContext, householdLine } from "./prompts";
import { didntFollow, finishLast } from "./style";
import { worldBrief } from "./world";
import { aroundBrief, citySnap, cityDelta, cityPicture, type CitySnap } from "./snapshot";
import { applyDiff, salvage, noteStock, stockLine, type Diff } from "./turn";
import { say } from "./voice";
import { rng } from "./rng";
import { applyTreatment, refresh } from "./obedience";
import { shove } from "./psyche";
import { concludeMoment } from "./deeds";
import { captureInstructions } from "./agreements";
import { captureAllowance } from "./allowance";
import { WALK_OPTIONS, WALK_SYSTEM, walkContext, walkOffline } from "./walk";
import { whereLine, type Whereabouts } from "./whereabouts";
import { rulesLine } from "./houserules";
import { pairFitLine } from "./fit";

export interface MomentLine { role: "you" | "scene"; text: string; /** Facts the prose still broke after a rewrite (engine/continuity). */ slips?: string[] }

export interface Moment {
  id: string;
  person?: string;
  /** Other slaves in the scene with her. */
  others?: string[];
  title: string;
  source: string;
  week: number;
  updated: number;
  /** How long the chronicle was when this scene last moved, so what happened elsewhere since, even
   *  in the same week, is told to it when it's picked up again. */
  chron?: number;
  /** The city when this scene last moved, so picking it up again is told exactly what changed. */
  city?: CitySnap;
  /** The city picture has been given once; the scene doesn't need it every turn. */
  pictured?: boolean;
  /** Turns in a row that changed nothing. */
  flat?: number;
  /** Why it ended, when it did. */
  ended?: string;
  /** Why the game thinks it has wound down (it's settled, it stopped going anywhere). Only a hint:
   *  the scene stays open until you end it. */
  winding?: string;
  /** Picked back up after it ended: where the next ending starts reading from, so what the first
   *  ending already counted isn't counted twice. */
  from?: number;
  /** What it left behind each earlier time it ended. */
  past?: string[];
  log: MomentLine[];
  options: string[];
  /** Still open: it can be picked up later. */
  open: boolean;
  /** The deed it left behind, once it ended. */
  concluded?: string;
  /** The first beat is a one-liner that hasn't been written out yet. */
  unexpanded?: boolean;
  /** A walk through the city: which place. See engine/walk. */
  walk?: string;
  /** How many lines at the top came from the game rather than the model: the situation, what you
   *  chose, what came of it. They are already on screen when it's played in place under an event. */
  seeded?: number;
  /** Somebody already walked in on this one (engine/alive): once a scene is enough. */
  walked?: boolean;
  /** The log length when she last misheard you, so it's never twice running. */
  misread_at?: number;
  /** Where it happens: where you found her and what she was doing, or that you sent for her. See engine/whereabouts. */
  where?: Whereabouts & { summoned?: boolean };
}

export const MOMENT_SYSTEM = `You continue a scene in Free Cities, an adult text game about owning an arcology where slavery is legal. The player owns the slave in the scene.

${HOUSE_STYLE}

You're given the slave's card, which is fact, along with the world and the scene so far. Write what happens next, in response to the player's last line. If the last thing in the scene is a short summary of something that just happened, write that moment out in full first, with what she does, what she says and how she takes it. GUIDELINES FOR SCENES AND DIALOGUE, below, says how long to write and how she talks. Whatever the owner does himself happens exactly as the player wrote it. Whatever he tells HER to do happens only as far as HOW SHE TAKES ORDERS on her card allows. A slave who resists stalls, begs, refuses or pulls away, and the reply stops there, so the owner can decide whether to force it, call the guards or punish her. Never make her give in, come round, enjoy it or thank him for something her card says she wouldn't. Write the owner as WHO THE OWNER IS describes them, in their manner and their words, and never as a stock cold slave-owner. Don't write their inner feelings. Everyone treats the owner as their place really allows, which is under THE POWER BETWEEN YOU on each card, so an owned slave doesn't talk back or tell the owner off unless her card says she's openly defiant. Don't end the scene. Stop at a point where the player can answer. Each turn of the game is a week. What the cards list as past (between you, what she remembers, what you have done) happened in earlier weeks and is over. It shapes how people act now, but this scene is its own, set where the scene so far puts it. Don't carry on an earlier scene, and don't move this one back into its place.

${CONVERSATION}

Then, on its own line, write OPTIONS: and under it write exactly four lines, each starting with "- ". They give four clearly different things the player could say or do next, in the player's voice and in under twelve words each. One is kind, one is harsh, one is sexual, and one moves things along or leaves. When she's resisting, the harsh one forces it or punishes her, by holding her down, calling the guards, sending her to the cellblock, or a beating.`;

/** A scene with nobody of yours in it: a citizen, a trader, an official, a stranger. */
export const CITY_SCENE_SYSTEM = `You continue a scene in Free Cities, an adult text game about owning an arcology where slavery is legal. The player owns the arcology. This scene isn't with one of the player's slaves. It's with whoever the situation is about, such as citizens, traders, officials, rivals, visitors or strangers.

${HOUSE_STYLE}

Write what happens next, in response to the player's last line. If the last thing in the scene is a short summary of something that just happened, write that moment out in full first. Give the people in it names if they have none, and voices of their own. They know who the player is and act on it, going by what the ARCOLOGY section says about the city, its laws and what people know the player did. GUIDELINES FOR SCENES AND DIALOGUE, below, says how long to write and how they talk. Follow the player's reply exactly, and if they do something, write it happening and how people react. Write the owner as WHO THE OWNER IS describes them, in their manner and their words, and never as a stock cold slave-owner. Don't write their inner feelings. Everyone treats the owner as their place really allows, which is under THE POWER BETWEEN YOU on each card, so an owned slave doesn't talk back or tell the owner off unless her card says she's openly defiant. Don't end the scene. Stop at a point where the player can answer. Each turn of the game is a week. What the cards list as past (between you, what she remembers, what you have done) happened in earlier weeks and is over. It shapes how people act now, but this scene is its own, set where the scene so far puts it. Don't carry on an earlier scene, and don't move this one back into its place.

${CONVERSATION}

Then, on its own line, write OPTIONS: and under it exactly four lines, each starting with "- ", giving four clearly different things the player could say or do next, in the player's voice and in under twelve words each. One is generous, one is hard, one uses the moment for the player's gain or pleasure, and one ends it or moves on.`;

/* ── what she's been saying too much ─────────────────────────────────────────────────────────
 * A model given a character with habits uses every habit in every reply, and the next reply copies
 * the last. Telling it "not so often" does little; telling it what she has actually said, how many
 * times, in the last few scenes, does a lot. Counted over this scene and her last few, and named in
 * the prompt for this one reply. */

/** Gestures and turns models repeat until they're a tic of their own. */
const STOCK_BEATS = ["hand over her mouth", "hands over her mouth", "presses her lips", "checks your face", "checking your face", "catches herself", "clears her throat", "on her fingers", "her thumb", "ears go pink", "red to the ears", "dimple", "may i say", "may i ask", "if it pleases you", "okay, okay", "honestly", "i mean", "you know"];

const STOP = new Set(("a an the and or but to of in on at for with is it it's i i'm you you're your me my she her he his we us they them this that so as be was are am were " +
  "not no yes do did don't just like have has had want wants going go get got can will would could should tell told say said know think see look " +
  "one all what when how there here now then if up out about too very more some any again still back down over off into from by been thought whole make made thank thanks please").split(" "));

/** Two- and three-word phrases said over and over in the quoted speech: a pet name, a stock line. */
function repeatedPhrases(text: string): string[] {
  const said = [...text.matchAll(/["“]([^"”]{3,400})["”]/g)].map((x) => x[1].toLowerCase());
  const count = new Map<string, number>();
  for (const line of said) {
    const w = line.replace(/[^a-zà-ÿ' -]+/g, " ").split(/\s+/).filter(Boolean);
    const seen = new Set<string>();
    for (const n of [3, 2]) for (let i = 0; i + n <= w.length; i++) {
      const g = w.slice(i, i + n);
      if (!g.some((x) => !STOP.has(x) && x.length >= 4) || g.includes("master")) continue;
      const k = g.join(" ");
      if (!seen.has(k)) { seen.add(k); count.set(k, (count.get(k) ?? 0) + 1); }
    }
  }
  // "the little thing" and "little thing" are one habit: the fuller phrase is the one to name.
  // A word thrown in on its own over and over: "Bon." "Blyat!" "Okay, okay."
  for (const line of said) for (const x of line.matchAll(/(?:^|[.!?,;—-]\s*)([a-zà-ÿ']{2,14})(?=[.!?,;—-]|$)/g)) {
    const w = x[1];
    if (STOP.has(w) || w === "master" || w === "mistress") continue;
    count.set(w, (count.get(w) ?? 0) + 1);
  }
  const hot = [...count].filter(([, n]) => n >= 4).sort((a, b) => b[0].split(" ").length - a[0].split(" ").length || b[1] - a[1]);
  // Overlaps ("little thing" in "the little thing") are settled by the caller, on the full counts.
  return hot.slice(0, 8).map(([k]) => k);
}

/** Props, gestures and descriptions the writer keeps coming back to from one reply to the next,
 *  "the gold band", "dimples and all", "the bell down". Only the narration counts: what people say
 *  is the plot, and naming it would stop the story. A phrase counts once per reply, and two of the
 *  last three replies is enough to name it. Names are left alone. */
export function propsAgain(replies: string[], names: string[] = []): string[] {
  const skip = new Set(names.flatMap((n) => n.toLowerCase().split(/\s+/)));
  const count = new Map<string, number>();
  for (const text of replies.slice(-3)) {
    const told = text.replace(/["“][^"”]*["”]/g, " | ");
    const w = told.toLowerCase().replace(/[^a-zà-ÿ'| ]+/g, " ").split(/\s+/).filter(Boolean);
    const seen = new Set<string>();
    for (const n of [3, 2]) for (let i = 0; i + n <= w.length; i++) {
      const g = w.slice(i, i + n);
      if (g.includes("|")) continue;
      const end = (x: string) => !STOP.has(x) && x.length >= 3 && !skip.has(x.replace(/'s$/, "")) && x !== "master" && x !== "mistress";
      if (!end(g[0]) || !end(g[n - 1])) continue;
      seen.add(g.join(" "));
    }
    for (const k of seen) count.set(k, (count.get(k) ?? 0) + 1);
  }
  const hot = [...count].filter(([, n]) => n >= 2).map(([k]) => k).sort((a, b) => b.split(" ").length - a.split(" ").length);
  // "the small gold band" and "gold band" are one prop: keep the fuller one.
  return hot.filter((k, i) => !hot.some((o, j) => j < i && o.includes(k))).slice(0, 8);
}

/** For any scene, hers or not: what the last few replies have already leaned on. */
export function againLine(s: SaveState, m: Moment, skip: string[] = []): string {
  const names = [s.player.name ?? "", ...(m.person ? [s.people[m.person]?.name ?? ""] : []), ...(m.others ?? []).map((id) => s.people[id]?.name ?? "")];
  const props = propsAgain(m.log.filter((l) => l.role === "scene").map((l) => l.text), names).filter((k) => !skip.some((x) => x.includes(k)));
  return props.length ? `## ALREADY USED IN THIS SCENE\nThese came up in more than one of the last few replies. Even where a card mentions them, leave them out of this one and move the scene on.\n${props.map((k) => `"${k}"`).join(", ")}` : "";
}

export function overused(s: SaveState, p: Person, m: Moment): string {
  // Her own scenes: in one she only walked into, most of the talk is someone else's.
  const recent = momentsOf(s).filter((x) => x.person === p.id && x !== m).slice(-3);
  const text = [...recent.flatMap((x) => x.log.filter((l) => l.role === "scene").slice(-4).map((l) => l.text)), ...(m.log.filter((l) => l.role === "scene").map((l) => l.text))].join("\n").toLowerCase();
  if (text.length < 400) return "";
  // Her own habits, by the words quoted in them ("'Bon.', said under her breath" counts "bon").
  const own = (p.persona.voice?.tics ?? []).flatMap((t) => [...t.matchAll(/['‘"“]([^'’"”]{2,24})['’"”]/g)].map((x) => x[1].toLowerCase().replace(/[.!?,]+$/, "")));
  // Counted on the words alone, so "Bon. Fine" and "bon fine" are the same thing.
  const flat = ` ${text.replace(/[^a-zà-ÿ' ]+/g, " ").replace(/\s+/g, " ")} `;
  const count = (w: string) => {
    const k = w.replace(/[^a-zà-ÿ' ]+/g, " ").replace(/\s+/g, " ").trim();
    return k ? flat.split(` ${k}`).length - 1 : 0;
  };
  const norm = (w: string) => w.replace(/[^a-zà-ÿ' ]+/g, " ").replace(/\s+/g, " ").trim();
  const hits = [...new Map([...own, ...STOCK_BEATS, ...repeatedPhrases(text)].map((w) => [norm(w), w])).values()]
    .map((w) => ({ w, n: count(w) }))
    .filter((x) => x.n >= 3)
    .sort((a, b) => b.n - a.n || b.w.length - a.w.length);
  // One habit, named once: "if it pleases" goes when "if it pleases you" is there.
  // (Unless the shorter is said at least twice as often on its own: then it's a habit of its own.)
  const named = hits.filter((x, i) => !hits.some((o, j) => j !== i && o.w.length > x.w.length && norm(o.w).includes(norm(x.w)) && o.n * 2 > x.n)).slice(0, 7);
  return named.length ? `## SHE'S BEEN DOING THESE TOO MUCH LATELY\nLeave every one of them out of this reply.\n${named.map((x) => `"${x.w}" (${x.n} times in her last few scenes)`).join(", ")}` : "";
}

const DEFAULT_OPTIONS = [
  "Ask her what she's thinking",
  "Hold her",
  "Tell her to get on her knees",
  "Send her back to work",
];

export function momentsOf(s: SaveState): Moment[] {
  return (s.moments ??= []);
}

export function openMoments(s: SaveState, personId?: string): Moment[] {
  return momentsOf(s).filter((m) => m.open && (!personId || m.person === personId));
}

/** Start a moment from something that just happened. Returns its id. */
export function openMoment(s: SaveState, o: { person?: string; others?: string[]; title: string; source: string; setup?: string; you?: string; happened: string; where?: Moment["where"]; ready?: boolean }): string {
  const list = momentsOf(s);
  const id = `mo-${s.arcology.week}-${s.turn}-${list.length}`;
  const log: MomentLine[] = [];
  // The situation you were answering, so the scene is played from the event and not just its last line.
  if (o.setup?.trim()) log.push({ role: "scene", text: o.setup.trim() });
  if (o.you) log.push({ role: "you", text: o.you });
  if (o.happened) log.push({ role: "scene", text: o.happened });
  list.push({ id, person: o.person, others: o.others?.filter((x) => x && x !== o.person), title: o.title, source: o.source, week: s.arcology.week, updated: s.arcology.week, chron: (s.chronicle ?? []).length, city: citySnap(s), log, options: DEFAULT_OPTIONS, open: true, unexpanded: !o.ready && modelsAvailable(), seeded: log.length, ...(o.where ? { where: o.where } : {}) });
  // Keep the list from growing without end: drop the oldest finished ones, never one still open.
  if (list.length > 60) {
    const drop = new Set(list.filter((m) => !m.open).slice(0, list.length - 60));
    s.moments = list.filter((m) => !drop.has(m));
  }
  return id;
}

/** Add what already happened to a moment without asking the model for anything. */
export function noteMoment(s: SaveState, id: string, lines: MomentLine[]): void {
  const m = momentsOf(s).find((x) => x.id === id);
  if (!m) return;
  m.log.push(...lines.filter((l) => l.text.trim()));
  trimLog(m);
  m.updated = s.arcology.week;
  m.unexpanded = false;
}

/** A long scene keeps its last forty lines; where a picked-up scene reads from moves with them. */
function trimLog(m: Moment): void {
  const cut = m.log.length - 40;
  if (cut <= 0) return;
  m.log = m.log.slice(cut);
  if (m.from !== undefined) m.from = Math.max(0, m.from - cut);
}

/** Weekly. A scene still open stays open: the week ending is not you deciding you're done with her.
 *  Only ended ones are let go, three months after they last moved. */
export function ageMoments(s: SaveState): void {
  s.moments = momentsOf(s).filter((m) => m.open || s.arcology.week - m.updated < 12);
}

/** End every open scene where it stands, offline. Returns how many ended. */
export function closeAllMoments(s: SaveState): number {
  let n = 0;
  for (const m of momentsOf(s)) if (m.open) { m.open = false; m.ended ??= "you cleared it"; n++; void concludeMoment(s, m, { offline: true }); }
  return n;
}

/** Scenes that ended, newest first, that can still be picked back up. */
export function endedMoments(s: SaveState, personId?: string): Moment[] {
  return momentsOf(s).filter((m) => !m.open && m.log.length > 1 && (!personId || m.person === personId)).sort((a, b) => b.updated - a.updated);
}

/** Pick an ended scene back up where it stopped. What it already left behind stands; the next time
 *  it ends, only what happened after this is read back. */
export function resumeMoment(s: SaveState, id: string): boolean {
  const m = momentsOf(s).find((x) => x.id === id);
  if (!m) return false;
  if (m.open) return true;
  if (m.concluded) { (m.past ??= []).push(m.concluded); m.concluded = undefined; }
  m.from = m.log.length;
  m.open = true;
  m.ended = undefined;
  m.winding = undefined;
  m.flat = 0;
  m.updated = s.arcology.week;
  return true;
}

export function closeMoment(s: SaveState, id: string): void {
  const m = momentsOf(s).find((x) => x.id === id);
  if (m) m.open = false;
}

/** The scene so far, trimmed for the model: how it started and the last few exchanges. A long
 *  scene doesn't resend every line every turn; what happened in the middle is already in her
 *  memory and the deeds. */
function transcript(m: Moment, keep = 6): string {
  const line = (l: MomentLine) => (l.role === "you" ? `PLAYER: ${l.text}` : l.text);
  // The head is everything the game handed over: the situation, your choice, what came of it.
  const top = Math.max(2, m.seeded ?? 2);
  if (m.log.length <= keep + top) return m.log.map(line).join("\n\n");
  const head = m.log.slice(0, top);
  const tail = m.log.slice(-keep);
  const gap = m.log.length - head.length - tail.length;
  const said = m.log.slice(top, -keep).filter((l) => l.role === "you").map((l) => l.text.slice(0, 60));
  return [...head.map(line), `(${gap} lines later. In between, the player had said: ${said.join(" / ")})`, ...tail.map(line)].join("\n\n");
}

export function splitOptions(text: string): { prose: string; options: string[] } {
  const at = text.search(/\n\s*OPTIONS\s*:?\s*\n/i);
  if (at < 0) return { prose: text.trim(), options: [] };
  const prose = text.slice(0, at).trim();
  const options = text.slice(at).split("\n").map((l) => l.trim()).filter((l) => /^[-*•\d]/.test(l))
    .map((l) => l.replace(/^[-*•]\s*|^\d+[.)]\s*/, "").replace(/^"|"$/g, "").trim()).filter(Boolean).slice(0, 4);
  return { prose, options };
}

/** One step: your reply (or none, to write out the opening), and what comes back. */
export async function playMoment(
  s: SaveState, id: string, reply: string | null,
  opts?: { onDelta?: (c: string) => void; onReset?: () => void; signal?: AbortSignal },
): Promise<{ ok: boolean; prose: string; error?: string }> {
  const m = momentsOf(s).find((x) => x.id === id);
  if (!m) return { ok: false, prose: "", error: "no such moment" };
  // Answering an ended scene is picking it back up.
  if (!m.open) resumeMoment(s, id);
  const p = m.person ? s.people[m.person] : undefined;
  if (reply) m.log.push({ role: "you", text: reply });
  // What you tell her about how to treat you outlasts the scene.
  if (reply) captureInstructions(s, reply, [p, ...(m.others ?? []).map((x) => s.people[x])].filter((x): x is Person => !!x));
  if (reply && p) captureAllowance(s, reply, [p, ...(m.others ?? []).map((x) => s.people[x])].filter((x): x is Person => !!x));
  if (reply) practiseFrom(s, reply);
  // A scene left open and picked up weeks later starts from the world as it is now.
  const lastMoved = m.updated ?? m.week;
  m.updated = s.arcology.week;
  m.open = true;

  const walking = m.source === "walk";
  const fallback = () => (walking ? walkOffline(s, m.walk, reply ?? "") : offlineAnswer(s, p, reply ?? ""));
  const fallbackOptions = () => (walking ? WALK_OPTIONS : offlineOptions(p, reply ?? ""));
  if (!modelsAvailable()) {
    const prose = fallback();
    m.log.push({ role: "scene", text: prose });
    m.options = fallbackOptions();
    m.unexpanded = false;
    m.winding = reply && LEAVING.test(reply) ? "you sounded like you were leaving" : undefined;
    return { ok: true, prose };
  }

  // A private scene stays private: nobody walks in and she doesn't mishear on a dice roll. Both used
  // to be thrown in from here to make the house feel alive, and read as the writer losing the plot.
  const beats: string[] = [];
  const lost = didntFollow(reply);
  if (lost) beats.push(lost);
  const habits = p ? overused(s, p, m) : "";
  const worn = [habits, againLine(s, m, [...habits.matchAll(/"([^"]+)"/g)].map((x) => x[1].toLowerCase()))].filter(Boolean).join("\n\n");
  const card = p ? personCard(s, p, reply ?? m.title) : "";
  const city = !p && !walking;
  const others = (m.others ?? []).map((id) => s.people[id]).filter(Boolean) as Person[];
  const bond = (a: Person, b: Person) => { const e = s.edges.find((x) => x.from === a.id && x.to === b.id); return e ? `${a.name} toward ${b.name}: ${e.roles.length ? `${e.roles.join(", ")}; ` : ""}warmth ${Math.round(e.warmth)}` : ""; };
  const user = [
    // What stays the same from turn to turn goes first, so a provider that caches the front of a
    // prompt keeps it; the people, the scene so far and your reply come after.
    s.world ? `## THE WORLD\n${worldBrief(s)}` : "",
    walking ? "" : lawsLine(s),
    walking || city ? "" : rulesLine(s),
    walking || city ? "" : householdLine(s),
    walking || city ? "" : sentinelsLine(s),
    settledBrief(s, 8),
    weightBrief(s),
    ownedBrief(s),
    walking ? walkContext(s, m.walk) : "",
    city ? cityContext(s) : "",
    card ? `## ${walking ? "WITH THE PLAYER" : "THE SLAVE"}\n${card}` : "",
    m.where ? whereLine(m.where, m.where.summoned) : "",
    ...others.map((o) => `## ALSO IN THE SCENE\n${personCard(s, o, m.title)}`),
    p && others.length ? `## BETWEEN THEM\n${others.flatMap((o) => [bond(p, o), bond(o, p), pairFitLine(s, p, o), pairFitLine(s, o, p)]).filter(Boolean).join("\n")}\nBoth of them talk and act in the scene, each in her own voice.` : "",
    castBrief(s, `${m.title}\n${transcript(m)}\n${reply ?? ""}`),
    `## THE SCENE SO FAR (${m.title})\n${coarsen(transcript(m))}`,
    lastMoved < s.arcology.week ? aroundBrief(s, { since: lastMoved, scene: m.title }) : elsewhere(s, m),
    changedLine(s, m),
    m.pictured ? "" : cityPicture(s),
    reply ? `## THE PLAYER'S REPLY\n${reply}` : `## WRITE THIS MOMENT OUT IN FULL, then offer the options.`,
    beats.length ? `## THIS TIME\n${beats.join("\n")}` : "",
    worn,
    stockLine(s),
    REGISTER_TAIL,
  ].filter(Boolean).join("\n\n");

  let shown = "";
  const ask = (extra = "") => call({ narration: true, tag: "moment",
    system: walking ? WALK_SYSTEM : city ? CITY_SCENE_SYSTEM : MOMENT_SYSTEM, user: extra ? `${user}\n\n${extra}` : user,
    model: s.models.narrator_model, fallback: s.models.fallback_model,
    maxTokens: 1600, temperature: 0.8, presence: 0.3, signal: opts?.signal,
    onDelta: opts?.onDelta ? (c) => {
      shown += c;
      // Stream the prose only; the options list is not for reading as it arrives.
      if (!/\n\s*(OPTIONS|\**CAST\**\s*:)/i.test(shown)) opts.onDelta!(c);
    } : undefined,
    onReset: () => { shown = ""; opts?.onReset?.(); },
  });
  let res = await ask();
  if (!res.ok) {
    const prose = fallback();
    m.log.push({ role: "scene", text: prose });
    m.options = fallbackOptions();
    return { ok: false, prose, error: res.error };
  }
  const parse = (text: string) => {
    const { prose: uncast, cast } = parseCast(salvage(text));
    const { prose: raw, options } = splitOptions(uncast);
    return { prose: coarsen(finishLast(raw || uncast.trim())), cast, options };
  };
  let { prose, cast, options } = parse(res.text);
  // Checked in code against what the game knows (engine/continuity). One rewrite with the fact
  // named; if that still breaks it, the scene keeps the better draft and says what slipped.
  const inScene = [p, ...others].filter((x): x is Person => !!x);
  let slips = continuitySlips(s, prose, inScene);
  if (slips.length) {
    shown = "";
    opts?.onReset?.();
    const again = await ask(`## CONTINUITY\nYour last draft broke facts the game keeps. Write your reply again, keeping to these:\n${slips.map((x) => `· ${x}`).join("\n")}`);
    if (again.ok) {
      const next = parse(again.text);
      const left = continuitySlips(s, next.prose, inScene);
      if (left.length <= slips.length) { res = again; ({ prose, cast, options } = next); slips = left; }
    }
  }
  // Anyone new the model put in the scene goes on file with their face; anyone on file who turned up is seen again.
  const ours = new Set(Object.values(s.people).filter((x) => x.status === "owned" || x.status === "indentured").map((x) => keyOf(x.name)));
  for (const c of cast) if (!ours.has(keyOf(c.name))) meet(s, c);
  for (const f of facesIn(s, prose, 6)) meet(s, f);
  noteStock(s, prose);
  m.log.push({ role: "scene", text: prose, ...(slips.length ? { slips } : {}) });
  m.options = options.length >= 2 ? options : fallbackOptions();
  m.unexpanded = false;

  // The bookkeeper turns the prose into what changed, with the room set to just her.
  let diff: Diff | null = null;
  if (p) {
    const book = await call({
      system: BOOKKEEPER_SYSTEM,
      user: `${bookkeeperContext(s)}\n\n## THE TURN\nWHAT THE OWNER DID OR SAID. Here "I" is the owner: ${reply ?? m.title}\n\nTHE PROSE. Here "you" is the owner:\n${prose}`,
      model: s.models.bookkeeper_model, fallback: s.models.fallback_model, json: true, signal: opts?.signal,
    });
    diff = book.ok ? parseJson<Diff>(book.text) : null;
    if (diff) {
      const before = s.scene.present;
      s.scene.present = [p.id, ...others.map((o) => o.id)];
      applyDiff(s, { ...diff, present_add: [], present_remove: [], location: undefined, ...(walking ? { canon_add: [] } : {}) }, prose, reply ?? "");
      s.scene.present = before;
      refresh(p, s.memory[p.id]);
    }
  }
  m.chron = (s.chronicle ?? []).length;
  m.city = citySnap(s);
  m.pictured = true;

  // Has it wound down? The game used to end a scene here on its own (settled, two flat turns, "that's
  // all" in your reply) and the player lost scenes they weren't done with. Now it only says so; the
  // scene stays open until you end it.
  const turns = m.log.slice(m.from ?? 0).filter((l) => l.role === "you").length;
  m.flat = (p ? impactOf(diff) < 2 : true) ? (m.flat ?? 0) + 1 : 0;
  m.winding = reply && LEAVING.test(reply) ? "you sounded like you were leaving"
    : diff?.settled && turns >= 2 ? "what it was about is settled"
    : p && m.flat >= 2 && turns >= 3 ? "the last few turns didn't change anything"
    : !p && turns >= 8 ? "it's run a long while"
    : undefined;
  return { ok: true, prose };
}

/** Walking away, in the player's words. */
const LEAVING = /\b(i (leave|go|walk (away|out|off)|head (out|off)|turn (and|to) (leave|go))|i'?m (leaving|going|done here)|goodbye|good night|that'?s all|we'?re done|dismissed|get out|leave it there|enough for now)\b/i;

/** How much one exchange changed, by what the bookkeeper wrote down. Under 2 is talk. */
export function impactOf(d: Diff | null): number {
  if (!d) return 0;
  let n = 0;
  for (const t of d.treatment ?? []) n += Math.min(6, Math.abs(Number(t.size) || 0)) / 2;
  for (const x of d.memories ?? []) n += (Number(x.importance) || 0) >= 6 ? 1.5 : 0.3;
  for (const e of d.edges ?? []) n += (Math.abs(Number(e.warmth_delta) || 0) + Math.abs(Number(e.trust_delta) || 0)) >= 8 ? 1 : 0.2;
  n += (d.agreements?.length ?? 0) * 2 + (d.agreements_drop?.length ?? 0) * 2;
  n += (d.facts_learned?.length ?? 0) * 0.7 + (d.strain?.length ?? 0) * 1.5 + (d.spent?.length ?? 0) * 1 + (d.manner?.length ?? 0) * 1;
  n += (d.body?.length ?? 0) * 0.7 + (d.marks?.length ?? 0) * 0.5 + (d.rumors?.length ?? 0) * 0.5 + (d.canon_add?.length ?? 0) * 2;
  return n;
}

/** What changed in the city since this scene last moved, in the game's own terms. */
function changedLine(s: SaveState, m: Moment): string {
  if (!m.city) return "";
  const d = cityDelta(m.city, citySnap(s));
  return d.length ? `## HOW THE CITY HAS CHANGED SINCE THIS SCENE LAST MOVED\nThese are facts. Where they touch the people or the place in this scene, it shows.\n${d.map((x) => `· ${x}`).join("\n")}` : "";
}

/** The same week, but things happened elsewhere after this scene last moved. */
function elsewhere(s: SaveState, m: Moment): string {
  if (m.chron === undefined) return "";
  const fresh = (s.chronicle ?? []).slice(m.chron).slice(-6);
  if (!fresh.length) return "";
  return `## WHAT'S HAPPENED ELSEWHERE SINCE THIS SCENE LAST MOVED\nThe player left this scene and did other things before coming back. The people here may have heard, and if it changes things, they act on it. Pick up from where things stand now.\n${fresh.map((e) => `· ${e.text.slice(0, 220)}`).join("\n")}`;
}

/** What a scene with citizens needs to know: the city, its laws, what you've done, what's said. */
function cityContext(s: SaveState): string {
  const deeds = (s.deeds ?? []).filter((d) => d.public).slice(-4).map((d) => `· ${d.summary}`).join("\n");
  const rumors = [...s.rumors].filter((r) => !r.where).sort((a, b) => b.salience - a.salience).slice(0, 3).map((r) => `· "${r.content}"`).join("\n");
  return [
    `## THE ARCOLOGY\n${s.arcology.name}, week ${s.arcology.week}. The player's reputation is ${Math.round(s.arcology.rep)}, and the city's opinion of the player is ${s.arcology.public_standing >= 3 ? "good" : s.arcology.public_standing <= -3 ? "poor" : "mixed"}.${s.player.owned_by ? ` The player wears the collar of ${s.people[s.player.owned_by]?.name ?? "a slave"}, and people know it.` : ""}`,
    cultureBrief(s) ? `HOW CITIZENS BEHAVE:\n${cultureBrief(s)}` : "",
    lawsLine(s),
    sentinelsLine(s),
    deeds ? `WHAT PEOPLE KNOW THE PLAYER DID:\n${deeds}` : "",
    rumors ? `WHAT PEOPLE ARE SAYING:\n${rumors}` : "",
  ].filter(Boolean).join("\n");
}

/* ── with no model: her own voice, and the next things to say ─────────────────────────────── */

function offlineAnswer(s: SaveState, p: Person | undefined, reply: string): string {
  if (!p) return reply ? "They hear you out. Whatever they were going to say, they think better of it, and wait to see what you do next." : "";
  const r = rng(`moment:${p.id}:${s.turn}:${reply.length}:${s.arcology.week}`);
  const t = reply.toLowerCase();
  const week = s.arcology.week;
  let what: Parameters<typeof say>[2] = "talk_open";
  let body = "";
  if (!reply) { body = `${p.name} waits to see what you'll do.`; what = "open"; }
  else if (/enslave myself|be your slave|take my collar|collar me|belong to you|own me|i'm yours|i kneel|kneel (?:before|in front of|at)/.test(t)) {
    applyTreatment(p, { kind: "recognition", size: 4, why: reply.slice(0, 60) }, week); shove(p.psyche, 0.6);
    return `${p.name} stares at you on your knees in front of her. For a long moment she doesn't move at all. Then she reaches out, slowly, and puts her hand on your head, as if she's checking that it's real. ${r.pick([`"Say it again," she says.`, `"You mean that," she says. It isn't a question.`, `"Then look at me," she says, "and don't get up until I tell you."`])}`;
  }
  else if (/hold|hug|kiss|sorry|thank|gentle|comfort|well done|good girl|stay/.test(t)) {
    applyTreatment(p, { kind: "kindness", size: 2, why: reply.slice(0, 60) }, week); shove(p.psyche, 0.3);
    body = r.pick([`${p.name} relaxes a little.`, `${p.name} looks surprised, then pleased.`, `${p.name} leans into you.`]); what = "tender";
  } else if (/slap|hit|punish|whip|mock|laugh|shut up|worthless|slut|beg/.test(t)) {
    applyTreatment(p, { kind: "cruelty", size: 2, why: reply.slice(0, 60) }, week); shove(p.psyche, -0.4);
    body = r.pick([`${p.name} flinches.`, `${p.name}'s face goes red.`, `${p.name} looks at the floor.`]); what = "mock";
  } else if (/fuck|suck|strip|knees|bed|naked|spread|bend/.test(t)) {
    body = r.pick([`${p.name} does as she's told.`, `${p.name} starts undressing.`, `${p.name} gets down on her knees.`]); what = "open";
  } else if (/leave|go|back to work|dismiss|later/.test(t)) {
    body = `${p.name} goes.`; what = "dismiss";
  } else if (/\?$/.test(reply.trim())) {
    body = `${p.name} thinks about it.`; what = "talk_open";
  }
  refresh(p, s.memory[p.id]);
  return `${body} "${say(s, p, what, r).replace(/^"|"$/g, "")}"`;
}

function offlineOptions(p: Person | undefined, reply: string): string[] {
  const n = p?.name ?? "her";
  if (/leave|go|back to work|dismiss/.test(reply.toLowerCase())) return [`Call ${n} back`, "Let her go"];
  return [`Ask ${n} how she feels about it`, "Hold her", "Tell her to strip", "Send her back to work"];
}
