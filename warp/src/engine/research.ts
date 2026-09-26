/**
 * RESEARCH — projects the arcology can take on, and the ones your city makes possible.
 *
 * A few are infrastructure anyone can build toward (recyclers, a science laboratory). The rest open
 * up only when the city is the kind of place that would want them: obedience collars in a cruel or
 * ordered city, gentle conditioning in a kind one, sole science where feet are sacred, a body
 * sculpting institute where nobody keeps the body they were born with. A project runs for some weeks
 * at a weekly cost (it shows under the arcology's "In progress"), and when it finishes it changes the
 * city for good: habits move, money flows, the household changes.
 */
import type { Person, SaveState } from "./types";
import { clamp } from "./psyche";
import { cultureOf, pushNorm, type Norm } from "./culture";
import { lawsOf } from "./court";
import { cityOf } from "./city";
import { defensesOf } from "./battles";
import { feetOf } from "./genitals";

export interface ResearchDef {
  id: string;
  name: string;
  what: string;
  cost: number;
  weeks: number;
  /** Null when it can be started, else why not. */
  needs: (s: SaveState) => string | null;
  /** When it finishes. Returns the report line. */
  done: (s: SaveState) => string;
  /** Every week after it's finished. */
  weekly?: (s: SaveState) => number;
}

const n = (s: SaveState, k: Norm) => cultureOf(s).norms[k];
const law = (s: SaveState, id: string) => lawsOf(s).some((l) => l.id === id);
const doc = (s: SaveState, id: string) => !!s.arcology.doctrines[id];
const districtLevel = (s: SaveState, kind: string) => cityOf(s).districts.filter((d) => d.kind === kind).reduce((m, d) => Math.max(m, d.level), 0);
export const researched = (s: SaveState, id: string) => !!s.research?.done.includes(id);
const house = (s: SaveState): Person[] => Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);
const either = (...xs: [boolean, string][]) => (xs.some(([ok]) => ok) ? null : xs.map(([, why]) => why).join(", or "));

export const RESEARCH: ResearchDef[] = [
  { id: "recyclers", name: "Water and waste recyclers", cost: 30000, weeks: 6,
    what: "Closed-loop water and waste plants under the Works. Pollution from industry falls by 40%, and the recovered material sells for ¤400 a week.",
    needs: (s) => (districtLevel(s, "industrial") >= 1 ? null : "needs a Works district"),
    done: (s) => { s.arcology.prosperity = clamp(s.arcology.prosperity + 2, 5, 200); return "The recyclers are running. The air over the Works is clearer within the month."; },
    weekly: () => 400 },
  { id: "reclamation", name: "Total reclamation", cost: 55000, weeks: 8,
    what: "Nothing leaves the arcology as waste. Industrial pollution falls by half again, and reclaimed metals bring in ¤800 a week.",
    needs: (s) => (!researched(s, "recyclers") ? "needs the recyclers first" : districtLevel(s, "industrial") >= 3 ? null : "needs a Works district at level 3"),
    done: () => "Total reclamation is online. The Works are the cleanest industrial floors in the Free Cities.",
    weekly: () => 800 },
  { id: "science_lab", name: "Science laboratory", cost: 40000, weeks: 6,
    what: "A proper research laboratory in the spire. Every later project finishes a quarter faster, and you can run two at once.",
    needs: (s) => either([districtLevel(s, "academy") >= 1, "needs an Academy district"], [districtLevel(s, "civic") >= 2, "a Civic hall at level 2"]),
    done: (s) => { s.arcology.rep += 200; return "The science laboratory opens on the floor below your penthouse. Two teams can work at once now."; } },
  { id: "obedience_collars", name: "Obedience collars", cost: 45000, weeks: 7,
    what: "Collars that shock on a word. Your slaves' fear rises every week and they stop thinking about running; the city grows stricter and crueller.",
    needs: (s) => either([n(s, "order") >= 30, "order at 30"], [n(s, "cruelty") >= 30, "cruelty at 30"], [law(s, "curfew") || law(s, "public_discipline"), "a curfew or public discipline law"]),
    done: (s) => { pushNorm(s, "order", 8, "your obedience collars"); pushNorm(s, "cruelty", 4, "your obedience collars"); for (const p of house(s)) p.bond.fear = clamp(p.bond.fear + 10, 0, 100); return "The first obedience collars are locked on your household. The others in the city want them too."; },
    weekly: (s) => { for (const p of house(s)) { p.bond.fear = clamp(p.bond.fear + 0.8, 0, 100); p.bond.hope = clamp(p.bond.hope - 0.3, 0, 100); } return 0; } },
  { id: "gentle_conditioning", name: "Gentle conditioning", cost: 35000, weeks: 6,
    what: "Reward-based training with no pain in it. Your slaves' trust and hope rise every week; the city grows gentler.",
    needs: (s) => either([n(s, "cruelty") <= -20, "the city gentle (cruelty −20)"], [law(s, "welfare_code"), "the Slave Welfare Code"], [doc(s, "paternalist"), "Paternalism adopted"]),
    done: (s) => { pushNorm(s, "cruelty", -6, "your gentle conditioning program"); return "The gentle conditioning program is running. Your slaves start looking forward to their lessons."; },
    weekly: (s) => { for (const p of house(s)) { p.bond.hope = clamp(p.bond.hope + 0.6, 0, 100); p.bond.fear = clamp(p.bond.fear - 0.4, 0, 100); } return 0; } },
  { id: "sole_science", name: "Sole science", cost: 25000, weeks: 5,
    what: "Creams, stones and techniques that keep a slave's soles soft and perfect whatever she does. Every foot in your household is kept soft, and the city reveres feet more.",
    needs: (s) => either([n(s, "feet") >= 30, "feet revered (30)"], [law(s, "barefoot_statute"), "the Barefoot Statute"], [doc(s, "podolatry"), "Podolatry"]),
    done: (s) => { pushNorm(s, "feet", 8, "your sole science"); for (const p of house(s)) feetOf(p).soles = "soft"; return "Sole science is perfected. Every slave in the household has soles like a newborn's."; },
    weekly: (s) => { for (const p of house(s)) feetOf(p).soles = "soft"; return 0; } },
  { id: "flesh_institute", name: "Body sculpting institute", cost: 60000, weeks: 8,
    what: "The best surgeons in the Free Cities, working for you. The clinic trade brings in ¤700 a week and the city wants to be remade.",
    needs: (s) => either([n(s, "modification") >= 30, "the city remade (30)"], [law(s, "flesh_freedom"), "the Flesh Freedom Act"], [doc(s, "transformation"), "Transformationism"]),
    done: (s) => { pushNorm(s, "modification", 8, "your body sculpting institute"); s.arcology.rep += 300; return "The body sculpting institute opens. Clients fly in from three continents."; },
    weekly: () => 700 },
  { id: "purity_institute", name: "Natural beauty institute", cost: 30000, weeks: 6,
    what: "Diet, exercise and old-fashioned care instead of the knife. Your slaves' health improves every week, and the city prizes the natural body.",
    needs: (s) => either([n(s, "modification") <= -30, "the city pure (−30)"], [law(s, "purity_law"), "the Purity Law"], [doc(s, "body_purist"), "Body Purism"]),
    done: (s) => { pushNorm(s, "modification", -8, "your natural beauty institute"); return "The natural beauty institute is open. Your household has never looked healthier."; },
    weekly: (s) => { for (const p of house(s)) p.health.health = clamp(p.health.health + 0.6, -100, 100); return 0; } },
  { id: "patrol_ai", name: "Patrol intelligence", cost: 50000, weeks: 7,
    what: "Every camera and robot guard in the arcology on one mind that answers to you. Crime falls every week and security rises.",
    needs: (s) => either([defensesOf(s).sentinels >= 1, "a robot guard corps"], [n(s, "order") >= 40, "order at 40"]),
    done: (s) => { s.arcology.security = clamp(s.arcology.security + 10, 0, 100); pushNorm(s, "order", 6, "your patrol intelligence"); return "Patrol intelligence is online. Nothing moves in the arcology that you can't see."; },
    weekly: (s) => { s.arcology.crime = clamp(s.arcology.crime - 1.5, 0, 100); return 0; } },
  { id: "registry_chips", name: "Registry chips", cost: 30000, weeks: 5,
    what: "A chip under every slave's skin with her owner's name on it. Crime and slave-snatching fall; the city sees slaves more as property.",
    needs: (s) => either([n(s, "personhood") <= -30, "slaves seen as property (−30)"], [law(s, "chattel_act"), "the Chattel Act"]),
    done: (s) => { pushNorm(s, "personhood", -8, "your registry chips"); return "Every slave in the arcology is chipped. A runaway can be found in minutes."; },
    weekly: (s) => { s.arcology.crime = clamp(s.arcology.crime - 1, 0, 100); return 0; } },
  { id: "slave_school", name: "Slave academy", cost: 40000, weeks: 7,
    what: "A real school for slaves: reading, languages, trades. Your slaves' education rises every week, and the city sees them more as people.",
    needs: (s) => either([n(s, "personhood") >= 30, "slaves seen as people (30)"], [law(s, "slave_testimony"), "the Slave Testimony Act"]),
    done: (s) => { pushNorm(s, "personhood", 8, "your slave academy"); return "The slave academy opens its doors. The first class is your own household."; },
    weekly: (s) => { for (const p of house(s)) p.persona.education = clamp(p.persona.education + 0.5, 0, 100); return 0; } },
  { id: "covenant_rites", name: "Covenant rites", cost: 25000, weeks: 5,
    what: "A liturgy and a temple for owners who kneel. Pilgrims come, bringing ¤400 a week; the city admires owners who serve.",
    needs: (s) => either([n(s, "reversal") >= 30, "owners who serve admired (30)"], [law(s, "collar_covenant"), "the Collar Covenant"], [doc(s, "supplication"), "Supplicationism"]),
    done: (s) => { pushNorm(s, "reversal", 8, "your covenant rites"); return "The covenant temple is consecrated. The first pilgrims kneel on its steps before dawn."; },
    weekly: () => 400 },
  { id: "freedom_bonds", name: "Freedom bonds", cost: 30000, weeks: 5,
    what: "Slaves buy their freedom in instalments, and the arcology takes a cut: ¤500 a week, and the city expects good slaves to go free.",
    needs: (s) => either([n(s, "manumission") >= 25, "freeing slaves expected (25)"], [law(s, "manumission_registry"), "the Manumission Registry"]),
    done: (s) => { pushNorm(s, "manumission", 6, "your freedom bonds"); return "Freedom bonds go on sale. The first buyer is a laundress who has been saving for eleven years."; },
    weekly: () => 500 },
  { id: "propaganda_net", name: "Propaganda network", cost: 35000, weeks: 5,
    what: "Every screen in the arcology on your message. Campaigns push half again as hard, and speeches carry further.",
    needs: (s) => (s.fctv?.on ? null : "needs FCTV switched on"),
    done: (s) => { s.arcology.rep += 150; return "The propaganda network is live. Your face is on every screen in the arcology at the top of every hour."; } },
  { id: "fertility_program", name: "Fertility program", cost: 35000, weeks: 6,
    what: "Hormones, monitoring and a clinic. Every slave in your household who can conceive becomes much more fertile.",
    needs: (s) => either([doc(s, "repopulation"), "Repopulationism"], [doc(s, "eugenics"), "Eugenics"]),
    done: (s) => { for (const p of house(s)) p.womb.fertility = clamp(p.womb.fertility + 25, 0, 100); return "The fertility program is running. The clinic expects a busy year."; } },
  { id: "climate_shield", name: "Climate shielding", cost: 70000, weeks: 9,
    what: "Storm walls, scrubbers and cooling for the whole structure. Pollution falls by a fifth and the weather hits the arcology less hard.",
    needs: (s) => ((s.world?.pollution ?? 0) >= 35 || (s.world?.strain ?? 0) >= 40 ? null : "only worth it once pollution or climate strain is high"),
    done: (s) => { if (s.world) s.world.strain = clamp(s.world.strain - 10, 0, 100); return "Climate shielding is finished. The next storm passes over the arcology like rain on a windscreen."; } },
];
export const RESEARCH_BY_ID: Record<string, ResearchDef> = Object.fromEntries(RESEARCH.map((r) => [r.id, r]));

export interface ResearchState { done: string[] }
export const researchOf = (s: SaveState): ResearchState => (s.research ??= { done: [] });

const running = (s: SaveState) => s.arcology.projects.filter((p) => p.on_complete.effect === "research");
export const slots = (s: SaveState) => (researched(s, "science_lab") ? 2 : 1);

/** Weeks it will take here: the lab takes a quarter off, each Academy level a little more. */
export function weeksFor(s: SaveState, r: ResearchDef): number {
  const lab = researched(s, "science_lab") ? 0.75 : 1;
  const academy = 1 - Math.min(0.3, districtLevel(s, "academy") * 0.07);
  return Math.max(2, Math.round(r.weeks * lab * academy));
}

export function canStart(s: SaveState, id: string): string | null {
  const r = RESEARCH_BY_ID[id];
  if (!r) return "no such project";
  if (researched(s, id)) return "already done";
  if (running(s).some((p) => p.on_complete.payload?.id === id)) return "already under way";
  if (running(s).length >= slots(s)) return slots(s) > 1 ? "two projects are already running" : "a project is already running (a science laboratory lets you run two)";
  return r.needs(s);
}

export function startResearch(s: SaveState, id: string): string {
  const why = canStart(s, id);
  if (why) return `Can't start it: ${why}.`;
  const r = RESEARCH_BY_ID[id];
  const weeks = weeksFor(s, r);
  s.arcology.projects.push({ id: `research-${id}`, title: r.name, kind: "research", weeks_left: weeks, weekly_cost: Math.round(r.cost / weeks), on_complete: { effect: "research", payload: { id } } });
  return `${r.name} is under way: ${weeks} weeks at ¤${Math.round(r.cost / weeks).toLocaleString()} a week.`;
}

export function completeResearch(s: SaveState, id: string): string {
  const r = RESEARCH_BY_ID[id];
  if (!r || researched(s, id)) return "";
  researchOf(s).done.push(id);
  return r.done(s);
}

/** Weekly: what finished projects keep doing. Returns the money they brought in. */
export function tickResearch(s: SaveState): number {
  let cash = 0;
  for (const id of researchOf(s).done) cash += RESEARCH_BY_ID[id]?.weekly?.(s) ?? 0;
  return cash;
}
