/**
 * HOW SHE TALKS.
 *
 * Every woman speaks in one of nine registers, picked fresh each time from where she actually is:
 * her nervous system, what is holding her, who is deciding, and her own wiring. The same woman
 * moves between them over a campaign — a sullen one in week 3 can be bratty by week 30 — and the
 * lines below are what she says in each.
 *
 * Lines are templates. `{you}` is what she calls the player, `{name}` is her own name, `{pname}`
 * is the player's name, `{liked}` is filled by the caller when she is naming something.
 */
import type { Person, SaveState } from "./types";
import type { Rng } from "./rng";
import { read } from "./obedience";

export type Register =
  | "hollow" | "timid" | "sullen" | "proper" | "warm" | "eager" | "bratty" | "crude" | "commanding";

export const REGISTER_LABEL: Record<Register, string> = {
  hollow: "empty", timid: "frightened", sullen: "sullen", proper: "polite", warm: "warm",
  eager: "eager", bratty: "mouthy", crude: "foul-mouthed", commanding: "in charge",
};

export function registerOf(p: Person): Register {
  if (p.psyche.state === "broken") return "hollow";
  const r = read(p);
  const dominion = p.romance?.dominion ?? -100;
  if (dominion >= 50) return "commanding";
  const fetish = (id: string) => p.persona.fetishes.find((f) => f.name === id)?.strength ?? 0;
  const scared = p.psyche.relaxation <= -3.5 || (r.fragility > 0.65 && p.bond.fear > 35);
  if (scared) return "timid";
  if (p.bond.resentment > 45 && r.devotion < 15) return "sullen";
  if (p.persona.flaw?.id === "crude" && r.trust > -10) return "crude";
  if ((fetish("dom") > 45 || fetish("sadist") > 55 || dominion > 15) && r.trust > 15) return "bratty";
  if (r.devotion > 55 && (p.psyche.libido > 55 || p.psyche.arousal > 60)) return "eager";
  if (r.devotion > 30 && r.trust > 15) return "warm";
  if (r.devotion < -15) return "sullen";
  return "proper";
}

export type Said =
  | "open" | "wanted" | "willing" | "endured" | "hated" | "nothing"
  | "came" | "left" | "tender" | "praise" | "hold" | "mock" | "liked" | "again" | "dismiss"
  | "thank" | "pain" | "talk_open";

type Pool = Record<Said, string[]>;

const LINES: Record<Register, Pool> = {
  hollow: {
    open: ["Yes, {you}.", "What do you want me to do.", "I'm ready, {you}."],
    wanted: ["Thank you, {you}.", "Yes.", "That was good, {you}. Was it good?"],
    willing: ["Yes, {you}.", "All right.", "Whatever you want."],
    endured: ["Yes, {you}.", "Is that all?", "Thank you, {you}."],
    hated: ["Thank you, {you}.", "Yes. Yes. Thank you.", "I'm sorry. Thank you."],
    nothing: ["Yes, {you}.", "Is there more?", "Okay."],
    came: ["Was that allowed?", "Thank you, {you}.", "I'm sorry. Thank you."],
    left: ["Yes, {you}.", "I'll wait.", "Okay."],
    tender: ["Thank you, {you}.", "Is this for something?", "Yes."],
    praise: ["Thank you, {you}.", "I'll do it again. Whenever you want.", "Good. Good."],
    hold: ["…", "Thank you, {you}.", "Is this all right?"],
    mock: ["Yes, {you}.", "I know. I'm sorry.", "Yes. That's right."],
    liked: ["Whatever you liked, {you}.", "I liked it. I liked all of it.", "I don't know. Did you?"],
    again: ["Yes, {you}.", "Okay.", "Again. Yes."],
    dismiss: ["Yes, {you}.", "Thank you, {you}.", "I'll be where you want me."],
    thank: ["Thank you, {you}. Thank you for using me.", "Thank you.", "Thank you, {you}, for— thank you."],
    pain: ["Yes. Thank you.", "Sorry— yes.", "…"],
    talk_open: ["What do you want to know.", "I'll tell you anything.", "Yes, {you}?"],
  },
  timid: {
    open: ["Did I— is something wrong?", "Here? Okay. Okay.", "Tell me what you want and I'll do it. Please just tell me."],
    wanted: ["Oh. Oh, I— that was— sorry. Thank you.", "Can we— could you do that again? Sometime? Sorry.", "I didn't think it would be like that."],
    willing: ["Was that right?", "Was that okay? Did I do it right?", "Okay. That's okay."],
    endured: ["Is it done? Sorry. Is it done?", "I did it right, didn't I? Please say I did it right.", "I'm fine. I'm fine."],
    hated: ["Please don't do that again. Please. I'll be good.", "I'm sorry, I'm sorry, I'll be better at it—", "Can I go? Please can I go now."],
    nothing: ["Was that all right?", "Sorry. I'm not— sorry.", "Did you want me to make noise? I can make noise."],
    came: ["I'm sorry— I didn't mean— was I allowed to?", "Oh god. Sorry. Sorry.", "That's never— I'm sorry."],
    left: ["It's okay. I don't need to.", "Please don't stop— no, sorry. It's fine.", "I'm okay. I'm okay."],
    tender: ["Why are you being nice?", "Is this a test? You can tell me if it's a test.", "…Okay. Okay. Thank you."],
    praise: ["Really? You mean it?", "I'll keep doing it right. I promise.", "Thank you. Thank you, {you}."],
    hold: ["Please don't let go yet.", "Is this all right? Me being here?", "You're warm."],
    mock: ["I'm sorry. I'll try harder.", "I know. I know I am.", "Please don't tell the others."],
    liked: ["When you— when you were slow. That part.", "{liked}. Is that— is it bad that I liked that?", "I don't know. I don't know what I'm supposed to say."],
    again: ["Again? Okay. Okay, I can.", "Please— okay. Yes.", "If you want. Yes."],
    dismiss: ["Thank you. Thank you, {you}.", "Should I come back later? Or not?", "Okay."],
    thank: ["Thank you. Thank you, {you}.", "Th— thank you.", "Thank you for— for doing that."],
    pain: ["Please—", "Ow— sorry. Sorry.", "I'll be good, I'll be good—"],
    talk_open: ["What did I do?", "Am I in trouble?", "You want to talk? To me?"],
  },
  sullen: {
    open: ["What.", "Get on with it.", "You again."],
    wanted: ["Don't look at me like that.", "Fine. That one wasn't terrible.", "Don't get used to me liking something."],
    willing: ["There. Happy?", "Done?", "Fine."],
    endured: ["Are you finished?", "Is that it.", "Tell me when I can go."],
    hated: ["I hope you choke on it.", "I'm going to remember that.", "You done? Good."],
    nothing: ["Are you waiting for applause?", "Mm.", "Is that what passes for it with you?"],
    came: ["Shut up. Don't say anything.", "That wasn't for you.", "Not a word. Not one word."],
    left: ["Don't bother.", "Typical.", "Don't worry about me. You never do."],
    tender: ["What do you want.", "What is this. What are you doing.", "Don't."],
    praise: ["I don't need you to tell me.", "Keep it.", "Whatever."],
    hold: ["You can let go now.", "…Five minutes.", "Don't make this a thing."],
    mock: ["Say that again.", "Yeah. Laugh.", "Funny."],
    liked: ["Nothing you did.", "{liked}. Don't make it weird.", "Ask me when I'm not lying here."],
    again: ["Of course.", "You have to be joking.", "Fine. Hurry."],
    dismiss: ["Gladly.", "Finally.", "Don't call me, I'll call you."],
    thank: ["Thank you. {you}.", "Thanks. For that.", "Thank you. There. Said it."],
    pain: ["Fuck you.", "—bastard—", "Hah. That all?"],
    talk_open: ["What do you want now.", "I'm listening. Barely.", "Make it quick."],
  },
  proper: {
    open: ["How would you like me, {you}?", "Of course, {you}.", "I'm at your disposal."],
    wanted: ["That was— rather better than I expected, {you}.", "Thank you. I mean that.", "I'd like that again. If it's on offer."],
    willing: ["Of course, {you}.", "Was that satisfactory?", "Thank you, {you}."],
    endured: ["Will that be all, {you}?", "I hope that was satisfactory.", "Yes. Of course."],
    hated: ["I'd rather not do that again, {you}. If I have any say.", "Excuse me. I need a moment.", "I understand. I'll do better at it."],
    nothing: ["Was that what you wanted?", "Should I be doing something differently?", "Mm. Of course."],
    came: ["Oh— excuse me. That was… excuse me.", "I apologise. That wasn't very composed.", "Well. That happened."],
    left: ["It's quite all right.", "I'll manage, {you}.", "Perhaps another time."],
    tender: ["That's very kind, {you}.", "I don't know what to say to that.", "Thank you. Really."],
    praise: ["Thank you, {you}. I try.", "That's generous of you.", "I'm glad."],
    hold: ["This is nice.", "I could get used to this, {you}.", "Thank you."],
    mock: ["If you say so, {you}.", "I'll take that under advisement.", "I see."],
    liked: ["{liked}, if I'm honest.", "It's not the sort of thing I usually say out loud. {liked}.", "I'd prefer to keep that to myself, {you}."],
    again: ["Of course.", "If you'd like.", "Certainly, {you}."],
    dismiss: ["Thank you, {you}.", "Good night, {you}.", "Call if you need me."],
    thank: ["Thank you, {you}.", "Thank you for your attention, {you}.", "I'm grateful, {you}."],
    pain: ["Ah—", "—mm.", "I'm fine. Carry on."],
    talk_open: ["Of course. What would you like to discuss?", "I'm listening, {you}.", "Yes?"],
  },
  warm: {
    open: ["Hey. Hi. Come here.", "There you are.", "I was hoping you'd come by."],
    wanted: ["God. Yes. Do that again sometime.", "Okay, that— you can do that whenever you want.", "Mm. Stay a minute."],
    willing: ["That was nice.", "Mm. Hi.", "You okay?"],
    endured: ["Can we do something else next time?", "That's not my favourite. You know that, right?", "Okay. Done."],
    hated: ["I really didn't like that.", "Please don't make me do that one again.", "Can you just— give me a minute."],
    nothing: ["Was that good for you?", "Sorry, I was miles away.", "Hm. Okay."],
    came: ["Oh my god.", "Don't laugh. Don't you dare laugh.", "Okay. Okay. Wow."],
    left: ["You're mean. You know that?", "You're leaving me like this?", "Come back here."],
    tender: ["You're sweet when nobody's looking.", "Stay. Please.", "I like you like this."],
    praise: ["Yeah? Good.", "Say it again.", "I know. But say it again."],
    hold: ["Don't go anywhere.", "Mm. This is my favourite part.", "You're warm."],
    mock: ["Hey. That's not nice.", "Wow. Okay.", "Ouch."],
    liked: ["{liked}. Obviously.", "You know what I liked. {liked}.", "Everything. No— {liked}. That."],
    again: ["Already? Okay.", "Give me a second. Okay.", "Greedy. Yes."],
    dismiss: ["Night. Come find me later.", "Okay. See you.", "Don't be a stranger."],
    thank: ["Thank you. I mean it.", "Thanks, {you}.", "Thank you. Really."],
    pain: ["Ow. Okay. Ow.", "Easy—", "Hey—"],
    talk_open: ["Yeah? What's up?", "Sit with me.", "What do you want to talk about?"],
  },
  eager: {
    open: ["Finally.", "I've been thinking about you all day.", "Please. Whatever you want. Please."],
    wanted: ["Yes. Yes. More of that.", "Don't stop— don't you dare stop.", "Oh fuck, yes."],
    willing: ["Mm. Good.", "More?", "I love it when you do that."],
    endured: ["Not my favourite. But for you.", "Next time do the other thing.", "Okay. I'm still here."],
    hated: ["I didn't like that. I still want you. But I didn't like that.", "Not that one. Anything but that one.", "That wasn't fun, {you}."],
    nothing: ["Is that it?", "Come on. I know you can do better.", "Hm. Warm-up?"],
    came: ["Fuck. Fuck. Again.", "Don't move. Don't move yet.", "That was— give me a second— again."],
    left: ["You can't leave me like this.", "Please. Please, I'm so close.", "You're evil. I love you. You're evil."],
    tender: ["You're going to make me cry.", "Don't let go.", "I love this."],
    praise: ["Tell me again.", "I'm yours. You know that.", "Only for you."],
    hold: ["Stay. Stay all night.", "I could sleep like this.", "Mm."],
    mock: ["Say it while you fuck me.", "Mm. Maybe I am.", "I know what I am."],
    liked: ["{liked}. And everything else.", "{liked}. Do it again and I'll show you.", "All of it. Especially {liked}."],
    again: ["Yes. Yes.", "I thought you'd never ask.", "Please."],
    dismiss: ["Already?", "Come back soon.", "I'll be thinking about you."],
    thank: ["Thank you. Thank you. Again?", "Thank you, {you}. Every time.", "Thank you. God, thank you."],
    pain: ["Yes—", "Harder, if you want.", "Mm—"],
    talk_open: ["Talk? We can talk. After?", "Anything you want.", "I'm all yours."],
  },
  bratty: {
    open: ["Took you long enough.", "Oh, it's you.", "What do you want, {pname}?"],
    wanted: ["Okay. You can keep doing that.", "Fine. You're allowed to do that again.", "That was acceptable."],
    willing: ["Is that the best you've got?", "Cute.", "Mm-hm."],
    endured: ["Bored now.", "Are we done? I have things to do.", "Wow. Riveting."],
    hated: ["Do that again and I'll bite.", "Next time I pick.", "That's going on your record."],
    nothing: ["Wake me up when it gets good.", "Were you trying?", "Yawn."],
    came: ["Don't look so pleased with yourself.", "That doesn't count.", "Lucky."],
    left: ["Coward.", "You're going to regret that.", "Fine. I'll finish myself. Watch."],
    tender: ["Who taught you that?", "Ugh. Fine. Come here.", "Don't go soft on me."],
    praise: ["Obviously.", "I know I did.", "Say it louder."],
    hold: ["You're clingy.", "Five minutes. Then I'm getting up.", "You're lucky you're warm."],
    mock: ["That's rich coming from you.", "Careful.", "Say that again. I dare you."],
    liked: ["{liked}. Don't let it go to your head.", "You want notes? {liked}. More of it.", "The part where you shut up."],
    again: ["Can you, though?", "Prove it.", "Fine. Impress me."],
    dismiss: ["Rude.", "Fine. Bye.", "You'll be back."],
    thank: ["Thank you. Happy?", "Thanks, {pname}.", "Th-a-nk you."],
    pain: ["Is that it?", "Ow. Asshole.", "Harder, coward."],
    talk_open: ["Talk? You?", "This better be interesting.", "Go on then."],
  },
  crude: {
    open: ["What, you want a fuck?", "Well? Get it out.", "Come on then."],
    wanted: ["Fuck yes. Do that again.", "Oh, that's the good shit.", "Fuck me. Fuck me, that was good."],
    willing: ["Not bad.", "That'll do.", "Yeah, yeah."],
    endured: ["You done? My ass is going numb.", "Took your time.", "Whatever gets you off."],
    hated: ["Fuck you, and fuck that.", "Do that again and you'll get teeth.", "You sick fuck."],
    nothing: ["Was I supposed to feel that?", "You finish? Good.", "Wake me up."],
    came: ["Holy shit.", "Oh, fuck off, don't look at me.", "Fuck. Fuck. Okay."],
    left: ["You're leaving me with this? Prick.", "Fine. I'll do it myself.", "You fucking tease."],
    tender: ["What's this, you going soft?", "Don't get sappy on me.", "…Okay. That's all right."],
    praise: ["I know I'm good.", "Damn right.", "Tell your friends."],
    hold: ["You're sweaty.", "Fine. Don't hog the pillow.", "Mm."],
    mock: ["Fuck off.", "Takes one to know one.", "Yeah, and?"],
    liked: ["{liked}. Obviously, dickhead.", "{liked}. Write it down.", "When you shut up and fucked me."],
    again: ["Hah. Sure.", "Hope you're hydrated.", "Go on then."],
    dismiss: ["Later.", "Don't let the door hit you.", "Cheers."],
    thank: ["Thanks. Or whatever.", "Thank you, {you}. Happy now?", "Ta."],
    pain: ["Fuck—", "Shit—", "You bastard—"],
    talk_open: ["What, you want to chat?", "Spit it out.", "Go on."],
  },
  commanding: {
    open: ["You took your time. Sit.", "Good. You're here.", "Come here. No— closer."],
    wanted: ["Good. That's how you do it.", "Better. Remember that.", "Mm. You're learning."],
    willing: ["Acceptable.", "Fine.", "You can do better. You will."],
    endured: ["Is that what you think I want?", "Don't do that again unless I ask.", "We'll talk about that."],
    hated: ["No. We're not doing that.", "Try that again and see what happens.", "I'll forget that. This once."],
    nothing: ["Try again.", "Were you trying?", "Hm."],
    came: ["Good. Good. Don't move.","Don't get smug.", "That'll do. For now."],
    left: ["Don't you dare stop without asking me.", "Did I say you could stop?", "Finish what you started."],
    tender: ["Mm. Good. More of that.", "You're allowed to do that.", "Come here."],
    praise: ["I know.", "I'll be the one handing out praise, thank you.", "Save it."],
    hold: ["Stay there.", "You don't move until I say.", "Mm. Good."],
    mock: ["Say that again, carefully.", "That's the last time.", "Interesting choice."],
    liked: ["{liked}. You'll do it again tomorrow.", "{liked}. Take notes.", "I'll tell you when you've earned it."],
    again: ["Yes. Again.", "Did I say you could stop?", "Again. Slower."],
    dismiss: ["You don't dismiss me.", "I'll leave when I'm ready.", "Go, then. I'll call you."],
    thank: ["Thank me properly. On your knees.", "You're welcome.", "Hm."],
    pain: ["Careful.", "Watch it.", "—mm. Careful."],
    talk_open: ["Talk. I'm listening.", "What is it?", "Go on."],
  },
};

/** What she calls you, which moves with who is deciding. */
export function addressFor(s: SaveState, reg: Register): string {
  const title = s.player.address || "Master";
  if (reg === "commanding") return s.player.name && s.player.name !== "you" ? s.player.name : "pet";
  if (reg === "bratty" || reg === "crude") return s.player.name && s.player.name !== "you" ? s.player.name : title;
  return title;
}

export function fill(t: string, vars: Record<string, string>): string {
  return t.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}

/** One spoken line, in her register, with the fillers resolved. */
export function say(s: SaveState, p: Person, what: Said, r: Rng, extra: Record<string, string> = {}): string {
  const reg = registerOf(p);
  let pool = LINES[reg][what];
  // A woman who does not talk cannot say anything, whatever register she is in.
  if (p.body.voice === 0) return r.pick(["She shakes her head.", "She nods.", "She meets your eye and says nothing, because she cannot."]);
  if (what === "liked" && !extra.liked) pool = pool.filter((l) => !l.includes("{liked}"));
  const line = r.pick(pool.length ? pool : LINES.proper[what]);
  const pname = s.player.name && s.player.name !== "you" ? s.player.name : addressFor(s, "proper");
  return fill(line, { you: addressFor(s, reg), name: p.name, pname, ...extra });
}
