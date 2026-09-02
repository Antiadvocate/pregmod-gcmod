/** Deterministic RNG. Every generated person, market roll and event pick comes from a seeded
 *  stream, so a save is reproducible and a bug is reportable: "seed 41822, week 9" is a complete
 *  description of what happened. Mulberry32 — small, fast, good enough for a game. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable numeric hash of a string — for deriving a per-person stream from an id. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export interface Rng {
  (): number;
  int(lo: number, hi: number): number;
  pick<T>(xs: readonly T[]): T;
  weighted<T>(xs: readonly T[], w: (x: T) => number): T;
  chance(p: number): boolean;
  /** Normal-ish, via three uniforms. Bodies and temperaments cluster; they do not spread flat. */
  normal(mean: number, sd: number): number;
  shuffle<T>(xs: T[]): T[];
}

export function rng(seed: number | string): Rng {
  const next = mulberry32(typeof seed === "string" ? hash(seed) : seed);
  const r = (() => next()) as Rng;
  r.int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  r.pick = (xs) => xs[Math.floor(next() * xs.length)];
  r.weighted = (xs, w) => {
    const total = xs.reduce((n, x) => n + w(x), 0);
    let t = next() * total;
    for (const x of xs) { t -= w(x); if (t <= 0) return x; }
    return xs[xs.length - 1];
  };
  r.chance = (p) => next() < p;
  r.normal = (mean, sd) => mean + ((next() + next() + next() - 1.5) / 1.5) * sd;
  r.shuffle = (xs) => {
    for (let i = xs.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [xs[i], xs[j]] = [xs[j], xs[i]]; }
    return xs;
  };
  return r;
}
