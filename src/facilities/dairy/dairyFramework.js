/** @type {FC.FacilityFramework} */
App.Data.Facilities.dairy = {
	baseName: "dairy",
	genericName: null,
	jobs: {
		cow: {
			position: "cow",
			assignment: Job.DAIRY,
			publicSexUse: false,
			fuckdollAccepted: false,
			commonControlledAspects: [
				FacilityControlledAspect.LIVING_RULES
			]
		}
	},
	defaultJob: "cow",
	manager: {
		position: "milkmaid",
		assignment: Job.MILKMAID,
		careers: App.Data.Careers.Leader.milkmaid,
		skill: "milkmaid",
		publicSexUse: false,
		fuckdollAccepted: false,
		broodmotherAccepted: false,
		shouldWalk: true,
		shouldHold: true,
		shouldSee: true,
		shouldHear: true,
		shouldTalk: false,
		shouldThink: true,
		requiredDevotion: 21,
		commonControlledAspects: [
			FacilityControlledAspect.LIVING_RULES,
			FacilityControlledAspect.SURGERY_VASECTOMY
		]
	},
	decorated: true,
	penthouseFacility: false
};

App.Entity.Facilities.DairyCowJob = class extends App.Entity.Facilities.FacilitySingleJob {
	/**
	 * @override
	 * @returns {string}
	 */
	get assignment() {
		return `be milked in ${this.facility.name}`;
	}

	/**
	 * @param {FC.SlaveState} slave
	 * @returns {string[]}
	 */
	checkRequirements(slave) {
		let r = super.checkRequirements(slave);

		if ((slave.indentureRestrictions > 0) && (V.dairyRestraintsSetting > 1)) {
			r.push(`${slave.slaveName}'s indenture forbids extractive Dairy service.`);
		}
		if ((slave.indentureRestrictions > 1) && (V.dairyRestraintsSetting > 0)) {
			r.push(`${slave.slaveName}'s indenture allows only free range milking.`);
		}
		if (slave.breedingMark === 1 && V.propOutcome === 1 && V.eugenicsFullControl !== 1 && FutureSocieties.isActive('FSRestart') && V.dairyRestraintsSetting > 0) {
			r.push(`${slave.slaveName} may only be a free range cow.`);
		}
		if ((V.dairyPregSetting > 0) && ((slave.bellyImplant !== -1) || (slave.broodmother !== 0))) {
			r.push(`${slave.slaveName}'s womb cannot accommodate current machine settings.`);
		}

		if (!isAmputee(slave) && (this.facility.option("RestraintsUpgrade") !== 1) &&
			!App.Entity.Facilities.Job._isBrokenEnough(slave, 20, -50, -20, -50)) {
			r.push(`${slave.slaveName} must be obedient in order to be milked at ${this.facility.name}.`);
		}

		const cumMilkingBlocked = App.Facilities.Dairy.cumMilkingBlocked(slave);
		if ((slave.lactation === 0) && (slave.balls === 0 || cumMilkingBlocked)) {
			// the slave does not produce useful liquids now or their cum is inaccessible. Let's find out can the dairy make it lactate
			if (!App.Facilities.Dairy.forcedLacation()) {
				// dairy settings disallow any procedures
				r.push(`${slave.slaveName} is not lactating ` + ((V.seeDicks > 0 && slave.balls === 0) ? 'or producing semen ' : '') + `and ${this.facility.name}'s current settings forbid the automatic implantation of lactation inducing drugs or manual stimulation to induce it, and thus cannot be a cow.`);
			} else if (slave.boobs <= 300) {
				r.push(`${slave.slaveName} is not lactating ` + ((V.seeDicks > 0 && slave.balls === 0) ? 'or producing semen ' : '') + 'and does have not enough breast tissue to induce lactation.');
			}
			const {his} = getPronouns(slave);
			// Only check for free-range, industrial will strip everything.
			if (V.dairyRestraintsSetting < 2) {
				if (cumMilkingBlocked) {
					if (slave.dick > 0) {
						r.push(`${slave.slaveName}'s ${dickDesc(slave, true)} is blocked by a chastity cage and cannot be properly milked`);
					} else {
						r.push(`${slave.slaveName} lacks access to ${his} ${anusDesc(slave, true)} in order to properly milk ${his} dickless balls.`);
					}
				}
			}
		}
		if ((V.dairyStimulatorsSetting >= 2) && (slave.anus <= 2) && (V.dairyPrepUpgrade !== 1)) {
			r.push(`${slave.slaveName}'s anus cannot accommodate current machine settings.`);
		}
		if ((V.dairyPregSetting >= 2) && (slave.vagina <= 2) && (slave.ovaries !== 0) && (V.dairyPrepUpgrade !== 1)) {
			r.push(`${slave.slaveName}'s vagina cannot accommodate current machine settings.`);
		}

		return r;
	}
};

App.Entity.Facilities.Dairy = class extends App.Entity.Facilities.SingleJobFacility {

	constructor() {
		super(App.Data.Facilities.dairy,
			{
				cow: new App.Entity.Facilities.DairyCowJob()
			});
	}

	/** @override */
	get nonEmployeeOccupantsCount() {
		return V.bioreactorsXY + V.bioreactorsXX + V.bioreactorsHerm + V.bioreactorsBarren;
	}

	/** @override */
	getControlledAspects(assignment) {
		let controlledAspects = super.getControlledAspects(assignment);
		if (assignment === Job.DAIRY) {
			if (V.dairyImplantsSetting === 0) {
				controlledAspects.add(FacilityControlledAspect.SURGERY_PROSTATE_IMPLANT);
			}
			if (V.dairyImplantsSetting <= 1) {
				controlledAspects.add(FacilityControlledAspect.SURGERY_LACTATION_IMPLANTS);
			}
			if (V.dairyImplantsSetting !== 2) {
				controlledAspects.add(FacilityControlledAspect.LACTATION);
			}
			if (V.dairyHormonesSetting >= 0) {
				controlledAspects.add(FacilityControlledAspect.HORMONES);
			}
			if (V.dairyWeightSetting >= 0) {
				controlledAspects.add(FacilityControlledAspect.DIET);
			}
			if (V.dairyPregSetting > 0) {
				controlledAspects.add(FacilityControlledAspect.CONTRACEPTIVES);
			}
			if (V.dairyRestraintsSetting > 1) {
				controlledAspects
					.add(FacilityControlledAspect.CLOTHES)
					.add(FacilityControlledAspect.COLLAR)
					.add(FacilityControlledAspect.FACE_ACCESSORY)
					.add(FacilityControlledAspect.MOUTH_ACCESSORY)
					.add(FacilityControlledAspect.VAGINAL_ACCESSORY)
					.add(FacilityControlledAspect.VAGINAL_ATTACHMENT)
					.add(FacilityControlledAspect.DICK_ACCESSORY)
					.add(FacilityControlledAspect.BUTTPLUG)
					.add(FacilityControlledAspect.CHASTITY)
					.add(FacilityControlledAspect.REST);
			}
		}
		return controlledAspects;
	}
};

App.Entity.facilities.dairy = new App.Entity.Facilities.Dairy();
