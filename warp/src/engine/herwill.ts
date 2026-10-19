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
import { lawScore, reignOf, decide, type Reign } from "./reign";
import { pushNorm } from "./culture";
import { give, take, JOBS, JOB, YOUR_ITEMS } from "./kept";
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
