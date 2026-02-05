App.Patch.register({
	releaseID: 1289,
	descriptionOfChanges: "Adds Experimental Headshot feature to ReactiveImageDB.",
	pre: (div) => {
		setProp(V,  "aiFaceReplacer", 0);
	}
});
