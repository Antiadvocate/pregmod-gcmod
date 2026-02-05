/**
 * All of the code in this file is legacy. Changing it will likely break old saves, as the patching system still uses it.
 *
 * To create a new patch (BC) see the instructions at the top of `/src/data/patches/patch.js`.
 */

// @ts-nocheck this is legacy, all of it's missing/incorrect values where correct when they were implemented. This worked fine with save data structures from release 1258 and before. And saves/new games after 1258 shouldn't be running this code

App.Update.assistantBC = function() {
	// eslint-disable-next-line jsdoc/require-jsdoc
	function convert(oldVar, variable, value = null) {
		if (jsDef(V[oldVar])) {
			if (typeof V[oldVar] !== "number" || (typeof V[oldVar] === "number" && V[oldVar] > 0)) {
				V.assistant[variable] = value === null ? V[oldVar] : value;
			}
		}
		delete V[oldVar];
	}

	V.assistant = Object.assign({}, {
		personality: V.assistant,
		name: V.assistantName,
		power: V.assistantPower,
		appearance: V.assistantAppearance,
	});
	delete V.assistantName; delete V.assistantPower;
	delete V.assistantAppearance; delete V.assistantPronouns;

	convert('marketAssistantAnnounced', 'market', {});
	convert('assistantExtra1', 'Extra1');
	convert('assistantExtra2', 'Extra2');
	convert('assistantNameAnnounced', 'announcedName');
	convert('assistantBodyDesire', 'bodyDesire');
	convert('assistantOptions', 'options');
	convert('assistantFSOptions', 'fsOptions');
	convert('assistantFSAppearance', 'fsAppearance');

	if (V.assistant.market) {
		Object.assign(V.assistant.market, {
			relationship: V.marketAssistantRelationship,
			limit: V.marketAssistantLimit,
			aggressiveness: V.marketAssistantAggressiveness,
		});
	}
	delete V.marketAssistantRelationship; delete V.marketAssistantLimit;
	delete V.marketAssistantAggressiveness; delete V.marketAssistantPronouns;
};
