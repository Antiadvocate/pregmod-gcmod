/**
 * MARKS — what was done to a body stays on it, until it's washed or wears off.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { mark, wash, applyMarks, marksLine, marksForAct, BEATS } from "../src/engine/marks.ts";
import { personCard } from "../src/engine/prompts.ts";
import { ownerLine, playerAsPerson } from "../src/engine/you.ts";
import { ACT_BY_ID } from "../src/data/intimacy.ts";

const s = newGame({ seed: "marks", starting_slaves: 3, plot: false } as never);
const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;
applyMarks(s, { marks: [{ on: her.id, what: "cum", where: "face" }, { on: "owner", what: "soleprint", where: "face" }, { on: her.id, what: "words", where: "belly", text: "PROPERTY" }, { on: her.id, what: "glitter", where: "face" }], beat: [{ on: her.id, what: "puddle" }] });
check("what the scene left is kept, and nothing it made up", (her.stains ?? []).length === 2 && (s.player.stains ?? []).length === 1);
check("every scene sees it on her", /ON HER BODY RIGHT NOW[^:]*: fresh cum on face, "PROPERTY" written on belly/.test(personCard(s, her)), marksLine(s, her.stains));
check("and on you", /ON THE OWNER RIGHT NOW[^:]*: fresh soleprint on face/.test(ownerLine(s)));
check("your figure carries it", (playerAsPerson(s).stains ?? []).length === 1);
check("her body did something", her.beat?.kind === "puddle" && Object.keys(BEATS).length >= 12);
mark(s, her.id, "welts", "thighs");
wash(s, her.id);
check("a wash takes the cum and the marker off, not the welts", her.stains!.length === 1 && her.stains![0].kind === "welts");
for (let i = 0; i < 5; i++) endWeek(s);
check("welts heal in a few weeks", !(her.stains ?? []).length);
const feet = Object.values(ACT_BY_ID).find((a) => a.group === "feet");
if (feet) { marksForAct(s, her, feet, true); check("serving her feet leaves spit on your mouth", (s.player.stains ?? []).some((m) => m.kind === "spit" && m.spot === "mouth")); }
