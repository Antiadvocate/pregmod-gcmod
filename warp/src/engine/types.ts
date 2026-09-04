/**
 * WARP — the world model.
 *
 * Warp is Free Cities' arcology, rebuilt on Weft's engine. The name is the other half of the
 * loom: the warp is the set of threads held under tension on the frame, and the weft is what gets
 * woven through them. The arcology, its economy, its doctrine and its facilities are the frame.
 * The people are what happens on it.
 *
 * ── WHAT CHANGED FROM THE THING THIS REPLACES ────────────────────────────────────────────────
 *
 * The old game stored `devotion` and `trust` as the primitives of a person: two integers in
 * [-100, 100] that every scene, every job, every event read and wrote directly. Everything a
 * character felt was a threshold on those two numbers, and everything that happened to them was a
 * number added to one of them. That is a cheap and very legible model, and it has one fatal
 * property: it cannot tell the difference between a woman who complies because she has decided
 * her life is here and a woman who complies because the alternative is the cellblock. Both read
 * `devotion: 60`. Feed them the same week and they behave identically.
 *
 * Here, devotion and trust are not stored. They are READ (see engine/obedience.ts) off a nervous
 * system — Weft's relaxation kernel — plus what the person remembers, what they are attached to,
 * what they fear, and what they have been given or had taken. The two women above have different
 * `bond` and `fear` accumulators, different memories, and different resting points, so removing
 * the pressure moves one and collapses the other. Same displayed number, different physics under
 * it, and the difference shows up in play within a fortnight.
 *
 * Every other pregmod system survives: the body in detail, the week cycle, the facilities and
 * their managers, the doctrines, the rules engine, the markets, gestation and genetics, the
 * arcology's economy and its neighbours. What does not survive is the passage tree they were
 * written in, and the two dials at the bottom.
 */

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * PART 1 — PEOPLE
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

export type Pronouns = "she/her" | "he/him" | "they/them";

/** Anatomy, held plainly. A body is not a score; the scores are read off it. */
export interface Body {
  height_cm: number;
  weight_kg: number;
  /** −100 (skeletal) … 0 (average) … +100 (immobile). Diet and drugs move it; it moves health. */
  weight: number;
  /** −100 … +100 lean muscle. Negative is atrophy. */
  muscle: number;
  /** 0–100 raw facial quality before anything else is applied. Symmetry, bone, youth. */
  face: number;
  /** How the face reads: what the surgery did to it, if anything. */
  face_shape: "masculine" | "androgynous" | "normal" | "cute" | "sensual" | "exotic";
  /** Milliliters per breast. 0 = flat. Implants are recorded separately so purists can tell. */
  boobs: number;
  boob_implant: number;
  nipples: "tiny" | "cute" | "puffy" | "inverted" | "partially inverted" | "huge" | "flat";
  areolae: 0 | 1 | 2 | 3 | 4;
  butt: number;          // 0–10 scale, the old game's, because it is a good scale
  butt_implant: number;
  hips: -2 | -1 | 0 | 1 | 2 | 3;
  waist: number;         // −100 (hourglass) … +100 (masculine)
  shoulders: -2 | -1 | 0 | 1 | 2;
  /** Genitals. Absence is `null`, never 0 — a surgically absent organ and a small one are not
   *  the same fact and the prose has to be able to say so. */
  vagina: number | null;   // 0 (virgin/tight) … 10 (ruined)
  vagina_lube: 0 | 1 | 2;
  clit: number;            // 0–5
  labia: 0 | 1 | 2 | 3;
  hymen: boolean;
  dick: number | null;     // 0–10
  balls: number | null;    // 0–10
  prostate: 0 | 1 | 2 | 3;
  anus: number;            // 0–4
  /** Lactation: 0 none, 1 induced, 2 natural. `milk_week` counts how long it has run. */
  lactation: 0 | 1 | 2;
  lactation_weeks: number;
  /** Belly volume in cc from all causes, derived each week (pregnancy, implant, fluid, food). */
  belly: number;
  belly_implant: number;
  belly_sag: number;
  /** Appearance surface — freely rewritten as clothes, grime and injuries change. */
  skin: string;
  hair_color: string;
  hair_length: number;   // cm
  hair_style: string;
  pubic_hair: "hairless" | "waxed" | "in a strip" | "neat" | "bushy" | "very bushy";
  eye_color: string;
  eyes: "normal" | "nearsighted" | "blind" | "prosthetic";
  ears: "normal" | "hard of hearing" | "deaf" | "prosthetic";
  voice: 0 | 1 | 2 | 3;  // 0 mute, 1 deep, 2 normal, 3 high
  teeth: "normal" | "crooked" | "gapped" | "fixed" | "removable" | "pointy" | "baleen";
  /** Everything permanent that was done TO this body, as sentences. The narrator reads these; no
   *  code branches on the strings, so a mod can add a procedure without touching an enum. */
  marks: { kind: "tattoo" | "scar" | "brand" | "piercing" | "implant" | "prosthetic"; where: string; what: string; week: number }[];
  /** Bedrock look, set once. Only permanent bodily events append; the engine never rewrites it. */
  appearance_facts: string;
  /** Current presentation: clothes, grime, visible state. Rewritten freely. */
  appearance_now: string;
  /** The exact words that drew this person's portrait, reused verbatim so a diffusion model
   *  returns the same face instead of a cousin. See lib/diffusion. */
  visual_signature?: string;
  portrait_url?: string;
  portrait_seed?: number;
}

/** The nervous system. Ported wholesale from Weft's kernel — see KERNEL.md §2.
 *  One scalar, `relaxation`, and the entourage that shapes how it moves. */
export interface Psyche {
  relaxation: number;        // −10 clenched … +10 open
  capacity: number;          // −6 … +6 resting point; relaxation drifts here
  capacity_born: number;     // what they arrived with; never written again
  recovery: number;          // 0.01 … 0.45 drift rate per tick
  braced_run: number;
  settled_run: number;
  consecutive_clenched: number;
  open_run: number;
  prev_relaxation: number;
  discharge_lift: number;
  state: "intact" | "fracturing" | "broken";
  break_mode?: "dissociative" | "fawning" | "mirror" | "fractured";
  mood: string;
  active_states: string[];       // emotions currently held ("dread of the cellblock")
  state_ages: Record<string, number>;
  /** Arousal is its own axis and always was — the old game called it `energy`. Kept, because a
   *  drugged body and a frightened body are different things and the kernel must not conflate
   *  them. 0–100. */
  arousal: number;
  /** Sexual appetite conditioning, 0–100: how much this body has been trained to want. */
  libido: number;
}

/** Who they are, in words. The narrator's whole picture of a person comes from this. */
export interface Persona {
  background: string;             // bedrock: who they fundamentally are, before you
  life_history: string;           // accreted: what has happened since, folded in over time
  core_traits: string[];          // things their hands do, written so a scene could show it
  values: string[];
  speech_pattern: string;
  voice?: {
    diction?: string;
    syntax?: string;
    rhythm?: string;
    tics?: string[];
    never_says?: string[];
    agenda?: string;
    example_lines?: string[];
  };
  attachment: {
    style: "secure" | "anxious" | "avoidant" | "disorganized";
    under_threat: string;
    soothed_by: string;
  };
  /** 0–1: how much other people's experience registers as MATTERING. Orthogonal to relaxation —
   *  calm is not care. A low-conscience slave is not broken, she is cold, and a low-conscience
   *  owner is the game's default assumption. */
  conscience: number;
  intelligence: "impaired" | "slow" | "average" | "sharp" | "brilliant";
  education: number;              // 0–100 formal schooling
  /** Standing interests that make a person between plot beats. Surfaced sparingly. */
  texture: string[];
  /** Who they can want at all — a hard gate, not a preference. */
  attracted_to: "women" | "men" | "anyone" | "no one";
  /** Conditioned desire: what their world trained them to find attractive. Drives first reads. */
  taste: string;
  /** The paraphilias and fetishes the old game modelled as a single enum, kept as a set with
   *  strengths, because people are not one thing. Strength runs the base game's scale: 10+ enjoys,
   *  60+ likes, 95+ loves, and past 100 it stops being a preference and becomes a paraphilia. */
  fetishes: { name: string; strength: number; known: boolean }[];
  /** A paraphilia she has actually crossed into — the fetish that stopped being optional. */
  paraphilia?: string;
  /** The good half of a specific taste, and the thing she will not do gladly. Both from the base
   *  game's lists, both discoverable rather than displayed. */
  quirk?: { id: string; known: boolean };
  flaw?: { id: string; known: boolean; worn: number };
  /** Which hole she would pick if it were up to her, and whether you have worked that out. */
  preferred_hole?: { hole: string; known: boolean };
  /** 0–1 sociability; drives rumour spread and who starts conversations in a facility. */
  gregariousness: number;
}

/** Trained capability. 0–100 each; the old game's three-tier bands are read off these. */
export interface Skills {
  oral: number;
  vaginal: number;
  anal: number;
  penetrative: number;
  whoring: number;
  entertainment: number;
  combat: number;
  /** Management skill per manager post — earned by holding the post, and the reason a Head Girl
   *  is not interchangeable with the next body you own. */
  management: Record<string, number>;
}

export interface Injury {
  what: string;
  severity: "minor" | "notable" | "grave";
  week: number;
  healed_week?: number;
}

/** Physical condition, drugs, and what medicine is doing about it. */
export interface Health {
  /** −100 (dying) … +100 (peak). The only number in here the player sees by default. */
  health: number;
  /** Short-term: the body's tank. Restored by rest, drained by every assignment. 0–100. */
  energy: number;
  /** Long-term wear that rest does not fix — the reason a decade in the arcade is not reversible. */
  attrition: number;
  illness: 0 | 1 | 2 | 3 | 4 | 5;
  /** Standing prescriptions. Each is a data-driven regimen (see data/drugs). */
  drugs: string[];
  curatives: 0 | 1 | 2;
  aphrodisiacs: 0 | 1 | 2 | 3;
  /** Chemical dependence, 0–100, earned by weeks on aphrodisiacs or worse. */
  addiction: number;
  injuries: Injury[];
  /** Weeks left of surgical recovery; blocks assignments while it runs. */
  recovery_weeks: number;
  diet: "healthy" | "restricted" | "fattening" | "muscle building" | "slimming" | "cleansing" | "XX" | "XY" | "XXY";
}

/** A fetus. Genetics are real here — the child is a function of two people, not a die roll. */
export interface Fetus {
  id: string;
  week: number;                 // gestational age
  father_id: string | null;     // null = unknown or bought sperm
  mother_id: string;
  genes: GeneRecord;
  sex: "XX" | "XY";
  viable: boolean;
  /** Set when the pregnancy is being carried in a tank instead of a person. */
  incubator?: boolean;
}

/** The heritable record. Deliberately small: enough that a child resembles its parents in the
 *  ways the fiction actually notices, and not a genome simulator. */
export interface GeneRecord {
  height_cm: number;
  face: number;
  boobs: number;
  butt: number;
  hips: number;
  waist: number;
  skin: string;
  hair_color: string;
  eye_color: string;
  intelligence: number;       // −3…+3 offset from the mean
  fertility: number;          // 0–100 potential
  /** Named conditions carried forward — the old game's gene pool, kept as strings so the data
   *  table owns the meaning. */
  conditions: string[];
}

export interface Womb {
  /** 0–100 how readily this body conceives. Age, health and drugs all move it. */
  fertility: number;
  /** Where in the cycle they are, in days. Ovulation is a fact, not a coin flip. */
  cycle_day: number;
  fertile_known: boolean;
  fetuses: Fetus[];
  /** Weeks pregnant, derived from the oldest fetus. Kept for cheap reads. */
  weeks: number;
  /** Contraception and control. */
  contraceptives: boolean;
  sterile: boolean;
  /** Births and losses, counted for the life-record and for the doctrines that care. */
  births: number;
  miscarriages: number;
  abortions: number;
  /** Who fathered how many. The lineage view reads this. */
  sired_by: Record<string, number>;
}

/** What this person is FOR, in the arcology's terms. */
export type Assignment =
  | "rest" | "please you" | "fucktoy" | "house servant" | "whore" | "public servant"
  | "classes" | "get treatment"
  // facility work
  | "work in the brothel" | "serve in the club" | "work in the dairy" | "work as a farmhand"
  | "be confined in the arcade" | "be confined in the cellblock" | "rest in the spa"
  | "get treatment in the clinic" | "learn in the schoolroom" | "work as a servant"
  | "be your Concubine" | "live with your Head Girl" | "be the Wardeness" | "be the Madam"
  | "be the DJ" | "be the Nurse" | "be the Schoolteacher" | "be the Attendant"
  | "be the Stewardess" | "be the Milkmaid" | "be the Farmer" | "be the Matron"
  | "be your Head Girl" | "be your agent" | "guard you" | "recruit girls" | "fight in the pit";

/** The bond ledger — the accumulators devotion and trust are read off. Nothing here is displayed
 *  raw; obedience.ts turns them into the two numbers a player recognises. See that file for why
 *  they are separate. */
export interface Bond {
  /** Earned attachment to the owner: kindness, safety, being chosen, being kept. Slow up, slow
   *  down. This is the half that survives the pressure being removed. */
  bond: number;        // −100 … +100
  /** Coerced compliance: what fear of consequence buys. Fast up, and it DECAYS FAST when the
   *  pressure stops, which is the entire point of holding it separately. */
  fear: number;        // 0 … 100
  /** What has been done that they have not forgiven. Feeds break risk and flight risk. */
  resentment: number;  // 0 … 100
  /** Belief that their situation can improve. The old game had nothing for this; it is what makes
   *  a promise worth making and a broken one worth something. */
  hope: number;        // 0 … 100
  /** Weeks since anything the person counts as good happened to them from the owner's hand. */
  weeks_since_kindness: number;
  /** Weeks since anything they count as cruelty. */
  weeks_since_cruelty: number;
  /** The reading, cached each tick so the UI and prompts do not recompute it forty times a frame. */
  read: { devotion: number; trust: number; label: string };
}

/** WHERE SHE STANDS WITH YOU — the ladder, and the thing at the top of it.
 *
 *  `dominion` is the axis nothing else in this genre models: −100 is you deciding everything,
 *  +100 is her deciding everything, and it moves by what you actually do when she asks for
 *  something. Past the top of it the game inverts and she is the one running the arcology.
 *  See engine/romance.ts. */
export interface Romance {
  standing: "property" | "favourite" | "kept" | "courted" | "betrothed" | "wife" | "keeper";
  since_week: number;
  /** −100 (you decide) … +100 (she decides). */
  dominion: number;
  /** Rites performed, by id — the theatrics, and the gate on the next rung. */
  rites: string[];
  /** What she has asked for that you granted, and what you refused. Both are remembered. */
  granted: number;
  refused: number;
  /** She is the only one you touch. Costs you every other body in the household. */
  exclusive?: boolean;
  /** Set at the wedding: what she is called now, and what you promised. */
  vow?: string;
}

export interface Person {
  id: string;
  name: string;
  surname?: string;
  slave_name?: string;      // the name you gave them, if you renamed them
  pronouns: Pronouns;
  age: number;
  birth_week: number;       // world week they were born, when known — otherwise derived from age
  physical_age: number;     // diverges from `age` under age-altering treatment
  origin: {
    nationality: string;
    race: string;
    career: string;         // what they did before
    background: string;     // how they ended up here, one line
    acquired_week: number;
    acquired_how: string;
  };
  body: Body;
  psyche: Psyche;
  persona: Persona;
  skills: Skills;
  health: Health;
  womb: Womb;
  bond: Bond;
  assignment: Assignment;
  facility?: string;            // facility id when assigned to one
  /** Standing orders exemptions — the rules engine skips a person flagged here. */
  rules_exempt: boolean;
  rules_applied: string[];      // ids of rules that touched them last week, for the report
  /** Legal status. `indenture` counts down; a freed person leaves the roster and enters the
   *  citizen registry, where they still exist and still remember you. */
  status: "owned" | "indentured" | "free" | "sold" | "dead";
  indenture_weeks?: number;
  exit_week?: number;
  exit_note?: string;
  clothes: string;
  collar: string;
  shoes: string;
  chastity: { vagina: boolean; anus: boolean; penis: boolean };
  /** Money. Per-person accounting is what makes the ledger legible. */
  economics: {
    price_paid: number;
    weeks_owned: number;
    income_last_week: number;
    income_lifetime: number;
    upkeep_last_week: number;
    upkeep_lifetime: number;
    customers_last_week: number;
  };
  /** Prestige and porn — reputation attaches to a person, not only to the arcology. */
  fame: { prestige: 0 | 1 | 2 | 3; why: string; porn_fame: number; porn_focus: string };
  /** Everything the week counted, so the report can say what actually happened to them. */
  counters: Record<string, number>;
  /** Everything that has been done to her, counted by act. The report, the fetish discovery and
   *  her own asks all read this — a woman who has been in the arcade four hundred times is not the
   *  same person as one who has been in it twice, and nothing else in the record says so. */
  acts?: Record<string, number>;
  /** Firsts, with the week. A first is a different event from the four hundredth and the engine
   *  should be able to tell you when it was. */
  firsts?: Record<string, number>;
  /** Where she stands with you, and who is deciding. See engine/romance.ts. */
  romance?: Romance;
  /** Set when the person is a background body — a Fuckdoll, a tank subject, or one of the many
   *  in a facility nobody is looking at. They still get a full nervous system (it is arithmetic
   *  and free); they do not get described in the prompt. See KERNEL.md on LOD. */
  central: boolean;
  /** Weft's paging flag: a cold character whose card is out of the cached prefix. */
  paged?: boolean;
}

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * PART 2 — MEMORY AND THE SOCIAL FABRIC
 * Lifted from Weft with the names kept, because the two engines have to agree on these or
 * nothing ports.
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

export type MemorySource = "lived" | "told" | "overheard" | "inferred" | "trained";

export interface EpisodicMemory {
  id: string;
  content: string;
  week: number;
  importance: number;         // 0–10
  charge: "warm" | "cold" | "sharp" | "dull" | "bright";
  decay: number;              // 0–1; below 0.25 the detail is gone and only gist remains
  source: MemorySource;
  where?: string;
  who?: string[];
  /** Set when this memory is one of the ones that made the person. Never decays. */
  core?: boolean;
}

export interface Belief { text: string; strength: number; week: number }
export interface DurableFact { text: string; week: number; from?: string }

export interface PersonMemory {
  episodic: EpisodicMemory[];
  beliefs: Belief[];
  facts: DurableFact[];
  /** Gist: what a decayed memory leaves behind. */
  gist: string[];
}

/** A directed relationship. Warmth is liking; attraction is wanting; they are not the same
 *  number and conflating them is why so many sims have everyone falling in love with whoever
 *  was nice to them. */
export interface Edge {
  from: string;
  to: string;
  warmth: number;      // −100 … +100
  trust: number;       // −100 … +100
  attraction: number;  // 0 … 100
  power: number;       // −100 (owned by) … +100 (owns)
  roles: string[];     // "sister", "rival", "lover", "mother", "her Head Girl"
  note?: string;
  weeks_known: number;
}

export interface Rumor {
  id: string;
  content: string;
  truth: "true" | "distorted" | "false";
  salience: number;
  charge: -1 | 0 | 1;
  knowers: string[];
  about?: string;
  week: number;
}

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * PART 3 — THE ARCOLOGY
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

/** Doctrine ids. The old game had thirty-three of these as loose globals with parallel arrays for
 *  research, decoration, law and SMR. Here a doctrine is one record in data/doctrines.ts and this
 *  is only its key. */
export type DoctrineId = string;

export interface DoctrineState {
  /** 0–100 adoption. Past 90 the doctrine is culturally established and starts paying. */
  adoption: number;
  /** Decoration level 0–5 — what the arcology LOOKS like under this doctrine. */
  decoration: number;
  /** Whether the doctrine's research has been bought. */
  research: boolean;
  /** Per-doctrine policy switches, keyed by the policy id in the doctrine's own record. */
  policies: Record<string, number>;
  adopted_week: number;
}

export interface Sector {
  id: string;
  kind: "residential" | "commercial" | "industrial" | "manufacturing" | "civic";
  /** Owned by the player, a citizen, or nobody. */
  owner: "you" | "citizen" | "vacant";
  /** 0–100 how well it is doing — feeds prosperity and rent. */
  condition: number;
}

export interface Facility {
  id: string;
  kind: string;                 // key into data/facilities.ts
  name: string;
  level: number;                // 0 = not built
  upgrades: Record<string, number>;
  capacity: number;
  manager?: string;             // person id
  workers: string[];            // person id list; authoritative, `Person.facility` mirrors it
  decoration: number;
  /** Per-facility switches (the old game's dozens of booleans, one bag). */
  settings: Record<string, number | boolean | string>;
}

export interface Neighbour {
  id: string;
  name: string;
  direction: string;
  prosperity: number;
  ownership: number;            // how much of it you hold
  attitude: number;             // −100 hostile … +100 aligned
  doctrines: DoctrineId[];
  /** What they are doing to you, and how far along it is. */
  scheme?: { kind: "embargo" | "influence" | "cyber" | "raid"; progress: number; target?: string };
}

export interface Loan {
  lender: "bank" | "shark";
  principal: number;
  apr: number;
  due_week: number;
  installments: number;
}

/** A project the arcology is running: construction, research, a doctrine push, a war. Replaces
 *  the old game's scattered `V.xxxUpgrade` integers with something the UI can render as a list of
 *  things in progress and the narrator can mention. */
export interface Project {
  id: string;
  title: string;
  kind: "construction" | "research" | "doctrine" | "security" | "trade";
  weeks_left: number;
  weekly_cost: number;
  on_complete: { effect: string; payload?: Record<string, unknown> };
}

export interface Arcology {
  name: string;
  /** Where in the world it sits — flavour, and the source of the local labour market. */
  region: string;
  week: number;
  /** −∞ … cash on hand. Going negative is survivable for a while; see economy.ts. */
  cash: number;
  /** Reputation, 0–20000 in the old game's scale, kept because its curves are tuned. */
  rep: number;
  prosperity: number;           // 0–200
  security: number;             // 0–100
  crime: number;                // 0–100
  /** Citizen population, which the doctrines and the economy both move. */
  population: number;
  /** How much of the arcology you own outright, 0–100. */
  ownership: number;
  sectors: Sector[];
  facilities: Record<string, Facility>;
  doctrines: Record<DoctrineId, DoctrineState>;
  /** Arcology-wide laws and policies keyed by id in data/policies.ts. */
  policies: Record<string, number>;
  neighbours: Neighbour[];
  loans: Loan[];
  projects: Project[];
  /** The mercenary company, if you have one. */
  mercenaries: { hired: boolean; strength: number; loyalty: number; upkeep: number };
  /** Food, which the farmyard and the population both touch. Running out is a real failure state. */
  food: { stores: number; production: number; consumption: number };
  /** The city's opinion of you as a crowd, distinct from any individual's. −10 … +10. */
  public_standing: number;
}

/* ────────────────────────────────────────────────────────────────────────────────────────────
 * PART 4 — THE WEEK, THE SCENE, AND THE SAVE
 * ──────────────────────────────────────────────────────────────────────────────────────────── */

export interface LedgerEntry {
  category: string;
  label: string;
  cash: number;
  rep: number;
  /** The person this line is about, when it is about a person. Makes the per-slave view free. */
  person?: string;
}

/** One line of the week report. `weight` orders them; `tone` colours them. */
export interface ReportLine {
  person?: string;
  facility?: string;
  text: string;
  tone: "good" | "bad" | "neutral" | "warning";
  weight: number;
}

export interface WeekReport {
  week: number;
  ledger: LedgerEntry[];
  lines: ReportLine[];
  cash_start: number;
  cash_end: number;
  rep_start: number;
  rep_end: number;
  /** Anything the week could not do and wants the player to know about. */
  problems: string[];
  /** Written by the narrator when a model is configured — a paragraph over the top of the
   *  numbers. Absent is fine; the numbers are the record. */
  prose?: string;
}

export type ActionMode = "do" | "say" | "think" | "story";

export interface TurnEntry {
  turn: number;
  week: number;
  action: string;
  mode: ActionMode;
  prose: string;
  summary: string;
  present: string[];
  location: string;
  time: string;
  /** What the bookkeeper actually recorded, kept so a thin turn is visible rather than silent. */
  bookkeeping: "ok" | "thin" | "failed" | "offline";
  tokens_in?: number;
  tokens_out?: number;
  cost?: number;
  /** The picture of this moment, when a local sampler painted one. Stored inline as a shrunk JPEG;
   *  see lib/diffusion.ts for why that matters to a long campaign. */
  image?: string;
}

export interface SceneState {
  location: string;
  time: string;                // "Week 12, Tuesday 14:30"
  present: string[];
  present_prev: string[];
  weather: string;
  /** People the engine walked into or out of the scene this turn — the narrator has to be told,
   *  or it writes around a hole where a person was. */
  arrivals_pending: string[];
  departures_pending: { name: string; to: string; why: string }[];
}

export interface ModelSettings {
  narrator_model: string;
  bookkeeper_model: string;
  forge_model: string;
  fallback_model: string;
  image_model: string;
  context_memories_k: number;
  history_window: number;
  lean_mode: boolean;
  token_budget: number;
  /** 0–10: how much the world throws at you unprompted. 0 = it only ever answers what you do. */
  tension: number;
  /** Repair the narrator's tics in place (see engine/reviser.ts). Off by default. */
  prose_reviser: boolean;
}

/** A standing order. The old game's Rules Assistant, rebuilt as data: a list of conditions and a
 *  list of effects, both from closed vocabularies, so the whole rule can be rendered as a
 *  sentence, dry-run before it fires, and explained afterwards in the report. */
export interface StandingOrder {
  id: string;
  name: string;
  enabled: boolean;
  /** Lower runs first; ties break on id. A person is touched by every matching rule in order. */
  priority: number;
  conditions: RuleCondition[];
  effects: RuleEffect[];
  /** Set by the last dry run: who this would touch right now. */
  preview?: string[];
}

export interface RuleCondition {
  field: string;      // key into RULE_FIELDS (engine/rules.ts)
  op: "lt" | "lte" | "gt" | "gte" | "eq" | "neq" | "in" | "nin" | "has" | "hasnot";
  value: string | number | string[];
}

export interface RuleEffect {
  field: string;      // key into RULE_EFFECTS
  value: string | number | boolean;
}

export interface Notification {
  id: string;
  week: number;
  text: string;
  kind: "info" | "warning" | "danger" | "good";
  person?: string;
  seen: boolean;
}

/** A pending event: chosen deterministically at week's end, played as a scene. */
export interface PendingEvent {
  id: string;
  kind: string;                 // key into data/events.ts
  person?: string;
  facility?: string;
  /** The situation, in one sentence, handed to the narrator as the seed of the scene. */
  seed: string;
  /** What the player can do about it without opening a scene — always at least one exit. */
  options: { id: string; label: string; note?: string }[];
  week: number;
  severity: "minor" | "notable" | "major";
}

export interface SaveState {
  id: string;
  name: string;
  schema: number;
  created_at: string;
  updated_at: string;
  models: ModelSettings;
  arcology: Arcology;
  people: Record<string, Person>;
  memory: Record<string, PersonMemory>;
  edges: Edge[];
  rumors: Rumor[];
  /** The player character. Owns a body and a psyche like anyone else — the engine simply never
   *  authors their interior (see KERNEL.md, "never the player"). */
  player: Player;
  scene: SceneState;
  turn: number;
  history: TurnEntry[];
  reports: WeekReport[];
  orders: StandingOrder[];
  events: PendingEvent[];
  /** What the household is asking you for this week. See engine/asks.ts. */
  asks?: import("./asks").Ask[];
  /** The Supplicationism plot chain — see engine/reversal.ts. */
  reversal?: import("./reversal").ReversalState;
  notifications: Notification[];
  /** Market state — who is for sale this week, and at what. Regenerated weekly. */
  market: MarketState;
  /** Standing retcons: the player's veto over anything the narrator invented. */
  retcons: { text: string; week: number; kind: "veto" | "correction" }[];
  /** World-scale facts, always in context. */
  canon: string[];
  /** Everything the integrity checks caught, counted rather than forgotten. */
  integrity: { fires: { week: number; kind: string; detail: string }[] };
  /** Rollback ring, newest last, max 8. */
  snapshots: { turn: number; week: number; blob: string }[];
  telemetry: { turn: number; ms: number; tokens_in: number; tokens_out: number; cost: number; ts: number }[];
  /** The last thing the tic detector, the maxim detector and friends caught, quoted back at the
   *  narrator next turn. Weft's single most effective correction channel. */
  corrections: { leak?: string; maxim?: string; echo?: string; reprint?: string };
}

export interface Player {
  name: string;
  pronouns: Pronouns;
  age: number;
  title: string;
  /** The player's own body, in the same shape as anyone's — the old game modelled this and it
   *  matters for scenes. */
  body: Partial<Body> & { appearance_facts: string };
  /** Career before the arcology; sets starting skills and how citizens read you. */
  career: string;
  skills: Record<string, number>;
  /** Reputation with your own household, as opposed to the city: what your slaves believe about
   *  how you treat people, aggregated. Derived, cached here. */
  household_read: { feared: number; trusted: number; label: string };
  /** The self-report the engine is not allowed to overrule: how tightly the player is holding
   *  themselves. Caps their relaxation, never lifts it. */
  tightness?: number;
  /** SET WHEN SOMEBODY ELSE IS RUNNING THIS. The person id of whoever holds the arcology and, on
   *  the registry, holds you. See engine/romance.ts — this is the far end of the ladder, and it is
   *  a playable state rather than a game over. */
  owned_by?: string;
  /** What you have left in the tank, 0–100. Spent on the interaction loop, back by the week: a
   *  body that has been at it all week is not a body that wants a fifth thing. */
  need?: number;
}

export interface MarketState {
  week: number;
  /** Slaves currently on offer, by market id. Generated fresh each week. */
  offers: Record<string, MarketOffer[]>;
  /** The recruiter's standing target, if a slave is assigned to recruiting. */
  recruiting?: string;
  /** Custom orders in flight: you paid for a body to spec and it is being found. */
  orders: { id: string; spec: Record<string, string | number>; weeks_left: number; price: number }[];
}

export interface MarketOffer {
  id: string;
  market: string;
  /** The person, already generated — buying is a transfer, not a roll. */
  person: Person;
  price: number;
  /** What the seller says, which is not always true. */
  pitch: string;
  /** Facts the seller is hiding, revealed by inspection or by owning them a while. */
  hidden: string[];
}

export const SCHEMA_VERSION = 1;

export const DEFAULT_MODELS: ModelSettings = {
  narrator_model: "deepseek/deepseek-chat",
  bookkeeper_model: "deepseek/deepseek-chat",
  forge_model: "deepseek/deepseek-chat",
  fallback_model: "openai/gpt-4o-mini",
  image_model: "",
  context_memories_k: 4,
  history_window: 6,
  lean_mode: false,
  token_budget: 0,
  tension: 5,
  prose_reviser: false,
};
