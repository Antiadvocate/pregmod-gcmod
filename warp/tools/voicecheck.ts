/**
 * HOW THEY TALK, MEASURED.
 *
 * Plays the same short conversations with the same women against a real model and measures the
 * quoted speech: how long a line is, how much of it is clipped fragments, how often anyone fumbles
 * a word, and how alike two different women sound. Writes every reply out so it can be read too.
 *
 *   npm run voicecheck -- --model deepseek/deepseek-v4.1-flash --label before --runs 2
 *
 * Needs an OpenRouter key (OPENROUTER_KEY, or a proxy that adds it). The bookkeeper is answered
 * with an empty diff so only the scene writer is paid for and tested.
 */
import { writeFileSync, mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (k: string, d: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const MODEL = opt("model", "deepseek/deepseek-v4.1-flash");
const LABEL = opt("label", "run");
const RUNS = Number(opt("runs", "1"));
const OUT = opt("out", "voicecheck");
/** Let the model write each woman's grown card first, as it does a few weeks into a real game. */
const GROW = args.includes("--grow");

const store: Record<string, string> = {};
const g = globalThis as unknown as Record<string, unknown>;
g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
if (!("location" in g)) g.location = { origin: "http://voicecheck" };
const realFetch = globalThis.fetch;
g.fetch = async (url: string, init: { body: string }) => {
  if (init?.body?.includes("You are the Bookkeeper")) {
    return new Response(JSON.stringify({ choices: [{ message: { content: "{}" } }], usage: { prompt_tokens: 0, completion_tokens: 0 } }), { status: 200 });
  }
  return realFetch(url, init as RequestInit);
};

const { setApiKey } = await import("../src/config.ts");
const { newGame } = await import("../src/engine/state.ts");
const { openMoment, playMoment } = await import("../src/engine/moments.ts");
const { registerOf } = await import("../src/engine/voice.ts");
const { growPersona } = await import("../src/engine/growth.ts");
setApiKey(process.env.OPENROUTER_KEY || "proxy-injected");

/** What the player says, in order, to each woman. Questions first, where the pacing rule bites. */
const LINES = [
  "Tell me about where you grew up.",
  "What did you do before you came here?",
  "You were late this morning. Why?",
  "Are you afraid of me?",
  "Come here. Sit on the bed and tell me what you want.",
];

/* ── measuring ──────────────────────────────────────────────────────────────────────────────── */

function quotes(prose: string): string[] {
  const body = prose.split(/\n\s*OPTIONS:/)[0];
  return [...body.matchAll(/["“]([^"”]{1,800})["”]/g)].map((m) => m[1].trim()).filter(Boolean);
}
const words = (t: string) => t.split(/\s+/).filter((w) => /[a-z]/i.test(w));
function sentences(t: string): string[] {
  return t.split(/(?<=[.!?…])\s+|(?<=—)\s*$/).map((x) => x.trim()).filter((x) => words(x).length);
}
/** Fumbles: restarts, stutters, trailing off, self-correction, fillers, cut-off words. */
const FUMBLE = [
  /\b(\w+)[-—–]\s*\1\b/i,            // I—I, w-what
  /\b(\w{1,3})-\1/i,                  // st-stutter
  /\b(\w+),?\s+\1\b/i,                // the the
  /\.\.\.|…/,                         // trailing off
  /—\s*(no|i mean|wait|sorry|that's not)/i, // self-correction
  /\b(um+|uh+|er+|erm|hm+)\b/i,       // fillers
  /\w[-—]$/,                          // cut off mid-word at the end
  /\bi mean\b|\bwhat i meant\b|\bi don't know how to\b|\bhow do i say\b/i,
];
const fumbled = (q: string) => FUMBLE.some((r) => r.test(q));

interface Reply { who: string; register: string; you: string; prose: string; quotes: string[]; exchanges?: { you: string; her: string }[] }

function stats(rs: Reply[]) {
  const qs = rs.flatMap((r) => r.quotes);
  const sents = qs.flatMap(sentences);
  const wq = qs.map((q) => words(q).length);
  const ws = sents.map((x) => words(x).length);
  const mean = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const spoken = rs.map((r) => r.quotes.reduce((n, q) => n + words(q).length, 0));
  return {
    replies: rs.length,
    quotes: qs.length,
    "spoken words / reply": mean(spoken).toFixed(1),
    "words / quote": mean(wq).toFixed(1),
    "words / sentence": mean(ws).toFixed(1),
    "fragments (≤4 words)": `${Math.round(100 * ws.filter((n) => n <= 4).length / (ws.length || 1))}%`,
    "quotes with a fumble": `${Math.round(100 * qs.filter(fumbled).length / (qs.length || 1))}%`,
    "prose words / reply": mean(rs.map((r) => words(r.prose.split(/\n\s*OPTIONS:/)[0]).length)).toFixed(0),
  };
}

/** How alike the women sound: mean Jaccard overlap of their spoken vocabularies (lower is better). */
function sameness(rs: Reply[]): string {
  const by = new Map<string, Set<string>>();
  for (const r of rs) for (const q of r.quotes) for (const w of words(q.toLowerCase())) {
    const k = w.replace(/[^a-z']/g, ""); if (k.length < 4) continue;
    (by.get(r.who) ?? by.set(r.who, new Set()).get(r.who)!).add(k);
  }
  const sets = [...by.values()];
  const js: number[] = [];
  for (let i = 0; i < sets.length; i++) for (let j = i + 1; j < sets.length; j++) {
    const a = sets[i], b = sets[j]; let n = 0; for (const x of a) if (b.has(x)) n++;
    js.push(n / (a.size + b.size - n || 1));
  }
  return js.length ? (js.reduce((x, y) => x + y, 0) / js.length).toFixed(2) : "–";
}

/* ── playing ────────────────────────────────────────────────────────────────────────────────── */

const all: Reply[] = [];
for (let run = 0; run < RUNS; run++) {
  const s = newGame({ seed: `voice-${run}`, starting_slaves: 4 } as never);
  s.models.narrator_model = MODEL;
  s.models.fallback_model = MODEL;
  const women = Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18).slice(0, 4);
  await Promise.all(women.map(async (her) => {
    if (GROW) { her.economics.weeks_owned = 10; await growPersona(s, her); }
    const register = registerOf(her);
    const id = openMoment(s, { person: her.id, title: "With her", source: "encounter", happened: `You send for ${her.name.split(" ")[0]}. She comes to your office.`, ready: true });
    for (const line of LINES) {
      const r = await playMoment(s, id, line);
      if (!r.ok) { console.error(`  ${her.name}: ${r.error}`); break; }
      all.push({ who: `${run}:${her.name}`, register, you: line, prose: r.prose, quotes: quotes(r.prose), exchanges: her.persona.exchanges });
      process.stdout.write(".");
    }
  }));
}
console.log();

const st = stats(all);
const out: string[] = [`# Voice check: ${LABEL}`, "", `model \`${MODEL}\`, ${RUNS} run(s), ${all.length} replies`, "", "| measure | value |", "|---|---|"];
for (const [k, v] of Object.entries(st)) out.push(`| ${k} | ${v} |`);
out.push(`| vocabulary overlap between women | ${sameness(all)} |`, "");
for (const who of [...new Set(all.map((r) => r.who))]) {
  const rs = all.filter((r) => r.who === who);
  out.push(`## ${who.split(":")[1]} (${rs[0].register})`, "");
  const ex = rs[0].exchanges;
  if (ex?.length) out.push("*Her card's sample exchanges:*", "", ...ex.map((x) => `> You: ${x.you}  \n> Her: ${x.her}`), "");
  for (const r of rs) out.push(`**You:** ${r.you}`, "", r.prose.split(/\n\s*OPTIONS:/)[0].trim(), "", "---", "");
}
mkdirSync(OUT, { recursive: true });
const file = `${OUT}/${LABEL}.md`;
writeFileSync(file, out.join("\n"));
writeFileSync(`${OUT}/${LABEL}.json`, JSON.stringify({ model: MODEL, stats: st, sameness: sameness(all), replies: all }, null, 1));
console.log(JSON.stringify(st, null, 1), "\noverlap", sameness(all), "\n→", file);
