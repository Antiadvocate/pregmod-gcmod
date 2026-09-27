/**
 * WHO YOU'RE TALKING TO — a small face, or a few, that shows what the last line did to them.
 *
 * The face is hers: the same layers, colours and gene-program changes as everywhere else, with the
 * brows, eyes and mouth free to move (see lib/face.ts). Her mood comes from what was just written;
 * while a reply is arriving her mouth moves. A scene with no one of yours in it gets stand-ins:
 * citizens drawn from the moment itself, wearing whatever your gene programs have made common.
 */
import { useMemo } from "react";
import type { Person, SaveState } from "../engine/types";
import type { Moment as Scene } from "../engine/moments";
import { generatePerson } from "../engine/generate";
import { prevailingLook } from "../engine/genome";
import { facesIn, personOf } from "../engine/faces";
import { MOODS, moodFor, moodIn, PLURAL, speakerOf, type Mood } from "../lib/face";
import SlaveArt from "./SlaveArt";

/** Who is on the other side of a scene: yours when they're named, then anyone on file who is
 *  (the story's cast, strangers the model has met before), then stand-ins. */
export function castOf(s: SaveState, m: Scene): Person[] {
  const named = [m.person, ...(m.others ?? [])].map((id) => (id ? s.people[id] : undefined)).filter((p): p is Person => !!p);
  const said = `${m.title}\n${m.log.filter((l) => l.role !== "you").map((l) => l.text).join("\n")}`;
  const filed = facesIn(s, said, 3).filter((f) => !named.some((p) => p.name === f.name)).map(personOf);
  const cast = [...named, ...filed].slice(0, 3);
  if (cast.length) return cast;
  const opening = `${m.title} ${m.log.find((l) => l.role !== "you")?.text.slice(0, 400) ?? ""}`;
  const count = PLURAL.test(opening) ? 3 : 1;
  const look = prevailingLook(s, "citizens");
  return Array.from({ length: count }, (_, i) => {
    const p = generatePerson({ seed: `${m.id} ${i}`, sex: "female", age: 24 + ((m.id.length * 7 + i * 11) % 30) });
    if (look.skin) p.body.skin = `${look.skin} (engineered)`;
    if (look.hair) p.body.hair_color = look.hair;
    if (look.eyes) p.body.eye_color = look.eyes;
    p.clothes = "conservative clothing";
    p.collar = "no collar";
    return p;
  });
}

export default function Portrait({ people, text = "", speaking = false, size = 72, label = true }: { people: Person[]; text?: string; speaking?: boolean; size?: number; label?: boolean }) {
  const moods = useMemo<Mood[]>(() => people.map((p) => (people.length > 1 ? moodIn(p, text) : moodFor(p, text))), [people, text]);
  const talker = people.length > 1 ? speakerOf(people, text) : 0;
  if (!people.length) return null;
  const small = people.length > 1 ? Math.round(size * 0.78) : size;
  return (
    <div className="flex flex-col items-center shrink-0" aria-label={people.map((p, i) => `${p.name}: ${moods[i]}`).join(", ")}>
      <div className="flex items-end">
        {people.map((p, i) => (
          <div key={p.id} style={{ width: small, height: small, marginLeft: i ? -small * 0.28 : 0, zIndex: i === talker ? 3 : 2 - i, borderRadius: 12, overflow: "hidden", background: "var(--ink-2)", border: "1px solid var(--line)", position: "relative" }}>
            <SlaveArt person={p} height={small} crop="face" mood={MOODS[moods[i]]} speaking={speaking && i === talker} />
          </div>
        ))}
      </div>
      {label ? <div className="text-[10px] dim mt-0.5 capitalize">{[...new Set(moods)].join(" · ")}</div> : null}
    </div>
  );
}
