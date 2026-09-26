/**
 * A LAW IN THE LIFE OF THE CITY — what people say and do about the laws in force.
 *
 * A law that only moves numbers is invisible. This makes each one, and above all the ones you
 * write, show up: the day it passes, a rumour and every slave's reaction to it; every couple of
 * weeks a line in the report on how the city is keeping it; and events about that law by name —
 * someone breaking it, one of your own slaves breaking it, people celebrating it, people protesting
 * it, the Old World press writing about it. What you do in those moves the same habits the law
 * does, and says whether the law means anything.
 */
import type { Person, SaveState } from "./types";
import { clamp } from "./psyche";
import { cultureOf, pushNorm, type Norm } from "./culture";
import { lawsOf, repealByDecree } from "./court";
import { LAW_BY_ID, type LawDef } from "../data/laws";
import { registerEvents, fireEvent, type EventDef } from "./events";
import { applyTreatment } from "./obedience";
import { remember } from "./memory";
import { startRumor } from "./social";
import { rng } from "./rng";

const std = (s: SaveState, by: number) => { s.arcology.public_standing = clamp(s.arcology.public_standing + by, -10, 10); };
const owned = (s: SaveState): Person[] => Object.values(s.people).filter((p) => p.status === "owned" && p.age >= 18);
const isCustom = (id: string) => id.startsWith("custom_");

/** How the city stands on a law: + keeping it, − against it. */
function support(s: SaveState, l: LawDef): number {
  const norms = cultureOf(s).norms;
  let n = 0, k = 0;
  for (const [norm, v] of Object.entries(l.pull) as [Norm, number][]) { n += norms[norm] * Math.sign(v); k++; }
  return k ? n / k : 0;
}

/** Push every habit the law pushes, by `by` in the law's direction (negative undoes it). */
function pushWithLaw(s: SaveState, l: LawDef, by: number, why: string) {
  for (const [norm, v] of Object.entries(l.pull) as [Norm, number][]) pushNorm(s, norm, Math.sign(v) * by, why);
}

/** The day it passes: the city hears, and your household reacts. */
export function lawPassed(s: SaveState, l: LawDef): void {
  startRumor(s, `the owner has made a new law, the ${l.name}: ${l.text}`, { salience: 8 });
  const effects = (s.custom_laws ?? []).find((c) => c.id === l.id)?.effects ?? [];
  const good = effects.includes("hope") || effects.includes("care") || (l.pull.cruelty ?? 0) < 0 || (l.pull.personhood ?? 0) > 0 || (l.pull.manumission ?? 0) > 0;
  const bad = effects.includes("fear") || (l.pull.cruelty ?? 0) > 0 || (l.pull.personhood ?? 0) < 0;
  for (const p of owned(s)) {
    const m = s.memory[p.id];
    if (m) remember(m, { content: `the owner made the ${l.name} law: ${l.text}`, week: s.arcology.week, importance: 5, charge: good && !bad ? "warm" : bad && !good ? "cold" : "dull" });
    if (good && !bad) p.bond.hope = clamp(p.bond.hope + 3, 0, 100);
    if (bad && !good) p.bond.fear = clamp(p.bond.fear + 3, 0, 100);
  }
}

/** Every couple of weeks, one line on how the city is living with each of your laws. */
export function lawPulse(s: SaveState): string[] {
  const out: string[] = [];
  const week = s.arcology.week;
  for (const x of lawsOf(s)) {
    const l = LAW_BY_ID[x.id];
    if (!l || !isCustom(l.id)) continue;
    // The week after you write it, the city answers it: someone breaks it, or someone celebrates it.
    const log = (s.event_log ??= {});
    if (week - x.week >= 1 && !log[`lawfirst:${l.id}`] && fireEvent(s, support(s, l) > 0 ? "law_praise" : "law_breach", { facility: `law:${l.id}` })) log[`lawfirst:${l.id}`] = week;
    if ((week - x.week) % 2 !== 1) continue;
    const r = rng(`pulse:${l.id}:${week}`);
    const sup = support(s, l);
    const effects = (s.custom_laws ?? []).find((c) => c.id === l.id)?.effects ?? [];
    const money = effects.includes("tax") ? ` The tax under it brought in about ¤${Math.round(s.arcology.population * 0.6 * 2).toLocaleString()} this fortnight.` : effects.includes("subsidy") ? " The arcology paid ¤3,000 toward it this fortnight." : "";
    const line = sup > 30
      ? r.pick([`The ${l.name} is simply how things are done now. Citizens keep it without being told.`, `People quote the ${l.name} at each other in the concourse, approvingly.`, `Shops have put up copies of the ${l.name} next to their prices.`])
      : sup > 0
        ? r.pick([`Most citizens are keeping the ${l.name}, some of them grudgingly.`, `The ${l.name} is being kept, mostly. The patrols have written a few fines under it.`, `Citizens argue in the cafés about the ${l.name}, and then mostly keep it.`])
        : sup > -30
          ? r.pick([`The ${l.name} is being ignored where the patrols can't see.`, `Someone has defaced the notices of the ${l.name} on the residential floors.`, `The ${l.name} is kept in the spire and ignored in the verge.`])
          : r.pick([`The city is openly defying the ${l.name}. There are petitions to repeal it in every block.`, `Nobody keeps the ${l.name} unless a patrol is watching. People have started calling it your law, not the city's.`]);
    out.push(line + money);
  }
  return out;
}

/* ── events about a law, by name ─────────────────────────────────────────────────────────────── */

/** Which law an event is about. Custom laws first; the id rides on the event's facility field. */
function lawCandidates(s: SaveState, test: (l: LawDef) => boolean = () => true): { facility: string }[] {
  const ls = lawsOf(s).map((x) => LAW_BY_ID[x.id]).filter((l): l is LawDef => !!l && test(l));
  const custom = ls.filter((l) => isCustom(l.id));
  return (custom.length ? custom : ls).map((l) => ({ facility: `law:${l.id}` }));
}
const lawOf = (f?: string) => (f?.startsWith("law:") ? LAW_BY_ID[f.slice(4)] : undefined);
const quote = (l: LawDef) => `"${l.text.replace(/"/g, "'")}"`;
const MISSING = "By the time it reaches you the matter has resolved itself, and nobody can remember which law it was about.";

function lawEvent(id: string, when: (s: SaveState, l: LawDef) => boolean, weight: (s: SaveState) => number, seed: (s: SaveState, l: LawDef) => string, options: { id: string; label: string; note?: string; run: (s: SaveState, l: LawDef) => string }[]): EventDef {
  return {
    id, severity: "notable", endogenous: true,
    candidates: (s) => lawCandidates(s, (l) => when(s, l)),
    weight: (s, c) => (isCustom(c.facility?.slice(4) ?? "") ? weight(s) * 3 : weight(s) * 0.5),
    seed: (s, c) => { const l = lawOf(c.facility); return l ? seed(s, l) : MISSING; },
    options: options.map((o) => ({ id: o.id, label: o.label, note: o.note, resolve: (s, e) => { const l = lawOf(e.facility); return l ? o.run(s, l) : MISSING; } })),
  };
}

export const LAW_EVENTS: EventDef[] = [
  lawEvent("law_breach", () => true, () => 1.5,
    (s, l) => `A patrol has caught a citizen on the commercial row breaking the ${l.name}, which says ${quote(l)} He's shouting that he's never heard of it. A crowd has gathered to see what the law is worth.`, [
      { id: "example", label: "Make an example of him", run: (s, l) => { pushWithLaw(s, l, 5, `you made an example of a man who broke the ${l.name}`); pushNorm(s, "order", 3, `you enforced the ${l.name} in public`); std(s, support(s, l) > 0 ? 0.5 : -0.5); return `You have him put in the stocks by the fountain for a day, with a copy of the ${l.name} pinned to his coat. Everyone who walks past reads it. Nobody on the commercial row breaks it again that month.`; } },
      { id: "fine", label: "Fine him", run: (s, l) => { s.arcology.cash += 500; pushWithLaw(s, l, 2, `a citizen was fined under the ${l.name}`); return `He's fined five hundred and let go. He pays, furious, and tells everyone the ${l.name} is a tax on the unlucky.`; } },
      { id: "pardon", label: "Pardon him", run: (s, l) => { pushWithLaw(s, l, -4, `you pardoned a man who broke the ${l.name}`); std(s, 0.5); return `You let him go with a warning. The crowd cheers, and by evening everyone knows the ${l.name} can be talked out of.`; } },
    ]),
  lawEvent("law_household", (s, l) => owned(s).length > 0 && !lawsOf(s).find((x) => x.id === l.id)?.exempt, () => 1,
    (s, l) => { const p = owned(s)[0]; return `A citizen has written to the civic hall complaining that ${p.name}, one of your own slaves, broke the ${l.name} in the market this morning. The law says ${quote(l)} The clerk wants to know whether the owner's household keeps the owner's law.`; }, [
      { id: "punish", label: "Punish her in public", run: (s, l) => { const p = owned(s)[0]; if (p) applyTreatment(p, { kind: "coercion", size: 5, why: `punished in public for breaking the ${l.name}` }, s.arcology.week); pushWithLaw(s, l, 5, `you punished your own slave for breaking the ${l.name}`); std(s, 1); return `You have ${p?.name ?? "her"} punished at the fountain, under a notice of the ${l.name}. It's the most effective thing you could have done for the law: if the owner's own slave isn't exempt, nobody is.`; } },
      { id: "exempt", label: "Exempt your household from it", note: "standing falls", run: (s, l) => { const x = lawsOf(s).find((y) => y.id === l.id); if (x) x.exempt = true; pushWithLaw(s, l, -5, `you exempted your own household from the ${l.name}`); std(s, -1.5); return `You exempt your household from the ${l.name}. It's legal, and everyone in the arcology now knows the law is for other people.`; } },
      { id: "pay", label: "Pay the fine and apologise", run: (s, l) => { s.arcology.cash -= 1000; std(s, 0.5); pushWithLaw(s, l, 2, `you paid your slave's fine under the ${l.name}`); return `You pay the fine yourself and send the citizen a note. He frames it.`; } },
    ]),
  lawEvent("law_praise", (s, l) => support(s, l) > -10, () => 1,
    (s, l) => `A group of citizens wants to hold a gathering in the plaza to celebrate the ${l.name}: speeches, music, and the law read out from the fountain. They'd be honoured if you came.`, [
      { id: "attend", label: "Go and read it out yourself", run: (s, l) => { pushWithLaw(s, l, 7, `you read the ${l.name} out at the fountain`); s.arcology.rep += 200; return `You read the ${l.name} out from the fountain's edge to a few hundred people. They cheer the last line. A copy of your reading is on the screens by evening.`; } },
      { id: "fund", label: "Pay for it and stay away", note: "¤2,000", run: (s, l) => { s.arcology.cash -= 2000; pushWithLaw(s, l, 5, `you funded a celebration of the ${l.name}`); return `You pay for it. It's bigger than they planned, and louder.`; } },
      { id: "ignore", label: "Let them get on with it", run: (s, l) => { pushWithLaw(s, l, 2, `citizens celebrated the ${l.name}`); return `They hold it without you. It's small, and sincere, and a few people who walked past on their way somewhere else stop to listen.`; } },
    ]),
  lawEvent("law_protest", (s, l) => support(s, l) < 10, () => 1.5,
    (s, l) => `There are a few hundred protesters outside the civic hall. They want the ${l.name} gone. Someone has painted ${quote(l)} on a bedsheet with a red line through it, and hung it from the balcony.`, [
      { id: "disperse", label: "Have them dispersed", run: (s, l) => { pushWithLaw(s, l, 4, `you dispersed the protest against the ${l.name}`); pushNorm(s, "order", 4, `you dispersed a protest`); std(s, -1); return `Security clears the steps in twenty minutes. Nobody is badly hurt. The bedsheet ends up in a museum in an Old World city, with your name on the label.`; } },
      { id: "listen", label: "Go out and hear them", run: (s, l) => { pushWithLaw(s, l, -3, `you went out to hear the protest against the ${l.name}`); std(s, 1); return `You go out onto the steps and listen for an hour. You don't promise anything. They go home anyway, and some of them stop hating you.`; } },
      { id: "repeal", label: "Give them what they want: strike it", run: (s, l) => `${repealByDecree(s, l.id)} The protesters go home singing.` },
    ]),
  lawEvent("law_abroad", () => true, () => 0.6,
    (s, l) => `An Old World newspaper has run a long piece about ${s.arcology.name} and the ${l.name}, quoting it in full: ${quote(l)} It's being read in a dozen cities, and three owners have written to ask what you meant by it.`, [
      { id: "boast", label: "Answer proudly", run: (s, l) => { s.arcology.rep += support(s, l) > 0 ? 400 : 150; pushWithLaw(s, l, 3, `you defended the ${l.name} to the Old World`); return `You write back that ${s.arcology.name} makes its own laws, and this is one of them. The reply gets printed too. Visitors start arriving who want to see it for themselves.`; } },
      { id: "quiet", label: "Say nothing", run: (s, l) => `You say nothing. The story runs for a week and then another city does something worse. The ${l.name} stays on the books.` },
    ]),
];

registerEvents(LAW_EVENTS);

/** For scenes between two people: the laws they both live under, briefly. */
export function lawsLine(s: SaveState): string {
  const ls = lawsOf(s).map((x) => LAW_BY_ID[x.id]).filter(Boolean) as LawDef[];
  if (!ls.length) return "";
  return `LAWS OF THE ARCOLOGY (people keep or break them where it fits the scene): ${ls.map((l) => `the ${l.name}: ${l.text}`).join(" | ")}`;
}

