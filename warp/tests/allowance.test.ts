/**
 * HER OWN MONEY: an allowance the owner names in a scene is paid every week out of the arcology's
 * cash into her purse, she spends some of it, the scenes know what she has, and a kink about being
 * paid reads as how she is all day, not only in bed.
 */
import { check } from "./harness.ts";
import { newGame, sanitize } from "../src/engine/state.ts";
import { endWeek } from "../src/engine/week.ts";
import { personCard } from "../src/engine/prompts.ts";
import { applyDiff } from "../src/engine/turn.ts";
import { refresh } from "../src/engine/obedience.ts";
import { allowanceOf, captureAllowance, moneyIn, purseOf, readAllowance, setAllowance } from "../src/engine/allowance.ts";

check("money is read the way people say it", moneyIn("100k") === 100000 && moneyIn("¤1.5m") === 1500000 && moneyIn("100,000") === 100000 && moneyIn("fifty thousand") === 50000);
check("a weekly stipend is heard", readAllowance("Now I also want to give you a stipend. Maybe 100k a week?")?.amount === 100000);
check("and so is stopping it", readAllowance("I'm going to stop your allowance.")?.amount === 0);
check("but a price isn't an allowance", readAllowance("That dress cost 100k.") === null);

{
  const s = newGame({ seed: "purse", starting_slaves: 2 } as never);
  const [her, other] = Object.values(s.people).filter((p) => p.status === "owned");
  check("saying it to one woman sets hers", !!captureAllowance(s, "I'll give you an allowance of 100k a week.", [her]) && allowanceOf(her) === 100000);
  check("said to two, it lands on nobody", !captureAllowance(s, "I'll pay you 5k a week.", [her, other]) && !allowanceOf(other));
  s.arcology.cash = 1_000_000;
  const before = s.arcology.cash;
  endWeek(s);
  check("it's paid out of the arcology's cash", s.arcology.cash <= before - 100000 + 1_000_000 && (s.reports.at(-1)?.ledger ?? []).some((l: { category: string; cash: number }) => l.category === "allowance" && l.cash === -100000), s.reports.at(-1)?.ledger);
  check("into her own purse, some of it maybe spent", purseOf(her) > 0 && purseOf(her) <= 100000, purseOf(her));
  check("and her card says what she has and that it's hers", /HER MONEY\. The owner pays her an allowance of ¤100,000 a week, hers to spend/.test(personCard(s, her, "")));
  const had = purseOf(her);
  applyDiff(s, { spent: [{ id: her.id, amount: 2500, what: "a dress" }] } as never, "", "");
  check("what she buys in a scene comes out of it", purseOf(her) === Math.max(0, had - 2500), [had, purseOf(her)]);
  setAllowance(her, 0);
  check("stopping it keeps a 0, so old promises don't restart it", her.allowance === 0 && !allowanceOf(her));

  // A save from before: the promise is only in her memory.
  delete other.allowance;
  s.memory[other.id].facts.push({ text: "The owner is paying her 100k a week and wants her to stay around.", week: s.arcology.week - 3 });
  const cash = s.arcology.cash;
  sanitize(s);
  check("an old save's promise becomes a real allowance", allowanceOf(other) === 100000, other.allowance);
  check("with the weeks she was owed paid in", purseOf(other) === 300000 && s.arcology.cash === cash - 300000, [purseOf(other), cash - s.arcology.cash]);

  // Findom: how she is all day, written as such, and the money is part of it.
  other.persona.fetishes = [{ name: "findom", strength: 93, known: true }];
  other.persona.behavior = { quirk: "Findom" } as never;
  const card = personCard(s, other, "");
  check("a strong kink is loved, not just liked", /HER FETISH: findom, and she loves it/.test(card));
  check("findom reads as day to day, not only bed", /HER FETISH: findom[^\n]*Day to day as much as in bed/.test(card));
  check("a quirk written in by hand says what it means", /HER WAY: Findom\. This is how she is day to day[^\n]*wetter than anything/.test(card));
  check("and being paid is her kink on the money line too", /HER MONEY[^\n]*Being paid is her kink/.test(card));
  check("but she never says that's why", /HER MONEY[^\n]*She never says that's why/.test(card) && !/brings it up in ordinary conversation/.test(card));
  check("and her nature is for showing, not saying", /HER NATURE, below, is for you to show[^\n]*never names it/.test(card));
}

// Her kinks as who she is, and how far they reach you: strength against ease, fear and room.
{
  const { natureLines, reachOf } = await import("../src/engine/nature.ts");
  const { setLatitude } = await import("../src/engine/self.ts");
  const s = newGame({ seed: "nature", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  her.persona.fetishes = [{ name: "dom", strength: 70, known: true }];
  her.persona.paraphilia = "abusive" as never;
  her.persona.quirk = undefined; her.persona.flaw = undefined;
  const tight = () => { her.bond.fear = 80; her.psyche.relaxation = -6; };
  const easy = () => { her.bond.fear = 10; her.psyche.relaxation = 6; her.bond.bond = 95; her.bond.hope = 90; };
  tight();
  const lines = natureLines(s, her);
  check("a kink is written as who she is, all day", lines.some((l) => /HER NATURE \(dom\)\. It shows all day, not just in bed\. She's bossy by nature/.test(l)), lines);
  check("a paraphilia is who she is", lines.some((l) => /HER NATURE \(abusive, a need\)\. It's who she is, all day/.test(l)));
  check("afraid of you, she buries it around you", reachOf(s, her, 100) === "held" && lines.some((l) => /Around you she buries it/.test(l)));
  her.bond.fear = 30; her.psyche.relaxation = 3; her.bond.bond = 80; her.bond.hope = 80;
  refresh(her, s.memory[her.id]);
  check("comfortable, a strong one slips out on you, and she backs off", reachOf(s, her, 70) === "slips" && natureLines(s, her).some((l) => /HER NATURE \(dom\)[^\n]*slips out on you before she thinks[^\n]*backs off at once/.test(l)), natureLines(s, her));
  check("a weak one stays in its place", reachOf(s, her, 40) === "kept");
  easy(); refresh(her, s.memory[her.id]);
  const r = reachOf(s, her, 100);
  check("very strong, relaxed, trusting and unafraid, she just does it", r === "takes" && natureLines(s, her).some((l) => /abusive, a need[^\n]*With you, she does it without asking, like shoving you down/.test(l)), [r, her.bond]);
  her.bond.fear = 30; her.psyche.relaxation = 3;
  setLatitude(s, her, "free");
  check("with room given, a slip isn't something she backs off from", natureLines(s, her).some((l) => /HER NATURE \(dom\)[^\n]*she doesn't back off/.test(l)));
  check("and her card carries it", /HER NATURE \(dom\)/.test(personCard(s, her, "")));
}

// What a scene leaves behind: analysis never makes it onto her card, and old saves lose theirs.
{
  const { addWays, waysBrief } = await import("../src/engine/ways.ts");
  const s = newGame({ seed: "records", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  const kept = addWays(s, her, ["When she names a price he pays it or he says no plainly, and neither of them pretends the money was a favour", "he kneels and kisses each of her toes before she'll talk to him"]);
  check("a way written as analysis isn't kept", kept.length === 1 && /kisses each of her toes/.test(kept[0]), kept);
  her.ways = [...(her.ways ?? []), { text: "being paid is not the same as being kept, and neither of them pretends otherwise", week: 1 }];
  check("nor shown, if an old save has one", !/not the same as/.test(waysBrief(her)));
  sanitize(s);
  check("and loading clears it out", !(her.ways ?? []).some((w) => /not the same as/.test(w.text)));
}


// Keyholder means the whole dynamic: the cage and the key, denial and ruined release, teasing and
// hurting through the cage, and other men while he's locked.
{
  const s = newGame({ seed: "keyholder", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  her.persona.fetishes = [{ name: "keyholder", strength: 85, known: true }];
  her.persona.paraphilia = undefined; her.persona.quirk = undefined; her.persona.flaw = undefined;
  const card = personCard(s, her, "");
  check("a keyholder's card has the cage, the key and the denial", /HER FETISH: keyholder[^\n]*only key on a chain[^\n]*ruins it/.test(card));
  check("and the cuckolding that goes with it", /HER FETISH: keyholder[^\n]*other men while he's locked[^\n]*clean up/.test(card));
  check("and it's who she is outside bed too", /HER NATURE \(keyholder\)[^\n]*key on her neck/.test(card));
}

// What's locked and what isn't, her breasts as something to use, and a cold conscience.
{
  const { chastityLines } = await import("../src/engine/genitals.ts");
  const { breastsLine, conscienceLine } = await import("../src/engine/prompts.ts");
  const s = newGame({ seed: "body facts", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  her.body.dick = 4; her.body.vagina = 2;
  her.chastity = { vagina: false, anus: true, penis: false };
  const lock = chastityLines(her).join(" ");
  check("an anal shield is an anal shield, not a cock cage", /anal shield[^.]*covers her ass/.test(lock) && !/cock is locked/.test(lock), lock);
  check("and what isn't locked is said to be free", /What's NOT locked, and free to use: her cock, which is NOT caged, so she can get hard and come, and her pussy\./.test(lock), lock);
  check("and her card carries it", /CHASTITY, which is a fact\. A locked anal shield/.test(personCard(s, her, "")));
  her.body.nipples = "fuckable"; her.body.lactation = 2;
  check("fuckable nipples and milk are on her card as things to use", /BREASTS, which is a fact\. Her nipples are fuckable[^\n]*lactating heavily[^\n]*milked/.test(personCard(s, her, "")), breastsLine(her));
  her.persona.conscience = 0.15;
  check("a low conscience shows as coldness", /CONSCIENCE, which is low[^\n]*without guilt/.test(personCard(s, her, "")), conscienceLine(her));
}

// A young abusive woman whose old voice says "careful, never slang" under the player's "valley girl":
// the player's words win, she sounds her age, the meek forge samples go, and her romance and a
// request to be forced come out as her nature, not as tears or a talk about consent.
{
  const { claimSpeech } = await import("../src/engine/voice.ts");
  const { PLAIN_RULES } = await import("../src/engine/style.ts");
  const s = newGame({ seed: "young voice", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  her.age = 19;
  her.persona.speech_pattern = "Valley girl like, and talks in typical 18 year old lingo and language";
  delete her.persona.speech_own;
  her.persona.voice = { diction: "Plain, careful English.", rhythm: "Slow and deliberate.", tics: [], never_says: ["Uses slang or filler words like 'like'."], agenda: "", example_lines: ["Upset: 'Yes, Master. I understand, Master.'"] } as never;
  her.persona.exchanges = [{ you: "Come here.", her: "Yes, Master. (she stops an arm's length away)" }];
  claimSpeech(her);
  const card = () => personCard(s, her, "");
  check("the player's speech wins over a forge voice that bans it", !!her.persona.speech_own && !/careful|PHRASES SHE NEVER USES/.test(card()), card().match(/SPEECH STYLE[^\n]*/)?.[0]);
  const keep = { ...her.persona, speech_pattern: "stiffly polite", speech_own: undefined, voice: { diction: "Plain, careful English.", never_says: ["slang"] } } as never;
  const other = { ...her, persona: keep } as typeof her;
  claimSpeech(other);
  check("but a forge pattern that agrees with its voice is left alone", !other.persona.speech_own);
  check("a 19-year-old is told to sound 19", /HER AGE IN HER MOUTH\. She's 19, and she sounds it/.test(card()));
  her.age = 34;
  check("and a grown woman isn't", !/HER AGE IN HER MOUTH/.test(card()));
  her.age = 19;
  her.persona.exchanges = [{ you: "Come here.", her: "Yes, Master. (she stops an arm's length away)" }];
  her.persona.paraphilia = undefined; her.persona.fetishes = [];
  check("a meek woman keeps her meek samples", /SAMPLE EXCHANGE/.test(card()));
  her.persona.paraphilia = "abusive";
  her.persona.quirk = { id: "romantic", known: true } as never;
  her.bond.fear = 5; her.psyche.relaxation = 6; her.rules_exempt = true;
  refresh(her, s.memory[her.id]);
  her.bond.read = { devotion: 80, trust: 95, label: "devoted" } as never;
  const c = card();
  check("an abusive woman on top loses the forge's meek samples", !/SAMPLE EXCHANGE/.test(c), c.match(/HER NATURE \(abusive[^\n]*/)?.[0]);
  check("her romance comes out as possession, not tears", /HER NATURE \(romantic\)[^\n]*possession[^\n]*doesn't make her soft, tearful or kneeling/.test(c));
  check("asked to force him, she takes it without a talk about how he asked", /IF HE ASKS FOR IT\.[^\n]*rape him[^\n]*She doesn't make him ask properly/.test(c));
  check("and no one in any scene negotiates consent", /NOBODY TALKS ABOUT CONSENT/.test(PLAIN_RULES) && /ask me properly/.test(PLAIN_RULES));
}
