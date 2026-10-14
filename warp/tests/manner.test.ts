/**
 * MANNER — how she is with a particular person stays that way between scenes.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { applyDiff } from "../src/engine/turn.ts";
import { personCard } from "../src/engine/prompts.ts";
import { dropManner, mannerOf, setManner } from "../src/engine/manner.ts";

{
  const s = newGame({ seed: "manner", starting_slaves: 3 } as never);
  const [her, other] = Object.values(s.people).filter((p) => p.status === "owned");

  // A scene settles it; the bookkeeper's line is kept.
  applyDiff(s, { manner: [{ id: her.id, toward: "Darius", how: "subservient to him alone; talks to him gently" }] }, "");
  check("a scene's settled manner is kept", mannerOf(her).length === 1 && mannerOf(her)[0].toward === "Darius", mannerOf(her));
  check("and it's on her card in every scene after", personCard(s, her, "").includes("Darius: subservient to him alone"), personCard(s, her, ""));

  // A later scene changes it: one line per person, replaced whole.
  setManner(s, her, "darius", "warming to him, still shy", "scene");
  check("a new line for the same person replaces the old", mannerOf(her).length === 1 && mannerOf(her)[0].how === "warming to him, still shy", mannerOf(her));

  // Toward another of yours: found by first name, and shown on her card too.
  setManner(s, her, other.name.split(" ")[0], "mothers her", "you");
  const m = mannerOf(her).find((x) => x.id === other.id);
  check("another of yours is found by her name", !!m, mannerOf(her));
  check("and the other woman's card says how she's treated", personCard(s, other, "").includes(`${her.name} with her: mothers her`), personCard(s, other, ""));

  // How she is with the owner is the standing orders' job, not this.
  setManner(s, her, "the owner", "adoring", "scene");
  check("the owner isn't kept here", !mannerOf(her).some((x) => /owner/i.test(x.toward)));

  dropManner(her, "Darius");
  check("you can strike one", !mannerOf(her).some((x) => x.toward === "Darius"));
}
