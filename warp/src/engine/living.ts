/**
 * THE WEEK, WRITTEN — every event, request, letter and outcome put into words by the model, from
 * what is actually true and what has already happened.
 *
 * The engine still decides everything that matters: which situations come up this week (the
 * pressure controller in engine/events), what each choice does, what a request would cost. What it
 * used to do as well was write them, once, by hand, so the same patrol caught the same citizen
 * under the same law every time and the same girl asked for "a warmer blanket, a book, an afternoon
 * off" whoever she was. Here, with a model configured, nothing the player reads is the canned text:
 *
 *   writeEvent      the situation rewritten around the real people, the real city, the ruler on
 *                   the other end and the chronicle of what came before; the choices relabelled to
 *                   fit, each still mapped to the engine's own choice; up to two more choices from
 *                   the closed effect table.
 *   narrateOutcome  what you chose, played out, with the engine's result as the facts.
 *   storyEvent      one event a week invented from scratch for whoever has the most going on,
 *                   continuing a thread left open if there is one.
 *   lawPulse        how the city is living with each of your laws, written fresh, following on from
 *                   what was said about that law last time.
 *   letters         your governors write home.
 *   writeEnding     the end of the run, from the whole record.
 *
 * Without a model, each of these returns nothing and the game's own text stands.
 */
import { purgeBanned } from "./bans";
import { hasPending, oneEach } from "./pending";
import { toWrite, writeNext } from "./saga";
import { dueToGrow, growPersona } from "./growth";
import { condenseMemory, dueToCondense } from "./condense";
import { pickOption, type Order } from "./ownwords";
import { regionOf, regionNews, knownWord, bring } from "./region";
import { powers } from "./power";
import { applyDiff, noteStock, stockLine, type Diff } from "./turn";
import type { PendingEvent, Person, SaveState, WeekReport } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { coarsen, REGISTER_TAIL } from "./register";
import { NOT_PAPERWORK, HOUSE_STYLE, BOOKKEEPER_SYSTEM, bookkeeperContext, personCard } from "./prompts";
import { PLAIN_RULES } from "./style";
import { chronicle, chronicleBrief, chronicleOf } from "./chronicle";
import { DYNAMIC_EFFECTS, effectList, dossier, npcEffect, resolveDynamic } from "./dynamic";
import { EVENT_BY_ID, ensureSlaveEvent, hasSlaveEvent, resolveEvent } from "./events";
import { ACT_BY_ID } from "../data/intimacy";
import { EXTRA_BY_ID } from "../data/rooms";
import { empireOf, powerById } from "./power";
import { powerBrief } from "./diplomacy";
import { LAW_BY_ID } from "../data/laws";
import { lawsBrief } from "./court";
import { cultureBrief } from "./culture";
import { worldBrief } from "./world";
import { activeGovernors, governorBrief, governorshipOf, GOV_ORDERS } from "./governor";
import { grantAsk, refuseAsk, voiceAsk } from "./asks";
import { bestWant, generateWant, pickWants } from "./wants";
import { generateGoing, pickGoings } from "./goings";
import { aroundBrief, weekSnapshot } from "./snapshot";
import { GOV_VOICE } from "./talk";
import { writeWeekProse, enrichPerson } from "./forge";
import { runOf } from "./run";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { read, refresh } from "./obedience";
import { romanceOf } from "./romance";
import { clamp } from "./psyche";
import { settledBrief, weightBrief } from "./fates";
import { ownedBrief, handOf } from "./share";
import { herDecides, readHer } from "./herwill";

const ready = (s: SaveState) => modelsAvailable() && !s.models.lean_mode;

/** The arcology in a few lines, for any prompt that isn't a whole scene. */
function cityBrief(s: SaveState): string {
  const a = s.arcology;
  const docs = Object.entries(a.doctrines).map(([id, d]) => `${DOCTRINE_BY_ID[id]?.noun ?? id} (${Math.round(d.adoption)}%)`);
  return [
    `THE ARCOLOGY: ${a.name}, in ${a.region}. Week ${a.week}. Population ${a.population.toLocaleString()}, prosperity ${Math.round(a.prosperity)}, crime ${Math.round(a.crime)}, security ${Math.round(a.security)}, reputation ${Math.round(a.rep)}, cash ¤${Math.round(a.cash).toLocaleString()}. The city's mood toward the owner is ${a.public_standing.toFixed(1)} on -10..10.`,
    docs.length ? `ITS BELIEFS: ${docs.join(", ")}.` : "",
    cultureBrief(s) ? `HOW PEOPLE BEHAVE: ${cultureBrief(s).replace(/\n/g, " ")}` : "",
    lawsBrief(s) ? `LAWS IN FORCE: ${lawsBrief(s).replace(/\n/g, " ")}` : "",
    `THE WORLD: ${worldBrief(s).replace(/\n/g, " ")}`,
    weightBrief(s),
    settledBrief(s, 8),
    ownedBrief(s),
  ].filter(Boolean).join("\n");
}

/** Everything one event is about: the people, the power, the law, the governor, and their history. */
function eventContext(s: SaveState, e: PendingEvent): { text: string; keys: string[] } {
  const keys: string[] = [];
  const out: string[] = [cityBrief(s)];
  const p = e.person ? s.people[e.person] : undefined;
  if (p) { out.push(`## SHE IS THE ONE IT'S ABOUT\n${personCard(s, p)}`); keys.push(p.id); }
  const o = e.other ? s.people[e.other] : undefined;
  if (o) { out.push(`## ALSO IN IT\n${dossier(s, o)}`); keys.push(o.id); }
  const about = empireOf(s).about[e.kind];
  const power = about ? powerById(s, about) : undefined;
  if (power) { out.push(`## THE OTHER POWER\n${powerBrief(s, power)}`); keys.push(`place:${power.id}`); }
  const law = e.facility?.startsWith("law:") ? LAW_BY_ID[e.facility.slice(4)] : undefined;
  if (law) { out.push(`## THE LAW IT'S ABOUT\nThe ${law.name}: "${law.text}"`); keys.push(`law:${law.id}`); }
  if (e.kind === "gov" && e.facility) {
    const g = governorshipOf(s, e.facility);
    if (g) { out.push(`## HER CITY\n${governorBrief(s, g)}`); keys.push(`gov:${g.place}`); }
  }
  if (!keys.length) keys.push("city");
  const hist = chronicleBrief(s, keys, 8);
  if (hist) out.push(hist);
  return { text: out.join("\n\n"), keys };
}

const WRITE_SYSTEM = `You write one event for Free Cities, an adult text game about owning an arcology where slavery is legal and ordinary. The game has already decided WHAT is happening (THE FACTS) and what each of the player's choices DOES. Your job is to write it so it's about these people, in this city, this week, which means who is there, what they say, what it looks like and why it's happening now. Build on WHAT HAS ALREADY HAPPENED. If the same person, power or law has come up before, this is the next chapter, and people remember.

Rules:
- Keep every fact, including names, numbers, amounts and who did what. Add detail, but don't change what happened.
- Write in the second person and the present tense, as long as LENGTH says and no longer. It doesn't have to be someone coming to see the player. Often the narrator just tells the player what happened and what it did to people, the way the original game's events do. If THE FACTS read like a status report, say what actually happened instead.
- Give a stranger one detail, rather than a description of their hair, coat and posture. Nobody gives a speech about themself.
- When it's about one of the owner's own people, follow this. ${NOT_PAPERWORK}
- Never invent a named person. You may name the people in the context, meaning the player's own people, a power's ruler and anyone on file. Anyone else stays unnamed, like an envoy, a letter or a trader.
- Don't end with someone asking the player what they'll do ("So. What do you tell him?"). End on the situation, because the choices are the question.
- Relabel every choice in the player's voice so it fits the scene you wrote, in 2 to 9 words. Each label must still be the same action with the same result as the original.
- You may add up to two extra choices from EXTRA EFFECTS when they genuinely fit the scene, but most of the time you should add none.

${HOUSE_STYLE}

Output ONE strict JSON object and nothing else:
{"title":"2-5 words","situation":"the scene","choices":[{"id":"the original choice id","label":"new label"}],"extra":[{"label":"...","note":"a few plain words for the player, like \"she won't forget it\" or \"costs you ¤2,000\", and never the effect's description","effect":"effect id","value":"optional"}]}`;

/** Rewrite one pending event. Mutates it in place; returns whether it was written. */
export async function writeEvent(s: SaveState, e: PendingEvent, snap = ""): Promise<boolean> {
  // What you did coming back weeks later is written like anything else that happens to you; the
  // reader that set it up only sketched it.
  if (!ready(s) || e.written || (e.kind === "dynamic" && !e.id.startsWith("echo-"))) return false;
  // Business and the outside world keep the game's own words. Asked to write them, the model
  // invents a messenger nobody has met (a security chief with rain on her coat, a man with
  // invoices) to stand in your office and deliver it. Only events about your own people get written.
  if (!e.person && !e.cause) return false;
  const def = EVENT_BY_ID[e.kind];
  const opts = def?.options ?? e.options;
  const ctx = eventContext(s, e);
  const res = await call({
    system: WRITE_SYSTEM,
    user: [
      snap,
      ctx.text,
      aroundBrief(s),
      `## THE FACTS\nThis is the game's own version. Rewrite it.\n${e.seed}`,
      // Business and the outside world get a few lines; the people in your house get room.
      `## LENGTH\n${e.person ? "One or two short paragraphs." : "Two to four sentences. It's a decision, not a story."}`,
      stockLine(s),
      `## THE CHOICES (id: what the player does → what it does)\n${opts.map((o) => `· ${o.id}: ${o.label}${o.note ? ` → ${o.note}` : ""}`).join("\n")}`,
      `## EXTRA EFFECTS (only for extra choices)\n${effectList()}${e.person ? `\nACT IDS: ${Object.keys(ACT_BY_ID).join(", ")}\nROOM ITEM IDS: ${Object.keys(EXTRA_BY_ID).join(", ")}` : ""}`,
      PLAIN_RULES,
      e.person ? REGISTER_TAIL : "",
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 1100,
    temperature: 0.9,
  });
  if (!res.ok) return false;
  const out = parseJson<{ title?: string; situation?: string; choices?: { id?: string; label?: string }[]; extra?: { label?: string; note?: string; effect?: string; value?: string | number }[] }>(coarsen(res.text));
  if (!out?.situation || String(out.situation).length < 40) return false;
  const live = s.events.find((x) => x.id === e.id) ?? e;
  live.seed = String(out.situation).slice(0, 2400);
  noteStock(s, live.seed);
  const relabel = new Map((out.choices ?? []).filter((c) => c?.id && c.label).map((c) => [String(c.id), String(c.label).slice(0, 80)]));
  live.options = opts.map((o) => ({ id: o.id, label: relabel.get(o.id) ?? o.label, note: o.note }));
  const extra = (out.extra ?? []).filter((x) => x?.label && x.effect && DYNAMIC_EFFECTS[String(x.effect)]).slice(0, 2)
    .map((x, i) => ({ id: `x${i}:${x.effect}:${x.value ?? ""}`, label: String(x.label).slice(0, 80), note: x.note ? String(x.note).slice(0, 90) : undefined }));
  live.extra = extra.length ? extra : undefined;
  live.written = { model: res.model, title: out.title ? String(out.title).slice(0, 60) : undefined };
  return true;
}

/** The choices to show for an event: written ones first, then the extras. */
export function choicesOf(e: PendingEvent): { id: string; label: string; note?: string }[] {
  const base = e.written || e.kind === "dynamic" ? e.options : EVENT_BY_ID[e.kind]?.options.map((o) => ({ id: o.id, label: o.label, note: o.note })) ?? e.options;
  return [...base, ...(e.extra ?? [])];
}

/** Resolve any event, any choice: the engine's own, a generated one, or an extra. */
export function resolveAny(s: SaveState, e: PendingEvent, optionId: string): string {
  if (e.kind === "gov") return resolveGovEvent(s, e, optionId);
  if (e.kind === "dynamic" && e.ask) {
    const [, effect] = optionId.split(":");
    if (effect === "grant" || effect === "refuse" || effect === "refuse_harsh") {
      const r = effect === "grant" ? grantAsk(s, e.ask) : refuseAsk(s, e.ask, effect === "refuse_harsh");
      s.events = s.events.filter((x) => x.id !== e.id);
      const p = e.person ? s.people[e.person] : undefined;
      const label = e.options.find((o) => o.id === optionId)?.label ?? "";
      if (p) chronicle(s, { keys: [p.id], title: e.written?.title, text: `${e.seed.split(/\n/)[0].slice(0, 200)} You chose: ${label}. ${r.what}`, hook: e.hook });
      return [r.what, r.said ? `"${r.said}"` : ""].filter(Boolean).join(" ");
    }
  }
  if (e.kind === "dynamic") return resolveDynamic(s, e, optionId);
  if (/^x\d+:/.test(optionId)) {
    const [, effect, value] = optionId.split(":");
    const def = DYNAMIC_EFFECTS[effect];
    if (!def) return "";
    const p = e.person ? s.people[e.person] : undefined;
    const line = p ? def.run(s, p, value || undefined) : npcEffect(s, effect, value, e.seed);
    s.events = s.events.filter((x) => x.id !== e.id);
    const label = (e.extra ?? []).find((o) => o.id === optionId)?.label ?? "";
    chronicle(s, { keys: [e.person ?? "city"], title: e.written?.title, text: `${e.seed.split(/\n/)[0].slice(0, 200)} You chose: ${label}. ${line}.` });
    s.notifications.push({ id: `n-${e.id}`, week: s.arcology.week, text: p ? `${p.name}: ${line}` : line, kind: "info", person: p?.id, seen: false });
    return line;
  }
  return resolveEvent(s, e, optionId);
}


/** You answered an event in your own words: which of its choices that amounts to. */
export function readOwnAnswer(s: SaveState, e: PendingEvent, typed: string, signal?: AbortSignal): Promise<{ id?: string; orders?: Order[]; error?: string }> {
  return readOwnChoice(s, e.seed, choicesOf(e), typed, signal);
}

/** Any situation with choices (an event, a story chapter): which choice your own words amount to.
 *  Always one of them (engine/ownwords); only stopping it gives none. */
export async function readOwnChoice(s: SaveState, situation: string, opts: { id: string; label: string; note?: string }[], typed: string, signal?: AbortSignal): Promise<{ id?: string; orders?: Order[]; error?: string }> {
  if (!opts.length) return { error: "there's nothing to answer here" };
  const r = await pickOption(s, situation, opts, typed, signal);
  return r.stopped ? { error: "stopped" } : { id: r.option.id, orders: r.orders };
}

const OUTCOME_SYSTEM = `You write what happens next in Free Cities, an adult text game about owning an arcology where slavery is legal. The player was shown a situation and made a choice. If the choice is in the player's own words, play out exactly what they said and did, in those words. The game has decided what came of it (WHAT CAME OF IT). Write it playing out, with the scene, what people say and do, and how they take it. Keep every fact and every number, and don't add consequences the game didn't decide. Write one to three short paragraphs in the second person and the present tense. Stop at a point where it could carry on, if the player wants to play it out further.

${HOUSE_STYLE}`;

/** The choice, played out. Returns the text, or "" to keep the game's own. */
export async function narrateOutcome(s: SaveState, o: { person?: string; others?: string[]; setup: string; chose: string; happened: string; title?: string }): Promise<string> {
  if (!ready(s) || !o.happened) return "";
  const keys = [o.person ?? "", ...(o.others ?? [])].filter(Boolean);
  const p = o.person ? s.people[o.person] : undefined;
  const res = await call({
    system: OUTCOME_SYSTEM,
    user: [
      p ? personCard(s, p, o.chose) : cityBrief(s),
      ...(o.others ?? []).map((id) => s.people[id]).filter(Boolean).map((x) => `ALSO THERE: ${dossier(s, x as Person)}`),
      keys.length ? chronicleBrief(s, keys, 6) : "",
      `THE SITUATION: ${o.setup}`,
      `THE PLAYER CHOSE: ${o.chose}`,
      `WHAT CAME OF IT (facts): ${o.happened}`,
      stockLine(s),
      PLAIN_RULES,
      p ? REGISTER_TAIL : "",
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    maxTokens: 900,
  });
  if (!res.ok) return "";
  const text = coarsen(res.text).trim();
  noteStock(s, text);
  return text;
}

/**
 * YOUR OWN WORDS ARE WHAT HAPPENED. Answering an event in your own words used to be read as the
 * nearest listed choice, and that choice's canned effects and line were applied whatever you did:
 * put her on her knees and you got "Punish her in private", a coercion, −23 trust, and "you make her
 * understand" under a scene where she loved it. Now, for an event about your own people, what you
 * typed is played out as written, and what it changed is read from that prose by the bookkeeper,
 * the same as a scene. The event is answered, and the chronicle has what you did.
 * Returns the prose, or "" when no model wrote it (the caller falls back to the nearest choice).
 */
export async function playOwnAnswer(s: SaveState, e: PendingEvent, typed: string): Promise<string> {
  if (!ready(s) || !e.person) return "";
  const prose = await narrateOutcome(s, {
    person: e.person, others: e.other ? [e.other] : undefined, setup: e.seed, chose: typed, title: e.written?.title,
    happened: `The player answered in their own words, and that is exactly what happens, as they wrote it: ${typed}`,
  });
  if (!prose) return "";
  const people = [e.person, e.other].filter((x): x is string => !!x && !!s.people[x]);
  const book = await call({
    system: BOOKKEEPER_SYSTEM,
    user: `${bookkeeperContext(s)}\n\n## THE TURN\nWHAT THE OWNER DID OR SAID. Here "I" is the owner: ${typed}\n\nTHE PROSE. Here "you" is the owner:\n${prose}`,
    model: s.models.bookkeeper_model, fallback: s.models.fallback_model, json: true,
  });
  const diff = book.ok ? parseJson<Diff>(book.text) : null;
  if (diff) {
    const before = s.scene.present;
    s.scene.present = people;
    applyDiff(s, { ...diff, present_add: [], present_remove: [], location: undefined }, prose, typed);
    s.scene.present = before;
    for (const id of people) refresh(s.people[id], s.memory[id]);
  }
  s.events = s.events.filter((x) => x.id !== e.id);
  chronicle(s, { keys: people.length ? people : ["city"], title: e.written?.title, text: `${e.seed.split(/\n/)[0].slice(0, 200)} You answered in your own words: ${typed.slice(0, 200)}` });
  return prose;
}

const PULSE_SYSTEM = `You write the lines of an arcology's weekly report about how its citizens are living with its laws, for Free Cities, an adult game about owning an arcology. For each law you get its text, a number for how well it's kept (above 30 means kept willingly, 0 to 30 means kept grudgingly, and below 0 means broken or resisted), the game's own line, and what was said about it in earlier weeks. Only write about a law if something specific happened this fortnight because of it, with a person, a place and what they did, and ideally tied to something in THIS WEEK. Leave out any law where you'd only be saying it's being kept or broken, because fewer, better lines are what's wanted. Make it follow on from the earlier weeks, so the same people can come back, a quarrel can get worse, or a habit can spread. Never repeat an earlier line, and keep any number that's in the game's line.

${HOUSE_STYLE}

Output JSON only: {"lines":[{"law":"law id","text":"..."}]}`;

/** Rewrite this week's law lines in the report. */
export async function writeLawPulse(s: SaveState, report: WeekReport, snap = ""): Promise<void> {
  if (!ready(s)) return;
  const tagged = report.lines.filter((l) => l.facility?.startsWith("law:"));
  if (!tagged.length) return;
  const items = tagged.map((l) => {
    const id = l.facility!.slice(4);
    const law = LAW_BY_ID[id];
    return `· ${id}: the ${law?.name ?? id}: "${law?.text ?? ""}"\n  game's line: ${l.text}\n${chronicleBrief(s, [`law:${id}`], 4).replace(/^/gm, "  ")}`;
  });
  const res = await call({
    system: PULSE_SYSTEM,
    user: [snap || cityBrief(s), `THE LAWS:\n${items.join("\n")}`, PLAIN_RULES].join("\n\n"),
    model: s.models.narrator_model, fallback: s.models.fallback_model, json: true, maxTokens: 900,
  });
  if (!res.ok) return;
  const out = parseJson<{ lines?: { law?: string; text?: string }[] }>(coarsen(res.text));
  if (!out) return;
  // A law nothing worth telling happened under this fortnight gets no line at all.
  const written = new Set((out.lines ?? []).filter((x) => x?.text).map((x) => `law:${x.law}`));
  report.lines = report.lines.filter((l) => !l.facility?.startsWith("law:") || written.has(l.facility));
  for (const x of out?.lines ?? []) {
    const line = tagged.find((l) => l.facility === `law:${x.law}`);
    if (!line || !x.text) continue;
    line.text = String(x.text).slice(0, 500);
    chronicle(s, { keys: [`law:${x.law}`], text: line.text });
  }
}

const LETTER_SYSTEM = `You write a letter, or a recorded message, from one of the player's slaves to the player, for Free Cities, an adult game about owning an arcology where slavery is legal. The player put her in charge of another city and she runs it for them, completely loyal, entirely as herself. She writes because something happened, which you'll find under WHAT'S GOING WRONG and RECENTLY THERE, or in THIS WEEK. Write about THAT, as it happened to her, with the people involved named, what they said and did, what she did, and how she feels about it. Then say what she wants from the player, if anything. Write it in the first person, to the player as she addresses them, in her own voice from her card. Keep it short, at one to three paragraphs.

${GOV_VOICE}

${HOUSE_STYLE}

Output JSON only: {"letter":"the letter","decide":{"question":"what she wants decided, or empty","choices":[{"label":"what the player tells her or sends, 2-8 words","order":"an order id","value":"if it takes one"}]}}
If she needs something, ask in decide with two or three choices from ORDERS. The support_ orders are help the player sends, and the others are things she does. Otherwise leave decide.question empty.`;

/** Every other week, each governor writes. A letter that asks for a decision becomes an event. */
export async function writeLetters(s: SaveState): Promise<number> {
  if (!ready(s)) return 0;
  let n = 0;
  for (const g of activeGovernors(s)) {
    const p = s.people[g.person];
    if (!p) continue;
    // Once someone holds your collar, the governors report to her, not you, unless she lets you
    // keep a hand in; and the one who holds it is in the room with you, not writing from an island.
    if (p.id === s.player.owned_by || handOf(s) === "locked") continue;
    // She writes when something happened, or when she hasn't for a long time. Never to say all is well.
    const last = g.letters.at(-1)?.week ?? g.since - 1;
    const fresh = (g.news ?? []).filter((n) => n.week > last).length;
    if (!fresh && s.arcology.week - last < 5) continue;
    const res = await call({
      system: LETTER_SYSTEM,
      user: [personCard(s, p), governorBrief(s, g), chronicleBrief(s, [`gov:${g.place}`, p.id], 8), weekSnapshot(s),
        `ORDERS:\n${Object.entries(GOV_ORDERS).map(([id, o]) => `· ${id}: ${o.note}`).join("\n")}`, PLAIN_RULES, REGISTER_TAIL].join("\n\n"),
      model: s.models.narrator_model, fallback: s.models.fallback_model, json: true, maxTokens: 900, temperature: 0.95,
    });
    if (!res.ok) continue;
    const out = parseJson<{ letter?: string; decide?: { question?: string; choices?: { label?: string; order?: string; value?: string | number }[] } }>(coarsen(res.text));
    if (!out?.letter) continue;
    const text = String(out.letter).slice(0, 2400);
    g.letters.push({ week: s.arcology.week, text });
    if (g.letters.length > 20) g.letters.shift();
    chronicle(s, { keys: [`gov:${g.place}`, p.id], title: "a letter", text: `${p.name} wrote from ${g.name}: ${text.slice(0, 240)}` });
    const choices = (out.decide?.choices ?? []).filter((c) => c?.label && c.order && GOV_ORDERS[String(c.order)]).slice(0, 3);
    if (out.decide?.question && choices.length >= 2 && !s.events.some((e) => e.kind === "gov" && e.facility === g.place)) {
      s.events.push({
        id: `gov-${g.place}-${s.arcology.week}`, kind: "gov", person: p.id, facility: g.place,
        seed: `${p.name} writes from ${g.name}:\n\n${text}\n\n${String(out.decide.question).slice(0, 300)}`,
        options: [...choices.map((c, i) => ({ id: `g${i}:${c.order}:${c.value ?? ""}`, label: String(c.label).slice(0, 80), note: GOV_ORDERS[String(c.order)].note.split(";")[0] })), { id: "g9:none:", label: "Leave it to her" }],
        week: s.arcology.week, severity: "notable", written: { model: res.model, title: `From ${g.name}` },
      });
    }
    n++;
  }
  return n;
}

function resolveGovEvent(s: SaveState, e: PendingEvent, optionId: string): string {
  const g = e.facility ? governorshipOf(s, e.facility) : undefined;
  const p = g ? s.people[g.person] : undefined;
  s.events = s.events.filter((x) => x.id !== e.id);
  if (!g || !p) return "There's nobody there to tell any more.";
  const [, order, value] = optionId.split(":");
  const label = e.options.find((o) => o.id === optionId)?.label ?? "";
  const line = GOV_ORDERS[order] ? GOV_ORDERS[order].run(s, g, p, value || undefined) : `${p.name} handles it her own way.`;
  chronicle(s, { keys: [`gov:${g.place}`, p.id], text: `${p.name} asked you to decide something in ${g.name}. You told her: ${label}. ${line}` });
  return line || `${p.name} does as you say.`;
}

/** Everything that needs writing after a week ends. One call at a time; each failure is skipped.
 *  Fewer things, each of them earned: the world events the week threw up, the one or two women
 *  with real reasons to want something, letters only from cities where something happened. */
/** Who has no voice yet, the one who holds your collar first, then the ones you've been with lately. */
function voiceless(s: SaveState): Person[] {
  const seen = new Map<string, number>();
  for (const m of s.moments ?? []) for (const id of [m.person, ...(m.others ?? [])]) if (id) seen.set(id, Math.max(seen.get(id) ?? 0, m.updated));
  return Object.values(s.people)
    .filter((p) => p.age >= 18 && !p.persona.voice?.example_lines?.length && (p.status === "owned" || p.status === "indentured" || s.player.owned_by === p.id || !!p.romance && p.status === "free"))
    .sort((a, b) => Number(s.player.owned_by === b.id) - Number(s.player.owned_by === a.id) || (seen.get(b.id) ?? -1) - (seen.get(a.id) ?? -1) || b.economics.weeks_owned - a.economics.weeks_owned);
}

const DESK_SYSTEM = `You are the world desk for Free Cities, an adult game about owning an arcology where slavery is legal. The other powers in the region live their own lives. Below are the real reasons any of them has to approach the player this week, each with its cause and the history between them. Decide whether any of it is worth the player's attention this week, and if so, write that one.

How to decide: most weeks one thing is worth it, and some weeks nothing is, in which case -1 is the right answer. Prefer what grows out of what has already happened between them, or out of something the player did.

How to write it:
- It grows out of the cause and WHAT HAS ALREADY HAPPENED with that power. If they've dealt with each other before, this is the next thing, and they remember.
- How well they know the player decides how they come. One that barely knows the player comes carefully, with a letter, a junior envoy or a feeler through a trader, and it's polite and unsure. One that knows the player well comes as itself.
- The player's weight, meaning their army, money and name, is real to them in proportion to how much they know of it.
- The only people you may name are the power's ruler, given below, and the player's own people. Anyone else stays unnamed.
- Use two to four sentences, with the narrator telling the player what's happening. Don't bring in a visitor fresh from the weather or a prop, and don't have anybody ask the player what they'll do, because the choices are the question.
- Relabel the choices so they fit what you wrote, keeping the same ids and the same actions.

${HOUSE_STYLE}

Output ONE strict JSON object and nothing else:
{"pick": the number of the one you chose, or -1, "title":"2-5 words","situation":"what's happening","choices":[{"id":"the original choice id","label":"new label"}]}`;

/** The region's week, read by the model: whether anything is worth your attention, and how it comes. */
async function worldDesk(s: SaveState, snap: string): Promise<void> {
  const m = regionOf(s);
  const all = powers(s);
  const pace = (s.business_events ?? "off") === "off" ? "none" : s.world_pace ?? "some";
  if (pace === "none" || s.arcology.week - (m.last ?? -99) < (pace === "full" ? 1 : 2)) return;
  const options = m.openings.filter((o) => o.kind !== "courting" && EVENT_BY_ID[o.kind] && !s.events.some((e) => e.kind === o.kind)).slice(0, 4);
  if (!options.length) return;
  const blocks = options.map((o, i) => {
    const p = all.find((x) => x.id === o.power)!;
    const def = EVENT_BY_ID[o.kind];
    return [`## ${i}: ${p.name} — ${o.kind.replace(/_/g, " ")}`, `WHY NOW: ${o.why}`, `HOW WELL THEY KNOW THE PLAYER: ${knownWord(p.rec.known)}.`, powerBrief(s, p), chronicleBrief(s, [`place:${p.id}`], 6),
      `CHOICES (id: what it does): ${def.options.map((x) => `${x.id}: ${x.label}${x.note ? ` (${x.note})` : ""}`).join(" | ")}`].filter(Boolean).join("\n");
  });
  const res = await call({
    system: DESK_SYSTEM,
    user: [snap, weightBrief(s), regionNews(s), ...blocks, stockLine(s), PLAIN_RULES].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model, fallback: s.models.fallback_model, json: true, maxTokens: 900, temperature: 0.8,
  });
  const out = res.ok ? parseJson<{ pick?: number; title?: string; situation?: string; choices?: { id?: string; label?: string }[] }>(coarsen(res.text)) : null;
  // No model answer: the strongest reason comes as the game's own words.
  const i = out ? Number(out.pick) : 0;
  if (!(i >= 0 && i < options.length)) return;
  const o = options[i];
  const p = all.find((x) => x.id === o.power)!;
  bring(s, p, o);
  const e = s.events.find((x) => x.kind === o.kind && x.week === s.arcology.week);
  if (!e || !out?.situation || String(out.situation).length < 30) return;
  e.seed = String(out.situation).slice(0, 1600);
  noteStock(s, e.seed);
  const relabel = new Map((out.choices ?? []).filter((c) => c?.id && c.label).map((c) => [String(c.id), String(c.label).slice(0, 80)]));
  e.options = e.options.map((x) => ({ ...x, label: relabel.get(x.id) ?? x.label }));
  e.written = { model: res.model, title: out.title ? String(out.title).slice(0, 60) : undefined };
}

export async function liveWeek(s: SaveState, report: WeekReport | null, step: (what: string) => void = () => {}): Promise<void> {
  if (!ready(s)) return;
  const snap = weekSnapshot(s, report);
  if (report) { step("the week"); await writeWeekProse(s, report); }
  step("the region");
  await worldDesk(s, snap);
  // Nobody in a scene should sound like everybody else. Two a week get a voice of their own, the
  // ones you see most first.
  for (const p of voiceless(s).slice(0, 2)) { step(`${p.name}'s voice`); await enrichPerson(s, p, p.economics.weeks_owned > 2); }
  // And nobody stays who she was the week she arrived: up to two women a week who have lived
  // through something big since they were last read, or were read by an older version of the
  // reading, are written again as who they've become (engine/growth).
  for (const p of dueToGrow(s).slice(0, 2)) { step(`who ${p.name} has become`); await growPersona(s, p); }
  // A memory bank that has got big is boiled down to what mattered, one quick call each, up to three
  // women a week, biggest first (engine/condense).
  if (s.models.auto_condense !== false) for (const p of dueToCondense(s).slice(0, 3)) { step(`${p.name}'s memories`); await condenseMemory(s, p); }
  // A long story you've begun writes its next chapter in the background, one a week, and it waits on
  // the Penthouse like any event. A new one is only ever offered: it's a big thing to take on, so it
  // waits on the Story screen until you begin it yourself.
  const saga = toWrite(s);
  if (saga) {
    step(saga.title || "a new story");
    await writeNext(s, saga.id, async (system, user) => {
      const r = await call({ system, user, model: s.models.narrator_model, fallback: s.models.fallback_model, json: true, maxTokens: 4000, temperature: 0.85 });
      return { ok: r.ok, text: r.text, error: r.error };
    });
  }
  // Once she holds your collar, she decides her own week before anything is written about it.
  if (s.player.owned_by && s.reign && !s.reign.ended) {
    step(s.people[s.player.owned_by]?.name ?? "her");
    // Who she is with you is read from everything between you, first, and every couple of months.
    const keeper = s.people[s.player.owned_by];
    if (s.reign.read_week === undefined || s.arcology.week - s.reign.read_week >= 8 || !keeper?.ways?.length) await readHer(s);
    await herDecides(s);
  }
  const fresh = s.events.filter((e) => s.arcology.week - e.week <= 1 && !e.written && (e.kind !== "dynamic" || e.id.startsWith("echo-")) && e.kind !== "gov");
  for (const e of fresh) { step(e.person ? `${s.people[e.person]?.name ?? "her"}` : "what happened"); await writeEvent(s, e, snap); }
  // One event waiting per person (engine/pending): nobody gets a second before the first is answered.
  oneEach(s);
  for (const w of pickWants(s)) {
    if (hasPending(s, w.p.id)) continue;
    step(w.p.name);
    const e = await generateWant(s, w.p, w.reasons, snap);
    if (e) s.events.push(e);
  }
  // And what's going on between people this week, that you can walk into (engine/goings).
  for (const g of pickGoings(s)) {
    if (hasPending(s, g.main.id) || (g.other && hasPending(s, g.other.id))) continue;
    step(g.other ? `${g.main.name} and ${g.other.name}` : g.main.name);
    const e = await generateGoing(s, g, snap);
    if (e) s.events.push(e);
  }
  // Anything written this week that touches a storyline the player ended goes before they see it.
  purgeBanned(s);
  oneEach(s);
  // And at least one thing from the household, every week: what the one with the most reason wants,
  // however small; failing that, one of the game's own about her, written up like any other.
  if (!hasSlaveEvent(s)) {
    const w = bestWant(s);
    if (w) { step(w.p.name); const e = await generateWant(s, w.p, w.reasons, snap); if (e) { s.events.push(e); purgeBanned(s); } }
    if (!hasSlaveEvent(s)) { const e = ensureSlaveEvent(s); if (e) { step(s.people[e.person!]?.name ?? "her"); await writeEvent(s, e, snap); } }
  }
  // Any request still waiting (a model failed, or it came from her page) is written as a moment too.
  for (const a of s.asks ?? []) { step(`${s.people[a.person]?.name ?? "her"}'s request`); a.text = await voiceAsk(s, a); }
  if (report) { step("the laws"); await writeLawPulse(s, report, snap); }
  if (activeGovernors(s).length && (s.business_events ?? "off") !== "off") { step("letters"); await writeLetters(s); }
}

/* ── the end ─────────────────────────────────────────────────────────────────────────────────── */

const END_SYSTEM = `You write the ending of a run of Free Cities, an adult game about owning an arcology where slavery is legal. The run is over. You get the record, which is how it ended, the game's own summary lines, the people and what became of them, the cities that were taken and who governs them, and the chronicle of what happened week by week. Write the ending the way the last chapter of a story is written, about THIS run and nobody else's. Say what the owner built or wrecked, which women mattered and what they are to the owner now, what was done that can't be undone, and where it all stands on the last day. Name names and use the real events. Write it in the second person, in five to nine short paragraphs, and then stop. Don't give a moral or a lesson, and don't sum up what it all meant.

${HOUSE_STYLE}

Output JSON only: {"title":"a title for this ending, 2-7 words","text":"the ending"}`;

export async function writeEnding(s: SaveState): Promise<boolean> {
  const end = s.run?.ended;
  if (!end || end.prose || !modelsAvailable()) return false;
  const people = Object.values(s.people).filter((p) => p.age >= 18 && (p.status === "owned" || p.status === "indentured" || p.romance?.standing === "wife" || p.romance?.standing === "keeper" || p.economics.weeks_owned > 10))
    .sort((a, b) => (romanceRank(b) - romanceRank(a)) || (b.economics.weeks_owned - a.economics.weeks_owned)).slice(0, 8);
  const cards = people.map((p) => {
    const r = read(p, s.memory[p.id]);
    return `· ${p.name}, ${p.age}, ${p.origin.nationality}, was a ${p.origin.career}. Her status is ${p.status}${p.exit_note ? ` (${p.exit_note})` : ""}, and she stands as ${romanceOf(p).standing} to the owner. Her devotion is ${r.devotion} and her trust ${r.trust}, and ${Math.round(r.fragility * 100)}% of it is fear. ${p.governs ? `She governs ${governorshipOf(s, p.governs)?.name}. ` : ""}Her job is ${p.assignment}. ${p.persona.core_traits.slice(0, 2).map((t) => t.replace(/[.;]\s*$/, "")).join(", and ")}.`;
  });
  const gov = activeGovernors(s).map((g) => `· ${g.name}, governed by ${s.people[g.person]?.name}: ${g.doctrines.map((d) => DOCTRINE_BY_ID[d]?.noun ?? d).join(", ")}, prosperity ${Math.round(g.prosperity)}.`);
  const events = chronicleOf(s).filter((e, i, xs) => e.week >= 0 && (i >= xs.length - 40 || /war|governor|deal|married|freed|died|sold/i.test(e.text))).slice(-60);
  const res = await call({
    system: END_SYSTEM,
    user: [
      `HOW IT ENDED: ${end.kind === "lost" ? "it was lost" : "the run ran its course"}, in week ${end.week}. The game called it "${end.title}".`,
      `THE GAME'S SUMMARY:\n${end.lines.map((l) => `· ${l}`).join("\n")}`,
      cityBrief(s),
      cards.length ? `THE PEOPLE:\n${cards.join("\n")}` : "",
      gov.length ? `CITIES YOUR WOMEN RUN:\n${gov.join("\n")}` : "",
      events.length ? `THE CHRONICLE:\n${events.map((e) => `· week ${e.week}: ${e.text}`).join("\n")}` : "",
      PLAIN_RULES,
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model, fallback: s.models.fallback_model, json: true, maxTokens: 2600, temperature: 0.85,
  });
  if (!res.ok) return false;
  const out = parseJson<{ title?: string; text?: string }>(coarsen(res.text));
  if (!out?.text) return false;
  const live = runOf(s).ended;
  if (!live) return false;
  live.prose = { model: res.model, title: out.title ? String(out.title).slice(0, 80) : undefined, text: String(out.text).slice(0, 9000) };
  return true;
}

function romanceRank(p: Person): number {
  return ["property", "favourite", "kept", "courted", "betrothed", "wife", "keeper"].indexOf(p.romance?.standing ?? "property") + clamp((p.economics.weeks_owned ?? 0) / 100, 0, 0.9);
}
