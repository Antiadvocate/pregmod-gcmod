/**
 * THE HANDS-ON LOOP: what she says back, and what she asks for.
 *
 * The failures these name were reported from play: a result that read "she got there" and nothing
 * else, and a woman who asked for contraceptives every week after she was already on them.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { newMemory } from "../src/engine/memory.ts";
import { refresh } from "../src/engine/obedience.ts";
import { resolveAct, canDo } from "../src/engine/intimacy.ts";
import { ACTS } from "../src/data/intimacy.ts";
import { generateAsk, grantAsk, type AskWorld } from "../src/engine/asks.ts";
import { NORM_IDS } from "../src/engine/culture.ts";
import { romanceOf } from "../src/engine/romance.ts";
import { writeAct } from "../src/engine/writer.ts";
import { runFollowup, talk, TOPICS, FOLLOWUPS } from "../src/engine/encounter.ts";
import { registerOf, say } from "../src/engine/voice.ts";
import { rng } from "../src/engine/rng.ts";

function one(seed: string) {
  const s = newGame({ seed, starting_slaves: 1 });
  const p = Object.values(s.people)[0];
  p.age = 25; p.physical_age = 25;
  s.memory[p.id] = s.memory[p.id] ?? newMemory();
  refresh(p, s.memory[p.id]);
  return { s, p };
}

/* ── every act writes a scene ───────────────────────────────────────────────────────────────── */
{
  const { s, p } = one("writer");
  p.body.dick = 3; p.body.balls = 3; p.body.vagina = 2; p.body.boobs = 900;
  p.body.lactation = 1; p.body.nipples = "fuckable";
  p.womb.fetuses = [{ id: "f", week: 24, father_id: null, mother_id: p.id, genes: {} as never, sex: "XX", viable: true }];
  p.womb.weeks = 24; p.body.belly = 6000;
  const holes: string[] = [];
  const short: string[] = [];
  for (const act of ACTS) {
    if (canDo(p, act)) continue;
    const o = resolveAct(s, p, act.id);
    if ("error" in o) continue;
    const w = writeAct(s, p, o);
    const text = [...w.paragraphs, w.said ?? ""].join(" ");
    if (/\{\w+\}/.test(text) || /undefined/.test(text)) holes.push(`${act.id}: ${text}`);
    if (w.paragraphs.join(" ").length < 60) short.push(act.id);
  }
  check("every act writes without a hole in it", holes.length === 0, holes.slice(0, 3));
  check("and every one is a scene, not a readout", short.length === 0, short);
}

{
  // Coming is written as something that happened, and never as the words from the bug report.
  const { s, p } = one("came");
  p.persona.fetishes = [{ name: "buttslut", strength: 90, known: true }];
  p.psyche.arousal = 96;
  const o = resolveAct(s, p, "anal");
  if (!("error" in o)) {
    const w = writeAct(s, p, o);
    const text = w.paragraphs.join(" ");
    check("when she comes, the scene says how", o.finished && /come|comes|spill/i.test(text), text);
    check("and it does not say she got there", !/got there/i.test(text));
  }
}

/* ── her voice ─────────────────────────────────────────────────────────────────────────────── */
{
  const { s, p } = one("voice");
  p.psyche.state = "broken";
  check("a broken woman talks like one", registerOf(p) === "hollow");
  p.psyche.state = "intact";
  p.romance = { standing: "wife", since_week: 1, dominion: 80, rites: [], granted: 0, refused: 0 };
  check("a woman who decides things talks like it", registerOf(p) === "commanding");
  const line = say(s, p, "open", rng("x"));
  check("and her lines have nothing left unfilled", !/\{\w+\}/.test(line), line);
}

/* ── after, and talking ────────────────────────────────────────────────────────────────────── */
{
  const { s, p } = one("after");
  for (const f of Object.keys(FOLLOWUPS)) {
    if (f === "again") continue;
    const b = runFollowup(s, p.id, f);
    check(`"${FOLLOWUPS[f].label}" gets an answer`, !!(b.said || b.text), b);
  }
  for (const t of TOPICS) {
    const b = talk(s, p.id, t.id);
    check(`asking "${t.label}" gets an answer`, !!b.said && !/\{\w+\}/.test(b.said), b);
  }
}

{
  // Trust opens her up: the same question gets the real answer once she has reason to give it.
  const { s, p } = one("secret");
  p.bond = { ...p.bond, bond: 70, fear: 0, resentment: 0, hope: 70 };
  refresh(p, s.memory[p.id]);
  const b = talk(s, p.id, "secret");
  check("a woman who trusts you tells you something private", !!b.learned, b);
}

/* ── the asks ──────────────────────────────────────────────────────────────────────────────── */
{
  // THE BUG: a woman already on contraceptives kept asking to be put on them.
  const { s, p } = one("pill");
  p.bond = { ...p.bond, bond: 60, fear: 5, resentment: 5, hope: 60 };
  p.womb.fertility = 80; p.womb.sterile = false; p.womb.contraceptives = true; p.body.vagina = 2;
  p.persona.fetishes = [{ name: "none", strength: 0, known: true }];
  refresh(p, s.memory[p.id]);
  let asked = 0;
  for (let w = 0; w < 30; w++) {
    s.arcology.week = 10 + w;
    const a = generateAsk(s, p);
    if (a?.payload.kind === "contraceptives" && a.payload.value === "on") asked++;
  }
  check("a woman on the pill does not ask to be put on the pill", asked === 0, asked);

  p.womb.contraceptives = false;
  p.womb.fetuses = [{ id: "f", week: 10, father_id: null, mother_id: p.id, genes: {} as never, sex: "XX", viable: true }];
  let pregnantAsks = 0;
  for (let w = 0; w < 20; w++) {
    s.arcology.week = 50 + w;
    const a = generateAsk(s, p);
    if (a?.payload.kind === "contraceptives") pregnantAsks++;
  }
  check("and a pregnant one does not ask about contraception at all", pregnantAsks === 0, pregnantAsks);
}

{
  // A granted request stays settled for a while instead of coming straight back.
  const { s, p } = one("cooldown");
  p.bond = { ...p.bond, bond: 60, fear: 5, resentment: 5, hope: 60 };
  p.chastity = { vagina: true, anus: false, penis: false };
  p.health.energy = 90; p.health.health = 50;
  refresh(p, s.memory[p.id]);
  let first = null as ReturnType<typeof generateAsk>;
  for (let i = 0; i < 20 && first?.key !== "unlock"; i++) first = generateAsk(s, p);
  if (first?.key === "unlock") {
    grantAsk(s, first);
    p.chastity = { vagina: true, anus: false, penis: false };   // locked again straight away
    let again = 0;
    for (let i = 0; i < 20; i++) if (generateAsk(s, p)?.key === "unlock") again++;
    check("a request you just granted does not come straight back", again === 0, again);
    s.arcology.week += 9;
    let later = 0;
    for (let i = 0; i < 40; i++) if (generateAsk(s, p)?.key === "unlock") later++;
    check("but it can come back once enough weeks have gone by", later > 0, later);
  } else check("she asks to be unlocked when she is locked", false, first);
}

{
  // Asking twice in one week is not the same request forever.
  const { s, p } = one("variety");
  p.bond = { ...p.bond, bond: 60, fear: 5, resentment: 5, hope: 20 };
  p.chastity = { vagina: true, anus: false, penis: false };
  p.clothes = "no clothing";
  p.health.energy = 10;
  refresh(p, s.memory[p.id]);
  const keys = new Set<string>();
  for (let i = 0; i < 12; i++) keys.add(generateAsk(s, p)?.key ?? "none");
  check("asking her again can turn up something else", keys.size > 1, [...keys]);
}

/* ── asks live in the arcology they are asked in ───────────────────────────────────────────── */
{
  const world = (over: Partial<AskWorld> = {}): AskWorld => ({
    laws: [], norms: Object.fromEntries(NORM_IDS.map((n) => [n, 0])) as AskWorld["norms"], doctrine: () => 0, ...over,
  });
  const noPill = { id: "custom_1", name: "Fruitful Houses Act", text: "Contraceptives are banned. Every slave shall be kept pregnant.", exempt: false };
  const fertile = (seed: string) => {
    const { s, p } = one(seed);
    p.womb.fertility = 80; p.womb.sterile = false; p.womb.contraceptives = false; p.womb.fetuses = []; p.body.vagina = 2;
    p.persona.fetishes = [{ name: "none", strength: 0, known: true }];
    p.persona.paraphilia = undefined;
    return { s, p };
  };
  const tally = (s: ReturnType<typeof one>["s"], p: ReturnType<typeof one>["p"], w: AskWorld, key: string, n = 40) => {
    const hits: ReturnType<typeof generateAsk>[] = [];
    for (let i = 0; i < n; i++) {
      s.arcology.week = 10 + i;
      for (const k of Object.keys(p.counters)) if (k.startsWith("ask_")) delete p.counters[k];
      const a = generateAsk(s, p, w);
      if (a?.key === key) hits.push(a);
    }
    return hits;
  };

  // A devoted woman does not ask for what the law forbids; with no such law she does.
  const d = fertile("devoted-pill");
  d.p.bond = { ...d.p.bond, bond: 85, fear: 0, resentment: 0, hope: 70 };
  refresh(d.p, d.s.memory[d.p.id]);
  check("with no law against it, she asks for the pill", tally(d.s, d.p, world(), "contraceptives_on").length > 0);
  check("under a law banning contraceptives, a devoted woman never asks for the pill", tally(d.s, d.p, world({ laws: [noPill] }), "contraceptives_on").length === 0);

  // A woman with the standing to push asks anyway, and the ask says what it breaks and what it costs.
  const b = fertile("bold-pill");
  b.p.bond = { ...b.p.bond, bond: 70, fear: 0, resentment: 10, hope: 60 };
  romanceOf(b.p).dominion = 45;
  refresh(b.p, b.s.memory[b.p.id]);
  const bold = tally(b.s, b.p, world({ laws: [noPill] }), "contraceptives_on", 80);
  check("a woman with standing asks for it anyway", bold.length > 0, bold.length);
  check("and the ask names the law it breaks", bold.every((a) => a!.against?.includes("Fruitful Houses Act") && /goes against|doesn't come into it/.test(a!.text)), bold[0]);
  check("and saying yes costs standing", bold.every((a) => a!.rep === 12));
  const exempt = tally(b.s, b.p, world({ laws: [{ ...noPill, exempt: true }] }), "contraceptives_on", 80);
  check("unless your household is exempt from that law", exempt.length > 0 && exempt.every((a) => a!.rep === undefined), exempt[0]);

  // Clothes are what the city's slaves wear, and a nudity law keeps a devoted girl from asking.
  const n = one("naked");
  n.p.clothes = "no clothing";
  n.p.bond = { ...n.p.bond, bond: 85, fear: 0, resentment: 0, hope: 70 };
  n.p.persona.flaw = undefined;
  refresh(n.p, n.s.memory[n.p.id]);
  const kimono = tally(n.s, n.p, world({ slaveDress: "a kimono" }), "clothes_code");
  check("a naked slave asks for what the city's slaves wear", kimono.length > 0 && kimono.every((a) => a!.payload.value === "a kimono"), kimono[0]);
  const ordinance = { id: "nudity_ordinance", name: "Nudity Ordinance", text: "Slaves go naked in public.", exempt: false };
  const naked = world({ laws: [ordinance], dressLaw: "naked" });
  check("under a nudity law a devoted slave does not ask to be dressed", [...tally(n.s, n.p, naked, "clothes"), ...tally(n.s, n.p, naked, "clothes_code")].length === 0);
  n.p.persona.flaw = { id: "shamefast", known: false, worn: 0 };
  const shy = [...tally(n.s, n.p, naked, "clothes", 80), ...tally(n.s, n.p, naked, "clothes_code", 80)];
  check("but a shamefast one still asks, knowing it's against the law", shy.length > 0 && shy.every((a) => a!.against?.includes("Nudity Ordinance")), shy[0]);
}
