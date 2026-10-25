/**
 * GOINGS-ON — what happens between people, that you can walk into.
 *
 * Every event with a model behind it was one woman wanting something from you: a request, a
 * complaint, a plea. Nothing happened between the women themselves, or between one of them and the
 * people she works among, except as a line in the weekly report ("Halyna stole the extra blanket"),
 * and with two or three women in the house most weeks brought nothing at all.
 *
 * Now, each week, the game looks for what's live between people: two of your women who are close,
 * or can't stand each other, or want each other, or one of whom has standing over the other; this
 * week's household incidents between them; one of yours and the people where she works (a boss at
 * the office, a regular at the brothel, a crowd on the concourse), or the people in her life outside
 * the house; and what she does with her own time when somebody else gets involved in it. One or two
 * of those become an event, written by the model from the facts, that you come across or hear about
 * and can get involved in: take a side, join in, use it, stop it, or leave them to it. An outsider
 * the model names is put on file and tied to her, so they can come back.
 *
 * As with every generated event, the model writes the situation and the wording; what the choices
 * DO comes from the closed table in engine/dynamic, landing on whichever of the women it names.
 */
import type { PendingEvent, Person, SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { coarsen, REGISTER_TAIL } from "./register";
import { HOUSE_STYLE, personCard } from "./prompts";
import { PLAIN_RULES } from "./style";
import { chronicleBrief } from "./chronicle";
import { DYNAMIC_EFFECTS, PAIR_EFFECTS, effectList } from "./dynamic";
import { ACT_BY_ID } from "../data/intimacy";
import { getEdge } from "./social";
import { latitudeOf } from "./voice";
import { romanceOf } from "./romance";
import { workplaceOf, inPlace } from "./whereabouts";
import { tiedTo, file, tie, note } from "./others";
import { castBrief } from "./faces";
import { rng } from "./rng";

export interface Going {
  /** Cooldown key: the same pair, or the same woman and the same kind, sits out a few weeks. */
  key: string;
  kind: "between" | "outside" | "pursuit";
  main: Person;
  other?: Person;
  /** What the game knows that makes it live now. */
  facts: string[];
  weight: number;
}

const COOLDOWN = 3;

const household = (s: SaveState) => Object.values(s.people).filter((p) =>
  (p.status === "owned" || p.status === "indentured") && p.age >= 18 && !p.governs && p.psyche.state !== "broken" && !(p.health.recovery_weeks > 0));

function feeling(s: SaveState, a: Person, b: Person): string {
  const e = getEdge(s.edges, a.id, b.id);
  if (!e) return "";
  const w = e.warmth, t = e.trust, at = e.attraction;
  const bits = [
    w > 40 ? "close to her" : w > 15 ? "friendly with her" : w < -30 ? "can't stand her" : w < -10 ? "cool toward her" : "",
    t < -20 ? "doesn't trust her" : t > 40 ? "trusts her" : "",
    at > 50 ? "wants her" : at > 30 ? "is drawn to her" : "",
    e.roles.length ? `(${e.roles.join(", ")})` : "",
  ].filter(Boolean);
  return bits.length ? `${a.name} toward ${b.name}: ${bits.join(", ")}.` : "";
}

function job(s: SaveState, p: Person): string {
  const w = workplaceOf(s, p);
  return w.withYou ? `her place is with the owner (${p.assignment})` : `she works ${inPlace(w.name)} (${p.assignment})`;
}

/** Everything live between people this week. */
export function goingsCandidates(s: SaveState): Going[] {
  const week = s.arcology.week;
  const people = household(s);
  const out: Going[] = [];
  const report = s.reports.at(-1);
  const lines = report && report.week >= week - 1 ? report.lines.map((l) => l.text) : [];
  const first = (p: Person) => p.name.split(" ")[0];

  // Two of yours.
  for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) {
    const a = people[i], b = people[j];
    const ea = getEdge(s.edges, a.id, b.id), eb = getEdge(s.edges, b.id, a.id);
    const facts: string[] = [feeling(s, a, b), feeling(s, b, a)].filter(Boolean);
    let w = 1 + (Math.abs(ea?.warmth ?? 0) + Math.abs(eb?.warmth ?? 0)) / 50 + Math.max(ea?.attraction ?? 0, eb?.attraction ?? 0) / 50;
    const happened = lines.filter((l) => l.includes(first(a)) && l.includes(first(b))).slice(0, 2);
    if (happened.length) { facts.push(...happened.map((l) => `This week: ${l}`)); w += 2.5; }
    const recent = [a, b].flatMap((x) => (s.memory[x.id]?.episodic ?? []).filter((m) => week - m.week <= 3 && m.content.includes(first(x === a ? b : a))).slice(-1).map((m) => `${x.name} remembers, from week ${m.week}: ${m.content}`));
    if (recent.length) { facts.push(...recent); w += 1.2; }
    for (const [x, y] of [[a, b], [b, a]] as const) for (const m of x.manner ?? []) if (m.id === y.id || m.toward.includes(first(y))) { facts.push(`How ${x.name} is with ${y.name}: ${m.how}`); w += 0.8; }
    const la = latitudeOf(a), lb = latitudeOf(b);
    if (la !== lb) { const [hi, lo] = la === "free" || (la === "latitude" && lb === "slave") ? [a, b] : [b, a]; facts.push(`${hi.name} has more standing with the owner than ${lo.name} (${romanceOf(hi).standing} against ${romanceOf(lo).standing}), and both of them know it.`); w += 1; }
    if (a.assignment === b.assignment || (a.facility && a.facility === b.facility)) { facts.push(`They work together: ${job(s, a)}.`); w += 0.8; }
    facts.push(`${a.name}: ${job(s, a)}. ${b.name}: ${job(s, b)}.`);
    out.push({ key: `pair:${[a.id, b.id].sort().join(":")}`, kind: "between", main: a, other: b, facts, weight: w });
  }

  for (const p of people) {
    // One of yours and the people around her at work, or in her life outside.
    const where = workplaceOf(s, p);
    const ties = tiedTo(s, p.id).filter((t) => !t.face.fate);
    const talk = s.rumors.filter((r) => r.about === p.id && r.week >= week - 2).slice(0, 1);
    const facts = [
      where.withYou ? `Her place is with the owner (${p.assignment}); the people around her are the owner's guests, staff and visitors.` : `She works ${inPlace(where.name)}: ${where.look}. The people there: whoever works or comes there.`,
      ...ties.slice(0, 3).map((t) => `In her life outside the house: ${t.face.name}, ${t.what}.`),
      ...talk.map((r) => `People are saying: ${r.content}`),
    ];
    let w = 1.2 + (where.privacy === "public" ? 1.6 : where.withYou ? 0 : 0.6) + Math.min(1.5, ties.length * 0.8) + (talk.length ? 1 : 0);
    if (/cellblock|confined/.test(p.assignment ?? "")) w = 0;
    if (w > 0) out.push({ key: `out:${p.id}`, kind: "outside", main: p, facts, weight: w });

    // What she does with her own time, when someone else gets mixed up in it.
    const does = p.persona.interests ?? [], wants = p.persona.goals ?? [];
    if (does.length || wants.length) out.push({
      key: `own:${p.id}`, kind: "pursuit", main: p, weight: 1 + (wants.length ? 0.4 : 0),
      facts: [
        does.length ? `What she does with her own time: ${does.join("; ")}.` : "",
        wants.length ? `What she wants in the long run: ${wants.join("; ")}.` : "",
        "Someone else gets involved in it this week: another of the owner's women, someone where she works, or a citizen.",
      ].filter(Boolean),
    });
  }
  return out;
}

/** This week's one or two, by how live they are, nobody's twice and nothing that came up lately. */
export function pickGoings(s: SaveState): Going[] {
  const week = s.arcology.week;
  const log = s.event_log ?? {};
  const pool = goingsCandidates(s).filter((g) => week - (log[`going:${g.key}`] ?? -99) >= COOLDOWN);
  if (!pool.length) return [];
  const r = rng(`goings:${s.arcology.name}:${week}`);
  const busy = new Set(s.events.filter((e) => e.week === week).flatMap((e) => [e.person, e.other]).filter(Boolean));
  const want = 1 + (household(s).length >= 3 || r.chance(0.5) ? 1 : 0);
  const out: Going[] = [];
  const used = new Set<string>();
  for (let k = 0; k < want; k++) {
    const left = pool.filter((g) => !used.has(g.main.id) && !(g.other && used.has(g.other.id)) && !out.includes(g));
    if (!left.length) break;
    // Someone already in an event this week can still be in one, but less likely.
    const g = r.weighted(left, (x) => x.weight * (busy.has(x.main.id) ? 0.4 : 1));
    out.push(g);
    used.add(g.main.id);
    if (g.other) used.add(g.other.id);
  }
  return out;
}

const GOING_SYSTEM = `You write one event for Free Cities, an adult text game about owning an arcology where slavery is legal and ordinary. It is NOT one of the owner's slaves wanting something from the owner. It is something going on between people (two of the owner's slaves, or one of them and someone outside the household: a customer, a coworker, her boss, a citizen, a guard, somebody else's slave, someone from her life before) that the owner comes across, walks in on or hears about, and can get involved in.

How to build it:
- Start from THE FACTS: they are true, and they're why it's happening now. Build it out of them, the people's natures, how they feel about each other, where they are, and this week.
- It happens somewhere real: where she works, somewhere in the house, on the concourse. Say where.
- This is an adult game and sex is most of what happens between people in it. Something is actually happening, with a shape, and more often than not it's sexual: two of the girls fucking in the showers or the laundry, one using the other, one teaching the other how to suck cock, a customer who won't pay or gets rough, a coworker or her boss with his hands on her, a crowd gathering to watch, a client who wants her for a whole night, a rival making her crawl, a crush turning into her mouth between someone's legs. It can also be a quarrel, a favour, a deal, a debt, a secret found out or a competition, but it doesn't have to stay clean. Their fetishes, bodies and what they're into (on their cards) decide what it is. Write the sex as plainly as the rest. Not a mood and not a status report.
- People act as their place allows: a slave is a slave to the owner (THE POWER BETWEEN YOU on her card), and outsiders know who the owner is.
- An outsider in it who has no name yet gets a name and one detail, and goes under "cast".
- Second person, present tense, one or two short paragraphs, ending where the owner can step in. Their words in their own voices, short and plain.

Then three or four choices for the owner, really different: two ways of getting involved (join in, take one of them, make them do it in front of you, take a side, use it, put a stop to it, make it worse), and when it's sexual at least one of those is the owner getting in on it (effect "act" with an act id, "on" the one he takes, or "both"), and at least one choice that leaves them to it. Each choice has an effect from EFFECT IDS and "on": "main" (the first of the owner's women in THE PEOPLE), "other" (the second, if there is one) or "both". The effects that are about the two of them together land on both whatever "on" says.

${HOUSE_STYLE}

Output ONE strict JSON object and nothing else:
{"title":"2-5 words","situation":"...","options":[{"label":"what you do, 2-9 words","note":"a few plain words for the player, like \\"she won't forget it\\"; never the effect's description","effect":"effect id","on":"main","value":"optional"}],"hook":"what this leaves open for later, or empty","cast":[{"name":"...","pronoun":"she or he","what":"who they are, a few words","to_her":"what they are to her, a few words"}]}`;

/** Write one of them. Null when there's no model or it came back unusable. */
export async function generateGoing(s: SaveState, g: Going, snapshot = ""): Promise<PendingEvent | null> {
  if (!modelsAvailable() || s.models.lean_mode) return null;
  const pair = Object.keys(PAIR_EFFECTS).map((k) => `${k}: ${PAIR_EFFECTS[k].note}`);
  const people = [g.main, g.other].filter((x): x is Person => !!x);
  const res = await call({
    system: GOING_SYSTEM,
    user: [
      snapshot,
      `## THE PEOPLE\n${people.map((p, i) => `### ${i === 0 ? "MAIN" : "OTHER"}\n${personCard(s, p, g.facts.join(" "))}`).join("\n\n")}`,
      castBrief(s, g.facts.join("\n")),
      chronicleBrief(s, people.map((p) => p.id), 6),
      `## THE FACTS\n${g.facts.map((f) => `· ${f}`).join("\n")}`,
      `## EFFECT IDS\n${effectList()}${g.other ? `\n${pair.join("\n")}` : ""}\nACT IDS (for "act"): ${Object.keys(ACT_BY_ID).join(", ")}`,
      PLAIN_RULES,
      REGISTER_TAIL,
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 1400,
    temperature: 0.95,
  });
  if (!res.ok) return null;
  const out = parseJson<{ title?: string; situation?: string; hook?: string; options?: { label?: string; note?: string; effect?: string; on?: string; value?: string | number }[]; cast?: { name?: string; pronoun?: string; what?: string; to_her?: string }[] }>(coarsen(res.text));
  if (!out?.situation || !Array.isArray(out.options)) return null;
  const known = (id: string) => !!DYNAMIC_EFFECTS[id] || (!!g.other && !!PAIR_EFFECTS[id]);
  const on = (x?: string) => (g.other && (x === "other" || x === "both") ? x : "main");
  const options = out.options.filter((o) => o?.label && o.effect && known(String(o.effect))).slice(0, 4)
    .map((o, i) => ({ id: `g${i}:${o.effect}@${on(o.on)}:${String(o.value ?? "").replace(/:/g, " ")}`, label: String(o.label).slice(0, 80), note: o.note ? String(o.note).slice(0, 90) : undefined }));
  if (options.length < 2) return null;

  const week = s.arcology.week;
  const situation = String(out.situation).slice(0, 2400);
  // Whoever the model brought in goes on file, tied to her, so they can turn up again.
  for (const c of (Array.isArray(out.cast) ? out.cast : []).slice(0, 2)) {
    const name = String(c?.name ?? "").trim();
    if (!name || people.some((p) => p.name.split(" ")[0] === name.split(" ")[0])) continue;
    const f = file(s, name.slice(0, 48), String(c.what ?? "").slice(0, 80) || "someone she knows", c.pronoun === "he" ? "he" : "she");
    if (c.to_her) tie(f, String(c.to_her), g.main.id);
    note(s, f, `week ${week}: ${situation.split(/\n/)[0].slice(0, 200)}`);
  }
  (s.event_log ??= {})[`going:${g.key}`] = week;
  return {
    id: `going-${week}-${g.main.id}${g.other ? `-${g.other.id}` : ""}`,
    kind: "dynamic",
    person: g.main.id,
    other: g.other?.id,
    seed: situation,
    options,
    week,
    severity: "notable",
    written: { model: res.model, title: out.title ? String(out.title).slice(0, 60) : undefined },
    hook: out.hook ? String(out.hook).slice(0, 200) : undefined,
  };
}
