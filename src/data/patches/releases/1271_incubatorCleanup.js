App.Patch.register({
	releaseID: 1271,
	descriptionOfChanges: "Remove incubator temporaries which are no longer used",
	pre: (div) => {
		App.Patch.log("Removing incubator temporaries");
		deleteProps(V.temp,	"readySlave", "newSlavePool");
		deleteProps(V.incubator, "readySlaves");
	}
});
