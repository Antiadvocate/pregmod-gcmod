/**
 * @param {number|string} [seed=undefined]
 * @returns {"XX"|"XY"}
 */
globalThis.GenerateChromosome = function(seed) {
	if (jsRandom(0, 99, undefined, seed) < V.seeDicks) {
		return "XY";
	} else if (V.seeDicks > 0) {
		let femaleSlaveGen = 80;
		if (V.arcologies[0].FSGenderFundamentalistSMR === 1 || V.arcologies[0].FSRepopulationFocusSMR === 1) {
			femaleSlaveGen = 90;
		} else if (FutureSocieties.isActive('FSGenderRadicalist')) {
			femaleSlaveGen = 50;
		}
		if (jsRandom(1, 100, undefined, seed) > femaleSlaveGen && jsRandom(0, 99, undefined, seed) < V.seeDicks) {
			return "XY";
		} else {
			return "XX";
		}
	} else {
		return "XX";
	}
};

globalThis.GenerateNewSlavePram = function() {
	/** @type {number} minAge*/
	this.minAge = 0;
	/** @type {number} maxAge */
	this.maxAge = 999;
	/** @type {FC.Bool} ageOverridesPedoMode*/
	this.ageOverridesPedoMode = 0;
	/** @type {FC.Bool} mature Applies to FSMaturityPref arcs only. If 1, adds 10 to maxAge. Consider setting to 0 if you need to make sure am MP slave is both fertile and an age for that to make sense.*/
	this.mature = 1;
	/** @type {FC.Zeroable<string>} nationality Sets nationality. */
	this.nationality = 0;
	/** @type {FC.Zeroable<FC.Race>|"nonslave"} race Sets race. Special value "nonslave" chooses a race that is valid for a free citizen of your arcology (avoiding races that are automatically enslaved by policy).*/
	this.race = 0;
	/** @type {FC.Bool} disableDisability*/
	this.disableDisability = 0;
	/** @type {string|number} */
	this.seed = undefined;
};

globalThis.GenerateNewSlave = (function() {
	"use strict";

	let chance;
	let x = {};
	/** @type {FC.SlaveState} */
	let slave;
	/** @type {string} */
	let currentSeed;

	/**
	 * @returns {FC.SlaveState}
	 * @param {"XY"|"XX"|""} [sex] null or omit to use default rules
	 * @param {Partial<InstanceType<typeof GenerateNewSlavePram>>} [Obj]
	 */
	function GenerateNewSlave(sex, {
		minAge,
		maxAge,
		ageOverridesPedoMode,
		mature,
		nationality,
		race,
		disableDisability,
		seed
	} = {}) {
		x.minAge = minAge || 0;
		x.maxAge = maxAge || 999;
		x.ageOverridesPedoMode = ageOverridesPedoMode || 0;
		x.mature = (mature === 0) ? 0 : 1;
		x.nationality = nationality || 0;
		x.race = race || 0;
		currentSeed = (seed) ? String(seed) : generateNewID();
		if (x.race === "nonslave") {
			if (V.arcologies[0].FSSupremacistLawME === 1) {
				x.race = V.arcologies[0].FSSupremacistRace;
			} else if (V.arcologies[0].FSSubjugationistLawME === 1) {
				x.race = jsSeededEither(getSeed(), App.Utils.getRaceArrayWithoutParamRace(V.arcologies[0].FSSubjugationistRace));
			} else {
				x.race = 0;
			}
		} else if (x.race !== 0 && !(App.Data.misc.filterRaces.has(x.race))) {
			console.log("Error, cannot find race: ", x.race);
			x.race = 0;
		}
		x.disableDisability = disableDisability || 0;
		slave = baseSlave(getSeed());

		// generate genetic quirks first so heterochromia doesn't get confused
		sex = sex || GenerateChromosome(getSeed());
		if (sex === "XY") {
			generateXYGeneticQuirks();
			preGenCombinedStats();
			GenerateXYSlave();
		} else {
			generateXXGeneticQuirks();
			preGenCombinedStats();
			GenerateXXSlave();
		}
		postGenCleanup();

		return slave;
	}

	/**
	 * Mutates currentSeed each time it is called and returns the mutated currentSeed
	 * @returns {string} a seed
	 */
	function getSeed() {
		if (!currentSeed) { currentSeed = generateNewID(); }
		// use the seed to generate a new seed
		currentSeed = iterateSeed(currentSeed);
		// return seed
		return currentSeed;
	}

	function preGenCombinedStats() {
		slave.ID = generateSlaveID();
		slave.weekAcquired = V.week;
		slave.canRecruit = 1;
		slave.devotion = jsRandom(-90, -60, undefined, getSeed());
		slave.trust = jsRandom(-45, -25, undefined, getSeed());
		slave.weight = jsRandom(-100, 180, undefined, getSeed());
		slave.muscles = jsRandom(-5, 15, undefined, getSeed());
		setHealth(slave, undefined, undefined, undefined, undefined, undefined, getSeed());

		WombInit(slave);
		generateAge();
		generateIntelligence();
		generateCareer();
		generateNationality(); /* includes race selection */
		generateAccent();
		generateRacialTraits();
	}

	function postGenCleanup() {
		nationalityToName(slave, getSeed(), getSeed(), getSeed());
		generatePuberty(slave);
		generateBoobTweaks(); /* split this up for female vs. male? */
		generateSkills();
		generateDisabilities();
		generateGeneticQuirkTweaks();
		generateHormones();
		generatePronouns(slave);
		slave.origRace = slave.race;
		slave.hColor = getGeneticHairColor(slave);
		slave.skin = getGeneticSkinColor(slave);
		resetEyeColor(slave, "both");
		slave.spermY = normalRandInt(50, 5, undefined, undefined, getSeed());
	}

	function GenerateXXSlave() {
		slave.ovaries = 1;
		slave.energy = jsRandom(1, 85, undefined, getSeed());

		generateXXBodyProportions();
		generateVagina();
		generateXXPreferences();
		generateXXButt();
		generateXXBoobs();
		generateXXFace();
		generateXXPregAdaptation();
		generateXXVoice();
		generateXXTeeth();
		generateXXMods();
		generateXXBodyHair();
	}

	function GenerateXYSlave() {
		slave.genes = "XY";
		slave.hLength = 10;
		slave.prostate = 1;
		slave.energy = jsRandom(15, 90, undefined, getSeed());

		generateXYBodyProportions();
		generateDick();
		generateCircumcision();
		generateXYPreferences(); /* must happen after genitalia generation */
		generateXYButt(); /* must happen after preferences */
		generateXYBoobs();
		generateXYFace();
		generateXYPregAdaptation();
		generateXYVoice();
		generateXYTeeth();
		generateXYMods();
		generateXYBodyHair();
	}

	function generateXXBodyProportions() {
		if (slave.geneticQuirks.dwarfism === 2 && slave.geneticQuirks.gigantism !== 2) {
			slave.natural.height = Height.randomAdult(slave, {limitMult: [-4, -1], spread: 0.15, seed1: getSeed(), seed2: getSeed()});
		} else if (slave.geneticQuirks.gigantism === 2) {
			slave.natural.height = Height.randomAdult(slave, {limitMult: [3, 10], spread: 0.15, seed1: getSeed(), seed2: getSeed()});
		} else {
			slave.natural.height = Height.randomAdult(slave, {seed1: getSeed(), seed2: getSeed()});
		}
		slave.height = Height.forAge(slave.natural.height, slave);
		if (slave.height >= Height.mean(slave) * 170 / 162.5) {
			slave.hips = jsSeededEither(getSeed(), [-1, 0, 0, 1, 1, 2, 2]);
			slave.shoulders = jsSeededEither(getSeed(), [-1, -1, 0, 0, 0, 1]);
		} else {
			slave.hips = jsSeededEither(getSeed(), [-1, 0, 0, 0, 1, 1, 2]);
			slave.shoulders = jsSeededEither(getSeed(), [-2, -1, -1, 0, 0, 1]);
		}
		if (slave.physicalAge <= 11) {
			slave.hips = jsSeededEither(getSeed(), [-2, -2, -1, -1, 0]);
		} else if (slave.physicalAge <= 13) {
			slave.hips = jsSeededEither(getSeed(), [-2, -1, -1, 0, 1]);
		}
		if (slave.weight < -30) {
			slave.waist = jsRandom(-55, 0, undefined, getSeed());
		} else if (slave.physicalAge < 13) {
			slave.waist = jsRandom(-25, 25, undefined, getSeed());
		} else if (slave.weight <= 30) {
			slave.waist = jsRandom(-45, 45, undefined, getSeed());
		} else if (slave.weight <= 160) {
			slave.waist = jsRandom(0, 55, undefined, getSeed());
		} else {
			slave.waist = jsRandom(50, 100, undefined, getSeed());
		}
	}

	function generateXYBodyProportions() {
		if (slave.geneticQuirks.dwarfism === 2 && slave.geneticQuirks.gigantism !== 2) {
			slave.natural.height = Height.randomAdult(slave, {limitMult: [-4, -1], spread: 0.15, seed1: getSeed(), seed2: getSeed()});
		} else if (slave.geneticQuirks.gigantism === 2) {
			slave.natural.height = Height.randomAdult(slave, {limitMult: [3, 10], spread: 0.15, seed1: getSeed(), seed2: getSeed()});
		} else {
			slave.natural.height = Height.randomAdult(slave, {seed1: getSeed(), seed2: getSeed()});
		}
		slave.height = Height.forAge(slave.natural.height, slave);
		if (slave.physicalAge <= 13) {
			if (slave.height > Height.mean(slave) * 170 / 172.5) {
				slave.hips = jsSeededEither(getSeed(), [-2, -1, -1, 0, 1]);
				slave.shoulders = jsSeededEither(getSeed(), [-1, -1, 0, 0, 0, 1]);
			} else {
				slave.hips = jsSeededEither(getSeed(), [-2, -2, -1, -1, 0]);
				slave.shoulders = jsSeededEither(getSeed(), [-2, -1, -1, 0, 0, 1]);
			}
		} else {
			if (slave.height > Height.mean(slave) * 170 / 172.5) {
				slave.hips = jsSeededEither(getSeed(), [-2, -1, -1, 0, 1]);
				slave.shoulders = jsSeededEither(getSeed(), [-1, 0, 1, 1, 2, 2]);
			} else {
				slave.hips = jsSeededEither(getSeed(), [-2, -2, -1, -1, 0]);
				slave.shoulders = jsSeededEither(getSeed(), [-1, 0, 0, 1, 1, 2]);
			}
		}
		if (slave.physicalAge < 13) {
			slave.waist = jsRandom(-15, 25, undefined, getSeed());
		} else if (slave.weight < -30) {
			slave.waist = jsRandom(-45, 45, undefined, getSeed());
		} else if (slave.weight <= 30) {
			slave.waist = jsRandom(-15, 65, undefined, getSeed());
		} else if (slave.weight <= 160) {
			slave.waist = jsRandom(5, 100, undefined, getSeed());
		} else {
			slave.waist = jsRandom(50, 100, undefined, getSeed());
		}
	}

	function generateVagina() {
		if (slave.physicalAge <= 13) {
			slave.vagina = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 0, 0, 1]);
		} else if (slave.physicalAge <= 15) {
			slave.vagina = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 0, 1, 1]);
		} else if (slave.physicalAge <= 17) {
			slave.vagina = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 1, 1, 1]);
		} else if (slave.physicalAge < 20) {
			slave.vagina = jsSeededEither(getSeed(), [0, 1]);
		} else if (slave.physicalAge > 30) {
			slave.vagina = jsSeededEither(getSeed(), [1, 1, 1, 1, 2]);
		} else {
			slave.vagina = jsSeededEither(getSeed(), [0, 0, 1, 1, 1]);
		}

		if (slave.physicalAge <= 11) {
			slave.clit = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 0, 0, 0, 1]);
		} else if (slave.physicalAge <= 13) {
			slave.clit = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 0, 0, 1, 1]);
		} else if (slave.physicalAge <= 15) {
			slave.clit = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 0, 0, 1, 2]);
		} else {
			slave.clit = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 0, 1, 1, 2]);
		}

		if (slave.physicalAge <= 11) {
			slave.labia = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 0, 0, 1, 1]);
		} else if (slave.physicalAge <= 12) {
			slave.labia = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 0, 1, 1, 1]);
		} else if (slave.physicalAge <= 13) {
			slave.labia = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 1, 1, 1, 1]);
		} else if (slave.physicalAge <= 14) {
			slave.labia = jsSeededEither(getSeed(), [0, 0, 0, 0, 1, 1, 1, 1, 2]);
		} else if (slave.physicalAge <= 15) {
			slave.labia = jsSeededEither(getSeed(), [0, 0, 0, 1, 1, 1, 1, 2, 2]);
		} else {
			slave.labia = jsSeededEither(getSeed(), [0, 0, 0, 1, 1, 1, 1, 2, 2, 3]);
		}

		if (slave.energy < jsRandom(1, 80, undefined, getSeed())) {
			slave.vaginaLube = 0;
		} else if (slave.physicalAge > jsRandom(35, 60, undefined, getSeed())) {
			slave.vaginaLube = 0;
		} else {
			slave.vaginaLube = 1;
		}
		slave.foreskin = jsRandom(0, 4, undefined, getSeed());
	}

	function generateDick() {
		slave.vagina = -1;
		slave.clit = 0;
		slave.preg = 0;

		if (slave.physicalAge <= 13) {
			if (slave.geneticQuirks.wellHung === 2) {
				if (slave.physicalAge >= 8) {
					slave.dick = jsSeededEither(getSeed(), [2, 2, 3, 3, 4]);
				} else {
					slave.dick = jsSeededEither(getSeed(), [1, 2, 2, 3]);
				}
			} else {
				slave.dick = jsSeededEither(getSeed(), [1, 1, 1, 1, 2, 2, 2, 3]);
			}
			if (V.seeExtreme === 1) {
				slave.balls = jsSeededEither(getSeed(), [0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3]);
			} else {
				slave.balls = jsSeededEither(getSeed(), [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3]);
			}
			slave.scrotum = slave.balls;
		} else if (slave.physicalAge <= 15) {
			if (slave.geneticQuirks.wellHung === 2) {
				slave.dick = jsSeededEither(getSeed(), [3, 3, 4, 4, 5]);
			} else {
				slave.dick = jsSeededEither(getSeed(), [1, 1, 1, 2, 2, 2, 3]);
			}
			if (V.seeExtreme === 1) {
				slave.balls = jsSeededEither(getSeed(), [0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 4]);
			} else {
				slave.balls = jsSeededEither(getSeed(), [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 4]);
			}
			slave.scrotum = slave.balls;
		} else if (slave.physicalAge <= 17) {
			if (slave.geneticQuirks.wellHung === 2) {
				slave.dick = jsSeededEither(getSeed(), [4, 4, 5, 5, 6]);
			} else {
				slave.dick = jsSeededEither(getSeed(), [1, 1, 2, 2, 3, 3]);
			}
			if (V.seeExtreme === 1) {
				slave.balls = jsSeededEither(getSeed(), [0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 5]);
			} else {
				slave.balls = jsSeededEither(getSeed(), [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 5]);
			}
			slave.scrotum = slave.balls;
		} else {
			if (slave.geneticQuirks.wellHung === 2) {
				slave.dick = jsSeededEither(getSeed(), [5, 5, 6]);
			} else {
				slave.dick = jsSeededEither(getSeed(), [1, 2, 2, 2, 3, 3, 3, 4, 4, 5]);
			}
			if (V.seeExtreme === 1) {
				slave.balls = jsSeededEither(getSeed(), [0, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5]);
			} else {
				slave.balls = jsSeededEither(getSeed(), [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5]);
			}
			if (slave.balls !== 0) {
				if (slave.geneticQuirks.wellHung === 2) {
					slave.balls++;
				}
				slave.scrotum = slave.balls + jsSeededEither(getSeed(), [0, 0, 1]);
			} else {
				slave.scrotum = 0;
			}
			if (jsRandom(1, 100, undefined, getSeed()) < 3) {
				slave.vasectomy = 1;
			}
		}
	}

	function generateCircumcision() {
		/* The default rate of 50* is wildly unrepresentative, and there is extreme regional variation. */
		/*
		What we want is the prevalence among newborns, since this game
		happens about 20 years in the future, but we'll use this lacking
		something better.
		https://pophealthmetrics.biomedcentral.com/articles/10.1186/s12963-016-0073-5
		Right now we mostly just break it down by country.
		It would be better to break it down by both country
		and race if statistics are available.
		*/
		if (V.seeCircumcision === 0) {
			slave.foreskin = slave.dick + jsRandom(0, 1, undefined, getSeed());
		} else {
			/* Temporarily use slave.foreskin to store the chance of circumcision. */
			switch (slave.nationality) {
				case "Afghan":
				case "Iranian":
				case "Moroccan":
				case "Palestinian":
				case "Sahrawi":
				case "Tunisian":
					slave.foreskin = 100;
					break;
				case "Comorian":
				case "Gabonese":
				case "Iraqi":
				case "Jordanian":
				case "Kurdish":
				case "Mauritanian":
				case "Nigerian":
				case "Tajik":
				case "Turkish":
				case "Yemeni":
					slave.foreskin = 99;
					break;
				case "Algerian":
				case "Azerbaijani":
				case "Liberian":
				case "Maldivian":
					slave.foreskin = 98;
					break;
				case "Djiboutian":
				case "Eritrean":
				case "Ivorian":
				case "Libyan":
				case "Saudi":
				case "Uzbek":
					slave.foreskin = 97;
					break;
				case "Nigerien":
				case "Pakistani":
				case "Sierra Leonean":
				case "Turkmen":
				case "Zairian":
					slave.foreskin = 96;
					break;
				case "a Cook Islander":
				case "Egyptian":
				case "Gambian":
				case "Guamanian":
				case "Malagasy":
				case "Nauruan":
				case "Ni-Vanuatu":
				case "Niuean":
				case "Palauan":
				case "Samoan":
				case "a Solomon Islander":
				case "Togolese":
				case "Tongan":
				case "Tuvaluan":
					slave.foreskin = 95;
					break;
				case "Cameroonian":
				case "Senegalese":
				case "Somali":
					slave.foreskin = 94;
					break;
				case "Bangladeshi":
				case "Beninese":
				case "Bissau-Guinean":
				case "Indonesian":
				case "Syrian":
					slave.foreskin = 93;
					break;
				case "Ethiopian":
				case "Filipina":
				case "Ghanan":
				case "Israeli":
				case "Kosovan":
					slave.foreskin = 92;
					break;
				case "Kenyan":
				case "Kyrgyz":
					slave.foreskin = 91;
					break;
				case "Burkinabé":
				case "Omani":
					slave.foreskin = 88;
					break;
				case "Equatoguinean":
					slave.foreskin = 87;
					break;
				case "Kuwaiti":
				case "Malian":
					slave.foreskin = 86;
					break;
				case "Guinean":
					slave.foreskin = 84;
					break;
				case "Bahraini":
					slave.foreskin = 81;
					break;
				case "French Polynesian":
					slave.foreskin = 78;
					break;
				case "American":
				case "Qatari":
					slave.foreskin = 77;
					break;
				case "Emirati":
					slave.foreskin = 76;
					break;
				case "Chadian":
					slave.foreskin = 74;
					break;
				case "Tanzanian":
					slave.foreskin = 72;
					break;
				case "Congolese":
					slave.foreskin = 70;
					break;
				case "Central African":
					slave.foreskin = 63;
					break;
				case "Burundian":
				case "Malaysian":
					slave.foreskin = 61;
					break;
				case "Lebanese":
					slave.foreskin = 60;
					break;
				case "Angolan":
					slave.foreskin = 58;
					break;
				case "Fijian":
				case "Kazakh":
					slave.foreskin = 56;
					break;
				case "Bruneian":
				case "Korean":
				case "Mosotho":
					/* Population-weighted average of South Korea and North Korea. */
					slave.foreskin = 52;
					break;
				case "New Caledonian":
					slave.foreskin = 50;
					break;
				case "Albanian":
					slave.foreskin = 48;
					break;
				case "Mozambican":
					slave.foreskin = 47;
					break;
				case "South African":
					slave.foreskin = 45;
					break;
				case "Dominican":
					slave.foreskin = 43;
					break;
				case "Bosnian":
					slave.foreskin = 42;
					break;
				case "Sudanese":
					slave.foreskin = 39;
					break;
				case "Mexican":
					slave.foreskin = 38;
					break;
				case "Macedonian":
					slave.foreskin = 34;
					break;
				case "a New Zealander":
					slave.foreskin = 33;
					break;
				case "Canadian":
					slave.foreskin = 32;
					break;
				case "Scottish":
					slave.foreskin = 28;
					break;
				case "Australian":
				case "Ugandan":
					slave.foreskin = 27;
					break;
				case "Namibian":
					slave.foreskin = 26;
					break;
				case "South Sudanese":
					slave.foreskin = 24;
					break;
				case "Belgian":
				case "Cypriot":
				case "Thai":
					slave.foreskin = 23;
					break;
				case "Malawian":
					slave.foreskin = 22;
					break;
				case "British":
					slave.foreskin = 21;
					break;
				case "Puerto Rican":
					slave.foreskin = 20;
					break;
				case "Montenegrin":
					slave.foreskin = 19;
					break;
				case "Mauritian":
					slave.foreskin = 17;
					break;
				case "Motswana":
				case "Singaporean":
				case "Surinamese":
					slave.foreskin = 15;
					break;
				case "Chinese":
				case "French":
				case "Indian":
				case "Jamaican":
					slave.foreskin = 14;
					break;
				case "Bulgarian":
				case "Rwandan":
				case "Zambian":
					slave.foreskin = 13;
					break;
				case "French Guianan":
				case "Guyanese":
				case "Russian":
					slave.foreskin = 12;
					break;
				case "German":
					slave.foreskin = 11;
					break;
				case "Belarusian":
				case "Georgian":
				case "Papua New Guinean":
					slave.foreskin = 10;
					break;
				case "Japanese":
				case "Zimbabwean":
					slave.foreskin = 9;
					break;
				case "Slovene":
				case "Sri Lankan":
				case "Swazi":
				case "Taiwanese":
					slave.foreskin = 8;
					break;
				case "Catalan":
				case "Haitian":
				case "Spanish":
					slave.foreskin = 7;
					break;
				case "Austrian":
				case "Dutch":
				case "East Timorese":
				case "Swiss":
				case "Trinidadian":
					slave.foreskin = 6;
					break;
				case "Danish":
				case "Greek":
				case "a Liechtensteiner":
				case "Swedish":
					slave.foreskin = 5;
					break;
				case "Burmese":
				case "Cambodian":
				case "Mongolian":
				case "Nepalese":
				case "Peruvian":
				case "Serbian":
					slave.foreskin = 4;
					break;
				case "Argentinian":
				case "Italian":
				case "Norwegian":
					slave.foreskin = 3;
					break;
				case "Luxembourgian":
				case "Tibetan":
				case "Ukrainian":
				case "Vincentian":
					slave.foreskin = 2;
					break;
				case "Andorran":
				case "Barbadian":
				case "Bermudian":
				case "Bhutanese":
				case "Brazilian":
				case "Croatian":
				case "Finnish":
				case "Hungarian":
				case "Irish":
				case "Moldovan":
				case "Monégasque":
				case "Panamanian":
				case "Portuguese":
				case "Seychellois":
				case "Uruguayan":
					slave.foreskin = 1;
					break;
				case "Antiguan":
				case "Armenian":
				case "Bahamian":
				case "Belizean":
				case "Bolivian":
				case "Cape Verdean":
				case "Chilean":
				case "Colombian":
				case "Costa Rican":
				case "Cuban":
				case "Curaçaoan":
				case "Czech":
				case "Dominiquais":
				case "Ecuadorian":
				case "Estonian":
				case "Greenlandic":
				case "Grenadian":
				case "Guatemalan":
				case "Honduran":
				case "I-Kiribati":
				case "Icelandic":
				case "Kittitian":
				case "Laotian":
				case "Latvian":
				case "Lithuanian":
				case "Maltese":
				case "Marshallese":
				case "Micronesian":
				case "Nicaraguan":
				case "Paraguayan":
				case "Polish":
				case "Romanian":
				case "Saint Lucian":
				case "Salvadoran":
				case "Sammarinese":
				case "São Toméan":
				case "Slovak":
				case "Vatican":
				case "Venezuelan":
				case "Vietnamese":
					slave.foreskin = 0;
					break;
				default:
					/* Some overlooked country, or possibly stateless. Use global average. */
					slave.foreskin = 38;
			}
			/* Second pass for minorities in other countries. */
			if (slave.race === "middle eastern" && slave.foreskin < 76) {
				slave.foreskin = 76;
			}
			if (slave.race === "semitic" && slave.foreskin < 90) {
				slave.foreskin = 90;
			}
			/* Chance slave.foreskin back to the normal meaning. */
			if (jsRandom(0, 99, undefined, getSeed()) < slave.foreskin) {
				slave.foreskin = 0;
			} else {
				slave.foreskin = slave.dick + jsRandom(0, 1, undefined, getSeed());
			}
		}
	}

	function generateXXPreferences() {
		randomizeAttraction(slave, getSeed());
		slave.fetishStrength = jsRandom(0, 90, undefined, getSeed());
		slave.fetish = jsSeededEither(getSeed(), ["boobs", "buttslut", "cumslut", "dom", "humiliation", "humiliation", "masochist", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "pregnancy", "sadist", "submissive", "submissive"]);
		slave.behavioralFlaw = jsSeededEither(getSeed(), ["anorexic", "arrogant", "bitchy", "devout", "gluttonous", "hates men", "hates women", "hates women", "liberated", "none", "none", "none", "odd"]);

		if (slave.behavioralFlaw === "devout") {
			slave.sexualFlaw = jsSeededEither(getSeed(), ["apathetic", "crude", "judgemental", "none", "repressed", "shamefast"]);
		} else {
			slave.sexualFlaw = jsSeededEither(getSeed(), ["apathetic", "crude", "hates anal", "hates oral", "hates penetration", "idealistic", "judgemental", "none", "none", "none", "none", "repressed", "shamefast"]);
		}
		if (slave.behavioralFlaw === "none" && jsRandom(1, 10, undefined, getSeed()) === 1) {
			slave.behavioralQuirk = jsSeededEither(getSeed(), ["adores men", "adores women", "advocate", "confident", "cutting", "fitness", "funny", "insecure", "sinful"]);
		}
		if (slave.sexualFlaw === "none" && jsRandom(1, 10, undefined, getSeed()) === 1) {
			slave.sexualQuirk = jsSeededEither(getSeed(), ["caring", "gagfuck queen", "painal queen", "perverted", "romantic", "size queen", "strugglefuck queen", "tease", "unflinching"]);
		}
	}

	function generateXYPreferences() {
		randomizeAttraction(slave, getSeed());
		slave.fetishStrength = jsRandom(0, 90, undefined, getSeed());
		slave.fetish = jsSeededEither(getSeed(), ["boobs", "buttslut", "buttslut", "cumslut", "dom", "humiliation", "masochist", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "none", "sadist", "submissive"]);
		slave.behavioralFlaw = jsSeededEither(getSeed(), ["anorexic", "arrogant", "bitchy", "devout", "gluttonous", "hates men", "hates men", "hates men", "hates women", "liberated", "none", "none", "none", "odd"]);

		if (slave.behavioralFlaw === "devout") {
			slave.sexualFlaw = jsSeededEither(getSeed(), ["apathetic", "crude", "judgemental", "none", "repressed", "shamefast"]);
		} else {
			slave.sexualFlaw = jsSeededEither(getSeed(), ["apathetic", "crude", "hates anal", "hates anal", "hates oral", "idealistic", "judgemental", "none", "none", "none", "none", "repressed", "shamefast"]);
		}
		if (slave.behavioralFlaw === "none" && jsRandom(1, 10, undefined, getSeed()) === 1) {
			slave.behavioralQuirk = jsSeededEither(getSeed(), ["adores men", "adores women", "advocate", "confident", "cutting", "fitness", "funny", "insecure", "sinful"]);
		}
		if (slave.sexualFlaw === "none" && jsRandom(1, 10, undefined, getSeed()) === 1) {
			slave.sexualQuirk = jsSeededEither(getSeed(), ["caring", "gagfuck queen", "painal queen", "perverted", "romantic", "size queen", "strugglefuck queen", "tease", "unflinching"]);
		}
	}

	function generateXXButt() {
		if (slave.physicalAge <= 11) {
			slave.butt = jsSeededEither(getSeed(), [1, 1, 1, 1, 1, 1, 1]);
		} else if (slave.physicalAge <= 12) {
			slave.butt = jsSeededEither(getSeed(), [1, 1, 1, 1, 1, 2, 2]);
		} else if (slave.physicalAge <= 13) {
			slave.butt = jsSeededEither(getSeed(), [1, 1, 1, 1, 2, 2, 2]);
		} else if (slave.physicalAge <= 14) {
			slave.butt = jsSeededEither(getSeed(), [1, 1, 1, 2, 2, 2, 3]);
		} else if (slave.physicalAge <= 15) {
			slave.butt = jsSeededEither(getSeed(), [1, 1, 2, 2, 2, 2, 3]);
		} else {
			switch (slave.race) {
				case "black":
					slave.butt = jsSeededEither(getSeed(), [1, 2, 2, 3, 3, 4, 4]);
					break;
				case "indo-aryan":
				case "malay":
				case "pacific islander":
				case "catgirl":
				case "amerindian":
				case "asian":
				case "middle eastern":
				case "semitic":
				case "southern european":
					slave.butt = jsSeededEither(getSeed(), [1, 2, 2, 3, 3]);
					break;
				default:
					slave.butt = jsSeededEither(getSeed(), [1, 2, 2, 3, 3, 4]);
			}
		}
		if (V.weightAffectsAssets !== 0) {
			if (slave.weight < -10 && slave.butt > 1) {
				slave.butt -= 1;
			} else if (slave.weight > 100 && slave.butt < 6) {
				slave.butt += jsRandom(1, 2, undefined, getSeed());
			} else if (slave.weight > 10 && slave.butt < 4) {
				slave.butt += 1;
			}
		}
		if (slave.physicalAge <= 13) {
			slave.anus = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 1]);
		} else if (slave.physicalAge <= 15) {
			slave.anus = jsSeededEither(getSeed(), [0, 0, 0, 0, 1, 1, 1]);
		} else if (slave.physicalAge <= 17) {
			slave.anus = jsSeededEither(getSeed(), [0, 0, 0, 1, 1, 1]);
		} else {
			slave.anus = jsSeededEither(getSeed(), [0, 0, 1, 1, 2]);
		}
		slave.analArea = slave.anus + jsSeededEither(getSeed(), [0, 0, 0, 1]);
	}

	function generateXYButt() {
		if (slave.physicalAge <= 13) {
			slave.butt = jsSeededEither(getSeed(), [1, 1, 1, 2, 2, 3, 3, 4]);
		} else {
			slave.butt = jsSeededEither(getSeed(), [1, 1, 2, 3]);
		}
		if (V.weightAffectsAssets !== 0) {
			if (slave.weight < -10 && slave.butt > 1) {
				slave.butt -= 1;
			} else if (slave.weight > 100 && slave.butt < 6) {
				slave.butt += jsRandom(1, 2, undefined, getSeed());
			} else if (slave.weight > 10 && slave.butt < 4) {
				slave.butt += 1;
			}
		}
		if (slave.attrXY > 0) {
			slave.anus = jsSeededEither(getSeed(), [0, 1, 2]);
		} else {
			if (slave.physicalAge <= 13) {
				slave.anus = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 1]);
			} else if (slave.physicalAge <= 15) {
				slave.anus = jsSeededEither(getSeed(), [0, 0, 0, 0, 1, 1, 1]);
			} else if (slave.physicalAge <= 17) {
				slave.anus = jsSeededEither(getSeed(), [0, 0, 0, 1, 1, 1]);
			} else {
				slave.anus = jsSeededEither(getSeed(), [0, 0, 1, 1, 2]);
			}
		}
		slave.analArea = slave.anus + jsSeededEither(getSeed(), [0, 0, 0, 1]);
	}

	function generateXXBoobs() {
		slave.natural.boobs = adjustBreastSize(slave, getSeed());
		if (slave.physicalAge <= 10) {
			slave.boobs = 100;
		} else if (slave.physicalAge === 11) {
			slave.boobs = jsSeededEither(getSeed(), [100, 100, 150, 150, 150, 300]);
		} else if (slave.physicalAge === 12) {
			slave.boobs = jsSeededEither(getSeed(), [100, 100, 150, 150, 150, 200, 200, 300]);
		} else if (slave.physicalAge === 13) {
			slave.boobs = jsSeededEither(getSeed(), [100, 150, 200, 200, 300, 300, 300, 400]);
		} else if (slave.physicalAge === 14) {
			slave.boobs = jsSeededEither(getSeed(), [100, 150, 200, 300, 300, 300, 350, 400, 400]);
		} else if (slave.physicalAge === 15) {
			slave.boobs = jsSeededEither(getSeed(), [150, 200, 300, 300, 300, 350, 350, 350, 400, 400, 450, 450]);
		} else {
			slave.boobs = slave.natural.boobs;
		}
		if (slave.boobs > slave.natural.boobs) { // To prevent children from generating higher than they should. Shouldn't be that common of a case.
			slave.boobs = slave.natural.boobs;
		}
	}

	function generateXYBoobs() {
		// Men have boob predisposition too, though it is not expressed.
		slave.natural.boobs = adjustBreastSize(slave, getSeed());
		if (slave.physicalAge <= 10) {
			slave.boobs = 100;
		} else if (slave.physicalAge === 11) {
			slave.boobs = jsSeededEither(getSeed(), [100, 100, 150]);
		} else if (slave.physicalAge === 12) {
			slave.boobs = jsSeededEither(getSeed(), [100, 100, 150, 150]);
		} else if (slave.physicalAge === 13) {
			slave.boobs = jsSeededEither(getSeed(), [100, 100, 150, 150, 200, 200]);
		} else if (slave.physicalAge === 14) {
			slave.boobs = jsSeededEither(getSeed(), [100, 100, 150, 150, 200, 200, 300]);
		} else if (slave.physicalAge === 15) {
			slave.boobs = jsSeededEither(getSeed(), [100, 100, 150, 150, 200, 200, 300, 300, 350, 350]);
		} else {
			slave.boobs = jsSeededEither(getSeed(), [100, 200, 200, 300, 300, 400, 500]);
		}
	}

	function generateXXFace() {
		slave.face = jsRandom(-60, 60, undefined, getSeed());
		if (jsRandom(0, 2, undefined, getSeed()) === 0) {
			slave.face = jsRandom(-10, 10, undefined, getSeed());
		}
		if (slave.physicalAge > 40) {
			slave.face -= jsRandom(0, 20, undefined, getSeed());
		} else if (slave.physicalAge > 35) {
			slave.face -= jsRandom(0, 10, undefined, getSeed());
		} else if (slave.physicalAge <= 20) {
			slave.face += jsRandom(0, 20, undefined, getSeed());
		} else if (slave.physicalAge <= 25) {
			slave.face += jsRandom(0, 10, undefined, getSeed());
		}
		if (slave.race === "catgirl") {
			slave.faceShape = "feline";
		} else if (slave.physicalAge > 10) {
			slave.faceShape = jsSeededEither(getSeed(), ["androgynous", "cute", "exotic", "normal", "normal", "sensual"]);
		} else {
			slave.faceShape = jsSeededEither(getSeed(), ["androgynous", "androgynous", "cute", "cute", "exotic", "normal", "normal", "sensual"]);
		}
		switch (slave.faceShape) {
			case "sensual":
			case "cute":
				slave.face += jsRandom(0, 20, undefined, getSeed());
				break;
			case "exotic":
			case "feline":
			case "androgynous":
				slave.face += jsRandom(-10, 10, undefined, getSeed());
				break;
			case "masculine":
				slave.face += jsRandom(-10, 0, undefined, getSeed());
		}
		if (slave.face >= 100 && slave.face >= jsRandom(-100000, 100, undefined, getSeed())) {
			slave.geneticQuirks.pFace = 2;
		} else if (slave.face <= -100 && slave.face <= jsRandom(-100, 100000, undefined, getSeed())) {
			slave.geneticQuirks.uFace = 2;
		}
	}

	function generateXYFace() {
		slave.face = jsRandom(-70, 20, undefined, getSeed());
		if (jsRandom(0, 2, undefined, getSeed()) === 0) {
			slave.face = jsRandom(-40, -10, undefined, getSeed());
		}
		if (slave.physicalAge > 40) {
			slave.face -= jsRandom(0, 20, undefined, getSeed());
		} else if (slave.physicalAge > 35) {
			slave.face -= jsRandom(0, 10, undefined, getSeed());
		} else if (slave.physicalAge <= 20) {
			slave.face += jsRandom(0, 20, undefined, getSeed());
		} else if (slave.physicalAge <= 25) {
			slave.face += jsRandom(0, 10, undefined, getSeed());
		}
		if (slave.race === "catgirl") {
			slave.faceShape = "feline";
		} else if (slave.physicalAge >= 17) {
			slave.faceShape = jsSeededEither(getSeed(), ["androgynous", "masculine", "masculine", "masculine"]);
		} else if (slave.physicalAge >= 15) {
			slave.faceShape = jsSeededEither(getSeed(), ["androgynous", "exotic", "masculine", "masculine", "masculine", "masculine", "masculine", "masculine", "masculine", "masculine", "normal", "sensual"]);
		} else if (slave.physicalAge >= 13) {
			slave.faceShape = jsSeededEither(getSeed(), ["androgynous", "cute", "exotic", "masculine", "masculine", "masculine", "normal", "sensual"]);
		} else if (slave.physicalAge >= 11) {
			slave.faceShape = jsSeededEither(getSeed(), ["androgynous", "cute", "exotic", "masculine", "normal", "normal", "sensual"]);
		} else {
			slave.faceShape = jsSeededEither(getSeed(), ["androgynous", "androgynous", "cute", "cute", "exotic", "normal", "normal", "sensual"]);
		}
		switch (slave.faceShape) {
			case "sensual":
			case "cute":
				slave.face += jsRandom(0, 20, undefined, getSeed());
				break;
			case "exotic":
			case "feline":
			case "androgynous":
				slave.face += jsRandom(-10, 10, undefined, getSeed());
				break;
			case "masculine":
				slave.face += jsRandom(-10, 0, undefined, getSeed());
		}
		if (slave.face >= 100 && slave.face >= jsRandom(-100000, 100, undefined, getSeed())) {
			slave.geneticQuirks.pFace = 2;
		} else if (slave.face <= -100 && slave.face <= jsRandom(-100, 100000, undefined, getSeed())) {
			slave.geneticQuirks.uFace = 2;
		}
	}

	function generateXXPregAdaptation() {
		if (slave.physicalAge <= 6) {
			slave.pregAdaptation = 5;
		} else if (slave.physicalAge <= 11) {
			slave.pregAdaptation = slave.physicalAge - 1;
		} else if (slave.physicalAge <= 14) {
			slave.pregAdaptation = 4 * (slave.physicalAge - 12) + 14;
		} else if (slave.physicalAge <= 15) {
			slave.pregAdaptation = 28;
		} else if (slave.physicalAge <= 16) {
			slave.pregAdaptation = 34;
		} else if (slave.physicalAge <= 17) {
			slave.pregAdaptation = 42;
		} else {
			slave.pregAdaptation = 50;
		}
	}

	function generateXYPregAdaptation() {
		if (slave.physicalAge <= 6) {
			slave.pregAdaptation = 5;
		} else if (slave.physicalAge <= 11) {
			slave.pregAdaptation = slave.physicalAge - 1;
		} else if (slave.physicalAge <= 15) {
			slave.pregAdaptation = 2 * (slave.physicalAge - 12) + 12;
		} else {
			slave.pregAdaptation = 20;
		}
	}

	function generateXXVoice() {
		if (slave.physicalAge <= 13) {
			slave.voice = jsSeededEither(getSeed(), [2, 2, 2, 3, 3, 3, 3, 3, 3]);
		} else if (slave.physicalAge <= 16) {
			slave.voice = jsSeededEither(getSeed(), [2, 2, 2, 2, 2, 3, 3, 3, 3]);
		} else {
			slave.voice = jsSeededEither(getSeed(), [1, 2, 2, 2, 2, 2, 2, 3, 3, 3]);
		}
	}

	function generateXYVoice() {
		if (slave.physicalAge <= 11) {
			slave.voice = jsSeededEither(getSeed(), [2, 2, 2, 3, 3, 3, 3, 3, 3]);
		} else if (slave.physicalAge <= 13) {
			slave.voice = jsSeededEither(getSeed(), [1, 1, 2, 2, 2, 2, 2, 3, 3]);
		} else if (slave.physicalAge <= 16) {
			slave.voice = jsSeededEither(getSeed(), [1, 1, 1, 2, 2, 2, 2, 2, 3]);
		} else {
			if (slave.balls > 2) {
				slave.voice = 1;
			} else if (slave.balls > 0) {
				slave.voice = jsSeededEither(getSeed(), [1, 1, 2]);
			} else {
				slave.voice = jsSeededEither(getSeed(), [1, 2, 2]);
			}
		}
	}

	function generateXXTeeth() {
		let femaleCrookedTeethGen = slave.intelligence + slave.intelligenceImplant;
		if (slave.nationality === "American") {
			femaleCrookedTeethGen += 20;
		} else if (["Andorran", "Antiguan", "Argentinian", "Aruban", "Australian", "Austrian", "Bahamian", "Bahraini", "Barbadian", "Belarusian", "Belgian", "Bermudian", "Brazilian", "British", "Bruneian", "Bulgarian", "Canadian", "Catalan", "Chilean", "a Cook Islander", "Croatian", "Curaçaoan", "Cypriot", "Czech", "Danish", "Dutch", "Emirati", "Estonian", "Finnish", "French", "German", "Greek", "Greenlandic", "Guamanian", "Hungarian", "Icelandic", "Irish", "Israeli", "Italian", "Japanese", "Kazakh", "Korean", "Kuwaiti", "Latvian", "a Liechtensteiner", "Lithuanian", "Luxembourgian", "Malaysian", "Maltese", "Mauritian", "Monégasque", "Montenegrin", "New Caledonian", "a New Zealander", "Niuean", "Norwegian", "Omani", "Palauan", "Panamanian", "Polish", "Portuguese", "Puerto Rican", "Qatari", "Romanian", "Russian", "Sammarinese", "Saudi", "Seychellois", "Singaporean", "Slovak", "Slovene", "Spanish", "Swedish", "Swiss", "Taiwanese", "Trinidadian", "Uruguayan", "Vatican"].includes(slave.nationality)) {
			/* do nothing */
		} else {
			femaleCrookedTeethGen -= 20;
		}

		if (jsRandom(0, femaleCrookedTeethGen, undefined, getSeed()) <= 15 && slave.physicalAge >= 12) {
			slave.teeth = jsSeededEither(getSeed(), ["crooked", "crooked", "crooked", "crooked", "crooked", "crooked", "crooked", "gapped"]);
		}

		if (slave.physicalAge < 6) {
			slave.teeth = "baby";
		} else if (slave.physicalAge < 12) {
			slave.teeth = "mixed";
		}
	}

	function generateXYTeeth() {
		let maleCrookedTeethGen = slave.intelligence + slave.intelligenceImplant;
		if (slave.nationality === "American") {
			maleCrookedTeethGen += 22;
		} else if (["Andorran", "Antiguan", "Argentinian", "Aruban", "Australian", "Austrian", "Bahamian", "Bahraini", "Barbadian", "Belarusian", "Belgian", "Bermudian", "Brazilian", "British", "Bruneian", "Bulgarian", "Canadian", "Catalan", "Chilean", "a Cook Islander", "Croatian", "Curaçaoan", "Cypriot", "Czech", "Danish", "Dutch", "Emirati", "Estonian", "Finnish", "French", "German", "Greek", "Greenlandic", "Guamanian", "Hungarian", "Icelandic", "Irish", "Israeli", "Italian", "Japanese", "Kazakh", "Korean", "Kuwaiti", "Latvian", "a Liechtensteiner", "Lithuanian", "Luxembourgian", "Malaysian", "Maltese", "Mauritian", "Monégasque", "Montenegrin", "New Caledonian", "a New Zealander", "Niuean", "Norwegian", "Omani", "Palauan", "Panamanian", "Polish", "Portuguese", "Puerto Rican", "Qatari", "Romanian", "Russian", "Sammarinese", "Saudi", "Seychellois", "Singaporean", "Slovak", "Slovene", "Spanish", "Swedish", "Swiss", "Taiwanese", "Trinidadian", "Uruguayan", "Vatican"].includes(slave.nationality)) {
			/* do nothing */
		} else {
			maleCrookedTeethGen -= 20;
		}

		if (jsRandom(0, maleCrookedTeethGen, undefined, getSeed()) <= 15 && slave.physicalAge >= 12) {
			slave.teeth = jsSeededEither(getSeed(), ["crooked", "crooked", "crooked", "crooked", "crooked", "crooked", "crooked", "gapped"]);
		}

		if (slave.physicalAge < 6) {
			slave.teeth = "baby";
		} else if (slave.physicalAge < 12) {
			slave.teeth = "mixed";
		}
	}

	function generateXXMods() {
		if (passage() !== "Starting Girls") {
			slave.piercing.ear.weight = jsSeededEither(getSeed(), [0, 1]);
			slave.piercing.nose.weight = jsSeededEither(getSeed(), [0, 0, 0, 1]);
			slave.piercing.eyebrow.weight = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 1]);
			slave.piercing.genitals.weight = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 1]);
			slave.piercing.lips.weight = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 1]);
			slave.piercing.navel.weight = jsSeededEither(getSeed(), [0, 0, 0, 1]);
			slave.piercing.nipple.weight = jsSeededEither(getSeed(), [0, 0, 0, 0, 1]);
		}
		if (slave.anus !== 0 && Math.random() < 0.25) {
			slave.anusTat = "bleached";
		}
	}

	function generateXYMods() {
		if (passage() !== "Starting Girls") {
			slave.piercing.ear.weight = jsSeededEither(getSeed(), [0, 0, 0, 1]);
			slave.piercing.nose.weight = jsSeededEither(getSeed(), [0, 0, 0, 0, 1]);
			slave.piercing.eyebrow.weight = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 1]);
			slave.piercing.genitals.weight = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 1]);
			slave.piercing.lips.weight = jsSeededEither(getSeed(), [0, 0, 0, 0, 0, 1]);
			slave.piercing.navel.weight = jsSeededEither(getSeed(), [0, 0, 0, 0, 1]);
			slave.piercing.nipple.weight = jsSeededEither(getSeed(), [0, 0, 0, 0, 1]);
		}
		if (slave.anus !== 0 && Math.random() < 0.25) {
			slave.anusTat = "bleached";
		}
	}

	function generateXXBodyHair() {
		slave.pubicHColor = slave.origHColor;
		slave.underArmHColor = slave.origHColor;
		slave.pubicHStyle = jsSeededEither(getSeed(), ["bald", "bald", "bushy in the front and neat in the rear", "bushy in the front and neat in the rear", "bushy in the front and neat in the rear", "bushy in the front and neat in the rear", "bushy", "bushy", "bushy", "bushy", "bushy", "hairless", "in a strip", "in a strip", "in a strip", "in a strip", "in a strip", "neat", "neat", "neat", "neat", "neat", "very bushy", "very bushy", "waxed", "waxed", "waxed", "waxed", "waxed", "waxed"]);
		slave.underArmHStyle = jsSeededEither(getSeed(), ["bald", "bald", "bushy", "bushy", "bushy", "hairless", "neat", "neat", "neat", "neat", "neat", "shaved", "shaved", "shaved", "shaved", "shaved", "waxed", "waxed", "waxed", "waxed"]);
		if ((slave.pubicHStyle === "hairless" || slave.underArmHStyle === "hairless") && Math.random() > 0.4) {
			slave.pubicHStyle = "hairless";
			slave.underArmHStyle = "hairless";
		}
		if (slave.origHColor === "blonde" && Math.random() > 0.85) {
			slave.eyebrowHColor = jsSeededEither(getSeed(), ["black", "brown", "brown", "brown", "brown"]);
			slave.overrideBrowHColor = 1;
		} else {
			slave.eyebrowHColor = slave.origHColor;
		}
		slave.eyebrowHStyle = jsSeededEither(getSeed(), ["bald", "curved", "curved", "curved", "curved", "curved", "curved", "curved", "elongated", "elongated", "elongated", "high-arched", "high-arched", "high-arched", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "rounded", "rounded", "rounded", "rounded", "rounded", "shaved", "shaved", "shortened", "shortened", "shortened", "slanted inwards", "slanted inwards", "slanted outwards", "slanted outwards", "straight", "straight", "straight", "straight", "straight", "straight"]);
		slave.eyebrowFullness = jsSeededEither(getSeed(), ["bushy", "bushy", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "pencil-thin", "pencil-thin", "tapered", "tapered", "tapered", "tapered", "thick", "thick", "thick", "thin", "thin", "thin", "threaded", "threaded", "threaded", "threaded"]);
	}

	function generateXYBodyHair() {
		slave.pubicHColor = slave.origHColor;
		slave.underArmHColor = slave.origHColor;
		slave.pubicHStyle = jsSeededEither(getSeed(), ["bald", "bald", "bushy in the front and neat in the rear", "bushy in the front and neat in the rear", "bushy in the front and neat in the rear", "bushy", "bushy", "bushy", "bushy", "bushy", "bushy", "hairless", "in a strip", "in a strip", "in a strip", "neat", "neat", "neat", "neat", "neat", "neat", "very bushy", "very bushy", "waxed", "waxed", "waxed", "waxed", "waxed", "waxed"]);
		slave.underArmHStyle = jsSeededEither(getSeed(), ["bald", "bald", "bushy", "bushy", "bushy", "bushy", "bushy", "hairless", "neat", "neat", "neat", "neat", "neat", "neat", "neat", "shaved", "shaved", "shaved", "shaved", "shaved", "waxed", "waxed", "waxed", "waxed"]);
		if ((slave.pubicHStyle === "hairless" || slave.underArmHStyle === "hairless") && Math.random() > 0.4) {
			slave.pubicHStyle = "hairless";
			slave.underArmHStyle = "hairless";
		}
		if (slave.origHColor === "blonde" && Math.random() > 0.85) {
			slave.eyebrowHColor = jsSeededEither(getSeed(), ["black", "brown", "brown", "brown", "brown"]);
			slave.overrideBrowHColor = 1;
		} else {
			slave.eyebrowHColor = slave.origHColor;
		}
		slave.eyebrowHStyle = jsSeededEither(getSeed(), ["bald", "curved", "curved", "curved", "curved", "curved", "elongated", "high-arched", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "rounded", "shaved", "shaved", "shortened", "slanted inwards", "slanted outwards", "straight", "straight", "straight", "straight", "straight", "straight"]);
		slave.eyebrowFullness = jsSeededEither(getSeed(), ["bushy", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "natural", "pencil-thin", "tapered", "tapered", "tapered", "thick", "thick", "thin", "thin", "threaded", "threaded", "threaded"]);
	}

	function generateXXGeneticQuirks() {
		chance = jsRandom(1, 1000, undefined, getSeed());
		if (chance >= 980) {
			slave.geneticQuirks.fertility = 2;
		} else if (chance >= 900) {
			slave.geneticQuirks.fertility = 1;
		}
		chance = jsRandom(1, 10000, undefined, getSeed());
		if (chance >= 9970) {
			slave.geneticQuirks.hyperFertility = 2;
		} else if (chance >= 9900) {
			slave.geneticQuirks.hyperFertility = 1;
		}
		if (jsRandom(1, 10000, undefined, getSeed()) >= 9900) {
			slave.geneticQuirks.potent = 1;
		}
		chance = jsRandom(1, 100000, undefined, getSeed());
		if (chance < 3) {
			slave.geneticQuirks.superfetation = 2;
		}
		if (V.dangerousPregnancy === 1) {
			chance = jsRandom(1, 15000, undefined, getSeed());
			if (chance >= 14900) {
				slave.geneticQuirks.polyhydramnios = 2;
			} else if (chance >= 14700) {
				slave.geneticQuirks.polyhydramnios = 1;
			}
		}
		chance = jsRandom(1, 100000, undefined, getSeed());
		if (chance < 3) {
			slave.geneticQuirks.uterineHypersensitivity = 2;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19950) {
			slave.geneticQuirks.albinism = 2;
		} else if (chance >= 19500) {
			slave.geneticQuirks.albinism = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19990) {
			slave.geneticQuirks.heterochromia = 2; // this is a placeholder value, which is converted to a color string by setGeneticEyeColor() later in generation
		} else if (chance >= 19750) {
			slave.geneticQuirks.heterochromia = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19980) {
			slave.geneticQuirks.rearLipedema = 2;
		} else if (chance >= 19850) {
			slave.geneticQuirks.rearLipedema = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19975) {
			slave.geneticQuirks.gigantomastia = 2;
		} else if (chance >= 19800) {
			slave.geneticQuirks.gigantomastia = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19900) {
			slave.geneticQuirks.macromastia = 2;
		} else if (chance >= 19500) {
			slave.geneticQuirks.macromastia = 1;
		}
		chance = jsRandom(1, 12000, undefined, getSeed());
		if (chance >= 11900) {
			slave.geneticQuirks.galactorrhea = 2;
		} else if (chance >= 11500) {
			slave.geneticQuirks.galactorrhea = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19975) {
			slave.geneticQuirks.dwarfism = 2;
		} else if (chance >= 19900) {
			slave.geneticQuirks.dwarfism = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19995) {
			slave.geneticQuirks.gigantism = 2;
		} else if (chance >= 19950) {
			slave.geneticQuirks.gigantism = 1;
		}
		// Progeria and neoteny never appear in normal slavegen
		if (V.seeAge === 1) {
			chance = jsRandom(1, 20000, undefined, getSeed());
			if (chance >= 19950) {
				slave.geneticQuirks.progeria = 1;
			}
			chance = jsRandom(1, 20000, undefined, getSeed());
			if (chance >= 19990 && slave.actualAge < 13) {
				slave.geneticQuirks.neoteny = 3;
			} else if (chance >= 19950) {
				slave.geneticQuirks.neoteny = 1;
			}
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19900) {
			slave.geneticQuirks.mGain = 2;
		} else if (chance >= 18500) {
			slave.geneticQuirks.mGain = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19950) {
			slave.geneticQuirks.mLoss = 2;
		} else if (chance >= 18500) {
			slave.geneticQuirks.mLoss = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19800) {
			slave.geneticQuirks.wGain = 2;
		} else if (chance >= 18500) {
			slave.geneticQuirks.wGain = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19850) {
			slave.geneticQuirks.wLoss = 2;
		} else if (chance >= 18500) {
			slave.geneticQuirks.wLoss = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19500) {
			slave.geneticQuirks.androgyny = 2;
		} else if (chance >= 19000) {
			slave.geneticQuirks.androgyny = 1;
		}
	}

	function generateXYGeneticQuirks() {
		chance = jsRandom(1, 10000, undefined, getSeed());
		if (chance >= 9750) {
			slave.geneticQuirks.wellHung = 2;
		} else if (chance >= 9500) {
			slave.geneticQuirks.wellHung = 1;
		}
		chance = jsRandom(1, 10000, undefined, getSeed());
		if (chance >= 9750) {
			slave.geneticQuirks.potent = 2;
		} else if (chance >= 9000) {
			slave.geneticQuirks.potent = 1;
		}
		chance = jsRandom(1, 1000, undefined, getSeed());
		if (chance >= 950) {
			slave.geneticQuirks.fertility = 1;
		}
		chance = jsRandom(1, 10000, undefined, getSeed());
		if (chance >= 9900) {
			slave.geneticQuirks.hyperFertility = 1;
		}
		chance = jsRandom(1, 100000, undefined, getSeed());
		if (chance < 3) {
			slave.geneticQuirks.uterineHypersensitivity = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19950) {
			slave.geneticQuirks.albinism = 2;
		} else if (chance >= 19500) {
			slave.geneticQuirks.albinism = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19990) {
			slave.geneticQuirks.heterochromia = 2; // this is a placeholder value, which is converted to a color string by setGeneticEyeColor() later in generation
		} else if (chance >= 19750) {
			slave.geneticQuirks.heterochromia = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance === 19999) {
			slave.geneticQuirks.rearLipedema = 2;
		} else if (chance < 10) {
			slave.geneticQuirks.rearLipedema = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19975) {
			slave.geneticQuirks.gigantomastia = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19900) {
			slave.geneticQuirks.macromastia = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19975) {
			slave.geneticQuirks.dwarfism = 2;
		} else if (chance >= 19900) {
			slave.geneticQuirks.dwarfism = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19995) {
			slave.geneticQuirks.gigantism = 2;
		} else if (chance >= 19950) {
			slave.geneticQuirks.gigantism = 1;
		}
		// Progeria and neoteny never appear in normal slavegen
		if (V.seeAge === 1) {
			chance = jsRandom(1, 20000, undefined, getSeed());
			if (chance >= 19950) {
				slave.geneticQuirks.progeria = 1;
			}
			chance = jsRandom(1, 20000, undefined, getSeed());
			if (chance >= 19990 && slave.actualAge < 13) {
				slave.geneticQuirks.neoteny = 3;
			} else if (chance >= 19950) {
				slave.geneticQuirks.neoteny = 1;
			}
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19875) {
			slave.geneticQuirks.mGain = 2;
		} else if (chance >= 18500) {
			slave.geneticQuirks.mGain = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19950) {
			slave.geneticQuirks.mLoss = 2;
		} else if (chance >= 18500) {
			slave.geneticQuirks.mLoss = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19900) {
			slave.geneticQuirks.wGain = 2;
		} else if (chance >= 18500) {
			slave.geneticQuirks.wGain = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19950) {
			slave.geneticQuirks.wLoss = 2;
		} else if (chance >= 18500) {
			slave.geneticQuirks.wLoss = 1;
		}
		chance = jsRandom(1, 20000, undefined, getSeed());
		if (chance >= 19200) {
			slave.geneticQuirks.androgyny = 2;
		} else if (chance >= 18500) {
			slave.geneticQuirks.androgyny = 1;
		}
	}

	function generateAge() {
		if (x.maxAge > 998) {
			x.maxAge = (V.pedoMode === 1) ? 18 : 42;
		} else if (V.pedoMode === 1 && x.ageOverridesPedoMode === 0 && x.maxAge > 18) {
			x.maxAge = 18;
		}
		x.maxAge = Math.min(V.retirementAge - 1, x.maxAge);
		x.minAge = Math.min(V.retirementAge - 1, x.minAge);
		if (x.minAge < V.minimumSlaveAge) {
			x.minAge = V.minimumSlaveAge;
		} else if (V.pedoMode === 1 && x.ageOverridesPedoMode === 0) {
			x.minAge = V.minimumSlaveAge;
		}
		if (x.maxAge >= 30 && FutureSocieties.isActive('FSMaturityPreferentialist') && x.mature === 1) {
			x.maxAge += 10;
		}
		x.maxAge = Math.max(x.maxAge, x.minAge);
		slave.actualAge = jsRandom(x.minAge, x.maxAge, undefined, getSeed());
		const secondAgeRoll = jsRandom(x.minAge, x.maxAge, undefined, getSeed());
		if (FutureSocieties.isActive('FSYouthPreferentialist') && V.arcologies[0].FSYouthPreferentialist >= jsRandom(1, 100, undefined, getSeed())) {
			slave.actualAge = Math.min(slave.actualAge, secondAgeRoll);
		} else if (FutureSocieties.isActive('FSMaturityPreferentialist') && V.arcologies[0].FSMaturityPreferentialist >= jsRandom(1, 100, undefined, getSeed())) {
			slave.actualAge = Math.max(slave.actualAge, secondAgeRoll);
		}
		if (slave.actualAge >= V.retirementAge) {
			slave.actualAge = (V.retirementAge - 2);
		}
		slave.visualAge = slave.actualAge;
		slave.physicalAge = slave.actualAge;
		slave.ovaryAge = slave.actualAge;
		slave.pubertyAgeXX = V.fertilityAge;
		slave.pubertyAgeXY = V.potencyAge;
	}

	function generateIntelligence() {
		const gaussian = gaussianPair(undefined, undefined, getSeed(), getSeed());
		slave.intelligence = Intelligence.random({seed1: getSeed(), seed2: getSeed()});
		if (V.AgePenalty === 1 && slave.actualAge <= 24) {
			if (gaussian[0] < gaussian[1] + slave.intelligence / 29 + (slave.actualAge - 24) / 8 - 0.35) {
				slave.intelligenceImplant = 15;
				if (slave.intelligenceImplant > 0 && jsRandom(15, 150, undefined, getSeed()) < slave.intelligence) {
					slave.intelligenceImplant = 30;
				}
			}
		} else {
			if (gaussian[0] < gaussian[1] + slave.intelligence / 29 - 0.35) {
				/* 40.23% chance if intelligence is 0, 99.26% chance if intelligence is 100 */
				slave.intelligenceImplant = 15;
				if (slave.intelligenceImplant > 0 && jsRandom(15, 150, undefined, getSeed()) < slave.intelligence) {
					slave.intelligenceImplant = 30;
				}
			}
		}
	}

	function generateCareer() {
		let seed = getSeed();
		if (V.AgePenalty === 1) {
			if (slave.actualAge < 16) {
				slave.career = (seed) ? jsSeededEither(seed, App.Data.Careers.General.veryYoung) : App.Data.Careers.General.veryYoung.random();
			} else if (slave.actualAge <= 24) {
				slave.career = (seed) ? jsSeededEither(seed, App.Data.Careers.General.young) : App.Data.Careers.General.young.random();
			} else if (slave.intelligenceImplant >= 15) {
				slave.career = (seed) ? jsSeededEither(seed, App.Data.Careers.General.educated) : App.Data.Careers.General.educated.random();
			} else {
				slave.career = (seed) ? jsSeededEither(seed, App.Data.Careers.General.uneducated) : App.Data.Careers.General.uneducated.random();
			}
		} else {
			if (slave.actualAge < 16) {
				slave.career = (seed) ? jsSeededEither(seed, App.Data.Careers.General.veryYoung) : App.Data.Careers.General.veryYoung.random();
			} else if (slave.intelligenceImplant >= 15) {
				slave.career = (seed) ? jsSeededEither(seed, App.Data.Careers.General.educated) : App.Data.Careers.General.educated.random();
			} else if (slave.actualAge <= 24) {
				slave.career = (seed) ? jsSeededEither(seed, App.Data.Careers.General.young) : App.Data.Careers.General.young.random();
			} else {
				slave.career = (seed) ? jsSeededEither(seed, App.Data.Careers.General.uneducated) : App.Data.Careers.General.uneducated.random();
			}
		}
	}

	function generateNationality() {
		if (x.race === 0) {
			if (x.nationality === 0) {
				slave.nationality = hashChoice(V.nationalities, getSeed());
			} else {
				slave.nationality = x.nationality;
			}
			nationalityToRace(slave, getSeed());
		} else {
			slave.race = x.race;
			if (x.nationality === 0) {
				raceToNationality(slave, getSeed());
			} else {
				slave.nationality = x.nationality;
			}
		}
	}

	function generateAccent() {
		nationalityToAccent(slave, getSeed());
		if ((slave.intelligenceImplant >= 15 || slave.intelligence > 95) && slave.accent >= 3 && slave.intelligence > jsRandom(0, 100, undefined, getSeed())) {
			slave.accent -= 1;
		}
	}

	function generateRacialTraits() {
		let lips = {
			min: 5,
			max: 25,
		};
		let origSkins = ["brown", "dark olive", "olive", "light olive", "tan", "light"];
		let origHColors = ["jet black", "black", "black", "black", "black", "dark brown", "brown", "chestnut"];
		/** @type {FC.HairStyle[]} */
		let hStyles = ["neat"];
		let eyeColors = ["blue", "brown", "green"];
		let heteroOnly = true;
		switch (slave.race) {
			case "black":
				lips.max = 30;
				origSkins = ["pure black", "ebony", "black", "dark brown", "brown"];
				origHColors = ["jet black", "black", "black", "black", "dark brown"];
				hStyles = ["afro", "neat"];
				eyeColors = ["brown"];
				break;
			case "white":
				if (["German", "Polish", "Danish", "Estonian", "Latvian", "Lithuanian"].includes(slave.nationality)) {
					origSkins = ["tan", "light", "light", "light", "fair", "fair", "fair", "fair", "pale", "very pale"];
					eyeColors = ["light grey", "blue", "blue", "blue", "blue", "blue", "blue", "brown", "brown", "green"];
					heteroOnly = false;
					origHColors = ["jet black", "black", "black", "dark brown", "dark brown", "brown", "brown", "brown", "chestnut", "chocolate brown", "amber", "golden", "golden", "blonde", "blonde", "platinum blonde", "red"];
				} else if (["Icelandic", "Norwegian"].includes(slave.nationality)) {
					origSkins = ["tan", "light", "light", "light", "fair", "fair", "fair", "pale", "pale", "very pale", "very pale"];
					eyeColors = ["light grey", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "brown", "green"];
					heteroOnly = false;
					origHColors = ["jet black", "black", "dark brown", "brown", "brown", "brown", "chestnut", "chocolate brown", "amber", "golden", "golden", "blonde", "blonde", "platinum blonde", "platinum blonde", "red"];
				} else if (["Swedish", "Finnish"].includes(slave.nationality)) {
					origSkins = ["tan", "light", "light", "fair", "fair", "fair", "fair", "pale", "pale", "pale", "very pale", "very pale"];
					eyeColors = ["light grey", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "blue", "brown", "green"];
					heteroOnly = false;
					origHColors = ["jet black", "black", "dark brown", "brown", "chestnut", "chocolate brown", "amber", "golden", "golden", "golden", "blonde", "blonde", "blonde", "platinum blonde", "platinum blonde", "platinum blonde", "red"];
				} else if (["Irish", "Scottish"].includes(slave.nationality)) {
					origSkins = ["light", "light", "fair", "fair", "fair", "pale", "pale", "pale", "very pale", "very pale", "very pale", "very pale"];
					eyeColors = ["light grey", "blue", "blue", "blue", "brown", "brown", "green", "green", "green"];
					heteroOnly = false;
					origHColors = ["jet black", "black", "dark brown", "brown", "brown", "chestnut", "chestnut", "chestnut", "chocolate brown", "amber", "golden", "golden", "blonde", "platinum blonde", "red", "red"];
				} else {
					origSkins = ["tan", "light", "light", "light", "fair", "fair", "fair", "pale", "very pale"];
					eyeColors = ["light grey", "blue", "blue", "blue", "blue", "blue", "blue", "brown", "brown", "brown", "green"];
					heteroOnly = false;
					origHColors = ["jet black", "jet black", "black", "black", "black", "dark brown", "dark brown", "dark brown", "dark brown", "brown", "brown", "brown", "brown", "chestnut", "chocolate brown", "amber", "golden", "blonde", "platinum blonde", "red"];
				}
				break;
			case "latina":
				origSkins = ["dark brown", "dark olive", "dark olive", "dark olive", "olive", "olive", "light olive", "light olive", "tan", "light"];
				origHColors = ["jet black", "black", "black", "dark brown", "dark brown", "brown"];
				eyeColors = ["blue", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "green"];
				heteroOnly = false;
				break;
			case "indo-aryan":
				if (["Iranian", "Pakistani", "Tajik", "Kazakh", "Kurdish", "Azerbaijani", "Syrian", "Kyrgyz", "Afghan", "Mongolian", "Turkmen", "Turkish", "Uzbek"].includes(slave.nationality) || (jsRandom(1, 8) === 1)) {
					origSkins = ["olive", "bronze", "tan", "light olive", "light olive", "light", "light", "fair"];
					if (jsRandom(1, 10, undefined, getSeed()) === 1) {
						origHColors = ["black", "dark brown", "brown", "chestnut", "blonde", "red"];
						eyeColors = ["light grey", "blue", "blue", "brown", "green", "green"];
						heteroOnly = false;
					} else {
						origHColors = ["jet black", "black", "black", "dark brown", "dark brown", "brown", "brown"];
						eyeColors = ["brown", "brown", "brown", "brown", "brown", "brown", "green"];
						heteroOnly = false;
					}
				} else {
					origSkins = ["ebony", "dark brown", "dark brown", "dark olive", "olive", "light olive", "tan", "light"];
					origHColors = ["jet black", "black", "black", "black", "dark brown"];
					eyeColors = ["brown"];
				}
				break;
			case "malay":
				origSkins = ["ebony", "black", "dark brown", "brown", "dark olive", "olive", "light olive", "light olive", "light", "fair"];
				origHColors = ["jet black", "jet black", "black", "black", "black", "dark brown"];
				eyeColors = ["brown"];
				break;
			case "pacific islander":
				origSkins = ["ebony", "black", "dark brown", "brown", "brown", "dark olive", "dark olive", "olive", "light olive", "light olive"];
				origHColors = ["jet black", "jet black", "black", "black", "black", "dark brown"];
				eyeColors = ["brown"];
				break;
			case "catgirl":
				origSkins = App.Medicine.Modification.catgirlNaturalSkins;
				origHColors = ["black", "white", "golden", "red", "brown"];
				hStyles = ["undercut", "neat"];
				slave.faceShape = "feline";
				eyeColors = ["light grey", "blue", "blue", "brown", "brown", "brown", "green"];
				heteroOnly = false;
				slave.earT = "cat";
				slave.earTNatural = 1;
				slave.tailShape = "cat";
				slave.tailColor = slave.hColor;
				slave.eye.right.pupil = "catlike";
				slave.eye.left.pupil = "catlike";
				break;
			case "amerindian":
				origSkins = ["dark brown", "brown", "dark olive", "olive", "light olive", "light olive"];
				origHColors = ["jet black", "jet black", "black", "black", "black", "dark brown"];
				eyeColors = ["brown"];
				break;
			case "asian":
				origSkins = ["dark olive", "bronze", "olive", "tan", "light olive", "light", "fair", "fair", "pale", "pale", "very pale", "very pale"];
				origHColors = ["jet black", "jet black", "jet black", "black", "black", "black", "dark brown"];
				eyeColors = ["blue", "brown", "green"];
				break;
			case "middle eastern":
			case "semitic":
				origSkins = ["brown", "dark olive", "tan", "tan", "tan", "light olive", "light olive", "light"];
				origHColors = ["jet black", "black", "black", "black", "dark brown", "dark brown", "dark brown"];
				eyeColors = ["blue", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "brown", "green"];
				heteroOnly = false;
				break;
			case "southern european":
				origSkins = ["dark olive", "olive", "olive", "light olive", "light olive", "light olive", "bronze", "tan", "light", "fair"];
				origHColors = ["jet black", "black", "black", "dark brown", "dark brown", "brown", "chestnut", "chocolate brown"];
				eyeColors = ["blue", "brown", "brown", "brown", "brown", "brown", "green"];
				heteroOnly = false;
				break;
			default:
				break;
		}
		slave.lips = jsRandom(lips.min, lips.max, undefined, getSeed());
		slave.origSkin = jsSeededEither(getSeed(), origSkins);
		slave.origHColor = jsSeededEither(getSeed(), origHColors);
		slave.hStyle = jsSeededEither(getSeed(), hStyles);
		eyeColor(eyeColors, heteroOnly);
		if (slave.origHColor === "red") {
			origHColors = ["chestnut", "auburn", "auburn", "auburn", "auburn", "ginger", "ginger", "copper", "copper", "red"];
			slave.origHColor = jsSeededEither(getSeed(), origHColors);
		}
		if (jsRandom(1, 100, undefined, getSeed()) <= V.seeRandomHair) {
			origHColors = ["amber", "auburn", "black", "blazing red", "blonde", "blue-violet", "blue", "brown", "burgundy", "chestnut", "chocolate brown", "copper", "dark blue", "dark brown", "dark orchid", "deep red", "ginger", "golden", "green-yellow", "green", "grey", "hazel", "jet black", "neon blue", "neon green", "neon pink", "pink", "platinum blonde", "purple", "rainbow", "red", "sea green", "silver", "strawberry-blonde", "white"];
			slave.origHColor = jsSeededEither(getSeed(), origHColors);
			if (jsRandom(1, 3, undefined, getSeed()) === 1) {
				slave.eyebrowHColor = slave.origHColor;
			}
		}
		if ((skinToneLevel(slave.origSkin) > 5) && (skinToneLevel(slave.origSkin) < 10)) { // pale to fair
			if (jsRandom(1, 4, undefined, getSeed()) === 1) {
				/** @type {FC.Markings[]} */
				let markings = ["beauty mark", "beauty mark", "birthmark", "birthmark", "freckles", "freckles", "freckles", "heavily freckled"];
				slave.markings = jsSeededEither(getSeed(), markings);
			}
		} else if (jsRandom(1, 8, undefined, getSeed()) === 1) {
			/** @type {FC.Markings[]} */
			let markings = ["beauty mark", "birthmark"];
			slave.markings = jsSeededEither(getSeed(), markings);
		}

		/**
		 * @param {string[]} colors
		 * @param {boolean} [heteroOnly]
		 */
		function eyeColor(colors, heteroOnly = false) {
			if (!heteroOnly) {
				setGeneticEyeColor(slave, jsSeededEither(getSeed(), colors));
			}
			if (slave.geneticQuirks.heterochromia === 2) {
				setGeneticEyeColor(slave, jsSeededEither(getSeed(), colors), true);
			}
		}
	}

	function generateBoobTweaks() {
		if (V.weightAffectsAssets !== 0) {
			if (slave.weight < -10 && slave.boobs > 200) {
				slave.boobs -= 100;
			} else if (slave.weight > 190 && slave.boobs < 3000) {
				slave.boobs += (jsRandom(3, 8, undefined, getSeed()) * 100);
			} else if (slave.weight > 160 && slave.boobs < 1500) {
				slave.boobs += (jsRandom(2, 6, undefined, getSeed()) * 100);
			} else if (slave.weight > 130 && slave.boobs < 1500) {
				slave.boobs += (jsRandom(1, 4, undefined, getSeed()) * 100);
			} else if (slave.weight > 95 && slave.boobs < 1200) {
				slave.boobs += (jsRandom(1, 3, undefined, getSeed()) * 100);
			} else if (slave.weight > 30 && slave.boobs < 1000) {
				slave.boobs += 100;
			}
		}

		/** @type {Array<FC.BreastShape>} */
		const BoobShapeGen = [];
		if (slave.boobs.isBetween(250, 800)) {
			BoobShapeGen.push("perky");
			BoobShapeGen.push("downward-facing");
		}
		if (slave.boobs.isBetween(400, 1200)) {
			BoobShapeGen.push("torpedo-shaped");
			BoobShapeGen.push("wide-set");
		}
		if (slave.boobs > 800 && slave.physicalAge > jsRandom(10, 50, undefined, getSeed())) {
			BoobShapeGen.push("saggy");
		}
		if (slave.boobsImplant / slave.boobs >= 0.90) {
			BoobShapeGen.push("spherical");
		}
		if (BoobShapeGen.length === 1) {
			if (Math.random() < 0.5) {
				slave.boobShape = jsSeededEither(getSeed(), BoobShapeGen);
			}
		} else if (BoobShapeGen.length > 1) {
			if (jsRandom(1, 3, undefined, getSeed()) !== 1) {
				slave.boobShape = jsSeededEither(getSeed(), BoobShapeGen);
			}
		}

		if (slave.boobShape === "spherical") {
			slave.nipples = jsSeededEither(getSeed(), ["flat", "flat", "flat", "huge", "tiny", "tiny"]);
		} else if (slave.boobs < 250) {
			slave.nipples = jsSeededEither(getSeed(), ["cute", "cute", "partially inverted", "puffy", "tiny", "tiny", "tiny", "tiny"]);
		} else if (slave.boobs < 500) {
			slave.nipples = jsSeededEither(getSeed(), ["cute", "cute", "cute", "partially inverted", "puffy", "tiny"]);
		} else if (slave.boobs < 1000) {
			slave.nipples = jsSeededEither(getSeed(), ["cute", "cute", "cute", "inverted", "partially inverted", "puffy", "puffy", "tiny"]);
		} else {
			slave.nipples = jsSeededEither(getSeed(), ["cute", "huge", "inverted", "partially inverted", "puffy"]);
		}
	}

	function generateSkills() {
		slave.skill.vaginal = (slave.vagina <= 0 ? 0 : jsRandom(0, 15, undefined, getSeed()));
		slave.skill.anal = (slave.anus === 0 ? 0 : jsRandom(0, 15, undefined, getSeed()));
		if (slave.pubertyXY === 1 || slave.attrXX > 70) {
			slave.skill.penetrative = jsRandom(10, 35, undefined, getSeed());
		} else {
			slave.skill.penetrative = (canAchieveErection(slave) || slave.clit >= 3 ? jsRandom(0, 15, undefined, getSeed()) : 0);
		}
		slave.skill.oral = jsRandom(0, 15, undefined, getSeed());
		slave.skill.entertainment = jsRandom(0, 15, undefined, getSeed());
		slave.skill.whoring = jsRandom(0, 15, undefined, getSeed());
	}

	function generateDisabilities() {
		if (slave.physicalAge >= jsRandom(0, 100, undefined, getSeed())) {
			eyeSurgery(slave, "both", "blur");
		}
		if (slave.physicalAge >= jsRandom(30, 100, undefined, getSeed())) {
			slave.hears = -1;
		}
		if (V.seeExtreme === 1) {
			const disList = [];
			disList.push("hearNot");
			disList.push("seeNot");
			disList.push("speakNot");
			disList.push("smellNot");
			disList.push("tasteNot");
			let disableCount = 0;
			if (x.disableDisability === 0) {
				while (disList.length > 0) {
					const rolled = jsSeededEither(getSeed(), disList);
					switch (rolled) {
						case "hearNot":
							if ((jsRandom(1, 100, undefined, getSeed()) - (disableCount * 2)) > 90) {
								slave.hears = -2;
							}
							disList.deleteAll("hearNot");
							disableCount++;
							break;
						case "seeNot":
							if ((jsRandom(1, 100, undefined, getSeed()) - (disableCount * 2)) > 90) {
								eyeSurgery(slave, "both", "blind");
							}
							disList.deleteAll("seeNot");
							disableCount++;
							break;
						case "speakNot":
							if ((jsRandom(1, 100, undefined, getSeed()) - (disableCount * 2)) > 90) {
								slave.voice = 0;
							}
							disList.deleteAll("speakNot");
							disableCount++;
							break;
						case "smellNot":
							if ((jsRandom(1, 100, undefined, getSeed()) - (disableCount * 2)) > 90) {
								slave.smells = -1;
							}
							disList.deleteAll("smellNot");
							disableCount++;
							break;
						case "tasteNot":
							if ((jsRandom(1, 100, undefined, getSeed()) - (disableCount * 2)) > 90) {
								slave.tastes = -1;
							}
							disList.deleteAll("tasteNot");
							disableCount++;
							break;
					}
				}
			}
		}
	}

	function generateGeneticQuirkTweaks() {
		if (slave.geneticQuirks.albinism === 2) {
			slave.albinismOverride = makeAlbinismOverride(slave.race);
		}
		if (slave.geneticQuirks.rearLipedema === 2) {
			slave.butt += jsRandom(0.2 * slave.physicalAge, 0.5 * slave.physicalAge, undefined, getSeed());
			slave.butt = Math.clamp(slave.butt, 0, 24);
		}
		if (slave.geneticQuirks.macromastia === 3) {
			if (slave.pubertyXX > 0) {
				if (jsRandom(1, 10, undefined, getSeed()) > 3) {
					slave.geneticQuirks.macromastia = 2;
				}
			}
		}
		if (slave.geneticQuirks.macromastia === 2) {
			slave.boobs += jsRandom(slave.physicalAge, 3 * slave.physicalAge, undefined, getSeed()) * 100;
			slave.boobs = Math.clamp(slave.boobs, 300, 5000);
		}
		if (slave.geneticQuirks.gigantomastia === 3) {
			if (slave.pubertyXX > 0) {
				if (jsRandom(1, 10, undefined, getSeed()) > 3) {
					slave.geneticQuirks.gigantomastia = 2;
				}
			}
		}
		if (slave.geneticQuirks.gigantomastia === 2) {
			slave.boobs += jsRandom(slave.physicalAge, 20 * slave.physicalAge, undefined, getSeed()) * 100;
			if (slave.geneticQuirks.macromastia === 2) {
				slave.boobs = Math.clamp(slave.boobs, 300, 100000);
			} else {
				slave.boobs = Math.clamp(slave.boobs, 300, 25000);
			}
		}
		if (slave.geneticQuirks.mGain === 2) {
			slave.muscles += jsRandom(10, 50, undefined, getSeed());
			slave.muscles = Math.clamp(slave.muscles, -100, 100);
		}
		if (slave.geneticQuirks.mLoss === 2) {
			slave.muscles -= jsRandom(10, 50, undefined, getSeed());
			slave.muscles = Math.clamp(slave.muscles, -100, 100);
		}
		if (slave.geneticQuirks.wGain === 2) {
			slave.weight += jsRandom(10, 50, undefined, getSeed());
			slave.weight = Math.clamp(slave.weight, -100, 200);
			slave.weightDirection = 1;
		}
		if (slave.geneticQuirks.wLoss === 2) {
			slave.weight -= jsRandom(10, 50, undefined, getSeed());
			slave.weight = Math.clamp(slave.weight, -100, 200);
			slave.weightDirection = -1;
		}
		if (slave.geneticQuirks.androgyny === 2) {
			slave.faceShape = "androgynous";
			if (slave.face < 60) {
				slave.face += 15;
			}
		}
	}

	function generateHormones() {
		// PubertyXX and PubertyXY == 1 at this point should guarantee functioning sex organs of the appropriate type
		if (slave.genes === "XX") {
			if (slave.pubertyXX === 1) {
				if (slave.pubertyXY === 1) {
					slave.hormoneBalance = 20;
				} else {
					slave.hormoneBalance = 60;
				}
			} else {
				if (slave.pubertyXY === 1) {
					slave.hormoneBalance = -20;
				} else {
					slave.hormoneBalance = 20;
				}
			}
		} else if (slave.genes === "XY") {
			if (slave.pubertyXX === 1) {
				if (slave.pubertyXY === 1) {
					slave.hormoneBalance = 20;
				} else {
					slave.hormoneBalance = 40;
				}
			} else {
				if (slave.pubertyXY === 1) {
					slave.hormoneBalance = -40;
				} else {
					slave.hormoneBalance = 20;
				}
			}
		}
	}

	return GenerateNewSlave;
})();

globalThis.generateSalonModifications = function(slave) {
	/* hair dyes*/
	if ((jsRandom(1, 50) === 1) || ((jsRandom(1, 20) === 1) && ["southern european", "white"].includes(slave.race))) {
		slave.hColor = jsEither(["amber", "auburn", "black", "black", "blonde", "blonde", "blonde", "brown", "chestnut", "chocolate brown", "copper", "dark brown", "ginger", "golden", "jet black", "platinum blonde", "platinum blonde"]);
		if (jsRandom(1, 10) === 1 || (["black", "brown", "chestnut", "chocolate brown", "dark brown", "jet black"].includes(slave.hColor) && jsRandom(1, 10) !== 1)) {
			slave.eyebrowHColor = slave.hColor;
		}
		slave.overrideHColor = 1;
	} else if ((jsRandom(1, 100) === 1) || ((jsRandom(1, 20) === 1) && ["a barber", "a barista", "a bimbo", "a blogger", "a camgirl", "a camwhore", "a cheerleader", "a child actress", "a clown", "a club recruiter", "a cocktail waitress", "a comedian", "a cosmetologist", "a dominatrix", "a gang member", "a house DJ", "a juvenile delinquent", "a magician's assistant", "a medium", "a mime", "a musician", "a party girl", "a poet", "a political activist", "a porn star", "a radio show host", "a stage magician", "a street performer", "a stripper", "a student", "a video game streamer", "an actress", "an artist", "an aspiring pop star", "an idol"].includes(slave.career))) {
		slave.hColor = jsEither(["blazing red", "blue-violet", "blue", "burgundy", "dark blue", "deep red", "green-yellow", "green", "grey", "ivory", "neon blue", "neon green", "neon pink", "pink", "platinum blonde", "platinum blonde", "purple", "red", "sea green", "silver"]);
		if (jsRandom(1, 3) === 1) {
			slave.eyebrowHColor = slave.hColor;
		}
		slave.overrideHColor = 1;
	}
	if (jsRandom(1, 6) === 1) {
		slave.pubicHColor = slave.hColor;
		slave.underArmHColor = slave.hColor;
	}

	/* hair style*/
	if ((["black", "mixed race"].includes(slave.race) && (jsRandom(1, 3) === 1)) || (jsRandom(1, 15) === 1)) {
		slave.hStyle = jsEither(["dreadlocks", "cornrows", "afro"]);
	} else if (jsRandom(1, 5) === 1) {
		slave.hStyle = jsEither(["curled", "bun", "luxurious", "permed"]);
	} else if (jsRandom(1, 2) === 1) {
		slave.hStyle = jsEither(["braided", "eary", "messy bun", "tails", "ponytail", "messy", "strip", "up"]);
	}
	if (jsRandom(1, 3) === 1) {
		slave.hLength += jsRandom(-10, 10);
		if (slave.hLength < 10) {
			if (slave.hLength === 1) {
				slave.hStyle = "buzzcut";
			} else if (slave.hLength < 1) {
				slave.hStyle = "shaved";
				slave.hLength = 0;
			} else {
				slave.hLength = 10;
			}
		}
	}

	/* sun and spray tanning */
	if (skinToneLevel(slave.origSkin) < 13) {
		if ((jsRandom(1, 40) === 1) || (["a bimbo", "an exotic dancer", "a trophy wife", "a party girl"].includes(slave.career) && (jsRandom(1, 10) === 1))) {
			slave.skin = "spray tanned";
		} else if (skinToneLevel(slave.origSkin) > 3) {
			let tanChance = jsRandom(1, 50);
			if (["Swedish"].includes(slave.nationality) || ["southern european", "latina", "indo-aryan", "middle eastern", "semitic"].includes(slave.race)) {
				tanChance += 5;
			}
			/* certain jobs being more likely to expose you to harmful solar radiation*/
			if (["a beggar", "a bimbo", "a construction worker", "a courier", "a delivery woman", "a farm laborer", "a farmer's daughter", "a farmer", "a farmhand", "a gardener", "a lifeguard", "a personal trainer", "a rancher", "a shepherd", "a street performer", "a street vendor", "a student athlete", "a tour guide", "a trophy wife", "an athlete", "an exotic dancer", "homeless"].includes(slave.career)) {
				tanChance += 10;
			}
			/* certain areas expose people to more harmful solar radiation*/
			if (["Africa", "Australia", "South America", "the Middle East"].includes(V.continent)) {
				tanChance += 5;
			}
			tanChance += (skinToneLevel(slave.origSkin) - 8);
			if (tanChance >= 45) {
				slave.skin = "sun tanned";
			}
		}
	}
};
