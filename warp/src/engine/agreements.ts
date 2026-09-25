/**
 * STANDING ORDERS — what you told her about how you're to be treated, kept.
 *
 * "Call me Rabi." She says yes, and the next scene she says Master again, because the scene that
 * heard it is gone and nothing wrote it down. Here it is written down: your own words are read for
 * the shapes an instruction takes (call me, address me as, from now on, always, never, every
 * morning), and the bookkeeper can add the ones it sees her accept. They sit on her record, or on the
 * household's if you said it to everyone, and every prompt that has her in it carries them as a
 * rule she keeps unless she is openly defying you.
 *
 * The same record holds the other direction. When she owns you (engine/reign.ts), her rules for
 * you are kept here too, marked as hers.
 */
import type { Person, SaveState } from "./types";

export interface Agreement {
  /** The rule, written as what she does: `calls you "Rabi"`, `kneels when you come in`. */
  rule: string;
  week: number;
  /** "you": you told her. "her": she set it for you, when she holds your collar. */
  by: "you" | "her";
  /** The name, when the rule is what she calls you. */
  calls?: string;
}

const HOUSEHOLD = /\b(all of you|every one of you|everyone|everybody|you all|y'all|the (?:whole )?household|every slave|all (?:the|my) slaves|the rest of you|you girls)\b/i;

const clean = (x: string) => x.trim().replace(/^["'“‘]+|["'”’.,!?;:]+$/g, "").replace(/\s+/g, " ").trim();

/** Turn "you'll kneel when I come in" into "kneels when you come in", near enough. */
function asHers(raw: string): string {
  let t = clean(raw)
    .replace(/^(?:you(?:'ll| will| are to| must| should| have to| need to|'re to)?|i want you to|i need you to)\s+/i, "")
    .replace(/\byour\b/gi, "her").replace(/\byourself\b/gi, "herself").replace(/\byou\b/gi, "she")
    .replace(/\bmy\b/gi, "your").replace(/\bme\b/gi, "you").replace(/\bI(?:'m| am)\b/g, "you are").replace(/\bI\b/g, "you");
  if (!t) return "";
  return t.charAt(0).toLowerCase() + t.slice(1);
}

/** Read your own words for instructions. Returns what was found; `keep` stores them. */
export function readInstructions(text: string): { calls?: string; rules: string[]; household: boolean } {
  const rules: string[] = [];
  let calls: string | undefined;
  const t = text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  const name = t.match(/\b(?:call me|address me as|refer to me as|you(?:'ll| will| are to| must)? call me|my name (?:is|to you is)|i'm to be called|i am to be called)\s+["']?([^"'.,!?;\n]{1,32})/i);
  if (name) {
    const n = clean(name[1]).replace(/\s+(?:from now on|now|instead|always|please|from here on)$/i, "").trim();
    if (n && !/^(that|this|it|anything|whatever)$/i.test(n)) calls = n.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  const forms = [
    /\bfrom (?:now on|today|here on|this day)\b,?\s*([^.!?\n]{4,140})/gi,
    /\b(?:i want you to|you(?:'ll| will| are to| must))\s+(always|never)\s+([^.!?\n]{3,120})/gi,
    /(?:^|[.!?]\s+)(always|never)\s+([^.!?\n]{3,120})/gi,
    /\b(every (?:morning|night|evening|day|time)[^.!?\n]{0,20}),?\s*(?:you(?:'ll| will| are to| must)?\s+)?([^.!?\n]{3,120})/gi,
    /\bdon'?t (?:you )?ever\s+([^.!?\n]{3,120})/gi,
  ];
  for (const re of forms) {
    for (const m of t.matchAll(re)) {
      let rule = "";
      if (m.length === 2) rule = re.source.startsWith("\\bdon") ? `never ${asHers(m[1])}` : asHers(m[1]);
      else rule = `${m[1].toLowerCase().startsWith("every") ? `${m[1].toLowerCase()}, ` : `${m[1].toLowerCase()} `}${asHers(m[2])}`;
      rule = rule.replace(/^(always|never) (always|never) /, "$2 ");
      if (rule.length >= 6 && !/call(?:s)? you\b/i.test(rule) && !rules.includes(rule)) rules.push(rule.slice(0, 140));
    }
  }
  return { calls, rules: rules.slice(0, 3), household: HOUSEHOLD.test(t) };
}

export function agreementsOf(p: Person): Agreement[] { return (p.agreements ??= []); }
export function houseRules(s: SaveState): Agreement[] { return (s.house_rules ??= []); }

/** Store a rule, replacing an older one that says the same kind of thing. */
export function keep(list: Agreement[], a: Agreement): void {
  if (a.calls) for (let i = list.length - 1; i >= 0; i--) if (list[i].calls && list[i].by === a.by) list.splice(i, 1);
  const i = list.findIndex((x) => x.rule.toLowerCase() === a.rule.toLowerCase() && x.by === a.by);
  if (i >= 0) list.splice(i, 1);
  list.push(a);
  if (list.length > 12) list.splice(0, list.length - 12);
}

/** Your words, said to these people. Stores what they amount to and returns a note per rule. */
export function captureInstructions(s: SaveState, text: string, to: Person[]): string[] {
  const found = readInstructions(text);
  if (!found.calls && !found.rules.length) return [];
  const week = s.arcology.week;
  const notes: string[] = [];
  const everyone = found.household || to.length === 0;
  const add = (a: Agreement) => {
    if (everyone) {
      keep(houseRules(s), a);
      if (a.calls) s.player.address = a.calls;
    } else for (const p of to) keep(agreementsOf(p), a);
  };
  if (found.calls) { add({ rule: `calls you "${found.calls}"`, week, by: "you", calls: found.calls }); notes.push(`${everyone ? "The household" : to.map((p) => p.name).join(" and ")} will call you ${found.calls}.`); }
  for (const r of found.rules) { add({ rule: r, week, by: "you" }); notes.push(`Standing order for ${everyone ? "the household" : to.map((p) => p.name).join(" and ")}: ${r}.`); }
  return notes;
}

/** What she calls you, all rules considered. */
export function calledBy(s: SaveState, p?: Person): string {
  const own = p ? [...agreementsOf(p)].reverse().find((a) => a.calls && a.by === "you") : undefined;
  return own?.calls ?? s.player.address ?? "Master";
}

/** For her card: every standing order she lives under. */
export function agreementsBrief(s: SaveState, p: Person): string {
  const mine = agreementsOf(p).filter((a) => a.by === "you");
  const house = houseRules(s).filter((a) => !a.calls || !mine.some((m) => m.calls));
  const all = [...house, ...mine];
  if (!all.length) return "";
  return `STANDING ORDERS (she agreed to these; she keeps to them in every scene from now on, without being reminded, unless she is openly defying you — and then the defiance is the point of the scene): ${all.map((a) => a.rule).join("; ")}.`;
}
