App.Patch.register({
	releaseID: 1274,
	descriptionOfChanges: "Adds passage history directly into FC instead of relying on SC patches",
	pre: (div) => {
		V.passageHistory = V.passageHistory ?? [];
	}
});
