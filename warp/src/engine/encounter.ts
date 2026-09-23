/**
 * AFTER, AND IN BETWEEN.
 *
 * An act used to be the end of the exchange. Here it is the start of one: when it is over you get
 * a handful of things to do next — hold her, praise her, ask what she liked, mock her, make her
 * thank you — and each one does something small and real, and she answers.
 *
 * Talking is the other half. You can ask her about where she comes from, what she did before, how
 * she ended up here, what she wants, whether she is afraid of you. She answers out of her own
 * record, in her own register, and how much of the truth you get depends on how much she trusts
 * you. Some answers teach you things the panel did not know.
 */
import type { Person, SaveState } from "./types";
import type { ActOutcome } from "./intimacy";
import { applyTreatment, read, refresh } from "./obedience";
import { clamp, shove } from "./psyche";
import { remember, learn } from "./memory";
import { rng } from "./rng";
import { say, registerOf, type Register } from "./voice";
import { FETISH_BY_ID, HOLE_LABEL, type Hole } from "../data/intimacy";
import { bodyWords } from "./writer";

export interface Beat {
  /** What you did, as the player's line in the log. */
  you: string;
  /** Narration, if any. */
  text?: string;
  /** What she said. */
  said?: string;
  /** Anything the player learned. */
  learned?: string;
  /** The encounter is over. */
  ends?: boolean;
}

export interface Followup { id: string; label: string; tone?: "kind" | "cruel" }

export const FOLLOWUPS: Record<string, Followup> = {
  hold: { id: "hold", label: "Hold her", tone: "kind" },
  praise: { id: "praise", label: "Tell her she did well", tone: "kind" },
  liked: { id: "liked", label: "Ask what she liked" },
  comfort: { id: "comfort", label: "Tell her it's over", tone: "kind" },
  again: { id: "again", label: "Again" },
  thank: { id: "thank", label: "Make her thank you", tone: "cruel" },
  mock: { id: "mock", label: "Laugh at her", tone: "cruel" },
  dismiss: { id: "dismiss", label: "Send her off" },
};

/** Which follow-ups make sense after this. Four at most, ordered by how likely you are to want them. */
export function followupsFor(o: ActOutcome): Followup[] {
  const ids =
    o.landing === "hated" ? ["comfort", "thank", "mock", "dismiss"] :
    o.landing === "wanted" || o.finished ? ["hold", "liked", "again", "praise"] :
    o.act === "talk" ? ["hold", "dismiss"] :
    ["liked", "praise", "hold", "dismiss"];
  return ids.map((id) => FOLLOWUPS[id]);
}

function seed(s: SaveState, p: Person, what: string): string {
  return `beat:${p.id}:${what}:${s.turn}:${p.acts ? Object.values(p.acts).reduce((a, b) => a + b, 0) : 0}`;
}

/** What she would name if asked what she liked. Honest only if she trusts you enough to be. */
function whatSheLiked(p: Person): { liked?: string; learned?: string } {
  const r = read(p);
  if (r.trust < 5 && registerOf(p) !== "eager") return {};
  const top = [...p.persona.fetishes].filter((f) => f.name !== "none").sort((a, b) => b.strength - a.strength)[0];
  const phrases: Record<string, string> = {
    boobs: "your hands on my tits", buttslut: "when you're in my ass", cumslut: "tasting you",
    humiliation: "when people watch", submissive: "being told", dom: "being the one on top",
    masochist: "when it hurts a bit", sadist: "being mean to you", pregnancy: "thinking about being bred",
  };
  if (top && top.strength >= 30) {
    const learned = top.known ? undefined : `${p.name} is a ${FETISH_BY_ID[top.name]?.name ?? top.name}.`;
    top.known = true;
    return { liked: phrases[top.name] ?? "that", learned };
  }
  const hole = p.persona.preferred_hole;
  if (hole) {
    const learned = hole.known ? undefined : `${p.name} would rather you used ${HOLE_LABEL[hole.hole as Hole] ?? hole.hole}.`;
    hole.known = true;
    const said: Record<string, string> = { mouth: "using my mouth", vagina: "when you fuck me properly", anus: "my ass, honestly", boobs: "my tits", dick: "my cock" };
    return { liked: said[hole.hole] ?? "that", learned };
  }
  return { liked: "when you slowed down" };
}

export function runFollowup(s: SaveState, id: string, fid: string): Beat {
  const p = s.people[id];
  if (!p) return { you: "", ends: true };
  const r = rng(seed(s, p, fid));
  const week = s.arcology.week;
  const w = bodyWords(p);
  let out: Beat;
  switch (fid) {
    case "hold":
      applyTreatment(p, { kind: "kindness", size: 3, why: "held afterwards" }, week);
      shove(p.psyche, 0.6);
      out = { you: "You pull her in and hold her.", text: r.pick([`${p.name} is stiff at first, then relaxes against you.`, `${p.name} tucks her head under your chin.`, `${p.name} clings to you.`]), said: say(s, p, "hold", r) };
      break;
    case "praise":
      applyTreatment(p, { kind: "recognition", size: 2, why: "told she did well" }, week);
      out = { you: "You tell her she did well.", said: say(s, p, "praise", r) };
      break;
    case "liked": {
      const { liked, learned } = whatSheLiked(p);
      if (learned) remember(s.memory[p.id], { content: "she told you what she likes, and you listened", week, importance: 5, charge: "warm" });
      out = { you: "You ask her what she liked.", said: say(s, p, "liked", r, liked ? { liked: cap(liked) } : {}), learned };
      break;
    }
    case "comfort":
      applyTreatment(p, { kind: "kindness", size: 2, why: "told it was over" }, week);
      shove(p.psyche, 0.4);
      out = { you: "You tell her it's over.", text: r.pick([`${p.name} is relieved.`, `${p.name} nods.`]), said: r.chance(0.5) ? say(s, p, "hold", r) : undefined };
      break;
    case "thank":
      applyTreatment(p, { kind: "coercion", size: 2, why: "made to say thank you" }, week);
      out = { you: "You tell her to thank you for it.", said: say(s, p, "thank", r) };
      break;
    case "mock":
      applyTreatment(p, { kind: "cruelty", size: 2, why: "laughed at afterwards" }, week);
      shove(p.psyche, -0.5);
      out = { you: "You laugh at the state of her.", text: r.pick([`${p.name}'s face goes hot.`, `${p.name} pulls the sheet over ${w.tits}.`]), said: say(s, p, "mock", r) };
      break;
    case "dismiss":
      out = { you: "You send her off.", said: say(s, p, "dismiss", r), ends: true };
      break;
    default:
      out = { you: "", ends: true };
  }
  refresh(p, s.memory[p.id]);
  return out;
}

/* ── talking to her ─────────────────────────────────────────────────────────────────────────── */

export interface Topic { id: string; label: string }

export const TOPICS: Topic[] = [
  { id: "home", label: "Where are you from?" },
  { id: "before", label: "What did you do before?" },
  { id: "how", label: "How did you end up here?" },
  { id: "want", label: "What do you want?" },
  { id: "afraid", label: "Are you afraid of me?" },
  { id: "others", label: "What do the others say about me?" },
  { id: "secret", label: "Tell me something nobody knows." },
];

const CAREER_SAYS: Record<string, string> = {
  student: "I was at university. Second year. I had an exam the week they took me.",
  waitress: "I waited tables. Night shift, mostly. Drunks and regulars.",
  nurse: "I was a nurse. Twelve-hour shifts. I was good at it.",
  teacher: "I taught. Children, nine and ten. They'd have eaten you alive.",
  prostitute: "Same thing I do here. Worse pay. Worse rooms, if you can believe it.",
  escort: "Escort. The expensive kind. People like you bought me dinner first.",
  dancer: "I danced. Clubs, then a company for a year, then clubs again.",
  soldier: "Army. Six years. Don't ask me where.",
  "police officer": "I was police. Funny, isn't it.",
  farmer: "Farm. Goats, mostly. Up at four every day of my life.",
  housewife: "I kept a house. Had a husband. Had a garden.",
  "office worker": "Office. Spreadsheets. I used to think it was the worst job in the world.",
  musician: "Music. Cello. I'd give anything to hold one again.",
  athlete: "Track. Four hundred metres. I nearly went national.",
  criminal: "This and that. Nothing you'd put on a form.",
  servant: "Housekeeping. Big houses. I know how to be invisible.",
  engineer: "Structural engineer. Your east stairwell's going to crack, by the way.",
  model: "Modelling. Catalogues, a couple of campaigns. You've probably seen me on a bus.",
  gamer: "I streamed. People paid to watch me play games. Don't laugh.",
  nun: "I was in an order. I still pray, if you're wondering.",
};

const HOW_SAYS: Record<string, string> = {
  debt: "Somebody else's debt. My father's. They came for him and took me instead.",
  kidnapped: "I was walking home. That's it. That's the whole story. I was walking home.",
  "sold by family": "My family sold me. They signed. My aunt witnessed it.",
  volunteered: "I signed. I needed the money for someone. It's done now.",
  convict: "A court sent me. I did what they said I did, mostly.",
  war: "The city fell. Soldiers came through. Some of us were loaded onto trucks.",
  "born to it": "I was born in an arcology like this one. I've never been outside one.",
  bankruptcy: "My shop went under. The paper got sold, and I was on the paper.",
  trafficked: "Four men sold me before you. I remember every one of their faces.",
  "came with the arcology": "I came with the building. Like the plumbing.",
};

const VALUE_SAYS: Record<string, string> = {
  "not being lied to": "Just— don't lie to me. That's all I want.",
  "her own privacy": "A door that locks. From my side.",
  "being useful": "To be good at something here. To matter to how it runs.",
  "her family, wherever they are": "To know my family's alive. Just that.",
  "surviving": "To get through this alive.",
  "the people she came in with": "To know the girls I came in with are all right.",
  "not owing anyone": "To not owe anybody anything. Ever again.",
  "being good at something": "To be good at something. Anything.",
  "keeping her word": "I want you to keep your word. I keep mine.",
  "her own body": "My body back. Some of it. Some say in it.",
  "getting free someday": "To be free. Someday.",
};

const TEXTURE_SAYS: Record<string, string> = {
  "always feels cold": "I'm always cold. Always. Even in the spa.",
  "loves birds": "I love birds. I watch the gulls from the windows. There are eleven kinds on this coast.",
  "hums to herself": "I hum. When I think no one's around. You've probably heard.",
  "can't sleep with the door open": "I can't sleep with the door open. I never could.",
  "hates heights": "I hate heights. I don't go near the windows up here.",
  "reads anything she can get": "I've read every manual in the service corridor. Twice.",
  "afraid of elevators": "I take the stairs because the elevators scare me.",
  "good with her hands": "I fixed the dormitory heater last week. Nobody even noticed.",
  "sings badly and often": "I sing. Badly. In the shower. The others hate it.",
  "likes plants": "I've got a plant. A cutting from the atrium. Don't tell anyone.",
};

function hedge(reg: Register, truth: string, r: ReturnType<typeof rng>): string {
  switch (reg) {
    case "timid": return r.pick([`…${truth}`, `I— ${lower(truth)}`, `${truth} Sorry.`]);
    case "sullen": return r.pick([`${truth} Happy?`, `Why do you care. …${truth}`, truth]);
    case "hollow": return truth.split(/(?<=[.!?])\s/)[0];
    case "bratty": return r.pick([`${truth} Don't make it weird.`, `Oh, we're doing this? Fine. ${truth}`]);
    case "crude": return r.pick([`${truth} So.`, `Christ. ${truth}`]);
    case "commanding": return r.pick([`${truth} Now you know. Don't waste it.`, truth]);
    case "eager": return r.pick([`${truth} Why, do you want to know me?`, truth]);
    default: return truth;
  }
}

function deflect(reg: Register, r: ReturnType<typeof rng>): string {
  return r.pick({
    timid: ["I don't— I'd rather not. Sorry.", "Does it matter?", "Nowhere. Nothing. It doesn't matter."],
    sullen: ["None of your business.", "Why would I tell you that?", "Ask someone who likes you."],
    hollow: ["Whatever you want it to be.", "It doesn't matter now."],
    proper: ["I'd prefer not to go into it.", "That's rather personal.", "Another time, perhaps."],
    warm: ["Ask me another time.", "Not tonight, okay?"],
    eager: ["Later. Kiss me first.", "Does it matter?"],
    bratty: ["Earn it.", "Wouldn't you like to know."],
    crude: ["Piss off.", "Buy me a drink first."],
    commanding: ["You haven't earned that.", "When I'm ready."],
  }[reg]);
}

const lower = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Ask her something. Truth depends on trust; asking costs nothing and moves a little. */
export function talk(s: SaveState, id: string, topic: string): Beat {
  const p = s.people[id];
  if (!p) return { you: "", ends: true };
  const r = rng(`talk:${p.id}:${topic}:${s.turn}:${p.counters.talks ?? 0}`);
  p.counters.talks = (p.counters.talks ?? 0) + 1;
  const reg = registerOf(p);
  const rd = read(p);
  const t = TOPICS.find((x) => x.id === topic);
  const you = t?.label ?? "You ask her something.";
  const week = s.arcology.week;
  const opens = rd.trust > -15 || reg === "hollow" || reg === "eager";
  let said: string;
  let learned: string | undefined;

  switch (topic) {
    case "home":
      // Where she is from and what she used to do cost her nothing to say, so almost anyone says it.
      said = opens || reg !== "sullen" || r.chance(0.5) ? hedge(reg, `${p.origin.nationality === "American" ? "The States" : p.origin.nationality}. ${r.pick(["I miss the food.", "I don't think about it.", "It's a long way from here.", "I had a street I liked."])}`, r) : deflect(reg, r);
      break;
    case "before":
      said = opens || reg !== "sullen" || r.chance(0.5) ? hedge(reg, CAREER_SAYS[p.origin.career] ?? `I was a ${p.origin.career}.`, r) : deflect(reg, r);
      break;
    case "how":
      said = rd.trust > 5 || reg === "hollow" ? hedge(reg, HOW_SAYS[p.origin.acquired_how] ?? "It's a long story.", r) : deflect(reg, r);
      if (said && rd.trust > 5) remember(s.memory[p.id], { content: "you asked how she got here, and listened to the answer", week, importance: 5, charge: "warm" });
      break;
    case "want": {
      const v = p.persona.values[0];
      if (rd.trust > 20 && v) {
        said = hedge(reg, VALUE_SAYS[v] ?? `${cap(v)}.`, r);
        learned = `${p.name} cares about ${v}.`;
      } else said = rd.trust > 0 ? hedge(reg, r.pick(["To not be tired all the time.", "A day off.", "Nothing you can give me."]), r) : deflect(reg, r);
      break;
    }
    case "afraid": {
      const afraid = p.bond.fear > 35 || rd.fragility > 0.5;
      const honest = rd.trust > 25 || reg === "bratty" || reg === "crude" || reg === "commanding";
      said = afraid
        ? honest ? hedge(reg, r.pick(["Yes. Obviously.", "Yes. Every time the door opens.", "Some days. Today, a bit."]), r) : r.pick(["No, {you}.", "Of course not."]).replace("{you}", s.player.address || "Master")
        : hedge(reg, r.pick(["No. Should I be?", "Not any more.", "Not of you."]), r);
      if (afraid && honest) learned = `${p.name} admitted she's afraid of you.`;
      break;
    }
    case "others": {
      const hr = s.player.household_read?.label ?? "hard to read";
      const rumour = s.rumors.filter((x) => x.knowers.includes(p.id) && x.about !== p.id).sort((a, b) => b.salience - a.salience)[0];
      said = rd.trust > 10
        ? hedge(reg, `They say you're ${hr}.${rumour ? ` And— ${lower(rumour.content)}.` : ""}`, r)
        : deflect(reg, r);
      if (rumour && rd.trust > 10) learned = `The household is saying: ${rumour.content}.`;
      break;
    }
    case "secret": {
      const tex = p.persona.texture[r.int(0, Math.max(0, p.persona.texture.length - 1))];
      if (rd.trust > 30 && tex) {
        said = hedge(reg, TEXTURE_SAYS[tex] ?? `I ${tex}.`, r);
        learned = `${p.name}: ${tex}.`;
        applyTreatment(p, { kind: "recognition", size: 2, why: "told you something private and you kept it" }, week);
      } else said = deflect(reg, r);
      break;
    }
    default:
      said = say(s, p, "talk_open", r);
  }
  if (learned) learn(s.memory[p.id], `told the owner: ${learned}`, week);
  // Being asked about yourself is a small kindness, at any trust.
  p.bond.bond = clamp(p.bond.bond + (rd.trust > 0 ? 0.8 : 0.3), -100, 100);
  p.bond.weeks_since_kindness = Math.min(p.bond.weeks_since_kindness, 1);
  refresh(p, s.memory[p.id]);
  return { you, said, learned };
}
