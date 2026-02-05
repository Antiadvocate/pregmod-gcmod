App.Patch.register({
	releaseID: 1285,
	descriptionOfChanges: "Add an option to apply autosurgery to slaves outside of the penthouse",
	pre: (div) => {
		V.rulesAssistantFacilitiesAutosurgery = false;
	},
});
