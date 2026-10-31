/**
 * HOW YOU WRITE. The narration is shown the lines the player types and the paragraphs they rewrote,
 * and nothing else: not the clicked options, not the women's voices, and never the paragraph that
 * was rewritten.
 */
import { check } from "./harness.ts";

const store: Record<string, string> = {};
const g = globalThis as unknown as Record<string, unknown>;
const hadLS = "localStorage" in g, oldLS = g.localStorage, oldFetch = g.fetch, hadLoc = "location" in g, oldLoc = g.location;
g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
if (!hadLoc) g.location = { origin: "http://test" };
const { setApiKey, setYourVoice } = await import("../src/config.ts");
const { newGame } = await import("../src/engine/state.ts");
const { openMoment, playMoment, momentsOf } = await import("../src/engine/moments.ts");
const { keepLine, saveRewrite, voiceBrief, rewriteInMoment, rewritesJsonl } = await import("../src/engine/yourvoice.ts");
const { setVoiceContext, call, llmCalls } = await import("../src/llm.ts");
setApiKey("sk-test");

const bodies: { messages: { role: string; content: string }[] }[] = [];
g.fetch = async (_u: string, init: { body: string }) => {
  bodies.push(JSON.parse(init.body));
  const content = init.body.includes("You are the Bookkeeper") ? "{}" : "She grins and drops to her knees.\n\nOPTIONS:\n- Ask more\n- Hold her\n- Kiss her\n- Leave";
  return new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 900, completion_tokens: 40, prompt_tokens_details: { cached_tokens: 700 } } }), { status: 200 });
};

const s = newGame({ seed: "yourvoice", starting_slaves: 2 } as never);
s.models.narrator_model = "test/model";
const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;

const mine = "Fuck me, Sasha, you've got cream on your nose again. Come here, I'll lick it off, and Marta, stop pretending you're not watching and get the door.";
check("a long line you typed is kept", keepLine(s, mine));
check("a short command isn't", !keepLine(s, "Kiss her"));
check("nor a clicked option, however long", !keepLine(s, "Tell her to kneel by the window and wait there quietly for you", ["Tell her to kneel by the window and wait there quietly for you"]));

const id = openMoment(s, { person: her.id, title: "With her", source: "encounter", happened: "She waits.", ready: true });
momentsOf(s).find((m) => m.id === id)!.log.push({ role: "scene", text: "A palpable tension hangs in the air as she searches your face for something unspoken." });
const slop = "A palpable tension hangs in the air as she searches your face for something unspoken.";
const better = "She's staring at your crotch and not even pretending otherwise.";
check("a rewrite goes into the scene in place of the original", rewriteInMoment(s, id, slop, better) && !!saveRewrite(s, { original: slop, rewrite: better, where: "moment", person: her.id }));
setVoiceContext(voiceBrief(s));

setYourVoice(true);
bodies.length = 0;
await playMoment(s, id, "Come here.");
const narr = bodies.find((b) => b.messages[0].content.includes("You continue a scene"))!;
const book = bodies.find((b) => b.messages[0].content.includes("You are the Bookkeeper"));
const all = JSON.stringify(bodies);
check("the narration is shown your lines and your rewrite", narr.messages[0].content.includes("cream on your nose") && narr.messages[0].content.includes("staring at your crotch"));
check("the original is never sent to a model", !all.includes("palpable tension"));
check("the bookkeeper isn't shown your writing", !book || !book.messages[0].content.includes("HOW THE PLAYER WRITES"));
check("and it says the women keep their own voices", /Every woman keeps her own voice/.test(narr.messages[0].content));
check("your writing sits in the part of the prompt that stays the same", narr.messages[0].content.indexOf("HOW THE PLAYER WRITES") > 0 && !narr.messages[1].content.includes("HOW THE PLAYER WRITES"));

setYourVoice(false);
bodies.length = 0;
await playMoment(s, id, "Again.");
check("switched off, the same turn goes without it", !JSON.stringify(bodies).includes("HOW THE PLAYER WRITES"));
setYourVoice(true);

await call({ system: "x", user: "y", model: "test/model", narration: true, tag: "probe" });
const last = llmCalls.at(-1)!;
check("each call's cached tokens are recorded", last.tag === "probe" && last.usage.cached_tokens === 700, last);

const jl = rewritesJsonl(s).trim().split("\n").map((l) => JSON.parse(l));
check("every pair exports as a line of JSON, original and rewrite", jl.length === 1 && jl[0].original === slop && jl[0].rewrite === better && jl[0].person === her.name, jl);

g.fetch = oldFetch;
if (hadLS) g.localStorage = oldLS; else delete g.localStorage;
if (!hadLoc) delete g.location; else g.location = oldLoc;
setVoiceContext("");
