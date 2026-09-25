/**
 * THE MAIN PLOT — the original game's week-by-week chain, adapted.
 *
 * The original ran a fixed sequence from the arcology's first months to a coup in week 71: the
 * strip club closing, the shooting contest, the slave food scandal, the militia, the mercenaries,
 * the invasion and the raid, the Daughters of Liberty, the bombing, the knights, the collaborator,
 * the hacker, and the coup, whose outcome was decided by what you had built up in the weeks before
 * without being told it was the test. This keeps that shape: every chapter opens on its week, and
 * the coup reads the flags the earlier chapters set.
 *
 * Flags the coup reads: plot_militia, plot_drones, plot_mercs, plot_knights, plot_hacker,
 * plot_double (a double agent inside the Daughters), plot_bodyguard_hero, plot_food_concealed.
 */
import type { ArcDef, Ctx } from "../../engine/story";
import { ownedAdults, mostValuable, mostResentful } from "../../engine/story";
import { read } from "../../engine/obedience";
import { clamp } from "../../engine/psyche";

const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;
const cash = (n: number) => (c: Ctx) => (c.s.arcology.cash >= n ? null : `needs ${money(n)}`);
const pop = (c: Ctx, n: number) => {
  c.s.arcology.population = Math.max(200, Math.round(c.s.arcology.population + n));
  c.out.push(`${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n)).toLocaleString()} citizens`);
};
const has = (c: Ctx, k: string) => !!c.flag(k);
/** The best fighter in the house, for the chapters that need one. */
const fighter = (c: Ctx) => ownedAdults(c.s).sort((a, b) => b.skills.combat - a.skills.combat)[0];
const most = (c: Ctx) => ownedAdults(c.s).sort((a, b) => read(b).devotion - read(a).devotion)[0];

/** Your strength when someone finally comes for the arcology. */
export function defenseScore(c: Ctx): number {
  let n = 0;
  if (has(c, "plot_militia")) n += 1;
  if (has(c, "plot_drones")) n += 1;
  if (has(c, "plot_mercs")) n += 2;
  if (has(c, "plot_knights")) n += 1;
  if (has(c, "plot_hacker")) n += 1;
  if (has(c, "plot_quartered")) n += 0.5;
  n += c.s.arcology.security / 40;
  return n;
}

/* ── week 6 and 8: the strip club ───────────────────────────────────────────────────────────── */

const club: ArcDef = {
  id: "p_club", title: "The Club on the Promenade", kind: "plot", at: 6,
  start: "closing",
  beats: {
    closing: {
      title: "The strip club is closing",
      text: (c) => `There's been a strip club on the promenade since before you owned ${c.arcology}: free women dancing for tips, a bar, a bouncer at the door. It can't compete any more. Slave-staffed clubs don't pay wages, and the girls in them do a lot more than dance. The owner is closing at the end of the week.

Eleven dancers are about to be out of work. Most of them have rent due on apartments in your arcology, and nothing saved. A couple of them have come up to the penthouse to ask what you're going to do about it, since it's your arcology and it was your market that did this to them.`,
      options: [
        { id: "hire", label: "Take them on as paid staff in your own businesses", note: "¤3,000 a week for a while",
          need: cash(6000),
          run: (c) => { c.cash(-6000); c.prosperity(2); c.standing(1); c.set("club_hired", true);
            return { text: `You find places for them: waiting tables in the penthouse, hostessing at your events, three of them dancing in your own club alongside the slaves. They're paid, and they keep their apartments.

The citizens on the promenade notice that you looked after them.`, next: "aftermath", after: 2 }; } },
        { id: "severance", label: "Pay each of them a severance out of your own pocket", note: "¤4,000",
          need: cash(4000),
          run: (c) => { c.cash(-4000); c.standing(1); c.set("club_severance", true);
            return { text: `You have your assistant hand each of the eleven dancers an envelope. It's enough for two months' rent. Some of them cry. One of them tells you it won't be enough, and she's probably right.`, next: "aftermath", after: 2 }; } },
        { id: "own", label: "Lend them the money to set up on their own", note: "¤5,000, paid back later if it works",
          need: cash(5000),
          run: (c) => { c.cash(-5000); c.set("club_parlor", true); c.prosperity(1);
            return { text: `You lend them enough to take over the lease themselves and turn the place into something they can run: a massage parlor, they decide, since that's what the customers were paying for half the time anyway.`, next: "aftermath", after: 2 }; } },
        { id: "nothing", label: "It's the market; they'll find something",
          run: (c) => { c.set("club_nothing", true); c.standing(-1);
            return { text: `You tell them it's the market and it isn't your problem. They go back down in the elevator without saying anything else.`, next: "aftermath", after: 2 }; } },
      ],
    },
    aftermath: {
      title: "One of the dancers",
      text: (c) => `${has(c, "club_parlor") ? "The massage parlor on the promenade is doing fine; the dancers who run it have already paid back a third of your loan." : has(c, "club_hired") ? "Most of the dancers you took on are still working for you." : "Most of the dancers have left the arcology."}

One of them hasn't. Her name is Kira. She was the youngest of them, and she comes up to the penthouse on her own, in her one good dress, and asks to see you.

"I can't make rent," she says. "I've tried everything. I know what happens to people who can't pay here, and I'd rather it was you than the debt collectors." She takes a breath. "I want you to enslave me. Please. I'll dance for you. I'll do anything the girls in the new clubs do."`,
      options: [
        { id: "enslave", label: "Enslave her",
          run: (c) => { const p = c.addSlave({ seed: "kira", name: "Kira", age: 19, quality: 0.5, how: "a dancer from the old strip club who begged you to enslave her when she couldn't make rent", devoted: true });
            p.skills.entertainment = Math.max(p.skills.entertainment, 55);
            return { text: `You have the papers drawn up while she waits. She signs them with her hand shaking, and then she stands up, takes her dress off, and folds it neatly on the chair, because she knows she won't be wearing it again.

"Where do you want me?" she asks.`, end: "you took in a dancer who begged to be enslaved" }; } },
        { id: "rent", label: "Pay her rent and send her home", note: "¤1,500", need: cash(1500),
          run: (c) => { c.cash(-1500); c.standing(1);
            return { text: `You pay her rent for three months and tell her to go and find a job. She looks at you as though she doesn't understand, then thanks you three times on the way out.`, end: "you paid a dancer's rent instead of enslaving her" }; } },
        { id: "refuse", label: "Send her away",
          run: (c) => ({ text: `You tell her no. Two weeks later your records show she was enslaved for debt anyway, and sold at the Grand Exchange to a buyer from out of town.`, end: "you turned away a dancer who asked to be enslaved" }) },
      ],
    },
  },
};

/* ── week 17: the shooting contest ──────────────────────────────────────────────────────────── */

const shoot: ArcDef = {
  id: "p_shoot", title: "The Invitation", kind: "plot", at: 17,
  start: "invite",
  beats: {
    invite: {
      title: "An invitation to shoot",
      text: (c) => `A card arrives on heavy paper. A group of Free City owners holds a private marksmanship contest every year on an old military range up the coast, and you're invited. It's not about the shooting. Everyone there owns an arcology, and this is where they decide who they'll do business with.

Guests may bring one slave to shoot for them, if they'd rather not handle a rifle themselves.`,
      options: [
        { id: "shoot", label: "Go, and shoot yourself",
          run: (c) => { const won = c.skill("warfare") >= 30 || c.s.arcology.security > 55;
            c.set("plot_shoot", won ? "won" : "lost"); c.rep(won ? 700 : 200);
            return { text: won ? `You shoot well. By the last round it's between you and a woman who owns three arcologies in the Gulf, and you beat her by one ring. Afterwards half the owners there want to talk to you.` : `You shoot badly, and everyone sees it. But you came, and you shook the right hands in the clubhouse afterwards, which was the point.`, end: won ? "you won the owners' shooting contest" : "you went to the owners' shooting contest" }; } },
        { id: "slave", label: "Bring a slave to shoot for you",
          pick: { label: "Who shoots", filter: (p) => p.health.recovery_weeks <= 0 },
          run: (c, p) => { if (!p) return { text: "" }; const good = p.skills.combat >= 35;
            if (good) { c.rep(900); c.treat(p, "recognition", 7, "won the owners' shooting contest for you"); p.fame.prestige = Math.max(p.fame.prestige, 1) as 1; p.fame.why = "won the owners' shooting contest"; c.set("plot_shoot", "won"); c.set("plot_bodyguard", p.id); }
            else { c.rep(-100); c.treat(p, "cruelty", 2, "embarrassed at the owners' shooting contest"); }
            return { text: good ? `${p.name} shoots in a borrowed jacket and nothing else, barefoot on the firing line, and she doesn't miss. The owners stop talking to watch her. When she wins, one of them offers you a price for her on the spot.` : `${p.name} has never held a rifle, and it shows. The other owners are polite about it, which is worse. On the flight back she won't look at you.`, end: good ? `${p.name} won the shooting contest for you` : "your slave lost the shooting contest" }; } },
        { id: "decline", label: "Decline",
          run: (c) => ({ text: `You send your regrets. Next month you hear who was there, and which deals were made on the range.`, end: "you declined the owners' invitation" }) },
      ],
    },
  },
};

/* ── week 20: slave food ────────────────────────────────────────────────────────────────────── */

const food: ArcDef = {
  id: "p_food", title: "The Slave Food Study", kind: "plot", at: 20,
  start: "study",
  beats: {
    study: {
      title: "What's in the slave food",
      text: (c) => `Your head of nutrition brings you a report she wasn't supposed to see. The company that makes the liquid slave food half the Free Cities feed their slaves on, including you, did a long-term study on it. The results are bad: slaves raised on it become dependent on it, get sick when they're switched off it, and the effect gets worse the longer they're on it.

The company buried the study. Your nutritionist got a copy from a friend. You own a small stake in the company through a fund, and you're one of the few people outside it who knows.`,
      options: [
        { id: "publish", label: "Publish it", note: "the right thing; costs you",
          run: (c) => { c.cash(-4000); c.rep(500); c.standing(2); c.set("plot_food_published", true);
            return { text: `You release the study on the regional feeds under your own name. The company's shares collapse overnight, your stake with them. Owners all over the Free Cities are furious, some at the company and some at you.

Your citizens are mostly impressed. And in your own household, you start switching everyone onto real food.`, end: "you published the slave food study" }; } },
        { id: "conceal", label: "Sit on it, and sell your stake before anyone finds out", note: "profitable",
          run: (c) => { c.cash(9000); c.set("plot_food_concealed", true);
            return { text: `You say nothing, sell your stake quietly through three different brokers, and keep feeding your slaves the same food. It's a good price.

Your nutritionist knows. She hasn't said anything yet.`, end: "you buried the slave food study" }; } },
        { id: "quiet", label: "Say nothing, but switch your own household onto real food", note: "¤3,000",
          need: cash(3000),
          run: (c) => { c.cash(-3000); for (const p of ownedAdults(c.s)) p.health.health = clamp(p.health.health + 4, -100, 100); c.hope(2);
            return { text: `You don't publish it. But the next week your kitchens start cooking: real bread, eggs, fruit. Some of your slaves get sick for a few days coming off the liquid food, and then they get better.`, end: "you quietly switched your slaves off the slave food" }; } },
      ],
    },
  },
};

/* ── week 24: the militia ───────────────────────────────────────────────────────────────────── */

const militia: ArcDef = {
  id: "p_militia", title: "Arms", kind: "plot", at: 24,
  start: "arms",
  beats: {
    arms: {
      title: "Every owner is arming",
      text: (c) => `A small arcology on the other side of the sea was taken last month by a gang of raiders who walked in through the service entrances. The owner's body was hung from the top of the spire. Since then, every owner in the Free Cities has been buying guns.

Your security chief wants you to do something too. There are two ways to go about it: arm your citizens and train them as a militia, or buy a fleet of armed security drones that answer only to you.`,
      options: [
        { id: "militia", label: "Found a citizen militia", note: "¤8,000; the citizens will feel it's their arcology too",
          need: cash(8000),
          run: (c) => { c.cash(-8000); c.set("plot_militia", true); c.security(8); c.standing(1);
            return { text: `You open an armory in the lower levels and invite any citizen who wants to learn to shoot. Nine hundred sign up in the first week. On weekend mornings you can hear them drilling in the parking levels.`, end: "you founded a citizen militia" }; } },
        { id: "drones", label: "Buy security drones", note: "¤12,000; loyal only to you",
          need: cash(12000),
          run: (c) => { c.cash(-12000); c.set("plot_drones", true); c.security(12);
            return { text: `The drones arrive in crates and your engineers spend a week installing their charging racks along the ceilings of the main concourses. Now wherever citizens look up there's one hanging there, watching.`, end: "you bought security drones" }; } },
        { id: "both", label: "Both", note: "¤20,000", need: cash(20000),
          run: (c) => { c.cash(-20000); c.set("plot_militia", true); c.set("plot_drones", true); c.security(18);
            return { text: `You do both. The citizens drill in the parking levels, and the drones watch them do it.`, end: "you armed your citizens and bought drones" }; } },
        { id: "neither", label: "Neither",
          run: (c) => ({ text: `You decide ${c.arcology} is secure enough as it is. Your security chief doesn't argue, but writes it down.`, end: "you didn't arm the arcology" }) },
      ],
    },
  },
};

/* ── week 31: the mercenaries ───────────────────────────────────────────────────────────────── */

const mercs: ArcDef = {
  id: "p_mercs", title: "The Mercenaries", kind: "plot", at: 31, cast: ["captain"],
  start: "offer",
  beats: {
    offer: {
      title: "A Free City has been sacked",
      text: (c) => `It's happened again, and this time to a real city: an Old World army crossed the border and sacked a Free City two hundred kilometers down the coast. The owners there are dead or fled, and the slaves have been taken away in trucks.

The mercenary company that was supposed to defend it didn't get paid in time, and left the day before. Its commander, ${c.full("captain")}, is in ${c.arcology} now, with three hundred soldiers and their gear, looking for a permanent contract. ${c.He("captain")} wants a barracks in your arcology and a monthly fee.`,
      options: [
        { id: "hire", label: "Hire them permanently", note: "¤25,000 now, and they're yours",
          need: cash(25000),
          run: (c) => { c.cash(-25000); c.set("plot_mercs", true); c.security(20); c.like("captain", 30); c.npc("captain").status = "ally";
            return { text: `You sign ${c.n("captain")}'s contract and give ${c.him("captain")} two floors of an empty office block as a barracks. The mercenaries move in that week, and they're loud and drink a lot and pay for everything in cash. Crime in the lower levels drops by half.`, end: "you hired a mercenary company" }; } },
        { id: "loan", label: "Hire them on credit", note: "a ¤25,000 debt",
          run: (c) => { c.loan(25000, 20, 0.2, "bank"); c.set("plot_mercs", true); c.security(20); c.like("captain", 20); c.npc("captain").status = "ally";
            return { text: `You haven't got the money, so you borrow it. ${c.n("captain")}'s soldiers move into the office block, and your bank starts sending you letters.`, end: "you hired mercenaries on credit" }; } },
        { id: "decline", label: "Send them on their way",
          run: (c) => { c.like("captain", -20);
            return { text: `You tell ${c.n("captain")} no. ${c.He("captain")} shrugs, and a week later the company signs with an arcology up the coast.`, end: "you turned the mercenaries away" }; } },
      ],
    },
  },
};

/* ── week 35: snatch and grab ───────────────────────────────────────────────────────────────── */

const snatch: ArcDef = {
  id: "p_snatch", title: "Snatch and Grab", kind: "plot", at: 35,
  subject: (s) => mostValuable(s),
  start: "grab",
  beats: {
    grab: {
      title: (c) => `${c.sn} has been taken`,
      text: (c) => `${c.sn} was on the promenade with an escort this afternoon when a van pulled up across the service lane. Four men in masks got out, hit the escort with a stun baton, and dragged ${c.sn} into the back. It took eleven seconds. The cameras got all of it.

${has(c, "plot_drones") ? "Two of your drones followed the van and still have it in sight. It's heading for the docks." : has(c, "plot_mercs") ? `${c.n("captain")} calls within a minute. ${c.His("captain")} people have the van on the dock road.` : "Security lost the van somewhere in the lower levels."} Twenty minutes later a message arrives: ${money(12000)} or you'll never see her again.`,
      options: [
        { id: "strike", label: "Send your people after the van", show: (c) => has(c, "plot_drones") || has(c, "plot_mercs"),
          run: (c) => { c.rep(400); c.security(3); c.treat(c.subj, "recognition", 6, "you sent your soldiers to get her back from kidnappers"); c.set("plot_snatch_saved", true);
            return { text: `They catch the van on the dock road before it reaches the water. There's a short, loud exchange of fire, and then ${c.sn} is pulled out of the back, bound and gagged but unhurt.

When she's brought up to the penthouse she goes straight to you and holds on and doesn't let go for a long time.`, end: `you got ${c.sn} back from the kidnappers` }; } },
        { id: "pay", label: "Pay the ransom", note: "¤12,000", need: cash(12000),
          run: (c) => { c.cash(-12000); c.treat(c.subj, "kindness", 4, "you paid a ransom to get her back"); c.crime(4);
            return { text: `You pay. ${c.sn} is left, blindfolded, in a stairwell in the lower levels three hours later. She's all right. Everyone in the lower levels now knows you pay.`, end: `you ransomed ${c.sn}` }; } },
        { id: "go", label: "Go after her yourself with your guards",
          run: (c) => { const ok = c.s.arcology.security > 45 || c.skill("warfare") >= 25;
            if (ok) { c.rep(600); c.treat(c.subj, "recognition", 9, "you came for her yourself"); c.set("plot_snatch_saved", true);
              return { text: `You take four guards and go down after them yourself. You find the van in a loading bay on the docks and the kidnappers arguing about the boat that isn't there yet. It's over quickly.

${c.sn} sees you come through the door and starts crying.`, end: `you rescued ${c.sn} yourself` }; }
            const p = c.subj; if (p) c.remove(p, "gone", "taken by kidnappers on the promenade");
            return { text: `You're too late. The loading bay is empty except for one of ${c.sn}'s shoes and the tire marks of the van. The boat left ten minutes ago.`, end: `${c.sn} was taken` }; } },
        { id: "refuse", label: "Refuse to pay",
          run: (c) => { const p = c.subj; if (p) c.remove(p, "gone", "taken by kidnappers on the promenade; you refused the ransom"); c.hope(-4);
            return { text: `You don't answer the message. There isn't another one. ${c.sn} isn't seen again, and the rest of your household knows exactly what you decided.`, end: `you refused the ransom and lost ${c.sn}` }; } },
      ],
    },
  },
};

/* ── week 43 and 46: the invasion and the raid ──────────────────────────────────────────────── */

const invasion: ArcDef = {
  id: "p_invasion", title: "The Invasion", kind: "plot", at: 43, cast: ["general"],
  start: "attack",
  beats: {
    attack: {
      title: "An army at the border",
      text: (c) => `The failed state inland has been on the edge of collapse for years. Now its last general, ${c.full("general")}, has decided the Free City is worth more than what's left of the country, and ${c.he("general")} is coming for it: four thousand men, old tanks, and nothing to lose.

The Free City's owners meet in emergency session. Every arcology is expected to put up what it has. ${defenseScore(c) >= 3 ? `Between ${has(c, "plot_mercs") ? `${c.n("captain")}'s company` : "your security forces"}${has(c, "plot_militia") ? ", your militia" : ""}${has(c, "plot_drones") ? " and your drones" : ""}, you have more than most.` : "You don't have much to offer."}`,
      options: [
        { id: "field", label: "Send your forces out to meet them", show: (c) => defenseScore(c) >= 2,
          run: (c) => { const win = defenseScore(c) >= 3; c.rep(win ? 1500 : -400); c.set("plot_invasion", win ? "won" : "bloodied"); if (!win) c.security(-10);
            return { text: win ? `Your people hold the coast road with the other arcologies' forces. It's two days of fighting. On the second night ${c.n("general")}'s army breaks and runs, and your soldiers come back with hundreds of prisoners.` : `Your forces go out and get badly mauled. The other arcologies' soldiers hold the line in the end, but ${c.arcology}'s part in it isn't something anyone will be praising.`, next: "prisoners", after: 1 }; } },
        { id: "walls", label: "Hold the arcology and let the others fight",
          run: (c) => { c.rep(-300); c.set("plot_invasion", "held");
            return { text: `You close your gates and wait. The other arcologies' forces beat ${c.n("general")}'s army on the coast road without you. They win, and they remember you weren't there.`, next: "prisoners", after: 1 }; } },
        { id: "fund", label: "Pay for the other arcologies' mercenaries instead", note: "¤20,000", need: cash(20000),
          run: (c) => { c.cash(-20000); c.rep(500); c.set("plot_invasion", "paid");
            return { text: `You write a check to the Free City's war fund. It buys two more mercenary companies, and they win the fight on the coast road. Your name is on the list of donors read out afterwards.`, next: "prisoners", after: 1 }; } },
      ],
    },
    prisoners: {
      title: "The prisoners",
      text: (c) => `${c.n("general")}'s army is beaten. ${c.He("general")} was captured on the second night, trying to get away in a civilian car. The prisoners, eight hundred of them, are being held in a warehouse on the docks, and the owners are dividing them up.

${c.arcology}'s share is forty men and women, and ${c.n("general")} is on the table too, for whoever wants ${c.him("general")}.`,
      options: [
        { id: "enslave", label: "Take your share as slaves",
          run: (c) => { for (let i = 0; i < 3; i++) { const p = c.addSlave({ seed: `pow${i}`, age: 20 + i * 4, quality: 0.1, how: `taken prisoner when ${c.n("general")}'s army was beaten`, hostile: true }); p.skills.combat = Math.max(p.skills.combat, 40); }
            c.cash(8000); c.out.push("the rest are sold at the Grand Exchange");
            return { text: `You keep the three best-looking women and sell the rest at the Grand Exchange. The three come up to the penthouse in a line, still in the torn remains of their uniforms, and one of them spits on your floor.`, next: "raid", after: 3 }; } },
        { id: "general", label: (c) => `Buy ${c.n("general")} and make an example of ${c.him("general")}`, note: "¤5,000", need: cash(5000),
          run: (c) => { c.cash(-5000); c.rep(600); c.security(4); c.npc("general").status = "dead";
            return { text: `You buy ${c.n("general")} and have ${c.him("general")} hanged from a crane on the docks, where every ship coming into the Free City will see ${c.him("general")}. Your citizens come down to look.`, next: "raid", after: 3 }; } },
        { id: "ransom", label: "Ransom them back to their families",
          run: (c) => { c.cash(6000); c.standing(1);
            return { text: `You let it be known that the families of your forty prisoners can buy them back. Most of them do, with whatever they have. It's not much money, but it's something.`, next: "raid", after: 3 }; } },
        { id: "free", label: "Let your share go",
          run: (c) => { c.standing(2); c.rep(-200); c.set("plot_freed_pows", true);
            return { text: `You open the warehouse door and tell your forty prisoners they can walk home. The other owners think you've gone soft. Some of the prisoners stop at the gate and look back at the arcology before they go.`, next: "raid", after: 3 }; } },
      ],
    },
    raid: {
      title: "An invitation to a raid",
      text: (c) => `With ${c.n("general")}'s army gone, the city it came from is empty of soldiers. A group of owners is putting together a raid: in fast, take everyone who can be sold, out before anyone organizes. They want to know if ${c.arcology} is in.

There are three groups worth taking: the soldiers who deserted before the battle and are hiding in the old barracks, the civilians sheltering in the cathedral, or the largest camp, on the river, which is a mix of everyone.`,
      options: [
        { id: "soldiers", label: "Take the deserters from the barracks",
          run: (c) => { for (let i = 0; i < 2; i++) { const p = c.addSlave({ seed: `raidsol${i}`, age: 22 + i * 5, quality: 0.2, how: "a deserter taken in the raid on the abandoned city", hostile: true }); p.skills.combat = Math.max(p.skills.combat, 50); }
            c.rep(200);
            return { text: `Your raiders catch the deserters asleep. The two women among them are strong, angry, and know how to fight, and it takes four of your people to get each of them into the truck.`, end: "you raided the abandoned city for soldiers" }; } },
        { id: "civilians", label: "Take the civilians from the cathedral",
          run: (c) => { for (let i = 0; i < 3; i++) c.addSlave({ seed: `raidciv${i}`, age: 18 + i * 6, quality: 0.3, how: "taken from the cathedral in the raid on the abandoned city" }); c.standing(-2);
            return { text: `The civilians don't fight. They come out of the cathedral with their hands up, and the priest comes out behind them begging. You take three young women. The rest are shared out among the other owners.`, end: "you raided the abandoned city for civilians" }; } },
        { id: "largest", label: "Take the biggest group, the river camp",
          run: (c) => { for (let i = 0; i < 5; i++) c.addSlave({ seed: `raidriv${i}`, age: 18 + i * 5, quality: 0.05, how: "taken from the river camp in the raid on the abandoned city", hostile: i % 2 === 0 }); c.standing(-3); c.security(-4);
            return { text: `The river camp is big and dirty and half the people in it are sick. Your raiders take everyone who can walk. You get five women out of it, and a lot of trouble.`, end: "you raided the river camp" }; } },
        { id: "decline", label: "Stay out of it",
          run: (c) => { c.standing(1);
            return { text: `You tell them ${c.arcology} won't take part. The raid goes ahead without you, and the auctions the next month are full of people from the abandoned city.`, end: "you stayed out of the raid" }; } },
      ],
    },
  },
};

/* ── week 56: the underground railroad ──────────────────────────────────────────────────────── */

const railroad: ArcDef = {
  id: "p_railroad", title: "The Daughters of Liberty", kind: "plot", at: 56, cast: ["insurgent"],
  subject: (s) => mostResentful(s),
  start: "message",
  beats: {
    message: {
      title: "A message from the Daughters",
      text: (c) => `A slave in your arcology, not one of yours, a citizen's, was found this morning in a shipping container on the docks with twenty others, on her way out of the Free City. The smuggler got away. On the container wall someone had painted a woman's face with a broken chain across it: the Daughters of Liberty.

Your security chief traced how the container got past your checkpoints, and brings you the answer. Someone inside your own household has been passing on the checkpoint schedules. It's ${c.sn}.

She doesn't know you know. Tonight she has a message in her room from ${c.full("insurgent")}, the Daughters' local leader, which says only: "The next one goes out on the 14th."`,
      options: [
        { id: "confront", label: "Confront her privately",
          run: (c) => { const p = c.subj; const d = p ? read(p).devotion : 0;
            if (p && d > 0) { c.treat(p, "kindness", 4, "you confronted her about the Daughters privately instead of punishing her"); c.set("plot_railroad_turned", true);
              return { text: `You wait for her in her room and hold up the message when she comes in. ${c.sn} goes white, and then sits on the bed and tells you everything: who approached her, what she passed on, where the containers go.

"I thought they were going to help people," she says. "I didn't think about you."`, end: `${c.sn} told you everything about the Daughters` }; }
            c.treat(p, "coercion", 5, "confronted about helping the Daughters of Liberty");
            return { text: `You wait for her in her room and hold up the message. ${c.sn} looks at it, then at you, and says nothing at all. She doesn't say anything the whole night.`, end: `${c.sn} wouldn't talk about the Daughters` }; } },
        { id: "example", label: "Make a public example of her",
          run: (c) => { c.treat(c.subj, "cruelty", 9, "made a public example for helping the Daughters of Liberty"); c.security(6); c.hope(-6); c.rep(300); c.like("insurgent", -30);
            return { text: `You have ${c.sn} put in the stocks on the promenade for a week with a sign around her neck. Citizens throw things at her. The rest of your household walks past her on their way to work, every day, and looks at the ground.`, end: `you made an example of ${c.sn}` }; } },
        { id: "watch", label: "Let her carry on, and watch who she talks to",
          run: (c) => { c.set("plot_watching", true); c.security(2);
            return { text: `You put the message back where it was and have your security chief put a tail on ${c.sn}. On the 14th, another container goes out, and you let it go. Now you know three more names in the Daughters.`, end: `you let ${c.sn} carry on so you could watch the Daughters` }; } },
        { id: "sell", label: "Sell her before she does any more damage",
          run: (c) => { const p = c.subj; if (p) c.remove(p, "sold", "sold after she was caught helping the Daughters of Liberty", 8000);
            return { text: `${c.sn} is at the Grand Exchange by the end of the week. She doesn't cry on the block. She looks up at the gallery the whole time, and you have the feeling she's looking for someone.`, end: `you sold ${c.sn} for helping the Daughters` }; } },
      ],
    },
  },
};

/* ── week 58: the bombing ───────────────────────────────────────────────────────────────────── */

const bombing: ArcDef = {
  id: "p_bombing", title: "The Bombing", kind: "plot", at: 58,
  start: "bomb",
  beats: {
    bomb: {
      title: "A girl on the promenade",
      text: (c) => {
        const guard = c.flag("plot_bodyguard") ? c.s.people[String(c.flag("plot_bodyguard"))] : fighter(c);
        return `You're crossing the promenade with your escort when a girl steps out of the crowd. She's young, and naked, and has a slave collar on, and nobody looks twice at that in ${c.arcology}. She walks straight at you with her arms out as though she wants to hug you.

${has(c, "plot_drones") ? "One of your drones drops out of the ceiling and scans her, and every alarm in the promenade goes off at once. There's a bomb implanted in her abdomen." : "Something about the way she's walking is wrong."} ${guard ? `${guard.name} is next to you.` : "Your guards are a few steps behind."}`;
      },
      options: [
        { id: "guard", label: "Put your bodyguard between you and her",
          pick: { label: "Who steps in", filter: (p) => p.health.recovery_weeks <= 0 },
          run: (c, p) => { if (!p) return { text: "" }; const good = p.skills.combat >= 30 || has(c, "plot_drones");
            if (good) { c.treat(p, "recognition", 10, "threw the bomber away from you on the promenade"); p.fame.prestige = Math.max(p.fame.prestige, 2) as 2; p.fame.why = "saved her owner from a suicide bomber"; c.set("plot_bodyguard_hero", p.id); c.rep(800);
              return { text: `${p.name} gets to the girl first, lifts her off her feet, and throws her over the railing into the fountain. The bomb goes off underwater. It blows out every window on that side of the promenade, but nobody except the bomber dies.

${p.name} is soaked and shaking and has glass in her hair. She keeps asking if you're all right.`, end: `${p.name} saved you from a bomber` }; }
            p.health.health = clamp(p.health.health - 45, -100, 100); p.health.injuries.push({ what: "caught in a bomb blast on the promenade", severity: "grave", week: c.week }); c.treat(p, "cruelty", 4, "caught the blast of a bomb meant for you");
            return { text: `${p.name} steps in front of you just as the bomb goes off. She takes the blast. You're thrown across the promenade with ringing ears and a cut face, but alive.

${p.name} is alive too, barely. The surgeons say she'll live, but it'll be months.`, end: `${p.name} took a bomb blast meant for you` }; } },
        { id: "run", label: "Run",
          run: (c) => { c.s.arcology.rep = Math.max(0, c.s.arcology.rep - 300); c.out.push("−300 reputation"); pop(c, -6); c.security(-4);
            return { text: `You run. Behind you the girl goes off in the middle of the crowd. Six citizens die, and the footage of you running away with your escort is everywhere by the evening.`, end: "you ran from a bomber and citizens died" }; } },
        { id: "shoot", label: "Tell your guards to shoot her",
          run: (c) => { c.rep(100); c.security(2); c.standing(-1);
            return { text: `Your guards shoot her from six meters away. She falls, and the bomb doesn't go off. When your security team examines it later, they find it was remote-triggered, and whoever held the trigger decided not to use it.

The dead girl had been sold at the Grand Exchange three weeks ago. Nobody knows who bought her.`, end: "your guards shot the bomber" }; } },
      ],
    },
  },
};

/* ── week 62: defense fears ─────────────────────────────────────────────────────────────────── */

const fears: ArcDef = {
  id: "p_fears", title: "Defense Fears", kind: "plot", at: 62,
  start: "fears",
  beats: {
    fears: {
      title: "The citizens are afraid",
      text: (c) => `After the bombing, the citizens' council asks for a meeting. They're afraid. There's talk in the bars that the bombing was a start and not an end, and that someone is going to try to take ${c.arcology} the way the raiders took that arcology across the sea.

They want soldiers quartered in the residential rings where people can see them. They're willing to pay part of it.`,
      options: [
        { id: "quarter", label: "Quarter soldiers in the residential rings", note: "¤6,000",
          need: cash(6000),
          run: (c) => { c.cash(-6000); c.set("plot_quartered", true); c.security(6); c.standing(1);
            return { text: `You put soldiers in the residential rings: a squad in every block, sleeping in empty apartments. The citizens bring them food. Some of the soldiers start dating the citizens' daughters, and that turns out to be good for morale too.`, end: "you quartered soldiers among the citizens" }; } },
        { id: "militia", label: "Tell them to join the militia", show: (c) => has(c, "plot_militia"),
          run: (c) => { c.security(4); c.set("plot_militia_grown", true);
            return { text: `You tell the council that the militia's armory is open, and they should send anyone who wants to feel safer. Four hundred more citizens sign up.`, end: "you grew the militia" }; } },
        { id: "reassure", label: "Tell them there's nothing to worry about",
          run: (c) => { c.standing(-1);
            return { text: `You tell the council ${c.arcology} is perfectly safe. They don't believe you, and they go back down to the bars and say so.`, end: "you told the citizens not to worry" }; } },
      ],
    },
  },
};

/* ── week 65: citizens and civilians ────────────────────────────────────────────────────────── */

const knights: ArcDef = {
  id: "p_knights", title: "Citizens and Civilians", kind: "plot", at: 65,
  when: (s) => !!s.story?.flags["plot_mercs"],
  start: "choose",
  beats: {
    choose: {
      title: "What the mercenaries become",
      text: (c) => `${c.n("captain")}'s soldiers have been in ${c.arcology} long enough that they're part of it. Some of them have married citizens. ${c.n("captain")} comes to you with a proposal: stop treating the company as hired guns and make it something permanent. ${c.He("captain")} has four ideas.`,
      options: [
        { id: "knights", label: "Knights: give the officers land and titles in the arcology",
          run: (c) => { c.set("plot_knights", "knights"); c.rep(600); c.security(8); c.cash(-5000);
            return { text: `You grant ${c.n("captain")} and ${c.his("captain")} officers apartments, titles and incomes. They swear an oath to you in the atrium, kneeling. ${c.arcology} has knights now.`, end: "your mercenaries became knights" }; } },
        { id: "evocati", label: "Evocati: make the veterans full citizens with a reserve duty",
          run: (c) => { c.set("plot_knights", "evocati"); c.standing(2); c.security(6); pop(c, 300);
            return { text: `The veterans become citizens, with the right to vote in the council and a duty to answer when called. Their families move into the arcology too.`, end: "your mercenaries became citizen reservists" }; } },
        { id: "eagles", label: "Black Eagles: an elite guard, loyal only to you",
          run: (c) => { c.set("plot_knights", "eagles"); c.security(12); c.cash(-4000); c.standing(-1);
            return { text: `The best of them are issued black uniforms and quartered in the spire, one floor below your penthouse. They answer to you, not to the council. The citizens find them a little frightening, which is the idea.`, end: "your mercenaries became the Black Eagles" }; } },
        { id: "shorn", label: "Shorn Ones: fanatics who shave their heads and fear nothing",
          run: (c) => { c.set("plot_knights", "shorn"); c.security(10); c.rep(300); c.crime(-6);
            return { text: `${c.n("captain")} turns the company into something close to a religious order. They shave their heads, take vows, and train in the parking levels at night with knives. Crime in the lower levels stops almost completely.`, end: "your mercenaries became the Shorn Ones" }; } },
      ],
    },
  },
};

/* ── week 67: the collaborator ──────────────────────────────────────────────────────────────── */

const collab: ArcDef = {
  id: "p_collab", title: "The Collaborator", kind: "plot", at: 67, cast: ["insurgent"],
  subject: (s) => ownedAdults(s).sort((a, b) => read(b).devotion - read(a).devotion)[0],
  start: "codes",
  beats: {
    codes: {
      title: (c) => `${c.sn} has something to tell you`,
      text: (c) => `${c.sn} comes to you late at night, when you're alone, and closes the door behind her.

"They asked me for the security codes," she says. "The Daughters. A woman came to me in the market, ${c.full("insurgent")}. She said something big is coming, soon, and they need the codes to the spire's inner doors. She said if I got them, I'd be free when it was over." She's twisting her hands together. "I haven't given her anything. I wanted to tell you first."`,
      options: [
        { id: "double", label: "Give her fake codes to pass on, and make her your spy",
          run: (c) => { c.set("plot_double", true); c.treat(c.subj, "recognition", 8, "you trusted her to spy on the Daughters for you");
            return { text: `You write out a set of codes that open nothing, and tell ${c.sn} to take them to ${c.n("insurgent")} and to report everything she hears. She nods. She's frightened and she's also, you can see, a little proud.

Over the next weeks she brings you names, dates, a map of the service tunnels with marks on it.`, end: `${c.sn} became your spy inside the Daughters` }; } },
        { id: "refuse", label: "Tell her to have nothing more to do with them",
          run: (c) => { c.treat(c.subj, "kindness", 4, "you thanked her for telling you about the Daughters");
            return { text: `You thank her and tell her to stay away from the market. She does. You don't hear anything more about the Daughters for a while, which isn't the same as there being nothing to hear.`, end: `${c.sn} stayed away from the Daughters` }; } },
        { id: "reward", label: "Reward her for telling you, and double the guards",
          run: (c) => { c.cash(-2000); c.security(5); c.treat(c.subj, "recognition", 6, "rewarded for telling you the Daughters approached her");
            return { text: `You give ${c.sn} a gold anklet and a day off, and you double the guard on the spire's inner doors. Your security chief changes all the codes that same night.`, end: `you rewarded ${c.sn} and changed the codes` }; } },
      ],
    },
  },
};

/* ── week 69: the hacker ────────────────────────────────────────────────────────────────────── */

const hacker: ArcDef = {
  id: "p_hacker", title: "The Hacker", kind: "plot", at: 69, cast: ["hacker"],
  start: "offer",
  beats: {
    offer: {
      title: "An offer from a hacker",
      text: (c) => `A message appears on your private terminal. You didn't give anyone this address.

"hi. ur arcologys network is like swiss cheese lol. someone is already in it, not me, someone paying real money. i can lock it down before they use it. ${money(10000)}. or dont and find out what happens. - ${c.n("hacker")}"

Your security chief looks at the message for a long time, then says the hacker is probably right about someone being in the network.`,
      options: [
        { id: "hire", label: "Pay the hacker", note: "¤10,000", need: cash(10000),
          run: (c) => { c.cash(-10000); c.set("plot_hacker", true); c.like("hacker", 30);
            return { text: `You pay. Two days later another message arrives: "done. they had backdoors in ur doors, ur drones and ur elevators. theyre gone now. ur welcome." Your engineers confirm it.`, end: "you paid the hacker" }; } },
        { id: "own", label: "Have your own engineers find it", need: (c) => (c.skill("hacking") >= 30 ? null : "needs hacking 30"),
          run: (c) => { c.set("plot_hacker", true);
            return { text: `You and your engineers spend three nights going through the network. The hacker was right: there are backdoors into the door controls, the drones and the elevators, planted by someone well funded. You close them all.`, end: "you found the backdoors yourself" }; } },
        { id: "ignore", label: "Ignore it",
          run: (c) => ({ text: `You delete the message. A week later there's another: "ok ur funeral."`, end: "you ignored the hacker" }) },
      ],
    },
  },
};

/* ── weeks 71 and 72: the coup ──────────────────────────────────────────────────────────────── */

const coup: ArcDef = {
  id: "p_coup", title: "The Coup", kind: "plot", at: 71, cast: ["insurgent", "rival_owner"],
  start: "night",
  beats: {
    night: {
      title: "The night of the coup",
      text: (c) => {
        const d = defenseScore(c);
        const warn = has(c, "plot_double") ? `${most(c)?.name ?? "Your spy"} brings you the date two days before: the Daughters, with hired soldiers behind them, are coming on the night of the new moon. You've had two days to get ready.` : "It comes without warning.";
        return `${warn}

At two in the morning the lights go out across ${c.arcology}. ${has(c, "plot_hacker") ? "The backup generators come on and the spire's doors stay locked; whoever planned this was counting on the backdoors that aren't there any more." : "The spire's inner doors open on their own. Someone has control of the network."} Armed men in grey come up through the service tunnels, with ${c.full("insurgent")}'s Daughters guiding them.

${d >= 5 ? `${has(c, "plot_knights") ? "Your knights" : has(c, "plot_mercs") ? `${c.n("captain")}'s soldiers` : "Your security forces"} are already moving to meet them.` : d >= 3 ? "Your people are fighting, but they're spread thin." : "Your guards are outnumbered from the first minute."}`;
      },
      options: [
        { id: "fight", label: "Lead the defense yourself",
          run: (c) => { const win = defenseScore(c) + (has(c, "plot_double") ? 2 : 0) + (c.skill("warfare") >= 30 ? 1 : 0) >= 4.5;
            c.set("plot_coup", win ? "won" : "lost");
            if (win) { c.rep(2000); c.standing(3); c.security(10); c.like("insurgent", -50); c.npc("insurgent").status = "dead";
              return { text: `You fight on the stairs of your own spire with a rifle in your hands. By dawn the men in grey are dead or captured, and ${c.n("insurgent")} is among the dead, in the service tunnel she came in through.

${c.arcology} wakes up to find out it nearly fell, and didn't, and who was on the stairs.`, next: "aftermath", after: 1 }; }
            return lost(c);
          } },
        { id: "hide", label: "Lock yourself in the penthouse with your slaves and let your forces fight",
          run: (c) => { const win = defenseScore(c) + (has(c, "plot_double") ? 2 : 0) >= 5; c.set("plot_coup", win ? "won" : "lost");
            if (win) { c.rep(900); c.security(8);
              return { text: `You lock the penthouse doors and wait with your slaves around you in the dark, listening to the shooting come closer and then stop. At dawn ${has(c, "plot_mercs") ? c.n("captain") : "your security chief"} knocks and tells you it's over.`, next: "aftermath", after: 1 }; }
            return lost(c);
          } },
        { id: "flee", label: "Get to the roof and the helicopter",
          run: (c) => { c.set("plot_coup", "fled"); c.cash(-Math.round(c.s.arcology.cash * 0.3)); c.rep(-1500); c.standing(-4);
            const house = ownedAdults(c.s).sort((a, b) => read(a).devotion - read(b).devotion);
            for (const p of house.filter((x) => read(x).devotion < 0).slice(0, Math.ceil(house.length * 0.6))) c.remove(p, "free", "freed by the Daughters of Liberty during the coup");
            return { text: `You get to the roof with the slaves who'd follow you and lift off with the spire burning below. By the time your security forces take the arcology back three days later, the Daughters have freed most of the slaves who didn't go with you and emptied a third of your accounts.

You come back to an arcology that knows you left.`, next: "aftermath", after: 1 }; } },
      ],
    },
    aftermath: {
      title: "Who paid for it",
      text: (c) => `${c.flag("plot_coup") === "won" ? "The prisoners talk." : "Your security chief spends a week going through what's left."} The Daughters didn't pay for the soldiers in grey. Someone else did, and the money leads straight across the strait: ${c.full("rival_owner")}.

${c.He("rival_owner")} wanted ${c.arcology}, and funded the Daughters to take it for ${c.him("rival_owner")}. You have proof now. What you do with it is up to you.`,
      options: [
        { id: "private", label: (c) => `Confront ${c.him("rival_owner")} privately, and make ${c.him("rival_owner")} pay`, note: "money",
          run: (c) => { c.cash(40000); c.like("rival_owner", -20);
            return { text: `You call ${c.n("rival_owner")} and tell ${c.him("rival_owner")} what you have. There's a long silence on the line. By the end of the week, ${money(40000)} has arrived in your accounts from a company that doesn't exist, and you both pretend nothing happened.`, end: "you made your rival pay for the coup, quietly" }; } },
        { id: "public", label: "Reveal it to the whole Free City",
          run: (c) => { c.rep(1500); c.standing(3); const n = c.s.arcology.neighbours[0]; if (n) { n.attitude = -100; n.prosperity = clamp(n.prosperity - 30, 0, 200); } c.like("rival_owner", -60);
            return { text: `You put everything on the regional feeds: the transfers, the orders, the prisoners' statements. The other owners cut ${c.n("rival_owner")} off within a day. ${c.His("rival_owner")} arcology's credit collapses, and ${c.his("rival_owner")} citizens start leaving.`, end: "you exposed your rival as the one behind the coup" }; } },
        { id: "trace", label: "Follow the money, and take what it paid for",
          need: (c) => (c.skill("trading") >= 25 || has(c, "plot_hacker") ? null : "needs trading 25 or the hacker"),
          run: (c) => { const n = c.s.arcology.neighbours[0]; if (n) n.ownership = clamp(n.ownership + 25, 0, 100); c.cash(10000);
            return { text: `You follow the money back through the shell companies, quietly, and find that ${c.n("rival_owner")} borrowed it against ${c.his("rival_owner")} own arcology. You buy the debt. Now you own a quarter of ${c.his("rival_owner")} arcology, and ${c.he("rival_owner")} knows it.`, end: "you took a quarter of your rival's arcology" }; } },
      ],
    },
  },
};

function lost(c: Ctx) {
  c.cash(-Math.round(c.s.arcology.cash * 0.4)); c.rep(-2000); c.standing(-3); c.security(-20);
  // The Daughters take the ones who want to go most, not the whole house: the least devoted half.
  const house = ownedAdults(c.s).sort((a, b) => read(a).devotion - read(b).devotion);
  const gone = house.filter((p) => read(p).devotion < 20).slice(0, Math.floor(house.length / 2));
  for (const p of gone) c.remove(p, "free", "freed by the Daughters of Liberty in the coup");
  c.set("plot_coup_lost", true);
  return { text: `It goes badly. By dawn the men in grey hold the lower half of the spire, and the Daughters have gone through the slave quarters opening every door. ${gone.length ? `${gone.length} of your slaves walk out with them.` : "None of your slaves go with them."}

It takes three days and every favour you have with the other owners to get the arcology back. You keep it, in the end. It's a different place now, and everyone in it saw you nearly lose it.`, next: "aftermath", after: 1 };
}

export const PLOT_ARCS: ArcDef[] = [club, shoot, food, militia, mercs, snatch, invasion, railroad, bombing, fears, knights, collab, hacker, coup];
