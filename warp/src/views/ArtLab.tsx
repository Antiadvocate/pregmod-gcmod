/**
 * THE ART LAB — open the game with #artlab on the end of the address.
 *
 * A row of grown women from the generator, drawn large, face and full figure, with what makes each
 * of them unusual written under her. It's where the drawing is judged: you can't see whether a
 * body reads as hers, or whether skin looks like skin, at the size of a roster card.
 */
import { useState } from "react";
import { generatePerson } from "../engine/generate";
import SlaveArt from "./SlaveArt";

export default function ArtLab() {
  const [base, setBase] = useState(1);
  const people = Array.from({ length: 6 }, (_, i) => generatePerson({ seed: base * 100 + i, age: 19 + ((base + i * 3) % 15), sex: "female" }));
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
