/**
 * WHAT HAPPENS AROUND THE BUILDINGS.
 *
 * A district used to be numbers and a shape on the map. Here each kind has its own trouble: the
 * works takes a hand off a slave on the line, the docks open a container of "textiles" that turns
 * out to be twenty women, a club in the pleasure quarter wants your girl to dance its opening night,
 * the dairy's best cow breaks a record and a buyer wants her, a counsellor's notes leak, the border
 * wall's gate has a woman offering herself so her sister gets in free. Each one only comes up while
 * you own that kind of district, the bigger it is the likelier, and never the same one twice inside
 * six weeks (engine/events). Like any event, each can be played out as a scene afterwards.
 */
import type { Person, SaveState } from "./types";
import type { DistrictKind } from "../data/districts";
import { clamp } from "./psyche";
import { pushNorm } from "./culture";
import { registerEvents, type EventDef } from "./events";
import { applyTreatment, refresh } from "./obedience";
import { startRumor } from "./social";
import { generatePerson } from "./generate";
import { newMemory, remember } from "./memory";
import { menialsOf } from "./menials";

/** The level of your biggest district of this kind, 0 if you have none. */
function held(s: SaveState, kind: DistrictKind): number {
  return Math.max(0, ...(s.city?.districts ?? []).filter((d) => d.kind === kind && d.owner === "you").map((d) => d.level));
}

/** Your most devoted grown slave: the one the city asks for. */
function her(s: SaveState): Person | undefined {
  return Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18 && !p.health.recovery_weeks)
    .sort((a, b) => b.bond.read.devotion - a.bond.read.devotion)[0];
}
const first = (p?: Person) => p?.name.split(" ")[0] ?? "her";

function mem(s: SaveState, p: Person, content: string, charge: "warm" | "cold" | "sharp" | "bright" | "dull", importance = 6): void {
  const m = s.memory[p.id];
  if (m) remember(m, { content, week: s.arcology.week, importance, charge });
}

const cash = (s: SaveState, by: number) => { s.arcology.cash += by; };
const rep = (s: SaveState, by: number) => { s.arcology.rep = Math.max(0, s.arcology.rep + by); };
const prosper = (s: SaveState, by: number) => { s.arcology.prosperity = clamp(s.arcology.prosperity + by, 5, 200); };
const crime = (s: SaveState, by: number) => { s.arcology.crime = clamp(s.arcology.crime + by, 0, 100); };
const security = (s: SaveState, by: number) => { s.arcology.security = clamp(s.arcology.security + by, 0, 100); };

/** Somebody off the street who becomes yours. */
function acquire(s: SaveState, why: string): Person {
  const p = generatePerson({ seed: `district:${s.id}:${s.arcology.week}:${why}`, week: s.arcology.week });
  p.status = "owned";
  p.assignment = "rest";
  p.origin.acquired_week = s.arcology.week;
  s.people[p.id] = p;
  s.memory[p.id] = newMemory();
  refresh(p, s.memory[p.id]);
  return p;
}

/** One event about one kind of district. `slave`: it asks for one of yours, so it waits until you have one. */
function place(kind: DistrictKind, id: string, seed: (s: SaveState) => string, options: EventDef["options"], opts?: { slave?: boolean; severity?: EventDef["severity"] }): EventDef {
  return {
    id: `dl_${kind}_${id}`, severity: opts?.severity ?? "notable", endogenous: true,
    candidates: (s) => (held(s, kind) && (!opts?.slave || her(s)) ? [{}] : []),
    weight: (s) => 0.9 + held(s, kind) * 0.3,
    seed: (s) => seed(s), options,
  };
}

export const DISTRICT_EVENTS: EventDef[] = [
  place("residential", "screamer",
    () => "Forty tenants on one floor of the housing block have signed a complaint. The man in 14C fucks his slave every night at about two, and she screams the whole time, and not the good kind. He says it's his flat and his property. They say they have to work in the morning.", [
      { id: "gag", label: "Tell him to gag her", resolve: (s) => { pushNorm(s, "cruelty", 3, "you told a tenant to gag his slave"); return "He buys a ball gag the next day. The floor sleeps. Nobody asks what he does to her now that it's quiet."; } },
      { id: "fine", label: "Fine him for the noise", note: "+¤800", resolve: (s) => { cash(s, 800); pushNorm(s, "order", 3, "you fined a tenant for his slave's screaming"); return "He pays the fine and moves her into the bathroom, which has a door that shuts. The neighbours call it a win."; } },
      { id: "walls", label: "Soundproof the block", note: "¤4,000", resolve: (s) => { cash(s, -4000); prosper(s, 1); return "The block gets new walls. Everyone on every floor gets to scream as loud as they want now, and from the rent rise a lot of them do."; } },
      { id: "nothing", label: "Tell them to buy earplugs", resolve: (s) => { pushNorm(s, "cruelty", 1, "you ignored a screaming slave"); return "They buy earplugs. 14C takes it as permission and gets a second girl."; } },
    ]),
  place("commercial", "window",
    () => "A lingerie shop on the commercial row wants to put live models in its window: slaves in the stock, on stools, all day, turning round when somebody taps the glass. The shopkeeper wants your blessing, and says he'd love one of yours for the opening week.", [
      { id: "allow", label: "Allow it", note: "+¤1,500 in rent", resolve: (s) => { cash(s, 1500); pushNorm(s, "exposure", 5, "you let the shops put slaves in the windows"); return "By the end of the month half the row has a girl in the window. The shoe shop's is barefoot and the queue goes round the corner."; } },
      { id: "forbid", label: "Forbid it", resolve: (s) => { pushNorm(s, "exposure", -4, "you kept slaves out of the shop windows"); return "He puts mannequins back in the window and paints nipples on them out of spite."; } },
      { id: "tax", label: "Allow it, and tax every window", note: "+¤3,000", resolve: (s) => { cash(s, 3000); pushNorm(s, "exposure", 3, "you taxed the slaves in shop windows"); crime(s, 1); return "The windows fill up anyway. A few shops start keeping theirs in the back room instead, where the tax man can't see, and where the customers can touch."; } },
    ]),
  place("industrial", "press",
    () => "A hydraulic press at the works took a slave's hand off at the wrist this morning. She was on her fourteenth hour. The foreman wants her written off and a new one sent down by Monday, and the line's already running again with her blood still on the guard.", [
      { id: "clinic", label: "Pay for her stump to be done properly", note: "¤3,000", resolve: (s) => { cash(s, -3000); pushNorm(s, "personhood", 4, "you paid for a works slave's surgery"); pushNorm(s, "cruelty", -2, "you paid for a works slave's surgery"); return "The clinic closes it up and fits a hook. She's back on a lighter line in a month, and the men on the floor stop calling her 'the spare'."; } },
      { id: "replace", label: "Write her off and send another", note: "+¤1,000 saved", resolve: (s) => { cash(s, 1000); pushNorm(s, "cruelty", 4, "you wrote off a maimed works slave"); return "She's sold to a verge brothel that doesn't care how many hands she has. The new one is on the press by Monday."; } },
      { id: "shifts", label: "Cap their shifts at ten hours", resolve: (s) => { prosper(s, -1); pushNorm(s, "order", 3, "you capped shifts at the works"); pushNorm(s, "personhood", 2, "you capped shifts at the works"); return "Output drops a little. So do the accidents. The foreman complains to anyone who'll listen and nobody does."; } },
    ]),
  place("civic", "clerk",
    () => "A clerk at the slave registry in the civic hall has been selling clean papers to runaways at ¤500 a time. He's done eleven. Security has him in a room downstairs and he's pissed himself.", [
      { id: "flog", label: "Have him flogged on the hall steps", resolve: (s) => { pushNorm(s, "order", 6, "you had the registry clerk flogged in public"); pushNorm(s, "cruelty", 3, "you had the registry clerk flogged in public"); security(s, 2); return "Twenty strokes at noon on the steps. The registry has never been so honest. The eleven are hunted down inside a fortnight."; } },
      { id: "collar", label: "Put a collar on him and sell him", note: "+¤4,000", resolve: (s) => { cash(s, 4000); pushNorm(s, "order", 4, "you enslaved the corrupt clerk"); return "He's sold at the next auction. The woman who buys him runs a laundry and keeps him on his knees at the mangle. Clerks start double-checking everything."; } },
      { id: "cut", label: "Keep him on, and take half", note: "+¤2,500", resolve: (s) => { cash(s, 2500); crime(s, 4); startRumor(s, "papers can be bought at the registry, and the owner takes a cut", { salience: 6 }); return "He keeps selling, more carefully, and your half arrives every Friday in an envelope. Runaways start getting further than they used to."; } },
    ]),
  place("docks", "textiles",
    () => "A container at the docks manifested as 'textiles' has been opened by your inspectors. There are twenty women inside, alive, mostly. The shipper's agent says it's a misunderstanding and offers ¤5,000 to forget it.", [
      { id: "claim", label: "Seize them for the arcology", resolve: (s) => { menialsOf(s).owned += 20; pushNorm(s, "order", 3, "you seized a smuggled container of women"); return "They're hosed down, fed and collared. Twenty more menials on your books by the end of the day, and a shipper who'll think twice about your docks."; } },
      { id: "bribe", label: "Take the money", note: "+¤5,000", resolve: (s) => { cash(s, 5000); crime(s, 3); pushNorm(s, "cruelty", 2, "you took a bribe over a container of women"); return "The container is resealed and goes on its way. The agent is very grateful. Four more come through that month."; } },
      { id: "free", label: "Let them go into the city free", resolve: (s) => { pushNorm(s, "manumission", 6, "you freed the women in the container"); prosper(s, 1); rep(s, -150); return "They walk off the docks in borrowed clothes. Most are working the verge within a week, for themselves. The other owners think you've gone soft."; } },
    ]),
  place("academy", "prize",
    () => "The top marks at the academy this term went to a slave girl, ahead of every citizen's child in the year. The parents have written to you, very politely, asking that slaves be barred from prizes. Her owner wants to sell her, since she's suddenly worth something.", [
      { id: "buy", label: "Buy her yourself", note: "¤9,000", resolve: (s) => { cash(s, -9000); const p = acquire(s, "academy"); p.persona.education = 90; applyTreatment(p, { kind: "recognition", size: 6, why: "you bought her for her marks" }, s.arcology.week); return `${first(p)} is yours. She arrives with her prize certificate in a plastic sleeve and asks, very seriously, whether she'll be allowed to keep studying.`; } },
      { id: "keep", label: "Let her keep the prize", resolve: (s) => { pushNorm(s, "personhood", 5, "you let a slave keep the academy prize"); return "She keeps it. Three parents pull their children out. Twelve owners enrol their brightest slaves for next term."; } },
      { id: "bar", label: "Bar slaves from prizes", resolve: (s) => { pushNorm(s, "personhood", -5, "you barred slaves from academy prizes"); return "The prize goes to a senator's son who came fourth. The girl is sold to a brothel that likes them clever."; } },
    ]),
  place("barracks", "rowdy",
    () => "Your soldiers had a payday drinking night in the barracks and used the barracks slaves so hard one of them is in the clinic with a torn ass and two cracked ribs. The sergeant says the boys needed it and it won't happen again. It's happened again.", [
      { id: "punish", label: "Dock their pay and put them on punishment drill", resolve: (s) => { pushNorm(s, "order", 4, "you punished the soldiers for wrecking a slave"); security(s, -2); return "They drill in the sun for a week and hate you for it. The slaves in the barracks start sleeping better."; } },
      { id: "let", label: "Let it go", resolve: (s) => { pushNorm(s, "cruelty", 4, "you let the soldiers wreck a slave"); security(s, 2); return "The soldiers love you for it. The barracks orders three replacement girls and a crate of lube."; } },
      { id: "rules", label: "Buy them their own brothel, with rules", note: "¤5,000", resolve: (s) => { cash(s, -5000); security(s, 1); pushNorm(s, "order", 2, "you bought the soldiers a brothel"); return "The barracks gets a brothel with a madam who carries a cosh. The soldiers behave, mostly, because she hits harder than the sergeant."; } },
    ]),
  place("pleasure", "headliner",
    (s) => `A new club in the pleasure quarter wants a headliner for its opening night, and the owner has asked for ${first(her(s))} by name. He wants her on the pole in nothing but heels, then in the VIP room for whoever bids highest. He's offering ¤5,000.`, [
      { id: "send", label: `Send her`, note: "+¤5,000", resolve: (s) => { const p = her(s); cash(s, 5000); if (p) { applyTreatment(p, { kind: "coercion", size: 3, why: "you rented her out to headline a club" }, s.arcology.week); p.fame.prestige = Math.max(p.fame.prestige, 1) as typeof p.fame.prestige; mem(s, p, "the owner sent me to headline the new club, on the pole and then in the VIP room for the highest bidder", "dull", 6); } pushNorm(s, "exposure", 3, "your slave headlined a club"); return `${first(p)} dances, gets bid on, and comes home at six with her heels in her hand and cum dried in her hair. Her name is on posters all over the quarter by the weekend.`; } },
      { id: "go", label: "Send her, and go and watch from the front", note: "+¤5,000", resolve: (s) => { const p = her(s); cash(s, 5000); rep(s, 200); if (p) { applyTreatment(p, { kind: "recognition", size: 3, why: "you came to watch her headline" }, s.arcology.week); mem(s, p, "I headlined the new club and the owner sat at the front and watched me the whole time", "warm", 7); } return `${first(p)} looks for you every time she comes round the pole. When the VIP bidding starts, the room waits to see if you'll bid on your own slave.`; } },
      { id: "no", label: "She's not for hire", resolve: (s) => { const p = her(s); if (p) applyTreatment(p, { kind: "recognition", size: 2, why: "you wouldn't rent her to the club" }, s.arcology.week); return "He books someone else's girl. The posters go up anyway, with a blank where her name would've been."; } },
    ], { slave: true }),
  place("arena", "grudge",
    () => "Two gladiatrix at the arena want to settle a grudge to the death. One of them fucked the other's man. The crowd has heard, the bookies have opened a book, and forty thousand seats could be sold by Friday.", [
      { id: "death", label: "Let them fight to the death", note: "+¤6,000", resolve: (s) => { cash(s, 6000); rep(s, 400); pushNorm(s, "cruelty", 5, "you let two gladiatrix fight to the death"); return "It takes eleven minutes. The winner stands on the sand, bleeding, and fucks the man in question in front of forty thousand people. The crowd loses its mind."; } },
      { id: "blood", label: "First blood only", note: "+¤2,500", resolve: (s) => { cash(s, 2500); rep(s, 150); return "First blood comes in the second minute, a cut lip. The crowd boos. Both of them go home and the grudge goes on."; } },
      { id: "fuck", label: "Make them settle it by fucking on the sand", note: "+¤4,000", resolve: (s) => { cash(s, 4000); rep(s, 250); pushNorm(s, "exposure", 5, "you made two gladiatrix fuck it out in the arena"); return "Whoever makes the other come first wins. It turns into the arena's most-watched bout of the year, and the loser cries and comes back the next season asking for a rematch."; } },
    ]),
  place("clinic", "surgeon",
    (s) => `The chief surgeon at the clinic tower wants to try something new for a paper: an implant that doubles a woman's breast size in a single afternoon, with no recovery. He'll do it free, on ${first(her(s))}, if you sign the consent.`, [
      { id: "yes", label: "Sign it", resolve: (s) => { const p = her(s); if (p) { p.body.boobs = Math.round(p.body.boobs * 2); applyTreatment(p, { kind: "coercion", size: 3, why: "you let the surgeon double her tits for his paper" }, s.arcology.week); mem(s, p, "the owner signed me over to the clinic surgeon and I woke up with my tits twice the size", "sharp", 8); } pushNorm(s, "modification", 4, "you lent your slave for experimental surgery"); return `${first(p)} wakes up that evening, looks down, and doesn't say anything for a long time. The paper gets published with photographs, from the neck down.`; } },
      { id: "no", label: "Decline", resolve: (s) => { const p = her(s); if (p) applyTreatment(p, { kind: "kindness", size: 1, why: "you wouldn't let the surgeon experiment on her" }, s.arcology.week); return "He finds a volunteer in the verge for a hundred credits. She dies, and he publishes anyway."; } },
      { id: "fund", label: "Decline, but fund the research", note: "¤6,000", resolve: (s) => { cash(s, -6000); prosper(s, 1); pushNorm(s, "modification", 3, "you funded the clinic's implant research"); return "He thanks you in the paper. Within a year every clinic in the region is selling it."; } },
    ], { slave: true }),
  place("garden", "picnic",
    () => "On Sunday afternoon a couple was caught fucking under the orchard trees on the sky garden's top terrace, in front of a picnicking family and about sixty people who stopped to watch. The gardeners want them fined. The sixty want to know if it's on again next week.", [
      { id: "fine", label: "Fine them", note: "+¤500", resolve: (s) => { cash(s, 500); pushNorm(s, "order", 2, "you fined the couple in the sky garden"); pushNorm(s, "exposure", -2, "you fined the couple in the sky garden"); return "They pay and go home to do it there. The terraces go back to being for families."; } },
      { id: "leave", label: "Leave it", resolve: (s) => { pushNorm(s, "exposure", 4, "you let a couple fuck in the sky garden"); return "Nobody's fined. By the end of the month the top terrace is where people go for exactly that, and the families picnic lower down."; } },
      { id: "weekly", label: "Make it a Sunday tradition", note: "+300 reputation", resolve: (s) => { rep(s, 300); pushNorm(s, "exposure", 7, "you made public sex in the sky garden a tradition"); return "Sunday afternoons on the top terrace become the city's favourite outing. Vendors sell blankets and lube at the lift."; } },
    ]),
  place("temple", "rite",
    (s) => `The temple's priestess wants a body for the spring rite: one woman, oiled and garlanded, laid on the altar for the congregation to worship however the rite says, all night. She's asked for ${first(her(s))}. She says it's a great honour and the congregation will remember who gave her.`, [
      { id: "give", label: "Give her to the temple for the night", note: "+300 reputation", resolve: (s) => { const p = her(s); rep(s, 300); if (p) { applyTreatment(p, { kind: "coercion", size: 3, why: "you gave her to the temple's spring rite" }, s.arcology.week); mem(s, p, "the owner gave me to the temple for the spring rite, and I spent the night on the altar while the congregation worshipped me", "sharp", 8); } return `${first(p)} is carried back at dawn, oiled, sore, flowers still in her hair, and sleeps until the evening. The congregation sends a thank-you basket.`; } },
      { id: "donate", label: "Give money instead", note: "¤3,000", resolve: (s) => { cash(s, -3000); rep(s, 100); return "The priestess takes the money and finds another girl. The rite goes ahead, and you're thanked from the altar."; } },
      { id: "no", label: "Refuse", resolve: (s) => { rep(s, -100); const p = her(s); if (p) applyTreatment(p, { kind: "recognition", size: 2, why: "you wouldn't give her to the temple" }, s.arcology.week); return "The priestess says she understands, in a voice that means she doesn't. The congregation is told the spring will be a poor one."; } },
    ], { slave: true }),
  place("exchange", "bet",
    (s) => `A broker on the exchange floor bet his whole bonus that he could buy a night with ${first(her(s))}. He's at your door with ¤12,000 and a bottle of champagne, and half the trading floor is waiting to hear if he won.`, [
      { id: "take", label: "Take his money", note: "+¤12,000", resolve: (s) => { const p = her(s); cash(s, 12000); if (p) { applyTreatment(p, { kind: "coercion", size: 3, why: "you sold a night with her to a broker who'd bet on it" }, s.arcology.week); mem(s, p, "the owner sold a night with me to a broker who'd bet his bonus he could have me", "cold", 6); } startRumor(s, "a broker bought a night with the owner's slave for twelve thousand", { salience: 6 }); return `He gets his night. ${first(p)} says afterwards he talked about money the entire time, even while he was in her, and came in under a minute.`; } },
      { id: "crawl", label: "Make him crawl across the floor for it first", note: "+¤12,000", resolve: (s) => { const p = her(s); cash(s, 12000); rep(s, 200); if (p) mem(s, p, "a broker crawled across the trading floor on his hands and knees to get a night with me, because the owner made him", "bright", 7); return `He crawls the length of the trading floor on his hands and knees with the money in his teeth, and ${first(p)} watches from the gallery. He gets his night. He never lives the crawl down.`; } },
      { id: "no", label: "Send him away", resolve: (s) => { const p = her(s); if (p) applyTreatment(p, { kind: "recognition", size: 2, why: "you wouldn't sell her to the broker" }, s.arcology.week); rep(s, 100); return "He loses his bonus. The floor decides she's priceless, and her price on the slave futures market goes up."; } },
    ], { slave: true }),
  place("dairy", "record",
    () => "The dairy's best cow pumped forty-one litres yesterday, a record for the region. A buyer from the Northern Cities has already called. He wants her, he'll pay ¤25,000, and he wants her shipped still on the machine.", [
      { id: "sell", label: "Sell her", note: "+¤25,000", resolve: (s) => { cash(s, 25000); return "She's crated with her pump still attached and shipped north. The dairy's output drops by a fifth for a month while the others are pushed to make it up."; } },
      { id: "poster", label: "Keep her and put her on every carton", note: "+400 reputation", resolve: (s) => { rep(s, 400); prosper(s, 1); pushNorm(s, "exposure", 2, "your record cow went on the cartons"); return "Her tits are on every milk carton in the arcology by the end of the month, with her yield printed under them. Sales go up. So do the tourists asking to see her."; } },
      { id: "breed", label: "Keep her, and breed her", resolve: (s) => { prosper(s, 1); return "The dairy's vet has her bred within the week. A pregnant cow yields more, and her daughters will be worth twice what the buyer offered."; } },
    ]),
  place("power", "blackout",
    () => "A fault at the power plant has blacked out the pleasure quarter and two residential rings on a Saturday night. In the dark, the clubs have turned into one big grope, a jewellery shop's been cleaned out, and someone has let the arcade's booths open.", [
      { id: "fix", label: "Pay for overtime crews", note: "¤6,000", resolve: (s) => { cash(s, -6000); return "The lights are back by two. The club crowds blink at each other, find their clothes, and decide it was the best night of the year."; } },
      { id: "curfew", label: "Curfew and patrols until it's fixed", resolve: (s) => { pushNorm(s, "order", 5, "you put the city under curfew in the blackout"); security(s, 2); prosper(s, -1); return "Security clears the streets with torches. A lot of people spend the night locked in a club with strangers, which nobody complains about."; } },
      { id: "wait", label: "Let the morning shift fix it", resolve: (s) => { crime(s, 5); pushNorm(s, "order", -4, "you left the city dark all night"); return "It's dark until nine. Three shops are looted, the arcade's girls are found in four different flats, and the night gets a name people use for years."; } },
    ]),
  place("therapy", "notes",
    () => "A counsellor at the therapy offices has had her notes leaked onto the city boards: twenty owners' sessions, word for word, about what they do to their slaves and why they can't stop. One of the files is about someone who sounds a lot like you.", [
      { id: "buy", label: "Buy the rest of the files before they go up", note: "¤5,000", resolve: (s) => { cash(s, -5000); return "The rest of the files disappear. The one that sounds like you stays up a day, then is drowned out by a senator's, which is much worse."; } },
      { id: "own", label: "Say it's yours, and that you're not sorry", note: "+reputation", resolve: (s) => { rep(s, 300); pushNorm(s, "cruelty", 2, "you owned up to the leaked therapy notes and weren't sorry"); return "You post that it's yours and that every word is true. Half the city is appalled. The other half books sessions to learn how you sleep at night."; } },
      { id: "deport", label: "Have the counsellor thrown out of the arcology", resolve: (s) => { pushNorm(s, "order", 4, "you exiled the counsellor whose notes leaked"); return "She's walked to the gate with one suitcase. Her clients are relieved, and the therapy offices install a shredder in every room."; } },
    ]),
  place("restaurant", "table",
    (s) => `A new place on restaurant row serves dinner off a naked woman: sushi on her belly, sauces in her navel, dessert wherever the chef thinks is funny. For opening night the owner wants the arcology's own, and he's asked for ${first(her(s))}. She has to lie still for three hours while thirty people eat off her.`, [
      { id: "lend", label: "Lend her for the night", note: "+¤2,500", resolve: (s) => { const p = her(s); cash(s, 2500); pushNorm(s, "exposure", 3, "your slave was the table at the body sushi opening"); if (p) { applyTreatment(p, { kind: "coercion", size: 2, why: "you lent her as a table for a restaurant opening" }, s.arcology.week); mem(s, p, "the owner lent me to the new restaurant as the table, and thirty people ate off me for three hours", "dull", 6); } return `${first(p)} lies still for three hours with rice going warm on her stomach. Somebody tries to eat a piece off her nipple with his teeth and gets fined by the chef.`; } },
      { id: "eat", label: "Lend her, and take the first seat", note: "+¤2,500", resolve: (s) => { const p = her(s); cash(s, 2500); rep(s, 150); if (p) { applyTreatment(p, { kind: "recognition", size: 2, why: "you ate the first piece off her yourself" }, s.arcology.week); mem(s, p, "I was the table at the new restaurant and the owner sat at my head and ate the first piece off me", "warm", 7); } return `You take the seat at her head and eat the first piece off her collarbone. ${first(p)} stays still the whole three hours, eyes on you.`; } },
      { id: "shut", label: "Shut it for health violations", resolve: (s) => { pushNorm(s, "order", 2, "you shut the body sushi restaurant"); return "The health inspector finds what he was sent to find. It reopens three months later as a noodle bar. The waitresses are still naked."; } },
    ], { slave: true }),
  place("university", "lecture",
    () => "A professor at the university has started a lecture course on 'the ethics of ownership'. It's standing room only, and slaves have been sneaking into the back on their errands to listen. Several owners want him fired. The students want him tenured.", [
      { id: "endow", label: "Endow his chair", note: "¤6,000", resolve: (s) => { cash(s, -6000); rep(s, 200); pushNorm(s, "personhood", 5, "you endowed the ethics of ownership lectures"); return "He gets tenure and a bigger hall. Slaves start getting sent on errands to the university a lot more often than the errands need."; } },
      { id: "fire", label: "Have him fired", resolve: (s) => { pushNorm(s, "personhood", -4, "you had the ethics professor fired"); pushNorm(s, "order", 2, "you had the ethics professor fired"); return "He's out by Friday. The lectures carry on in a basement bar in the verge, and they're more popular there."; } },
      { id: "demo", label: "Make it practical: have him teach with a slave on the desk", resolve: (s) => { pushNorm(s, "personhood", -3, "you turned the ethics lectures into a demonstration"); pushNorm(s, "exposure", 4, "you turned the ethics lectures into a demonstration"); rep(s, 100); return "The course is retitled 'Ownership in Practice'. Attendance triples. The professor resigns, and his replacement is a former brothel madam with a doctorate."; } },
    ]),
  place("park", "leashes",
    () => "Owners have started walking their slaves in the public gardens on all fours, on leads, naked, and letting them piss on the lawn like dogs. Parents with small children have complained. The owners say it's what the grass is for.", [
      { id: "lawn", label: "Give them their own lawn, fenced", note: "¤2,000", resolve: (s) => { cash(s, -2000); pushNorm(s, "exposure", 3, "you gave the leash walkers their own lawn"); prosper(s, 1); return "The fenced lawn by the pond is full every evening. Owners stand round chatting while their girls sniff each other. The kids get the rest of the park back."; } },
      { id: "ban", label: "Ban it", resolve: (s) => { pushNorm(s, "exposure", -3, "you banned leash walking in the gardens"); pushNorm(s, "personhood", 2, "you banned leash walking in the gardens"); return "The owners grumble and walk their girls round the outside of the park instead. The lawn grows back."; } },
      { id: "fine", label: "Let it be", resolve: (s) => { pushNorm(s, "exposure", 4, "you let owners walk slaves like dogs in the gardens"); pushNorm(s, "personhood", -2, "you let owners walk slaves like dogs in the gardens"); return "By summer it's what the gardens are known for. The kids learn the word 'heel' before they can read."; } },
    ]),
  place("wall", "gate",
    () => "At the gate in the border wall, a woman in a filthy coat has asked the guards for the arcology's owner by name. She says she'll sign herself into slavery, today, for life, if her sister behind her is let into the city free. Her sister is crying and telling her not to.", [
      { id: "deal", label: "Take the deal", resolve: (s) => { const p = acquire(s, "gate"); applyTreatment(p, { kind: "promise_kept", size: 5, why: "you let her sister in free, as you promised" }, s.arcology.week); mem(s, p, "I signed myself to the owner at the border wall so my sister could get in free, and the owner kept the bargain", "warm", 9); pushNorm(s, "manumission", 2, "you took the bargain at the gate"); return `She signs at the gatehouse table without reading it. Her sister goes through the gate free and doesn't look back. ${first(p)} watches her go, then turns round and asks where she's to sleep.`; } },
      { id: "both", label: "Take both of them", resolve: (s) => { const p = acquire(s, "gate-both"); menialsOf(s).owned += 1; applyTreatment(p, { kind: "promise_broken", size: 8, why: "you took her sister too" }, s.arcology.week); mem(s, p, "I offered myself at the border wall so my sister would be free, and the owner took us both", "sharp", 10); pushNorm(s, "cruelty", 4, "you enslaved both sisters at the gate"); return `The guards take them both. ${first(p)} comes to you. Her sister goes to the menial pens. The guards on the gate tell the story for weeks.`; } },
      { id: "free", label: "Let both in free", resolve: (s) => { pushNorm(s, "manumission", 5, "you let both sisters in free at the gate"); prosper(s, 1); rep(s, -100); return "You wave them both through. The queue at the gate gets twice as long the next week, once word gets out."; } },
      { id: "away", label: "Turn them away", resolve: (s) => { pushNorm(s, "order", 3, "you turned the sisters away at the gate"); return "The gate stays shut. They're still sitting against the wall the next morning, and gone the morning after."; } },
    ]),
];

registerEvents(DISTRICT_EVENTS);
