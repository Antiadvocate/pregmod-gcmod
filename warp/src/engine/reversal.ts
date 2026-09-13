/**
 * SUPPLICATIONISM — the machinery.
 *
 * The chain in data/reversal.ts is the spine. This is what it moves.
 *
 * `deference` is the one number: how far you have actually gone in public, 0–100. It is bought by
 * doing the things where people can see, and it slides back if you spend a month behaving like an
 * ordinary owner, because the arcology takes its cue from the most recent thing it watched you do.
 *
 * Two things make this worth playing rather than reading. The first is that the household reacts
 * per person, out of what each woman already is — handing power to a submissive is a cruelty and
 * handing it to a sadist is a mistake, and the engine already knows which is which. The second is
 * that the endgame at week 69 is scored on the household rather than on your guns: when the
 * Association comes to take the building back, the question is who inside it agrees with them.
 */
import type { Person, ReportLine, SaveState } from "./types";
import { CHAIN, SUPPLICATIONISM, type ChainEvent } from "../data/reversal";
import { DOCTRINE_BY_ID, conflictsWith } from "../data/doctrines";
import { clamp, shove, addState } from "./psyche";
import { read, applyTreatment } from "./obedience";
import { remember } from "./memory";
import { startRumor } from "./social";
import { romanceOf, shiftDominion, rungIndex } from "./romance";

export interface ReversalState {
  /** 0–100: how far the arcology has watched you go. */
  deference: number;
  /** Chain event ids already resolved. */
  done: string[];
  /** The event waiting on an answer. */
  pending?: string;
  /** Who the chain is following. */
  subject?: string;
  /** −100 … +100 standing with the Owners' Association. Starts neutral, only ever falls on this road. */
  association: number;
  /** Citizens paying for the privilege. The economy tilts once this opens. */
  fees_open: boolean;
  /** Weeks the port has been slow. */
  embargo: number;
  /** The last week you took one of the small public steps between the fixed beats. */
  last_gesture?: number;
  /** The last week you did something where people could see. The arcology takes its cue from the
   *  most recent thing it watched, so this is what the slide is measured from. */
  last_public?: number;
  /** How it finished. */
  ended?: "held" | "sold" | "broken" | "fled";
}

export function reversalOf(s: SaveState): ReversalState {
  if (!s.reversal) {
    s.reversal = { deference: 0, done: [], association: 0, fees_open: false, embargo: 0 };
  }
  return s.reversal;
}

/** The woman the chain follows: furthest up the ladder, then most standing, then longest held. */
export function subjectOf(s: SaveState): Person | undefined {
  const rev = reversalOf(s);
  const named = rev.subject ? s.people[rev.subject] : undefined;
  if (named && (named.status === "owned" || named.status === "indentured" || named.status === "free")) return named;
  const pool = Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured") && p.age >= 18);
  if (!pool.length) return undefined;
  const best = pool.sort((a, b) =>
    (rungIndex(romanceOf(b).standing) - rungIndex(romanceOf(a).standing)) ||
    (romanceOf(b).dominion - romanceOf(a).dominion) ||
    (b.economics.weeks_owned - a.economics.weeks_owned))[0];
  rev.subject = best.id;
  return best;
}

/* ── how the household takes it ──────────────────────────────────────────────────────────────
 * The part that makes this a game rather than a slideshow. Each woman answers out of what she
 * already is: her fetish, her conscience, her attachment, and what she is carrying about you. */

export interface Reaction { id: string; line: string; tone: ReportLine["tone"] }

export function reactTo(s: SaveState, size: number, publicly: boolean): Reaction[] {
  const out: Reaction[] = [];
  const week = s.arcology.week;
  for (const p of Object.values(s.people)) {
    if (p.status !== "owned" && p.status !== "indentured") continue;
    if (p.age < 18) continue;
    const r = read(p, s.memory[p.id]);
    const fetish = (name: string) => p.persona.fetishes?.find((f) => f.name === name);
    const dom = fetish("dom"), sub = fetish("submissive"), sadist = fetish("sadist"), maso = fetish("masochist");

    if (p.psyche.state === "broken") {
      shove(p.psyche, -0.2);
      out.push({ id: p.id, tone: "bad", line: `${p.name} is told what is changing and says it sounds sensible. She would have said the same thing if you had told her the opposite, because there is nobody in there to disagree with you.` });
      continue;
    }

    if (dom && dom.strength > 50) {
      shove(p.psyche, size * 0.25, { hard: true });
      applyTreatment(p, { kind: "recognition", size: Math.min(8, size), why: "given room to be what she is" }, week);
      shiftDominion(s, p, size * 0.8, "the household changed shape around her");
      out.push({ id: p.id, tone: "good", line: `${p.name} takes to it straight away and does not look remotely surprised, and you get the distinct impression she has been waiting for somebody to work it out.` });
    } else if (sub && sub.strength > 50) {
      // Being handed power she does not want is a real injury, and the engine should not pretend
      // otherwise just because the direction of travel looks generous.
      shove(p.psyche, -size * 0.3, { hard: true });
      p.bond.hope = clamp(p.bond.hope - size, 0, 100);
      addState(p.psyche, "being asked to decide things", week);
      out.push({ id: p.id, tone: "bad", line: `${p.name} spends the whole day trying to work out what she is meant to do now that nobody is telling her, and she does not eat anything.` });
    } else if (sadist && sadist.strength > 45 && p.persona.conscience < 0.4) {
      shiftDominion(s, p, size, "she was handed something");
      out.push({ id: p.id, tone: "warning", line: `${p.name} understood the new arrangement before anybody else had finished hearing it, and she has already started finding out where its edges are.` });
    } else if (maso && maso.strength > 50) {
      out.push({ id: p.id, tone: "neutral", line: `${p.name} cannot get the new arrangement to sit right in her head, so she keeps working it through from the beginning and keeps arriving somewhere you did not intend.` });
    } else if (p.persona.conscience > 0.7) {
      applyTreatment(p, { kind: "kindness", size: Math.min(5, size * 0.6), why: "the household changed" }, week);
      out.push({ id: p.id, tone: "good", line: `${p.name} is careful with it. She checks twice that she is allowed before she does anything, because she would much rather ask than get it wrong.` });
    } else if (p.bond.resentment > 55) {
      // Forty weeks of fear, and then you hand them a lever.
      shiftDominion(s, p, size * 1.2, "she has been waiting for exactly this");
      p.bond.resentment = clamp(p.bond.resentment - size * 0.4, 0, 100);
      out.push({ id: p.id, tone: "warning", line: `${p.name} takes what she is given without saying thank you for it. She has a lot of unfinished business with this house, and you have just handed her somewhere to put it.` });
    } else if (r.fragility > 0.7) {
      out.push({ id: p.id, tone: "neutral", line: `${p.name} has decided this is a test she is being set, so she is carrying on exactly as before and waiting to be told she got it wrong.` });
    } else if (publicly) {
      p.bond.hope = clamp(p.bond.hope + size * 0.5, 0, 100);
      out.push({ id: p.id, tone: "good", line: `${p.name} heard about it from somebody on the concourse before you got round to telling her, and she is not pleased about the order those happened in.` });
    }
  }
  return out.slice(0, 6);
}

/* ── the small steps between the beats ───────────────────────────────────────────────────────
 * The fixed chain fires every four to six weeks and gates on deference, which leaves a player who
 * answered cautiously stuck below the next gate with nothing to do about it. These are the things
 * you can do any week: small, cheap in money and expensive in standing, and the only way to climb
 * back out of a month of behaving like an ordinary owner. */

export interface Gesture { id: string; label: string; note: string; gain: number; rep: number; }

export const GESTURES: Gesture[] = [
  { id: "house", label: "Wait on her at the table, at home", note: "the household sees it and nobody outside does", gain: 1, rep: 0 },
  { id: "concourse", label: "Carry for her on the commercial level", note: "shift change, four hundred people", gain: 2, rep: -70 },
  { id: "club", label: "Kneel to her at the club", note: "in front of the ones whose opinion is worth money", gain: 3, rep: -220 },
];

export function gestureAvailable(s: SaveState): boolean {
  const rev = reversalOf(s);
  return !rev.ended && rev.last_gesture !== s.arcology.week && !!subjectOf(s);
}

export function doGesture(s: SaveState, id: string): { line: string; reactions: Reaction[] } {
  const rev = reversalOf(s);
  const g = GESTURES.find((x) => x.id === id);
  const her = subjectOf(s);
  if (!g || !her || !gestureAvailable(s)) return { line: "", reactions: [] };
  const week = s.arcology.week;

  rev.last_gesture = week;
  rev.deference = clamp(rev.deference + g.gain, 0, 100);
  s.arcology.rep = Math.max(0, s.arcology.rep + g.rep);
  if (g.rep) { rev.last_public = week; rev.association = clamp(rev.association - g.gain * 1.5, -100, 100); }
  applyTreatment(her, { kind: "recognition", size: g.gain * 1.5, why: g.note }, week);
  shiftDominion(s, her, g.gain * 1.2, g.label.toLowerCase());

  let line: string;
  switch (id) {
    case "house":
      line = `${her.name} let you do it without making anything of it, and she ate, and at the end she said the soup had been too salty.`;
      break;
    case "concourse":
      startRumor(s, `he carries for ${her.name} on the commercial level and does not hurry about it`, { salience: 6 });
      line = `Two people you do business with watched the whole thing from the gallery, and one of them nodded to you on his way past.`;
      break;
    default:
      startRumor(s, `he went down on one knee to ${her.name} at the club, in the main room`, { salience: 9 });
      line = `Nobody stopped talking, but the conversation went careful and even, and for the rest of the evening people watched you without ever quite looking at you.`;
  }
  const reactions = reactTo(s, g.gain, g.rep !== 0);
  note(s, line, "good");
  for (const rx of reactions) note(s, rx.line, rx.tone === "bad" ? "danger" : rx.tone === "good" ? "good" : "info", rx.id);
  return { line, reactions };
}

/* ── the chain ───────────────────────────────────────────────────────────────────────────── */

export function nextEvent(s: SaveState): ChainEvent | undefined {
  const rev = reversalOf(s);
  if (rev.ended) return undefined;
  if (rev.pending) return CHAIN.find((e) => e.id === rev.pending);
  for (const e of CHAIN) {
    if (rev.done.includes(e.id)) continue;
    if (s.arcology.week < e.week) continue;
    if ((e.needs_deference ?? 0) > rev.deference) continue;
    return e;
  }
  return undefined;
}

/** Called by the week: offer the next beat if one is due. */
export function tickReversal(s: SaveState): ReportLine[] {
  const rev = reversalOf(s);
  const lines: ReportLine[] = [];
  if (rev.ended) return lines;

  // Standing with the trade only ever falls on this road, and it falls faster the further you go.
  if (rev.deference > 20) {
    rev.association = clamp(rev.association - rev.deference / 40, -100, 100);
    if (rev.association < -50 && s.arcology.week % 4 === 0) {
      s.arcology.rep = Math.max(0, s.arcology.rep - Math.round(rev.deference * 2));
      lines.push({ tone: "bad", weight: 6, text: `Two more of the old families have stopped returning your steward's calls.` });
    }
  }

  // Nothing done in public for a month and the arcology quietly reverts to what it assumes.
  const idle = s.arcology.week - (rev.last_public ?? 0);
  if (idle > 4 && rev.deference > 0) {
    rev.deference = clamp(rev.deference - 1, 0, 100);
    if (idle === 9) lines.push({ tone: "warning", weight: 7, text: `You have gone two months without doing anything where people could see it, so the concourse has quietly gone back to assuming the ordinary arrangement.` });
  }

  // The fees, once open, are the whole economy. Two things set the number: how many of them have
  // enough standing that a citizen would pay to be under one of them, and how public the whole
  // arrangement is — a man pays for the evening, but what he is actually buying is being seen
  // to have had it, and that is priced in deference.
  if (rev.fees_open) {
    const household = Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");
    const standing = household.filter((p) => romanceOf(p).dominion > -50).length;
    const take = Math.round((standing * 1400 + household.length * 260)
      * clamp(rev.deference / 50, 0.3, 2.2)
      * clamp(s.arcology.prosperity / 60, 0.4, 2));
    if (take > 0) {
      s.arcology.cash += take;
      lines.push({
        tone: "good", weight: 5,
        text: standing
          ? `Service fees: ¤${take.toLocaleString()} across ${standing} standing arrangements and the rest of the house. There are more citizens on the waiting list than there are evenings to give them.`
          : `Service fees: ¤${take.toLocaleString()}. Nobody in the house has real standing yet and the citizens are paying anyway, because what they are actually buying is being seen to have paid.`,
      });
    }
  }

  if (rev.embargo > 0) {
    const cost = 1800 + rev.embargo * 400;
    s.arcology.cash -= cost;
    rev.embargo++;
    lines.push({ tone: "bad", weight: 6, text: `The port is still slow, and it cost ¤${cost.toLocaleString()} this week in delays and in assurances to people who did not believe them.` });
  }

  // The doctrine is not something you buy on the Doctrine screen. It is adopted at the rate the
  // arcology has actually watched you live, which is the whole point of the deference number.
  if (rev.deference > 0) {
    if (!s.arcology.doctrines[SUPPLICATIONISM.id]) {
      // It arrives by displacement rather than by vote: the doctrines it cannot sit beside go,
      // and if the arcology is already holding four, the newest of them is the one that gives way.
      for (const c of conflictsWith(SUPPLICATIONISM.id)) {
        if (s.arcology.doctrines[c]) {
          delete s.arcology.doctrines[c];
          lines.push({ tone: "warning", weight: 8, text: `${DOCTRINE_BY_ID[c].noun} cannot be held next to what you have been doing in public, so the arcology has quietly stopped holding it.` });
        }
      }
      const held = Object.entries(s.arcology.doctrines);
      if (held.length >= 4) {
        const newest = held.sort((a, b) => b[1].adopted_week - a[1].adopted_week)[0];
        delete s.arcology.doctrines[newest[0]];
        lines.push({ tone: "warning", weight: 7, text: `${DOCTRINE_BY_ID[newest[0]]?.noun ?? newest[0]} has been crowded out, because an arcology will carry about four ideas about itself at once and no more.` });
      }
      lines.push({ tone: "warning", weight: 10, text: `Somebody at the exchange called ${s.arcology.name} Supplicationist and did not mean it kindly, but the word has stuck to the place anyway.` });
    }
    const doc = (s.arcology.doctrines[SUPPLICATIONISM.id] ??= {
      adoption: 0, decoration: 0, research: true, policies: {}, adopted_week: s.arcology.week,
    });
    doc.research = true;
    doc.adoption = clamp(Math.max(doc.adoption, rev.deference), 0, 100);
    if (rev.fees_open) doc.policies.service_fees = 1;
  }

  const next = nextEvent(s);
  if (next && !rev.pending) {
    rev.pending = next.id;
    lines.push({ tone: "warning", weight: 11, text: next.title });
  }
  return lines;
}

/** Answer the beat. Returns what happened, plus how the household took it. */
export function resolveChain(s: SaveState, optionId: string): { line: string; reactions: Reaction[] } {
  const rev = reversalOf(s);
  // Fall back to whatever is currently offered. tickReversal normally stamps `pending` at the end
  // of the week, but a save from before the chain existed arrives mid-campaign with a beat already
  // due and nothing stamped, and the button underneath it has to work.
  const event = (rev.pending ? CHAIN.find((e) => e.id === rev.pending) : undefined) ?? nextEvent(s);
  if (!event) return { line: "", reactions: [] };
  const her = subjectOf(s);
  const week = s.arcology.week;
  let line = "";
  let gain = 0;
  let publicly = false;

  const bump = (n: number) => { gain = n; rev.deference = clamp(rev.deference + n, 0, 100); };

  switch (`${event.id}:${optionId}`) {
    case "first_time:hold":
      bump(6);
      if (her) { applyTreatment(her, { kind: "recognition", size: 7, why: "he stayed down until she spoke" }, week); shiftDominion(s, her, 12, "the first night"); }
      line = "It took her about four minutes to say anything at all, and when she did she told you to get up, because it had not occurred to her yet that she could tell you to stay.";
      break;
    case "first_time:explain":
      bump(3);
      if (her) shiftDominion(s, her, 5, "he explained it");
      line = "You explained it to her twice. She said she understood, and she probably did, but understanding it was not the thing you were asking her for.";
      break;
    case "first_time:up":
      bump(0);
      if (her) { const m = s.memory[her.id]; if (m) remember(m, { content: "the night he knelt and then pretended he had not", week, importance: 7, charge: "sharp" }); }
      line = "You both went back to behaving as you had before, and she has not raised it once, though she has not forgotten it either.";
      break;

    case "household_sees:louder":
      bump(9); publicly = true;
      startRumor(s, "he kneels to her, and he does not care who sees", { salience: 8 });
      line = "Three of them were in the room for it, so by breakfast the other six had heard a version, and the version going round is close enough to what happened.";
      break;
    case "household_sees:quiet": bump(1); line = "You kept the door shut, so for the moment it is still a thing between the two of you."; break;
    case "household_sees:ask":
      bump(7);
      if (her) { shiftDominion(s, her, 10, "he asked her to decide"); applyTreatment(her, { kind: "recognition", size: 6, why: "asked to decide who watches" }, week); }
      line = "She took a day to think it over before she said yes, and she made a point of saying it out loud rather than nodding, because she wanted it on the record as her decision.";
      break;

    case "the_name:formal":
      bump(10); publicly = true;
      if (her) { s.canon.push(`${her.name} is named on every instrument of the household as its principal.`); }
      line = "Her name went on the register, the rota and the accounts inside a week, and the steward has stopped asking whether you are sure about it.";
      break;
    case "the_name:verbal": bump(4); line = "Everyone says it aloud and nobody writes it down, so the steward keeps putting the old name on the paperwork and you keep having to send it back."; break;
    case "the_name:revert": bump(-6); line = "The steward corrected it back without remarking on it, and by the end of the week nobody was using the new one."; break;

    case "first_outing:slow":
      bump(12); publicly = true;
      s.arcology.rep -= 300;
      startRumor(s, "he carried her bag through the concourse at shift change", { salience: 9 });
      line = "You took the long way round the commercial level at shift change, which is about four hundred people, and you carried her bag the entire way.";
      break;
    case "first_outing:brisk": bump(6); publicly = true; s.arcology.rep -= 120; line = "You went quickly and kept your head down, but there were enough people about that it got around by the evening anyway."; break;
    case "first_outing:abort": bump(-4); line = "You got as far as the lifts and turned round, and one of Eiger's people happened to be standing there when you did it."; break;

    case "broker_refuses:pay": s.arcology.cash -= 20000; bump(2); line = "Twenty thousand bought you an apology from Halvorsen, though he took three days to send it and had a clerk write it."; break;
    case "broker_refuses:replace": bump(4); rev.association -= 8; line = "You moved the business over to the shark instead. His people cost half again as much and they have never once asked what anything is for."; break;
    case "broker_refuses:public":
      bump(8); rev.association -= 20; s.arcology.rep -= 400;
      startRumor(s, "he printed Halvorsen's letter with the name still on it", { salience: 8 });
      line = "You printed Halvorsen's letter on the public boards with his name still on it, so everyone at the exchange has now read what he thinks of you.";
      break;

    case "the_dinner:serve":
      bump(14); publicly = true; rev.association -= 25; s.arcology.rep -= 600;
      if (her) { applyTreatment(her, { kind: "recognition", size: 9, why: "served at Eiger's table, in front of all of them" }, week); shiftDominion(s, her, 15, "Eiger's table"); }
      line = "You served her plate yourself at Eiger's table in front of about thirty people, and Eiger's wife has been telling the story to anyone who will sit still for it.";
      break;
    case "the_dinner:normal": bump(2); line = "You behaved like an ordinary guest all evening, and Eiger was so relieved about it that he kept refilling your glass without being asked."; break;
    case "the_dinner:leave": bump(0); line = "You made an excuse and left before the meat came out, and Eiger is not stupid enough to have missed what that was."; break;

    case "first_fee:take":
      rev.fees_open = true; bump(11); s.arcology.cash += 9000;
      line = "Nine thousand for the one evening, and the man has already written to the steward to ask when she is free again.";
      break;
    case "first_fee:free":
      bump(14); publicly = true;
      line = "You let him have the evening and then refused his money, and he stood about in the hall for a while afterwards because he could not work out what he was supposed to do instead.";
      break;
    case "first_fee:refuse": bump(-2); line = "He was put out about it, and he is the sort who tells people, so you will be hearing about this again."; break;

    case "the_register:file":
      bump(16); publicly = true; rev.association -= 30;
      if (her) { s.canon.push(`${her.name} holds title over the owner of ${s.arcology.name}, and he holds title over her. Both instruments are filed.`); }
      line = "The clerk filed it at twenty to four, with both names on the instrument in the same size type.";
      break;
    case "the_register:onesided":
      bump(20); publicly = true; rev.association -= 40;
      if (her) {
        // The full handover, on the same rails as the collar rite — status, standing and reach —
        // because a woman who is free and running nothing is a person the week forgets about.
        const rom = romanceOf(her);
        rom.standing = "keeper";
        rom.dominion = 100;
        her.status = "free";
        s.player.owned_by = her.id;
        s.canon.push(`${her.name} holds title over the owner of ${s.arcology.name}. He holds nothing over her, and the clerk filed it that way.`);
        startRumor(s, `he filed one instrument instead of two and it was hers`, { about: her.id, salience: 10 });
        const m = s.memory[her.id];
        if (m) remember(m, { content: "the afternoon he signed away the half of it that was his", week, importance: 10, charge: "bright", core: true });
        shove(her.psyche, 3, { hard: true });
      }
      line = "One instrument instead of two, and the one that got filed was hers over you. The clerk asked twice whether you understood what that meant, because he is obliged to ask, and both times you told him you did.";
      break;
    case "the_register:withdraw": bump(-10); line = "You withdrew the filing before it went through, and the clerk took the papers back without asking you why."; break;

    case "household_splits:both": bump(10); line = "Each of them got the thing she had actually asked for, which in one case meant getting nothing at all, because nothing was what she had asked for."; break;
    case "household_splits:level": bump(8); line = "You raised them both onto the same footing, and the second one has not spoken to you since, because being levelled up alongside somebody else was not what she was after."; break;
    case "household_splits:hold": bump(0); line = "You put it off. Neither of them has asked again, and both of them have taken the delay as your answer."; break;

    case "censure:attend":
      bump(12); publicly = true; rev.association -= 25; s.arcology.rep -= 800;
      line = "You went to the spring session and said it out loud in front of nine of them.";
      break;
    case "censure:ignore": rev.association -= 15; bump(3); line = "No reply. They noted that too."; break;
    case "censure:recant":
      rev.deference = clamp(rev.deference - 35, 0, 100); rev.association += 40; rev.fees_open = false;
      line = "You gave them what they wanted. Your household watched you do it.";
      break;

    case "waiting_list:raise": s.arcology.cash += 30000; bump(6); line = "You tripled it again. The list got longer."; break;
    case "waiting_list:vet": bump(9); line = "You read all thirty-one yourself. Two of them were Association members."; break;
    case "waiting_list:open": s.arcology.cash += 15000; bump(4); s.arcology.crime += 6; line = "Anyone who can pay. It is a great deal of money and some of it is filthy."; break;

    case "abuse:cover": s.arcology.cash -= 25000; bump(0); line = "It went away. Everybody in the clinic knows it went away."; break;
    case "abuse:confront": bump(4); line = "You took it up with her. She listened, and did not agree, and that is now a thing that can happen."; break;
    case "abuse:strip":
      bump(-14); publicly = true;
      line = "You took it back in front of the household. Every woman in the building did the arithmetic.";
      break;

    case "embargo:absorb": rev.embargo = 1; bump(5); line = "You are paying the difference every week."; break;
    case "embargo:allies": bump(10); rev.association -= 10; s.arcology.prosperity += 6; line = "There are more of them than you thought. Two other arcologies want to talk."; break;
    case "embargo:fold": rev.deference = clamp(rev.deference - 20, 0, 100); rev.association += 25; line = "Word was sent that you would moderate."; break;

    case "the_offer:refuse": bump(8); rev.association -= 20; line = "Refused. Eiger thanked you for your time."; break;
    case "the_offer:sell": rev.ended = "sold"; line = "You took it. The household was dispersed within the fortnight."; break;
    case "the_offer:counter": bump(12); rev.association -= 30; line = "You offered him a place on the list. He came a long way to ask about her."; break;

    case "the_move:stand": case "the_move:her": {
      rev.done.push(event.id); delete rev.pending;
      const out = endgame(s, optionId === "her" ? "her" : "stand");
      note(s, out, rev.ended === "broken" ? "danger" : "good");
      return { line: out, reactions: [] };
    }
    case "the_move:run": {
      rev.done.push(event.id); delete rev.pending; rev.ended = "fled";
      const out = "You got out with what you could carry, which was less than you thought and did not include most of them.";
      note(s, out, "danger");
      return { line: out, reactions: [] };
    }

    default: line = "";
  }

  rev.done.push(event.id);
  delete rev.pending;
  if (publicly || gain >= 6) rev.last_public = week;
  const reactions = gain !== 0 ? reactTo(s, Math.abs(gain) * 0.6, publicly) : [];
  note(s, line, gain < 0 ? "warning" : "good");
  for (const rx of reactions) note(s, rx.line, rx.tone === "bad" ? "danger" : rx.tone === "good" ? "good" : "info", rx.id);
  return { line, reactions };
}

let seq = 0;
function note(s: SaveState, text: string, kind: "info" | "warning" | "danger" | "good", person?: string): void {
  if (!text) return;
  s.notifications.push({ id: `rev-${s.arcology.week}-${seq++}`, week: s.arcology.week, text, kind, person, seen: false });
}

/**
 * THE ENDING, SCORED ON THE HOUSEHOLD.
 *
 * The original checks whether you bought enough mercenaries. This checks who is standing in the
 * building when the lifts stop, and it counts each of them by what is actually holding her: a
 * woman kept by the bond stands, a woman kept by fear does not, and a woman carrying more
 * resentment than hope is a reason the doors open from the inside.
 */
export function endgame(s: SaveState, how: "stand" | "her"): string {
  const rev = reversalOf(s);
  const household = Object.values(s.people).filter((p) => (p.status === "owned" || p.status === "indentured" || p.status === "free") && p.age >= 18);
  let forYou = 0, against = 0;
  for (const p of household) {
    const r = read(p, s.memory[p.id]);
    const stands = (p.bond.bond * 0.7) + (p.bond.hope * 0.4) + (romanceOf(p).dominion * 0.3) - (p.bond.fear * 0.8) - (p.bond.resentment * 0.6);
    if (stands > 15) forYou++;
    else if (stands < -15) against++;
  }
  const guns = (s.arcology.mercenaries.hired ? 2 : 0) + s.arcology.security / 40;
  const score = forYou * 2 - against * 2 + guns + rev.deference / 20 + (how === "her" ? 3 : 0);

  if (score >= 8) {
    rev.ended = "held";
    s.canon.push(`${s.arcology.name} held. The Association's move failed from inside the building.`);
    return `Nobody opened anything. ${forYou} of them put themselves between the freight doors and the men who came through them, and ${against ? `${against} did not, and everybody knows which` : "not one of them stood aside"}. By Thursday the lifts answer again and two other arcologies have written asking how it was done.`;
  }
  if (score >= 0) {
    rev.ended = "held";
    return `It holds, barely. ${forYou} stood and ${against} went quiet in a way that was its own answer. The building is yours on Friday morning and there are four fewer people in it.`;
  }
  rev.ended = "broken";
  s.canon.push(`The Association took ${s.arcology.name} back. The instruments were voided.`);
  return `The doors opened from the inside. ${against} of them had been waiting a long time for somebody to ask, and the Association only had to ask once. The instruments are void by Monday and everything on the register goes back the way it was.`;
}

export const DOCTRINE = SUPPLICATIONISM;
