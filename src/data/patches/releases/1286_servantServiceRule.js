App.Patch.register({
	releaseID: 1286,
	descriptionOfChanges: "Add a rule to servants quarter to enable or disable sexual services (on by default).",
	pre: (div) => {
		V.servantsQuarters.rules.sexualRelief = 1;
	},
});
