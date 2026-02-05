/**
 * Runs verification for all InfantState objects in the infant slave pool
 * @param {HTMLDivElement} [div]
 */
App.Verify.infantStates = (div) => {
	for (const [ID, infant] of getInfants(true)) {
		App.Verify.infantState(`getInfant(${ID}, true)`, infant, div);
	}
};

/**
 * Runs verification for a single InfantState object.
 * @param {string} identifier
 * @param {FC.InfantState} actor
 * @param {HTMLDivElement} [div]
 */
App.Verify.infantState = (identifier, actor, div) => {
	const original = _.cloneDeep(actor);
	try {
		App.Patch.Utils.infantState(identifier, actor);
	} catch (e) {
		console.error(e);
		actor = original;
		return;
	}
	// add missing props
	App.Utils.assignMissingDefaults(actor, App.Patch.Utils.infantTemplate(actor));
	// verify
	actor = App.Verify.Utils.verify("infantState", identifier, actor, undefined, div);
	App.Verify.womb(identifier, actor, div); // shouldn't be needed, but why not
};

// ***************************************************************************************************** \\
// *************************** Put your verification functions below this line *************************** \\
// ***************************************************************************************************** \\


/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantAge = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveAge(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantHealth = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveHealth(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantPhysical = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slavePhysical(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantSkin = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveSkin(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantFace = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveFace(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantHair = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveHair(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantBoobs = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveBoobs(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantButt = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveButt(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantGeneticQuirks = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveGeneticQuirks(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantPregnancy = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slavePregnancy(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantBelly = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveBelly(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantGenitalia = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveGenitalia(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantImplants = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveImplants(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantPiercings = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slavePiercings(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantTattoo = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveTattoo(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantCosmetics = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveCosmetics(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantDiet = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveDiet(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantPorn = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slavePorn(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantRelation = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveRelation(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantSkill = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveSkill(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantStat = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveStat(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantPreferences = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slavePreferences(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantRules = (actor) => {
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveRules(actor, "infant slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionInfantState}
 */
App.Verify.I.infantMisc = (actor) => {
	// TODO: verification for growTime, pregData, and targetLocation
	return /** @type {FC.InfantState} */ (App.Verify.I.slaveMisc(actor, "infant slave pool"));
};
