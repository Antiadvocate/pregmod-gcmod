/** @file This holds data structures that are unique to `App.Entity.SlaveState` */

/**
 * Returns all SlaveState objects;
 * Doesn't return GenePoolRecords from the gene pool;
 * Doesn't return MissingParentRecords from V.missingTable;
 * @param {boolean} [legacy=false]
 * @returns {FC.SlaveState[]}
 */
globalThis.getSlaveStates = (legacy=false) => {
	// TODO:@franklygeorge once ChildState is implemented add it to this
	let allSlaveRecords = []
		.concat(getSlaves(legacy).asArray())
		.concat(getInfants(legacy).asArray())
		.concat(getTankSlaves(legacy).asArray())
		.concat(getAllDetachedSlaveStates());

	return allSlaveRecords;
};

/**
 * Returns all SlaveStates for detached slaves, skips any detached that are set to 0
 * @returns {FC.SlaveState[]}
 */
globalThis.getAllDetachedSlaveStates = () => {
	const actors = [];
	if (V.detached === undefined) {
		// we have to have the legacy paths in here or BC may fail :(
		const hostage = getProp(V, "hostage");
		if (hostage) { actors.push(hostage); }
		const hostageWife = getProp(V, "hostageWife");
		if (hostageWife) { actors.push(hostageWife); }
		const boomerang = getProp(V, "boomerangSlave");
		if (boomerang) { actors.push(boomerang); }
		const shelterSlave = getProp(V, "shelterSlave");
		if (shelterSlave) { actors.push(shelterSlave); }
		const traitor = getProp(V, "traitor");
		if (traitor) { actors.push(traitor); }
	} else {
		if (V.detached.hostage.wife) { actors.push(V.detached.hostage.wife); }
		for (const data of Object.values(V.detached)) {
			if (data.actor !== 0) { actors.push(data.actor); }
		}
	}

	return actors;
};

/**
 * Encapsulates porn performance of a slave. Used inside of the
 * App.Entity.SlaveState class.
 * @see App.Entity.SlaveState
 */
App.Entity.SlavePornPerformanceState = class {
	constructor() {
		/** is the studio outputting porn of her?
		 * 0: no; 1: yes
		 * @type {FC.Bool} */
		this.feed = 0;
		/** how famous her porn is? */
		this.viewerCount = 0;
		/** how much money is being spent on promoting her porn */
		this.spending = 0;
		/**
		 * how famous she is in porn
		 * * 0: not
		 * * 1: some
		 * * 2: recognized
		 * * 3: world renowned
		 */
		this.prestige = 0;
		/** description to go with @see pornPrestige
		 * @type {FC.Zeroable<string>} */
		this.prestigeDesc = 0;

		/** what porn she is known for */
		this.fameType = "none";
		/** what aspect of her the upgraded studio is focusing on for porn */
		this.focus = "none";

		/** fame values for each porn genre */
		this.fame = {};
		for (const genre of App.Porn.getAllGenres()) {
			this.fame[genre.fameVar] = 0;
		}
	}
};

/**
 * Keeps track of lots of stats (births, sexual interactions, etc)
 * Has extra stats that only apply to SlaveState objects
 * @see App.Entity.SlaveState
 */
App.Entity.SlaveActionCountersState = class SlaveActionCountersState extends App.Entity.HumanActionCountersState {
	constructor() {
		super();
		/** number of births as your slave */
		this.births = 0;
		/** number of times used by the general public */
		this.publicUse = 0;
		/** number of slaves killed in pit fights*/
		this.pitKills = 0;
		/** number of bestiality encounters */
		this.bestiality = 0;
		/** How many children they have fucked into you that you later birthed. */
		this.PCChildrenFathered = 0;
		/** How many times they have knocked you up. */
		this.PCKnockedUp = 0;
		/** How many times you've knocked them up. */
		this.timesBred = 0;
		/** How many of your children has they borne. */
		this.PCChildrenBeared = 0;
		/** In how many random events has been actor */
		this.events = 0;
	}
};

/**
 * Defines how skilled they are at a given subject
 * Has subjects that only apply to SlaveState objects
 * @see App.Entity.SlaveState
 */
App.Entity.SlaveSkillsState = class SlaveSkillsState extends App.Entity.HumanSkillsState {
	constructor() {
		super();
		/**
		 * whoring skill
		 * * 0-10: unskilled
		 * * 11-30: basic
		 * * 31-60: skilled
		 * * 61-99: expert
		 * * 100+: master
		 */
		this.whoring = 0;
		/**
		 * entertaining skill
		 * * 0-10: unskilled
		 * * 11-30: basic
		 * * 31-60: skilled
		 * * 61-99: expert
		 * * 100+: master
		 */
		this.entertainment = 0;
		/**
		 * combating skill
		 * * 0-10: unskilled
		 * * 11-30: basic - Basic weapon handling, no tactics
		 * * 31-60: skilled - Good weapon handling, basic tactics
		 * * 61-99: expert - Expert weapon handling, good tactics
		 * * 100+: master - Master weapon handling, master tactics
		 *
		 * Notably, tactics lags behind weapon skill.
		 * Weapon skill includes hand-to-hand, melee and ranged.
		 *
		 * For reference:
		 * * Stick 'em with the pointy end: 0
		 * * Can shoot, hit and reload: 20
		 * * Well trained thug: 40
		 * * Trained soldier: 70
		 * * Special Ops: 100
		 */
		this.combat = 0;

		/** Their skill as a Head Girl
		 *
		 * default cap is 200 */
		this.headGirl = 0;
		/** Their skill as a recruiter
		 *
		 * default cap is 200 */
		this.recruiter = 0;
		/** Their skill as a bodyguard
		 *
		 * default cap is 200 */
		this.bodyguard = 0;
		/** Their skill as a brothel madam
		 *
		 * default cap is 200 */
		this.madam = 0;
		/** Their skill as a DJ
		 *
		 * default cap is 200 */
		this.DJ = 0;
		/** Their skill as a nurse
		 *
		 * default cap is 200 */
		this.nurse = 0;
		/** Their skill as a teacher
		 *
		 * default cap is 200 */
		this.teacher = 0;
		/** Their skill as an attendant
		 *
		 * default cap is 200 */
		this.attendant = 0;
		/** Their skill as a matron
		 *
		 * default cap is 200 */
		this.matron = 0;
		/** Their skill as a stewardess
		 *
		 * default cap is 200 */
		this.stewardess = 0;
		/** Their skill as a milkmaid
		 *
		 * default cap is 200 */
		this.milkmaid = 0;
		/** Their skill as a farmer
		 *
		 * default cap is 200 */
		this.farmer = 0;
		/** Their skill as a wardeness
		 *
		 * default cap is 200 */
		this.wardeness = 0;
		/** Their skill as a servant.
		 *
		 * default cap is 200 */
		this.servant = 0;
		/** Their skill as an entertainer
		 *
		 * default cap is 200 */
		this.entertainer = 0;
		/** Their skill as a whore
		 *
		 * default cap is 200 */
		this.whore = 0;
	}
};

/**
 * This defines properties that are unique to slaves.
 * Properties shared between the PC and slaves should be defined in `App.Entity.HumanState`.
 * @see App.Entity.HumanState
 */
App.Entity.SlaveState = class extends App.Entity.HumanState {
	/**
	 * @param {number|string} [seed=undefined]
	 */
	constructor(seed=undefined) {
		// NOTE if the property you are adding could apply to more than just slaves then it likely belongs in HumanState instead
		super(seed);
		/**
		 * * "no drugs"
		 * * "breast injections"
		 * * "butt injections"
		 * * "clitoris enhancement"
		 * * "lip injections"
		 * * "fertility drugs"
		 * * "penis enhancement"
		 * * "testicle enhancement"
		 * * "psychosuppressants"
		 * * "psychostimulants"
		 * * "steroids"
		 * * "hormone enhancers"
		 * * "hormone blockers"
		 * * "super fertility drugs"
		 * * "intensive clitoris enhancement"
		 * * "hyper breast injections"
		 * * "hyper butt injections"
		 * * "hyper penis enhancement"
		 * * "hyper testicle enhancement"
		 * * "female hormone injections"
		 * * "male hormone injections"
		 * * "anti-aging cream"
		 * * "appetite suppressors"
		 * * "penis atrophiers"
		 * * "testicle atrophiers"
		 * * "clitoris atrophiers"
		 * * "labia atrophiers"
		 * * "nipple atrophiers"
		 * * "lip atrophiers"
		 * * "breast redistributors"
		 * * "butt redistributors"
		 * * "sag-B-gone"
		 * * "growth stimulants"
		 * * "stimulants" (planned)
		 * @type {FC.Drug}
		 */
		this.drugs = "no drugs";
		/** game week slave was acquired.
		 *
		 * _0: Obtained prior to game start / at game start_ */
		this.weekAcquired = 0;
		/** porn fame */
		this.porn = new App.Entity.SlavePornPerformanceState();
		/** reason for prestige
		 * @type {FC.Zeroable<string>} */
		this.prestigeDesc = 0;
		/**
		 * slave's relationship
		 * * -3: married to you
		 * * -2: emotionally bound to you
		 * * -1: emotional slut
		 * * 0: none
		 * * 1: friends with relationshipTarget
		 * * 2: best friends with relationshipTarget
		 * * 3: friends with benefits with relationshipTarget
		 * * 4: lover with relationshipTarget
		 * * 5: relationshipTarget 's slave wife
		 * @type {FC.RelationShipKind}
		 */
		this.relationship = 0;
		/** @type {FC.HumanID} target of relationship (ID) */
		this.relationshipTarget = 0;
		/**
		 * slave's rivalry
		 * * 0: none
		 * * 1: dislikes rivalryTarget
		 * * 2: rival of rivalryTarget
		 * * 3: bitterly hates rivalryTarget
		 * @type {FC.RivalryType}
		 */
		this.rivalry = 0;
		/** target of rival (ID) */
		this.rivalryTarget = 0;
		/** slave will serve subTarget (ID - 0 is all slaves, -1 is stud) */
		this.subTarget = 0;
		/** Can the slave recruit relatives. Non-random slaves should be left off. */
		this.canRecruit = 0;
		/**
		 * can slave choose own assignment
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.choosesOwnAssignment = 0;
		/** slave's assignment
		 * @type {FC.Assignment} */
		this.assignment = Job.REST;
		/** how many weeks a slave is sentenced to work a job */
		this.sentence = 0;
		/** which hole to focus on when serving you
		 * @type {FC.ToyHole} */
		this.toyHole = "all her holes";
		/**
		 * How long her servitude will be.
		 *
		 * -1: not; 0+: number of weeks remaining */
		this.indenture = -1;
		/** 2: complete protection; 1: some protection; 0: no protection
		 * @type {FC.IndentureType} */
		this.indentureRestrictions = 0;
		/**
		 * slave 's trust.
		 * * -96-: abjectly terrified
		 * * -95 - -51: terrified
		 * * -50 - -21: frightened
		 * * -20 - 20: fearful
		 * * 21 - 50: careful
		 * * 51 - 95: trusting
		 * * 96+: profoundly trusting
		 */
		this.trust = 0;
		/** used to calculate trust loss/gain */
		this.oldTrust = 0;
		/** used to calculate devotion loss/gain */
		this.oldDevotion = 0;
		/**
		 * smart piercing setting
		 * @type {FC.SmartPiercingSetting}
		 */
		this.clitSetting = "vanilla";
		/** follows rules or is exempt from them
		 *
		 * 0: exempt; 1: obeys
		 * @type {FC.Bool} */
		this.useRulesAssistant = 1;
		/**
		 * * "healthy"
		 * * "restricted"
		 * * "corrective"
		 * * "muscle building"
		 * * "fattening"
		 * * "slimming"
		 * * "XX"
		 * * "XY"
		 * * "XXY"
		 * * "cum production"
		 * * "cleansing"
		 * * "fertility"
		 * * "high caloric" (planned)
		 * @type {FC.SlaveDiet}
		 */
		this.diet = "healthy";
		/**
		 * how much of her diet is cum
		 * 0: none; 1: supplemented; 2: nearly entirely
		 * @type {FC.dietCumType}*/
		this.dietCum = 0;
		/** how much of her diet is milk
		 *
		 * 0: none; 1: supplemented; 2: nearly entirely
		 * @type {FC.dietMilkType}
		 * */
		this.dietMilk = 0;
		/** Fuckdoll degree
		 *
		 * 0: not; 1+: Fuckdoll */
		this.fuckdoll = 0;
		/** 0: no; 1: yes
		 * @type {FC.Bool} */
		this.choosesOwnClothes = 0;
		/**
		 * The amount of sex the slave had with customers for certain jobs during a week
		 */
		this.sexAmount = 0;
		/**
		 * The 'quality' of the sex a slave had with customers. High quality means they fetch a higher price for their services
		 */
		this.sexQuality = 0;
		/** Does this slave refer to you rudely?
		 * @type {FC.Bool}
		 * 0: not being rude; 1: insists on calling you a rude title */
		this.rudeTitle = 0;
		/** @type {string[]} */
		this.currentRules = [];
		/** Is the PC permitted to fuck this slave pregnant.
		 *  MB Cattle Ranch bulls will ignore this.
		 * @type {FC.Bool}
		 * * 0: no
		 * * 1: yes */
		this.PCExclude = 0;
		/** Is the Head Girl permitted to fuck this slave pregnant.
		 * @type {FC.Bool}
		 * * 0: no
		 * * 1: yes */
		this.HGExclude = 0;
		/** Is the Stud permitted to fuck this slave pregnant.
		 *  MB Cattle Ranch bulls will ignore this.
		 * @type {FC.Bool}
		 * * 0: no
		 * * 1: yes */
		this.StudExclude = 0;
		/** Is this slave excluded from insemination roulette.
		 * @type {FC.Bool}
		 * * 0: no
		 * * 1: yes */
		this.inseminationExclude = 0;
		/** Eugenics variable. Is the slave allowed to choose to wear chastity.
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.choosesOwnChastity = 0;
		/**
		 * Array that holds a slaves fitted prosthetics. Objects are used to ensure easier expansion later (tattoos for limbs and similar).
		 *
		 * Elements of the array should be objects.
		 * * .id: ID of the prosthetic, see App.Data.prostheticIDs
		 * @type {Array.<{id:string}>} */
		this.readyProsthetics = [];
		/** Whether a slave is permitted to eat Hedonistic Decadence's specialized slave food.
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.onDiet = 0;
		/** Used to tell if the slave is from this game or a previous.
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.newGamePlus = 0;
		/** @type {FC.Bool} */
		this.overrideRace = 0;
		/** @type {FC.Bool} */
		this.overrideSkin = 0;
		/** @type {FC.Bool} */
		this.overrideEyeColor = 0;
		/** @type {FC.Bool} */
		this.overrideHColor = 0;
		/** @type {FC.Bool} */
		this.overridePubicHColor = 0;
		/** @type {FC.Bool} */
		this.overrideArmHColor = 0;
		/** @type {FC.Bool} */
		this.overrideBrowHColor = 0;
		/** Amount of cash paid to acquire the slave
		 *
		 * accepts negative numbers, 0, or 1.
		 * 1: unknown price; 0: free; negative: amount paid */
		this.slaveCost = 0;
		/** Amount of cash you have spent because of this slave
		 *
		 * accepts negative numbers or 0 */
		this.lifetimeCashExpenses = 0;
		/** Total amount of cash you have earned because of this slave
		 *
		 * accepts positive numbers or 0 */
		this.lifetimeCashIncome = 0;
		/** Amount of cash you have earned because of this slave last week.
		 *
		 * Accepts positive numbers or 0 */
		this.lastWeeksCashIncome = 0;
		/** Not currently used, will work similarly to the cash variables above */
		this.lifetimeRepExpenses = 0;
		/** Not currently used, will work similarly to the cash variables above */
		this.lifetimeRepIncome = 0;
		/** Not currently used, will work similarly to the cash variables above */
		this.lastWeeksRepIncome = 0;
		/** Not currently used, will work similarly to the cash variables above */
		this.lastWeeksRepExpenses = 0;
		/** Player selected class for whore to target
		 * * 1: Lower class
		 * * 2: Middle class
		 * * 3: Upper class
		 * * 4: Top class
		 */
		this.whoreClass = 0;

		/** Week By Week History of selected slave stats
		 * @type {FC.SlaveHistory[]}
		 */
		this.history = [];

		/** Counts various thing they have done */
		this.counter = new App.Entity.SlaveActionCountersState();
		/** Their skills */
		this.skill = new App.Entity.SlaveSkillsState();

		this.clothingBaseColor = undefined;
		/** @type {string | undefined} */
		this.glassesColor = undefined;
		/** @type {string | undefined} */
		this.shoeColor = undefined;
		/** @type {number | undefined} */
		this.kindness = undefined;
	}
};

/**
 * @callback slaveOperation
 * @param {FC.SlaveState} s
 * @returns {void}
 */

/**
 * @callback slaveTestCallback
 * @param {FC.SlaveState} slave
 * @returns {boolean}
 */
