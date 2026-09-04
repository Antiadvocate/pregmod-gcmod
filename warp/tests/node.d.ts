/** The suite ships no @types/node on purpose (see tests/run.ts). One test needs to list a
 *  directory to check the art pack against what the renderer asks for; this is that, and nothing
 *  more, so the app itself still has no node dependency of any kind. */
declare module "node:fs" {
  export function readdirSync(path: string): string[];
}
