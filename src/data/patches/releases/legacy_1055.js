App.Patch.register({
	descriptionOfChanges: "Adds support for saves from release 1055 and before",
	releaseID: 1055 +1,
	pre: (div) => {
		if (!jsDef(V.incubator)) {
			// @ts-ignore
			V.incubator = {capacity: 0, tanks: []};
		} else if (typeof V.incubator === "number") {
			App.Patch.log("Converting incubator");
			if (V.incubator > 0) {
				const storage = V.incubator;
				const incubatorTanks = getProp(V, "tanks", []);
				// @ts-ignore
				V.incubator = {capacity: storage, tanks: incubatorTanks};
			} else {
				// @ts-ignore
				V.incubator = {capacity: 0, tanks: []};
			}
		}
		deleteProps(V, "tanks");
	},
	humanState: (div, actor, location) => {
		if (!App.Utils.objectExistsAndHasKeys(actor.natural, ["height", "boobs", "artSeed"])) {
			App.Patch.log("Patching natural");
			const template = {
				height: 170,
				boobs: adjustBreastSize(actor),
				artSeed: jsRandom(0, 10 ** 14, undefined, undefined),
			};
			if (actor.geneticQuirks.dwarfism === 2 && actor.geneticQuirks.gigantism !== 2) {
				template.height = Height.randomAdult(actor, {limitMult: [-4, -1], spread: 0.15});
			} else if (actor.geneticQuirks.gigantism === 2) {
				template.height = Height.randomAdult(actor, {limitMult: [3, 10], spread: 0.15});
			} else {
				template.height = Height.randomAdult(actor);
			}
			actor.natural = actor.natural ?? template;
			actor.natural.height = actor.natural.height ?? template.height;
			actor.natural.boobs = actor.natural.boobs ?? template.boobs;
			actor.natural.artSeed = actor.natural.artSeed ?? template.artSeed;
		}
		return actor;
	},
	playerState: (div, actor, location) => {
		if (!App.Utils.objectExistsAndHasKeys(actor.badRumors, ["penetrative", "birth", "weakness"])) {
			App.Patch.log("Patching badRumors");
			const template = {
				penetrative: 0,
				birth: 0,
				weakness: 0,
			};
			actor.badRumors = actor.badRumors ?? template;
			actor.badRumors.penetrative = actor.badRumors.penetrative ?? template.penetrative;
			actor.badRumors.birth = actor.badRumors.birth ?? template.birth;
			actor.badRumors.weakness = actor.badRumors.weakness ?? template.weakness;
		}
		// make sure PC in in the genePool
		if (Array.isArray(V.genePool)) {
			if (!V.genePool.find(s => s.ID === -1)) {
				App.Patch.log("Adding PC to genePool");
				V.genePool.push(clone(V.PC));
			}
		} else {
			if (!isInGenePool(V.PC)) {
				App.Patch.log("Adding PC to genePool");
				addToGenePool(V.PC);
			}
		}
		return actor;
	}
});
