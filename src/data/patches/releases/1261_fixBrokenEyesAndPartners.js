App.Patch.register({
	releaseID: 1261,
	descriptionOfChanges: "Some actors have eye objects that are missing iris and origColor values and some have missing/corrupted partners props, this fixes that",
	humanState: (div, actor, location) => {
		if (!("partners" in actor)) {
			App.Patch.log(`Adding partners set`);
			setProp(actor, "partners", new Set());
		}
		if (!(actor.partners instanceof Set)) {
			if (Array.isArray(actor.partners)) {
				actor.partners = new Set(getProp(actor, "partners"));
			} else {
				App.Patch.log(`partners was '${Serial.stringify(actor.partners)}' of type '${typeof actor.partners}', setting partners to an empty set`);
				actor.partners = new Set([]);
			}
		}

		const origEye = clone(actor?.eye);

		const origColor = actor?.eye?.origColor ??
			actor?.eye?.left?.iris ??
			actor?.eye?.right?.iris ??
			getProp(actor, "eyeColor", randomRaceEye(actor.race));
		const defaultEye = {
			"left": {
				"type": 1,
				"vision": 2,
				"iris": origColor,
				"pupil": "circular",
				"sclera": "white"
			},
			"right": {
				"type": 1,
				"vision": 2,
				"iris": origColor,
				"pupil": "circular",
				"sclera": "white"
			},
			"origColor": origColor
		};
		actor.eye = actor.eye ?? defaultEye;
		// we do left and right separately because if one is missing then they are missing that eye and we don't want to add it back
		if (actor.eye.left) {
			App.Utils.assignMissingDefaults(actor.eye.left, defaultEye.left);
		}
		if (actor.eye.right) {
			App.Utils.assignMissingDefaults(actor.eye.right, defaultEye.right);
		}
		actor.eye.origColor = actor.eye.origColor ?? origColor;
		if (Serial.stringify(origEye) !== Serial.stringify(actor.eye)) {
			App.Patch.log('Fixed corrupted eye object');
		}
		deleteProps(actor, "eyeColor");
		return actor;
	},
	fetus: (div, fetus, mother) => {
		fetus.genetics.eyeColor = fetus.genetics.eyeColor ?? mother?.eye?.origColor ?? randomRaceEye(fetus.genetics.race);
		return fetus;
	}
});
