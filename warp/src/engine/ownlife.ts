/**
 * HER OWN LIFE.
 *
 * A woman in the house had a job, a body, a record of everything done to her and a voice, and
 * nothing of her own: no hobby, nothing she was working at, nothing she wanted past the next scene.
 * So every conversation was about whatever had happened to her lately (Océane counted the days
 * since a surgery that was over), because there was nothing else on her card to talk about.
 *
 * Now each woman has two or three things she does with her own time, from her life before and her
 * nature (the teacher drilling a kitchen girl's handwriting, the farmer with seedlings in a cup under
 * the bathroom light), and one or two things she wants in the long run. The model writes them when
 * she's fleshed out (engine/forge) and again when she's re-read (engine/growth); until then, and with
 * no model, they come from her career here, so a woman in an old save has them too.
 */
import type { Person } from "./types";
import { rng, type Rng } from "./rng";

const BY_CAREER: Record<string, { does: string[]; wants: string[] }> = {
  student: { does: ["keeps a notebook of words in the languages she hears around the house", "does the puzzles in any paper she can get hold of"], wants: ["to finish her degree someday"] },
  waitress: { does: ["reorganises the kitchen when nobody's looking", "watches people from the window and makes up lives for them"], wants: ["to run a little café of her own one day"] },
  nurse: { does: ["keeps a first-aid kit she put together herself and patches up the other girls", "reads any medical book she can get"], wants: ["to work in a real clinic again"] },
  teacher: { does: ["has started teaching one of the other girls to read and write", "keeps a notebook of lessons she means to teach someday"], wants: ["to teach again, even if it's only the other girls"] },
  prostitute: { does: ["does the other girls' makeup, and she's good at it", "plays cards for sweets and cheats a little"], wants: ["to be paid what she's worth, for once"] },
  escort: { does: ["follows the arcology's society gossip like it's a sport", "picks up languages from the people she meets"], wants: ["to be kept by someone rich and important"] },
  dancer: { does: ["runs through her old routines every morning wherever there's floor", "makes up little dances to whatever music is on"], wants: ["to dance in front of a real audience again"] },
  soldier: { does: ["does push-ups and runs the stairs whenever she's allowed", "takes things apart and puts them back together"], wants: ["to get out, one way or another"] },
  "police officer": { does: ["reads crime novels and works out who did it before the end", "watches people and notices more than she lets on"], wants: ["to see the people who sold her pay for it"] },
  farmer: { does: ["keeps seedlings growing in a cup under whatever light she can find", "fixes anything with a hinge or a motor"], wants: ["to have a patch of real earth to grow things in"] },
  housewife: { does: ["cooks for the other girls whenever she's let into the kitchen", "mends everyone's clothes"], wants: ["to have a home that feels like hers again"] },
  "office worker": { does: ["keeps lists and schedules for everything, including things nobody asked for", "does crosswords"], wants: ["to run something properly, an office or a floor"] },
  musician: { does: ["writes songs in her head and taps the rhythms out on anything", "has been teaching herself on a borrowed instrument"], wants: ["to play for an audience again"] },
  athlete: { does: ["trains in her room: sit-ups, stretches, sprints down the corridor", "follows the pit fights and the arcology's sports results"], wants: ["to compete again, and win"] },
  criminal: { does: ["plays cards and dice, and usually wins", "has been learning how every lock in the building works"], wants: ["to get rich, one way or another"] },
  servant: { does: ["polishes and arranges things until they're right", "knows everyone's business in the house"], wants: ["to run the household one day"] },
  engineer: { does: ["fixes broken things around the house: a lamp, a radio, a door that sticks", "sketches machines and buildings in the margins of anything"], wants: ["to build something in the arcology that lasts"] },
  model: { does: ["spends hours on her hair, skin and nails, and on everyone else's", "keeps up with fashion from whatever she can see"], wants: ["to be famous in the arcology"] },
  gamer: { does: ["plays anything with a screen she can get her hands on", "invents games for the other girls"], wants: ["to get back online and find her old friends"] },
  nun: { does: ["prays at set hours and keeps the saints' days", "sings hymns under her breath while she works"], wants: ["to keep her faith whatever is done to her"] },
};

const DOES = [
  "draws on whatever scraps of paper she can find", "reads anything she can get", "sings when she thinks she's alone",
  "keeps a diary hidden in her room", "looks after a plant on her windowsill", "braids the other girls' hair",
  "works out in her room", "writes letters she has nowhere to send", "is learning another girl's language from her",
  "sews and alters her own clothes", "does yoga in the mornings", "plays cards with whoever will play",
  "collects small things: buttons, ribbons, bottle caps", "cooks when she gets the chance", "watches the city from the highest window she can get to",
];

const WANTS = [
  "to be free someday", "to find out what happened to her family", "to be so good at something that she can't be done without",
  "to see the sea again", "to have a room of her own with a window", "to never be sold", "to have a child and keep it",
  "to go home", "to matter to someone here",
];

const VALUE_WANTS: [RegExp, string][] = [
  [/free/, "to be free someday"],
  [/family/, "to find out what happened to her family"],
  [/useful|good at/, "to be so good at something that she can't be done without"],
  [/privacy/, "to have a room of her own with a door that locks"],
  [/owing/, "to owe nobody anything"],
];

/** Fill in what she does with her time and what she wants, if nothing has written them yet. */
export function seedOwnLife(p: Person, r: Rng = rng(`ownlife:${p.id}`)): void {
  const career = BY_CAREER[p.origin.career?.toLowerCase() ?? ""];
  if (!p.persona.interests?.length) {
    const mine = career ? r.shuffle([...career.does]).slice(0, r.chance(0.5) ? 2 : 1) : [];
    const more = r.shuffle(DOES.filter((x) => !mine.includes(x))).slice(0, Math.max(0, 2 - mine.length));
    p.persona.interests = [...mine, ...more];
  }
  if (!p.persona.goals?.length) {
    const fromValues = (p.persona.values ?? []).map((v) => VALUE_WANTS.find(([re]) => re.test(v))?.[1]).filter((x): x is string => !!x);
    const first = career && r.chance(0.6) ? career.wants[0] : fromValues[0] ?? r.pick(WANTS);
    const second = [...fromValues, ...r.shuffle([...WANTS])].find((x) => x !== first);
    p.persona.goals = r.chance(0.5) && second ? [first, second] : [first];
  }
}

/** Her own life on her card: not a script, things that can come up. */
export function ownLifeLines(p: Person): string[] {
  const out: string[] = [];
  const does = p.persona.interests ?? [];
  const wants = p.persona.goals ?? [];
  if (does.length) out.push(`HER OWN TIME (what she does when she isn't working or with you; she can be in the middle of it, mention it, or ask for time or things for it): ${does.join("; ")}.`);
  if (wants.length) out.push(`WHAT SHE WANTS FOR HERSELF IN THE LONG RUN (it colours what she hopes for and asks for; she rarely says it outright): ${wants.join("; ")}.`);
  return out;
}

/** Tidy what a model wrote: a few short plain lines. */
export function cleanList(xs: unknown, k: number, n = 140): string[] {
  return (Array.isArray(xs) ? xs : []).map((x) => String(x ?? "").replace(/\s+/g, " ").trim().slice(0, n)).filter(Boolean).slice(0, k);
}
