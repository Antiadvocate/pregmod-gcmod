/**
 * ARCS THAT READ WHAT YOU DID — story that starts because of a scene you ended.
 *
 * "Talk of the arcology" starts when something you did in public gets around. "The Collar" starts
 * when you gave yourself to one of your slaves, whether anyone saw or not. Both read the deed log
 * (engine/deeds.ts) and quote it, so the scene you played is what they're about.
 */
import type { ArcDef, Ctx } from "../../engine/story";
import { ownedAdults } from "../../engine/story";
import { deedsOf, type Deed } from "../../engine/deeds";
import { romanceOf, shiftDominion } from "../../engine/romance";
import { reversalOf } from "../../engine/reversal";
import { read } from "../../engine/obedience";
import { clamp } from "../../engine/psyche";

const latestPublic = (s: import("../../engine/types").SaveState): Deed | undefined =>
  [...deedsOf(s)].reverse().find((d) => d.public && s.arcology.week - d.week <= 3 && d.id !== s.story?.flags["talk_deed"]);
const deedOf = (c: Ctx): Deed | undefined => deedsOf(c.s).find((d) => d.id === c.flag("talk_deed"));
const quote = (d?: Deed) => (d ? d.summary.replace(/^You /, "the owner ").replace(/\.$/, "") : "what you did");
const kind = (d?: Deed) => {
  const t = d?.tags ?? [];
  if (t.includes("owner_enslaved") || t.includes("owner_submitted")) return "submission";
  if (t.some((x) => ["cruelty", "humiliated_her", "punished", "threatened_sale"].includes(x))) return "cruelty";
  if (t.some((x) => ["freed_her", "married_her", "mercy", "gift", "tenderness", "feet_worship"].includes(x))) return "kindness";
  return "other";
};
const doc = (c: Ctx, id: string, n: number) => { const st = c.s.arcology.doctrines[id]; if (st) { st.adoption = clamp(st.adoption + n, 0, 100); c.out.push(`${id.replace(/_/g, " ")} ${n > 0 ? "gains" : "loses"} ground`); } };

const talk: ArcDef = {
  id: "w_talk", title: "Talk of the Arcology", kind: "world", repeat: 6,
  when: (s) => !!latestPublic(s),
  subject: (s) => { const d = latestPublic(s); if (s.story && d) s.story.flags["talk_deed"] = d.id; return d?.person ? s.people[d.person] : undefined; },
  start: "talk",
  beats: {
    talk: {
      title: "Everyone's talking about it",
      text: (c) => {
        const d = deedOf(c);
        const k = kind(d);
        return `It's all over ${c.arcology}: ${quote(d)}. People are repeating it in the bars on the promenade, and a version of it with a lot of details added has already reached the arcology across the strait.

${k === "submission" ? `The reaction is split down the middle. Some citizens think it's the most shocking thing an owner has ever done in the Free Cities. Others are fascinated, and a few have started asking their own slaves questions they've never asked before. The Owners' Association has sent a short, cold note asking whether the rumors are true.`
  : k === "cruelty" ? `Plenty of citizens approve; it's what slaves are for, and they like an owner who shows it. But ${c.sn === "she" ? "the slave" : c.sn} is well known on the promenade, and some people who used to smile at her now look at you differently.`
  : k === "kindness" ? `Most citizens think it's touching. Some of the harder ones think you've gone soft, and say so in the bars, and one of them wants to know if you'll be freeing the whole household next.`
  : `Nobody agrees on what it means, but everyone has an opinion.`}

${c.subj ? `${c.sn} has heard what people are saying, and she's watching to see what you do about it.` : ""}`;
      },
      options: [
        { id: "own", label: "Own it, publicly",
          run: (c) => {
            const d = deedOf(c); const k = kind(d);
            if (k === "submission") { const rev = reversalOf(c.s); rev.deference = clamp(rev.deference + 10, 0, 100); rev.association = clamp(rev.association - 10, -100, 100); c.rep(-300); doc(c, "supplication", 8); if (c.subj) shiftDominion(c.s, c.subj, 10, "you told the whole arcology it was true"); c.treat(c.subj, "recognition", 6, "you told the arcology it was true");
              return { text: `You say it on the arcology feed: yes, it happened, and you meant it. ${c.subj ? `${c.sn} watches it on the screen in the slave quarters with the others around her, and doesn't say anything for a long time.` : ""} The Association doesn't send another note. It doesn't need to.`, end: "you owned it in public" }; }
            if (k === "cruelty") { c.rep(300); doc(c, "degradationist", 6); doc(c, "paternalist", -6); c.household("coercion", 2, "the owner boasted about it in public"); return { text: `You tell anyone who asks that she got what she deserved and the rest of them will too. The harder citizens cheer. Your slaves hear it too.`, end: "you boasted about it" }; }
            c.rep(200); doc(c, "paternalist", 6); c.hope(3); c.treat(c.subj, "recognition", 5, "you stood by it in public");
            return { text: `You stand by it, in public. The citizens who thought you'd gone soft think so even more. Your household takes it the other way.`, end: "you stood by it" };
          } },
        { id: "deny", label: "Deny it ever happened",
          run: (c) => { c.standing(-1); c.treat(c.subj, "promise_broken", 6, "you denied it in public"); if (c.subj && kind(deedOf(c)) === "submission") shiftDominion(c.s, c.subj, -12, "you denied it in public");
            return { text: `You say it's a rumor and that's all it is. Most people don't believe you. ${c.subj ? `${c.sn} knows exactly what happened, and now she knows you'll lie about it.` : ""}`, end: "you denied it" }; } },
        { id: "source", label: "Find whoever spread it and punish them",
          run: (c) => { const h = ownedAdults(c.s).filter((p) => p.id !== c.subj?.id).sort((a, b) => b.bond.resentment - a.bond.resentment)[0];
            if (h) c.treat(h, "cruelty", 6, "punished for spreading rumors about the owner"); c.security(2); c.standing(-1);
            return { text: `${h ? `It came from ${h.name}, who told a citizen at the market. She spends a week in the cellblock for it.` : "It came from a citizen who was at the party. Your security chief has a word with him."} Nobody repeats it where your people can hear any more. They repeat it everywhere else.`, end: "you punished the gossip" }; } },
        { id: "nothing", label: "Say nothing and let them talk",
          run: () => ({ text: `You don't say anything. The story gets bigger for a week and then something else happens and people move on. Mostly.`, end: "you let them talk" }) },
      ],
    },
  },
};

const collar: ArcDef = {
  id: "w_collar", title: "The Collar", kind: "world",
  when: (s) => !!s.player.owned_by && !!s.people[s.player.owned_by] && Number(s.story?.flags["deed_owner_enslaved"] ?? 0) > 0,
  subject: (s) => (s.player.owned_by ? s.people[s.player.owned_by] : undefined),
  delay: 2,
  start: "household",
  beats: {
    household: {
      title: (c) => `The household finds out about ${c.sn}`,
      text: (c) => {
        const others = ownedAdults(c.s).filter((p) => p.id !== c.subj?.id);
        const jealous = others.sort((a, b) => read(b).devotion - read(a).devotion)[0];
        return `The household knows. Nobody told them, but ${c.sn} has been sleeping in the master suite and giving orders at breakfast, and the key on the chain around her neck isn't hard to understand.

${jealous ? `${jealous.name} takes it hardest. She comes to you when ${c.sn} isn't there, with her arms folded, and asks you straight out: "Is it true? Does she own you now? Do we belong to her?"` : "Nobody says anything to your face."}`;
      },
      options: [
        { id: "yes", label: "Tell them yes: she owns you, and so they answer to her",
          run: (c) => { if (c.subj) { const rom = romanceOf(c.subj); rom.dominion = Math.max(rom.dominion, 85); } c.household("coercion", 2, "told they answer to her now"); c.set("collar_known", true);
            return { text: `You tell the household at dinner, with ${c.sn} sitting at the head of the table where you used to sit. Nobody eats much. The next morning they bring their questions to her, and she answers them.`, next: "test", after: 3 }; } },
        { id: "private", label: "Tell them it's between you and her, and nothing changes for them",
          run: (c) => { c.hope(2); if (c.subj) shiftDominion(c.s, c.subj, -5, "you kept it private from the household");
            return { text: `You tell them it's private. They're still your slaves, and she's still one of them in front of them. ${c.sn} hears about it that night and says nothing, which is worse than if she'd said something.`, next: "test", after: 3 }; } },
        { id: "back", label: "Take it back",
          run: (c) => { if (!c.subj) return { text: "" }; const rom = romanceOf(c.subj); rom.standing = "favourite"; rom.dominion = Math.min(rom.dominion, -20); c.s.player.owned_by = undefined; c.treat(c.subj, "promise_broken", 10, "you took back the collar you gave her");
            return { text: `You take the key off ${c.sn}'s neck yourself, at breakfast, with the others watching. She lets you. She doesn't look at you afterwards, and she doesn't look at anyone else either.`, end: "you took the collar back" }; } },
      ],
    },
    test: {
      title: (c) => `${c.sn} gives you an order`,
      text: (c) => {
        const p = c.subj;
        const cold = (p?.persona.conscience ?? 0.5) < 0.35;
        return `${c.sn} calls you to her in front of ${c.flag("collar_known") ? "the whole household" : "two of the house slaves"}. She's sitting in your chair in the atrium.

${cold ? `"Kneel," she says. "And take my shoes off. With your teeth." The slaves behind her are very still.` : `"Kneel," she says, not unkindly. "I want them to see it. Just once. Then you can get up."`}`;
      },
      options: [
        { id: "kneel", label: "Kneel and do it",
          run: (c) => { if (c.subj) shiftDominion(c.s, c.subj, 12, "you knelt in front of the household"); const rev = reversalOf(c.s); rev.deference = clamp(rev.deference + 8, 0, 100); c.household("recognition", 1, "watched the owner kneel to her");
            return { text: `You kneel on the atrium floor and do it. It takes a while. When you're done she puts her bare foot on your shoulder and leaves it there, and looks at the others, and nobody in the household ever talks about you the same way again.`, end: "you knelt to her in front of the household" }; } },
        { id: "refuse", label: "Refuse",
          run: (c) => { if (c.subj) { shiftDominion(c.s, c.subj, -20, "you refused her in front of the household"); c.treat(c.subj, "promise_broken", 7, "you refused her in front of the household"); }
            return { text: `You tell her no. She looks at you for a long moment, and then gets up out of your chair and walks out. The key is still around her neck. Neither of you knows what it means now.`, end: "you refused her in front of the household" }; } },
        { id: "alone", label: "Ask her to do this in private instead",
          run: (c) => { if (c.subj) shiftDominion(c.s, c.subj, 4, "she let you keep it private"); c.treat(c.subj, "recognition", 3, "you asked her for privacy and she gave it");
            return { text: `You ask her quietly. She thinks about it, and then sends the others out. What happens after that happens with nobody else watching.`, end: "she let you keep it private" }; } },
      ],
    },
  },
};

export const DEED_ARCS: ArcDef[] = [talk, collar];
