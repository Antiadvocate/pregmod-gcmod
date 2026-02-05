/** Container for temporary variables that must be shared between different elements of the slave assignment report
 * It's still effectively global data (so use sparingly), but with some enforced scoping, and without getting SugarCube involved
 * Should always be null unless App.EndWeek.slaveAssignmentReport is running
 * @type {App.EndWeek.SASharedVariables}
 */
App.EndWeek.saVars = null;

App.EndWeek.SASharedVariables = class {
	/** Initialize - declare members that need to persist *between* slaves here */
	constructor() {
		/** How many slaves can the HG still impregnate? */
		this.HGCum = 0;
		/** How many slaves can the HG still train? */
		this.HGEnergy = 0;
		/** Was the HG's slave successful at helping her? */
		this.HGSlaveSuccess = false;
		/** How much cash bonus is the Madam contributing to her whores? */
		this.madamBonus = 0;
		/** @type {Partial<ReturnType<typeof slaveJobValues>>} Slave job values */
		this.slaveJobValues = {};
		/** Whore price adjustments (per class) @type {{topClass?: 0, upperClass?: 0, middleClass?:0, lowerClass?: 0}} */
		this.whorePriceAdjustment = {};
		/** How many slaves can the designated stud still impregnate? */
		this.StudCum = 0;
		/** Are slaves with the aggressive sperm gene mod jacking off or having sex in the spa pool? */
		this.poolJizz = 0;
		/** Which aggressive sperm slaves are knocking up the spa bathers? @type {{ID: FC.HumanID, weight: number}[]} */
		this.poolJizzers = [];
		/** How much energy does the player have left to fuck slaves who need it? */
		this.freeSexualEnergy = 0;
		/** How big is the average dick on a slave? */
		this.averageDick = 0;
		/** Who are your subordinate slaves actually assigned to?
		 * @type {Map<FC.SlaveState["subTarget"], Array<FC.HumanID>>} - key is sub target, value is list of sub slaves (by ID) assigned to that target
		 * FIXME: This is read from (.get()), but nothing adds to it (.set()) so it always returns undefined. Either add to this or remove it completely
		 */
		this.subSlaveMap = new Map();
		/** Slave art manager */
		this.slaveArt = null;
		/** Need cap per slave. Array indices are the slave IDs (resulting in a sparse array, but that's ok, because we never save this array)
		 *  @type {Array<FC.HumanState["need"]>}
		 */
		this.needCapPerSlave = [];
		/** Which employees the leader of the currently processed facility is having sex with this week
		 *  @type {Set<FC.HumanID>}
		 *  @see App.EndWeek.getFLSex
		 */
		this.flSex = new Set();
		/** Which employees the leader is impregnating this week.
		 * @type {Record<FC.HumanID, { success: boolean, virginityLoss: boolean }>}
		 */
		this.flImpreg = {};
		/**
		 * Assignments texts for slaves who choose their own assignment, set in App.SlaveAssignment.choosesOwnJob()
		 * @type {Partial<Record<FC.HumanID, string>>}
		 */
		this.choosesOwnAssignmentText = {};
		/**
		 * Effective Whore Class for use in saWhore. Array indices are the slave IDs
		 * * 1: Lower class
		 * * 2: Middle class
		 * * 3: Upper class
		 * * 4: Top class
		 * @type {Array<1|2|3|4>}
		 */
		this.effectiveWhoreClass = [];
		/**
		 * Max Whore Class for use in saWhore. Array indices are the slave IDs
		 * @type {Array<1|2|3|4>}
		 */
		this.maxWhoreClass = [];
		/** How was a slave tortured, if one was. */
		this.slaveTortured = "none";
		/**
		 * Array of all slaves that have reported in that week.
		 * Used to display "missed" reports in odd cases, ie. clinic -> brothel.
		 * Set in individualSlaveReport, with exceptions for saAgent
		 * @type {FC.HumanID[]}
		 */
		this.slaveCheckedIn = [];
		/**
		 * Available capacity in facilities; each penthouse slave assigned a job affiliated to a facility will take one spot if any are left.
		 * @type  {{[key: string]: number}}
		 */
		this.facilitySpots = {
			servantsQuarters: 0
		};
		/**
		 * Object that stores pregnancy events from the Slave Assignment reports report to use in saPregnancy.
		 * Can store multiple events and will randomly pick one.
		 * Key of the object should be the slave id.
		 * Includes an optional callback that can be used to increment sex act counts or update stats.
		 * @type {{[key: number]: { message: string, fatherId: number, callback: (slave: FC.SlaveState) => void | undefined }[]}}
		 */
		this.pregnancy = {};
	}

	/** Compute shared subslave ratio (subslaves per ordinary slave) */
	get subSlaveRatio() {
		const subSlaves = this.subSlaveMap.get(0);
		const subCount = subSlaves ? subSlaves.length : 0;
		if (V.dormitoryPopulation + V.roomsPopulation <= subCount) {
			return subCount; // avoid negative result or divide by zero
		}
		return subCount / (V.dormitoryPopulation + V.roomsPopulation - subCount);
	}

	/**
	 * Helper to add a preg event to the facility pregnancy object.
	 * @param {FC.SlaveState} slave
	 * @param {number} fatherId
	 * @param {string} message
	 * @param {(slave: FC.SlaveState) => void | undefined} callback
	 */
	addPregEvent(slave, fatherId, message, callback=undefined) {
		if (this.pregnancy[slave.ID]) {
			this.pregnancy[slave.ID] = [...this.pregnancy[slave.ID], {message, fatherId, callback}];
		} else {
			this.pregnancy[slave.ID] = [{message, fatherId, callback}];
		}
	}

	/**
	 * @param {FC.SlaveState} slave
	 */
	getRandomPregEvent(slave) {
		const events = this.pregnancy[slave.ID];
		if (!events) {
			return null;
		}
		return jsEither(events);
	}
};
