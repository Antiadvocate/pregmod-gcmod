App.Patch.register({
	releaseID: 1263,
	descriptionOfChanges: "V.incubator.upgrade must be moved to V.incubator.upgrades before work on further facility conversions can advance.",
	pre: (div) => {
		V.incubator.upgrades = clone(V.incubator.upgrade);
		deleteProps(V.incubator, "upgrade");
	}
});
