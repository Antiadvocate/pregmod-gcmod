/**
 * DEEDS — an ended scene changes her, the household, the story and what happens next.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { openMoment, playMoment, momentsOf } from "../src/engine/moments.ts";
import { concludeMoment, deedsOf, applyDeed } from "../src/engine/deeds.ts";
import { romanceOf } from "../src/engine/romance.ts";
import { reversalOf } from "../src/engine/reversal.ts";
import { digest, personCard } from "../src/engine/prompts.ts";

{
  const s = newGame({ seed: "deeds-a", starting_slaves: 4, plot: false } as never);
  const house = Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);
  const her = house[0];
  const id = openMoment(s, { person: her.id, title: "After the rescue", source: "test", you: "You thank her.", happened: `${her.name} nods.` });
  await playMoment(s, id, "I kneel in front of her. I'll be your slave. Take my collar.");
  const m = momentsOf(s).find((x) => x.id === id)!;
  const d = await concludeMoment(s, m);
  check("ending a scene leaves a deed", !!d && deedsOf(s).length === 1);
  check("giving yourself to her is read from your own words", !!d?.tags.includes("owner_enslaved"), d?.tags);
  check("she holds your collar now", romanceOf(her).standing === "keeper" && s.player.owned_by === her.id, romanceOf(her).standing);
  check("the arcology's deference moves", reversalOf(s).deference > 0);
  check("the story counts it", Number(s.story!.flags["deed_owner_enslaved"]) === 1);
  check("the narrator is told", digest(s).includes("WHAT YOU HAVE DONE") && personCard(s, her).includes("SHE OWNS YOU"));
  check("she remembers it", s.memory[her.id].episodic.some((e) => e.week === s.arcology.week && e.core));
  check("something is scheduled to come of it", !!d?.follow && d.follow.due > s.arcology.week);
  let echoed = false, collar = false;
  for (let w = 0; w < 8; w++) {
    endWeek(s);
    if (s.events.some((e) => e.id === `echo-${d!.id}`)) echoed = true;
    if (s.story!.arcs["w_collar"]) collar = true;
    s.story!.pending = undefined;
  }
  check("it comes back as an event", echoed);
  check("and as a story", collar, Object.keys(s.story!.arcs));
  const again = await concludeMoment(s, m);
  check("a scene only counts once", again?.id === d?.id && deedsOf(s).length === 1);
}

{
  const s = newGame({ seed: "deeds-b", starting_slaves: 4, plot: false } as never);
  const house = Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);
  const her = house[0], other = house[1];
  const before = s.memory[other.id].episodic.length;
  applyDeed(s, { id: "x", week: s.arcology.week, person: her.id, summary: `You caned ${her.name} in the atrium in front of the guests.`, tags: ["punished", "public_spectacle"], public: true, witnesses: [], effects: [], source: "test" });
  check("a public deed reaches the rest of the household", s.memory[other.id].episodic.length > before);
  let talk = false;
  for (let w = 0; w < 4; w++) { endWeek(s); if (s.story!.arcs["w_talk"]) talk = true; s.story!.pending = undefined; }
  check("the arcology talks about it", talk);
}

{
  const s = newGame({ seed: "deeds-c", starting_slaves: 2, plot: false } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  const id = openMoment(s, { person: her.id, title: "Nothing", source: "test", happened: "She waits." });
  const d = await concludeMoment(s, momentsOf(s).find((x) => x.id === id)!);
  check("a scene you never spoke in leaves nothing", d === null);
}
