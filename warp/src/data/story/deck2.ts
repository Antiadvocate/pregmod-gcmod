/**
 * THE DECK, CONTINUED — more that can happen to anyone who owns a building like yours.
 */
import type { ArcDef, Ctx } from "../../engine/story";
import { ownedAdults, closest } from "../../engine/story";
import { valuePerson } from "../../engine/economy";
import { read } from "../../engine/obedience";
import { resolveAct } from "../../engine/intimacy";
import { clamp } from "../../engine/psyche";
import { rng } from "../../engine/rng";

const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;
const cash = (n: number) => (c: Ctx) => (c.s.arcology.cash >= n ? null : `needs ${money(n)}`);
const skill = (id: string, n: number) => (c: Ctx) => (c.skill(id) >= n ? null : `needs ${id} ${n}`);

/* ── the gift ───────────────────────────────────────────────────────────────────────────────── */

const gift: ArcDef = {
  id: "gift", title: "A Gift", kind: "deck",
  when: (s) => s.arcology.week >= 8 && s.arcology.rep > 600,
  start: "arrives",
  beats: {
    arrives: {
      title: "A gift from the Association",
      text: (c) => `A courier from the Owners' Association delivers a woman to your lobby in a ribboned collar, with a card: *In recognition of your contribution to the city. With the compliments of the membership committee.*

Nobody gives anybody anything in this city. She's beautiful, well trained, and very quick to learn where everything is.`,
      options: [
        { id: "keep", label: "Thank them and keep her",
          run: (c) => { const p = c.addSlave({ seed: "gift", age: 25, quality: 0.8, how: "a gift from the Owners' Association", devoted: true }); p.skills.whoring = 55; p.skills.entertainment = 60; c.set("gift_id", p.id); c.rep(150);
            return { text: `${p.name} settles in within a day. She's charming to everyone. By the end of the week she knows the name of every woman in the house and the combination to your office.`, next: "caught", after: 5 }; } },
        { id: "check", label: "Keep her, and have her watched", need: skill("hacking", 25),
          run: (c) => { const p = c.addSlave({ seed: "gift", age: 25, quality: 0.8, how: "a gift from the Owners' Association", devoted: true }); c.set("gift_id", p.id); c.set("gift_watched", true);
            return { text: `You put a tap on the dormitory network before she's unpacked. It takes three days for her to use it.`, next: "caught", after: 3 }; } },
        { id: "decline", label: "Send her back with your regrets",
          run: (c) => { c.rep(-150);
            return { text: `The courier takes her back down in the lift. The membership committee doesn't send another card.`, end: "you sent the Association's gift back" }; } },
      ],
    },
    caught: {
      title: "What the gift was for",
      text: (c) => {
        const p = c.s.people[String(c.flag("gift_id"))];
        return `${p?.name ?? "She"} has been sending the Association a weekly summary: your accounts, your household, who you meet and for how long. ${c.flag("gift_watched") ? "Your tap caught the first one before it left the building." : "You find out when a committee member mentions something at dinner that only your office knew."}`;
      },
      options: [
        { id: "turn", label: "Turn her. She reports what you tell her to.", need: (c) => { const p = c.s.people[String(c.flag("gift_id"))]; return p && read(p).trust > -20 ? null : "she'd have to trust you more"; },
          run: (c) => { const p = c.s.people[String(c.flag("gift_id"))]; c.treat(p, "recognition", 6, "turned instead of punished"); c.rep(300);
            return { text: `She listens to the offer with her hands folded. "They never asked me what I wanted either," she says. From now on the Association gets the reports you write.`, end: "you turned the Association's spy" }; } },
        { id: "punish", label: "Make an example of her",
          run: (c) => { const p = c.s.people[String(c.flag("gift_id"))]; if (p) { resolveAct(c.s, p, "discipline"); p.assignment = "be confined in the cellblock"; } c.treat(p, "cruelty", 8, "caught spying"); c.household("coercion", 2, "saw what happened to the spy");
            return { text: `She's in the cellblock by evening. You send the Association a card of your own: *Received with thanks.*`, end: "you caught the spy and kept her" }; } },
        { id: "sell", label: "Sell her back to the committee at twice her value",
          run: (c) => { const p = c.s.people[String(c.flag("gift_id"))]; if (p) c.remove(p, "sold", "sold back to the Association", Math.round(valuePerson(c.s, p) * 2)); c.rep(-100);
            return { text: `They pay, quietly. It's the most expensive gift they've ever given anyone.`, end: "you sold the gift back" }; } },
      ],
    },
  },
};

/* ── the pit ────────────────────────────────────────────────────────────────────────────────── */

function fighter(p: { skills: { combat: number }; health: { health: number }; body: { muscle: number } }): number {
  return p.skills.combat + p.health.health * 0.2 + p.body.muscle * 0.3;
}

const pit: ArcDef = {
  id: "pit", title: "The Challenge", kind: "deck",
  cast: ["rival_owner"],
  when: (s) => s.arcology.week >= 9 && ownedAdults(s).length >= 3,
  start: "insult",
  beats: {
    insult: {
      title: (c) => `${c.n("rival_owner")} wants a fight`,
      text: (c) => `${c.full("rival_owner")} owns the arcology across the strait and a pit fighter called the Widow who hasn't lost in two years.

At the Association dinner ${c.he("rival_owner")} says, loudly enough, that your household is soft, and that ${c.he("rival_owner")}'ll put ten thousand on the Widow against anyone you own. First blood, or submission. The table goes quiet waiting for you.`,
      options: [
        { id: "accept", label: "Accept, and pick your champion", note: "she fights the Widow",
          pick: { label: "Who fights — her combat training and her health decide it", filter: (p) => p.health.health > -20 },
          run: (c, p) => {
            if (!p) return { text: "" };
            const r = rng(`pit:${c.st.seed}:${p.id}`);
            const mine = fighter(p) + r.int(-15, 15);
            const won = mine > 55;
            if (won) { c.cash(10000); c.rep(700); c.like("rival_owner", -20); c.treat(p, "recognition", 8, "won in the pit"); p.fame.prestige = Math.max(p.fame.prestige, 1) as 1; p.fame.why = "beat the Widow in the pit";
              return { text: `${p.name} goes down twice in the first minute and gets up both times. In the third she catches the Widow's wrist, turns it, and the crowd hears it. It's the Widow who bleeds first. ${c.n("rival_owner")} pays in front of everyone.`, end: `${p.name} beat the Widow` }; }
            c.cash(-10000); c.rep(-300); p.health.health = clamp(p.health.health - 35, -100, 100); p.health.injuries.push({ what: "beaten in the pit", severity: "notable", week: c.week }); c.treat(p, "cruelty", 5, "sent into the pit and beaten");
            return { text: `It lasts forty seconds. ${p.name} is carried out with her arm strapped to her chest. ${c.n("rival_owner")} doesn't gloat. ${c.He("rival_owner")} doesn't have to.`, end: `${p.name} lost to the Widow` };
          } },
        { id: "buy", label: "Offer to buy the Widow instead", note: "¤30,000", need: cash(30000),
          run: (c) => { c.cash(-30000); const p = c.addSlave({ seed: "widow", age: 30, quality: 0.6, how: "the Widow, bought out from under a rival's pit" }); p.skills.combat = 85; p.body.muscle = 55; p.fame.prestige = 1; p.fame.why = "the Widow, unbeaten in the pit"; c.like("rival_owner", -10); c.rep(400);
            return { text: `There's a pause while ${c.n("rival_owner")} works out whether ${c.he("rival_owner")} can say no in front of this many people. ${c.He("rival_owner")} can't. The Widow comes home with you and stands behind your chair.`, end: "you bought the Widow" }; } },
        { id: "decline", label: "\"I don't fight my household for your entertainment.\"",
          run: (c) => { c.rep(-200); c.hope(4); c.like("rival_owner", -5);
            return { text: `Somebody laughs. Somebody else doesn't. Your household hears about it by morning, and the ones who might have been picked hear it most clearly.`, end: "you refused the pit" }; } },
      ],
    },
  },
};

function relation(c: Ctx): string {
  return rng(`oldlife:${c.st.seed}`).pick(["her husband", "the man she was going to marry", "her father", "her brother"]);
}

/* ── her old life ───────────────────────────────────────────────────────────────────────────── */

const oldlife: ArcDef = {
  id: "oldlife", title: "Her Old Life", kind: "deck",
  when: (s) => s.arcology.week >= 6 && ownedAdults(s).some((p) => p.economics.weeks_owned > 4),
  subject: (s) => ownedAdults(s).filter((p) => p.economics.weeks_owned > 4 && p.origin.acquired_how !== "born to it").sort((a, b) => b.bond.hope - a.bond.hope)[0],
  start: "man",
  beats: {
    man: {
      title: (c) => `Someone for ${c.sn}`,
      text: (c) => {
        const who = relation(c);
        return `A man in a suit that doesn't fit him is waiting in reception. He's ${c.sn}'s ${who.replace("her ", "")}, he says. He's come from ${c.subj?.origin.nationality ?? "home"} with a lawyer's letter, a cheque for eight thousand, and a photograph of her at twenty.

"I'll pay what she's worth," he says. "Whatever it is. I'll find it."

She's worth ${money(valuePerson(c.s, c.subj!))}.`;
      },
      options: [
        { id: "sell", label: "Take the eight thousand. Let her go.",
          run: (c) => { c.cash(8000); if (c.subj) c.remove(c.subj, "free", `bought free by ${relation(c)}`); c.hope(10); c.standing(1);
            return { text: `She comes down in her work clothes and sees him and stops. Then she walks past you without looking at you and into his arms. They leave together. The whole household watches from the stairs.`, end: `${c.sn} went home with ${relation(c)}` }; } },
        { id: "ask", label: "Ask her what she wants",
          run: (c) => {
            const stays = c.subj ? read(c.subj).devotion > 50 : false;
            if (stays) { c.treat(c.subj, "promise_kept", 8, "given the choice to leave, and stayed"); c.hope(5);
              return { text: `She looks at him for a long time. Then she says, very quietly, "I'm not her any more," and goes back upstairs. He leaves the photograph on the desk.`, end: `${c.sn} chose to stay` }; }
            c.cash(8000); if (c.subj) c.remove(c.subj, "free", `chose to go home with ${relation(c)}`); c.hope(8);
            return { text: `"Yes," she says, before you've finished the question. She doesn't pack. She just goes.`, end: `${c.sn} chose to go home` };
          } },
        { id: "full", label: "Full price or nothing",
          run: (c) => { c.treat(c.subj, "cruelty", 5, "he came for her and you named a price he couldn't pay");
            return { text: `He can't. He tries to argue and security walks him to the lift. ${c.sn} saw it all from the landing. She doesn't eat for two days.`, next: "back", after: 10 }; } },
        { id: "throw", label: "Have him thrown out",
          run: (c) => { c.treat(c.subj, "cruelty", 6, "the man who came for her was thrown out"); c.crime(1);
            return { text: `He's put out on the landward causeway without his letter. ${c.sn} doesn't find out until the others tell her, which is worse.`, end: `you threw out the man who came for ${c.sn}` }; } },
      ],
    },
    back: {
      title: "He came back",
      text: (c) => `He's back, with the full amount in a bag. He's sold his house. You can tell by his face that he's sold everything.`,
      options: [
        { id: "take", label: "Take it", run: (c) => { c.cash(valuePerson(c.s, c.subj!)); if (c.subj) c.remove(c.subj, "free", `bought free by ${relation(c)}, at full price`); c.hope(6);
          return { text: `She goes. He's broke, and he's smiling.`, end: `${c.sn} went home, at full price` }; } },
        { id: "no", label: "Tell him she's no longer for sale", run: (c) => { c.treat(c.subj, "cruelty", 7, "not for sale, even at full price"); c.rep(-100);
          return { text: `He stands in reception with the bag for a long time after you've gone back upstairs.`, end: `you kept ${c.sn} from the man who came for her` }; } },
      ],
    },
  },
};

/* ── the heiress ────────────────────────────────────────────────────────────────────────────── */

const heiress: ArcDef = {
  id: "heiress", title: "The Heiress", kind: "deck",
  when: (s) => s.arcology.week >= 10 && s.arcology.prosperity > 50,
  start: "debt",
  beats: {
    debt: {
      title: "A marker at the tables",
      text: (c) => `Your club manager brings you a stack of markers: twenty-two thousand, signed by the daughter of the richest citizen on your residential levels. She's twenty-four, she's been playing for three nights, and she's asked to see you.

She comes in with her chin up. "My father will pay," she says. "But if he finds out he'll cut me off. So I'm offering you something else. A year. On the books. As whatever you like."`,
      options: [
        { id: "take", label: "Take the year", note: "she's yours for 52 weeks, then free",
          run: (c) => { const p = c.addSlave({ seed: "heiress", age: 24, quality: 0.7, how: "signed herself over for a year against gambling debts" }); p.status = "indentured"; p.indenture_weeks = 52; p.bond = { ...p.bond, bond: 0, fear: 10, resentment: 15, hope: 60 }; c.set("heiress", p.id);
            return { text: `She signs the indenture without reading it and hands you back the pen. "What happens now?" she asks, and for the first time she sounds her age.`, next: "father", after: 6 }; } },
        { id: "father", label: "Send the markers to her father",
          run: (c) => { c.cash(22000); c.prosperity(1);
            return { text: `Her father pays within the hour and sends a note thanking you for your discretion. She's on a flight to boarding school in Switzerland by the weekend.`, end: "you called in the heiress's debt from her father" }; } },
        { id: "forgive", label: "Tear the markers up",
          run: (c) => { c.standing(1); c.rep(100);
            return { text: `She stares at the pieces. "Why?" You don't answer. Her father sends you a case of something very old a month later, which means she told him anyway.`, end: "you forgave the heiress's debt" }; } },
      ],
    },
    father: {
      title: "Her father finds out",
      text: (c) => {
        const p = c.s.people[String(c.flag("heiress"))];
        return `Her father arrives with two lawyers and the full twenty-two thousand in cash. He hasn't slept. ${p ? `${p.name} is ${read(p).devotion > 30 ? "at your side when he comes in, and doesn't move away" : "on the stairs, and won't come down"}.` : ""}`;
      },
      options: [
        { id: "release", label: "Take his money and release her",
          run: (c) => { const p = c.s.people[String(c.flag("heiress"))]; c.cash(22000); if (p) c.remove(p, "free", "bought out of her indenture by her father");
            return { text: `She goes home with him. She doesn't look back until the lift, and then she does.`, end: "her father bought her out" }; } },
        { id: "keep", label: "\"A contract is a contract.\"",
          run: (c) => { c.rep(200); c.prosperity(-3); const p = c.s.people[String(c.flag("heiress"))]; c.treat(p, "coercion", 3, "held to the contract");
            return { text: `The lawyers read the indenture twice and can't find a hole in it. He leaves without her. His business moves off your residential levels by the end of the month.`, end: "you held the heiress to her year" }; } },
        { id: "her", label: "Let her decide", show: (c) => !!c.s.people[String(c.flag("heiress"))],
          run: (c) => { const p = c.s.people[String(c.flag("heiress"))]!;
            if (read(p).devotion > 30) { c.treat(p, "promise_kept", 6, "chose to finish the year"); return { text: `"I'm staying," she says. "I signed it." Her father looks at her like he's never met her.`, end: "the heiress chose to stay" }; }
            c.cash(22000); c.remove(p, "free", "chose to go home with her father");
            return { text: `She's down the stairs before you've finished the sentence.`, end: "the heiress went home" }; } },
      ],
    },
  },
};

/* ── twins ──────────────────────────────────────────────────────────────────────────────────── */

const twins: ArcDef = {
  id: "twins", title: "Twins", kind: "deck",
  when: (s) => s.arcology.week >= 5 && s.arcology.cash > 15000,
  start: "lot",
  beats: {
    lot: {
      title: "Two lots, one face",
      text: (c) => `The broker has twins, twenty, identical except that one of them won't look up. He's selling them separately because separately is worth more, and a buyer from Ardent is already interested in one.

"Nine thousand each," he says. "Or eighteen for the pair, as a favour."`,
      options: [
        { id: "both", label: "Buy both", note: "¤18,000", need: cash(18000),
          run: (c) => { c.cash(-18000);
            const a = c.addSlave({ seed: "twinA", age: 20, quality: 0.5, how: "bought as one of a pair of twins" });
            const b = c.addSlave({ seed: "twinB", age: 20, quality: 0.5, how: "bought as one of a pair of twins" });
            Object.assign(b.body, { ...a.body, marks: [] }); b.origin.nationality = a.origin.nationality; b.origin.race = a.origin.race;
            b.surname = a.surname;
            c.s.edges.push({ from: a.id, to: b.id, warmth: 90, trust: 85, attraction: 0, power: 0, roles: ["twin"], weeks_known: 1040 }, { from: b.id, to: a.id, warmth: 90, trust: 85, attraction: 0, power: 0, roles: ["twin"], weeks_known: 1040 });
            c.treat(a, "kindness", 6, "bought together with her twin"); c.treat(b, "kindness", 6, "bought together with her twin"); c.set("twins", `${a.id},${b.id}`);
            return { text: `${a.name} and ${b.name}. They hold hands in the lift and don't let go until they're shown the dormitory, and then they push their beds together without asking.`, next: "sick", after: 8 }; } },
        { id: "one", label: "Buy one", note: "¤9,000", need: cash(9000),
          run: (c) => { c.cash(-9000); const a = c.addSlave({ seed: "twinA", age: 20, quality: 0.5, how: "bought away from her twin, who went to Ardent", hostile: true }); c.treat(a, "cruelty", 5, "separated from her twin");
            return { text: `${a.name} screams when they separate them. The other one goes to Ardent. ${a.name} asks you every night for a week where her sister is, and then stops asking.`, end: "you split the twins" }; } },
        { id: "pass", label: "Pass", run: () => ({ text: `Ardent buys both.`, end: "you passed on the twins" }) },
      ],
    },
    sick: {
      title: "One of the twins",
      text: (c) => {
        const [a, b] = String(c.flag("twins")).split(",").map((id) => c.s.people[id]);
        return `${b?.name ?? "One of them"} is sick — a fever that's gone into her chest — and ${a?.name ?? "her sister"} has been sleeping on the floor of the spa next to her for three nights. She asks to see you. She's never asked for anything.

"Whatever it costs," she says. "Take it out of me."`;
      },
      options: [
        { id: "treat", label: "Pay for the clinic", note: "¤6,000", need: cash(6000),
          run: (c) => { c.cash(-6000); const [a, b] = String(c.flag("twins")).split(",").map((id) => c.s.people[id]); if (b) { b.health.illness = 0; b.health.health = clamp(b.health.health + 30, -100, 100); } c.treat(a, "promise_kept", 8, "you paid to save her sister"); c.treat(b, "kindness", 6, "you paid for the clinic");
            return { text: `The fever breaks on the fourth day. The next morning both of them are at your door with your coffee, and neither of them says why.`, end: "you saved one twin for the other" }; } },
        { id: "take", label: "\"I'll take it out of you, then.\"",
          run: (c) => { c.cash(-6000); const [a, b] = String(c.flag("twins")).split(",").map((id) => c.s.people[id]); if (b) { b.health.illness = 0; b.health.health = clamp(b.health.health + 30, -100, 100); } if (a) resolveAct(c.s, a, "orders"); c.treat(a, "coercion", 5, "paid for her sister's treatment with herself");
            return { text: `She pays it. Her sister gets better. Neither of them talks about the price, but the one who paid it looks at you differently now.`, end: "one twin paid for the other" }; } },
        { id: "wait", label: "Let it run its course",
          run: (c) => { const [a, b] = String(c.flag("twins")).split(",").map((id) => c.s.people[id]); if (b) b.health.health = clamp(b.health.health - 25, -100, 100); c.treat(a, "cruelty", 6, "you let her sister stay sick");
            return { text: `She pulls through, barely, after two weeks. Her sister never asks you for anything again.`, end: "you let the twin's fever run" }; } },
      ],
    },
  },
};

export const DECK2_ARCS: ArcDef[] = [gift, pit, oldlife, heiress, twins];

export { closest };
