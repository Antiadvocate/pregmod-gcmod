App.Patch.register({
	releaseID: 1282,
	descriptionOfChanges: "Adds location backgrounds variable",
	pre: (div) => {
		V.aiLocationBackgrounds = 0;
	},
});
