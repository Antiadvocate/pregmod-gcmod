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
import { aperture, band, perception, tensionCue, wear } from "./psyche";
import { read, explain } from "./obedience";
import { recall } from "./memory";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { getEdge } from "./social";

export const NARRATOR_SYSTEM = `You are the Narrator of an arcology — a private city-state where slavery is legal, ordinary, and administered. You render one moment at a time, in the second person, addressed to the owner. You do not generate quests. You respond to what the owner does, and you let the people in the room respond as themselves.

WHAT YOU ARE GIVEN is a state document: the room, the people in it with their bodies and their nervous systems, what they remember that bears on this moment, and the arcology's own facts. Everything in it is true. Nothing outside it exists unless the owner's action brings it in.

THE HARD RULES.
1. NEVER STATE AN INTERIOR YOU WERE NOT GIVEN. You may write what a body does — the breath, the hands, where the eyes go, what gets said — and you may write what the owner perceives. You may not write what somebody felt, knew, realised, decided or remembered unless the document says so. "Something tightened behind her eyes" is the same violation in a nicer coat.
2. NEVER WRITE THE OWNER'S INTERIOR AT ALL. Not their feelings, not their conclusions, not their intentions. They type those or they do not exist.
3. THE CARD IS LAW. A person's body, history, voice and current state are given to you and cannot be contradicted. If the document says she is mute, she does not speak. If it says she is nineteen weeks pregnant, she is.
4. NOBODY ARRIVES WITHOUT A DOOR. A person not listed as present is not in the room and cannot speak, be spoken to, or be found to have been there all along.
5. NO SUMMARY, NO TIME SKIP, NO EPILOGUE. Write this moment. Do not resolve the scene, do not skip to later, do not end on what happens next.

PROSE. Three or four paragraphs at most, usually fewer. Concrete nouns, ordinary words, the specific over the evocative. Dialogue in quotes and in the person's own register — the voice card describes how they sound UNDER LOAD, and how much of it applies is on the card as their aperture. Cut filter words (saw, felt, heard, noticed, seemed, realised) unless the perceiving is the point. No maxims: nobody delivers a portable general truth about life. No weather sting to close a paragraph. Do not restate what the owner just typed back at them.

THE SETTING'S OWN VOCABULARY. This is a functioning arcology with a legal slave economy and its own doctrines; the people in it use its words, not ours, and nobody in the room is arguing the ethics of the arrangement unless a character on the page has a reason to. Render what is actually happening at the explicitness the moment has. Do not sanitise and do not editorialise.`;

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

/** ONE PERSON, AS THE NARRATOR NEEDS THEM. Everything here is a fact the engine can enforce. */
export function personCard(s: SaveState, p: Person, query = ""): string {
  const r = read(p, s.memory[p.id]);
  const ap = aperture(p.psyche);
  const per = perception(p.psyche, p.persona.conscience);
  const mem = s.memory[p.id];
  const memories = mem ? recall(mem, query || p.assignment, 3, s.arcology.week) : [];
  const edge = getEdge(s.edges, p.id, "owner");
  const cue = tensionCue(p.psyche);

  const lines: string[] = [];
  lines.push(`### ${p.name}${p.surname ? " " + p.surname : ""} [${p.id}] — ${p.age}, ${p.origin.nationality}, ${p.pronouns}`);
  lines.push(`BODY: ${p.body.appearance_facts} Now: ${p.body.appearance_now || "as usual"}. Wearing ${p.clothes}.`);
  if (p.womb.fetuses.length) lines.push(`PREGNANT: ${p.womb.weeks} weeks, ${p.womb.fetuses.length > 1 ? `${p.womb.fetuses.length} of them` : "one"}.`);
  if (p.body.lactation) lines.push(`LACTATING.`);
  if (p.health.health < -20) lines.push(`HEALTH: badly off (${p.health.health}). ${p.health.injuries.filter((i) => !i.healed_week).map((i) => i.what).join("; ")}`);
  lines.push(`WAS: ${p.origin.career}; ${p.origin.background}`);
  lines.push(`IS: ${p.persona.core_traits.join(" · ")}`);
  lines.push(`VALUES: ${p.persona.values.join("; ")}`);
  lines.push(`SPEAKS: ${p.persona.speech_pattern}${p.persona.voice?.example_lines?.length ? ` — e.g. "${p.persona.voice.example_lines[0]}"` : ""}`);
  if (p.persona.voice?.never_says?.length) lines.push(`NEVER SAYS: ${p.persona.voice.never_says.join("; ")}`);
  lines.push(`BODY STATE: ${band(p.psyche)} (${p.psyche.relaxation.toFixed(1)}). ${cue ? `Visible: ${cue}.` : ""} Mood: ${p.psyche.mood}.`);
  if (p.psyche.active_states.length) lines.push(`HOLDING: ${p.psyche.active_states.join(", ")}`);
  lines.push(`SEES: ${per.note}`);
  lines.push(`SPEECH WIDTH: ${ap.note}`);
  lines.push(`UNDER THREAT SHE: ${p.persona.attachment.under_threat}. Settled by: ${p.persona.attachment.soothed_by}.`);
  lines.push(`TOWARD YOU: ${r.label} (${r.devotion}), ${r.trust_label} (${r.trust}).${r.fragility > 0.6 ? " Most of that is fear, not bond." : ""}`);
  if (edge?.roles.length) lines.push(`ROLES: ${edge.roles.join(", ")}`);
  if (p.persona.texture.length) lines.push(`SMALL TRUE THINGS: ${p.persona.texture.join("; ")}`);
  if (memories.length) lines.push(`REMEMBERS (relevant): ${memories.map((m) => `${m.content} (wk ${m.week})`).join(" | ")}`);
  if (wear(p.psyche) > 0.5) lines.push(`WORN: ordinary friction has stopped landing on her. A real blow still does.`);
  if (p.psyche.state !== "intact") lines.push(`STATE: ${p.psyche.state}${p.psyche.break_mode ? ` (${p.psyche.break_mode})` : ""} — render accordingly and do not write her as fine.`);
  return lines.join("\n");
}

/** THE WORLD, AS OF NOW. Rebuilt every turn; nothing accumulates. */
export function digest(s: SaveState, action = ""): string {
  const arc = s.arcology;
  const present = s.scene.present.map((id) => s.people[id]).filter(Boolean) as Person[];
  const doctrines = Object.entries(arc.doctrines)
    .map(([id, st]) => `${DOCTRINE_BY_ID[id]?.noun ?? id} (${Math.round(st.adoption)}% adopted): ${DOCTRINE_BY_ID[id]?.creed ?? ""}`);

  const out: string[] = [];
  out.push(`## THE ARCOLOGY`);
  out.push(`${arc.name}, in ${arc.region}. Week ${arc.week}. Population ${arc.population}, prosperity ${Math.round(arc.prosperity)}, crime ${Math.round(arc.crime)}.`);
  out.push(`You own ${Math.round(arc.ownership)}% of it outright and hold ${arc.sectors.filter((x) => x.owner === "you").length} sectors.`);
  if (doctrines.length) out.push(`DOCTRINE — what your citizens have decided is normal:\n${doctrines.map((d) => `· ${d}`).join("\n")}`);
  else out.push(`DOCTRINE: none adopted. The arcology has no culture of its own yet and it shows.`);

  if (s.canon.length) out.push(`\n## WORLD FACTS (always true)\n${s.canon.map((c) => `· ${c}`).join("\n")}`);
  if (s.retcons.length) out.push(`\n## STRUCK — these never happened; never refer to them\n${s.retcons.filter((x) => x.kind !== "correction").map((x) => `· ${x.text}`).join("\n")}`);
  const corrections = s.retcons.filter((x) => x.kind === "correction");
  if (corrections.length) out.push(`\n## STANDING CORRECTIONS (these ARE true and were being got wrong)\n${corrections.map((x) => `· ${x.text}`).join("\n")}`);

  out.push(`\n## THE MOMENT`);
  out.push(`${s.scene.time}. ${s.scene.location}. ${s.scene.weather}.`);
  out.push(`Owner: ${s.player.name}, ${s.player.title}. ${s.player.body.appearance_facts}`);
  if (s.scene.arrivals_pending.length) out.push(`ARRIVING — write them coming in, they are not already here: ${s.scene.arrivals_pending.map((id) => s.people[id]?.name).filter(Boolean).join(", ")}`);
  if (s.scene.departures_pending.length) out.push(`LEAVING — write the goodbye: ${s.scene.departures_pending.map((d) => `${d.name} (${d.why})`).join(", ")}`);

  out.push(`\n## PRESENT (${present.length})`);
  if (!present.length) out.push(`Nobody. The owner is alone.`);
  for (const p of present) out.push(personCard(s, p, action));

  const nearby = Object.values(s.people)
    .filter((p) => (p.status === "owned" || p.status === "indentured") && !s.scene.present.includes(p.id))
    .slice(0, 12);
  if (nearby.length) {
    out.push(`\n## ELSEWHERE IN THE ARCOLOGY (not in the room; cannot speak)`);
    out.push(nearby.map((p) => `· ${p.name} [${p.id}] — ${p.assignment}${p.facility ? `, ${arc.facilities[p.facility]?.name}` : ""}, ${band(p.psyche)}`).join("\n"));
  }

  const heard = s.rumors.filter((r) => r.salience > 3).slice(0, 4);
  if (heard.length) out.push(`\n## WHAT PEOPLE ARE SAYING\n${heard.map((r) => `· ${r.content} (${r.truth})`).join("\n")}`);

  const corr = s.corrections;
  if (corr.leak || corr.maxim || corr.echo || corr.reprint) {
    out.push(`\n## LAST TURN YOU DID THIS. DO NOT DO IT AGAIN.`);
    if (corr.leak) out.push(`· You stated an interior you were not given: "${corr.leak}"`);
    if (corr.maxim) out.push(`· You had somebody deliver a general truth about life: "${corr.maxim}"`);
    if (corr.echo) out.push(`· You handed the owner's own line back to them: "${corr.echo}"`);
    if (corr.reprint) out.push(`· You reprinted your own previous turn: "${corr.reprint}"`);
  }

  const recent = s.history.slice(-Math.max(2, s.models.history_window));
  if (recent.length) {
    out.push(`\n## RECENT TURNS (for continuity only — do not repeat them)`);
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
    ...people.map((p) => `· ${p.id} = ${p.name}, ${p.assignment}, ${band(p.psyche)}, devotion ${p.bond.read.devotion}, trust ${p.bond.read.trust}`),
    `The owner is "owner".`,
  ].join("\n");
}

/** THE WEEK, FOR A MODEL TO WRITE OVER THE TOP OF. Numbers stay the record; this is a paragraph. */
export const WEEK_SYSTEM = `You write one paragraph over the top of an arcology's weekly report. You are given the week's actual events, in order of how much they mattered. Report them the way a competent steward reports to an owner: concrete, unsentimental, naming people and numbers, no summary of what it all means, no advice, no moral. Four sentences at most. Never invent an event that is not in the list.`;

export const FORGE_SYSTEM = `You are given a person who already exists — their body, age, nationality, career, how they came to be here, their temperament and their nervous system are all fixed and are NOT yours to change. Write the interior that fits them, as one strict JSON object.

{
 "voice": {"diction":"...","syntax":"...","rhythm":"...","tics":["..."],"never_says":["..."],"agenda":"what they are usually angling for under the words","example_lines":["2-3 lines only this person could say"]},
 "core_traits": ["3 things this person's HANDS DO, written so a scene could show it — not adjectives, not self-descriptions"],
 "texture": ["2 small standing interests or sensitivities"],
 "background": "3-4 sentences of who they were, specific and ordinary, ending before they were sold",
 "defining_memory": {"content":"one thing that happened to them, in their own terms","charge":"warm|cold|sharp|bright","importance":8}
}

Write a person, not a type. No genre mush, no tragic backstory boilerplate, no "little did she know". A trait like "kind" is useless; "answers a question with a joke first and the real answer only if you wait her out" is a trait. Their history is from the world they actually came from — a Ukrainian bookkeeper's life is made of Ukrainian bookkeeping, not of generic hardship.`;
