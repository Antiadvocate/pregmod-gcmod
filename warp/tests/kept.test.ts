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
