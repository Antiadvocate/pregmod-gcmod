/**
 * HERO SLAVES IN PLAY — when one turns up, and making her from her record.
 */
import type { MarketOffer, Person, SaveState } from "./types";
import { HEROES, type HeroDef } from "../data/heroes";
import { generatePerson } from "./generate";
import { refresh } from "./obedience";
import { valuePerson } from "./economy";
import { feetOf } from "./genitals";
import { rng } from "./rng";

export function makeHero(s: SaveState, h: HeroDef): Person {
  const p = generatePerson({ seed: `hero:${h.id}`, nation: h.nation, age: h.age, sex: h.sex ?? "female", quality: 0.7, week: s.arcology.week });
  p.name = h.name; p.surname = h.surname;
  p.hero = h.id;
  p.origin.career = h.career;
  p.origin.background = h.story;
  p.persona.background = `${h.career}. ${h.story}`;
  p.persona.core_traits = h.traits;
  p.persona.speech_pattern = h.speech;
  p.persona.voice = { ...(p.persona.voice ?? {}), example_lines: [h.line] };
  p.persona.fetishes = h.fetish ? [{ name: h.fetish.name, strength: h.fetish.strength, known: false }] : p.persona.fetishes;
  if (h.quirk) p.persona.quirk = { id: h.quirk, known: false };
  if (h.flaw) p.persona.flaw = { id: h.flaw, known: false, worn: 0 };
  p.persona.intelligence = h.intelligence;
  p.persona.education = h.education;
  p.persona.conscience = h.conscience;
  Object.assign(p.skills, h.skills);
  const b = h.body;
  for (const k of Object.keys(b) as (keyof typeof b)[]) if (b[k] !== undefined) (p.body as unknown as Record<string, unknown>)[k] = b[k];
  const f = feetOf(p);
  Object.assign(f, h.feet ?? {});
  if (h.bond) Object.assign(p.bond, h.bond);
  refresh(p);
  return p;
}

/** Weekly, when the markets roll: now and then, one of them is for sale. */
export function heroOffer(s: SaveState): MarketOffer | null {
  const seen = (s.heroes_seen ??= []);
  const left = HEROES.filter((h) => !seen.includes(h.id));
  const r = rng(`hero:${s.id}:${s.arcology.week}`);
  if (!left.length || s.arcology.week < 4 || !r.chance(0.12)) return null;
  const h = r.pick(left);
  seen.push(h.id);
  const p = makeHero(s, h);
  const market = s.arcology.rep >= 4000 ? "elite" : "shark";
  const price = Math.round((valuePerson(s, p) * h.markup) / 100) * 100;
  return { id: `hero-${h.id}-${s.arcology.week}`, market, person: p, price, pitch: h.pitch, hidden: [] };
}
