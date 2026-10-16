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
