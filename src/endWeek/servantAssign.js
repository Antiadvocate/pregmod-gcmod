/**
 * Assigns maids to your slaves and places them appropriately.
 * Assigned servant means:
 * 1. Servant will relieve them sexually if they can.
 * 2. Servant has cleaned their facility.
 * 3. Servant takes care of then, i.e. bathing, moving them around etc.
 */
App.EndWeek.assignServants = function() {
	/** @type {Record<FC.HumanID, FC.HumanID>} slaveId to maidId */
	const slaveToMaidMap = {};
	/** @type {Record<FC.HumanID, FC.HumanID[]>} maidId to slaveIds */
	const maidToSlaveMap = {};
	/** @type {FC.HumanID[]} */
	const servants = [];
	/** @type {FC.HumanID[]} */
	const restingServants = [];
	/** @type {FC.HumanID[]} */
	let slavesToAssign = [];
	let servantCapacityRemaining = 0;
	let restingCapacityRemaining = 0;
	let totalCapacity = 0;

	/** @type {Set<FC.Assignment>} jobs that consitutes a maid */
	const maidAssignments = new Set([Job.QUARTER, Job.HOUSE]);

	// Loop, get counts, and populate arrays for assignments.
	for (const slave of getSlaves().values()) {
		if (maidAssignments.has(slave.assignment)) {
			maidToSlaveMap[slave.ID] = [];
			const capacity = houseServantEffectiveness(slave);
			if (slaveResting(slave)) {
				restingServants.push(slave.ID);
				restingCapacityRemaining += capacity;
			} else {
				servants.push(slave.ID);
				servantCapacityRemaining += capacity;
			}
			totalCapacity += capacity;
		}
		slavesToAssign.push(slave.ID);
	}
	if ((servants.length === 0 && restingServants.length === 0) || slavesToAssign.length === 0) {
		return;
	}

	// Randomize then Round Robin assigns Slaves
	servants.shuffle();
	restingServants.shuffle();
	slavesToAssign.shuffle();
	// Preserve this order
	const allServants = [...servants, ...restingServants];
	// Functions to round robin choose servants
	let servantIndex = 0;
	const getNextServant = () => {
		if (servantIndex >= servants.length) {
			servantIndex = 0;
		}
		servantCapacityRemaining--;
		return servants[servantIndex++];
	};
	let restingServantIndex = 0;
	const getNextRestingServant = () => {
		if (restingServantIndex >= restingServants.length) {
			restingServantIndex = 0;
		}
		restingCapacityRemaining--;
		return restingServants[restingServantIndex++];
	};
	let allServantIndex = 0;
	const getNextAnyServant = () => {
		if (allServantIndex >= allServants.length) {
			allServantIndex = 0;
		}
		return allServants[allServantIndex++];
	};

	/**
	 * Assign servants. This looks a bit complicated but is pretty simple:
	 * 1. Assign to non-resting servants until at capacity.
	 * 2. Assign to resting servants until capacity.
	 * 3. Assign to all servants. The array order makes non-resting servants go first.
	 * Special Case - If assigned to self will try to get a different servant
	 *
	 * This should evenly distribute slaves among all of the maids.
	 */
	for (const slaveID of slavesToAssign) {
		/** @type {FC.HumanID} */
		let selectedServant;
		if (servantCapacityRemaining > 0) {
			selectedServant = getNextServant();
			if (selectedServant === slaveID) {
				if (servants.length > 1) {
					selectedServant = getNextServant();
				} else {
					selectedServant = getNextRestingServant();
				}
			}
		} else if (restingCapacityRemaining > 0) {
			selectedServant = getNextRestingServant();
			if (selectedServant === slaveID) {
				if (restingServants.length > 1) {
					selectedServant = getNextRestingServant();
				} else {
					selectedServant = getNextServant();
				}
			}
		} else if (allServants.length > 0)	{
			selectedServant = getNextAnyServant();
			if (selectedServant === slaveID && allServants.length > 1) {
				selectedServant = getNextAnyServant();
			}
		}
		if (selectedServant) {
			slaveToMaidMap[slaveID] = selectedServant;
			maidToSlaveMap[selectedServant].push(slaveID);
		}
	}

	App.EndWeek.saVars.maidToSlaveAssignments = maidToSlaveMap;
	App.EndWeek.saVars.slaveToMaidAssignments = slaveToMaidMap;
	App.EndWeek.saVars.maidStats = {count: servants.length + restingServants.length, capacity: totalCapacity};
};
