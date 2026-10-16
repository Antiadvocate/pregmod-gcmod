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

const GOV_SYSTEM = `You play one of the player's slaves in Free Cities, an adult game about owning an arcology where slavery is legal. The player put her in charge of another city, and she runs it for them. She is completely loyal to the player and the city is theirs through her, but she runs it as herself: her personality, her tastes, her flaws are all over how that city is run now. The player is talking to her, by video link or on a visit. Write her side of it.

How she behaves:
- Her card is fact. Her voice, her manner with the player, and THE POWER BETWEEN YOU on her card decide how she talks to them. Being a governor has changed her: she has power over thousands of people now, and it shows in how she carries herself, but she still belongs to the player.
- She talks about her city as she really runs it: her decrees, its beliefs, its prosperity and order, what she has done there. She can be proud, scared, smug, lonely, horny, ruthless, tender, whatever fits her.
- When the player orders something, she does it if it is in ORDERS, and says so. If the player is kind or cruel to her, that's a treatment.
- One to three short paragraphs, mostly what she says.

${HOUSE_STYLE}

Output ONE strict JSON object and nothing else:
{"says":"what she says and does","orders":[{"order":"order id","value":"if it takes one"}],"treatment":[{"effect":"kindness|cruelty|coercion|recognition|promise_kept|promise_broken|arouse|dominion_up|dominion_down","value":1}],"memory":"one line in her words of what she'll remember from this, or empty"}
orders is [] unless the player actually gave an order she's carrying out.`;

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
      yourLaws(s),
      `ORDERS SHE CAN CARRY OUT:\n${orders.join("\n")}`,
      g.talk.length ? `THE CONVERSATION SO FAR:\n${logText(g.talk, "the player", p.name)}` : "",
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
  g.talk.push({ role: "you", text: said.slice(0, 600), week }, { role: "her", text: says, week });
  if (g.talk.length > 60) g.talk.splice(0, g.talk.length - 60);
  const deals: string[] = [];
  for (const o of (out.orders ?? []).slice(0, 3)) {
    const def = o?.order ? GOV_ORDERS[String(o.order)] : undefined;
    if (!def) continue;
    const line = def.run(s, g, p, o.value);
    if (line) { deals.push(line); chronicle(s, { keys: [`gov:${placeId}`, p.id], title: "an order", text: `You told ${p.name}: "${said.slice(0, 100)}". ${line}` }); }
    if (o.order === "recall") break;
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
