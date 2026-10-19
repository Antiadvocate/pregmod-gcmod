/**
 * ALIVE — the house going on around a scene.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { today, walkIn, misreads } from "../src/engine/alive.ts";
import { personCard } from "../src/engine/prompts.ts";
import { remember } from "../src/engine/memory.ts";

const s = newGame({ seed: "alive", starting_slaves: 5, plot: false } as never);
const house = Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);
const her = house[0];
remember(s.memory[her.id], { content: "the owner laughed at me in front of the kitchen girls", week: s.arcology.week, importance: 8, charge: "sharp" });
her.today = undefined;
check("she wakes up with what happened to her", /still stung by this: the owner laughed at me/.test(today(s, her)), today(s, her));
check("and every scene knows it", /TODAY SHE'S CARRYING/.test(personCard(s, her)));
let came = 0, who = new Set<string>();
for (let i = 0; i < 200; i++) { const x = walkIn(s, [her.id], `t${i}`, 0.5); if (x) { came++; who.add(x.person.id); } }
check("now and then somebody walks in", came > 60 && came < 140, came);
check("never someone already there", !who.has(her.id) && who.size >= 2);
check("the same beat gets the same answer", JSON.stringify(walkIn(s, [her.id], "same", 0.5)?.person.id) === JSON.stringify(walkIn(s, [her.id], "same", 0.5)?.person.id));
her.persona.intelligence = "slow"; her.bond.fear = 80;
let wrong = 0;
for (let i = 0; i < 400; i++) if (misreads(s, her, "go and fetch the grey shirt from my room", `m${i}`)) wrong++;
check("a frightened, slow woman sometimes hears you wrong", wrong > 30 && wrong < 120, wrong);
check("but never twice running, and not a one-word order", !misreads(s, her, "go and fetch the grey shirt", "x", true) && !misreads(s, her, "kneel", "y"));
