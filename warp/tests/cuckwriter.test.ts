/**
 * THE OTHER MAN, WRITTEN — with a model, the chapter and the outcome come from it, built from her,
 * the owner and the story so far; the engine still decides what happens; a failure keeps the
 * game's own words.
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
const { begin } = await import("../src/engine/cuckold.ts");
const { answerBeat, beatNow } = await import("../src/data/cuckold.ts");
const { writeChapter, writeOutcome } = await import("../src/engine/cuckwriter.ts");
const { ownerLine } = await import("../src/engine/you.ts");
setApiKey("sk-test");

const sent: { system: string; user: string }[] = [];
let reply = (_user: string): string => "";
let fail = false;
g.fetch = async (_url: string, init: { body: string }) => {
  const body = JSON.parse(init.body);
  const msgs = body.messages as { role: string; content: string }[];
  const system = msgs.find((m) => m.role === "system")?.content ?? "";
  const user = msgs.find((m) => m.role === "user")?.content ?? "";
  sent.push({ system, user });
  if (fail) return new Response("nope", { status: 500 });
  return new Response(JSON.stringify({ choices: [{ message: { content: reply(user) } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200 });
};

const s = newGame({ seed: "cuck-write", starting_slaves: 4 } as never);
s.models.narrator_model = "test/model";
s.player.self = "a soft-handed accountant who never wanted the building";
setOwnerContext(`${ownerLine(s)}\n\nTHE OWNER, IN THEIR OWN WORDS: ${s.player.self}`);
const her = Object.values(s.people).find((p) => p.age >= 18 && p.health.recovery_weeks <= 0)!;
begin(s, her);

const SCENE = `Late, in the penthouse, ${her.name} stands by the glass and listens to you explain it. `.repeat(6);
reply = () => JSON.stringify({ scene: SCENE, choices: [{ id: "brute", label: "Him. The guard who stares at her" }, { id: "bogus", label: "x" }], him: "Slow to speak, quick to grin, smells of gun oil." });
const r1 = await writeChapter(s);
check("the model writes the chapter", r1.ok && s.cuckold!.written?.scene === SCENE.trim(), r1);
check("it's written from her card", sent.at(-1)!.user.includes(her.name) && /## HER/.test(sent.at(-1)!.user));
check("and from the owner's own description of themself", sent.at(-1)!.system.includes("soft-handed accountant"));
check("the outline is the game's own chapter, to be rewritten", /THE OUTLINE[\s\S]*There are three names/.test(sent.at(-1)!.user));
check("the choices are relabelled, and only real ones", s.cuckold!.written!.labels.brute === "Him. The guard who stares at her" && !("bogus" in s.cuckold!.written!.labels));
const calls = sent.length;
await writeChapter(s);
check("a written chapter isn't written twice", sent.length === calls);

const OUT = `He answers in under a minute. ${her.name} watches you send it and says nothing at all. `.repeat(3);
reply = () => OUT;
const a = answerBeat(s, "brute")!;
check("what you chose is the label you were shown", a.chose === "Him. The guard who stares at her");
check("the chapter you read is kept with the choice", s.cuckold!.log[0].setup === SCENE.trim());
check("the written chapter is cleared for the next one", !s.cuckold!.written);
check("the engine still decided: he's chosen", s.cuckold!.bull?.kind === "brute");
const t = await writeOutcome(s);
check("the outcome is written by the model", t === OUT.trim() && s.cuckold!.log[0].text === OUT.trim() && s.cuckold!.log[0].written === true);
check("the outcome is written from the game's version as the facts", /WHAT HAPPENS \(the game's version/.test(sent.at(-1)!.user));

// The next chapter knows the man and the story so far.
s.arcology.week = s.cuckold!.due;
s.cuckold!.bull!.manner = "Slow to speak, quick to grin, smells of gun oil.";
reply = () => JSON.stringify({ scene: SCENE, choices: [] });
await writeChapter(s);
const u = sent.at(-1)!.user;
check("the next chapter is written from the story so far", /THE STORY SO FAR[\s\S]*Him\. The guard who stares at her/.test(u));
check("and from the same man", u.includes("gun oil") && u.includes(s.cuckold!.bull!.name));

// A model that fails leaves the game's own words.
delete s.cuckold!.written;
fail = true;
const r2 = await writeChapter(s);
check("a failed call writes nothing", !r2.ok && !s.cuckold!.written && !!beatNow(s));
fail = false;

g.fetch = oldFetch;
if (hadLS) g.localStorage = oldLS; else delete g.localStorage;
if (!hadLoc) delete g.location; else g.location = oldLoc;
setOwnerContext("");
