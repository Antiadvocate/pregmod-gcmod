App.Patch.register({
	releaseID: 1273,
	descriptionOfChanges: "Add clothes toggle to cheat mode",
	pre: (div) => {
		if (V.cheatMode === 1) {
			V.cheatClothes = 1;
		} else {
			V.cheatClothes = 0;
		}
	}
});
