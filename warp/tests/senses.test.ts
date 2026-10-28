/**
 * HER SENSES AND HER VOICE. A woman with her vocal cords cut out talked through every event,
 * because her card never said she was mute. Now it does, and the theatre can take a voice, hearing,
 * sight or teeth, each undone only by a dearer operation, and every other woman in the house is
 * more afraid and goes still at the mention of it.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { personCard } from "../src/engine/prompts.ts";
import { operate } from "../src/engine/surgery.ts";

{
  const s = newGame({ seed: "senses", starting_slaves: 2 } as never);
  const [her, other] = Object.values(s.people).filter((p) => p.status === "owned");
  s.arcology.facilities["clinic"] = { ...(s.arcology.facilities["clinic"] ?? {}), level: 2, upgrades: { surgery: true } } as never;
  s.arcology.cash = 1_000_000;
  her.body.voice = 3; her.health.recovery_weeks = 0; her.womb.fetuses = [];

  const before = other.bond.fear;
  const r = operate(s, her, "remove_voice");
  check("the theatre can cut out her vocal cords", r.ok && (her.body.voice as number) === 0, r.why);
  check("and her card says she's mute and never gets a word of dialogue", /She is MUTE\. She cannot say a single word, so never write her any dialogue/.test(personCard(s, her, "")));
  check("the rest of the house is more afraid", other.bond.fear >= before + 10, [before, other.bond.fear]);
  check("and the mention of it is enough", new RegExp(`WHAT THE SURGEON DID[^\\n]*${her.name}'s vocal cords cut out[^\\n]*goes quiet, still and obedient`).test(personCard(s, other, "")), personCard(s, other, "").match(/WHAT THE SURGEON[^\n]*/)?.[0]);

  her.health.recovery_weeks = 0;
  check("rebuilding it gives her own voice back", operate(s, her, "restore_voice").ok && her.body.voice === 3);

  for (const [id, field, value, line] of [["deafen", "ears", "deaf", /She is DEAF/], ["blind", "eyes", "blind", /She is BLIND/], ["pull_teeth", "teeth", "removable", /can't bite/]] as const) {
    her.health.recovery_weeks = 0;
    const o = operate(s, her, id);
    check(`the theatre can ${id.replace("_", " ")} her, and her card says so`, o.ok && (her.body as unknown as Record<string, unknown>)[field] === value && line.test(personCard(s, her, "")), o.why);
  }
  her.health.recovery_weeks = 0;
  check("and sight can be given back, at a price", operate(s, her, "restore_sight").ok && her.body.eyes === "prosthetic");

  s.content = { ...(s.content ?? {}), extreme: false } as never;
  her.health.recovery_weeks = 0; her.body.voice = 2;
  check("the extreme content switch turns them off", !operate(s, her, "remove_voice").ok && her.body.voice === 2);
}
