/**
 * KEPT — your room, your job, your week, and what reaches you once she holds your collar.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { romanceOf } from "../src/engine/romance.ts";
import { tickReign, reignCard } from "../src/engine/reign.ts";
import { yourRoom, allowed, give, take, answerTask, roomBrief, jobOf } from "../src/engine/kept.ts";
import { throughHer, ownedBrief } from "../src/engine/share.ts";
import { herDecides, carryOut } from "../src/engine/herwill.ts";
import { lawsOf } from "../src/engine/court.ts";
import { LAWS } from "../src/data/laws.ts";

function owned(seed: string, style: string) {
  const s = newGame({ seed, starting_slaves: 4, plot: false } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;
  const rom = romanceOf(her); rom.standing = "keeper"; rom.dominion = 100; her.status = "free";
  s.player.owned_by = her.id; s.player.ask_hand = false;
  tickReign(s);
  s.reign!.style = style as never;
  delete s.reign!.room; delete s.reign!.job;
  return { s, her };
}

{
  const { s, her } = owned("kept-cruel", "cruel");
  const room = yourRoom(s)!;
  check("a cruel keeper keeps you on the floor, chained", room.levels.bed === -1 && room.items.includes("chain"));
  check("and you can't go down into the city", !allowed(s, "city") && !allowed(s, "others"));
  check("every scene knows your room", /YOUR ROOM, AS SHE KEEPS IT/.test(reignCard(s, her)) && /chain/.test(roomBrief(s)));
  check("she gives you a job", !!jobOf(s) && /YOUR JOB/.test(reignCard(s, her)));
  const line = give(s, "lift");
  check("she can give you the lift key", allowed(s, "city") && /lift/.test(line), line);
  take(s, "lift");
  check("and take it back", !allowed(s, "city"));
  s.arcology.week++; tickReign(s);
  const tasks = s.reign!.tasks ?? [];
  check("each week there's a list", tasks.length >= 2, tasks);
  const f0 = s.reign!.favour;
  answerTask(s, tasks[0].id, true);
  check("doing it pleases her", s.reign!.favour > f0 && s.reign!.obeyed > 0);
  answerTask(s, tasks[1].id, false);
  check("refusing doesn't", s.reign!.defied > 0);
  s.arcology.week++; tickReign(s);
  check("what you left undone is counted", (s.reign!.tasks ?? []).every((t) => t.state === "open") && tasks.some((t) => t.state === "neglected" || t.state === "done"));
}
{
  const { s } = owned("kept-doting", "doting");
  check("a doting keeper gives you a proper room and the run of the place", yourRoom(s)!.levels.bed >= 2 && allowed(s, "city") && allowed(s, "others"));
  check("unowned, everything's allowed", (() => { const t = newGame({ seed: "free", starting_slaves: 2, plot: false } as never); return allowed(t, "city") && allowed(t, "calls"); })());
}
{
  const { s, her } = owned("kept-events", "vengeful");
  const opts = [{ id: "a", label: "Free her and let her go" }, { id: "b", label: "Sell her to the arcade" }];
  const got = throughHer(s, "people", opts[0], opts);
  check("locked out, what you pick is advice", /You told/.test(got.line), got);
  check("and a vengeful keeper mostly does it her way", got.id === "b" || got.id === "a");
  check("the event writers are told who decides", /RUNS NOTHING/.test(ownedBrief(s)));
  const ans = await herDecides(s, "Please give me back the key to the lift.");
  check("you can ask her for things", /hears you out/.test(ans.said) && (s.reign!.advice ?? []).length === 1);
  const law = LAWS.find((l) => !lawsOf(s).some((x) => x.id === l.id))!;
  const did = carryOut(s, her, s.reign!, [{ do: "law", id: law.id, why: "Because I can." }, { do: "take_you", id: "screen" }, { do: "your_job", id: "brothel" }, { do: "nonsense" }]);
  check("what she decides, happens", lawsOf(s).some((x) => x.id === law.id) && s.reign!.job === "brothel" && did.length >= 2, did);
  check("and you hear about it", s.notifications.some((n) => n.id.startsWith("her-")));
}

// Loving her owner doesn't make a dominant woman soft.
{
  const { styleOf } = await import("../src/engine/reign.ts");
  const { selfProfile } = await import("../src/engine/self.ts");
  const { personCard } = await import("../src/engine/prompts.ts");
  const { s, her } = owned("kept-dom", "stern");
  her.persona.conscience = 0.8; her.bond.bond = 90; her.bond.resentment = 0;
  her.persona.fetishes = [{ name: "dom", strength: 70, known: true }];
  check("a kind woman with a dominant streak isn't read as doting", styleOf(s, her) !== "doting", styleOf(s, her));
  her.persona.fetishes = [];
  for (let i = 0; i < 8; i++) (s.deeds ??= []).push({ id: `d${i}`, week: 1, person: her.id, summary: "She made you kneel.", tags: ["bottomed"], public: false, witnesses: [], effects: [], source: "test" });
  check("nor is one who has been topping you all along", styleOf(s, her) !== "doting", styleOf(s, her));
  s.player.self = "I'm a pain slut. I want to be used and kept hard.";
  check("your own words are read as what being owned is for you", selfProfile(s).some((l) => /what being owned means to them/.test(l) && /pain slut/.test(l)));
  check("her feelings for you aren't written as softness", /That is a feeling rather than a manner/.test(personCard(s, her)));
  s.reign!.portrait = "She keeps you on the floor and uses you when she's bored.";
  check("the reading of her wins in every scene", /HOW SHE KEEPS YOU.*on the floor/.test(personCard(s, her)));
}

// How you two do things is kept, and every scene with her carries it.
{
  const { addWays, setWays } = await import("../src/engine/ways.ts");
  const { personCard } = await import("../src/engine/prompts.ts");
  const { s, her } = owned("kept-ways", "stern");
  addWays(s, her, ["he talks to her soles, never her face, and she answers through them"]);
  addWays(s, her, ["He talks to her soles, never her face, and she answers through them."]);
  check("a way you two do things is kept once", (her.ways ?? []).length === 1);
  check("and her card says to keep it", /HOW YOU TWO DO THINGS[\s\S]*talks to her soles/.test(personCard(s, her)));
  setWays(s, her, Array.from({ length: 14 }, (_, i) => `way number ${i} between them`));
  check("a reading replaces the list, ten at most", (her.ways ?? []).length === 10 && /way number 0/.test(her.ways![0].text));
  check("she tells you, she doesn't ask", /doesn't ask their opinion or their permission/.test(ownedBrief(s)));
}

// She has a body, and she owns you.
{
  const { wantsOf } = await import("../src/engine/herwants.ts");
  const { s, her } = owned("kept-wants", "stern");
  her.body.dick = 4;
  her.ways = [{ text: "he talks to her soles, never her face", week: 1 }];
  const ws = wantsOf(s, her).map((w) => w.text).join(" | ");
  check("what she wants comes from her body and your history together", /cock/.test(ws) && /soles|feet/.test(ws), ws);
  let wanted = false;
  for (let i = 0; i < 6 && !wanted; i++) { s.events = s.events.filter((e) => !e.kind.startsWith("reign_")); s.arcology.week++; tickReign(s); wanted = s.events.some((e) => e.kind === "reign_want"); }
  check("most weeks she wants you", wanted);
  check("and it's on your list", (s.reign!.tasks ?? []).some((t) => t.from === "her"));
  const t = s.reign!.tasks!.find((x) => x.from === "her")!;
  check("going to her is going to her", answerTask(s, t.id, true) === "You go to her.");
}

// What's true of you stays true, and your body gets noticed.
{
  const { ownerLine } = await import("../src/engine/you.ts");
  const { selfProfile } = await import("../src/engine/self.ts");
  const { personCard, HOUSE_STYLE } = await import("../src/engine/prompts.ts");
  const { s, her } = owned("kept-body", "stern");
  s.player.body.dick = 1; her.body.dick = 6;
  check("a tiny cock is called tiny, and noticed", /tiny cock/.test(ownerLine(s)) && /people who see it notice/.test(ownerLine(s)));
  check("and set against hers", /HERS AGAINST YOURS: her cock is enormous[\s\S]*yours is tiny/.test(personCard(s, her)));
  (s.house_rules ??= []).push({ rule: "I only speak to women's feet not their faces, do not make me look up", week: 1, by: "you" });
  check("your own rules are hard lines for everyone", selfProfile(s).some((l) => /hard lines[\s\S]*do not make me look up/.test(l)));
  check("and no stock 'look at me' beat overrides them", /WHAT'S TRUE OF THE PLAYER STAYS TRUE[\s\S]*look at me/.test(HOUSE_STYLE));
}
