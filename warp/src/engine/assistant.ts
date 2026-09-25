/**
 * THE PERSONAL ASSISTANT — the arcology's AI, the one voice that is always in the room.
 *
 * In the original the PA was an avatar you dressed and named, who commented on your week. Here she
 * reads the whole state: the week's report, the deeds, the threads, the world, and who in the
 * household is closest to breaking. You pick her look and her manner. Every question has a real
 * answer computed from the save; with a model she says it in her own voice and can take any
 * question, and without one she says the same facts in a written voice for her manner.
 */
import type { Person, SaveState } from "./types";
import { call } from "../llm";
import { modelsAvailable } from "../config";
import { HOUSE_STYLE, digest } from "./prompts";
import { deedsBrief } from "./deeds";
import { cultureBrief } from "./culture";
import { lawsBrief } from "./court";
import { read } from "./obedience";
import { worldBrief, comingUp } from "./world";
import { liveThreads, describeThread } from "./threads";
import { rng } from "./rng";

export type PALook = "classic" | "businesswoman" | "goddess" | "imp" | "angel" | "succubus" | "witch" | "schoolgirl" | "amazon" | "shadow";
export type PAManner = "loyal" | "sardonic" | "sultry" | "cold" | "motherly" | "bratty";

export interface Assistant {
  name: string;
  look: PALook;
  manner: PAManner;
  /** Her colour, for the avatar. */
  hue: number;
  created: number;
  brief?: { week: number; text: string };
  log: { role: "you" | "pa"; text: string; week: number }[];
}

export const PA_LOOKS: Record<PALook, { name: string; note: string }> = {
  classic: { name: "A face on the wall", note: "the default: a calm face in the wall screens" },
  businesswoman: { name: "Businesswoman", note: "a suit, glasses, a tablet under her arm" },
  goddess: { name: "Goddess", note: "tall, glowing, draped in almost nothing" },
  imp: { name: "Imp", note: "a small horned thing that sits on your shoulder" },
  angel: { name: "Angel", note: "wings, a white robe, a halo that dims when she disapproves" },
  succubus: { name: "Succubus", note: "horns, a tail, and very little else" },
  witch: { name: "Witch", note: "a pointed hat and a cauldron of numbers" },
  schoolgirl: { name: "Schoolgirl", note: "a uniform and a notebook full of your secrets" },
  amazon: { name: "Amazon", note: "a warrior with a spear who reports like a sergeant" },
  shadow: { name: "Shadow", note: "a dark shape with bright eyes, always half out of frame" },
};

export const PA_MANNERS: Record<PAManner, { name: string; note: string; voice: string }> = {
  loyal: { name: "Loyal", note: "devoted to you, quietly proud when you do well", voice: "devoted and warm, calls you by your title, proud of you, never mocks you" },
  sardonic: { name: "Sardonic", note: "dry, amused, tells you the truth with a raised eyebrow", voice: "dry and amused, deadpan, understated jokes at your expense, always accurate" },
  sultry: { name: "Sultry", note: "flirts with you constantly, even about the accounts", voice: "flirtatious and teasing, turns everything into innuendo, still gives the numbers" },
  cold: { name: "Cold", note: "a machine, and makes no secret of it", voice: "clipped and precise, no feelings, numbers first, short sentences" },
  motherly: { name: "Motherly", note: "worries about you and about the girls", voice: "caring and fussy, worries about the slaves' health and yours, gently scolds" },
  bratty: { name: "Bratty", note: "sulks, sasses, and gets it right anyway", voice: "bratty and sulky, complains about being asked, sighs, then gets it exactly right" },
};

export function assistantOf(s: SaveState): Assistant | undefined {
  return s.assistant;
}

export function makeAssistant(s: SaveState, o: { name: string; look: PALook; manner: PAManner; hue?: number }): Assistant {
  s.assistant = { name: o.name.trim() || "Aria", look: o.look, manner: o.manner, hue: o.hue ?? 210, created: s.arcology.week, log: [] };
  return s.assistant;
}

/* ── the facts she draws on ─────────────────────────────────────────────────────────────────── */

const owned = (s: SaveState) => Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);

export interface Fact { topic: string; lines: string[] }

export const PA_QUESTIONS: { id: string; label: string }[] = [
  { id: "money", label: "How's the money?" },
  { id: "danger", label: "Who's closest to breaking?" },
  { id: "loyal", label: "Who's most loyal to me?" },
  { id: "bonds", label: "Who likes whom?" },
  { id: "coming", label: "What's coming?" },
  { id: "city", label: "What are people saying about me?" },
];

export function facts(s: SaveState, topic: string): Fact {
  const rep = s.reports[s.reports.length - 1];
  const house = owned(s);
  switch (topic) {
    case "money": {
      const net = rep ? rep.cash_end - rep.cash_start : 0;
      const top = rep ? [...rep.ledger].sort((a, b) => b.cash - a.cash) : [];
      const earn = top.filter((l) => l.cash > 0).slice(0, 2).map((l) => `${l.label} (¤${Math.round(l.cash).toLocaleString()})`);
      const cost = top.filter((l) => l.cash < 0).slice(-2).map((l) => `${l.label} (¤${Math.round(-l.cash).toLocaleString()})`);
      const loans = s.arcology.loans.reduce((n, l) => n + l.principal, 0);
      return { topic, lines: [
        `Cash on hand: ¤${Math.round(s.arcology.cash).toLocaleString()}.`,
        rep ? `Last week you ${net >= 0 ? "made" : "lost"} ¤${Math.abs(Math.round(net)).toLocaleString()}.` : "No full week on the books yet.",
        earn.length ? `Biggest earners: ${earn.join(", ")}.` : "",
        cost.length ? `Biggest costs: ${cost.join(", ")}.` : "",
        loans ? `You owe ¤${Math.round(loans).toLocaleString()} in loans.` : "",
      ].filter(Boolean) };
    }
    case "danger": {
      const worst = [...house].sort((a, b) => (b.bond.resentment - read(b).devotion / 2) - (a.bond.resentment - read(a).devotion / 2)).slice(0, 3);
      return { topic, lines: worst.length ? worst.map((p) => `${p.name}: resentment ${Math.round(p.bond.resentment)}, devotion ${read(p).devotion}${p.psyche.state !== "intact" ? `, ${p.psyche.state}` : ""}${p.bond.fear > 60 ? ", obeying out of fear" : ""}.`) : ["You don't own anyone."] };
    }
    case "loyal": {
      const best = [...house].sort((a, b) => read(b).devotion - read(a).devotion).slice(0, 3);
      return { topic, lines: best.length ? best.map((p) => `${p.name}: devotion ${read(p).devotion}, trust ${read(p).trust}${p.romance && p.romance.standing !== "property" ? `, ${p.romance.standing}` : ""}.`) : ["You don't own anyone."] };
    }
    case "bonds": {
      const ids = new Set(house.map((p) => p.id));
      const strong = s.edges.filter((e) => ids.has(e.from) && ids.has(e.to) && (Math.abs(e.warmth) > 40 || e.roles.length)).sort((a, b) => Math.abs(b.warmth) - Math.abs(a.warmth)).slice(0, 5);
      const nm = (id: string) => s.people[id]?.name ?? "someone";
      const threads = liveThreads(s).slice(0, 3).map((t) => { const d = describeThread(s, t); return `${d.name}${d.who.length ? `: ${d.who.join(" and ")}` : ""}.`; });
      return { topic, lines: [...strong.map((e) => `${nm(e.from)} ${e.roles.length ? `is ${nm(e.to)}'s ${e.roles[0]}` : e.warmth > 0 ? `likes ${nm(e.to)}` : `can't stand ${nm(e.to)}`} (${Math.round(e.warmth)}).`), ...threads].slice(0, 7).concat(strong.length || threads.length ? [] : ["Nobody's close to anybody yet, and nobody's at anybody's throat."]) };
    }
    case "coming": {
      const c = s.world ? comingUp(s).slice(0, 5).map((x) => `${x.weeks ? `In ${x.weeks} week${x.weeks === 1 ? "" : "s"}` : "Now"}: ${x.text}`) : [];
      const echoes = (s.deeds ?? []).filter((d) => d.follow && !d.follow.fired).map((d) => `Week ${d.follow!.due}: something comes of "${d.summary.slice(0, 70)}"`).slice(0, 3);
      return { topic, lines: [...c, ...echoes].length ? [...c, ...echoes] : ["Nothing I can see yet."] };
    }
    case "city": {
      const rumors = [...s.rumors].sort((a, b) => b.salience - a.salience).slice(0, 3).map((r) => `"${r.content}"`);
      const deeds = (s.deeds ?? []).filter((d) => d.public).slice(-2).map((d) => d.summary);
      return { topic, lines: [`Reputation ${Math.round(s.arcology.rep)}; the city's opinion of you is ${s.arcology.public_standing >= 3 ? "good" : s.arcology.public_standing <= -3 ? "poor" : "mixed"}.`, ...rumors.map((r) => `People are saying ${r}.`), ...deeds.map((d) => `Everyone knows: ${d}`), ...cultureBrief(s).split("\n").filter(Boolean), ...lawsBrief(s).split("\n").filter(Boolean)] };
    }
  }
  return { topic, lines: [] };
}

/* ── her voice, without a model ─────────────────────────────────────────────────────────────── */

const OPENERS: Record<PAManner, string[]> = {
  loyal: ["Of course, {title}.", "Right away, {title}.", "Here it is, {title}."],
  sardonic: ["Brace yourself.", "You'll love this.", "Since you asked."],
  sultry: ["Mm, I thought you'd never ask.", "Come closer and I'll tell you.", "For you? Anything."],
  cold: ["Report.", "Summary follows.", "Data."],
  motherly: ["Sit down first, dear.", "Now don't worry, but.", "I've been keeping an eye on it."],
  bratty: ["Ugh. Fine.", "You could've looked yourself, you know.", "Do I have to? Fine."],
};
const CLOSERS: Record<PAManner, string[]> = {
  loyal: ["I'll keep watching.", "Whatever you decide, I'm with you."],
  sardonic: ["Try not to make it worse.", "I'd say good luck, but I've seen your decisions."],
  sultry: ["Now, was that worth what you'll give me for it?", "Don't keep me waiting next time."],
  cold: ["End.", "No further data."],
  motherly: ["And eat something, please.", "Be gentle with them. And with yourself."],
  bratty: ["There. Happy now?", "You're welcome, I guess."],
};

export function voiced(s: SaveState, a: Assistant, lines: string[], seed: string): string {
  const r = rng(`pa:${seed}:${s.arcology.week}`);
  const title = s.player.address || "Master";
  return [r.pick(OPENERS[a.manner]).replace("{title}", title), ...lines, r.pick(CLOSERS[a.manner])].join(" ");
}

export function paSystem(s: SaveState, a: Assistant): string {
  const m = PA_MANNERS[a.manner];
  return `You are ${a.name}, the personal assistant AI of ${s.arcology.name}, an arcology in the Free Cities where slavery is legal. You serve its owner. You appear as ${PA_LOOKS[a.look].note}. Your manner: ${m.voice}.

${HOUSE_STYLE}

You know everything in the state document. Answer the owner directly, in character, in 2 to 6 sentences, with the real numbers and names. Never invent facts that aren't in the state. Don't write stage directions longer than a few words.`;
}

/** Ask her anything. */
export async function askAssistant(s: SaveState, question: string, topic?: string): Promise<string> {
  const a = s.assistant;
  if (!a) return "";
  a.log.push({ role: "you", text: question, week: s.arcology.week });
  const f = topic ? facts(s, topic) : undefined;
  let text = "";
  if (modelsAvailable()) {
    const rep = s.reports[s.reports.length - 1];
    const res = await call({
      system: paSystem(s, a),
      user: `${digest(s, question)}\n\n${rep ? `## LAST WEEK\n${rep.lines.slice(0, 12).map((l) => `· ${l.text}`).join("\n")}\nCash ${Math.round(rep.cash_start)} → ${Math.round(rep.cash_end)}.` : ""}\n\n${deedsBrief(s) ? `## DEEDS\n${deedsBrief(s)}` : ""}\n\n${f ? `## THE FACTS FOR THIS QUESTION\n${f.lines.join("\n")}` : ""}\n\n## THE OWNER ASKS\n${question}`,
      model: s.models.narrator_model, fallback: s.models.fallback_model, maxTokens: 400, temperature: 0.85,
    });
    if (res.ok) text = res.text.trim();
  }
  if (!text) text = f ? voiced(s, a, f.lines, question) : voiced(s, a, [guess(s, question)], question);
  a.log.push({ role: "pa", text, week: s.arcology.week });
  if (a.log.length > 60) a.log = a.log.slice(-60);
  return text;
}

/** A typed question with no model: find the topic it's closest to, or a person it names. */
function guess(s: SaveState, q: string): string {
  const t = q.toLowerCase();
  const who = owned(s).find((p) => t.includes(p.name.toLowerCase()));
  if (who) return aboutHer(s, who);
  if (/money|cash|cost|earn|debt|loan/.test(t)) return facts(s, "money").lines.join(" ");
  if (/rebel|resent|hate|danger|break|escape/.test(t)) return facts(s, "danger").lines.join(" ");
  if (/love|loyal|devot|trust/.test(t)) return facts(s, "loyal").lines.join(" ");
  if (/coming|next|future|storm|war/.test(t)) return facts(s, "coming").lines.join(" ");
  if (/city|rumou?r|reputation|saying/.test(t)) return facts(s, "city").lines.join(" ");
  return "I don't have an answer to that in my records. Ask me about money, the household, what's coming, or one of the girls by name.";
}

function aboutHer(s: SaveState, p: Person): string {
  const r = read(p, s.memory[p.id]);
  const mem = s.memory[p.id]?.episodic.slice(-1)[0];
  return `${p.name}: ${r.label}, devotion ${r.devotion}, trust ${r.trust}, resentment ${Math.round(p.bond.resentment)}. She's ${p.assignment}.${mem ? ` Last thing on her mind: ${mem.content}.` : ""}`;
}

/** Weekly: her brief on the week just ended. Offline it is ready at once; with a model the view
 *  asks for the voiced version when it's opened. */
export function briefOffline(s: SaveState): string {
  const a = s.assistant;
  const rep = s.reports[s.reports.length - 1];
  if (!a || !rep) return "";
  const top = rep.lines.slice(0, 3).map((l) => l.text);
  const net = rep.cash_end - rep.cash_start;
  return voiced(s, a, [`Week ${rep.week} is done. You ${net >= 0 ? "made" : "lost"} ¤${Math.abs(Math.round(net)).toLocaleString()}.`, ...top], `brief${rep.week}`);
}

export async function briefWeek(s: SaveState): Promise<string> {
  const a = s.assistant;
  const rep = s.reports[s.reports.length - 1];
  if (!a || !rep) return "";
  if (a.brief?.week === rep.week) return a.brief.text;
  let text = "";
  if (modelsAvailable()) {
    const res = await call({
      system: paSystem(s, a),
      user: `${s.world ? `## THE WORLD\n${worldBrief(s)}\n\n` : ""}## THE WEEK THAT JUST ENDED (week ${rep.week})\n${rep.lines.slice(0, 16).map((l) => `· ${l.text}`).join("\n")}\nCash ${Math.round(rep.cash_start)} → ${Math.round(rep.cash_end)}; reputation ${Math.round(rep.rep_start)} → ${Math.round(rep.rep_end)}.\n${rep.problems.length ? `Problems: ${rep.problems.join("; ")}` : ""}\n\nBrief the owner on the week: the two or three things that matter most and what you'd do about them. 3 to 5 sentences, in character.`,
      model: s.models.narrator_model, fallback: s.models.fallback_model, maxTokens: 350, temperature: 0.85,
    });
    if (res.ok) text = res.text.trim();
  }
  if (!text) text = briefOffline(s);
  a.brief = { week: rep.week, text };
  return text;
}
