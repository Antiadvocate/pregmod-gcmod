/**
 * THE CORE LOOP, AND THE THING AT THE END OF IT.
 *
 * The claim these tests exist to protect is that an act is not an increment: the same hour lands
 * three different ways depending on who it is being done to, and the difference is legible in the
 * numbers rather than only in the prose. If this file goes green-to-red the game has quietly
 * become a stat tracker with a narrator attached.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { generatePerson } from "../src/engine/generate.ts";
import { newMemory } from "../src/engine/memory.ts";
import { refresh, read } from "../src/engine/obedience.ts";
import { resolveAct, affinity, canDo, actDirective } from "../src/engine/intimacy.ts";
import { ACT_BY_ID } from "../src/data/intimacy.ts";
import { ascend, nextRung, renounce, romanceOf, shiftDominion, herReach, keeperRunsTheWeek, theKeeper } from "../src/engine/romance.ts";
import { generateAsk, grantAsk, refuseAsk } from "../src/engine/asks.ts";
import { DYNAMIC_EFFECTS, resolveDynamic } from "../src/engine/dynamic.ts";
import { visualSignature, scenePrompt } from "../src/engine/portrait.ts";

function planted(seed: string, opts: { fetish?: string; flaw?: string; quirk?: string } = {}) {
  const s = newGame({ seed, starting_slaves: 1 });
  const p = Object.values(s.people)[0];
  p.age = 24; p.physical_age = 24;
  p.persona.fetishes = opts.fetish ? [{ name: opts.fetish, strength: 80, known: true }] : [{ name: "none", strength: 0, known: true }];
  p.persona.flaw = opts.flaw ? { id: opts.flaw, known: true, worn: 0 } : undefined;
  p.persona.quirk = opts.quirk ? { id: opts.quirk, known: true } : undefined;
  p.body.vagina = 2; p.body.anus = 1; p.body.boobs = 500;
  p.chastity = { vagina: false, anus: false, penis: false };
  p.psyche.relaxation = 0;
  s.memory[p.id] = s.memory[p.id] ?? newMemory();
  refresh(p, s.memory[p.id]);
  return { s, p };
}

/* ── the same act, three women ──────────────────────────────────────────────────────────────── */
{
  const into = planted("into", { fetish: "buttslut" });
  const hates = planted("hates", { flaw: "hates anal" });
  const neither = planted("neither");

  const a = resolveAct(into.s, into.p, "anal");
  const b = resolveAct(hates.s, hates.p, "anal");
  const c = resolveAct(neither.s, neither.p, "anal");
  if ("error" in a || "error" in b || "error" in c) {
    check("the same act resolves for all three", false, { a, b, c });
  } else {
    check("the woman who is into it wants it", a.landing === "wanted", a);
    check("the woman with the flaw hates it", b.landing === "hated", b);
    check("and the third one is having a Tuesday", c.landing === "willing" || c.landing === "nothing" || c.landing === "endured", c);
    check("wanting it moves the bond up and hating it moves it down", a.bond > 0 && b.bond < 0, { a: a.bond, b: b.bond });
    check("hating it costs her far more resentment", b.resentment > c.resentment * 2, { hated: b.resentment, ordinary: c.resentment });
    check("and it lands on the nervous system in opposite directions", a.relaxation > b.relaxation, { a: a.relaxation, b: b.relaxation });
    check("all three got better at it either way", (a.trained.anal ?? 0) > 0 && (b.trained.anal ?? 0) > 0);
  }
}

/* ── firsts, discovery, and the long road ───────────────────────────────────────────────────── */
{
  const { s, p } = planted("first", { fetish: "cumslut" });
  p.persona.fetishes[0].known = false;
  const first = resolveAct(s, p, "oral");
  check("a first is marked as one", !("error" in first) && first.first);
  check("and it goes into the bank as a core memory", (s.memory[p.id]?.episodic ?? []).some((m) => m.core));
  check("doing the thing she is into is how you find out she is into it", p.persona.fetishes[0].known, p.persona.fetishes[0]);

  const second = resolveAct(s, p, "oral");
  check("the second time is not a first", !("error" in second) && !second.first);
  check("and the count is kept", (p.acts?.oral ?? 0) === 2, p.acts);
}

{
  // The most expensive road in the game: keep going and the flaw wears through into its mirror.
  const { s, p } = planted("wear", { flaw: "hates anal" });
  for (let i = 0; i < 130; i++) resolveAct(s, p, "anal");
  check("a flaw worked at for long enough converts into the matching quirk",
    p.persona.quirk?.id === "painal queen" && !p.persona.flaw, { quirk: p.persona.quirk, flaw: p.persona.flaw });
  check("and it cost her the entire way there", p.bond.resentment > 50, p.bond.resentment);
}

{
  // A fetish fed forever stops being a preference.
  const { s, p } = planted("para", { fetish: "buttslut" });
  for (let i = 0; i < 100; i++) resolveAct(s, p, "anal");
  check("a fetish fed long enough becomes a paraphilia", p.persona.paraphilia === "anal addict", p.persona.paraphilia);
}

/* ── what a body can and cannot take ────────────────────────────────────────────────────────── */
{
  const { s, p } = planted("gate");
  p.age = 15;
  check("no act reaches a child", !!canDo(p, ACT_BY_ID.oral) && "error" in resolveAct(s, p, "oral"));
  p.age = 24;
  p.body.vagina = null;
  check("and anatomy is respected", !!canDo(p, ACT_BY_ID.vaginal));
  p.chastity.anus = true;
  check("chastity is respected", !!canDo(p, ACT_BY_ID.anal));
}

/* ── the directive the narrator gets ────────────────────────────────────────────────────────── */
{
  const { s, p } = planted("directive", { flaw: "hates oral" });
  const out = resolveAct(s, p, "oral");
  if (!("error" in out)) {
    const d = actDirective(s, p, out);
    check("the directive tells the narrator how it landed", /SHE HATES THIS/.test(d), d.slice(0, 200));
    check("and names the register rather than leaving it to be guessed", /REGISTER/.test(d) && /explicit/i.test(d));
    check("and forbids the one thing the narrator must never do", /may not do is state her interior/i.test(d));
  }
}

/* ── the ladder ─────────────────────────────────────────────────────────────────────────────── */
{
  // The gate that bites: a woman held by fear cannot be courted, however obedient she looks.
  const { s, p } = planted("terror");
  p.bond = { ...p.bond, bond: 10, fear: 95, resentment: 20, hope: 30, weeks_since_kindness: 1, weeks_since_cruelty: 1 };
  refresh(p, s.memory[p.id]);
  const rom = romanceOf(p);
  rom.standing = "kept";
  rom.since_week = 0;
  s.arcology.week = 40;
  const next = nextRung(s, p);
  check("terror does not get you past kept", !next?.ready, next?.blocked);
  check("and the wall says exactly why", (next?.blocked ?? []).some((b) => /fear/.test(b)), next?.blocked);

  // The same woman, held by the bond instead. Attachment is pinned: an avoidant nervous system
  // converts closeness into visibly less compliance (obedience.ts), so leaving it to the roll makes
  // this a test of what the forge happened to produce rather than of the gate.
  p.persona.attachment.style = "secure";
  p.bond = { ...p.bond, bond: 70, fear: 5, resentment: 5, hope: 60, weeks_since_kindness: 1, weeks_since_cruelty: 30 };
  for (let i = 0; i < 6; i++) {
    s.memory[p.id].episodic.push({ id: `m${i}`, content: "something good", week: 30 + i, importance: 8, charge: "warm", decay: 1, source: "lived" });
  }
  p.psyche.relaxation = 4;
  refresh(p, s.memory[p.id]);
  const better = nextRung(s, p);
  check("the bond does", !!better?.ready, better?.blocked);

  // And the same bond in an avoidant body reads as less, which is the attachment model doing its
  // job rather than a bug — she gets there, it just takes more.
  p.persona.attachment.style = "avoidant";
  refresh(p, s.memory[p.id]);
  check("the same bond in an avoidant body is not yet enough", !nextRung(s, p)?.ready, nextRung(s, p)?.blocked);
  p.bond.bond = 100;
  p.bond.hope = 95;
  p.psyche.relaxation = 6;
  refresh(p, s.memory[p.id]);
  check("but it is reachable, it just costs more", !!nextRung(s, p)?.ready, nextRung(s, p)?.blocked);
}

{
  // Time is a gate on its own: the road cannot be run in a fortnight.
  const { s, p } = planted("hurry");
  const rom = romanceOf(p);
  rom.standing = "favourite";
  rom.since_week = s.arcology.week;
  p.bond = { ...p.bond, bond: 90, fear: 0, resentment: 0, hope: 90 };
  p.psyche.relaxation = 6;
  refresh(p, s.memory[p.id]);
  check("a rung will not open the same week the last one did", !nextRung(s, p)?.ready, nextRung(s, p)?.blocked);
}

{
  // Breaking a public promise is the most expensive act in the game.
  const { s, p } = planted("betray", {});
  const other = generatePerson({ seed: "witness", age: 25 });
  s.people[other.id] = other; s.memory[other.id] = newMemory();
  const rom = romanceOf(p);
  rom.standing = "betrothed";
  const hopeBefore = other.bond.hope;
  const repBefore = s.arcology.rep;
  const lines = renounce(s, p, "you changed your mind");
  check("taking back a public promise wrecks her", p.bond.hope < 20 && p.bond.resentment > 20, { hope: p.bond.hope, resentment: p.bond.resentment });
  check("and it costs standing", s.arcology.rep < repBefore);
  check("and every other woman in the house files it", other.bond.hope < hopeBefore && lines.length >= 2, { was: hopeBefore, now: other.bond.hope });
  check("she is back to being property", p.romance?.standing === "property");
}

/* ── dominion, asks, and the inversion ──────────────────────────────────────────────────────── */
{
  const { s, p } = planted("dominion");
  const rom = romanceOf(p);
  rom.standing = "favourite";
  shiftDominion(s, p, 90, "test");
  check("she cannot take standing the rung does not give her", rom.dominion <= -20, rom.dominion);
  rom.standing = "wife";
  shiftDominion(s, p, 200, "test");
  check("a wife can", rom.dominion > 50, rom.dominion);
  check("and the reach opens as she goes", herReach(p).policy && herReach(p).assignments);
}

{
  const { s, p } = planted("asks");
  p.bond = { ...p.bond, bond: 60, fear: 5, resentment: 5, hope: 60 };
  p.health.energy = 10;
  refresh(p, s.memory[p.id]);
  const ask = generateAsk(s, p);
  check("she asks for something when she has the standing to", !!ask, ask);
  if (ask) {
    const before = romanceOf(p).dominion;
    grantAsk(s, ask);
    check("doing what she asks moves who is deciding", romanceOf(p).dominion > before, { before, now: romanceOf(p).dominion });

    const ask2 = generateAsk(s, p);
    if (ask2) {
      const mid = romanceOf(p).dominion;
      refuseAsk(s, ask2, true);
      check("putting her in her place moves it back and costs her hope", romanceOf(p).dominion < mid && p.bond.resentment > 5);
    }
  }
  // A woman with nothing does not ask for anything, and the silence is the information.
  const mute = planted("mute").p;
  mute.bond = { ...mute.bond, bond: -60, fear: 90, resentment: 80, hope: 0 };
  refresh(mute);
  check("a woman held only by fear does not ask for anything", generateAsk(s, mute) === null);
}

{
  // The far end: she runs it, and what she does with it comes off her own record.
  const cold = planted("cold");
  cold.p.persona.conscience = 0.1;
  const other = generatePerson({ seed: "underling", age: 22 });
  other.bond.read = { devotion: -40, trust: -20, label: "resistant" };
  cold.s.people[other.id] = other;
  cold.s.memory[other.id] = newMemory();
  cold.s.arcology.facilities["cellblock"].level = 1;
  cold.s.arcology.facilities["cellblock"].capacity = 4;
  const rom = romanceOf(cold.p);
  rom.standing = "keeper"; rom.dominion = 100;
  cold.s.player.owned_by = cold.p.id;
  check("the engine knows who is running the place", theKeeper(cold.s)?.id === cold.p.id);
  let moved = false;
  for (let i = 0; i < 12; i++) {
    cold.s.arcology.week++;
    const out = keeperRunsTheWeek(cold.s);
    if (out.lines.some((l) => /cellblock/.test(l.text))) moved = true;
  }
  check("a cold woman handed the arcology runs a cold arcology", moved);

  const warm = planted("warm");
  warm.p.persona.conscience = 0.9;
  const hurt = generatePerson({ seed: "hurt", age: 22 });
  hurt.health.health = -50;
  warm.s.people[hurt.id] = hurt;
  warm.s.memory[hurt.id] = newMemory();
  warm.s.arcology.facilities["spa"].level = 1;
  warm.s.arcology.facilities["spa"].capacity = 4;
  const rom2 = romanceOf(warm.p);
  rom2.standing = "keeper"; rom2.dominion = 100;
  warm.s.player.owned_by = warm.p.id;
  let pulled = false;
  for (let i = 0; i < 12; i++) {
    warm.s.arcology.week++;
    if (keeperRunsTheWeek(warm.s).lines.some((l) => /took .* off the floors/.test(l.text))) pulled = true;
  }
  check("and a warm one runs a warm one", pulled);
}

/* ── the guardrail on generated events ──────────────────────────────────────────────────────── */
{
  const { s, p } = planted("dyn");
  const e = { id: "e1", kind: "dynamic", person: p.id, seed: "", options: [], week: 1, severity: "notable" as const };
  s.events.push(e);
  const before = JSON.stringify(s.people);
  resolveDynamic(s, e, "d0:definitely_not_a_real_effect:9999");
  check("an effect a model invented does nothing at all", JSON.stringify(s.people) === before);
  check("every effect in the closed table is callable", Object.entries(DYNAMIC_EFFECTS).every(([, def]) => {
    try { def.run(s, p, 3); return true; } catch { return false; }
  }));
}

/* ── the pictures ───────────────────────────────────────────────────────────────────────────── */
{
  const { s, p } = planted("art");
  const sig = visualSignature(p, "natural");
  check("a person can be described to a sampler", sig.length > 20 && /\d+-year-old/.test(sig), sig);
  const tagged = visualSignature(p, "tags");
  check("and in the other dialect", tagged.startsWith("1girl,"), tagged);

  p.body.visual_signature = "LOCKED CLAUSE";
  s.scene.present = [p.id];
  const scene = scenePrompt(s, { act: "vaginal" });
  check("the locked clause is reused verbatim rather than re-derived", scene.prompt.includes("LOCKED CLAUSE"), scene.prompt);
  check("and the seed is held for the same room and cast", scenePrompt(s, { act: "oral" }).seed === scene.seed);
  check("a two-hander bars the crowd in the negative", /crowd/.test(scene.negative), scene.negative);
}
