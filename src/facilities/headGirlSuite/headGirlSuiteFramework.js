/** @type {FC.FacilityFramework} */
App.Data.Facilities.headGirlSuite = {
	baseName: "HGSuite",
	genericName: null,
	jobs: {
		HGToy: {
			position: "Head Girl's toy",
			assignment: Job.HEADGIRLSUITE,
			publicSexUse: true,
			fuckdollAccepted: false,
			commonControlledAspects: [
				FacilityControlledAspect.LIVING_RULES,
				FacilityControlledAspect.REST,
				FacilityControlledAspect.DIET,
				FacilityControlledAspect.CLOTHES,
				FacilityControlledAspect.CURATIVES
			]
		}
	},
	defaultJob: "HGToy",
	manager: {
		position: "Head Girl",
		assignment: Job.HEADGIRL,
		careers: App.Data.Careers.Leader.HG,
		skill: "headGirl",
		publicSexUse: false,
		fuckdollAccepted: false,
		broodmotherAccepted: false,
		shouldWalk: true,
		shouldHold: true,
		shouldSee: true,
		shouldHear: true,
		shouldTalk: true,
		shouldThink: true,
		requiredDevotion: 51,
		commonControlledAspects: [
			FacilityControlledAspect.REST
		]
	},
	decorated: false,
	penthouseFacility: true
};

App.Entity.Facilities.HeadGirlSuite = class extends App.Entity.Facilities.SingleJobFacility {
	constructor() {
		super(App.Data.Facilities.headGirlSuite);
	}

	/** @override */
	occupancyReport(long) {
		return this.manager.currentEmployee
			? `HG${this.hostedSlaves() ? long
				? ` and ${getPronouns(this.manager.currentEmployee).his} slave`
				: ", 1" : ""}`
			: "";
	}


	/** @override */
	getControlledAspects(assignment) {
		return this._getControlledAspectsByHeadGirl(assignment, S.HeadGirl);
	}

	/**
	 * @private
	 * @param {FC.Assignment} assignment
	 * @param {FC.SlaveState} headGirl
	 * @returns {Set<FC.Facilities.FacilityControlledAspect>}
	 */
	_getControlledAspectsByHeadGirl(assignment, headGirl) {
		const controlledAspects = super.getControlledAspects(assignment);
		if (assignment === this.desc.manager.assignment) {
			if (V.HGSuite === 1) {
				controlledAspects.add(FacilityControlledAspect.LIVING_RULES);
			}
		} else {
			if (V.HGSuiteHormones !== 0) {
				controlledAspects.add(FacilityControlledAspect.HORMONES);
			}
			if (V.HGSuiteDrugs !== 0) {
				controlledAspects.add(FacilityControlledAspect.DRUGS);
			}
			const arcology = V.arcologies[0];
			if (V.HGSuiteSurgery !== 0) {
				if (!FutureSocieties.isActive('FSBodyPurist', arcology)) {
					controlledAspects
						.add(FacilityControlledAspect.SURGERY_FACE_SHAPE)
						.add(FacilityControlledAspect.SURGERY_BOOBS_IMPLANTS)
						.add(FacilityControlledAspect.SURGERY_BUTT_IMPLANTS)
						.add(FacilityControlledAspect.SURGERY_LIPS_IMPLANTS);

					if (FutureSocieties.isActive("FSRepopulationFocus")) {
						controlledAspects
							.add(FacilityControlledAspect.SURGERY_HIPS)
							.add(FacilityControlledAspect.SURGERY_LACTATION_IMPLANTS);
					} else if (FutureSocieties.isActive("FSDegradationist")
						|| FutureSocieties.isActive("FSAssetExpansionist")
						|| FutureSocieties.isActive("FSTransformationFetishist")) {
						controlledAspects.add(FacilityControlledAspect.SURGERY_HOLES_VIRGINITY);
					}
				}

				if (headGirl.fetish === Fetish.DOM || headGirl.energy > 95) {
					controlledAspects.add(FacilityControlledAspect.SURGERY_TENDONS);
				} else if (headGirl.fetish === Fetish.MASOCHIST || headGirl.fetish === Fetish.SUBMISSIVE) {
					controlledAspects.add(FacilityControlledAspect.SURGERY_HEIGHT);
				}
			}
		}
		return controlledAspects;
	}
};

App.Entity.facilities.headGirlSuite = new App.Entity.Facilities.HeadGirlSuite();
