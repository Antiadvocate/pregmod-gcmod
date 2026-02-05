/** @type {FC.FacilityFramework} */
App.Data.Facilities.arcade = {
	baseName: "arcade",
	genericName: null,
	jobs: {
		assignee: {
			position: "inmate",
			assignment: Job.ARCADE,
			publicSexUse: true,
			fuckdollAccepted: true,
			commonControlledAspects: [
				FacilityControlledAspect.LIVING_RULES,
				FacilityControlledAspect.CLOTHES,
				FacilityControlledAspect.REST
			]
		},
	},
	defaultJob: "assignee",
	manager: null,
	decorated: true,
	penthouseFacility: false
};

App.Entity.Facilities.ArcadeJob = class extends App.Entity.Facilities.FacilitySingleJob {
	/**
	 * Can slave be employed at this position
	 * @param {FC.SlaveState} slave
	 * @returns {string[]}
	 */
	checkRequirements(slave) {
		let r = super.checkRequirements(slave);
		if (slave.indentureRestrictions > 0) {
			r.push(`${slave.slaveName}'s indenture forbids arcade service.`);
		}
		return r;
	}

};

App.Entity.Facilities.Arcade = class extends App.Entity.Facilities.SingleJobFacility {

	constructor() {
		super(
			App.Data.Facilities.arcade,
			{
				assignee: new App.Entity.Facilities.ArcadeJob()
			}
		);
	}

	getControlledAspects(assignment) {
		let controlledAspects = super.getControlledAspects(assignment);
		if (V.arcadeUpgradeHealth > 0) {
			controlledAspects.add(FacilityControlledAspect.CURATIVES);
		}
		if (V.arcadeUpgradeInjectors > 0 && V.arcadeUpgradeInjectors === 2) {
			controlledAspects.add(FacilityControlledAspect.APHRODISIACS);
		}
		return controlledAspects;
	}
};

App.Entity.facilities.arcade = new App.Entity.Facilities.Arcade();
