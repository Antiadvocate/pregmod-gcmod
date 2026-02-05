App.Version = {
	base: "0.10.7.1", // The vanilla version the mod is based off of, this should never be changed.
	pmod: "4.0.0-alpha.38",
	commitHash: null,
	/**
	 * @type {number} used for patching via BC
	 * See {@link App.Patch.applyAll}
	 *
	 * When you get to release 2000, use 2001 instead.
	 * The release numbers got messed up, this is corrected in `src/js/eventHandlers.js` and `/src/data/patches/patch.js`.
	 * The two line above and this line should be safe to remove after release 2001.
	 */
	release: 1285,
};
