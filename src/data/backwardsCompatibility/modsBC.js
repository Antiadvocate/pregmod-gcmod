/**
 * All of the code in this file is legacy. Changing it will likely break old saves, as the patching system still uses it.
 *
 * To create a new patch (BC) see the instructions at the top of `/src/data/patches/patch.js`.
 */

// @ts-nocheck this is legacy, all of it's missing/incorrect values where correct when they were implemented. This worked fine with save data structures from release 1258 and before. And saves/new games after 1258 shouldn't be running this code

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`
 * @param {Node} node
 */
App.Update.mods = function(node) {
	food();

	function food() {
		App.Utils.deleteProperties(V, ["farmyardFoodCost"]);

		App.Utils.moveProperties(V.mods.food, V, {
			cost: "foodCost",
			amount: "food",
			lastWeek: "foodLastWeek",
			market: "foodMarket",
			rate: "foodRate",
			rations: "foodRations",
			total: "foodTotal",
			warned: "foodWarned"
		});

		V.mods.food.amount = Math.max(+V.mods.food.amount, 0) || 12500;
		V.mods.food.cost = Math.trunc(2500 / V.localEcon);
	}

	node.append(`Done!`);
};
