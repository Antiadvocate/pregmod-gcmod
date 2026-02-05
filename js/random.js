// cSpell:ignore unskewed
// cSpell:words Xoshiro128Twostar

/**
 * generate two independent Gaussian numbers using Box-Muller transform.
 * mean and deviation specify the desired mean and standard deviation.
 * @param {number} [mean=0]
 * @param {number} [deviation=1]
 * @param {number|string} [seed1=undefined]
 * @param {number|string} [seed2=undefined]
 * @returns {number[]}
 */
function gaussianPair(mean = 0, deviation = 1, seed1, seed2) {
	if (seed1 && !seed2) { seed2 = seed1; }
	const r = Math.sqrt(-2.0 * Math.log(1 - seededRandom(seed1)));
	const sigma = 2.0 * Math.PI * (1 - seededRandom(seed2));
	return [r * Math.cos(sigma), r * Math.sin(sigma)].map(val => val * deviation + mean);
}

/**
 * @param {number|string} [seed=undefined]
 * @returns {number} a random number from 0 to 1
 * if seed is undefined then it returns Math.random()
 */
function seededRandom(seed) {
	if (!seed) { return Math.random(); }
	return jsRandom(0, 1000000000000000, undefined, seed)/1000000000000000;
}

/**
 * Generate a skewed normal random variable
 * Reference: http://azzalini.stat.unipd.it/SN/faq-r.html
 * @param {number} skew
 * @param {number|string} [seed1=undefined]
 * @param {number|string} [seed2=undefined]
 * @returns {number}
 */
App.Utils.Math.skewedGaussian = function(skew, seed1, seed2) {
	let randoms = gaussianPair(undefined, undefined, seed1, seed2);
	if (skew === 0) {
		// Don't bother, return an unskewed normal distribution
		return randoms[0];
	}
	let delta = skew / Math.sqrt(1 + skew * skew);
	let result = delta * randoms[0] + Math.sqrt(1 - delta * delta) * randoms[1];
	return randoms[0] >= 0 ? result : -result;
};

/**
 * Generate a skewed normal random variable between max and min
 * @param {number} max
 * @param {number} min
 * @param {number} skew
 * @param {number|string} [seed1=undefined]
 * @param {number|string} [seed2=undefined]
 * @returns {number}
 */
App.Utils.Math.limitedSkewedGaussian = function(max, min, skew, seed1, seed2) {
	if (seed1 && !seed2) { seed2 = seed1; }
	let result = App.Utils.Math.skewedGaussian(skew, seed1, seed2);
	while (result < min || result > max) {
		seed1 = iterateSeed(seed1);
		seed2 = iterateSeed(seed2);
		result = App.Utils.Math.skewedGaussian(skew, seed1, seed2);
	}
	return result;
};

/**
 * @param {number} [mean=0]
 * @param {number} [deviation=1]
 * @param {number} [min=mean-3]
 * @param {number} [max=mean+3*deviation]
 * @param {number|string} [seed=undefined]
 * @returns {number}
 */
globalThis.normalRandInt = (mean = 0, deviation = 1, min = mean - 3 * deviation, max = mean + 3 * deviation, seed) => {
	let val = gaussianPair(mean, deviation, seed, iterateSeed(seed))[0];
	while (val < min || val > max) {
		seed = iterateSeed(seed);
		val = gaussianPair(mean, deviation, seed, iterateSeed(seed))[0];
	}
	return Math.round(val);
};

/**
 * convert a string into a number hash
 * @param {string|number} seed the seed to convert
 * @returns {function(void):number} the number hash
 */
function MurmurHash3(seed) {
	// make sure the seed is a string
	seed = String(seed);
	let i = 0;
	let hash;
	// @ts-ignore
	for (i, hash = 1779033703 ^ seed.length; i < seed.length; i++) {
		let bitwiseXorFromCharacter = hash ^ seed.charCodeAt(i);
		hash = Math.imul(bitwiseXorFromCharacter, 3432918353);
		hash = hash << 13 | hash >>> 19;
	}
	return () => {
		// Return the hash that you can use as a seed
		hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
		hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
		return (hash ^= hash >>> 16) >>> 0;
	};
}

/**
 * Generates a reproducible number from the given seeds
 * @param {number} seed1
 * @param {number} seed2
 * @param {number} [optionalSeed3]
 * @param {number} [optionalSeed4]
 * @returns {function(void):number}
 */
function Xoshiro128Twostar(seed1, seed2, optionalSeed3, optionalSeed4) {
	return () => {
		let t = seed2 << 9;
		let y = seed1 * 5;
		y = (y << 7 | y >>> 25) * 9;
		optionalSeed3 ^= seed1;
		optionalSeed4 ^= seed2;
		seed2 ^= optionalSeed3;
		seed1 ^= optionalSeed4;
		optionalSeed3 ^= t;
		optionalSeed4 = optionalSeed4 << 11 | optionalSeed4 >>> 21;
		return (y >>> 0) / 4294967296;
	};
}

/**
 * @param {number|string} seed
 * @returns {string}
 */
globalThis.iterateSeed = (seed) => {
	if (!seed) { seed = jsRandom(0, 10 ** 14); }
	return String(seed) + String(jsRandom(0, 9, undefined, String(seed)));
};

/**
 * Returns a random integer between min and max (both inclusive).
 * If count is defined, chooses that many random numbers between min and max and returns the average. This is an approximation of a normal distribution.
 * Count and seed are exclusive. If the seed is defined then count will be ignored
 * @param {number} min
 * @param {number} max
 * @param {number} [count=1]
 * @param {number|string} [seed=undefined] if provided this is passed to Xoshiro128Twostar to generate a reproducible "random" (seed should be generated using a random number generator) number
 * @returns {number}
 */
function jsRandom(min, max, count = 1, seed=undefined) {
	/**
	 * @returns {number} a random number within the range of [min, max] (inclusive) using Math.random()
	 */
	function rand() {
		return Math.random() * (max - min + 1) + min;
	}

	if (seed) {
		// get the random number
		let randomNumber = Xoshiro128Twostar(MurmurHash3(seed)(), MurmurHash3(seed)())();
		// min max it and then return
		return Math.floor(randomNumber * (max - min + 1) + min);
	}

	if (count === 1) {
		return Math.floor(rand());
	}

	let total = 0;
	for (let i = 0; i < count; i++) {
		total += rand();
	}
	return Math.floor(total / count);
}

/**
 * Chooses multiple random elements of an array.
 * @template {*} T
 * @param {Array<T>} arr the array of elements to choose from
 * @param {number} count how many elements to pick
 * @param {number|string} [seed=undefined] if provided this is passed to Xoshiro128Twostar to generate a reproducible "random" (seed should be generated using a random number generator) number
 * @returns {Array<T>}
 */
// eslint-disable-next-line no-unused-vars
function jsRandomMany(arr, count, seed = undefined) {
	let randomNumber = Math.random;
	if (seed) {
		randomNumber = Xoshiro128Twostar(MurmurHash3(seed)(), MurmurHash3(iterateSeed(seed))());
	}
	let result = [];
	let tmp = arr.slice();
	for (let i = 0; i < count; i++) {
		let index = Math.floor(randomNumber() * tmp.length);
		result.push(tmp.splice(index, 1)[0]);
	}
	return result;
}

/**
 * Accepts both an array and a list, returns undefined if nothing is passed.
 * @template {*} T
 * @param {Array<T>} choices
 * @param {...T} [otherChoices]
 * @returns {T}
 */
// eslint-disable-next-line no-unused-vars
function jsEither(choices, ...otherChoices) {
	if (otherChoices.length === 0 && Array.isArray(choices)) {
		return choices[Math.floor(Math.random() * choices.length)];
	}
	const allChoices = otherChoices;
	allChoices.push(...choices);
	return allChoices[Math.floor(Math.random() * allChoices.length)];
}

/**
 * Accepts both an array and a list, returns undefined if nothing is passed.
 * @template {*} T
 * @param {number|string} seed the seed to pass to Xoshiro128Twostar
 * @param {Array<T>} choices
 * @param {...T} [otherChoices]
 * @returns {T}
 */
// eslint-disable-next-line no-unused-vars
function jsSeededEither(seed, choices, ...otherChoices) {
	if (seed === undefined) {
		// if seed is undefined for some reason then just return jsEither instead
		return jsEither(choices, ...otherChoices);
	}
	// convert it into a hash
	let hash = MurmurHash3(seed)();
	// get the random number
	let randomNumber = Xoshiro128Twostar(hash, hash)();
	if (otherChoices.length === 0 && Array.isArray(choices)) {
		return choices[Math.floor(randomNumber * choices.length)];
	}
	const allChoices = otherChoices;
	allChoices.push(...choices);
	return allChoices[Math.floor(randomNumber * allChoices.length)];
}
