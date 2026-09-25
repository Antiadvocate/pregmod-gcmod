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

export interface MomentLine { role: "you" | "scene"; text: string }

export interface Moment {
  id: string;
  person?: string;
  title: string;
  source: string;
  week: number;
  updated: number;
  log: MomentLine[];
  options: string[];
  /** Still open: it can be picked up later. */
  open: boolean;
  /** The first beat is a one-liner that hasn't been written out yet. */
  unexpanded?: boolean;
}

export const MOMENT_SYSTEM = `You continue a scene in Free Cities, an adult text game about owning an arcology where slavery is legal. The player owns the slave in the scene.

${HOUSE_STYLE}

You are given the slave's card (fact), the world, and the scene so far. Write what happens next, in response to the player's last line. If the last thing in the scene is a short summary of something that just happened, write that moment out in full first: what she does, what she says, how she takes it. Two to four paragraphs, with her talking in her own voice. Follow the player's reply exactly; if they do something, write it happening. Do not write the player's feelings. Do not end the scene; stop at a point where the player can answer.

Then, on its own line, write OPTIONS: and under it exactly four lines, each starting with "- ", giving four clearly different things the player could say or do next, in the player's voice and under twelve words each: one kind, one harsh, one sexual, and one that moves things along or leaves.`;

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
export function openMoment(s: SaveState, o: { person?: string; title: string; source: string; you?: string; happened: string }): string {
  const list = momentsOf(s);
  const id = `mo-${s.arcology.week}-${s.turn}-${list.length}`;
  const log: MomentLine[] = [];
  if (o.you) log.push({ role: "you", text: o.you });
  if (o.happened) log.push({ role: "scene", text: o.happened });
  list.push({ id, person: o.person, title: o.title, source: o.source, week: s.arcology.week, updated: s.arcology.week, log, options: DEFAULT_OPTIONS, open: true, unexpanded: modelsAvailable() });
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
  for (const m of momentsOf(s)) if (m.open && s.arcology.week - m.updated > 4) m.open = false;
  s.moments = momentsOf(s).filter((m) => m.open || s.arcology.week - m.updated < 12);
}

export function closeMoment(s: SaveState, id: string): void {
  const m = momentsOf(s).find((x) => x.id === id);
  if (m) m.open = false;
}

function transcript(m: Moment): string {
  return m.log.map((l) => (l.role === "you" ? `PLAYER: ${l.text}` : l.text)).join("\n\n");
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
  m.updated = s.arcology.week;
  m.open = true;

  if (!modelsAvailable()) {
    const prose = offlineAnswer(s, p, reply ?? "");
    m.log.push({ role: "scene", text: prose });
    m.options = offlineOptions(p, reply ?? "");
    m.unexpanded = false;
    return { ok: true, prose };
  }

  const card = p ? personCard(s, p, reply ?? m.title) : "";
  const user = [
    card ? `## THE SLAVE\n${card}` : "",
    s.world ? `## THE WORLD\n${worldBrief(s)}` : "",
    `## THE SCENE SO FAR (${m.title})\n${transcript(m)}`,
    reply ? `## THE PLAYER'S REPLY\n${reply}` : `## WRITE THIS MOMENT OUT IN FULL, then offer the options.`,
  ].filter(Boolean).join("\n\n");

  let shown = "";
  const res = await call({
    system: MOMENT_SYSTEM, user,
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
    const prose = offlineAnswer(s, p, reply ?? "");
    m.log.push({ role: "scene", text: prose });
    m.options = offlineOptions(p, reply ?? "");
    return { ok: false, prose, error: res.error };
  }
  const { prose: raw, options } = splitOptions(salvage(res.text));
  const prose = raw || res.text.trim();
  m.log.push({ role: "scene", text: prose });
  m.options = options.length >= 2 ? options : offlineOptions(p, reply ?? "");
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
      s.scene.present = [p.id];
      applyDiff(s, { ...diff, present_add: [], present_remove: [], location: undefined }, prose);
      s.scene.present = before;
      refresh(p, s.memory[p.id]);
    }
  }
  return { ok: true, prose };
}

/* ── with no model: her own voice, and the next things to say ─────────────────────────────── */

function offlineAnswer(s: SaveState, p: Person | undefined, reply: string): string {
  if (!p) return reply ? "Nobody answers." : "";
  const r = rng(`moment:${p.id}:${s.turn}:${reply.length}:${s.arcology.week}`);
  const t = reply.toLowerCase();
  const week = s.arcology.week;
  let what: Parameters<typeof say>[2] = "talk_open";
  let body = "";
  if (!reply) { body = `${p.name} waits to see what you'll do.`; what = "open"; }
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
