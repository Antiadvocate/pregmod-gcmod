/** A woman you freed and married is still in your life: on the roster, not in the household's books. */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { inHousehold, isPartner, wasYours, romanceOf } from "../src/engine/romance.ts";

const s = newGame({ seed: "partner" });
const [wife, gone] = Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);
romanceOf(wife).standing = "wife";
wife.status = "free"; wife.exit_week = 3; wife.exit_note = "freed by you";
check("a freed wife is your partner", isPartner(s, wife));
check("but not household property", !inHousehold(s, wife));
gone.status = "free"; gone.exit_week = 4; gone.exit_note = "went home";
check("a freed slave you weren't with is not a partner", !isPartner(s, gone) && wasYours(gone));
romanceOf(gone).standing = "wife"; gone.exit_note = "taken by raiders when they broke into the arcology";
check("a wife taken in a raid is not with you", !isPartner(s, gone));
