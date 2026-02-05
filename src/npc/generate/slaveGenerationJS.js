/**
 * @param {FC.HumanState} slave
 * @param {number|string} [seed=undefined]
 */
globalThis.nationalityToRace = function(slave, seed) {
	slave.race = hashChoice(App.Data.misc.raceSelector[slave.nationality] || App.Data.misc.raceSelector[""], seed);
};

/**
 * @param {FC.HumanState} slave
 * @param {number|string} [seed=undefined]
 */
globalThis.raceToNationality = function(slave, seed) {
	seed = seed ?? generateNewID();
	/* consider this placeholder until raceNationalities gets fixed up */
	slave.nationality = hashChoice(V.nationalities, seed);
	/* Maximum of 100 attempts */
	let i = 0;
	for (; App.Data.misc.raceSelector[slave.nationality] && !(slave.race in App.Data.misc.raceSelector[slave.nationality]) && i < 100; i++) {
		seed = iterateSeed(seed);
		slave.nationality = hashChoice(V.nationalities, seed);
	}
	/* No success after 100 attempts, so just randomize according to race */
	if (App.Data.misc.raceSelector[slave.nationality] && !(slave.race in App.Data.misc.raceSelector[slave.nationality]) && i === 100) {
		if (slave.race in App.Data.misc.nationalitiesByRace) {
			slave.nationality = hashChoice(App.Data.misc.nationalitiesByRace[slave.race], iterateSeed(seed));
		} else {
			slave.nationality = "Stateless";
		}
	}
};

/**
 * @param {string} nationality
 * @param {FC.Race} race
 * @param {boolean} male
 * @param {(name: string) => boolean} [filter] Default: allow all
 * @param {number|string} [seed=undefined]
 * @returns {string}
 */
globalThis.generateName = function(nationality, race, male, filter = _.stubTrue, seed) {
	const lookup = (male ? App.Data.misc.malenamePoolSelector : App.Data.misc.namePoolSelector);
	/** @type {string} */
	const result = jsSeededEither(
		seed,
		(lookup[`${nationality}.${race}`] || lookup[nationality] ||
			(male ? App.Data.misc.whiteAmericanMaleNames : App.Data.misc.whiteAmericanSlaveNames)).filter(filter));
	/* fallback for males without specific male name sets: return female name */
	if (male && !result) {
		return generateName(nationality, race, false, undefined, seed);
	}
	return result;
};

/**
 * @param {string} nationality
 * @param {FC.Race} race
 * @param {boolean} male
 * @param {(name: string) => boolean} [filter] Default: allow all
 * @param {number|string} [seed=undefined]
 * @returns {FC.Zeroable<string>}
 */
globalThis.generateSurname = function(nationality, race, male, filter = _.stubTrue, seed) {
	/** @type {string} */
	const result = jsSeededEither(
		seed,
		(App.Data.misc.surnamePoolSelector[`${nationality}.${race}`] ||
			App.Data.misc.surnamePoolSelector[nationality] ||
			App.Data.misc.whiteAmericanSlaveSurnames).filter(filter));
	if (male) {
		/* see if we have male equivalent of that surname, and return that if so */
		const maleLookup = App.Data.misc.maleSurnamePoolSelector[`${nationality}.${race}`] || App.Data.misc.maleSurnamePoolSelector[nationality];
		if (maleLookup && maleLookup[result]) {
			return maleLookup[result];
		}
	}
	return result || 0;
};

/**
 * @param {string} name
 * @param {string} nationality
 * @param {any} race
 * @returns {boolean}
 */
globalThis.isMaleName = function(name, nationality, race) {
	const names = App.Data.misc.malenamePoolSelector[`${nationality}.${race}`] ||
		App.Data.misc.malenamePoolSelector[nationality] ||
		App.Data.misc.whiteAmericanMaleNames;
	return names && names.includes(name);
};

/**
 * @param {FC.SlaveState} slave
 * @param {number|string} [nameSeed=undefined]
 * @param {number|string} [surnameSeed1=undefined]
 * @param {number|string} [surnameSeed2=undefined]
 */
globalThis.nationalityToName = function(slave, nameSeed, surnameSeed1, surnameSeed2) {
	function useDoubleSurname() {
		const hispanic = ["Spanish", "Catalan", "Andorran", "Mexican", "Costa Rican", "Salvadoran", "Guatemalan", "Honduran", "Nicaraguan", "Panamanian", "Cuban", "Dominican", "Puerto Rican", "Argentinian", "Bolivian", "Chilean", "Colombian", "Ecuadorian", "Paraguayan", "Peruvian", "Uruguayan", "Venezuelan", "Equatoguinean", "Filipina"].includes(slave.nationality);
		const lusitanic = ["Portuguese", "Brazilian", "Angolan", "Cape Verdean", "Bissau-Guinean", "Mozambican", "São Toméan", "East Timorese"].includes(slave.nationality);
		// keep original hispanic/lusitanian double surname if the slave probably had one, AND if the arcology uses them by convention
		// order doesn't matter for new slaves, just grab any two appropriate surnames
		return (hispanic || lusitanic) && (V.surnameScheme === 7 || V.surnameScheme === 8);
	}
	const male = (slave.genes === "XY");

	slave.birthName = generateName(slave.nationality, slave.race, male, undefined, nameSeed);
	slave.birthSurname = generateSurname(slave.nationality, slave.race, male, undefined, surnameSeed1);
	if (useDoubleSurname()) {
		slave.birthSurname += " " + generateSurname(slave.nationality, slave.race, male, undefined, surnameSeed2);
	}
	if (male && isMaleName(slave.birthName, slave.nationality, slave.race) && !V.allowMaleSlaveNames) {
		slave.slaveName = generateName(slave.nationality, slave.race, false, undefined, nameSeed);
	} else {
		slave.slaveName = slave.birthName;
	}
	slave.slaveSurname = slave.birthSurname;
	if (V.useFSNames === 1) {
		if (V.FSNamePref === 0) {
			if (V.arcologies[0].FSChattelReligionist > 20) {
				slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.chattelReligionistSlaveNames);
				slave.slaveSurname = 0;
			} else if (V.arcologies[0].FSRomanRevivalist > 20) {
				slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.romanSlaveNames);
				slave.slaveSurname = jsSeededEither(surnameSeed1, App.Data.misc.romanSlaveSurnames);
			} else if (V.arcologies[0].FSAztecRevivalist > 20) {
				slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.aztecSlaveNames);
				slave.slaveSurname = 0;
			} else if (V.arcologies[0].FSEgyptianRevivalist > 20) {
				slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.ancientEgyptianSlaveNames);
				slave.slaveSurname = 0;
			} else if (V.arcologies[0].FSEdoRevivalist > 20) {
				slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.edoSlaveNames);
				slave.slaveSurname = jsSeededEither(surnameSeed1, App.Data.misc.edoSlaveSurnames);
			} else if (V.arcologies[0].FSAntebellumRevivalist > 20) {
				slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.antebellumSlaveNames);
				slave.slaveSurname = jsSeededEither(surnameSeed1, App.Data.misc.antebellumSlaveSurnames);
			} else if (FutureSocieties.isActive('FSDegradationist')) {
				DegradingName(slave);
			}
		} else if (V.FSNamePref === 1) {
			slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.chattelReligionistSlaveNames);
			slave.slaveSurname = 0;
		} else if (V.FSNamePref === 2) {
			slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.romanSlaveNames);
			slave.slaveSurname = jsSeededEither(surnameSeed1, App.Data.misc.romanSlaveSurnames);
		} else if (V.FSNamePref === 3) {
			slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.aztecSlaveNames);
			slave.slaveSurname = 0;
		} else if (V.FSNamePref === 4) {
			slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.ancientEgyptianSlaveNames);
			slave.slaveSurname = 0;
		} else if (V.FSNamePref === 5) {
			slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.edoSlaveNames);
			slave.slaveSurname = jsSeededEither(surnameSeed1, App.Data.misc.edoSlaveSurnames);
		} else if (V.FSNamePref === 6) {
			DegradingName(slave);
		} else if (V.FSNamePref === 7) {
			PaternalistName(slave);
		} else if (V.FSNamePref === 8) {
			slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.bimboSlaveNames);
			slave.slaveSurname = 0;
		} else if (V.FSNamePref === 9) {
			slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.cowSlaveNames);
			slave.slaveSurname = 0;
		} else if (V.FSNamePref === 10) {
			slave.slaveName = jsSeededEither(nameSeed, App.Data.misc.antebellumSlaveNames);
			slave.slaveSurname = jsSeededEither(surnameSeed1, App.Data.misc.antebellumSlaveSurnames);
		}
	}
};

/**
 * @param {FC.SlaveState} slave
 * @param {number|string} [seed=undefined]
 */
globalThis.nationalityToAccent = function(slave, seed) {
	const naturalAccent = jsSeededEither(seed, [0, 1, 1, 2, 2, 2, 3, 3, 3, 3]);

	switch (slave.nationality) {
		case "Afghan":
			if (V.language === "Pashto") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Dari") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Persian") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Albanian":
			slave.accent = naturalAccent;
			break;
		case "Algerian":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "American":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1, 1, 2]);
			} else if (V.language === "Spanish" && slave.race === "latina") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Chinese" && slave.race === "asian") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Arabic" && slave.race === "middle eastern") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Andorran":
			slave.accent = (V.language === "Catalan") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Angolan":
			slave.accent = (V.language === "Portuguese") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Antiguan":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Argentinian":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Armenian":
			if (V.language === "Russian") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Aruban":
			if (V.language === "Dutch") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Portuguese") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Australian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Austrian":
			if (V.language === "German") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Serbian") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Slovene") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Turkish" && slave.race === "indo-aryan") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Azerbaijani":
			slave.accent = naturalAccent;
			break;
		case "Bahamian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Bahraini":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Bangladeshi":
			if (V.language === "Bengali") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Hindi") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Barbadian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Belarusian":
			slave.accent = (V.language === "Russian") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Belgian":
			if (V.language === "Dutch") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "German") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Belizean":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Beninese":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Bermudian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Bhutanese":
			slave.accent = (V.language === "Dzongkha") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Bissau-Guinean":
			slave.accent = (V.language === "Portuguese") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Bolivian":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Bosnian":
			if (V.language === "Croatian") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Serbian") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Brazilian":
			if (V.language === "Portuguese") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Spanish") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "British":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Hindi" && slave.race === "indo-aryan") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Bruneian":
			if (V.language === "Malay") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Bulgarian":
			slave.accent = naturalAccent;
			break;
		case "Burkinabé":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Burmese":
			slave.accent = naturalAccent;
			break;
		case "Burundian":
			slave.accent = (V.language === "Kirundi") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Cambodian":
			if (V.language === "Khmer") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Cham") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Cameroonian":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Canadian":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Cape Verdean":
			slave.accent = (V.language === "Portuguese") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Catalan":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Central African":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Chadian":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Chilean":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Chinese":
			if (V.language === "Tibetan") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Korean") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Kazakh") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Colombian":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Comorian":
			if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Congolese":
			if (V.language === "Lingala") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Kikongo") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "a Cook Islander":
			if (V.language === "Cook Islands Māori") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Costa Rican":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Croatian":
			if (V.language === "Bosnian") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Serbian") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Cuban":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Curaçaoan":
			if (V.language === "Dutch") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Portuguese") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Cypriot":
			if (V.language === "Greek") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Turkish") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Czech":
			if (V.language === "Slovak") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Vietnamese" && slave.race === "asian") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Danish":
			slave.accent = naturalAccent;
			break;
		case "Djiboutian":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Dominican":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Dominiquais":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Dutch":
			slave.accent = naturalAccent;
			break;
		case "East Timorese":
			if (V.language === "Tetum") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Portuguese") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Malay") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Ecuadorian":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Egyptian":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Emirati":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Equatoguinean":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Eritrean":
			if (V.language === "Tigrinya") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Estonian":
			slave.accent = (V.language === "Russian") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Ethiopian":
			if (V.language === "Amharic") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Tigrinya") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Fijian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Filipina":
			if (V.language === "Filipino") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Tagalog") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Spanish") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Finnish":
			slave.accent = (V.language === "Swedish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "French":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Spanish") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "German") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Arabic" && slave.race === "middle eastern") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Catalan") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "French Guianan":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "French Polynesian":
			if (V.language === "Tahitian") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Chinese") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Gabonese":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Gambian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Georgian":
			slave.accent = (V.language === "Abkhaz") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "German":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Turkish" && slave.race === "indo-aryan") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Ghanan":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Hausa") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Greek":
			slave.accent = naturalAccent;
			break;
		case "Greenlandic":
			slave.accent = (V.language === "Danish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Grenadian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Guamanian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Guatemalan":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Guinean":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Guyanese":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Haitian":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Honduran":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Hungarian":
			if (V.language === "German") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "I-Kiribati":
			if (V.language === "Gilbertese") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Icelandic":
			if (V.language === "Danish") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Indian":
			if (V.language === "Hindi") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Indonesian":
			if (V.language === "Javanese") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Malay") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Iranian":
			if (V.language === "Persian") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Iraqi":
			if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Kurdish") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Irish":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Israeli":
			if (V.language === "Hebrew") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Yiddish") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Italian":
			slave.accent = naturalAccent;
			break;
		case "Ivorian":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Jamaican":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Japanese":
			slave.accent = naturalAccent;
			break;
		case "Jordanian":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Kazakh":
			slave.accent = (V.language === "Russian") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Kenyan":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Kittitian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Korean":
			slave.accent = (V.language === "Chinese") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Kosovan":
			if (V.language === "Albanian") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Serbian") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Kurdish":
			if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Turkish") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Kuwaiti":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Kyrgyz":
			slave.accent = (V.language === "Russian") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Laotian":
			if (V.language === "Lao") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Khmu") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Latvian":
			slave.accent = naturalAccent;
			break;
		case "Lebanese":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Liberian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Libyan":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "a Liechtensteiner":
			slave.accent = (V.language === "German") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Lithuanian":
			slave.accent = naturalAccent;
			break;
		case "Luxembourgian":
			if (V.language === "Luxembourgish") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "German") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Macedonian":
			slave.accent = naturalAccent;
			break;
		case "Malagasy":
			if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Malawian":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Chichewa") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Malaysian":
			slave.accent = (V.language === "Malay") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Maldivian":
			slave.accent = naturalAccent;
			break;
		case "Malian":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Maltese":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Italian") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Marshallese":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Mauritanian":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Mauritian":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Mexican":
			if (V.language === "Spanish") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Nahuatl" && slave.race === "amerindian") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Micronesian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Moldovan":
			slave.accent = (V.language === "Russian") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Monégasque":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Mongolian":
			slave.accent = naturalAccent;
			break;
		case "Montenegrin":
			slave.accent = (V.language === "Serbian") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Moroccan":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Mosotho":
			slave.accent = (V.language === "Sesotho") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Motswana":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Mozambican":
			if (V.language === "Portuguese") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Makhuwa") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Sena") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Swahili") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Namibian":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Afrikaans") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Nauruan":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Nepalese":
			if (V.language === "Nepali") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Maithili") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Bhojpuri") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "New Caledonian":
			if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Nengone") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Drehu") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "a New Zealander":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Māori" && slave.race === "pacific islander") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Ni-Vanuatu":
			if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Nicaraguan":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Nigerian":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Hausa") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Nigerien":
			if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Hausa") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Niuean":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Norwegian":
			slave.accent = naturalAccent;
			break;
		case "Omani":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Pakistani":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Palauan":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Sonsorolese") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Tobian") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Japanese") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Palestinian":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Panamanian":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Papua New Guinean":
			slave.accent = naturalAccent;
			break;
		case "Paraguayan":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Peruvian":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Polish":
			slave.accent = naturalAccent;
			break;
		case "Portuguese":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Puerto Rican":
			if (V.language === "Spanish") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Qatari":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Romanian":
			slave.accent = naturalAccent;
			break;
		case "Russian":
			slave.accent = naturalAccent;
			break;
		case "Rwandan":
			slave.accent = (V.language === "Kinyarwanda") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Sahrawi":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Saint Lucian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Salvadoran":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Sammarinese":
			slave.accent = (V.language === "Italian") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Samoan":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "São Toméan":
			slave.accent = (V.language === "Portuguese") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Saudi":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Scottish":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Senegalese":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Serbian":
			if (V.language === "Bosnian") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Serbian") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Seychellois":
			if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Sierra Leonean":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Singaporean":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Chinese") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Malay") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Tamil") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Slovak":
			slave.accent = (V.language === "Czech") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Slovene":
			slave.accent = naturalAccent;
			break;
		case "a Solomon Islander":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Somali":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "South African":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Afrikaans") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Dutch") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "South Sudanese":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Spanish":
			slave.accent = (V.language === "Catalan") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Sri Lankan":
			if (V.language === "Sinhalese") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Tamil") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Sudanese":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Surinamese":
			slave.accent = (V.language === "Dutch") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Swazi":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Afrikaans") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Tsonga") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Zulu") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Swedish":
			if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Finnish") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Norwegian") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "German") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Swiss":
			if (V.language === "German") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Italian") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Syrian":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Taiwanese":
			slave.accent = (V.language === "Chinese") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Tajik":
			slave.accent = (V.language === "Russian") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Tanzanian":
			slave.accent = (V.language === "Swahili") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Thai":
			if (V.language === "Chinese") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Malay") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Khmer") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Tibetan":
			slave.accent = (V.language === "Chinese") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Togolese":
			slave.accent = (V.language === "French") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Tongan":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Trinidadian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Tunisian":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Turkish":
			if (V.language === "Arabic") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Kurdish") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "Zaza") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Turkmen":
			slave.accent = (V.language === "Russian") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Tuvaluan":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Ugandan":
			slave.accent = (V.language === "Swahili") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Ukrainian":
			slave.accent = (V.language === "Russian") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Uruguayan":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Uzbek":
			slave.accent = (V.language === "Russian") ? jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]) : naturalAccent;
			break;
		case "Vatican":
			if (V.language === "Italian") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Latin") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "German") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Venezuelan":
			slave.accent = (V.language === "Spanish") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Vietnamese":
			if (V.language === "Chinese") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 2, 2, 2, 3, 3]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Vincentian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Yemeni":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Zairian":
			if (V.language === "Lingala") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Kikongo") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Swahili") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "French") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Zambian":
			slave.accent = (V.language === "English") ? jsSeededEither(seed, [0, 1, 1, 1, 1, 2]) : naturalAccent;
			break;
		case "Zimbabwean":
			if (V.language === "Shona") {
				slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
			} else if (V.language === "Ndebele") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "Chewa") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else if (V.language === "English") {
				slave.accent = jsSeededEither(seed, [0, 1, 1, 1, 1, 2]);
			} else {
				slave.accent = naturalAccent;
			}
			break;
		case "Ancient Chinese Revivalist":
			slave.accent = (V.language === "Chinese") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Ancient Egyptian Revivalist":
			slave.accent = (V.language === "Ancient Egyptian") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Arabian Revivalist":
			slave.accent = (V.language === "Arabic") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Aztec Revivalist":
			slave.accent = (V.language === "Nahuatl") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Edo Revivalist":
			slave.accent = (V.language === "Japanese") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		case "Roman Revivalist":
			slave.accent = (V.language === "Latin") ? jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]) : naturalAccent;
			break;
		default:
			slave.accent = naturalAccent;
			break;
	}

	if (slave.nationality === V.language) {
		slave.accent = jsSeededEither(seed, [0, 0, 0, 0, 0, 0, 1]);
	}
};

/**
 * @param {FC.SlaveState} slave
 * @param {number|string} [seed=undefined]
 */
globalThis.randomizeAttraction = function(slave, seed) {
	const sexuality = jsRandom(0, 100, undefined, seed);
	let attraction = Math.clamp(slave.energy * 2, 60, 180);

	if (slave.balls > 0) {
		if (sexuality > 90) {
			slave.attrXY = Math.clamp(attraction, 0, 100);
			attraction -= slave.attrXY;
			slave.attrXX = Math.clamp(attraction, 0, 100);
		} else if (sexuality > 70) {
			seed = iterateSeed(seed);
			slave.attrXY = Math.clamp(attraction + jsRandom(-5, 5, undefined, seed), 0, 100);
			seed = iterateSeed(seed);
			slave.attrXX = Math.clamp(attraction + jsRandom(-5, 5, undefined, seed), 0, 100);
		} else {
			slave.attrXX = Math.clamp(attraction, 0, 100);
			attraction -= slave.attrXX;
			slave.attrXY = Math.clamp(attraction, 0, 100);
		}
	} else {
		if (sexuality > 90) {
			slave.attrXX = Math.clamp(attraction, 0, 100);
			attraction -= slave.attrXX;
			slave.attrXY = Math.clamp(attraction, 0, 100);
		} else if (sexuality > 60) {
			seed = iterateSeed(seed);
			slave.attrXY = Math.clamp(attraction + jsRandom(-5, 5, undefined, seed), 0, 100);
			seed = iterateSeed(seed);
			slave.attrXX = Math.clamp(attraction + jsRandom(-5, 5, undefined, seed), 0, 100);
		} else {
			slave.attrXY = Math.clamp(attraction, 0, 100);
			attraction -= slave.attrXY;
			slave.attrXX = Math.clamp(attraction, 0, 100);
		}
	}
	seed = iterateSeed(seed);
	slave.attrXX = Math.clamp(slave.attrXX + jsRandom(-5, 5, undefined, seed), 0, 100);
	seed = iterateSeed(seed);
	slave.attrXY = Math.clamp(slave.attrXY + jsRandom(-5, 5, undefined, seed), 0, 100);
};

/**
 * @param {number|string} [seed=undefined]
 * @returns {FC.SlaveState}
 */
globalThis.baseSlave = function(seed) {
	return new App.Entity.SlaveState(seed);
};

/**
 * @param {FC.SlaveState} slave*/
globalThis.generatePronouns = function(slave) {
	if (slave.fuckdoll > 0) {
		slave.pronoun = App.Data.Pronouns.Kind.toy;
	} else if (slave.dick > 0 && slave.vagina === -1 && V.diversePronouns === 1) {
		slave.pronoun = App.Data.Pronouns.Kind.male;
	} else {
		slave.pronoun = App.Data.Pronouns.Kind.female;
	}
};

/**
 * @param {FC.SlaveState} slave
 */
globalThis.generatePuberty = function(slave) {
	if (((slave.ovaries === 1 || slave.mpreg === 1) && slave.physicalAge >= slave.pubertyAgeXX) || slave.pubertyXX === 1) {
		slave.pubertyXX = 1;
		if (V.menstruation === 1 && slave.geneticQuirks.superfetation < 2) {
			slave.fertPeak = jsRandom(0, 3);
		}
	} else {
		if (slave.preg >= -1) {
			slave.preg = 0;
		}
		slave.pubertyXX = 0;
	}
	if ((slave.balls > 0 && slave.ballType !== "sterile" && slave.physicalAge >= slave.pubertyAgeXY) || slave.pubertyXY === 1) {
		slave.pubertyXY = 1;
	} else {
		slave.pubertyXY = 0;
	}
};

/**
 * Apply the effects of an age lift (make them appear younger than they do currently)
 * @param {FC.HumanState} slave
 */
globalThis.applyAgeImplant = function(slave) {
	if (slave.visualAge >= 25) {
		slave.ageImplant = 1;
		/* roughly: 25 -> 19, 35 -> 25, 50 -> 32, 80 -> 40, 130 -> 50 */
		slave.visualAge = Math.round(18.5 * Math.log(slave.visualAge) - 40);
	}
};

/**
 * Makes someone appear older than they do currently
 * @param {FC.HumanState} slave
 */
globalThis.applyAgeImplantOlder = function(slave) {
	if (slave.visualAge < 80) {
		// doesn't currently set ageImplant
		/* roughly: 5 -> 20, 35 -> 45, 50 -> 56, 60 -> 64, 79 -> 80 */
		slave.visualAge = Math.round(0.8 * slave.visualAge + 16);
	}
};

/**
 * Determine whether a given market should apply SMR laws or not.
 * @param {FC.Zeroable<FC.SlaveMarketName | FC.SpecialMarketName>} [market]
 * @returns {boolean}
 */
globalThis.applyLawCheck = function(market) {
	return (typeof market === "string" && !App.Data.misc.lawlessMarkets.includes(market));
};
