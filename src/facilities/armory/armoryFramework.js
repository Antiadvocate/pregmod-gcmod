/** @type {FC.FacilityFramework} */
App.Data.Facilities.armory = {
	baseName: "dojo",
	genericName: "Armory",
	jobs: {	},
	defaultJob: null,
	manager: {
		position: "bodyguard",
		positionAbbreviation: "BG",
		assignment: Job.BODYGUARD,
		careers: App.Data.Careers.Leader.bodyguard,
		skill: "bodyguard",
		publicSexUse: false,
		fuckdollAccepted: false,
		broodmotherAccepted: false,
		shouldWalk: true,
		shouldHold: true,
		shouldSee: true,
		shouldHear: true,
		shouldTalk: false,
		shouldThink: true,
		requiredDevotion: 51,
		commonControlledAspects: [
			FacilityControlledAspect.REST
		]
	},
	decorated: false,
	penthouseFacility: true
};

App.Entity.Facilities.BodyguardJob = class extends App.Entity.Facilities.ManagingJob {
	/**
	 * @param {FC.SlaveState} slave
	 * @returns {string[]}
	 */
	checkRequirements(slave) {
		let r = super.checkRequirements(slave);
		if (slave.breedingMark === 1 && V.propOutcome === 1 && V.eugenicsFullControl !== 1 && FutureSocieties.isActive('FSRestart')) {
			r.push(`${slave.slaveName} may not participate in combat.`);
		}
		if (slave.indentureRestrictions > 1) {
			r.push(`${slave.slaveName}'s indenture forbids fighting.`);
		}
		return r;
	}
};

App.Entity.Facilities.Armory = class extends App.Entity.Facilities.Facility {

	constructor() {
		super(
			App.Data.Facilities.armory, {},
			new App.Entity.Facilities.BodyguardJob()
		);
	}


	getControlledAspects(assignment) {
		let controlledAspects = super.getControlledAspects(assignment);
		if (V.dojo > 1) {
			controlledAspects.add(FacilityControlledAspect.LIVING_RULES);
		}
		return controlledAspects;
	}
};

App.Entity.facilities.armory = new App.Entity.Facilities.Armory();
