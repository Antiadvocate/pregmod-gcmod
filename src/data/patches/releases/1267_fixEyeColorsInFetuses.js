App.Patch.register({
	releaseID: 1267,
	descriptionOfChanges: "Adds eye color to fetuses if it is missing due to bugs in getGenePoolRecord()",
	fetus: (div, fetus, mother) => {
		if (fetus.genetics.eyeColor === undefined) {
			const motherColor = getGenePoolRecord(mother).eye.origColor;
			fetus.genetics.eyeColor = motherColor;
			App.Patch.log(`Setting undefined eye color to '${motherColor}'`);
		}
		return fetus;
	}
});
