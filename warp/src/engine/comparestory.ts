/**
 * A DAY IN THE LIFE — the Compare screen's households, told as a story instead of a list.
 *
 * Five scenes, each chosen from the same numbers the scorecard reads: the morning (who wakes first,
 * and how the slave is kept), the street (patrols, crime, what people wear, and one of the laws
 * being kept or broken), the slave's own day, dinner (what the family says about you), and a letter
 * from a cousin in the place you are comparing it with, which carries the biggest difference
 * between the two. The same society and the same week always tell the same story.
 *
 * With a narrator model configured, the screen can hand these facts to it and ask for the day in
 * full prose (storyBrief). Without one, this is the story.
 */
import type { Person, SaveState } from "./types";
import { rng } from "./rng";
import { generatePerson } from "./generate";
import { figureFor, household, METRICS, type Outfits, type Society } from "./compare";
import { NORMS, NORM_IDS, normLine } from "./culture";
import { WARDROBE } from "../data/wardrobe";
import { call, parseJson } from "../llm";
import { compliance } from "./lawlife";
import { lawsOf } from "./court";
import { LAW_BY_ID, type LawDef } from "../data/laws";

export interface Cast {
  wife: string;
  husband: string;
  surname: string;
  /** The household slave, or in the Old World the woman who cleans their stairwell. */
  slave: string;
  kids: number;
}

export function castOf(x: Society): Cast {
  const wife = figureFor(x, "citizen") as Person;
  const husband = generatePerson({ seed: `${x.name} husband ${x.id} household`, sex: "male", age: 37 });
  const slave = figureFor(x, "slave") ?? generatePerson({ seed: `${x.name} cleaner ${x.id} stairwell`, sex: "female", age: 29 });
  return { wife: wife.name, husband: husband.name, surname: wife.surname ?? husband.surname ?? "", slave: slave.name, kids: 1 + (rng(`compare:${x.id}:kids`).int(0, 2)) };
}

/** "the Webers", "the Santoses". */
const family = (surname: string) => `the ${surname}${/(s|x|z|ch|sh)$/.test(surname) ? "es" : "s"}`;
const kidsWord = (n: number) => (n === 1 ? "their son" : n === 2 ? "the two children" : "the three children");

/** The law of yours most worth watching on the street: one you wrote, if you wrote any. */
function streetLaw(s: SaveState): LawDef | undefined {
  const ls = lawsOf(s).map((x) => LAW_BY_ID[x.id]).filter((l): l is LawDef => !!l);
  return ls.filter((l) => l.id.startsWith("custom_")).sort((a, b) => a.name.localeCompare(b.name))[s.arcology.week % Math.max(1, ls.filter((l) => l.id.startsWith("custom_")).length)] ?? ls[0];
}

function morning(x: Society, c: Cast): string {
  const n = x.norms, h = household(x);
  if (x.kind === "oldworld") return `${c.wife} ${c.surname}'s alarm goes at six. The heating in the flat is off again, so she makes the coffee in her coat and gets ${kidsWord(c.kids)} into their school clothes while ${c.husband} checks whether the trams are running today.`;
  if (!h.slave) return `${c.wife} ${c.surname} makes the coffee herself. The household can't afford a slave of its own, and ${c.husband} says so most mornings, looking at the neighbours' door.`;
  const wakes = n.personhood >= 35
    ? `${c.slave} wakes at six in her own small room, makes the coffee, and has ten minutes with a book before the house is up.`
    : n.personhood <= -35
      ? `${c.slave} sleeps on a mat by the kitchen door and is up before five. The smell of the coffee she has made is what wakes ${family(c.surname)}.`
      : `${c.slave} is up first, as always. By the time ${c.wife} comes into the kitchen the coffee is made and the children's shoes are lined up by the door.`;
  const temper = n.cruelty >= 50
    ? ` The coffee is a minute late. ${c.husband} takes the cane down from its hook by the fridge without getting up from the table, and nobody else looks up.`
    : n.cruelty <= -40 ? ` ${c.husband} thanks her for it, and means it.` : "";
  const extra = h.slaves > 1 ? ` The household keeps ${h.slaves} slaves; ${c.slave} is the one who runs the kitchen.` : "";
  return wakes + temper + extra;
}

function street(s: SaveState, x: Society, c: Cast): string {
  const n = x.norms;
  const out: string[] = [];
  if (x.kind === "oldworld") {
    out.push(`On the way to work ${c.wife} passes two shops that closed this month and a queue outside the food bank that has started before dawn.`);
    out.push(x.crime >= 45 ? "She keeps her bag in front of her and her phone in her pocket." : "The streets are safe enough in daylight.");
    out.push("On the tram, the screens are running a story about the Free Cities: slave markets, towers full of money. A man across from her says he'd go tomorrow if they'd let him in as a citizen.");
    return out.join(" ");
  }
  out.push(n.order >= 40 ? `A patrol checks ${c.wife}'s papers at the lift, as it does every morning; she has the card out before they ask.` : n.order <= -25 ? `Nobody checks anything at the lift. ${c.wife} holds the doors for a woman with a pram.` : `There's a patrol at the lift, but they wave her through.`);
  if (x.crime >= 45) out.push("Someone was robbed on her floor last week, and she walks the long way, past the cameras.");
  const hh = household(x);
  if (hh.dress && hh.dress.score > 0) out.push(`${x.name} dresses by ${hh.dress.code.name.toLowerCase()}: ${hh.dress.code.look.charAt(0).toLowerCase()}${hh.dress.code.look.slice(1)}`);
  if (hh.citizen.clothes === "no clothing") out.push(hh.slave && hh.slave.clothes !== "no clothing"
    ? `Every citizen on the concourse is naked, because the law says so; the slaves are the ones in clothes, carrying the shopping in ${hh.slave.clothes}. ${c.wife} stopped noticing her own nakedness years ago; she notices the tourists noticing it.`
    : `Nobody on the concourse is dressed, citizens included: the law says so. ${c.wife} stopped noticing her own nakedness years ago; she notices the tourists noticing it.`);
  else if (hh.dress && hh.dress.score > 0) { if (n.exposure >= 50) out.push("A couple of slaves are being used against the railing by the fountain. Nobody slows down to watch."); }
  else out.push(n.exposure >= 50 ? "On the concourse, half the slaves she passes are naked, and a couple are being used against the railing by the fountain. Nobody slows down to watch."
    : n.exposure >= 15 ? "On the concourse, slaves in short uniforms carry their owners' shopping, and a naked one stands on a plinth outside the clothes shop as an advertisement."
    : n.exposure <= -25 ? "On the concourse, every slave is covered to the wrist and ankle. A girl with a bare shoulder gets a look from a patrol." : "On the concourse, slaves go about their owners' errands in plain uniforms.");
  if (x.kind === "yours") {
    const l = streetLaw(s);
    if (l) {
      const k = compliance(s, l).total;
      out.push(k > 30 ? `The ${l.name} is posted by the lifts: "${l.text}" ${c.wife} keeps it without thinking about it any more. So does everyone on her floor.`
        : k > 0 ? `The ${l.name} is posted by the lifts: "${l.text}" ${c.wife} keeps it. Her neighbour grumbles about it, and keeps it too.`
        : `Someone has scratched half the notice of the ${l.name} off the wall by the lift. ${c.wife} keeps it while a patrol is in sight.`);
    }
  } else {
    const l = x.laws.length ? x.laws[(s.arcology.week + x.name.length) % x.laws.length] : undefined;
    const d = x.beliefs[0];
    if (l) out.push(`The ${l.name} is posted at every lift in ${x.name}: "${l.text}"${d ? ` Above it, a banner in the city's own words: "${d.text}"` : ""}`);
    else if (d) out.push(`A banner hangs the length of the concourse in ${x.name}'s own words: "${d.text}"`);
  }
  return out.join(" ");
}

function slaveDay(x: Society, c: Cast): string {
  const n = x.norms, h = household(x);
  if (x.kind === "oldworld") return `The woman who cleans their stairwell is called ${c.slave}. She came over the border in the back of a lorry and owes the man who brought her more than she will earn in six years. By law she is free. She has never been paid.`;
  if (!h.slave) return "";
  const s = h.slave;
  const out: string[] = [];
  out.push(`${c.slave} does the shopping at eleven, ${s.clothes === "no clothing" ? "naked" : s.clothes === "body oil" ? "naked and oiled" : `in ${s.clothes}`}, ${s.collar} at her throat${s.shoes === "barefoot" ? ", barefoot on the tiles" : ""}.`);
  out.push(n.personhood >= 35 ? "The grocer asks after her, by name, and gives her a pastry for herself."
    : n.personhood <= -35 ? "The grocer talks over her head to the owner of the slave behind her, about the price of fish."
    : "The grocer takes the list from her without looking at her face.");
  if (n.cruelty >= 50) out.push("On the way back she passes a slave being whipped outside a bar for dropping a tray. She doesn't slow down; she knows better.");
  if (n.feet >= 30) out.push(`A man stops her on the concourse to admire her soles, and asks, very politely, whether her owners would mind if he kissed them.`);
  if (n.modification >= 40) out.push(`${family(c.surname).replace(/^t/, "T")} are saving for her implants; everyone's slave on their floor has had something done.`);
  if (n.reversal >= 30) out.push(`On Thursdays ${c.husband} kneels to wash her feet. The neighbours think it's romantic.`);
  out.push(n.manumission >= 30 ? `She has four years left on the contract the household drew up for her freedom, and she counts them.`
    : n.manumission <= -30 ? "She will die a slave. Nobody in the house has ever said otherwise, least of all her." : "Freedom comes up now and then, the way a holiday abroad does.");
  return out.join(" ");
}

function dinner(s: SaveState, x: Society, c: Cast, yours: Society): string {
  if (x.kind === "oldworld") return `At dinner ${c.husband} reads out a headline about ${yours.name}. "They've got slaves doing the jobs we used to do," he says. ${c.wife} says at least there are jobs there. They don't talk about it again.`;
  if (x.kind === "yours") {
    const st = s.arcology.public_standing;
    return st >= 3 ? `At dinner ${c.husband} talks about the owner the way people talk about a good football manager: the new laws, the rumours from the penthouse, whether you'll put in another fountain. "Say what you like," he says, "the place works."`
      : st <= -3 ? `At dinner nobody mentions the owner, because ${c.wife}'s sister was fined last month and it's still raw. ${c.husband} says, quietly, that there are other arcologies.`
      : `At dinner they argue about the owner, as everyone does: ${c.husband} likes the order, ${c.wife} likes the money, neither of them likes the patrols.`;
  }
  const a = x.attitude ?? 0;
  return a <= -30 ? `At dinner ${c.husband} says ${yours.name} is building up its guard again, and that someone in ${x.name} should do something about it before it's too late. ${c.wife} tells him not in front of the children.`
    : a >= 30 ? `At dinner they talk about a weekend in ${yours.name}. ${c.wife} has heard the shopping is better there, and the slaves prettier.`
    : `At dinner ${yours.name} comes up only once, when ${c.husband} complains about the price of goods shipped through it.`;
}

/** The biggest difference between the two, as a cousin would write it in a letter. */
function letter(x: Society, other: Society, c: Cast): string {
  const cand = METRICS.filter((m) => !(m.who === "slave" && (x.kind === "oldworld" || other.kind === "oldworld")))
    .map((m) => ({ m, d: m.score(other) - m.score(x) })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d))[0];
  const from = `${c.wife}'s cousin writes from ${other.name}`;
  if (!cand || Math.abs(cand.d) < 8) return `${from}. Life there sounds much the same, she says, only the weather is different. ${c.wife} is a little disappointed.`;
  const { m, d } = cand;
  const better = d > 0;
  const bits: Record<string, [string, string]> = {
    wealth: ["that everyone there has money, and she's bought a second flat", "that money is tight there, and asks whether there's work going"],
    safety: ["that she walks home at two in the morning and never thinks about it", "that she's had her bag snatched twice this year"],
    liberty: ["that nobody has asked for her papers since she arrived", "that she has to carry her papers to buy bread"],
    service: ["that her household keeps three slaves now, and she hasn't cooked in a year", "that she does her own cleaning, and misses having help"],
    treatment: ["that nobody there would dream of hitting a slave in the street", "that she saw a slave beaten half to death outside the market and nobody stopped it"],
    standing: ["that people there ask slaves their names, and wait for the answer", "that she's learned not to speak to slaves there; it embarrasses people"],
    way_out: ["that her own slave will be free in three years, and they've planned a party", "that nobody there frees a slave, ever, and people laugh when she asks"],
    covered: ["that slaves there are dressed like office girls", "that she has stopped noticing the naked ones"],
  };
  const says = bits[m.id]?.[better ? 0 : 1] ?? (better ? "that things are better there" : "that things are worse there");
  const react = better ? `${c.wife} reads it out at breakfast. ${c.husband} says her cousin always did exaggerate.` : `${c.wife} reads it out at breakfast, and ${c.husband} says, "Well. Aren't we lucky."`;
  return `${from}: she says ${says}. ${react}`;
}

/** The whole day, in five scenes. `other` is the place it is being compared with. */
export function dayInTheLife(s: SaveState, x: Society, other: Society, yours: Society): string[] {
  const c = castOf(x);
  return [morning(x, c), street(s, x, c), slaveDay(x, c), dinner(s, x, c, yours), letter(x, other, c)].filter(Boolean);
}

/* ── the narrator's telling ─────────────────────────────────────────────────────────────────── */

const names = (slot: string) => WARDROBE.filter((g) => g.slot === slot).map((g) => g.name);

/** Everything the game knows about a place, as the narrator should read it: the laws word for word. */
function facts(s: SaveState, x: Society): string[] {
  const out: string[] = [];
  if (x.kind === "yours") {
    const laws = lawsOf(s).map((l) => LAW_BY_ID[l.id]).filter((l): l is LawDef => !!l);
    out.push(laws.length ? `LAWS IN FORCE, WORD FOR WORD (binding; everyone in the city lives by them):\n${laws.map((l) => `- The ${l.name}: "${l.text}" (${compliance(s, l).total > 30 ? "kept willingly" : compliance(s, l).total > 0 ? "kept, grudgingly" : "often broken where patrols can't see"})`).join("\n")}` : "LAWS IN FORCE: none beyond the owner's word.");
    const pol = x.laws.filter((l) => !laws.some((k) => k.name === l.name));
    if (pol.length) out.push(`POLICIES: ${pol.map((l) => `${l.name}: ${l.text}`).join(" | ")}`);
    const st = s.arcology.public_standing;
    out.push(`THE CITY'S OPINION OF THE OWNER: ${st >= 3 ? "good" : st <= -3 ? "poor" : "mixed"}; reputation ${Math.round(s.arcology.rep)}.`);
  } else if (x.kind === "neighbour") {
    out.push(x.laws.length ? `LAWS IN FORCE, WORD FOR WORD (binding; passed by its court):\n${x.laws.map((l) => `- The ${l.name}: "${l.text}"`).join("\n")}` : "LAWS IN FORCE: none worth naming.");
    out.push(`WHAT THE CITY BELIEVES (its doctrines, in its own words): ${x.beliefs.map((l) => `${l.name}: "${l.text}"`).join(" | ")}`);
    out.push(`ITS FEELING TOWARD THE PLAYER'S ARCOLOGY: ${(x.attitude ?? 0) <= -30 ? "hostile" : (x.attitude ?? 0) >= 30 ? "friendly" : "wary"}.`);
  } else {
    out.push(`THE OLD WORLD'S LAWS: ${x.laws.map((l) => `${l.name}: ${l.text}`).join(" | ")}`);
  }
  const dc = household({ ...x, written: undefined }).dress;
  if (dc) out.push(`THE DRESS CODE THE CITY HAS COME TO: ${dc.code.name}: ${dc.code.look}${dc.because.length ? ` (from ${dc.because.join(", ")})` : " (nothing has shaped it yet)"}${dc.runnerUp ? `. Also pulling at it: ${dc.runnerUp.code.name} (${dc.runnerUp.because.join(", ")}).` : ""} The laws still win over it.`);
  if (x.kind === "yours" && x.beliefs.length) out.push(`WHAT THE CITY BELIEVES (its doctrines): ${x.beliefs.map((l) => `${l.name}: "${l.text}"`).join(" | ")}`);
  out.push(`HOW PEOPLE BEHAVE (habits, −100…+100): ${NORM_IDS.map((n) => `${NORMS[n].name} ${Math.round(x.norms[n])}: ${normLine(n, x.norms[n])}`).join(" | ")}`);
  out.push(`PROSPERITY ${Math.round(x.prosperity)} of 200; CRIME ${Math.round(x.crime)} of 100; SECURITY ${Math.round(x.security)} of 100.`);
  return out;
}

export interface Written { outfits: Outfits; story: string[] }

/** The request: the facts, the family, the wardrobe, and the shape of the answer. */
export function writeBrief(s: SaveState, x: Society, other: Society): { system: string; user: string } {
  const c = castOf(x), h = household({ ...x, written: undefined });
  const slaves = x.kind !== "oldworld";
  return {
    system: [
      "You write short literary fiction set in a dark future of arcology city-states where slavery is legal, and you answer only with JSON.",
      "The laws you are given are binding and literal. Everything you write must obey them: what people wear, what they do in public, how slaves are treated. If a law says citizens may not be dressed, the citizens in your story are naked, the husband too. If a law contradicts a habit, the law wins where patrols can see and the habit shows where they can't.",
      "Never invent a law, clause, exemption, amendment or penalty. Quote a law only as given.",
      "Plain, concrete prose: specific objects and actions, no moralising, no summary lines. Every character is an adult except the children, who appear only as children, dressed, at breakfast or school, and never in a sentence with anything sexual.",
    ].join(" "),
    user: [
      `THE PLACE: ${x.name}${x.kind === "yours" ? ", the arcology the player owns" : x.kind === "neighbour" ? `, ${x.where}` : ", the countries outside the Free Cities, where slavery is illegal"}.`,
      ...facts(s, x),
      `THE FAMILY: ${c.wife} ${c.surname} (34), her husband ${c.husband} (37), and ${kidsWord(c.kids)}.`,
      slaves ? `THEIR SLAVE: ${c.slave}, 22, an adult woman.` : `THE WOMAN WHO CLEANS THEIR STAIRWELL: ${c.slave}, a trafficked debt worker.`,
      x.written
        ? `WHAT THEY WEAR (already settled; keep it, and return it unchanged): citizen ${x.written.citizen_clothes}, ${x.written.citizen_shoes}; husband ${x.written.husband}${x.written.slave_clothes ? `; slave ${x.written.slave_clothes}, ${x.written.slave_collar}, ${x.written.slave_shoes}` : ""}.`
        : `HOW THE GAME WOULD DRESS THEM (a starting point: change anything the laws or habits contradict): citizen ${h.citizen.clothes}, ${h.citizen.shoes}; husband ${h.husband}${h.slave ? `; slave ${h.slave.clothes}, ${h.slave.collar}, ${h.slave.shoes}` : ""}.`,
      `THE COUSIN WRITES FROM: ${other.name}. What life is like there: ${other.kind === "oldworld" ? "no slavery; poorer and less safe" : NORM_IDS.filter((n) => Math.abs(other.norms[n] - x.norms[n]) >= 25).map((n) => normLine(n, other.norms[n])).join(" ") || "much the same"}`,
      ``,
      `WARDROBE (choose exact names): clothes: ${names("clothes").join("; ")}. collars: ${names("collar").join("; ")}. shoes: ${names("shoes").join("; ")}.`,
      ``,
      `Answer with this JSON and nothing else:`,
      `{"citizen_clothes": "<clothes name>", "citizen_shoes": "<shoes name>", "husband": "<what he wears, a few words, or 'nothing'>",${slaves ? ` "slave_clothes": "<clothes name>", "slave_collar": "<collar name>", "slave_shoes": "<shoes name>", "slaves": <how many slaves the household keeps, 0-5>,` : ""} "story": ["<morning>", "<the street, with a law in force being kept or broken>", "<${slaves ? "the slave's day" : `${c.slave}'s day`}>", "<dinner, and what they say about ${x.kind === "yours" ? "the owner" : "the player's arcology"}>", "<a letter from the cousin in ${other.name}>"]}`,
      `Each story entry is one paragraph of 60 to 110 words.`,
    ].join("\n"),
  };
}

/** Check a narrator's answer against the wardrobe; anything it made up falls back to the game's choice. */
export function readWritten(x: Society, text: string): Written | null {
  const j = parseJson<Record<string, unknown>>(text);
  if (!j || !Array.isArray(j.story)) return null;
  const story = (j.story as unknown[]).filter((p): p is string => typeof p === "string" && p.trim().length > 20).map((p) => p.trim());
  if (story.length < 3) return null;
  const base = household({ ...x, written: undefined });
  const pick = (v: unknown, slot: string, dflt: string) => (typeof v === "string" && names(slot).includes(v) ? v : dflt);
  const outfits: Outfits = {
    citizen_clothes: pick(j.citizen_clothes, "clothes", base.citizen.clothes),
    citizen_shoes: pick(j.citizen_shoes, "shoes", base.citizen.shoes),
    husband: typeof j.husband === "string" && j.husband.trim() ? j.husband.trim().slice(0, 80) : base.husband,
  };
  if (base.slave) {
    outfits.slave_clothes = pick(j.slave_clothes, "clothes", base.slave.clothes);
    outfits.slave_collar = pick(j.slave_collar, "collar", base.slave.collar);
    outfits.slave_shoes = pick(j.slave_shoes, "shoes", base.slave.shoes);
    if (typeof j.slaves === "number") outfits.slaves = Math.max(0, Math.min(5, Math.round(j.slaves)));
  }
  return { outfits, story };
}

/** Ask the narrator for the household and its day. Records the outfits against the society and the story against the pair. */
export async function writeDay(s: SaveState, x: Society, other: Society, model: string, fallback?: string): Promise<{ ok: boolean; written?: Written; model?: string; error?: string }> {
  const res = await call({ ...writeBrief(s, x, other), model, fallback, json: true, maxTokens: 1800, temperature: 0.85 });
  if (!res.ok) return { ok: false, error: res.error ?? "the narrator didn't answer" };
  const w = readWritten(x, res.text);
  return w ? { ok: true, written: w, model: res.model } : { ok: false, error: "the narrator's answer couldn't be read" };
}

/** A family moving from one place to the other, in a paragraph: what they'd gain and what they'd lose. */
export function moving(from: Society, to: Society): string {
  const c = castOf(from);
  const hasSlave = household(from).slaves > 0;
  const gains: string[] = [], losses: string[] = [];
  for (const m of METRICS) {
    if (m.who === "slave" && (!hasSlave || from.kind === "oldworld" || to.kind === "oldworld")) continue;
    const d = m.score(to) - m.score(from);
    if (Math.abs(d) < 10) continue;
    const who = m.who === "citizen" ? "they" : c.slave;
    (d > 0 ? gains : losses).push(`${who} would be ${d > 0 ? m.better : m.worse}`);
  }
  const head = `If ${family(c.surname)} packed up and moved from ${from.name} to ${to.name}`;
  if (!gains.length && !losses.length) return `${head}, they'd hardly notice. The laws would be different; the life would not.`;
  return `${head}, ${gains.length ? gains.join(", ") : "nothing would get better"}${losses.length ? `. But ${losses.join(", ")}` : ""}.`;
}
