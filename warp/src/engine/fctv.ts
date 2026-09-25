/**
 * FCTV — the Free Cities' own television.
 *
 * Install receivers across the arcology and the citizens watch what the Free Cities broadcast.
 * You choose what gets the prime slots, and what they watch changes what they think: the doctrine
 * channels push their doctrines, the news keeps them calm or scares them, the porn channels make
 * them spend. You can also put one of your own slaves on the air, in a show of her own, and the
 * whole coast gets to know her.
 */
import type { Person, SaveState } from "./types";
import type { Ledger } from "./economy";
import { clamp } from "./psyche";
import { applyTreatment, read } from "./obedience";
import { rng } from "./rng";
import { startRumor } from "./social";
import { appeal } from "./economy";

export type Channel = "news" | "doctrine" | "porn" | "training" | "sport" | "home";

export const CHANNELS: Record<Channel, { name: string; note: string; shows: string[] }> = {
  news: { name: "FCNN", note: "the Free Cities' news; citizens feel informed and a little safer", shows: [
    "FCNN runs a week of coverage of {region}, with drone footage of the refugee columns.",
    "FCNN's evening anchor interviews an owner from the Gulf about the price of security.",
    "FCNN has a special on the weather: another bad year for the Old World's farms.",
  ] },
  doctrine: { name: "Future Society Hour", note: "pushes the doctrines you've adopted", shows: [
    "Future Society Hour follows a household that lives by {doctrine}, from breakfast to bedtime.",
    "A panel of owners argues about {doctrine} for an hour, and the audience votes.",
    "A documentary about the first arcology to adopt {doctrine}, told by its slaves.",
  ] },
  porn: { name: "Hot Pursuit", note: "the Free Cities' porn channel; citizens spend more and think less", shows: [
    "Hot Pursuit runs a marathon of its most-watched scenes, all week, uncut.",
    "Hot Pursuit's new series follows a slave through her first week in a brothel.",
    "Hot Pursuit airs a live competition between two arcologies' best whores.",
  ] },
  training: { name: "Slave Training Today", note: "how-to shows; your citizens' slaves behave better and yours learn by watching", shows: [
    "Slave Training Today shows how to correct a slave who won't make eye contact.",
    "A trainer from the Gulf breaks a new girl on camera, in six episodes.",
    "Slave Training Today's call-in show: owners describe their problem slaves.",
  ] },
  sport: { name: "Pit Fights Live", note: "fights from every arcology's pit; the crowd is harder, and crime goes down", shows: [
    "Pit Fights Live broadcasts a championship bout from an arcology up the coast.",
    "A week of undercard fights, and one that goes badly wrong on air.",
    "Pit Fights Live runs a retrospective of the season's knockouts.",
  ] },
  home: { name: "Home and Hearth", note: "cooking, gardens and happy households; the gentler doctrines like it", shows: [
    "Home and Hearth visits a paternalist household where the slaves cook for the owners' children.",
    "A cooking show hosted by a pair of slave chefs who used to run a restaurant in the Old World.",
    "Home and Hearth does a week of gardening in the arcologies' hydroponic farms.",
  ] },
};

export type ShowFormat = "reality" | "cooking" | "porn" | "confession" | "talk";
export const FORMATS: Record<ShowFormat, { name: string; note: string; hurts: number }> = {
  reality: { name: "Reality", note: "cameras follow her through her week", hurts: 1 },
  cooking: { name: "Cooking show", note: "she cooks, in an apron and not much else", hurts: 0 },
  porn: { name: "Porn", note: "a weekly scene, with a different partner each time", hurts: 3 },
  confession: { name: "Confessions", note: "she talks to the camera about her life as a slave", hurts: 2 },
  talk: { name: "Talk show", note: "she hosts, interviews citizens and guests", hurts: 0 },
};

export interface FCTV {
  on: boolean;
  /** Share of airtime, 0–3 per channel. */
  slots: Record<Channel, number>;
  show?: { star: string; format: ShowFormat; weeks: number; viewers: number };
  last?: { week: number; text: string[] };
}

export const RECEIVERS = 15000;

export function fctvOf(s: SaveState): FCTV | undefined {
  return s.fctv;
}

export function installFCTV(s: SaveState): boolean {
  if (s.fctv?.on || s.arcology.cash < RECEIVERS) return false;
  s.arcology.cash -= RECEIVERS;
  s.fctv = { on: true, slots: { news: 1, doctrine: 1, porn: 1, training: 0, sport: 0, home: 0 } };
  return true;
}

export function startShow(s: SaveState, star: Person, format: ShowFormat): void {
  const t = s.fctv;
  if (!t) return;
  t.show = { star: star.id, format, weeks: 0, viewers: 200 };
  applyTreatment(star, { kind: format === "porn" || format === "confession" ? "coercion" : "recognition", size: 3, why: `given her own ${FORMATS[format].name.toLowerCase()} on FCTV` }, s.arcology.week);
}

/** Weekly. */
export function tickFCTV(s: SaveState, led: Ledger): string[] {
  const t = s.fctv;
  if (!t?.on) return [];
  const out: string[] = [];
  const r = rng(`fctv:${s.arcology.week}`);
  const total = Object.values(t.slots).reduce((a, b) => a + b, 0) || 1;
  const share = (c: Channel) => t.slots[c] / total;
  const arc = s.arcology;
  const adopted = Object.keys(arc.doctrines);

  // What people watched.
  const top = (Object.keys(t.slots) as Channel[]).filter((c) => t.slots[c] > 0).sort((a, b) => t.slots[b] - t.slots[a])[0];
  const lines: string[] = [];
  if (top) {
    const region = s.world ? Object.keys(s.world.regions)[r.int(0, Object.keys(s.world.regions).length - 1)] : "the Old World";
    lines.push(r.pick(CHANNELS[top].shows).replace("{region}", region.replace(/_/g, " ")).replace("{doctrine}", adopted.length ? adopted[r.int(0, adopted.length - 1)].replace(/_/g, " ") : "the future societies"));
  }
  // What it did.
  if (share("doctrine") > 0) for (const id of adopted) arc.doctrines[id].adoption = clamp(arc.doctrines[id].adoption + share("doctrine") * 3, 0, 100);
  if (share("news") > 0) arc.public_standing = clamp(arc.public_standing + share("news") * 0.3, -10, 10);
  if (share("porn") > 0) { arc.prosperity = clamp(arc.prosperity + share("porn") * 1.2, 0, 200); if (arc.doctrines["paternalist"]) arc.doctrines["paternalist"].adoption = clamp(arc.doctrines["paternalist"].adoption - share("porn") * 1.5, 0, 100); }
  if (share("sport") > 0) arc.crime = clamp(arc.crime - share("sport") * 1.5, 0, 100);
  if (share("home") > 0 && arc.doctrines["paternalist"]) arc.doctrines["paternalist"].adoption = clamp(arc.doctrines["paternalist"].adoption + share("home") * 2, 0, 100);
  if (share("training") > 0) for (const p of Object.values(s.people)) if (p.status === "owned" && p.age >= 18) p.skills.entertainment = clamp(p.skills.entertainment + share("training") * 0.5, 0, 100);
  led.spend("fctv", "FCTV receivers and licences", 250 + Math.round(arc.population / 20));

  // Her show.
  const show = t.show;
  const star = show ? s.people[show.star] : undefined;
  if (show && (!star || star.status !== "owned")) t.show = undefined;
  else if (show && star) {
    show.weeks++;
    const fmt = FORMATS[show.format];
    const pull = appeal(star) * (1 + star.skills.entertainment / 120) * clamp(1 + read(star).devotion / 250, 0.6, 1.4) * (show.format === "porn" ? 1.5 : 1);
    show.viewers = Math.round(show.viewers + (pull * 4000 * clamp(arc.population / 1200, 0.5, 3) - show.viewers) * 0.2);
    const ads = Math.round(show.viewers * 0.35);
    led.earn("fctv", `${star.name}'s ${fmt.name.toLowerCase()} (${show.viewers.toLocaleString()} viewers)`, ads, star.id);
    star.fame.porn_fame = clamp((star.fame.porn_fame ?? 0) + (show.format === "porn" ? 4 : 1.5), 0, 100);
    if (show.viewers > 3000 && star.fame.prestige < 1) { star.fame.prestige = 1; star.fame.why = `the star of her own FCTV ${fmt.name.toLowerCase()}`; out.push(`${star.name}'s show has ${show.viewers.toLocaleString()} viewers. People know her face now.`); }
    if (fmt.hurts) applyTreatment(star, { kind: "coercion", size: fmt.hurts, why: `another week of her ${fmt.name.toLowerCase()} on FCTV` }, s.arcology.week);
    if (show.weeks === 4) startRumor(s, `${star.name}'s show is the best thing on FCTV`, { about: star.id, salience: 6, charge: 1 });
    lines.push(`${star.name}'s ${fmt.name.toLowerCase()} aired: ${show.viewers.toLocaleString()} viewers.`);
  }
  t.last = { week: s.arcology.week, text: lines };
  if (lines.length) out.push(`On FCTV this week: ${lines[0]}`);
  return out;
}
