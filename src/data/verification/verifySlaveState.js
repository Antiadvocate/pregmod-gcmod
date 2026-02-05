

/**
 * Runs verification for all SlaveState objects
 * @see App.Verify.Utils.getAllSlaves
 * @param {HTMLDivElement} [div]
 */
App.Verify.slaveStates = (div) => {
	let i;
	const slaves = getSlaves(true);
	for (i in slaves) {
		App.Verify.slaveState(`getSlaveStates(true)[${i}]`, slaves[i], "main slave pool", div);
	}
};

/**
 * @param {string} identifier
 * @param {FC.SlaveState} actor
 * @param {App.Patch.Utils.HumanStateLocation} location
 * @param {HTMLDivElement} [div]
 */
App.Verify.slaveState = (identifier, actor, location, div) => {
	const original = _.cloneDeep(actor);
	try {
		App.Patch.Utils.slaveState(identifier, actor, location);
	} catch (e) {
		console.error(e);
		actor = original;
		return;
	}
	// add missing props
	App.Utils.assignMissingDefaults(actor, App.Patch.Utils.slaveTemplate(actor));
	// verify
	actor = App.Verify.Utils.verify("slaveState", identifier, actor, location, div);
	App.Verify.womb(identifier, actor, div);
};

// ***************************************************************************************************** \\
// *************************** Put your verification functions below this line *************************** \\
// ***************************************************************************************************** \\

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveAge = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanAge(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveHealth = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanHealth(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slavePhysical = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanPhysical(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveSkin = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanSkin(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveFace = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanFace(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveHair = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanHair(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveBoobs = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanBoobs(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveButt = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanButt(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveGeneticQuirks = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanGeneticQuirks(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slavePregnancy = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanPregnancy(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveBelly = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanBelly(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveGenitalia = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanGenitalia(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveImplants = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanImplants(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slavePiercings = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanPiercings(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveTattoo = (actor, location) => {
	return /** @type {FC.SlaveState} */ (App.Verify.I.humanTattoo(actor, location));
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveCosmetics = (actor, location) => {
	actor.choosesOwnClothes = Math.clamp(+actor.choosesOwnClothes, 0, 1) ?? 0;
	actor = /** @type {FC.SlaveState} */ (App.Verify.I.humanCosmetics(actor, location));
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveDiet = (actor, location) => {
	actor.dietCum = /** @type {FC.dietCumType} */ (Math.clamp(+actor.dietCum, 0, 2) ?? 0);
	actor.dietMilk = /** @type {FC.dietMilkType} */ (Math.clamp(+actor.dietMilk, 0, 2) ?? 0);
	actor.onDiet = Math.clamp(+actor.onDiet, 0, 1) ?? 0;
	// @ts-ignore this comparison is intentional
	if (actor.drugs === "none") {
		actor.drugs = "no drugs";
	}
	actor = /** @type {FC.SlaveState} */ (App.Verify.I.humanDiet(actor, location));
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slavePorn = (actor, location) => {
	actor.porn.feed = Math.clamp(+actor.porn.feed, 0, 1) ?? 0;
	actor.porn.viewerCount = Math.max(+actor.porn.viewerCount, 0) ?? 0;
	actor.porn.spending = Math.clamp(+actor.porn.spending, 0, 5000) ?? 0;
	actor.porn.prestige = Math.clamp(+actor.porn.prestige, 0, 3) ?? 0;
	if (actor.porn.fameType === "none") {
		actor.porn.prestige = 0;
		actor.porn.prestigeDesc = 0;
	}
	for (const genre of App.Porn.getAllGenres()) {
		actor.porn.fame[genre.fameVar] = Math.max(+actor.porn.fame[genre.fameVar], 0) ?? 0;
	}
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveRelation = (actor, location) => {
	actor.mother = +actor.mother ?? 0;
	actor.father = +actor.father ?? 0;
	actor.canRecruit = Math.clamp(+actor.canRecruit, 0, 1) ?? 0;

	actor.relationship = /** @type {FC.RelationShipKind} */ (Math.clamp(+actor.relationship, -3, 5) ?? 0);
	actor.relationshipTarget = Math.max(+actor.relationshipTarget, 0) ?? 0;

	actor.rivalryTarget = Math.max(+actor.rivalryTarget, 0) ?? 0;
	actor.rivalry = /** @type {FC.RivalryType} */ (Math.clamp(+actor.rivalry, 0, 3) ?? 0);

	actor.cloneID = +actor.cloneID ?? 0;

	if (location === "gene pool") { return actor; }

	if (actor.relationship > 0) {
		if (!getSlave(actor.relationshipTarget)) {
			actor.relationship = 0;
			actor.relationshipTarget = 0;
		}
	}

	if (actor.rivalry !== 0) {
		if (!getSlave(actor.rivalryTarget)) {
			actor.rivalry = 0;
			actor.rivalryTarget = 0;
		}
	}

	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveSkill = (actor, location) => {
	actor.skill.oral = Math.clamp(+actor.skill.oral, 0, 100) ?? 0;
	actor.skill.vaginal = Math.clamp(+actor.skill.vaginal, 0, 100) ?? 0;
	actor.skill.penetrative = Math.clamp(+actor.skill.penetrative, 0, 100) ?? 0;
	actor.skill.anal = Math.clamp(+actor.skill.anal, 0, 100) ?? 0;
	actor.skill.whoring = Math.clamp(+actor.skill.whoring, 0, 100) ?? 0;
	actor.skill.entertainment = Math.clamp(+actor.skill.entertainment, 0, 100) ?? 0;
	actor.skill.combat = Math.clamp(+actor.skill.combat, 0, 100) ?? 0;
	actor.skill.headGirl = Math.clamp(+actor.skill.headGirl, 0, 200) ?? 0;
	actor.skill.recruiter = Math.clamp(+actor.skill.recruiter, 0, 200) ?? 0;
	actor.skill.bodyguard = Math.clamp(+actor.skill.bodyguard, 0, 200) ?? 0;
	actor.skill.madam = Math.clamp(+actor.skill.madam, 0, 200) ?? 0;
	actor.skill.DJ = Math.clamp(+actor.skill.DJ, 0, 200) ?? 0;
	actor.skill.nurse = Math.clamp(+actor.skill.nurse, 0, 200) ?? 0;
	actor.skill.teacher = Math.clamp(+actor.skill.teacher, 0, 200) ?? 0;
	actor.skill.attendant = Math.clamp(+actor.skill.attendant, 0, 200) ?? 0;
	actor.skill.matron = Math.clamp(+actor.skill.matron, 0, 200) ?? 0;
	actor.skill.stewardess = Math.clamp(+actor.skill.stewardess, 0, 200) ?? 0;
	actor.skill.milkmaid = Math.clamp(+actor.skill.milkmaid, 0, 200) ?? 0;
	actor.skill.farmer = Math.clamp(+actor.skill.farmer, 0, 200) ?? 0;
	actor.skill.wardeness = Math.clamp(+actor.skill.wardeness, 0, 200) ?? 0;
	actor.skill.servant = Math.clamp(+actor.skill.servant, 0, 200) ?? 0;
	actor.skill.entertainer = Math.clamp(+actor.skill.entertainer, 0, 200) ?? 0;
	actor.skill.whore = Math.clamp(+actor.skill.whore, 0, 200) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveStat = (actor, location) => {
	actor.counter.oral = Math.max(+actor.counter.oral, 0) ?? 0;
	actor.counter.vaginal = Math.max(+actor.counter.vaginal, 0) ?? 0;
	actor.counter.anal = Math.max(+actor.counter.anal, 0) ?? 0;
	actor.counter.publicUse = Math.max(+actor.counter.publicUse, 0) ?? 0;
	actor.counter.mammary = Math.max(+actor.counter.mammary, 0) ?? 0;
	actor.counter.penetrative = Math.max(+actor.counter.penetrative, 0) ?? 0;
	actor.counter.pitKills = Math.max(+actor.counter.pitKills, 0) ?? 0;
	actor.counter.pitWins = Math.max(+actor.counter.pitWins, 0) ?? 0;
	actor.counter.pitLosses = Math.max(+actor.counter.pitLosses, 0) ?? 0;
	actor.counter.milk = Math.max(+actor.counter.milk, 0) ?? 0;
	actor.counter.cum = Math.max(+actor.counter.cum, 0) ?? 0;
	actor.counter.births = Math.max(+actor.counter.births, 0) ?? 0;
	actor.counter.birthsTotal = Math.max(+actor.counter.birthsTotal, 0) ?? actor.counter.births;
	actor.counter.abortions = Math.max(+actor.counter.abortions, 0) ?? 0;
	actor.counter.miscarriages = Math.max(+actor.counter.miscarriages, 0) ?? 0;
	actor.counter.laborCount = Math.max(+actor.counter.laborCount, 0) ?? actor.counter.birthsTotal;
	actor.counter.slavesFathered = Math.max(+actor.counter.slavesFathered, 0) ?? 0;
	actor.counter.PCChildrenFathered = Math.max(+actor.counter.PCChildrenFathered, 0) ?? 0;
	actor.counter.slavesKnockedUp = Math.max(+actor.counter.slavesKnockedUp, 0) ?? 0;
	actor.counter.PCKnockedUp = Math.max(+actor.counter.PCKnockedUp, 0) ?? 0;
	actor.counter.bestiality = Math.max(+actor.counter.bestiality, 0) ?? 0;
	actor.counter.PCChildrenBeared = Math.max(+actor.counter.PCChildrenBeared, 0) ?? 0;
	actor.counter.timesBred = Math.max(+actor.counter.timesBred, 0) ?? 0;
	actor.counter.reHymen = Math.max(+actor.counter.reHymen, 0) ?? 0;
	actor.counter.events = Math.max(+actor.counter.events, 0) ?? 0;
	actor.bodySwap = Math.max(+actor.bodySwap, 0) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slavePreferences = (actor, location) => {
	actor.energy = Math.clamp(+actor.energy, 0, 100) ?? 0;
	actor.need = Math.max(+actor.need, 0) ?? 0;
	actor.attrXY = Math.clamp(+actor.attrXY, 0, 100) ?? 0;
	actor.attrXX = Math.clamp(+actor.attrXX, 0, 100) ?? 0;
	actor.attrKnown = Math.clamp(+actor.attrKnown, 0, 1) ?? 0;
	actor.fetishStrength = Math.clamp(+actor.fetishStrength, 0, 100) ?? 0;
	actor.fetishKnown = Math.clamp(+actor.fetishKnown, 0, 1) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveRules = (actor, location) => {
	if (actor.useRulesAssistant !== 0) {
		actor.useRulesAssistant = 1;
	}
	actor.choosesOwnAssignment = Math.clamp(+actor.choosesOwnAssignment, 0, 1) ?? 0;
	actor.PCExclude = Math.clamp(+actor.PCExclude, 0, 1) ?? 0;
	actor.HGExclude = Math.clamp(+actor.HGExclude, 0, 1) ?? 0;
	actor.StudExclude = Math.clamp(+actor.StudExclude, 0, 1) ?? 0;
	actor.choosesOwnChastity = Math.clamp(+actor.choosesOwnChastity, 0, 1) ?? 0;
	actor.breedingMark = Math.clamp(+actor.breedingMark, 0, 1) ?? 0;
	actor.rudeTitle = Math.clamp(+actor.rudeTitle, 0, 1) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionSlaveState}
 */
App.Verify.I.slaveMisc = (actor, location) => {
	actor.career = actor.career ?? "a slave";
	actor.origin = actor.origin ?? "";
	actor.weekAcquired = +actor.weekAcquired ?? 0;
	actor.newGamePlus = Math.clamp(+actor.newGamePlus, 0, 1) ?? 0;
	actor.oldDevotion = Math.clamp(+actor.oldDevotion, -100, 100) ?? 0;
	actor.trust = Math.clamp(+actor.trust, -100, 100) ?? 0;
	actor.oldTrust = Math.clamp(+actor.oldTrust, -100, 100) ?? 0;
	actor.fuckdoll = Math.clamp(+actor.fuckdoll, 0, 100) ?? 0;
	actor.subTarget = Math.max(+actor.subTarget, -1) ?? 0;
	actor.sentence = Math.max(+actor.sentence, 0) ?? 0;
	actor.indenture = Math.max(+actor.indenture, -1) ?? -1;
	actor.indentureRestrictions = /** @type {FC.IndentureType} */ (Math.clamp(+actor.indentureRestrictions, 0, 2) ?? 0);
	actor.slaveCost = Math.min(+actor.slaveCost, 1) ?? 1;
	actor.lifetimeCashExpenses = Math.min(+actor.lifetimeCashExpenses, 0) ?? 0;
	actor.lifetimeCashIncome = Math.max(+actor.lifetimeCashIncome, 0) ?? 0;
	actor.lastWeeksCashIncome = Math.max(+actor.lastWeeksCashIncome, 0) ?? 0;
	actor.lifetimeRepExpenses = Math.min(+actor.lifetimeRepExpenses, 0) ?? 0;
	actor.lifetimeRepIncome = Math.max(+actor.lifetimeRepIncome, 0) ?? 0;
	actor.lastWeeksRepExpenses = Math.min(+actor.lastWeeksRepExpenses, 0) ?? 0;
	actor.lastWeeksRepIncome = Math.max(+actor.lastWeeksRepIncome, 0) ?? 0;
	actor.sexAmount = Math.max(+actor.sexAmount, 0) ?? 0;
	actor.sexQuality = Math.max(+actor.sexQuality, 0) ?? 0;
	actor.whoreClass = Math.max(+actor.whoreClass, 0) ?? 0;
	if (!Object.values(Job).includes(actor.assignment)) {
		actor.assignment = Job.REST;
		App.Verify.I.jobIDMap();
	}
	actor = /** @type {FC.SlaveState} */ (App.Verify.I.humanMisc(actor, location));
	return actor;
};
