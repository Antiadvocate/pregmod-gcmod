/**
 * IDOLS AND OFFICE WORK — jobs that aren't sex.
 *
 * An idol sings, dances, streams and signs things, and the arcology watches her. She has fans,
 * an image you choose, and the trouble that comes with being watched: a fan who waits outside the
 * service door, photos that leak, a rival idol across the strait, a brand that wants her face.
 * Office work pays by what's in her head. A secretary works for you, and catches money you were
 * losing.
 */
import type { Person, SaveState } from "./types";
import { clamp } from "./psyche";
import { applyTreatment, read } from "./obedience";
import { appeal } from "./economy";
import { startRumor } from "./social";
import { registerEvents, type EventDef } from "./events";
import { practise } from "./player";

export type IdolImage = "sweet" | "sexy" | "cool" | "bad girl";
export const IDOL_IMAGES: Record<IdolImage, string> = {
  sweet: "girl-next-door: smiles, bows, no scandals",
  sexy: "all legs and pouts; more fans, more trouble",
  cool: "aloof and serious; fewer fans, more loyal ones",
  "bad girl": "swears on stream and gets arrested on purpose",
};

export interface Idol { fans: number; image: IdolImage; weeks: number; peak: number }

export function idolOf(p: Person): Idol {
  return (p.idol ??= { fans: 0, image: "sweet", weeks: 0, peak: 0 });
}

const IMAGE_MULT: Record<IdolImage, number> = { sweet: 1, sexy: 1.3, cool: 0.8, "bad girl": 1.15 };

/** Weekly, per person: fans grow while she works and fade when she doesn't. */
export function tickIdol(s: SaveState, p: Person): string[] {
  const out: string[] = [];
  if (p.assignment === "be your secretary") practise(s, "trading", 0.4);
  if (p.assignment !== "be an idol") {
    if (p.idol && p.idol.fans > 0) p.idol.fans = Math.round(p.idol.fans * 0.9);
    return out;
  }
  const i = idolOf(p);
  i.weeks++;
  const dev = read(p, s.memory[p.id]).devotion;
  const willing = clamp(1 + dev / 200, 0.5, 1.5);
  const target = appeal(p) * ((p.skills.entertainment + 30) / 100) * willing * 3200 * IMAGE_MULT[i.image] * clamp(s.arcology.population / 1200, 0.5, 3) * (1 + p.fame.prestige * 0.25);
  const before = i.fans;
  i.fans = Math.max(0, Math.round(i.fans + (target - i.fans) * 0.16 + 20));
  i.peak = Math.max(i.peak, i.fans);
  p.skills.entertainment = clamp(p.skills.entertainment + 1.2, 0, 100);
  const tier = i.fans >= 15000 ? 3 : i.fans >= 5000 ? 2 : i.fans >= 1500 ? 1 : 0;
  if (tier > p.fame.prestige) {
    p.fame.prestige = tier as 1 | 2 | 3;
    p.fame.why = `an idol with ${i.fans.toLocaleString()} fans`;
    out.push(`${p.name} has ${i.fans.toLocaleString()} fans now. People stop her in the corridors.`);
  }
  if (before < 1000 && i.fans >= 1000) startRumor(s, `${p.name} is the arcology's new idol`, { about: p.id, salience: 6, charge: 1 });
  return out;
}

/** What she earns this week at one of these jobs, or null for the ordinary sums. */
export function jobMoney(s: SaveState, p: Person): { income: number; rep: number; note: string } | null {
  const prosperity = clamp(s.arcology.prosperity / 100, 0.3, 2);
  const dev = p.bond.read.devotion;
  const willing = clamp(1 + dev / 220, 0.55, 1.45);
  if (p.assignment === "be an idol") {
    const i = idolOf(p);
    return { income: Math.round(i.fans * 0.55 * prosperity), rep: Math.round(3 + i.fans / 500), note: `${i.fans.toLocaleString()} fans` };
  }
  if (p.assignment === "work in an office") {
    const brains = { impaired: -1, slow: -0.4, average: 0, sharp: 0.6, brilliant: 1.2 }[p.persona.intelligence];
    return { income: Math.round((320 + p.persona.education * 7 + brains * 260) * willing * prosperity), rep: 1, note: "office work" };
  }
  if (p.assignment === "be your secretary") {
    return { income: 0, rep: 2, note: "your secretary" };
  }
  return null;
}

/** A secretary catches overcharges: a share of the week's upkeep comes back. */
export function secretaryRebate(s: SaveState, upkeep: number): { cash: number; who?: Person } {
  const sec = Object.values(s.people).find((p) => p.status === "owned" && p.assignment === "be your secretary");
  if (!sec) return { cash: 0 };
  const skill = { impaired: 0.2, slow: 0.5, average: 1, sharp: 1.4, brilliant: 1.8 }[sec.persona.intelligence];
  return { cash: Math.round(upkeep * 0.04 * skill * clamp(1 + sec.bond.read.devotion / 200, 0.5, 1.5)), who: sec };
}

/* ── what being watched brings ──────────────────────────────────────────────────────────────── */

const idols = (s: SaveState) => Object.values(s.people).filter((p) => p.status === "owned" && p.assignment === "be an idol" && p.age >= 18);
const fans = (p: Person, n: number) => { const i = idolOf(p); i.fans = Math.max(0, Math.round(i.fans * n)); };

const IDOL_EVENTS: EventDef[] = [
  {
    id: "idol_fan", severity: "notable", endogenous: true,
    candidates: (s) => idols(s).filter((p) => idolOf(p).fans > 600).map((person) => ({ person })),
    weight: (_s, c) => 2 + idolOf(c.person!).fans / 3000,
    seed: (_s, c) => `There's a man who waits outside the service entrance every night for ${c.person!.name}. He brings flowers. Last night he brought a scrapbook of every photo of her ever posted, with notes in the margins in very small handwriting, and asked the guard to give it to her.\n\n${c.person!.name} has seen him through the window. She wants to know what you're going to do.`,
    options: [
      { id: "meet", label: "Let her meet him, with a guard in the room", note: "fans love it when it goes well",
        resolve: (s, _e, p) => { const ok = read(p!).devotion > 10; if (ok) { fans(p!, 1.12); applyTreatment(p!, { kind: "recognition", size: 3, why: "you let her meet her biggest fan" }, s.arcology.week); } else applyTreatment(p!, { kind: "coercion", size: 3, why: "made to meet the man who waits outside", }, s.arcology.week);
          return ok ? `${p!.name} meets him for twenty minutes in the lobby. He cries. She signs his scrapbook, lets him hold her hand, and gives him a kiss on the cheek that he posts about for a week. Her fans go wild.` : `${p!.name} sits across from him with her arms folded and answers everything in one word. He leaves happy anyway. She goes straight to the showers afterwards.`; } },
      { id: "sell", label: "Sell him an hour alone with her", note: "¤4,000",
        resolve: (s, _e, p) => { s.arcology.cash += 4000; applyTreatment(p!, { kind: "coercion", size: 5, why: "sold to her stalker for an hour", }, s.arcology.week); fans(p!, 0.95); startRumor(s, `the owner sells ${p!.name} to her fans`, { about: p!.id, salience: 6 });
          return `He pays ¤4,000 without blinking. What happens in the hour is between him and ${p!.name}. She won't talk about it afterwards, and when the story gets out, some of her fans are disgusted and some of them start saving up.`; } },
      { id: "ban", label: "Have security ban him from the arcology",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 2, why: "you had the man who waits outside banned", }, s.arcology.week);
          return `Security walks him to the docks and tells him not to come back. ${p!.name} watches from the window, relieved, and a little sad. He posts a long, bitter thread about her that gets a lot of attention.`; } },
    ],
  },
  {
    id: "idol_scandal", severity: "notable", endogenous: true,
    candidates: (s) => idols(s).filter((p) => idolOf(p).fans > 1500).map((person) => ({ person })),
    weight: (_s, c) => (idolOf(c.person!).image === "bad girl" ? 5 : idolOf(c.person!).image === "sexy" ? 3.5 : 2),
    seed: (_s, c) => `Photos of ${c.person!.name} are all over the arcology feeds this morning: her on her knees in a service corridor with two of your guards, taken on someone's phone. Her fans are fighting about it in every comment section.`,
    options: [
      { id: "lean", label: "Lean into it: she's a bad girl now", note: "more fans, less respect",
        resolve: (s, _e, p) => { idolOf(p!).image = "bad girl"; fans(p!, 1.3); s.arcology.rep = Math.max(0, s.arcology.rep - 150); return `You have ${p!.name} post a photo the next day, from the same corridor, winking. Her fan count jumps by a third overnight. Some of the older citizens stop coming to her shows.`; } },
      { id: "deny", label: "Say the photos are fake", note: "some fans believe it",
        resolve: (_s, _e, p) => { fans(p!, 0.9); return `Your people put out a statement that the photos are fakes, with a technician's report attached. About half of her fans believe it. The other half make memes of the corridor, and ${p!.name} has to smile through a week of shows where someone in the crowd is always holding one up.`; } },
      { id: "apology", label: "Have her record a tearful apology", note: "¤2,000; the sweet image survives",
        resolve: (s, _e, p) => { s.arcology.cash -= 2000; fans(p!, 1.05); applyTreatment(p!, { kind: "coercion", size: 3, why: "made to apologise on camera for the photos", }, s.arcology.week); return `${p!.name} records the apology in a white dress, with no make-up, crying real tears on the third take. It's the most-watched thing she's ever done.`; } },
      { id: "punish", label: "Punish her and the guards", note: "fans lose interest",
        resolve: (s, _e, p) => { fans(p!, 0.8); applyTreatment(p!, { kind: "cruelty", size: 5, why: "punished for the photos", }, s.arcology.week); return `You have ${p!.name} and both guards whipped. She misses two weeks of shows, and her fans find someone else to watch.`; } },
    ],
  },
  {
    id: "idol_rival", severity: "notable", endogenous: false,
    candidates: (s) => idols(s).filter((p) => idolOf(p).fans > 2500).map((person) => ({ person })),
    weight: () => 1.5,
    seed: (s, c) => `${s.arcology.neighbours[0]?.name ?? "The arcology across the strait"} has an idol of its own, and she's challenged ${c.person!.name} to a live sing-off on both arcologies' feeds. The loser's owner pays ¤5,000 to charity, and everyone will be watching.`,
    options: [
      { id: "accept", label: "Accept the challenge", note: "win and her fans double; lose and they don't forgive it",
        resolve: (s, _e, p) => { const win = p!.skills.entertainment + read(p!).devotion / 3 + (s.arcology.week % 17) > 70;
          if (win) { fans(p!, 1.7); s.arcology.rep += 400; applyTreatment(p!, { kind: "recognition", size: 7, why: "won the sing-off", }, s.arcology.week); return `${p!.name} wins, by a lot. The other girl forgets the words to her second song and cries on the feed. ${p!.name}'s fans take over the other arcology's comment sections for a week.`; }
          fans(p!, 0.75); s.arcology.cash -= 5000; applyTreatment(p!, { kind: "cruelty", size: 2, why: "lost the sing-off in front of everyone", }, s.arcology.week); return `${p!.name} loses. She's good, but the other girl is better, and everyone saw it. You pay the ¤5,000. ${p!.name} doesn't come out of her room for two days.`; } },
      { id: "sabotage", label: "Pay someone to make sure the other girl loses", note: "¤3,000; if it comes out, it's bad",
        resolve: (s, _e, p) => { s.arcology.cash -= 3000; fans(p!, 1.5); if (s.arcology.week % 3 === 0) { s.arcology.rep = Math.max(0, s.arcology.rep - 600); return `The other girl's microphone cuts out halfway through. ${p!.name} wins. Then the technician you paid gets drunk and tells everyone. It costs you a lot of respect.`; } return `The other girl's microphone cuts out halfway through her best song. ${p!.name} wins easily and never finds out why.`; } },
      { id: "refuse", label: "Refuse", resolve: (_s, _e, p) => { fans(p!, 0.93); return `You refuse. The other arcology's feeds call ${p!.name} a coward for a week, and some of her fans drift over to the other girl. ${p!.name} watches the other girl's streams at night with the sound off.`; } },
    ],
  },
  {
    id: "idol_sponsor", severity: "minor", endogenous: false,
    candidates: (s) => idols(s).filter((p) => idolOf(p).fans > 1200).map((person) => ({ person })),
    weight: () => 2,
    seed: (_s, c) => `A lingerie company wants ${c.person!.name}'s face on a campaign that'll run in every Free City on this coast. They're offering ¤8,000, and they want the photos to be "honest."`,
    options: [
      { id: "take", label: "Take the deal", note: "¤8,000; her image turns sexy",
        resolve: (s, _e, p) => { s.arcology.cash += 8000; idolOf(p!).image = "sexy"; fans(p!, 1.25); return `The shoot takes two days. The campaign goes up on billboards in six arcologies, and ${p!.name} is recognised on the docks by sailors who've never been here before.`; } },
      { id: "counter", label: "Ask for double", note: "they might walk",
        resolve: (s, _e, p) => { if (idolOf(p!).fans > 4000) { s.arcology.cash += 16000; fans(p!, 1.2); return `They pay double. ${p!.name}'s face is worth it, and they know it.`; } return `They walk. A month later the campaign runs with a girl from the arcology across the strait, and ${p!.name} asks you, very carefully, whether she did something wrong.`; } },
      { id: "no", label: "No", resolve: (_s, _e, p) => `You say no. A month later the same campaign runs with a girl from the arcology across the strait, in the same poses, and ${p!.name} sees it on a billboard on the docks and doesn't say anything.` },
    ],
  },
  {
    id: "office_manager", severity: "minor", endogenous: true,
    candidates: (s) => Object.values(s.people).filter((p) => p.status === "owned" && p.assignment === "work in an office" && p.age >= 18).map((person) => ({ person })),
    weight: () => 1.5,
    seed: (_s, c) => `The citizen who manages the office ${c.person!.name} works in has been keeping her late, and she's been coming back to the penthouse with her blouse buttoned wrong. Today he sent a message: he'd like to buy her contract outright, and he names a good price.`,
    options: [
      { id: "sell", label: "Sell her to him", note: "a good price",
        resolve: (s, _e, p) => { p!.status = "sold"; p!.exit_week = s.arcology.week; p!.exit_note = "sold to the manager of the office she worked in"; s.arcology.cash += 12000; return `You sell ${p!.name} to him for ¤12,000. She packs her things in silence and is at his desk on Monday.`; } },
      { id: "fee", label: "Charge him for the evenings instead", note: "¤1,500 a week, for a while",
        resolve: (s, _e, p) => { s.arcology.cash += 1500; applyTreatment(p!, { kind: "coercion", size: 3, why: "rented to her office manager in the evenings", }, s.arcology.week); return `You send him a bill for the evenings. He pays it. ${p!.name} keeps working late.`; } },
      { id: "stop", label: "Tell him to keep his hands off her", note: "she'll know you did",
        resolve: (s, _e, p) => { applyTreatment(p!, { kind: "kindness", size: 4, why: "you told her office manager to leave her alone", }, s.arcology.week); return `You tell him that ${p!.name} is yours, not his, and that he should remember it. She comes home on time the next day and doesn't say anything, but she brings you coffee without being asked.`; } },
    ],
  },
];

registerEvents(IDOL_EVENTS);
