// Writes public/art/vector/index.json: every layer stem the pack actually has, so the renderer can
// skip a proposed layer without asking the server for a file that is not there.
import { readdirSync, writeFileSync } from "node:fs";
const dir = new URL("../public/art/vector/", import.meta.url);
const stems = readdirSync(dir).filter((f) => f.endsWith(".svg")).map((f) => f.replace(/^Art_Vector_/, "").replace(/\.svg$/, "")).sort();
writeFileSync(new URL("index.json", dir), JSON.stringify(stems));
console.log(`${stems.length} layers`);
