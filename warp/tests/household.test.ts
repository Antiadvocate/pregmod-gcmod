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
import type { SaveState } from "../src/engine/types.ts";

{
  const s = newGame({ seed: "hh", starting_slaves: 6, plot: false } as never) as SaveState;
  const lines: string[] = [];
  for (let w = 0; w < 10; w++) { lines.push(...tickHousehold(s)); s.arcology.week++; }
  check("things happen between them every week", lines.length >= 10, lines.length);
  check("and they're about two of them by name", lines.every((l) => /[A-Z][a-z]+.*[A-Z][a-z]+/.test(l)), lines.slice(0, 3));

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
