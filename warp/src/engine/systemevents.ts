/**
 * EVENTS THAT COME OUT OF WHAT YOU'VE BUILT — menials, leases, gene programs, your laws, public works
 * and research each throw up their own trouble, weighted by how much of it you have.
 *
 * These join the ordinary event pool (engine/events), with its cap and its six-week rest per kind.
 */
import type { SaveState } from "./types";
import { clamp } from "./psyche";
import { registerEvents, type EventDef } from "./events";
import { pushNorm } from "./culture";
import { lawsOf } from "./court";
import { LAW_BY_ID } from "../data/laws";
import { pushWithLaw } from "./lawlife";
import { menialsOf, menialPrice } from "./menials";
import { genomeOf, citizenShare } from "./genome";
import { WORKS, levelOf } from "./works";
import { globeOf } from "./globe";

const std = (s: SaveState, by: number) => { s.arcology.public_standing = clamp(s.arcology.public_standing + by, -10, 10); };
const custom = (s: SaveState) => lawsOf(s).map((x) => LAW_BY_ID[x.id]).filter((l) => l && l.id.startsWith("custom_"));
const topWork = (s: SaveState) => WORKS.filter((w) => levelOf(s, w.id) >= 2).sort((a, b) => levelOf(s, b.id) - levelOf(s, a.id))[0];

export const SYSTEM_EVENTS: EventDef[] = [
  {
    id: "sys_menial_strike", severity: "notable", endogenous: true,
    candidates: (s) => (s.menials && s.menials.owned >= 100 && s.menials.treatment === "harsh" ? [{}] : []),
    weight: (s) => 1 + (s.menials?.owned ?? 0) / 800,
    seed: (s) => `A gang of your menials on the ${menialsOf(s).jobs.farms ? "farms" : "labour lines"} sat down at dawn and won't get up. Nobody is shouting. They are simply sitting in rows, numbers on their wrists, looking at the overseers.`,
    options: [
      { id: "flog", label: "Flog the front row", resolve: (s) => { const m = menialsOf(s); m.owned = Math.max(0, m.owned - 3); pushNorm(s, "cruelty", 2, "you had striking menials flogged"); return "Three don't survive it. The rest are back at work before noon, and the story is all over the verge by evening."; } },
      { id: "rations", label: "Better rations, and standard keeping", resolve: (s) => { menialsOf(s).treatment = "standard"; pushNorm(s, "personhood", 0.5, "you gave striking menials better rations"); return "The rations improve and the whips go back in the store. They stand up and go back to work, slower than before, and alive."; } },
      { id: "sell", label: "Sell the whole gang on", resolve: (s) => { const m = menialsOf(s); const n = Math.min(m.owned, 40); m.owned -= n; for (const j of Object.keys(m.jobs) as (keyof typeof m.jobs)[]) m.jobs[j] = Math.min(m.jobs[j], m.owned); const cash = Math.round(n * menialPrice(s) * 0.6); s.arcology.cash += cash; return `Forty go back to the trade at a loss: ¤${cash.toLocaleString()}. The ones who replace them have heard why.`; } },
    ],
  },
  {
    id: "sys_leased_abuse", severity: "notable", endogenous: true,
    candidates: (s) => ((s.menials?.jobs.lease ?? 0) >= 20 ? [{}] : []),
    weight: (s) => 0.8 + (s.menials?.jobs.lease ?? 0) / 400,
    seed: () => "A citizen who leases one of your menials beat her so badly she died in his kitchen. He's sent the body back with a note asking for a replacement, and a complaint that she was slow.",
    options: [
      { id: "fine", label: "Fine him three times her price", resolve: (s) => { const c = menialPrice(s) * 3; s.arcology.cash += c; pushNorm(s, "cruelty", -1, "you fined a citizen who killed a leased menial"); return `He pays ¤${c.toLocaleString()}, furious. Every household on the lease list hears about it, and treats theirs a little more carefully.`; } },
      { id: "cost", label: "Charge him her price and send a replacement", resolve: (s) => { s.arcology.cash += menialPrice(s); return "He pays for her and gets another. The paperwork calls it wear."; } },
      { id: "cancel", label: "Cancel his lease, and name him", resolve: (s) => { const m = menialsOf(s); m.jobs.lease = Math.max(0, m.jobs.lease - 1); std(s, 0.4); pushNorm(s, "personhood", 1, "you publicly shamed a citizen who killed a leased menial"); return "His name goes on the civic board. He moves to a neighbouring arcology within the month."; } },
    ],
  },
  {
    id: "sys_gene_black_market", severity: "notable", endogenous: true,
    candidates: (s) => (s.genome ? genomeOf(s).edits.filter((e) => e.target !== "slaves" && citizenShare(s, e) < 0.85).map((e) => ({ facility: e.id })) : []),
    weight: () => 1.2,
    seed: (s, c) => { const e = genomeOf(s).edits.find((x) => x.id === c.facility); return `A back-room clinic in the verge is selling a knock-off of the ${e?.name ?? "gene"} program to newcomers who can't afford yours: cheaper, faster, and nobody knows what else it does. Three of its customers are in the city hospital with fevers.`; },
    options: [
      { id: "raid", label: "Raid it", resolve: (s) => { s.arcology.crime = clamp(s.arcology.crime - 3, 0, 100); std(s, -0.2); return "Security takes the clinic apart and the doctor with it. The newcomers who paid him are out of pocket and angry."; } },
      { id: "license", label: "License it, and take a cut", resolve: (s, ev) => { const e = genomeOf(s).edits.find((x) => x.id === ev.facility); if (e) e.citizens += Math.round(s.arcology.population * 0.05); s.arcology.cash += 4000; return "The doctor gets a licence, an inspector and a tax bill. The fevers stop, and a few hundred more citizens carry the program."; } },
      { id: "ignore", label: "Leave it", resolve: (s) => { std(s, -0.3); return "It keeps selling. The fevers go on, and people start saying your program makes you sick."; } },
    ],
  },
  {
    id: "sys_law_tourist", severity: "notable", endogenous: false,
    candidates: (s) => custom(s).map((l) => ({ facility: l!.id })),
    weight: () => 1,
    seed: (s, c) => { const l = LAW_BY_ID[c.facility ?? ""]; return `A tourist from the Old World has been arrested under the ${l?.name}, which says "${l?.text}" She says nobody told her. Her embassy is on the phone, and a camera crew is outside the civic hall.`; },
    options: [
      { id: "example", label: "The law is the law", resolve: (s, e) => { const l = LAW_BY_ID[e.facility ?? ""]; if (l) pushWithLaw(s, l, 3, `a tourist was punished under the ${l.name}`); s.arcology.rep = Math.max(0, s.arcology.rep - 150); std(s, 0.4); return "She's punished exactly as a citizen would be. The Old World papers are furious; your citizens are proud of it."; } },
      { id: "deport", label: "Deport her quietly", resolve: (s) => { s.arcology.rep = Math.max(0, s.arcology.rep - 30); return "She's on the next boat out. The camera crew films an empty doorway."; } },
      { id: "tour", label: "Release her with a guided tour", resolve: (s, e) => { const l = LAW_BY_ID[e.facility ?? ""]; if (l) pushWithLaw(s, l, -1, `a tourist was let off under the ${l.name}`); s.arcology.rep += 200; return "She leaves with a guidebook and a story she tells on television. Bookings from her country go up."; } },
    ],
  },
  {
    id: "sys_works_accident", severity: "notable", endogenous: false,
    candidates: (s) => (topWork(s) ? [{}] : []),
    weight: () => 0.8,
    seed: (s) => `There's been an accident at the ${topWork(s)?.name.toLowerCase()}: a platform gave way during the night shift, and four workers are in hospital. The contractor says it's the arcology's fault; the arcology's engineer says it's the contractor's.`,
    options: [
      { id: "pay", label: "Pay the families, and fix it properly", note: "¤5,000", resolve: (s) => { s.arcology.cash -= 5000; std(s, 0.5); return "The families are paid before they ask. The platform is rebuilt to twice the standard."; } },
      { id: "blame", label: "Blame the contractor", resolve: (s) => { s.arcology.rep = Math.max(0, s.arcology.rep - 60); return "The contractor is fired and sues. Nobody else wants the next job."; } },
    ],
  },
  {
    id: "sys_research_spy", severity: "notable", endogenous: false,
    candidates: (s) => (s.globe && Object.values(globeOf(s).tech).some((t) => t.done) ? s.arcology.neighbours.filter((n) => n.attitude < 10).map((n) => ({ facility: n.id })) : []),
    weight: () => 0.7,
    seed: (s, c) => { const n = s.arcology.neighbours.find((x) => x.id === c.facility); return `Security has caught an engineer from ${n?.name} copying your research files onto a drive the size of a fingernail. She hasn't said a word since they took her.`; },
    options: [
      { id: "trial", label: "A public trial", resolve: (s, e) => { const n = s.arcology.neighbours.find((x) => x.id === e.facility); if (n) n.attitude = clamp(n.attitude - 12, -100, 100); pushNorm(s, "order", 2, "you tried a foreign spy in public"); return `The trial runs on every screen in the arcology for a week, and she is convicted on the last day. ${n?.name ?? "Her employers"} recall their ambassador the same afternoon.`; } },
      { id: "trade", label: "Trade her back", resolve: (s, e) => { const n = s.arcology.neighbours.find((x) => x.id === e.facility); if (n) n.attitude = clamp(n.attitude + 10, -100, 100); s.arcology.cash += 8000; return `${n?.name ?? "They"} pay ¤8,000 for her and a promise not to ask why. Relations are warmer than they've been in months.`; } },
      { id: "keep", label: "Keep her", resolve: (s) => { s.arcology.rep += 50; return "She disappears into your household's paperwork. Her employers never ask after her."; } },
    ],
  },
];

registerEvents(SYSTEM_EVENTS);
