/**
 * SURGERY — the table.
 *
 * The original ships this across six passages and something like sixty procedures, and the part
 * the rebuild had none of is the part the trade is actually built on: you can change what she is.
 * A woman with a cock, a man given a cunt, a herm made out of either, a null made out of anybody.
 * The original calls these MaleToFemale, NoneToFemale, ChopPenis, VaginaRemoval and Herm, and they
 * are gated behind the surgical theatre's upgrade and the extreme-content switch, which is what
 * `needs_upgrade` and `extreme` are here.
 *
 * WRITING RULE, same as everywhere else: say what is done and what it costs. Nobody in this world
 * describes a surgery as a journey.
 */
import type { Person, SaveState } from "../engine/types";
import { feetOf } from "../engine/genitals";

export interface Procedure {
  id: string;
  name: string;
  /** What the surgeon actually does, one line, in the theatre's own register. */
  what: string;
  group: "genitals" | "fertility" | "body" | "feet" | "face";
  cost: number;
  /** Weeks flat on her back afterwards. */
  recovery: number;
  /** Health cost, on the −100…+100 scale. */
  damage: number;
  /** Needs the theatre upgraded. */
  needs_upgrade?: boolean;
  /** Behind the extreme-content switch. */
  extreme?: boolean;
  /** Whether this body can take it, and why not. */
  can: (p: Person, s?: SaveState) => string | null;
  /** Do it. */
  apply: (p: Person) => void;
  /** How she takes it, before her own wiring is applied: negative is an injury. */
  takes: number;
}

const has = (n: number | null | undefined): n is number => n !== null && n !== undefined && n > 0;

export const PROCEDURES: Procedure[] = [
  /* ── what she is ─────────────────────────────────────────────────────────────────────────── */
  {
    id: "male_to_female", name: "Turn her cock into a pussy", group: "genitals",
    what: "her cock and balls are removed and the tissue is used to build a vagina",
    cost: 15000, recovery: 3, damage: -20, takes: -14,
    can: (p) => p.body.vagina !== null ? "she already has a pussy; use the herm operation to keep both" : !has(p.body.dick) ? "there is no cock to work with; she needs the harder operation" : null,
    apply: (p) => { p.body.vagina = 0; p.body.vagina_lube = 1; p.body.hymen = false; p.body.labia = 1; p.body.clit = 1; p.body.dick = null; p.body.foreskin = null; p.body.balls = null; p.body.scrotum = 0; p.body.prostate = Math.min(1, p.body.prostate) as 0 | 1; },
  },
  {
    id: "none_to_female", name: "Build her a cunt from nothing", group: "genitals",
    what: "a long operation to build genitals from nothing; recovery is slow",
    cost: 30000, recovery: 5, damage: -35, takes: -18, needs_upgrade: true,
    can: (p) => p.body.vagina !== null ? "she already has one" : has(p.body.dick) ? "use the ordinary operation" : null,
    apply: (p) => { p.body.vagina = 0; p.body.vagina_lube = 0; p.body.labia = 0; },
  },
  {
    id: "herm", name: "Give her both", group: "genitals",
    what: "she keeps her cock and gets a pussy under it; expensive",
    cost: 40000, recovery: 4, damage: -30, takes: -12, needs_upgrade: true,
    can: (p) => !has(p.body.dick) ? "she has no cock to keep" : p.body.vagina !== null ? "she already has both" : null,
    apply: (p) => { p.body.vagina = 0; p.body.vagina_lube = 1; p.body.labia = 1; },
  },
  {
    id: "chop", name: "Take her cock", group: "genitals",
    what: "her cock is removed and the area closed up neatly",
    cost: 10000, recovery: 4, damage: -30, takes: -45, extreme: true,
    can: (p) => !has(p.body.dick) ? "there is nothing there" : null,
    apply: (p) => { p.body.dick = null; p.body.foreskin = null; },
  },
  {
    id: "vagina_removal", name: "Take her cunt", group: "genitals",
    what: "her vagina is surgically closed",
    cost: 10000, recovery: 4, damage: -30, takes: -50, extreme: true,
    can: (p) => p.body.vagina === null ? "there is nothing there" : null,
    apply: (p) => { p.body.vagina = null; p.body.vagina_lube = 0; p.body.hymen = false; p.body.labia = 0; p.womb.sterile = true; },
  },
  {
    id: "geld", name: "Geld her", group: "genitals",
    what: "she is castrated",
    cost: 8000, recovery: 3, damage: -22, takes: -40, extreme: true,
    can: (p) => !has(p.body.balls) ? "there is nothing there" : null,
    apply: (p) => { p.body.balls = null; p.body.scrotum = 0; p.body.prostate = 0; },
  },
  {
    id: "circumcise", name: "Circumcise her", group: "genitals",
    what: "she is circumcised; a quick operation with a sore couple of weeks after",
    cost: 3000, recovery: 1, damage: -6, takes: -10,
    can: (p) => !has(p.body.dick) ? "there is nothing there" : p.body.foreskin === 0 ? "already done" : null,
    apply: (p) => { p.body.foreskin = 0; },
  },
  {
    id: "restore_foreskin", name: "Restore her foreskin", group: "genitals",
    what: "regrown from her own tissue over three weeks",
    cost: 9000, recovery: 2, damage: -8, takes: 4, needs_upgrade: true,
    can: (p) => !has(p.body.dick) ? "there is nothing there" : p.body.foreskin !== 0 ? "she has one" : null,
    apply: (p) => { p.body.foreskin = Math.max(1, Math.round((p.body.dick ?? 3) * 0.8)); },
  },

  {
    id: "add_penis", name: "Give her a cock", group: "genitals",
    what: "a cock grown from her own cells is grafted on above her pussy; without balls she won't get hard",
    cost: 25000, recovery: 4, damage: -25, takes: -8,
    can: (p) => has(p.body.dick) ? "she already has one" : null,
    apply: (p) => { p.body.dick = 2; p.body.foreskin = 2; if (!p.body.prostate) p.body.prostate = 1; },
  },
  {
    id: "add_balls", name: "Give her balls", group: "genitals",
    what: "testicles grown from her own cells are implanted in a new scrotum; she'll produce cum, and hormones to match",
    cost: 22000, recovery: 3, damage: -20, takes: -6,
    can: (p) => has(p.body.balls) ? "she already has them" : null,
    apply: (p) => { p.body.balls = 2; p.body.scrotum = 2; p.body.vasectomy = false; if (!p.body.prostate) p.body.prostate = 1; },
  },
  {
    id: "penis_enlarge", name: "Enlarge her cock", group: "genitals",
    what: "implants and grafts make her cock one size bigger",
    cost: 9000, recovery: 2, damage: -12, takes: -3,
    can: (p, s) => !has(p.body.dick) ? "she has no cock" : p.body.dick >= (s?.content?.hyper === false ? 10 : 20) ? "it can't be made any bigger surgically; try growth drugs" : null,
    apply: (p) => { p.body.dick = (p.body.dick ?? 0) + 1; if (p.body.foreskin) p.body.foreskin += 1; },
  },
  {
    id: "penis_reduce", name: "Shrink her cock", group: "genitals",
    what: "her cock is surgically made one size smaller",
    cost: 7000, recovery: 2, damage: -12, takes: -16,
    can: (p) => !has(p.body.dick) ? "she has no cock" : p.body.dick <= 1 ? "it can't get any smaller without removing it" : null,
    apply: (p) => { p.body.dick = Math.max(1, (p.body.dick ?? 1) - 1); if (p.body.foreskin) p.body.foreskin = Math.max(1, p.body.foreskin - 1); },
  },
  {
    id: "balls_enlarge", name: "Enlarge her balls", group: "genitals",
    what: "testicular implants make her balls one size bigger and her loads heavier",
    cost: 8000, recovery: 2, damage: -12, takes: -4,
    can: (p, s) => !has(p.body.balls) ? "she has no balls" : p.body.balls >= (s?.content?.hyper === false ? 10 : 20) ? "they can't be made any bigger surgically; try growth drugs" : null,
    apply: (p) => { p.body.balls = (p.body.balls ?? 0) + 1; if ((p.body.scrotum ?? 0) > 0) p.body.scrotum = Math.max(p.body.scrotum ?? 0, p.body.balls - 1); },
  },
  {
    id: "balls_reduce", name: "Shrink her balls", group: "genitals",
    what: "her balls are surgically reduced one size",
    cost: 7000, recovery: 2, damage: -12, takes: -14,
    can: (p) => !has(p.body.balls) ? "she has no balls" : p.body.balls <= 1 ? "they can't get any smaller without removing them" : null,
    apply: (p) => { p.body.balls = Math.max(1, (p.body.balls ?? 1) - 1); },
  },
  {
    id: "scrotum_tuck", name: "Move her balls inside", group: "genitals",
    what: "her testicles are moved inside her body and the scrotum is removed; her crotch looks smooth",
    cost: 9000, recovery: 2, damage: -14, takes: -10,
    can: (p) => !has(p.body.balls) ? "she has no balls" : p.body.scrotum === 0 ? "they're already internal" : p.body.balls > 4 ? "they're too big to fit inside her" : null,
    apply: (p) => { p.body.scrotum = 0; },
  },
  {
    id: "scrotum_restore", name: "Give her a scrotum", group: "genitals",
    what: "her balls are brought back down into a new scrotum",
    cost: 7000, recovery: 2, damage: -10, takes: 0,
    can: (p) => !has(p.body.balls) ? "she has no balls" : (p.body.scrotum ?? 1) > 0 ? "she has one" : null,
    apply: (p) => { p.body.scrotum = p.body.balls ?? 2; },
  },
  {
    id: "scrotum_tighten", name: "Tighten her scrotum", group: "genitals",
    what: "her loose, sagging scrotum is trimmed so her balls sit snug",
    cost: 4000, recovery: 1, damage: -6, takes: -2,
    can: (p) => !has(p.body.balls) ? "she has no balls" : (p.body.scrotum ?? 0) <= (p.body.balls ?? 0) ? "it isn't loose" : null,
    apply: (p) => { p.body.scrotum = p.body.balls ?? 0; },
  },
  {
    id: "scrotum_expand", name: "Expand her scrotum", group: "genitals",
    what: "her scrotum is enlarged so her oversized balls stop straining it",
    cost: 5000, recovery: 1, damage: -8, takes: 4,
    can: (p) => !has(p.body.balls) ? "she has no balls" : (p.body.scrotum ?? 0) === 0 ? "her balls are internal" : (p.body.scrotum ?? 0) >= (p.body.balls ?? 0) + 1 ? "it's already roomy" : null,
    apply: (p) => { p.body.scrotum = (p.body.balls ?? 0) + 1; },
  },
  {
    id: "clit_enlarge", name: "Enlarge her clit", group: "genitals",
    what: "her clit is enlarged one step; at the top it's a little cock of its own",
    cost: 5000, recovery: 1, damage: -8, takes: -4,
    can: (p) => p.body.vagina === null ? "she has no pussy" : p.body.clit >= 5 ? "it's as big as it gets" : null,
    apply: (p) => { p.body.clit = Math.min(5, p.body.clit + 1); },
  },
  {
    id: "clit_reduce", name: "Reduce her clit", group: "genitals",
    what: "her clit is reduced one step",
    cost: 4000, recovery: 1, damage: -8, takes: -10,
    can: (p) => p.body.vagina === null ? "she has no pussy" : p.body.clit <= 0 ? "it's already small" : null,
    apply: (p) => { p.body.clit = Math.max(0, p.body.clit - 1); },
  },
  {
    id: "labiaplasty", name: "Labiaplasty", group: "genitals",
    what: "her labia are trimmed down to a neat, minimal shape",
    cost: 4000, recovery: 1, damage: -6, takes: -2,
    can: (p) => p.body.vagina === null ? "she has no pussy" : p.body.labia <= 0 ? "they're already minimal" : null,
    apply: (p) => { p.body.labia = 0; },
  },
  {
    id: "labia_enlarge", name: "Enlarge her labia", group: "genitals",
    what: "her labia are enlarged one step, until they're big and prominent",
    cost: 4000, recovery: 1, damage: -6, takes: -6,
    can: (p) => p.body.vagina === null ? "she has no pussy" : p.body.labia >= 3 ? "they're as big as they get" : null,
    apply: (p) => { p.body.labia = Math.min(3, p.body.labia + 1) as 0 | 1 | 2 | 3; },
  },
  {
    id: "lube_glands", name: "Boost her wetness", group: "genitals",
    what: "her glands are stimulated so she gets soaking wet",
    cost: 5000, recovery: 1, damage: -6, takes: 2,
    can: (p) => p.body.vagina === null ? "she has no pussy" : p.body.vagina_lube >= 2 ? "she's already very wet" : null,
    apply: (p) => { p.body.vagina_lube = 2; },
  },

  /* ── what she can do ─────────────────────────────────────────────────────────────────────── */
  {
    id: "sterilise", name: "Sterilise her", group: "fertility",
    what: "her ovaries are removed; she is permanently sterile",
    cost: 6000, recovery: 2, damage: -14, takes: -35, extreme: true,
    can: (p) => p.womb.sterile ? "she already cannot" : p.body.vagina === null ? "there is nothing to take" : null,
    apply: (p) => { p.womb.sterile = true; p.womb.fertility = 0; },
  },
  {
    id: "restore_fertility", name: "Restore her fertility", group: "fertility",
    what: "new ovaries grown from her own cells are implanted",
    cost: 22000, recovery: 3, damage: -16, takes: 12, needs_upgrade: true,
    can: (p) => !p.womb.sterile ? "she is already fertile" : p.body.vagina === null ? "there is nowhere to put them" : null,
    apply: (p) => { p.womb.sterile = false; p.womb.fertility = 60; },
  },
  {
    id: "vasectomy", name: "Cut her off", group: "fertility",
    what: "a vasectomy; she can still cum but can't get anyone pregnant",
    cost: 2000, recovery: 1, damage: -4, takes: -8,
    can: (p) => !has(p.body.balls) ? "there is nothing there" : p.body.vasectomy ? "already done" : null,
    apply: (p) => { p.body.vasectomy = true; },
  },
  {
    id: "undo_vasectomy", name: "Reverse her vasectomy", group: "fertility",
    what: "her vasectomy is reversed; her cum can get people pregnant again",
    cost: 6000, recovery: 1, damage: -6, takes: 4,
    can: (p) => !p.body.vasectomy ? "she hasn't had one" : null,
    apply: (p) => { p.body.vasectomy = false; },
  },
  {
    id: "ejaculation_booster", name: "Fit her an ejaculation booster", group: "fertility",
    what: "a prostate implant that makes her cum huge loads",
    cost: 12000, recovery: 2, damage: -12, takes: -6, needs_upgrade: true,
    can: (p) => !has(p.body.balls) && !p.body.prostate ? "she has no prostate or balls to boost" : p.body.prostate >= 3 ? "already fitted" : null,
    apply: (p) => { p.body.prostate = 3; },
  },

  /* ── the body ────────────────────────────────────────────────────────────────────────────── */
  {
    id: "fuckable_nipples", name: "Open her nipples", group: "body",
    what: "her nipples are enlarged into holes that can be fucked; this is permanent",
    cost: 18000, recovery: 3, damage: -22, takes: -20, needs_upgrade: true, extreme: true,
    can: (p) => p.body.boobs < 400 ? "there is not enough breast to work with" : p.body.nipples === "fuckable" ? "already done" : null,
    apply: (p) => { p.body.nipples = "fuckable"; },
  },
  {
    id: "invert_nipples", name: "Draw her nipples out", group: "body",
    what: "her inverted nipples are corrected",
    cost: 4000, recovery: 1, damage: -6, takes: 6,
    can: (p) => !/inverted/.test(p.body.nipples) ? "hers are not inverted" : null,
    apply: (p) => { p.body.nipples = "cute"; },
  },
  {
    id: "lactation_implant", name: "Start her lactating", group: "body",
    what: "lactation implants; she starts producing milk within a week and never stops",
    cost: 10000, recovery: 2, damage: -12, takes: -8,
    can: (p) => p.body.lactation ? "she already is" : p.body.boobs < 300 ? "there is nothing to work with" : null,
    apply: (p) => { p.body.lactation = 1; p.body.lactation_weeks = 0; },
  },
  {
    id: "hymen", name: "Restore her hymen", group: "body",
    what: "her hymen is restored so she's a virgin again",
    cost: 5000, recovery: 1, damage: -8, takes: -14,
    can: (p) => p.body.vagina === null ? "there is nothing there" : p.body.hymen ? "it is intact" : null,
    apply: (p) => { p.body.hymen = true; p.body.vagina = 0; },
  },
  {
    id: "tighten", name: "Tighten her", group: "body",
    what: "her vagina is tightened back to how it was when she was eighteen",
    cost: 8000, recovery: 2, damage: -14, takes: -6,
    can: (p) => p.body.vagina === null ? "there is nothing there" : p.body.vagina <= 1 ? "she is tight already" : null,
    apply: (p) => { p.body.vagina = Math.max(0, (p.body.vagina ?? 2) - 2); },
  },
  {
    id: "anal_tighten", name: "Rejuvenate her ass", group: "body",
    what: "her asshole is tightened back up",
    cost: 8000, recovery: 2, damage: -14, takes: -6,
    can: (p) => p.body.anus <= 1 ? "she is tight already" : null,
    apply: (p) => { p.body.anus = Math.max(0, p.body.anus - 2); },
  },

  /* ── her feet ────────────────────────────────────────────────────────────────────────────── */
  {
    id: "clip_tendons", name: "Clip her Achilles tendons", group: "feet",
    what: "her Achilles tendons are cut; she can't stand flat any more and has to walk in heels or crawl",
    cost: 5000, recovery: 2, damage: -15, takes: -30, extreme: true,
    can: (p) => feetOf(p).heels_clipped ? "already done" : null,
    apply: (p) => { feetOf(p).heels_clipped = true; },
  },
  {
    id: "repair_tendons", name: "Repair her tendons", group: "feet",
    what: "her clipped tendons are repaired; she can walk normally again",
    cost: 12000, recovery: 4, damage: -12, takes: 14, needs_upgrade: true,
    can: (p) => !feetOf(p).heels_clipped ? "her tendons are intact" : null,
    apply: (p) => { feetOf(p).heels_clipped = false; },
  },
  {
    id: "shrink_feet", name: "Shrink her feet", group: "feet",
    what: "the bones of her feet are shortened, taking two sizes off",
    cost: 14000, recovery: 4, damage: -18, takes: -10, needs_upgrade: true,
    can: (p) => feetOf(p).size <= 34 ? "they're as small as they can be made" : null,
    apply: (p) => { const f = feetOf(p); f.size = Math.max(33, f.size - 2); },
  },
  {
    id: "arch_feet", name: "Reshape her arches", group: "feet",
    what: "her arches are surgically raised into high, elegant curves",
    cost: 8000, recovery: 3, damage: -12, takes: -4,
    can: (p) => feetOf(p).arch === "high" ? "her arches are already high" : null,
    apply: (p) => { feetOf(p).arch = "high"; },
  },
  {
    id: "soften_soles", name: "Soften her soles", group: "feet",
    what: "calluses are removed and her soles are treated until they're soft and smooth",
    cost: 1500, recovery: 0, damage: -2, takes: 4,
    can: (p) => feetOf(p).soles === "soft" ? "they're already soft" : null,
    apply: (p) => { feetOf(p).soles = "soft"; },
  },
  {
    id: "sensitize_soles", name: "Sensitize her soles", group: "feet",
    what: "nerve work makes her soles hypersensitive; the lightest touch sets her squealing",
    cost: 6000, recovery: 1, damage: -6, takes: -8,
    can: (p) => feetOf(p).ticklish >= 3 ? "they're as sensitive as they get" : null,
    apply: (p) => { feetOf(p).ticklish = 3; },
  },
  {
    id: "desensitize_soles", name: "Desensitize her soles", group: "feet",
    what: "nerve work dulls her soles so she's no longer ticklish",
    cost: 6000, recovery: 1, damage: -6, takes: 2,
    can: (p) => feetOf(p).ticklish === 0 ? "she isn't ticklish" : null,
    apply: (p) => { feetOf(p).ticklish = 0; },
  },
];

export const PROCEDURE_BY_ID: Record<string, Procedure> = Object.fromEntries(PROCEDURES.map((x) => [x.id, x]));
