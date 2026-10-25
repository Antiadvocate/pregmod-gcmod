/**
 * THE HOUSEHOLD BETWEEN THEMSELVES — things happen between slaves, and some come to you.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { tickHousehold, othersBrief } from "../src/engine/household.ts";
import { moveEdge } from "../src/engine/social.ts";
import { resolveEvent } from "../src/engine/events.ts";
import { personCard } from "../src/engine/prompts.ts";
import { rulesOf, rulesLine, sexBetween, forcedAllowed, weeklyRelease } from "../src/engine/houserules.ts";
import { getEdge } from "../src/engine/social.ts";
import type { SaveState } from "../src/engine/types.ts";

{
  const s = newGame({ seed: "hh", starting_slaves: 6, plot: false } as never) as SaveState;
  const quiet: string[] = [];
  for (let w = 0; w < 6; w++) { quiet.push(...tickHousehold(s)); s.arcology.week++; }
  check("out of the box, nothing between your slaves comes to you", quiet.length === 0 && !s.events.some((e) => e.kind.startsWith("hh_")), quiet);
  check("and the scene writer is told the house rules", /HOUSE RULES BETWEEN SLAVES[^\n]*only with the owner[^\n]*friends, but not lovers/.test(rulesLine(s)), rulesLine(s));
  rulesOf(s).between = "social";
  const lines: string[] = [];
  for (let w = 0; w < 10; w++) { lines.push(...tickHousehold(s)); s.arcology.week++; }
  check("things happen between them every week", lines.length >= 10, lines.length);
  check("and they're about two of them by name", lines.every((l) => /[A-Z][a-z]+.*[A-Z][a-z]+/.test(l)), lines.slice(0, 3));
  check("with sex off, none of it is sex", !lines.some((l) => /fucking|on her knees|took .* when she said no/.test(l)), lines.filter((l) => /fucking|knees|took/.test(l)));

  const [a, b] = Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);
  moveEdge(s.edges, a.id, b.id, { warmth: -80 }); moveEdge(s.edges, b.id, a.id, { warmth: -80 });
  s.events = []; s.event_log = {};
  let dispute;
  for (let i = 0; i < 12 && !dispute; i++) { s.arcology.week++; tickHousehold(s); dispute = s.events.find((e) => e.kind.startsWith("hh_")); }
  check("a dispute between two of them comes to you", !!dispute && !!dispute.other, s.events.map((e) => e.kind));
  if (dispute) {
    const line = resolveEvent(s, dispute, dispute.kind === "hh_fight" ? "together" : "stop");
    check("and settling it is about both of them", line.length > 40 && !s.events.includes(dispute), line);
  }
  check("her card says who she's close to or hates", /WITH THE OTHERS/.test(personCard(s, a)) && othersBrief(s, a).includes(b.name), othersBrief(s, a));
  for (let w = 0; w < 6; w++) endWeek(s);
  check("the week runs with it", s.reports.length >= 6);
}

// The rules, all the way up: sex between them, and one taking another.
{
  const s = newGame({ seed: "hh-rules", starting_slaves: 6, plot: false } as never) as SaveState;
  const r = rulesOf(s);
  r.between = "sexual";
  check("sex between them needs release with each other too", !sexBetween(s));
  r.release = "slaves";
  check("then it's on, and consent is still required", sexBetween(s) && !forcedAllowed(s) && /no slave forces another/.test(rulesLine(s)));
  const [a, b] = Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);
  a.persona.fetishes = [{ name: "dom", strength: 80, known: false }, { name: "sadist", strength: 60, known: false }];
  b.bond.fear = 70;
  moveEdge(s.edges, a.id, b.id, { attraction: 40 });
  r.consent = "not_required";
  let taken = "";
  for (let w = 0; w < 40 && !taken; w++) { taken = tickHousehold(s).find((l) => /took .* when she said no/.test(l)) ?? ""; s.arcology.week++; }
  check("with consent not required, one of them can take another", !!taken && (getEdge(s.edges, a.id, b.id)?.roles ?? []).some((x) => /takes her/.test(x)), taken);
  r.consent = "required";
  let after = "";
  for (let w = 0; w < 20; w++) { after = tickHousehold(s).find((l) => /took .* when she said no/.test(l)) ?? after; s.arcology.week++; }
  check("and with it required again, never", !after, after);
  a.psyche.arousal = 90;
  weeklyRelease(s, a);
  check("a slave allowed release isn't left wound up all week", a.psyche.arousal < 80, a.psyche.arousal);
  r.release = "you";
  b.psyche.arousal = 90;
  weeklyRelease(s, b);
  check("one who may only get off with you is", b.psyche.arousal === 90);
}

