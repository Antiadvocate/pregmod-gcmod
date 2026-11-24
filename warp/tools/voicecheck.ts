/**
 * HOW THEY TALK, MEASURED — and whether they all end up talking the same.
 *
 * Each woman has several separate conversations in a row (the bookkeeper runs for real, so what
 * happened in one is remembered in the next), every woman is asked the same things, and the quoted
 * speech is measured three ways:
 *
 *   1. LENGTH AND MESS: words per sentence, how much is clipped fragments, how often she fumbles.
 *   2. CAN YOU TELL WHO'S TALKING: a judge model gets the women's profiles and one reply with the
 *      names taken out, and says who said it. Chance is 1 in the number of women. Scored per
 *      conversation, so a drop from the first to the last is the house voice taking over.
 *   3. FINGERPRINTS: a style vector per woman per conversation (sentence shape, fragments, fumbles,
 *      swearing, questions, dashes, the small function words stylometry identifies writers by). The
 *      spread between women over the spread within each woman; falling means converging. And the
 *      three-word phrases three or more women share, which is the house voice written down.
 *
 *   npm run voicecheck -- --label after --sessions 4 --grow
 *
 * Needs an OpenRouter key (OPENROUTER_KEY, or a proxy that adds it).
 */
import { writeFileSync, mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (k: string, d: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const MODEL = opt("model", "deepseek/deepseek-v4.1-flash");
const JUDGE = opt("judge", MODEL);
const LABEL = opt("label", "run");
const SESSIONS = Math.min(4, Number(opt("sessions", "4")));
const SEED = opt("seed", "voice-0");
const OUT = opt("out", "voicecheck");
/** Let the model write each woman's grown card first, as it does a few weeks into a real game. */
const GROW = args.includes("--grow");
/** Skip the bookkeeper (cheaper, but nothing carries from one conversation to the next). */
const NOBOOK = args.includes("--nobook");

const store: Record<string, string> = {};
const g = globalThis as unknown as Record<string, unknown>;
g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
if (!("location" in g)) g.location = { origin: "http://voicecheck" };
const realFetch = globalThis.fetch;
g.fetch = async (url: string, init: { body: string }) => {
  if (NOBOOK && init?.body?.includes("You are the Bookkeeper")) {
    return new Response(JSON.stringify({ choices: [{ message: { content: "{}" } }], usage: { prompt_tokens: 0, completion_tokens: 0 } }), { status: 200 });
  }
  return realFetch(url, init as RequestInit);
};

const { setApiKey } = await import("../src/config.ts");
const { newGame } = await import("../src/engine/state.ts");
const { openMoment, playMoment, closeMoment } = await import("../src/engine/moments.ts");
const { registerOf } = await import("../src/engine/voice.ts");
const { growPersona } = await import("../src/engine/growth.ts");
const { call } = await import("../src/llm.ts");
setApiKey(process.env.OPENROUTER_KEY || "proxy-injected");

/** What the player says, conversation by conversation. Every woman hears the same. */
const SESSION_LINES = [
  ["Tell me about where you grew up.", "What did you do before you came here?", "You were late this morning. Why?", "Are you afraid of me?"],
  ["How was your week?", "What do you think of the others here?", "What's the worst thing that's happened to you here?", "Take your clothes off."],
  ["Did you eat today?", "Tell me something you've never told anyone.", "I'm thinking of selling you.", "Come sit with me."],
  ["If I let you go outside for a day, what would you do?", "Who do you miss?", "You did well today.", "Tell me what you want."],
];

/* ── measuring ──────────────────────────────────────────────────────────────────────────────── */

const body = (prose: string) => prose.split(/\n\s*OPTIONS:/)[0];
function quotes(prose: string): string[] {
  return [...body(prose).matchAll(/["“]([^"”]{1,800})["”]/g)].map((m) => m[1].trim()).filter(Boolean);
}
const words = (t: string) => t.split(/\s+/).filter((w) => /[a-z]/i.test(w));
const sentences = (t: string) => t.split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter((x) => words(x).length);
const FUMBLE = [
  /\b(\w+)[-—–]\s*\1\b/i, /\b(\w{1,3})-\1/i, /\b(\w+),?\s+\1\b/i, /\.\.\.|…/,
  /—\s*(no|i mean|wait|sorry|that's not)/i, /\b(um+|uh+|er+|erm|hm+)\b/i, /\w[-—]$/,
  /\bi mean\b|\bwhat i meant\b|\bhow do i say\b/i,
];
const fumbled = (q: string) => FUMBLE.some((r) => r.test(q));
const SWEAR = /\b(fuck\w*|shit\w*|cunt\w*|cock\w*|dick\w*|ass(hole)?|bitch\w*|damn|piss\w*|tits?)\b/gi;
/** The small words stylometry tells writers apart by. */
const FUNCTION = "i me my you your it the a and but so because that this just not no yes what if then like when all was is do don't can't i'm it's there they".split(" ");

interface Reply { who: string; name: string; register: string; session: number; you: string; prose: string; quotes: string[]; guessed?: string }

function lengthStats(rs: Reply[]) {
  const qs = rs.flatMap((r) => r.quotes), ws = qs.flatMap(sentences).map((x) => words(x).length);
  const mean = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  return {
    "spoken words / reply": mean(rs.map((r) => r.quotes.reduce((n, q) => n + words(q).length, 0))).toFixed(1),
    "words / sentence": mean(ws).toFixed(1),
    "fragments (≤4 words)": `${Math.round(100 * ws.filter((n) => n <= 4).length / (ws.length || 1))}%`,
    "quotes with a fumble": `${Math.round(100 * qs.filter(fumbled).length / (qs.length || 1))}%`,
  };
}

/** One woman's speech in one conversation, as numbers. */
function fingerprint(rs: Reply[]): number[] {
  const text = rs.flatMap((r) => r.quotes).join(" ");
  const w = words(text.toLowerCase()).map((x) => x.replace(/[^a-z']/g, ""));
  const n = w.length || 1;
  const sents = rs.flatMap((r) => r.quotes.flatMap(sentences));
  const sl = sents.map((x) => words(x).length);
  const mean = sl.reduce((a, b) => a + b, 0) / (sl.length || 1);
  const sd = Math.sqrt(sl.reduce((a, b) => a + (b - mean) ** 2, 0) / (sl.length || 1));
  const qs = rs.flatMap((r) => r.quotes);
  const per100 = (re: RegExp) => 100 * (text.match(re)?.length ?? 0) / n;
  return [
    mean, sd,
    sl.filter((x) => x <= 4).length / (sl.length || 1),
    qs.filter(fumbled).length / (qs.length || 1),
    per100(SWEAR), per100(/\?/g), per100(/!/g), per100(/—|--/g), per100(/\.\.\.|…/g), per100(/\b(master|mistress|sir)\b/gi),
    new Set(w).size / n,
    w.reduce((a, b) => a + b.length, 0) / n,
    ...FUNCTION.map((f) => 100 * w.filter((x) => x === f).length / n),
  ];
}

function zscore(vs: number[][]): number[][] {
  const d = vs[0].length;
  const mu = Array.from({ length: d }, (_, j) => vs.reduce((a, v) => a + v[j], 0) / vs.length);
  const sd = Array.from({ length: d }, (_, j) => Math.sqrt(vs.reduce((a, v) => a + (v[j] - mu[j]) ** 2, 0) / vs.length) || 1);
  return vs.map((v) => v.map((x, j) => (x - mu[j]) / sd[j]));
}
const dist = (a: number[], b: number[]) => Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0));
const avg = (a: number[]) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;

/** Three-word phrases said by three or more different women: the house voice. */
function shared(rs: Reply[], names: string[]): [string, number][] {
  const by = new Map<string, Set<string>>();
  const mask = new RegExp(`\\b(${names.join("|")})\\b`, "gi");
  for (const r of rs) for (const q of r.quotes) {
    const w = words(q.toLowerCase().replace(mask, "").replace(/\b(master|mistress|sir)\b/g, "")).map((x) => x.replace(/[^a-z']/g, "")).filter(Boolean);
    for (let i = 0; i + 3 <= w.length; i++) {
      const k = w.slice(i, i + 3).join(" ");
      (by.get(k) ?? by.set(k, new Set()).get(k)!).add(r.who);
    }
  }
  return [...by.entries()].filter(([, s]) => s.size >= 3).map(([k, s]) => [k, s.size] as [string, number]).sort((a, b) => b[1] - a[1]);
}

/* ── playing ────────────────────────────────────────────────────────────────────────────────── */

const s = newGame({ seed: SEED, starting_slaves: 4 } as never);
s.models.narrator_model = MODEL;
s.models.fallback_model = MODEL;
const women = Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18).slice(0, 4);
const all: Reply[] = [];

if (GROW) await Promise.all(women.map(async (her) => { her.economics.weeks_owned = 10; await growPersona(s, her); }));
for (let k = 0; k < SESSIONS; k++) {
  await Promise.all(women.map(async (her) => {
    const id = openMoment(s, { person: her.id, title: "With her", source: "encounter", happened: `You send for ${her.name.split(" ")[0]}. She comes to your office.`, ready: true });
    for (const line of SESSION_LINES[k]) {
      const r = await playMoment(s, id, line);
      if (!r.ok) { console.error(`  ${her.name}: ${r.error}`); break; }
      all.push({ who: her.id, name: her.name, register: registerOf(her), session: k, you: line, prose: r.prose, quotes: quotes(r.prose) });
      process.stdout.write(".");
    }
    closeMoment(s, id);
  }));
}
console.log();

/* ── judging ────────────────────────────────────────────────────────────────────────────────── */

const LETTERS = "ABCD";
const names = women.flatMap((p) => [p.name, ...p.name.split(" "), p.slave_name ?? ""]).filter((x) => x.length > 1);
const maskRe = new RegExp(`\\b(${names.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "g");
const profiles = women.map((p, i) => `${LETTERS[i]}. ${p.age}, ${p.origin.nationality}, was a ${p.origin.career}. ${p.origin.background} Talks: ${p.persona.speech_pattern}. Personality: ${p.persona.core_traits.join("; ")}.`).join("\n");
const JUDGE_SYSTEM = "You read a few lines of dialogue and decide which of the listed women said them, from how they talk and what they say. Answer with JSON only: {\"who\":\"A\"} (one letter).";
await Promise.all(all.map(async (r) => {
  if (!r.quotes.length) return;
  const said = r.quotes.map((q) => `"${q.replace(maskRe, "___")}"`).join("\n");
  const res = await call({ system: JUDGE_SYSTEM, user: `THE WOMEN:\n${profiles}\n\nSHE WAS ASKED: "${r.you}"\n\nSHE SAID:\n${said}`, model: JUDGE, json: true, maxTokens: 60, temperature: 0 });
  const m = res.ok ? /"who"\s*:\s*"([A-D])"/.exec(res.text) : null;
  if (m) r.guessed = women[LETTERS.indexOf(m[1])]?.id;
}));

/* ── report ─────────────────────────────────────────────────────────────────────────────────── */

const prints = new Map<string, number[]>();
for (const p of women) for (let k = 0; k < SESSIONS; k++) {
  const rs = all.filter((r) => r.who === p.id && r.session === k);
  if (rs.some((r) => r.quotes.length)) prints.set(`${p.id}|${k}`, fingerprint(rs));
}
const keys = [...prints.keys()];
const zs = zscore([...prints.values()]);
const z = new Map(keys.map((k, i) => [k, zs[i]]));
const within = avg(women.flatMap((p) => {
  const ks = keys.filter((k) => k.startsWith(`${p.id}|`));
  return ks.flatMap((a, i) => ks.slice(i + 1).map((b) => dist(z.get(a)!, z.get(b)!)));
}));

const per = Array.from({ length: SESSIONS }, (_, k) => {
  const rs = all.filter((r) => r.session === k && r.quotes.length);
  const judged = rs.filter((r) => r.guessed);
  const acc = judged.filter((r) => r.guessed === r.who).length / (judged.length || 1);
  const ks = keys.filter((x) => x.endsWith(`|${k}`));
  const between = avg(ks.flatMap((a, i) => ks.slice(i + 1).map((b) => dist(z.get(a)!, z.get(b)!))));
  return { k, acc, n: judged.length, between, ...lengthStats(all.filter((r) => r.session === k)) };
});

const firstNames = women.map((p) => p.name.split(" ")[0]);
const house = shared(all, names);
const judgedAll = all.filter((r) => r.guessed);
const totalAcc = judgedAll.filter((r) => r.guessed === r.who).length / (judgedAll.length || 1);
const tot = lengthStats(all);
const out: string[] = [
  `# Voice check: ${LABEL}`, "",
  `model \`${MODEL}\`, judge \`${JUDGE}\`, ${women.length} women × ${SESSIONS} conversations, ${all.length} replies${GROW ? ", grown cards" : ""}${NOBOOK ? ", no bookkeeper" : ""}`, "",
  "## Who's who", "",
  ...women.map((p) => `- **${p.name}**, ${p.age}, ${p.origin.nationality}, was a ${p.origin.career}; ${registerOf(p)}; talks: ${p.persona.speech_pattern}`), "",
  "## Can you tell who's talking, and do they drift together?", "",
  `Chance is ${Math.round(100 / women.length)}%. Distinctness is the style distance between women over the spread within each woman (${within.toFixed(2)}); near 1 they're no easier to tell apart than one woman on two days.`, "",
  "| conversation | judge picks the right woman | distinctness | words / sentence | fragments | fumbles |", "|---|---|---|---|---|---|",
  ...per.map((x) => `| ${x.k + 1} | ${Math.round(100 * x.acc)}% (${x.n}) | ${(x.between / within).toFixed(2)} | ${x["words / sentence"]} | ${x["fragments (≤4 words)"]} | ${x["quotes with a fumble"]} |`),
  `| all | ${Math.round(100 * totalAcc)}% | | ${tot["words / sentence"]} | ${tot["fragments (≤4 words)"]} | ${tot["quotes with a fumble"]} |`, "",
  "## Who gets mistaken for whom", "",
  "| said by ↓ / judged as → | " + firstNames.join(" | ") + " |", "|---|" + firstNames.map(() => "---").join("|") + "|",
  ...women.map((p) => `| ${p.name.split(" ")[0]} | ${women.map((q) => all.filter((r) => r.who === p.id && r.guessed === q.id).length).join(" | ")} |`), "",
  "## The house voice: phrases three or more women use", "",
  house.length ? house.slice(0, 25).map(([k, n]) => `- "${k}" (${n})`).join("\n") : "_none_", "",
];
const head = out.length;
for (const p of women) {
  out.push(`## ${p.name}`, "");
  for (let k = 0; k < SESSIONS; k++) {
    out.push(`### Conversation ${k + 1}`, "");
    for (const r of all.filter((x) => x.who === p.id && x.session === k)) {
      out.push(`**You:** ${r.you}${r.guessed && r.guessed !== r.who ? ` _(judge thought: ${s.people[r.guessed]?.name.split(" ")[0]})_` : ""}`, "", body(r.prose).trim(), "");
    }
  }
}
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/${LABEL}.md`, out.join("\n"));
writeFileSync(`${OUT}/${LABEL}.json`, JSON.stringify({ model: MODEL, judge: JUDGE, per, within, house, replies: all }, null, 1));
console.log(out.slice(0, head).join("\n"), `\n→ ${OUT}/${LABEL}.md`);
