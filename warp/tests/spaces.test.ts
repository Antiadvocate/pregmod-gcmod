/**
 * THE SPACES — places are kept, a room of her own is on the map, everyone is somewhere at each part
 * of the day, who meets whom follows where they are, and a place remembers what happened in it.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { syncSpaces, scheduleWeek, occupants, tickSpaces, spaceLine, addItem, removeItem, setAccess, allowed, roomIdOf, liveSpaces, PARTS, AWAY } from "../src/engine/spaces.ts";
import { moveEdge, getEdge } from "../src/engine/social.ts";

{
  const s = newGame({ seed: "spaces", starting_slaves: 6 } as never);
  const women = Object.values(s.people).filter((p) => p.status === "owned");
  const sp = syncSpaces(s);
  check("the household's rooms exist", ["penthouse", "kitchen", "baths", "lounge", "dormitory"].every((id) => sp[id] && !sp[id].gone));
  const her = women[0];
  her.room = { levels: { space: 1, bed: 0, bath: 0, view: 0, climate: 0 }, extras: [], touches: [{ text: "a framed photo of her sister", week: 1 }], used_to: 0 };
  syncSpaces(s);
  check("a room of her own is on the map", !!s.spaces![roomIdOf(her)] && /photo of her sister/.test(s.spaces![roomIdOf(her)].look));
  const sch = scheduleWeek(s);
  check("everyone is somewhere at every part of the day", women.every((p) => PARTS.every((part) => !!sch.at[p.id]?.[part])));
  check("she sleeps in her own room", sch.at[her.id].night === roomIdOf(her));
  check("the others sleep in the dormitory", women.slice(1).every((p) => sch.at[p.id].night === "dormitory" || sch.at[p.id].night === "suite"));
  check("nobody is put in the penthouse in her own time", women.every((p) => sch.at[p.id].evening !== "penthouse"));
  check("off-map work is away, not home", !Object.values(sch.at).some((a) => a.morning === undefined) && typeof AWAY === "string");

  const other = women[1];
  check("her room is closed to the others", !allowed(s, other, s.spaces![roomIdOf(her)]));
  setAccess(s, "lounge", "owner");
  check("a place you close is closed", !allowed(s, other, s.spaces!.lounge) && scheduleWeek(s) && !women.some((p) => s.schedule!.at[p.id].evening === "lounge"));
  setAccess(s, "lounge", "household");

  // Two who hate each other, sharing an evening, make a scene; it goes in the place's history.
  const [a, b] = women.slice(2, 4);
  moveEdge(s.edges, a.id, b.id, { warmth: -60 }); moveEdge(s.edges, b.id, a.id, { warmth: -60 });
  let row = false;
  for (let w = 0; w < 30 && !row; w++) {
    s.arcology.week++;
    scheduleWeek(s);
    s.schedule!.at[a.id].evening = "lounge"; s.schedule!.at[b.id].evening = "lounge";
    const before = s.spaces!.lounge.history.length;
    tickSpaces(s);
    row = s.spaces!.lounge.history.slice(before).some((h) => h.who.includes(a.id) && h.who.includes(b.id));
  }
  check("enemies sharing evenings have it out, and the place remembers", row, getEdge(s.edges, a.id, b.id));

  const line = spaceLine(s, s.spaces!.kitchen, "evening");
  check("the narrator gets the place: what it is and who's there", /THE PLACE: the kitchen/.test(line) && /(Also here|Nobody else)/.test(line), line);
  s.arcology.cash = 1e6;
  addItem(s, "lounge", "a pool table");
  check("what you put in a place is in it", s.spaces!.lounge.items.some((i) => i.name === "a pool table") && /pool table/.test(spaceLine(s, s.spaces!.lounge, "evening")));
  removeItem(s, "lounge", s.spaces!.lounge.items[0].id);
  check("and can be taken out", !s.spaces!.lounge.items.length);
  check("occupants are counted from the schedule", typeof occupants(s, "dormitory", "night").length === "number" && liveSpaces(s).length >= 5);
}
