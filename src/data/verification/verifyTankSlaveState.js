/**
 * Runs verification for all TankSlaveState objects in the tank slave pool
 * @param {HTMLDivElement} [div]
 */
App.Verify.tankSlaveStates = (div) => {
	for (const [ID, tankSlave] of getTankSlaves(true)) {
		App.Verify.tankSlaveState(`getTankSlave(${ID}, true)`, tankSlave, div);
	}
};

/**
 * Runs verification for a single TankSlaveState object.
 * @param {string} identifier
 * @param {FC.TankSlaveState} actor
 * @param {HTMLDivElement} [div]
 */
App.Verify.tankSlaveState = (identifier, actor, div) => {
	const original = _.cloneDeep(actor);
	try {
		App.Patch.Utils.tankSlaveState(identifier, actor);
	} catch (e) {
		console.error(e);
		actor = original;
		return;
	}
	// add missing props
	App.Utils.assignMissingDefaults(
		actor,
		App.Patch.Utils.slaveTemplate(actor),
		App.Entity.TankSlaveState.toTank(App.Patch.Utils.slaveTemplate(actor))
	);
	// verify
	actor = App.Verify.Utils.verify("tankSlaveState", identifier, actor, undefined, div);
	App.Verify.womb(identifier, actor, div); // shouldn't be needed, but why not
};

// ***************************************************************************************************** \\
// *************************** Put your verification functions below this line *************************** \\
// ***************************************************************************************************** \\

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveIncubatorSettings = (actor) => {
	/*
	TODO:@franklygeorge verification for:
		actor.incubatorSettings.imprint
		actor.incubatorSettings.weight
		actor.incubatorSettings.muscles
		actor.incubatorSettings.growthStims
		actor.incubatorSettings.reproduction
		actor.incubatorSettings.growTime
		actor.incubatorSettings.pregAdaptation
		actor.incubatorSettings.pregAdaptationPower
		actor.incubatorSettings.pregAdaptationInWeek
	While your at it these values could use defined types

	*/
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveAge = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveAge(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveHealth = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveHealth(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlavePhysical = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slavePhysical(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveSkin = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveSkin(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveFace = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveFace(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveHair = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveHair(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveBoobs = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveBoobs(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveButt = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveButt(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveGeneticQuirks = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveGeneticQuirks(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlavePregnancy = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slavePregnancy(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveBelly = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveBelly(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveGenitalia = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveGenitalia(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveImplants = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveImplants(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlavePiercings = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slavePiercings(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveTattoo = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveTattoo(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveCosmetics = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveCosmetics(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveDiet = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveDiet(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlavePorn = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slavePorn(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveRelation = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveRelation(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveSkill = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveSkill(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveStat = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveStat(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlavePreferences = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slavePreferences(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveRules = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveRules(actor, "tank slave pool"));
};

/**
 * @type {App.Verify.Utils.FunctionTankSlaveState}
 */
App.Verify.I.tankSlaveMisc = (actor) => {
	return /** @type {FC.TankSlaveState} */ (App.Verify.I.slaveMisc(actor, "tank slave pool"));
};
