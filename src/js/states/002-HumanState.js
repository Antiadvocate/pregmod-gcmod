/** @file This holds data structures that `App.Entity.PlayerState` and `App.Entity.SlaveState` have in common */

/**
 * Returns all HumanState objects;
 * Doesn't return GenePoolRecords from the gene pool;
 * Doesn't return MissingParentRecords from V.missingTable;
 * @param {boolean} [legacy=false]
 * @returns {FC.HumanState[]}
 */
globalThis.getHumanStates = (legacy=false) => {
	// TODO:@franklygeorge once ChildState is implemented add it to this
	let allHumanRecords = []
		.concat(getSlaveStates(legacy))
		.concat([V.PC]);


	return allHumanRecords;
};

/**
 * Keeps track of lots of stats (births, sexual interactions, etc)
 */
App.Entity.HumanActionCountersState = class HumanActionCountersState {
	constructor() {
		/** amount of milk given */
		this.milk = 0;
		/** amount of cum given */
		this.cum = 0;
		/** number of births the slave has ever given */
		this.birthsTotal = 0;
		/** number of abortions while in the arcology */
		this.abortions = 0;
		/** number of miscarriages while in the arcology */
		this.miscarriages = 0;
		/** number of labors they have undergone */
		this.laborCount = 0;
		/** How many slaves they have sired. */
		this.slavesFathered = 0;
		/** How many slaves they have knocked up. */
		this.slavesKnockedUp = 0;
		/** The number of times the actor has had their mouth sexually engaged (blowjob, etc).
		 * Use only for logic checks. To increment, use `seX()`.
		 */
		this.oral = 0;
		/** The number of times the actor has had their vagina sexually engaged (penetration, tribbing, etc).
		 * Use only for logic checks. To increment, use `seX()`.
		 */
		this.vaginal = 0;
		/** The number of times the actor has had their anus sexually engaged (penetration, etc).
		 * Use only for logic checks. To increment, use `seX()`.
		 */
		this.anal = 0;
		/** The number of times the actor has had their breasts sexually engaged (titjob, etc).
		 * Use only for logic checks. To increment, use `seX()`.
		 */
		this.mammary = 0;
		/** The number of times the actor has penetrated an orifice.
		 * Use only for logic checks. To increment, use `seX()`.
		 */
		this.penetrative = 0;
		/** number of pit fights won */
		this.pitWins = 0;
		/** number of pit fights lost */
		this.pitLosses = 0;
		/** number of hymen reconstructions */
		this.reHymen = 0;
		/** number of times this character has successfully bred someone */
		this.timesBred = 0;
	}

	/**
	 * Properties that don't exist on App.Entity.SlaveActionCountersState will be lost
	 * @param {App.Entity.SlaveActionCountersState|App.Entity.PlayerActionCountersState} counter
	 * @returns {App.Entity.SlaveActionCountersState}
	 */
	static convertToSlaveActionCountersState(counter) {
		const newCounter = new App.Entity.SlaveActionCountersState();
		for (const key in counter) {
			if (key in newCounter) {
				newCounter[key] = counter[key];
			}
		}
		return newCounter;
	}

	/**
	 * Properties that don't exist on App.Entity.PlayerActionCountersState will be lost
	 * @param {App.Entity.SlaveActionCountersState|App.Entity.PlayerActionCountersState} counter
	 * @returns {App.Entity.PlayerActionCountersState}
	 */
	static convertToPlayerActionCountersState(counter) {
		const newCounter = new App.Entity.PlayerActionCountersState();
		for (const key in counter) {
			if (key in newCounter) {
				newCounter[key] = counter[key];
			}
		}
		return newCounter;
	}
};

/**
 * Defines how skilled they are at a given subject
 */
App.Entity.HumanSkillsState = class HumanSkillsState {
	constructor() {
		// TODO: some of these may not be fully implemented for events handling the PC
		/**
		 * skill in vaginal sex
		 * * 0-10: unskilled
		 * * 11-30: basic
		 * * 31-60: skilled
		 * * 61-99: expert
		 * * 100+: master
		 */
		this.vaginal = 0;
		/**
		 * skill in penetrative sex
		 * * 0-10: unskilled
		 * * 11-30: basic
		 * * 31-60: skilled
		 * * 61-99: expert
		 * * 100+: master
		 */
		this.penetrative = 0;
		/**
		 * skill in oral sex
		 * * 0-10: unskilled
		 * * 11-30: basic
		 * * 31-60: skilled
		 * * 61-99: expert
		 * * 100+: master
		 */
		this.oral = 0;
		/**
		 * skill in anal sex
		 * * 0-10: unskilled
		 * * 11-30: basic
		 * * 31-60: skilled
		 * * 61-99: expert
		 * * 100+: master
		 */
		this.anal = 0;
	}
};

/**
 * How they are allowed to get their fix
 */
App.Entity.ReleaseRulesState = class ReleaseRulesState {
	constructor(isPC = false) {
		/** Can they masturbate?
		 * @type {FC.Bool} */
		this.masturbation = isPC ? 1 : 0;
		/** Can they fuck their romantic partner (relationship = FWB or higher)?
		 * @type {FC.Bool} */
		this.partner = 1;
		/** Can the development facility leader (Nurse, Attendant, etc) fuck them if they need it?
		 * @type {FC.Bool} */
		this.facilityLeader = 1;
		/** Can they fuck with their close family members (siblings/parents/children)?
		 * @type {FC.Bool} */
		this.family = isPC ? 1 : 0;
		/** Can they fuck the general slave population?
		 * @type {FC.Bool} */
		this.slaves = isPC ? 1 : 0;
		/** Will the master allow them to solicit sex from the master?
		 * @type {FC.Bool} */
		this.master = 1;
	}
};

/**
 * Defines what rules apply to them
 */
App.Entity.RuleState = class RuleState {
	constructor(isPC = false) {
		/**
		 * * "spare"
		 * * "normal"
		 * * "luxurious"
		 * @type {FC.Rules.Living}
		 */
		this.living = isPC ? "luxurious" : "spare";
		/**
		 * * "none"
		 * * "cruel"
		 * * "restrictive"
		 * * "permissive"
		 * * "mandatory"
		 * @type {FC.Rules.Rest}
		 */
		this.rest = isPC ? "permissive" : "restrictive";
		/**
		 * Are they allowed to use mobility aids
		 * * "restrictive"
		 * * "permissive"
		 * @type {FC.Rules.Mobility}
		 */
		this.mobility = isPC ? "permissive" : "restrictive";
		/**
		 * * "restrictive"
		 * * "permissive"
		 * * "accent elimination"
		 * * "language lessons"
		 * @type {FC.Rules.Speech}
		 */
		this.speech = isPC ? "permissive" : "restrictive";
		/** release rules */
		this.release = new App.Entity.ReleaseRulesState(isPC);
		/**
		 * * "restrictive"
		 * * "just friends"
		 * * "permissive"
		 * @type {FC.Rules.Relationship}
		 */
		this.relationship = isPC ? "permissive" : "restrictive";
		/**
		 * * "none"
		 * * "induce"
		 * * "maintain"
		 * @type {FC.Rules.Lactation}
		 */
		this.lactation = "none";
		/**
		 * * "confinement"
		 * * "whipping"
		 * * "chastity"
		 * * "situational"
		 * @type {FC.Rules.Punishment}
		 */
		this.punishment = "situational";
		/**
		 * * "relaxation"
		 * * "drugs"
		 * * "orgasm"
		 * * "situational"
		 * @type {FC.Rules.Reward}
		 */
		this.reward = isPC ? "relaxation" : "situational";
	}
};

/**
 * Encapsulates custom AI prompts
 */
App.Entity.SlaveCustomAIPrompts = class SlaveCustomAIPrompts {
	constructor() {
		/** replaces the slave's posture prompts with a custom string for user-specified poses */
		this.pose = "";
		/** replaces the slave's expression positive prompt with a custom string for user-specified expressions */
		this.expressionPositive = "";
		/** replaces the slave's expression negative prompt with a custom string for user-specified expressions */
		this.expressionNegative = "";
		/** automatically adds to the dynamic positive prompt string */
		this.positiveRA = "";
		/** automatically adds to the dynamic positive prompt string */
		this.negativeRA = "";
		/** manually adds to the dynamic positive prompt string */
		this.positive = "";
		/** manually adds to the dynamic negative prompt string */
		this.negative = "";
	}
};

/**
 * Encapsulates custom poses
 */
App.Entity.SlaveCustomAIPose = class SlaveCustomAIPose {
	constructor() {
		/** custom pose type selected. JSON or PNG for completely custom poses from file (see filename), Library to pick by name (see name).
		 * @type {"Library"|"JSON"|"PNG"}
		 */
		this.type = "Library";
		/** pick a custom pose from the library
		 * @type {keyof App.Data.Art.Poses}
		 */
		this.name = "Standing, Neutral";
		/** load a custom pose from file
		 * @type {string}
		 */
		this.filename = "";
	}
};

/**
 * Custom data defined by the user to be used with HumanState objects
 * @see App.Entity.HumanState
 */
App.Entity.CustomAddonsState = class CustomAddonsState {
	constructor() {
		/** adds a custom tattoo */
		this.tattoo = "";
		/** a label appended after their name */
		this.label = "";
		/** adds a custom description */
		this.desc = "";
		/** What the slave refers to you as. */
		this.title = "";
		/** Replaces SlaveTitle() if set. */
		this.name = "";
		/** What the slave refers to you as, with a lisp.*/
		this.titleLisp = "";
		/**
		 * holds their custom image file name (used if images are enabled)
		 *
		 * null: no custom image
		 * @type {FC.CustomImage}
		 */
		this.image = null;
		/**
		 * holds the custom hair vector base file name
		 *
		 * used if vector images are enabled
		 * @type {FC.Zeroable<string>}
		 */
		this.hairVector = 0;
		/** skips their image in the weekly ai auto regeneration
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.aiAutoRegenExclude = 0;
		/**
		 * holds the ai image ID
		 *
		 * used if ai images are enabled
		 * @type {Array<number>}
		 */
		this.aiImageIds = [];
		/**
		 * holds the index of the displayed AI image in aiImageIds
		 *
		 * used if ai images are enabled
		 * @type {number}
		 */
		this.aiDisplayImageIdx = -1;
		/**
		 * custom AI prompts; may be null or absent
		 * @type {App.Entity.SlaveCustomAIPrompts}
		 */
		this.aiPrompts = null;
		/**
		 * if true then custom AI prompts will overwrite dynamic AI prompts, otherwise they will be appended to the end
		 */
		this.aiPromptsOverwrite = false;
		/**
		 * custom AI pose for OpenPose; may be null or absent.
		 * @type {App.Entity.SlaveCustomAIPose}
		 */
		this.aiPose = null;
	}
};

App.Entity.ScarState = class {
	constructor() {
		/**
		 * generic scar
		 * * 0: no scar
		 * * 1+: increasing intensity of scar
		 */
		this.generic = 0;
		/**
		 * whip scar
		 * * 0: no scar
		 * * 1+: increasing intensity of scar
		 */
		this.whip = 0;
		/**
		 * burn scar
		 * * 0: no scar
		 * * 1+: increasing intensity of scar
		 */
		this.burn = 0;
		/**
		 * surgical scar
		 * * 0: no scar
		 * * 1+: increasing intensity of scar
		 */
		this.surgical = 0;
		/**
		 * cutting scar
		 * * 0: no scar
		 * * 1+: increasing intensity of scar
		 */
		this.cutting = 0;
		/**
		 * chain/manacles scar, focused on wrists ankles or neck
		 * * 0: no scar
		 * * 1+: increasing intensity of scar
		 */
		this.chain = 0;
		/**
		 * exotic scar for the face
		 * * 0: no scar
		 * * 1: scar
		 */
		this.exotic = 0;
		/**
		 * menacing scar for the face
		 * * 0: no scar
		 * * 1: scar
		 */
		this.menacing = 0;
		/**
		 * custom scars can vary in number and will have to be defined when created.
		 */
	}
};

App.Entity.piercingState = class {
	constructor() {
		/** @type {FC.PiercingType} */
		this.weight = 0;
		/**
		 * String describing piercing. Leave empty to use default description.
		 * @type {string}
		 */
		this.desc = "";
	}
};

App.Entity.genitalPiercingState = class extends App.Entity.piercingState {
	constructor() {
		super();
		/** @type {boolean} */
		this.smart = false;
	}
};

App.Entity.piercingStateRA = class {
	constructor() {
		/** @type {FC.PiercingType} */
		this.weight = null;
		/**
		 * String describing piercing. Leave empty to use default description.
		 * @type {string}
		 */
		this.desc = null;
	}
};

App.Entity.genitalPiercingStateRA = class extends App.Entity.piercingStateRA {
	constructor() {
		super();
		/** @type {boolean} */
		this.smart = null;
	}
};

App.Entity.completePiercingState = class {
	constructor() {
		this.ear = new App.Entity.piercingState();
		this.nose = new App.Entity.piercingState();
		this.eyebrow = new App.Entity.piercingState();
		this.lips = new App.Entity.piercingState();
		this.tongue = new App.Entity.piercingState();
		this.nipple = new App.Entity.piercingState();
		this.areola = new App.Entity.piercingState();
		this.navel = new App.Entity.piercingState();
		this.corset = new App.Entity.piercingState();
		this.genitals = new App.Entity.genitalPiercingState();
		this.vagina = new App.Entity.piercingState();
		this.dick = new App.Entity.piercingState();
		this.anus = new App.Entity.piercingState();
	}
};

App.Entity.completePiercingStateRA = class {
	constructor() {
		this.ear = new App.Entity.piercingStateRA();
		this.nose = new App.Entity.piercingStateRA();
		this.eyebrow = new App.Entity.piercingStateRA();
		this.lips = new App.Entity.piercingStateRA();
		this.tongue = new App.Entity.piercingStateRA();
		this.nipple = new App.Entity.piercingStateRA();
		this.areola = new App.Entity.piercingStateRA();
		this.navel = new App.Entity.piercingStateRA();
		this.corset = new App.Entity.piercingStateRA();
		this.genitals = new App.Entity.genitalPiercingStateRA();
		this.vagina = new App.Entity.piercingStateRA();
		this.dick = new App.Entity.piercingStateRA();
		this.anus = new App.Entity.piercingStateRA();
	}
};

/**
 * To ensure that all new limbs contain expected attributes
 */
App.Entity.LimbState = class LimbState {
	constructor() {
		/**
		 * type of limb
		 * * 1: normal
		 * * 2: simple prosthetic
		 * * 3: advanced - Sex
		 * * 4: advanced - Beauty
		 * * 5: advanced - Combat
		 * * 6: cybernetic
		 * @type {FC.LimbType}
		 */
		this.type = 1;
		/**
		 * Partial ScarState:
		 * The body part in question, such as back or left hand.
		 * The key of that part is the type of scar they can have and the value is how serious it is, from 0 up.
		 * @type {{[key: string]: Partial<App.Entity.ScarState>}} */
		this.scar = {};
		/**
		 * Key: body part
		 * Value: Brand description
		 * @type {{[key: string]: string}} */
		this.brand = {};
	}
};

/**
 * To ensure that all new arms contain expected attributes
 */
App.Entity.ArmState = class extends App.Entity.LimbState {
	constructor() {
		super();
	}
};

/**
 * To ensure that all new legs contain expected attributes
 */
App.Entity.LegState = class extends App.Entity.LimbState {
	constructor() {
		super();
	}
};

/**
 * To ensure that all new eyes contain expected attributes
 */
App.Entity.SingleEyeState = class SingleEyeState {
	constructor() {
		/**
		 * type of eye
		 * * 1: normal
		 * * 2: glass
		 * * 3: cybernetic
		 */
		this.type = 1;
		/**
		 * vision of eye
		 * * 0: blind
		 * * 1: impaired
		 * * 2: normal
		 */
		this.vision = 2;
		/**
		 * current eye color
		 */
		this.iris = "brown";
		/**
		 * pupil shape
		 */
		this.pupil = "circular";
		/**
		 * sclera color
		 */
		this.sclera = "white";
	}
};

App.Entity.EyeState = class EyeState {
	constructor() {
		this.left = new App.Entity.SingleEyeState();
		this.right = new App.Entity.SingleEyeState();
		this.origColor = "brown";
	}
};

/** Genetic "natural targets" for this individual when full grown, without influence from drugs, surgery, etc */
App.Entity.GeneticState = class GeneticState {
	/**
	 * @param {number|string} [seed=undefined]
	 */
	constructor(seed=undefined) {
		/** adult, natural height; expected height when full-grown/no drugs/no surgery
		 * @type {number} */
		this.height = 170;
		this.boobs = 500;
		this.artSeed = jsRandom(0, 10 ** 14, undefined, seed);
	}
};

/**
 * @typedef {object} App.Entity.enslavePCOptions
 * @property {boolean} [removeKeys=true] If true then we remove any properties that are not found in App.Entity.SlaveState
 * @property {boolean} [setSkills=true] If true then we set the new slaves skills based off the PC's data
 * @property {string} [badEnding="boring"] The type of ending that cause the enslavement. Modifies things. Pass "none" for no extra modification
 * @see App.Entity.SlaveState
 * @see App.Entity.HumanState.enslavePC
 */

/**
 * This defines properties that are shared between slaves and the PC.
 * The values here should be the default for slaves.
 * Any properties that need to be different for the PC should be overwritten in App.Entity.PlayerState.
 * @see App.Entity.PlayerState
 * @see App.Entity.SlaveState
 */
// TODO:@franklygeorge typing hints and documentation for all of these properties
App.Entity.HumanState = class HumanState extends App.Entity.GenePoolRecord {
	/**
	 * @param {number|string} [seed=undefined]
	 */
	constructor(seed=undefined) {
		// NOTE if the property you are adding has to do with the state of the human's body then it likely belongs in `GenePoolRecord` instead
		super(seed);
		/** Their prestige */
		this.prestige = 0;
		/** reason for their prestige
		 * @type {FC.Zeroable<string>} */
		this.prestigeDesc = 0;
		/** @type {string} Their origin */
		this.origin = "";
		/** @type {number} number of their children that are your in your stock */
		this.daughters = 0; // TODO:@franklygeorge: is this update/validated somewhere?; refactor to "children"
		/** @type {number} number of the their siblings that are your in your stock */
		this.sisters = 0; // TODO:@franklygeorge: is this update/validated somewhere?; refactor to "siblings"
		/** @type {number} how far along they are with being trained (skills, flaws, quirks, PC education, PC sparring) */
		this.training = 0;
		/**
		 * Number of ready to be impregnated ova (override normal cases),
		 *
		 * For delayed impregnations with multiples. Used onetime on next call of the SetPregType
		 * widget. After SetPregType use it to override .pregType, it set back to 0 automatically.
		 * @type {number | undefined}
		 */
		this.readyOva = undefined;
		/**
		 * They have a minor injury ("black eye", "bruise", "split lip")
		 * @type {FC.Zeroable<string>}
		 */
		this.minorInjury = 0;
		/** @type {FC.EyeWear} */
		this.eyewear = "none";
		/** @type {FC.EarWear} */
		this.earwear = "none";

		/**
		 * Used for the player, but it is here for function compatibility. (whatever that means)
		 * TODO:@franklygeorge find where this is being checked, make sure it is isPlayer() exclusive, then move this to PlayerState
		 * (uncommon in events)(V.PC.preg >= 28)
		 * how the player acts when heavily pregnant
		 * * 0 - no change
		 * * 1 - submissive and motherly
		 * * 2 - aggressive and dominant
		 */
		this.pregMood = 0;
		/**
		 * Menstrual cycle known variable. To be used for fert cycle discover and things like pregnancy without a first period
		 * @type {FC.Bool}
		 * * 0: no; 1: yes
		 */
		this.fertKnown = 0;
		/**
		 * Menstrual cycle control variable.
		 *
		 * * 0-: Danger week
		 * * 1: safe week
		 * * 2: menstruating - check with {@link isMenstruating}
		 * * 3: safe week
		 */
		this.fertPeak = 0;
		/**
		 * Used for late periods. Anything < 0 is late.
		 */
		this.fertLate = 0;
		/**
		 * variable used to set off the birth events
		 *
		 * * 1: birth this week
		 * * 0: not time yet
		 * @type {FC.Bool} */
		this.labor = 0;
		/**
		 * pregnancy time or state. See Pregnancy Control section for more.
		 * * -3: sterilized
		 * * -2: sterile
		 * * -1: contraceptives
		 * * 0: fertile
		 * * 1 - 10: pregnant, not showing
		 * * 11 - 20: showing
		 * * 21 - 30: pregnant
		 * * 30 - 35: very pregnant
		 */
		this.preg = -1;
		/**
		 * Who sired their pregnancy
		 *
		 * | ***ID***             | **Type**                          |
		 * |----------------------|-----------------------------------|
		 * | *SID.RAPIST*         | a rapist                          |
		 * | *SID.FUTA*           | a futanari sister                 |
		 * | *SID.ANIMAL*         | an animal                         |
		 * | *SID.LAB*            | designer baby                     |
		 * | *SID.ELITE*          | a member of the Societal Elite    |
		 * | *SID.CLIENT*         | one of your clients               |
		 * | *SID.ARCOWNER*       | another arcology owner            |
		 * | *SID.FORMERMASTER*   | your former Master                |
		 * | *SID.CITIZEN*        | citizen of your arcology          |
		 * | *SID.PC*             | the player                        |
		 * | *SID.GENERIC*        | unidentifiable                    |
		 * | *A positive number*  | a slave                           |
		 * @type {FC.SpecialID|FC.HumanID}
		 */
		this.pregSource = SID.GENERIC;
		/**
		 * Number of children.
		 *
		 * **Warning!** Should be not changed after initial impregnation setup.
		 * See Pregnancy Control section for more.
		 */
		this.pregType = 0;
		/**
		 * How adapted their body is to being pregnant. 1 pregAdaption supports 1000cc of pregnancy. A normal singleton pregnancy is about 15 pregAdaption.
		 */
		this.pregAdaptation = 50;
		/**
		 * This sets the default option for the pregnancy notice
		 * @type {"none"|"incubator"|"nursery"|"nothing"}
		 */
		this.pregNoticeDefault = "none";
		/**
		 * If true the end of week pregnancy notice will be bypassed
		 */
		this.pregNoticeBypass = false;
		/**
		 * has makeup
		 * * 0: none
		 * * 1: minimal
		 * * 2: expensive, luxurious
		 * * 3: color-coordinated with hair
		 * * 4: heavy
		 * * 5: neon
		 * * 6: color-coordinated neon
		 * * 7: metallic
		 * * 8: color-coordinated metallic
		 */
		this.makeup = 0;
		/**
		 * nail type
		 * * 0: neatly clipped
		 * * 1: long and elegant
		 * * 2: color-coordinated with hair
		 * * 3: sharp and claw-like
		 * * 4: bright and glittery
		 * * 5: very long and garish
		 * * 6: neon
		 * * 7: color-coordinated neon
		 * * 8: metallic
		 * * 9: color-coordinated metallic
		 */
		this.nails = 0;
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
		 * @type {FC.Diet}
		 */
		this.diet = "healthy";
		/**
		 * * -2: heavy male hormones
		 * * -1: male hormones
		 * * 0: none
		 * * 1: female hormones
		 * * 2: heavy female hormones
		 */
		this.hormones = 0;
		/**
		 * * 0: none
		 * * 1: preventatives
		 * * 2: curatives
		 */
		this.curatives = 0;

		/**
		 * * 0: none
		 * * 1: standard
		 * * 2: powerful
		 */
		this.aphrodisiacs = 0;

		/**
		 * may accept strings, use at own risk
		 *
		 * * "a ball gown"
		 * * "a biyelgee costume"
		 * * "a bra"
		 * * "a bunny outfit"
		 * * "a burkini"
		 * * "a burqa"
		 * * "a button-up shirt"
		 * * "a button-up shirt and panties"
		 * * "a chattel habit"
		 * * "a cheerleader outfit"
		 * * "a comfortable bodysuit"
		 * * "a tight Imperial bodysuit"
		 * * "a cybersuit"
		 * * "a dirndl"
		 * * "a fallen nuns habit"
		 * * "a Fuckdoll suit"
		 * * "a gothic lolita dress"
		 * * "a halter top dress"
		 * * "a hanbok"
		 * * "a hijab and abaya"
		 * * "a hijab and blouse"
		 * * "a huipil"
		 * * "a kimono"
		 * * "a klan robe"
		 * * "a latex catsuit"
		 * * "a leotard"
		 * * "a long qipao"
		 * * "a maternity dress"
		 * * "a military uniform"
		 * * "a mini dress"
		 * * "a monokini"
		 * * "a mounty outfit"
		 * * "a nice maid outfit"
		 * * "a nice nurse outfit"
		 * * "a nice pony outfit"
		 * * "a niqab and abaya"
		 * * "a one-piece swimsuit"
		 * * "a penitent nuns habit"
		 * * "a police uniform"
		 * * "a red army uniform"
		 * * "a Santa dress"
		 * * "a scalemail bikini"
		 * * "a schoolgirl outfit"
		 * * "a schutzstaffel uniform"
		 * * "a skimpy loincloth"
		 * * "a slave gown"
		 * * "a slutty klan robe"
		 * * "a slutty maid outfit"
		 * * "a slutty nurse outfit"
		 * * "a slutty outfit"
		 * * "a slutty pony outfit"
		 * * "a slutty qipao"
		 * * "a slutty schutzstaffel uniform"
		 * * "a sports bra"
		 * * "a string bikini"
		 * * "a striped bra"
		 * * "a succubus outfit"
		 * * "a sweater"
		 * * "a sweater and cutoffs"
		 * * "a sweater and panties"
		 * * "a t-shirt"
		 * * "a t-shirt and jeans"
		 * * "a t-shirt and panties"
		 * * "a t-shirt and thong"
		 * * "a tank-top"
		 * * "a tank-top and panties"
		 * * "a thong"
		 * * "a toga"
		 * * "a tube top"
		 * * "a tube top and thong"
		 * * "a confederate army uniform"
		 * * "an apron"
		 * * "an oversized t-shirt"
		 * * "an oversized t-shirt and boyshorts"
		 * * "an evening dress"
		 * * "attractive lingerie"
		 * * "attractive lingerie for a pregnant woman"
		 * * "battlearmor"
		 * * "Imperial Plate"
		 * * "battledress"
		 * * "body oil"
		 * * "boyshorts"
		 * * "chains"
		 * * "clubslut netting"
		 * * "conservative clothing"
		 * * "cutoffs"
		 * * "cutoffs and a t-shirt"
		 * * "harem gauze"
		 * * "jeans"
		 * * "kitty lingerie"
		 * * "leather pants"
		 * * "leather pants and a tube top"
		 * * "leather pants and pasties"
		 * * "lederhosen"
		 * * "nice business attire"
		 * * "no clothing"
		 * * "overalls"
		 * * "panties"
		 * * "panties and pasties"
		 * * "restrictive latex"
		 * * "shibari ropes"
		 * * "slutty business attire"
		 * * "slutty jewelry"
		 * * "spats and a tank top"
		 * * "sport shorts"
		 * * "sport shorts and a sports bra"
		 * * "sport shorts and a t-shirt"
		 * * "stretch pants and a crop-top"
		 * * "striped panties"
		 * * "striped underwear"
		 * * "uncomfortable straps"
		 * * "Western clothing"
		 * @type {FC.Clothes} */
		this.clothes = "no clothing";
		/**
		 * may accept strings, use at own risk
		 * * "none"
		 * * "ancient Egyptian"
		 * * "cruel retirement counter"
		 * * "uncomfortable leather"
		 * * "tight steel"
		 * * "shock punishment"
		 * * "heavy gold"
		 * * "pretty jewelry"
		 * * "nice retirement counter"
		 * * "bell collar"
		 * * "leather with cowbell"
		 * * "bowtie"
		 * * "neck tie"
		 * * "neck corset"
		 * * "stylish leather"
		 * * "satin choker"
		 * * "preg biometrics"
		 * * "silk ribbon"
		 * @type {FC.Collar}
		 */
		this.collar = "none";
		/**
		 * may accept strings, use at own risk
		 * @type {FC.WithNone<FC.Shoes>}
		 */
		this.shoes = "none";
		/**
		 * may accept strings, use at own risk
		 * * "none"
		 * * "porcelain mask"
		 */
		this.faceAccessory = "none";
		/**
		 * may accept strings, use at own risk
		 * @type {FC.WithNone<FC.MouthAccessory>}
		 */
		this.mouthAccessory = "none";
		/** what accessory, if any, are on their nipples */
		this.nipplesAccessory = "none";
		/**
		 * may accept strings, use at own risk
		 *
		 * * "none"
		 * * "a small empathy belly"
		 * * "a medium empathy belly"
		 * * "a large empathy belly"
		 * * "a huge empathy belly"
		 * * "a corset"
		 * * "an extreme corset"
		 * * "a support band"
		 * @type {FC.BellyAccessory}
		 */
		this.bellyAccessory = "none";
		/**
		 * may accept strings, use at own risk
		 * * "none"
		 * * "bullet vibrator"
		 * * "smart bullet vibrator"
		 * * "dildo"
		 * * "large dildo"
		 * * "huge dildo"
		 * * "long dildo"
		 * * "long, large dildo"
		 * * "long, huge dildo"
		 */
		this.vaginalAccessory = "none";
		/**
		 * may accept strings, use at own risk
		 * * "none"
		 * * "vibrator"
		 * * "smart vibrator"
		 */
		this.vaginalAttachment = "none";
		/**
		 * may accept strings, use at own risk
		 * * "none"
		 * * "sock"
		 * * "bullet vibrator"
		 * * "smart bullet vibrator"
		 */
		this.dickAccessory = "none";
		/**
		 * whether the they have a chastity device on their anus
		 * 0 - no
		 * 1 - yes
		 * @type {FC.Bool}
		 */
		this.chastityAnus = 0;
		/**
		 * whether the they have a chastity device on their penis
		 * 0 - no
		 * 1 - yes
		 * @type {FC.Bool}
		 */
		this.chastityPenis = 0;
		/**
		 * whether the they have a chastity device on their vagina
		 * 0 - no
		 * 1 - yes
		 * @type {FC.Bool}
		 */
		this.chastityVagina = 0;
		/**
		 * may accept strings, use at own risk
		 * * "none"
		 * * "hand gloves"
		 * * "elbow gloves"
		 */
		this.armAccessory = "none";
		/**
		 * may accept strings, use at own risk
		 * * "none"
		 * * "short stockings"
		 * * "long stockings"
		 */
		this.legAccessory = "none";
		/**
		 * may accept strings, use at own risk
		 * * "none"
		 * * "plug"
		 * * "large plug"
		 * * "huge plug"
		 * * "long plug"
		 * * "long, large plug"
		 * * "long, huge plug"
		 */
		this.buttplug = "none";
		/**
		 * Do they have an attachment on their buttplug
		 *
		 * may accept strings, use at own risk
		 * * "none"
		 * * "tail"
		 * * "fox tail"
		 * * "cat tail"
		 * * "cow tail"
		 */
		this.buttplugAttachment = "none";

		/**
		 * sex drive
		 * * 0 - 20: no sex drive
		 * * 21 - 40: poor sex drive
		 * * 41 - 60: average sex drive
		 * * 61 - 80: good sex drive
		 * * 81 - 95: powerful sex drive
		 * * 96+: nymphomaniac
		 */
		this.energy = 50;
		/**
		 * how badly they need sex.
		 * 0: sated
		 */
		this.need = 0;

		/** @type {FC.PCDrug} */
	   this.drugs = "no drugs";
		/**
		 *
		 * A list of IDs of anyone they have ever slept with
		 *
		 * Only contains unique entries
		 *
		 * | ***ID***             | **Type**                          |
		 * |----------------------|-----------------------------------|
		 * | *SID.RAPIST*         | a rapist                          |
		 * | *SID.FUTA*           | a futanari sister                 |
		 * | *SID.ANIMAL*         | an animal                         |
		 * | *SID.LAB*            | designer baby                     |
		 * | *SID.ELITE*          | a member of the Societal Elite    |
		 * | *SID.CLIENT*         | one of your clients               |
		 * | *SID.ARCOWNER*       | another arcology owner            |
		 * | *SID.FORMERMASTER*   | your former Master                |
		 * | *SID.CITIZEN*        | citizen of your arcology          |
		 * | *SID.PC*             | the player                        |
		 * | *SID.GENERIC*        | unidentifiable                    |
		 * | *A positive number*  | a slave                           |
		 * @type {Set<FC.SpecialID|FC.HumanID>}
		 */
		this.partners = new Set();

		/**
		 * attraction to women
		 * * 0 - 5: disgusted by women
		 * * 6 - 15: turned off by women
		 * * 15 - 35: not attracted to women
		 * * 36 - 65: indifferent to women
		 * * 66 - 85: attracted to women
		 * * 86 - 95: aroused by women
		 * * 96+: passionate about women
		 *
		 * *if both attrXX and attrXY > 95, slave will be omnisexual*
		 *
		 * *if energy > 95 and either attrXX or attrXY > 95, slave will be nymphomaniac*
		 */
		this.attrXX = 0;
		/**
		 * attraction to men
		 * * 0 - 5: disgusted by men
		 * * 6 - 15: turned off by men
		 * * 15 - 35: not attracted to men
		 * * 36 - 65: indifferent to men
		 * * 66 - 85: attracted to men
		 * * 86 - 95: aroused by men
		 * * 96+: passionate about men
		 *
		 * *if both attrXX and attrXY > 95, slave will be omnisexual*
		 *
		 * *if energy > 95 and either attrXX or attrXY > 95, slave will be nymphomaniac*
		 */
		this.attrXY = 0;
		/** 0: no; 1: yes
		 * @type {FC.Bool} */
		this.attrKnown = 0;
		/**
		 * * "none"
		 * * "mindbroken"
		 * * "submissive"
		 * * "cumslut"
		 * * "humiliation"
		 * * "buttslut"
		 * * "boobs"
		 * * "sadist"
		 * * "masochist"
		 * * "dom"
		 * * "pregnancy"
		 * * "bestiality"
		 * @type {FC.Fetish}
		 */
		this.fetish = "none";
		/** how strong their fetish is (10-100)
		 *
		 * * 10+: enjoys fetish
		 * * 60+: likes fetish
		 * * 95+: loves fetish
		 */
		this.fetishStrength = 70;
		/** is fetish known to player
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.fetishKnown = 0;
		/**
		 * * -1 - no preference
		 * * 0 - anus
		 * * 1 - vagina
		 * @see getPCPreferredHole() for how no preference is handled
		 * @type {-1|0|1}
		 */
		this.preferredHole = -1;

		/** Counts various acts they have participated in */
		this.counter = new App.Entity.HumanActionCountersState();
		/** Their skills */
		this.skill = new App.Entity.HumanSkillsState();
		/** Their rule set */
		this.rules = new App.Entity.RuleState();
		/** Values provided by players */
		this.custom = new App.Entity.CustomAddonsState();

		/** They will give birth this week.
		 * @type {FC.Bool}
		 * 1: true; 0: false */
		this.induce = 0;
		/** They have an anal womb and can get pregnant anally.
		 * @type {FC.Bool}
		 * 1: true; 0: false */
		this.mpreg = 0;
		/** How much fluid is distending them.
		 *
		 * 1: 2L; 2: 4L; 3: 8L */
		this.inflation = 0;
		/**
		 * What kind of fluid is in them.
		 * * "none"
		 * * "water"
		 * * "cum"
		 * * "milk"
		 * * "food"
		 * * "aphrodisiac"
		 * * "curative"
		 * * "tightener"
		 * * "urine"
		 * @type {FC.InflationLiquid}
		 */
		this.inflationType = "none";
		/**
		 * How they are being filled.
		 * * 0: not
		 * * 1: oral
		 * * 2: anal
		 * * 3: orally by another human
		 */
		this.inflationMethod = 0;
		/** If inflationMethod === 3, ID of the human filling them with milk. */
		this.milkSource = 0;
		/** If inflationMethod 3, ID of the human filling them with cum. */
		this.cumSource = 0;
		/** Their internals have ruptured. Used with poor health and overinflation.
		 * @type {FC.Bool}
		 * 1: true; 0: false */
		this.burst = 0;
		/** Do you and them know that they are pregnant.
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.pregKnown = 0;
		/** How long they have been pregnant
		 *
		 * used in place of .preg when pregnancy speed up and slow down are used on a human
		 *
		 * if negative, designates postpartum. */
		this.pregWeek = 0;
		/**
		 * how big their belly is in CCs
		 *
		 * ||thresholds:|
		 * |-|-|
		 * 100	| bloated
		 * 1500   | early pregnancy
		 * 5000   | obviously pregnant
		 * 10000  | very pregnant
		 * 15000  | full term
		 * 30000  | full term twins
		 * 45000  | full term triplets
		 * 60000  | full term quads
		 * 75000  | full term quints
		 * 90000  | full term sextuplets
		 * 105000 | full term septuplets
		 * 120000 | full term octuplets
		 * 150000 | oversized pregnancy
		 * 300000 | hyperpreg state 1
		 * 450000 | hyperpreg state 2
		 * 600000 | hyperpreg state 3
		 * 750000 | hyperpreg state 4
		 */
		this.belly = 0;
		/**
		 * how big their belly is in CCs (pregnancy only)
		 *
		 * ||thresholds|
		 * |-|-|
		 * 100	| bloated
		 * 1500   | early pregnancy
		 * 5000   | obviously pregnant
		 * 10000  | very pregnant
		 * 15000  | full term
		 * 30000  | full term twins
		 * 45000  | full term triplets
		 * 60000  | full term quads
		 * 75000  | full term quints
		 * 90000  | full term sextuplets
		 * 105000 | full term septuplets
		 * 120000 | full term octuplets
		 * 150000 | oversized pregnancy (9+ babies)
		 * 300000 | hyperpreg state 1 (20+ babies)
		 * 450000 | hyperpreg state 2 (30+ babies)
		 * 600000 | hyperpreg state 3 (40+ babies)
		 * 750000 | hyperpreg state 4 (50+ babies)
		 */
		this.bellyPreg = 0;
		/**
		 * how big their belly is in CCs (fluid distension only)
		 *
		 * ||thresholds|
		 * |-|-|
		 * 100   | bloated
		 * 2000  | clearly bloated (2 L)
		 * 5000  | very full (~1 gal)
		 * 10000 | full to bursting (~2 gal)
		 */
		this.bellyFluid = 0;
		/**
		 * Do they have a fillable abdominal implant.
		 * * -1: no
		 * * 0+: yes
		 * * 2000+: Early pregnancy
		 * * 4000+: looks pregnant
		 * * 8000+: looks full term
		 * * 16000+: hyperpregnant 1
		 * * 32000+: hyperpregnant 2
		 */
		this.bellyImplant = -1;
		/** How saggy their belly is after being distended for too long.
		 *
		 * 1+ changes belly description */
		this.bellySag = 0;
		/** How saggy their belly is from being too pregnant.
		 *
		 * 1+ changes belly description and overrides/coincides with bellySag */
		this.bellySagPreg = 0;
		/**
		 * Has their belly implant been filled this week. Causes health damage for overfilling.
		 *
		 * * 0: no pain
		 * * 1: will experience pain
		 * * 2: cannot be filled this week
		 */
		this.bellyPain = 0;
		/** Do they have a cervical implant that slowly feeds cum from being fucked into a fillable implant.
		 *
		 * * 0: no
		 * * 1: vaginal version only
		 * * 2: anal version only
		 * * 3: both vaginal and anal
		 */
		this.cervixImplant = 0;
		/** Can that fluid be pumped throughout her body?
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.cervixImplantTubing = 0;
		/** Where the fluid being routed. */
		this.cervixImplantTarget = "bellyImplant";
		/**
		 * In a eugenics society, are they a designated breeder.
		 * @type {FC.Bool}
		 * * 1: yes
		 * * 0: no */
		this.breedingMark = 0;
		/**
		 * Are they on gestation altering drugs?
		 * * "none"
		 * * "slow gestation"
		 * * "speed up"
		 * * "labor suppressors"
		 * @type {FC.WithNone<FC.GestationDrug>}
		 */
		this.pregControl = "none";
		this.ageAdjust = 0;
		/** have they undergone hair removal surgery
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.bald = 0;
		/** Are they in their original body.
		 *
		 * * 0: yes
		 * * 1+: number of swaps (increases upkeep each time)
		 */
		this.bodySwap = 0;
		/** Who, if relevant, their current body belonged to originally. */
		this.origBodyOwner = "";
		/** Who, if relevant, their original body currently belongs to (i.e. the exact opposite of the variable above). */
		this.origBodyOwnerID = 0;
		/** Their lactation
		 *
		 * 0: none; 1: natural; 2: implant
		 * @type {FC.LactationType} */
		this.lactation = 0;
		/** how many more weeks until lactation dries up
		 *
		 * usually 2 as interactions and lactation implant reset it to 2 */
		this.lactationDuration = 0;
		/**
		 * odds of inducing lactation
		 *
		 * begins trying on breast play if over 10 */
		this.induceLactation = 0;
		/** 0: 10: not used to producing milk(no bonuses);
		 * 11: 50: used to producing milk;
		 * 51: 100: heavily adapted to producing milk(big bonus)
		 * 101: 200: devoted to producing milk(bigger bonus) */
		this.lactationAdaptation = 0;
		/** breast engorgement from unmilked tits */
		this.boobsMilk = 0;
		/** Do they have the breast shape maintaining mesh implant.
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.breastMesh = 0;
		/** Used to denote that they are giving birth prematurely.
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.prematureBirth = 0;

		this.NCSyouthening = 0;

		/** Are their hair under constant maintenance?
		 * @type {FC.Bool}
		 * 0: no; 1: yes */
		this.haircuts = 0;
		/** Whether they were put in the incubator at birth
		 *
		 * * 0: no
		 * * 1: yes, comforting
		 * * 2: yes, terrifying
		 * * 3: yes, husk/body swap
		 * @type {0|1|2|3}
		 */
		this.tankBaby = 0;
		/** erratic weight gain
		 *
		 * 0: stable; 1: gaining; -1: losing */
		this.weightDirection = 0;

		/** @type {FC.PregnancyData | undefined} */
		this.pregData = undefined;
	}

	/**
	 * Will add all properties that are missing compared to PlayerState to the object.
	 * All properties that don't exist on PlayerState will be lost.
	 * This is costly because we do a deep clone op.
	 * A new object is returned. The original is left untouched.
	 * @param {FC.HumanState} slaveOrPC
	 * @returns {FC.PlayerState}
	 */
	static ConvertToPlayerState(slaveOrPC) {
		const actor = new App.Entity.PlayerState();
		deepAssign(actor, slaveOrPC); // deep clone and merge
		const base = new App.Entity.PlayerState();
		for (const key in actor) {
			if (!(key in base)) {
				delete actor[key];
			}
		}
		actor.counter = App.Entity.HumanActionCountersState.convertToPlayerActionCountersState(actor.counter);
		const newSkills = new App.Entity.PlayerSkillsState();
		for (const key in newSkills) {
			if (key in actor.skill) {
				newSkills[key] = actor.skill[key];
			}
		}
		actor.skill = newSkills;
		return actor;
	}

	/**
	 * Will add all properties that are missing compared to SlaveState to the object.
	 * All properties that don't exist on SlaveState will be lost.
	 * This is costly because we do a deep clone op.
	 * A new object is returned. The original is left untouched.
	 * @param {FC.HumanState} PCorSlave
	 * @returns {FC.SlaveState}
	 */
	static ConvertToSlaveState(PCorSlave) {
		const actor = new App.Entity.SlaveState();
		deepAssign(actor, PCorSlave); // deep clone and merge
		const base = new App.Entity.SlaveState();
		for (const key in actor) {
			if (!(key in base)) {
				delete actor[key];
			}
		}
		actor.counter = App.Entity.HumanActionCountersState.convertToSlaveActionCountersState(actor.counter);
		const newSkills = new App.Entity.SlaveSkillsState();
		for (const key in newSkills) {
			if (key in actor.skill) {
				newSkills[key] = actor.skill[key];
			}
		}
		actor.skill = newSkills;
		return actor;
	}

	/**
	 * Converts the PC from a `PlayerState` object to a `SlaveState` object
	 * @param {App.Entity.enslavePCOptions} [options]
	 * @returns {FC.SlaveState}
	 */
	static enslavePC(options) {
		options = sanitizeOptions(options, {
			removeKeys: true,
			setSkills: true,
			badEnding: "boring",
		});
		const slave = new App.Entity.SlaveState();
		deepAssign(slave, V.PC); // deep clone and merge
		if (options.removeKeys) {
			const base = new App.Entity.SlaveState();
			for (const key in slave) {
				if (!(key in base)) {
					delete slave[key];
				}
			}
		}
		if (options.setSkills) {
			const newSkills = new App.Entity.SlaveSkillsState();
			for (const key in slave.skill) {
				if (key in newSkills) {
					let value = 100;
					if (key === "vaginal") {
						value = slave.vagina > 0 ? 100 : 0;
					} else if ([
						"bodyguard", "DJ", "teacher", "attendant", "matron",
						"milkmaid", "farmer", "servant"
					].includes(key)) {
						value = 0;
					} else if (["headGirl", "recruiter", "wardeness"].includes(key)) {
						value = 200;
					} else if (key === "nurse") {
						value = (slave.career === "medicine") ? 200 : 0;
					} else if (key === "whore" || key === "whoring") {
						value = (slave.career === "escort") ? 100 : 0;
					} else if (key === "stewardess") {
						value = (slave.career === "servant" ? 200 : 0);
					}
					newSkills[key] = value;
				}
			}
			slave.skill = newSkills;
		}
		slave.career = "an arcology owner";
		slave.origin = "A former arcology owner that made some poor decisions in $his life.";
		const newCounter = App.Entity.HumanActionCountersState.convertToSlaveActionCountersState(slave.counter);
		newCounter.births = 0;
		newCounter.PCChildrenFathered = 0;
		newCounter.PCKnockedUp = 0;
		newCounter.slavesFathered = 0;
		newCounter.slavesKnockedUp = 0;
		newCounter.timesBred = 0;
		newCounter.PCChildrenBeared = 0;
		newCounter.events = 0;
		slave.counter = newCounter;
		slave.rules = new App.Entity.RuleState();
		const newCustom = new App.Entity.CustomAddonsState();
		newCustom.aiPose = slave.custom.aiPose;
		newCustom.aiPrompts = slave.custom.aiPrompts;
		newCustom.hairVector = slave.custom.hairVector;
		newCustom.image = slave.custom.image;
		slave.custom = newCustom;
		slave.father = 0;
		slave.mother = 0;
		slave.daughters = 0;
		slave.sisters = 0;
		slave.training = 0;
		slave.devotion = -100;
		slave.oldDevotion = -100;
		slave.useRulesAssistant = 1;
		slave.clitSetting = "vanilla";
		slave.clothes = "no clothing";
		slave.attrKnown = 0;
		slave.fetishKnown = 0;
		slave.readyProsthetics = [];
		slave.haircuts = 0;
		slave.slaveCost = 0;

		slave.ID = generateSlaveID();

		switch (options.badEnding) {
			case "notSupreme":
				// @ts-ignore while boobsTat does take custom strings we have intentionally omitted that from its type to allow for correct auto completes, causing this to throw a TSC error - franklygeorge
				slave.boobsTat = `'Subhuman ${capFirstChar(slave.race)}' is printed across $his chest.`;
				break;
			case "subjugated":
				// @ts-ignore while stampTat does take custom strings we have intentionally omitted that from its type to allow for correct auto completes, causing this to throw a TSC error - franklygeorge
				slave.stampTat = `'${capFirstChar(slave.race)} Fuckmeat' is printed above $his butt.`;
				break;
			case "none":
				break;
			default:
				// @ts-ignore while buttTat does take custom strings we have intentionally omitted that from its type to allow for correct auto completes, causing this to throw a TSC error - franklygeorge
				slave.buttTat = `'Product of ${V.arcologies[0].name}.' is stamped on $his left buttock.`;
		}
		return slave;
	}
};
