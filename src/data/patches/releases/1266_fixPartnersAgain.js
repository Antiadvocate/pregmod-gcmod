App.Patch.register({
	releaseID: 1266,
	descriptionOfChanges: `Recent changes to SC meant that imported/exported slaves were not serialized correctly. This 'fixes' (data is lost) those slaves.`,
	humanState: (div, actor, location) => {
		if (!(actor.partners instanceof Set)) {
			actor.partners = new Set([]);
		}
		return actor;
	}
});
