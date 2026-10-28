/**
 * BODIES ARE REAL — what's too big for her hurts, stretches her for good, can tear her, leaves her
 * sore; the narrator is told the fit as fact; the clinic heals faster; and a scene's prose leaves
 * the same marks the sizes allow. Plus the original's voice, matched to the hole and her stance.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { fitOf, penetrate, fitLines, pairFitLine, herFitLine, capacity } from "../src/engine/fit.ts";
import { resolveAct, actDirective } from "../src/engine/intimacy.ts";
import { writeAct } from "../src/engine/writer.ts";
import { applyDiff } from "../src/engine/turn.ts";
import { tickHealth } from "../src/engine/health.ts";
import { refresh } from "../src/engine/obedience.ts";
import type { Person, SaveState } from "../src/engine/types.ts";

function setup(seed: string, dick: number): { s: SaveState; p: Person } {
  const s = newGame({ seed, starting_slaves: 2, plot: false } as never) as SaveState;
  (s.player.body as { dick: number }).dick = dick;
  const p = Object.values(s.people).find((x) => x.status === "owned" && x.age >= 18 && x.body.vagina !== null)!;
  p.body.vagina = 0; p.body.hymen = true; p.body.anus = 0; p.health.injuries = []; p.health.sore = {}; p.health.health = 40;
  p.persona.quirk = undefined; p.persona.fetishes = [{ name: "none", strength: 0, known: false }];
  Object.assign(p.bond, { bond: 60, fear: 0, resentment: 0, hope: 60 });
  refresh(p, s.memory[p.id]);
  return { s, p };
}

{
  const { s, p } = setup("fit-small", 2);
  check("a small cock in a tight pussy fits", ["fits", "snug"].includes(fitOf(p, "vagina", 2, s).word));
  const { s: s2, p: p2 } = setup("fit-big", 7);
  check("a massive one in a virgin is more than she can take", fitOf(p2, "vagina", 7, s2).word === "damage" && fitOf(p2, "anus", 7, s2).word === "damage");
  check("her card says so, as fact", /HOW YOU FIT HER[^\n]*doesn't fit/.test(fitLines(s2, p2).join("\n")));
  const out = resolveAct(s2, p2, "vaginal");
  check("taking her virginity is taken, not noted", !("error" in out) && p2.body.hymen === false && (p2.body.vagina ?? 0) >= 1);
  if (!("error" in out)) {
    check("the narrator is told how it fit and what it did", /HOW IT FITS, which is a fact:[^\n]*doesn't fit/.test(actDirective(s2, p2, out)) && /WHAT IT DOES TO HER/.test(actDirective(s2, p2, out)));
    check("and the game's own text shows the difficulty", /doesn't fit|too big|tight fit/.test(writeAct(s2, p2, out).paragraphs.join(" ")));
  }
  check("she's sore afterwards, and sore takes a size off", (p2.health.sore?.vagina ?? -1) >= s2.arcology.week && capacity(p2, "vagina", s2) < (p2.body.vagina ?? 0) + 2);
  // Keep at it: she's stretched for good, and forced past it she tears.
  let tore = false;
  for (let i = 0; i < 12; i++) { s2.turn++; const st = penetrate(s2, p2, "vagina", 7, { forced: true, seed: `t${i}` }); tore = tore || !!st.tore; }
  check("used past what she takes, she's stretched for good", (p2.body.vagina ?? 0) >= 3, p2.body.vagina);
  check("forced past it, she tears: a real injury", tore && p2.health.injuries.some((i) => i.what === "torn pussy" && !i.healed_week));
  check("and still hurting is on her card", /STILL HURTING[^\n]*torn pussy/.test(fitLines(s2, p2).join("\n")));
  const torn = p2.health.injuries.find((i) => i.what === "torn pussy")!;
  p2.facility = "clinic"; p2.health.health = 50;
  s2.arcology.week = torn.week + 3;
  tickHealth(s2, p2, { health: 0, energy: 0 });
  check("the clinic heals it in half the time", !!torn.healed_week, torn);
}

{
  const { s, p } = setup("fit-prose", 6);
  const before = p.body.vagina ?? 0;
  s.scene.present = [p.id];
  applyDiff(s, { strain: [{ id: p.id, hole: "vagina", what: "stretched" }, { id: p.id, hole: "vagina", what: "torn" }] }, "", "");
  check("what a scene's prose did to her stays done", (p.body.vagina ?? 0) === before + 1 && p.health.injuries.some((i) => i.what === "torn pussy"));
  const { s: s2, p: p2 } = setup("fit-prose-small", 1);
  p2.body.vagina = 3;
  applyDiff(s2, { strain: [{ id: p2.id, hole: "vagina", what: "torn" }, { id: p2.id, hole: "vagina", what: "stretched" }] }, "", "");
  check("but only as far as the sizes allow", (p2.body.vagina ?? 0) === 3 && !p2.health.injuries.some((i) => i.what === "torn pussy"));
}

{
  const { s, p } = setup("fit-pair", 2);
  const hung = Object.values(s.people).find((x) => x.id !== p.id && x.status === "owned")!;
  hung.body.dick = 9;
  check("one of yours with a huge cock against another: the fit is spelled out", /COCK IN[^\n]*doesn't fit/.test(pairFitLine(s, hung, p)));
  check("and against the owner, never the whole length", /HER COCK IN YOU[^\n]*never the whole length/.test(herFitLine(s, hung)));
}


{
  const { s, p } = setup("fit-forced", 3);
  Object.assign(p.bond, { bond: -70, fear: 0, resentment: 90, hope: 0 });
  refresh(p, s.memory[p.id]);
  const out = resolveAct(s, p, "anal");
  if (!("error" in out)) {
    const w = writeAct(s, p, out);
    check("forced, the game's own text writes it forced", /force/.test(w.paragraphs.join(" ")) && !/^Thank you/.test(w.said ?? ""), [w.paragraphs.join(" ").slice(0, 200), w.said]);
  } else check("forced anal runs", false, out);
}

// A tiny cock in a tight pussy is still small to her: no pain, no soreness, and never "tight around it".
{
  const { s, p } = setup("fit-tiny", 1);
  p.body.vagina = 1; p.body.hymen = false;
  check("a tiny cock in a tight pussy goes in easily", fitOf(p, "vagina", 1, s).word === "easy", fitOf(p, "vagina", 1, s));
  const card = fitLines(s, p).join(" ");
  check("and the card says it can't hurt her, and isn't tight around it", /Nothing of yours is a strain for her/.test(card) && /Never write her tight around it/.test(card) && !/write the difficulty/.test(card), card);
  applyDiff(s, { strain: [{ id: p.id, hole: "vagina", what: "sore" }] } as never, "", "");
  check("the prose calling her sore from it doesn't make her sore", !(p.health.sore?.vagina !== undefined && p.health.sore.vagina >= s.arcology.week), p.health.sore);
}
