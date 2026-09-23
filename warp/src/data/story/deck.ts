/**
 * THE DECK — things that can happen to anyone who owns a building like yours.
 *
 * Each run shuffles these and draws one every few weeks, if its conditions hold. Most of them are
 * about somebody in your household, chosen when the arc starts, so the same arc about a different
 * woman is a different story.
 */
import type { ArcDef, Ctx } from "../../engine/story";
import { mostValuable, mostResentful, closest, ownedAdults } from "../../engine/story";
import { valuePerson } from "../../engine/economy";
import { read } from "../../engine/obedience";
import { resolveAct } from "../../engine/intimacy";
import { clamp } from "../../engine/psyche";

const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;
const cash = (n: number) => (c: Ctx) => (c.s.arcology.cash >= n ? null : `needs ${money(n)}`);
const skill = (id: string, n: number) => (c: Ctx) => (c.skill(id) >= n ? null : `needs ${id} ${n}`);
const secure = (n: number) => (c: Ctx) => (c.s.arcology.security >= n ? null : `needs security ${n}`);

function goodPiece(c: Ctx): boolean {
  const house = ownedAdults(c.s);
  const avg = house.length ? house.reduce((n, p) => n + read(p).devotion, 0) / house.length : 0;
  return c.flag("jour_curated") ? avg > -10 : avg > 20;
}

/* ── the journalist ─────────────────────────────────────────────────────────────────────────── */

const journalist: ArcDef = {
  id: "journalist", title: "The Journalist", kind: "deck",
  cast: ["journalist"],
  when: (s) => s.arcology.week >= 4,
  start: "ask",
  beats: {
    ask: {
      title: "A request for an interview",
      text: (c) => `${c.full("journalist")} writes for the Kestrel Ledger, which the Association reads over breakfast and pretends not to. ${c.He("journalist")} wants a week inside ${c.arcology}: the floors, the facilities, the household. "Warts and all," says the email. "People want to know how it actually works."

${c.He("journalist")}'s last piece was about an arcology in the Sahel. Its owner lost his seat on the Association a month later.`,
      options: [
        { id: "open", label: "Give them the full tour", note: "your household decides how it reads",
          run: (c) => { c.set("jour_open", true);
            return { text: `${c.n("journalist")} arrives with one bag and a recorder and asks to sleep in the servants' quarters. You let ${c.him("journalist")}. For a week ${c.he("journalist")} eats with your household and asks them questions you've never asked.`, next: "piece", after: 2 }; } },
        { id: "curated", label: "Give them a tour you've arranged", need: skill("slaving", 25),
          run: (c) => { c.set("jour_curated", true); c.cash(-3000);
            return { text: `You pick the rooms, the women, the hours. The dormitories get new sheets. The arcade is closed for maintenance. ${c.n("journalist")} notices all of it and says nothing, which makes you nervous.`, next: "piece", after: 2 }; } },
        { id: "refuse", label: "Decline",
          run: (c) => { c.like("journalist", -10);
            return { text: `You decline politely. ${c.n("journalist")} writes the piece anyway, from the outside, using your delivery records and three former citizens. It isn't flattering. It isn't very accurate either.`, end: "you kept the journalist out" }; } },
        { id: "bribe", label: "Offer them money not to write about you", note: "¤10,000", need: cash(10000),
          run: (c) => { c.cash(-10000);
            if (c.skill("trading") >= 35) { c.like("journalist", 5); return { text: `${c.n("journalist")} takes it, which surprises you, and writes about your neighbours instead.`, end: "you paid the journalist to look elsewhere" }; }
            c.rep(-300); c.standing(-2);
            return { text: `${c.n("journalist")} takes the money and prints the email you sent offering it. The headline is your name and the word "BRIBE".`, end: "the journalist printed your bribe" }; } },
      ],
    },
    piece: {
      title: "The piece runs",
      text: (c) => {
        return goodPiece(c)
          ? `The Ledger runs it over three pages. It's called "The Kind House". ${c.n("journalist")} quotes your women by name. Some of what they said about you you didn't know.`
          : `The Ledger runs it over three pages. It's called "Inventory". ${c.n("journalist")} quotes your women by name, and the quotes are the worst thing you've ever read about yourself.`;
      },
      options: [
        { id: "thank", label: "Send a case of wine to the paper",
          show: (c) => goodPiece(c),
          run: (c) => { c.rep(500); c.standing(2); c.like("journalist", 15); c.hope(5);
            return { text: `Your household reads it on the dormitory screen. Some of them read it twice. Prospective citizens start asking about apartments.`, end: "the journalist wrote you a good piece" }; } },
        { id: "sue", label: "Sue the paper", note: "¤8,000", need: cash(8000),
          show: (c) => !goodPiece(c),
          run: (c) => { c.cash(-8000); c.rep(-100);
            return { text: `The suit keeps the story in the news for another month. You settle. It was a mistake and you knew it was a mistake when you did it.`, end: "you sued over a bad piece and lost" }; } },
        { id: "punish", label: "Find out who talked, and deal with them",
          show: (c) => !goodPiece(c),
          pick: { label: "Who talked", filter: (p) => read(p).devotion < 20 },
          run: (c, p) => { if (!p) return { text: "" }; resolveAct(c.s, p, "discipline"); c.treat(p, "cruelty", 7, "punished for what she told the journalist"); c.household("coercion", 3, "saw what happened to the one who talked"); c.rep(-100);
            return { text: `You make an example of ${p.name} in front of the others. Nobody talks to a journalist again. The Ledger runs a follow-up paragraph about it, somehow.`, end: "you punished the one who talked" }; } },
        { id: "take", label: "Take the journalist", show: (c) => c.he("journalist") === "she", need: secure(45),
          run: (c) => { const p = c.addSlave({ seed: "journalist", name: c.full("journalist"), age: 33, quality: 0.4, how: "came to write about you and stayed as property", hostile: true }); c.npc("journalist").status = "owned"; c.npc("journalist").person = p.id; c.rep(-200); c.crime(2);
            return { text: `She's picked up on the concourse the night the piece runs. Officially she left on the evening ferry. Unofficially she's in your cellblock, asking for a lawyer, and she's going to be asking for a long time.`, end: "the journalist is yours now" }; } },
        { id: "shrug", label: "Let it go",
          run: (c) => { c.rep(-200);
            return { text: `It's a week's news and then it isn't. Some of your citizens look at you differently. Some of your household look at each other differently.`, end: "you let the piece stand" }; } },
      ],
    },
  },
};

/* ── the preacher ───────────────────────────────────────────────────────────────────────────── */

const zealot: ArcDef = {
  id: "zealot", title: "The Preacher", kind: "deck",
  cast: ["zealot"],
  when: (s) => s.arcology.week >= 6 && s.arcology.population > 800,
  start: "sermon",
  beats: {
    sermon: {
      title: "A preacher on the lower levels",
      text: (c) => `${c.n("zealot")} preaches from an upturned crate by the water recyclers on the lower levels, where the rent is cheapest. Forty people a night now. Seventy on Sundays.

He doesn't talk about God much. He talks about you: what's on your floors, what you pay for it, and what the people who live under it are worth to you. Your security chief has a recording. He's good.`,
      options: [
        { id: "listen", label: "Go and listen, in person",
          run: (c) => { c.set("zeal_met", true); c.like("zealot", 5);
            return { text: `You stand at the back in a plain coat. ${c.n("zealot")} sees you within a minute and doesn't stop. He says your name, and "welcome", and then preaches straight at you for an hour. Afterwards he asks if you'd like tea.`, next: "tea", after: 0 }; } },
        { id: "arrest", label: "Have him arrested for incitement", need: secure(40),
          run: (c) => { c.security(3); c.crime(4); c.standing(-1); c.set("zeal_martyr", true);
            return { text: `Four guards take him off his crate in front of seventy people. Nobody fights them. Everybody films it. By morning the crate has flowers on it.`, next: "martyr", after: 3 }; } },
        { id: "ignore", label: "Let him preach",
          run: (c) => { c.set("zeal_grows", true);
            return { text: `You let him preach. By the end of the month it's a hundred and forty on Sundays and somebody has painted a slogan on the brothel door.`, next: "martyr", after: 4 }; } },
        { id: "buy", label: "Offer him a better crate", note: "¤5,000 a month to preach something else", need: cash(5000),
          run: (c) => { c.cash(-5000); c.set("zeal_bought", true);
            return { text: `He listens to the offer and laughs. "I'll take the money," he says. "I'll give it to the people downstairs. I'll still say what I say." You've paid a man to insult you.`, next: "martyr", after: 4 }; } },
      ],
    },
    tea: {
      title: "Tea with the preacher",
      text: (c) => `His room is the size of a cupboard. He makes tea on a camp stove and gives you the only cup.

"I don't want your building," he says. "I want the people on the bottom floors to have one thing in their lives that isn't for sale. Give me that and I'll stop talking about yours."`,
      options: [
        { id: "chapel", label: "Build him a chapel on the lower levels", note: "¤12,000", need: cash(12000),
          run: (c) => { c.cash(-12000); c.prosperity(4); c.crime(-6); c.like("zealot", 30); c.npc("zealot").status = "ally";
            return { text: `It's a bare room with good light and nothing in it to buy. He preaches there now, gentler. The crime reports from the lower levels go down, and some of your women ask to go on Sundays.`, end: "you built the preacher a chapel" }; } },
        { id: "refuse", label: "\"Everything's for sale. That's what a city is.\"",
          run: (c) => { c.like("zealot", -20); c.set("zeal_grows", true);
            return { text: `"Then I'll keep talking," he says, and pours you more tea.`, next: "martyr", after: 4 }; } },
        { id: "free", label: "Offer to free one of your women if he'll stop",
          pick: { label: "Who goes free", filter: () => true },
          run: (c, p) => { if (!p) return { text: "" }; c.remove(p, "free", "freed as a gift to the preacher"); c.like("zealot", 25); c.hope(8); c.standing(2);
            return { text: `He's quiet for a long time. Then he stands up and shakes your hand. ${p.name} walks out of the building on his arm and he preaches about it that Sunday, and doesn't mention you by name again.`, end: "you freed a woman for the preacher" }; } },
      ],
    },
    martyr: {
      title: (c) => (c.flag("zeal_martyr") ? "The crate has flowers on it" : "The preacher's crowd"),
      text: (c) => c.flag("zeal_martyr")
        ? `${c.n("zealot")} is in your cells and his people are on the concourse every night now, three hundred of them, holding candles. Your brothel's takings are down a third. The Association has asked, politely, what you intend to do.`
        : `Three hundred people on the concourse with candles. ${c.n("zealot")} stands on his crate in the middle of them and reads out the names of women in your household. He has the names right.`,
      options: [
        { id: "release", label: "Let him go, publicly",
          run: (c) => { c.standing(1); c.crime(-3); c.like("zealot", 15);
            return { text: `You open the cell yourself, with cameras there. He walks out blinking and the crowd goes quiet. He thanks you, which you didn't expect, and asks them to go home. Most of them do.`, end: "you released the preacher" }; } },
        { id: "disperse", label: "Clear the concourse", need: secure(50),
          run: (c) => { c.crime(8); c.standing(-3); c.rep(200); c.prosperity(-5); c.household("coercion", 2, "the night the concourse was cleared");
            return { text: `It takes forty minutes and there's blood on the tiles in the morning. The concourse is quiet after that. So are the shops.`, end: "you cleared the preacher's crowd by force" }; } },
        { id: "exile", label: "Put him on a boat to somewhere else",
          run: (c) => { c.npc("zealot").status = "gone"; c.crime(2);
            return { text: `He goes without a fight. On the gangplank he turns and blesses the building, and you'll never know whether he meant it.`, end: "you exiled the preacher" }; } },
      ],
    },
  },
};

/* ── the collector ──────────────────────────────────────────────────────────────────────────── */

const collector: ArcDef = {
  id: "collector", title: "The Collector", kind: "deck",
  cast: ["collector"],
  when: (s) => ownedAdults(s).length >= 3,
  subject: (s) => mostValuable(s),
  start: "offer",
  beats: {
    offer: {
      title: (c) => `${c.n("collector")} wants ${c.sn}`,
      text: (c) => `${c.full("collector")} owns a Klimt, a Fabergé egg, and the last working Concorde, and ${c.he("collector")} has seen ${c.sn} on your concourse.

"Three times what she's worth," ${c.he("collector")} says, and puts the number on a card: ${money(valuePerson(c.s, c.subj!) * 3)}. "I don't haggle. I don't ask twice."

${c.sn} is in the room. She heard the number.`,
      options: [
        { id: "sell", label: "Sell her", note: (c) => `+${money(valuePerson(c.s, c.subj!) * 3)}`,
          run: (c) => { const v = Math.round(valuePerson(c.s, c.subj!) * 3); if (c.subj) c.remove(c.subj, "sold", `sold to ${c.full("collector")} for three times her price`, v); c.like("collector", 20); c.hope(-4);
            return { text: `She goes on ${c.n("collector")}'s jet the next morning, in a dress ${c.he("collector")} brought for her. She looks back at the building once from the steps. The money clears before the plane lands.`, end: "you sold her to the collector" }; } },
        { id: "no", label: "\"She's not for sale.\"",
          run: (c) => { c.like("collector", -15); c.treat(c.subj, "recognition", 7, "you refused three times her price for her");
            return { text: `"Everything is," ${c.n("collector")} says, and puts the card back in ${c.his("collector")} pocket. ${c.sn} doesn't say anything. Later that night she comes to your room without being sent for.`, next: "theft", after: 5 }; } },
        { id: "ask", label: "Ask her whether she wants to go",
          run: (c) => { const wants = c.subj ? read(c.subj).devotion < 10 : false; c.set("coll_asked", true);
            if (wants && c.subj) { const v = Math.round(valuePerson(c.s, c.subj) * 3); c.remove(c.subj, "sold", `chose to go to ${c.full("collector")}`, v); c.like("collector", 10);
              return { text: `She doesn't hesitate. "Yes." It's the first time she's looked straight at you. ${c.n("collector")} pays on the spot.`, end: "she chose the collector over you" }; }
            c.treat(c.subj, "recognition", 9, "you asked her if she wanted to go, and she stayed"); c.like("collector", -10);
            return { text: `"No," she says. Then, to ${c.n("collector")}: "No, thank you." ${c.n("collector")} looks at you like you've done something unsporting.`, next: "theft", after: 5 }; } },
      ],
    },
    theft: {
      title: "Somebody tried the lock",
      text: (c) => `${c.sn}'s door was forced at four in the morning. She was sleeping somewhere else, by luck.

Security found a professional's tools on the floor and a cleaning cart with a false bottom big enough for a person. The cart belongs to a contractor ${c.n("collector")} uses.`,
      options: [
        { id: "confront", label: "Confront the collector", need: skill("trading", 30),
          run: (c) => { c.like("collector", -10); c.cash(20000);
            return { text: `You send the tools to ${c.n("collector")} in a gift box. ${c.He("collector")} sends back a cheque for twenty thousand with a note: *For the door.* Neither of you mentions it again.`, end: "the collector paid for the door" }; } },
        { id: "guard", label: "Double the guard on her", note: "¤4,000", need: cash(4000),
          run: (c) => { c.cash(-4000); c.security(4); c.treat(c.subj, "kindness", 3, "you put guards on her door");
            return { text: `There's a guard on her door now. She pretends to find it annoying. She sleeps better.`, end: "you kept her from the collector" }; } },
        { id: "sell", label: "Sell her before they try again", note: (c) => `+${money(valuePerson(c.s, c.subj!) * 2)}`,
          run: (c) => { if (c.subj) c.remove(c.subj, "sold", `sold to ${c.full("collector")} after the attempt`, Math.round(valuePerson(c.s, c.subj) * 2)); c.hope(-6);
            return { text: `The price has dropped — the collector knows you're scared now. She goes anyway.`, end: "you sold her after the break-in" }; } },
      ],
    },
  },
};

/* ── the sister at the gate ─────────────────────────────────────────────────────────────────── */

const sister: ArcDef = {
  id: "sister", title: "The Sister", kind: "deck",
  cast: ["sister"],
  when: (s) => ownedAdults(s).length >= 2 && s.arcology.week >= 5,
  subject: (s) => ownedAdults(s).filter((p) => p.origin.acquired_how !== "born to it").sort((a, b) => a.economics.weeks_owned - b.economics.weeks_owned)[0],
  start: "gate",
  beats: {
    gate: {
      title: "A woman at the gate",
      text: (c) => `Security calls up from the landward gate. There's a woman there who's been standing in the rain since six asking for ${c.sn} by her full name.

"Says she's the sister," the guard says. "Says she came from ${c.subj?.origin.nationality ?? "somewhere"} on a bus and three boats. She's got a photograph."

On the camera, ${c.n("sister")} holds the photograph up to the lens. Two girls on a beach. One of them is ${c.sn}.`,
      options: [
        { id: "meet", label: "Let them meet, for an hour",
          run: (c) => { c.treat(c.subj, "kindness", 8, "you let her sister in"); c.set("sis_met", true);
            return { text: `They're in the small lounge for an hour. You don't listen. When the door opens ${c.sn}'s face is wrecked and ${c.n("sister")}'s is set, and ${c.n("sister")} says to you, "How much?"`, next: "price", after: 0 }; } },
        { id: "away", label: "Send her away",
          run: (c) => { c.treat(c.subj, "cruelty", 4, "her sister was sent away from the gate"); if (c.subj && c.s.memory[c.subj.id]) c.set("sis_sent", true);
            return { text: `The guard walks her back to the bus stop. She goes without a fight, but she leaves the photograph with him. He brings it up to you. You're still deciding what to do with it when ${c.sn} hears.`, end: "you sent the sister away" }; } },
        { id: "take", label: "Take her too", need: secure(35),
          run: (c) => { const p = c.addSlave({ seed: "sister", name: `${c.full("sister")}`, age: Math.max(18, (c.subj?.age ?? 24) + 2), nation: c.subj?.origin.nationality, quality: 0.3, how: `came to the gate looking for her sister, and was taken`, hostile: true }); c.npc("sister").status = "owned"; c.npc("sister").person = p.id; c.crime(2); c.treat(c.subj, "cruelty", 6, "her sister was taken at the gate");
            if (c.subj) { c.s.edges.push({ from: c.subj.id, to: p.id, warmth: 80, trust: 70, attraction: 0, power: 0, roles: ["sister"], weeks_known: 1000 }); c.s.edges.push({ from: p.id, to: c.subj.id, warmth: 85, trust: 75, attraction: 0, power: 0, roles: ["sister"], weeks_known: 1000 }); }
            return { text: `She's brought in out of the rain and doesn't understand what's happening until the collar's on. Then she does. They're in the same dormitory now. They hold each other at night and neither of them will look at you.`, end: "you took the sister too" }; } },
      ],
    },
    price: {
      title: "\"How much?\"",
      text: (c) => `${c.n("sister")} has eleven thousand in a money belt. She's sold a flat, a car and a wedding ring to get it. ${c.sn} is worth ${money(valuePerson(c.s, c.subj!))} by the market's reckoning.

They're both looking at you.`,
      options: [
        { id: "sell", label: "Take what she has", note: "+¤11,000; she leaves with her sister",
          run: (c) => { c.cash(11000); if (c.subj) c.remove(c.subj, "free", "bought free by her sister"); c.hope(10); c.standing(1);
            return { text: `You count it. It's eleven thousand and forty. You give her back the forty. They walk out of the front of the building holding hands, and your whole household watches from the windows.`, end: "the sister bought her free" }; } },
        { id: "full", label: "Demand full price", note: "she can't pay it",
          run: (c) => { c.treat(c.subj, "cruelty", 5, "you wouldn't take what her sister had");
            return { text: `${c.n("sister")} goes white, then red. She leaves the money belt on the table — "a deposit," she says — and walks out. She'll be back. People like her always come back.`, next: "back", after: 8 }; } },
        { id: "stay", label: "Offer the sister a job in the building instead",
          run: (c) => { c.set("sis_citizen", true); c.treat(c.subj, "kindness", 6, "her sister lives in the building now"); c.prosperity(1);
            return { text: `She takes a job in the laundry and a room on the ninth floor. She visits every Sunday. It's not freedom. ${c.sn} starts singing in the shower.`, end: "the sister stayed as a citizen" }; } },
      ],
    },
    back: {
      title: "The sister comes back",
      text: (c) => `${c.n("sister")} is back at the gate with twice as much money and a lawyer from Kestrel, and a camera crew.`,
      options: [
        { id: "sell", label: "Sell her the freedom, on camera", run: (c) => { c.cash(22000); if (c.subj) c.remove(c.subj, "free", "bought free by her sister"); c.standing(1); c.hope(8);
          return { text: `You shake the sister's hand for the camera. You look generous. You are, technically, eleven thousand richer than generous.`, end: "the sister bought her free, the second time" }; } },
        { id: "no", label: "Refuse, on camera", run: (c) => { c.rep(-300); c.standing(-2); c.treat(c.subj, "cruelty", 6, "you refused her sister twice");
          return { text: `It plays on every screen in the region by night. You're the owner who wouldn't sell a woman back to her own sister.`, end: "you refused the sister twice" }; } },
      ],
    },
  },
};

/* ── the plague ship ────────────────────────────────────────────────────────────────────────── */

const plague: ArcDef = {
  id: "plague", title: "The Plague Ship", kind: "deck",
  cast: ["doctor"],
  when: (s) => s.arcology.week >= 8,
  start: "dock",
  beats: {
    dock: {
      title: "A freighter asks to dock",
      text: (c) => `The *Marisol* has been refused at three ports. She's asking for your berth. Forty women in the hold bound for Doha, and some of them are sick — fever, a cough, nobody's sure what.

The ship's doctor, ${c.full("doctor")}, is on the radio. "I've got curatives for a week," ${c.he("doctor")} says. "Then I've got nothing. The captain wants to sell them cheap and go home. I want somebody to let me treat them first."`,
      options: [
        { id: "buy", label: "Buy four of them cheap, as they are", note: "¤4,000; they may be sick", need: cash(4000),
          run: (c) => { c.cash(-4000);
            for (let i = 0; i < 4; i++) { const p = c.addSlave({ seed: `marisol${i}`, age: 19 + i * 3, quality: 0.2, how: "bought sick off the Marisol" }); p.health.illness = 2; p.health.health = -30; }
            c.set("plague_in", true);
            return { text: `They come up the gangway wrapped in blankets. Two of them can walk. You have four new women and a building full of air they're breathing.`, next: "spread", after: 2 }; } },
        { id: "berth", label: "Give the doctor a berth and a clinic", note: "¤6,000", need: cash(6000),
          run: (c) => { c.cash(-6000); c.like("doctor", 30); c.standing(1);
            return { text: `${c.n("doctor")} works three days straight. Two die. Thirty-eight don't. When it's over ${c.he("doctor")} comes up to the penthouse still in ${c.his("doctor")} gloves and asks if you need a doctor.`, next: "doctor", after: 0 }; } },
        { id: "refuse", label: "Refuse the berth",
          run: (c) => { c.standing(-1);
            return { text: `The *Marisol* turns south. You see her lights for an hour. A month later you read that she was found drifting off Socotra with nobody alive in the hold.`, end: "you turned the plague ship away" }; } },
      ],
    },
    spread: {
      title: "The cough",
      text: (c) => `Three of the household have the cough now. The spa is full. The girls from the *Marisol* are recovering — all four — and the fever is doing to your own women what it did in the hold.`,
      options: [
        { id: "treat", label: "Buy curatives for everyone", note: "¤8,000", need: cash(8000),
          run: (c) => { c.cash(-8000); for (const p of c.owned()) { p.health.illness = 0; p.health.health = clamp(p.health.health + 10, -100, 100); } c.household("kindness", 2, "you paid to treat everyone");
            return { text: `It costs what it costs. Within a fortnight nobody's coughing and the spa is empty. The household noticed that you didn't count who was worth treating.`, end: "you treated the whole house" }; } },
        { id: "quarantine", label: "Lock the sick ones in the cellblock",
          run: (c) => { for (const p of c.owned().slice(0, 3)) { p.health.health = clamp(p.health.health - 15, -100, 100); p.health.illness = 0; } c.household("cruelty", 2, "the sick were locked in the cells");
            return { text: `It works, eventually. Two of them are never quite well again, and the rest remember who got locked up.`, end: "you quarantined the sick in the cells" }; } },
      ],
    },
    doctor: {
      title: (c) => `${c.n("doctor")}`,
      text: (c) => `"I'm done with ships," ${c.n("doctor")} says. "I'd work for you. Clinic, rounds, whatever you've got. I want a salary and I want you to not ask me to do anything I'd have to lie about afterwards."`,
      options: [
        { id: "hire", label: "Hire them", note: "−¤1,000 a week; your people stay healthier",
          run: (c) => { c.npc("doctor").status = "ally"; c.set("has_doctor", true); for (const p of c.owned()) p.health.health = clamp(p.health.health + 12, -100, 100); c.s.player.skills.medicine = Math.min(100, (c.s.player.skills.medicine ?? 0) + 20); c.out.push("+20 medicine");
            return { text: `${c.He("doctor")} starts on Monday. By Friday the clinic is cleaner than it's been since the building opened, and ${c.he("doctor")}'s already had an argument with your Madam and won.`, end: "the ship's doctor works for you now" }; } },
        { id: "no", label: "\"I'll call you if I need you.\"",
          run: (c) => ({ text: `${c.n("doctor")} nods and leaves a card. It has a number on it and nothing else.`, end: "you let the doctor go" }) },
      ],
    },
  },
};

/* ── the fixer ──────────────────────────────────────────────────────────────────────────────── */

const fixer: ArcDef = {
  id: "fixer", title: "Crates", kind: "deck",
  cast: ["fixer"],
  when: (s) => s.arcology.week >= 5,
  start: "offer",
  beats: {
    offer: {
      title: "An offer for your warehouse space",
      text: (c) => `${c.full("fixer")} wears expensive shoes and cheap cologne and wants to rent the empty half of your industrial level. Cash, weekly, no questions. ${c.He("fixer")} won't say what's in the crates.

"Machine parts," ${c.he("fixer")} says, and smiles so you'll know ${c.he("fixer")}'s lying.`,
      options: [
        { id: "yes", label: "Take the money", note: "+¤6,000 now",
          run: (c) => { c.cash(6000); c.set("fixer_in", true); c.like("fixer", 10);
            return { text: `The crates come in at night on unmarked trucks. The money comes on Mondays, in a gym bag.`, next: "raid", after: 6 }; } },
        { id: "look", label: "Take it — and look in the crates", need: skill("hacking", 20),
          run: (c) => { c.cash(6000); c.set("fixer_in", true); c.set("fixer_knows", true);
            return { text: `Guns. Not many, and not new, but guns, with the serial numbers ground off and a delivery manifest for Ardent. Now you know what you're paid to not know.`, next: "raid", after: 6 }; } },
        { id: "no", label: "Turn it down",
          run: (c) => ({ text: `${c.n("fixer")} shrugs and rents space in Kestrel instead. You see ${c.his("fixer")} trucks on the causeway sometimes.`, end: "you turned down the fixer" }) },
      ],
    },
    raid: {
      title: "Somebody's asking about the crates",
      text: (c) => `Ardent's security attaché calls on a Sunday. Someone has been arming dissidents on their lower levels, the weapons came from your side of the water, and they'd like to inspect your industrial level. Politely. This week.`,
      options: [
        { id: "give", label: "Give them the fixer", run: (c) => { c.npc("fixer").status = "gone"; c.like("fixer", -60); c.rep(200); c.cash(-6000);
          return { text: `You hand over ${c.n("fixer")}'s name, the trucks' plates and the gym bags. Ardent is grateful. ${c.n("fixer")} disappears, and somebody spray-paints RAT on your freight doors.`, end: "you gave the fixer up" }; } },
        { id: "hide", label: "Move the crates before they come", need: skill("engineering", 25),
          run: (c) => { c.like("fixer", 20); c.cash(10000);
            return { text: `By the time the inspectors come the warehouse is full of genuine machine parts. ${c.n("fixer")} sends a crate of good wine and doubles the rent.`, end: "you kept the fixer's secret" }; } },
        { id: "sell", label: "Sell the guns to Ardent yourself", show: (c) => !!c.flag("fixer_knows"),
          run: (c) => { c.cash(25000); c.like("fixer", -80); c.npc("fixer").status = "gone";
            return { text: `Ardent pays well for the guns and better for the fixer's client list. ${c.n("fixer")} learns about it from a newspaper. You'll want to check under your car for a while.`, end: "you sold the fixer's guns out from under them" }; } },
        { id: "refuse", label: "Refuse the inspection",
          run: (c) => { c.s.arcology.neighbours.forEach((n) => { if (n.name === "Ardent") n.attitude = clamp(n.attitude - 25, -100, 100); }); c.cash(6000);
            return { text: `Ardent's attitude to you drops off a cliff. The money keeps coming on Mondays, though.`, end: "you refused Ardent's inspectors" }; } },
      ],
    },
  },
};

/* ── the blackout ───────────────────────────────────────────────────────────────────────────── */

const blackout: ArcDef = {
  id: "blackout", title: "Blackout", kind: "deck",
  when: (s) => s.arcology.week >= 7 && ownedAdults(s).some((p) => p.bond.resentment > 30),
  subject: (s) => mostResentful(s),
  start: "dark",
  beats: {
    dark: {
      title: "The lights go out",
      text: (c) => `At eleven at night the whole building goes dark. The generators should catch in ninety seconds. They don't.

In the dark, the doors on the household floors unlock, because that's what the fire code says they do.

On the radio: "Movement on the service stairs. One person. Heading down." Then, a second voice: "And somebody's on the penthouse level. In the corridor outside your room."`,
      options: [
        { id: "stairs", label: "Go after whoever's on the stairs",
          run: (c) => { c.set("bo_went", "stairs");
            return { text: `You take a torch and go down. On the fourteenth-floor landing you find ${c.sn}, barefoot, with a stolen keycard and a bag she packed weeks ago. She doesn't run. She just stands there in the torchlight.`, next: "caught", after: 0 }; } },
        { id: "corridor", label: "Stay and see who's in your corridor",
          run: (c) => { const who = closest(c.s); c.set("bo_went", "corridor"); if (who) c.set("bo_who", who.id);
            return { text: `It's ${who?.name ?? "one of them"}. She's sitting on the floor outside your door with her back to it. "I didn't want you to be on your own," she says. "When it went dark." In the morning the stairwell guard reports a door propped open on the fourth floor, and ${c.sn} is gone.`, next: "gone", after: 0 }; } },
        { id: "lock", label: "Order the doors locked manually", need: secure(40),
          run: (c) => { c.security(2); c.household("coercion", 2, "locked in during the blackout");
            return { text: `Your guards go floor to floor with keys. It takes an hour. The generators catch at half past midnight and every door is locked. On the fourteenth-floor landing they find a packed bag nobody will admit to.`, end: "you locked the house down in the blackout" }; } },
      ],
    },
    caught: {
      title: (c) => `${c.sn} on the stairs`,
      text: (c) => `"I wasn't going to hurt anybody," she says. "I was just going to go."`,
      options: [
        { id: "let", label: "Step aside",
          run: (c) => { if (c.subj) c.remove(c.subj, "gone", "you let her go in the blackout"); c.hope(10); c.rumor("the owner let one of them walk out in the blackout", 1);
            return { text: `She looks at you like it's a trick. Then she goes down the stairs, fast, and you hear the fire door at the bottom bang open. You never see her again. The household never stops talking about it.`, end: "you let her go" }; } },
        { id: "back", label: "Take her back upstairs without a word",
          run: (c) => { c.treat(c.subj, "kindness", 3, "brought back without punishment");
            return { text: `You walk her back up fourteen floors in the dark. Neither of you says anything. You put her bag in your office. She's at work in the morning like nothing happened, and neither of you ever mentions it.`, end: "you brought her back and said nothing" }; } },
        { id: "punish", label: "Make an example of her",
          run: (c) => { if (c.subj) { resolveAct(c.s, c.subj, "discipline"); c.subj.assignment = "be confined in the cellblock"; } c.treat(c.subj, "cruelty", 8, "caught running in the blackout"); c.household("coercion", 4, "saw what happened to the one who ran");
            return { text: `She's in the cellblock by morning, and the household is walked past her door on the way to breakfast.`, end: "you made an example of the one who ran" }; } },
      ],
    },
    gone: {
      title: (c) => `${c.sn} is gone`,
      text: (c) => `She got out through the fourth floor and onto a fishing boat, the harbourmaster thinks. Your security chief says she can be found. It'll cost.`,
      options: [
        { id: "hunt", label: "Hunt her down", note: "¤5,000", need: cash(5000),
          run: (c) => { c.cash(-5000); if (c.subj) c.subj.assignment = "be confined in the cellblock"; c.treat(c.subj, "cruelty", 7, "hunted down and brought back"); c.hope(-10);
            return { text: `They find her in a flat in Kestrel four days later and bring her back in the boot of a car. The household watches her carried through the lobby.`, end: "you hunted her down" }; } },
        { id: "let", label: "Let her go",
          run: (c) => { if (c.subj) c.remove(c.subj, "gone", "escaped in the blackout"); c.hope(6);
            const w = c.s.people[String(c.flag("bo_who"))]; c.treat(w, "recognition", 6, "she stayed outside your door in the dark");
            return { text: `You tell security to leave it. ${w?.name ?? "The one who sat outside your door"} brings you coffee the next morning and stays to drink it with you.`, end: "you let the runaway go" }; } },
      ],
    },
  },
};

/* ── the auction ────────────────────────────────────────────────────────────────────────────── */

const auction: ArcDef = {
  id: "auction", title: "The Grand Exchange", kind: "deck",
  cast: ["auctioneer", "rival_owner"],
  when: (s) => s.arcology.week >= 10 && s.arcology.cash > 30000,
  start: "catalogue",
  beats: {
    catalogue: {
      title: "A lot in the catalogue",
      text: (c) => `The Grand Exchange's spring catalogue comes on real paper. Lot one is a woman the catalogue doesn't bother to describe past her name, because everybody already knows it: a former prima ballerina of the Mariinsky, twenty-six, sold by a bankrupt oligarch's estate.

${c.full("auctioneer")} calls personally. "Reserve is forty thousand. ${c.full("rival_owner")}'s bidding. I thought you'd want to know."`,
      options: [
        { id: "go", label: "Go to the auction", run: () => ({ text: `You book a table near the front.`, next: "bid", after: 1 }) },
        { id: "private", label: "Try to buy her before the auction", note: "¤70,000", need: (c) => cash(70000)(c) ?? skill("trading", 45)(c),
          run: (c) => { c.cash(-70000); const p = c.addSlave({ seed: "ballerina", age: 26, quality: 1, nation: "Russian", how: "a former prima ballerina, bought privately before the Exchange" }); p.skills.entertainment = 95; p.fame.prestige = 2; p.fame.why = "danced at the Mariinsky"; c.like("auctioneer", 10); c.like("rival_owner", -15); c.rep(400);
            return { text: `The estate takes your offer the night before. ${p.name} arrives with two suitcases of practice clothes and asks where she can warm up.`, end: "you bought the ballerina before the auction" }; } },
        { id: "skip", label: "Not this year", run: () => ({ text: `You put the catalogue in a drawer.`, end: "you skipped the auction" }) },
      ],
    },
    bid: {
      title: "Lot one",
      text: (c) => `The room is full. She's brought out in a plain grey leotard and stands on the block like it's a stage, which is to say perfectly still.

It's at sixty thousand in a minute. Then it's you and ${c.n("rival_owner")}. ${c.He("rival_owner")} raises ${c.his("rival_owner")} paddle without looking at you.`,
      options: [
        { id: "win", label: "Keep bidding", note: "¤85,000", need: cash(85000),
          run: (c) => { c.cash(-85000); const p = c.addSlave({ seed: "ballerina", age: 26, quality: 1, nation: "Russian", how: "a former prima ballerina, won at the Grand Exchange" }); p.skills.entertainment = 95; p.fame.prestige = 2; p.fame.why = "danced at the Mariinsky"; c.like("rival_owner", -25); c.rep(800);
            return { text: `Eighty-five thousand. ${c.n("rival_owner")} puts ${c.his("rival_owner")} paddle down and applauds, slowly, three times. ${p.name} looks at you from the block for the first time.`, end: "you won the ballerina at auction" }; } },
        { id: "drive", label: "Drive the price up and drop out", need: skill("trading", 35),
          run: (c) => { c.like("rival_owner", -20);
            return { text: `You take it to ninety and stop dead. ${c.n("rival_owner")} pays ninety-five for her, and you see ${c.him("rival_owner")} doing the arithmetic afterwards. ${c.He("rival_owner")} knows exactly what you did.`, end: "you made your rival overpay" }; } },
        { id: "let", label: "Let them have her",
          run: (c) => { c.like("rival_owner", 5);
            return { text: `${c.n("rival_owner")} wins at seventy. ${c.He("rival_owner")} raises a glass to you across the room, graciously, the way people do when they've won.`, end: "your rival bought the ballerina" }; } },
      ],
    },
  },
};

/* ── the old flame ──────────────────────────────────────────────────────────────────────────── */

const flame: ArcDef = {
  id: "flame", title: "Someone From Before", kind: "deck",
  cast: ["flame"],
  when: (s) => s.arcology.week >= 12,
  start: "arrive",
  beats: {
    arrive: {
      title: (c) => `${c.n("flame")} is in the lobby`,
      text: (c) => `${c.full("flame")}. You haven't seen ${c.him("flame")} in eleven years. ${c.He("flame")}'s standing in your lobby looking up at the atrium the way everyone does the first time, with one small suitcase and a coat that was good about five winters ago.

"I heard you owned a city now," ${c.he("flame")} says. "I didn't believe it."`,
      options: [
        { id: "up", label: "Bring them up to the penthouse",
          run: (c) => { c.like("flame", 15);
            return { text: `${c.n("flame")} walks round the penthouse touching things. ${c.He("flame")} stops at the window for a long time. "I'm in trouble," ${c.he("flame")} says, without turning round. "Money. The kind with men attached. I didn't know who else to come to."`, next: "trouble", after: 0 }; } },
        { id: "coffee", label: "Buy them coffee on the concourse and keep it short",
          run: (c) => ({ text: `You talk for twenty minutes. ${c.n("flame")} laughs at the right places and doesn't ask for anything, and afterwards you realise ${c.he("flame")} came to ask for something and lost ${c.his("flame")} nerve.`, end: "you kept your old flame at arm's length" }) },
      ],
    },
    trouble: {
      title: "The kind with men attached",
      text: (c) => `Thirty thousand, to people in Kestrel who've started leaving notes under ${c.his("flame")} door. ${c.n("flame")} tells you the whole story and you believe about two-thirds of it.`,
      options: [
        { id: "pay", label: "Pay it", note: "¤30,000", need: cash(30000),
          run: (c) => { c.cash(-30000); c.like("flame", 40); c.npc("flame").status = "ally";
            return { text: `${c.n("flame")} cries, briefly and angrily, and then asks if ${c.he("flame")} can stay a few days. ${c.He("flame")} stays three weeks. When ${c.he("flame")} leaves, ${c.he("flame")} leaves you a letter you read more than once.`, end: "you paid your old flame's debts" }; } },
        { id: "stay", label: "Offer them a room and a job instead",
          run: (c) => { c.like("flame", 20); c.npc("flame").status = "ally"; c.prosperity(1);
            return { text: `${c.He("flame")} takes the room. The job, it turns out, ${c.he("flame")}'s good at — ${c.he("flame")} runs your front of house by the end of the month, and the men from Kestrel don't come into your building.`, end: "your old flame works for you now" }; } },
        { id: "collar", label: "Buy the debt, and them with it", show: (c) => c.he("flame") === "she", need: cash(30000),
          run: (c) => { c.cash(-30000); const p = c.addSlave({ seed: "flame", name: c.full("flame"), age: 36, quality: 0.5, how: "an old flame; you bought her debt, and her with it" }); c.npc("flame").status = "owned"; c.npc("flame").person = p.id; p.bond = { ...p.bond, bond: 20, resentment: 40 };
            return { text: `You buy the paper from the men in Kestrel and put it in front of her. She reads it twice before she understands. "You were always like this," she says. "I just never had anything you wanted."`, end: "your old flame wears your collar" }; } },
        { id: "no", label: "Send them away", run: (c) => { c.like("flame", -30);
          return { text: `${c.He("flame")} picks up the suitcase without a word. A month later you hear ${c.he("flame")} was pulled out of the water near the Kestrel causeway. You don't ask for details.`, end: "you sent your old flame away" }; } },
      ],
    },
  },
};

export const DECK_ARCS: ArcDef[] = [journalist, zealot, collector, sister, plague, fixer, blackout, auction, flame];
