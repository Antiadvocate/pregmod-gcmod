App.Patch.register({
	releaseID: 1260,
	descriptionOfChanges: "Adds indices for V.incubator.tanks to match V.slaves and V.cribs",
	pre: (div) => {
		if (V.incubator.capacity > 0) {
			App.Patch.log("Adding V.incubator.tankIndices");
			// @ts-expect-error V.incubator.tanks was an array at this point
			V.incubator.tankIndices = V.incubator.tanks.reduce((acc, tank, i) => { acc[tank.ID] = i; return acc; }, {});
		}
	}
});
