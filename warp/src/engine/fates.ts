/**
 * FATES — what happened to the people who aren't yours.
 *
 * A dock boss who spits at your governor, a creditor, the owner next door: the game used to keep
 * them as names in prose, so telling someone to have one killed did nothing. The governor said she
 * would, the scene ended, and the same man was back in her next letter. Now an order that gets
 * carried out settles him, everywhere he is kept: the faces on file, the story's cast, a
 * governor's city, a saga's cast. A settled person stays settled. Their trouble ends with them,
 * the threads that were waiting on them close, and what comes next has to come from what's left:
 * the widow, the deputy who takes the docks, the people who saw it done.
 *
 * And how far your reach goes, in plain words, so the people writing to you know who they're
 * writing to.
 */
import type { SaveState } from "./types";
import { chronicle, chronicleOf } from "./chronicle";
import type { Face } from "./faces";
import { arcDef, PERSONAL_ROLES } from "./story";
import { dominion, forces, powers } from "./power";

// Kept off ./faces on purpose: faces pulls in the sagas, and the sagas' prompts need to be built
// after the house style they quote, which a cycle through here would break.
const keyOf = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

export type Fate = "dead" | "ruined" | "exiled" | "jailed" | "bought";

export const FATES: Fate[] = ["dead", "ruined", "exiled", "jailed", "bought"];

/** "was ___" */
export const FATE_WORDS: Record<Fate, string> = {
  dead: "killed", ruined: "ruined", exiled: "driven out", jailed: "locked up", bought: "bought off",
};

export interface Settled { fate: Fate; week: number; how: string }

export function asFate(x: unknown): Fate | undefined {
  const t = String(x ?? "").toLowerCase().trim();
  if ((FATES as string[]).includes(t)) return t as Fate;
  if (/kill|dead|murder|shot|execut|drown|hang/.test(t)) return "dead";
  if (/ruin|bankrupt|broke|strip/.test(t)) return "ruined";
  if (/exile|banish|driven|deport|out of the city|throw.*out|thrown out|run .*out/.test(t)) return "exiled";
  if (/jail|prison|lock|cell|arrest/.test(t)) return "jailed";
  if (/bought|bribe|paid .*off|pay .*off|paid off|pay off|buy/.test(t)) return "bought";
  return undefined;
}

const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z' -]/g, " ").replace(/\s+/g, " ").trim();

/** Whether a name someone used means this person. A surname or a first name alone counts. */
export function sameName(full: string, said: string, short?: string): boolean {
  const a = norm(full), b = norm(said);
  if (!a || !b || b.length < 3) return false;
  if (a === b || (short && norm(short) === b)) return true;
  if (b.includes(a)) return true;
  const parts = a.split(" ");
  const said_ = b.split(" ").filter((w) => w.length > 2);
  return said_.length > 0 && said_.every((w) => parts.includes(w));
}

/**
 * Settle someone. Finds them wherever they're kept and marks them, closes what was waiting on
 * them, and puts it in the record. Returns what changed, as lines for the screen; empty when they
 * were already settled.
 */
export function settle(s: SaveState, name: string, fate: Fate, how: string, opts?: { place?: string; by?: string }): string[] {
  const week = s.arcology.week;
  const who = name.trim();
  if (!who) return [];
  const note: Settled = { fate, week, how: how.replace(/\s+/g, " ").trim().slice(0, 200) };
  const out: string[] = [];
  const keys: string[] = [];
  let full = who;
  let role = "";

  // The faces on file.
  for (const f of Object.values(s.faces ?? {})) {
    // Bought off is the one fate that can be followed by another.
    if (!sameName(f.name, who, f.short) || (f.fate && f.fate.fate !== "bought")) continue;
    f.fate = note;
    full = f.name;
    keys.push(`face:${keyOf(f.name)}`);
  }

  // The story's cast.
  const st = s.story;
  for (const npc of Object.values(st?.cast ?? {})) {
    if (!npc || (npc.outside && npc.outside.fate !== "bought") || !sameName(npc.name, who, npc.short)) continue;
    if (npc.status === "dead" || npc.status === "owned") continue;
    npc.outside = note;
    npc.status = fate === "dead" ? "dead" : fate === "bought" ? "ally" : "gone";
    if (fate === "bought") npc.disposition = Math.max(npc.disposition, 30);
    full = npc.name;
    role = npc.what;
  }
  if (st) for (const [id, run] of Object.entries(st.arcs)) {
    if (run.done) continue;
    const def = arcDef(id);
    const gone = (def?.cast ?? []).map((r) => st.cast[r]).find((n) => n?.outside && n.outside.week === week && sameName(n.name, full));
    if (!def || !gone) continue;
    // Bought off is the one fate a story can carry on through: they're still there, and yours.
    if (fate === "bought" && !PERSONAL_ROLES.includes(gone.role)) continue;
    run.done = true;
    run.beat = undefined;
    run.ending = `${gone.name} was ${FATE_WORDS[fate]} before it came to anything`;
    if (st.pending?.arc === id) st.pending = undefined;
    st.log.push({ week, arc: id, title: def.title, chose: `${gone.name} ${FATE_WORDS[fate]}`, text: `${gone.name} was ${FATE_WORDS[fate]}: ${note.how}` });
    out.push(`${def.title} is over`);
  }

  // A governor's city.
  for (const g of s.governors ?? []) {
    if (g.ended || (opts?.place && g.place !== opts.place)) continue;
    const f = (g.faces ?? []).find((x) => !x.gone && sameName(x.name, who));
    if (!f) continue;
    f.gone = note;
    full = f.name;
    role = `${f.role} in ${g.name}`;
    keys.push(`gov:${g.place}`);
    const before = (g.problems ?? []).length;
    g.problems = (g.problems ?? []).filter((x) => x.face !== f.name && !x.text.includes(f.name));
    if ((g.problems ?? []).length < before) out.push(`the trouble ${f.name} was making in ${g.name} is over`);
    // The rest of her city saw what happens to people who get in her way, and act accordingly.
    for (const o of g.faces ?? []) {
      if (o.gone || o === f) continue;
      if (fate === "dead" || fate === "jailed") o.leaning = Math.min(1, o.leaning + 0.25);
      else if (fate === "ruined") o.leaning = Math.min(1, o.leaning + 0.15);
    }
    if (fate === "dead") g.order = Math.min(100, g.order + 6);
    (g.news ??= []).push({ week, text: `${f.name}, ${f.role}, was ${FATE_WORDS[fate]}. ${note.how}` });
  }

  // A saga's cast.
  for (const x of s.sagas?.list ?? []) {
    if (x.status === "ended") continue;
    const c = x.cast.find((y) => !y.person && sameName(y.name, who));
    if (!c) continue;
    c.now = `${FATE_WORDS[fate]} in week ${week}`;
    c.turns.push({ week, text: `${FATE_WORDS[fate]}: ${note.how}` });
    x.facts.push(fate === "dead" ? `${c.name} is dead (week ${week}): ${note.how}. Never alive in a scene again.` : `${c.name} was ${FATE_WORDS[fate]} in week ${week}: ${note.how}.`);
    if (x.chapter && x.chapter.text.includes(c.name.split(" ")[0])) x.chapter = undefined;
    full = c.name;
  }

  // Nobody on file by that name: put them on file, so the next scene knows.
  if (!keys.length && !role && who.length <= 48 && /^[\p{L}][\p{L}'’.\- ]*$/u.test(who)) {
    const f: Face = { name: who, pronoun: "she", age: 35, first: week, last: week, seen: 1, fate: note };
    (s.faces ??= {})[keyOf(who)] = f;
    keys.push(`face:${keyOf(who)}`);
  }

  // Whatever was waiting on them is done.
  const first = full.split(" ")[0], last = full.split(" ").slice(-1)[0];
  for (const e of chronicleOf(s)) {
    if (e.closed || !e.hook) continue;
    if (e.hook.includes(full) || e.text.includes(full) || (last.length > 3 && e.hook.includes(last)) || (first.length > 3 && e.hook.includes(first))) e.closed = true;
  }
  const line = `${full}${role ? `, ${role},` : ""} was ${FATE_WORDS[fate]}${opts?.by ? ` by ${opts.by}` : ""}. ${note.how}`.replace(/\.\s*\./g, ".").trim();
  chronicle(s, { keys: keys.length ? keys : ["city"], title: FATE_WORDS[fate], text: line });
  s.canon.push(line);
  if (s.canon.length > 60) s.canon.splice(0, s.canon.length - 60);
  out.unshift(`${full} ${fate === "dead" ? "is dead" : `was ${FATE_WORDS[fate]}`}`);
  return out;
}

/** For a prompt: who is out of the story, and how. Empty when nobody is. */
export function settledBrief(s: SaveState, n = 12): string {
  const rows = new Map<string, Settled & { name: string; role?: string }>();
  for (const f of Object.values(s.faces ?? {})) if (f.fate) rows.set(keyOf(f.name), { ...f.fate, name: f.name, role: f.role });
  for (const npc of Object.values(s.story?.cast ?? {})) if (npc?.outside) rows.set(keyOf(npc.name), { ...npc.outside, name: npc.name, role: npc.what });
  for (const g of s.governors ?? []) for (const f of g.faces ?? []) if (f.gone) rows.set(keyOf(f.name), { ...f.gone, name: f.name, role: `${f.role} in ${g.name}` });
  const list = [...rows.values()].sort((a, b) => b.week - a.week).slice(0, n);
  if (!list.length) return "";
  return `PEOPLE WHO HAVE BEEN DEALT WITH (settled; they stay that way. The dead never appear alive, the driven-out and the locked-up don't walk back in unless a scene says how, and the bought-off do what they were paid for. Others can talk about them, grieve them, fear what happened to them, or take their place):\n${list.map((x) => `· ${x.name}${x.role ? ` (${x.role})` : ""}: ${FATE_WORDS[x.fate]}, week ${x.week}. ${x.how}`).join("\n")}`;
}

/** How much weight the owner carries, in words, for anyone deciding how to approach them. */
export function weightBrief(s: SaveState): string {
  const a = s.arcology;
  const mine = forces(s).total;
  const ps = powers(s);
  const top = ps.reduce((m, p) => Math.max(m, p.strength), 0);
  const d = dominion(s);
  const rich = a.cash >= 1_000_000 ? "vastly rich" : a.cash >= 200_000 ? "very rich" : a.cash >= 40_000 ? "comfortable" : a.cash >= 0 ? "short of money" : "in debt";
  const arms = !top ? "armed" : mine >= top * 2 ? "the strongest power anyone here knows of, by a distance" : mine >= top ? "as strong as any power on the map" : mine >= top * 0.5 ? "a real military power, though not the biggest" : "lightly armed next to the big powers";
  const home = a.security >= 60 ? "holds the arcology completely" : a.security >= 35 ? "holds the arcology" : "has a weak grip on the arcology's streets";
  const name = a.rep >= 15_000 ? "a name everyone in the Free Cities knows" : a.rep >= 5_000 ? "a name people know" : "not much of a name yet";
  const weak = a.security < 30 || a.public_standing <= -6 || a.cash < 0;
  return `THE OWNER'S WEIGHT: ${rich}, ${arms}, ${home}, and ${name}${d.share >= 0.1 ? `; ${d.title.toLowerCase()}, with ${Math.round(d.share * 100)}% of the known world answering to them` : ""}. ${weak
    ? "Right now the owner is weaker than they should be, and people who would normally be careful are getting bolder: still not reckless, but less afraid than they were."
    : "Nobody inside the arcology, and nobody outside it with less than a city or an army behind them, confronts the owner to their face or threatens them openly: the owner could have them killed by morning, and they know it. People who want something ask, flatter, bargain or beg. People who oppose the owner work around them: through lawyers, rumours, bribed staff, a slave they've turned, a rival city, the Owners' Association, or by waiting. Only someone with real power of their own pushes openly, and when they do, the scene says what that power is."}`;
}

/** What buying someone off costs. */
export const BUY_OFF = 5000;

/** You give the order yourself, from their record: your security sees to it. */
export function orderDealt(s: SaveState, name: string, fate: Fate): string[] {
  if (fate === "bought") {
    if (s.arcology.cash < BUY_OFF) return [];
    s.arcology.cash -= BUY_OFF;
  }
  const first = name.split(" ")[0];
  const how = {
    dead: s.arcology.security >= 50 ? `Your security took ${first} at night, and nobody found the body` : `Your security shot ${first} in the street, and everyone knows who gave the order`,
    ruined: `Your people froze ${first}'s accounts and called in every debt at once`,
    exiled: `Your guards put ${first} on a boat out of the arcology with one bag`,
    jailed: `Your security took ${first} from home and put them in a cell under the arcology`,
    bought: `You paid ${first} ¤${BUY_OFF.toLocaleString()}, and they do what you tell them now`,
  }[fate];
  return settle(s, name, fate, how);
}
