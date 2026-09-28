import { check } from "./harness.ts";
import { ownerSide } from "../src/engine/memory.ts";
import { newGame } from "../src/engine/state.ts";
import { bookkeeperContext, BOOKKEEPER_SYSTEM } from "../src/engine/prompts.ts";
import { shiftDominion, romanceOf } from "../src/engine/romance.ts";

const line = ownerSide("You lay beneath Martina and cleaned her feet with your tongue as she told you to be the floor, and she stood on your face and made you serve her.");
check("the owner stays the one serving", line === "the owner lay beneath Martina and cleaned her feet with his tongue as she told him to be the floor, and she stood on his face and made him serve her.", line);
check("verbs agree", ownerSide("You were on your knees.") === "the owner was on his knees." && ownerSide("you haven't been near her") === "the owner hasn't been near her");
check("the owner's own pronouns", ownerSide("She made you kneel and kissed your hand.", "she/her") === "She made the owner kneel and kissed her hand.", ownerSide("She made you kneel and kissed your hand.", "she/her"));
check("no 'you' survives", !/\byou/i.test(ownerSide("You asked if you could, and she let you, because your hands were shaking and you begged.")));

const s = newGame({ seed: "pov" });
const p = Object.values(s.people).find((q) => q.status === "owned")!;
romanceOf(p).standing = "wife"; romanceOf(p).dominion = 50;
check("the bookkeeper is told who holds power", new RegExp(`${p.name}.*holds the power`).test(bookkeeperContext(s)));
check("and that 'you' is the owner", /"you" is always the owner/.test(BOOKKEEPER_SYSTEM) && /is the "you" in the prose/.test(bookkeeperContext(s)));
shiftDominion(s, p, 12, "You knelt and licked her feet clean.");
const last = s.memory[p.id]?.episodic.at(-1)?.content ?? "";
check("a granted ask is filed the right way round", /the owner knelt and licked her feet clean/.test(last) && !/\byou\b/i.test(last), last);

// The narrator writes porn, not literature, everywhere it writes a scene.
{
  const { HOUSE_STYLE, NARRATOR_SYSTEM } = await import("../src/engine/prompts.ts");
  const { MOMENT_SYSTEM, CITY_SCENE_SYSTEM } = await import("../src/engine/moments.ts");
  const { WALK_SYSTEM } = await import("../src/engine/walk.ts");
  const { SAGA_SYSTEM } = await import("../src/engine/saga.ts");
  check("the house style says porn, not literature, and bans euphemism", /PORN GAME, NOT LITERATURE/.test(HOUSE_STYLE) && /"womanhood"/.test(HOUSE_STYLE) && /Flowery/.test(HOUSE_STYLE));
  const all = { NARRATOR_SYSTEM, MOMENT_SYSTEM, CITY_SCENE_SYSTEM, WALK_SYSTEM, SAGA_SYSTEM };
  check("every scene-writer carries it", Object.values(all).every((x) => x.includes(HOUSE_STYLE)), Object.entries(all).filter(([, x]) => !x.includes(HOUSE_STYLE)).map(([k]) => k));
}
