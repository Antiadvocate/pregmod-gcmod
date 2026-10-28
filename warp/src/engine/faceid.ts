/**
 * WHO'S WHO: ids and name resolution for the people on file (engine/faces). Kept apart from faces.ts
 * with no imports of its own, so the save loader can use it without pulling the story and the
 * prompts in early (an import cycle there once left the saga writer's house style undefined).
 */
import type { SaveState } from "./types";
import type { Face } from "./faces";

export const keyOf = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");
export const facesOf = (s: SaveState): Record<string, Face> => (s.faces ??= {});
const firstOf = (name: string) => keyOf(name).split(" ")[0];

/* ── who's who ───────────────────────────────────────────────────────────────────────────────
 * One person, one record, whatever a scene calls them. A model that met "Yvette Charron" will call
 * her "Yvette" next week and "Yvette Dubois" the week after, and filing each spelling as somebody
 * new is how a dead woman walked back into the story with a fresh surname. So: every face has an id,
 * and every name the game is handed goes through `findFace` before anyone new is filed. In this
 * world a first name belongs to one person on file. A new person gets a first name nobody on file
 * has, alive or dead, and the model is told so. */

function hashId(key: string): string {
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = ((h << 5) + h + key.charCodeAt(i)) >>> 0;
  return `f-${h.toString(36).slice(0, 6)}`;
}
export function giveId(s: SaveState, f: Face): string {
  if (f.id) return f.id;
  const used = new Set(Object.values(facesOf(s)).map((x) => x.id).filter(Boolean));
  let id = hashId(keyOf(f.name));
  for (let n = 1; used.has(id); n++) id = `${hashId(keyOf(f.name))}${n.toString(36)}`;
  return (f.id = id);
}

/** The record for a name, an alias, a short name, an id ("f-3k9q2", "face:yvette charron"), or a
 *  first name only one face on file has. Undefined when nobody, or when it can't tell. */
export function findFace(s: SaveState, ref: string): Face | undefined {
  const all = facesOf(s);
  const r = ref.trim().replace(/^\[|\]$/g, "").trim();
  if (!r) return undefined;
  if (/^f-[a-z0-9]+$/i.test(r)) return Object.values(all).find((f) => f.id?.toLowerCase() === r.toLowerCase());
  const k = keyOf(r.replace(/^face:/i, ""));
  if (all[k]) return all[k];
  const list = Object.values(all);
  const named = list.find((f) => (f.aliases ?? []).some((a) => keyOf(a) === k) || (f.short && keyOf(f.short) === k));
  if (named) return named;
  const fn = firstOf(k);
  if (fn.length < 3) return undefined;
  const same = list.filter((f) => firstOf(f.name) === fn || (f.aliases ?? []).some((a) => firstOf(a) === fn));
  return same.length === 1 ? same[0] : undefined;
}

/** The key a face is filed under (what sagas, fates and the chronicle store). */
export const faceKey = (s: SaveState, f: Face): string => Object.entries(facesOf(s)).find(([, x]) => x === f)?.[0] ?? keyOf(f.name);

/** One of the player's own people, by full name or a first name only one of them has. */
export function oneOfOurs(s: SaveState, name: string): boolean {
  const k = keyOf(name), fn = firstOf(name);
  const ppl = Object.values(s.people);
  // A woman's name and surname are kept apart ("Élise", "Girard"), and a scene uses both.
  if (ppl.some((p) => keyOf(p.name) === k || (p.surname && keyOf(`${p.name} ${p.surname}`) === k))) return true;
  return k === fn && ppl.filter((p) => firstOf(p.name) === fn).length === 1;
}

/** A model now and then gives a background character a child's age ("scullery slave, seventeen").
 *  Everyone in this game is an adult, so the age in a description is never under eighteen. */
export function adultText(text: string): string {
  return text
    .replace(/\b(ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen)(-year-old| years old)?\b/gi, (_m, _n, tail) => `nineteen${tail ?? ""}`)
    .replace(/\b(1[0-7])(-year-old| years old|yo)\b/gi, (_m, _n, tail) => `19${tail}`)
    .replace(/,\s*(1[0-7])\s*(,|$)/g, ", 19$2");
}

/** Old saves: give every face an id, and fold records that are one person under two spellings
 *  ("Yvette", "Yvette Charron", "Yvette Dubois") into one. The one with a fate wins (the dead stay
 *  dead), then the one the story or the player kept, then the most seen. Records with different
 *  story roles, or a role and none, are left alone: the story meant two people. References to the folded keys are
 *  moved over: sagas, the chronicle. */
export function settleFaces(s: SaveState): void {
  const all = s.faces;
  if (!all) return;
  // One of the player's own filed as an outsider is the same woman twice, and the copy drifts: it
  // got its own job, its own ties and its own fate. The woman in the house is the real one.
  const gone = new Set<string>();
  for (const [k, f] of Object.entries(all)) if (oneOfOurs(s, f.name)) { delete all[k]; gone.add(k); }
  if (gone.size) {
    for (const x of s.sagas?.list ?? []) { for (const c of x.cast) if (c.face && gone.has(c.face)) delete c.face; if (x.seed?.faces) x.seed.faces = x.seed.faces.filter((k) => !gone.has(k)); }
    for (const e of s.chronicle ?? []) e.keys = e.keys.filter((k) => !(k.startsWith("face:") && gone.has(k.slice(5))));
  }
  for (const f of Object.values(all)) {
    giveId(s, f);
    if (f.what) f.what = adultText(f.what);
    if (f.detail) f.detail = adultText(f.detail);
    if (f.age < 18) f.age = 19;
  }
  const groups = new Map<string, string[]>();
  for (const k of Object.keys(all)) { const fn = firstOf(all[k].name); if (fn.length >= 3) groups.set(fn, [...(groups.get(fn) ?? []), k]); }
  const moved = new Map<string, string>();
  for (const keys of groups.values()) {
    if (keys.length < 2) continue;
    // A story role is a fixed character: a guard who shares a first name with the rival owner is
    // somebody else. Only records with the same role, or none, are one person.
    const roles = new Set(keys.map((k) => all[k].role ?? ""));
    if (roles.size > 1) continue;
    const rank = (f: Face) => (f.fate ? 1000 : 0) + (f.role || f.kept ? 100 : 0) + f.seen + f.name.split(" ").length * 0.1;
    const [main, ...rest] = [...keys].sort((a, b) => rank(all[b]) - rank(all[a]));
    const m = all[main];
    for (const k of rest) {
      const o = all[k];
      m.aliases = [...new Map([...(m.aliases ?? []), o.name, ...(o.aliases ?? [])].map((a) => [keyOf(a), a])).values()].filter((a) => keyOf(a) !== keyOf(m.name));
      m.notes = [...(m.notes ?? []), ...(o.notes ?? [])].sort((a, b) => a.week - b.week).slice(-12);
      m.ties = [...(m.ties ?? []), ...(o.ties ?? []).filter((t) => !(m.ties ?? []).some((x) => x.what === t.what))];
      m.seen += o.seen; m.first = Math.min(m.first, o.first); m.last = Math.max(m.last, o.last);
      for (const fld of ["nation", "skin", "hair", "hair_style", "eyes", "detail", "short", "what", "likes", "dislikes", "toward"] as const) if (m[fld] === undefined && o[fld] !== undefined) (m as unknown as Record<string, unknown>)[fld] = o[fld];
      m.kept ||= o.kept;
      delete all[k];
      moved.set(k, main);
    }
  }
  if (!moved.size) return;
  for (const x of s.sagas?.list ?? []) {
    for (const c of x.cast) if (c.face && moved.has(c.face)) c.face = moved.get(c.face);
    if (x.seed?.faces) x.seed.faces = [...new Set(x.seed.faces.map((k) => moved.get(k) ?? k))];
  }
  for (const e of s.chronicle ?? []) e.keys = [...new Set(e.keys.map((k) => (k.startsWith("face:") && moved.has(k.slice(5)) ? `face:${moved.get(k.slice(5))}` : k)))];
}

