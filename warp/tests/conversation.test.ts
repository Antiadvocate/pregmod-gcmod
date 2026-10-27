/**
 * HOW A CONVERSATION GOES — nobody walks into a private scene on a dice roll, what she's been
 * overusing is named so the next reply leaves it out, her card shows an ordinary exchange instead
 * of a pile of quirks, and a woman written by the old reading is read again.
 */
import { check } from "./harness.ts";

const store: Record<string, string> = {};
const g = globalThis as unknown as Record<string, unknown>;
const hadLS = "localStorage" in g, oldLS = g.localStorage, oldFetch = g.fetch, hadLoc = "location" in g, oldLoc = g.location;
g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
if (!hadLoc) g.location = { origin: "http://test" };
const { setApiKey } = await import("../src/config.ts");
const { newGame } = await import("../src/engine/state.ts");
const { openMoment, playMoment, momentsOf, overused } = await import("../src/engine/moments.ts");
const { personCard, CONVERSATION } = await import("../src/engine/prompts.ts");
const { dueToGrow, GROW_V } = await import("../src/engine/growth.ts");
setApiKey("sk-test");

const bodies: Record<string, unknown>[] = [];
let reply = "\"Bon. Fine, Master,\" she says. Bon. Bon, she puts the cup down.\n\nOPTIONS:\n- Ask more\n- Hold her\n- Kiss her\n- Leave";
g.fetch = async (_u: string, init: { body: string }) => {
  bodies.push(JSON.parse(init.body));
  return new Response(JSON.stringify({ choices: [{ message: { content: reply } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200 });
};

const s = newGame({ seed: "talk", starting_slaves: 4 } as never);
s.models.narrator_model = "test/model";
const [her, other] = Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);
const id = openMoment(s, { person: her.id, title: "With her", source: "encounter", happened: "" });
for (const line of ["How are you?", "Tell me about your day.", "Did you eat?", "What do you think of the new room?", "Come sit.", "What's on your mind?", "Anything you need?", "Good night."]) await playMoment(s, id, line);
const m = momentsOf(s).find((x) => x.id === id)!;
check("nobody walks into a private scene", !(m.others ?? []).length && !bodies.some((b) => /SOMEONE WALKS IN|GETS IT WRONG/.test(JSON.stringify(b))), m.others);
check("other women are never written in", !(m.others ?? []).includes(other.id));
// The scene call, not the bookkeeper that follows it.
const scenes = bodies.filter((b) => JSON.stringify(b).includes("You continue a scene")) as { messages: { content: string }[]; temperature: number; presence_penalty?: number; max_tokens: number }[];
const last = scenes.at(-1)!;
check("the scene writer is told how a conversation goes", last.messages[0].content.includes("MATCH THE PLAYER'S PACING") && last.messages[0].content.includes(CONVERSATION.slice(0, 40)));
check("calmer settings and room to finish", last.temperature <= 0.85 && (last.presence_penalty ?? 0) > 0 && last.max_tokens >= 1500, [last.temperature, last.presence_penalty, last.max_tokens]);
check("what she's been overusing is named for the next reply", /TOO MUCH LATELY[\s\S]*"bon"/.test(overused(s, her, m)), overused(s, her, m));
check("and it goes in the prompt", last.messages[1].content.includes("TOO MUCH LATELY"));

her.persona.voice = { tics: ["'Bon.', under her breath"], example_lines: ["I am the bread, Master."] };
her.persona.exchanges = [{ you: "How are you?", her: "Tired. The rain kept me up." }];
const card = personCard(s, her, "");
check("her card shows an ordinary exchange instead of quirk lines", card.includes("SAMPLE EXCHANGE") && card.includes("Tired. The rain kept me up.") && !card.includes("I am the bread"));
check("her habits are marked as rare", card.includes("OCCASIONAL HABITS"));

her.persona.grown_week = s.arcology.week; her.persona.grown_v = 1; her.economics.weeks_owned = 10;
check("a woman written by the old reading is read again", GROW_V >= 2 && dueToGrow(s).includes(her));
her.persona.grown_v = 6;
check("one whose voice was flattened by the reading that was taken back is read again", dueToGrow(s).includes(her));
her.persona.grown_v = 5;
check("but one read just before it keeps her voice and isn't read again", !dueToGrow(s).includes(her));

// Nobody talks in riddles, and "fine about what?" gets a plain answer, not two new mysteries.
{
  const { didntFollow, PLAIN_RULES } = await import("../src/engine/style.ts");
  const { whole, partIn, note, record } = await import("../src/engine/others.ts");
  const { MOMENT_SYSTEM } = await import("../src/engine/moments.ts");
  check("everyone who writes a scene is told the player has to follow it", PLAIN_RULES.includes("THE PLAYER HAS TO BE ABLE TO FOLLOW IT") && MOMENT_SYSTEM.includes("THE PLAYER HAS TO BE ABLE TO FOLLOW IT"));
  check("saying you don't follow is heard", !!didntFollow("....what are you asking? I don't understand. Fine about what") && !!didntFollow("what?") && !!didntFollow("What do you mean"));
  check("and ordinary talk isn't mistaken for it", ["Tell me about what happened at the canteen.", "Come here.", "What do you want for dinner?", "Who is she?", "How are you?"].every((x) => !didntFollow(x)));
  const { finishLast } = await import("../src/engine/style.ts");
  const { NARRATOR_SYSTEM } = await import("../src/engine/prompts.ts");
  check("the narrator doesn't put words in the owner's mouth", NARRATOR_SYSTEM.includes("DON'T PUT WORDS IN THEIR MOUTH") && CONVERSATION.includes("NEVER SPEAK FOR THE PLAYER"));
  check("an act is short", NARRATOR_SYSTEM.includes("under 250 words"));
  check("and nobody's voice is flattened into the same plain speech", !PLAIN_RULES.includes("TALK LIKE AN AI") && !/plainer, clumsier/.test(PLAIN_RULES));
  const cut = 'Then, as you finish the fourth nail, she sits up. Her grey eyes come up. "And then I want to be on top of you, and I want to be rough';
  check("a reply cut off mid-sentence ends at its last whole sentence", finishLast(cut).endsWith("Her grey eyes come up."), finishLast(cut));
  check("and a whole one is left alone", finishLast('She laughs. "That tickles."') === 'She laughs. "That tickles."');
  const at = bodies.length;
  await playMoment(s, id, "what are you asking? I don't understand. Fine about what");
  const sent = bodies.slice(at).find((b) => JSON.stringify(b).includes("You continue a scene")) as { messages: { content: string }[] } | undefined;
  check("then the next reply is told to explain plainly and add nothing", !!sent && /THE PLAYER DIDN'T FOLLOW THAT[^\n]*Don't add anything new/.test(sent.messages[1].content));

  const seed = "The storm has the workers' canteen on Block 3 packed, and Daryna is there with the household for the evening meal. Bohdan Kravets kneels in front of her on your order, head down, his mates at the next table watching with their jaws working. Half the canteen is watching too. A woman from the kitchen line, Nel Coster, an older cook with flour on her forearms, says quietly, 'Someone should tell her it's over. She's shaking.' Bohdan's mate mutters, 'He's knelt long enough.'";
  const part = partIn(seed, "Nel Coster");
  check("someone brought into an event remembers their own part of it", part.startsWith("A woman from the kitchen line, Nel Coster") && part.includes("She's shaking.") && !part.includes("storm"), part);
  check("and a record is whole sentences, never cut off mid-thought", /[.!?'"…]$/.test(whole(seed, 200)) && !whole(seed, 200).endsWith("at the next"), whole(seed, 200));
  const f = { name: "Nel Coster", pronoun: "she", age: 40, first: 1, last: 1, seen: 1 } as never;
  note(s, f, "week 4: she spoke up in the canteen.");
  check("with the week said once", !/week \d+: week/.test(record(s, f)), record(s, f));
}

// Nothing happens in isolation: a scene picked up after the world moved is told what happened, and
// the goings-on don't run on one thread.
{
  const { aroundBrief } = await import("../src/engine/snapshot.ts");
  const { goingsCandidates } = await import("../src/engine/goings.ts");
  const w = newGame({ seed: "world moves", starting_slaves: 1 } as never);
  w.models.narrator_model = "test/model";
  const girl = Object.values(w.people).find((p) => p.status === "owned")!;
  const mid = openMoment(w, { person: girl.id, title: "At the silk shop", source: "event", happened: "Yvette holds up a bolt of green silk." });
  w.arcology.week += 2;
  w.deeds = [...(w.deeds ?? []), { id: "big", week: w.arcology.week - 1, summary: "You had half the lower city burned to the ground.", public: true, tags: [], witnesses: [], effects: [], source: "test" } as never];
  check("what else is going on is one list, with the big thing in it", /WHAT ELSE IS GOING ON[\s\S]*half the lower city burned/.test(aroundBrief(w)));
  bodies.length = 0;
  await playMoment(w, mid, "So, the dress.");
  const sent = (bodies.find((b) => JSON.stringify(b).includes("You continue a scene")) as { messages: { content: string }[] } | undefined)?.messages[1].content ?? "";
  check("a scene picked up weeks later is told what happened since", /WHAT'S HAPPENED SINCE THIS SCENE LAST MOVED[\s\S]*half the lower city burned/.test(sent), sent.slice(0, 200));
  bodies.length = 0;
  await playMoment(w, mid, "Go on.");
  const again = (bodies.find((b) => JSON.stringify(b).includes("You continue a scene")) as { messages: { content: string }[] } | undefined)?.messages[1].content ?? "";
  check("but not every turn after that", !/WHAT'S HAPPENED SINCE/.test(again));

  // Goings: a big thing becomes fallout for her, her interests take turns, and the last outsider sits out.
  girl.persona.interests = ["sews her own dresses", "plays cards with the guards", "reads trashy novels"];
  const cands = goingsCandidates(w).filter((c) => c.main.id === girl.id);
  check("something big becomes an event about how it lands on her", cands.some((c) => c.kind === "fallout" && c.facts.some((f) => /burned/.test(f))));
  const own1 = cands.find((c) => c.kind === "pursuit")!.facts.join(" ");
  w.goings_seen = [{ week: w.arcology.week - 1, person: girl.id, key: `own:${girl.id}`, title: "The dress", who: ["Yvette Charron"] }];
  const own2 = goingsCandidates(w).find((c) => c.main.id === girl.id && c.kind === "pursuit")!.facts.join(" ");
  check("her own time is one interest at a time, and it changes", /sews her own dresses/i.test(own1) && !/sews/i.test(own2) && /plays cards/i.test(own2), [own1, own2]);
  w.faces = { "yvette charron": { name: "Yvette Charron", pronoun: "she", age: 38, first: 1, last: 5, seen: 3, ties: [{ what: "her tailor", person: girl.id }] }, "nel coster": { name: "Nel Coster", pronoun: "she", age: 40, first: 1, last: 5, seen: 2, ties: [{ what: "a regular at the baths", person: girl.id }] } } as never;
  w.deeds.push({ id: "told", week: w.arcology.week - 1, summary: "You told Nel Coster to stop bothering Chloé.", public: false, tags: [], witnesses: [], effects: [], source: "test" } as never);
  const out = goingsCandidates(w).find((c) => c.main.id === girl.id && c.kind === "outside")!.facts.join(" ");
  check("the outsider from her last goings-on sits this one out", !/Yvette/.test(out) && /Nel Coster/.test(out), out);
  check("and what the owner said about the others comes with them", /What the owner did about Nel Coster[^.]*stop bothering/.test(out));
}

g.fetch = oldFetch;
if (hadLS) g.localStorage = oldLS; else delete g.localStorage;
if (!hadLoc) delete g.location; else g.location = oldLoc;

// The voice: no screenwriter lines, outsiders fold when the owner is angry, and the player's word
// on how she talks beats the voice the game wrote for her.
{
  const { PLAIN_RULES } = await import("../src/engine/style.ts");
  const { HOUSE_STYLE } = await import("../src/engine/prompts.ts");
  const { propsAgain } = await import("../src/engine/moments.ts");
  const { setSpeech } = await import("../src/engine/voice.ts");
  check("the writer is told nobody talks like a screenwriter", /NOBODY TALKS LIKE A SCREENWRITER/.test(PLAIN_RULES) && /builds to a closing line/.test(PLAIN_RULES));
  check("and that a threatened outsider is frightened, not brave", /they are frightened/.test(HOUSE_STYLE) && /belongs in a film/.test(HOUSE_STYLE));
  const replies = [
    `Chloé turns the gold band on her wrist. "I know what I am," she says.`,
    `Her fingers stop on the gold band. "I know what I am, Madame."`,
  ];
  const again = propsAgain(replies, ["Chloé"]);
  check("a prop the narration keeps going back to is named", again.includes("gold band"), again);
  check("but what people say isn't, since that's the plot", !again.some((k) => /know what/.test(k)), again);
  const girl = Object.values(s.people).find((p) => p.status === "owned")!;
  girl.persona.voice = { ...(girl.persona.voice ?? {}), diction: "Plain, careful English.", never_says: ["Uses slang like 'like'."], example_lines: ["Yes, Master."] } as never;
  setSpeech(girl, "Valley girl, talks like a typical eighteen-year-old");
  const said = personCard(s, girl, "");
  check("the player's word on how she talks wins on her card", /SPEECH STYLE: Valley girl[^\n]*The player set this/.test(said) && !/Plain, careful English/.test(said) && !/Uses slang like/.test(said), said.match(/SPEECH STYLE[^\n]*/)?.[0]);
}
