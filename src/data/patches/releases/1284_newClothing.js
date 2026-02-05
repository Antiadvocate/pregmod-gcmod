App.Patch.register({
	releaseID: 1284,
	descriptionOfChanges: "Adds new clothing option category",
	pre: (div) => {
		V.boughtItem.clothing.newmisc = 0;
	},
});
