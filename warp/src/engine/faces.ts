/**
 * FACES YOU'LL SEE AGAIN — people who aren't yours but keep turning up.
 *
 * A creditor, a rival owner, a woman from the lower concourse you talked to once and who comes back
 * three months later with a favour to ask. Each gets a face the first time they appear, and keeps
 * it: what the face is made of (nationality, age, skin, hair, eyes) is stored by name, and the
 * portrait is rebuilt from that the same way every time.
 *
 * Where faces come from:
 *   the story's cast     everyone the story has introduced (the creditor, the sibling, the rival
 *                        next door), made on first sight and never pruned while the story runs;
 *   the model            a scene written by the model ends with a CAST line for each person in it
 *                        who isn't yours, so a stranger it invents is on file from then on, and
 *                        the next scene is told who has been met and what they look like;
 *   anyone               a name that's on file, found in a line of text, brings its face with it.
 *
 * Pruning: someone seen once and not again for twelve weeks is forgotten; anyone not seen for a
 * year is too, unless the story still has them. At most 80 are kept.
 */
import type { Person, SaveState } from "./types";
import { generatePerson } from "./generate";
import { NATIONS } from "../data/people";
import { sagaFaces } from "./saga";
import { isOwnerName } from "./you";
import { known, record } from "./others";

export interface Face {
  /** Who they are, whatever a scene calls them: "f-3k9q2". Shown to the model beside the name, and
   *  taken back from it, so "Yvette" and "Yvette Dubois" can't become two people. */
  id?: string;
  name: string;
  /** Other names a scene has used for them (a first name alone, a surname it invented). */
  aliases?: string[];
  pronoun: "she" | "he";
  age: number;
  nation?: string;
  skin?: string;
  hair?: string;
  hair_style?: string;
  eyes?: string;
  /** One detail that sets them apart, for the model to keep consistent. */
  detail?: string;
  /** Short name used in prose ("Vance", "Sister Ines"), when it differs from the first name. */
  short?: string;
  /** The story role, for the story's cast. They are kept while the story has them. */
  role?: string;
  first: number;
  last: number;
  seen: number;
  /** Dealt with: killed, ruined, driven out, locked up or bought off (engine/fates). */
  fate?: import("./fates").Settled;
  /** What they do and who they are, in a few words: "runs the fish market on the lower docks". */
  what?: string;
  /** What they remember: what happened when they turned up, in their terms. Newest last. */
  notes?: { week: number; text: string }[];
  likes?: string;
  dislikes?: string;
  /** Who they are to people: "married to Ana", "owes the player ¤20,000". A person id when it's one of yours. */
  ties?: { what: string; person?: string }[];
  /** Toward the player, −100 … 100. */
  toward?: number;
  /** Kept on file whatever happens. Set when you pin them, or when they matter to one of yours. */
  kept?: boolean;
  /** The player ended everything to do with them (engine/bans): never tied, cast or named again. */
  banned?: boolean;
}


import { adultText, keyOf, facesOf, findFace, giveId, oneOfOurs, shortName } from "./faceid";
export { keyOf, facesOf, findFace, faceKey, settleFaces } from "./faceid";

const NATION_NAMES = NATIONS.map((n) => n.name);
export function nationFrom(text?: string): string | undefined {
  if (!text) return undefined;
  const t = text.toLowerCase();
  return NATION_NAMES.find((n) => t.includes(n.toLowerCase())) ?? (/filipin/.test(t) ? "Filipina" : undefined);
}

/** A stored face as a person the art can draw. Same face every time: everything comes from the record. */
export function personOf(f: Face): Person {
  const p = generatePerson({ seed: `face:${keyOf(f.name)}`, sex: f.pronoun === "he" ? "male" : "female", age: Math.max(18, Math.min(80, f.age)), nation: f.nation });
  p.id = `face:${keyOf(f.name)}`;
  p.name = f.name;
  if (f.skin) p.body.skin = f.skin;
  if (f.hair) p.body.hair_color = f.hair;
  if (f.eyes) p.body.eye_color = f.eyes;
  if (f.hair_style) p.body.hair_style = f.hair_style;
  if (f.pronoun === "he") {
    p.body.face_shape = "masculine";
    // The art pack's cuts are all women's; a man's short hair is drawn as a close crop (length 1), and bald is bald.
    if (/bald|shaved/i.test(`${f.hair_style ?? ""} ${f.hair ?? ""}`)) p.body.hair_length = 0;
    else if (!f.hair_style || !/long|braid|tail|bun|dread|afro|ponytail/i.test(f.hair_style)) p.body.hair_length = 1;
  } else if (f.hair_style) {
    if (/short|crop|pixie|buzz/i.test(f.hair_style)) p.body.hair_length = 12;
    else if (/long/i.test(f.hair_style)) p.body.hair_length = 80;
  }
  p.clothes = "conservative clothing";
  p.collar = "no collar";
  p.status = "free";
  p.psyche.arousal = 0;
  return p;
}

/** Put someone on file, or mark them seen again. What's already on file is never overwritten: a
 *  face doesn't change because a later scene described it differently. */
export function meet(s: SaveState, o: Partial<Face> & { name: string }): Face | undefined {
  const name = o.name.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 48 || !/^[\p{L}][\p{L}'’.\- ]*$/u.test(name)) return undefined;
  // The owner is never a stranger with a face on file, and nor is one of the player's own.
  if (isOwnerName(s, name) || oneOfOurs(s, name)) return undefined;
  const all = facesOf(s);
  const k = keyOf(name);
  const week = s.arcology.week;
  const had = (o.id ? findFace(s, o.id) : undefined) ?? findFace(s, name);
  // Someone the player ended a storyline over doesn't come back under any spelling.
  if (had?.banned) return undefined;
  if (had) {
    giveId(s, had);
    // Another name for the same person is remembered as one, not filed as somebody new.
    if (keyOf(had.name) !== k && !(had.aliases ?? []).some((a) => keyOf(a) === k)) had.aliases = [...(had.aliases ?? []), name].slice(-6);
    // The dead aren't seen again, whatever a scene says.
    if (had.fate?.fate === "dead") return had;
    if (had.last !== week) had.seen++;
    had.last = week;
    for (const f of ["nation", "skin", "hair", "hair_style", "eyes", "detail", "short", "role"] as const) if (!had[f] && o[f]) (had as unknown as Record<string, unknown>)[f] = o[f];
    return had;
  }
  const f: Face = {
    name, pronoun: o.pronoun ?? "she", age: Math.max(18, o.age ?? 35),
    nation: o.nation, skin: o.skin, hair: o.hair, hair_style: o.hair_style, eyes: o.eyes, detail: o.detail && adultText(o.detail), short: o.short, role: o.role,
    first: week, last: week, seen: 1,
  };
  all[k] = f;
  giveId(s, f);
  return f;
}

/** The story's cast, on file. Surnames suggest where they're from, so the creditor Okafor isn't drawn Japanese. */
const SURNAME_NATION: Record<string, string> = {
  Okafor: "Nigerian", Oyelaran: "Nigerian", Delacroix: "French", Moreau: "French", Ishikawa: "Japanese", Ruiz: "Mexican", Ferreira: "Brazilian",
  Brandt: "German", Achterberg: "German", Novak: "Ukrainian", Szabo: "Ukrainian", Sarr: "Nigerian", Lindqvist: "German", Castellan: "Italian",
  Vance: "American", Marr: "American", Haldane: "American", Kade: "American", Whitlock: "American", Bellamy: "American",
};
function castFace(s: SaveState, role: string, npc: { name: string; pronoun: "he" | "she"; short: string }): Face {
  const surname = npc.name.split(" ").slice(-1)[0];
  return {
    name: npc.name, pronoun: npc.pronoun, age: 28 + ((npc.name.length * 7) % 30), nation: SURNAME_NATION[surname],
    short: npc.short !== npc.name.split(" ")[0] ? npc.short : undefined, role,
    first: s.arcology.week, last: s.arcology.week, seen: 0,
  };
}

/** Everyone who can be recognised: the faces on file, and the story's cast whether or not it's filed yet. Reads only. */
export function knownFaces(s: SaveState): Face[] {
  const out = new Map(Object.entries(s.faces ?? {}).filter(([, f]) => !f.banned));
  for (const [role, npc] of Object.entries(s.story?.cast ?? {})) {
    if (!npc || npc.person || out.has(keyOf(npc.name))) continue;
    out.set(keyOf(npc.name), castFace(s, role, npc));
  }
  return [...out.values()];
}

/** File the story's cast. */
export function syncStoryCast(s: SaveState): void {
  const all = facesOf(s);
  for (const [role, npc] of Object.entries(s.story?.cast ?? {})) {
    if (!npc || npc.person) continue;
    const k = keyOf(npc.name);
    if (all[k]) all[k].role ??= role;
    else all[k] = castFace(s, role, npc);
  }
}

const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Who on file is named in this text, in the order they first appear. First names count only when
 *  one face on file has that first name. */
export function facesIn(s: SaveState, text: string, max = 3): Face[] {
  const all = knownFaces(s);
  if (!all.length || !text) return [];
  const firstCount = new Map<string, number>();
  for (const f of all) { const fn = shortName(f.name)?.toLowerCase(); if (fn) firstCount.set(fn, (firstCount.get(fn) ?? 0) + 1); }
  const hits: { f: Face; at: number }[] = [];
  for (const f of all) {
    // "the courier" has no first name to go by: "the" is in every sentence (engine/faceid shortName).
    const first = shortName(f.name);
    const names = [f.name, f.short, ...(f.aliases ?? []).filter((a) => a.includes(" ")), first && firstCount.get(first.toLowerCase()) === 1 ? first : undefined]
      .filter((x): x is string => !!x && x.length > 2);
    let at = -1;
    for (const n of names) {
      const m = new RegExp(`\\b${esc(n)}\\b`).exec(text);
      if (m && (at < 0 || m.index < at)) at = m.index;
    }
    if (at >= 0) hits.push({ f, at });
  }
  return hits.sort((a, b) => a.at - b.at).slice(0, max).map((h) => h.f);
}

/* ── the model's side ───────────────────────────────────────────────────────────────────────── */

const AGE_WORDS: [RegExp, number][] = [[/teen/, 19], [/twent/, 25], [/thirt/, 35], [/fort/, 45], [/fift/, 55], [/sixt/, 65], [/sevent/, 74], [/old|elder/, 68], [/young/, 24], [/middle/, 48]];
function ageFrom(t: string): number | undefined {
  const n = /\d{2}/.exec(t);
  if (n) return Number(n[0]) + (/s\b/.test(t) ? 4 : 0);
  return AGE_WORDS.find(([re]) => re.test(t.toLowerCase()))?.[1];
}

/** CAST: name | she/he | age | nationality | skin | hair | eyes | detail — one line per person. */
export function parseCast(text: string): { prose: string; cast: (Partial<Face> & { name: string })[] } {
  const cast: (Partial<Face> & { name: string })[] = [];
  const kept: string[] = [];
  for (const line of text.split("\n")) {
    const m = /^\s*[-*•]?\s*\**CAST\**\s*:\s*(.+)$/i.exec(line);
    if (!m) { kept.push(line); continue; }
    const f = m[1].split("|").map((x) => x.trim());
    if (!f[0]) continue;
    const hair = f[5] ?? "";
    const [colour, ...style] = hair.split(/,|;/).map((x) => x.trim());
    const head = f[0].replace(/^["*\[]+|["*\]]+$/g, "");
    const id = /^f-[a-z0-9]+$/i.test(head) ? head : /^(f-[a-z0-9]+)\s+(.+)$/i.exec(head)?.[1];
    cast.push({
      id,
      name: id ? head.replace(id, "").trim() || id : head,
      pronoun: /\bhe\b|\bman\b|\bmale\b|\bhim\b/i.test(f[1] ?? "") ? "he" : "she",
      age: ageFrom(f[2] ?? ""),
      nation: nationFrom(f[3]),
      skin: f[4] || undefined,
      hair: colour?.replace(/\bhair\b/i, "").trim() || undefined,
      hair_style: style.join(", ") || (/(short|long|crop|bob|braid|bun|tail|curl|shaved)/i.exec(colour ?? "")?.[0]) || undefined,
      eyes: f[6]?.replace(/\beyes?\b/i, "").trim() || undefined,
      detail: f[7] || undefined,
    });
  }
  return { prose: kept.join("\n").trim(), cast };
}


/** For the model: who has been met, so a returning face is described the same, and the line to add. */
export function castBrief(s: SaveState, text: string): string {
  const named = facesIn(s, text, 6);
  const recent = knownFaces(s).filter((f) => f.seen > 0).sort((a, b) => b.last - a.last).slice(0, 6);
  const list = [...new Map([...named, ...recent].map((f) => [f.name, f])).values()].slice(0, 10);
  const fate = (f: Face) => (f.fate ? ` [${f.fate.fate === "dead" ? "DEAD" : f.fate.fate === "bought" ? "BOUGHT OFF" : f.fate.fate === "exiled" ? "DRIVEN OUT" : f.fate.fate.toUpperCase()} since week ${f.fate.week}: ${f.fate.how}]` : "");
  const line = (f: Face) => `· [${giveId(s, f)}] ${f.name}${fate(f)} — ${f.pronoun}, about ${f.age}${f.nation ? `, ${f.nation}` : ""}${f.skin ? `, ${f.skin} skin` : ""}${f.hair ? `, ${f.hair} hair${f.hair_style ? ` (${f.hair_style})` : ""}` : ""}${f.eyes ? `, ${f.eyes} eyes` : ""}${f.detail ? `; ${f.detail}` : ""}${(f.aliases ?? []).length ? `. Also called ${f.aliases!.join(", ")}, the same person` : ""}${record(s, f)}`;
  return [
    list.length ? `## PEOPLE THE PLAYER HAS MET\nThey aren't the player's people. Each has an id in brackets, and that id is who they are. If one of them appears, it's that same person, with this name and look. Someone marked DEAD can't appear at all.\n${list.map(line).join("\n")}` : "",
    `## CAST LINES\nAfter the options, add one line for each person in the scene who is not the player and not one of the player's slaves, and who speaks or acts, in this form. CAST: full name | she or he | age | nationality | skin | hair colour, style | eye colour | one visible detail. For someone already met, put their id in front of the name, like "CAST: f-3k9q2 Yvette Charron | ...". Give anyone new a full name whose first name nobody on file has, alive or dead, and that none of the player's slaves has. Leave out crowds nobody would name.`,
  ].filter(Boolean).join("\n\n");
}

/* ── forgetting ─────────────────────────────────────────────────────────────────────────────── */

export function pruneFaces(s: SaveState): void {
  const all = s.faces;
  if (!all) return;
  const week = s.arcology.week;
  const cast = new Set([...Object.values(s.story?.cast ?? {}).map((n) => n && keyOf(n.name)), ...sagaFaces(s)]);
  for (const [k, f] of Object.entries(all)) {
    if (cast.has(k) || f.kept) continue;
    // Someone you had dealt with is remembered for a year, so nobody brings them back by accident.
    if ((f.seen <= 1 && !known(f) && week - f.last > 12) || week - Math.max(f.last, f.fate?.week ?? 0) > 52) delete all[k];
  }
  const rest = Object.entries(all).filter(([k, f]) => !cast.has(k) && !f.kept).sort((a, b) => a[1].last - b[1].last || a[1].seen - b[1].seen);
  for (const [k] of rest.slice(0, Math.max(0, Object.keys(all).length - 80))) delete all[k];
}
