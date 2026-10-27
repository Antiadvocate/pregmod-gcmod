/**
 * ONE PERSON, ONE RECORD. A dead tailor came back with a new surname because each spelling of a
 * name was filed as somebody new. Every face has an id now, and every name goes through findFace.
 */
import { check } from "./harness.ts";
import { newGame, sanitize } from "../src/engine/state.ts";
import { castBrief, findFace, meet, parseCast, settleFaces } from "../src/engine/faces.ts";
import { settle } from "../src/engine/fates.ts";

{
  const s = newGame({ seed: "faces", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  const yv = meet(s, { name: "Yvette Charron", age: 38 })!;
  check("everyone met gets an id", /^f-[a-z0-9]+$/.test(yv.id ?? ""), yv.id);
  check("her first name alone is her", meet(s, { name: "Yvette" }) === yv && Object.keys(s.faces!).length === 1);
  check("and it's remembered as another name for her", (yv.aliases ?? []).includes("Yvette"));
  check("an id finds her", findFace(s, yv.id!) === yv && findFace(s, `[${yv.id}]`) === yv);
  settle(s, "Yvette", "dead", "the owner had her killed");
  check("killed by her first name, the record is the one that dies", yv.fate?.fate === "dead" && Object.keys(s.faces!).length === 1);
  const { cast } = parseCast("Some prose.\nCAST: Yvette Dubois | she | 35 | French | olive | black, pinned | grey | a gold ring");
  for (const c of cast) meet(s, c);
  check("a new surname doesn't make a new Yvette", Object.keys(s.faces!).length === 1 && yv.fate?.fate === "dead");
  check("and the next scene still sees her dead, with the other name", /\[f-[a-z0-9]+\] Yvette Charron \[DEAD[^\n]*Also called Yvette, Yvette Dubois, the same person/.test(castBrief(s, "Yvette")), castBrief(s, "Yvette"));
  check("the model is told to use ids, and that a first name is one person", /put their id in front of the name/.test(castBrief(s, "")) && /first name nobody on file has, alive or dead/.test(castBrief(s, "")));
  const byId = parseCast(`CAST: ${yv.id} Yvette Charron | she | 38 | French | olive | black | grey | ring`).cast[0];
  check("a cast line can carry the id", byId.id === yv.id && byId.name === "Yvette Charron");
  check("one of the player's own is never filed as a stranger", meet(s, { name: her.name.split(" ")[0] }) === undefined);

  // An old save, with the duplicates already in it.
  s.faces!["yvette dubois"] = { name: "Yvette Dubois", pronoun: "she", age: 35, first: 5, last: 6, seen: 3, notes: [{ week: 6, text: "argued with the owner about a dress" }] };
  s.faces!["marco"] = { name: "Marco", pronoun: "he", age: 40, first: 1, last: 2, seen: 1, role: "creditor" };
  s.faces!["marco vale"] = { name: "Marco Vale", pronoun: "he", age: 30, first: 1, last: 2, seen: 1, role: "rival_owner" };
  s.chronicle = [{ week: 6, title: "x", text: "y", keys: ["face:yvette dubois"] }] as never;
  settleFaces(s);
  check("an old save's duplicates fold into one, and the dead one wins", !s.faces!["yvette dubois"] && yv.fate?.fate === "dead" && (yv.notes ?? []).some((n) => /dress/.test(n.text)));
  check("what pointed at the duplicate points at her now", (s.chronicle as never as { keys: string[] }[])[0].keys.includes("face:yvette charron"));
  check("two story people who share a first name are left as two", !!s.faces!["marco"] && !!s.faces!["marco vale"]);
  check("and loading does it", (sanitize(s), Object.values(s.faces!).every((f) => !!f.id)));
}
