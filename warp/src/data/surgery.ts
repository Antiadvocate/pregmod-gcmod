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
import type { Person } from "../engine/types";

export interface Procedure {
  id: string;
  name: string;
  /** What the surgeon actually does, one line, in the theatre's own register. */
  what: string;
  group: "genitals" | "fertility" | "body" | "face";
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
  can: (p: Person) => string | null;
  /** Do it. */
  apply: (p: Person) => void;
  /** How she takes it, before her own wiring is applied: negative is an injury. */
  takes: number;
}

const has = (n: number | null | undefined) => n !== null && n !== undefined && n > 0;

export const PROCEDURES: Procedure[] = [
  /* ── what she is ─────────────────────────────────────────────────────────────────────────── */
  {
    id: "male_to_female", name: "Give her a cunt", group: "genitals",
    what: "the surgeon gives her a vagina",
    cost: 15000, recovery: 3, damage: -20, takes: -14, needs_upgrade: false,
    can: (p) => p.body.vagina !== null ? "she already has one" : !has(p.body.dick) ? "there is nothing to work with; she needs the harder operation" : null,
    apply: (p) => { p.body.vagina = 0; p.body.vagina_lube = 1; p.body.hymen = false; p.body.labia = 1; },
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
    apply: (p) => { p.body.balls = null; p.body.prostate = 0; },
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
    can: (p) => !has(p.body.balls) ? "there is nothing there" : p.body.prostate === 0 ? "already done" : null,
    apply: (p) => { p.body.prostate = 0; },
  },
  {
    id: "ejaculation_booster", name: "Fit her an ejaculation booster", group: "fertility",
    what: "a prostate implant that makes her cum huge loads",
    cost: 12000, recovery: 2, damage: -12, takes: -6, needs_upgrade: true,
    can: (p) => !has(p.body.balls) ? "there is nothing to boost" : p.body.prostate >= 3 ? "already fitted" : null,
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
];

export const PROCEDURE_BY_ID: Record<string, Procedure> = Object.fromEntries(PROCEDURES.map((x) => [x.id, x]));
