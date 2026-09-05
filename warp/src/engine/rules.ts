/**
 * STANDING ORDERS — the Rules Assistant, rebuilt as data.
 *
 * The old Rules Assistant was the best thing in the game and the worst thing to use: a hundred
 * fields of dropdowns in an order nobody could hold in their head, with no way to ask "what will
 * this actually do?" short of ending the week and reading the diff.
 *
 * Three changes:
 *
 *   1. A RULE IS A SENTENCE. Conditions and effects both come from closed registries with labels,
 *      so `describe()` renders any rule as English and the editor is a sentence builder rather
 *      than a form.
 *   2. IT HAS A DRY RUN. `preview()` answers "who does this touch, and what would change" without
 *      touching anything, because a rules engine you cannot interrogate is a rules engine people
 *      turn off.
 *   3. THE REPORT SAYS WHO DID IT. Every applied effect stamps the person's `rules_applied`, and
 *      the week report names the rule, so "why is she in the cellblock" always has an answer.
 *
 * Ordering: rules run by ascending `priority`, and a later rule beats an earlier one on the same
 * field. That is the only precedence law, and it is stated in the UI.
 */
import type { Person, RuleCondition, RuleEffect, SaveState, StandingOrder, Assignment } from "./types";
import { read } from "./obedience";
import { clamp } from "./psyche";
import { band } from "./psyche";

type Getter = (p: Person, s: SaveState) => number | string | boolean | string[];

export interface FieldDef {
  id: string;
  label: string;
  kind: "number" | "text" | "enum" | "bool" | "list";
  options?: string[];
  get: Getter;
  /** For the sentence renderer: "devotion", "her assignment", "her health". */
  phrase: string;
}

export const RULE_FIELDS: FieldDef[] = [
  { id: "devotion", label: "Devotion", kind: "number", phrase: "her devotion", get: (p) => read(p).devotion },
  { id: "trust", label: "Trust", kind: "number", phrase: "her trust", get: (p) => read(p).trust },
  { id: "fear", label: "Fear", kind: "number", phrase: "her fear", get: (p) => p.bond.fear },
  { id: "bond", label: "Bond", kind: "number", phrase: "her bond to you", get: (p) => p.bond.bond },
  { id: "resentment", label: "Resentment", kind: "number", phrase: "her resentment", get: (p) => p.bond.resentment },
  { id: "fragility", label: "Fragility", kind: "number", phrase: "how much of her obedience is fear", get: (p) => Math.round(read(p).fragility * 100) },
  { id: "health", label: "Health", kind: "number", phrase: "her health", get: (p) => p.health.health },
  { id: "energy", label: "Energy", kind: "number", phrase: "her energy", get: (p) => p.health.energy },
  { id: "relaxation", label: "Relaxation", kind: "number", phrase: "how clenched she is", get: (p) => +p.psyche.relaxation.toFixed(1) },
  { id: "state", label: "Nervous state", kind: "enum", options: ["intact", "fracturing", "broken"], phrase: "her state", get: (p) => p.psyche.state },
  { id: "band", label: "Band", kind: "enum", options: ["clenched", "braced", "guarded", "settled", "open", "fracturing", "broken"], phrase: "she reads as", get: (p) => band(p.psyche) },
  { id: "age", label: "Age", kind: "number", phrase: "her age", get: (p) => p.age },
  { id: "weeks_owned", label: "Weeks owned", kind: "number", phrase: "how long you have had her", get: (p) => p.economics.weeks_owned },
  { id: "assignment", label: "Assignment", kind: "text", phrase: "her assignment", get: (p) => p.assignment },
  { id: "facility", label: "Facility", kind: "text", phrase: "where she works", get: (p) => p.facility ?? "" },
  { id: "pregnant", label: "Pregnant", kind: "bool", phrase: "she is pregnant", get: (p) => p.womb.fetuses.length > 0 },
  { id: "pregnancy_week", label: "Weeks pregnant", kind: "number", phrase: "how far along she is", get: (p) => p.womb.weeks },
  { id: "lactating", label: "Lactating", kind: "bool", phrase: "she is lactating", get: (p) => p.body.lactation > 0 },
  { id: "boobs", label: "Breast size (cc)", kind: "number", phrase: "her breasts", get: (p) => p.body.boobs },
  { id: "weight", label: "Weight", kind: "number", phrase: "her weight", get: (p) => p.body.weight },
  { id: "face", label: "Face", kind: "number", phrase: "her face", get: (p) => p.body.face },
  { id: "education", label: "Education", kind: "number", phrase: "her education", get: (p) => p.persona.education },
  { id: "whoring", label: "Whoring skill", kind: "number", phrase: "her whoring", get: (p) => p.skills.whoring },
  { id: "entertainment", label: "Entertainment skill", kind: "number", phrase: "her entertaining", get: (p) => p.skills.entertainment },
  { id: "sex_skill", label: "Sexual skill", kind: "number", phrase: "her sexual skill", get: (p) => Math.round((p.skills.oral + p.skills.vaginal + p.skills.anal) / 3) },
  { id: "flight_risk", label: "Flight risk", kind: "number", phrase: "her flight risk", get: (p) => Math.round(read(p).flight_risk * 100) },
  { id: "addiction", label: "Addiction", kind: "number", phrase: "her dependence", get: (p) => p.health.addiction },
  { id: "nationality", label: "Nationality", kind: "text", phrase: "where she is from", get: (p) => p.origin.nationality },
  { id: "attachment", label: "Attachment style", kind: "enum", options: ["secure", "anxious", "avoidant", "disorganized"], phrase: "her attachment style", get: (p) => p.persona.attachment.style },
];

export const FIELD_BY_ID: Record<string, FieldDef> = Object.fromEntries(RULE_FIELDS.map((f) => [f.id, f]));

export interface EffectDef {
  id: string;
  label: string;
  kind: "number" | "text" | "enum" | "bool";
  options?: string[];
  /** Return a description of what changed, or null if nothing did. Pure enough to dry-run: pass
   *  `dry` and it must not mutate. */
  apply: (p: Person, value: RuleEffect["value"], s: SaveState, dry: boolean) => string | null;
}

const setNum = (get: (p: Person) => number, set: (p: Person, n: number) => void, label: string): EffectDef["apply"] =>
  (p, v, _s, dry) => {
    const n = Number(v);
    if (get(p) === n) return null;
    const was = get(p);
    if (!dry) set(p, n);
    return `${label}: ${was} → ${n}`;
  };

/** The facilities that count as care rather than work — being moved into one is a rescue, and a
 *  rescue is supposed to end. */
const CARE = ["spa", "clinic"];

export const RULE_EFFECTS: EffectDef[] = [
  {
    id: "assignment", label: "Set assignment", kind: "text",
    apply: (p, v, s, dry) => {
      if (p.assignment === v) return null;
      if (isMinor(p) && !MINOR_ASSIGNMENTS.includes(v as Assignment)) return null;
      const was = p.assignment;
      if (!dry) setAssignment(s, p, v as Assignment);
      return `assignment: ${was} → ${v}`;
    },
  },
  {
    id: "facility", label: "Move to facility", kind: "text",
    apply: (p, v, s, dry) => {
      const id = String(v);
      if (p.facility === id) return null;
      if (id && !s.arcology.facilities[id]?.level) return null;
      const was = p.facility ?? "nowhere";
      if (!dry) {
        // Moving her INTO care remembers where she came from, so there is something to put her
        // back on when she has mended. Moving her anywhere else is the player deciding, and
        // overwrites the note rather than preserving a stale one.
        if (CARE.includes(id)) { if (!p.pulled_from) p.pulled_from = { facility: p.facility, assignment: p.assignment, week: s.arcology.week }; }
        else delete p.pulled_from;
        assignToFacility(s, p, id || undefined);
      }
      return `moved: ${was} → ${id || "the penthouse"}`;
    },
  },
  { id: "diet", label: "Set diet", kind: "enum", options: ["healthy", "restricted", "fattening", "muscle building", "slimming", "cleansing"],
    apply: (p, v, _s, dry) => { if (p.health.diet === v) return null; const was = p.health.diet; if (!dry) p.health.diet = v as Person["health"]["diet"]; return `diet: ${was} → ${v}`; } },
  { id: "curatives", label: "Curatives", kind: "number", apply: setNum((p) => p.health.curatives, (p, n) => { p.health.curatives = clamp(n, 0, 2) as 0 | 1 | 2; }, "curatives") },
  { id: "aphrodisiacs", label: "Aphrodisiacs", kind: "number", apply: setNum((p) => p.health.aphrodisiacs, (p, n) => { p.health.aphrodisiacs = clamp(n, 0, 3) as 0 | 1 | 2 | 3; }, "aphrodisiacs") },
  { id: "contraceptives", label: "Contraceptives", kind: "bool",
    apply: (p, v, _s, dry) => { const b = !!v; if (p.womb.contraceptives === b) return null; if (!dry) p.womb.contraceptives = b; return `contraceptives: ${b ? "on" : "off"}`; } },
  { id: "chastity_vagina", label: "Vaginal chastity", kind: "bool",
    apply: (p, v, _s, dry) => { const b = !!v; if (p.chastity.vagina === b) return null; if (!dry) p.chastity.vagina = b; return `chastity: ${b ? "locked" : "unlocked"}`; } },
  { id: "clothes", label: "Set clothing", kind: "text",
    apply: (p, v, _s, dry) => { if (p.clothes === v) return null; const was = p.clothes; if (!dry) p.clothes = String(v); return `clothes: ${was} → ${v}`; } },
  { id: "collar", label: "Set collar", kind: "text",
    apply: (p, v, _s, dry) => { if (p.collar === v) return null; if (!dry) p.collar = String(v); return `collar: ${v}`; } },
  { id: "release", label: "Take out of the facility and rest", kind: "bool",
    apply: (p, _v, s, dry) => {
      if (!p.facility && p.assignment === "rest") return null;
      if (!dry) {
        // Same round trip as a move into care: the badly hurt one is coming back too.
        if (!p.pulled_from) p.pulled_from = { facility: p.facility, assignment: p.assignment, week: s.arcology.week };
        assignToFacility(s, p, undefined);
        p.assignment = "rest";
      }
      return "pulled out and rested";
    } },
  {
    id: "back_to_work", label: "Put her back where she was", kind: "bool",
    apply: (p, _v, s, dry) => {
      const from = p.pulled_from;
      if (!from) return null;
      const facility = from.facility && s.arcology.facilities[from.facility]?.level ? from.facility : undefined;
      if (p.facility === facility && p.assignment === from.assignment) { if (!dry) delete p.pulled_from; return null; }
      if (!dry) {
        assignToFacility(s, p, facility);
        if (!facility) setAssignment(s, p, from.assignment);
        delete p.pulled_from;
      }
      return `back on the rota after ${s.arcology.week - from.week} week${s.arcology.week - from.week === 1 ? "" : "s"}`;
    },
  },
  { id: "flag_review", label: "Flag for your attention", kind: "text",
    apply: (p, v, s, dry) => { if (!dry) s.notifications.push({ id: `n${s.arcology.week}-${p.id}-${Math.random().toString(36).slice(2, 6)}`, week: s.arcology.week, text: `${p.name}: ${v}`, kind: "warning", person: p.id, seen: false }); return `flagged: ${v}`; } },
];

export const EFFECT_BY_ID: Record<string, EffectDef> = Object.fromEntries(RULE_EFFECTS.map((e) => [e.id, e]));

/** THE AGE GATE.
 *
 *  Children exist in this engine because births do, and the moment they exist every assignment
 *  dropdown in the app will happily offer them to the brothel. So the gate is in the engine rather
 *  than in the interface: `assignToFacility` and the assignment setter both go through here, and
 *  there is no path around it — a rules effect, a facility move and a hand edit all land on the
 *  same function. Under eighteen: rest, the nursery, the schoolroom, the spa, the clinic. That is
 *  the whole list, and it is not configurable.
 */
export const MINOR_ASSIGNMENTS: Assignment[] = ["rest", "classes", "get treatment", "learn in the schoolroom", "rest in the spa", "get treatment in the clinic", "work as a servant"];
export const MINOR_FACILITIES = ["nursery", "schoolroom", "spa", "clinic"];

export function isMinor(p: Person): boolean { return p.age < 18; }

export function allowedAssignments(p: Person, all: Assignment[]): Assignment[] {
  return isMinor(p) ? all.filter((a) => MINOR_ASSIGNMENTS.includes(a)) : all;
}

/** The one writer for what somebody is doing. Returns what was refused, if anything. */
export function setAssignment(s: SaveState, p: Person, a: Assignment): string | null {
  if (isMinor(p) && !MINOR_ASSIGNMENTS.includes(a)) return `${p.name} is ${p.age}. That is not a thing she can be assigned to.`;
  p.assignment = a;
  return null;
}

/** Facility membership is authoritative on the facility, mirrored on the person. One writer. */
export function assignToFacility(s: SaveState, p: Person, facilityId?: string): void {
  if (facilityId && isMinor(p) && !MINOR_FACILITIES.includes(facilityId)) return;
  for (const f of Object.values(s.arcology.facilities)) {
    f.workers = f.workers.filter((id) => id !== p.id);
    if (f.manager === p.id && f.id !== facilityId) delete f.manager;
  }
  p.facility = facilityId;
  if (!facilityId) return;
  const f = s.arcology.facilities[facilityId];
  if (!f) { p.facility = undefined; return; }
  if (f.workers.length >= f.capacity) { p.facility = undefined; return; }
  f.workers.push(p.id);
  const def = FACILITY_WORK[f.kind];
  if (def) p.assignment = def;
}

/** The work assignment each facility's workers hold — mirrored from the facility table at import
 *  time so the two cannot drift. */
import { FACILITIES } from "../data/facilities";
const FACILITY_WORK: Record<string, Assignment> = Object.fromEntries(FACILITIES.map((f) => [f.id, f.work]));

function test(c: RuleCondition, p: Person, s: SaveState): boolean {
  const f = FIELD_BY_ID[c.field];
  if (!f) return false;
  const v = f.get(p, s);
  const target = c.value;
  switch (c.op) {
    case "lt": return Number(v) < Number(target);
    case "lte": return Number(v) <= Number(target);
    case "gt": return Number(v) > Number(target);
    case "gte": return Number(v) >= Number(target);
    case "eq": return String(v) === String(target);
    case "neq": return String(v) !== String(target);
    case "in": return Array.isArray(target) && target.map(String).includes(String(v));
    case "nin": return Array.isArray(target) && !target.map(String).includes(String(v));
    case "has": return Array.isArray(v) && v.map(String).includes(String(target));
    case "hasnot": return Array.isArray(v) && !v.map(String).includes(String(target));
    default: return false;
  }
}

export function matches(order: StandingOrder, p: Person, s: SaveState): boolean {
  if (!order.enabled || p.rules_exempt) return false;
  return order.conditions.every((c) => test(c, p, s));
}

export interface RuleRun { person: string; rule: string; changes: string[] }

/** Apply every enabled rule to every eligible person. Returns what actually changed, for the
 *  report. Pass `dry` for the preview: nothing is mutated and the same list comes back. */
export function runOrders(s: SaveState, dry = false): RuleRun[] {
  const out: RuleRun[] = [];
  const orders = [...s.orders].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
  for (const p of Object.values(s.people)) {
    if (p.status !== "owned" && p.status !== "indentured") continue;
    if (!dry) p.rules_applied = [];
    for (const o of orders) {
      if (!matches(o, p, s)) continue;
      const changes: string[] = [];
      for (const e of o.effects) {
        const def = EFFECT_BY_ID[e.field];
        if (!def) continue;
        const msg = def.apply(p, e.value, s, dry);
        if (msg) changes.push(msg);
      }
      if (changes.length) {
        if (!dry) p.rules_applied.push(o.id);
        out.push({ person: p.id, rule: o.id, changes });
      }
    }
  }
  return out;
}

export function preview(s: SaveState, order: StandingOrder): { person: Person; changes: string[] }[] {
  const out: { person: Person; changes: string[] }[] = [];
  for (const p of Object.values(s.people)) {
    if (p.status !== "owned" && p.status !== "indentured") continue;
    if (!matches(order, p, s)) continue;
    const changes: string[] = [];
    for (const e of order.effects) {
      const def = EFFECT_BY_ID[e.field];
      if (!def) continue;
      const msg = def.apply(p, e.value, s, true);
      if (msg) changes.push(msg);
    }
    out.push({ person: p, changes });
  }
  return out;
}

const OP_WORDS: Record<RuleCondition["op"], string> = {
  lt: "is under", lte: "is at most", gt: "is over", gte: "is at least",
  eq: "is", neq: "is not", in: "is one of", nin: "is none of", has: "includes", hasnot: "does not include",
};

/** The rule, as a sentence. */
export function describe(o: StandingOrder): string {
  if (!o.conditions.length) return `Everyone: ${o.effects.map(effectPhrase).join(", ")}.`;
  const when = o.conditions.map((c) => {
    const f = FIELD_BY_ID[c.field];
    const val = Array.isArray(c.value) ? c.value.join(" or ") : String(c.value);
    if (f?.kind === "bool") return `${f.phrase}${c.value ? "" : " is not true"}`;
    return `${f?.phrase ?? c.field} ${OP_WORDS[c.op]} ${val}`;
  }).join(" and ");
  return `When ${when} — ${o.effects.map(effectPhrase).join(", ")}.`;
}

function effectPhrase(e: RuleEffect): string {
  const def = EFFECT_BY_ID[e.field];
  if (!def) return `${e.field} = ${e.value}`;
  if (def.kind === "bool") return `${def.label.toLowerCase()}: ${e.value ? "yes" : "no"}`;
  return `${def.label.toLowerCase()} → ${e.value}`;
}

/** The starter set. Three rules that are right for almost any arcology, so the feature is on and
 *  legible from week one instead of being a blank screen the player never opens. */
export function defaultOrders(): StandingOrder[] {
  return [
    {
      id: "o-health", name: "Pull the badly hurt out", enabled: true, priority: 10,
      conditions: [{ field: "health", op: "lt", value: -35 }],
      effects: [{ field: "release", value: true }, { field: "curatives", value: 1 }],
    },
    {
      id: "o-break", name: "Nobody breaks on my watch", enabled: true, priority: 20,
      conditions: [{ field: "state", op: "eq", value: "fracturing" }],
      effects: [{ field: "facility", value: "spa" }, { field: "flag_review", value: "coming apart — moved to the spa" }],
    },
    {
      // The counterpart to the two rules above. Without it they are a one-way door and the
      // household ends up parked in the spa, earning nothing, permanently.
      id: "o-return", name: "Back on the rota when she has mended", enabled: true, priority: 25,
      conditions: [
        { field: "state", op: "eq", value: "intact" },
        { field: "health", op: "gt", value: -10 },
        { field: "energy", op: "gt", value: 55 },
      ],
      effects: [{ field: "back_to_work", value: true }],
    },
    {
      id: "o-flight", name: "Watch the ones looking at the door", enabled: true, priority: 30,
      conditions: [{ field: "flight_risk", op: "gt", value: 40 }],
      effects: [{ field: "flag_review", value: "flight risk" }],
    },
  ];
}
