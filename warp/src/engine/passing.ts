/**
 * PASSING BY — who walks past while you're on the Home screen, and what she's doing.
 *
 * The original game's main screen always had someone walking past: a slave on her way somewhere,
 * doing something, one line, and a link to use her right there. It's most of why that screen felt
 * like a house with people in it. This is that, written by the game from what's true of her (her
 * job, her mood, what's on her body, what she's carrying today) without asking anyone.
 */
import type { Person, SaveState } from "./types";
import { rng } from "./rng";
import { say } from "./voice";
import { marksLine } from "./marks";
import { inHousehold } from "./romance";
import { availableActs } from "./intimacy";

const JOB_LINES: [RegExp, string[]][] = [
  [/servant|clean/i, ["is on her knees scrubbing the hallway floor", "goes past with a basket of laundry on her hip", "is polishing the glass by the lift, and missed a spot"]],
  [/brothel|whore/i, ["is on her way down to the brothel for her shift, already made up", "comes back up from the brothel walking carefully"]],
  [/club|entertain|public|slut/i, ["heads out to the club in something that barely counts as clothes", "comes in from the concourse smelling of other people"]],
  [/milk|dairy|cow/i, ["waddles past on her way to the milkers, leaking through her top", "comes back from milking with her tits sore and empty"]],
  [/rest|spa/i, ["is curled up on the couch doing nothing at all", "pads past, still damp from the spa"]],
  [/please you|fucktoy|concubine/i, ["is hanging about the penthouse in case you want her", "is lying across your bed, waiting, and doesn't get up"]],
  [/class|school|learn/i, ["goes past with a book under her arm, mouthing something to herself"]],
  [/guard|bodyguard|security/i, ["walks the corridor with a hand on her weapon, watching the doors"]],
  [/clinic|treatment/i, ["shuffles past in a clinic gown, holding it shut at the back"]],
  [/cell|confine/i, ["is led past by a guard on her way back to the cells"]],
];

export interface Passer { person: Person; doing: string; says: string; acts: { id: string; name: string }[] }

/** Someone from the house, and what she's doing. `turn` moves it along. */
export function passingBy(s: SaveState, turn: number): Passer | null {
  const pool = Object.values(s.people).filter((p) => inHousehold(s, p) && p.age >= 18 && !p.governs && p.health.recovery_weeks === 0);
  if (!pool.length) return null;
  const r = rng(`passing:${s.arcology.week}:${turn}`);
  const p = pool[(Math.abs(Math.floor(r() * 1e6)) + turn) % pool.length];
  const first = p.name.split(" ")[0];
  const lines = JOB_LINES.find(([re]) => re.test(p.assignment))?.[1] ?? [`goes past on her way to ${p.assignment.replace(/^be /, "being ")}`];
  let doing = `${first} ${r.pick(lines)}`;
  if (s.player.owned_by === p.id) doing = `${first} goes past barefoot on the cold floor, and doesn't need to say anything to you`;
  const extra: string[] = [];
  if (p.stains?.length) extra.push(`with ${marksLine(s, p.stains)} still on her`);
  else if (p.womb.fetuses.length && p.womb.weeks > 16) extra.push("one hand on her belly");
  if (p.psyche.arousal > 70) extra.push("and she's obviously horny");
  else if (p.bond.fear > 60) extra.push("and she flinches when she sees you");
  else if (p.bond.resentment > 60) extra.push("and doesn't look at you");
  if (extra.length) doing += `, ${extra.join(", ")}`;
  doing += ".";
  const says = s.player.owned_by === p.id ? "" : say(s, p, "open", r);
  const acts = availableActs(p, s).filter((a) => !a.blocked).sort((a, b) => b.affinity - a.affinity).slice(0, 3).map((a) => ({ id: a.act.id, name: a.act.name }));
  return { person: p, doing, says, acts };
}
