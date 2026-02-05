App.Patch.register({
	releaseID: 1287,
	descriptionOfChanges: "Add optional rules to use new facial morphs.",
	pre: (div) => {
		V.setFaceBlending = false;
		V.faceBlendCount = 5;
		V.setBeautyModifer = false;
		V.beautyModifierImpact = 2;
		V.setMinorFacial = false;
		V.minorFacialMaxStrength = 0.25;
	},
});
