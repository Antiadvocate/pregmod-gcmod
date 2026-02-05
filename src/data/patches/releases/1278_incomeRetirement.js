App.Patch.register({
	releaseID: 1278,
	descriptionOfChanges: "Adds income retirement policy.",
	pre: (div) => {
		V.policies.retirement.income = 0;
	},
});
