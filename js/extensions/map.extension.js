// This provides some helpful functions from the array prototype to the map prototype

Object.defineProperty(Map.prototype, "filter", {
	/**
	 * Filters the map object the same way Array.prototype.filter filters Arrays
	 * Returns a new filtered map object
	 * @param {Function} callback the filtering function
	 * @returns {Map}
	 */
	value: function(callback) {
		const newMap = new Map();
		for (const [key, value] of this) {
			if (callback(value, key, this)) {
				newMap.set(key, value);
			}
		}
		return newMap;
	},
	enumerable: false,
	configurable: true,
	writable: true
});

Object.defineProperty(Map.prototype, "randomKey", {
	/**
	 * Returns a random key from the Map.
	 * @returns {any}
	 */
	value: function() {
		if (this.size === 0) { return undefined; }
		return [...this.keys()].random();
	},
	enumerable: false,
	configurable: true,
	writable: true
});

Object.defineProperty(Map.prototype, "randomValue", {
	/**
	 * Returns a random value from the Map.
	 * @returns {any}
	 */
	value: function() {
		if (this.size === 0) { return undefined; }
		return [...this.values()].random();
	},
	enumerable: false,
	configurable: true,
	writable: true
});

Object.defineProperty(Map.prototype, "randomEntry", {
	/**
	 * Returns a random entry from the Map.
	 * @returns {any}
	 */
	value: function() {
		if (this.size === 0) { return undefined; }
		return [...this.entries()].random();
	},
	enumerable: false,
	configurable: true,
	writable: true
});

Object.defineProperty(Map.prototype, "pluck", {
	/**
	 * Returns a random key/value pair from the Map. Removing it in the process.
	 * Returns an object with the properties: key and value
	 * @returns {{key: any, value: any}}
	 */
	value: function() {
		const key = this.randomKey();
		if (key === undefined) { return undefined; }
		const value = this.get(key);
		this.delete(key);
		return {key: key, value: value};
	},
	enumerable: false,
	configurable: true,
	writable: true
});

Object.defineProperty(Map.prototype, "map", {
	/**
	 * Returns an array mapped using the provided callback.
	 * @param {Function} callback
	 * @returns {any[]}
	 */
	value: function(callback) {
		const newArray = [];
		for (const [key, value] of this) {
			newArray.push(callback(value, key, this));
		}
		return newArray;
	},
	enumerable: false,
	configurable: true,
	writable: true
});

Object.defineProperty(Map.prototype, "find", {
	/**
	 * Returns a key/value object for the first entry in the map where predicate is true, and undefined otherwise.
	 *
	 * @param {Function} predicate
	 * find calls predicate once for each entry of the map, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns a key/value object. Otherwise, find returns undefined.
	 *
	 * @returns {{key: any, value: any}|undefined}
	 */
	value: function(predicate) {
		for (const [key, value] of this) {
			if (predicate(value, key, this)) {
				return {key: key, value: value};
			}
		}
		return undefined;
	},
	enumerable: false,
	configurable: true,
	writable: true
});

Object.defineProperty(Map.prototype, "atIndex", {
	/**
	 * Returns a key/value object for the entry at the given index.
	 * Returns undefined if the index is out of range.
	 * Expensive; cache the result if you need it more than once.
	 * @param {number} index
	 *
	 * @returns {{key: any, value: any}|undefined}
	 */
	value: function(index) {
		const keys = [...this.keys()];
		const key = keys[index];
		if (!key) { return undefined; }
		return {key: key, value: this.get(key)};
	},
	enumerable: false,
	configurable: true,
	writable: true
});

Object.defineProperty(Map.prototype, "every", {
	/**
	 * Determines whether all the members of a map satisfy the specified test.
	 *
	 * @param {Function} predicate
	 * A function that accepts up to three arguments. The every method calls the predicate function for each entry in the map until the predicate returns a value which is coercible to the Boolean value false, or until the end of the map.
	 */
	value: function(predicate) {
		for (const [key, value] of this) {
			if (!predicate(value, key, this)) {
				return false;
			}
		}
		return true;
	},
	enumerable: false,
	configurable: true,
	writable: true
});

Object.defineProperty(Map.prototype, "some", {
	/**
	 * Returns true if at least one member of a map satisfy the specified test.
	 *
	 * @param {Function} predicate
	 * A function that accepts up to three arguments. The every method calls the predicate function for each entry in the map until the predicate returns a value which is coercible to the Boolean value true, or until the end of the map.
	 */
	value: function(predicate) {
		for (const [key, value] of this) {
			if (predicate(value, key, this)) {
				return true;
			}
		}
		return false;
	},
	enumerable: false,
	configurable: true,
	writable: true
});

Object.defineProperty(Map.prototype, "asArray", {
	/**
	 * Returns an array of the maps values.
	 * Expensive; Use `Map.prototype.values()` instead if possible.
	 */
	value: function() {
		return [...this.values()];
	},
	enumerable: false,
	configurable: true,
	writable: true
});
