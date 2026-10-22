/**
 * WHO SHE HAS BECOME — a woman who has lived through something since she was last read is written
 * again as who she is now, her new self leads her card, and she isn't read again for weeks.
 */
import { check } from "./harness.ts";

const store: Record<string, string> = {};
const g = globalThis as unknown as Record<string, unknown>;
const hadLS = "localStorage" in g, oldLS = g.localStorage, oldFetch = g.fetch, hadLoc = "location" in g, oldLoc = g.location;
g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
if (!hadLoc) g.location = { origin: "http://test" };
const { setApiKey } = await import("../src/config.ts");
const { newGame } = await import("../src/engine/state.ts");
const { dueToGrow, growPersona } = await import("../src/engine/growth.ts");
const { personCard } = await import("../src/engine/prompts.ts");
const { remember } = await import("../src/engine/memory.ts");
setApiKey("sk-test");

let asked = "";
g.fetch = async (_u: string, init: { body: string }) => {
  asked = JSON.parse(init.body).messages[1].content;
  const out = {
    core_traits: ["calls the owner's cock 'the little thing' to his face and means it", "fixes anything that rattles and lectures you on the tolerances"],
    speech_pattern: "dry, blunt, amused",
    voice: { diction: "engineer's words for bodies", syntax: "short", rhythm: "flat, then a laugh", tics: ["says 'tolerance' about everything", "swears 'kurva' when she cums"], never_says: ["sorry"], agenda: "to be served", example_lines: ["Out of spec again, little thing.", "Kneel. Mouth. Now."] },
    life_history: "Arrived braced in week 1. Courted publicly in week 31. Carried at the Feast of Soles.",
    signature: "She measures the owner's mouth with her cock like she's checking a weld.",
  };
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(out) } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200 });
};

const s = newGame({ seed: "grow", starting_slaves: 3 } as never);
s.models.forge_model = "test/model";
const p = Object.values(s.people).find((x) => x.status === "owned")!;
p.persona.voice = { diction: "says 'like' a lot", tics: ["says 'honestly'"], example_lines: ["I mean, it's just..."] };
p.economics.weeks_owned = 20;
s.arcology.week = 30;
check("nobody is read again for nothing", !dueToGrow(s).includes(p));
remember(s.memory[p.id], { content: "courted in front of the whole arcology", week: 25, importance: 10, core: true });
remember(s.memory[p.id], { content: "carried at the front of the Feast of Soles", week: 27, importance: 9 });
check("after big things happen to her, she's due", dueToGrow(s)[0] === p);
const ok = await growPersona(s, p);
check("she's written again", ok && p.persona.voice?.tics?.[0] === "says 'tolerance' about everything" && p.persona.grown_week === 30);
check("the old fillers are gone, not added to", !JSON.stringify(p.persona.voice).includes("honestly"));
check("she was read from what happened to her", asked.includes("Feast of Soles") && asked.includes("WHO SHE WAS WHEN SHE ARRIVED"));
const card = personCard(s, p, "");
check("who she's become leads her card", card.indexOf("ONLY HER") < card.indexOf("BODY:") && card.includes("WHO SHE HAS BECOME HERE: Arrived braced"));
check("and she isn't read again next week", !dueToGrow(s).includes(p));

g.fetch = oldFetch;
if (hadLS) g.localStorage = oldLS; else delete g.localStorage;
if (!hadLoc) delete g.location; else g.location = oldLoc;
