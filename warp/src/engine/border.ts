/**
 * THE BORDER.
 *
 * Everybody who lives here came through the gate, and the gate is where the city decides who it
 * is. These come up there: a column of refugees, a truck with something in the back, a family rich
 * enough to buy their way past the queue, a deserter with something to sell, a guard who's been
 * charging women his own fee, somebody over the wall. A wall, patrols and a shut border all make
 * the gate busier; the stance itself is set on the city screen (engine/citizens).
 */
import type { Person, SaveState } from "./types";
import { clamp } from "./psyche";
import { pushNorm } from "./culture";
import { registerEvents, type EventDef } from "./events";
import { applyTreatment, refresh } from "./obedience";
import { generatePerson } from "./generate";
import { newMemory } from "./memory";
import { menialsOf } from "./menials";
import { citizensOf, type Klass } from "./citizens";
import { startRumor } from "./social";

const wall = (s: SaveState) => (s.city?.districts ?? []).some((d) => d.kind === "wall" && d.level > 0);

/** More people in the city, of one class. */
function admit(s: SaveState, k: Klass, n: number): void {
  const c = citizensOf(s);
  c[k] += n;
  s.arcology.population = c.poor + c.middle + c.rich;
}

function acquire(s: SaveState, why: string, age?: number): Person {
  const p = generatePerson({ seed: `border:${s.id}:${s.arcology.week}:${why}`, week: s.arcology.week, ...(age ? { age } : {}) });
  p.status = "owned";
  p.assignment = "rest";
  p.origin.acquired_week = s.arcology.week;
  p.origin.acquired_how = "taken at the border";
  s.people[p.id] = p;
  s.memory[p.id] = newMemory();
  refresh(p, s.memory[p.id]);
  return p;
}

const crime = (s: SaveState, by: number) => { s.arcology.crime = clamp(s.arcology.crime + by, 0, 100); };
const security = (s: SaveState, by: number) => { s.arcology.security = clamp(s.arcology.security + by, 0, 100); };

function gate(id: string, extra: number, seed: (s: SaveState) => string, options: EventDef["options"], when: (s: SaveState) => boolean = () => true): EventDef {
  return {
    id: `border_${id}`, severity: "notable", endogenous: true,
    candidates: (s) => (s.arcology.week >= 3 && when(s) ? [{}] : []),
    weight: (s) => { const c = citizensOf(s); return 0.6 + extra + (wall(s) ? 0.8 : 0) + c.patrols * 0.3 + (c.border === "closed" ? 0.5 : 0); },
    seed: (s) => seed(s), options,
  };
}

export const BORDER_EVENTS: EventDef[] = [
  gate("refugees", 0.4,
    () => "Three hundred people have walked out of the interior and are sitting in the dust outside the gate: families, a lot of women, a few men with the look of people who've done things to get here. They've got nothing. The guards want to know what you want done with them before it gets dark.", [
      { id: "in", label: "Let them in as citizens", resolve: (s) => { admit(s, "poor", 300); pushNorm(s, "personhood", 3, "you let three hundred refugees in"); crime(s, 2); return "The gate opens. By the end of the week they're sleeping in every stairwell on the outer ring and working anywhere that'll pay them in food. Rents on the verge go up."; } },
      { id: "menials", label: "Take them as menials", resolve: (s) => { menialsOf(s).owned += 300; pushNorm(s, "cruelty", 4, "you enslaved three hundred refugees at the gate"); return "They're let in a hundred at a time, and collared on the other side. Three hundred menials on your books by morning. The ones who saw it happen to the first hundred didn't run, because there was nowhere to run to."; } },
      { id: "pick", label: "Let in the useful ones and turn the rest back", resolve: (s) => { admit(s, "middle", 40); admit(s, "poor", 60); pushNorm(s, "order", 3, "you picked the useful refugees at the gate"); return "Your clerks set up a table and go down the line: trades, papers, teeth, tits. A hundred get in. Two hundred walk back the way they came, and some of them don't make it."; } },
      { id: "away", label: "Turn them all back", resolve: (s) => { pushNorm(s, "order", 4, "you turned three hundred refugees away"); pushNorm(s, "personhood", -2, "you turned three hundred refugees away"); return "The guards fire over their heads until they move. By the morning there's nothing outside the gate but rubbish and two graves."; } },
    ]),
  gate("truck", 0.3,
    () => "Your patrol stopped a supply truck at the gate. Behind the crates of tinned meat there's a false wall, and behind it, rifles, two kilos of something white, and two girls with their wrists cable-tied, both very much alive and very much awake. The driver is offering ¤3,000 for everyone to forget it.", [
      { id: "bribe", label: "Take his money and wave it through", note: "+¤3,000", resolve: (s) => { s.arcology.cash += 3000; crime(s, 5); startRumor(s, "the owner's gate can be paid", { salience: 6 }); return "The truck rolls through. The girls are on sale in the verge by the weekend, and the rifles turn up in a robbery a fortnight later."; } },
      { id: "seize", label: "Seize the lot and sell the cargo", note: "+¤6,000", resolve: (s) => { s.arcology.cash += 6000; security(s, 2); return "The driver goes to the cells. The guns go to your armoury's buyers and the powder to people who don't ask. The girls are sold on through the market for what they'll fetch."; } },
      { id: "keep", label: "Seize it, and keep one of the girls", resolve: (s) => { const p = acquire(s, "truck"); applyTreatment(p, { kind: "kindness", size: 3, why: "you cut her out of a smuggler's truck" }, s.arcology.week); security(s, 2); return `You have the cable ties cut. One of them, ${p.name}, looks at you like she's trying to work out which kind of owner you'll be, and goes where she's told. The other is sold on.`; } },
      { id: "free", label: "Seize it and let the girls go", resolve: (s) => { security(s, 2); pushNorm(s, "manumission", 3, "you freed the girls in the smuggler's truck"); admit(s, "poor", 2); return "The driver goes to the cells and the guns to your armoury. The girls are given a meal and a bed in the gatehouse and walk into the city in the morning, free and with nothing."; } },
    ]),
  gate("tycoon", 0.2,
    () => "A family has pulled up at the gate in three armoured cars: a banker, his wife, his mistress, four bodyguards and a lot of luggage. They want to skip the queue and the checks and be citizens by tonight. He's offering ¤20,000, and his wife wants to know what the tax on people like them is going to be.", [
      { id: "take", label: "Take the money and let them straight in", note: "+¤20,000", resolve: (s) => { s.arcology.cash += 20000; admit(s, "rich", 7); return "They're in by dinner. The banker opens an account at the exchange the next morning, and three of his friends phone to ask how he did it."; } },
      { id: "double", label: "Tell him the price just doubled", note: "+¤40,000, maybe", resolve: (s) => { const yes = (s.arcology.rep ?? 0) > 3000 || s.arcology.prosperity > 90; if (yes) { s.arcology.cash += 40000; admit(s, "rich", 7); return "He swears, then pays. His wife smiles at you over his shoulder like she's just found out who's actually in charge."; } return "He laughs, turns the cars round, and takes his money to the next arcology along. He tells everyone there why."; } },
      { id: "cut", label: "Let them in, and drop the tax on the rich to 5% to bring more like them", resolve: (s) => { s.arcology.cash += 20000; admit(s, "rich", 7); citizensOf(s).tax.rich = 0.05; return "They're in by dinner, and by the end of the month the queue of armoured cars at your gate is a fixture. You've got a city of the rich and a smaller tax take from each of them."; } },
      { id: "queue", label: "Send them to the back of the queue like everyone else", resolve: (s) => { pushNorm(s, "order", 2, "you made a rich family queue at the gate"); return "They queue for six hours in the dust with everyone else, and the gate guards enjoy every minute of it. Then they go somewhere else."; } },
    ]),
  gate("deserter", 0.2,
    (s) => `A soldier in a ${s.arcology.neighbours[0]?.name ?? "neighbouring"} uniform has come to the gate with his hands up and a hard drive in his pocket. He says it's his unit's patrol routes and the names of their men inside your city, and he wants asylum for it, and for his girlfriend, who's still on the other side.`, [
      { id: "grant", label: "Give him asylum and take the drive", resolve: (s) => { security(s, 5); const n = s.arcology.neighbours[0]; if (n) n.attitude = clamp(n.attitude - 15, -100, 100); admit(s, "middle", 1); return "The drive is real. Your security chief rolls up four of their men in the market by the end of the week. Next door is furious, and the girlfriend never arrives."; } },
      { id: "back", label: "Hand him back", resolve: (s) => { const n = s.arcology.neighbours[0]; if (n) n.attitude = clamp(n.attitude + 15, -100, 100); return "His own side collects him at the gate the next morning. They thank you politely, and you don't ask what happens to him."; } },
      { id: "both", label: "Take the drive, then hand him back anyway", resolve: (s) => { security(s, 5); const n = s.arcology.neighbours[0]; if (n) n.attitude = clamp(n.attitude + 5, -100, 100); pushNorm(s, "cruelty", 2, "you took the deserter's secrets and handed him back"); return "You get the routes and the names, and his own side gets him back, gagged. Everyone wins except him."; } },
    ], (s) => s.arcology.neighbours.length > 0),
  gate("fee", 0.3,
    () => "Women coming through the gate have been complaining, the ones with the nerve to. One of the guards on the night shift has been running his own inspection: anyone pretty, travelling alone, gets taken into the back of the gatehouse and searched until he's satisfied, and if she won't, her papers aren't in order. The other guards think it's funny.", [
      { id: "punish", label: "Have him flogged at the gate where they can see", resolve: (s) => { pushNorm(s, "order", 4, "you had a guard flogged for abusing women at the gate"); security(s, -1); return "He's flogged at the gate on the morning shift change, with the queue watching. The women coming through look at the guards differently after that, and the guards look at the ground."; } },
      { id: "fee", label: "Make it official: a search fee, or a search", note: "+¤1,500 a week, for a while", resolve: (s) => { s.arcology.cash += 1500; pushNorm(s, "cruelty", 4, "you made a search fee at the gate official"); pushNorm(s, "exposure", 3, "you made a search fee at the gate official"); return "The gatehouse gets a price list. Most women pay. The ones who can't go in the back. The queue gets shorter, because word gets out, and the women who still come know exactly what they're coming to."; } },
      { id: "nothing", label: "Ignore it", resolve: (s) => { pushNorm(s, "cruelty", 2, "you ignored the guard at the gate"); crime(s, 1); return "Nothing happens to him. By the end of the month two more guards are doing it."; } },
    ]),
  gate("over", 0.5,
    () => "Someone went over the border wall last night: a rope, a blanket over the wire, and a drop that broke somebody's ankle. The sentries found the blood at dawn and a woman hiding in a culvert on the outside, a citizen's slave who'd had enough. Her owner is at the gatehouse demanding her back, and she's begging the sentries not to.", [
      { id: "return", label: "Give her back to her owner", resolve: (s) => { pushNorm(s, "order", 3, "you returned a runaway who went over the wall"); return "She's dragged back through the gate screaming. Her owner tips the sentries. The rope stays on the wall for a week as a warning."; } },
      { id: "buy", label: "Buy her off him yourself", note: "¤5,000", resolve: (s) => { s.arcology.cash -= 5000; const p = acquire(s, "wall"); applyTreatment(p, { kind: "kindness", size: 5, why: "you bought her off the owner she ran from" }, s.arcology.week); return `You pay him what he asks and he goes, sulking. ${p.name} is carried up to the penthouse with her ankle strapped, and doesn't know yet whether she's been rescued or just sold.`; } },
      { id: "free", label: "Let her go, and pay him off", note: "¤5,000", resolve: (s) => { s.arcology.cash -= 5000; pushNorm(s, "manumission", 4, "you freed a runaway at the wall"); return "You pay her owner and tell the sentries to let her limp away. She doesn't look back. Three more slaves try the wall that month."; } },
      { id: "fix", label: "Return her, and raise the wall", note: "¤8,000", resolve: (s) => { s.arcology.cash -= 8000; security(s, 3); pushNorm(s, "order", 2, "you raised the wall after a runaway went over it"); return "She goes back to her owner, and the wall gets another metre of concrete and a second line of wire. Nobody goes over it again for a long time."; } },
    ], wall),
];

registerEvents(BORDER_EVENTS);
