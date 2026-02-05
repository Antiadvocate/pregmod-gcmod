/** @file holds functions that help manage data. */

/**
 * @deprecated use {@link App.Utils.assignMissingDefaults}(obj, props) instead
 * TODO:@franklygeorge replace this with `App.Utils.assignMissingDefaults`
 * Adds properties from `props` to `obj` if they don't already exist
 * @template {object} T
 * @template {keyof T} K
 * @param {T} obj
 * @param {Record<K, T[K]>} props
 */
App.Utils.setNonexistentProperties = function(obj, props) {
	for (const p of Object.getOwnPropertyNames(props)) {
		if (typeof obj[p] === "undefined") {
			obj[p] = clone(props[p]);
		}
	}
};

/**
 * Takes the properties from one or more objects and adds them to obj recursively.
 * Does not overwrite existing values, doesn't merge lists.
 * @param {object} obj the object to add missing properties to.
 * @param  {...object} defaultObjs one or more objects to add the properties from.
 */
App.Utils.assignMissingDefaults = (obj, ...defaultObjs) => {
	if (obj === undefined || obj == null) {
		throw new Error(`assignMissingDefaults() expects param in position 1 to be an object`);
	}
	/** @type {object[]} */
	const defaults = [...defaultObjs];
	for (const index in defaults) {
		if (defaults[index] === undefined || defaults[index] == null) {
			throw new Error(`assignMissingDefaults() expects param in position ${Number(index) +2} to be an object`);
		}
	}
	for (const defaultObj of defaults) {
		for (const key of Object.keys(defaultObj)) {
			if (obj[key] === undefined) {
				obj[key] = clone(defaultObj[key]);
			} else if (
				obj[key] != null && typeof obj[key] === "object" &&
				defaultObj[key] != null &&  typeof defaultObj[key] === "object" &&
				!Array.isArray(defaultObj[key])
			) {
				App.Utils.assignMissingDefaults(obj[key], defaultObj[key]);
			}
		}
	}
	return obj; // we return the obj so that is some idiot (like me) tries to assign the result of this call to something it will work as they expect
};

/**
 * @deprecated use {@link App.Utils.overwriteWithDefaults}(obj, props) instead
 * TODO:@franklygeorge replace this with `App.Utils.overwriteWithDefaults(obj, props)`
 * Adds properties from `props` to `obj`, overwriting the existing values
 * @param {object} obj
 * @param {object} props
 */
App.Utils.setExistentProperties = function(obj, props) {
	for (let p in props) {
		if (Array.isArray(props[p])) {
			obj[p] = Array.from(props[p]);
		} else if (typeof props[p] === "object" && props[p] !== null) {
			console.log("forcing V." + p + " to ", props[p]);
			obj[p] = clone(props[p]);
		} else {
			obj[p] = props[p];
		}
	}
};

/**
 * The first object is the object to be modified.
 * All objects defined after that will be added to the object in the order they are defined
 * overwritting any values in object that have the same key as them
 * and overwritting any values that have the same key as objects that were defined before them.
 * Overwrites existing values, doesn't merge lists, can handle complex objects (is recursive).
 * @param {object} obj The object to be modified
 * @param  {...object} defaultObjs one or more objects to use the properties and values from
 */
App.Utils.overwriteWithDefaults = (obj, ...defaultObjs) => {
	if (obj === undefined || obj == null) {
		throw new Error(`overwriteWithDefaults() expects and object`);
	}
	/** @type {object[]} */
	const defaults = [...defaultObjs];
	for (const index in defaults) {
		if (defaults[index] === undefined || defaults[index] == null) {
			throw new Error(`overwriteWithDefaults() expects param in position ${Number(index) +2} to be an object`);
		}
	}
	for (const defaultObj of defaults) {
		if (defaultObj === undefined || obj == null) { continue; }
		for (const key of Object.keys(defaultObj)) {
			if (obj[key] != null && typeof obj[key] === "object" &&
				defaultObj[key] != null && typeof defaultObj[key] === "object" &&
				!Array.isArray(defaultObj[key])
			) {
				App.Utils.overwriteWithDefaults(obj[key] ?? {}, defaultObj[key]);
			} else if (Array.isArray(obj[key]) && Array.isArray(defaultObj[key])) {
				obj[key] = Array.from(clone(defaultObj[key]));
			} else {
				obj[key] = defaultObj[key];
			}
		}
	}
	return obj; // we return the obj so that is some idiot (like me) tries to assign the result of this call to something it will work as they expect
};

/**
 * Moves properties listed in `mapping` from `src` to `dst`
 * renaming them according to `mapping`'s key/value pairs
 * @param {object} target
 * @param {object} source
 * @param {{[key: string]: string}} mapping {new_key: "original_key", ...}
 * @param {boolean}[overwrite=true] Overwrite target properties
 * @param {boolean}[alwaysDelete=false] Delete source property even if it was not moved
 */
App.Utils.moveProperties = function(target, source, mapping, overwrite = true, alwaysDelete = false) {
	for (const [k, v] of Object.entries(mapping)) {
		if (source.hasOwnProperty(v)) {
			if (overwrite || !target.hasOwnProperty(k)) {
				target[k] = source[v];
				delete source[v];
			} else if (alwaysDelete) {
				delete source[v];
			}
		}
	}
};

/**
 * Deletes the given array of keys from `obj` if they exist
 * @param {object} obj
 * @param {string[]} props
 */
App.Utils.deleteProperties = function(obj, props) {
	for (const p of props) {
		delete obj[p];
	}
};

/**
 * returns true if the object exists and has the specified keys, false otherwise.
 * does not check for extra keys on the object.
 * @param {object} obj
 * @param {string[]} keys
 */
App.Utils.objectExistsAndHasKeys = function(obj, keys) {
	if (!obj) { return false; }
	for (let k in keys) {
		let key = keys[k];
		if (!(key in obj)) { return false; }
	}
	return true;
};

/**
 * Checks the object for the properties in props and returns a list of any that are missing.
 * Returns void if none are missing
 * @param {object} obj
 * @param {string[]} props a list of property keys to look for
 * @returns {void|string[]}
 */
App.Utils.listMissingProps = (obj, props) => {
	/** @type {string[]} */
	const missing = [];

	props.forEach((prop) => {
		if (!(prop in obj)) {
			missing.push(prop);
		}
	});

	if (missing.length === 0) {
		return;
	}
	return missing;
};
