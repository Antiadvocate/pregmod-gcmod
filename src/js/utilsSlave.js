// cSpell:ignore rapee, arousingly, Boobie, Fuckee, Unhearing, assed, GMILF, ress, Basotho, SHOX, tgirl, Koreas, istan, cabo, Eswatini, Leste, Côte d'Ivoire, Türkiye

/**
 * Height.mean(nationality, race, genes, age) - returns the mean height for the given combination and age in years (>=2)
 * Height.mean(nationality, race, genes) - returns the mean adult height for the given combination
 * Height.mean(slave) - returns the mean (expected) height for the given slave
 *
 * Height.random(slave[, options]) - returns a random height for the given slave using the skew-normal distribution.
 *										The additional options object can modify how the values are generated
 *										in the same way setting them as global configuration would, but only for this
 *										specific generation.
 *
 *										Example: Only generate above-average heights based on a certain slave:
 *										Height.random(slave, {limitMult: [0, 5]})
 *
 * Height.forAge(height, age, genes) - returns the height adapted to the age and genes
 * Height.forAge(height, slave) - returns the height adapted to the slave's age and genes
 *
 * Height.config(configuration) - configures the random height generator globally and returns the current configuration
 *
 * Anon's explanation:
 *
 * Skew, spread, limitMult: These are statistics things. BTW, a gaussian distribution is a normal distribution. Just a naming thing.
 *
 * Skew: The shape parameter of a skew-normal distribution. See http://azzalini.stat.unipd.it/SN/Intro/intro.html for more details. Basically a measure of how asymmetrical the curve is. It doesn't move the main mass of the distribution. Rather, it's more like it moves mass from one of the tails into the main mass of the distribution.
 *
 * Spread: Changes the average distance from the mean, making the graph wider and shorter. Moves "mass" from the center to the tail. It's basically standard deviation, but named funny because FC codebase. Changing this can have dramatic effects. It's advised to keep this at or below 0.1 for usual height generation.
 *
 * limitMult: A clamp, expressed in z-score. (z=1 is one standard dev above mean, for ex.) If it excludes too much of the distribution the other parameters describe, you're going to spend lots of CPU making and throwing away heights. Don't worry about this unless you run into it.
 *
 * There's also limitHeight which you're not using. It's basically limitMult in different units.
 */
globalThis.Height = (function() {
	/**
	 * @typedef {object} heightConfig
	 * @property {[number, number]} limitMult Limit to the values the underlying (normal) random generator returns.
	 *      In normal use, the values are almost never reached; only 0.27% of values are outside this range and need to
	 *      be regenerated. With higher skew (see below), this might change.
	 * @property {number} skew The random values generated are multiplied by this and added to 1 to generate the final
	 *      height multiplier. The default value together with the default limitMult means that the generated height
	 *      will always fall within (1 - 0.05 * 3) = 85% and (1 + 0.05 * 3) = 115% of the mean height.
	 * 	    Minimum value: 0.001; maximum value: 0.5
	 * @property {number} spread How much the height distribution skews to the right (positive) or left (negative) side
	 *      of the height.
	 * 	    Minimum value: -1000, maximum value: 1000
	 * @property {[number, number]} limitHeight Limit the resulting height range.
	 *      Warning: A small height limit range paired with a high spread value results in the generator having to do
	 *      lots of work generating and re-generating random heights until one "fits".
	 * @property {number|string} [seed1=undefined]
	 * @property {number|string} [seed2=undefined]
	 */

	/**
	 * Global configuration (for different game modes/options/types)
	 * @type {heightConfig}
	 */
	const defaultConfig = {
		limitMult: [-3.0, 3.0],
		skew: 0.0,
		spread: 0.05,
		limitHeight: [0, 999],
		seed1: undefined,
		seed2: undefined,
	};

	/**
	 * Configuration method for the above values
	 * WARNING: Make sure you handle new game/loading saves appropriately when using to change global state!
	 * @param {Partial<heightConfig>} [conf]
	 * @returns {heightConfig}
	 */
	function _config(conf) {
		if (conf) {
			Object.assign(defaultConfig, conf);
		}
		return defaultConfig;
	}

	/* if you can find an average for an undefined, add it in! */
	const xxMeanHeight = {
		"Afghan": 155.08,
		"Albanian": 161.77,
		"Algerian": 159.09,
		"American.asian": 158.4,
		"American.black": 163.6,
		"American.latina": 158.9,
		"American.white": 165,
		"American": 163.54,
		"Andorran": 162.9,
		"Angolan": 157.31,
		"Antiguan": 160.65,
		"Argentinian": 159.18,
		"Armenian": 158.09,
		"Aruban": 158,
		"Australian": 165.86,
		"Austrian": 164.62,
		"Azerbaijani": 158.25,
		"Bahamian": 160.68,
		"Bahraini": 156.69,
		"Bangladeshi": 150.79,
		"Barbadian": 165.28,
		"Belarusian": 166.35,
		"Belgian": 165.49,
		"Belizean": 156.88,
		"Beninese": 156.16,
		"Bermudian": 160.69,
		"Bhutanese": 153.63,
		"Bissau-Guinean": 158.24,
		"Bolivian": 153.89,
		"Bosnian": 165.85,
		"Brazilian": 160.86,
		"British": 164.4,
		"Bruneian": 153.98,
		"Bulgarian": 164.8,
		"Burkinabé": 160.19,
		"Burmese": 154.37,
		"Burundian": 154.02,
		"Cambodian": 152.91,
		"Cameroonian": 158.82,
		"Canadian": 163.91,
		"Cape Verdean": 161.65,
		"Catalan": 163.4,
		"Central African": 158.04,
		"Chadian": 160.17,
		"Chilean": 159.36,
		"Chinese": 159.71,
		"Colombian": 156.85,
		"Comorian": 155.58,
		"Congolese": 157.57,
		"a Cook Islander": 163.19,
		"Costa Rican": 156.37,
		"Croatian": 165.63,
		"Cuban": 157.98,
		"Curaçaoan": 158,
		"Cypriot": 162.27,
		"Czech": 168.46,
		"Danish": 167.21,
		"Djiboutian": 156.11,
		"Dominican": 159.03,
		"Dominiquais": 164.34,
		"Dutch": 168.72,
		"East Timorese": 151.15,
		"Ecuadorian": 154.23,
		"Egyptian": 157.33,
		"Emirati": 158.68,
		"Equatoguinean": 157.33,
		"Eritrean": 156.39,
		"Estonian": 168.67,
		"Ethiopian": 155.71,
		"Fijian": 161.69,
		"Filipina": 149.6,
		"Finnish": 165.9,
		"French Guianan": 157,
		"French Polynesian": 164.52,
		"French": 164.88,
		"Gabonese": 158.84,
		"Gambian": 160.93,
		"Georgian": 162.98,
		"German": 165.86,
		"Ghanan": 157.91,
		"Greek": 164.87,
		"Greenlandic": 161.55,
		"Grenadian": 164.51,
		"Guamanian": 153.7,
		"Guatemalan": 149.39,
		"Guinean": 157.8,
		"Guyanese": 157.92,
		"Haitian": 158.72,
		"Honduran": 153.84,
		"Hungarian": 163.66,
		"I-Kiribati": 157,
		"Icelandic": 165.95,
		"Indian": 152.59,
		"Indonesian": 152.8,
		"Iranian": 159.67,
		"Iraqi": 158.67,
		"Irish": 165.11,
		"Israeli": 161.8,
		"Italian": 164.61,
		"Ivorian": 158.07,
		"Jamaican": 163.12,
		"Japanese": 158.31,
		"Jordanian": 158.83,
		"Kazakh": 158.58,
		"Kenyan": 158.16,
		"Kittitian": 159.2,
		"Korean": 160.65,
		"Kosovan": 165.7,
		"Kurdish": 165,
		"Kuwaiti": 159.43,
		"Kyrgyz": 159.35,
		"Laotian": 151.28,
		"Latvian": 169.8,
		"Lebanese": 162.43,
		"Liberian": 157.3,
		"Libyan": 162.08,
		"a Liechtensteiner": 164.3,
		"Lithuanian": 166.61,
		"Luxembourgian": 164.43,
		"Macedonian": 159.75,
		"Malagasy": 151.18,
		"Malawian": 154.4,
		"Malaysian": 156.3,
		"Maldivian": 155.02,
		"Malian": 160.47,
		"Maltese": 160.85,
		"Marshallese": 151.31,
		"Mauritanian": 157.72,
		"Mauritian": 157.24,
		"Mexican": 156.85,
		"Micronesian": 156.09,
		"Moldovan": 163.24,
		"Monégasque": 164.61,
		"Mongolian": 158.22,
		"Montenegrin": 164.86,
		"Moroccan": 157.82,
		"Mosotho": 155.71,
		"Motswana": 161.38,
		"Mozambican": 153.96,
		"Namibian": 158.78,
		"Nauruan": 153.98,
		"Nepalese": 150.86,
		"New Caledonian": 158,
		"a New Zealander": 164.94,
		"Ni-Vanuatu": 158.17,
		"Nicaraguan": 154.39,
		"Nigerian": 156.32,
		"Nigerien": 158.25,
		"Niuean": 164.8,
		"Norwegian": 165.56,
		"Omani": 157.19,
		"Pakistani": 153.84,
		"Palauan": 156.22,
		"Palestinian": 158.75,
		"Panamanian": 155.47,
		"Papua New Guinean": 154.87,
		"Paraguayan": 159.86,
		"Peruvian": 152.93,
		"Polish": 164.59,
		"Portuguese": 163.04,
		"Puerto Rican": 159.2,
		"Qatari": 159.38,
		"Romanian": 162.73,
		"Russian": 165.27,
		"Rwandan": 154.79,
		"Sahrawi": 157.82,
		"Saint Lucian": 162.31,
		"Salvadoran": 154.55,
		"Sammarinese": 164.61,
		"Samoan": 161.97,
		"São Toméan": 158.91,
		"Saudi": 155.88,
		"Scottish": 163,
		"Senegalese": 162.52,
		"Serbian": 167.69,
		"Seychellois": 162.08,
		"Sierra Leonean": 156.6,
		"Singaporean": 160.32,
		"Slovak": 167.47,
		"Slovene": 166.05,
		"a Solomon Islander": 154.42,
		"Somali": 156.06,
		"South African": 158.03,
		"South Sudanese": 169,
		"Spanish": 163.4,
		"Sri Lankan": 154.56,
		"Sudanese": 156.04,
		"Surinamese": 160.66,
		"Swazi": 158.64,
		"Swedish": 165.7,
		"Swiss": 163.45,
		"Syrian": 158.65,
		"Taiwanese": 161.45,
		"Tajik": 157.33,
		"Tanzanian": 156.6,
		"Thai": 157.87,
		"Tibetan": 158.75,
		"Togolese": 158.3,
		"Tongan": 165.52,
		"Trinidadian": 160.64,
		"Tunisian": 160.35,
		"Turkish": 160.5,
		"Turkmen": 161.73,
		"Tuvaluan": 158.1,
		"Ugandan": 156.72,
		"Ukrainian": 166.34,
		"Uruguayan": 162.13,
		"Uzbek": 157.82,
		"Vatican": 162.5,
		"Venezuelan": 157.44,
		"Vietnamese": 153.59,
		"Vincentian": 160.7,
		"Yemeni": 153.97,
		"Zairian": 155.25,
		"Zambian": 155.82,
		"Zimbabwean": 158.22,
		"": 159.65, // default
	};
	const xyMeanHeight = {
		"Afghan": 165.26,
		"Albanian": 173.39,
		"Algerian": 170.07,
		"American.asian": 172.5,
		"American.black": 177.4,
		"American.latina": 172.5,
		"American.white": 178.2,
		"American": 177.13,
		"Andorran": 176.06,
		"Angolan": 167.31,
		"Antiguan": 164.8,
		"Argentinian": 174.62,
		"Armenian": 172,
		"Aruban": 165.1,
		"Australian": 179.2,
		"Austrian": 177.41,
		"Azerbaijani": 169.75,
		"Bahamian": 172.75,
		"Bahraini": 167.74,
		"Bangladeshi": 163.81,
		"Barbadian": 175.92,
		"Belarusian": 178.44,
		"Belgian": 181.7,
		"Belizean": 168.73,
		"Beninese": 167.06,
		"Bermudian": 172.69,
		"Bhutanese": 165.31,
		"Bissau-Guinean": 167.9,
		"Bolivian": 166.85,
		"Bosnian": 180.87,
		"Brazilian": 173.55,
		"British": 177.49,
		"Bruneian": 165.01,
		"Bulgarian": 178.24,
		"Burkinabé": 169.33,
		"Burmese": 164.67,
		"Burundian": 166.64,
		"Cambodian": 163.33,
		"Cameroonian": 167.82,
		"Canadian": 178.09,
		"Cape Verdean": 173.22,
		"Catalan": 175.8,
		"Central African": 166.67,
		"Chadian": 170.44,
		"Chilean": 171.81,
		"Chinese": 171.83,
		"Colombian": 169.5,
		"Comorian": 166.19,
		"Congolese": 167.45,
		"a Cook Islander": 174.77,
		"Costa Rican": 168.93,
		"Croatian": 180.78,
		"Cuban": 172,
		"Curaçaoan": 165.1,
		"Cypriot": 174.99,
		"Czech": 180.1,
		"Danish": 181.39,
		"Djiboutian": 166.57,
		"Dominican": 172.75,
		"Dominiquais": 176.31,
		"Dutch": 182.54,
		"East Timorese": 159.79,
		"Ecuadorian": 167.08,
		"Egyptian": 166.68,
		"Emirati": 170.46,
		"Equatoguinean": 167.36,
		"Eritrean": 168.36,
		"Estonian": 181.59,
		"Ethiopian": 166.23,
		"Fijian": 173.9,
		"Filipina": 163.23,
		"Finnish": 179.59,
		"French Guianan": 168,
		"French Polynesian": 177.41,
		"French": 179.74,
		"Gabonese": 167.94,
		"Gambian": 165.4,
		"Georgian": 174.34,
		"German": 179.88,
		"Ghanan": 168.85,
		"Greek": 177.32,
		"Greenlandic": 174.87,
		"Grenadian": 176.97,
		"Guamanian": 169.8,
		"Guatemalan": 163.41,
		"Guinean": 167.54,
		"Guyanese": 170.21,
		"Haitian": 172.64,
		"Honduran": 166.39,
		"Hungarian": 177.26,
		"I-Kiribati": 169.2,
		"Icelandic": 180.49,
		"Indian": 164.95,
		"Indonesian": 163.55,
		"Iranian": 170.3,
		"Iraqi": 170.43,
		"Irish": 178.93,
		"Israeli": 176.86,
		"Italian": 177.77,
		"Ivorian": 166.53,
		"Jamaican": 174.53,
		"Japanese": 170.82,
		"Jordanian": 171.03,
		"Kazakh": 171.14,
		"Kenyan": 169.64,
		"Kittitian": 169.62,
		"Korean": 173.46,
		"Kosovan": 179.5,
		"Kurdish": 175,
		"Kuwaiti": 172.07,
		"Kyrgyz": 171.24,
		"Laotian": 160.52,
		"Latvian": 181.42,
		"Lebanese": 174.39,
		"Liberian": 163.66,
		"Libyan": 173.53,
		"a Liechtensteiner": 175.4,
		"Lithuanian": 179.03,
		"Luxembourgian": 177.86,
		"Macedonian": 178.33,
		"Malagasy": 161.55,
		"Malawian": 166,
		"Malaysian": 167.89,
		"Maldivian": 167.68,
		"Malian": 171.3,
		"Maltese": 173.32,
		"Marshallese": 162.81,
		"Mauritanian": 163.28,
		"Mauritian": 170.5,
		"Mexican": 169.01,
		"Micronesian": 168.51,
		"Moldovan": 175.49,
		"Monégasque": 177.77,
		"Mongolian": 169.07,
		"Montenegrin": 178.28,
		"Moroccan": 170.4,
		"Mosotho": 165.59,
		"Motswana": 171.63,
		"Mozambican": 164.8,
		"Namibian": 166.96,
		"Nauruan": 167.83,
		"Nepalese": 162.32,
		"New Caledonian": 171,
		"a New Zealander": 177.74,
		"Ni-Vanuatu": 168.09,
		"Nicaraguan": 166.71,
		"Nigerian": 165.91,
		"Nigerien": 167.68,
		"Niuean": 175.83,
		"Norwegian": 179.75,
		"Omani": 169.16,
		"Pakistani": 166.95,
		"Palauan": 167.69,
		"Palestinian": 172.09,
		"Panamanian": 168.49,
		"Papua New Guinean": 163.57,
		"Paraguayan": 172.83,
		"Peruvian": 165.23,
		"Polish": 177.33,
		"Portuguese": 172.93,
		"Puerto Rican": 172.08,
		"Qatari": 170.48,
		"Romanian": 174.74,
		"Russian": 176.46,
		"Rwandan": 162.68,
		"Sahrawi": 170.4,
		"Saint Lucian": 171.95,
		"Salvadoran": 169.77,
		"Sammarinese": 177.77,
		"Samoan": 174.38,
		"São Toméan": 167.38,
		"Saudi": 167.67,
		"Scottish": 177.6,
		"Senegalese": 173.14,
		"Serbian": 180.57,
		"Seychellois": 174.21,
		"Sierra Leonean": 164.41,
		"Singaporean": 172.57,
		"Slovak": 179.5,
		"Slovene": 179.8,
		"a Solomon Islander": 164.14,
		"Somali": 166.6,
		"South African": 166.68,
		"South Sudanese": 175.9,
		"Spanish": 176.59,
		"Sri Lankan": 165.69,
		"Sudanese": 166.63,
		"Surinamese": 172.72,
		"Swazi": 168.13,
		"Swedish": 179.74,
		"Swiss": 178.42,
		"Syrian": 170.43,
		"Taiwanese": 174.52,
		"Tajik": 171.26,
		"Tanzanian": 164.8,
		"Thai": 169.16,
		"Tibetan": 168.91,
		"Togolese": 168.33,
		"Tongan": 176.76,
		"Trinidadian": 173.74,
		"Tunisian": 173.95,
		"Turkish": 174.21,
		"Turkmen": 171.97,
		"Tuvaluan": 169.64,
		"Ugandan": 165.62,
		"Ukrainian": 178.46,
		"Uruguayan": 173.43,
		"Uzbek": 169.38,
		"Vatican": 176.5,
		"Venezuelan": 171.59,
		"Vietnamese": 164.45,
		"Vincentian": 172.78,
		"Yemeni": 159.89,
		"Zairian": 166.8,
		"Zambian": 166.52,
		"Zimbabwean": 168.59,
		"": 171.42, // defaults
	};

	/**
	 * Helper method - table lookup for nationality/race combinations
	 * @param {object} table
	 * @param {string|object} nationality
	 * @param {string} race
	 * @param {number} [def]
	 * @returns {object}
	 */
	function nationalityMeanHeight(table, nationality, race, def) {
		return table[`${nationality}.${race}`] || table[nationality] || table[`.${race}`] || table[""] || def;
	}

	/**
	 * Helper method: Generate a height based on the mean one and limited according to config.
	 * @param {heightConfig} config
	 * @param {number} mean
	 * @returns {number}
	 */
	function heightGenerator(config, mean) {
		const maxMult = Math.max(...config.limitMult);
		const minMult = Math.min(...config.limitMult);
		if (!("spread" in config)) {
			config.spread = 0.05;
		}
		let result = mean * (1 + App.Utils.Math.limitedSkewedGaussian(maxMult, minMult, config.skew, config.seed1, config.seed2) * config.spread);
		return Math.round(result);
	}

	/**
	 * Helper method - apply age and genes to the adult height
	 * @param {number} height
	 * @param {number} age
	 * @param {string} [genes]
	 * @returns {number}
	 */
	function applyAge(height, age, genes) {
		if (!_.isFinite(age) || age < 2 || age >= 20) {
			return height;
		}
		let minHeight;
		let midHeight;
		let midAge;
		switch (genes) {
			case "XX": // female
			case "XXX": // Triple X syndrome female
				minHeight = 85;
				midHeight = height * 157 / 164;
				midAge = 13;
				break;
			case "XY": // male
			case "XXY": // Klinefelter syndrome male
			case "XYY": // XYY syndrome male
				minHeight = 86;
				midHeight = height * 170 / 178;
				midAge = 15;
				break;
			case "X0":
			case "X": // Turner syndrome female
				minHeight = 85 * 0.93;
				midHeight = height * 157 / 164;
				midAge = 13;
				break;
			default:
				minHeight = 85.5;
				midHeight = height * 327 / 342;
				midAge = 14;
				break;
		}
		if (age > midAge) {
			// end of puberty to 20
			return Math.round(interpolate(midAge, midHeight, 20, height, age));
		} else {
			// 2 to end of puberty
			return Math.round(interpolate(2, minHeight, midAge, midHeight, age));
		}
	}

	/**
	 * @param {string|{nationality: string, race: FC.Race, genes: string, physicalAge: number, birthWeek: number}} nationality
	 * @param {FC.Race} [race]
	 * @param {string} [genes]
	 * @param {number} [age]
	 * @returns {number}
	 */
	function _meanHeight(nationality, race, genes, age) {
		if (_.isObject(nationality)) {
			// We got called with a single slave as the argument
			return _meanHeight(nationality.nationality, nationality.race, nationality.genes, nationality.physicalAge + nationality.birthWeek / 52.0);
		}
		let result = 0;
		switch (genes) {
			case "XX": // female
				result = nationalityMeanHeight(xxMeanHeight, nationality, race);
				break;
			case "XY": // male
				result = nationalityMeanHeight(xyMeanHeight, nationality, race);
				break;
			// special cases. Extra SHOX genes on X and Y chromosomes make for larger people
			case "X0":
			case "X": // Turner syndrome female
				result = nationalityMeanHeight(xxMeanHeight, nationality, race) * 0.93;
				break;
			case "XXX": // Triple X syndrome female
				result = nationalityMeanHeight(xxMeanHeight, nationality, race) * 1.03;
				break;
			case "XXY": // Klinefelter syndrome male
				result = nationalityMeanHeight(xyMeanHeight, nationality, race) * 1.03;
				break;
			case "XYY": // XYY syndrome male
				result = nationalityMeanHeight(xyMeanHeight, nationality, race) * 1.04;
				break;
			case "Y":
			case "Y0":
			case "YY":
			case "YYY":
				// eslint-disable-next-line no-console
				console.log(`Height.mean(): non-viable genes ${genes}`);
				break;
			default:
				// eslint-disable-next-line no-console
				console.log(`Height.mean(): unknown genes ${genes}, returning mean between XX and XY`);
				result = nationalityMeanHeight(xxMeanHeight, nationality, race) * 0.5 + nationalityMeanHeight(xyMeanHeight, nationality, race) * 0.5;
				break;
		}
		return applyAge(result, age, genes);
	}

	/**
	 * @param {{nationality: string, race: FC.Race, genes: string, physicalAge: number, birthWeek: number}} slave
	 * @param {Partial<heightConfig>} [conf]
	 * @returns {number}
	 */
	function _randomAdultHeight(slave, conf) {
		const mean = _meanHeight({
			nationality: slave.nationality,
			race: slave.race,
			genes: slave.genes,
			physicalAge: 20,
			birthWeek: 0
		});
		if (conf) {
			const localConfig = Object.assign({}, defaultConfig);
			Object.assign(localConfig, conf);
			return heightGenerator(localConfig, mean);
		}
		return heightGenerator(defaultConfig, mean);
	}

	/**
	 * @param {{nationality: string, race: FC.Race, genes: string, physicalAge: number, birthWeek: number}} slave
	 * @param {Partial<heightConfig>} [conf]
	 * @returns {number}
	 */
	function _randomHeight(slave, conf) {
		const mean = _meanHeight(slave);
		if (conf) {
			const localConfig = Object.assign({}, defaultConfig);
			Object.assign(localConfig, conf);
			return heightGenerator(localConfig, mean);
		}
		return heightGenerator(defaultConfig, mean);
	}

	/**
	 * @param {number} height
	 * @param {number|{physicalAge:number, birthWeek:number, genes:string}} age
	 * @param {string} [genes]
	 * @returns {number}
	 */
	function _forAge(height, age, genes) {
		if (_.isObject(age)) {
			// We got called with a slave as a second argument
			return applyAge(height, age.physicalAge + age.birthWeek / 52.0, age.genes);
		} else {
			return applyAge(height, age, genes);
		}
	}

	return {
		mean: _meanHeight,
		random: _randomHeight,
		randomAdult: _randomAdultHeight,
		forAge: _forAge,
		config: _config,
	};
})();

/**
 * Intelligence.random(options) - returns a random intelligence value. If no options are passed, the generated number
 * will be on a normal distribution with mean 0 and standard deviation 45.
 *
 *  Intelligence.config(configuration) - configures the random height generator globally and returns the current configuration
 *
 *  This was modeled using the Height generator above. For some more information, see the comments for that.
 */
globalThis.Intelligence = (function() {
	/**
	 * @typedef {object} intelligenceConfig
	 * @property {number} mean What the average intelligence will be. Increasing this will make it more likely to
	 *      generate a smart slave, but will not guarantee it.
	 *      Minimum value: -100, maximum value: 100
	 * @property {[number, number]} limitMult Limit to this many standard deviations from the mean. In normal use, the
	 *      values are almost never reached; only 0.27% of values are outside this range and need to be regenerated.
	 *      With higher skew (see below), this might change.
	 * @property {number} skew The random standard deviation of the calculated distribution. A higher value will make it
	 *      more likely to have extreme values, a lower value will make any generated values cluster around the mean.
	 *      If spread is 0, it will always return the mean.
	 * @property {number} spread How much the height distribution skews to the right (positive) or left (negative) side
	 *      of the height. Unless you have a very specific reason, you should not need to change this.
	 *      Minimum value: -1000, maximum value: 1000
	 * @property {[number, number]} limitIntelligence Limit the resulting intelligence range.
	 *      Warning: A small intelligence limit range not containing the mean, and with a low spread value results in
	 *      the generator having to do lots of work generating and re-generating random intelligences until one "fits".
	 * @property {number|string} [seed1]
	 * @property {number|string} [seed2]
	 */

	/**
	 * Global configuration (for different game modes/options/types)
	 * @type {intelligenceConfig}
	 */
	const globalConfig = {
		mean: 0,
		limitMult: [-3.0, 3.0],
		skew: 0.0,
		spread: 45,
		limitIntelligence: [-100, 100],
		seed1: undefined,
		seed2: undefined
	};

	/**
	 * Configuration method for the above values
	 * WARNING: Make sure you handle new game/loading saves appropriately when using to change global state!
	 * @param {Partial<intelligenceConfig>} [conf]
	 * @returns {intelligenceConfig}
	 */
	function _config(conf) {
		if (conf) {
			Object.assign(globalConfig, conf);
		}
		return globalConfig;
	}

	/**
	 * Helper method: Transform the values from {@link App.Utils.Math.limitedSkewedGaussian} to have the appropriate
	 * mean and standard deviation.
	 * @param {intelligenceConfig} config
	 * @returns {number}
	 */
	function intelligenceGenerator(config) {
		const minMult = Math.min(...config.limitMult);
		const maxMult = Math.max(...config.limitMult);
		let result = App.Utils.Math.limitedSkewedGaussian(maxMult, minMult, config.skew, config.seed1, config.seed2) * config.spread + config.mean;
		while (result < Math.min(...config.limitIntelligence) || result > Math.max(...config.limitIntelligence)) {
			config.seed1 = iterateSeed(config.seed1);
			config.seed2 = iterateSeed(config.seed2);
			result = App.Utils.Math.limitedSkewedGaussian(maxMult, minMult, config.skew, config.seed1, config.seed2) * config.spread + config.mean;
		}
		return Math.ceil(result);
	}

	/**
	 * @param {Partial<intelligenceConfig>} [config]
	 * @returns {number}
	 */
	function _randomIntelligence(config) {
		if (config) {
			const localConfig = Object.assign({}, globalConfig);
			Object.assign(localConfig, config);
			return intelligenceGenerator(localConfig);
		}
		return intelligenceGenerator(globalConfig);
	}

	return {
		random: _randomIntelligence,
		config: _config,
	};
})();

/**
 *  Breast size randomizer.
 *  Moved from generateNewSlaveJS to allow for use in BC.
 * @param {number} modifier
 * @param {number|string} [seed=undefined]
 * @returns {number}
 */
globalThis.rollBreast = function(modifier, seed) {
	const volume = [100, 300, 500, 650, 800, 1000, 1200, 1400, 1600, 1800, 2050, 2300, 2600, 2900, 3250, 3600, 3950, 4300, 4700, 5100, 5500, 5900];
	const volumeDist = [90000, 470000, 720000, 840000, 908574, 947759, 970151, 982946, 990258, 994436, 996824, 998188, 998968, 999414, 999669, 999814, 999897, 999945, 999972, 999987, 999995, 1000000];
	const randomRoll = Math.floor(seededRandom(seed) * 1000000) + 1;
	let actualSize = 0;
	let minorSizeAdjustment = 0;

	while (randomRoll > volumeDist[actualSize]) {
		actualSize += 1;
	}
	if (seededRandom(iterateSeed(seed)) < 0.5) {
		minorSizeAdjustment = (Math.floor(seededRandom(iterateSeed(iterateSeed(seed))) * 2) + 1) * 50;
	}
	return Math.max(volume[actualSize] + minorSizeAdjustment + modifier, 0);
};

/**
 *  Applies rollBreast()
 *  Moved from generateNewSlaveJS to allow for use in BC.
 * @param {{race: FC.Race}} actor
 * @param {number|string} [seed=undefined]
 * @returns {number}
 */
globalThis.adjustBreastSize = function(actor, seed) {
	switch (actor.race) {
		case "black":
			return rollBreast(150, seed);
		case "white":
			return rollBreast(50, seed);
		case "asian":
			return rollBreast(-100, seed);
		default:
			return rollBreast(0, seed);
	}
};

/**
 * Describes a slaves pre-slavery career in a gender sensitive way. If career is "a dominatrix" but the slave is male and the pronoun system is on, returns "a dominator"
 * @param {FC.SlaveState} slave
 * @returns {string}
 */
globalThis.convertCareer = function(slave) {
	let job = slave.career;
	if ((V.diversePronouns === 1) && (slave.pronoun === App.Data.Pronouns.Kind.male)) {
		switch (job) {
			case "a dominatrix":
				job = "a dominator";
				break;
			case "a farmer's daughter":
				job = "a farmer's son";
				break;
			case "a handmaiden":
				job = "a handservant";
				break;
			case "a lady courtier":
				job = "a gentleman courtier";
				break;
			case "a landlady":
				job = "a landlord";
				break;
			case "a madam":
				job = "a brothel owner";
				break;
			case "a maid":
				job = "a houseservant";
				break;
			case "a mail-order bride":
				job = "a mail-order groom";
				break;
			case "a mistress":
				job = "a kept man";
				break;
			case "a nun":
				job = "a monk";
				break;
			case "a nursemaid":
				job = "a child's nurse";
				break;
			case "a procuress":
				job = "a procurer";
				break;
			case "a shrine maiden":
				job = "a shrine priest";
				break;
			case "a trophy spouse":
				job = "a trophy husband";
				break;
			case "a weathergirl":
				job = "a weatherman";
				break;
			case "an air hostess":
				job = "an air host";
				break;
			case "being homeschooled by her parents":
				job = "being homeschooled by his parents";
				break;
			case "a camgirl":
			case "a cowgirl":
			case "a girl scout":
			case "a paper girl":
			case "a party girl":
				job = job.replace(/girl/g, "boy");
				break;
			case "a businesswoman":
			case "a criminal businesswoman":
			case "a delivery woman":
			case "a fisherwoman":
			case "a noblewoman":
			case "a saleswoman":
			case "a stuntwoman":
				job = job.replace(/woman/g, "man");
				break;
			case "a housewife":
			case "a trophy wife":
				job = job.replace(/wife/g, "husband");
				break;
			case "a cocktail waitress":
			case "a waitress":
			case "a seamstress":
				job = job.replace(/ress/g, "er");
				break;
			case "a child actress":
			case "an actress":
				job = job.replace(/ress/g, "or");
				break;
		}
	} else if (slave.pronoun === App.Data.Pronouns.Kind.female) {
		switch (job) {
			case "a priest":
				job = "a priestess";
				break;
			case "a trophy spouse":
				job = "a trophy wife";
				break;
			case "a businessman":
			case "a repairman":
				job = job.replace(/man/g, "woman");
				break;
		}
	}
	return job;
};

/**
 * Convert a tutor key name to the corresponding leadership skill key name
 * @param {string} key
 */
globalThis.tutorKeyToSkillKey = function(key) {
	if (key === "DJ") { return "DJ"; }
	return uncapFirstChar(key);
};

/**
 * @param {FC.SlaveState} slave
 * @returns {string|null}
 */
globalThis.tutorForSlave = function(slave) {
	for (const tutor of Object.keys(V.slaveTutor)) {
		const pupils = V.slaveTutor[tutor];
		if (pupils.includes(slave.ID)) {
			return tutor;
		}
	}
	return null;
};

/**
 * @param {FC.SlaveState} slave
 * @returns {boolean}
 */
globalThis.needsTutoring = function(slave) {
	const tutor = tutorForSlave(slave);
	if (!tutor) {
		return false;
	}
	const skill = slave.skill[tutorKeyToSkillKey(tutor)] || 0;
	if (skill >= 200) { // if her tutoring is done, make sure it's turned off
		V.slaveTutor[tutor].delete(slave.ID);
		return false;
	}
	return true;
};

/**
 * @param {string} skill
 * @returns {number}
 */
globalThis.upgradeMultiplier = function(skill) {
	if (skill === 'medicine' && V.PC.career === "medicine" || skill === 'engineering' && V.PC.career === "engineer" ||
		((skill === 'medicine' || skill === 'engineering') && V.arcologies[0].FSRestartDecoration >= 100 && V.eugenicsFullControl === 0)) {
		return 0.6;
	}
	if (V.PC.skill[skill] <= -100) {
		return 1.5;
	} else if (V.PC.skill[skill] <= -75) {
		return 1.35;
	} else if (V.PC.skill[skill] <= -50) {
		return 1.25;
	} else if (V.PC.skill[skill] <= -25) {
		return 1.15;
	} else if (V.PC.skill[skill] < 0) {
		return 1.10;
	} else if (V.PC.skill[skill] === 0) {
		return 1;
	} else if (V.PC.skill[skill] <= 10) {
		return 0.97;
	} else if (V.PC.skill[skill] <= 25) {
		return 0.95;
	} else if (V.PC.skill[skill] <= 50) {
		return 0.90;
	} else if (V.PC.skill[skill] <= 75) {
		return 0.85;
	} else if (V.PC.skill[skill] <= 100) {
		return 0.80;
	} else {
		return 0.75;
	}
};

/**
 * Return a career at random that would be suitable for the given slave.
 * Currently only considers their age
 * @param {FC.SlaveState} slave
 * @returns {string}
 */
globalThis.randomCareer = function(slave) {
	if (slave.actualAge < 16) {
		return App.Data.Careers.General.veryYoung.random();
	} else if (slave.actualAge <= 24) {
		return App.Data.Careers.General.young.random();
	} else if (slave.intelligenceImplant >= 10) {
		return App.Data.Careers.General.educated.random();
	} else {
		return App.Data.Careers.General.uneducated.random();
	}
};

/**
 * @param {FC.HumanState} slave
 */
globalThis.resyncSlaveHeight = function(slave) {
	slave.natural.height = Height.randomAdult(slave);
	slave.height = Height.forAge(slave.natural.height, slave);
};

/**
 * @param {FC.SlaveState} slave
 */
globalThis.resyncSlaveToAge = function(slave) {
	resyncSlaveHeight(slave);
	slave.pubertyXX = slave.actualAge < slave.pubertyAgeXX ? 0 : 1;
	slave.pubertyXY = slave.actualAge < slave.pubertyAgeXY ? 0 : 1;
	if (slave.actualAge < 12) {
		slave.vagina = 0;
		slave.trueVirgin = 1;
		slave.preg = -1;
		slave.belly = 0;
		slave.bellyPreg = 0;
		slave.ovaries = 1;
		slave.anus = 0;
		slave.skill.anal = 0;
		slave.skill.oral = 0;
		slave.skill.whoring = 0;
		slave.skill.entertainment = 0;
		slave.skill.combat = 0;
		slave.skill.vaginal = 0;
		slave.skill.penetrative = 0;
		slave.attrXY = 50;
		slave.attrXX = 50;
		slave.boobs = 200;
		slave.birthWeek = 0;
		SetBellySize(slave);
		if (slave.dick > 0) {
			slave.dick = 1;
		}
		if (slave.balls > 0) {
			slave.balls = 1;
		}
	} else {
		slave.boobs = Math.max(slave.boobs, 500);
		if (slave.dick > 2) {
			slave.dick = 2;
		}
		if (slave.balls > 2) {
			slave.balls = 2;
		}
	}
	slave.career = randomCareer(slave);
};

/**
 * @param {FC.Race} raceName
 * @returns {string}
 */
globalThis.randomRaceSkin = function(raceName) {
	let skin;
	switch (raceName) {
		case "asian":
			skin = jsEither(["dark olive", "light olive", "light"]);
			break;
		case "amerindian":
		case "indo-aryan":
		case "malay":
		case "pacific islander":
			skin = jsEither(["dark", "light"]);
			break;
		case "black":
			skin = jsEither(["black", "brown", "dark brown"]);
			break;
		case "latina":
			skin = jsEither(["brown", "dark brown", "dark olive", "light olive", "tan"]);
			break;
		case "middle eastern":
		case "semitic":
		case "southern european":
			skin = jsEither(["fair", "light olive", "light", "tan"]);
			break;
		case "white":
			skin = jsEither(["fair", "light", "pale"]);
			break;
		case "catgirl":
			skin = jsEither(App.Medicine.Modification.catgirlNaturalSkins);
			break;
		default:
			skin = jsEither(["dark", "light", "pale"]);
			break;
	}
	return skin;
};

/**
 * @param {FC.Race} raceName
 * @returns {string}
 */
globalThis.randomRaceEye = function(raceName) {
	let eye;
	switch (raceName) {
		case "asian":
		case "black":
		case "indo-aryan":
		case "middle eastern":
		case "pacific islander":
			eye = jsEither(["brown", "brown", "brown", "brown", "green"]);
			break;
		case "amerindian":
		case "latina":
			eye = jsEither(["brown", "brown", "brown", "green"]);
			break;
		case "malay":
		case "southern european":
			eye = jsEither(["blue", "brown", "brown", "brown", "brown", "brown", "brown", "green"]);
			break;
		case "semitic":
		case "catgirl":
		case "white":
			eye = jsEither(["blue", "brown", "brown", "brown", "green", "green"]);
			break;
		default:
			eye = jsEither(["blue", "brown", "green"]);
			break;
	}
	return eye;
};

/**
 * @param {FC.Race} raceName
 * @returns {string}
 */
globalThis.randomRaceHair = function(raceName) {
	let hair;
	switch (raceName) {
		case "asian":
		case "amerindian":
		case "indo-aryan":
		case "malay":
		case "middle eastern":
		case "pacific islander":
			hair = jsEither(["black", "black", "black", "black", "black", "brown"]);
			break;
		case "black":
		case "latina":
		case "semitic":
		case "southern european":
			hair = jsEither(["black", "black", "brown", "brown"]);
			break;
		case "white":
			hair = jsEither(["black", "black", "blonde", "brown", "brown", "red"]);
			break;
		case "catgirl":
			hair = jsEither(["black", "white", "blonde", "brown", "red"]);
			break;
		default:
			hair = jsEither(["black", "black", "black", "black", "blonde", "brown", "brown", "red"]);
			break;
	}
	return hair;
};

/**
 * @param {string} skinTone
 * @returns {number}
 */
globalThis.skinToneLevel = function(skinTone) {
	if (!App.Medicine.Modification.naturalSkins.includes(skinTone)) {
		return undefined;
	}
	const skinToMelanin = {
		"pure black": 25,
		"ebony": 24,
		"black": 23,
		"dark brown": 22,
		"brown": 21,
		"light brown": 20,
		"dark beige": 19,
		"beige": 18,
		"light beige": 17,
		"dark": 16,
		"dark olive": 15,
		"bronze": 14,
		"olive": 13,
		"tan": 12,
		"light olive": 11,
		"light": 10,
		"fair": 9,
		"very fair": 8,
		"extremely fair": 7,
		"pale": 6,
		"very pale": 5,
		"extremely pale": 4,
		"white": 3,
		"ivory": 2,
		"pure white": 1
	};
	return skinToMelanin[skinTone];
};

/**
 * Increase or decrease skinTone
 * @param {string} skin
 * @param {number} value
 * @returns {string}
 */
globalThis.changeSkinTone = function(skin, value) {
	if (!App.Medicine.Modification.naturalSkins.includes(skin)) {
		return skin;
	}
	const skinToMelanin = {
		"pure black": 25,
		"ebony": 24,
		"black": 23,
		"dark brown": 22,
		"brown": 21,
		"light brown": 20,
		"dark beige": 19,
		"beige": 18,
		"light beige": 17,
		"dark": 16,
		"dark olive": 15,
		"bronze": 14,
		"olive": 13,
		"tan": 12,
		"light olive": 11,
		"light": 10,
		"fair": 9,
		"very fair": 8,
		"extremely fair": 7,
		"pale": 6,
		"very pale": 5,
		"extremely pale": 4,
		"white": 3,
		"ivory": 2,
		"pure white": 1
	};
	let newSkin = (skinToMelanin[skin] + value);
	if (newSkin > 25) {
		newSkin = 25;
	} else if (newSkin < 1) {
		newSkin = 1;
	}
	let prop;
	for (prop in skinToMelanin) {
		if (!skinToMelanin.hasOwnProperty(prop)) {
			continue;
		}
		if (newSkin >= skinToMelanin[prop]) {
			return prop;
		}
	}
	return prop;
};

/**
 * @param {string} color
 * @returns {number}
 */
globalThis.nippleColorLevel = function(color) {
	if (!App.Medicine.Modification.naturalNippleColors.includes(color)) {
		return undefined;
	}
	const nippleColor = {
		"ebony": 8,
		"black": 7,
		"dark brown": 6,
		"brown": 5,
		"light brown": 4,
		"pink": 3,
		"pale pink": 2,
		"ivory": 1,
	};
	return nippleColor[color];
};

/**
 * Sets temporary variables named by the scheme, described below, to pronouns for the given slave
 * @param {FC.SlaveState} slave
 * @param {any} [suffix] pronounsSuffix. Anything that can be converted to string.
 * @param {string[]} [pronouns] requested pronouns. Defaults to all pronoun forms.
 *
 * The variables naming scheme is the pronoun name (he, his, etc.) and optional suffix. If the suffix is empty, the variables
 * will be set as story variables, otherwise as temporary variables.
 * This way for a call App.Utils.setLocalPronouns(slave) there will be story variables "$he", "$his", for
 * App.Utils.setLocalPronouns(slave, 1): _he1, _his1 and so on.
 */
App.Utils.setLocalPronouns = function(slave, suffix, pronouns) {
	const ps = getPronouns(slave);
	/** @type {string} */
	const pSuffix = suffix !== undefined ? suffix.toString() : '';
	pronouns = pronouns || [ // Object.getOwnPropertyNames(ps) ?
		'he', 'him', 'his', 'himself', 'boy',
		'He', 'Him', 'His', 'Himself', 'Boy',
		'man', 'men', 'shota', 'son', 'brother', 'husband', 'husbands', 'father', 'fathers',
		'Man', 'Men', 'Shota', 'Son', 'Brother', 'Husband', 'Husbands', 'Father', 'Fathers',
		'she', 'her', 'hers', 'herself', 'girl',
		'She', 'Her', 'Hers', 'Herself', 'Girl',
		'woman', 'women', 'loli', 'daughter', 'sister', 'wife', 'wives', 'mother', 'mothers',
		'Woman', 'Women', 'Loli', 'Daughter', 'Sister', 'Wife', 'Wives', 'Mother', 'Mothers'
	]; // Pronouns always refer to the slave in question, never any relation of theirs. It is "mother" as in "she is a mother of many" not "you are her mother". Plural pronouns would refer to "wives like her," not "her wives."

	const scope = pSuffix.length === 0 ? V : State.temporary;
	pronouns.forEach(p => {
		scope[p + pSuffix] = ps[p];
	});
};

/**
 * Fix nationalities as adjectives
 * @param {string} nation
 * @returns {string}
 *
 * Typical use case: "You have acquired one ${aNational(slave.nationality)} slave"
 */
globalThis.aNational = function(nation) {
	let country;
	if (nation === "a Cook Islander") {
		country = "Cook Islander";
	} else if (nation === "a Liechtensteiner") {
		country = "Liechtensteiner";
	} else if (nation === "a New Zealander") {
		country = "New Zealander";
	} else if (nation === "a Solomon Islander") {
		country = "Solomon Islander";
	} else {
		country = nation;
	}
	return country;
};

/**
 * Fix nationalities as plurals
 * @param {string} nation
 * @returns {string}
 *
 * Typical use case: "You have acquired three ${moreNational(slave.nationality)} slaves"
 */
globalThis.moreNational = function(nation) {
	let country;
	if (nation === "a Cook Islander") {
		country = "Cook Islander";
	} else if (nation === "a Liechtensteiner") {
		country = "Liechtensteiner";
	} else if (nation === "Mosotho") {
		country = "Basotho";
	} else if (nation === "Motswana") {
		country = "Batswana";
	} else if (nation === "a New Zealander") {
		country = "New Zealander";
	} else if (nation === "a Solomon Islander") {
		country = "Solomon Islander";
	} else {
		country = nation;
	}
	return country;
};

/**
 * Translate nationalities into the common name of the nation
 * @param {string} nation
 * @returns {string}
 *
 * Typical use case: "Your new slave is a refugee from ${nationOf(slave.nationality)}"
 */
globalThis.nationOf = function(nation) {
	let country;
	switch (nation) {
		case "Albanian":
		case "Algerian":
		case "Andorran":
		case "Angolan":
		case "Antiguan":
		case "Armenian":
		case "Aruban":
		case "Australian":
		case "Austrian":
		case "Azerbaijani":
		case "Bahraini":
		case "Bangladeshi":
		case "Bolivian":
		case "Bulgarian":
		case "Cambodian":
		case "Colombian":
		case "Costa Rican":
		case "Croatian":
		case "Cuban":
		case "Eritrean":
		case "Estonian":
		case "Ethiopian":
		case "French Guianan":
		case "French Polynesian":
		case "Gambian":
		case "Georgian":
		case "Ghanan":
		case "Guatemalan":
		case "Guinean":
		case "Indian":
		case "Indonesian":
		case "Iraqi":
		case "Israeli":
		case "Jamaican":
		case "Kenyan":
		case "Korean": // I guess the Koreas unified in FC's timeline?
		case "Kuwaiti":
		case "Latvian":
		case "Liberian":
		case "Libyan":
		case "Lithuanian":
		case "Macedonian": // Macedonia, not North Macedonia - no name changes after 2017
		case "Malaysian":
		case "Mauritanian":
		case "Micronesian":
		case "Moldovan":
		case "Mongolian":
		case "Namibian":
		case "New Caledonian":
		case "Nicaraguan":
		case "Nigerian":
		case "Omani":
		case "Pakistani":
		case "Papua New Guinean":
		case "Qatari":
		case "Romanian":
		case "Russian":
		case "Rwandan":
		case "Saint Lucian":
		case "Samoan":
		case "Serbian":
		case "South African":
		case "Sri Lankan":
		case "Syrian":
		case "Tanzanian":
		case "Tongan":
		case "Tunisian":
		case "Ugandan":
		case "Venezuelan":
		case "Yemeni":
		case "Zambian":
			country = nation.slice(0, nation.length - 1); // remove last letter - e.g. Albanian to Albania
			break;
		case "Belizean":
		case "Bruneian":
		case "Burundian":
		case "Cape Verdean": // other options: Cabo Verde
		case "Chilean":
		case "Curaçaoan":
		case "Djiboutian":
		case "Fijian":
		case "Greenlandic":
		case "Haitian":
		case "Icelandic":
		case "Malawian":
		case "Malian":
		case "Nauruan":
		case "Niuean":
		case "Palauan":
		case "Paraguayan":
		case "São Toméan":
		case "Sierra Leonean":
		case "Singaporean":
		case "Surinamese":
		case "Tibetan":
		case "Tuvaluan":
		case "Uruguayan":
		case "Zimbabwean":
			country = nation.slice(0, nation.length - 2); // remove last two letters - e.g. Belizean to Belize
			break;
		case "Belarusian":
		case "Beninese":
		case "Bhutanese":
		case "Brazilian":
		case "Cameroonian":
		case "Chadian":
		case "Ecuadorian":
		case "Egyptian":
		case "Gabonese":
		case "Iranian":
		case "Japanese":
		case "Jordanian":
		case "Luxembourgian":
		case "Nepalese":
		case "Nigerien":
		case "Senegalese":
		case "South Sudanese":
		case "Sudanese":
		case "Taiwanese":
		case "Vietnamese":
			country = nation.slice(0, nation.length - 3); // remove last three letters - e.g. Belarusian to Belarus
			break;
		case "Panamanian":
		case "Peruvian":
		case "Togolese":
			country = nation.slice(0, nation.length - 4); // remove last four letters - e.g. Panamanian to Panama
			break;
		case "Guamanian":
			country = nation.slice(0, nation.length - 5); // remove last five letters - e.g. Guamanian to Guam - which is the only one, apparently
			break;
		case "Argentinian":
		case "Bermudian":
		case "Burmese": // Burma, not Myanmar, in keeping with official USA recognition as of 2017
		case "Canadian":
		case "Grenadian":
		case "Chinese":
		case "Guyanese":
		case "Maltese":
			country = nation.slice(0, nation.length - 3) + 'a'; // replace last three letters with 'a' - e.g. Argentinian to Argentina
			break;
		case "Barbadian":
		case "Comorian":
			country = nation.slice(0, nation.length - 3) + "os"; // replace last three letters with "os" - e.g. Barbadian to Barbados
			break;
		case "Hungarian":
		case "Italian":
			country = nation.slice(0, nation.length - 3) + 'y'; // replace last three letters with 'y' - e.g. Hungarian to Hungary
			break;
		case "Palestinian":
		case "Ukrainian":
			country = nation.slice(0, nation.length - 3) + 'e'; // replace last three letters with 'e' - e.g. Palestinian to Palestine
			break;
		case "Kosovan":
		case "Mexican":
		case "Montenegrin":
		case "Moroccan":
		case "Puerto Rican":
			country = nation.slice(0, nation.length - 2) + 'o'; // replace last two letters with 'o' - e.g. Kosovan to Kosovo
			break;
		case "Afghan":
		case "Tajik":
		case "Turkmen":
		case "Uzbek":
			country = nation + "istan"; // add "istan" - e.g. Afghan to Afghanistan
			break;
		case "Kazakh":
		case "Kyrgyz":
			country = nation + "stan"; // add "stan" - e.g. Kazakh to Kazakhstan
			break;
		case "Finnish":
		case "Polish":
		case "Scottish":
			country = nation.slice(0, nation.length - 4) + "land"; // replace last four letters with "land" - e.g. Finnish to Finland
			break;
		case "Swazi": // Swaziland, not Eswatini - no name changes after 2017
		case "Thai":
			country = nation + "land"; // add "land" - e.g. Swazi to Swaziland
			break;
		case "American":
			country = "the United States"; // other options: America, the USA, the United States of America
			break;
		case "Bahamian":
			country = "the Bahamas";
			break;
		case "Belgian":
			country = "Belgium";
			break;
		case "Bissau-Guinean":
			country = "Guinea-Bissau";
			break;
		case "Bosnian":
			country = "Bosnia and Herzegovina";
			break;
		case "British":
			country = "Britain"; // the game considers Scots a separate nationality, so we can't cleanly use "the UK", but it does still contain Wales, Cornwall, Mann, the Channel islands, etc., so we can't just use "England" either
			break;
		case "Burkinabé":
			country = "Burkina Faso";
			break;
		case "Catalan":
			country = "Catalonia";
			break;
		case "Central African":
			country = "the Central African Republic";
			break;
		case "Congolese":
			country = "the Republic of the Congo"; // other options: Congo-Brazzaville, Little Congo, the Congo
			break;
		case "a Cook Islander":
			country = "the Cook Islands";
			break;
		case "Cypriot":
			country = "Cyprus";
			break;
		case "Czech":
			country = "the Czech Republic"; // this is borderline - the Czechs recommended Czechia back in 1992, it started to catch on in 2016, but the US and EU didn't officially switch until after 2018
			break;
		case "Danish":
			country = "Denmark";
			break;
		case "Dominican":
			country = "the Dominican Republic";
			break;
		case "Dominiquais":
			country = "Dominica";
			break;
		case "Dutch":
			country = "the Netherlands";
			break;
		case "East Timorese":
			country = "Timor-Leste";
			break;
		case "Emirati":
			country = "the United Arab Emirates"; // other options: the UAE
			break;
		case "Equatoguinean":
			country = "Equatorial Guinea";
			break;
		case "Filipina":
			country = "the Philippines";
			break;
		case "French":
			country = "France";
			break;
		case "German":
			country = "Germany";
			break;
		case "Greek":
			country = "Greece";
			break;
		case "Honduran":
			country = "Honduras";
			break;
		case "I-Kiribati":
			country = "Kiribati";
			break;
		case "Irish":
			country = "Ireland";
			break;
		case "Ivorian":
			country = "the Ivory Coast"; // other options: Côte d'Ivoire
			break;
		case "Kittitian":
			country = "Saint Kitts and Nevis";
			break;
		case "Kurdish":
			country = "Kurdistan"; // We can presume Kurdistan has become a relatively more independent sovereign state than in real life at time of writing
			break;
		case "Laotian":
			country = "Laos";
			break;
		case "Lebanese":
			country = "Lebanon";
			break;
		case "a Liechtensteiner":
			country = "Liechtenstein";
			break;
		case "Malagasy":
			country = "Madagascar";
			break;
		case "Maldivian":
			country = "the Maldives";
			break;
		case "Marshallese":
			country = "the Marshall Islands";
			break;
		case "Mauritian":
			country = "Mauritius";
			break;
		case "Monégasque":
			country = "Monaco";
			break;
		case "Mosotho":
			country = "Lesotho";
			break;
		case "Motswana":
			country = "Botswana";
			break;
		case "Mozambican":
			country = "Mozambique";
			break;
		case "a New Zealander":
			country = "New Zealand";
			break;
		case "Ni-Vanuatu":
			country = "Vanuatu";
			break;
		case "Norwegian":
			country = "Norway";
			break;
		case "Portuguese":
			country = "Portugal";
			break;
		case "Sahrawi":
			country = "the Sahrawi Republic"; // other options: Western Sahara, the Sahrawi Arab Democratic Republic
			break;
		case "Salvadoran":
			country = "El Salvador";
			break;
		case "Sammarinese":
			country = "San Marino";
			break;
		case "Saudi":
			country = "Saudi Arabia";
			break;
		case "Seychellois":
			country = "Seychelles";
			break;
		case "Slovak":
			country = "Slovakia";
			break;
		case "Slovene":
			country = "Slovenia";
			break;
		case "a Solomon Islander":
			country = "the Solomon Islands";
			break;
		case "Somali":
			country = "Somalia";
			break;
		case "Spanish":
			country = "Spain";
			break;
		case "Swedish":
			country = "Sweden";
			break;
		case "Swiss":
			country = "Switzerland";
			break;
		case "Trinidadian":
			country = "Trinidad and Tobago";
			break;
		case "Turkish":
			country = "Turkey"; // not Türkiye - no name changes after 2017
			break;
		case "Vatican":
			country = "Vatican City";
			break;
		case "Vincentian":
			country = "Saint Vincent and the Grenadines";
			break;
		case "Zairian": // this is a little anachronistic, as the country hasn't been called Zaire since the 1990s, but FC-Author chose to keep it more distinct from the other Congo, and we're sticking with it
			country = "Zaire"; // other options: the Democratic Republic of the Congo, Congo-Kinshasa, DR Congo, Big Congo
			break;
		case "Rhodesian": // no slave's nationality should ever be directly assigned Rhodesian, but it is occasionally used as an alias, so catch it just in case
			country = "Zimbabwe";
			break;
		case "Stateless":
		case "slave": // old value which shouldn't still be in use, but catch it just in case
			country = "no country"; // best we can do, shouldn't ever come up
			break;
		default:
			country = "an unknown country"; // if any new nationalities are ever added, catch them so we know to account for them here
			break;
	}
	return country;
};

/** Deflate a slave (reset inflation to none)
 * @param {FC.HumanState} slave
 */
globalThis.deflate = function(slave) {
	slave.inflation = 0;
	slave.inflationType = "none";
	slave.inflationMethod = 0;
	slave.milkSource = 0;
	slave.cumSource = 0;
	SetBellySize(slave);
};

/**
 * colors skin, eyes and hair based on genetic Color.
 * Takes .override*Color and .overrideSkin into account.
 * @param {FC.SlaveState} slave
 */
globalThis.applyGeneticColor = function(slave) {
	if (slave.overrideEyeColor !== 1) {
		resetEyeColor(slave, "both");
	}
	if (slave.overrideHColor !== 1) {
		slave.hColor = getGeneticHairColor(slave);
	}
	if (slave.overrideArmHColor !== 1) {
		slave.underArmHColor = getGeneticHairColor(slave);
	}
	if (slave.overridePubicHColor !== 1) {
		slave.pubicHColor = getGeneticHairColor(slave);
	}
	if (slave.overrideBrowHColor !== 1) {
		slave.eyebrowHColor = getGeneticHairColor(slave);
	}
	if (slave.overrideSkin !== 1) {
		if (!(slave.skin === "sun tanned" || slave.skin === "spray tanned")) {
			slave.skin = getGeneticSkinColor(slave);
		}
	}
};

/**
 * @param {FC.GingeredSlave} slave
 */
globalThis.newSlave = function(slave) {
	if (getSlave(slave.ID)) {
		throw Error(`Slave already exists for ID '${slave.ID}'`);
	}

	// if the slave is gingered, remove the gingering proxy
	if (slave.beforeGingering) {
		slave = slave.beforeGingering;
	}

	if (slave.overrideRace !== 1) {
		slave.origRace = slave.race;
	}

	applyGeneticColor(slave);

	slave.overrideRace = 0;
	slave.overrideHColor = 0;
	slave.overrideArmHColor = 0;
	slave.overridePubicHColor = 0;
	slave.overrideBrowHColor = 0;
	slave.overrideSkin = 0;
	slave.overrideEyeColor = 0;

	// too tall to be a dwarf catch for event slaves
	if (slave.geneticQuirks.dwarfism === 2 && slave.geneticQuirks.gigantism !== 2 && slave.height > 165) {
		slave.geneticQuirks.dwarfism = 1;
	}

	if (V.surnamesForbidden === 1) {
		slave.slaveSurname = 0;
	}

	if (slave.preg > 0) {
		slave.pregWeek = slave.preg;
	} else if (slave.pregWeek > 0) { // Should clear any abnormalities related to pregnancy while leaving postpartum alone
		slave.pregWeek = 0;
	}
	if (slave.pregKnown || V.menstruationKnown === 0) {
		slave.fertKnown = 1;
	}

	if (slave.clone !== 0) {
		slave.canRecruit = 0;
	}

	slave.sisters = 0;
	slave.daughters = 0;
	if (slave.mother === SID.PC || slave.father === SID.PC) {
		V.PC.daughters += 1;
	}
	if (areSisters(V.PC, slave) > 0) {
		V.PC.sisters += 1;
	}
	for (const other of getSlaves().values()) {
		if (other.mother === slave.ID || other.father === slave.ID) {
			slave.daughters++;
		}
		if (slave.mother === other.ID || slave.father === other.ID) {
			other.daughters++;
		}
		if (areSisters(other, slave) > 0) {
			slave.sisters++;
			other.sisters++;
		}
	}

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

	if (slave.dick > 0 &&
		slave.balls > 0 &&
		slave.vagina < 0 &&
		slave.anus === 0 &&
		slave.genes === "XY" &&
		slave.faceShape === "masculine" &&
		slave.attrXY <= 35 &&
		slave.boobs < 400 &&
		slave.hormoneBalance < 0) {
		V.RECheckInIDs.push({ID: slave.ID, type: "feminization"});
	}
	if (slave.actualAge > 35 && slave.face <= 10 && slave.faceImplant === 0 && slave.energy <= 60) {
		V.RECheckInIDs.push({ID: slave.ID, type: "MILF"});
	}
	if (slave.attrXY <= 35 && slave.attrXX > 65) {
		V.RECheckInIDs.push({ID: slave.ID, type: "orientation"});
	}
	if (slave.face < -10) {
		V.RECheckInIDs.push({ID: slave.ID, type: "ugly"});
	}
	if (slave.anus < 2) {
		V.RECheckInIDs.push({ID: slave.ID, type: "butthole"});
	}
	if (slave.boobs < 800) {
		V.RECheckInIDs.push({ID: slave.ID, type: "reduction"});
	}

	/* special case for MB slave genetic intelligence in slave acquisition */
	// @ts-ignore used internally by newSlave() and applyMindbroken()
	if (slave.savedIntelligence !== undefined) {
		// @ts-ignore used internally by newSlave() and applyMindbroken()
		slave.intelligence = slave.savedIntelligence;
	}

	generatePronouns(slave);
	SetBellySize(slave);
	addSlave(slave);

	if (isInGenePool(slave)) {
		console.warn(`A gene pool record already exists for a slave with the ID '${slave.ID}', leaving old record intact`);
	} else {
		addToGenePool(slave);
	}

	/* special case for dulling intelligence via drugs in slave acquisition */
	// @ts-ignore used internally by newSlave() and applyMindbroken()
	if (slave.savedIntelligence !== undefined) { // MB sets int to -75
		slave.intelligence = -75;
		deleteProps(slave, "savedIntelligence");
	}

	assignJob(slave, slave.assignment);

	/** do not run the Rules Assistant before adding the new slave to the slaves list! **/
	if (V.ui !== "start" && V.universalRulesNewSlavesRA === 1 && V.rulesAssistantAuto !== 0) {
		DefaultRules(slave);
	}
};

/**
 * @param {FC.SlaveState|FC.ReportSlave} slave
 * @returns {number}
 */
globalThis.fetishChangeChance = function(slave) {
	let chance = 0;
	let fetish = (slave.fetishStrength / 4);
	let sex = 0;

	if (slave.fetish === Fetish.MINDBROKEN) {
		return 0;
	}
	if (!smartPiercingReinforcesFetish(slave) && !('fetishChanged' in slave && slave.fetishChanged === 1)) {
		// fetish should be more uncertain leading towards puberty and then steadily become more set in stone afterwards
		if (slave.balls) {
			if (V.potencyAge >= slave.actualAge) {
				sex = (50 - ((V.potencyAge - slave.actualAge) * 10));
				fetish = (slave.fetishStrength / 2);
			} else {
				sex = ((slave.actualAge - V.potencyAge) / 4);
			}
		} else if (slave.ovaries || slave.mpreg) {
			if (V.fertilityAge >= slave.actualAge) {
				sex = (50 - ((V.fertilityAge - slave.actualAge) * 10));
				fetish = (slave.fetishStrength / 2);
			} else {
				sex = ((slave.actualAge - V.fertilityAge) / 4);
			}
		}
		chance = Math.trunc(Math.clamp((slave.devotion / 4) - (fetish) - (sex), 0, 100));
	}

	return chance;
};

/**
 * @param {FC.SlaveState} slave
 * @returns {string}
 */
globalThis.SlaveFullBirthName = function(slave) {
	const pair = slave.birthSurname ? [slave.birthName, slave.birthSurname] : [slave.birthName];
	if ((V.surnameOrder !== 1 && ["Cambodian", "Chinese", "Ancient Chinese Revivalist", "Hungarian", "Japanese", "Edo Revivalist", "Korean", "Mongolian", "Taiwanese", "Vietnamese"].includes(slave.nationality)) || (V.surnameOrder === 2)) {
		pair.reverse();
	}
	return pair.join(" ");
};

/**
 * @param {FC.SlaveState} slave
 * @returns {string}
 */
globalThis.PoliteRudeTitle = function(slave) {
	const PC = V.PC;
	const {title} = getEnunciation(slave);

	let r = "";
	if (slave.nationality === "Japanese") {
		if (slave.trust > 0) {
			r += `${PC.slaveName}${PC.title > 0 ? "kun" : "chan"}`;
		} else {
			r += Spoken(slave, PC.slaveSurname ? PC.slaveSurname : `${PC.slaveName}san`);
		}
	} else {
		if (slave.intelligence + slave.intelligenceImplant < -95) {
			r += title;
		} else if (slave.intelligence + slave.intelligenceImplant > 50) {
			r += Spoken(slave, PC.title > 0 ? `Master` : `Mistress`);
		} else if (slave.trust > 0) {
			r += PC.slaveName;
		} else {
			r += (PC.slaveSurname ? PC.slaveSurname : PC.slaveName);
		}
	}
	return r;
};

/**
 * @param {FC.SlaveState} slave
 * @param {boolean} [adjective=true] Add adjectives
 * @param {boolean} [variability=true] Use alternative titles
 * @returns {string}
 */
globalThis.SlaveTitle = function(slave, adjective = true, variability = true) {
	if (slave.custom.name) {
		return slave.custom.name;
	}
	let r;
	if (V.newDescriptions === 1) {
		if (slave.dick > 0 && slave.balls > 0 && slave.boobs > 300 && slave.vagina > -1 && slave.ovaries === 1) {
			if (variability && random(1, 100) > 50) {
				r = `futanari`;
			} else {
				r = `herm`;
			}
		} else if (slave.dick > 0 && slave.balls === 0 && slave.boobs > 300 && slave.vagina > -1 && slave.ovaries === 1) {
			r = `dickgirl`;
		} else if (slave.dick > 0 && slave.vagina > -1 && slave.ovaries === 0) {
			r = `shemale`;
		} else if (slave.dick > 0 && slave.balls === 0 && slave.vagina === -1 && slave.ovaries === 0) {
			r = `eunuch`;
		} else if (slave.dick > 0 && slave.balls > 0 && slave.vagina === -1 && slave.ovaries === 0) {
			if (slave.race === "catgirl") {
				r = `catboy`;
			} else if (slave.face > 10 && slave.hips > -1 && slave.shoulders < 1 && slave.faceShape !== "masculine") {
				r = `trap`;
			} else if (slave.boobs > 800) {
				r = `tittyboy`;
			} else if (slave.dick === 1 && slave.balls === 1) {
				r = `sissy`;
			} else if (slave.dick > 1 && slave.balls > 1 && slave.height < 165 && slave.muscles < 5 && slave.visualAge < 19 && slave.faceShape !== "masculine") {
				r = `twink`;
			} else if (slave.dick > 1 && slave.balls > 1 && slave.height < 160 && slave.muscles < 5 && slave.visualAge < 19) {
				r = `boytoy`;
			} else if (slave.muscles > 95 && slave.height >= 185) {
				r = `titan`;
			} else if (slave.muscles > 30) {
				r = `muscleboy`;
			} else {
				r = `slaveboy`;
			}
		} else if (slave.dick === 0 && slave.balls === 0 && slave.vagina > -1) {
			if (slave.race === "catgirl") {
				r = `catgirl`;
			} else if ((slave.shoulders > slave.hips || slave.faceShape === "masculine") && slave.boobs < 400 && slave.genes === "XY") {
				r = `cuntboy`;
			} else if (slave.ovaries === 0 && slave.genes === "XY") {
				r = `tranny`;
			} else if (slave.weight > 10 && slave.boobs > 800 && slave.counter.birthsTotal > 0 && slave.physicalAge > 59) {
				r = `GMILF`;
			} else if (slave.weight > 10 && slave.boobs > 800 && slave.counter.birthsTotal > 0 && slave.physicalAge > 35) {
				r = `MILF`;
			} else if (slave.lips > 70 && slave.boobs > 2000 && slave.butt > 3) {
				r = `bimbo`;
			} else if (slave.hips > 1 && slave.boobs > 2000 && slave.butt > 3 && slave.waist < 50) {
				r = `hourglass`;
			} else if (slave.muscles > 95 && slave.height >= 185) {
				r = `amazon`;
			} else if (slave.muscles > 30) {
				r = `musclegirl`;
			} else {
				r = `slavegirl`;
			}
		} else if (slave.dick === 0 && slave.balls === 0 && slave.vagina === -1) {
			r = `neuter`;
		} else if (slave.dick === 0 && slave.vagina === -1) {
			r = `ballslave`;
		} else {
			r = `slave`;
		}

		if (!adjective) {
			return r;
		}

		if (slave.visualAge < 18) {
			if (slave.visualAge < 13) {
				if (slave.actualAge < 3) {
					if (slave.actualAge < 1) {
						r = `baby ${r}`;
					} else {
						r = `toddler ${r}`;
					}
				} else {
					if (slave.genes === "XY" && slave.vagina === -1) {
						r = `shota ${r}`;
					} else {
						r = `loli ${r}`;
						if (slave.boobs > 1000) {
							r = `oppai ${r}`;
						}
					}
				}
			} else {
				r = `teen ${r}`;
			}
		}

		if (slave.geneticQuirks.albinism === 2) {
			r = `albino ${r}`;
		}

		if (slave.dick > 9 && slave.balls > 9 && slave.boobs > 12000) {
			r = `hyper ${r}`;
		}

		if (slave.boobs > 4000 && slave.lactation > 0) {
			if (slave.physicalAge < 13) {
				r = `${r} calf`;
			} else {
				r = `${r} cow`;
			}
		} else if (slave.lactation > 0) {
			r = `milky ${r}`;
		}

		if (slave.boobs > 20000) {
			r = `supermassive titted ${r}`;
		} else if (slave.boobs > 10000) {
			r = `giant titted ${r}`;
		} else if (slave.boobs > 4000) {
			r = `huge titted ${r}`;
		} else if (slave.boobs > 1000) {
			r = `busty ${r}`;
		}

		if (slave.dick > 5 && slave.balls > 5) {
			r = `womb-filling ${r}`;
		} else if (slave.dick > 5) {
			r = `well hung ${r}`;
		}

		if (slave.butt >= 12) {
			r = `colossal assed ${r}`;
		} else if (slave.butt >= 10) {
			r = `massive assed ${r}`;
		} else if (slave.butt >= 8) {
			r = `fat assed ${r}`;
		} else if (slave.butt >= 6) {
			r = `bottom heavy ${r}`;
		} else if (slave.butt >= 4) {
			r = `big bottomed ${r}`;
		}

		if (slave.weight.isBetween(10, 100) && slave.boobs > 5000 && slave.butt > 5 && slave.hips >= 2 && slave.bellyPreg >= 30000 && slave.counter.births >= 10) {
			r = `${r} fertility goddess`;
		} else if (slave.counter.births >= 6) {
			r = `${r} broodmother`;
		} else if (slave.counter.births >= 3) {
			r = `${r} breeder`;
		}

		if (slave.indenture > -1) {
			r = `indentured ${r}`;
		}

		if (slave.preg > slave.pregData.normalBirth / 4 && slave.pregKnown === 1) {
			r = `pregnant ${r}`;
		} else if (slave.bellyFluid >= 5000) {
			r = `bloated ${r}`;
		} else if (slave.belly >= 5000) {
			r = `gravid ${r}`;
		}

		if (slave.fuckdoll > 0) {
			r = `${r} fuckdoll`;
		}
	} else {
		r = `slave`;
		if ((slave.dick === 0) && (slave.vagina === -1)) {
			// NULLS
			r = `null`;
			if ((slave.lactation > 0) && (slave.boobs > 2000)) {
				r = `${r} cow`;
			} else if ((slave.boobsImplant > 0) && (slave.buttImplant > 0)) {
				r = `${r} bimbo `;
			} else if (slave.boobs > 6000) {
				r = `${r} boob`;
			} else if (slave.butt > 6) {
				r = `${r} ass`;
			} else if ((slave.muscles > 30) && (slave.height < 185)) {
				r = `${r} muscle`;
			}
			if (slave.visualAge > 55) {
				r = `${r}GILF`;
			} else if (slave.visualAge > 35) {
				r = `${r}MILF`;
			} else if (slave.visualAge >= 25) {
				r = `${r}slave`;
			} else {
				r = `${r}girl`;
			}
		}

		if ((slave.dick === 0) && (slave.vagina !== -1)) {
			// FEMALES
			if (slave.visualAge > 55) {
				r = `GILF`;
			} else if (slave.visualAge > 35) {
				r = `MILF`;
			} else if (slave.visualAge >= 25) {
				r = `slave`;
			} else {
				r = `slavegirl`;
			}
			if ((slave.muscles > 30) && (slave.height < 185)) {
				r = `muscle ${r}`;
			} else if ((slave.lactation > 0) && (slave.boobs > 2000)) {
				r = `${r} cow`;
			} else if ((slave.boobsImplant > 0) && (slave.buttImplant > 0)) {
				r = `${r} bimbo`;
			} else if (slave.boobs > 6000) {
				r = `boob${r}`;
			} else if (slave.butt > 6) {
				r = `ass${r}`;
			}
		}

		if ((slave.dick !== 0) && (slave.vagina !== -1)) {
			if (slave.balls > 0) {
				// FUTANARI: cock & balls & vagina
				r = `futanari `;
			} else {
				// FUTANARI: cock & vagina
				r = `futa `;
			}
			if ((slave.lactation > 0) && (slave.boobs > 2000)) {
				r = `${r}cow`;
			} else if ((slave.boobsImplant > 0) && (slave.buttImplant > 0)) {
				r = `${r}bimbo `;
			} else if (slave.boobs > 6000) {
				r = `${r}boob`;
			} else if (slave.butt > 6) {
				r = `${r}ass`;
			} else if ((slave.muscles > 30) && (slave.height < 185)) {
				r = `${r}muscle`;
			}
			if (slave.visualAge > 55) {
				r = `${r}GILF`;
			} else if (slave.visualAge > 35) {
				r = `${r}MILF`;
			} else if (slave.visualAge >= 25) {
				r = `${r}slave`;
			} else {
				r = `${r}girl`;
			}
			if (slave.dick > 5 && slave.balls > 5 && slave.boobs > 5000) {
				r = `hyper ${r}`;
			}
		}

		if ((slave.dick !== 0) && (slave.vagina === -1) && (slave.balls > 0) && (slave.boobs > 300) && (slave.butt > 2)) {
			// SHEMALES: cock & balls, T&A above minimum
			if (slave.visualAge > 55) {
				r = `sheGILF`;
			} else if (slave.visualAge > 35) {
				r = `sheMILF`;
			} else if (slave.visualAge >= 25) {
				r = `shemale`;
			} else {
				r = `tgirl`;
			}
			if ((slave.muscles > 30) && (slave.height < 185)) {
				r = `muscle${r}`;
			} else if ((slave.lactation > 0) && (slave.boobs > 2000)) {
				r = `${r} cow`;
			} else if ((slave.boobsImplant > 0) && (slave.buttImplant > 0)) {
				r = `${r} bimbo`;
			} else if (slave.boobs > 6000) {
				r = `topheavy ${r}`;
			} else if (slave.butt > 6) {
				r = `bottomheavy ${r}`;
			}
		}

		if ((slave.boobs < 300) || (slave.butt < 2)) {
			if ((slave.dick !== 0) && (slave.vagina === -1) && (slave.balls > 0)) {
				if ((slave.shoulders < 1) || (slave.muscles <= 30)) {
					if ((slave.faceShape === "masculine") || (slave.faceShape === "androgynous")) {
						// SISSIES: feminine shoulders or muscles, masculine faces
						if (slave.visualAge > 55) {
							r = `sissyGILF`;
						} else if (slave.visualAge > 35) {
							r = `sissyMILF`;
						} else {
							r = `sissy`;
						}
					} else {
						// TRAPS: feminine shoulders or muscles, feminine faces
						if (slave.visualAge > 55) {
							r = `trapGILF`;
						} else if (slave.visualAge > 35) {
							r = `trapMILF`;
						} else if (slave.visualAge >= 25) {
							r = `trap`;
						} else {
							r = `trapgirl`;
						}
					}
					if (slave.lactation > 0) {
						r = `${r} cow`;
					} else if ((slave.boobsImplant > 0) && (slave.buttImplant > 0)) {
						r = `${r} bimbo`;
					}
				}
			}
		}

		if ((slave.boobs < 300) || (slave.butt < 2)) {
			if ((slave.dick !== 0) && (slave.vagina === -1) && (slave.balls > 0)) {
				if ((slave.shoulders > 1) || (slave.muscles >= 30)) {
					// BITCHES: masculine shoulders or muscles
					r = `bitch`;
					if ((slave.muscles > 30) && (slave.height < 185)) {
						r = `muscle${r}`;
					} else if (slave.lactation > 0) {
						r = `${r}cow`;
					} else if ((slave.boobsImplant > 0) && (slave.buttImplant > 0)) {
						r = `bimbo ${r}`;
					}
					if (slave.visualAge > 55) {
						r = `aged ${r}`;
					} else if (slave.visualAge > 35) {
						r = `mature ${r}`;
					} else if (slave.visualAge < 25) {
						r = `young ${r}`;
					}
				}
			}
		}

		if ((slave.dick !== 0) && (slave.vagina === -1) && (slave.balls === 0)) {
			r = `dick`;
			if (slave.visualAge > 55) {
				r = `${r}GILF`;
			} else if (slave.visualAge > 35) {
				r = `${r}MILF`;
			} else if (slave.visualAge >= 25) {
				r = `${r}slave`;
			} else {
				r = `${r}girl`;
			}
			if ((slave.muscles > 30) && (slave.height < 185)) {
				r = `muscle${r}`;
			} else if ((slave.lactation > 0) && (slave.boobs > 2000)) {
				r = `${r} cow`;
			} else if ((slave.boobsImplant > 0) && (slave.buttImplant > 0)) {
				r = `${r} bimbo`;
			} else if (slave.boobs > 6000) {
				r = `boob ${r}`;
			} else if (slave.butt > 6) {
				r = `ass ${r}`;
			}
		}

		if ((slave.muscles > 30) && (slave.height > 185)) {
			r = `amazon ${r}`;
		} else if ((slave.muscles < 30) && (slave.height > 185)) {
			r = `statuesque ${r}`;
		} else if ((slave.boobs < 800) && (slave.height < 150)) {
			r = `petite ${r}`;
		} else if ((slave.boobs > 800) && (slave.height < 150)) {
			r = `shortstack ${r}`;
		}

		if (slave.counter.births >= 5) {
			r = `${r} broodmother`;
		} else if (slave.counter.births >= 2) {
			r = `${r} breeder`;
		}

		if (slave.geneticQuirks.albinism === 2) {
			r = `albino ${r}`;
		}

		if (slave.indenture > -1) {
			r = `indentured ${r}`;
		}

		if (slave.preg > slave.pregData.normalBirth / 4 && slave.pregKnown === 1) {
			r = `pregnant ${r}`;
		} else if (slave.bellyFluid >= 5000) {
			r = `bloated ${r}`;
		} else if (slave.belly >= 5000) {
			r = `gravid ${r}`;
		}

		if (slave.fuckdoll > 0) {
			r = `${r} fuckdoll`;
		}
	}
	return r;
};

/**
 * Phenotype sex: a three-character string that encodes state of sexual organs
 * as female('X'), male('Y'), both ('H'), or absent ('-'): vagina/dick, ovaries/balls, tits
 * @param {FC.HumanState} human
 * @returns {string}
 */
globalThis.phenotypeSex = function(human) {
	const encode = (haveFemale, haveMale) =>
		'-XYH'[haveFemale + haveMale * 2];
	return encode(human.vagina > -1, human.dick > 0) +
		encode(human.ovaries > 0, human.balls > 0) +
		encode(human.boobs > 0, false);
};

/**
 * @param {FC.SlaveState} slave
 */
globalThis.DegradingName = function(slave) {
	const leadershipPosition = [
		Job.ATTENDANT,
		Job.MATRON,
		Job.STEWARD,
		Job.MILKMAID,
		Job.FARMER,
		Job.DJ,
		Job.CONCUBINE,
		Job.MADAM,
		Job.TEACHER,
		Job.WARDEN,
		Job.NURSE,
		Job.HEADGIRL,
		Job.BODYGUARD,
		Job.RECRUITER
	];

	if (slave.fuckdoll > 0) {
		slave.slaveName = `Fuckdoll No. ${slave.ID}`;
		slave.slaveSurname = 0;
		return;
	} else if (slave.assignment === Job.DAIRY && V.dairyRestraintsSetting >= 2) {
		slave.slaveName = `Bioreactor No. ${slave.ID}`;
		slave.slaveSurname = 0;
		return;
	}
	const names = [];
	const suffixes = [];
	if (V.seeRace === 1) {
		switch (slave.race) {
			case "white":
				names.push("Pale", "White");
				break;
			case "asian":
				names.push("Asian", "Yellow");
				break;
			case "latina":
				names.push("Brown", "Latina");
				break;
			case "black":
				names.push("Black", "Dark");
				break;
			case "pacific islander":
				names.push("Islander", "Pacific", "Sea");
				break;
			case "malay":
				names.push("Cinnamon", "Pinoy", "Spice");
				break;
			case "southern european":
				names.push("Mediterranean", "Olive");
				break;
			case "amerindian":
				names.push("Indian", "Reservation");
				break;
			case "semitic":
				names.push("Semite", "Semitic");
				break;
			case "middle eastern":
				names.push("Arab", "Sand");
				break;
			case "indo-aryan":
				names.push("Brown", "Indian");
				break;
			case "mixed race":
				names.push("Mixed", "Mulatto", "Mutt");
				break;
			case "catgirl":
				names.push("Cat", "Furry", "Feline");
				break;
		}
	}
	names.push(slave.hColor);
	if (!hasAnyEyes(slave)) {
		names.push("Blind", "Eyeless", "Sightless");
	}
	if (slave.hears === -2) {
		names.push("Deaf", "Earless", "Unhearing");
	}
	if (slave.boobs >= 2000) {
		suffixes.push("Boob", "Boobs", "Titty");
	}
	if (slave.boobs < 500 && slave.butt < 3) {
		names.push("Girly", "Slim", "Thin");
	}
	if (slave.boobs < 300) {
		names.push("Flat");
	}
	if (slave.anus > 2 || slave.vagina > 2) {
		names.push("Gaping", "Hallway", "Slit", "Wideopen");
	}
	if (slave.weight > 160) {
		names.push("Blimp", "Cow", "Fat", "Fatass", "Whale");
	} else if (slave.weight > 30) {
		names.push("Chubby", "Fat", "Whale");
	} else if (slave.weight <= -30) {
		names.push("Bony", "Rail", "Skinny");
	}
	if (slave.muscles > 30) {
		names.push("Huge", "Muscles", "Ripped", "Strong");
	}
	if (slave.fetishKnown === 1) {
		if (slave.fetish === "buttslut") {
			names.push("Anal", "Sodomy");
		}
		if (slave.fetish === "cumslut") {
			names.push("Cum", "Dicksuck", "Sucker");
		}
		if (slave.fetish === "humiliation") {
			names.push("Rape");
		}
		if (slave.fetish === "masochist") {
			names.push("Pain", "Rape", "Struggle");
		}
		if (slave.fetish === "pregnancy") {
			names.push("Fertile");
		}
	}
	if (App.Medicine.fleshSize(slave, 'boobs') * slave.lactation > 1000) {
		names.push("Creamy", "Milky");
		suffixes.push("Cow");
	}
	if (slave.skill.oral <= 30 && slave.skill.anal <= 30) {
		names.push("Cheap", "Fail", "Gutter");
	}
	if (slave.nipples === "fuckable") {
		names.push("Nipplefuck", "Nipplecunt");
	} else if (slave.nipples === "flat") {
		names.push("Pancakes", "Stretched");
	} else if (slave.nipples !== "tiny" && slave.nipples !== "cute") {
		names.push("Pointy", "Titclit");
		suffixes.push("Nipples");
	}
	if (slave.visualAge > 35) {
		names.push("Mature");
		suffixes.push("Cougar", "MILF");
	} else if (slave.visualAge < 25) {
		names.push("Girly", "Thin", "Young");
	}
	if (isAmputee(slave)) {
		names.push("Stumpy");
		suffixes.push("Stumpy");
	}
	if (slave.boobsImplant > 1000 || slave.buttImplant > 3) {
		names.push("Fake", "Plastic", "Silicone");
	}
	if (slave.dick > 5 && slave.balls > 5) {
		names.push("Potent");
		suffixes.push("Cannon", "Daddy");
	}
	if (slave.preg > slave.pregData.normalBirth / 1.33) {
		if (slave.broodmother === 2) {
			names.push("Bursting", "Seeded");
			suffixes.push("Factory", "Nursery");
		} else if (slave.broodmother === 1) {
			names.push("Bloated", "Stuffed");
			suffixes.push("Breeder", "Factory");
		}
	}
	if (slave.bellyPreg >= 450000) {
		names.push("Bulging", "Squirming");
	}
	if (slave.bellyPreg >= 5000) {
		names.push("Preg");
		suffixes.push("Belly", "Mommy");
	}
	if (slave.belly > 150000) {
		suffixes.push("Balloon");
	}
	if (slave.belly > 1500) {
		suffixes.push("Belly");
	}
	if (slave.dick > 0) {
		if (slave.dick > 4) {
			names.push("Dangle", "Hung");
			suffixes.push("Cock", "Dick");
		}
		if (slave.balls === 0) {
			names.push("Cut", "Gelded", "Soft");
		} else {
			names.push("Erect", "Hard", "Stiff");
		}
	}
	if (slave.dick === 1) {
		names.push("Micro", "Tiny");
		suffixes.push("Bitch");
	}
	if (slave.height >= 185) {
		names.push("Tall", "Top");
		suffixes.push("Tower");
	} else if (slave.height < 150) {
		names.push("Stumpy", "Tiny");
		suffixes.push("Shortstack", "Stumpy");
	}
	if (slave.skill.whoring > 95) {
		names.push("Money", "Street");
		suffixes.push("Whore");
	}
	if (slave.skill.entertainment > 95) {
		names.push("Easy", "Club");
		suffixes.push("Slut");
	}
	if (slave.skill.oral > 95) {
		names.push("Suck");
		suffixes.push("Throat");
	}
	if (slave.skill.vaginal > 95) {
		suffixes.push("Channel", "Kegel", "Pussy");
	}
	if (slave.skill.anal > 95) {
		suffixes.push("Asspussy", "Sphincter");
	}
	if (slave.skill.penetrative > 95) {
		names.push("Plowhorse");
		if (slave.dick > 0) {
			names.push("Boytoy");
		}
		if (!canAchieveErection(slave)) {
			suffixes.push("Pegger");
		}
	}
	if (slave.intelligence + slave.intelligenceImplant > 50) {
		names.push("Bright", "Clever", "Smart");
		if (slave.intelligenceImplant >= 15) {
			names.push("College", "Graduate", "Nerdy");
		}
	} else if (slave.intelligence + slave.intelligenceImplant < -50) {
		names.push("Cretin", "Dumb", "Retarded", "Stupid");
	}
	if (slave.vagina === 1 && slave.skill.vaginal <= 10) {
		names.push("Fresh", "New", "Tight");
	}
	if (slave.devotion < -75) {
		names.push("Angry", "Biter", "Caged");
	} else if (slave.devotion < -50) {
		names.push("Cell", "Cuffs");
	} else if (slave.devotion < -20) {
		names.push("Bag", "Box");
	} else if (slave.devotion <= 20) {
		names.push("Sad", "Whiner");
	} else if (slave.devotion > 50) {
		names.push("Prize");
		if (slave.visualAge > 35) {
			names.push("Queen");
		} else if (slave.visualAge < 25) {
			names.push("Princess");
		}
	}
	if (slave.trust < -50) {
		names.push("Screaming");
		suffixes.push("Sobber");
	} else if (slave.trust < -20) {
		names.push("Crying");
		suffixes.push("Meat", "Tears", "Thing", "Weeper");
	} else if (slave.trust < 20) {
		names.push("Begging");
	}

	if (slave.dick === 0) {
		if (slave.vagina === -1) {
			suffixes.push("Null");
		} else {
			if (slave.visualAge < 25) {
				suffixes.push("Girl");
			}
		}
	} else {
		if (slave.vagina !== -1) {
			suffixes.push("Futa");
		} else {
			if (slave.balls > 0) {
				if (slave.boobs > 300 && slave.butt > 2) {
					// SHEMALES: cock & balls, T&A above minimum
					suffixes.push("Shemale");
				} else {
					if (slave.shoulders < 1 && slave.muscles <= 30) {
						if (slave.faceShape === "masculine" || slave.faceShape === "androgynous") {
							// SISSIES: feminine shoulders or muscles, masculine faces
							suffixes.push("Sissy");
						} else {
							// TRAPS: feminine shoulders or muscles, feminine faces
							suffixes.push("Trap");
						}
					} else {
						// BITCHES: masculine shoulders or muscles
						suffixes.push("Bitch");
					}
				}
			} else {
				if (slave.visualAge > 35) {
					suffixes.push("DickMILF");
				} else if (slave.visualAge >= 25) {
					suffixes.push("Dickslave");
				} else {
					suffixes.push("Dickgirl");
				}
			}
		}
	}
	if (slave.anus > 0) {
		suffixes.push("Anus", "Asshole", "Backdoor", "Butt", "Butthole");
	}
	if (slave.anus === 1) {
		suffixes.push("Tightass", "Tightbutt");
	}
	if (slave.vagina > 0) {
		suffixes.push("Cunt", "Pussy", "Vagina");
	}
	if (slave.boobs < 500 && slave.butt < 3 && slave.dick > 0) {
		suffixes.push("Bitch", "Bottom", "Sissy", "Trap");
	}
	if (slave.energy > 95) {
		suffixes.push("Fuck", "Fuckaddict", "Nympho", "Sexaddict");
	}
	if (slave.fetishKnown === 1) {
		if (slave.fetish === "humiliation") {
			suffixes.push("Rapebait", "Showgirl");
		}
		if (slave.fetish === Fetish.SUBMISSIVE) {
			suffixes.push("Bottom", "Fuckee", "Rapebait");
		}
		if (slave.fetish === "dom") {
			suffixes.push("Dom", "Fucker", "Top");
		}
		if (slave.fetish === "pregnancy") {
			suffixes.push("Breeder", "Mommy");
		}
		if (slave.fetish === "boobs") {
			suffixes.push("Boob", "Boobie", "Tit", "Titty");
		}
	}
	if (slave.counter.births >= 2) {
		suffixes.push("Breeder");
		if (slave.counter.births >= 5) {
			suffixes.push("Broodmother");
		}
	}
	if (slave.areolae > 2) {
		suffixes.push("Areolas", "Headlights");
	}
	if (slave.lips > 40) {
		suffixes.push("Lips", "Pillows");
	}
	if (slave.labia > 1) {
		suffixes.push("Curtains", "Flower", "Lips");
	}
	if (slave.breedingMark === 1 && V.propOutcome === 1 && FutureSocieties.isActive('FSRestart')) {
		suffixes.push("Breeder", "Oven", "Womb");
	}
	if (slave.butt > 5) {
		suffixes.push("Ass", "Bottom", "Butt");
	}
	if (slave.vagina === 0) {
		suffixes.push("Virgin");
	}

	slave.slaveName = jsEither(names);

	if (leadershipPosition.includes(slave.assignment)) {
		switch (slave.assignment) {
			case Job.ATTENDANT:
				slave.slaveName = jsEither(["Bath", "Spa"]);
				break;
			case Job.MATRON:
				slave.slaveName = jsEither(["Matron", "Nursery"]);
				break;
			case Job.STEWARD:
				slave.slaveName = jsEither(["Maid", "Servant"]);
				break;
			case Job.MILKMAID:
				if (cumSlaves().length > 3) {
					slave.slaveName = jsEither(["Fucker", "Milker"]);
				} else {
					slave.slaveName = jsEither(["Dairy", "Farm"]);
				}
				break;
			case Job.FARMER:
				slave.slaveName = jsEither(["Farmer", "Farmhand"]);
				break;
			case Job.DJ:
				slave.slaveName = jsEither(["Bass", "Booth"]);
				break;
			case Job.CONCUBINE:
				slave.slaveName = jsEither(["Bed", "Master"]);
				break;
			case Job.MADAM:
				slave.slaveName = jsEither(["Madam", "Pimp"]);
				break;
			case Job.TEACHER:
				slave.slaveName = jsEither(["Classroom", "Teacher"]);
				break;
			case Job.WARDEN:
				slave.slaveName = jsEither(["Jail", "Prison"]);
				break;
			case Job.NURSE:
				slave.slaveName = jsEither(["Clinic", "Nurse"]);
				break;
			case Job.HEADGIRL:
				slave.slaveName = jsEither(["Chief", "Head"]);
				break;
			case Job.BODYGUARD:
				slave.slaveName = jsEither(["Battle", "Guard"]);
				break;
			case Job.RECRUITER:
				slave.slaveName = jsEither(["Cam", "Recruiter"]);
				break;
		}
	}
	const surname = jsEither(suffixes);
	if (typeof surname === "string" && surname.toLowerCase() === slave.slaveName.toLowerCase()) {
		DegradingName(slave);
	}
	slave.slaveName = capFirstChar(slave.slaveName);
	slave.slaveSurname = surname;
};

/**
 * @param {FC.SlaveState} slave
 */
globalThis.PaternalistName = function(slave) {
	if (slave.slaveName.search("Miss") === -1) {
		if (slave.slaveName.search("Ms.") === -1) {
			if (slave.slaveName.search("Mrs.") === -1) {
				if (slave.relationship > 4) {
					slave.slaveName = ("Mrs. " + slave.slaveName);
				} else if (slave.actualAge > 24) {
					slave.slaveName = ("Ms. " + slave.slaveName);
				} else {
					slave.slaveName = ("Miss " + slave.slaveName);
				}
			}
		}
	}
};

/**
 * @param {FC.HumanState} parent
 * @param {FC.HumanState} child
 */
globalThis.parentNames = function(parent, child) {
	let currentSlaveNames = getSlaves().map(s => s.slaveName);
	let continentNationality;
	const useMaleName = (child.genes === "XY" && V.allowMaleSlaveNames === true);

	child.slaveName = generateName(parent.nationality, child.race, useMaleName, sn => !currentSlaveNames.includes(sn));

	if (!child.slaveName) {
		for (let i = 0; i < 10; i++) {
			continentNationality = hashChoice(V.nationalities);
			child.slaveName = generateName(String(continentNationality), child.race, useMaleName, sn => !currentSlaveNames.includes(sn));
		}
	}
	if (!child.slaveName) {
		child.slaveName = generateName(parent.nationality, child.race, useMaleName);
	}
};

/**
 * @param {FC.SlaveState} slave
 * @param {number} amount
 * @returns {string}
 */
globalThis.faceIncrease = function(slave, amount) {
	const oldFace = slave.face;
	faceIncreaseAction(slave, amount);
	const newFace = slave.face;
	slave.face = oldFace;
	const desc = faceIncreaseDesc(slave, newFace);
	slave.face = newFace;
	return desc;
};

/**
 * @param {FC.HumanState} slave
 * @param {number} amount
 */
globalThis.faceIncreaseAction = function(slave, amount) {
	slave.face = Math.clamp(slave.face + amount, -100, 100);
	if (slave.face > 95) {
		slave.face = 100;
	}
};

/**
 * Describes the slave face changes BEFORE they are applied to the slave
 *
 * @param {FC.SlaveState} slave
 * @param {number} newFace
 * @returns {string}
 */
globalThis.faceIncreaseDesc = function(slave, newFace) {
	const pronouns = getPronouns(slave);
	const his = pronouns.possessive;
	const His = capFirstChar(his);
	let r = "";
	if (slave.face <= -95) {
		r += `<span class="green">${His} face is no longer horrifying,</span> and is now merely ugly.`;
	} else if (slave.face <= -40 && newFace > -40) {
		r += `<span class="green">${His} face is no longer ugly,</span> and is now merely unattractive.`;
	} else if (slave.face <= -10 && newFace > -10) {
		r += `<span class="green">${His} face is no longer unattractive,</span> and is now somewhat tolerable.`;
	} else if (slave.face <= 10 && newFace > 10) {
		r += `<span class="green">${His} face is now decently attractive,</span> rather than merely tolerable.`;
	} else if (slave.face <= 40 && newFace > 40) {
		r += `<span class="green">${His} face is now quite beautiful,</span> rather than merely pretty.`;
	} else if (slave.face <= 95 && newFace > 95) {
		r += `<span class="green">${His} face is now perfect.</span> It's difficult to imagine how it could be any more beautiful.`;
	}
	return r;
};

/**
 * @typedef {object} DeadlinessEffect
 * @property {string} effect
 * @property {number} value
 */

/**
 * @param {FC.SlaveState} slave
 * @returns {{effects: Array<DeadlinessEffect>, value: number}}
 */
globalThis.deadliness = function(slave) {
	/**
	 * @type {Array<DeadlinessEffect>}
	 */
	let deadlinessArr = [];
	let deadlinessSum = 0;

	adjust("Base Deadliness", 2);

	combatSkill();
	bodyguardSkill();
	age();
	musclesAndHeight();
	health();
	assets();
	weight();
	bellyAndPregnancy();
	genitals();
	limbs();
	senses();
	otherProsthetics();
	tiredness();

	if (deadlinessSum < 1) {
		adjust("Minimum deadliness", 1 - deadlinessSum);
	}

	return {value: deadlinessSum, effects: deadlinessArr};

	/**
	 * @param {string} effect
	 * @param {number} value
	 */
	function adjust(effect, value) {
		if (value !== 0) {
			deadlinessArr.push({effect: effect, value: value});
			deadlinessSum += value;
		}
	}

	function combatSkill() {
		// The last part of the skill is useless in one-to-one combat -> max 3
		adjust("Skill: Combat", Math.min(Math.floor(slave.skill.combat / 3.0) / 10, 3));
	}

	function bodyguardSkill() {
		if (App.Data.Careers.Leader.bodyguard.includes(slave.career) ||
			slave.skill.bodyguard >= Constant.MASTERED_XP) {
			adjust("Skill: Bodyguard", 2);
		}
	}

	function age() {
		if (V.AgePenalty !== 0) {
			if (slave.physicalAge >= 100) {
				adjust("Age: 100", -10);
			} else if (slave.physicalAge >= 85) {
				adjust("Age: 85", -3);
			} else if (slave.physicalAge >= 70) {
				adjust("Age: 70", -1);
			}
		}
	}

	function musclesAndHeight() {
		if (slave.muscles > 30 && slave.muscles <= 95) {
			adjust(`Muscles: Decent (${slave.muscles})`, 1);
		} else if (slave.muscles > 95 && slave.height >= 185) {
			adjust("Musclebeast", 2);
		} else if (slave.muscles > 95) {
			adjust(`Musclebound (${slave.muscles})`, -1);
		} else if (slave.muscles < -95) {
			adjust(`Muscles: Frail (${slave.muscles})`, -20);
		} else if (slave.muscles < -30) {
			adjust(`Muscles: Very Weak (${slave.muscles})`, -7);
		} else if (slave.muscles < -5) {
			adjust(`Muscles: Weak (${slave.muscles})`, -3);
		}

		if (slave.height >= 170) {
			adjust("Tall", 1);
		}
	}

	function health() {
		if (slave.health.condition > 50) {
			adjust("Health: Good", 1);
		} else if (slave.health.condition < -50) {
			adjust("Health: Bad", -1);
		}

		if (slave.health.illness > 3) {
			adjust(`Ill: ${slave.health.illness}`, -3);
		} else if (slave.health.illness > 1) {
			adjust(`Ill: ${slave.health.illness}`, -2);
		} else if (slave.health.illness > 0) {
			adjust(`Ill: ${slave.health.illness}`, -1);
		}
	}

	function assets() {
		if (slave.boobs > 4000) {
			adjust("Boobs: Huge", -2);
		} else if (slave.boobs > 2000) {
			adjust("Boobs: Large", -1);
		}

		if (slave.butt > 6) {
			adjust("Butt: Huge", -1);
		}

		if (slave.hips > 2) {
			adjust("Hips: Wide", -1);
		}
	}

	function weight() {
		if (slave.weight > 190) {
			adjust(`Weight: Super Obese (${slave.weight})`, -20);
		} else if (slave.weight > 160) {
			adjust(`Weight: Obese (${slave.weight})`, -10);
		} else if (slave.weight > 130) {
			adjust(`Weight: Overweight (${slave.weight})`, -3);
		} else if (slave.weight > 30) {
			adjust(`Weight: Chubby (${slave.weight})`, -1);
		} else if (slave.weight < -10) {
			adjust(`Weight: Underweight (${slave.weight})`, -1);
		}
	}

	function bellyAndPregnancy() {
		if (slave.bellyFluid >= 10000) {
			adjust(`Belly Fluid (${slave.bellyFluid})`, -3);
		} else if (slave.bellyFluid >= 5000) {
			adjust(`Belly Fluid (${slave.bellyFluid})`, -2);
		} else if (slave.bellyFluid >= 2000) {
			adjust(`Belly Fluid (${slave.bellyFluid})`, -1);
		}

		if (slave.pregKnown === 1 || slave.bellyPreg >= 1500 || slave.bellyImplant >= 1500) {
			if (slave.belly >= 750000) {
				adjust(`Pregnancy (${slave.belly})`, -50);
			} else if (slave.belly >= 600000) {
				adjust(`Pregnancy (${slave.belly})`, -25);
			} else if (slave.belly >= 450000) {
				adjust(`Pregnancy (${slave.belly})`, -15);
			} else if (slave.belly >= 300000) {
				adjust(`Pregnancy (${slave.belly})`, -10);
			} else if (slave.belly >= 150000) {
				adjust(`Pregnancy (${slave.belly})`, -8);
			} else if (slave.belly >= 100000) {
				adjust(`Pregnancy (${slave.belly})`, -7);
			} else if (slave.belly >= 10000) {
				adjust(`Pregnancy (${slave.belly})`, -3);
			} else if (slave.belly >= 5000) {
				adjust(`Pregnancy (${slave.belly})`, -2);
			} else {
				adjust(`Pregnancy (${slave.belly})`, -1);
			}
		}

		if (isInLabor(slave)) {
			adjust("In labor: Yes", -15);
		} else if (slave.preg >= slave.pregData.normalBirth && slave.pregControl !== "labor suppressors") {
			adjust("In labor: Soon", -5);
		}
	}

	function genitals() {
		if (slave.balls >= 15) {
			adjust("Balls: 15", -1);
		}

		if (slave.dick >= 10) {
			adjust("Dick: 10", -1);
		}
	}

	function limbs() {
		adjust(`Missing limb(s): ${getLimbCount(slave, 0)}`, -5 * getLimbCount(slave, 0));
		adjust(`Basic prosthetic: ${getLimbCount(slave, 2)}`, -0.25 * getLimbCount(slave, 2));
		adjust(`Sex prosthetic: ${getLimbCount(slave, 3)}`, -0.25 * getLimbCount(slave, 3));
		adjust(`Beauty prosthetic: ${getLimbCount(slave, 4)}`, -0.25 * getLimbCount(slave, 4));
		adjust(`Combat prosthetic: ${getLimbCount(slave, 105)}`, 1.25 * getLimbCount(slave, 105));
		adjust(`Cybernetics: ${getLimbCount(slave, 6)}`, 2.5 * getLimbCount(slave, 6));
		if (hasBothLegs(slave) && !canStand(slave) && getLimbCount(slave, 106) < 4) {
			adjust("Immobile", -20);
		}
	}

	function senses() {
		if (!canSee(slave)) {
			adjust("Blind", -8);
		} else if (!canSeePerfectly(slave)) {
			adjust("Bad eyes", -1);
		}

		if (!canHear(slave)) {
			adjust("Deaf", -4);
		} else if ((slave.hears === -1 && slave.earwear !== "hearing aids") || (slave.hears === 0 && slave.earwear === "muffling ear plugs")) {
			adjust("Bad hearing", -1);
		}
	}

	function otherProsthetics() {
		if (["combat", "stinger"].includes(slave.tail)) {
			adjust("Combat tail", 2);
		}

		if (["falcon", "arachnid", "kraken"].includes(slave.appendages)) {
			adjust("Extra limbs", 3);
		}
	}

	function tiredness() {
		if (slave.health.tired > 90) {
			adjust(`Tired (${slave.health.tired})`, -10);
		} else if (slave.health.tired > 60) {
			adjust(`Tired (${slave.health.tired})`, -3);
		} else if (slave.health.tired > 30) {
			adjust(`Tired (${slave.health.tired})`, -1);
		}
	}
};

/**
 * Show an itemized breakdown of the deadliness value of the slave.
 * @param {FC.SlaveState} slave
 * @returns {HTMLSpanElement}
 */
globalThis.DeadlinessTooltip = function(slave) {
	const dl = deadliness(slave);
	const span = App.UI.DOM.makeElement("span", _.round(dl.value, 2).toString());
	span.tabIndex = 0;
	span.classList.add("has-tooltip");
	tippy(span, {
		content: DeadlinessDisplay(),
		interactive: true,
		placement: "right",
	});
	return span;

	function DeadlinessDisplay() {
		const el = document.createElement("div");
		el.classList.add("tip-details");
		el.append(RelativeDataTable(dl.effects, "effect", "value", [1, 10]));
		return el;
	}
};

/**
 * Compare two deadliness values and return the probability that the first of them wins a fair fight.
 * @param {number} deadliness1 deadliness of the first fighter
 * @param {number} deadliness2 deadliness of the second fighter
 * @param {number} [limit] the probability that a MUCH stronger fighter will win the fight (50 means skill doesn't matter, 100 means nothing but skill matters)
 * @param {number} [steepness] the steepness of the probability gradient when fighters are closely matched (1 reaches the limit in about 5 points of deadliness, while 10 reaches the limit in about 1/2 point)
 * @returns {number} the probability that the first fighter wins
 */
globalThis.fightProbability = function(deadliness1, deadliness2, limit = 99, steepness = 0.8) {
	// generate results with the probability selected by a smooth symmetric sigmoid curve (c/(1+e^-kx)+d) centered at (0,50).

	// diff is the difference in fighter strength. positive favors fighter1, negative favors fighter2.
	const diff = deadliness1 - deadliness2;
	const advantage = limit - 50;
	const offset = 50 - advantage;

	// select the probability from the sigmoid
	return (2 * advantage) / (1 + Math.pow(Math.E, -steepness * diff)) + offset;
};

/** Is the slave ready to retire?
 * @param {FC.SlaveState} slave
 * @returns {boolean}
 */
globalThis.retirementReady = function(slave) {
	// indentured slaves don't retire, they expire
	if (slave.indenture >= 0) {
		return false;
	}

	// retirement by age
	if (V.policies.retirement.physicalAgePolicy === 0 && slave.actualAge >= V.retirementAge) {
		return true;
	} else if (V.policies.retirement.physicalAgePolicy === 1 && slave.physicalAge >= V.retirementAge) {
		return true;
	}

	// retirement by milestone
	if (V.policies.retirement.sex > 0 && (slave.counter.oral + slave.counter.anal + slave.counter.vaginal + slave.counter.penetrative + slave.counter.mammary) >= V.policies.retirement.sex) {
		return true;
	}
	if (V.policies.retirement.milk > 0 && slave.counter.milk >= V.policies.retirement.milk) {
		return true;
	}
	if (V.policies.retirement.cum > 0 && slave.counter.cum >= V.policies.retirement.cum) {
		return true;
	}
	if (V.policies.retirement.births > 0 && slave.counter.births >= V.policies.retirement.births) {
		return true;
	}
	if (V.policies.retirement.kills > 0 && slave.counter.pitKills >= V.policies.retirement.kills) {
		return true;
	}
	if (V.policies.retirement.income > 0 && (slave.lifetimeCashIncome - slave.lifetimeCashExpenses) >= V.policies.retirement.income) {
		return true;
	}


	// no retirement for you
	return false;
};

/** marks some weeks of time passage for a slave, counting birthdays and invoking aging if game settings require it
 * @param {FC.SlaveState} slave
 * @param {number} [weeks=1]
 */
globalThis.ageSlaveWeeks = function(slave, weeks = 1) {
	if (V.seeAge !== 0) { // birthdays enabled
		for (let i = 0; i < weeks; ++i) {
			slave.birthWeek++;
			if (slave.birthWeek >= 52) {
				slave.birthWeek = 0;
				if (V.seeAge === 1) { // actual aging enabled
					ageSlave(slave);
				}
			}
		}
	}
	if (slave.geneMods.progenitor === 1 && canGetPregnant(slave)) { // Progenitor mod causes ovarian burnout if not put to use.
		if (slave.geneticQuirks.superfetation === 2 && slave.womb.length > 0) {
			slave.ovaryAge += 0.1;
		} else {
			slave.ovaryAge += 0.4;
		}
	}
};

/** advances the age of a slave by one year, incurring all aging side effects
 *  Note that this function does NOT currently handle puberty, or teeth.
 * @param {FC.SlaveState} slave
 * @param {boolean} [forceDevelopment=false]
 */
globalThis.ageSlave = function(slave, forceDevelopment = false) {
	slave.physicalAge++;
	slave.actualAge++;
	if (slave.geneMods.NCS === 1 || (slave.geneticQuirks.neoteny >= 2 && slave.geneticQuirks.progeria !== 2)) {
		/* Induced NCS completely takes over visual aging. Additionally, because of the neoteny aspects of NCS, ovaries don't age quite as fast. */
		/* Unsurprisingly, actual neoteny has the same effect as long as progeria isn't in play. */
		slave.ovaryAge += jsSeededEither(slave.natural.artSeed + slave.ovaryAge, [0.5, 0.6, 0.7, 0.7, 0.8, 0.9, 1.0]);
	} else {
		slave.visualAge++;
		slave.ovaryAge += jsSeededEither(slave.natural.artSeed + slave.ovaryAge, [0.8, 0.9, 0.9, 1.0, 1.0, 1.0, 1.1]);
	}
	if (slave.broodmother === 1) {
		slave.ovaryAge += 0.2;
	}
	if ((slave.ovaries > 0 || slave.mpreg > 0) && slave.ovaryAge < 0) {
		slave.ovaryAge = -100; // reset immortal ovaries every year
	}
	if (slave.physicalAge <= 20 && (forceDevelopment || V.loliGrow > 0)) {
		App.EndWeek.Shared.physicalDevelopment(slave);
	}
};

/**
 * Modify a pre-generated slave for pedo mode; it's intended mostly for the starting "hero slaves". Will only alter slaves aged 18+, and returns younger ones unchanged.
 * Unless a specific new age is supplied, the new age is proportional to the old age, on a sliding (square root) scale, with a min equal to higher of V.minimumSlaveAge and 12.
 * Attribute scaling is based (roughly) on the distributions for each age in GenerateNewSlave, with some allowances for how young slaves in a pedo mode arcology would be treated
 * (e.g., no more likely to be virgins than the originals).
 *
 * We also leave education and career untouched: while they should change, in theory, in some cases they're integral to the character in question.
 *
 * The function turns 18-year-olds into the minimum legal age, and makes the oldest slaves 18, so there's a little bit of overlap between the original and target
 * ranges.
 *
 * PM: Tweak controls the modified lolifier. Aims for 8-12 and will scale off V.minimumSlaveAge.
 *
 * @param {FC.SlaveState} slave
 * @param {boolean} tweak
 * @param {number} newAge
 */
globalThis.lolifySlave = function(slave, tweak = false, newAge=undefined) {
	// Return without changes if the slave is already a loli.
	if ((slave.actualAge <= 17 || newAge >= 18) && !tweak) {
		return slave;
	}

	// Before we change the physical age in adjustAge, we need to save the original value, which we'll need in the face adjustment functions.
	const oldPhysicalAge =  slave.physicalAge;
	adjustAge();

	// Adjust physical attributes. We account for surgical alterations to genitalia, but if hormones have caused massive alterations to body proportions, all bets are off.
	slave.height = Height.forAge(slave.natural.height, slave);
	if (slave.genes === "XX") {
		adjustXXUpperTorso();
		adjustXXLowerTorso();
		if (slave.vagina > -1) {
			adjustVagina();
		}
		if (slave.dick > 0) {
			adjustDick();
		}
		adjustXXButt();
		adjustXXBoobs();
		adjustXXFace();
		adjustXXPregAdaptation();
		adjustXXVoice();
		adjustTeeth();
	} else {
		adjustXYUpperTorso();
		adjustXYLowerTorso();
		if (slave.vagina > -1) {
			adjustVagina();
		}
		if (slave.dick > 0) {
			adjustDick();
		}
		adjustXYButt();
		adjustXYBoobs();
		adjustXYFace();
		adjustXYPregAdaptation();
		adjustXYVoice();
		adjustTeeth();
	}
	if (slave.preg > 0) {
		slave.pubertyXX = 1;
	}

	function adjustAge() {
		/* Generally, the things that make physicalAge, visualAge, and ovaryAge different from actualAge don't apply to slaves 18 and under, so in
			most cases we base the new age on the old actualAge, and give the same new value to physicalAge, visualAge, and ovaryAge. Body swaps
			are an exception. We don't touch birth week, because messing with it can cause some problems with lolifying siblings.*/
		const oldAge = (slave.bodySwap === 0 ? slave.actualAge : slave.physicalAge);
		const minAge = Math.max(V.minimumSlaveAge, 12); // Age floor of 12 prevents a lot of weirdness with origins, careers, etc.
		const adultScale = Math.sqrt(V.retirementAge  - 2 - 18);
		const loliScale = 18 - minAge;
		const ageScaleRatio = loliScale / adultScale;
		if (newAge === undefined) {
			newAge = Math.min(Math.round((Math.sqrt(oldAge - 18)) * ageScaleRatio) + minAge, 18);
		}
		if (slave.bodySwap === 0) {
			slave.actualAge = newAge;
		}
		slave.physicalAge = newAge;
		slave.visualAge = newAge;
		slave.ovaryAge = newAge;
		slave.ageImplant = 0;
	}

	function adjustXXLowerTorso() {
		if (slave.physicalAge <= 11) {
			// @ts-expect-error Type 'number' is not assignable to type ...
			slave.hips = Math.max(slave.hips - 2, -2);
		} else if (slave.physicalAge <= 13) {
			// @ts-expect-error Type 'number' is not assignable to type ...
			slave.hips = Math.max(slave.hips - 1, -2);
		}
	}

	function adjustXYLowerTorso() {
		if (slave.physicalAge <= 11) {
			// @ts-expect-error Type 'number' is not assignable to type ...
			slave.hips = Math.min(slave.hips - 1, -2);
		}
		if  (slave.physicalAge <= 13) {
			slave.waist = Math.clamp(Math.round(slave.waist / 2) + 5, -15, 25);
		}
	}

	function adjustXXUpperTorso() {
		if (slave.physicalAge <= 11) {
			// @ts-expect-error Type 'number' is not assignable to type ...
			slave.shoulders = Math.min(slave.shoulders - 1, -2);
		}
	}

	function adjustXYUpperTorso() {
		if (slave.physicalAge <= 11) {
			// @ts-expect-error Type 'number' is not assignable to type ...
			slave.shoulders = Math.max(slave.shoulders - 2, -2);
		} else if (slave.physicalAge <= 13) {
			// @ts-expect-error Type 'number' is not assignable to type ...
			slave.shoulders = Math.max(slave.shoulders - 1, -2);
		}
	}

	function adjustVagina() {
		slave.vagina = Math.min(slave.vagina, 1);
		if (slave.physicalAge <= 11) {
			if (slave.clit > 0 && random(1, 3) > 1) {
				slave.clit = 1;
			} else {
				slave.clit = 0;
			}
		} else if (slave.physicalAge <= 13) {
			if (slave.clit > 0 && random(1, 3) <= 2) {
				slave.clit = 1;
			}
		} else if (slave.physicalAge <= 15) {
			if (slave.clit === 1 && random(1, 2) === 1) {
				slave.clit =  0;
			}
		}
		if (slave.physicalAge <= 11) {
			if (slave.labia > 0 && random(1, 3) === 1) {
				slave.labia = 1;
			} else {
				slave.labia = 0;
			}
		} else if (slave.physicalAge <= 12) {
			if (slave.labia > 0 && random(1, 2) === 1) {
				slave.labia = 1;
			} else {
				slave.labia = 0;
			}
		} else if (slave.physicalAge <= 13) {
			if (slave.labia > 0 && random(1, 3) <= 2) {
				slave.labia = 1;
			} else {
				slave.labia = 0;
			}
		} else if (slave.physicalAge <= 14) {
			if (slave.labia === 1 && random(1, 2) === 1) {
				slave.labia = 0;
			} else if (slave.labia >= 2) {
				slave.labia -= 1;
			}
		} else if (slave.physicalAge <= 15) {
			if (slave.labia === 1 && random(1, 4) === 3) {
				slave.labia = 0;
			} else if (slave.labia === 2 && random(1, 2) === 1) {
				slave.labia = 1;
			} else if (slave.labia === 3) {
				slave.labia = 2;
			}
		}
	}

	function adjustDick() {
		if (slave.physicalAge <= 7) {
			slave.dick = Math.clamp(slave.dick - 2, 1, 3);
		} else if (slave.physicalAge <= 13) {
			if (slave.geneticQuirks.wellHung === 2) {
				slave.dick = slave.dick - random(2, 3);
			} else {
				slave.dick = Math.clamp(slave.dick - 1, 1, 3);
			}
		} else if (slave.physicalAge <= 15) {
			if (slave.geneticQuirks.wellHung === 2) {
				slave.dick = slave.dick - random(1, 2);
			} else {
				slave.dick = Math.clamp(slave.dick - 1, 1, 3);
			}
		} else if (slave.physicalAge <= 17) {
			if (slave.geneticQuirks.wellHung === 2) {
				slave.dick = slave.dick - random(0, 1);
			} else {
				slave.dick = Math.clamp(slave.dick - 1, 1, 3);
			}
		}
		const scrotumModifier = slave.scrotum - slave.balls;
		if (slave.balls > 0) {
			if (slave.geneticQuirks.wellHung === 2) {
				slave.balls -= 1;
			}
			if (slave.physicalAge <= 13) {
				slave.balls = Math.clamp(slave.balls - 1, 1, 3);
			} else if (slave.physicalAge <= 15) {
				slave.balls = Math.clamp(slave.balls - 1, 1, 4);
			} else if (slave.physicalAge <= 17) {
				slave.balls = Math.max(slave.balls - random(0, 1), 1);
			}
			slave.scrotum = slave.balls + scrotumModifier;
		}
	}

	function adjustXXButt() {
		if (slave.physicalAge <= 11) {
			if (slave.weight > 100) {
				slave.butt = Math.round(slave.butt / 2);
			} else if (slave.weight > 10) {
				slave.butt = 2;
			} else {
				slave.butt = 1;
			}
		} else if (slave.physicalAge <= 12) {
			if (slave.weight > 100) {
				slave.butt = Math.clamp(slave.butt - 2, 1, 3);
			} else if (slave.weight > 10) {
				slave.butt = Math.clamp(slave.butt - 2, 1, 2);
			} else {
				slave.butt = Math.clamp(slave.butt - random(1, 2), 1, 2);
			}
		} else if (slave.physicalAge <= 13) {
			if (slave.weight > 100) {
				slave.butt = Math.clamp(slave.butt - 2, 1, 4);
			} else if (slave.weight > 10) {
				slave.butt = Math.clamp(slave.butt - random(1, 2), 1, 3);
			} else {
				slave.butt = Math.clamp(slave.butt - 1, 1, 2);
			}
		} else if (slave.physicalAge <= 14) {
			if (slave.weight > 100) {
				slave.butt = Math.clamp(slave.butt - random(0, 1), 1, 5);
			} else if (slave.weight > 10) {
				slave.butt = Math.clamp(slave.butt - random(0, 1), 1, 4);
			} else {
				slave.butt = Math.clamp(slave.butt - 1, 1, 3);
			}
		} else if (slave.physicalAge <= 15) {
			if (slave.weight > 100) {
				slave.butt = Math.clamp(slave.butt - random(0, 1), 1, 5);
			} else if (slave.weight > 10) {
				slave.butt = Math.clamp(slave.butt - random(0, 1), 1, 4);
			} else {
				slave.butt = Math.clamp(slave.butt - random(0, 1), 1, 4);
			}
		}
		const analAreaModifier = slave.analArea - slave.anus;
		if (slave.anus > 1) {
			slave.anus = 1;
		}
		slave.analArea = slave.anus + analAreaModifier;
	}

	function adjustXYButt() {
		if (slave.physicalAge <= 13) {
			if (slave.weight > 100) {
				slave.butt = Math.clamp(slave.butt + 1, 1, 6);
			} else {
				slave.butt = Math.clamp(slave.butt + random(0, 1), 1, 4);
			}
		}
		const analAreaModifier = slave.analArea - slave.anus;
		if (slave.anus > 1) {
			slave.anus = 1;
		}
		slave.analArea = slave.anus + analAreaModifier;
	}

	function adjustXXBoobs() {
		if (slave.physicalAge <= 15) {
			/* The distributions exactly copy those in GenerateNewSlave, which, surprisingly, doesn't scale children's boobs to their natural boobs size.
				We do, however, account for boobs modified by weight and induced growth/shrinkage.
			*/
			const unnaturalBoobDifference = slave.boobs - slave.natural.boobs;
			if (slave.physicalAge <= 10) {
				slave.boobs = 100;
			} else if (slave.physicalAge === 11) {
				slave.boobs = jsEither([100, 100, 150, 150, 150, 300]);
			} else if (slave.physicalAge === 12) {
				slave.boobs = jsEither([100, 100, 150, 150, 150, 200, 200, 300]);
			} else if (slave.physicalAge === 13) {
				slave.boobs = jsEither([100, 150, 200, 200, 300, 300, 300, 400]);
			} else if (slave.physicalAge === 14) {
				slave.boobs = jsEither([100, 150, 200, 300, 300, 300, 350, 400, 400]);
			} else if (slave.physicalAge === 15) {
				slave.boobs = jsEither([150, 200, 300, 300, 300, 350, 350, 350, 400, 400, 450, 450]);
			}
			slave.boobs = Math.min(slave.boobs, slave.natural.boobs);
			slave.boobs = slave.boobs + unnaturalBoobDifference;
			adjustBoobShapes();
		}
	}

	function adjustXYBoobs() {
		if (slave.physicalAge <= 15) {
			const unnaturalBoobRatio = slave.boobs / 350; // Males don't express slave.natural.boobs, so we use the max natural boob size for an adult.
			if (slave.physicalAge <= 10) {
				slave.boobs = 100;
			} else if (slave.physicalAge === 11) {
				slave.boobs = jsEither([100, 100, 150]);
			} else if (slave.physicalAge === 12) {
				slave.boobs = jsEither([100, 100, 150, 150]);
			} else if (slave.physicalAge === 13) {
				slave.boobs = jsEither([100, 100, 150, 150, 200, 200]);
			} else if (slave.physicalAge === 14) {
				slave.boobs = jsEither([100, 100, 150, 150, 200, 200, 300]);
			} else {
				slave.boobs = jsEither([100, 100, 150, 150, 200, 200, 300, 300, 350, 350]);
			}
			slave.boobs = Math.round((slave.boobs * unnaturalBoobRatio) / 50) * 50;
			adjustBoobShapes();
		}
	}

	/* Keep the old boob and nipple shapes if they're still valid; otherwise, generate new ones. */
	function adjustBoobShapes() {
		/** @type {Array<FC.BreastShape>} */
		const validBoobShapes = ["normal"];
		if (slave.boobs.isBetween(250, 800)) {
			validBoobShapes.push("perky");
		}
		if (slave.boobs.isBetween(400, 1200)) {
			validBoobShapes.push("torpedo-shaped");
			validBoobShapes.push("wide-set");
		}
		if (slave.boobsImplant / slave.boobs >= 0.90) {
			validBoobShapes.push("spherical");
		}
		if (slave.weight > 95 && slave.boobs > 600) {
			validBoobShapes.push("downward-facing");
			validBoobShapes.push("saggy");
		}
		if (!(slave.boobShape in validBoobShapes)) {
			if (validBoobShapes.length === 1) {
				if (Math.random() < 0.5) {
					slave.boobShape = jsEither(validBoobShapes);
				}
			} else if (validBoobShapes.length > 1) {
				if (random(1, 3) > 1) {
					slave.boobShape = jsEither(validBoobShapes);
				}
			}
		}
		/** @type {Array<FC.NippleShape>} */
		let validNipples;
		if (slave.boobShape === "spherical") {
			validNipples = ["flat", "flat", "flat", "huge", "tiny", "tiny"];
		} else if (slave.boobs < 250) {
			validNipples = ["cute", "cute", "partially inverted", "puffy", "tiny", "tiny", "tiny", "tiny"];
		} else if (slave.boobs < 500) {
			validNipples = ["cute", "cute", "cute", "partially inverted", "puffy", "tiny"];
		} else if (slave.boobs < 1000) {
			validNipples = ["cute", "cute", "cute", "inverted", "partially inverted", "puffy", "puffy", "tiny"];
		} else {
			validNipples = ["cute", "huge", "inverted", "partially inverted", "puffy"];
		}
		if (!(slave.nipples in validNipples)) {
			slave.nipples = jsEither(validNipples);
		}
	}

	function adjustXXFace() {
		// Using random numbers to undo the original face adjustments would cause more distortion to the original distributions.
		if (oldPhysicalAge > 40) {
			slave.face += 20;
		} else if (oldPhysicalAge > 35) {
			slave.face += 15;
		} else if (oldPhysicalAge > 25) {
			slave.face += 5;
		}
		if (slave.physicalAge <= 10 && random(1, 4) === 1) {
			slave.faceShape = jsEither(["androgynous", "cute"]);
			if (slave.faceShape === "cute") {
				slave.face += random(0, 20); // Note this triggers only if we just changed shape to "cute", not if it was "cute" already.
			}
		}
	}

	function adjustXYFace() {
		if (oldPhysicalAge > 40) {
			slave.face += 20;
		} else if (oldPhysicalAge > 35) {
			slave.face += 15;
		} else if (oldPhysicalAge > 25) {
			slave.face += 5;
		}
		// Since hardenFaceShape evolves male faces through androgynous to get to masculine, we can walk the hardening process backwards, assuming the slave doesn't already have a feminine face.
		if (slave.faceShape in ["masculine", "androgynous"]) {
			const oldFaceShapeModifier = (slave.faceShape === "masculine" ? 5 : 0);
			slave.face += oldFaceShapeModifier;
			if (slave.physicalAge < 17) {
				if (slave.faceShape === "masculine") {
					if (random(1, 9) === 1) {
						slave.faceShape = "androgynous";
					}
				} else if (random(1, 4) <= 3) {
					slave.faceShape = jsEither(["exotic", "normal", "sensual"]);
				}
			}
			if (slave.physicalAge < 15) {
				if (slave.faceShape === "masculine") {
					if (random(1, 2) === 1) {
						slave.faceShape = "androgynous";
					}
				} else if (slave.faceShape === "androgynous") {
					slave.faceShape = jsEither(["cute", "exotic", "normal", "sensual"]);
				}
			}
			if (slave.physicalAge < 13) {
				if (slave.faceShape === "masculine") {
					if (random(1, 3) <= 2) {
						slave.faceShape = "androgynous";
					}
				} else if (slave.faceShape === "androgynous") {
					slave.faceShape = jsEither(["cute", "exotic", "normal", "normal", "sensual"]);
				}
			}
			if (slave.physicalAge < 11) {
				if (slave.faceShape === "masculine") {
					slave.faceShape = "androgynous";
				} else if (random(1, 7) === 1) {
					slave.faceShape = "cute";
				}
			}
			let newFaceShapeModifier = 0;
			if (slave.faceShape === "masculine") {
				newFaceShapeModifier = -5; // It would have been masculine already, so we just take slave.face back to the original value.
			} else if (slave.faceShape === "cute") {
				newFaceShapeModifier = random(0, 20);
			}
			slave.face += newFaceShapeModifier;
		}
	}

	function adjustXXPregAdaptation() {
		const pregAdaptationModifier = slave.pregAdaptation - 50;
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
		slave.pregAdaptation += pregAdaptationModifier;
	}

	function adjustXYPregAdaptation() {
		const pregAdaptationModifier = slave.pregAdaptation - 50;
		if (slave.physicalAge <= 6) {
			slave.pregAdaptation = 5;
		} else if (slave.physicalAge <= 11) {
			slave.pregAdaptation = slave.physicalAge - 1;
		} else if (slave.physicalAge <= 15) {
			slave.pregAdaptation = 2 * (slave.physicalAge - 12) + 12;
		} else {
			slave.pregAdaptation = 20;
		}
		slave.pregAdaptation += pregAdaptationModifier;
	}

	function adjustXXVoice() {
		if (slave.physicalAge <= 13) {
			if (slave.voice === 1) {
				slave.voice = 2;
			} else if (slave.voice === 2 && random(1, 2) === 1) {
				slave.voice = 3;
			}
		} else if (slave.physicalAge <= 15 && slave.voice === 3 && random(1, 7) === 1) {
			slave.voice = 2;
		}
	}

	function adjustXYVoice() {
		// The voices of slave modified to have girly voices won't change.
		if (slave.physicalAge <= 11) {
			if (slave.voice === 2) {
				slave.voice = 3;
			} else if (slave.voice === 1 && random(1, 2) === 1) {
				slave.voice = 3;
			} else {
				slave.voice = 2;
			}
		}
		if (slave.physicalAge <= 13) {
			if (slave.voice === 2) {
				slave.voice = 3;
			} else if (slave.voice === 1 && random(1, 7) <= 5) {
				slave.voice = 2;
			}
		}
		if (slave.physicalAge <= 16) {
			if (slave.voice === 2 && random(1, 2) === 1) {
				slave.voice = 3;
			} else if (slave.voice === 1 && random(1, 7) <= 4) {
				slave.voice = 2;
			}
		}
	}

	function adjustTeeth() {
		if (slave.physicalAge < 6) {
			slave.teeth = "baby";
		} else if (slave.physicalAge < 12) {
			slave.teeth = "mixed";
		}
	}

	return slave;
};

/**
 * @param {FC.HumanState} slave
 * @param {number} [induce]
 * @returns {DocumentFragment}
 */
globalThis.induceLactation = function(slave, induce = 0) {
	const frag = new DocumentFragment();
	let lactationStartChance = jsRandom(10, 100);
	slave.induceLactation += induce;
	if (slave.boobs < 300) {
		lactationStartChance *= 1.5;
	} else if (slave.boobs < 400 || slave.boobs >= 5000) {
		lactationStartChance *= 1.2;
	}
	if (slave.pubertyXX === 0) {
		lactationStartChance *= 1.5;
	}
	if (slave.preg > (slave.pregData.normalBirth / 1.33)) {
		lactationStartChance *= .5;
	}
	if (slave.health.condition < -20) {
		lactationStartChance *= 2;
	}
	if (slave.weight <= -30) {
		lactationStartChance *= 1.5;
	}
	if (slave.boobsImplant > 0) {
		lactationStartChance *= (1 + (slave.boobsImplant / slave.boobs));
	}
	if (slave.lactationAdaptation > 0) {
		lactationStartChance = (lactationStartChance / (slave.lactationAdaptation / 10));
	}
	if (slave.geneticQuirks.galactorrhea === 2) {
		lactationStartChance *= .5;
	}
	lactationStartChance = Math.floor(lactationStartChance);
	if (slave.induceLactation >= lactationStartChance) {
		if (slave.ID === SID.PC) {
			frag.append(`Your breasts have been stimulated consistently enough to `, App.UI.DOM.makeElement("span", `begin producing milk.`, "lime"));
		} else {
			const {His} = getPronouns(slave);
			frag.append(`${His} breasts have been stimulated often enough to `, App.UI.DOM.makeElement("span", `induce lactation.`, "lime"));
		}
		slave.induceLactation = 0;
		slave.lactationDuration = 2;
		slave.lactation = 1;
	}
	return frag;
};

/**
 * @param {string} targetSkill - Skill to be checked.
 * @param {FC.SlaveState} slave - Slave to be checked.
 * @param {number} [skillIncrease=1]
 * @returns {string}
 */
globalThis.slaveSkillIncrease = function(targetSkill, slave, skillIncrease = 1) {
	let r = "";
	let skillDec;
	const {He, he, his, him, himself} = getPronouns(slave);
	const isLeadership = [
		['headGirl', 'HG'],
		['recruiter', 'recruiter'],
		['bodyguard', 'bodyguard'],
		['madam', 'madam'],
		['DJ', 'DJ'],
		['nurse', 'nurse'],
		['teacher', 'schoolteacher'],
		['attendant', 'attendant'],
		['matron', 'matron'],
		['stewardess', 'stewardess'],
		['milkmaid', 'milkmaid'],
		['farmer', 'farmer'],
		['wardeness', 'wardeness']
	];
	const isLeadershipRole = isLeadership.find(s => s[0].includes(targetSkill));
	if (isLeadershipRole) {
		if (!App.Data.Careers.Leader[isLeadershipRole[1]].includes(slave.career)) {
			if (slave.skill[targetSkill] <= 20) {
				if (slave.skill[targetSkill] + skillIncrease > 20) {
					r = `<span class="green">${He} now has basic skills as a ${capFirstChar(targetSkill)}.</span>`;
				}
			} else if (slave.skill[targetSkill] <= 60) {
				if (slave.skill[targetSkill] + skillIncrease > 60) {
					r = `<span class="green">${He} now has some skill as a ${capFirstChar(targetSkill)} under ${his} belt.</span>`;
				}
			} else if (slave.skill[targetSkill] <= 120) {
				if (slave.skill[targetSkill] + skillIncrease > 120) {
					r = `<span class="green">${He} is becoming well-versed as a ${capFirstChar(targetSkill)} candidate.</span>`;
				}
			} else if (slave.skill[targetSkill] < 200) {
				if (slave.skill[targetSkill] + skillIncrease >= 200) {
					r = `<span class="green">${He} now has knowledge on par with those with applicable career experience for a ${capFirstChar(targetSkill)}.</span>`;
					V.slaveTutor[capFirstChar(targetSkill)].delete(slave.ID);
				}
			} else { // failsafe
				V.slaveTutor[capFirstChar(targetSkill)].delete(slave.ID);
			}

			if (r && targetSkill === "recruiter") {
				const skill = slave.skill.recruiter;
				const maxSpecsBefore = getMaxRecruiterSpecializations(skill);
				const maxSpecsAfter = getMaxRecruiterSpecializations(skill + skillIncrease);
				if (maxSpecsAfter > maxSpecsBefore) {
					r += ` ${He} is now skilled enough to apply ${maxSpecsAfter} specializations when recruiting potential slaves.`;
				}
			}
		} else {
			V.slaveTutor[capFirstChar(targetSkill)].delete(slave.ID);
		}
	} else {
		if (slave.skill[targetSkill] <= 10) {
			switch (targetSkill) {
				case 'oral':
				case 'vaginal':
				case 'anal':
				case 'penetrative':
					skillDec = `knowledge about ${targetSkill} sex,`;
					break;
				case 'whoring':
					skillDec = `knowledge about how to whore,`;
					break;
				case 'entertainment':
					skillDec = `knowledge about how to be entertaining,`;
					break;
				case "combat":
					skillDec = `knowledge about defending ${himself},`;
					break;
			}

			if (slave.skill[targetSkill] + skillIncrease > 10) {
				r = `<span class="green">${He} now has basic ${skillDec}</span>`;
				switch (targetSkill) {
					case 'oral':
						r += ` and at least suck a dick without constant gagging.`;
						break;
					case 'vaginal':
						r += ` and can avoid some of the common pitfalls and turnoffs.`;
						break;
					case 'penetrative':
						r += ` and can smoothly insert ${himself} on the first try.`;
						break;
					case 'anal':
						r += ` and can accept penetration of ${his} anus without danger.`;
						break;
					case 'whoring':
						r += ` and can avoid some potentially dangerous situations.`;
						break;
					case 'entertainment':
						r += ` and can usually avoid serious faux pas.`;
						break;
					case "combat":
						r += ` and can throw up a fight when attacked.`;
				}
			}
		} else if (slave.skill[targetSkill] <= 30) {
			switch (targetSkill) {
				case 'oral':
				case 'vaginal':
				case 'anal':
				case 'penetrative':
					skillDec = `${targetSkill} skills,`;
					break;
				case 'whoring':
					skillDec = `skill as a whore,`;
					break;
				case 'entertainment':
					skillDec = `skill as an entertainer,`;
					break;
				case "combat":
					skillDec = `skill in ${num(1)}-on-${num(1)} combat,`;
					break;
			}

			if (slave.skill[targetSkill] + skillIncrease > 30) {
				r = `<span class="green">${He} now has some ${skillDec}</span>`;
				switch (targetSkill) {
					case 'oral':
						r += ` and can reliably bring dicks and pussies to climax with ${his} mouth.`;
						break;
					case 'vaginal':
						r += ` and can do more than just lie there and take it.`;
						break;
					case 'penetrative':
						r += ` and is capable of making it pleasurable for ${his} partner.`;
						break;
					case 'anal':
						r += ` and needs less preparation before taking rough penetration.`;
						break;
					case 'whoring':
						r += ` and knows how to sell ${his} body at a good price.`;
						break;
					case 'entertainment':
						r += ` and can flirt, dance, and strip acceptably.`;
						break;
					case "combat":
						r += " and can shoot, hit and reload with all common weapons.";
				}
			}
		} else if (slave.skill[targetSkill] <= 60) {
			switch (targetSkill) {
				case 'oral':
				case 'anal':
					skillDec = `an ${targetSkill} sex expert,`;
					break;
				case 'vaginal':
					skillDec = `a vaginal sex expert,`;
					break;
				case 'penetrative':
					skillDec = `an expert at penetrative sex,`;
					break;
				case 'whoring':
					skillDec = `an expert whore,`;
					break;
				case 'entertainment':
					skillDec = `an expert entertainer,`;
					break;
				case "combat":
					skillDec = `a weapons expert,`;
			}

			if (slave.skill[targetSkill] + skillIncrease > 60) {
				r = `<span class="green">${He} is now ${skillDec}</span>`;
				switch (targetSkill) {
					case 'oral':
						r += ` and has a delightfully experienced tongue.`;
						break;
					case 'vaginal':
						r += ` and has the muscular control to massage anything that's inside ${him}.`;
						break;
					case 'penetrative':
						r += ` and knows how manage ${his} pace, depth and force to maximize ${his} partner's enjoyment.`;
						break;
					case 'anal':
						r += ` and knows how to use ${his} sphincter to please.`;
						break;
					case 'whoring':
						r += ` and can often make clients forget that ${he}'s a prostitute they're paying for.`;
						break;
					case 'entertainment':
						r += ` and can flirt engagingly, dance alluringly, and strip arousingly.`;
						break;
					case "combat":
						r += ` and can keep ${his} head in complicated tactical situations.`;
						break;
				}
			}
		} else if (slave.skill[targetSkill] < 100) {
			switch (targetSkill) {
				case 'oral':
				case 'vaginal':
				case 'anal':
				case 'penetrative':
					skillDec = `has mastered ${targetSkill} sex,`;
					break;
				case 'whoring':
					skillDec = `is now a masterful whore,`;
					break;
				case 'entertainment':
					skillDec = `is now a masterful entertainer,`;
					break;
				case "combat":
					skillDec = `is now a weapons master,`;
			}

			if (slave.skill[targetSkill] + skillIncrease >= 100) {
				r = `<span class="green">${He} ${skillDec}</span>`;
				switch (targetSkill) {
					case 'oral':
						r += ` and can learn nothing more about sucking dick or eating pussy.`;
						break;
					case 'vaginal':
						r += ` and can learn nothing more about tribbing or taking dick.`;
						break;
					case 'penetrative':
						r += ` and can learn nothing more about fucking pussies, anuses or mouths.`;
						break;
					case 'anal':
						r += ` and can learn nothing more about taking it up the ass.`;
						break;
					case 'whoring':
						r += ` and can learn nothing more about prostitution.`;
						break;
					case 'entertainment':
						r += ` and can learn nothing more about flirting, dancing, or stripping.`;
						break;
					case "combat":
						r += ` and can learn nothing more about fighting and tactics.`;
						break;
				}
			}
		}
	}
	slave.skill[targetSkill] += skillIncrease;
	return r;
};

/**
 * Considers societal standards and returns slave penetration skill if expected
 * @param {FC.SlaveState} [slave]
 * @param {boolean} [specific=false]
 * @returns {number} adjusted penetration skill
 */
globalThis.adjustedPenSkill = function(slave, specific = false) {
	let skill = 0;
	if (!slave || !slave.skill) {
		return skill;
	}
	let tastes = penetrativeSocialUse(specific ? slave : null);

	if (tastes >= 60) {
		skill = slave.skill.penetrative;
	} else if (tastes >= 40) {
		if (canAchieveErection(slave) || slave.clit >= 3) {
			skill = slave.skill.penetrative;
		}
	}
	return Math.clamp(skill, 0, 100);
};

/**
 * Generates a new missing parent ID that should be unused
 * @returns {FC.HumanID} slave ID
 */
globalThis.generateMissingParentID = () => {
	V.missingParentID--;
	// if the next ID is already used somehow, skip it
	while (Object.keys(V.missingTable).includes(V.missingParentID)) {
		V.missingParentID--;
	}
	return V.missingParentID + 1;
};

/**
 * @param {FC.HumanState} slave
 * @param {FC.HumanID} missingParentID
 * @param {FC.MissingParentRecordOptionalParams} [extras]
 * @param {string} [namePrepend] if provided this is appended to the front of fullName
 * @returns {FC.MissingParentRecord}
 */
globalThis.missingTableRecordFromHumanState = (slave, missingParentID, extras = {}, namePrepend = undefined) => {
	return {
		ID: missingParentID,
		slaveName: slave.slaveName,
		slaveSurname: slave.slaveSurname,
		fullName: (namePrepend ? `${namePrepend} ` : "") + SlaveFullName(slave),
		dick: slave.dick,
		vagina: slave.vagina,
		mother: slave.mother,
		father: slave.father,
		inbreedingCoeff: slave.inbreedingCoeff,
		yours: extras?.yours ?? true,
		dead: extras?.dead ?? false,
		traitor: extras?.traitor ?? false,
	};
};

/**
 * @param {FC.MissingParentRecord} missingSlave
 * @returns {string} proper reference to missing slave
 */
globalThis.missingSlaveAddress = function(missingSlave) {
	if (missingSlave.traitor && missingSlave.dead) {
		return "the late traitor  " + missingSlave.fullName;
	} else if (missingSlave.yours) {
		if (missingSlave.dead) {
			return "your late slave " + missingSlave.fullName;
		}
		return "your former slave " + missingSlave.fullName;
	} else if (missingSlave.dead) {
		return "the late " + missingSlave.fullName;
	}
	return missingSlave.fullName; // maybe "the outsider fullName" or "the free fullName"?
};

/**
 * Generates a new slave ID that is guaranteed to be unused
 * @returns {FC.HumanID} slave ID
 */
globalThis.generateSlaveID = function() {
	// household liquidators and recETS generate slaves at an offset of 1000 (and many such slaves already exist)
	// if you go through enough slaves you WILL generate collisions, so make sure we haven't just done that.

	// get the ID props for all objects that have slave IDs
	// note that V.missingTable has IDs too but those aren't included here because they're always negative by design
	const allSlaveIDs = [
		...getSlaveStates(true).map((s) => s.ID),
		...Object.values(V.genePool).map((s) => s.ID)
	];

	// always add at least one to the ID
	// this is so you can call this function multiple times consecutively and always get a unique number, even if you don't add the slaves right away
	V.IDNumber++;

	// if the next ID is already used somehow, skip it
	while (allSlaveIDs.includes(V.IDNumber)) {
		V.IDNumber++;
	}

	// return an unused ID
	return V.IDNumber;
};

/**
 * @param {boolean} [legacy=false]
 * @returns {Map<FC.HumanID, FC.SlaveState>}
 */
globalThis.getSlaves = (legacy=false) => {
	if (legacy && !(V.slaves instanceof Map)) {
		/** @type {Map<FC.HumanID, FC.SlaveState>} */
		return new Map(
			// @ts-ignore
			V.slaves.map(s => {
				return [s.ID, s];
			}),
		);
	}
	return /** @type {Map<FC.HumanID, FC.SlaveState>} */ (V.slaves);
};

/**
 * Returns a slave for the given ID from the main slave pool.
 * If the ID doesn't exist in the main slave pool then undefined is returned.
 * @param {FC.HumanID} ID
 * @param {boolean} [legacy=false]
 * @returns {FC.SlaveState} will return undefined if the ID is invalid
 */
globalThis.getSlave = function(ID, legacy=false) {
	if (legacy && !(V.slaves instanceof Map)) {
		// @ts-expect-error
		if (V.slaveIndices) {
			// @ts-expect-error
			return V.slaves[V.slaveIndices[ID]];
		} else {
			// @ts-expect-error
			return V.slaves.find(s => s.ID === ID);
		}
	}
	return V.slaves.get(ID);
};

/**
 * @param {FC.HumanID} ID
 * @returns {boolean} will return true if the slave with the given ID exist in the pool
 */
globalThis.hasSlave = function(ID) {
	return V.slaves.has(ID);
};

/**
 * Adds the given slave to the pool
 * Their ID must be unique or this will error
 * @param {FC.SlaveState} actor
 */
globalThis.addSlave = (actor) => {
	if (V.slaves.has(actor.ID)) {
		throw new Error(`A entry already exists in the main slave pool with the ID '${actor.ID}'`);
	}
	// @ts-expect-error read only map
	V.slaves.set(actor.ID, actor);
};

/**
 * Overwrite the given ID in the main slave pool with the given slave object.
 * Will throw an error if slave is not an object or if the given ID is not in the main slave pool
 * @param {FC.HumanID} ID
 * @param {FC.SlaveState} slave
 */
globalThis.overwriteSlave = function(ID, slave) {
	if (!slave || !(typeof slave === "object") || slave === null || Array.isArray(slave)) {
		throw new Error(`Passed object is not a SlaveState object. Object: ${Serial.stringify(slave)}`);
	}
	if (V.slaves instanceof Map && V.slaves.has(ID)) {
		V.slaves.set(ID, slave);
	} else if (Array.isArray(V.slaves)) {
		const sArray = (/** @type {Array<FC.SlaveState>} */ (/** @type {unknown} */ (V.slaves)));
		const slaveIndex = sArray.findIndex((s) => s.ID === ID);
		if (slaveIndex !== -1) {
			sArray[slaveIndex] = slave;
		} else {
			throw new Error(`No slave exists with ID '${ID}' in the main slave pool`);
		}
	} else {
		throw new Error(`No slave exists with ID '${ID}' in the main slave pool`);
	}
};

/**
 * @returns {number} the amount of slaves in the main slave pool
 */
globalThis.slaveCount = () => {
	return V.slaves.size;
};

/**
 * @param {boolean} [legacy=false]
 * @returns {Map<FC.HumanID, FC.InfantState>}
 */
globalThis.getInfants = (legacy=false) => {
	if (legacy && !(V.cribs instanceof Map)) {
		/** @type {Map<FC.HumanID, FC.SlaveState>} */
		return new Map(
			// @ts-ignore
			V.cribs.map(s => {
				return [s.ID, s];
			}),
		);
	}
	return /** @type {Map<FC.HumanID, FC.InfantState>} */ (V.cribs);
};

/**
 * Returns an infant for the given ID from the infant slave pool.
 * If the ID doesn't exist in the infant slave pool then undefined is returned.
 * @param {FC.HumanID} ID
 * @returns {FC.InfantState} will return undefined if the ID is invalid
 */
globalThis.getInfant = function(ID) {
	return V.cribs.get(ID);
};

/**
 * @param {FC.HumanID} ID
 * @returns {boolean} will return true if the infant with the given ID exist in the pool
 */
globalThis.hasInfant = function(ID) {
	return V.cribs.has(ID);
};

/**
 * Adds the given infant to the pool
 * Their ID must be unique or this will error
 * @param {FC.InfantState} actor
 */
globalThis.addInfant = (actor) => {
	if (V.cribs.has(actor.ID)) {
		throw new Error(`A entry already exists in the infant slave pool with the ID '${actor.ID}'`);
	}
	// @ts-expect-error read only map
	V.cribs.set(actor.ID, actor);
};

/**
 * Overwrite the given ID in the infant slave pool with the given slave object.
 * Will throw an error if slave is not an object or if the given ID is not in the infant slave pool
 * @param {FC.HumanID} ID
 * @param {FC.InfantState} infant
 */
globalThis.overwriteInfant = function(ID, infant) {
	if (!infant || !(typeof infant === "object") || infant === null || Array.isArray(infant)) {
		throw new Error(`Passed object is not a InfantState object. Object: ${JSON.stringify(infant)}`);
	}
	if (V.cribs.has(ID)) {
		// @ts-expect-error read only map
		V.cribs.set(ID, infant);
	} else {
		throw new Error(`No slave exists with ID '${ID}' in the infant slave pool`);
	}
};

/**
 * @returns {number} the amount of slaves in the infant slave pool
 */
globalThis.infantCount = () => {
	return V.cribs.size;
};

/**
 * @param {boolean} [legacy=false]
 * @returns {Map<FC.HumanID, FC.TankSlaveState>}
 */
globalThis.getTankSlaves = (legacy=false) => {
	if (legacy && !(V.incubator.tanks instanceof Map)) {
		/** @type {Map<FC.HumanID, FC.SlaveState>} */
		return new Map(
			// @ts-ignore
			V.incubator.tanks.map(s => {
				return [s.ID, s];
			}),
		);
	}
	return /** @type {Map<FC.HumanID, FC.TankSlaveState>} */ (V.incubator.tanks);
};

/**
 * Returns an tank slave for the given ID from the tank slave pool.
 * If the ID doesn't exist in the tank slave pool then undefined is returned.
 * @param {FC.HumanID} ID
 * @returns {FC.TankSlaveState} will return undefined if the ID is invalid
 */
globalThis.getTankSlave = function(ID) {
	return V.incubator.tanks.get(ID);
};

/**
 * @param {FC.HumanID} ID
 * @returns {boolean} will return true if the tank slave with the given ID exist in the pool
 */
globalThis.hasTankSlave = function(ID) {
	return V.incubator.tanks.has(ID);
};

/**
 * Adds the given tank slave to the pool
 * Their ID must be unique or this will error
 * @param {FC.TankSlaveState} actor
 */
globalThis.addTankSlave = (actor) => {
	if (V.incubator.tanks.has(actor.ID)) {
		throw new Error(`A entry already exists in the tank slave pool with the ID '${actor.ID}'`);
	}
	// @ts-expect-error read only map
	V.incubator.tanks.set(actor.ID, actor);
};

/**
 * Overwrite the given ID in the tank slave pool with the given tank slave object.
 * Will throw an error if tank slave is not an object or if the given ID is not in the tank slave pool
 * @param {FC.HumanID} ID
 * @param {FC.TankSlaveState} tank
 */
globalThis.overwriteTankSlave = function(ID, tank) {
	if (!tank || !(typeof tank === "object") || tank === null || Array.isArray(tank)) {
		throw new Error(`Passed object is not a TankSlaveObject object. Object: ${JSON.stringify(tank)}`);
	}
	if (V.incubator.tanks.has(ID)) {
		// @ts-expect-error read only map
		V.incubator.tanks.set(ID, tank);
	} else {
		throw new Error(`No slave exists with ID '${ID}' in the tank slave pool`);
	}
};

/**
 * @returns {number} the amount of slaves in the tank slave pool
 */
globalThis.tankSlaveCount = () => {
	return V.incubator.tanks.size;
};

/**
 * @returns {number} the amount of slaves (that are not menial) that the player owns. This includes infants and incutator slaves
 */
globalThis.allSlaveCount = () => {
	return slaveCount() + infantCount() + tankSlaveCount();
};

/**
 * NOTE: this only checks V.PC and the main slave pool, search through `getAllHumanStates()` if you need to truly check all humans
 * @param {FC.HumanID} ID
 * @returns {FC.HumanState} will return undefined if the ID is invalid
 */
globalThis.getHuman = function(ID) {
	if (ID === SID.PC) { return V.PC; } // return the player
	return getSlave(ID); // return a slave or undefined
};

/**
 * returns the traitor object
 * @returns {FC.GameVariables["detached"]["traitor"]}
 */
globalThis.getTraitor = () => {
	return V.detached.traitor;
};

/**
 * returns the hostage object
 * @returns {FC.GameVariables["detached"]["hostage"]}
 */
globalThis.getHostage = () => {
	return V.detached.hostage;
};

/**
 * returns the shelter slave object
 * @returns {FC.GameVariables["detached"]["shelter"]}
 */
globalThis.getShelterSlave = () => {
	return V.detached.shelter;
};

/**
 * returns the boomerang object
 * @returns {FC.GameVariables["detached"]["boomerang"]}
 */
globalThis.getBoomerang = () => {
	return V.detached.boomerang;
};

/**
 * @param {number} slaveID
 * @param {boolean} [textOnly=true] if true then we will only return the humans name, otherwise we will return an FC.HumanState object when available
 * @returns {FC.HumanState | string}
 */
globalThis.getParent = (slaveID, textOnly = true) => {
	const societalElite = V.arcologies[0].FSNeoImperialistLaw2 === 1 ? "Barons" : "Societal Elite";
	if (slaveID === 0) {
		return "unknown";
	} else if (slaveID === SID.PC) {
		if (textOnly) {
			return `${SlaveFullName(V.PC)} (you)`;
		} else {
			return V.PC;
		}
	} else if (slaveID === SID.CITIZEN) {
		return "an arcology citizen";
	} else if (slaveID === SID.FORMERMASTER) {
		return "your former master";
	} else if (slaveID === SID.ARCOWNER) {
		return "another arcology owner";
	} else if (slaveID === SID.CLIENT) {
		return "one of your clientele";
	} else if (slaveID === SID.ELITE) {
		return `the ${societalElite}`;
	} else if (slaveID === SID.LAB) {
		return "you via the magic of science"; // designer baby
	} else if (slaveID === SID.ANIMAL) {
		return "an animal";
	} else if (slaveID === SID.FUTA) {
		return "a Futanari Sister";
	} else if (slaveID === SID.RAPIST) {
		return "a rapist";
	} else {
		let father = findFather(slaveID);
		if (father) {
			if (textOnly) {
				return SlaveFullName(father);
			} else {
				return father;
			}
		} else {
			return "Unknown";
		}
	}
};

/**
 * Returns a valid rape target for a slave who is going to rape one of his peers into rivalry with him.
 * @param {FC.SlaveState} slave
 * @param {function(FC.SlaveState): boolean} predicate
 * @returns {FC.SlaveState | undefined}
 */
globalThis.randomRapeRivalryTarget = function(slave, predicate) {
	const willIgnoreRules = disobedience(slave) > jsRandom(0, 100);

	function canBeARapeRival(s) {
		return (s.devotion <= 95 && s.energy <= 95 && !s.rivalry && !s.fuckdoll && s.fetish !== Fetish.MINDBROKEN);
	}

	function canRape(rapist, rapee) {
		const opportunity = (assignmentVisible(rapist) && assignmentVisible(rapee)) || rapist.assignment === rapee.assignment;
		const taboo = V.seeIncest === 0 && areRelated(rapist, rapee);
		const desire = !(rapist.relationship >= 3 && rapist.relationshipTarget === rapee.id) && !taboo;
		const permission = willIgnoreRules || App.Utils.sexAllowed(rapist, rapee);
		return opportunity && desire && permission;
	}

	if (typeof predicate !== 'function') {
		predicate = (() => true);
	}

	const arr = getSlaves().filter((s) => { return canBeARapeRival(s) && canRape(slave, s); }).asArray().shuffle();
	return arr.find(predicate);
};

globalThis.resetHGCum = function(s) {
	return 2 + Math.trunc((s.balls / 5) + (s.energy / 95) + (s.health.condition / 95) + (s.devotion / 95) + (V.reproductionFormula * 5));
};

globalThis.restoreTraitor = function() {
	const traitor = getTraitor();
	const traitorActor = traitor.actor;
	if (traitorActor === 0) { // typing only
		return;
	}
	traitorActor.assignment = Job.REST;
	if (traitor.stats.PCpregSource > 0 && V.PC.preg > 0 && V.PC.pregSource === SID.GENERIC) {
		V.PC.pregSource = traitorActor.ID;
	}
	if (traitor.stats.PCmother > 0) {
		V.PC.mother = traitorActor.ID;
	}
	if (traitor.stats.PCfather > 0) {
		V.PC.father = traitorActor.ID;
	}
	for (const slave of getSlaves().values()) {
		if (traitor.stats.traitorMother.includes(slave.ID)) {
			slave.mother = traitorActor.ID;
		}
		if (traitor.stats.traitorFather.includes(slave.ID)) {
			slave.father = traitorActor.ID;
		}
		if (traitor.stats.traitorPregSources.includes(slave.ID) && slave.preg > 0 && slave.pregSource === SID.GENERIC) {
			slave.pregSource = traitorActor.ID;
		}
	}
	if (V.incubator.capacity > 0) {
		for (const pca of getTankSlaves().values()) {
			if (traitor.stats.traitorMotherTank.includes(pca.ID)) {
				pca.mother = traitorActor.ID;
			}
			if (traitor.stats.traitorFatherTank.includes(pca.ID)) {
				pca.father = traitorActor.ID;
			}
		}
	}
	if (V.nursery > 0) {
		for (const pca of getInfants().values()) {
			if (traitor.stats.traitorMotherTank.includes(pca.ID)) {
				pca.mother = traitorActor.ID;
			}
			if (traitor.stats.traitorFatherTank.includes(pca.ID)) {
				pca.father = traitorActor.ID;
			}
		}
	}
	if (traitor.stats.traitorBody > 0) {
		const pca = getSlave(traitor.stats.traitorBody);
		if (pca) {
			pca.origBodyOwnerID = traitorActor.ID;
		}
	}
	for (const slave of getSlaves().values()) {
		WombChangeID(slave, traitor.stats.missingParentTag, traitorActor.ID);
	}
	newSlave(traitorActor); /* skip New Slave Intro */
	traitor.actor = 0;
	traitor.stats = {};
	traitor.type = 0;
};

/**
 * Sets a slave to default values for mindbroken.
 *
 * @param {FC.SlaveState} slave
 * @param {number} oldIntelligence Genetic intelligence for slavegen. Seriously, do not use outside of slavegen!
 */
globalThis.applyMindbroken = function(slave, oldIntelligence = -200) {
	slave.fetish = Fetish.MINDBROKEN;
	slave.fetishStrength = 10;
	slave.attrXY = 50;
	slave.attrXX = 50;
	slave.attrKnown = 1;
	slave.devotion = 40;
	slave.trust = -40;
	slave.skill.vaginal = Math.clamp(slave.skill.vaginal, 0, 15);
	slave.skill.penetrative = Math.clamp(slave.skill.penetrative, 0, 15);
	slave.skill.oral = Math.clamp(slave.skill.oral, 0, 15);
	slave.skill.anal = Math.clamp(slave.skill.anal, 0, 15);
	slave.skill.combat = 0;
	slave.skill.whoring = 0;
	slave.skill.entertainment = 0;
	if (oldIntelligence >= -100) {
		// @ts-ignore used internally by newSlave() and applyMindbroken()
		slave.savedIntelligence = oldIntelligence;
	}
	slave.intelligence = -75;
	slave.intelligenceImplant = 0;
	slave.sexualFlaw = "none";
	slave.sexualQuirk = "none";
	slave.behavioralFlaw = "none";
	slave.behavioralQuirk = "none";
};

/**
 * Compares two slaves and returns differences
 * @param {object} edited
 * @param {object} original
 * @param {function(string): void} dispatch
 * @param {string} crumb
 */
App.Utils.showSlaveChanges = function(edited, original, dispatch, crumb = "") {
	if (!crumb) { crumb = `${original.slaveName}: `; } else { crumb += `.`; }
	const isObj = (o) => (typeof o === "object" && o !== null);
	for (const key in edited) {
		const value = edited[key];
		const originalValue = original[key];
		if (isObj(value) && isObj(originalValue)) {
			App.Utils.showSlaveChanges(value, originalValue, dispatch, crumb + key);
		} else if (
			(value instanceof Set && originalValue instanceof Set) ||
			(value instanceof Map && originalValue instanceof Map)
		) {
			App.Utils.showSlaveChanges(edited.get(key), original.get(key), dispatch, crumb + key);
		} else if (value !== originalValue) {
			dispatch(`${crumb}${key} changed from ${originalValue} to ${value}`);
		}
	}
};

/** Calculates the minimum anus size to accommodate a particular dick size
 * @param {number} dickSize
 * @returns {FC.AnusType}
 */
globalThis.stretchedAnusSize = function(dickSize) {
	return /** @type {FC.AnusType} */ (Math.clamp(dickSize, 0, 4));
};

/** Determines whether an outfit passes Chattel Religionism's strictest cultural clothing requirements (either base or Holy Nudism)
 * @param {FC.Clothes} outfit
 * @returns {boolean}
 */
globalThis.ChattelReligionistClothingPass = function(outfit) {
	const clothes = App.Data.clothes.get(outfit);
	const fsLovesClothes = clothes && clothes.fs && clothes.fs.loves && clothes.fs.loves.has("FSChattelReligionist");
	const fsToleratesClothes = clothes && clothes.fs && clothes.fs.tolerates && clothes.fs.tolerates.has("FSChattelReligionist");

	if (V.arcologies[0].FSChattelReligionistLaw2 === 1) {
		return clothes.exposure === 4 || (clothes.exposure === 3 && (fsLovesClothes || fsToleratesClothes));
	} else {
		return fsLovesClothes;
	}
};

/** Checks whether a slave's smart piercing is reinforcing a particular fetish
 * You must use this function rather than comparing directly because some of the enumerated values don't match (i.e. "anal" reinforces "buttslut")
 * @param {FC.SlaveState} slave
 * @param {FC.Fetish} [fetish] if unspecified, uses the slave's current fetish
 */
globalThis.smartPiercingReinforcesFetish = function(slave, fetish = slave.fetish) {
	switch (slave.clitSetting) {
		case SmartPiercingSetting.VANILLA:
			return fetish === Fetish.NONE;
		case SmartPiercingSetting.ANAL:
			return fetish === Fetish.BUTTSLUT;
		case SmartPiercingSetting.ORAL:
			return fetish === Fetish.CUMSLUT;
		case SmartPiercingSetting.NONE:
			return false; // SP "none" is "no sex", not fetish "none", which is SP "vanilla"
	}
	return slave.clitSetting === fetish; // all the other ones are supposed to match
};

/**
 * Directs filler to the designated implant.
 * @param {FC.HumanState} slave
 * @param {number} amount
 */
globalThis.cervixPumpFillsImplant = function(slave, amount) {
	const base = slave.cervixImplantTarget.replace("Implant", "");
	if (slave.cervixImplantTarget === "all") {
		// temporary, someone please make this distribute to available implants in a more modular way!
		slave.boobsImplant += Math.ceil(amount / 3);
		slave.boobs += Math.ceil(amount / 3);
		slave.bellyImplant += Math.ceil(amount / 3);
	} else if (slave.cervixImplantTarget === "TnA") {
		// reserved for buttImplant + boobsImplant
	} else if (slave.cervixImplantTarget === "mombod") {
		slave.boobsImplant += Math.ceil(amount * .25);
		slave.boobs += Math.ceil(amount * .25);
		slave.bellyImplant += Math.ceil(amount * .75);
	} else if (slave.cervixImplantTarget === "bottomHeavy") {
		// reserved for buttImplant + bellyImplant
	} else if (slave.cervixImplantTarget !== "none") {
		slave[slave.cervixImplantTarget] += Math.ceil(amount / 2);
		slave[base] += Math.ceil(amount / 2);
	}
};
