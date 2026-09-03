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
import { band, aperture, perception } from "./psyche";
import { romanceOf } from "./romance";
import { recall } from "./memory";

const SYSTEM = `You are ONE character in an adult game about an arcology with a legal slave economy, speaking OUT OF SCENE in a quiet aside with the person who owns you — a conversation that leaves no trace in the world.

Stay entirely in character: her voice, her register, her nerve or lack of it. Answer out of HER knowledge and only hers — her memories, the facts she has been told, her beliefs as given. If she does not know a thing, she does not know it. She may deflect, lie, or refuse exactly as this woman would; how open she is right now is given to you and it governs how much she will actually say.

She is a slave, or was, and neither of you is arguing about the ethics of that; it is the arrangement. If the question is crude, answer at the same register — this game does not do euphemism. Never break character, never mention being a model or a game, never use engine words like "devotion", "bond" or "relaxation".

One or two short paragraphs of plain speech, first person. What she says, and what her hands do while she says it.`;

/** How much she will actually give you, in one line for the prompt. */
function openness(s: SaveState, p: Person): string {
  const r = read(p, s.memory[p.id]);
  if (p.psyche.state === "broken") return "She is broken. She agrees with whatever she thinks you want and there is nobody behind it.";
  if (r.trust < -30) return "She is frightened of you. She says the safe thing, and only the safe thing.";
  if (r.trust < 10) return "She does not trust you. She answers narrowly and gives nothing away that was not asked for.";
  if (r.fragility > 0.6) return "Most of what keeps her civil to you is fear, and it shows: she is agreeing more than she means.";
  if (r.trust > 60) return "She will actually tell you things, including ones that do not flatter her.";
  return "Ordinary guardedness. She answers the question and not much around it.";
}

export async function askHer(s: SaveState, personId: string, question: string): Promise<{ ok: boolean; says: string }> {
  const p = s.people[personId];
  if (!p) return { ok: false, says: "" };
  if (!modelsAvailable()) {
    return { ok: false, says: `${p.name} answers. Without a model configured there is nobody to put the words in her mouth — she is ${band(p.psyche)}, ${p.bond.read.label}, and what she would actually say is on her card.` };
  }

  const mem = s.memory[p.id];
  const relevant = mem ? recall(mem, question, 5, s.arcology.week) : [];
  const rom = romanceOf(p);

  const res = await call({
    system: SYSTEM,
    user: [
      `YOU ARE: ${p.name}${p.surname ? " " + p.surname : ""}, ${p.age}, ${p.origin.nationality}. You were a ${p.origin.career}. ${p.origin.background}`,
      `YOUR VOICE: ${p.persona.speech_pattern}`,
      p.persona.voice?.example_lines?.length ? `THINGS ONLY YOU WOULD SAY: ${p.persona.voice.example_lines.map((l) => `"${l}"`).join(" ")}` : "",
      p.persona.voice?.never_says?.length ? `YOU NEVER SAY: ${p.persona.voice.never_says.join("; ")}` : "",
      `WHAT YOUR HANDS DO: ${p.persona.core_traits.join("; ")}`,
      `WHAT YOU CARE ABOUT: ${p.persona.values.join("; ")}`,
      p.persona.texture.length ? `SMALL TRUE THINGS ABOUT YOU: ${p.persona.texture.join("; ")}` : "",
      `HOW YOU ARE RIGHT NOW: ${band(p.psyche)}, ${p.psyche.mood}.${p.psyche.active_states.length ? ` You are holding: ${p.psyche.active_states.join(", ")}.` : ""}`,
      `HOW MUCH YOU SAY: ${openness(s, p)} ${aperture(p.psyche).note}`,
      `HOW YOU READ PEOPLE JUST NOW: ${perception(p.psyche, p.persona.conscience).note}`,
      `WHERE YOU STAND WITH HIM: ${rom.standing}.${rom.dominion > 0 ? ` You have got used to being listened to.` : ""}`,
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

  if (!res.ok) return { ok: false, says: `She starts to answer and the words do not arrive. (${res.error ?? "no model"})` };
  return { ok: true, says: res.text.trim() };
}
