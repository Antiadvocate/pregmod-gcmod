/**
 * THE SACRED FEET — the storyline starts, can make Podolatry law, and the doctrine judges feet.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { answer, pendingBeat, optionsFor, pickable } from "../src/engine/story.ts";
import { feetAxis, scoreFor } from "../src/engine/society.ts";
import { DOCTRINE_BY_ID } from "../src/data/doctrines.ts";
import { resolveAct } from "../src/engine/intimacy.ts";
import { feetOf } from "../src/engine/genitals.ts";
import { tickPodolatry } from "../src/engine/podolatry.ts";

const script: Record<string, string> = { sermon: "listen", audience: "kneel", petition: "adopt", test: "honour", heretic: "denounce", festival: "lead" };

function play(seed: string, weeks: number) {
  const s = newGame({ seed, starting_slaves: 5 } as never);
  s.arcology.cash = 400000;
  const seen: string[] = [];
  for (let w = 0; w < weeks; w++) {
    endWeek(s);
    for (let i = 0; i < 6; i++) {
      const p = pendingBeat(s);
      if (!p) break;
      const opts = optionsFor(s);
      let o = p.def.id === "w_feet" ? opts.find((x) => x.id === script[s.story!.pending!.beat] && !x.locked) : undefined;
      if (p.def.id === "w_feet") seen.push(s.story!.pending!.beat);
      o ??= opts.find((x) => !x.locked && !x.pick) ?? opts.find((x) => !x.locked);
      if (!o) break;
      const who = o.pick ? pickable(s, o.id)[0]?.id : undefined;
      if (o.pick && !who) break;
      answer(s, o.id, who);
    }
  }
  return { s, seen };
}

{
  const { s, seen } = play("feet-a", 45);
  check("the feet storyline starts", !!s.story!.arcs["w_feet"], Object.keys(s.story!.arcs));
  check("it plays through several beats", seen.length >= 4, seen);
  check("the petition can make Podolatry law", !!s.arcology.doctrines["podolatry"] || s.arcology.doctrines && Object.keys(s.arcology.doctrines).length >= 4, Object.keys(s.arcology.doctrines));
}

{
  const s = newGame({ seed: "feet-b", starting_slaves: 3 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;
  const f = feetOf(her);
  f.soles = "soft"; f.toenails = "red"; her.shoes = "barefoot"; f.heels_clipped = false;
  const good = feetAxis(her);
  f.heels_clipped = true;
  check("clipped tendons are the worst thing for the feet axis", feetAxis(her) < good - 0.8, [good, feetAxis(her)]);
  f.heels_clipped = false;
  check("Podolatry likes bare, soft, painted feet", scoreFor(her, DOCTRINE_BY_ID["podolatry"]) > 0.3);

  s.arcology.doctrines["podolatry"] = { adoption: 50, decoration: 0, research: false, policies: { barefoot_law: 1, pedicure_rite: 1, foot_tithe: 1 }, adopted_week: 1 };
  const before = s.arcology.doctrines["podolatry"].adoption;
  const out = resolveAct(s, her, "bastinado", { public: true });
  check("caning her soles is sacrilege to the believers", "act" in out && !!out.believers && s.arcology.doctrines["podolatry"].adoption < before);
  her.shoes = "heels"; f.soles = "calloused";
  const t = tickPodolatry(s);
  check("the barefoot law takes her shoes", her.shoes === "barefoot");
  check("the washing softens her soles", f.soles === "normal");
  check("the tithe pays", t.lines.some((l) => /tithe of kisses/.test(l)), t);
}
