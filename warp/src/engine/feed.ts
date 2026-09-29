/**
 * THE FEED — the arcology talking to itself, between weeks.
 *
 * Short posts, the way a city's message boards read: a citizen complaining about the new ordinance,
 * a slave's anonymous confession, a visitor from the Old World who can't believe what she saw on
 * the concourse, a clinic advertising the gene program. A small, cheap model writes a few at a time
 * in the background while the game is open; tapping one hands it to the narrator, who tells the
 * whole thing.
 *
 * THE RULE THAT MAKES IT WORTH READING: every post grows out of something that is actually true
 * here. The prompt hands the model a numbered list of SOURCES (each law in force with its words,
 * each doctrine, each habit the city has formed, each gene program, the dress code, the menials,
 * the buildings, the world, what the owner did in public) and every post must name the sources it
 * draws on. A post that names none, or names ones that don't exist, is thrown away. The laws are
 * binding: people in a post keep them, or break them and it matters.
 */
import type { SaveState } from "./types";
import { lawsOf } from "./court";
import { LAW_BY_ID } from "../data/laws";
import { DOCTRINE_BY_ID } from "../data/doctrines";
import { cultureOf, normLine, NORMS, NORM_IDS } from "./culture";
import { genomeOf } from "./genome";
import { slavesBrief } from "./menials";
import { worldBrief } from "./world";
import { societies, household } from "./compare";
import { cityOf } from "./city";
import { DISTRICT_BY_KIND } from "../data/districts";
import { ownerSide, similar } from "./memory";
import { genderWord } from "./you";
import { HOUSE_STYLE } from "./prompts";
import { rng } from "./rng";

export interface Post {
  id: string;
  week: number;
  /** Real time it arrived, for "4m ago". */
  at: number;
  board: string;
  author: string;
  kind: "citizen" | "slave" | "visitor" | "official" | "business";
  title: string;
  body: string;
  /** Source ids it grew from. Always at least one, always real. */
  draws: string[];
  score: number;
  comments: number;
  liked?: boolean;
  /** The top replies under it: other people's takes, which are most of what makes a board a board. */
  replies?: { author: string; text: string }[];
  /** The narrator's full telling, once asked for. */
  story?: { text: string; model?: string };
}

export interface FeedState {
  posts: Post[];
  /** Source ids the owner has upvoted posts from: the model is told to write more about them. */
  liked: string[];
  /** How many posts had arrived the last time the feed was opened, for the unread dot. */
  seen: number;
  /** Real time of the last batch. */
  last?: number;
}

export const feedOf = (s: SaveState): FeedState => (s.feed ??= { posts: [], liked: [], seen: 0 });
export const unread = (s: SaveState) => Math.max(0, feedOf(s).posts.length - feedOf(s).seen);

export const BOARDS = ["The Concourse", "Confessions", "Court Watch", "Clinic Talk", "For Sale & Wanted", "Old World Eyes", "Upper Floors", "The Verge"] as const;
const KINDS: Post["kind"][] = ["citizen", "slave", "visitor", "official", "business"];
const MAX_POSTS = 80;

/* ── what is true here ─────────────────────────────────────────────────────────────────────── */

export interface Source { id: string; label: string; text: string }

/** Everything a post may grow from, each with an id the model has to cite. */
export function sources(s: SaveState): Source[] {
  const out: Source[] = [];
  const a = s.arcology;
  for (const l of lawsOf(s)) {
    const def = LAW_BY_ID[l.id];
    if (def) out.push({ id: `law:${def.id}`, label: def.name, text: `The ${def.name} is the law: "${def.text}"${l.exempt ? " The owner's own household is exempt, and people know it." : ""}` });
  }
  for (const [id, d] of Object.entries(a.doctrines ?? {})) {
    const def = DOCTRINE_BY_ID[id];
    if (def && d.adoption >= 25) out.push({ id: `doctrine:${id}`, label: def.noun, text: `${Math.round(d.adoption)}% of the city believes in ${def.noun}: ${def.creed}` });
  }
  const norms = cultureOf(s).norms;
  for (const n of NORM_IDS) {
    if (Math.abs(norms[n]) >= 20) out.push({ id: `norm:${n}`, label: NORMS[n].name, text: normLine(n, norms[n]) });
  }
  if (s.genome) {
    for (const e of genomeOf(s).edits) {
      const traits = (e.spec.traits ?? []).map((t) => `${t.name}: ${t.what}`).join(" ");
      out.push({ id: `gene:${e.id}`, label: `the ${e.name} program`, text: `The owner ran the ${e.name} gene program: ${e.spec.summary}.${traits ? ` ${traits}` : ""}${e.spec.society ? ` ${e.spec.society}` : ""} The people it was run on carry it in their bodies.` });
    }
  }
  const yours = societies(s).find((x) => x.kind === "yours");
  if (yours) {
    const h = household(yours);
    out.push({ id: "dress", label: "the dress code", text: `On the street, citizen women wear ${h.citizen.clothes} and ${h.citizen.shoes}; their husbands ${h.husband}${h.slave ? `; household slaves ${h.slave.clothes}, ${h.slave.collar}, ${h.slave.shoes}` : ""}.` });
  }
  const menials = slavesBrief(s);
  if (menials) out.push({ id: "menials", label: "the city's slaves", text: menials.replace(/^·\s*/, "") });
  const built = cityOf(s).districts.filter((d) => d.kind !== "vacant" && d.level > 0);
  if (built.length) {
    const kinds = new Map<string, number>();
    for (const d of built) kinds.set(d.kind, Math.max(kinds.get(d.kind) ?? 0, d.level));
    out.push({ id: "city", label: "the buildings", text: `The city has: ${[...kinds].map(([k, lv]) => `${DISTRICT_BY_KIND[k as keyof typeof DISTRICT_BY_KIND]?.name ?? k} (level ${lv})`).join(", ")}.` });
  }
  const world = worldBrief(s);
  if (world) out.push({ id: "world", label: "the world", text: `Outside, this week: ${world.replace(/\n/g, " ")}` });
  for (const d of (s.deeds ?? []).filter((x) => x.public).slice(-4)) {
    out.push({ id: `deed:${d.id}`, label: "what the owner did", text: `Everyone saw it, week ${d.week}: ${ownerSide(d.summary, s.player.pronouns)}` });
  }
  // The owner's own people, as the city sees them: the ones who go out, and what they look like.
  for (const p of Object.values(s.people).filter((x) => (x.status === "owned" || x.status === "indentured") && x.age >= 18).slice(0, 6)) {
    const look = [p.body.boobs > 900 ? "huge tits" : p.body.boobs > 500 ? "big tits" : "", `${p.body.hair_color} hair`, p.clothes && p.clothes !== "no clothing" ? `usually in ${p.clothes}` : "usually naked"].filter(Boolean).join(", ");
    out.push({ id: `slave:${p.id}`, label: p.name, text: `${p.name}, ${p.age}, one of the owner's slaves (${p.assignment || "in the penthouse"}; ${look}). People in the city have seen her.` });
  }
  // What happened last week, for posters to react to.
  const week = s.reports.at(-1)?.lines.filter((l) => !/^(The city: ¤|Weather: |News: )|wants something\.$/.test(l.text)).sort((x, y) => y.weight - x.weight).slice(0, 5) ?? [];
  if (week.length) out.push({ id: "week", label: "last week", text: `Last week in the arcology: ${week.map((l) => ownerSide(l.text, s.player.pronouns)).join(" ")}` });
  out.push({ id: "prosperity", label: "the economy", text: `THE ARCOLOGY: ${a.name}, week ${a.week}. ${a.population.toLocaleString()} citizens, prosperity ${Math.round(a.prosperity)}, crime ${Math.round(a.crime)}, security ${Math.round(a.security)}.` });
  return out;
}

/** The owner, as the city talks about them: in the third person, because these are other people's posts. */
function ownerAsTheCitySeesThem(s: SaveState): string {
  const pr = s.player.pronouns ?? "he/him";
  const named = s.player.name && s.player.name !== "you" ? s.player.name : "";
  const title = s.player.address || (pr === "she/her" ? "Mistress" : "Master");
  return `THE OWNER (the player, who is reading this feed): ${named ? `${named}, ` : ""}${genderWord(s)}, ${pr}. The posts are written by other people, so they refer to the owner in the third person, as "the owner"${named ? `, "${named}"` : ""} or "${title}", with ${pr} pronouns. The owner is never the author of a post.`;
}

/* ── writing posts ─────────────────────────────────────────────────────────────────────────── */

/**
 * HOW THE BOARDS SOUND. The first version read like a policy digest: every post was about a law,
 * because the prompt made every post cite one and listed the facts like a government report. A
 * board is people with an angle, taking their world for granted; the facts are the water they
 * swim in, not the subject.
 */
const FEED_VOICE = `HOW THE POSTS SOUND. Like a real city's boards: people typing fast on their phones, mid-grievance, mid-brag, horny, petty, funny, scared. Slang, swearing, lowercase when they can't be bothered. Nobody writes like a press release, a narrator or a guidebook. No moral, no summing-up last line, no "it's a reminder that".

EVERY POSTER HAS AN ANGLE. They want something, are showing off, are pissed at someone, are hiding something, or are trying to get laid, and it leaks into how they write. Unreliable, biased, sometimes wrong about things. The replies disagree with them.

SHOW THE WORLD WITHOUT EXPLAINING IT. Each post lets the reader learn one thing about how life works here that an outsider wouldn't know: what things cost, which floor is rough, what a collar colour means, what the patrols look the other way on, a brand, a queue, a nickname, a bit of slang, a rumour about the owner. Posters take all of it for granted and never explain it. Invent those details freely; they just can't contradict WHAT'S TRUE HERE.

IT'S A PORN GAME. Sex is ordinary here and people post about it the way people do when nobody's stopping them: crude and specific. Say cock, dick, balls, pussy, cunt, clit, ass, asshole, tits, cum, fuck, suck, slut, whore plainly. Never a euphemism: no "core", "center", "folds", "member", "length", "womanhood", "down there", "made love", "had her way". Everyone in a post is an adult.`;

/** A different arcology's posts, for the voice only. */
const EXAMPLES = `EXAMPLES OF THE VOICE (from a different arcology; copy the voice, never these details):
· Confessions — u/throwaway_31st (citizen): "wife found out i've been tipping the pedicure girl" — Twenty a week so the salon slave on 31 rubs her tits on my shins while the missus gets her nails done. Wife found the receipts. Now she wants the girl for our place and she wants ME to pay for it. Cheapest divorce I never had.
   ↳ nailgirl_enjoyer: 20?? she does it for 12 if you ask for the side chair
   ↳ petra_k: your wife is the smartest person in this story
· For Sale & Wanted — u/verge_locksmith (business): "Lost collar keys? Don't pay the registry's 600" — Model 7s and 9s cut while you wait, bay 14 under the tram bridge. Bring the girl, it's quicker if I can see the lock. Cash, no questions, no receipts.
· Old World Eyes — u/maya_backpacks (visitor): "day 2 and room service came with a girl" — Not WITH a girl. The girl was part of it. She put the tray down, knelt next to the bed and waited like a lamp. I tipped her and she looked at me like I'd slapped her. Apparently you tip the OWNER. Nobody tells you anything here.
   ↳ localguy88: tourists tipping slaves is my favourite genre
· Confessions — u/grey_collar_22 (slave): "he lets me sleep in the bed when she's away" — And I've started hoping she gets another business trip. I know what I am. I still count the days.`;

export function feedPrompt(s: SaveState, n = 3): { system: string; user: string } {
  const src = sources(s);
  const f = feedOf(s);
  const recent = f.posts.slice(0, 12).map((p) => `· ${p.title}`);
  const liked = f.liked.map((id) => src.find((x) => x.id === id)?.label).filter(Boolean);
  const r = rng(`feed:${s.id ?? ""}:${f.posts.length}`);
  // Pull attention around the sources, so a feed doesn't become eight posts about one law.
  const focus = src.length ? r.pick(src).id : "";
  const happened = src.filter((x) => x.id === "week" || x.id.startsWith("deed:"));
  const people = src.filter((x) => x.id.startsWith("slave:"));
  const world = src.filter((x) => !happened.includes(x) && !people.includes(x));
  // Now and then, somebody comes back with an update, which is how a board grows its characters.
  const followUp = f.posts.length >= 4 && r.chance(0.4) ? r.pick(f.posts.slice(0, 15).filter((p) => p.kind !== "official")) : undefined;
  return {
    system: [
      `You write the message boards of an arcology, a private city-state in an adult game where slavery is legal and ordinary. Posts are short, like Reddit: a title, two to five sentences, and two or three replies. Citizens, slaves posting anonymously, visitors from outside, officials and businesses all post.`,
      FEED_VOICE,
      `WHAT'S TRUE HERE is binding. The laws are binding and literal: people keep them, dodge them, or break them and pay for it, and never mention a clause that isn't in the law's words. The gene programs show on the bodies of the people they were run on. People wear what the dress code says. The beliefs and habits are what people think is normal. Never invent a law, exemption or penalty, and never contradict a fact.`,
      ownerAsTheCitySeesThem(s),
      EXAMPLES,
      `Reply with JSON only.`,
    ].join("\n\n"),
    user: [
      `## WHAT'S TRUE HERE (posters take all this for granted)`,
      ...world.map((x) => `[${x.id}] ${x.text}`),
      happened.length ? `\n## WHAT JUST HAPPENED (people are talking about this)\n${happened.map((x) => `[${x.id}] ${x.text}`).join("\n")}` : "",
      people.length ? `\n## PEOPLE THE CITY HAS NOTICED (the owner's slaves)\n${people.map((x) => `[${x.id}] ${x.text}`).join("\n")}` : "",
      ``,
      `## BOARDS: ${BOARDS.join(" · ")}`,
      `## KINDS OF POST: a confession, a rant, a brag, asking for advice, a review, a classified ad, a personal ad, a PSA, a rumour, gossip about the owner or the owner's slaves, a first impression from a visitor, an official notice people mock in the replies.`,
      liked.length ? `The reader likes posts about: ${liked.join(", ")}. Write more that touch these.` : "",
      focus ? `At least one post touches [${focus}].` : "",
      happened.length ? `At least one post reacts to WHAT JUST HAPPENED.` : "",
      followUp ? `One post is an UPDATE from u/${followUp.author}, who earlier posted "${followUp.title}": ${followUp.body} Say what happened next.` : "",
      recent.length ? `## ALREADY POSTED (don't repeat these)\n${recent.join("\n")}` : "",
      ``,
      `Write ${n} new posts, each on a different board, from different kinds of author, each a different kind of post. For each, list the ids of the facts it touches (at least one).`,
      `JSON: {"posts":[{"board":"one of the boards","author":"a username","kind":"${KINDS.join("|")}","title":"the post title","body":"2-5 sentences","replies":[{"author":"a username","text":"one or two sentences"}],"draws_on":["ids from the lists above"]}]}`,
    ].filter((l) => l !== "").join("\n"),
  };
}

const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

function parse(text: string): Record<string, unknown> | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.indexOf("{"), end = body.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(body.slice(start, end + 1)) as Record<string, unknown>; } catch { return null; }
}

/** Keep the posts that cite real sources and aren't repeats; put them at the top of the feed. */
export function takePosts(s: SaveState, text: string, now = Date.now()): Post[] {
  const raw = parse(text);
  const list = Array.isArray(raw?.posts) ? raw!.posts as Record<string, unknown>[] : [];
  const known = new Set(sources(s).map((x) => x.id));
  const f = feedOf(s);
  const kept: Post[] = [];
  list.forEach((o, i) => {
    const title = str(o?.title, 160), body = str(o?.body, 1200);
    if (!title || !body || body.length < 20) return;
    const draws = (Array.isArray(o.draws_on) ? o.draws_on : []).map((d) => String(d).replace(/^\[|\]$/g, "").trim()).filter((d) => known.has(d));
    if (!draws.length) return;
    if ([...kept, ...f.posts.slice(0, 30)].some((p) => similar(p.title, title))) return;
    const board = BOARDS.find((b) => b.toLowerCase() === String(o.board ?? "").toLowerCase()) ?? BOARDS[0];
    const kind = KINDS.includes(o.kind as Post["kind"]) ? (o.kind as Post["kind"]) : "citizen";
    const r = rng(`post:${title}`);
    const replies = (Array.isArray(o.replies) ? o.replies : []).flatMap((x) => {
      const q = x as Record<string, unknown>;
      const text = str(q?.text, 400);
      return text ? [{ author: (str(q.author, 32) ?? "anon").replace(/\s+/g, "_"), text }] : [];
    }).slice(0, 4);
    kept.push({
      replies: replies.length ? replies : undefined,
      id: `post-${now.toString(36)}-${i}`, week: s.arcology.week, at: now, board, kind,
      author: (str(o.author, 32) ?? "anon").replace(/\s+/g, "_"), title, body, draws,
      score: r.int(2, 60) + (kind === "slave" ? 30 : 0), comments: replies.length + r.int(0, 30),
    });
  });
  if (kept.length) {
    f.posts = [...kept, ...f.posts].slice(0, MAX_POSTS);
    f.last = now;
    // Anything that fell off the end was read or not; the unread count never goes negative.
    f.seen = Math.min(f.seen, f.posts.length);
  }
  return kept;
}

export type Writer = (system: string, user: string) => Promise<{ ok: boolean; text: string; error?: string }>;

/** One batch. The caller decides when; this only writes and keeps. */
export async function writePosts(s: SaveState, write: Writer, n = 3): Promise<{ ok: boolean; added: number; error?: string }> {
  if (!sources(s).length) return { ok: false, added: 0, error: "nothing in the arcology to post about yet" };
  const { system, user } = feedPrompt(s, n);
  const res = await write(system, user);
  // A failed batch still counts as a try, so a broken model isn't asked again every few seconds.
  feedOf(s).last = Date.now();
  if (!res.ok) return { ok: false, added: 0, error: res.error };
  const added = takePosts(s, res.text).length;
  feedOf(s).last = Date.now();
  return { ok: added > 0, added, error: added ? undefined : "the posts didn't come back usable" };
}

/** An upvote: this post, and more like it. */
export function likePost(s: SaveState, id: string): void {
  const f = feedOf(s);
  const p = f.posts.find((x) => x.id === id);
  if (!p) return;
  p.liked = !p.liked;
  p.score += p.liked ? 1 : -1;
  if (p.liked) f.liked = [...p.draws, ...f.liked.filter((d) => !p.draws.includes(d))].slice(0, 12);
  else f.liked = f.liked.filter((d) => !p.draws.includes(d) || f.posts.some((q) => q.liked && q.draws.includes(d)));
}

/* ── the whole story ───────────────────────────────────────────────────────────────────────── */

/**
 * For the narrator: the post, and everything it grew from, and every law in force besides, since
 * a longer telling will walk past more of the city than the post did.
 */
export function storyPrompt(s: SaveState, p: Post): { system: string; user: string } {
  const src = sources(s);
  const drawn = src.filter((x) => p.draws.includes(x.id));
  const laws = src.filter((x) => x.id.startsWith("law:") && !p.draws.includes(x.id));
  const rest = src.filter((x) => !x.id.startsWith("law:") && !p.draws.includes(x.id));
  return {
    system: `You write the stories behind posts on an arcology's message boards, for an adult game where slavery is legal and ordinary. A reader tapped a post; tell what actually happened, in full: the people in it, the place, the incident, the sex if there was any, and what came of it.

${HOUSE_STYLE}

The story is about the people in the post, told in the third person, past or present tense. The laws are binding and literal: people keep them, or break them and it matters. The gene programs are visible on the bodies of the people they were run on. People wear what the dress code says. The doctrines and habits are what people think is normal. Never invent a law, clause, exemption or penalty. If the owner (the player) appears, write the owner as "you". Everyone is an adult. Four to eight paragraphs. Plain prose only, no title, no JSON.`,
    user: [
      `## THE POST, on ${p.board}, by ${p.author} (${p.kind})`,
      `${p.title}`,
      `${p.body}`,
      ...(p.replies ?? []).map((q) => `  ↳ ${q.author}: ${q.text}`),
      ``,
      `## WHAT IT GREW FROM (the story keeps to these)`,
      ...drawn.map((x) => x.text),
      laws.length ? `\n## THE OTHER LAWS IN FORCE (binding here too)\n${laws.map((x) => x.text).join("\n")}` : "",
      rest.length ? `\n## THE REST OF THE ARCOLOGY (background)\n${rest.map((x) => x.text).join("\n")}` : "",
    ].filter(Boolean).join("\n"),
  };
}
