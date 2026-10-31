/**
 * CONTINUITY, CHECKED IN CODE.
 *
 * Everything on a card is a sentence the narrator is asked to respect, and nothing checked that it
 * did. This reads the finished prose against plain facts the game keeps, with no model call: a mute
 * woman given lines, a blind woman looking at things, someone dead, driven out or dropped by the
 * player turning up again. A scene that breaks one is written once more with the fact named, and
 * if it still breaks it, the player is shown what slipped.
 */
import type { Person, SaveState } from "./types";
import { shortName } from "./faceid";
import { childrenOf } from "./pregnancy";

const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SPEAKS = "says|said|whispers|whispered|murmurs|asks|asked|answers|replies|mutters|hisses|shouts|yells|tells you|calls out";
const SEES = "looks at|looks up at|looks down at|watches|glances|stares|sees|meets your eyes|meets your gaze|catches your eye";
const ACTS = "says|walks|comes|steps|stands|smiles|laughs|nods|waves|is waiting|arrives|turns up";

/** The facts the prose broke, each as a line the narrator can be handed. Empty when none. */
export function continuitySlips(s: SaveState, prose: string, people: Person[]): string[] {
  const out: string[] = [];
  const solo = people.length === 1;
  for (const p of people) {
    const first = esc(p.name.split(" ")[0]);
    // In a scene with only her, "she" is her.
    const who = solo ? `(?:she|${first})` : first;
    if (p.body.voice === 0) {
      const talks = new RegExp(`\\b${who}\\s+(?:${SPEAKS})\\b`, "i").test(prose) || new RegExp(`["“][^"”]{2,}["”],?\\s+${who}\\s+(?:${SPEAKS})\\b`, "i").test(prose);
      if (talks) out.push(`${p.name} is mute and cannot say a word. Give her no dialogue at all, only wordless sounds, gestures or writing.`);
    }
    // A pregnancy, or a baby, the game doesn't have. Written once, it was remembered, and every
    // scene after it talked about a child nobody could find.
    if (!p.womb.fetuses.length) {
      const claims = new RegExp(`\\b${who}(?:'s|\\s+is|\\s+was)\\s+(?:now\\s+|already\\s+|visibly\\s+)?(?:pregnant|expecting|with child|carrying (?:your|the owner's|his|a|the) (?:child|baby))`, "i").test(prose)
        || (solo && /["“][^"”]*\bI(?:'m| am)\s+(?:pregnant|carrying your (?:child|baby))/i.test(prose));
      if (claims) out.push(`${p.name} is not pregnant. Don't write her pregnant, expecting or carrying a baby.`);
    }
    if (solo && !childrenOf(s, p).length && /\b(?:our|your) (?:baby|son|daughter|little one)\b/i.test(prose) && !p.womb.fetuses.length) {
      out.push(`${p.name} has no child with the owner. There's no baby.`);
    }
    if (p.body.eyes === "blind" && new RegExp(`\\b${who}\\s+(?:${SEES})\\b`, "i").test(prose)) {
      out.push(`${p.name} is blind and sees nothing. She never looks at, watches or meets the eyes of anyone; she knows things by touch, sound and smell.`);
    }
  }
  for (const f of Object.values(s.faces ?? {})) {
    if (!f.fate && !f.banned) continue;
    const short = shortName(f.name);
    if (people.some((p) => p.name.split(" ")[0] === (short ?? f.name))) continue;
    // A description ("the laundry girl") is only ever matched whole.
    const name = esc(short ?? f.name);
    if (f.banned && new RegExp(`\\b${esc(f.name)}\\b|\\b${name}\\b`, "i").test(prose)) out.push(`${f.name} is out of the story for good. Don't mention them.`);
    else if (f.fate && (f.fate.fate === "dead" || f.fate.fate === "exiled") && new RegExp(`\\b${name}(?:\\s+\\w+)?\\s+(?:${ACTS})\\b`, "i").test(prose)) {
      out.push(`${f.name} is ${f.fate.fate === "dead" ? "dead" : "gone from the arcology"} and can't be in the scene.`);
    }
  }
  return out;
}
