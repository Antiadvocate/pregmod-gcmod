App.Patch.register({
	releaseID: 1275,
	descriptionOfChanges: "Add a flag to facilities to indicate whether they're located in the penthouse or not",
	pre: (div) => {
		App.Patch.log("Patching facility location");
		for (const establishedFacility of Object.values(App.Entity.facilities).filter(f => f.established)) {
			let baseName = establishedFacility.desc.baseName;
			if (baseName === "dojo") {
				baseName = "armory";
			} else if (baseName === "HGSuite") {
				baseName = "headGirlSuite";
			}
			console.log(baseName, App.Data.Facilities[baseName]);
			/** @type {FC.FacilityFramework} */
			const desc = App.Data.Facilities[baseName];
			establishedFacility.isInPenthouse = desc.penthouseFacility;
		}
	}
});
