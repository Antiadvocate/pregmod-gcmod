App.Patch.register({
	releaseID: 1272,
	descriptionOfChanges: "Remove slave pool indices",
	pre: (div) => {
		App.Patch.log("Removing slave pool indices");
		deleteProps(V,
			"slaveIndices",
			"cribsIndices",
		);
		deleteProps(V.incubator, "tankIndices");
		App.Patch.log("Converting slave pools to maps");
		const slaves = new Map();
		const cribs = new Map();
		const tanks = new Map();
		V.slaves.forEach(s => { if (s !== null) { slaves.set(s.ID, s); } });
		V.cribs.forEach(s => { if (s !== null) { cribs.set(s.ID, s); } });
		V.incubator.tanks.forEach(s => { if (s !== null) { tanks.set(s.ID, s); } });
		V.slaves = slaves;
		V.cribs = cribs;
		V.incubator.tanks = tanks;
	}
});
