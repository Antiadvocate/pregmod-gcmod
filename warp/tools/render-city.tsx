/** Draw the city from above with every kind of district standing, to an SVG file, for looking at.
 *  Add "skyline" after the time for the side-on view.
 *  npx esbuild tools/render-city.tsx --bundle --platform=node --format=esm --jsx=automatic --external:react --external:react-dom \
 *    --loader:.css=empty --loader:.png=empty --loader:.jpg=empty --loader:.webp=empty --outfile=.render.mjs && node .render.mjs out.svg [HH:MM] [skyline] */
declare const process: { argv: string[] };
// The app's own entry order: the engine has an old import cycle through events.ts that only some orders survive.
import "../src/App.tsx";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "node:fs";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { cityOf } from "../src/engine/city.ts";
import { DISTRICTS } from "../src/data/districts.ts";
import { GameProvider } from "../src/lib/game.tsx";
import IsoCity from "../src/views/IsoCity.tsx";
import { Skyline } from "../src/views/Skyline.tsx";

const s = newGame({ seed: "render", starting_slaves: 2 } as never);
const city = cityOf(s);
const kinds = DISTRICTS.map((d) => d.kind).filter((k) => k !== "spire");
let i = 0;
for (const d of city.districts) {
  if (d.ring === 0) { d.level = 4; continue; }
  const k = kinds[i++ % kinds.length];
  d.kind = k === "wall" && d.ring < 2 ? "residential" : k;
  d.level = 2 + (i % 3);
  d.owner = "you";
  d.condition = 80;
}
s.arcology.population = 6000;
s.scene.time = `Week ${s.arcology.week}, Monday ${process.argv[3] ?? "14:00"}`;
writeFileSync(process.argv[2] ?? "city.svg", renderToStaticMarkup(<GameProvider initial={s}>{process.argv[4] === "skyline" ? <Skyline maxHeight={900} /> : <IsoCity />}</GameProvider>));
console.log(city.districts.map((d) => `${d.ring}:${d.kind}`).join(" "));
