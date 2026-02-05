// This provides some helpful functions from the array prototype to the set prototype

// TODO:@franklygeorge implement as many of the extensions from map.extensions.js as makes sense for sets

Object.defineProperty(Set.prototype, "atIndex", {
	/**
	 * Returns a value for the entry at the given index.
	 * Returns undefined if the index is out of range.
	 * Expensive; cache the result if you need it more than once.
	 * @param {number} index
	 *
	 * @returns {any}
	 */
	value: function(index) {
		if (index + 1 > this.size) { return undefined; }
		return [...this][index];
	},
	enumerable: false,
	configurable: true,
	writable: true
});

Object.defineProperty(Set.prototype, "asArray", {
	/**
	 * Returns an array of the sets values.
	 * Expensive; Use `Set.prototype.values()` instead if possible.
	 */
	value: function() {
		return [...this];
	},
	enumerable: false,
	configurable: true,
	writable: true
});
