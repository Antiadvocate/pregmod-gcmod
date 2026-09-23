/**
 * WHAT SHE WEARS IS DRAWN. Every garment names art the pack actually has — the failure this
 * prevents is the one the collar had for its whole life: asked for a layer called "Collar", which
 * does not exist, and drew nothing without complaint.
 */
import { check } from "./harness.ts";
import manifest from "../public/art/vector/index.json";
import { WARDROBE } from "../src/data/wardrobe.ts";
import { layersFor } from "../src/lib/vectorart.ts";
import { newGame } from "../src/engine/state.ts";
import { POSE_BY_ID } from "../src/lib/rig.ts";

const have = new Set(manifest as string[]);
const missing: string[] = [];
for (const g of WARDROBE) {
  if (!g.art) continue;
  if (g.slot === "clothes") {
    const any = ["Torso", "Boob", "Butt", "Leg", "Arm", "Head"].some((part) => [...have].some((x) => x.startsWith(`${part}_Outfit_${g.art}_`) || x === `${part}_Outfit_${g.art}`));
    if (!any) missing.push(g.name);
  } else if (g.slot === "legwear") {
    if (!have.has(`Shoes_Stockings_${g.art}_Normal`)) missing.push(g.name);
  } else if (!have.has(g.art) && !have.has(`${g.art}_Normal`)) missing.push(g.name);
}
check("every garment has art in the pack", missing.length === 0, missing);

{
  const s = newGame({ seed: "dressed", starting_slaves: 1 });
  const p = Object.values(s.people)[0];
  p.clothes = "household uniform"; p.collar = "a jewelled collar"; p.shoes = "heels"; p.legwear = "long stockings";
  const ids = layersFor(p, POSE_BY_ID.waiting).map((l) => l.id).filter((id) => have.has(id));
  check("a dressed woman is drawn dressed", ids.some((x) => x.startsWith("Torso_Outfit_NiceMaid")), ids);
  check("with the collar she was given", ids.includes("Collar_Pretty_Jewelry"));
  check("and the shoes", ids.includes("Shoes_Heel") && ids.some((x) => x.startsWith("Shoes_Heel_LL_")));
  p.look = { clothes_hue: 120 };
  check("a recoloured outfit carries its hue on the clothing and not the skin",
    layersFor(p).filter((l) => l.tint === 120).every((l) => /Outfit/.test(l.id)) && layersFor(p).some((l) => l.tint === 120));
  p.clothes = "a latex suit";
  const { paletteFor } = await import("../src/lib/vectorart.ts");
  check("a suit paints the body and leaves the face", paletteFor(p).skin === "#515351" && paletteFor(p).head !== "#515351");
}
