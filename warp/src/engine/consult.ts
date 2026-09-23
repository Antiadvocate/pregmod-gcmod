/**
 * ASKING HER SOMETHING.
 *
 * A quiet aside, out of scene, that leaves no trace in the world. She answers as herself: her
 * voice, her register, and — the part that matters — HER KNOWLEDGE AND ONLY HERS. She answers out
 * of her own memories, her own beliefs and the facts she has actually been told. If she does not
 * know something she does not know it, and she may deflect, lie, or refuse exactly as this person
 * would.
 *
 * Nothing here writes to the world. No memory is formed, no bond moves, no clock advances. That is
 * deliberate: a channel where you can ask a woman what she thinks without it becoming an event is
 * a different and much more useful thing than another scene, and the genre has never had one.
 */
import type { Person, SaveState } from "./types";
import { call } from "../llm";
import { modelsAvailable } from "../config";
import { read } from "./obedience";
import { band } from "./psyche";
import { condition } from "./prompts";
import { describeGenitals, describeFeet } from "./genitals";
import { romanceOf } from "./romance";
import { recall } from "./memory";

const SYSTEM = `You are playing one slave in Free Cities, an adult text game about owning an arcology. Her owner is asking her a question in private. Answer as her, in first person, the way she would actually talk.

She only knows what is on her card: her memories, what she has been told, what she believes. If she doesn't know something, she says so, or dodges. How honest she is with her owner is on the card too. She may lie or refuse if that is what she would do.

Nobody is arguing about whether slavery is right; it is her life. If the question is crude, she answers it plainly. Never break character or mention the game, and never use its stat words ("devotion", "trust", "bond").

Answer in one or two short paragraphs of ordinary speech. Answer the question that was asked. No sayings, no dramatic one-word lines, no describing her own gestures.`;

/** How much she will actually give you, in one line for the prompt. */
function openness(s: SaveState, p: Person): string {
  const r = read(p, s.memory[p.id]);
  if (p.psyche.state === "broken") return "She's broken. She agrees with whatever she thinks you want to hear.";
  if (r.trust < -30) return "She's terrified of you and only says what she thinks is safe.";
  if (r.trust < 10) return "She doesn't trust you. She answers exactly what was asked and nothing more.";
  if (r.fragility > 0.6) return "She's mostly obedient out of fear, so she agrees more than she means.";
  if (r.trust > 60) return "She trusts you and will tell you the truth, even the unflattering parts.";
  return "She's a little guarded. She answers the question and not much else.";
}

export async function askHer(s: SaveState, personId: string, question: string): Promise<{ ok: boolean; says: string }> {
  const p = s.people[personId];
  if (!p) return { ok: false, says: "" };
  if (!modelsAvailable()) {
    return { ok: false, says: `No model is configured, so ${p.name} can't answer free-form questions. She is ${condition(p)} and ${p.bond.read.label}.` };
  }

  const mem = s.memory[p.id];
  const relevant = mem ? recall(mem, question, 5, s.arcology.week) : [];
  const rom = romanceOf(p);

  const res = await call({
    system: SYSTEM,
    user: [
      `YOU ARE: ${p.name}${p.surname ? " " + p.surname : ""}, ${p.age}, ${p.origin.nationality}. You were a ${p.origin.career}. ${p.origin.background}`,
      `YOUR BODY (described the way others see it): ${p.body.appearance_facts} ${describeGenitals(p)} ${describeFeet(p)}`,
      `YOUR VOICE: ${p.persona.speech_pattern}`,
      p.persona.voice?.example_lines?.length ? `THINGS ONLY YOU WOULD SAY: ${p.persona.voice.example_lines.map((l) => `"${l}"`).join(" ")}` : "",
      p.persona.voice?.never_says?.length ? `YOU NEVER SAY: ${p.persona.voice.never_says.join("; ")}` : "",
      `YOUR PERSONALITY: ${p.persona.core_traits.join("; ")}`,
      `WHAT YOU CARE ABOUT: ${p.persona.values.join("; ")}`,
      p.persona.texture.length ? `LIKES AND DISLIKES: ${p.persona.texture.join("; ")}` : "",
      `HOW YOU ARE RIGHT NOW: ${condition(p)}, ${p.psyche.mood}.${p.psyche.active_states.length ? ` You are holding: ${p.psyche.active_states.join(", ")}.` : ""}`,
      `HOW OPEN YOU ARE WITH HIM: ${openness(s, p)}`,
      `WHERE YOU STAND WITH HIM: ${rom.standing}.`,
      `YOUR JOB: ${p.assignment}${p.facility ? ` in the ${s.arcology.facilities[p.facility]?.name}` : ""}.`,
      relevant.length ? `WHAT YOU REMEMBER THAT BEARS ON THIS: ${relevant.map((m) => `${m.content} (week ${m.week})`).join(" | ")}` : "",
      mem?.beliefs.length ? `WHAT YOU HAVE CONCLUDED: ${mem.beliefs.map((b) => `"${b.text}"`).join(" ")}` : "",
      mem?.facts.length ? `THINGS YOU HAVE BEEN TOLD: ${mem.facts.slice(-6).map((f) => f.text).join("; ")}` : "",
      `THE PLACE: ${s.arcology.name}, week ${s.arcology.week}.`,
      ``,
      `HE ASKS YOU: ${question}`,
    ].filter(Boolean).join("\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    maxTokens: 400,
    temperature: 0.95,
  });

  if (!res.ok) return { ok: false, says: `The model didn't answer. (${res.error ?? "no model"})` };
  return { ok: true, says: res.text.trim() };
}
