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
import { rng } from "./rng";

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

        /**
         * WHAT SHARED TIME ACTUALLY DOES.
         *
         * This used to be `0.3 + meanRelaxation * 0.08`, capped at 0.9 a week. Two consequences,
         * both wrong and both invisible until something tried to read the result:
         *
         *   · A household where everybody was suffering produced NEGATIVE warmth. Mean relaxation
         *     of −5 gave −0.1 a week, so nine months in a brothel under a cruel owner left six
         *     women who had never met. Shared adversity is the oldest bond there is and the model
         *     had it backwards.
         *   · Even at its best it took a year to reach acquaintance, so no relationship in this
         *     game ever got anywhere. The rivalry, romance and friendship layers the original has
         *     could not have worked on top of it.
         *
         * Now: time together always counts for something, being in the same bad place together
         * counts for more, and being settled together counts for most. Rivalry is separate and
         * subtractive — two women competing for the same scarce thing get colder while getting
         * more familiar, which is a real shape and one the old curve could not make.
         */
        const both = (a.psyche.relaxation + b.psyche.relaxation) / 2;
        const suffering = Math.min(-a.psyche.relaxation, -b.psyche.relaxation);
        const foxhole = suffering > 2 ? Math.min(1.1, suffering * 0.22) : 0;
        const ease = both > 1 ? Math.min(0.9, both * 0.14) : 0;
        // Familiarity has diminishing returns: the fiftieth week together is worth less than the
        // fifth, which is why a new arrival can become somebody's closest person in two months.
        const fade = clamp(1.4 - e.weeks_known / 45, 0.35, 1.4);

        // RIVALRY. Two women near each other on the ladder, both wanting the same scarce thing.
        const rung = (p: Person) => p.romance?.dominion ?? -100;
        const rivals = Math.abs(rung(a) - rung(b)) < 25 && Math.max(rung(a), rung(b)) > -60;
        const spite = rivals ? -0.55 - (a.persona.conscience < 0.4 ? 0.3 : 0) : 0;

        moveEdge(state.edges, a.id, b.id, {
          // 1.4 a week of simple proximity: familiar in about four months, close in eight. The
          // first pass at this used 0.55, which is forty weeks to bare acquaintance — still far
          // too slow for any relationship to form inside a campaign, which is the thing that was
          // wrong with the original curve in the first place.
          warmth: clamp((1.4 + foxhole + ease) * fade + spite, -1.4, 3.4),
        });

        // Attraction is conditioned rather than earned, and is seeded once — but familiarity does
        // move it, slowly, and only where there was something to move.
        if (e.attraction === 0 && e.weeks_known === 1) e.attraction = seedAttraction(a, b);
        else if (e.attraction > 12 && e.warmth > 30) {
          moveEdge(state.edges, a.id, b.id, { attraction: clamp(e.warmth / 220, 0, 0.5) });
        }
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

function firstKnowers(state: SaveState, about?: string): string[] {
  const out = new Set<string>();
  if (about && state.people[about]) out.add(about);
  const talkers = Object.values(state.people)
    .filter((p) => p.status === "owned" || p.status === "indentured")
    .sort((a, b) => (b.persona.gregariousness ?? 0.5) - (a.persona.gregariousness ?? 0.5));
  if (talkers[0]) out.add(talkers[0].id);
  return [...out];
}

export function startRumor(state: SaveState, content: string, opts?: { truth?: Rumor["truth"]; about?: string; from?: string; salience?: number; charge?: -1 | 0 | 1 }): Rumor {
  const r: Rumor = {
    id: `r${state.arcology.week}-${state.rumors.length}`,
    content,
    truth: opts?.truth ?? "true",
    salience: opts?.salience ?? 5,
    charge: opts?.charge ?? chargeOf(content),
    // A RUMOUR WITH NOBODY IN IT CANNOT SPREAD. `diffuseRumors` only carries a story out of a room
    // that already contains somebody who knows it, so a rumour seeded with an empty knower list
    // was inert from the first tick and decayed out three weeks later without ever being heard.
    // Every household-wide call in this codebase omitted `from`, which is why seventy weeks of
    // ordinary play produced no gossip at all.
    //
    // With no stated source: the person it is about knows it, and so does whoever in the house
    // talks most. Both are true of real gossip and either is enough to start it moving.
    knowers: opts?.from ? [opts.from] : firstKnowers(state, opts?.about),
    about: opts?.about,
    week: state.arcology.week,
  };
  state.rumors.push(r);
  return r;
}

export function diffuseRumors(state: SaveState): void {
  // Seeded, not Math.random(). This file documented a deterministic engine and then rolled a live
  // die in the one pass that decides what a household believes, so no two runs of the same save
  // produced the same gossip — which also silently broke the rollback ring in state.ts, since a
  // restored week diverged from the one it replaced.
  const die = rng(`rumour:${state.arcology.week}`);
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
        if (die() < rate * (0.5 + p.persona.gregariousness)) {
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


/**
 * WHAT THE HOUSEHOLD TALKS ABOUT THIS WEEK.
 *
 * The rumour field is a decent little cellular automaton that was starved to death. Every call to
 * `startRumor` sat inside an event, and events are rare, so seventy weeks of ordinary play produced
 * ZERO rumours and the whole diffusion layer — along with everything meant to read it — never ran
 * once.
 *
 * Gossip does not come from events. It comes from Tuesday: who got something, who lost something,
 * who came back from the clinic different, who has not been seen. This reads the week that just
 * happened and seeds from the largest actual changes, so the thing the house is talking about is
 * the thing that actually occurred.
 */
export function gossip(state: SaveState, week: number): Rumor[] {
  const out: Rumor[] = [];
  const held = Object.values(state.people).filter((p) => p.status === "owned" || p.status === "indentured");
  if (held.length < 2) return out;

  const seed = (content: string, opts: Parameters<typeof startRumor>[2]) => {
    // Do not restart something the house is already saying.
    if (state.rumors.some((r) => r.content === content)) return;
    out.push(startRumor(state, content, opts));
  };

  for (const p of held) {
    const r = p.bond.read;
    // Somebody is visibly not coping. `prev_relaxation` is a PER-TICK field, not a per-week one,
    // so the first version of this tested a delta that had already been overwritten five times
    // before it was read, and never fired. State, not deltas.
    if (p.psyche.relaxation <= -5) {
      seed(`something happened to ${p.name} and she will not say what`, { about: p.id, salience: 6, from: p.id, charge: -1 });
    }
    // Somebody is doing conspicuously well, which is its own kind of news.
    if (r.devotion > 40 && p.psyche.relaxation > 2) {
      seed(`${p.name} has it easier than the rest of us and everybody has noticed`, { about: p.id, salience: 5, charge: -1 });
    }
    // Somebody came back changed.
    if (p.health.recovery_weeks > 0 && p.health.health < -15) {
      seed(`${p.name} came back from the theatre and is not right`, { about: p.id, salience: 7, charge: -1 });
    }
    // Somebody is on the way out.
    if (r.devotion < -35 && p.bond.resentment > 62) {
      seed(`${p.name} is going to do something and everybody can see it coming`, { about: p.id, salience: 7, charge: -1 });
    }
  }

  // And the house's opinion of the owner, which is what the belief thread is waiting for. Tuned to
  // the range this engine actually produces: derived devotion sits near zero for most households
  // and a mean of −25 is close to unreachable.
  const mean = held.reduce((n, p) => n + p.bond.read.devotion, 0) / held.length;
  const fear = held.reduce((n, p) => n + p.bond.fear, 0) / held.length;
  const res = held.reduce((n, p) => n + p.bond.resentment, 0) / held.length;
  if (res > 45 && week % 5 === 0) {
    seed(`nothing anybody does in this house makes any difference to how he treats them`, { salience: 8, charge: -1 });
  } else if (fear > 30 && week % 5 === 2) {
    seed(`he decides who it is going to be that week before he comes down`, { salience: 8, charge: -1 });
  } else if (mean > 30 && week % 7 === 0) {
    seed(`he is not like the others and the ones who came from the others know it`, { salience: 6, charge: 1 });
  }
  return out;
}
