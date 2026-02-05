App.Patch.register({
	releaseID: 1288,
	descriptionOfChanges: `Remove variables that were leaking from the ReportSlave proxy`,
	slaveState: (div, actor, location) => {
		deleteProps(actor, 'pornFameBonus', 'paraphiliaSatisfied', 'slaveUsedRest', 'inappropriateLactation', 'fetishChanged');
		return actor;
	},
});
