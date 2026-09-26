/**
 * WALK THE CITY — go down from the penthouse and see what you've made.
 *
 * Pick a place: the concourse, or any district you have. What you see there is drawn from the
 * city's habits (engine/culture), the laws in force, your doctrines, what people know you did, the
 * rumours, your famous slaves, the weather and the state of the district. It opens as a moment, so
 * with a model the narrator writes it out and you can step into it: talk to someone, intervene,
 * make an example of somebody. Whatever you do out there is done in public, and the city takes it
 * back into its habits when the walk ends.
 */
import type { Person, SaveState } from "./types";
import { cultureOf, cultureBrief, NORM_IDS, type Norm } from "./culture";
import { lawsBrief, lawsOf } from "./court";
import { LAW_BY_ID } from "../data/laws";
import { cityOf, districtDef } from "./city";
import { DISTRICTS, type DistrictKind } from "../data/districts";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { openMoment } from "./moments";
import { rng } from "./rng";

export interface Place { id: string; kind: DistrictKind | "concourse" | "verge"; name: string; blurb: string; condition: number }

export const WALK_OPTIONS = [
  "Stop and talk to someone",
  "Watch for a while",
  "Step in",
  "Head back up to the penthouse",
];

/** Where you can walk: the concourse, one place per kind of district you have, and the verge. */
export function places(s: SaveState): Place[] {
  const city = cityOf(s);
  const out: Place[] = [{ id: "concourse", kind: "concourse", name: "The concourse", blurb: "The arcology's main floor: the lifts, the plaza, the fountain and the cafés.", condition: 70 }];
  const seen = new Set<string>();
  for (const d of city.districts) {
    if (d.kind === "vacant" || d.kind === "spire" || seen.has(d.kind)) continue;
    seen.add(d.kind);
    const def = districtDef(d) ?? DISTRICTS.find((x) => x.kind === d.kind);
    const same = city.districts.filter((x) => x.kind === d.kind);
    out.push({ id: d.kind, kind: d.kind, name: def?.name ?? d.kind, blurb: def?.blurb ?? "", condition: Math.round(same.reduce((n, x) => n + x.condition, 0) / same.length) });
  }
  if (city.districts.some((d) => d.kind === "vacant" && d.ring >= 2)) out.push({ id: "verge", kind: "verge", name: "The verge", blurb: "The empty ground at the edge, where the people who clean the arcology live in whatever they built.", condition: 25 });
  return out;
}

type Vignette = { w: number; text: string };

const PLACE_LINES: Record<Place["kind"], string[]> = {
  concourse: [
    "The lifts open onto the plaza every thirty seconds and let out another crowd: office workers, shoppers, slaves on errands with their owners' lists.",
    "The fountain is running. Children are throwing coins in it while their mothers talk at the café tables.",
  ],
  residential: [
    "Laundry hangs across the gallery between the flats. A slave is carrying four bags of shopping up the stairs because the lift is out again.",
    "Somebody's music is coming through a door. A slave is on her knees scrubbing the landing outside it.",
  ],
  commercial: [
    "Every shop has a slave in the window, modelling what's for sale.",
    "A jeweller is fitting a collar on a slave while her owner haggles over the price.",
  ],
  industrial: [
    "The works are loud and hot. The slaves on the line wear ear defenders and nothing else.",
    "A shift change: a hundred workers come out of the gates, grey with dust, and head for the canteens.",
  ],
  civic: [
    "The slave registry has a queue out of the door. Owners with papers, slaves standing behind them.",
    "Two police officers are walking a slave in cuffs up the steps of the court.",
  ],
  docks: [
    "A container is open on the quay and the slaves inside it are being hosed down before inspection.",
    "Dockers are unloading crates of fruit from the Cape. A slave boy is stealing oranges from the broken ones.",
  ],
  academy: [
    "A class of slaves in uniforms is walking in a line across the courtyard, reciting something in unison.",
    "Students in the library are arguing about whether a slave can own anything.",
  ],
  barracks: [
    "Your militia is drilling on the parade ground. A few slaves are carrying water to them.",
    "Soldiers off duty are playing cards outside the armory with a slave sitting on the table between them.",
  ],
  pleasure: [
    "The club doors are open and the music comes out into the street. Slaves in the doorways call out prices.",
    "A tourist from the Old World is staring at everything with his mouth open, and a slave has already got his wallet.",
  ],
  verge: [
    "The verge is shacks and shipping containers, with cooking smoke over all of it. The people who clean your arcology live here.",
    "Kids are playing in the dust between the containers. One of them has a toy collar on a doll.",
  ],
  spire: ["The spire's lobby is marble and quiet."],
};

const NORM_LINES: Record<Norm, { hi: string[]; lo: string[] }> = {
  cruelty: {
    hi: ["A man in a good suit is caning his slave's thighs outside a café. The queue for the lift steps around them without looking.",
      "A slave is chained to a railing by her collar with a sign around her neck saying what she did. People throw their cigarette ends at her."],
    lo: ["A woman stops to fix the strap on her slave's shoe and says sorry when she pinches her.",
      "A citizen raises his hand to his slave, and three people turn to stare at him until he puts it down."],
  },
  exposure: {
    hi: ["A citizen has his slave bent over a planter in the middle of the plaza, and the people going past don't slow down.",
      "Two naked slaves are washing the windows of a café while the customers watch them."],
    lo: ["Every slave you see is in a grey uniform, buttoned to the neck.",
      "A couple is fined by a patrol for kissing their slave on a bench."],
  },
  personhood: {
    hi: ["A shopkeeper asks a slave her name before he asks what her owner wants.",
      "A slave argues with a clerk about her owner's order, and wins."],
    lo: ["A citizen uses his slave as a footrest at a café table, his feet up on her back while he reads.",
      "Slaves are parked in a rack outside the gym, locked in by the collar, like bicycles."],
  },
  reversal: {
    hi: ["A banker is on his knees on the tiles, tying his slave's sandal. People smile at them as they pass.",
      "A citizen in a collar walks two steps behind his own slave, carrying her bags."],
    lo: [],
  },
  feet: {
    hi: ["Three citizens are kneeling at the fountain, washing slaves' feet in turn. There is a queue of slaves waiting.",
      "A slave walks barefoot across the plaza, and people step aside so she doesn't have to."],
    lo: [],
  },
  manumission: {
    hi: ["A freedwoman runs the noodle stall. Her old owner is in the queue.",
      "A slave is counting coins into a registry jar with her name on it."],
    lo: ["A slave's registry tag has LIFE punched through it."],
  },
  modification: {
    hi: ["A clinic has a girl in the window to show what a week's surgery gets you. She turns slowly so people can see.",
      "Half the slaves you pass have been redone somewhere: lips, breasts, hips, a tail."],
    lo: ["A woman is heckled in the street for her implants.",
      "A salon sign offers to take implants out, discreetly."],
  },
  order: {
    hi: ["A patrol is checking every slave's papers at the lift, and the queue goes back across the plaza.",
      "Cameras on every lamp post. A drone follows a slave who is walking too slowly."],
    lo: ["Two traders are fighting over a stall and nobody comes to stop them.",
      "A slave with no owner in sight is sleeping on a bench, and nobody moves her on."],
  },
};

/** For a city that hasn't made up its mind: both kinds of people, side by side. */
const MIXED_LINES: Record<Norm, string[]> = {
  cruelty: ["A woman slaps her slave for dropping a bag. A man at the next table frowns at her, and she frowns back.",
    "One owner drags his slave along by the collar; the next one walks hers on a loose leash and lets her look in the shop windows."],
  exposure: ["Some slaves on the concourse are dressed and some are naked, and nobody seems sure which is the done thing.",
    "A café has put up a sign asking owners to keep their slaves clothed at the tables. Someone has scribbled over it."],
  personhood: ["A shopkeeper takes an order from a slave but won't give her the change; he hands it to her owner instead.",
    "Two citizens at a café are arguing about whether a slave can be a witness to anything. Neither is winning."],
  reversal: ["A slave says something sharp to her owner in the queue, and he laughs instead of hitting her. People pretend not to notice."],
  feet: ["A barefoot slave is picking her way across the hot tiles by the fountain. An old man offers her his newspaper to stand on."],
  manumission: ["A freedwoman is selling flowers by the lifts. Some people buy from her; some cross the plaza to avoid her."],
  modification: ["Two slaves are comparing their implants on a bench, and a woman walking past shakes her head at them."],
  order: ["A single patrol officer leans against a pillar, watching the crowd and doing nothing much."],
};

/** Everyday life, for any city. */
const DAILY: string[] = [
  "A slave is on her knees polishing the brass on the lift doors. She moves aside every time they open.",
  "A father is buying his daughter an ice cream while their slave holds the shopping.",
  "Two slaves carrying the same kind of basket meet at the fountain and swap news in quick whispers before their owners notice.",
  "A man is selling tickets to tonight's fights in the pit. He shouts the names of the slaves on the card.",
  "A businesswoman is on her phone at a café table, with her slave kneeling beside her chair holding the saucer.",
];

const LAW_LINES: Record<string, string> = {
  public_discipline: "A notice by the lift reminds citizens that the Public Discipline Act protects an owner's right to punish in public.",
  welfare_code: "A clinic van is parked by the lifts, checking slaves for bruises under the Welfare Code.",
  nudity_ordinance: "A slave stops at the edge of the plaza, takes off her dress, and folds it into her bag, as the Nudity Ordinance says she must.",
  decency_statute: "A patrol officer is writing a fine for a slave whose shirt is unbuttoned, under the Decency Statute.",
  manumission_registry: "There is a line of slaves at the Manumission Registry, each with a folder of receipts.",
  slave_testimony: "A slave is giving evidence on the court steps against a man in a good coat, and a reporter is filming it.",
  chattel_act: "An insurance office advertises slave cover under the Chattel Act: loss, damage, theft.",
  collar_covenant: "A covenant clerk is witnessing a citizen kneel to a slave on the court steps, and the crowd applauds.",
  barefoot_statute: "The shoe shops have signs in the window: FOR CITIZENS ONLY, by the Barefoot Statute.",
  sole_protection: "A poster at the fountain lists what the Sole Protection Act fines for a caned sole.",
  purity_law: "The clinic has a licence from the Purity Law board framed in the window, and no customers.",
  flesh_freedom: "Clinic touts hand out coupons for breast work in the concourse, which the Flesh Freedom Act made legal to advertise.",
  curfew: "The curfew siren goes, and every slave on the concourse starts walking faster.",
  open_streets: "There are no patrols. A slave on an errand strolls through the plaza eating an apple.",
};

function youLines(s: SaveState, escort?: Person): Vignette[] {
  const out: Vignette[] = [];
  const st = s.arcology.public_standing;
  const reversal = cultureOf(s).norms.reversal;
  if (st >= 4) out.push({ w: 2, text: "People recognise you. A few nod, a woman at a café table raises her glass, and a shopkeeper hurries out to offer you something." });
  else if (st <= -4) out.push({ w: 2, text: "People recognise you. The café tables go quiet as you pass, and a man spits on the tiles where you were standing." });
  else out.push({ w: 1, text: "A few people recognise you and look away, or look twice." });
  if (s.player.owned_by) {
    const keeper = s.people[s.player.owned_by];
    out.push({ w: 4, text: reversal >= 20
      ? `People see your collar, and see ${keeper?.name ?? "her"}'s name on it. An old woman touches your arm and says she thinks it's beautiful.`
      : `People see your collar. Someone has chalked a cartoon on a wall of you on your knees in front of ${keeper?.name ?? "a slave"}, and a group of teenagers are laughing at it.` });
  }
  for (const d of (s.deeds ?? []).filter((x) => x.public).slice(-3)) out.push({ w: 3, text: `People here know what you did. ${d.summary}` });
  const r = [...s.rumors].sort((a, b) => b.salience - a.salience)[0];
  if (r) out.push({ w: 2, text: `At the lift, you overhear someone: "${r.content.replace(/^"|"$/g, "")}"` });
  const famous = Object.values(s.people).filter((p) => p.status === "owned" && (p.assignment === "be an idol" || (p.fame?.prestige ?? 0) >= 2));
  for (const p of famous.slice(0, 2)) out.push({ w: 2, text: `${p.name}'s face is on a screen above the plaza. Two girls are copying her hair.` });
  if (escort) {
    const n = cultureOf(s).norms;
    out.push({ w: 5, text: n.personhood >= 25
      ? `${escort.name} walks beside you. A shopkeeper speaks to her directly, and she answers for you both.`
      : n.cruelty >= 30
        ? `${escort.name} walks a step behind you with her eyes down. A man reaches out and squeezes her ass as she passes, and looks at you to see if you mind.`
        : `${escort.name} walks with you. People look at her, then at you, working out what she is to you.` });
  }
  return out;
}

/** The opening of a walk: what you see there this week. */
export function walkScene(s: SaveState, place: Place, escort?: Person): string {
  const r = rng(`walk:${s.arcology.week}:${place.id}:${s.turn}:${escort?.id ?? ""}`);
  const c = cultureOf(s);
  const pool: Vignette[] = [];
  for (const n of NORM_IDS) {
    const v = c.norms[n];
    const lines = v >= 25 ? NORM_LINES[n].hi : v <= -25 ? NORM_LINES[n].lo : MIXED_LINES[n];
    for (const t of lines) pool.push({ w: Math.abs(v) >= 25 ? Math.abs(v) / 20 : 0.8, text: t });
  }
  for (const law of lawsOf(s)) {
    if (LAW_LINES[law.id]) pool.push({ w: 2.5, text: LAW_LINES[law.id] });
    else if (LAW_BY_ID[law.id]) {
      const l = LAW_BY_ID[law.id];
      const keep = Object.entries(l.pull).reduce((n, [k, v]) => n + c.norms[k as Norm] * Math.sign(v as number), 0) >= 0;
      pool.push({ w: 3, text: `A notice by the lift, with your seal on it, announces the ${l.name}: "${l.text}" Two citizens are arguing in front of it.` });
      pool.push({ w: 4, text: keep
        ? `You see the ${l.name} being kept without anyone watching: people doing exactly what it says, as if it had always been the rule. "${l.text}" A child is explaining it to a younger one.`
        : `You see the ${l.name} being broken in plain sight, a few steps from a patrol who pretends not to notice. Someone has scrawled "your law, not ours" across its notice.` });
    }
  }
  for (const [id, st] of Object.entries(s.arcology.doctrines)) {
    const d = DOCTRINE_BY_ID[id];
    if (d && st.adoption >= 40) pool.push({ w: 1, text: `A preacher on a crate is telling a small crowd about ${d.noun}. More of them are nodding than you'd expect.` });
  }
  pool.push(...youLines(s, escort));
  for (const t of DAILY) pool.push({ w: 0.6, text: t });
  if (s.arcology.crime >= 45) pool.push({ w: 2, text: "A woman screams that her bag's been taken. The thief is already gone down the service stairs." });
  if (place.condition <= 35) pool.push({ w: 2, text: "Half the lights are out, and the tiles are cracked. Water is dripping from a pipe nobody has fixed." });
  if (s.arcology.prosperity >= 110) pool.push({ w: 1, text: "Every storefront is taken, and there are people waiting for tables." });
  else if (s.arcology.prosperity <= 40) pool.push({ w: 1.5, text: "Half the shops are shuttered, with FOR LEASE signs going yellow in the windows." });
  const wx = s.world?.weather.kind;
  if (wx && ["storm", "superstorm"].includes(wx)) pool.push({ w: 2, text: "The storm is loud against the outer walls, and people are staying close to the lifts." });
  else if (wx === "heatwave") pool.push({ w: 2, text: "The cooling is struggling with the heat. Slaves are fanning their owners at the café tables." });

  const picked: string[] = [r.pick(PLACE_LINES[place.kind] ?? PLACE_LINES.concourse)];
  const left = [...pool];
  for (let i = 0; i < 4 && left.length; i++) {
    const v = r.weighted(left, (x) => x.w);
    picked.push(v.text);
    left.splice(left.indexOf(v), 1);
  }
  return picked.join("\n\n");
}

/** Go for a walk. Opens a moment; returns its id. */
export function startWalk(s: SaveState, placeId: string, escortId?: string): string {
  const place = places(s).find((p) => p.id === placeId) ?? places(s)[0];
  const escort = escortId ? s.people[escortId] : undefined;
  const id = openMoment(s, {
    person: escort?.id, title: `Walking ${place.name.replace(/^The /, "the ")}`, source: "walk",
    you: escort ? `You take ${escort.name} down to ${place.name.replace(/^The /, "the ").toLowerCase()} with you.` : `You go down to ${place.name.replace(/^The /, "the ").toLowerCase()} alone.`,
    happened: walkScene(s, place, escort),
  });
  const m = s.moments!.find((x) => x.id === id)!;
  m.walk = place.id;
  m.options = WALK_OPTIONS;
  return id;
}

export const WALK_SYSTEM = `You write a walk through the player's arcology in Free Cities, an adult text game about owning an arcology where slavery is legal. The player owns the arcology and is out in public.

Show the city as it is now, through what citizens and slaves are doing: how owners treat their slaves, how slaves carry themselves, what people say to each other and about the player. Everything you show must fit the CITY'S HABITS, the LAWS and what people know the player did. Name people with ordinary names and give them a line or two of their own. Two to four paragraphs. If the player does something, write it happening and write how the people around react; everyone can see. Do not write the player's feelings. Do not end the walk; stop where the player can act.

Then, on its own line, write OPTIONS: and under it exactly four lines, each starting with "- ", giving four different things the player could do next, in the player's voice and under twelve words each: one that talks to someone you described, one that intervenes, one that uses the moment for the player's pleasure or power, and one that moves on to somewhere else or goes home.`;

/** What the narrator is told about the city for a walk. */
export function walkContext(s: SaveState, placeId?: string): string {
  const place = places(s).find((p) => p.id === placeId) ?? places(s)[0];
  const docs = Object.entries(s.arcology.doctrines).map(([id, st]) => `${DOCTRINE_BY_ID[id]?.noun ?? id} (${Math.round(st.adoption)}%)`).join(", ");
  const deeds = (s.deeds ?? []).filter((d) => d.public).slice(-5).map((d) => `· ${d.summary}`).join("\n");
  const rumors = [...s.rumors].sort((a, b) => b.salience - a.salience).slice(0, 3).map((r) => `· "${r.content}"`).join("\n");
  return [
    `## WHERE\n${place.name}: ${place.blurb}${place.condition <= 35 ? " It is run down." : ""}`,
    `## THE CITY'S HABITS\n${cultureBrief(s) || "Nothing settled yet; citizens behave in all sorts of ways."}`,
    lawsBrief(s) ? `## LAWS IN FORCE\n${lawsBrief(s)}` : "",
    docs ? `## DOCTRINES\n${docs}` : "",
    `## THE PLAYER\nOwner of the arcology. Reputation ${Math.round(s.arcology.rep)}; the city's opinion of them is ${s.arcology.public_standing >= 3 ? "good" : s.arcology.public_standing <= -3 ? "poor" : "mixed"}.${s.player.owned_by ? ` Wears the collar of their slave ${s.people[s.player.owned_by]?.name ?? ""}, and people can see it.` : ""}`,
    deeds ? `## WHAT PEOPLE KNOW THE PLAYER DID\n${deeds}` : "",
    rumors ? `## WHAT PEOPLE ARE SAYING\n${rumors}` : "",
  ].filter(Boolean).join("\n\n");
}

/** Without a model: another thing you see, and what happens when you do something. */
export function walkOffline(s: SaveState, placeId: string | undefined, reply: string): string {
  const place = places(s).find((p) => p.id === placeId) ?? places(s)[0];
  const t = reply.toLowerCase();
  const more = walkScene(s, { ...place, id: `${place.id}:${reply.length}` }).split("\n\n").slice(1, 3).join("\n\n");
  if (/home|back up|penthouse|leave/.test(t)) return `You head back to the lifts. People make room for you.`;
  if (/talk|ask|speak/.test(t)) return `The person you stop is nervous at first, then talks: about the prices, about the patrols, about you. They say what everyone says, and watch your face while they say it.\n\n${more}`;
  if (/step in|stop|intervene|help/.test(t)) return `You step in. Everyone nearby stops what they're doing to watch what the arcology's owner does, and whatever you do next they'll be repeating by tonight.\n\n${more}`;
  return more || "You keep walking.";
}

