/**
 * SOCIETY — the city's habits move with what you do, the court writes laws from them, and a walk
 * through the city shows it and feeds back into it.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { cultureOf, drivers, pushNorm, tickCulture } from "../src/engine/culture.ts";
import { courtOf, inForce, lawsOf, tickCourt } from "../src/engine/court.ts";
import { resolveEvent } from "../src/engine/events.ts";
import { applyDeed, concludeMoment, type Deed } from "../src/engine/deeds.ts";
import { momentsOf, playMoment } from "../src/engine/moments.ts";
import { places, startWalk, walkScene } from "../src/engine/walk.ts";
import { digest } from "../src/engine/prompts.ts";
import type { SaveState } from "../src/engine/types.ts";

const game = (seed: string) => newGame({ seed, starting_slaves: 4, plot: false } as never) as SaveState;
const deed = (s: SaveState, tags: string[], pub: boolean, summary: string): Deed => ({ id: `d${s.arcology.week}-${tags[0]}`, week: s.arcology.week, summary, tags, public: pub, witnesses: [], effects: [], source: "test" });

{
  const s = game("soc-deed");
  const before = cultureOf(s).norms.reversal;
  const d = deed(s, ["owner_enslaved"], true, "You knelt in the plaza and gave yourself to Mira as her slave.");
  (s.deeds ??= []).push(d);
  tickCulture(s);
  const after = cultureOf(s).norms.reversal;
  check("a public deed moves the city", after - before >= 8, { before, after });
  check("and the breakdown says it was you", drivers(s, "reversal").some((x) => x.why.startsWith("you: ") && /Mira/.test(x.why)), drivers(s, "reversal"));
  tickCulture(s);
  check("a deed only counts once", cultureOf(s).pushes.filter((p) => p.why.includes("Mira")).length === 2, cultureOf(s).pushes.filter((p) => p.why.includes("Mira")).length);
  const priv = game("soc-private");
  (priv.deeds ??= []).push(deed(priv, ["owner_enslaved"], false, "You gave yourself to Mira in private."));
  const b2 = cultureOf(priv).norms.reversal;
  tickCulture(priv);
  check("a private one moves it less", cultureOf(priv).norms.reversal - b2 < after - before);
}

{
  const s = game("soc-court");
  pushNorm(s, "reversal", 120, "you: knelt to Mira in the plaza");
  courtOf(s).last = -10;
  const lines = tickCourt(s);
  const e = s.events.find((x) => x.kind === "court_enact_collar_covenant");
  check("the court drafts the law the city is living by", !!e, { lines, events: s.events.map((x) => x.kind) });
  check("the petition names what you did", !!e && /names you: knelt to Mira/.test(e.seed), e?.seed);
  resolveEvent(s, e!, "sign");
  check("signing puts it in force", inForce(s, "collar_covenant") && lawsOf(s)[0].by === "you");
  check("the narrator is told the city's habits and the laws", /HOW CITIZENS BEHAVE/.test(digest(s)) && /Collar Covenant/.test(digest(s)));
}

{
  const s = game("soc-ignore");
  pushNorm(s, "cruelty", 120, "you: caned a slave at the fountain");
  courtOf(s).last = -10;
  tickCourt(s);
  check("a cruel city gets the Public Discipline Act before the court", s.events.some((x) => x.kind === "court_enact_public_discipline"));
  s.arcology.week += 2;
  tickCourt(s);
  check("a case you ignore is decided without you", inForce(s, "public_discipline") && lawsOf(s)[0].by === "court");
  // The city turns gentle: the Welfare Code replaces it.
  pushNorm(s, "cruelty", -200, "you: freed the arcade");
  s.arcology.week += 4;
  tickCourt(s);
  const e = s.events.find((x) => x.kind.startsWith("court_"));
  check("when the city swings back, the court hears it", !!e, s.events.map((x) => x.kind));
  if (e?.kind === "court_repeal_public_discipline") { resolveEvent(s, e, "repeal"); s.arcology.week += 4; tickCourt(s); }
  const w = s.events.find((x) => x.kind === "court_enact_welfare_code");
  check("the opposite law comes up", !!w, s.events.map((x) => x.kind));
  if (w) resolveEvent(s, w, "sign");
  check("and the old one is gone", inForce(s, "welfare_code") && !inForce(s, "public_discipline"));
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  her.assignment = "be confined in the arcade";
  const cash = s.arcology.cash;
  tickCourt(s);
  check("the Welfare Code fines your arcade", s.arcology.cash < cash, { cash, now: s.arcology.cash });
  lawsOf(s)[0].exempt = true;
  const cash2 = s.arcology.cash;
  tickCourt(s);
  check("unless your household is exempt", s.arcology.cash === cash2);
}

{
  const s = game("soc-veto");
  pushNorm(s, "exposure", 150, "the clubs");
  courtOf(s).last = -10;
  tickCourt(s);
  const e = s.events.find((x) => x.kind === "court_enact_nudity_ordinance")!;
  const standing = s.arcology.public_standing;
  resolveEvent(s, e, "veto");
  check("a veto costs standing", s.arcology.public_standing < standing);
  check("and pushes the city back", cultureOf(s).norms.exposure < 100);
  s.arcology.week += 4; tickCourt(s);
  check("a vetoed law doesn't come straight back", !s.events.some((x) => x.kind === "court_enact_nudity_ordinance"));
  s.arcology.week += 16; tickCourt(s);
  check("but it does come back", s.events.some((x) => x.kind === "court_enact_nudity_ordinance"));
}

{
  const s = game("soc-walk");
  check("you can walk the concourse", places(s)[0].id === "concourse" && places(s).length >= 2, places(s).map((p) => p.id));
  const c = cultureOf(s);
  for (const k of Object.keys(c.norms) as (keyof typeof c.norms)[]) c.norms[k] = 0;
  c.norms.cruelty = 95;
  const seen = places(s).map((pl) => walkScene(s, pl)).join("\n");
  check("a cruel city looks cruel on the street", /caning|chained to a railing/.test(seen), seen.slice(0, 400));
  c.norms.cruelty = -95;
  const gentle = places(s).map((pl) => walkScene(s, pl)).join("\n");
  check("a gentle one looks gentle", /says sorry|turn to stare/.test(gentle));
  lawsOf(s).push({ id: "barefoot_statute", week: 1, by: "court" });
  let law = false;
  for (let i = 0; i < 6 && !law; i++) { s.turn++; law = places(s).some((pl) => /Barefoot Statute/.test(walkScene(s, pl))); }
  check("a law in force is on the street", law);

  const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;
  const id = startWalk(s, "concourse", her.id);
  const m = momentsOf(s).find((x) => x.id === id)!;
  check("a walk opens as a moment", m.source === "walk" && m.walk === "concourse" && m.log.length === 2);
  const r = await playMoment(s, id, "Step in and stop the man caning his slave");
  check("the walk answers without a model", r.ok && r.prose.length > 40, r.prose);
  check("with things to do next", m.options.length === 4);
  const d = await concludeMoment(s, m);
  check("ending a walk leaves a public deed", !!d && d.public, d);
}

{
  // Doctrines pull the city on their own.
  const s = game("soc-doctrine");
  s.arcology.doctrines["degradationist"] = { adoption: 100, decoration: 0, research: false, policies: {} } as never;
  for (let i = 0; i < 40; i++) { s.arcology.week++; tickCulture(s); }
  check("a degradationist city grows cruel", cultureOf(s).norms.cruelty > 30, cultureOf(s).norms.cruelty);
  check("history is kept for the chart", cultureOf(s).history.length === 40);
}

{
  // A long run: laws arrive by themselves and nothing breaks.
  const s = game("soc-run");
  s.arcology.doctrines["paternalist"] = { adoption: 90, decoration: 0, research: false, policies: {} } as never;
  for (let w = 0; w < 60; w++) {
    endWeek(s);
    for (const e of s.events.filter((x) => x.kind.startsWith("court_"))) resolveEvent(s, e, "court");
    if (s.story) s.story.pending = undefined;
  }
  check("over a year, the court writes something", courtOf(s).record.length > 0, { norms: cultureOf(s).norms, record: courtOf(s).record });
  applyDeed(s, deed(s, ["cruelty"], true, "You whipped a slave in the plaza."));
}

{
  // Society events come up in an ordinary run, and campaigns and speeches move the city.
  const { CIVIC_EVENTS, startCampaign, speech, canSpeak } = await import("../src/engine/civic.ts");
  const s = game("soc-civic");
  let seen = 0;
  for (let w = 0; w < 30; w++) {
    endWeek(s);
    for (const e of s.events.filter((x) => x.kind.startsWith("civic_") || x.kind.startsWith("court_"))) { if (e.kind.startsWith("civic_")) seen++; resolveEvent(s, e, (CIVIC_EVENTS.find((d) => d.id === e.kind)?.options[0].id) ?? "court"); }
    if (s.story) s.story.pending = undefined;
  }
  check("society events happen in a normal run", seen >= 2, seen);
  const t = game("soc-camp");
  const before = cultureOf(t).norms.feet;
  startCampaign(t, "washings");
  for (let w = 0; w < 6; w++) endWeek(t);
  check("a campaign moves its habit", cultureOf(t).norms.feet - before > 8, cultureOf(t).norms.feet - before);
  check("and the breakdown names it", drivers(t, "feet").some((d) => /campaign/.test(d.why)));
  const said = speech(t, "cruelty", -1);
  check("a speech moves the city and waits a fortnight", !!said && !canSpeak(t));
}

{
  // Laws you write.
  const { writeLaw, customLawRep, lawsBrief: brief } = await import("../src/engine/court.ts");
  const { suggestPush } = await import("../src/data/customlaws.ts");
  const s = game("soc-custom");
  s.arcology.rep = 500;
  const draft = { name: "The Kneeling Act", text: "Every citizen kneels when a slave of the owner's household passes, and washes her feet if she asks.", push: [{ norm: "reversal" as const, dir: 1 as const }, { norm: "feet" as const, dir: 1 as const }], effects: ["prestige", "tax"] };
  check("you need the reputation", !writeLaw(s, draft).ok);
  s.arcology.rep = 5000;
  const res = writeLaw(s, draft);
  check("with it, you can write a law", res.ok && lawsOf(s).some((l) => l.id.startsWith("custom_")) && !/[Tt]he The/.test(res.line), res.line);
  check("the wording suggests which way it leans", suggestPush(draft.text).some((p) => p.norm === "feet"));
  check("the narrator reads it", /Kneeling Act: Every citizen kneels/.test(brief(s)) && /Kneeling Act/.test(digest(s)), brief(s));
  check("the next one needs more", customLawRep(s) > 2000);
  const before = { rev: cultureOf(s).norms.reversal, cash: s.arcology.cash };
  for (let w = 0; w < 6; w++) { s.arcology.week++; tickCulture(s); tickCourt(s); }
  check("it pulls the city and runs every week", cultureOf(s).norms.reversal > before.rev && s.arcology.cash > before.cash, { rev: cultureOf(s).norms.reversal, cash: s.arcology.cash - before.cash });
  check("it's on the street", places(s).some((pl) => { for (let i = 0; i < 8; i++) { s.turn++; if (/Kneeling Act/.test(walkScene(s, pl))) return true; } return false; }));
  pushNorm(s, "reversal", -300, "the city turned against it");
  courtOf(s).last = -99; s.events = [];
  tickCourt(s);
  check("if the city turns hard against it, the court hears a repeal", s.events.some((e) => e.kind.startsWith("court_repeal_custom_")), s.events.map((e) => e.kind));
}

{
  // A law you write is felt: the household hears, the report says how it's kept, events come about it.
  const { writeLaw } = await import("../src/engine/court.ts");
  const s = game("soc-lawlife");
  s.arcology.rep = 9000;
  writeLaw(s, { name: "Sole Tithe", text: "Every slave shows her soles to any citizen who asks, and the citizen pays a coin for the looking.", push: [{ norm: "feet", dir: 1 }, { norm: "exposure", dir: 1 }], effects: ["tax"] });
  const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;
  check("your slaves hear about it", s.memory[her.id].episodic.some((m) => /Sole Tithe/.test(m.content)));
  check("so does the city", s.rumors.some((r) => /Sole Tithe/.test(r.content)));
  const lines: string[] = [];
  const kinds = new Set<string>();
  for (let w = 0; w < 8; w++) {
    const rep = endWeek(s);
    lines.push(...rep.lines.map((l) => l.text));
    for (const e of s.events.filter((x) => x.kind.startsWith("law_"))) { kinds.add(e.kind); check("law events quote the law", /Sole Tithe/.test(e.seed), e.seed); resolveEvent(s, e, e.kind === "law_breach" ? "example" : e.kind === "law_household" ? "punish" : e.kind === "law_protest" ? "listen" : e.kind === "law_abroad" ? "boast" : "attend"); }
    s.events = s.events.filter((e) => !e.kind.startsWith("civic_") && !e.kind.startsWith("hh_"));
    if (s.story) s.story.pending = undefined;
  }
  check("the week after, the city answers it with an event", kinds.size >= 1, [...kinds]);
  check("the report says how the city is keeping it", lines.some((l) => /Sole Tithe/.test(l)), lines.filter((l) => /Sole|law/i.test(l)).slice(0, 4));
}

{
  // On a walk, your laws are always being lived: done to your slave if they're about slaves.
  const { writeLaw } = await import("../src/engine/court.ts");
  const { walkContext } = await import("../src/engine/walk.ts");
  const s = game("soc-walklaw");
  s.arcology.rep = 9000;
  writeLaw(s, { name: "Kneeling Act", text: "Every citizen kneels when a slave of the owner's household passes.", push: [{ norm: "reversal", dir: 1 }], effects: [] });
  cultureOf(s).norms.reversal = 40;
  const her = Object.values(s.people).find((p) => p.status === "owned" && p.age >= 18)!;
  let every = true, toHer = true;
  for (let i = 0; i < 6; i++) {
    s.turn++;
    const scene = walkScene(s, places(s)[0], her);
    if (!/Kneeling Act/.test(scene)) every = false;
    if (!new RegExp(`${her.name}[^.]*(?:stops|look|know)|for her|${her.name} walks|when they see ${her.name}|${her.name}'s collar`).test(scene)) toHer = false;
  }
  check("every walk shows your law being kept", every);
  check("and applied to the slave with you", toHer);
  check("the walk narrator is told to show it", /THE OWNER'S OWN LAWS[\s\S]*Kneeling Act/.test(walkContext(s, "concourse")));
  cultureOf(s).norms.reversal = -80;
  check("a law the city hates is shown dodged and enforced", /patrol|your law, not ours/.test(walkScene(s, places(s)[0], her)));
}

{
  // What happens on one walk stays in that place.
  const { applyDeed } = await import("../src/engine/deeds.ts");
  const { walkContext } = await import("../src/engine/walk.ts");
  const { digest: dg } = await import("../src/engine/prompts.ts");
  const s = game("soc-walkfacts");
  const pl = places(s);
  const here = pl[0].id, there = (pl[1] ?? pl[0]).id;
  applyDeed(s, { id: "dw", week: 1, summary: "You ate at Luigi's on the concourse and tipped the waiter Marco in front of everyone.", tags: [], public: true, witnesses: [], effects: [], source: "walk", where: here, fact: "Luigi's restaurant on the concourse serves the owner for free." });
  check("a walk's lasting fact doesn't become a world fact", !s.canon.some((c) => /Luigi/.test(c)) && !/Luigi's restaurant on the concourse serves/.test(dg(s)));
  check("it comes back when you walk there again", /Luigi/.test(walkContext(s, here)));
  if (there !== here) check("but not when you walk somewhere else", !/Luigi/.test(walkContext(s, there)));
}
