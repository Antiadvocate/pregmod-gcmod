// cSpell:ignore Musc

/**
 * A categorizer is used to "slice" a value range into distinct categories in an efficient manner.
 *
 * If the values are objects their property named 'value' will be set to whatever
 * the value used for the choice was. This is important for getters, where it can be accessed
 * via this.value.
 *
 * @example Plain if
 * let r = "";
 * if (slave.muscles > 95) {
 *     r = "Musc++";
 * } else if (slave.muscles > 30) {
 *     r = "Musc+";
 * } else if (slave.muscles > 5) {
 *     r = "Toned";
 * } else if (slave.muscles > -6) {
 * } elseif (slave.muscles > -31) {
 *     r = "weak";
 * } else if (slave.muscles > -96) {
 *     r = "weak+";
 * } else {
 * 	   r = "weak++";
 * }
 *
 * @example As a categorizer
 * // Can be defined globally.
 * const muscleCat = new Categorizer([96, "Musc++"], [31, "Musc+"], [6, "Toned"], [-5, ""], [-30, "weak"], [-95, "weak+"], [-Infinity, "weak++"])
 *
 * r = muscleCat.cat(slave.muscles);
 */
globalThis.Categorizer = class {
	/**
	 * @param  {...Array} pairs
	 */
	constructor(...pairs) {
		this.cats = Array.prototype.slice.call(pairs)
			.filter(function(e, i, a) {
				return Array.isArray(e) && e.length === 2 && typeof e[0] === "number" && !isNaN(e[0]) &&
					a.findIndex(function(val) {
						return e[0] === val[0];
					}) === i; /* uniqueness test */
			})
			.sort(function(a, b) {
				return b[0] - a[0]; /* reverse sort */
			});
	}

	cat(val, def) {
		let result = def;
		if (typeof val === "number" && !isNaN(val)) {
			let foundCat = this.cats.find(function(e) {
				return val >= e[0];
			});
			if (foundCat) {
				result = foundCat[1];
			}
		}
		// Record the value for the result's getter, if it is an object
		// and doesn't have the property yet
		if (typeof result === "object" && !isNaN(result)) {
			result.value = val;
		}
		return result;
	}
};

/**
 * Converts an Iterable of strings into a sentence parted by commas.
 * For an empty Iterable will return an empty string.
 * @param {Iterable<string>} iterable
 * @param {string} [delimiter=", "]
 * @param {string} [lastDelimiter=" and "]
 * @returns {string}
 *
 * @example array
 * toSentence(["apple", "banana", "carrot"]);
 * // returns "apple, banana and carrot"
 *
 * @example Set
 * toSentence(new Set(["apple", "banana"]), ", ", " or ");
 * // returns "apple or banana"
 */
globalThis.toSentence = function(iterable, delimiter = ", ", lastDelimiter = " and ") {
	const itr = iterable[Symbol.iterator]();
	let output = ``;
	let result = itr.next();
	if (!result.done) {
		// output first element
		output += result.value;
		result = itr.next();
		if (!result.done) {
			// output elements (1...n-1)
			let previous = result.value;
			result = itr.next();
			while (!result.done) {
				output += delimiter + previous;
				previous = result.value;
				result = itr.next();
			}
			// output final element
			output += lastDelimiter + previous;
		}
	}
	return output;
};

App.Utils.alphabetizeIterable = function(iterable) {
	const compare = function(a, b) {
		let aTitle = a.toLowerCase();
		let bTitle = b.toLowerCase();

		aTitle = App.Utils.removeArticles(aTitle);
		bTitle = App.Utils.removeArticles(bTitle);

		if (aTitle > bTitle) {
			return 1;
		}
		if (aTitle < bTitle) {
			return -1;
		}
		return 0;
	};

	const clonedArray = (Array.from(iterable));
	return clonedArray.sort(compare);
};

/**
 * @param {string} str
 * @returns {string}
 */
App.Utils.removeArticles = function(str) {
	const words = str.split(" ");
	if (words.length <= 1) {
		return str;
	}
	if (words[0] === "a" || words[0] === "the" || words[0] === "an") {
		return words.splice(1).join(" ");
	}
	return str;
};

/**
 * Capitalizes all the words in a string
 * @param {string} str string to capitalize
 * @returns {string} string with all words capitalized
 *
 * @example "apple, banana, carrot"
 * // returns "Apple, Banana, Carrot"
 */
App.Utils.capitalizeAll = function(str) {
	return str.split(" ").map((word) => {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}).join(" ");
};

/**
 * @param {FC.Zeroable<FC.Race>} badRace
 * @returns {Array<FC.Race>}
 */
App.Utils.getRaceArrayWithoutParamRace = function(badRace) {
	return Array.from(App.Data.misc.filterRaces.keys()).filter(race => race !== badRace);
};

/**
 * Sets obj[key] to value.
 * @param {object} obj
 * @param {string} key
 * @param {*} value
 */
globalThis.setProp = (obj, key, value) => {
	obj[key] = value;
};

/**
 * Gets the value of obj[key].
 * returns fallback if obj[key] is undefined or doesn't exist.
 * @param {object} obj
 * @param {string} key
 * @param  {*} [fallback]
 */
globalThis.getProp = (obj, key, fallback) => {
	if (!obj) { throw new Error("getProp was given a non existent object!"); }
	if (!(key in obj) || obj[key] === undefined) { return fallback; }
	return obj[key];
};

/**
 * Deletes one or more properties.
 * @param {object} obj
 * @param {...string} keys
 */
globalThis.deleteProps = (obj, ...keys) => {
	const props = [...keys];
	props.forEach((prop) => {
		delete obj[prop];
	});
};

/**
 * Returns true if the given object has all the properites need to be a PlayerState object.
 * Returns false if the object doesn't exist, is a number, or is missing required properties
 * @param {FC.Zeroable<FC.HumanState>} human
 * @param {boolean} [log=false] [default=false] if true then we may call console.warn with info
 * @returns {boolean}
 */
globalThis.isPlayer = (human, log=false) => {
	// TODO:@franklygeorge this needs to do a recursive check instead of the current flat check
	const propsObj = new App.Entity.PlayerState();
	const props = Object.keys(propsObj).filter((key) => {
		return propsObj[key] !== undefined;
	});
	if (!human || typeof human === "number") {
		if (log) { console.warn(`isPlayer: human is a number or undefined`); }
		return false;
	}
	const missing = App.Utils.listMissingProps(human, props);
	if (log && missing) { console.warn(`isPlayer: human with ID ${human.ID} was missing these properties: ${JSON.stringify(missing)}`); }
	return !missing;
};

/**
 * Returns the object unmodified, but as type FC.PlayerState.
 * Returns null if isPlayer(human) returns false.
 * @param {FC.Zeroable<FC.HumanState>} human
 * @param {boolean} [log=false] [default=false] if true then we may call console.warn with info
 * @returns {FC.PlayerState}
 */
globalThis.asPlayer = (human, log=false) => {
	if (!isPlayer(human, log)) { return null; }
	return /** @type {FC.PlayerState} */(human);
};

/**
 * Returns true if the given object has all the properites need to be a SlaveState object.
 * Returns false if the object doesn't exist, is a number, or is missing required properties
 * @param {FC.Zeroable<FC.HumanState>} human
 * @param {boolean} [log=false] [default=false] if true then we may call console.warn with info
 * @returns {boolean}
 */
globalThis.isSlave = (human, log=false) => {
	// TODO:@franklygeorge this needs to do a recursive check instead of the current flat check
	const propsObj = new App.Entity.SlaveState();
	const props = Object.keys(propsObj).filter((key) => {
		return propsObj[key] !== undefined;
	});
	if (!human || typeof human === "number") {
		if (log) { console.warn(`isSlave: human is a number or undefined`); }
		return false;
	}
	const missing = App.Utils.listMissingProps(human, props);
	if (log && missing) { console.warn(`isSlave: human with ID ${human.ID} was missing these properties: ${JSON.stringify(missing)}`); }
	return !missing;
};

/**
 * Returns the object unmodified, but as type FC.SlaveState.
 * Returns null if isSlave(human) returns false.
 * @param {FC.Zeroable<FC.HumanState>} human
 * @param {boolean} [log=false] [default=false] if true then we may call console.warn with info
 * @returns {FC.SlaveState}
 */
globalThis.asSlave = (human, log=false) => {
	if (!isSlave(human, log)) { return null; }
	return /** @type {FC.SlaveState} */(human);
};

/**
 * Returns true if the given object has all the properites need to be a ChildState object.
 * Returns false if the object doesn't exist, is a number, or is missing required properties
 * @param {FC.Zeroable<FC.HumanState>} human
 * @param {boolean} [log=false] [default=false] if true then we may call console.warn with info
 * @returns {boolean}
 */
globalThis.isChild = (human, log=false) => {
	// TODO:@franklygeorge this needs to do a recursive check instead of the current flat check
	const propsObj = new App.Entity.ChildState();
	const props = Object.keys(propsObj).filter((key) => {
		return propsObj[key] !== undefined;
	});
	if (!human || typeof human === "number") {
		if (log) { console.warn(`isChild: human is a number or undefined`); }
		return false;
	}
	const missing = App.Utils.listMissingProps(human, props);
	if (log && missing) { console.warn(`isChild: human with ID ${human.ID} was missing these properties: ${JSON.stringify(missing)}`); }
	return !missing;
};

/**
 * Returns the object unmodified, but as type FC.ChildState.
 * Returns null if isChild(human) returns false.
 * @param {FC.Zeroable<FC.HumanState>} human
 * @param {boolean} [log=false] [default=false] if true then we may call console.warn with info
 * @returns {FC.ChildState}
 */
globalThis.asChild = (human, log=false) => {
	if (!isChild(human, log)) { return null; }
	return /** @type {FC.ChildState} */(human);
};

/**
 * Returns true if the given object has all the properites need to be a InfantState object.
 * Returns false if the object doesn't exist, is a number, or is missing required properties
 * @param {FC.Zeroable<FC.HumanState>} human
 * @param {boolean} [log=false] [default=false] if true then we may call console.warn with info
 * @returns {boolean}
 */
globalThis.isInfant = (human, log=false) => {
	// TODO:@franklygeorge this needs to do a recursive check instead of the current flat check
	const propsObj = new App.Entity.InfantState();
	const props = Object.keys(propsObj).filter((key) => {
		return propsObj[key] !== undefined;
	});
	if (!human || typeof human === "number") {
		if (log) { console.warn(`isInfant: human is a number or undefined`); }
		return false;
	}
	const missing = App.Utils.listMissingProps(human, props);
	if (log && missing) { console.warn(`isInfant: human with ID ${human.ID} was missing these properties: ${JSON.stringify(missing)}`); }
	return !missing;
};

/**
 * Returns the object unmodified, but as type FC.InfantState.
 * Returns null if isInfant(human) returns false.
 * @param {FC.Zeroable<FC.HumanState>} human
 * @param {boolean} [log=false] [default=false] if true then we may call console.warn with info
 * @returns {FC.InfantState}
 */
globalThis.asInfant = (human, log=false) => {
	if (!isInfant(human, log)) { return null; }
	return /** @type {FC.InfantState} */(human);
};

/**
 * Returns true if the given object has all the properites need to be a TankSlaveState object.
 * Returns false if the object doesn't exist, is a number, or is missing required properties
 * @param {FC.Zeroable<FC.HumanState>} human
 * @param {boolean} [log=false] [default=false] if true then we may call console.warn with info
 * @returns {boolean}
 */
globalThis.isTankSlave = (human, log=false) => {
	// TODO:@franklygeorge this needs to do a recursive check instead of the current flat check
	const propsObj = new App.Entity.TankSlaveState();
	const props = Object.keys(propsObj).filter((key) => {
		return propsObj[key] !== undefined;
	});
	if (!human || typeof human === "number") {
		if (log) { console.warn(`isTankSlave: human is a number or undefined`); }
		return false;
	}
	const missing = App.Utils.listMissingProps(human, props);
	if (log && missing) { console.warn(`isTankSlave: human with ID ${human.ID} was missing these properties: ${JSON.stringify(missing)}`); }
	return !missing;
};

/**
 * Returns the object unmodified, but as type FC.TankSlaveState.
 * Returns null if isTankSlave(human) returns false.
 * @param {FC.Zeroable<FC.HumanState>} human
 * @param {boolean} [log=false] [default=false] if true then we may call console.warn with info
 * @returns {FC.TankSlaveState}
 */
globalThis.asTankSlave = (human, log=false) => {
	if (!isTankSlave(human, log)) { return null; }
	return /** @type {FC.TankSlaveState} */(human);
};

/**
 * @param {string} englishWord
 * @returns {string}
 */
App.Utils.translate = function(englishWord) {
	return App.Data.dictionary[englishWord] && App.Data.dictionary[englishWord].hasOwnProperty(V.language)
		? App.Data.dictionary[englishWord][V.language]
		: englishWord;
};

/**
 * Returns the name of the last passage.
 * `lastPassage() === "Slave Interact"` would be the equivalent of `lastVisited("Slave Interact") === 1`.
 * @returns {string} the name of the last passage.
 */
globalThis.lastPassage = () => {
	return V?.passageHistory?.last() ?? "Main";
};

/**
 * Checks if the current passage equals the last passage on the stack and if so it removes it from the stack.
 * If `passage() === "Main"` then we erase the history stack.
 * This is called for all passages in `src\zz1-last\setupEventHandlers.js`
 */
App.Utils.passageHistoryCleanup = () => {
	if (!V?.passageHistory) { return; }
	if (passage() === "Main") {
		V.passageHistory = [];
	} else {
		while (V.passageHistory.last() === passage()) {
			V.passageHistory.pop();
		}
	}
};

/**
 * Adds the current passage to the passage history stack.
 * @param {string} [currentPassage] (optional) The current passage name.
 * This is called for all passages in `src\zz1-last\setupEventHandlers.js`
 */
App.Utils.passageHistoryAdd = (currentPassage = passage()) => {
	if (!V?.passageHistory) { return; }
	if (currentPassage) {
		if (currentPassage !== V.passageHistory.last()) {
			V.passageHistory.push(currentPassage);
		}
	} else {
		throw new Error("currentPassage must be a string");
	}
};

/**
 * Calculates the player's net worth.
 *
 * @returns {number}
 */
App.Utils.totalNetWorth = function() {
	const arcology = V.arcologies[0];
	const assistant = V.assistant.power;
	const menialPrice = menialSlaveCost();
	let total = 0;

	total += V.cash;

	for (const slave of getSlaves().values()) {
		total += slaveCost(slave);
	}

	total += V.menials * menialPrice;
	total += V.menialBioreactors * menialPrice;
	total += V.bioreactorsXY * menialPrice;
	total += V.bioreactorsXX * menialPrice;
	total += V.bioreactorsHerm * menialPrice;

	total += V.building.findCells(cell => !(cell instanceof App.Arcology.Cell.Filler) && cell.owner === 1).length * 1000 * Math.trunc(arcology.prosperity * (1 + (arcology.demandFactor / 100)));

	for (let i = 1; i < V.arcologies.length; i++) {
		const arcology = V.arcologies[i];

		total += (500 * Math.trunc(arcology.prosperity * (1 + (arcology.demandFactor / 100))) / 100) * arcology.PCminority;
	}

	if (assistant > 0) {
		if (assistant > 1) {
			total += 20000;
		}
		if (assistant > 2) {
			total += 35000;
		}
		if (assistant > 3) {
			total += 50000;
		}
	}

	if (V.arcologyUpgrade.drones) {
		total += 5000;
	}
	if (V.arcologyUpgrade.hydro) {
		total += 10000;
	}
	if (V.arcologyUpgrade.apron) {
		total += 20000;
	}
	if (V.arcologyUpgrade.grid) {
		total += 50000;
	}

	if (V.weatherCladding === 1) {
		total += 50000;
	} else if (V.weatherCladding === 2) {
		total += 3500000;
	}

	total += Object.values(App.Entity.facilities)
		.filter(f => f.established)
		.reduce((acc, cur) => acc + cur.value, 0);

	total += Math.trunc(App.Facilities.Farmyard.foodSellValue(App.Facilities.Farmyard.foodAvailable()));

	total += App.Mods.SF.totalNetWorth();
	total -= App.Mods.SecExp.upkeep.cost();

	if (V.loans.length > 0) {
		V.loans.forEach(loan => total -= loan.full);
	}

	return total;
};

/** Calculate the target number of slaves to recruit when the recruiter is set to fill facilities */
App.Utils.recruiterFacilitySpace = function() {
	/* Note on target sum: HG and Recruiter are the initial 2 counted (no facility req'd), while HGSuite counts the HG's girl, other facilities count associated leader */
	let idleTarget = (2 + V.brothel + V.club + V.arcade + V.dairy + App.Entity.facilities.servantsQuarters.capacity + V.masterSuite);
	if (V.HGSuite) {
		idleTarget++;
	}
	if (V.dojo) {
		idleTarget++;
	}
	if (V.brothel) {
		idleTarget++;
	}
	if (V.club) {
		idleTarget++;
	}
	if (V.dairy && V.dairyRestraintsSetting < 2) {
		idleTarget++;
	}
	if (V.farmyard) {
		idleTarget++;
	}
	if (App.Entity.facilities.servantsQuarters.established) {
		idleTarget++;
	}
	if (V.masterSuite) {
		idleTarget++;
	}
	if (V.schoolroom) {
		idleTarget++;
	}
	if (V.spa) {
		idleTarget++;
	}
	if (V.nursery) {
		idleTarget++;
	}
	if (V.clinic) {
		idleTarget++;
	}
	if (V.cellblock) {
		idleTarget++;
	}
	return Math.max(idleTarget, 20);
};

globalThis.generalRefreshment = function name() {
	if (V.PC.refreshmentType === 1) {
		return `glass of ${V.PC.refreshment}`;
	} else if (V.PC.refreshmentType === 2) {
		return `plate of ${V.PC.refreshment}`;
	} else if (V.PC.refreshmentType === 3) {
		return `line of ${V.PC.refreshment}`;
	} else if (V.PC.refreshmentType === 4) {
		return `syringe of ${V.PC.refreshment}`;
	} else if (V.PC.refreshmentType === 5) {
		return `pill of ${V.PC.refreshment}`;
	} else if (V.PC.refreshmentType === 6) {
		return `tab of ${V.PC.refreshment}`;
	} else { // 0 and default
		return `${V.PC.refreshment}`;
	}
};

/**
 * @param {string} name
 * @param {FC.SlaveTrinketData} [object]
 */
globalThis.addTrinket = (name, object) => {
	const trinket = V.trinkets.get(name);
	if (object) {
		if (!trinket) {
			V.trinkets.set(name, {
				slaveTrinket: true,
				data: new Set([object]),
			});
		} else if (trinket.slaveTrinket) {
			trinket.data = trinket.data ?? new Set();
			trinket.data.add(object);
		} else {
			throw new Error(`Attempted to add SlaveTrinketData to "${name}" which is not a slave trinket`);
		}
	} else {
		if (!trinket) {
			V.trinkets.set(name, {
				slaveTrinket: false,
				count: 1,
			});
		} else if (!trinket.slaveTrinket) {
			trinket.count = (trinket?.count ?? 0) + 1;
		} else {
			throw new Error(`SlaveTrinketData object was not provided when trying to add "${name}" which is a slave trinket`);
		}
	}
};

/**
 * returns false if the trinket doesn't exist or it is a slave trinket with no FC.IDs associated with it
 * returns the amount of trinkets the player has under the given name if `count = true`
 * returns a set of FC.IDs if the trinket is a slave trinket
 * returns true if none of the above is applicable
 * @param {string} name
 * @param {boolean} [count=false]
 * @returns {boolean | Set<FC.HumanID> | number}
 */
globalThis.hasTrinket = (name, count = false) => {
	const trinket = V.trinkets.get(name);
	if (!trinket) { return false; }
	if (count) { return trinket?.count ?? trinket?.data?.size ?? 0; }
	if (trinket.slaveTrinket) {
		/** @type {Set<FC.HumanID>} */
		const slaveIDs = new Set([]);
		trinket?.data?.forEach((data) => {
			slaveIDs.add(data.id);
		});
		slaveIDs.delete(undefined);
		return slaveIDs.size === 0 ? false : slaveIDs;
	}
	return true;
};

/**
 * Creates range object
 * @param {number} minValue
 * @param {number} maxValue
 * @returns {FC.NumericRange}
 */
App.Utils.makeRange = function(minValue, maxValue) {
	return {
		min: minValue, max: maxValue
	};
};

/**
 * Compares value to a range
 * @param {number} value
 * @param {FC.NumericRange} [range]
 * @returns {number} The value which when added to `value` brings it within the range [min:max]
 * `positive` when value is less than range min, `0` when the value is whithin the range or
 * the range is `null`, and `negative` when value is greater than range max
 */
App.Utils.distanceToRange = function(value, range) {
	if (!range) {
		return 0;
	}
	return value < range.min ? range.min - value : (value > range.max ? range.max - value : 0);
};

/**
 * @typedef {object} weightedObject
 * @property {number} weight
 */

/**
 * Gives back a random object from a given array, based on the weights of the objects.
 * Negative weights are not allowed and will break.
 *
 * @template {weightedObject} T
 * @param {Array<T>} values
 * @returns {T}
 */
globalThis.weightedRandom = function(values) {
	const sum = values.reduce((acc, cur) => acc + cur.weight, 0);
	let r = Math.random() * sum;
	for (const item of values) {
		if (r < item.weight) {
			return item;
		}
		r -= item.weight;
	}
	// Array was empty or all weights were 0
	return null;
};

/**
 * @typedef {object} geneToGenderOptions
 * @property {boolean} keepKaryotype if true then we will keep the karyotype. `XX` = `Female (XX)
 * @property {boolean} lowercase if true then we will make the output lower case. the karyotype is exempt from this.
 */

/**
 * Takes a karyotype (XX, XY, X, etc) and converts it to a gender (Female, Male, Turner Syndrome Female, etc)
 * @param {FC.GenderGenes} karyotype the karyotype to convert
 * @param {geneToGenderOptions} [options] {keepKaryotype: false, lowercase: true}
 * @returns {string} the gender that matches the karyotype
 */
globalThis.geneToGender = (karyotype, options = {
	keepKaryotype: false,
	lowercase: true,
}) => {
	/** @type {string} */
	let gender = {
		XX: 'Female',
		XY: 'Male',
		X: 'Turner Syndrome Female',
		X0: 'Turner Syndrome Female',
		XYY: 'XYY Syndrome Male',
		XXY: 'Klinefelter Syndrome Male',
		XXX: 'triple X Syndrome Female'
	}[String(karyotype).toUpperCase()] || `Unknown Gender: ${String(karyotype)}`;
	if (options.lowercase === true) {
		gender = gender.toLowerCase();
	}
	if (options.keepKaryotype === true && !gender.toLowerCase().startsWith("unknown gender")) {
		gender = `${gender} (${String(karyotype).toUpperCase()})`;
	}
	return gender;
};

/**
 * Makes sure a given options object conforms to a given specification
 * @param {any} options The options to be sanitized. Will throw an error if it is not null, undefined, or an object
 * @param {any} defaultOptions The default options. Will throw an error if this is not an object
 * @param {boolean} [errorOnUnknownKeys=true] If true we will throw an error if a key in options is not in defaultOptions
 * @returns {any} The sanitized options
 */
globalThis.sanitizeOptions = (options, defaultOptions, errorOnUnknownKeys = true) => {
	options = options ?? {}; // if options is undefined or null make it an object
	if (typeof options !== 'object') { throw new Error(`options is not an object. Got type "${typeof options}" instead`); }
	if (typeof defaultOptions !== 'object') { throw new Error(`defaultOptions is not an object. Got type "${typeof defaultOptions}" instead`); }

	for (const key of Object.getOwnPropertyNames(defaultOptions)) {
		options[key] = options[key] ?? clone(defaultOptions[key]);
	} // Add missing properties to options

	if (errorOnUnknownKeys) {
		for (const key of Object.getOwnPropertyNames(options)) {
			if (!defaultOptions.hasOwnProperty(key)) {
				throw new Error(`option "${key}" doesn't exist in defaultOptions`);
			}
		} // If the key doesn't exist in defaultOptions, throw an error
	}

	return options; // return the filled out options
};

/**
 * @returns {string} the current date and time
 */
App.Utils.getDatestamp = () => {
	const now = new Date();
	let MM = now.getMonth() + 1;
	let DD = now.getDate();
	let hh = now.getHours();
	let mm = now.getMinutes();
	let ss = now.getSeconds();

	// @ts-ignore
	if (MM < 10) { MM = `0${MM}`; }
	// @ts-ignore
	if (DD < 10) { DD = `0${DD}`; }
	// @ts-ignore
	if (hh < 10) { hh = `0${hh}`; }
	// @ts-ignore
	if (mm < 10) { mm = `0${mm}`; }
	// @ts-ignore
	if (ss < 10) { ss = `0${ss}`; }

	return `${now.getFullYear()}${MM}${DD}-${hh}${mm}${ss}`;
};

/**
 * @param {string} [baseName] the very first part of the filename; defaults to "free-cities".
 * @param {string} [extension] the file extension; defaults to "save".
 * @param {App.Entity.HumanState} [s] an optional state for character export
 * @returns {string} a string that is useful for filenames.
 */
App.Utils.getSaveFilename = (baseName='free-cities', extension='save', s = null) => {
	const arcologyName = V.arcologies === undefined || V.arcologies.length === 0 ? "New_Game_Setup" : V.arcologies[0].name.replaceAll(' ', '_').substring(0, 20);
	const week         = String(V.week).padStart(5, '0');
	const slave        = !s
		? String(slaveCount()).padStart(5, '0')
		: `${s.ID > 0 ? 'ID' + String(s.ID).padStart(5, '0'): 'PC'}-${((s.slaveSurname ? s.slaveSurname : '' ) + s.slaveName).replaceAll(' ', '').substring(0, 30)}`;
	const release      = String(V.releaseID).padStart(5, '0');
	const date         = App.Utils.getDatestamp();
	extension = extension ? `.${extension}` : '';

	return `${baseName}-${arcologyName}-W${week}-S${slave}-R${release}-${date}${extension}`;
};

/**
 * Resets the transition object to it's default value
 */
App.Utils.resetTransitionObject = () => {
	V.temp = {};
};
