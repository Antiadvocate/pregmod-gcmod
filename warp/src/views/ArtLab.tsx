/**
 * THE ART LAB — open the game with #artlab on the end of the address.
 *
 * A row of grown women from the generator, drawn large, face and full figure, with what makes each
 * of them unusual written under her. It's where the drawing is judged: you can't see whether a
 * body reads as hers, or whether skin looks like skin, at the size of a roster card.
 */
import { useState } from "react";
import { generatePerson } from "../engine/generate";
import { feetOf } from "../engine/genitals";
import SlaveArt from "./SlaveArt";
import { playerAsPerson } from "../engine/you";
import { newGame } from "../engine/state";

export default function ArtLab() {
  const [base, setBase] = useState(1);
  // #artlab-men: men, drawn the way the game draws you and the men of the city.
  const men = location.hash === "#artlab-men";
  // #artlab-pens: what comes out of the menial pens.
  const pens = location.hash === "#artlab-pens";
  const people = pens ? Array.from({ length: 6 }, (_, i) => {
    const p = generatePerson({ seed: base * 300 + i, age: 22 + i, sex: "female" });
    p.body.arms = ([0, 2, 0, 1, 2, 0] as const)[i];
    p.body.legs = ([0, 0, 2, 2, 1, 0] as const)[i];
    p.clothes = ["no clothing", "no clothing", "no clothing", "no clothing", "no clothing", "a fuckdoll suit"][i];
    return p;
  }) : men ? Array.from({ length: 6 }, (_, i) => {
    const p = generatePerson({ seed: base * 100 + i, age: 25 + ((base + i * 7) % 30), sex: "male" });
    p.pronouns = "he/him";
    p.body.face_shape = "masculine";
    p.body.boobs = 0;
    p.body.muscle = [0, 20, 45, 70, 100, 30][i];
    p.body.weight = [-20, 0, 10, 30, 0, 80][i];
    p.body.hair_length = [1, 3, 8, 1, 2, 12][i];
    p.clothes = ["no clothing", "nice business attire", "a t-shirt and jeans", "nice business attire", "no clothing", "a military uniform"][i];
    if (i === 0) {
      // You, as a new game with a cock draws you.
      const you = playerAsPerson(newGame({ seed: `lab${base}`, kit: "cock", pronouns: "he/him", starting_slaves: 0 } as never));
      you.clothes = "nice business attire";
      return you;
    }
    return p;
  }) : Array.from({ length: 6 }, (_, i) => {
    const p = generatePerson({ seed: base * 100 + i, age: 19 + ((base + i * 3) % 15), sex: "female" });
    // Every other woman with her toenails painted, so polish gets judged too.
    if (i % 2) p.body.feet = { ...feetOf(p), toenails: ["red", "pale pink", "black"][i % 3] };
    return p;
  });
  return (
    <div style={{ background: "#141210", minHeight: "100vh", padding: 16, color: "#ddd" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <button className="btn btn-sm" onClick={() => setBase((b) => b + 1)}>next six</button>
        <span className="dim text-[12px]">set {base}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {people.map((p) => (
          <div key={p.id} data-artlab={p.id} style={{ background: "#1c1916", borderRadius: 8, padding: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <SlaveArt person={p} height={560} crop="full" animate={false} />
              <div style={{ width: 150 }}>
                <SlaveArt person={p} height={150} crop="face" animate={false} />
                <div style={{ fontSize: 11, marginTop: 6, lineHeight: 1.35 }}>{p.name}, {p.age}, {p.origin.nationality}. {p.body.appearance_facts}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
