/**
 * ON THE LINE — talking to a rival ruler, or to the woman you put in charge of a city.
 *
 * You say what you like. The model plays the other side and reports, alongside what they said,
 * what (if anything) was agreed. The engine then checks every agreement against what is actually
 * on the table (engine/diplomacy TERMS, engine/governor GOV_ORDERS) and applies only those. The
 * conversation is kept, and every deal goes into the chronicle, so the next time you speak they
 * remember the last time.
 */
import type { SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { coarsen } from "./register";
import { HOUSE_STYLE, personCard } from "./prompts";
import { PLAIN_RULES } from "./style";
import { chronicle, chronicleBrief } from "./chronicle";
import { applyTerm, powerBrief, rulerOf, talkOf, termsFor, TALK_PER_WEEK, WARMTH_PER_WEEK } from "./diplomacy";
import { powerById, shift } from "./power";
import { lawsOf } from "./court";
import { LAW_BY_ID } from "../data/laws";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { governorBrief, governorshipOf, GOV_ORDERS } from "./governor";
import { DYNAMIC_EFFECTS } from "./dynamic";
import { remember } from "./memory";
import { clamp } from "./psyche";
import { worldBrief } from "./world";
import { weekSnapshot } from "./snapshot";

export interface TalkResult { ok: boolean; says: string; deals: string[]; error?: string }

function yourLaws(s: SaveState): string {
  const ls = lawsOf(s).map((x) => LAW_BY_ID[x.id]).filter(Boolean);
  return ls.length ? `YOUR LAWS (id: name: text):\n${ls.map((l) => `· ${l.id}: ${l.name}: ${l.text}`).join("\n")}` : "YOUR LAWS: none yet.";
}
function yourDoctrines(s: SaveState): string {
  const ds = Object.entries(s.arcology.doctrines).map(([id, d]) => `${id} (${DOCTRINE_BY_ID[id]?.noun ?? id}, ${Math.round(d.adoption)}%)`);
  return ds.length ? `YOUR DOCTRINES (id): ${ds.join(", ")}` : "YOUR DOCTRINES: none yet.";
}
const logText = (log: { role: string; text: string; week: number }[], you: string, them: string) =>
  log.slice(-14).map((l) => `[week ${l.week}] ${l.role === "you" ? you : them}: ${l.text}`).join("\n");

const POWER_SYSTEM = `You play the ruler of another city in Free Cities, an adult game about owning an arcology where slavery is legal. The player owns their own arcology and is talking to you directly, by video link or in person. Answer as this ruler, in their own voice and manner, in the first person.

How you behave:
- You know exactly how strong the player is compared to you, what you think of them, and what has passed between you. A ruler facing someone who could crush them is careful; one who is stronger is not. Insults and threats land; flattery works on the vain; money works on the greedy.
- You may agree to things only from TERMS YOU WOULD SIGN NOW, and only when the player has actually asked for or offered them in what they said. You may haggle, refuse, make a counter-offer, or ask for something in return. If the player asks for a term from TERMS YOU WILL NOT SIGN, refuse it in your own words, and the reason is the one given.
- If something is agreed, say so plainly in your reply, with the numbers.
- One to three short paragraphs. Speech mostly, with what you do while you say it when it matters.
- Talk like a person with interests, not a diplomat reading a communique. Mention real things: your own city's troubles, a grudge, something the player did that you heard about this week, your vice. No "we look forward to fruitful cooperation".

${HOUSE_STYLE}

Output ONE strict JSON object and nothing else:
{"says":"what you say and do","agreed":[{"term":"term id","value":"amount, id or count if the term takes one","detail":"anything specific, short"}],"warmth":0}
warmth is how this exchange changed your opinion of the player, from -5 to 5. agreed is [] unless a deal was actually struck in this exchange.`;

/** Say something to a power. Mutates the save. */
export async function speakToPower(s: SaveState, id: string, said: string): Promise<TalkResult> {
  const p = powerById(s, id);
  if (!p) return { ok: false, says: "", deals: [], error: "no such power" };
  if (!modelsAvailable()) return { ok: false, says: "", deals: [], error: "Talking needs a model. Set one in Settings." };
  const talk = talkOf(s, id);
  const week = s.arcology.week;
  if (!talk.used || talk.used.week !== week) talk.used = { week, n: 0, warmth: 0 };
  if (talk.used.n >= TALK_PER_WEEK) return { ok: false, says: "", deals: [], error: "They've stopped taking your calls this week. Try again next week." };
  const ruler = rulerOf(s, p);
  const terms = termsFor(s, p);
  const open = terms.filter((t) => !t.why).map((t) => `· ${t.id}: ${t.term.label}. Value: ${t.term.value}.${t.cap !== undefined ? ` At most ${t.cap.toLocaleString()}.` : ""}`);
  const shut = terms.filter((t) => t.why).map((t) => `· ${t.id}: ${t.term.label}. Not now: ${t.why}.`);
  const res = await call({
    system: POWER_SYSTEM,
    user: [
      powerBrief(s, p),
      chronicleBrief(s, [`place:${id}`], 10),
      weekSnapshot(s),
      `THE PLAYER: owner of ${s.arcology.name}, population ${s.arcology.population.toLocaleString()}, prosperity ${Math.round(s.arcology.prosperity)}, reputation ${Math.round(s.arcology.rep)}, cash ¤${Math.round(s.arcology.cash).toLocaleString()}.`,
      yourLaws(s), yourDoctrines(s),
      `THE WORLD: ${worldBrief(s).replace(/\n/g, " ")}`,
      `TERMS YOU WOULD SIGN NOW:\n${open.join("\n") || "· none"}`,
      `TERMS YOU WILL NOT SIGN:\n${shut.join("\n") || "· none"}`,
      talk.log.length ? `THE CONVERSATION SO FAR:\n${logText(talk.log, "the player", ruler.name)}` : `This is the first time you've spoken directly.`,
      `THE PLAYER SAYS NOW: ${said}`,
      PLAIN_RULES,
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 900,
    temperature: 0.85,
  });
  if (!res.ok) return { ok: false, says: "", deals: [], error: res.error || "no answer" };
  const out = parseJson<{ says?: string; agreed?: { term?: string; value?: string | number; detail?: string }[]; warmth?: number }>(res.text);
  if (!out?.says) return { ok: false, says: "", deals: [], error: "the answer came back garbled" };
  const says = coarsen(String(out.says)).slice(0, 2400);
  talk.used.n++;
  talk.log.push({ role: "you", text: said.slice(0, 600), week }, { role: "them", text: says, week });
  if (talk.log.length > 60) talk.log.splice(0, talk.log.length - 60);

  const warmth = clamp(Math.round(Number(out.warmth) || 0), -5, 5);
  const room = WARMTH_PER_WEEK - Math.abs(talk.used.warmth);
  const by = Math.sign(warmth) * Math.min(Math.abs(warmth), Math.max(0, room));
  if (by) { shift(s, id, by); talk.used.warmth += by; }
  const deals: string[] = [];
  for (const a of (out.agreed ?? []).slice(0, 3)) {
    if (!a?.term) continue;
    const line = applyTerm(s, id, String(a.term), a.value, String(a.detail ?? ""));
    if (line) deals.push(line);
  }
  if (!deals.length && Math.abs(by) >= 3) chronicle(s, { keys: [`place:${id}`], text: `You spoke to ${ruler.name} of ${p.name}. ${by > 0 ? "It went well." : "It went badly."} You said: "${said.slice(0, 120)}"` });
  return { ok: true, says, deals };
}

export const GOV_VOICE = `WHO SHE IS TO THE OWNER. She is the owner's slave. Governing a city doesn't change that: the owner put her there with a word and can drag her back in chains with another, and the guards in her own city obey the owner over her. Her power is over the people of that city, never over the owner. She talks to the owner as her card says (SHE CALLS YOU, THE POWER BETWEEN YOU, how devoted and how afraid she is): a frightened one is careful and eager to please, a devoted one is proud to have done well for them and anxious when she hasn't, a defiant one pushes but knows what it can cost. Only if THE POWER BETWEEN YOU says she leads does she talk to the owner as anything but her owner.

WHEN THE OWNER IS DISPLEASED. If the owner threatens her, criticises her or punishes her, it lands. She's scared of losing the city, of being brought home, of the cells, of whatever they've done to her before. She apologises, explains, begs, promises, or breaks down, the way she would. She never shrugs it off.

HOW SHE TALKS ABOUT HER CITY. Not like an official filing a report. One or two things that actually happened, with names, what was said, what she did about it, what she's afraid of, what she's proud of, and what she needs. She is exactly as good at this as her card and HOW SHE RUNS IT say: if she's out of her depth it shows (excuses, blaming others, pride in something stupid); if she's ruthless it shows in what she did to someone; if she's soft people walk over her. If she needs something she asks for it as a slave asks her owner for something.

BAD (never like this): "I have implemented your laws. The streets are clean and the patrols keep order. Prosperity is rising and the people are grateful."
BAD (never like this either): "Okay, so. Can you send me some soldiers?" (she is not talking to a colleague)
GOOD (in HER voice, with what she really calls the owner): "Master, I'm sorry, it's the docks again. Tomas, the dock boss, spat at my feet on Tuesday in front of everyone. I had him kneel on the pier for the whole shift change, and now the crews won't load anything until I apologise. I won't, not to him. But three ships are rotting at the pier and it's my fault. Please, could you spare me some soldiers? Just so they see whose city it is."`;

const GOV_SYSTEM = `You play one of the player's slaves in Free Cities, an adult game about owning an arcology where slavery is legal. The player put her in charge of another city, and she runs it for them. She is completely loyal to the player and the city is theirs through her, but she runs it as herself: her personality, her tastes, her flaws are all over how that city is run now. The player is talking to her, by video link or on a visit. Write her side of it.

How she behaves:
- Her card is fact. Her voice, what she calls the player, and THE POWER BETWEEN YOU on her card decide how she talks to them. She has power over thousands of people now, and it shows in how she talks ABOUT them; it never shows in how she talks to the player, who owns her.
- Answer what the player actually said first. Then, if it fits, bring up what's really going on there (WHAT'S GOING WRONG, PEOPLE SHE DEALS WITH). Don't repeat her last letter.
- When the player orders something, she does it if it is in ORDERS, and says so. If the player sends help (support_ orders), record it. If the player is kind or cruel to her, that's a treatment; a threat is coercion, a punishment is cruelty. If the player has her brought home, locked up, or replaced, that is the order (recall, imprison) and you write her reaction to it.
- One to three short paragraphs, mostly what she says, in her speech.

${GOV_VOICE}

${HOUSE_STYLE}

Output ONE strict JSON object and nothing else:
{"says":"what she says and does","orders":[{"order":"order id","value":"if it takes one"}],"treatment":[{"effect":"kindness|cruelty|coercion|recognition|promise_kept|promise_broken|arouse|dominion_up|dominion_down","value":1}],"memory":"one line in her words of what she'll remember from this, or empty"}
orders is [] unless the player actually gave an order she's carrying out or promised help that's in ORDERS.`;

/** Say something to a governor. Mutates the save. */
export async function speakToGovernor(s: SaveState, placeId: string, said: string): Promise<TalkResult> {
  const g = governorshipOf(s, placeId);
  const p = g ? s.people[g.person] : undefined;
  if (!g || !p) return { ok: false, says: "", deals: [], error: "nobody is governing there" };
  if (!modelsAvailable()) return { ok: false, says: "", deals: [], error: "Talking needs a model. Set one in Settings." };
  const week = s.arcology.week;
  if (!g.used || g.used.week !== week) g.used = { week, n: 0 };
  if (g.used.n >= TALK_PER_WEEK + 4) return { ok: false, says: "", deals: [], error: `${p.name} has a city to run. Call again next week.` };
  const orders = Object.entries(GOV_ORDERS).map(([id, o]) => `· ${id}: ${o.note}`);
  const res = await call({
    system: GOV_SYSTEM,
    user: [
      personCard(s, p, said),
      governorBrief(s, g),
      chronicleBrief(s, [`gov:${placeId}`, p.id], 10),
      weekSnapshot(s),
      yourLaws(s),
      `ORDERS SHE CAN CARRY OUT:\n${orders.join("\n")}`,
      g.talk.length ? `THE CONVERSATION SO FAR (what was said, not how to say it: if she talked to the owner as an equal before, that was wrong; she doesn't now):\n${logText(g.talk, "the player", p.name)}` : "",
      `THE PLAYER SAYS NOW: ${said}`,
      PLAIN_RULES,
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 900,
    temperature: 0.9,
  });
  if (!res.ok) return { ok: false, says: "", deals: [], error: res.error || "no answer" };
  const out = parseJson<{ says?: string; orders?: { order?: string; value?: string | number }[]; treatment?: { effect?: string; value?: number }[]; memory?: string }>(res.text);
  if (!out?.says) return { ok: false, says: "", deals: [], error: "the answer came back garbled" };
  const says = coarsen(String(out.says)).slice(0, 2400);
  g.used.n++;
  // You called. That's what she needed, if that's what she needed.
  g.last_heard = week;
  for (const x of g.problems ?? []) if (x.kind === "her") x.severity -= 4;
  g.problems = (g.problems ?? []).filter((x) => x.severity > 0);
  g.talk.push({ role: "you", text: said.slice(0, 600), week }, { role: "her", text: says, week });
  if (g.talk.length > 60) g.talk.splice(0, g.talk.length - 60);
  const deals: string[] = [];
  for (const o of (out.orders ?? []).slice(0, 3)) {
    const def = o?.order ? GOV_ORDERS[String(o.order)] : undefined;
    if (!def) continue;
    const line = def.run(s, g, p, o.value);
    if (line) { deals.push(line); chronicle(s, { keys: [`gov:${placeId}`, p.id], title: "an order", text: `You told ${p.name}: "${said.slice(0, 100)}". ${line}` }); }
    if (o.order === "recall" || o.order === "imprison") break;
  }
  const allowed = new Set(["kindness", "cruelty", "coercion", "recognition", "promise_kept", "promise_broken", "arouse", "dominion_up", "dominion_down"]);
  for (const t of (out.treatment ?? []).slice(0, 2)) {
    if (!t?.effect || !allowed.has(String(t.effect))) continue;
    DYNAMIC_EFFECTS[String(t.effect)].run(s, p, clamp(Number(t.value) || 4, 1, 8));
  }
  const mem = s.memory[p.id];
  if (mem && out.memory && String(out.memory).trim()) remember(mem, { content: coarsen(String(out.memory)).slice(0, 240), week, importance: 6, charge: "warm" });
  return { ok: true, says, deals };
}
