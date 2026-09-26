/**
 * THE CITY ACTS, AND YOU PUSH BACK — society events, campaigns and speeches.
 *
 * The habits in engine/culture move by themselves; this is where they turn into things that happen
 * in the street and land on your desk, and where you get levers of your own. Society events fire
 * out of whatever the city is becoming: a beating in the plaza when it's cruel, a slave standing up
 * at a meeting when it thinks slaves are people, a parade when it's open. What you choose moves the
 * habit hard, because you did it in front of everyone. Campaigns cost money every week and push one
 * habit steadily; a speech is free, once a fortnight, and moves it a little.
 */
import type { Person, SaveState } from "./types";
import { clamp } from "./psyche";
import { cultureOf, pushNorm, NORMS, type Norm } from "./culture";
import { registerEvents, type EventDef } from "./events";
import { applyTreatment, refresh } from "./obedience";
import { startRumor } from "./social";
import { generatePerson } from "./generate";
import { newMemory } from "./memory";

const n = (s: SaveState, k: Norm) => cultureOf(s).norms[k];
const std = (s: SaveState, by: number) => { s.arcology.public_standing = clamp(s.arcology.public_standing + by, -10, 10); };
const owned = (s: SaveState): Person[] => Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);

function civic(id: string, when: (s: SaveState) => boolean, weight: (s: SaveState) => number, seed: (s: SaveState) => string, options: EventDef["options"]): EventDef {
  return { id, severity: "notable", endogenous: true, candidates: (s) => (when(s) ? [{}] : []), weight: (s) => weight(s), seed: (s) => seed(s), options };
}

/** A slave off the street, bought or taken, who becomes yours. */
function acquire(s: SaveState, why: string): Person {
  const p = generatePerson({ seed: `civic:${s.id}:${s.arcology.week}:${why}`, week: s.arcology.week });
  p.status = "owned";
  p.assignment = "rest";
  p.origin.acquired_week = s.arcology.week;
  s.people[p.id] = p;
  s.memory[p.id] = newMemory();
  refresh(p, s.memory[p.id]);
  return p;
}

export const CIVIC_EVENTS: EventDef[] = [
  civic("civic_beating", (s) => n(s, "cruelty") > 15, (s) => 1 + n(s, "cruelty") / 25,
    () => "A man in a good coat is beating his slave in the middle of the plaza with a cane. She's on the tiles with her arms over her head. A crowd has gathered, and some of them are cheering. Somebody has noticed you're there, and the crowd turns to see what you'll do.", [
      { id: "stop", label: "Stop him", resolve: (s) => { pushNorm(s, "cruelty", -8, "you stopped a beating in the plaza"); pushNorm(s, "personhood", 4, "you stopped a beating in the plaza"); std(s, n(s, "cruelty") > 40 ? -1 : 1); return "You tell him to stop, and he does, because of who you are. The crowd goes quiet and breaks up. He takes her home, and she looks back at you over her shoulder the whole way.\n\nBy evening the concourse has two stories about it, depending on who's telling it."; } },
      { id: "buy", label: "Buy her off him on the spot", note: "¤6,000", resolve: (s) => { s.arcology.cash -= 6000; const p = acquire(s, "plaza"); applyTreatment(p, { kind: "kindness", size: 6, why: "you bought her off the man beating her in the plaza" }, s.arcology.week); pushNorm(s, "cruelty", -5, "you bought a beaten slave off her owner"); return `You offer him six thousand for her, and he takes it before you can change your mind. ${p.name} is yours now. She's bruised from shoulder to hip and she doesn't say anything all the way up to the penthouse.`; } },
      { id: "watch", label: "Watch", resolve: (s) => { pushNorm(s, "cruelty", 5, "you watched a beating in the plaza and did nothing"); return "You watch until he's finished. The crowd takes that as permission, and the cheering gets louder. Nobody in the plaza forgets that the owner stood there and watched."; } },
      { id: "fine", label: "Have him fined for disturbing the peace", resolve: (s) => { pushNorm(s, "order", 5, "you had a man fined for beating his slave in the plaza"); s.arcology.cash += 500; return "Your security takes his name and fines him five hundred for making a scene. He pays, furious, and does the rest at home. The fine is for the noise, not for her, and everyone understands that."; } },
    ]),
  civic("civic_gentle", (s) => n(s, "cruelty") < -15, (s) => 1 + -n(s, "cruelty") / 25,
    () => "A delegation of owners from the upper floors wants a word. One of their neighbours feeds his slaves better than his tenants, lets them sleep in, and walks them to the clinic himself. They say it's making their own slaves restless, and they want you to say something.", [
      { id: "side", label: "Side with the neighbour", resolve: (s) => { pushNorm(s, "cruelty", -6, "you sided with the owner who treats his slaves well"); pushNorm(s, "personhood", 4, "you sided with the owner who treats his slaves well"); return "You tell them it's his house. The delegation leaves unhappy. The neighbour sends up a bottle of wine, and the story gets around that the owner is on the soft side."; } },
      { id: "delegation", label: "Side with the delegation", resolve: (s) => { pushNorm(s, "cruelty", 6, "you told an owner to stop spoiling his slaves"); return "You have a word with him about keeping to standards. He listens, and cuts his slaves' rations the next week. The delegation is pleased. His slaves aren't."; } },
      { id: "nothing", label: "Stay out of it", resolve: () => "You say it isn't your business. Both sides take that as a win, and nothing changes for anyone." },
    ]),
  civic("civic_parade", (s) => n(s, "exposure") > 25, (s) => 1 + n(s, "exposure") / 30,
    () => "The pleasure quarter wants to hold a parade for the season: floats, music, and every slave in the quarter marching naked down the main concourse. They want your permission, and they'd love your money.", [
      { id: "fund", label: "Fund it", note: "¤5,000", resolve: (s) => { s.arcology.cash -= 5000; s.arcology.rep += 400; s.arcology.prosperity = clamp(s.arcology.prosperity + 3, 5, 200); pushNorm(s, "exposure", 10, "you funded the naked parade"); return "The parade runs down the main concourse on Saturday, with your name on the lead float. Visitors come in from three cities to see it. The concourse smells of oil and confetti for a week."; } },
      { id: "allow", label: "Allow it, but don't pay", resolve: (s) => { pushNorm(s, "exposure", 5, "you allowed the naked parade"); s.arcology.rep += 100; return "It goes ahead, smaller than it might have been, and mostly the pleasure quarter's own. It's still the loudest Saturday of the year."; } },
      { id: "forbid", label: "Forbid it", resolve: (s) => { pushNorm(s, "exposure", -8, "you forbade the naked parade"); std(s, n(s, "exposure") > 50 ? -1 : 0); return "You forbid it. The pleasure quarter holds a smaller one indoors and makes sure everyone knows why."; } },
    ]),
  civic("civic_modesty", (s) => n(s, "exposure") < -15, (s) => 1 + -n(s, "exposure") / 30,
    () => "A petition with four hundred signatures asks you to require slaves to be clothed in the concourse and in every shop. It was started by the office floors and the church on the residential level.", [
      { id: "back", label: "Back it", resolve: (s) => { pushNorm(s, "exposure", -8, "you backed the modesty petition"); return "You back it publicly, and the shops start turning away naked slaves by the end of the week, law or no law."; } },
      { id: "reject", label: "Reject it", resolve: (s) => { pushNorm(s, "exposure", 6, "you rejected the modesty petition"); return "You reject it. The office floors grumble, and the pleasure quarter throws a party in your honour."; } },
    ]),
  civic("civic_slave_speaks", (s) => n(s, "personhood") > 20, (s) => 1 + n(s, "personhood") / 25,
    () => "At the residential meeting in the civic hall, a slave has stood up at the back and asked to speak. She says she's been sent by forty others in her block. Half the hall is shouting at her to sit down. The chair looks to you.", [
      { id: "let", label: "Let her speak", resolve: (s) => { pushNorm(s, "personhood", 8, "you let a slave speak at the residential meeting"); pushNorm(s, "manumission", 3, "you let a slave speak at the residential meeting"); return "You tell the hall to let her speak. She talks for ten minutes about rations and beds and what happens after curfew. Nobody interrupts her after the first minute. Her owner doesn't look at you on the way out."; } },
      { id: "remove", label: "Have her removed", resolve: (s) => { pushNorm(s, "personhood", -8, "you had a slave removed from the residential meeting"); pushNorm(s, "order", 3, "you had a slave removed from the residential meeting"); return "Security walks her out. The hall claps, most of it. Forty slaves in the residential block hear about it by midnight."; } },
      { id: "invite", label: "Invite her up to the penthouse to talk", resolve: (s) => { pushNorm(s, "personhood", 5, "you invited a slave to the penthouse to hear her out"); startRumor(s, "the owner had a slave up to the penthouse to hear her complaints", { salience: 7 }); return "You tell her to come up tomorrow and you'll hear her out properly. The hall doesn't know what to make of it. She comes, with a list."; } },
    ]),
  civic("civic_rack", (s) => n(s, "personhood") < -25, (s) => 1 + -n(s, "personhood") / 25,
    () => "A gym on the commercial row has installed a rack outside for customers to lock their slaves in by the collar while they work out, like bicycles. It's popular. Someone has written to you complaining, and someone else has written asking you to put racks all over the arcology.", [
      { id: "racks", label: "Put racks in every public space", note: "¤3,000", resolve: (s) => { s.arcology.cash -= 3000; pushNorm(s, "personhood", -10, "you put slave racks in every public space"); return "The racks go in by the lifts, the cafés and the fountain. By the end of the month nobody remembers what it was like before."; } },
      { id: "remove", label: "Have it taken down", resolve: (s) => { pushNorm(s, "personhood", 6, "you had the slave rack taken down"); return "You have it taken down. The gym owner complains to anyone who'll listen, and the customers tie their slaves to the railing instead."; } },
      { id: "nothing", label: "Leave it", resolve: (s) => { pushNorm(s, "personhood", -2, "the slave rack on the commercial row"); return "You leave it. Two more shops put racks in by the end of the week."; } },
    ]),
  civic("civic_kneeling", (s) => n(s, "reversal") > 10, (s) => 1 + n(s, "reversal") / 25,
    () => "One of the arcology's richest men was seen kneeling in the plaza to fasten his slave's sandal, and then kissing her foot. The Owners' Association has written to you asking you to say publicly that it's disgraceful.", [
      { id: "defend", label: "Defend him publicly", resolve: (s) => { pushNorm(s, "reversal", 8, "you defended the owner who knelt to his slave"); s.arcology.rep -= 200; return "You say what he does with his own slave is his business, and that you've seen worse from the Association's members. The letter stops. Two more owners are seen kneeling the next week."; } },
      { id: "condemn", label: "Condemn it", resolve: (s) => { pushNorm(s, "reversal", -8, "you condemned the owner who knelt to his slave"); s.arcology.rep += 150; return "You say it's a disgrace. The Association sends its thanks, and he isn't seen in the plaza again for a while."; } },
      { id: "nothing", label: "Say nothing", resolve: () => "You say nothing. The Association writes again, more politely, and you don't answer that either. The owner keeps kneeling." },
    ]),
  civic("civic_satire", (s) => n(s, "reversal") < -10 && !!s.player.owned_by, (s) => 3,
    (s) => `There's a show at a club in the pleasure quarter where a comic plays you, in a collar, crawling after an actress playing ${s.people[s.player.owned_by!]?.name ?? "her"}. It's the most popular show in the arcology.`, [
      { id: "close", label: "Have the club closed", resolve: (s) => { pushNorm(s, "order", 5, "you closed the club that mocked you"); std(s, -1); return "You have it closed. The show moves to a basement three streets over, and now it's famous."; } },
      { id: "attend", label: "Go and watch it", resolve: (s) => { pushNorm(s, "reversal", 8, "you went to watch the show about your collar"); s.arcology.rep += 200; return "You go, collar and all, and sit in the front row. The comic nearly falls off the stage. By the end the whole room is applauding you, and the show changes its ending."; } },
      { id: "ignore", label: "Ignore it", resolve: (s) => { pushNorm(s, "reversal", -2, "the show that mocks your collar"); return "You ignore it. It runs for another two months, and the comic adds a bit about you pretending not to have seen it."; } },
    ]),
  civic("civic_washing", (s) => n(s, "feet") > 20, (s) => 1 + n(s, "feet") / 25,
    () => "The fountain washers want to hold a public washing on the first of the month: citizens kneeling in rows in the plaza to wash the feet of any slave who sits down. They'd like the arcology's owner to do the first one.", [
      { id: "kneel", label: "Kneel and wash the first pair yourself", resolve: (s) => { pushNorm(s, "feet", 10, "you knelt at the fountain washing"); pushNorm(s, "reversal", 4, "you knelt at the fountain washing"); return "You kneel on the wet stone and wash a slave girl's feet in front of two thousand people. She's shaking. Afterwards the queue of citizens waiting to kneel goes right across the plaza."; } },
      { id: "allow", label: "Allow it, but don't take part", resolve: (s) => { pushNorm(s, "feet", 4, "you allowed the fountain washing"); return "It goes ahead without you. It's smaller, and quieter, and there are still a few hundred people there."; } },
      { id: "forbid", label: "Forbid it", resolve: (s) => { pushNorm(s, "feet", -8, "you forbade the fountain washing"); return "You forbid it. The washers do it anyway, a few at a time, before the patrols come round."; } },
    ]),
  civic("civic_freedwoman", (s) => n(s, "manumission") > 10, (s) => 1 + n(s, "manumission") / 25,
    () => "A freedwoman who used to belong to someone on the upper floors has applied for a licence to open a shop on the commercial row. Her old owner has objected. The registry clerk wants you to decide.", [
      { id: "grant", label: "Grant the licence", resolve: (s) => { pushNorm(s, "manumission", 7, "you granted a freedwoman a shop licence"); s.arcology.prosperity = clamp(s.arcology.prosperity + 1, 5, 200); return "You grant it. Her shop opens three weeks later, selling lunches to the office floors, and there's a queue out of the door."; } },
      { id: "deny", label: "Deny it", resolve: (s) => { pushNorm(s, "manumission", -6, "you denied a freedwoman a shop licence"); return "You deny it. She takes a job cleaning the shop she wanted to open."; } },
    ]),
  civic("civic_clinic", (s) => n(s, "modification") > 25, (s) => 1 + n(s, "modification") / 25,
    () => "A back-alley clinic in the verge has been putting in cheap implants, and three slaves have died of infections this month. The licensed clinics want it shut; the verge says it's the only place they can afford.", [
      { id: "shut", label: "Shut it down", resolve: (s) => { pushNorm(s, "order", 4, "you shut the back-alley clinic"); pushNorm(s, "modification", -3, "you shut the back-alley clinic"); return "Security shuts it down and arrests the surgeon. The verge is angry for a week and then goes back to the licensed clinics, on credit."; } },
      { id: "fund", label: "Fund a cheap licensed clinic in the verge", note: "¤8,000", resolve: (s) => { s.arcology.cash -= 8000; pushNorm(s, "modification", 8, "you funded a cheap clinic in the verge"); std(s, 1); return "You fund a clinic in the verge, with real surgeons and real prices. It's booked solid for six months."; } },
      { id: "nothing", label: "Leave it alone", resolve: (s) => { pushNorm(s, "modification", 2, "the back-alley clinic"); s.arcology.crime = clamp(s.arcology.crime + 1, 0, 100); return "You leave it. Two more slaves die before it closes on its own."; } },
    ]),
  civic("civic_arrest", (s) => n(s, "order") > 25 && owned(s).length > 0, (s) => 1 + n(s, "order") / 25,
    (s) => { const p = owned(s)[0]; return `A patrol has arrested ${p.name} for being on the concourse without papers. She was on an errand for you. She's in a holding cell at the civic hall, and the duty sergeant wants to know if you'll come down.`; }, [
      { id: "go", label: "Go down and get her yourself", resolve: (s) => { const p = owned(s)[0]; if (p) applyTreatment(p, { kind: "kindness", size: 4, why: "you came to the civic hall for her yourself" }, s.arcology.week); pushNorm(s, "order", -3, "you walked your slave out of a holding cell"); return "You go down yourself. The sergeant apologises twice and lets her out. She holds your sleeve all the way back to the lift."; } },
      { id: "papers", label: "Send her papers and leave it to them", resolve: (s) => { pushNorm(s, "order", 3, "you sent papers for your arrested slave"); return "You send her papers down. She's released after six hours in the cell."; } },
      { id: "leave", label: "Leave her there overnight to learn", resolve: (s) => { const p = owned(s)[0]; if (p) applyTreatment(p, { kind: "cruelty", size: 4, why: "you left her in a cell overnight" }, s.arcology.week); pushNorm(s, "order", 5, "you left your slave in a cell to learn"); return "You leave her there overnight. She comes back in the morning, and she always carries her papers after that."; } },
    ]),
  civic("civic_gang", (s) => n(s, "order") < -15 || s.arcology.crime > 40, (s) => 1 + s.arcology.crime / 30,
    () => "A gang in the outer ring has been snatching slaves off the street and selling them on at the docks. Three owners have lost slaves this month. They want patrols.", [
      { id: "patrols", label: "Put patrols on the outer ring", note: "¤4,000", resolve: (s) => { s.arcology.cash -= 4000; s.arcology.crime = clamp(s.arcology.crime - 6, 0, 100); pushNorm(s, "order", 8, "you put patrols on the outer ring"); return "The patrols go in. The snatching stops within a fortnight, and so does a lot of other things people used to do on the outer ring."; } },
      { id: "bounty", label: "Post a bounty and let citizens deal with it", note: "¤1,500", resolve: (s) => { s.arcology.cash -= 1500; s.arcology.crime = clamp(s.arcology.crime - 3, 0, 100); pushNorm(s, "cruelty", 3, "you posted a bounty on the slave-snatchers"); pushNorm(s, "order", -2, "you let citizens hunt the slave-snatchers"); return "Two of the gang are found in the canal a week later. The rest leave for another city."; } },
      { id: "nothing", label: "Tell owners to guard their own", resolve: (s) => { pushNorm(s, "order", -4, "you told owners to guard their own slaves"); s.arcology.crime = clamp(s.arcology.crime + 2, 0, 100); return "You tell them to guard their own property. Owners start hiring their own muscle, and the outer ring gets a little more dangerous for everyone."; } },
    ]),
  civic("civic_festival", (s) => s.arcology.week % 12 === 0, () => 20,
    () => "It's the arcology's festival week. The committee wants to know what this year's festival should celebrate, because whatever you pick is what the city will be doing in the streets for seven days.", [
      { id: "mercy", label: "The Kind Hand: gentle owners", resolve: (s) => { pushNorm(s, "cruelty", -10, "you made the festival about gentle owners"); return "The festival hands out prizes to the gentlest owners in the arcology, and the slaves get a day off. Some owners grumble. Most of them enter."; } },
      { id: "strength", label: "The Firm Hand: discipline", resolve: (s) => { pushNorm(s, "cruelty", 8, "you made the festival about discipline"); pushNorm(s, "order", 4, "you made the festival about discipline"); return "There are public floggings on the festival stage every afternoon, and prizes for the best-trained slaves."; } },
      { id: "flesh", label: "The Flesh Fair: bodies and sex", resolve: (s) => { pushNorm(s, "exposure", 10, "you made the festival about sex"); s.arcology.rep += 200; return "For a week the concourse is one long party. Nobody in the arcology is wearing much by Thursday."; } },
      { id: "voices", label: "The Voices: slaves' own stories", resolve: (s) => { pushNorm(s, "personhood", 10, "you made the festival about slaves' own stories"); return "Slaves read, sing and tell their stories on the festival stage. Citizens come to laugh and some of them stay to listen."; } },
      { id: "feet", label: "The Washing: feet and devotion", resolve: (s) => { pushNorm(s, "feet", 10, "you made the festival about feet"); return "The fountain runs all week, and the queues of kneeling citizens go round the plaza twice."; } },
      { id: "kneel", label: "The Covenant: owners who serve", resolve: (s) => { pushNorm(s, "reversal", 10, "you made the festival about owners who serve"); return "Owners kneel to their slaves on the festival stage, one after another, to applause."; } },
    ]),
];

registerEvents(CIVIC_EVENTS);

/* ── campaigns ────────────────────────────────────────────────────────────────────────────── */

export interface CampaignDef { id: string; norm: Norm; dir: 1 | -1; name: string; what: string; cost: number }
export interface Campaign { id: string; since: number }

export const CAMPAIGNS: CampaignDef[] = [
  { id: "floggings", norm: "cruelty", dir: 1, name: "Public floggings at the fountain", what: "Punishments held in public, every week, on a stage.", cost: 1500 },
  { id: "kind_hand", norm: "cruelty", dir: -1, name: "The Kind Hand", what: "Posters, prizes and free clinics for owners who don't beat their slaves.", cost: 2000 },
  { id: "clothing_tax", norm: "exposure", dir: 1, name: "A tax on slave clothing", what: "Clothes for slaves cost more; nakedness costs nothing.", cost: 800 },
  { id: "uniforms", norm: "exposure", dir: -1, name: "Uniform grants", what: "Free uniforms for every slave in public.", cost: 2000 },
  { id: "schools", norm: "personhood", dir: 1, name: "Slave schools, open to all", what: "Evening classes for any slave whose owner will send her.", cost: 2500 },
  { id: "numbers", norm: "personhood", dir: -1, name: "Registry numbers for names", what: "Slaves are addressed by registry number in every public office.", cost: 700 },
  { id: "covenants", norm: "reversal", dir: 1, name: "Covenant ceremonies", what: "The arcology pays for public ceremonies where owners bind themselves to slaves.", cost: 1800 },
  { id: "decorum", norm: "reversal", dir: -1, name: "The decorum pledge", what: "Owners sign a public pledge to keep their slaves in their place.", cost: 900 },
  { id: "washings", norm: "feet", dir: 1, name: "Fountain washings, funded", what: "Weekly public washings in the plaza, towels and basins provided.", cost: 1200 },
  { id: "shoes", norm: "feet", dir: -1, name: "Shoe subsidies", what: "Cheap shoes for every slave; bare feet look poor.", cost: 1200 },
  { id: "freedom_fund", norm: "manumission", dir: 1, name: "Freedom fund", what: "The arcology matches what slaves save toward their freedom.", cost: 3000 },
  { id: "manumission_tax", norm: "manumission", dir: -1, name: "Manumission tax", what: "A heavy fee on freeing a slave.", cost: 500 },
  { id: "clinics", norm: "modification", dir: 1, name: "Clinic subsidies", what: "Implants and surgery at half price.", cost: 2500 },
  { id: "natural", norm: "modification", dir: -1, name: "Natural beauty prizes", what: "Prizes and screens celebrating unaltered bodies.", cost: 1000 },
  { id: "patrols", norm: "order", dir: 1, name: "More patrols", what: "Patrols on every floor, papers checked at the lifts.", cost: 2500 },
  { id: "open_city", norm: "order", dir: -1, name: "Pull the patrols", what: "Security pulled back to the spire; the streets run themselves.", cost: 0 },
];
export const CAMPAIGN_BY_ID: Record<string, CampaignDef> = Object.fromEntries(CAMPAIGNS.map((c) => [c.id, c]));
export const MAX_CAMPAIGNS = 2;

export const campaignsOf = (s: SaveState): Campaign[] => (s.campaigns ??= []);

export function startCampaign(s: SaveState, id: string): string {
  const c = CAMPAIGN_BY_ID[id];
  const list = campaignsOf(s);
  if (!c || list.some((x) => x.id === id)) return "";
  if (list.length >= MAX_CAMPAIGNS) return `You can only run ${MAX_CAMPAIGNS} campaigns at once.`;
  // One direction per habit: starting the opposite ends it.
  s.campaigns = list.filter((x) => CAMPAIGN_BY_ID[x.id]?.norm !== c.norm);
  s.campaigns.push({ id, since: s.arcology.week });
  return `${c.name} starts on Monday.`;
}

export function stopCampaign(s: SaveState, id: string): void {
  s.campaigns = campaignsOf(s).filter((x) => x.id !== id);
}

/** Weekly: pay for them and push. */
export function tickCampaigns(s: SaveState): { lines: string[]; cash: number } {
  let cash = 0;
  const lines: string[] = [];
  for (const k of campaignsOf(s)) {
    const c = CAMPAIGN_BY_ID[k.id];
    if (!c) continue;
    cash -= c.cost;
    pushNorm(s, c.norm, c.dir * 2.5 * (s.research?.done.includes("propaganda_net") ? 1.5 : 1), `your campaign: ${c.name}`);
    if (c.id === "patrols") s.arcology.crime = clamp(s.arcology.crime - 1, 0, 100);
    if (c.id === "open_city") s.arcology.crime = clamp(s.arcology.crime + 0.5, 0, 100);
  }
  if (campaignsOf(s).length && s.arcology.week % 4 === 0) lines.push(`Your campaigns ran all month: ${campaignsOf(s).map((k) => CAMPAIGN_BY_ID[k.id]?.name).filter(Boolean).join(", ")}.`);
  return { lines, cash };
}

/* ── speeches ─────────────────────────────────────────────────────────────────────────────── */

export function canSpeak(s: SaveState): boolean {
  return s.arcology.week - (s.last_speech ?? -99) >= 2;
}

/** Address the city on one habit, one way. Free, once a fortnight; the further you push against
 *  what the city already thinks, the more it costs your standing. */
export function speech(s: SaveState, norm: Norm, dir: 1 | -1): string {
  if (!canSpeak(s)) return "";
  s.last_speech = s.arcology.week;
  const d = NORMS[norm];
  const against = (n(s, norm) * dir) < -30;
  pushNorm(s, norm, dir * (s.research?.done.includes("propaganda_net") ? 8 : 5), `your speech: slaves' lives should be more ${dir > 0 ? d.high : d.low}`);
  if (against) std(s, -0.5);
  else s.arcology.rep += 100;
  return `You speak from the balcony over the plaza about ${d.name.toLowerCase()}, and say the city should be more ${dir > 0 ? d.high : d.low}. ${against ? "Half the plaza boos. The other half remembers it." : "The plaza is with you, and it's all anyone talks about for days."}`;
}
