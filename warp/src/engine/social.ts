/**
 * THE FABRIC — who knows whom, who wants whom, and how news moves through a building.
 *
 * The old game had relationships (`relationship`, `relationshipTarget`, `rivalry`) as a pair of
 * fields on each slave, which means a relationship was two half-facts that could disagree, and a
 * household of forty people had no structure at all beyond those pairs. Here it is an edge list,
 * directed, because how she feels about her is not how she feels about her.
 *
 * The rumor field is Weft's, with the neighbourhood redefined: in a story, neighbourhoods are
 * scenes; in an arcology, they are FACILITIES. A thing that happens in the dairy spreads through
 * the dairy first, and the aggregate body state of that room decides how fast — dread travels
 * through a clenched room, warm news through a settled one.
 */
import type { Edge, Person, Rumor, SaveState } from "./types";
import { clamp } from "./psyche";

export function edgeKey(a: string, b: string): string { return `${a}>${b}`; }

export function getEdge(edges: Edge[], from: string, to: string): Edge | undefined {
  return edges.find((e) => e.from === from && e.to === to);
}

export function ensureEdge(edges: Edge[], from: string, to: string): Edge {
  let e = getEdge(edges, from, to);
  if (!e) {
    e = { from, to, warmth: 0, trust: 0, attraction: 0, power: 0, roles: [], weeks_known: 0 };
    edges.push(e);
  }
  return e;
}

export function moveEdge(edges: Edge[], from: string, to: string, d: Partial<Pick<Edge, "warmth" | "trust" | "attraction" | "power">>): Edge {
  const e = ensureEdge(edges, from, to);
  if (d.warmth) e.warmth = clamp(e.warmth + d.warmth, -100, 100);
  if (d.trust) e.trust = clamp(e.trust + d.trust, -100, 100);
  if (d.attraction) e.attraction = clamp(e.attraction + d.attraction, 0, 100);
  if (d.power) e.power = clamp(e.power + d.power, -100, 100);
  return e;
}

export function addRole(edges: Edge[], from: string, to: string, role: string): void {
  const e = ensureEdge(edges, from, to);
  if (!e.roles.includes(role)) e.roles.push(role);
}

/** Everyone this person shares a room with this week. Facility is the room; the penthouse is a
 *  room; the streets are a room. */
export function roomOf(p: Person): string {
  if (p.facility) return p.facility;
  if (p.assignment === "whore" || p.assignment === "public servant") return "the promenade";
  return "the penthouse";
}

export function roommates(state: SaveState, p: Person): Person[] {
  const room = roomOf(p);
  return Object.values(state.people).filter((o) => o.id !== p.id && o.status === "owned" && roomOf(o) === room);
}

/** CO-REGULATION — nervous systems are not closed. Two passes, both weak and additive, both from
 *  Weft: the pairwise pull toward one safe person, and the mean-field lean of the whole room.
 *
 *  The mean field is why a facility can flip. Not because anyone decided: because the weather in
 *  that room crossed a threshold and took everybody with it. In an arcology this matters far more
 *  than it does in a story, because you are the one who decided who stands in which room. */
export function coRegulate(state: SaveState): { id: string; pull: number }[] {
  const moved: { id: string; pull: number }[] = [];
  const rooms = new Map<string, Person[]>();
  for (const p of Object.values(state.people)) {
    if (p.status !== "owned") continue;
    const r = roomOf(p);
    if (!rooms.has(r)) rooms.set(r, []);
    rooms.get(r)!.push(p);
  }

  for (const [, group] of rooms) {
    if (group.length < 2) continue;
    const mean = group.reduce((n, p) => n + p.psyche.relaxation, 0) / group.length;
    const sameSide = group.filter((p) => (p.psyche.relaxation >= 0) === (mean >= 0)).length / group.length;
    const boost = sameSide >= 0.75 ? 1.6 : 1;

    for (const p of group) {
      // pairwise: the safest person in the room, styled by attachment
      const safe = group
        .filter((o) => o.id !== p.id && o.psyche.relaxation >= 2)
        .sort((a, b) => edgeWarmth(state, p.id, b.id) - edgeWarmth(state, p.id, a.id))[0];
      let pull = 0;
      if (safe) {
        const w = edgeWarmth(state, p.id, safe.id);
        const style = p.persona.attachment.style;
        const gain = style === "anxious" ? 0.09 : style === "avoidant" ? 0.02 : style === "disorganized" ? 0.05 : 0.06;
        // An avoidant body under real threat reads closeness as pressure; comfort does not land.
        const threat = p.psyche.relaxation <= -4;
        const eff = style === "avoidant" && threat ? 0 : gain;
        pull += clamp((safe.psyche.relaxation - p.psyche.relaxation) * eff * (0.5 + w / 200), -0.5, 0.5);
      }
      // mean field, with a dead zone so a room does not jitter
      const gap = mean - p.psyche.relaxation;
      if (Math.abs(gap) > 1) pull += clamp(gap * 0.03 * boost, -0.3, 0.3);
      if (pull) {
        p.psyche.relaxation = clamp(p.psyche.relaxation + pull, -10, 10);
        moved.push({ id: p.id, pull: +pull.toFixed(3) });
      }
    }
  }
  return moved;
}

function edgeWarmth(state: SaveState, from: string, to: string): number {
  return getEdge(state.edges, from, to)?.warmth ?? 0;
}

/** WHO GETS ON WITH WHOM — run weekly for people who share a room. Proximity makes acquaintances;
 *  taste makes attraction; and neither is the other. */
export function tickProximity(state: SaveState): void {
  const rooms = new Map<string, Person[]>();
  for (const p of Object.values(state.people)) {
    if (p.status !== "owned") continue;
    const r = roomOf(p);
    if (!rooms.has(r)) rooms.set(r, []);
    rooms.get(r)!.push(p);
  }
  for (const [, group] of rooms) {
    if (group.length < 2) continue;
    // Cap the pairwise work in a big facility — everybody does not know everybody in a forty-bed
    // dairy, and pretending they do is both false and O(n²).
    const sample = group.length > 8 ? group.slice(0, 8) : group;
    for (const a of sample) {
      for (const b of sample) {
        if (a.id === b.id) continue;
        const e = ensureEdge(state.edges, a.id, b.id);
        e.weeks_known++;
        // warmth accrues slowly with shared time, faster if both are settled
        const both = (a.psyche.relaxation + b.psyche.relaxation) / 2;
        moveEdge(state.edges, a.id, b.id, { warmth: clamp(0.3 + both * 0.08, -0.6, 0.9) });
        // attraction is conditioned, not earned — seeded once, then near-static
        if (e.attraction === 0 && e.weeks_known === 1) e.attraction = seedAttraction(a, b);
      }
    }
  }
}

/** The first read: gated hard by orientation, then set by beauty against this person's taste. It
 *  does NOT move because somebody was kind. Kindness moves warmth. */
export function seedAttraction(viewer: Person, target: Person): number {
  const gate = viewer.persona.attracted_to;
  const targetFem = target.body.dick === null || target.body.vagina !== null;
  if (gate === "no one") return 0;
  if (gate === "women" && !targetFem) return 0;
  if (gate === "men" && targetFem) return 0;
  const beauty = target.body.face;
  const tasteHit = viewer.persona.taste && target.body.appearance_facts
    ? overlap(viewer.persona.taste, target.body.appearance_facts) : 0;
  return clamp(Math.round(beauty * 0.4 + tasteHit * 35), 0, 100);
}

function overlap(a: string, b: string): number {
  const A = new Set(a.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3));
  const B = b.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
  if (!A.size || !B.length) return 0;
  return B.filter((w) => A.has(w)).length / B.length;
}

/* ── THE RUMOR FIELD ─────────────────────────────────────────────────────────────────────────
 * The one cellular-automaton rule in the engine, and the reason a household has a mood rather
 * than forty separate ones. Growth and decay on the same rule: a story sharpens in the telling
 * when it rides matching weather, and dies of boredom when nobody is charged enough to repeat it. */

const DREAD = /\b(kill|killed|dead|cell|punish|sold|arcade|broke|blood|hurt|took|gone|missing|surgery|cut)\b/i;
const WARM = /\b(freed|kept|kind|gift|promised|named|chose|healed|baby|born|home|together|spared)\b/i;

export function chargeOf(text: string): -1 | 0 | 1 {
  if (DREAD.test(text)) return -1;
  if (WARM.test(text)) return 1;
  return 0;
}

export function startRumor(state: SaveState, content: string, opts?: { truth?: Rumor["truth"]; about?: string; from?: string; salience?: number }): Rumor {
  const r: Rumor = {
    id: `r${state.arcology.week}-${state.rumors.length}`,
    content,
    truth: opts?.truth ?? "true",
    salience: opts?.salience ?? 5,
    charge: chargeOf(content),
    knowers: opts?.from ? [opts.from] : [],
    about: opts?.about,
    week: state.arcology.week,
  };
  state.rumors.push(r);
  return r;
}

export function diffuseRumors(state: SaveState): void {
  const rooms = new Map<string, Person[]>();
  for (const p of Object.values(state.people)) {
    if (p.status !== "owned") continue;
    const room = roomOf(p);
    if (!rooms.has(room)) rooms.set(room, []);
    rooms.get(room)!.push(p);
  }

  for (const r of state.rumors) {
    let spread = false;
    for (const [, group] of rooms) {
      const knowers = group.filter((p) => r.knowers.includes(p.id));
      if (!knowers.length) continue;
      const mean = group.reduce((n, p) => n + p.psyche.relaxation, 0) / group.length;
      // dread moves fast through a clenched room; warm news through a settled one
      const match = r.charge === -1 ? clamp((-mean + 2) / 4, 0.2, 2.5)
        : r.charge === 1 ? clamp((mean + 2) / 4, 0.2, 2.5) : 1;
      const rate = clamp(0.25 * match * (r.salience / 6), 0.02, 0.9);
      for (const p of group) {
        if (r.knowers.includes(p.id)) continue;
        // gregarious people hear things
        if (Math.random() < rate * (0.5 + p.persona.gregariousness)) {
          r.knowers.push(p.id);
          spread = true;
        }
      }
    }
    r.salience -= 0.3;
    if (spread && r.charge !== 0) r.salience += 0.6;   // the story grows in the telling
  }
  state.rumors = state.rumors.filter((r) => r.salience >= 1);
}
