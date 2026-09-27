import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { splitOptions } from "../src/engine/moments.ts";
import { makeNpc } from "../src/engine/story.ts";
import { castBrief, facesIn, facesOf, knownFaces, meet, parseCast, personOf, pruneFaces, syncStoryCast } from "../src/engine/faces.ts";

const reply = `Dara Whitfield leans on the rail and laughs at you.

"You're the one who owns the tower," she says.

OPTIONS:
- Ask what she wants
- Walk on
CAST: Dara Whitfield | she | late 40s | Nigerian | dark brown | grey, cropped short | amber | a burn scar on her left hand
CAST: Tomas Reyes | he | 30 | Mexican | olive | black | brown | a porter's jacket`;
const { prose, cast } = parseCast(reply);
check("cast lines come out of the prose", !/CAST/.test(prose) && cast.length === 2, cast);
check("and the options still split", splitOptions(prose).options.length === 2);
check("a cast line is read field by field", cast[0].name === "Dara Whitfield" && cast[0].pronoun === "she" && cast[0].age === 44, cast[0]);
check("nationality, hair and style", cast[0].nation === "Nigerian" && cast[0].hair === "grey" && /cropped/.test(cast[0].hair_style ?? ""), cast[0]);
check("he is he", cast[1].pronoun === "he" && cast[1].nation === "Mexican");

const s = newGame({ seed: "faces-a" });
s.faces = {};
for (const c of cast) meet(s, c);
const before = personOf(facesOf(s)["dara whitfield"]);
s.arcology.week += 9;
meet(s, { name: "Dara Whitfield", hair: "bright pink", skin: "pale" });
const after = personOf(facesOf(s)["dara whitfield"]);
check("a later description doesn't change a face on file", before.body.hair_color === after.body.hair_color && after.body.skin === "dark brown", [before.body.hair_color, after.body.hair_color, after.body.skin]);
check("the same face comes back the same", JSON.stringify(before.body) === JSON.stringify(after.body));
check("seen twice is counted", facesOf(s)["dara whitfield"].seen === 2);
check("a man is drawn with a man's face and short hair", personOf(facesOf(s)["tomas reyes"]).body.face_shape === "masculine" && personOf(facesOf(s)["tomas reyes"]).body.hair_length <= 6);

check("a first name finds her", facesIn(s, "Dara waves from across the concourse.").map((f) => f.name).join() === "Dara Whitfield");
meet(s, { name: "Dara Kovacs" });
check("an ambiguous first name finds no one", !facesIn(s, "Dara waves.").length);
check("a full name still does", facesIn(s, "Dara Kovacs waves.")[0]?.name === "Dara Kovacs");
check("junk isn't a name", !meet(s, { name: "the crowd | 3" }) && !meet(s, { name: "" }));

const brief = castBrief(s, "Dara Whitfield is back.");
check("the model is told who it has met, and how they look", /Dara Whitfield — she, about \d+, Nigerian, dark brown skin, grey hair \(cropped short\)/.test(brief), brief.slice(0, 300));
check("and asked for cast lines", /CAST: full name/.test(brief));

// The story's cast is recognised before it has ever been in a scene, and filed weekly.
const t = newGame({ seed: "faces-b" });
if (t.story) t.story.cast.creditor ??= makeNpc(t.story, "creditor");
const npc = Object.values(t.story?.cast ?? {}).find((n) => n && !n.person);
if (npc) {
  check("the story's cast is known without being filed", knownFaces(t).some((f) => f.name === npc.name) && !t.faces?.[npc.name.toLowerCase()]);
  check("and found in a line about them", facesIn(t, `${npc.name} is waiting in your office.`)[0]?.name === npc.name);
  syncStoryCast(t);
  t.arcology.week += 60;
  pruneFaces(t);
  check("the story's cast is never forgotten", !!t.faces?.[npc.name.toLowerCase()]);
} else check("this start has a story cast", false);

s.arcology.week += 13;
meet(s, { name: "Tomas Reyes" });
pruneFaces(s);
check("seen once and not for twelve weeks, forgotten", !facesOf(s)["dara kovacs"]);
check("seen again, kept", !!facesOf(s)["tomas reyes"] && !!facesOf(s)["dara whitfield"]);
