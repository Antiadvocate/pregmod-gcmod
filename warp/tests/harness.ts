/** The smallest thing that can fail loudly. Tests here are behavioural: each one names a failure
 *  the engine is supposed to prevent, and the comment says what it looked like when it happened. */
export const results: { name: string; ok: boolean; extra?: unknown }[] = [];

export function check(name: string, ok: boolean, extra?: unknown): void {
  results.push({ name, ok, extra });
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
  if (!ok && extra !== undefined) console.log("       ", extra);
}

export function near(a: number, b: number, tol = 0.001): boolean {
  return Math.abs(a - b) <= tol;
}

export function report(): number {
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  return failed.length;
}
