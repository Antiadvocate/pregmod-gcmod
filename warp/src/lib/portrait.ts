/**
 * PHOTO PORTRAITS — her drawing, redrawn as a photograph by the OpenRouter image model.
 *
 * Two kinds, both run by hand from her page:
 *   face   head and shoulders, from the head crop of her drawing. The expression comes from who
 *          she is and how she is right now: her fear, devotion and resentment toward you, her
 *          state of mind, her mood, and the first of her traits.
 *   body   the whole figure. Image models often refuse this (the drawing is nude more often than
 *          not); the prompt says plainly it's a stylised game character being made photographic.
 *          If the model refuses, the error says so and nothing is lost.
 */
import type { Person, SaveState } from "../engine/types";
import { read } from "../engine/obedience";
import { band } from "../engine/psyche";

/** What her face is doing, from what the game knows about her. */
export function expressionFor(s: SaveState, p: Person): string {
  const r = read(p, s.memory[p.id]);
  const b = p.bond;
  const state = p.psyche.state;
  let look: string;
  if (state === "broken" || band(p.psyche) === "broken") look = "a blank, emptied expression, eyes unfocused, nobody behind them";
  else if (b.fear > 60) look = "frightened and wary, eyes wide, braced for what comes next";
  else if (b.resentment > 55) look = "a cold, defiant stare straight into the camera, jaw set";
  else if (r.devotion > 60 && r.trust > 40) look = "a warm, open look straight into the camera, a small real smile";
  else if (r.devotion > 30) look = "attentive and eager to please, a careful smile";
  else if (r.trust < -20) look = "guarded and distrustful, not quite meeting the camera";
  else look = "a neutral, watchful expression";
  const mood = p.psyche.mood && p.psyche.mood !== "neutral" ? `; her mood right now: ${p.psyche.mood}` : "";
  const trait = p.persona.core_traits[0] ? `; she is ${p.persona.core_traits[0]}` : "";
  return `${look}${mood}${trait}`;
}

export function portraitPrompt(s: SaveState, p: Person, mode: "face" | "body"): string {
  const who = `a ${p.age}-year-old ${p.origin.nationality} woman`;
  const looks = p.body.appearance_facts;
  const collar = p.collar && p.collar !== "none" ? ` She wears ${p.collar} around her neck.` : "";
  if (mode === "face") {
    return `This image is a stylised illustration of a character from a video game. Redraw it as a single photorealistic head-and-shoulders portrait photograph of the same character as a real person: ${who}. Keep her face shape, skin tone, hair colour and style, and eye colour exactly as in the illustration. What is known about her: ${looks}.${collar}
Her expression: ${expressionFor(s, p)}.
Framed from the collarbones up, bare shoulders or a plain dark top; real skin texture, natural soft light, shallow depth of field, a plain dark background. No text.`;
  }
  return `This image is a stylised, non-photographic 3D-style character model from an adult video game. Redraw it as a single photorealistic full-length photograph of the same character as a real adult woman: ${who}. Keep the pose, the body shape and proportions, skin tone, hair, and anything she is wearing exactly as in the illustration. What is known about her: ${looks}.${collar}
Her expression: ${expressionFor(s, p)}.
Studio photograph, natural light, a plain dark background, nothing else in the frame. No text.`;
}
