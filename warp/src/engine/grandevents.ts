/**
 * WHAT HAPPENS TO SOMEONE WITH THIS MUCH.
 *
 * The household's events are about the household. These are about the owner as a power in the
 * world: what comes to an arcology owner with a fortune, an airport, a launch pad, an army and a
 * reputation, and what the world asks of someone it's afraid of or wants something from. Each one
 * fires only when your own state makes it make sense: your money, what you've built, what you're
 * good at, what your culture believes, and what you've done.
 */
import type { Person, SaveState } from "./types";
import { registerEvents, type EventDef } from "./events";
import { clamp } from "./psyche";
import { startRumor } from "./social";
import { applyTreatment, read, refresh } from "./obedience";
import { generatePerson } from "./generate";
import { newMemory } from "./memory";
import { conflicts } from "./globe";
import { empireOf, has, powers, shift, dominion, units } from "./power";
import { activeWars } from "./war";
import { freedInCity } from "./freed";
import { menialsOf } from "./menials";
import { romanceOf } from "./romance";

const adopted = (s: SaveState, id: string) => (s.arcology.doctrines as Record<string, { adoption: number }>)[id]?.adoption ?? 0;
const flag = (s: SaveState, k: string) => Number(s.story?.flags[k] ?? 0);
const skill = (s: SaveState, k: string) => s.player.skills[k] ?? 0;
const owned = (s: SaveState) => Object.values(s.people).filter((p) => p.status === "owned");
const once = (s: SaveState, k: string) => !(s.story?.flags[`gx_${k}`]);
const done = (s: SaveState, k: string) => { if (s.story) s.story.flags[`gx_${k}`] = s.arcology.week; };
const friendliest = (s: SaveState) => powers(s).filter((p) => p.rec.status === "free" || p.rec.status === "allied").sort((a, b) => b.attitude - a.attitude)[0];

function newcomer(s: SaveState, how: string, quality = 0.85): Person {
  const p = generatePerson({ seed: `gx:${s.id}:${s.arcology.week}:${how.length}`, week: s.arcology.week, quality });
  p.origin.acquired_how = how; p.origin.acquired_week = s.arcology.week; p.economics.price_paid = 0;
  s.people[p.id] = p; s.memory[p.id] = newMemory(); refresh(p, s.memory[p.id]);
  return p;
}

export const GRAND_EVENTS: EventDef[] = [
  {
    id: "gx_loan", severity: "notable", endogenous: false,
    candidates: (s) => (s.arcology.cash >= 400_000 && conflicts(s).length ? [{}] : []),
    weight: () => 2.5,
    seed: (s) => `The finance minister of ${conflicts(s)[0]?.name ?? "an Old World state"} has flown in, without an appointment and without much dignity. Her government can't make payroll. Its army hasn't been paid in two months, and when an army isn't paid it finds its own money. She wants ¤300,000, and she'll sign whatever terms you write.`,
    options: [
      { id: "lend", label: "Lend it, at your terms", note: "¤300,000", resolve: (s) => { s.arcology.cash -= 300_000; const p = powers(s).find((x) => x.kind === "region" && x.name === conflicts(s)[0]?.name); if (p) { p.rec.status = "vassal"; p.rec.pays = Math.round(p.strength * 80); p.rec.since = s.arcology.week; } return `You lend it. Your terms run to forty pages, and one of them gives your bank a seat on their cabinet. In a month their policy reads like your memos, and they pay you interest every week.`; } },
      { id: "army", label: "Pay their army directly instead", note: "¤150,000", resolve: (s) => { s.arcology.cash -= 150_000; startRumor(s, `the owner is paying an Old World army`, { salience: 8 }); return `You pay the soldiers, not the government. The minister flies home understanding exactly who those soldiers work for now, and so does everyone in her capital.`; } },
      { id: "no", label: "Send her home", resolve: () => `You send her home with nothing but a good lunch. Three weeks later her army takes the capital's treasury itself, and the news shows the smoke.` },
    ],
  },
  {
    id: "gx_celebrity", severity: "minor", endogenous: false,
    candidates: (s) => (has(s, "airport") && once(s, "celebrity") ? [{}] : []),
    weight: () => 2,
    seed: () => `A private jet you didn't expect lands at your airport. It's one of the most famous actresses left in the Old World, with a film crew, a publicist and a contract to shoot a picture "somewhere that still feels like the future." She'd like to shoot it here, and she'd like to meet you.`,
    options: [
      { id: "host", label: "Host her, and give her the run of the city", resolve: (s) => { done(s, "celebrity"); s.arcology.rep += 900; for (const p of powers(s)) shift(s, p.id, 2); return `She shoots for a month. The film plays in every Old World city still running a cinema, and your arcology is in every frame of it. Bookings at your airport double.`; } },
      { id: "keep", label: "Offer her a contract she doesn't read closely", resolve: (s) => { done(s, "celebrity"); const p = newcomer(s, "a famous actress who signed a contract she didn't read", 0.95); p.fame.prestige = 3 as never; p.fame.why = "a film star from the Old World"; s.arcology.rep = Math.max(0, s.arcology.rep - 600); for (const x of powers(s)) shift(s, x.id, -6); return `It's a perfectly legal contract under your laws. ${p.name} finds out what she signed on the second day. The Old World papers find out on the third. She's yours now, and the most famous slave in the Free Cities.`; } },
      { id: "no", label: "Turn the crew away", resolve: (s) => { done(s, "celebrity"); return `Your people meet her on the runway and refuel her jet. She makes the film somewhere else, and says unkind things about you in interviews.`; } },
    ],
  },
  {
    id: "gx_space", severity: "notable", endogenous: false,
    candidates: (s) => (has(s, "launch") && once(s, "space") ? [{}] : []),
    weight: () => 3,
    seed: () => `Your launch complex is ready to put people into orbit. The first flight has four seats. Half the billionaires left on earth have already called, and so has every intelligence service you know of.`,
    options: [
      { id: "sell", label: "Sell the seats to the highest bidders", resolve: (s) => { done(s, "space"); s.arcology.cash += 600_000; s.arcology.rep += 500; return `Four seats, ¤600,000, and four of the richest people alive owe you the best day of their lives. They come back talking about you to everyone they know.`; } },
      { id: "fly", label: "Go up yourself, and take your favourite", resolve: (s) => { done(s, "space"); const fav = owned(s).sort((a, b) => b.bond.bond - a.bond.bond)[0]; if (fav) { applyTreatment(fav, { kind: "recognition", size: 10, why: "you took her into orbit with you" }, s.arcology.week); fav.fame.prestige = Math.max(fav.fame.prestige, 2) as never; fav.fame.why = "went to space with the owner"; } s.arcology.public_standing = clamp(s.arcology.public_standing + 3, -10, 10); return `You watch the curve of the earth come up in the window${fav ? ` with ${fav.name} beside you, pressed to the glass, crying` : ""}. The broadcast plays in every arcology on earth. Nobody else alive can do this.`; } },
      { id: "spy", label: "Fly a classified payload instead", resolve: (s) => { done(s, "space"); for (const p of powers(s)) p.rec.hurt += 4; return `The first flight carries no people and no announcement. Whatever it put up there, your analysts start knowing things about other governments that those governments don't know you know.`; } },
    ],
  },
  {
    id: "gx_accords", severity: "notable", endogenous: false,
    candidates: (s) => (once(s, "accords") && (s.arcology.rep > 4000 || dominion(s).share > 0.05) ? [{}] : []),
    weight: () => 2,
    seed: () => `What's left of the old international order, a council of Old World governments meeting in a borrowed hotel, offers your arcology a seat. The price is a signature on their "humane conduct accords": no public punishments, inspections of your slave markets, a registry anyone can read.`,
    options: [
      { id: "sign", label: "Sign, and mean it", resolve: (s) => { done(s, "accords"); for (const p of powers(s)) if (p.kind === "region") shift(s, p.id, 20); s.arcology.rep += 700; const d = s.arcology.doctrines as Record<string, { adoption: number }>; if (d.paternalist) d.paternalist.adoption = clamp(d.paternalist.adoption + 6, 0, 100); return `You sign on camera. The Old World states warm to you overnight, the inspectors arrive in a month, and the harder half of your citizens start muttering about it.`; } },
      { id: "sign_lie", label: "Sign, and ignore it", resolve: (s) => { done(s, "accords"); for (const p of powers(s)) if (p.kind === "region") shift(s, p.id, 8); return `You sign, smile, and change nothing. The inspectors are shown exactly what they're shown. Everyone involved understands the arrangement, and the seat is yours.`; } },
      { id: "refuse", label: "Refuse, in public, and say why", resolve: (s) => { done(s, "accords"); for (const p of powers(s)) if (p.kind === "region") shift(s, p.id, -12); else shift(s, p.id, 5); s.arcology.rep += adopted(s, "degradationist") + adopted(s, "supremacist") > 40 ? 900 : 200; return `You tell the council what you think of it, on every feed in the Free Cities. The Old World governments are furious. Every other Free City quietly agrees with you.`; } },
    ],
  },
  {
    id: "gx_refugees", severity: "major", endogenous: false,
    candidates: (s) => (conflicts(s).some((c) => c.state === "collapse" || c.state === "war") ? [{}] : []),
    weight: () => 2.5,
    seed: (s) => `A fleet is off your coast, made of fishing boats, ferries and a container ship with people standing on the containers. Twelve thousand people, fleeing ${conflicts(s)[0]?.name ?? "a war"}. Your coastguard is waiting for orders.`,
    options: [
      { id: "citizens", label: "Let them in as citizens", resolve: (s) => { s.arcology.population = Math.min(20000, s.arcology.population + 1800); s.arcology.prosperity = clamp(s.arcology.prosperity - 6, 0, 200); s.arcology.rep += 600; for (const p of powers(s)) if (p.kind === "region") shift(s, p.id, 10); return `You let them land. The verge fills in a week, the housing lists are a year long, and the Old World calls you a hero. In ten years their children will be running your works.`; } },
      { id: "enslave", label: "Let them in, as menials", resolve: (s) => { const m = menialsOf(s); m.owned += 600; s.arcology.rep = Math.max(0, s.arcology.rep - 900); for (const p of powers(s)) shift(s, p.id, p.kind === "region" ? -20 : -4); return `They're processed on the quay. The strong ones go to your labour pool, six hundred of them, and the rest are sold on before the week is out. The photographs travel further than anything you've ever done.`; } },
      { id: "turn", label: "Turn them back", resolve: (s) => { const navy = units(s, "patrol") + units(s, "frigates"); s.arcology.public_standing = clamp(s.arcology.public_standing - 1, -10, 10); return navy ? `Your ships shepherd the fleet back out to sea. Where it lands, nobody here asks.` : `You have no ships to turn them back with, so your coastguard fires over their heads until they leave. Some of them don't make it far.`; } },
    ],
  },
  {
    id: "gx_rival_tycoon", severity: "notable", endogenous: false,
    candidates: (s) => (s.arcology.cash >= 250_000 ? [{}] : []),
    weight: () => 1.8,
    seed: () => `A billionaire from another Free City has been quietly buying shares in your arcology's companies through a dozen fronts. He now holds enough to make trouble, and he's sent a polite letter suggesting the two of you should be partners.`,
    options: [
      { id: "outbid", label: "Buy him out at any price", note: "Trading decides the price", resolve: (s) => { const n = Math.round(300_000 * (1.3 - skill(s, "trading") / 200)); s.arcology.cash -= n; s.arcology.ownership = clamp(s.arcology.ownership + 2, 0, 100); return `You buy every share back for ¤${n.toLocaleString()}. He makes a fortune and leaves, and you own more of your own city than you did.`; } },
      { id: "raid", label: "Go after his companies instead", resolve: (s) => { const good = skill(s, "trading") + skill(s, "hacking") > 90; if (good) { s.arcology.cash += 400_000; return `You find the weak point in his empire, a bank in his own city with bad loans, and you lean on it until it breaks. He sells you his shares to save the rest. You come out ¤400,000 up.`; } s.arcology.cash -= 120_000; s.arcology.ownership = clamp(s.arcology.ownership - 3, 0, 100); return `You go after him and he sees you coming. It costs you ¤120,000 and three percent of your own arcology before you call it off.`; } },
      { id: "partner", label: "Accept him as a partner", resolve: (s) => { s.arcology.ownership = clamp(s.arcology.ownership - 4, 0, 100); s.arcology.cash += 150_000; return `He becomes a partner, with a seat at your table and four percent of everything. He's useful. He's also always there.`; } },
    ],
  },
  {
    id: "gx_general", severity: "notable", endogenous: false,
    candidates: (s) => (once(s, "general") && Object.values(empireOf(s).arsenal).reduce((a, b) => a + b, 0) >= 4 ? [{}] : []),
    weight: () => 2.5,
    seed: () => `A general is in your lobby. She's the one who held the northern line for two years after her government stopped paying her. Her army went home, but she didn't. She's heard what you're building, and she'd like to command it.`,
    options: [
      { id: "hire", label: "Give her command", note: "¤5,000 a week, and some of your authority", resolve: (s) => { done(s, "general"); s.player.skills.command = clamp((s.player.skills.command ?? 0) + 15, 0, 100); empireOf(s).readiness = 100; return `She takes command on a Monday. By Friday your forces drill like an army, and you understand more about war from a week of her briefings than from anything you've read.`; } },
      { id: "learn", label: "Don't hire her, but hire her to teach you", resolve: (s) => { done(s, "general"); s.player.skills.command = clamp((s.player.skills.command ?? 0) + 8, 0, 100); s.arcology.cash -= 40_000; return `She spends a month walking you through her campaigns, map by map, mistake by mistake. Then she leaves, and you're a better commander than you were.`; } },
      { id: "no", label: "Send her away", resolve: (s) => { done(s, "general"); return `You send her away. She goes to a rival, and the next time you hear her name it's in an intelligence report about their army.`; } },
    ],
  },
  {
    id: "gx_pilgrims", severity: "minor", endogenous: false,
    candidates: (s) => (["roman", "egyptian", "edo", "arabian", "chinese", "aztec", "neo_imperial", "antebellum", "chattel_religion"].some((d) => adopted(s, d) >= 50) ? [{}] : []),
    weight: () => 2,
    seed: (s) => { const d = ["roman", "egyptian", "edo", "arabian", "chinese", "aztec", "neo_imperial", "antebellum", "chattel_religion"].sort((a, b) => adopted(s, b) - adopted(s, a))[0]; return `Word has spread about what your city has become. People who share its faith, ${d.replace(/_/g, " ")} believers from all over the world, are arriving by the boatload to see it for themselves, to walk your streets, watch your ceremonies and be in a place that lives the way they only dream of.`; },
    options: [
      { id: "festival", label: "Throw them a festival", resolve: (s) => { s.arcology.rep += 500; s.arcology.cash += 40_000; s.arcology.public_standing = clamp(s.arcology.public_standing + 1, -10, 10); return `A week of processions and feasts. The pilgrims spend everything they brought, your citizens are proud to be watched, and the photographs go round the world.`; } },
      { id: "toll", label: "Charge them at the gates", resolve: (s) => { s.arcology.cash += 90_000; s.arcology.rep += 100; return `A pilgrim's toll at every gate. They pay it gladly, and the money goes straight to the treasury.`; } },
      { id: "stay", label: "Offer the best of them citizenship", resolve: (s) => { s.arcology.population = Math.min(20000, s.arcology.population + 400); s.arcology.prosperity = clamp(s.arcology.prosperity + 3, 0, 200); return `Four hundred of them stay, true believers and their families. Your culture has never been stronger in the streets.`; } },
    ],
  },
  {
    id: "gx_crown", severity: "major", endogenous: false,
    candidates: (s) => (once(s, "crown") && dominion(s).share >= 0.25 ? [{}] : []),
    weight: () => 4,
    seed: (s) => `Your vassals have been talking among themselves. Their envoys come to you together. An arcology owner who rules ${Math.round(dominion(s).share * 100)}% of the world should not be called an owner, they say. They propose a title, and a coronation, and they'd like to be the ones who give it to you.`,
    options: [
      { id: "emperor", label: "Emperor", resolve: (s) => { done(s, "crown"); s.player.title = "Emperor"; s.arcology.public_standing = clamp(s.arcology.public_standing + 3, -10, 10); for (const p of powers(s)) if (p.rec.status === "free") shift(s, p.id, -10); return `The coronation is in the atrium, under your own dome, with every vassal on their knees in order of size. The free powers watch it on television and start counting their own armies.`; } },
      { id: "protector", label: "Lord Protector, nothing grander", resolve: (s) => { done(s, "crown"); s.player.title = "Lord Protector"; s.arcology.rep += 800; return `A modest title for an immodest fact. The free powers are reassured, slightly. Your vassals understand that you don't need a crown to be obeyed.`; } },
      { id: "none", label: "Refuse any title", resolve: (s) => { done(s, "crown"); s.arcology.rep += 1200; return `You refuse. "Owner" has done well enough so far. The story spreads that you can't be flattered, which frightens people more than a crown would have.`; } },
    ],
  },
  {
    id: "gx_turned", severity: "major", endogenous: true,
    candidates: (s) => (powers(s).some((p) => p.attitude < -40) ? owned(s).filter((p) => p.bond.resentment > 50 && p.skills.combat > 25).map((person) => ({ person })) : []),
    weight: () => 2,
    seed: (s, c) => `Another of your slaves comes to you at night, frightened. ${c.person!.name} has been meeting a man on her errands, a man from ${powers(s).filter((p) => p.attitude < -40)[0]?.name ?? "a hostile power"}, who has given her money, a vial and a date. She hasn't decided yet. The one telling you thinks she's close.`,
    options: [
      { id: "confront", label: "Confront her", resolve: (s, _e, p) => { if (!p) return `By the time you send for her she's gone over the wall, and the vial with her.`; applyTreatment(p, { kind: "coercion", size: 6, why: "caught taking money from foreign agents" }, s.arcology.week); p.bond.fear = clamp(p.bond.fear + 25, 0, 100); return `You put the vial on the table in front of her and wait. She breaks before you say a word. She tells you everything, and you can see her deciding to be more afraid of you than of them.`; } },
      { id: "double", label: "Let her keep meeting him, and feed him lies", resolve: (s, _e, p) => { const enemy = powers(s).filter((x) => x.attitude < -40)[0]; if (enemy) enemy.rec.hurt += Math.round(enemy.strength * 0.15); if (p) applyTreatment(p, { kind: "recognition", size: 3, why: "you used her instead of punishing her" }, s.arcology.week); return `You tell her what you know and what she's going to do about it. For two months she carries your lies to their man, and their plans go wrong in ways they can't explain.`; } },
      { id: "sell", label: "Sell her before she decides", resolve: (s, _e, p) => { if (p) { p.status = "sold"; p.exit_week = s.arcology.week; p.exit_note = "sold after foreign agents turned her"; s.arcology.cash += 8000; } return `She's on a boat out before morning, and the man on her errand route waits at the corner for a woman who doesn't come.`; } },
    ],
  },
  {
    id: "gx_crash", severity: "notable", endogenous: false,
    candidates: (s) => (s.arcology.cash >= 1_000_000 ? [{}] : []),
    weight: () => 1.6,
    seed: () => `The markets are falling through the floor. Two Old World banks closed this morning, the Free Cities' exchange suspended trading at noon, and every asset in the world is for sale at a third of what it cost last week. Your traders want to know what you want to do with the money you're sitting on.`,
    options: [
      { id: "buy", label: "Buy everything", note: "your Trading skill decides how well", resolve: (s) => { const t = skill(s, "trading"); const stake = 600_000; const back = Math.round(stake * (0.7 + t / 80)); s.arcology.cash += back - stake; return back > stake ? `You buy at the bottom. Three months later the world has recovered and you own a piece of most of it: ¤${(back - stake).toLocaleString()} up, and a lot of boards with your people on them.` : `You buy too early, on the way down. It recovers slowly, and you're ¤${(stake - back).toLocaleString()} down when it does.`; } },
      { id: "hold", label: "Hold, and wait", resolve: () => `You hold. It passes, as these things do, and you come out where you went in, while other people lost everything.` },
      { id: "short", label: "Bet on it getting worse", resolve: (s) => { const win = skill(s, "trading") + skill(s, "hacking") > 80; s.arcology.cash += win ? 350_000 : -250_000; return win ? `It gets worse, exactly as you bet. You make ¤350,000 out of other people's ruin, and some of them know your name now.` : `It turns the next morning. Your bet costs you ¤250,000, and the traders who took the other side drink to you.`; } },
    ],
  },
  {
    id: "gx_stockpile", severity: "notable", endogenous: false,
    candidates: (s) => (has(s, "intel") || units(s, "batteries") > 0 ? (conflicts(s).length ? [{}] : []) : []),
    weight: () => 1.8,
    seed: (s) => `Your intelligence service brings you an offer that came through three middlemen. A garrison commander in ${conflicts(s)[0]?.name ?? "a collapsing state"} is sitting on a stockpile his government has forgotten about, with missiles, launchers and a frigate rusting at its moorings. He wants out, and money, and he'll sell the lot for ¤400,000.`,
    options: [
      { id: "buy", label: "Buy it", note: "¤400,000", resolve: (s) => { s.arcology.cash -= 400_000; const e = empireOf(s); e.arsenal.batteries = Math.min(4, (e.arsenal.batteries ?? 0) + 2); e.arsenal.patrol = Math.min(4, (e.arsenal.patrol ?? 0) + 1); e.arsenal.frigates = Math.min(3, (e.arsenal.frigates ?? 0) + 1); return `The commander gets his money and a flat in your residential ring. You get two missile batteries and a frigate, brought down the coast at night with her lights off.`; } },
      { id: "report", label: "Tell his government, for a price", resolve: (s) => { const p = powers(s).find((x) => x.kind === "region" && x.name === conflicts(s)[0]?.name); if (p) shift(s, p.id, 18); s.arcology.cash += 60_000; return `You sell his name to his own government for ¤60,000 and their goodwill. They thank you profusely. He's never heard from again.`; } },
      { id: "no", label: "Leave it alone", resolve: () => `You leave it. A month later the stockpile turns up in the hands of a militia, and the frigate is shelling a port you trade with.` },
    ],
  },
  {
    id: "gx_putsch", severity: "major", endogenous: false,
    candidates: (s) => ((s.arcology.public_standing <= -3 || (activeWars(s).some((w) => w.weeks > 10) && s.arcology.security < 40)) ? [{}] : []),
    weight: () => 3,
    seed: () => `Your security chief locks the door before he speaks. Three of your own militia officers have been meeting in the barracks after dark, with a list of names, a radio schedule and a draft of a speech that begins "The owner has failed this city." They mean to move within the week.`,
    options: [
      { id: "purge", label: "Arrest them tonight, and everyone on the list", resolve: (s) => { s.arcology.security = clamp(s.arcology.security - 8, 0, 100); s.arcology.public_standing = clamp(s.arcology.public_standing - 1, -10, 10); s.arcology.crime = clamp(s.arcology.crime - 5, 0, 100); return `Forty arrests by dawn. The officers are tried in a day and the city watches. Nobody plots again soon, but nobody trusts anybody in the militia either.`; } },
      { id: "machines", label: "Let the machines handle it", resolve: (s) => { if (units(s, "androids") || (s.arcology.defenses?.sentinels ?? 0) > 0) { s.arcology.security = clamp(s.arcology.security + 5, 0, 100); return `Your machines don't have friends in the militia, and they don't hesitate. It's over in an hour and nobody outside the barracks hears a shot.`; } s.arcology.security = clamp(s.arcology.security - 15, 0, 100); return `You have no machines to send. The officers hear you know, move early, and it takes two days of fighting in the barracks before it's over.`; } },
      { id: "bribe", label: "Buy them back", note: "¤80,000", resolve: (s) => { s.arcology.cash -= 80_000; s.arcology.public_standing = clamp(s.arcology.public_standing + 1, -10, 10); return `You double their pay and promote two of them. The speech goes in a drawer. It's still in the drawer, and you know where the drawer is.`; } },
    ],
  },
  {
    id: "gx_engineer", severity: "minor", endogenous: true,
    candidates: (s) => (once(s, "engineer") && skill(s, "engineering") >= 45 ? [{}] : []),
    weight: () => 2,
    seed: () => `An engineer has been sending you plans for six months, each one more ambitious, and this week you finally read one. It's a sea wall that generates power from the tide and grows food behind it, and it would work. She's waiting for an answer in a café on the concourse.`,
    options: [
      { id: "build", label: "Build it", note: "¤250,000", resolve: (s) => { done(s, "engineer"); s.arcology.cash -= 250_000; s.arcology.prosperity = clamp(s.arcology.prosperity + 12, 0, 200); s.arcology.food.production += 400; return `It takes a year and it works better than she promised. Your arcology grows its own food behind a wall that pays for itself, and the other Free Cities send engineers to copy it.`; } },
      { id: "arms", label: "Put her on weapons instead", resolve: (s) => { done(s, "engineer"); empireOf(s).readiness = 100; s.player.skills.engineering = clamp(skill(s, "engineering") + 5, 0, 100); return `She's disappointed, and then she's brilliant at it. Your forces have never been better maintained.`; } },
    ],
  },
  {
    id: "gx_marriage", severity: "notable", endogenous: false,
    candidates: (s) => (once(s, "marriage") && skill(s, "diplomacy") >= 35 && (friendliest(s)?.attitude ?? 0) >= 40 ? [{}] : []),
    weight: () => 2.5,
    seed: (s) => `${friendliest(s)?.name ?? "A friendly power"} sends a proposal sealed in wax, the old way. Its ruler has a daughter of marriageable age, educated, ambitious and not at all shy, and would like to see her married to you. An alliance would come with her, and so would a great deal of her family's influence.`,
    options: [
      { id: "marry", label: "Accept her", resolve: (s) => { done(s, "marriage"); const f = friendliest(s); const p = newcomer(s, `the daughter of ${f?.name ?? "a foreign ruler"}, betrothed to you to seal an alliance`, 0.95); p.status = "free"; p.exit_week = s.arcology.week; p.exit_note = `betrothed to you by ${f?.name ?? "her father"}`; const rom = romanceOf(p); rom.standing = "betrothed"; rom.since_week = s.arcology.week; p.bond = { ...p.bond, bond: 30, fear: 0, resentment: 5, hope: 70 }; if (f) { f.rec.status = "allied"; f.rec.pact = true; shift(s, f.id, 15); } return `${p.name} arrives with a retinue, a dowry and her own opinions. She's free, your fiancée and not your property, and ${f?.name ?? "her father's state"} is your ally from the day she lands.`; } },
      { id: "decline", label: "Decline, with every courtesy", resolve: (s) => { done(s, "marriage"); const f = friendliest(s); if (f) shift(s, f.id, -8); return `You decline with a letter that took three drafts. ${f?.name ?? "They"} are disappointed, and gracious about it in public.`; } },
    ],
  },
  {
    id: "gx_admirer", severity: "notable", endogenous: false,
    candidates: (s) => (once(s, "admirer") && flag(s, "deed_cruelty") + flag(s, "deed_punished") + flag(s, "deed_humiliated_her") >= 3 ? [{}] : []),
    weight: () => 2,
    seed: () => `The dictator of a hard little Old World state has been watching how you run your house, and admires it. He wants to visit, see your methods, and send his officers to learn from your people. He's offering a great deal of money and a treaty for the privilege.`,
    options: [
      { id: "host", label: "Host him, and show him everything", resolve: (s) => { done(s, "admirer"); s.arcology.cash += 200_000; s.arcology.rep = Math.max(0, s.arcology.rep - 400); for (const p of powers(s)) if (p.attitude < 0) shift(s, p.id, 8); else shift(s, p.id, -6); return `He stays a week and takes notes. His money arrives, and so does a reputation. The hard regimes of the world think of you as one of them now, and the rest of the world agrees.`; } },
      { id: "no", label: "Refuse him", resolve: (s) => { done(s, "admirer"); s.arcology.rep += 300; return `You turn him down. He's offended in public. Half the world respects you a little more for it, and he never stops trying to arrange a visit.`; } },
    ],
  },
  {
    id: "gx_prize", severity: "minor", endogenous: false,
    candidates: (s) => (once(s, "prize") && (freedInCity(s).length >= 2 || flag(s, "deed_freed_her") + flag(s, "deed_mercy") + flag(s, "deed_tenderness") >= 3) ? [{}] : []),
    weight: () => 2,
    seed: () => `An Old World foundation that has spent forty years condemning the Free Cities has, to its own embarrassment, decided to give you a prize. The women you've freed have been talking. The ceremony is in the north, and they'd like you to come in person.`,
    options: [
      { id: "go", label: "Go, and accept it graciously", resolve: (s) => { done(s, "prize"); s.arcology.rep += 1000; for (const p of powers(s)) if (p.kind === "region") shift(s, p.id, 15); return `You fly north and accept it in a hall full of people who hate what you are and applaud anyway. The photograph is on every front page in the Old World.`; } },
      { id: "mock", label: "Decline it, publicly and rudely", resolve: (s) => { done(s, "prize"); s.arcology.rep += adopted(s, "supremacist") + adopted(s, "degradationist") > 30 ? 600 : -200; for (const p of powers(s)) if (p.kind === "region") shift(s, p.id, -10); return `You tell them what you think of their prize and their forty years. Your citizens love it. The foundation gives the prize to someone else and writes a long statement about you.`; } },
    ],
  },
];
registerEvents(GRAND_EVENTS);
