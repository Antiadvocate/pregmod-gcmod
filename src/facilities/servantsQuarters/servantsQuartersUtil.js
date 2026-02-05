/**
 * Checks if a servant can and will provide sexual services to a slave
 * @param {FC.SlaveState} servant
 * @param {FC.SlaveState} slave
 */
App.Facilities.ServantsQuarters.willServiceSlave = function(servant, slave) {
	// Assignments not covered by isSlaveAvailable
	// Don't allow confined slaves since this is a reward.
	const bannedAssignments = [Job.STEWARD, Job.CONFINEMENT, Job.CELLBLOCK];
	return (
		V.servantsQuarters.rules.sexualRelief === 1 && // Allowed
		slave.energy > 20 && slave.devotion > -50 && // Slave has need
		!bannedAssignments.includes(slave.assignment) && // Doesn't have a banned assignment
		isSlaveAvailable(slave) && // Is available
		(slave.rules.release.slaves === 1 || App.Utils.sexAllowed(servant, slave)) && // Sex allowed
		_.isEmpty(App.EndWeek.saVars.subSlaveMap.get(slave.ID)) // Doesn't have a sub slave
	);
};
