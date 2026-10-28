/**
 * WHAT FITS WHERE — and what it costs when it doesn't.
 *
 * A thirty-centimetre cock went into a virgin's pussy and the narrator wrote it like a key in a
 * lock. Nothing in the game knew the two sizes were in the same scene. The original at least
 * stretched holes: a loose-enough hole fucked by a cock much bigger than it got looser, by chance,
 * weighed hole against cock, and virginity was taken, not just noted. This goes further, because
 * bodies do:
 *
 *   · A hole has a size it takes comfortably (vagina by how loose she is; ass tighter; throat by
 *     how practised she is). A cock is measured against it: it fits, it's snug, it's a struggle,
 *     or it doesn't fit without damage.
 *   · Too big hurts, and it stretches her. The stretch is permanent (the original's rule, kept).
 *     Forced well past what she can take, it tears her: a real injury, health lost, weeks to heal,
 *     faster in the clinic. Surgery tightens her again, which is what the theatre is for.
 *   · Afterwards she's sore for a few days, and sore makes the next time worse.
 *   · A size queen or a painslut takes it differently; everyone else feels it.
 *
 * The narrator is told the fit as fact, before and after (on her card, and with the act), so the
 * prose shows the difficulty, the time, the lube, the pain and the aftermath, and the state of her
 * body afterwards is what the prose said.
 */
import type { Person, SaveState } from "./types";
import { playerBody } from "./you";
import { dickCM, dickWord, inches, vaginaWord, anusWord } from "./genitals";
import { clamp, shove } from "./psyche";
import { rng } from "./rng";

export type Hole = "vagina" | "anus" | "throat";

export interface Fit {
  hole: Hole;
  /** What goes in, by the dick scale (a strap-on counts as large). */
  size: number;
  /** What she takes comfortably, on the same scale. */
  cap: number;
  over: number;
  word: "loose" | "easy" | "fits" | "snug" | "struggle" | "damage";
}

/** What a hole takes comfortably, on the dick scale. */
export function capacity(p: Person, hole: Hole, s?: SaveState): number {
  let cap: number;
  // Technique is worth something: a practised woman relaxes and takes more than her size alone would.
  if (hole === "vagina") cap = (p.body.vagina ?? 0) + 2 + (p.skills.vaginal ?? 0) / 60;
  else if (hole === "anus") cap = [1.5, 2.5, 4, 5.5, 7][clamp(p.body.anus ?? 0, 0, 4)] + (p.skills.anal ?? 0) / 50;
  else cap = 2 + (p.skills.oral ?? 0) / 25;
  // Sore takes a size off.
  if (s && soreUntil(p, hole) >= s.arcology.week) cap -= 1;
  return cap;
}

export function soreUntil(p: Person, hole: Hole): number {
  return p.health.sore?.[hole] ?? -1;
}

/** What the owner puts in her: his cock, or a strap-on. */
export function ownerSize(s: SaveState): { size: number; what: string } {
  const d = playerBody(s).dick ?? 0;
  return d > 0 ? { size: d, what: `your ${dickWord(d)} cock (about ${inches(dickCM(d))})` } : { size: 4, what: "the strap-on (large)" };
}

export function fitOf(p: Person, hole: Hole, size: number, s?: SaveState): Fit {
  const cap = capacity(p, hole, s);
  const over = +(size - cap).toFixed(1);
  const word: Fit["word"] = over <= -3 ? "loose" : over <= -1.5 ? "easy" : over <= 0 ? "fits" : over <= 1.5 ? "snug" : over <= 3 ? "struggle" : "damage";
  return { hole, size, cap, over, word };
}

const NAME: Record<Hole, string> = { vagina: "pussy", anus: "ass", throat: "throat" };

/** The fit, in words, for the narrator. */
export function fitWords(f: Fit, what: string, p: Person): string {
  const where = f.hole === "vagina" ? `her ${vaginaWord(p.body.vagina ?? 0, p.body.hymen)} pussy` : f.hole === "anus" ? `her ${anusWord(p.body.anus ?? 0)} ass` : "her throat";
  const said = `${what.charAt(0).toUpperCase()}${what.slice(1)} in ${where}`;
  if (f.hole === "throat" && (f.word === "loose" || f.word === "easy" || f.word === "fits")) return `${said} is no trouble, and she takes it all${f.word !== "fits" ? ", though it barely reaches her throat" : ""}.`;
  switch (f.word) {
    case "loose": return `${said} is loose. She barely feels it unless she clenches.`;
    // A tight hole is still bigger than a very small cock. The word "tight" on her card and a pain
    // rule above it had a two-inch cock hurting a girl and leaving her sore.
    case "easy": return `${said} slides in with no effort at all. Tight as she is, it's small to her, so it doesn't stretch her, ache or make her sore, and she only feels it a little. Never write her tight around it.`;
    case "fits": return `${said} fits comfortably. It doesn't hurt her.`;
    case "snug": return `${said} is a tight fit. It takes a moment, some spit or lube and a slow start, and she feels every inch and it aches.`;
    case "struggle": return `${said} is too big for her. Getting it in at all takes time, lube and steady pressure. It hurts, she's stretched to the limit around it${f.hole === "throat" ? ", she gags and chokes, her eyes stream, and she can't take all of it" : ""}, and it will stretch her for good.`;
    default: return `${said} doesn't fit. Forced, it tears her${f.hole === "throat" ? ", and she chokes, retches and can't breathe around it" : " and she bleeds"}. Without force, only part of it goes in.`;
  }
}

export interface Strain {
  fit: Fit;
  /** Her hole is looser for good. */
  stretched?: boolean;
  /** Her first time, taken. */
  virgin?: boolean;
  /** Torn: a real injury. */
  tore?: boolean;
  /** Sore until this week. */
  sore?: number;
  /** For the narrator: what happened to her body. */
  after: string;
}

/** Something goes into her. What it does, now and afterwards. Mutates her body. */
export function penetrate(s: SaveState, p: Person, hole: Hole, size: number, opts: { forced?: boolean; seed?: string } = {}): Strain {
  const f = fitOf(p, hole, size, s);
  const r = rng(opts.seed ?? `fit:${p.id}:${hole}:${s.arcology.week}:${s.turn}`);
  const week = s.arcology.week;
  const out: Strain = { fit: f, after: "" };
  const notes: string[] = [];
  const fetish = (n: string) => p.persona.fetishes.find((x) => x.name === n)?.strength ?? 0;
  // Some women want it too big: the size queen, the painal or gagfuck queen, the buttslut in her ass.
  // It still stretches and makes them sore; it just turns them on instead of off.
  const likesBig = p.persona.quirk?.id === "size queen" || p.persona.quirk?.id === "painal queen" && hole === "anus" || p.persona.quirk?.id === "gagfuck queen" && hole === "throat"
    || hole === "anus" && fetish("buttslut") >= 60 || hole === "throat" && fetish("cumslut") >= 80;
  const masochist = (p.persona.fetishes.find((x) => x.name === "masochist")?.strength ?? 0) >= 50;

  if (hole === "vagina" && (p.body.vagina ?? 0) === 0 && p.body.vagina !== null) {
    out.virgin = p.body.hymen;
    p.body.hymen = false;
    p.body.vagina = 1;
    if (out.virgin) notes.push("her virginity is gone and there's blood");
  } else if (hole === "anus" && (p.body.anus ?? 0) === 0) {
    out.virgin = true;
    p.body.anus = 1;
    notes.push("her ass has been broken in");
  }

  if (f.over > 0) {
    // The original's stretch, weighed hole against cock; past "loose" a hole doesn't give much more.
    const now = hole === "vagina" ? p.body.vagina ?? 0 : hole === "anus" ? p.body.anus ?? 0 : 0;
    const chance = hole === "throat" ? 0 : clamp(0.2 + f.over * 0.22 - (now >= 3 ? 0.25 : 0), 0, 0.95);
    if (r.chance(chance)) {
      if (hole === "vagina" && p.body.vagina !== null) p.body.vagina = Math.min(10, p.body.vagina + 1);
      if (hole === "anus") p.body.anus = Math.min(4, (p.body.anus ?? 0) + 1);
      out.stretched = true;
      notes.push(`her ${NAME[hole]} has been stretched by it, and stays that way`);
    }
    // Forced well past what she can take, it tears.
    const tear = f.word === "damage" ? clamp(0.25 + (f.over - 3) * 0.3 + (opts.forced ? 0.2 : 0) + (hole === "anus" ? 0.15 : 0), 0, 0.95)
      : f.word === "struggle" && (opts.forced || soreUntil(p, hole) >= week) ? 0.15 : 0;
    if (hole !== "throat" && r.chance(tear)) {
      out.tore = true;
      const grave = f.over > 5;
      p.health.injuries.push({ what: `torn ${NAME[hole]}`, severity: grave ? "grave" : "notable", week });
      p.health.health = clamp(p.health.health - (grave ? 18 : 8), -100, 100);
      notes.push(grave ? `she's torn badly and bleeding, and she needs a doctor` : `she's torn and bleeding a little, and it'll take weeks to heal`);
    }
    // Sore for a few days, longer the worse it was.
    out.sore = week + (f.word === "snug" ? 0 : f.word === "struggle" ? 1 : 2);
    (p.health.sore ??= {})[hole] = Math.max(soreUntil(p, hole), out.sore);
    notes.push(hole === "throat" ? "her throat is raw afterwards and her voice is hoarse" : `her ${NAME[hole]} is sore afterwards${f.word === "snug" ? "" : " for days"}`);
    // How it lands: pain, unless pain or size is what she's after.
    if (!likesBig && !masochist) {
      // An untrained woman fights her own body; a practised one knows how to take it.
      const practised = hole === "throat" ? p.skills.oral : hole === "anus" ? p.skills.anal : p.skills.vaginal;
      const pain = f.over * (1 - clamp((practised ?? 0) / 200, 0, 0.5));
      shove(p.psyche, -0.3 * pain, { hard: pain > 1.5 });
      p.bond.resentment = clamp(p.bond.resentment + pain * (opts.forced ? 1.5 : 0.6), 0, 100);
      p.psyche.arousal = clamp(p.psyche.arousal - pain * 8, 0, 100);
    } else p.psyche.arousal = clamp(p.psyche.arousal + f.over * 6, 0, 100);
  }
  out.after = notes.length > 1 ? `${notes.slice(0, -1).join(", ")}, and ${notes.at(-1)}` : notes.join("");
  return out;
}

/** For her card: how the owner fits her, and anything still sore or torn. */
export function fitLines(s: SaveState, p: Person): string[] {
  const out: string[] = [];
  const { size, what } = ownerSize(s);
  const holes: Hole[] = [...(p.body.vagina !== null ? ["vagina" as const] : []), "anus", "throat"];
  const fits = holes.map((h) => fitOf(p, h, size, s));
  const bits = fits.map((f) => fitWords(f, what, p));
  out.push(fits.some((f) => f.over > 0)
    ? `HOW YOU FIT HER. This is a fact, so where it's too big, write the difficulty, the time, the lube, the pain and the aftermath it takes, and never a smooth slide past what fits. Where it fits, it doesn't hurt. ${bits.join(" ")}`
    : `HOW YOU FIT HER. This is a fact. Nothing of yours is a strain for her, so your size never makes her wince, ache, bleed, get sore or ask you to go slow. If she's frightened, that's fear, not your cock. ${bits.join(" ")}`);
  const week = s.arcology.week;
  const sore = holes.filter((h) => soreUntil(p, h) >= week).map((h) => NAME[h]);
  const torn = p.health.injuries.filter((i) => !i.healed_week && /^torn /.test(i.what)).map((i) => i.what);
  if (sore.length || torn.length) out.push(`STILL HURTING. ${[...torn.map((t) => `She has a ${t} that hasn't healed.`), ...sore.filter((x) => !torn.some((t) => t.endsWith(x))).map((x) => `Her ${x} is still sore.`)].join(" ")} Using it hurts more and makes it worse.`);
  return out;
}

/** Which acts put something of the owner's in which of her holes. */
const ACT_HOLE: Record<string, Hole | "either"> = { vaginal: "vagina", breeding: "vagina", anal: "anus", painal: "anus", throat: "throat", "public use": "either", group: "either" };
export function holeFor(p: Person, actId: string): Hole | undefined {
  const h = ACT_HOLE[actId];
  if (!h) return undefined;
  if (h === "either") return p.body.vagina !== null && !p.chastity.vagina ? "vagina" : "anus";
  if (h === "vagina" && p.body.vagina === null) return undefined;
  return h;
}

/** Her cock in the owner, when it goes that way: the same arithmetic, the owner's body. */
export function herFitLine(s: SaveState, p: Person): string {
  const d = p.body.dick ?? 0;
  if (d < 1) return "";
  const you = playerBody(s);
  const caps: [string, number][] = [["your ass", [1.5, 2.5, 4, 5.5, 7][clamp(you.anus ?? 0, 0, 4)]], ["your throat", 3], ...(you.vagina !== null && you.vagina !== undefined ? [["your pussy", (you.vagina ?? 0) + 2] as [string, number]] : [])];
  const word = (where: string, over: number) => (over <= 0 ? `In ${where} it fits.` : over <= 1.5 ? `In ${where} it's a tight fit that aches.` : over <= 3 ? `It's too big for ${where}, so it takes time and lube, it hurts, and you can't take all of it.`
    : where === "your throat" ? "It's far too big for your throat. You choke and retch on the head and the first few inches, and the rest of it stays outside you." : `It doesn't fit ${where}. Only the head and a little more go in, and forcing more would tear you.`);
  const huge = caps.some(([, c]) => d - c > 3);
  return `HER COCK IN YOU. Her cock is ${dickWord(d)}, about ${inches(dickCM(d))}, and this is a fact, so write what that size actually allows and never the whole length going in. ${caps.map(([w, c]) => word(w, d - c)).join(" ")}${huge ? " If anything from earlier on this card says more of it went in, like all of it or balls on your chin, that was impossible. It went as far as this allows and no further, and that's how it's remembered and done now." : ""}`;
}

/** One of your women's cock in another's holes, for a scene with both of them in it. */
export function pairFitLine(s: SaveState, a: Person, b: Person): string {
  const d = a.body.dick ?? 0;
  if (d < 1) return "";
  const holes: Hole[] = [...(b.body.vagina !== null ? ["vagina" as const] : []), "anus", "throat"];
  return `${a.name.split(" ")[0].toUpperCase()}'S COCK IN ${b.name.split(" ")[0].toUpperCase()}, which is a fact: ${holes.map((h) => fitWords(fitOf(b, h, d, s), `${a.name.split(" ")[0]}'s ${dickWord(d)} cock (about ${inches(dickCM(d))})`, b)).join(" ")}`;
}

