/**
 * STANDING ORDERS and HER REIGN — what you tell them sticks, and a slave who owns you rules.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { readInstructions, captureInstructions, agreementsOf, houseRules, calledBy } from "../src/engine/agreements.ts";
import { openMoment, playMoment } from "../src/engine/moments.ts";
import { personCard, digest } from "../src/engine/prompts.ts";
import { addressFor } from "../src/engine/voice.ts";
import { applyDiff } from "../src/engine/turn.ts";
import { romanceOf } from "../src/engine/romance.ts";
import { styleOf, tickReign, reignOf } from "../src/engine/reign.ts";
import { resolveEvent } from "../src/engine/events.ts";
import { lawsOf } from "../src/engine/court.ts";
import type { Person, SaveState } from "../src/engine/types.ts";

const game = (seed: string) => newGame({ seed, starting_slaves: 4, plot: false } as never) as SaveState;
const adults = (s: SaveState) => Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);

{
  check("reads 'call me Rabi'", readInstructions("From now on, call me Rabi.").calls === "Rabi", readInstructions("From now on, call me Rabi."));
  check("reads 'you will call me Rabi'", readInstructions("You will call me Rabi, not Master.").calls === "Rabi");
  check("reads a standing order", readInstructions("From now on you kneel when I come into the room.").rules[0] === "kneel when you come into the room", readInstructions("From now on you kneel when I come into the room."));
  check("reads always and never", readInstructions("I want you to always look me in the eye. Never wear shoes in my rooms.").rules.length === 2, readInstructions("I want you to always look me in the eye. Never wear shoes in my rooms."));
  check("knows when it's to everyone", readInstructions("All of you, call me Rabi.").household);
  check("leaves ordinary talk alone", !readInstructions("Come here and sit down.").calls && !readInstructions("Come here and sit down.").rules.length);

  const s = game("orders");
  const [a, b] = adults(s);
  captureInstructions(s, "Call me Rabi from now on.", [a]);
  check("she keeps what you told her", calledBy(s, a) === "Rabi" && calledBy(s, b) !== "Rabi");
  check("her card carries it", /STANDING ORDERS[^\n]*calls you "Rabi"/.test(personCard(s, a)) && /SHE CALLS YOU: Rabi/.test(personCard(s, a)), personCard(s, a).split("\n").filter((l) => /STANDING|CALLS/.test(l)));
  check("and her own voice uses it, in every register", (["proper", "commanding", "bratty", "crude"] as const).every((reg) => addressFor(s, reg as never, a) === "Rabi") && addressFor(s, "proper" as never, b) !== "Rabi");
  captureInstructions(s, "Everyone, from now on you kneel when I come in.", [a, b]);
  check("an order to everyone is a house rule", houseRules(s).some((r) => /kneel/.test(r.rule)) && /STANDING ORDERS TO THE WHOLE HOUSEHOLD/.test(digest(s)));

  // Through a moment, without a model.
  const id = openMoment(s, { person: b.id, title: "Talking", source: "test", happened: `${b.name} waits.` });
  await playMoment(s, id, "You'll call me Captain.");
  check("a moment keeps it too", calledBy(s, b) === "Captain");

  // The bookkeeper can record one the words didn't spell out.
  applyDiff(s, { agreements: [{ id: a.id, rule: "brings you tea every morning" }] }, "She agrees.");
  check("the bookkeeper records what she agreed to", agreementsOf(a).some((x) => /tea/.test(x.rule)));
}

function hand(s: SaveState, h: Person) {
  const rom = romanceOf(h);
  rom.standing = "keeper"; rom.dominion = 100; h.status = "free"; s.player.owned_by = h.id;
}

{
  const s = game("reign-a");
  const h = adults(s)[0];
  h.persona.conscience = 0.8; h.bond.bond = 80; h.bond.resentment = 0;
  hand(s, h);
  check("a kind woman who loves you dotes", styleOf(s, h) === "doting");
  tickReign(s);
  const r = reignOf(s)!;
  check("she sets terms", !!r && s.events.some((e) => e.kind === "reign_terms"));
  check("her rules go on her record", agreementsOf(h).filter((x) => x.by === "her").length >= 4);
  check("and into her card", /SHE OWNS YOU/.test(personCard(s, h)) && /HER RULES FOR YOU/.test(personCard(s, h)));
  check("and the scene knows what you're wearing", /THE PLAYER BELONGS TO/.test(digest(s)));
  resolveEvent(s, s.events.find((e) => e.kind === "reign_terms")!, "accept");
  check("accepting pleases her", r.favour > 30 && r.obeyed === 1);
}

{
  const s = game("reign-b");
  const h = adults(s)[0];
  h.persona.conscience = 0.1; h.bond.resentment = 0; h.persona.fetishes = [{ name: "sadist", strength: 80, known: true }];
  hand(s, h);
  check("a cold sadist is cruel", styleOf(s, h) === "cruel");
  const v = game("reign-c");
  const hv = adults(v)[0];
  hv.bond.resentment = 70;
  check("a woman you hurt pays it back", styleOf(v, hv) === "vengeful");
  const q = game("reign-d");
  const hq = adults(q)[0];
  hq.bond.resentment = 0; hq.persona.fetishes = [{ name: "submissive", strength: 80, known: true }];
  check("a submissive never wanted it", styleOf(q, hq) === "reluctant");

  // A long reign: orders, set points, laws, and it keeps going.
  const kinds = new Set<string>();
  for (let w = 0; w < 32; w++) {
    endWeek(s);
    for (const e of s.events.filter((x) => x.kind.startsWith("reign_"))) { kinds.add(e.kind); resolveEvent(s, e, e.kind === "reign_future" ? "yes" : e.kind === "reign_terms" || e.kind === "reign_order" || e.kind === "reign_name" || e.kind === "reign_deputy" ? (e.kind === "reign_order" ? "obey" : "accept") : "go"); }
    if (s.story) s.story.pending = undefined;
  }
  const r = s.reign!;
  check("she gives you orders", kinds.has("reign_order"), [...kinds]);
  check("she renames you", kinds.has("reign_name") && r.your_name === "thing", r.your_name);
  check("she decides what you are", kinds.has("reign_future"), [...kinds]);
  check("she signs laws that suit her", r.laws.length > 0 && lawsOf(s).some((l) => l.by === "keeper"), { laws: r.laws });
  check("the household hears about it", r.log.length > 5, r.log.length);
}

{
  const s = game("reign-back");
  const h = adults(s)[0];
  h.persona.conscience = 0.5; h.bond.resentment = 0;
  hand(s, h);
  tickReign(s);
  resolveEvent(s, s.events.find((e) => e.kind === "reign_terms")!, "back");
  check("you can take it back", !s.player.owned_by && s.reign!.ended === "taken back" && romanceOf(h).standing !== "keeper");
  check("and her rules come off", !agreementsOf(h).some((a) => a.by === "her"));
}
