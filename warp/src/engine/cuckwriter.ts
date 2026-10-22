/**
 * THE OTHER MAN, WRITTEN — every word of it comes from the model.
 *
 *   writeChapter  the next chapter: what happens, her in it, him in it, and the choices, each one
 *                 something the owner would actually say or do, in the owner's own voice, tagged
 *                 with a move from the engine's closed table (engine/cuckold.ts MOVES).
 *   readOwn       when you type your own answer instead: which move it amounts to.
 *   writeOutcome  what came of it, with the engine's facts (what the move did to her body, the
 *                 numbers, any money, any ending) kept exactly.
 *
 * Each prompt carries her whole card (voice, body, past, tastes, memories), the owner (body and
 * their own self-description, appended to every call by llm.ts), every answer the owner has given
 * so far (so the choices sound like them), why she agreed, how far it has gone, the man as he was
 * first written, and the story so far. The engine decides the phase and what each choice does;
 * the model never decides an outcome. Without a model the story doesn't start.
 */
import type { SaveState } from "./types";
import { call, parseJson } from "../llm";
import { modelsAvailable } from "../config";
import { coarsen, REGISTER_TAIL } from "./register";
import { HOUSE_STYLE, personCard } from "./prompts";
import { PLAIN_RULES } from "./style";
import { noteStock, stockLine } from "./turn";
import { hasWomb } from "./pregnancy";
import { hasCock } from "./you";
import {
  type Candidate, type Choice, type CuckState, type Motive, type Move,
  allowed, answer, bullDickWords, herOf, movesNow, offerPrice, pregnantByHim, ready, yourDick,
} from "./cuckold";
import { dickWord } from "./genitals";

export const canWrite = (s: SaveState) => modelsAvailable() && !s.models.lean_mode;

const MOTIVE: Record<Motive, string> = {
  for_you: "She is doing this FOR THE OWNER. She loves them, or near enough, and they asked. Every step costs her something, and the sting is watching her find out she likes what it costs.",
  for_her: "She is doing this FOR HERSELF. She wanted a man like him and the owner gave her leave. She tries to be kind to the owner about it, which is worse than if she weren't.",
  spite: "She is doing this TO HURT THE OWNER. She has resented them for a while and they handed her the knife. Polite on the surface, and she enjoys every inch of it.",
};

function howFar(s: SaveState, c: CuckState): string {
  const fall = c.fall < 20 ? "She's barely started with him." : c.fall < 45 ? "She's starting to want him." : c.fall < 70 ? "She goes to him gladly and thinks about him when she's with the owner." : "In her body and her habits she's his.";
  const pull = c.pull > 40 ? "Her heart is still the owner's." : c.pull > 0 ? "She's still more the owner's than his, just." : c.pull > -40 ? "She's more his than the owner's now, and both of them know it." : "She's his. The owner is someone she lives with.";
  const you = c.yielded < 20 ? "The owner arranged this and still thinks of it as arranging." : c.yielded < 50 ? "The owner has started watching, and getting off on it." : c.yielded < 80 ? "The owner has taken the role: the one who waits, watches, cleans up." : "The owner is all the way in, and knows what they are.";
  const extra = [
    c.nights ? `She has spent ${c.nights} night${c.nights === 1 ? "" : "s"} with him.` : "",
    c.firsts.length ? `He took ${c.firsts.join(" and ")}.` : "",
    c.caged ? "The owner is locked in a chastity cage; he has the key." : "",
    c.breeding === "yes" ? "The owner has let him try to breed her." : c.breeding === "hers" ? "Whether he breeds her is up to her." : c.breeding === "no" ? "She's on contraceptives by the owner's order." : "",
  ];
  const p = herOf(s);
  if (p && pregnantByHim(s, p)) extra.push(`She is pregnant with his child (${p.womb.weeks} weeks).`);
  return [fall, pull, you, ...extra].filter(Boolean).join(" ");
}

function himBrief(s: SaveState, c: CuckState): string {
  const b = c.bull;
  if (!b) return "";
  const yours = hasCock(s) ? `the owner's is ${dickWord(yourDick(s))}` : "the owner has no cock";
  return `## HIM (keep him exactly this man)\n${b.name}, ${b.age}. ${b.who}\nHow he is: ${b.manner}\nHe has ${bullDickWords(b)}; ${yours}.`;
}

function ownerVoice(c: CuckState): string {
  const said = c.log.map((l) => `${l.own ? "(typed it themselves) " : ""}"${l.chose}"`);
  return said.length
    ? `## WHAT THE OWNER HAS SAID AND DONE SO FAR (this is their voice: the choices you write must sound like this person, and the ones they typed themselves count most)\n${said.join("\n")}`
    : "";
}

function soFar(c: CuckState, skipLast = false): string {
  const log = skipLast ? c.log.slice(0, -1) : c.log;
  if (!log.length) return "";
  const lines = log.map((l, i) => {
    const full = i >= log.length - 2;
    return full
      ? `### Week ${l.week}, ${l.title}\n${l.scene.slice(0, 2400)}\nTHE OWNER: ${l.chose}\n${l.text.slice(0, 2400)}`
      : `· Week ${l.week}, ${l.title}: the owner: "${l.chose}". ${l.facts.join(" ")} ${l.text.slice(0, 300).replace(/\n+/g, " ")}…`;
  });
  return `## THE STORY SO FAR (build on it; people remember; never repeat a situation, a line or a beat from it)\n${lines.join("\n\n")}`;
}

/** What this chapter is for. Direction, not prose: the model writes all of it. */
function direction(s: SaveState, c: CuckState, must: Move[]): string {
  const p = herOf(s)!;
  switch (c.phase) {
    case "choose": return `This is the first chapter. The owner tells ${p.name} what they want: another man, chosen by the owner, to have her while the owner watches or waits, and she tells the owner about it after. Write her hearing it and answering out of who she is. The owner has three men in mind: invent THREE, each a different kind of man who would want her and would plausibly be in this arcology, each a real person with a name, an age, who he is and how he talks. Offer each as a "pick" choice with the man filled in, plus a "never" choice.`;
    case "tease": return `He hasn't had her yet. This is chapter ${c.in_phase + 1} before he does. Each chapter goes a step further than the last: meeting him, being looked at, touched, kissed, his hands on her with the owner there, her wanting it. No sex happens in the scene itself.${must.some((m) => m.id === "first") ? " This chapter builds to the night he takes her: the \"first\" choice must be there." : ""}`;
    case "affair": return `He's having her now, on her own nights between chapters. This is chapter ${c.in_phase + 1} of the affair. Each chapter is a new turn of the screw, picked to fit how far it has gone and what hasn't happened yet in the story so far: she comes home from him, she compares, he calls while he's in her, she says his name in the owner's bed, he takes her in the owner's own bed, he wants to breed her, she starts dressing for him, she stops needing the owner. Never repeat a situation.`;
    case "offer": return `This is the LAST chapter. He wants her for good. He offers ¤${offerPrice(s, p).toLocaleString()} for her papers, or to keep her as his without them. Write the scene where it gets decided, with her in it showing where she stands. The choices are the endings.`;
  }
}

const CHAPTER_SYSTEM = `You write a netorare (NTR, cuckold) story inside Free Cities, an adult text game about owning an arcology where slavery is legal and ordinary. The player is the owner, written as "you". They have chosen to give one of their slave women to another man, a little more every week, and watch her go. This is the owner's own taste and they asked for it.

Write it the way the best NTR stories are written: slow, specific and humiliating. The sting is in the small things: the comparisons, her eyes going to him and not coming back, what she says and what she stops saying, the owner noticing every one. He's confident and enjoys it. She still speaks to the owner the way THE POWER BETWEEN YOU on her card says: unless it gives her latitude, the humiliation comes through what she does, what she tells and what she stops saying, said by title and as a slave ("He's bigger than you, Master. I'm sorry."), never by her dropping her place. She changes a little each chapter, in her own way, out of her own personality: her voice, her past, her body, what she's into, her memories. Nothing she says could be said by a different woman. Explicit, in plain crude words, when there's sex.

You write the chapter and the owner's choices. THE CHOICES ARE THE OWNER SPEAKING OR ACTING: each label is the actual thing the owner says out loud or does, in the owner's own voice and character, the way this particular person would say it (their self-description, their body, how they've answered so far). Not menu text, not generic, not what any owner would say. 4 to 25 words each. Each choice is tagged with one move from MOVES THAT CAN BE OFFERED; the move is what will happen, so the words must match it. Offer three to five choices, every move under MUST BE OFFERED among them, and the rest whichever moves fit the scene best (moves can repeat with different words).

Rules: second person, present tense, four to seven paragraphs. Stop at the moment of choice; never decide what the owner does or feels at the end. Never invent another named person apart from the men in a "pick". Continue THE STORY SO FAR.

${HOUSE_STYLE}

Output ONE strict JSON object and nothing else:
{"title":"2-6 words","scene":"the chapter","choices":[{"label":"what the owner says or does","move":"move id","man":{"name":"First Last","age":30,"who":"who he is, one sentence","manner":"how he looks, moves and talks, one or two sentences"}}]}
("man" only on "pick" choices.)`;

function context(s: SaveState, query: string): string[] {
  const c = s.cuckold!;
  const p = herOf(s)!;
  return [
    `## HER\n${personCard(s, p, query)}`,
    himBrief(s, c),
    `## WHY SHE'S DOING IT\n${MOTIVE[c.motive]}`,
    `## HOW FAR IT HAS GONE\n${howFar(s, c)}`,
  ].filter(Boolean);
}

function movesList(may: Move[], must: Move[]): string {
  return `## MOVES THAT CAN BE OFFERED (id: what it does)\n${may.map((m) => `· ${m.id}: ${m.does}`).join("\n")}\n## MUST BE OFFERED\n${must.map((m) => m.id).join(", ") || "nothing in particular"}`;
}

/** Write the chapter waiting. Mutates `s.cuckold.chapter` on success. */
export async function writeChapter(s: SaveState, signal?: AbortSignal): Promise<{ ok: boolean; error?: string }> {
  const c = s.cuckold;
  if (!c || !ready(s)) return { ok: false };
  if (c.chapter) return { ok: true };
  if (!canWrite(s)) return { ok: false, error: "needs a model set up in Settings" };
  const { may, must } = movesNow(s);
  let note = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await call({
      system: CHAPTER_SYSTEM,
      user: [
        ...context(s, c.bull ? `${c.bull.short} the owner` : "another man"),
        ownerVoice(c),
        soFar(c),
        `## THIS CHAPTER\n${direction(s, c, must)}`,
        movesList(may, must),
        note,
        stockLine(s),
        PLAIN_RULES,
        REGISTER_TAIL,
      ].filter(Boolean).join("\n\n"),
      model: s.models.narrator_model,
      fallback: s.models.fallback_model,
      urgent: true,
      json: true,
      maxTokens: 3200,
      temperature: 0.95,
      signal,
    });
    if (!res.ok) return { ok: false, error: res.error ?? "the model didn't answer" };
    const out = parseJson<{ title?: string; scene?: string; choices?: { label?: string; move?: string; man?: Partial<Candidate> }[] }>(res.text);
    const scene = out?.scene ? coarsen(String(out.scene)).trim() : "";
    const choices: Choice[] = (out?.choices ?? [])
      .filter((x) => x?.label && x.move)
      .map((x) => ({ label: coarsen(String(x.label)).trim().slice(0, 240), move: String(x.move), man: x.man?.name ? { name: String(x.man.name), age: Number(x.man.age) || 30, who: String(x.man.who ?? ""), manner: String(x.man.manner ?? "") } : undefined }))
      .filter((x) => allowed(s, x))
      .slice(0, 6);
    const missing = must.filter((m) => !choices.some((x) => x.move === m.id));
    const enough = scene.length >= 300 && choices.length >= 2 && (c.phase !== "choose" || choices.filter((x) => x.move === "pick").length >= 2);
    if (enough && (!missing.length || attempt === 1)) {
      // The story may have moved while the model was writing.
      if (s.cuckold !== c || c.ended || c.chapter || !ready(s)) return { ok: false };
      c.chapter = { title: String(out?.title ?? "").slice(0, 60) || `Week ${s.arcology.week}`, scene: scene.slice(0, 9000), choices, model: res.model, week: s.arcology.week };
      noteStock(s, scene);
      return { ok: true };
    }
    if (signal?.aborted) return { ok: false };
    note = `## LAST TIME YOU GOT THIS WRONG\n${!enough ? "The chapter or its choices came back too short or with moves that aren't allowed. Write the whole chapter and at least three allowed choices." : `You left out these moves, which must be offered: ${missing.map((m) => m.id).join(", ")}.`}`;
  }
  return { ok: false, error: "the model's chapter didn't hold together" };
}

const READ_SYSTEM = `You read what the owner typed in answer to a chapter of a cuckold story in Free Cities, an adult game, and decide which ONE move from the list it amounts to. Pick the move whose effect is closest to what they said or did. If they named or described a man of their own in a "pick", fill in "man" (invent the details they didn't give). Output JSON only: {"move":"move id","man":{"name":"First Last","age":30,"who":"...","manner":"..."}}`;

/** Answer the chapter in your own words. Returns the log entry, still to be written. */
export async function answerOwn(s: SaveState, typed: string, signal?: AbortSignal): Promise<{ ok: boolean; error?: string }> {
  const c = s.cuckold;
  const ch = c?.chapter;
  const text = typed.trim().slice(0, 600);
  if (!c || !ch || !text) return { ok: false };
  if (!canWrite(s)) return { ok: false, error: "needs a model set up in Settings" };
  const { may } = movesNow(s);
  const res = await call({
    system: READ_SYSTEM,
    user: [
      `## THE CHAPTER\n${ch.scene.slice(-2500)}`,
      c.phase === "choose" ? `## THE MEN ON OFFER\n${ch.choices.filter((x) => x.man).map((x) => `· ${x.man!.name}, ${x.man!.age}: ${x.man!.who}`).join("\n")}` : "",
      `## WHAT THE OWNER TYPED\n${text}`,
      `## MOVES (id: what it does)\n${may.map((m) => `· ${m.id}: ${m.does}`).join("\n")}`,
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
      urgent: true,
    json: true,
    maxTokens: 300,
    temperature: 0.2,
    signal,
  });
  if (!res.ok) return { ok: false, error: res.error ?? "the model didn't answer" };
  const out = parseJson<{ move?: string; man?: Partial<Candidate> }>(res.text);
  let man: Candidate | undefined = out?.man?.name ? { name: String(out.man.name), age: Number(out.man.age) || 30, who: String(out.man.who ?? ""), manner: String(out.man.manner ?? "") } : undefined;
  // A man from the chapter, named in what you typed.
  if (out?.move === "pick" && man) man = ch.choices.find((x) => x.man && x.man.name.toLowerCase() === man!.name.toLowerCase())?.man ?? man;
  const choice: Choice = { label: text, move: String(out?.move ?? ""), man, own: true };
  if (s.cuckold !== c || c.chapter !== ch) return { ok: false };
  if (!allowed(s, choice)) return { ok: false, error: "couldn't tell what that does here; try saying it another way" };
  return answer(s, choice) ? { ok: true } : { ok: false, error: "that can't happen right now" };
}

const OUTCOME_SYSTEM = `You write what happens next in a netorare (NTR, cuckold) story inside Free Cities, an adult text game about owning an arcology. The owner ("you") answered the chapter. WHAT THE GAME DECIDED is true and final: keep every fact in it (who did what, what happened to her body, any money, any pregnancy, how it ends) and add nothing that contradicts it. If the owner typed their answer in their own words, play out exactly what they said and did, in their words, and the facts are what came of it.

Carry on straight from the chapter: same room, same people, same voices, same man. Her lines come out of her card, why she's doing it and how far it has gone, and nobody else could say them. Two to five paragraphs, second person, present tense. Explicit in plain crude words when there's sex. If the story ends here, land it properly. Don't end on a question to the owner.

${HOUSE_STYLE}`;

/** Write what came of the last answer. Returns the text, or "" if it couldn't be written. */
export async function writeOutcome(s: SaveState, signal?: AbortSignal): Promise<{ ok: boolean; error?: string }> {
  const c = s.cuckold;
  const last = c?.log.at(-1);
  const p = herOf(s);
  if (!c || !last || !p || last.text) return { ok: !!last?.text };
  if (!canWrite(s)) return { ok: false, error: "needs a model set up in Settings" };
  const res = await call({
    system: OUTCOME_SYSTEM,
    user: [
      ...context(s, `${c.bull?.short ?? ""} ${last.chose}`),
      soFar(c, true),
      `## THE CHAPTER: ${last.title}\n${last.scene}`,
      `## THE OWNER ${last.own ? "(in their own words)" : ""}\n${last.chose}`,
      `## WHAT THE GAME DECIDED\n${last.facts.join("\n") || "Nothing beyond what the owner said and did."}${c.ended ? `\nTHE STORY ENDS HERE: ${c.ended.ending.replace("_", " ")}.` : ""}${hasWomb(p) && pregnantByHim(s, p) && !last.facts.some((f) => /pregnan|conceiv/.test(f)) ? "\n(She is carrying his child.)" : ""}`,
      stockLine(s),
      PLAIN_RULES,
      REGISTER_TAIL,
    ].filter(Boolean).join("\n\n"),
    model: s.models.narrator_model,
    fallback: s.models.fallback_model,
      urgent: true,
    maxTokens: 2000,
    temperature: 0.9,
    signal,
  });
  if (!res.ok) return { ok: false, error: res.error ?? "the model didn't answer" };
  const text = coarsen(res.text).trim();
  if (text.length < 120) return { ok: false, error: "the model's answer came back empty" };
  if (s.cuckold?.log.at(-1) !== last) return { ok: false };
  last.text = text.slice(0, 9000);
  noteStock(s, text);
  return { ok: true };
}
