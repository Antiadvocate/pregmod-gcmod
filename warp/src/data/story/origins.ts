/**
 * WHO YOU WERE BEFORE THE BUILDING.
 *
 * Six ways to have come by an arcology. Each sets up the opening position — money, skills, who is
 * already in the house — and each brings its own arc: people from your past with a claim on your
 * future. Writing rules: second person, present tense, things you can see and hear, people who
 * talk like people. No summarising what a scene means.
 */
import type { SaveState, Person } from "../../engine/types";
import type { ArcDef, Ctx } from "../../engine/story";
import { mostResentful, closest, mostValuable, ownedAdults } from "../../engine/story";
import { valuePerson } from "../../engine/economy";
import { read } from "../../engine/obedience";
import { resolveAct } from "../../engine/intimacy";
import type { Rng } from "../../engine/rng";
import { generatePerson } from "../../engine/generate";
import { newMemory } from "../../engine/memory";

export interface Origin {
  id: string;
  name: string;
  /** One line on the card. */
  pitch: string;
  /** What you start with, said plainly. */
  start: string;
  setup: (s: SaveState, r: Rng) => void;
}

const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;
const cash = (n: number) => (c: Ctx) => (c.s.arcology.cash >= n ? null : `needs ${money(n)}`);
const skill = (id: string, n: number) => (c: Ctx) => (c.skill(id) >= n ? null : `needs ${id} ${n}`);

export const ORIGINS: Origin[] = [
  {
    id: "heir",
    name: "The Heir",
    pitch: "Your father built it. He died owing more than it's worth.",
    start: "Average money, a big debt to a man who knew your father, and his head girl, who knew him better than you did.",
    setup: (s) => {
      s.arcology.cash = 55000;
      s.arcology.rep = 900;
      s.player.skills = { trading: 30, hacking: 15, slaving: 20, engineering: 20, medicine: 10 };
    },
  },
  {
    id: "raider",
    name: "The Raider",
    pitch: "You took it with sixty men and a cargo ship. The last owner got away.",
    start: "Little money, a mercenary company that expects to be paid, strong security, and the old owner's household, who hate you.",
    setup: (s) => {
      s.arcology.cash = 32000;
      s.arcology.rep = 300;
      s.arcology.security = 72;
      s.arcology.mercenaries = { hired: true, strength: 40, loyalty: 55, upkeep: 2200 };
      s.player.skills = { trading: 15, hacking: 20, slaving: 30, engineering: 15, medicine: 20 };
      for (const p of ownedAdults(s)) { p.bond.resentment = Math.max(p.bond.resentment, 45); p.bond.fear = Math.max(p.bond.fear, 35); p.origin.acquired_how = "came with the building when you took it"; }
    },
  },
  {
    id: "climber",
    name: "The Climber",
    pitch: "Nine years ago you were on a block in a market like the one downstairs.",
    start: "Modest money and a household that trusts you faster, because you've been where they are. Someone from those years still has your papers.",
    setup: (s) => {
      s.arcology.cash = 45000;
      s.arcology.rep = 150;
      s.player.skills = { trading: 30, hacking: 20, slaving: 45, engineering: 10, medicine: 15 };
      for (const p of ownedAdults(s)) { p.bond.hope += 15; p.bond.bond += 10; }
    },
  },
  {
    id: "broker",
    name: "The Broker",
    pitch: "Twelve years moving women through the Gulf. You bought a building to stop moving.",
    start: "Good trading skill, more women than money, and a rival who wants your contacts.",
    setup: (s) => {
      s.arcology.cash = 40000;
      s.arcology.rep = 500;
      s.player.skills = { trading: 55, hacking: 10, slaving: 40, engineering: 10, medicine: 10 };
      // Stock you didn't sell before you stopped: two more, cheaper, wearier.
      for (let i = 0; i < 2; i++) {
        const p = generatePerson({ seed: `broker-stock:${s.id}:${i}`, week: 1, quality: -0.3, central: true });
        p.origin.acquired_how = "stock left over from your trading days";
        s.people[p.id] = p;
        s.memory[p.id] = newMemory();
      }
    },
  },
  {
    id: "investor",
    name: "The Investor",
    pitch: "A fund bought it for the land. You're the one they sent to make it pay.",
    start: "Lots of money that isn't yours, low standing, and a board that reviews you every quarter.",
    setup: (s) => {
      s.arcology.cash = 150000;
      s.arcology.rep = 100;
      s.player.skills = { trading: 40, hacking: 30, slaving: 10, engineering: 25, medicine: 5 };
    },
  },
  {
    id: "prodigal",
    name: "The Prodigal",
    pitch: "Your family owns half the coast. They gave you this to keep you out of the way.",
    start: "Plenty of money and name, not much skill, and a sibling who wants what's yours.",
    setup: (s) => {
      s.arcology.cash = 95000;
      s.arcology.rep = 1600;
      s.arcology.public_standing = 2;
      s.player.skills = { trading: 20, hacking: 10, slaving: 15, engineering: 15, medicine: 10 };
    },
  },
];

export const ORIGIN_BY_ID: Record<string, Origin> = Object.fromEntries(ORIGINS.map((o) => [o.id, o]));

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * THE HEIR — your father's house
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

function heirDebt(c: Ctx): number {
  return Number(c.flag("heir_debt") ?? 90000);
}

const heir: ArcDef = {
  id: "heir", title: "Your Father's House", kind: "origin", origin: "heir",
  cast: ["creditor"],
  subject: (s) => {
    // His head girl: the oldest woman in the house, made devoted to him and wary of you.
    const p = ownedAdults(s).sort((a, b) => b.age - a.age)[0];
    if (p) { p.age = Math.max(p.age, 31); p.bond.bond = 20; p.bond.hope = 30; p.skills.management = { ...p.skills.management, general: 45 }; p.origin.acquired_how = "was your father's head girl for nine years"; }
    return p;
  },
  start: "will",
  beats: {
    will: {
      title: "The reading of the will",
      text: (c) => `The lawyer reads the will in your father's office with the blinds half down. It takes eleven minutes. You get the arcology, the household, and a thick folder of debts.

${c.full("creditor")} stands by the window the whole time, because most of the folder is ${c.his("creditor")} paper. When the lawyer has gone, ${c.he("creditor")} stays.

"Your father and I had an understanding," ${c.he("creditor")} says. "Ninety thousand, and I'm a patient ${c.he("creditor") === "he" ? "man" : "woman"}. Or you sign the building over by the end of the half-year and we part friends."

${c.sn} — your father's head girl for nine years — is pouring the drinks and listening to every word.`,
      options: [
        { id: "pay", label: "\"You'll get your money.\"", note: "a debt of ¤90,000, and your word on it",
          run: (c) => { c.set("heir_debt", 90000); c.set("heir_word", true); c.like("creditor", 5);
            return { text: `${c.n("creditor")} smiles. "We'll see. Come by in two months. We'll see how you're getting on."`, next: "headgirl", after: 1 }; } },
        { id: "understanding", label: "Ask what the understanding actually was",
          run: (c) => { c.set("heir_debt", 90000); c.set("heir_asked", true); c.like("creditor", -5);
            return { text: `${c.n("creditor")} looks at you for a long moment. "Your father borrowed money. I lent it. That's the understanding." ${c.He("creditor")} finishes ${c.his("creditor")} drink. Across the room, ${c.sn} looks uncomfortable. She clearly knows something.`, next: "headgirl", after: 1 }; } },
        { id: "share", label: "Offer a share of the building instead of cash", note: "halves the debt; costs you ownership", need: skill("trading", 25),
          run: (c) => { c.set("heir_debt", 45000); c.set("heir_partner", true); c.s.arcology.ownership = Math.max(5, c.s.arcology.ownership - 8); c.like("creditor", 15); c.out.push("−8% ownership");
            return { text: `${c.n("creditor")} actually laughs. "He never would have offered that. All right. Eight points of the building and I'll cut the paper in half." You shake on it.`, next: "headgirl", after: 1 }; } },
        { id: "out", label: (c) => `Have her show ${c.him("creditor")} out`, note: "the debt stands, and so does the insult",
          run: (c) => { c.set("heir_debt", 110000); c.set("heir_defiant", true); c.like("creditor", -20); c.treat(c.subj, "recognition", 4, "trusted to throw out the creditor");
            return { text: `You tell ${c.sn} to see ${c.n("creditor")} to the lift. She does it with exaggerated politeness. ${c.n("creditor")} stops in the doorway. "Interest compounds," ${c.he("creditor")} says. "Your father knew that." The debt is a hundred and ten thousand now.`, next: "headgirl", after: 1 }; } },
      ],
    },
    headgirl: {
      title: "His girl",
      text: (c) => `It's past midnight. ${c.sn} knocks on the office door and waits to be told to come in.

She's in the grey robe she wore for your father. She stands by his chair, not in it, and puts one hand on the back of it.

"He used to let me sit here while he worked," she says. "I'd read. He'd swear at the numbers. I don't know what I'm supposed to do now."`,
      options: [
        { id: "sit", label: "\"Sit.\"",
          run: (c) => { c.treat(c.subj, "kindness", 6, "you let her sit in his chair"); c.set("heir_hg", "kept");
            const trusts = c.subj ? read(c.subj).trust > -20 : false;
            if (trusts) c.set("heir_ledger", true);
            return { text: trusts
              ? `She sits. After a while she says, without looking up, "He kept a second ledger. Bottom drawer, taped underneath. He didn't want ${c.n("creditor")} to know about it." She goes back to reading.`
              : `She sits. She doesn't say anything else, and she doesn't read. At some point she falls asleep in the chair and you leave her there.`,
              next: c.flag("heir_ledger") ? "ledger" : "payday", after: c.flag("heir_ledger") ? 1 : 6 }; } },
        { id: "tell", label: "Ask her what he was like",
          run: (c) => { c.treat(c.subj, "recognition", 4, "you asked about him"); c.set("heir_ledger", true); c.set("heir_hg", "kept");
            return { text: `She tells you. He was vain about his hands and hopeless with money and he cried at films. He owed ${c.n("creditor")} because ${c.n("creditor")} had bought something for him that he couldn't be seen buying. "It's written down," she says. "He wrote everything down. There's a ledger in the desk that isn't the ledger."`, next: "ledger", after: 1 }; } },
        { id: "mine", label: "\"You're mine now. I'll show you what that means.\"", note: "you take her, here, in his chair",
          run: (c) => { if (c.subj) resolveAct(c.s, c.subj, "vaginal"); c.treat(c.subj, "cruelty", 6, "taken in his chair the week he died"); c.set("heir_hg", "taken");
            return { text: `You bend her over his desk, pull up her robe and fuck her. She doesn't fight, but she stares at his photograph on the shelf the whole time. When you're done she straightens her robe and asks if there's anything else, then leaves. She never comes to the office on her own again.`, next: "payday", after: 6 }; } },
        { id: "sell", label: "Sell her. You don't want his ghosts in the house.",
          run: (c) => { if (c.subj) c.remove(c.subj, "sold", "sold the week her owner died", Math.round(valuePerson(c.s, c.subj) * 0.9)); c.set("heir_hg", "sold"); c.hope(-6);
            return { text: `A broker takes her on Thursday. She packs one bag and doesn't ask where she's going. The rest of the household watches her go, and they're all a little more afraid of you now.`, next: "payday", after: 6 }; } },
      ],
    },
    ledger: {
      title: "The second ledger",
      text: (c) => `It's where she said: taped to the underside of the bottom drawer, a cheap notebook with a split spine.

Your father's handwriting, small and slanted. Dates, amounts, and one name over and over — ${c.full("creditor")}. Not loans. Payments, going the other way, and next to each one a set of initials and a port.

${c.n("creditor")} wasn't lending your father money. ${c.He("creditor")} was selling him women that weren't ${c.his("creditor")} to sell, and the debt is what your father owed for the last shipment. There are enough dates in here to interest the Owners' Association, and ${c.n("creditor")}'s other clients.`,
      options: [
        { id: "leverage", label: `Show ${"it"} to the creditor and renegotiate`, note: "the debt shrinks; the creditor won't forget",
          run: (c) => { c.set("heir_debt", Math.round(heirDebt(c) * 0.35)); c.set("heir_leverage", true); c.like("creditor", -35);
            return { text: `You photograph one page and send it to ${c.n("creditor")} with no message. ${c.He("creditor")} calls within the hour. By the end of the call your father's debt is ${money(heirDebt(c))}, and ${c.n("creditor")}'s voice has gone very quiet and very polite.`, next: "payday", after: 5 }; } },
        { id: "sell", label: "Sell the ledger to one of the creditor's rivals", note: "money now; trouble later",
          run: (c) => { c.cash(35000); c.set("heir_sold_ledger", true); c.like("creditor", -60);
            return { text: `A woman from the Kestrel exchange pays thirty-five thousand for it and doesn't ask how you got it. Within a fortnight two of ${c.n("creditor")}'s ports are closed to ${c.him("creditor")}. ${c.He("creditor")} knows exactly where that came from.`, next: "payday", after: 5 }; } },
        { id: "burn", label: "Burn it. It's his sin, not yours.",
          run: (c) => { c.set("heir_burned", true); c.treat(c.subj, "kindness", 3, "you kept his secret");
            return { text: `It takes a while to catch. ${c.sn} watches from the doorway, and she's clearly grateful.`, next: "payday", after: 5 }; } },
      ],
    },
    payday: {
      title: (c) => `${c.n("creditor")} comes to collect`,
      text: (c) => {
        const d = heirDebt(c);
        const tone = c.npc("creditor").disposition < -30
          ? `${c.He("creditor")} brings two men this time. They stay by the lift and look at your household like they're pricing it.`
          : `${c.He("creditor")} comes alone, and admires the view, and asks after your health.`;
        return `${c.n("creditor")} arrives on a Tuesday without calling ahead. ${tone}

"${money(d)}," ${c.he("creditor")} says, sitting down in your father's chair. "That's where we are. I'd like to leave today with some of it."`;
      },
      options: [
        { id: "all", label: (c) => `Pay it all — ${money(heirDebt(c))}`, need: (c) => cash(heirDebt(c))(c),
          run: (c) => { c.cash(-heirDebt(c)); c.set("heir_debt", 0); c.like("creditor", 20); c.rep(200);
            return { text: `${c.n("creditor")} counts it twice, then shakes your hand. "He'd have been surprised," ${c.he("creditor")} says. "I'll tell people."`, next: "end_paid", after: 0 }; } },
        { id: "half", label: (c) => `Pay half — ${money(heirDebt(c) / 2)}`, need: (c) => cash(heirDebt(c) / 2)(c),
          run: (c) => { const h = Math.round(heirDebt(c) / 2); c.cash(-h); c.set("heir_debt", h); c.like("creditor", 5);
            return { text: `"Half," ${c.he("creditor")} says. "Well. Half is a start." ${c.He("creditor")} stands and buttons ${c.his("creditor")} jacket. "I'll be back for the other half before the season turns."`, next: "reckoning", after: 8 }; } },
        { id: "girl", label: "Settle part of it with one of your women", note: "he takes her with him today",
          pick: { label: "Who goes with the creditor", filter: (p) => p.age >= 18 },
          run: (c, p) => { if (!p) return { text: "" }; const v = Math.round(valuePerson(c.s, p) * 1.1); c.set("heir_debt", Math.max(0, heirDebt(c) - v)); c.remove(p, "sold", `given to ${c.full("creditor")} against your father's debt`); c.like("creditor", 10); c.hope(-5);
            return { text: `${c.n("creditor")} looks ${p.name} over the way you'd look at a used car, then nods. "${money(v)} off." ${p.name} looks at you once on the way to the lift. The debt is ${money(heirDebt(c))} now.`, next: heirDebt(c) > 0 ? "reckoning" : "end_paid", after: heirDebt(c) > 0 ? 8 : 0 }; } },
        { id: "time", label: "Ask for more time", need: (c) => (c.flag("heir_leverage") || c.skill("trading") >= 40 ? null : "needs trading 40, or leverage"),
          run: (c) => { c.like("creditor", -5);
            return { text: c.flag("heir_leverage") ? `${c.He("creditor")} knows what you have in the desk. "Take the time," ${c.he("creditor")} says, through gritted teeth.` : `You talk. ${c.He("creditor")} listens. At the end ${c.he("creditor")} gives you two months, and you both know it's because ${c.he("creditor")} thinks you'll be worth more then.`, next: "reckoning", after: 8 }; } },
        { id: "no", label: "\"You'll get nothing today.\"",
          run: (c) => { c.like("creditor", -30); c.set("heir_war", true);
            return { text: `${c.n("creditor")} gets up slowly. "Your father said that to me once," ${c.he("creditor")} says. "He paid double in the end." The lift doors close on ${c.him("creditor")}. That night somebody sets fire to a waste chute on the industrial level.`, next: "reckoning", after: 6 }; } },
      ],
    },
    reckoning: {
      title: "The reckoning",
      text: (c) => {
        if (c.flag("heir_war") || c.npc("creditor").disposition < -40) {
          return `Three weeks of small disasters: a freight contract cancelled, a shipment of curatives that never arrived, one of your women followed home from the concourse. It's ${c.n("creditor")}, and everyone in the building knows it.

Then ${c.he("creditor")} sends a note, handwritten. *${money(Math.max(heirDebt(c), 1))}, or the building. Friday.*`;
        }
        return `${c.n("creditor")} is back, as promised, for the rest. ${money(heirDebt(c))}. ${c.He("creditor")}'s brought a bottle of expensive wine from the year your father was born.`;
      },
      options: [
        { id: "pay", label: (c) => `Pay the rest — ${money(heirDebt(c))}`, need: (c) => cash(heirDebt(c))(c),
          run: (c) => { c.cash(-heirDebt(c)); c.set("heir_debt", 0); c.like("creditor", 25);
            return { text: `The last of it goes across the desk. ${c.n("creditor")} opens the bottle and pours two glasses and drinks to your father, and then, after a moment, to you.`, next: "end_paid", after: 0 }; } },
        { id: "ruin", label: "Take the ledger to the Association", show: (c) => !!c.flag("heir_leverage") || !!c.flag("heir_ledger") && !c.flag("heir_burned") && !c.flag("heir_sold_ledger"),
          run: (c) => { c.set("heir_debt", 0); c.npc("creditor").status = "gone"; c.rep(400); c.standing(1);
            if (c.he("creditor") === "she") {
              const p = c.addSlave({ seed: "creditor", name: c.full("creditor"), age: 44, quality: 0.3, how: "the Association seized her and sold her to cover her debts; you bought the paper", hostile: true });
              c.npc("creditor").status = "owned"; c.npc("creditor").person = p.id;
              return { text: `The Association moves faster than you expected. ${c.n("creditor")}'s accounts are frozen by Wednesday, and by the end of the month she's on a block in the Grand Exchange to cover what she owes. You buy her cheap. She's furious.`, end: "the creditor was ruined, and ended up yours" };
            }
            return { text: `The Association moves faster than you expected. ${c.n("creditor")}'s accounts are frozen by Wednesday and he's gone by the weekend — a yacht, people say, going south. Your father's debt goes with him.`, end: "the creditor was ruined and fled" }; } },
        { id: "kill", label: "Have it dealt with. Permanently.", need: (c) => (c.s.arcology.security >= 55 || c.s.arcology.mercenaries.hired ? null : "needs security 55 or mercenaries"),
          run: (c) => { c.set("heir_debt", 0); c.npc("creditor").status = "dead"; c.crime(5); c.rep(-150); c.household("coercion", 2, "the house heard what happened to the creditor");
            return { text: `It happens on a service stair at two in the morning and it's in the news by breakfast. Nobody asks you about it directly. The debt dies with ${c.him("creditor")}, and your citizens are more afraid of you now.`, end: "the creditor was killed" }; } },
        { id: "sign", label: "Sign the building over", note: "the game goes on, but you answer to someone now",
          run: (c) => { c.s.arcology.ownership = Math.max(1, c.s.arcology.ownership - 30); c.set("heir_debt", 0); c.like("creditor", 30); c.rep(-300); c.out.push("−30% ownership");
            return { text: `You sign. ${c.n("creditor")} doesn't gloat. "You can stay on," ${c.he("creditor")} says. "Run it. You're better at it than he was."`, end: "you signed the building over and stayed on to run it" }; } },
      ],
    },
    end_paid: {
      title: "Paid",
      text: (c) => `Your father's debts are gone. You burn the folder of debts.${c.subj && c.subj.status === "owned" ? ` ${c.sn} watches it burn and then asks, carefully, what you'd like her to do now.` : ""}`,
      options: [
        { id: "hg", label: "Make her your Head Girl", show: (c) => !!c.subj && c.subj.status === "owned" && c.flag("heir_hg") === "kept",
          run: (c) => { if (c.subj) { c.subj.assignment = "be your Head Girl"; c.treat(c.subj, "recognition", 8, "made Head Girl of your house, not his"); }
            return { text: `She accepts the post, and moves her things out of your father's old room that night.`, end: "you paid your father's debts, and kept his head girl" }; } },
        { id: "done", label: "Pour a drink and go to bed",
          run: () => ({ text: `The arcology is finally yours, free and clear.`, end: "you paid your father's debts" }) },
      ],
    },
  },
};

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * THE RAIDER — the man on the yacht
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

function strength(c: Ctx): number {
  const household = ownedAdults(c.s);
  const loyal = household.filter((p) => read(p).devotion > 20).length;
  return c.s.arcology.security + (c.s.arcology.mercenaries.hired ? c.s.arcology.mercenaries.strength : 0)
    + c.npc("captain").disposition / 2 + loyal * 4 + (c.flag("raider_plan") ? 20 : 0) - (c.flag("raider_mutter") ? 15 : 0);
}

const raider: ArcDef = {
  id: "raider", title: "The Man on the Yacht", kind: "origin", origin: "raider",
  cast: ["captain", "deposed"],
  subject: (s) => mostResentful(s),
  start: "pay",
  beats: {
    pay: {
      title: "The men want paying",
      text: (c) => `${c.full("captain")} finds you on the observation deck with the sun coming up. ${c.He("captain")} took this building beside you four months ago and hasn't slept a full night since.

"The lads want paying," ${c.he("captain")} says. "They were promised a city. So far they've had a city's worth of paperwork."

Out past the breakwater, a white yacht sits at anchor where everyone can see it. ${c.full("deposed")} has been broadcasting from it all week: you're a pirate, the registry is void, and ${c.he("deposed")}'ll be home by summer.

Downstairs, ${c.sn} — one of ${c.n("deposed")}'s women, and yours now — is scrubbing the floor where the fighting was worst. She's scrubbed it every day for four months.`,
      options: [
        { id: "bonus", label: "Pay them a bonus out of what's left", note: "¤15,000", need: cash(15000),
          run: (c) => { c.cash(-15000); c.like("captain", 15); c.s.arcology.mercenaries.loyalty += 10;
            return { text: `${c.n("captain")} counts it out to the men himself, on the concourse, where the citizens can see. It buys you a month of loyalty and a lot of goodwill in the bars on the lower levels.`.replace("himself", c.he("captain") === "he" ? "himself" : "herself"), next: "envoy", after: 3 }; } },
        { id: "shares", label: "Promise them shares in the building",
          run: (c) => { c.set("raider_shares", true); c.like("captain", 8);
            return { text: `"Shares," ${c.n("captain")} says, like ${c.he("captain")}'s tasting it. "They'll like that. They won't like it if you don't pay out."`, next: "envoy", after: 3 }; } },
        { id: "loot", label: "Let them take their pick of the old household for a week",
          run: (c) => { c.like("captain", 18); c.household("cruelty", 5, "given to the mercenaries for a week"); c.set("raider_loot", true); c.rumor(`the new owner gave ${c.n("deposed")}'s women to the soldiers`, -1);
            return { text: `The men cheer when ${c.n("captain")} tells them. For a week the mercenaries use the old household's slaves however they like, every night. When it's over ${c.sn} goes back to scrubbing the same floor, and the others are terrified of you.`, next: "envoy", after: 3 }; } },
        { id: "wait", label: "\"They'll be paid when the building pays.\"",
          run: (c) => { c.like("captain", -12); c.set("raider_mutter", true);
            return { text: `${c.n("captain")} doesn't argue. ${c.He("captain")} just goes downstairs. That evening some of the men have walked off the job.`, next: "envoy", after: 3 }; } },
      ],
    },
    envoy: {
      title: "A message from the yacht",
      text: (c) => `A launch comes in from the yacht under a white flag. On it is a woman in a good coat carrying a leather folder, and she asks for you by name.

"${c.n("deposed")} makes you an offer," she says. "Eighty thousand, today, for ${c.sn}. She was ${c.his("deposed")} favourite. You don't need her. ${c.He("deposed")} does." She opens the folder. "And in return, ${c.he("deposed")} goes south and doesn't come back."

${c.sn} is standing behind you with a tray, and she's terrified.`,
      options: [
        { id: "sell", label: "Take the money. Send her back.", note: "+¤80,000", show: (c) => !!c.subj && c.subj.status === "owned",
          run: (c) => { if (c.subj) c.remove(c.subj, "sold", `sent back to ${c.full("deposed")}`, 80000); c.set("raider_deal", true); c.like("deposed", 20);
            return { text: `${c.sn} goes down to the launch, sobbing. The envoy shakes your hand. The yacht stays where it is.`, next: "night", after: 8 }; } },
        { id: "no", label: "\"She stays. So do I.\"",
          run: (c) => { c.like("deposed", -20); c.treat(c.subj, "recognition", 6, "you refused to send her back to him");
            return { text: `The envoy closes the folder. "${c.He("deposed")} thought you'd say that." When the envoy's gone, ${c.sn} thanks you. It's the first time she's spoken to you without being spoken to first.`, next: "night", after: 7 }; } },
        { id: "hold", label: "Keep the envoy too", note: "she's worth something, and she knows things",
          run: (c) => { const p = c.addSlave({ seed: "envoy", age: 29, quality: 0.5, how: `came as ${c.full("deposed")}'s envoy and was kept`, hostile: true }); c.set("raider_envoy", p.id); c.like("deposed", -35);
            return { text: `Your men take her folder and her coat and her shoes. She doesn't scream. ${p.name}, it turns out, has been ${c.n("deposed")}'s lawyer for six years and knows exactly how many guns are on that yacht.`, next: "squeeze", after: 1 }; } },
      ],
    },
    squeeze: {
      title: "What the envoy knows",
      text: (c) => {
        const e = c.s.people[String(c.flag("raider_envoy"))];
        return `${e?.name ?? "The envoy"} has been in a locked room for a day. She's sitting on the edge of the bed when you come in, trying to look calm.

"I'm not going to tell you anything," she says.`;
      },
      options: [
        { id: "deal", label: "Offer her a good place in the house for the truth",
          run: (c) => { const e = c.s.people[String(c.flag("raider_envoy"))]; c.treat(e, "promise_kept", 6, "offered a real place for the truth"); c.set("raider_plan", true);
            return { text: `She thinks about it for a long time. Then she tells you: forty hired men, a fishing fleet out of Ardent, the night of the next new moon, through the freight doors on the industrial level. "He's never kept a promise to me," she says. "Let's see if you do."`, next: "night", after: 5 }; } },
        { id: "break", label: "Break her until she talks", note: "ugly, and it works",
          run: (c) => { const e = c.s.people[String(c.flag("raider_envoy"))]; if (e) { resolveAct(c.s, e, "discipline"); resolveAct(c.s, e, "restraint"); } c.treat(e, "cruelty", 8, "made to talk"); c.set("raider_plan", true);
            return { text: `You tie her down and whip her until she talks. It takes most of the night. By the end she's sobbing out everything: forty men, the fishing fleet, the freight doors, the new moon. She's terrified of you afterwards.`, next: "night", after: 5 }; } },
        { id: "use", label: "Send her back to him with a false plan", need: skill("hacking", 25),
          run: (c) => { const e = c.s.people[String(c.flag("raider_envoy"))]; if (e) c.remove(e, "gone", "sent back to the yacht carrying a lie"); c.set("raider_plan", true); c.set("raider_trap", true);
            return { text: `You let her overhear exactly what you want ${c.n("deposed")} to hear, and then you let her escape. When they come, they'll come where you're waiting.`, next: "night", after: 5 }; } },
      ],
    },
    night: {
      title: "The night they come back",
      text: (c) => `${c.flag("raider_plan") ? "You knew it was coming. " : ""}At two in the morning the freight doors on the industrial level blow inward and the lights go out across four floors.

${c.n("captain")}'s voice on the radio: "Fishing boats. Thirty, forty men. ${c.n("deposed")}'s with them — I can hear ${c.him("deposed")} shouting." A pause. "Your call."`,
      options: [
        { id: "fight", label: "Meet them at the doors", note: (c) => `your strength ${Math.round(strength(c))}`,
          run: (c) => {
            const won = strength(c) >= 85 || !!c.flag("raider_trap");
            if (won) { c.npc("deposed").status = "owned"; c.like("captain", 10); c.rep(500); c.standing(2);
              return { text: `It's over by four. ${c.n("deposed")}'s men were expecting a sleeping building and found yours awake. ${c.flag("raider_trap") ? "They came exactly where you'd told them to. " : ""}${c.n("captain")} brings ${c.n("deposed")} up to the penthouse in cable ties with ${c.his("deposed")} good coat torn.`, next: "fate", after: 0 }; }
            c.cash(-20000); c.s.arcology.ownership = Math.max(5, c.s.arcology.ownership - 10); c.out.push("−10% ownership");
            const lost = ownedAdults(c.s).slice(0, 2); for (const p of lost) c.remove(p, "gone", `taken in ${c.full("deposed")}'s raid`);
            return { text: `You hold the penthouse and lose three floors below it. By dawn ${c.n("deposed")}'s men have pulled back to the boats with what they could carry, and some of what they carried was yours. The yacht is still out there.`, next: "second", after: 6 };
          } },
        { id: "bribe", label: (c) => `Buy off ${c.his("deposed")} mercenaries on the radio`, note: "¤25,000", need: (c) => cash(25000)(c) ?? skill("trading", 30)(c),
          run: (c) => { c.cash(-25000); c.npc("deposed").status = "owned"; c.rep(300);
            return { text: `You find their frequency and name a number. There's a long silence, and then shouting, and then the shooting stops. They hand ${c.n("deposed")} over at the freight doors like a parcel.`, next: "fate", after: 0 }; } },
        { id: "captain", label: "\"You handle it, Captain.\"", note: "how much does the captain like you?",
          run: (c) => {
            if (c.npc("captain").disposition >= 10) { c.npc("deposed").status = "owned"; c.like("captain", 10);
              return { text: `"On it." You listen to it happen on the radio. It's fast and brutal and it works, and at half past three ${c.n("captain")} says, "Got ${c.him("deposed")}."`, next: "fate", after: 0 }; }
            c.npc("captain").status = "gone"; c.s.arcology.mercenaries = { hired: false, strength: 0, loyalty: 0, upkeep: 0 }; c.s.arcology.security = Math.max(10, c.s.arcology.security - 30); c.out.push("your mercenaries are gone");
            return { text: `There's a long pause on the radio. "Tell you what," ${c.n("captain")} says. "You handle it." The channel goes dead. By morning ${c.n("captain")} and ${c.his("captain")} men are gone, and so is ${c.n("deposed")}'s raid — they took each other's money and left together. You still have the arcology, barely.`, next: "second", after: 6 };
          } },
      ],
    },
    second: {
      title: "The yacht, again",
      text: (c) => `The white yacht is back at anchor. ${c.n("deposed")} has given an interview to a Kestrel paper calling you a squatter with a navy. Some of your citizens have started to agree.`,
      options: [
        { id: "sink", label: "Put it on the bottom of the harbour", need: (c) => (c.s.arcology.security >= 50 ? null : "needs security 50"),
          run: (c) => { c.npc("deposed").status = "dead"; c.rep(200); c.standing(-1); c.crime(3);
            return { text: `Your divers plant a limpet mine, and the yacht sinks with its lights still on. ${c.n("deposed")} was aboard. That's the end of the interviews.`, end: "you sank the old owner with his yacht" }; } },
        { id: "buy", label: (c) => `Buy out ${c.his("deposed")} claim`, note: "¤40,000", need: cash(40000),
          run: (c) => { c.cash(-40000); c.npc("deposed").status = "gone"; c.like("deposed", 30); c.rep(150);
            return { text: `Lawyers meet on neutral ground. ${c.n("deposed")} signs a quitclaim for forty thousand and a promise never to sail within sight of the breakwater. The yacht leaves on the evening tide.`, end: "you bought out the old owner's claim" }; } },
        { id: "ignore", label: (c) => `Let ${c.him("deposed")} shout. You have a city to run.`,
          run: (c) => { c.standing(-1);
            return { text: `You let ${c.him("deposed")} shout. Over the next few months the interviews dry up, and one morning the yacht is gone.`, end: "the old owner gave up and sailed away" }; } },
      ],
    },
    fate: {
      title: (c) => `${c.n("deposed")}`,
      text: (c) => `${c.full("deposed")} kneels on the penthouse carpet that used to be ${c.his("deposed")}. ${c.He("deposed")}'s bleeding from the scalp and won't stop threatening you with lawyers, the registry and the Association.

The household has come up to watch. ${c.subj && c.subj.status === "owned" ? `${c.sn} is at the front.` : ""}`,
      options: [
        { id: "hang", label: (c) => `Hang ${c.him("deposed")} from the atrium rail`, note: "the city will remember it",
          run: (c) => { c.npc("deposed").status = "dead"; c.rep(600); c.standing(-2); c.household("coercion", 3, "saw the old owner hanged"); c.hope(-5); c.treat(c.subj, "kindness", 5, "watched the man who owned her hang");
            return { text: `It's done at noon, where the shoppers can see. The household watches from the penthouse gallery. ${c.subj && c.subj.status === "owned" ? `${c.sn} is glad to see it.` : ""} Nobody challenges your ownership after that.`, end: "you hanged the old owner in the atrium" }; } },
        { id: "ransom", label: (c) => `Ransom ${c.him("deposed")} back to ${c.his("deposed")} family`, note: "+¤60,000",
          run: (c) => { c.cash(60000); c.npc("deposed").status = "gone"; c.like("deposed", -40);
            return { text: `${c.His("deposed")} family pays within a week, grudgingly, in three instalments. ${c.n("deposed")} leaves in a hired car. ${c.He("deposed")}'ll hate you forever, but from far away.`, end: "you ransomed the old owner" }; } },
        { id: "give", label: (c) => `Give ${c.him("deposed")} to ${c.his("deposed")} old household`, show: (c) => ownedAdults(c.s).length >= 2,
          run: (c) => { c.npc("deposed").status = "dead"; c.household("recognition", 6, "you let them have the man who owned them"); c.hope(8); c.rep(200);
            return { text: `You hand ${c.him("deposed")} over to the slaves ${c.he("deposed")} used to own and leave the room. ${c.He("deposed")} doesn't survive the night. In the morning the servants' quarters are calm for the first time since you came, and ${c.sn} has stopped scrubbing the floor.`, end: "you gave the old owner to the women he'd owned" }; } },
        { id: "keep", label: "Keep her. Collar her.", show: (c) => c.he("deposed") === "she",
          run: (c) => { const p = c.addSlave({ seed: "deposed", name: c.full("deposed"), age: 41, quality: 0.5, how: "owned this building until you took it, then tried to take it back", hostile: true }); c.npc("deposed").person = p.id; c.hope(6);
            return { text: `She screams when they put the collar on. None of her old slaves help her. By evening she's in the servants' quarters in a slave's tunic, and her former slaves are teaching her how to fold sheets.`, end: "the old owner wears your collar" }; } },
      ],
    },
  },
};

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * THE CLIMBER — your papers
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const climber: ArcDef = {
  id: "climber", title: "Your Papers", kind: "origin", origin: "climber",
  cast: ["old_owner"],
  subject: (s) => closest(s),
  start: "gala", delay: 2,
  beats: {
    gala: {
      title: "A face across the room",
      text: (c) => `The Owners' Association gala, on the top floor of the Kestrel spire. You're three drinks in and managing fine.

Then you see ${c.full("old_owner")}.

Nine years older. Greyer. Still the same smug smile. ${c.He("old_owner")} owned you for four years. ${c.He("old_owner")} bought you for eleven hundred and sold you for nine, and everything you know about training slaves, you learned from being ${c.his("old_owner")} slave.

${c.He("old_owner")} sees you. ${c.He("old_owner")} raises ${c.his("old_owner")} glass.`,
      options: [
        { id: "toast", label: "Walk over and toast back",
          run: (c) => { c.like("old_owner", 10); c.set("climber_faced", true);
            return { text: `"Look at you," ${c.he("old_owner")} says, and actually sounds pleased. "I always said you'd go far. I didn't think it'd be up." ${c.He("old_owner")} chats with you about your arcology like an old friend. You leave as soon as you can, shaken.`, next: "papers", after: 3 }; } },
        { id: "cut", label: (c) => `Look straight through ${c.him("old_owner")} and leave`,
          run: (c) => { c.like("old_owner", -15); c.set("climber_cut", true);
            return { text: `You put your glass down on a waiter's tray and walk out. Someone standing near ${c.n("old_owner")} laughs at you as you go.`, next: "papers", after: 3 }; } },
        { id: "tell", label: (c) => `Tell the room who ${c.he("old_owner")} is to you`,
          run: (c) => { c.like("old_owner", -30); c.rep(-100); c.standing(1); c.set("climber_public", true);
            return { text: `You say it loud enough for the table: "${c.full("old_owner")}. My first owner. ${c.He("old_owner")} used to make me sleep in the laundry." The table goes quiet. ${c.n("old_owner")} smiles very thinly and says, "And look how well it turned out." Half the room thinks you're vulgar and the other half thinks you're brave.`, next: "papers", after: 3 }; } },
      ],
    },
    papers: {
      title: "A courier with an envelope",
      text: (c) => `A courier brings an envelope to your office and won't leave it with anyone but you.

Inside is a photocopy of your indenture. Your old name. Your old photograph, from when you were younger, thinner and frightened. And a registry stamp from ${c.arcology}'s own office, which nobody ever voided when you bought your way out, because nobody ever thought they'd need to.

Clipped to it is a card in ${c.n("old_owner")}'s handwriting. *For your files. I kept the original.*`,
      options: [
        { id: "void", label: "Pay the registrar to void it quietly", note: "¤25,000", need: cash(25000),
          run: (c) => { c.cash(-25000); c.set("climber_void", true);
            return { text: `The registrar takes your money without comment; clearly she's done this before. The record disappears. The original is still in ${c.n("old_owner")}'s safe, but in ${c.arcology} it no longer means anything.`, next: "claim", after: 4 }; } },
        { id: "hack", label: "Erase it from the registry yourself", need: skill("hacking", 30),
          run: (c) => { c.set("climber_void", true); c.set("climber_hacked", true);
            return { text: `It takes a night and most of a pot of coffee. When you're done, there's no record in ${c.arcology} that you were ever a slave.`, next: "claim", after: 4 }; } },
        { id: "call", label: (c) => `Call ${c.him("old_owner")} and ask what ${c.he("old_owner")} wants`,
          run: (c) => { c.set("climber_called", true); c.like("old_owner", 5);
            return { text: `${c.n("old_owner")} picks up on the first ring. "I want to be remembered," ${c.he("old_owner")} says. "I want to be invited. And one night, some time, I want to see if you still know how to kneel. Then I'll burn it." ${c.He("old_owner")} hangs up before you can answer.`, next: "claim", after: 3 }; } },
        { id: "laugh", label: "Throw it in the bin",
          run: (c) => { c.set("climber_ignored", true);
            return { text: `You throw it in the bin and go back to work, but you can't stop thinking about it.`, next: "claim", after: 4 }; } },
      ],
    },
    claim: {
      title: "A claim of ownership",
      text: (c) => c.flag("climber_void")
        ? `${c.n("old_owner")}'s lawyer files a claim of ownership against you anyway. It's thrown out in a day, because there's nothing to claim. But it's in the papers, and now everyone in the Association knows what you used to be.`
        : `The registrar calls you personally. "Someone has filed a claim of ownership," she says. "On you. With a valid original. I'm obliged to act on it in thirty days unless it's contested."

${c.n("old_owner")} has sent flowers.`,
      options: [
        { id: "own", label: "Say it in public before they can", show: (c) => !!c.flag("climber_void"),
          run: (c) => { c.rep(200); c.standing(2); c.household("recognition", 4, "you told the city what you used to be"); c.hope(6); c.like("old_owner", -10);
            return { text: `You give a short interview on the concourse. Yes, you were a slave. Yes, for six years. Yes, you own the building now. Your slaves see it on the screens in the dormitory, and ${c.subj?.name ?? "one of them"} asks you that night whether it's true. You tell her it is.`, next: "end", after: 2 }; } },
        { id: "court", label: "Contest it in the registry court", show: (c) => !c.flag("climber_void"), note: "¤15,000 in lawyers", need: cash(15000),
          run: (c) => { c.cash(-15000); const household = ownedAdults(c.s); const devoted = household.filter((p) => read(p).devotion > 25).length;
            if (devoted >= Math.ceil(household.length / 2)) { c.rep(150); c.like("old_owner", -20);
              return { text: `Your household testifies. One after another they tell the court how you run your house. The judge rules that a person who owns an arcology is self-evidently not property, and ${c.n("old_owner")} pays costs.`, next: "end", after: 2 }; }
            c.rep(-200);
            return { text: `You win on a technicality after a week of hearings where your household is asked, under oath, what you're like to them. Not many of them said anything good, and everyone heard it.`, next: "end", after: 2 }; } },
        { id: "night", label: (c) => `Give ${c.him("old_owner")} the night ${c.he("old_owner")} asked for`, show: (c) => !c.flag("climber_void") && !!c.flag("climber_called"), note: "and get the original",
          run: (c) => { c.set("climber_knelt", true); c.like("old_owner", 25);
            return { text: `You go to ${c.his("old_owner")} apartment alone. ${c.He("old_owner")} has you strip and kneel, and uses you all night the way ${c.he("old_owner")} used to. In the morning ${c.he("old_owner")} burns the original in front of you. You never tell anyone.`, next: "end", after: 2 }; } },
        { id: "kill", label: "Make sure the claim has nobody to pursue it", show: (c) => !c.flag("climber_void"), need: (c) => (c.s.arcology.security >= 50 ? null : "needs security 50"),
          run: (c) => { c.npc("old_owner").status = "dead"; c.crime(4); c.rep(-100);
            return { text: `${c.n("old_owner")} dies in ${c.his("old_owner")} sleep, officially. The claim lapses with ${c.him("old_owner")}. You send flowers.`, next: "end", after: 2 }; } },
      ],
    },
    end: {
      title: "What she asks you",
      text: (c) => `${c.subj?.name ?? "One of your slaves"} brings your coffee in the morning and hangs around nervously.

"The others say you were one of us," she says. "Before."`,
      options: [
        { id: "truth", label: "Tell her the truth, all of it",
          run: (c) => { c.treat(c.subj, "recognition", 8, "you told her what you used to be"); c.set("climber_told", true);
            return { text: `You tell her about the laundry, and the block, and what you did to get out. She listens without interrupting. At the end she asks, "So it's possible to get out?" and you tell her it is.`, end: "you made your peace with your papers" }; } },
        { id: "strong", label: "\"It made me who I am. It'll do the same for you.\"",
          run: (c) => { c.treat(c.subj, "coercion", 3, "told her it would make her strong");
            return { text: `She nods and goes back to work.`, end: "you told the house what you used to be, and what you are now" }; } },
        { id: "none", label: "\"That's not your concern.\"",
          run: (c) => { c.treat(c.subj, "neglect", 2, "told it wasn't her concern");
            return { text: `"Yes, of course," she says quickly, and goes.`, end: "you kept your past to yourself" }; } },
      ],
    },
  },
};

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * THE BROKER — the one you sold
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const broker: ArcDef = {
  id: "broker", title: "The One You Sold", kind: "origin", origin: "broker",
  cast: ["rival_broker", "sold_one"],
  start: "book", delay: 1,
  beats: {
    book: {
      title: "An offer for your book",
      text: (c) => `${c.full("rival_broker")} comes to see the building. ${c.He("rival_broker")} compliments everything and is obviously working out what it's all worth.

"You're out of the trade now," ${c.he("rival_broker")} says. "You've got a building. What do you need your contacts for? Forty thousand for the book. The captains, the brokers in Lagos, the man in Odessa who doesn't ask."

It's a fair price, which makes you suspicious.`,
      options: [
        { id: "sell", label: "Sell it", note: "+¤40,000",
          run: (c) => { c.cash(40000); c.set("broker_sold_book", true); c.like("rival_broker", 20);
            return { text: `${c.n("rival_broker")} flips through it on the spot, nodding. "I'll look after them," ${c.he("rival_broker")} says, and pockets twelve years of your work.`, next: "block", after: 5 }; } },
        { id: "fake", label: (c) => `Sell ${c.him("rival_broker")} a book full of dead numbers`, need: skill("trading", 50), note: "+¤40,000, and an enemy when it's found out",
          run: (c) => { c.cash(40000); c.set("broker_fake", true); c.like("rival_broker", 10);
            return { text: `You spend a night writing it. Half the captains are dead, one's in prison, the man in Odessa is a police informant. ${c.n("rival_broker")} pays in cash and leaves happy. ${c.He("rival_broker")}'ll find out in about a month.`, next: "block", after: 5 }; } },
        { id: "no", label: "\"It's not for sale.\"",
          run: (c) => { c.like("rival_broker", -10);
            return { text: `"Everything's for sale," ${c.n("rival_broker")} says, "you taught me that." ${c.He("rival_broker")} finishes ${c.his("rival_broker")} coffee and leaves, and you have the distinct feeling ${c.he("rival_broker")}'ll try another way.`, next: "block", after: 5 }; } },
        { id: "partner", label: "Offer a partnership instead", need: skill("trading", 35),
          run: (c) => { c.set("broker_partner", true); c.like("rival_broker", 15);
            return { text: `You'll source, ${c.he("rival_broker")}'ll ship, you split it. ${c.n("rival_broker")} thinks it over and shakes your hand. Your market prices will be kinder for a while.`, next: "block", after: 5 }; } },
      ],
    },
    block: {
      title: "On the block",
      text: (c) => `The Tuesday auction on the commercial level. You're there for a cook.

Lot fourteen is a woman in her thirties with a scar through one eyebrow. The auctioneer calls her ${c.n("sold_one")}. You know her. Eight years ago you bought her in Tangier and sold her in Doha to a man you told her had a good house.

She recognizes you in the second row, and glares at you.`,
      options: [
        { id: "buy", label: "Buy her", note: "¤7,000", need: cash(7000),
          run: (c) => { c.cash(-7000); const p = c.addSlave({ seed: "sold_one", name: c.full("sold_one"), age: 34, quality: 0.1, how: "you sold her eight years ago; you bought her back", hostile: true }); c.npc("sold_one").status = "owned"; c.npc("sold_one").person = p.id; p.health.health = -10;
            return { text: `Nobody bids against you. She's brought up to your office in the evening. She's furious with you. "You told me it was a good house," she says.`, next: "yours", after: 0 }; } },
        { id: "free", label: "Buy her freedom through a lawyer, anonymously", note: "¤12,000", need: cash(12000),
          run: (c) => { c.cash(-12000); c.npc("sold_one").status = "gone"; c.set("broker_freed", true);
            return { text: `A lawyer you've never met buys lot fourteen and walks her out of the building with a ticket and a sealed envelope. She never finds out who paid.`, next: "rival", after: 6 }; } },
        { id: "pass", label: "Look at your programme until the lot is over",
          run: (c) => { c.set("broker_passed", true);
            return { text: `The bidding is slow. She goes for five thousand to a buyer in a good suit — ${c.full("rival_broker")}'s man. As she's led off she glares back at you.`, next: "rival", after: 5 }; } },
      ],
    },
    yours: {
      title: (c) => `${c.n("sold_one")}`,
      text: (c) => `She's been in the house a week. She works hard, but she doesn't talk to you unless she has to. The other slaves are wary of her.

Tonight she's waiting outside your door when you come up.`,
      options: [
        { id: "sorry", label: "Tell her you're sorry",
          run: (c) => { const p = c.s.people[c.npc("sold_one").person ?? ""]; c.treat(p, "kindness", 5, "you said you were sorry"); c.set("broker_sorry", true);
            return { text: `She laughs bitterly. "Sorry," she says. "I had a baby in that good house. They took him at six weeks." Then she goes to bed.`, next: "rival", after: 4 }; } },
        { id: "free", label: "Free her", note: "she leaves the household",
          run: (c) => { const p = c.s.people[c.npc("sold_one").person ?? ""]; if (p) c.remove(p, "free", "freed by the broker who sold her"); c.hope(8); c.set("broker_freed", true);
            return { text: `You hand her the papers. She reads every line. At the door she stops. "It doesn't make us even," she says. "But it's something." Your other slaves watch her walk out the front door a free woman.`, next: "rival", after: 4 }; } },
        { id: "hg", label: "Make her your Head Girl", note: "she knows exactly how houses go wrong",
          run: (c) => { const p = c.s.people[c.npc("sold_one").person ?? ""]; if (p) { p.assignment = "be your Head Girl"; p.skills.management = { ...p.skills.management, general: 50 }; } c.treat(p, "recognition", 8, "made Head Girl by the broker who sold her");
            return { text: `She's stunned. Then she says, "Fine," and by the end of the week she has rearranged the entire household, fired the cook, and put the two youngest girls in rooms with locks on the inside.`, next: "rival", after: 4 }; } },
        { id: "use", label: "\"You're mine again. Act like it.\"",
          run: (c) => { const p = c.s.people[c.npc("sold_one").person ?? ""]; if (p) resolveAct(c.s, p, "orders"); c.treat(p, "cruelty", 5, "told to act like property");
            return { text: `"Yes," she says. "I remember how." She kneels right there in the corridor and waits for orders, and her eyes are completely empty.`, next: "rival", after: 4 }; } },
      ],
    },
    rival: {
      title: (c) => `${c.n("rival_broker")} makes a move`,
      text: (c) => {
        if (c.flag("broker_fake")) return `${c.n("rival_broker")} has found out about the book. Two of ${c.his("rival_broker")} captains were arrested in Odessa on the strength of it. ${c.He("rival_broker")} sends you a photograph of your own front door, taken from a boat.`;
        if (c.flag("broker_passed")) return `${c.n("rival_broker")} brings ${c.n("sold_one")} to a party on the concourse, in a leash and very little else, and makes sure you're there to see it. "Your old stock," ${c.he("rival_broker")} says, to the room. "Holding up well, isn't she?"`;
        return `Your suppliers start calling back late. Then not at all. ${c.n("rival_broker")} has been buying up every captain who used to sell to you, at a loss, just so you can't.`;
      },
      options: [
        { id: "buy", label: (c) => `Buy her from ${c.him("rival_broker")}, whatever it costs`, show: (c) => !!c.flag("broker_passed"), note: "¤20,000", need: cash(20000),
          run: (c) => { c.cash(-20000); const p = c.addSlave({ seed: "sold_one2", name: c.full("sold_one"), age: 34, quality: 0.1, how: "sold by you, bought by your rival, bought back by you", hostile: true }); c.npc("sold_one").person = p.id; c.like("rival_broker", -10);
            return { text: `${c.n("rival_broker")} names a ridiculous price and you pay it on the spot, in front of everyone. ${c.n("sold_one")} unclips her own leash and hands it to ${c.him("rival_broker")} on the way past.`, end: "you bought back the woman you sold, twice" }; } },
        { id: "war", label: (c) => `Undercut ${c.him("rival_broker")} everywhere, at a loss`, note: "−¤15,000", need: cash(15000),
          run: (c) => { c.cash(-15000); c.like("rival_broker", -25); c.npc("rival_broker").status = "gone"; c.rep(200);
            return { text: `You still know everyone ${c.he("rival_broker")} knows, and they still like you better. It costs you a quarter's profit. By the end of it ${c.n("rival_broker")} is shipping to Ardent and nowhere else, and complaining about you to anyone who'll listen.`, end: "you drove your rival out of the trade" }; } },
        { id: "peace", label: (c) => `Meet ${c.him("rival_broker")} and make peace`, need: skill("trading", 40),
          run: (c) => { c.like("rival_broker", 30); c.set("broker_partner", true);
            return { text: `You meet on a boat, on neutral ground. By the second bottle you've divided up the Gulf trade between you.`, end: "you made peace with your rival" }; } },
        { id: "sink", label: (c) => `Have ${c.his("rival_broker")} boat meet an accident`, need: (c) => (c.s.arcology.security >= 50 ? null : "needs security 50"),
          run: (c) => { c.npc("rival_broker").status = "dead"; c.crime(5);
            return { text: `The boat doesn't come back from Ardent. There's a small paragraph in the shipping news. Your suppliers start calling back on time.`, end: "your rival didn't come back from Ardent" }; } },
      ],
    },
  },
};

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * THE INVESTOR — the board
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

function target(c: Ctx, q: number): number {
  const base = Number(c.flag("inv_base") ?? 150000);
  const bold = c.flag("inv_bold") ? 1.3 : 1;
  return Math.round(base * (0.55 + q * 0.2) * bold);
}

function q2hit(c: Ctx): boolean {
  const t = target(c, 2);
  return c.s.arcology.cash >= t || (c.npc("chair").disposition >= 30 && c.s.arcology.cash >= t * 0.8);
}

const investor: ArcDef = {
  id: "investor", title: "The Board", kind: "origin", origin: "investor",
  cast: ["chair"],
  start: "call",
  beats: {
    call: {
      title: "The first call",
      text: (c) => `The fund's chair, ${c.full("chair")}, calls you on video.

"We don't need you to be good at this," ${c.n("chair")} says. "We need the building worth more in a year than it is today. Quarterly reviews. Hit the number and you'll be very comfortable. Miss it twice and we'll send someone who won't."

"Questions?"`,
      options: [
        { id: "double", label: "\"I'll beat the numbers by a third.\"", note: "harder targets; bigger reward",
          run: (c) => { c.set("inv_base", c.s.arcology.cash); c.set("inv_bold", true); c.like("chair", 15);
            return { text: `${c.n("chair")} is impressed. "Then we'll hold you to it." The call ends. Your targets have gone up.`, next: "q1", after: 13 }; } },
        { id: "fine", label: "\"Understood.\"",
          run: (c) => { c.set("inv_base", c.s.arcology.cash);
            return { text: `"Good." The call ends. Your first review is in thirteen weeks.`, next: "q1", after: 13 }; } },
        { id: "back", label: "\"Then leave me alone to do it.\"",
          run: (c) => { c.set("inv_base", c.s.arcology.cash); c.like("chair", -10);
            return { text: `${c.n("chair")} smiles. "Of course." That afternoon a junior analyst starts emailing you every day with questions about the laundry budget.`, next: "q1", after: 13 }; } },
      ],
    },
    q1: {
      title: "First quarterly review",
      text: (c) => {
        const t = target(c, 1);
        const hit = c.s.arcology.cash >= t;
        return `The review is at nine. You have ${money(c.s.arcology.cash)} on the books against a target of ${money(t)}.

${hit ? `${c.n("chair")} looks through the figures and nods. "Good work."` : `${c.n("chair")} scrolls through the figures in silence. "You're short," ${c.he("chair")} says. "I'd like to hear why."`}`;
      },
      options: [
        { id: "ok", label: "Take the praise", show: (c) => c.s.arcology.cash >= target(c, 1),
          run: (c) => { c.like("chair", 10); c.cash(10000); c.set("inv_hits", 1);
            return { text: `The fund wires a performance bonus. ${c.n("chair")} asks to visit in the spring.`, next: "visit", after: 6 }; } },
        { id: "cook", label: "Fix the numbers before the call", show: (c) => c.s.arcology.cash < target(c, 1), need: skill("hacking", 30),
          run: (c) => { c.set("inv_cooked", true); c.set("inv_hits", 1);
            return { text: `By nine the numbers say what they need to say. ${c.n("chair")} is satisfied. If the fund's auditors ever look closely, they'll find what you did.`, next: "visit", after: 6 }; } },
        { id: "sell", label: "Sell someone before the call to make the number", show: (c) => c.s.arcology.cash < target(c, 1),
          pick: { label: "Who you sell", filter: () => true },
          run: (c, p) => { if (!p) return { text: "" }; const v = Math.round(valuePerson(c.s, p)); c.remove(p, "sold", "sold to make a quarterly number", v); c.hope(-5);
            const hit = c.s.arcology.cash >= target(c, 1); c.set("inv_hits", hit ? 1 : 0);
            return { text: `${p.name} is on a transport by eight. At nine, you ${hit ? "make the number" : "are still short, but closer"}. ${c.n("chair")} doesn't ask how.`, next: "visit", after: 6 }; } },
        { id: "short", label: "Explain, honestly", show: (c) => c.s.arcology.cash < target(c, 1),
          run: (c) => { c.set("inv_hits", 0); c.like("chair", -5);
            return { text: `${c.n("chair")} listens. "One miss," ${c.he("chair")} says. "Everyone gets one." Miss twice and you're out.`, next: "visit", after: 6 }; } },
      ],
    },
    visit: {
      title: (c) => `${c.n("chair")} comes to see the building`,
      text: (c) => `${c.full("chair")} arrives in person. ${c.He("chair")} wants to see everything: the brothel, the kitchens, the dormitories, the books. ${c.He("chair")} asks the Madam three questions you didn't know the answers to.

At the end of the day, in the penthouse, ${c.he("chair")} takes ${c.his("chair")} shoes off and eyes up your slaves.`,
      options: [
        { id: "offer", label: "Offer one of them for the night",
          pick: { label: "Who stays with the chair", filter: (p) => p.age >= 18 },
          run: (c, p) => { if (!p) return { text: "" }; resolveAct(c.s, p, "oral"); c.treat(p, "coercion", 3, `given to the fund's chair for a night`); c.like("chair", 25);
            return { text: `${p.name} goes with ${c.n("chair")} to the guest suite. ${c.n("chair")} uses her all night. In the morning ${c.n("chair")} is in an excellent mood and ${p.name} is exhausted. The next review will probably be generous.`, next: "q2", after: 7 }; } },
        { id: "dinner", label: "Take them to dinner and talk shop",
          run: (c) => { c.like("chair", 10); c.cash(-2000);
            return { text: `You talk about occupancy rates and food imports until midnight. ${c.n("chair")} is better at this than you and doesn't hide it, and at the end ${c.he("chair")} gives you three ideas that are actually good.`, next: "q2", after: 7 }; } },
        { id: "cold", label: "Keep it professional and send them to their hotel",
          run: (c) => { c.like("chair", -5);
            return { text: `${c.n("chair")} is clearly disappointed.`, next: "q2", after: 7 }; } },
      ],
    },
    q2: {
      title: "Second quarterly review",
      text: (c) => {
        const t = target(c, 2);
        const hit = q2hit(c);
        return `${money(c.s.arcology.cash)} against ${money(t)}.${c.flag("inv_cooked") ? " The fund's auditors have been in the systems since Monday." : ""}

${hit ? `"Good," ${c.n("chair")} says. "Better than good. The board wants to talk about the future."` : c.flag("inv_hits") === 0 ? `"That's twice," ${c.n("chair")} says. "I'm sorry. I really am. Someone will be there on Friday to take over."` : `"You're short," ${c.n("chair")} says. "Again, if we're honest about the first one."`}`;
      },
      options: [
        { id: "future", label: "Hear them out", show: (c) => !!q2hit(c),
          run: (c) => { c.cash(25000); c.like("chair", 15);
            return { text: `The board offers you a stake: ten percent of whatever the building's worth in five years, on top of salary. ${c.n("chair")} is smiling. You sign.`, next: "final", after: 12 }; } },
        { id: "buyout", label: "Buy the fund out", note: "¤250,000", need: cash(250000),
          run: (c) => { c.cash(-250000); c.s.arcology.ownership = Math.min(100, c.s.arcology.ownership + 30); c.npc("chair").status = "gone"; c.out.push("+30% ownership");
            return { text: `${c.n("chair")} is surprised. The fund sells, and the arcology is yours.`, end: "you bought the building out from under the fund" }; } },
        { id: "fight", label: "Refuse to hand over and dare them to remove you", show: (c) => !q2hit(c), need: (c) => (c.s.arcology.security >= 50 ? null : "needs security 50"),
          run: (c) => { c.npc("chair").disposition = -60; c.rep(-200); c.standing(1); c.set("inv_seized", true);
            return { text: `The replacement arrives on Friday with two lawyers and is met at the lift by your guards. They go back down. The fund can sue you, but your arcology doesn't recognize their courts. Your citizens love the drama.`, end: "you seized the building from the fund that owned it" }; } },
        { id: "go", label: "Go quietly", show: (c) => !q2hit(c), note: "you stay as the owner's manager; the fund takes a cut",
          run: (c) => { c.s.arcology.ownership = Math.max(1, c.s.arcology.ownership - 15); c.out.push("−15% ownership"); c.like("chair", 10);
            return { text: `The replacement turns out to be a nervous man called Gerald who knows nothing about slaves. Within a month he's asking you to run it for him. You do, for a smaller cut than before.`, end: "the fund took more of the building, and you run it for them" }; } },
      ],
    },
    final: {
      title: "The annual meeting",
      text: (c) => `A year in. The building is worth ${money(c.s.arcology.cash + c.s.arcology.prosperity * 1000)} by the fund's arithmetic. ${c.n("chair")} flies in for the meeting and takes you aside afterwards.

"I'm leaving the fund," ${c.he("chair")} says. "Starting my own. I want you with me, or I want you to stay here and be my competition. Either's fine. I just want to know which."`,
      options: [
        { id: "with", label: "Go in with them", run: (c) => { c.like("chair", 25); c.set("inv_partner", true); c.cash(30000);
          return { text: `You shake on it in the lift. ${c.n("chair")}'s new fund puts money into ${c.arcology} within the month, on better terms than the old one ever did.`, end: "you went into business with the chair" }; } },
        { id: "rival", label: "\"Competition, then.\"", run: (c) => { c.like("chair", -5); c.rep(200);
          return { text: `${c.n("chair")} laughs, genuinely. "Good. I'd have been disappointed."`, end: "you and the chair are rivals now" }; } },
      ],
    },
  },
};

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * THE PRODIGAL — blood
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

function theirs(c: Ctx): number {
  return Math.round(Number(c.flag("prod_start") ?? worth(c.s)) * (c.flag("prod_sabotage") ? 1.05 : 1.25));
}
function won(c: Ctx): boolean { return worth(c.s) >= theirs(c); }

function worth(s: SaveState): number {
  return Math.round(s.arcology.cash + s.arcology.prosperity * 1500 + s.arcology.rep * 20 + ownedAdults(s).reduce((n, p) => n + valuePerson(s, p), 0));
}

const prodigal: ArcDef = {
  id: "prodigal", title: "Blood", kind: "origin", origin: "prodigal",
  cast: ["sibling"],
  subject: (s) => closest(s),
  start: "visit", delay: 2,
  beats: {
    visit: {
      title: (c) => `${c.n("sibling")} visits`,
      text: (c) => `${c.full("sibling")} arrives without calling, the way ${c.he("sibling")} always has, with luggage for a week and a smile for the staff.

"Mother sent me to see how you're getting on," ${c.he("sibling")} says, walking straight past you into the penthouse. "I told her you'd have burned it down by now. Don't make me a liar."

${c.He("sibling")} eyes up your slaves the way ${c.he("sibling")} used to eye your toys when you were kids.`,
      options: [
        { id: "party", label: "Throw a party in their honour", note: "¤8,000", need: cash(8000),
          run: (c) => { c.cash(-8000); c.rep(300); c.like("sibling", 5); c.set("prod_party", true);
            return { text: `Half the Association comes. ${c.n("sibling")} is charming to everyone and tells three of them stories about you as a child that are true and humiliating. The papers call it the party of the season, and Mother hears about it by morning.`, next: "letter", after: 4 }; } },
        { id: "gift", label: "Give them one of your women for the week",
          pick: { label: `Who stays with your sibling`, filter: (p) => p.age >= 18 },
          run: (c, p) => { if (!p) return { text: "" }; c.like("sibling", 20); c.treat(p, "coercion", 4, "lent to the owner's sibling for a week"); c.set("prod_lent", p.id);
            return { text: `${c.n("sibling")} is delighted, and fucks her every night. ${p.name} comes back at the end of the week with a new bracelet and won't talk about it.`, next: "letter", after: 4 }; } },
        { id: "show", label: "Show them how the place actually runs",
          run: (c) => { c.like("sibling", -5); c.set("prod_shown", true);
            return { text: `You walk ${c.n("sibling")} through the books, the facilities, the dormitories. ${c.He("sibling")} gets bored in the first hour and asks sharper questions in the second, and by the end you've taught your sibling exactly how your building makes money.`, next: "letter", after: 4 }; } },
        { id: "out", label: "\"Go home. Tell Mother I'm fine.\"",
          run: (c) => { c.like("sibling", -15);
            return { text: `${c.n("sibling")} laughs and stays for a week anyway, in a hotel on the concourse, and sends Mother a photograph of your lobby every day with a different unflattering caption.`, next: "letter", after: 4 }; } },
      ],
    },
    letter: {
      title: "A letter from your mother",
      text: (c) => `It's on the heavy cream paper with the crest. Your mother has never sent you an email in her life.

*I am not well, whatever your sibling has told you. When I go, the coast goes to whichever of you has built more by the end of next year. I will not divide it. I did not raise you to share.*

It's signed with her full name.`,
      options: [
        { id: "race", label: "Accept. You'll beat them.", run: (c) => { c.set("prod_race", true); c.set("prod_start", worth(c.s)); c.like("sibling", -10);
          return { text: `You write back one line: *Understood.* That evening ${c.n("sibling")} calls, laughing. "You know you're going to lose," ${c.he("sibling")} says, and hangs up before you can answer.`, next: "move", after: 8 }; } },
        { id: "ally", label: "Propose to your sibling that you split it", need: skill("trading", 25), run: (c) => { c.set("prod_ally", true); c.like("sibling", 20);
          return { text: `${c.n("sibling")} thinks about it. "She'll hate that," ${c.he("sibling")} says. "All right." For the first time since you were kids, you're on the same side.`, next: "move", after: 8 }; } },
        { id: "refuse", label: "Write back that you don't want it", run: (c) => { c.set("prod_refused", true); c.rep(100);
          return { text: `*Keep it,* you write. *I have a city.* You post it before you can change your mind. ${c.n("sibling")} sends you flowers, just to rub it in.`, next: "move", after: 8 }; } },
      ],
    },
    move: {
      title: (c) => `${c.n("sibling")} makes a move`,
      text: (c) => c.flag("prod_ally")
        ? `${c.n("sibling")} calls. "Mother's changed the will," ${c.he("sibling")} says. "Everything to whichever of us breaks the alliance first. She thinks one of us will." There's a pause. "I want you to know I thought about it."`
        : `${c.subj?.name ?? "One of your women"} brings you a note she found under her pillow. It's from ${c.n("sibling")}, in ${c.his("sibling")} looping hand: an offer of freedom, a flat in the family's city, and a monthly allowance — if she walks out of your building and tells the papers what goes on in it.

She could have taken the offer, but she brought it to you instead.`,
      options: [
        { id: "reward", label: "Reward her for bringing it to you", show: (c) => !c.flag("prod_ally"),
          run: (c) => { c.treat(c.subj, "recognition", 8, "she brought you your sibling's note instead of taking the offer"); c.set("prod_loyal", true);
            return { text: `You ask her what she wants. She asks for a window. You give her a room with one, facing the sea, and she's delighted.`, next: "will", after: 10 }; } },
        { id: "freeher", label: "Let her take the offer, if she wants it", show: (c) => !c.flag("prod_ally"),
          run: (c) => { const stays = c.subj ? read(c.subj).devotion > 35 : false;
            if (stays) { c.treat(c.subj, "promise_kept", 8, "offered freedom, and stayed"); c.hope(5); return { text: `She reads the note again and puts it in the fire. "I don't want ${c.his("sibling")} flat," she says. "I want to stay here."`, next: "will", after: 10 }; }
            if (c.subj) c.remove(c.subj, "free", `walked out on your sibling's offer`); c.rep(-300);
            return { text: `She goes. A week later she's on a Kestrel news programme, talking. ${c.n("sibling")} sends you a clipping.`, next: "will", after: 10 }; } },
        { id: "back", label: "Return the favour: bribe their household manager", need: cash(15000), show: (c) => !c.flag("prod_ally"),
          run: (c) => { c.cash(-15000); c.like("sibling", -20); c.set("prod_sabotage", true);
            return { text: `${c.n("sibling")}'s manager starts sending you the weekly accounts. You have your sibling's whole operation on your desk every Monday. It's weaker than you thought.`, next: "will", after: 10 }; } },
        { id: "trust", label: "\"I thought about it too.\"", show: (c) => !!c.flag("prod_ally"),
          run: (c) => { c.like("sibling", 15);
            return { text: `${c.n("sibling")} laughs. "Good," ${c.he("sibling")} says. "Then neither of us is stupid." You hang up still allies.`, next: "will", after: 10 }; } },
        { id: "betray", label: "Break the alliance first", show: (c) => !!c.flag("prod_ally"),
          run: (c) => { c.like("sibling", -50); c.set("prod_betrayed", true); c.set("prod_race", true); c.set("prod_start", worth(c.s) - 50000);
            return { text: `You call your mother's lawyer that afternoon. By evening ${c.n("sibling")} knows, and ${c.he("sibling")} never speaks to you again.`, next: "will", after: 10 }; } },
      ],
    },
    will: {
      title: "Your mother's funeral",
      text: (c) => {
        const mine = worth(c.s);
        return `It rains at the funeral. A hundred people come, mostly for the will.

The lawyer reads it in the library afterwards. Your holding is valued at ${money(mine)}. ${c.n("sibling")}'s at ${money(theirs(c))}.${c.flag("prod_ally") && !c.flag("prod_betrayed") ? " Neither of you broke the alliance. The lawyer reads that clause twice." : ""}`;
      },
      options: [
        { id: "win", label: "Take what's yours", show: (c) => !!won(c) && !c.flag("prod_ally") || !!c.flag("prod_betrayed") && !!won(c),
          run: (c) => { c.cash(200000); c.rep(1000); c.like("sibling", -30); c.npc("sibling").status = "gone";
            return { text: `The coast is yours. ${c.n("sibling")} storms out of the library.`, end: "you inherited the coast" }; } },
        { id: "split", label: "Split it, as agreed", show: (c) => !!c.flag("prod_ally") && !c.flag("prod_betrayed"),
          run: (c) => { c.cash(100000); c.rep(600); c.like("sibling", 20); c.npc("sibling").status = "ally";
            return { text: `You split it down the middle, the way she said she never would. Afterwards you and ${c.n("sibling")} get drunk in the kitchens like you used to when you were kids.`, end: "you and your sibling split the inheritance" }; } },
        { id: "lose", label: "Congratulate them", show: (c) => !won(c) && !(c.flag("prod_ally") && !c.flag("prod_betrayed")),
          run: (c) => { c.like("sibling", 15); c.rep(-200);
            return { text: `You shake ${c.n("sibling")}'s hand in front of everyone. "You did better than I thought you would," ${c.he("sibling")} says smugly.`, end: "your sibling inherited the coast" }; } },
        { id: "gave", label: "You already said you didn't want it", show: (c) => !!c.flag("prod_refused"),
          run: (c) => { c.like("sibling", 25); c.rep(200);
            return { text: `The lawyer reads your letter aloud. There's a murmur. ${c.n("sibling")} is stunned.`, end: "you gave up the coast for your city" }; } },
      ],
    },
  },
};

export const ORIGIN_ARCS: ArcDef[] = [heir, raider, climber, broker, investor, prodigal];

/** Helper for tests and the start screen. */
export function isPerson(x: unknown): x is Person { return !!x && typeof x === "object" && "psyche" in (x as object); }
export { mostValuable };
