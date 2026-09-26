/**
 * THE SACRED FEET — how Podolatry comes to the arcology.
 *
 * A woman starts preaching on the lower concourse that a slave girl's feet are holy. Citizens start
 * kneeling to kiss the feet of your slaves as they pass. You decide whether to crush it, use it, or
 * make it law, and then you live with it: a slave pulls her feet away from the cane and quotes the
 * teaching back at you, the owner across the strait clips his girls' tendons to mock you, and in
 * the end there is a festival, or there isn't.
 *
 * The movement's strength before it is a doctrine is the story flag `feet_movement` (0…100), and the
 * acts that honour or profane feet move it (engine/podolatry.ts).
 */
import type { ArcDef, Ctx } from "../../engine/story";
import { ownedAdults } from "../../engine/story";
import { read } from "../../engine/obedience";
import { clamp } from "../../engine/psyche";
import { feetOf } from "../../engine/genitals";
import { adoptDoctrine, feetAxis } from "../../engine/society";
import { PODOLATRY } from "../podolatry";

const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;
const cash = (n: number) => (c: Ctx) => (c.s.arcology.cash >= n ? null : `needs ${money(n)}`);
const movement = (c: Ctx) => Number(c.flag("feet_movement") ?? 0);
const grow = (c: Ctx, n: number) => {
  const doc = c.s.arcology.doctrines[PODOLATRY.id];
  if (doc) { doc.adoption = clamp(doc.adoption + n, 0, 100); c.out.push(`Podolatry ${n >= 0 ? "spreads" : "loses ground"}`); return; }
  c.set("feet_movement", clamp(movement(c) + n, 0, 100));
  c.out.push(n >= 0 ? "the barefoot movement grows" : "the barefoot movement shrinks");
};
const adopted = (c: Ctx) => !!c.s.arcology.doctrines[PODOLATRY.id];
/** Her soles, in a few words, for the prose. */
const soles = (c: Ctx) => {
  const p = c.subj;
  if (!p) return "bare feet";
  const f = feetOf(p);
  const nails = f.toenails && f.toenails !== "bare" ? `, her toenails painted ${f.toenails}` : "";
  return `${f.soles === "soft" ? "soft, pampered" : f.soles === "calloused" ? "hard, calloused" : "bare"} feet${nails}`;
};


const feet: ArcDef = {
  id: "w_feet", title: "The Sacred Feet", kind: "world", cast: ["prophet", "rival_owner"],
  when: (s) => s.arcology.week >= 9 && ownedAdults(s).length >= 2,
  // The slave the believers fix on: whoever has the best-kept feet in the household.
  subject: (s) => ownedAdults(s).sort((a, b) => feetAxis(b) - feetAxis(a))[0],
  start: "sermon",
  beats: {
    sermon: {
      title: "A preacher on the lower concourse",
      text: (c) => `Your security chief sends you a clip from the lower concourse. A woman in a plain grey shift is standing barefoot on the rim of the fountain, talking to a crowd of maybe sixty citizens. Her name is ${c.full("prophet")}, and she has been there every evening this week.

What she is saying is simple. A slave has given up everything but her body, and the part of her body that carries her wherever she is sent is her feet. So a slave's feet are holy. They should be kept bare, washed, oiled and kissed, and nobody has the right to strike them. Not even her owner.

The clip ends with ${c.sn} crossing the concourse on an errand. She is barefoot. Three of the citizens in the crowd get down on their knees in front of her, and one of them kisses the top of her foot before she can step away. ${c.sn} stands there with her ${soles(c)}, not sure what to do, looking around for someone to tell her.`,
      options: [
        { id: "listen", label: "Go down to the concourse and hear her out yourself",
          run: (c) => { c.set("feet_movement", 15); c.like("prophet", 10);
            return { text: `You go down in the evening with two of your guards. The crowd opens up when they see who you are, and ${c.n("prophet")} stops talking and waits for you to reach the fountain.

"You own the one they knelt to," she says. "I'd like to see her feet, if you'll allow it. I'll wash them myself." She has a copper basin and a jug beside her on the fountain's rim.`, next: "audience", after: 0 }; } },
        { id: "send", label: "Send a slave barefoot through the crowd tomorrow, and watch",
          pick: { label: "Who walks through the crowd", filter: (p) => p.health.recovery_weeks <= 0 },
          run: (c, p) => { if (!p) return { text: "" }; c.set("feet_movement", 25); c.rep(150);
            const d = read(p).devotion;
            c.treat(p, "recognition", 4, "citizens knelt to kiss her feet on the concourse");
            return { text: `You send ${p.name} down to the concourse the next evening with nothing on her feet and an errand that takes her straight past the fountain.

The crowd sees her coming. By the time she's halfway across, twenty people are kneeling on the stone in two lines, and she has to walk between them. They kiss her feet as she passes: her toes, the tops of her feet, the backs of her heels. A man presses his forehead to the floor in front of her so she has to step around him.

${d > 30 ? `${p.name} comes back up to the penthouse flushed and giggling. "They were kissing my feet," she keeps saying. "All of them. Did you see?"` : d < -20 ? `${p.name} comes back up shaking and furious. "They were all over me," she says. "Like I was a thing in a church. Don't send me down there again."` : `${p.name} comes back up quiet and a little dazed, and sits on the edge of the couch rubbing the top of one foot where someone's mouth was.`}

The clip of her walk is all over the arcology by morning.`, next: "petition", after: 3 }; } },
        { id: "crush", label: "Have security clear the fountain and ban her from the concourse",
          run: (c) => { c.set("feet_movement", 5); c.set("feet_crushed", true); c.like("prophet", -30); c.standing(-1); c.security(2);
            return { text: `Your guards clear the fountain that evening. ${c.n("prophet")} doesn't resist; she lets herself be walked out of the concourse with her basin under her arm, and the crowd follows her to the service stairs.

A week later your security chief tells you the meetings haven't stopped. They've moved down into the maintenance levels, where there aren't any cameras.`, next: "petition", after: 5 }; } },
        { id: "ignore", label: "Leave it alone",
          run: (c) => { c.set("feet_movement", 12);
            return { text: `You leave it alone. ${c.n("prophet")} keeps preaching every evening, and the crowd at the fountain keeps getting bigger. Some of your citizens start taking their shoes off in the concourse.`, next: "petition", after: 4 }; } },
      ],
    },
    audience: {
      title: "The washing",
      text: (c) => {
        const p = c.subj;
        const d = p ? read(p).devotion : 0;
        return `You have ${c.sn} brought down. She sits on the rim of the fountain where ${c.n("prophet")} points, and the whole crowd goes quiet.

${c.n("prophet")} kneels on the wet stone and takes ${c.sn}'s right foot in both hands. She pours warm water over it from the jug, into the basin, and washes it slowly with her thumbs, heel to toes, then between each toe. She dries it on the front of her own shift. Then she bends down and kisses the sole, in the middle of the arch, and holds her lips there for a long moment before she does the left foot the same way.

${d > 30 ? `${c.sn} looks at you the whole time, trying not to smile, her toes curling every time ${c.n("prophet")}'s mouth touches them.` : d < -20 ? `${c.sn} sits rigid, gripping the fountain's rim, and pulls her foot back the moment it's let go.` : `${c.sn} doesn't know where to look. She watches ${c.n("prophet")}'s hands, then the crowd, then you.`}

When she's done, ${c.n("prophet")} stays on her knees and looks up at you. "I want a place on the concourse to do this every day, for any slave who's sent to me. That's all I'm asking for."`;
      },
      options: [
        { id: "grant", label: "Give her a stall on the promenade, with a basin and water",
          run: (c) => { c.cash(-1500); grow(c, 15); c.like("prophet", 25); c.standing(1);
            c.treat(c.subj, "recognition", 5, "had her feet washed and kissed before a crowd on the concourse");
            return { text: `You give ${c.n("prophet")} a corner of the promenade with a stone basin plumbed into the water supply. Within a week there is a queue there every evening: citizens bringing their own slaves to have their feet washed, and other citizens waiting to watch and kneel.`, next: "petition", after: 3 }; } },
        { id: "kneel", label: "Kneel beside her and kiss your slave's feet yourself, in front of everyone",
          run: (c) => { grow(c, 25); c.rep(500); c.set("owner_knelt", true); c.like("prophet", 40);
            c.treat(c.subj, "recognition", 9, "her owner knelt and kissed her feet in front of the whole concourse");
            const p = c.subj; if (p) { p.fame.prestige = Math.max(p.fame.prestige, 1) as 1; p.fame.why = "her owner knelt to kiss her feet on the concourse"; }
            return { text: `You get down on the wet stone next to ${c.n("prophet")}, take ${c.sn}'s foot from her, and kiss it: the ball of her foot, the arch, the pad of each toe. The crowd makes a sound you've never heard a crowd make.

${c.sn} is staring down at you with her mouth open. When you stand up, she stays sitting on the fountain as if she's forgotten how to move, and a dozen citizens push forward to kiss her feet after you.

By morning everyone in ${c.arcology} knows the owner knelt.`, next: "petition", after: 3 }; } },
        { id: "take", label: "Tell her she can wash your slaves' feet every day, as one of them",
          run: (c) => { const p = c.addSlave({ seed: "prophet", name: c.full("prophet"), age: 34, quality: 0.3, how: "gave herself to you so she could tend your slaves' feet", devoted: true });
            p.origin.background = `preached on the lower concourse that a slave's feet are holy, until she became a slave herself`;
            p.assignment = "house servant"; c.npc("prophet").status = "owned"; c.npc("prophet").person = p.id; grow(c, 10);
            return { text: `${c.n("prophet")} looks at you for a while, and then says yes. She signs herself over at the fountain, with the crowd watching.

She moves into the slave quarters that night with her basin, and the next morning every slave in your household wakes up to her kneeling at the foot of their bed with warm water.`, next: "petition", after: 3 }; } },
      ],
    },
    petition: {
      title: "The barefoot petition",
      text: (c) => `${movement(c) > 30 || c.flag("owner_knelt") ? "Half the concourse goes barefoot now." : c.flag("feet_crushed") ? "The meetings in the maintenance levels have grown." : "The barefoot crowd at the fountain is bigger every week."} A delegation of citizens comes up to the penthouse with a petition: four thousand names.

They want the arcology to make it law. A slave's feet kept bare and cared for. No slave caned on the soles, no tendons clipped, no slave made to walk on anything that will cut her. A copper basin at every fountain. ${c.flag("feet_crushed") ? `${c.n("prophet")}'s name isn't on it anywhere, but everyone knows she wrote it.` : `${c.n("prophet")} is standing at the back of the delegation, barefoot.`}

${c.sn} is serving drinks while they talk. Everyone in the room keeps glancing at her feet.`,
      options: [
        { id: "adopt", label: "Make it law: adopt Podolatry",
          need: (c) => (Object.keys(c.s.arcology.doctrines).length >= 4 ? "you already hold four future societies; drop one first" : null),
          run: (c) => { const r = adoptDoctrine(c.s, PODOLATRY.id); if (!r.ok) return { text: r.why ?? "" };
            c.s.arcology.doctrines[PODOLATRY.id].adoption = clamp(15 + movement(c) / 2, 0, 60); c.set("podolatry", true); c.rep(400); c.standing(2); c.out.push("Podolatry adopted");
            return { text: `You sign it at your desk with the delegation watching. It goes out on every screen in the arcology within the hour.

That night there are people kneeling at every fountain in ${c.arcology}, and the shoe shops on the promenade are empty. ${c.sn} goes to bed barefoot, like every other slave you own, and finds a small copper basin at the foot of it.`, next: "test", after: 3 }; } },
        { id: "house", label: "Keep your own slaves barefoot and cared for, but don't make it law",
          run: (c) => { grow(c, 6); for (const p of ownedAdults(c.s)) p.shoes = "barefoot"; c.out.push("your household goes barefoot"); c.hope(2);
            return { text: `You tell them the law stays as it is, but in your own house the slaves will go barefoot and have their feet looked after. You have the shoes collected from the slave quarters that afternoon.

The delegation leaves half satisfied. The movement goes on without the law.`, next: "test", after: 4 }; } },
        { id: "tithe", label: "Charge citizens to kneel to your slaves' feet, and keep the rest as it is",
          run: (c) => { c.set("tithe_early", true); c.cash(3000); grow(c, -4);
            return { text: `You tell the delegation you'll set up a proper place on the concourse where citizens can kiss your slaves' feet, for a fee. They look at each other. Some of them are already reaching for their wallets.

${c.n("prophet")} leaves without saying anything.`, next: "test", after: 4 }; } },
        { id: "refuse", label: "Refuse, and have the petition shredded in front of them",
          run: (c) => { grow(c, -10); c.standing(-2); c.like("prophet", -30); c.set("feet_refused", true);
            return { text: `You feed the petition into the shredder next to your desk while they watch. The delegation goes back down in silence.

${c.sn} takes the tray back to the kitchen and doesn't come out again for an hour.`, next: "test", after: 4 }; } },
      ],
    },
    test: {
      title: (c) => `${c.sn} pulls her feet away`,
      wait: (c) => ownedAdults(c.s).length >= 1,
      text: (c) => {
        const p = c.subj;
        const d = p ? read(p).devotion : 0;
        return `You have ${c.sn} brought to the lobby to be punished for dropping a tray of glasses in front of guests. The bastinado frame is set up by the window, where the citizens in the atrium below can see.

When the attendant reaches for her ankles, ${c.sn} pulls her feet back up under her and wraps her arms around them.

"No," she says. "Not my feet. ${adopted(c) ? "It's the law now. You made it the law." : "Everyone on the concourse says they're holy. You heard them."}" ${d > 30 ? `She's crying, but she's looking straight at you. "Hit me anywhere else. Please. Anywhere."` : d < -20 ? `She says it loud enough that the people in the atrium hear it, and they're already looking up.` : `Her voice is shaking. Below, a few citizens have stopped walking and are looking up at the window.`}`;
      },
      options: [
        { id: "honour", label: "Let her keep her feet; punish her another way",
          run: (c) => { grow(c, 8); c.rep(250); c.treat(c.subj, "kindness", 5, "you spared her feet from the cane because the arcology holds them sacred"); c.set("feet_spared", true);
            const p = c.subj; if (p) p.bond.fear = clamp(p.bond.fear - 5, 0, 100);
            return { text: `You tell the attendant to put the cane away. ${c.sn} gets six strokes across the backs of her thighs instead, bent over the frame, and she takes them without a sound.

Afterwards she kneels and kisses your feet without being told to. The citizens in the atrium saw the whole thing.`, next: "heretic", after: 3 }; } },
        { id: "cane", label: "Cane her soles anyway, in front of the window",
          run: (c) => { grow(c, -18); c.rep(-600); c.standing(-2); c.set("feet_sacrilege_public", true); c.rumor(`the owner caned ${c.sn}'s soles in front of the atrium`, -1);
            c.treat(c.subj, "cruelty", 8, "caned on the soles in front of the atrium after she begged you not to");
            const p = c.subj; if (p) { p.acts = p.acts ?? {}; p.acts["bastinado"] = (p.acts["bastinado"] ?? 0) + 1; p.bond.fear = clamp(p.bond.fear + 12, 0, 100); p.health.health = clamp(p.health.health - 6, -100, 100); }
            return { text: `The attendant pulls her ankles into the frame and you cane her soles yourself, twelve strokes, while the atrium watches. She screams from the third one on.

She can't walk for two days. Down on the concourse someone has painted a pair of bare footprints in red on the wall outside the penthouse elevator, and security can't find out who.`, next: "heretic", after: 3 }; } },
        { id: "kiss", label: "Tell her she can keep her feet if she kisses yours for an hour, in the window",
          run: (c) => { grow(c, 3); c.treat(c.subj, "coercion", 3, "made to kiss your feet in the lobby window for an hour instead of being caned");
            return { text: `You sit down in the chair by the window and put your feet up on the frame where hers were going to go. ${c.sn} crawls over and starts kissing them.

An hour is a long time. The crowd in the atrium grows and then gets bored and drifts away. By the end her lips are raw and she's kissing the same spot on your instep over and over, and she still doesn't stop until you tell her to.`, next: "heretic", after: 3 }; } },
        { id: "ask", label: "Send for the preacher and let her decide",
          show: (c) => c.npc("prophet").status === "around" || c.npc("prophet").status === "owned",
          run: (c) => { grow(c, 10); c.like("prophet", 20); c.treat(c.subj, "recognition", 3, "you let the preacher decide her punishment");
            return { text: `${c.n("prophet")} comes up from the concourse. She listens, looks at ${c.sn}, and then kneels and takes both her feet in her lap.

"She'll wash the feet of every slave in the house tonight," she says. "Every one. On her knees. That's her punishment." ${c.sn} does, until three in the morning.`, next: "heretic", after: 3 }; } },
      ],
    },
    heretic: {
      title: (c) => `${c.n("rival_owner")} clips ${c.his("rival_owner")} girls`,
      text: (c) => `${c.full("rival_owner")}, who owns the arcology across the strait, has put out a video. It's aimed at you.

Four of ${c.his("rival_owner")} slaves are lying face down on a surgical table in a row. ${c.He("rival_owner")} walks down the line, lifting each girl's foot and letting it drop, and then a surgeon cuts their Achilles tendons one after another while ${c.he("rival_owner")} talks about "the foot cult across the water." At the end, ${c.he("rival_owner")} puts a bare heel on one girl's back like a hunter with a trophy.

${c.arcology} has seen it. ${adopted(c) || movement(c) > 25 ? "People are furious. There are citizens weeping in the concourse." : "People are angrier than you'd expect."} A message from ${c.n("rival_owner")} arrives the same afternoon: ${c.he("rival_owner")}'s willing to sell you the four girls, "since you love their feet so much."`,
      options: [
        { id: "buy", label: "Buy the four girls and have their tendons repaired", note: "¤18,000", need: cash(18000),
          run: (c) => { c.cash(-18000); grow(c, 12); c.rep(500); c.like("rival_owner", -10);
            for (let i = 0; i < 2; i++) { const p = c.addSlave({ seed: `clipped${i}`, age: 19 + i * 3, quality: 0.4, how: `bought from ${c.full("rival_owner")} after ${c.he("rival_owner")} clipped her tendons on camera`, devoted: i === 0 }); feetOf(p).heels_clipped = true; p.health.recovery_weeks = 0; }
            c.out.push("two more of them are too far gone to save and die on the crossing");
            return { text: `The girls come across the strait on a launch. Two of them die of infection on the way; the wounds weren't dressed. The two who make it are carried off the boat and straight to your clinic.

They'll need the repair surgery, and weeks to learn to walk again. The first one, when she's put down on your penthouse floor, reaches down and touches her own heel as if she can't believe it's still there.`, next: "festival", after: 4 }; } },
        { id: "denounce", label: "Denounce him on every screen in the region",
          run: (c) => { grow(c, 10); c.rep(300); c.like("rival_owner", -30); const n = c.s.arcology.neighbours[0]; if (n) n.attitude = clamp(n.attitude - 25, -100, 100);
            return { text: `You go on the regional feed with ${c.sn} sitting at your feet, barefoot, and you talk about what ${c.n("rival_owner")} did for four minutes. You finish by lifting ${c.sn}'s foot onto your knee and kissing it on camera.

It gets more views than ${c.his("rival_owner")} video did. ${c.n("rival_owner")} doesn't reply.`, next: "festival", after: 4 }; } },
        { id: "clip", label: "Show him you don't care: clip one of your own", pick: { label: "Whose tendons are cut", filter: (p) => !feetOf(p).heels_clipped },
          run: (c, p) => { if (!p) return { text: "" }; feetOf(p).heels_clipped = true; p.health.recovery_weeks = Math.max(p.health.recovery_weeks, 2); grow(c, -35); c.rep(-900); c.standing(-3);
            c.treat(p, "cruelty", 10, "had her tendons clipped to answer a rival's video"); c.set("feet_betrayed", true); c.rumor(`the owner clipped ${p.name}'s tendons to spite the believers`, -1);
            return { text: `You have ${p.name} put under that afternoon and her tendons cut, and you put the video out yourself.

${p.name} wakes up and tries to stand, and can't. The believers in the concourse don't riot. They just stop coming to the fountain, and ${c.n("prophet")} is gone from the arcology within the week.`, end: "you clipped a slave's tendons and the believers left" }; } },
        { id: "nothing", label: "Ignore it",
          run: (c) => { grow(c, -5);
            return { text: `You don't answer. The video keeps circulating for a week and then people forget it, mostly. On the concourse, the believers start holding their evenings for the four girls across the strait.`, next: "festival", after: 4 }; } },
      ],
    },
    festival: {
      title: "The Feast of Soles",
      wait: (c) => adopted(c) || movement(c) >= 20,
      text: (c) => `The believers want a festival: one day a year when every slave in ${c.arcology} is carried instead of walking, and citizens line the concourse to wash and kiss their feet. ${adopted(c) ? "Your priests of the doctrine have already drawn up the route." : `${c.n("prophet")} has already chosen the day.`}

They'd like the owner to lead it. They'd like ${c.sn}, whose feet started all of this, carried at the front.`,
      options: [
        { id: "lead", label: "Lead the procession on foot, carrying her yourself", note: "¤6,000", need: cash(6000),
          run: (c) => { c.cash(-6000); grow(c, 20); c.rep(900); c.standing(3); c.hope(4);
            c.treat(c.subj, "recognition", 10, "carried at the front of the Feast of Soles by her owner");
            const p = c.subj; if (p) { p.fame.prestige = Math.max(p.fame.prestige, 2) as 2; p.fame.why = "carried at the head of the first Feast of Soles"; }
            return { text: `You carry ${c.sn} the length of the concourse in your arms, barefoot yourself, with every slave you own carried in litters behind you. Citizens kneel on both sides the whole way, and every hundred meters you stop so they can wash her feet and kiss them. By the end her feet are pink and wrinkled from the water and her toenails have been painted three times.

That night she can't stop talking about it. She wants to know if you'll do it again next year.`, end: "you led the first Feast of Soles" }; } },
        { id: "crown", label: "Crown one slave the Sole of the Arcology for the year",
          pick: { label: "Who is crowned", filter: () => true },
          run: (c, p) => { if (!p) return { text: "" }; c.cash(-3000); grow(c, 14); c.rep(600);
            feetOf(p).soles = "soft"; feetOf(p).jewelry = [...feetOf(p).jewelry, "a gold anklet with a sole engraved on it"];
            p.fame.prestige = Math.max(p.fame.prestige, 2) as 2; p.fame.why = "crowned the Sole of the Arcology at the Feast of Soles";
            c.treat(p, "recognition", 9, "crowned the Sole of the Arcology");
            return { text: `${p.name} is carried the whole route on a litter with her feet resting on a velvet cushion. At the fountain, ${c.n("prophet")} fastens a gold anklet around her ankle and kisses the sole of each foot, and then the whole concourse lines up to do the same.

${p.name}'s feet are kissed by something like two thousand people that day. She gets used to it about halfway through.`, end: `${p.name} was crowned the Sole of the Arcology` }; } },
        { id: "profit", label: "Hold it, and sell places in the kissing line", note: "money, but it cheapens it",
          run: (c) => { c.cash(14000); grow(c, 4); c.rep(200); const doc = c.s.arcology.doctrines[PODOLATRY.id]; if (doc) doc.policies["foot_tithe"] = 1;
            return { text: `You hold the feast and sell places in the line at the fountain by the minute. It makes ${money(14000)}, and the tithe of kisses stays in place afterwards.

The believers still come. They pay, and they grumble about it on their knees.`, end: "the Feast of Soles became a business" }; } },
        { id: "decline", label: "Let them hold it without you",
          run: (c) => { grow(c, 6);
            return { text: `You watch the procession from the penthouse window. It goes the length of the concourse, slow and loud, and your slaves come back up in the evening with clean, pink feet and flowers tucked between their toes.`, end: "the believers held their feast without you" }; } },
      ],
    },
  },
};

export const FEET_ARCS: ArcDef[] = [feet];

