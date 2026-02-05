// cSpell:ignore inclusivity
// Extension from mousetrap-record
interface MousetrapStatic {
	record(callback: (this: MousetrapStatic, sequence: string[]) => void): void;
}

interface Number {
	// number extensions are defined in `js/extensions/number.extension.js`
	/**
	 * Returns whether the value is between the given bounds, with optional inclusivity. Exclusive by default.
	 * @param min The minimum value to check against.
	 * @param max The maximum value to check against.
	 * @param inclusive Whether to include the bounds values.
	 */
	 isBetween(min: number, max: number, inclusive?: boolean): boolean;
}

interface Map<K, V> {
	// map extensions are defined in `js/extensions/map.extension.js`
	/**
	 * Filters the map object the same way Array.prototype.filter() filters Arrays.
	 * Returns a new filtered map object.
	 */
	filter(callback: (value: V, key: K, originalMap: Map<K, V>) => void): Map<K, V>;

	/**
	 * Returns a random key from the Map.
	 */
	randomKey(): K;

	/**
	 * Returns a random value from the Map.
	 */
	randomValue(): V;

	/**
	 * Returns a random entry from the Map.
	 */
	randomEntry(): [K, V];

	/**
	 * Returns a random key/value pair from the Map. Removing it in the process.
	 * Returns an object with the properties: key and value
	 * Will return {key: undefined, value: undefined} if the map has no entries
	 */
	pluck(): {key: K, value: V};

	// TODO: figure out how to indicate in typescript that the return type of the callback is the type in the returned array
	/** Returns an array mapped using the provided callback. */
	map(callback: (value: V, key: K, map: Map<K, V>) => any): any[];

	/**
	 * Returns a key/value object for the first entry in the map where predicate is true, and undefined otherwise.
	 *
	 * @param {Function} predicate
	 * find calls predicate once for each entry of the map, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns a key/value object. Otherwise, find returns undefined.
	 *
	 * @returns {{key: any, value: any}|undefined}
	 */
	find(predicate: (value: V, key: K, map: Map<K, V>) => boolean): {key: K, value: V};

	/**
	 * Returns a key/value object for the entry at the given index.
	 * Returns undefined if the index is out of range.
	 * Expensive; cache the result if you need it more than once.
	 */
	atIndex(index: number): {key: K, value: V};

	/**
	 * Determines whether all the members of an map satisfy the specified test.
	 *
	 * @param {Function} predicate
	 * A function that accepts up to three arguments. The every method calls the predicate function for each entry in the map until the predicate returns a value which is coercible to the Boolean value false, or until the end of the map.
	 */
	every(predicate: (value: V, key: K, map: Map<K, V>) => boolean): boolean;

	/**
	 * Returns true if at least one member of a map satisfy the specified test.
	 *
	 * @param {Function} predicate
	 * A function that accepts up to three arguments. The some method calls the predicate function for each entry in the map until the predicate returns a value which is coercible to the Boolean value true, or until the end of the map.
	 */
	some(predicate: (value: V, key: K, map: Map<K, V>) => boolean): boolean;

	/**
	 * Returns an array of the maps values.
	 * Expensive; Use `Map.prototype.values()` instead if possible.
	 */
	asArray(): V[];
}

interface ReadonlyMap<K, V> {
	// map extensions are defined in `js/extensions/map.extension.js`
	// this is a copy of interface Map<K, V> above with modifications to make things read only
	/**
	 * Filters the map object the same way Array.prototype.filter() filters Arrays.
	 * Returns a new filtered map object.
	 */
	filter(callback: (value: Readonly<V>, key: Readonly<K>, originalMap: ReadonlyMap<K, V>) => void): ReadonlyMap<K, V>;

	/**
	 * Returns a random key from the Map.
	 */
	randomKey(): Readonly<K>;

	/**
	 * Returns a random value from the Map.
	 */
	randomValue(): Readonly<V>;

	/**
	 * Returns a random entry from the Map.
	 */
	randomEntry(): [Readonly<K>, Readonly<V>];

	/**
	 * Returns a random key/value pair from the Map. Removing it in the process.
	 * Returns an object with the properties: key and value
	 * Will return {key: undefined, value: undefined} if the map has no entries
	 */
	pluck(): {key: Readonly<K>, value: Readonly<V>};

	// TODO: figure out how to indicate in typescript that the return type of the callback is the type in the returned array
	/** Returns an array mapped using the provided callback. */
	map(callback: (value: Readonly<V>, key: Readonly<K>, map: ReadonlyMap<K, V>) => any): ReadonlyArray<any>;

	/**
	 * Returns a key/value object for the first entry in the map where predicate is true, and undefined otherwise.
	 *
	 * @param {Function} predicate
	 * find calls predicate once for each entry of the map, in ascending order, until it finds one where predicate returns true. If such an element is found, find immediately returns a key/value object. Otherwise, find returns undefined.
	 *
	 * @returns {{key: Readonly<any>, value: Readonly<any>}|undefined}
	 */
	find(predicate: (value: Readonly<V>, key: Readonly<K>, map: ReadonlyMap<K, V>) => boolean): {key: Readonly<K>, value: Readonly<V>};

	/**
	 * Returns a key/value object for the entry at the given index.
	 * Returns undefined if the index is out of range.
	 * Expensive; cache the result if you need it more than once.
	 */
	atIndex(index: number): {key: Readonly<K>, value: Readonly<V>};

	/**
	 * Determines whether all the members of an map satisfy the specified test.
	 *
	 * @param {Function} predicate
	 * A function that accepts up to three arguments. The every method calls the predicate function for each entry in the map until the predicate returns a value which is coercible to the Boolean value false, or until the end of the map.
	 */
	every(predicate: (value: Readonly<V>, key: Readonly<K>, map: ReadonlyMap<K, V>) => boolean): boolean;

	/**
	 * Returns true if at least one member of a map satisfy the specified test.
	 *
	 * @param {Function} predicate
	 * A function that accepts up to three arguments. The some method calls the predicate function for each entry in the map until the predicate returns a value which is coercible to the Boolean value true, or until the end of the map.
	 */
	some(predicate: (value: Readonly<V>, key: Readonly<K>, map: ReadonlyMap<K, V>) => boolean): boolean;

	/**
	 * Returns an array of the maps values.
	 * Expensive; Use `Map.prototype.values()` instead if possible.
	 */
	asArray(): ReadonlyArray<V>;
}

interface Set<T> {
	// set extensions are defined in `js/extensions/set.extension.js`

	/**
	 * Returns a value for the entry at the given index.
	 * Returns undefined if the index is out of range.
	 * Expensive; cache the result if you need it more than once.
	 */
	atIndex(index: number): T|undefined;

	/**
	 * Returns an array of the sets values.
	 * Expensive; Use `Set.prototype.values()` instead if possible.
	 */
	asArray(): Array<T>;
	
}

type EnumerablePropertyKey<T extends PropertyKey> = T extends symbol ? never : (T extends number ? string : T);

interface ObjectConstructor {
	keys<K extends PropertyKey, V>(o: Partial<Record<K, V>>): EnumerablePropertyKey<K>[];
	entries<K extends PropertyKey, V>(o: Partial<Record<K, V>>): [EnumerablePropertyKey<K>, V][];
}


type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
