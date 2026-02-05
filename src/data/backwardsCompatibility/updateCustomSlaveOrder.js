/**
 * All of the code in this file is legacy. Changing it will likely break old saves, as the patching system still uses it.
 *
 * To create a new patch (BC) see the instructions at the top of `/src/data/patches/patch.js`.
 */

// @ts-nocheck this is legacy, all of it's missing/incorrect values where correct when they were implemented. This worked fine with save data structures from release 1258 and before. And saves/new games after 1258 shouldn't be running this code

/**
 * Update custom slave orders (customSlave/huskSlave).
 * @deprecated Future cleanup should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`.
 * @param {FC.CustomSlaveOrder} customSlaveOrder
 */
App.Update.CustomSlaveOrder = function(customSlaveOrder) {
	if (!customSlaveOrder.hasOwnProperty("leg")) {
		if (jsDef(customSlaveOrder.amp) && customSlaveOrder.amp === 1) {
			customSlaveOrder.leg = {left: null, right: null};
		} else {
			customSlaveOrder.leg = {left: new App.Entity.LegState(), right: new App.Entity.LegState()};
		}
	}

	if (!customSlaveOrder.hasOwnProperty("arm")) {
		if (jsDef(customSlaveOrder.amp) && customSlaveOrder.amp === 1) {
			customSlaveOrder.arm = {left: null, right: null};
		} else {
			customSlaveOrder.arm = {left: new App.Entity.LegState(), right: new App.Entity.LegState()};
		}
	}

	App.Utils.deleteProperties(customSlaveOrder, ["amp"]);

	App.Utils.setNonexistentProperties(customSlaveOrder, {
		skill: {whore: 15, combat: 0},
		hairColor: "hair color is unimportant",
		eyesColor: "eye color is unimportant"

	});

	App.Utils.moveProperties(customSlaveOrder.skill, customSlaveOrder, {
		whore: "whoreSkills",
		combat: "combatSkills"
	});

	if (V.releaseID < 1059) {
		customSlaveOrder.eye = new App.Entity.EyeState();
		App.Utils.deleteProperties(customSlaveOrder, ["eyes"]);
	}
};
