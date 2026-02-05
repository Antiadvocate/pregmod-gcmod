/**
 * Sends a child to the Incubator if it has room
 * @param {FC.SlaveState} child
 * @param {any} settingsOverride // TODO: documentation and type hinting
 */
App.Facilities.Incubator.newChild = function(child, settingsOverride = null) {
	const tank = App.Entity.TankSlaveState.toTank(child, settingsOverride);
	addTankSlave(tank);
};

/**
 * Return the number of tanks with fully-grown slaves, ready for release
 * @returns {number}
 */
App.Facilities.Incubator.readySlaves = function() {
	return getTankSlaves().filter(t => t.incubatorSettings.growTime <= 0).size;
};

/**
 * @param {"decommission"|"install"} state
 */
App.Facilities.Incubator.init = function(state) {
	if (state === 'decommission') {
		// @ts-ignore
		V.incubator = {capacity: 0, tanks: new Map([])};
	} else if (state === 'install') {
		V.incubator = {
			capacity: 1,
			tanks: new Map(),
			bulkRelease: 0,
			name: "the Incubator",
			organs: [],
			upgrades: {
				speed: 5,
				weight: 0,
				muscles: 0,
				growthStims: 0,
				reproduction: 0,
				organs: 0,
				pregAdaptation: 0,
			},
			maleSetting: {
				imprint: "trust",
				targetAge: V.minimumSlaveAge,
				weight: 0,
				muscles: 0,
				growthStims: 0,
				reproduction: 0,
				pregAdaptation: 0,
				pregAdaptationPower: 0,
			},
			femaleSetting: {
				imprint: "trust",
				targetAge: V.minimumSlaveAge,
				weight: 0,
				muscles: 0,
				growthStims: 0,
				reproduction: 0,
				pregAdaptation: 0,
				pregAdaptationPower: 0,
			},
		};
	} else {
		throw new Error(`Unhandled state '${state}' in incubator init`);
	}
};
