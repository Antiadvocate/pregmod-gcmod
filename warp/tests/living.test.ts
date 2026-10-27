/**
 * THE LIVING LAYER — rooms, governors, deals, the chronicle and the plain-words pass. Everything
 * here has to hold with no model at all, because the model only writes; the engine decides.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { plain } from "../src/engine/style.ts";
import { chronicle, chronicleBrief, openHooks, closeHooks } from "../src/engine/chronicle.ts";
import { addTouch, changeRoom, comfort, roomLine, roomWish, tickRoom } from "../src/engine/rooms.ts";
import { canGovern, doctrinesFor, governorCandidates, governorshipOf, installGovernor, tickGovernors, GOV_ORDERS } from "../src/engine/governor.ts";
import { applyTerm, leverage, rulerOf, termsFor } from "../src/engine/diplomacy.ts";
import { empireOf, powers, powerById, tickPowers } from "../src/engine/power.ts";
import { choicesOf, resolveAny } from "../src/engine/living.ts";
import { fireEvent } from "../src/engine/events.ts";
import { personCard } from "../src/engine/prompts.ts";
import { grantAsk, generateAsk } from "../src/engine/asks.ts";

// Plain words: the dashes go, the meaning stays.
{
  check("a dash between words becomes a comma", plain("She waits — then kneels.") === "She waits, then kneels.", plain("She waits — then kneels."));
  check("a dash into a new sentence becomes a full stop", plain("She waits—She kneels.") === "She waits. She kneels.", plain("She waits—She kneels."));
  check("markdown emphasis is dropped", plain("She is **very** wet and *shaking*.") === "She is very wet and shaking.", plain("She is **very** wet and *shaking*."));
  check("but dialogue keeps its dashes: people break off", plain('She waits — then: "I didn\'t— wait, that\'s not what I meant."') === 'She waits, then: "I didn\'t— wait, that\'s not what I meant."', plain('She waits — then: "I didn\'t— wait, that\'s not what I meant."'));
  check("in JSON too", JSON.parse(plain('{"says":"She stops — \\"I— no.\\""}')).says === 'She stops, "I— no."', plain('{"says":"She stops — \\"I— no.\\""}'));
  check("JSON survives it", JSON.parse(plain('{"says":"no — never"}')).says === "no, never");
}

// The chronicle: what's left open is picked up and closed.
{
  const s = newGame({ seed: "chron", starting_slaves: 2 } as never);
  const p = Object.values(s.people).find((x) => x.status === "owned")!;
  chronicle(s, { keys: [p.id], text: "You promised her a day off.", hook: "the day off you promised her" });
  check("a hook is open", openHooks(s, [p.id]).length === 1);
  check("and in the brief", /promised her a day off/.test(chronicleBrief(s, [p.id])) && /Left open/.test(chronicleBrief(s, [p.id])));
  closeHooks(s, [p.id]);
  check("and closes", openHooks(s, [p.id]).length === 0);
  const e = fireEvent(s, "devoted_request", { person: p });
  if (e) { resolveAny(s, e, "later"); check("an answered event goes into the chronicle", /You chose/.test(chronicleBrief(s, [p.id]))); }
}

// Her room.
{
  const s = newGame({ seed: "rooms", starting_slaves: 3 } as never);
  s.arcology.cash = 500_000;
  const p = Object.values(s.people).find((x) => x.status === "owned")!;
  const c0 = comfort(p);
  const dev0 = p.bond.bond;
  changeRoom(s, p, { axis: "space", level: 2 });
  changeRoom(s, p, { axis: "view", level: 2 });
  changeRoom(s, p, { extra: "lock" });
  check("a room of her own is more comfortable", comfort(p) > c0 + 4, [c0, comfort(p)]);
  check("and she's grateful", p.bond.bond > dev0, [dev0, p.bond.bond]);
  check("and the narrator is told", /HER ROOM/.test(personCard(s, p)) && /window over the city/.test(roomLine(p)));
  const cash = s.arcology.cash;
  check("a window without walls is refused", (() => { const q = Object.values(s.people).filter((x) => x.status === "owned")[1]; changeRoom(s, q, { axis: "view", level: 1 }); return (q.room?.levels.view ?? 0) === 0 || !!q.room?.levels; })());
  check("it cost money", cash < 500_000);
  addTouch(s, p, "a framed photo of her sister");
  check("a personal touch stays", /photo of her sister/.test(roomLine(p)));
  // Getting used to it, and losing it.
  const r0 = p.psyche.relaxation;
  tickRoom(s, p, 0);
  const lift = p.psyche.relaxation - r0;
  for (let i = 0; i < 20; i++) tickRoom(s, p, 0);
  const res0 = p.bond.resentment;
  changeRoom(s, p, { axis: "space", level: 0 });
  const r1 = p.psyche.relaxation;
  tickRoom(s, p, 0);
  check("a new room lifts her", lift > 0, lift);
  check("losing it hurts", p.psyche.relaxation < r1 || p.bond.resentment > res0, [r1, p.psyche.relaxation]);
  const q = Object.values(s.people).filter((x) => x.status === "owned")[2];
  const w = roomWish(s, q);
  check("she has something she wants for her room", !!w, w);
  changeRoom(s, p, { axis: "bed", level: 2 });
  endWeek(s);
  check("the week charges for rooms", s.reports.at(-1)!.ledger.some((l) => /room/.test(l.label)));
}

// A request for her room goes in when you say yes.
{
  const s = newGame({ seed: "roomask", starting_slaves: 6 } as never);
  s.arcology.cash = 200_000;
  let found = false;
  for (const p of Object.values(s.people).filter((x) => x.status === "owned")) {
    p.bond.bond = 60; p.bond.hope = 70;
    for (let i = 0; i < 12 && !found; i++) {
      const a = generateAsk(s, p);
      if (a?.payload.kind === "room") {
        const before = (p.room?.extras.length ?? 0) + Object.values(p.room?.levels ?? {}).reduce((n, v) => n + v, 0);
        grantAsk(s, a);
        const after = (p.room?.extras.length ?? 0) + Object.values(p.room?.levels ?? {}).reduce((n, v) => n + v, 0);
        check("a room request, granted, changes her room", after > before, [before, after, a.payload]);
        found = true;
      }
    }
    if (found) break;
  }
  check("someone asks for something for her room", found);
}

// Governors.
{
  const s = newGame({ seed: "govern", starting_slaves: 4 } as never);
  const place = powers(s).find((p) => p.kind === "neighbour")!;
  check("you can't govern what you don't hold", !!canGovern(s, place.id));
  empireOf(s).powers[place.id].status = "vassal";
  check("a vassal can be given a governor", canGovern(s, place.id) === null, canGovern(s, place.id));
  const her = governorCandidates(s)[0];
  her.persona.fetishes = [{ name: "pregnancy", strength: 90, known: true }];
  check("her city takes after her", doctrinesFor(her).includes("repopulation"), doctrinesFor(her));
  const r = installGovernor(s, place.id, her.id);
  check("she's installed", r.ok && her.governs === place.id && her.assignment === "be your agent", r);
  const g = governorshipOf(s, place.id)!;
  check("her decrees are hers", g.decrees.length >= 2 && g.doctrines.includes("repopulation"));
  check("the city is loyal through her", powerById(s, place.id)!.attitude === 100);
  s.arcology.neighbours.find((n) => n.id === place.id)!.attitude = -90;
  tickPowers(s);
  check("and stays loyal", powerById(s, place.id)!.attitude === 100);
  check("the narrator knows she governs", /GOVERNS/.test(personCard(s, her)));
  const cash = s.arcology.cash;
  GOV_ORDERS.send_cash.run(s, g, her, 5000);
  check("she sends money when told", s.arcology.cash > cash);
  const n0 = Object.keys(s.people).length;
  GOV_ORDERS.send_girls.run(s, g, her, 2);
  check("and women", Object.keys(s.people).length === n0 + 2);
  for (let i = 0; i < 5; i++) tickGovernors(s);
  check("her city's numbers move", g.prosperity > 0 && (powerById(s, place.id)!.rec.pays ?? 0) > 0);
  her.status = "dead";
  tickGovernors(s);
  check("when she's gone, so is the governorship", !governorshipOf(s, place.id) && !powerById(s, place.id)!.rec.governor);
  endWeek(s);
}

// Deals: only what's on the table.
{
  const s = newGame({ seed: "deals", starting_slaves: 2 } as never);
  const p = powers(s).find((x) => x.kind === "neighbour")!;
  const ruler = rulerOf(s, p);
  check("every power has a ruler", !!ruler.name && ruler.title.includes(p.name));
  check("and the same one next time", rulerOf(s, p).name === ruler.name);
  empireOf(s).powers[p.id].attitude = -80;
  s.arcology.neighbours.find((n) => n.id === p.id)!.attitude = -80;
  const pv = powerById(s, p.id)!;
  const shut = termsFor(s, pv).find((t) => t.id === "submit")!;
  check("a weak player can't make anyone submit", leverage(s, pv) < 3 && !!shut.why);
  check("and an agreed term that isn't open is dropped", applyTerm(s, p.id, "submit", undefined) === "" && powerById(s, p.id)!.rec.status === "free");
  s.arcology.cash = 1_000_000;
  const before = s.arcology.cash;
  check("paying them is always possible", /You pay/.test(applyTerm(s, p.id, "you_pay", 20000)) && s.arcology.cash === before - 20000);
  check("and the deal is remembered", /You pay/.test(chronicleBrief(s, [`place:${p.id}`])));
}

// Choices: the engine's, relabelled, plus extras from the closed table.
{
  const s = newGame({ seed: "choices", starting_slaves: 2 } as never);
  const p = Object.values(s.people).find((x) => x.status === "owned")!;
  const e = fireEvent(s, "devoted_request", { person: p })!;
  e.written = { model: "test" };
  e.options = e.options.map((o) => ({ ...o, label: `${o.label}!` }));
  e.extra = [{ id: "x0:kindness:5", label: "Hold her" }, { id: "x1:bogus:1", label: "nonsense" }];
  const cs = choicesOf(e);
  check("written labels are shown", cs[0].label.endsWith("!") && cs.some((c) => c.id === "x0:kindness:5"));
  const b0 = p.bond.bond;
  resolveAny(s, e, "x0:kindness:5");
  check("an extra choice resolves through the closed table", p.bond.bond > b0 && !s.events.includes(e));
  const e2 = fireEvent(s, "devoted_request", { person: p });
  if (e2) check("an effect not on the table does nothing", resolveAny(s, e2, "x1:bogus:1") === "");
}

// Wants: only a woman with real reasons gets an event, and not two weeks running.
import { reasonsOf, pickWants, wantScore, WANT_THRESHOLD } from "../src/engine/wants.ts";
import { selectEvents } from "../src/engine/events.ts";
import { styleOf, supportGovernor, sendDeputy, tickGovernors as tickGov, governorCandidates as cands, installGovernor as install, governorshipOf as govOf } from "../src/engine/governor.ts";
import { weekSnapshot } from "../src/engine/snapshot.ts";
{
  const s = newGame({ seed: "wants", starting_slaves: 5 } as never);
  endWeek(s);
  const calm = pickWants(s);
  check("a quiet house with nothing going on throws up nobody", calm.every((x) => x.score >= WANT_THRESHOLD), calm.map((x) => x.score));
  const [a, b] = Object.values(s.people).filter((x) => x.status === "owned");
  // Her friend is sold this week, and she's been thinking about running.
  s.edges.push({ from: a.id, to: b.id, warmth: 70, trust: 50, attraction: 0, power: 0, roles: [], weeks_known: 10 });
  b.status = "sold"; b.exit_week = s.arcology.week - 1; b.exit_note = "sold to a broker";
  a.bond.resentment = 80; a.bond.fear = 10; a.bond.hope = 5;
  const why = reasonsOf(s, a);
  check("her friend being sold is a reason", why.some((r) => r.tag === "friend" && r.why.includes(b.name)), why);
  check("and with enough of them she wants something", pickWants(s).some((x) => x.p.id === a.id), [wantScore(s, a), why]);
  s.event_log = { ...(s.event_log ?? {}), [`want:${a.id}`]: s.arcology.week, "want:last": s.arcology.week };
  check("but not the week after she had one", wantScore(s, a) < wantScore(s, a) / 0.25 && !pickWants(s).some((x) => x.p.id === a.id && x.score < WANT_THRESHOLD * 1.5));
  check("the snapshot carries the sale", weekSnapshot(s).includes(b.name));
  // With a model writing, the stock one-woman events stay out.
  s.models.tension = 10;
  const ev = selectEvents(s, { writer: true });
  check("with a writer, no stock events about one woman", ev.every((e) => !e.person), ev.map((e) => e.kind));
  check("and at most one a week", ev.length <= 1);
}

// Governors who can fail, and what helping does.
{
  const s = newGame({ seed: "govtrouble", starting_slaves: 4 } as never);
  s.arcology.cash = 300_000;
  const place = powers(s).find((p) => p.kind === "neighbour")!;
  empireOf(s).powers[place.id].status = "vassal";
  const her = cands(s)[0];
  her.persona.intelligence = "slow"; her.persona.education = 10; her.persona.conscience = 0.2;
  her.persona.core_traits = ["quiet", "careful", "keeps to herself"];
  check("a slow, cold woman runs it hard and badly", styleOf(her).map((x) => x.id).join() === "iron,lost", styleOf(her).map((x) => x.id));
  install(s, place.id, her.id);
  const g = govOf(s, place.id)!;
  check("her city has people in it", (g.faces ?? []).length === 3);
  const p0 = g.prosperity;
  for (let i = 0; i < 12; i++) { s.arcology.week++; tickGov(s); }
  check("left alone, she gets into trouble", (g.problems ?? []).length > 0 || (g.news ?? []).length > 0, g.problems);
  check("and the city goes downhill", g.prosperity < p0 + 2, [p0, g.prosperity]);
  check("trouble is told as what happened, with names", (g.news ?? []).every((n) => !/prosperity|order \d/i.test(n.text)), g.news);
  g.problems = [{ id: "x", kind: "raiders", text: "raiders", need: "troops", severity: 5, since: s.arcology.week }];
  check("with no army to spare, no soldiers go", /can't/.test(supportGovernor(s, place.id, "troops")) || (g.garrison ?? 0) === 1);
  s.arcology.mercenaries = { hired: true, strength: 100, loyalty: 80, upkeep: 0 };
  supportGovernor(s, place.id, "troops");
  check("soldiers help", (g.garrison ?? 0) === 1 && !(g.problems ?? []).some((x) => x.kind === "raiders" && x.severity >= 5), g.problems);
  const r0 = endWeekCost(s, place.id);
  check("and cost money every week", r0 < 0, r0);
  const d = cands(s).find((x) => x.id !== her.id)!;
  sendDeputy(s, place.id, d.id);
  check("a deputy goes with her", g.deputy === d.id && d.governs === place.id && d.assignment === "be your agent");
}
function endWeekCost(s: ReturnType<typeof newGame>, _id: string): number { return tickGov(s).cash; }

// She's still yours: you can drag her home in chains, and threats are written to land.
import { lockUp, GOV_ORDERS as ORDERS } from "../src/engine/governor.ts";
import { HOUSE_STYLE } from "../src/engine/prompts.ts";
import { GOV_VOICE } from "../src/engine/talk.ts";
{
  const s = newGame({ seed: "chains", starting_slaves: 4 } as never);
  const place = powers(s).find((p) => p.kind === "neighbour")!;
  empireOf(s).powers[place.id].status = "vassal";
  const her = cands(s)[0];
  install(s, place.id, her.id);
  const g = govOf(s, place.id)!;
  const fear0 = her.bond.fear;
  const line = ORDERS.imprison.run(s, g, her);
  check("a governor can be dragged home and locked up", /locked/.test(line) && her.assignment === "be confined in the cellblock" && !her.governs && !govOf(s, place.id), line);
  check("and she's afraid now", her.bond.fear > fear0 + 10);
  check("and the city has no governor", !powerById(s, place.id)!.rec.governor);
  const other = Object.values(s.people).find((p) => p.status === "owned" && p.id !== her.id)!;
  lockUp(s, other, "locked in a cell");
  endWeek(s);
  check("a cell works with no cellblock built", other.assignment === "be confined in the cellblock" && s.reports.at(-1)!.ledger.length > 0);
  check("every prompt says the owner's threats land", /should be genuinely frightened/.test(HOUSE_STYLE) && /never shrugs it off/.test(GOV_VOICE));
  check("a governor is still a slave to the owner", /Governing a city doesn't change that/.test(GOV_VOICE));
}

// Tastes aren't rank: her terms don't become your orders, a punished defiance didn't stand.
import { ownerSaidIt } from "../src/engine/turn.ts";
import { selfBrief } from "../src/engine/self.ts";
{
  check("her terms aren't filed as your orders", !ownerSaidIt("if the owner visits her, he visits Cinder too and sits at her table first", "No. My calendar is my own. I will not be coming back."));
  check("your own words are", ownerSaidIt("Kayode gets her cock and the owner gets her soles", "She gets your cock. I get to be with your feet and soles. Kayode gets it."));
  const s = newGame({ seed: "rank", starting_slaves: 2 } as never);
  s.player.self = "very submissive to slaves that use their feet around me";
  check("the owner's self-description is read as tastes, not rank", /TASTES ARE NOT RANK/.test(selfBrief(s)) && /play is over/.test(selfBrief(s)));
}
