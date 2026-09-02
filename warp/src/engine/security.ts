/**
 * SECURITY — crime, the neighbours, and the week the arcology stops being yours.
 *
 * Two pressures, kept separate because they have different cures. CRIME is the citizens: it rises
 * with poverty and falls with watch, and it costs you money and prosperity. UNREST is your own
 * household: it rises with resentment and with people who have nothing left to lose, and no amount
 * of watch touches it — the only cures are the ones that change what people are carrying.
 *
 * An arcology owner who solves everything with drones discovers this the week the drones are
 * pointing outward and the problem is upstairs.
 */
import type { Person, ReportLine, SaveState } from "./types";
import { clamp, shove } from "./psyche";
import { read } from "./obedience";
import { guardStrength } from "./managers";
import { startRumor } from "./social";
import { rng } from "./rng";

export interface SecurityWeek { lines: ReportLine[]; cash: number }

/** 0–100. What your own household is carrying that you have not answered. */
export function unrest(s: SaveState): number {
  const household = Object.values(s.people).filter((p) => p.status === "owned" || p.status === "indentured");
  if (!household.length) return 0;
  let n = 0;
  for (const p of household) {
    const r = read(p, s.memory[p.id]);
    n += p.bond.resentment * 0.6 + r.flight_risk * 40 - p.bond.hope * 0.25 - Math.max(0, r.devotion) * 0.15;
  }
  return clamp(n / household.length, 0, 100);
}

export function tickSecurity(s: SaveState): SecurityWeek {
  const arc = s.arcology;
  const r = rng(`security:${arc.week}`);
  const lines: ReportLine[] = [];
  let cash = 0;

  const guard = guardStrength(s);
  const merc = arc.mercenaries.hired ? arc.mercenaries.strength / 40 : 0;
  const defence = arc.security / 50 + guard + merc;

  /* ── crime ─────────────────────────────────────────────────────────────────────────────────── */
  if (arc.crime > 45 && r.chance(clamp((arc.crime - 45) / 90, 0, 0.5))) {
    const loss = Math.round((arc.crime * 60) / Math.max(0.4, defence));
    cash -= loss;
    lines.push({ tone: "bad", weight: 8, text: `Something was taken off the industrial level — ¤${loss.toLocaleString()} of it. ${defence < 1 ? "Nobody was in a position to stop them." : "Your people got most of it back."}` });
    arc.prosperity = clamp(arc.prosperity - 2, 0, 200);
  }

  /* ── unrest, which is a different problem ──────────────────────────────────────────────────── */
  const u = unrest(s);
  if (u > 55) {
    const household = Object.values(s.people).filter((p) => p.status === "owned");
    // The angriest person in the house does something about it.
    const worst = household
      .map((p) => ({ p, r: read(p, s.memory[p.id]) }))
      .sort((a, b) => b.p.bond.resentment - a.p.bond.resentment)[0];
    if (worst && r.chance(clamp((u - 55) / 70, 0, 0.55))) {
      if (worst.r.flight_risk > 0.5 && r.chance(0.5)) {
        const caught = r.chance(clamp(0.35 + defence * 0.2, 0, 0.9));
        if (caught) {
          worst.p.bond.fear = clamp(worst.p.bond.fear + 25, 0, 100);
          shove(worst.p.psyche, -2.5, { hard: true });
          lines.push({ person: worst.p.id, tone: "warning", weight: 9, text: `${worst.p.name} ran, and was brought back on the Thursday.` });
          startRumor(s, `${worst.p.name} ran and they caught her`, { about: worst.p.id, salience: 8 });
        } else {
          worst.p.status = "free";
          worst.p.exit_week = arc.week;
          worst.p.exit_note = "escaped";
          lines.push({ person: worst.p.id, tone: "bad", weight: 10, text: `${worst.p.name} is gone. Nobody in the household is saying anything about it, which is its own kind of answer.` });
          startRumor(s, `${worst.p.name} got out`, { salience: 9 });
          for (const p of household) if (p.id !== worst.p.id) p.bond.hope = clamp(p.bond.hope + 8, 0, 100);
        }
      } else {
        lines.push({ person: worst.p.id, tone: "warning", weight: 8, text: `${worst.p.name} refused an instruction in front of four other people. What happens next is not really about her.` });
        for (const p of household) p.bond.hope = clamp(p.bond.hope + 3, 0, 100);
      }
    }
  }
  if (u > 75) lines.push({ tone: "bad", weight: 9, text: `Your household is at ${Math.round(u)} unrest. Watch and drones do nothing to this number; only what you are carrying with them does.` });

  /* ── the neighbours ───────────────────────────────────────────────────────────────────────── */
  for (const n of arc.neighbours) {
    if (n.scheme) {
      n.scheme.progress += 8 + Math.max(0, -n.attitude) / 12;
      if (n.scheme.progress >= 100) {
        switch (n.scheme.kind) {
          case "embargo":
            arc.prosperity = clamp(arc.prosperity - 12, 0, 200);
            lines.push({ tone: "bad", weight: 10, text: `${n.name}'s embargo landed. Prosperity down twelve, and your suppliers are somebody else's now.` });
            break;
          case "influence":
            arc.ownership = clamp(arc.ownership - 4, 0, 100);
            lines.push({ tone: "bad", weight: 9, text: `${n.name} has bought four percent of your arcology out from under you.` });
            break;
          case "cyber":
            cash -= 14000;
            lines.push({ tone: "bad", weight: 9, text: `${n.name} got into your systems. ¤14,000, and you will not get it back.` });
            break;
          case "raid": {
            const held = defence > 1.4;
            if (held) lines.push({ tone: "good", weight: 10, text: `${n.name} sent people in. Your security held them at the freight doors.` });
            else {
              arc.security = clamp(arc.security - 20, 0, 100);
              cash -= 22000;
              const taken = Object.values(s.people).filter((p) => p.status === "owned").sort(() => r() - 0.5)[0];
              if (taken) { taken.status = "sold"; taken.exit_week = arc.week; taken.exit_note = `taken in ${n.name}'s raid`; lines.push({ person: taken.id, tone: "bad", weight: 10, text: `They took ${taken.name} with them.` }); }
              lines.push({ tone: "bad", weight: 10, text: `${n.name}'s people came in through the freight level and your security did not hold.` });
            }
            break;
          }
        }
        delete n.scheme;
        n.attitude = clamp(n.attitude + 20, -100, 100);   // they got what they came for
      }
    } else if (n.attitude < -50 && r.chance(0.12)) {
      const kind = r.pick(["embargo", "influence", "cyber", "raid"] as const);
      n.scheme = { kind, progress: 10 };
      lines.push({ tone: "warning", weight: 9, text: `${n.name} has started something — it looks like ${kind === "raid" ? "people, not paperwork" : `a ${kind}`}. You have a few weeks.` });
    }
  }

  if (arc.mercenaries.hired) {
    arc.mercenaries.loyalty = clamp(arc.mercenaries.loyalty + (arc.cash > 0 ? 1 : -6), 0, 100);
    if (arc.mercenaries.loyalty < 20) {
      lines.push({ tone: "warning", weight: 9, text: `Your mercenaries have not been paid properly and they have started saying so where people can hear.` });
      if (arc.mercenaries.loyalty <= 0) {
        arc.mercenaries.hired = false;
        arc.security = clamp(arc.security - 25, 0, 100);
        lines.push({ tone: "bad", weight: 10, text: `The company has left, and taken the armoury with them.` });
      }
    }
  }

  return { lines, cash };
}

export function hireMercenaries(s: SaveState): { ok: boolean; why?: string } {
  if (s.arcology.mercenaries.hired) return { ok: false, why: "you already have a company" };
  const price = 30000;
  if (s.arcology.cash < price) return { ok: false, why: "the retainer is ¤30,000 up front" };
  s.arcology.cash -= price;
  s.arcology.mercenaries = { hired: true, strength: 45, loyalty: 70, upkeep: 3500 };
  s.arcology.security = clamp(s.arcology.security + 18, 0, 100);
  return { ok: true };
}

export function dismissMercenaries(s: SaveState): void {
  s.arcology.mercenaries = { hired: false, strength: 0, loyalty: 0, upkeep: 0 };
  s.arcology.security = clamp(s.arcology.security - 18, 0, 100);
}
