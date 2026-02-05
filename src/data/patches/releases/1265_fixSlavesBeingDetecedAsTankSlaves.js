App.Patch.register({
	releaseID: 1265,
	descriptionOfChanges: "Remove incubatorSettings from all HumanStates except for TankSlaveStates",
	humanState: (div, actor, location) => {
		if (location !== "tank slave pool" && "incubatorSettings" in actor) {
			deleteProps(actor, "incubatorSettings");
		}
		return actor;
	}
});
