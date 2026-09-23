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
import { generateAsk, grantAsk } from "../src/engine/asks.ts";
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
