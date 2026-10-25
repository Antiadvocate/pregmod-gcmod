/**
 * THE ORIGINAL'S EVENTS — one slave, one moment, a few things you can do about it.
 *
 * The original was full of small events about a single slave, each fired by what she was: the
 * arrogant one who won't kneel for guests, the devout one praying through her shift, the new one
 * crying at night, the one you walk in on in the shower who covers herself, the frightened one who
 * loves you anyway, the whore who turned a client away. Warp had a few; with a model on, they were
 * replaced by "what she wants this week", so the friction they carried went missing.
 *
 * These come back as their own stream: one or two a week, chosen from whoever they fit, never the
 * same woman for the same thing within two months. With a model the narrator rewrites each around
 * the real woman (engine/living's writeEvent); without one, these words stand. The first of them is
 * the one the rest of the friction leads to: she misbehaved this week (engine/compliance), and it's
 * on your desk until you deal with it.
 */
import type { PendingEvent, Person, SaveState } from "./types";
import { registerEvents, type EventDef } from "./events";
import { applyTreatment, read } from "./obedience";
import { clamp, shove } from "./psyche";
import { resolveAct } from "./intimacy";
import { lockUp } from "./governor";
import { obeys } from "./compliance";
import { rng } from "./rng";
import { betweenEvents, rulesOf } from "./houserules";
import { ACT_BY_ID } from "../data/intimacy";

const owned = (s: SaveState) => Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18 && s.player.owned_by !== p.id);
const others = (s: SaveState, p: Person) => owned(s).filter((o) => o.id !== p.id);
const first = (p: Person) => p.name.split(" ")[0];
const stanceOf = (s: SaveState, p: Person) => obeys(s, p).stance;
const flawOf = (p: Person) => p.persona.behavior?.flaw;
/** Do it to her, and say how it went. */
const act = (s: SaveState, p: Person, id: string): string => {
  const out = resolveAct(s, p, id);
  if ("error" in out) return "";
  return {
    wanted: "She loved every second of it, and didn't pretend otherwise.",
    willing: "She went along with it, and some of it she liked.",
    endured: "She endured it, and it was obvious that's all it was.",
    hated: "She hated every second, and she'll remember it.",
    nothing: "It did nothing for her either way, and she let it happen.",
  }[out.landing];
};
const usable = (p: Person, ...ids: string[]) => ids.find((id) => !!ACT_BY_ID[id] && (id !== "vaginal" || p.body.vagina !== null)) ?? "oral";

const def = (d: Omit<EventDef, "endogenous"> & { endogenous?: boolean }): EventDef => ({ endogenous: true, classic: true, ...d });

export const CLASSICS: EventDef[] = [
  def({
    id: "cl_discipline", severity: "notable",
    candidates: (s) => owned(s).filter((p) => p.misbehaved && s.arcology.week - p.misbehaved.week <= 1).map((person) => ({ person })),
    weight: () => 8,
    seed: (_s, c) => `${c.person!.name} ${c.person!.misbehaved!.what} this week. The household knows, and they're watching to see what you do about it.`,
    options: [
      { id: "private", label: "Punish her in private", note: "she learns; her flaw wears",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 5, why: `punished for what she did` }, s.arcology.week); shove(p!.psyche, -0.6, { hard: true }); return `You take ${first(p!)} somewhere quiet and make her understand. She doesn't do it again this week.`; } },
      { id: "public", label: "Punish her in front of the household", note: "everyone learns",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 7, why: `punished in front of everyone` }, s.arcology.week); shove(p!.psyche, -1, { hard: true }); for (const o of others(s, p!)) { o.bond.fear = clamp(o.bond.fear + 3, 0, 100); o.bond.indulged = Math.max(0, (o.bond.indulged ?? 0) - 10); } return `You have the household watch. ${first(p!)} is punished where every one of them can see it, and every one of them remembers it the next time they think about pushing you.`; } },
      { id: "cell", label: "Have the guards take her to a cell", note: "a week locked up",
        resolve: (s, _e, p) => { const line = lockUp(s, p!, "locked up for what she did"); for (const o of others(s, p!)) o.bond.indulged = Math.max(0, (o.bond.indulged ?? 0) - 5); return `The guards come for ${first(p!)} and she goes, one way or another. ${line}`; } },
      { id: "let", label: "Let it go", note: "she'll take it as permission",
        resolve: (s, _e, p) => { p!.bond.indulged = clamp((p!.bond.indulged ?? 0) + 15, 0, 100); for (const o of others(s, p!)) o.bond.indulged = clamp((o.bond.indulged ?? 0) + 5, 0, 100); return `You let it go. ${first(p!)} notices that nothing happened to her, and so does every other girl in the house.`; } },
    ],
  }),
  def({
    id: "cl_arrogant", severity: "minor",
    candidates: (s) => owned(s).filter((p) => flawOf(p) === "arrogant" && stanceOf(s, p) !== "hollow").map((person) => ({ person })),
    weight: () => 2.5,
    seed: (_s, c) => `${c.person!.name} won't kneel when your guests come in. She stands by the wall with her chin up, as if she's the one receiving them, and one of the guests laughs.`,
    options: [
      { id: "break", label: "Put her on her knees in front of them", note: "her pride breaks a little",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 6, why: "made to kneel in front of guests" }, s.arcology.week); const r = act(s, p!, usable(p!, "degradation", "oral")); return `You take her by the back of the neck and put her down where she belongs, and keep her there while your guests watch. ${r}`; } },
      { id: "serve", label: "Have her serve the guests, on her knees", note: "a lesson they enjoy",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 4, why: "made to serve the guests" }, s.arcology.week); s.arcology.rep += 60; return `${first(p!)} spends the evening on her knees with a tray, then without one. Your guests leave very happy. (+60 reputation)`; } },
      { id: "laugh", label: "Laugh it off", note: "she'll do it again",
        resolve: (_s, _e, p) => { p!.bond.indulged = clamp((p!.bond.indulged ?? 0) + 10, 0, 100); return `You laugh along with the guest. ${first(p!)} takes that as a win, and stands a little taller the next time guests come.`; } },
    ],
  }),
  def({
    id: "cl_devout", severity: "minor",
    candidates: (s) => owned(s).filter((p) => flawOf(p) === "devout").map((person) => ({ person })),
    weight: () => 2.5,
    seed: (_s, c) => `You find ${c.person!.name} on her knees by her bed, praying under her breath. She asks, without looking up, for God to forgive her for what she'll be made to do today.`,
    options: [
      { id: "forbid", label: "Forbid her prayers", note: "her faith wears",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 5, why: "her prayers were forbidden" }, s.arcology.week); return `You take the beads out of her hands and tell her who she answers to now. She doesn't argue. She cries.`; } },
      { id: "use", label: "Use her while she's on her knees", note: "",
        resolve: (s, _e, p) => { const r = act(s, p!, usable(p!, "oral", "throat")); return `She's already kneeling. You don't let her finish the prayer. ${r}`; } },
      { id: "pray", label: "Let her pray", note: "she'll be grateful",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 3, why: "let her pray" }, s.arcology.week); return `You leave her to her prayers. Later, in the corridor, she thanks you for it, very quietly, and doesn't meet your eye.`; } },
    ],
  }),
  def({
    id: "cl_liberated", severity: "notable",
    candidates: (s) => owned(s).filter((p) => flawOf(p) === "liberated" && others(s, p).length > 0).map((person) => ({ person })),
    weight: () => 2.5,
    seed: (s, c) => `${c.person!.name} has been telling the other girls they don't have to put up with this, that they're people and you can't own a person. ${others(s, c.person!).map(first).slice(0, 2).join(" and ")} have been listening.`,
    options: [
      { id: "public", label: "Make an example of her", note: "the others fall in line",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 7, why: "made an example of for preaching" }, s.arcology.week); for (const o of others(s, p!)) o.bond.fear = clamp(o.bond.fear + 4, 0, 100); return `You punish her where the others can see, and ask her afterwards, in front of them, whose she is. She answers.`; } },
      { id: "recant", label: "Make her take it back, in front of them", note: "humiliating",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 4, why: "made to recant" }, s.arcology.week); shove(p!.psyche, -0.8, { hard: true }); return `${first(p!)} stands in front of the household and says she was wrong, that she's property and glad of it. Her voice breaks halfway through.`; } },
      { id: "ignore", label: "Ignore it", note: "it spreads",
        resolve: (s, _e, p) => { for (const o of others(s, p!)) o.bond.resentment = clamp(o.bond.resentment + 3, 0, 100); return `You let her talk. The others keep listening, and a couple of them start looking at you differently.`; } },
    ],
  }),
  def({
    id: "cl_whore_refuses", severity: "notable",
    candidates: (s) => owned(s).filter((p) => (/whore|public servant/.test(p.assignment) || p.facility === "brothel") && ["resists", "fights", "reluctant"].includes(stanceOf(s, p))).map((person) => ({ person })),
    weight: () => 3,
    seed: (_s, c) => `A client is in your office, red in the face: ${c.person!.name} turned him away last night, after he'd paid, and told him exactly where he could put it.`,
    options: [
      { id: "watch", label: "Have her serve him now, while you watch", note: "she'll hate it",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 5, why: "made to serve the client she refused" }, s.arcology.week); const r = act(s, p!, usable(p!, "vaginal", "oral")); return `You send for her and have her give him what he paid for, there and then, with you in the chair across the room. ${r}`; } },
      { id: "refund", label: "Refund him, and punish her", note: "costs ¤500",
        resolve: (s, _e, p) => { s.arcology.cash -= 500; applyTreatment(p!, { kind: "coercion", size: 4, why: "punished for refusing a client" }, s.arcology.week); return `You refund him out of your own pocket, and then deal with ${first(p!)} yourself, so she knows what it cost. (−¤500)`; } },
      { id: "off", label: "Take her off the street", note: "",
        resolve: (s, _e, p) => { p!.assignment = "rest"; p!.facility = undefined; p!.bond.indulged = clamp((p!.bond.indulged ?? 0) + 10, 0, 100); s.arcology.rep = Math.max(0, s.arcology.rep - 40); return `You take her off the street. The client tells everyone your whores pick their customers. (−40 reputation)`; } },
    ],
  }),
  def({
    id: "cl_shower", severity: "minor",
    candidates: (s) => owned(s).filter((p) => ["resists", "fights", "reluctant"].includes(stanceOf(s, p))).map((person) => ({ person })),
    weight: () => 2,
    seed: (_s, c) => `You walk into the bathroom and find ${c.person!.name} in the shower. She sees you and turns to the wall, arms over herself, and doesn't move.`,
    options: [
      { id: "take", label: "Take her there, against the tiles", note: "she won't want it",
        resolve: (s, _e, p) => { const r = act(s, p!, usable(p!, "vaginal", "anal")); return `You step into the shower, clothes and all, and turn her around against the tiles. ${r}`; } },
      { id: "watch", label: "Make her finish showering while you watch", note: "",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 2, why: "made to shower while the owner watched" }, s.arcology.week); return `You lean on the sink and tell her to carry on, and to turn around. She does, slowly, red to the collarbones.`; } },
      { id: "leave", label: "Leave her be", note: "",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 1, why: "left alone in the shower" }, s.arcology.week); return `You leave her be. She stays under the water a long time after you've gone, and comes out pink and quiet.`; } },
    ],
  }),
  def({
    id: "cl_new_tears", severity: "minor",
    candidates: (s) => owned(s).filter((p) => p.economics.weeks_owned <= 4 && ["resists", "terrified", "reluctant", "fights"].includes(stanceOf(s, p))).map((person) => ({ person })),
    weight: () => 3,
    seed: (_s, c) => `${c.person!.name} has been crying every night since she got here. Tonight she's sitting up in bed when you look in, and she asks you, very quietly, why.`,
    options: [
      { id: "comfort", label: "Sit with her until she sleeps", note: "",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 5, why: "sat with her on a bad night" }, s.arcology.week); return `You sit on the edge of the bed until she stops. She doesn't understand why you did it, and she remembers it.`; } },
      { id: "truth", label: "Tell her the truth: she's yours now", note: "",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 3, why: "told what she is now" }, s.arcology.week); return `You tell her plainly what she is and what happens to slaves who make trouble. She stops crying where you can hear it.`; } },
      { id: "use", label: "Give her something else to think about", note: "",
        resolve: (s, _e, p) => { const r = act(s, p!, usable(p!, "vaginal", "oral")); return `You pull back her blanket and give her something else to cry about. ${r}`; } },
    ],
  }),
  def({
    id: "cl_bad_dream", severity: "minor",
    candidates: (s) => owned(s).filter((p) => p.bond.fear > 40 || p.psyche.relaxation < -3).map((person) => ({ person })),
    weight: () => 1.5,
    seed: (_s, c) => `${c.person!.name} wakes the dormitory screaming. When you get there she's sitting up, soaked in sweat, and won't say what she dreamed.`,
    options: [
      { id: "hold", label: "Hold her", note: "", resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 4, why: "held after a nightmare" }, s.arcology.week); shove(p!.psyche, 0.6); return `You hold her until she stops shaking. In the morning she can't look at you, and she stays close all day.`; } },
      { id: "bed", label: "Take her to your bed", note: "", resolve: (s, _e, p) => { const r = act(s, p!, "sleeping together"); return `You take her back to your bed and keep her there until morning. ${r}`; } },
      { id: "back", label: "Tell her to go back to sleep", note: "", resolve: (s, _e, p) => { applyTreatment(p!, { kind: "neglect", size: 2, why: "sent back to sleep after a nightmare" }, s.arcology.week); return `You tell her to be quiet and go back to sleep. She lies awake until morning.`; } },
    ],
  }),
  def({
    id: "cl_devoted_fearful", severity: "minor",
    candidates: (s) => owned(s).filter((p) => read(p).devotion > 40 && p.bond.fear > 40).map((person) => ({ person })),
    weight: () => 2,
    seed: (_s, c) => `${c.person!.name} brings you your coffee and her hands are shaking so badly it spills. She loves you, and she's terrified of you, and she can't tell which it is right now.`,
    options: [
      { id: "reassure", label: "Tell her she's safe with you", note: "", resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 5, why: "told she was safe" }, s.arcology.week); p!.bond.fear = clamp(p!.bond.fear - 8, 0, 100); return `You take the cup out of her hands and tell her she's safe with you. She doesn't quite believe it, and she wants to.`; } },
      { id: "keep", label: "Keep her afraid", note: "", resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 2, why: "kept afraid" }, s.arcology.week); return `You let the silence go on until she apologises for the coffee, twice. Then you let her go, and she runs.`; } },
      { id: "bed", label: "Take her to bed, gently", note: "", resolve: (s, _e, p) => { const r = act(s, p!, "slow"); return `You take her hand and lead her to your bed, slowly. ${r}`; } },
    ],
  }),
  def({
    id: "cl_desperate", severity: "minor",
    candidates: (s) => owned(s).filter((p) => p.psyche.arousal > 70 && rulesOf(s).release === "you" && read(p).devotion > 0).map((person) => ({ person })),
    weight: () => 2,
    seed: (_s, c) => `${c.person!.name} stops you in the corridor, flushed, pressing her thighs together. She isn't allowed to touch herself, and she's been wound up for days. She asks you, please, for permission. Or for you.`,
    options: [
      { id: "fuck", label: "Give her what she's asking for", note: "", resolve: (s, _e, p) => { const r = act(s, p!, usable(p!, "vaginal", "anal")); return `You take her into the nearest room and give her what she asked for. ${r}`; } },
      { id: "wait", label: "Make her wait", note: "", resolve: (s, _e, p) => { const r = act(s, p!, "teasing"); return `You tell her no, and then you make it a great deal worse. ${r}`; } },
      { id: "once", label: "Let her see to herself, this once", note: "", resolve: (s, _e, p) => { p!.psyche.arousal = clamp(p!.psyche.arousal - 50, 0, 100); applyTreatment(p!, { kind: "kindness", size: 2, why: "allowed to get off" }, s.arcology.week); return `You give her permission, this once. She thanks you three times and is gone down the corridor before you've finished the sentence.`; } },
    ],
  }),
  def({
    id: "cl_gluttonous", severity: "minor",
    candidates: (s) => owned(s).filter((p) => flawOf(p) === "gluttonous").map((person) => ({ person })),
    weight: () => 2,
    seed: (_s, c) => `The kitchen staff caught ${c.person!.name} in the pantry again, cheeks full, a cake half gone.`,
    options: [
      { id: "punish", label: "Punish her", note: "her flaw wears", resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 4, why: "caught stealing food" }, s.arcology.week); return `She's punished for it, and put on plain rations for a week while the kitchen staff watch her like hawks.`; } },
      { id: "stuff", label: "Make her eat all of it", note: "cruel", resolve: (s, _e, p) => { applyTreatment(p!, { kind: "cruelty", size: 4, why: "made to eat until she was sick" }, s.arcology.week); p!.health.health = clamp(p!.health.health - 3, -100, 100); return `You make her finish it, and the next one. She's sick in the morning.`; } },
      { id: "let", label: "Let her have it", note: "", resolve: (_s, _e, p) => { p!.bond.indulged = clamp((p!.bond.indulged ?? 0) + 8, 0, 100); p!.body.weight = clamp(p!.body.weight + 2, -100, 200); return `You tell the kitchen staff to let her have it. ${first(p!)} takes that as a promise, and the pantry knows it.`; } },
    ],
  }),
  def({
    id: "cl_mean_girls", severity: "minor",
    candidates: (s) => betweenEvents(s) && owned(s).length >= 3 ? owned(s).filter((p) => p.bond.fear > 30 || p.psyche.relaxation < -2).map((person) => ({ person })) : [],
    weight: () => 2,
    seed: (s, c) => `The other girls have turned on ${c.person!.name}: her food knocked off her tray, her bed wet when she gets to it, ${others(s, c.person!).map(first).slice(0, 2).join(" and ")} laughing about it where she can hear.`,
    options: [
      { id: "stop", label: "Stop it", note: "", resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 4, why: "you stopped the others" }, s.arcology.week); for (const o of others(s, p!)) applyTreatment(o, { kind: "coercion", size: 2, why: "told to leave her alone" }, s.arcology.week); return `You tell the household it stops. It stops, at least anywhere you can see it, and ${first(p!)} eats in peace for once.`; } },
      { id: "let", label: "Let them sort it out", note: "", resolve: (_s, _e, p) => { shove(p!.psyche, -0.8, { hard: true }); return `You let it run its course. ${first(p!)} learns exactly where she stands in the house, and it isn't anywhere good.`; } },
      { id: "join", label: "Join in", note: "", resolve: (s, _e, p) => { applyTreatment(p!, { kind: "cruelty", size: 4, why: "the owner joined in" }, s.arcology.week); const r = act(s, p!, "degradation"); return `You make it worse, and the others love you for it. ${r}`; } },
    ],
  }),
  def({
    id: "cl_mindbroken", severity: "minor",
    candidates: (s) => owned(s).filter((p) => p.psyche.state === "broken").map((person) => ({ person })),
    weight: () => 1.5,
    seed: (_s, c) => `${c.person!.name} is standing in the corridor in the morning, exactly where someone told her to wait last night. She's been there all night.`,
    options: [
      { id: "bed", label: "Put her to bed", note: "", resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 2, why: "put to bed" }, s.arcology.week); return `You walk her back to her bed and tell her to sleep. She lies down and is asleep before you reach the door.`; } },
      { id: "use", label: "Use her where she stands", note: "", resolve: (s, _e, p) => { const r = act(s, p!, usable(p!, "vaginal", "oral")); return `She doesn't react when you start, or when you finish, or after. ${r}`; } },
    ],
  }),
];

registerEvents(CLASSICS);

/** This week's one or two, by who they fit. Discipline first: what she did is on your desk. */
export function selectClassics(s: SaveState): PendingEvent[] {
  const week = s.arcology.week;
  const log = (s.event_log ??= {});
  const r = rng(`classics:${s.arcology.name}:${week}`);
  const waiting = new Set(s.events.map((e) => `${e.kind}:${e.person ?? ""}`));
  const pool: { d: EventDef; p: Person; w: number }[] = [];
  for (const d of CLASSICS) for (const c of d.candidates(s)) {
    const p = c.person;
    if (!p || waiting.has(`${d.id}:${p.id}`)) continue;
    if (week - (log[`${d.id}:${p.id}`] ?? -99) < (d.id === "cl_discipline" ? 1 : 8)) continue;
    pool.push({ d, p, w: d.weight(s, c) });
  }
  if (!pool.length) return [];
  const out: PendingEvent[] = [];
  const used = new Set<string>();
  // What she did is on your desk whatever else happens: up to two of those first, then the rest.
  const picks = pool.filter((x) => x.d.id === "cl_discipline").slice(0, 2);
  const want = 1 + (owned(s).length >= 4 && r.chance(0.5) ? 1 : 0);
  for (const x of picks) used.add(x.p.id);
  for (let k = 0; k < want; k++) {
    const left = pool.filter((x) => x.d.id !== "cl_discipline" && !used.has(x.p.id));
    if (!left.length) break;
    const pick = r.weighted(left, (x) => x.w);
    used.add(pick.p.id);
    picks.push(pick);
  }
  for (const pick of picks) {
    log[`${pick.d.id}:${pick.p.id}`] = week;
    out.push({
      id: `e${week}-${pick.d.id}-${pick.p.id}`, kind: pick.d.id, person: pick.p.id,
      seed: pick.d.seed(s, { person: pick.p }), options: pick.d.options.map((o) => ({ id: o.id, label: o.label, note: o.note || undefined })),
      week, severity: pick.d.severity,
    });
  }
  return out;
}
