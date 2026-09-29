/**
 * THE FEED. Posts are only worth reading if they grow out of what is true in this arcology, so these
 * hold the sources, the rule that every post cites real ones, and the laws reaching the narrator.
 */
import { check } from "./harness.ts";
import { newGame } from "../src/engine/state.ts";
import { writeLaw } from "../src/engine/court.ts";
import { feedOf, feedPrompt, likePost, sources, storyPrompt, takePosts, unread, writePosts, type Writer } from "../src/engine/feed.ts";
import { withOwner, setOwnerContext } from "../src/llm.ts";
import { ownerLine } from "../src/engine/you.ts";

const s = newGame({ seed: "feed-a", kit: "pussy", player_name: "Aurelia", address: "Mistress" });
s.arcology.rep = 20000;
writeLaw(s, { name: "Bare Soles Act", text: "No slave may wear shoes on the concourse.", push: [{ norm: "feet", dir: 1 }], effects: [] });
const law = sources(s).find((x) => x.label === "Bare Soles Act");
check("a law you wrote is a source, in its own words", !!law && law.text.includes("No slave may wear shoes on the concourse."), law);
check("so is the dress code and the economy", sources(s).some((x) => x.id === "dress") && sources(s).some((x) => x.id === "prosperity"));

const p = feedPrompt(s, 3);
check("the writer is given every source by id", p.user.includes(`[${law!.id}]`) && p.user.includes("No slave may wear shoes"));
check("and told the laws are binding", /laws are binding and literal/.test(p.system));
check("and that the city talks about the owner in the third person", /third person/.test(p.system) && /Aurelia/.test(p.system));
setOwnerContext(ownerLine(s));
check("so the 'you' statement isn't added on top", withOwner(p).system === p.system);
setOwnerContext("");

const reply = (posts: unknown[]) => "```json\n" + JSON.stringify({ posts }) + "\n```";
const kept = takePosts(s, reply([
  { board: "Court Watch", author: "heel clicker", kind: "citizen", title: "Fined for my girl's sandals", body: "Patrol stopped us by the fountain and wrote me up because she had sandals on. Barefoot on the concourse, they said, it's the law now.", draws_on: [law!.id] },
  { board: "Confessions", author: "anon", kind: "slave", title: "Made up", body: "This post cites nothing real and should be dropped by the game.", draws_on: ["law:nonsense"] },
  { board: "Nowhere", author: "x", kind: "alien", title: "No sources at all", body: "Neither does this one, so it goes too, whatever it says.", draws_on: [] },
]), 1000);
check("a post citing a real source is kept", kept.length === 1 && kept[0].title === "Fined for my girl's sandals" && kept[0].author === "heel_clicker");
check("posts citing nothing real are thrown away", feedOf(s).posts.length === 1);
check("a new post is unread", unread(s) === 1);
const again = takePosts(s, reply([{ board: "Court Watch", author: "y", kind: "citizen", title: "Fined for my girl's sandals", body: "The same post again, which the feed should not keep twice.", draws_on: [law!.id] }]), 2000);
check("a repeat title is not posted twice", again.length === 0);

likePost(s, kept[0].id);
check("an upvote remembers what it was about", feedOf(s).liked.includes(law!.id) && kept[0].liked === true);
check("and the writer is told to write more of it", feedPrompt(s).user.includes("The reader likes posts about: Bare Soles Act"));

const story = storyPrompt(s, kept[0]);
check("the narrator gets the post and the law it grew from", story.user.includes("Fined for my girl's sandals") && story.user.includes("No slave may wear shoes"));
check("and is told the owner, if there, is 'you'", /write the owner as "you"/.test(story.system));

let asked = 0;
const fake: Writer = async () => { asked++; return { ok: true, text: reply([{ board: "The Concourse", author: "b", kind: "visitor", title: "First day here", body: "Every slave on the concourse is barefoot and nobody even looks down. I kept staring.", draws_on: [law!.id, "dress"] }]) }; };
const r = await writePosts(s, fake);
check("a batch is written and kept", r.ok && r.added === 1 && asked === 1 && feedOf(s).posts[0].title === "First day here");
check("and the time is kept so the next one waits", typeof feedOf(s).last === "number");
const bad: Writer = async () => ({ ok: false, text: "", error: "429" });
const before = feedOf(s).last;
await writePosts(s, bad);
check("a failed batch still counts as a try", (feedOf(s).last ?? 0) >= (before ?? 0) && feedOf(s).posts.length === 2);

{
  // The rewrite: a voice, examples, the owner's people, and replies.
  const t = newGame({ seed: "feed-b", kit: "cock", address: "Master" });
  const girl = Object.values(t.people).find((p) => p.status === "owned" && p.age >= 18)!;
  const src = sources(t);
  check("the owner's slaves are people the city has noticed", src.some((x) => x.id === `slave:${girl.id}` && x.text.includes(girl.name)));
  const pr = feedPrompt(t);
  check("the writer is given the crude voice and told no euphemisms", /IT'S A PORN GAME/.test(pr.system) && /Never a euphemism/.test(pr.system));
  check("and posters with an angle who take their world for granted", /EVERY POSTER HAS AN ANGLE/.test(pr.system) && /never explain it/.test(pr.system));
  check("and examples of the voice", /EXAMPLES OF THE VOICE/.test(pr.system));
  check("and doesn't read the facts like a report any more", !/LAW IN FORCE|DOCTRINE,|GENE PROGRAM,/.test(pr.user));
  const got = takePosts(t, "```json\n" + JSON.stringify({ posts: [{ board: "The Concourse", author: "lift pervert", kind: "citizen", title: `Saw ${girl.name} on the tram`, body: `The owner's girl was on the 6 tram this morning and every man in the car forgot his stop. Somebody's getting a raise.`, replies: [{ author: "tram driver", text: "can confirm, missed three stops" }, { author: "x", text: "" }], draws_on: [`slave:${girl.id}`] }] }) + "\n```", 5000);
  check("a post about one of your slaves is kept", got.length === 1 && got[0].draws[0] === `slave:${girl.id}`);
  check("with its replies, empty ones dropped", got[0].replies?.length === 1 && got[0].replies[0].author === "tram_driver");
  check("the narrator reads the replies too", storyPrompt(t, got[0]).user.includes("can confirm, missed three stops"));
}
