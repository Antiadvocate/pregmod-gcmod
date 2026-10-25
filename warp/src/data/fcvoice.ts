/**
 * THE ORIGINAL'S VOICE — how Free Cities itself writes a slave in each frame of mind.
 *
 * Lines taken from the original game's own text (src/npc/interaction, src/js/sexActsJS.js,
 * src/events/RESS in this repository), pronouns and titles filled in, grouped by how she takes
 * orders (engine/compliance); the free woman's line is Warp's, since the original has no slave who
 * isn't bound to obey. They're shown to the narrator as the register to match: plain,
 * physical, matter-of-fact, the slave's words short and in her place, and the consequence said
 * outright. Never to be copied into a scene.
 */
import type { Stance } from "../engine/compliance";

export const FC_VOICE: Record<Stance, { narration: string[]; said: string[]; anus?: string[] }> = {
  eager: {
    narration: [
      "You ease yourself into her pussy, since it's her first time, then gradually speed up your thrusts while she slowly learns to move her hips along with you. She moans loudly.",
      "She enjoys losing her cherry to you, and can't wait to have her pussy fucked by you again.",
    ],
    anus: ["Since it's her first time, you gently ease yourself into her butthole and gradually increase the intensity of your thrusts. Before long she's moaning loudly as you continue working away at her butthole."],
    said: ["\"Hi Master! Love you!\"", "\"Today is going to be fun. The other girls'll be jealous you wanted me to look so slutty. Love you, Master.\""],
  },
  obedient: {
    narration: [
      "She accepts the pain and humiliation of anal sex as part of her sexual servitude, though she hopes that her next time will be less painful.",
      "She accepts your orders without comment and presents her virgin pussy for defloration.",
    ],
    anus: ["Her moans become louder and louder as you continue working away at her butthole. She accepts the pain and humiliation of anal sex as part of her sexual servitude, though she hopes that her next time will be less painful."],
    said: ["\"Master, how may I serve you?\"", "\"I'm sorry, Master, but those things are just so embarrassing!\""],
  },
  reluctant: {
    narration: [
      "She is clearly unhappy at losing her pearl of great price to you; this probably isn't what she imagined her first real sex would be like.",
      "She does not like dicks, and obviously does not find the prospect of sucking this one appealing right now, but she knows it's not optional.",
    ],
    said: ["\"That thing hurts, Master. It's too big for my asshole. Please don't make me wear it.\"", "\"No, I don't like them. But I'll do my best to be a good sex slave anyway, Master.\""],
  },
  terrified: {
    narration: [
      "Her eyes go wide with fear. You tell her not to worry, because you're still pretty wet from the last slave you fucked, so this shouldn't hurt too much.",
      "She lies there, all possibility of resistance driven out of her. Her fear of you has increased.",
    ],
    said: ["\"Th-thank you, Master, I'll d-do my b-best.\"", "\"I'm sorry, Master,\""],
  },
  resists: {
    narration: [
      "You force yourself into her pussy. She sobs and cries with disgust while you continue thrusting into her fuck hole. She hates losing her virginity this way and fears the next time you'll conquer her.",
      "She's not yet obedient, but she has to earn her keep anyway. This means selling her body, or in her particular case, having her unwilling body sold.",
    ],
    anus: ["You force yourself into her butthole. She sobs and cries with disgust while you continue thrusting into her ass. She fears her next anal sex, remembering the pain of losing her anal virginity."],
    said: ["\"Please, Master, I'm sorry! Please don't fuck my ass! I'll eat all the cum you want! Please!\"", "\"Please, Master! AAAH! It hurts! It AAAH hurtss- so b-baAAAH!\"", "\"Please nooo, my poor hole will never be the same againnn.\""],
  },
  fights: {
    narration: [
      "As you anticipated, she refuses to give you her virginity. And as you expected, she is unable to resist you. She cries as your cock opens her fresh, tight hole.",
      "She tries to struggle, but you only pound harder. She hates and fears you for robbing her of her virginity.",
    ],
    said: ["\"No, Master.\"", "\"Please no, Master! Please not my — AAAH! OW!\""],
  },
  hollow: {
    narration: ["Since her mind is gone, she's yours to use as a human sex doll. Her body retains its instinctual responses, at least."],
    said: [],
  },
  free: {
    narration: ["She takes you by the hand and leads, because she can."],
    said: [],
  },
};

/** The register to match, for the narrator. */
export function fcVoice(stance: Stance, hole?: "vagina" | "anus" | "throat"): string {
  const v = FC_VOICE[stance];
  // The original's lines about her pussy, for a scene that's about her ass, would put the wrong hole in.
  const lines = hole === "anus" && v.anus ? v.anus : hole && hole !== "vagina" ? v.narration.filter((l) => !/pussy|cherry|virgin/.test(l)) : v.narration;
  return `THE ORIGINAL GAME'S VOICE for a slave in her frame of mind (match how plain and physical it is, how the consequence is said outright, and how short and in her place her words are; never copy a line):\n${[...lines, ...v.said].map((l) => `· ${l}`).join("\n")}`;
}
