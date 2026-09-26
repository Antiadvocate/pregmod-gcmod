/**
 * LAWS YOU WRITE — your wording, and what it does, from a closed list so the simulation can run it.
 *
 * You name the law and write what it says; that text is what citizens, the narrator and the court
 * read. You choose up to two of the city's habits it pushes, each way, and up to two things it does
 * every week. A custom law then works like any other: it pulls the city, it runs weekly, it shows in
 * the street, and if the city turns hard against it, the court hears a petition to repeal it.
 */
import type { Person, SaveState } from "../engine/types";
import type { Norm } from "../engine/culture";
import type { LawDef } from "./laws";
import { clamp } from "../engine/psyche";

export interface CustomLaw {
  id: string;
  name: string;
  text: string;
  /** Up to two habits, each +1 or −1. */
  push: { norm: Norm; dir: 1 | -1 }[];
  /** Up to two weekly effects, ids from CUSTOM_EFFECTS. */
  effects: string[];
  week: number;
}

const owned = (s: SaveState): Person[] => Object.values(s.people).filter((p) => p.status === "owned");

export const CUSTOM_EFFECTS: Record<string, { name: string; note: string; run: (s: SaveState, house: boolean) => string | null }> = {
  tax: { name: "A tax", note: "¤ from every citizen each week; prosperity dips", run: (s) => { const n = Math.round(s.arcology.population * 0.6); s.arcology.cash += n; s.arcology.prosperity = clamp(s.arcology.prosperity - 0.3, 5, 200); return null; } },
  subsidy: { name: "Paid for by the arcology", note: "¤1,500 a week; prosperity rises", run: (s) => { s.arcology.cash -= 1500; s.arcology.prosperity = clamp(s.arcology.prosperity + 0.6, 5, 200); return null; } },
  enforcement: { name: "Enforced by patrols", note: "crime falls; ¤500 a week", run: (s) => { s.arcology.cash -= 500; s.arcology.crime = clamp(s.arcology.crime - 1.5, 0, 100); s.arcology.security = clamp(s.arcology.security + 0.3, 0, 100); return null; } },
  prestige: { name: "Admired abroad", note: "reputation rises every week", run: (s) => { s.arcology.rep += 40; return null; } },
  hope: { name: "Gives slaves hope", note: "your slaves' hope rises", run: (s, house) => { if (house) for (const p of owned(s)) p.bond.hope = clamp(p.bond.hope + 0.6, 0, 100); return null; } },
  fear: { name: "Keeps slaves afraid", note: "your slaves' fear rises; obedience holds", run: (s, house) => { if (house) for (const p of owned(s)) p.bond.fear = clamp(p.bond.fear + 0.6, 0, 100); return null; } },
  care: { name: "Mandatory care", note: "your slaves' health improves; ¤300 a week", run: (s, house) => { if (!house) return null; s.arcology.cash -= 300; for (const p of owned(s)) p.health.health = clamp(p.health.health + 0.5, -100, 100); return null; } },
  barefoot: { name: "Slaves go barefoot", note: "your household goes barefoot", run: (s, house) => { if (house) for (const p of owned(s)) if (p.shoes && p.shoes !== "none" && !/bare/i.test(p.shoes) && !p.body.feet?.heels_clipped) p.shoes = "barefoot"; return null; } },
  unrest: { name: "Hard on the poor", note: "prosperity rises for the rich; crime rises", run: (s) => { s.arcology.prosperity = clamp(s.arcology.prosperity + 0.4, 5, 200); s.arcology.crime = clamp(s.arcology.crime + 0.8, 0, 100); return null; } },
};

/** Words in your text that say which way a law leans, for a starting suggestion. */
const HINTS: [RegExp, Norm, 1 | -1][] = [
  [/\b(beat|whip|cane|flog|punish|discipline|brand)/i, "cruelty", 1],
  [/\b(protect|gentle|kind|harm|abuse|injur|welfare|mercy)/i, "cruelty", -1],
  [/\b(naked|nude|nudity|bare breast|public sex|use (?:them|her) where)/i, "exposure", 1],
  [/\b(cloth|cover|modest|decen|uniform)/i, "exposure", -1],
  [/\b(right|testif|name|person|vote|speak|wage|educat|school)/i, "personhood", 1],
  [/\b(property|chattel|goods|object|numbered|furniture)/i, "personhood", -1],
  [/\b(kneel to|serve (?:their|his|her) slave|covenant|owners? who serve|collar(?:ed)? owner)/i, "reversal", 1],
  [/\b(feet|foot|barefoot|sole|toe|pedicure|washing)/i, "feet", 1],
  [/\b(free(?:dom)?|manumi|emancipat|buy (?:her|their) freedom)/i, "manumission", 1],
  [/\b(for life|never be freed|no manumission)/i, "manumission", -1],
  [/\b(implant|surgery|modif|enhanc|augment)/i, "modification", 1],
  [/\b(natural|unaltered|pure|ban (?:implants|surgery))/i, "modification", -1],
  [/\b(curfew|patrol|papers|permit|licen[cs]e|checkpoint)/i, "order", 1],
];

export function suggestPush(text: string): { norm: Norm; dir: 1 | -1 }[] {
  const out: { norm: Norm; dir: 1 | -1 }[] = [];
  for (const [re, norm, dir] of HINTS) if (re.test(text) && !out.some((x) => x.norm === norm)) out.push({ norm, dir });
  return out.slice(0, 2);
}

/** The law as the simulation runs it. */
export function customLawDef(c: CustomLaw): LawDef {
  const main = c.push[0] ?? { norm: "order" as Norm, dir: 1 as const };
  const pull: Partial<Record<Norm, number>> = {};
  for (const p of c.push) pull[p.norm] = p.dir * 35;
  return {
    id: c.id, name: c.name, text: c.text, norm: main.norm, dir: main.dir,
    // Never drafted by the court (you wrote it), but repealed if the city turns hard against it.
    at: main.dir * 999, repealAt: main.dir * -45,
    pull, petitioners: "the owner",
    weekly: (s, house) => {
      const lines = c.effects.map((e) => CUSTOM_EFFECTS[e]?.run(s, house)).filter(Boolean) as string[];
      return lines.length ? lines.join(" ") : null;
    },
  };
}
