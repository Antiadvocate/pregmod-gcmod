/**
 * HOW SHE TALKS, IN NUMBERS — a household rolls apart, the same woman rolls the same, fear bends
 * the numbers without rewriting them, and a reply that came out in someone else's rhythm is named.
 */
import { check } from "./harness.ts";

const store: Record<string, string> = {};
const g = globalThis as unknown as Record<string, unknown>;
if (!("localStorage" in g)) g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
if (!("location" in g)) g.location = { origin: "http://test" };
const { newGame } = await import("../src/engine/state.ts");
const { dialsOf, liveDials, speechLine, measure, driftLine, spoken } = await import("../src/engine/speech.ts");

const s = newGame({ seed: "speech", starting_slaves: 10 } as never);
const women = Object.values(s.people).filter((p) => p.status === "owned");
const ds = women.map(dialsOf);
const sd = (xs: number[]) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length; return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length); };
check("a household doesn't all talk at one length", sd(ds.map((d) => d.words)) > 8, ds.map((d) => d.words));
check("or in one sentence length", sd(ds.map((d) => d.sentence)) > 2, ds.map((d) => d.sentence));
check("or swear the same", sd(ds.map((d) => d.swearing)) > 0.4, ds.map((d) => d.swearing));
check("some clam up when scared and some babble", new Set(ds.map((d) => d.stress)).size === 2, ds.map((d) => d.stress));

const her = women[0];
const again = JSON.parse(JSON.stringify(her));
delete again.persona.speech; delete again.persona.temperament;
check("the same woman rolls the same voice", JSON.stringify(dialsOf(again)) === JSON.stringify(dialsOf(her)));

const calm = { ...liveDials(her) };
her.psyche.relaxation = -8;
const scared = liveDials(her);
check("fear raises her fumbling", scared.fumble > calm.fumble, [calm.fumble, scared.fumble]);
check("and changes how much comes out, the way she goes", dialsOf(her).stress === "clams" ? scared.words < calm.words : scared.words > calm.words, [dialsOf(her).stress, calm.words, scared.words]);
check("without rewriting who she is", dialsOf(her).words === ds[0].words);
check("the scared line says so", /Scared, she (clams up|babbles)/.test(speechLine(her)));
her.psyche.relaxation = 0;

const m = measure(["I— I don't know, Master.", "It was the laundry, fuck, the laundry again and I lost track of the time completely."]);
check("speech is measured", m.lines === 2 && m.words === 21 && m.fumble === 0.5 && m.swearing === 4.8, m);
check("quotes are found in prose and not in the options", spoken('She looks up. "Yes," she says.\n\nOPTIONS:\n- "Say it again"').length === 1);

her.persona.speech = { ...dialsOf(her), sentence: 18, words: 60, fumble: 0.4, swearing: 0 };
const clipped = driftLine(her, ["Lagos.", "Small flat.", "Stripped.", "Same job."]);
check("a clipped reply from a woman who runs on is named", /CAME OUT WRONG/.test(clipped) && /sentences came out at/.test(clipped), clipped);
check("a reply in her own rhythm isn't", driftLine(her, ["I grew up in Lagos, in a flat over a tailor's shop, and my mother sold cloth downstairs all day.", "The power went off so much — so much — that I did my homework on the stairs because the stairwell had a window, and that's where I learned to read properly."]) === "");

/* ── she knows who she's talking to ─────────────────────────────────────────────────────────── */
const { personCard } = await import("../src/engine/prompts.ts");
const { ownerScale } = await import("../src/engine/self.ts");
const fresh = women[1];
const card = personCard(s, fresh, "");
check("a slave with no money is told she has none", /HER MONEY\. She has none/.test(card));
check("one you've never talked to doesn't know you", /HOW WELL SHE KNOWS YOU\. Hardly at all/.test(card));
s.arcology.cash = 15e12;
const big = ownerScale(s);
check("a trillionaire is written as one", /¤15\.0 trillion/.test(big) && /richer than most countries/.test(big) && /kitchens and staff/.test(big), big);
s.arcology.cash = 50_000;
check("a broke owner isn't", /scraping by/.test(ownerScale(s)) && !/kitchens and staff/.test(ownerScale(s)), ownerScale(s));
