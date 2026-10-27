/**
 * ARCS ABOUT THE OWNER — stories that start because of how you live, not what the world did.
 *
 * "The Only Ones" starts when you've kept one or two women for weeks: they feel what it makes them,
 * it leaks out, the city and the other arcologies talk, and one of them falls for you in earnest.
 * "The Measure of the Owner" starts when what the women you've had say about your cock has got
 * around. "Married" follows a marriage you wrote the terms of yourself (engine/marriage): the city
 * the week after, the other powers a month on, the first test of the terms, and where it stands
 * after.
 *
 * Every one of them has choices only a skilled owner can take: charm, fear, reading people, and the
 * rest. They're written as plain text with skills in the `need`, so the Story screen shows what
 * it would take even when you haven't got it.
 */
import type { ArcDef, Ctx } from "../../engine/story";
import { closest } from "../../engine/story";
import { read } from "../../engine/obedience";
import { clamp } from "../../engine/psyche";
import { fewOf, keepingFew, theFew } from "../../engine/fewslaves";
import { endowment, enlarge, enlargeCost, menace, talkOfIt, whoHasSeen } from "../../engine/endowment";
import { dickWord } from "../../engine/genitals";
import { shiftDominion, romanceOf } from "../../engine/romance";
import { divorce, marriageOf } from "../../engine/marriage";
import { pushNorm } from "../../engine/culture";
import { setLatitude } from "../../engine/self";

const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;
const cash = (n: number) => (c: Ctx) => (c.s.arcology.cash >= n ? null : `needs ${money(n)}`);
const skill = (id: string, n: number) => (c: Ctx) => (c.skill(id) >= n ? null : `needs ${id} ${n}`);
const either = (...xs: ((c: Ctx) => string | null)[]) => (c: Ctx) => (xs.some((x) => !x(c)) ? null : xs.map((x) => x(c)).join(", or "));
const neighbours = (c: Ctx, by: number) => {
  for (const n of c.s.arcology.neighbours) n.attitude = clamp(n.attitude + by, -100, 100);
  c.out.push(`the other arcologies ${by >= 0 ? "warm to you" : "cool on you"}`);
};
const power = (c: Ctx, id: string, by: number) => { const f = fewOf(c.s); f.power[id] = clamp((f.power[id] ?? 0) + by, 0, 100); };

/* ── the only ones ─────────────────────────────────────────────────────────────────────────── */

const other = (c: Ctx) => theFew(c.s).find((p) => p.id !== c.subj?.id);
const pair = (c: Ctx) => { const o = other(c); return o ? `${c.sn} and ${o.name}` : c.sn; };
const alone = (c: Ctx) => theFew(c.s).length === 1;

const few: ArcDef = {
  id: "w_few", title: "The Only Ones", kind: "world",
  when: (s) => keepingFew(s) && fewOf(s).weeks >= 4,
  subject: (s) => closest(s),
  start: "noticed",
  beats: {
    noticed: {
      title: (c) => (alone(c) ? "The only one" : "The only two"),
      text: (c) => `${c.sn} brings you your coffee in the morning, the way she does every morning now, and doesn't leave. She stands by the window a while. Then she asks, carefully, why you haven't bought anyone else.

${alone(c) ? `She's the only woman you keep. Every other owner in the Free Cities has dozens. She's worked out what that means, or thinks she has: every meal, every bed, every time you want something, it's her.` : `There are two of them, ${pair(c)}, in a building made for a hundred. They've talked about it at night. She's worked out what that means, or thinks she has.`}

She isn't complaining. You can see it in how she's standing: straighter than a slave stands. Something of yours has settled on her, and she likes the weight of it.`,
      options: [
        { id: "enough", label: (c) => `Tell her ${alone(c) ? "she's" : "they're"} all you need`,
          run: (c) => {
            c.treat(c.subj, "promise_kept", 6, alone(c) ? "the owner told her she was all they needed" : "the owner told them they were all they needed");
            if (c.subj) power(c, c.subj.id, 15);
            const o = other(c); if (o) { c.treat(o, "recognition", 4, "the owner said the two of them were enough"); power(c, o.id, 10); }
            c.set("few_enough", true);
            return { text: `You tell her. She doesn't say anything for a moment. Then she puts her cup down, comes over and kneels by your chair, and puts her head against your knee, and stays there until your coffee's cold.

By lunchtime ${alone(c) ? "the staff" : o_(c)} ${alone(c) ? "can tell something's changed" : "knows what you said"}.`, next: "leak", after: 3 };
          } },
        { id: "more", label: "Tell her more are coming",
          run: (c) => {
            if (c.subj) { c.subj.bond.hope = clamp(c.subj.bond.hope - 6, 0, 100); power(c, c.subj.id, -20); }
            c.set("few_more", true);
            return { text: `You tell her you'll be buying when the market's right. She says "Of course, ${c.title}," and takes the cup, and goes. Whatever had settled on her goes with her down the stairs.`, next: "leak", after: 4 };
          } },
        { id: "read", label: "Watch her, and work out what she actually wants", need: skill("insight", 30),
          run: (c) => {
            c.set("few_read", true);
            if (c.subj) power(c, c.subj.id, 8);
            return { text: `You let the silence go on and watch her. She isn't asking whether more are coming. She's asking you to say they aren't. She wants to stay the only one, and she's frightened of how much she wants it, and she's hoping you won't notice that she's started giving the kitchen staff orders.

You don't say anything. She takes that as an answer, and you can see which one.`, next: "leak", after: 3 };
          } },
        { id: "charm", label: "Make her laugh, and leave it there", need: skill("charisma", 25),
          run: (c) => {
            c.treat(c.subj, "kindness", 4, "the owner made her laugh");
            return { text: `You tell her that you couldn't afford a second one of her, and she laughs, properly, the first time you've heard that from her. She leaves smiling. The question stays asked, but she isn't afraid of the answer any more.`, next: "leak", after: 3 };
          } },
      ],
    },
    leak: {
      title: (c) => `${c.sn}, in your name`,
      wait: (c) => (fewOf(c.s).power[c.subj?.id ?? ""] ?? 0) >= 35 || !keepingFew(c.s),
      text: (c) => keepingFew(c.s)
        ? `Your security chief catches you in the lift. Yesterday a trader came to the penthouse floor with a catalogue and a contract, sent up by the front desk. ${c.sn} met him at the door.

She told him you weren't buying. When he said he'd wait, she told him the guards would see him down, and they did, without calling to check with you. The trader has filed a complaint with your office. The guards want to know if they did wrong.

"She sounded like you," your security chief says. He isn't sure if it's a compliment.`
        : `There are other women in the house now. ${c.sn} hasn't said anything about it. She doesn't need to: she's stopped giving the staff orders, and the staff have noticed.`,
      options: [
        { id: "back", label: "Back her, and tell the guards to listen to her", show: (c) => keepingFew(c.s),
          run: (c) => {
            if (c.subj) { power(c, c.subj.id, 20); shiftDominion(c.s, c.subj, 8, "you told the guards to listen to her"); }
            c.treat(c.subj, "recognition", 7, "the owner backed her in front of the guards");
            c.security(-2);
            return { text: `You tell the guards they did right and that next time they needn't check. The trader gets a polite letter. ${c.sn} hears about it before you're back upstairs, and when you come in she's sitting in your chair. She gets up. Slowly.`, next: "news", after: 3 };
          } },
        { id: "place", label: "Remind her whose door it is", show: (c) => keepingFew(c.s),
          run: (c) => {
            const fear = c.skill("intimidation") >= 30;
            if (c.subj) power(c, c.subj.id, -15);
            c.treat(c.subj, fear ? "coercion" : "cruelty", fear ? 3 : 6, "the owner reminded her whose door it is");
            return { text: fear
              ? `You don't raise your voice. You don't have to. You tell her the door is yours and the decisions behind it are yours, and she goes white and says she understands. She does. She's still the only one, and now she knows exactly what that's worth.`
              : `You tell her she overstepped. She argues, which she's never done, then cries, which she has. It doesn't feel like you won anything.`, next: "news", after: 3 };
          } },
        { id: "laugh", label: "Laugh, and let it go", show: (c) => keepingFew(c.s),
          run: (c) => {
            if (c.subj) power(c, c.subj.id, 10);
            c.treat(c.subj, "kindness", 3, "the owner laughed about it");
            return { text: `You laugh, and tell your security chief to send the trader a bottle of something. ${c.sn} hears that you laughed. She doesn't know what to make of it, so she decides it means yes.`, next: "news", after: 3 };
          } },
        { id: "gone", label: "Let it be", show: (c) => !keepingFew(c.s),
          run: () => ({ text: `You let it be. What she had is gone, and she knows it.`, end: "the house filled up" }) },
      ],
    },
    news: {
      title: "The talk of the Free Cities",
      text: (c) => {
        const f = fewOf(c.s);
        return `A gossip channel out of the arcology across the strait runs ten minutes on you. The headline is "${alone(c) ? "The Owner and the One" : "The Owner's Two"}". They have footage of ${pair(c)} on the concourse; they have three experts guessing whether you're broke, impotent or in love; they have ${c.full("rival_owner")} laughing about it at a party.

${f.heard >= 50 ? "It's not the first piece. It's the first one everyone's watched." : "It's the first time anyone's put it on a screen."} ${c.sn} watched it in the kitchen with the staff, and the staff watched her watching it.`;
      },
      options: [
        { id: "interview", label: "Give them an interview yourself", need: skill("charisma", 35),
          run: (c) => {
            c.rep(500); c.standing(1);
            c.treat(c.subj, "recognition", 6, "the owner talked about her on the feeds");
            c.like("rival_owner", -5);
            return { text: `You do twenty minutes with the channel's best interviewer and you're good: funny, unhurried, and the line that gets clipped and replayed is "Why would I want forty when I've got ${alone(c) ? "her" : "them"}?" ${c.n("rival_owner")} stops telling the joke at parties. ${c.sn} watches the clip eleven times.`, next: "love", after: 4 };
          } },
        { id: "own", label: (c) => `Say it plainly: ${alone(c) ? "she's" : "they're"} all you want`,
          run: (c) => {
            c.rep(-150); neighbours(c, -3);
            c.treat(c.subj, "promise_kept", 7, "the owner said in public she was all they wanted");
            const o = other(c); if (o) c.treat(o, "promise_kept", 5, "the owner said in public they were all they wanted");
            return { text: `You put out a statement that's one sentence long. Half the Free Cities thinks it's the most romantic thing an owner has ever said, and the other half thinks you've lost your mind. In the penthouse, it's the only half that matters.`, next: "love", after: 4 };
          } },
        { id: "buy", label: "Buy a dozen at auction and shut them up", note: money(60000), need: cash(60000),
          run: (c) => {
            c.cash(-60000);
            for (let i = 0; i < 3; i++) c.addSlave({ seed: `few-buy-${i}`, age: 20 + i * 3, quality: 0.4, how: "bought at auction in a hurry, to stop people talking" });
            c.rep(200);
            for (const p of theFew(c.s).filter((x) => (fewOf(c.s).power[x.id] ?? 0) > 20)) c.treat(p, "promise_broken", 6, "the owner filled the house to stop people talking");
            return { text: `You send your buyer to the Grand Exchange with an open account. The channel runs a follow-up called "Never Mind". ${c.sn} doesn't say anything about it at all, and that's how you know.`, end: "you filled the house to shut them up" };
          } },
        { id: "rival", label: (c) => `Have ${c.n("rival_owner")} to dinner, and let ${alone(c) ? "her" : "them"} serve`, need: either(skill("diplomacy", 30), skill("charisma", 45)),
          run: (c) => {
            c.like("rival_owner", 15); neighbours(c, 3);
            if (c.subj) power(c, c.subj.id, 10);
            return { text: `${c.n("rival_owner")} comes, expecting to be amused. ${c.sn} serves dinner and runs the evening, and is so perfectly, unshakeably sure of her place in your house that by dessert ${c.n("rival_owner")} has stopped joking and started asking where you found her. ${c.He("rival_owner")} doesn't tell the story at parties any more. ${c.He("rival_owner")} tells a different one.`, next: "love", after: 4 };
          } },
      ],
    },
    love: {
      title: (c) => `${c.sn} says it`,
      text: (c) => {
        const r = c.subj ? read(c.subj) : undefined;
        return `It's late, and ${c.sn} is in your bed, and she's been quiet for a long time. Then she says she loves you. Not the way a slave says it to an owner because it's expected. She says it like it's been sitting in her chest for weeks and she couldn't hold it any more.

${(r?.devotion ?? 0) >= 60 ? "She means it. Everything about her says so." : "She means it, and she's afraid of what you'll do with it."} ${alone(c) ? "She's the only one, and she's had all of you for months, and she wants to know if that's what she is to you or just what's convenient." : `She knows ${other(c)?.name} would say the same thing. She wants to know if she's first.`}`;
      },
      options: [
        { id: "say", label: "Tell her you love her too",
          run: (c) => {
            c.treat(c.subj, "promise_kept", 9, "the owner told her they loved her");
            if (c.subj) { c.subj.bond.hope = clamp(c.subj.bond.hope + 15, 0, 100); const rom = romanceOf(c.subj); if (rom.standing === "property") { rom.standing = "favourite"; rom.since_week = c.week; } }
            c.set("few_love", true);
            return { text: `You tell her. She cries, which she'd be embarrassed to know you saw, and falls asleep holding on to your arm as if someone might take it.

If you wanted to marry her, you wouldn't need to climb any ladder to do it. You'd only need to say how.`, end: "you told her you loved her" };
          } },
        { id: "marry", label: "Tell her you'll marry her, and that you'll decide how",
          run: (c) => {
            c.treat(c.subj, "promise_kept", 10, "the owner said they'd marry her");
            if (c.subj) { const rom = romanceOf(c.subj); rom.standing = "betrothed"; rom.since_week = c.week; c.subj.bond.hope = clamp(c.subj.bond.hope + 25, 0, 100); }
            c.set("few_engaged", true);
            return { text: `You tell her you'll marry her. She sits up in the dark and asks you to say it again, and you do. Then she asks how, and you tell her that's yours to decide, and she says yes before you've even said what it'll be.

(Her page has a "Marry her, on your terms" button. Write it however you like.)`, end: "you promised to marry her" };
          } },
        { id: "free", label: "Tell her she can speak to you as an equal from now on",
          run: (c) => {
            if (c.subj) { setLatitude(c.s, c.subj, "free"); power(c, c.subj.id, 15); shiftDominion(c.s, c.subj, 10, "the owner told her to speak as an equal"); }
            return { text: `You don't say it back, exactly. You tell her she doesn't have to call you ${c.title} any more, when it's the two of you. She tries your name out loud, once, quietly, like it might break.`, end: "you gave her leave to talk to you as an equal" };
          } },
        { id: "silent", label: "Say nothing, and hold her",
          run: (c) => {
            c.treat(c.subj, "kindness", 3, "the owner held her and said nothing");
            if (c.subj) c.subj.bond.hope = clamp(c.subj.bond.hope - 4, 0, 100);
            return { text: `You hold her. She waits for you to say something, and you don't, and after a while her breathing evens out. In the morning she's exactly as she always is, and she never says it again unless you do.`, end: "you held her and said nothing" };
          } },
      ],
    },
  },
};
const o_ = (c: Ctx) => other(c)?.name ?? "the other one";

/* ── the measure of the owner ──────────────────────────────────────────────────────────────── */

const source = (c: Ctx) => c.s.people[String(c.flag("size_source") ?? "")];

const size: ArcDef = {
  id: "w_size", title: "The Measure of the Owner", kind: "world",
  when: (s) => endowment(s).small && talkOfIt(s) >= 30,
  subject: (s) => {
    const seen = whoHasSeen(s).filter((p) => p.status !== "free");
    const blab = [...seen].sort((a, b) => (b.bond.resentment + b.persona.gregariousness * 40) - (a.bond.resentment + a.persona.gregariousness * 40))[0];
    if (s.story && blab) s.story.flags["size_source"] = blab.id;
    return closest(s);
  },
  cast: ["rival_owner"],
  start: "heard",
  beats: {
    heard: {
      title: "What they're saying",
      text: (c) => {
        const m = menace(c.s);
        const d = endowment(c.s).dick ?? 1;
        return m >= 0.55
          ? `${c.sn} asks to speak to you alone, and when she has you alone she can't get the words out. In the end she tells you with her eyes on the floor: there's a joke going round the arcology. About you. About your cock, which is ${dickWord(d)}, and which everyone below the penthouse now seems to know is ${dickWord(d)}.

Nobody says it where you could hear. You're the one person in ${c.arcology} who'd have people flogged for it, so it's a little finger held up behind your back, a word that stops when you walk in, a citizen at dinner who suddenly can't look at your lap. ${c.sn} is shaking. She thinks you might punish the messenger.`
          : `It reaches you the way these things do: the last. A comedian on the promenade has a bit about the top floor. There's a measurement written next to your name in the concourse toilets. The boards have a nickname for you, and it isn't a compliment.

Your cock is ${dickWord(d)}, everyone who's been in your bed knows it, and now so does everyone else. ${c.sn} tells you because she thinks you should hear it from someone who's on your side. She's trying very hard not to look at your lap.`;
      },
      options: [
        { id: "find", label: "Find out who started it", need: either(skill("insight", 30), (c) => (c.s.arcology.security >= 50 ? null : "needs security 50")),
          run: (c) => {
            const src = source(c);
            if (!src) return { text: `You look. It started everywhere at once, the way the true ones do. There's nobody to blame but your own body.`, next: "rival", after: 3 };
            c.set("size_found", true);
            return { text: `It doesn't take long. The story everyone's telling has details only one person could know, and the details lead back to ${src.name}.`, next: "source", after: 0 };
          } },
        { id: "laugh", label: "Laugh it off, in public",
          run: (c) => {
            const good = c.skill("charisma") >= 35;
            if (c.s.story) c.s.story.flags["size_talk"] = Math.max(0, talkOfIt(c.s) + (good ? -25 : 12));
            if (good) { c.standing(1); c.rep(200); } else c.rep(-200);
            return { text: good
              ? `At the next public dinner you tell the joke yourself, better than the comedian does, and the room laughs with you instead of at you. It's the end of the joke. It was never going to be the end of the fact, but nobody enjoys a secret the owner laughs at.`
              : `You try a joke about it at the next public dinner. It lands like a dropped tray. The silence afterwards is worse than the joke was, and by morning there's a clip.`, next: "rival", after: 3 };
          } },
        { id: "example", label: "Make an example of the next one who says it", need: skill("intimidation", 25),
          run: (c) => {
            c.crime(-3); c.standing(-1);
            c.household("coercion", 3, "the owner made an example of someone over the joke");
            if (c.s.story) c.s.story.flags["size_talk"] = Math.max(0, talkOfIt(c.s) - 15);
            return { text: `Your security finds a citizen telling it in a bar on the promenade and drags him out by the collar in front of the whole room. You don't even need to say what it's for. The joke goes underground that night. It doesn't go away; it just goes very, very quiet, which is its own kind of joke.`, next: "rival", after: 3 };
          } },
        { id: "surgery", label: "Book the surgery", note: (c) => money(enlargeCost(c.s)), need: (c) => cash(enlargeCost(c.s))(c),
          run: (c) => {
            const r = enlarge(c.s);
            c.out.push(r.line);
            return { text: `You book the best surgeon in the Free Cities for the next morning. It's done in a day. ${r.ok ? "It's bigger. The jokes change overnight: they're about the surgery now, and what it cost, and what it was like before. Nobody can say the old one about you any more, and some of them miss it." : r.line}`, end: "you had it made bigger" };
          } },
        { id: "own", label: "Lean into it", note: "it's what you like",
          run: (c) => {
            pushNorm(c.s, "reversal", 4, "the owner made a joke of their own cock");
            for (const p of c.owned().filter((x) => x.persona.fetishes.some((f) => f.name === "sph" && f.strength >= 30))) c.treat(p, "recognition", 5, "the owner let everyone laugh at it, and she loves it");
            c.rep(-300);
            return { text: `You let it be true, out loud. You don't deny it; you let your slaves joke about it at dinner, in front of guests. The city doesn't know what to make of an owner who isn't ashamed of the thing they're laughing at. Some of your women know exactly what to make of it.`, next: "rival", after: 3 };
          } },
      ],
    },
    source: {
      title: (c) => `${source(c)?.name ?? "She"} told them`,
      text: (c) => {
        const src = source(c);
        return `${src?.name ?? "She"} is brought up to you. She knows why. ${src && src.bond.resentment > 45 ? "She doesn't apologise, and she doesn't look away. She wanted to hurt you and she found the place." : "She's pale and talking fast: it was one story, to one friend, and she never thought it would go anywhere."}`;
      },
      options: [
        { id: "punish", label: "Punish her for it",
          run: (c) => { const src = source(c); c.treat(src, "cruelty", 7, "punished for telling everyone about the owner's cock"); c.household("coercion", 2, "watched her punished over the joke"); return { text: `You punish her, where the others can hear. Nobody repeats the joke inside the penthouse again. Outside, it gets a new verse.`, next: "rival", after: 3 }; } },
        { id: "forgive", label: "Forgive her",
          run: (c) => { const src = source(c); c.treat(src, "kindness", 6, "forgiven for telling everyone about the owner's cock"); return { text: `You tell her it's true, and she wasn't lying, and to go. She stands there not understanding, then goes. She doesn't tell anyone anything about you again, and she never says why.`, next: "rival", after: 3 }; } },
        { id: "face", label: "Make her say it to your face",
          run: (c) => {
            const src = source(c);
            const likes = src?.persona.fetishes.some((f) => f.name === "sph" && f.strength >= 30);
            c.treat(src, likes ? "recognition" : "coercion", likes ? 5 : 4, "made to say it to the owner's face");
            return { text: likes
              ? `You tell her to say it to you, here, the way she said it to them. She stares at you, then something in her face changes, and she does. In detail. With her hand held up for scale. It's the best night either of you has had in a month.`
              : `You tell her to say it to your face, exactly as she said it to them. She does, in a whisper, red to the ears, and you make her say it again louder. She'll never tell it again.`, next: "rival", after: 3 };
          } },
        { id: "sell", label: "Sell her",
          run: (c) => { const src = source(c); if (src) c.remove(src, "sold", "sold for telling everyone about the owner's cock", 8000); c.household("coercion", 3, "she was sold over the joke"); return { text: `She's on the block by the end of the week. The joke goes with her to her next house, and somehow that makes it travel further.`, next: "rival", after: 3 }; } },
      ],
    },
    rival: {
      title: (c) => `${c.n("rival_owner")}'s present`,
      text: (c) => `A courier brings a box from ${c.full("rival_owner")}, across the strait, wrapped in silk with a card. Inside, on velvet, is a ruler. A very short one. The card says: "For the owner who has everything. Almost."

${c.n("rival_owner")} has told the story to half the Owners' Association already. ${c.sn} saw you open it.`,
      options: [
        { id: "return", label: (c) => `Send ${c.him("rival_owner")} something back that ${c.he("rival_owner")} won't laugh at`, need: either(skill("intimidation", 35), skill("hacking", 35)),
          run: (c) => { c.like("rival_owner", -10); c.rep(300); return { text: `You send back a box of your own. Inside is a list of ${c.n("rival_owner")}'s own secrets, in order of how much they'd cost ${c.him("rival_owner")}. The card says: "Almost." ${c.He("rival_owner")} stops telling the story that afternoon.`, end: "you frightened the rival into silence" }; } },
        { id: "wit", label: "Answer it in public, and win", need: skill("charisma", 40),
          run: (c) => { c.like("rival_owner", 5); c.rep(400); c.standing(1); return { text: `You put the ruler on display in your office, with a card of your own under it, and invite the press in for something else. The card says "It measures exactly how much I care." The photograph goes round the Free Cities, and the joke is on ${c.n("rival_owner")} now.`, end: "you won the joke" }; } },
        { id: "ignore", label: "Throw it away",
          run: (c) => { c.like("rival_owner", -3); return { text: `You throw it in the recycler. ${c.sn} fishes it out later and keeps it in her drawer, and you never find out why.`, end: "you threw the ruler away" }; } },
        { id: "tariff", label: (c) => `Put a tariff on ${c.his("rival_owner")} cargo`,
          run: (c) => { c.like("rival_owner", -20); neighbours(c, -2); c.prosperity(-2); return { text: `Everyone knows exactly why the tariff went up. It's the most expensive joke ${c.n("rival_owner")} ever told, and it makes the joke about you famous on three continents.`, end: "you started a trade war over a joke" }; } },
      ],
    },
  },
};

/* ── married ───────────────────────────────────────────────────────────────────────────────── */

const wife = (c: Ctx) => marriageOf(c.s);
const married: ArcDef = {
  id: "w_marriage", title: "Married", kind: "world", cast: ["rival_owner"],
  subject: (s) => (s.player.marriage ? s.people[s.player.marriage.person] : undefined),
  start: "after", delay: 1,
  beats: {
    after: {
      title: "The week after",
      wait: (c) => !!wife(c),
      text: (c) => {
        const m = wife(c)!;
        return `${m.public ? `The whole of ${c.arcology} saw you marry ${c.sn}, and a week later it's still the only thing anyone talks about.` : `Nobody saw you marry ${c.sn}. A week later, everybody knows anyway; the registry clerk has a sister.`} ${m.seen}

${m.status === "slave wife" ? `She still wears your collar. Some citizens think that's the point; others think it's a joke at marriage's expense, and they're saying so.` : m.status === "free wife" ? `She walks the concourse a free woman with your name. Citizens who used to look through her now don't know where to look.` : `She's off the slave registry and on the marriage one, which nobody in the city quite has a word for.`} ${m.power === "her" ? `Word has got out about who leads in your house. People are watching you to see if it's true.` : m.power === "equal" ? `People are watching to see if you really meant "equals".` : `People are watching to see what a wife is, here, when the owner still runs everything.`}`;
      },
      options: [
        { id: "show", label: "Walk her through the concourse as your wife",
          run: (c) => { const m = wife(c)!; c.treat(c.subj, "recognition", 6, "shown off on the concourse as the owner's wife"); c.rep(m.status === "slave wife" ? 100 : 250); if (m.power === "her" && c.subj) shiftDominion(c.s, c.subj, 4, "she walked ahead of you on the concourse"); return { text: m.power === "her" ? `She walks a half step ahead and you let her, and the concourse sees exactly what it came to see.` : `You walk her the length of the concourse on your arm. People stop to watch. She's never been looked at like that, and she holds her head up for every step.`, next: "powers", after: 4 }; } },
        { id: "speech", label: "Tell the city what this marriage is", need: skill("charisma", 30),
          run: (c) => { c.standing(1); c.rep(350); c.hope(3); return { text: `You go on the arcology feed and say it in your own words. It's short and it's good, and by the end of it even the people who thought it was a scandal have stopped arguing and started repeating your best line.`, next: "powers", after: 4 }; } },
        { id: "private", label: "Keep it between the two of you",
          run: (c) => { c.treat(c.subj, "kindness", 5, "the owner kept the marriage between the two of them"); return { text: `You don't go out, and you don't comment. You stay in with her. The city fills the silence with its own version, which is wilder than the truth and does you no harm at all.`, next: "powers", after: 4 }; } },
        { id: "hers", label: "Let her answer for the two of you", show: (c) => wife(c)?.power !== "you",
          run: (c) => { const smart = ["sharp", "brilliant"].includes(c.subj?.persona.intelligence ?? ""); if (c.subj) shiftDominion(c.s, c.subj, 6, "she spoke for the marriage"); if (smart) { c.rep(300); c.standing(1); } else c.rep(-100); return { text: smart ? `She gives one interview and owns it. The clip that goes round is her, not you, and it's better than anything you'd have said.` : `She gives one interview and it goes badly; she's not made for it. She comes home mortified, and you tell her it doesn't matter, and it mostly doesn't.`, next: "powers", after: 4 }; } },
      ],
    },
    powers: {
      title: "The other arcologies have opinions",
      text: (c) => {
        const m = wife(c);
        return `The Owners' Association sends a note of congratulations so cold it frosts the screen. ${c.full("rival_owner")} has made the marriage a running joke at parties: ${m?.power === "her" ? `"the owner who married his boss"` : m?.status === "slave wife" ? `"marrying the furniture"` : `"the owner who married the help"`}. Two neighbouring arcologies have sent gifts. One has sent nothing, very pointedly.

${c.sn} has seen all of it. She's waiting to see what you do.`;
      },
      options: [
        { id: "gifts", label: "Send every arcology a wedding gift back", note: money(10000), need: cash(10000),
          run: (c) => { c.cash(-10000); neighbours(c, 5); return { text: `You send gifts back to everyone, including the ones who sent nothing. Generosity is hard to mock. The jokes slow down.`, next: "test", after: 5 }; } },
        { id: "dinner", label: (c) => `Have ${c.n("rival_owner")} to dinner with your wife`, need: either(skill("diplomacy", 30), skill("charisma", 40)),
          run: (c) => { c.like("rival_owner", 15); c.treat(c.subj, "recognition", 5, "hosted the rival as the owner's wife"); return { text: `${c.n("rival_owner")} comes to laugh and leaves charmed. ${c.sn} hosts, and by the end of the evening ${c.he("rival_owner")}'s asking her advice about ${c.his("rival_owner")} own household. The joke at parties changes.`, next: "test", after: 5 }; } },
        { id: "warn", label: "Let it be known the joke is over", need: skill("intimidation", 30),
          run: (c) => { c.like("rival_owner", -8); c.standing(1); return { text: `You don't threaten anyone. You simply mention, at the right party, in the right tone, what happened to the last person who made a joke about your household. The jokes stop at once. Nobody likes you more for it, but nobody laughs either.`, next: "test", after: 5 }; } },
        { id: "nothing", label: "Ignore them",
          run: (c) => { neighbours(c, -2); return { text: `You let them talk. They do, for a while, and then something else happens in the Free Cities and they talk about that instead.`, next: "test", after: 5 }; } },
      ],
    },
    test: {
      title: "The terms, tested",
      wait: (c) => !!wife(c),
      text: (c) => {
        const m = wife(c)!;
        if (m.power === "her") return `You come down to the office and find a decision already made. ${c.sn} has signed something in your name: a new rule for the household, a contract renewed, a slave moved to a different job. It's a good decision. It's not one you'd have made. Your staff carried it out without checking with you, because by the terms you set, they didn't have to.`;
        if (m.power === "equal") return `In front of the senior staff, ${c.sn} disagrees with you. Openly, reasonably, and she's right. The room goes very still. Everyone in it is waiting to see what "equals" means when it costs you something.`;
        return `${c.sn} asks for something the terms didn't give her. ${m.status === "slave wife" ? "Her freedom: not now, she says, but someday, and she wants you to say it'll be someday." : "A say in something: the household, the doctrine, one decision a month that's hers."} She asks properly, the way you'd want her to. She's clearly been working up to it for weeks.`;
      },
      options: [
        { id: "grant", label: (c) => (wife(c)?.power === "you" ? "Give her what she asks" : wife(c)?.power === "equal" ? "Back her, in front of them" : "Let her decision stand"),
          run: (c) => {
            const m = wife(c)!;
            if (m.power === "you") { if (m.status === "slave wife") { m.status = "wife"; if (c.subj) c.subj.status = "indentured"; } else m.power = "equal"; }
            if (c.subj) shiftDominion(c.s, c.subj, 10, "the owner gave her more than the terms did");
            c.treat(c.subj, "promise_kept", 8, "the owner gave her more than the terms did");
            c.out.push(`the terms change: she's your ${m.status}, ${m.power === "her" ? "and she leads" : m.power === "equal" ? "and you're equals" : "and you lead"}`);
            return { text: `You give it to her. ${c.sn} goes very quiet, the way she does when something matters too much to say anything about. The marriage is a little different after this, and both of you know whose choice that was.`, next: "year", after: 8 };
          } },
        { id: "gentle", label: "Say no, gently, and make her understand", need: skill("charisma", 35),
          run: (c) => { c.treat(c.subj, "kindness", 3, "the owner said no, and she understood"); return { text: `You say no, and you say it so that she understands why, and she does. It costs her something. It doesn't cost the marriage anything.`, next: "year", after: 8 }; } },
        { id: "firm", label: "Remind her of the terms",
          run: (c) => {
            const m = wife(c)!;
            const scary = c.skill("intimidation") >= 30;
            if (c.subj) shiftDominion(c.s, c.subj, -10, "the owner held her to the terms");
            if (m.power !== "you") { m.power = m.power === "her" ? "equal" : "you"; c.out.push(`the terms change: ${m.power === "equal" ? "you're equals now, not hers" : "you lead now"}`); }
            c.treat(c.subj, scary ? "coercion" : "promise_broken", scary ? 3 : 6, "the owner held her to the terms");
            return { text: scary ? `You remind her of the terms, quietly, and she remembers them. She doesn't ask again.` : `You remind her of the terms. She says she remembers them. She's polite for a week, which is how you know how angry she is.`, next: "year", after: 8 };
          } },
      ],
    },
    year: {
      title: "Still married",
      wait: (c) => !!wife(c),
      text: (c) => {
        const m = wife(c)!;
        return `It's been ${c.week - m.week} weeks. ${c.sn} brings it up over breakfast: not an anniversary, she says, just a day. She wants to know how you'd like the marriage to go on.${m.hooks.length ? `\n\nSome things are still open: ${m.hooks.join(" ")}` : ""}`;
      },
      options: [
        { id: "renew", label: "Renew the vows, bigger", note: money(15000), need: cash(15000),
          run: (c) => { c.cash(-15000); c.rep(400); c.treat(c.subj, "promise_kept", 8, "the owner renewed the vows"); return { text: `You do it again, in front of more people, and she says the vows again like she means them more now. She does.`, end: "you renewed the vows" }; } },
        { id: "on", label: "Tell her it goes on exactly as it is",
          run: (c) => { c.treat(c.subj, "kindness", 4, "the owner said the marriage goes on as it is"); return { text: `She smiles and goes back to her breakfast. That was the answer she wanted.`, end: "the marriage goes on" }; } },
        { id: "end", label: "End it",
          run: (c) => { for (const l of divorce(c.s, "the owner ended it a year on")) c.out.push(l.text); return { text: `You tell her it's over. She doesn't ask why. She takes off the ring, or the collar's tag, and puts it on the table, and goes.`, end: "you ended the marriage" }; } },
      ],
    },
  },
};

export const OWNER_ARCS: ArcDef[] = [few, size, married];
