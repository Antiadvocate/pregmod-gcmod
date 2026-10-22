/**
 * THE OTHER MAN, WRITTEN — every chapter, choice and outcome comes from the model, built from her,
 * the owner and the story so far; the owner can answer in their own words; the engine's facts
 * hold whatever the model writes.
 */
import { check } from "./harness.ts";

const store: Record<string, string> = {};
const g = globalThis as unknown as Record<string, unknown>;
const hadLS = "localStorage" in g, oldLS = g.localStorage, oldFetch = g.fetch, hadLoc = "location" in g, oldLoc = g.location;
g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
if (!hadLoc) g.location = { origin: "http://test" };
const { setApiKey } = await import("../src/config.ts");
const { setOwnerContext } = await import("../src/llm.ts");
const { newGame } = await import("../src/engine/state.ts");
const { begin, answer } = await import("../src/engine/cuckold.ts");
const { writeChapter, writeOutcome, answerOwn } = await import("../src/engine/cuckwriter.ts");
const { ownerLine } = await import("../src/engine/you.ts");
setApiKey("sk-test");

const sent: { system: string; user: string }[] = [];
let reply = (_system: string, _user: string): string => "";
let fail = false;
g.fetch = async (_url: string, init: { body: string }) => {
  const body = JSON.parse(init.body);
  const msgs = body.messages as { role: string; content: string }[];
  const system = msgs.find((m) => m.role === "system")?.content ?? "";
  const user = msgs.find((m) => m.role === "user")?.content ?? "";
  sent.push({ system, user });
  if (fail) return new Response("nope", { status: 500 });
  return new Response(JSON.stringify({ choices: [{ message: { content: reply(system, user) } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200 });
};

const s = newGame({ seed: "cuck-write", starting_slaves: 4 } as never);
s.models.narrator_model = "test/model";
s.player.self = "a soft-handed accountant who never wanted the building and says 'darling' too much";
setOwnerContext(`${ownerLine(s)}\n\nTHE OWNER, IN THEIR OWN WORDS: ${s.player.self}`);
const her = Object.values(s.people).find((p) => p.age >= 18 && p.health.recovery_weeks <= 0)!;
begin(s, her);

const SCENE = `Late, in the penthouse, ${her.name} listens to you and twists the hem of her shift. `.repeat(6);
const men = [{ name: "Kade Whitlock", age: 34, who: "runs a shift on your security detail", manner: "slow to speak, quick to grin, smells of gun oil" }, { name: "Julian Marr", age: 47, who: "a broker", manner: "soft-voiced" }];
reply = () => JSON.stringify({ title: "Asking Her", scene: SCENE, choices: [
  { label: "Kade, darling. The one who stares at you.", move: "pick", man: men[0] },
  { label: "Julian. He's patient, darling.", move: "pick", man: men[1] },
  { label: "Sell her now", move: "sell" },
  { label: "Forget it, darling. Forget I said anything.", move: "never" },
] });
const r1 = await writeChapter(s);
const c = s.cuckold!;
check("the model writes the first chapter", r1.ok && c.chapter?.scene === SCENE.trim(), r1);
check("it's written from her card", sent.at(-1)!.user.includes(her.name) && /## HER/.test(sent.at(-1)!.user));
check("and from the owner's own character", sent.at(-1)!.system.includes("says 'darling' too much"));
check("the choices are the owner speaking, in their voice", /THE CHOICES ARE THE OWNER SPEAKING/.test(sent.at(-1)!.system));
check("nothing in the prompt is a written chapter to copy", !/OUTLINE/.test(sent.at(-1)!.user));
check("a move that isn't allowed is dropped", c.chapter!.choices.length === 3 && !c.chapter!.choices.some((x) => x.move === "sell"));
check("the men are the model's", c.chapter!.choices.filter((x) => x.man).map((x) => x.man!.name).join() === "Kade Whitlock,Julian Marr");

// Your own words: the model reads them as a move, and the engine does it.
reply = (system) => /You read what the owner typed/.test(system) ? JSON.stringify({ move: "pick", man: { name: "Kade Whitlock" } }) : "";
const own = await answerOwn(s, "The guard. Kade. Tell him to come up tonight, darling.");
check("you can answer in your own words", own.ok && c.bull?.name === "Kade Whitlock" && c.log[0].own === true, own);
check("it keeps who he is from the chapter", !!c.bull?.manner.includes("gun oil"));
check("your words are what you said", c.log[0].chose.startsWith("The guard. Kade."));

const OUT = `He comes up at nine. ${her.name} watches the lift doors open and forgets to breathe. `.repeat(3);
reply = () => OUT;
const o1 = await writeOutcome(s);
check("the outcome is the model's", o1.ok && c.log[0].text === OUT.trim());
check("your own words are played out as you said them", /in their own words/.test(sent.at(-1)!.user) && /play out exactly what they said/.test(sent.at(-1)!.system));

// The next chapter: the same man, the story so far, your voice so far.
s.arcology.week = c.due;
reply = () => JSON.stringify({ title: "Dinner", scene: SCENE, choices: [{ label: "Let him, darling. I want to see.", move: "watch" }, { label: "Sit on his lap, sweetheart.", move: "push" }, { label: "No more. Go home, Kade.", move: "stop" }] });
await writeChapter(s);
const u = sent.at(-1)!.user;
check("written from the story so far", /THE STORY SO FAR[\s\S]*forgets to breathe/.test(u));
check("and the same man", u.includes("gun oil") && u.includes("Kade Whitlock"));
check("and everything the owner has said, to match their voice", /WHAT THE OWNER HAS SAID[\s\S]*typed it themselves[\s\S]*Tell him to come up tonight/.test(u));

// A chapter that leaves out a way out is asked for again.
const n = sent.length;
const e = answer(s, c.chapter!.choices[0])!;
e.text = "x";
s.arcology.week = c.due;
let tries = 0;
reply = () => { tries++; return JSON.stringify({ title: "Home Late", scene: SCENE, choices: [{ label: "Tell me everything.", move: "watch" }, { label: "Again.", move: "push" }] }); };
await writeChapter(s);
check("missing a must-have move, the model is asked again, once", tries === 2 && sent.length === n + 2 && /You left out these moves/.test(sent.at(-1)!.user));

// The engine's facts go to the model as facts; a failure writes nothing.
delete c.chapter;
fail = true;
const r2 = await writeChapter(s);
check("a failed call writes nothing", !r2.ok && !c.chapter);
fail = false;

// Events take your own words too, and they always go through.
{
  const { readOwnAnswer } = await import("../src/engine/living.ts");
  const e = { id: "ev1", kind: "test", seed: "A citizen is caught in the stairwell with stolen wine.", options: [{ id: "flog", label: "Have him flogged" }, { id: "fine", label: "Fine him what the wine cost" }, { id: "x0:pardon:", label: "Let him go" }] } as never;
  const typed = "Take what he owes out of his pay, darling, and send him home.";
  reply = () => JSON.stringify({ choice: 2 });
  check("the model's number picks the choice", (await readOwnAnswer(s, e, typed)).id === "fine");
  reply = () => JSON.stringify({ id: "x0:pardon:" });
  check("so does an id", (await readOwnAnswer(s, e, "Let him go.")).id === "x0:pardon:");
  reply = () => JSON.stringify({ choice: "Have him flogged" });
  check("so do a choice's own words", (await readOwnAnswer(s, e, "whip him")).id === "flog");
  // A model that thought and sent nothing, or answered with something that isn't a choice.
  reply = () => "";
  const r1 = await readOwnAnswer(s, e, "Fine him for the wine, then.");
  check("an empty answer still goes through, to the closest choice by your words", r1.id === "fine" && !r1.error, r1);
  reply = () => JSON.stringify({ choice: 9 });
  const r2 = await readOwnAnswer(s, e, "Flog him in the square.");
  check("and so does a wrong one", r2.id === "flog" && !r2.error, r2);
  fail = true;
  const r3 = await readOwnAnswer(s, e, "let him go");
  check("and so does a failed call", r3.id === "x0:pardon:" && !r3.error, r3);
  fail = false;
}

g.fetch = oldFetch;
if (hadLS) g.localStorage = oldLS; else delete g.localStorage;
if (!hadLoc) delete g.location; else g.location = oldLoc;
setOwnerContext("");
