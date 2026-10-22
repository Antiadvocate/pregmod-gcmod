/**
 * HER WILL — what she actually does with your arcology, decided by her.
 *
 * Once a week, and whenever you go to her with a request or advice, the model plays her and
 * decides. It can only pick from what she can actually do (sign a law, move a woman, sell or free
 * one, punish or reward one, give or take something of yours, change your job, have someone dealt
 * with), and the engine does it. What she picks comes from who she is: her conscience, how sharp
 * she is, what she's into, what she remembers of you, and whether she trusts what you tell her.
 * Without a model the dice in engine/reign do her week instead.
 */
import type { Person, SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { personCard, HOUSE_STYLE } from "./prompts";
import { PLAIN_RULES } from "./style";
import { coarsen } from "./register";
import { weekSnapshot } from "./snapshot";
import { LAWS, LAW_BY_ID } from "../data/laws";
import { ASSIGNMENTS, type AssignmentDef } from "../data/assignments";
import { enact, lawsOf } from "./court";
import { setAssignment, assignToFacility } from "./rules";
import { sell } from "./market";
import { freeHer } from "./freed";
import { applyTreatment, read } from "./obedience";
import { remember } from "./memory";
import { chronicle } from "./chronicle";
import { lawScore, reignOf, decide, reterm, wantNow, type Reign } from "./reign";
import { wantsOf } from "./herwants";
import { selfBrief } from "./self";
import { setWays } from "./ways";
import { pushNorm } from "./culture";
import { give, take, JOBS, JOB, YOUR_ITEMS, yourRoom, jobOf, weekTasks } from "./kept";
import { orderDealt, asFate, settledBrief, weightBrief } from "./fates";
import { knownFaces } from "./faces";
import { clamp } from "./psyche";
import { rng } from "./rng";

const ready = (s: SaveState) => modelsAvailable() && !s.models.lean_mode;

/** Jobs she can give one of the household without a facility to put her in. */
const PLAIN_JOBS: AssignmentDef[] = ASSIGNMENTS.filter((a) => !a.facility && (a.group === "household" || a.group === "public" || a.group === "care"));

const SYSTEM = `You play one woman in Free Cities, an adult game about owning an arcology where slavery is legal. She used to be the player's slave. Now she holds the player's collar and runs the arcology: the household, the laws, the money, and the player, who is her slave. You decide what she does with it, the way SHE would.

How she decides:
- Her card is fact. Her conscience, her tastes, her ruling style, how sharp she is, and what she remembers of the player decide everything. A kind woman protects people; a cruel one enjoys power; a vengeful one pays the player back; a reluctant one keeps asking the player and mostly does what they say. A slow or impaired woman makes clumsy, short-sighted choices; a brilliant one plans.
- She keeps most of what the player built: she only signs laws she actually wants, and she doesn't undo the player's for the sake of it.
- What the player asked or advised: she weighs it by how much she trusts them, whether it suits her, and her mood. She can say yes, say no, do part of it, or do the opposite to make a point. A request to be given something back, to see someone, to be let off a duty, is hers to grant or refuse.
- She acts on real people by name, from THE HOUSEHOLD and PEOPLE OUTSIDE. Never invent anyone.
- She has a body and appetites, and she owns the player. Most weeks one of her actions is want_you: what she wants to do to or with the player, in bed or anywhere she likes, out of her body, her tastes, HOW YOU TWO DO THINGS and what the player says they are. Write it the way she'd want it, explicitly, in the game's crude words.
- Zero to three actions. Doing nothing is a choice too. Each "why" is one line in her own voice, what she'd actually say about it.

${HOUSE_STYLE}

${PLAIN_RULES}

Output ONE strict JSON object and nothing else:
{"actions":[{"do":"ACTION","name":"person, if it takes one","id":"law id, job id, item id or assignment id, if it takes one","why":"her line"}],"to_you":"what she says to the player about what they asked, in her voice, 1-3 sentences; empty if they asked nothing","took_advice":true|false}

ACTIONS:
· law: sign a law into force; id from LAWS SHE COULD SIGN
· assign: put one of the household to work; name, and id from JOBS FOR THE HOUSEHOLD
· sell: sell one of the household; name
· free: free one of the household; name
· punish: have one of the household punished; name
· reward: reward one of the household; name
· give_you: give the player something; id from YOUR THINGS (one they don't have) or a room part (bed, space, bath, view, climate) to make better
· take_you: take something from the player; id from YOUR THINGS (one they have) or a room part to make worse
· your_job: give the player a new job; id from JOBS FOR YOU
· want_you: what she wants from the player this week, sexually or otherwise physically; id is one sentence starting with her name, e.g. "Martina wants your mouth on her cock under the table at tomorrow's meeting". Add "public" to why if other people will be there
· deal_with: have someone outside the household killed, ruined, thrown out, locked up or bought off; name from PEOPLE OUTSIDE, id is kill|ruin|exile|jail|buy`;

interface Act { do?: string; name?: string; id?: string; why?: string }
interface Out { actions?: Act[]; to_you?: string; took_advice?: boolean }

const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
function byName(s: SaveState, name?: string): Person | undefined {
  const n = norm(name ?? "");
  if (!n) return undefined;
  return Object.values(s.people).find((p) => (p.status === "owned" || p.status === "indentured") && p.id !== s.player.owned_by && (norm(p.name) === n || norm(p.name).split(" ").includes(n)));
}

function context(s: SaveState, h: Person, r: Reign, request?: string): string {
  const house = Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.id !== h.id && p.age >= 18);
  const warm = (p: Person) => s.edges.find((e) => e.from === h.id && e.to === p.id)?.warmth ?? 0;
  const laws = LAWS.filter((l) => !lawsOf(s).some((x) => x.id === l.id)).map((l) => ({ l, sc: lawScore(h, r.style, l) })).sort((a, b) => b.sc - a.sc).slice(0, 14);
  const room = r.room;
  const outside = knownFaces(s).filter((f) => !f.fate || f.fate.fate === "bought").slice(0, 12);
  const asked = (r.advice ?? []).filter((a) => s.arcology.week - a.week <= 1 && a.answer === undefined).map((a) => a.text);
  return [
    `## HER\n${personCard(s, h)}`,
    `She is ${h.persona.intelligence} and ${h.persona.education > 60 ? "educated" : h.persona.education > 30 ? "somewhat educated" : "uneducated"}.`,
    `## THE ARCOLOGY\n${s.arcology.name}, week ${s.arcology.week}. Cash ¤${Math.round(s.arcology.cash).toLocaleString()}, reputation ${Math.round(s.arcology.rep)}, prosperity ${Math.round(s.arcology.prosperity)}, security ${Math.round(s.arcology.security)}.\n${weightBrief(s)}`,
    weekSnapshot(s),
    `## LAWS IN FORCE\n${lawsOf(s).map((x) => LAW_BY_ID[x.id]?.name).filter(Boolean).join(", ") || "none"}`,
    `## LAWS SHE COULD SIGN\n${laws.map(({ l }) => `· ${l.id}: ${l.name}: "${l.text}"`).join("\n")}`,
    `## THE HOUSEHOLD\n${house.map((p) => { const rd = read(p, s.memory[p.id]); return `· ${p.name}, ${p.age}: ${p.assignment}; ${rd.label}; ${warm(p) > 40 ? "she's fond of her" : warm(p) < -25 ? "she dislikes her" : "she's neutral about her"}`; }).join("\n") || "nobody"}`,
    `## JOBS FOR THE HOUSEHOLD\n${PLAIN_JOBS.map((a) => `${a.id}`).join(", ")}`,
    `## THE PLAYER, HER SLAVE\nJob: ${r.job ? JOB[r.job]?.name : "none yet"}. Has: ${(room?.items ?? []).join(", ") || "nothing"}. Room: bed ${room?.levels.bed}, space ${room?.levels.space}, bath ${room?.levels.bath}, view ${room?.levels.view}, climate ${room?.levels.climate} (higher is better).`,
    `## YOUR THINGS (item ids)\n${YOUR_ITEMS.map((x) => `${x.id} (${x.name}${x.comfort < 0 ? ", done to them" : ""})`).join(", ")}`,
    `## JOBS FOR YOU\n${JOBS.map((j) => `${j.id} (${j.name})`).join(", ")}`,
    `## THE KIND OF THING SHE MIGHT WANT FROM THE PLAYER (from her body and tastes; she can want anything, these are a start)\n${wantsOf(s, h).slice(0, 6).map((w) => `· ${w.text}`).join("\n")}`,
    outside.length ? `## PEOPLE OUTSIDE\n${outside.map((f) => `· ${f.name}${f.what ? `, ${f.what}` : f.role ? `, ${f.role}` : ""}`).join("\n")}` : "",
    settledBrief(s, 6),
    request ? `## THE PLAYER COMES TO HER NOW AND SAYS\n${request}` : asked.length ? `## WHAT THE PLAYER ASKED OR ADVISED THIS WEEK\n${asked.map((a) => `· ${a}`).join("\n")}` : "## The player hasn't asked her anything this week.",
  ].filter(Boolean).join("\n\n");
}

/** Do what she decided. Returns a line per thing done, in the report's words. */
export function carryOut(s: SaveState, h: Person, r: Reign, acts: Act[]): string[] {
  const out: string[] = [];
  const week = s.arcology.week;
  const say = (text: string, why?: string) => {
    const line = `${text}${why ? ` "${coarsen(why).replace(/^"|"$/g, "").slice(0, 200)}"` : ""}`;
    out.push(line);
    r.log.push({ week, text });
    if (r.log.length > 40) r.log.shift();
    chronicle(s, { keys: [h.id], title: "her decision", text });
  };
  for (const a of acts.slice(0, 3)) {
    const p = byName(s, a.name);
    switch (a.do) {
      case "law": {
        const l = a.id ? LAW_BY_ID[a.id] : undefined;
        if (!l || lawsOf(s).some((x) => x.id === l.id)) break;
        enact(s, l, "keeper");
        r.laws.push(l.id);
        r.last_law = week;
        pushNorm(s, l.norm, l.dir * 5, `${h.name} signed the ${l.name}`);
        say(`${h.name} signed the ${l.name}: "${l.text}"`, a.why);
        break;
      }
      case "assign": {
        const job = PLAIN_JOBS.find((x) => x.id === a.id);
        if (!p || !job) break;
        assignToFacility(s, p, undefined);
        if (setAssignment(s, p, job.id)) break;
        say(`${h.name} put ${p.name} to ${job.label.toLowerCase()}.`, a.why);
        break;
      }
      case "sell": {
        if (!p) break;
        const { price } = sell(s, p);
        say(`${h.name} sold ${p.name} for ¤${Math.round(price).toLocaleString()}.`, a.why);
        break;
      }
      case "free": {
        if (!p) break;
        const res = freeHer(s, p.id, "papers");
        if (res.ok) say(`${h.name} freed ${p.name}.`, a.why);
        break;
      }
      case "punish": {
        if (!p) break;
        applyTreatment(p, { kind: "cruelty", size: 5, why: `${h.name} had her punished` }, week);
        say(`${h.name} had ${p.name} punished.`, a.why);
        break;
      }
      case "reward": {
        if (!p) break;
        applyTreatment(p, { kind: "kindness", size: 4, why: `${h.name} rewarded her` }, week);
        say(`${h.name} rewarded ${p.name}.`, a.why);
        break;
      }
      case "give_you": { const line = give(s, a.id); if (line) say(line, a.why); break; }
      case "take_you": { const line = take(s, a.id); if (line) say(line, a.why); break; }
      case "want_you": {
        const text = coarsen(String(a.id ?? "")).replace(/\s+/g, " ").trim().slice(0, 300);
        if (text.length < 15) break;
        const named = text.startsWith(h.name.split(" ")[0]) ? text : `${h.name.split(" ")[0]} wants ${text.replace(/^(she )?wants /i, "")}`;
        if (wantNow(s, r, named, /public|in front of|everyone|the household|the meeting/i.test(`${a.why ?? ""} ${text}`))) say(`${h.name} wants you.`, a.why);
        break;
      }
      case "your_job": {
        const j = a.id ? JOB[a.id] : undefined;
        if (!j || r.job === j.id) break;
        r.job = j.id;
        say(`${h.name} has a new job for you: ${j.name}.`, a.why);
        break;
      }
      case "deal_with": {
        const fate = asFate(a.id);
        if (!a.name || !fate) break;
        const lines = orderDealt(s, a.name, fate);
        if (lines.length) say(`${h.name} had ${lines[0].replace(/ is dead$/, " killed").replace(/ was /, " ")}.`, a.why);
        break;
      }
    }
  }
  for (const line of out) s.notifications.push({ id: `her-${week}-${s.notifications.length}`, week, text: line, kind: "warning", person: h.id, seen: false });
  return out;
}

/**
 * Her week, or her answer to you. `request` is what you just said to her; without it she runs the
 * week and answers whatever you asked her during it. Without a model, the dice decide her week and
 * she answers a request on trust alone.
 */
export async function herDecides(s: SaveState, request?: string): Promise<{ said: string; did: string[] }> {
  const r = reignOf(s);
  const h = s.player.owned_by ? s.people[s.player.owned_by] : undefined;
  if (!r || !h) return { said: "", did: [] };
  const week = s.arcology.week;
  if (request?.trim()) {
    (r.advice ??= []).push({ week, text: request.trim().slice(0, 500) });
    if (r.advice.length > 20) r.advice.shift();
  }
  const open = (r.advice ?? []).filter((a) => a.answer === undefined);
  if (!ready(s)) {
    if (request) return { said: offlineAnswer(s, h, r), did: [] };
    const house = Object.values(s.people).filter((p) => p.status === "owned" && p.id !== h.id && p.age >= 18);
    const warm = (p: Person) => s.edges.find((e) => e.from === h.id && e.to === p.id)?.warmth ?? 0;
    const text = house.length ? decide(s, h, r, house, warm, rng(`her-week:${week}`)) : "";
    return { said: "", did: text ? [text] : [] };
  }
  const res = await call({
    system: SYSTEM,
    user: context(s, h, r, request),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 900,
    temperature: 0.85,
  });
  const out = res.ok ? parseJson<Out>(res.text) : null;
  if (!out) return { said: request ? offlineAnswer(s, h, r) : "", did: [] };
  const did = carryOut(s, h, r, Array.isArray(out.actions) ? out.actions : []);
  const said = coarsen(String(out.to_you ?? "")).slice(0, 800);
  for (const a of open) { a.answer = said || "she didn't answer"; a.took = !!out.took_advice; }
  if (open.length) {
    r.favour = clamp(r.favour + (out.took_advice ? 1 : 0), -100, 100);
    const mem = s.memory[h.id];
    if (mem) remember(mem, { content: `the owner asked me: ${open.map((a) => a.text).join("; ").slice(0, 160)}, and I ${out.took_advice ? "listened" : "did it my way"}`, week, importance: 5, charge: out.took_advice ? "warm" : "cold" });
  }
  return { said, did };
}

/** No model: she listens or she doesn't, by how much she trusts you and how she rules. */
function offlineAnswer(s: SaveState, h: Person, r: Reign): string {
  const t = read(h, s.memory[h.id]).trust;
  const p = { reluctant: 0.85, doting: 0.6, playful: 0.4, stern: 0.35, cruel: 0.15, vengeful: 0.1 }[r.style] + (t - 40) / 200 + r.favour / 300;
  const last = r.advice!.at(-1)!;
  const yes = rng(`ask:${s.arcology.week}:${last.text}`)() < p;
  last.answer = yes ? "yes" : "no";
  last.took = yes;
  return yes ? `${h.name} hears you out, and says she'll do it.` : `${h.name} hears you out, and says no.`;
}

/* ── who she is with you ────────────────────────────────────────────────────────────────────── */

const READ_SYSTEM = `You read one woman in Free Cities, an adult game about owning an arcology where slavery is legal. She used to be the player's slave and now she holds the player's collar: the player is her slave. Decide how she actually keeps the player, from the evidence, and write it down so every later scene gets it right.

Read the evidence, all of it, and weigh it in this order:
1. What the player says about themself, and anything they've said about how they want to be treated or what they are. She knows the player; she isn't blind to who they are.
2. How it has actually gone between them: the scenes, what she did to the player and what the player did to her, who topped whom, what she said, what the player told her, what she remembers.
3. Who she is: her personality, her conscience, her tastes, what she's into.
What the player says is true of them (where their eyes go, how they talk, what they are) stays true in the portrait and the ways: if a past scene broke it once, that scene was wrong, not the rule. Loving someone and being soft with them are different things. A woman can adore the player and still keep them hard, strictly, cruelly or as a toy, if that's who she is or how it has gone between them. Only call her gentle if the evidence says gentle. Never default to a sweet, protective girlfriend. If she's been dominant with the player, she stays dominant. If she's resented them, it shows.

STYLE is one of: doting (gentle, protective, indulgent), stern (strict, expects obedience, fair), cruel (enjoys hurting and using the player), playful (owning the player is a game, teasing, toying, showing them off), vengeful (paying the player back for what they did to her), reluctant (never wanted it, keeps handing decisions back).

${PLAIN_RULES}

Output ONE strict JSON object and nothing else:
{"style":"one STYLE","ways":["4 to 10 lines: the particular ways the two of them do things, taken from the evidence and kept exactly as they are between these two (rituals, how he talks to her and she to him, what she calls him, what he has to do, what always happens, what never does), so later scenes don't forget them"],"portrait":"4 to 6 plain sentences, second person, present tense, about how she keeps you: what she's like with you in private and in front of people, what she makes you do, what she gives you and what she holds back, what she won't put up with, and where her feelings for you show and where they don't. Specific to her and to what has happened between you."}`;

const STYLES = ["doting", "stern", "cruel", "playful", "vengeful", "reluctant"] as const;

/**
 * Read her: how she keeps you, from what you say about yourself, everything that has passed
 * between you, and who she is. Done in her first week, every couple of months after, and whenever
 * you say it isn't her. In her first weeks her terms and your room follow from it.
 */
export async function readHer(s: SaveState, note?: string): Promise<boolean> {
  const r = reignOf(s);
  const h = s.player.owned_by ? s.people[s.player.owned_by] : undefined;
  if (!r || !h || !ready(s)) return false;
  const mem = s.memory[h.id];
  // All of it that's about you, the moments that defined you two first: a rule made in week 76 is
  // still the rule.
  const aboutYou = (mem?.episodic ?? []).filter((e) => /owner|you\b|\bhe\b|\bhim\b/i.test(e.content))
    .sort((a, b) => Number(!!b.core) - Number(!!a.core) || b.importance - a.importance).slice(0, 30)
    .sort((a, b) => a.week - b.week).map((e) => `· week ${e.week}: ${e.content}`);
  const scenes = (s.moments ?? []).filter((m) => m.person === h.id).slice(-3).map((m) => `${m.title} (week ${m.week}):\n${m.log.slice(-8).map((l) => (l.role === "you" ? `PLAYER: ${l.text}` : l.text)).join("\n").slice(-1600)}`);
  const deeds = (s.deeds ?? []).filter((d) => d.person === h.id).slice(-14).map((d) => `· week ${d.week}: ${d.summary}${d.tags.length ? ` [${d.tags.join(", ")}]` : ""}`);
  const res = await call({
    system: READ_SYSTEM,
    user: [
      selfBrief(s),
      `## HER\n${personCard(s, h)}`,
      r.portrait ? `## THE GAME'S LAST READING OF HER (may be wrong)\n${r.portrait}` : "",
      deeds.length ? `## WHAT HAS PASSED BETWEEN YOU, SCENE BY SCENE\n${deeds.join("\n")}` : "",
      aboutYou.length ? `## WHAT SHE REMEMBERS ABOUT THE PLAYER\n${aboutYou.join("\n")}` : "",
      scenes.length ? `## THE LAST SCENES WITH HER\n${scenes.join("\n\n")}` : "",
      note?.trim() ? `## THE PLAYER SAYS THE LAST READING WAS WRONG, AND WHY (take this seriously)\n${note.trim()}` : "",
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 1300,
    temperature: 0.6,
  });
  const out = res.ok ? parseJson<{ style?: string; portrait?: string; ways?: string[] }>(res.text) : null;
  if (!out?.portrait || String(out.portrait).length < 40) return false;
  const style = (STYLES as readonly string[]).includes(String(out.style)) ? (out.style as Reign["style"]) : r.style;
  const changed = style !== r.style;
  r.style = style;
  r.portrait = coarsen(String(out.portrait)).replace(/\s+/g, " ").trim().slice(0, 1200);
  r.read_week = s.arcology.week;
  if (Array.isArray(out.ways) && out.ways.length) setWays(s, h, out.ways.map((w) => coarsen(String(w))));
  // Early on, everything she first set up for you follows from who she turns out to be. Later, a
  // reading you asked for rewrites her rules; your room and job she changes in her own time.
  const early = s.arcology.week - r.since <= 3;
  if (changed && (early || note?.trim())) {
    reterm(s, h, r);
    if (early) { delete r.room; delete r.job; yourRoom(s); jobOf(s); r.tasks = weekTasks(s, r); }
    s.notifications.push({ id: `read-${s.arcology.week}-${s.notifications.length}`, week: s.arcology.week, text: `${h.name} has new rules for you: you call her "${r.her_title}", you wear ${r.dress}, and you sleep ${r.sleep}.`, kind: "warning", person: h.id, seen: false });
  }
  return true;
}
