/**
 * FLESHCRAFT — gene therapy and grown changes that come in over weeks.
 *
 * Surgery is a day on the table. These are treatments that change what her body grows: real ears
 * and tails, horns, scales, glowing eyes, milk that never stops, a womb that takes every time,
 * skin that doesn't age. Each one runs for some weeks, shows partway through, and leaves a
 * permanent trait on her body that the narrator reads and her portrait wears. The Clinic needs
 * its Gene lab.
 */
import type { Person, SaveState } from "./types";
import { clamp, shove } from "./psyche";
import { applyTreatment, read } from "./obedience";
import { remember } from "./memory";

export interface FleshDef {
  id: string;
  name: string;
  /** What it does, plainly. */
  what: string;
  /** What she looks like halfway, for the week report. */
  during: string;
  /** The permanent trait left on her body. */
  trait: string;
  weeks: number;
  cost: number;
  /** Health taken each week while it runs. */
  strain: number;
  /** How she takes it, before her wiring. Negative is something done to her. */
  takes: number;
  extreme?: boolean;
  /** Traits that rule it out. */
  conflicts?: string[];
  can?: (p: Person) => string | null;
  /** When it finishes. */
  done?: (p: Person) => void;
}

export const FLESH: FleshDef[] = [
  { id: "cat_ears", name: "Cat ears", what: "her own ears are replaced by furred cat ears that twitch and turn toward sounds", during: "soft fur is coming in at the tips of her ears", trait: "real cat ears", weeks: 3, cost: 9000, strain: 3, takes: -2, conflicts: ["real fox ears", "real cow ears", "long elf ears"], done: (p) => { p.look = { ...(p.look ?? {}), ears: "cat" }; } },
  { id: "fox_ears", name: "Fox ears", what: "tall russet fox ears, tipped in black", during: "her ears are lengthening and going russet", trait: "real fox ears", weeks: 3, cost: 9000, strain: 3, takes: -2, conflicts: ["real cat ears", "real cow ears", "long elf ears"], done: (p) => { p.look = { ...(p.look ?? {}), ears: "fox" }; } },
  { id: "cow_ears", name: "Cow ears and horns", what: "floppy cow ears and two short curved horns", during: "two hard bumps have come up on her forehead", trait: "real cow ears", weeks: 4, cost: 11000, strain: 4, takes: -4, conflicts: ["real cat ears", "real fox ears", "long elf ears"], done: (p) => { p.look = { ...(p.look ?? {}), ears: "cow" }; } },
  { id: "elf_ears", name: "Elf ears", what: "her ears grow long and pointed", during: "the tips of her ears are pointed now", trait: "long elf ears", weeks: 2, cost: 6000, strain: 2, takes: 1, conflicts: ["real cat ears", "real fox ears", "real cow ears"], done: (p) => { p.look = { ...(p.look ?? {}), ears: "elf" }; } },
  { id: "cat_tail", name: "A cat's tail", what: "a long furred tail grows from the base of her spine; she can move it", during: "a short furred stub has grown at the base of her spine", trait: "a real cat's tail", weeks: 5, cost: 16000, strain: 5, takes: -5, extreme: true, conflicts: ["a real fox tail", "a real cow tail"], done: (p) => { p.look = { ...(p.look ?? {}), tail: "cat" }; } },
  { id: "fox_tail", name: "A fox's brush", what: "a thick fox tail, russet with a white tip", during: "a fluffy stub has grown at the base of her spine", trait: "a real fox tail", weeks: 5, cost: 16000, strain: 5, takes: -5, extreme: true, conflicts: ["a real cat's tail", "a real cow tail"], done: (p) => { p.look = { ...(p.look ?? {}), tail: "fox" }; } },
  { id: "scales", name: "Scales", what: "fine iridescent scales grow over her hips, thighs and the small of her back", during: "patches of her skin have gone hard and shiny", trait: "iridescent scales on her hips and thighs", weeks: 4, cost: 12000, strain: 4, takes: -6, extreme: true },
  { id: "glow_eyes", name: "Glowing eyes", what: "her irises take on a faint light, visible in the dark", during: "her eyes catch the light oddly", trait: "eyes that glow faintly in the dark", weeks: 2, cost: 8000, strain: 2, takes: -1 },
  { id: "biolum", name: "Luminous markings", what: "patterned lines under her skin that glow when she's aroused", during: "faint lines have appeared under her skin", trait: "markings under her skin that glow when she's aroused", weeks: 3, cost: 10000, strain: 2, takes: 0 },
  { id: "milk_gene", name: "Milk gene", what: "she starts lactating and never stops, and her breasts grow to carry it", during: "her breasts are sore and leaking", trait: "a milk gene: she lactates constantly", weeks: 3, cost: 9000, strain: 3, takes: -3, done: (p) => { p.body.lactation = 2; p.body.boobs = Math.round(p.body.boobs * 1.25); } },
  { id: "fertility_gene", name: "Fertility gene", what: "she ovulates constantly and conceives twins or more", during: "she's been hot and restless all week", trait: "a fertility gene: she conceives easily, often more than one", weeks: 3, cost: 12000, strain: 2, takes: -3, can: (p) => (p.womb.uterus === "none" || (p.womb.uterus === undefined && p.body.vagina === null) ? "she has no womb to work on" : null), done: (p) => { p.womb.sterile = false; } },
  { id: "youth", name: "Slowed ageing", what: "her cells stop ageing at the usual rate; she'll look this age for years", during: "the fine lines at her eyes are fading", trait: "gene therapy that slows her ageing", weeks: 6, cost: 40000, strain: 2, takes: 4, done: (p) => { p.physical_age = Math.max(18, p.physical_age - 3); } },
  { id: "perfect_skin", name: "Flawless skin", what: "her skin clears completely and stays that way", during: "her skin is visibly smoother", trait: "flawless skin", weeks: 2, cost: 7000, strain: 1, takes: 3, done: (p) => { p.body.face = clamp(p.body.face + 6, 0, 100); } },
  { id: "pheromones", name: "Pheromones", what: "she gives off a scent that turns heads and makes people want her", during: "people have started lingering near her", trait: "a pheromone scent that makes people want her", weeks: 3, cost: 14000, strain: 2, takes: -1, done: (p) => { p.psyche.libido = clamp(p.psyche.libido + 10, 0, 100); } },
  { id: "soft_soles", name: "Pampered soles", what: "the soles of her feet stay baby-soft and pink whatever she walks on", during: "the hard skin on her soles is peeling away", trait: "soles that stay soft and pink whatever she walks on", weeks: 2, cost: 5000, strain: 1, takes: 2, done: (p) => { if (p.body.feet) p.body.feet.soles = "soft"; } },
  { id: "growth", name: "Growth therapy", what: "she grows several centimetres taller over a month", during: "her joints ache and her clothes are shorter", trait: "gene therapy that made her taller", weeks: 5, cost: 18000, strain: 4, takes: -2, done: (p) => { p.body.height_cm += 7; } },
];

export const FLESH_BY_ID: Record<string, FleshDef> = Object.fromEntries(FLESH.map((f) => [f.id, f]));

export interface Growing { id: string; started: number; weeks: number }

export function geneLab(s: SaveState): boolean {
  const c = s.arcology.facilities["clinic"];
  return !!c?.level && !!c.upgrades?.["gene_lab"];
}

export function traitsOf(p: Person): string[] {
  return (p.body.traits ??= []);
}

export function canGrow(s: SaveState, p: Person, f: FleshDef): string | null {
  if (!geneLab(s)) return "the Clinic needs its Gene lab";
  if (p.age < 18) return "not on a child";
  if (f.extreme && s.content?.extreme === false) return "disabled in content settings";
  if ((p.growing ?? []).some((g) => g.id === f.id)) return "already under way";
  if (traitsOf(p).includes(f.trait)) return "she already has it";
  if (f.conflicts?.some((c) => traitsOf(p).includes(c) || (p.growing ?? []).some((g) => FLESH_BY_ID[g.id]?.trait === c))) return "conflicts with something she has";
  if ((p.growing ?? []).length >= 2) return "two treatments at once is the limit";
  if (s.arcology.cash < f.cost) return `costs ¤${f.cost.toLocaleString()}`;
  return f.can?.(p) ?? null;
}

/** How she'll take it, for the button. */
export function fleshFelt(p: Person, f: FleshDef): number {
  let n = f.takes;
  if (p.persona.fetishes.some((x) => x.name === "submissive" && x.strength > 50)) n += 3;
  if (p.persona.paraphilia) n += 4;
  n += read(p).devotion / 25;
  return Math.round(n);
}

export function startGrowing(s: SaveState, p: Person, id: string): { ok: boolean; line: string } {
  const f = FLESH_BY_ID[id];
  if (!f) return { ok: false, line: "no such treatment" };
  const why = canGrow(s, p, f);
  if (why) return { ok: false, line: why };
  s.arcology.cash -= f.cost;
  (p.growing ??= []).push({ id, started: s.arcology.week, weeks: f.weeks });
  const felt = fleshFelt(p, f);
  applyTreatment(p, { kind: felt >= 0 ? "recognition" : "coercion", size: Math.min(6, Math.abs(felt) + 1), why: `given ${f.name.toLowerCase()} treatment` }, s.arcology.week);
  return { ok: true, line: `${p.name} starts the ${f.name.toLowerCase()} treatment: ${f.what}. It will take ${f.weeks} weeks. ${felt >= 3 ? "She's excited about it." : felt <= -3 ? "She's frightened of what she'll turn into." : "She doesn't say much."}` };
}

/** Weekly, per person. */
export function tickFlesh(s: SaveState, p: Person): string[] {
  const out: string[] = [];
  if (!p.growing?.length) return out;
  const keep: Growing[] = [];
  for (const g of p.growing) {
    const f = FLESH_BY_ID[g.id];
    if (!f) continue;
    const done = s.arcology.week - g.started >= g.weeks;
    p.health.health = clamp(p.health.health - f.strain, -100, 100);
    if (!done) {
      if (s.arcology.week - g.started === Math.ceil(g.weeks / 2)) out.push(`${p.name}: ${f.during}.`);
      keep.push(g);
      continue;
    }
    traitsOf(p).push(f.trait);
    f.done?.(p);
    const felt = fleshFelt(p, f);
    shove(p.psyche, felt >= 0 ? 0.5 : -0.8);
    const mem = s.memory[p.id];
    if (mem) remember(mem, { content: `the week she finished changing: ${f.trait}`, week: s.arcology.week, importance: 7, charge: felt >= 0 ? "warm" : "sharp" });
    out.push(`${p.name}'s ${f.name.toLowerCase()} treatment has finished. She has ${f.trait} now.`);
  }
  p.growing = keep;
  return out;
}

/** For the narrator's card. */
export function describeTraits(p: Person): string {
  const t = p.body.traits ?? [];
  const g = (p.growing ?? []).map((x) => FLESH_BY_ID[x.id]?.during).filter(Boolean);
  return [t.length ? `She has ${t.join("; ")}.` : "", g.length ? `Changing right now: ${g.join("; ")}.` : ""].filter(Boolean).join(" ");
}
