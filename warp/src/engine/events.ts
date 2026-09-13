/**
 * EVENTS — what the world does when you are not the one doing something.
 *
 * The old game's events were passages: a page of prose with three links, written once, seen
 * forever, and completely disconnected from the state that produced them. Here an event is a
 * SITUATION — a seed sentence plus a small set of options with real effects — and the prose is
 * generated at play time by the narrator from the actual state of the actual people involved
 * (engine/turn.ts). With no model configured you still get the situation, the options and the
 * consequences; what you lose is the paragraph, not the event.
 *
 * Selection is deterministic and pressure-driven, ported from Weft: the world's willingness to
 * throw something at you rises with the tension dial, with time since the last event, and with how
 * unstable your arcology actually is. At tension 0 the engine originates NOTHING — every event
 * that fires is one your own household produced.
 */
import type { PendingEvent, Person, SaveState } from "./types";
import { read } from "./obedience";
import { rng } from "./rng";
import { clamp } from "./psyche";
import { applyTreatment } from "./obedience";
import { remember } from "./memory";
import { startRumor } from "./social";
import { scoreFor } from "./society";
import { DOCTRINE_BY_ID } from "../data/doctrines";

export interface EventOption {
  id: string;
  label: string;
  note?: string;
  /** Returns the line for the log. Mutates freely; this is the resolution. */
  resolve: (s: SaveState, e: PendingEvent, p?: Person) => string;
}

export interface EventDef {
  id: string;
  severity: PendingEvent["severity"];
  /** Who or what this could happen to. Return an empty list and it cannot fire. */
  candidates: (s: SaveState) => { person?: Person; facility?: string }[];
  /** How badly the world wants this one, before pressure. */
  weight: (s: SaveState, c: { person?: Person; facility?: string }) => number;
  seed: (s: SaveState, c: { person?: Person; facility?: string }) => string;
  options: EventOption[];
  /** True when this event came out of your household rather than out of the world. These fire at
   *  tension 0; world events do not. */
  endogenous: boolean;
}

/** How a person scores against one adopted doctrine — the flashpoint event's whole condition. */
function scoreOf(s: SaveState, p: Person, doctrineId: string): number {
  const d = DOCTRINE_BY_ID[doctrineId];
  return d ? scoreFor(p, d) : 0;
}

const owned = (s: SaveState): Person[] => Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");

export const EVENTS: EventDef[] = [
  {
    id: "flight", severity: "major", endogenous: true,
    candidates: (s) => owned(s).filter((p) => read(p).flight_risk > 0.3).map((person) => ({ person })),
    weight: (_s, c) => read(c.person!).flight_risk * 14,
    seed: (_s, c) => `${c.person!.name} has been found at a service door on the industrial level, three floors from anywhere she is supposed to be, at four in the morning.`,
    options: [
      { id: "cell", label: "The cellblock", note: "fast obedience, and she will never forget it",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 7, why: "caught at the door" }, s.arcology.week); p!.psyche.relaxation = clamp(p!.psyche.relaxation - 3, -10, 10); startRumor(s, `${p!.name} tried to run and went to the cells`, { about: p!.id, salience: 7 }); return `${p!.name} is in the cellblock until Thursday, and she is not going to forget which one of you sent her there.`; } },
      { id: "ask", label: "Ask her what she was doing", note: "costs you nothing but the hour",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "recognition", size: 4, why: "asked instead of punished" }, s.arcology.week); p!.bond.hope = clamp(p!.bond.hope + 10, 0, 100); return `She talked for the better part of an hour and told you most of it. The part about the service door was a lie, but she told the rest of it straight, so you let that one go.`; } },
      { id: "sell", label: "Sell her before she manages it",
        resolve: (s, _e, p) => { p!.status = "sold"; p!.exit_week = s.arcology.week; p!.exit_note = "sold after an escape attempt"; s.arcology.cash += 800; startRumor(s, `${p!.name} was sold the same week she tried to run`, { salience: 8 }); return `Gone by Thursday.`; } },
      { id: "ignore", label: "Do nothing and see what she does next",
        resolve: (s, _e, p) => { p!.bond.hope = clamp(p!.bond.hope + 4, 0, 100); p!.bond.resentment = clamp(p!.bond.resentment - 3, 0, 100); return `You never raised it with her at all. She has worked out that you are not going to, and she has not decided yet what to make of that.`; } },
    ],
  },
  {
    id: "breaking", severity: "notable", endogenous: true,
    candidates: (s) => owned(s).filter((p) => p.psyche.state === "fracturing").map((person) => ({ person })),
    weight: () => 9,
    seed: (_s, c) => `${c.person!.name} has stopped answering to her name. She does what she is told, immediately, and there is nobody behind it.`,
    options: [
      { id: "spa", label: "Spa, and take her off everything",
        resolve: (s, _e, p) => { p!.assignment = "rest in the spa"; p!.health.aphrodisiacs = 0; applyTreatment(p!, { kind: "kindness", size: 6, why: "pulled out before she broke" }, s.arcology.week); return `She is in the spa and off everything, and the clinic says it will be weeks before anyone can tell whether any of it took.`; } },
      { id: "push", label: "Push her the rest of the way", note: "a broken slave is obedient and nothing else",
        resolve: (s, _e, p) => { p!.psyche.relaxation = -9.5; p!.psyche.state = "broken"; p!.psyche.break_mode = "dissociative"; applyTreatment(p!, { kind: "cruelty", size: 9, why: "finished her" }, s.arcology.week); return `She went on the Tuesday afternoon, quietly, in the middle of a shift, and she has done everything she has been told since then without once asking why.`; } },
      { id: "ignore", label: "Leave her in place",
        resolve: () => `You left her where she was and changed nothing, and she has carried on exactly as before, because carrying on is the only thing she does now.` },
    ],
  },
  {
    id: "devoted_request", severity: "minor", endogenous: true,
    candidates: (s) => owned(s).filter((p) => read(p).devotion > 55 && p.bond.hope > 30).map((person) => ({ person })),
    weight: (_s, c) => 3 + c.person!.bond.hope / 25,
    seed: (_s, c) => `${c.person!.name} has asked to speak to you. She has clearly been working up to it for days.`,
    options: [
      { id: "grant", label: "Give her what she asks for",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "promise_kept", size: 6, why: "she asked and you said yes" }, s.arcology.week); s.arcology.cash -= 500; return `You said yes. It cost about five hundred to arrange, and she had told three other people about it before the day was out.`; } },
      { id: "later", label: "Tell her later",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "neglect", size: 3, why: "asked and got 'later'" }, s.arcology.week); return `"Of course," she said, and she meant it, and she has not asked you for anything since.`; } },
      { id: "refuse", label: "Refuse, and say why",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 1, why: "refused, but honestly" }, s.arcology.week); p!.bond.hope = clamp(p!.bond.hope - 8, 0, 100); return `You told her no and then told her why. She argued with the reason for a minute or two, which she would not have done a year ago, and then let it drop.`; } },
    ],
  },
  {
    id: "rivalry", severity: "notable", endogenous: true,
    candidates: (s) => {
      const list = owned(s);
      const out: { person?: Person }[] = [];
      for (const a of list) {
        const enemy = s.edges.find((e) => e.from === a.id && e.warmth < -35);
        if (enemy) out.push({ person: a });
      }
      return out;
    },
    weight: () => 4,
    seed: (s, c) => {
      const enemy = s.edges.find((e) => e.from === c.person!.id && e.warmth < -35);
      const other = enemy ? s.people[enemy.to] : undefined;
      return `${c.person!.name} and ${other?.name ?? "another of yours"} have had whatever this is for weeks, and last night it came apart in front of the others.`;
    },
    options: [
      { id: "separate", label: "Separate them", resolve: () => `You put them on different floors, so they see each other at handover and nowhere else.` },
      { id: "pick", label: "Back one of them publicly",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "recognition", size: 5, why: "backed in public" }, s.arcology.week); return `You backed ${p!.name} in front of the whole household, so the other one knows exactly where she stands now, and so does everybody else.` } },
      { id: "both", label: "Punish both", resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 4, why: "punished for fighting" }, s.arcology.week); return `You punished them both the same. They have already agreed between themselves that it was unfair, so whatever either of them took from it, it was not the thing you meant to teach.` } },
    ],
  },
  {
    id: "neighbour_scheme", severity: "major", endogenous: false,
    candidates: (s) => s.arcology.neighbours.filter((n) => n.attitude < 0).map(() => ({})),
    weight: (s) => 5 + s.arcology.neighbours.filter((n) => n.attitude < -30).length * 3,
    seed: (s) => {
      const n = s.arcology.neighbours.filter((x) => x.attitude < 0).sort((a, b) => a.attitude - b.attitude)[0];
      return `${n?.name ?? "The arcology to the east"} has started buying your suppliers. They are doing it openly enough that you were always going to hear about it, and quietly enough that nobody has had to say anything to your face.`;
    },
    options: [
      { id: "buy", label: "Outbid them", note: "expensive, and it works",
        resolve: (s) => { s.arcology.cash -= 12000; const n = s.arcology.neighbours.find((x) => x.attitude < 0); if (n) n.attitude = clamp(n.attitude - 10, -100, 100); return `Twelve thousand over the odds kept the suppliers where they were, at least until the next quarter.`; } },
      { id: "diplomacy", label: "Go and talk to them",
        resolve: (s) => { const n = s.arcology.neighbours.find((x) => x.attitude < 0); if (n) n.attitude = clamp(n.attitude + 25, -100, 100); s.arcology.rep -= 200; return `You went over there yourself and sat through two hours of it. Being seen to ask cost you some standing, but it has bought you about a year.`; } },
      { id: "ignore", label: "Let it happen",
        resolve: (s) => { s.arcology.prosperity = clamp(s.arcology.prosperity - 8, 0, 200); return `Prosperity is down eight this week, and nobody in the room expects that to be where it stops.`; } },
    ],
  },
  {
    id: "citizens_unhappy", severity: "notable", endogenous: false,
    candidates: (s) => (s.arcology.crime > 40 || s.arcology.prosperity < 45 ? [{}] : []),
    weight: (s) => 3 + s.arcology.crime / 12,
    seed: (s) => `There was a crowd on the commercial level tonight. It was not a riot, but it was the kind of gathering that tends to come before one in an arcology carrying ${s.arcology.crime | 0} points of crime and not enough watch to cover the floor.`,
    options: [
      { id: "security", label: "Put more watch on the floor", resolve: (s) => { s.arcology.cash -= 6000; s.arcology.security = clamp(s.arcology.security + 12, 0, 100); s.arcology.crime = clamp(s.arcology.crime - 10, 0, 100); return `Six thousand in overtime put enough watch on the floor that it had gone quiet by Thursday.`; } },
      { id: "spend", label: "Buy them off", resolve: (s) => { s.arcology.cash -= 10000; s.arcology.rep += 400; s.arcology.crime = clamp(s.arcology.crime - 6, 0, 100); return `You put on free food and a festival, which came to ten thousand and bought considerably more goodwill than ten thousand usually does.`; } },
      { id: "hard", label: "Make an example", resolve: (s) => { s.arcology.crime = clamp(s.arcology.crime - 18, 0, 100); s.arcology.rep -= 300; s.arcology.public_standing = clamp(s.arcology.public_standing - 2, -10, 10); return `You made an example of two of them where the whole level could see it, and the commercial floor has been very quiet since.`; } },
    ],
  },
  {
    id: "pregnancy_found", severity: "minor", endogenous: true,
    candidates: (s) => owned(s).filter((p) => p.womb.fetuses.length && p.womb.weeks >= 8 && p.womb.weeks <= 10).map((person) => ({ person })),
    weight: () => 6,
    seed: (_s, c) => `${c.person!.name} is nine weeks pregnant. The clinic flagged it on a routine panel, and she has known for at least a fortnight without telling anybody.`,
    options: [
      { id: "keep", label: "She carries it",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 3, why: "allowed to carry" }, s.arcology.week); return `She is carrying it.`; } },
      { id: "end", label: "End it",
        resolve: (s, _e, p) => { p!.womb.fetuses = []; p!.womb.abortions++; p!.womb.weeks = 0; applyTreatment(p!, { kind: "cruelty", size: 6, why: "the pregnancy ended without her say" }, s.arcology.week); const mem = s.memory[p!.id]; if (mem) remember(mem, { content: "the pregnancy was ended, and nobody asked her", week: s.arcology.week, importance: 9, charge: "sharp", core: true }); return `It was done on the Wednesday morning, and she asked to be back on the rota by Friday.`; } },
      { id: "ask", label: "Ask her what she wants",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "recognition", size: 7, why: "asked about her own body" }, s.arcology.week); return `You asked her what she wanted before anything was decided, and whatever she answered, being asked is the part she has told the others about.`; } },
    ],
  },
  {
    id: "shark", severity: "major", endogenous: false,
    candidates: (s) => (s.arcology.cash < 4000 ? [{}] : []),
    weight: (s) => (s.arcology.cash < 0 ? 12 : 5),
    seed: () => `A man who does not give a surname has left a card with your steward. He knows exactly how much you are short by, and he left the card so that you would know he knows.`,
    options: [
      { id: "take", label: "Take the money", note: "40% APR, and he collects",
        resolve: (s) => { s.arcology.cash += 20000; s.arcology.loans.push({ lender: "shark", principal: 20000, apr: 0.4, due_week: s.arcology.week + 20, installments: 4 }); return `Twenty thousand in hand and a man who knows where you live.`; } },
      { id: "bank", label: "Go to the bank instead", note: "12% APR, and they want collateral",
        resolve: (s) => { s.arcology.cash += 12000; s.arcology.loans.push({ lender: "bank", principal: 12000, apr: 0.12, due_week: s.arcology.week + 40, installments: 8 }); return `Twelve thousand, at bank rates, against the residential sectors.`; } },
      { id: "refuse", label: "Send him away", resolve: () => `You sent him away, and he left the card on the steward's desk anyway, face up.` },
    ],
  },
  {
    id: "outbreak", severity: "notable", endogenous: true,
    candidates: (s) => (owned(s).filter((p) => p.health.illness >= 2).length >= 2 ? [{}] : []),
    weight: (s) => 4 + owned(s).filter((p) => p.health.illness >= 2).length,
    seed: (s) => `Four of them have the same thing, and it started in ${Object.values(s.arcology.facilities).find((f) => f.workers.length > 2)?.name ?? "the servants' quarters"}.`,
    options: [
      { id: "treat", label: "Treat everybody", resolve: (s) => { s.arcology.cash -= 8000; for (const p of owned(s)) { p.health.illness = 0; p.health.health = clamp(p.health.health + 8, -100, 100); } return `Eight thousand of medicine across the whole household, and the thing had stopped spreading inside a week.`; } },
      { id: "isolate", label: "Isolate the sick", resolve: (s) => { for (const p of owned(s).filter((x) => x.health.illness)) { p.assignment = "get treatment in the clinic"; p.psyche.relaxation = clamp(p.psyche.relaxation - 0.6, -10, 10); } return `The sick are in the clinic and the rest are working.`; } },
      { id: "nothing", label: "Ride it out", resolve: (s) => { for (const p of owned(s)) if (p.health.illness) p.health.health = clamp(p.health.health - 12, -100, 100); return `You let it run its course, which took about three weeks, and two of them came out of it considerably worse than they went in.`; } },
    ],
  },
  {
    id: "prestige_offer", severity: "minor", endogenous: false,
    candidates: (s) => (s.arcology.rep > 2000 ? owned(s).filter((p) => p.body.face > 70).map((person) => ({ person })) : []),
    weight: () => 3,
    seed: (_s, c) => `A promoter wants to put ${c.person!.name} in front of an audience. He has brought numbers with him, and they are better than you were expecting.`,
    options: [
      { id: "yes", label: "Let him", resolve: (s, _e, p) => { p!.fame.prestige = Math.min(3, p!.fame.prestige + 1) as 0 | 1 | 2 | 3; p!.fame.why = "shown, and remembered"; s.arcology.rep += 600; return `${p!.name} is a name now, in a small way, and the promoter has already written asking about a second night.`; } },
      { id: "no", label: "Decline", resolve: () => `You declined, politely, and he took it politely, and he will be back inside a month.` },
    ],
  },
  {
    id: "pair_bond", severity: "minor", endogenous: true,
    candidates: (s) => {
      const out: { person?: Person }[] = [];
      for (const e of s.edges) {
        if (e.warmth < 55) continue;
        const back = s.edges.find((x) => x.from === e.to && x.to === e.from);
        if (!back || back.warmth < 55) continue;
        const p = s.people[e.from];
        if (p && (p.status === "owned" || p.status === "indentured")) out.push({ person: p });
      }
      return out;
    },
    weight: () => 4,
    seed: (s, c) => {
      const e = s.edges.filter((x) => x.from === c.person!.id).sort((a, b) => b.warmth - a.warmth)[0];
      const other = e ? s.people[e.to] : undefined;
      return `${c.person!.name} and ${other?.name ?? "one of the others"} have become something. Neither of them will say so, and they are careful about it in front of you, so you have had to work it out from the way they hand each other things.`;
    },
    options: [
      { id: "allow", label: "Leave them alone",
        resolve: (s, _e, p) => {
          const edge = s.edges.filter((x) => x.from === p!.id).sort((a, b) => b.warmth - a.warmth)[0];
          const other = edge ? s.people[edge.to] : undefined;
          for (const person of [p!, other].filter(Boolean) as Person[]) {
            applyTreatment(person, { kind: "recognition", size: 4, why: "allowed to have somebody" }, s.arcology.week);
            person.psyche.relaxation = clamp(person.psyche.relaxation + 1, -10, 10);
          }
          if (edge) { edge.roles.push("lover"); }
          return `You left them to it and said nothing, and they have taken that as permission, because that is what it was.`;
        } },
      { id: "separate", label: "Separate them",
        resolve: (s, _e, p) => {
          const edge = s.edges.filter((x) => x.from === p!.id).sort((a, b) => b.warmth - a.warmth)[0];
          const other = edge ? s.people[edge.to] : undefined;
          for (const person of [p!, other].filter(Boolean) as Person[]) {
            applyTreatment(person, { kind: "cruelty", size: 5, why: "separated from the one person who was helping" }, s.arcology.week);
            const mem = s.memory[person.id];
            if (mem) remember(mem, { content: "the one good thing here was taken away on purpose", week: s.arcology.week, importance: 8, charge: "sharp", core: true });
          }
          return `You put them on different floors and different shifts, and they have found ways round it that the rest of the household is pretending not to notice.`;
        } },
      { id: "use", label: "Put them to work together", note: "they perform better, and they stop being two separate people",
        resolve: (s, _e, p) => {
          applyTreatment(p!, { kind: "kindness", size: 2, why: "kept with her person" }, s.arcology.week);
          p!.skills.entertainment = clamp(p!.skills.entertainment + 6, 0, 100);
          return `You started booking them as a pair. The takings went up by about a third, and neither of them has looked at you directly since.`;
        } },
    ],
  },
  {
    id: "doctrine_flashpoint", severity: "notable", endogenous: false,
    candidates: (s) => {
      const strong = Object.entries(s.arcology.doctrines).filter(([, st]) => st.adoption > 65).map(([id]) => id);
      if (!strong.length) return [];
      return owned(s).filter((p) => strong.some((d) => scoreOf(s, p, d) < -0.4)).map((person) => ({ person }));
    },
    weight: () => 5,
    seed: (s, c) => {
      const strong = Object.entries(s.arcology.doctrines).sort((a, b) => b[1].adoption - a[1].adoption)[0];
      return `Somebody wrote about ${c.person!.name} on the public boards. Your arcology believes what it believes about bodies now — ${Math.round(strong?.[1].adoption ?? 0)}% of it does — and she is standing evidence against it.`;
    },
    options: [
      { id: "change", label: "Change her to fit", note: "expensive, and she is the one who pays it",
        resolve: (s, _e, p) => { s.arcology.cash -= 9000; applyTreatment(p!, { kind: "cruelty", size: 5, why: "remade to suit the doctrine" }, s.arcology.week); p!.health.recovery_weeks += 2; return `Nine thousand and two weeks in the clinic, and she came out looking like what the doctrine says she is supposed to look like.`; } },
      { id: "hide", label: "Keep her out of sight",
        resolve: (s, _e, p) => { p!.assignment = "house servant"; applyTreatment(p!, { kind: "neglect", size: 3, why: "hidden away" }, s.arcology.week); return `She works the back corridors now, where the people who wrote about her do not have to look at her.`; } },
      { id: "defend", label: "Say publicly that she stays as she is", note: "costs standing, and she will hear that you did it",
        resolve: (s, _e, p) => { s.arcology.rep -= 800; applyTreatment(p!, { kind: "recognition", size: 8, why: "defended in public, at cost" }, s.arcology.week); const mem = s.memory[p!.id]; if (mem) remember(mem, { content: "he stood up in front of the whole arcology and said she stays as she is", week: s.arcology.week, importance: 10, charge: "bright", core: true }); return `You said it publicly, and it cost about eight hundred in standing, and she had heard about it from somebody else inside the hour.`; } },
    ],
  },
  {
    id: "mercenary_offer", severity: "minor", endogenous: false,
    candidates: (s) => (!s.arcology.mercenaries.hired && s.arcology.cash > 25000 ? [{}] : []),
    weight: (s) => (s.arcology.security < 40 ? 5 : 2),
    seed: () => `A company that has just finished somewhere else is looking for a retainer. Their captain is direct about the price and evasive about the last contract.`,
    options: [
      { id: "hire", label: "Take them on", note: "¤22,000 up front — under the usual rate",
        resolve: (s) => { s.arcology.cash -= 22000; s.arcology.mercenaries = { hired: true, strength: 50, loyalty: 55, upkeep: 3500 }; s.arcology.security = clamp(s.arcology.security + 18, 0, 100); return `You took them on, and they had moved into the freight level by that afternoon, before anybody got round to telling them where to go.`; } },
      { id: "pass", label: "Pass", resolve: () => `You passed on them, and they went east instead, to the arcology that has been buying your suppliers.` },
    ],
  },
  {
    id: "returned", severity: "major", endogenous: true,
    candidates: (s) => (Object.values(s.people).some((p) => p.status === "free" && p.exit_note === "escaped") ? [{}] : []),
    weight: () => 6,
    seed: (s) => {
      const gone = Object.values(s.people).find((p) => p.status === "free" && p.exit_note === "escaped");
      return `${gone?.name ?? "Somebody who used to be yours"} is at the residential doors. She came back on her own, and she is not explaining why yet.`;
    },
    options: [
      { id: "take", label: "Take her back in",
        resolve: (s) => {
          const gone = Object.values(s.people).find((p) => p.status === "free" && p.exit_note === "escaped");
          if (!gone) return "";
          gone.status = "owned";
          delete gone.exit_week;
          gone.exit_note = undefined;
          applyTreatment(gone, { kind: "recognition", size: 6, why: "came back and was let in" }, s.arcology.week);
          gone.bond.hope = clamp(gone.bond.hope + 20, 0, 100);
          startRumor(s, `${gone.name} came back on her own`, { salience: 8, about: gone.id });
          return `${gone.name} is upstairs in her old room. Whatever happened out there she is not saying, and the steward has been told not to ask her.`;
        } },
      { id: "refuse", label: "Leave her at the door",
        resolve: (s) => {
          const gone = Object.values(s.people).find((p) => p.status === "free" && p.exit_note === "escaped");
          startRumor(s, `he left ${gone?.name ?? "her"} standing at the door`, { salience: 7 });
          for (const p of owned(s)) p.bond.hope = clamp(p.bond.hope - 6, 0, 100);
          return `She stood at the residential doors for about two hours before she gave up and went, and most of the household watched it from four floors up without saying anything.`;
        } },
    ],
  },
];


export const EVENT_BY_ID: Record<string, EventDef> = Object.fromEntries(EVENTS.map((e) => [e.id, e]));

/** PRESSURE — how much the world is allowed to do to you this week.
 *  Rises with the tension dial, with quiet, and with genuine instability. */
export function pressure(s: SaveState): number {
  const quiet = clamp(s.arcology.week - (s.events.at(-1)?.week ?? 0), 0, 6);
  const instability = clamp(
    (s.arcology.crime / 30) + (s.arcology.cash < 0 ? 2 : 0) +
    owned(s).filter((p) => p.psyche.state !== "intact").length * 0.5, 0, 8);
  return clamp(s.models.tension * 0.6 + quiet * 0.5 + instability, 0, 12);
}

/** Choose this week's events. Never more than two, because a week that is all events is a week
 *  where nothing you decided mattered. */
export function selectEvents(s: SaveState): PendingEvent[] {
  const p = pressure(s);
  const r = rng(`events:${s.arcology.week}`);
  const pool: { def: EventDef; c: { person?: Person; facility?: string }; w: number }[] = [];

  for (const def of EVENTS) {
    if (!def.endogenous && s.models.tension === 0) continue;
    for (const c of def.candidates(s)) {
      const w = def.weight(s, c);
      if (w > 0) pool.push({ def, c, w });
    }
  }
  if (!pool.length) return [];

  const howMany = p > 8 ? 2 : p > 3 ? 1 : r.chance(p / 6) ? 1 : 0;
  const out: PendingEvent[] = [];
  const used = new Set<string>();
  for (let i = 0; i < howMany && pool.length; i++) {
    const pickFrom = pool.filter((x) => !used.has(x.def.id));
    if (!pickFrom.length) break;
    const choice = r.weighted(pickFrom, (x) => x.w);
    used.add(choice.def.id);
    out.push({
      id: `e${s.arcology.week}-${choice.def.id}`,
      kind: choice.def.id,
      person: choice.c.person?.id,
      facility: choice.c.facility,
      seed: choice.def.seed(s, choice.c),
      options: choice.def.options.map((o) => ({ id: o.id, label: o.label, note: o.note })),
      week: s.arcology.week,
      severity: choice.def.severity,
    });
  }
  return out;
}

export function resolveEvent(s: SaveState, e: PendingEvent, optionId: string): string {
  const def = EVENT_BY_ID[e.kind];
  const opt = def?.options.find((o) => o.id === optionId);
  if (!opt) return "";
  const person = e.person ? s.people[e.person] : undefined;
  const line = opt.resolve(s, e, person);
  s.events = s.events.filter((x) => x.id !== e.id);
  s.notifications.push({ id: `n-${e.id}`, week: s.arcology.week, text: line, kind: e.severity === "major" ? "warning" : "info", person: e.person, seen: false });
  return line;
}
