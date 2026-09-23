/**
 * DRUGS — standing regimens, ticked weekly in health.ts.
 *
 * The original's growth drugs: a regimen grows or shrinks an organ a step at a time, not all at
 * once, and the hyper versions keep going past anything natural until the size itself becomes the
 * problem. Growth is a chance per week, seeded, so a save replays the same body.
 */
import type { Person, SaveState } from "../engine/types";

export interface DrugDef {
  id: string;
  name: string;
  /** What it does, plainly, for the UI. */
  note: string;
  /** Weekly cost. */
  cost: number;
  /** Behind the hyper content switch. */
  hyper?: boolean;
  /** Drugs that cannot run alongside this one. */
  conflicts?: string[];
  /** Why this body can't take it, or null. */
  can: (p: Person) => string | null;
  /** One week of it. Returns a line for the report when something visibly changed. */
  tick: (p: Person, roll: () => number) => string | null;
}

const has = (n: number | null | undefined): n is number => typeof n === "number" && n > 0;

export const DRUGS: DrugDef[] = [
  {
    id: "penis enhancement", name: "Penis enhancement", cost: 150,
    note: "grows her cock a size at a time, up to awe-inspiring (10); grows a clit if she has no cock",
    conflicts: ["penis atrophiers"],
    can: (p) => !has(p.body.dick) && p.body.vagina === null ? "she has nothing for it to grow" : has(p.body.dick) && p.body.dick >= 10 ? "her cock is as big as normal drugs can make it" : !has(p.body.dick) && p.body.clit >= 5 ? "her clit is as big as it gets" : null,
    tick: (p, roll) => {
      if (roll() > 0.4) return null;
      if (has(p.body.dick)) {
        if (p.body.dick >= 10) return null;
        p.body.dick += 1;
        if (p.body.foreskin) p.body.foreskin += 1;
        return `her cock has grown to size ${p.body.dick}`;
      }
      if (p.body.vagina !== null && p.body.clit < 5) { p.body.clit += 1; return "her clit has grown"; }
      return null;
    },
  },
  {
    id: "hyper penis enhancement", name: "Hyper penis enhancement", cost: 400, hyper: true,
    note: "grows her cock without limit, far past anything natural; hard on her health, and past size 15 it gets in the way of walking",
    conflicts: ["penis atrophiers", "penis enhancement"],
    can: (p) => !has(p.body.dick) ? "she has no cock" : p.body.dick >= 30 ? "it can't get any bigger" : null,
    tick: (p, roll) => {
      p.health.health = Math.max(-100, p.health.health - 1);
      if (!has(p.body.dick) || p.body.dick >= 30 || roll() > 0.6) return null;
      p.body.dick += 1;
      if (p.body.foreskin) p.body.foreskin += 1;
      return `her cock has swollen to size ${p.body.dick}`;
    },
  },
  {
    id: "penis atrophiers", name: "Penis atrophiers", cost: 120,
    note: "shrinks her cock a size at a time, down to tiny; shrinks a clit if she has no cock",
    conflicts: ["penis enhancement", "hyper penis enhancement"],
    can: (p) => has(p.body.dick) ? (p.body.dick <= 1 ? "it's already tiny" : null) : p.body.vagina !== null && p.body.clit > 0 ? null : "there's nothing to shrink",
    tick: (p, roll) => {
      if (roll() > 0.4) return null;
      if (has(p.body.dick) && p.body.dick > 1) { p.body.dick -= 1; if (p.body.foreskin) p.body.foreskin = Math.max(1, p.body.foreskin - 1); return `her cock has shrunk to size ${p.body.dick}`; }
      if (!has(p.body.dick) && p.body.clit > 0) { p.body.clit -= 1; return "her clit has shrunk"; }
      return null;
    },
  },
  {
    id: "testicle enhancement", name: "Testicle enhancement", cost: 150,
    note: "grows her balls a size at a time, up to monstrous (9), and her loads with them",
    conflicts: ["testicle atrophiers"],
    can: (p) => !has(p.body.balls) ? "she has no balls" : p.body.balls >= 10 ? "they're as big as normal drugs can make them" : null,
    tick: (p, roll) => {
      if (!has(p.body.balls) || p.body.balls >= 10 || roll() > 0.4) return null;
      p.body.balls += 1;
      return `her balls have grown to size ${p.body.balls}`;
    },
  },
  {
    id: "hyper testicle enhancement", name: "Hyper testicle enhancement", cost: 400, hyper: true,
    note: "grows her balls without limit; past size 20 they drag and make walking hard, past 37 she can barely move, past 50 she can't",
    conflicts: ["testicle atrophiers", "testicle enhancement"],
    can: (p) => !has(p.body.balls) ? "she has no balls" : p.body.balls >= 60 ? "they can't get any bigger" : null,
    tick: (p, roll) => {
      p.health.health = Math.max(-100, p.health.health - 1);
      if (!has(p.body.balls) || p.body.balls >= 60 || roll() > 0.6) return null;
      p.body.balls += p.body.balls >= 10 ? 2 : 1;
      return `her balls have swollen to size ${p.body.balls}`;
    },
  },
  {
    id: "testicle atrophiers", name: "Testicle atrophiers", cost: 120,
    note: "shrinks her balls a size at a time, down to vestigial",
    conflicts: ["testicle enhancement", "hyper testicle enhancement"],
    can: (p) => !has(p.body.balls) ? "she has no balls" : p.body.balls <= 1 ? "they're already vestigial" : null,
    tick: (p, roll) => {
      if (!has(p.body.balls) || p.body.balls <= 1 || roll() > 0.4) return null;
      p.body.balls -= 1;
      return `her balls have shrunk to size ${p.body.balls}`;
    },
  },
  {
    id: "clitoris enhancement", name: "Clitoris enhancement", cost: 120,
    note: "grows her clit until it's a little cock of its own",
    can: (p) => p.body.vagina === null ? "she has no pussy" : p.body.clit >= 5 ? "it's as big as it gets" : null,
    tick: (p, roll) => {
      if (p.body.vagina === null || p.body.clit >= 5 || roll() > 0.35) return null;
      p.body.clit += 1;
      return "her clit has grown";
    },
  },
  {
    id: "labia enhancement", name: "Labia enhancement", cost: 100,
    note: "grows her labia until they're big and dangling",
    can: (p) => p.body.vagina === null ? "she has no pussy" : p.body.labia >= 3 ? "they're as big as they get" : null,
    tick: (p, roll) => {
      if (p.body.vagina === null || p.body.labia >= 3 || roll() > 0.3) return null;
      p.body.labia = (p.body.labia + 1) as 0 | 1 | 2 | 3;
      return "her labia have grown";
    },
  },
  {
    id: "female hormones", name: "Female hormones", cost: 80,
    note: "grows her breasts and softens her body; slowly shrinks her balls, and makes erections hard for her unless her balls are big",
    conflicts: ["male hormones"],
    can: () => null,
    tick: (p, roll) => {
      p.body.boobs += 20;
      p.body.waist = Math.max(-100, p.body.waist - 1);
      p.body.muscle = Math.max(-100, p.body.muscle - 1);
      if (has(p.body.balls) && p.body.balls > 1 && roll() < 0.12) { p.body.balls -= 1; return "the hormones have shrunk her balls"; }
      return null;
    },
  },
  {
    id: "male hormones", name: "Male hormones", cost: 80,
    note: "adds muscle and hardens her body; slowly grows her cock and balls a little",
    conflicts: ["female hormones"],
    can: () => null,
    tick: (p, roll) => {
      p.body.muscle = Math.min(100, p.body.muscle + 2);
      p.body.waist = Math.min(100, p.body.waist + 1);
      if (has(p.body.dick) && p.body.dick < 6 && roll() < 0.1) { p.body.dick += 1; return "the hormones have grown her cock"; }
      if (has(p.body.balls) && p.body.balls < 6 && roll() < 0.1) { p.body.balls += 1; return "the hormones have grown her balls"; }
      return null;
    },
  },
  {
    id: "hormone blockers", name: "Hormone blockers", cost: 60,
    note: "suppresses her hormones; she can't get hard at all",
    can: () => null,
    tick: () => null,
  },
];

export const DRUG_BY_ID: Record<string, DrugDef> = Object.fromEntries(DRUGS.map((d) => [d.id, d]));

/** Whether this regimen can be started on her now, and why not. */
export function canStart(s: SaveState, p: Person, id: string): string | null {
  const d = DRUG_BY_ID[id];
  if (!d) return "no such drug";
  if (d.hyper && s.content?.hyper === false) return "hyper growth is disabled in content settings";
  const clash = (p.health.drugs ?? []).find((x) => d.conflicts?.includes(x) || DRUG_BY_ID[x]?.conflicts?.includes(id));
  if (clash) return `conflicts with ${clash}`;
  return d.can(p);
}
