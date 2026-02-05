/** @file This holds data structures that are unique to `App.Entity.PlayerState` */

/**
 * Keeps track of the many relationships the PC has
 */
App.Entity.PlayerRelationshipsState = class PlayerRelationshipsState {
	// in the future this will be used to determine who will be used to sate player lust
	constructor() {
		/** player's wives */
		this.marriage = [];
		/** player's lovers */
		this.lovers = [];
		/** player's friends with benefits */
		this.FWBs = [];
		/** player's best friends */
		this.BFFs = [];
		/** player's friends */
		this.friends = [];
		/** slaves player likes */
		this.likes = [];
		/** slaves player dislikes */
		this.dislikes = [];
		/** slaves player hates */
		this.hates = [];
		/** slaves player loathes */
		this.loathes = [];
		/**
		 * player's emotional obsession
		 * * -2: emotionally bound to you
		 * * -1: emotional slut
		 * * 0: none
		 * * (ID): target of obsession
		 */
		this.obsession = 0;
	}
};

/**
 * Keeps track of lots of stats (births, sexual interactions, etc)
 * Has extra stats that only relate to the PlayerState
 * @see App.Entity.PlayerState
 */
App.Entity.PlayerActionCountersState = class PlayerActionCountersState extends App.Entity.HumanActionCountersState {
	constructor() {
		super();
		/** how many children you've carried for the SE */
		this.birthElite = 0;
		/** how many children you've carried for your former master (servant start only) */
		this.birthMaster = 0;
		/** how many slave babies you've had */
		this.birthDegenerate = 0;
		/** how many whoring babies you've had */
		this.birthClient = 0;
		/** how many children you've carried for other arc owners */
		this.birthArcOwner = 0;
		/** how many children you've had by sex with citizens (not whoring) */
		this.birthCitizen = 0;
		/** how many children you've had with the Sisters */
		this.birthFutaSis = 0;
		/** how many times you've giving birth to your own selfcest babies */
		this.birthSelf = 0;
		/** how many designer babies you've produced */
		this.birthLab = 0;
		/** hoy many children you've had fruit of unknown rapists */
		this.birthRape = 0;
		/** untracked births */
		this.birthOther = 0;
		/** how many units of your cum are stored away for artificially inseminating slaves */
		this.storedCum = 0;
		/** how many times you've been raped of forced to sex */
		this.raped = 0;
		/** content for pInsemination */
		this.moves = 0;
		this.quick = 0;
		this.crazy = 0;
		this.virgin = 0;
		this.futa = 0;
		this.preggo = 0;
	}
};

/**
 * Defines how skilled they are at a given subject
 * Has extra subjects that only relate to the PlayerState
 * @see App.Entity.PlayerState
 */
App.Entity.PlayerSkillsState = class PlayerSkillsState extends App.Entity.HumanSkillsState {
	constructor() {
		super();
		/** PC's skill in trading. */
		this.trading = 0;
		/** PC's skill in warfare. */
		this.warfare = 0;
		/** PC's skill in slaving. */
		this.slaving = 0;
		/** PC's skill in engineering. */
		this.engineering = 0;
		/** PC's skill in medicine. */
		this.medicine = 0;
		/** PC's skill in hacking. */
		this.hacking = 0;
		/** PC's skill in combat. */
		this.combat = 0;
		/** PC's expected skill in arena fights */
		this.fighting = 0;
		/** PC's skill in taking huge loads. */
		this.cumTap = 0;
	}
};

/**
 * This defines properties that are unique to the PC.
 * It also changes the value of some inherited properties.
 * Properties shared between the PC and slaves should be defined in `App.Entity.HumanState`.
 * @see App.Entity.HumanState
 */
App.Entity.PlayerState = class extends App.Entity.HumanState {
	/**
	 * @param {number|string} [seed=undefined]
	 */
	constructor(seed=undefined) {
		// NOTE if the property you are adding could apply to more than just the player then it likely belongs in HumanState instead
		super(seed);
		/**
		 * @type {FC.PCDrug}
		 */
		this.drugs = "no drugs";
		// // // // // // properties unique to the player \\ \\ \\ \\ \\ \\

		/** your title's gender
		 *
		 * 0: female; 1: male */
		this.title = 1;
		/**
		 * How strong are the rumors about you doing things unbecoming of a respectable arcology owner
		 * * 0: no rumors
		 * * 1 - 10: occasional whispers
		 * * 11	- 25: minor rumors
		 * * 26	- 50: rumors
		 * * 51	- 75: bad rumors
		 * * 70	- 100: severe rumors
		 * * 101+: life ruining rumors
		 */
		this.badRumors = {
			/** Strength of the rumors about you being penetrated by slaves */
			penetrative: 0,
			/** Strength of whispers that you have given birth to miscegenated or slave's babies */
			birth: 0,
			/** Strength of the rumors that you are too soft on your rebellious slaves. */
			weakness: 0,
		};
		/** your favorite refreshment
		 * @type {string} */
		this.refreshment = "cigar";
		/**
		 * * The method of consumption of .refreshment
		 * * 0: smoked
		 * * 1: drunk
		 * * 2: eaten
		 * * 3: snorted
		 * * 4: injected
		 * * 5: popped
		 * * 6: orally dissolved
		 */
		this.refreshmentType = 0;
		/**
		 * * career prior to becoming owner
		 * * (22+)			(14+)					(10+)
		 * * "wealth"		("trust fund")			("rich kid")
		 * * "capitalist"	("entrepreneur")		("business kid")
		 * * "mercenary"	("recruit")				("child soldier")
		 * * "slaver"		("slave overseer")		("slave tender")
		 * * "engineer"		("construction")		("worksite helper")
		 * * "medicine" 	("medical assistant")	("nurse")
		 * * "celebrity"	("rising star")			("child star")
		 * * "escort"		("prostitute")			("child prostitute")
		 * * "servant"		("handmaiden")			("child servant")
		 * * "gang"			("hoodlum")				("street urchin")
		 * * "BlackHat"		("hacker")				("script kiddy")
		 * * "arcology owner"
		 */
		this.career = "capitalist";
		/**
		 * * how player became owner
		 * * "wealth"
		 * * "diligence"
		 * * "force"
		 * * "social engineering"
		 * * "luck"
		 */
		this.rumor = "wealth"; // TODO:@franklygeorge refactor into origin
		/** your ability to function normally in day to day affairs
		 *
		 * 0: normal, 1: hindered, 2: unable */
		this.physicalImpairment = 0;
		/** the players relationships */
		this.relationships = new App.Entity.PlayerRelationshipsState();
		/**
		 * you have taken a major injury
		 * number of weeks laid up in bed until recovery
		 */
		this.majorInjury = 0;
		/**
		 * you have a life-changing injury/malaise
		 * @type {number | string}
		 */
		this.criticalDamage = 0;
		/** have had your vagina improved
		 * @type {FC.Bool}
		 * 0: no; 1: yes; */
		this.newVag = 0;
		/**
		 * * "normal"
		 * * "atrophied"
		 */
		this.digestiveSystem = "normal";
		/** progress until .digestiveSystem is swapped to "normal". Completes at 20.*/
		this.weaningDuration = 0;
		/**
		 * Used to give feedback on energy changes
		 */
		this.oldEnergy = 0;
		/**
		 * Used in endWeek to store .need adjustments
		 */
		this.deferredNeed = 0;
		/**
		 * If sexual need is not met, apply punishment for following week.
		 *
		 * 1: overtly horny
		 * 0: sated
		 */
		this.lusty = 0;
		/** have you been drugged with fertility drugs
		 *
		 * 0: no; 1+: how many weeks they will remain in your system */
		this.forcedFertDrugs = 0;
		/** @type {string|undefined} */
		this.customTitle = undefined; // TODO:@franklygeorge refactor this to use this.custom.title
		/** @type {string|undefined} */
		this.customTitleLisp = undefined; // TODO:@franklygeorge refactor this to use this.custom.titleLisp

		// // // // // // modified HumanState properties \\ \\ \\ \\ \\ \\

		/** Player's current name */
		this.slaveName = "Anonymous";
		/** Player's original name */
		this.birthName = "Anonymous";
		/** Player sex ("XX", "XY")
		 * @type {FC.GenderGenes} */
		this.genes = "XY";
		this.pronoun = App.Data.Pronouns.Kind.male;
		/** Player's ID
		 * @type {-1} */
		this.ID = SID.PC;
		this.actualAge = 35;
		this.visualAge = 35;
		this.physicalAge = 35;
		this.ovaryAge = 35;
		this.readyOva = 0;
		this.health.condition = 60;
		this.muscles = 30;
		this.height = 185;
		this.natural.height = 185;
		this.nationality = "Stateless";
		/** @type {0|1|2|3} Their voice; 0: mute, 1: deep, 2: feminine, 3: high, girly */
		this.voice = 1;
		this.boobs = 200;
		this.natural.boobs = 200;
		/** @type {FC.BreastShape} */
		this.boobShape = "perky";
		this.butt = 2;
		this.face = 100;
		this.hColor = "blonde";
		this.origHColor = "blonde";
		this.hLength = 2;
		this.eyebrowHColor = "blonde";
		this.pubicHColor = "blonde";
		this.underArmHColor = "blonde";
		/**
		 * @type {number} vagina type
		 * * -1: no vagina
		 * * 0: virgin
		 * * 1: tight
		 * * 2: reasonably tight
		 * * 3: loose
		 * * 4: cavernous
		 * * 10: ruined
		 */
		this.vagina = -1;
		this.preg = 0;
		this.dick = 4;
		/** @type {FC.ProstateType} */
		this.prostate = 1;
		this.balls = 3;
		this.scrotum = 4;
		/** @type {FC.Clothes} */
		this.clothes = "nice business attire";
		this.pubicHStyle = "hairless";
		this.underArmHStyle = "hairless";
		this.intelligence = 100;
		this.intelligenceImplant = 30;
		this.energy = 65;
		this.devotion = 100; // used in some functions like `milkAmount()`, `cumAmount()`, and probably others
		/**
		 * A list of IDs of anyone the PC has ever slept with.
		 *
		 * Only contains unique entries.
		 *
		 * | ***ID*** | **Type**               |
		 * |---------:|:-----------------------|
		 * | *1+*     | Normal slave		   |
		 * | *-2*     | Citizen*               |
		 * | *-3*     | PC's former master*    |
		 * | *-4*     | Fellow arcology owner* |
		 * | *-6*     | Societal Elite*        |
		 * | *-8*     | Animal*                |
		 * | *-9*     | Futanari Sister*       |
		 * | *-10*    | Rapist*                |
		 *
		 * *TODO: *not currently implemented*
		 * @type {Set<number>}
		 */
		this.partners = new Set();
		this.attrXX = 100;
		this.attrXY = 100;
		this.attrKnown = 1;
		/** Counts various thing you have done */
		this.counter = new App.Entity.PlayerActionCountersState();
		/** Your skills */
		this.skill = new App.Entity.PlayerSkillsState();
		/** Your rule set */
		this.rules = new App.Entity.RuleState(true);
		/** Controls if femPC lost virginity before or after taking over */
		this.trueVirgin = 0;
	}
};
