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
check("the scene writer is told how a conversation goes", last.messages[0].content.includes("LENGTH FOLLOWS THE PLAYER") && last.messages[0].content.includes(CONVERSATION.slice(0, 40)));
check("calmer settings and room to finish", last.temperature <= 0.85 && (last.presence_penalty ?? 0) > 0 && last.max_tokens >= 1500, [last.temperature, last.presence_penalty, last.max_tokens]);
check("what she's been overusing is named for the next reply", /TOO MUCH LATELY[\s\S]*"bon"/.test(overused(s, her, m)), overused(s, her, m));
check("and it goes in the prompt", last.messages[1].content.includes("TOO MUCH LATELY"));

her.persona.voice = { tics: ["'Bon.', under her breath"], example_lines: ["I am the bread, Master."] };
her.persona.exchanges = [{ you: "How are you?", her: "Tired. The rain kept me up." }];
const card = personCard(s, her, "");
check("her card shows an ordinary exchange instead of quirk lines", card.includes("AN ORDINARY EXCHANGE WITH HER") && card.includes("Tired. The rain kept me up.") && !card.includes("I am the bread"));
check("her habits are marked as rare", card.includes("HABITS SHE HAS NOW AND THEN"));

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
  check("the narrator doesn't put words in the owner's mouth", NARRATOR_SYSTEM.includes("DON'T TALK FOR THEM") && CONVERSATION.includes("THE PLAYER SPEAKS FOR THEMSELVES"));
  check("an act is short", NARRATOR_SYSTEM.includes("under about 250 words"));
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

g.fetch = oldFetch;
if (hadLS) g.localStorage = oldLS; else delete g.localStorage;
if (!hadLoc) delete g.location; else g.location = oldLoc;
