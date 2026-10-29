/** Every district design alone on its plot, large, in a grid: for tuning how each one reads.
 *  npx esbuild tools/render-catalog.tsx --bundle --platform=node --format=esm --jsx=automatic --external:react --external:react-dom --outfile=.catalog.mjs && node .catalog.mjs out.svg [level] */
declare const process: { argv: string[] };
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "node:fs";
import { DISTRICTS } from "../src/data/districts.ts";
import { designHeight, drawDesign, type Kit } from "../src/views/isoBuildings.tsx";
import { prism, shade } from "../src/lib/iso.ts";

const level = Number(process.argv[3] ?? 3);
const kinds = DISTRICTS.map((d) => d.kind).filter((k) => k !== "spire");
const COLS = 5, W = 360, H = 560, S = 60, Z = S / 28;
const heightOf = (kind: string, lvl: number) => designHeight(kind, lvl, DISTRICTS.find((d) => d.kind === kind)?.bulk ?? 0.3);
const tiles: ReactNode[] = [];
kinds.forEach((kind, i) => {
  const ox = (i % COLS) * W + W / 2, oy = Math.floor(i / COLS) * H + H - 100;
  const p = { s: S, at: (x: number, y: number, z = 0) => [ox + (x - y) * S * 0.866, oy + (x + y) * S * 0.5 - z * Z] as [number, number] };
  const out: ReactNode[] = [];
  const f = prism(p, 0, 0, 0.8, 0.8, 0, 0.5);
  out.push(<polygon key="lot" points={f.top} fill="#55585f" />);
  const def = DISTRICTS.find((d) => d.kind === kind)!;
  const kit: Kit = { out, p, light: 1, lamps: 0.2, win: "#f4d58a", base: def.hue, seed: 7 + i, level, ascendant: false };
  drawDesign(kit, kind, 0, 0, 0.72, 0, heightOf(kind, level));
  tiles.push(<g key={kind}>{out}<text x={ox} y={oy + 75} textAnchor="middle" fontSize={22} fill="#eee">{def.name}</text></g>);
});
const rows = Math.ceil(kinds.length / COLS);
writeFileSync(process.argv[2] ?? "catalog.svg", renderToStaticMarkup(
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${COLS * W} ${rows * H}`} width={COLS * W} height={rows * H}>
    <defs><linearGradient id="iso-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#bfe3ff" stopOpacity="0.55" /><stop offset="100%" stopColor="#3b5a7a" stopOpacity="0.2" /></linearGradient></defs>
    <rect width="100%" height="100%" fill={shade("#2d3340", 1)} />{tiles}
  </svg>,
));
