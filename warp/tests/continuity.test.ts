/**
 * CONTINUITY, CHECKED IN CODE. A mute woman given lines, a blind woman looking, someone dead turning
 * up: caught without a model call, written once more with the fact named, and shown if it sticks.
 */
import { check } from "./harness.ts";
const store: Record<string, string> = {};
const g = globalThis as unknown as Record<string, unknown>;
const hadLS = "localStorage" in g, oldLS = g.localStorage, oldFetch = g.fetch, hadLoc = "location" in g, oldLoc = g.location;
g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
if (!hadLoc) g.location = { origin: "http://test" };
const { setApiKey } = await import("../src/config.ts");
const { newGame } = await import("../src/engine/state.ts");
const { openMoment, playMoment, momentsOf } = await import("../src/engine/moments.ts");
const { continuitySlips } = await import("../src/engine/continuity.ts");
setApiKey("sk-test");

const s = newGame({ seed: "continuity", starting_slaves: 1 } as never);
s.models.narrator_model = "test/model";
const her = Object.values(s.people).find((p) => p.status === "owned")!;
const first = her.name.split(" ")[0];
her.body.voice = 0;

check("a mute woman given a line is caught", continuitySlips(s, `"Please," she whispers.`, [her]).length === 1);
check("her nodding isn't", continuitySlips(s, "She nods and points at the door.", [her]).length === 0);
her.body.eyes = "blind";
check("a blind woman looking at you is caught", continuitySlips(s, `${first} looks at you for a long moment.`, [her]).some((x) => /blind/.test(x)));
her.body.eyes = "normal";

// Her age, as her page has it. The narrator used to answer "how old are you" with whatever it liked.
her.body.voice = 50;
her.age = 23;
const ageSlip = (t: string) => continuitySlips(s, t, [her]).filter((x) => /not \d+/.test(x));
check("her saying the wrong age is caught", ageSlip(`"I'm nineteen," she says.`).length === 1 && ageSlip(`"I'm 31 years old, Master."`).length === 1);
check("the narration giving her the wrong age is caught", ageSlip(`${first} is twenty-six years old and looks it.`).length === 1 && ageSlip(`The 30-year-old ${first} kneels.`).length === 1);
check("her right age, and an age she once was, aren't", ageSlip(`"I'm twenty-three," she says. "I was nineteen when they took me."`).length === 0 && ageSlip(`"I'm 23 years old."`).length === 0);
check("nor is a number that isn't her age", ageSlip(`"I'm ten minutes late," she says.`).length === 0);
her.body.voice = 0;
s.faces = { "odile marchand": { name: "Odile Marchand", pronoun: "she", age: 40, first: 1, last: 1, seen: 1, fate: { fate: "dead", week: 1, how: "shot" } } } as never;
check("the dead walking in is caught, the dead remembered isn't", continuitySlips(s, "Odile walks in with a tray.", [her]).length === 1 && continuitySlips(s, "She still thinks about Odile.", [her]).length === 0);

// One rewrite with the fact named, and the clean draft is the one kept.
const bodies: string[] = [];
let drafts = [`"Yes, Sir," she says, and kneels.\n\nOPTIONS:\n- a\n- b`, "She kneels without a sound and bows her head.\n\nOPTIONS:\n- a\n- b"];
g.fetch = async (_u: string, init: { body: string }) => {
  bodies.push(init.body);
  const content = init.body.includes("You are the Bookkeeper") ? "{}" : drafts.length > 1 ? drafts.shift()! : drafts[0];
  return new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200 });
};
const id = openMoment(s, { person: her.id, title: "With her", source: "encounter", happened: "" });
await playMoment(s, id, "Kneel.");
const line = momentsOf(s).find((x) => x.id === id)!.log.at(-1)!;
check("a slip is written again with the fact named", bodies.some((b) => b.includes("## CONTINUITY") && b.includes("is mute")));
check("and the clean draft is kept, with nothing flagged", /without a sound/.test(line.text) && !line.slips, line);

// Still wrong after the rewrite: the player is shown what slipped.
drafts = [`"No," she says.\n\nOPTIONS:\n- a\n- b`];
await playMoment(s, id, "Stand up.");
const stuck = momentsOf(s).find((x) => x.id === id)!.log.at(-1)!;
check("and if it sticks, the scene says what slipped", !!stuck.slips?.some((x) => /mute/.test(x)), stuck);
g.fetch = oldFetch;
if (hadLS) g.localStorage = oldLS; else delete g.localStorage;
if (hadLoc) g.location = oldLoc; else delete g.location;
