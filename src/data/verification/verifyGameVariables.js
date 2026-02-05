
/**
 * Runs verification on V, does not do full verification of V.
 * For full verification use App.Verify.everything().
 * @see App.Verify.everything
 * @param {HTMLDivElement} [div]
 */
App.Verify.gameVariables = (div) => {
	if (V.releaseID !== App.Version.release) {
		throw new Error(`V.releaseID (${V.releaseID}) !== App.Version.release (${App.Version.release}). BC must be ran before 'App.Verify.gameVariables()' is called.`);
	}
	// add nonexistant properties to V from `App.Data.defaultGameStateVariables` and `App.Data.resetOnNGPlus`
	App.Utils.assignMissingDefaults(V, App.Data.defaultGameStateVariables, App.Data.resetOnNGPlus);
	// verify
	App.Verify.Utils.verify("gameVariables", "V", undefined, "V", div);
};

// ***************************************************************************************************** \\
// *************************** Put your verification functions below this line *************************** \\
// ***************************************************************************************************** \\

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.genePool = () => {
	const AllHumanIDs = getHumanStates().map((s) => s.ID);
	// remove all unneeded records from the genePool
	for (const [key, record] of Object.entries(_.cloneDeep(V.genePool))) {
		if (key === "-1" || AllHumanIDs.includes(Number(key))) { continue; }
		deleteGenePoolRecord(/** @type {FC.HumanState} */ (record)); // by default deleteGenePoolRecord only deletes records that are no longer needed
	}

	// update all records in the genePool
	/** @type {FC.HumanState[]} */
	const updatedRecords = [];
	for (const [key, record] of Object.entries(_.cloneDeep(V.genePool))) {
		const actor = key === "-1" ? V.PC : getSlave(record.ID) ?? baseSlave();
		// make the record a valid PlayerState or HumanState object
		App.Utils.assignMissingDefaults(record, actor);

		// patch record without verification
		if (key === "-1") {
			App.Patch.Utils.playerState(
				`GenePool record with ID '${record.ID}'`,
				/** @type {FC.PlayerState} */ (record),
				"gene pool",
				undefined, V.releaseID,
			);
		} else {
			App.Patch.Utils.slaveState(
				`GenePool record with ID '${record.ID}'`,
				/** @type {FC.SlaveState} */ (record),
				"gene pool",
				undefined, V.releaseID,
			);
		}
		// force delete old record
		deleteGenePoolRecord(/** @type {FC.HumanState} */ (record), true); // force deletion; by default deleteGenePoolRecord only deletes records that are no longer needed
		// store new record
		updatedRecords.push(/** @type {FC.HumanState} */ (record));
	}

	// update V.genePoolDefaults to ensure it matches any changes in structure
	// @ts-expect-error genePoolDefaults is read only and shouldn't be set normally
	V.genePoolDefaults = new App.Entity.GenePoolRecord(V.genePoolDefaults.seed);

	// add updated records back into the genePool
	updatedRecords.forEach((record) => {
		addToGenePool(record);
	});

	// add any missing records to the genePool
	getHumanStates().forEach((human) => {
		if (!isInGenePool(human)) {
			addToGenePool(human);
		}
	});
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.economy = () => {
	V.AProsperityCap = Math.max(+V.AProsperityCap, 0) ?? 0;
	if (V.economy === 0.5) {
		V.economy = 200;
	} else if (V.economy === 1) {
		V.economy = 100;
	} else if (V.economy === 1.5) {
		V.economy = 67;
	} else {
		V.economy = Math.max(+V.economy, 20) ?? 100;
	}
	V.difficultySwitch = Math.clamp(+V.difficultySwitch, 0, 1) ?? 0;
	V.baseDifficulty = Math.clamp(+V.baseDifficulty, 1, 5) ?? 3;
	V.localEcon = Math.max(+V.localEcon, 20) ?? V.economy;
	V.econRate = Math.clamp(+V.econRate, 1, 4) ?? 2;
	V.slaveCostFactor = Math.max(+V.slaveCostFactor, 0) ?? 1;
	V.menialSupplyFactor = Math.clamp(+V.menialSupplyFactor, -50000, 50000) ?? (1 - V.slaveCostFactor) * 400 * 1000 * 0.5; /* (1 - slaveCostFactor) * price elasticity * base price * 0.5 */
	V.menialDemandFactor = Math.clamp(+V.menialDemandFactor, -50000, 50000) ?? -V.menialSupplyFactor;

	V.slaveCostRandom = Math.clamp(+V.slaveCostRandom, -3, 3) ?? 0;
	V.demandTimer = Math.max(+V.demandTimer, 0) ?? 0;
	V.elapsedDemandTimer = Math.max(+V.elapsedDemandTimer, 0) ?? 0;
	V.supplyTimer = Math.max(+V.supplyTimer, 0) ?? 0;
	V.elapsedSupplyTimer = Math.max(+V.elapsedSupplyTimer, 0) ?? 0;
	V.deltaSupply = Math.clamp(+V.deltaSupply, -6500, 6500) ?? 0;
	V.deltaDemand = Math.clamp(+V.deltaDemand, -6500, 6500) ?? 0;
	V.deltaSupplyOld = Math.clamp(+V.deltaSupply, -6500, 6500) ?? 0;
	V.deltaDemandOld = Math.clamp(+V.deltaDemand, -6500, 6500) ?? 0;
	V.sexSubsidies.lowerClass = Math.clamp(+V.sexSubsidies.lowerClass, 0, 4) ?? 0;
	V.sexSubsidies.middleClass = Math.clamp(+V.sexSubsidies.middleClass, 0, 4) ?? 0;
	V.sexSubsidies.upperClass = Math.clamp(+V.sexSubsidies.upperClass, 0, 4) ?? 0;
	V.sexSubsidies.topClass = Math.clamp(+V.sexSubsidies.topClass, 0, 4) ?? 0;
	V.sexSupplyBarriers.lowerClass = Math.clamp(+V.sexSupplyBarriers.lowerClass, 0, 4) ?? 0;
	V.sexSupplyBarriers.middleClass = Math.clamp(+V.sexSupplyBarriers.middleClass, 0, 4) ?? 0;
	V.sexSupplyBarriers.upperClass = Math.clamp(+V.sexSupplyBarriers.upperClass, 0, 4) ?? 0;
	V.sexSupplyBarriers.topClass = Math.clamp(+V.sexSupplyBarriers.topClass, 0, 4) ?? 0;
	V.NPCSexSupply.lowerClass = Math.max(+V.NPCSexSupply.lowerClass, 500) ?? 3000;
	V.NPCSexSupply.middleClass = Math.max(+V.NPCSexSupply.middleClass, 500) ?? 3000;
	V.NPCSexSupply.upperClass = Math.max(+V.NPCSexSupply.upperClass, 500) ?? 3000;
	V.NPCSexSupply.topClass = Math.max(+V.NPCSexSupply.topClass, 500) ?? 3000;

	V.rentDefaults.lowerClass = Math.max(+V.rentDefaults.lowerClass, 0) ?? 20;
	V.rentDefaults.middleClass = Math.max(+V.rentDefaults.middleClass, 0) ?? 50;
	V.rentDefaults.upperClass = Math.max(+V.rentDefaults.upperClass, 0) ?? 180;
	V.rentDefaults.topClass = Math.max(+V.rentDefaults.topClass, 0) ?? 650;

	V.whoreBudget.lowerClass = Math.max(+V.whoreBudget.lowerClass, 8) ?? (0.8 + (V.rent.lowerClass / V.rentDefaults.lowerClass) / 5) * 7;
	V.whoreBudget.middleClass = Math.max(+V.whoreBudget.middleClass, 40) ?? (0.8 + (V.rent.middleClass / V.rentDefaults.middleClass) / 5) * 40;
	V.whoreBudget.upperClass = Math.max(+V.whoreBudget.upperClass, 200) ?? (0.8 + (V.rent.upperClass / V.rentDefaults.upperClass) / 5) * 200;
	V.whoreBudget.topClass = Math.max(+V.whoreBudget.topClass, 1200) ?? (0.8 + (V.rent.topClass / V.rentDefaults.topClass) / 5) * 1500;

	// fixing potential massive oversupply
	if (V.NPCSexSupply.lowerClass > V.lowerClass * V.whoreBudget.lowerClass) {
		V.NPCSexSupply.lowerClass = V.lowerClass * V.whoreBudget.lowerClass;
	}

	V.NPCMarketShare.lowerClass = Math.clamp(+V.NPCMarketShare.lowerClass, 0, 1000) ?? 0;
	V.NPCMarketShare.middleClass = Math.clamp(+V.NPCMarketShare.middleClass, 0, 1000) ?? 0;
	V.NPCMarketShare.upperClass = Math.clamp(+V.NPCMarketShare.upperClass, 0, 1000) ?? 0;
	V.NPCMarketShare.topClass = Math.clamp(+V.NPCMarketShare.topClass, 0, 1000) ?? 0;
	V.econWeatherDamage = Math.max(+V.econWeatherDamage, 0) ?? 0;
	V.disasterResponse = Math.clamp(+V.disasterResponse, 0, 2) ?? 0;
	V.antiWeatherFreeze = Math.clamp(+V.antiWeatherFreeze, 0, 2) ?? 0;
	V.GDP = Math.max(+V.GDP, 1) ?? 278.6;
	V.NPCSlaves = Math.max(+V.NPCSlaves, 0) ?? 0;
	V.visitors = Math.max(+V.visitors, 0) ?? 0;

	V.LSCBase = Math.max(+V.LSCBase, 0) ?? 800;
	V.rentEffectL = Math.max(+V.rentEffectL, 0) ?? 1;
	V.lowerClass = Math.max(+V.lowerClass, 0) ?? 3120;

	V.MCBase = Math.max(+V.MCBase, 0) ?? 200;
	V.rentEffectM = Math.max(+V.rentEffectM, 0) ?? 1;
	V.middleClass = Math.max(+V.middleClass, 0) ?? 890;

	V.UCBase = Math.max(+V.UCBase, 0) ?? 40;
	V.rentEffectU = Math.max(+V.rentEffectU, 0) ?? 1;
	V.upperClass = Math.max(+V.upperClass, 0) ?? 200;

	V.TCBase = Math.max(+V.TCBase, 0) ?? 20;
	V.rentEffectT = Math.max(+V.rentEffectT, 0) ?? 1;
	V.topClass = Math.max(+V.topClass, 0) ?? 40;
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.arcology = () => {
	V.arcologies[0].ownership = Math.clamp(+V.arcologies[0].ownership, 0, 100) ?? 0;
	V.arcologies[0].minority = Math.clamp(+V.arcologies[0].minority, 0, 100) ?? 0;
	V.arcologies[0].prosperity = Math.clamp(+V.arcologies[0].prosperity, 1, V.AProsperityCap) ?? 1;
	V.arcologies[0].childhoodFertilityInducedNCSResearch = V.arcologies[0].childhoodFertilityInducedNCSResearch ?? 0;
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityNames = () => {
	V.arcologies[0].name = V.arcologies[0].name ?? "Arcology X-4";
	V.brothelName = V.brothelName ?? "the Brothel";
	V.dairyName = V.dairyName ?? "the Dairy";
	V.clubName = V.clubName ?? "the Club";
	V.servantsQuarters.name = V.servantsQuarters.name ?? "the Servants' Quarters";
	V.schoolroomName = V.schoolroomName ?? "the Schoolroom";
	V.spaName = V.spaName ?? "the Spa";
	V.nurseryName = V.nurseryName ?? "the Nursery";
	V.clinicName = V.clinicName ?? "the Clinic";
	V.arcadeName = V.arcadeName ?? "the Arcade";
	V.cellblockName = V.cellblockName ?? "the Cellblock";
	V.masterSuiteName = V.masterSuiteName ?? "the Master Suite";
	V.HGSuiteName = V.HGSuiteName ?? "the Head Girl Suite";
	V.farmyardName = V.farmyardName ?? "the Farmyard";
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityBrothel = () => {
	/* ads */
	V.brothelAdsSpending = Math.clamp(+V.brothelAdsSpending, 0, 5000) ?? 0;
	V.brothelAdsStacked = Math.clamp(+V.brothelAdsStacked, -1, 1) ?? 0;
	V.brothelAdsImplanted = Math.clamp(+V.brothelAdsImplanted, -1, 1) ?? 0;
	V.brothelAdsModded = Math.clamp(+V.brothelAdsModded, -1, 1) ?? 0;
	V.brothelAdsPreg = Math.clamp(+V.brothelAdsPreg, -1, 1) ?? 0;
	V.brothelAdsOld = Math.clamp(+V.brothelAdsOld, -3, 1) ?? 0;
	V.brothelAdsXX = Math.clamp(+V.brothelAdsXX, -1, 1) ?? 0;
	/* upgrades */
	V.brothel = Math.max(+V.brothel, 0) ?? 0;
	V.brothelUpgradeDrugs = Math.clamp(+V.brothelUpgradeDrugs, 0, 2) ?? 0;
	V.brothelBoost.selected = Math.clamp(+V.brothelBoost.selected, 0, 10) ?? 0;
	V.brothelBoost.eligible = Math.clamp(+V.brothelBoost.eligible, 0, 10) ?? 0;
	/* madam */
	V.MadamID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.MADAM);
	V.MadamIgnoresFlaws = Math.clamp(+V.MadamIgnoresFlaws, 0, 1) ?? 0;
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityDairy = () => {
	/* upgrades */
	V.dairy = Math.max(+V.dairy, 0) ?? 0;
	V.dairyFeedersUpgrade = Math.clamp(+V.dairyFeedersUpgrade, 0, 1) ?? 0;
	V.dairyFeedersSetting = Math.clamp(+V.dairyFeedersSetting, 0, 2) ?? 0;
	V.dairyPregUpgrade = Math.clamp(+V.dairyPregUpgrade, 0, 1) ?? 0;
	V.dairyPregSetting = Math.clamp(+V.dairyPregSetting, 0, 3) ?? 0;
	V.dairyStimulatorsUpgrade = Math.clamp(+V.dairyStimulatorsUpgrade, 0, 1) ?? 0;
	V.dairyStimulatorsSetting = Math.clamp(+V.dairyStimulatorsSetting, 0, 2) ?? 0;
	V.dairyRestraintsUpgrade = Math.clamp(+V.dairyRestraintsUpgrade, 0, 1) ?? 0;
	V.dairyRestraintsSetting = Math.clamp(+V.dairyRestraintsSetting, 0, 2) ?? 0;
	V.dairySlimMaintainUpgrade = Math.clamp(+V.dairySlimMaintainUpgrade, 0, 1) ?? 0;
	V.dairySlimMaintain = Math.clamp(+V.dairySlimMaintain, 0, 1) ?? 0;
	V.dairyPrepUpgrade = Math.clamp(+V.dairyPrepUpgrade, 0, 1) ?? 0;
	V.dairyHyperPregRemodel = Math.clamp(+V.dairyHyperPregRemodel, 0, 1) ?? 0;
	V.dairyImplantsSetting = Math.clamp(+V.dairyImplantsSetting, 0, 3) ?? 0;
	V.dairyWeightSetting = Math.clamp(+V.dairyWeightSetting, -1, 4) ?? 0;
	V.dairyHormonesSetting = Math.clamp(+V.dairyHormonesSetting, -1, 2) ?? 0;
	/* bioreactors */
	V.bioreactorsAnnounced = Math.clamp(+V.bioreactorsAnnounced, 0, 1) ?? 0;
	V.createBioreactors = Math.clamp(+V.createBioreactors, 0, 1) ?? 0;
	V.dairyUpgradeMenials = Math.clamp(+V.dairyUpgradeMenials, 0, 1) ?? 0;
	V.bioreactorsHerm = Math.max(+V.bioreactorsHerm, 0) ?? 0;
	V.bioreactorsXX = Math.max(+V.bioreactorsXX, 0) ?? 0;
	V.bioreactorsXY = Math.max(+V.bioreactorsXY, 0) ?? 0;
	V.bioreactorsBarren = Math.max(+V.bioreactorsBarren, 0) ?? 0;
	/* milkmaid */
	V.MilkmaidID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.MILKMAID);
	V.milkmaidImpregnates = Math.clamp(+V.milkmaidImpregnates, 0, 1) ?? 0;
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityFarmyard = () => {
	V.farmyard = Math.max(+V.farmyard, 0) ?? 0;
	V.farmyardBreeding = Math.clamp(+V.farmyardBreeding, 0, 1) ?? 0;
	V.farmyardShows = Math.clamp(+V.farmyardShows, 0, 2) ?? 0;
	/* farmer */
	V.FarmerID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.FARMER);
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityClub = () => {
	/* ads */
	V.clubAdsSpending = Math.clamp(+V.clubAdsSpending, 0, 5000) ?? 0;
	V.clubAdsStacked = Math.clamp(+V.clubAdsStacked, -1, 1) ?? 0;
	V.clubAdsImplanted = Math.clamp(+V.clubAdsImplanted, -1, 1) ?? 0;
	V.clubAdsModded = Math.clamp(+V.clubAdsModded, -1, 1) ?? 0;
	V.clubAdsPreg = Math.clamp(+V.clubAdsPreg, -1, 1) ?? 0;
	V.clubAdsOld = Math.clamp(+V.clubAdsOld, -3, 1) ?? 0;
	V.clubAdsXX = Math.clamp(+V.clubAdsXX, -1, 1) ?? 0;
	/* upgrades */
	V.club = Math.max(+V.club, 0) ?? 0;
	V.clubUpgradePDAs = Math.clamp(+V.clubUpgradePDAs, 0, 1) ?? 0;
	/* madam */
	V.djID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.DJ);
	V.DJignoresFlaws = Math.clamp(+V.DJignoresFlaws, 0, 1) ?? 0;
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityServantsQuarters = () => {
	/* upgrades */
	V.servantsQuarters.capacity = Math.max(+V.servantsQuarters.capacity, 0) ?? 0;
	V.servantsQuarters.upgrades.monitoring = Math.clamp(+V.servantsQuarters.upgrades.monitoring, 0, 1) ?? 0;
	/* stewardess */
	V.StewardessID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.STEWARD);
	V.servantsQuarters.rules.stewardessImpregnates = Math.clamp(+V.servantsQuarters.rules.stewardessImpregnates, 0, 1) ?? 0;
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilitySchoolroom = () => {
	/* upgrades */
	V.schoolroom = Math.max(+V.schoolroom, 0) ?? 0;
	V.schoolroomUpgradeSkills = Math.clamp(+V.schoolroomUpgradeSkills, 0, 1) ?? 0;
	V.schoolroomUpgradeLanguage = Math.clamp(+V.schoolroomUpgradeLanguage, 0, 1) ?? 0;
	V.schoolroomUpgradeRemedial = Math.clamp(+V.schoolroomUpgradeRemedial, 0, 1) ?? 0;
	/* schoolteacher */
	V.SchoolteacherID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.TEACHER);
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilitySpa = () => {
	/* upgrades */
	V.spa = Math.max(+V.spa, 0) ?? 0;
	V.spaUpgrade = Math.clamp(+V.spaUpgrade, 0, 1) ?? 0;
	/* attendant */
	V.AttendantID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.ATTENDANT);
	V.spaFix = Math.clamp(+V.spaFix, 0, 2) ?? 0;
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityClinic = () => {
	/* upgrades */
	V.clinic = Math.max(+V.clinic, 0) ?? 0;
	V.clinicUpgradeScanner = Math.clamp(+V.clinicUpgradeScanner, 0, 1) ?? 0;
	V.clinicUpgradeFilters = Math.clamp(+V.clinicUpgradeFilters, 0, 1) ?? 0;
	V.clinicUpgradePurge = Math.clamp(+V.clinicUpgradePurge, 0, 2) ?? 0;
	V.clinicObservePregnancy = Math.clamp(+V.clinicObservePregnancy, 0, 2) ?? 1;
	V.clinicInflateBelly = Math.clamp(+V.clinicInflateBelly, 0, 1) ?? 0;
	V.clinicSpeedGestation = Math.clamp(+V.clinicSpeedGestation, 0, 1) ?? 0;
	/* nurse */
	V.NurseID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.NURSE);
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityArcade = () => {
	/* upgrades */
	V.arcade = Math.max(+V.arcade, 0) ?? 0;
	V.arcadeUpgradeInjectors = Math.clamp(+V.arcadeUpgradeInjectors, 0, 1) ?? 0;
	V.arcadeUpgradeCollectors = Math.clamp(+V.arcadeUpgradeCollectors, 0, 1.5) ?? 0;
	V.arcadeUpgradeFuckdolls = Math.clamp(+V.arcadeUpgradeFuckdolls, 0, 3) ?? 0;
	V.arcadeUpgradeHealth = Math.clamp(+V.arcadeUpgradeHealth, -1, 2) ?? 0;
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityCellblock = () => {
	/* upgrades */
	V.cellblock = Math.max(+V.cellblock, 0) ?? 0;
	V.cellblockUpgrade = Math.clamp(+V.cellblockUpgrade, 0, 1) ?? 0;
	/* wardeness */
	V.WardenessID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.WARDEN);
	V.cellblockWardenCumsInside = Math.clamp(+V.cellblockWardenCumsInside, 0, 1) ?? 0;
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityMasterSuite = () => {
	/* upgrades */
	V.masterSuite = Math.max(+V.masterSuite, 0) ?? 0;
	V.masterSuiteUpgradeLuxury = Math.clamp(+V.masterSuiteUpgradeLuxury, 0, 2) ?? 0;
	V.masterSuiteUpgradePregnancy = Math.clamp(+V.masterSuiteUpgradePregnancy, 0, 1) ?? 0;
	V.masterSuitePregnancyFertilitySupplements = Math.clamp(+V.masterSuitePregnancyFertilitySupplements, 0, 1) ?? 0;
	V.masterSuitePregnancySlaveLuxuries = Math.clamp(+V.masterSuitePregnancySlaveLuxuries, 0, 1) ?? 0;
	V.masterSuitePregnancyFertilityDrugs = Math.clamp(+V.masterSuitePregnancyFertilityDrugs, 0, 1) ?? 0;
	V.masterSuiteHyperPregnancy = Math.clamp(+V.masterSuiteHyperPregnancy, 0, 1) ?? 0;
	/* concubine */
	V.ConcubineID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.CONCUBINE);
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityHeadGirlSuite = () => {
	/* headgirl */
	V.HeadGirlID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.HEADGIRL);
	V.HGSuiteEquality = Math.clamp(+V.HGSuiteEquality, 0, 1) ?? 0;
	V.HGSuiteSurgery = Math.clamp(+V.HGSuiteSurgery, 0, 1) ?? 0;
	V.HGSuiteDrugs = Math.clamp(+V.HGSuiteDrugs, 0, 1) ?? 0;
	V.HGSuiteAbortion = Math.clamp(+V.HGSuiteAbortion, 0, 1) ?? 0;
	V.HGSuiteHormones = Math.clamp(+V.HGSuiteHormones, 0, 1) ?? 0;
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.facilityNursery = () => {
	/* matron */
	V.MatronID = App.Verify.Utils.findSlaveId(s => s.assignment === Job.MATRON);
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.futureSocieties = () => {
	for (const society of App.Data.FutureSociety.playerFSNames) {
		if (!(V.arcologies[0][society] > 0)) {
			FutureSocieties.remove(society);
		}

		if (society !== "FSNull") {
			const decoName = `${society}Decoration`;
			V.arcologies[0][decoName] = Math.clamp(+V.arcologies[0][decoName], 0, 100) ?? 0;
		}

		// reset any FS policies that are set to some value that you can't pick from the UI
		/** @type {PolicySelectorGroup} */
		const FSPolicies = App.Data.Policies.Selection[society];
		if (FSPolicies) {
			for (const [key, settings] of Object.entries(FSPolicies)) {
				const currentValue = _.get(V, key);
				if (currentValue !== 0) { // assume 0 is a valid setting for all policies
					if (!settings.some(s => currentValue === (("enable" in s) ? s.enable : 1))) {
						_.set(V, key, 0);
						console.log("Reset bad policy value", key, currentValue);
					}
				}
			}
		}
	}
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.arcologies = () => {
	/** validate or reset a diplomatic target
	 * @param {FC.Zeroable<FC.ArcologyDirection>|-1} direction
	 * @returns {FC.Zeroable<FC.ArcologyDirection>|-1}
	 */
	function validTarget(direction) {
		if (!["east", "north", "northeast", "northwest", "south", "southeast", "southwest", "west", 0, -1].includes(direction)) {
			return -1;
		}
		if (!V.arcologies.find(a => a.direction === direction)) {
			return -1;
		}
		return direction;
	}

	for (const arc of V.arcologies) {
		if (typeof arc.government !== 'string') {
			arc.government = "an individual";
		}
		arc.honeymoon = Number(arc.honeymoon) ?? 0;
		arc.prosperity = Number(arc.prosperity) ?? 0;
		arc.ownership = Number(arc.ownership) ?? 0;
		arc.minority = Number(arc.minority) ?? 0;
		arc.PCminority = Number(arc.PCminority) ?? 0;
		arc.demandFactor = Number(arc.demandFactor) ?? 0;

		for (const fs of Object.keys(App.Data.FutureSociety.records)) {
			// @ts-expect-error
			if (arc[fs] === "unset") {
				arc[fs] = null;
			}
		}

		// enforce future society mutual exclusion rules
		for (const group of App.Data.FutureSociety.mutexGroups) {
			for (const fs1 of group) {
				if (arc[fs1] !== null) {
					arc[fs1] = Number(arc[fs1]) ?? null;
				}
				if (arc[fs1] !== null /* check again, may have just changed */) {
					for (const fs2 of group) {
						if (fs1 !== fs2) {
							arc[fs2] = null;
						}
					}
				}
			}
		}
		const raceArray = Array.from(App.Data.misc.filterRaces.keys());
		if (!raceArray.includes(arc.FSSupremacistRace)) {
			if (arc.FSSupremacist !== null) {
				arc.FSSupremacistRace = raceArray.random();
			} else {
				arc.FSSupremacistRace = 0;
			}
		}
		if (!raceArray.includes(arc.FSSubjugationistRace)) {
			if (arc.FSSubjugationist !== null) {
				arc.FSSubjugationistRace = raceArray.random();
			} else {
				arc.FSSubjugationistRace = 0;
			}
		}

		arc.embargo = Math.clamp(+arc.embargo, 1, 3) ?? 1;
		arc.embargoTarget = validTarget(arc.embargoTarget);
		arc.CyberEconomic = Math.clamp(+arc.CyberEconomic, 1, 3) ?? 1;
		arc.CyberEconomicTarget = validTarget(arc.CyberEconomicTarget);
		arc.CyberReputation = Math.clamp(+arc.CyberReputation, 1, 3) ?? 1;
		arc.CyberReputationTarget = validTarget(arc.CyberReputationTarget);
		arc.influenceBonus = Number(arc.influenceBonus) ?? 0;
		arc.influenceTarget = validTarget(arc.influenceTarget);
		arc.rival = Math.clamp(arc.rival, 0, 1) ?? 0;
	}
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.mods = () => {
	App.Mods.SecExp.Obj.Init();
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.pit = () => {
	if (V.pit) {
		if (getSlave(V.pit.slaveFightingBodyguard) === undefined) {
			V.pit.slaveFightingBodyguard = null;
		}
	}
};

/**
 * @type {App.Verify.Utils.FunctionGameVariables}
 */
App.Verify.I.jobIDMap = () => {
	V.JobIDMap = makeJobIdMap();
};
