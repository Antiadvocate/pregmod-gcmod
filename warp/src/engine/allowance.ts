/**
 * HER OWN MONEY.
 *
 * An owner can put a woman on an allowance: so much a week, paid out of the arcology's cash into a
 * purse that is hers to spend however she likes. The game pays it at the end of every week, she
 * spends some of it on her own, and the scenes know what she has, so she can pay for a dress
 * herself, and the bookkeeper takes what she spends in a scene out of her purse.
 *
 * Saying it is enough: "I'll give you 100k a week" in a scene sets it, the same way "call me Rabi"
 * sets what she calls you. Missing a payment is a broken promise, and she takes it as one.
 */
import type { Person, SaveState } from "./types";
import { applyTreatment } from "./obedience";
import { remember } from "./memory";
import { rng } from "./rng";

export const allowanceOf = (p: Person): number => Math.max(0, Math.round(p.allowance ?? 0));
export const purseOf = (p: Person): number => Math.max(0, Math.round(p.purse ?? 0));

/** Stopping it keeps a 0 on file, so an old promise in her memory doesn't start it again on load. */
export function setAllowance(p: Person, amount: number): void {
  p.allowance = Math.max(0, Math.round(amount));
}

/** Saves from before there was an allowance: the owner promised one in a scene and she remembers
 *  it ("the owner is paying her 100k a week"), but no money ever moved. Read it once, on load, and
 *  pay her the weeks she was owed since. */
export function allowanceFromMemory(s: SaveState, p: Person): void {
  if (!s.arcology) return;
  if (p.allowance !== undefined) return;
  const facts = s.memory[p.id]?.facts ?? [];
  for (const f of [...facts].reverse()) {
    if (!/\b(pay(s|ing)? her|payment to her|stipend|allowance|pocket money)\b/i.test(f.text)) continue;
    const weekly = f.text.match(/([¤\w.,]+(?:\s+(?:k|grand|thousand|m|million))?)\s*(?:a|per|each|every)\s+week/i);
    const amount = weekly ? moneyIn(weekly[1]) : null;
    if (!amount || amount < 10) continue;
    p.allowance = amount;
    const since = facts.find((x) => x.text === f.text)?.week ?? s.arcology.week;
    const owed = Math.min(s.arcology.cash, amount * Math.max(0, s.arcology.week - since));
    if (owed > 0) { s.arcology.cash -= owed; p.purse = purseOf(p) + owed; }
    return;
  }
}

/** "100k", "100,000", "¤1.5m", "fifty thousand" → a number, or null. */
export function moneyIn(text: string): number | null {
  const words: Record<string, number> = { ten: 10, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, "a hundred": 100, "one hundred": 100, "two hundred": 200, "five hundred": 500 };
  const m = text.match(/¤?\s*(\d[\d,]*(?:\.\d+)?)\s*(k|grand|thousand|m|mil|million)?\b/i);
  const w = text.match(/\b(a hundred|one hundred|two hundred|five hundred|ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\s+(thousand|grand|k)\b/i);
  const scale = (u?: string) => (!u ? 1 : /^(k|grand|thousand)$/i.test(u) ? 1000 : 1_000_000);
  if (m) return Math.round(parseFloat(m[1].replace(/,/g, "")) * scale(m[2]));
  if (w) return words[w[1].toLowerCase()] * scale(w[2]);
  return null;
}

/** What the owner just said about paying her, if anything: an amount a week, or a stop. */
export function readAllowance(text: string): { amount: number } | null {
  const t = text.toLowerCase();
  if (/\b(stop|cut off|end|cancel)\w*\b[^.?!]{0,30}\b(allowance|stipend|pay(ing|ments?)?)\b/.test(t)) return { amount: 0 };
  const paid = /\b(allowance|stipend|salary|pocket money|pay you|give you|paying you|giving you|transfer|put in your account|yours to spend)\b/.test(t);
  const weekly = text.match(/([¤\w.,]+(?:\s+(?:k|grand|thousand|m|million))?)\s*(?:a|per|each|every)\s+week|weekly\s+(?:allowance|stipend)?\s*(?:of\s+)?([¤\w.,]+(?:\s+(?:k|grand|thousand|m|million))?)/i);
  if (!paid || !weekly) return null;
  const amount = moneyIn(weekly[1] ?? weekly[2] ?? "");
  return amount && amount >= 10 ? { amount } : null;
}

/** From a scene: set her allowance when the owner names one. Only for a single woman, so "I'll
 *  pay you" can't land on the wrong person. Returns a note for the report, or "". */
export function captureAllowance(s: SaveState, text: string, to: Person[]): string {
  if (to.length !== 1) return "";
  const got = readAllowance(text);
  if (!got) return "";
  const p = to[0];
  if (allowanceOf(p) === got.amount) return "";
  setAllowance(p, got.amount);
  return got.amount ? `${p.name}'s allowance is now ¤${got.amount.toLocaleString()} a week, hers to spend.` : `${p.name}'s allowance is stopped.`;
}

const BUYS = [
  "silk from the shop on the concourse", "a dress she had made to measure", "shoes she'd been looking at for weeks", "jewellery",
  "perfume and lavender oil", "a day at the spa", "books and music", "something for her room", "lingerie", "a gift she won't say who it's for",
];
const FINDOM = new Set(["findom", "tribute junkie"]);
export const likesBeingPaid = (p: Person): boolean =>
  p.persona.fetishes.some((f) => FINDOM.has(f.name) && f.strength >= 30) || FINDOM.has(p.persona.paraphilia ?? "") || /findom|tribute|being paid/i.test(p.persona.behavior?.quirk ?? "");

/** Weekly: pay her, and let her spend some of it. Returns what to put in the report, and the cash
 *  that left the arcology (for the ledger). */
export function tickAllowance(s: SaveState, p: Person): { paid: number; lines: { text: string; tone: "good" | "neutral" | "bad" }[] } {
  const amount = allowanceOf(p);
  const lines: { text: string; tone: "good" | "neutral" | "bad" }[] = [];
  if (!amount || p.status !== "owned" && p.status !== "indentured") return { paid: 0, lines };
  const week = s.arcology.week;
  if (s.arcology.cash < amount) {
    applyTreatment(p, { kind: "promise_broken", size: likesBeingPaid(p) ? 6 : 3, why: "her allowance didn't come" }, week);
    lines.push({ text: `You couldn't cover ${p.name}'s allowance this week (¤${amount.toLocaleString()}), and she noticed.`, tone: "bad" });
    return { paid: 0, lines };
  }
  p.purse = purseOf(p) + amount;
  if (likesBeingPaid(p)) applyTreatment(p, { kind: "recognition", size: 2, why: "her allowance came, every coin of it" }, week);
  // She spends some of it, more the more she has, and a woman who gets off on it more again.
  const r = rng(`purse:${p.id}:${week}`);
  if (r.chance(0.6)) {
    const share = (likesBeingPaid(p) ? 0.25 : 0.12) + r() * 0.2;
    const spent = Math.round((purseOf(p) * share) / 100) * 100;
    if (spent >= 100) {
      const what = r.pick(BUYS);
      p.purse = purseOf(p) - spent;
      lines.push({ text: `${p.name} spent ¤${spent.toLocaleString()} of her allowance on ${what}${likesBeingPaid(p) ? ", and made sure you saw the receipt" : ""}.`, tone: "neutral" });
      const mem = s.memory[p.id];
      if (mem) remember(mem, { content: `I spent ¤${spent.toLocaleString()} of the owner's money on ${what}`, week, importance: likesBeingPaid(p) ? 5 : 3, charge: "bright" });
    }
  }
  return { paid: amount, lines };
}

/** In a scene, she spent this much of it. Never below nothing. */
export function spendPurse(p: Person, amount: number): number {
  const n = Math.min(purseOf(p), Math.max(0, Math.round(amount)));
  p.purse = purseOf(p) - n;
  return n;
}

/** For her card. */
export function purseLine(p: Person): string {
  const a = allowanceOf(p), have = purseOf(p);
  if (!a && !have) return "";
  const paid = a ? `The owner pays her an allowance of ¤${a.toLocaleString()} a week, hers to spend however she likes, and nobody can tell her what to spend it on.` : "She has money of her own the owner gave her.";
  const findom = likesBeingPaid(p) ? " Being paid is her kink, not just her income. She names numbers, asks for more, keeps count of every coin, and the owner paying because she said so is what gets her wet, in bed and out of it." : "";
  return `HER MONEY. ${paid} She has about ¤${have.toLocaleString()} of it right now and pays for her own things out of it, like clothes, gifts and treats.${findom}`;
}
