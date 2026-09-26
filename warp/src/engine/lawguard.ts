/**
 * LAWS ARE WHAT YOU WROTE — nothing more.
 *
 * The model likes to embellish: a subsection here, an exemption there, "under article 4 of the
 * Kneeling Act…". The bookkeeper then files those as world facts, rumours and memories, every
 * later prompt reads them back as true, and a law you wrote in one sentence grows a body of case
 * law you never agreed to. This stops it at the door (anything that adds clauses to a law is not
 * recorded) and gives you a way to strip out whatever already got in.
 */
import type { SaveState } from "./types";
import { lawsOf } from "./court";
import { LAW_BY_ID } from "../data/laws";

/** Words that mean someone is adding to a law rather than obeying it. */
const CLAUSE = /\b(sub-?sections?|sections?\s*[\divx]+|clauses?|articles?\s*[\divx]+|amend(?:ment|ments|ed|s)?|provisions?|exempt(?:ion|ions|s|ed)?|loopholes?|riders?|addend(?:um|a)|technicalit(?:y|ies)|codicils?|provisos?|paragraphs?\s*[\divx]+|stipulat\w*|carve-?outs?|fine print|§)/i;

function lawNames(s: SaveState): string[] {
  return lawsOf(s).map((x) => LAW_BY_ID[x.id]?.name).filter(Boolean) as string[];
}

/** True when this text adds something to a law: it names a law (or talks about "the law") and
 *  uses the language of clauses, exemptions and amendments. */
export function inventsLaw(s: SaveState, text: string): boolean {
  if (!text || !CLAUSE.test(text)) return false;
  const t = text.toLowerCase();
  return lawNames(s).some((n) => t.includes(n.toLowerCase().replace(/^the\s+/, ""))) || /\b(the law|the act|the statute|the ordinance|the code|decree)\b/.test(t);
}

/** Remove every invented clause the game has recorded: world facts, rumours, memories, deed facts,
 *  and the recent-turn summaries the narrator reads back. Returns how many things were removed. */
export function stripLawInventions(s: SaveState): number {
  let n = 0;
  const keep = <T>(list: T[], text: (x: T) => string) => list.filter((x) => { const bad = inventsLaw(s, text(x)); if (bad) n++; return !bad; });
  s.canon = keep(s.canon, (c) => c);
  s.rumors = keep(s.rumors, (r) => r.content);
  for (const m of Object.values(s.memory)) if (m?.episodic) m.episodic = keep(m.episodic, (e) => e.content);
  for (const d of s.deeds ?? []) if (d.fact && inventsLaw(s, d.fact)) { d.fact = undefined; n++; }
  for (const h of s.history) if (inventsLaw(s, h.summary)) { h.summary = "(a turn in which laws were discussed)"; n++; }
  // And say it plainly to the narrator from now on.
  for (const name of lawNames(s)) {
    const text = `The ${name} is exactly what its text says. It has no subsections, clauses, exemptions, amendments or other provisions.`;
    if (!s.retcons.some((r) => r.text === text)) s.retcons.push({ text, week: s.arcology.week, kind: "correction" });
  }
  return n;
}

/** The rule every prompt gets. */
export const LAW_RULE = "The laws in force are exactly as written, word for word. Never invent clauses, subsections, articles, exemptions, amendments, penalties, loopholes or technicalities, and never attribute any provision to a law that isn't in its text. Only the owner changes a law.";
