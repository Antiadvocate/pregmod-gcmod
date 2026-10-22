/**
 * THE OTHER MAN — the chapters.
 *
 * Ten of them, read one at a time, a week or two apart: you ask her, you pick him, a dinner, a
 * kiss at the door, the first night with you in the chair, the night she comes home late, the
 * call, his name in your bed, your own bed, his seed, and his offer. Every chapter lets you push
 * her further, sit and watch, or try to pull her back, and what each of those does depends on why
 * she agreed and how far she has already gone (engine/cuckold.ts).
 *
 * The slow part is the point. She doesn't change in one scene; she changes in the weeks between
 * them, at his place, and each chapter is you finding out how much.
 */
import type { Person, SaveState } from "../engine/types";
import {
  type Bull, type BullKind, type CuckState, type Ending, type Motive, type Shift,
  apply, bullDickWords, makeBull, pregnantByHim, seed, takenBy, yourDickWords, yourDick,
} from "../engine/cuckold";
import { hasCock } from "../engine/you";
import { hasWomb } from "../engine/pregnancy";
import { sell } from "../engine/market";
import { valuePerson } from "../engine/economy";
import { clamp } from "../engine/psyche";

/* ── the context every chapter is written from ───────────────────────────────────────────────── */

export interface Cx {
  s: SaveState;
  p: Person;
  c: CuckState;
  /** Her name. */
  n: string;
  /** What she calls you. */
  addr: string;
  /** His name as she says it, once there is a him. */
  him: string;
  b?: Bull;
  /** Where he puts it: "pussy" or "ass". */
  hole: string;
  /** "a man like you", said by him. */
  likeYou: string;
  /** What she calls you when she's started to look down on you. */
  pet: string;
  /** One line for each reason she could have for doing this. */
  say: (m: Record<Motive, string>) => string;
}

export function cx(s: SaveState): Cx | null {
  const c = s.cuckold;
  const p = c ? s.people[c.her] : undefined;
  if (!c || !p) return null;
  const pr = s.player.pronouns ?? "he/him";
  return {
    s, p, c, b: c.bull,
    n: p.name,
    addr: s.player.address || (pr === "she/her" ? "Mistress" : "Master"),
    him: c.bull?.short ?? "him",
    hole: p.body.vagina !== null ? "pussy" : "ass",
    pet: pr === "she/her" ? "Good girl" : "Good boy",
    likeYou: pr === "he/him" ? "a man like you" : pr === "she/her" ? "a woman like you" : "someone like you",
    say: (m) => m[c.motive],
  };
}

export interface CuckOption {
  id: string;
  label: string;
  /** One line under the label: what it is, not what it does to the numbers. */
  hint?: string;
  /** Why you can't, if you can't. */
  locked?: (x: Cx) => string | null;
  run: (x: Cx) => { text: string; next?: string; end?: Ending; shift?: Shift };
}

export interface CuckBeat {
  id: string;
  title: string;
  /** Weeks after the last chapter before this one can be read. */
  gap: number;
  /** Skip this chapter when it doesn't fit (her body, what's already happened). */
  skip?: (x: Cx) => boolean;
  text: (x: Cx) => string;
  options: (x: Cx) => CuckOption[];
}

const pick = <T,>(x: Cx, xs: T[]): T => xs[(x.c.nights + x.s.arcology.week + x.n.length) % xs.length];

/** Calling it off, before he's had her. After that it isn't yours to call off. */
const stop = (label = "End it here. Send him away for good"): CuckOption => ({
  id: "stop", label, hint: "she stays yours, and you never find out",
  run: (x) => ({
    end: "called_off",
    shift: { pull: 6, her: x.c.motive === "for_her" ? "neglect" : "kindness", size: 2 },
    text: x.say({
      for_you: `You tell her it's over before it started. ${x.n} lets out a breath she's been holding since the day you asked, and then, to her own surprise, starts crying. "Thank you," she says, again and again, into your shirt. "Thank you, ${x.addr}."`,
      for_her: `You tell her it's over. ${x.n} says "Yes, ${x.addr}" in exactly the right voice, and goes to bed. You hear her tablet chime once in the dark, and you hear her not answer it. You don't ask what it said.`,
      spite: `You tell her it's over. ${x.n} smiles at you like you've proved something. "Of course, ${x.addr}," she says. "You'd never have managed to watch anyway." She's still smiling when she leaves the room.`,
    }),
  }),
});

const kindLine: Record<BullKind, (b: Bull, n: string) => string> = {
  broker: (b) => `${b.name} is ${b.age}, silver at the temples, and wears a watch worth more than most of your household. He has tried to buy her from you twice. Both times he smiled when you said no, like a man who can wait.`,
  brute: (b, n) => `${b.name} is ${b.age} and runs a shift on your security detail. He is built like a door, he has a scar through one eyebrow, and every time ${n} walks past the guard post he stops talking and watches her go.`,
  boy: (b) => `${b.name} is ${b.age}, works the cargo locks down on the docks, and is beautiful in the way men only are for a few years. He has nothing you have. Except, you suspect, the one thing.`,
};

/* ── the chapters ────────────────────────────────────────────────────────────────────────────── */

export const BEATS: CuckBeat[] = [
  {
    id: "ask", title: "Asking Her", gap: 0,
    text: (x) => `You call ${x.n} up to the penthouse late, when the building has gone quiet. She stands where she always stands and waits to find out what you want.

You tell her. There is going to be a man. Not you. You want her to go to him, let him have her, and come back and tell you about it. You want to watch, some nights. You want to see what she turns into.

${x.say({
  for_you: `She doesn't answer for a long time. She's looking at your face for the joke, and not finding it. "You want someone else to... with me. And you want to watch." Her voice goes small. "Did I do something wrong, ${x.addr}?" You tell her no. She swallows. "Then if it's what you want, I'll do it. For you. Only because it's you."`,
  for_her: `Something crosses her face before she can stop it, and it isn't fear. She wets her lips. "Another man," she says. Then, too quickly: "Who?" You both hear how fast she asked. She looks at the floor and adds, "${x.addr}," a beat too late.`,
  spite: `She laughs. It's the first time you've heard her laugh in weeks. "You want to give me to someone who'll actually..." She stops herself, still smiling. "Yes, ${x.addr}. Whatever you want, ${x.addr}. I'll be very, very good for him."`,
})}

There are three names on your tablet. You turn it so she can see.`,
    options: (x) => (["broker", "brute", "boy"] as BullKind[]).map((k): CuckOption => {
      const b = makeBull(x.s, k);
      return {
        id: k,
        label: k === "broker" ? `${b.name}, the broker who's tried to buy her` : k === "brute" ? `${b.name}, from your security detail` : `${b.name}, a dock hand half your age`,
        hint: k === "broker" ? "older, rich, patient; he'll take his time taking her" : k === "brute" ? "big, crude, and he's wanted her for months" : "young and beautiful, and he doesn't know what he has",
        run: (y) => {
          y.c.bull = b;
          const her = y.say({
            for_you: `${y.n} looks at his picture for a long time. "Him," she repeats. "All right." She doesn't look at you again until she's left the room.`,
            for_her: `${y.n} looks at his picture a little too long. When you reach to take the tablet back she doesn't let go of it straight away.`,
            spite: `${y.n} looks at his picture, then at you, then at his picture. "Oh, ${y.addr}," she says softly. "He's perfect."`,
          });
          return { next: "dinner", shift: { fall: 4, yielded: 5, arousal: y.c.motive === "for_her" ? 15 : 5 }, text: `${kindLine[k](b, y.n)}\n\nYou send him a message. He answers in under a minute: a time, a place, and "I'll take good care of her."\n\n${her}` };
        },
      };
    }).concat([{ id: "never", label: "Forget I said anything", hint: "it never happened", run: (y) => ({ end: "called_off", text: `You tell her to forget it. ${y.say({ for_you: `${y.n} nods, and you watch her try to.`, for_her: `${y.n} nods. She doesn't forget it.`, spite: `${y.n} nods, amused. "Of course, ${y.addr}."` })}` }) }]),
  },

  {
    id: "dinner", title: "Dinner for Three", gap: 1,
    text: (x) => `${x.b!.short} arrives exactly on time. He shakes your hand and holds it a moment too long, looking past you at ${x.n} while he does it. "So this is her," he says. "She's lovelier than her picture."

You put her between you at the table. For the first course it's almost ordinary. He talks business with you and lets her pour his wine. By the second course you notice that ${x.n} has stopped eating.

His left hand is under the table. You can't see it. You can see her face.

${x.say({
  for_you: `She looks straight at you, eyes wide, asking whether this is all right. Under the tablecloth her knees are pressed together and his hand is between them anyway. You don't say anything, and after a while her knees stop pressing.`,
  for_her: `Her eyes have gone half-closed. Her fork is still in her hand, resting on the plate. Then she remembers you're there and looks over, guilty, flushed to the throat, and doesn't ask him to stop.`,
  spite: `She holds your eyes while she does it. She shifts in her chair, slowly, and you understand from the shape of the tablecloth that she has just opened her legs for him. She doesn't look away from you once.`,
})}

"She's wasted on you, you know," ${x.b!.short} says pleasantly, cutting his meat one-handed. "${x.likeYou[0].toUpperCase()}${x.likeYou.slice(1)} never knows what to do with a girl like this." He smiles. "That's why you called me."`,
    options: () => [
      { id: "lap", label: "Tell her to sit in his lap", hint: "give her to him at your own table",
        run: (x) => ({ shift: { fall: 12, yielded: 10, pull: -5, arousal: 30, memory: { text: `At dinner the owner told ${x.n.split(" ")[0]} to sit in ${x.him}'s lap, and she did`, charge: "sharp" } }, next: "kiss",
          text: `"Go on," you hear yourself say. "Sit with him."

${x.n} gets up and sits sideways on his thigh like she's done it a hundred times. He feeds her from his own fork. By dessert his hand is inside her dress, she is breathing through her mouth, and her hips are moving in tiny circles she doesn't seem to know about.

He stops right before she gets there. He lifts her off his lap, kisses her once on the forehead, and stands up. "Not tonight. I'll have her properly next time. Let her lie awake thinking about it."

That night, in your bed, she's wetter than you have ever made her. Neither of you says why.` }) },
      { id: "eat", label: "Say nothing and keep eating", hint: "let it happen under the tablecloth",
        run: (x) => ({ shift: { fall: 9, yielded: 7, arousal: 25 }, next: "kiss",
          text: `You keep eating. So does he, one-handed, talking about freight prices.

${x.n} comes at your table. She does it almost silently, with her fork still in her hand and her other hand over her mouth, her whole body going stiff and then loose. A glass rocks and doesn't fall.

"She's quiet when she comes," ${x.b!.short} says, wiping his fingers on his napkin. "Did you know that?" He looks at you with real curiosity. "No. I don't suppose you did."` }) },
      { id: "hand", label: "Move his hand off her", hint: "not yet, not like this",
        run: (x) => ({ shift: { pull: 6, fall: 3, her: x.c.motive === "for_you" ? "kindness" : undefined, size: 2 }, next: "kiss",
          text: `You reach under the table, take his wrist, and put his hand back on his own knee.

He takes it well. Much too well. "Of course," he says. "Your house." He finishes his wine, thanks you for dinner and leaves.

${x.say({
  for_you: `${x.n} sags with relief and squeezes your hand under the table. But when you kiss her goodnight she's still flushed, and still wet, and she won't meet your eyes.`,
  for_her: `${x.n} is quiet for the rest of the night. Before bed she goes and stands at the window a long time, looking down at the residential tier where he lives.`,
  spite: `"Coward," ${x.n} says, very softly, when he's gone. Then: "Sorry, ${x.addr}. I meant, thank you, ${x.addr}."`,
})}` }) },
      stop(),
    ],
  },

  {
    id: "kiss", title: "Just a Kiss", gap: 1,
    text: (x) => `You let him take her for a drink in the lounge on the residential tier. A drink, you said. Nothing more.

You're still up when they come back. Through the glass of the penthouse door you watch him stop her on the threshold. He takes her chin between his finger and thumb, tilts her face up, and kisses her, slowly, the way you never had the patience to.

Her hand comes up to his chest to push him away. It stays there. Then it closes into a fist in his shirt and pulls him closer.

It goes on a long time. When she finally comes in her lipstick is gone and her eyes are wet and shining. "He kissed me," she says, as if you hadn't been watching.

${x.say({
  for_you: `"I'm sorry. I didn't mean to... I didn't know it would feel like that." She looks frightened, of herself more than of you.`,
  for_her: `She touches her lips with two fingertips, like she's checking they're still there.`,
  spite: `"You were watching," she says. It isn't a question. She licks her lower lip, slowly, so you'll see.`,
})}`,
    options: () => [
      { id: "how", label: "Ask her how it felt", hint: "make her say it",
        run: (x) => ({ shift: { fall: 8, yielded: 9, arousal: 20 }, next: "first",
          text: `"Tell me how it felt."

She hesitates. "Different."

"Different how."

${x.say({
  for_you: `"Like he'd already decided," she whispers. "Like he wasn't asking. You always ask, ${x.addr}. He just... took it." She looks up at you. "I liked it. I'm sorry. I liked it."`,
  for_her: `"Like he knew exactly what he was doing to me." She laughs a little, breathless. "My knees went. Actually went. I didn't know that was a real thing."`,
  spite: `"Better," she says simply. "He kisses like he means it." She waits to see what that does to your face, and enjoys it.`,
})}` }) },
      { id: "taste", label: "Kiss her yourself, and taste him on her", hint: "",
        run: (x) => ({ shift: { fall: 6, yielded: 13, arousal: 15 }, next: "first",
          text: `You pull her in and kiss her. Her mouth tastes of his whisky.

${x.say({
  for_you: `She kisses you back, hard, almost desperate, like she's trying to wipe him off on you. It doesn't work, and you can both tell it doesn't.`,
  for_her: `She kisses you back politely. Halfway through, her eyes drift to the door he left by.`,
  spite: `She lets you, and when you break off she says, "He's a better kisser than you," in the same voice she'd use to tell you it's raining.`,
})}` }) },
      { id: "watch", label: "Say nothing. Send her to bed", hint: "",
        run: (x) => ({ shift: { fall: 6, yielded: 6 }, next: "first",
          text: `You don't say anything. ${x.n} waits for you to, then goes to bed.

At two in the morning you hear her through the wall. Very quietly, with her face in the pillow, she is touching herself. Near the end she says one word, muffled. It isn't your name.` }) },
      stop(),
    ],
  },

  {
    id: "first", title: "The Door Left Open", gap: 1,
    text: (x) => `He books a suite on the residential tier and sends you the code to the door, with one line: "Bring her at nine. There's a chair for you."

There is. It's by the window, at the foot of the bed, angled so you'll see everything.

He undresses her slowly while you sit there, and he talks to you the whole time like you're a guest he's showing round. "Look at that. Look at how she shakes. You never noticed she does that, did you." ${x.n} stands in the middle of the room with her arms at her sides and lets him.

Then he undresses, and ${x.n} sees his cock for the first time.

It's ${bullDickWords(x.b!)}. ${hasCock(x.s) ? `She looks at it, then, without meaning to, at you, at the front of your trousers, at ${yourDickWords(x.s)} she knows so well. Then back at him.` : `She looks at it, then at you, then back at it.`} ${x.say({
  for_you: `Her face goes pale. "${x.addr}," she whispers, "I don't think..." "You'll take it," ${x.b!.short} tells her, gently. "They always do."`,
  for_her: `Her lips part. She doesn't say anything. She doesn't need to.`,
  spite: `She smiles at you over his shoulder. "Oh," she says. "Oh, ${x.addr}. Look at him."`,
})}

He lays her back on the bed. ${x.p.body.vagina !== null && x.p.body.hymen ? `She's a virgin. He finds that out when he pushes into her, and so do you, from the sound she makes and the little smear of red on the sheet. He looks over at you with real delight. "You saved her for me," he says. "That's very thoughtful."` : `The first push makes her cry out, a sound you have never once got out of her.`}

At first she looks at you. She looks at you the whole time he's working himself into her, eyes wide and wet, like you're the only thing keeping her afloat. Then he finds a rhythm, and somewhere in the middle of it she stops looking at you.

By the end she has her heels locked behind his back and she's saying his name, "${x.him}, ${x.him}, ${x.him}," over and over, like it's the only word she has left. He finishes deep in her ${x.hole} and holds himself there, and she comes again just from that.

He rolls off her, breathing hard, and nods at her sprawled and dripping on the sheet. "Your turn, if you still want her," he says. "She's nice and warmed up."`,
    options: () => {
      const firstNight = (x: Cx): Shift["memory"] => ({ text: `${x.him} took ${x.n.split(" ")[0]} for the first time while the owner watched from a chair`, importance: 9, charge: x.c.motive === "for_you" ? "sharp" : "bright", core: true });
      const after = (x: Cx) => {
        x.c.seeing = true;
        takenBy(x.s, x.p);
        if (hasWomb(x.p)) seed(x.s, x.p, 2);
      };
      return [
        { id: "chair", label: "Stay in the chair and watch him dress", hint: "the full cuck",
          run: (x) => { after(x); return { next: "home", shift: { fall: 18, yielded: 14, night: true, pull: -8, relax: x.c.motive === "for_you" ? -1.5 : 1, memory: firstNight(x) },
            text: `You stay in the chair. You don't touch her. You watch him dress, slowly, while she lies there and watches him too.

At the door he stops and ruffles her hair like she's a dog that did a trick. "Same time next week," he tells her, not you.${hasWomb(x.p) ? ` Then, to you, as an afterthought: "I didn't use anything, by the way. Nobody told me to."` : ""}

${x.n} doesn't look at you until he's gone. When she does, ${x.say({ for_you: `her face crumples. "Was that what you wanted?" she asks. "Please tell me that was what you wanted."`, for_her: `she looks almost sorry for you.`, spite: `she stretches, slow and lazy, and says, "Thank you, ${x.addr}. Really. Thank you."` })}` }; } },
        { id: "seconds", label: "Take your turn after him", hint: "sloppy seconds",
          run: (x) => { after(x); return { next: "home", shift: { fall: 15, yielded: 18, night: true, pull: -4, memory: firstNight(x) },
            text: `You get up out of the chair. ${x.n} lies there and lets you.

${hasCock(x.s) ? `She's loose and slick with him. You slide into her ${x.hole} with no resistance at all, into his warmth, through his cum. ${yourDick(x.s) <= x.b!.dick - 3 ? `You can barely feel the sides of her. She can barely feel you; you can tell, because she doesn't make a sound.` : `It's not the same. You both feel it isn't the same.`}` : `You buckle on the strap-on and push it into her ${x.hole}, into what he left. It goes in with no resistance at all.`}

${x.say({
  for_you: `She holds you and makes the right noises and kisses your neck. It's kind. It's the kindest thing she's ever done for you, and you both know it.`,
  for_her: `She's still looking at the door he went out of. When you finish she says, "Thank you, ${x.addr}," the way she'd thank you for passing the salt.`,
  spite: `Halfway through she laughs. She covers her mouth, but she laughs. "Sorry," she says. "Sorry. It's just. After him."`,
})}` }; } },
        { id: "listen", label: "Leave the room, and listen through the door", hint: "",
          run: (x) => { after(x); return { next: "home", shift: { fall: 15, yielded: 8, night: true, pull: -6, memory: firstNight(x) },
            text: `You can't stay. You go out into the corridor and close the door behind you, and you stand there with your forehead against it.

You hear everything anyway. The bed. Him, laughing at something. Her, saying "please," and then "more," and then a noise that goes on and on. Then quiet. Then the bed again.

She comes out an hour later with her dress on inside out. She looks at you leaning against the wall and stops. "You heard," she says. ${x.say({ for_you: `She starts to cry. "I'm sorry. I'm so sorry. It's what you wanted. It's what you wanted, isn't it?"`, for_her: `She doesn't apologise.`, spite: `"Good."` })}` }; } },
        { id: "stop", label: "Stop it, now, before he finishes undressing", hint: "while she's still only yours",
          run: (x) => ({ end: "called_off", shift: { pull: 8, her: x.c.motive === "for_you" ? "kindness" : "promise_broken", size: x.c.motive === "for_you" ? 4 : 2 },
            text: `You stand up and say "Stop." Both of them turn and look at you.

${x.b!.short} puts his shirt back on without hurrying. "Your loss," he says, and lets himself out.

${x.say({
  for_you: `${x.n} pulls her dress up over her shoulders and comes to you and holds on, shaking. "I would have," she says into your chest. "For you. But I'm so glad you didn't make me."`,
  for_her: `${x.n} dresses without a word. In the lift going back up she stands as far away from you as the lift allows. She was so close, and you took it away, and she's going to remember that.`,
  spite: `${x.n} laughs until she has to sit down on the bed. "You couldn't," she says. "You couldn't even watch."`,
})}` }) },
      ];
    },
  },

  {
    id: "home", title: "She Comes Home Late", gap: 1,
    text: (x) => `She sees him on her own nights now. You agreed to it, more or less. Tonight it's past three when the lift opens.

${x.n} comes in barefoot with her shoes in her hand. She's wearing his shirt, and nothing under it that you can see. She smells of him. There's a mark on her throat the size of his mouth, and another on the inside of her thigh, and she walks the way women walk the morning after a very long night.

She stops when she sees you sitting up waiting.

${x.say({
  for_you: `"You waited up," she says, and her face does something complicated, guilt and tenderness and something else underneath that she doesn't want you to see. "You didn't have to, ${x.addr}."`,
  for_her: `"Oh," she says. "You're up." She sounds like she'd forgotten you lived here.`,
  spite: `"Aww," she says. "Did you wait up for me?" She comes over, bends down, and kisses your forehead. Her mouth smells of him.`,
})}`,
    options: () => [
      { id: "tell", label: "Make her tell you everything", hint: "every detail",
        run: (x) => ({ shift: { fall: 7, yielded: 11, arousal: 25 }, next: "call",
          text: `"Sit down. Tell me. All of it."

She sits on the arm of the chair, still in his shirt, and tells you.

He fucked her against the window of his apartment, with the whole residential tier below her and her breath fogging the glass. He made her ride him and told her not to stop, and when she said she couldn't he held her hips and made her. He made her ${x.c.fall >= 40 ? "say it out loud, in his ear, that he's bigger than you. That he's better than you." : "tell him what you're like in bed. She told him. He laughed."}

"Is it true?" you ask.

${x.say({
  for_you: `She looks at you for a long time, and you see her decide not to lie to you, because she loves you. "Yes," she says. "I'm sorry, ${x.addr}. It's true."`,
  for_her: `"Yes," she says, without having to think about it. Then, gently: "Does that matter?"`,
  spite: `"Every word," she says, and smiles.`,
})}` }) },
      { id: "clean", label: "Kneel, and clean his cum out of her", hint: "what a cuck does",
        locked: (x) => x.c.yielded >= 20 ? null : "you haven't gone that far yet",
        run: (x) => ({ shift: { fall: 8, yielded: 20, arousal: 30, pull: x.c.motive === "for_you" ? 2 : -6, memory: { text: `The owner knelt and licked ${x.him}'s cum out of ${x.n.split(" ")[0]}`, importance: 8, charge: x.c.motive === "spite" ? "bright" : "sharp", core: true } }, next: "call",
          text: `You get down on your knees in front of her.

She understands before you've finished moving. ${x.say({
  for_you: `"${x.addr}, no, you don't have to..." She stops. She opens his shirt. Her thighs are trembling.`,
  for_her: `She lets out a little breath that's almost a laugh, and opens his shirt for you.`,
  spite: `"Oh, ${x.addr}." She sits back in the chair, spreads her legs over the arms, and opens his shirt. "Go on, then. All of it."`,
})}

She's swollen and open from him and full of him. You put your mouth on her ${x.hole} and his cum runs out onto your tongue, thick and salty, more than you'd have thought, and she shivers and puts her hand on the back of your head and holds you there.

${x.say({
  for_you: `When you're done she pulls you up and kisses you on the mouth, tasting him, and whispers, "I love you. I love you. I don't understand any of this, but I love you."`,
  for_her: `When you're done she says, "Good," softly, and then, more softly, as if it surprised her: "${x.pet}." She doesn't take it back.`,
  spite: `When you're done she pats your cheek. "I'll tell him you liked it," she says.`,
})}` }) },
      { id: "reclaim", label: "Take her to bed and remind her who owns her", hint: "",
        run: (x) => ({ shift: { pull: x.c.fall >= 50 ? 2 : 6, fall: 2 }, next: "call",
          text: `You take her by the wrist, take her to your bed, and pull his shirt off her.

${hasCock(x.s) ? `She's still loose from him. You can feel it, and she can feel you feeling it.` : `She takes the strap-on easily. Too easily.`} ${x.c.fall >= 50
  ? `She moans in the right places. She's got good at it. You can tell exactly which moans are for you and which ones she's saving, and it takes you the whole time to admit that none of them are real.`
  : x.say({
    for_you: `She clings to you, and comes, and cries a little afterwards, and says your name. You're nearly sure she means it.`,
    for_her: `She's kind about it. "It's nice," she says afterwards, stroking your hair. "It's really nice, ${x.addr}."`,
    spite: `She looks at the ceiling the whole time. Afterwards she says, "Done?" and goes to shower.`,
  })}` }) },
    ],
  },

  {
    id: "call", title: "The Call", gap: 2,
    text: (x) => `Your tablet goes at midnight. It's her. The video is off.

For a few seconds you hear only breathing, and skin on skin, and a bed knocking slowly and steadily against a wall.

"${x.addr}?" ${x.n} gasps. "He... he told me to call you."

"Tell him," says ${x.b!.short}'s voice, close behind her, unhurried.

"He's inside me," she says. Her voice keeps catching. "${x.addr}, he's inside me right now, he's so deep, he's..." She breaks off into a long, high moan that you've never heard her make, and the knocking gets faster.`,
    options: () => [
      { id: "stay", label: "Stay on the line until he finishes", hint: "",
        run: (x) => {
          const yours = x.c.pull > 20;
          return { shift: { fall: 10, yielded: 12, pull: yours ? 0 : -8, night: true, arousal: 40 }, next: "name",
            text: `You stay on.

He makes her say things. You hear him tell her what to say, low, and then you hear her say it to you. "He's bigger than you." "He fucks me better than you." "I come harder for him than I ever did for you."

Then he says, "Tell him who you belong to."

${yours
  ? `There's a pause. Then, crying, half out of her mind: "${x.addr}. I belong to ${x.addr}." And ${x.b!.short} laughs, and fucks her harder for it, until she can't say anything at all.`
  : `There's no pause. "You," she sobs, and you know from the way she says it that she isn't talking to you. "You, you, I belong to you." He groans and finishes in her, and she comes with him, screaming his name into your ear from three floors away.`}

The call ends. Nobody hung up. Her tablet just slid off the bed.` };
        } },
      { id: "him", label: "Tell her to put him on", hint: "talk to him, one to one",
        run: (x) => ({ shift: { fall: 6, yielded: 9, night: true }, next: "name",
          text: `"Put him on."

A rustle. Then ${x.b!.short}, breathing a bit harder than usual, with ${x.n} moaning softly somewhere under him. He doesn't stop.

"She's going soft on me," he says, conversational. "You know that, right? She talks about me when she's with you. She told me." A wet sound and a gasp from her. "Don't take it personally. ${x.likeYou[0].toUpperCase()}${x.likeYou.slice(1)} isn't built to keep a girl like this. You've been keeping her warm for somebody, that's all." A pause. "Want me to send her home tonight or keep her till morning?"

You hear yourself say "morning." You hear him relay it to her, and you hear her say, "Thank you, ${x.addr}," and mean it.` }) },
      { id: "hang", label: "Hang up", hint: "",
        run: (x) => ({ shift: { fall: 5, pull: x.c.motive === "for_you" ? 3 : -3 }, next: "name",
          text: `You hang up.

She calls back four times in the next ten minutes. You don't answer. Then she stops calling.

${x.say({
  for_you: `In the morning she's waiting outside your door with her eyes red. "He made me," she says. "I didn't want to hurt you. I swear I didn't want to hurt you." You believe her. That's almost worse.`,
  for_her: `In the morning she doesn't mention it. Neither do you. She hums while she makes your coffee.`,
  spite: `In the morning she says, "You missed the best part," and leaves it at that.`,
})}` }) },
    ],
  },

  {
    id: "name", title: "His Name", gap: 1,
    text: (x) => `You haven't had her in your own bed for a while. Tonight you do. ${x.n} is warm and willing and says all the right things, and for a few minutes it's like before.

Then, right when she's close, she says it.

"${x.him}."

${x.c.fall >= 60
  ? `She doesn't even notice. She keeps moving under you with her eyes shut. You stop. It takes her a few seconds to open her eyes and work out why.`
  : x.say({
    for_you: `She freezes. Her eyes fly open and her hand goes to her mouth. "No. No, ${x.addr}, I didn't mean... I'm sorry, I'm sorry..."`,
    for_her: `She goes still. "Oh," she says. "Oh, I'm sorry." And under the apology, very faintly, she's still close.`,
    spite: `She opens her eyes and looks right at you. She doesn't look sorry. She looks like she was waiting to see whether you'd noticed.`,
  })}`,
    options: () => [
      { id: "forgive", label: "Hold her. Tell her it's all right", hint: "",
        run: (x) => ({ shift: { pull: x.c.motive === "spite" ? 1 : 6, yielded: 8, her: "kindness", size: 3 }, next: "bed",
          text: `You hold her and tell her it's all right. ${x.say({
            for_you: `She cries against you for a long time. "I still love you," she says. "I love you so much. I just can't stop thinking about him." It's the most honest thing anyone in this building has said to you in months.`,
            for_her: `She relaxes against you, grateful. "You're so good to me," she says, and falls asleep. In her sleep, she says his name again.`,
            spite: `She lets you hold her. "You're really going to let me get away with that," she says, wondering. "God, ${x.addr}."`,
          })}` }) },
      { id: "again", label: "Make her say it again, louder, while you fuck her", hint: "",
        run: (x) => ({ shift: { fall: 10, yielded: 15, arousal: 30, pull: -5 }, next: "bed",
          text: `"Say it again."

She stares at you. "${x.addr}?"

"His name. Say it again." You start moving again. "Louder."

She does. "${x.him}." Then louder. "${x.him}. ${x.him}!" Her eyes go unfocused and her back arches and she comes harder than she has ever come for you, with her eyes shut and his name in her mouth.

Afterwards she lies there looking at the ceiling, and you can tell she isn't in this room at all.` }) },
      { id: "punish", label: "Punish her for it", hint: "she said another man's name in your bed",
        run: (x) => ({ shift: { pull: x.c.motive === "for_you" ? -5 : x.c.motive === "for_her" ? -10 : -15, fall: x.c.motive === "spite" ? 10 : 5, her: "cruelty", size: 4 }, next: "bed",
          text: `You punish her. She takes it the way she takes everything you do to her, quietly, and when you're finished she says, "Yes, ${x.addr}. Sorry, ${x.addr}."

That night she goes to ${x.b!.short}'s without asking. She doesn't come back until the evening after.

${x.say({
  for_you: `When she does, she won't tell you where she slept. She doesn't have to.`,
  for_her: `When she does, there's a bandage on her wrist where you held her, and she says he put it on for her. "He was very gentle," she says.`,
  spite: `When she does, she tells you he kissed every mark you left, one by one, and then fucked her until she forgot you'd made them.`,
})}` }) },
    ],
  },

  {
    id: "bed", title: "Your Bed", gap: 2,
    text: (x) => `"He wants to have me here," ${x.n} says. "In your bed. In your room." She's looking at her hands. ${x.say({
  for_you: `"He says you should see it in your own sheets. I said I'd ask. I can tell him no."`,
  for_her: `"I'd like that too," she adds, and then flushes, because she didn't mean to say that part out loud.`,
  spite: `"I told him you'd say yes," she adds. "You will, won't you?"`,
})}${hasCock(x.s) ? `

She holds something out. It's a small steel cage, a cock cage, with a padlock the size of your thumbnail. "And he says you should wear this. While he's here. He'll keep the key."` : ""}`,
    options: () => [
      { id: "chair", label: "Sit in the chair at the foot of your own bed", hint: "",
        run: (x) => { takenBy(x.s, x.p); return { shift: { fall: 12, yielded: 15, night: true, pull: -8 }, next: "seed",
          text: `He comes up at ten. He walks round your room picking things up and putting them down, then strips ${x.n} in the middle of it and takes her on your sheets, in your bed, with her head on your pillow.

She comes twice before he does. The second time she grabs your pillow and bites it. When he finishes in her he stays lying on your side of the bed, one arm behind his head, with her curled against him.

"Good bed," he says to you. "Firm." ${x.n} giggles against his chest.

You sleep on the sofa. In the morning the sheets smell of both of them, and you don't have them changed for three days.` }; } },
      { id: "cage", label: "Put on the cage. Give him the key", hint: "",
        locked: (x) => hasCock(x.s) ? null : "you don't have a cock to lock",
        run: (x) => { takenBy(x.s, x.p); x.c.caged = true; return { shift: { fall: 12, yielded: 24, night: true, pull: -10, arousal: 25, memory: { text: `The owner put on a cock cage and gave ${x.him} the key, so ${x.him} could have ${x.n.split(" ")[0]} in the owner's own bed`, importance: 9, charge: x.c.motive === "for_you" ? "sharp" : "bright", core: true } }, next: "seed",
          text: `You put it on in front of her. It's cold, and small, and when the lock clicks shut ${x.n} lets out a little breath.

${x.b!.short} arrives, holds out his hand, and she puts the key in it. He hangs it on a chain round his neck, where she'll see it bouncing on his chest the whole time he's on top of her.

He takes her in your bed. You sit in the chair with your cock straining against steel, uselessly, the entire time. ${x.say({
  for_you: `Every so often she looks over at you, at your lap, and her face goes soft with something that looks like pity and something that looks like love, and she comes anyway.`,
  for_her: `She looks over once, at the cage, and you watch her decide she likes it. After that she doesn't look at you again.`,
  spite: `She keeps looking at the cage. Every time she does, she laughs and comes a little harder.`,
})}

In the morning he takes the key with him. "She can have it back when she asks nicely," he tells you. "Not before."` }; } },
      { id: "no", label: "Refuse. Not in your bed", hint: "",
        run: (x) => ({ shift: { pull: x.c.motive === "for_you" ? 6 : -4, yielded: -5, fall: 4 }, next: "seed",
          text: `"No. Not here."

${x.say({
  for_you: `${x.n} nods, and you can see she's relieved, and a little ashamed of being relieved. She goes to him at his place instead.`,
  for_her: `${x.n} nods. That night she goes to him instead, and doesn't come back until the following afternoon, and she's wearing a new dress you didn't buy.`,
  spite: `${x.n} shrugs. "He said you'd say that." She goes to him instead. She sends you a photograph at four in the morning, of his bed, which is bigger than yours.`,
})}` }) },
    ],
  },

  {
    id: "seed", title: "Not Yours", gap: 1,
    skip: (x) => !hasWomb(x.p) || x.p.womb.fetuses.length > 0 || x.p.womb.sterile,
    text: (x) => `${x.b!.short} asks to see you alone. He gets straight to it, like a man buying freight.

"I've never worn anything with her. You never asked me to." He lets that sit. "I want to put a baby in her. Mine. Not some maybe-yours, maybe-mine. Mine." He spreads his hands. "She wants it too. Ask her."

You ask her. ${x.say({
  for_you: `${x.n} looks at the floor for a long time. "I'll do what you want, ${x.addr}," she says at last. "But if you're asking what I want..." She doesn't finish. Her hand has gone to her belly without her noticing.`,
  for_her: `${x.n} doesn't even try to hide it. "Yes," she says. "Please. Please, ${x.addr}. I want his baby."`,
  spite: `${x.n} smiles. "Imagine it," she says. "His baby, in your house, calling you ${x.addr}."`,
})}`,
    options: () => [
      { id: "yes", label: "Let him breed her", hint: "",
        run: (x) => { x.c.breeding = "yes"; x.p.womb.contraceptives = false; const took = seed(x.s, x.p, 6); return { shift: { fall: 12, yielded: 15, pull: -10, night: true, her: x.c.motive === "for_her" ? "recognition" : undefined, size: 4 }, next: "offer",
          text: `You say yes. He takes her that same night, and the next, and the next, and he doesn't let a drop of it out of her. He has her lie with her hips up on a pillow afterwards while he strokes her stomach and talks to it.

${took ? `Three weeks later ${x.n} comes to find you with a test strip in her hand. She doesn't need to say anything. It's his.` : `It doesn't take straight away. He isn't worried. "We'll keep at it," he says, and ${x.n} smiles at him like he's promised her something.`}` }; } },
      { id: "hers", label: "Leave it to her", hint: "",
        run: (x) => { x.c.breeding = "hers"; return { shift: { fall: 6, yielded: 8 }, next: "offer",
          text: `"It's up to her," you tell him.

${x.say({
  for_you: `${x.n} looks at you for a long time, waiting for you to decide for her. You don't. Eventually she nods, slowly, and you understand that she'll let him, a little more every month, until she doesn't remember deciding.`,
  for_her: `${x.n} doesn't need any more time to think about it. "Yes," she says, to him, not you.`,
  spite: `${x.n} laughs. "Then yes," she says. "Obviously yes."`,
})}` }; } },
      { id: "no", label: "No. Put her on contraceptives", hint: "",
        run: (x) => { x.c.breeding = "no"; x.p.womb.contraceptives = true; return { shift: { pull: x.c.motive === "for_you" ? 5 : -8, her: x.c.motive === "for_you" ? undefined : "promise_broken", size: 2 }, next: "offer",
          text: `"No. She goes on the pill. Tonight."

${x.b!.short} shrugs. "Your property." ${x.say({
  for_you: `${x.n} takes the first pill in front of you. Afterwards she holds your hand for a while without saying anything.`,
  for_her: `${x.n} takes the pill in front of you, and her eyes are wet, and she doesn't look at you.`,
  spite: `${x.n} takes the pill in front of you. "Fine," she says. "There's always later."`,
})}` }; } },
    ],
  },

  {
    id: "offer", title: "His Offer", gap: 2,
    text: (x) => {
      const price = offerPrice(x);
      const close = x.c.pull >= 20;
      const gone = x.c.pull <= -20;
      return `${x.b!.short} sits across your desk from you, the way he sat across your table the first night. Except ${x.n} isn't standing behind your chair. She's standing behind his${gone ? `, with her hand on his shoulder` : ""}.${pregnantByHim(x.s, x.p) ? ` ${x.p.womb.weeks >= 12 ? "She's showing now." : "She's carrying his child, and everyone in the room knows it."} Every so often he reaches back without looking and puts his hand on her belly.` : ""}

"I'll be straight with you," he says. "I want her. I'll pay ¤${price.toLocaleString()} for her papers, which is more than she's worth to anyone but me." He shrugs. "Or keep the papers. I don't need them. She already knows whose she is."

${close
  ? `${x.n} is looking at you. She's been looking at you since you sat down. Whatever you decide, she's waiting for you to decide it.`
  : gone
    ? `${x.n} isn't looking at you. She's looking at the top of his head, the way she used to look at you, a long time ago.`
    : `${x.n} looks from him to you and back, and you can't tell which of you she's hoping for. Maybe she can't either.`}

${x.c.nights} nights. That's how many she's spent with him since you first asked her.`;
    },
    options: () => [
      { id: "sell", label: "Sell her to him", hint: "she's his, on paper and in every other way",
        run: (x) => {
          const price = offerPrice(x);
          const before = x.s.arcology.cash;
          sell(x.s, x.p);
          // He paid his own price, not the market's.
          x.s.arcology.cash = before + price;
          x.p.exit_note = `sold to ${x.b!.name} for ¤${price.toLocaleString()}`;
          return { end: "sold", text: `You sign. He transfers the money while you're still holding the pen.

${x.say({
  for_you: `${x.n} comes round the desk and kisses you once, on the mouth, very softly. "Thank you for everything," she says. "I mean it." Then she goes back and takes his hand.`,
  for_her: `${x.n} doesn't come round the desk. She mouths "thank you" at you over his shoulder, and she's already smiling at him before she's finished.`,
  spite: `${x.n} leans down and says, so only you can hear, "You were never going to keep me." Then she follows him out.`,
})}

The lift doors close on the two of them. You sit in your office with ¤${price.toLocaleString()} and the smell of her perfume, the one he bought.` };
        } },
      { id: "share", label: "Keep her, and keep sharing her", hint: "nothing changes; she goes on spending her nights with him",
        run: (x) => ({ end: "shared", shift: { yielded: 8 },
          text: `"She stays mine," you tell him. "And you keep seeing her."

He smiles like that's the answer he expected. "Suits me." He stands, kisses ${x.n} on the mouth in front of you, and leaves.

So it goes on. She's yours on paper. Most nights she's his. ${x.say({
  for_you: `She comes back to you in the mornings, every time, and curls up against you, and tells you she loves you. You believe her. You've decided to.`,
  for_her: `She's happy. You can see it on her. It just isn't anything you did.`,
  spite: `She thanks you very prettily every time she goes out to him. She has never once forgotten.`,
})}` }) },
      { id: "his", label: "Give her to him in everything but the papers", hint: "you keep her on your books; she's his, and you serve them",
        locked: (x) => x.c.yielded >= 50 ? null : "you haven't gone that far",
        run: (x) => ({ end: "his", shift: { yielded: 20, fall: 15, pull: -15, her: x.c.motive === "spite" ? "recognition" : undefined, size: 5, memory: { text: `The owner gave ${x.n.split(" ")[0]} to ${x.him} in all but name, and agreed to serve the two of them`, importance: 10, charge: "bright", core: true } },
          text: `"Keep your money," you tell him. "She's yours. Keep her here. I'll keep her papers and you'll keep her."

He looks at you for a long moment, and then he laughs, warm and genuinely pleased. "Well," he says. "Well, well."

${x.n} comes round the desk. She stands over your chair and looks down at you, and her face is different, the way it might be if you were somebody she used to know. ${x.say({
  for_you: `"Is this really what you want?" she asks you, very gently. You nod. She strokes your hair. "All right," she says. "Then I'll look after you. Both of us will."`,
  for_her: `"You'll make the bed for us," she says. Not a question. "And you'll wait up." You nod. She smiles at you, kindly, the way you'd smile at a pet.`,
  spite: `"Say it," she says. "Say whose I am." You say it. She closes her eyes like she's tasting it. "Again," she says.`,
})}

He moves into the room next to yours. Her nights are all his now. You change their sheets in the mornings.` }) },
      { id: "back", label: "Take her back. It's over", hint: "if she'll still come",
        run: (x) => {
          if (x.c.pull >= 0) return { end: "reclaimed", shift: { pull: 15, her: x.c.motive === "for_you" ? "promise_kept" : "kindness", size: 5, memory: { text: `The owner took ${x.n.split(" ")[0]} back from ${x.him}`, importance: 9, charge: "warm", core: true } },
            text: `"No," you tell him. "She's mine. It's over."

${x.b!.short} looks at ${x.n}. She doesn't move from behind his chair, for one second, two. Then she walks round the desk and stands behind yours.

${x.say({
  for_you: `She puts her hand on your shoulder. It's shaking. "Thank you," she whispers. "I didn't think you'd ever ask."`,
  for_her: `She puts her hand on your shoulder. She doesn't look at him again. It costs her something not to, and you can see exactly what.`,
  spite: `She puts her hand on your shoulder, and squeezes, hard. "You surprised me," she says, low. "Don't get used to it."`,
})}

${x.b!.short} shrugs and stands. "If you change your mind," he says to her, not you. Then he's gone.` };
          return { end: "lost", shift: { her: "promise_broken", size: 4, pull: -10, memory: { text: `The owner took ${x.n.split(" ")[0]} away from ${x.him} after she'd already given herself to him`, importance: 9, charge: "cold", core: true } },
            text: `"No," you tell him. "She's mine. It's over."

${x.n} doesn't move from behind his chair.

You say her name. She flinches. Then she comes round the desk, because you own her, and that's what owned women do. She stands behind your chair. She doesn't put her hand on your shoulder.

${x.b!.short} stands, buttons his jacket and looks at her a long moment. "I'll see you," he says. He doesn't say it to you.

She's yours again. She's back in your bed, and she says "yes, ${x.addr}," and she does everything she's told. But she looks at the lift every time it opens, and she says his name in her sleep for months, and she never once looks at you again the way she did before you asked her.` };
        } },
    ],
  },
];

export const BEAT_BY_ID: Record<string, CuckBeat> = Object.fromEntries(BEATS.map((b) => [b.id, b]));

export function offerPrice(x: Cx): number {
  return Math.round(valuePerson(x.s, x.p) * (1.3 + Math.max(0, -x.c.pull) / 200) / 100) * 100;
}

/* ── reading and answering ───────────────────────────────────────────────────────────────────── */

/** The chapter that's next, skipping any that don't fit her. */
export function beatNow(s: SaveState): CuckBeat | undefined {
  const x = cx(s);
  if (!x || x.c.ended) return undefined;
  let b = BEAT_BY_ID[x.c.beat];
  let guard = 0;
  while (b?.skip?.(x) && guard++ < BEATS.length) {
    const i = BEATS.indexOf(b);
    b = BEATS[i + 1];
    if (b) x.c.beat = b.id;
  }
  return b;
}

export interface Answered { title: string; chose: string; text: string; ended?: Ending }

export function answerBeat(s: SaveState, optionId: string): Answered | null {
  const x = cx(s);
  const b = beatNow(s);
  if (!x || !b || x.c.due > s.arcology.week) return null;
  const o = b.options(x).find((q) => q.id === optionId);
  if (!o || o.locked?.(x)) return null;
  const w = x.c.written?.beat === b.id ? x.c.written : undefined;
  const chose = w?.labels[o.id] ?? o.label;
  const setup = w?.scene ?? b.text(x);
  const r = o.run(x);
  if (r.shift) apply(s, r.shift, `${b.title}: ${o.label}`);
  const week = s.arcology.week;
  x.c.log.push({ week, beat: b.id, title: b.title, chose, text: r.text, setup });
  delete x.c.written;
  if (r.end) {
    x.c.ended = { week, ending: r.end, text: r.text };
  } else if (r.next) {
    const nb = BEAT_BY_ID[r.next];
    x.c.beat = r.next;
    x.c.due = week + (nb?.gap ?? 1);
  }
  return { title: b.title, chose, text: r.text, ended: r.end };
}

export const ENDING_NAME: Record<Ending, string> = {
  called_off: "You called it off",
  reclaimed: "You took her back",
  lost: "You took her back, too late",
  shared: "Shared",
  his: "Hers is his; you're theirs",
  sold: "Sold to him",
  gone: "She's gone",
};

/** For the meters: 0 … 100, how much of her is still yours. */
export function yoursShare(c: CuckState): number {
  return clamp(Math.round((c.pull + 100) / 2), 0, 100);
}
