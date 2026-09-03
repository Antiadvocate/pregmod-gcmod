/** Every test, one process, one exit code.
 *  (No @types/node here on purpose — the suite bundles through esbuild and the app has no node
 *   dependency at all, so one declaration is cheaper than a types package.) */
declare const process: { exit(code: number): never };

import "./obedience.test.ts";
import "./kernel.test.ts";
import "./world.test.ts";
import "./intimacy.test.ts";
import { report } from "./harness.ts";

process.exit(report() ? 1 : 0);
