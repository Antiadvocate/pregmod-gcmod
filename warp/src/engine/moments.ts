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
import { cultureBrief } from "./culture";
import { lawsLine } from "./lawlife";
import type { Person, SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { HOUSE_STYLE, personCard, BOOKKEEPER_SYSTEM, bookkeeperContext } from "./prompts";
import { worldBrief } from "./world";
import { applyDiff, salvage, type Diff } from "./turn";
import { say } from "./voice";
import { rng } from "./rng";
import { applyTreatment, refresh } from "./obedience";
import { shove } from "./psyche";
import { concludeMoment } from "./deeds";
import { captureInstructions } from "./agreements";
import { WALK_OPTIONS, WALK_SYSTEM, walkContext, walkOffline } from "./walk";

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
}

export const MOMENT_SYSTEM = `You continue a scene in Free Cities, an adult text game about owning an arcology where slavery is legal. The player owns the slave in the scene.

${HOUSE_STYLE}

You are given the slave's card (fact), the world, and the scene so far. Write what happens next, in response to the player's last line. If the last thing in the scene is a short summary of something that just happened, write that moment out in full first: what she does, what she says, how she takes it. Two to four paragraphs, with her talking in her own voice. Follow the player's reply exactly; if they do something, write it happening. Do not write the player's feelings. Do not end the scene; stop at a point where the player can answer.

Then, on its own line, write OPTIONS: and under it exactly four lines, each starting with "- ", giving four clearly different things the player could say or do next, in the player's voice and under twelve words each: one kind, one harsh, one sexual, and one that moves things along or leaves.`;

/** A scene with nobody of yours in it: a citizen, a trader, an official, a stranger. */
export const CITY_SCENE_SYSTEM = `You continue a scene in Free Cities, an adult text game about owning an arcology where slavery is legal. The player owns the arcology. This scene is not with one of the player's slaves: it is with whoever the situation is about (citizens, traders, officials, rivals, visitors, strangers).

${HOUSE_STYLE}

Write what happens next, in response to the player's last line. If the last thing in the scene is a short summary of something that just happened, write that moment out in full first. Give the people in it names if they have none, and their own voices; they know who the player is and act on it, by what the ARCOLOGY section says about the city, its laws and what people know the player did. Two to four paragraphs. Follow the player's reply exactly; if they do something, write it happening and how people react. Do not write the player's feelings. Do not end the scene; stop at a point where the player can answer.

Then, on its own line, write OPTIONS: and under it exactly four lines, each starting with "- ", giving four clearly different things the player could say or do next, in the player's voice and under twelve words each: one generous, one hard, one that uses the moment for the player's gain or pleasure, and one that ends it or moves on.`;

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
export function openMoment(s: SaveState, o: { person?: string; others?: string[]; title: string; source: string; you?: string; happened: string }): string {
  const list = momentsOf(s);
  const id = `mo-${s.arcology.week}-${s.turn}-${list.length}`;
  const log: MomentLine[] = [];
  if (o.you) log.push({ role: "you", text: o.you });
  if (o.happened) log.push({ role: "scene", text: o.happened });
  list.push({ id, person: o.person, others: o.others?.filter((x) => x && x !== o.person), title: o.title, source: o.source, week: s.arcology.week, updated: s.arcology.week, log, options: DEFAULT_OPTIONS, open: true, unexpanded: modelsAvailable() });
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
  if (m.log.length <= keep + 2) return m.log.map(line).join("\n\n");
  const head = m.log.slice(0, 2);
  const tail = m.log.slice(-keep);
  const gap = m.log.length - head.length - tail.length;
  const said = m.log.slice(2, -keep).filter((l) => l.role === "you").map((l) => l.text.slice(0, 60));
  return [...head.map(line), `(${gap} lines later; the player had said: ${said.join(" / ")})`, ...tail.map(line)].join("\n\n");
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

  const card = p ? personCard(s, p, reply ?? m.title) : "";
  const city = !p && !walking;
  const others = (m.others ?? []).map((id) => s.people[id]).filter(Boolean) as Person[];
  const bond = (a: Person, b: Person) => { const e = s.edges.find((x) => x.from === a.id && x.to === b.id); return e ? `${a.name} toward ${b.name}: ${e.roles.length ? `${e.roles.join(", ")}; ` : ""}warmth ${Math.round(e.warmth)}` : ""; };
  const user = [
    walking ? walkContext(s, m.walk) : "",
    city ? cityContext(s) : "",
    card ? `## ${walking ? "WITH THE PLAYER" : "THE SLAVE"}\n${card}` : "",
    ...others.map((o) => `## ALSO IN THE SCENE\n${personCard(s, o, m.title)}`),
    p && others.length ? `## BETWEEN THEM\n${others.flatMap((o) => [bond(p, o), bond(o, p)]).filter(Boolean).join("\n")}\nBoth of them talk and act in the scene, each in her own voice.` : "",
    s.world ? `## THE WORLD\n${worldBrief(s)}` : "",
    walking ? "" : lawsLine(s),
    `## THE SCENE SO FAR (${m.title})\n${transcript(m)}`,
    reply ? `## THE PLAYER'S REPLY\n${reply}` : `## WRITE THIS MOMENT OUT IN FULL, then offer the options.`,
  ].filter(Boolean).join("\n\n");

  let shown = "";
  const res = await call({
    system: walking ? WALK_SYSTEM : city ? CITY_SCENE_SYSTEM : MOMENT_SYSTEM, user,
    model: s.models.narrator_model, fallback: s.models.fallback_model,
    maxTokens: 1100, temperature: 0.95, signal: opts?.signal,
    onDelta: opts?.onDelta ? (c) => {
      shown += c;
      // Stream the prose only; the options list is not for reading as it arrives.
      if (!/\n\s*OPTIONS/i.test(shown)) opts.onDelta!(c);
    } : undefined,
    onReset: () => { shown = ""; opts?.onReset?.(); },
  });
  if (!res.ok) {
    const prose = fallback();
    m.log.push({ role: "scene", text: prose });
    m.options = fallbackOptions();
    return { ok: false, prose, error: res.error };
  }
  const { prose: raw, options } = splitOptions(salvage(res.text));
  const prose = raw || res.text.trim();
  m.log.push({ role: "scene", text: prose });
  m.options = options.length >= 2 ? options : fallbackOptions();
  m.unexpanded = false;

  // The bookkeeper turns the prose into what changed, with the room set to just her.
  if (p) {
    const book = await call({
      system: BOOKKEEPER_SYSTEM,
      user: `${bookkeeperContext(s)}\n\n## THE TURN\nOwner: ${reply ?? m.title}\n\n${prose}`,
      model: s.models.bookkeeper_model, fallback: s.models.fallback_model, json: true, signal: opts?.signal,
    });
    const diff = book.ok ? parseJson<Diff>(book.text) : null;
    if (diff) {
      const before = s.scene.present;
      s.scene.present = [p.id, ...others.map((o) => o.id)];
      applyDiff(s, { ...diff, present_add: [], present_remove: [], location: undefined }, prose);
      s.scene.present = before;
      refresh(p, s.memory[p.id]);
    }
  }
  return { ok: true, prose };
}

/** What a scene with citizens needs to know: the city, its laws, what you've done, what's said. */
function cityContext(s: SaveState): string {
  const deeds = (s.deeds ?? []).filter((d) => d.public).slice(-4).map((d) => `· ${d.summary}`).join("\n");
  const rumors = [...s.rumors].sort((a, b) => b.salience - a.salience).slice(0, 3).map((r) => `· "${r.content}"`).join("\n");
  return [
    `## THE ARCOLOGY\n${s.arcology.name}, week ${s.arcology.week}. Reputation ${Math.round(s.arcology.rep)}; the city's opinion of the player is ${s.arcology.public_standing >= 3 ? "good" : s.arcology.public_standing <= -3 ? "poor" : "mixed"}.${s.player.owned_by ? ` The player wears the collar of ${s.people[s.player.owned_by]?.name ?? "a slave"}, and people know it.` : ""}`,
    cultureBrief(s) ? `HOW CITIZENS BEHAVE:\n${cultureBrief(s)}` : "",
    lawsLine(s),
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
