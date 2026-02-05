/**
 *
 * Updates the history of a slave with last week's data.
 * Uses the coming week's calculated cost for expenses, ignoring minor error
 * Any changes here should be reflected in slaveHistoryGraph.js
 * @param {FC.SlaveState} slave
 */
App.SlaveAssignment.progressHistory = function(slave) {
	/** @type {FC.SlaveHistory} */
	let newHistory = {
		"week": V.week,
		"lastAssignment": slave.assignment, // Assignment does not update until after this function
		"devotion": slave.devotion,
		"trust": slave.trust,
		"health": slave.health.condition,
		"energy": slave.energy,
		"income": slave.lastWeeksCashIncome,
		"expenses": getSlaveCost(slave), // Uses the coming week's calculated cost
		"reputation": slave.lastWeeksRepIncome,
		"reputation_loss": slave.lastWeeksRepExpenses,
		"weight": slave.weight,
		"boobs": slave.boobs,
		"muscles": slave.muscles,
	};

	slave.history.push(newHistory);

	if (slave.history.length > 5) {
		slave.history.shift();
	}
};
