App.Patch.register({
	releaseID: 1262,
	descriptionOfChanges: "The hero slave system has been reworked giving each database its own ID range; This makes sure to fix the IDs in V.heroSlavesPurchased",
	pre: (div) => {
		if (V.heroSlavesPurchased.length !== 0) {
			App.Patch.log("Reassigning purchased hero slave IDs");
			/** @type {{[key: number]: number}} old ID: new ID */
			const lookup = {
				// XX
				// No need all the IDs stayed the same
				// XX Incest
				900110: 902001,
				900111: 902002,
				900113: 902003,
				// XX Hyper Preg
				907001: 904001,
				900114: 904002,
				// XX Fruit Girls
				// I really wish I had just left these in the 700000 range, oh well
				700001: 906001,
				700002: 906002,
				700003: 906003,
				700004: 906004,
				700005: 906005,
				700006: 906006,
				700007: 906007,
				700008: 906008,
				// XX Fruit Girls Extreme
				700009: 907001,
				// XX Extreme
				900099: 908001,
				900100: 908002,
				900101: 908003,
				900102: 908004,
				900104: 908005,
				900105: 908006,
				900106: 908007,
				900107: 908008,
				900108: 908009,
				900109: 908010,
				// XY
				// No need all the IDs stayed the same
				// XY Incest
				800038: 802001,
				// XY Hyper Preg
				// No need because their aren't any yet
				// XX Extreme
				800036: 808001,
				800037: 808002,
			};
			V.heroSlavesPurchased.forEach((value, index, purchased) => {
				if (value in lookup) {
					purchased[index] = lookup[value];
				}
			});
		}
	}
});
