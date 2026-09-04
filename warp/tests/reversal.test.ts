/**
 * SUPPLICATIONISM.
 *
 * The claim: the chain is not a slideshow with buttons. Three things have to be true or it is one.
 *
 *   1. The household answers out of what each woman already is, and handing power to somebody who
 *      does not want it is an injury the engine records as an injury.
 *   2. The chain is gated on what the arcology has actually watched you do, and a cautious player
 *      is never left with a dead chain and no way back into it.
 *   3. The ending is scored on the household rather than on your guns, so a building full of
 *      frightened, resentful women loses it no matter what you spent on security.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { newMemory } from "../src/engine/memory.ts";
import { refresh } from "../src/engine/obedience.ts";
import {
  reversalOf, subjectOf, reactTo, nextEvent, tickReversal, resolveChain,
  endgame, doGesture, gestureAvailable, GESTURES,
} from "../src/engine/reversal.ts";
import { CHAIN, SUPPLICATIONISM } from "../src/data/reversal.ts";
import { theKeeper } from "../src/engine/romance.ts";
import { DOCTRINE_BY_ID } from "../src/data/doctrines.ts";

function world(seed: string, n = 3) {
  const s = newGame({ seed, starting_slaves: n });
  for (const p of Object.values(s.people)) {
    p.age = 24; p.physical_age = 24;
    s.memory[p.id] = s.memory[p.id] ?? newMemory();
    refresh(p, s.memory[p.id]);
  }
  return s;
}

/* ── 1. the household answers out of what it is ─────────────────────────────────────────────── */
{
  const s = world("react");
  const [a, b, c] = Object.values(s.people);
  a.persona.fetishes = [{ name: "submissive", strength: 85, known: true }];
  b.persona.fetishes = [{ name: "dom", strength: 85, known: true }];
  c.persona.fetishes = [{ name: "none", strength: 0, known: true }];
  c.persona.conscience = 0.2;
  c.bond.resentment = 80;
  for (const p of [a, b, c]) { p.psyche.state = "intact"; p.psyche.relaxation = 0; }
  const hopeBefore = a.bond.hope;
  const relBefore = a.psyche.relaxation;

  const out = reactTo(s, 10, true);
  const line = (id: string) => out.find((r) => r.id === id);

  check("a submissive handed power is injured, not rewarded",
    !!line(a.id) && line(a.id)!.tone === "bad" && a.bond.hope < hopeBefore && a.psyche.relaxation < relBefore,
    { tone: line(a.id)?.tone, hope: [hopeBefore, a.bond.hope], rel: [relBefore, a.psyche.relaxation] });

  check("a dom takes it and the engine says so",
    !!line(b.id) && line(b.id)!.tone === "good", line(b.id));

  check("forty weeks of resentment is a warning, not a thank you",
    !!line(c.id) && line(c.id)!.tone === "warning", line(c.id));
}

{
  // The one reaction that should never read as consent.
  const s = world("broken", 1);
  const p = Object.values(s.people)[0];
  p.psyche.state = "broken";
  const out = reactTo(s, 10, true);
  check("a broken woman agreeing is reported as the failure it is",
    out.length === 1 && out[0].tone === "bad" && /would have agreed with the opposite/.test(out[0].line), out[0]);
}

/* ── 2. the gates, and the way back in ──────────────────────────────────────────────────────── */
{
  const s = world("gates");
  s.arcology.week = 40;
  const rev = reversalOf(s);
  rev.deference = 0;
  rev.done = CHAIN.filter((e) => e.id !== "the_dinner").map((e) => e.id);
  check("a beat above your deference is not offered no matter how late it is",
    nextEvent(s) === undefined, nextEvent(s)?.id);
  rev.deference = 40;
  check("and it is offered the moment you have paid for it",
    nextEvent(s)?.id === "the_dinner", nextEvent(s)?.id);
}

{
  // The dead end this was written to prevent: answer cautiously once, and the chain stops forever.
  const s = world("cautious");
  s.arcology.week = 3;
  tickReversal(s);
  check("the chain opens on its own", reversalOf(s).pending === "first_time");
  resolveChain(s, "up");   // the answer that buys nothing
  check("the cautious answer really does buy nothing", reversalOf(s).deference === 0);
  check("and there is still a way back in", gestureAvailable(s));

  let gained = 0;
  for (const g of GESTURES) {
    s.arcology.week++;
    const before = reversalOf(s).deference;
    doGesture(s, g.id);
    gained += reversalOf(s).deference - before;
  }
  check("the small steps between the beats add up to the next gate",
    reversalOf(s).deference >= (CHAIN.find((e) => e.id === "household_sees")!.needs_deference ?? 0),
    { deference: reversalOf(s).deference, gained });

  const week = s.arcology.week;
  const d = reversalOf(s).deference;
  doGesture(s, "club");
  check("but only one of them a week", reversalOf(s).deference === d && reversalOf(s).last_gesture === week);
}

{
  // Every gate has to be reachable from the greediest path through everything before it.
  const s = world("reach");
  let unreachable: string | undefined;
  const rev = reversalOf(s);
  for (const e of CHAIN) {
    if ((e.needs_deference ?? 0) > rev.deference) { unreachable = e.id; break; }
    s.arcology.week = e.week;
    rev.pending = e.id;
    resolveChain(s, e.options[0].id);
  }
  check("every beat is reachable by taking the boldest answer each time", unreachable === undefined, unreachable);
}

{
  const s = world("idle");
  const rev = reversalOf(s);
  rev.deference = 50; rev.last_public = 1;
  s.arcology.week = 12;
  tickReversal(s);
  check("a month of behaving like an ordinary owner costs you", rev.deference < 50, rev.deference);
  rev.last_public = 12;
  const held = rev.deference;
  tickReversal(s);
  check("and staying visible does not", rev.deference === held);
}

/* ── 3. the doctrine is adopted by living it, not by buying it ──────────────────────────────── */
{
  const s = world("adopt");
  check("Supplicationism is a doctrine like any other", DOCTRINE_BY_ID[SUPPLICATIONISM.id] === SUPPLICATIONISM);
  reversalOf(s).deference = 44;
  tickReversal(s);
  const doc = s.arcology.doctrines[SUPPLICATIONISM.id];
  check("adoption follows what the arcology has watched", !!doc && doc.adoption === 44 && doc.research, doc);
}

{
  const s = world("fees");
  const rev = reversalOf(s);
  rev.fees_open = true; rev.deference = 60;
  const cash = s.arcology.cash;
  const lines = tickReversal(s);
  check("open fees are the economy", s.arcology.cash > cash && lines.some((l) => /Service fees/.test(l.text)),
    { delta: s.arcology.cash - cash });
}

{
  // It arrives by displacement. You cannot hold this next to Degradationism and pretend otherwise.
  const s = world("displace");
  s.arcology.doctrines["degradationist"] = { adoption: 60, decoration: 2, research: true, policies: {}, adopted_week: 1 };
  reversalOf(s).deference = 20;
  const lines = tickReversal(s);
  check("a doctrine that cannot sit next to it is displaced, loudly",
    !s.arcology.doctrines["degradationist"] && lines.some((l) => /Degradationism/.test(l.text)),
    lines.map((l) => l.text));
}

{
  // Signing away your half has to hand her the arcology, not delete her from the week.
  const s = world("onesided");
  s.arcology.week = 32;
  const her = subjectOf(s)!;
  reversalOf(s).pending = "the_register";
  resolveChain(s, "onesided");
  check("giving up your title makes her the keeper rather than an ex-slave",
    s.player.owned_by === her.id && theKeeper(s)?.id === her.id && her.romance?.dominion === 100,
    { owned_by: s.player.owned_by, keeper: theKeeper(s)?.id, dominion: her.romance?.dominion });
}

/* ── 4. the ending is the household ─────────────────────────────────────────────────────────── */
{
  const s = world("held", 5);
  for (const p of Object.values(s.people)) {
    p.bond.bond = 85; p.bond.hope = 70; p.bond.fear = 5; p.bond.resentment = 5;
    refresh(p, s.memory[p.id]);
  }
  reversalOf(s).deference = 90;
  s.arcology.security = 0;
  const text = endgame(s, "her");
  check("a household that wants you there holds the building with no guns at all",
    reversalOf(s).ended === "held", text);
}

{
  const s = world("broken-end", 5);
  for (const p of Object.values(s.people)) {
    p.bond.bond = 5; p.bond.hope = 5; p.bond.fear = 90; p.bond.resentment = 85;
    refresh(p, s.memory[p.id]);
  }
  reversalOf(s).deference = 90;
  s.arcology.security = 100;
  s.arcology.mercenaries.hired = true;
  const text = endgame(s, "stand");
  check("and a household kept by fear loses it with every gun you own",
    reversalOf(s).ended === "broken" && /opened from the inside/.test(text), text);
}

/* ── 5. every option is wired ───────────────────────────────────────────────────────────────── */
{
  const s = world("options");
  let dead: string | undefined;
  for (const e of CHAIN) {
    for (const o of e.options) {
      const fresh = world(`opt-${e.id}-${o.id}`);
      fresh.arcology.week = e.week;
      reversalOf(fresh).pending = e.id;
      const { line } = resolveChain(fresh, o.id);
      if (!line) { dead = `${e.id}:${o.id}`; break; }
    }
    if (dead) break;
  }
  check("no option is a dead button", dead === undefined, dead);
  check("the chain follows a person", !!subjectOf(s));
}
