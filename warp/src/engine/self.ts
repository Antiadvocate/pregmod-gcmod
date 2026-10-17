/**
 * WHO YOU ARE — read from how you've actually played, and from what you say about yourself.
 *
 * Every prompt is told the owner's body. None of them were told the owner's character, so whenever
 * a scene needed you to say or do something the model reached for the stock figure, a cold and
 * cutthroat slave-owner, whoever you'd been for the last forty weeks. Here the record is read
 * instead: whether what you've done has been gentle or harsh, who you kneel to, who you've married
 * or freed, what your household thinks of you, what your city believes, and your own recent words.
 * What you write about yourself on the You screen sits over all of it.
 *
 * The other half is THE POWER BETWEEN YOU AND HER, on her card: whether you own her outright, she
 * has some say, she leads between the two of you, or she's free. A slave who hates her owner
 * doesn't tell him to fuck off like a character in a drama; she shows it the way slaves do, unless
 * she has actually reached open defiance.
 */
import type { Person, SaveState } from "./types";
import { deedsOf } from "./deeds";
import { read } from "./obedience";
import { romanceOf } from "./romance";
import { DOCTRINE_BY_ID } from "../data/doctrines";

const GENTLE = ["tenderness", "mercy", "gift", "gratitude", "freed_her", "married_her", "confided", "promise_made", "elevated"];
const HARSH = ["cruelty", "punished", "humiliated_her", "threatened_sale", "promise_broken", "shared_her"];
const YIELD = ["owner_submitted", "owner_enslaved"];
/** Sexual submission and worship: the owner's taste. Counted apart from YIELD, because submissive
 *  is not subservient and the narrator kept reading one as the other. */
const BOTTOM = ["bottomed", "feet_worship"];

const owned = (s: SaveState) => Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");

/** The record, counted. */
export function selfTally(s: SaveState): { gentle: number; harsh: number; yielded: number; bottomed: number } {
  let gentle = 0, harsh = 0, yielded = 0, bottomed = 0;
  for (const d of deedsOf(s)) for (const t of d.tags) {
    if (GENTLE.includes(t)) gentle++;
    if (HARSH.includes(t)) harsh++;
    if (YIELD.includes(t)) yielded++;
    if (BOTTOM.includes(t)) bottomed++;
  }
  return { gentle, harsh, yielded, bottomed };
}

/** Your own recent words: what you typed and chose, newest last. */
function ownWords(s: SaveState, n = 6): string[] {
  const out: { week: number; t: string }[] = [];
  for (const h of s.history.slice(-12)) if (h.action && h.mode !== "story" && h.mode !== "think") out.push({ week: h.week, t: h.action });
  for (const m of (s.moments ?? []).slice(-6)) for (const l of m.log) if (l.role === "you") out.push({ week: m.updated, t: l.text });
  return out.sort((a, b) => a.week - b.week).slice(-n).map((x) => x.t.replace(/\s+/g, " ").slice(0, 140));
}

/** Everything the narrator needs to write you as you. */
export function selfProfile(s: SaveState): string[] {
  const lines: string[] = [];
  const own = s.player.self?.trim();
  if (own) lines.push(`In the owner's own words, which win over anything below (they describe the owner's character and tastes, not a transfer of power; see TASTES ARE NOT RANK): ${own}`);
  const t = selfTally(s);
  if (t.gentle + t.harsh === 0) lines.push(`Nothing on record yet about how they treat people: take it from their own words and what they choose in the scene, and don't supply a stock personality.`);
  else if (t.gentle >= t.harsh * 1.5) lines.push(`How they treat people, by the record: mostly with care (${t.gentle} kind things on record against ${t.harsh} harsh). Write them warm, attentive and generous unless the scene has them choose otherwise.`);
  else if (t.harsh >= t.gentle * 1.5) lines.push(`How they treat people, by the record: mostly hard (${t.harsh} harsh things on record against ${t.gentle} kind).`);
  else lines.push(`How they treat people, by the record: it depends on the person (${t.gentle} kind things, ${t.harsh} harsh).`);
  if (t.bottomed) lines.push(`They're submissive in bed by taste: they have worshipped their slaves' feet, knelt to them or let them top ${t.bottomed} time${t.bottomed === 1 ? "" : "s"}. Submissive is not subservient. It's what they want sexually, they start it and stop it, and it gives the slave no authority anywhere else; don't correct it, and don't read it as rank.`);
  if (t.yielded) lines.push(`They have deferred to a slave's authority by choice ${t.yielded} time${t.yielded === 1 ? "" : "s"}: obeyed her, asked her permission, let her decide. That is part of who they are, not a weakness the scene should correct.`);
  const lead = owned(s).concat(Object.values(s.people).filter((p) => p.status === "free" && p.romance)).filter((p) => (p.romance?.dominion ?? -100) >= 40 || s.player.owned_by === p.id);
  if (lead.length) lines.push(`Who they defer to: ${lead.map((p) => p.name).join(", ")}. With ${lead.length === 1 ? "her" : "them"} the owner is the submissive one, willingly.`);
  const partners = Object.values(s.people).filter((p) => ["courted", "betrothed", "wife"].includes(p.romance?.standing ?? "property"));
  if (partners.length) lines.push(`Who they love openly: ${partners.map((p) => `${p.name} (${p.romance!.standing === "wife" ? "wife" : p.romance!.standing})`).join(", ")}.`);
  const freed = Object.values(s.people).filter((p) => p.status === "free" && p.free_life).length;
  if (freed) lines.push(`They have freed ${freed} of their slaves.`);
  lines.push(`Their household sees them as ${s.player.household_read?.label ?? "nobody in particular"}.`);
  const beliefs = Object.entries(s.arcology.doctrines as Record<string, { adoption: number }>).filter(([, d]) => d.adoption >= 30).sort((a, b) => b[1].adoption - a[1].adoption).slice(0, 3).map(([id]) => DOCTRINE_BY_ID[id]?.noun ?? id);
  if (beliefs.length) lines.push(`What they have built their city on: ${beliefs.join(", ")}.`);
  const words = ownWords(s);
  if (words.length) lines.push(`How they actually talk, from what they've recently said and done: ${words.map((w) => `"${w}"`).join(" | ")}`);
  if (!s.player.owned_by) lines.push(TASTE_IS_NOT_RANK);
  return lines;
}

/** The line between what the owner likes in bed and who owns whom. A player who writes that they're
 *  submissive to women who use their feet, or like being humiliated, got slaves who set terms,
 *  made deals about their own bodies, told the owner where to sit and claimed they'd "put him
 *  here", and who answered "I own you" with a lecture. */
export const TASTE_IS_NOT_RANK = `TASTES ARE NOT RANK. What the owner likes in bed (kneeling, worshipping her feet, being teased or humiliated, being cuckolded, whatever their own words say) happens because the owner wants it, when the owner starts it, and only for as long as the owner keeps it going. It gives a slave no authority. Unless she's named under "Who they defer to", a slave never makes deals with the owner, never sets terms, prices, schedules or conditions for him, never decides who gets which part of her body, never says she put the owner anywhere, and never lectures him. She can tease and give directions inside the act if he wants that, and that's all. If the owner says something is secret, it stays private: no witnesses. The moment the owner speaks as the owner (stands up, gives an order, gets angry, raises their voice, says they own her), the play is over: she drops it at once and answers as what she is, his slave, with real fear if he's angry.`;

export function selfBrief(s: SaveState): string {
  return `WHO THE OWNER IS (from how the player has actually played; write the owner true to this: their manner, their words, how they treat people. You may write what the owner says and does, freely, but as this person. Never fall back on a stock cold, cutthroat slave-owner, and never make them harsher, softer, more or less in charge than this):\n${selfProfile(s).map((l) => `· ${l}`).join("\n")}`;
}

/** Whether she's reached open defiance: hating you, not held by fear, and not broken. */
export function openlyDefiant(s: SaveState, p: Person): boolean {
  const r = read(p, s.memory[p.id]);
  return r.devotion < -45 && r.fragility < 0.45 && p.bond.resentment > 55 && p.psyche.state === "intact";
}

/** For her card: who holds the power between the two of you, and how that sounds. */
export function powerBetween(s: SaveState, p: Person): string {
  const rom = romanceOf(p);
  const d = rom.dominion ?? -100;
  if (s.player.owned_by === p.id) return "";   // the reign card says it
  if (p.status === "free") {
    return ["courted", "betrothed", "wife"].includes(rom.standing)
      ? `THE POWER BETWEEN YOU: she's free and your ${rom.standing === "wife" ? "wife" : rom.standing === "betrothed" ? "fiancée" : "partner"}; you're equals${d >= 40 ? ", and in private she leads" : ""}. She still knows you own the city around her.`
      : `THE POWER BETWEEN YOU: she's free now, and she speaks to you as a free woman who used to be your property, in a city you own.`;
  }
  if (d >= 40) return `THE POWER BETWEEN YOU: she holds it. Between the two of you she leads and you defer, by your own choice; she can tell you what to do, tease you, refuse you, and expects to be obeyed. In front of others she knows you're still the owner of the arcology.`;
  if (d >= 0) return `THE POWER BETWEEN YOU: she has a real say with you and uses it: she asks, pushes, sulks, bargains. You're still her owner and the owner of the city, and she never forgets it.`;
  if (openlyDefiant(s, p)) return `THE POWER BETWEEN YOU: you own her, and she's reached open defiance: she may talk back, refuse or curse you, knowing exactly what it can cost her in a city you own. Write the defiance as a slave's, with the fear under it.`;
  return `THE POWER BETWEEN YOU: you own her, and you own the city: its laws, its guards, its army. She knows exactly what you can do to her. If you kneel to her or worship her for your own pleasure, that's yours to start and stop; it gives her no say over you, and she doesn't bargain with it. She doesn't tell you to fuck off, mock you, order you about or walk away from you. Whatever she feels shows the way it shows in a slave: in her face, her silences, her slowness, what she leaves unsaid, what she says to the others afterwards.${rom.standing !== "property" ? ` She's your ${rom.standing === "favourite" ? "favourite" : "kept woman"}, and that gives her a little more room with you than the rest.` : ""}`;
}
