App.Patch.register({
	releaseID: 1290,
	descriptionOfChanges: "Add webgl custom outfits.",
	pre: (div) => {
		V.customOutfits = {};
	},
	humanState: (div, actor, location) => {
		actor.customOutfit = "";
		return actor;
	}
});
