App.Patch.register({
	releaseID: 1293,
	descriptionOfChanges: `Add dot digraph family tree style.`,
	pre: (_) => {
		V.familyTreeStyle = 0;
	},
});
