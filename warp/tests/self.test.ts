/**
 * SELF — the narrator writes the owner as the player has played them, and the power as it stands.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { applyDeed } from "../src/engine/deeds.ts";
import { selfBrief, selfProfile, powerBetween, setLatitude } from "../src/engine/self.ts";
import { latitudeOf, registerOf, say } from "../src/engine/voice.ts";
import { rng } from "../src/engine/rng.ts";
import { personCard, digest } from "../src/engine/prompts.ts";
import { romanceOf } from "../src/engine/romance.ts";

{
  const s = newGame({ seed: "self", starting_slaves: 3 } as never);
  const [a, b] = Object.values(s.people).filter((p) => p.status === "owned");
  check("with no record, no stock personality", selfProfile(s).some((l) => /don't supply a stock personality/.test(l)));
  for (let i = 0; i < 3; i++) applyDeed(s, { id: `d${i}`, week: 1, person: a.id, summary: "You were gentle with her.", tags: ["tenderness"], public: false, witnesses: [], effects: [], source: "test" });
  applyDeed(s, { id: "k", week: 1, person: a.id, summary: "You knelt to her.", tags: ["owner_submitted"], public: false, witnesses: [], effects: [], source: "test" });
  const prof = selfProfile(s).join("\n");
  check("a gentle record makes a gentle owner", /mostly with care/.test(prof), prof);
  check("and deferring to her is part of who you are", /deferred to a slave's authority by choice/.test(prof), prof);
  applyDeed(s, { id: "b", week: 1, person: a.id, summary: "You knelt to her feet and let her fuck you.", tags: ["bottomed"], public: false, witnesses: [], effects: [], source: "test" });
  const prof2 = selfProfile(s).join("\n");
  check("being submissive in bed is counted apart, and isn't rank", /submissive in bed by taste/.test(prof2) && /Submissive is not subservient/.test(prof2), prof2);
  s.player.self = "Soft-spoken. I ask, I don't order.";
  check("your own words come first", selfProfile(s)[0].includes("Soft-spoken"));
  check("and reach every scene", digest(s, "kiss her").includes("WHO THE OWNER IS") && selfBrief(s).includes("never fall back on a stock".replace("never", "Never")));

  check("an owned slave doesn't tell her owner off", /as a slave to her owner, always/.test(powerBetween(s, b)) && /doesn't contradict you/.test(powerBetween(s, b)));
  romanceOf(a).dominion = 60;
  check("one who holds the power leads", /she holds it/.test(powerBetween(s, a)));
  check("you defer to her, by the record", selfProfile(s).some((l) => l.includes("defer to") && l.includes(a.name)));
  check("and her card says so", personCard(s, a, "").includes("THE POWER BETWEEN YOU: she holds it"));
}

// A slave speaks as a slave however close she is, until you loosen it.
{
  const s = newGame({ seed: "speech", starting_slaves: 3 } as never);
  const p = Object.values(s.people).find((x) => x.status === "owned")!;
  p.bond.bond = 90; p.bond.fear = 0; p.bond.resentment = 0; p.bond.hope = 80; p.psyche.relaxation = 3; p.psyche.libido = 20; p.psyche.arousal = 0;
  check("trusted and loved, she's devoted, not familiar", latitudeOf(p) === "slave" && registerOf(p) === "devoted", [latitudeOf(p), registerOf(p)]);
  const r = rng("speech");
  const lines = Array.from({ length: 30 }, () => say(s, p, "open", r));
  check("and she uses your title", lines.every((l) => l.includes(s.player.address || "Master")), lines);
  check("trust doesn't loosen her card", /HOW SHE SPEAKS TO YOU: as a slave/.test(personCard(s, p, "")));
  p.bond.resentment = 70; p.bond.bond = -40;
  check("resentful, she keeps the forms", registerOf(p) === "resentful" && Array.from({ length: 20 }, () => say(s, p, "open", r)).every((l) => !/What\.|Get on with it|You again/.test(l)));
  p.bond.resentment = 0; p.bond.bond = 90;
  setLatitude(s, p, "latitude");
  check("given latitude, she may speak her mind, still by title", /some latitude/.test(powerBetween(s, p)) && /still calls you by your title/.test(powerBetween(s, p)));
  setLatitude(s, p, "free");
  check("given leave, she talks to you freely", /talk to you freely/.test(powerBetween(s, p)) && registerOf(p) === "warm");
  check("and she remembers being given it", s.memory[p.id].episodic.some((m) => /leave to speak/.test(m.content)));
  setLatitude(s, p, undefined);
  romanceOf(p).standing = "courted";
  check("courting her loosens it on its own", latitudeOf(p) === "latitude");
  setLatitude(s, p, "slave");
  check("unless you've told her otherwise", latitudeOf(p) === "slave" && registerOf(p) === "devoted");
}
