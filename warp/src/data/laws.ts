/**
 * THE LAWS the arcology's court can write. None of them is on a menu: each one is drafted only when
 * the city's behaviour (engine/culture) has gone far enough in its direction, and comes back up for
 * repeal if the city swings the other way. A law in force pulls the city further its way, and does
 * something every week, to your household too unless you had it exempted.
 */
import type { Person, SaveState } from "../engine/types";
import type { Norm } from "../engine/culture";
import { clamp } from "../engine/psyche";

export interface LawDef {
  id: string;
  name: string;
  /** What the law says, in one sentence. */
  text: string;
  norm: Norm;
  /** Drafted when the norm passes this, in this direction. */
  dir: 1 | -1;
  at: number;
  /** Comes up for repeal when the norm falls back past this. */
  repealAt: number;
  pull: Partial<Record<Norm, number>>;
  /** Laws that can't stand together with this one; enacting it repeals them. */
  opposes?: string[];
  /** Who pushed for it, for the case text. */
  petitioners: string;
  /** What it does each week. `house` is false when your household is exempt. */
  weekly: (s: SaveState, house: boolean) => string | null;
  /** Extra condition beyond the norm. */
  also?: (s: SaveState) => boolean;
}

const owned = (s: SaveState): Person[] => Object.values(s.people).filter((p) => p.status === "owned");
const std = (s: SaveState, by: number) => { s.arcology.public_standing = clamp(s.arcology.public_standing + by, -10, 10); };
const adopt = (s: SaveState, id: string, by: number) => { const d = s.arcology.doctrines[id]; if (d) d.adoption = clamp(d.adoption + by, 0, 100); };

export const LAWS: LawDef[] = [
  {
    id: "public_discipline", name: "Public Discipline Act", norm: "cruelty", dir: 1, at: 40, repealAt: 5,
    text: "An owner may beat, bind or cane a slave in any public place, and no citizen may interfere.",
    petitioners: "a bloc of owners from the upper residential floors", pull: { cruelty: 40, personhood: -15 }, opposes: ["welfare_code"],
    weekly: (s, house) => {
      s.arcology.crime = clamp(s.arcology.crime - 0.5, 0, 100);
      if (house) for (const p of owned(s)) p.bond.fear = clamp(p.bond.fear + 0.6, 0, 100);
      return null;
    },
  },
  {
    id: "welfare_code", name: "Slave Welfare Code", norm: "cruelty", dir: -1, at: -35, repealAt: 0,
    text: "Every slave is owed food, a bed and a doctor; beating one to injury is fined at the court.",
    petitioners: "the clinic doctors and a church group from the lower blocks", pull: { cruelty: -40, personhood: 20 }, opposes: ["public_discipline"],
    weekly: (s, house) => {
      if (!house) return null;
      const held = owned(s).filter((p) => p.assignment === "be confined in the arcade" || p.assignment === "be confined in the cellblock").length;
      for (const p of owned(s)) p.bond.hope = clamp(p.bond.hope + 0.4, 0, 100);
      if (held) { s.arcology.cash -= held * 250; return `The court fined you ¤${held * 250} under the Welfare Code for ${held} slave${held > 1 ? "s" : ""} in the arcade or the cells.`; }
      return null;
    },
  },
  {
    id: "nudity_ordinance", name: "Nudity Ordinance", norm: "exposure", dir: 1, at: 45, repealAt: 10,
    text: "Slaves go naked in the concourses and plazas, and may be used where they stand by anyone their owner allows.",
    petitioners: "the pleasure quarter's club owners", pull: { exposure: 40 }, opposes: ["decency_statute"],
    weekly: (s) => { s.arcology.prosperity = clamp(s.arcology.prosperity + 0.3, 5, 200); s.arcology.rep += 15; return null; },
  },
  {
    id: "decency_statute", name: "Decency Statute", norm: "exposure", dir: -1, at: -35, repealAt: 0,
    text: "Slaves are clothed in public, and sex in the concourses is fined.",
    petitioners: "the office floors and the professional guilds", pull: { exposure: -40, personhood: 10 }, opposes: ["nudity_ordinance"],
    weekly: (s, house) => {
      adopt(s, "professionalism", 0.3);
      if (!house) return null;
      const out = owned(s).filter((p) => p.assignment === "public servant").length;
      if (out) { s.arcology.cash -= out * 120; return `The Decency Statute cost you ¤${out * 120} in fines for slaves serving in public.`; }
      return null;
    },
  },
  {
    id: "manumission_registry", name: "Manumission Registry", norm: "manumission", dir: 1, at: 35, repealAt: 0,
    text: "Any slave may register a price for her freedom, and an owner who refuses a slave who has paid it answers to the court.",
    petitioners: "freedwomen who now own shops in the commercial ring", pull: { manumission: 30, personhood: 15 },
    weekly: (s, house) => {
      if (!house) return null;
      for (const p of owned(s)) p.bond.hope = clamp(p.bond.hope + 0.7, 0, 100);
      return null;
    },
  },
  {
    id: "slave_testimony", name: "Slave Testimony Act", norm: "personhood", dir: 1, at: 40, repealAt: 5,
    text: "A slave's word counts in court, against anyone, including her owner.",
    petitioners: "the registry clerks and a judge who was once a slave", pull: { personhood: 30, cruelty: -15 }, opposes: ["chattel_act"],
    weekly: (s, house) => {
      s.arcology.crime = clamp(s.arcology.crime - 1, 0, 100);
      if (!house) return null;
      const cruel = (s.deeds ?? []).filter((d) => d.week >= s.arcology.week - 1 && d.tags.some((t) => t === "cruelty" || t === "humiliated_her")).length;
      if (cruel) { s.arcology.cash -= cruel * 1500; std(s, -0.5); return `One of your slaves testified. The court fined you ¤${cruel * 1500} for what you did to her.`; }
      return null;
    },
  },
  {
    id: "chattel_act", name: "Chattel Act", norm: "personhood", dir: -1, at: -45, repealAt: -10,
    text: "A slave is property in law. Killing one is damage to goods, payable to the owner.",
    petitioners: "the slave traders at the docks", pull: { personhood: -30, cruelty: 15 }, opposes: ["slave_testimony", "manumission_registry"],
    weekly: (s, house) => {
      s.arcology.prosperity = clamp(s.arcology.prosperity + 0.2, 5, 200);
      if (house) for (const p of owned(s)) p.bond.hope = clamp(p.bond.hope - 0.5, 0, 100);
      return null;
    },
  },
  {
    id: "collar_covenant", name: "Collar Covenant", norm: "reversal", dir: 1, at: 40, repealAt: 5,
    text: "A citizen may give themself to a slave by covenant, and the court will hold them to it.",
    petitioners: "owners who kneel, and the slaves they kneel to", pull: { reversal: 30, personhood: 15 },
    weekly: (s) => { adopt(s, "supplication", 0.5); return null; },
  },
  {
    id: "barefoot_statute", name: "Barefoot Statute", norm: "feet", dir: 1, at: 45, repealAt: 10,
    text: "Slaves go barefoot inside the arcology; shoes are for citizens.",
    petitioners: "the washers of the fountain", pull: { feet: 30 },
    weekly: (s, house) => {
      adopt(s, "podolatry", 0.5);
      if (house) for (const p of owned(s)) if (p.shoes && p.shoes !== "none" && !/bare/i.test(p.shoes) && !p.body.feet?.heels_clipped) p.shoes = "barefoot";
      return null;
    },
  },
  {
    id: "sole_protection", name: "Sole Protection Act", norm: "feet", dir: 1, at: 60, repealAt: 25,
    text: "Caning a slave's soles, or clipping her tendons, is assault.",
    petitioners: "the Podolatrist elders", pull: { feet: 20, cruelty: -15 }, also: (s) => (s.culture?.norms.cruelty ?? 0) < 30,
    weekly: (s, house) => {
      if (!house) return null;
      const caned = owned(s).filter((p) => (p.acts?.["bastinado"] ?? 0) > 0 && p.bond.weeks_since_cruelty <= 1).length;
      if (caned) { s.arcology.cash -= caned * 2000; std(s, -1); return `Your slaves' soles were seen at the fountain. The court fined you ¤${caned * 2000}.`; }
      return null;
    },
  },
  {
    id: "purity_law", name: "Purity Law", norm: "modification", dir: -1, at: -45, repealAt: -10,
    text: "Implants are taxed, and surgery on a slave needs a license from the clinic board.",
    petitioners: "the body purist salons", pull: { modification: -30 }, opposes: ["flesh_freedom"],
    weekly: (s, house) => {
      adopt(s, "body_purist", 0.4);
      if (!house) return null;
      const n = owned(s).filter((p) => p.body.boob_implant > 0 || p.body.butt_implant > 0).length;
      if (n) { s.arcology.cash -= n * 80; return `Implant tax: ¤${n * 80}.`; }
      return null;
    },
  },
  {
    id: "flesh_freedom", name: "Flesh Freedom Act", norm: "modification", dir: 1, at: 45, repealAt: 10,
    text: "Any change to a body is legal, and the clinics may advertise in the concourses.",
    petitioners: "the surgeons of the academy ring", pull: { modification: 30 }, opposes: ["purity_law"],
    weekly: (s) => { adopt(s, "transformation", 0.4); s.arcology.prosperity = clamp(s.arcology.prosperity + 0.2, 5, 200); return null; },
  },
  {
    id: "curfew", name: "Curfew and Patrols", norm: "order", dir: 1, at: 45, repealAt: 10,
    text: "Slaves are off the concourses after the tenth hour, and papers are checked at every lift.",
    petitioners: "the security contractors and the spire residents", pull: { order: 30, personhood: -10 }, opposes: ["open_streets"],
    weekly: (s) => { s.arcology.crime = clamp(s.arcology.crime - 2, 0, 100); s.arcology.security = clamp(s.arcology.security + 0.5, 0, 100); s.arcology.prosperity = clamp(s.arcology.prosperity - 0.2, 5, 200); return null; },
  },
  {
    id: "open_streets", name: "Open Streets", norm: "order", dir: -1, at: -35, repealAt: 0,
    text: "Patrols are pulled off the residential floors, and a slave on an errand needs no papers.",
    petitioners: "the market traders and the residential blocks", pull: { order: -30, personhood: 10 }, opposes: ["curfew"],
    weekly: (s) => { s.arcology.crime = clamp(s.arcology.crime + 1, 0, 100); s.arcology.prosperity = clamp(s.arcology.prosperity + 0.4, 5, 200); s.arcology.cash += 300; return null; },
  },
];

export const LAW_BY_ID: Record<string, LawDef> = Object.fromEntries(LAWS.map((l) => [l.id, l]));
