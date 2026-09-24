/**
 * THE WORLD OUTSIDE — weather kinds, the news wire, and the words for both.
 *
 * The original ran its world as a stream of news: the Old World falling apart a country at a time,
 * the Free Cities picking up the pieces, arcologies adopting and dropping future societies, and the
 * weather getting worse every year. This is that stream, templated, fed from the simulation in
 * engine/world.ts so a headline is always about something that is actually happening.
 */

export type WeatherKind =
  | "clear" | "hot" | "heatwave" | "rain" | "storm" | "superstorm" | "cold" | "freeze" | "dust" | "smog" | "fog";

export interface WeatherDef {
  kind: WeatherKind;
  name: string;
  /** One line for the Penthouse, in the game's plain voice. */
  line: string;
  /** What it does, for the forecast. */
  effect: string;
}

export const WEATHER: Record<WeatherKind, WeatherDef> = {
  clear: { kind: "clear", name: "Clear", line: "Clear skies over the arcology.", effect: "no effect" },
  hot: { kind: "hot", name: "Hot", line: "Hot and humid; the climate control is working hard.", effect: "power costs up a little; the club sells more drinks" },
  heatwave: { kind: "heatwave", name: "Heatwave", line: "A heatwave. The outer blocks are sweltering and the power grid is strained.", effect: "power costs up sharply; slaves working outdoors or on the streets lose health and energy; dairy yields drop" },
  rain: { kind: "rain", name: "Rain", line: "Steady rain.", effect: "street work earns a little less" },
  storm: { kind: "storm", name: "Storm", line: "A storm is lashing the arcology; the docks are closed.", effect: "trade routes pause; street work stops; minor damage" },
  superstorm: { kind: "superstorm", name: "Superstorm", line: "A superstorm is hitting the coast.", effect: "serious damage to the outer rings; trade stops; people get hurt" },
  cold: { kind: "cold", name: "Cold", line: "A cold snap. Heating costs are up.", effect: "heating costs up" },
  freeze: { kind: "freeze", name: "Hard freeze", line: "A hard freeze. Pipes are bursting in the outer blocks.", effect: "heating costs up sharply; farm output down; outdoor workers get sick" },
  dust: { kind: "dust", name: "Dust storm", line: "Dust from the dying interior blows in and coats everything.", effect: "farm output down; the air filters struggle" },
  smog: { kind: "smog", name: "Smog", line: "Smog from your own industry hangs over the lower levels.", effect: "everyone's health suffers a little; prosperity down" },
  fog: { kind: "fog", name: "Fog", line: "Thick sea fog.", effect: "no effect" },
};

export type RegionState = "boom" | "calm" | "unrest" | "war" | "collapse" | "plague";

export const REGION_STATE_WORD: Record<RegionState, string> = {
  boom: "booming", calm: "calm", unrest: "in unrest", war: "at war", collapse: "collapsing", plague: "hit by plague",
};

/** Headline templates. `{r}` is a region name, `{n}` a neighbouring arcology, `{fs}` a future society. */
export const HEADLINES = {
  collapse: [
    "The last government in {r} has fallen. Refugees are heading for the coast by the thousand.",
    "{r} has collapsed into warlordism. Slave brokers report record supply.",
    "Order has broken down across {r}. The Free Cities are shutting their doors to boats from there.",
  ],
  war: [
    "War has broken out in {r}. Shipping through the region is being attacked.",
    "Fighting in {r} has spread to the ports. Insurers have stopped covering cargo.",
    "Two factions in {r} are fighting over what's left. Prisoners of war are already turning up on the auction blocks.",
  ],
  unrest: [
    "Riots in {r} over food prices.",
    "Strikes and protests are spreading across {r}.",
    "Anti-slavery militants have attacked a Free City trade office in {r}.",
  ],
  plague: [
    "A new fever is spreading in {r}. Several Free Cities have quarantined ships from there.",
    "Plague in {r}: hospitals are overwhelmed and bodies are being burned in the streets.",
  ],
  boom: [
    "{r} is booming; its markets are hungry for luxuries, including trained slaves.",
    "Money is pouring into {r}. Trade through the region is up sharply.",
  ],
  recover: [
    "{r} has stabilized, for now.",
    "The fighting in {r} has died down and trade is resuming.",
  ],
  crash: [
    "Markets are crashing across the Free Cities. Credit has dried up overnight.",
    "A major Free City bank has failed. Everyone is calling in their loans.",
  ],
  boomEconomy: [
    "The Free Cities economy is booming. Luxury spending is at a record high.",
    "Money is cheap and everyone is spending it. Slave prices are climbing.",
  ],
  slump: [
    "The Free Cities are in a slump. Citizens are tightening their belts.",
    "Business is slow across the region, and prices are falling.",
  ],
  neighborFS: [
    "{n} has adopted {fs}, and is loudly telling everyone about it.",
    "{n} is now officially a {fs} arcology.",
  ],
  neighborRich: [
    "{n} is growing fast, and buying up businesses along the coast.",
  ],
  neighborPoor: [
    "{n} is struggling; there are rumors its owner is selling off slaves to cover debts.",
  ],
  climate: [
    "Another coastal city in the Old World has been abandoned to the sea.",
    "This year is on track to be the hottest on record, again.",
    "Crop failures across the Old World have pushed food prices up.",
    "Fresh water is being rationed in half the cities on this coast.",
    "Scientists say the storm season is getting longer every year.",
  ],
  flavor: [
    "A Free City in the Pacific has legalized the sale of clones.",
    "The Owners' Association is debating a common standard for slave contracts.",
    "An Old World celebrity has been sold at auction after going bankrupt; the bidding set a record.",
    "A new line of growth hormones is on the market, promising bigger results in half the time.",
    "Pirates seized a cargo of slaves off the coast; the ship's owner is offering a reward.",
    "An arcology in the south has banned clothing for slaves in public areas.",
    "Old World governments are threatening sanctions against the Free Cities, again. Nobody expects them to follow through.",
    "A famous Old World athlete has signed herself into voluntary enslavement to pay off debts.",
    "A slave revolt in a small arcology up the coast was put down; the owner has vowed to make examples.",
    "The Grand Exchange reports that trained dairy cows are fetching record prices.",
  ],
};

/** Where the world's "future societies" come from for the neighbours' news. */
export const NEIGHBOR_FS = [
  "Paternalism", "Degradationism", "Body Purism", "Transformation Fetishism", "Youth Preferentialism",
  "Maturity Preferentialism", "Asset Expansionism", "Gender Radicalism", "Gender Fundamentalism",
  "Physical Idealism", "Decadent Hedonism", "Pastoralism", "Repopulation Focus", "Eugenics",
  "Slave Professionalism", "Intellectual Dependency", "Chattel Religionism", "Roman Revivalism",
  "Neo-Imperialism", "Egyptian Revivalism", "Edo Revivalism", "Arabian Revivalism", "Chinese Revivalism",
];
