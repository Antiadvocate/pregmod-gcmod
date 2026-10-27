/**
 * THE OWNER'S LIFE: skills that do something in the room, a custom skill the narrator is told
 * about, what the city says about a small cock, a household of one or two and what it does to
 * the women in it, a marriage on the owner's own terms, and the wider list of kinks. Each of
 * these was asked for because the game treated the owner as a wallet with a body attached.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { generatePerson } from "../src/engine/generate.ts";
import { newMemory } from "../src/engine/memory.ts";
import { read, refresh } from "../src/engine/obedience.ts";
import { resolveAct, affinity } from "../src/engine/intimacy.ts";
import { talk } from "../src/engine/encounter.ts";
import { addCustomSkill, practiseFrom, skillsBrief, settleSkills } from "../src/engine/player.ts";
import { endowment, enlarge, sizeLine, tickEndowment, talkOfIt } from "../src/engine/endowment.ts";
import { fewOf, fewBrief, keepingFew } from "../src/engine/fewslaves.ts";
import { marry, readTerms, marriageBrief, tickMarriage, type Written } from "../src/engine/marriage.ts";
import { romanceOf } from "../src/engine/romance.ts";
import { pendingBeat, optionsFor, answer, pickable, startArc, arcDef } from "../src/engine/story.ts";
import { cleanOption, locked, type Saga } from "../src/engine/saga.ts";
import { writeAct } from "../src/engine/writer.ts";
import { ACTS, ACT_BY_ID, FETISHES, FLAWS, QUIRK_BY_ID } from "../src/data/intimacy.ts";
import { BEHAVIOR_FLAWS, BEHAVIOR_QUIRK_BY_ID } from "../src/data/behavior.ts";
import { rng } from "../src/engine/rng.ts";
import type { Person, SaveState } from "../src/engine/types.ts";
import "../src/data/story/index.ts";

const HOLE = /undefined|NaN|\[object|\{[a-z]+\}/;

function withHer(seed: string, n = 1): { s: SaveState; her: Person } {
  const s = newGame({ seed, starting_slaves: 0 });
  for (const p of Object.values(s.people)) p.status = "free";
  let her!: Person;
  for (let i = 0; i < n; i++) {
    const p = generatePerson({ seed: `${seed}-${i}`, week: 1, age: 24 + i });
    p.status = "owned";
    s.people[p.id] = p; s.memory[p.id] = newMemory(); refresh(p, s.memory[p.id]);
    if (!i) her = p;
  }
  return { s, her };
}

/** Answer whatever's pending, at random, and say what went wrong. */
function drain(s: SaveState, seed: string, holes: string[], seen: Set<string>): void {
  const r = rng(seed);
  for (let guard = 0; guard < 6; guard++) {
    const p = pendingBeat(s);
    if (!p) return;
    seen.add(`${p.def.id}:${p.run.beat}`);
    const title = typeof p.beat.title === "function" ? p.beat.title(p.c) : p.beat.title;
    const text = p.beat.text(p.c);
    if (HOLE.test(title + text)) holes.push(`${p.def.id}:${p.run.beat}: ${(title + text).slice(0, 140)}`);
    const opts = optionsFor(s);
    for (const o of opts) if (HOLE.test(o.label + (o.note ?? ""))) holes.push(`${p.def.id}/${o.id}: ${o.label}`);
    const open = opts.filter((o) => !o.locked && (!o.pick || pickable(s, o.id).length));
    if (!open.length) { holes.push(`${p.def.id}:${p.run.beat} has no option you can take`); return; }
    const o = r.pick(open);
    const a = answer(s, o.id, o.pick ? r.pick(pickable(s, o.id)).id : undefined);
    if (!a) { holes.push(`${p.def.id}/${o.id} refused`); return; }
    if (HOLE.test(a.text + a.consequences.join(" "))) holes.push(`${p.def.id}/${o.id} result: ${a.text.slice(0, 140)}`);
  }
}

/* ── skills with people ────────────────────────────────────────────────────────────────────── */
{
  const { s, her } = withHer("skill-sed");
  her.persona.fetishes = [{ name: "none", strength: 0, known: false }]; her.persona.quirk = undefined; her.persona.flaw = undefined;
  const t = withHer("skill-sed");
  t.her.persona = JSON.parse(JSON.stringify(her.persona));
  s.player.skills.seduction = 0; t.s.player.skills.seduction = 90;
  const a = resolveAct(s, her, "kissing"), b = resolveAct(t.s, t.her, "kissing");
  check("a seductive owner's kiss lands better", "bond" in a && "bond" in b && b.bond > a.bond, { a, b });
}
{
  const { s, her } = withHer("skill-intim");
  const t = withHer("skill-intim");
  s.player.skills.intimidation = 0; t.s.player.skills.intimidation = 100;
  const a = resolveAct(s, her, "discipline"), b = resolveAct(t.s, t.her, "discipline");
  check("an intimidating owner's punishment leaves less resentment", "resentment" in a && "resentment" in b && b.resentment < a.resentment, { a: "resentment" in a && a.resentment, b: "resentment" in b && b.resentment });
}
{
  const { s, her } = withHer("skill-charm");
  // Somewhere short of telling you: she'd say how she got here at trust 5, and she's not there.
  her.bond.fear = 10; her.bond.resentment = 0;
  for (let b = -60; b <= 60; b += 2) { her.bond.bond = b; refresh(her, s.memory[her.id]); if (read(her, s.memory[her.id]).trust > -10) break; }
  const trust = read(her, s.memory[her.id]).trust;
  s.player.skills.charisma = 0;
  const cold = talk(s, her.id, "how");
  s.player.skills.charisma = 100;
  const warm = talk(s, her.id, "how");
  check("charm gets her telling you how she got here sooner", trust <= 5 && warm.said !== cold.said, { trust, cold, warm });
}
{
  const s = newGame({ seed: "skill-custom" });
  settleSkills(s);
  const sk = addCustomSkill(s, "Hypnosis", "I can put people under with my voice and they do what I say.");
  check("a custom skill can be added", !!sk && s.player.skills[sk!.id] === 20);
  check("the same one can't be added twice", addCustomSkill(s, "hypnosis", "again") === null);
  check("every prompt is told what it is and how good the owner is", /Hypnosis, at 20 out of 100[\s\S]*put people under/.test(skillsBrief(s)), skillsBrief(s));
  const before = s.player.skills[sk!.id];
  practiseFrom(s, "I try to hypnotise her with my voice");
  check("and using it by name is practice", s.player.skills[sk!.id] > before);
  const x = { id: "x", cast: [], facts: [] } as unknown as Saga;
  const o = cleanOption(s, { label: "Put her under", outcome: "She goes under.", needs: [{ skill: { id: "Hypnosis", at: 60 } }] });
  check("a saga option can need the owner's own skill", !!o?.needs?.length && /hypnosis 60/i.test(locked(s, x, o!) ?? ""), o?.needs);
  s.player.skills[sk!.id] = 70;
  check("and opens when they're good enough", locked(s, x, o!) === null);
  check("a default owner isn't written as hopeless with people", !/clumsy|don't win people over/.test(skillsBrief(s)), skillsBrief(s));
}

/* ── what they say about it ────────────────────────────────────────────────────────────────── */
{
  const { s, her } = withHer("size-small");
  s.player.body = { ...s.player.body, dick: 2, balls: 2, vagina: null };
  check("a small cock is small", endowment(s).small);
  s.player.household_read = { feared: 5, trusted: 50, label: "x" };
  const loud = sizeLine(s);
  s.player.household_read = { feared: 95, trusted: 0, label: "x" };
  s.player.skills.intimidation = 100;
  const quiet = sizeLine(s);
  check("an owner nobody fears hears it said", /don't hide that they've noticed/.test(loud), loud);
  check("a feared one only sees it in the silences", /nobody ever says it to the owner's face/.test(quiet), quiet);
  resolveAct(s, her, "vaginal");
  for (let i = 0; i < 12; i++) tickEndowment(s);
  check("the women you've had talk, and it gets around", talkOfIt(s) > 10, talkOfIt(s));
  her.persona.fetishes = [{ name: "sph", strength: 70, known: false }];
  const small = affinity(her, ACT_BY_ID["mock your cock"]).score;
  const out = resolveAct(s, her, "mock your cock");
  check("a size humiliatrix loves a small one", "landing" in out && out.landing === "wanted", out);
  s.arcology.cash = 1e6;
  const r = enlarge(s);
  check("surgery makes it bigger, and bought", r.ok && endowment(s).bought && !endowment(s).small);
  check("and the joke becomes the surgery", /surgically enlarged/.test(sizeLine(s)));
  const big = resolveAct(s, her, "mock your cock");
  check("there's nothing to laugh at once it's big", "landing" in big && big.landing !== "wanted" && small > 0, big);
}

/* ── the only ones ─────────────────────────────────────────────────────────────────────────── */
{
  const { s, her } = withHer("few-one");
  s.arcology.week = 5;
  const bond0 = her.bond.bond;
  const holes: string[] = []; const seen = new Set<string>();
  for (let w = 0; w < 30; w++) {
    if (s.arcology.cash < 20000) s.arcology.cash += 40000;
    // Keep her: the household stays one woman however the run goes.
    for (const p of Object.values(s.people)) if (p.id !== her.id && p.status === "owned") p.status = "free";
    endWeek(s);
    drain(s, `few-${w}`, holes, seen);
  }
  const f = fewOf(s);
  check("one woman, kept: the household is a small one", keepingFew(s));
  check("she feels the owner's weight", (f.power[her.id] ?? 0) >= 40, f.power);
  check("and falls for the owner", her.bond.bond > bond0 + 10, { bond0, now: her.bond.bond });
  check("the world notices", f.heard >= 25, f.heard);
  check("every prompt knows", /KEEPS ONLY ONE SLAVE/.test(fewBrief(s)));
  check("the story of it starts", !!s.story?.arcs["w_few"], Object.keys(s.story?.arcs ?? {}));
  check("and plays without a hole", holes.length === 0, holes);
}

/* ── married, on your terms ────────────────────────────────────────────────────────────────── */
check("terms: private, freed, she leads", JSON.stringify(readTerms("Private, just us. I free her first, and she leads at home.")) === JSON.stringify({ public: false, status: "free wife", power: "her" }));
check("terms: public, collared, I lead", JSON.stringify(readTerms("On the concourse in front of everyone; she keeps her collar.")) === JSON.stringify({ public: true, status: "slave wife", power: "you" }));
{
  const { s, her } = withHer("wed", 2);
  const terms = "On the concourse at sunset. She keeps her collar and kneels for the vows. I lead.";
  const w: Written = { title: "Gold Collar", scene: "You marry her.", public: true, status: "slave wife", power: "you", vows: ["Yours"], seen: "The city is split.", rep: 400, standing: 1, doctrines: [], norms: [], hooks: ["The other one wanted it."] };
  const res = marry(s, her.id, terms, w);
  check("she can be married with no ladder", res.ok && romanceOf(her).standing === "wife", res);
  check("a slave wife keeps her collar", her.status === "owned");
  check("and the owner leads", romanceOf(her).dominion <= -20);
  for (let i = 0; i < 40; i++) tickMarriage(s);
  check("being his wife doesn't drift her into holding the collar", romanceOf(her).dominion <= -20, romanceOf(her).dominion);
  check("every prompt knows the terms", /kneels for the vows/.test(marriageBrief(s)));
  check("a second marriage is refused", !marry(s, Object.keys(s.people).find((k) => k !== her.id && s.people[k].status === "owned")!, "x", w).ok);
  const holes: string[] = []; const seen = new Set<string>();
  for (let wk = 0; wk < 26; wk++) {
    if (s.arcology.cash < 30000) s.arcology.cash += 40000;
    endWeek(s);
    drain(s, `wed-${wk}`, holes, seen);
  }
  check("what comes after the wedding plays out", [...seen].filter((x) => x.startsWith("w_marriage")).length >= 3, [...seen]);
  check("without a hole", holes.length === 0, holes);
}

/* ── the measure of the owner, played ──────────────────────────────────────────────────────── */
{
  const { s, her } = withHer("size-arc", 2);
  s.player.body = { ...s.player.body, dick: 1, balls: 2 };
  resolveAct(s, her, "vaginal");
  if (s.story) s.story.flags["size_talk"] = 40;
  const def = arcDef("w_size")!;
  startArc(s, s.story!, def);
  const holes: string[] = []; const seen = new Set<string>();
  for (let wk = 0; wk < 10; wk++) { s.arcology.cash += 50000; endWeek(s); drain(s, `size-${wk}`, holes, seen); }
  check("the size story plays", [...seen].some((x) => x.startsWith("w_size")), [...seen]);
  check("without a hole", holes.length === 0, holes);
}

/* ── the wider list ────────────────────────────────────────────────────────────────────────── */
{
  const tags = new Set(ACTS.flatMap((a) => [...a.tags, a.id]));
  const dead = FETISHES.filter((f) => f.id !== "none" && !f.acts.some((t) => tags.has(t)));
  check("every fetish is fed by some act", dead.length === 0, dead.map((f) => f.id));
  check("every sexual flaw softens into a quirk that exists", FLAWS.every((f) => !f.softens_to || !!QUIRK_BY_ID[f.softens_to]));
  check("every behavioural flaw softens into a quirk that exists", BEHAVIOR_FLAWS.every((f) => !!BEHAVIOR_QUIRK_BY_ID[f.softens_to]), BEHAVIOR_FLAWS.filter((f) => !BEHAVIOR_QUIRK_BY_ID[f.softens_to]).map((f) => f.id));
  const { s, her } = withHer("acts-new");
  s.arcology.cash = 1e6;
  her.bond.bond = 60; refresh(her, s.memory[her.id]);
  const fresh = ["worship armpits", "smell her", "ass worship", "facesit", "peg you", "lock you", "spit", "ballbust", "mock your cock", "footstool", "watch her", "choked by her", "tribute", "choke her", "leash her", "tickle her"];
  const broken: string[] = [];
  for (const id of fresh) {
    const o = resolveAct(s, her, id);
    if ("error" in o) { broken.push(`${id}: ${o.error}`); continue; }
    const w = writeAct(s, her, o);
    if (HOLE.test(w.paragraphs.join(" "))) broken.push(`${id}: ${w.paragraphs.join(" ").slice(0, 120)}`);
  }
  check("the new acts all run and write", broken.length === 0, broken);
  her.persona.fetishes = [{ name: "armpits", strength: 80, known: false }];
  check("an armpit fetish is fed by worshipping her armpits", affinity(her, ACT_BY_ID["worship armpits"]).score > 0.5);
  const cash = s.arcology.cash;
  resolveAct(s, her, "tribute");
  check("tribute costs real money", s.arcology.cash < cash);
}
