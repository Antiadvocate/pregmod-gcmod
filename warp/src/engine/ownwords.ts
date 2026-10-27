/**
 * YOUR OWN WORDS, READ AS A CHOICE.
 *
 * Anywhere the game offers choices it also takes what you type, and something has to decide which
 * of the choices the game can actually carry out your words come closest to. It used to be the
 * model alone, asked to repeat an internal id back in 120 tokens; a model that thinks first spent
 * those thinking and sent nothing, one that answered with the choice's wording or its number was
 * counted as wrong, and either way you were told to say it another way. Over and over.
 *
 * Now the choices go to the model numbered, with room to think, and its answer is accepted as a
 * number, an id or the words of a choice. If it still can't say, or the call fails, the closest
 * choice by the words you used is taken. Your answer always goes through: what you typed is what
 * gets played out, and the choice only decides what the game does about it.
 */
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import type { SaveState } from "./types";
import { asFate, FATE_WORDS, sameName, settle, type Fate } from "./fates";
import { isOwnerName } from "./you";

export interface Option { id: string; label: string; note?: string }

const SYSTEM = `You read what the player typed in answer to a situation in an adult text game, and decide which ONE of the numbered choices it comes closest to doing. Every choice is something the game can carry out. The player's own words will be played out exactly as they wrote them, and the choice only decides what the game does about it. Always pick one, the nearest, even if the player said more, less or something different.

The player owns the city, and their orders are carried out. If what they typed orders something done to a particular person in the situation (killed, executed, jailed, thrown out of the city, ruined, or paid off), list it under "orders" with the person's name as the situation gives it, the fate (dead, jailed, exiled, ruined or bought), and how, in a few words from what they typed. Only list orders the player actually gave, never the player's own slaves, and never the player. Usually there are none.

Answer with JSON only: {"choice": <number>, "orders": [{"name": "...", "fate": "dead", "how": "..."}]}`;

export interface Order { name: string; fate: Fate; how: string }

const STOP = new Set("a an the and or but to of in on at for with her him his she he it you your i me my is are be do does that this then them they so as by from up out not no".split(" "));
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, "");

/** The choice whose words overlap most with what you typed. Ties go to the earlier choice. */
export function closest(opts: Option[], typed: string): Option {
  const mine = new Set(words(typed).map(stem));
  let best = opts[0], score = -1;
  for (const o of opts) {
    const theirs = words(`${o.label} ${o.note ?? ""} ${o.id.replace(/[_:]/g, " ")}`).map(stem);
    const hit = theirs.filter((w) => mine.has(w)).length / Math.sqrt(theirs.length + 1);
    if (hit > score) { score = hit; best = o; }
  }
  return best;
}

/** Read the model's answer as one of the options: a number, an id, or a choice's words. */
export function readPick(text: string, opts: Option[]): Option | undefined {
  const j = parseJson<{ choice?: unknown; id?: unknown; move?: unknown }>(text);
  const raw = j ? (j.choice ?? j.id ?? j.move) : text.trim();
  const v = String(raw ?? "").trim().replace(/^["'#\s]+|["'.\s]+$/g, "");
  if (!v) return undefined;
  const n = Number(v);
  if (Number.isInteger(n) && n >= 1 && n <= opts.length) return opts[n - 1];
  const lower = v.toLowerCase();
  return opts.find((o) => o.id.toLowerCase() === lower)
    ?? opts.find((o) => o.label.toLowerCase() === lower)
    ?? opts.find((o) => lower.includes(o.label.toLowerCase()) || o.label.toLowerCase().includes(lower));
}

/** Which option your words come to. Never fails: the closest by your words when the model can't say. */
export async function pickOption(s: SaveState, situation: string, opts: Option[], typed: string, signal?: AbortSignal, extra = ""): Promise<{ option: Option; orders: Order[]; raw?: string; stopped?: boolean }> {
  if (!opts.length) throw new Error("nothing to choose from");
  if (!modelsAvailable()) return { option: closest(opts, typed), orders: [] };
  const res = await call({
    system: SYSTEM,
    user: [
      `## THE SITUATION\n${situation.slice(-3000)}`,
      extra,
      `## THE CHOICES\n${opts.map((o, i) => `${i + 1}. ${o.label}${o.note ? ` (${o.note})` : ""}`).join("\n")}`,
      `## WHAT THE PLAYER TYPED\n${typed.slice(0, 800)}`,
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    // Room for a model that thinks before it answers.
    maxTokens: 1800,
    temperature: 0,
    urgent: true,
    signal,
  });
  if (signal?.aborted) return { option: opts[0], orders: [], stopped: true };
  const hit = res.ok ? readPick(res.text, opts) : undefined;
  return { option: hit ?? closest(opts, typed), orders: res.ok ? readOrders(res.text) : [], raw: res.ok ? res.text : undefined };
}

function readOrders(text: string): Order[] {
  const j = parseJson<{ orders?: { name?: unknown; fate?: unknown; how?: unknown }[] }>(text);
  return (Array.isArray(j?.orders) ? j!.orders : [])
    .map((o) => ({ name: String(o?.name ?? "").trim().slice(0, 60), fate: asFate(o?.fate), how: String(o?.how ?? "").trim().slice(0, 160) }))
    .filter((o): o is Order => !!o.name && !!o.fate)
    .slice(0, 3);
}

/**
 * Carry out the orders in what you typed: each person settled for good (engine/fates), everywhere
 * they're kept. Your own household is never touched from here; that's done on purpose, from her
 * page. Returns the facts, for the outcome to be written from.
 */
export function applyOrders(s: SaveState, orders: Order[]): string[] {
  const facts: string[] = [];
  for (const o of orders) {
    const yours = Object.values(s.people).some((p) => (p.status === "owned" || p.status === "indentured") && sameName(`${p.name} ${p.surname ?? ""}`, o.name));
    if (yours || isOwnerName(s, o.name)) continue;
    const how = o.how || "on your order";
    const lines = settle(s, o.name, o.fate, `On your order: ${how}`, { by: "your order" });
    if (lines.length) facts.push(`By your order, ${o.name} was ${FATE_WORDS[o.fate]} (${how}). That's final, so they're ${o.fate === "dead" ? "dead" : FATE_WORDS[o.fate]}, and everyone there saw it done.`);
  }
  return facts;
}
