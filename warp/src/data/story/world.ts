/**
 * WORLD ARCS — crises the simulation starts when the world has gone far enough.
 *
 * Unlike the deck, nothing here is drawn at random. The weather, the climate, your pollution, the
 * economy and the regions your docks trade with decide when each of these begins (engine/world.ts
 * checks `when` every week). Choices set flags that later arcs and the world itself read: a sea wall
 * you built blunts the next storm, refugees you enslaved turn up in the Daughters of Liberty.
 */
import type { ArcDef, Ctx } from "../../engine/story";
import { ownedAdults } from "../../engine/story";
import { worldOf, worstRegion, seasonOf } from "../../engine/world";
import { resolveAct } from "../../engine/intimacy";
import { read } from "../../engine/obedience";
import { clamp } from "../../engine/psyche";

const money = (n: number) => `¤${Math.round(n).toLocaleString()}`;
const cash = (n: number) => (c: Ctx) => (c.s.arcology.cash >= n ? null : `needs ${money(n)}`);
const secure = (n: number) => (c: Ctx) => (c.s.arcology.security >= n ? null : `needs security ${n}`);
const pop = (c: Ctx, n: number) => {
  c.s.arcology.population = Math.max(200, Math.round(c.s.arcology.population + n));
  c.out.push(`${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n)).toLocaleString()} citizens`);
};
const project = (c: Ctx, flag: string, what: string) => { c.set(flag, true); c.out.push(what); };
/** The region the crisis is about, remembered on the arc so every beat names the same place. */
const regionName = (c: Ctx, key: string) => String(c.flag(key) ?? "the Old World");
const household = (c: Ctx) => ownedAdults(c.s);

/* ── the storm ──────────────────────────────────────────────────────────────────────────────── */

const storm: ArcDef = {
  id: "w_storm", title: "Storm Season", kind: "world", repeat: 26,
  when: (s) => {
    const w = worldOf(s);
    const season = seasonOf(s.arcology.week);
    return w.forecast.some((f) => f.kind === "superstorm") || ((season === "autumn" || season === "summer") && w.strain > 30 && w.forecast.some((f) => f.kind === "storm"));
  },
  start: "warning",
  beats: {
    warning: {
      title: "A storm is coming",
      text: (c) => `The weather service has upgraded the system off the coast to a superstorm. It will make landfall within two weeks, and ${c.arcology} is squarely in its path.

Your engineers give you the numbers. The spire itself will stand; it was built for this. The outer rings are another matter: the housing blocks, the shops and the docks were built cheap and fast, and a direct hit will tear the cladding off them and flood the lower levels. The citizens who live there are watching the forecast and waiting to see what you do.

${c.flag("sea_wall") ? "Your sea wall will take the worst of the surge." : "There is no sea wall. The surge will come straight in."}${c.flag("shutters") ? " The storm shutters you installed last time are still in place." : ""}`,
      options: [
        { id: "shutters", label: "Pay to shutter and brace the outer rings", note: "¤15,000; much less damage", need: cash(15000), show: (c) => !c.flag("shutters"),
          run: (c) => { c.cash(-15000); project(c, "shutters", "the outer rings are storm-proofed for good"); c.standing(1);
            return { text: `Crews work around the clock fitting steel shutters over every window on the outer rings and bracing the dock cranes. Your citizens see it happening and feel a lot better about living in your arcology.

The shutters stay up after the storm, too. The next one will find them waiting.`, next: "landfall", after: 1 }; } },
        { id: "slaves", label: "Put your slaves to work sandbagging the docks", note: "free, but hard on them",
          run: (c) => { for (const p of household(c)) { p.health.energy = clamp(p.health.energy - 25, 0, 100); } c.household("coercion", 2, "made to sandbag the docks before the storm"); c.set("storm_sandbags", true);
            return { text: `You turn out the whole household to fill and stack sandbags along the dock walls. They work for three days straight in the wind and the rain, soaked and exhausted, while the citizens watch from behind their windows.

The walls are as ready as they're going to get. Your slaves are dead on their feet.`, next: "landfall", after: 1 }; } },
        { id: "evacuate", label: "Evacuate the outer rings into the spire", note: "costs goodwill with nobody; costs you rent and space",
          run: (c) => { c.cash(-4000); c.set("storm_evac", true); c.standing(2); c.hope(3);
            return { text: `You open the spire's lower floors and tell the outer rings to come in. Thousands of citizens file into your atriums and corridors with bags and children and pets, and camp there. It costs you a week's rents and a lot of cleaning.

Nobody on the outer rings is going to die in this storm, and they all know who to thank.`, next: "landfall", after: 1 }; } },
        { id: "nothing", label: "Do nothing; the spire will stand",
          run: (c) => { c.set("storm_nothing", true);
            return { text: `You tell your engineers the spire will stand and the rest is insured. Word gets around the outer rings that you aren't going to do anything, and the people who can afford to leave start packing.`, next: "landfall", after: 1 }; } },
      ],
    },
    landfall: {
      title: "Landfall",
      text: (c) => {
        const prepared = c.flag("shutters") || c.flag("sea_wall");
        return `The storm hits at night. The wind is so loud in the spire that nobody sleeps, and by morning the outer rings look like a war zone. ${prepared ? "The shutters held on most of the blocks, and the damage is mostly cosmetic." : c.flag("storm_sandbags") ? "The sandbags kept the docks dry, but the housing blocks took a beating." : "Whole walls of cladding are gone from the housing blocks, the docks are flooded, and the shops on the commercial row are full of seawater."}

At dawn your security chief calls. A section of the outer ring has collapsed, and there are people trapped under it. At the same time, the docks are flooding, and the warehouse holding this month's imports is going under.

Your crews can't do both.`;
      },
      options: [
        { id: "people", label: "Send everyone to dig out the trapped citizens",
          run: (c) => { const loss = c.flag("shutters") ? 3000 : 12000; c.cash(-loss); c.standing(3); c.rep(400); pop(c, -20);
            return { text: `Your crews dig for eleven hours. They pull out forty-one people alive and nine dead. The footage of your security teams carrying children out of the rubble plays on every screen in the region.

The warehouse floods. ${money(loss)} of imports are ruined.`, next: "aftermath", after: 1 }; } },
        { id: "cargo", label: "Save the warehouse; the trapped citizens can wait",
          run: (c) => { c.standing(-3); c.rep(-300); pop(c, -60); c.rumor("the owner saved the cargo and left people to drown", -1);
            return { text: `Your crews save the imports. By the time anyone gets to the collapsed section, it's too late for most of the people under it. Sixty dead.

The cargo is fine. Nobody in the outer rings will ever forget what you chose.`, next: "aftermath", after: 1 }; } },
        { id: "slave_rescue", label: "Send your slaves into the rubble instead of your crews",
          pick: { label: "Who leads the rescue", filter: (p) => p.health.health > -10 },
          run: (c, p) => { if (!p) return { text: "" }; const brave = read(p).devotion > 30 || p.skills.combat > 30; c.cash(-3000);
            if (brave) { c.treat(p, "recognition", 9, "led the rescue after the storm"); p.fame.prestige = Math.max(p.fame.prestige, 1) as 1; p.fame.why = "dug citizens out of the rubble after the superstorm"; c.standing(3); c.rep(600);
              return { text: `${p.name} leads a team of your slaves into the collapsed section with shovels and bare hands. They work all day and pull thirty-eight people out alive, while your crews save the warehouse.

By evening ${p.name} is a hero on the outer rings. Citizens stop her in the corridors to thank her, and it's done wonders for her.`, next: "aftermath", after: 1 }; }
            p.health.health = clamp(p.health.health - 30, -100, 100); p.health.injuries.push({ what: "crushed in the rubble after the storm", severity: "notable", week: c.week }); c.treat(p, "cruelty", 7, "sent into the rubble after the storm"); c.standing(-1);
            return { text: `${p.name} is terrified and doesn't know what she's doing. Part of the rubble shifts while she's under it, and she's pulled out with a crushed leg. The rescue goes badly without anyone who knows what they're doing.

Your crews save the warehouse, at least.`, next: "aftermath", after: 1 }; } },
      ],
    },
    aftermath: {
      title: "After the storm",
      text: (c) => `The storm has moved on up the coast. The outer rings are being cleaned up, and the insurers are arguing about who pays for what.

${c.full("rival_owner")}'s arcology across the strait took a direct hit and is in much worse shape than yours. Half of its housing blocks are uninhabitable, and its owner is short of cash. ${c.He("rival_owner")} has quietly let it be known that some of ${c.his("rival_owner")} blocks could be for sale, cheap, to the right buyer.

Meanwhile, the families who lost their homes in your outer ring are sleeping in the atrium.`,
      options: [
        { id: "buy", label: "Buy a share of the neighbor's arcology while it's cheap", note: "¤25,000", need: cash(25000),
          run: (c) => { c.cash(-25000); const n = c.s.arcology.neighbours[0]; if (n) { n.ownership = clamp(n.ownership + 12, 0, 100); n.attitude = clamp(n.attitude - 15, -100, 100); } c.like("rival_owner", -20);
            return { text: `You buy up twelve percent of the damaged arcology at a fraction of what it was worth a month ago. ${c.n("rival_owner")} signs the papers with a very sour expression. You're now a significant shareholder in your neighbor.`, end: "you bought into your neighbor after the storm" }; } },
        { id: "rebuild", label: "Rebuild the outer ring properly, with a sea wall", note: "¤30,000; the next storm will do far less", need: cash(30000), show: (c) => !c.flag("sea_wall"),
          run: (c) => { c.cash(-30000); project(c, "sea_wall", "a sea wall now protects the arcology"); c.prosperity(4); c.standing(2);
            return { text: `You hire engineers to rebuild the outer ring to a higher standard and throw up a proper sea wall along the waterfront. It's expensive and takes months, but when it's done, ${c.arcology} will shrug off storms that would flatten its neighbors.`, end: "you built a sea wall after the storm" }; } },
        { id: "families", label: "Let the homeless families sell themselves into slavery", note: "cheap slaves; a lot of bitterness",
          run: (c) => { for (let i = 0; i < 2; i++) c.addSlave({ seed: `stormfam${c.week}:${i}`, age: 20 + i * 7, quality: 0, how: "sold herself into slavery after the superstorm took her home", hostile: i === 1 }); c.standing(-2); c.rumor("the owner is buying storm victims for next to nothing", -1);
            return { text: `You set up a table in the atrium where anyone who lost everything can sign themselves over in exchange for food and a bed. A lot of people walk past it. Two young women sign.

The rest of the outer ring watches, and will remember that this was what you offered.`, end: "you bought storm victims as slaves" }; } },
        { id: "shelter", label: "House the families at your own expense until they're back on their feet", note: "¤8,000", need: cash(8000),
          run: (c) => { c.cash(-8000); c.standing(3); c.hope(4); pop(c, 40);
            return { text: `You put the families up in empty apartments in the spire and feed them until their blocks are repaired. It costs you, but word spreads, and people from other arcologies start asking about moving to ${c.arcology}.`, end: "you sheltered the storm's homeless" }; } },
      ],
    },
  },
};

/* ── the drought ────────────────────────────────────────────────────────────────────────────── */

const drought: ArcDef = {
  id: "w_drought", title: "The Dry Summer", kind: "world", repeat: 40,
  when: (s) => { const w = worldOf(s); return seasonOf(s.arcology.week) === "summer" && w.strain > 28 && w.weather.kind === "heatwave" && !s.story?.flags["desal"]; },
  // The slave the riot beat is about: the one most likely to give the water away.
  subject: (s) => ownedAdults(s).sort((a, b) => b.persona.conscience - a.persona.conscience)[0],
  start: "rationing",
  beats: {
    rationing: {
      title: "The reservoirs are low",
      text: (c) => `The heatwave has lasted long enough that ${c.arcology}'s reservoirs are down to a third. The water barges that normally top them up are being fought over by every arcology on the coast, and the price has tripled.

Your engineers say you have enough for about five weeks at the current rate. The citizens use most of it. Your household uses a surprising amount too: the dairy, the spa and the clinic all run on water, and ${household(c).length} slaves need to drink and wash.`,
      options: [
        { id: "barges", label: "Outbid everyone for water barges", note: "¤18,000", need: cash(18000),
          run: (c) => { c.cash(-18000); c.set("drought_bought", true); c.like("rival_owner", -10);
            return { text: `You pay whatever it takes. Three barges that were headed for your neighbor's arcology turn around and dock at yours instead. Your reservoirs are topped up. ${c.n("rival_owner")}'s aren't, and ${c.he("rival_owner")} knows exactly why.`, next: "riot", after: 2 }; } },
        { id: "slaves", label: "Cut the household's water to the bare minimum",
          run: (c) => { for (const p of household(c)) { p.health.health = clamp(p.health.health - 6, -100, 100); p.health.energy = clamp(p.health.energy - 10, 0, 100); } c.household("cruelty", 3, "made to go without water in the heatwave"); c.set("drought_slaves", true);
            return { text: `Your slaves get one cup of water with each meal and a bucket to wash in once a week. The dairy cows are the only ones who get enough. Within days the whole household is irritable, headachy and filthy.

The citizens don't notice any difference, which was the point.`, next: "riot", after: 2 }; } },
        { id: "citizens", label: "Ration the citizens", note: "the household is spared; the city is not",
          run: (c) => { c.standing(-2); c.prosperity(-3); c.set("drought_citizens", true);
            return { text: `You put the whole arcology on water rationing: taps run two hours a day in the residential blocks, and the fountains on the concourse are shut off. The citizens grumble, and some of them start noticing that the penthouse fountains are still running.`, next: "riot", after: 2 }; } },
      ],
    },
    riot: {
      title: "At the pumps",
      text: (c) => c.flag("drought_bought")
        ? `The water barges saved you, but the heat hasn't broken. Across the strait, ${c.n("rival_owner")}'s citizens are rioting over water. Some of them have started taking boats across to your docks to buy water on the black market, and your security chief wants to know what to do about them.

One of your slaves, ${c.sn}, has been caught selling water from the dairy tanks to the boat people.`
        : `A crowd has gathered at the public pumps on the lower levels, and it's getting ugly. Someone has spread the story that the penthouse is using more water than the whole outer ring put together, which isn't far from true.

In the middle of it, your security team catches one of your slaves, ${c.sn}, carrying buckets of water out of the dairy to the families at the pumps.`,
      options: [
        { id: "punish", label: "Punish her publicly for stealing water",
          run: (c) => { if (c.subj) { resolveAct(c.s, c.subj, "discipline"); c.treat(c.subj, "cruelty", 8, "punished in public for giving water away"); } c.household("coercion", 3, "saw her punished for the water"); c.standing(-1); c.crime(-3);
            return { text: `You have ${c.sn} whipped at the pumps in front of the crowd, as a thief. The crowd goes quiet and breaks up. Your slaves hear about it by dinner, and they understand what it means.`, next: "fix", after: 2 }; } },
        { id: "reward", label: "Let her keep doing it, officially",
          run: (c) => { c.treat(c.subj, "recognition", 8, "allowed to carry water to the families at the pumps"); c.cash(-3000); c.standing(3); c.crime(-2);
            return { text: `You tell your security team to let her go, and then you make it official: ${c.sn} and two others will carry water from the penthouse reserve to the pumps every morning. It costs you, but the crowd at the pumps breaks up, and people on the lower levels start talking about you differently.`, next: "fix", after: 2 }; } },
        { id: "police", label: "Break up the crowd", need: secure(40),
          run: (c) => { c.security(2); c.standing(-3); c.crime(4); c.treat(c.subj, "coercion", 4, "caught stealing water");
            return { text: `Your security teams clear the pumps with batons. Nobody dies, but plenty of people are hurt, and the footage makes the rounds. ${c.sn} is taken back upstairs and locked in her room for a week.`, next: "fix", after: 2 }; } },
      ],
    },
    fix: {
      title: "Water for good",
      text: (c) => `The heat finally breaks in late summer, and the rain refills the reservoirs. Everyone knows it will happen again next year, and the year after, worse each time.

${c.full("engineer")}, an engineer who builds desalination plants for arcologies up and down the coast, has sent you a proposal: a plant on your docks that would turn seawater into drinking water, enough that ${c.arcology} would never need a water barge again.`,
      options: [
        { id: "build", label: "Build the desalination plant", note: "¤35,000; no more water crises", need: cash(35000),
          run: (c) => { c.cash(-35000); project(c, "desal", "a desalination plant supplies the arcology's water"); c.like("engineer", 25); c.prosperity(5);
            return { text: `${c.n("engineer")} builds it in four months. It's ugly, loud and runs on a lot of power, but it works. The next time a heatwave hits, ${c.arcology}'s taps keep running while the arcologies around you ration.`, end: "you built a desalination plant" }; } },
        { id: "sell", label: "Build it, and sell water to your neighbors", note: "¤45,000; pays back every heatwave", need: cash(45000),
          run: (c) => { c.cash(-45000); project(c, "desal", "a desalination plant supplies the arcology's water"); c.set("water_seller", true); c.like("engineer", 30); c.prosperity(6); for (const n of c.s.arcology.neighbours) n.attitude = clamp(n.attitude + 8, -100, 100);
            return { text: `You have ${c.n("engineer")} build it twice as big as you need. Next summer your neighbors will be buying their water from you, and they'll be a lot more polite about it.`, end: "you became the coast's water seller" }; } },
        { id: "skip", label: "Not worth it",
          run: () => ({ text: `You file the proposal. The reservoirs are full, for now.`, end: "you didn't fix the water supply" }) },
      ],
    },
  },
};

/* ── the boats ──────────────────────────────────────────────────────────────────────────────── */

const boats: ArcDef = {
  id: "w_boats", title: "The Boats", kind: "world", repeat: 30,
  when: (s) => !!worstRegion(s, ["collapse", "war"]) && s.arcology.week >= 6,
  start: "flotilla",
  beats: {
    flotilla: {
      title: "A flotilla offshore",
      text: (c) => {
        const reg = worstRegion(c.s, ["collapse", "war"]);
        if (reg && !c.flag("boats_region")) c.set("boats_region", reg.name);
        const where = regionName(c, "boats_region");
        return `At dawn your harbor master counts more than two hundred boats anchored off ${c.arcology}: fishing boats, ferries, yachts, anything that floats, all of them packed with people fleeing ${where}. The Free Cities to the north have already turned them away.

A woman rows over to your docks under a white sheet. She says her name is ${c.full("refugee")}, and that she speaks for the flotilla. There are about three thousand people out there. They have no food left and some of the children are sick.

"We'll work," she says. "We'll do anything. We just need somewhere to land."`;
      },
      options: [
        { id: "citizens", label: "Take them in as citizens", note: "a lot more people; more crime at first",
          run: (c) => { pop(c, 1400); c.crime(8); c.standing(2); c.like("refugee", 30); c.set("boats_citizens", true); c.cash(-6000);
            return { text: `You let them land. It takes three days to process them all, and your security teams are stretched thin. You house them in the emptiest blocks of the outer ring and put them to work.

The first few weeks are rough: crime goes up, and the established citizens complain. But three thousand people who owe you everything is not a bad thing to have.`, next: "settling", after: 3 }; } },
        { id: "enslave", label: "Take them in as slaves", note: "the whole flotilla goes to the pens",
          run: (c) => { c.set("boats_enslaved", true); c.like("refugee", -60); c.rep(-200); c.cash(30000);
            for (let i = 0; i < 3; i++) c.addSlave({ seed: `boat${c.week}:${i}`, age: 19 + i * 6, quality: 0.1 + i * 0.1, how: `came on the refugee boats from ${regionName(c, "boats_region")} and was enslaved on the dock`, hostile: true });
            c.addSlave({ seed: `boatleader${c.week}`, name: c.full("refugee"), age: 34, quality: 0.3, how: "spoke for the refugee flotilla, and was enslaved with the rest of them", hostile: true }); c.npc("refugee").status = "owned";
            c.rumor("the owner enslaved the whole refugee flotilla", -1);
            return { text: `You let them land, and your security teams collar every one of them on the dock. Most are processed and sold on through the market; the proceeds come to ${money(30000)}. You keep the best few, and ${c.n("refugee")} herself.

She doesn't fight when they put the collar on her. She just looks at you. Somewhere in ${regionName(c, "boats_region")}, the story of what happens to people who land at ${c.arcology} will be told for years.`, next: "echo", after: 5 }; } },
        { id: "some", label: "Take only the young women, and send the rest on",
          run: (c) => { c.set("boats_some", true); c.like("refugee", -30); c.rep(-100); c.standing(-1);
            for (let i = 0; i < 2; i++) c.addSlave({ seed: `boatgirl${c.week}:${i}`, age: 19 + i * 3, quality: 0.3, how: "was taken off the refugee boats while her family was sent on", hostile: i === 0 });
            return { text: `Your security teams go boat to boat and take off the young women, and you tell the rest to find somewhere else. There's screaming as families are split up on the dock.

${c.n("refugee")} is still standing on the dock when the flotilla turns north. She doesn't get back in her boat.`, next: "echo", after: 5 }; } },
        { id: "refuse", label: "Turn them away",
          run: (c) => { c.set("boats_refused", true); c.like("refugee", -40); for (const n of c.s.arcology.neighbours) n.attitude = clamp(n.attitude - 5, -100, 100);
            return { text: `Your harbor patrols escort the flotilla back out to sea. By nightfall it has gone south, toward ${c.s.arcology.neighbours[0]?.name ?? "the next arcology down the coast"}, which will now have to deal with it. Your neighbors won't thank you for that.`, end: "you turned the refugee boats away" }; } },
      ],
    },
    settling: {
      title: "The new citizens",
      text: (c) => `Three weeks on, the refugees from ${regionName(c, "boats_region")} are settling into the outer ring. They've opened food stalls and repair shops, they work the jobs your citizens won't, and they're pushing the crime rate up and the wages down.

${c.n("refugee")} comes to see you with two requests. The refugees want a school for their children. And a group of the young women want to know if they can sign up as indentured servants in your household, for a year, in exchange for money to send to their families.`,
      options: [
        { id: "school", label: "Build the school", note: "¤8,000", need: cash(8000),
          run: (c) => { c.cash(-8000); c.like("refugee", 20); c.prosperity(4); c.crime(-4);
            return { text: `The school opens a month later in an old warehouse. The refugee children stop running around the concourse, their parents start trusting you, and crime in the outer ring falls.`, end: "the refugees became citizens" }; } },
        { id: "indenture", label: "Take the young women as indentured servants",
          run: (c) => { for (let i = 0; i < 2; i++) { const p = c.addSlave({ seed: `boatind${c.week}:${i}`, age: 19 + i * 2, quality: 0.3, how: "signed a year's indenture to send money to her family", devoted: i === 0 }); p.status = "indentured"; p.indenture_weeks = 52; } c.like("refugee", 5);
            return { text: `Two young women sign year-long indentures and move into your household. They're nervous, but they're here by choice, and it shows in how hard they work.`, end: "refugees joined your household as indentured servants" }; } },
        { id: "both", label: "Both", need: cash(8000),
          run: (c) => { c.cash(-8000); c.like("refugee", 25); c.prosperity(4); for (let i = 0; i < 2; i++) { const p = c.addSlave({ seed: `boatind${c.week}:${i}`, age: 19 + i * 2, quality: 0.3, how: "signed a year's indenture to send money to her family", devoted: true }); p.status = "indentured"; p.indenture_weeks = 52; }
            return { text: `You give them the school and the indentures. ${c.n("refugee")} shakes your hand for a long time. The refugee quarter becomes one of the most loyal parts of your arcology.`, end: "the refugees became some of your most loyal citizens" }; } },
      ],
    },
    echo: {
      title: "Someone came looking",
      text: (c) => `A man has come to ${c.arcology} on the ferry from ${regionName(c, "boats_region")}, asking questions on the docks about the boats that landed here. He's carrying photographs.

Your security chief has him in a back room. He's harmless on his own, but he's been talking to people on the concourse, and at least one of your slaves from the boats, ${household(c).find((p) => /refugee|boats/.test(p.origin.acquired_how))?.name ?? "one of the women"}, has heard that her brother is in the arcology looking for her.`,
      options: [
        { id: "sell", label: "Sell her back to him", note: "whatever he can pay",
          run: (c) => { const p = household(c).find((x) => /refugee|boats/.test(x.origin.acquired_how)); if (p) c.remove(p, "free", "bought back by her brother", 4000); c.hope(5);
            return { text: `He has four thousand, which he raised by selling everything he owned. You take it. She walks out of the arcology with him, and the other women from the boats watch her go.`, end: "a brother bought one of the boat women back" }; } },
        { id: "take", label: "Have him taken too", need: secure(35),
          run: (c) => { c.crime(2); c.set("liberty_recruits", true); c.rumor("people who come looking for the boat women disappear", -1);
            return { text: `He disappears from the back room that night. You don't ask where he goes. His photographs end up in a drawer.

Back in ${regionName(c, "boats_region")}, his family waits for word that never comes, and someone there starts writing letters to people who fight against the Free Cities.`, end: "the man who came looking disappeared" }; } },
        { id: "away", label: "Put him back on the ferry",
          run: (c) => { c.set("liberty_recruits", true);
            return { text: `You have him put back on the ferry with a warning. He shouts the whole way down the dock. You get the feeling this isn't the last you'll hear of the boats.`, end: "you sent the man looking for the boat women away" }; } },
      ],
    },
  },
};

/* ── the Daughters of Liberty ───────────────────────────────────────────────────────────────── */

function libertyReady(s: import("../../engine/types").SaveState): boolean {
  if (s.arcology.week < 14) return false;
  // With the main plot running, the Daughters of Liberty come through its chapters instead.
  if (s.story?.plot) return false;
  const st = s.story;
  const house = ownedAdults(s);
  const resent = house.length ? house.reduce((n, p) => n + p.bond.resentment, 0) / house.length : 0;
  return !!st?.flags["liberty_recruits"] || !!st?.flags["boats_enslaved"] || resent > 40 || s.arcology.crime > 45 || s.arcology.public_standing < -4 || s.arcology.week >= 34;
}

const liberty: ArcDef = {
  id: "w_liberty", title: "The Daughters of Liberty", kind: "world",
  when: libertyReady,
  cast: ["insurgent"],
  start: "leaflets",
  beats: {
    leaflets: {
      title: "Leaflets",
      text: (c) => `Your security chief brings you a leaflet found in the servants' laundry. It's cheaply printed, with a crude drawing of a broken collar and the words "THE DAUGHTERS OF LIBERTY — NO MORE MASTERS."

The Daughters of Liberty are an anti-slavery group from the Old World. They've bombed slave markets in three Free Cities, and they recruit from slaves and from the poor. ${c.flag("boats_enslaved") ? "Your security chief thinks the flotilla you enslaved was the spark: some of the new slaves had family who ended up with the Daughters." : "Your security chief thinks they've been in the arcology for months, waiting."}

There are more leaflets in the dormitories. Someone in your household is passing them around.`,
      options: [
        { id: "search", label: "Search the household and find out who", note: "everyone is questioned",
          run: (c) => { c.household("coercion", 3, "questioned about the Daughters of Liberty"); c.set("lib_searched", true); c.security(3);
            return { text: `Your security teams take the dormitories apart and question every slave. Nobody admits anything, but everyone is frightened, and the leaflets stop appearing.

Your security chief isn't satisfied. "Whoever it is has gone quiet," she says. "That's not the same as gone."`, next: "bomb", after: 3 }; } },
        { id: "watch", label: "Leave them in place and watch who picks them up", need: (c) => (c.skill("hacking") >= 20 || c.s.arcology.security >= 40 ? null : "needs hacking 20 or security 40"),
          run: (c) => { c.set("lib_watched", true); c.security(2);
            return { text: `You have cameras put in the laundry and the dormitories and let the leaflets keep circulating. Within a week you know exactly which slave is passing them around, and who she's meeting on the lower levels.`, next: "bomb", after: 3 }; } },
        { id: "better", label: "Treat the household better, and give the Daughters nothing to recruit with", note: "¤5,000 a month in comforts",
          run: (c) => { c.cash(-5000); c.household("kindness", 5, "better food, better beds, more rest"); c.hope(8); c.set("lib_soft", true);
            return { text: `You order better food, new mattresses and an extra rest day for the whole household. The slaves don't know why, but they notice, and the leaflets start ending up in the trash instead of under pillows.`, next: "bomb", after: 4 }; } },
      ],
    },
    bomb: {
      title: "The bomb",
      text: (c) => `At noon on a busy market day, a bomb goes off in ${c.s.arcology.facilities["arcade"]?.level ? "the corridor outside the arcade" : "the slave market on the commercial level"}. It isn't a big one, but the concourse is packed. Four citizens are dead, twenty are hurt, and the market is wrecked.

The Daughters of Liberty claim it within the hour, in a message broadcast on every screen in the arcology. It's read by a woman in a mask who calls herself ${c.n("insurgent")}. "Every master is a target," she says. "Every slave in ${c.arcology} has sisters outside. We are coming for you."

${c.flag("lib_watched") ? "Your cameras caught the slave who planted it. You know who she is and where she is right now." : c.flag("lib_soft") ? "Your own household is shocked. Several of your slaves come to you on their own to say they had nothing to do with it." : "Your security chief has no idea who planted it."}`,
      options: [
        { id: "crackdown", label: "Lock down the arcology and hunt them", need: secure(45),
          run: (c) => { c.security(5); c.crime(-8); c.standing(-2); c.prosperity(-3); c.set("lib_crackdown", true);
            return { text: `You close the arcology for three days. Security teams go floor by floor. Citizens are searched in the street and anyone who argues is arrested. By the end of it you have eleven suspects in the cellblock and a very frightened population.

${c.n("insurgent")} isn't among them.`, next: "cell", after: 2 }; } },
        { id: "arrest_slave", label: "Arrest the slave who planted it", show: (c) => !!c.flag("lib_watched"),
          pick: { label: "Who did the cameras catch", filter: (p) => read(p).devotion < 30 },
          run: (c, p) => { if (!p) return { text: "" }; p.assignment = "be confined in the cellblock"; c.treat(p, "cruelty", 10, "arrested for the Daughters of Liberty bombing"); c.set("lib_informant", p.id); c.security(4);
            return { text: `${p.name} is dragged out of the laundry and into the cellblock. She doesn't deny it. After two days she tells you where the cell meets: a disused pump room on the lower levels.`, next: "cell", after: 1 }; } },
        { id: "reward", label: "Offer a huge reward for information", note: "¤20,000", need: cash(20000),
          run: (c) => { c.cash(-20000); c.set("lib_reward", true); c.standing(1);
            return { text: `You put up twenty thousand for information. Within a week three citizens and one of your own slaves come forward with the same address: a disused pump room on the lower levels.`, next: "cell", after: 1 }; } },
        { id: "memorial", label: "Hold a memorial for the dead and keep your nerve",
          run: (c) => { c.standing(3); c.rep(300); c.cash(-3000);
            return { text: `You pay for the funerals and speak at the memorial on the concourse. You don't close the arcology or round anyone up. Your citizens are frightened, but they're more angry at the Daughters than at you.`, next: "cell", after: 3 }; } },
      ],
    },
    cell: {
      title: (c) => `${c.n("insurgent")}`,
      text: (c) => `${c.flag("lib_informant") || c.flag("lib_reward") ? "You know where they are." : "Your security chief finally finds them, after weeks of searching."} The Daughters' cell in ${c.arcology} is five people living in a disused pump room on the lower levels: three escaped slaves, a citizen who used to work at the docks, and their leader, ${c.full("insurgent")}.

She's in her thirties, with a scar across her throat and a slave brand on her shoulder that someone tried to burn off. She was a slave in a Free City once, and she escaped.

Your security teams have the pump room surrounded. They're waiting for your order.`,
      options: [
        { id: "storm", label: "Storm it", need: secure(40),
          run: (c) => { c.security(3); c.crime(-10);
            if (c.s.arcology.security >= 60) { const p = c.addSlave({ seed: "insurgent", name: c.full("insurgent"), age: 34, quality: 0.5, how: "led the Daughters of Liberty in your arcology, and was captured", hostile: true }); c.npc("insurgent").status = "owned"; c.npc("insurgent").person = p.id; p.skills.combat = 60;
              return { text: `Your security teams go in with gas and stun batons. Two of the Daughters die fighting. ${c.n("insurgent")} is taken alive, bleeding from the head, and brought to your office in cuffs.

She spits at you. The collar goes on her anyway. The most wanted woman in the region is now a slave in your household.`, end: "you captured the leader of the Daughters of Liberty" }; }
            c.npc("insurgent").status = "gone"; c.standing(-1);
            return { text: `Your security teams go in, and it goes badly. The Daughters set off a charge in the pump room; two of your guards die, and all five insurgents die with them. At least, everyone assumes all five: nobody can identify what's left of ${c.n("insurgent")}.`, end: "the Daughters' cell was destroyed" }; } },
        { id: "talk", label: "Go in alone and talk to her",
          run: (c) => { c.like("insurgent", 20); c.set("lib_talked", true);
            const kind = household(c).reduce((n, p) => n + read(p).devotion, 0) / Math.max(1, household(c).length) > 30;
            if (kind) { c.npc("insurgent").status = "gone"; c.standing(2);
              return { text: `You walk into the pump room with your hands open. ${c.n("insurgent")} keeps a gun on you the whole time you talk. You tell her to go and ask your slaves what their lives are like.

She does. She talks to three of them over two days, under your guards' noses. At the end of it she takes her people and leaves ${c.arcology} on the evening ferry. "There are worse places than yours," she says. "I'll be busy with those."`, end: "the Daughters of Liberty left your arcology alone" }; }
            c.household("coercion", 2, "the Daughters' leader walked out free");
            return { text: `You walk into the pump room and talk. ${c.n("insurgent")} listens, then tells you she's spoken to your slaves already, and she knows what your house is like. She lets you walk out. Then she and her people vanish into the lower levels again.

They'll be back.`, next: "strike", after: 6 }; } },
        { id: "wait", label: "Leave them be, and double the guard on the penthouse",
          run: (c) => { c.security(4); c.cash(-6000);
            return { text: `You don't move on the pump room. You double your personal guard instead. It feels like a truce. It isn't.`, next: "strike", after: 5 }; } },
      ],
    },
    strike: {
      title: "They come for you",
      text: (c) => `At three in the morning, the lights in the penthouse go out. Your guards report shooting on the service stairs. The Daughters of Liberty are in the building, and they're coming up.

Your household is awake and panicking in the dormitories. Some of them are going to be offered their freedom tonight by women with guns, and you don't know which of them will take it.`,
      options: [
        { id: "fight", label: "Hold the penthouse", note: (c) => `security ${Math.round(c.s.arcology.security)}; your slaves' loyalty matters`,
          run: (c) => { const loyal = household(c).filter((p) => read(p).devotion > 25).length; const strength = c.s.arcology.security + loyal * 6 + (c.s.arcology.mercenaries.hired ? 30 : 0);
            if (strength >= 80) { c.npc("insurgent").status = "dead"; c.standing(3); c.rep(500); c.hope(-2);
              return { text: `The attack breaks on the stairs. Your guards hold, and some of your own slaves block the service doors with furniture and refuse to open them. ${c.n("insurgent")} is killed on the fourteenth floor landing.

In the morning you walk past the dormitories and see who stayed. Almost all of them did.`, end: "you beat off the Daughters' attack" }; }
            const lost = household(c).filter((p) => read(p).devotion < 10).slice(0, 3); for (const p of lost) c.remove(p, "gone", "escaped with the Daughters of Liberty"); c.cash(-15000); c.standing(-2);
            return { text: `You hold the penthouse, barely. By dawn the Daughters are gone, and so are ${lost.length ? lost.map((p) => p.name).join(", ") : "none of your slaves, somehow"}. The service levels are wrecked.

${c.n("insurgent")} leaves a message on your desk: "They chose."`, end: "the Daughters freed some of your slaves" }; } },
        { id: "run", label: "Get to the panic room and let security deal with it",
          run: (c) => { const lost = household(c).filter((p) => read(p).devotion < 25).slice(0, 4); for (const p of lost) c.remove(p, "gone", "left with the Daughters of Liberty"); c.standing(-3);
            return { text: `You spend the night behind a steel door. By the time security clears the building, the Daughters have left, and they've taken ${lost.length} of your slaves with them. Everybody in the arcology knows you hid.`, end: "you hid while the Daughters raided your household" }; } },
      ],
    },
  },
};

/* ── plague ─────────────────────────────────────────────────────────────────────────────────── */

const plague: ArcDef = {
  id: "w_plague", title: "Fever", kind: "world", repeat: 40,
  when: (s) => !!worstRegion(s, ["plague"]) && (s.city?.routes.length ?? 0) > 0,
  cast: ["doctor"],
  start: "ship",
  beats: {
    ship: {
      title: "A quarantine request",
      text: (c) => {
        const reg = worstRegion(c.s, ["plague"]);
        if (reg && !c.flag("plague_region")) c.set("plague_region", reg.name);
        return `The fever in ${regionName(c, "plague_region")} has reached the coast. Every Free City is quarantining ships from there, and your harbor master has three sitting outside your breakwater: two freighters with your own cargo on them, and a hospital ship.

The freighters' crews look healthy, but nobody can be sure. The hospital ship is run by ${c.full("doctor")}, who says ${c.he("doctor")} has a treatment that works if it's given early, and needs a port with a clinic to make more of it.`;
      },
      options: [
        { id: "quarantine", label: "Keep everything out, including your own cargo", note: "safe; expensive",
          run: (c) => { c.cash(-8000); c.set("plague_sealed", true); c.like("doctor", -10);
            return { text: `You close the port. Your cargo sits offshore for three weeks and a lot of it spoils. ${c.n("doctor")}'s ship moves on to try somewhere else.`, next: "outbreak", after: 3 }; } },
        { id: "cargo", label: "Let the freighters in, and keep the hospital ship out",
          run: (c) => { c.set("plague_in", true);
            return { text: `The freighters dock and unload. The crews go ashore on the lower levels for the first time in a month, to drink and whore. ${c.n("doctor")}'s ship moves on.`, next: "outbreak", after: 2 }; } },
        { id: "doctor", label: "Let the hospital ship in and give the doctor your clinic", need: (c) => (c.s.arcology.facilities["clinic"]?.level ? null : "needs a clinic"),
          run: (c) => { c.set("plague_doctor", true); c.like("doctor", 30); c.cash(-5000);
            return { text: `${c.n("doctor")} moves into your clinic with two nurses and a crate of equipment, and starts making the treatment. You let the freighters in too, under ${c.his("doctor")} supervision.`, next: "outbreak", after: 2 }; } },
      ],
    },
    outbreak: {
      title: "It's in the arcology",
      text: (c) => `${c.flag("plague_sealed") ? "Despite the quarantine, the fever gets in anyway, probably on a fishing boat." : "The fever is in the arcology."} The first cases are on the lower levels. Then it's in your household: ${household(c).slice(0, 2).map((p) => p.name).join(" and ") || "one of your slaves"} ${household(c).length > 1 ? "are" : "is"} burning up in the dormitory.

${c.flag("plague_doctor") ? `${c.n("doctor")} has enough treatment for about half the people who need it. ${c.He("doctor")} wants to know who gets it first.` : "Without a treatment, all anyone can do is isolate the sick and hope."}`,
      options: [
        { id: "household", label: "Your household first", show: (c) => !!c.flag("plague_doctor"),
          run: (c) => { for (const p of household(c)) p.health.illness = 0; c.household("kindness", 4, "treated for the fever before the citizens"); c.standing(-3); pop(c, -80);
            return { text: `Your slaves get the treatment first. Every one of them recovers. The citizens on the lower levels hear about it, and eighty of them die waiting.`, next: "after", after: 3 }; } },
        { id: "citizens", label: "The citizens first", show: (c) => !!c.flag("plague_doctor"),
          run: (c) => { for (const p of household(c).slice(0, 2)) { p.health.illness = 3; p.health.health = clamp(p.health.health - 25, -100, 100); } c.standing(4); c.rep(400); pop(c, -15);
            return { text: `The treatment goes to the lower levels first. The epidemic there is stopped within two weeks. Two of your own slaves get very sick waiting for their turn, but they pull through.`, next: "after", after: 3 }; } },
        { id: "isolate", label: "Lock the sick slaves in the cellblock and seal the dormitory",
          run: (c) => { for (const p of household(c).slice(0, 2)) { p.health.health = clamp(p.health.health - 20, -100, 100); p.assignment = "be confined in the cellblock"; } c.household("cruelty", 3, "the sick were locked up during the fever"); pop(c, -120);
            return { text: `The sick are locked away, and the rest of the household is sealed in the dormitory for two weeks. The fever burns out, eventually. The lower levels, with no one to seal them in, lose a hundred and twenty people.`, next: "after", after: 3 }; } },
        { id: "buy_cure", label: "Buy treatment from an Old World pharmaceutical company", note: "¤20,000", need: cash(20000), show: (c) => !c.flag("plague_doctor"),
          run: (c) => { c.cash(-20000); for (const p of household(c)) p.health.illness = 0; c.standing(1); pop(c, -40);
            return { text: `You pay an Old World pharmaceutical company a fortune for a shipment of treatment. It arrives by air, and it works. Your household recovers, and so do most of the citizens.`, next: "after", after: 3 }; } },
      ],
    },
    after: {
      title: "After the fever",
      text: (c) => `The fever has burned out in ${c.arcology}. ${c.flag("plague_doctor") ? `${c.n("doctor")} is packing up. ${c.He("doctor")} says ${c.he("doctor")}'d stay, for a salary, if you wanted a proper doctor.` : "The dead have been cremated and the lower levels have been disinfected."}

Your trade partners are watching to see whether ${c.arcology} is safe to deal with again.`,
      options: [
        { id: "hire", label: "Hire the doctor", show: (c) => !!c.flag("plague_doctor"),
          run: (c) => { c.npc("doctor").status = "ally"; c.set("has_doctor", true); for (const p of household(c)) p.health.health = clamp(p.health.health + 10, -100, 100); c.s.player.skills.medicine = Math.min(100, (c.s.player.skills.medicine ?? 0) + 15); c.out.push("+15 medicine");
            return { text: `${c.n("doctor")} stays on. Your household is healthier for it within a month.`, end: "the fever doctor stayed on" }; } },
        { id: "reopen", label: "Reopen the port with a big trade fair", note: "¤6,000", need: cash(6000),
          run: (c) => { c.cash(-6000); c.prosperity(5); c.rep(300);
            return { text: `You throw a trade fair on the docks to show everyone that ${c.arcology} is open for business. It works: ships start coming back within the week.`, end: "you reopened the port after the fever" }; } },
        { id: "move_on", label: "Get back to business",
          run: () => ({ text: `You put the fever behind you. Trade picks back up slowly.`, end: "the fever passed" }) },
      ],
    },
  },
};

/* ── the crash ──────────────────────────────────────────────────────────────────────────────── */

const crash: ArcDef = {
  id: "w_crash", title: "The Crash", kind: "world", repeat: 40,
  when: (s) => worldOf(s).economy.phase === "crash",
  start: "panic",
  beats: {
    panic: {
      title: "The markets crash",
      text: (c) => `The Free Cities markets have crashed. A big bank in one of the northern arcologies has failed, and everyone is calling in their loans at once. Credit has dried up overnight.

In ${c.arcology}, the effect is immediate. Shops on the commercial row are closing. Citizens who lost their savings are behind on their rent. ${c.s.arcology.loans.length ? "Your own lenders have written to say they may call in your loans early." : "You don't owe anyone, which right now makes you one of the richest people on the coast."}`,
      options: [
        { id: "hoard", label: "Hold onto your cash and wait",
          run: (c) => { c.set("crash_hoard", true); c.prosperity(-4);
            return { text: `You sit on your cash and let the crash run its course. The commercial row gets quieter every week.`, next: "bargains", after: 2 }; } },
        { id: "rents", label: "Freeze rents for three months", note: "costs income; buys loyalty",
          run: (c) => { c.cash(-10000); c.standing(3); c.hope(2); c.prosperity(2);
            return { text: `You freeze rents across the arcology. It costs you, but the shops stay open and nobody is evicted. Your citizens know who kept a roof over their heads.`, next: "bargains", after: 2 }; } },
        { id: "evict", label: "Evict anyone who can't pay",
          run: (c) => { c.cash(6000); c.standing(-3); pop(c, -300); c.crime(5); c.set("crash_evicted", true);
            return { text: `Your bailiffs clear out every tenant who's behind. Three hundred people are put out on the concourse with their belongings. Some of them leave the arcology. The ones who stay are angry.`, next: "bargains", after: 2 }; } },
      ],
    },
    bargains: {
      title: "Everything is for sale",
      text: (c) => `Two weeks into the crash, everything in the Free Cities is for sale at a fraction of its value. A bankrupt arcology owner up the coast is liquidating his household at auction. ${c.flag("crash_evicted") ? "Some of the citizens you evicted are " : "Some of your poorer citizens are "}offering to sign themselves into slavery for their debts. And shares in your own arcology, held by investors who need cash, are selling cheap.`,
      options: [
        { id: "shares", label: "Buy back your own arcology's shares", note: "¤30,000", need: cash(30000),
          run: (c) => { c.cash(-30000); c.s.arcology.ownership = clamp(c.s.arcology.ownership + 12, 0, 100); c.out.push("+12% ownership");
            return { text: `You buy up every share that comes on the market. When the crash is over, you own a much bigger piece of ${c.arcology} than you did before it.`, next: "recovery", after: 4 }; } },
        { id: "auction", label: "Buy the bankrupt owner's best slaves", note: "¤18,000", need: cash(18000),
          run: (c) => { c.cash(-18000); for (let i = 0; i < 3; i++) { const p = c.addSlave({ seed: `crash${c.week}:${i}`, age: 21 + i * 4, quality: 0.7, how: "bought cheap at a bankruptcy auction during the crash" }); p.skills.whoring = 50 + i * 5; p.skills.entertainment = 45; }
            return { text: `You pick up three well-trained slaves for less than one would have cost a month ago. Their old owner watches from the back of the room.`, next: "recovery", after: 4 }; } },
        { id: "debtors", label: "Take the debtors as indentured servants",
          run: (c) => { for (let i = 0; i < 2; i++) { const p = c.addSlave({ seed: `debtor${c.week}:${i}`, age: 24 + i * 9, quality: 0.2, how: "signed herself into indenture to pay her debts during the crash" }); p.status = "indentured"; p.indenture_weeks = 104; } c.standing(-1); pop(c, -2);
            return { text: `Two of your citizens sign two-year indentures to clear their debts. They move out of their apartments and into your household, still in the clothes they wore to work.`, next: "recovery", after: 4 }; } },
      ],
    },
    recovery: {
      title: "The recovery",
      text: (c) => `The crash is easing. Credit is flowing again and the shops are reopening. The question now is who comes out of it stronger.`,
      options: [
        { id: "invest", label: "Invest in new businesses on the commercial row", note: "¤12,000", need: cash(12000),
          run: (c) => { c.cash(-12000); c.prosperity(8);
            return { text: `You put money into the businesses that survived. By spring the commercial row is busier than it was before the crash.`, end: "you came out of the crash stronger" }; } },
        { id: "done", label: "Take stock and carry on",
          run: () => ({ text: `You weathered it. Not everyone did.`, end: "you weathered the crash" }) },
      ],
    },
  },
};

/* ── war ────────────────────────────────────────────────────────────────────────────────────── */

const war: ArcDef = {
  id: "w_war", title: "The War", kind: "world", repeat: 36,
  when: (s) => !!worstRegion(s, ["war"]) && s.arcology.week >= 8,
  cast: ["general"],
  start: "captives",
  beats: {
    captives: {
      title: "Prisoners of war",
      text: (c) => {
        const reg = worstRegion(c.s, ["war"]);
        if (reg && !c.flag("war_region")) c.set("war_region", reg.name);
        return `The war in ${regionName(c, "war_region")} is filling the slave markets. A broker has come to ${c.arcology} with a whole shipload of prisoners of war: soldiers, officers' wives, a few nurses, sold by whichever side won their last battle.

Separately, a general on one side of the war, ${c.full("general")}, has sent an envoy. ${c.He("general")} wants to buy weapons and hire mercenaries, and ${c.he("general")}'s paying in gold.`;
      },
      options: [
        { id: "buy", label: "Buy some of the captives", note: "¤12,000; strong, hostile slaves", need: cash(12000),
          run: (c) => { c.cash(-12000); for (let i = 0; i < 2; i++) { const p = c.addSlave({ seed: `pow${c.week}:${i}`, age: 22 + i * 5, quality: 0.3, how: `taken prisoner in the war in ${regionName(c, "war_region")} and sold`, hostile: true }); p.skills.combat = 45 + i * 10; p.body.muscle = 40; }
            return { text: `You pick out two women from the captives: a soldier and a sergeant, both strong and both furious. They'll take a lot of breaking, but they'll make fine guards or pit fighters when they're broken.`, next: "general", after: 2 }; } },
        { id: "arms", label: "Sell the general weapons", note: "+¤25,000; makes enemies", need: (c) => (c.s.arcology.policies["arms_trade"] || c.s.arcology.mercenaries.hired ? null : "needs the arms trade policy or mercenaries"),
          run: (c) => { c.cash(25000); c.like("general", 25); c.set("war_armed", true); c.rep(-200);
            return { text: `You sell ${c.n("general")} two containers of rifles and ammunition through a middleman. The gold arrives the same day. The other side of the war will find out who armed their enemy, eventually.`, next: "general", after: 2 }; } },
        { id: "neutral", label: "Stay out of it",
          run: () => ({ text: `You send the broker and the envoy away. The war is far away, and you'd like to keep it that way.`, next: "general", after: 3 }) },
      ],
    },
    general: {
      title: (c) => `${c.n("general")} wants more`,
      text: (c) => c.flag("war_armed")
        ? `${c.n("general")} won the battle your weapons were for, and now ${c.he("general")} wants more: another shipment, and your mercenaries on loan for a month. In exchange, ${c.he("general")} offers you the pick of the prisoners from the city ${c.he("general")} just took, including the old governor's daughters.`
        : `${c.n("general")} has lost a battle and is on the run. ${c.He("general")} has turned up at your docks with a fortune in gold and a dozen bodyguards, asking for asylum. The other side is demanding you hand ${c.him("general")} over.`,
      options: [
        { id: "deal", label: "Take the deal", show: (c) => !!c.flag("war_armed"),
          run: (c) => { c.cash(20000); c.s.arcology.mercenaries.loyalty = clamp(c.s.arcology.mercenaries.loyalty - 10, 0, 100); for (let i = 0; i < 2; i++) c.addSlave({ seed: `governor${c.week}:${i}`, age: 19 + i * 2, quality: 0.8, how: `a governor's daughter, taken when ${regionName(c, "war_region")}'s capital fell`, hostile: true }); c.rep(-300);
            return { text: `The weapons ship out, and two terrified young women ship in: the governor's daughters, well-educated and very pretty, and completely unprepared for what's going to happen to them.`, end: "you armed a warlord and took his prizes" }; } },
        { id: "no_more", label: "Refuse; one shipment was enough", show: (c) => !!c.flag("war_armed"),
          run: (c) => { c.like("general", -20);
            return { text: `You tell ${c.n("general")} you're out. ${c.He("general")} isn't happy, but ${c.he("general")} has a war to fight and can't do much about it.`, end: "you got out of the war trade" }; } },
        { id: "asylum", label: "Give the general asylum, and keep the gold", show: (c) => !c.flag("war_armed"),
          run: (c) => { c.cash(40000); c.like("general", 40); c.npc("general").status = "ally"; c.security(-5); c.rep(-100);
            return { text: `You take ${c.n("general")}'s gold and give ${c.him("general")} an apartment in the spire. The other side sends threats, but they're too busy fighting to act on them. You have a very rich, very grateful exile living in your building.`, end: "you gave a fallen general asylum" }; } },
        { id: "hand_over", label: "Hand the general over", show: (c) => !c.flag("war_armed"),
          run: (c) => { c.cash(15000); c.npc("general").status = "dead"; c.rep(200);
            return { text: `You hand ${c.n("general")} over to the other side's envoys at the docks and take their reward. ${c.He("general")} is shot a week later. The gold ${c.he("general")} brought with ${c.him("general")} somehow ends up in your vaults.`, end: "you handed over a fallen general" }; } },
      ],
    },
  },
};

/* ── the rising water ───────────────────────────────────────────────────────────────────────── */

const flood: ArcDef = {
  id: "w_flood", title: "Rising Water", kind: "world",
  when: (s) => { const w = worldOf(s); return w.strain > 55 && ["storm", "superstorm"].includes(w.weather.kind) && !s.story?.flags["sea_wall"]; },
  cast: ["engineer"],
  start: "seep",
  beats: {
    seep: {
      title: "Seawater on the lower levels",
      text: (c) => `After the last storm, the seawater didn't all drain away. There's a permanent inch of it on the lowest service level now, and your engineers say the sea has risen enough that it will only get worse. Within a couple of years, the lower levels of the outer ring will be underwater at every high tide.

${c.full("engineer")} has been hired by half the arcologies on the coast. ${c.He("engineer")} can build you a proper sea wall and pumping station, but it's the biggest construction project ${c.arcology} will ever do.`,
      options: [
        { id: "wall", label: "Build the sea wall", note: "¤40,000", need: cash(40000),
          run: (c) => { c.cash(-40000); project(c, "sea_wall", "a sea wall now protects the arcology"); c.like("engineer", 30); c.prosperity(4);
            return { text: `${c.n("engineer")} starts work the next week. It takes six months, and you'll be paying for it for longer, but when it's done ${c.arcology} will be dry when the arcologies around it are flooding.`, end: "you built a sea wall against the rising water" }; } },
        { id: "slaves", label: "Build it with slave labor", note: "¤15,000; your household does the work", need: cash(15000),
          run: (c) => { c.cash(-15000); project(c, "sea_wall", "a sea wall now protects the arcology"); for (const p of household(c)) { p.health.health = clamp(p.health.health - 12, -100, 100); p.health.energy = 10; } c.household("cruelty", 4, "made to build the sea wall"); c.like("engineer", 5);
            return { text: `${c.n("engineer")} designs it, and your household builds it: months of hauling concrete in the wind and the cold. Your slaves are exhausted and bruised by the end of it. The wall is solid, though.`, end: "your slaves built the sea wall" }; } },
        { id: "abandon", label: "Abandon the lowest levels to the sea",
          run: (c) => { pop(c, -250); c.prosperity(-5); c.standing(-2);
            return { text: `You seal off the lowest levels of the outer ring and let the sea have them. Two hundred and fifty people have to find somewhere else to live. Most of them leave the arcology.`, end: "you let the sea have the lower levels" }; } },
      ],
    },
  },
};

/* ── the air ────────────────────────────────────────────────────────────────────────────────── */

const smog: ArcDef = {
  id: "w_smog", title: "The Air", kind: "world", repeat: 30,
  when: (s) => worldOf(s).pollution > 45 && !s.story?.flags["scrubbers"],
  start: "protest",
  beats: {
    protest: {
      title: "Citizens march on the Works",
      text: (c) => `The smog from your industrial blocks has been hanging over the lower levels for weeks. Children are coughing. The clinic is full of asthma cases. Today, a few hundred citizens are marching on the Works with masks and handmade signs.

Your foremen want to know whether to shut the gates. Your accountant wants to remind you how much the Works earn.`,
      options: [
        { id: "scrubbers", label: "Fit air scrubbers to the Works", note: "¤22,000; pollution falls for good", need: cash(22000),
          run: (c) => { c.cash(-22000); project(c, "scrubbers", "air scrubbers cut your pollution"); const w = worldOf(c.s); w.pollution = Math.max(0, w.pollution - 25); c.standing(3);
            return { text: `You go out to the gates and tell the marchers that scrubbers are going in. They're installed within a month, and the air on the lower levels starts clearing.`, end: "you cleaned up the air" }; } },
        { id: "cut", label: "Cut production at the Works", note: "less income; cleaner air",
          run: (c) => { const w = worldOf(c.s); w.pollution = Math.max(0, w.pollution - 20); c.prosperity(-3); c.standing(2); c.cash(-4000);
            return { text: `You cut the Works to half shifts. The smog thins out, the marchers go home, and your industrial income drops.`, end: "you cut production at the Works" }; } },
        { id: "disperse", label: "Disperse the march", need: secure(35),
          run: (c) => { c.standing(-3); c.crime(3); c.security(2);
            return { text: `Your security teams break up the march with batons and pepper spray. The Works keep running. The citizens keep coughing, and now they're angry too.`, end: "you broke up the smog protest" }; } },
        { id: "masks", label: "Hand out free masks and change nothing", note: "¤2,000", need: cash(2000),
          run: (c) => { c.cash(-2000); c.standing(-1);
            return { text: `You hand out ten thousand masks. The marchers take them, and they know exactly what you're telling them.`, end: "you handed out masks" }; } },
      ],
    },
  },
};

export const WORLD_ARCS: ArcDef[] = [storm, drought, boats, liberty, plague, crash, war, flood, smog];

