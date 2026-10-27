/**
 * MOMENTS — a reaction that doesn't end on one line.
 *
 * Anything a slave does in answer to you — after an event, a household situation, a request, a
 * follow-up in bed, a question — can open a moment. With a model configured, the narrator writes
 * the moment out in full and offers four ways to answer; your reply (picked or typed) continues it,
 * and the bookkeeper records what changed. A moment you walk away from stays open on her page and
 * on the Penthouse, and picks up where it left off. With no model, the written game answers in her
 * voice and still offers you the next thing to say.
 */
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
import { applyDiff, salvage, noteStock, stockLine, type Diff } from "./turn";
import { say } from "./voice";
import { rng } from "./rng";
import { applyTreatment, refresh } from "./obedience";
import { shove } from "./psyche";
import { concludeMoment } from "./deeds";
import { captureInstructions } from "./agreements";
import { WALK_OPTIONS, WALK_SYSTEM, walkContext, walkOffline } from "./walk";
import { whereLine, type Whereabouts } from "./whereabouts";
import { rulesLine } from "./houserules";
import { pairFitLine } from "./fit";

export interface MomentLine { role: "you" | "scene"; text: string }

export interface Moment {
  id: string;
  person?: string;
  /** Other slaves in the scene with her. */
  others?: string[];
  title: string;
  source: string;
  week: number;
  updated: number;
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

You're given the slave's card, which is fact, along with the world and the scene so far. Write what happens next, in response to the player's last line. If the last thing in the scene is a short summary of something that just happened, write that moment out in full first, with what she does, what she says and how she takes it. HOW A CONVERSATION GOES, below, says how long to write and how she talks. Whatever the owner does himself happens exactly as the player wrote it. Whatever he tells HER to do happens only as far as HOW SHE TAKES ORDERS on her card allows. A slave who resists stalls, begs, refuses or pulls away, and the reply stops there, so the owner can decide whether to force it, call the guards or punish her. Never make her give in, come round, enjoy it or thank him for something her card says she wouldn't. Write the owner as WHO THE OWNER IS describes them, in their manner and their words, and never as a stock cold slave-owner. Don't write their inner feelings. Everyone treats the owner as their place really allows, which is under THE POWER BETWEEN YOU on each card, so an owned slave doesn't talk back or tell the owner off unless her card says she's openly defiant. Don't end the scene. Stop at a point where the player can answer. Each turn of the game is a week. What the cards list as past (between you, what she remembers, what you have done) happened in earlier weeks and is over. It shapes how people act now, but this scene is its own, set where the scene so far puts it. Don't carry on an earlier scene, and don't move this one back into its place.

${CONVERSATION}

Then, on its own line, write OPTIONS: and under it write exactly four lines, each starting with "- ". They give four clearly different things the player could say or do next, in the player's voice and in under twelve words each. One is kind, one is harsh, one is sexual, and one moves things along or leaves. When she's resisting, the harsh one forces it or punishes her, by holding her down, calling the guards, sending her to the cellblock, or a beating.`;

/** A scene with nobody of yours in it: a citizen, a trader, an official, a stranger. */
export const CITY_SCENE_SYSTEM = `You continue a scene in Free Cities, an adult text game about owning an arcology where slavery is legal. The player owns the arcology. This scene isn't with one of the player's slaves. It's with whoever the situation is about, such as citizens, traders, officials, rivals, visitors or strangers.

${HOUSE_STYLE}

Write what happens next, in response to the player's last line. If the last thing in the scene is a short summary of something that just happened, write that moment out in full first. Give the people in it names if they have none, and voices of their own. They know who the player is and act on it, going by what the ARCOLOGY section says about the city, its laws and what people know the player did. HOW A CONVERSATION GOES, below, says how long to write and how they talk. Follow the player's reply exactly, and if they do something, write it happening and how people react. Write the owner as WHO THE OWNER IS describes them, in their manner and their words, and never as a stock cold slave-owner. Don't write their inner feelings. Everyone treats the owner as their place really allows, which is under THE POWER BETWEEN YOU on each card, so an owned slave doesn't talk back or tell the owner off unless her card says she's openly defiant. Don't end the scene. Stop at a point where the player can answer. Each turn of the game is a week. What the cards list as past (between you, what she remembers, what you have done) happened in earlier weeks and is over. It shapes how people act now, but this scene is its own, set where the scene so far puts it. Don't carry on an earlier scene, and don't move this one back into its place.

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
export function openMoment(s: SaveState, o: { person?: string; others?: string[]; title: string; source: string; setup?: string; you?: string; happened: string; where?: Moment["where"] }): string {
  const list = momentsOf(s);
  const id = `mo-${s.arcology.week}-${s.turn}-${list.length}`;
  const log: MomentLine[] = [];
  // The situation you were answering, so the scene is played from the event and not just its last line.
  if (o.setup?.trim()) log.push({ role: "scene", text: o.setup.trim() });
  if (o.you) log.push({ role: "you", text: o.you });
  if (o.happened) log.push({ role: "scene", text: o.happened });
  list.push({ id, person: o.person, others: o.others?.filter((x) => x && x !== o.person), title: o.title, source: o.source, week: s.arcology.week, updated: s.arcology.week, log, options: DEFAULT_OPTIONS, open: true, unexpanded: modelsAvailable(), seeded: log.length, ...(o.where ? { where: o.where } : {}) });
  // Keep the list from growing without end: close the oldest finished ones.
  if (list.length > 60) s.moments = list.slice(-60);
  return id;
}

/** Add what already happened to a moment without asking the model for anything. */
export function noteMoment(s: SaveState, id: string, lines: MomentLine[]): void {
  const m = momentsOf(s).find((x) => x.id === id);
  if (!m) return;
  m.log.push(...lines.filter((l) => l.text.trim()));
  if (m.log.length > 40) m.log = m.log.slice(-40);
  m.updated = s.arcology.week;
  m.unexpanded = false;
}

/** Moments you walked away from a month ago are over. */
export function ageMoments(s: SaveState): void {
  // The week ending ends every scene still open, where it stands. What you said in it still counts,
  // read from your own words without another model call.
  closeAllMoments(s);
  s.moments = momentsOf(s).filter((m) => m.open || s.arcology.week - m.updated < 12);
}

/** End every open scene where it stands, offline. Returns how many ended. */
export function closeAllMoments(s: SaveState): number {
  let n = 0;
  for (const m of momentsOf(s)) if (m.open) { m.open = false; n++; void concludeMoment(s, m, { offline: true }); }
  return n;
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
  const p = m.person ? s.people[m.person] : undefined;
  if (reply) m.log.push({ role: "you", text: reply });
  // What you tell her about how to treat you outlasts the scene.
  if (reply) captureInstructions(s, reply, [p, ...(m.others ?? []).map((x) => s.people[x])].filter((x): x is Person => !!x));
  if (reply) practiseFrom(s, reply);
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
    return { ok: true, prose };
  }

  // A private scene stays private: nobody walks in and she doesn't mishear on a dice roll. Both used
  // to be thrown in from here to make the house feel alive, and read as the writer losing the plot.
  const beats: string[] = [];
  const lost = didntFollow(reply);
  if (lost) beats.push(lost);
  const worn = p ? overused(s, p, m) : "";
  const card = p ? personCard(s, p, reply ?? m.title) : "";
  const city = !p && !walking;
  const others = (m.others ?? []).map((id) => s.people[id]).filter(Boolean) as Person[];
  const bond = (a: Person, b: Person) => { const e = s.edges.find((x) => x.from === a.id && x.to === b.id); return e ? `${a.name} toward ${b.name}: ${e.roles.length ? `${e.roles.join(", ")}; ` : ""}warmth ${Math.round(e.warmth)}` : ""; };
  const user = [
    walking ? walkContext(s, m.walk) : "",
    city ? cityContext(s) : "",
    card ? `## ${walking ? "WITH THE PLAYER" : "THE SLAVE"}\n${card}` : "",
    m.where ? whereLine(m.where, m.where.summoned) : "",
    ...others.map((o) => `## ALSO IN THE SCENE\n${personCard(s, o, m.title)}`),
    p && others.length ? `## BETWEEN THEM\n${others.flatMap((o) => [bond(p, o), bond(o, p), pairFitLine(s, p, o), pairFitLine(s, o, p)]).filter(Boolean).join("\n")}\nBoth of them talk and act in the scene, each in her own voice.` : "",
    s.world ? `## THE WORLD\n${worldBrief(s)}` : "",
    walking ? "" : lawsLine(s),
    walking || city ? "" : rulesLine(s),
    walking || city ? "" : householdLine(s),
    walking || city ? "" : sentinelsLine(s),
    castBrief(s, `${m.title}\n${transcript(m)}\n${reply ?? ""}`),
    settledBrief(s, 8),
    weightBrief(s),
    ownedBrief(s),
    `## THE SCENE SO FAR (${m.title})\n${coarsen(transcript(m))}`,
    reply ? `## THE PLAYER'S REPLY\n${reply}` : `## WRITE THIS MOMENT OUT IN FULL, then offer the options.`,
    beats.length ? `## THIS TIME\n${beats.join("\n")}` : "",
    worn,
    stockLine(s),
    REGISTER_TAIL,
  ].filter(Boolean).join("\n\n");

  let shown = "";
  const res = await call({
    system: walking ? WALK_SYSTEM : city ? CITY_SCENE_SYSTEM : MOMENT_SYSTEM, user,
    model: s.models.narrator_model, fallback: s.models.fallback_model,
    maxTokens: 1600, temperature: 0.8, presence: 0.3, signal: opts?.signal,
    onDelta: opts?.onDelta ? (c) => {
      shown += c;
      // Stream the prose only; the options list is not for reading as it arrives.
      if (!/\n\s*(OPTIONS|\**CAST\**\s*:)/i.test(shown)) opts.onDelta!(c);
    } : undefined,
    onReset: () => { shown = ""; opts?.onReset?.(); },
  });
  if (!res.ok) {
    const prose = fallback();
    m.log.push({ role: "scene", text: prose });
    m.options = fallbackOptions();
    return { ok: false, prose, error: res.error };
  }
  const { prose: uncast, cast } = parseCast(salvage(res.text));
  const { prose: raw, options } = splitOptions(uncast);
  const prose = coarsen(finishLast(raw || uncast.trim()));
  // Anyone new the model put in the scene goes on file with their face; anyone on file who turned up is seen again.
  const ours = new Set(Object.values(s.people).filter((x) => x.status === "owned" || x.status === "indentured").map((x) => keyOf(x.name)));
  for (const c of cast) if (!ours.has(keyOf(c.name))) meet(s, c);
  for (const f of facesIn(s, prose, 6)) meet(s, f);
  noteStock(s, prose);
  m.log.push({ role: "scene", text: prose });
  m.options = options.length >= 2 ? options : fallbackOptions();
  m.unexpanded = false;

  // The bookkeeper turns the prose into what changed, with the room set to just her.
  if (p) {
    const book = await call({
      system: BOOKKEEPER_SYSTEM,
      user: `${bookkeeperContext(s)}\n\n## THE TURN\nWHAT THE OWNER DID OR SAID. Here "I" is the owner: ${reply ?? m.title}\n\nTHE PROSE. Here "you" is the owner:\n${prose}`,
      model: s.models.bookkeeper_model, fallback: s.models.fallback_model, json: true, signal: opts?.signal,
    });
    const diff = book.ok ? parseJson<Diff>(book.text) : null;
    if (diff) {
      const before = s.scene.present;
      s.scene.present = [p.id, ...others.map((o) => o.id)];
      applyDiff(s, { ...diff, present_add: [], present_remove: [], location: undefined, ...(walking ? { canon_add: [] } : {}) }, prose, reply ?? "");
      s.scene.present = before;
      refresh(p, s.memory[p.id]);
    }
  }
  return { ok: true, prose };
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
