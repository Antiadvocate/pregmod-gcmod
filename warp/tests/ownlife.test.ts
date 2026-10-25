/**
 * HER OWN LIFE, WHERE SHE IS, AND WHAT GOES ON BETWEEN PEOPLE — a surgery that's done stops being
 * something coming; every woman has things she does with her time and wants in the long run; you
 * find her where her work puts her, doing something, or send for her; and each week something
 * happens between two of your women, or one of them and the people around her, that you can step
 * into.
 */
import { check } from "./harness.ts";

const store: Record<string, string> = {};
const g = globalThis as unknown as Record<string, unknown>;
const hadLS = "localStorage" in g, oldLS = g.localStorage, oldFetch = g.fetch, hadLoc = "location" in g, oldLoc = g.location;
g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
if (!hadLoc) g.location = { origin: "http://test" };
const { setApiKey } = await import("../src/config.ts");
const { newGame, sanitize } = await import("../src/engine/state.ts");
const { generatePerson } = await import("../src/engine/generate.ts");
const { newMemory, learn, remember } = await import("../src/engine/memory.ts");
const { refresh } = await import("../src/engine/obedience.ts");
const { operate } = await import("../src/engine/surgery.ts");
const { tickHealth, settleOldSurgery } = await import("../src/engine/health.ts");
const { personCard } = await import("../src/engine/prompts.ts");
const { seedOwnLife } = await import("../src/engine/ownlife.ts");
const { whereabouts, ing } = await import("../src/engine/whereabouts.ts");
const { arrivalLead } = await import("../src/engine/writer.ts");
const { openMoment, playMoment } = await import("../src/engine/moments.ts");
const { goingsCandidates, pickGoings, generateGoing } = await import("../src/engine/goings.ts");
const { resolveDynamic } = await import("../src/engine/dynamic.ts");
const { getEdge, moveEdge } = await import("../src/engine/social.ts");
const { tiedTo } = await import("../src/engine/others.ts");
const { GROW_V } = await import("../src/engine/growth.ts");
const { rng } = await import("../src/engine/rng.ts");
setApiKey("sk-test");

const bodies: { messages: { content: string }[] }[] = [];
let reply = "";
g.fetch = async (_u: string, init: { body: string }) => {
  bodies.push(JSON.parse(init.body));
  return new Response(JSON.stringify({ choices: [{ message: { content: reply } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), { status: 200 });
};

/* ── a surgery that's done is done ─────────────────────────────────────────────────────────── */
{
  const s = newGame({ seed: "done", starting_slaves: 2 });
  s.arcology.cash = 500000;
  s.arcology.facilities["clinic"] = { id: "clinic", kind: "clinic", name: "The Clinic", level: 2, upgrades: { surgery: 1 }, capacity: 4, workers: [], decoration: 0, settings: {} } as never;
  const p = generatePerson({ seed: "done-p", sex: "female" });
  p.age = 24; p.physical_age = 24; p.status = "owned"; p.body.vagina = 3; p.body.labia = 2;
  s.people[p.id] = p;
  const mem = (s.memory[p.id] = newMemory());
  refresh(p, mem);
  learn(mem, "The owner wants to pay for surgery to make her pussy tighter.", s.arcology.week);
  learn(mem, "The owner means to give her improvements within a week.", s.arcology.week);
  learn(mem, "Before coming here she taught girls dance.", s.arcology.week);
  remember(mem, { content: "The owner promised me surgery for my pussy", week: s.arcology.week, importance: 7, charge: "warm" });
  const out = operate(s, p, "tighten");
  check("the operation goes through", !!out.ok, out.why);
  check("what she was told would happen is gone from what she knows", !mem.facts.some((f) => /wants to pay for surgery|improvements within a week/.test(f.text)), mem.facts.map((f) => f.text));
  check("what she knows says it happened", mem.facts.some((f) => /had surgery: .*It's done\./.test(f.text)));
  check("and the rest of what she knows is kept", mem.facts.some((f) => /taught girls dance/.test(f.text)));
  check("the promise she remembers reads as kept", mem.episodic.some((m) => /promised me surgery.*done in week/.test(m.content)));
  check("her card has it as done and over", /SURGERY, DONE AND OVER[^\n]*still recovering/.test(personCard(s, p)), personCard(s, p).match(/SURGERY[^\n]*/)?.[0]);
  for (let i = 0; i < 4 && p.health.recovery_weeks > 0; i++) tickHealth(s, p, { health: 0, energy: 0 });
  check("out of recovery, she knows she's healed", mem.facts.some((f) => /healed from her surgery/.test(f.text)), mem.facts.map((f) => f.text));
  check("and her card says healed", /SURGERY, DONE AND OVER[^\n]*all healed/.test(personCard(s, p)));

  // A save from before: the operation on her body, the plan still in what she knows.
  const q = generatePerson({ seed: "done-q", sex: "female" });
  q.status = "owned"; q.age = 25;
  s.people[q.id] = q;
  const qm = (s.memory[q.id] = newMemory());
  q.body.marks.push({ kind: "implant", where: "genitals", what: "labiaplasty", week: 3 } as never);
  learn(qm, "The owner wants to pay for surgery to fix her labia.", 2);
  q.persona.core_traits = ["keeps a running count of the days since her surgery and reports the number", "fixes the lamp for the plants"];
  q.persona.voice = { ...(q.persona.voice ?? {}), agenda: "To be given something to do with her hands. She wants the surgery to be over." };
  settleOldSurgery(s, q);
  check("counting the days to a surgery that's over goes from who she is", q.persona.core_traits.length === 1 && q.persona.core_traits[0].includes("lamp") && !/surgery/.test(q.persona.voice?.agenda ?? ""), [q.persona.core_traits, q.persona.voice?.agenda]);
  check("an old save's stale plan is cleared on load", !qm.facts.some((f) => /wants to pay for surgery/.test(f.text)) && qm.facts.some((f) => /had surgery/.test(f.text)), qm.facts.map((f) => f.text));
  const before = qm.facts.length;
  settleOldSurgery(s, q);
  check("and only once", qm.facts.length === before);
}

/* ── her own life ──────────────────────────────────────────────────────────────────────────── */
{
  const p = generatePerson({ seed: "life-1", sex: "female" });
  check("a new woman has things she does with her time", (p.persona.interests ?? []).length >= 1, p.persona.interests);
  check("and something she wants in the long run", (p.persona.goals ?? []).length >= 1, p.persona.goals);
  const t = generatePerson({ seed: "life-2", sex: "female" });
  t.origin.career = "teacher"; t.persona.interests = undefined; t.persona.goals = undefined;
  let teacherish = false;
  for (let i = 0; i < 12 && !teacherish; i++) { t.persona.interests = undefined; t.persona.goals = undefined; seedOwnLife(t, rng(`t${i}`)); teacherish = (t.persona.interests ?? []).some((x) => /read|lesson/.test(x)) || (t.persona.goals ?? []).some((x) => /teach/.test(x)); }
  check("they come from her life before", teacherish, [t.persona.interests, t.persona.goals]);
  const s = newGame({ seed: "life", starting_slaves: 2 });
  const her = Object.values(s.people).find((x) => x.status === "owned")!;
  her.persona.interests = undefined; her.persona.goals = undefined;
  const back = sanitize(JSON.parse(JSON.stringify(s)));
  check("an old save's women get them on load", (back.people[her.id].persona.interests ?? []).length > 0 && (back.people[her.id].persona.goals ?? []).length > 0);
  her.persona.interests = ["keeps seedlings growing in a cup under the bathroom light"];
  her.persona.goals = ["to teach dance again"];
  const card = personCard(s, her);
  check("her card has her own time and what she wants", card.includes("HER OWN TIME") && card.includes("seedlings") && card.includes("IN THE LONG RUN") && card.includes("teach dance"));
  check("the re-reading is a new version, so everyone gets a life of her own", GROW_V >= 3);
}

/* ── where she is ──────────────────────────────────────────────────────────────────────────── */
{
  const s = newGame({ seed: "where", starting_slaves: 3 });
  const [a, b] = Object.values(s.people).filter((x) => x.status === "owned");
  a.assignment = "work in an office"; a.facility = undefined; a.persona.interests = [];
  const w = whereabouts(s, a);
  check("an office worker is found at the office", w.place === "office" && !w.withYou && w.privacy === "public", w);
  check("doing something there", !!w.doing && w.doing !== "at work", w.doing);
  const lead = arrivalLead(a, w, false, rng("x"));
  check("you find her there", lead.startsWith(`You find ${a.name.split(" ")[0]} in an office`), lead);
  check("or she comes when sent for", arrivalLead(a, w, true, rng("x")).includes("comes when she's sent for, from an office"));
  b.assignment = "please you"; b.facility = undefined; b.persona.interests = [];
  check("a woman whose place is with you is with you", whereabouts(s, b).withYou === true);
  a.health.recovery_weeks = 2;
  check("laid up after surgery, she's in bed", /recovering/.test(whereabouts(s, a).doing));
  a.health.recovery_weeks = 0;
  a.persona.interests = ["keeps seedlings growing in a cup"];
  let own = false;
  for (let t = 0; t < 40 && !own; t++) own = !!whereabouts(s, a, t).own;
  check("some of the time she's on her own time, doing her own thing", own);
  check("what she does reads as something she's in the middle of", ing("keeps seedlings growing in a cup") === "keeping seedlings growing in a cup" && ing("knows everyone's business") === null);

  reply = "She keeps typing for a second, then looks up.\n\nOPTIONS:\n- a\n- b\n- c\n- d";
  bodies.length = 0;
  s.models.narrator_model = "test/model";
  const id = openMoment(s, { person: a.id, title: "With her", source: "encounter", happened: "", where: { ...whereabouts(s, a, 99), place: "office", name: "an office on the commercial levels", look: "desks", privacy: "public", doing: "on the phone at her desk" } });
  await playMoment(s, id, "Busy?");
  const scene = bodies.find((x) => JSON.stringify(x).includes("You continue a scene"))!;
  check("the scene is told where it is and what she's doing", scene.messages[1].content.includes("## WHERE THIS IS") && scene.messages[1].content.includes("on the phone at her desk"));
  check("and that where you are matters", scene.messages[0].content.includes("WHERE YOU ARE MATTERS") && scene.messages[0].content.includes("SHE HAS A LIFE"));
}

/* ── what goes on between people ───────────────────────────────────────────────────────────── */
{
  const s = newGame({ seed: "goings", starting_slaves: 3 });
  s.models.narrator_model = "test/model";
  const [a, b] = Object.values(s.people).filter((x) => x.status === "owned" && x.age >= 18);
  moveEdge(s.edges, a.id, b.id, { warmth: -40 });
  moveEdge(s.edges, b.id, a.id, { warmth: -35 });
  const all = goingsCandidates(s);
  check("two women who can't stand each other are something going on", all.some((x) => x.kind === "between" && [x.main.id, x.other?.id].includes(a.id) && [x.main.id, x.other?.id].includes(b.id)));
  check("so is one of yours and the people where she works", all.some((x) => x.kind === "outside"));
  const picked = pickGoings(s);
  check("every week there's at least one", picked.length >= 1 && picked.length <= 2, picked.length);

  const pair = all.find((x) => x.kind === "between" && x.other)!;
  reply = JSON.stringify({
    title: "The blanket", situation: `${pair.main.name} has ${pair.other!.name}'s blanket on her bed again and won't give it back. Mara, who runs the laundry, is watching.`,
    options: [
      { label: "Make them share it", effect: "closer", on: "both" },
      { label: "Back the one it belongs to", effect: "side_with", on: "other" },
      { label: "Comfort the other", effect: "kindness", on: "other" },
      { label: "Leave them to it", effect: "nothing" },
    ],
    hook: "", cast: [{ name: "Mara Kell", pronoun: "she", what: "runs the laundry", to_her: "the laundry boss who watches her" }],
  });
  const e = await generateGoing(s, pair, "");
  check("the model writes it as an event between the two of them", !!e && e.person === pair.main.id && e.other === pair.other!.id && e.options.length === 4, e);
  check("each choice says which of them it lands on", !!e && e.options.some((o) => o.id.includes("@other")));
  check("the outsider it brought in goes on file, tied to her", tiedTo(s, pair.main.id).some((t) => t.face.name === "Mara Kell"));
  s.events.push(e!);
  const before = getEdge(s.edges, pair.main.id, pair.other!.id)?.warmth ?? 0;
  const line = resolveDynamic(s, e!, e!.options[0].id);
  check("bringing them closer moves both of them", (getEdge(s.edges, pair.main.id, pair.other!.id)?.warmth ?? 0) > before && /closer/.test(line), line);
  s.events.push(e!);
  const hers = JSON.stringify(pair.other!.bond), mains = JSON.stringify(pair.main.bond);
  const kind = resolveDynamic(s, e!, e!.options[2].id);
  check("a choice aimed at the other one lands on her, not the first", !!kind && JSON.stringify(pair.other!.bond) !== hers && JSON.stringify(pair.main.bond) === mains, kind);
  check("it can't come up again next week", !pickGoings(s).some((x) => x.key === pair.key));
}

g.fetch = oldFetch;
if (hadLS) g.localStorage = oldLS; else delete g.localStorage;
if (!hadLoc) delete g.location; else g.location = oldLoc;
