import {DeepPartial} from "ts-essentials";
declare global {
	export namespace FC {
		export type HumanID = number;
		/** See {@link SID} */
		export type SpecialID = 0|-1|-2|-3|-4|-5|-6|-7|-8|-9|-10;
		export type GenePoolRecord = InstanceType<typeof App.Entity.GenePoolRecord>;

		/** These states extend GenePoolRecord */

		export type HumanState = InstanceType<typeof App.Entity.HumanState>;

		/** end of states that extend GenePoolRecord */

		/** These states extend HumanState */

		export interface SlaveHistory {
			week: GameVariables["week"],
			lastAssignment: SlaveState["assignment"],
			devotion: SlaveState["devotion"],
			trust: SlaveState["trust"],
			health: SlaveState["health"]["condition"],
			energy: SlaveState["energy"],
			income: SlaveState["lastWeeksCashIncome"],
			expenses: number, // via  getSlaveCost(slave)
			reputation: SlaveState["lastWeeksRepIncome"],
			reputation_loss: SlaveState["lastWeeksRepExpenses"],
			weight: SlaveState["weight"],
			boobs: SlaveState["boobs"],
			muscles: SlaveState["muscles"],
		}

		export type SlaveState = InstanceType<typeof App.Entity.SlaveState>;
		export type PlayerState = InstanceType<typeof App.Entity.PlayerState>;

		export type MissingParentRecordOptionalParams = {yours?: boolean, dead?: boolean, traitor?: boolean};
		export type MissingParentRecord = Pick<HumanState, "ID" | "slaveName" | "slaveSurname" | "dick" | "vagina" | "mother" | "father" | "inbreedingCoeff"> & {fullName: string} & MissingParentRecordOptionalParams;

		/** end of states that extend HumanState */

		/** These states extend SlaveState */

		export type TankSlaveState = InstanceType<typeof App.Entity.TankSlaveState>;
		export type ChildState = InstanceType<typeof App.Entity.ChildState>;
		export type InfantState = InstanceType<typeof App.Entity.InfantState>;

		/** end of states that extend SlaveState */

		export type Fetus = InstanceType<typeof App.Entity.Fetus>;

		export type CustomSlaveOrder = InstanceType<typeof App.Entity.CustomSlaveOrder>;

		export type AnimalState = InstanceType<typeof App.Entity.Animal>;

		export type DeepPartialSlaveState = DeepPartial<SlaveState>;

		type SlaveStateRequiredAttributes = "ID" | "slaveName";
		export interface HeroSlaveTemplate extends
			DeepPartial<Omit<SlaveState, SlaveStateRequiredAttributes>>,
			Pick<SlaveState, SlaveStateRequiredAttributes> {
				/**
				 * [left arm, right arm, left leg, right leg].
				 * When 0 remove the limb, when 1+ sets the limb to the given LimbType.
				 * [0, 0, 1, 1] would remove both arms, but keep the legs as normal.
				 * [6, 6, 0, 1] would make both arms cybernetic prostetics and remove the left leg.
				 */
				_limbs?: [0 | LimbType, 0 | LimbType, 0 | LimbType, 0 | LimbType];
			}

		export interface GingeredSlave extends SlaveState {
			// note that all members are optional...GingeredSlave and SlaveState are bidirectionally interchangeable
			gingering?: InstanceType<typeof App.Entity.GingeringParameters>;
			beforeGingering?: SlaveState;
		}

		export interface ReportSlave extends SlaveState {
			paraphiliaSatisfied: number;
			pornFameBonus: number;
			inappropriateLactation: number;
			fetishChanged: number;
			slaveUsedRest: number;
		}

		export type SlaveUpdate = DeepPartialSlaveState;

		//#region SlaveState types
		namespace Rules {
			type Living = "spare" | "normal" | "luxurious";
			interface LivingFreezed extends Record<string, Living> {
				LUXURIOUS: 'luxurious';
				NORMAL: 'normal';
				SPARE: 'spare';
			}

			type Rest = "none" | "cruel" | "restrictive" | "permissive" | "mandatory";
			interface RestFreezed extends Record<string, Rest> {
				NONE: "none";
				MIN: "cruel";
				MID: "restrictive";
				MAX: "permissive";
				MANDATORY: "mandatory";
			}

			type Mobility = "restrictive" | "permissive";
			type Speech = "restrictive" | "permissive" | "accent elimination" | "language lessons";
			type Relationship = "restrictive" | "just friends" | "permissive";
			type Lactation = "none" | "induce" | "maintain" | "sell"; // `sell` only used for the PC in managePersonalAffairs.js
			type Punishment = "confinement" | "whipping" | "chastity" | "situational";
			type Reward = "relaxation" | "drugs" | "orgasm" | "situational" | "confinement";
		}

		type Assignment =
			// Penthouse Assignments
			'rest' | 'please you' | 'take classes' | 'be a servant' | 'whore' | 'serve the public' | 'be a subordinate slave' |
			'get milked' | 'work a glory hole' | 'stay confined' |
			// Leadership Assignments
			'guard you' | 'be your Head Girl' | 'recruit girls' | 'be your agent' | 'live with your agent' |
			// Facility Assignments
			'be confined in the arcade' | 'be the Madam' | 'work in the brothel' | 'be the Wardeness' | 'be confined in the cellblock' |
			'be the DJ' | 'serve in the club' | 'be the Nurse' | 'get treatment in the clinic' | 'be the Milkmaid' | 'work in the dairy' |
			'be the Farmer' | 'work as a farmhand' | 'live with your Head Girl' | 'be your Concubine' | 'serve in the master suite' |
			'be the Matron' | 'work as a nanny' | 'be the Schoolteacher' | 'learn in the schoolroom' | 'be the Stewardess' |
			'work as a servant' | 'be the Attendant' | 'rest in the spa' |
			// Does this one exist?
			'labor in the production line' |
			// Other
			'choose her own job' |
			// Pseudo-jobs
			'@Lurcher' | '@Pit' | "@Arena" | '@be imported' | '@lay in tank';
		interface AssignmentFreeze extends Record<string, Assignment> {
			// Penthouse Assignments
			REST: 'rest';
			FUCKTOY: 'please you';
			CLASSES: 'take classes';
			HOUSE: 'be a servant';
			WHORE: 'whore';
			PUBLIC: 'serve the public';
			SUBORDINATE: 'be a subordinate slave';
			MILKED: 'get milked';
			GLORYHOLE: 'work a glory hole';
			CONFINEMENT: 'stay confined';
			// Leadership Assignments
			BODYGUARD: 'guard you';
			HEADGIRL: 'be your Head Girl';
			RECRUITER: 'recruit girls';
			AGENT: 'be your agent';
			AGENTPARTNER: 'live with your agent';
			// Facility Assignments
			ARCADE: 'be confined in the arcade';
			MADAM: 'be the Madam';
			BROTHEL: 'work in the brothel';
			WARDEN: 'be the Wardeness';
			CELLBLOCK: 'be confined in the cellblock';
			DJ: 'be the DJ';
			CLUB: 'serve in the club';
			NURSE: 'be the Nurse';
			CLINIC: 'get treatment in the clinic';
			MILKMAID: 'be the Milkmaid';
			DAIRY: 'work in the dairy';
			FARMER: 'be the Farmer';
			FARMYARD: 'work as a farmhand';
			HEADGIRLSUITE: 'live with your Head Girl';
			CONCUBINE: 'be your Concubine';
			MASTERSUITE: 'serve in the master suite';
			MATRON: 'be the Matron';
			NURSERY: 'work as a nanny';
			TEACHER: 'be the Schoolteacher';
			SCHOOL: 'learn in the schoolroom';
			STEWARD: 'be the Stewardess';
			QUARTER: 'work as a servant';
			ATTENDANT: 'be the Attendant';
			SPA: 'rest in the spa';
			// Does this one exist?
			BABY_FACTORY: 'labor in the production line';
			// Other
			CHOICE: 'choose her own job';
			// Pseudo-jobs
			LURCHER: '@Lurcher';
			PIT: '@Pit';
			ARENA: "@Arena";
			IMPORTED: '@be imported';
			TANK: '@lay in tank';
		}

		type Fetish = WithNone<"mindbroken" | "submissive" | "cumslut" | "humiliation" | "buttslut" | "boobs" | "sadist" |
			"masochist" | "dom" | "pregnancy" | "bestiality">;
		interface FetishFreeze extends Record<string, Fetish> {
			NONE: "none";
			MINDBROKEN: "mindbroken";
			SUBMISSIVE: "submissive";
			CUMSLUT: "cumslut";
			HUMILIATION: "humiliation";
			BUTTSLUT: "buttslut";
			BOOBS: "boobs";
			SADIST: "sadist";
			MASOCHIST: "masochist";
			DOM: "dom";
			PREGNANCY: "pregnancy";
			BESTIALITY: "bestiality";
		}

		type BehavioralFlaw = WithNone<
			| "arrogant" // clings to her dignity, thinks slavery is beneath her
			| "bitchy" // : can 't keep her opinions to herself
			| "odd" // says and does odd things
			| "hates men" // hates men
			/** hates women */
			| "hates women"
			| "gluttonous" // likes eating, gains weight
			| "anorexic" // dislikes eating and being forced to eat, loses weight
			| "devout" // resistance through religious faith
			| "liberated" // believes slavery is wrong
		>;

		type BehavioralQuirk = WithNone<
			/** believes she has value as a slave */
			| "confident"
			/** often has as witty or cunning remark ready, knows when to say it */
			| "cutting"
			/** is funny */
			| "funny"
			/** loves working out */
			| "fitness"
			/** likes spending time with women */
			| "adores women"
			/** likes spending time with men */
			| "adores men"
			/** defines herself on the thoughts of others */
			| "insecure"
			/** breaks cultural norms */
			| "sinful"
			/** advocates slavery */
			| "advocate">;
		interface BehavioralQuirkFreeze extends Record<string, BehavioralQuirk> {
			NONE: "none";
			CONFIDENT: "confident";
			CUTTING: "cutting";
			FUNNY: "funny";
			FITNESS: "fitness";
			ADORESWOMEN: "adores women";
			ADORESMEN: "adores men";
			INSECURE: "insecure";
			SINFUL: "sinful";
			ADVOCATE: "advocate";
		}

		type SexualFlaw = WithNone<
			/** hates oral sex */
			| "hates oral"
			/** hates anal sex */
			| "hates anal"
			/** dislikes penetrative sex */
			| "hates penetration"
			/** nervous when naked */
			| "shamefast"
			/** believes sex should be based on love and consent */
			| "idealistic"
			/** dislikes sex */
			| "repressed"
			/** inert during sex */
			| "apathetic"
			/** sexually crude and has little sense of what partners find disgusting during sex */
			| "crude"
			/** sexually judgemental and often judges her sexual partners' performance */
			| "judgemental"
			/** disregards herself in sex */
			| "neglectful"
			/** addicted to cum */
			| "cum addict"
			/** addicted to anal */
			| "anal addict"
			/** addicted to being the center of attention */
			| "attention whore"
			/** addicted to her own breasts */
			| "breast growth"
			/** sexually abusive */
			| "abusive"
			/** loves causing pain and suffering */
			| "malicious"
			/** hates herself */
			| "self hating"
			/** addicted to being pregnant */
			| "breeder"
			/** addicted to fucking animals */
			| "animal lover">;

		type SexualQuirk = WithNone<
			/** can take a facefucking */
			"gagfuck queen"
			/** knows how far she can go without getting hurt */
			| "painal queen"
			/** knows how much resistance her partners want */
			| "strugglefuck queen"
			/** is a tease */
			| "tease"
			/** enjoys the closeness of sex */
			| "romantic"
			/** enjoys breaking sexual boundaries */
			| "perverted"
			/** enjoys bring her partners to orgasm */
			| "caring"
			/** willing to do anything */
			| "unflinching"
			/** prefers big cocks */
			| "size queen">;
		interface SexualQuirkFreeze extends Record<string, SexualQuirk> {
			NONE: "none";
			GAGFUCK: "gagfuck queen";
			PAINAL: "painal queen";
			STRUGGLE: "strugglefuck queen";
			TEASE: "tease";
			ROMANTIC: "romantic";
			PERVERT: "perverted";
			CARING: "caring";
			UNFLINCHING: "unflinching";
			SIZEQUEEN: "size queen";
		}

		type BreastShape = "normal" | "perky" | "saggy" | "torpedo-shaped" | "downward-facing" | "wide-set" | "spherical";
		interface BreastShapeFreeze extends Record<string, BreastShape> {
			NORMAL: "normal";
			PERKY: "perky";
			SAGGY: "saggy";
			TORPEDO: "torpedo-shaped";
			DOWNWARD: "downward-facing";
			WIDE: "wide-set";
			SPHERICAL: "spherical";
		}

		type Clothes = "a ball gown" | "a bimbo outfit" | "a biyelgee costume" | "a bra" | "a bunny outfit" | "a burkini" |
			"a burqa" | "a button-up shirt" | "a button-up shirt and panties" | "a chattel habit" | "a cheerleader outfit" | "a comfortable bodysuit" |
			"a courtesan dress" | "a cybersuit" | "a dirndl" | "a fallen nuns habit" | "a Fuckdoll suit" | "a gothic lolita dress" | "a halter top dress" |
			"a hanbok" | "a hijab and abaya" | "a hijab and blouse" | "a huipil" | "a kimono" | "a klan robe" | "a latex catsuit" | "a leotard" |
			"a long qipao" | "a maternity dress" | "a military uniform" | "a mini dress" | "a monokini" | "a mounty outfit" | "a nice maid outfit" |
			"a nice nurse outfit" | "a nice pony outfit" | "a niqab and abaya" | "a one-piece swimsuit" | "a penitent nuns habit" | "a police uniform" |
			"a red army uniform" | "a Santa dress" | "a scalemail bikini" | "a schoolgirl outfit" | "a schutzstaffel uniform" | "a skimpy loincloth" |
			"a slave gown" | "a slutty klan robe" | "a slutty maid outfit" | "a slutty nurse outfit" | "a slutty outfit" | "a slutty pony outfit" |
			"a slutty qipao" | "a slutty schutzstaffel uniform" | "a sports bra" | "a string bikini" | "a striped bra" | "a succubus outfit" |
			"a sweater" | "a sweater and cutoffs" | "a sweater and panties" | "a t-shirt" | "a t-shirt and jeans" | "a t-shirt and panties" |
			"a t-shirt and thong" | "a tank-top" | "a tank-top and panties" | "a thong" | "a toga" | "a tube top" | "a tube top and thong" |
			"an apron" | "an oversized t-shirt" | "an oversized t-shirt and boyshorts" | "attractive lingerie" | "attractive lingerie for a pregnant woman" |
			"battlearmor" | "Imperial Plate" | "a tight Imperial bodysuit" | "battledress" | "body oil" | "boyshorts" | "chains" | "choosing her own clothes" |
			"clubslut netting" | "conservative clothing" | "cutoffs" | "cutoffs and a t-shirt" | "harem gauze" | "jeans" | "kitty lingerie" |
			"leather pants" | "leather pants and a tube top" | "leather pants and pasties" | "lederhosen" | "nice business attire" | "no clothing" |
			"overalls" | "panties" | "panties and pasties" | "pasties" | "restrictive latex" | "shibari ropes" | "slutty business attire" |
			"slutty jewelry" | "spats and a tank top" | "sport shorts" | "sport shorts and a sports bra" | "sport shorts and a t-shirt" |
			"stretch pants and a crop-top" | "striped panties" | "striped underwear" | "uncomfortable straps" |	"Western clothing" |
			"a confederate army uniform" | "an evening dress" | "a nipple bikini" | "slave rags" | "a slutty magical girl costume" |
			/** AI clothing */
			"a superhero outfit" | "a cardigan" | "a streetwear outfit" | "a country outfit" | 
			"a leather outfit" | "a turtleneck and miniskirt" | "a red priestess outfit" | "an eastern european outfit" | "a samba outfit" | "a tribal outfit" | "a tropical outfit" | 
			"a valkyrie outfit" | "a baroque dress" | "a cocktail dress" | "an ice queen outfit" | "a magical girl costume" | "a sundress" | "a wedding dress" | 
			"an armored dress" | "a babydoll" | "a coat and corset" | "a frilly bikini";
		type BellyAccessory = WithNone<"a small empathy belly" | "a medium empathy belly" | "a large empathy belly" | "a huge empathy belly" |
			"a corset" | "an extreme corset" | "a support band">;
		type Collar = WithNone<"ancient Egyptian" | "cruel retirement counter" | "uncomfortable leather" | "tight steel" | "shock punishment" |
			"heavy gold" | "pretty jewelry" | "nice retirement counter" | "bell collar" | "leather with cowbell" | "bowtie" | "neck tie" |
			"neck corset" | "stylish leather" | "satin choker" | "preg biometrics" | "silk ribbon">;
		type HairStyle = "afro"| "braided" | "cornrows" | "curled" | "dreadlocks" | "eary" | "bun" | "messy bun" | "ponytail" | "tails" |
			"drills" | "luxurious" | "messy" | "neat" | "permed" | "bangs" | "hime" | "strip" | "up" | "shaved" | "trimmed" | "buzzcut" | "bald" | "undercut" |
			"double buns" | "chignon" | "french twist" | "crown braid" | "dutch braid" | "double dutch braid" | "pixie cut" | "bob cut";
		type Shoes = "heels" | "pumps" | "extreme heels" | "boots" | "flats" | "platform heels" | "extreme heels" | "extreme platform heels" | "platform shoes";
		type MouthAccessory = "dildo gag" | "massive dildo gag" | "ball gag" | "bit gag" | "ring gag";


		type Tattoo = FC.NoObject | "tribal patterns" | "flowers" | "scenes" | "Asian art" |
			"degradation" | "counting" | "advertisements" | "rude words" |
			"bovine patterns" | "sacrament" | "sacrilege" | "possessive" |
			"paternalist";
		type TattooAnus = Tattoo | "bleached";
		type TattooBelly = FC.NoObject | "a heart" | "a star" | "a butterfly";
		type TattooVagina = Tattoo | "lewd crest";
		type TattooLip = Tattoo | "permanent makeup";
		type TattooAll = Tattoo | TattooAnus | TattooBelly | TattooVagina | TattooLip;

		type SlaveDiet = "healthy" | "restricted" | "corrective" | "muscle building" | "fattening" | "slimming" | "XX" | "XY" | "XXY" |
			"cum production" | "cleansing" | "fertility" | "high caloric";
		interface SlaveDietFreeze extends Record<string, SlaveDiet> {
			HEALTHY: "healthy";
			RESTRICTED: "restricted";
			CORRECTIVE: "corrective";
			MUSCLE: "muscle building";
			FATTEN: "fattening";
			SLIM: "slimming";
			FEMALE: "XX";
			MALE: "XY";
			FUTA: "XXY";
			CUM: "cum production";
			CLEANSE: "cleansing";
			FERTILITY: "fertility";
			CALORIC: "high caloric";
		}

		type PCExclusiveDiet = "exotic" | "medicinal" | "weaning";

		type Diet = SlaveDiet | PCExclusiveDiet;
		interface DietFreeze extends Record<string, Diet> {
			HEALTHY: "healthy";
			RESTRICTED: "restricted";
			CORRECTIVE: "corrective";
			MUSCLE: "muscle building";
			FATTEN: "fattening";
			SLIM: "slimming";
			FEMALE: "XX";
			MALE: "XY";
			FUTA: "XXY";
			CUM: "cum production";
			CLEANSE: "cleansing";
			FERTILITY: "fertility";
			CALORIC: "high caloric";
			EXOTIC: "exotic";
			MEDICINAL: "medicinal";
			WEANING: "weaning";
		}

		type Drug = "no drugs" |
			"breast injections" | "butt injections" | "clitoris enhancement" | "lip injections" | "nipple enhancers" | "penis enhancement" | "testicle enhancement" |
			"intensive breast injections" | "intensive butt injections" | "intensive clitoris enhancement" | "intensive penis enhancement" | "intensive testicle enhancement" |
			"fertility drugs" | "super fertility drugs" |
			"psychosuppressants" | "psychostimulants" | "steroids" |
			"hyper breast injections" | "hyper butt injections" | "hyper penis enhancement" | "hyper testicle enhancement" |
			"female hormone injections" | "male hormone injections" | "priapism agents" |
			"anti-aging cream" | "appetite suppressors" | "hormone enhancers" | "hormone blockers" |
			"penis atrophiers" | "testicle atrophiers" | "clitoris atrophiers" | "labia atrophiers" | "nipple atrophiers" | "lip atrophiers" |
			"breast redistributors" | "butt redistributors" | "sag-B-gone" | "growth stimulants" | "stimulants";
		interface DrugFreeze extends Record<string, Drug> {
			NONE: "no drugs";
			GROWBREAST: "breast injections";
			GROWBUTT: "butt injections";
			GROWCLIT: "clitoris enhancement";
			GROWLIP: "lip injections";
			GROWNIPPLE: "nipple enhancers";
			GROWPENIS: "penis enhancement";
			GROWTESTICLE: "testicle enhancement";
			INTENSIVEBREAST: "intensive breast injections";
			INTENSIVEBUTT: "intensive butt injections";
			INTENSIVECLIT: "intensive clitoris enhancement";
			INTENSIVEPENIS: "intensive penis enhancement";
			INTENSIVETESTICLE: "intensive testicle enhancement";
			FERTILITY: "fertility drugs";
			SUPERFERTILITY: "super fertility drugs";
			PSYCHOSUPP: "psychosuppressants";
			PSYCHOSTIM: "psychostimulants";
			STEROID: "steroids";
			HYPERBREAST: "hyper breast injections";
			HYPERBUTT: "hyper butt injections";
			HYPERPENIS: "hyper penis enhancement";
			HYPERTESTICLE: "hyper testicle enhancement";
			HORMONEFEMALE: "female hormone injections";
			HORMONEMALE: "male hormone injections";
			PRIAPISM: "priapism agents";
			ANTIAGE: "anti-aging cream";
			APPETITESUPP: "appetite suppressors";
			HORMONEENHANCE: "hormone enhancers";
			HORMONEBLOCK: "hormone blockers";
			ATROPHYPENIS: "penis atrophiers";
			ATROPHYTESTICLE: "testicle atrophiers";
			ATROPHYCLIT: "clitoris atrophiers";
			ATROPHYLABIA: "labia atrophiers";
			ATROPHYNIPPLE: "nipple atrophiers";
			ATROPHYLIP: "lip atrophiers";
			REDISTBREAST: "breast redistributors";
			REDISTBUTT: "butt redistributors";
			SAGBGONE: "sag-B-gone";
			GROWTHSTIM: "growth stimulants";
			STIM: "stimulants";
		}

		type ConsumerDrug = "lip enhancers" | "breast enhancers" | "butt enhancers" | "hip wideners" | "penis enlargers" | "clitoris enlargers" | "testicle enlargers" |
			"lip reducers" | "breast reducers" | "butt reducers" | "penis reducers" | "clitoris reducers" | "testicle reducers" |
			"stamina enhancers" | "fertility supplements" | "detox pills";
		interface ConsumerDrugFreeze extends Record<string, ConsumerDrug> {
			GROW_LIP: "lip enhancers";
			GROW_BREAST: "breast enhancers";
			GROW_BUTT: "butt enhancers";
			GROW_HIP: "hip wideners";
			GROW_PENIS: "penis enlargers";
			GROW_CLIT: "clitoris enlargers";
			GROW_TESTICLE: "testicle enlargers";
			REDUCE_LIP: "lip reducers";
			REDUCE_BREAST: "breast reducers";
			REDUCE_BUTT: "butt reducers";
			REDUCE_PENIS: "penis reducers";
			REDUCE_CLIT: "clitoris reducers";
			REDUCE_TESTICLE: "testicle reducers";
			ENHANCE_STAMINA: "stamina enhancers";
			ENHANCE_FERTILITY: "fertility supplements";
			DETOX: "detox pills";
		}

		type PCDrug = Drug | ConsumerDrug;

		type EarWear = WithNone<"hearing aids" | "muffling ear plugs" | "deafening ear plugs">;
		type EarShape = WithNone<"holes" | "damaged" | "normal" | "pointy" | "elven" | "cow" | "robot" | "orcish" | "sheep" | "deer" | "gazelle" | "bird" | "dragon">;
		type EarTopType = WithNone<"normal" | "cat" | "leopard" | "tiger" | "jaguar" | "lion" | "dog" | "wolf" | "jackal" | "round hyena" | "pointy hyena" | "fox" | "raccoon" | "rabbit" | "squirrel" | "rat" | "mouse" | "horse">;
		type EyebrowStyle = "bald" | "curved" | "elongated" | "high-arched" | "natural" | "rounded" | "shaved" | "shortened" |
			"slanted inwards" | "slanted outwards" | "straight";
		type EyebrowThickness = "pencil-thin" | "thin" | "threaded" | "natural" | "tapered" | "thick" | "bushy";
		type EyeWear = WithNone<"glasses" | "blurring glasses" | "corrective glasses" | "blurring contacts" | "corrective contacts">;

		type FaceShape = "masculine" | "androgynous" | "normal" | "cute" | "sensual" | "exotic" | "feline";
		interface FaceShapeFreeze extends Record<string, FaceShape> {
			MASC: "masculine";
			ANDRO: "androgynous";
			NORMAL: "normal";
			CUTE: "cute";
			SENSUAL: "sensual";
			EXOTIC: "exotic";
			FELINE: "feline";
		}

		type GenderGenes =
			/** female */
			"XX"
			/** Triple X syndrome female */
			| "XXX"
			/** male */
			| "XY"
			/** Klinefelter syndrome male */
			| "XXY"
			/** XYY syndrome male */
			| "XYY"
			| "X0"
			| "X"
			| "YY";
		interface GenderGenesFreeze extends Record<string, GenderGenes> {
			FEMALE: "XX";
			MALE: "XY";
			INVIABLE: "YY";
		}

		type GestationDrug = "slow gestation" | "speed up" | "labor suppressors";
		interface GestationDrugFreeze extends Record<string, GestationDrug> {
			SLOW: "slow gestation";
			FAST: "speed up";
			LABOR: "labor suppressors";
		}

		type HornType = WithNone<"curved succubus horns" | "backswept horns" | "cow horns" | "one long oni horn" |
			"two long oni horns" | "small horns">;

		type InflationLiquid = WithNone<"water" | "cum" | "milk" | "food" | "aphrodisiac" | "curative" | "tightener" | "urine" | "stimulant">;
		interface InflationLiquidFreeze extends Record<string, InflationLiquid> {
			NONE: "none";
			WATER: "water";
			CUM: "cum";
			MILK: "milk";
			FOOD: "food";
			APHRO: "aphrodisiac";
			CURATIVE: "curative";
			TIGHTEN: "tightener";
			URINE: "urine";
			STIM: "stimulant";
		}

		type TailType = WithNone<"mod" | "combat" | "sex"| "stinger">;
		type AppendagesType = WithNone<"mod" | "flight" | "sex" | "falcon" | "arachnid" | "kraken">;
		type Markings = WithNone<"beauty mark" | "birthmark" | "freckles" | "heavily freckled">;
		type TailShape = WithNone<"cat" | "leopard" | "tiger" | "jaguar" | "lion" | "dog" | "wolf" | "jackal" | "hyenaspotted" | "hyenastriped" | "fox" | "kitsune" | "tanuki" | "raccoon" | "rabbit" | "squirrel" | "rat" | "mouse" | "horse" | "bird" | "phoenix" | "peacock" | "raven" | "swan" | "sheep" | "cow" | "gazelle" | "deer" | "succubus" | "dragon" >;
		type WingsShape = WithNone<"angel" | "seraph" | "demon"| "dragon" | "phoenix" | "bird"| "fairy" | "butterfly" | "moth" | "insect" | "evil" >;

		type ToyHole = "all her holes" | "mouth" | "boobs" | "pussy" | "ass" | "dick";
		interface ToyHoleFreeze extends Record<string, ToyHole> {
			ALL: "all her holes";
			MOUTH: "mouth";
			BOOBS: "boobs";
			PUSSY: "pussy";
			ASS: "ass";
			DICK: "dick";
		}

		type OvaryImplantType = 0 | "fertility" | "sympathy" | "asexual";
		interface OvaryImplantTypeFreeze extends Record<string, OvaryImplantType> {
			NONE: 0;
			FERTILITY: "fertility";
			SYMPATHY: "sympathy";
			ASEXUAL: "asexual";
		}

		type NippleShape = "huge" | "puffy" | "inverted" | "tiny" | "cute" | "partially inverted" | "fuckable" | "flat";
		interface NippleShapeFreeze extends Record<string, NippleShape> {
			INVERTED: "inverted";
			PARTIAL: "partially inverted";
			FLAT: "flat";
			TINY: "tiny";
			CUTE: "cute";
			PUFFY: "puffy";
			HUGE: "huge";
			FUCKABLE: "fuckable";
		}

		type LactationType = 0 | 1 | 2;
		type VaginaLubeType = 0 | 1 | 2;
		type WombImplantType = WithNone<"restraint">;
		type LabiaType = 0 | 1 | 2 | 3;
		type ClitType = 0 | 1 | 2 | 3 | 4 | 5;
		type AnusType = 0 | 1 | 2 | 3 | 4;
		type ProstateType = 0 | 1 | 2 | 3;
		type dietCumType = 0 | 1 | 2;
		type dietMilkType = 0 | 1 | 2;
		/**
		 * 0: no; 1: yes; 2: heavy
		 */
		type PiercingType = 0 | 1 | 2;
		type Piercing = "ear" | "nose" | "eyebrow" | "lips" | "tongue" | "nipple" | "areola" | "navel" | "corset" | "genitals" | "vagina" | "dick" | "anus";
		type Race = "amerindian" | "asian" | "black" | "indo-aryan" | "latina" | "malay" | "middle eastern" | "mixed race" |
			"pacific islander" | "catgirl" | "semitic" | "southern european" | "white";

		type SizingImplantType = "normal" | "string" | "fillable" | "advanced fillable" | "hyper fillable";
		interface SizingImplantTypeFreeze extends Record<string, SizingImplantType> {
			NORMAL: "normal";
			STRING: "string";
			FILLABLE: "fillable";
			ADVANCED: "advanced fillable";
			HYPER: "hyper fillable";
		}

		type LipsImplantType = "normal";
		type InstalledSizingImplantType = WithNone<SizingImplantType>;
		type InstalledLipsImplantType = WithNone<LipsImplantType>;
		type SizableBodyPart = "lips" | "boobs" | "butt" | "clit" | "dick" | "balls";
		type SizingImplantTarget = "boobs" | "butt" | "lips";

		interface BodyPartImplantTypeMap {
			lips: LipsImplantType;
			boobs: SizingImplantType;
			butt: SizingImplantType;
		}

		type BodyPartInstalledImplantType<Target extends SizingImplantTarget> = WithNone<BodyPartImplantTypeMap[Target]>;

		type SmartPiercingSetting = WithNone<
			"off" | "all" | "no default setting" | "random" | "women" | "men" |
			"vanilla" | "oral" | "anal" | "boobs" | "submissive" | "bestiality" |
			"humiliation" | "pregnancy" | "dom" | "masochist" | "sadist" |
			"anti-women" | "anti-men"
		>;
		interface SmartPiercingSettingFreeze extends Record<string, SmartPiercingSetting> {
			NONE: "none";
			OFF: "off";
			ALL: "all";
			NODEFAULT: "no default setting";
			RANDOM: "random";
			WOMEN: "women";
			MEN: "men";
			VANILLA: "vanilla";
			ORAL: "oral";
			ANAL: "anal";
			BOOBS: "boobs";
			SUBMISSIVE: "submissive";
			HUMILIATION: "humiliation";
			PREGNANCY: "pregnancy";
			DOM: "dom";
			MASOCHIST: "masochist";
			SADIST: "sadist";
			ANTIWOMEN: "anti-women";
			ANTIMEN: "anti-men";
			BESTIALITY: "bestiality";
		}

		type PersonalAttention =
			"trading" | "warfare" | "slaving" | "engineering" | "medicine" |
			"upkeep" | "hacking" | "HG" | "whoring" | "business" | "smuggling" |
			"defensive survey" | "development project" | "technical accidents" |
			"fighting" | "sex" | "rest and relaxation" | "proclamation" |
			"slave training" | "popularity" | "education" | "degree" |
			"advanced education" | "advanced degree";

		type PersonalAttentionTrainingObjective =
			"health" | "ravish" | "ravished" | "torture" | "build devotion" |
			"spar" | "soften behavioral flaw" | "break will" |
			"soften sexual flaw" | "learn skills" | "combat training" |
			"harshly break will" | "explore sexuality" | "fix behavioral flaw" |
			"fix sexual flaw" | "induce arrogance" | "induce bitchiness" |
			"induce odd behavior" | "induce hatred of men" |
			"induce hatred of women" | "induce gluttony" | "induce anorexia" |
			"induce religious devotion" | "induce liberation" |
			"induce hatred of oral" | "induce hatred of anal" |
			"induce hatred of penetration" | "induce shame" |
			"induce sexual idealism" | "induce sexual repression" |
			"induce sexual apathy" | "induce crudity" | "induce judgement" |
			"induce cum addiction" | "induce anal addiction" |
			"induce attention whoring" | "induce breast growth obsession" |
			"induce abusiveness" | "induce maliciousness" | "induce self hatred" |
			"induce sexual self neglect" | "induce breeding obsession" | "training";

		type TeethType = "normal" | "crooked" | "gapped" | "straightening braces" | "cosmetic braces" | "removable" | "pointy" |
			"fangs" | "fang" | "baby" | "mixed";
		type MinorInjury = Zeroable<"black eye" | "bad bruise" | "split lip" | "sore ass">;

		type RelationShipKind =
			/** married to you */
			-3
			/** emotionally bound to you */
			| -2
			/** emotional slut */
			| -1
			| 0
			/** friends with relationshipTarget */
			| 1
			/** best friends with relationshipTarget */
			| 2
			/** friends with benefits with relationshipTarget */
			| 3
			/** lover with relationshipTarget */
			| 4
			/** relationshipTarget 's slave wife */
			| 5;
		type RivalryType =
			/** None */
			0
			/** dislikes rivalryTarget */
			| 1
			/** rival of rivalryTarget */
			| 2
			/** bitterly hates rivalryTarget */
			| 3;
		type IndentureType =
			/** complete protection */
			2
			/** some protection */
			| 1
			/** no protection */
			| 0;

		type HeightImplant = -1 | 0 | 1;
		type Hearing = -2 | -1 | 0;

		type AnimalType = "human" | "dog" | "pig" | "horse" | "cow";
		type ReproductiveSystem = AnimalType | "sterile";

		type GeneticQuirk = 0 | 1 | 2;

		interface GeneticQuirks {
			/** Oversized breasts. Increased growth rate, reduced shrink rate. Breasts try to return to oversized state if reduced. */
			macromastia: GeneticQuirk | 3;
			/** Greatly oversized breasts. Increased growth rate, reduced shrink rate. Breasts try to return to oversized state if reduced.
			 *
			 * **macromastia + gigantomastia** - Breasts never stop growing. Increased growth rate, no shrink rate. */
			gigantomastia: GeneticQuirk | 3;
			/** sperm is much more likely to knock someone up */
			potent: GeneticQuirk;
			/** is prone to having twins, shorter pregnancy recovery rate */
			fertility: GeneticQuirk;
			/** is prone to having multiples, even shorter pregnancy recovery rate
			 *
			 * **fertility + hyperFertility** - will have multiples, even shorter pregnancy recovery rate */
			hyperFertility: GeneticQuirk;
			/** pregnancy does not block ovulation, slave can become pregnant even while pregnant */
			superfetation: GeneticQuirk;
			/** Pleasurable pregnancy and orgasmic birth. Wider hips, looser and wetter vagina. High pregadaptation and low birth damage. */
			uterineHypersensitivity: GeneticQuirk;
			/** is abnormally tall. gigantism + dwarfism - is very average*/
			gigantism: GeneticQuirk;
			/** is abnormally short. gigantism + dwarfism - is very average*/
			dwarfism: GeneticQuirk;
			/** has a flawless face. pFace + uFace - Depends on carrier status, may swing between average and above/below depending on it
			 * Any code that sets this to a positive value _must_ also set "face" to 100--this will not occur automatically, except when
			 * positive "pFace" is generated randomly in "generateNewSlave" and "generateGenetics". 
			 */
			pFace: GeneticQuirk;
			/** has a hideous face. pFace + uFace - Depends on carrier status, may swing between average and above/below depending on it
			* Any code that sets this to a positive value _must_ also set "face" to -100--this will not occur automatically, except when
			* positive "uFace" is generated randomly in "generateNewSlave" and "generateGenetics". 
			*/
		   uFace: GeneticQuirk;
			/** has pale skin, white hair and red eyes */
			albinism: GeneticQuirk;
			/** may have mismatched eyes, the eye color stored here is always the left eye */
			heterochromia: GeneticQuirk | string;
			/** ass never stops growing. Increased growth rate, reduced shrink rate. */
			rearLipedema: GeneticQuirk;
			/** has (or will have) a huge dong */
			wellHung: GeneticQuirk;
			/** constantly gains weight unless dieting, easier to gain weight. wGain + wLoss - weight gain/loss fluctuates randomly */
			wGain: GeneticQuirk;
			/** constantly loses weight unless gaining, easier to lose weight. wGain + wLoss - weight gain/loss fluctuates randomly */
			wLoss: GeneticQuirk;
			/** body attempts to normalize to an androgynous state */
			androgyny: GeneticQuirk;
			/** constantly gains muscle mass, easier to gain muscle. mGain + mLoss - muscle gain/loss amplified, passively lose muscle unless building */
			mGain: GeneticQuirk;
			/** constantly loses muscle mass, easier to gain muscle. mGain + mLoss - muscle gain/loss amplified, passively lose muscle unless building */
			mLoss: GeneticQuirk;
			/** ova will split if room is available
			 *  only affects fetuses */
			twinning: GeneticQuirk;
			/** slave can only ever birth girls */
			girlsOnly: GeneticQuirk;
			/** abnormal production of amniotic fluid
			 * only affects fetuses */
			polyhydramnios: GeneticQuirk;
			/** inappropriate lactation*/
			galactorrhea: GeneticQuirk | 3;
			/** retains childlike characteristics*/
			neoteny: GeneticQuirk | 3;
			/** rapid aging
			 *
			 * **neoteny + progeria** - progeria wins, not that she'll make it to the point that neoteny really kicks in */
			progeria: GeneticQuirk | 3,
		}
		interface FetusGenetics {
			gender: GenderGenes;
			name: string;
			surname: Zeroable<string>;
			mother: number;
			motherName: string;
			father: number;
			fatherName: string;
			nationality: string;
			race: Race;
			intelligence: number;
			face: number;
			faceShape: FaceShape;
			eyeColor: string
			hColor: string;
			skin: string;
			markings: Markings;
			behavioralFlaw: BehavioralFlaw;
			sexualFlaw: SexualFlaw;
			pubicHStyle: string;
			underArmHStyle: string;
			clone: Zeroable<string>;
			cloneID: number;
			geneticQuirks: Partial<GeneticQuirks>;
			fetish: Fetish;
			spermY: number;
			inbreedingCoeff?: number;
			adultHeight: number;
			boobPotential: number;
			artSeed: number;
		}
		//#endregion

		type LimbType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

		type ArmState = InstanceType<typeof App.Entity.ArmState>;
		type LegState = InstanceType<typeof App.Entity.LegState>;

		interface LimbsState {
			arm: {
				left: ArmState;
				right: ArmState;
			};
			leg: {
				left: LegState,
				right: LegState;
			};
			PLimb: 0 | 1 | 2 | 3;
		}

		interface PregnancyData {
			type: string;
			normalOvaMin: number;
			normalOvaMax: number;
			normalBirth: number;
			minLiveBirth: number;
			drugsEffect: number;
			fetusWeek: number[];
			fetusSize: number[];
			fetusRate: number[];
			sizeType: number;
		}

		type ImageFormat = "png"|"jpg"|"gif"|"webp"|"webm"|"mp4";
		export interface CustomImage {
			filename?: string;
			format?: ImageFormat;
		}
	}
}

export {}
