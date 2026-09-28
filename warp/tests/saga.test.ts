import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { writeLaw } from "../src/engine/court.ts";
import { answerOwn, choose, cleanOption, locked, pickSeed, running, sagasOf, seedsFor, tickSagas, writeNext, type Saga, type Writer } from "../src/engine/saga.ts";
import { facesOf, pruneFaces } from "../src/engine/faces.ts";

const s = newGame({ seed: "saga-a" });
s.arcology.rep = 20000; s.arcology.cash = 100000;
writeLaw(s, { name: "Quiet Hours", text: "No slave may speak above a whisper on the residential floors after the tenth hour.", push: [{ norm: "order", dir: 1 }], effects: [] });
const her = Object.values(s.people).find((p) => p.status === "owned")!;
her.bond.resentment = 80;
const first = her.name.split(" ")[0];

const seeds = seedsFor(s);
check("a law you wrote can start a story", seeds.some((x) => x.seed.id.startsWith("law:custom_")), seeds.map((x) => x.seed.id));
check("so can a slave who hates you", seeds.some((x) => x.seed.id === `slave:${her.id}:hate`));
check("a seed is picked", !!pickSeed(s));

sagasOf(s).next_start = s.arcology.week;
check("no model, no saga", tickSagas(s, false).length === 0 && !running(s).length);
const lines = tickSagas(s, true);
check("with one, a story begins, unwritten", running(s).length === 1 && running(s)[0].status === "unwritten" && lines.length === 1, lines);
const x = running(s)[0];
x.seed = { id: `slave:${her.id}:hate`, kind: "slave", people: [her.id], text: `${her.name} hates you.` };

const bible = {
  title: "The Whisper Rule", premise: "A slave organises the others against the Quiet Hours.", stakes: "Your household, or your law.", tone: "tense",
  acts: ["the first whispers", "the network", "the reckoning"],
  paths: [{ id: "crushed", label: "You crush it" }, { id: "bargain", label: "You make a bargain" }, { id: "lost", label: "She wins" }],
  cast: [
    { name: her.name, role: "the organiser", want: "a voice", fear: "the cellblock", secret: "she has a key", toward: -60, now: "planning" },
    { name: "Ilse Marr", role: "a citizen who helps her", want: "to hurt you", fear: "exposure", secret: "she owes the creditor", toward: -20, now: "careful", pronoun: "she", age: 44, nationality: "German", skin: "pale", hair: "red, braided", eyes: "grey", detail: "ink-stained fingers" },
  ],
};
const chapter = (last = false) => ({
  title: last ? "The reckoning" : "Notes in the laundry",
  text: `${first} passes a folded note to the girl beside her.\n\nIlse Marr watches from the gallery.`,
  options: [
    { label: "Search the laundry", note: "costs trust", outcome: "You find the notes.", effects: [{ cash: -2000 }, { treat: { name: first, kind: "coercion", size: 6 } }, { toward: { name: "Ilse Marr", by: -15 } }], develops: [{ name: first, now: "caught, and furious", turn: "She stops pretending to comply." }], facts: ["The notes are written in Ilse's ink"], closes: ["bargain"], advance: true },
    { label: "Pay Ilse to talk", needs: [{ cash: 5_000_000 }], outcome: "Ilse takes the money.", effects: [{ cash: -5_000_000 }] },
    { label: "Ask her what she wants", needs: [{ fact: "The notes are written in Ilse's ink" }], outcome: "She tells you.", opens: [{ id: "partner", label: "She becomes your partner" }] },
    { label: "Nonsense", effects: "junk" },
  ],
});
let calls = 0;
const fake = (queue: unknown[]): Writer => async () => { calls++; return { ok: true, text: "```json\n" + JSON.stringify(queue.shift()) + "\n```" }; };

const r1 = await writeNext(s, x.id, fake([bible, chapter()]));
check("the bible and the first chapter are written", r1.ok && x.status === "running" && x.title === "The Whisper Rule" && !!x.chapter && calls === 2, r1);
check("a stranger in it gets a face on file", facesOf(s)["ilse marr"]?.nation === "German" && x.cast[1].face === "ilse marr");
check("your slave is matched to her person", x.cast[0].person === her.id);
check("junk options are dropped", x.chapter!.options.length === 3);
check("an option you can't afford says so", locked(s, x, x.chapter!.options[1]) === "needs ¤5,000,000");
check("an option needing a fact you don't have says so", /you'd need to know/.test(locked(s, x, x.chapter!.options[2]) ?? ""));
check("a locked option can't be taken", choose(s, x.id, 1) === null);

const cash = s.arcology.cash, fear = her.bond.fear, week = s.arcology.week;
const out = choose(s, x.id, 0)!;
check("a choice runs its effects", s.arcology.cash === cash - 2000 && her.bond.fear > fear, [s.arcology.cash, her.bond.fear, fear]);
check("people change, and it's recorded", x.cast[0].now === "caught, and furious" && x.cast[0].turns[0]?.text === "She stops pretending to comply." && x.cast[1].toward === -35);
check("facts are kept and paths close", x.facts.includes("The notes are written in Ilse's ink") && x.paths.find((p) => p.id === "bargain")?.state === "closed");
check("finishing an act moves the story on, two weeks out", x.act === 1 && x.due === week + 2 && !x.chapter && out.consequences.length > 2, out.consequences);
check("the history holds what you chose", x.history.length === 1 && x.history[0].chose === "Search the laundry");

s.arcology.week = x.due;
check("the next chapter is announced once", tickSagas(s, true).some((l) => /next chapter/.test(l)) && !tickSagas(s, true).some((l) => /next chapter/.test(l)));
await writeNext(s, x.id, fake([chapter()]));
check("the fact you learned unlocks an option", locked(s, x, x.chapter!.options[2]) === null);
choose(s, x.id, 2);
check("a new ending can open", x.paths.some((p) => p.id === "partner" && p.state === "open"));

x.act = 2;
s.arcology.week = x.due;
await writeNext(s, x.id, fake([chapter(true)]));
check("in the last act every option ends it", x.chapter!.options.every((o) => !!o.ends));
const own = await answerOwn(s, x.id, "I free her and give her the laundry to run", fake([{ option: { label: "Free her", outcome: "She takes the collar off herself.", effects: [{ rep: -100 }], ends: "lost" } }]));
check("your own answer is resolved and can end the story", own.ok && x.status === "ended" && x.ended?.path === "She wins" && x.paths.find((p) => p.id === "lost")?.state === "taken", x.ended);

const big = cleanOption(s, { label: "x", outcome: "y", effects: [{ cash: -1e12 }, { standing: 50 }, { treat: { name: "a", kind: "torture", size: 3 } }] })!;
check("effects are held to the game's scale", (big.effects![0] as { cash: number }).cash >= -Math.max(20000, s.arcology.cash * 0.6) && (big.effects![1] as { standing: number }).standing === 3 && big.effects!.length === 2, big.effects);

// A face in a running story isn't forgotten.
const t = newGame({ seed: "saga-b" });
sagasOf(t).list.push({ id: "q", seed: { id: "z", kind: "city", text: "" }, status: "running", title: "T", premise: "", stakes: "", acts: ["a", "b"], act: 0, cast: [{ name: "Oren Kade", face: "oren kade", role: "", want: "", fear: "", toward: 0, now: "", turns: [] }], facts: [], paths: [], history: [], due: 0, started: 0 });
t.faces = { "oren kade": { name: "Oren Kade", pronoun: "he", age: 40, first: 1, last: 1, seen: 1 } };
t.arcology.week = 60;
pruneFaces(t);
check("a face in a running story is kept", !!t.faces["oren kade"]);

// Sex is the engine: seeds from fetishes and customs, and effects that change bodies, tastes and the city.
{
  const u = newGame({ seed: "saga-c" });
  const p = Object.values(u.people).find((q) => q.status === "owned")!;
  p.persona.fetishes = [{ name: "humiliation", strength: 80, known: false }];
  const { cultureOf } = await import("../src/engine/culture.ts");
  cultureOf(u).norms.exposure = 60;
  const ids = seedsFor(u).map((x) => x.seed.id);
  check("a strong fetish seeds a story", ids.includes(`slave:${p.id}:fetish:humiliation`), ids);
  check("so does a city where public sex is ordinary", ids.some((i) => i.startsWith("custom:exposure:hi")), ids);
  check("so does the dress code", ids.some((i) => i.startsWith("dress:")), ids);

  const y: Saga = { id: "h", seed: { id: "h", kind: "desire" as const, text: "" }, status: "running" as const, title: "Heat", premise: "", stakes: "", acts: ["a", "b", "c"], act: 0,
    cast: [{ name: p.name, person: p.id, role: "", want: "", fear: "", toward: 0, now: "", turns: [] }], facts: [], paths: [], history: [], due: u.arcology.week, started: 0 };
  sagasOf(u).list.push(y);
  const o = cleanOption(u, { label: "Show her off on the concourse", outcome: "She comes in front of a crowd.",
    needs: [{ fetish: { name: p.name, fetish: "humiliation", at: 90 } }, { norm: { norm: "exposure", at: 70 } }],
    effects: [{ act: { name: p.name, act: "exposure", public: true } }, { fetish: { name: p.name, fetish: "humiliation", by: 15 } }, { fetish: { name: p.name, fetish: "masochist", by: 12 } }, { libido: { name: p.name, by: 8 } }, { norm: { norm: "exposure", by: 4 } }, { act: { name: p.name, act: "not-an-act" } }],
    develops: [{ name: p.name, desire: "to be watched by strangers", limit: "being touched by them", turn: "She asks to go back." }] })!;
  check("an unknown act is dropped", o.effects!.length === 5);
  y.chapter = { title: "t", text: "x", options: [o], week: u.arcology.week };
  check("her taste has to have gone far enough", /want it more/.test(locked(u, y, o) ?? ""), locked(u, y, o));
  p.persona.fetishes[0].strength = 95;
  check("and the city has to be there", /isn't there yet/.test(locked(u, y, o) ?? ""), locked(u, y, o));
  cultureOf(u).norms.exposure = 75;
  const lib = p.psyche.libido, acts = p.acts?.exposure ?? 0;
  const r = choose(u, "h", 0)!;
  check("the act is run by the intimacy engine", (p.acts?.exposure ?? 0) === acts + 1 && r.consequences.some((c) => /in public/.test(c)), [p.acts, r.consequences]);
  check("her taste deepens, and a new one wakes", p.persona.fetishes.find((f) => f.name === "humiliation")!.strength >= 105 && (p.persona.fetishes.find((f) => f.name === "masochist")?.strength ?? 0) === 12, p.persona.fetishes);
  check("her appetite grows", p.psyche.libido === Math.min(100, lib + 8));
  check("the city's customs move", cultureOf(u).norms.exposure === 79);
  check("and what she wants is written down", y.cast[0].desire === "to be watched by strangers" && y.cast[0].limit === "being touched by them");
}

/* ── changing what a story is about ────────────────────────────────────────────────────────── */
{
  const { rerollSaga, steerSaga, restartSaga, biblePrompt } = await import("../src/engine/saga.ts");
  const t = newGame({ seed: "saga-steer" });
  t.arcology.rep = 20000;
  writeLaw(t, { name: "Open Doors", text: "No slave's door may be locked.", push: [{ norm: "exposure", dir: 1 }], effects: [] });
  const girl = Object.values(t.people).find((p) => p.status === "owned")!;
  girl.bond.resentment = 80;
  sagasOf(t).next_start = t.arcology.week;
  tickSagas(t, true);
  const y = running(t)[0];
  const before = y.seed.id;
  const rolled = rerollSaga(t, y.id);
  check("a new story can draw something else to grow from", !rolled || (y.seed.id !== before && sagasOf(t).used.includes(y.seed.id)), [before, y.seed.id]);

  const idea = `${girl.name.split(" ")[0]} wants to run the Open Doors household on the ninth floor, and the neighbours' wives want her gone.`;
  check("the owner can write what it's about", steerSaga(t, y.id, idea) && y.seed.kind === "own" && y.seed.text === idea);
  check("and their people named in it are written in", !!y.seed.people?.includes(girl.id), y.seed.people);
  const prompt = biblePrompt(t, y);
  check("the narrator is told to build on the owner's idea", prompt.includes(idea) && /WHAT THE OWNER WANTS/.test(prompt) && !/WHAT IT GROWS FROM/.test(prompt));
  check("and it waits to be begun", y.status === "unwritten");

  // Written and one chapter in: starting over drops the chapters and keeps the idea.
  await writeNext(t, y.id, fake([{ ...bible, cast: [{ ...bible.cast[0], name: girl.name }, bible.cast[1]] }, chapter()]));
  choose(t, y.id, 0);
  check("the story ran a chapter", y.status === "running" && y.history.length === 1);
  check("a running story can be started over", restartSaga(t, y.id) && y.status === "unwritten" && !y.history.length && !y.title && y.seed.text === idea && y.restarts === 1);
  await writeNext(t, y.id, fake([{ ...bible, cast: [{ ...bible.cast[0], name: girl.name }, bible.cast[1]] }, chapter()]));
  check("or started over on a new idea", steerSaga(t, y.id, "A rival arcology's heiress arrives to buy the whole household.") && y.status === "unwritten" && y.seed.text.startsWith("A rival"));
}
