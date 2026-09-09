/**
 * THE INTERACTION — what an hour with her actually does.
 *
 * This is the core loop of the game and everything else is scaffolding around it. One entry point,
 * `resolveAct`, takes a person and a thing you are doing to her and returns what it did: to her
 * arousal, to her nervous system, to what she is carrying about you, to her skills, and to what
 * she now knows about herself. It also returns the DIRECTIVE — the block of law the narrator gets
 * so the prose on the page is the same event the numbers just recorded.
 *
 * THE CLAIM. An act is not an increment. The same hour lands three different ways:
 *
 *   · IT HITS HER FETISH. Arousal, relaxation and bond all move up together, resentment goes
 *     negative, and the fetish gets stronger — which is how a preference becomes a paraphilia over
 *     a long enough campaign.
 *   · IT HITS HER FLAW. She does it. She hates it. Resentment lands at three times the base and
 *     the nervous system takes a real hit — and if you keep going, the flaw WEARS, and somewhere on
 *     the other side of that is a woman with the matching quirk who asks for it. That road is the
 *     most expensive thing in the game and it is supposed to be.
 *   · IT HITS NEITHER. It is a Tuesday. She is somewhere else while it happens, and the record
 *     says so.
 *
 * Nothing here writes prose. It writes the facts the prose has to honour.
 */
import type { Person, SaveState } from "./types";
import { ACT_BY_ID, FETISH_BY_ID, FLAW_BY_ID, QUIRK_BY_ID, type ActDef } from "../data/intimacy";
import { clamp, shove, addState } from "./psyche";
import { applyTreatment, read } from "./obedience";
import { remember } from "./memory";
import { moveEdge } from "./social";

export interface ActOutcome {
  act: string;
  /** What her body did with it. */
  arousal: number;
  relaxation: number;
  /** Whether she got there. */
  finished: boolean;
  /** How it landed: the one word the UI colours by. */
  landing: "wanted" | "willing" | "endured" | "hated" | "nothing";
  /** Why it landed that way, in her terms, for the panel and for the narrator. */
  because: string;
  bond: number;
  resentment: number;
  /** Fetish or quirk discovered this time. */
  discovered?: string;
  /** A flaw that wore down, or converted. */
  converted?: string;
  /** True the first time this has ever been done to her. */
  first: boolean;
  /** Skills that moved. */
  trained: Record<string, number>;
  /** What she will carry, if anything. */
  memory?: string;
}

/** Can this even be done to this body? Returns the reason it cannot, or null. */
export function canDo(p: Person, act: ActDef): string | null {
  for (const need of act.needs ?? []) {
    switch (need) {
      case "mouth": if (p.body.voice === 0 && p.body.teeth === "removable") break; break;
      case "vagina": if (p.body.vagina === null) return "she has no cunt"; if (p.chastity.vagina) return "she is locked"; break;
      case "anus": if (p.chastity.anus) return "she is locked"; break;
      case "dick": if (p.body.dick === null || p.body.dick === 0) return "she has no cock"; if (p.chastity.penis) return "she is locked"; break;
      case "breasts": if (p.body.boobs < 200) return "there is nothing there to use"; break;
      case "milk": if (!p.body.lactation) return "she is not lactating"; break;
      case "balls": if (p.body.balls === null || p.body.balls === 0) return "she has nothing to empty"; break;
      case "feet": if (p.body.marks.some((m) => m.kind === "prosthetic" && /leg|foot|feet/i.test(m.where))) break;
        if (p.health.recovery_weeks > 2) return "she is not steady enough on them"; break;
      case "pregnant": if (!p.womb.fetuses.length) return "she is not carrying"; break;
      case "belly": if (p.body.belly < 4000) return "there is not enough of her yet"; break;
      case "nipples": if (p.body.nipples !== "fuckable") return "her nipples do not take anything"; break;
    }
  }
  if (p.health.recovery_weeks > 0 && act.group !== "tenderness") return "she is still in recovery";
  if (p.age < 18) return "she is a child";
  return null;
}

/** How strongly this act hits what she is into. −1 (her flaw) … +1 (her fetish). */
export function affinity(p: Person, act: ActDef): { score: number; why: string } {
  let score = 0;
  let why = "";

  const flaw = p.persona.flaw ? FLAW_BY_ID[p.persona.flaw.id] : undefined;
  if (flaw && act.tags.some((t) => flaw.hates.includes(t))) {
    // The flaw wears: a woman who has been made to do it two hundred times minds less than one who
    // has been made to do it twice, and that is the road to converting it.
    const worn = clamp((p.persona.flaw?.worn ?? 0) / 120, 0, 0.75);
    score -= 1 - worn;
    why = `${flaw.id} — ${flaw.note}`;
  }

  const quirk = p.persona.quirk ? QUIRK_BY_ID[p.persona.quirk.id] : undefined;
  if (quirk && (quirk.acts.includes("anything") || act.tags.some((t) => quirk.acts.includes(t)))) {
    score += 0.5;
    why = why || `${quirk.id} — ${quirk.note}`;
  }

  for (const f of p.persona.fetishes) {
    const def = FETISH_BY_ID[f.name];
    if (!def) continue;
    if (act.tags.some((t) => def.acts.includes(t)) || def.acts.includes(act.id)) {
      score += (f.strength / 100) * (p.persona.paraphilia === def.becomes ? 1.4 : 1);
      why = `${def.name} — ${def.note}`;
    }
  }

  // Tenderness lands on anyone who has any bond at all, and lands hardest on the ones who have been
  // given nothing. The engine's one soft spot, and it is deliberate.
  if (act.group === "tenderness") {
    score += clamp(0.25 + p.bond.bond / 200 + (p.bond.weeks_since_kindness > 6 ? 0.25 : 0), 0, 0.8);
    if (!why) why = "nobody has done anything like that for her in a long time";
  }

  return { score: clamp(score, -1.5, 1.5), why };
}

export function resolveAct(s: SaveState, p: Person, actId: string, opts?: { public?: boolean; withId?: string }): ActOutcome | { error: string } {
  const act = ACT_BY_ID[actId];
  if (!act) return { error: "no such act" };
  const blocked = canDo(p, act);
  if (blocked) return { error: blocked };

  const week = s.arcology.week;
  p.acts = p.acts ?? {};
  p.firsts = p.firsts ?? {};
  const done = p.acts[actId] ?? 0;
  const first = done === 0;
  if (first) p.firsts[actId] = week;
  p.acts[actId] = done + 1;

  const aff = affinity(p, act);
  const r = read(p, s.memory[p.id]);
  const willing = act.wants_devotion === undefined || r.devotion >= act.wants_devotion;

  // AROUSAL. Wanting it is most of it; a body that is already wound up needs less.
  const arousalDelta = Math.round(act.base.arousal * (1 + aff.score) * (1 + p.psyche.libido / 200));
  p.psyche.arousal = clamp(p.psyche.arousal + arousalDelta, 0, 100);

  // Getting there. An act that gives release does it; otherwise a body at the top can tip on its own.
  const finished = act.base.arousal < 0 || (p.psyche.arousal >= 95 && aff.score > 0.2);
  if (finished) {
    p.psyche.arousal = clamp(p.psyche.arousal - 60, 0, 100);
    shove(p.psyche, 0.8);
  }

  // THE NERVOUS SYSTEM. The base, bent by whether she wanted it, and doubled against her when it is
  // the thing she cannot stand.
  const relBase = act.base.relaxation;
  const rel = relBase >= 0
    ? relBase * (1 + Math.max(0, aff.score))
    : relBase * (aff.score < 0 ? 1 + Math.abs(aff.score) * 1.6 : Math.max(0.15, 1 - aff.score));
  const relaxation = shove(p.psyche, rel + (opts?.public ? -0.4 : 0));

  // WHAT SHE CARRIES. Bond and resentment move in opposite directions depending on the same score.
  const bond = act.base.bond + aff.score * 3 + (willing ? 0 : -1.5);
  const resent = Math.max(0, act.base.resentment * (aff.score < 0 ? 3 : aff.score > 0.5 ? 0 : 1) + (willing ? 0 : 2) + (opts?.public ? 2 : 0));
  p.bond.bond = clamp(p.bond.bond + bond * 0.6, -100, 100);
  p.bond.resentment = clamp(p.bond.resentment + resent * 0.7, 0, 100);
  if (bond > 1.5) { p.bond.weeks_since_kindness = 0; p.bond.hope = clamp(p.bond.hope + bond * 0.4, 0, 100); }
  if (resent > 5) p.bond.weeks_since_cruelty = 0;

  // SKILLS. She gets better at the thing she is made to do, whether or not she wants to be.
  const trained: Record<string, number> = {};
  for (const [k, rate] of Object.entries(act.trains ?? {})) {
    const key = k as keyof typeof p.skills;
    if (typeof p.skills[key] === "number") {
      const gain = rate * (1 + aff.score * 0.4);
      (p.skills[key] as number) = clamp((p.skills[key] as number) + gain, 0, 100);
      trained[k] = +gain.toFixed(1);
    }
  }

  // DISCOVERY. You find out what she is into by doing it to her and watching, which is the only way
  // anybody has ever found out.
  let discovered: string | undefined;
  for (const f of p.persona.fetishes) {
    const def = FETISH_BY_ID[f.name];
    if (!def || f.known) continue;
    if (act.tags.some((t) => def.acts.includes(t)) && f.strength >= 40) {
      f.known = true;
      discovered = `she is a ${def.name}, and now you know it`;
    }
  }
  if (!discovered && p.persona.quirk && !p.persona.quirk.known) {
    const q = QUIRK_BY_ID[p.persona.quirk.id];
    if (q && act.tags.some((t) => q.acts.includes(t))) {
      p.persona.quirk.known = true;
      discovered = `she is a ${p.persona.quirk.id}`;
    }
  }
  if (!discovered && p.persona.flaw && !p.persona.flaw.known && aff.score < -0.3) {
    p.persona.flaw.known = true;
    discovered = `she ${p.persona.flaw.id}, and you have just watched her prove it`;
  }

  // THE LONG ROAD. Keep doing the thing she cannot stand and the flaw wears; far enough down that
  // road and it flips into the quirk that is its mirror image.
  let converted: string | undefined;
  if (p.persona.flaw && aff.score < 0) {
    p.persona.flaw.worn = (p.persona.flaw.worn ?? 0) + 1;
    const def = FLAW_BY_ID[p.persona.flaw.id];
    if (def?.softens_to && p.persona.flaw.worn >= 120) {
      converted = `${p.persona.flaw.id} → ${def.softens_to}`;
      p.persona.quirk = { id: def.softens_to, known: true };
      delete p.persona.flaw;
      addState(p.psyche, `whatever she used to be about ${def.hates[0] ?? "it"}`, week);
    }
  }
  // And a fetish that is fed forever stops being a preference.
  for (const f of p.persona.fetishes) {
    if (aff.score <= 0.2) continue;
    const def = FETISH_BY_ID[f.name];
    if (!def?.becomes) continue;
    f.strength = clamp(f.strength + 0.6, 0, 130);
    if (f.strength >= 110 && p.persona.paraphilia !== def.becomes) {
      p.persona.paraphilia = def.becomes;
      converted = converted ?? `${def.name} → ${def.becomes}`;
    }
  }

  // HOW IT LANDED, in one word.
  const landing: ActOutcome["landing"] =
    aff.score > 0.55 ? "wanted" :
    aff.score < -0.4 ? "hated" :
    aff.score > 0.1 ? "willing" :
    resent > 3 ? "endured" : "nothing";

  // WHAT SHE WILL CARRY. A first is always worth remembering; the four hundredth almost never is.
  let memoryLine: string | undefined;
  const mem = s.memory[p.id];
  if (mem) {
    if (first) {
      memoryLine = `the first time — ${act.what}`;
      remember(mem, { content: memoryLine, week, importance: landing === "hated" ? 9 : 6, charge: landing === "hated" ? "sharp" : landing === "wanted" ? "bright" : "dull", core: landing === "hated" || landing === "wanted", where: s.scene.location });
    } else if (landing === "hated" || landing === "wanted" || act.group === "tenderness") {
      memoryLine = `${act.what}${landing === "hated" ? ", and she has not let go of it" : ""}`;
      remember(mem, { content: memoryLine, week, importance: landing === "hated" ? 7 : 5, charge: landing === "hated" ? "sharp" : "warm", where: s.scene.location });
    }
  }

  // The treatment ledger, so the same act shows up in the report and in her devotion for the right
  // reason rather than as an unexplained number.
  if (landing === "hated") applyTreatment(p, { kind: "cruelty", size: Math.min(8, 2 + resent / 3), why: act.what }, week);
  else if (act.group === "tenderness") applyTreatment(p, { kind: "kindness", size: 3, why: act.what }, week);
  else if (landing === "wanted") applyTreatment(p, { kind: "recognition", size: 2, why: `you gave her ${act.name.toLowerCase()}` }, week);

  moveEdge(s.edges, p.id, "owner", { warmth: bond, attraction: aff.score > 0.4 ? 2 : 0 });
  if (opts?.withId) moveEdge(s.edges, p.id, opts.withId, { warmth: landing === "hated" ? -3 : 1 });

  return {
    act: actId, arousal: arousalDelta, relaxation, finished, landing,
    because: aff.why || "nothing about it is particularly hers",
    bond: +bond.toFixed(2), resentment: +resent.toFixed(2),
    discovered, converted, first, trained, memory: memoryLine,
  };
}

/** THE DIRECTIVE — what the narrator is told, so the prose is the same event as the numbers.
 *
 *  This is deliberately blunt. A local model asked to write an explicit scene from a vague prompt
 *  writes around it; asked to write THIS act, on THIS body, landing THIS way, with the register
 *  named, it writes the scene. The last paragraph is the register instruction and it is the whole
 *  reason a local model is worth configuring for this game. */
export function actDirective(s: SaveState, p: Person, out: ActOutcome): string {
  const act = ACT_BY_ID[out.act];
  const lines: string[] = [];
  lines.push(`## WHAT IS HAPPENING`);
  lines.push(`${act.what.charAt(0).toUpperCase()}${act.what.slice(1)}. ${out.first ? "This is the first time this has ever been done to her." : `This has been done to her ${p.acts?.[out.act] ?? 1} times before.`}`);
  lines.push(``);
  lines.push(`## HOW IT LANDS ON HER — this is law, not a suggestion`);
  switch (out.landing) {
    case "wanted": lines.push(`SHE WANTS THIS. ${out.because}. Write her into it — she is not performing enthusiasm, she is having a good time and it shows in her body before it shows in anything she says.`); break;
    case "willing": lines.push(`She is fine with this. Not transported, not enduring it. Ordinary willingness, which is its own thing to write.`); break;
    case "endured": lines.push(`SHE IS ENDURING THIS. She does it, competently, and she is somewhere else while it happens. Do not write enthusiasm she does not have and do not write a struggle she is not putting up.`); break;
    case "hated": lines.push(`SHE HATES THIS. ${out.because}. She does it because of what she is, and it costs her. Write the cost — in the body, in what she does with her hands and her face, in what she says afterwards, if she says anything.`); break;
    default: lines.push(`This does nothing for her either way. She is present and she is not engaged, and the writing should be honest about that rather than filling it in.`); break;
  }
  lines.push(`Her body: ${p.psyche.arousal >= 70 ? "wound up and obvious about it" : p.psyche.arousal >= 35 ? "warming, slowly" : "not going anywhere near it on its own"}. ${out.finished ? "She gets there, and the engine has recorded that she did." : "She does not get off."}`);
  if (out.discovered) lines.push(`SOMETHING WAS FOUND OUT THIS TIME: ${out.discovered}. Show it happening — the moment it becomes obvious to the person watching.`);
  if (out.converted) lines.push(`SOMETHING IN HER CHANGED FOR GOOD: ${out.converted}.`);
  lines.push(``);
  lines.push(`## REGISTER`);
  lines.push(`This is an adult game about a legal slave economy and this scene is explicit. Write it explicitly. Name what is happening with the words the setting uses for it — cunt, cock, ass, tits, cum — not clinical terms and not euphemism. No fade to black, no cutting away at the door, no closing on a metaphor about the weather. No moralising about the arrangement, from you or from anybody in the room who does not have a character reason for it. The camera stays where it is until the thing is finished.`);
  lines.push(`What you may not do is state her interior. You write her body, her breath, her hands, what she says and how she says it. The lines above tell you what she feels; render it, never announce it.`);
  return lines.join("\n");
}

/** Everything you could do to her right now, with the reason each blocked one is blocked. */
export function availableActs(p: Person): { act: ActDef; blocked: string | null; affinity: number }[] {
  return Object.values(ACT_BY_ID).map((act) => ({
    act,
    blocked: canDo(p, act),
    affinity: affinity(p, act).score,
  }));
}
