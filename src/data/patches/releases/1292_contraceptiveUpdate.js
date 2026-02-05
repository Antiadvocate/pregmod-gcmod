App.Patch.register({
	releaseID: 1292,
	descriptionOfChanges: `Seperates contraceptives and preg into their own variables.`,
	humanState: (div, actor, location) => {
		if (actor.preg === -1) {
			actor.preg = 0;
			actor.contraceptives = 1;
		} else {
			actor.contraceptives = 0;
		}
		return actor;
	}
});
