App.Patch.register({
	releaseID: 1269,
	descriptionOfChanges: "Moves the detached slaves into V.detached",
	pre: (div) => {
		App.Patch.log("Moving detached slaves");
		V.detached = {
			"traitor": {
				"actor": getProp(V, "traitor"),
				"type": getProp(V, "traitorType"),
				"weeks": getProp(V, "traitorWeeks"),
				"stats": getProp(V, "traitorStats"),
			},
			"hostage": {
				"actor": getProp(V, "hostage"),
				"wife": getProp(V, "hostageWife"),
			},
			"shelter": {
				"actor": getProp(V, "shelterSlave"),
				"bought": getProp(V, "shelterSlaveBought"),
			},
			"boomerang": {
				"actor": getProp(V, "boomerangSlave"),
				"buyer": getProp(V, "boomerangBuyer"),
				"weeks": getProp(V, "boomerangWeeks"),
				"stats": getProp(V, "boomerangStats"),
			}
		};
		deleteProps(V,
			"traitor", "traitorType", "traitorWeeks", "traitorStats",
			"hostage", "hostageWife",
			"shelterSlave", "shelterSlaveBought",
			"boomerangSlave", "boomerangBuyer", "boomerangWeeks", "boomerangStats",
		);
	}
});
