/**
 * OUT OF THE PENS.
 *
 * The menials are numbers: bought by the container, worked in bulk, worn out. Pull one out and give
 * her a room and she is a person again, of a kind, and what kind depends on how the pens have been
 * run. Kept harshly, what comes out is the worst the trade makes: limbs taken, the tongue cut out,
 * sealed in a doll suit, a mind that has gone somewhere it doesn't come back from easily. Kept
 * decently, she's rougher than anything on the market, but whole.
 *
 * Bringing one back is the long road, by design: her resting point is worn down to the floor of
 * what she was born with, the pull home is two per cent of the gap a week, and the broken state
 * lets go only when she's calm. Surgery can give her prosthetics and a tongue; nothing gives her the
 * pens back.
 */
import type { Person, SaveState } from "./types";
import { generatePerson } from "./generate";
import { menialsOf, idle } from "./menials";
import { newMemory, remember } from "./memory";
import { refresh } from "./obedience";
import { rng } from "./rng";
import { clamp } from "./psyche";

/** How many arms and legs she has, 0–2 each. A missing field is two. */
export const armsOf = (p: Person) => p.body.arms ?? 2;
export const legsOf = (p: Person) => p.body.legs ?? 2;
export const hasTongue = (p: Person) => p.body.tongue !== false;

/** Her limbs and tongue for every prompt she's in. Empty when she's whole. */
export function limbsLine(p: Person): string {
  const a = armsOf(p), l = legsOf(p);
  const out: string[] = [];
  const prosArm = p.body.marks.some((m) => m.kind === "prosthetic" && /arm|hand/i.test(m.where));
  const prosLeg = p.body.marks.some((m) => m.kind === "prosthetic" && /leg|foot|feet/i.test(m.where));
  if (a === 0) out.push(prosArm ? "her arms are prosthetics" : "she has no arms, only stumps at the shoulder, and can't hold, push, touch or feed herself");
  else if (a === 1) out.push("she has one arm");
  if (l === 0) out.push(prosLeg ? "her legs are prosthetics" : "she has no legs, only stumps at the hip, and can't stand or walk: she's carried, wheeled or crawls on what's left");
  else if (l === 1) out.push("she has one leg and can't stand without something to hold");
  if (!hasTongue(p)) out.push("her tongue was cut out: she can't speak, and nothing she makes with her mouth is a word");
  return out.length ? `LIMBS AND TONGUE (canon, never contradict): ${out.join("; ")}.` : "";
}

/** What a missing limb or tongue rules out, for engine/intimacy. */
export function limbBlock(p: Person, act: { what: string; needs?: string[] }): string | null {
  const needs = act.needs ?? [];
  const pros = (re: RegExp) => p.body.marks.some((m) => m.kind === "prosthetic" && re.test(m.where));
  if (legsOf(p) === 0 && !pros(/leg|foot|feet/i) && needs.some((n) => n === "feet" || n === "standing")) return "she has no legs";
  if (legsOf(p) === 1 && needs.includes("standing")) return "she can't stand on one leg";
  if (armsOf(p) === 0 && !pros(/arm|hand/i) && /\b(her hands?|she (strokes|holds|grabs|spreads|jerks|wanks|rubs|massages|pulls|pushes))\b/i.test(act.what)) return "she has no hands";
  if (!hasTongue(p) && /\b(her tongue|she licks|rims)\b/i.test(act.what)) return "she has no tongue";
  return null;
}

export interface Damage { arms: 0 | 1 | 2; legs: 0 | 1 | 2; tongue: boolean; doll: boolean; mind: "broken" | "fracturing" | "worn" }

/** What the pens did to her, rolled from how they're run. */
export function rollDamage(treatment: "harsh" | "standard" | "decent", seed: string): Damage {
  const r = rng(seed);
  const [cut, tongue, doll, broken] = treatment === "harsh" ? [0.7, 0.6, 0.5, 0.9] : treatment === "standard" ? [0.25, 0.25, 0.15, 0.5] : [0.05, 0.05, 0, 0.15];
  const limbs = r() < cut;
  const both = limbs && r() < 0.6;
  return {
    arms: !limbs ? 2 : both || r() < 0.4 ? 0 : 2,
    legs: !limbs ? 2 : both || r() < 0.8 ? 0 : 1,
    tongue: !(r() < tongue),
    doll: r() < doll,
    mind: r() < broken ? "broken" : r() < 0.6 ? "fracturing" : "worn",
  };
}

/** Pull one menial out of the pens and into the household. */
export function takeMenial(s: SaveState): { ok: boolean; text: string; id?: string } {
  const m = menialsOf(s);
  if (idle(m) < 1 && m.owned < 1) return { ok: false, text: "You don't own any menials." };
  const week = s.arcology.week;
  const tag = `${s.id ?? "run"}:${week}:${m.owned}`;
  const num = 1000 + (Math.abs([...tag].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)) % 9000);
  const d = rollDamage(m.treatment, `menial:${tag}`);
  const p = generatePerson({ seed: `menial:${tag}`, week, quality: m.treatment === "harsh" ? -0.6 : m.treatment === "standard" ? -0.35 : -0.15 });
  // Take her from the idle ones first, else from a job.
  if (idle(m) < 1) { const job = (Object.keys(m.jobs) as (keyof typeof m.jobs)[]).find((j) => m.jobs[j] > 0); if (job) m.jobs[job]--; }
  m.owned--;

  p.name = `No. ${num}`;
  p.surname = undefined;
  p.origin.acquired_week = week;
  p.origin.acquired_how = "taken out of the menial pens";
  p.origin.background = `She was one of your menials, a number on a wrist, worked ${m.treatment === "harsh" ? "hard and used up" : m.treatment === "decent" ? "and fed, but never anybody" : "like the rest"} until you took her out.`;
  p.economics.price_paid = 0;
  p.status = "owned";
  p.clothes = d.doll ? "a fuckdoll suit" : "no clothing";

  // The body.
  if (d.arms < 2) p.body.arms = d.arms;
  if (d.legs < 2) p.body.legs = d.legs;
  if (!d.tongue) { p.body.tongue = false; if (p.body.voice) p.body.voice_before = p.body.voice; p.body.voice = 0; }
  if (d.arms < 2) p.body.marks.push({ kind: "scar", where: "shoulders", what: "amputation scars", week });
  if (d.legs < 2) p.body.marks.push({ kind: "scar", where: "hips", what: "amputation scars", week });
  p.body.marks.push({ kind: "brand", where: "left wrist", what: `the number ${num}`, week });
  p.health.health = clamp(p.health.health - (m.treatment === "harsh" ? 45 : m.treatment === "standard" ? 25 : 10), -90, 100);
  p.health.attrition = clamp((p.health.attrition ?? 0) + (m.treatment === "harsh" ? 40 : 20), 0, 100);
  p.health.energy = clamp(p.health.energy - 30, 0, 100);

  // The mind: worn down to the floor of what she was born with.
  const ps = p.psyche;
  ps.capacity = clamp(ps.capacity_born - 2.5, -6, 6);
  if (d.mind === "broken") { ps.state = "broken"; ps.break_mode = d.doll || !d.tongue ? "dissociative" : "fawning"; ps.relaxation = -9; }
  else if (d.mind === "fracturing") { ps.state = "fracturing"; ps.relaxation = -7; }
  else ps.relaxation = -4;
  ps.mood = d.mind === "broken" ? "absent" : "braced";
  p.bond.fear = 80; p.bond.bond = 0; p.bond.hope = 2; p.bond.resentment = d.mind === "broken" ? 5 : 30;
  p.persona.core_traits = d.mind === "broken"
    ? ["goes where she's put and stays there", "doesn't react to her name, or any name", "flinches at a raised hand and at nothing at all"]
    : ["watches every hand in the room", "eats like someone will take it", "does what she's told before it's finished being said"];
  p.persona.speech_pattern = d.tongue ? "almost nothing, and only when made to" : "she can't speak";

  s.people[p.id] = p;
  const mem = (s.memory[p.id] = newMemory());
  remember(mem, { content: "the pens: the number on my wrist, the hose, the shifts, never anybody's", week, importance: 9, charge: "cold", core: true });
  if (d.arms < 2 || d.legs < 2) remember(mem, { content: "they took my arms and legs in the pens, so I'd be easier to keep", week, importance: 10, charge: "sharp", core: true });
  if (!d.tongue) remember(mem, { content: "they cut my tongue out so I'd stop making noise", week, importance: 10, charge: "sharp", core: true });
  if (d.doll) remember(mem, { content: "they sealed me in the suit and I stopped being a person in it", week, importance: 9, charge: "dull", core: true });
  refresh(p, mem);

  const what = [d.arms === 0 && d.legs === 0 ? "no arms and no legs" : d.arms === 0 ? "no arms" : d.legs === 0 ? "no legs" : d.legs === 1 ? "one leg" : "",
    !d.tongue ? "no tongue" : "", d.doll ? "sealed in a doll suit" : ""].filter(Boolean).join(", ");
  const mind = d.mind === "broken" ? "There's nobody home behind her eyes." : d.mind === "fracturing" ? "She's barely holding together." : "She's frightened, but she's still in there.";
  return { ok: true, id: p.id, text: `They bring you number ${num} from the pens${what ? `: ${what}` : ""}. ${mind} She's yours to name.` };
}
