App.Patch.register({
	releaseID: 1280,
	descriptionOfChanges: "Adds controllers for fertKnown and pregKnown as well as the showcase policy",
	pre: (div) => {
		V.menstruationKnown = 0;
		V.pregnancyKnown = 0;
		V.boughtItem.toys.chastity = 1;
		V.policies.contraceptivesBan = 0;
		V.scenarios = {};
		V.scenarios.contraceptivesBan = 0;
	},
});
