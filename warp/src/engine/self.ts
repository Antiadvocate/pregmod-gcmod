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
import { latitudeOf, LATITUDE_LABEL, type Latitude } from "./voice";
import { applyTreatment } from "./obedience";
import { remember } from "./memory";
import type { Person, SaveState } from "./types";
import { deedsOf } from "./deeds";
import { read } from "./obedience";
import { romanceOf } from "./romance";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { calledBy } from "./agreements";

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
  // The player's own rules about themself, not orders to one slave: true for everyone, always.
  const hard = (s.house_rules ?? []).filter((a) => a.by === "you").map((a) => a.rule.trim()).filter((r) => r.length > 6);
  if (hard.length) lines.push(`These are the player's hard lines, in their own words. They hold in every scene and for everyone, whoever owns whom, and they're never broken for a dramatic moment: ${hard.map((r) => `"${r}"`).join(", ")}.`);
  const own = s.player.self?.trim();
  if (own) lines.push(s.player.owned_by
    ? `This is who the player is and what being owned means to them, in their own words, and it wins over anything below. She knows all of this about them, and it shapes how she keeps them. ${own}`
    : `This is the owner in their own words, and it wins over anything below. It describes the owner's character and tastes, and it doesn't hand anyone power over them (see TASTES ARE NOT RANK). ${own}`);
  const t = selfTally(s);
  if (t.gentle + t.harsh === 0) lines.push(`There's nothing on record yet about how they treat people. Take it from their own words and from what they choose in the scene, and don't supply a stock personality.`);
  else if (t.gentle >= t.harsh * 1.5) lines.push(`By the record, they mostly treat people with care, with ${t.gentle} kind things on record against ${t.harsh} harsh ones. Write them as warm, attentive and generous unless the scene has them choose otherwise.${s.player.owned_by ? " That's how the player treats other people, and it says nothing about how she treats the player." : ""}`);
  else if (t.harsh >= t.gentle * 1.5) lines.push(`By the record, they mostly treat people hard, with ${t.harsh} harsh things on record against ${t.gentle} kind ones.`);
  else lines.push(`By the record, how they treat people depends on the person, with ${t.gentle} kind things and ${t.harsh} harsh ones on record.`);
  if (t.bottomed) lines.push(`They're submissive in bed by taste, and they've worshipped their slaves' feet, knelt to them or let them top ${t.bottomed} time${t.bottomed === 1 ? "" : "s"}. Submissive is not subservient. It's what they want sexually, they start it and stop it, and it gives the slave no authority anywhere else. Don't correct it, and don't read it as rank.`);
  if (t.yielded) lines.push(`They have deferred to a slave's authority by choice ${t.yielded} time${t.yielded === 1 ? "" : "s"}, by obeying her, asking her permission or letting her decide. That's part of who they are, and it isn't a weakness for the scene to correct.`);
  const lead = owned(s).concat(Object.values(s.people).filter((p) => p.status === "free" && p.romance)).filter((p) => (p.romance?.dominion ?? -100) >= 40 || s.player.owned_by === p.id);
  if (lead.length) lines.push(`They defer to ${lead.map((p) => p.name).join(" and ")}. With ${lead.length === 1 ? "her" : "them"}, the owner is the submissive one, and willingly.`);
  const partners = Object.values(s.people).filter((p) => ["courted", "betrothed", "wife"].includes(p.romance?.standing ?? "property"));
  if (partners.length) lines.push(`They openly love ${partners.map((p) => `${p.name} (${p.romance!.standing === "wife" ? "wife" : p.romance!.standing})`).join(" and ")}.`);
  const freed = Object.values(s.people).filter((p) => p.status === "free" && p.free_life).length;
  if (freed) lines.push(`They have freed ${freed} of their slaves.`);
  lines.push(`Their household sees them as ${s.player.household_read?.label ?? "nobody in particular"}.`);
  // Ruling by fear works, and this is what it costs.
  const mine = owned(s);
  const scared = mine.filter((p) => { const r = read(p, s.memory[p.id]); return r.fragility > 0.6 && p.bond.fear >= 40; });
  if (mine.length >= 2 && scared.length * 2 >= mine.length) lines.push(`Their house runs on fear: ${scared.length} of ${mine.length} are afraid of them. It's obedient and quiet. Nobody steps out of line, nobody surprises them, nobody seeks them out or tells them anything they didn't ask for, and every woman in it is the same woman around them.`);
  const beliefs = Object.entries(s.arcology.doctrines as Record<string, { adoption: number }>).filter(([, d]) => d.adoption >= 30).sort((a, b) => b[1].adoption - a[1].adoption).slice(0, 3).map(([id]) => DOCTRINE_BY_ID[id]?.noun ?? id);
  if (beliefs.length) lines.push(`They have built their city on ${beliefs.join(", ")}.`);
  const words = ownWords(s);
  if (words.length) lines.push(`This is how they actually talk, going by what they've recently said and done: ${words.map((w) => `"${w}"`).join(" | ")}`);
  if (!s.player.owned_by) lines.push(TASTE_IS_NOT_RANK);
  return lines;
}

/** The line between what the owner likes in bed and who owns whom. A player who writes that they're
 *  submissive to women who use their feet, or like being humiliated, got slaves who set terms,
 *  made deals about their own bodies, told the owner where to sit and claimed they'd "put him
 *  here", and who answered "I own you" with a lecture. */
export const TASTE_IS_NOT_RANK = `TASTES ARE NOT RANK. Whatever the owner likes in bed happens because the owner wants it, when the owner starts it, and only for as long as the owner keeps it going. That covers kneeling, worshipping her feet, being teased or humiliated, being cuckolded, and anything else their own words say. None of it gives a slave any authority. Unless she's named as someone they defer to, a slave never makes deals with the owner or sets terms, prices, schedules or conditions for him. She never decides who gets which part of her body, never says she put the owner anywhere, and never lectures him. She can tease him and give directions inside the act if he wants that, and that's all. If the owner says something is secret, it stays private, with no witnesses. The moment the owner speaks as the owner, the play is over. That means if he stands up, gives an order, gets angry, raises his voice or says he owns her, she drops it at once and answers as what she is, his slave, with real fear if he's angry.`;

export function selfBrief(s: SaveState): string {
  return `WHO THE OWNER IS. This comes from how the player has actually played. Write the owner true to it, in their manner, their words and how they treat people. You can write what the owner says and does freely, but as this person. Never fall back on a stock cold, cutthroat slave-owner, and never make them harsher, softer, more in charge or less in charge than this.\n${selfProfile(s).map((l) => `· ${l}`).join("\n")}`;
}

/** Whether she's reached open defiance: hating you, not held by fear, and not broken. */
export function openlyDefiant(s: SaveState, p: Person): boolean {
  const r = read(p, s.memory[p.id]);
  return r.devotion < -45 && r.fragility < 0.45 && p.bond.resentment > 55 && p.psyche.state === "intact";
}

/** HOW A SLAVE SPEAKS TO HER OWNER. From the original game, where every slave who speaks to the
 *  player says "Master" and a refusal is a plea ("That thing hurts, Master. Please don't make me
 *  wear it."), and from how the enslaved actually had to speak: by title, with leave, asking as
 *  petition, and keeping what they felt under the forms (what historians call the public and the
 *  hidden transcript). Love and trust change what she feels, not her place. */
export const SLAVE_SPEECH = `HOW SHE SPEAKS TO YOU. She speaks as a slave to her owner, always, however much she trusts or loves you, until you give her leave to do otherwise. She calls you by your title, never your name, and uses it often. She speaks when she's spoken to, or asks first ("May I say something, Master?"). She doesn't contradict you, correct you, argue, joke at your expense, tease you, bargain, set terms, give ultimatums or say no. When she can't bear something, it comes out as a plea ("Please, Master, not that." "It hurts, Master. Please don't make me."). What she wants comes out as a petition ("If it pleases you..." "Would you let me...?"). Closeness makes her more devoted rather than more familiar. She tells you she loves you, thanks you, wants to please you and asks to stay, but she never talks to you like a girlfriend, a friend or a coworker. She never says things like "hey", "honestly", "look,", "take it or leave it", "I'm not going to do that", "we need to talk", "fine, whatever" or "seriously?", and she never rolls her eyes or sighs at you. Trust means she tells you the truth and isn't afraid of you, but it doesn't make her forget what she is. Resentment shows the way it always has in people who are owned, underneath the deference and never instead of it. It shows in a flat "Yes, Master", in slowness and silence, in doing exactly what she was told and nothing more, in her eyes staying on the floor, and in what she says to the other girls afterwards.`;

/** For her card: who holds the power between the two of you, and how that sounds. */
export function powerBetween(s: SaveState, p: Person): string {
  const rom = romanceOf(p);
  const d = rom.dominion ?? -100;
  if (s.player.owned_by === p.id) return "";   // the reign card says it
  if (p.status === "free") {
    return ["courted", "betrothed", "wife"].includes(rom.standing)
      ? `THE POWER BETWEEN YOU. She's free and she's your ${rom.standing === "wife" ? "wife" : rom.standing === "betrothed" ? "fiancée" : "partner"}, so you're equals${d >= 40 ? ", and in private she leads" : ""}. She still knows you own the city around her.`
      : `THE POWER BETWEEN YOU. She's free now, and she speaks to you as a free woman who used to be your property, in a city you own.`;
  }
  if (d >= 40) {
    const scared = p.bond.fear >= 60 && (read(p, s.memory[p.id]).fragility >= 0.5 || p.bond.bond <= 0);
    return `THE POWER BETWEEN YOU. She holds it. Between the two of you she leads and you defer, by your own choice. She can tell you what to do, tease you and refuse you, and she expects to be obeyed. In front of other people she knows you're still the owner of the arcology.${scared ? " But right now she's terrified of you. When you speak as her owner, give an order or threaten her, the lead is yours again, and she does what you say at once, and doesn't argue, correct or lecture you." : ""}`;
  }
  const lat = latitudeOf(p);
  const own = `THE POWER BETWEEN YOU. You own her, and you own the city, with its laws, its guards and its army. She knows exactly what you can do to her. If you kneel to her or worship her for your own pleasure, that's yours to start and stop. It gives her no say over you, and she doesn't bargain with it.`;
  if (lat === "free") return `${own} But you've given her leave to talk to you freely, however she likes, as an equal in words${rom.standing === "wife" ? " (she's your wife)" : ""}. She can call you by name, argue, tease you, refuse you to your face and say what she thinks. She's still yours on paper, and if you speak as her owner she remembers it.`;
  if (lat === "latitude") return `${own} You've given her some latitude${rom.standing === "courted" ? " (you're courting her)" : rom.standing === "betrothed" ? " (she's promised to you)" : ""}. She can speak her mind, disagree respectfully, tease you a little, ask for things freely and say no to small things if she gives a reason. She still calls you by your title, still knows she's yours, and drops back into her place at once if you speak as her owner.${d >= 0 ? " She has a real say with you and uses it." : ""}`;
  if (openlyDefiant(s, p)) return `${own} She's reached open defiance. She may talk back to you, refuse you or curse you, knowing exactly what it can cost her in a city you own. Write the defiance as a slave's defiance, which is a crisis with the fear plainly underneath it, and not banter.`;
  // The examples are in her title for you, or a "Sir" slave copies "Master" off them.
  return `${own} ${SLAVE_SPEECH.replace(/\bMaster\b/g, calledBy(s, p))}${rom.standing !== "property" ? ` She's your ${rom.standing === "favourite" ? "favourite" : "kept woman"}, so she's closer to you than the rest, but she still speaks as a slave.` : ""}`;
}

/** You tell her how she may speak to you. Leave given is something she's glad of; taken back, she
 *  remembers being put in her place. `undefined` goes back to what her standing gives her. */
export function setLatitude(s: SaveState, p: Person, lat: Latitude | undefined): void {
  const rank = { slave: 0, latitude: 1, free: 2 };
  const before = rank[latitudeOf(p)];
  if (lat) p.latitude = lat; else delete p.latitude;
  const after = rank[latitudeOf(p)];
  if (after === before) return;
  const week = s.arcology.week;
  const first = p.name.split(" ")[0];
  if (after > before) applyTreatment(p, { kind: "recognition", size: 2 + after, why: "the owner gave her leave to speak more freely" }, week);
  else applyTreatment(p, { kind: "coercion", size: 1 + before - after, why: "the owner told her to remember her place" }, week);
  const mem = s.memory[p.id];
  if (mem) remember(mem, { content: after > before ? `The owner gave ${first} leave to speak to them ${LATITUDE_LABEL[latitudeOf(p)]}` : `The owner told ${first} to speak to them as a slave again`, week, importance: 6, charge: after > before ? "warm" : "cold" });
}
