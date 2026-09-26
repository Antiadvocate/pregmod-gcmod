/**
 * THE HOUSEHOLD, BETWEEN THEMSELVES — what your slaves do with each other when you're not there.
 *
 * engine/social.ts moves warmth, trust and attraction between them every week, but quietly. This
 * is where it shows: two or three things a week that happened between two of them, chosen from how
 * they feel about each other, who they are and where they work — a friend covering a shift, an old
 * hand teaching a new girl, a stolen dessert, a fight in the laundry, a quick fuck in the showers.
 * Each one moves the pair's edge, leaves a memory, and goes in the report. Now and then one comes
 * to you as an event you can settle, and you can play it out with both of them in the room.
 * None of this calls a model.
 */
import type { Person, PendingEvent, SaveState } from "./types";
import { clamp, shove } from "./psyche";
import { applyTreatment } from "./obedience";
import { remember } from "./memory";
import { getEdge, moveEdge, addRole, startRumor } from "./social";
import { registerEvents, type EventDef } from "./events";
import { rng, type Rng } from "./rng";

const adults = (s: SaveState) => Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18 && p.health.recovery_weeks === 0);
const warmth = (s: SaveState, a: Person, b: Person) => getEdge(s.edges, a.id, b.id)?.warmth ?? 0;
const attraction = (s: SaveState, a: Person, b: Person) => getEdge(s.edges, a.id, b.id)?.attraction ?? 0;
const fet = (p: Person, n: string) => p.persona.fetishes.find((f) => f.name === n)?.strength ?? 0;
const weeksHere = (s: SaveState, p: Person) => s.arcology.week - (p.origin.acquired_week ?? 0);

interface Incident {
  id: string;
  /** How likely, for this pair (a does it to or with b). 0 = can't. */
  w: (s: SaveState, a: Person, b: Person) => number;
  /** What happened, and what it did. Returns the report line. */
  run: (s: SaveState, a: Person, b: Person, r: Rng) => string;
}

const mem = (s: SaveState, p: Person, content: string, charge: "warm" | "cold" | "sharp" | "bright" | "dull", importance = 4) => {
  const m = s.memory[p.id];
  if (m) remember(m, { content, week: s.arcology.week, importance, charge, who: [] });
};
const both = (s: SaveState, a: Person, b: Person, d: { warmth?: number; trust?: number; attraction?: number }) => { moveEdge(s.edges, a.id, b.id, d); moveEdge(s.edges, b.id, a.id, d); };

const INCIDENTS: Incident[] = [
  { id: "cover", w: (s, a, b) => (warmth(s, a, b) > 20 ? 2 : 0),
    run: (s, a, b) => { both(s, a, b, { warmth: 3, trust: 3 }); mem(s, b, `${a.name} covered for me when I couldn't finish my work`, "warm"); return `${a.name} covered ${b.name}'s shift when ${b.name} couldn't get out of bed.`; } },
  { id: "hair", w: (s, a, b) => (warmth(s, a, b) > 10 ? 1.5 : 0.3),
    run: (s, a, b) => { both(s, a, b, { warmth: 2 }); shove(a.psyche, 0.2); shove(b.psyche, 0.2); return `${a.name} spent an evening braiding ${b.name}'s hair, and they talked until lights out.`; } },
  { id: "teach", w: (s, a, b) => (weeksHere(s, a) > 10 && weeksHere(s, b) < 6 && a.persona.conscience > 0.4 ? 3 : 0),
    run: (s, a, b) => { both(s, a, b, { warmth: 4, trust: 4 }); addRole(s.edges, b.id, a.id, "the one who showed her the ropes"); b.psyche.relaxation = clamp(b.psyche.relaxation + 0.5, -10, 10); mem(s, b, `${a.name} showed me how things work here, and what not to do`, "warm", 5); return `${a.name} took the new girl, ${b.name}, under her wing: where to stand, what not to say, which guards to avoid.`; } },
  { id: "comfort", w: (s, a, b) => (b.bond.weeks_since_cruelty <= 1 && warmth(s, a, b) > 0 ? 3 : 0),
    run: (s, a, b) => { both(s, a, b, { warmth: 4, trust: 2 }); b.psyche.relaxation = clamp(b.psyche.relaxation + 0.6, -10, 10); mem(s, b, `${a.name} held me after what you did`, "warm", 5); return `${a.name} sat up with ${b.name} after what happened to her this week, and held her until she slept.`; } },
  { id: "share_food", w: (s, a, b) => (a.persona.conscience > 0.5 && b.health.health < 10 ? 2 : 0.2),
    run: (s, a, b) => { both(s, a, b, { warmth: 2 }); return `${a.name} has been sneaking half her dinner to ${b.name}.`; } },
  { id: "confide", w: (s, a, b) => (getEdge(s.edges, a.id, b.id)?.trust ?? 0) > 20 ? 1.5 : 0,
    run: (s, a, b) => { both(s, a, b, { trust: 4 }); mem(s, b, `${a.name} told me about her life before`, "warm", 4); return `${a.name} told ${b.name} about her life before she was enslaved. ${b.name} hasn't told anyone.`; } },
  { id: "gossip", w: (s, a, b) => (warmth(s, a, b) > 5 ? 1.5 : 0.5),
    run: (s, a, b) => { both(s, a, b, { warmth: 1 }); startRumor(s, `${a.name} and ${b.name} have been laughing about the owner behind their back`, { from: a.id, salience: 3 }); return `${a.name} and ${b.name} were overheard doing impressions of you in the kitchen.`; } },
  { id: "steal", w: (s, a, b) => (warmth(s, a, b) < -10 ? 2 : a.persona.conscience < 0.3 ? 0.5 : 0),
    run: (s, a, b, r) => { const what = r.pick(["her dessert", "her good hairbrush", "the extra blanket", "her makeup", "her hidden sweets"]); moveEdge(s.edges, b.id, a.id, { warmth: -5, trust: -6 }); mem(s, b, `${a.name} stole ${what}`, "cold"); return `${a.name} stole ${what} from ${b.name}. Everyone knows, and nobody's saying.`; } },
  { id: "blame", w: (s, a, b) => (warmth(s, a, b) < -15 && a.persona.conscience < 0.5 ? 1.5 : 0),
    run: (s, a, b) => { moveEdge(s.edges, b.id, a.id, { warmth: -8, trust: -8 }); applyTreatment(b, { kind: "neglect", size: 1, why: `blamed for what ${a.name} did` }, s.arcology.week); mem(s, b, `${a.name} blamed me for her mistake`, "sharp", 5); return `${a.name} broke a vase and told the house steward it was ${b.name}.`; } },
  { id: "bully", w: (s, a, b) => (a.persona.conscience < 0.35 && b.bond.fear > a.bond.fear + 15 ? 2 : 0),
    run: (s, a, b) => { moveEdge(s.edges, a.id, b.id, { power: 6 }); moveEdge(s.edges, b.id, a.id, { warmth: -6 }); shove(b.psyche, -0.4); addRole(s.edges, a.id, b.id, "makes her do her chores"); return `${a.name} has been making ${b.name} do her chores, and ${b.name} does them.`; } },
  { id: "mock", w: (s, a, b) => (warmth(s, a, b) < -20 ? 2 : 0),
    run: (s, a, b) => { moveEdge(s.edges, b.id, a.id, { warmth: -4 }); shove(b.psyche, -0.3); return `${a.name} mocked ${b.name} in front of the others at dinner, and some of them laughed.`; } },
  { id: "compete", w: (s, a, b) => ((a.romance?.standing ?? "property") !== "property" && (b.romance?.standing ?? "property") !== "property" ? 2 : 0),
    run: (s, a, b) => { both(s, a, b, { warmth: -3 }); addRole(s.edges, a.id, b.id, "rival for the owner"); return `${a.name} and ${b.name} are competing for your attention, and it's getting obvious.`; } },
  { id: "flirt", w: (s, a, b) => (attraction(s, a, b) > 35 ? 2 : 0),
    run: (s, a, b) => { moveEdge(s.edges, a.id, b.id, { attraction: 2 }); moveEdge(s.edges, b.id, a.id, { attraction: 1, warmth: 1 }); return `${a.name} has been finding reasons to be wherever ${b.name} is.`; } },
  { id: "showers", w: (s, a, b) => (attraction(s, a, b) > 45 && attraction(s, b, a) > 30 ? 1.5 : 0),
    run: (s, a, b) => { both(s, a, b, { attraction: 3, warmth: 2 }); a.psyche.arousal = clamp((a.psyche.arousal ?? 0) - 20, 0, 100); b.psyche.arousal = clamp((b.psyche.arousal ?? 0) - 20, 0, 100); mem(s, a, `${b.name} and I in the showers`, "bright", 5); mem(s, b, `${a.name} and I in the showers`, "bright", 5); return `${a.name} and ${b.name} were caught fucking in the showers after lights out. The guard let them finish.`; } },
  { id: "practice", w: (s, a, b) => (fet(a, "dom") + fet(a, "sadist") > 40 && fet(b, "submissive") + fet(b, "masochist") > 40 ? 2 : 0),
    run: (s, a, b) => { both(s, a, b, { attraction: 3, warmth: 2 }); addRole(s.edges, a.id, b.id, "plays rough with her"); return `${a.name} has had ${b.name} on her knees in the dormitory most nights this week. They both seem happier for it.`; } },
  { id: "plot", w: (s, a, b) => (a.bond.resentment > 45 && b.bond.resentment > 40 && warmth(s, a, b) > 10 ? 2 : 0),
    run: (s, a, b) => { both(s, a, b, { trust: 5 }); a.bond.resentment = clamp(a.bond.resentment + 2, 0, 100); b.bond.resentment = clamp(b.bond.resentment + 2, 0, 100); addRole(s.edges, a.id, b.id, "conspirator"); return `${a.name} and ${b.name} have been whispering in corners. Security thinks they're planning something.`; } },
  { id: "fight", w: (s, a, b) => (warmth(s, a, b) < -25 ? 1.5 : 0),
    run: (s, a, b) => { both(s, a, b, { warmth: -6 }); a.health.health = clamp(a.health.health - 3, -100, 100); b.health.health = clamp(b.health.health - 5, -100, 100); return `${a.name} and ${b.name} got into a fight in the laundry. ${b.name} came off worse.`; } },
  { id: "sing", w: (s, a, b) => (a.skills?.entertainment > 40 ? 0.8 : 0.1),
    run: (s, a, b) => { both(s, a, b, { warmth: 1 }); shove(b.psyche, 0.2); return `${a.name} sang in the dormitory one night, and ${b.name} cried.`; } },
];

/** Settleable ones: these come to you. */
interface Dispute { id: string; when: (s: SaveState, a: Person, b: Person) => boolean; seed: (a: Person, b: Person) => string; options: { id: string; label: string; run: (s: SaveState, a: Person, b: Person) => string }[] }

const DISPUTES: Dispute[] = [
  { id: "hh_fight", when: (s, a, b) => warmth(s, a, b) < -30 && warmth(s, b, a) < -20,
    seed: (a, b) => `${a.name} and ${b.name} have come to blows again, in the atrium this time, in front of guests. ${b.name}'s lip is split and ${a.name} has a handful of her hair. They're both waiting to be told who started it.`,
    options: [
      { id: "both", label: "Punish them both", run: (s, a, b) => { for (const p of [a, b]) applyTreatment(p, { kind: "coercion", size: 4, why: "punished for fighting" }, s.arcology.week); return `You punish them both, the same. Neither thinks it's fair, and for once they agree on something.`; } },
      { id: "a", label: "Side with the first", run: (s, a, b) => { applyTreatment(b, { kind: "coercion", size: 5, why: `punished for fighting ${a.name}` }, s.arcology.week); applyTreatment(a, { kind: "recognition", size: 2, why: "you took her side" }, s.arcology.week); moveEdge(s.edges, b.id, a.id, { warmth: -8 }); moveEdge(s.edges, a.id, b.id, { power: 8 }); return `You side with ${a.name}. ${b.name} takes her punishment and doesn't look at either of you.`; } },
      { id: "b", label: "Side with the second", run: (s, a, b) => { applyTreatment(a, { kind: "coercion", size: 5, why: `punished for fighting ${b.name}` }, s.arcology.week); applyTreatment(b, { kind: "recognition", size: 2, why: "you took her side" }, s.arcology.week); moveEdge(s.edges, a.id, b.id, { warmth: -8 }); return `You side with ${b.name}. ${a.name} goes very quiet, which is worse than shouting.`; } },
      { id: "together", label: "Make them spend a night locked in together", run: (s, a, b) => { both(s, a, b, { warmth: 10, trust: 4 }); return `You lock them in a spare room overnight. It's loud for an hour, and then quiet. In the morning they come out together and won't say what happened.`; } },
    ] },
  { id: "hh_theft", when: (s, a, b) => warmth(s, b, a) < -10 && (getEdge(s.edges, b.id, a.id)?.trust ?? 0) < -10,
    seed: (a, b) => `${b.name} says ${a.name} has been stealing from her: food, clothes, a letter from home. ${a.name} says ${b.name} is lying to get her in trouble. They're both standing in front of you.`,
    options: [
      { id: "believe_b", label: "Believe the accuser", run: (s, a, b) => { applyTreatment(a, { kind: "coercion", size: 4, why: "punished for stealing" }, s.arcology.week); moveEdge(s.edges, a.id, b.id, { warmth: -10 }); return `You believe ${b.name}. ${a.name} is punished, and swears to anyone who'll listen that she didn't do it.`; } },
      { id: "believe_a", label: "Believe the accused", run: (s, a, b) => { applyTreatment(b, { kind: "coercion", size: 3, why: "punished for a false accusation" }, s.arcology.week); moveEdge(s.edges, b.id, a.id, { warmth: -8 }); return `You believe ${a.name}. ${b.name} is punished for lying, and hates ${a.name} for it.`; } },
      { id: "search", label: "Search both their things", run: (s, a, b) => { const guilty = a.persona.conscience < b.persona.conscience ? a : b; const other = guilty === a ? b : a; applyTreatment(guilty, { kind: "coercion", size: 4, why: "caught stealing" }, s.arcology.week); applyTreatment(other, { kind: "recognition", size: 2, why: "you found the truth" }, s.arcology.week); return `You have both their things searched. The letter turns up under ${guilty.name}'s mattress. ${other.name} gets it back.`; } },
    ] },
  { id: "hh_bully", when: (s, a, b) => (getEdge(s.edges, a.id, b.id)?.roles ?? []).includes("makes her do her chores"),
    seed: (a, b) => `The house steward tells you ${a.name} has had ${b.name} doing her chores for weeks, and taking her food when she says no. ${b.name} hasn't complained. She wouldn't dare.`,
    options: [
      { id: "stop", label: "Stop it", run: (s, a, b) => { applyTreatment(a, { kind: "coercion", size: 4, why: `made to stop bullying ${b.name}` }, s.arcology.week); applyTreatment(b, { kind: "kindness", size: 4, why: "you stopped the bullying" }, s.arcology.week); const e = getEdge(s.edges, a.id, b.id); if (e) e.roles = e.roles.filter((r) => r !== "makes her do her chores"); return `You put a stop to it. ${a.name} does her own chores again, loudly. ${b.name} eats a whole dinner for the first time in a month.`; } },
      { id: "order", label: "Leave it: it's how a household sorts itself", run: (s, a, b) => { shove(b.psyche, -0.6); return `You leave it. ${a.name} takes that as permission. ${b.name} takes it as an answer.`; } },
      { id: "reverse", label: "Put her victim in charge of her for a month", run: (s, a, b) => { const e = getEdge(s.edges, a.id, b.id); if (e) e.roles = e.roles.filter((r) => r !== "makes her do her chores"); addRole(s.edges, b.id, a.id, "was put in charge of her"); moveEdge(s.edges, b.id, a.id, { power: 20 }); shove(b.psyche, 0.8); applyTreatment(a, { kind: "coercion", size: 3, why: `put under ${b.name}` }, s.arcology.week); return `You put ${b.name} in charge of ${a.name} for a month. ${b.name} doesn't know what to do with it for three days, and then she does.`; } },
    ] },
  { id: "hh_caught", when: (s, a, b) => attraction(s, a, b) > 45 && attraction(s, b, a) > 30,
    seed: (a, b) => `You walk into the dormitory and find ${a.name} and ${b.name} together on ${a.name}'s bed, naked, too busy to hear the door.`,
    options: [
      { id: "leave", label: "Leave them to it", run: (s, a, b) => { both(s, a, b, { attraction: 4, warmth: 3 }); addRole(s.edges, a.id, b.id, "sleeps with her"); addRole(s.edges, b.id, a.id, "sleeps with her"); return `You close the door quietly. They find out you saw them the next morning, and neither of them can look at you all day.`; } },
      { id: "watch", label: "Stay and watch", run: (s, a, b) => { both(s, a, b, { attraction: 2 }); for (const p of [a, b]) p.psyche.arousal = clamp((p.psyche.arousal ?? 0) + 20, 0, 100); return `You pull up a chair. ${a.name} notices first and freezes; you tell them to carry on, and after a moment they do.`; } },
      { id: "forbid", label: "Forbid it", run: (s, a, b) => { for (const p of [a, b]) applyTreatment(p, { kind: "coercion", size: 3, why: "caught with another slave" }, s.arcology.week); both(s, a, b, { attraction: 3 }); return `You forbid it. They're put in separate dormitories. It doesn't stop them; it just makes them careful.`; } },
    ] },
  { id: "hh_room", when: (s, a, b) => warmth(s, a, b) > 45 && warmth(s, b, a) > 40,
    seed: (a, b) => `${a.name} and ${b.name} have asked, together, if they can share a room. ${a.name} does the talking. ${b.name} is holding her hand.`,
    options: [
      { id: "yes", label: "Let them", run: (s, a, b) => { both(s, a, b, { warmth: 5, trust: 3 }); for (const p of [a, b]) applyTreatment(p, { kind: "kindness", size: 3, why: "you let them share a room" }, s.arcology.week); addRole(s.edges, a.id, b.id, "shares her room"); addRole(s.edges, b.id, a.id, "shares her room"); return `You let them. They move their things that evening, and the dormitory is quieter for it.`; } },
      { id: "no", label: "Say no", run: (s, a, b) => { for (const p of [a, b]) p.bond.hope = clamp(p.bond.hope - 3, 0, 100); return `You say no. They go back to their own beds, and sneak across the dormitory at night instead.`; } },
    ] },
];

registerEvents(DISPUTES.map((d): EventDef => ({
  id: d.id, severity: "minor", endogenous: true, candidates: () => [], weight: () => 0,
  seed: () => "Two of your slaves need you to settle something.",
  options: d.options.map((o) => ({ id: o.id, label: o.label, resolve: (s, e, p) => {
    const b = e.other ? s.people[e.other] : undefined;
    if (!p || !b) return "By the time you get there, they've sorted it out between themselves, and neither of them will say how.";
    return o.run(s, p, b);
  } })),
})));

/** Weekly: two or three things happen between them, and sometimes one comes to you. */
export function tickHousehold(s: SaveState): string[] {
  const people = adults(s);
  if (people.length < 2) return [];
  const r = rng(`household:${s.story?.seed ?? s.arcology.name}:${s.arcology.week}`);
  const out: string[] = [];
  const used = new Set<string>();
  const want = Math.min(3, Math.max(1, Math.floor(people.length / 3)));
  for (let k = 0; k < want; k++) {
    const pool: { i: Incident; a: Person; b: Person; w: number }[] = [];
    for (const a of people) for (const b of people) {
      if (a.id === b.id || used.has(a.id) || used.has(b.id)) continue;
      for (const i of INCIDENTS) { const w = i.w(s, a, b); if (w > 0) pool.push({ i, a, b, w }); }
    }
    if (!pool.length) break;
    const pick = r.weighted(pool, (x) => x.w);
    used.add(pick.a.id); used.add(pick.b.id);
    out.push(pick.i.run(s, pick.a, pick.b, r));
  }

  // A dispute for you, at most one open, at most one every other week.
  if (!s.events.some((e) => e.kind.startsWith("hh_")) && s.arcology.week - (s.event_log?.["hh_any"] ?? -9) >= 2 && r.chance(0.5)) {
    const options: { d: Dispute; a: Person; b: Person }[] = [];
    for (const a of people) for (const b of people) if (a.id !== b.id) for (const d of DISPUTES) if (d.when(s, a, b)) options.push({ d, a, b });
    if (options.length) {
      const { d, a, b } = r.pick(options);
      const e: PendingEvent = {
        id: `e${s.arcology.week}-${d.id}-${a.id}`, kind: d.id, person: a.id, other: b.id, seed: d.seed(a, b),
        options: d.options.map((o) => ({ id: o.id, label: o.label })), week: s.arcology.week, severity: "minor",
      };
      s.events.push(e);
      (s.event_log ??= {})["hh_any"] = s.arcology.week;
    }
  }
  return out;
}

/** For her card: the two or three people in the household who matter to her, and how. */
export function othersBrief(s: SaveState, p: Person): string {
  const edges = s.edges.filter((e) => e.from === p.id && e.to !== "owner" && s.people[e.to]?.status === "owned" && (Math.abs(e.warmth) > 25 || e.attraction > 45 || e.roles.length));
  if (!edges.length) return "";
  const top = edges.sort((a, b) => Math.abs(b.warmth) + b.roles.length * 20 - (Math.abs(a.warmth) + a.roles.length * 20)).slice(0, 3);
  const word = (w: number) => (w > 60 ? "close to" : w > 25 ? "friendly with" : w < -50 ? "hates" : w < -25 ? "dislikes" : "knows");
  return `WITH THE OTHERS (when they're in the scene, they talk to and act on each other, not only on you): ${top.map((e) => `${word(e.warmth)} ${s.people[e.to].name}${e.roles.length ? ` (${e.roles.slice(-2).join(", ")})` : ""}${e.attraction > 45 ? ", wants her" : ""}`).join("; ")}.`;
}
