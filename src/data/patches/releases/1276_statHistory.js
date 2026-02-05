App.Patch.register({
	releaseID: 1276,
	descriptionOfChanges: "Adds slave history for stat tracking.",
	pre: (div) => {
		setProp(V, "slaveHistory", 0);
	},
	slaveState: (div, actor, location) => {
		actor.history = actor.history ?? [];
		return actor;
	}
});
