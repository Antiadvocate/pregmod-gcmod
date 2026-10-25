/**
 * WHO SHE HAS BECOME.
 *
 * A woman's voice and personality were written once, the week she arrived, and never again. Halyna
 * in week 48 was still the nervous engineer of week 1 ("says 'like' and 'just' a lot", "I mean,
 * it's just... you don't have to stand so close"), while her memories were of being courted in
 * front of the whole arcology, carried at the Feast of Soles and the owner's throat widened for
 * her; and her life history, the field meant to hold all that, was empty, because nothing ever
 * wrote it. Every scene got a dominant, worshipped woman's memories stapled to a frightened
 * captive's voice, and the model split the difference into beige.
 *
 * So every few weeks, a woman who has lived through something big since she was last read is read
 * again, from the card she arrived with, her body now, the orders she lives under, where she stands
 * with you, and the memories that matter most, and written as who she is now: traits, voice, two
 * or three habits of speech nobody else in the house has, example lines said to you in the
 * relationship you actually have, a short history of how she got here, and the one thing about her
 * nobody else has. The old card is replaced, not added to. One model call each, a woman at a time.
 */
import type { Person, SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { inHousehold, isPartner, romanceOf } from "./romance";
import { describeGenitals, describeFeet } from "./genitals";
import { featureFacts } from "./features";
import { powerBetween } from "./self";
import { agreementsBrief } from "./agreements";
import { mannerLines } from "./manner";
import { read } from "./obedience";
import { coarsen } from "./register";
import { cleanList } from "./ownlife";
import { surgeryPast } from "./health";

/** Weeks between readings of the same woman. */
const EVERY = 6;
/** The version of the reading. A woman read by an older one is read again, whatever happened since:
 *  version 1 wrote quirk lists the narrator caricatured; 2 writes a grounded person and short
 *  ordinary exchanges instead; 3 gives her a life of her own (what she does with her time, what she
 *  wants in the long run) and knows that what's done is done. */
export const GROW_V = 3;

function lastRead(p: Person): number { return p.persona.grown_week ?? p.origin.acquired_week ?? 0; }

/** What has happened to her since she was last read that's worth reading her again for. */
function since(s: SaveState, p: Person): number {
  const w = lastRead(p);
  const mem = s.memory[p.id];
  const big = (mem?.episodic ?? []).filter((m) => m.week > w && (m.core || m.importance >= 8)).length;
  const orders = (p.agreements ?? []).filter((a) => a.week > w).length;
  const rung = (p.romance?.since_week ?? 0) > w ? 2 : 0;
  return big + orders * 2 + rung;
}

/** Who's due to be read again, most changed first. */
export function dueToGrow(s: SaveState): Person[] {
  const week = s.arcology.week;
  const stale = (p: Person) => p.persona.grown_week !== undefined && (p.persona.grown_v ?? 1) < GROW_V;
  return Object.values(s.people)
    .filter((p) => (inHousehold(s, p) || isPartner(s, p)) && p.age >= 18 && p.persona.voice && p.economics.weeks_owned >= 4)
    .filter((p) => stale(p) || (week - lastRead(p) >= EVERY && since(s, p) >= 2))
    .sort((a, b) => Number(stale(b)) - Number(stale(a)) || since(s, b) - since(s, a));
}

const GROW_SYSTEM = `You re-read a woman in Free Cities, an adult text game about owning an arcology, after weeks in the owner's house, and write who she is NOW, as one strict JSON object.

Her first card was written the week she arrived; a lot has happened since. What has happened to her, the orders she lives under, where she stands with the owner and how she is with people now are the truth about her: write the real, grounded person all of that has made. A person, not a bundle of quirks.

Rules that matter most:
- She talks like a real person: mostly plain, ordinary sentences. Describe her voice the way you'd describe someone you know (blunt, quiet, quick, warm, dry), not as a list of gimmicks.
- Don't turn a one-off joke, image or number from a scene into who she is. If a scene had her call herself bread, or count to eighty-nine, that was one moment; leave it there.
- "tics": at most two small, believable habits real people have (a word from her own language when she swears, what she calls the owner, a way she laughs), each something she does only now and then. Leave it empty if nothing fits. Never generic fillers ("like", "just", "honestly", "okay", "I mean").
- What's done is done. An operation, a punishment, a promise or a scene that already happened is in her past: it can have changed her, but she doesn't count the days since it, wait for it, or bring it up every time she talks. DONE TO HER BODY and the weeks on everything tell you what's over.
- She has a life of her own besides the owner and what's been done to her: "interests" are two or three things she does with her own time (from her life before, her nature and what she has here: things she does, not things she likes), and "goals" are one or two things she wants for herself in the long run. Keep the ones on her card that still fit, change what her weeks here would have changed.
- "exchanges": three short, ordinary exchanges with the owner, the kind that happen every day, in the relationship they actually have (THE POWER BETWEEN THEM and her STANDING ORDERS decide how she speaks to him). The owner says something ordinary ("How are you?", "Come here.", "What do you think of the new room?") and she answers in one to three plain sentences, as herself. These set the length and plainness of how she talks, so keep them short and natural.

Also:
- "core_traits": 3 to 5, concrete and specific to her now, the way the game lists them ("fixes anything that rattles", "fucks the owner's throat the moment she sees him").
- "voice": diction, syntax, rhythm (a sentence each, plain), never_says, agenda.
- "life_history": 4 to 6 plain sentences: who she has become here and the turning points that made her, with the weeks.
- "signature": one sentence, the one thing about her nobody else in the house has, shown as something she does.
Plain words, nothing literary. Keep everything true to the facts given; invent nothing that contradicts them.

{"core_traits":["..."],"interests":["..."],"goals":["..."],"speech_pattern":"a few words","voice":{"diction":"...","syntax":"...","rhythm":"...","tics":["..."],"never_says":["..."],"agenda":"..."},"exchanges":[{"you":"...","her":"..."}],"life_history":"...","signature":"..."}`;

function brief(s: SaveState, p: Person): string {
  const r = read(p, s.memory[p.id]);
  const rom = romanceOf(p);
  const mem = s.memory[p.id];
  const memories = [...(mem?.episodic ?? [])]
    .sort((a, b) => (Number(!!b.core) - Number(!!a.core)) || (b.importance - a.importance) || (b.week - a.week))
    .slice(0, 22)
    .sort((a, b) => a.week - b.week)
    .map((m) => `· week ${m.week}${m.times && m.times > 1 ? ` (×${m.times})` : ""}: ${m.content}`);
  const v = p.persona.voice;
  const fetishes = p.persona.fetishes.filter((f) => f.strength >= 30).map((f) => `${f.name} (${f.strength >= 100 ? "past a preference" : f.strength >= 60 ? "strong" : "real"})`);
  return [
    `## WHO SHE WAS WHEN SHE ARRIVED (week ${p.origin.acquired_week})`,
    `${p.name}, ${p.age}, ${p.origin.nationality}; was a ${p.origin.career}. ${p.persona.background}`,
    `Traits then: ${p.persona.core_traits.join("; ")}. Talked: ${p.persona.speech_pattern}. ${v?.diction ?? ""} Habits then: ${(v?.tics ?? []).join("; ")}.`,
    p.persona.life_history ? `Who she'd become, last time she was read (week ${p.persona.grown_week}): ${p.persona.life_history}` : "",
    `## HER BODY NOW\n${p.body.appearance_facts} ${featureFacts(p)}\nBetween her legs: ${describeGenitals(p)}\nFeet: ${describeFeet(p)}${p.body.traits?.length ? `\nAltered: ${p.body.traits.join(", ")}` : ""}`,
    surgeryPast(s, p, 999) ? `## DONE TO HER BODY (over; in the past)\n${surgeryPast(s, p, 999)}` : "",
    `## HER OWN LIFE, AS HER CARD HAS IT NOW\nWhat she does with her time: ${(p.persona.interests ?? []).join("; ") || "nothing written yet"}\nWhat she wants in the long run: ${(p.persona.goals ?? []).join("; ") || "nothing written yet"}\nLikes and dislikes: ${p.persona.texture.join("; ")}\nWorks as: ${p.assignment}. Before she was taken: ${p.origin.career}.`,
    `## WHERE SHE STANDS WITH THE OWNER (week ${s.arcology.week})\nStanding: ${rom.standing}. Toward the owner: ${r.label}, ${r.trust_label}.${fetishes.length ? ` What she's into: ${fetishes.join(", ")}.` : ""}\n${powerBetween(s, p)}`,
    agreementsBrief(s, p),
    mannerLines(p).length ? `## HOW SHE IS WITH OTHER PEOPLE\n${mannerLines(p).join("\n")}` : "",
    (mem?.facts ?? []).length ? `## WHAT SHE KNOWS ABOUT THE OWNER (with the week she learned it)\n${mem!.facts.map((f) => `· week ${f.week}: ${f.text}`).join("\n")}` : "",
    `## WHAT HAS HAPPENED TO HER (the ones that matter most, in order)\n${memories.join("\n")}`,
  ].filter(Boolean).join("\n\n");
}

interface GrowOut {
  exchanges?: { you?: string; her?: string }[];
  interests?: string[];
  goals?: string[];
  core_traits?: string[];
  speech_pattern?: string;
  voice?: Person["persona"]["voice"];
  life_history?: string;
  signature?: string;
}

/** Read her again and write who she is now. Returns whether it took. */
export async function growPersona(s: SaveState, p: Person, signal?: AbortSignal): Promise<boolean> {
  if (!modelsAvailable() || s.models.lean_mode) return false;
  const res = await call({
    system: GROW_SYSTEM,
    user: brief(s, p),
    model: s.models.forge_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 2400,
    temperature: 0.85,
    signal,
  });
  if (!res.ok) return false;
  const out = parseJson<GrowOut>(coarsen(res.text));
  if (!out?.voice || !out.life_history) return false;
  const live = s.people[p.id];
  if (!live) return false;
  const clip = (x: unknown, n: number) => String(x ?? "").replace(/\s+/g, " ").trim().slice(0, n);
  const list = (xs: unknown, k: number, n: number) => (Array.isArray(xs) ? xs : []).map((x) => clip(x, n)).filter(Boolean).slice(0, k);
  const traits = list(out.core_traits, 5, 180);
  if (traits.length) live.persona.core_traits = traits;
  if (out.speech_pattern) live.persona.speech_pattern = clip(out.speech_pattern, 120);
  live.persona.voice = {
    diction: clip(out.voice.diction, 300) || live.persona.voice?.diction,
    syntax: clip(out.voice.syntax, 300) || live.persona.voice?.syntax,
    rhythm: clip(out.voice.rhythm, 300) || live.persona.voice?.rhythm,
    tics: list(out.voice.tics, 2, 160),
    never_says: list(out.voice.never_says, 4, 80),
    agenda: clip(out.voice.agenda, 200) || live.persona.voice?.agenda,
    // The old example lines go: the exchanges below show her voice at the length it should run.
    example_lines: list(out.voice.example_lines, 3, 240),
  };
  const talk = (Array.isArray(out.exchanges) ? out.exchanges : [])
    .map((x) => ({ you: clip(x?.you, 120), her: clip(x?.her, 240) }))
    .filter((x) => x.you && x.her)
    .slice(0, 3);
  if (talk.length) live.persona.exchanges = talk;
  const does = cleanList(out.interests, 3), wants = cleanList(out.goals, 2);
  if (does.length) live.persona.interests = does;
  if (wants.length) live.persona.goals = wants;
  live.persona.life_history = clip(out.life_history, 1200);
  if (out.signature) live.persona.signature = clip(out.signature, 240);
  live.persona.grown_week = s.arcology.week;
  live.persona.grown_v = GROW_V;
  return true;
}
