
/**
 * Runs verification for every Fetus object in the HumanStates womb.
 * @param {string} mothersIdentifier
 * @param {FC.HumanState} mother
 * @param {HTMLDivElement} [div]
 */
App.Verify.womb = (mothersIdentifier, mother, div) => {
	if ("womb" in mother && Array.isArray(mother.womb)) {
		mother.womb.forEach((fetus, i) => {
			const original = _.cloneDeep(fetus);
			try {
				App.Patch.Utils.fetus(`${mothersIdentifier}.womb[${i}]`, fetus, mother);
			} catch (e) {
				console.error(e);
				fetus = original;
				return;
			}
			// add missing props
			App.Utils.assignMissingDefaults(fetus, App.Patch.Utils.fetusTemplate(fetus, mother));
			// verify
			fetus = App.Verify.Utils.verify("fetus", `${mothersIdentifier}.womb[${i}]`, fetus, mother, div);
		});
	}
};

// ***************************************************************************************************** \\
// *************************** Put your verification functions below this line *************************** \\
// ***************************************************************************************************** \\

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanAge = (actor, location) => {
	if (location === "tank slave pool") {
		return actor; // we don't need to process this actor as they are in an incubator tank
	}
	let minAge = V.minimumSlaveAge;
	if (
		location === "infant slave pool" || // Infants in cribs
		location === "PC" || (actor.ID === -1 && isPlayer(actor)) || // The player
		actor.tankBaby !== 0 // Slaves that were born from incubator tanks
	) {
		minAge = 0;
	}
	// TODO:@franklygeorge handle minAge for ChildState when it is implemented
	actor.birthWeek = Math.clamp(+actor.birthWeek, 0, 51) ?? 0;
	actor.actualAge = Math.clamp(+actor.actualAge, minAge, Infinity) ?? 18;
	actor.visualAge = Math.max(+actor.visualAge, 0) ?? actor.actualAge;
	actor.physicalAge = Math.max(+actor.physicalAge, 0) ?? actor.actualAge;
	if (typeof actor.ovaryAge !== "number") { // immortalOvaries intentionally sets ovaryAge to a negative number, so treat it more leniently
		actor.ovaryAge = actor.physicalAge;
	}
	actor.pubertyAgeXX = Math.max(+actor.pubertyAgeXX, 0) ?? V.fertilityAge;
	actor.pubertyAgeXY = Math.max(+actor.pubertyAgeXY, 0) ?? V.potencyAge;
	actor.ageAdjust = Math.clamp(+actor.ageAdjust, -40, 40) ?? 0;
	actor.NCSyouthening = Math.max(+actor.NCSyouthening, 0) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanHealth = (actor, location) => {
	const oldHealth = _.cloneDeep(actor.health);
	actor.health.condition = Math.clamp(actor.health.condition, -100, 100) ?? 0;
	actor.health.shortDamage = Math.max(+actor.health.shortDamage, 0) ?? 0;
	actor.health.longDamage = Math.max(+actor.health.longDamage, 0) ?? 0;
	actor.health.illness = Math.max(+actor.health.illness, 0) ?? 0;
	actor.health.tired = Math.clamp(+actor.health.tired, 0, 100) ?? 0;
	/**
	 * //FIXME: updateHealth(actor) will change the value of actor.health.health each time it is ran.
	 * Even if nothing else has changed anything in actor.health.
	 * The problem seems to be in computeAggregateHealth().
	 * @see computeAggregateHealth
	 * @see updateHealth
	 * To get around this issue we are only running updateHealth(actor) if the values were actually changed by this function
	 */
	if (Serial.stringify(oldHealth) !== Serial.stringify(actor.health)) {
		updateHealth(actor);
	}
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanPhysical = (actor, location) => {
	actor.muscles = Math.clamp(+actor.muscles, -100, 100) ?? 0;
	actor.weight = Math.clamp(+actor.weight, -100, 200) ?? 0;
	actor.waist = Math.clamp(+actor.waist, -100, 100) ?? 0;
	actor.height = Math.round(Math.max(+actor.height, 0)) ?? Height.mean(actor);
	// @ts-expect-error Type 'number' is not assignable to type ...
	actor.shoulders = Math.clamp(+actor.shoulders, -2, 2) ?? 0;
	// @ts-expect-error Type 'number' is not assignable to type ...
	actor.hips = Math.clamp(+actor.hips, -2, 3) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanSkin = (actor, location) => {
	if (actor.geneticQuirks.albinism === 2 && !actor.albinismOverride) {
		induceAlbinism(actor, 2);
	}
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanFace = (actor, location) => {
	actor.face = Math.clamp(+actor.face, -100, 100) ?? 0;
	actor.lips = Math.clamp(+actor.lips, 0, 100) ?? 15;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanHair = (actor, location) => {
	// @ts-expect-error comparison is intentional
	if (actor.hStyle === "Salon") {
		actor.hStyle = "trimmed";
	}
	actor.hLength = Math.clamp(+actor.hLength, 0, 300) ?? 60;
	actor.haircuts = Math.clamp(+actor.haircuts, 0, 1) ?? 0;
	actor.bald = Math.clamp(+actor.bald, 0, 1) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanBoobs = (actor, location) => {
	actor.boobs = Math.max(+actor.boobs, 100) ?? 200;
	if (actor.boobShape === "spherical" && actor.boobsImplant === 0) {
		actor.boobShape = "normal";
	}
	// @ts-expect-error Type 'number' is not assignable to type ...
	actor.areolae = Math.clamp(+actor.areolae, 0, 4) ?? 0;
	actor.lactation = /** @type {FC.LactationType} */ (Math.clamp(+actor.lactation, 0, 2) ?? 0);
	actor.boobsMilk = Math.max(+actor.boobsMilk, 0) ?? 0;
	if (actor.boobsMilk > 0 && App.Medicine.fleshSize(actor, 'boobs') < 0) {
		// should never get here, but if it does, just immediately abort!
		actor.boobsMilk = 0;
	}
	actor.lactationAdaptation = Math.clamp(+actor.lactationAdaptation, 0, 200) ?? 0;

	actor.boobsImplant = Math.clamp(+actor.boobsImplant, 0, actor.boobs) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanButt = (actor, location) => {
	actor.butt = Math.clamp(+actor.butt, 0, 20) ?? 1;
	actor.anus = /** @type {FC.AnusType} */ (Math.clamp(+actor.anus, 0, 4) ?? 0);
	actor.analArea = Math.max(+actor.analArea, 0) ?? 0;

	actor.buttImplant = Math.clamp(+actor.buttImplant, 0, actor.butt) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanGeneticQuirks = (actor, location) => {
	const quirks = {};
	App.Data.geneticQuirks.forEach((value, q) => quirks[q] = 0);
	// add any new quirks
	App.Utils.assignMissingDefaults(actor.geneticQuirks, quirks);
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanPregnancy = (actor, location) => {
	actor.induce = Math.clamp(+actor.induce, 0, 1) ?? 0;
	actor.labor = Math.clamp(+actor.labor, 0, 1) ?? 0;
	actor.prematureBirth = Math.clamp(+actor.prematureBirth, 0, 1) ?? 0;
	actor.ovaries = Math.clamp(+actor.ovaries, 0, 1) ?? 0;
	actor.vasectomy = Math.clamp(+actor.vasectomy, 0, 1) ?? 0;
	actor.mpreg = Math.clamp(+actor.mpreg, 0, 1) ?? 0;
	actor.pregAdaptation = Math.max(+actor.pregAdaptation, 0) ?? 50;
	if (typeof actor.ovaImplant !== "string") {
		actor.ovaImplant = 0; // human.ovaImplant can be a string or 0
	}
	if (actor.pubertyXX === 0 && (actor.ovaries > 0 || actor.mpreg > 0) && actor.preg === -1) {
		actor.preg = 0; // no contraceptives for prepubescent humans
	}
	actor.fertPeak = Math.clamp(+actor.fertPeak, -10, 10) ?? 0;
	actor.fertLate = Math.clamp(+actor.fertLate, -10, 10) ?? 0;
	// @ts-expect-error Type 'number' is not assignable to type ...
	actor.broodmother = Math.clamp(+actor.broodmother, 0, 3) ?? 0;
	actor.broodmotherFetuses = Math.max(+actor.broodmotherFetuses, 0) ?? 0;
	actor.broodmotherOnHold = Math.clamp(+actor.broodmotherOnHold, 0, 1) ?? 0;
	actor.pregSource = +actor.pregSource ?? 0;
	if (location === "gene pool") {
		actor.womb = [];
	} else {
		WombInit(actor);
		WombNormalizePreg(actor);
	}
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanBelly = (actor, location) => {
	actor.inflation = Math.clamp(+actor.inflation, 0, 3) ?? 0;
	actor.inflationMethod = Math.clamp(+actor.inflationMethod, 0, 3) ?? 0;
	actor.milkSource = Math.max(+actor.milkSource, 0) ?? 0;
	actor.cumSource = Math.max(+actor.cumSource, 0) ?? 0;
	actor.burst = Math.clamp(+actor.burst, 0, 1) ?? 0;
	actor.bellyImplant = Math.max(+actor.bellyImplant, -1) ?? -1;
	actor.cervixImplant = Math.clamp(+actor.cervixImplant, 0, 3) ?? 0;
	actor.cervixImplantTubing = Math.clamp(+actor.cervixImplantTubing, 0, 1) ?? 0;
	if (actor.cervixImplant) {
		if (
			(
				!["fillable", "advanced fillable", "hyper fillable"].includes(actor.boobsImplantType) &&
				["all", "TnA", "mombod", "boobsImplant"].includes(actor.cervixImplantTarget)
			) ||
			(
				!["fillable", "advanced fillable", "hyper fillable"].includes(actor.buttImplantType) &&
				["all", "TnA", "bottomHeavy", "buttImplant"].includes(actor.cervixImplantTarget)
			)
		) {
			actor.cervixImplantTarget = "bellyImplant";
		}
		if (actor.cervixImplantTarget === "bellyImplant" && actor.bellyImplant < 0) {
			actor.cervixImplantTarget = "none";
		}
	}
	actor.bellySag = Math.max(+actor.bellySag, 0) ?? 0;
	actor.bellySagPreg = Math.max(+actor.bellySagPreg, 0) ?? actor.bellySag;
	actor.bellyPain = Math.clamp(+actor.bellyPain, 0, 2) ?? 0;
	SetBellySize(actor);
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanGenitalia = (actor, location) => {
	actor.vagina = Math.clamp(+actor.vagina, -1, 10) ?? 0;
	actor.vaginaLube = /** @type {FC.VaginaLubeType} */ (Math.clamp(+actor.vaginaLube, 0, 2) ?? 0);
	actor.labia = /** @type {FC.LabiaType} */ (Math.clamp(+actor.labia, 0, 3) ?? 0);
	actor.clit = /** @type {FC.ClitType} */ (Math.clamp(+actor.clit, 0, 5) ?? 0);
	actor.foreskin = Math.max(+actor.foreskin, 0) ?? 0;
	actor.dick = Math.max(+actor.dick, 0) ?? 0;
	if (actor.dick) {
		actor.prostate = /** @type {FC.ProstateType} */ (Math.clamp(+actor.prostate, 0, 3) ?? 1);
	}
	actor.balls = Math.max(+actor.balls, 0) ?? 0;
	actor.scrotum = Math.max(+actor.scrotum, 0) ?? actor.balls;

	// @ts-expect-error Type 'number' is not assignable to type ...
	actor.ballsImplant = Math.clamp(+actor.ballsImplant, 0, actor.balls) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanImplants = (actor, location) => {
	actor.ageImplant = Math.clamp(+actor.ageImplant, 0, 1) ?? 0;
	actor.faceImplant = Math.clamp(+actor.faceImplant, 0, 100) ?? 0;
	actor.lipsImplant = Math.clamp(+actor.lipsImplant, 0, 100) ?? 0;
	// @ts-expect-error Type 'number' is not assignable to type '0 | 1 | -1'
	actor.voiceImplant = Math.clamp(+actor.voiceImplant, -1, 1) ?? 0;
	actor.boobsImplant = Math.clamp(+actor.boobsImplant, 0, actor.boobs) ?? 0;
	if (actor.boobsImplant === 0) {
		actor.boobsImplantType = "none";
	} else if (actor.boobsImplant > 0 && actor.boobsImplantType === "none") {
		if (actor.boobsImplant > 10000) {
			actor.boobsImplantType = "hyper fillable";
		} else if (actor.boobsImplant > 2200) {
			actor.boobsImplantType = "advanced fillable";
		} else if (actor.boobsImplant > 1000) {
			actor.boobsImplantType = "fillable";
		} else {
			actor.boobsImplantType = "normal";
		}
	}
	actor.breastMesh = Math.clamp(+actor.breastMesh, 0, 1) ?? 0;
	actor.buttImplant = Math.clamp(+actor.buttImplant, 0, Math.min(actor.butt, 20)) ?? 0;
	actor.heightImplant = /** @type {FC.HeightImplant} */ (Math.clamp(+actor.heightImplant, -10, 10) ?? 0);
	actor.earImplant = Math.clamp(+actor.earImplant, 0, 1) ?? 0;
	// @ts-expect-error Type 'number' is not assignable to type '0 | 1 | -1'
	actor.shouldersImplant = Math.clamp(+actor.shouldersImplant, -10, 10) ?? 0;
	// @ts-expect-error Type 'number' is not assignable to type '0 | 1 | -1'
	actor.hipsImplant = Math.clamp(+actor.hipsImplant, -10, 10) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanPiercings = (actor, location) => {
	actor.piercing = actor.piercing ?? new App.Entity.completePiercingState();
	for (const piercing in App.Data.Piercings) {
		actor.piercing[piercing] = actor.piercing[piercing] ?? new App.Entity.piercingState();
		if (App.Data.Piercings[piercing].smart) {
			actor.piercing[piercing].smart = actor.piercing[piercing].smart ?? false;
		}
	}
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanTattoo = (actor, location) => {
	actor.custom.tattoo = actor.custom.tattoo.trim();
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanCosmetics = (actor, location) => {
	actor.makeup = Math.clamp(+actor.makeup, 0, 8) ?? 0;
	actor.nails = Math.clamp(+actor.nails, 0, 9) ?? 0;
	actor.chastityAnus = Math.clamp(+actor.chastityAnus, 0, 1) ?? 0;
	actor.chastityPenis = Math.clamp(+actor.chastityPenis, 0, 1) ?? 0;
	actor.chastityVagina = Math.clamp(+actor.chastityVagina, 0, 1) ?? 0;
	if (actor.clothes === "choosing her own clothes") {
		actor.clothes = "no clothing";
	}
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanDiet = (actor, location) => {
	actor.hormones = Math.clamp(+actor.hormones, -2, 2) ?? 0;
	actor.hormoneBalance = Math.clamp(+actor.hormoneBalance, -500, 500) ?? 0;
	actor.aphrodisiacs = Math.clamp(+actor.aphrodisiacs, -1, 2) ?? 0;
	actor.curatives = Math.clamp(+actor.curatives, 0, 2) ?? 0;
	return actor;
};

/**
 * @type {App.Verify.Utils.FunctionHumanState}
 */
App.Verify.I.humanMisc = (actor, location) => {
	actor.slaveName = actor.slaveName ?? "Nameless";
	actor.slaveSurname = actor.slaveSurname ?? 0;
	actor.prestige = Math.clamp(+actor.prestige, 0, 3) ?? 0;
	actor.devotion = Math.clamp(+actor.devotion, -100, 100) ?? 0;
	actor.chem = Math.max(+actor.chem, 0) ?? 0;
	actor.addict = Math.max(+actor.addict, 0) ?? 0;
	actor.intelligence = Math.clamp(+actor.intelligence, -100, 100) ?? 0;
	actor.intelligenceImplant = Math.clamp(+actor.intelligenceImplant, -15, 30) ?? 0;
	actor.premature = Math.clamp(+actor.premature, 0, 1) ?? 0;
	actor.tankBaby = /** @type {0|1|2|3} */ (Math.clamp(+actor.tankBaby, 0, 3) ?? 0);
	actor.training = Math.clamp(+actor.training, 0, 150) ?? 0;
	actor.hears = /** @type {FC.Hearing} */ (Math.clamp(+actor.hears, -2, 0) ?? 0);
	// @ts-expect-error Type 'number' is not assignable to type '0 | -1'
	actor.smells = Math.clamp(+actor.smells, -1, 0) ?? 0;
	// @ts-expect-error Type 'number' is not assignable to type '0 | -1'
	actor.tastes = Math.clamp(+actor.tastes, -1, 0) ?? 0;
	actor.heels = Math.clamp(+actor.heels, 0, 1) ?? 0;
	const pLimb = hasAnyProstheticLimbs(actor) ? (getLimbCount(actor, 6) > 0 ? 2 : 1) : 0;
	actor.PLimb = /** @type {0 | 1 | 2 | 3} */ (Math.clamp(+actor.PLimb, 0, 3) ?? pLimb);
	actor.PTail = Math.clamp(+actor.PTail, 0, 1) ?? 0;
	actor.PBack = Math.clamp(+actor.PBack, 0, 1) ?? 0;
	// @ts-expect-error Type 'number' is not assignable to type '0 | 1 | 2 | 3'
	actor.voice = Math.clamp(+actor.voice, 0, 3) ?? 1;
	actor.electrolarynx = Math.clamp(+actor.electrolarynx, 0, 1) ?? 0;
	// @ts-expect-error Type 'number' is not assignable to type '0 | 1 | 2 | 3'
	actor.accent = Math.clamp(+actor.accent, 0, 4) ?? 0;
	actor.origBodyOwnerID = Math.max(+actor.origBodyOwnerID, 0) ?? 0;

	if (actor.drugs.includes("penis") && actor.dick === 0 && actor.vagina >= 0) {
		actor.drugs = /** @type {FC.PCDrug} */ (actor.drugs.replace("penis", "clitoris"));
	}
	return actor;
};
