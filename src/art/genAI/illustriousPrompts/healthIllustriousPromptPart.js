App.Art.GenAI.Ill.HealthPromptPart = class HealthPromptPart extends App.Art.GenAI.PromptPart {
	/**
	 * @override
	 */
	positive() {
		if (asSlave(this.slave)?.fuckdoll > 0) {
			return [];
		}

		if (this.slave.health.condition < -50) {
			return [`sick`];
		} else if (this.slave.health.condition < -10) {
			return [`tired`];
		}
		return [];
	}
};
