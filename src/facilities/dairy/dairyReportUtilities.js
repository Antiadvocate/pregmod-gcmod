App.Facilities.Dairy.inflation = function() {
	const inflatedSlaves = {
		milk: 0,
		cum: 0
	};
	for (const s of getSlaves().values()) {
		if (s.inflationMethod === 1 || s.inflationMethod === 2) {
			if (s.inflationType === "milk") {
				inflatedSlaves.milk++;
			} else if (s.inflationType === "cum") {
				inflatedSlaves.cum++;
			}
		}
	}
	return inflatedSlaves;
};

/**
 * Strips the slave and sets rules in accordance to the industrial dairy.
 * @param {FC.SlaveState} slave
 */
App.Facilities.Dairy.strip = function(slave) { // TODO: These should be disabled in the slave menu
	slave.collar = "none";
	slave.faceAccessory = "none";
	slave.mouthAccessory = "none";
	slave.choosesOwnClothes = 0;
	slave.clothes = "no clothing";
	slave.vaginalAccessory = "none";
	slave.vaginalAttachment = "none";
	slave.dickAccessory = "none";
	slave.buttplug = "none";
	slave.chastityAnus = 0;
	slave.chastityPenis = 0;
	slave.chastityVagina = 0;
};

/**
 * Checks if dairy settings can force lacation on a slave
 */
App.Facilities.Dairy.forcedLacation = function() {
	return (V.dairySlimMaintainUpgrade === 1 && V.dairySlimMaintain > 0) || V.dairyImplantsSetting === 1 || V.dairyImplantsSetting === 3;
};

/**
 * Checks if a slave producing cum is blocked from being milked.
 * @param {FC.HumanState} slave
 */
App.Facilities.Dairy.cumMilkingBlocked = function(slave) {
	return slave.balls > 0 && ((slave.dick > 0 && slave.chastityPenis === 1) || (slave.dick === 0 && !canDoAnal(slave)));
};

/**
 * Checks if the milkmaid will sodomize this slave
 * @param {FC.HumanState} slave
 */
App.Facilities.Dairy.milkmaidWillSodomize = function(slave) {
	const canSodomize = S.Milkmaid && V.dairyStimulatorsSetting < 2 && (S.Milkmaid.dick > 4 || S.Milkmaid.clit > 4) && canPenetrateAny(S.Milkmaid);
	const willSodomize = S.Milkmaid && (V.dairyStimulatorsSetting === 0 || isHorny(S.Milkmaid) || S.Milkmaid.energy > 20); // Milkmaid will sodomize if 1. No stimulator 2. They have a sex drive.
	const slaveCanBeSodomized = !App.Facilities.Dairy.cumMilkingBlocked(slave) && slave.balls > 0 && slave.prostate > 0 && canDoAnal(slave);
	return slaveCanBeSodomized  && canSodomize && willSodomize;
};

/**
 * Check if milkmaid will impreg this slave
 * @param {FC.HumanState} slave
 */
App.Facilities.Dairy.milkmaidWillImpreg = function(slave) {
	return S.Milkmaid &&
		V.milkmaidImpregnates === 1 &&
		V.dairyPregSetting === 0 && // Don't impreg if dairy setting is on
		!slaveResting(S.Milkmaid) &&
		canPenetrate(S.Milkmaid) &&
		canImpreg(slave, S.Milkmaid, !fertKnown(slave)) &&
		slave.pregKnown === 0;
};

/**
 * If slave can be milked for girlcum
 * @param {FC.HumanState} slave
 */
App.Facilities.Dairy.canMilkGirlcum = function(slave) {
	return slave.genes === GenderGenes.FEMALE && slave.prostate > 0 && slave.balls === 0 && canDoVaginal(slave);
};
