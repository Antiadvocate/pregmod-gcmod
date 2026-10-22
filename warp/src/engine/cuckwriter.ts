/**
 * THE OTHER MAN, WRITTEN — each chapter and each outcome put into words by the model, for this
 * woman, this owner and this man.
 *
 * The engine still decides everything: which chapter is next, what each choice does to her, to
 * you and to the three numbers. The hand-written chapter in data/cuckold.ts becomes the OUTLINE:
 * what happens, in what order, and what has to be said. The model writes it fresh from her card
 * (her voice, her body, her past, what she remembers), from who the owner is (their body and
 * their own description of themself, appended to every call by llm.ts), from the man as he was
 * first written, and from every chapter before this one, so no two runs read the same.
 *
 * Without a model, or when a call fails, the game's own words stand.
 */
import type { SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { coarsen, REGISTER_TAIL } from "./register";
import { HOUSE_STYLE, personCard } from "./prompts";
import { PLAIN_RULES } from "./style";
import { noteStock, stockLine } from "./turn";
import { bullDickWords, type CuckState, type Motive } from "./cuckold";
import { beatNow, cx } from "../data/cuckold";

export const canWrite = (s: SaveState) => modelsAvailable() && !s.models.lean_mode;

const MOTIVE: Record<Motive, string> = {
  for_you: "She is doing this FOR THE OWNER. She loves them (or near enough) and they asked. Every step costs her something, and the sting is watching her find out she likes what it costs.",
  for_her: "She is doing this FOR HERSELF. She wanted a man like him and the owner gave her leave. She tries to be kind to the owner about it, which is worse than if she weren't.",
  spite: "She is doing this TO HURT THE OWNER. She has resented them for a while and they just handed her the knife. She is polite on the surface and enjoys every inch of it.",
};

function howFar(c: CuckState): string {
  const fall = c.fall < 20 ? "She's barely started with him." : c.fall < 45 ? "He's had her, or nearly, and she's starting to want it." : c.fall < 70 ? "She goes to him gladly and thinks about him when she's with the owner." : "In her body and her habits she's his.";
  const pull = c.pull > 40 ? "Her heart is still the owner's." : c.pull > 0 ? "She's still more the owner's than his, just." : c.pull > -40 ? "She's more his than the owner's now, and both men know it." : "She's his. The owner is someone she lives with.";
  const you = c.yielded < 20 ? "The owner arranged this and still thinks of it as arranging." : c.yielded < 50 ? "The owner has started sitting and watching, and getting off on it." : c.yielded < 80 ? "The owner has taken the role: the one who waits, watches, cleans up." : "The owner is all the way in: their cuck, and they know it.";
  return `${fall} ${pull} ${you} She has spent ${c.nights} night${c.nights === 1 ? "" : "s"} with him so far.`;
}

function himBrief(c: CuckState): string {
  const b = c.bull!;
  const kind = b.kind === "broker" ? "a broker, rich and patient, who has tried to buy her from the owner before" : b.kind === "brute" ? "a contractor on the owner's own security detail, big and crude, who has wanted her for months" : "a dock hand, young and beautiful";
  return `${b.name} (she calls him ${b.short}), ${b.age}, ${kind}. He has ${bullDickWords(b)}, bigger than the owner's, and he knows it.${b.manner ? ` HOW HE IS (keep him exactly this man): ${b.manner}` : ""}`;
}

function soFar(c: CuckState): string {
  if (!c.log.length) return "";
  const lines = c.log.map((l, i) => {
    const full = i >= c.log.length - 2;
    return full
      ? `### Week ${l.week}, ${l.title}\n${l.setup ? `${l.setup.slice(0, 1800)}\n` : ""}THE OWNER CHOSE: ${l.chose}\n${l.text.slice(0, 1800)}`
      : `· Week ${l.week}, ${l.title}: the owner chose "${l.chose}". ${l.text.slice(0, 260).replace(/\n+/g, " ")}…`;
  });
  return `## THE STORY SO FAR (build on it; people remember; never repeat a line or a beat from it)\n${lines.join("\n\n")}`;
}

const CHAPTER_SYSTEM = `You write one chapter of a netorare (NTR, cuckold) story inside Free Cities, an adult text game about owning an arcology where slavery is legal and ordinary. The player is the owner, written as "you". They have given one of their slave women to another man, a little more every week, and they watch her go.

Write it the way the best NTR stories are written: slow, specific and humiliating. The sting is in the small things: the comparisons, her eyes going to him and not coming back, what she says and what she stops saying, the owner noticing every one. He is confident and enjoys it. She changes a little each chapter, in her own way. Explicit sex in plain crude words when the outline has sex in it.

What you have:
- THE OUTLINE is what happens in this chapter, in order. Keep every event in it: who does what to whom, what's said that matters, how it ends. It is the game's own version and many players have read it: write it FRESH in your own words. Never reuse its sentences. Add detail, dialogue and setting from the cards.
- HER card: her voice, body, history, tastes and memories. She speaks like herself, not like the outline. Use her past, her body and what she's into.
- THE OWNER's body and their own description of themself (attached below). Every comparison is to that actual body; never give the owner anything they don't have. Their self-description is how they see themself; let the chapter press on it.
- WHY SHE'S DOING IT and HOW FAR IT HAS GONE: every line she says comes out of these.
- THE STORY SO FAR: this is the next chapter of it. Pick up threads, call back to things.

Rules: second person, present tense. Four to seven paragraphs. Never decide what the owner does or feels at the moment the chapter ends; stop at the moment of choice; the choices are the question. Never invent another named person. Relabel each choice in the owner's voice to fit what you wrote (3 to 12 words); each must still be the same action.

${HOUSE_STYLE}

Output ONE strict JSON object and nothing else:
{"scene":"the chapter","choices":[{"id":"the original id","label":"new label"}],"him":"only if HOW HE IS is missing: one or two sentences fixing how he looks, moves and talks, for every later chapter"}`;

/** Write the chapter waiting. Returns whether it was written; mutates `s.cuckold.written`. */
export async function writeChapter(s: SaveState, signal?: AbortSignal): Promise<{ ok: boolean; error?: string }> {
  const x = cx(s);
  const b = beatNow(s);
  if (!x || !b || !canWrite(s)) return { ok: false };
  if (x.c.written?.beat === b.id) return { ok: true };
  const opts = b.options(x);
  const res = await call({
    system: CHAPTER_SYSTEM,
    user: [
      `## HER\n${personCard(s, x.p, `${x.him} ${b.title}`)}`,
      x.c.bull ? `## HIM\n${himBrief(x.c)}` : `## HIM\nNot chosen yet: the owner picks him at the end of this chapter, from the choices.`,
      `## WHY SHE'S DOING IT\n${MOTIVE[x.c.motive]}`,
      `## HOW FAR IT HAS GONE\n${howFar(x.c)}`,
      soFar(x.c),
      `## THIS CHAPTER: ${b.title}\n### THE OUTLINE\n${b.text(x)}`,
      `## THE CHOICES (id: what the owner does)\n${opts.map((o) => `· ${o.id}: ${o.label}${o.hint ? ` (${o.hint})` : ""}${o.locked?.(x) ? " [locked for now; label it anyway]" : ""}`).join("\n")}`,
      stockLine(s),
      PLAIN_RULES,
      REGISTER_TAIL,
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    json: true,
    maxTokens: 2600,
    temperature: 0.95,
    signal,
  });
  if (!res.ok) return { ok: false, error: res.error };
  const out = parseJson<{ scene?: string; choices?: { id?: string; label?: string }[]; him?: string }>(res.text);
  const scene = out?.scene ? coarsen(String(out.scene)).trim() : "";
  if (scene.length < 200) return { ok: false, error: "the model's chapter came back empty" };
  // The story may have moved while the model was writing.
  const live = s.cuckold;
  if (!live || live.ended || beatNow(s)?.id !== b.id) return { ok: false };
  const ids = new Set(opts.map((o) => o.id));
  const labels: Record<string, string> = {};
  for (const ch of out?.choices ?? []) if (ch?.id && ch.label && ids.has(String(ch.id))) labels[String(ch.id)] = String(ch.label).slice(0, 90);
  live.written = { beat: b.id, scene: scene.slice(0, 7000), labels, model: res.model };
  if (live.bull && !live.bull.manner && out?.him) live.bull.manner = String(out.him).slice(0, 400);
  noteStock(s, scene);
  return { ok: true };
}

const OUTCOME_SYSTEM = `You write what happens next in a netorare (NTR, cuckold) story inside Free Cities, an adult text game about owning an arcology. The owner ("you") was shown the chapter and made a choice. The game has decided what comes of it: WHAT HAPPENS is the game's own version, many players have read it, and you write it FRESH in your own words without reusing its sentences. Keep every event, who does what, everything said that matters, any money, and how it ends; don't add consequences it doesn't have. Carry on straight from the chapter as written: same room, same people, same voices, same man.

Two to five paragraphs, second person, present tense. Her lines come out of her card, why she's doing it and how far it has gone. Explicit in plain crude words when there's sex. If WHAT HAPPENS ends the story, end it properly: land it.

${HOUSE_STYLE}`;

/** Rewrite the outcome of the last choice. Returns the text, or "" to keep the game's own. */
export async function writeOutcome(s: SaveState, signal?: AbortSignal): Promise<string> {
  const c = s.cuckold;
  const x = cx(s);
  const last = c?.log.at(-1);
  if (!c || !x || !last || last.written || !canWrite(s)) return "";
  const earlier = { ...c, log: c.log.slice(0, -1) };
  const res = await call({
    system: OUTCOME_SYSTEM,
    user: [
      `## HER\n${personCard(s, x.p, `${x.him} ${last.chose}`)}`,
      c.bull ? `## HIM\n${himBrief(c)}` : "",
      `## WHY SHE'S DOING IT\n${MOTIVE[c.motive]}`,
      `## HOW FAR IT HAS GONE (after this choice)\n${howFar(c)}`,
      soFar(earlier),
      `## THE CHAPTER, AS THE OWNER READ IT: ${last.title}\n${last.setup ?? ""}`,
      `## THE OWNER CHOSE\n${last.chose}`,
      `## WHAT HAPPENS (the game's version; rewrite it)\n${last.text}`,
      c.ended ? `## THIS IS THE END OF THE STORY\nIt ends here: ${c.ended.ending.replace("_", " ")}.` : "",
      stockLine(s),
      PLAIN_RULES,
      REGISTER_TAIL,
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
    maxTokens: 1800,
    temperature: 0.9,
    signal,
  });
  if (!res.ok) return "";
  const text = coarsen(res.text).trim();
  if (text.length < 120) return "";
  // Only if nothing else was answered in the meantime.
  if (s.cuckold?.log.at(-1) !== last) return "";
  last.text = text.slice(0, 7000);
  last.written = true;
  if (c.ended) c.ended.text = last.text;
  noteStock(s, text);
  return last.text;
}
