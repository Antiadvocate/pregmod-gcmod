/**
 * All of the code in this file is legacy. Changing it will likely break old saves, as the patching system still uses it.
 *
 * To create a new patch (BC) see the instructions at the top of `/src/data/patches/patch.js`.
 */

// @ts-nocheck this is legacy, all of it's missing/incorrect values where correct when they were implemented. This worked fine with save data structures from release 1258 and before. And saves/new games after 1258 shouldn't be running this code

/**
 * @deprecated Future BC should be handled in `/src/data/patches/patch.js` and `/src/data/verification/zVerify.js`
 */
App.Facilities.Pit.BC = function() {
	if (V.pit) {
		if (typeof V.pit === "number") {
			V.pit = V.pit ? {} : null;
		}

		App.Utils.assignMissingDefaults(V.pit, {
			name: getProp(V, "pitName", "the Pit"),
			virginities: getProp(V, "pitVirginities", "neither"),
			fighterIDs: getProp(V, "fighterIDs", []),
			fighters: 0,
			trainingIDs: [],
			audience: getProp(V, "pitAudience", "none"),
			lethal: getProp(V, "pitLethal", false),
			fought: getProp(V, "pitFought", false),
			slavesFighting: [],
			decoration: "standard",
			slaveFightingBodyguard: getProp(V, "slaveFightingBG", null),
			activeFights: [],
		});

		if (V.releaseID < 1186) {
			App.Utils.assignMissingDefaults(V.pit, {
				animal: getProp(V, "pitAnimalType", null),
				bodyguardFights: getProp(V, "pitBG", false),
			});
			if (typeof V.pit.virginities !== "string") {
				const virginities = ["neither", "vaginal", "anal", "all"];

				V.pit.virginities = virginities[V.pit.virginities];
			}

			if (V.pit.bodyguardFights && V.pit.fighterIDs.includes(V.BodyguardID)) {
				V.pit.fighterIDs.deleteAll(V.BodyguardID);
			}
		}

		deleteProps(V,
			"pitName", "pitVirginities", "pitBG", "fighterIDs",
			"pitAnimalType", "pitAudience", "pitLethal", "pitFought",
			"slaveFightingBG"
		);

		V.pit.lethal = V.pit.lethal === true ? 1 : V.pit.lethal === false ? 0 : V.pit.lethal;

		deleteProps(V.pit, "animal", "bodyguardFights", "slaveFightingAnimal");

		if (V.pit.virginities === "neither") {
			V.pit.virginities = "none";
		}

		V.pit.active = V.pit.active || false;
		V.pit.fightsBase = V.pit.fightsBase || 0;
		V.pit.seats = V.pit.seats || 0;
		if (V.pit.minimumHealth !== true && V.pit.minimumHealth !== false) {
			V.pit.minimumHealth = true;
		}
		if (V.pit.slavesFighting !== null) {
			if (V.pit.slavesFighting.length !== 2) {
				V.pit.slavesFighting = null;
			} else if (!V.pit.slavesFighting.reduce((acc, id) => acc && !!getSlave(id, true), true)) {
				// a slave scheduled to fight isn't owned anymore
				V.pit.slavesFighting = null;
			}
		}
	}

	if (V.pit && V.pit.trainingIDs) {
		V.pit.trainingIDs = V.pit.trainingIDs.filter(id => !!getSlave(id, true));
	}
};
