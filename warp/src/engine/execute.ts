/**
 * KILL HER — she's yours, so that's yours too.
 *
 * Two ways: behind a closed door, or with the household made to watch. Either way she is dead, off
 * the roster, and remembered as dead by everyone who knew her. The house reads it through the same
 * kernel as everything else: a death in the household is the hardest shove the week has, and
 * watching it done on purpose is cruelty on top of that. Doing it in front of them buys obedience
 * out of fear, which saturates like all fear does, and costs bond and hope that take a long time to
 * come back. The city hears about it whichever way you do it.
 */
import type { SaveState } from "./types";
import { applyTreatment, refresh } from "./obedience";
import { clamp, shove } from "./psyche";
import { startRumor } from "./social";

export type KillHow = "private" | "public";

export const KILL_HOW: Record<KillHow, { label: string; note: string }> = {
  private: { label: "Behind a closed door", note: "Quick, in your office. The household finds out afterwards." },
  public: { label: "In front of the household", note: "They're made to watch. It means more fear and less of everything else, and the harder citizens approve." },
};

/** Kill her. Returns a line for the screen, or why not. */
export function killHer(s: SaveState, id: string, how: KillHow): { ok: boolean; line: string } {
  const p = s.people[id];
  if (!p || (p.status !== "owned" && p.status !== "indentured")) return { ok: false, line: "She isn't yours to kill." };
  const week = s.arcology.week;

  p.status = "dead";
  p.exit_week = week;
  p.exit_note = how === "public" ? "executed in front of the household" : "killed by the owner";
  p.assignment = "rest";
  delete p.facility;
  for (const f of Object.values(s.arcology.facilities)) f.workers = f.workers.filter((w) => w !== id);
  if (s.player.owned_by === id) delete s.player.owned_by;
  s.asks = (s.asks ?? []).filter((a) => a.person !== id);
  s.events = s.events.filter((e) => e.person !== id);

  for (const h of Object.values(s.people).filter((x) => x.id !== id && (x.status === "owned" || x.status === "indentured"))) {
    shove(h.psyche, how === "public" ? -1.4 : -0.6, { hard: true });
    h.bond.fear = clamp(h.bond.fear + (how === "public" ? 18 : 8), 0, 100);
    h.bond.hope = clamp(h.bond.hope - (how === "public" ? 10 : 4), 0, 100);
    applyTreatment(h, how === "public"
      ? { kind: "coercion", size: 4, why: `the owner made the household watch ${p.name} die` }
      : { kind: "cruelty", size: 2, why: `the owner killed ${p.name}` }, week);
    refresh(h, s.memory[h.id]);
  }

  if (how === "public") {
    const deg = s.arcology.doctrines["degradationist" as keyof typeof s.arcology.doctrines];
    const pat = s.arcology.doctrines["paternalist" as keyof typeof s.arcology.doctrines];
    if (deg) deg.adoption = clamp(deg.adoption + 3, 0, 100);
    if (pat) pat.adoption = clamp(pat.adoption - 3, 0, 100);
  }
  startRumor(s, how === "public" ? `the owner executed ${p.name} in front of the household` : `the owner killed ${p.name}`, { about: p.id, salience: how === "public" ? 9 : 7 });
  s.notifications.push({ id: `n-kill-${id}-${week}`, week, text: `${p.name} is dead.`, kind: "danger", person: id, seen: false });

  return { ok: true, line: how === "public"
    ? `You have the household brought in and lined up, and you kill ${p.name} in front of them. Nobody says anything. Somebody is sick afterwards, and the floor is cleaned before dinner.`
    : `You call ${p.name} into your office and close the door. It's quick. Somebody else cleans up, and the rest of them know by evening.` };
}
