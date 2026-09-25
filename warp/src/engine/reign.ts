/**
 * HER REIGN — what happens after a slave holds your collar.
 *
 * The ladder (engine/romance.ts) and the Supplicationist chain (engine/reversal.ts) both end with
 * her owning you. This is what comes after, and it is run off who she is and what you did to her:
 *
 *   style     from her conscience, her fetishes, her bond, and what she remembers of you. A kind
 *             woman who loves you dotes; a cold one with a sadist's streak enjoys it; a woman you
 *             hurt pays it back; a submissive never wanted it and keeps trying to hand it back.
 *   shown     from her gregariousness: an outgoing woman shows you off in the concourse and at her
 *             parties; a private one keeps you in the penthouse.
 *
 * She sets terms the first week (what you call her, what she calls you, what you wear, where you
 * sleep, your duties) and they go on her record as her rules for you, so every scene keeps them.
 * Then she gives you orders you can obey, plead with or defy; she reorganises the household in her
 * own way; she signs laws that suit her and rules on the court's cases; and at set points she decides
 * what you are to her: renamed, displayed, put under one of the others, and in the end kept for
 * good, married, freed, or something worse. You can take the arcology back at any of those points,
 * and it costs what it should.
 */
import type { Person, ReportLine, SaveState } from "./types";
import { clamp, shove } from "./psyche";
import { applyTreatment, memoryTilt } from "./obedience";
import { remember } from "./memory";
import { startRumor, moveEdge } from "./social";
import { romanceOf, theKeeper } from "./romance";
import { registerEvents, fireEvent, resolveEvent, type EventDef } from "./events";
import { agreementsOf, calledBy, keep } from "./agreements";
import { enact, lawsOf } from "./court";
import { LAWS, LAW_BY_ID, type LawDef } from "../data/laws";
import { pushNorm, cultureOf, type Norm } from "./culture";
import { hasWomb } from "./pregnancy";
import { rng } from "./rng";

export type ReignStyle = "doting" | "stern" | "cruel" | "playful" | "vengeful" | "reluctant";

export interface Reign {
  keeper: string;
  since: number;
  style: ReignStyle;
  shown: "public" | "private" | "sometimes";
  her_title: string;
  your_name: string;
  dress: string;
  sleep: string;
  duties: string[];
  /** −100 … 100: how pleased she is with you. */
  favour: number;
  obeyed: number;
  defied: number;
  /** The one of the others she has put over you, if any. */
  deputy?: string;
  /** She made it permanent. */
  permanent?: boolean;
  married?: boolean;
  log: { week: number; text: string }[];
  laws: string[];
  beats: string[];
  last_order?: number;
  last_law?: number;
  ended?: string;
}

export const STYLE_NOTE: Record<ReignStyle, string> = {
  doting: "She rules gently. She owns you because she loves you and wants you close, and she is protective of you in front of other people.",
  stern: "She rules firmly and fairly. She expects obedience without argument, and gives order and care back for it.",
  cruel: "She enjoys it. She uses her power over you for her own pleasure, and she likes an audience for it.",
  playful: "She treats owning you as a game she is winning: teasing, dares, silly names, and showing you off.",
  vengeful: "She remembers what you did to her, and she is paying it back. She is not out of control; she is thorough.",
  reluctant: "She never wanted this. She holds your collar because you gave it to her, keeps asking you what to do, and is afraid of getting it wrong.",
};

const fet = (p: Person, n: string) => p.persona.fetishes.find((f) => f.name === n)?.strength ?? 0;
const pname = (s: SaveState) => (s.player.name && s.player.name !== "you" ? s.player.name : "pet");

export function styleOf(s: SaveState, her: Person): ReignStyle {
  const tilt = memoryTilt(s.memory[her.id]);
  const hurt = (s.deeds ?? []).filter((d) => d.person === her.id && d.tags.some((t) => ["cruelty", "humiliated_her", "punished", "threatened_sale", "promise_broken"].includes(t))).length;
  if (her.bond.resentment > 45 || tilt < -0.1 || hurt >= 2) return "vengeful";
  if (fet(her, "submissive") >= 50 && fet(her, "dom") < 30 && fet(her, "sadist") < 30) return "reluctant";
  if ((her.persona.conscience < 0.35 && fet(her, "sadist") + fet(her, "dom") + fet(her, "humiliation") >= 40) || her.persona.conscience < 0.2) return "cruel";
  if (her.persona.conscience > 0.6 && her.bond.bond > 50) return "doting";
  if ((her.persona.gregariousness ?? 0.5) > 0.65 || fet(her, "humiliation") >= 40) return "playful";
  return "stern";
}

function terms(s: SaveState, her: Person, style: ReignStyle): Pick<Reign, "her_title" | "your_name" | "dress" | "sleep" | "duties"> {
  const t: Record<ReignStyle, Pick<Reign, "her_title" | "your_name" | "dress" | "sleep" | "duties">> = {
    doting: { her_title: her.name, your_name: pname(s) === "pet" ? "love" : pname(s), dress: "soft clothes she picks out for you each morning, and her collar", sleep: "in her bed, on her side of it", duties: ["bring her coffee when she wakes", "sit at her feet in the evenings while she reads the reports"] },
    stern: { her_title: "Mistress", your_name: pname(s), dress: "a plain dark tunic and her steel collar", sleep: "on a mat at the foot of her bed", duties: ["kneel when she enters a room", "serve at her table and eat after she has finished", "report to her on the household every evening"] },
    cruel: { her_title: "Owner", your_name: "slave", dress: "nothing but her collar, and a chain when she wants one", sleep: "on the floor, chained to the foot of her bed", duties: ["crawl in her presence", "clean the floors she walks on", "serve the other slaves when she tells you to"] },
    playful: { her_title: "Princess", your_name: "puppy", dress: "a maid's uniform she picked out, a size too small, with a bell on the collar", sleep: "in a basket at the foot of her bed", duties: ["fetch things when she snaps her fingers", "do tricks for her guests", "beg for your dinner"] },
    vengeful: { her_title: "Mistress", your_name: "slave", dress: "the grey smock she was given in her first week here", sleep: "in the cell she used to sleep in", duties: ["do the work she used to do", "thank her for every punishment", "tell her, every night, one thing you did to her"] },
    reluctant: { her_title: her.name, your_name: calledBy(s, her), dress: "whatever you choose; she won't pick", sleep: "in your old bed, with her curled up against you", duties: ["tell her what to do when she asks you, which is often"] },
  };
  const out = { ...t[style], duties: [...t[style].duties] };
  if (style !== "reluctant") {
    if (fet(her, "feet") >= 40) out.duties.push("wash and kiss her feet every morning");
    if (fet(her, "pregnancy") >= 50 && hasWomb(her) && !her.womb.fetuses.length) out.duties.push("come to her bed every night until she's pregnant");
    if (style !== "doting" && fet(her, "dom") + fet(her, "sadist") >= 40) out.duties.push("take a punishment every Sunday, whether you earned one or not");
  }
  return out;
}

export function reignOf(s: SaveState): Reign | undefined {
  const r = s.reign;
  return r && !r.ended ? r : undefined;
}

function note(s: SaveState, text: string) {
  const r = s.reign!;
  r.log.push({ week: s.arcology.week, text });
  if (r.log.length > 40) r.log.shift();
}

/** Her rules for you, on her record, so every scene with her keeps them. */
function writeRules(s: SaveState, her: Person, r: Reign) {
  const list = agreementsOf(her);
  for (let i = list.length - 1; i >= 0; i--) if (list[i].by === "her") list.splice(i, 1);
  const week = s.arcology.week;
  keep(list, { rule: `you call her "${r.her_title}"`, week, by: "her" });
  keep(list, { rule: `she calls you "${r.your_name}"`, week, by: "her" });
  keep(list, { rule: `you wear ${r.dress}`, week, by: "her" });
  keep(list, { rule: `you sleep ${r.sleep}`, week, by: "her" });
  for (const d of r.duties) keep(list, { rule: `you ${d}`, week, by: "her" });
}

export function startReign(s: SaveState, her: Person): Reign {
  const style = styleOf(s, her);
  const g = her.persona.gregariousness ?? 0.5;
  const r: Reign = {
    keeper: her.id, since: s.arcology.week, style, shown: g >= 0.6 ? "public" : g <= 0.35 ? "private" : "sometimes",
    ...terms(s, her, style), favour: style === "vengeful" ? -30 : style === "doting" ? 30 : 0, obeyed: 0, defied: 0, log: [], laws: [], beats: [],
  };
  s.reign = r;
  writeRules(s, her, r);
  fireEvent(s, "reign_terms", { person: her });
  return r;
}

/** Give it back, or take it back. */
export function endReign(s: SaveState, how: string, her?: Person): void {
  const r = s.reign;
  if (!r) return;
  r.ended = how;
  s.player.owned_by = undefined;
  if (her) {
    const rom = romanceOf(her);
    rom.standing = r.married || how === "equals" ? "wife" : "betrothed";
    rom.since_week = s.arcology.week;
    rom.dominion = Math.min(rom.dominion, how === "equals" ? 60 : 30);
    const list = agreementsOf(her);
    for (let i = list.length - 1; i >= 0; i--) if (list[i].by === "her") list.splice(i, 1);
  }
}

/* ── what she thinks of laws ─────────────────────────────────────────────────────────────── */

const STYLE_NORMS: Record<ReignStyle, Partial<Record<Norm, number>>> = {
  doting: { cruelty: -1, personhood: 1, reversal: 1, manumission: 0.5 },
  stern: { order: 1, reversal: 1, exposure: -0.5 },
  cruel: { cruelty: 1, personhood: -1, exposure: 0.5 },
  playful: { exposure: 1, order: -1, modification: 0.5 },
  vengeful: { personhood: 1, reversal: 1, manumission: 1 },
  reluctant: {},
};

export function lawScore(her: Person, style: ReignStyle, l: LawDef): number {
  const want = { ...STYLE_NORMS[style] } as Partial<Record<Norm, number>>;
  if (fet(her, "feet") >= 40) want.feet = (want.feet ?? 0) + 1;
  let n = 0;
  for (const [k, v] of Object.entries(l.pull) as [Norm, number][]) n += v * (want[k] ?? 0);
  return n;
}

/* ── the events ──────────────────────────────────────────────────────────────────────────── */

const her = (s: SaveState, p?: Person) => p ?? (s.reign ? s.people[s.reign.keeper] : undefined);
const fav = (s: SaveState, by: number) => { if (s.reign) s.reign.favour = clamp(s.reign.favour + by, -100, 100); };

const TERMS_VOICE: Record<ReignStyle, (h: Person, r: Reign) => string> = {
  doting: (h, r) => `${h.name} sits on the end of the bed with a list she's clearly rewritten several times. "I want you close," she says. "That's most of it." You'll call her ${r.her_title}, the way you always have. You'll wear ${r.dress}. You'll sleep ${r.sleep}. She wants you to ${r.duties.join(", and to ")}. She looks up to see how you're taking it.`,
  stern: (h, r) => `${h.name} has you kneel on the rug in the office while she reads out her terms from a single typed page. You'll call her ${r.her_title}. She'll call you ${r.your_name}. You'll wear ${r.dress}, and you'll sleep ${r.sleep}. Your duties: ${r.duties.join("; ")}. "Questions?" she asks, in a tone that means there aren't any.`,
  cruel: (h, r) => `${h.name} calls you into the atrium with half the household watching, and tells you what you are now. You'll call her ${r.her_title}. You're "${r.your_name}" from today. You'll wear ${r.dress}. You'll sleep ${r.sleep}. You will ${r.duties.join(", ")}. She's smiling the whole time.`,
  playful: (h, r) => `${h.name} has made you a certificate, with a gold seal, and she reads it out in a ridiculous voice. You'll call her ${r.her_title}. Your name is ${r.your_name} now. You'll wear ${r.dress}, and sleep ${r.sleep}. You will ${r.duties.join(", ")}. Then she puts the collar with the bell on you herself, and laughs when it rings.`,
  vengeful: (h, r) => `${h.name} doesn't raise her voice. She's had a long time to think about this. You'll call her ${r.her_title}, the way she had to call you. You're "${r.your_name}". You'll wear ${r.dress}, and sleep ${r.sleep}. You'll ${r.duties.join(", and ")}. "It's only what I had," she says. "You told me I'd get used to it."`,
  reluctant: (h, r) => `${h.name} holds your collar in both hands like it might go off. "I don't know what I'm supposed to do," she says. "Tell me what you want me to do, and I'll do it. That's backwards, isn't it." She wants you to sleep ${r.sleep}, and to ${r.duties.join(", ")}.`,
};

const ORDERS: Record<ReignStyle, { text: string; public?: boolean }[]> = {
  doting: [{ text: "She wants you to take the day off, and to let her run the morning meeting without you in the room." }, { text: "She asks you to dance with her at the Spring Ball, in front of everyone, wearing her collar.", public: true }],
  stern: [{ text: "She orders you to present the week's accounts to her on your knees, in front of her secretary." }, { text: "She orders you to stand behind her chair through a dinner with three arcology owners, and pour.", public: true }],
  cruel: [{ text: "She orders you to serve the household dinner on your knees and eat what they leave on their plates." }, { text: "She orders you to spend the night in the arcade, where citizens can use you, \"to learn what it's for.\"", public: true }],
  playful: [{ text: "She wants you on a leash at her party tonight, doing tricks for her friends.", public: true }, { text: "She dares you to walk across the concourse in the maid's uniform and buy her an ice cream.", public: true }],
  vengeful: [{ text: "She orders you to scrub the cellblock floor, the same floor she used to scrub." }, { text: "She has you read aloud, to the household, a list of what you did to her." }],
  reluctant: [{ text: "She asks you, quietly, to decide what happens to the newest girl. She doesn't want to." }, { text: "She asks whether she's doing it right. She's been crying." }],
};
const FEET_ORDER = { text: "She sits on the edge of the fountain in the plaza and tells you to wash her feet, there, with people watching.", public: true };

function orderFor(s: SaveState, h: Person, r: Reign) {
  const pool = [...ORDERS[r.style]];
  if (fet(h, "feet") >= 40 && r.style !== "reluctant") pool.push(FEET_ORDER);
  return rng(`reign-order:${s.arcology.week}:${h.id}`).pick(pool);
}

const DEFIED: Record<ReignStyle, (h: Person) => string> = {
  doting: (h) => `${h.name} doesn't punish you. She just goes quiet, and for the rest of the week she sleeps turned away from you.`,
  stern: (h) => `${h.name} sends you to sleep in the hall for three nights and doesn't discuss it.`,
  cruel: (h) => `${h.name} has two of the house slaves hold you down while she canes you, and she makes the others watch.`,
  playful: (h) => `${h.name} laughs, clips a leash to your collar and keeps you on it for the rest of the day, even in the office.`,
  vengeful: (h) => `${h.name} writes it down. She says she's keeping a list, the way you kept one on her.`,
  reluctant: (h) => `${h.name} looks relieved, which is worse than if she'd been angry.`,
};

const OVER = "It doesn't matter any more. The collar is back in a drawer, and nobody in the penthouse brings it up.";
function reignEvent(id: string, seed: EventDef["seed"], options: EventDef["options"]): EventDef {
  // Only live while she holds your collar; an answer that arrives after it ended changes nothing.
  return {
    id, severity: "major", endogenous: true, candidates: () => [], weight: () => 0,
    seed: (s, c) => (s.reign && !s.reign.ended && c.person ? seed(s, c) : OVER),
    options: options.map((o) => ({ ...o, resolve: (s, e, p) => (s.reign && !s.reign.ended && her(s, p) ? o.resolve(s, e, her(s, p)) : OVER) })),
  };
}

const back = (s: SaveState, p: Person | undefined, how: string): string => {
  const h = her(s, p);
  endReign(s, "taken back", h);
  if (h) {
    applyTreatment(h, { kind: "promise_broken", size: 9, why: "you took the arcology back from her" }, s.arcology.week);
    shove(h.psyche, -2, { hard: true });
    const m = s.memory[h.id];
    if (m) remember(m, { content: `the day you took back the collar: ${how}`, week: s.arcology.week, importance: 10, charge: "sharp", core: true });
  }
  for (const o of Object.values(s.people)) if (o.status === "owned") o.bond.hope = clamp(o.bond.hope - 10, 0, 100);
  startRumor(s, `the owner took the arcology back from ${h?.name ?? "her"}`, { salience: 9, about: h?.id });
  pushNorm(s, "reversal", -10, `you took your collar back from ${h?.name ?? "her"}`);
  return `${how}\n\nThe registry is changed back by the afternoon. ${h?.name ?? "She"} doesn't fight it. The household watched the whole thing, and none of them will be sure of anything you promise again.`;
};

const EVENTS: EventDef[] = [
  reignEvent("reign_terms", (s, c) => { const h = c.person!; return TERMS_VOICE[s.reign!.style](h, s.reign!); }, [
    { id: "accept", label: "Accept all of it",
      resolve: (s, _e, p) => { fav(s, 15); s.reign!.obeyed++; if (p) applyTreatment(p, { kind: "recognition", size: 4, why: "you accepted her terms" }, s.arcology.week); note(s, "You accepted her terms."); return `You accept all of it. ${p?.name ?? "She"} lets out a breath she's been holding, and from that night you ${s.reign!.sleep.replace(/^in /, "sleep in ").replace(/^on /, "sleep on ")}.`; } },
    { id: "bargain", label: "Accept, but ask for one thing back",
      resolve: (s, _e, p) => {
        const r = s.reign!;
        if (r.style === "doting" || r.style === "reluctant" || r.style === "playful") { fav(s, 5); r.obeyed++; note(s, "She gave you something back."); return `You ask to keep your own name in private. ${p?.name ?? "She"} thinks about it and says yes, "when it's just us." The rest stands.`; }
        if (r.style === "stern") { r.obeyed++; note(s, "She heard you out and changed nothing."); return `You ask. ${p?.name ?? "She"} hears you out properly, and then says no, and explains exactly why. The terms stand as written.`; }
        fav(s, -5); r.duties.push("ask permission before you speak"); writeRules(s, p!, r); note(s, "You bargained, and she added a rule."); return `You ask. ${p?.name ?? "She"} adds a rule instead: from now on you ask permission before you speak.`;
      } },
    { id: "refuse", label: "Refuse her terms",
      resolve: (s, _e, p) => { const r = s.reign!; fav(s, -25); r.defied++; if (p) p.bond.resentment = clamp(p.bond.resentment + 10, 0, 100); note(s, "You refused her terms."); return `You refuse. ${DEFIED[r.style](p!)}\n\nThe terms stand anyway. She owns you on the registry, and she's told the household so.`; } },
    { id: "back", label: "Take the arcology back", note: "ends it",
      resolve: (s, _e, p) => back(s, p, `You take the collar off and put it on the desk between you.`) },
  ]),
  reignEvent("reign_order", (s, c) => { const o = orderFor(s, c.person!, s.reign!); return `${o.text}${o.public ? "\n\nIt will be in front of other people." : ""}`; }, [
    { id: "obey", label: "Do it",
      resolve: (s, _e, p) => { const r = s.reign!; const o = orderFor(s, p!, r); fav(s, 7); r.obeyed++; if (o.public) pushNorm(s, "reversal", 3, `${p!.name} put the owner to work where people could see`); note(s, `You did what she told you: ${o.text.replace(/^She /, "she ")}`); if (p) applyTreatment(p, { kind: "recognition", size: 2, why: "you did as she said" }, s.arcology.week); return `You do it. ${r.style === "cruel" ? `${p!.name} watches the whole time and doesn't say a word until it's over, and then she says "good."` : r.style === "doting" ? `${p!.name} holds your hand afterwards and doesn't let go for a long time.` : r.style === "vengeful" ? `${p!.name} watches, and when you're done she says, "Now you know."` : `${p!.name} is pleased, and lets you see it.`}${o.public ? " People saw, and by the evening the concourse is talking about it." : ""}`; } },
    { id: "plead", label: "Ask her to let you off",
      resolve: (s, _e, p) => { const r = s.reign!; note(s, "You asked her to let you off an order."); if (r.style === "doting" || r.style === "reluctant") { fav(s, 2); return `You ask. ${p!.name} lets you off at once, and then worries that she asked for too much.`; } if (r.style === "cruel") { fav(s, -4); return `You ask. ${p!.name} says no, and that asking has doubled it.`; } fav(s, -2); return `You ask. ${p!.name} thinks about it and lets you off this once. She makes sure you know it's once.`; } },
    { id: "defy", label: "Refuse",
      resolve: (s, _e, p) => { const r = s.reign!; fav(s, -12); r.defied++; if (p) p.bond.resentment = clamp(p.bond.resentment + 4, 0, 100); note(s, "You refused an order."); return `You refuse. ${DEFIED[r.style](p!)}`; } },
  ]),
  reignEvent("reign_name", (s, c) => { const r = s.reign!; const nm = newName(r.style); return `${c.person!.name} has decided you need a new name. "${nm}," she says, and tries it out a few times while you stand there. "Yes. That's you."`; }, [
    { id: "accept", label: "Answer to it",
      resolve: (s, _e, p) => { const r = s.reign!; r.your_name = newName(r.style); writeRules(s, p!, r); fav(s, 6); r.obeyed++; note(s, `She renamed you ${r.your_name}.`); startRumor(s, `${p!.name} calls the owner "${r.your_name}" now`, { about: p!.id, salience: 6 }); return `You answer to it. By the end of the week the household uses it too, and you find you turn your head when you hear it.`; } },
    { id: "keep", label: "Ask to keep your own name",
      resolve: (s, _e, p) => { const r = s.reign!; if (r.favour >= 20) { note(s, "She let you keep your name."); return `You ask. ${p!.name} looks at you for a while and says you can keep it, because you asked nicely.`; } r.your_name = newName(r.style); writeRules(s, p!, r); fav(s, -3); note(s, `She renamed you ${r.your_name}, though you asked her not to.`); return `You ask. ${p!.name} says no. You're ${r.your_name} now.`; } },
    { id: "refuse", label: "Refuse it",
      resolve: (s, _e, p) => { const r = s.reign!; r.your_name = newName(r.style); writeRules(s, p!, r); fav(s, -10); r.defied++; note(s, "You refused the name she gave you."); return `You refuse it. She uses it anyway, every time, until the others do too. ${DEFIED[r.style](p!)}`; } },
  ]),
  reignEvent("reign_display", (s, c) => { const r = s.reign!; const h = c.person!; return r.shown === "private"
    ? `${h.name} has decided you don't leave the penthouse without her. She's told security. When you try the lift, it doesn't open for you.`
    : `${h.name} is throwing a party in the atrium for forty citizens, and you are the entertainment. ${r.style === "doting" ? "She wants them to see you with her, happy in her collar." : r.style === "cruel" ? "She's told the guests they can do what they like with you." : r.style === "playful" ? "There's a programme. You're on it three times." : "You'll serve, and she'll tell them how she took the arcology from you."}`; }, [
    { id: "go", label: "Go along with it",
      resolve: (s, _e, p) => { const r = s.reign!; fav(s, 8); r.obeyed++; if (r.shown === "private") { note(s, "She keeps you in the penthouse now."); return `You stop trying the lift. ${p!.name} takes you out herself, on her arm, once or twice a week, and the rest of the time the penthouse is the whole world.`; } pushNorm(s, "reversal", 6, `${p!.name} showed off the owner at a party`); pushNorm(s, "exposure", 2, `${p!.name}'s party`); s.arcology.rep -= 300; startRumor(s, `${p!.name} showed the owner off at a party in the atrium`, { about: p!.id, salience: 8 }); note(s, "She showed you off at a party."); return `You go along with it. Forty citizens see what the owner of ${s.arcology.name} is now, and they tell everyone they know. The Owners' Association hears about it the next day.`; } },
    { id: "ask", label: "Ask her not to",
      resolve: (s, _e, p) => { const r = s.reign!; if (r.style === "doting" || r.style === "reluctant" || r.favour >= 30) { note(s, "She called it off because you asked."); return `You ask, and ${p!.name} calls it off. She doesn't hold it against you.`; } fav(s, -4); note(s, "You asked her not to, and she did it anyway."); return `You ask. ${p!.name} goes ahead anyway.`; } },
    { id: "refuse", label: "Refuse",
      resolve: (s, _e, p) => { const r = s.reign!; fav(s, -12); r.defied++; note(s, "You refused to be shown off."); return `You refuse. ${DEFIED[r.style](p!)}`; } },
  ]),
  reignEvent("reign_deputy", (s, c) => { const d = s.reign?.deputy ? s.people[s.reign.deputy] : undefined; return `${c.person!.name} tells you that when she's out, ${d?.name ?? "one of the others"} is in charge of you. ${d?.name ?? "She"} is standing behind her while she says it, and doesn't look away from you.`; }, [
    { id: "accept", label: "Accept it",
      resolve: (s, _e, p) => { const d = s.reign?.deputy ? s.people[s.reign.deputy] : undefined; fav(s, 5); s.reign!.obeyed++; if (d) { applyTreatment(d, { kind: "recognition", size: 5, why: "put in charge of the owner" }, s.arcology.week); moveEdge(s.edges, d.id, "owner", { power: 20 } as never); keep(agreementsOf(d), { rule: "is in charge of you when " + p!.name + " is out, and gives you orders", week: s.arcology.week, by: "her" }); } note(s, `She put ${d?.name ?? "one of the others"} in charge of you.`); return `You accept it. The first time ${d?.name ?? "she"} gives you an order, her voice shakes. By the third time it doesn't.`; } },
    { id: "refuse", label: "Refuse to take orders from her",
      resolve: (s, _e, p) => { fav(s, -10); s.reign!.defied++; s.reign!.deputy = undefined; note(s, "You refused to take orders from one of the others."); return `You refuse. ${p!.name} says she'll think about it, which means she's angry.`; } },
  ]),
  reignEvent("reign_future", (s, c) => futureText(s, c.person!), [
    { id: "yes", label: "Say yes",
      resolve: (s, _e, p) => futureYes(s, p!) },
    { id: "counter", label: "Ask for something else",
      resolve: (s, _e, p) => futureCounter(s, p!) },
    { id: "back", label: "Take the arcology back", note: "ends it",
      resolve: (s, _e, p) => back(s, p, `You tell ${p!.name} it's over, and you call the registry yourself.`) },
  ]),
];

function newName(style: ReignStyle): string {
  return { doting: "love", stern: "pet", cruel: "thing", playful: "Biscuit", vengeful: "Four", reluctant: "you" }[style];
}

function futureKind(s: SaveState, h: Person): "marry" | "covenant" | "worse" | "return" {
  const r = s.reign!;
  if (r.style === "reluctant") return "return";
  if (r.style === "doting" || (r.favour >= 40 && r.style !== "cruel")) return "marry";
  if (r.style === "cruel" || (r.style === "vengeful" && r.favour < 20)) return "worse";
  return "covenant";
}

function futureText(s: SaveState, h: Person): string {
  const r = s.reign!;
  switch (futureKind(s, h)) {
    case "marry": return `${h.name} wants to marry you. "As mine," she says. "Still in my collar. On the registry." Then, after a moment: "Or I give it back and we do it as equals. I'd rather the first one. But I'd take the second."`;
    case "covenant": return `${h.name} has had the covenant drawn up. Permanent, registered, witnessed, and no taking it back. She puts the pen in your hand. "Six months," she says. "I know what you are now. Do you?"`;
    case "worse": return `${h.name} has been thinking about what you're for. She could keep you as you are. She could give you to the household, to be all of theirs and not just hers. ${r.style === "vengeful" ? "Or she could do what you once did to someone else, and put you in the arcade for a season." : "Or she could put you in the arcade, where the citizens can have you, and keep the arcology for herself."} She wants to hear you ask for the first one.`;
    case "return": return `${h.name} gives you your collar back. She's holding it out to you with both hands. "I can't," she says. "I tried. I can't be the one."`;
  }
}

function futureYes(s: SaveState, h: Person): string {
  const r = s.reign!;
  const kind = futureKind(s, h);
  r.beats.push(`future:${kind}`);
  if (kind === "marry") {
    r.married = true; r.permanent = true; fav(s, 20);
    s.canon.push(`${h.name} married the former owner of ${s.arcology.name}, who remains hers on the registry.`);
    startRumor(s, `${h.name} married the owner, and kept the collar on`, { about: h.id, salience: 10 });
    pushNorm(s, "reversal", 12, `${h.name} married the owner and kept the collar on`);
    note(s, "She married you, and you're still hers.");
    return `The wedding is in the concourse. ${h.name} leads you up the aisle on a silver chain, and the registry clerk writes "spouse, and property" in the one box.`;
  }
  if (kind === "covenant") {
    r.permanent = true; fav(s, 15);
    const l = LAW_BY_ID["collar_covenant"];
    if (l && !lawsOf(s).some((x) => x.id === l.id)) { enact(s, l, "keeper"); r.laws.push(l.id); }
    s.canon.push(`The former owner of ${s.arcology.name} signed a permanent covenant making them ${h.name}'s for life.`);
    pushNorm(s, "reversal", 10, `the owner signed a permanent covenant to ${h.name}`);
    note(s, "You signed the covenant. It's permanent.");
    return `You sign it. ${h.name} signs under you, and the clerk stamps it. It's the first covenant under the Collar Covenant, and the clerk frames a copy for the civic hall.`;
  }
  if (kind === "worse") {
    fav(s, 10); r.duties.push("serve every slave in the household as you serve her"); writeRules(s, h, r);
    for (const o of Object.values(s.people)) if (o.status === "owned" && o.id !== h.id) keep(agreementsOf(o), { rule: "can give you orders; you belong to the whole household now", week: s.arcology.week, by: "her" });
    pushNorm(s, "cruelty", 4, `${h.name} gave the owner to the household`); pushNorm(s, "personhood", 3, `${h.name} gave the owner to the household`);
    note(s, "She gave you to the whole household.");
    return `You ask to stay hers, and she decides you've asked well enough to be spared the arcade. She gives you to the household instead: all of theirs, and hers above them. That night ${Object.values(s.people).filter((o) => o.status === "owned" && o.id !== h.id).length} slaves learn they can give you orders.`;
  }
  // return: you take the collar back
  endReign(s, "given back", h);
  h.bond.hope = clamp(h.bond.hope + 10, 0, 100); shove(h.psyche, 1.5);
  return `You take it. ${h.name} cries, and then laughs, and then sleeps for eleven hours. When she wakes up she brings you coffee, the way she used to.`;
}

function futureCounter(s: SaveState, h: Person): string {
  const r = s.reign!;
  const kind = futureKind(s, h);
  r.beats.push(`future:counter`);
  if (kind === "marry") { endReign(s, "equals", h); s.canon.push(`${h.name} and the owner of ${s.arcology.name} married as equals, after she held the collar.`); pushNorm(s, "manumission", 5, `${h.name} gave the owner their freedom and married them`); return `You ask for the second one. ${h.name} takes the collar off you herself, and puts it in a drawer instead of the bin. You marry as equals a month later, and she keeps a say in everything.`; }
  if (kind === "covenant") { fav(s, -5); note(s, "You asked for a year instead of forever."); return `You ask for a year, not forever. ${h.name} agrees to a year. "And then we'll see," she says, and writes the date in her diary.`; }
  if (kind === "worse") { fav(s, -15); r.defied++; note(s, "You asked for something else, and she was not pleased."); pushNorm(s, "cruelty", 3, `${h.name} put the owner in the arcade for a week`); return `You ask for something else. ${h.name} puts you in the arcade for a week "to think about it", and has the citizens' comments read to you when you come out.`; }
  // return: you make her keep it
  r.style = "stern"; r.favour = 20; Object.assign(r, terms(s, h, "stern")); writeRules(s, h, r);
  note(s, "You made her keep the collar, and she's growing into it.");
  return `You won't take it. You tell her she can do this, and she stands there holding it for a long time. Then she puts it back on you, carefully, and the next morning she has a list of terms typed on a single page.`;
}

registerEvents(EVENTS);

/* ── the week under her ─────────────────────────────────────────────────────────────────── */

const line = (text: string, tone: ReportLine["tone"] = "neutral", weight = 6, person?: string): ReportLine => ({ text, tone, weight, person } as ReportLine);

export function tickReign(s: SaveState): ReportLine[] {
  const h = theKeeper(s);
  const out: ReportLine[] = [];
  if (!h) { if (s.reign && !s.reign.ended) s.reign.ended = "over"; return out; }
  let r = reignOf(s);
  if (!r || r.keeper !== h.id) {
    r = startReign(s, h);
    out.push(line(`${h.name} has written down her terms for you.`, "warning", 10, h.id));
    return out;
  }
  const week = s.arcology.week;
  const since = week - r.since;
  const rnd = rng(`reign:${week}:${h.id}`);
  const house = Object.values(s.people).filter((p) => p.status === "owned" && p.id !== h.id && p.age >= 18);
  r.favour = clamp(r.favour * 0.97 + (r.style === "doting" ? 0.5 : 0), -100, 100);

  // The set points.
  const beat = (id: string, at: number, ok = true) => {
    if (!ok || since < at || r!.beats.includes(id) || s.events.some((e) => e.kind.startsWith("reign_"))) return false;
    r!.beats.push(id);
    return !!fireEvent(s, id, { person: h });
  };
  if (beat("reign_name", 3, r.style !== "doting" && r.style !== "reluctant")) out.push(line(`${h.name} has a new name for you.`, "warning", 8, h.id));
  else if (beat("reign_display", 8)) out.push(line(r.shown === "private" ? `${h.name} has decided you stay in the penthouse.` : `${h.name} is throwing a party, and you're the entertainment.`, "warning", 8, h.id));
  else if (house.length && beat("reign_deputy", 14, r.style !== "reluctant")) {
    const d = [...house].sort((a, b) => (s.edges.find((e) => e.from === h.id && e.to === b.id)?.warmth ?? 0) - (s.edges.find((e) => e.from === h.id && e.to === a.id)?.warmth ?? 0))[0];
    r.deputy = d.id;
    out.push(line(`${h.name} is putting ${d.name} in charge of you when she's out.`, "warning", 8, h.id));
  } else if (beat("reign_future", r.style === "reluctant" ? 6 : 26)) out.push(line(`${h.name} has decided what you are to her.`, "warning", 10, h.id));
  else if (since >= 2 && week - (r.last_order ?? -9) >= 2 && !s.events.some((e) => e.kind.startsWith("reign_")) && rnd.chance(0.7)) {
    r.last_order = week;
    fireEvent(s, "reign_order", { person: h });
    out.push(line(`${h.name} has an order for you.`, "warning", 7, h.id));
  }

  // Seen in public.
  const g = h.persona.gregariousness ?? 0.5;
  if (r.shown !== "private" && rnd.chance(g * 0.45)) {
    const where = rnd.pick(["across the concourse", "through the market", "to a café in the plaza", "to the fights in the pit", "to the civic hall"]);
    const how = { doting: "holding your hand", stern: "a step behind her, eyes down", cruel: "on a short chain", playful: "on a leash with a bell", vengeful: "carrying her bags", reluctant: "beside her, where she can see you" }[r.style];
    pushNorm(s, "reversal", 1.5, `${h.name} walks the owner in public`);
    note(s, `She took you ${where}, ${how}.`);
    out.push(line(`${h.name} took you ${where}, ${how}. People looked.`, "neutral", 4, h.id));
  } else pushNorm(s, "reversal", 0.3, `${h.name} holds the owner's collar`);

  // What she does with the household.
  if (house.length && rnd.chance(0.35)) {
    const warm = (p: Person) => s.edges.find((e) => e.from === h.id && e.to === p.id)?.warmth ?? 0;
    const text = decide(s, h, r, house, warm, rnd);
    if (text) { note(s, text); out.push(line(text, "neutral", 7, h.id)); }
  }

  // The court's cases are hers to decide now.
  for (const e of s.events.filter((x) => x.kind.startsWith("court_"))) {
    const id = e.kind.replace(/^court_(enact|repeal)_/, "");
    const l = LAW_BY_ID[id];
    if (!l) continue;
    const sc = lawScore(h, r.style, l);
    const repeal = e.kind.startsWith("court_repeal_");
    const choice = r.style === "reluctant" ? "court" : repeal ? (sc < -10 ? "repeal" : sc > 10 ? "keep" : "court") : (sc > 10 ? "sign" : sc < -10 ? "veto" : "court");
    resolveEvent(s, e, choice);
    const said = repeal ? { repeal: "struck it", keep: "kept it by decree", court: "left it to the court" }[choice as "repeal" | "keep" | "court"] : { sign: "signed it", veto: "vetoed it", court: "left it to the court", exempt: "" }[choice as "sign" | "veto" | "court"];
    const msg = `${h.name} ruled on the ${l.name}: she ${said}.`;
    note(s, msg); out.push(line(msg, "neutral", 7, h.id));
  }

  // And the laws she wants, which she signs herself.
  if (r.style !== "reluctant" && since >= 4 && week - (r.last_law ?? -99) >= 6) {
    const best = LAWS.filter((l) => !lawsOf(s).some((x) => x.id === l.id)).map((l) => ({ l, sc: lawScore(h, r!.style, l) })).sort((a, b) => b.sc - a.sc)[0];
    if (best && best.sc > 15) {
      r.last_law = week;
      const extra = enact(s, best.l, "keeper");
      r.laws.push(best.l.id);
      pushNorm(s, best.l.norm, best.l.dir * 5, `${h.name} signed the ${best.l.name}`);
      const against = (cultureOf(s).norms[best.l.norm] - best.l.at) * best.l.dir < -40;
      if (against) s.arcology.public_standing = clamp(s.arcology.public_standing - 1, -10, 10);
      const msg = `${h.name} signed the ${best.l.name} into law: "${best.l.text}"${extra}${against ? " The city didn't ask for it, and says so." : ""}`;
      note(s, `She signed the ${best.l.name}.`);
      out.push(line(msg, "warning", 8, h.id));
    }
  }
  return out;
}

function decide(s: SaveState, h: Person, r: Reign, house: Person[], warm: (p: Person) => number, rnd: ReturnType<typeof rng>): string {
  const week = s.arcology.week;
  switch (r.style) {
    case "doting": {
      const friend = house.filter((p) => warm(p) > 45).sort((a, b) => warm(b) - warm(a))[0];
      if (friend && rnd.chance(0.3)) { friend.status = "free"; friend.exit_week = week; friend.exit_note = `freed by ${h.name}`; pushNorm(s, "manumission", 3, `${h.name} freed ${friend.name}`); return `${h.name} freed ${friend.name}. She told you afterwards.`; }
      s.arcology.cash -= 1500; for (const p of house) p.bond.hope = clamp(p.bond.hope + 3, 0, 100);
      return `${h.name} gave the whole household a day off and paid for a dinner out of the arcology's accounts.`;
    }
    case "stern": {
      const lazy = [...house].sort((a, b) => a.bond.read.devotion - b.bond.read.devotion)[0];
      if (lazy.assignment !== "work as a servant" && !lazy.facility) { lazy.assignment = "house servant"; applyTreatment(lazy, { kind: "coercion", size: 2, why: `${h.name} reassigned her` }, week); }
      s.arcology.cash += 800;
      return `${h.name} went through the household and the accounts. ${lazy.name} is scrubbing floors now, and the arcology spent ¤800 less.`;
    }
    case "cruel": {
      const hated = house.filter((p) => warm(p) < -20).sort((a, b) => warm(a) - warm(b))[0];
      if (hated && rnd.chance(0.35)) {
        hated.status = "sold"; hated.exit_week = week; hated.exit_note = `sold by ${h.name}`;
        for (const f of Object.values(s.arcology.facilities)) { f.workers = f.workers.filter((w) => w !== hated.id); if (f.manager === hated.id) f.manager = undefined; }
        hated.facility = undefined; s.arcology.cash += 8000;
        return `${h.name} sold ${hated.name} for ¤8,000. You found out when her room was empty.`;
      }
      const t = rnd.pick(house); applyTreatment(t, { kind: "cruelty", size: 5, why: `${h.name} had her whipped` }, week); pushNorm(s, "cruelty", 1, `${h.name}'s household`);
      return `${h.name} had ${t.name} whipped in the atrium, for something nobody could name afterwards.`;
    }
    case "playful": {
      s.arcology.cash -= 3000; s.arcology.rep += 200; for (const p of house) p.bond.hope = clamp(p.bond.hope + 2, 0, 100);
      return `${h.name} threw a party on the terrace and invited half the upper floors. It cost ¤3,000, and people are still talking about it.`;
    }
    case "vengeful": {
      const hurt = house.filter((p) => p.bond.resentment > 35).sort((a, b) => b.bond.resentment - a.bond.resentment)[0];
      if (hurt && rnd.chance(0.4)) { hurt.status = "free"; hurt.exit_week = week; hurt.exit_note = `freed by ${h.name}, because of what you did to her`; pushNorm(s, "manumission", 3, `${h.name} freed a slave the owner had mistreated`); return `${h.name} freed ${hurt.name}. "Because of what you did to her," she told you, "and because I could."`; }
      const fave = house.filter((p) => (p.romance?.standing ?? "property") !== "property")[0];
      if (fave) { fave.assignment = "house servant"; return `${h.name} took ${fave.name} out of your old rooms and put her to scrubbing floors. "You don't get favourites," she said.`; }
      return "";
    }
    case "reluctant":
      return `${h.name} asked you what to do about ${rnd.pick(house).name} again, and did exactly what you said.`;
  }
}

/* ── what the narrator is told ──────────────────────────────────────────────────────────── */

function favourWord(f: number): string {
  return f >= 50 ? "delighted with you" : f >= 20 ? "pleased with you" : f > -20 ? "watching how you do" : f > -50 ? "displeased with you" : "angry with you";
}

/** For her card. */
export function reignCard(s: SaveState, h: Person): string {
  const r = reignOf(s);
  if (!r || r.keeper !== h.id) return "";
  return [
    `SHE OWNS YOU. She holds your collar and runs ${s.arcology.name}; write her that way, every scene. ${STYLE_NOTE[r.style]}`,
    `HER RULES FOR YOU (she enforces them): you call her "${r.her_title}"; she calls you "${r.your_name}"; you wear ${r.dress}; you sleep ${r.sleep}; you ${r.duties.join("; you ")}.`,
    `She is ${favourWord(r.favour)} (you've obeyed ${r.obeyed} times and defied her ${r.defied}). ${r.shown === "public" ? "She likes to show you off in public." : r.shown === "private" ? "She keeps you to herself, in the penthouse." : "Sometimes she takes you out with her."}${r.married ? " She married you, and you are still hers." : ""}${r.permanent && !r.married ? " She made it permanent." : ""}`,
  ].join("\n");
}

/** For everyone else in the household. */
export function householdUnderHer(s: SaveState, p: Person): string {
  const r = reignOf(s);
  const h = r ? s.people[r.keeper] : undefined;
  if (!r || !h) return "";
  const tone = { doting: "The household treats you gently now, and a bit awkwardly.", stern: "The household treats you as her property, politely.", cruel: "Some of the household enjoy seeing you brought low, and she lets them.", playful: "The household finds it funny, and so do you, some days.", vengeful: "The household has watched her pay you back, and some of them have scores of their own.", reluctant: "The household is confused about who is in charge, and so is she." }[r.style];
  return `THE OWNER BELONGS TO ${h.name.toUpperCase()} NOW: she calls you "${r.your_name}" and you wear ${r.dress}. ${tone}${r.deputy === p.id ? ` ${p.name} is in charge of you when ${h.name} is out.` : ""}`;
}

/** For the scene digest, next to the player. */
export function reignBrief(s: SaveState): string {
  const r = reignOf(s);
  const h = r ? s.people[r.keeper] : undefined;
  if (!r || !h) return "";
  return `THE PLAYER BELONGS TO ${h.name}: wears ${r.dress}; sleeps ${r.sleep}; calls her "${r.her_title}"; is called "${r.your_name}". ${STYLE_NOTE[r.style]}`;
}
