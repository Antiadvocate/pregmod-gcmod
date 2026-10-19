/**
 * ALIVE — the house going on around a scene, and people being people inside one.
 *
 * Three things, none of which asks the model for anything extra; each adds a line to a prompt
 * that was going out anyway.
 *
 *   TODAY       what she woke up with, read off the sim: sore from last night, still stung by what
 *               you said on Tuesday, at odds with the woman she shares a room with, horny and no
 *               use to anyone. It colours her whole day whether or not you caused it.
 *   SOMEONE     scenes aren't sealed rooms. Now and then somebody walks in, and the game picks who
 *               and why from what is actually going on: a request she's been waiting to make, the
 *               woman she's been fighting with, her job, the one who owns you looking for you.
 *   MISREAD     now and then she hears what you said wrong, more often when she's frightened, slow,
 *               worn out or wound up, and the scene plays the mix-up.
 */
import type { Person, SaveState } from "./types";
import { rng } from "./rng";
import { liveThreads } from "./threads";

const adult = (p: Person) => p.age >= 18;
const home = (s: SaveState, p: Person) =>
  (p.status === "owned" || p.status === "indentured" || s.player.owned_by === p.id) && !(p.governs && s.player.owned_by !== p.id) && p.health.recovery_weeks === 0;
const first = (p: Person) => p.name.split(" ")[0];
const clip = (t: string, n = 110) => (t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, "")}…` : t);

/* ── what she woke up with ──────────────────────────────────────────────────────────────────── */

/** One or two things she's carrying today, from what's true of her. Same all week. */
export function today(s: SaveState, p: Person): string {
  const week = s.arcology.week;
  if (p.today?.week === week) return p.today.text;
  const got: { w: number; t: string }[] = [];
  const add = (w: number, t: string) => got.push({ w, t });

  const hurt = p.health.injuries.filter((i) => !i.healed_week && week - i.week <= 2);
  if (hurt.length) add(4, `still sore from ${hurt[0].what}`);
  if (p.health.energy < 25) add(3, "exhausted, running on nothing");
  if (p.psyche.arousal > 70) add(3, "horny and distracted, and it's getting in the way of everything");
  if (p.womb.fetuses.length && p.womb.weeks > 24) add(2, "heavy with the baby and uncomfortable in every chair");
  const mem = (s.memory[p.id]?.episodic ?? []).filter((e) => week - e.week <= 1).sort((a, b) => b.importance - a.importance)[0];
  if (mem) {
    if (mem.charge === "sharp" || mem.charge === "cold") add(5, `still stung by this: ${clip(mem.content)}`);
    else if (mem.charge === "bright" || mem.charge === "warm") add(4, `still pleased about this: ${clip(mem.content)}`);
  }
  const foe = s.edges.filter((e) => e.from === p.id && e.warmth < -40).sort((a, b) => a.warmth - b.warmth)[0];
  const foeP = foe ? s.people[foe.to] : undefined;
  if (foeP && home(s, foeP)) add(3, `at odds with ${foeP.name}, and they've had words since`);
  const fond = s.edges.filter((e) => e.from === p.id && e.warmth > 60 && e.attraction > 40).sort((a, b) => b.attraction - a.attraction)[0];
  const fondP = fond ? s.people[fond.to] : undefined;
  if (fondP && home(s, fondP)) add(2, `thinking about ${fondP.name} more than she'd admit`);
  const talk = s.rumors.filter((r) => r.about === p.id && r.knowers.length >= 2 && week - r.week <= 2).sort((a, b) => b.salience - a.salience)[0];
  if (talk) add(3, `knows people are saying ${clip(talk.content, 90)}`);
  if (p.bond.fear > 60) add(2, "jumpy, waiting for the next thing to go wrong");

  const pick = got.sort((a, b) => b.w - a.w).slice(0, 2).map((x) => x.t);
  const text = pick.length ? pick.join("; and ") : "";
  p.today = { week, text };
  return text;
}

/* ── somebody walks in ──────────────────────────────────────────────────────────────────────── */

/** Who comes in, and why, or nothing. `key` makes it the same answer for the same beat. */
export function walkIn(s: SaveState, inScene: string[], key: string, chance = 0.1): { person: Person; why: string } | null {
  const r = rng(`walkin:${key}`);
  if (!r.chance(chance)) return null;
  const here = new Set(inScene);
  const pool: { p: Person; why: string; w: number }[] = [];
  const keeper = s.player.owned_by ? s.people[s.player.owned_by] : undefined;
  if (keeper && !here.has(keeper.id)) pool.push({ p: keeper, why: `she's come looking for you, and she doesn't knock`, w: 4 });
  for (const p of Object.values(s.people)) {
    if (here.has(p.id) || !adult(p) || !home(s, p) || p.id === keeper?.id) continue;
    const ask = (s.asks ?? []).find((a) => a.person === p.id);
    if (ask) { pool.push({ p, why: `she has something to ask you and she's been working up to it all day`, w: 3 }); continue; }
    const withSomeone = [...here].map((id) => ({ id, e: s.edges.find((e) => e.from === p.id && e.to === id) })).find((x) => x.e && (x.e.warmth > 55 || x.e.warmth < -40));
    if (withSomeone) {
      const other = s.people[withSomeone.id];
      pool.push({ p, why: withSomeone.e!.warmth > 55 ? `she's looking for ${other ? first(other) : "someone in here"}` : `she has a problem with ${other ? first(other) : "someone in here"} and picked now to bring it`, w: 2.5 });
      continue;
    }
    const thread = liveThreads(s).find((t) => Object.values(t.cast).includes(p.id));
    if (thread) { pool.push({ p, why: `it's to do with what's been going on with her lately`, w: 1.5 }); continue; }
    if (/servant|clean|serve/i.test(p.assignment)) { pool.push({ p, why: `she's come in to clean, and didn't know anyone was here`, w: 1.2 }); continue; }
    pool.push({ p, why: `she's looking for someone else`, w: 0.4 });
  }
  if (!pool.length) return null;
  const pick = r.weighted(pool, (x) => x.w);
  return { person: pick.p, why: pick.why };
}

/** The line for the writer. */
export function walkInLine(x: { person: Person; why: string }): string {
  return `SOMEONE WALKS IN: partway through this, ${x.person.name} comes in: ${x.why}. Write her coming in, what she sees, what she does about it, and what everyone already here does about her. The scene doesn't end because of it, and it isn't a disaster unless it should be.`;
}

/* ── she hears it wrong ─────────────────────────────────────────────────────────────────────── */

/** Whether she mishears or misreads what you just said. More likely when she's frightened, slow,
 *  wrung out or wound up; never twice running. */
export function misreads(s: SaveState, p: Person, said: string, key: string, last?: boolean): boolean {
  if (last || said.trim().split(/\s+/).length < 4) return false;
  const slow = { impaired: 0.12, slow: 0.07, average: 0.02, sharp: 0, brilliant: 0 }[p.persona.intelligence] ?? 0.02;
  const odds = 0.05 + slow + p.bond.fear / 1000 + (p.psyche.relaxation < -3 ? 0.05 : 0) + (p.psyche.arousal > 75 ? 0.04 : 0) + (p.health.energy < 25 ? 0.04 : 0);
  return rng(`misread:${key}`).chance(Math.min(0.25, odds));
}

export function misreadLine(p: Person): string {
  return `THIS TIME ${first(p).toUpperCase()} GETS IT WRONG: she mishears or misreads what the player just said (takes it too literally, hears something else, thinks it's about her when it isn't, or answers the question she thought she heard) and acts on her version for a moment. Then it gets cleared up, or it doesn't. Play it the way people actually get things wrong, with the awkwardness and the scramble to fix it.`;
}
