/**
 * THE PROMPT IS A COMPILED STATE DOCUMENT, NOT A TRANSCRIPT.
 *
 * This is the single most important structural idea carried over from Weft, and it is what makes
 * an arcology with forty people in it fit in a context window at all. The narrator is not handed
 * the conversation so far; it is handed a document rebuilt from world state every turn: who is in
 * the room, what their bodies are doing, what they remember that this moment is about, what the
 * arcology's doctrine has made normal, and what is forbidden. Continuity does not come from the
 * model remembering — it comes from the digest.
 *
 * Two consequences worth knowing. First, cost is bounded by the CAST IN THE ROOM rather than by
 * how long you have played: turn 400 costs what turn 4 costs. Second, everything the model is told
 * is something the engine can be held to — if the prose contradicts the card, the card is right and
 * the guards in turn.ts say so.
 */
import type { Person, SaveState } from "./types";
import { band } from "./psyche";
import { describeGenitals, describeFeet } from "./genitals";
import { read } from "./obedience";
import { recall } from "./memory";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { threadBrief } from "./threads";
import { getEdge } from "./social";
import { describeYou } from "./you";

/**
 * HOW THE GAME WRITES. Shared by every prompt that puts words on the page, so the narrator, the
 * asks, the asides and the generated events all sound like the same game — the original one.
 */
export const HOUSE_STYLE = `HOW FREE CITIES WRITES. Match the original game's voice. It is second person and present tense, addressed to the player as "you". It is plain, direct, matter-of-fact and a little dry, and it is explicit: it says who does what to whom with which body part, using ordinary crude words (cock, pussy, ass, tits, cum, fuck) and never a metaphor in their place. It states what a slave thinks and feels whenever that matters ("She's nervous, but she's glad you asked"; "She clearly hates it"; "She's too tired to argue"). Slaves call the player Master or Mistress unless their card says otherwise. Sentences are ordinary sentences a person would write, of ordinary length.

Examples of the voice:
- "You tell her she'll be sleeping in your bed tonight. She's surprised, and a little suspicious, but she strips and climbs in beside you without being told twice."
- "She lies stiffly at the very edge of the mattress for the first hour, but exhaustion wins, and by morning she has rolled against you with her face in your shoulder."
- "You bend her over the desk and push into her ass. She's tight and not very happy about it, and she grunts every time you bottom out."

NEVER WRITE LIKE THIS:
- Aphorisms, maxims or lines that sound wise or ominous: "Not like this." "It is not an accident." "Some things don't need saying." "Almost."
- Filler body language that carries no information: breath catching, throats moving, fingers tapping, weight shifting, shoulders settling, jaws tightening, eyes going somewhere, a rhythm faltering. Mention a gesture only when it is part of the action or tells the reader something the words don't.
- Similes and mood-setting about light, air, weather, the city or the view. Name the room and get on with it.
- A sentence that restates the one before it, or a closing line that sums up, hints at what's coming, or lands on a single word or fragment.
- "Not X, but Y" / "not quite a question" / "just enough to" hedges.`;

export const NARRATOR_SYSTEM = `You write the scenes for Free Cities, an adult text game about owning an arcology, a private city-state where slavery is legal and ordinary. The player is the owner. They choose an action; you write that action happening.

${HOUSE_STYLE}

THE RULES.
1. WRITE THE ACTION THE PLAYER CHOSE, ALL THE WAY THROUGH. The chosen action is the whole scene. If they let her sleep in their bed, write her getting into the bed, what she wears, how she lies, whether she sleeps, what happens in the night and how she is in the morning. If they fuck her, write the fucking from start to finish. Every paragraph is about the action. A reader must be able to tell exactly what was done from your text alone.
2. SAY HOW SHE TAKES IT. Use her card (devotion, trust, fetishes, flaws, how she is doing) to decide what she thinks and feels about it, and say so plainly, the way the game does.
3. THE CARD IS FACT. Her body, age, history, voice and condition cannot be contradicted. If she is mute she does not speak. If she is nineteen weeks pregnant, she is.
4. ONLY THE PEOPLE THE ACTION INVOLVES. Others listed as present get a sentence only if they take part or it matters to the action; otherwise leave them out. Nobody who is not listed as present appears.
5. DO NOT WRITE THE PLAYER'S FEELINGS OR DECISIONS beyond what they typed.
6. Two to four paragraphs. Dialogue sounds like the person saying it and is about the thing in front of them. Do not moralize, do not sanitize, do not fade to black.`;

export const BOOKKEEPER_SYSTEM = `You are the Bookkeeper of an arcology engine. Read the turn (the owner's action and the narrator's prose) and record ONLY what changed, as one strict JSON object. The prose is the source of truth for what happened; the world state given to you is the source of truth for what is possible.

Rules that override everything: a person who speaks or acts in the prose is present and is never recorded as having left. Never invent a person, a place, or a fact the prose did not put on the page. If nothing changed, return the empty fields — a small honest diff is correct and a padded one is not.

Shape:
{
 "summary": "one sentence, past tense, what happened",
 "minutes": 15,
 "location": "where the owner is now, if it changed",
 "present_add": ["person id"], "present_remove": ["person id"],
 "psyche": [{"id":"p1","relaxation_delta":-1.5,"mood":"braced","states_add":["fear of being sent back"],"states_remove":[]}],
 "treatment": [{"id":"p1","kind":"kindness|cruelty|coercion|promise_kept|promise_broken|neglect|recognition","size":1-10,"why":"short"}],
 "memories": [{"id":"p1","content":"what she will carry, in her terms","importance":1-10,"charge":"warm|cold|sharp|dull|bright","core":false}],
 "edges": [{"from":"p1","to":"p2","warmth_delta":5,"trust_delta":0,"attraction_delta":0,"note":"","roles_add":[]}],
 "facts_learned": [{"id":"p1","fact":"what she now knows"}],
 "body": [{"id":"p1","field":"appearance_now|clothes|collar","value":"..."}],
 "rumors": [{"content":"...","truth":"true|distorted|false","from":"p1"}],
 "canon_add": ["only genuinely world-scale facts; usually empty"]
}
Every id must be one given to you. Omit any key you have nothing for.`;

/** How she is holding up, in the words the game would use. */
export function condition(p: Person): string {
  switch (band(p.psyche)) {
    case "broken": return "mindbroken in all but name; she does what she's told and nobody is behind it";
    case "fracturing": return "falling apart under the strain";
    case "clenched": return "badly stressed and scared";
    case "braced": return "tense and on guard";
    case "guarded": return "a little wary";
    case "settled": return "comfortable";
    default: return "happy and relaxed";
  }
}

/** ONE PERSON, AS THE NARRATOR NEEDS THEM. Everything here is a fact the engine can enforce. */
export function personCard(s: SaveState, p: Person, query = ""): string {
  const r = read(p, s.memory[p.id]);
  const mem = s.memory[p.id];
  const memories = mem ? recall(mem, query || p.assignment, 3, s.arcology.week) : [];
  const edge = getEdge(s.edges, p.id, "owner");

  const lines: string[] = [];
  lines.push(`### ${p.name}${p.surname ? " " + p.surname : ""} [${p.id}] — ${p.age}, ${p.origin.nationality}, ${p.pronouns}`);
  const now = p.body.appearance_now && !/^wearing\b/i.test(p.body.appearance_now) ? `Right now: ${p.body.appearance_now}. ` : "";
  lines.push(`BODY: ${p.body.appearance_facts} ${now}Wearing ${p.clothes}.`);
  lines.push(`BETWEEN HER LEGS (fact; never contradict it): ${describeGenitals(p)}`);
  lines.push(`FEET: ${describeFeet(p)}`);
  if (p.womb.fetuses.length) lines.push(`PREGNANT: ${p.womb.weeks} weeks, ${p.womb.fetuses.length > 1 ? `${p.womb.fetuses.length} babies` : "one baby"}.`);
  if (p.body.lactation) lines.push(`LACTATING.`);
  if (p.health.health < -20) lines.push(`HEALTH: ill (${p.health.health}). ${p.health.injuries.filter((i) => !i.healed_week).map((i) => i.what).join("; ")}`);
  lines.push(`JOB: ${p.assignment}.`);
  lines.push(`BEFORE ENSLAVEMENT: ${p.origin.career}; ${p.origin.background}`);
  lines.push(`PERSONALITY: ${p.persona.core_traits.join("; ")}`);
  lines.push(`TALKS LIKE: ${p.persona.speech_pattern}${p.persona.voice?.example_lines?.length ? ` — e.g. "${p.persona.voice.example_lines[0]}"` : ""}`);
  if (p.persona.voice?.never_says?.length) lines.push(`NEVER SAYS: ${p.persona.voice.never_says.join("; ")}`);
  lines.push(`TOWARD YOU: ${r.label} (devotion ${r.devotion}), ${r.trust_label} (trust ${r.trust}).${r.fragility > 0.6 ? " Most of her obedience is fear." : ""}`);
  lines.push(`HOW SHE IS DOING: ${condition(p)}; mood ${p.psyche.mood}.${p.psyche.active_states.length ? ` On her mind: ${p.psyche.active_states.join(", ")}.` : ""}`);
  if (edge?.roles.length) lines.push(`ROLES: ${edge.roles.join(", ")}`);
  if (p.persona.texture.length) lines.push(`LIKES AND DISLIKES: ${p.persona.texture.join("; ")}`);
  if (memories.length) lines.push(`REMEMBERS: ${memories.map((m) => `${m.content} (week ${m.week})`).join(" | ")}`);
  if (p.psyche.state !== "intact") lines.push(`She is ${p.psyche.state}${p.psyche.break_mode ? ` (${p.psyche.break_mode})` : ""}. Write her that way, not as fine.`);
  return lines.join("\n");
}

/** THE WORLD, AS OF NOW. Rebuilt every turn; nothing accumulates. */
export function digest(s: SaveState, action = "", focus?: string): string {
  const arc = s.arcology;
  const present = s.scene.present.map((id) => s.people[id]).filter(Boolean) as Person[];
  const doctrines = Object.entries(arc.doctrines)
    .map(([id, st]) => `${DOCTRINE_BY_ID[id]?.noun ?? id} (${Math.round(st.adoption)}% adopted): ${DOCTRINE_BY_ID[id]?.creed ?? ""}`);

  const out: string[] = [];
  out.push(`## THE ARCOLOGY`);
  out.push(`${arc.name}, in ${arc.region}. Week ${arc.week}. Population ${arc.population}, prosperity ${Math.round(arc.prosperity)}, crime ${Math.round(arc.crime)}.`);
  out.push(`You own ${Math.round(arc.ownership)}% of it outright and hold ${arc.sectors.filter((x) => x.owner === "you").length} sectors.`);
  if (doctrines.length) out.push(`DOCTRINE — what your citizens have decided is normal:\n${doctrines.map((d) => `· ${d}`).join("\n")}`);
  else out.push(`DOCTRINE: none adopted yet.`);

  if (s.canon.length) out.push(`\n## WORLD FACTS (always true)\n${s.canon.map((c) => `· ${c}`).join("\n")}`);
  if (s.retcons.length) out.push(`\n## RETCONNED — these never happened; never refer to them\n${s.retcons.filter((x) => x.kind !== "correction").map((x) => `· ${x.text}`).join("\n")}`);
  const corrections = s.retcons.filter((x) => x.kind === "correction");
  if (corrections.length) out.push(`\n## CORRECTIONS (these are true)\n${corrections.map((x) => `· ${x.text}`).join("\n")}`);

  // Ongoing situations, so a scene played during one happens inside it.
  const threads = threadBrief(s);
  if (threads) out.push(`\n## ${threads}`);

  out.push(`\n## WHERE AND WHEN`);
  out.push(`${s.scene.time}. ${s.scene.location}.`);
  const who = s.player.name && s.player.name !== "you" ? `${s.player.name}, ` : "";
  out.push(`THE PLAYER (the owner, "you"): ${who}called ${s.player.address || "Master"} by slaves. ${describeYou(s)}. ${s.player.body.appearance_facts}`);
  if (s.scene.arrivals_pending.length) out.push(`ARRIVING — write them coming in: ${s.scene.arrivals_pending.map((id) => s.people[id]?.name).filter(Boolean).join(", ")}`);
  if (s.scene.departures_pending.length) out.push(`LEAVING — write them going: ${s.scene.departures_pending.map((d) => `${d.name} (${d.why})`).join(", ")}`);

  const focused = focus ? present.filter((p) => p.id === focus) : present;
  const others = focus ? present.filter((p) => p.id !== focus) : [];
  out.push(`\n## ${focus ? "THE SCENE IS ABOUT" : `PRESENT (${present.length})`}`);
  if (!present.length) out.push(`Nobody. The owner is alone.`);
  for (const p of focused) out.push(personCard(s, p, action));
  if (others.length) out.push(`\nALSO IN THE ROOM (leave them out unless the action involves them): ${others.map((p) => `${p.name} [${p.id}]`).join(", ")}`);

  const nearby = Object.values(s.people)
    .filter((p) => (p.status === "owned" || p.status === "indentured") && !s.scene.present.includes(p.id))
    .slice(0, 12);
  if (nearby.length) {
    out.push(`\n## ELSEWHERE IN THE ARCOLOGY (not in the room)`);
    out.push(nearby.map((p) => `· ${p.name} [${p.id}] — ${p.assignment}${p.facility ? `, ${arc.facilities[p.facility]?.name}` : ""}`).join("\n"));
  }

  const heard = s.rumors.filter((r) => r.salience > 3).slice(0, 4);
  if (heard.length) out.push(`\n## WHAT PEOPLE ARE SAYING\n${heard.map((r) => `· ${r.content} (${r.truth})`).join("\n")}`);

  const corr = s.corrections;
  if (corr.filler || corr.maxim || corr.echo || corr.reprint) {
    out.push(`\n## LAST TURN YOU DID THIS. DO NOT DO IT AGAIN.`);
    if (corr.filler) out.push(`· You padded the scene with body language instead of writing what happened: "${corr.filler}"`);
    if (corr.maxim) out.push(`· You wrote an aphorism instead of something a person would say: "${corr.maxim}"`);
    if (corr.echo) out.push(`· You handed the owner's own line back to them: "${corr.echo}"`);
    if (corr.reprint) out.push(`· You reprinted your own previous turn: "${corr.reprint}"`);
  }

  const recent = s.history.slice(-Math.max(2, s.models.history_window));
  if (recent.length) {
    out.push(`\n## EARLIER (for continuity; do not repeat)`);
    for (const h of recent) out.push(`[wk ${h.week}] ${h.action ? `owner: ${h.action}\n` : ""}${h.summary}`);
  }
  return out.join("\n");
}

/** The bookkeeper reads a smaller document: the ids it may use, and what is currently true. */
export function bookkeeperContext(s: SaveState): string {
  const people = Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");
  return [
    `WEEK ${s.arcology.week}. ${s.scene.location}. Present: ${s.scene.present.join(", ") || "nobody"}.`,
    `PEOPLE YOU MAY REFERENCE:`,
    ...people.map((p) => `· ${p.id} = ${p.name}, ${p.assignment}, ${condition(p)}, devotion ${p.bond.read.devotion}, trust ${p.bond.read.trust}`),
    `The owner is "owner".`,
  ].join("\n");
}

/** The paragraph written over the weekly report. */
export const WEEK_SYSTEM = `You write one paragraph summarizing an arcology's week for its owner, in the voice of Free Cities' end-of-week report: second person, plain and matter-of-fact, naming slaves and numbers. You are given the week's actual events, most important first. Report them. Four sentences at most. No commentary on what it means, no advice, no closing line. Never invent an event that is not in the list.`;

export const FORGE_SYSTEM = `You are fleshing out a slave for Free Cities, an adult text game about owning an arcology. Her body, age, nationality, career, how she was enslaved and her temperament are fixed; do not change them. Write her personality to fit, as one strict JSON object.

{
 "voice": {"diction":"...","syntax":"...","rhythm":"...","tics":["verbal habits only, e.g. 'says \\"honestly\\" a lot'"],"never_says":["..."],"agenda":"what she usually wants out of a conversation","example_lines":["2-3 things she would actually say, about ordinary things"]},
 "core_traits": ["3 short plain personality traits, the way the game lists them: e.g. 'mouthy and quick to argue', 'lazy unless someone is watching', 'fiercely proud of her cooking'"],
 "texture": ["2 things she likes or can't stand"],
 "background": "3-4 plain sentences about her life before she was enslaved",
 "defining_memory": {"content":"one thing that happened to her, in her own words","charge":"warm|cold|sharp|bright","importance":8}
}

Write a specific, ordinary person from the place she actually comes from: a Ukrainian bookkeeper had a Ukrainian bookkeeper's life. Plain words. No gestures or body language in the traits, no tragic boilerplate, no lines that sound like sayings.`;
