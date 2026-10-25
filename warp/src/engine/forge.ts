/**
 * THE FORGE, MODEL HALF — the interior, written over a person who already exists.
 *
 * Order is the whole trick. The body, the nationality, the career, the way they were acquired and
 * the shape of their nervous system are decided first, deterministically (engine/generate.ts), and
 * the model is handed all of it as fixed. It writes only what a model is actually good at: how
 * this specific person talks, what their hands do, and one thing that happened to them.
 *
 * A model asked for "a slave" from an empty prompt returns the average of everything it has read,
 * which is why every AI-generated cast reads like the same four people. A model asked for the voice
 * of a 26-year-old Ukrainian bookkeeper with an avoidant nervous system who was sold against her
 * brother's debt returns somebody specific, because there is only one of her.
 */
import type { Person, SaveState, WeekReport } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { FORGE_SYSTEM, WEEK_SYSTEM } from "./prompts";
import { remember } from "./memory";
import { cleanList, OWN_V } from "./ownlife";

interface ForgeOut {
  voice?: Person["persona"]["voice"];
  core_traits?: string[];
  texture?: string[];
  interests?: string[];
  goals?: string[];
  exchanges?: { you?: string; her?: string }[];
  background?: string;
  defining_memory?: { content: string; charge?: string; importance?: number };
}

function sketch(p: Person): string {
  return [
    `NAME: ${p.name}${p.surname ? " " + p.surname : ""}`,
    `AGE ${p.age}, ${p.pronouns}, ${p.origin.nationality} (${p.origin.race})`,
    `BODY: ${p.body.appearance_facts}`,
    `WAS: a ${p.origin.career}`,
    `HOW SHE GOT HERE: ${p.origin.background}`,
    `TEMPERAMENT: ${p.persona.attachment.style} attachment — under threat she ${p.persona.attachment.under_threat}; settled by ${p.persona.attachment.soothed_by}.`,
    `HOW MUCH OTHER PEOPLE REGISTER AS MATTERING (0-1): ${p.persona.conscience}`,
    `INTELLIGENCE: ${p.persona.intelligence}, education ${Math.round(p.persona.education)}/100`,
    `RESTING STATE: ${p.psyche.capacity_born > 1 ? "comes to rest open" : p.psyche.capacity_born < -1 ? "comes to rest braced" : "comes to rest about where anyone does"}`,
    `WANTS: ${p.persona.attracted_to}; drawn to ${p.persona.taste}`,
    p.persona.behavior?.flaw ? `HER FLAW (fixed): ${p.persona.behavior.flaw}` : p.persona.behavior?.quirk ? `HER WAY (fixed): ${p.persona.behavior.quirk}` : "",
    p.persona.talents?.length ? `GOOD AT: ${p.persona.talents.join(", ")}` : "",
    `THE ARCOLOGY: she is owned, and she knows exactly what that means.`,
  ].filter(Boolean).join("\n");
}

/** Flesh her out with the model. `voiceOnly` gives her a voice and leaves the rest of her alone: for
 *  a woman who already has a history in this save, which a new background would contradict. */
export async function enrichPerson(s: SaveState, p: Person, voiceOnly = false): Promise<boolean> {
  if (!modelsAvailable()) return false;
  const res = await call({
    system: FORGE_SYSTEM,
    user: sketch(p),
    model: s.models.forge_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 1200,
  });
  if (!res.ok) return false;
  const out = parseJson<ForgeOut>(res.text);
  if (!out) return false;

  if (out.voice) p.persona.voice = { ...p.persona.voice, ...out.voice };
  // Her own time and what she wants contradict nothing she's lived, so they're kept either way.
  const does = cleanList(out.interests, 3), wants = cleanList(out.goals, 2);
  if (does.length) p.persona.interests = does;
  if (wants.length) p.persona.goals = wants;
  if (does.length && wants.length) p.persona.own_v = OWN_V;
  // Three ordinary exchanges, so her voice has a length and a plainness to hold to from the first
  // scene, not only once she's re-read weeks later (engine/growth rewrites them as she changes).
  const talk = (Array.isArray(out.exchanges) ? out.exchanges : []).map((x) => ({ you: String(x?.you ?? "").trim().slice(0, 120), her: String(x?.her ?? "").trim().slice(0, 240) })).filter((x) => x.you && x.her).slice(0, 3);
  if (talk.length && !p.persona.exchanges?.length) p.persona.exchanges = talk;
  if (voiceOnly) return !!out.voice;
  if (out.core_traits?.length) p.persona.core_traits = out.core_traits.slice(0, 4).map((t) => String(t).slice(0, 160));
  if (out.texture?.length) p.persona.texture = out.texture.slice(0, 3).map((t) => String(t).slice(0, 100));
  if (out.background) p.persona.background = String(out.background).slice(0, 800);
  if (out.defining_memory?.content) {
    const mem = s.memory[p.id];
    if (mem) remember(mem, {
      content: String(out.defining_memory.content).slice(0, 240),
      week: Math.max(0, s.arcology.week - 1),
      importance: Math.min(10, Number(out.defining_memory.importance ?? 8)),
      charge: (["warm", "cold", "sharp", "dull", "bright"].includes(String(out.defining_memory.charge)) ? out.defining_memory.charge : "sharp") as "sharp",
      source: "lived",
      core: true,
    });
  }
  p.central = true;
  return true;
}

/** The paragraph over the top of the week's numbers. Never invents; the report lines are the only
 *  material. Failure is silent and the numbers stand alone, which is the correct fallback. */
export async function writeWeekProse(s: SaveState, report: WeekReport): Promise<string | null> {
  if (!modelsAvailable()) return null;
  const material = report.lines.slice(0, 12).map((l) => `· ${l.text}`).join("\n");
  const money = `Cash ${report.cash_start} → ${report.cash_end}. Reputation ${report.rep_start} → ${report.rep_end}.`;
  const res = await call({
    system: WEEK_SYSTEM,
    user: `ARCOLOGY: ${s.arcology.name}, week ${report.week}.\n${money}\n\nWHAT HAPPENED:\n${material}\n\nPROBLEMS:\n${report.problems.map((p) => `· ${p}`).join("\n") || "· none"}`,
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    maxTokens: 400,
    temperature: 0.8,
  });
  if (!res.ok || !res.text.trim()) return null;
  report.prose = res.text.trim();
  return report.prose;
}
