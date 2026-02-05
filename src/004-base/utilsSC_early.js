/**
 * @param {string} tag
 * @returns {Passage}
 */
globalThis.getPassagesWithTag = function(tag) {
	return Story.filter(p => p.tags.includes(tag));
};
