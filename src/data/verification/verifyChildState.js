
/**
 * Runs verification for all ChildState objects in ``
 * TODO:@franklygeorge handle ChildState when it is actually implemented
 * @param {HTMLDivElement} [div]
 */
App.Verify.childStates = (div) => {
};

/**
 * @param {string} identifier
 * @param {FC.ChildState} actor
 * @param {App.Patch.Utils.HumanStateLocation} location
 * @param {HTMLDivElement} [div]
 */
App.Verify.childState = (identifier, actor, location, div) => {
	const original = _.cloneDeep(actor);
	try {
		App.Patch.Utils.childState(identifier, actor, location);
	} catch (e) {
		console.error(e);
		actor = original;
		return;
	}
	// add missing props
	App.Utils.assignMissingDefaults(actor, App.Patch.Utils.childTemplate(actor));
	// verify
	actor = App.Verify.Utils.verify("childState", identifier, actor, location, div);
	App.Verify.womb(identifier, actor, div);
};

// ***************************************************************************************************** \\
// *************************** Put your verification functions below this line *************************** \\
// ***************************************************************************************************** \\

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childAge = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveAge(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childHealth = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveHealth(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childPhysical = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slavePhysical(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childSkin = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveSkin(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childFace = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveFace(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childHair = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveHair(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childBoobs = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveBoobs(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childButt = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveButt(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childGeneticQuirks = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveGeneticQuirks(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childPregnancy = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slavePregnancy(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childBelly = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveBelly(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childGenitalia = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveGenitalia(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childImplants = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveImplants(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childPiercings = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slavePiercings(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childTattoo = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveTattoo(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childCosmetics = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveCosmetics(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childDiet = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveDiet(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childPorn = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slavePorn(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childRelation = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveRelation(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childSkill = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveSkill(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childStat = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveStat(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childPreferences = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slavePreferences(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childRules = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveRules(actor, "unknown"));
};

/**
 * @type {App.Verify.Utils.FunctionChildState}
 */
App.Verify.I.childMisc = (actor) => {
	return /** @type {FC.ChildState} */ (App.Verify.I.slaveMisc(actor, "unknown"));
};
