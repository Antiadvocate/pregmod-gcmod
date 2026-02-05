
/**
 * Runs verification for all fetuses in all SlaveStates objects
 * @see App.Utils.getAllSlaves
 * @param {HTMLDivElement} [div]
 */
App.Verify.fetuses = (div) => {
	let i;
	let f;
	const humans = getHumanStates();
	for (i in humans) {
		if (humans[i].womb && Array.isArray(humans[i].womb)) {
			for (f in humans[i].womb) {
				App.Verify.fetus(`getHumanStates()[${i}].womb[${f}]`, humans[i].womb[f], humans[i], div);
			}
		}
	}
};

/**
 * Runs verification for a single Fetus object.
 * @param {string} identifier
 * @param {FC.Fetus} fetus
 * @param {FC.HumanState} mother
 * @param {HTMLDivElement} [div]
 */
App.Verify.fetus = (identifier, fetus, mother, div) => {
	const original = _.cloneDeep(fetus);
	try {
		App.Patch.Utils.fetus(identifier, fetus, mother);
	} catch (e) {
		console.error(e);
		fetus = original;
		return;
	}
	// add missing props
	App.Utils.assignMissingDefaults(fetus, App.Patch.Utils.fetusTemplate(fetus, mother));
	// verify
	fetus = App.Verify.Utils.verify("fetus", identifier, fetus, mother, div);
};

// ***************************************************************************************************** \\
// *************************** Put your verification functions below this line *************************** \\
// ***************************************************************************************************** \\

/**
 * @type {App.Verify.Utils.FunctionFetus}
 */
App.Verify.I.fetusGeneticQuirks = (actor, mother) => {
	const quirks = {};
	App.Data.geneticQuirks.forEach((value, q) => quirks[q] = 0);
	// add any new quirks
	actor.genetics.geneticQuirks = Object.assign(clone(quirks), actor.genetics.geneticQuirks);
	return actor;
};
