App.Patch.register({
	releaseID: 1281,
	descriptionOfChanges: "Refactors how trinket data is stored to hopefully make it a little better. Also removes several unused variables from V.",
	pre: (div) => {
		App.Patch.log("Converting V.trinkets' data structure");
		V.trinkets.forEach((trinket, desc, map) => {
			if (typeof trinket === "number") {
				if (trinket > 0) {
					map.set(desc, {
						slaveTrinket: false,
						count: trinket,
					});
				} else {
					map.delete(desc);
				}
			} else if (Array.isArray(trinket)) {
				map.set(desc, {
					slaveTrinket: true,
					data: new Set(trinket),
				});
			} else {
				throw new Error(`Unhandled trinket "${trinket}" with the type "${typeof trinket}" and key of "${desc}"`);
			}
		});
		App.Patch.log("Removing old variables");
		deleteProps(V, "deathIDs", "burstIDs", "birthIDs", "induceIDs");
	},
});
