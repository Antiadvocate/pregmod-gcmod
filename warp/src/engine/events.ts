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
import { resolveAct } from "./intimacy";

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
    seed: (_s, c) => `Security caught ${c.person!.name} at a service door on the industrial level at four in the morning, with a bag of stolen food and a keycard she shouldn't have had. She was trying to escape.\n\nShe's sitting in your security office now, handcuffed to a chair. She won't look at anyone, and she's shaking.`,
    options: [
      { id: "cell", label: "The cellblock", note: "she'll obey out of fear, and never forget it",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 7, why: "caught at the door" }, s.arcology.week); p!.psyche.relaxation = clamp(p!.psyche.relaxation - 3, -10, 10); startRumor(s, `${p!.name} tried to run and went to the cells`, { about: p!.id, salience: 7 }); return `You have ${p!.name} taken to the cellblock and locked in a bare cell for a week. The guards know what to do with runaways: she's kept awake, fed through the bars, and made to understand exactly what happens to slaves who run.\n\nWhen she comes out, she's very quiet and very obedient. She's also never going to trust you.`; } },
      { id: "ask", label: "Ask her what she was doing", note: "costs nothing but your time",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "recognition", size: 4, why: "asked instead of punished" }, s.arcology.week); p!.bond.hope = clamp(p!.bond.hope + 10, 0, 100); return `You sit down across from ${p!.name} and ask her why. It takes a while, but she tells you: she's frightened, she misses home, and one of the kitchen staff told her there was a boat.\n\nYou believe about half of it. But she wasn't punished, and she noticed.`; } },
      { id: "sell", label: "Sell her before she manages it",
        resolve: (s, _e, p) => { p!.status = "sold"; p!.exit_week = s.arcology.week; p!.exit_note = "sold after an escape attempt"; s.arcology.cash += 800; startRumor(s, `${p!.name} was sold the same week she tried to run`, { salience: 8 }); return `You don't want a runaway in the house. ${p!.name} is sold to a broker by Thursday, at a loss, with "escape risk" written on her papers.\n\nYour other slaves see her taken away, and draw their own conclusions.`; } },
      { id: "ignore", label: "Do nothing and see what she does next",
        resolve: (s, _e, p) => { p!.bond.hope = clamp(p!.bond.hope + 4, 0, 100); p!.bond.resentment = clamp(p!.bond.resentment - 3, 0, 100); return `You tell security to take off the cuffs and send her back to the dormitory. Nothing else happens.\n\n${p!.name} spends the next few days waiting for the punishment that never comes. She's confused, and a little less sure that she needs to run.`; } },
    ],
  },
  {
    id: "breaking", severity: "notable", endogenous: true,
    candidates: (s) => owned(s).filter((p) => p.psyche.state === "fracturing").map((person) => ({ person })),
    weight: () => 9,
    seed: (_s, c) => `${c.person!.name} is on the verge of breaking. She obeys every order instantly, with no expression at all, but she barely responds to her own name. She's stopped eating unless someone tells her to, and at night the others hear her talking to herself.\n\nA few more weeks like this and there won't be anything left of her.`,
    options: [
      { id: "spa", label: "Spa, and take her off everything",
        resolve: (s, _e, p) => { p!.assignment = "rest in the spa"; p!.health.aphrodisiacs = 0; applyTreatment(p!, { kind: "kindness", size: 6, why: "pulled out before she broke" }, s.arcology.week); return `You take ${p!.name} off everything and send her to the spa with orders that nobody is to ask anything of her. For the first few days she just sits in the warm water, staring at the tiles.\n\nIt'll take weeks, but she's coming back.`; } },
      { id: "push", label: "Push her the rest of the way", note: "a broken slave is obedient and nothing else",
        resolve: (s, _e, p) => { p!.psyche.relaxation = -9.5; p!.psyche.state = "broken"; p!.psyche.break_mode = "dissociative"; applyTreatment(p!, { kind: "cruelty", size: 9, why: "finished her" }, s.arcology.week); return `You keep the pressure on. ${p!.name} breaks on Tuesday, in the middle of her shift: she simply stops, and stands there until someone gives her the next order.\n\nShe's been perfectly obedient ever since. She'll do anything she's told, and there's nobody left behind her eyes to mind.`; } },
      { id: "ignore", label: "Leave her in place",
        resolve: (_s, _e, p) => `You leave ${p?.name ?? "her"} where she is. She keeps working, and keeps getting quieter.` },
    ],
  },
  {
    id: "devoted_request", severity: "minor", endogenous: true,
    candidates: (s) => owned(s).filter((p) => read(p).devotion > 55 && p.bond.hope > 30).map((person) => ({ person })),
    weight: (_s, c) => 3 + c.person!.bond.hope / 25,
    seed: (_s, c) => `${c.person!.name} has asked to speak to you. She comes into your office twisting her hands together, clearly nervous.\n\nShe's been working up the courage for days. She wants something small: a warmer blanket, a book, an afternoon off to see a friend in the Club. It matters to her a lot more than it costs you.`,
    options: [
      { id: "grant", label: "Give her what she asks for",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "promise_kept", size: 6, why: "she asked and you said yes" }, s.arcology.week); s.arcology.cash -= 500; return `You say yes. It costs you about five hundred, which is nothing.\n\n${p!.name} thanks you three times on her way out, and you hear her telling the others in the corridor. She works harder all week.`; } },
      { id: "later", label: "Tell her later",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "neglect", size: 3, why: "asked and got 'later'" }, s.arcology.week); return `You tell her you'll think about it. "Of course," she says, and leaves.\n\nYou never get back to her, and she never asks again. She's just a little more careful around you after that.`; } },
      { id: "refuse", label: "Refuse, and say why",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 1, why: "refused, but honestly" }, s.arcology.week); p!.bond.hope = clamp(p!.bond.hope - 8, 0, 100); return `You tell her no, and you explain why. She's disappointed, and it shows.\n\nBut she was told the truth, and she respects that. She thanks you for your time.`; } },
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
      return `${c.person!.name} and ${other?.name ?? "another of yours"} have been feuding for weeks, and last night it turned into a fight in front of the others: pulled hair, scratched faces, a broken lamp, and the whole dormitory screaming.\n\nThey're both waiting outside your office now, not looking at each other.`;
    },
    options: [
      { id: "separate", label: "Separate them", resolve: (_s, _e, p) => `You move ${p?.name ?? "one of them"} to a different floor and put them on opposite shifts. They don't have to see each other any more, and the dormitory calms down.\n\nNeither of them is happy about it, but they're not fighting.` },
      { id: "pick", label: "Back one of them publicly",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "recognition", size: 5, why: "backed in public" }, s.arcology.week); return `You side with ${p!.name}, in front of everyone. The other one is punished for starting it.\n\n${p!.name} is smug about it for a week. Her rival hates her more than ever, and now she hates you too.` } },
      { id: "both", label: "Punish both", resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 4, why: "punished for fighting" }, s.arcology.week); return `You have them both whipped, side by side, in front of the others.\n\nThey still hate each other. Now they both resent you too, and the rest of the household has learned that fighting isn't worth it.` } },
    ],
  },
  {
    id: "neighbour_scheme", severity: "major", endogenous: false,
    candidates: (s) => s.arcology.neighbours.filter((n) => n.attitude < 0).map(() => ({})),
    weight: (s) => 5 + s.arcology.neighbours.filter((n) => n.attitude < -30).length * 3,
    seed: (s) => {
      const n = s.arcology.neighbours.filter((x) => x.attitude < 0).sort((a, b) => a.attitude - b.attitude)[0];
      return `${n?.name ?? "The arcology to the east"} has started buying your suppliers. Three of them have stopped returning your steward's calls, and a fourth has doubled his prices.\n\nIt's a deliberate squeeze. If it keeps going, your shops will start running short and your citizens will notice.`;
    },
    options: [
      { id: "buy", label: "Outbid them", note: "expensive, and it works",
        resolve: (s) => { s.arcology.cash -= 12000; const n = s.arcology.neighbours.find((x) => x.attitude < 0); if (n) n.attitude = clamp(n.attitude - 10, -100, 100); return `You outbid them on every contract. It costs you twelve thousand, and your suppliers stay with you.\n\nYour neighbor knows exactly what you did, and likes you even less.`; } },
      { id: "diplomacy", label: "Go and talk to them",
        resolve: (s) => { const n = s.arcology.neighbours.find((x) => x.attitude < 0); if (n) n.attitude = clamp(n.attitude + 25, -100, 100); s.arcology.rep -= 200; return `You go over in person and sit down with their owner. It's an uncomfortable afternoon, and you have to make some concessions in public that cost you reputation.\n\nBut the squeeze stops, and relations between you are better than they've been in a long time.`; } },
      { id: "ignore", label: "Let it happen",
        resolve: (s) => { s.arcology.prosperity = clamp(s.arcology.prosperity - 8, 0, 200); return `You let it happen. Your shops start running short of things, prices go up, and prosperity drops.\n\nYour neighbor is winning, and everyone can see it.`; } },
    ],
  },
  {
    id: "citizens_unhappy", severity: "notable", endogenous: false,
    candidates: (s) => (s.arcology.crime > 40 || s.arcology.prosperity < 45 ? [{}] : []),
    weight: (s) => 3 + s.arcology.crime / 12,
    seed: (s) => `An angry crowd gathered on the commercial level tonight, several hundred people, shouting about crime and prices. Someone threw a bottle through a shop window.\n\nIt isn't a riot yet, but with crime at ${s.arcology.crime | 0} and not enough security, it could become one. Your security chief wants orders.`,
    options: [
      { id: "security", label: "Put more watch on the floor", resolve: (s) => { s.arcology.cash -= 6000; s.arcology.security = clamp(s.arcology.security + 12, 0, 100); s.arcology.crime = clamp(s.arcology.crime - 10, 0, 100); return `You pay six thousand in overtime and flood the commercial level with security. The crowd thins out once it's surrounded by guards, and by morning things are calm.\n\nThe extra patrols stay, and crime starts falling.`; } },
      { id: "spend", label: "Buy them off", resolve: (s) => { s.arcology.cash -= 10000; s.arcology.rep += 400; s.arcology.crime = clamp(s.arcology.crime - 6, 0, 100); return `You announce a festival for the weekend, with free food and drink on the concourse, and it costs you ten thousand.\n\nIt works. Nobody riots at a party, and your reputation gets a boost.`; } },
      { id: "hard", label: "Make an example", resolve: (s) => { s.arcology.crime = clamp(s.arcology.crime - 18, 0, 100); s.arcology.rep -= 300; s.arcology.public_standing = clamp(s.arcology.public_standing - 2, -10, 10); return `Your security teams pick out the ringleaders and have them flogged on the concourse the next morning, in front of everyone.\n\nThe arcology goes very quiet. Crime drops sharply. So does your standing with the citizens, who now know exactly what you'll do to them.`; } },
    ],
  },
  {
    id: "pregnancy_found", severity: "minor", endogenous: true,
    candidates: (s) => owned(s).filter((p) => p.womb.fetuses.length && p.womb.weeks >= 8 && p.womb.weeks <= 10).map((person) => ({ person })),
    weight: () => 6,
    seed: (_s, c) => `${c.person!.name} is nine weeks pregnant. The clinic found out during a routine exam; she's known for at least two weeks and didn't tell anyone.\n\nShe's waiting in the clinic, one hand on her stomach, to find out what you're going to do.`,
    options: [
      { id: "keep", label: "She carries it",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 3, why: "allowed to carry" }, s.arcology.week); return `You tell the clinic she'll carry it to term. ${p!.name} bursts into tears, and it's hard to tell whether she's relieved or terrified.\n\nShe'll start showing in a month or two.`; } },
      { id: "end", label: "End it",
        resolve: (s, _e, p) => { p!.womb.fetuses = []; p!.womb.abortions++; p!.womb.weeks = 0; applyTreatment(p!, { kind: "cruelty", size: 6, why: "the pregnancy ended without her say" }, s.arcology.week); const mem = s.memory[p!.id]; if (mem) remember(mem, { content: "the pregnancy was ended, and nobody asked her", week: s.arcology.week, importance: 9, charge: "sharp", core: true }); return `You tell the clinic to end it. It's done on Wednesday. ${p!.name} isn't asked, and isn't told until it's over.\n\nShe goes back to work the next week and doesn't talk about it.`; } },
      { id: "ask", label: "Ask her what she wants",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "recognition", size: 7, why: "asked about her own body" }, s.arcology.week); return `You ask ${p!.name} what she wants. She has to think about it for a long time; nobody has ever asked her anything like that before.\n\nWhatever she decides, she'll remember that you asked.`; } },
    ],
  },
  {
    id: "shark", severity: "major", endogenous: false,
    candidates: (s) => (s.arcology.cash < 4000 ? [{}] : []),
    weight: (s) => (s.arcology.cash < 0 ? 12 : 5),
    seed: () => `A loan shark has left his card with your steward. On the back, in neat handwriting, is exactly how much money you're short this month.\n\nHe's offering twenty thousand, today, no paperwork. The interest is ruinous, and everyone knows what happens to people who don't pay him.`,
    options: [
      { id: "take", label: "Take the money", note: "40% APR, and he collects",
        resolve: (s) => { s.arcology.cash += 20000; s.arcology.loans.push({ lender: "shark", principal: 20000, apr: 0.4, due_week: s.arcology.week + 20, installments: 4 }); return `The money arrives in a gym bag that afternoon. You have twenty thousand, and a loan shark who knows exactly where you live.\n\nHe'll want it back in twenty weeks, with interest.`; } },
      { id: "bank", label: "Go to the bank instead", note: "12% APR, and they want collateral",
        resolve: (s) => { s.arcology.cash += 12000; s.arcology.loans.push({ lender: "bank", principal: 12000, apr: 0.12, due_week: s.arcology.week + 40, installments: 8 }); return `You go to the bank instead. It takes a week of paperwork, and they'll only lend you twelve thousand, with the residential sectors as collateral.\n\nBut the rate is reasonable, and nobody's going to break your legs.`; } },
      { id: "refuse", label: "Send him away", resolve: () => `You tell your steward to send him away. He leaves the card anyway, on your desk, where you'll see it every day until the money comes in.` },
    ],
  },
  {
    id: "outbreak", severity: "notable", endogenous: true,
    candidates: (s) => (owned(s).filter((p) => p.health.illness >= 2).length >= 2 ? [{}] : []),
    weight: (s) => 4 + owned(s).filter((p) => p.health.illness >= 2).length,
    seed: (s) => `Four of your slaves are sick with the same thing. It started in ${Object.values(s.arcology.facilities).find((f) => f.workers.length > 2)?.name ?? "the servants' quarters"}.`,
    options: [
      { id: "treat", label: "Treat everybody", resolve: (s) => { s.arcology.cash -= 8000; for (const p of owned(s)) { p.health.illness = 0; p.health.health = clamp(p.health.health + 8, -100, 100); } return `You pay eight thousand for medicine for the whole household, sick or not. Within a week the illness is gone.\n\nYour slaves noticed that you treated all of them, not just the valuable ones.`; } },
      { id: "isolate", label: "Isolate the sick", resolve: (s) => { for (const p of owned(s).filter((x) => x.health.illness)) { p.assignment = "get treatment in the clinic"; p.psyche.relaxation = clamp(p.psyche.relaxation - 0.6, -10, 10); } return `The sick are moved to the clinic and kept away from the others. Everyone else keeps working.\n\nThe ones in the clinic are frightened and lonely, but the illness doesn't spread.`; } },
      { id: "nothing", label: "Ride it out", resolve: (s) => { for (const p of owned(s)) if (p.health.illness) p.health.health = clamp(p.health.health - 12, -100, 100); return `You let it run its course. It spreads through the dormitory, and for two weeks half your household is coughing and feverish.\n\nMost of them recover. Two of them are much worse for it.`; } },
    ],
  },
  {
    id: "prestige_offer", severity: "minor", endogenous: false,
    candidates: (s) => (s.arcology.rep > 2000 ? owned(s).filter((p) => p.body.face > 70).map((person) => ({ person })) : []),
    weight: () => 3,
    seed: (_s, c) => `A promoter from one of the big arcologies up the coast has seen ${c.person!.name} and wants to put her on stage: a series of shows, filmed and sold across the Free Cities.\n\nHe's offering good money, and a lot of attention.`,
    options: [
      { id: "yes", label: "Let him", resolve: (s, _e, p) => { p!.fame.prestige = Math.min(3, p!.fame.prestige + 1) as 0 | 1 | 2 | 3; p!.fame.why = "a local celebrity"; s.arcology.rep += 600; return `${p!.name} does the shows. She's nervous the first night and a natural by the third. The footage sells well across the Free Cities.\n\nShe's a minor celebrity now. Citizens recognize her on the concourse, and your reputation rises with hers.`; } },
      { id: "no", label: "Decline", resolve: () => `You decline. The promoter is disappointed, and tells you to call him if you change your mind. He'll be back.` },
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
        if (e.roles.includes("lover")) continue;
        if (p && (p.status === "owned" || p.status === "indentured")) out.push({ person: p });
      }
      return out;
    },
    weight: () => 4,
    seed: (s, c) => {
      const e = s.edges.filter((x) => x.from === c.person!.id).sort((a, b) => b.warmth - a.warmth)[0];
      const other = e ? s.people[e.to] : undefined;
      return `${c.person!.name} and ${other?.name ?? "one of the others"} are secretly lovers. They've been sneaking into each other's bunks at night for weeks, and they pull apart whenever you walk in.\n\nThe whole household knows. They're waiting to see what you'll do about it.`;
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
          return `You let it go. You don't say anything, but you make sure they're on the same shift.\n\nThey're both happier than they've been since they got here, and they know who to thank for it.`;
        } },
      { id: "separate", label: "Separate them",
        resolve: (s, _e, p) => {
          const edge = s.edges.filter((x) => x.from === p!.id).sort((a, b) => b.warmth - a.warmth)[0];
          const other = edge ? s.people[edge.to] : undefined;
          for (const person of [p!, other].filter(Boolean) as Person[]) {
            applyTreatment(person, { kind: "cruelty", size: 5, why: "separated from her lover" }, s.arcology.week);
            const mem = s.memory[person.id];
            if (mem) remember(mem, { content: "the owner separated her from her lover", week: s.arcology.week, importance: 8, charge: "sharp", core: true });
          }
          return `You put them on different floors and different shifts, and tell them it's over.\n\nIt isn't, of course. They still sneak off together whenever they can, and now they're both resentful and careful.`;
        } },
      { id: "use", label: "Put them to work together", note: "they perform better together, but become inseparable",
        resolve: (s, _e, p) => {
          applyTreatment(p!, { kind: "kindness", size: 2, why: "kept with her person" }, s.arcology.week);
          p!.skills.entertainment = clamp(p!.skills.entertainment + 6, 0, 100);
          return `You book them as a pair for customers who like to watch two girls who actually want each other. They're very good at it, and they earn a lot more.\n\nThey hate that what they have has become something you sell.`;
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
      return `Someone posted about ${c.person!.name} on the public boards, with photographs. ${Math.round(strong?.[1].adoption ?? 0)}% of your citizens have adopted your society's views on what a slave should look like, and she doesn't fit them.\n\nThe post has hundreds of replies. People want to know why the owner keeps a slave like that.`;
    },
    options: [
      { id: "change", label: "Change her to fit", note: "expensive, and hard on her",
        resolve: (s, _e, p) => { s.arcology.cash -= 9000; applyTreatment(p!, { kind: "cruelty", size: 5, why: "remade to suit the doctrine" }, s.arcology.week); p!.health.recovery_weeks += 2; return `You send ${p!.name} to the surgeons to have her changed to fit. It costs nine thousand, and she spends two weeks in the clinic recovering.\n\nThe posts stop. She doesn't recognize herself in the mirror.`; } },
      { id: "hide", label: "Keep her out of sight",
        resolve: (s, _e, p) => { p!.assignment = "house servant"; applyTreatment(p!, { kind: "neglect", size: 3, why: "hidden away" }, s.arcology.week); return `You reassign ${p!.name} to cleaning the back corridors, where no citizen will ever see her.\n\nThe posts stop. She knows why she was moved.`; } },
      { id: "defend", label: "Say publicly that she stays as she is", note: "costs reputation, but she'll be grateful",
        resolve: (s, _e, p) => { s.arcology.rep -= 800; applyTreatment(p!, { kind: "recognition", size: 8, why: "defended in public, at cost" }, s.arcology.week); const mem = s.memory[p!.id]; if (mem) remember(mem, { content: "you stood up in front of the whole arcology and said she stays as she is", week: s.arcology.week, importance: 10, charge: "bright", core: true }); return `You post a reply yourself, on the public boards, saying ${p!.name} stays exactly as she is. It costs you eight hundred reputation with the people who care about that sort of thing.\n\nShe hears about it within the hour, and she's deeply grateful.`; } },
    ],
  },
  {
    id: "mercenary_offer", severity: "minor", endogenous: false,
    candidates: (s) => (!s.arcology.mercenaries.hired && s.arcology.cash > 25000 ? [{}] : []),
    weight: (s) => (s.arcology.security < 40 ? 5 : 2),
    seed: () => `A mercenary company is looking for work: sixty soldiers, armed and experienced. Their captain is a scarred woman who's upfront about the price and cagey about their last job.\n\nThey'd make your arcology a lot harder to raid.`,
    options: [
      { id: "hire", label: "Take them on", note: "¤22,000 up front — under the usual rate",
        resolve: (s) => { s.arcology.cash -= 22000; s.arcology.mercenaries = { hired: true, strength: 50, loyalty: 55, upkeep: 3500 }; s.arcology.security = clamp(s.arcology.security + 18, 0, 100); return `You hire them. They move into the freight level the same day, and within a week they're running patrols and drilling on the concourse.\n\nYour citizens feel safer. Your neighbors notice.`; } },
      { id: "pass", label: "Pass", resolve: () => `You pass. The company goes east, to an arcology that could afford them.` },
    ],
  },
  {
    id: "returned", severity: "major", endogenous: true,
    candidates: (s) => (Object.values(s.people).some((p) => p.status === "free" && p.exit_note === "escaped") ? [{}] : []),
    weight: () => 6,
    seed: (s) => {
      const gone = Object.values(s.people).find((p) => p.status === "free" && p.exit_note === "escaped");
      return `${gone?.name ?? "Somebody who used to be yours"} is at the residential doors. She escaped months ago, and now she's come back on her own, thin and filthy, and she won't say why.\n\nShe's asking to be let back in.`;
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
          return `You let ${gone.name} back in. She's thinner, and she has a new scar on her arm, and she won't talk about what happened while she was gone.\n\nThe others treat her carefully. She works harder than any of them.`;
        } },
      { id: "refuse", label: "Leave her at the door",
        resolve: (s) => {
          const gone = Object.values(s.people).find((p) => p.status === "free" && p.exit_note === "escaped");
          startRumor(s, `the owner left ${gone?.name ?? "her"} standing at the door`, { salience: 7 });
          for (const p of owned(s)) p.bond.hope = clamp(p.bond.hope - 6, 0, 100);
          return `You leave her at the door. She stands there for a long time before she finally walks away.\n\nYour slaves watch the whole thing from the windows.`;
        } },
    ],
  },
  /* ── her body, her nights, and the world getting in ───────────────────────────────────────── */
  {
    id: "night_visit", severity: "minor", endogenous: true,
    candidates: (s) => owned(s).filter((p) => p.age >= 18 && read(p).devotion > 40 && p.psyche.arousal > 40 && p.health.recovery_weeks === 0).map((person) => ({ person })),
    weight: (_s, c) => 2 + c.person!.psyche.arousal / 25,
    seed: (_s, c) => `You wake in the middle of the night to find ${c.person!.name} standing at the foot of your bed, naked. She's been working up to this all week.\n\n"I couldn't sleep," she whispers. "I kept thinking about you. Can I stay?"`,
    options: [
      { id: "fuck", label: "Pull her into bed and fuck her",
        resolve: (s, _e, p) => { resolveAct(s, p!, p!.body.vagina !== null ? "vaginal" : "anal"); applyTreatment(p!, { kind: "recognition", size: 4, why: "you let her into your bed" }, s.arcology.week); return `You pull back the covers and she's on you before you've finished moving. You fuck her slowly in the dark, and she's so eager she cums almost as soon as you're inside her.\n\nAfterwards she curls up against you and falls asleep smiling. She's the happiest girl in the arcology the next morning, and everyone can tell why.`; } },
      { id: "sleep", label: "Let her sleep beside you, and nothing more",
        resolve: (s, _e, p) => { resolveAct(s, p!, "sleeping together"); return `You let her climb in and hold her until she settles. She's a little disappointed at first, then she relaxes and falls asleep against your chest.\n\nIn the morning she's shy about it, and very pleased.`; } },
      { id: "send", label: "Send her back to the dormitory",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "neglect", size: 2, why: "sent back to the dormitory in the night" }, s.arcology.week); return `You tell her to go back to bed. She goes, embarrassed, and the other girls hear her crying quietly in her bunk.\n\nShe doesn't come to your room again without being told to.`; } },
    ],
  },
  {
    id: "caught_touching", severity: "minor", endogenous: true,
    candidates: (s) => owned(s).filter((p) => p.age >= 18 && p.psyche.arousal > 65 && read(p).devotion < 40 && p.health.recovery_weeks === 0).map((person) => ({ person })),
    weight: (_s, c) => 2 + c.person!.psyche.libido / 30,
    seed: (_s, c) => `You walk into the laundry and catch ${c.person!.name} bent over a pile of clean sheets with her hand between her legs, so close to cumming that she doesn't hear you come in.\n\nWhen she finally sees you she freezes, red-faced, fingers still inside herself.`,
    options: [
      { id: "punish", label: "Punish her for touching herself without permission",
        resolve: (s, _e, p) => { resolveAct(s, p!, "discipline"); p!.psyche.arousal = clamp(p!.psyche.arousal - 30, 0, 100); return `You put her over the laundry table and spank her until she's crying, then tell her that her orgasms belong to you. She's left sore, frustrated and humiliated.\n\nShe won't be touching herself without permission again, or at least she won't be caught.`; } },
      { id: "finish", label: "Tell her to finish while you watch",
        resolve: (s, _e, p) => { resolveAct(s, p!, "orders"); p!.psyche.arousal = 10; return `You lean against the doorframe and tell her to keep going. She's mortified, but she's too far gone to stop. She finishes on the laundry table with her eyes screwed shut and her face burning, while you watch every second.\n\nShe can't meet your eye for days.`; } },
      { id: "fuck", label: "Finish her yourself",
        resolve: (s, _e, p) => { resolveAct(s, p!, p!.body.vagina !== null ? "vaginal" : "anal"); return `You pull her hand away, bend her over the sheets and fuck her yourself. She cums hard almost immediately, and keeps cumming.\n\nShe isn't sure what just happened, but she's starting to think this household has its good points.`; } },
    ],
  },
  {
    id: "too_big", severity: "minor", endogenous: true,
    candidates: (s) => owned(s).filter((p) => (p.body.balls ?? 0) >= 8 || (p.body.dick ?? 0) >= 9).map((person) => ({ person })),
    weight: () => 4,
    seed: (_s, c) => { const b = c.person!.body; return `${c.person!.name} is struggling. ${(b.balls ?? 0) >= 8 ? "Her balls are so heavy now that she has to hold them up with one hand when she walks, and they're so full she leaks cum through her clothes every few hours." : "Her cock is so big now that it gets in the way of everything: she can't sit properly, can't wear normal clothes, and it drags against her thighs when she walks."}\n\nShe's come to you, embarrassed, to ask for help.`; },
    options: [
      { id: "milk", label: "Have her milked every morning", note: "relief; she'll come to depend on it",
        resolve: (s, _e, p) => { if ((p!.body.balls ?? 0) > 0) resolveAct(s, p!, "drain her"); applyTreatment(p!, { kind: "kindness", size: 3, why: "milked every morning so she could walk" }, s.arcology.week); return `You have the dairy staff milk ${p!.name} every morning before her shift. The relief is enormous: she can walk without holding herself, and she stops leaking through her clothes.\n\nShe's come to look forward to it a little too much.`; } },
      { id: "shrink", label: "Put her on atrophiers", note: "she'll shrink back down over weeks",
        resolve: (_s, _e, p) => { const d = (p!.body.balls ?? 0) >= 8 ? "testicle atrophiers" : "penis atrophiers"; p!.health.drugs = [...p!.health.drugs.filter((x) => !/enhancement|atrophiers/.test(x)), d]; return `You take her off anything that's making her grow and put her on ${d}. It'll take weeks, but she'll shrink back to something she can live with.\n\n${p!.name} is relieved, and a little sorry to see it go.`; } },
      { id: "mock", label: "Tell her she'll get used to it",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "cruelty", size: 4, why: "told to put up with her size" }, s.arcology.week); return `You tell her she'll get used to it, and that she's a lot more interesting this way. She goes back to work, waddling.\n\nThe other slaves stare at her and whisper when she passes.`; } },
    ],
  },
  {
    id: "heat_collapse", severity: "notable", endogenous: false,
    candidates: (s) => (s.world && ["heatwave", "hot"].includes(s.world.weather.kind) ? owned(s).filter((p) => p.assignment === "whore" || p.assignment === "public servant").map((person) => ({ person })) : []),
    weight: () => 9,
    seed: (_s, c) => `${c.person!.name} collapsed on the concourse this afternoon, in the heat, in the middle of servicing a customer. Security carried her to the clinic with a dangerously high temperature.\n\nThe other girls working the streets are asking whether they have to keep working in this weather.`,
    options: [
      { id: "indoors", label: "Bring all the street girls indoors until the heat breaks", note: "less income this week",
        resolve: (s, _e, p) => { s.arcology.cash -= 2500; for (const x of owned(s).filter((q) => q.assignment === "whore" || q.assignment === "public servant")) applyTreatment(x, { kind: "kindness", size: 3, why: "brought in out of the heat" }, s.arcology.week); p!.health.health = clamp(p!.health.health + 5, -100, 100); return `You bring every girl working the streets inside until the heatwave breaks. You lose a week of street income, about twenty-five hundred.\n\n${p!.name} recovers in the clinic. The street girls are grateful, and they tell each other so.`; } },
      { id: "water", label: "Give them water and shade, and keep them working",
        resolve: (s, _e, p) => { s.arcology.cash -= 600; p!.health.health = clamp(p!.health.health - 5, -100, 100); return `You have water stations and awnings set up on the concourse. The girls keep working. It's miserable, but nobody else collapses.\n\n${p!.name} is back out there two days later.`; } },
      { id: "work", label: "Send her back out when she can stand",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "cruelty", size: 5, why: "sent back into the heat after collapsing" }, s.arcology.week); p!.health.health = clamp(p!.health.health - 12, -100, 100); return `${p!.name} is back on the concourse the next day, still dizzy. She collapses again by evening.\n\nThe other street girls watch, and work more slowly, and hate you.`; } },
    ],
  },
  {
    id: "news_from_home", severity: "notable", endogenous: false,
    candidates: (s) => (s.world && Object.values(s.world.regions).some((r) => r.state === "war" || r.state === "collapse") ? owned(s).filter((p) => p.origin.acquired_how !== "born to it" && p.economics.weeks_owned > 3).map((person) => ({ person })) : []),
    weight: () => 2,
    seed: (_s, c) => `${c.person!.name} saw the news on the dormitory screen: the fighting has reached the part of the world where her family still lives. She's been crying all day and can't work.\n\nShe's begging to be allowed to send them a message.`,
    options: [
      { id: "send", label: "Let her send a message, and pay for it to get through", note: "¤1,500",
        resolve: (s, _e, p) => { s.arcology.cash -= 1500; applyTreatment(p!, { kind: "kindness", size: 8, why: "you paid for her message to reach her family" }, s.arcology.week); p!.bond.hope = clamp(p!.bond.hope + 15, 0, 100); return `You pay a courier service fifteen hundred to get her message through the lines. A week later a reply comes back: her mother and sister are alive, and heading for the coast.\n\n${p!.name} reads it over and over. She's yours in a way she wasn't before.`; } },
      { id: "comfort", label: "Sit with her while she cries",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 4, why: "comforted when the news came" }, s.arcology.week); return `You sit with ${p!.name} while she cries it out. There's nothing you can do about the war, and she knows it, but she wasn't alone.\n\nShe's back at work two days later.`; } },
      { id: "work", label: "Tell her to get back to work",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "cruelty", size: 5, why: "told to work while her family was in danger" }, s.arcology.week); p!.psyche.relaxation = clamp(p!.psyche.relaxation - 1.5, -10, 10); return `You tell her that her family is none of your concern and that she has work to do. She goes back to work, red-eyed and silent.\n\nShe never mentions them to you again.`; } },
    ],
  },
  {
    id: "citizen_wants_her", severity: "minor", endogenous: false,
    candidates: (s) => owned(s).filter((p) => p.age >= 18 && p.body.face > 60 && p.assignment !== "please you" && p.health.recovery_weeks === 0).map((person) => ({ person })),
    weight: (s) => (s.arcology.prosperity > 60 ? 3 : 1),
    seed: (_s, c) => `A wealthy citizen from the upper residential floors has been watching ${c.person!.name} for weeks, and has finally sent a formal offer: he'd like her for a whole weekend at his apartment, and he's willing to pay very well for it.\n\n${c.person!.name} has heard about the offer, and is waiting to hear what you'll say.`,
    options: [
      { id: "yes", label: "Rent her out for the weekend", note: "+¤4,000",
        resolve: (s, _e, p) => { s.arcology.cash += 4000; resolveAct(s, p!, p!.body.vagina !== null ? "vaginal" : "anal"); p!.health.energy = clamp(p!.health.energy - 25, 0, 100); return `${p!.name} spends the weekend in the citizen's apartment. She comes back on Monday exhausted, with a bruise on her hip and a new dress he bought her. He pays four thousand without complaint and asks when he can book her again.`; } },
      { id: "no", label: "Tell him she isn't available",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "recognition", size: 3, why: "you refused to rent her out" }, s.arcology.week); s.arcology.rep = Math.max(0, s.arcology.rep - 50); return `You tell him ${p!.name} isn't for rent. He's offended; he's used to getting what he pays for.\n\n${p!.name} hears that you refused, and she's quietly grateful.`; } },
      { id: "sell", label: "Sell her to him outright", note: "+¤9,000",
        resolve: (s, _e, p) => { p!.status = "sold"; p!.exit_week = s.arcology.week; p!.exit_note = "sold to a citizen who wanted her"; s.arcology.cash += 9000; for (const f of Object.values(s.arcology.facilities)) { f.workers = f.workers.filter((w) => w !== p!.id); if (f.manager === p!.id) f.manager = undefined; } p!.facility = undefined; return `You offer to sell her instead, and he pays nine thousand on the spot. ${p!.name} packs her few things and goes upstairs to live in his apartment. She waves to the other girls from the elevator.`; } },
    ],
  },
  {
    id: "storm_shelter", severity: "notable", endogenous: false,
    candidates: (s) => (s.world && ["storm", "superstorm"].includes(s.world.weather.kind) ? [{}] : []),
    weight: () => 6,
    seed: () => `The storm has knocked out power to the lower residential blocks. Families are huddled in the dark with no heat and no water pumps, and a crowd has gathered at the doors to the spire, asking to be let in until the power's back.\n\nYour security chief says the spire's generators could run the lower blocks too, if you're willing to pay for the fuel.`,
    options: [
      { id: "fuel", label: "Run the generators for the lower blocks", note: "¤3,000",
        resolve: (s) => { s.arcology.cash -= 3000; s.arcology.public_standing = clamp(s.arcology.public_standing + 1, -10, 10); s.arcology.rep += 150; return `You pay for the fuel and switch the lower blocks onto the spire's generators. The lights come back on within the hour, and the crowd at the doors goes home.\n\nThe lower blocks remember who kept their lights on.`; } },
      { id: "open", label: "Open the spire's atrium to them",
        resolve: (s) => { s.arcology.cash -= 800; s.arcology.public_standing = clamp(s.arcology.public_standing + 2, -10, 10); s.arcology.crime = clamp(s.arcology.crime + 2, 0, 100); return `You open the atrium. Several hundred people camp on your marble floors overnight, with their children and their dogs. Some things go missing, but nobody freezes, and the story spreads through the whole arcology.`; } },
      { id: "shut", label: "Keep the doors shut",
        resolve: (s) => { s.arcology.public_standing = clamp(s.arcology.public_standing - 2, -10, 10); s.arcology.crime = clamp(s.arcology.crime + 3, 0, 100); return `You keep the doors shut. The crowd stays outside in the dark for hours before it breaks up. The power comes back two days later.\n\nNobody in the lower blocks is going to forget that night.`; } },
    ],
  },
  {
    id: "crawling", severity: "minor", endogenous: true,
    candidates: (s) => owned(s).filter((p) => p.body.feet?.heels_clipped).map((person) => ({ person })),
    weight: () => 3,
    seed: (_s, c) => `${c.person!.name}'s heels broke this morning, and with her tendons clipped she can't stand without them. She's been crawling around the penthouse on her hands and knees all day, doing her chores that way, with her ass in the air.\n\nThe other slaves are trying not to stare.`,
    options: [
      { id: "new", label: "Buy her a new pair of heels", note: "¤300",
        resolve: (s, _e, p) => { s.arcology.cash -= 300; applyTreatment(p!, { kind: "kindness", size: 3, why: "given new heels so she could stand" }, s.arcology.week); return `You have a new pair of heels sent up. ${p!.name} puts them on right there on the floor, gets unsteadily to her feet, and thanks you.`; } },
      { id: "leave", label: "Leave her crawling for the week",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "coercion", size: 4, why: "left to crawl for a week" }, s.arcology.week); return `You tell her she can crawl until the end of the week. She spends five days on her hands and knees, knees raw, while the rest of the household steps around her.\n\nShe'll be very careful with her next pair of heels.`; } },
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

  // The same thing does not happen twice in a row. A kind that is still waiting on you, or fired in
  // the last six weeks, sits out; a person-specific one sits out only for that person.
  const recent = (s.event_log ??= {});
  const waiting = new Set(s.events.map((e) => e.kind));
  for (const def of EVENTS) {
    if (!def.endogenous && s.models.tension === 0) continue;
    if (waiting.has(def.id)) continue;
    for (const c of def.candidates(s)) {
      const key = c.person ? `${def.id}:${c.person.id}` : def.id;
      if (s.arcology.week - (recent[key] ?? -99) < 6) continue;
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
    recent[choice.c.person ? `${choice.def.id}:${choice.c.person.id}` : choice.def.id] = s.arcology.week;
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
