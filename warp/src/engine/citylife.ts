/**
 * THE CITY THIS WEEK — scenes from ordinary life, written into every week report.
 *
 * The week report used to be the bookkeeping: the ledger, the weather, who died. This is the city
 * living with what you've made of it. Every week the game gathers what is true right now (each
 * law and how well it's kept, the dress code, what the gene programs do, the menials at work, the
 * public works, finished research, the weather, the wars abroad, the city's habits) into
 * candidate scenes, each set somewhere in the arcology, and picks five from different places.
 * A scene it showed in the last four weeks sits out. About one in three ends with a small choice,
 * with small consequences, which does not use up the week's event slots.
 *
 * The game writes these, for free. The narrator writes the week in full only when asked
 * (cityProseBrief): it is one model call, and it is never made on its own.
 */
import type { SaveState } from "./types";
import { clamp } from "./psyche";
import { rng } from "./rng";
import { cultureOf, cultureBrief, NORM_IDS, normLine, pushNorm } from "./culture";
import { lawsOf } from "./court";
import { LAW_BY_ID, type LawDef } from "../data/laws";
import { compliance, pushWithLaw } from "./lawlife";
import { household, societies } from "./compare";
import { genomeOf, citizenShare, slaveShare, traitsFor } from "./genome";
import { menialsOf, perHousehold } from "./menials";
import { levelOf } from "./works";
import { globeOf } from "./globe";
import { worldOf } from "./world";
import { REGION_BY_ID } from "../data/districts";
import { WEATHER } from "../data/world";

export interface SceneOption { id: string; label: string; outcome: string; do: { cash?: number; standing?: number; rep?: number; crime?: number; population?: number; norm?: [string, number]; law?: [string, number] } }
export interface Scene { key: string; where: string; text: string; options?: SceneOption[]; picked?: string; result?: string }

interface Candidate extends Scene { w: number }

const WHERE = { spire: "The spire", concourse: "The concourse", residential: "The residential floors", verge: "The verge", docks: "The docks", farms: "The farms", clinics: "The clinics", market: "The market", plaza: "The plaza", works: "The works" } as const;
const LAW_PLACE: Record<string, string> = { cruelty: WHERE.market, exposure: WHERE.concourse, personhood: WHERE.market, reversal: WHERE.plaza, feet: WHERE.concourse, manumission: WHERE.plaza, modification: WHERE.clinics, order: WHERE.residential };

function lawScenes(s: SaveState, r: ReturnType<typeof rng>): Candidate[] {
  const out: Candidate[] = [];
  const ls = lawsOf(s).map((x) => LAW_BY_ID[x.id]).filter((l): l is LawDef => !!l);
  for (const l of ls) {
    const k = compliance(s, l).total;
    const where = LAW_PLACE[l.norm] ?? WHERE.concourse;
    const q = `"${l.text}"`;
    const custom = l.id.startsWith("custom_");
    if (k > 30) {
      out.push({ key: `law-kept:${l.id}`, where, w: custom ? 4.5 : 1.5, text: r.pick([
        `A tourist asks a shopkeeper why everyone does it. "It's the ${l.name}," she says, as if that explains everything, and points at the brass plaque by the door: ${q}`,
        `The ${l.name} is kept so completely that nobody remembers arguing about it. A schoolteacher on the ${where.toLowerCase().replace(/^the /, "")} uses it as her example of a good law.`,
        `A man from the Old World breaks the ${l.name} without knowing it exists. Three citizens correct him at once, politely, and one of them reads it out to him: ${q}`,
      ]) });
    } else if (k > 0) {
      out.push({ key: `law-grudge:${l.id}`, where, w: custom ? 4.5 : 1.5, text: `Two neighbours argue about the ${l.name} over the railing. One says it's the owner's business; the other says it's hers. They both keep it: ${q}` });
    } else {
      out.push({ key: `law-broken:${l.id}`, where, w: custom ? 5 : 2, text: `A patrol catches a man openly breaking the ${l.name} in front of a crowd. It says ${q} He says he's never heard of it. The patrol looks up at your cameras, waiting.`,
        options: [
          { id: "fine", label: "Fine him, loudly", outcome: "He pays. The crowd watches him pay.", do: { cash: 300, law: [l.id, 2] } },
          { id: "stocks", label: "The stocks, for a day", outcome: "He spends the day in the stocks with the law pinned to his chest. Nobody on that floor breaks it again this month.", do: { law: [l.id, 4], standing: -0.2 } },
          { id: "warn", label: "A warning", outcome: "He's let go. By evening everyone knows the law can be talked out of.", do: { law: [l.id, -2], standing: 0.2 } },
        ] });
    }
  }
  return out;
}

function dressScene(s: SaveState, r: ReturnType<typeof rng>): Candidate[] {
  const yours = societies(s)[0];
  const d = household(yours).dress;
  if (!d || !d.because.length) return [];
  return [{ key: `dress:${d.code.id}`, where: WHERE.concourse, w: 1.5, text: r.pick([
    `The tailors on the commercial ring are doing a roaring trade in ${d.code.name.toLowerCase()}: ${d.code.look.charAt(0).toLowerCase()}${d.code.look.slice(1)} A buyer from a neighbouring arcology is taking notes.`,
    `A girl just off the boat from the Old World stands on the concourse in the wrong clothes, staring. A woman takes her by the elbow to a shop that sells what people wear here.`,
  ]) }];
}

function geneScenes(s: SaveState, r: ReturnType<typeof rng>): Candidate[] {
  const out: Candidate[] = [];
  const kind = s.world?.weather.kind;
  for (const e of genomeOf(s).edits) {
    const c = citizenShare(s, e), sl = slaveShare(s, e);
    if (c + sl < 0.2) continue;
    const who = c >= sl ? "citizens" : "your slaves";
    const res = e.spec.resist;
    if ((res.heat ?? 0) > 0 && (kind === "heatwave" || kind === "hot")) out.push({ key: `gene-heat:${e.id}`, where: WHERE.verge, w: 4, text: `It's ${kind === "heatwave" ? "a heatwave" : "hot"}, and the ${e.name} program shows. The edited ${who} work through the afternoon on the outer decks while the unedited sit in the shade with wet cloths on their necks.` });
    if ((res.cold ?? 0) > 0 && (kind === "freeze" || kind === "cold")) out.push({ key: `gene-cold:${e.id}`, where: WHERE.verge, w: 4, text: `The freeze bursts pipes all over the outer blocks. The ${who} the ${e.name} program reached are out fixing them in shirtsleeves.` });
    if ((res.disease ?? 0) > 0) out.push({ key: `gene-fever:${e.id}`, where: WHERE.clinics, w: 1.5, text: `The fever ward at the clinic has two beds filled, both newcomers the ${e.name} program never reached. A nurse says it used to be forty.` });
    if ((res.pollution ?? 0) > 0) out.push({ key: `gene-air:${e.id}`, where: WHERE.works, w: 1.5, text: `On a smog day the ${e.name} program's people jog the upper track without masks, and the tourists photograph them doing it.` });
    if (e.spec.health) out.push({ key: `gene-health:${e.id}`, where: WHERE.plaza, w: 1.2, text: `Men in their seventies do pull-ups on the bars in the plaza. Everyone knows which program paid for that.` });
    // Every trait the program gave them, in its own words, somewhere it would show.
    for (const t of traitsFor(e.spec, c >= sl ? "citizens" : "slaves")) {
      const place = t.tag === "senses" ? WHERE.residential : t.tag === "strength" || t.tag === "endurance" ? WHERE.works : t.tag === "intellect" ? WHERE.market : t.tag === "beauty" ? WHERE.concourse : t.tag === "fertility" ? WHERE.clinics : r.pick([WHERE.plaza, WHERE.concourse, WHERE.verge, WHERE.docks]);
      const lead = r.pick([
        `You can tell the ${e.name} program's ${who} by their ${t.name}.`,
        `A visitor from a neighbouring arcology asks about the ${t.name}, and three people explain the ${e.name} program at once.`,
        `The ${t.name} the ${e.name} program gave ${who} has become ordinary.`,
      ]);
      out.push({ key: `gene-trait:${e.id}:${t.name}`, where: place, w: 2.5, text: `${lead} ${t.what}` });
    }
    // And what they look like now, when the program changed that.
    const looks = [e.spec.skin && `${e.spec.skin} skin`, e.spec.hair && `${e.spec.hair} hair`, e.spec.eyes && `${e.spec.eyes} eyes`, e.spec.height && (e.spec.height > 0 ? "the extra height" : "the lost height")].filter(Boolean) as string[];
    if (looks.length) out.push({ key: `gene-look:${e.id}`, where: WHERE.concourse, w: 1.5, text: r.pick([
      `The ${e.name} program's ${looks.join(" and ")} are everywhere on the concourse now; the newcomers without them are the ones people look at twice.`,
      `A children's drawing competition on the concourse: every family in the pictures has the ${looks.join(" and ")} of the ${e.name} program.`,
    ]) });
    if (e.target !== "slaves" && c < 0.8) out.push({ key: `gene-wait:${e.id}`, where: WHERE.clinics, w: 2, text: `There's a queue outside the gene clinic: newcomers who arrived after the ${e.name} program ran, asking how they get it. The receptionist has a price list, and most of them read it and leave.`,
      options: [
        { id: "free", label: "A free clinic day, on the city", outcome: "The queue goes round the block. It's the most popular thing you've done in months.", do: { cash: -6000, standing: 0.8 } },
        { id: "price", label: "Keep the price", outcome: "The queue thins out. The ones who pay are the ones who'll stay.", do: { rep: 50 } },
      ] });
  }
  return out;
}

function menialScenes(s: SaveState, r: ReturnType<typeof rng>): Candidate[] {
  const m = s.menials ? menialsOf(s) : null;
  if (!m || !m.owned) return [];
  const out: Candidate[] = [];
  if (m.jobs.farms) out.push({ key: "men-farms", where: WHERE.farms, w: 1.5, text: `${m.jobs.farms.toLocaleString()} of your menials are on the hydroponic racks from before dawn. The overseer calls them by the numbers on their wrists, and the tomatoes are in the market by nine.` });
  if (m.jobs.lease) out.push({ key: "men-lease", where: WHERE.residential, w: 1.5, text: r.pick([
    `A citizen's leased menial walks his children to school, a step behind, carrying their bags. He's had her for a year and still doesn't know her name; the number on her wrist is enough.`,
    `The households that lease your menials complain about the price and renew anyway. There's a waiting list for the ones who can cook.`]) });
  if (m.treatment === "harsh" && m.owned > 50) out.push({ key: "men-harsh", where: WHERE.works, w: 2.5, text: `A menial in the labour gang collapses at the end of a double shift and doesn't get up. The overseer wants to know whether to send her to the clinic or to the incinerator.`,
    options: [
      { id: "clinic", label: "The clinic", outcome: "She's back on the line in a week. The gang saw you send her.", do: { cash: -300, norm: ["cruelty", -0.5] } },
      { id: "replace", label: "Replace her", outcome: "Another number comes up from the pens. The gang saw that too.", do: { norm: ["cruelty", 1] } },
    ] });
  if (m.jobs.public) out.push({ key: "men-public", where: WHERE.concourse, w: 1.2, text: `Your menials in public use stand at their posts on the concourse. The citizens use them on the way to work and don't break stride.` });
  if (m.jobs.sanitation) out.push({ key: "men-sanit", where: WHERE.verge, w: 1, text: `A crew of your menials works the ducts of the verge with scrapers and hoses. The air on the lower floors smells of bleach instead of the works.` });
  return out;
}

const WORK_SCENES: Record<string, string> = {
  hydroponics: "The market has fresh greens from the hydroponic towers for the first time in years, and the old women buy them just to hold them.",
  scrubbers: "The scrubber towers hum all night. A child in the verge sees a clear sky for the first time and asks her mother what it is.",
  police: "A new police station opens on the residential floors. The shopkeepers bring the officers coffee for the first week.",
  housing: "Families move into the new prefab blocks with everything they own on their backs. By Friday there are curtains in every window.",
  amenities: "The new park is full on Sunday: picnics, a string quartet, a slave walking a citizen's dogs.",
  civic_media: "The civic media office's evening bulletin is on every screen. People quote its jingle without meaning to.",
  hospital: "Your household's hospital wing has a waiting room with flowers in it. Nobody quite believes it.",
  comforts: "The servants' quarters have hot water now. The slaves take turns in the showers and come out singing.",
  climate_fund: "The climate fund pays for a mangrove planting in the Old World. The photographs run in a dozen papers with your arcology's name in the caption.",
};
function workScenes(s: SaveState): Candidate[] {
  return Object.entries(WORK_SCENES).filter(([id]) => levelOf(s, id) > 0).map(([id, text]) => ({ key: `works:${id}:${levelOf(s, id)}`, where: id === "hydroponics" ? WHERE.market : id === "police" || id === "housing" ? WHERE.residential : id === "amenities" ? WHERE.plaza : WHERE.works, w: 1.3, text }));
}

function worldScenes(s: SaveState, r: ReturnType<typeof rng>): Candidate[] {
  const out: Candidate[] = [];
  const w = worldOf(s);
  const def = WEATHER[w.weather.kind];
  if (def && w.weather.kind !== "clear") out.push({ key: `weather:${w.weather.kind}`, where: WHERE.verge, w: 1, text: `${def.line}${def.effect && def.effect !== "no effect" ? ` The verge feels it first: ${def.effect}.` : " The verge's windows are grey all day, and the lifts are full of people complaining about it."}` });
  for (const [id, run] of Object.entries(w.regions)) {
    if (run.state !== "war" && run.state !== "collapse") continue;
    const reg = REGION_BY_ID[id];
    out.push({ key: `refugees:${id}:${run.since}`, where: WHERE.docks, w: 2.5, text: `A fishing boat from ${reg?.name ?? "the war"} ties up at the docks with forty people on a deck built for eight. The harbour master wants to know what to do with them.`,
      options: [
        { id: "in", label: "Let them in", outcome: "They're housed in a warehouse and then in the verge. Some of them are working by the end of the month.", do: { population: 40, crime: 1, rep: 100 } },
        { id: "buy", label: "Buy the ones worth buying", outcome: "A broker goes through them with a clipboard. The rest are sent back out on the tide.", do: { cash: -2000, norm: ["personhood", -0.5] } },
        { id: "away", label: "Turn them away", outcome: "The boat is towed back out past the breakwater.", do: { rep: -100 } },
      ] });
  }
  const tech = globeOf(s).tech;
  if (tech.solar_skin?.done) out.push({ key: "tech-solar", where: WHERE.spire, w: 1, text: "The solar skin on the spire catches the sunrise and turns the whole arcology gold for a minute. Ships at sea use it to find the harbour." });
  if (tech.fusion?.done) out.push({ key: "tech-fusion", where: WHERE.works, w: 1, text: "A tour group from a neighbouring arcology is shown round the fusion hall and told nothing. Their engineer takes a photograph anyway; security takes the camera." });
  const hostile = s.arcology.neighbours.filter((n) => n.attitude <= -30);
  if (hostile.length) out.push({ key: `hostile:${hostile[0].id}`, where: WHERE.docks, w: 1.2, text: `Customs finds a crate from ${hostile[0].name} with a false bottom and nothing in it but a camera. Someone over there wants to know what you're building.` });
  return out;
}

function habitScenes(s: SaveState, r: ReturnType<typeof rng>): Candidate[] {
  const n = cultureOf(s).norms;
  const strong = NORM_IDS.filter((k) => Math.abs(n[k]) >= 35);
  return strong.map((k) => ({ key: `habit:${k}:${Math.sign(n[k])}`, where: r.pick([WHERE.plaza, WHERE.concourse, WHERE.market]), w: 1, text: `${normLine(k, n[k])} You see it three times on the way from the lift to the fountain.` }));
}

function householdScenes(s: SaveState): Candidate[] {
  const out: Candidate[] = [];
  for (const p of Object.values(s.people).filter((x) => x.status === "owned" && ["whore", "public servant", "be an idol", "serve in the club"].includes(x.assignment)).slice(0, 2)) {
    out.push({ key: `hh:${p.id}:${p.assignment}`, where: p.assignment === "be an idol" ? WHERE.plaza : WHERE.concourse, w: 1.2, text: p.assignment === "be an idol" ? `${p.name}'s face is on the screen above the plaza, and a teenage girl below it is copying her hair.` : `${p.name} is working the concourse. A regular brings her a coffee first, every time.` });
  }
  const per = s.menials ? perHousehold(s) : 0;
  if (per >= 2) out.push({ key: "hh-slaves", where: WHERE.residential, w: 1, text: `On the residential floors every household has its slaves, ${per.toFixed(1)} a household on average. The corridors in the morning are full of them, running errands with their owners' lists.` });
  return out;
}

/* ── ordinary life: always something, somewhere ──────────────────────────────────────────────── */

type Life = { key: string; where: string; when?: (s: SaveState) => boolean; text: (s: SaveState, r: ReturnType<typeof rng>) => string };
const rich = (s: SaveState) => s.arcology.prosperity >= 90;
const poor = (s: SaveState) => s.arcology.prosperity < 45;
const LIFE: Life[] = [
  { key: "spire-lift", where: WHERE.spire, text: (s) => `The express lift to the spire is booked solid with people who want a word with the owner's staff. Most of them want a permit; one wants to sell ${s.arcology.name} a racehorse.` },
  { key: "spire-party", where: WHERE.spire, when: rich, text: () => "A party two floors below the penthouse goes on until the sun comes up over the sea. The noise complaints are filed, politely, in the morning." },
  { key: "spire-cleaners", where: WHERE.spire, text: () => "Window cleaners hang off the spire in harnesses all morning. From the plaza they look like beads on a string." },
  { key: "spire-view", where: WHERE.spire, text: (s) => `On a clear evening you can see ${s.arcology.neighbours[0]?.name ?? "the next arcology"} from the observation deck. Couples go up there to argue about which city is better.` },
  { key: "conc-busker", where: WHERE.concourse, text: (_s, r) => `A busker by the fountain plays ${r.pick(["an Old World love song", "a cello suite", "something on a steel drum", "a song about the owner, not entirely kind"])}. The hat in front of her fills slowly.` },
  { key: "conc-sale", where: WHERE.concourse, when: (s) => !poor(s), text: () => "A shoe shop on the concourse has a sale, and the queue at nine in the morning goes past the fountain." },
  { key: "conc-closed", where: WHERE.concourse, when: poor, text: () => "Two more shopfronts on the concourse are papered over this week. The landlord's notice on the door is already curling." },
  { key: "conc-rumour", where: WHERE.concourse, when: (s) => s.rumors.length > 0, text: (s) => { const r = [...s.rumors].sort((a, b) => b.salience - a.salience)[0]; return `Everyone on the concourse is saying the same thing this week: ${r.content.replace(/^"|"$/g, "")}. Nobody's sure who said it first.`; } },
  { key: "conc-slave-errand", where: WHERE.concourse, text: () => "A slave carrying a cake box through the lunchtime crowd keeps it perfectly level the whole way. Several people stop to watch her do it." },
  { key: "res-noise", where: WHERE.residential, text: (_s, r) => `A dispute on the ${r.int(20, 80)}th floor about a neighbour's music has reached its third week and its fourth written complaint. Both households' slaves are friends.` },
  { key: "res-wedding", where: WHERE.residential, text: () => "A wedding party fills the corridor of the residential floors with rice and paper flowers. The cleaners, slaves, are still sweeping at midnight." },
  { key: "res-crime", where: WHERE.residential, when: (s) => s.arcology.crime >= 35, text: () => "Someone has been breaking into storage lockers on the residential floors. Residents have started padlocking their doors from the outside when they go to work." },
  { key: "res-safe", where: WHERE.residential, when: (s) => s.arcology.crime < 20, text: () => "A woman on the residential floors leaves her door open all afternoon while she airs the flat. Nobody thinks anything of it." },
  { key: "res-crowded", where: WHERE.residential, when: (s) => s.arcology.population > 1500, text: (s) => `The lifts on the residential floors are full every morning now: ${Math.round(s.arcology.population).toLocaleString()} people and not enough cars. A man has started selling coffee in the queue.` },
  { key: "verge-market", where: WHERE.verge, text: () => "The night market in the verge sells fried squid, second-hand phones and Old World cigarettes. Half the arcology comes down after midnight and pretends not to." },
  { key: "verge-kids", where: WHERE.verge, text: () => "Children in the verge have chalked a hopscotch grid the length of a service corridor. The maintenance crew steps around it." },
  { key: "verge-poor", where: WHERE.verge, when: poor, text: () => "The soup kitchen in the verge runs out by eleven this week. The ones at the back of the queue go and stand outside the next one." },
  { key: "docks-ship", where: WHERE.docks, text: (_s, r) => `A ${r.pick(["container ship", "bulk carrier", "rusting tanker", "white yacht"])} from ${r.pick(["the Gulf", "the Northern Cities", "the Archipelago", "somewhere it won't name"])} ties up at dawn. The stevedores bet on what's in the sealed containers.` },
  { key: "docks-fish", where: WHERE.docks, text: () => "The fishing boats come in low in the water, and the fish market on the quay is shouting by six." },
  { key: "docks-smuggle", where: WHERE.docks, when: (s) => s.arcology.crime >= 30, text: () => "Customs finds two crates of Old World medicine in a shipment labelled machine parts. The importer says it's a clerical error. Everyone knows the price of fever pills in the verge." },
  { key: "market-price", where: WHERE.market, text: (s) => `The price of bread is up again at the market${s.world?.economy.phase === "boom" ? ", though nobody much minds in a boom" : s.world?.economy.phase === "crash" ? ", and the stallholders are giving credit to regulars" : ""}. A stallholder writes the new price on a slate and sighs.` },
  { key: "market-slave-sale", where: WHERE.market, text: () => "At the small slave auction off the market square, a middle-aged cook goes for more than a young beauty, and the crowd murmurs about it all afternoon." },
  { key: "market-season", where: WHERE.market, text: (s) => { const w = Math.floor(((s.arcology.week - 1) % 52) / 13); return ["Spring strawberries at the market, flown in at a price only the spire pays.", "Summer: the ice seller does better business than the jeweller.", "Autumn: the market smells of roasting chestnuts, a stallholder's Old World habit.", "Winter: the market stalls sell scarves to citizens and blankets to their slaves."][w]; } },
  { key: "plaza-chess", where: WHERE.plaza, text: () => "Two old men have played chess on the same bench in the plaza every afternoon for a year. This week one of them won." },
  { key: "plaza-speech", where: WHERE.plaza, text: (s) => `A man on a crate in the plaza gives a speech about the owner. It's ${s.arcology.public_standing >= 3 ? "full of praise, and people applaud" : s.arcology.public_standing <= -3 ? "angry, and people listen longer than he expected" : "confused, and people drift away"}.` },
  { key: "plaza-kneel", where: WHERE.plaza, when: (s) => cultureOf(s).norms.reversal >= 20, text: () => "In the plaza an owner kneels to fix his slave's sandal strap. A couple at a café table smile at each other." },
  { key: "clinic-queue", where: WHERE.clinics, text: () => "The clinic's waiting room is full of coughs and paperwork. A slave waits for her owner's prescription with a number in her hand." },
  { key: "clinic-surgery", where: WHERE.clinics, when: (s) => cultureOf(s).norms.modification >= 20, text: () => "The cosmetic surgery on the clinic floor is booked three months out. A billboard outside shows a before and after, and nobody looks at the before." },
  { key: "farm-dawn", where: WHERE.farms, text: () => "The farms under the arcology are lit pink by the grow lamps before dawn. The first crates go up in the service lifts while the city sleeps." },
  { key: "works-shift", where: WHERE.works, text: () => "The shift change at the works is a river of people going one way and another river going the other. A food cart does its whole day's trade in twenty minutes." },
  { key: "works-smog", where: WHERE.works, when: (s) => (s.world?.pollution ?? 0) > 30, text: (s) => `The air by the works tastes of metal. The pollution meter on the wall reads ${Math.round(s.world?.pollution ?? 0)}, and someone has drawn a skull next to it.` },
];
function lifeScenes(s: SaveState, r: ReturnType<typeof rng>): Candidate[] {
  return LIFE.filter((l) => !l.when || l.when(s)).map((l) => ({ key: `life:${l.key}`, where: l.where, w: 0.6, text: l.text(s, r) }));
}

/** This week's scenes: five from different places, none shown in the last four weeks. */
export function cityThisWeek(s: SaveState, n = 5): Scene[] {
  const r = rng(`citylife:${s.id}:${s.arcology.week}`);
  const seen = (s.citylife_seen ??= {});
  const all = [...lawScenes(s, r), ...dressScene(s, r), ...geneScenes(s, r), ...menialScenes(s, r), ...workScenes(s), ...worldScenes(s, r), ...habitScenes(s, r), ...householdScenes(s), ...lifeScenes(s, r)]
    .filter((c) => s.arcology.week - (seen[c.key] ?? -99) >= 4);
  const out: Scene[] = [];
  const places = new Set<string>();
  let pool = all;
  while (out.length < n && pool.length) {
    const fresh = pool.filter((c) => !places.has(c.where));
    const pick = r.weighted(fresh.length ? fresh : pool, (c) => c.w);
    out.push({ key: pick.key, where: pick.where, text: pick.text, options: pick.options });
    places.add(pick.where);
    seen[pick.key] = s.arcology.week;
    pool = pool.filter((c) => c !== pick);
  }
  // Keep the memory small.
  for (const [k, wk] of Object.entries(seen)) if (s.arcology.week - wk > 12) delete seen[k];
  return out;
}

/** Choose in a scene. Small consequences, once. */
export function chooseInScene(s: SaveState, week: number, key: string, optionId: string): string {
  const rep = s.reports.find((x) => x.week === week);
  const sc = rep?.city?.find((x) => x.key === key);
  const o = sc?.options?.find((x) => x.id === optionId);
  if (!sc || !o || sc.picked) return "";
  const a = s.arcology, d = o.do;
  if (d.cash) a.cash += d.cash;
  if (d.standing) a.public_standing = clamp(a.public_standing + d.standing, -10, 10);
  if (d.rep) a.rep = Math.max(0, a.rep + d.rep);
  if (d.crime) a.crime = clamp(a.crime + d.crime, 0, 100);
  if (d.population) a.population += d.population;
  if (d.norm) pushNorm(s, d.norm[0] as never, d.norm[1], `what you decided in ${sc.where.toLowerCase()}`);
  if (d.law) { const l = LAW_BY_ID[d.law[0]]; if (l) pushWithLaw(s, l, d.law[1], `how you handled a breach of the ${l.name}`); }
  sc.picked = o.id;
  sc.result = o.outcome;
  return o.outcome;
}

/** For the narrator, on request only: the week in full, from the scenes and everything behind them. */
export function cityProseBrief(s: SaveState, week: number): { system: string; user: string } | null {
  const rep = s.reports.find((x) => x.week === week);
  if (!rep) return null;
  const laws = lawsOf(s).map((x) => LAW_BY_ID[x.id]).filter((l): l is LawDef => !!l);
  return {
    system: "You write the weekly city column of a Free City arcology in a dark future where slavery is legal: ordinary life, told plainly and specifically, in the present tense. Every character is an adult except children, who appear only as children and never in anything sexual. The laws are binding and literal; never invent a law or a clause. Show every change the gene programs made (traits, abilities, colouring, height) as it matters in ordinary life, not just the visible ones. No moralising, no summary at the end.",
    user: [
      `THE ARCOLOGY: ${s.arcology.name}, week ${week}. Population ${Math.round(s.arcology.population).toLocaleString()}; prosperity ${Math.round(s.arcology.prosperity)}; crime ${Math.round(s.arcology.crime)}.`,
      laws.length ? `LAWS IN FORCE, WORD FOR WORD:\n${laws.map((l) => `- The ${l.name}: "${l.text}" (${compliance(s, l).total > 30 ? "kept willingly" : compliance(s, l).total > 0 ? "kept, grudgingly" : "often broken"})`).join("\n")}` : "",
      `THE CITY:\n${cultureBrief(s)}`,
      `THIS WEEK, AS THE GAME SAW IT (keep these facts; tell them better, and add the small ordinary moments around them):`,
      ...(rep.city ?? []).map((c) => `- ${c.where}: ${c.text}${c.result ? ` (What the owner decided: ${c.result})` : ""}`),
      `ALSO THIS WEEK: ${rep.lines.slice(0, 8).map((l) => l.text).join(" | ")}`,
      ``,
      `Write 450 to 650 words: one short section for each place above, each headed with the place's name on its own line.`,
    ].filter(Boolean).join("\n"),
  };
}
