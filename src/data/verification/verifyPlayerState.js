
/**
 * Runs verification of the provided PlayerState object (Usually V.PC)
 * @param {FC.PlayerState} actor
 * @param {string} [identifier="PC"]
 * @param {HTMLDivElement} [div]
 * @param {App.Patch.Utils.HumanStateLocation} [location]
 */
App.Verify.playerState = (actor, identifier="PC", div, location="PC") => {
	const original = _.cloneDeep(actor);
	try {
		App.Patch.Utils.playerState(identifier, actor, location);
	} catch (e) {
		console.error(e);
		actor = original;
		return;
	}
	// add missing props
	App.Utils.assignMissingDefaults(actor, basePlayer());
	// verify
	actor = App.Verify.Utils.verify("playerState", identifier, actor, location, div);
	App.Verify.womb(identifier, actor, div);
};

// ***************************************************************************************************** \\
// *************************** Put your verification functions below this line *************************** \\
// ***************************************************************************************************** \\


/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerAge = (actor) => {
	return /** @type {FC.PlayerState} */ (App.Verify.I.humanAge(actor, "PC"));
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerHealth = (actor) => {
	actor.majorInjury = Math.max(+actor.majorInjury, 0) ?? 0;
	actor = /** @type {FC.PlayerState} */ (App.Verify.I.humanHealth(actor, "PC"));
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerPhysical = (actor) => {
	actor.title = Math.clamp(+actor.title, 0, 1) ?? 1;
	actor = /** @type {FC.PlayerState} */ (App.Verify.I.humanPhysical(actor, "PC"));
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerSkin = (actor) => {
	return /** @type {FC.PlayerState} */ (App.Verify.I.humanSkin(actor, "PC"));
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerFace = (actor) => {
	actor = /** @type {FC.PlayerState} */ (App.Verify.I.humanFace(actor, "PC"));
	actor.face = 100; // force actor face to 100 for V.PC
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerHair = (actor) => {
	return /** @type {FC.PlayerState} */ (App.Verify.I.humanHair(actor, "PC"));
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerBoobs = (actor) => {
	return /** @type {FC.PlayerState} */ (App.Verify.I.humanBoobs(actor, "PC"));
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerButt = (actor) => {
	return /** @type {FC.PlayerState} */ (App.Verify.I.humanButt(actor, "PC"));
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerGeneticQuirks = (actor) => {
	return /** @type {FC.PlayerState} */ (App.Verify.I.humanGeneticQuirks(actor, "PC"));
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerPregnancy = (actor) => {
	actor.forcedFertDrugs = Math.max(+actor.forcedFertDrugs, 0) || 0;
	actor = /** @type {FC.PlayerState} */ (App.Verify.I.humanPregnancy(actor, "PC"));
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerBelly = (actor) => {
	return /** @type {FC.PlayerState} */ (App.Verify.I.humanBelly(actor, "PC"));
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerGenitalia = (actor) => {
	actor.newVag = Math.clamp(+actor.newVag, 0, 1) || 0;
	actor = /** @type {FC.PlayerState} */ (App.Verify.I.humanGenitalia(actor, "PC"));
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerImplants = (actor) => {
	return /** @type {FC.PlayerState} */ (App.Verify.I.humanImplants(actor, "PC"));
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerPiercings = (actor) => {
	return /** @type {FC.PlayerState} */ (App.Verify.I.humanPiercings(actor, "PC"));
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerTattoo = (actor) => {
	return /** @type {FC.PlayerState} */ (App.Verify.I.humanTattoo(actor, "PC"));
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerCosmetics = (actor) => {
	return /** @type {FC.PlayerState} */ (App.Verify.I.humanCosmetics(actor, "PC"));
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerDiet = (actor) => {
	actor.refreshmentType = Math.clamp(+actor.refreshmentType, 0, 6) || 0;
	// @ts-ignore this comparison is intentional
	if (actor.drugs === "none") {
		actor.drugs = "no drugs";
	}
	actor = /** @type {FC.PlayerState} */ (App.Verify.I.humanDiet(actor, "PC"));
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerRelation = (actor) => {
	actor.mother = +actor.mother ?? 0;
	actor.father = +actor.father ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerSkill = (actor) => {
	actor.skill.oral = Math.clamp(+actor.skill.oral, 0, 100) ?? 0;
	actor.skill.vaginal = Math.clamp(+actor.skill.vaginal, 0, 100) ?? 0;
	actor.skill.penetrative = Math.clamp(+actor.skill.penetrative, 0, 100) ?? 0;
	actor.skill.anal = Math.clamp(+actor.skill.anal, 0, 100) ?? 0;
	actor.skill.combat = Math.clamp(+actor.skill.combat, 0, 100) ?? 0;

	actor.skill.trading = Math.clamp(+actor.skill.trading, -100, 100) || 0;
	actor.skill.warfare = Math.clamp(+actor.skill.warfare, -100, 100) || 0;
	actor.skill.slaving = Math.clamp(+actor.skill.slaving, -100, 100) || 0;
	actor.skill.engineering = Math.clamp(+actor.skill.engineering, -100, 100) || 0;
	actor.skill.medicine = Math.clamp(+actor.skill.medicine, -100, 100) || 0;
	actor.skill.hacking = Math.clamp(+actor.skill.hacking, -100, 100) || 0;
	actor.skill.combat = Math.clamp(+actor.skill.combat, 0, 100) || 0;
	actor.skill.fighting = Math.clamp(+actor.skill.fighting, -1000, 1000) || 0;
	actor.skill.cumTap = Math.max(+actor.skill.cumTap, 0) || 0;

	// we really aren't supposed to be editing `V` directly from `App.Verify.Utils.FunctionPlayerState` functions
	// but this does need to be handled whenever the player's skills change
	if (V.arcologies && V.arcologies.length !== 0) { // if verification is called before arcologies are intialized we don't want to error out
		V.upgradeMultiplierArcology = upgradeMultiplier('engineering');
		V.upgradeMultiplierMedicine = upgradeMultiplier('medicine');
		V.upgradeMultiplierTrade = upgradeMultiplier('trading');
		V.HackingSkillMultiplier = upgradeMultiplier('hacking');
	}
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerStat = (actor) => {
	actor.counter.oral = Math.max(+actor.counter.oral, 0) ?? 0;
	actor.counter.vaginal = Math.max(+actor.counter.vaginal, 0) ?? 0;
	actor.counter.anal = Math.max(+actor.counter.anal, 0) ?? 0;
	actor.counter.mammary = Math.max(+actor.counter.mammary, 0) ?? 0;
	actor.counter.penetrative = Math.max(+actor.counter.penetrative, 0) ?? 0;
	actor.counter.pitWins = Math.max(+actor.counter.pitWins, 0) ?? 0;
	actor.counter.pitLosses = Math.max(+actor.counter.pitLosses, 0) ?? 0;
	actor.counter.milk = Math.max(+actor.counter.milk, 0) ?? 0;
	actor.counter.cum = Math.max(+actor.counter.cum, 0) ?? 0;
	actor.counter.birthsTotal = Math.max(+actor.counter.birthsTotal, 0) ?? 0;
	actor.counter.birthElite = Math.max(+actor.counter.birthElite, 0) || 0;
	actor.counter.birthMaster = Math.max(+actor.counter.birthMaster, 0) || 0;
	actor.counter.birthDegenerate = Math.max(+actor.counter.birthDegenerate, 0) || 0;
	actor.counter.birthClient = Math.max(+actor.counter.birthClient, 0) || 0;
	actor.counter.birthOther = Math.max(+actor.counter.birthOther, 0) || 0;
	actor.counter.birthArcOwner = Math.max(+actor.counter.birthArcOwner, 0) || 0;
	actor.counter.birthCitizen = Math.max(+actor.counter.birthCitizen, 0) || 0;
	actor.counter.birthSelf = Math.max(+actor.counter.birthSelf, 0) || 0;
	actor.counter.birthLab = Math.max(+actor.counter.birthLab, 0) || 0;
	actor.counter.birthFutaSis = Math.max(+actor.counter.birthFutaSis, 0) || 0;
	actor.counter.miscarriages = Math.max(+actor.counter.miscarriages, 0) ?? 0;
	actor.counter.abortions = Math.max(+actor.counter.abortions, 0) ?? 0;
	actor.counter.laborCount = Math.max(+actor.counter.laborCount, 0) ?? actor.counter.birthsTotal;
	actor.counter.miscarriages = Math.max(+actor.counter.miscarriages, 0) || 0;
	actor.counter.slavesFathered = Math.max(+actor.counter.slavesFathered, 0) || 0;
	actor.counter.slavesKnockedUp = Math.max(+actor.counter.slavesKnockedUp, 0) || 0;
	actor.counter.storedCum = Math.max(+actor.counter.storedCum, 0) || 0;
	actor.counter.reHymen = Math.max(+actor.counter.reHymen, 0) ?? 0;
	actor.counter.raped = Math.max(+actor.counter.raped, 0) || (V.raped && (V.raped > 0) ? 1 : 0);

	actor.counter.moves = Math.max(+actor.counter.moves, 0) || 0;
	actor.counter.quick = Math.max(+actor.counter.quick, 0) || 0;
	actor.counter.crazy = Math.max(+actor.counter.crazy, 0) || 0;
	actor.counter.virgin = Math.max(+actor.counter.virgin, 0) || 0;
	actor.counter.futa = Math.max(+actor.counter.futa, 0) || 0;
	actor.counter.preggo = Math.max(+actor.counter.preggo, 0) || 0;

	actor.bodySwap = Math.max(+actor.bodySwap, 0) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerPreferences = (actor) => {
	actor.energy = Math.clamp(+actor.energy, 0, 100) ?? 0;
	actor.need = Math.max(+actor.need, 0) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerRules = (actor) => {
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionPlayerState}
 */
App.Verify.I.playerMisc = (actor) => {
	actor = /** @type {FC.PlayerState} */ (App.Verify.I.humanMisc(actor, "PC"));
	ibc.recalculate_coeff_id(-1);

	return actor;
};
