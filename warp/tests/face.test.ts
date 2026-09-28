import { check } from "./harness.ts";
import { generatePerson } from "../src/engine/generate.ts";
import { MOODS, moodFromText, moodFor, moodIn, moodOf, mouthPaths, MOUTH_BOX, blend, blinkAt, speakerOf, PLURAL, type Mood } from "../src/lib/face.ts";

check("a line names its mood", moodFromText("She smiles at that, slowly.") === "happy");
check("the last feeling named wins", moodFromText("She laughs, then her face falls and she looks away.") === "shy", moodFromText("She laughs, then her face falls and she looks away."));
check("tears are crying", moodFromText("Her shoulders shake and she sobs into her hands.") === "crying");
check("a glare is anger", moodFromText("She glares at you.") === "angry");
check("nothing named, nothing guessed", moodFromText("She hands you the tablet.") === undefined);

const p = generatePerson({ seed: "face-a", sex: "female", age: 25 });
p.psyche.state = "intact"; p.psyche.arousal = 0; p.psyche.relaxation = 2; p.bond.fear = 0; p.bond.resentment = 0; p.bond.read.devotion = 0;
check("a calm woman is neutral", moodOf(p) === "neutral", moodOf(p));
p.bond.fear = 80;
check("a frightened one looks afraid", moodOf(p) === "afraid");
check("words beat her state", moodFor(p, "She grins.") === "happy");
p.psyche.state = "broken";
check("a broken one looks blank", moodOf(p) === "blank");

const a = generatePerson({ seed: "face-b", sex: "female", age: 30 });
const b = generatePerson({ seed: "face-c", sex: "female", age: 31 });
a.name = "Mira Voss"; b.name = "Lena Ortiz";
const text = "Mira glares at the floor. Lena giggles behind her hand.";
check("in a group each face reads its own sentences", moodIn(a, text) === "angry" && moodIn(b, text) === "laugh", [moodIn(a, text), moodIn(b, text)]);
check("the speaker is the one named last", speakerOf([a, b], text) === 1);
check("a crowd is plural", PLURAL.test("A delegation of residents waits in the atrium") && !PLURAL.test("A woman waits in the atrium"));

for (const [mood, f] of Object.entries(MOODS) as [Mood, typeof MOODS.neutral][]) {
  const d = mouthPaths(MOUTH_BOX, f.mouth);
  const nums = `${d.upper} ${d.lower} ${d.gap}`.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const inside = nums.every((v) => Number.isFinite(v) && v > 140 && v < 320);
  if (!inside) check(`the ${mood} mouth stays on her face`, false, nums);
}
check("every mouth stays on her face", true);
const smile = mouthPaths(MOUTH_BOX, MOODS.happy.mouth), frown = mouthPaths(MOUTH_BOX, MOODS.sad.mouth);
const cornerY = (d: string) => Number(d.match(/^M[\d.]+ ([\d.]+)/)![1]);
check("a smile lifts the corners and a frown drops them", cornerY(smile.line) < cornerY(frown.line), [cornerY(smile.line), cornerY(frown.line)]);
check("a closed mouth shows no teeth, a laugh does", !mouthPaths(MOUTH_BOX, MOODS.neutral.mouth).teeth && !!mouthPaths(MOUTH_BOX, MOODS.laugh.mouth).teeth);
const half = blend(MOODS.neutral, MOODS.surprised, 0.5);
check("halfway between moods is halfway", Math.abs(half.eyes.open - (1 + 1.25) / 2) < 1e-9);
const shut = Array.from({ length: 12000 }, (_, i) => blinkAt(i, 1234)).filter((v) => v < 0.5).length;
check("she blinks, briefly, a few times in twelve seconds", shut > 50 && shut < 600, shut);
