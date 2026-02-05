App.Patch.register({
	releaseID: 1283,
	descriptionOfChanges: "Moves the missingParentTag from the detached slave's actors to their stats",
	pre: (div) => {
		App.Patch.log("Moving missingParentTag from the detached slave's actors to their stats");
		const traitor = getTraitor();
		const boomerang = getBoomerang();
		if (typeof boomerang.stats === "number") {
			boomerang.stats = {};
		}
		if (typeof traitor.stats === "number") {
			traitor.stats = {};
		}
		if (traitor.actor && getProp(traitor.actor, "missingParentTag", undefined)) {
			traitor.stats = traitor.stats ?? {};
			traitor.stats.missingParentTag = getProp(traitor.actor, "missingParentTag", undefined);
			deleteProps(traitor.actor, "missingParentTag");
		}
		if (boomerang.actor && getProp(boomerang.actor, "missingParentTag", undefined)) {
			boomerang.stats = boomerang.stats ?? {};
			boomerang.stats.missingParentTag = getProp(boomerang.actor, "missingParentTag", undefined);
			deleteProps(boomerang.actor, "missingParentTag");
		}
	},
});
