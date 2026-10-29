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
import { coarsen, FC_VOICE } from "./register";
import { cleanList, OWN_LIFE_ASK, OWN_V } from "./ownlife";
import { surgeryPast } from "./health";
import { inBed } from "./sexlife";
import { conscienceLine } from "./prompts";
import { hardNature, unsoften } from "./soft";

/** Weeks between readings of the same woman. */
const EVERY = 6;
/** The version of the reading. A woman read by an older one is read again, whatever happened since:
 *  version 1 wrote quirk lists the narrator caricatured; 2 writes a grounded person and short
 *  ordinary exchanges instead; 3 gives her a life of her own (what she does with her time, what she
 *  wants in the long run) and knows that what's done is done; 4 gives those a sexual edge, from her
 *  personality; 5 is told who she is in bed (fetish, paraphilia, quirk, flaw) and writes her
 *  personality with room for it, after a dom with an abusive streak came out meek; 6 flattened every
 *  voice into the same plain, clumsy speech and was taken back, so 7 is 5 again, and a woman read
 *  by 6 is read again to get her own voice back. 7 still asked for "plain, ordinary sentences" and
 *  polite small talk as her sample lines, and every voice in the house stopped swearing or saying
 *  anything about a body; 8 asks for how she swears and talks dirty, in her own way, and one of her
 *  sample lines filthy. Everyone is read once more for it. */
export const GROW_V = 8;
/** A reading that has to be done again: anything before 8. */
const STALE_V = (v: number) => v < 8;

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
  const stale = (p: Person) => p.persona.grown_week !== undefined && STALE_V(p.persona.grown_v ?? 1);
  // No ordinary exchanges yet: her voice has nothing at the length real talk runs to hold it, so
  // she's read as soon as there's a little to read (her third week), not at her sixth.
  const untalked = (p: Person) => !p.persona.exchanges?.length && p.economics.weeks_owned >= 3 && (p.persona.grown_week === undefined || week - p.persona.grown_week >= EVERY);
  return Object.values(s.people)
    .filter((p) => (inHousehold(s, p) || isPartner(s, p)) && p.age >= 18 && p.persona.voice && (p.economics.weeks_owned >= 4 || untalked(p)))
    .filter((p) => stale(p) || untalked(p) || (week - lastRead(p) >= EVERY && since(s, p) >= 2))
    .sort((a, b) => Number(stale(b)) - Number(stale(a)) || since(s, b) - since(s, a));
}

const GROW_SYSTEM = `You re-read a woman in Free Cities, an adult text game about owning an arcology, after weeks in the owner's house, and write who she is NOW, as one strict JSON object.

Her first card was written the week she arrived, and a lot has happened since. What has happened to her, the orders she lives under, where she stands with the owner and how she is with people now are the truth about her. Write the real, grounded person all of that has made, as a person and not a bundle of quirks.

Rules that matter most:
- She talks like a real person from her background, and in this house that includes sex and bodies. Describe her voice the way you'd describe someone you know (blunt, quiet, quick, mouthy, filthy, prim, dry), and not as a list of gimmicks. Say how she swears and how she talks dirty, in her own way: a street girl says "fuck" every other word, a prim one says "cock" like it costs her and goes red, a bored one talks about cum like it's laundry. Nobody in this game talks like a therapist or a novel.
- Don't turn a one-off joke, image or number from a scene into who she is. If a scene had her call herself bread, or count to eighty-nine, that was one moment, so leave it there.
- "tics" is at most two small, believable habits that real people have, like a word from her own language when she swears, what she calls the owner, or a way she laughs, and each is something she does only now and then. Leave it empty if nothing fits, and never use generic fillers like "like", "just", "honestly", "okay" or "I mean".
- Her body is fact. Where a memory says something her body couldn't have done, such as taking a cock that's far too big for her throat all the way down, the body wins. It went as far as it physically could, and that's who she is and what she remembers.
- IN BED is fact. Her core traits, voice and agenda must have room for it and say how it comes out, because a quiet, careful or obedient woman can be a dom or a sadist in bed. Write the contrast, and never write it away.
- HER NATURE IS FIXED. Her fetishes, her paraphilia and her conscience are the game's, and scenes don't change them. The writer of those scenes sometimes went soft on her, having a sadist stop to check whether he could take it, an abuser pull out because he begged, or a cold woman go pink and apologise. That was the writer's slip, not who she is. Never write checking in, stopping when asked, gentleness, aftercare or apologies into her traits, history or signature when her nature says otherwise.
- What's done is done. An operation, a punishment, a promise or a scene that already happened is in her past. It can have changed her, but she doesn't count the days since it, wait for it, or bring it up every time she talks. DONE TO HER BODY and the weeks on everything tell you what's over.
- She has a life of her own besides the owner and what's been done to her. This is a porn game, so it has a sexual edge, and it grows out of her personality traits first, then her fetishes, then the job she had. "interests": ${OWN_LIFE_ASK.interests}. "goals": ${OWN_LIFE_ASK.goals}. Keep the ones on her card that still fit, and change what her weeks here would have changed.
- "exchanges" is three short exchanges with the owner, the kind that happen every day, in the relationship they actually have. THE POWER BETWEEN THEM and her STANDING ORDERS decide how she speaks to him. The owner says something ordinary ("How are you?", "Come here.", "What do you think of the new room?") and she answers in one to three sentences, as herself. At least one of the three is about sex or her body, in her own crude words ("My ass is still sore from Tuesday, Master, but you can have it."). These set the length and the mouth she talks with, so keep them short and human.

Also:
- "core_traits" is 3 to 5 traits, concrete and specific to her now, the way the game lists them ("fixes anything that rattles", "fucks the owner's throat the moment she sees him").
- "voice" has diction, syntax and rhythm (a short sentence each, diction saying how she swears and talks about sex), never_says, and agenda.
- "life_history" is 4 to 6 blunt sentences about who she has become here and what was done to her and by her that made her, with the weeks. What happened, not how it felt to grow.
- "signature" is one sentence about the one thing she has that nobody else in the house has, shown as something she does.
Use everyday, crude words and nothing literary or therapeutic. Keep everything true to the facts given, and invent nothing that contradicts them.

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
  const bed = inBed(p);
  return [
    `## WHO SHE WAS WHEN SHE ARRIVED (week ${p.origin.acquired_week})`,
    `${p.name}, ${p.age}, ${p.origin.nationality}, was a ${p.origin.career}. ${p.persona.background}`,
    `Her traits then were these: ${p.persona.core_traits.map((t) => t.replace(/[.;]\s*$/, "")).join(", ")}. She talked like this: ${p.persona.speech_pattern}.${p.persona.speech_own ? " The player set how she talks, so keep it exactly, and write her voice and her lines to match it." : ""} ${v?.diction ?? ""} Her habits then were ${(v?.tics ?? []).join(", ") || "none in particular"}.`,
    p.persona.life_history ? `This is who she'd become the last time she was read, in week ${p.persona.grown_week}: ${p.persona.life_history}` : "",
    `## HER BODY NOW\n${p.body.appearance_facts} ${featureFacts(p)}\nBetween her legs: ${describeGenitals(p)}\nHer feet: ${describeFeet(p)}${p.body.traits?.length ? `\nWhat's been altered: ${p.body.traits.join(", ")}` : ""}`,
    surgeryPast(s, p, 999) ? `## DONE TO HER BODY\nThis is over and in the past.\n${surgeryPast(s, p, 999)}` : "",
    `## HER OWN LIFE, AS HER CARD HAS IT NOW\nWhat she does with her time is ${(p.persona.interests ?? []).join(", ") || "nothing written yet"}.\nWhat she wants in the long run is ${(p.persona.goals ?? []).join(", ") || "nothing written yet"}.\nShe ${p.persona.texture.join(", and she ")}.\nShe works as ${p.assignment}. Before she was taken, she was ${p.origin.career}.`,
    hardNature(s, p) ? `## HER NATURE, WHICH IS FIXED\n${[bed, conscienceLine(p)].filter(Boolean).join("\n")}\nWhatever the memories below say, she is this. Gentleness in them was the writer's, not hers.` : "",
    `## WHERE SHE STANDS WITH THE OWNER (week ${s.arcology.week})\nShe stands as ${rom.standing}. Toward the owner she's ${r.label}, ${r.trust_label}.${bed ? `\nIN BED, which is a fact: ${bed}` : ""}\n${powerBetween(s, p)}`,
    agreementsBrief(s, p),
    mannerLines(p).length ? `## HOW SHE IS WITH OTHER PEOPLE\n${mannerLines(p).join("\n")}` : "",
    (mem?.facts ?? []).length ? `## WHAT SHE KNOWS ABOUT THE OWNER\nEach one has the week she learned it.\n${mem!.facts.map((f) => `· week ${f.week}: ${f.text}`).join("\n")}` : "",
    mem?.digest ? `## HER TIME HERE, IN SHORT, IN HER WORDS\n${mem.digest}` : "",
    `## WHAT HAS HAPPENED TO HER\nThese are the things that matter most, in order.\n${memories.join("\n")}`,
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
    system: `${GROW_SYSTEM}\n\n${FC_VOICE}`,
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
  if (out.speech_pattern && !live.persona.speech_own) live.persona.speech_pattern = clip(out.speech_pattern, 120);
  live.persona.voice = {
    diction: clip(out.voice.diction, 300) || live.persona.voice?.diction,
    syntax: clip(out.voice.syntax, 300) || live.persona.voice?.syntax,
    rhythm: clip(out.voice.rhythm, 300) || live.persona.voice?.rhythm,
    tics: list(out.voice.tics, 2, 160),
    // The player set how she talks: a list of words she never says can only argue with it.
    never_says: live.persona.speech_own ? [] : list(out.voice.never_says, 4, 80),
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
  if (does.length && wants.length) live.persona.own_v = OWN_V;
  live.persona.life_history = clip(out.life_history, 1200);
  if (out.signature) live.persona.signature = clip(out.signature, 240);
  unsoften(s, live);
  live.persona.grown_week = s.arcology.week;
  live.persona.grown_v = GROW_V;
  return true;
}
