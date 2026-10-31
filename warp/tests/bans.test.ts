/**
 * DROPPED FOR GOOD. "Fuck anything related to this. Do not bring this person or this storyline up
 * again." The event goes, anything else waiting about it goes, its threads close, the people in it
 * are out of every story, every prompt is told, and anything written later about it is thrown away.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { meet } from "../src/engine/faces.ts";
import { file, tie, tiedTo } from "../src/engine/others.ts";
import { bansBrief, dropStoryline, isBanned, liftBan, purgeBanned, suggestBan } from "../src/engine/bans.ts";
import { hotHooks } from "../src/engine/chronicle.ts";

{
  const s = newGame({ seed: "bans", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  const m = file(s, "Mireille Faucher", "scullery maid")!;
  tie(m, "the maid she argues with over the sheets", her.id);
  const ev = { id: "going-laundry", kind: "dynamic", person: her.id, seed: `Mireille has ${her.name} pinned by the laundry chute, arguing about the sheets.`, options: [{ id: "x", label: "x" }], week: s.arcology.week, severity: "notable", written: { model: "t", title: "Laundry Trouble" }, hook: "the laundry feud goes on" } as never;
  const other = { id: "e-other", kind: "dynamic", person: her.id, seed: "The laundress comes to you with a complaint.", options: [{ id: "y", label: "y" }], week: s.arcology.week, severity: "minor" } as never;
  const fine = { id: "e-fine", kind: "dynamic", person: her.id, seed: `${her.name} wants you to watch her with a client.`, options: [{ id: "z", label: "z" }], week: s.arcology.week, severity: "minor" } as never;
  s.events.push(ev, other, fine);
  s.chronicle = [{ keys: [her.id], title: "Laundry", text: "She and Mireille fought in the laundry, and she bit her.", hook: "Mireille wants her on her knees in the laundry to make it up", week: s.arcology.week, life: 6 }] as unknown as typeof s.chronicle;
  s.deeds = [...(s.deeds ?? []), { id: "d1", week: s.arcology.week, person: her.id, summary: "x", tags: [], effects: [], follow: { due: s.arcology.week + 1, situation: "Mireille is back at the laundry with a basket and a grudge.", options: [] } }] as unknown as typeof s.deeds;

  const sug = suggestBan(s, ev);
  check("it offers what the event is about and who's in it", sug.words.includes("laundry") && sug.faces.some((f) => f.name === "Mireille Faucher"), sug);

  dropStoryline(s, ev, sug.words, sug.faces.map((f) => f.id!));
  check("the event goes, and so does anything else waiting about it", !s.events.some((e) => e.id === "going-laundry" || e.id === "e-other") && s.events.some((e) => e.id === "e-fine"), s.events.map((e) => e.id));
  check("its thread closes", !hotHooks(s, [her.id]).length && s.chronicle![0].closed === true);
  check("and a follow-up waiting on it is cancelled", (s.deeds ?? []).find((d) => d.id === "d1")?.follow?.fired === true);
  check("the people in it are out of every story", !tiedTo(s, her.id).length && meet(s, { name: "Mireille" }) === undefined);
  check("every prompt is told", /ENDED FOR GOOD BY THE PLAYER[^]*laundry[^]*Mireille Faucher/.test(bansBrief(s)), bansBrief(s));
  check("anything written later about it is caught, under any form of the word", isBanned(s, "the laundress has a message") && isBanned(s, "Mireille waves from the stairs") && !isBanned(s, `${her.name} takes a client upstairs`));
  s.events.push({ id: "late", kind: "dynamic", seed: "More laundry nonsense.", options: [], week: s.arcology.week, severity: "minor" } as never);
  check("and thrown away before the player sees it", purgeBanned(s) === 1);

  liftBan(s, s.bans![0].id);
  check("and it can be brought back", !s.bans!.length && !s.faces!["mireille faucher"].banned && !isBanned(s, "laundry"));
}

import { continuitySlips } from "../src/engine/continuity.ts";
import { facesIn } from "../src/engine/faces.ts";
{
  // Someone dropped who was only ever "the laundry girl". Her first word is "the": every scene was
  // flagged "Continuity slip: the laundry girl is out of the story for good", and every event was
  // thrown away, so the player's slaves stopped having anything happen to them at all.
  const s = newGame({ seed: "bans-the", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  const lg = meet(s, { name: "the laundry girl" })!;
  dropStoryline(s, null, ["laundry", "girl"], [lg.id ?? "the laundry girl"], "laundry");
  const ordinary = `${her.name} kneels on the rug and takes the owner's cock in her mouth. The girl next door can hear everything.`;
  check("an ordinary scene isn't a slip", continuitySlips(s, ordinary, [her]).length === 0, continuitySlips(s, ordinary, [her]));
  check("nor is an ordinary event thrown away", !isBanned(s, ordinary));
  check("but she's still caught by her whole name", continuitySlips(s, "Then the laundry girl walks in.", [her]).length === 1 && isBanned(s, "Then the laundry girl walks in."));
  check("and so is what the storyline was about", isBanned(s, "There's a fight in the laundry room."));

  const c = meet(s, { name: "the courier" })!;
  check("a face called 'the something' isn't in every sentence", !facesIn(s, "She hands the owner the bottle.").includes(c));
  check("only where it's named", facesIn(s, "The courier is at the door.".replace("The", "the")).includes(c));
}
{
  const s = newGame({ seed: "bans-case", starting_slaves: 1 } as never);
  const d = meet(s, { name: "Dario Bellini" })!;
  const { findFace } = await import("../src/engine/faceid.ts");
  check("a lowercase first name still finds its face", findFace(s, "dario") === d);
}
