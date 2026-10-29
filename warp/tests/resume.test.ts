/**
 * SCENES END WHEN YOU SAY. The game used to end a scene on its own: two turns that changed nothing,
 * the bookkeeper calling it settled, "that's all" or "get out" anywhere in a reply, and every open
 * scene at the end of the week. The player came back to a scene they were in the middle of and
 * found it closed, with no way to carry on.
 */
import { check } from "./harness.ts";
import "../src/data/story/index.ts";
import { newGame } from "../src/engine/state.ts";
import { closeAllMoments, endedMoments, momentsOf, openMoment, openMoments, playMoment, resumeMoment } from "../src/engine/moments.ts";
import { concludeMoment, deedsOf } from "../src/engine/deeds.ts";

{
  const s = newGame({ seed: "resume", starting_slaves: 2 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  const id = openMoment(s, { person: her.id, title: "Talking", source: "test", happened: `${her.name} waits.` });
  for (const said of ["Tell me about your day", "Go on", "And then?", "That's all for now, get out"]) await playMoment(s, id, said);
  const m = momentsOf(s).find((x) => x.id === id)!;
  check("flat turns and a line that sounds like leaving don't end it", m.open && !m.concluded, { open: m.open, ended: m.ended });
  check("it only says it might have wound down", !!m.winding, m.winding);

  const first = await concludeMoment(s, m);
  check("ending it is yours, and it leaves its deed", !m.open && !!first);
  check("an ended scene is listed so it can be picked back up", endedMoments(s, her.id).some((x) => x.id === id));
  const len = m.log.length;
  check("picking it back up opens it where it stopped", resumeMoment(s, id) && m.open && m.log.length === len && m.from === len);
  check("and what it left the first time stands", m.past?.[0] === first!.id && deedsOf(s).some((d) => d.id === first!.id));

  await playMoment(s, id, "Actually, come back and sit with me");
  const second = await concludeMoment(s, m);
  check("ending it again reads only what came after", !!second && second.id !== first!.id && second.summary.includes("sit with me") && !second.summary.includes("get out"), second?.summary);

  // Answering an ended scene carries it on too.
  const ended = momentsOf(s).find((x) => x.id === id)!;
  await playMoment(s, id, "One more thing");
  check("replying to an ended scene picks it back up", ended.open);
  closeAllMoments(s);
  check("clearing them all still clears them", openMoments(s).length === 0);
}

{
  // The list never drops a scene that's still open to make room.
  const s = newGame({ seed: "resume-cap", starting_slaves: 1 } as never);
  const her = Object.values(s.people).find((p) => p.status === "owned")!;
  const keep = openMoment(s, { person: her.id, title: "The one I'm in", source: "test", happened: "x" });
  for (let i = 0; i < 70; i++) { const x = openMoment(s, { person: her.id, title: `old ${i}`, source: "test", happened: "y" }); momentsOf(s).find((m) => m.id === x)!.open = false; }
  check("an open scene survives the list being trimmed", momentsOf(s).some((m) => m.id === keep && m.open) && momentsOf(s).length <= 61, momentsOf(s).length);
}
