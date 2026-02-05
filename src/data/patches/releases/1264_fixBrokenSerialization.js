App.Patch.register({
	releaseID: 1264,
	descriptionOfChanges: `Some old saves incorrectly serialized 'undefined' as '[ "(revive:eval)", "undefined" ]'`,
	slaveState: (div, actor, location) => {
		if (typeof actor.clothingBaseColor !== 'string' && actor.clothingBaseColor !== undefined) {
			actor.clothingBaseColor = undefined;
			App.Patch.log("Fixed corrupted 'clothingBaseColor'");
		}
		if (typeof actor.glassesColor !== 'string' && actor.glassesColor !== undefined) {
			actor.glassesColor = undefined;
			App.Patch.log("Fixed corrupted 'glassesColor'");
		}
		if (typeof actor.shoeColor !== 'string' && actor.shoeColor !== undefined) {
			actor.shoeColor = undefined;
			App.Patch.log("Fixed corrupted 'shoeColor'");
		}
		if (typeof actor.kindness !== 'string' && actor.kindness !== undefined) {
			actor.kindness = undefined;
			App.Patch.log("Fixed corrupted 'kindness'");
		}

		return actor;
	},
});
